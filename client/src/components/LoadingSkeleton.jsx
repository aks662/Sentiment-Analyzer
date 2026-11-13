import React from 'react';

/**
 * LoadingSkeleton — a placeholder shimmer component shown while data loads.
 * Supports different shapes via the `variant` prop.
 *
 * @param {{ variant: 'text'|'card'|'circle', width: string, height: string, count: number }} props
 */
export default function LoadingSkeleton({ variant = 'text', width, height, count = 1 }) {
  const baseClass = `skeleton skeleton--${variant}`;

  const style = {};
  if (width) style.width = width;
  if (height) style.height = height;

  return (
    <div className="skeleton-wrapper" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className={baseClass} style={style} />
      ))}
    </div>
  );
}
