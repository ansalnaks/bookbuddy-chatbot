import React from 'react';
import './Sidebar.css';
import { GenrePills, TopicPills } from './GenrePills';

export function Sidebar({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  onClearAllSessions,
  onSelectPrompt,
  isOpen,
  onCloseMobile,
  backendStatus,
}) {
  return (
    <>
      {/* Mobile backdrop */}
      <div
        className={`sidebar-backdrop ${isOpen ? 'active' : ''}`}
        onClick={onCloseMobile}
        aria-hidden="true"
      />

      <aside className={`bookbuddy-sidebar sidebar-scroll ${isOpen ? 'open' : ''}`}>
        {/* Brand Header */}
        <div className="sidebar-brand-header">
          <div className="brand-logo-area">
            <div className="brand-icon-wrapper">
              <span className="brand-icon">📚</span>
            </div>
            <div className="brand-titles">
              <h1 className="brand-name">BookBuddy AI</h1>
              <span className="brand-subtitle">Your Literary Companion</span>
            </div>
          </div>
          <button
            type="button"
            className="mobile-close-btn"
            onClick={onCloseMobile}
            title="Close sidebar"
            aria-label="Close sidebar"
          >
            ✕
          </button>
        </div>

        {/* New Chat Primary Button */}
        <div className="sidebar-action-section">
          <button
            type="button"
            className="new-chat-button"
            onClick={() => {
              onNewChat();
              onCloseMobile();
            }}
          >
            <span className="new-chat-plus">+</span>
            <span>New Reading Chat</span>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="sidebar-scrollable-content sidebar-scroll">
          {/* Chat Sessions History */}
          <div className="sidebar-section">
            <div className="section-header-row">
              <span className="section-title">Reading History</span>
              {sessions.length > 0 && (
                <button
                  type="button"
                  className="clear-history-link"
                  onClick={onClearAllSessions}
                  title="Clear all saved chats"
                >
                  Clear All
                </button>
              )}
            </div>

            <div className="session-list">
              {sessions.length === 0 ? (
                <div className="empty-sessions-notice">
                  <span>No past chats yet. Start a new book inquiry!</span>
                </div>
              ) : (
                sessions.map((session) => (
                  <div
                    key={session.id}
                    className={`session-item ${session.id === activeSessionId ? 'active' : ''}`}
                  >
                    <button
                      type="button"
                      className="session-select-btn"
                      onClick={() => {
                        onSelectSession(session.id);
                        onCloseMobile();
                      }}
                      title={session.title}
                    >
                      <span className="session-icon">📖</span>
                      <span className="session-title">{session.title || 'Untitled Book Chat'}</span>
                    </button>
                    <button
                      type="button"
                      className="session-delete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteSession(session.id);
                      }}
                      title="Delete chat"
                    >
                      ×
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Genre Explorer Section */}
          <div className="sidebar-section">
            <div className="section-header-row">
              <span className="section-title">Explore by Genre</span>
            </div>
            <GenrePills
              onSelectPrompt={(prompt) => {
                onSelectPrompt(prompt);
                onCloseMobile();
              }}
            />
          </div>

          {/* Literary Inquiries Section */}
          <div className="sidebar-section">
            <div className="section-header-row">
              <span className="section-title">Literary Inquiries</span>
            </div>
            <TopicPills
              onSelectPrompt={(prompt) => {
                onSelectPrompt(prompt);
                onCloseMobile();
              }}
            />
          </div>
        </div>

        {/* Footer Status Panel */}
        <div className="sidebar-footer">
          <div className="status-badge-row">
            <span
              className={`status-dot ${
                backendStatus.status === 'ok'
                  ? backendStatus.hasApiKey
                    ? 'dot-green'
                    : 'dot-orange'
                  : 'dot-red'
              }`}
            ></span>
            <span className="status-label">
              {backendStatus.status === 'ok'
                ? backendStatus.hasApiKey
                  ? `Gemini API Ready (${backendStatus.model || 'Flash'})`
                  : 'API Key Missing in .env'
                : 'Backend Disconnected'}
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}

