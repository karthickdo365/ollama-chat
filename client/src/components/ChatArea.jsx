import { useEffect, useRef } from 'react';
import { useChat } from '../context/ChatContext.jsx';
import Message from './Message.jsx';
import ChatInput from './ChatInput.jsx';
import { Bot, Trash2, Zap, Code2, BookOpen, Lightbulb } from 'lucide-react';

const SUGGESTIONS = [
  { icon: Code2, label: 'Write code', prompt: 'Write a Python function to sort a list of dictionaries by a specific key.' },
  { icon: BookOpen, label: 'Explain concept', prompt: 'Explain how transformers work in machine learning, with analogies.' },
  { icon: Lightbulb, label: 'Brainstorm', prompt: 'Give me 10 creative startup ideas for the AI age.' },
  { icon: Zap, label: 'Debug help', prompt: 'Help me debug this React useEffect that runs infinitely.' },
];

export default function ChatArea() {
  const { messages, streaming, loading, activeId, clearChat, selectedModel, sendMessage } = useChat();
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--bg)' }}>
      {/* Topbar */}
      <div className="flex items-center justify-between px-6 py-4"
        style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-green-400" style={{ boxShadow: '0 0 6px #4ade80' }} />
          <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>
            {selectedModel}
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(124,111,255,0.12)', color: 'var(--accent)', border: '1px solid rgba(124,111,255,0.2)' }}>
            local
          </span>
        </div>
        {activeId && messages.length > 0 && (
          <button onClick={clearChat}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg hover:bg-red-500/10 hover:text-red-400 transition-colors"
            style={{ color: 'var(--muted)' }}>
            <Trash2 size={13} />
            Clear
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {loading ? (
          <div className="flex flex-col gap-4 max-w-3xl mx-auto">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3 items-start">
                <div className="w-8 h-8 rounded-xl shimmer" />
                <div className="flex-1 flex flex-col gap-2">
                  <div className="h-4 rounded shimmer w-3/4" />
                  <div className="h-4 rounded shimmer w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <WelcomeScreen onSend={sendMessage} model={selectedModel} />
        ) : (
          <div className="flex flex-col gap-6 max-w-3xl mx-auto">
            {messages.map((msg, i) => (
              <Message key={i} msg={msg} isLast={i === messages.length - 1} streaming={streaming} />
            ))}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <ChatInput />
    </div>
  );
}

function WelcomeScreen({ onSend, model }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-8 max-w-2xl mx-auto text-center px-4">
      <div>
        <div className="w-16 h-16 rounded-2xl accent-gradient flex items-center justify-center mx-auto mb-4 shadow-lg"
          style={{ boxShadow: '0 0 40px rgba(124,111,255,0.3)' }}>
          <Bot size={32} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text)' }}>
          Chat with <span style={{ background: 'linear-gradient(135deg, #7c6fff, #ff6fb0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{model}</span>
        </h1>
        <p className="text-sm" style={{ color: 'var(--muted)' }}>
          Powered by Ollama · 100% local · No data leaves your machine
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 w-full">
        {SUGGESTIONS.map(({ icon: Icon, label, prompt }) => (
          <button key={label} onClick={() => onSend(prompt)}
            className="flex items-start gap-3 p-4 rounded-xl text-left transition-all hover:scale-[1.02] active:scale-[0.98] group"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(124,111,255,0.4)';
              e.currentTarget.style.background = 'var(--surface2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.background = 'var(--surface)';
            }}>
            <div className="p-1.5 rounded-lg mt-0.5"
              style={{ background: 'rgba(124,111,255,0.1)', color: 'var(--accent)', flexShrink: 0 }}>
              <Icon size={14} />
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{label}</p>
              <p className="text-xs mt-0.5 line-clamp-2" style={{ color: 'var(--muted)' }}>{prompt}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
