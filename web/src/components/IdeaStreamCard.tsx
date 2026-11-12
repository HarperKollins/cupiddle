import React, { useState } from 'react';
import { Sparkles, MapPin, CheckCircle, Volume2, X, Compass, Lightbulb, Flame, BookOpen } from 'lucide-react';
import { DiscoveryCandidate } from '../types';

interface IdeaStreamCardProps {
  candidate: DiscoveryCandidate;
  onSpark: (targetType: 'rabbit_hole' | 'defend_take' | 'teach_me' | 'photo' | 'general', targetContent: string) => void;
  onPass: () => void;
}

export const IdeaStreamCard: React.FC<IdeaStreamCardProps> = ({ candidate, onSpark, onPass }) => {
  const { profile, distance_km, shared_interests } = candidate;
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const primaryPhoto = profile.photos && profile.photos.length > 0 
    ? profile.photos[0].url 
    : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80';

  const handlePlayAudio = () => {
    if (!profile.audio_intro_url) return;
    setIsPlayingAudio(true);
    const audio = new Audio(profile.audio_intro_url);
    audio.play();
    audio.onended = () => setIsPlayingAudio(false);
  };

  return (
    <div style={{
      maxWidth: '680px',
      margin: '0 auto',
      backgroundColor: 'var(--color-surface-card)',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--color-surface-border)',
      boxShadow: 'var(--shadow-subtle)',
      overflow: 'hidden',
      position: 'relative',
    }}>
      {/* Photo & Header */}
      <div style={{ position: 'relative', height: '380px', backgroundColor: '#100a1c' }}>
        <img
          src={primaryPhoto}
          alt={profile.display_name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '24px',
          background: 'linear-gradient(to top, rgba(13, 8, 20, 0.95), transparent)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#ffffff' }}>
              {profile.display_name}, {profile.age}
            </h2>
            {profile.is_verified && (
              <span title={profile.verification_badge || "Verified Human"}>
                <CheckCircle size={22} color="var(--color-violet-400)" />
              </span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '6px', color: 'var(--color-text-secondary)', fontSize: '14px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <MapPin size={16} />
              {profile.city ? `${profile.city}, Nigeria` : 'Nigeria'}
            </span>
            <span>•</span>
            <span>Approx. {distance_km > 0 ? `${distance_km} km away` : 'Nearby'}</span>
            {profile.dating_intentions && (
              <>
                <span>•</span>
                <span style={{ color: 'var(--color-coral-300)' }}>{profile.dating_intentions}</span>
              </>
            )}
          </div>
        </div>

        {/* Spark photo action */}
        <button
          onClick={() => onSpark('photo', `Photo of ${profile.display_name}`)}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(8px)',
            color: '#ffffff',
            padding: '8px 14px',
            borderRadius: 'var(--radius-full)',
            fontSize: '12px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          }}
        >
          <Sparkles size={14} color="var(--color-coral-400)" />
          Spark Photo
        </button>
      </div>

      {/* Profile Details & Curiosity Prompts */}
      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Bio */}
        {profile.bio && (
          <p style={{ fontSize: '16px', color: 'var(--color-text-primary)', lineHeight: 1.6 }}>
            {profile.bio}
          </p>
        )}

        {/* Audio Rant (if available) */}
        {profile.audio_intro_url && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 18px',
            backgroundColor: 'rgba(124, 58, 237, 0.1)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(124, 58, 237, 0.25)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Volume2 size={20} color="var(--color-violet-400)" />
              <div>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff' }}>30-Sec Audio Rant</span>
                <span style={{ display: 'block', fontSize: '11px', color: 'var(--color-text-muted)' }}>
                  A fascinating idea explained in their voice
                </span>
              </div>
            </div>
            <button
              onClick={handlePlayAudio}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--color-violet-600)',
                color: '#ffffff',
                fontSize: '13px',
                fontWeight: 600,
              }}
            >
              {isPlayingAudio ? 'Playing...' : 'Listen'}
            </button>
          </div>
        )}

        {/* 1. Rabbit Hole Prompt */}
        {profile.rabbit_hole && (
          <div style={{
            padding: '18px',
            backgroundColor: 'rgba(76, 29, 149, 0.2)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(139, 92, 246, 0.25)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: 'var(--color-violet-400)',
              }}>
                <Compass size={15} />
                My Rabbit Hole
              </span>
              <button
                onClick={() => onSpark('rabbit_hole', profile.rabbit_hole)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: 'var(--color-coral-400)',
                  backgroundColor: 'rgba(244, 63, 94, 0.12)',
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-full)',
                }}
              >
                <Sparkles size={13} />
                Spark This
              </button>
            </div>
            <p style={{ fontSize: '15px', color: '#ffffff', lineHeight: 1.5, fontWeight: 500 }}>
              "{profile.rabbit_hole}"
            </p>
          </div>
        )}

        {/* 2. Defend This Take Prompt */}
        {profile.defend_take && (
          <div style={{
            padding: '18px',
            backgroundColor: 'rgba(244, 63, 94, 0.08)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(244, 63, 94, 0.25)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: 'var(--color-coral-400)',
              }}>
                <Flame size={15} />
                Defend This Take
              </span>
              <button
                onClick={() => onSpark('defend_take', profile.defend_take)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: 'var(--color-coral-400)',
                  backgroundColor: 'rgba(244, 63, 94, 0.12)',
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-full)',
                }}
              >
                <Sparkles size={13} />
                Challenge / Spark
              </button>
            </div>
            <p style={{ fontSize: '15px', color: '#ffffff', lineHeight: 1.5, fontWeight: 500 }}>
              "{profile.defend_take}"
            </p>
          </div>
        )}

        {/* 3. Teach Me Something Prompt */}
        {profile.teach_me && (
          <div style={{
            padding: '18px',
            backgroundColor: 'rgba(245, 158, 11, 0.08)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(245, 158, 11, 0.25)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: 'var(--color-amber-500)',
              }}>
                <Lightbulb size={15} />
                Teach Me Something
              </span>
              <button
                onClick={() => onSpark('teach_me', profile.teach_me)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: 'var(--color-coral-400)',
                  backgroundColor: 'rgba(244, 63, 94, 0.12)',
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-full)',
                }}
              >
                <Sparkles size={13} />
                Spark This
              </button>
            </div>
            <p style={{ fontSize: '15px', color: '#ffffff', lineHeight: 1.5, fontWeight: 500 }}>
              "{profile.teach_me}"
            </p>
          </div>
        )}

        {/* My World Tags */}
        {profile.my_world_tags && profile.my_world_tags.length > 0 && (
          <div>
            <span style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--color-text-muted)',
              marginBottom: '10px',
            }}>
              <BookOpen size={14} />
              My World (Books, Music, Games, Arts)
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {profile.my_world_tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: 'rgba(45, 31, 69, 0.6)',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '13px',
                    color: 'var(--color-lavender-200)',
                    border: '1px solid var(--color-surface-border)',
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Shared Interests Overlap */}
        {shared_interests && shared_interests.length > 0 && (
          <div style={{
            fontSize: '13px',
            color: 'var(--color-violet-400)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            paddingTop: '6px',
          }}>
            <Sparkles size={14} />
            <span>You both share interest in: <strong>{shared_interests.join(', ')}</strong></span>
          </div>
        )}

        {/* Pass and General Spark Controls */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '24px',
          paddingTop: '16px',
          borderTop: '1px solid var(--color-surface-border)',
        }}>
          <button
            onClick={onPass}
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-surface-bg)',
              border: '1px solid var(--color-surface-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-text-muted)',
            }}
            title="Pass"
          >
            <X size={24} />
          </button>

          <button
            onClick={() => onSpark('general', `Curiosity Profile of ${profile.display_name}`)}
            style={{
              padding: '14px 32px',
              borderRadius: 'var(--radius-full)',
              background: 'linear-gradient(135deg, var(--color-violet-600), var(--color-coral-500))',
              color: '#ffffff',
              fontSize: '15px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: 'var(--shadow-coral-glow)',
            }}
          >
            <Sparkles size={18} />
            Send a Spark
          </button>
        </div>
      </div>
    </div>
  );
};

