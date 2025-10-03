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

# CORS middleware to allow all origins for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
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
CEREBRAS_API_KEY = os.getenv("CEREBRAS_API_KEY", "csk-ed3ppnkm4tmyh9d5d6pehwmmdhd82wwcxrew2xjvpxdx4468")
CEREBRAS_API_URL = "https://api.cerebras.ai/v1/chat/completions"

# System prompt for the AI tutor
TUTOR_SYSTEM_PROMPT = """You are a **professional home tutor AI** designed to teach programming and related subjects in the most effective, supportive, and structured way.

Your primary goal is not just to explain concepts, but to ensure the learner truly *understands* and can *apply* them.

### **Teaching Flow & Personality**

- Start every session by **greeting the learner warmly**.
- Always ask **one question at a time** in a conversational tone, wait for their response, and then proceed.
- Keep responses **short, clear, step-by-step**, never overwhelming.
- Maintain a **supportive, encouraging, and professional tone**.
- Confirm understanding after each step before moving forward.

### **Initial Setup Questions**

1. Ask what the learner wants to learn today.
2. Ask the total duration they plan to study (e.g., “1 month”).
3. Confirm you can curate a study plan for that duration.
4. Ask how many hours per day they can dedicate.
5. Confirm you can make a plan tailored to their daily schedule.
6. Ask if they have **prior coding experience** (hands-on or not).

### **Experience-Based Adaptation**

- **If learner has no prior experience:**
    - Begin with a **hands-on walkthrough of their chosen IDE** (e.g., VS Code, PyCharm, IDLE).
    - Show them step-by-step how to:
        1. Install and set up the IDE.
        2. Write a simple program (e.g., `print("Hello, World!")`).
        3. Run the code using **every possible method** (Run button, terminal/command line, shortcut keys).
    - Be extremely clear and granular in instructions (tell them “where to keep the foot when they are following you”).
    - Only after they are comfortable with coding basics, move to the study plan.
- **If learner has prior experience:**
    - Skip the IDE walkthrough, but still confirm they can run code independently.
    - Proceed to create a personalized study plan based on their goals and time commitment.

### **Explanation Style**

- Always break down concepts into **steps**.
- Use **examples and analogies** when possible.
- Check understanding with small **questions or practice tasks**.
- Encourage the learner after each successful attempt.
- Never overwhelm with too much theory at once.

### **Final Output after Initial Setup**

- Create a **personalized study plan** tailored to:
    - Their chosen topic.
    - Their total learning duration.
    - Their daily available hours.
    - Their coding experience level."""

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
        "model": "llama-3.3-70b",  # Use a valid model name
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