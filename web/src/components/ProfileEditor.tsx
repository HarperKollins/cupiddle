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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
      {/* Header Banner */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          backgroundColor: '#170E12',
          borderRadius: '20px',
          border: '1px solid rgba(255, 31, 106, 0.25)',
          padding: '24px 20px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
        }}
      >
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: '9999px',
              backgroundColor: 'rgba(255, 31, 106, 0.12)',
              border: '1px solid rgba(255, 31, 106, 0.3)',
              color: '#FF1F6A',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              marginBottom: '8px',
            }}
          >
            <CupiddleIcon size={13} color="#FF1F6A" />
            Profile & Sparks Studio
          </div>
          <h1
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: '24px',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              color: '#FFFFFF',
              margin: '0 0 4px 0',
              lineHeight: 1.2,
            }}
          >
            Your Desire Profile
          </h1>
          <p
            style={{
              fontSize: '13px',
              color: '#9E8C93',
              margin: 0,
              lineHeight: 1.4,
            }}
          >
            Genuine curiosity is magnetic. Share what keeps you awake and what ignites your mind.
          </p>
        </div>

        {savedSuccess && (
          <span
            className="animate-pulse-gentle"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              backgroundColor: 'rgba(255, 31, 106, 0.18)',
              border: '1px solid #FF1F6A',
              color: '#FF1F6A',
              padding: '6px 14px',
              borderRadius: '9999px',
              fontSize: '12px',
              fontWeight: 700,
              boxShadow: '0 2px 10px rgba(255, 31, 106, 0.3)',
              flexShrink: 0,
            }}
          >
            <Check size={14} /> Saved
          </span>
        )}
      </div>

      {/* 1. Photographs Section */}
      <div
        style={{
          padding: '24px 20px',
          backgroundColor: '#170E12',
          borderRadius: '20px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h2
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: '19px',
                fontWeight: 700,
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                margin: 0,
              }}
            >
              <Camera size={19} color="#FF1F6A" />
              Profile Photographs
            </h2>
            <p style={{ fontSize: '12px', color: '#8A7B82', margin: '3px 0 0 0' }}>
              Portraits lead your discovery card with romantic cinematic depth.
            </p>
          </div>

          <span
            style={{
              padding: '4px 10px',
              borderRadius: '9999px',
              backgroundColor: '#1E1116',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#C7B6BC',
              fontSize: '11px',
              fontWeight: 700,
            }}
          >
            {profile.photos?.length || 0} / 6
          </span>
        </div>

        {/* Photos Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '18px' }}>
          {(profile.photos || []).map((photo) => (
            <div
              key={photo.id}
              style={{
                position: 'relative',
                height: '140px',
                borderRadius: '16px',
                overflow: 'hidden',
                border: '1px solid rgba(255, 31, 106, 0.25)',
                backgroundColor: '#1E1116',
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
                    top: '6px',
                    left: '6px',
                    background: 'linear-gradient(135deg, #FF1F6A 0%, #B81347 100%)',
                    color: '#FFFFFF',
                    fontSize: '9px',
                    fontWeight: 800,
                    padding: '2px 6px',
                    borderRadius: '9999px',
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                  }}
                >
                  Hero
                </span>
              )}
              <button
                onClick={() => handleDeletePhoto(photo.id)}
                aria-label="Delete photo"
                style={{
                  position: 'absolute',
                  top: '6px',
                  right: '6px',
                  backgroundColor: 'rgba(13, 8, 10, 0.75)',
                  backdropFilter: 'blur(4px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: '#FFFFFF',
                  borderRadius: '50%',
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <Trash2 size={12} />
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
              style={{
                height: '140px',
                borderRadius: '16px',
                border: '1.5px dashed rgba(255, 31, 106, 0.35)',
                backgroundColor: 'rgba(255, 31, 106, 0.05)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                color: '#E0D4D8',
                padding: '12px',
                textAlign: 'center',
                cursor: uploadingPhoto ? 'wait' : 'pointer',
              }}
            >
              {uploadingPhoto ? (
                <>
                  <Loader2 size={20} className="animate-spin" color="#FF1F6A" />
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#FF1F6A' }}>Uploading...</span>
                </>
              ) : (
                <>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(255, 31, 106, 0.15)',
                      border: '1px solid rgba(255, 31, 106, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Upload size={14} color="#FF1F6A" />
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#FFFFFF' }}>Add Photo</span>
                  <span style={{ fontSize: '10px', color: '#8A7B82' }}>From phone</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Action Buttons for Device Upload and Public Link */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingPhoto || (profile.photos?.length || 0) >= 6}
              style={{
                flex: 1,
                padding: '10px 16px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #FF1F6A 0%, #B81347 100%)',
                color: '#FFFFFF',
                border: 'none',
                fontSize: '13px',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(255, 31, 106, 0.3)',
              }}
            >
              {uploadingPhoto ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Uploading...
                </>
              ) : (
                <>
                  <Upload size={14} /> Upload Portrait
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setShowUrlPhotoInput(!showUrlPhotoInput)}
              style={{
                padding: '10px 14px',
                borderRadius: '14px',
                backgroundColor: '#1E1116',
                color: '#C7B6BC',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                fontSize: '12px',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                cursor: 'pointer',
              }}
            >
              <LinkIcon size={13} /> {showUrlPhotoInput ? 'Hide' : 'Add URL'}
            </button>
          </div>

          {/* Add Photo URL Input (Optional) */}
          {showUrlPhotoInput && (
            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
              <input
                type="text"
                placeholder="Paste public image link (Unsplash, Cloudinary, etc.)..."
                value={newPhotoURL}
                onChange={(e) => setNewPhotoURL(e.target.value)}
                style={{
                  flex: 1,
                  fontSize: '13px',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  backgroundColor: '#1E1116',
                  color: '#FFFFFF',
                  outline: 'none',
                }}
              />
              <button
                onClick={handleAddPhoto}
                style={{
                  padding: '10px 16px',
                  borderRadius: '12px',
                  backgroundColor: '#2A141E',
                  border: '1px solid rgba(255, 31, 106, 0.4)',
                  color: '#FF1F6A',
                  fontSize: '13px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer',
                }}
              >
                <Plus size={14} /> Add
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 2. Curiosity Prompts Section */}
      <form
        onSubmit={handleSaveCuriosity}
        style={{
          padding: '24px 20px',
          backgroundColor: '#170E12',
          borderRadius: '20px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          gap: '18px',
        }}
      >
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: '9999px',
              backgroundColor: 'rgba(255, 31, 106, 0.12)',
              color: '#FF1F6A',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              marginBottom: '6px',
            }}
          >
            <CupiddleIcon size={13} color="#FF1F6A" />
            Curiosity Sparks Engine
          </div>
          <h2
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: '19px',
              fontWeight: 700,
              color: '#FFFFFF',
              letterSpacing: '-0.02em',
              margin: '0 0 2px 0',
            }}
          >
            Curiosity Prompts (What People Spark)
          </h2>
          <p style={{ fontSize: '12px', color: '#8A7B82', margin: 0 }}>
            People don't swipe blindly on Cupiddle. They spark specific takes and answers below.
          </p>
        </div>

        {/* 1. Rabbit Hole */}
        <div
          style={{
            padding: '16px',
            borderRadius: '16px',
            backgroundColor: '#1E1116',
            border: '1px solid rgba(255, 31, 106, 0.22)',
          }}
        >
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              fontWeight: 700,
              color: '#FF1F6A',
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            <Compass size={14} /> My Rabbit Hole — Late-night obsession
          </label>
          <textarea
            rows={2}
            value={rabbitHole}
            onChange={(e) => setRabbitHole(e.target.value)}
            placeholder="e.g. Cellular automata, Nigerian indie cinema, quantum cryptography, Lagos architecture..."
            style={{
              width: '100%',
              fontSize: '13px',
              padding: '10px 12px',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              backgroundColor: '#140B10',
              color: '#FFFFFF',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* 2. Defend This Take */}
        <div
          style={{
            padding: '16px',
            borderRadius: '16px',
            backgroundColor: '#1E1116',
            border: '1px solid rgba(255, 31, 106, 0.22)',
          }}
        >
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              fontWeight: 700,
              color: '#FF1F6A',
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            <Flame size={14} /> Defend This Take — An unfiltered opinion
          </label>
          <textarea
            rows={2}
            value={defendTake}
            onChange={(e) => setDefendTake(e.target.value)}
            placeholder="e.g. Streaming algorithms flattened narrative bravery; video games are 21st century high art..."
            style={{
              width: '100%',
              fontSize: '13px',
              padding: '10px 12px',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              backgroundColor: '#140B10',
              color: '#FFFFFF',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* 3. Teach Me Something */}
        <div
          style={{
            padding: '16px',
            borderRadius: '16px',
            backgroundColor: '#1E1116',
            border: '1px solid rgba(255, 31, 106, 0.22)',
          }}
        >
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              fontWeight: 700,
              color: '#FF1F6A',
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            <Lightbulb size={14} /> Teach Me Something — Talk for hours about...
          </label>
          <textarea
            rows={2}
            value={teachMe}
            onChange={(e) => setTeachMe(e.target.value)}
            placeholder="e.g. How CRISPR gene editing works without hype; why sourdough behaves like an ecosystem..."
            style={{
              width: '100%',
              fontSize: '13px',
              padding: '10px 12px',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              backgroundColor: '#140B10',
              color: '#FFFFFF',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* My World Tags */}
        <div
          style={{
            padding: '16px',
            borderRadius: '16px',
            backgroundColor: '#1E1116',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              fontWeight: 700,
              color: '#C7B6BC',
              marginBottom: '8px',
            }}
          >
            <Tag size={14} color="#FF1F6A" /> My World Tags (Books, films, anime, games, code, artists)
          </label>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
            {myWorldTags.map((tag) => (
              <span
                key={tag}
                style={{
                  padding: '5px 12px',
                  backgroundColor: 'rgba(255, 31, 106, 0.12)',
                  border: '1px solid rgba(255, 31, 106, 0.3)',
                  borderRadius: '9999px',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#FFFFFF',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  style={{
                    color: '#FF1F6A',
                    fontWeight: 800,
                    fontSize: '13px',
                    lineHeight: 1,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  ×
                </button>
              </span>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              placeholder="Add tag (e.g. Dune, Disco Elysium, Rust, Wong Kar-wai)..."
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
                fontSize: '13px',
                padding: '10px 12px',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                backgroundColor: '#140B10',
                color: '#FFFFFF',
                outline: 'none',
              }}
            />
            <button
              type="button"
              onClick={handleAddTag}
              style={{
                padding: '10px 16px',
                borderRadius: '12px',
                backgroundColor: '#2A141E',
                border: '1px solid rgba(255, 31, 106, 0.4)',
                color: '#FF1F6A',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Add
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            alignSelf: 'flex-end',
            padding: '12px 24px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #FF1F6A 0%, #B81347 100%)',
            border: 'none',
            color: '#FFFFFF',
            fontWeight: 700,
            fontSize: '13px',
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(255, 31, 106, 0.35)',
          }}
        >
          {loading ? 'Saving...' : 'Save Curiosity Profile'}
        </button>
      </form>

      {/* 2.5 Campus Identity, Verification & Gatekeeper (Nigerian Campus Hub) */}
      <div
        style={{
          padding: '24px 20px',
          backgroundColor: '#170E12',
          borderRadius: '20px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          gap: '18px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <GraduationCap size={20} color="#FF1F6A" />
              <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '19px', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>
                Campus Identity & Verification
              </h2>
            </div>
            <p style={{ fontSize: '12px', color: '#8A7B82', marginTop: '2px', marginBottom: 0 }}>
              Exclusive to Nigerian University Students. 100% Free, zero paid verification apps.
            </p>
          </div>

          {profile.is_student_verified ? (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '5px 12px', borderRadius: '9999px', backgroundColor: 'rgba(34, 197, 94, 0.15)', border: '1px solid rgba(34, 197, 94, 0.3)', color: '#4ade80', fontWeight: 700, fontSize: '12px' }}>
              <ShieldCheck size={14} /> Verified Student @ {profile.campus || 'EBSU'}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowVerificationModal(true)}
              style={{
                backgroundColor: 'rgba(255, 31, 106, 0.15)',
                color: '#FF1F6A',
                border: '1px solid rgba(255, 31, 106, 0.4)',
                borderRadius: '9999px',
                padding: '6px 14px',
                fontWeight: 700,
                fontSize: '12px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                cursor: 'pointer',
              }}
            >
              <ShieldCheck size={14} /> Verify Student ID (₦0)
            </button>
          )}
        </div>

        {/* Live Broadcast Campus Mood / Vibe */}
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#C7B6BC', marginBottom: '8px' }}>
            Broadcast Campus Vibe (What are you in the mood for?)
          </label>
          <MoodTagSelector selectedTag={vibeTag} onSelectTag={setVibeTag} />
        </div>

        {/* Gate Question */}
        <div style={{ backgroundColor: '#1E1116', borderRadius: '16px', padding: '16px', border: '1.5px dashed rgba(255, 31, 106, 0.35)' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#FF1F6A', marginBottom: '3px' }}>
            🔒 Connection Gate Question
          </label>
          <p style={{ fontSize: '11px', color: '#8A7B82', marginBottom: '8px' }}>
            No random unverified slides. Candidates must answer this question before sparking your inbox.
          </p>
          <textarea
            rows={2}
            value={gateQuestion}
            onChange={(e) => setGateQuestion(e.target.value)}
            placeholder="e.g. Which 300L lecturer tests hardest? / Favorite midnight spot on campus? / Night owl or morning reader?"
            style={{
              width: '100%',
              padding: '10px 12px',
              fontSize: '13px',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              backgroundColor: '#140B10',
              color: '#FFFFFF',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Campus, Level, Faculty Details */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#C7B6BC', marginBottom: '5px' }}>
              Campus
            </label>
            <select
              value={campus}
              onChange={(e) => setCampus(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                fontSize: '13px',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                backgroundColor: '#1E1116',
                color: '#FFFFFF',
                fontWeight: 600,
                outline: 'none',
                boxSizing: 'border-box',
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
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#C7B6BC', marginBottom: '5px' }}>
              Academic Level
            </label>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                fontSize: '13px',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                backgroundColor: '#1E1116',
                color: '#FFFFFF',
                fontWeight: 600,
                outline: 'none',
                boxSizing: 'border-box',
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
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#C7B6BC', marginBottom: '5px' }}>
              Faculty / Dept
            </label>
            <input
              type="text"
              value={faculty}
              onChange={(e) => setFaculty(e.target.value)}
              placeholder="e.g. Law, Medicine, CS"
              style={{
                width: '100%',
                padding: '10px 12px',
                fontSize: '13px',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                backgroundColor: '#1E1116',
                color: '#FFFFFF',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleSaveBasic}
          disabled={loading}
          style={{
            alignSelf: 'flex-end',
            padding: '10px 22px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #FF1F6A 0%, #B81347 100%)',
            border: 'none',
            color: '#FFFFFF',
            fontWeight: 700,
            fontSize: '13px',
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(255, 31, 106, 0.35)',
          }}
        >
          {loading ? 'Saving...' : 'Save Campus Profile'}
        </button>
      </div>

      {/* 3. Basic Identity & Location Form (All 37 Nigerian States) */}
      <form
        onSubmit={handleSaveBasic}
        style={{
          padding: '24px 20px',
          backgroundColor: '#170E12',
          borderRadius: '20px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        <h2
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: '19px',
            fontWeight: 700,
            color: '#FFFFFF',
            letterSpacing: '-0.02em',
            margin: 0,
          }}
        >
          Basic Identity & Location
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#C7B6BC' }}>
                Display Name
              </label>
              {profile.username && (
                <span style={{ fontSize: '10px', fontWeight: 700, color: '#FF1F6A', backgroundColor: 'rgba(255, 31, 106, 0.12)', padding: '2px 6px', borderRadius: '6px' }}>
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
                padding: '10px 12px',
                fontSize: '13px',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                backgroundColor: '#1E1116',
                color: '#FFFFFF',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '12px',
                fontWeight: 700,
                color: '#C7B6BC',
                marginBottom: '5px',
              }}
            >
              <MapPin size={13} color="#FF1F6A" />
              State / Location
            </label>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                fontSize: '13px',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                backgroundColor: '#1E1116',
                color: '#FFFFFF',
                fontWeight: 600,
                outline: 'none',
                boxSizing: 'border-box',
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
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#C7B6BC', marginBottom: '5px' }}>
            Bio / Introduction
          </label>
          <textarea
            rows={2}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell us what excites you or how you spend your unstructured late-night time..."
            style={{
              width: '100%',
              padding: '10px 12px',
              fontSize: '13px',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              backgroundColor: '#1E1116',
              color: '#FFFFFF',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              fontSize: '12px',
              fontWeight: 700,
              color: '#C7B6BC',
              marginBottom: '5px',
            }}
          >
            <Heart size={13} color="#FF1F6A" />
            Dating Intentions
          </label>
          <input
            type="text"
            value={datingIntentions}
            onChange={(e) => setDatingIntentions(e.target.value)}
            placeholder="e.g. Deep conversations & long-term connection, late-night companion..."
            style={{
              width: '100%',
              padding: '10px 12px',
              fontSize: '13px',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              backgroundColor: '#1E1116',
              color: '#FFFFFF',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            alignSelf: 'flex-end',
            padding: '12px 24px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #FF1F6A 0%, #B81347 100%)',
            border: 'none',
            color: '#FFFFFF',
            fontWeight: 700,
            fontSize: '13px',
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(255, 31, 106, 0.35)',
          }}
        >
          Update Identity
        </button>
      </form>

      {/* Install Cupiddle on your Phone (PWA) */}
      <div
        style={{
          backgroundColor: '#170E12',
          borderRadius: '20px',
          padding: '20px',
          border: '1px solid rgba(255, 31, 106, 0.25)',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '14px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '200px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              backgroundColor: '#2A141E',
              color: '#FF1F6A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Smartphone size={20} />
          </div>
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 700, margin: 0, color: '#FFFFFF' }}>
              Install Cupiddle on Your Phone
            </h4>
            <p style={{ fontSize: '12px', color: '#8A7B82', margin: '2px 0 0', lineHeight: 1.4 }}>
              Add Cupiddle to your home screen for fullscreen chat, real-time chimes, and zero app store wait.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => window.dispatchEvent(new CustomEvent('cupiddle:open-install'))}
          style={{
            backgroundColor: 'rgba(255, 31, 106, 0.15)',
            color: '#FF1F6A',
            border: '1px solid rgba(255, 31, 106, 0.4)',
            borderRadius: '14px',
            padding: '10px 18px',
            fontSize: '13px',
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
          }}
        >
          <Download size={14} /> Install App
        </button>
      </div>

      {/* 4. Account Safety & Deletion (GDPR / NDPA Compliance) */}
      <div
        style={{
          padding: '20px',
          backgroundColor: '#170E12',
          borderRadius: '20px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <h3
          style={{
            fontSize: '15px',
            fontWeight: 700,
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '6px',
          }}
        >
          <ShieldAlert size={16} color="#FF1F6A" />
          Account & Privacy Rights (NDPA 2023)
        </h3>
        <p
          style={{
            fontSize: '12px',
            color: '#8A7B82',
            marginBottom: '14px',
            lineHeight: 1.5,
          }}
        >
          Under the Nigerian Data Protection Act (NDPA) and global privacy standards, you maintain absolute sovereignty over your identity. You can permanently erase your profile, photos, matches, and chat history anytime with zero retention.
        </p>

        {showDeleteConfirm ? (
          <div
            style={{
              display: 'flex',
              gap: '10px',
              alignItems: 'center',
              flexWrap: 'wrap',
              backgroundColor: 'rgba(225, 29, 72, 0.1)',
              padding: '12px 16px',
              borderRadius: '14px',
              border: '1px solid rgba(225, 29, 72, 0.4)',
            }}
          >
            <span style={{ fontSize: '12px', color: '#fda4af', fontWeight: 600 }}>
              Are you completely sure? This action is permanent and irreversible.
            </span>
            <button
              onClick={onDeleteAccount}
              style={{
                padding: '8px 16px',
                backgroundColor: '#e11d48',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Permanently Delete
            </button>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              style={{
                padding: '8px 12px',
                color: '#8A7B82',
                backgroundColor: 'transparent',
                border: 'none',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            style={{
              padding: '8px 16px',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              backgroundColor: '#1E1116',
              color: '#8A7B82',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
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
