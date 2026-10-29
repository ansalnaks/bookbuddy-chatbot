import React from 'react';
import './GenrePills.css';

export const GENRES = [
  { id: 'romance', name: 'Romance', icon: '🌹', prompt: 'Recommend 3 top romance novels across different tropes (e.g. enemies-to-lovers, slow burn, historical romance) with compelling emotional chemistry.' },
  { id: 'fantasy', name: 'Fantasy', icon: '🐉', prompt: 'Recommend 3 mesmerizing fantasy books with rich worldbuilding, immersive magic systems, and unforgettable character journeys.' },
  { id: 'fiction', name: 'Fiction', icon: '📖', prompt: 'Recommend 3 outstanding contemporary or literary fiction novels that explore poignant human relationships and deep emotional depth.' },
  { id: 'mystery', name: 'Mystery', icon: '🔍', prompt: 'Recommend 3 gripping mystery novels with clever clues, intricate detective work, and an unexpected plot twist.' },
  { id: 'thriller', name: 'Thriller', icon: '⚡', prompt: 'Recommend 3 high-stakes psychological or suspense thrillers that are impossible to put down.' },
  { id: 'horror', name: 'Horror', icon: '🕯️', prompt: 'Recommend 3 chilling horror or gothic novels known for dread, atmospheric tension, and psychological fright.' },
  { id: 'scifi', name: 'Science Fiction', icon: '🚀', prompt: 'Recommend 3 thought-provoking science fiction novels exploring grand cosmic concepts, future technology, or dystopian societies.' },
  { id: 'classics', name: 'Classic Literature', icon: '🏛️', prompt: 'Recommend 3 timeless classic literature masterpieces that remain deeply rewarding and relevant for modern readers.' },
];

export const TOPICS = [
  { id: 'author', label: 'Authors', icon: '✍️', prompt: 'Give me a brief biography and a recommended reading order for author Kazuo Ishiguro.' },
  { id: 'summary', label: 'Book Summaries', icon: '📜', prompt: 'Provide a spoiler-free summary and hook for "The Seven Husbands of Evelyn Hugo".' },
  { id: 'characters', label: 'Characters', icon: '👥', prompt: 'Analyze the complex character dynamics between Elizabeth Bennet and Mr. Darcy in "Pride and Prejudice".' },
  { id: 'themes', label: 'Themes', icon: '💡', prompt: 'What are the core philosophical themes and symbolic motifs in Frank Herbert’s "Dune"?' },
  { id: 'similar', label: 'Similar Books', icon: '🔄', prompt: 'Recommend 3 books similar to "Project Hail Mary" by Andy Weir for someone who loves scientific wit and optimism.' },
];

export function GenrePills({ onSelectPrompt, activeGenre }) {
  return (
    <div className="genre-pills-container">
      <div className="genre-pills-grid">
        {GENRES.map((genre) => (
          <button
            key={genre.id}
            type="button"
            className={`genre-pill ${activeGenre === genre.id ? 'active' : ''}`}
            onClick={() => onSelectPrompt(genre.prompt, genre.name)}
            title={`Explore ${genre.name} recommendations`}
          >
            <span className="genre-pill-icon">{genre.icon}</span>
            <span className="genre-pill-label">{genre.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function TopicPills({ onSelectPrompt }) {
  return (
    <div className="topic-pills-container">
      {TOPICS.map((topic) => (
        <button
          key={topic.id}
          type="button"
          className="topic-pill"
          onClick={() => onSelectPrompt(topic.prompt, topic.label)}
          title={`Ask about ${topic.label}`}
        >
          <span className="topic-icon">{topic.icon}</span>
          <span className="topic-label">{topic.label}</span>
        </button>
      ))}
    </div>
  );
}

