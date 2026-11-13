import React, { useState } from 'react';
import { MapPin, CheckCircle, Volume2, X, Compass, Lightbulb, Flame, BookOpen } from 'lucide-react';
import { CupiddleIcon } from './CupiddleLogo';
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
    <div
      className="editorial-card-lift"
      style={{
        maxWidth: '680px',
        margin: '0 auto',
        backgroundColor: 'var(--color-paper-white, #ffffff)',
        borderRadius: 'var(--radius-cards, 24px)',
        border: '1.5px solid var(--color-bumble-ink, #202020)',
        boxShadow: 'var(--shadow-sm, 0px 1px 8px rgba(32, 32, 32, 0.12))',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Photo & Header */}
      <div style={{ position: 'relative', height: '420px', backgroundColor: '#e5e5e5' }}>
        <img
          src={primaryPhoto}
          alt={profile.display_name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />

        {/* Verification Badge (Top Left) */}
        <div style={{ position: 'absolute', top: '16px', left: '16px', display: 'flex', gap: '8px' }}>
          <span
            className="animate-pulse-gentle"
            style={{
              backgroundColor: 'var(--color-paper-white, #ffffff)',
              color: 'var(--color-bumble-ink, #202020)',
              fontSize: '12px',
              fontWeight: 700,
              padding: '6px 14px',
              borderRadius: 'var(--radius-badges, 1000px)',
              border: '1.5px solid var(--color-bumble-ink, #202020)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 8px rgba(32, 32, 32, 0.15)',
            }}
          >
            <CheckCircle size={14} color="var(--color-bumble-ink, #202020)" />
            {profile.verification_badge || 'Verified Human'}
          </span>
        </div>

        {/* Spark Photo Action (Top Right) */}
        <button
          onClick={() => onSpark('photo', `Photo of ${profile.display_name}`)}
          className="pill-interactive"
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            backgroundColor: 'var(--color-paper-white, #ffffff)',
            color: 'var(--color-bumble-ink, #202020)',
            padding: '8px 16px',
            borderRadius: 'var(--radius-badges, 1000px)',
            fontSize: '13px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            border: '1.5px solid var(--color-bumble-ink, #202020)',
            boxShadow: '0 2px 8px rgba(32, 32, 32, 0.15)',
          }}
        >
          <CupiddleIcon size={16} color="var(--color-bumble-ink, #202020)" />
          Spark Photo
        </button>

        {/* Bottom Photo Overlay */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '24px',
            background: 'linear-gradient(to top, rgba(32, 32, 32, 0.88) 0%, rgba(32, 32, 32, 0.4) 65%, transparent 100%)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h2
              style={{
                fontSize: '32px',
                fontWeight: 800,
                color: '#ffffff',
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
              }}
            >
              {profile.display_name}, {profile.age}
            </h2>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginTop: '8px',
              flexWrap: 'wrap',
            }}
          >
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                color: '#ffffff',
                padding: '4px 10px',
                borderRadius: 'var(--radius-badges, 1000px)',
                fontSize: '12px',
                fontWeight: 600,
                backdropFilter: 'blur(4px)',
              }}
            >
              <MapPin size={13} />
              {profile.city ? `${profile.city}, Nigeria` : 'Nigeria'}
            </span>

            <span
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                color: '#ffffff',
                padding: '4px 10px',
                borderRadius: 'var(--radius-badges, 1000px)',
                fontSize: '12px',
                fontWeight: 600,
                backdropFilter: 'blur(4px)',
              }}
            >
              {distance_km > 0 ? `${distance_km} km away` : 'Nearby'}
            </span>

            {profile.dating_intentions && (
              <span
                style={{
                  backgroundColor: 'var(--color-bumble-honey, #ffdb5b)',
                  color: 'var(--color-bumble-ink, #202020)',
                  padding: '4px 12px',
                  borderRadius: 'var(--radius-badges, 1000px)',
                  fontSize: '12px',
                  fontWeight: 700,
                }}
              >
                {profile.dating_intentions}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Profile Details & Curiosity Prompts */}
      <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
        {/* Bio */}
        {profile.bio && (
          <p
            style={{
              fontSize: '17px',
              color: 'var(--color-bumble-ink, #202020)',
              lineHeight: 1.6,
              letterSpacing: '0.01em',
            }}
          >
            {profile.bio}
          </p>
        )}

        {/* Audio Rant (if available) */}
        {profile.audio_intro_url && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 20px',
              backgroundColor: 'var(--color-mist, #f3f3f3)',
              borderRadius: 'var(--radius-buttons, 16px)',
              border: '1.5px solid var(--color-bumble-ink, #202020)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-bumble-honey, #ffdb5b)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid var(--color-bumble-ink, #202020)',
                }}
              >
                <Volume2 size={18} color="var(--color-bumble-ink, #202020)" />
              </div>
              <div>
                <span
                  style={{
                    fontSize: '15px',
                    fontWeight: 700,
                    color: 'var(--color-bumble-ink, #202020)',
                    display: 'block',
                  }}
                >
                  30-Sec Audio Rant
                </span>
                <span style={{ fontSize: '12px', color: 'var(--color-graphite, #575656)' }}>
                  A fascinating idea explained in their own voice
                </span>
              </div>
            </div>
            <button
              onClick={handlePlayAudio}
              className="btn-bumble-action"
              style={{
                padding: '8px 18px',
                borderRadius: 'var(--radius-badges, 1000px)',
                backgroundColor: 'var(--color-bumble-ink, #202020)',
                color: 'var(--color-paper-white, #ffffff)',
                fontSize: '13px',
                fontWeight: 700,
              }}
            >
              {isPlayingAudio ? 'Playing...' : 'Listen'}
            </button>
          </div>
        )}

        {/* 1. Rabbit Hole Prompt (Pollen #fff386 Frame) */}
        {profile.rabbit_hole && (
          <div
            style={{
              padding: '20px',
              backgroundColor: 'var(--color-pollen, #fff386)',
              borderRadius: 'var(--radius-buttons, 16px)',
              border: '1.5px solid var(--color-bumble-ink, #202020)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '12px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: 'var(--color-bumble-ink, #202020)',
                }}
              >
                <Compass size={15} />
                My Rabbit Hole
              </span>
              <button
                onClick={() => onSpark('rabbit_hole', profile.rabbit_hole)}
                className="pill-interactive"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: 'var(--color-bumble-ink, #202020)',
                  backgroundColor: 'var(--color-paper-white, #ffffff)',
                  border: '1px solid var(--color-bumble-ink, #202020)',
                  padding: '5px 12px',
                  borderRadius: 'var(--radius-badges, 1000px)',
                }}
              >
                <CupiddleIcon size={14} color="var(--color-bumble-ink, #202020)" />
                Spark This
              </button>
            </div>
            <p
              style={{
                fontSize: '16px',
                color: 'var(--color-bumble-ink, #202020)',
                lineHeight: 1.5,
                fontWeight: 600,
              }}
            >
              "{profile.rabbit_hole}"
            </p>
          </div>
        )}

        {/* 2. Defend This Take Prompt (Mist #f3f3f3 Frame) */}
        {profile.defend_take && (
          <div
            style={{
              padding: '20px',
              backgroundColor: 'var(--color-mist, #f3f3f3)',
              borderRadius: 'var(--radius-buttons, 16px)',
              border: '1.5px solid var(--color-bumble-ink, #202020)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '12px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: 'var(--color-bumble-ink, #202020)',
                }}
              >
                <Flame size={15} />
                Defend This Take
              </span>
              <button
                onClick={() => onSpark('defend_take', profile.defend_take)}
                className="pill-interactive"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: 'var(--color-bumble-ink, #202020)',
                  backgroundColor: 'var(--color-paper-white, #ffffff)',
                  border: '1px solid var(--color-bumble-ink, #202020)',
                  padding: '5px 12px',
                  borderRadius: 'var(--radius-badges, 1000px)',
                }}
              >
                <CupiddleIcon size={14} color="var(--color-bumble-ink, #202020)" />
                Challenge / Spark
              </button>
            </div>
            <p
              style={{
                fontSize: '16px',
                color: 'var(--color-bumble-ink, #202020)',
                lineHeight: 1.5,
                fontWeight: 600,
                fontStyle: 'italic',
              }}
            >
              "{profile.defend_take}"
            </p>
          </div>
        )}

        {/* 3. Teach Me Something Prompt (Paper White #ffffff Frame) */}
        {profile.teach_me && (
          <div
            style={{
              padding: '20px',
              backgroundColor: 'var(--color-paper-white, #ffffff)',
              borderRadius: 'var(--radius-buttons, 16px)',
              border: '1.5px solid var(--color-bumble-ink, #202020)',
              boxShadow: 'var(--shadow-sm, 0px 1px 8px rgba(32, 32, 32, 0.12))',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '12px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: 'var(--color-bumble-ink, #202020)',
                }}
              >
                <Lightbulb size={15} />
                Teach Me Something
              </span>
              <button
                onClick={() => onSpark('teach_me', profile.teach_me)}
                className="pill-interactive"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: 'var(--color-bumble-ink, #202020)',
                  backgroundColor: 'var(--color-bumble-honey, #ffdb5b)',
                  border: '1px solid var(--color-bumble-ink, #202020)',
                  padding: '5px 12px',
                  borderRadius: 'var(--radius-badges, 1000px)',
                }}
              >
                <CupiddleIcon size={14} color="var(--color-bumble-ink, #202020)" />
                Spark This
              </button>
            </div>
            <p
              style={{
                fontSize: '16px',
                color: 'var(--color-bumble-ink, #202020)',
                lineHeight: 1.5,
                fontWeight: 600,
              }}
            >
              "{profile.teach_me}"
            </p>
          </div>
        )}

        {/* My World Tags */}
        {profile.my_world_tags && profile.my_world_tags.length > 0 && (
          <div>
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12px',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: 'var(--color-graphite, #575656)',
                marginBottom: '10px',
              }}
            >
              <BookOpen size={14} />
              My World (Books, Music, Games, Arts)
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {profile.my_world_tags.map((tag) => (
                <span
                  key={tag}
                  className="pill-interactive"
                  style={{
                    padding: '8px 16px',
                    backgroundColor: 'var(--color-mist, #f3f3f3)',
                    borderRadius: 'var(--radius-badges, 1000px)',
                    fontSize: '14px',
                    fontWeight: 700,
                    color: 'var(--color-bumble-ink, #202020)',
                    border: '1px solid var(--color-bumble-ink, #202020)',
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
          <div
            style={{
              padding: '12px 16px',
              backgroundColor: 'var(--color-pollen, #fff386)',
              borderRadius: 'var(--radius-buttons, 16px)',
              border: '1px solid var(--color-bumble-ink, #202020)',
              fontSize: '14px',
              fontWeight: 600,
              color: 'var(--color-bumble-ink, #202020)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <CupiddleIcon size={16} color="var(--color-bumble-ink, #202020)" />
            <span>
              Shared Passions: <strong>{shared_interests.join(', ')}</strong>
            </span>
          </div>
        )}

        {/* Pass and General Spark Controls */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '24px',
            paddingTop: '20px',
            borderTop: '1.5px solid #e0e0e0',
          }}
        >
          <button
            onClick={onPass}
            className="btn-bumble-action"
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-mist, #f3f3f3)',
              border: '1.5px solid var(--color-bumble-ink, #202020)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-bumble-ink, #202020)',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-sm, 0px 1px 8px rgba(32, 32, 32, 0.12))',
            }}
            title="Pass (Discover next profile)"
          >
            <X size={26} />
          </button>

          <button
            onClick={() => onSpark('general', `Curiosity Profile of ${profile.display_name}`)}
            className="btn-bumble-action"
            style={{
              padding: '16px 36px',
              borderRadius: 'var(--radius-buttons, 16px)',
              backgroundColor: 'var(--color-bumble-ink, #202020)',
              color: 'var(--color-paper-white, #ffffff)',
              fontSize: '16px',
              fontWeight: 700,
              letterSpacing: '0.015em',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: 'var(--shadow-sm, 0px 1px 8px rgba(32, 32, 32, 0.12))',
            }}
          >
            <CupiddleIcon size={20} color="var(--color-bumble-honey, #ffdb5b)" />
            Send a Spark Free
          </button>
        </div>
      </div>
    </div>
  );
};
