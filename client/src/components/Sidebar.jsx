import React, { useState } from 'react';

const NAV_ITEMS = [
  { id: 'dashboard',  icon: '◫',  label: 'Dashboard' },
  { id: 'analyze',    icon: '⬡',  label: 'Analyze Call' },
  { id: 'history',    icon: '☰',  label: 'Call History' },
  { id: 'statistics', icon: '◎',  label: 'Statistics' },
];

export default function Sidebar({ activePage, onNavigate }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  function handleNav(id) {
    onNavigate(id);
    setMobileOpen(false);
  }

  return (
    <>
      {/* Mobile hamburger */}
      <button
        className="mobile-menu-btn"
        onClick={() => setMobileOpen(true)}
        aria-label="Open navigation menu"
        aria-expanded={mobileOpen}
        id="mobile-menu-btn"
      >
        ☰
      </button>

      {/* Overlay */}
      {mobileOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <nav
        className={`sidebar${mobileOpen ? ' sidebar--open' : ''}`}
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon" aria-hidden="true">📞</div>
          <div className="sidebar-logo-text">
            <span className="sidebar-logo-title">Sentiment Analyzer</span>
            <span className="sidebar-logo-sub">Helpdesk Dashboard</span>
          </div>
        </div>

        {/* Nav items */}
        <div className="sidebar-nav">
          <div className="sidebar-section-label">Navigation</div>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              className={`nav-item${activePage === item.id ? ' active' : ''}`}
              onClick={() => handleNav(item.id)}
              aria-current={activePage === item.id ? 'page' : undefined}
            >
              <span className="nav-item-icon" aria-hidden="true">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>

        <div className="sidebar-footer">
          <div>Helpdesk Sentiment</div>
          <div style={{ marginTop: '2px' }}>Ministry of Commerce MVP</div>
        </div>
      </nav>
    </>
  );
}
