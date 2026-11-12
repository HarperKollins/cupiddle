import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, Compass, Gamepad2, Users, MapPin } from 'lucide-react';
import { NIGERIAN_STATES } from '../constants/nigerianStates';

interface SunlitLandingPageProps {
  onOpenAuth: (preselectedState?: string) => void;
}

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

export const SunlitLandingPage: React.FC<SunlitLandingPageProps> = ({ onOpenAuth }) => {
  const [activeNav, setActiveNav] = useState<'why' | 'stream' | 'sparks' | 'coop' | 'states'>('why');
  const [topicIndex, setTopicIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTopicIndex((prev) => (prev + 1) % ROTATING_CURIOSITIES.length);
    }, 2400);
    return () => clearInterval(timer);
  }, []);

  const handleStateClick = (state: string) => {
    onOpenAuth(state);
  };

  return (
    <div style={{ backgroundColor: 'var(--surface-page-canvas)', minHeight: '100vh', overflowX: 'hidden' }}>
      
      {/* 1. FLOATING BORDERLESS NAV OVER HONEY SECTION */}
      <header style={{
        backgroundColor: 'var(--color-bumble-honey)',
        padding: '20px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}>
        {/* Brand Wordmark */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: 'var(--radius-buttons)',
            backgroundColor: 'var(--color-bumble-ink)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Sparkles size={20} color="var(--color-bumble-honey)" />
          </div>
          <span style={{
            fontSize: '24px',
            fontWeight: 800,
            letterSpacing: '0.02em',
            color: 'var(--color-bumble-ink)',
          }}>
            Cupiddle
          </span>
        </div>

        {/* Center Nav Pills */}
        <nav className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <a
            href="#why"
            onClick={() => setActiveNav('why')}
            className="pill-interactive"
            style={{
              padding: '10px 20px',
              borderRadius: 'var(--radius-buttons)',
              backgroundColor: activeNav === 'why' ? 'var(--color-paper-white)' : 'transparent',
              color: 'var(--color-bumble-ink)',
              fontWeight: 700,
              fontSize: '15px',
              textDecoration: 'none',
              letterSpacing: '0.015em',
              boxShadow: activeNav === 'why' ? 'var(--shadow-sm)' : 'none',
            }}
          >
            Why Cupiddle
          </a>

          <a
            href="#ideastream"
            onClick={() => setActiveNav('stream')}
            className="pill-interactive"
            style={{
              padding: '10px 20px',
              borderRadius: 'var(--radius-buttons)',
              backgroundColor: activeNav === 'stream' ? 'var(--color-paper-white)' : 'transparent',
              color: 'var(--color-bumble-ink)',
              fontWeight: 700,
              fontSize: '15px',
              textDecoration: 'none',
              letterSpacing: '0.015em',
              boxShadow: activeNav === 'stream' ? 'var(--shadow-sm)' : 'none',
            }}
          >
            The Idea Stream
          </a>

          <a
            href="#sparks"
            onClick={() => setActiveNav('sparks')}
            className="pill-interactive"
            style={{
              padding: '10px 20px',
              borderRadius: 'var(--radius-buttons)',
              backgroundColor: activeNav === 'sparks' ? 'var(--color-paper-white)' : 'transparent',
              color: 'var(--color-bumble-ink)',
              fontWeight: 700,
              fontSize: '15px',
              textDecoration: 'none',
              letterSpacing: '0.015em',
              boxShadow: activeNav === 'sparks' ? 'var(--shadow-sm)' : 'none',
            }}
          >
            Sparks
          </a>

          <a
            href="#coop"
            onClick={() => setActiveNav('coop')}
            className="pill-interactive"
            style={{
              padding: '10px 20px',
              borderRadius: 'var(--radius-buttons)',
              backgroundColor: activeNav === 'coop' ? 'var(--color-paper-white)' : 'transparent',
              color: 'var(--color-bumble-ink)',
              fontWeight: 700,
              fontSize: '15px',
              textDecoration: 'none',
              letterSpacing: '0.015em',
              boxShadow: activeNav === 'coop' ? 'var(--shadow-sm)' : 'none',
            }}
          >
            Co-op Corner
          </a>

          <a
            href="#states"
            onClick={() => setActiveNav('states')}
            className="pill-interactive"
            style={{
              padding: '10px 20px',
              borderRadius: 'var(--radius-buttons)',
              backgroundColor: activeNav === 'states' ? 'var(--color-paper-white)' : 'transparent',
              color: 'var(--color-bumble-ink)',
              fontWeight: 700,
              fontSize: '15px',
              textDecoration: 'none',
              letterSpacing: '0.015em',
              boxShadow: activeNav === 'states' ? 'var(--shadow-sm)' : 'none',
            }}
          >
            All 36 States
          </a>
        </nav>

        {/* Action Button with Spring Physics */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => onOpenAuth()}
            className="btn-bumble-action"
            style={{
              backgroundColor: 'var(--color-bumble-ink)',
              color: 'var(--color-paper-white)',
              borderRadius: 'var(--radius-buttons)',
              padding: '14px 26px',
              fontSize: '16px',
              fontWeight: 700,
              letterSpacing: '0.016em',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            Sign In / Join
          </button>
        </div>
      </header>

      {/* 2. HERO SECTION — FULL-BLEED HONEY YELLOW (#ffdb5b) */}
      <section style={{
        backgroundColor: 'var(--color-bumble-honey)',
        padding: '60px 24px 100px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          
          {/* Top Dynamic Pill Tag with Animated Rotating Curiosities */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'var(--color-paper-white)', padding: '8px 20px', borderRadius: 'var(--radius-badges)', marginBottom: '24px', boxShadow: 'var(--shadow-sm)' }}>
            <Sparkles size={16} color="var(--color-bumble-ink)" className="animate-pulse-gentle" />
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

          {/* Massive Display Headline */}
          <h1 style={{
            fontSize: 'clamp(44px, 6vw, 76px)',
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: '0.015em',
            color: 'var(--color-bumble-ink)',
            maxWidth: '920px',
            margin: '0 auto 20px',
          }}>
            Curiosity is attractive.
          </h1>

          <p style={{
            fontSize: 'clamp(18px, 2.2vw, 22px)',
            color: 'var(--color-charcoal)',
            lineHeight: 1.45,
            maxWidth: '680px',
            margin: '0 auto 36px',
            letterSpacing: '0.012em',
          }}>
            Find someone worth getting lost in. Connect through obsessions, unexpected arguments, and ideas you're willing to defend.
          </p>

          {/* Primary Action Button with Spring Physics */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '48px' }}>
            <button
              onClick={() => onOpenAuth()}
              className="btn-bumble-action"
              style={{
                backgroundColor: 'var(--color-bumble-ink)',
                color: 'var(--color-paper-white)',
                borderRadius: 'var(--radius-buttons)',
                padding: '16px 36px',
                fontSize: '18px',
                fontWeight: 700,
                letterSpacing: '0.016em',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              Start Exploring Free <ArrowRight size={20} />
            </button>
          </div>

          {/* Continuous Infinite Marquee Ticker of Curiosities */}
          <div className="marquee-container" style={{ marginBottom: '56px' }}>
            <div className="marquee-track">
              {[...ROTATING_CURIOSITIES, ...ROTATING_CURIOSITIES].map((topic, i) => (
                <span
                  key={i}
                  className="pill-interactive"
                  onClick={() => onOpenAuth()}
                  style={{
                    backgroundColor: 'var(--color-paper-white)',
                    padding: '10px 22px',
                    borderRadius: 'var(--radius-badges)',
                    fontSize: '15px',
                    fontWeight: 700,
                    color: 'var(--color-bumble-ink)',
                    boxShadow: 'var(--shadow-sm)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    border: '1.5px solid var(--color-bumble-ink)',
                  }}
                >
                  💡 {topic}
                </span>
              ))}
            </div>
          </div>

          {/* TILTED PHONE MOCKUPS COLLAGE (SMOOTH FLOATING ANIMATIONS + INTERACTIVE HOVER STRAIGHTEN) */}
          <div style={{
            position: 'relative',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '24px',
            flexWrap: 'nowrap',
            paddingTop: '20px',
          }}>
            {/* Left Card: Tunde (Port Harcourt) — Smooth Float -7° Tilt */}
            <div
              className="interactive-card-hover animate-float-left"
              style={{
                width: '310px',
                backgroundColor: 'var(--color-paper-white)',
                borderRadius: 'var(--radius-cards)',
                boxShadow: 'var(--shadow-sm)',
                padding: '20px',
                textAlign: 'left',
                border: '1.5px solid var(--color-bumble-ink)',
              }}
            >
              <div style={{ position: 'relative', height: '220px', borderRadius: 'var(--radius-buttons)', overflow: 'hidden', marginBottom: '14px' }}>
                <img
                  src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80"
                  alt="Tunde"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <span
                  className="animate-pulse-gentle"
                  style={{
                    position: 'absolute',
                    top: '10px',
                    left: '10px',
                    backgroundColor: 'var(--color-paper-white)',
                    color: 'var(--color-bumble-ink)',
                    fontSize: '12px',
                    fontWeight: 700,
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-badges)',
                    border: '1px solid var(--color-bumble-ink)',
                  }}
                >
                  ✓ 100% Verified
                </span>
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 700 }}>Tunde, 28</h3>
              <p style={{ fontSize: '13px', color: 'var(--color-graphite)', marginBottom: '10px' }}>Port Harcourt • Filmmaker</p>
              <div style={{ backgroundColor: 'var(--color-mist)', padding: '10px 12px', borderRadius: 'var(--radius-buttons)' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-charcoal)', textTransform: 'uppercase' }}>
                  Defend This Take
                </span>
                <p style={{ fontSize: '13px', color: 'var(--color-bumble-ink)', marginTop: '2px', lineHeight: 1.4 }}>
                  "Streaming algorithms have flattened cinematic bravery."
                </p>
              </div>
            </div>

            {/* Center Card: Amina (Lagos) — Upright Elevated Float */}
            <div
              className="interactive-card-hover animate-float-center"
              style={{
                width: '330px',
                backgroundColor: 'var(--color-paper-white)',
                borderRadius: 'var(--radius-cards)',
                boxShadow: '0 8px 30px rgba(32,32,32,0.14)',
                padding: '24px',
                textAlign: 'left',
                zIndex: 10,
                border: '2.5px solid var(--color-bumble-ink)',
              }}
            >
              <div style={{ position: 'relative', height: '240px', borderRadius: 'var(--radius-buttons)', overflow: 'hidden', marginBottom: '14px' }}>
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80"
                  alt="Amina"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <span
                  className="animate-pulse-gentle"
                  style={{
                    position: 'absolute',
                    top: '10px',
                    left: '10px',
                    backgroundColor: 'var(--color-bumble-honey)',
                    color: 'var(--color-bumble-ink)',
                    fontSize: '12px',
                    fontWeight: 800,
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-badges)',
                    border: '1px solid var(--color-bumble-ink)',
                  }}
                >
                  ✓ Verified Mind
                </span>
              </div>
              <h3 style={{ fontSize: '22px', fontWeight: 800 }}>Amina, 24</h3>
              <p style={{ fontSize: '14px', color: 'var(--color-graphite)', marginBottom: '12px' }}>Lagos • ML Researcher</p>
              
              <div style={{ backgroundColor: 'var(--color-pollen)', padding: '12px', borderRadius: 'var(--radius-buttons)', marginBottom: '10px', border: '1px solid rgba(32, 32, 32, 0.08)' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-bumble-ink)', textTransform: 'uppercase' }}>
                  My Rabbit Hole
                </span>
                <p style={{ fontSize: '14px', color: 'var(--color-bumble-ink)', fontWeight: 600, marginTop: '2px' }}>
                  "Cellular automata and latent semantics in transformer geometry."
                </p>
              </div>

              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                <span style={{ backgroundColor: 'var(--color-mist)', padding: '4px 8px', borderRadius: 'var(--radius-badges)', fontSize: '11px', fontWeight: 600 }}>Dune</span>
                <span style={{ backgroundColor: 'var(--color-mist)', padding: '4px 8px', borderRadius: 'var(--radius-badges)', fontSize: '11px', fontWeight: 600 }}>Philosophy</span>
                <span style={{ backgroundColor: 'var(--color-mist)', padding: '4px 8px', borderRadius: 'var(--radius-badges)', fontSize: '11px', fontWeight: 600 }}>PyTorch</span>
              </div>
            </div>

            {/* Right Card: Chidi (Abuja) — Smooth Float +7° Tilt */}
            <div
              className="interactive-card-hover animate-float-right"
              style={{
                width: '310px',
                backgroundColor: 'var(--color-paper-white)',
                borderRadius: 'var(--radius-cards)',
                boxShadow: 'var(--shadow-sm)',
                padding: '20px',
                textAlign: 'left',
                border: '1.5px solid var(--color-bumble-ink)',
              }}
            >
              <div style={{ position: 'relative', height: '220px', borderRadius: 'var(--radius-buttons)', overflow: 'hidden', marginBottom: '14px' }}>
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80"
                  alt="Chidi"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <span
                  className="animate-pulse-gentle"
                  style={{
                    position: 'absolute',
                    top: '10px',
                    left: '10px',
                    backgroundColor: 'var(--color-paper-white)',
                    color: 'var(--color-bumble-ink)',
                    fontSize: '12px',
                    fontWeight: 700,
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-badges)',
                    border: '1px solid var(--color-bumble-ink)',
                  }}
                >
                  ✓ 100% Verified
                </span>
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 700 }}>Chidi, 27</h3>
              <p style={{ fontSize: '13px', color: 'var(--color-graphite)', marginBottom: '10px' }}>Abuja • Game Audio</p>
              <div style={{ backgroundColor: 'var(--color-mist)', padding: '10px 12px', borderRadius: 'var(--radius-buttons)' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-charcoal)', textTransform: 'uppercase' }}>
                  Teach Me Something
                </span>
                <p style={{ fontSize: '13px', color: 'var(--color-bumble-ink)', marginTop: '2px', lineHeight: 1.4 }}>
                  "How to create interactive tension in roguelikes using audio."
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 3. SECTION: THE CURIOSITY PHILOSOPHY (WHITE SECTION, 2-COLUMN FEATURE) */}
      <section id="why" style={{
        padding: '100px 24px',
        maxWidth: '1200px',
        margin: '0 auto',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '64px',
          alignItems: 'center',
        }}>
          {/* Lifestyle Image with 24px radius & subtle shadow */}
          <div
            className="editorial-card-lift"
            style={{
              borderRadius: 'var(--radius-cards)',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-sm)',
              height: '480px',
              border: '1.5px solid var(--color-bumble-ink)',
            }}
          >
            <img
              src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1000&q=80"
              alt="Curious discussion"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>

          {/* Copy Column */}
          <div>
            <span style={{
              display: 'inline-block',
              padding: '6px 14px',
              backgroundColor: 'var(--color-bumble-honey)',
              borderRadius: 'var(--radius-badges)',
              fontSize: '14px',
              fontWeight: 700,
              color: 'var(--color-bumble-ink)',
              marginBottom: '16px',
            }}>
              The Philosophy
            </span>
            <h2 style={{
              fontSize: 'clamp(32px, 3.5vw, 44px)',
              fontWeight: 700,
              lineHeight: 1.15,
              color: 'var(--color-bumble-ink)',
              marginBottom: '20px',
              letterSpacing: '0.015em',
            }}>
              There's more to you than your pictures.
            </h2>
            <p style={{
              fontSize: '17px',
              lineHeight: 1.6,
              color: 'var(--color-charcoal)',
              marginBottom: '20px',
              letterSpacing: '0.01em',
            }}>
              Conventional dating apps reduce people to flat photos and endless repetitive introductions that lead nowhere.
            </p>
            <p style={{
              fontSize: '17px',
              lineHeight: 1.6,
              color: 'var(--color-charcoal)',
              marginBottom: '32px',
              letterSpacing: '0.01em',
            }}>
              People don't fall in love because they have identical checklists. They connect because someone challenges their perspective, introduces them to a fascinating new rabbit hole, makes them laugh, or opens a conversation they never expected to have.
            </p>

            {/* Pill badges */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ padding: '8px 16px', backgroundColor: 'var(--color-mist)', borderRadius: 'var(--radius-badges)', fontSize: '14px', fontWeight: 600 }}>
                My Rabbit Hole
              </span>
              <span style={{ padding: '8px 16px', backgroundColor: 'var(--color-mist)', borderRadius: 'var(--radius-badges)', fontSize: '14px', fontWeight: 600 }}>
                Defend This Take
              </span>
              <span style={{ padding: '8px 16px', backgroundColor: 'var(--color-mist)', borderRadius: 'var(--radius-badges)', fontSize: '14px', fontWeight: 600 }}>
                Teach Me Something
              </span>
              <span style={{ padding: '8px 16px', backgroundColor: 'var(--color-mist)', borderRadius: 'var(--radius-badges)', fontSize: '14px', fontWeight: 600 }}>
                My World Tags
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SECTION: THE SPARK SYSTEM (POLLEN #fff386 FRAME) */}
      <section id="sparks" style={{
        padding: '0 24px 80px',
        maxWidth: '1200px',
        margin: '0 auto',
      }}>
        <div
          className="editorial-card-lift"
          style={{
            backgroundColor: 'var(--color-pollen)',
            borderRadius: 'var(--radius-cards)',
            padding: '56px 40px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '48px',
            alignItems: 'center',
            border: '1.5px solid var(--color-bumble-ink)',
          }}
        >
          <div>
            <span style={{
              backgroundColor: 'var(--color-paper-white)',
              padding: '6px 14px',
              borderRadius: 'var(--radius-badges)',
              fontSize: '14px',
              fontWeight: 700,
              display: 'inline-block',
              marginBottom: '16px',
              border: '1px solid var(--color-bumble-ink)',
            }}>
              The Signature Interaction
            </span>
            <h2 style={{
              fontSize: 'clamp(30px, 3.2vw, 40px)',
              fontWeight: 700,
              lineHeight: 1.15,
              color: 'var(--color-bumble-ink)',
              marginBottom: '18px',
            }}>
              Don't just say 'Hey'. Spark a real thought.
            </h2>
            <p style={{
              fontSize: '17px',
              lineHeight: 1.55,
              color: 'var(--color-charcoal)',
              marginBottom: '28px',
            }}>
              A Spark is not an empty swipe. When someone posts an obsession, a controversial opinion, or a piece of art they love, you respond directly to that specific statement. Senders start with substantive ideas, recipients gain immediate conversational context.
            </p>

            <button
              onClick={() => onOpenAuth()}
              className="btn-bumble-action"
              style={{
                backgroundColor: 'var(--color-bumble-ink)',
                color: 'var(--color-paper-white)',
                borderRadius: 'var(--radius-buttons)',
                padding: '14px 28px',
                fontSize: '16px',
                fontWeight: 700,
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              Experience The Spark System
            </button>
          </div>

          {/* Interactive Card Showing a Real Spark with Lift Animation */}
          <div
            className="editorial-card-lift"
            style={{
              backgroundColor: 'var(--color-paper-white)',
              borderRadius: 'var(--radius-cards)',
              padding: '28px',
              boxShadow: 'var(--shadow-sm)',
              border: '1.5px solid var(--color-bumble-ink)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <Sparkles size={20} color="var(--color-bumble-ink)" className="animate-pulse-gentle" />
              <span style={{ fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Incoming Spark
              </span>
            </div>

            <div style={{
              backgroundColor: 'var(--color-mist)',
              padding: '14px',
              borderRadius: 'var(--radius-buttons)',
              marginBottom: '14px',
              borderLeft: '4px solid var(--color-bumble-honey)',
              border: '1px solid rgba(32,32,32,0.08)',
            }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-graphite)' }}>
                Responding to: Defend This Take
              </span>
              <p style={{ fontSize: '14px', fontStyle: 'italic', marginTop: '4px', color: 'var(--color-bumble-ink)' }}>
                "Streaming algorithms have flattened cinematic bravery."
              </p>
            </div>

            <p style={{ fontSize: '15px', color: 'var(--color-bumble-ink)', lineHeight: 1.5, fontWeight: 500, marginBottom: '20px' }}>
              "I completely agree! Especially with mid-budget auteur features. Have you explored how 1970s West African cinema handled creative funding?"
            </p>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => onOpenAuth()}
                className="btn-bumble-action"
                style={{
                  backgroundColor: 'var(--color-bumble-ink)',
                  color: 'var(--color-paper-white)',
                  padding: '10px 22px',
                  borderRadius: 'var(--radius-badges)',
                  fontSize: '14px',
                  fontWeight: 700,
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                Accept & Match
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 5. SECTION: CO-OP CORNER & RABBIT HOLES (3-CARD EDITORIAL GRID) */}
      <section id="coop" style={{
        padding: '60px 24px 80px',
        maxWidth: '1200px',
        margin: '0 auto',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2 style={{ fontSize: '36px', fontWeight: 700, color: 'var(--color-bumble-ink)' }}>
            More Than Endless Chatting
          </h2>
          <p style={{ fontSize: '17px', color: 'var(--color-graphite)', marginTop: '8px' }}>
            Interactive features designed to create genuine connection.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px',
        }}>
          {/* Card 1: Co-op Corner */}
          <div
            className="editorial-card-lift"
            style={{
              backgroundColor: 'var(--color-mist)',
              borderRadius: 'var(--radius-cards)',
              padding: '32px',
              border: '1.5px solid var(--color-bumble-ink)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: 'var(--radius-buttons)',
              backgroundColor: 'var(--color-bumble-honey)',
              border: '1px solid var(--color-bumble-ink)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
            }}>
              <Gamepad2 size={24} color="var(--color-bumble-ink)" />
            </div>
            <h3 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '10px' }}>Co-op Corner</h3>
            <p style={{ fontSize: '15px', color: 'var(--color-charcoal)', lineHeight: 1.5 }}>
              Play asynchronous 2-player logic riddles, Would You Rather dilemmas, and Two Truths & A Lie together inside your conversation room.
            </p>
          </div>

          {/* Card 2: Rabbit Holes Communities */}
          <div
            className="editorial-card-lift"
            style={{
              backgroundColor: 'var(--color-mist)',
              borderRadius: 'var(--radius-cards)',
              padding: '32px',
              border: '1.5px solid var(--color-bumble-ink)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: 'var(--radius-buttons)',
              backgroundColor: 'var(--color-bumble-honey)',
              border: '1px solid var(--color-bumble-ink)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
            }}>
              <Users size={24} color="var(--color-bumble-ink)" />
            </div>
            <h3 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '10px' }}>Rabbit Holes</h3>
            <p style={{ fontSize: '15px', color: 'var(--color-charcoal)', lineHeight: 1.5 }}>
              Topic spaces for developers, researchers, book lovers, filmmakers, and gamers. Spark meaningful discussions and connect directly from community posts.
            </p>
          </div>

          {/* Card 3: RabbitHole Radar */}
          <div
            className="editorial-card-lift"
            style={{
              backgroundColor: 'var(--color-mist)',
              borderRadius: 'var(--radius-cards)',
              padding: '32px',
              border: '1.5px solid var(--color-bumble-ink)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: 'var(--radius-buttons)',
              backgroundColor: 'var(--color-bumble-honey)',
              border: '1px solid var(--color-bumble-ink)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
            }}>
              <Compass size={24} color="var(--color-bumble-ink)" />
            </div>
            <h3 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '10px' }}>RabbitHole Radar</h3>
            <p style={{ fontSize: '15px', color: 'var(--color-charcoal)', lineHeight: 1.5 }}>
              Automatic topic matching in chat that identifies shared passions and generates thought-provoking conversation starters for both participants.
            </p>
          </div>
        </div>
      </section>

      {/* 6. SECTION: NATIONWIDE NIGERIA — ALL 36 STATES + FCT (HONEY BAND) */}
      <section id="states" style={{
        backgroundColor: 'var(--color-bumble-honey)',
        padding: '80px 24px',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'var(--color-bumble-ink)', padding: '6px 16px', borderRadius: 'var(--radius-badges)', marginBottom: '20px' }}>
            <MapPin size={16} color="var(--color-bumble-honey)" />
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-paper-white)' }}>
              Nationwide Nigeria Discovery
            </span>
          </div>

          <h2 style={{
            fontSize: 'clamp(32px, 3.8vw, 48px)',
            fontWeight: 800,
            color: 'var(--color-bumble-ink)',
            marginBottom: '14px',
            letterSpacing: '0.015em',
          }}>
            Connecting Curious Minds Across All 36 States & Abuja
          </h2>

          <p style={{
            fontSize: '17px',
            color: 'var(--color-charcoal)',
            maxWidth: '680px',
            margin: '0 auto 40px',
            lineHeight: 1.5,
          }}>
            No artificial geographic silos. Whether you're in Lagos, Abuja, Ibadan, Port Harcourt, Enugu, or Kano — discover people who share your curiosity. Click your state to join:
          </p>

          {/* All 36 States + FCT Interactive Pill Grid with Tactile Spring Physics */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '10px',
            maxWidth: '1040px',
            margin: '0 auto 40px',
          }}>
            {NIGERIAN_STATES.map((state) => (
              <button
                key={state}
                onClick={() => handleStateClick(state)}
                className="pill-interactive"
                style={{
                  backgroundColor: 'var(--color-paper-white)',
                  color: 'var(--color-bumble-ink)',
                  border: '1.5px solid var(--color-bumble-ink)',
                  borderRadius: 'var(--radius-badges)',
                  padding: '10px 20px',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                {state}
              </button>
            ))}
          </div>

          <button
            onClick={() => onOpenAuth()}
            className="btn-bumble-action"
            style={{
              backgroundColor: 'var(--color-bumble-ink)',
              color: 'var(--color-paper-white)',
              borderRadius: 'var(--radius-buttons)',
              padding: '16px 36px',
              fontSize: '17px',
              fontWeight: 700,
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            Join Cupiddle Nationwide (100% Free)
          </button>
        </div>
      </section>

      {/* 7. UNHURRIED EDITORIAL FOOTER */}
      <footer style={{
        backgroundColor: 'var(--color-paper-white)',
        borderTop: '1px solid rgba(32,32,32,0.08)',
        padding: '60px 24px 40px',
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '40px',
          marginBottom: '40px',
        }}>
          <div>
            <h4 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '12px' }}>Cupiddle</h4>
            <p style={{ fontSize: '14px', color: 'var(--color-graphite)', lineHeight: 1.6 }}>
              Curiosity is attractive. The curiosity-first dating and social discovery platform for people who care about ideas.
            </p>
          </div>

          <div>
            <h5 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '12px' }}>Platform</h5>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px', color: 'var(--color-charcoal)' }}>
              <li>The Idea Stream</li>
              <li>The Spark System</li>
              <li>Co-op Corner Games</li>
              <li>Rabbit Holes Communities</li>
              <li>RabbitHole Radar</li>
            </ul>
          </div>

          <div>
            <h5 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '12px' }}>Trust & Safety</h5>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px', color: 'var(--color-charcoal)' }}>
              <li>Adults Only (18+)</li>
              <li>NDPA Compliant Privacy</li>
              <li>Approximate Distance Protection</li>
              <li>Community Guidelines</li>
              <li>Permanent Account Deletion</li>
            </ul>
          </div>

          <div>
            <h5 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '12px' }}>Get Started</h5>
            <p style={{ fontSize: '14px', color: 'var(--color-graphite)', marginBottom: '14px' }}>
              No app store download required. Runs instantly on your phone or desktop.
            </p>
            <button
              onClick={() => onOpenAuth()}
              style={{
                backgroundColor: 'var(--color-bumble-ink)',
                color: 'var(--color-paper-white)',
                padding: '10px 20px',
                borderRadius: 'var(--radius-buttons)',
                fontSize: '14px',
                fontWeight: 600,
              }}
            >
              Sign In Free
            </button>
          </div>
        </div>

        <div style={{
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
        }}>
          <span>© 2026 Cupiddle Inc. All rights reserved. Registered in Nigeria.</span>
          <span>100% Free • Curiosity is attractive.</span>
        </div>
      </footer>

    </div>
  );
};
