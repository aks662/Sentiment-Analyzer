import React from 'react';

const SENTIMENT_ICONS = {
  positive: '😊',
  neutral: '😐',
  negative: '😞',
};

export default function SentimentBadge({ sentiment }) {
  if (!sentiment) return null;
  const cls = `sentiment-badge sentiment-badge--${sentiment}`;
  return (
    <span className={cls} aria-label={`Sentiment: ${sentiment}`}>
      <span aria-hidden="true">{SENTIMENT_ICONS[sentiment] ?? '•'}</span>
      {sentiment}
    </span>
  );
}
