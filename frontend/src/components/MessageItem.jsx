import React, { useState } from 'react';
import './MessageItem.css';

/**
 * Lightweight, safe parser for common markdown in AI book responses
 */
function formatMarkdown(text) {
  if (!text) return '';

  const lines = text.split('\n');
  const renderedElements = [];
  let inList = false;
  let listItems = [];
  let listType = 'ul'; // 'ul' or 'ol'

  const flushList = (key) => {
    if (inList && listItems.length > 0) {
      if (listType === 'ol') {
        renderedElements.push(
          <ol key={`ol-${key}`} className="formatted-list numbered-list">
            {listItems}
          </ol>
        );
      } else {
        renderedElements.push(
          <ul key={`ul-${key}`} className="formatted-list bullet-list">
            {listItems}
          </ul>
        );
      }
      listItems = [];
      inList = false;
    }
  };

  // Helper to parse inline styles: bold, italic, code, quotes
  const parseInline = (lineStr) => {
    // Split by markdown delimiters safely
    const tokens = [];
    let current = lineStr;

    // Replace **bold** with <strong>
    // Replace *italic* with <em>
    // Replace `code` with <code>
    const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
    let match;
    let lastIndex = 0;

    while ((match = regex.exec(lineStr)) !== null) {
      if (match.index > lastIndex) {
        tokens.push(lineStr.substring(lastIndex, match.index));
      }

      const matchText = match[0];
      if (matchText.startsWith('**') && matchText.endsWith('**')) {
        tokens.push(
          <strong key={match.index} className="book-bold">
            {matchText.slice(2, -2)}
          </strong>
        );
      } else if (matchText.startsWith('*') && matchText.endsWith('*')) {
        tokens.push(
          <em key={match.index} className="book-italic">
            {matchText.slice(1, -1)}
          </em>
        );
      } else if (matchText.startsWith('`') && matchText.endsWith('`')) {
        tokens.push(
          <code key={match.index} className="book-inline-code">
            {matchText.slice(1, -1)}
          </code>
        );
      }

      lastIndex = regex.lastIndex;
    }

    if (lastIndex < lineStr.length) {
      tokens.push(lineStr.substring(lastIndex));
    }

    return tokens.length > 0 ? tokens : lineStr;
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    if (!trimmed) {
      flushList(index);
      return;
    }

    // Check for Headers
    if (trimmed.startsWith('### ')) {
      flushList(index);
      renderedElements.push(
        <h4 key={`h4-${index}`} className="msg-heading-3">
          {parseInline(trimmed.substring(4))}
        </h4>
      );
      return;
    }
    if (trimmed.startsWith('## ')) {
      flushList(index);
      renderedElements.push(
        <h3 key={`h3-${index}`} className="msg-heading-2">
          {parseInline(trimmed.substring(3))}
        </h3>
      );
      return;
    }
    if (trimmed.startsWith('# ')) {
      flushList(index);
      renderedElements.push(
        <h2 key={`h2-${index}`} className="msg-heading-1">
          {parseInline(trimmed.substring(2))}
        </h2>
      );
      return;
    }

    // Check for Blockquote
    if (trimmed.startsWith('> ')) {
      flushList(index);
      renderedElements.push(
        <blockquote key={`quote-${index}`} className="book-blockquote">
          {parseInline(trimmed.substring(2))}
        </blockquote>
      );
      return;
    }

    // Check for Bullet points
    if (/^[-*•]\s+/.test(trimmed)) {
      if (!inList || listType !== 'ul') {
        flushList(index);
        inList = true;
        listType = 'ul';
      }
      const content = trimmed.replace(/^[-*•]\s+/, '');
      listItems.push(
        <li key={`li-${index}`} className="list-item">
          {parseInline(content)}
        </li>
      );
      return;
    }

    // Check for Numbered list
    if (/^\d+\.\s+/.test(trimmed)) {
      if (!inList || listType !== 'ol') {
        flushList(index);
        inList = true;
        listType = 'ol';
      }
      const content = trimmed.replace(/^\d+\.\s+/, '');
      listItems.push(
        <li key={`li-${index}`} className="list-item">
          {parseInline(content)}
        </li>
      );
      return;
    }

    // Regular paragraph
    flushList(index);
    renderedElements.push(
      <p key={`p-${index}`} className="msg-paragraph">
        {parseInline(trimmed)}
      </p>
    );
  });

  flushList('end');
  return renderedElements;
}

export function MessageItem({ message }) {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className={`message-item-row ${isUser ? 'user-row' : 'bot-row'}`}>
      <div className="message-avatar" aria-hidden="true">
        {isUser ? (
          <span className="avatar-user">👤</span>
        ) : (
          <span className="avatar-bot">📚</span>
        )}
      </div>

      <div className="message-bubble-container">
        <div className="message-header-meta">
          <span className="message-sender-name">
            {isUser ? 'You' : 'BookBuddy AI'}
          </span>
          <span className="message-time">
            {message.timestamp
              ? new Date(message.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : ''}
          </span>
        </div>

        <div className={`message-bubble ${isUser ? 'user-bubble' : 'bot-bubble'}`}>
          {isUser ? (
            <p className="user-message-text">{message.content}</p>
          ) : (
            <div className="bot-message-formatted">
              {formatMarkdown(message.content)}
            </div>
          )}
        </div>

        {!isUser && (
          <div className="message-actions">
            <button
              type="button"
              className="copy-btn"
              onClick={handleCopy}
              title="Copy response to clipboard"
            >
              {copied ? (
                <>
                  <span className="action-icon">✓</span> Copied
                </>
              ) : (
                <>
                  <span className="action-icon">📋</span> Copy
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

