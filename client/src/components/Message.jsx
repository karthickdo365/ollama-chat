import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check, Bot, User } from 'lucide-react';
import { useState } from 'react';

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }}
      className="flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors"
      style={{ color: copied ? '#7c6fff' : 'var(--muted)' }}>
      {copied ? <Check size={11} /> : <Copy size={11} />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

function CodeBlock({ children, className }) {
  const language = className?.replace('language-', '') || 'text';
  const code = String(children).replace(/\n$/, '');
  return (
    <div className="rounded-xl overflow-hidden my-3" style={{ border: '1px solid var(--border)' }}>
      <div className="flex items-center justify-between px-4 py-2"
        style={{ background: '#1a1a2e', borderBottom: '1px solid var(--border)' }}>
        <span className="text-xs font-mono" style={{ color: 'var(--muted)' }}>{language}</span>
        <CopyButton text={code} />
      </div>
      <SyntaxHighlighter
        language={language}
        style={oneDark}
        customStyle={{ margin: 0, padding: '1rem', background: '#0d0d1a', fontSize: '0.825rem', lineHeight: 1.6 }}
        showLineNumbers={code.split('\n').length > 5}>
        {code}
      </SyntaxHighlighter>
    </div>
  );
}

export default function Message({ msg, isLast, streaming }) {
  const isUser = msg.role === 'user';
  const isEmpty = !msg.content;

  return (
    <div className={`flex gap-4 fade-up px-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
      style={{ animationDelay: '0ms' }}>
      {/* Avatar */}
      <div className="flex-shrink-0 mt-1">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{
            background: isUser
              ? 'linear-gradient(135deg, #7c6fff, #ff6fb0)'
              : 'var(--surface2)',
            border: '1px solid var(--border)',
          }}>
          {isUser
            ? <User size={14} className="text-white" />
            : <Bot size={14} style={{ color: 'var(--accent)' }} />
          }
        </div>
      </div>

      {/* Bubble */}
      <div className={`max-w-[75%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        <div className="rounded-2xl px-4 py-3"
          style={{
            background: isUser ? 'var(--user-bubble)' : 'var(--ai-bubble)',
            border: `1px solid ${isUser ? 'rgba(124,111,255,0.2)' : 'var(--border)'}`,
            borderTopRightRadius: isUser ? 4 : undefined,
            borderTopLeftRadius: !isUser ? 4 : undefined,
          }}>
          {isEmpty && isLast && streaming ? (
            <div className="flex items-center gap-1.5 py-1">
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
            </div>
          ) : (
            <div className="prose-chat">
              {isUser ? (
                <p style={{ color: 'var(--text)', whiteSpace: 'pre-wrap' }}>{msg.content}</p>
              ) : (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code({ inline, className, children }) {
                      return inline
                        ? <code className={className}>{children}</code>
                        : <CodeBlock className={className}>{children}</CodeBlock>;
                    }
                  }}>
                  {msg.content}
                </ReactMarkdown>
              )}
              {isLast && streaming && !isUser && msg.content && (
                <span className="inline-block w-0.5 h-4 ml-0.5 align-middle"
                  style={{ background: 'var(--accent)', animation: 'typing 0.8s infinite' }} />
              )}
            </div>
          )}
        </div>
        <span className="text-xs px-1" style={{ color: 'var(--muted)' }}>
          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
}
