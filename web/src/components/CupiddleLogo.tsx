import React from 'react';

interface CupiddleIconProps {
  size?: number;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Cupiddle's Official Brand Symbol:
 * Smooth crescent 'C' enclosing the 4-point spark and focal curiosity dot.
 */
export const CupiddleIcon: React.FC<CupiddleIconProps> = ({
  size = 24,
  color = 'currentColor',
  className = '',
  style = {},
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
    >
      {/* Crescent C */}
      <path
        d="M 64 22 C 34 22 18 36 18 50 C 18 64 34 78 64 78"
        stroke={color}
        strokeWidth="13"
        strokeLinecap="round"
      />

      {/* 4-Point Sparkle Star inside crescent */}
      <path
        d="M 66 42 Q 66 48 60 48 Q 66 48 66 54 Q 66 48 72 48 Q 66 48 66 42 Z"
        fill={color}
      />

      {/* Curiosity Dot below sparkle */}
      <circle cx="66" cy="62" r="3.2" fill={color} />
    </svg>
  );
};

/**
 * Cupiddle Official App Icon Badge (Squircle Dark Card + Honey Symbol)
 */
export const CupiddleAppBadge: React.FC<{ size?: number; style?: React.CSSProperties }> = ({
  size = 38,
  style = {},
}) => {
  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: `${Math.round(size * 0.28)}px`,
        backgroundColor: '#202020',
        border: '1.5px solid #202020',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        boxShadow: '0 2px 6px rgba(32, 32, 32, 0.15)',
        flexShrink: 0,
        ...style,
      }}
    >
      <img
        src="/cupiddle-icon.png"
        alt="Cupiddle"
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        onError={(e) => {
          // Fallback SVG if image fails
          e.currentTarget.style.display = 'none';
        }}
      />
    </div>
  );
};

/**
 * Cupiddle Full Wordmark + Tagline
 */
export const CupiddleWordmark: React.FC<{ height?: number; showTagline?: boolean }> = ({
  height = 36,
  showTagline = true,
}) => {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
      <CupiddleIcon size={height} color="#202020" />
      <div>
        <span
          style={{
            fontSize: `${Math.round(height * 0.72)}px`,
            fontWeight: 800,
            letterSpacing: '-0.03em',
            color: '#202020',
            lineHeight: 1,
            display: 'block',
          }}
        >
          cupiddle
        </span>
        {showTagline && (
          <span
            style={{
              fontSize: `${Math.max(10, Math.round(height * 0.32))}px`,
              color: '#575656',
              fontWeight: 600,
              letterSpacing: '0.01em',
              display: 'block',
              marginTop: '2px',
            }}
          >
            Curiosity is attractive.
          </span>
        )}
      </div>
    </div>
  );
};

