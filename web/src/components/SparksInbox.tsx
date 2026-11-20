import React, { useState } from 'react';
import { Heart, Check, X, MapPin } from 'lucide-react';
import { CupiddleIcon } from './CupiddleLogo';
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
      <div style={{ textAlign: 'center', padding: '60px 20px', color: '#E0D4D8' }}>
        <CupiddleIcon size={36} color="#FF1F6A" style={{ margin: '0 auto 12px' }} />
        <p style={{ fontWeight: 600 }}>Loading your Sparks inbox...</p>
      </div>
    );
  }

  if (sparkList.length === 0) {
    return (
      <div
        className="editorial-card-lift animate-modal-spring"
        style={{
          maxWidth: '440px',
          margin: '30px auto',
          padding: '40px 20px',
          textAlign: 'center',
          backgroundColor: '#170E12',
          borderRadius: '24px',
          border: '1px solid rgba(255, 31, 106, 0.25)',
          boxShadow: '0 16px 40px rgba(0, 0, 0, 0.6)',
          color: '#FFFFFF',
        }}
      >
        <div
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: '#5E081E',
            border: '1px solid #FF1F6A',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 18px',
            boxShadow: '0 0 16px rgba(255, 31, 106, 0.4)',
          }}
        >
          <Heart size={28} color="#FF1F6A" />
        </div>
        <h3
          style={{
            fontSize: '22px',
            fontWeight: 800,
            color: '#FFFFFF',
            marginBottom: '8px',
            letterSpacing: '-0.02em',
            fontFamily: "'Playfair Display', serif",
            fontStyle: 'italic',
          }}
        >
          No Pending Sparks Yet
        </h3>
        <p style={{ fontSize: '14px', color: '#E0D4D8', lineHeight: 1.5, margin: '0 auto 8px', maxWidth: '340px' }}>
          When people connect with your Rabbit Hole, Defend This Take perspective, or Gate Question in the Idea Stream, their curious sparks will arrive here.
        </p>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', maxWidth: '480px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
        <div>
          <h2
            style={{
              fontSize: '24px',
              fontWeight: 800,
              color: '#FFFFFF',
              letterSpacing: '-0.02em',
              fontFamily: "'Playfair Display', serif",
              fontStyle: 'italic',
              margin: 0,
            }}
          >
            Sparks Inbox
          </h2>
          <p style={{ fontSize: '13px', color: '#E0D4D8', marginTop: '2px', margin: 0 }}>
            People who connected directly with your perspective.
          </p>
        </div>
        <span
          style={{
            padding: '4px 12px',
            backgroundColor: '#5E081E',
            color: '#FF1F6A',
            border: '1px solid #FF1F6A',
            borderRadius: '1000px',
            fontSize: '12px',
            fontWeight: 800,
            boxShadow: '0 0 10px rgba(255, 31, 106, 0.3)',
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
              backgroundColor: '#170E12',
              borderRadius: '24px',
              border: '1px solid rgba(255, 31, 106, 0.22)',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              boxShadow: '0 12px 32px rgba(0, 0, 0, 0.55)',
              color: '#FFFFFF',
            }}
          >
            {/* Sender Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <img
                src={photo}
                alt={sender?.display_name || 'Sender'}
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid #FF1F6A',
                  backgroundColor: '#0D080A',
                }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <h4
                  style={{
                    fontSize: '18px',
                    fontWeight: 800,
                    color: '#FFFFFF',
                    letterSpacing: '-0.01em',
                    margin: 0,
                    fontFamily: "'Playfair Display', serif",
                    fontStyle: 'italic',
                  }}
                >
                  {sender?.display_name || 'Curious Member'}, {sender?.age}
                </h4>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '12px',
                    color: '#E0D4D8',
                    marginTop: '2px',
                    flexWrap: 'wrap',
                  }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                    <MapPin size={12} color="#FF1F6A" />
                    {sender?.city ? `${sender.city}` : 'Nigeria'}
                  </span>
                  {sender?.campus && (
                    <>
                      <span>•</span>
                      <span style={{ color: '#FF1F6A', fontWeight: 700 }}>{sender.campus}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* What they reacted to */}
            <div
              style={{
                padding: '12px 14px',
                backgroundColor: '#1E1116',
                borderRadius: '14px',
                border: '1px solid rgba(255, 31, 106, 0.15)',
                borderLeft: '4px solid #FF1F6A',
                fontSize: '13px',
                color: '#E0D4D8',
              }}
            >
              <span
                style={{
                  fontWeight: 800,
                  color: '#FF1F6A',
                  textTransform: 'uppercase',
                  fontSize: '10px',
                  display: 'block',
                  marginBottom: '2px',
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
                padding: '14px 16px',
                backgroundColor: 'rgba(94, 8, 30, 0.35)',
                borderRadius: '16px',
                border: '1px solid rgba(255, 31, 106, 0.3)',
              }}
            >
              <span
                style={{
                  fontWeight: 800,
                  color: '#FF1F6A',
                  fontSize: '11px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginBottom: '4px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                <CupiddleIcon size={13} color="#FF1F6A" />
                Their Spark Response:
              </span>
              <p
                style={{
                  fontSize: '14px',
                  color: '#FFFFFF',
                  lineHeight: 1.45,
                  fontWeight: 600,
                  margin: 0,
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
                gap: '10px',
                paddingTop: '4px',
              }}
            >
              <button
                onClick={() => handlePass(spark.id)}
                disabled={isBusy}
                style={{
                  padding: '9px 18px',
                  borderRadius: '100px',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#E0D4D8',
                  fontSize: '13px',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  cursor: isBusy ? 'not-allowed' : 'pointer',
                }}
              >
                <X size={15} />
                Pass
              </button>

              <button
                onClick={() => handleAccept(spark.id)}
                disabled={isBusy}
                style={{
                  padding: '10px 22px',
                  borderRadius: '100px',
                  backgroundColor: '#FF1F6A',
                  color: '#ffffff',
                  fontSize: '13px',
                  fontWeight: 800,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 0 16px rgba(255, 31, 106, 0.45)',
                  border: 'none',
                  cursor: isBusy ? 'not-allowed' : 'pointer',
                }}
              >
                <Check size={15} color="#ffffff" />
                {isBusy ? 'Connecting...' : 'Accept & Match'}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
