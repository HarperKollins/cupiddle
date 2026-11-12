import React, { useState } from 'react';
import { Sparkles, Heart, Check, X, MapPin } from 'lucide-react';
import { Spark } from '../types';

interface SparksInboxProps {
  sparks: Spark[];
  loading: boolean;
  onAccept: (sparkId: string) => Promise<void>;
  onPass: (sparkId: string) => Promise<void>;
  onOpenProfile?: (userId: string) => void;
}

export const SparksInbox: React.FC<SparksInboxProps> = ({
  sparks,
  loading,
  onAccept,
  onPass,
}) => {
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleAccept = async (id: string) => {
    setProcessingId(id);
    try {
      await onAccept(id);
    } finally {
      setProcessingId(null);
    }
  };

  const handlePass = async (id: string) => {
    setProcessingId(id);
    try {
      await onPass(id);
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--color-text-muted)' }}>
        <Sparkles size={32} style={{ animation: 'spin 2s linear infinite', margin: '0 auto 12px' }} />
        <p>Loading your Sparks inbox...</p>
      </div>
    );
  }

  if (sparks.length === 0) {
    return (
      <div style={{
        maxWidth: '540px',
        margin: '60px auto',
        padding: '40px 24px',
        textAlign: 'center',
        backgroundColor: 'var(--color-surface-card)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-surface-border)',
      }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: 'rgba(124, 58, 237, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px',
        }}>
          <Heart size={28} color="var(--color-violet-400)" />
        </div>
        <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#ffffff', marginBottom: '8px' }}>
          No Pending Sparks Yet
        </h3>
        <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
          When people discover your Rabbit Hole, Defend This Take opinion, or profile questions in the Idea Stream, their curious responses will arrive here.
        </p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <div>
          <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#ffffff' }}>Sparks Inbox</h2>
          <p style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>
            People who found something fascinating in your profile and sparked a response.
          </p>
        </div>
        <span style={{
          padding: '4px 12px',
          backgroundColor: 'rgba(244, 63, 94, 0.15)',
          color: 'var(--color-coral-400)',
          borderRadius: 'var(--radius-full)',
          fontSize: '13px',
          fontWeight: 700,
        }}>
          {sparks.length} Pending
        </span>
      </div>

      {sparks.map((spark) => {
        const sender = spark.sender_profile;
        const photo = sender?.photos && sender.photos.length > 0
          ? sender.photos[0].url
          : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80';

        const isBusy = processingId === spark.id;

        return (
          <div
            key={spark.id}
            style={{
              backgroundColor: 'var(--color-surface-card)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-surface-border)',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              boxShadow: 'var(--shadow-subtle)',
            }}
          >
            {/* Sender Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <img
                src={photo}
                alt={sender?.display_name || 'Sender'}
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid var(--color-violet-600)',
                }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h4 style={{ fontSize: '18px', fontWeight: 800, color: '#ffffff' }}>
                    {sender?.display_name || 'Curious Member'}, {sender?.age}
                  </h4>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--color-text-muted)' }}>
                  <MapPin size={14} />
                  <span>{sender?.city || 'Nigeria'}</span>
                  <span>•</span>
                  <span>{sender?.bio?.slice(0, 50)}...</span>
                </div>
              </div>
            </div>

            {/* What they reacted to */}
            <div style={{
              padding: '12px 16px',
              backgroundColor: 'rgba(76, 29, 149, 0.15)',
              borderRadius: 'var(--radius-md)',
              borderLeft: '4px solid var(--color-violet-500)',
              fontSize: '13px',
              color: 'var(--color-text-secondary)',
            }}>
              <span style={{ fontWeight: 700, color: 'var(--color-violet-400)', textTransform: 'uppercase', fontSize: '11px', display: 'block', marginBottom: '4px' }}>
                Responded to your {spark.target_type.replace('_', ' ')}:
              </span>
              "{spark.target_content}"
            </div>

            {/* Their Spark Comment */}
            <div style={{
              padding: '16px',
              backgroundColor: 'rgba(244, 63, 94, 0.08)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(244, 63, 94, 0.2)',
            }}>
              <span style={{ fontWeight: 700, color: 'var(--color-coral-400)', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
                <Sparkles size={14} />
                Their Spark:
              </span>
              <p style={{ fontSize: '15px', color: '#ffffff', lineHeight: 1.5, fontWeight: 500 }}>
                "{spark.comment}"
              </p>
            </div>

            {/* Actions: Accept or Pass */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px', paddingTop: '8px' }}>
              <button
                onClick={() => handlePass(spark.id)}
                disabled={isBusy}
                style={{
                  padding: '8px 18px',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--color-surface-border)',
                  color: 'var(--color-text-muted)',
                  fontSize: '13px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <X size={16} />
                Pass
              </button>

              <button
                onClick={() => handleAccept(spark.id)}
                disabled={isBusy}
                style={{
                  padding: '10px 24px',
                  borderRadius: 'var(--radius-full)',
                  background: 'linear-gradient(135deg, var(--color-violet-600), var(--color-coral-500))',
                  color: '#ffffff',
                  fontSize: '14px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: 'var(--shadow-coral-glow)',
                }}
              >
                <Check size={16} />
                {isBusy ? 'Connecting...' : 'Accept Spark & Match'}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
