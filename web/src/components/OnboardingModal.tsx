import React, { useState, useRef } from 'react';
import { Compass, Flame, Lightbulb, Check, Tag, ArrowRight, ArrowLeft, Upload, Trash2, Loader2, Link as LinkIcon, Lock, Sparkles } from 'lucide-react';
import { CupiddleIcon } from './CupiddleLogo';
import { Profile } from '../types';
import { api } from '../api';
import { VIBE_TAGS } from './MoodTagSelector';

interface OnboardingModalProps {
  isOpen: boolean;
  profile: Profile;
  onComplete: (updated: Profile) => void;
  onDismiss: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  profile,
  onComplete,
  onDismiss,
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Step 1: Curiosity
  const [rabbitHole, setRabbitHole] = useState(profile.rabbit_hole || '');
  const [defendTake, setDefendTake] = useState(profile.defend_take || '');
  const [teachMe, setTeachMe] = useState(profile.teach_me || '');

  // Step 2: World Tags
  const [myWorldTags, setMyWorldTags] = useState<string[]>(profile.my_world_tags || []);
  const [tagInput, setTagInput] = useState('');

  // Step 3: Lifestyle & Values (10-dim vector for master matching model)
  const [smoking, setSmoking] = useState(0.0);
  const [drinking, setDrinking] = useState(0.0);
  const [religionWeight, setReligionWeight] = useState(0.5);
  const [nightOwl, setNightOwl] = useState(0.5);
  const [introversion, setIntroversion] = useState(0.5);
  const [ambitionLevel, setAmbitionLevel] = useState(0.7);
  const [campusSocial, setCampusSocial] = useState(0.5);
  const [familyValues, setFamilyValues] = useState(0.5);
  const [cgpaTier, setCgpaTier] = useState(4); // 1=Gold, 2=Silver, 3=Bronze, 4=Unranked

  // Step 4: Dating Intent, Campus Vibe & Gate Question
  const [datingIntentions, setDatingIntentions] = useState(profile.dating_intentions || 'Deep conversations & genuine connection');
  const [selectedVibe, setSelectedVibe] = useState(profile.vibe_tag || 'looking_for_spark');
  const [gateQuestion, setGateQuestion] = useState(profile.gate_question || '');

  // Step 5: Portrait & Bio
  const [photoURL, setPhotoURL] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [bio, setBio] = useState(profile.bio || '');

  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const popularTags = [
    'Afrobeats', 'Sci-Fi', 'Film Grammar', 'Rust', 'Philosophy',
    'Anime', 'Dune', 'Indie Games', 'AI & ML', 'Jazz', 'Architecture', 'Creative Writing',
    'Asake', 'Burnaboy', 'Law & Justice', 'Medicine', 'Fintech', 'Campus Politics'
  ];

  const handleToggleTag = (tag: string) => {
    if (myWorldTags.includes(tag)) {
      setMyWorldTags(myWorldTags.filter((t) => t !== tag));
    } else {
      setMyWorldTags([...myWorldTags, tag]);
    }
  };

  const handleAddCustomTag = () => {
    if (!tagInput.trim()) return;
    if (!myWorldTags.includes(tagInput.trim())) {
      setMyWorldTags([...myWorldTags, tagInput.trim()]);
    }
    setTagInput('');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 25 * 1024 * 1024) {
      setUploadError('Image size must be less than 25MB.');
      return;
    }

    try {
      setUploadingPhoto(true);
      setUploadError('');
      const res = await api.uploadPhotoFile(file);
      setPhotoURL(res.url);
    } catch (err: any) {
      console.error('Photo upload error', err);
      setUploadError(err.message || 'Failed to upload photo from your device.');
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      // 1. Save curiosity prompts & tags
      await api.updateCuriosity({
        rabbit_hole: rabbitHole,
        defend_take: defendTake,
        teach_me: teachMe,
        my_world_tags: myWorldTags,
      });

      // 2. Save 10-dim values & lifestyle
      const lifestyleData: Record<string, number> = {
        smoking,
        drinking,
        religion_weight: religionWeight,
        night_owl: nightOwl,
        introversion,
        political_interest: 0.3,
        ambition_level: ambitionLevel,
        campus_social: campusSocial,
        cheating_stance: 0.0,
        family_values: familyValues,
      };
      await api.updateLifestyle(lifestyleData, cgpaTier);

      // 3. Save vibe tag & gate question
      if (selectedVibe) {
        try {
          await api.setVibeTag(selectedVibe);
        } catch (e) {
          console.warn('Vibe save notice:', e);
        }
      }

      if (gateQuestion.trim()) {
        try {
          await api.setGateQuestion(gateQuestion.trim());
        } catch (e) {
          console.warn('Gate question save notice:', e);
        }
      }

      // 4. Save bio & dating intentions
      const updated = await api.updateProfile({
        bio,
        dating_intentions: datingIntentions,
        gate_question: gateQuestion.trim() || undefined,
        vibe_tag: selectedVibe || undefined,
      });

      // 5. Add portrait if uploaded
      if (photoURL.trim()) {
        try {
          await api.addPhoto(photoURL.trim(), true);
        } catch (e) {
          console.warn('Photo add notice:', e);
        }
      }

      const refreshed = await api.getMe();
      onComplete(refreshed.profile || updated);
    } catch (err) {
      console.error('Onboarding save error', err);
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
    >
      <div
        className="animate-modal-spring"
        style={{
          backgroundColor: '#170E12',
          borderRadius: '24px',
          border: '1px solid rgba(255, 31, 106, 0.3)',
          maxWidth: '480px',
          width: '100%',
          padding: '24px',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.85)',
          position: 'relative',
          margin: 'auto',
          color: '#FFFFFF',
        }}
      >
        {/* Header & Step Tracker */}
        <div style={{ marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
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
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                boxShadow: '0 0 10px rgba(255, 31, 106, 0.3)',
              }}
            >
              <CupiddleIcon size={12} color="#FF1F6A" />
              Step {step} of 5 • Campus Onboarding
            </div>

            <button
              onClick={onDismiss}
              style={{
                fontSize: '12px',
                color: '#9E8C93',
                fontWeight: 600,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Skip for now
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px', marginBottom: '14px' }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                style={{
                  height: '4px',
                  borderRadius: '4px',
                  backgroundColor: step >= i ? '#FF1F6A' : 'rgba(255, 255, 255, 0.1)',
                  boxShadow: step >= i ? '0 0 8px rgba(255, 31, 106, 0.6)' : 'none',
                  transition: 'background-color 0.2s ease',
                }}
              />
            ))}
          </div>

          <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em', lineHeight: 1.2, margin: 0, fontFamily: "'Playfair Display', serif", fontStyle: 'italic' }}>
            {step === 1 && 'What Makes You Curious?'}
            {step === 2 && 'What Powers Your World?'}
            {step === 3 && 'Lifestyle & Values Algorithm'}
            {step === 4 && 'Your Gate Question & Vibe'}
            {step === 5 && 'Your Portrait & Bio'}
          </h2>
          <p style={{ fontSize: '13px', color: '#E0D4D8', marginTop: '4px' }}>
            {step === 1 && 'People connect on Cupiddle through thoughts and ideas, not empty photo swipes.'}
            {step === 2 && 'Choose the books, sounds, and media that shaped your tastes.'}
            {step === 3 && 'Calibrates the Mathematical Matching Model (Values Cosine Similarity).'}
            {step === 4 && 'People must answer your Gate Question before they can spark you.'}
            {step === 5 && 'Add a face to your ideas. Photo starts at 40px silhouette in discovery.'}
          </p>
        </div>

        {/* STEP 1: CURIOSITY PROMPTS */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ padding: '14px', borderRadius: '16px', backgroundColor: '#1E1116', border: '1px solid rgba(255, 31, 106, 0.25)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', marginBottom: '6px', color: '#FFFFFF' }}>
                <Compass size={15} color="#FF1F6A" /> My Current Rabbit Hole
              </label>
              <textarea
                rows={2}
                placeholder="What topic, concept, or rabbit hole are you obsessed with right now?"
                value={rabbitHole}
                onChange={(e) => setRabbitHole(e.target.value)}
                style={{ width: '100%', fontSize: '14px', borderRadius: '12px', padding: '10px 12px', backgroundColor: '#0D080A', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#FFFFFF' }}
              />
            </div>

            <div style={{ padding: '14px', borderRadius: '16px', backgroundColor: '#1E1116', border: '1px solid rgba(255, 31, 106, 0.25)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', marginBottom: '6px', color: '#FFFFFF' }}>
                <Flame size={15} color="#FF1F6A" /> Defend This Take
              </label>
              <textarea
                rows={2}
                placeholder="An opinion or perspective you are genuinely willing to defend..."
                value={defendTake}
                onChange={(e) => setDefendTake(e.target.value)}
                style={{ width: '100%', fontSize: '14px', borderRadius: '12px', padding: '10px 12px', backgroundColor: '#0D080A', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#FFFFFF' }}
              />
            </div>

            <div style={{ padding: '14px', borderRadius: '16px', backgroundColor: '#1E1116', border: '1px solid rgba(255, 31, 106, 0.25)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', marginBottom: '6px', color: '#FFFFFF' }}>
                <Lightbulb size={15} color="#FF1F6A" /> Teach Me Something
              </label>
              <textarea
                rows={2}
                placeholder="What could you explain or teach someone for hours without getting tired?"
                value={teachMe}
                onChange={(e) => setTeachMe(e.target.value)}
                style={{ width: '100%', fontSize: '14px', borderRadius: '12px', padding: '10px 12px', backgroundColor: '#0D080A', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#FFFFFF' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
              <button
                onClick={() => setStep(2)}
                style={{
                  padding: '12px 28px',
                  borderRadius: '16px',
                  backgroundColor: '#FF1F6A',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '14px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 0 16px rgba(255, 31, 106, 0.45)',
                }}
              >
                Continue <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: WORLD TAGS */}
        {step === 2 && (
          <div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#FFFFFF', marginBottom: '8px' }}>
                Tap to add tags or create your own:
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px', maxHeight: '180px', overflowY: 'auto' }}>
                {popularTags.map((tag) => {
                  const selected = myWorldTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleToggleTag(tag)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '1000px',
                        backgroundColor: selected ? '#5E081E' : 'rgba(255, 255, 255, 0.06)',
                        border: selected ? '1px solid #FF1F6A' : '1px solid rgba(255, 255, 255, 0.12)',
                        color: selected ? '#FFFFFF' : '#E0D4D8',
                        boxShadow: selected ? '0 0 10px rgba(255, 31, 106, 0.35)' : 'none',
                        fontSize: '13px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {selected && <Check size={13} color="#FF1F6A" />} {tag}
                    </button>
                  );
                })}
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="Custom tag (e.g. Lagos history, Cyberpunk, Sourdough)..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomTag();
                    }
                  }}
                  style={{ flex: 1, fontSize: '14px', padding: '10px 14px', borderRadius: '12px', backgroundColor: '#0D080A', border: '1px solid rgba(255, 255, 255, 0.15)', color: '#FFFFFF' }}
                />
                <button
                  type="button"
                  onClick={handleAddCustomTag}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '12px',
                    backgroundColor: '#5E081E',
                    border: '1px solid #FF1F6A',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  <Tag size={14} style={{ display: 'inline', marginRight: '4px' }} /> Add
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px' }}>
              <button
                onClick={() => setStep(1)}
                style={{
                  padding: '12px 20px',
                  borderRadius: '16px',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  color: '#E0D4D8',
                  fontWeight: 700,
                  fontSize: '14px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                }}
              >
                <ArrowLeft size={16} /> Back
              </button>
              <button
                onClick={() => setStep(3)}
                style={{
                  padding: '12px 28px',
                  borderRadius: '16px',
                  backgroundColor: '#FF1F6A',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '14px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 0 16px rgba(255, 31, 106, 0.45)',
                }}
              >
                Continue <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: LIFESTYLE & VALUES VECTORS */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '380px', overflowY: 'auto', paddingRight: '4px' }}>
            {/* Sleep Schedule */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', marginBottom: '6px', color: '#FFFFFF' }}>
                Sleep Cycle
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                {[
                  { label: 'Early Bird 🌅', val: 0.0 },
                  { label: 'Balanced ⏰', val: 0.5 },
                  { label: 'Night Owl 🌙', val: 1.0 },
                ].map((opt) => (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => setNightOwl(opt.val)}
                    style={{
                      padding: '8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 700,
                      backgroundColor: nightOwl === opt.val ? '#5E081E' : 'rgba(255, 255, 255, 0.05)',
                      color: nightOwl === opt.val ? '#ffffff' : '#E0D4D8',
                      border: nightOwl === opt.val ? '1px solid #FF1F6A' : '1px solid rgba(255, 255, 255, 0.1)',
                      boxShadow: nightOwl === opt.val ? '0 0 10px rgba(255, 31, 106, 0.3)' : 'none',
                      cursor: 'pointer',
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Social Battery */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', marginBottom: '6px', color: '#FFFFFF' }}>
                Social Battery
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                {[
                  { label: 'Extrovert 🎉', val: 0.0 },
                  { label: 'Ambivert ⚖️', val: 0.5 },
                  { label: 'Introvert 🧘', val: 1.0 },
                ].map((opt) => (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => setIntroversion(opt.val)}
                    style={{
                      padding: '8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 700,
                      backgroundColor: introversion === opt.val ? '#5E081E' : 'rgba(255, 255, 255, 0.05)',
                      color: introversion === opt.val ? '#ffffff' : '#E0D4D8',
                      border: introversion === opt.val ? '1px solid #FF1F6A' : '1px solid rgba(255, 255, 255, 0.1)',
                      boxShadow: introversion === opt.val ? '0 0 10px rgba(255, 31, 106, 0.3)' : 'none',
                      cursor: 'pointer',
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Ambition & Hustle */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', marginBottom: '6px', color: '#FFFFFF' }}>
                Drive & Ambition
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                {[
                  { label: 'Peace of Mind 🍃', val: 0.2 },
                  { label: 'Goal Oriented 🎯', val: 0.6 },
                  { label: 'Full Grindset 🚀', val: 1.0 },
                ].map((opt) => (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => setAmbitionLevel(opt.val)}
                    style={{
                      padding: '8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 700,
                      backgroundColor: ambitionLevel === opt.val ? '#5E081E' : 'rgba(255, 255, 255, 0.05)',
                      color: ambitionLevel === opt.val ? '#ffffff' : '#E0D4D8',
                      border: ambitionLevel === opt.val ? '1px solid #FF1F6A' : '1px solid rgba(255, 255, 255, 0.1)',
                      boxShadow: ambitionLevel === opt.val ? '0 0 10px rgba(255, 31, 106, 0.3)' : 'none',
                      cursor: 'pointer',
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Campus Social Presence */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', marginBottom: '6px', color: '#FFFFFF' }}>
                Campus Social Life
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                {[
                  { label: 'Hostel/Home 🏠', val: 0.0 },
                  { label: 'Selective 🤝', val: 0.5 },
                  { label: 'Everywhere 🌍', val: 1.0 },
                ].map((opt) => (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => setCampusSocial(opt.val)}
                    style={{
                      padding: '8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 700,
                      backgroundColor: campusSocial === opt.val ? '#5E081E' : 'rgba(255, 255, 255, 0.05)',
                      color: campusSocial === opt.val ? '#ffffff' : '#E0D4D8',
                      border: campusSocial === opt.val ? '1px solid #FF1F6A' : '1px solid rgba(255, 255, 255, 0.1)',
                      boxShadow: campusSocial === opt.val ? '0 0 10px rgba(255, 31, 106, 0.3)' : 'none',
                      cursor: 'pointer',
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Religion Importance */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', marginBottom: '6px', color: '#FFFFFF' }}>
                Faith / Spirituality Importance
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                {[
                  { label: 'Not at all', val: 0.0 },
                  { label: 'Mild', val: 0.33 },
                  { label: 'Important', val: 0.66 },
                  { label: 'Core', val: 1.0 },
                ].map((opt) => (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => setReligionWeight(opt.val)}
                    style={{
                      padding: '8px 4px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: 700,
                      backgroundColor: religionWeight === opt.val ? '#5E081E' : 'rgba(255, 255, 255, 0.05)',
                      color: religionWeight === opt.val ? '#ffffff' : '#E0D4D8',
                      border: religionWeight === opt.val ? '1px solid #FF1F6A' : '1px solid rgba(255, 255, 255, 0.1)',
                      boxShadow: religionWeight === opt.val ? '0 0 10px rgba(255, 31, 106, 0.3)' : 'none',
                      cursor: 'pointer',
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Drinking & Social Drinks */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', marginBottom: '6px', color: '#FFFFFF' }}>
                Drinking
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                {[
                  { label: 'Never 🧃', val: 0.0 },
                  { label: 'Socially 🥂', val: 0.33 },
                  { label: 'Weekends 🍻', val: 0.66 },
                  { label: 'Often 🍾', val: 1.0 },
                ].map((opt) => (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => setDrinking(opt.val)}
                    style={{
                      padding: '8px 4px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: 700,
                      backgroundColor: drinking === opt.val ? '#5E081E' : 'rgba(255, 255, 255, 0.05)',
                      color: drinking === opt.val ? '#ffffff' : '#E0D4D8',
                      border: drinking === opt.val ? '1px solid #FF1F6A' : '1px solid rgba(255, 255, 255, 0.1)',
                      boxShadow: drinking === opt.val ? '0 0 10px rgba(255, 31, 106, 0.3)' : 'none',
                      cursor: 'pointer',
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Smoking */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', marginBottom: '6px', color: '#FFFFFF' }}>
                Smoking / Shisha
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                {[
                  { label: 'Never 🚫', val: 0.0 },
                  { label: 'Socially 💨', val: 0.33 },
                  { label: 'Regular 🚬', val: 0.66 },
                  { label: 'Daily ⚡', val: 1.0 },
                ].map((opt) => (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => setSmoking(opt.val)}
                    style={{
                      padding: '8px 4px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: 700,
                      backgroundColor: smoking === opt.val ? '#5E081E' : 'rgba(255, 255, 255, 0.05)',
                      color: smoking === opt.val ? '#ffffff' : '#E0D4D8',
                      border: smoking === opt.val ? '1px solid #FF1F6A' : '1px solid rgba(255, 255, 255, 0.1)',
                      boxShadow: smoking === opt.val ? '0 0 10px rgba(255, 31, 106, 0.3)' : 'none',
                      cursor: 'pointer',
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Family & Relationship Values */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', marginBottom: '6px', color: '#FFFFFF' }}>
                Family Values & Outlook
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                {[
                  { label: 'Modern & Free 🌱', val: 0.0 },
                  { label: 'Balanced 🤝', val: 0.5 },
                  { label: 'Traditional 🏛️', val: 1.0 },
                ].map((opt) => (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => setFamilyValues(opt.val)}
                    style={{
                      padding: '8px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: 700,
                      backgroundColor: familyValues === opt.val ? '#5E081E' : 'rgba(255, 255, 255, 0.05)',
                      color: familyValues === opt.val ? '#ffffff' : '#E0D4D8',
                      border: familyValues === opt.val ? '1px solid #FF1F6A' : '1px solid rgba(255, 255, 255, 0.1)',
                      boxShadow: familyValues === opt.val ? '0 0 10px rgba(255, 31, 106, 0.3)' : 'none',
                      cursor: 'pointer',
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Academic Track (Confidential Soft Boost) */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', marginBottom: '6px', color: '#FFFFFF' }}>
                Academic Ambition (Confidential Tier)
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                {[
                  { label: 'First Class 🥇', val: 1 },
                  { label: '2.1 Upper 🥈', val: 2 },
                  { label: 'Solid 2.2 🥉', val: 3 },
                  { label: 'Vibes Only 🎯', val: 4 },
                ].map((opt) => (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => setCgpaTier(opt.val)}
                    style={{
                      padding: '8px 4px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: 700,
                      backgroundColor: cgpaTier === opt.val ? '#5E081E' : 'rgba(255, 255, 255, 0.05)',
                      color: cgpaTier === opt.val ? '#ffffff' : '#E0D4D8',
                      border: cgpaTier === opt.val ? '1px solid #FF1F6A' : '1px solid rgba(255, 255, 255, 0.1)',
                      boxShadow: cgpaTier === opt.val ? '0 0 10px rgba(255, 31, 106, 0.3)' : 'none',
                      cursor: 'pointer',
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
              <button
                onClick={() => setStep(2)}
                style={{
                  padding: '12px 20px',
                  borderRadius: '16px',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  color: '#E0D4D8',
                  fontWeight: 700,
                  fontSize: '14px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                }}
              >
                <ArrowLeft size={16} /> Back
              </button>
              <button
                onClick={() => setStep(4)}
                style={{
                  padding: '12px 28px',
                  borderRadius: '16px',
                  backgroundColor: '#FF1F6A',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '14px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 0 16px rgba(255, 31, 106, 0.45)',
                }}
              >
                Continue <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: CAMPUS VIBE & GATE QUESTION */}
        {step === 4 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Dating Intentions */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', marginBottom: '6px', color: '#FFFFFF' }}>
                What are you looking for right now?
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {[
                  'Study Buddy 📚',
                  'Curious Banter 💭',
                  'Deep Connection 💜',
                  'Casual Vibes 🎮',
                  'Open to Romance ✨',
                ].map((intent) => {
                  const selected = datingIntentions === intent;
                  return (
                    <button
                      key={intent}
                      type="button"
                      onClick={() => setDatingIntentions(intent)}
                      style={{
                        padding: '8px 14px',
                        borderRadius: '1000px',
                        border: selected ? '1px solid #FF1F6A' : '1px solid rgba(255, 255, 255, 0.12)',
                        backgroundColor: selected ? '#5E081E' : 'rgba(255, 255, 255, 0.06)',
                        color: selected ? '#ffffff' : '#E0D4D8',
                        boxShadow: selected ? '0 0 10px rgba(255, 31, 106, 0.35)' : 'none',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {selected && '✓ '}
                      {intent}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Vibe Tag Picker (8 ephemeral tags) */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', marginBottom: '6px', color: '#FFFFFF' }}>
                Current Campus Vibe (Expires in 6 Hours)
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
                {VIBE_TAGS.map((v) => {
                  const selected = selectedVibe === v.id;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setSelectedVibe(v.id)}
                      style={{
                        padding: '8px 10px',
                        borderRadius: '12px',
                        border: selected ? '1px solid #FF1F6A' : '1px solid rgba(255, 255, 255, 0.1)',
                        backgroundColor: selected ? '#5E081E' : 'rgba(255, 255, 255, 0.05)',
                        color: selected ? '#ffffff' : '#E0D4D8',
                        boxShadow: selected ? '0 0 10px rgba(255, 31, 106, 0.3)' : 'none',
                        fontSize: '12px',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <span>{v.emoji}</span>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Gate Question */}
            <div style={{ padding: '14px', borderRadius: '16px', backgroundColor: '#1E1116', border: '1px dashed rgba(255, 31, 106, 0.5)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: '#FF1F6A', marginBottom: '6px' }}>
                <Lock size={14} color="#FF1F6A" /> Your Connection Gate Question
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Name one thing your faculty hasn't taught you, but definitely should have."
                value={gateQuestion}
                onChange={(e) => setGateQuestion(e.target.value)}
                style={{ width: '100%', fontSize: '14px', borderRadius: '12px', padding: '10px 12px', backgroundColor: '#0D080A', border: '1px solid rgba(255, 31, 106, 0.3)', color: '#FFFFFF' }}
              />
              <span style={{ fontSize: '11px', color: '#E0D4D8', display: 'block', marginTop: '4px' }}>
                💡 Anyone who sparks you MUST write a real answer to this question first.
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
              <button
                onClick={() => setStep(3)}
                style={{
                  padding: '12px 20px',
                  borderRadius: '16px',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  color: '#E0D4D8',
                  fontWeight: 700,
                  fontSize: '14px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                }}
              >
                <ArrowLeft size={16} /> Back
              </button>
              <button
                onClick={() => setStep(5)}
                style={{
                  padding: '12px 28px',
                  borderRadius: '16px',
                  backgroundColor: '#FF1F6A',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '14px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 0 16px rgba(255, 31, 106, 0.45)',
                }}
              >
                Continue <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: PORTRAIT & BIO */}
        {step === 5 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#FFFFFF', marginBottom: '8px' }}>
                Profile Portrait (Photo or Selfie)
              </label>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />

              {uploadError && (
                <div
                  style={{
                    padding: '8px 12px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid rgba(239, 68, 68, 0.4)',
                    color: '#f87171',
                    fontSize: '12px',
                    fontWeight: 600,
                    marginBottom: '10px',
                  }}
                >
                  {uploadError}
                </div>
              )}

              {photoURL ? (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '12px 16px',
                    backgroundColor: '#1E1116',
                    borderRadius: '16px',
                    border: '1px solid rgba(255, 31, 106, 0.3)',
                  }}
                >
                  <img
                    src={photoURL}
                    alt="Uploaded Portrait Preview"
                    style={{
                      width: '72px',
                      height: '72px',
                      borderRadius: '14px',
                      objectFit: 'cover',
                      border: '1.5px solid #FF1F6A',
                      backgroundColor: '#0D080A',
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 800,
                          backgroundColor: '#5E081E',
                          color: '#FF1F6A',
                          border: '1px solid #FF1F6A',
                          padding: '2px 8px',
                          borderRadius: '1000px',
                        }}
                      >
                        ✓ Portrait Ready
                      </span>
                    </div>
                    <p style={{ fontSize: '12px', color: '#E0D4D8', margin: 0, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      {photoURL}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingPhoto}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '1000px',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        backgroundColor: 'rgba(255, 255, 255, 0.08)',
                        color: '#FFFFFF',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      Change
                    </button>
                    <button
                      type="button"
                      onClick={() => setPhotoURL('')}
                      style={{
                        padding: '6px 8px',
                        borderRadius: '1000px',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        backgroundColor: 'rgba(239, 68, 68, 0.15)',
                        color: '#f87171',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingPhoto}
                    style={{
                      width: '100%',
                      padding: '20px',
                      borderRadius: '16px',
                      border: '2px dashed rgba(255, 31, 106, 0.35)',
                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      cursor: uploadingPhoto ? 'wait' : 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {uploadingPhoto ? (
                      <>
                        <Loader2 size={26} className="animate-spin" color="#FF1F6A" />
                        <span style={{ fontSize: '14px', fontWeight: 800, color: '#FFFFFF' }}>
                          Compressing & Uploading...
                        </span>
                      </>
                    ) : (
                      <>
                        <div
                          style={{
                            width: '44px',
                            height: '44px',
                            borderRadius: '50%',
                            backgroundColor: '#5E081E',
                            border: '1px solid #FF1F6A',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 0 12px rgba(255, 31, 106, 0.35)',
                          }}
                        >
                          <Upload size={20} color="#FF1F6A" />
                        </div>
                        <span style={{ fontSize: '14px', fontWeight: 800, color: '#FFFFFF' }}>
                          Choose Portrait from Phone / Camera
                        </span>
                        <span style={{ fontSize: '12px', color: '#9E8C93', fontWeight: 500 }}>
                          Will start at 40px silhouette in discovery feed
                        </span>
                      </>
                    )}
                  </button>

                  <div style={{ marginTop: '8px', textAlign: 'right' }}>
                    <button
                      type="button"
                      onClick={() => setShowUrlInput(!showUrlInput)}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        fontSize: '12px',
                        color: '#9E8C93',
                        textDecoration: 'underline',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <LinkIcon size={12} /> {showUrlInput ? 'Hide image URL link' : 'Or paste image URL link'}
                    </button>
                  </div>

                  {showUrlInput && (
                    <div style={{ marginTop: '6px' }}>
                      <input
                        type="text"
                        placeholder="e.g. https://images.unsplash.com/..."
                        value={photoURL}
                        onChange={(e) => setPhotoURL(e.target.value)}
                        style={{ width: '100%', fontSize: '13px', padding: '8px 12px', borderRadius: '12px', backgroundColor: '#0D080A', border: '1px solid rgba(255, 255, 255, 0.15)', color: '#FFFFFF' }}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#FFFFFF', marginBottom: '6px' }}>
                Short Bio / Introduction
              </label>
              <textarea
                rows={2}
                placeholder="A couple sentences about what makes you you..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                style={{ width: '100%', fontSize: '14px', borderRadius: '12px', padding: '10px 12px', backgroundColor: '#0D080A', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#FFFFFF' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
              <button
                onClick={() => setStep(4)}
                style={{
                  padding: '12px 20px',
                  borderRadius: '16px',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  color: '#E0D4D8',
                  fontWeight: 700,
                  fontSize: '14px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                }}
              >
                <ArrowLeft size={16} /> Back
              </button>
              <button
                onClick={handleFinish}
                disabled={loading}
                style={{
                  padding: '12px 32px',
                  borderRadius: '16px',
                  backgroundColor: '#FF1F6A',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '14px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  border: 'none',
                  cursor: loading ? 'wait' : 'pointer',
                  boxShadow: '0 0 20px rgba(255, 31, 106, 0.5)',
                }}
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                {loading ? 'Saving Profile...' : 'Complete & Enter Cupiddle'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
