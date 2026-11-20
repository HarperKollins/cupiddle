import React, { useState } from 'react';
import {
  ArrowRight,
  Download,
  EyeOff,
  Lock,
  MapPin,
  Menu,
  PhoneOff,
  ShieldAlert,
  Smartphone,
  Sparkles,
  X,
} from 'lucide-react';
import { NIGERIAN_STATES } from '../constants/nigerianStates';

interface SunlitLandingPageProps {
  onOpenAuth: (
    preselectedState?: string,
    mode?: 'login' | 'register',
    preselectedCampus?: string
  ) => void;
  onOpenSuggestion?: () => void;
}

const DESIRE_MOODS = [
  {
    id: 'feeling_lonely',
    emoji: '🫠',
    label: 'Feeling lonely rn',
    handle: '@amaka_x',
    whisper: 'My room is too quiet tonight. Come distract me.',
  },
  {
    id: 'late_night',
    emoji: '🌙',
    label: 'Late night, bored',
    handle: '@zainab_v',
    whisper: 'Up past 2 AM. Tell me your unfiltered confession.',
  },
  {
    id: 'meet_someone',
    emoji: '🔥',
    label: 'Ready to meet someone',
    handle: '@kachi_m',
    whisper: 'No dry small talk. Pure tension and eye contact.',
  },
  {
    id: 'secret_mode',
    emoji: '😶‍🌫️',
    label: 'Secret mode — curious',
    handle: '@nnenna_s',
    whisper: 'Nobody knows your real name here. Let go.',
  },
] as const;

const MARQUEE_WHISPERS = [
  '🫠 Feeling lonely rn',
  '🌙 Late night, bored',
  '🔥 Ready to meet someone',
  '😶‍🌫️ Secret mode — curious',
  '⚡ Looking for my spark',
  '💭 Just want to talk',
];

const TornEdgeDivider: React.FC<{ flip?: boolean; fill?: string }> = ({
  flip = false,
  fill = '#0D080A',
}) => (
  <svg
    viewBox="0 0 1440 28"
    preserveAspectRatio="none"
    aria-hidden="true"
    style={{
      display: 'block',
      width: '100%',
      height: '22px',
      transform: flip ? 'scaleY(-1)' : undefined,
      pointerEvents: 'none',
    }}
  >
    <path
      d="M0,0 L1440,0 L1440,14 C1385,22 1330,8 1270,16 C1210,24 1150,10 1090,15 C1025,21 965,9 905,17 C845,25 785,11 720,16 C655,21 595,8 535,16 C475,24 415,10 355,17 C290,24 230,9 170,16 C110,23 55,11 0,18 Z"
      fill={fill}
    />
  </svg>
);

const PureCupiddleEmblem: React.FC = () => (
  <svg
    viewBox="0 0 460 300"
    aria-hidden="true"
    className="pure-emblem-float"
    style={{
      width: 'clamp(225px, 28vw, 340px)',
      height: 'auto',
      display: 'block',
      margin: '0 auto 8px',
      filter: 'drop-shadow(0 14px 32px rgba(13, 8, 10, 0.6))',
    }}
  >
    <g transform="translate(46, 148)">
      <g className="pure-starburst-spin">
        <polygon
          points="0,-32 7,-11 29,-20 15,-2 34,10 11,12 17,34 0,17 -17,34 -11,12 -34,10 -15,-2 -29,-20 -7,-11"
          fill="#FF1F6A"
          stroke="#0D080A"
          strokeWidth="4.5"
          strokeLinejoin="round"
        />
      </g>
    </g>

    <g transform="translate(414, 148)">
      <g className="pure-starburst-spin-reverse">
        <polygon
          points="0,-28 6,-9 25,-18 13,-2 30,9 9,11 15,30 0,15 -15,30 -9,11 -30,9 -13,-2 -25,-18 -6,-9"
          fill="#FF1F6A"
          stroke="#0D080A"
          strokeWidth="4.5"
          strokeLinejoin="round"
        />
      </g>
    </g>

    <g transform="translate(5, 5)" opacity="0.65">
      <path
        d="M150,24 C122,22 104,44 114,76 C92,98 84,132 102,162 C116,184 148,194 176,204 C166,232 172,262 194,282 C202,260 212,248 230,248 C248,248 258,260 266,282 C288,262 294,232 284,204 C312,194 344,184 358,162 C376,132 368,98 346,76 C356,44 338,22 310,24 C280,26 254,54 230,68 C206,54 180,26 150,24 Z"
        fill="#FF1F6A"
      />
    </g>

    <path
      d="M150,24 C122,22 104,44 114,76 C92,98 84,132 102,162 C116,184 148,194 176,204 C166,232 172,262 194,282 C202,260 212,248 230,248 C248,248 258,260 266,282 C288,262 294,232 284,204 C312,194 344,184 358,162 C376,132 368,98 346,76 C356,44 338,22 310,24 C280,26 254,54 230,68 C206,54 180,26 150,24 Z"
      fill="#0D080A"
    />

    <path
      d="M158,52 C140,52 134,74 146,90 C156,104 176,100 180,82 C184,64 174,52 158,52 Z"
      fill="#C80A32"
    />
    <path
      d="M302,52 C286,52 276,64 280,82 C284,100 304,104 314,90 C326,74 320,52 302,52 Z"
      fill="#C80A32"
    />

    <text
      x="230"
      y="148"
      textAnchor="middle"
      fill="#FFFFFF"
      fontFamily="'Plus Jakarta Sans', sans-serif"
      fontWeight="800"
      fontStyle="italic"
      fontSize="36"
      letterSpacing="2.5"
    >
      CUPIDDLE
    </text>

    <g transform="translate(230, 194)">
      <path d="M-26,0 Q0,-17 26,0 Q0,17 -26,0 Z" fill="#FF1F6A" />
      <circle cx="0" cy="0" r="7" fill="#0D080A" />
      <circle cx="-2" cy="-2" r="2.2" fill="#FFFFFF" />
    </g>
  </svg>
);

export const SunlitLandingPage: React.FC<SunlitLandingPageProps> = ({
  onOpenAuth,
  onOpenSuggestion,
}) => {
  const [selectedState, setSelectedState] = useState<string>('Lagos');
  const [selectedMood, setSelectedMood] = useState<string>('feeling_lonely');
  const [gateReply, setGateReply] = useState<string>('');
  const [installOs, setInstallOs] = useState<'android' | 'ios'>('android');
  const [shieldDemoActive, setShieldDemoActive] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const triggerInstallModal = () => {
    window.dispatchEvent(new CustomEvent('cupiddle:open-install'));
  };

  const activeMood =
    DESIRE_MOODS.find((m) => m.id === selectedMood) || DESIRE_MOODS[0];

  return (
    <div
      style={{
        backgroundColor: '#0D080A',
        color: '#FFFFFF',
        fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, -apple-system, sans-serif",
        minHeight: '100vh',
        overflowX: 'hidden',
        position: 'relative',
      }}
    >
      <style>{`
        .pure-burgundy-root * { box-sizing: border-box; }
        @keyframes pureSunburstSpin {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
        @keyframes pureEmblemFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-9px); }
        }
        @keyframes pureStarSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pureMarqueeScroll {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        @keyframes pureFadeRise {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0px); }
        }
        .pure-optical-hero {
          position: relative;
          background-color: #5E081E;
          overflow: hidden;
        }
        .pure-optical-rays {
          position: absolute;
          top: 42%;
          left: 50%;
          width: 220vmax;
          height: 220vmax;
          background-color: #5E081E;
          background-image:
            repeating-radial-gradient(
              circle at center,
              rgba(255, 31, 106, 0.44) 0px,
              rgba(255, 31, 106, 0.44) 18px,
              rgba(130, 10, 42, 0.0) 18px,
              rgba(130, 10, 42, 0.0) 36px
            ),
            repeating-conic-gradient(
              from 0deg at center,
              #4A0718 0deg 10deg,
              #C80A32 10deg 20deg,
              #7D0A28 20deg 30deg,
              #FF1F6A 30deg 40deg
            );
          background-blend-mode: hard-light, normal;
          animation: pureSunburstSpin 95s linear infinite;
          will-change: transform;
          pointer-events: none;
        }
        .pure-optical-vignette {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(circle at 50% 44%, rgba(74, 7, 24, 0.14) 0%, rgba(13, 8, 10, 0.64) 90%),
            linear-gradient(180deg, rgba(13, 8, 10, 0.18) 0%, rgba(74, 7, 24, 0.25) 60%, rgba(13, 8, 10, 0.56) 100%);
          pointer-events: none;
        }
        .pure-emblem-float {
          animation: pureEmblemFloat 5.5s cubic-bezier(0.37, 0, 0.63, 1) infinite;
          will-change: transform;
        }
        .pure-starburst-spin {
          animation: pureStarSpin 28s linear infinite;
          transform-box: fill-box;
          transform-origin: center;
        }
        .pure-starburst-spin-reverse {
          animation: pureStarSpin 34s linear infinite reverse;
          transform-box: fill-box;
          transform-origin: center;
        }
        .pure-marquee-wrap {
          overflow: hidden;
          width: 100%;
          mask-image: linear-gradient(to right, transparent, black 6%, black 94%, transparent);
          -webkit-mask-image: linear-gradient(to right, transparent, black 6%, black 94%, transparent);
        }
        .pure-marquee-track {
          display: inline-flex;
          gap: 12px;
          width: max-content;
          animation: pureMarqueeScroll 34s linear infinite;
          will-change: transform;
        }
        .pure-marquee-track:hover {
          animation-play-state: paused;
        }
        .pure-fade-rise {
          animation: pureFadeRise 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .pure-cta-white-3d {
          background-color: #FFFFFF;
          color: #0D080A;
          border: 2px solid #0D080A;
          box-shadow: 5px 5px 0px #0D080A, 7px 7px 0px #FFFFFF;
          transition: transform 0.16s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.16s ease, background-color 0.16s ease;
        }
        .pure-cta-white-3d:hover {
          background-color: #FFF3F6;
          transform: translate(-2px, -2px);
          box-shadow: 7px 7px 0px #0D080A, 9px 9px 0px #FF1F6A;
        }
        .pure-cta-white-3d:active {
          transform: translate(2px, 2px);
          box-shadow: 2px 2px 0px #0D080A;
        }
        .pure-cta-burgundy-3d {
          background-color: #4A0718;
          color: #FFFFFF;
          border: 2px solid #FFFFFF;
          box-shadow: 5px 5px 0px #0D080A;
          transition: transform 0.16s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.16s ease;
        }
        .pure-cta-burgundy-3d:hover {
          background-color: #7D0A28;
          transform: translate(-2px, -2px);
        }
        .pure-store-pill {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 8px 14px;
          border-radius: 7px;
          border: 1px solid rgba(255, 255, 255, 0.52);
          background-color: rgba(13, 8, 10, 0.9);
          color: #FFFFFF;
          font-size: 12px;
          font-weight: 700;
          white-space: nowrap;
          cursor: pointer;
          transition: border-color 0.16s ease, background-color 0.16s ease, transform 0.16s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .pure-store-pill:hover {
          border-color: #FF1F6A;
          background-color: #2A0812;
          transform: translateY(-1px);
        }
        .pure-obsidian-card {
          background-color: #160B0F;
          border: 1px solid rgba(255, 31, 106, 0.25);
          border-radius: 16px;
          overflow: hidden;
          transition: transform 0.22s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.22s ease;
        }
        .pure-obsidian-card:hover {
          transform: translateY(-4px);
          border-color: rgba(255, 31, 106, 0.65);
        }
        .pure-obsidian-card:hover .pure-card-photo {
          transform: scale(1.04);
        }
        .pure-card-photo {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.45s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .pure-serif {
          font-family: 'Playfair Display', Georgia, serif;
        }
        .pure-nav-link {
          color: #F5E6EA;
          font-size: 14px;
          font-weight: 600;
          text-decoration: none;
          white-space: nowrap;
          transition: color 0.15s ease;
        }
        .pure-nav-link:hover {
          color: #FF85AE;
        }
        @media (prefers-reduced-motion: reduce) {
          .pure-optical-rays,
          .pure-emblem-float,
          .pure-starburst-spin,
          .pure-starburst-spin-reverse,
          .pure-marquee-track,
          .pure-fade-rise {
            animation: none !important;
          }
        }
        @media (max-width: 900px) {
          .pure-desktop-only { display: none !important; }
          .pure-mobile-only { display: inline-flex !important; }
          .pure-mobile-drawer { display: flex !important; }
          .pure-grid-3 { grid-template-columns: 1fr !important; }
          .pure-footer-grid { grid-template-columns: 1fr !important; gap: 32px !important; }
        }
        @media (min-width: 901px) {
          .pure-mobile-only { display: none !important; }
          .pure-mobile-drawer { display: none !important; }
        }
      `}</style>

      {/* Anti-Screenshot Privacy Curtain Live Preview */}
      {shieldDemoActive && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Privacy Curtain Preview"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(13, 8, 10, 0.95)',
            backdropFilter: 'blur(26px)',
            WebkitBackdropFilter: 'blur(26px)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '24px',
          }}
        >
          <ShieldAlert size={52} color="#FF1F6A" style={{ marginBottom: '16px' }} />
          <h2 className="pure-serif" style={{ fontSize: 'clamp(24px, 3.5vw, 34px)', color: '#FFFFFF', margin: '0 0 10px' }}>
            Screen Locked. Zero Leaks.
          </h2>
          <p style={{ maxWidth: '400px', fontSize: '15px', color: '#E7D4D9', lineHeight: 1.5, margin: '0 0 24px' }}>
            Switch apps or hit PrintScreen and everything blurs instantly. Nobody keeps receipts.
          </p>
          <button
            type="button"
            onClick={() => setShieldDemoActive(false)}
            className="pure-cta-white-3d"
            style={{
              padding: '12px 26px',
              fontSize: '13px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.07em',
              cursor: 'pointer',
              minHeight: '44px',
            }}
          >
            Back to Page
          </button>
        </div>
      )}

      <div className="pure-burgundy-root">
        {/* 1. OBSIDIAN STICKY HEADER */}
        <header style={{ position: 'sticky', top: 0, zIndex: 60, backgroundColor: '#0D080A' }}>
          <div
            style={{
              maxWidth: '1320px',
              margin: '0 auto',
              padding: '12px clamp(16px, 3vw, 28px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '32px',
            }}
          >
            <a
              href="#top"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                textDecoration: 'none',
                color: '#FFFFFF',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  fontSize: '20px',
                  fontWeight: 800,
                  fontStyle: 'italic',
                  letterSpacing: '0.03em',
                  textTransform: 'uppercase',
                }}
              >
                Cupiddle App
              </span>
            </a>

            <nav
              aria-label="Primary navigation"
              className="pure-desktop-only"
              style={{ display: 'flex', alignItems: 'center', gap: '28px' }}
            >
              <a href="#cravings" className="pure-nav-link">
                Cravings
              </a>
              <a href="#cravings" className="pure-nav-link">
                Secret Moods
              </a>
              <a href="#cravings" className="pure-nav-link">
                Zero Traces
              </a>
              <a href="#mobile-install" className="pure-nav-link">
                Mobile App
              </a>
            </nav>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
              <button
                type="button"
                onClick={() => onOpenAuth(undefined, 'login')}
                className="pure-store-pill"
                style={{ backgroundColor: '#6E0D25', borderColor: '#FF1F6A' }}
              >
                <span>Sign In</span>
              </button>

              <button
                type="button"
                onClick={() => setMobileMenuOpen((prev) => !prev)}
                aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
                className="pure-mobile-only"
                style={{
                  background: 'none',
                  border: '1px solid rgba(255,255,255,0.35)',
                  borderRadius: '7px',
                  color: '#FFFFFF',
                  padding: '7px 9px',
                  cursor: 'pointer',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '36px',
                }}
              >
                {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </div>

          {mobileMenuOpen && (
            <div
              className="pure-mobile-drawer"
              style={{
                width: '100%',
                flexDirection: 'column',
                gap: '12px',
                padding: '12px 20px 18px',
                backgroundColor: '#160B0F',
                borderTop: '1px solid rgba(255,31,106,0.2)',
              }}
            >
              <a
                href="#cravings"
                onClick={() => setMobileMenuOpen(false)}
                style={{ color: '#FFFFFF', textDecoration: 'none', fontWeight: 600, fontSize: '15px' }}
              >
                Cravings &amp; Secret Moods
              </a>
              <a
                href="#mobile-install"
                onClick={() => setMobileMenuOpen(false)}
                style={{ color: '#FFFFFF', textDecoration: 'none', fontWeight: 600, fontSize: '15px' }}
              >
                Install App (Not on Play Store)
              </a>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  triggerInstallModal();
                }}
                className="pure-store-pill"
                style={{ alignSelf: 'flex-start' }}
              >
                <Download size={14} color="#FF1F6A" />
                <span>Install to Phone</span>
              </button>
            </div>
          )}

          <div style={{ position: 'absolute', left: 0, right: 0, bottom: '-20px', overflow: 'hidden' }}>
            <TornEdgeDivider fill="#0D080A" />
          </div>
        </header>

        {/* 2. HIGH-VOLTAGE PURE-INSPIRED BURGUNDY & LUST CRIMSON HERO */}
        <section
          id="top"
          className="pure-optical-hero"
          style={{
            padding: 'clamp(52px, 6.5vw, 84px) 20px clamp(68px, 8vw, 96px)',
            textAlign: 'center',
          }}
        >
          <div className="pure-optical-rays" aria-hidden="true" />
          <div className="pure-optical-vignette" aria-hidden="true" />

          <div style={{ position: 'relative', zIndex: 2, maxWidth: '1000px', margin: '0 auto' }}>
            <PureCupiddleEmblem />

            <p
              style={{
                fontSize: '13px',
                fontWeight: 700,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: '#FFD2E2',
                margin: '0 auto 10px',
              }}
            >
              Anonymous · No Real Names · Zero Phone Numbers
            </p>

            <h1
              className="pure-serif"
              style={{
                fontSize: 'clamp(32px, 4.9vw, 58px)',
                fontWeight: 500,
                lineHeight: 1.06,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: '#FFFFFF',
                margin: '0 auto 16px',
                maxWidth: '900px',
                textShadow: '0 4px 22px rgba(13, 8, 10, 0.65)',
                textWrap: 'balance',
              }}
            >
              <em style={{ fontStyle: 'italic', fontWeight: 600 }}>Bring Your Desires</em>{' '}
              <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800 }}>
                To Reality.
              </span>
            </h1>

            <p
              style={{
                fontSize: 'clamp(17px, 2vw, 21px)',
                fontWeight: 600,
                color: '#FFF3F6',
                maxWidth: '520px',
                margin: '0 auto 30px',
                lineHeight: 1.45,
                textShadow: '0 2px 12px rgba(13, 8, 10, 0.7)',
              }}
            >
              Are you lonely? Say what you actually want tonight. Nobody knows your name.
            </p>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '16px',
                flexWrap: 'wrap',
              }}
            >
              <button
                type="button"
                onClick={() => onOpenAuth(selectedState, 'register')}
                className="pure-cta-white-3d"
                style={{
                  padding: '15px 34px',
                  fontSize: '14px',
                  fontWeight: 800,
                  letterSpacing: '0.09em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  minHeight: '52px',
                  minWidth: '240px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                }}
              >
                <span>Enter Secretly</span>
                <ArrowRight size={17} />
              </button>

              <button
                type="button"
                onClick={triggerInstallModal}
                className="pure-cta-burgundy-3d"
                style={{
                  padding: '15px 28px',
                  fontSize: '14px',
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  minHeight: '52px',
                  minWidth: '240px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                <Smartphone size={17} color="#FF1F6A" />
                <span>Install Mobile App</span>
              </button>
            </div>
          </div>
        </section>

        {/* TORN EDGE SEAM */}
        <div style={{ marginTop: '-21px', position: 'relative', zIndex: 5 }}>
          <TornEdgeDivider flip fill="#0D080A" />
        </div>

        {/* 3. CONTINUOUS LATE-NIGHT MOOD MARQUEE */}
        <section
          aria-label="Live Moods Strip"
          style={{
            backgroundColor: '#0D080A',
            padding: '18px 0 8px',
            borderBottom: '1px solid rgba(255, 31, 106, 0.14)',
          }}
        >
          <div className="pure-marquee-wrap">
            <div className="pure-marquee-track">
              {[...MARQUEE_WHISPERS, ...MARQUEE_WHISPERS].map((mood, idx) => (
                <button
                  key={`${mood}-${idx}`}
                  type="button"
                  onClick={() => onOpenAuth(selectedState, 'register')}
                  className="pure-store-pill"
                  style={{
                    backgroundColor: '#160B0F',
                    borderColor: 'rgba(255, 31, 106, 0.28)',
                    fontSize: '13px',
                  }}
                >
                  <span>{mood}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* 4. VISUAL DESIRE SHOWCASE (SHOW, DON'T WRITE ESSAYS) */}
        <section
          id="cravings"
          style={{
            backgroundColor: '#0D080A',
            padding: '48px 24px 72px',
          }}
        >
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', maxWidth: '620px', margin: '0 auto 40px' }}>
              <h2
                className="pure-serif"
                style={{
                  fontSize: 'clamp(30px, 4vw, 46px)',
                  fontWeight: 600,
                  lineHeight: 1.1,
                  color: '#FFFFFF',
                  margin: '0 0 10px',
                  textWrap: 'balance',
                }}
              >
                No dry small talk. Only mutual heat.
              </h2>
              <p style={{ fontSize: '16px', color: '#D6BCC3', margin: 0 }}>
                Verified adults only. No fake paywalls.
              </p>
            </div>

            <div
              className="pure-grid-3"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                gap: '24px',
              }}
            >
              {/* Card 1: Midnight Satin Portrait + Instant Gate Whisper */}
              <div
                className="pure-obsidian-card"
                style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
              >
                <div>
                  <div style={{ position: 'relative', height: '270px', overflow: 'hidden', backgroundColor: '#2B0611' }}>
                    <img
                      src="/assets/images/desire_late_night_1795196440905.jpg"
                      alt="@amaka_x late at night"
                      referrerPolicy="no-referrer"
                      className="pure-card-photo"
                      style={{ objectPosition: 'center 22%' }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background:
                          'linear-gradient(to top, rgba(13,8,10,0.96) 0%, rgba(13,8,10,0.45) 48%, transparent 100%)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'flex-end',
                        padding: '18px',
                      }}
                    >
                      <span style={{ fontSize: '12px', color: '#FF85AE', fontWeight: 700 }}>
                        @amaka_x · 2:14 AM
                      </span>
                      <span style={{ fontSize: '20px', fontWeight: 700, color: '#FFFFFF' }}>
                        &ldquo;What keeps you up tonight?&rdquo;
                      </span>
                    </div>
                  </div>

                  <div style={{ padding: '18px 20px 6px' }}>
                    <label htmlFor="gate-preview-input" style={{ display: 'none' }}>
                      Whisper your answer
                    </label>
                    <input
                      id="gate-preview-input"
                      type="text"
                      value={gateReply}
                      onChange={(e) => setGateReply(e.target.value)}
                      placeholder="Whisper your answer..."
                      style={{
                        width: '100%',
                        padding: '11px 13px',
                        borderRadius: '8px',
                        border: '1px solid rgba(255, 31, 106, 0.35)',
                        backgroundColor: '#0D080A',
                        color: '#FFFFFF',
                        fontSize: '13px',
                      }}
                    />
                  </div>
                </div>

                <div style={{ padding: '12px 20px 20px' }}>
                  <button
                    type="button"
                    onClick={() => onOpenAuth(selectedState, 'register')}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      backgroundColor: '#6E0D25',
                      border: '1px solid #FF1F6A',
                      color: '#FFFFFF',
                      fontSize: '14px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      minHeight: '44px',
                    }}
                  >
                    <Sparkles size={15} color="#FF1F6A" />
                    <span>{gateReply.trim() ? 'Send Whisper' : 'Unlock Conversation'}</span>
                  </button>
                </div>
              </div>

              {/* Card 2: Silhouette Tension + Interactive Mood Picker */}
              <div
                className="pure-obsidian-card"
                style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
              >
                <div>
                  <div style={{ position: 'relative', height: '270px', overflow: 'hidden', backgroundColor: '#2B0611' }}>
                    <img
                      src="/assets/images/desire_tension_1795196442130.jpg"
                      alt="Late night tension in burgundy candlelight"
                      referrerPolicy="no-referrer"
                      className="pure-card-photo"
                    />
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background:
                          'linear-gradient(to top, rgba(13,8,10,0.96) 0%, rgba(13,8,10,0.45) 48%, transparent 100%)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'flex-end',
                        padding: '18px',
                      }}
                    >
                      <span style={{ fontSize: '12px', color: '#FF85AE', fontWeight: 700 }}>
                        {activeMood.emoji} {activeMood.handle}
                      </span>
                      <span
                        key={activeMood.id}
                        className="pure-fade-rise"
                        style={{ fontSize: '19px', fontWeight: 700, color: '#FFFFFF', lineHeight: 1.28 }}
                      >
                        &ldquo;{activeMood.whisper}&rdquo;
                      </span>
                    </div>
                  </div>

                  <div
                    style={{
                      padding: '16px 20px 6px',
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '6px',
                    }}
                  >
                    {DESIRE_MOODS.map((mood) => {
                      const active = selectedMood === mood.id;
                      return (
                        <button
                          key={mood.id}
                          type="button"
                          onClick={() => setSelectedMood(mood.id)}
                          style={{
                            padding: '6px 10px',
                            borderRadius: '7px',
                            backgroundColor: active ? '#C80A32' : '#241218',
                            border: active ? '1px solid #FF85AE' : '1px solid rgba(255,255,255,0.12)',
                            color: '#FFFFFF',
                            fontSize: '12px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {mood.emoji} {mood.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div style={{ padding: '12px 20px 20px' }}>
                  <button
                    type="button"
                    onClick={() => onOpenAuth(selectedState, 'register')}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      backgroundColor: '#FFFFFF',
                      color: '#0D080A',
                      fontSize: '14px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      minHeight: '44px',
                    }}
                  >
                    Match This Mood
                  </button>
                </div>
              </div>

              {/* Card 3: Secret Midnight Portrait + Discreet Protection */}
              <div
                className="pure-obsidian-card"
                style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
              >
                <div>
                  <div style={{ position: 'relative', height: '270px', overflow: 'hidden', backgroundColor: '#2B0611' }}>
                    <img
                      src="/assets/images/desire_secret_1795196442185.jpg"
                      alt="Discreet private profile"
                      referrerPolicy="no-referrer"
                      className="pure-card-photo"
                      style={{ objectPosition: 'center 18%' }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background:
                          'linear-gradient(to top, rgba(13,8,10,0.96) 0%, rgba(13,8,10,0.45) 48%, transparent 100%)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'flex-end',
                        padding: '18px',
                      }}
                    >
                      <span style={{ fontSize: '12px', color: '#FF85AE', fontWeight: 700 }}>
                        Zero Receipts · Zero Leaks
                      </span>
                      <span style={{ fontSize: '20px', fontWeight: 700, color: '#FFFFFF' }}>
                        What happens here stays dark.
                      </span>
                    </div>
                  </div>

                  <div
                    style={{
                      padding: '16px 20px 6px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '9px',
                      fontSize: '13.5px',
                      color: '#E7D4D9',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                      <PhoneOff size={15} color="#FF1F6A" style={{ flexShrink: 0 }} />
                      <span>Zero phone numbers or WhatsApp leaks</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                      <EyeOff size={15} color="#FF1F6A" style={{ flexShrink: 0 }} />
                      <span>Screens blur on screenshot attempts</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                      <Lock size={15} color="#FF1F6A" style={{ flexShrink: 0 }} />
                      <span>No escorts. No tfare begging. Purely mutual</span>
                    </div>
                  </div>
                </div>

                <div style={{ padding: '12px 20px 20px' }}>
                  <button
                    type="button"
                    onClick={() => setShieldDemoActive(true)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      backgroundColor: '#241218',
                      border: '1px solid rgba(255, 31, 106, 0.5)',
                      color: '#FFFFFF',
                      fontSize: '14px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      minHeight: '44px',
                    }}
                  >
                    Test Privacy Blur
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. DIRECT MOBILE INSTALL + QUICK ENTRY BAND (BURGUNDY VELVET) */}
        <section
          id="mobile-install"
          style={{
            backgroundColor: '#4A0718',
            borderTop: '1px solid rgba(255, 31, 106, 0.28)',
            padding: '68px 24px 82px',
          }}
        >
          <div
            style={{
              maxWidth: '1120px',
              margin: '0 auto',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '44px',
              alignItems: 'center',
            }}
          >
            <div>
              <p
                style={{
                  fontSize: '13px',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: '#FF9EC0',
                  margin: '0 0 10px',
                }}
              >
                Not on Play Store or App Store
              </p>
              <h2
                className="pure-serif"
                style={{
                  fontSize: 'clamp(30px, 3.8vw, 44px)',
                  fontWeight: 600,
                  lineHeight: 1.1,
                  color: '#FFFFFF',
                  margin: '0 0 14px',
                  textWrap: 'balance',
                }}
              >
                Discreet on your phone in 10 seconds.
              </h2>
              <p style={{ fontSize: '16px', lineHeight: 1.55, color: '#F5DCE3', margin: '0 0 24px' }}>
                Install straight from your browser. Lightweight, discreet, yours in seconds.
              </p>

              {/* State picker + Enter CTA inline */}
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                <label
                  htmlFor="pure-state-select"
                  style={{
                    position: 'absolute',
                    width: '1px',
                    height: '1px',
                    padding: 0,
                    margin: '-1px',
                    overflow: 'hidden',
                    clip: 'rect(0, 0, 0, 0)',
                    whiteSpace: 'nowrap',
                    border: 0,
                  }}
                >
                  Select location
                </label>
                <div style={{ position: 'relative', minWidth: '175px' }}>
                  <MapPin
                    size={15}
                    color="#FF1F6A"
                    style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      pointerEvents: 'none',
                    }}
                  />
                  <select
                    id="pure-state-select"
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '11px 14px 11px 34px',
                      borderRadius: '8px',
                      border: '1px solid rgba(255, 31, 106, 0.5)',
                      backgroundColor: '#0D080A',
                      color: '#FFFFFF',
                      fontSize: '14px',
                      fontWeight: 600,
                      minHeight: '46px',
                    }}
                  >
                    {NIGERIAN_STATES.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => onOpenAuth(selectedState, 'register')}
                  className="pure-cta-white-3d"
                  style={{
                    padding: '12px 24px',
                    fontSize: '13px',
                    fontWeight: 800,
                    letterSpacing: '0.07em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    minHeight: '46px',
                  }}
                >
                  Join Free in {selectedState}
                </button>
              </div>
            </div>

            <div
              style={{
                backgroundColor: '#0D080A',
                borderRadius: '16px',
                border: '1px solid rgba(255, 31, 106, 0.35)',
                padding: '24px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  flexWrap: 'wrap',
                  marginBottom: '18px',
                }}
              >
                <div
                  role="tablist"
                  aria-label="Mobile device platform"
                  style={{
                    display: 'inline-flex',
                    padding: '4px',
                    backgroundColor: '#241218',
                    borderRadius: '8px',
                  }}
                >
                  <button
                    type="button"
                    role="tab"
                    aria-selected={installOs === 'android'}
                    onClick={() => setInstallOs('android')}
                    style={{
                      padding: '7px 14px',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      backgroundColor: installOs === 'android' ? '#C80A32' : 'transparent',
                      color: '#FFFFFF',
                    }}
                  >
                    Android
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={installOs === 'ios'}
                    onClick={() => setInstallOs('ios')}
                    style={{
                      padding: '7px 14px',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      backgroundColor: installOs === 'ios' ? '#C80A32' : 'transparent',
                      color: '#FFFFFF',
                    }}
                  >
                    iPhone
                  </button>
                </div>

                <button type="button" onClick={triggerInstallModal} className="pure-store-pill">
                  <Download size={14} color="#FF1F6A" />
                  <span>Install Now</span>
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', color: '#E7D4D9' }}>
                {(installOs === 'android'
                  ? [
                      '1. Tap Install Now or Chrome menu',
                      '2. Tap "Add to Home screen"',
                      '3. Open full-screen with real-time alerts',
                    ]
                  : [
                      '1. Tap Safari Share button below',
                      '2. Select "Add to Home Screen"',
                      '3. Open full-screen. Under 2 MB.',
                    ]
                ).map((line) => (
                  <div
                    key={line}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '8px',
                      backgroundColor: '#160B0F',
                      fontWeight: 600,
                      color: '#FFFFFF',
                    }}
                  >
                    {line}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* TORN EDGE SEAM INTO FOOTER */}
        <div style={{ marginTop: '-21px', position: 'relative', zIndex: 5 }}>
          <TornEdgeDivider flip fill="#0D080A" />
        </div>

        {/* 6. OBSIDIAN FOOTER ADAPTED FROM PURE.APP */}
        <footer
          style={{
            backgroundColor: '#0D080A',
            padding: '52px 24px 36px',
            color: '#FFFFFF',
          }}
        >
          <div
            className="pure-footer-grid"
            style={{
              maxWidth: '1200px',
              margin: '0 auto',
              display: 'grid',
              gridTemplateColumns: '1.2fr 1fr 1fr',
              gap: '44px',
              alignItems: 'start',
            }}
          >
            <div>
              <h3 className="pure-serif" style={{ fontSize: '20px', fontWeight: 500, color: '#FFFFFF', margin: '0 0 14px' }}>
                Get the mobile app
              </h3>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '22px' }}>
                <button type="button" onClick={triggerInstallModal} className="pure-store-pill">
                  <Smartphone size={14} color="#FF1F6A" />
                  <span>iPhone Safari</span>
                </button>
                <button type="button" onClick={triggerInstallModal} className="pure-store-pill">
                  <Download size={14} color="#FF1F6A" />
                  <span>Android Chrome</span>
                </button>
              </div>

              <p style={{ fontSize: '13px', fontStyle: 'italic', color: '#A98D96', margin: 0 }}>
                &copy; 2026 Cupiddle · 18+ Private &amp; Anonymous.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '15px' }}>
              <a href="#cravings" style={{ color: '#F5E6EA', textDecoration: 'none' }}>
                Cravings
              </a>
              <a href="#cravings" style={{ color: '#F5E6EA', textDecoration: 'none' }}>
                Secret Moods
              </a>
              <a href="#mobile-install" style={{ color: '#F5E6EA', textDecoration: 'none' }}>
                Direct Mobile Install
              </a>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '15px' }}>
              <button
                type="button"
                onClick={() => onOpenAuth(undefined, 'login')}
                style={{
                  textAlign: 'left',
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  color: '#FF1F6A',
                  fontWeight: 700,
                  fontSize: '15px',
                  cursor: 'pointer',
                }}
              >
                Sign in with Email or @username
              </button>
              {onOpenSuggestion && (
                <button
                  type="button"
                  onClick={onOpenSuggestion}
                  style={{
                    textAlign: 'left',
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    color: '#F5E6EA',
                    fontSize: '15px',
                    cursor: 'pointer',
                  }}
                >
                  Suggest a feature
                </button>
              )}
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default SunlitLandingPage;
