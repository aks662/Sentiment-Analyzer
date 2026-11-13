import React from 'react';
import ConnectionStatus from './ConnectionStatus.jsx';

const PAGE_LABELS = {
  dashboard:  { title: 'Dashboard', subtitle: 'Overview of all helpdesk call sentiment data' },
  analyze:    { title: 'Analyze Call', subtitle: 'Submit a transcript for sentiment analysis' },
  history:    { title: 'Call History', subtitle: 'All recorded calls, newest first' },
  statistics: { title: 'Statistics', subtitle: 'Detailed sentiment breakdown' },
};

export default function Header({ page, health, loadingHealth, onRefreshHealth, refreshingHealth }) {
  const { title, subtitle } = PAGE_LABELS[page] ?? PAGE_LABELS.dashboard;

  return (
    <header className="dashboard-header">
      <div className="header-left">
        <h1 className="header-title">{title}</h1>
        <p className="header-subtitle">{subtitle}</p>
      </div>
      <div className="header-right">
        <ConnectionStatus
          health={health}
          loading={loadingHealth}
          onRefresh={onRefreshHealth}
          refreshing={refreshingHealth}
        />
      </div>
    </header>
  );
}
