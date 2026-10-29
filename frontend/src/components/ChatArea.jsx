import React, { useRef, useEffect } from 'react';
import './ChatArea.css';
import { MessageItem } from './MessageItem';
import { LoadingIndicator } from './LoadingIndicator';
import { ChatInput } from './ChatInput';

const STARTER_CARDS = [
  {
    icon: '🌹',
    title: 'Romance & Relationships',
    prompt: 'Recommend 3 top romance novels with witty banter and unforgettable emotional chemistry (mix of contemporary and historical).',
  },
  {
    icon: '🐉',
    title: 'Epic Fantasy Worlds',
    prompt: 'Recommend 3 immersive fantasy books featuring intricate magic systems and rich, expansive worldbuilding.',
  },
  {
    icon: '🔍',
    title: 'Mystery & Whodunit',
    prompt: 'What are 3 of the cleverest locked-room mystery novels ever written, and what makes their puzzles so ingenious?',
  },
  {
    icon: '🚀',
    title: 'Mind-Bending Sci-Fi',
    prompt: 'Suggest 3 thought-provoking science fiction novels exploring the frontiers of artificial intelligence or deep space.',
  },
  {
    icon: '📜',
    title: 'Spoiler-Free Summary',
    prompt: 'Give me a spoiler-free summary, major themes, and the central hook of "Pride and Prejudice".',
  },
  {
    icon: '💡',
    title: 'Character Analysis',
    prompt: 'Analyze Jay Gatsby’s character arc and symbolism in F. Scott Fitzgerald’s "The Great Gatsby".',
  },
];

export function ChatArea({
  messages,
  isLoading,
  error,
  onSendMessage,
  onRetryLastMessage,
  onClearChat,
  onOpenMobileSidebar,
  currentChatTitle,
}) {
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom whenever messages or loading state changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, error]);

  return (
    <main className="chat-main-area paper-texture">
      {/* Top Navbar */}
      <header className="chat-header">
        <div className="header-left">
          <button
            type="button"
            className="mobile-hamburger-btn"
            onClick={onOpenMobileSidebar}
            title="Open navigation menu"
            aria-label="Open navigation menu"
          >
            ☰
          </button>
          <div className="chat-header-info">
            <h2 className="current-chat-title">
              {currentChatTitle || 'New Reading Inquiry'}
            </h2>
            <span className="chat-sub-status">
              BookBuddy AI • Powered by Google Gemini
            </span>
          </div>
        </div>

        <div className="header-actions">
          {messages.length > 0 && (
            <button
              type="button"
              className="header-action-btn clear-chat-btn"
              onClick={onClearChat}
              title="Clear current messages"
            >
              <span>🗑️</span>
              <span className="btn-text">Clear Chat</span>
            </button>
          )}
        </div>
      </header>

      {/* Messages Scroll Area */}
      <div className="messages-scroll-container">
        {messages.length === 0 ? (
          <div className="welcome-hero-container">
            <div className="welcome-hero-card">
              <div className="hero-emblem">📖</div>
              <h2 className="hero-headline">Welcome to BookBuddy AI</h2>
              <p className="hero-description">
                Your dedicated AI librarian and literary companion. Ask me for book recommendations across any genre, spoiler-free summaries, author guides, character analyses, or similar book pairings.
              </p>

              <div className="starter-cards-grid">
                {STARTER_CARDS.map((card, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="starter-card"
                    onClick={() => onSendMessage(card.prompt)}
                    disabled={isLoading}
                  >
                    <span className="starter-card-icon">{card.icon}</span>
                    <div className="starter-card-text">
                      <strong className="starter-card-title">{card.title}</strong>
                      <span className="starter-card-prompt">{card.prompt}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="messages-list-wrapper">
            {messages.map((msg, index) => (
              <MessageItem key={index} message={msg} />
            ))}

            {isLoading && (
              <div className="loading-row">
                <LoadingIndicator />
              </div>
            )}

            {error && (
              <div className="error-banner" role="alert">
                <div className="error-icon">⚠️</div>
                <div className="error-details">
                  <strong className="error-title">Could not complete request</strong>
                  <p className="error-text">{error}</p>
                </div>
                {onRetryLastMessage && (
                  <button
                    type="button"
                    className="error-retry-btn"
                    onClick={onRetryLastMessage}
                  >
                    Retry
                  </button>
                )}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <footer className="chat-footer-dock">
        <ChatInput onSendMessage={onSendMessage} isLoading={isLoading} />
      </footer>
    </main>
  );
}

