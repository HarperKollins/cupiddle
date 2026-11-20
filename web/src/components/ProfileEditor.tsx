import React, { useState, useRef } from 'react';
import { Camera, Plus, Trash2, Check, ShieldAlert, Compass, Flame, Lightbulb, MapPin, Tag, Heart, Upload, Loader2, Link as LinkIcon, Smartphone, Download, ShieldCheck, GraduationCap } from 'lucide-react';
import { CupiddleIcon } from './CupiddleLogo';
import { Profile } from '../types';
import { api } from '../api';
import { NIGERIAN_STATES } from '../constants/nigerianStates';
import { VerificationModal } from './VerificationModal';
import { MoodTagSelector } from './MoodTagSelector';

interface ProfileEditorProps {
  profile: Profile;
  onUpdate: (updated: Profile) => void;
  onDeleteAccount: () => void;
}

export const ProfileEditor: React.FC<ProfileEditorProps> = ({ profile, onUpdate, onDeleteAccount }) => {
  const [displayName, setDisplayName] = useState(profile.display_name);
  const [bio, setBio] = useState(profile.bio || '');
  const [campus, setCampus] = useState(profile.campus || 'EBSU');
  const [faculty, setFaculty] = useState(profile.faculty || '');
  const [level, setLevel] = useState(profile.level || '300L');
  const [gateQuestion, setGateQuestion] = useState(profile.gate_question || '');
  const [vibeTag, setVibeTag] = useState(profile.vibe_tag || '');
  const [city, setCity] = useState(profile.city || 'Ebonyi');
  const [datingIntentions, setDatingIntentions] = useState(profile.dating_intentions || '');
  const [rabbitHole, setRabbitHole] = useState(profile.rabbit_hole || '');
  const [defendTake, setDefendTake] = useState(profile.defend_take || '');
  const [teachMe, setTeachMe] = useState(profile.teach_me || '');
  const [myWorldTags, setMyWorldTags] = useState<string[]>(profile.my_world_tags || []);
  const [newTagInput, setNewTagInput] = useState('');
  const [newPhotoURL, setNewPhotoURL] = useState('');
  const [showUrlPhotoInput, setShowUrlPhotoInput] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);

  const handleSaveBasic = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const updated = await api.updateProfile({
        display_name: displayName,
        bio,
        city,
        dating_intentions: datingIntentions,
        campus,
        faculty,
        level,
        gate_question: gateQuestion,
        vibe_tag: vibeTag,
      });
      onUpdate(updated);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Update error', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCuriosity = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const updated = await api.updateCuriosity({
        rabbit_hole: rabbitHole,
        defend_take: defendTake,
        teach_me: teachMe,
        my_world_tags: myWorldTags,
      });
      onUpdate(updated);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Curiosity update error', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTag = () => {
    if (!newTagInput.trim()) return;
    if (!myWorldTags.includes(newTagInput.trim())) {
      setMyWorldTags([...myWorldTags, newTagInput.trim()]);
    }
    setNewTagInput('');
  };

  const handleRemoveTag = (tag: string) => {
    setMyWorldTags(myWorldTags.filter((t) => t !== tag));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 35 * 1024 * 1024) {
      alert('Photo is too large (max 35MB). Please select a standard camera photo.');
      return;
    }

    try {
      setUploadingPhoto(true);
      const res = await api.uploadPhotoFile(file);
      const isPrimary = (profile.photos?.length || 0) === 0;
      await api.addPhoto(res.url, isPrimary);
      const me = await api.getMe();
      onUpdate(me.profile);
    } catch (err: any) {
      console.error('File upload failed', err);
      alert(err.message || 'Failed to upload photo from your device. Please try again.');
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAddPhoto = async () => {
    if (!newPhotoURL.trim()) return;
    try {
      await api.addPhoto(newPhotoURL.trim());
      const me = await api.getMe();
      onUpdate(me.profile);
      setNewPhotoURL('');
    } catch (err) {
      console.error('Add photo error', err);
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    try {
      await api.deletePhoto(photoId);
      const me = await api.getMe();
      onUpdate(me.profile);
    } catch (err) {
      console.error('Delete photo error', err);
    }
  };

  return (
    <div style={{ maxWidth: '820px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Header Banner */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          backgroundColor: 'var(--color-pollen, #fff386)',
          borderRadius: 'var(--radius-cards, 24px)',
          border: '1.5px solid var(--color-bumble-ink, #202020)',
          padding: '28px 32px',
          boxShadow: 'var(--shadow-sm, 0px 1px 8px rgba(32, 32, 32, 0.12))',
        }}
      >
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: 'var(--radius-badges, 1000px)',
              backgroundColor: 'var(--color-bumble-honey, #ffdb5b)',
              border: '1px solid var(--color-bumble-ink, #202020)',
              color: 'var(--color-bumble-ink, #202020)',
              fontSize: '12px',
              fontWeight: 800,
              letterSpacing: '0.02em',
              marginBottom: '10px',
            }}
          >
            <CupiddleIcon size={16} color="var(--color-bumble-ink, #202020)" />
            Editorial Profile Studio
          </div>
          <h1
            style={{
              fontSize: '32px',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              color: 'var(--color-bumble-ink, #202020)',
              lineHeight: 1.15,
            }}
          >
            Your Curiosity Profile
          </h1>
          <p
            style={{
              fontSize: '16px',
              color: 'var(--color-charcoal, #3b3b3b)',
              marginTop: '6px',
              lineHeight: 1.4,
            }}
          >
            Curiosity is attractive. Share what you genuinely think about, not just how you look.
          </p>
        </div>

        {savedSuccess && (
          <span
            className="animate-pulse-gentle"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'var(--color-bumble-ink, #202020)',
              color: 'var(--color-paper-white, #ffffff)',
              padding: '8px 18px',
              borderRadius: 'var(--radius-badges, 1000px)',
              fontSize: '13px',
              fontWeight: 700,
              boxShadow: '0 4px 12px rgba(32, 32, 32, 0.18)',
            }}
          >
            <Check size={16} /> Changes Saved!
          </span>
        )}
      </div>

      {/* 1. Photographs Section */}
      <div
        style={{
          padding: '32px',
          backgroundColor: 'var(--color-paper-white, #ffffff)',
          borderRadius: 'var(--radius-cards, 24px)',
          border: '1.5px solid var(--color-bumble-ink, #202020)',
          boxShadow: 'var(--shadow-sm, 0px 1px 8px rgba(32, 32, 32, 0.12))',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h2
              style={{
                fontSize: '22px',
                fontWeight: 800,
                color: 'var(--color-bumble-ink, #202020)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <Camera size={22} color="var(--color-bumble-ink, #202020)" />
              Profile Photographs
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--color-graphite, #575656)', marginTop: '4px' }}>
              High-clarity, authentic portraits lead your discovery card.
            </p>
          </div>

          <span
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-badges, 1000px)',
              backgroundColor: 'var(--color-mist, #f3f3f3)',
              border: '1px solid #d4d4d4',
              color: 'var(--color-bumble-ink, #202020)',
              fontSize: '12px',
              fontWeight: 700,
            }}
          >
            {profile.photos?.length || 0} of 6 Photos
          </span>
        </div>

        {/* Photos Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          {(profile.photos || []).map((photo) => (
            <div
              key={photo.id}
              className="editorial-card-lift"
              style={{
                position: 'relative',
                height: '180px',
                borderRadius: 'var(--radius-buttons, 16px)',
                overflow: 'hidden',
                border: '1.5px solid var(--color-bumble-ink, #202020)',
                backgroundColor: 'var(--color-mist, #f3f3f3)',
              }}
            >
              <img
                src={photo.url}
                alt="Profile"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              {photo.is_primary && (
                <span
                  style={{
                    position: 'absolute',
                    top: '8px',
                    left: '8px',
                    backgroundColor: 'var(--color-bumble-honey, #ffdb5b)',
                    border: '1px solid var(--color-bumble-ink, #202020)',
                    color: 'var(--color-bumble-ink, #202020)',
                    fontSize: '11px',
                    fontWeight: 800,
                    padding: '3px 8px',
                    borderRadius: 'var(--radius-badges, 1000px)',
                  }}
                >
                  Hero Photo
                </span>
              )}
              <button
                onClick={() => handleDeletePhoto(photo.id)}
                aria-label="Delete photo"
                style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  backgroundColor: 'var(--color-paper-white, #ffffff)',
                  border: '1.5px solid var(--color-bumble-ink, #202020)',
                  color: 'var(--color-bumble-ink, #202020)',
                  borderRadius: '50%',
                  width: '28px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 6px rgba(32, 32, 32, 0.2)',
                }}
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}

          {/* Hidden File Input for Device Photo Uploads */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />

          {/* Empty Add Placeholder / Device Upload Trigger */}
          {(profile.photos?.length || 0) < 6 && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingPhoto}
              className="editorial-card-lift"
              style={{
                height: '180px',
                borderRadius: 'var(--radius-buttons, 16px)',
                border: '2px dashed var(--color-bumble-ink, #202020)',
                backgroundColor: 'var(--color-mist, #f3f3f3)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                color: 'var(--color-bumble-ink, #202020)',
                padding: '16px',
                textAlign: 'center',
                cursor: uploadingPhoto ? 'wait' : 'pointer',
              }}
            >
              {uploadingPhoto ? (
                <>
                  <Loader2 size={24} className="animate-spin" color="var(--color-bumble-ink, #202020)" />
                  <span style={{ fontSize: '12px', fontWeight: 700 }}>Uploading portrait...</span>
                </>
              ) : (
                <>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--color-bumble-honey, #ffdb5b)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid var(--color-bumble-ink, #202020)',
                    }}
                  >
                    <Upload size={18} color="var(--color-bumble-ink, #202020)" />
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: 800 }}>Upload Portrait</span>
                  <span style={{ fontSize: '11px', color: 'var(--color-graphite, #575656)' }}>From phone / PC</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Action Buttons for Device Upload and Public Link */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingPhoto || (profile.photos?.length || 0) >= 6}
              className="btn-bumble-action"
              style={{
                padding: '12px 24px',
                borderRadius: 'var(--radius-buttons, 16px)',
                backgroundColor: 'var(--color-bumble-honey, #ffdb5b)',
                color: 'var(--color-bumble-ink, #202020)',
                border: '1.5px solid var(--color-bumble-ink, #202020)',
                fontSize: '14px',
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
              }}
            >
              {uploadingPhoto ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Uploading from Device...
                </>
              ) : (
                <>
                  <Upload size={16} /> Choose Photo from Device
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setShowUrlPhotoInput(!showUrlPhotoInput)}
              style={{
                padding: '12px 18px',
                borderRadius: 'var(--radius-buttons, 16px)',
                backgroundColor: 'var(--color-paper-white, #ffffff)',
                color: 'var(--color-graphite, #575656)',
                border: '1px solid #d4d4d4',
                fontSize: '13px',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
              }}
            >
              <LinkIcon size={14} /> {showUrlPhotoInput ? 'Hide Link Input' : 'Or add via image URL'}
            </button>
          </div>

          {/* Add Photo URL Input (Optional) */}
          {showUrlPhotoInput && (
            <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
              <input
                type="text"
                placeholder="Paste public image link (Unsplash, Cloudinary, etc.)..."
                value={newPhotoURL}
                onChange={(e) => setNewPhotoURL(e.target.value)}
                style={{
                  flex: 1,
                  fontSize: '14px',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-buttons, 16px)',
                  border: '1.5px solid var(--color-bumble-ink, #202020)',
                  backgroundColor: 'var(--color-paper-white, #ffffff)',
                  color: 'var(--color-bumble-ink, #202020)',
                }}
              />
              <button
                onClick={handleAddPhoto}
                className="btn-bumble-action"
                style={{
                  padding: '12px 22px',
                  borderRadius: 'var(--radius-buttons, 16px)',
                  backgroundColor: 'var(--color-bumble-ink, #202020)',
                  color: 'var(--color-paper-white, #ffffff)',
                  fontSize: '14px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  letterSpacing: '0.01em',
                }}
              >
                <Plus size={16} /> Add Link
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 2. Curiosity Prompts Section */}
      <form
        onSubmit={handleSaveCuriosity}
        style={{
          padding: '32px',
          backgroundColor: 'var(--color-paper-white, #ffffff)',
          borderRadius: 'var(--radius-cards, 24px)',
          border: '1.5px solid var(--color-bumble-ink, #202020)',
          boxShadow: 'var(--shadow-sm, 0px 1px 8px rgba(32, 32, 32, 0.12))',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
        }}
      >
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: 'var(--radius-badges, 1000px)',
              backgroundColor: 'var(--color-bumble-honey, #ffdb5b)',
              color: 'var(--color-bumble-ink, #202020)',
              fontSize: '12px',
              fontWeight: 800,
              letterSpacing: '0.02em',
              marginBottom: '10px',
            }}
          >
            <CupiddleIcon size={15} color="var(--color-bumble-ink, #202020)" />
            Contextual Sparks Engine
          </div>
          <h2
            style={{
              fontSize: '22px',
              fontWeight: 800,
              color: 'var(--color-bumble-ink, #202020)',
              letterSpacing: '-0.02em',
            }}
          >
            Curiosity Prompts (What People Spark)
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--color-graphite, #575656)', marginTop: '4px' }}>
            People don't swipe blindly on Cupiddle. They spark specific ideas and answers below.
          </p>
        </div>

        {/* 1. Rabbit Hole (Pollen Accent Frame) */}
        <div
          style={{
            padding: '20px',
            borderRadius: 'var(--radius-buttons, 16px)',
            backgroundColor: 'var(--color-pollen, #fff386)',
            border: '1.5px solid var(--color-bumble-ink, #202020)',
          }}
        >
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '13px',
              fontWeight: 800,
              color: 'var(--color-bumble-ink, #202020)',
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.03em',
            }}
          >
            <Compass size={17} /> My Rabbit Hole — What are you currently obsessed with?
          </label>
          <textarea
            rows={2}
            value={rabbitHole}
            onChange={(e) => setRabbitHole(e.target.value)}
            placeholder="e.g. Cellular automata, Nigerian indie film grammar, quantum cryptography, Lagos architecture..."
            style={{
              width: '100%',
              fontSize: '14px',
              padding: '12px 14px',
              borderRadius: 'var(--radius-buttons, 16px)',
              border: '1.5px solid var(--color-bumble-ink, #202020)',
              backgroundColor: 'var(--color-paper-white, #ffffff)',
              color: 'var(--color-bumble-ink, #202020)',
            }}
          />
        </div>

        {/* 2. Defend This Take (Mist Accent Frame) */}
        <div
          style={{
            padding: '20px',
            borderRadius: 'var(--radius-buttons, 16px)',
            backgroundColor: 'var(--color-mist, #f3f3f3)',
            border: '1.5px solid var(--color-bumble-ink, #202020)',
          }}
        >
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '13px',
              fontWeight: 800,
              color: 'var(--color-bumble-ink, #202020)',
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.03em',
            }}
          >
            <Flame size={17} /> Defend This Take — An opinion you're willing to defend
          </label>
          <textarea
            rows={2}
            value={defendTake}
            onChange={(e) => setDefendTake(e.target.value)}
            placeholder="e.g. Streaming algorithms flattened narrative bravery; video games are 21st century high art..."
            style={{
              width: '100%',
              fontSize: '14px',
              padding: '12px 14px',
              borderRadius: 'var(--radius-buttons, 16px)',
              border: '1.5px solid var(--color-bumble-ink, #202020)',
              backgroundColor: 'var(--color-paper-white, #ffffff)',
              color: 'var(--color-bumble-ink, #202020)',
            }}
          />
        </div>

        {/* 3. Teach Me Something (Paper White Frame) */}
        <div
          style={{
            padding: '20px',
            borderRadius: 'var(--radius-buttons, 16px)',
            backgroundColor: 'var(--color-paper-white, #ffffff)',
            border: '1.5px solid var(--color-bumble-ink, #202020)',
          }}
        >
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '13px',
              fontWeight: 800,
              color: 'var(--color-bumble-ink, #202020)',
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.03em',
            }}
          >
            <Lightbulb size={17} /> Teach Me Something — What could you teach someone for hours?
          </label>
          <textarea
            rows={2}
            value={teachMe}
            onChange={(e) => setTeachMe(e.target.value)}
            placeholder="e.g. How CRISPR gene editing works without hype; why sourdough fermentation behaves like an ecosystem..."
            style={{
              width: '100%',
              fontSize: '14px',
              padding: '12px 14px',
              borderRadius: 'var(--radius-buttons, 16px)',
              border: '1.5px solid var(--color-bumble-ink, #202020)',
              backgroundColor: 'var(--color-paper-white, #ffffff)',
              color: 'var(--color-bumble-ink, #202020)',
            }}
          />
        </div>

        {/* My World Tags */}
        <div
          style={{
            padding: '20px',
            borderRadius: 'var(--radius-buttons, 16px)',
            backgroundColor: 'var(--color-mist, #f3f3f3)',
            border: '1.5px solid var(--color-bumble-ink, #202020)',
          }}
        >
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              fontWeight: 800,
              color: 'var(--color-bumble-ink, #202020)',
              marginBottom: '10px',
              letterSpacing: '0.01em',
            }}
          >
            <Tag size={16} /> My World Tags (Books, films, anime, games, code, artists)
          </label>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' }}>
            {myWorldTags.map((tag) => (
              <span
                key={tag}
                className="pill-interactive"
                style={{
                  padding: '6px 14px',
                  backgroundColor: 'var(--color-paper-white, #ffffff)',
                  border: '1.5px solid var(--color-bumble-ink, #202020)',
                  borderRadius: 'var(--radius-badges, 1000px)',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: 'var(--color-bumble-ink, #202020)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  style={{
                    color: 'var(--color-graphite, #575656)',
                    fontWeight: 800,
                    fontSize: '14px',
                    lineHeight: 1,
                  }}
                >
                  ×
                </button>
              </span>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              placeholder="Add tag (e.g. Dune, Disco Elysium, Rust, Wong Kar-wai, Afrobeats)..."
              value={newTagInput}
              onChange={(e) => setNewTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
              style={{
                flex: 1,
                fontSize: '14px',
                padding: '10px 14px',
                borderRadius: 'var(--radius-buttons, 16px)',
                border: '1.5px solid var(--color-bumble-ink, #202020)',
                backgroundColor: 'var(--color-paper-white, #ffffff)',
                color: 'var(--color-bumble-ink, #202020)',
              }}
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="btn-bumble-action"
              style={{
                padding: '10px 20px',
                borderRadius: 'var(--radius-buttons, 16px)',
                backgroundColor: 'var(--color-bumble-ink, #202020)',
                color: 'var(--color-paper-white, #ffffff)',
                fontSize: '14px',
                fontWeight: 700,
              }}
            >
              Add Tag
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-bumble-action"
          style={{
            alignSelf: 'flex-end',
            padding: '14px 32px',
            borderRadius: 'var(--radius-buttons, 16px)',
            backgroundColor: 'var(--color-bumble-ink, #202020)',
            color: 'var(--color-paper-white, #ffffff)',
            fontWeight: 800,
            fontSize: '15px',
            letterSpacing: '0.01em',
          }}
        >
          {loading ? 'Saving...' : 'Save Curiosity Profile'}
        </button>
      </form>

      {/* 2.5 Campus Identity, Verification & Gatekeeper (Nigerian Campus Hub) */}
      <div
        style={{
          padding: '32px',
          backgroundColor: 'var(--color-paper-white, #ffffff)',
          borderRadius: 'var(--radius-cards, 24px)',
          border: '1.5px solid var(--color-bumble-ink, #202020)',
          boxShadow: 'var(--shadow-sm, 0px 1px 8px rgba(32, 32, 32, 0.12))',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <GraduationCap size={22} color="var(--color-bumble-ink, #202020)" />
              <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--color-bumble-ink, #202020)', margin: 0 }}>
                Campus Identity & Verification
              </h2>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--color-charcoal, #3a3a3a)', marginTop: '4px', marginBottom: 0 }}>
              Exclusive to Nigerian University Students. 100% Free, zero paid identity apps.
            </p>
          </div>

          {profile.is_student_verified ? (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '20px', backgroundColor: '#dcfce7', color: '#166534', fontWeight: 800, fontSize: '13px' }}>
              <ShieldCheck size={16} /> Verified Student @ {profile.campus || 'EBSU'}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowVerificationModal(true)}
              className="btn-bumble-action"
              style={{
                backgroundColor: 'var(--color-bumble-honey, #ffdb5b)',
                color: 'var(--color-bumble-ink, #202020)',
                border: '1.5px solid var(--color-bumble-ink, #202020)',
                borderRadius: '16px',
                padding: '8px 18px',
                fontWeight: 800,
                fontSize: '13px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
              }}
            >
              <ShieldCheck size={16} /> Verify Student ID (₦0)
            </button>
          )}
        </div>

        {/* Live Broadcast Campus Mood / Vibe */}
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--color-bumble-ink, #202020)', marginBottom: '8px' }}>
            Broadcast Campus Vibe (What are you in the mood for?)
          </label>
          <MoodTagSelector selectedTag={vibeTag} onSelectTag={setVibeTag} />
        </div>

        {/* Gate Question */}
        <div style={{ backgroundColor: '#fffbeb', borderRadius: '16px', padding: '18px', border: '1.5px dashed var(--color-bumble-ink, #202020)' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 800, color: 'var(--color-bumble-ink, #202020)', marginBottom: '4px' }}>
            🔒 Your Connection Gate Question
          </label>
          <p style={{ fontSize: '12px', color: '#666', marginBottom: '10px' }}>
            No random unverified slides. Candidates must submit an answer to this question before their Spark connects to your inbox.
          </p>
          <textarea
            rows={2}
            value={gateQuestion}
            onChange={(e) => setGateQuestion(e.target.value)}
            placeholder="e.g. Which 300L lecturer tests hardest? / Favorite midnight spot on campus? / Are you a night owl or morning reader?"
            style={{
              width: '100%',
              padding: '12px 14px',
              fontSize: '14px',
              borderRadius: '12px',
              border: '1.5px solid var(--color-bumble-ink, #202020)',
              backgroundColor: '#fff',
              color: 'var(--color-bumble-ink, #202020)',
            }}
          />
        </div>

        {/* Campus, Level, Faculty Details */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--color-bumble-ink, #202020)', marginBottom: '6px' }}>
              Campus
            </label>
            <select
              value={campus}
              onChange={(e) => setCampus(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 14px',
                fontSize: '14px',
                borderRadius: '14px',
                border: '1.5px solid var(--color-bumble-ink, #202020)',
                backgroundColor: '#fff',
                color: 'var(--color-bumble-ink, #202020)',
                fontWeight: 600,
              }}
            >
              <option value="EBSU">Ebonyi State University (EBSU)</option>
              <option value="UNN">University of Nigeria, Nsukka (UNN)</option>
              <option value="UNILAG">University of Lagos (UNILAG)</option>
              <option value="OAU">Obafemi Awolowo University (OAU)</option>
              <option value="UI">University of Ibadan (UI)</option>
              <option value="ABU">Ahmadu Bello University (ABU)</option>
              <option value="FUTO">Fed. Univ. of Tech Owerri (FUTO)</option>
              <option value="ESUT">Enugu State Univ. of Science & Tech (ESUT)</option>
              <option value="IMSU">Imo State University (IMSU)</option>
              <option value="DELSU">Delta State University (DELSU)</option>
              <option value="OTHER">Other Nigerian University</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--color-bumble-ink, #202020)', marginBottom: '6px' }}>
              Academic Level
            </label>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 14px',
                fontSize: '14px',
                borderRadius: '14px',
                border: '1.5px solid var(--color-bumble-ink, #202020)',
                backgroundColor: '#fff',
                color: 'var(--color-bumble-ink, #202020)',
                fontWeight: 600,
              }}
            >
              <option value="100L">100 Level (Fresher)</option>
              <option value="200L">200 Level</option>
              <option value="300L">300 Level</option>
              <option value="400L">400 Level (Finalist/Penultimate)</option>
              <option value="500L">500 Level (Finalist)</option>
              <option value="PG">Postgraduate</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--color-bumble-ink, #202020)', marginBottom: '6px' }}>
              Faculty / Department
            </label>
            <input
              type="text"
              value={faculty}
              onChange={(e) => setFaculty(e.target.value)}
              placeholder="e.g. Law, Medicine, CS, Mass Comm"
              style={{
                width: '100%',
                padding: '12px 14px',
                fontSize: '14px',
                borderRadius: '14px',
                border: '1.5px solid var(--color-bumble-ink, #202020)',
                backgroundColor: '#fff',
                color: 'var(--color-bumble-ink, #202020)',
              }}
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleSaveBasic}
          disabled={loading}
          className="btn-bumble-action"
          style={{
            alignSelf: 'flex-end',
            padding: '12px 28px',
            borderRadius: 'var(--radius-buttons, 16px)',
            backgroundColor: 'var(--color-bumble-ink, #202020)',
            color: 'var(--color-paper-white, #ffffff)',
            fontWeight: 800,
            fontSize: '14px',
            cursor: 'pointer',
          }}
        >
          {loading ? 'Saving Campus Profile...' : 'Save Campus Profile'}
        </button>
      </div>

      {/* 3. Basic Identity & Location Form (All 37 Nigerian States) */}
      <form
        onSubmit={handleSaveBasic}
        style={{
          padding: '32px',
          backgroundColor: 'var(--color-paper-white, #ffffff)',
          borderRadius: 'var(--radius-cards, 24px)',
          border: '1.5px solid var(--color-bumble-ink, #202020)',
          boxShadow: 'var(--shadow-sm, 0px 1px 8px rgba(32, 32, 32, 0.12))',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}
      >
        <h2
          style={{
            fontSize: '22px',
            fontWeight: 800,
            color: 'var(--color-bumble-ink, #202020)',
            letterSpacing: '-0.02em',
          }}
        >
          Basic Identity & Location
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label
                style={{
                  fontSize: '13px',
                  fontWeight: 700,
                  color: 'var(--color-bumble-ink, #202020)',
                }}
              >
                Display Name
              </label>
              {profile.username && (
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#6366f1', backgroundColor: '#eef2ff', padding: '2px 8px', borderRadius: '10px' }}>
                  @{profile.username}
                </span>
              )}
            </div>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                fontSize: '15px',
                borderRadius: 'var(--radius-buttons, 16px)',
                border: '1.5px solid var(--color-bumble-ink, #202020)',
                backgroundColor: 'var(--color-paper-white, #ffffff)',
                color: 'var(--color-bumble-ink, #202020)',
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '13px',
                fontWeight: 700,
                color: 'var(--color-bumble-ink, #202020)',
                marginBottom: '6px',
              }}
            >
              <MapPin size={14} color="var(--color-bumble-ink, #202020)" />
              State / Location (All 36 States + Abuja)
            </label>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 14px',
                fontSize: '14px',
                borderRadius: 'var(--radius-buttons, 16px)',
                border: '1.5px solid var(--color-bumble-ink, #202020)',
                backgroundColor: 'var(--color-paper-white, #ffffff)',
                color: 'var(--color-bumble-ink, #202020)',
                fontWeight: 600,
              }}
            >
              {NIGERIAN_STATES.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label
            style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: 700,
              color: 'var(--color-bumble-ink, #202020)',
              marginBottom: '6px',
            }}
          >
            Bio / Introduction
          </label>
          <textarea
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell us what excites you or how you spend your unstructured time..."
            style={{
              width: '100%',
              padding: '12px 16px',
              fontSize: '15px',
              borderRadius: 'var(--radius-buttons, 16px)',
              border: '1.5px solid var(--color-bumble-ink, #202020)',
              backgroundColor: 'var(--color-paper-white, #ffffff)',
              color: 'var(--color-bumble-ink, #202020)',
            }}
          />
        </div>

        <div>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              fontWeight: 700,
              color: 'var(--color-bumble-ink, #202020)',
              marginBottom: '6px',
            }}
          >
            <Heart size={14} color="var(--color-bumble-ink, #202020)" />
            Dating Intentions
          </label>
          <input
            type="text"
            value={datingIntentions}
            onChange={(e) => setDatingIntentions(e.target.value)}
            placeholder="e.g. Deep conversations & long-term connection, intellectual spark..."
            style={{
              width: '100%',
              padding: '12px 16px',
              fontSize: '15px',
              borderRadius: 'var(--radius-buttons, 16px)',
              border: '1.5px solid var(--color-bumble-ink, #202020)',
              backgroundColor: 'var(--color-paper-white, #ffffff)',
              color: 'var(--color-bumble-ink, #202020)',
            }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-bumble-action"
          style={{
            alignSelf: 'flex-end',
            padding: '14px 32px',
            borderRadius: 'var(--radius-buttons, 16px)',
            backgroundColor: 'var(--color-bumble-ink, #202020)',
            color: 'var(--color-paper-white, #ffffff)',
            fontWeight: 800,
            fontSize: '15px',
            letterSpacing: '0.01em',
          }}
        >
          Update Identity
        </button>
      </form>

      {/* Install Cupiddle on your Phone (PWA) */}
      <div
        className="editorial-card-lift"
        style={{
          backgroundColor: 'var(--color-pollen, #fff386)',
          borderRadius: 'var(--radius-cards, 24px)',
          padding: '24px',
          border: '1.5px solid var(--color-bumble-ink, #202020)',
          boxShadow: 'var(--shadow-sm, 0px 1px 8px rgba(32, 32, 32, 0.12))',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: '240px' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '14px',
              backgroundColor: 'var(--color-bumble-ink, #202020)',
              color: 'var(--color-bumble-honey, #ffdb5b)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Smartphone size={24} />
          </div>
          <div>
            <h4 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: 'var(--color-bumble-ink, #202020)' }}>
              Install Cupiddle on Your Phone
            </h4>
            <p style={{ fontSize: '13px', color: 'var(--color-charcoal, #3a3a3a)', margin: '4px 0 0', lineHeight: 1.4 }}>
              Add Cupiddle to your home screen for fullscreen chat, real-time chimes, and zero app store wait.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => window.dispatchEvent(new CustomEvent('cupiddle:open-install'))}
          className="btn-bumble-action"
          style={{
            backgroundColor: 'var(--color-bumble-ink, #202020)',
            color: 'var(--color-paper-white, #ffffff)',
            borderRadius: 'var(--radius-buttons, 16px)',
            padding: '12px 24px',
            fontSize: '14px',
            fontWeight: 800,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            border: 'none',
          }}
        >
          <Download size={16} /> Install App
        </button>
      </div>

      {/* 4. Account Safety & Deletion (GDPR / NDPA Compliance) */}
      <div
        style={{
          padding: '28px 32px',
          backgroundColor: 'var(--color-mist, #f3f3f3)',
          borderRadius: 'var(--radius-cards, 24px)',
          border: '1.5px solid var(--color-bumble-ink, #202020)',
        }}
      >
        <h3
          style={{
            fontSize: '18px',
            fontWeight: 800,
            color: 'var(--color-bumble-ink, #202020)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '8px',
          }}
        >
          <ShieldAlert size={20} color="var(--color-bumble-ink, #202020)" />
          Account & Privacy Rights (NDPA 2023)
        </h3>
        <p
          style={{
            fontSize: '14px',
            color: 'var(--color-graphite, #575656)',
            marginBottom: '16px',
            lineHeight: 1.5,
          }}
        >
          Under the Nigerian Data Protection Act (NDPA) and global privacy standards, you maintain absolute sovereignty over your identity. You can permanently erase your profile, photos, matches, and chat history anytime with zero retention.
        </p>

        {showDeleteConfirm ? (
          <div
            style={{
              display: 'flex',
              gap: '12px',
              alignItems: 'center',
              flexWrap: 'wrap',
              backgroundColor: '#fff1f2',
              padding: '16px 20px',
              borderRadius: 'var(--radius-buttons, 16px)',
              border: '1.5px solid #f43f5e',
            }}
          >
            <span style={{ fontSize: '13px', color: '#9f1239', fontWeight: 700 }}>
              Are you completely sure? This action is permanent and irreversible.
            </span>
            <button
              onClick={onDeleteAccount}
              className="btn-bumble-action"
              style={{
                padding: '8px 18px',
                backgroundColor: '#e11d48',
                color: '#ffffff',
                borderRadius: 'var(--radius-buttons, 16px)',
                fontSize: '13px',
                fontWeight: 700,
              }}
            >
              Permanently Delete Account
            </button>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              style={{
                padding: '8px 14px',
                color: 'var(--color-graphite, #575656)',
                fontSize: '13px',
                fontWeight: 600,
              }}
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            style={{
              padding: '10px 20px',
              borderRadius: 'var(--radius-buttons, 16px)',
              border: '1.5px solid var(--color-bumble-ink, #202020)',
              backgroundColor: 'var(--color-paper-white, #ffffff)',
              color: 'var(--color-bumble-ink, #202020)',
              fontSize: '13px',
              fontWeight: 700,
            }}
          >
            Request Account Deletion
          </button>
        )}
      </div>

      <VerificationModal
        isOpen={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
        onSuccess={() => {
          setShowVerificationModal(false);
          api.getMe().then((me) => onUpdate(me.profile));
        }}
        currentCampus={campus}
        userHandle={profile.username}
      />
    </div>
  );
};
