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
      setError('Please write a thoughtful spark response.');
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
        return 'Responding to their photo';
      default:
        return 'Starting a curious spark';
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(32, 32, 32, 0.55)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
        overflowY: 'auto',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="animate-modal-spring"
        style={{
          backgroundColor: 'var(--color-paper-white, #ffffff)',
          color: 'var(--color-bumble-ink, #202020)',
          borderRadius: 'var(--radius-cards, 24px)',
          border: '1.5px solid var(--color-bumble-ink, #202020)',
          maxWidth: '520px',
          width: '100%',
          padding: '36px',
          boxShadow: '0 20px 48px rgba(32, 32, 32, 0.18)',
          position: 'relative',
          margin: 'auto',
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-mist, #f3f3f3)',
            border: '1px solid #e0e0e0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-bumble-ink, #202020)',
            cursor: 'pointer',
          }}
        >
          <X size={18} />
        </button>

        {/* Title & Badge */}
        <div style={{ marginBottom: '16px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 12px',
              borderRadius: 'var(--radius-badges, 1000px)',
              backgroundColor: 'var(--color-bumble-honey, #ffdb5b)',
              color: 'var(--color-bumble-ink, #202020)',
              fontSize: '12px',
              fontWeight: 800,
              marginBottom: '10px',
              border: '1px solid var(--color-bumble-ink, #202020)',
            }}
          >
            <Sparkles size={14} />
            {getTargetTitle()}
          </div>

          <h3
            style={{
              fontSize: '26px',
              fontWeight: 800,
              color: 'var(--color-bumble-ink, #202020)',
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
            }}
          >
            Send a Spark to {receiverName}
          </h3>
        </div>

        {/* Prompt Context Box */}
        <div
          style={{
            marginBottom: '20px',
            padding: '16px 18px',
            backgroundColor: 'var(--color-pollen, #fff386)',
            borderRadius: 'var(--radius-buttons, 16px)',
            border: '1.5px solid var(--color-bumble-ink, #202020)',
            fontSize: '15px',
            color: 'var(--color-bumble-ink, #202020)',
            lineHeight: 1.5,
            fontWeight: 600,
          }}
        >
          "{targetContent}"
        </div>

        {error && (
          <div
            style={{
              padding: '12px 16px',
              backgroundColor: '#fff1f2',
              border: '1.5px solid #f43f5e',
              borderRadius: 'var(--radius-buttons, 16px)',
              color: '#9f1239',
              fontSize: '13px',
              fontWeight: 600,
              marginBottom: '18px',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '13px',
                color: 'var(--color-bumble-ink, #202020)',
                marginBottom: '6px',
                fontWeight: 700,
                letterSpacing: '0.01em',
              }}
            >
              Your Thoughtful Opening
            </label>
            <textarea
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Introduce your perspective, ask a probing question, or share why this sparked your curiosity..."
              maxLength={350}
              style={{
                width: '100%',
                padding: '14px 16px',
                borderRadius: 'var(--radius-buttons, 16px)',
                border: '1.5px solid var(--color-bumble-ink, #202020)',
                backgroundColor: 'var(--color-paper-white, #ffffff)',
                color: 'var(--color-bumble-ink, #202020)',
                fontSize: '15px',
                lineHeight: 1.5,
                resize: 'none',
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
              <span style={{ fontSize: '12px', color: 'var(--color-graphite, #575656)' }}>
                Sparks connect directly to this exact idea.
              </span>
              <span style={{ fontSize: '12px', color: 'var(--color-graphite, #575656)', fontWeight: 600 }}>
                {comment.length} / 350
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
            <button
              type="button"
              onClick={onClose}
              className="pill-interactive"
              style={{
                padding: '12px 22px',
                borderRadius: 'var(--radius-buttons, 16px)',
                backgroundColor: 'var(--color-mist, #f3f3f3)',
                border: '1px solid #e0e0e0',
                color: 'var(--color-bumble-ink, #202020)',
                fontSize: '14px',
                fontWeight: 700,
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="btn-bumble-action"
              style={{
                padding: '12px 28px',
                borderRadius: 'var(--radius-buttons, 16px)',
                backgroundColor: 'var(--color-bumble-ink, #202020)',
                color: 'var(--color-paper-white, #ffffff)',
                fontSize: '15px',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                opacity: loading ? 0.7 : 1,
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: 'var(--shadow-sm, 0px 1px 8px rgba(32, 32, 32, 0.12))',
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
