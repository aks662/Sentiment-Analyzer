import React from 'react';

export default function StatCard({ label, value, type, icon, loading, error }) {
  return (
    <div className={`stat-card stat-card--${type}`} role="region" aria-label={`${label} statistic`}>
      <div className="stat-card-header">
        <span className="stat-card-label">{label}</span>
        <span className="stat-card-icon" aria-hidden="true">{icon}</span>
      </div>

      {loading ? (
        <div className="stat-card-loading">
          <span className="spinner" aria-hidden="true" />
          <span>Loading…</span>
        </div>
      ) : error ? (
        <div className="stat-card-loading" role="alert">
          <span style={{ color: 'var(--color-negative)' }}>⚠</span>
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-dim)' }}>
            Unavailable
          </span>
        </div>
      ) : (
        <>
          <div className="stat-card-value" aria-live="polite">
            {value ?? 0}
          </div>
          <div className="stat-card-sub">calls recorded</div>
        </>
      )}
    </div>
  );
}
