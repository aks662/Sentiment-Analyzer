import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar.jsx';
import Header from './components/Header.jsx';
import StatCard from './components/StatCard.jsx';
import TranscriptForm from './components/TranscriptForm.jsx';
import MicrophoneControls from './components/MicrophoneControls.jsx';
import CallHistory from './components/CallHistory.jsx';
import { fetchHealth, fetchStats, fetchCalls } from './services/api.js';

// ─── Page: Dashboard ───────────────────────────────────────────────────────
function DashboardPage({ stats, statsLoading, statsError, calls, callsLoading, callsError, onRefreshCalls, refreshingCalls, onNavigate }) {
  return (
    <>
      <div className="section-header">
        <h2 className="section-title">Overview</h2>
        <p className="section-subtitle">
          Real-time sentiment summary from all recorded helpdesk calls.
        </p>
      </div>

      <div className="stats-grid">
        <StatCard label="Total Calls"    type="total"    icon="📞" value={stats?.total}    loading={statsLoading} error={statsError} />
        <StatCard label="Positive"       type="positive" icon="😊" value={stats?.positive} loading={statsLoading} error={statsError} />
        <StatCard label="Neutral"        type="neutral"  icon="😐" value={stats?.neutral}  loading={statsLoading} error={statsError} />
        <StatCard label="Negative"       type="negative" icon="😞" value={stats?.negative} loading={statsLoading} error={statsError} />
      </div>

      <CallHistory
        calls={calls}
        loading={callsLoading}
        error={callsError}
        onRefresh={onRefreshCalls}
        refreshing={refreshingCalls}
      />
    </>
  );
}

// ─── Page: Analyze ─────────────────────────────────────────────────────────
function AnalyzePage({ onSubmitSuccess }) {
  return (
    <>
      <div className="section-header">
        <h2 className="section-title">Analyze a Call</h2>
        <p className="section-subtitle">
          Paste or type a customer-service transcript to get the sentiment analysis result.
        </p>
      </div>
      <div className="two-col">
        <TranscriptForm onSubmitSuccess={onSubmitSuccess} />
        <MicrophoneControls onSubmitSuccess={onSubmitSuccess} />
      </div>
    </>
  );
}

// ─── Page: History ─────────────────────────────────────────────────────────
function HistoryPage({ calls, loading, error, onRefresh, refreshing }) {
  return (
    <>
      <div className="section-header">
        <h2 className="section-title">Call History</h2>
        <p className="section-subtitle">
          All recorded calls, newest first. Click any row to expand details.
        </p>
      </div>
      <CallHistory calls={calls} loading={loading} error={error} onRefresh={onRefresh} refreshing={refreshing} />
    </>
  );
}

// ─── Page: Statistics ──────────────────────────────────────────────────────
function StatisticsPage({ stats, loading, error, calls }) {
  if (loading) {
    return (
      <div className="loading-state" role="status">
        <span className="spinner spinner--lg" aria-hidden="true" />
        <span>Loading statistics…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert--error" role="alert">
        <span className="alert-icon">⚠</span>
        <div>
          <div className="alert-title">Could not load statistics</div>
          <div>{error}</div>
        </div>
      </div>
    );
  }

  const total    = stats?.total    ?? 0;
  const positive = stats?.positive ?? 0;
  const neutral  = stats?.neutral  ?? 0;
  const negative = stats?.negative ?? 0;

  const pctOf = (n) => (total > 0 ? Math.round((n / total) * 100) : 0);

  return (
    <>
      <div className="section-header">
        <h2 className="section-title">Statistics</h2>
        <p className="section-subtitle">Sentiment distribution across all recorded calls.</p>
      </div>

      <div className="stats-grid" style={{ marginBottom: 'var(--space-6)' }}>
        <StatCard label="Total Calls"    type="total"    icon="📞" value={total}    loading={loading} error={error} />
        <StatCard label="Positive"       type="positive" icon="😊" value={positive} loading={loading} error={error} />
        <StatCard label="Neutral"        type="neutral"  icon="😐" value={neutral}  loading={loading} error={error} />
        <StatCard label="Negative"       type="negative" icon="😞" value={negative} loading={loading} error={error} />
      </div>

      {/* Breakdown bars */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Sentiment Distribution</h3>
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-dim)' }}>
            {total} call{total !== 1 ? 's' : ''} total
          </span>
        </div>
        <div className="card-body">
          {total === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon" aria-hidden="true">📊</div>
              <strong>No data yet</strong>
              <p>Analyze some calls to see distribution statistics.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
              {[
                { label: 'Positive', value: positive, pct: pctOf(positive), color: 'var(--color-positive)' },
                { label: 'Neutral',  value: neutral,  pct: pctOf(neutral),  color: 'var(--color-neutral)' },
                { label: 'Negative', value: negative, pct: pctOf(negative), color: 'var(--color-negative)' },
              ].map(({ label, value, pct, color }) => (
                <div key={label}>
                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    marginBottom: 'var(--space-2)',
                    fontSize: 'var(--font-size-sm)',
                  }}>
                    <span style={{ color: 'var(--color-text-muted)', fontWeight: 500 }}>{label}</span>
                    <span style={{ color: 'var(--color-text-muted)' }}>
                      {value} call{value !== 1 ? 's' : ''} — {pct}%
                    </span>
                  </div>
                  <div
                    style={{
                      height: '10px',
                      background: 'var(--color-surface-3)',
                      borderRadius: 'var(--radius-full)',
                      overflow: 'hidden',
                    }}
                    role="progressbar"
                    aria-valuenow={pct}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${label}: ${pct}%`}
                  >
                    <div style={{
                      height: '100%',
                      width: `${pct}%`,
                      background: color,
                      borderRadius: 'var(--radius-full)',
                      transition: 'width 0.5s ease',
                    }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent source breakdown */}
      {calls && calls.length > 0 && (
        <div className="card" style={{ marginTop: 'var(--space-5)' }}>
          <div className="card-header">
            <h3 className="card-title">Source Breakdown</h3>
          </div>
          <div className="card-body">
            {(() => {
              const manual = calls.filter((c) => c.source === 'manual').length;
              const mic    = calls.filter((c) => c.source === 'microphone').length;
              return (
                <div style={{ display: 'flex', gap: 'var(--space-6)', flexWrap: 'wrap' }}>
                  <div>
                    <div className="result-meta-label">Manual entries</div>
                    <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: 'var(--color-accent)' }}>
                      {manual}
                    </div>
                  </div>
                  <div>
                    <div className="result-meta-label">Microphone entries</div>
                    <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: 'var(--color-accent)' }}>
                      {mic}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </>
  );
}

// ─── Root App ───────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState('dashboard');

  // Health
  const [health, setHealth]           = useState(null);
  const [healthLoading, setHealthLoading] = useState(true);
  const [refreshingHealth, setRefreshingHealth] = useState(false);

  // Stats
  const [stats, setStats]             = useState(null);
  const [statsLoading, setStatsLoading]   = useState(true);
  const [statsError, setStatsError]       = useState('');

  // Calls
  const [calls, setCalls]             = useState(null);
  const [callsLoading, setCallsLoading]   = useState(true);
  const [callsError, setCallsError]       = useState('');
  const [refreshingCalls, setRefreshingCalls] = useState(false);

  const loadHealth = useCallback(async (silent = false) => {
    if (!silent) setHealthLoading(true);
    else setRefreshingHealth(true);
    try {
      const h = await fetchHealth();
      setHealth(h);
    } finally {
      setHealthLoading(false);
      setRefreshingHealth(false);
    }
  }, []);

  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    setStatsError('');
    try {
      const s = await fetchStats();
      setStats(s);
    } catch (err) {
      setStatsError(err.message);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const loadCalls = useCallback(async (silent = false) => {
    if (!silent) setCallsLoading(true);
    else setRefreshingCalls(true);
    setCallsError('');
    try {
      const c = await fetchCalls();
      setCalls(c);
    } catch (err) {
      setCallsError(err.message);
    } finally {
      setCallsLoading(false);
      setRefreshingCalls(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadHealth();
    loadStats();
    loadCalls();
  }, [loadHealth, loadStats, loadCalls]);

  function handleSubmitSuccess() {
    // Silently refresh stats and calls after a successful analysis
    loadStats();
    loadCalls(true);
  }

  function handleRefreshCalls() {
    loadCalls(true);
  }

  function handleRefreshHealth() {
    loadHealth(true);
    loadStats();
  }

  return (
    <div className="app-layout">
      <Sidebar activePage={page} onNavigate={setPage} />

      <div className="main-area">
        <Header
          page={page}
          health={health}
          loadingHealth={healthLoading}
          onRefreshHealth={handleRefreshHealth}
          refreshingHealth={refreshingHealth}
        />

        <main className="page-content" id="main-content" role="main">
          {page === 'dashboard' && (
            <DashboardPage
              stats={stats}
              statsLoading={statsLoading}
              statsError={statsError}
              calls={calls}
              callsLoading={callsLoading}
              callsError={callsError}
              onRefreshCalls={handleRefreshCalls}
              refreshingCalls={refreshingCalls}
              onNavigate={setPage}
            />
          )}
          {page === 'analyze' && (
            <AnalyzePage onSubmitSuccess={handleSubmitSuccess} />
          )}
          {page === 'history' && (
            <HistoryPage
              calls={calls}
              loading={callsLoading}
              error={callsError}
              onRefresh={handleRefreshCalls}
              refreshing={refreshingCalls}
            />
          )}
          {page === 'statistics' && (
            <StatisticsPage
              stats={stats}
              loading={statsLoading}
              error={statsError}
              calls={calls}
            />
          )}
        </main>
      </div>
    </div>
  );
}
