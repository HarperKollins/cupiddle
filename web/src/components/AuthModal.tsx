import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, MapPin } from 'lucide-react';
import { CupiddleIcon } from './CupiddleLogo';
import { api } from '../api';
import { NIGERIAN_STATES } from '../constants/nigerianStates';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialState?: string;
  initialMode?: 'login' | 'register' | 'forgot';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialState,
  initialMode,
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot' | 'reset'>(initialMode || 'register');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [usernameMessage, setUsernameMessage] = useState<string | null>(null);
  const [campus, setCampus] = useState('EBSU');
  const [faculty, setFaculty] = useState('');
  const [level, setLevel] = useState('300L');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [birthdate, setBirthdate] = useState('2000-01-01');
  const [gender, setGender] = useState('Woman');
  const [city, setCity] = useState(initialState || 'Ebonyi');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  // Google inline fallback state (shown when no Google GSI SDK is configured)
  const [showGoogleEmailInput, setShowGoogleEmailInput] = useState(false);
  const [googleEmail, setGoogleEmail] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (initialMode) {
        setMode(initialMode);
      } else if (initialState) {
        setMode('register');
      }
      setError(null);
      setInfoMessage(null);
    }
  }, [isOpen, initialMode, initialState]);

  useEffect(() => {
    if (initialState) {
      setCity(initialState);
    }
  }, [initialState]);

  // Debounced real-time username availability check
  useEffect(() => {
    if (mode !== 'register' || !username.trim()) {
      setUsernameStatus('idle');
      setUsernameMessage(null);
      return;
    }

    const clean = username.trim().toLowerCase().replace(/^@/, '');
    if (clean.length < 3) {
      setUsernameStatus('idle');
      setUsernameMessage('Username must be at least 3 characters');
      return;
    }

    setUsernameStatus('checking');
    const timer = setTimeout(async () => {
      try {
        const res = await api.checkUsername(clean);
        if (res.available) {
          setUsernameStatus('available');
          setUsernameMessage(`@${res.username} is available! ✨`);
        } else {
          setUsernameStatus('taken');
          setUsernameMessage(res.error || `@${clean} is already taken.`);
        }
      } catch {
        setUsernameStatus('idle');
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [username, mode]);

  const handleGoogleClick = async () => {
    setError(null);
    setInfoMessage(null);

    const googleClientId = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID || (window as any).GOOGLE_CLIENT_ID;

    // 1. If Google Client ID is configured and GSI is available, trigger native Google 1-Tap
    if (googleClientId && (window as any).google?.accounts?.id) {
      try {
        setLoading(true);
        (window as any).google.accounts.id.initialize({
          client_id: googleClientId,
          callback: async (response: any) => {
            try {
              await api.googleAuth({
                credential: response.credential,
                username: username.trim() || undefined,
                campus: campus,
                faculty: faculty || undefined,
                level: level,
              });
              onSuccess();
              onClose();
            } catch (err: any) {
              setError(err.message || 'Google authentication failed');
            } finally {
              setLoading(false);
            }
          },
        });
        (window as any).google.accounts.id.prompt();
      } catch (err: any) {
        setLoading(false);
        setError('Failed to initialize Google Sign-in: ' + err.message);
      }
      return;
    }

    // 2. No GSI SDK configured — show inline Gmail input instead of browser prompt()
    setShowGoogleEmailInput(true);
  };

  const handleGoogleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const trimmed = googleEmail.trim().toLowerCase();
    if (!trimmed.includes('@') || !trimmed.includes('.')) {
      setError('Please enter a valid Gmail address.');
      return;
    }
    try {
      setLoading(true);
      await api.googleAuth({
        email: trimmed,
        name: displayName.trim() || trimmed.split('@')[0],
        username: username.trim() || undefined,
        campus: campus,
        faculty: faculty || undefined,
        level: level,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Google authentication failed. Please sign up with email below.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfoMessage(null);
    setLoading(true);

    const cleanIdentifier = email.trim().toLowerCase();

    try {
      if (mode === 'login') {
        if (!cleanIdentifier) {
          throw new Error('Please enter your email address or @username.');
        }
        await api.login({ email: cleanIdentifier, password });
        onSuccess();
        onClose();
      } else if (mode === 'register') {
        if (!cleanIdentifier || !cleanIdentifier.includes('@') || !cleanIdentifier.includes('.')) {
          throw new Error('Please enter a valid email address (e.g. name@gmail.com).');
        }

        const cleanUser = username.trim().toLowerCase().replace(/^@/, '');
        if (cleanUser && cleanUser.length < 3) {
          throw new Error('Username must be at least 3 characters.');
        }

        if (usernameStatus === 'taken') {
          throw new Error('The chosen @username is already claimed. Please pick another.');
        }

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

        if (password.length < 8) {
          throw new Error('Password must be at least 8 characters.');
        }

        await api.register({
          email: cleanIdentifier,
          username: cleanUser || undefined,
          password,
          display_name: displayName.trim() || cleanUser || 'Curious Student',
          campus,
          faculty: faculty.trim() || undefined,
          level,
          birthdate,
          gender,
          city,
          country: 'Nigeria',
        });
        onSuccess();
        onClose();
      } else if (mode === 'forgot') {
        await api.forgotPassword(cleanIdentifier);
        setInfoMessage('Reset code sent! Check with your campus admin or registered email to get your 6-digit code.');
        setMode('reset');
      } else if (mode === 'reset') {
        if (!resetCode.trim()) {
          throw new Error('Please enter the 6-digit reset code.');
        }
        if (newPassword.length < 8) {
          throw new Error('New password must be at least 8 characters.');
        }
        await api.resetPassword({
          email: cleanIdentifier,
          code: resetCode.trim(),
          new_password: newPassword,
        });
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      const msg = err.message || '';
      if (msg.includes('did not match the expected pattern')) {
        setError('Please check your email address and password, then try again.');
      } else {
        setError(msg || 'Authentication failed. Please check your inputs.');
      }
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
        className="animate-modal-spring"
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
            <CupiddleIcon size={14} color="#202020" />
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
            {mode === 'login'
              ? 'Welcome Back'
              : mode === 'register'
              ? 'Create Free Account'
              : mode === 'forgot'
              ? 'Reset Password'
              : 'Set New Password'}
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
              : mode === 'register'
              ? 'Join the curiosity-first community. Zero fees, 100% free forever.'
              : mode === 'forgot'
              ? 'Enter your registered email address to receive your 6-digit reset code.'
              : 'Enter your 6-digit code and choose a new password.'}
          </p>
        </div>

        {/* Tab Switcher (Only shown on Login / Register) */}
        {(mode === 'login' || mode === 'register') && (
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
                setInfoMessage(null);
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
                setInfoMessage(null);
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
        )}

        {/* Informational Alert */}
        {infoMessage && (
          <div
            style={{
              padding: '12px 16px',
              backgroundColor: '#ecfdf5',
              border: '1.5px solid #10b981',
              borderRadius: 'var(--radius-buttons, 16px)',
              color: '#065f46',
              fontSize: '13px',
              fontWeight: 600,
              marginBottom: '20px',
            }}
          >
            {infoMessage}
          </div>
        )}

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

        {/* Google 1-Tap Option for Register and Login */}
        {(mode === 'register' || mode === 'login') && (
          <div style={{ marginBottom: '16px' }}>
            {!showGoogleEmailInput ? (
              <button
                type="button"
                onClick={handleGoogleClick}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  backgroundColor: '#ffffff',
                  border: '1.5px solid var(--color-bumble-ink, #202020)',
                  borderRadius: 'var(--radius-buttons, 16px)',
                  fontSize: '14px',
                  fontWeight: 700,
                  color: 'var(--color-bumble-ink, #202020)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                </svg>
                Continue with Google (1-Tap)
              </button>
            ) : (
              <form onSubmit={handleGoogleEmailSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#202020' }}>Enter your Gmail to continue:</div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="email"
                    required
                    autoFocus
                    value={googleEmail}
                    onChange={(e) => setGoogleEmail(e.target.value)}
                    placeholder="you@gmail.com"
                    style={{
                      flex: 1,
                      padding: '12px 14px',
                      fontSize: '14px',
                      borderRadius: 'var(--radius-buttons, 16px)',
                      border: '1.5px solid #202020',
                      backgroundColor: '#fff',
                      color: '#202020',
                    }}
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      padding: '12px 16px',
                      borderRadius: 'var(--radius-buttons, 16px)',
                      backgroundColor: '#202020',
                      color: '#fff',
                      fontWeight: 700,
                      fontSize: '14px',
                      border: 'none',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {loading ? '…' : 'Go →'}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => { setShowGoogleEmailInput(false); setGoogleEmail(''); setError(null); }}
                  style={{ fontSize: '12px', color: '#777', textDecoration: 'underline', cursor: 'pointer', border: 'none', background: 'none', textAlign: 'left' }}
                >
                  ← Back
                </button>
              </form>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '14px 0 6px 0' }}>
              <hr style={{ flex: 1, border: 'none', borderTop: '1px solid #e0e0e0' }} />
              <span style={{ fontSize: '11px', color: '#777', fontWeight: 700, letterSpacing: '0.04em' }}>
                {mode === 'login' ? 'OR LOG IN WITH CREDENTIALS' : 'OR SIGN UP WITH EMAIL'}
              </span>
              <hr style={{ flex: 1, border: 'none', borderTop: '1px solid #e0e0e0' }} />
            </div>
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
              {mode === 'login' ? 'Email Address or @username' : 'Email Address'}
            </label>
            <input
              type={mode === 'login' ? 'text' : 'email'}
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={mode === 'login' ? 'you@gmail.com or @handle' : 'you@domain.com'}
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

          {/* Login or Register Password */}
          {(mode === 'login' || mode === 'register') && (
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
              {mode === 'login' && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setError(null);
                      setInfoMessage(null);
                    }}
                    style={{
                      fontSize: '13px',
                      fontWeight: 600,
                      color: 'var(--color-graphite, #575656)',
                      textDecoration: 'underline',
                      cursor: 'pointer',
                    }}
                  >
                    Forgot password?
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Reset Code & New Password when in Reset mode */}
          {mode === 'reset' && (
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
                  6-Digit Recovery Code
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value)}
                  placeholder="e.g. 529183"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    fontSize: '18px',
                    fontWeight: 800,
                    letterSpacing: '4px',
                    textAlign: 'center',
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
                  Choose New Password
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
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
            </>
          )}

          {mode === 'register' && (
            <>
              {/* Claim Unique Campus Handle */}
              <div>
                <label
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '13px',
                    color: 'var(--color-bumble-ink, #202020)',
                    marginBottom: '6px',
                    fontWeight: 700,
                    letterSpacing: '0.01em',
                  }}
                >
                  <span>Campus Handle (@username)</span>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color:
                        usernameStatus === 'available'
                          ? '#059669'
                          : usernameStatus === 'taken'
                          ? '#dc2626'
                          : '#666666',
                    }}
                  >
                    {usernameMessage || 'Lowercase letters, numbers, _'}
                  </span>
                </label>
                <div style={{ position: 'relative' }}>
                  <span
                    style={{
                      position: 'absolute',
                      left: '16px',
                      top: '12px',
                      fontWeight: 800,
                      color: '#888888',
                      fontSize: '15px',
                    }}
                  >
                    @
                  </span>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) =>
                      setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))
                    }
                    placeholder="chidera_x"
                    style={{
                      width: '100%',
                      padding: '12px 16px 12px 34px',
                      fontSize: '15px',
                      borderRadius: 'var(--radius-buttons, 16px)',
                      border: `1.5px solid ${
                        usernameStatus === 'available'
                          ? '#10b981'
                          : usernameStatus === 'taken'
                          ? '#f43f5e'
                          : 'var(--color-bumble-ink, #202020)'
                      }`,
                      backgroundColor: 'var(--color-paper-white, #ffffff)',
                      color: 'var(--color-bumble-ink, #202020)',
                    }}
                  />
                </div>
              </div>

              {/* Campus & Level Pickers */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
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
                    Campus
                  </label>
                  <select
                    value={campus}
                    onChange={(e) => setCampus(e.target.value)}
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
                    <option value="EBSU">EBSU (Ebonyi State)</option>
                    <option value="UNN">UNN (Nsukka)</option>
                    <option value="UNIZIK">UNIZIK (Awka)</option>
                    <option value="UNILAG">UNILAG (Akoka)</option>
                    <option value="FUTO">FUTO (Owerri)</option>
                    <option value="UI">UI (Ibadan)</option>
                    <option value="OAU">OAU (Ifẹ)</option>
                    <option value="Other">Other Campus</option>
                  </select>
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
                    Level
                  </label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
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
                    <option value="100L">100L (Fresher)</option>
                    <option value="200L">200L</option>
                    <option value="300L">300L</option>
                    <option value="400L">400L</option>
                    <option value="500L">500L (Finalist)</option>
                    <option value="PG">Postgraduate</option>
                  </select>
                </div>
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
                  Faculty / Department
                </label>
                <input
                  type="text"
                  value={faculty}
                  onChange={(e) => setFaculty(e.target.value)}
                  placeholder="e.g. Faculty of Law, Medicine, CS"
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

          {/* Primary Action Button */}
          <button
            type="submit"
            disabled={loading}
            className="btn-bumble-action"
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
            ) : mode === 'register' ? (
              'Join Cupiddle Free — No Paywalls'
            ) : mode === 'forgot' ? (
              'Send 6-Digit Reset Code'
            ) : (
              'Save New Password & Sign In'
            )}
          </button>

          {/* Back to login option if in forgot or reset mode */}
          {(mode === 'forgot' || mode === 'reset') && (
            <div style={{ textAlign: 'center', marginTop: '4px' }}>
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError(null);
                  setInfoMessage(null);
                }}
                style={{
                  fontSize: '13px',
                  fontWeight: 700,
                  color: 'var(--color-bumble-ink, #202020)',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                }}
              >
                ← Back to Sign In
              </button>
            </div>
          )}

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
