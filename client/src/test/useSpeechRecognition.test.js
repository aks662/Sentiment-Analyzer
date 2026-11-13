/**
 * useSpeechRecognition hook tests
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition.js';

// Mock SpeechRecognition
class MockSpeechRecognition {
  constructor() {
    this.continuous = false;
    this.interimResults = false;
    this.lang = '';
    this.maxAlternatives = 1;
    this.onstart  = null;
    this.onresult = null;
    this.onerror  = null;
    this.onend    = null;
    this.onspeechstart = null;
    this.onspeechend   = null;
  }
  start()  { if (this.onstart) this.onstart(); }
  stop()   { if (this.onend)   this.onend(); }
}

beforeEach(() => {
  window.SpeechRecognition = MockSpeechRecognition;
});

afterEach(() => {
  delete window.SpeechRecognition;
  vi.clearAllMocks();
});

describe('useSpeechRecognition', () => {
  it('starts in ready state', () => {
    const { result } = renderHook(() => useSpeechRecognition());
    expect(result.current.status).toBe('ready');
    expect(result.current.transcript).toBe('');
    expect(result.current.isReady).toBe(true);
  });

  it('transitions away from ready after startRecording', async () => {
    const { result } = renderHook(() => useSpeechRecognition());
    await act(async () => { result.current.startRecording(); });
    // Both requesting and listening are valid post-start states
    expect(['requesting', 'listening']).toContain(result.current.status);
  });

  it('transitions to stopped after stopRecording', async () => {
    const { result } = renderHook(() => useSpeechRecognition());
    await act(async () => { result.current.startRecording(); });
    await act(async () => { result.current.stopRecording(); });
    expect(result.current.status).toBe('stopped');
  });

  it('clearTranscript resets to ready state', async () => {
    const { result } = renderHook(() => useSpeechRecognition());
    await act(async () => { result.current.startRecording(); });
    await act(async () => { result.current.stopRecording(); });
    await act(async () => { result.current.clearTranscript(); });
    expect(result.current.status).toBe('ready');
    expect(result.current.transcript).toBe('');
  });

  it('setTranscriptManually updates transcript', async () => {
    const { result } = renderHook(() => useSpeechRecognition());
    await act(async () => { result.current.setTranscriptManually('Hello world'); });
    expect(result.current.transcript).toBe('Hello world');
  });

  it('does not change status on second startRecording call', async () => {
    const { result } = renderHook(() => useSpeechRecognition());
    await act(async () => { result.current.startRecording(); });
    const statusAfterFirst = result.current.status;
    // recognitionRef is now set, so second call is a no-op
    await act(async () => { result.current.startRecording(); });
    expect(result.current.status).toBe(statusAfterFirst);
  });
});
