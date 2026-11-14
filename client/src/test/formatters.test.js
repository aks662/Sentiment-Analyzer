/**
 * Unit tests for utility formatters.
 */
import { describe, it, expect } from 'vitest';
import { truncateText, formatScore, pctOf } from '../utils/formatters.js';

describe('truncateText', () => {
  it('returns original text when shorter than max', () => {
    expect(truncateText('Hello', 10)).toBe('Hello');
  });

  it('truncates and adds ellipsis when text exceeds max', () => {
    const long = 'A'.repeat(100);
    const result = truncateText(long, 50);
    expect(result).toHaveLength(51); // 50 chars + ellipsis character
    expect(result.endsWith('…')).toBe(true);
  });

  it('handles empty string', () => {
    expect(truncateText('')).toBe('');
  });

  it('handles null/undefined', () => {
    expect(truncateText(null)).toBe('');
    expect(truncateText(undefined)).toBe('');
  });

  it('uses default maxLen of 90', () => {
    const text = 'B'.repeat(95);
    const result = truncateText(text);
    expect(result).toHaveLength(91);
  });
});

describe('formatScore', () => {
  it('formats positive scores with + prefix', () => {
    expect(formatScore(5)).toBe('+5');
    expect(formatScore(1)).toBe('+1');
  });

  it('formats zero without prefix', () => {
    expect(formatScore(0)).toBe('0');
  });

  it('formats negative scores normally', () => {
    expect(formatScore(-3)).toBe('-3');
  });

  it('returns em-dash for null/undefined', () => {
    expect(formatScore(null)).toBe('—');
    expect(formatScore(undefined)).toBe('—');
  });
});

describe('pctOf', () => {
  it('calculates percentage correctly', () => {
    expect(pctOf(25, 100)).toBe(25);
    expect(pctOf(1, 3)).toBe(33);
  });

  it('returns 0 when total is 0', () => {
    expect(pctOf(5, 0)).toBe(0);
  });

  it('rounds to nearest integer', () => {
    expect(pctOf(1, 3)).toBe(33);
    expect(pctOf(2, 3)).toBe(67);
  });
});
