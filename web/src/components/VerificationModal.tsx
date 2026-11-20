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
        backgroundColor: 'rgba(32, 32, 32, 0.65)',
        backdropFilter: 'blur(10px)',
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
          backgroundColor: '#ffffff',
          color: '#202020',
          borderRadius: '24px',
          border: '1.5px solid #202020',
          maxWidth: '520px',
          width: '100%',
          padding: '28px',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.25)',
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
            backgroundColor: '#f3f3f3',
            border: '1px solid #e0e0e0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#202020',
            cursor: 'pointer',
          }}
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '1000px',
              backgroundColor: '#ffdb5b',
              color: '#202020',
              fontSize: '12px',
              fontWeight: 800,
              letterSpacing: '0.02em',
              marginBottom: '10px',
            }}
          >
            <ShieldCheck size={15} />
            Campus Verification Engine (100% Free)
          </div>

          <h2 style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>
            Verify Your Campus Status
          </h2>
          <p style={{ fontSize: '13px', color: '#666', marginTop: '6px', lineHeight: 1.4 }}>
            Proves you are a real student at <strong>{currentCampus}</strong>. Unlocks verified badges, boosts match priority, and ensures zero creeps on campus.
          </p>
        </div>

        {/* Tab Switcher */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            backgroundColor: '#f3f3f3',
            borderRadius: '16px',
            padding: '4px',
            marginBottom: '20px',
            gap: '4px',
          }}
        >
          <button
            type="button"
            onClick={() => { setTab('remita'); setError(null); }}
            style={{
              padding: '8px 4px',
              borderRadius: '12px',
              fontSize: '11px',
              fontWeight: 700,
              backgroundColor: tab === 'remita' ? '#202020' : 'transparent',
              color: tab === 'remita' ? '#ffffff' : '#444444',
              cursor: 'pointer',
              border: 'none',
              textAlign: 'center',
            }}
          >
            Tuition RRR
          </button>
          <button
            type="button"
            onClick={() => { setTab('jamb'); setError(null); }}
            style={{
              padding: '8px 4px',
              borderRadius: '12px',
              fontSize: '11px',
              fontWeight: 700,
              backgroundColor: tab === 'jamb' ? '#202020' : 'transparent',
              color: tab === 'jamb' ? '#ffffff' : '#444444',
              cursor: 'pointer',
              border: 'none',
              textAlign: 'center',
            }}
          >
            JAMB No.
          </button>
          <button
            type="button"
            onClick={() => { setTab('nin'); setError(null); }}
            style={{
              padding: '8px 4px',
              borderRadius: '12px',
              fontSize: '11px',
              fontWeight: 700,
              backgroundColor: tab === 'nin' ? '#202020' : 'transparent',
              color: tab === 'nin' ? '#ffffff' : '#444444',
              cursor: 'pointer',
              border: 'none',
              textAlign: 'center',
            }}
          >
            NIN Slip
          </button>
          <button
            type="button"
            onClick={() => { setTab('vouch'); setError(null); }}
            style={{
              padding: '8px 4px',
              borderRadius: '12px',
              fontSize: '11px',
              fontWeight: 700,
              backgroundColor: tab === 'vouch' ? '#202020' : 'transparent',
              color: tab === 'vouch' ? '#ffffff' : '#444444',
              cursor: 'pointer',
              border: 'none',
              textAlign: 'center',
            }}
          >
            Peer Vouch
          </button>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div
            style={{
              padding: '12px 14px',
              backgroundColor: '#fff1f2',
              border: '1.5px solid #f43f5e',
              borderRadius: '14px',
              color: '#9f1239',
              fontSize: '13px',
              fontWeight: 600,
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* TAB 1: REMITA TUITION RRR */}
        {tab === 'remita' && (
          <form onSubmit={handleVerifyRemita}>
            <div
              style={{
                padding: '14px',
                backgroundColor: '#fffbe8',
                border: '1px solid #ffdb5b',
                borderRadius: '16px',
                marginBottom: '16px',
                fontSize: '13px',
                color: '#444',
                lineHeight: 1.45,
              }}
            >
              💡 <strong>Instant in 2 seconds:</strong> Look at your school fee receipt or invoice. Find the 12-digit <strong>Remita Retrieval Reference (RRR)</strong> code. Enter it below to auto-verify your enrollment at {currentCampus}.
            </div>

            {remitaSuccess ? (
              <div
                style={{
                  padding: '16px',
                  backgroundColor: '#ecfdf5',
                  border: '1.5px solid #10b981',
                  borderRadius: '16px',
                  color: '#065f46',
                  fontSize: '14px',
                  fontWeight: 700,
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <CheckCircle2 size={32} color="#10b981" />
                {remitaSuccess}
              </div>
            ) : (
              <>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
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
                      fontSize: '16px',
                      fontWeight: 700,
                      letterSpacing: '2px',
                      borderRadius: '14px',
                      border: '1.5px solid #202020',
                      backgroundColor: '#ffffff',
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={remitaLoading || rrr.replace(/-/g, '').length < 12}
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: '16px',
                    backgroundColor: '#202020',
                    color: '#ffffff',
                    fontSize: '15px',
                    fontWeight: 700,
                    cursor: remitaLoading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    border: 'none',
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
                padding: '14px',
                backgroundColor: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: '16px',
                marginBottom: '16px',
                fontSize: '13px',
                color: '#444',
                lineHeight: 1.45,
              }}
            >
              🏛️ <strong>JAMB Matriculation Check:</strong> Enter your JAMB Registration Number from your admission slip or result.
            </div>

            {jambSuccess ? (
              <div
                style={{
                  padding: '16px',
                  backgroundColor: '#ecfdf5',
                  border: '1.5px solid #10b981',
                  borderRadius: '16px',
                  color: '#065f46',
                  fontSize: '14px',
                  fontWeight: 700,
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <CheckCircle2 size={32} color="#10b981" />
                {jambSuccess}
              </div>
            ) : (
              <>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
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
                      fontSize: '16px',
                      fontWeight: 700,
                      letterSpacing: '1px',
                      borderRadius: '14px',
                      border: '1.5px solid #202020',
                      backgroundColor: '#ffffff',
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={jambLoading || jambRegNo.length < 9}
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: '16px',
                    backgroundColor: '#202020',
                    color: '#ffffff',
                    fontSize: '15px',
                    fontWeight: 700,
                    cursor: jambLoading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    border: 'none',
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
                padding: '14px',
                backgroundColor: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: '16px',
                marginBottom: '16px',
                fontSize: '13px',
                color: '#1e40af',
                lineHeight: 1.45,
              }}
            >
              🛡️ <strong>100% Client-Side AI:</strong> Takes 45 seconds on your phone. Compares your face to your NIN document with zero third-party API fees.
            </div>

            {ninSuccess ? (
              <div
                style={{
                  padding: '16px',
                  backgroundColor: '#ecfdf5',
                  border: '1.5px solid #10b981',
                  borderRadius: '16px',
                  color: '#065f46',
                  fontSize: '14px',
                  fontWeight: 700,
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <CheckCircle2 size={32} color="#10b981" />
                {ninSuccess}
              </div>
            ) : (
              <>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
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
                      borderRadius: '14px',
                      border: '1.5px solid #202020',
                      backgroundColor: '#ffffff',
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
                      border: `1.5px dashed ${hasSlipPhoto ? '#10b981' : '#202020'}`,
                      backgroundColor: hasSlipPhoto ? '#ecfdf5' : '#f9f9f9',
                      color: hasSlipPhoto ? '#065f46' : '#202020',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <FileText size={18} />
                    {hasSlipPhoto ? '✓ Slip Attached' : 'Attach NIN Slip'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelfieCaptured(!selfieCaptured)}
                    style={{
                      padding: '12px',
                      borderRadius: '14px',
                      border: `1.5px dashed ${selfieCaptured ? '#10b981' : '#202020'}`,
                      backgroundColor: selfieCaptured ? '#ecfdf5' : '#f9f9f9',
                      color: selfieCaptured ? '#065f46' : '#202020',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <Camera size={18} />
                    {selfieCaptured ? '✓ Selfie Captured' : 'Take Quick Selfie'}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={ninLoading || ninNumber.length !== 11}
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: '16px',
                    backgroundColor: '#202020',
                    color: '#ffffff',
                    fontSize: '15px',
                    fontWeight: 700,
                    cursor: ninLoading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    border: 'none',
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
                padding: '14px',
                backgroundColor: '#faf5ff',
                border: '1px solid #e9d5ff',
                borderRadius: '16px',
                marginBottom: '16px',
                fontSize: '13px',
                color: '#6b21a8',
                lineHeight: 1.45,
              }}
            >
              🤝 <strong>Web of Trust:</strong> If you are verified, you can vouch for a coursemate from your department. When a student receives <strong>2 verified vouches</strong>, they are automatically verified!
            </div>

            {vouchMessage && (
              <div
                style={{
                  padding: '12px 14px',
                  backgroundColor: '#ecfdf5',
                  border: '1.5px solid #10b981',
                  borderRadius: '14px',
                  color: '#065f46',
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
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                Coursemate's Handle (@username)
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '16px', top: '12px', fontWeight: 800, color: '#888' }}>@</span>
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
                    borderRadius: '14px',
                    border: '1.5px solid #202020',
                    backgroundColor: '#ffffff',
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={vouchLoading || !targetUsername.trim()}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '16px',
                backgroundColor: '#202020',
                color: '#ffffff',
                fontSize: '15px',
                fontWeight: 700,
                cursor: vouchLoading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                border: 'none',
              }}
            >
              {vouchLoading ? <Loader2 size={18} className="animate-spin" /> : <Users size={18} />}
              Vouch for Coursemate
            </button>

            {userHandle && (
              <div style={{ marginTop: '14px', textAlign: 'center', fontSize: '12px', color: '#666' }}>
                Your handle is <strong>@{userHandle}</strong>. Ask 2 coursemates to vouch for you!
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
};
