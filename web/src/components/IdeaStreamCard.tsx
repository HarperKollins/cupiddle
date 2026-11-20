import React, { useState } from 'react';
import { Volume2, VolumeX, ShieldCheck, MapPin, GraduationCap, Lock, X } from 'lucide-react';
import { CupiddleIcon } from './CupiddleLogo';
import { DiscoveryCandidate } from '../types';
import { VIBE_TAGS } from './MoodTagSelector';

interface IdeaStreamCardProps {
  candidate: DiscoveryCandidate;
  onSpark: (targetType: string, targetContent: string) => void;
  onPass: () => void;
}

export const IdeaStreamCard: React.FC<IdeaStreamCardProps> = ({ candidate, onSpark, onPass }) => {
  const { profile, distance_km, shared_interests } = candidate;
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const matchedVibe = VIBE_TAGS.find((v) => v.id === profile.vibe_tag);

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
      className="editorial-card-lift animate-modal-spring"
      style={{
        width: '100%',
        maxWidth: 'var(--mobile-app-width, 480px)',
        margin: '0 auto',
        backgroundColor: '#170E12',
        borderRadius: '24px',
        border: '1px solid rgba(255, 31, 106, 0.22)',
        boxShadow: '0 16px 48px rgba(0, 0, 0, 0.65)',
        overflow: 'hidden',
        position: 'relative',
        color: '#FFFFFF',
      }}
    >
      {/* Photo & Silhouette 40px Blur Section */}
      <div style={{ position: 'relative', height: 'clamp(320px, 46vh, 420px)', backgroundColor: '#0D080A', overflow: 'hidden' }}>
        <img
          src={primaryPhoto}
          alt={profile.display_name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: 'blur(36px)',
            transform: 'scale(1.15)',
            transition: 'filter 0.3s ease',
          }}
        />

        {/* Compatibility and Privacy Badges (Top Left) */}
        <div style={{ position: 'absolute', top: '14px', left: '14px', display: 'flex', gap: '6px', flexWrap: 'wrap', zIndex: 2 }}>
          {candidate.compatibility_pct ? (
            <span
              style={{
                backgroundColor: '#5E081E',
                color: '#FFFFFF',
                fontSize: '11px',
                fontWeight: 800,
                padding: '5px 12px',
                borderRadius: '1000px',
                border: '1px solid #FF1F6A',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                boxShadow: '0 0 16px rgba(255, 31, 106, 0.45)',
              }}
            >
              ⚡ {candidate.compatibility_pct}% Match
            </span>
          ) : null}

          <span
            style={{
              backgroundColor: 'rgba(13, 8, 10, 0.8)',
              color: '#E0D4D8',
              fontSize: '11px',
              fontWeight: 700,
              padding: '5px 10px',
              borderRadius: '1000px',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
            }}
          >
            <Lock size={11} color="#FF1F6A" />
            Photo reveals on Spark
          </span>

          {profile.is_student_verified ? (
            <span
              style={{
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                color: '#34d399',
                fontSize: '11px',
                fontWeight: 800,
                padding: '5px 10px',
                borderRadius: '1000px',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <ShieldCheck size={13} color="#34d399" />
              Verified Student
            </span>
          ) : null}
        </div>

        {/* Spark Photo Action (Top Right) */}
        <button
          onClick={() => onSpark('photo', `Photo of ${profile.display_name}`)}
          className="pill-interactive"
          style={{
            position: 'absolute',
            top: '14px',
            right: '14px',
            backgroundColor: 'rgba(94, 8, 30, 0.75)',
            backdropFilter: 'blur(12px)',
            color: '#FFFFFF',
            padding: '6px 14px',
            borderRadius: '1000px',
            fontSize: '12px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            border: '1px solid rgba(255, 31, 106, 0.4)',
            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.3)',
            zIndex: 2,
          }}
        >
          <CupiddleIcon size={14} color="#FF1F6A" />
          Spark Photo
        </button>

        {/* Bottom Photo Overlay */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '24px 18px 16px',
            background: 'linear-gradient(to top, #170E12 0%, rgba(23, 14, 18, 0.82) 60%, transparent 100%)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
            <h2
              style={{
                fontSize: '26px',
                fontWeight: 800,
                color: '#FFFFFF',
                letterSpacing: '-0.02em',
                lineHeight: 1.1,
                margin: 0,
                fontFamily: "'Playfair Display', serif",
                fontStyle: 'italic',
              }}
            >
              {profile.display_name}, {profile.age}
            </h2>
            {profile.username && (
              <span
                style={{
                  fontSize: '14px',
                  fontWeight: 700,
                  color: '#FF1F6A',
                }}
              >
                @{profile.username}
              </span>
            )}
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginTop: '8px',
              flexWrap: 'wrap',
            }}
          >
            {/* Campus & Level Chip */}
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                color: '#E0D4D8',
                padding: '4px 10px',
                borderRadius: '1000px',
                fontSize: '11px',
                fontWeight: 700,
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <GraduationCap size={13} color="#FF1F6A" />
              {profile.campus || 'EBSU'} · {profile.level || '300L'}{profile.faculty ? ` (${profile.faculty})` : ''}
            </span>

            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                color: '#E0D4D8',
                padding: '4px 10px',
                borderRadius: '1000px',
                fontSize: '11px',
                fontWeight: 600,
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <MapPin size={12} color="#FF1F6A" />
              {distance_km !== undefined && distance_km !== null
                ? `${Math.round(distance_km)} km away`
                : (profile.city ? `${profile.city}` : 'Campus')}
            </span>

            {profile.dating_intentions && (
              <span
                style={{
                  backgroundColor: 'rgba(255, 31, 106, 0.12)',
                  color: '#FF1F6A',
                  border: '1px solid rgba(255, 31, 106, 0.25)',
                  padding: '4px 10px',
                  borderRadius: '1000px',
                  fontSize: '11px',
                  fontWeight: 700,
                }}
              >
                {profile.dating_intentions}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Profile Details & Prompts */}
      <div style={{ padding: '16px 18px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Live Broadcast Campus Vibe */}
        {matchedVibe && (
          <div
            style={{
              padding: '12px 14px',
              backgroundColor: '#221219',
              borderRadius: '16px',
              border: '1px solid rgba(255, 31, 106, 0.25)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <span style={{ fontSize: '24px' }}>{matchedVibe.emoji}</span>
            <div>
              <span style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#FF1F6A', display: 'block' }}>
                Campus Vibe Right Now
              </span>
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#FFFFFF' }}>
                {matchedVibe.label}
              </span>
            </div>
          </div>
        )}

        {/* Gatekeeper Question Section */}
        {profile.gate_question && (
          <div
            style={{
              padding: '16px',
              backgroundColor: '#221219',
              borderRadius: '18px',
              border: '1.5px dashed rgba(255, 31, 106, 0.45)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  fontSize: '11px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: '#FF1F6A',
                }}
              >
                <Lock size={13} />
                Connection Gate Question
              </span>
              <button
                onClick={() => onSpark('gate_question', profile.gate_question || '')}
                className="pill-interactive"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  fontSize: '11px',
                  fontWeight: 800,
                  color: '#FFFFFF',
                  backgroundColor: '#5E081E',
                  border: '1px solid #FF1F6A',
                  padding: '5px 12px',
                  borderRadius: '1000px',
                  cursor: 'pointer',
                  boxShadow: '0 0 10px rgba(255, 31, 106, 0.3)',
                }}
              >
                <CupiddleIcon size={12} color="#FFFFFF" />
                Answer to Connect
              </button>
            </div>
            <p
              style={{
                fontSize: '15px',
                color: '#FFFFFF',
                lineHeight: 1.5,
                fontWeight: 700,
                margin: 0,
              }}
            >
              &quot;{profile.gate_question}&quot;
            </p>
          </div>
        )}

        {/* Bio */}
        {profile.bio && (
          <div
            style={{
              padding: '14px 16px',
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.6, color: '#E0D4D8' }}>
              {profile.bio}
            </p>
          </div>
        )}

        {/* Audio Intro */}
        {profile.audio_intro_url && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              backgroundColor: '#221219',
              borderRadius: '16px',
              border: '1px solid rgba(255, 31, 106, 0.2)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                onClick={handlePlayAudio}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: '#FF1F6A',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                {isPlayingAudio ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
              <div>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#FFFFFF', display: 'block' }}>
                  {isPlayingAudio ? 'Listening to voice...' : 'Voice Intro'}
                </span>
                <span style={{ fontSize: '11px', color: '#9E8C93' }}>
                  {profile.audio_intro_duration ? `${profile.audio_intro_duration}s` : 'Voice note'}
                </span>
              </div>
            </div>
            <button
              onClick={() => onSpark('audio_intro', 'Voice Intro')}
              className="pill-interactive"
              style={{
                fontSize: '12px',
                fontWeight: 700,
                color: '#FF1F6A',
                backgroundColor: 'rgba(255, 31, 106, 0.1)',
                border: '1px solid rgba(255, 31, 106, 0.3)',
                padding: '6px 12px',
                borderRadius: '1000px',
              }}
            >
              Spark Voice
            </button>
          </div>
        )}

        {/* Curiosity Prompt 1: Rabbit Hole */}
        {profile.rabbit_hole && (
          <div
            style={{
              padding: '16px',
              backgroundColor: '#1E1116',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  color: '#FF1F6A',
                }}
              >
                Obsession / Rabbit Hole
              </span>
              <button
                onClick={() => onSpark('rabbit_hole', profile.rabbit_hole)}
                className="pill-interactive"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#E0D4D8',
                  backgroundColor: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  padding: '4px 10px',
                  borderRadius: '1000px',
                }}
              >
                <CupiddleIcon size={12} color="#FF1F6A" />
                Spark
              </button>
            </div>
            <p style={{ fontSize: '14px', lineHeight: 1.5, color: '#FFFFFF', margin: 0 }}>
              &quot;{profile.rabbit_hole}&quot;
            </p>
          </div>
        )}

        {/* Curiosity Prompt 2: Defend Take */}
        {profile.defend_take && (
          <div
            style={{
              padding: '16px',
              backgroundColor: '#1E1116',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  color: '#FF1F6A',
                }}
              >
                Defend This Take
              </span>
              <button
                onClick={() => onSpark('defend_take', profile.defend_take)}
                className="pill-interactive"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#E0D4D8',
                  backgroundColor: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  padding: '4px 10px',
                  borderRadius: '1000px',
                }}
              >
                <CupiddleIcon size={12} color="#FF1F6A" />
                Challenge
              </button>
            </div>
            <p style={{ fontSize: '14px', lineHeight: 1.5, color: '#FFFFFF', margin: 0 }}>
              &quot;{profile.defend_take}&quot;
            </p>
          </div>
        )}

        {/* Curiosity Prompt 3: Teach Me */}
        {profile.teach_me && (
          <div
            style={{
              padding: '16px',
              backgroundColor: '#1E1116',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  color: '#FF1F6A',
                }}
              >
                Can Teach You
              </span>
              <button
                onClick={() => onSpark('teach_me', profile.teach_me)}
                className="pill-interactive"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#E0D4D8',
                  backgroundColor: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  padding: '4px 10px',
                  borderRadius: '1000px',
                }}
              >
                <CupiddleIcon size={12} color="#FF1F6A" />
                Spark
              </button>
            </div>
            <p style={{ fontSize: '14px', lineHeight: 1.5, color: '#FFFFFF', margin: 0 }}>
              &quot;{profile.teach_me}&quot;
            </p>
          </div>
        )}

        {/* Campus World Tags */}
        {profile.my_world_tags && profile.my_world_tags.length > 0 && (
          <div>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                color: '#9E8C93',
                display: 'block',
                marginBottom: '8px',
              }}
            >
              Their World
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {profile.my_world_tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    padding: '5px 12px',
                    backgroundColor: 'rgba(255, 31, 106, 0.08)',
                    borderRadius: '1000px',
                    fontSize: '12px',
                    fontWeight: 700,
                    color: '#E0D4D8',
                    border: '1px solid rgba(255, 31, 106, 0.25)',
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
              padding: '12px 14px',
              backgroundColor: '#3A0512',
              borderRadius: '16px',
              border: '1px solid rgba(255, 31, 106, 0.35)',
              fontSize: '13px',
              fontWeight: 600,
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <CupiddleIcon size={15} color="#FF1F6A" />
            <span>
              Shared: <strong style={{ color: '#FF1F6A' }}>{shared_interests.join(', ')}</strong>
            </span>
          </div>
        )}

        {/* Pass and General Spark Controls */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '18px',
            paddingTop: '16px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <button
            onClick={onPass}
            className="btn-bumble-action"
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#9E8C93',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            }}
            title="Pass"
          >
            <X size={24} />
          </button>

          <button
            onClick={() => onSpark(profile.gate_question ? 'gate_question' : 'general', profile.gate_question ? profile.gate_question : `Curiosity Profile of ${profile.display_name}`)}
            className="btn-desire-action"
            style={{
              flex: 1,
              maxWidth: '280px',
              padding: '15px 24px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #FF1F6A 0%, #C80A32 100%)',
              color: '#FFFFFF',
              fontSize: '15px',
              fontWeight: 800,
              letterSpacing: '0.015em',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 20px rgba(255, 31, 106, 0.45)',
            }}
          >
            <CupiddleIcon size={18} color="#FFFFFF" />
            {profile.gate_question ? 'Answer Gate & Spark' : 'Send a Spark'}
          </button>
        </div>
      </div>
    </div>
  );
};
