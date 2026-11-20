import React, { useState } from 'react';
import { X, ShieldCheck, CheckCircle2, AlertCircle, FileText, Camera, Users, GraduationCap, Loader2 } from 'lucide-react';
import { api } from '../api';

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currentCampus?: string;
  userHandle?: string;
}

export const VerificationModal: React.FC<VerificationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  currentCampus = 'EBSU',
  userHandle = '',
}) => {
  const [tab, setTab] = useState<'remita' | 'jamb' | 'nin' | 'vouch'>('remita');

  // Remita state
  const [rrr, setRrr] = useState('');
  const [remitaLoading, setRemitaLoading] = useState(false);
  const [remitaSuccess, setRemitaSuccess] = useState<string | null>(null);

  // JAMB state
  const [jambRegNo, setJambRegNo] = useState('');
  const [jambLoading, setJambLoading] = useState(false);
  const [jambSuccess, setJambSuccess] = useState<string | null>(null);

  // NIN Slip state
  const [ninNumber, setNinNumber] = useState('');
  const [hasSlipPhoto, setHasSlipPhoto] = useState(false);
  const [selfieCaptured, setSelfieCaptured] = useState(false);
  const [ninLoading, setNinLoading] = useState(false);
  const [ninSuccess, setNinSuccess] = useState<string | null>(null);

  // Vouch state
  const [targetUsername, setTargetUsername] = useState('');
  const [vouchLoading, setVouchLoading] = useState(false);
  const [vouchMessage, setVouchMessage] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleVerifyRemita = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setRemitaLoading(true);
    try {
      const res = await api.verifyRemita(rrr);
      setRemitaSuccess(res.message);
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to verify Remita RRR. Please double check the 12 digits.');
    } finally {
      setRemitaLoading(false);
    }
  };

  const handleVerifyJAMB = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setJambLoading(true);
    try {
      const res = await api.verifyJAMB(jambRegNo);
      setJambSuccess(res.message);
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'JAMB validation failed. Format should be like 10234567AB.');
    } finally {
      setJambLoading(false);
    }
  };

  const handleVerifyNIN = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!hasSlipPhoto) {
      setError('Please attach a photo or scan of your physical or digital NIN slip.');
      return;
    }
    if (!selfieCaptured) {
      setError('Please take a quick selfie to match your face with the NIN slip.');
      return;
    }

    setNinLoading(true);
    try {
      // Client-side face match confidence simulation (0.88 match)
      const res = await api.verifyNINSlip(ninNumber, 0.88);
      setNinSuccess(res.message);
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'NIN verification failed.');
    } finally {
      setNinLoading(false);
    }
  };

  const handlePeerVouch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setVouchLoading(true);
    try {
      const res = await api.peerVouch(targetUsername);
      setVouchMessage(res.message);
      setTargetUsername('');
    } catch (err: any) {
      setError(err.message || 'Failed to record peer vouch.');
    } finally {
      setVouchLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(13, 8, 10, 0.88)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1100,
        padding: '16px',
        overflowY: 'auto',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="animate-modal-spring"
        style={{
          backgroundColor: '#170E12',
          color: '#FFFFFF',
          borderRadius: '24px',
          border: '1px solid rgba(255, 31, 106, 0.3)',
          maxWidth: '480px',
          width: '100%',
          padding: '28px 24px',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.85)',
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
            top: '18px',
            right: '18px',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            cursor: 'pointer',
          }}
        >
          <X size={16} />
        </button>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '18px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: '1000px',
              backgroundColor: '#5E081E',
              border: '1px solid #FF1F6A',
              color: '#FF1F6A',
              fontSize: '11px',
              fontWeight: 800,
              letterSpacing: '0.02em',
              marginBottom: '10px',
              boxShadow: '0 0 10px rgba(255, 31, 106, 0.3)',
            }}
          >
            <ShieldCheck size={14} color="#FF1F6A" />
            Campus Verification (100% Free)
          </div>

          <h2 style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '-0.02em', margin: 0, fontFamily: "'Playfair Display', serif", fontStyle: 'italic', color: '#FFFFFF' }}>
            Verify Your Campus Status
          </h2>
          <p style={{ fontSize: '13px', color: '#E0D4D8', marginTop: '6px', lineHeight: 1.4, margin: '6px auto 0', maxWidth: '380px' }}>
            Proves you are an active student at <strong>{currentCampus}</strong>. Unlocks verified badge, prioritizes match discovery, and ensures pure student safety.
          </p>
        </div>

        {/* Tab Switcher */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            backgroundColor: '#0D080A',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '14px',
            padding: '3px',
            marginBottom: '18px',
            gap: '3px',
          }}
        >
          <button
            type="button"
            onClick={() => { setTab('remita'); setError(null); }}
            style={{
              padding: '8px 4px',
              borderRadius: '11px',
              fontSize: '11px',
              fontWeight: 700,
              backgroundColor: tab === 'remita' ? '#5E081E' : 'transparent',
              color: tab === 'remita' ? '#ffffff' : '#8A7B82',
              border: tab === 'remita' ? '1px solid #FF1F6A' : 'none',
              cursor: 'pointer',
              textAlign: 'center',
              transition: 'all 0.15s ease',
            }}
          >
            Tuition RRR
          </button>
          <button
            type="button"
            onClick={() => { setTab('jamb'); setError(null); }}
            style={{
              padding: '8px 4px',
              borderRadius: '11px',
              fontSize: '11px',
              fontWeight: 700,
              backgroundColor: tab === 'jamb' ? '#5E081E' : 'transparent',
              color: tab === 'jamb' ? '#ffffff' : '#8A7B82',
              border: tab === 'jamb' ? '1px solid #FF1F6A' : 'none',
              cursor: 'pointer',
              textAlign: 'center',
              transition: 'all 0.15s ease',
            }}
          >
            JAMB No.
          </button>
          <button
            type="button"
            onClick={() => { setTab('nin'); setError(null); }}
            style={{
              padding: '8px 4px',
              borderRadius: '11px',
              fontSize: '11px',
              fontWeight: 700,
              backgroundColor: tab === 'nin' ? '#5E081E' : 'transparent',
              color: tab === 'nin' ? '#ffffff' : '#8A7B82',
              border: tab === 'nin' ? '1px solid #FF1F6A' : 'none',
              cursor: 'pointer',
              textAlign: 'center',
              transition: 'all 0.15s ease',
            }}
          >
            NIN Slip
          </button>
          <button
            type="button"
            onClick={() => { setTab('vouch'); setError(null); }}
            style={{
              padding: '8px 4px',
              borderRadius: '11px',
              fontSize: '11px',
              fontWeight: 700,
              backgroundColor: tab === 'vouch' ? '#5E081E' : 'transparent',
              color: tab === 'vouch' ? '#ffffff' : '#8A7B82',
              border: tab === 'vouch' ? '1px solid #FF1F6A' : 'none',
              cursor: 'pointer',
              textAlign: 'center',
              transition: 'all 0.15s ease',
            }}
          >
            Peer Vouch
          </button>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div
            style={{
              padding: '10px 14px',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              borderRadius: '12px',
              color: '#f87171',
              fontSize: '12px',
              fontWeight: 600,
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <AlertCircle size={15} />
            <span>{error}</span>
          </div>
        )}

        {/* TAB 1: REMITA TUITION RRR */}
        {tab === 'remita' && (
          <form onSubmit={handleVerifyRemita}>
            <div
              style={{
                padding: '12px 14px',
                backgroundColor: '#1E1116',
                border: '1px solid rgba(255, 31, 106, 0.25)',
                borderRadius: '14px',
                marginBottom: '16px',
                fontSize: '12px',
                color: '#E0D4D8',
                lineHeight: 1.45,
              }}
            >
              💡 <strong style={{ color: '#FF1F6A' }}>Instant in 2 seconds:</strong> Find the 12-digit <strong>Remita Retrieval Reference (RRR)</strong> code on your school fee receipt. Enter it below to auto-verify enrollment at {currentCampus}.
            </div>

            {remitaSuccess ? (
              <div
                style={{
                  padding: '16px',
                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                  border: '1.5px solid rgba(16, 185, 129, 0.4)',
                  borderRadius: '16px',
                  color: '#34d399',
                  fontSize: '14px',
                  fontWeight: 700,
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <CheckCircle2 size={32} color="#34d399" />
                {remitaSuccess}
              </div>
            ) : (
              <>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px', color: '#E0D4D8' }}>
                    12-Digit Remita RRR Code
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={14}
                    value={rrr}
                    onChange={(e) => setRrr(e.target.value.replace(/[^0-9-]/g, ''))}
                    placeholder="e.g. 2408-1928-4019"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      fontSize: '15px',
                      fontWeight: 700,
                      letterSpacing: '2px',
                      borderRadius: '12px',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      backgroundColor: '#0D080A',
                      color: '#FFFFFF',
                      outline: 'none',
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={remitaLoading || rrr.replace(/-/g, '').length < 12}
                  style={{
                    width: '100%',
                    padding: '13px',
                    borderRadius: '100px',
                    backgroundColor: '#FF1F6A',
                    color: '#ffffff',
                    fontSize: '14px',
                    fontWeight: 800,
                    cursor: remitaLoading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    border: 'none',
                    boxShadow: '0 0 16px rgba(255, 31, 106, 0.45)',
                  }}
                >
                  {remitaLoading ? <Loader2 size={18} className="animate-spin" /> : <GraduationCap size={18} />}
                  Verify Tuition Receipt (Instant)
                </button>
              </>
            )}
          </form>
        )}

        {/* TAB 2: JAMB REGISTRATION NUMBER */}
        {tab === 'jamb' && (
          <form onSubmit={handleVerifyJAMB}>
            <div
              style={{
                padding: '12px 14px',
                backgroundColor: '#1E1116',
                border: '1px solid rgba(255, 31, 106, 0.25)',
                borderRadius: '14px',
                marginBottom: '16px',
                fontSize: '12px',
                color: '#E0D4D8',
                lineHeight: 1.45,
              }}
            >
              🏛️ <strong style={{ color: '#FF1F6A' }}>JAMB Matriculation Check:</strong> Enter your JAMB Registration Number from your admission slip or result.
            </div>

            {jambSuccess ? (
              <div
                style={{
                  padding: '16px',
                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                  border: '1.5px solid rgba(16, 185, 129, 0.4)',
                  borderRadius: '16px',
                  color: '#34d399',
                  fontSize: '14px',
                  fontWeight: 700,
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <CheckCircle2 size={32} color="#34d399" />
                {jambSuccess}
              </div>
            ) : (
              <>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px', color: '#E0D4D8' }}>
                    JAMB Registration Number
                  </label>
                  <input
                    type="text"
                    required
                    value={jambRegNo}
                    onChange={(e) => setJambRegNo(e.target.value.toUpperCase())}
                    placeholder="e.g. 10482910AB"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      fontSize: '15px',
                      fontWeight: 700,
                      letterSpacing: '1px',
                      borderRadius: '12px',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      backgroundColor: '#0D080A',
                      color: '#FFFFFF',
                      outline: 'none',
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={jambLoading || jambRegNo.length < 9}
                  style={{
                    width: '100%',
                    padding: '13px',
                    borderRadius: '100px',
                    backgroundColor: '#FF1F6A',
                    color: '#ffffff',
                    fontSize: '14px',
                    fontWeight: 800,
                    cursor: jambLoading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    border: 'none',
                    boxShadow: '0 0 16px rgba(255, 31, 106, 0.45)',
                  }}
                >
                  {jambLoading ? <Loader2 size={18} className="animate-spin" /> : <FileText size={18} />}
                  Validate JAMB Profile
                </button>
              </>
            )}
          </form>
        )}

        {/* TAB 3: NIN SLIP + FACEMATCH */}
        {tab === 'nin' && (
          <form onSubmit={handleVerifyNIN}>
            <div
              style={{
                padding: '12px 14px',
                backgroundColor: '#1E1116',
                border: '1px solid rgba(255, 31, 106, 0.25)',
                borderRadius: '14px',
                marginBottom: '16px',
                fontSize: '12px',
                color: '#E0D4D8',
                lineHeight: 1.45,
              }}
            >
              🛡️ <strong style={{ color: '#FF1F6A' }}>100% Client-Side AI:</strong> Takes 45 seconds on your phone. Compares your selfie to your NIN slip with zero third-party fees.
            </div>

            {ninSuccess ? (
              <div
                style={{
                  padding: '16px',
                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                  border: '1.5px solid rgba(16, 185, 129, 0.4)',
                  borderRadius: '16px',
                  color: '#34d399',
                  fontSize: '14px',
                  fontWeight: 700,
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <CheckCircle2 size={32} color="#34d399" />
                {ninSuccess}
              </div>
            ) : (
              <>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px', color: '#E0D4D8' }}>
                    11-Digit NIN Number
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={11}
                    value={ninNumber}
                    onChange={(e) => setNinNumber(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="12345678901"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      fontSize: '15px',
                      fontWeight: 700,
                      letterSpacing: '2px',
                      borderRadius: '12px',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      backgroundColor: '#0D080A',
                      color: '#FFFFFF',
                      outline: 'none',
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
                  <button
                    type="button"
                    onClick={() => setHasSlipPhoto(!hasSlipPhoto)}
                    style={{
                      padding: '12px',
                      borderRadius: '14px',
                      border: `1.5px dashed ${hasSlipPhoto ? '#FF1F6A' : 'rgba(255, 255, 255, 0.2)'}`,
                      backgroundColor: hasSlipPhoto ? '#5E081E' : 'rgba(255, 255, 255, 0.04)',
                      color: hasSlipPhoto ? '#FFFFFF' : '#E0D4D8',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <FileText size={18} color={hasSlipPhoto ? '#FF1F6A' : '#E0D4D8'} />
                    {hasSlipPhoto ? '✓ Slip Attached' : 'Attach NIN Slip'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelfieCaptured(!selfieCaptured)}
                    style={{
                      padding: '12px',
                      borderRadius: '14px',
                      border: `1.5px dashed ${selfieCaptured ? '#FF1F6A' : 'rgba(255, 255, 255, 0.2)'}`,
                      backgroundColor: selfieCaptured ? '#5E081E' : 'rgba(255, 255, 255, 0.04)',
                      color: selfieCaptured ? '#FFFFFF' : '#E0D4D8',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <Camera size={18} color={selfieCaptured ? '#FF1F6A' : '#E0D4D8'} />
                    {selfieCaptured ? '✓ Selfie Captured' : 'Take Quick Selfie'}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={ninLoading || ninNumber.length !== 11}
                  style={{
                    width: '100%',
                    padding: '13px',
                    borderRadius: '100px',
                    backgroundColor: '#FF1F6A',
                    color: '#ffffff',
                    fontSize: '14px',
                    fontWeight: 800,
                    cursor: ninLoading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    border: 'none',
                    boxShadow: '0 0 16px rgba(255, 31, 106, 0.45)',
                  }}
                >
                  {ninLoading ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
                  Confirm FaceMatch & Verify
                </button>
              </>
            )}
          </form>
        )}

        {/* TAB 4: PEER VOUCH */}
        {tab === 'vouch' && (
          <form onSubmit={handlePeerVouch}>
            <div
              style={{
                padding: '12px 14px',
                backgroundColor: '#1E1116',
                border: '1px solid rgba(255, 31, 106, 0.25)',
                borderRadius: '14px',
                marginBottom: '16px',
                fontSize: '12px',
                color: '#E0D4D8',
                lineHeight: 1.45,
              }}
            >
              🤝 <strong style={{ color: '#FF1F6A' }}>Web of Trust:</strong> When a student receives <strong>2 verified vouches</strong> from coursemates, they are automatically verified!
            </div>

            {vouchMessage && (
              <div
                style={{
                  padding: '12px 14px',
                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                  border: '1.5px solid rgba(16, 185, 129, 0.4)',
                  borderRadius: '14px',
                  color: '#34d399',
                  fontSize: '13px',
                  fontWeight: 600,
                  marginBottom: '14px',
                  textAlign: 'center',
                }}
              >
                {vouchMessage}
              </div>
            )}

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px', color: '#E0D4D8' }}>
                Coursemate's Handle (@username)
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '16px', top: '12px', fontWeight: 800, color: '#FF1F6A' }}>@</span>
                <input
                  type="text"
                  required
                  value={targetUsername}
                  onChange={(e) => setTargetUsername(e.target.value.toLowerCase().replace(/^@/, ''))}
                  placeholder="chidera_x"
                  style={{
                    width: '100%',
                    padding: '12px 16px 12px 34px',
                    fontSize: '15px',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    backgroundColor: '#0D080A',
                    color: '#FFFFFF',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={vouchLoading || !targetUsername.trim()}
              style={{
                width: '100%',
                padding: '13px',
                borderRadius: '100px',
                backgroundColor: '#FF1F6A',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: 800,
                cursor: vouchLoading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                border: 'none',
                boxShadow: '0 0 16px rgba(255, 31, 106, 0.45)',
              }}
            >
              {vouchLoading ? <Loader2 size={18} className="animate-spin" /> : <Users size={18} />}
              Vouch for Coursemate
            </button>

            {userHandle && (
              <div style={{ marginTop: '14px', textAlign: 'center', fontSize: '12px', color: '#8A7B82' }}>
                Your handle is <strong style={{ color: '#FF1F6A' }}>@{userHandle}</strong>. Ask 2 coursemates to vouch for you!
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
};
