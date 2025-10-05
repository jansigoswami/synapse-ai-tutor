# Synapse AI Tutor

![Synapse AI Tutor Banner](./synapse/public/images/synapse.png)

## 🚀 Overview

**Synapse AI Tutor** is an interactive, AI-powered coding tutor designed to help users learn programming languages in a personalized and engaging way. Built with Next.js and React, Synapse provides a chat-based interface where users can ask questions, receive code explanations, and practice coding in real time.

---

## ✨ Features

- **Conversational AI Chat**: Ask coding questions and get instant, clear answers.
- **Typing Animation**: Realistic assistant responses with smooth typing effects.
- **Multi-Language Support**: Choose your preferred programming language to learn.
- **Session Customization**: Set your learning duration and hours for a tailored experience.
- **Modern UI**: Clean, responsive, and visually appealing interface.
- **Markdown & Syntax Highlighting**: Code and explanations are beautifully formatted.

---

## 🖥️ Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: Python (FastAPI)
- **Icons**: Lucide React
- **Markdown Rendering**: React Markdown

---

## 📦 Installation

1. **Clone the repository:**
	```bash
	git clone https://github.com/jansigoswami/synapse-ai-tutor.git
	cd synapse-ai-tutor/synapse
	```
2. **Install frontend dependencies:**
	```bash
	npm install
	```
3. **Start the frontend:**
	```bash
	npm run dev
	```
4. **Set up the backend:**
	- Navigate to `synapse/src/backend`
	- Install Python dependencies:
	  ```bash
	  pip install -r requirements.txt
	  ```
	- Start the backend server:
	  ```bash
	  uvicorn main:app --reload --port 8000
	  ```

---

## 🛠️ Project Structure

```
synapse-ai-tutor/
├── synapse/
│   ├── src/
│   │   ├── app/           # Frontend React components
│   │   ├── backend/       # FastAPI backend
│   │   └── public/        # Static assets
│   ├── package.json       # Frontend dependencies
│   └── ...
├── README.md
└── ...
```

---

## 🤖 Usage

- Open the app in your browser at `http://localhost:3000`.
- Start chatting with Synapse to learn and practice coding.
- Make sure the backend server is running at `http://localhost:8000` for full functionality.

---

## 📷 Screenshots

![Chat Interface](./synapse/public/images/main-background.png)

---

## 🙌 Contributing

Contributions are welcome! Please open issues or submit pull requests for improvements, bug fixes, or new features.

---

## 📄 License

This project is licensed under the MIT License.

---

## 💡 Credits

- Developed by [jansigoswami](https://github.com/jansigoswami)
- Powered by Next.js, React, and FastAPI

