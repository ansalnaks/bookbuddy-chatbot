import React, { useState, useRef, useEffect } from 'react';
import './ChatInput.css';

const QUICK_CHIPS = [
  'Recommend a slow-burn romance novel',
  'Suggest an epic fantasy with unique magic',
  'What should I read if I loved "Gone Girl"?',
  'Summarize "The Great Gatsby" spoiler-free',
  'Explore existential themes in "Crime and Punishment"',
];

export function ChatInput({ onSendMessage, isLoading, disabled }) {
  const [input, setInput] = useState('');
  const textareaRef = useRef(null);

  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 160)}px`;
    }
  }, [input]);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading || disabled) return;

    onSendMessage(input.trim());
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleChipClick = (prompt) => {
    setInput(prompt);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  return (
    <div className="chat-input-wrapper">
      {/* Quick inspiration chips */}
      <div className="quick-chips-scroll">
        {QUICK_CHIPS.map((chip, idx) => (
          <button
            key={idx}
            type="button"
            className="quick-chip"
            onClick={() => handleChipClick(chip)}
            disabled={isLoading || disabled}
          >
            <span>✨</span> {chip}
          </button>
        ))}
      </div>

      <form className="chat-input-form" onSubmit={handleSubmit}>
        <div className="chat-textarea-container">
          <textarea
            ref={textareaRef}
            className="chat-textarea"
            placeholder="Ask BookBuddy AI about novels, book recommendations, authors, summaries, or characters..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            maxLength={4000}
            disabled={isLoading || disabled}
            aria-label="Message BookBuddy AI"
          />

          <div className="input-toolbar-bottom">
            <span className="char-count">
              {input.length > 2500 ? `${input.length}/4000` : ''}
            </span>
            <button
              type="submit"
              className="send-button"
              disabled={!input.trim() || isLoading || disabled}
              title="Send message (Enter)"
              aria-label="Send message"
            >
              {isLoading ? (
                <span className="send-spinner"></span>
              ) : (
                <svg
                  className="send-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              )}
            </button>
          </div>
        </div>
      </form>
      <div className="input-disclaimer">
        <span>BookBuddy AI is powered by Google Gemini. Recommendations are crafted for literary exploration.</span>
      </div>
    </div>
  );
}

