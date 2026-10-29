import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import { Sidebar } from './components/Sidebar';
import { ChatArea } from './components/ChatArea';
import { sendMessageToGemini, checkBackendHealth } from './services/api';

const STORAGE_KEY = 'bookbuddy_sessions_v1';

function createNewSession(title = 'New Book Inquiry') {
  return {
    id: 'session_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    title,
    createdAt: Date.now(),
    messages: [],
  };
}

export function App() {
  // Load saved sessions from localStorage or start fresh
  const [sessions, setSessions] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse saved sessions from localStorage:', e);
    }
    return [createNewSession()];
  });

  const [activeSessionId, setActiveSessionId] = useState(() => {
    return sessions[0]?.id || '';
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [backendStatus, setBackendStatus] = useState({
    status: 'checking',
    model: '',
    hasApiKey: false,
  });

  // Keep active session in sync
  const activeSession =
    sessions.find((s) => s.id === activeSessionId) || sessions[0] || createNewSession();

  // Persist sessions to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    } catch (e) {
      console.warn('Failed to save sessions to localStorage:', e);
    }
  }, [sessions]);

  // Check backend health on initial mount
  useEffect(() => {
    async function checkHealth() {
      const result = await checkBackendHealth();
      setBackendStatus(result);
    }
    checkHealth();
  }, []);

  // Handler: Start a brand new chat session
  const handleNewChat = useCallback(() => {
    const newSession = createNewSession();
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    setError(null);
  }, []);

  // Handler: Select a chat session
  const handleSelectSession = useCallback((sessionId) => {
    setActiveSessionId(sessionId);
    setError(null);
  }, []);

  // Handler: Delete a session
  const handleDeleteSession = useCallback(
    (sessionId) => {
      setSessions((prev) => {
        const filtered = prev.filter((s) => s.id !== sessionId);
        if (filtered.length === 0) {
          const fresh = createNewSession();
          setActiveSessionId(fresh.id);
          return [fresh];
        }
        if (sessionId === activeSessionId) {
          setActiveSessionId(filtered[0].id);
        }
        return filtered;
      });
      setError(null);
    },
    [activeSessionId]
  );

  // Handler: Clear all sessions
  const handleClearAllSessions = useCallback(() => {
    const fresh = createNewSession();
    setSessions([fresh]);
    setActiveSessionId(fresh.id);
    setError(null);
  }, []);

  // Handler: Clear messages in current chat
  const handleClearCurrentChat = useCallback(() => {
    setSessions((prev) =>
      prev.map((s) => (s.id === activeSession.id ? { ...s, messages: [] } : s))
    );
    setError(null);
  }, [activeSession.id]);

  // Handler: Send message
  const handleSendMessage = useCallback(
    async (text) => {
      if (!text || !text.trim() || isLoading) return;

      const userText = text.trim();
      const currentMessages = activeSession.messages || [];

      // Append user message immediately
      const userMessage = {
        role: 'user',
        content: userText,
        timestamp: Date.now(),
      };

      const updatedMessages = [...currentMessages, userMessage];

      // Update session title if it's the first message
      let newTitle = activeSession.title;
      if (currentMessages.length === 0) {
        newTitle = userText.length > 36 ? userText.substring(0, 36) + '...' : userText;
      }

      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSession.id
            ? { ...s, title: newTitle, messages: updatedMessages }
            : s
        )
      );

      setIsLoading(true);
      setError(null);

      try {
        // Send history excluding the current message
        const responseData = await sendMessageToGemini(userText, currentMessages);

        const botMessage = {
          role: 'assistant',
          content: responseData.reply,
          timestamp: Date.now(),
        };

        setSessions((prev) =>
          prev.map((s) =>
            s.id === activeSession.id
              ? { ...s, messages: [...updatedMessages, botMessage] }
              : s
          )
        );
      } catch (err) {
        console.error('Chat error:', err);
        setError(err.message || 'Something went wrong while asking Gemini.');
      } finally {
        setIsLoading(false);
      }
    },
    [activeSession, isLoading]
  );

  // Handler: Retry the last user prompt
  const handleRetryLastMessage = useCallback(() => {
    const msgs = activeSession.messages || [];
    const lastUserMsg = [...msgs].reverse().find((m) => m.role === 'user');
    if (lastUserMsg) {
      // Remove trailing error or retry
      handleSendMessage(lastUserMsg.content);
    }
  }, [activeSession.messages, handleSendMessage]);

  return (
    <div className="bookbuddy-app-layout">
      {/* Sidebar with genres, topics, and chat sessions */}
      <Sidebar
        sessions={sessions}
        activeSessionId={activeSession.id}
        onSelectSession={handleSelectSession}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
        onClearAllSessions={handleClearAllSessions}
        onSelectPrompt={handleSendMessage}
        isOpen={isSidebarOpen}
        onCloseMobile={() => setIsSidebarOpen(false)}
        backendStatus={backendStatus}
      />

      {/* Main Chat Area */}
      <ChatArea
        messages={activeSession.messages || []}
        isLoading={isLoading}
        error={error}
        onSendMessage={handleSendMessage}
        onRetryLastMessage={handleRetryLastMessage}
        onClearChat={handleClearCurrentChat}
        onOpenMobileSidebar={() => setIsSidebarOpen(true)}
        currentChatTitle={activeSession.title}
      />
    </div>
  );
}

export default App;

