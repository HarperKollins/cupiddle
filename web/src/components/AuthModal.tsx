import React, { useState, useEffect } from 'react';
import { X, Sparkles, ShieldCheck, MapPin } from 'lucide-react';
import { api } from '../api';
import { NIGERIAN_STATES } from '../constants/nigerianStates';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialState?: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialState,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>('register');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [birthdate, setBirthdate] = useState('2000-01-01');
  const [gender, setGender] = useState('Woman');
  const [city, setCity] = useState(initialState || 'Lagos');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialState) {
      setCity(initialState);
      setMode('register');
    }
  }, [initialState]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        await api.login({ email, password });
      } else {
        // Client-side 18+ verification
        const dob = new Date(birthdate);
        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        const m = today.getMonth() - dob.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
          age--;
        }

        if (age < 18) {
          throw new Error('You must be at least 18 years old to join Cupiddle.');
        }

        await api.register({
          email,
          password,
          display_name: displayName,
          birthdate,
          gender,
          city,
          country: 'Nigeria',
        });
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(32, 32, 32, 0.55)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
        overflowY: 'auto',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          backgroundColor: 'var(--color-paper-white, #ffffff)',
          color: 'var(--color-bumble-ink, #202020)',
          borderRadius: 'var(--radius-cards, 24px)',
          border: '1.5px solid var(--color-bumble-ink, #202020)',
          maxWidth: '480px',
          width: '100%',
          padding: '36px',
          boxShadow: '0 20px 48px rgba(32, 32, 32, 0.18)',
          position: 'relative',
          margin: 'auto',
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-mist, #f3f3f3)',
            border: '1px solid #e0e0e0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-bumble-ink, #202020)',
            cursor: 'pointer',
          }}
        >
          <X size={18} />
        </button>

        {/* Brand Pill Badge */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: 'var(--radius-badges, 1000px)',
              backgroundColor: 'var(--color-bumble-honey, #ffdb5b)',
              color: 'var(--color-bumble-ink, #202020)',
              fontSize: '12px',
              fontWeight: 700,
              letterSpacing: '0.02em',
              marginBottom: '14px',
            }}
          >
            <Sparkles size={14} color="#202020" />
            Curiosity is attractive
          </div>

          <h2
            style={{
              fontSize: '28px',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              color: 'var(--color-bumble-ink, #202020)',
              lineHeight: 1.15,
            }}
          >
            {mode === 'login' ? 'Welcome Back' : 'Create Free Account'}
          </h2>

          <p
            style={{
              fontSize: '14px',
              color: 'var(--color-graphite, #575656)',
              marginTop: '6px',
              lineHeight: 1.4,
            }}
          >
            {mode === 'login'
              ? 'Sign in to rediscover your Sparks and conversations.'
              : 'Join the curiosity-first community. Zero fees, 100% free forever.'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            backgroundColor: 'var(--color-mist, #f3f3f3)',
            borderRadius: 'var(--radius-badges, 1000px)',
            padding: '4px',
            marginBottom: '24px',
            border: '1px solid #e5e5e5',
          }}
        >
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError(null);
            }}
            style={{
              padding: '10px 16px',
              borderRadius: 'var(--radius-badges, 1000px)',
              backgroundColor: mode === 'register' ? 'var(--color-bumble-ink, #202020)' : 'transparent',
              color: mode === 'register' ? '#ffffff' : 'var(--color-bumble-ink, #202020)',
              fontSize: '14px',
              fontWeight: 700,
              letterSpacing: '0.01em',
              transition: 'all 0.15s ease',
            }}
          >
            Create Account
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            style={{
              padding: '10px 16px',
              borderRadius: 'var(--radius-badges, 1000px)',
              backgroundColor: mode === 'login' ? 'var(--color-bumble-ink, #202020)' : 'transparent',
              color: mode === 'login' ? '#ffffff' : 'var(--color-bumble-ink, #202020)',
              fontSize: '14px',
              fontWeight: 700,
              letterSpacing: '0.01em',
              transition: 'all 0.15s ease',
            }}
          >
            Sign In
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div
            style={{
              padding: '12px 16px',
              backgroundColor: '#fff1f2',
              border: '1.5px solid #f43f5e',
              borderRadius: 'var(--radius-buttons, 16px)',
              color: '#9f1239',
              fontSize: '13px',
              fontWeight: 600,
              marginBottom: '20px',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '13px',
                color: 'var(--color-bumble-ink, #202020)',
                marginBottom: '6px',
                fontWeight: 700,
                letterSpacing: '0.01em',
              }}
            >
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@domain.com"
              style={{
                width: '100%',
                padding: '12px 16px',
                fontSize: '15px',
                borderRadius: 'var(--radius-buttons, 16px)',
                border: '1.5px solid var(--color-bumble-ink, #202020)',
                backgroundColor: 'var(--color-paper-white, #ffffff)',
                color: 'var(--color-bumble-ink, #202020)',
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: 'block',
                fontSize: '13px',
                color: 'var(--color-bumble-ink, #202020)',
                marginBottom: '6px',
                fontWeight: 700,
                letterSpacing: '0.01em',
              }}
            >
              Password
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              style={{
                width: '100%',
                padding: '12px 16px',
                fontSize: '15px',
                borderRadius: 'var(--radius-buttons, 16px)',
                border: '1.5px solid var(--color-bumble-ink, #202020)',
                backgroundColor: 'var(--color-paper-white, #ffffff)',
                color: 'var(--color-bumble-ink, #202020)',
              }}
            />
          </div>

          {mode === 'register' && (
            <>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '13px',
                    color: 'var(--color-bumble-ink, #202020)',
                    marginBottom: '6px',
                    fontWeight: 700,
                    letterSpacing: '0.01em',
                  }}
                >
                  Display Name
                </label>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your first name or moniker"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    fontSize: '15px',
                    borderRadius: 'var(--radius-buttons, 16px)',
                    border: '1.5px solid var(--color-bumble-ink, #202020)',
                    backgroundColor: 'var(--color-paper-white, #ffffff)',
                    color: 'var(--color-bumble-ink, #202020)',
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '13px',
                    color: 'var(--color-bumble-ink, #202020)',
                    marginBottom: '6px',
                    fontWeight: 700,
                    letterSpacing: '0.01em',
                  }}
                >
                  <ShieldCheck size={16} color="var(--color-bumble-ink, #202020)" />
                  Date of Birth (18+ Mandatory)
                </label>
                <input
                  type="date"
                  required
                  value={birthdate}
                  onChange={(e) => setBirthdate(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    fontSize: '15px',
                    borderRadius: 'var(--radius-buttons, 16px)',
                    border: '1.5px solid var(--color-bumble-ink, #202020)',
                    backgroundColor: 'var(--color-paper-white, #ffffff)',
                    color: 'var(--color-bumble-ink, #202020)',
                  }}
                />
                <span
                  style={{
                    fontSize: '12px',
                    color: 'var(--color-graphite, #575656)',
                    display: 'block',
                    marginTop: '4px',
                    letterSpacing: '0.01em',
                  }}
                >
                  Cupiddle is an adults-only platform. You must be at least 18.
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '13px',
                      color: 'var(--color-bumble-ink, #202020)',
                      marginBottom: '6px',
                      fontWeight: 700,
                      letterSpacing: '0.01em',
                    }}
                  >
                    Gender
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      fontSize: '14px',
                      borderRadius: 'var(--radius-buttons, 16px)',
                      border: '1.5px solid var(--color-bumble-ink, #202020)',
                      backgroundColor: 'var(--color-paper-white, #ffffff)',
                      color: 'var(--color-bumble-ink, #202020)',
                      fontWeight: 600,
                    }}
                  >
                    <option value="Woman">Woman</option>
                    <option value="Man">Man</option>
                    <option value="Non-binary">Non-binary</option>
                  </select>
                </div>

                <div>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '13px',
                      color: 'var(--color-bumble-ink, #202020)',
                      marginBottom: '6px',
                      fontWeight: 700,
                      letterSpacing: '0.01em',
                    }}
                  >
                    <MapPin size={14} color="var(--color-bumble-ink, #202020)" />
                    State / Location
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      fontSize: '14px',
                      borderRadius: 'var(--radius-buttons, 16px)',
                      border: '1.5px solid var(--color-bumble-ink, #202020)',
                      backgroundColor: 'var(--color-paper-white, #ffffff)',
                      color: 'var(--color-bumble-ink, #202020)',
                      fontWeight: 600,
                    }}
                  >
                    {NIGERIAN_STATES.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          )}

          {/* Primary Action Button (Bumble Ink filled button, 16px radius, bold) */}
          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '12px',
              padding: '16px',
              borderRadius: 'var(--radius-buttons, 16px)',
              backgroundColor: 'var(--color-bumble-ink, #202020)',
              color: 'var(--color-paper-white, #ffffff)',
              fontSize: '16px',
              fontWeight: 700,
              letterSpacing: '0.015em',
              boxShadow: 'var(--shadow-sm, 0px 1px 8px rgba(32, 32, 32, 0.12))',
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            {loading ? (
              'Please wait...'
            ) : mode === 'login' ? (
              'Sign In to Cupiddle'
            ) : (
              <>
                Join Cupiddle Free — No Paywalls
              </>
            )}
          </button>

          {/* Under Button Note */}
          <p
            style={{
              textAlign: 'center',
              fontSize: '12px',
              color: 'var(--color-graphite, #575656)',
              marginTop: '4px',
              lineHeight: 1.4,
            }}
          >
            By continuing, you confirm you are 18+ and agree to Cupiddle's Community Guidelines.
          </p>
        </form>
      </div>
    </div>
  );
};
