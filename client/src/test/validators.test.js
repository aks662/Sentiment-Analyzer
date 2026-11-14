/**
 * Unit tests for input validation helpers.
 */
import { describe, it, expect } from 'vitest';
import { validateTranscript, isValidSource } from '../utils/validators.js';

describe('validateTranscript', () => {
  it('rejects empty string', () => {
    const result = validateTranscript('');
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/empty/i);
  });

  it('rejects whitespace-only string', () => {
    const result = validateTranscript('   \n  \t  ');
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/empty/i);
  });

  it('rejects null', () => {
    const result = validateTranscript(null);
    expect(result.valid).toBe(false);
  });

  it('accepts normal transcript text', () => {
    const result = validateTranscript('Hello, I need help with my order.');
    expect(result.valid).toBe(true);
    expect(result.error).toBe('');
  });

  it('rejects transcript exceeding max characters', () => {
    const longText = 'Hello world. '.repeat(500);
    const result = validateTranscript(longText);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/maximum/i);
  });

  it('rejects transcript with only numbers and symbols', () => {
    const result = validateTranscript('12345 !!@#$');
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/readable text/i);
  });
});

describe('isValidSource', () => {
  it('accepts manual', () => {
    expect(isValidSource('manual')).toBe(true);
  });

  it('accepts microphone', () => {
    expect(isValidSource('microphone')).toBe(true);
  });

  it('rejects invalid source', () => {
    expect(isValidSource('phone')).toBe(false);
    expect(isValidSource('')).toBe(false);
    expect(isValidSource(null)).toBe(false);
  });
});
