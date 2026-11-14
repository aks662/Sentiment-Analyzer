/**
 * Unit tests for useAutoRefresh custom hook.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAutoRefresh } from '../hooks/useAutoRefresh.js';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('useAutoRefresh', () => {
  it('calls callback at specified interval', () => {
    const callback = vi.fn();
    renderHook(() => useAutoRefresh(callback, 1000));

    expect(callback).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1000);
    expect(callback).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(2000);
    expect(callback).toHaveBeenCalledTimes(3);
  });

  it('does not call callback when disabled', () => {
    const callback = vi.fn();
    renderHook(() => useAutoRefresh(callback, 1000, false));

    vi.advanceTimersByTime(5000);
    expect(callback).not.toHaveBeenCalled();
  });

  it('does not call callback when interval is 0', () => {
    const callback = vi.fn();
    renderHook(() => useAutoRefresh(callback, 0));

    vi.advanceTimersByTime(5000);
    expect(callback).not.toHaveBeenCalled();
  });

  it('cleans up interval on unmount', () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => useAutoRefresh(callback, 1000));

    vi.advanceTimersByTime(1000);
    expect(callback).toHaveBeenCalledTimes(1);

    unmount();
    vi.advanceTimersByTime(5000);
    expect(callback).toHaveBeenCalledTimes(1);
  });
});
