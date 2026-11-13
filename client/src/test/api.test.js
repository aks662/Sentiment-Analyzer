/**
 * API service unit tests — tests fetchHealth, fetchStats, fetchCalls, submitCall
 * Uses global fetch mock.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchHealth, fetchStats, fetchCalls, submitCall } from '../services/api.js';

// Helper to mock global fetch
function mockFetch(status, body) {
  global.fetch = vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  });
}

function mockFetchNetworkError() {
  global.fetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));
}

beforeEach(() => {
  vi.restoreAllMocks();
});

// ═══════════════════════════════════════════════════════════════════════════════
// fetchHealth
// ═══════════════════════════════════════════════════════════════════════════════
describe('fetchHealth', () => {
  it('returns health object on 200', async () => {
    mockFetch(200, { status: 'ok', express: 'running', database: 'connected' });
    const result = await fetchHealth();
    expect(result.status).toBe('ok');
    expect(result.database).toBe('connected');
  });

  it('returns error object on network failure', async () => {
    mockFetchNetworkError();
    const result = await fetchHealth();
    expect(result.status).toBe('error');
    expect(result.express).toBe('unreachable');
  });

  it('returns error on 503', async () => {
    mockFetch(503, { status: 'error', express: 'running', database: 'unavailable' });
    // fetchHealth doesn't throw on 503 (special case in api.js), returns the body
    const result = await fetchHealth();
    // The 503 path goes through handleResponse which throws, so fetchHealth catches and returns error shape
    expect(result.status).toBe('error');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// fetchStats
// ═══════════════════════════════════════════════════════════════════════════════
describe('fetchStats', () => {
  it('returns stats object on 200', async () => {
    mockFetch(200, { total: 10, positive: 5, neutral: 3, negative: 2 });
    const result = await fetchStats();
    expect(result.total).toBe(10);
    expect(result.positive).toBe(5);
  });

  it('throws on 500', async () => {
    mockFetch(500, { error: 'internal_server_error' });
    await expect(fetchStats()).rejects.toThrow(/unexpected server error/i);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// fetchCalls
// ═══════════════════════════════════════════════════════════════════════════════
describe('fetchCalls', () => {
  it('returns array on 200', async () => {
    const mockData = [
      { id: '1', transcript: 'Test', source: 'manual', sentiment: 'neutral', score: 0, matched_terms: [], created_at: '' },
    ];
    mockFetch(200, mockData);
    const result = await fetchCalls();
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });

  it('returns empty array when backend returns []', async () => {
    mockFetch(200, []);
    const result = await fetchCalls();
    expect(result).toEqual([]);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// submitCall
// ═══════════════════════════════════════════════════════════════════════════════
describe('submitCall', () => {
  it('POSTs correct payload and returns 201 body', async () => {
    const mockResponse = {
      id: '3',
      transcript: 'The agent was great.',
      source: 'manual',
      sentiment: 'positive',
      score: 1,
      matched_terms: ['great'],
      created_at: '2026-11-13T10:00:00.000Z',
    };
    mockFetch(201, mockResponse);

    const result = await submitCall('The agent was great.', 'manual');
    expect(result.id).toBe('3');
    expect(result.sentiment).toBe('positive');
    expect(global.fetch).toHaveBeenCalledWith('/api/calls', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ transcript: 'The agent was great.', source: 'manual' }),
    }));
  });

  it('throws friendly message on 400 transcript_required', async () => {
    mockFetch(400, { error: 'transcript_required' });
    await expect(submitCall('', 'manual')).rejects.toThrow(/transcript is required/i);
  });

  it('throws friendly message on 400 invalid_source', async () => {
    mockFetch(400, { error: 'invalid_source' });
    await expect(submitCall('some text', 'bad_source')).rejects.toThrow(/invalid input source/i);
  });

  it('throws on 502 from sentiment module', async () => {
    mockFetch(502, { error: 'invalid_sentiment_module_response' });
    await expect(submitCall('some text', 'manual')).rejects.toThrow(/sentiment engine/i);
  });

  it('throws on 503 database unavailable', async () => {
    mockFetch(503, { error: 'db_error' });
    await expect(submitCall('some text', 'manual')).rejects.toThrow(/database is currently unavailable/i);
  });

  it('throws on 500 internal server error', async () => {
    mockFetch(500, { error: 'internal_server_error' });
    await expect(submitCall('some text', 'manual')).rejects.toThrow(/unexpected server error/i);
  });
});
