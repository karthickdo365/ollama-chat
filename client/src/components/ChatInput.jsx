import { useState, useRef, useEffect } from 'react';
import { Send, Square, Paperclip } from 'lucide-react';
import { useChat } from '../context/ChatContext.jsx';

export default function ChatInput() {
  const { sendMessage, streaming } = useChat();
  const [value, setValue] = useState('');
  const textareaRef = useRef(null);

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 180) + 'px';
  }, [value]);

  const handleSend = () => {
    if (!value.trim() || streaming) return;
    sendMessage(value.trim());
    setValue('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-4" style={{ borderTop: '1px solid var(--border)' }}>
      <div className="max-w-3xl mx-auto">
        <div className="relative rounded-2xl overflow-hidden"
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            boxShadow: '0 0 0 0 transparent',
            transition: 'box-shadow 0.2s',
          }}
          onFocusCapture={(e) => {
            e.currentTarget.style.boxShadow = '0 0 0 2px rgba(124,111,255,0.3)';
            e.currentTarget.style.borderColor = 'rgba(124,111,255,0.5)';
          }}
          onBlurCapture={(e) => {
            e.currentTarget.style.boxShadow = '0 0 0 0 transparent';
            e.currentTarget.style.borderColor = 'var(--border)';
          }}>
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Message Ollama... (Shift+Enter for new line)"
            rows={1}
            className="w-full resize-none outline-none bg-transparent px-4 pt-3.5 pb-3 pr-24 text-sm leading-relaxed"
            style={{ color: 'var(--text)', maxHeight: 180 }}
            disabled={streaming}
          />

          {/* Actions */}
          <div className="absolute right-2 bottom-2 flex items-center gap-1.5">
            <button className="p-2 rounded-lg hover:bg-white/5 transition-colors"
              style={{ color: 'var(--muted)' }} title="Attach file (coming soon)">
              <Paperclip size={16} />
            </button>
            <button
              onClick={handleSend}
              disabled={!value.trim() && !streaming}
              className="p-2 rounded-xl transition-all"
              style={{
                background: value.trim() || streaming ? 'linear-gradient(135deg, #7c6fff, #ff6fb0)' : 'var(--surface2)',
                color: value.trim() || streaming ? 'white' : 'var(--muted)',
                opacity: !value.trim() && !streaming ? 0.5 : 1,
              }}>
              {streaming ? <Square size={15} fill="currentColor" /> : <Send size={15} />}
            </button>
          </div>
        </div>

        <p className="text-center text-xs mt-2" style={{ color: 'var(--muted)' }}>
          Running locally via Ollama · Your data stays private
        </p>
      </div>
    </div>
  );
}
