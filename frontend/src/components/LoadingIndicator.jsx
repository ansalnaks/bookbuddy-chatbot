import React, { useState, useEffect } from 'react';
import './LoadingIndicator.css';

const LOADING_PHRASES = [
  'Flipping through the literary archives...',
  'Browsing the grand library shelves...',
  'Consulting character arcs and motifs...',
  'Curating personalized book recommendations...',
  'Analyzing themes, prose styles, and tropes...',
  'Gathering insights from literary masters...',
];

export function LoadingIndicator() {
  const [phraseIndex, setPhraseIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % LOADING_PHRASES.length);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="loading-indicator-wrapper" role="status" aria-live="polite">
      <div className="book-loader">
        <div className="book-cover left-cover"></div>
        <div className="book-page page-1"></div>
        <div className="book-page page-2"></div>
        <div className="book-page page-3"></div>
        <div className="book-cover right-cover"></div>
      </div>
      <div className="loading-content">
        <span className="loading-bot-name">BookBuddy AI</span>
        <p className="loading-phrase" key={phraseIndex}>
          {LOADING_PHRASES[phraseIndex]}
        </p>
      </div>
    </div>
  );
}

