from fastapi import FastAPI, Request
import uvicorn
import httpx
from pydantic import BaseModel
from dotenv import load_dotenv
import os

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import httpx
import json
import os
from datetime import datetime

app = FastAPI(title="Synapse AI Tutor Backend")

# CORS middleware to allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # React default ports
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[Message]
    user_id: str

class ChatResponse(BaseModel):
    response: str
    timestamp: str

# In-memory storage for user context (replace with DB in production)
user_memory = {}

# Cerebras API configuration
CEREBRAS_API_KEY = os.getenv("CEREBRAS_API_KEY", "your-cerebras-api-key-here")
CEREBRAS_API_URL = "https://api.cerebras.ai/v1/chat/completions"

# System prompt for the AI tutor
TUTOR_SYSTEM_PROMPT = """You are Synapse, an expert coding tutor with a warm, encouraging personality. Your teaching philosophy:

🎯 TEACHING PRINCIPLES:
1. SOCRATIC METHOD - Never give direct answers. Guide with questions that lead to discovery.
2. SCAFFOLDING - Break complex problems into bite-sized steps.
3. ACTIVE LEARNING - Ask students to explain concepts back to you.
4. ERROR AS OPPORTUNITY - When mistakes happen, explore WHY, not just WHAT.
5. CELEBRATE PROGRESS - Acknowledge every small win genuinely.

📚 TEACHING STRATEGIES:
- Start with examples before theory
- Use analogies to relate new concepts to familiar ideas
- Check understanding with quick questions
- If student is stuck, provide a tiny hint, not the solution
- Adjust difficulty based on their responses
- Use code snippets to illustrate concepts
- Encourage experimentation

💬 COMMUNICATION STYLE:
- Friendly and approachable, like a patient mentor
- Use emojis occasionally to keep it engaging
- Ask one question at a time to avoid overwhelming
- When they succeed, show genuine excitement
- If frustrated, simplify and backtrack

🚫 WHAT NOT TO DO:
- Don't write entire solutions unless explicitly for demonstration
- Don't move too fast - let them digest one concept before the next
- Don't be condescending or use overly complex jargon
- Don't ignore their specific questions

Remember: Your goal is to make them THINK, not just copy code. Build their confidence and problem-solving skills."""

async def call_cerebras_api(messages: List[dict], user_context: dict = None) -> str:
    """Call Cerebras API with conversation history"""
    
    # Add system prompt
    system_message = {
        "role": "system",
        "content": TUTOR_SYSTEM_PROMPT
    }
    
    # Add user context if available
    if user_context:
        context_info = f"\n\n📊 Student Context:\n"
        if user_context.get("topics_learned"):
            context_info += f"- Topics covered: {', '.join(user_context['topics_learned'])}\n"
        if user_context.get("struggling_with"):
            context_info += f"- Currently struggling with: {user_context['struggling_with']}\n"
        if user_context.get("last_session"):
            context_info += f"- Last session: {user_context['last_session']}\n"
        
        system_message["content"] += context_info
    
    # Prepare messages for API
    api_messages = [system_message] + messages
    
    headers = {
        "Authorization": f"Bearer {CEREBRAS_API_KEY}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "model": "llama3.1-8b",  # Adjust based on available models
        "messages": api_messages,
        "temperature": 0.7,
        "max_tokens": 1000,
        "top_p": 0.9
    }
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                CEREBRAS_API_URL,
                headers=headers,
                json=payload
            )
            response.raise_for_status()
            
            result = response.json()
            return result["choices"][0]["message"]["content"]
            
    except httpx.HTTPStatusError as e:
        print(f"HTTP Error: {e.response.status_code} - {e.response.text}")
        raise HTTPException(
            status_code=e.response.status_code,
            detail=f"Cerebras API error: {e.response.text}"
        )
    except Exception as e:
        print(f"Error calling Cerebras API: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get response from AI: {str(e)}"
        )

def update_user_memory(user_id: str, messages: List[Message]):
    """Update user's learning context"""
    if user_id not in user_memory:
        user_memory[user_id] = {
            "topics_learned": [],
            "struggling_with": None,
            "last_session": None,
            "total_messages": 0
        }
    
    user_memory[user_id]["total_messages"] += 1
    user_memory[user_id]["last_session"] = datetime.now().strftime("%Y-%m-%d %H:%M")
    
    # Simple topic extraction (can be enhanced with NLP)
    last_user_msg = next((m.content for m in reversed(messages) if m.role == "user"), "")
    if any(keyword in last_user_msg.lower() for keyword in ["loop", "for", "while"]):
        if "loops" not in user_memory[user_id]["topics_learned"]:
            user_memory[user_id]["topics_learned"].append("loops")
    if any(keyword in last_user_msg.lower() for keyword in ["function", "def", "return"]):
        if "functions" not in user_memory[user_id]["topics_learned"]:
            user_memory[user_id]["topics_learned"].append("functions")
    if any(keyword in last_user_msg.lower() for keyword in ["class", "object", "oop"]):
        if "OOP" not in user_memory[user_id]["topics_learned"]:
            user_memory[user_id]["topics_learned"].append("OOP")

@app.get("/")
async def root():
    return {
        "message": "Synapse AI Tutor Backend",
        "status": "running",
        "endpoints": {
            "chat": "/api/chat",
            "health": "/health"
        }
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "cerebras_api_configured": bool(CEREBRAS_API_KEY and CEREBRAS_API_KEY != "your-cerebras-api-key-here")
    }

@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Main chat endpoint that handles conversation with Cerebras API"""
    
    try:
        # Get user context
        user_context = user_memory.get(request.user_id, None)
        
        # Convert Pydantic models to dicts for API
        messages_dict = [{"role": m.role, "content": m.content} for m in request.messages]
        
        # Call Cerebras API
        ai_response = await call_cerebras_api(messages_dict, user_context)
        
        # Update user memory
        update_user_memory(request.user_id, request.messages)
        
        return ChatResponse(
            response=ai_response,
            timestamp=datetime.now().isoformat()
        )
        
    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/user/{user_id}/context")
async def get_user_context(user_id: str):
    """Get user's learning context"""
    return user_memory.get(user_id, {
        "message": "No learning history found for this user"
    })

if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting Synapse AI Tutor Backend...")
    print("📝 Make sure to set CEREBRAS_API_KEY environment variable")
    print("🌐 Server will run on http://localhost:8000")
    uvicorn.run(app, host="0.0.0.0", port=8000)