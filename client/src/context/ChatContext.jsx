import { createContext, useContext, useState, useCallback } from 'react';
import * as api from '../utils/api.js';

const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState('llama3');
  const [streaming, setStreaming] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadConversations = useCallback(async () => {
    const data = await api.getConversations();
    setConversations(data.conversations || []);
  }, []);

  const loadModels = useCallback(async () => {
    try {
      const data = await api.getModels();
      const names = (data.models || []).map((m) => m.name);
      setModels(names);
      if (names.length > 0) setSelectedModel(names[0]);
    } catch (_) {}
  }, []);

  const openConversation = useCallback(async (id) => {
    setLoading(true);
    setActiveId(id);
    const data = await api.getConversation(id);
    setMessages(data.conversation?.messages || []);
    setSelectedModel(data.conversation?.model || 'llama3');
    setLoading(false);
  }, []);

  const newConversation = useCallback(async () => {
    const data = await api.createConversation(selectedModel);
    const convo = data.conversation;
    setConversations((prev) => [convo, ...prev]);
    setActiveId(convo._id);
    setMessages([]);
    return convo._id;
  }, [selectedModel]);

  const deleteConversation = useCallback(async (id) => {
    await api.deleteConversation(id);
    setConversations((prev) => prev.filter((c) => c._id !== id));
    if (activeId === id) {
      setActiveId(null);
      setMessages([]);
    }
  }, [activeId]);

  const pinConversation = useCallback(async (id, pinned) => {
    await api.updateConversation(id, { pinned });
    setConversations((prev) =>
      prev.map((c) => (c._id === id ? { ...c, pinned } : c))
    );
  }, []);

  const sendMessage = useCallback(async (content) => {
    if (streaming || !content.trim()) return;

    let convId = activeId;
    if (!convId) {
      convId = await newConversation();
    }

    const userMsg = { role: 'user', content, timestamp: new Date().toISOString() };
    setMessages((prev) => [...prev, userMsg]);
    setStreaming(true);

    const assistantMsg = { role: 'assistant', content: '', timestamp: new Date().toISOString() };
    setMessages((prev) => [...prev, assistantMsg]);

    try {
      const response = await api.sendMessage(convId, content, selectedModel);
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter((l) => l.startsWith('data: '));
        for (const line of lines) {
          try {
            const parsed = JSON.parse(line.slice(6));
            if (parsed.token) {
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  ...updated[updated.length - 1],
                  content: updated[updated.length - 1].content + parsed.token,
                };
                return updated;
              });
            }
            if (parsed.done) {
              await loadConversations();
            }
          } catch (_) {}
        }
      }
    } finally {
      setStreaming(false);
    }
  }, [activeId, streaming, selectedModel, newConversation, loadConversations]);

  const clearChat = useCallback(async () => {
    if (!activeId) return;
    await api.clearMessages(activeId);
    setMessages([]);
  }, [activeId]);

  return (
    <ChatContext.Provider value={{
      conversations, messages, models, selectedModel, setSelectedModel,
      activeId, streaming, loading,
      loadConversations, loadModels,
      openConversation, newConversation, deleteConversation, pinConversation,
      sendMessage, clearChat,
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export const useChat = () => useContext(ChatContext);
