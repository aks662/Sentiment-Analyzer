import React, { useState } from 'react';
import { submitCall } from '../services/api.js';
import SentimentResult from './SentimentResult.jsx';

const MAX_CHARS = 5000;

export default function TranscriptForm({ onSubmitSuccess }) {
  const [transcript, setTranscript]   = useState('');
  const [source, setSource]           = useState('manual');
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');
  const [validationMsg, setValidation] = useState('');
  const [result, setResult]           = useState(null);

  function validate() {
    if (!transcript.trim()) {
      setValidation('Transcript cannot be empty.');
      return false;
    }
    setValidation('');
    return true;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    if (loading) return; // prevent duplicate submissions

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const data = await submitCall(transcript.trim(), source);
      setResult(data);
      onSubmitSuccess && onSubmitSuccess();
    } catch (err) {
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleClear() {
    setTranscript('');
    setResult(null);
    setError('');
    setValidation('');
  }

  const charCount = transcript.length;
  const nearLimit = charCount > MAX_CHARS * 0.9;

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Analyze Call Transcript</h2>
      </div>

      <div className="card-body">
        <form onSubmit={handleSubmit} noValidate>
          {/* Transcript textarea */}
          <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
            <label className="form-label" htmlFor="transcript-input">
              Call Transcript
            </label>
            <textarea
              id="transcript-input"
              className="form-textarea"
              placeholder="Paste or type a customer-service call transcript here…"
              value={transcript}
              onChange={(e) => {
                setTranscript(e.target.value.slice(0, MAX_CHARS));
                if (validationMsg) setValidation('');
                if (result) setResult(null);
              }}
              aria-required="true"
              aria-describedby="char-count-hint transcript-validation"
              disabled={loading}
            />
            <div
              id="char-count-hint"
              className={`char-count${nearLimit ? ' char-count--warn' : ''}`}
              aria-live="polite"
            >
              {charCount} / {MAX_CHARS.toLocaleString()} characters
            </div>
          </div>

          {/* Validation */}
          {validationMsg && (
            <div
              id="transcript-validation"
              className="alert alert--error"
              role="alert"
              style={{ marginBottom: 'var(--space-4)' }}
            >
              <span className="alert-icon">⚠</span>
              <span>{validationMsg}</span>
            </div>
          )}

          {/* API error */}
          {error && (
            <div
              className="alert alert--error"
              role="alert"
              style={{ marginBottom: 'var(--space-4)' }}
            >
              <span className="alert-icon">✕</span>
              <div>
                <div className="alert-title">Analysis failed</div>
                <div>{error}</div>
              </div>
            </div>
          )}

          {/* Footer row */}
          <div className="form-footer">
            <div className="form-source">
              <label className="form-label" htmlFor="source-select" style={{ margin: 0 }}>
                Source:
              </label>
              <select
                id="source-select"
                className="form-select"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                disabled={loading}
              >
                <option value="manual">Manual</option>
                <option value="microphone">Microphone</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
              <button
                type="button"
                id="clear-transcript-btn"
                className="btn btn-secondary"
                onClick={handleClear}
                disabled={loading || (!transcript && !result && !error)}
              >
                Clear
              </button>
              <button
                type="submit"
                id="analyze-btn"
                className="btn btn-primary"
                disabled={loading || !transcript.trim()}
                aria-busy={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner" aria-hidden="true" />
                    Analyzing…
                  </>
                ) : (
                  '⬡ Analyze'
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Result */}
        {result && <SentimentResult result={result} />}
      </div>
    </div>
  );
}
