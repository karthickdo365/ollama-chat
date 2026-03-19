import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Conversation } from './models.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('MongoDB error:', err));

const OLLAMA_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';

// ─── Ollama helpers ───────────────────────────────────────────────────────────

async function getOllamaModels() {
  const res = await fetch(`${OLLAMA_URL}/api/tags`);
  if (!res.ok) throw new Error('Ollama not reachable');
  const data = await res.json();
  return data.models || [];
}

// ─── Routes ──────────────────────────────────────────────────────────────────

// GET /api/models — list available Ollama models
app.get('/api/models', async (req, res) => {
  try {
    const models = await getOllamaModels();
    res.json({ models });
  } catch (err) {
    res.status(500).json({ error: 'Could not reach Ollama. Make sure it is running.' });
  }
});

// GET /api/conversations — list all conversations
app.get('/api/conversations', async (req, res) => {
  try {
    const conversations = await Conversation.find(
      {},
      { title: 1, model: 1, pinned: 1, updatedAt: 1, 'messages': { $slice: -1 } }
    ).sort({ pinned: -1, updatedAt: -1 });
    res.json({ conversations });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/conversations — create new conversation
app.post('/api/conversations', async (req, res) => {
  try {
    const { model = 'llama3' } = req.body;
    const convo = await Conversation.create({ model });
    res.status(201).json({ conversation: convo });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/conversations/:id — get a single conversation with all messages
app.get('/api/conversations/:id', async (req, res) => {
  try {
    const convo = await Conversation.findById(req.params.id);
    if (!convo) return res.status(404).json({ error: 'Not found' });
    res.json({ conversation: convo });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/conversations/:id
app.delete('/api/conversations/:id', async (req, res) => {
  try {
    await Conversation.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/conversations/:id — update title / pin
app.patch('/api/conversations/:id', async (req, res) => {
  try {
    const { title, pinned } = req.body;
    const update = {};
    if (title !== undefined) update.title = title;
    if (pinned !== undefined) update.pinned = pinned;
    const convo = await Conversation.findByIdAndUpdate(req.params.id, update, { new: true });
    res.json({ conversation: convo });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/conversations/:id/chat — send a message (streaming SSE)
app.post('/api/conversations/:id/chat', async (req, res) => {
  try {
    const { content, model } = req.body;
    if (!content) return res.status(400).json({ error: 'content is required' });

    const convo = await Conversation.findById(req.params.id);
    if (!convo) return res.status(404).json({ error: 'Conversation not found' });

    // Save user message
    convo.messages.push({ role: 'user', content });

    // Auto-title after first message
    if (convo.messages.length === 1 && convo.title === 'New Chat') {
      convo.title = content.slice(0, 50) + (content.length > 50 ? '…' : '');
    }

    const usedModel = model || convo.model;
    convo.model = usedModel;

    // Build message history for Ollama
    const ollamaMessages = convo.messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    // SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Call Ollama streaming
    const ollamaRes = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: usedModel,
        messages: ollamaMessages,
        stream: true,
      }),
    });

    if (!ollamaRes.ok) {
      res.write(`data: ${JSON.stringify({ error: 'Ollama error' })}\n\n`);
      res.end();
      return;
    }

    let assistantContent = '';
    const reader = ollamaRes.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(Boolean);
      for (const line of lines) {
        try {
          const parsed = JSON.parse(line);
          if (parsed.message?.content) {
            assistantContent += parsed.message.content;
            res.write(`data: ${JSON.stringify({ token: parsed.message.content })}\n\n`);
          }
          if (parsed.done) {
            // Save assistant message to DB
            convo.messages.push({ role: 'assistant', content: assistantContent });
            await convo.save();
            res.write(`data: ${JSON.stringify({ done: true, conversationId: convo._id })}\n\n`);
          }
        } catch (_) {}
      }
    }

    res.end();
  } catch (err) {
    console.error(err);
    res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
    res.end();
  }
});

// DELETE /api/conversations/:id/messages — clear messages
app.delete('/api/conversations/:id/messages', async (req, res) => {
  try {
    const convo = await Conversation.findByIdAndUpdate(
      req.params.id,
      { messages: [], title: 'New Chat' },
      { new: true }
    );
    res.json({ conversation: convo });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
