/**
 * Centralized API service for the Helpdesk Sentiment Analyzer frontend.
 * All fetch calls use relative paths — Vite proxies /api/* to Express on port 5001.
 */

const BASE = '/api';

function friendlyError(code) {
  const map = {
    transcript_required: 'Transcript is required and must not be blank.',
    invalid_source: 'Invalid input source specified.',
    invalid_json: 'Request payload was malformed.',
    invalid_sentiment_module_response:
      'The sentiment engine returned an unexpected result. Please try again.',
    internal_server_error: 'An unexpected server error occurred.',
  };
  return map[code] ?? `Server error: ${code}`;
}

async function handleResponse(res) {
  let body;
  try {
    body = await res.json();
  } catch {
    throw new Error(`HTTP ${res.status}: response was not valid JSON.`);
  }

  if (res.ok) return body;

  if (res.status === 400) throw new Error(friendlyError(body?.error));
  if (res.status === 502)
    throw new Error(friendlyError(body?.error ?? 'invalid_sentiment_module_response'));
  if (res.status === 503)
    throw new Error(
      'The database is currently unavailable. Please check the backend configuration.',
    );
  if (res.status === 500) throw new Error(friendlyError(body?.error ?? 'internal_server_error'));

  throw new Error(`Unexpected response: HTTP ${res.status}.`);
}

/**
 * GET /api/health
 * Returns { status, express, database }
 */
export async function fetchHealth() {
  try {
    const res = await fetch(`${BASE}/health`);
    return await handleResponse(res);
  } catch (err) {
    if (err instanceof TypeError) {
      // Network failure — backend unreachable
      return { status: 'error', express: 'unreachable', database: 'unknown' };
    }
    return { status: 'error', express: 'running', database: 'unavailable', detail: err.message };
  }
}

/**
 * GET /api/stats
 * Returns { total, positive, neutral, negative }
 */
export async function fetchStats() {
  const res = await fetch(`${BASE}/stats`);
  return handleResponse(res);
}

/**
 * GET /api/calls
 * Returns array of call records, newest first
 */
export async function fetchCalls() {
  const res = await fetch(`${BASE}/calls`);
  return handleResponse(res);
}

/**
 * POST /api/calls
 * @param {string} transcript
 * @param {'manual'|'microphone'} source
 * Returns the saved call record (HTTP 201)
 */
export async function submitCall(transcript, source) {
  const res = await fetch(`${BASE}/calls`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ transcript, source }),
  });
  return handleResponse(res);
}
