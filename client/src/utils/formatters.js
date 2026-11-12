/**
 * Formatting helpers used across the dashboard UI.
 */

/**
 * Format an ISO date string into a human-readable locale string.
 * @param {string} isoString - ISO 8601 date string
 * @returns {string} Formatted date or em-dash for missing values
 */
export function formatDate(isoString) {
  if (!isoString) return '—';
  try {
    return new Date(isoString).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return '—';
  }
}

/**
 * Format a relative time string like "2 minutes ago", "just now".
 * @param {string} isoString - ISO 8601 date string
 * @returns {string} Relative time description
 */
export function formatRelativeTime(isoString) {
  if (!isoString) return '';
  const now = Date.now();
  const then = new Date(isoString).getTime();
  const diffSec = Math.floor((now - then) / 1000);

  if (diffSec < 60) return 'just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)} min ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  return formatDate(isoString);
}

/**
 * Truncate text to a maximum length, appending ellipsis.
 * @param {string} text
 * @param {number} maxLen
 * @returns {string}
 */
export function truncateText(text, maxLen = 90) {
  if (!text) return '';
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen) + '…';
}

/**
 * Format a sentiment score with sign prefix.
 * @param {number} score
 * @returns {string}
 */
export function formatScore(score) {
  if (score == null) return '—';
  return score > 0 ? `+${score}` : `${score}`;
}

/**
 * Calculate percentage, returning 0 if total is 0.
 * @param {number} part
 * @param {number} total
 * @returns {number}
 */
export function pctOf(part, total) {
  return total > 0 ? Math.round((part / total) * 100) : 0;
}
