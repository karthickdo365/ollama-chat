# 🤖 Ollama Chat — MERN Stack Local AI Chatbot

A full-featured, beautiful AI chat application powered by **Ollama** (local LLMs), built with the **MERN stack** (MongoDB, Express, React, Node.js). Everything runs 100% locally — no API keys, no cloud, no data leaving your machine.

---

## ✨ Features

- 🎨 **Stunning dark UI** — glassmorphism, animated typing, smooth transitions
- 💬 **Streaming responses** — tokens appear in real-time as the model generates
- 📝 **Markdown rendering** — full markdown with syntax-highlighted code blocks
- 💾 **Persistent history** — all chats saved to MongoDB
- 📌 **Pin conversations** — keep important chats at the top
- 🔄 **Model switching** — swap between any Ollama model mid-conversation
- 🗑️ **Clear / delete chats** — manage your history easily
- 📱 **Collapsible sidebar** — more space when you need it
- ⚡ **Quick prompts** — one-click starter suggestions on the welcome screen

---

## 🖥️ System Requirements

| Requirement | Minimum | Recommended (your 16 GB RAM) |
|---|---|---|
| RAM | 8 GB | 16 GB ✅ |
| Node.js | v18+ | v20+ |
| MongoDB | v6+ | v7+ |
| Ollama | latest | latest |

---

## 🚀 Quick Start

### 1. Install prerequisites

**Ollama** (local LLM runner):
```bash
# macOS / Linux
curl -fsSL https://ollama.com/install.sh | sh

# Windows: Download from https://ollama.com/download
```

**MongoDB Community**:
```bash
# macOS (Homebrew)
brew tap mongodb/brew && brew install mongodb-community

# Ubuntu/Debian
sudo apt-get install -y mongodb

# Windows: https://www.mongodb.com/try/download/community
```

### 2. Clone & install
```bash
git clone <your-repo>
cd ollama-chat

# Run the setup script
bash setup.sh
```

Or manually:
```bash
npm install
cd server && npm install && cd ..
cd client && npm install && cd ..
```

### 3. Pull AI models (pick based on your needs)

With **16 GB RAM**, you can comfortably run:

```bash
ollama pull llama3        # 🦙 Best all-around (4.7 GB)
ollama pull mistral       # ⚡ Fast & smart (4.1 GB)
ollama pull codellama     # 💻 Best for coding (3.8 GB)
ollama pull phi3          # 🪶 Lightweight, quick (2.3 GB)
ollama pull llama3:70b    # 🚀 Premium quality (requires ~40 GB RAM — skip)
ollama pull deepseek-coder # 🔬 Deep coding tasks (4.2 GB)

# List what you have
ollama list
```

### 4. Start everything

**Terminal 1 — MongoDB:**
```bash
# macOS/Linux
mongod --dbpath ~/data/db

# If installed as a service
brew services start mongodb-community  # macOS
sudo systemctl start mongod            # Linux
```

**Terminal 2 — Ollama:**
```bash
ollama serve
```

**Terminal 3 — App:**
```bash
npm run dev
```

Open **http://localhost:3000** 🎉

---

## 📁 Project Structure

```
ollama-chat/
├── package.json            # Root (concurrently runs both)
├── setup.sh                # One-click setup script
│
├── server/                 # Express + Node.js backend
│   ├── index.js            # Main server, all API routes
│   ├── models.js           # Mongoose schemas
│   ├── package.json
│   └── .env                # Config (port, MongoDB URI, Ollama URL)
│
└── client/                 # React frontend
    ├── index.html
    ├── vite.config.js       # Vite + proxy to backend
    ├── tailwind.config.js
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── index.css        # Global styles + CSS variables
        ├── context/
        │   └── ChatContext.jsx   # All state & API calls
        ├── components/
        │   ├── Sidebar.jsx       # Conversation list, model selector
        │   ├── ChatArea.jsx      # Message list + welcome screen
        │   ├── Message.jsx       # Individual message with markdown
        │   └── ChatInput.jsx     # Textarea + send button
        └── utils/
            └── api.js            # Fetch wrappers for backend
```

---

## 🔌 API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/models` | List available Ollama models |
| GET | `/api/conversations` | List all conversations |
| POST | `/api/conversations` | Create new conversation |
| GET | `/api/conversations/:id` | Get conversation with messages |
| PATCH | `/api/conversations/:id` | Update title or pin status |
| DELETE | `/api/conversations/:id` | Delete conversation |
| POST | `/api/conversations/:id/chat` | Send message (SSE streaming) |
| DELETE | `/api/conversations/:id/messages` | Clear all messages |

---

## ⚙️ Configuration

Edit `server/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ollama-chat
OLLAMA_BASE_URL=http://localhost:11434
```

To use **MongoDB Atlas** (cloud):
```env
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/ollama-chat
```

---

## 🎨 Customising the UI

All colours are CSS variables in `client/src/index.css`:

```css
:root {
  --bg: #0a0a0f;           /* Page background */
  --surface: #111118;      /* Sidebar, topbar */
  --accent: #7c6fff;       /* Purple accent */
  --accent2: #ff6fb0;      /* Pink gradient end */
  --text: #e8e8f0;         /* Main text */
  --muted: #6b6b8a;        /* Secondary text */
}
```

---

## 🛠️ Troubleshooting

**"Could not reach Ollama"**
- Make sure `ollama serve` is running
- Check it's on port 11434: `curl http://localhost:11434/api/tags`

**"MongoDB connection failed"**
- Make sure `mongod` is running
- Check the URI in `server/.env`

**Model not appearing in dropdown**
- Run `ollama list` to verify it's downloaded
- Refresh the page — models are fetched on load

**Slow responses**
- Use a smaller model: `phi3` or `mistral`
- Close other heavy applications to free RAM

---

## 🚢 Production Build

```bash
# Build React frontend
npm run build

# The Express server can serve the built files
# Add this to server/index.js:
# import { fileURLToPath } from 'url';
# import path from 'path';
# const __dirname = path.dirname(fileURLToPath(import.meta.url));
# app.use(express.static(path.join(__dirname, '../client/dist')));

# Then just run:
node server/index.js
```

---

## 📄 License

MIT — do whatever you like with it.
