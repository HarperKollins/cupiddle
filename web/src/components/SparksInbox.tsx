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

  const sparkList = sparks || [];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--color-graphite, #575656)' }}>
        <Sparkles size={32} className="animate-pulse-gentle" style={{ margin: '0 auto 12px', color: 'var(--color-bumble-ink, #202020)' }} />
        <p style={{ fontWeight: 600 }}>Loading your Sparks inbox...</p>
      </div>
    );
  }

  if (sparkList.length === 0) {
    return (
      <div
        className="editorial-card-lift"
        style={{
          maxWidth: '560px',
          margin: '40px auto',
          padding: '48px 32px',
          textAlign: 'center',
          backgroundColor: 'var(--color-paper-white, #ffffff)',
          borderRadius: 'var(--radius-cards, 24px)',
          border: '1.5px solid var(--color-bumble-ink, #202020)',
          boxShadow: 'var(--shadow-sm, 0px 1px 8px rgba(32, 32, 32, 0.12))',
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-bumble-honey, #ffdb5b)',
            border: '1.5px solid var(--color-bumble-ink, #202020)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 18px',
          }}
        >
          <Heart size={30} color="var(--color-bumble-ink, #202020)" />
        </div>
        <h3
          style={{
            fontSize: '24px',
            fontWeight: 800,
            color: 'var(--color-bumble-ink, #202020)',
            marginBottom: '8px',
            letterSpacing: '-0.02em',
          }}
        >
          No Pending Sparks Yet
        </h3>
        <p style={{ fontSize: '15px', color: 'var(--color-graphite, #575656)', lineHeight: 1.5 }}>
          When people discover your Rabbit Hole, Defend This Take opinion, or profile questions in the Idea Stream, their curious responses will arrive here.
        </p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
        <div>
          <h2
            style={{
              fontSize: '28px',
              fontWeight: 800,
              color: 'var(--color-bumble-ink, #202020)',
              letterSpacing: '-0.02em',
            }}
          >
            Sparks Inbox
          </h2>
          <p style={{ fontSize: '15px', color: 'var(--color-graphite, #575656)', marginTop: '2px' }}>
            People who connected directly with ideas in your profile.
          </p>
        </div>
        <span
          style={{
            padding: '6px 14px',
            backgroundColor: 'var(--color-bumble-honey, #ffdb5b)',
            color: 'var(--color-bumble-ink, #202020)',
            border: '1.5px solid var(--color-bumble-ink, #202020)',
            borderRadius: 'var(--radius-badges, 1000px)',
            fontSize: '13px',
            fontWeight: 800,
          }}
        >
          {sparkList.length} Pending
        </span>
      </div>

      {sparkList.map((spark) => {
        const sender = spark.sender_profile;
        const photo = sender?.photos && sender.photos.length > 0
          ? sender.photos[0].url
          : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80';

        const isBusy = processingId === spark.id;

        return (
          <div
            key={spark.id}
            className="editorial-card-lift"
            style={{
              backgroundColor: 'var(--color-paper-white, #ffffff)',
              borderRadius: 'var(--radius-cards, 24px)',
              border: '1.5px solid var(--color-bumble-ink, #202020)',
              padding: '28px',
              display: 'flex',
              flexDirection: 'column',
              gap: '18px',
              boxShadow: 'var(--shadow-sm, 0px 1px 8px rgba(32, 32, 32, 0.12))',
            }}
          >
            {/* Sender Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <img
                src={photo}
                alt={sender?.display_name || 'Sender'}
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid var(--color-bumble-ink, #202020)',
                }}
              />
              <div style={{ flex: 1 }}>
                <h4
                  style={{
                    fontSize: '20px',
                    fontWeight: 800,
                    color: 'var(--color-bumble-ink, #202020)',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {sender?.display_name || 'Curious Member'}, {sender?.age}
                </h4>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '13px',
                    color: 'var(--color-graphite, #575656)',
                    marginTop: '2px',
                    flexWrap: 'wrap',
                  }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                    <MapPin size={14} />
                    {sender?.city ? `${sender.city}, Nigeria` : 'Nigeria'}
                  </span>
                  {sender?.bio && (
                    <>
                      <span>•</span>
                      <span>{sender.bio.slice(0, 50)}...</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* What they reacted to */}
            <div
              style={{
                padding: '14px 18px',
                backgroundColor: 'var(--color-mist, #f3f3f3)',
                borderRadius: 'var(--radius-buttons, 16px)',
                border: '1px solid #e0e0e0',
                borderLeft: '5px solid var(--color-bumble-honey, #ffdb5b)',
                fontSize: '14px',
                color: 'var(--color-bumble-ink, #202020)',
              }}
            >
              <span
                style={{
                  fontWeight: 800,
                  color: 'var(--color-bumble-ink, #202020)',
                  textTransform: 'uppercase',
                  fontSize: '11px',
                  display: 'block',
                  marginBottom: '4px',
                  letterSpacing: '0.04em',
                }}
              >
                Responded to your {spark.target_type.replace('_', ' ')}:
              </span>
              "{spark.target_content}"
            </div>

            {/* Their Spark Comment */}
            <div
              style={{
                padding: '18px 20px',
                backgroundColor: 'var(--color-pollen, #fff386)',
                borderRadius: 'var(--radius-buttons, 16px)',
                border: '1.5px solid var(--color-bumble-ink, #202020)',
              }}
            >
              <span
                style={{
                  fontWeight: 800,
                  color: 'var(--color-bumble-ink, #202020)',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginBottom: '6px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                <Sparkles size={14} color="var(--color-bumble-ink, #202020)" />
                Their Spark Response:
              </span>
              <p
                style={{
                  fontSize: '16px',
                  color: 'var(--color-bumble-ink, #202020)',
                  lineHeight: 1.5,
                  fontWeight: 600,
                }}
              >
                "{spark.comment}"
              </p>
            </div>

            {/* Actions: Accept or Pass */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: '12px',
                paddingTop: '6px',
              }}
            >
              <button
                onClick={() => handlePass(spark.id)}
                disabled={isBusy}
                className="pill-interactive"
                style={{
                  padding: '10px 20px',
                  borderRadius: 'var(--radius-buttons, 16px)',
                  backgroundColor: 'var(--color-mist, #f3f3f3)',
                  border: '1px solid #e0e0e0',
                  color: 'var(--color-bumble-ink, #202020)',
                  fontSize: '14px',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: isBusy ? 'not-allowed' : 'pointer',
                }}
              >
                <X size={16} />
                Pass
              </button>

              <button
                onClick={() => handleAccept(spark.id)}
                disabled={isBusy}
                className="btn-bumble-action"
                style={{
                  padding: '12px 28px',
                  borderRadius: 'var(--radius-buttons, 16px)',
                  backgroundColor: 'var(--color-bumble-ink, #202020)',
                  color: 'var(--color-paper-white, #ffffff)',
                  fontSize: '15px',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: 'var(--shadow-sm, 0px 1px 8px rgba(32, 32, 32, 0.12))',
                  cursor: isBusy ? 'not-allowed' : 'pointer',
                }}
              >
                <Check size={16} color="var(--color-bumble-honey, #ffdb5b)" />
                {isBusy ? 'Connecting...' : 'Accept Spark & Match Free'}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
