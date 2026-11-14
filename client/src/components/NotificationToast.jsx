import React, { useEffect, useState } from 'react';

/**
 * NotificationToast — shows a brief, auto-dismissing notification message.
 *
 * @param {{ message: string, type: 'success'|'error'|'info', duration: number, onDismiss: function }} props
 */
export default function NotificationToast({ message, type = 'info', duration = 4000, onDismiss }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!message) return;
    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
      onDismiss && onDismiss();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onDismiss]);

  if (!message || !visible) return null;

  const typeClass = `toast--${type}`;

  return (
    <div className={`toast ${typeClass}`} role="alert" aria-live="assertive">
      <span className="toast-message">{message}</span>
      <button
        className="toast-dismiss"
        onClick={() => { setVisible(false); onDismiss && onDismiss(); }}
        aria-label="Dismiss notification"
      >
        ✕
      </button>
    </div>
  );
}
