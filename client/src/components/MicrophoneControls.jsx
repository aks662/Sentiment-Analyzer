import React, { useState } from 'react';
import { useSpeechRecognition, isSpeechRecognitionSupported } from '../hooks/useSpeechRecognition.js';
import { submitCall } from '../services/api.js';
import SentimentResult from './SentimentResult.jsx';

const STATUS_LABELS = {
  ready:      'Ready to record',
  requesting: 'Requesting microphone permission…',
  listening:  'Listening… speak now',
  processing: 'Processing speech…',
  stopped:    'Recording stopped',
  error:      'Recognition error',
};

export default function MicrophoneControls({ onSubmitSuccess }) {
  const speech = useSpeechRecognition();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [result, setResult] = useState(null);

  async function handleSubmit() {
    if (!speech.transcript.trim()) return;
    if (submitting) return;

    setSubmitting(true);
    setSubmitError('');
    setResult(null);

    try {
      const data = await submitCall(speech.transcript.trim(), 'microphone');
      setResult(data);
      onSubmitSuccess && onSubmitSuccess();
    } catch (err) {
      setSubmitError(err.message || 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  function handleClear() {
    speech.clearTranscript();
    setResult(null);
    setSubmitError('');
  }

  if (!isSpeechRecognitionSupported()) {
    return (
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Microphone Input</h2>
        </div>
        <div className="card-body">
          <div className="unsupported-banner" role="alert">
            <span style={{ fontSize: '20px' }}>🎙</span>
            <div>
              <strong>Speech recognition is not supported in this browser.</strong>
              <p style={{ marginTop: '6px', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-dim)' }}>
                Please use Google Chrome or Microsoft Edge for microphone input.
                Manual transcript entry in the Analyze Call section is fully available.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const statusLabel = STATUS_LABELS[speech.status] ?? speech.status;
  const canStart    = speech.isReady || speech.isStopped;
  const canStop     = speech.isActive || speech.isRequesting;

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Microphone Input</h2>
        {speech.isActive && (
          <span className="live-badge" aria-live="polite" aria-label="Recording active">
            <span aria-hidden="true">●</span> LIVE
          </span>
        )}
      </div>

      <div className="card-body">
        <div className="mic-section">

          {/* Privacy notice */}
          <div className="privacy-notice" role="note">
            <span aria-hidden="true">ⓘ</span>
            <span>
              Your browser's built-in speech recognition converts audio to text locally (or via
              the browser's speech service). No raw audio is uploaded. Use synthetic or demo
              conversations only — do not process real customer calls without consent.
            </span>
          </div>

          {/* Status bar */}
          <div
            className="mic-status-bar"
            role="status"
            aria-live="polite"
            aria-label={`Microphone status: ${statusLabel}`}
          >
            <span
              className={`mic-status-indicator mic-status-indicator--${speech.status}`}
              aria-hidden="true"
            />
            <span className="mic-status-text">{statusLabel}</span>
          </div>

          {/* Error from recognition */}
          {speech.hasError && speech.errorMessage && (
            <div className="alert alert--error" role="alert">
              <span className="alert-icon">🎙</span>
              <div>
                <div className="alert-title">Recording error</div>
                <div>{speech.errorMessage}</div>
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="mic-controls">
            <button
              id="start-recording-btn"
              className="btn btn-primary"
              onClick={speech.startRecording}
              disabled={!canStart || submitting}
              aria-pressed={speech.isActive}
            >
              🎙 Start Recording
            </button>

            <button
              id="stop-recording-btn"
              className="btn btn-recording"
              onClick={speech.stopRecording}
              disabled={!canStop}
            >
              ⏹ Stop Recording
            </button>

            <button
              id="clear-mic-transcript-btn"
              className="btn btn-secondary"
              onClick={handleClear}
              disabled={
                !speech.transcript && !result && !submitError && !speech.hasError
              }
            >
              Clear
            </button>
          </div>

          {/* Transcript area */}
          <div className="mic-transcript-area">
            <div className="mic-transcript-label-row">
              <label className="form-label" htmlFor="mic-transcript">
                Recognized Transcript
              </label>
              {speech.isActive && (
                <span className="live-badge" aria-hidden="true">
                  <span>●</span> Recording
                </span>
              )}
            </div>
            <textarea
              id="mic-transcript"
              className="form-textarea"
              value={speech.transcript}
              onChange={(e) => speech.setTranscriptManually(e.target.value)}
              placeholder={
                speech.isActive
                  ? 'Start speaking — recognized text will appear here…'
                  : 'Click Start Recording, then speak. The recognized text will appear here and can be edited before submission.'
              }
              disabled={speech.isActive || submitting}
              aria-label="Recognized speech transcript — editable"
              aria-describedby="mic-submit-hint"
            />
            <p
              id="mic-submit-hint"
              style={{
                fontSize: 'var(--font-size-xs)',
                color: 'var(--color-text-dim)',
                marginTop: '6px',
              }}
            >
              You can edit the transcript before submitting. Submission will not happen
              automatically when recording stops.
            </p>
          </div>

          {/* Submit error */}
          {submitError && (
            <div className="alert alert--error" role="alert">
              <span className="alert-icon">✕</span>
              <div>
                <div className="alert-title">Submission failed</div>
                <div>{submitError}</div>
              </div>
            </div>
          )}

          {/* Submit button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              id="submit-mic-btn"
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={!speech.transcript.trim() || speech.isActive || submitting}
              aria-busy={submitting}
            >
              {submitting ? (
                <>
                  <span className="spinner" aria-hidden="true" />
                  Analyzing…
                </>
              ) : (
                '⬡ Analyze Transcript'
              )}
            </button>
          </div>

          {/* Result */}
          {result && <SentimentResult result={result} />}
        </div>
      </div>
    </div>
  );
}
