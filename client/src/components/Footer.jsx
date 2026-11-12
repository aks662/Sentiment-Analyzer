import React from 'react';

/**
 * Footer component displayed at the bottom of the main content area.
 * Shows project info and current year.
 */
export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="app-footer" role="contentinfo">
      <div className="footer-content">
        <span className="footer-brand">
          Helpdesk Sentiment Analyzer
        </span>
        <span className="footer-separator">·</span>
        <span className="footer-info">
          Ministry of Commerce & Industries
        </span>
        <span className="footer-separator">·</span>
        <span className="footer-year">© {year}</span>
      </div>
    </footer>
  );
}
