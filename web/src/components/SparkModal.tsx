import React, { useState } from 'react';
import { X, Sparkles, Send } from 'lucide-react';

interface SparkModalProps {
  isOpen: boolean;
  onClose: () => void;
  receiverId: string;
  receiverName: string;
  targetType: string;
  targetContent: string;
  onSuccess: () => void;
  sendSparkFn: (data: { receiver_id: string; target_type: string; target_content: string; comment: string }) => Promise<any>;
}

export const SparkModal: React.FC<SparkModalProps> = ({
  isOpen,
  onClose,
  receiverId,
  receiverName,
  targetType,
  targetContent,
  onSuccess,
  sendSparkFn,
}) => {
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (comment.trim().length < 2) {
      setError('Please write a thoughtful spark comment.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await sendSparkFn({
        receiver_id: receiverId,
        target_type: targetType,
        target_content: targetContent,
        comment: comment.trim(),
      });
      setComment('');
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to send Spark');
    } finally {
      setLoading(false);
    }
  };

  const getTargetTitle = () => {
    switch (targetType) {
      case 'defend_take':
        return 'Challenging their take';
      case 'rabbit_hole':
        return 'Diving into their Rabbit Hole';
      case 'teach_me':
        return 'Asking about what they can teach';
      case 'photo':
        return 'Commenting on their photo';
      default:
        return 'Starting a curious conversation';
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(10, 5, 18, 0.8)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '16px',
    }}>
      <div style={{
        backgroundColor: 'var(--color-surface-card)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-surface-border)',
        maxWidth: '520px',
        width: '100%',
        padding: '28px',
        boxShadow: 'var(--shadow-subtle)',
        position: 'relative',
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            color: 'var(--color-text-muted)',
          }}
        >
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <Sparkles size={20} color="var(--color-coral-400)" />
          <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#ffffff' }}>
            Send a Spark to {receiverName}
          </h3>
        </div>

        <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
          {getTargetTitle()}
        </span>

        {/* Prompt Context Box */}
        <div style={{
          marginTop: '12px',
          marginBottom: '20px',
          padding: '14px',
          backgroundColor: 'rgba(76, 29, 149, 0.25)',
          borderRadius: 'var(--radius-md)',
          borderLeft: '4px solid var(--color-coral-500)',
          fontSize: '14px',
          color: '#ffffff',
          lineHeight: 1.5,
          fontStyle: 'italic',
        }}>
          "{targetContent}"
        </div>

        {error && (
          <div style={{
            padding: '10px 14px',
            backgroundColor: 'rgba(244, 63, 94, 0.15)',
            border: '1px solid var(--color-coral-500)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--color-coral-300)',
            fontSize: '13px',
            marginBottom: '16px',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label style={{ display: 'block', fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '6px', fontWeight: 600 }}>
            Your thoughtful response
          </label>
          <textarea
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Introduce your perspective, ask a probing question, or share why this sparked your curiosity..."
            maxLength={350}
            style={{
              width: '100%',
              resize: 'none',
              fontSize: '14px',
              lineHeight: 1.5,
              marginBottom: '8px',
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
              Sparks reference the exact idea that brought you together.
            </span>
            <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
              {comment.length} / 350
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 18px',
                borderRadius: 'var(--radius-full)',
                color: 'var(--color-text-secondary)',
                fontSize: '14px',
                fontWeight: 600,
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '10px 24px',
                borderRadius: 'var(--radius-full)',
                background: 'linear-gradient(135deg, var(--color-violet-600), var(--color-coral-500))',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: 'var(--shadow-coral-glow)',
                opacity: loading ? 0.7 : 1,
              }}
            >
              <Send size={15} />
              {loading ? 'Sending...' : 'Send Spark'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

