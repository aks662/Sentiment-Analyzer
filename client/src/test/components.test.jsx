/**
 * Frontend component tests — Vitest + React Testing Library
 * Tests for SentimentResult, SentimentBadge, StatCard, TranscriptForm, CallHistory
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// ─── Mock the API service ───────────────────────────────────────────────────
vi.mock('../services/api.js', () => ({
  submitCall: vi.fn(),
  fetchHealth: vi.fn(),
  fetchStats: vi.fn(),
  fetchCalls: vi.fn(),
}));

import { submitCall, fetchHealth, fetchStats, fetchCalls } from '../services/api.js';

// ─── Components under test ──────────────────────────────────────────────────
import SentimentBadge from '../components/SentimentBadge.jsx';
import StatCard from '../components/StatCard.jsx';
import SentimentResult from '../components/SentimentResult.jsx';
import TranscriptForm from '../components/TranscriptForm.jsx';
import CallHistory from '../components/CallHistory.jsx';
import App from '../App.jsx';

// ═══════════════════════════════════════════════════════════════════════════════
// SentimentBadge
// ═══════════════════════════════════════════════════════════════════════════════
describe('SentimentBadge', () => {
  it('renders positive badge', () => {
    render(<SentimentBadge sentiment="positive" />);
    expect(screen.getByText('positive')).toBeInTheDocument();
    expect(screen.getByLabelText('Sentiment: positive')).toBeInTheDocument();
  });

  it('renders negative badge', () => {
    render(<SentimentBadge sentiment="negative" />);
    expect(screen.getByText('negative')).toBeInTheDocument();
  });

  it('renders neutral badge', () => {
    render(<SentimentBadge sentiment="neutral" />);
    expect(screen.getByText('neutral')).toBeInTheDocument();
  });

  it('applies correct CSS class for each sentiment', () => {
    const { rerender } = render(<SentimentBadge sentiment="positive" />);
    expect(document.querySelector('.sentiment-badge--positive')).toBeTruthy();

    rerender(<SentimentBadge sentiment="negative" />);
    expect(document.querySelector('.sentiment-badge--negative')).toBeTruthy();

    rerender(<SentimentBadge sentiment="neutral" />);
    expect(document.querySelector('.sentiment-badge--neutral')).toBeTruthy();
  });

  it('returns null when no sentiment provided', () => {
    const { container } = render(<SentimentBadge sentiment={null} />);
    expect(container.firstChild).toBeNull();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// StatCard
// ═══════════════════════════════════════════════════════════════════════════════
describe('StatCard', () => {
  it('renders value and label', () => {
    render(<StatCard label="Total Calls" type="total" icon="📞" value={42} />);
    expect(screen.getByText('Total Calls')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    render(<StatCard label="Total Calls" type="total" icon="📞" loading={true} />);
    expect(screen.getByText('Loading…')).toBeInTheDocument();
  });

  it('shows unavailable on error', () => {
    render(<StatCard label="Total Calls" type="total" icon="📞" error="Network error" />);
    expect(screen.getByText('Unavailable')).toBeInTheDocument();
  });

  it('shows zero when value is 0', () => {
    render(<StatCard label="Positive" type="positive" icon="😊" value={0} />);
    expect(screen.getByText('0')).toBeInTheDocument();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// SentimentResult
// ═══════════════════════════════════════════════════════════════════════════════
describe('SentimentResult', () => {
  const positiveResult = {
    id: '1',
    transcript: 'The agent was helpful and excellent.',
    source: 'manual',
    sentiment: 'positive',
    score: 2,
    matched_terms: ['helpful', 'excellent'],
    created_at: '2026-11-13T10:00:00.000Z',
  };

  it('renders sentiment name and score', () => {
    render(<SentimentResult result={positiveResult} />);
    // 'positive' appears in both the sentiment name span and the badge - use getAllByText
    expect(screen.getAllByText('positive').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('+2')).toBeInTheDocument();
  });

  it('renders matched terms', () => {
    render(<SentimentResult result={positiveResult} />);
    expect(screen.getByText('helpful')).toBeInTheDocument();
    expect(screen.getByText('excellent')).toBeInTheDocument();
  });

  it('shows no-keywords message when matched_terms is empty', () => {
    render(<SentimentResult result={{ ...positiveResult, matched_terms: [] }} />);
    expect(screen.getByText('No sentiment keywords matched.')).toBeInTheDocument();
  });

  it('renders call ID and source', () => {
    render(<SentimentResult result={positiveResult} />);
    expect(screen.getByText('#1')).toBeInTheDocument();
    expect(screen.getByText('manual')).toBeInTheDocument();
  });

  it('renders negative score with minus sign', () => {
    render(<SentimentResult result={{ ...positiveResult, sentiment: 'negative', score: -3 }} />);
    expect(screen.getByText('-3')).toBeInTheDocument();
  });

  it('renders zero score without sign', () => {
    render(<SentimentResult result={{ ...positiveResult, sentiment: 'neutral', score: 0 }} />);
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('returns null when result is null', () => {
    const { container } = render(<SentimentResult result={null} />);
    expect(container.firstChild).toBeNull();
  });
});

describe('App history and statistics scope', () => {
  it('labels history and source counts as the latest 100 calls', async () => {
    fetchHealth.mockResolvedValue({ status: 'ok', express: 'running', database: 'connected' });
    fetchStats.mockResolvedValue({ total: 150, positive: 50, neutral: 50, negative: 50 });
    fetchCalls.mockResolvedValue([
      {
        id: '150', transcript: 'recent helpful call', source: 'manual', sentiment: 'positive',
        score: 1, matched_terms: ['helpful'], created_at: '2026-11-13T10:00:00Z',
      },
    ]);

    render(<App />);
    await userEvent.click(screen.getByRole('button', { name: 'Statistics' }));
    expect(await screen.findByText('Source Breakdown (latest 100 calls)')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Call History' }));
    expect(await screen.findByText('Latest calls, newest first. Click any row to expand details.')).toBeInTheDocument();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// TranscriptForm
// ═══════════════════════════════════════════════════════════════════════════════
describe('TranscriptForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders textarea and buttons', () => {
    render(<TranscriptForm />);
    expect(screen.getByRole('textbox', { name: /call transcript/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /analyze/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /clear/i })).toBeInTheDocument();
  });

  it('shows validation error for empty submit', async () => {
    render(<TranscriptForm />);
    // Fire submit on the form element directly — this exercises the validate() path
    const form = document.querySelector('form');
    fireEvent.submit(form);
    expect(await screen.findByText(/transcript cannot be empty/i)).toBeInTheDocument();
  });

  it('shows validation error for whitespace-only input', async () => {
    render(<TranscriptForm />);
    const textarea = screen.getByRole('textbox', { name: /call transcript/i });
    await userEvent.type(textarea, '   ');
    // Submit form directly — the button is disabled for whitespace but validate() handles it
    const form = document.querySelector('form');
    fireEvent.submit(form);
    expect(await screen.findByText(/transcript cannot be empty/i)).toBeInTheDocument();
  });

  it('calls submitCall with correct args on valid submit', async () => {
    submitCall.mockResolvedValueOnce({
      id: '5',
      transcript: 'Great service!',
      source: 'manual',
      sentiment: 'positive',
      score: 1,
      matched_terms: ['great'],
      created_at: '2026-11-13T10:00:00.000Z',
    });

    render(<TranscriptForm />);
    const textarea = screen.getByRole('textbox', { name: /call transcript/i });
    await userEvent.type(textarea, 'Great service!');
    fireEvent.click(screen.getByRole('button', { name: /analyze/i }));

    await waitFor(() => {
      expect(submitCall).toHaveBeenCalledWith('Great service!', 'manual');
    });
  });

  it('shows result after successful submission', async () => {
    submitCall.mockResolvedValueOnce({
      id: '5',
      transcript: 'Great service!',
      source: 'manual',
      sentiment: 'positive',
      score: 1,
      matched_terms: ['great'],
      created_at: '2026-11-13T10:00:00.000Z',
    });

    render(<TranscriptForm />);
    await userEvent.type(screen.getByRole('textbox', { name: /call transcript/i }), 'Great service!');
    fireEvent.click(screen.getByRole('button', { name: /analyze/i }));

    // Result panel appears with the polarity score
    expect(await screen.findByText('+1')).toBeInTheDocument();
    // The sentiment name appears in the result panel
    expect(await screen.findByText(/Polarity Score/i)).toBeInTheDocument();
    expect(await screen.findByText('great')).toBeInTheDocument();
  });

  it('shows error message on API failure', async () => {
    submitCall.mockRejectedValueOnce(new Error('The database is currently unavailable.'));

    render(<TranscriptForm />);
    await userEvent.type(
      screen.getByRole('textbox', { name: /call transcript/i }),
      'Some transcript.',
    );
    fireEvent.click(screen.getByRole('button', { name: /analyze/i }));

    expect(await screen.findByText(/database is currently unavailable/i)).toBeInTheDocument();
  });

  it('calls onSubmitSuccess after successful submission', async () => {
    const onSuccess = vi.fn();
    submitCall.mockResolvedValueOnce({
      id: '7',
      transcript: 'Test',
      source: 'manual',
      sentiment: 'neutral',
      score: 0,
      matched_terms: [],
      created_at: '2026-11-13T10:00:00.000Z',
    });

    render(<TranscriptForm onSubmitSuccess={onSuccess} />);
    await userEvent.type(screen.getByRole('textbox', { name: /call transcript/i }), 'Test');
    fireEvent.click(screen.getByRole('button', { name: /analyze/i }));

    await waitFor(() => expect(onSuccess).toHaveBeenCalledOnce());
  });

  it('clear button resets form', async () => {
    render(<TranscriptForm />);
    const textarea = screen.getByRole('textbox', { name: /call transcript/i });
    await userEvent.type(textarea, 'Some text');
    expect(textarea.value).toBe('Some text');
    fireEvent.click(screen.getByRole('button', { name: /clear/i }));
    expect(textarea.value).toBe('');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// CallHistory
// ═══════════════════════════════════════════════════════════════════════════════
describe('CallHistory', () => {
  const mockCalls = [
    {
      id: '2',
      transcript: 'Excellent support, very helpful agent.',
      source: 'manual',
      sentiment: 'positive',
      score: 2,
      matched_terms: ['excellent', 'helpful'],
      created_at: '2026-11-13T10:05:00.000Z',
    },
    {
      id: '1',
      transcript: 'The service was terrible.',
      source: 'microphone',
      sentiment: 'negative',
      score: -1,
      matched_terms: ['terrible'],
      created_at: '2026-11-13T09:50:00.000Z',
    },
  ];

  it('renders call records', () => {
    render(<CallHistory calls={mockCalls} loading={false} error="" onRefresh={vi.fn()} />);
    expect(screen.getByText('#2')).toBeInTheDocument();
    expect(screen.getByText('#1')).toBeInTheDocument();
  });

  it('renders loading state', () => {
    render(<CallHistory calls={null} loading={true} error="" onRefresh={vi.fn()} />);
    expect(screen.getByText(/loading call history/i)).toBeInTheDocument();
  });

  it('renders empty state when no calls', () => {
    render(<CallHistory calls={[]} loading={false} error="" onRefresh={vi.fn()} />);
    expect(screen.getByText(/no calls recorded yet/i)).toBeInTheDocument();
  });

  it('renders error state', () => {
    render(<CallHistory calls={null} loading={false} error="Network failed." onRefresh={vi.fn()} />);
    expect(screen.getByText(/could not load history/i)).toBeInTheDocument();
    expect(screen.getByText('Network failed.')).toBeInTheDocument();
  });

  it('shows transcript preview truncated', () => {
    const longCall = {
      ...mockCalls[0],
      transcript: 'A'.repeat(100),
    };
    render(<CallHistory calls={[longCall]} loading={false} error="" onRefresh={vi.fn()} />);
    expect(screen.getByText(/A{90}…/)).toBeInTheDocument();
  });

  it('expands details on click', async () => {
    render(<CallHistory calls={mockCalls} loading={false} error="" onRefresh={vi.fn()} />);
    // Click the first history-item-header div (it has role="button")
    const expandBtns = screen.getAllByRole('button');
    // expandBtns[0] = refresh, expandBtns[1] = first history row, expandBtns[2] = small expand arrow
    fireEvent.click(expandBtns[1]);
    expect(await screen.findByText('Full Transcript')).toBeInTheDocument();
  });

  it('calls onRefresh when button clicked', () => {
    const onRefresh = vi.fn();
    render(<CallHistory calls={[]} loading={false} error="" onRefresh={onRefresh} />);
    fireEvent.click(screen.getByLabelText(/refresh call history/i));
    expect(onRefresh).toHaveBeenCalledOnce();
  });
});
