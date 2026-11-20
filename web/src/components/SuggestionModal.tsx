import React, { useState } from 'react';
import { X, Lightbulb, CheckCircle2, Send } from 'lucide-react';
import { api } from '../api';

interface SuggestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string;
}

const CATEGORIES = [
  'Feature Request',
  'Dating & Discovery Experience',
  'Rabbit Holes & Communities',
  'Mobile App Experience',
  'Bug or Issue',
  'General Thought',
];

export const SuggestionModal: React.FC<SuggestionModalProps> = ({ isOpen, onClose, userEmail }) => {
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [email, setEmail] = useState(userEmail || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError('Please provide a title and your suggestion details.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await api.submitSuggestion({
        category,
        title: title.trim(),
        content: content.trim(),
        email: email.trim() || undefined,
      });
      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Could not submit suggestion. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setTitle('');
    setContent('');
    setIsSuccess(false);
    onClose();
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
        zIndex: 10000,
        padding: '16px',
        overflowY: 'auto',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleReset();
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
        }}
      >
        {/* Close Button */}
        <button
          onClick={handleReset}
          aria-label="Close"
          style={{
            position: 'absolute',
            top: '18px',
            right: '18px',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            cursor: 'pointer',
          }}
        >
          <X size={16} />
        </button>

        {isSuccess ? (
          <div style={{ textAlign: 'center', padding: '24px 10px' }}>
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                backgroundColor: '#5E081E',
                border: '1px solid #FF1F6A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 18px',
                boxShadow: '0 0 16px rgba(255, 31, 106, 0.4)',
              }}
            >
              <CheckCircle2 size={32} color="#FF1F6A" />
            </div>
            <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#FFFFFF', marginBottom: '8px', fontFamily: "'Playfair Display', serif", fontStyle: 'italic' }}>
              Suggestion Received!
            </h3>
            <p style={{ fontSize: '14px', color: '#E0D4D8', lineHeight: 1.5, marginBottom: '24px' }}>
              Thank you for helping build Cupiddle. We read every single suggestion and use them directly to improve the campus experience.
            </p>
            <button
              onClick={handleReset}
              style={{
                padding: '12px 28px',
                borderRadius: '100px',
                backgroundColor: '#FF1F6A',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '14px',
                cursor: 'pointer',
                border: 'none',
                boxShadow: '0 0 16px rgba(255, 31, 106, 0.45)',
              }}
            >
              Done
            </button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div style={{ marginBottom: '18px' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 12px',
                  borderRadius: '1000px',
                  backgroundColor: '#5E081E',
                  color: '#FF1F6A',
                  fontSize: '11px',
                  fontWeight: 800,
                  border: '1px solid #FF1F6A',
                  marginBottom: '10px',
                  boxShadow: '0 0 10px rgba(255, 31, 106, 0.3)',
                }}
              >
                <Lightbulb size={13} color="#FF1F6A" />
                Community Wishlist
              </div>
              <h2
                style={{
                  fontSize: '22px',
                  fontWeight: 800,
                  color: '#FFFFFF',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.2,
                  fontFamily: "'Playfair Display', serif",
                  fontStyle: 'italic',
                  margin: 0,
                }}
              >
                Help Shape Cupiddle
              </h2>
              <p style={{ fontSize: '13px', color: '#E0D4D8', marginTop: '4px', margin: 0 }}>
                Have an idea, spotted a bug, or want a new campus feature? Tell us!
              </p>
            </div>

            {error && (
              <div
                style={{
                  padding: '10px 14px',
                  backgroundColor: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  borderRadius: '14px',
                  color: '#f87171',
                  fontSize: '13px',
                  fontWeight: 600,
                  marginBottom: '16px',
                }}
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Category Pills */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px', color: '#E0D4D8' }}>
                  Category
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {CATEGORIES.map((cat) => {
                    const isSelected = category === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCategory(cat)}
                        style={{
                          padding: '5px 12px',
                          borderRadius: '1000px',
                          fontSize: '11px',
                          fontWeight: 700,
                          backgroundColor: isSelected ? '#5E081E' : 'rgba(255, 255, 255, 0.06)',
                          color: isSelected ? '#FFFFFF' : '#E0D4D8',
                          border: isSelected ? '1px solid #FF1F6A' : '1px solid rgba(255, 255, 255, 0.12)',
                          boxShadow: isSelected ? '0 0 10px rgba(255, 31, 106, 0.35)' : 'none',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Title Input */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px', color: '#E0D4D8' }}>
                  Headline / Idea Summary
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Campus anonymous crush notes / Voice notes in chat"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    backgroundColor: '#0D080A',
                    color: '#FFFFFF',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                />
              </div>

              {/* Description Input */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px', color: '#E0D4D8' }}>
                  Details & What You'd Love to See
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Tell us what you'd love to see or what we can do better..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    backgroundColor: '#0D080A',
                    color: '#FFFFFF',
                    fontSize: '14px',
                    resize: 'vertical',
                    outline: 'none',
                  }}
                />
              </div>

              {/* Optional Email */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px', color: '#E0D4D8' }}>
                  Email Address <span style={{ fontWeight: 400, color: '#9E8C93' }}>(optional, for updates)</span>
                </label>
                <input
                  type="email"
                  placeholder="you@student.edu.ng"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    backgroundColor: '#0D080A',
                    color: '#FFFFFF',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  marginTop: '6px',
                  padding: '12px',
                  borderRadius: '100px',
                  backgroundColor: '#FF1F6A',
                  color: '#ffffff',
                  fontSize: '14px',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  border: 'none',
                  boxShadow: '0 0 16px rgba(255, 31, 106, 0.45)',
                  opacity: loading ? 0.7 : 1,
                }}
              >
                <Send size={15} />
                {loading ? 'Submitting...' : 'Send Wishlist Suggestion'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
