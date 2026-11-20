import React from 'react';

export interface VibeTagOption {
  id: string;
  emoji: string;
  label: string;
}

export const VIBE_TAGS: VibeTagOption[] = [
  { id: 'feeling_lonely', emoji: '🫠', label: 'Feeling lonely rn' },
  { id: 'study_buddy', emoji: '📚', label: 'Need a study buddy' },
  { id: 'late_night', emoji: '🌙', label: 'Late night, bored' },
  { id: 'meet_someone', emoji: '🔥', label: 'Ready to meet someone' },
  { id: 'just_talk', emoji: '💭', label: 'Just want to talk' },
  { id: 'vibes_only', emoji: '🎮', label: 'Vibes only, no pressure' },
  { id: 'campus_spark', emoji: '⚡', label: 'Looking for my spark' },
  { id: 'secret_mode', emoji: '😶‍🌫️', label: 'Secret mode — curious' },
];

interface MoodTagSelectorProps {
  selectedTag?: string;
  onSelectTag: (tagId: string) => void;
  compact?: boolean;
}

export const MoodTagSelector: React.FC<MoodTagSelectorProps> = ({
  selectedTag,
  onSelectTag,
  compact = false,
}) => {
  return (
    <div style={{ marginBottom: compact ? '8px' : '16px' }}>
      {!compact && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--color-bumble-ink, #202020)', letterSpacing: '0.01em' }}>
            Campus Vibe Check
          </span>
          <span style={{ fontSize: '11px', color: '#666', fontWeight: 600 }}>
            Updates your active mood
          </span>
        </div>
      )}

      <div
        style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '4px',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
        className="no-scrollbar"
      >
        {VIBE_TAGS.map((tag) => {
          const isSelected = selectedTag === tag.id;
          return (
            <button
              key={tag.id}
              type="button"
              onClick={() => onSelectTag(tag.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: compact ? '6px 12px' : '8px 14px',
                borderRadius: '1000px',
                fontSize: compact ? '12px' : '13px',
                fontWeight: 700,
                border: isSelected ? '1.5px solid #202020' : '1px solid #e0e0e0',
                backgroundColor: isSelected ? '#ffdb5b' : '#ffffff',
                color: '#202020',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                boxShadow: isSelected ? '0 2px 8px rgba(32, 32, 32, 0.15)' : 'none',
                transition: 'all 0.15s ease',
                flexShrink: 0,
              }}
            >
              <span>{tag.emoji}</span>
              <span>{tag.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
