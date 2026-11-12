import React, { useState } from 'react';
import { X, Sparkles, ShieldCheck } from 'lucide-react';
import { api } from '../api';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [birthdate, setBirthdate] = useState('2000-01-01');
  const [gender, setGender] = useState('Woman');
  const [city, setCity] = useState('Lagos');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(10, 5, 18, 0.85)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '16px',
    }}>
      <div style={{
        backgroundColor: 'var(--color-surface-card)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-surface-border)',
        maxWidth: '460px',
        width: '100%',
        padding: '32px',
        boxShadow: 'var(--shadow-subtle)',
        position: 'relative',
      }}>
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '20px', right: '20px', color: 'var(--color-text-muted)' }}
        >
          <X size={20} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, var(--color-violet-600), var(--color-coral-500))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px',
            boxShadow: 'var(--shadow-glow)',
          }}>
            <Sparkles size={26} color="#ffffff" />
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#ffffff' }}>
            {mode === 'login' ? 'Welcome Back' : 'Join Cupiddle'}
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
            Curiosity is attractive. Meet minds, make connections.
          </p>
        </div>

        {/* Tab Switcher */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          backgroundColor: 'var(--color-surface-input)',
          borderRadius: 'var(--radius-sm)',
          padding: '4px',
          marginBottom: '20px',
        }}>
          <button
            type="button"
            onClick={() => { setMode('login'); setError(null); }}
            style={{
              padding: '8px',
              borderRadius: '6px',
              backgroundColor: mode === 'login' ? 'var(--color-violet-800)' : 'transparent',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: 600,
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setError(null); }}
            style={{
              padding: '8px',
              borderRadius: '6px',
              backgroundColor: mode === 'register' ? 'var(--color-violet-800)' : 'transparent',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: 600,
            }}
          >
            Create Account
          </button>
        </div>

        {error && (
          <div style={{
            padding: '10px 14px',
            backgroundColor: 'rgba(244, 63, 94, 0.15)',
            border: '1px solid var(--color-coral-500)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--color-coral-300)',
            fontSize: '13px',
            marginBottom: '16px',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '4px', fontWeight: 600 }}>
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@domain.com"
              style={{ width: '100%', fontSize: '14px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '4px', fontWeight: 600 }}>
              Password
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              style={{ width: '100%', fontSize: '14px' }}
            />
          </div>

          {mode === 'register' && (
            <>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '4px', fontWeight: 600 }}>
                  Display Name
                </label>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your first name or moniker"
                  style={{ width: '100%', fontSize: '14px' }}
                />
              </div>

              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '4px', fontWeight: 600 }}>
                  <ShieldCheck size={14} color="var(--color-violet-400)" />
                  Date of Birth (18+ Mandatory)
                </label>
                <input
                  type="date"
                  required
                  value={birthdate}
                  onChange={(e) => setBirthdate(e.target.value)}
                  style={{ width: '100%', fontSize: '14px' }}
                />
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', display: 'block', marginTop: '2px' }}>
                  Cupiddle is an adults-only platform. You must be at least 18.
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '4px', fontWeight: 600 }}>
                    Gender
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    style={{ width: '100%', fontSize: '13px' }}
                  >
                    <option value="Woman">Woman</option>
                    <option value="Man">Man</option>
                    <option value="Non-binary">Non-binary</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '4px', fontWeight: 600 }}>
                    City
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    style={{ width: '100%', fontSize: '13px' }}
                  >
                    <option value="Lagos">Lagos</option>
                    <option value="Abuja">Abuja</option>
                    <option value="Ibadan">Ibadan</option>
                    <option value="Port Harcourt">Port Harcourt</option>
                    <option value="Enugu">Enugu</option>
                    <option value="Benin City">Benin City</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '10px',
              padding: '12px',
              borderRadius: 'var(--radius-full)',
              background: 'linear-gradient(135deg, var(--color-violet-600), var(--color-coral-500))',
              color: '#ffffff',
              fontSize: '15px',
              fontWeight: 700,
              boxShadow: 'var(--shadow-coral-glow)',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Join Cupiddle Free'}
          </button>
        </form>
      </div>
    </div>
  );
};

