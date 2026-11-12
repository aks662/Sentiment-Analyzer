/**
 * Application-wide constants for the Helpdesk Sentiment Analyzer.
 */

/** Maximum transcript length the UI will accept */
export const MAX_TRANSCRIPT_CHARS = 5000;

/** How many calls to show per page in history */
export const CALLS_PER_PAGE = 25;

/** Auto-refresh interval for dashboard stats (ms) */
export const STATS_REFRESH_INTERVAL = 30000;

/** Sentiment labels */
export const SENTIMENT = {
  POSITIVE: 'positive',
  NEUTRAL: 'neutral',
  NEGATIVE: 'negative',
};

/** Input source types */
export const SOURCE = {
  MANUAL: 'manual',
  MICROPHONE: 'microphone',
};

/** API error codes */
export const ERROR_CODES = {
  TRANSCRIPT_REQUIRED: 'transcript_required',
  INVALID_SOURCE: 'invalid_source',
  INVALID_JSON: 'invalid_json',
  INVALID_SENTIMENT: 'invalid_sentiment_module_response',
  INTERNAL: 'internal_server_error',
};
