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
        backgroundColor: 'rgba(32, 32, 32, 0.6)',
        backdropFilter: 'blur(8px)',
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
          backgroundColor: '#ffffff',
          color: '#202020',
          borderRadius: '24px',
          border: '2px solid #202020',
          maxWidth: '520px',
          width: '100%',
          padding: '32px 28px',
          boxShadow: '0 24px 60px rgba(32, 32, 32, 0.28)',
          position: 'relative',
        }}
      >
        {/* Close Button */}
        <button
          onClick={handleReset}
          aria-label="Close"
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: '#f3f3f3',
            border: '1.5px solid #202020',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#202020',
            cursor: 'pointer',
          }}
        >
          <X size={18} />
        </button>

        {isSuccess ? (
          <div style={{ textAlign: 'center', padding: '24px 10px' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: '#ffdb5b',
                border: '2px solid #202020',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 18px',
              }}
            >
              <CheckCircle2 size={36} color="#202020" />
            </div>
            <h3 style={{ fontSize: '24px', fontWeight: 800, color: '#202020', marginBottom: '8px' }}>
              Suggestion Received!
            </h3>
            <p style={{ fontSize: '15px', color: '#575656', lineHeight: 1.5, marginBottom: '24px' }}>
              Thank you for helping build Cupiddle. We read every single suggestion and use them directly to improve the app.
            </p>
            <button
              onClick={handleReset}
              className="btn-bumble-action"
              style={{
                padding: '14px 28px',
                borderRadius: '16px',
                backgroundColor: '#202020',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '15px',
                cursor: 'pointer',
              }}
            >
              Done
            </button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div style={{ marginBottom: '20px' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 12px',
                  borderRadius: '1000px',
                  backgroundColor: '#ffdb5b',
                  color: '#202020',
                  fontSize: '12px',
                  fontWeight: 800,
                  border: '1px solid #202020',
                  marginBottom: '10px',
                }}
              >
                <Lightbulb size={14} color="#202020" />
                Community Suggestion Box
              </div>
              <h2
                style={{
                  fontSize: '24px',
                  fontWeight: 800,
                  color: '#202020',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.2,
                }}
              >
                Help Shape Cupiddle
              </h2>
              <p style={{ fontSize: '14px', color: '#575656', marginTop: '6px' }}>
                Have an idea, spotted a bug, or want a new feature? Tell us what you think!
              </p>
            </div>

            {error && (
              <div
                style={{
                  padding: '10px 14px',
                  backgroundColor: '#fff1f2',
                  border: '1.5px solid #f43f5e',
                  borderRadius: '14px',
                  color: '#9f1239',
                  fontSize: '13px',
                  fontWeight: 600,
                  marginBottom: '16px',
                }}
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Category Pills */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '8px' }}>
                  Category
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {CATEGORIES.map((cat) => {
                    const isSelected = category === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCategory(cat)}
                        className="pill-interactive"
                        style={{
                          padding: '6px 14px',
                          borderRadius: '1000px',
                          fontSize: '12px',
                          fontWeight: 700,
                          backgroundColor: isSelected ? '#ffdb5b' : '#f3f3f3',
                          color: '#202020',
                          border: isSelected ? '1.5px solid #202020' : '1px solid #d4d4d4',
                          cursor: 'pointer',
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
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                  Headline / Idea Summary
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Add dark mode / Voice notes in chat"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '14px',
                    border: '1.5px solid #202020',
                    fontSize: '14px',
                  }}
                />
              </div>

              {/* Description Input */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                  Details & Your Experience
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Tell us what you'd love to see or what we can do better..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '14px',
                    border: '1.5px solid #202020',
                    fontSize: '14px',
                    resize: 'vertical',
                  }}
                />
              </div>

              {/* Optional Email */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                  Email Address <span style={{ fontWeight: 400, color: '#575656' }}>(optional, for updates)</span>
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '14px',
                    border: '1.5px solid #202020',
                    fontSize: '14px',
                  }}
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="btn-bumble-action"
                style={{
                  marginTop: '8px',
                  padding: '14px',
                  borderRadius: '16px',
                  backgroundColor: '#202020',
                  color: '#ffffff',
                  fontSize: '15px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                }}
              >
                <Send size={16} />
                {loading ? 'Submitting...' : 'Send Suggestion'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
