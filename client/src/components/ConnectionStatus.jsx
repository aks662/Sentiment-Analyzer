import React from 'react';

/**
 * ConnectionStatus — shows the live backend connection status
 * with appropriate styling and accessible labels.
 *
 * @param {{ health: object, loading: boolean, onRefresh: function, refreshing: boolean }} props
 */
export default function ConnectionStatus({ health, loading, onRefresh, refreshing }) {
  if (loading) {
    return (
      <div className="connection-status connection-status--checking" role="status" aria-live="polite">
        <span className="spinner spinner--sm" aria-hidden="true" />
        <span>Checking connection…</span>
      </div>
    );
  }

  const isOk = health?.status === 'ok';
  const dbOk = health?.database === 'connected';

  const statusClass = isOk && dbOk
    ? 'connection-status--ok'
    : isOk
    ? 'connection-status--partial'
    : 'connection-status--error';

  const statusLabel = isOk && dbOk
    ? 'All systems operational'
    : isOk
    ? 'Server up, database unavailable'
    : 'Backend unreachable';

  const statusDot = isOk && dbOk ? '●' : isOk ? '◐' : '○';

  return (
    <div className={`connection-status ${statusClass}`} role="status" aria-live="polite">
      <span className="connection-dot" aria-hidden="true">{statusDot}</span>
      <span className="connection-label">{statusLabel}</span>
      <button
        className={`btn-icon btn-icon--sm${refreshing ? ' spinning' : ''}`}
        onClick={onRefresh}
        disabled={refreshing}
        title="Refresh connection status"
        aria-label="Refresh connection status"
      >
        ↻
      </button>
    </div>
  );
}
