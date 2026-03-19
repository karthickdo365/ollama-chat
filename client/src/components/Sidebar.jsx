import { useEffect, useState } from 'react';
import { useChat } from '../context/ChatContext.jsx';
import {
  MessageSquare, Plus, Trash2, Pin, PinOff,
  ChevronLeft, ChevronRight, Bot, Sparkles
} from 'lucide-react';

function timeAgo(dateStr) {
  const now = Date.now();
  const d = new Date(dateStr).getTime();
  const diff = now - d;
  if (diff < 60000) return 'just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

export default function Sidebar() {
  const {
    conversations, activeId, loading,
    loadConversations, openConversation, newConversation,
    deleteConversation, pinConversation, models, selectedModel, setSelectedModel
  } = useChat();

  const [collapsed, setCollapsed] = useState(false);
  const [hoveredId, setHoveredId] = useState(null);

  useEffect(() => { loadConversations(); }, []);

  const pinned = conversations.filter((c) => c.pinned);
  const recent = conversations.filter((c) => !c.pinned);

  if (collapsed) {
    return (
      <aside style={{ width: 60, background: 'var(--surface)', borderRight: '1px solid var(--border)' }}
        className="flex flex-col items-center py-4 gap-4 h-full">
        <button onClick={() => setCollapsed(false)}
          className="p-2 rounded-lg hover:bg-white/5 text-[var(--muted)] hover:text-[var(--text)] transition-colors">
          <ChevronRight size={18} />
        </button>
        <button onClick={newConversation}
          className="p-2 rounded-lg accent-gradient text-white shadow-lg">
          <Plus size={18} />
        </button>
        {conversations.slice(0, 8).map((c) => (
          <button key={c._id} onClick={() => openConversation(c._id)}
            title={c.title}
            className={`p-2 rounded-lg transition-colors ${activeId === c._id ? 'bg-[var(--accent)]/20 text-[var(--accent)]' : 'hover:bg-white/5 text-[var(--muted)]'}`}>
            <MessageSquare size={15} />
          </button>
        ))}
      </aside>
    );
  }

  return (
    <aside style={{ width: 280, background: 'var(--surface)', borderRight: '1px solid var(--border)' }}
      className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg accent-gradient flex items-center justify-center">
            <Bot size={16} className="text-white" />
          </div>
          <div>
            <p className="font-semibold text-sm" style={{ color: 'var(--text)' }}>karthick ollama chat</p>
            <p className="text-xs" style={{ color: 'var(--muted)' }}>Local AI</p>
          </div>
        </div>
        <button onClick={() => setCollapsed(true)}
          className="p-1.5 rounded-md hover:bg-white/5 transition-colors" style={{ color: 'var(--muted)' }}>
          <ChevronLeft size={16} />
        </button>
      </div>

      {/* Model selector */}
      <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
        <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--muted)' }}>MODEL</label>
        <select value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)}
          className="w-full text-sm px-3 py-2 rounded-lg border outline-none cursor-pointer"
          style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)' }}>
          {models.length === 0 ? (
            <option value={selectedModel}>{selectedModel}</option>
          ) : (
            models.map((m) => <option key={m} value={m}>{m}</option>)
          )}
        </select>
      </div>

      {/* New Chat button */}
      <div className="p-4">
        <button onClick={newConversation}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium text-sm text-white transition-all hover:opacity-90 active:scale-95 accent-gradient shadow-lg">
          <Plus size={16} />
          New Conversation
        </button>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto px-2 pb-4">
        {pinned.length > 0 && (
          <>
            <p className="px-2 py-1 text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
              Pinned
            </p>
            {pinned.map((c) => (
              <ConvoItem key={c._id} c={c} activeId={activeId} hoveredId={hoveredId}
                setHoveredId={setHoveredId} openConversation={openConversation}
                pinConversation={pinConversation} deleteConversation={deleteConversation} />
            ))}
          </>
        )}
        {recent.length > 0 && (
          <>
            <p className="px-2 py-1 mt-2 text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
              Recent
            </p>
            {recent.map((c) => (
              <ConvoItem key={c._id} c={c} activeId={activeId} hoveredId={hoveredId}
                setHoveredId={setHoveredId} openConversation={openConversation}
                pinConversation={pinConversation} deleteConversation={deleteConversation} />
            ))}
          </>
        )}
        {conversations.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-12 px-4 text-center">
            <Sparkles size={32} style={{ color: 'var(--accent)', opacity: 0.5 }} />
            <p className="text-sm" style={{ color: 'var(--muted)' }}>No conversations yet.<br />Start a new chat!</p>
          </div>
        )}
      </div>
    </aside>
  );
}

function ConvoItem({ c, activeId, hoveredId, setHoveredId, openConversation, pinConversation, deleteConversation }) {
  const isActive = activeId === c._id;
  const isHovered = hoveredId === c._id;

  return (
    <div
      onMouseEnter={() => setHoveredId(c._id)}
      onMouseLeave={() => setHoveredId(null)}
      onClick={() => openConversation(c._id)}
      className="relative flex items-center gap-2 px-3 py-2.5 rounded-xl mb-0.5 cursor-pointer transition-all group"
      style={{
        background: isActive ? 'rgba(124,111,255,0.12)' : isHovered ? 'rgba(255,255,255,0.04)' : 'transparent',
        border: isActive ? '1px solid rgba(124,111,255,0.25)' : '1px solid transparent',
      }}>
      <MessageSquare size={14} style={{ color: isActive ? 'var(--accent)' : 'var(--muted)', flexShrink: 0 }} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate" style={{ color: isActive ? 'var(--text)' : 'var(--text)', opacity: isActive ? 1 : 0.8 }}>
          {c.title}
        </p>
        <p className="text-xs" style={{ color: 'var(--muted)' }}>
          {c.model} · {timeAgo(c.updatedAt)}
        </p>
      </div>
      {isHovered && (
        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
          <button onClick={() => pinConversation(c._id, !c.pinned)}
            className="p-1 rounded hover:bg-white/10 transition-colors"
            style={{ color: 'var(--muted)' }} title={c.pinned ? 'Unpin' : 'Pin'}>
            {c.pinned ? <PinOff size={12} /> : <Pin size={12} />}
          </button>
          <button onClick={() => deleteConversation(c._id)}
            className="p-1 rounded hover:bg-red-500/20 transition-colors"
            style={{ color: 'var(--muted)' }} title="Delete">
            <Trash2 size={12} />
          </button>
        </div>
      )}
    </div>
  );
}
