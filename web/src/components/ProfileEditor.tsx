import React, { useState } from 'react';
import { Camera, Plus, Trash2, Check, ShieldAlert, Sparkles, Compass, Flame, Lightbulb } from 'lucide-react';
import { Profile } from '../types';
import { api } from '../api';

interface ProfileEditorProps {
  profile: Profile;
  onUpdate: (updated: Profile) => void;
  onDeleteAccount: () => void;
}

export const ProfileEditor: React.FC<ProfileEditorProps> = ({ profile, onUpdate, onDeleteAccount }) => {
  const [displayName, setDisplayName] = useState(profile.display_name);
  const [bio, setBio] = useState(profile.bio || '');
  const [city, setCity] = useState(profile.city || '');
  const [datingIntentions, setDatingIntentions] = useState(profile.dating_intentions || '');
  const [rabbitHole, setRabbitHole] = useState(profile.rabbit_hole || '');
  const [defendTake, setDefendTake] = useState(profile.defend_take || '');
  const [teachMe, setTeachMe] = useState(profile.teach_me || '');
  const [myWorldTags, setMyWorldTags] = useState<string[]>(profile.my_world_tags || []);
  const [newTagInput, setNewTagInput] = useState('');
  const [newPhotoURL, setNewPhotoURL] = useState('');
  const [loading, setLoading] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSaveBasic = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const updated = await api.updateProfile({
        display_name: displayName,
        bio,
        city,
        dating_intentions: datingIntentions,
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
    <div style={{ maxWidth: '780px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#ffffff' }}>Your Curiosity Profile</h2>
          <p style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>
            Curiosity is attractive. Share what you think about, not just how you look.
          </p>
        </div>
        {savedSuccess && (
          <span style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'rgba(34, 197, 94, 0.2)',
            color: '#4ade80',
            padding: '6px 14px',
            borderRadius: 'var(--radius-full)',
            fontSize: '13px',
            fontWeight: 700,
          }}>
            <Check size={16} /> Saved!
          </span>
        )}
      </div>

      {/* Photographs Section */}
      <div style={{
        padding: '24px',
        backgroundColor: 'var(--color-surface-card)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-surface-border)',
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#ffffff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Camera size={20} color="var(--color-violet-400)" />
          Profile Photographs
        </h3>

        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginBottom: '16px' }}>
          {(profile.photos || []).map((photo) => (
            <div key={photo.id} style={{ position: 'relative', width: '130px', height: '170px', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
              <img src={photo.url} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              {photo.is_primary && (
                <span style={{
                  position: 'absolute',
                  top: '6px',
                  left: '6px',
                  backgroundColor: 'var(--color-violet-600)',
                  color: '#ffffff',
                  fontSize: '10px',
                  fontWeight: 700,
                  padding: '2px 6px',
                  borderRadius: '4px',
                }}>
                  Primary
                </span>
              )}
              <button
                onClick={() => handleDeletePhoto(photo.id)}
                style={{
                  position: 'absolute',
                  top: '6px',
                  right: '6px',
                  backgroundColor: 'rgba(0, 0, 0, 0.6)',
                  color: '#ffffff',
                  borderRadius: '50%',
                  padding: '4px',
                }}
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            placeholder="Image URL (e.g. Unsplash or hosted photo link)..."
            value={newPhotoURL}
            onChange={(e) => setNewPhotoURL(e.target.value)}
            style={{ flex: 1, fontSize: '13px' }}
          />
          <button
            onClick={handleAddPhoto}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--color-violet-600)',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Plus size={16} /> Add Photo
          </button>
        </div>
      </div>

      {/* Curiosity Prompts Section */}
      <form onSubmit={handleSaveCuriosity} style={{
        padding: '24px',
        backgroundColor: 'var(--color-surface-card)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-surface-border)',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={20} color="var(--color-coral-400)" />
          Curiosity Sections (What Sparks Conversations)
        </h3>

        {/* 1. Rabbit Hole */}
        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700, color: 'var(--color-violet-400)', marginBottom: '6px', textTransform: 'uppercase' }}>
            <Compass size={16} /> My Rabbit Hole — What are you currently obsessed with?
          </label>
          <textarea
            rows={2}
            value={rabbitHole}
            onChange={(e) => setRabbitHole(e.target.value)}
            placeholder="e.g. Cellular automata, Nigerian indie film grammar, quantum cryptography..."
            style={{ width: '100%', fontSize: '14px' }}
          />
        </div>

        {/* 2. Defend This Take */}
        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700, color: 'var(--color-coral-400)', marginBottom: '6px', textTransform: 'uppercase' }}>
            <Flame size={16} /> Defend This Take — An opinion you're willing to defend
          </label>
          <textarea
            rows={2}
            value={defendTake}
            onChange={(e) => setDefendTake(e.target.value)}
            placeholder="e.g. Streaming algorithms have flattened narrative bravery; video games are the supreme medium..."
            style={{ width: '100%', fontSize: '14px' }}
          />
        </div>

        {/* 3. Teach Me Something */}
        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700, color: 'var(--color-amber-500)', marginBottom: '6px', textTransform: 'uppercase' }}>
            <Lightbulb size={16} /> Teach Me Something — What could you teach someone for hours?
          </label>
          <textarea
            rows={2}
            value={teachMe}
            onChange={(e) => setTeachMe(e.target.value)}
            placeholder="e.g. How CRISPR gene editing works without media hype, how to brew single-origin coffee..."
            style={{ width: '100%', fontSize: '14px' }}
          />
        </div>

        {/* My World Tags */}
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: '8px' }}>
            My World Tags (Favourite books, authors, anime, games, code, artists)
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
            {myWorldTags.map((tag) => (
              <span
                key={tag}
                style={{
                  padding: '4px 10px',
                  backgroundColor: 'rgba(124, 58, 237, 0.2)',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '12px',
                  color: 'var(--color-lavender-100)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                {tag}
                <button type="button" onClick={() => handleRemoveTag(tag)} style={{ color: 'var(--color-text-muted)' }}>
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
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }}
              style={{ flex: 1, fontSize: '13px' }}
            />
            <button
              type="button"
              onClick={handleAddTag}
              style={{ padding: '8px 16px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-surface-border)', color: '#ffffff', fontSize: '13px' }}
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
            padding: '10px 24px',
            borderRadius: 'var(--radius-full)',
            background: 'linear-gradient(135deg, var(--color-violet-600), var(--color-coral-500))',
            color: '#ffffff',
            fontWeight: 700,
            fontSize: '14px',
          }}
        >
          {loading ? 'Saving...' : 'Save Curiosity Profile'}
        </button>
      </form>

      {/* Basic Identity & Settings */}
      <form onSubmit={handleSaveBasic} style={{
        padding: '24px',
        backgroundColor: 'var(--color-surface-card)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-surface-border)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#ffffff' }}>Basic Identity & City</h3>

        <div>
          <label style={{ display: 'block', fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
            Display Name
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            style={{ width: '100%' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
            City
          </label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            style={{ width: '100%' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
            Bio / About You
          </label>
          <textarea
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            style={{ width: '100%' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
            Dating Intentions
          </label>
          <input
            type="text"
            value={datingIntentions}
            onChange={(e) => setDatingIntentions(e.target.value)}
            placeholder="e.g. Deep conversations & long-term connection"
            style={{ width: '100%' }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            alignSelf: 'flex-end',
            padding: '10px 24px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--color-violet-600)',
            color: '#ffffff',
            fontWeight: 700,
            fontSize: '14px',
          }}
        >
          Update Identity
        </button>
      </form>

      {/* Account Safety & Deletion (GDPR / NDPA) */}
      <div style={{
        padding: '24px',
        backgroundColor: 'rgba(244, 63, 94, 0.05)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid rgba(244, 63, 94, 0.2)',
      }}>
        <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-coral-400)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <ShieldAlert size={18} />
          Account & Privacy Controls
        </h3>
        <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '14px', lineHeight: 1.5 }}>
          Under Nigerian Data Protection Act (NDPA) and global privacy standards, you can permanently erase your profile, photos, matches, and chat history.
        </p>

        {showDeleteConfirm ? (
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: 'var(--color-coral-300)', fontWeight: 600 }}>
              Are you completely sure? This action is irreversible.
            </span>
            <button
              onClick={onDeleteAccount}
              style={{
                padding: '6px 14px',
                backgroundColor: 'var(--color-coral-500)',
                color: '#ffffff',
                borderRadius: 'var(--radius-sm)',
                fontSize: '12px',
                fontWeight: 700,
              }}
            >
              Permanently Delete
            </button>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              style={{ padding: '6px 12px', color: 'var(--color-text-muted)', fontSize: '12px' }}
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-coral-500)',
              color: 'var(--color-coral-400)',
              fontSize: '13px',
              fontWeight: 600,
            }}
          >
            Request Account Deletion
          </button>
        )}
      </div>
    </div>
  );
};
