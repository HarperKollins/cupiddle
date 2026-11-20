import React, { useState } from 'react';
import { X, Send, Lock } from 'lucide-react';
import { CupiddleIcon } from './CupiddleLogo';

interface SparkModalProps {
  isOpen: boolean;
  onClose: () => void;
  receiverId: string;
  receiverName: string;
  receiverHandle?: string;
  gateQuestion?: string;
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
  receiverHandle,
  gateQuestion,
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
        backgroundColor: 'rgba(13, 8, 10, 0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '16px',
        overflowY: 'auto',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="animate-modal-spring"
        style={{
          backgroundColor: '#170E12',
          color: '#FFFFFF',
          borderRadius: '24px',
          border: '1px solid rgba(255, 31, 106, 0.3)',
          maxWidth: '480px',
          width: '100%',
          padding: '28px 24px',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.85)',
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
            top: '18px',
            right: '18px',
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#E0D4D8',
            cursor: 'pointer',
          }}
        >
          <X size={16} />
        </button>

        {/* Title & Badge */}
        <div style={{ marginBottom: '16px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 12px',
              borderRadius: '1000px',
              backgroundColor: '#5E081E',
              color: '#FF1F6A',
              fontSize: '11px',
              fontWeight: 800,
              marginBottom: '10px',
              border: '1px solid #FF1F6A',
              boxShadow: '0 0 12px rgba(255, 31, 106, 0.3)',
            }}
          >
            <CupiddleIcon size={12} color="#FF1F6A" />
            {getTargetTitle()}
          </div>

          <h3
            style={{
              fontSize: '24px',
              fontWeight: 800,
              color: '#FFFFFF',
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
              fontFamily: "'Playfair Display', serif",
              fontStyle: 'italic',
              margin: 0,
            }}
          >
            Send a Spark to {receiverName}
          </h3>
          {receiverHandle && (
            <span style={{ fontSize: '13px', color: '#FF1F6A', fontWeight: 700 }}>
              @{receiverHandle}
            </span>
          )}
        </div>

        {/* Prompt Context Box */}
        <div
          style={{
            marginBottom: '16px',
            padding: '14px 16px',
            backgroundColor: '#221219',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            fontSize: '14px',
            color: '#E0D4D8',
            lineHeight: 1.5,
            fontWeight: 600,
          }}
        >
          &quot;{targetContent}&quot;
        </div>

        {gateQuestion && (
          <div
            style={{
              marginBottom: '16px',
              padding: '14px 16px',
              backgroundColor: '#2D0A14',
              borderRadius: '16px',
              border: '1.5px dashed rgba(255, 31, 106, 0.5)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 800, color: '#FF1F6A', marginBottom: '4px' }}>
              <Lock size={12} />
              <span>REQUIRED: Answer {receiverHandle ? `@${receiverHandle}'s` : receiverName + "'s"} Gate Question:</span>
            </div>
            <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#FFFFFF', lineHeight: 1.4 }}>
              &quot;{gateQuestion}&quot;
            </p>
          </div>
        )}

        {error && (
          <div
            style={{
              padding: '10px 14px',
              backgroundColor: 'rgba(225, 29, 72, 0.15)',
              border: '1px solid #e11d48',
              borderRadius: '14px',
              color: '#f43f5e',
              fontSize: '13px',
              fontWeight: 600,
              marginBottom: '16px',
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
                fontSize: '12px',
                color: '#E0D4D8',
                marginBottom: '6px',
                fontWeight: 700,
                letterSpacing: '0.01em',
              }}
            >
              {gateQuestion ? 'Your Answer & Opening Spark' : 'Your Thoughtful Opening'}
            </label>
            <textarea
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={
                gateQuestion
                  ? 'Answer their gate question and write your spark message here...'
                  : 'Share your perspective or ask a probing question...'
              }
              maxLength={350}
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '16px',
                border: '1.5px solid rgba(255, 31, 106, 0.25)',
                backgroundColor: '#1E1116',
                color: '#FFFFFF',
                fontSize: '14px',
                lineHeight: 1.5,
                resize: 'none',
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
              <span style={{ fontSize: '11px', color: '#9E8C93' }}>
                Sparks connect directly to this exact idea.
              </span>
              <span style={{ fontSize: '11px', color: '#9E8C93', fontWeight: 600 }}>
                {comment.length} / 350
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
            <button
              type="button"
              onClick={onClose}
              className="pill-interactive"
              style={{
                padding: '11px 20px',
                borderRadius: '14px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#E0D4D8',
                fontSize: '13px',
                fontWeight: 700,
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="btn-desire-action"
              style={{
                padding: '11px 24px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #FF1F6A 0%, #C80A32 100%)',
                color: '#FFFFFF',
                fontSize: '14px',
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                opacity: loading ? 0.7 : 1,
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 18px rgba(255, 31, 106, 0.45)',
              }}
            >
              <Send size={14} />
              {loading ? 'Sending...' : 'Send Spark'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
