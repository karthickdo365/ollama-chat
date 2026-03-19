import { useEffect } from 'react';
import { ChatProvider, useChat } from './context/ChatContext.jsx';
import Sidebar from './components/Sidebar.jsx';
import ChatArea from './components/ChatArea.jsx';

function Layout() {
  const { loadModels } = useChat();
  useEffect(() => { loadModels(); }, []);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-hidden">
        <ChatArea />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ChatProvider>
      <Layout />
    </ChatProvider>
  );
}
