import React from 'react';

/**
 * Reusable empty state component for sections with no data.
 *
 * @param {{ icon: string, title: string, description: string, actionLabel: string, onAction: function }} props
 */
export default function EmptyState({ icon = '📋', title, description, actionLabel, onAction }) {
  return (
    <div className="empty-state" role="status">
      <div className="empty-icon" aria-hidden="true">{icon}</div>
      <div className="empty-title">{title}</div>
      {description && (
        <div className="empty-description">{description}</div>
      )}
      {actionLabel && onAction && (
        <button className="btn btn-primary" onClick={onAction} style={{ marginTop: 'var(--space-4)' }}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}
