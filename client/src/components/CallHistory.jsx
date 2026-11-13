import React, { useState } from 'react';
import SentimentBadge from './SentimentBadge.jsx';

function formatDate(isoString) {
  if (!isoString) return '—';
  return new Date(isoString).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function HistoryItem({ call }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="history-item" role="listitem">
      <div
        className="history-item-header"
        onClick={() => setExpanded((p) => !p)}
        role="button"
        tabIndex={0}
        aria-expanded={expanded}
        aria-controls={`call-detail-${call.id}`}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setExpanded((p) => !p); }}
      >
        <span className="history-item-id">#{call.id}</span>

        <span className="history-item-preview" title={call.transcript}>
          {call.transcript.length > 90
            ? call.transcript.slice(0, 90) + '…'
            : call.transcript}
        </span>

        <div className="history-item-meta">
          <SentimentBadge sentiment={call.sentiment} />
          <span className="history-score" aria-label={`Score: ${call.score}`}>
            {call.score > 0 ? `+${call.score}` : call.score}
          </span>
          <span className="history-source-badge">{call.source}</span>
          <span className="history-time">{formatDate(call.created_at)}</span>
          <button
            className="history-expand-btn"
            onClick={(e) => { e.stopPropagation(); setExpanded((p) => !p); }}
            aria-label={expanded ? 'Collapse details' : 'Expand details'}
            tabIndex={-1}
          >
            {expanded ? '▲' : '▼'}
          </button>
        </div>
      </div>

      {expanded && (
        <div
          id={`call-detail-${call.id}`}
          className="history-item-details"
          role="region"
          aria-label={`Details for call #${call.id}`}
        >
          <div className="result-section-title" style={{ marginBottom: '8px' }}>Full Transcript</div>
          <div className="history-transcript-full">{call.transcript}</div>

          {call.matched_terms && call.matched_terms.length > 0 && (
            <>
              <div className="result-section-title" style={{ marginBottom: '8px' }}>
                Matched Keywords
              </div>
              <div className="matched-terms">
                {call.matched_terms.map((term, i) => (
                  <span key={i} className="term-chip">{term}</span>
                ))}
              </div>
            </>
          )}

          {(!call.matched_terms || call.matched_terms.length === 0) && (
            <p style={{ color: 'var(--color-text-dim)', fontSize: 'var(--font-size-xs)' }}>
              No sentiment keywords matched.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default function CallHistory({ calls, loading, error, onRefresh, refreshing }) {
  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Call History</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          {calls && !loading && !error && (
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-dim)' }}>
              {calls.length} record{calls.length !== 1 ? 's' : ''}
            </span>
          )}
          <button
            id="refresh-history-btn"
            className={`btn-icon${refreshing ? ' spinning' : ''}`}
            onClick={onRefresh}
            disabled={loading || refreshing}
            title="Refresh call history"
            aria-label="Refresh call history"
          >
            <span aria-hidden="true">↻</span>
          </button>
        </div>
      </div>

      <div className="card-body" style={{ padding: 'var(--space-5) var(--space-6)' }}>
        {loading && (
          <div className="loading-state" role="status" aria-live="polite">
            <span className="spinner spinner--lg" aria-hidden="true" />
            <span>Loading call history…</span>
          </div>
        )}

        {!loading && error && (
          <div className="alert alert--error" role="alert">
            <span className="alert-icon">⚠</span>
            <div className="alert-body">
              <div className="alert-title">Could not load history</div>
              <div>{error}</div>
            </div>
          </div>
        )}

        {!loading && !error && calls && calls.length === 0 && (
          <div className="empty-state" role="status">
            <div className="empty-state-icon" aria-hidden="true">📋</div>
            <strong>No calls recorded yet</strong>
            <p>Analyze your first call to see it appear here.</p>
          </div>
        )}

        {!loading && !error && calls && calls.length > 0 && (
          <div className="history-list" role="list" aria-label="Call history records">
            {calls.map((call) => (
              <HistoryItem key={call.id} call={call} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
