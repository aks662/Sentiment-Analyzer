/**
 * Input validation helpers for the transcript form.
 */
import { MAX_TRANSCRIPT_CHARS, SOURCE } from './constants.js';

/**
 * Validate a transcript string before submission.
 * @param {string} transcript
 * @returns {{ valid: boolean, error: string }}
 */
export function validateTranscript(transcript) {
  if (!transcript || !transcript.trim()) {
    return { valid: false, error: 'Transcript cannot be empty.' };
  }
  if (transcript.length > MAX_TRANSCRIPT_CHARS) {
    return {
      valid: false,
      error: `Transcript exceeds the maximum of ${MAX_TRANSCRIPT_CHARS.toLocaleString()} characters.`,
    };
  }
  // Check if transcript contains at least some alphabetic content
  if (!/[a-zA-Z]/.test(transcript)) {
    return {
      valid: false,
      error: 'Transcript must contain readable text.',
    };
  }
  return { valid: true, error: '' };
}

/**
 * Validate the source field.
 * @param {string} source
 * @returns {boolean}
 */
export function isValidSource(source) {
  return source === SOURCE.MANUAL || source === SOURCE.MICROPHONE;
}
