import React from 'react';

/**
 * ConnectionStatus — shows express and database status badges
 * derived from /api/health response.
 */
export default function ConnectionStatus({ health, loading, onRefresh, refreshing }) {
  function statusClass(val) {
    if (loading) return 'conn-badge conn-badge--loading';
    if (val === 'running' || val === 'connected' || val === 'ok') return 'conn-badge conn-badge--ok';
    return 'conn-badge conn-badge--error';
  }

  function statusLabel(key, val) {
    if (loading) return `${key}: checking…`;
    return `${key}: ${val ?? '—'}`;
  }

  const expressVal = health?.express;
  const dbVal     = health?.database;

  return (
    <div className="connection-badges" role="status" aria-live="polite">
      <span className={statusClass(expressVal)} title="Express API server status">
        <span className="conn-badge-dot" aria-hidden="true" />
        {loading ? 'API…' : expressVal === 'running' ? 'API' : 'API down'}
      </span>

      <span className={statusClass(dbVal)} title="PostgreSQL database status">
        <span className="conn-badge-dot" aria-hidden="true" />
        {loading ? 'DB…' : dbVal === 'connected' ? 'DB' : 'DB down'}
      </span>

      <button
        className={`btn-icon${refreshing ? ' spinning' : ''}`}
        onClick={onRefresh}
        disabled={loading || refreshing}
        title="Refresh connection status"
        aria-label="Refresh connection status"
        id="refresh-status-btn"
      >
        <span aria-hidden="true">↻</span>
      </button>
    </div>
  );
}
