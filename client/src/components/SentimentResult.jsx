import React from 'react';
import SentimentBadge from './SentimentBadge.jsx';

/**
 * SentimentResult — displays the full result returned by POST /api/calls.
 * Does NOT recalculate sentiment; all data comes directly from the backend.
 */
export default function SentimentResult({ result }) {
  if (!result) return null;

  const { sentiment, score, matched_terms, transcript, source, id, created_at } = result;

  const isNegated = (term) => term.startsWith('not ');
  const baseWord  = (term) => (isNegated(term) ? term.slice(4) : term);

  function termChipClass(term) {
    // Negated positive = negative chip, negated negative = positive chip
    const neg = isNegated(term);
    if (sentiment === 'positive') return neg ? 'term-chip--negative' : 'term-chip--positive';
    if (sentiment === 'negative') return neg ? 'term-chip--positive' : 'term-chip--negative';
    return '';
  }

  const formattedDate = created_at
    ? new Date(created_at).toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : '—';

  return (
    <div
      className={`result-panel result-panel--${sentiment}`}
      role="region"
      aria-label="Sentiment analysis result"
      aria-live="polite"
    >
      {/* Header */}
      <div className="result-header">
        <div className="result-header-left">
          <div className="result-label">Analysis Result</div>
          <div className="result-sentiment-row">
            <span className={`result-sentiment-name result-sentiment-name--${sentiment}`}>
              {sentiment}
            </span>
            <SentimentBadge sentiment={sentiment} />
          </div>
        </div>

        <div className="result-score">
          <span className="result-score-value">
            {score > 0 ? `+${score}` : score}
          </span>
          <span className="result-score-label">Polarity Score</span>
        </div>
      </div>

      {/* Body */}
      <div className="result-body">
        {/* Matched terms */}
        <div>
          <div className="result-section-title">Matched Keywords</div>
          {matched_terms && matched_terms.length > 0 ? (
            <div className="matched-terms" role="list" aria-label="Matched sentiment keywords">
              {matched_terms.map((term, i) => (
                <span
                  key={i}
                  className={`term-chip ${termChipClass(term)}`}
                  role="listitem"
                  title={isNegated(term) ? `Negated: "${baseWord(term)}"` : undefined}
                >
                  {term}
                </span>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--color-text-dim)', fontSize: 'var(--font-size-sm)' }}>
              No sentiment keywords matched.
            </p>
          )}
        </div>

        {/* Original transcript */}
        <div>
          <div className="result-section-title">Transcript</div>
          <div
            className="result-transcript"
            role="textbox"
            aria-readonly="true"
            aria-label="Original transcript"
          >
            {transcript}
          </div>
        </div>

        {/* Meta */}
        <div className="result-meta">
          <div className="result-meta-item">
            <span className="result-meta-label">Record ID</span>
            <span className="result-meta-value">#{id}</span>
          </div>
          <div className="result-meta-item">
            <span className="result-meta-label">Source</span>
            <span className="result-meta-value" style={{ textTransform: 'capitalize' }}>
              {source}
            </span>
          </div>
          <div className="result-meta-item">
            <span className="result-meta-label">Saved at</span>
            <span className="result-meta-value">{formattedDate}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
