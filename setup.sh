#!/bin/bash
set -e

echo ""
echo "╔═══════════════════════════════════════╗"
echo "║       Ollama Chat — Setup Script      ║"
echo "╚═══════════════════════════════════════╝"
echo ""

# ── Check Node ──────────────────────────────
if ! command -v node &>/dev/null; then
  echo "❌  Node.js is not installed. Download from https://nodejs.org"
  exit 1
fi
echo "✅  Node.js $(node -v)"

# ── Check MongoDB ────────────────────────────
if ! command -v mongod &>/dev/null; then
  echo "⚠️   MongoDB not found in PATH."
  echo "    Install: https://www.mongodb.com/try/download/community"
  echo "    Or use MongoDB Atlas (free cloud) and update server/.env"
else
  echo "✅  MongoDB found"
fi

# ── Check Ollama ─────────────────────────────
if ! command -v ollama &>/dev/null; then
  echo "⚠️   Ollama not found."
  echo "    Install: https://ollama.com/download"
else
  echo "✅  Ollama found"
fi

echo ""
echo "📦  Installing dependencies..."
npm install
cd server && npm install && cd ..
cd client && npm install && cd ..

echo ""
echo "═══════════════════════════════════════"
echo "✅  All dependencies installed!"
echo ""
echo "📋  Next steps:"
echo ""
echo "  1. Start MongoDB:"
echo "     mongod --dbpath ~/data/db"
echo ""
echo "  2. Start Ollama + pull a model:"
echo "     ollama serve"
echo "     ollama pull llama3          (4 GB, great for 16 GB RAM)"
echo "     ollama pull mistral         (4 GB, fast & smart)"
echo "     ollama pull codellama       (4 GB, for coding)"
echo "     ollama pull phi3            (2 GB, lightweight)"
echo ""
echo "  3. Start the app:"
echo "     npm run dev"
echo ""
echo "  4. Open http://localhost:3000"
echo ""
echo "═══════════════════════════════════════"
