import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const conversationSchema = new mongoose.Schema(
  {
    title: { type: String, default: 'New Chat' },
    model: { type: String, default: 'llama3' },
    messages: [messageSchema],
    pinned: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Conversation = mongoose.model('Conversation', conversationSchema);
