import React, { useState, useRef } from 'react';
import { Compass, Flame, Lightbulb, Check, Tag, ArrowRight, ArrowLeft, Upload, Trash2, Loader2, Link as LinkIcon } from 'lucide-react';
import { CupiddleIcon } from './CupiddleLogo';
import { Profile } from '../types';
import { api } from '../api';

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
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [rabbitHole, setRabbitHole] = useState(profile.rabbit_hole || '');
  const [defendTake, setDefendTake] = useState(profile.defend_take || '');
  const [teachMe, setTeachMe] = useState(profile.teach_me || '');
  const [myWorldTags, setMyWorldTags] = useState<string[]>(profile.my_world_tags || []);
  const [tagInput, setTagInput] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [bio, setBio] = useState(profile.bio || '');
  const [datingIntentions, setDatingIntentions] = useState(profile.dating_intentions || '');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const popularTags = [
    'Afrobeats', 'Sci-Fi', 'Film Grammar', 'Rust', 'Philosophy',
    'Anime', 'Dune', 'Indie Games', 'AI & ML', 'Jazz', 'Architecture', 'Creative Writing'
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

    if (file.size > 10 * 1024 * 1024) {
      setUploadError('Image size must be less than 10MB.');
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

      // 2. Save bio & dating intentions
      const updated = await api.updateProfile({
        bio,
        dating_intentions: datingIntentions,
      });

      // 3. Add portrait if provided
      if (photoURL.trim()) {
        try {
          await api.addPhoto(photoURL.trim());
        } catch (e) {
          console.warn('Photo add warning:', e);
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
        backgroundColor: 'rgba(32, 32, 32, 0.65)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1100,
        padding: '20px',
        overflowY: 'auto',
      }}
    >
      <div
        className="animate-modal-spring"
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          border: '1.5px solid #202020',
          maxWidth: '560px',
          width: '100%',
          padding: '36px',
          boxShadow: '0 24px 60px rgba(32, 32, 32, 0.22)',
          position: 'relative',
        }}
      >
        {/* Progress Bar & Header */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 12px',
                borderRadius: '1000px',
                backgroundColor: '#ffdb5b',
                border: '1px solid #202020',
                color: '#202020',
                fontSize: '11px',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              <CupiddleIcon size={14} color="#202020" />
              Step {step} of 3 • Curiosity Onboarding
            </div>

            <button
              onClick={onDismiss}
              style={{
                fontSize: '13px',
                color: '#575656',
                fontWeight: 600,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Skip for now
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '16px' }}>
            <div style={{ height: '4px', borderRadius: '4px', backgroundColor: step >= 1 ? '#202020' : '#e5e5e5' }} />
            <div style={{ height: '4px', borderRadius: '4px', backgroundColor: step >= 2 ? '#202020' : '#e5e5e5' }} />
            <div style={{ height: '4px', borderRadius: '4px', backgroundColor: step >= 3 ? '#202020' : '#e5e5e5' }} />
          </div>

          <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#202020', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
            {step === 1 && 'What Makes You Curious?'}
            {step === 2 && 'What Powers Your World?'}
            {step === 3 && 'Your Portrait & Perspective'}
          </h2>
          <p style={{ fontSize: '14px', color: '#575656', marginTop: '4px' }}>
            {step === 1 && 'People connect on Cupiddle through thoughts and ideas, not empty swipes.'}
            {step === 2 && 'Choose the books, sounds, and media that shaped your tastes.'}
            {step === 3 && 'Add a face to your ideas and set your dating intentions.'}
          </p>
        </div>

        {/* Step 1: Curiosity Prompts */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ padding: '16px', borderRadius: '16px', backgroundColor: '#fff386', border: '1.5px solid #202020' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', marginBottom: '6px' }}>
                <Compass size={15} /> My Current Rabbit Hole
              </label>
              <textarea
                rows={2}
                placeholder="What topic, concept, or rabbit hole are you obsessed with right now?"
                value={rabbitHole}
                onChange={(e) => setRabbitHole(e.target.value)}
                style={{ width: '100%', fontSize: '14px', borderRadius: '12px', padding: '10px 12px' }}
              />
            </div>

            <div style={{ padding: '16px', borderRadius: '16px', backgroundColor: '#f3f3f3', border: '1.5px solid #202020' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', marginBottom: '6px' }}>
                <Flame size={15} /> Defend This Take
              </label>
              <textarea
                rows={2}
                placeholder="An opinion or perspective you are genuinely willing to defend..."
                value={defendTake}
                onChange={(e) => setDefendTake(e.target.value)}
                style={{ width: '100%', fontSize: '14px', borderRadius: '12px', padding: '10px 12px' }}
              />
            </div>

            <div style={{ padding: '16px', borderRadius: '16px', backgroundColor: '#ffffff', border: '1.5px solid #202020' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', marginBottom: '6px' }}>
                <Lightbulb size={15} /> Teach Me Something
              </label>
              <textarea
                rows={2}
                placeholder="What could you explain or teach someone for hours without getting tired?"
                value={teachMe}
                onChange={(e) => setTeachMe(e.target.value)}
                style={{ width: '100%', fontSize: '14px', borderRadius: '12px', padding: '10px 12px' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
              <button
                onClick={() => setStep(2)}
                className="btn-bumble-action"
                style={{
                  padding: '12px 28px',
                  borderRadius: '16px',
                  backgroundColor: '#202020',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '14px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                Continue <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: My World Tags */}
        {step === 2 && (
          <div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#202020', marginBottom: '8px' }}>
                Tap to add tags or create your own:
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
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
                        backgroundColor: selected ? '#ffdb5b' : '#f3f3f3',
                        border: '1.5px solid #202020',
                        color: '#202020',
                        fontSize: '13px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      {selected && <Check size={13} />} {tag}
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
                  style={{ flex: 1, fontSize: '14px', padding: '10px 14px' }}
                />
                <button
                  type="button"
                  onClick={handleAddCustomTag}
                  className="btn-bumble-action"
                  style={{
                    padding: '10px 18px',
                    borderRadius: '16px',
                    backgroundColor: '#202020',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '13px',
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
                  border: '1.5px solid #202020',
                  backgroundColor: '#ffffff',
                  color: '#202020',
                  fontWeight: 700,
                  fontSize: '14px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <ArrowLeft size={16} /> Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="btn-bumble-action"
                style={{
                  padding: '12px 28px',
                  borderRadius: '16px',
                  backgroundColor: '#202020',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '14px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                Continue <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Identity & Portrait */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Real File Upload Section */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#202020', marginBottom: '8px' }}>
                Profile Portrait (Upload Image)
              </label>

              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />

              {uploadError && (
                <div
                  style={{
                    padding: '8px 12px',
                    borderRadius: '12px',
                    backgroundColor: '#ffebeb',
                    border: '1px solid #ff4d4d',
                    color: '#c00000',
                    fontSize: '12px',
                    fontWeight: 600,
                    marginBottom: '10px',
                  }}
                >
                  {uploadError}
                </div>
              )}

              {photoURL ? (
                /* Uploaded Photo Preview Card */
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '12px 16px',
                    backgroundColor: '#fff386',
                    borderRadius: '16px',
                    border: '1.5px solid #202020',
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
                      border: '1.5px solid #202020',
                      backgroundColor: '#f3f3f3',
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 800,
                          backgroundColor: '#202020',
                          color: '#ffdb5b',
                          padding: '2px 8px',
                          borderRadius: '1000px',
                        }}
                      >
                        ✓ Portrait Ready
                      </span>
                    </div>
                    <p style={{ fontSize: '12px', color: '#3b3b3b', margin: 0, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
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
                        border: '1px solid #202020',
                        backgroundColor: '#ffffff',
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
                        border: '1px solid #202020',
                        backgroundColor: '#ffffff',
                        color: '#c00000',
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
                /* Primary Upload Button / Dropzone */
                <div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingPhoto}
                    className="btn-bumble-action"
                    style={{
                      width: '100%',
                      padding: '20px',
                      borderRadius: '16px',
                      border: '2px dashed #202020',
                      backgroundColor: '#f8f8f8',
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
                        <Loader2 size={26} className="animate-spin" color="#202020" />
                        <span style={{ fontSize: '14px', fontWeight: 800, color: '#202020' }}>
                          Uploading from device...
                        </span>
                      </>
                    ) : (
                      <>
                        <div
                          style={{
                            width: '44px',
                            height: '44px',
                            borderRadius: '50%',
                            backgroundColor: '#ffdb5b',
                            border: '1.5px solid #202020',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Upload size={20} color="#202020" />
                        </div>
                        <span style={{ fontSize: '14px', fontWeight: 800, color: '#202020' }}>
                          Choose Photo from Phone / Laptop
                        </span>
                        <span style={{ fontSize: '12px', color: '#575656', fontWeight: 500 }}>
                          Select from Gallery, Files, or Camera (PNG, JPG, WebP up to 10MB)
                        </span>
                      </>
                    )}
                  </button>

                  {/* Optional URL Toggle */}
                  <div style={{ marginTop: '8px', textAlign: 'right' }}>
                    <button
                      type="button"
                      onClick={() => setShowUrlInput(!showUrlInput)}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        fontSize: '12px',
                        color: '#575656',
                        textDecoration: 'underline',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <LinkIcon size={12} /> {showUrlInput ? 'Hide image URL link' : 'Or paste an image web link'}
                    </button>
                  </div>

                  {showUrlInput && (
                    <div style={{ marginTop: '6px' }}>
                      <input
                        type="text"
                        placeholder="e.g. https://images.unsplash.com/..."
                        value={photoURL}
                        onChange={(e) => setPhotoURL(e.target.value)}
                        style={{ width: '100%', fontSize: '13px', padding: '8px 12px' }}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#202020', marginBottom: '6px' }}>
                Short Bio / Introduction
              </label>
              <textarea
                rows={2}
                placeholder="A couple sentences about what keeps you up at night or what you enjoy..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                style={{ width: '100%', fontSize: '14px' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#202020', marginBottom: '6px' }}>
                Dating Intentions
              </label>
              <input
                type="text"
                placeholder="e.g. Deep conversations & long-term connection, curious banter..."
                value={datingIntentions}
                onChange={(e) => setDatingIntentions(e.target.value)}
                style={{ width: '100%', fontSize: '14px' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
              <button
                onClick={() => setStep(2)}
                style={{
                  padding: '12px 20px',
                  borderRadius: '16px',
                  border: '1.5px solid #202020',
                  backgroundColor: '#ffffff',
                  color: '#202020',
                  fontWeight: 700,
                  fontSize: '14px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <ArrowLeft size={16} /> Back
              </button>
              <button
                onClick={handleFinish}
                disabled={loading}
                className="btn-bumble-action"
                style={{
                  padding: '12px 32px',
                  borderRadius: '16px',
                  backgroundColor: '#202020',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '14px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                {loading ? 'Saving Profile...' : 'Complete & Enter Cupiddle'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
