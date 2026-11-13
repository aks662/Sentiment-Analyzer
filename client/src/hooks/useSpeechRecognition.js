import { useState, useRef, useEffect, useCallback } from 'react';

function getSpeechRecognitionAPI() {
  if (typeof window === 'undefined') return null;
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

export function isSpeechRecognitionSupported() {
  return Boolean(getSpeechRecognitionAPI());
}

const STATES = {
  READY: 'ready',
  REQUESTING: 'requesting',
  LISTENING: 'listening',
  PROCESSING: 'processing',
  STOPPED: 'stopped',
  ERROR: 'error',
};

const ERROR_MESSAGES = {
  'not-allowed':
    'Microphone access was denied. Please allow microphone permission in your browser settings and try again.',
  'service-not-allowed':
    'The browser speech service is not permitted. Try a different browser or allow the service in your settings.',
  'no-speech':
    'No speech was detected. Please try again and speak clearly into the microphone.',
  'audio-capture':
    'No microphone was detected. Please connect a microphone and try again.',
  network:
    'A network error interrupted speech recognition. Please check your connection and try again.',
  aborted: 'Recording was stopped.',
};

export function useSpeechRecognition() {
  const [status, setStatus] = useState(STATES.READY);
  const [transcript, setTranscript] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const recognitionRef = useRef(null);
  const mountedRef = useRef(true);
  const interimRef = useRef('');

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      stopRecognition();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function stopRecognition() {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Recognition may already be stopped
      }
      recognitionRef.current = null;
    }
  }

  const startRecording = useCallback(() => {
    const SpeechRecognitionAPI = getSpeechRecognitionAPI();
    if (!SpeechRecognitionAPI) return;
    if (recognitionRef.current) return; // already running

    if (!mountedRef.current) return;
    setStatus(STATES.REQUESTING);
    setErrorMessage('');

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      if (!mountedRef.current) return;
      setStatus(STATES.LISTENING);
    };

    recognition.onresult = (event) => {
      if (!mountedRef.current) return;
      let interim = '';
      let finalChunk = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalChunk += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }

      interimRef.current = interim;

      if (finalChunk) {
        setTranscript((prev) => {
          const separator = prev.trim().length > 0 ? ' ' : '';
          return prev + separator + finalChunk.trim();
        });
      }
    };

    recognition.onspeechstart = () => {
      if (!mountedRef.current) return;
      setStatus(STATES.LISTENING);
    };

    recognition.onspeechend = () => {
      if (!mountedRef.current) return;
      setStatus(STATES.PROCESSING);
    };

    recognition.onerror = (event) => {
      if (!mountedRef.current) return;
      const msg =
        ERROR_MESSAGES[event.error] ??
        `Speech recognition error: ${event.error}. Please try again.`;
      setErrorMessage(msg);
      setStatus(STATES.ERROR);
      recognitionRef.current = null;
    };

    recognition.onend = () => {
      if (!mountedRef.current) return;
      interimRef.current = '';
      // Only transition to stopped if not already in an error state
      setStatus((prev) => (prev === STATES.ERROR ? prev : STATES.STOPPED));
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch (err) {
      if (!mountedRef.current) return;
      setErrorMessage(`Could not start recording: ${err.message}`);
      setStatus(STATES.ERROR);
      recognitionRef.current = null;
    }
  }, []);

  const stopRecording = useCallback(() => {
    stopRecognition();
    if (!mountedRef.current) return;
    setStatus(STATES.STOPPED);
  }, []);

  const clearTranscript = useCallback(() => {
    setTranscript('');
    setErrorMessage('');
    setStatus(STATES.READY);
  }, []);

  const setTranscriptManually = useCallback((value) => {
    setTranscript(value);
  }, []);

  return {
    status,
    transcript,
    errorMessage,
    isListening: status === STATES.LISTENING,
    isProcessing: status === STATES.PROCESSING,
    isRequesting: status === STATES.REQUESTING,
    isStopped: status === STATES.STOPPED,
    hasError: status === STATES.ERROR,
    isReady: status === STATES.READY,
    isActive: status === STATES.LISTENING || status === STATES.PROCESSING,
    startRecording,
    stopRecording,
    clearTranscript,
    setTranscriptManually,
    STATES,
  };
}
