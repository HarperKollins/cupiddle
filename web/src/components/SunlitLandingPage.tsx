import React, { useState, useEffect } from 'react';
import { NIGERIAN_STATES } from '../constants/nigerianStates';

// ============================================================================
// 1. INLINE SVG ICONS & BRAND ASSETS (Self-contained, fast, zero layout shift)
// ============================================================================

const CupiddleIcon: React.FC<{ size?: number; color?: string }> = ({ size = 20, color = '#202020' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill={color} fillOpacity="0.18" />
    <path d="M13 7l-3 5h4l-2 5" />
  </svg>
);

const CupiddleAppBadge: React.FC<{ size?: number }> = ({ size = 38 }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: `${Math.round(size * 0.3)}px`,
      background: '#202020',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 6px 16px rgba(32, 32, 32, 0.2)',
      flexShrink: 0,
    }}
  >
    <svg width={size * 0.58} height={size * 0.58} viewBox="0 0 24 24" fill="none">
      <path
        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
        fill="#ffdb5b"
      />
      <path d="M13.2 6.8L9.8 12h3.8l-1.8 5.2" stroke="#202020" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </div>
);

const ArrowRightIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const CompassIcon: React.FC<{ size?: number; color?: string }> = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
  </svg>
);

const Gamepad2Icon: React.FC<{ size?: number; color?: string }> = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
    <line x1="6" y1="11" x2="10" y2="11" />
    <line x1="8" y1="9" x2="8" y2="13" />
    <line x1="15" y1="12" x2="15.01" y2="12" />
    <line x1="18" y1="10" x2="18.01" y2="10" />
    <path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z" />
  </svg>
);

const UsersIcon: React.FC<{ size?: number; color?: string }> = ({ size = 24, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const MapPinIcon: React.FC<{ size?: number; color?: string }> = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const LightbulbIcon: React.FC<{ size?: number; color?: string }> = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
    <path d="M9 18h6" />
    <path d="M10 22h4" />
  </svg>
);

const SparklesIcon: React.FC<{ size?: number; color?: string }> = ({ size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
  </svg>
);

const DownloadIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

// ============================================================================
// 2. DATA CONSTANTS & AUTHENTIC NIGERIAN PORTRAITS
// ============================================================================

const ROTATING_CURIOSITIES = [
  'Quantum Telemetry & Physics',
  'West African Cinema & Nollywood',
  'Octavia Butler & Speculative Fiction',
  'Roguelike Mechanics & Game Audio',
  'Emergent AI & Latent Semantics',
  'Jollof Diplomacy & Food Culture',
  'Afrobeats Syncopation & Fela Kuti',
  'CRISPR Gene Editing Ethics',
  'Stoic Philosophy in Modern Tech',
  'Chess Tactics & Sicilian Defenses',
];

const NIGERIAN_PORTRAITS = {
  bgWoman1: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=800&q=85',
  bgMan1: 'https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?auto=format&fit=crop&w=800&q=85',
  bgWoman2: 'https://images.unsplash.com/photo-1589156280159-27698a70f29e?auto=format&fit=crop&w=800&q=85',
  bgMan2: 'https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?auto=format&fit=crop&w=800&q=85',

  tunde: 'https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?auto=format&fit=crop&w=700&q=85',
  amina: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=700&q=85',
  chidi: 'https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?auto=format&fit=crop&w=700&q=85',
  philosophyFeature: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=1000&q=85',
};

// Cascading & Floating Nigerian Faces Overlay Data
interface FloatingNigerianMind {
  id: string;
  name: string;
  age: number;
  city: string;
  role: string;
  take: string;
  badge: string;
  avatar: string;
  topPct: number; // Vertical position in hero %
  side: 'left' | 'right';
  offsetPx: number; // Distance from edge
  animClass: string;
  delay: string;
}

const FLOATING_NIGERIAN_FACES: FloatingNigerianMind[] = [
  {
    id: 'amina',
    name: 'Amina',
    age: 24,
    city: 'Lagos',
    role: 'ML Researcher',
    take: '"Cellular automata and latent transformer geometry."',
    badge: '💡 AI & Math',
    avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=300&q=80',
    topPct: 14,
    side: 'left',
    offsetPx: 32,
    animClass: 'animate-cascade-float-1',
    delay: '0s',
  },
  {
    id: 'tunde',
    name: 'Tunde',
    age: 28,
    city: 'Port Harcourt',
    role: 'Filmmaker',
    take: '"Streaming algorithms have flattened cinematic bravery."',
    badge: '🎬 Nollywood 35mm',
    avatar: 'https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?auto=format&fit=crop&w=300&q=80',
    topPct: 20,
    side: 'right',
    offsetPx: 36,
    animClass: 'animate-cascade-float-2',
    delay: '-3.2s',
  },
  {
    id: 'chidi',
    name: 'Chidi',
    age: 27,
    city: 'Abuja',
    role: 'Game Audio',
    take: '"Interactive audio tension builds true roguelike dread."',
    badge: '🎮 Game Audio',
    avatar: 'https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?auto=format&fit=crop&w=300&q=80',
    topPct: 48,
    side: 'left',
    offsetPx: 44,
    animClass: 'animate-cascade-float-3',
    delay: '-5.8s',
  },
  {
    id: 'folake',
    name: 'Folake',
    age: 23,
    city: 'Ibadan',
    role: 'Food Essayist',
    take: '"Hot akara + Agege bread beats any Victoria Island brunch."',
    badge: '🥪 Jollof Debate',
    avatar: 'https://images.unsplash.com/photo-1589156280159-27698a70f29e?auto=format&fit=crop&w=300&q=80',
    topPct: 56,
    side: 'right',
    offsetPx: 48,
    animClass: 'animate-cascade-float-1',
    delay: '-8.5s',
  },
  {
    id: 'kelechi',
    name: 'Kelechi',
    age: 26,
    city: 'Enugu',
    role: 'Composer',
    take: '"Fela Kuti jazz voicings in contemporary Afro-fusion."',
    badge: '🎵 Afrobeat Chords',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    topPct: 76,
    side: 'left',
    offsetPx: 38,
    animClass: 'animate-cascade-float-2',
    delay: '-11.2s',
  },
  {
    id: 'zainab',
    name: 'Zainab',
    age: 25,
    city: 'Kano',
    role: 'Architect',
    take: '"Traditional earth architecture in Mars habitat systems."',
    badge: '🏛️ Earth Architecture',
    avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=300&q=80',
    topPct: 82,
    side: 'right',
    offsetPx: 40,
    animClass: 'animate-cascade-float-3',
    delay: '-14s',
  },
];

// ============================================================================
// 3. MAIN SUNLIT LANDING PAGE COMPONENT
// ============================================================================

interface SunlitLandingPageProps {
  onOpenAuth: (preselectedState?: string, mode?: 'login' | 'register') => void;
  onOpenSuggestion?: () => void;
}

export const SunlitLandingPage: React.FC<SunlitLandingPageProps> = ({ onOpenAuth, onOpenSuggestion }) => {
  const [activeNav, setActiveNav] = useState<'why' | 'stream' | 'sparks' | 'coop' | 'states'>('why');
  const [topicIndex, setTopicIndex] = useState(0);
  const [activeHoverMind, setActiveHoverMind] = useState<FloatingNigerianMind | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setTopicIndex((prev) => (prev + 1) % ROTATING_CURIOSITIES.length);
    }, 2400);
    return () => clearInterval(timer);
  }, []);

  const handleStateClick = (state: string) => {
    onOpenAuth(state, 'register');
  };

  const handleSparkMind = (mind: FloatingNigerianMind) => {
    onOpenAuth(mind.city, 'register');
  };

  return (
    <div
      style={{
        '--surface-page-canvas': '#FFFDF7',
        '--color-bumble-honey': '#ffdb5b',
        '--color-pollen': '#fff386',
        '--color-bumble-ink': '#202020',
        '--color-charcoal': '#3A3A3A',
        '--color-graphite': '#666666',
        '--color-paper-white': '#FFFFFF',
        '--color-mist': '#F7F5F0',
        backgroundColor: '#FFFDF7',
        color: '#202020',
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif',
        minHeight: '100vh',
        overflowX: 'hidden',
        position: 'relative',
      } as React.CSSProperties}
    >
      {/* APPLE-STYLE TRANSLUCENCY, CASCADING MOTION & GLASSMORPHISM */}
      <style>{`
        * { box-sizing: border-box; }
        html { scroll-behavior: smooth; }

        .apple-glass-nav {
          background: rgba(255, 219, 91, 0.76);
          backdrop-filter: saturate(180%) blur(24px);
          -webkit-backdrop-filter: saturate(180%) blur(24px);
          border-bottom: 1px solid rgba(32, 32, 32, 0.08);
        }

        .apple-honey-glass-layer {
          background: linear-gradient(
            180deg,
            rgba(255, 219, 91, 0.82) 0%,
            rgba(255, 219, 91, 0.68) 50%,
            rgba(255, 219, 91, 0.86) 100%
          );
          backdrop-filter: saturate(175%) blur(22px);
          -webkit-backdrop-filter: saturate(175%) blur(22px);
        }

        .apple-card-frosted {
          background: rgba(255, 255, 255, 0.82);
          backdrop-filter: saturate(190%) blur(28px);
          -webkit-backdrop-filter: saturate(190%) blur(28px);
          border: 1.5px solid rgba(255, 255, 255, 0.95);
          box-shadow: 0 20px 45px rgba(32, 32, 32, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.9);
        }

        .apple-pill-frosted {
          background: rgba(255, 255, 255, 0.78);
          backdrop-filter: saturate(180%) blur(18px);
          -webkit-backdrop-filter: saturate(180%) blur(18px);
          border: 1px solid rgba(255, 255, 255, 0.92);
          box-shadow: 0 4px 16px rgba(32, 32, 32, 0.06);
        }

        .apple-pollen-glass {
          background: rgba(255, 243, 134, 0.78);
          backdrop-filter: saturate(180%) blur(24px);
          -webkit-backdrop-filter: saturate(180%) blur(24px);
          border: 1.5px solid rgba(255, 255, 255, 0.92);
          box-shadow: 0 20px 50px rgba(32, 32, 32, 0.08);
        }

        @keyframes slowDrift {
          0%, 100% { transform: scale(1.03) translate(0px, 0px); }
          50% { transform: scale(1.08) translate(-10px, 8px); }
        }

        .ambient-face-drift {
          animation: slowDrift 16s ease-in-out infinite;
        }

        /* Cascading & Floating Nigerian Faces Keyframes */
        @keyframes cascadeFloat1 {
          0%, 100% { transform: translateY(0px) rotate(0deg) scale(1); }
          50% { transform: translateY(-16px) rotate(2deg) scale(1.04); }
        }

        @keyframes cascadeFloat2 {
          0%, 100% { transform: translateY(0px) rotate(0deg) scale(1); }
          50% { transform: translateY(-22px) rotate(-2.5deg) scale(1.03); }
        }

        @keyframes cascadeFloat3 {
          0%, 100% { transform: translateY(0px) rotate(0deg) scale(1); }
          50% { transform: translateY(-14px) rotate(1.8deg) scale(1.04); }
        }

        .animate-cascade-float-1 { animation: cascadeFloat1 7s ease-in-out infinite; }
        .animate-cascade-float-2 { animation: cascadeFloat2 8.5s ease-in-out infinite; }
        .animate-cascade-float-3 { animation: cascadeFloat3 6.8s ease-in-out infinite; }

        .floating-face-node {
          position: absolute;
          z-index: 15;
          cursor: pointer;
          transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.3s ease;
        }
        .floating-face-node:hover {
          transform: scale(1.16) !important;
          z-index: 35 !important;
        }

        @keyframes floatLeft {
          0%, 100% { transform: rotate(-4deg) translateY(0px); }
          50% { transform: rotate(-3deg) translateY(-8px); }
        }

        @keyframes floatCenter {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        @keyframes floatRight {
          0%, 100% { transform: rotate(4deg) translateY(0px); }
          50% { transform: rotate(3deg) translateY(-8px); }
        }

        .animate-float-left { animation: floatLeft 6s ease-in-out infinite; }
        .animate-float-center { animation: floatCenter 5.5s ease-in-out infinite; }
        .animate-float-right { animation: floatRight 6.2s ease-in-out infinite; }

        .interactive-card-hover {
          transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.35s ease;
        }
        .interactive-card-hover:hover {
          transform: rotate(0deg) translateY(-10px) scale(1.02) !important;
          box-shadow: 0 28px 60px rgba(32, 32, 32, 0.18) !important;
          z-index: 20 !important;
        }

        .editorial-card-lift {
          transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.3s ease;
        }
        .editorial-card-lift:hover {
          transform: translateY(-5px);
        }

        .btn-bumble-action {
          transition: transform 0.2s cubic-bezier(0.22, 1, 0.36, 1), background-color 0.2s ease, box-shadow 0.2s ease;
        }
        .btn-bumble-action:hover {
          transform: scale(1.03);
          box-shadow: 0 8px 24px rgba(32, 32, 32, 0.24);
        }
        .btn-bumble-action:active {
          transform: scale(0.98);
        }

        .pill-interactive {
          transition: transform 0.2s cubic-bezier(0.22, 1, 0.36, 1), background-color 0.2s ease;
        }
        .pill-interactive:hover {
          transform: translateY(-2px);
          background-color: rgba(255, 255, 255, 0.95) !important;
        }

        @keyframes slideUpFade {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slideUpFade 0.35s ease-out;
        }

        .marquee-container {
          width: 100%;
          overflow: hidden;
          mask-image: linear-gradient(to right, transparent, black 8%, black 92%, transparent);
          -webkit-mask-image: linear-gradient(to right, transparent, black 8%, black 92%, transparent);
        }
        .marquee-track {
          display: flex;
          gap: 12px;
          width: max-content;
          animation: marqueeScroll 34s linear infinite;
        }
        .marquee-track:hover {
          animation-play-state: paused;
        }
        @keyframes marqueeScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        @media (max-width: 860px) {
          .desktop-nav { display: none !important; }
          .hero-faces-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .cascading-desktop-faces { display: none !important; }
          .cascading-mobile-ribbon { display: flex !important; }
        }
        @media (min-width: 861px) {
          .cascading-mobile-ribbon { display: none !important; }
        }
      `}</style>

      {/* 1. APPLE-STYLE FROSTED HONEY STICKY NAV */}
      <header
        className="apple-glass-nav"
        style={{
          padding: '14px clamp(16px, 4vw, 32px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}
      >
        <div
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
        >
          <CupiddleAppBadge size={38} />
          <span
            style={{
              fontSize: '24px',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              color: 'var(--color-bumble-ink)',
            }}
          >
            Cupiddle
          </span>
        </div>

        {/* Center Nav Pills */}
        <nav className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {[
            { id: 'why', href: '#why', label: 'Why Cupiddle' },
            { id: 'stream', href: '#ideastream', label: 'The Idea Stream' },
            { id: 'sparks', href: '#sparks', label: 'Sparks' },
            { id: 'coop', href: '#coop', label: 'Co-op Corner' },
            { id: 'states', href: '#states', label: 'All 36 States' },
          ].map((item) => (
            <a
              key={item.id}
              href={item.href}
              onClick={() => setActiveNav(item.id as any)}
              className="pill-interactive"
              style={{
                padding: '9px 18px',
                borderRadius: '999px',
                backgroundColor: activeNav === item.id ? 'rgba(255, 255, 255, 0.9)' : 'transparent',
                color: 'var(--color-bumble-ink)',
                fontWeight: 700,
                fontSize: '14px',
                textDecoration: 'none',
                letterSpacing: '0.01em',
                boxShadow: activeNav === item.id ? '0 2px 10px rgba(32,32,32,0.08)' : 'none',
              }}
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Install App Trigger */}
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('cupiddle:open-install'))}
            className="pill-interactive apple-pill-frosted"
            title="Install Cupiddle PWA to Home Screen"
            style={{
              color: 'var(--color-bumble-ink)',
              borderRadius: '999px',
              padding: '9px 16px',
              fontSize: '13px',
              fontWeight: 800,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              border: 'none',
            }}
          >
            <DownloadIcon size={14} />
            <span>Install</span>
          </button>

          {onOpenSuggestion && (
            <button
              onClick={onOpenSuggestion}
              className="pill-interactive apple-pill-frosted desktop-nav"
              style={{
                color: 'var(--color-bumble-ink)',
                borderRadius: '999px',
                padding: '9px 16px',
                fontSize: '13px',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                border: 'none',
              }}
            >
              <LightbulbIcon size={15} />
              <span>Suggestions</span>
            </button>
          )}

          <button
            onClick={() => onOpenAuth(undefined, 'login')}
            className="btn-bumble-action"
            style={{
              backgroundColor: 'var(--color-bumble-ink)',
              color: 'var(--color-paper-white)',
              borderRadius: '999px',
              padding: '10px 20px',
              fontSize: '14px',
              fontWeight: 700,
              letterSpacing: '0.01em',
              boxShadow: '0 6px 20px rgba(32,32,32,0.18)',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Sign In / Join
          </button>
        </div>
      </header>

      {/* 2. TRANSLUCENT HONEY HERO WITH CASCADING / FLOATING NIGERIAN FACES OVERLAY */}
      <section
        id="ideastream"
        style={{
          position: 'relative',
          overflow: 'hidden',
          minHeight: '860px',
        }}
      >
        {/* UNDERLAY LAYER: Background portraits of young Nigerians glowing through frosted amber glass */}
        <div
          aria-hidden="true"
          className="hero-faces-grid"
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 0,
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '12px',
            padding: '12px',
            backgroundColor: '#ffdb5b',
          }}
        >
          <div style={{ position: 'relative', height: '100%', borderRadius: '28px', overflow: 'hidden' }}>
            <img
              src={NIGERIAN_PORTRAITS.bgWoman1}
              alt=""
              className="ambient-face-drift"
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 20%', opacity: 0.76 }}
            />
          </div>
          <div style={{ position: 'relative', height: '100%', borderRadius: '28px', overflow: 'hidden' }}>
            <img
              src={NIGERIAN_PORTRAITS.bgMan1}
              alt=""
              className="ambient-face-drift"
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 20%', opacity: 0.72, animationDelay: '-4s' }}
            />
          </div>
          <div style={{ position: 'relative', height: '100%', borderRadius: '28px', overflow: 'hidden' }}>
            <img
              src={NIGERIAN_PORTRAITS.bgWoman2}
              alt=""
              className="ambient-face-drift"
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 25%', opacity: 0.76, animationDelay: '-8s' }}
            />
          </div>
          <div style={{ position: 'relative', height: '100%', borderRadius: '28px', overflow: 'hidden' }}>
            <img
              src={NIGERIAN_PORTRAITS.bgMan2}
              alt=""
              className="ambient-face-drift"
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 20%', opacity: 0.72, animationDelay: '-12s' }}
            />
          </div>
        </div>

        {/* CASCADING & FLOATING NIGERIAN FACES OVERLAY (DESKTOP / TABLET) */}
        <div
          className="cascading-desktop-faces"
          aria-hidden="false"
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 10,
            pointerEvents: 'none',
          }}
        >
          {FLOATING_NIGERIAN_FACES.map((mind) => {
            const isLeft = mind.side === 'left';
            return (
              <div
                key={mind.id}
                className={`floating-face-node ${mind.animClass}`}
                style={{
                  top: `${mind.topPct}%`,
                  left: isLeft ? `${mind.offsetPx}px` : undefined,
                  right: !isLeft ? `${mind.offsetPx}px` : undefined,
                  animationDelay: mind.delay,
                  pointerEvents: 'auto',
                }}
                onMouseEnter={() => setActiveHoverMind(mind)}
                onMouseLeave={() => setActiveHoverMind(null)}
                onClick={() => handleSparkMind(mind)}
                title={`Click to spark ${mind.name} from ${mind.city}`}
              >
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {/* Frosted Avatar Squircle */}
                  <div
                    style={{
                      width: '68px',
                      height: '68px',
                      borderRadius: '22px',
                      background: 'rgba(255, 255, 255, 0.85)',
                      backdropFilter: 'blur(16px)',
                      WebkitBackdropFilter: 'blur(16px)',
                      padding: '3px',
                      boxShadow: '0 14px 30px rgba(32, 32, 32, 0.22)',
                      border: '2px solid #ffffff',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    <img
                      src={mind.avatar}
                      alt={mind.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '18px' }}
                    />
                    {/* Active green status beacon */}
                    <span
                      style={{
                        position: 'absolute',
                        bottom: '2px',
                        right: '2px',
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        backgroundColor: '#10b981',
                        border: '2px solid #ffffff',
                        boxShadow: '0 0 8px rgba(16, 185, 129, 0.8)',
                      }}
                    />
                  </div>

                  {/* Attached Cute Frosted Tag Pill */}
                  <div
                    className="apple-pill-frosted"
                    style={{
                      padding: '6px 12px',
                      borderRadius: '999px',
                      fontSize: '12px',
                      fontWeight: 800,
                      color: 'var(--color-bumble-ink)',
                      whiteSpace: 'nowrap',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span>{mind.name}, {mind.age}</span>
                      <span style={{ fontSize: '10px', color: 'var(--color-graphite)', fontWeight: 600 }}>• {mind.city}</span>
                    </div>
                    <span style={{ fontSize: '11px', color: '#854d0e', fontWeight: 700 }}>
                      {mind.badge}
                    </span>
                  </div>
                </div>

                {/* Interactive Tooltip Card on Hover */}
                {activeHoverMind?.id === mind.id && (
                  <div
                    className="apple-card-frosted animate-slide-up"
                    style={{
                      position: 'absolute',
                      top: '76px',
                      left: isLeft ? '0px' : undefined,
                      right: !isLeft ? '0px' : undefined,
                      width: '260px',
                      padding: '14px',
                      borderRadius: '20px',
                      zIndex: 40,
                      boxShadow: '0 20px 40px rgba(32,32,32,0.25)',
                    }}
                  >
                    <span style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--color-graphite)' }}>
                      Defend This Take:
                    </span>
                    <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-bumble-ink)', margin: '4px 0 10px', lineHeight: 1.4 }}>
                      {mind.take}
                    </p>
                    <div
                      style={{
                        backgroundColor: 'var(--color-bumble-ink)',
                        color: 'var(--color-paper-white)',
                        borderRadius: '999px',
                        padding: '6px 12px',
                        fontSize: '11px',
                        fontWeight: 800,
                        textAlign: 'center',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px',
                      }}
                    >
                      <SparklesIcon size={12} color="#ffdb5b" /> Spark {mind.name}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* TRANSLUCENT HONEY GLASS OVERLAY (Apple iOS/macOS Vibrancy & Blur) */}
        <div
          className="apple-honey-glass-layer"
          style={{
            position: 'relative',
            zIndex: 1,
            padding: '64px 24px 104px',
          }}
        >
          <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
            {/* Top Dynamic Frosted Pill Tag */}
            <div
              className="apple-pill-frosted"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 22px',
                borderRadius: '999px',
                marginBottom: '26px',
              }}
            >
              <CupiddleIcon size={18} color="var(--color-bumble-ink)" />
              <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-bumble-ink)' }}>
                Sparks flying over:{' '}
                <strong
                  key={topicIndex}
                  className="animate-slide-up"
                  style={{
                    display: 'inline-block',
                    color: 'var(--color-bumble-ink)',
                    minWidth: '220px',
                    textAlign: 'left',
                  }}
                >
                  {ROTATING_CURIOSITIES[topicIndex]}
                </strong>
              </span>
            </div>

            {/* Massive Apple-Clean Display Headline */}
            <h1
              style={{
                fontSize: 'clamp(42px, 6vw, 76px)',
                fontWeight: 800,
                lineHeight: 1.05,
                letterSpacing: '-0.025em',
                color: 'var(--color-bumble-ink)',
                maxWidth: '920px',
                margin: '0 auto 20px',
                textShadow: '0 1px 0 rgba(255,255,255,0.45)',
              }}
            >
              Curiosity is attractive.
            </h1>

            <p
              style={{
                fontSize: 'clamp(17px, 2.2vw, 22px)',
                color: 'var(--color-bumble-ink)',
                fontWeight: 500,
                lineHeight: 1.48,
                maxWidth: '680px',
                margin: '0 auto 36px',
                letterSpacing: '-0.005em',
              }}
            >
              Find someone worth getting lost in. Connect through obsessions, unexpected arguments, and ideas you're willing to defend.
            </p>

            {/* Primary Action Button */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '36px' }}>
              <button
                onClick={() => onOpenAuth(undefined, 'register')}
                className="btn-bumble-action"
                style={{
                  backgroundColor: 'var(--color-bumble-ink)',
                  color: 'var(--color-paper-white)',
                  borderRadius: '999px',
                  padding: '17px 38px',
                  fontSize: '18px',
                  fontWeight: 700,
                  letterSpacing: '0.01em',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  boxShadow: '0 14px 30px rgba(32, 32, 32, 0.22)',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Start Exploring Free <ArrowRightIcon size={20} />
              </button>
            </div>

            {/* CASCADING MOBILE RIBBON: Horizontal cute floating bubbles for small phone screens */}
            <div
              className="cascading-mobile-ribbon"
              style={{
                display: 'none',
                overflowX: 'auto',
                padding: '10px 0 24px',
                gap: '12px',
                justifyContent: 'flex-start',
                scrollbarWidth: 'none',
                WebkitOverflowScrolling: 'touch',
              }}
            >
              {FLOATING_NIGERIAN_FACES.map((mind) => (
                <div
                  key={mind.id}
                  onClick={() => handleSparkMind(mind)}
                  className="apple-pill-frosted"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 14px',
                    borderRadius: '999px',
                    flexShrink: 0,
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ position: 'relative', width: '36px', height: '36px', borderRadius: '50%', overflow: 'hidden' }}>
                    <img src={mind.avatar} alt={mind.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--color-bumble-ink)' }}>
                      {mind.name} • {mind.city}
                    </div>
                    <div style={{ fontSize: '10px', fontWeight: 700, color: '#854d0e' }}>
                      {mind.badge}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Frosted Glass Marquee Ticker */}
            <div className="marquee-container" style={{ marginBottom: '56px' }}>
              <div className="marquee-track">
                {[...ROTATING_CURIOSITIES, ...ROTATING_CURIOSITIES].map((topic, i) => (
                  <span
                    key={i}
                    className="pill-interactive apple-pill-frosted"
                    onClick={() => onOpenAuth()}
                    style={{
                      padding: '10px 22px',
                      borderRadius: '999px',
                      fontSize: '14px',
                      fontWeight: 700,
                      color: 'var(--color-bumble-ink)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                    }}
                  >
                    <SparklesIcon size={14} /> {topic}
                  </span>
                ))}
              </div>
            </div>

            {/* FROSTED GLASS PROFILE CARDS COLLAGE — NIGERIAN MEMBERS */}
            <div
              style={{
                position: 'relative',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '24px',
                flexWrap: 'wrap',
                paddingTop: '12px',
                maxWidth: '100%',
              }}
            >
              {/* Left Card: Tunde (Port Harcourt) */}
              <div
                className="interactive-card-hover animate-float-left desktop-nav apple-card-frosted"
                style={{
                  width: '310px',
                  borderRadius: '28px',
                  padding: '18px',
                  textAlign: 'left',
                }}
              >
                <div style={{ position: 'relative', height: '230px', borderRadius: '20px', overflow: 'hidden', marginBottom: '14px' }}>
                  <img
                    src={NIGERIAN_PORTRAITS.tunde}
                    alt="Tunde, 28 from Port Harcourt"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 20%' }}
                  />
                  <span
                    className="apple-pill-frosted"
                    style={{
                      position: 'absolute',
                      top: '10px',
                      left: '10px',
                      color: 'var(--color-bumble-ink)',
                      fontSize: '12px',
                      fontWeight: 700,
                      padding: '5px 11px',
                      borderRadius: '999px',
                    }}
                  >
                    ✓ 100% Verified
                  </span>
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 2px', color: 'var(--color-bumble-ink)' }}>Tunde, 28</h3>
                <p style={{ fontSize: '13px', color: 'var(--color-graphite)', margin: '0 0 10px', fontWeight: 500 }}>Port Harcourt • Filmmaker</p>
                <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.72)', padding: '11px 13px', borderRadius: '16px', border: '1px solid rgba(32,32,32,0.06)' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-charcoal)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Defend This Take
                  </span>
                  <p style={{ fontSize: '13px', color: 'var(--color-bumble-ink)', margin: '3px 0 0', lineHeight: 1.4, fontWeight: 500 }}>
                    "Streaming algorithms have flattened cinematic bravery."
                  </p>
                </div>
              </div>

              {/* Center Card: Amina (Lagos) — Elevated Apple Frosted Card */}
              <div
                className="interactive-card-hover animate-float-center apple-card-frosted"
                style={{
                  width: '335px',
                  maxWidth: 'calc(100vw - 40px)',
                  background: 'rgba(255, 255, 255, 0.88)',
                  borderRadius: '30px',
                  boxShadow: '0 24px 60px rgba(32, 32, 32, 0.18), inset 0 1px 0 rgba(255, 255, 255, 1)',
                  padding: '22px',
                  textAlign: 'left',
                  zIndex: 10,
                }}
              >
                <div style={{ position: 'relative', height: '250px', borderRadius: '22px', overflow: 'hidden', marginBottom: '14px' }}>
                  <img
                    src={NIGERIAN_PORTRAITS.amina}
                    alt="Amina, 24 from Lagos"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 18%' }}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      top: '10px',
                      left: '10px',
                      backgroundColor: 'rgba(255, 219, 91, 0.92)',
                      backdropFilter: 'blur(12px)',
                      color: 'var(--color-bumble-ink)',
                      fontSize: '12px',
                      fontWeight: 800,
                      padding: '5px 12px',
                      borderRadius: '999px',
                      border: '1px solid rgba(255,255,255,0.8)',
                    }}
                  >
                    ✓ Verified Mind
                  </span>
                </div>
                <h3 style={{ fontSize: '22px', fontWeight: 800, margin: '0 0 2px', color: 'var(--color-bumble-ink)' }}>Amina, 24</h3>
                <p style={{ fontSize: '14px', color: 'var(--color-graphite)', margin: '0 0 12px', fontWeight: 500 }}>Lagos • ML Researcher</p>

                <div style={{ backgroundColor: 'rgba(255, 243, 134, 0.65)', padding: '12px 14px', borderRadius: '16px', marginBottom: '12px', border: '1px solid rgba(255, 219, 91, 0.7)' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-bumble-ink)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    My Rabbit Hole
                  </span>
                  <p style={{ fontSize: '14px', color: 'var(--color-bumble-ink)', fontWeight: 600, margin: '3px 0 0', lineHeight: 1.4 }}>
                    "Cellular automata and latent semantics in transformer geometry."
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  <span style={{ backgroundColor: 'rgba(32,32,32,0.06)', padding: '5px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 700 }}>Dune</span>
                  <span style={{ backgroundColor: 'rgba(32,32,32,0.06)', padding: '5px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 700 }}>Philosophy</span>
                  <span style={{ backgroundColor: 'rgba(32,32,32,0.06)', padding: '5px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 700 }}>PyTorch</span>
                </div>
              </div>

              {/* Right Card: Chidi (Abuja) */}
              <div
                className="interactive-card-hover animate-float-right desktop-nav apple-card-frosted"
                style={{
                  width: '310px',
                  borderRadius: '28px',
                  padding: '18px',
                  textAlign: 'left',
                }}
              >
                <div style={{ position: 'relative', height: '230px', borderRadius: '20px', overflow: 'hidden', marginBottom: '14px' }}>
                  <img
                    src={NIGERIAN_PORTRAITS.chidi}
                    alt="Chidi, 27 from Abuja"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 20%' }}
                  />
                  <span
                    className="apple-pill-frosted"
                    style={{
                      position: 'absolute',
                      top: '10px',
                      left: '10px',
                      color: 'var(--color-bumble-ink)',
                      fontSize: '12px',
                      fontWeight: 700,
                      padding: '5px 11px',
                      borderRadius: '999px',
                    }}
                  >
                    ✓ 100% Verified
                  </span>
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 2px', color: 'var(--color-bumble-ink)' }}>Chidi, 27</h3>
                <p style={{ fontSize: '13px', color: 'var(--color-graphite)', margin: '0 0 10px', fontWeight: 500 }}>Abuja • Game Audio</p>
                <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.72)', padding: '11px 13px', borderRadius: '16px', border: '1px solid rgba(32,32,32,0.06)' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-charcoal)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Teach Me Something
                  </span>
                  <p style={{ fontSize: '13px', color: 'var(--color-bumble-ink)', margin: '3px 0 0', lineHeight: 1.4, fontWeight: 500 }}>
                    "How to create interactive tension in roguelikes using audio."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SECTION: THE CURIOSITY PHILOSOPHY (2-COLUMN FEATURE WITH ZAINAB) */}
      <section
        id="why"
        style={{
          padding: '100px 24px',
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '64px',
            alignItems: 'center',
          }}
        >
          {/* Nigerian Lifestyle Portrait with Apple-style soft depth */}
          <div
            className="editorial-card-lift"
            style={{
              borderRadius: '32px',
              overflow: 'hidden',
              boxShadow: '0 24px 54px rgba(32, 32, 32, 0.12)',
              height: '490px',
              position: 'relative',
              border: '1px solid rgba(32, 32, 32, 0.08)',
            }}
          >
            <img
              src={NIGERIAN_PORTRAITS.philosophyFeature}
              alt="Zainab, young Nigerian woman smiling thoughtfully"
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 20%' }}
            />
            <div
              className="apple-pill-frosted"
              style={{
                position: 'absolute',
                bottom: '18px',
                left: '18px',
                right: '18px',
                padding: '12px 18px',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-bumble-ink)' }}>
                Zainab, 25 • Architect & Essayist
              </span>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-graphite)' }}>
                Lagos, NG
              </span>
            </div>
          </div>

          {/* Copy Column */}
          <div>
            <span
              style={{
                display: 'inline-block',
                padding: '7px 16px',
                backgroundColor: 'rgba(255, 219, 91, 0.85)',
                backdropFilter: 'blur(12px)',
                borderRadius: '999px',
                fontSize: '13px',
                fontWeight: 700,
                color: 'var(--color-bumble-ink)',
                marginBottom: '18px',
              }}
            >
              The Philosophy
            </span>
            <h2
              style={{
                fontSize: 'clamp(32px, 3.6vw, 46px)',
                fontWeight: 800,
                lineHeight: 1.12,
                color: 'var(--color-bumble-ink)',
                margin: '0 0 20px',
                letterSpacing: '-0.02em',
              }}
            >
              There's more to you than your pictures.
            </h2>
            <p
              style={{
                fontSize: '17px',
                lineHeight: 1.6,
                color: 'var(--color-charcoal)',
                margin: '0 0 20px',
              }}
            >
              Conventional dating apps reduce people to flat photos and endless repetitive introductions that lead nowhere.
            </p>
            <p
              style={{
                fontSize: '17px',
                lineHeight: 1.6,
                color: 'var(--color-charcoal)',
                margin: '0 0 32px',
              }}
            >
              People don't fall in love because they have identical checklists. They connect because someone challenges their perspective, introduces them to a fascinating new rabbit hole, makes them laugh, or opens a conversation they never expected to have.
            </p>

            {/* Pill badges */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {['My Rabbit Hole', 'Defend This Take', 'Teach Me Something', 'My World Tags'].map((tag) => (
                <span
                  key={tag}
                  style={{
                    padding: '9px 16px',
                    backgroundColor: 'rgba(32, 32, 32, 0.05)',
                    borderRadius: '999px',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: 'var(--color-bumble-ink)',
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4. SECTION: THE SPARK SYSTEM (FROSTED POLLEN GLASS FRAME) */}
      <section
        id="sparks"
        style={{
          padding: '0 24px 80px',
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        <div
          className="editorial-card-lift apple-pollen-glass"
          style={{
            borderRadius: '32px',
            padding: '56px 40px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '48px',
            alignItems: 'center',
          }}
        >
          <div>
            <span
              className="apple-pill-frosted"
              style={{
                padding: '6px 14px',
                borderRadius: '999px',
                fontSize: '13px',
                fontWeight: 700,
                display: 'inline-block',
                marginBottom: '16px',
              }}
            >
              The Signature Interaction
            </span>
            <h2
              style={{
                fontSize: 'clamp(30px, 3.2vw, 42px)',
                fontWeight: 800,
                lineHeight: 1.14,
                letterSpacing: '-0.02em',
                color: 'var(--color-bumble-ink)',
                margin: '0 0 18px',
              }}
            >
              Don't just say 'Hey'. Spark a real thought.
            </h2>
            <p
              style={{
                fontSize: '17px',
                lineHeight: 1.55,
                color: 'var(--color-charcoal)',
                margin: '0 0 28px',
              }}
            >
              A Spark is not an empty swipe. When someone posts an obsession, a controversial opinion, or a piece of art they love, you respond directly to that specific statement. Senders start with substantive ideas, recipients gain immediate conversational context.
            </p>

            <button
              onClick={() => onOpenAuth()}
              className="btn-bumble-action"
              style={{
                backgroundColor: 'var(--color-bumble-ink)',
                color: 'var(--color-paper-white)',
                borderRadius: '999px',
                padding: '15px 30px',
                fontSize: '16px',
                fontWeight: 700,
                boxShadow: '0 10px 24px rgba(32,32,32,0.16)',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Experience The Spark System
            </button>
          </div>

          {/* Interactive Frosted Card Showing a Real Spark */}
          <div
            className="editorial-card-lift apple-card-frosted"
            style={{
              borderRadius: '28px',
              padding: '28px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <CupiddleIcon size={20} color="var(--color-bumble-ink)" />
              <span style={{ fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Incoming Spark
              </span>
            </div>

            <div
              style={{
                backgroundColor: 'rgba(255, 219, 91, 0.28)',
                padding: '14px',
                borderRadius: '16px',
                marginBottom: '14px',
                borderLeft: '4px solid var(--color-bumble-honey)',
              }}
            >
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-graphite)' }}>
                Responding to: Defend This Take
              </span>
              <p style={{ fontSize: '14px', fontStyle: 'italic', margin: '4px 0 0', color: 'var(--color-bumble-ink)' }}>
                "Streaming algorithms have flattened cinematic bravery."
              </p>
            </div>

            <p style={{ fontSize: '15px', color: 'var(--color-bumble-ink)', lineHeight: 1.5, fontWeight: 500, margin: '0 0 20px' }}>
              "I completely agree! Especially with mid-budget auteur features. Have you explored how 1970s West African cinema handled creative funding?"
            </p>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => onOpenAuth(undefined, 'register')}
                className="btn-bumble-action"
                style={{
                  backgroundColor: 'var(--color-bumble-ink)',
                  color: 'var(--color-paper-white)',
                  padding: '11px 24px',
                  borderRadius: '999px',
                  fontSize: '14px',
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Accept & Match
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 5. SECTION: CO-OP CORNER & RABBIT HOLES (3-CARD FROSTED GRID) */}
      <section
        id="coop"
        style={{
          padding: '60px 24px 80px',
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2 style={{ fontSize: '36px', fontWeight: 800, letterSpacing: '-0.02em', margin: 0, color: 'var(--color-bumble-ink)' }}>
            More Than Endless Chatting
          </h2>
          <p style={{ fontSize: '17px', color: 'var(--color-graphite)', marginTop: '8px' }}>
            Interactive features designed to create genuine connection.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px',
          }}
        >
          {[
            {
              icon: <Gamepad2Icon size={24} color="var(--color-bumble-ink)" />,
              title: 'Co-op Corner',
              desc: 'Play asynchronous 2-player logic riddles, Would You Rather dilemmas, and Two Truths & A Lie together inside your conversation room.',
            },
            {
              icon: <UsersIcon size={24} color="var(--color-bumble-ink)" />,
              title: 'Rabbit Holes',
              desc: 'Topic spaces for developers, researchers, book lovers, filmmakers, and gamers. Spark meaningful discussions and connect directly from community posts.',
            },
            {
              icon: <CompassIcon size={24} color="var(--color-bumble-ink)" />,
              title: 'RabbitHole Radar',
              desc: 'Automatic topic matching in chat that identifies shared passions and generates thought-provoking conversation starters for both participants.',
            },
          ].map((card) => (
            <div
              key={card.title}
              className="editorial-card-lift"
              style={{
                backgroundColor: 'rgba(247, 245, 240, 0.85)',
                backdropFilter: 'blur(16px)',
                borderRadius: '28px',
                padding: '32px',
                border: '1px solid rgba(32, 32, 32, 0.08)',
                boxShadow: '0 10px 30px rgba(32, 32, 32, 0.04)',
              }}
            >
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '14px',
                  backgroundColor: 'var(--color-bumble-honey)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '18px',
                  boxShadow: '0 4px 12px rgba(255, 219, 91, 0.4)',
                }}
              >
                {card.icon}
              </div>
              <h3 style={{ fontSize: '22px', fontWeight: 800, margin: '0 0 10px', color: 'var(--color-bumble-ink)' }}>{card.title}</h3>
              <p style={{ fontSize: '15px', color: 'var(--color-charcoal)', lineHeight: 1.55, margin: 0 }}>
                {card.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 6. SECTION: NATIONWIDE NIGERIA — TRANSLUCENT HONEY BAND WITH NIGERIAN FACES */}
      <section
        id="states"
        style={{
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 0,
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            backgroundColor: '#ffdb5b',
          }}
        >
          <img
            src={NIGERIAN_PORTRAITS.bgWoman2}
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.5 }}
          />
          <img
            src={NIGERIAN_PORTRAITS.bgMan1}
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.5 }}
          />
        </div>

        <div
          className="apple-honey-glass-layer"
          style={{
            position: 'relative',
            zIndex: 1,
            padding: '84px 24px',
          }}
        >
          <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'var(--color-bumble-ink)', padding: '7px 18px', borderRadius: '999px', marginBottom: '20px' }}>
              <MapPinIcon size={16} color="var(--color-bumble-honey)" />
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-paper-white)' }}>
                Nationwide Nigeria Discovery
              </span>
            </div>

            <h2
              style={{
                fontSize: 'clamp(32px, 3.8vw, 48px)',
                fontWeight: 800,
                color: 'var(--color-bumble-ink)',
                margin: '0 0 14px',
                letterSpacing: '-0.02em',
              }}
            >
              Connecting Curious Minds Across All 36 States & Abuja
            </h2>

            <p
              style={{
                fontSize: '17px',
                color: 'var(--color-bumble-ink)',
                fontWeight: 500,
                maxWidth: '680px',
                margin: '0 auto 40px',
                lineHeight: 1.5,
              }}
            >
              No artificial geographic silos. Whether you're in Lagos, Abuja, Ibadan, Port Harcourt, Enugu, or Kano — discover people who share your curiosity. Click your state to join:
            </p>

            {/* All 36 States + FCT Frosted Interactive Pill Grid */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: '10px',
                maxWidth: '1040px',
                margin: '0 auto 40px',
              }}
            >
              {NIGERIAN_STATES.map((state) => (
                <button
                  key={state}
                  onClick={() => handleStateClick(state)}
                  className="pill-interactive apple-pill-frosted"
                  style={{
                    color: 'var(--color-bumble-ink)',
                    borderRadius: '999px',
                    padding: '10px 20px',
                    fontSize: '14px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {state}
                </button>
              ))}
            </div>

            <button
              onClick={() => onOpenAuth(undefined, 'register')}
              className="btn-bumble-action"
              style={{
                backgroundColor: 'var(--color-bumble-ink)',
                color: 'var(--color-paper-white)',
                borderRadius: '999px',
                padding: '17px 38px',
                fontSize: '17px',
                fontWeight: 700,
                boxShadow: '0 14px 30px rgba(32,32,32,0.2)',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Join Cupiddle Nationwide (100% Free)
            </button>
          </div>
        </div>
      </section>

      {/* 7. UNHURRIED EDITORIAL FOOTER */}
      <footer
        style={{
          backgroundColor: 'var(--color-paper-white)',
          borderTop: '1px solid rgba(32,32,32,0.08)',
          padding: '60px 24px 40px',
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '40px',
            marginBottom: '40px',
          }}
        >
          <div>
            <h4 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 12px' }}>Cupiddle</h4>
            <p style={{ fontSize: '14px', color: 'var(--color-graphite)', lineHeight: 1.6, margin: 0 }}>
              Curiosity is attractive. The curiosity-first dating and social discovery platform for people who care about ideas.
            </p>
          </div>

          <div>
            <h5 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 12px' }}>Platform</h5>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px', color: 'var(--color-charcoal)', padding: 0, margin: 0 }}>
              <li>The Idea Stream</li>
              <li>The Spark System</li>
              <li>Co-op Corner Games</li>
              <li>Rabbit Holes Communities</li>
              <li>RabbitHole Radar</li>
            </ul>
          </div>

          <div>
            <h5 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 12px' }}>Trust & Safety</h5>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px', color: 'var(--color-charcoal)', padding: 0, margin: 0 }}>
              <li>Adults Only (18+)</li>
              <li>NDPA Compliant Privacy</li>
              <li>Approximate Distance Protection</li>
              <li>Community Guidelines</li>
              <li>Permanent Account Deletion</li>
            </ul>
          </div>

          <div>
            <h5 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 12px' }}>Get Started</h5>
            <p style={{ fontSize: '14px', color: 'var(--color-graphite)', margin: '0 0 14px' }}>
              No app store download required. Runs instantly on your phone or desktop.
            </p>
            <button
              onClick={() => onOpenAuth(undefined, 'login')}
              style={{
                backgroundColor: 'var(--color-bumble-ink)',
                color: 'var(--color-paper-white)',
                padding: '10px 22px',
                borderRadius: '999px',
                fontSize: '14px',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Sign In Free
            </button>
          </div>
        </div>

        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            paddingTop: '20px',
            borderTop: '1px solid rgba(32,32,32,0.06)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            fontSize: '13px',
            color: 'var(--color-graphite)',
          }}
        >
          <span>© 2026 Cupiddle Inc. All rights reserved. Registered in Nigeria.</span>
          <span>100% Free • Curiosity is attractive.</span>
        </div>
      </footer>
    </div>
  );
};

export default SunlitLandingPage;
