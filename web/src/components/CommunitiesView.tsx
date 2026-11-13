import React, { useState, useEffect } from 'react';
import { MessageSquare, Plus, Check, Compass, Users, X, Send, FolderPlus } from 'lucide-react';
import { CupiddleIcon } from './CupiddleLogo';
import { Community, CommunityPost, PostComment } from '../types';
import { api } from '../api';

interface CommunitiesViewProps {
  onSparkAuthor: (authorId: string, authorName: string, postTitle: string, snippet: string) => void;
}

export const CommunitiesView: React.FC<CommunitiesViewProps> = ({ onSparkAuthor }) => {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string>('');
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [showCreateCommModal, setShowCreateCommModal] = useState(false);
  const [newCommName, setNewCommName] = useState('');
  const [newCommDesc, setNewCommDesc] = useState('');
  const [newCommCategory, setNewCommCategory] = useState('Curiosity');
  const [expandedCommentsPostId, setExpandedCommentsPostId] = useState<string | null>(null);
  const [commentsMap, setCommentsMap] = useState<Record<string, PostComment[]>>({});
  const [commentInput, setCommentInput] = useState('');

  useEffect(() => {
    api.getCommunities().then((res) => {
      const comms = res?.communities || [];
      setCommunities(comms);
      if (comms.length > 0 && !selectedSlug) {
        setSelectedSlug(comms[0].slug);
      }
    }).catch(console.error);
  }, []);

  useEffect(() => {
    if (!selectedSlug) {
      setPosts([]);
      return;
    }
    setLoading(true);
    api.getCommunityPosts(selectedSlug).then((res) => {
      setPosts(res?.posts || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, [selectedSlug]);

  const handleToggleJoin = async (community: Community) => {
    try {
      if (community.is_member) {
        await api.leaveCommunity(community.slug);
      } else {
        await api.joinCommunity(community.slug);
      }
      setCommunities((prev) =>
        prev.map((c) =>
          c.slug === community.slug
            ? { ...c, is_member: !c.is_member, member_count: c.is_member ? c.member_count - 1 : c.member_count + 1 }
            : c
        )
      );
    } catch (err) {
      console.error('Join/Leave error', err);
    }
  };

  const handleCreateCommunity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommName.trim()) return;
    try {
      const created = await api.createCommunity({
        name: newCommName.trim(),
        description: newCommDesc.trim(),
        category: newCommCategory.trim() || 'Curiosity',
      });
      setCommunities([created, ...communities]);
      setSelectedSlug(created.slug);
      setNewCommName('');
      setNewCommDesc('');
      setShowCreateCommModal(false);
    } catch (err) {
      console.error('Create community error', err);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostTitle.trim() || !newPostContent.trim() || !selectedSlug) return;
    try {
      const newPost = await api.createPost(selectedSlug, newPostTitle.trim(), newPostContent.trim());
      setPosts([newPost, ...posts]);
      setNewPostTitle('');
      setNewPostContent('');
      setShowCreatePostModal(false);
    } catch (err) {
      console.error('Create post error', err);
    }
  };

  const handleToggleComments = async (postId: string) => {
    if (expandedCommentsPostId === postId) {
      setExpandedCommentsPostId(null);
      return;
    }
    setExpandedCommentsPostId(postId);
    if (!commentsMap[postId]) {
      try {
        const res = await api.getPostComments(postId);
        setCommentsMap((prev) => ({ ...prev, [postId]: res?.comments || [] }));
      } catch (err) {
        console.error('Load comments error', err);
      }
    }
  };

  const handleAddComment = async (postId: string) => {
    if (!commentInput.trim()) return;
    try {
      const newComment = await api.addComment(postId, commentInput.trim());
      setCommentsMap((prev) => ({
        ...prev,
        [postId]: [...(prev[postId] || []), newComment],
      }));
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, comment_count: p.comment_count + 1 } : p))
      );
      setCommentInput('');
    } catch (err) {
      console.error('Add comment error', err);
    }
  };

  const selectedCommunity = communities.find((c) => c.slug === selectedSlug);

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: '300px 1fr', gap: '32px' }}>
      {/* Left: Rabbit Holes Community List */}
      <div>
        <div style={{ marginBottom: '16px' }}>
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
              marginBottom: '8px',
            }}
          >
            <Compass size={13} />
            Shared Obsessions
          </div>
          <h2
            style={{
              fontSize: '24px',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              color: 'var(--color-bumble-ink, #202020)',
            }}
          >
            Rabbit Holes
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--color-graphite, #575656)', marginTop: '4px' }}>
            Communities built around curiosity, craft, and ideas.
          </p>
        </div>

        {/* Create Community Trigger Button */}
        <button
          onClick={() => setShowCreateCommModal(true)}
          className="btn-bumble-action"
          style={{
            width: '100%',
            padding: '12px 18px',
            borderRadius: 'var(--radius-buttons, 16px)',
            backgroundColor: 'var(--color-bumble-ink, #202020)',
            color: 'var(--color-paper-white, #ffffff)',
            fontSize: '13px',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            marginBottom: '14px',
            boxShadow: 'var(--shadow-sm, 0px 1px 8px rgba(32, 32, 32, 0.12))',
          }}
        >
          <FolderPlus size={16} /> Create Rabbit Hole
        </button>

        {communities.length === 0 ? (
          <div
            style={{
              padding: '24px 16px',
              borderRadius: 'var(--radius-buttons, 16px)',
              backgroundColor: 'var(--color-mist, #f3f3f3)',
              border: '1.5px dashed var(--color-graphite, #575656)',
              textAlign: 'center',
            }}
          >
            <Compass size={24} style={{ margin: '0 auto 8px', color: 'var(--color-bumble-ink, #202020)' }} />
            <h4 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--color-bumble-ink, #202020)', marginBottom: '4px' }}>
              No Rabbit Holes Yet
            </h4>
            <p style={{ fontSize: '12px', color: 'var(--color-graphite, #575656)', lineHeight: 1.4 }}>
              Be the first to create a community around your passion, trade, or obsession!
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {communities.map((comm) => {
              const isSelected = comm.slug === selectedSlug;
              return (
                <div
                  key={comm.id}
                  onClick={() => setSelectedSlug(comm.slug)}
                  className="editorial-card-lift"
                  style={{
                    padding: '16px 20px',
                    borderRadius: 'var(--radius-buttons, 16px)',
                    backgroundColor: isSelected ? 'var(--color-bumble-honey, #ffdb5b)' : 'var(--color-paper-white, #ffffff)',
                    border: '1.5px solid var(--color-bumble-ink, #202020)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: isSelected ? '0 4px 12px rgba(32, 32, 32, 0.15)' : 'none',
                    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                >
                  <div>
                    <h3
                      style={{
                        fontSize: '15px',
                        fontWeight: 800,
                        color: 'var(--color-bumble-ink, #202020)',
                        marginBottom: '2px',
                      }}
                    >
                      {comm.name}
                    </h3>
                    <span style={{ fontSize: '12px', color: 'var(--color-graphite, #575656)', fontWeight: 600 }}>
                      {comm.member_count} curious minds • {comm.post_count} threads
                    </span>
                  </div>
                  {comm.is_member && (
                    <span
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--color-bumble-ink, #202020)',
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Right: Selected Community Feed */}
      <div>
        {selectedCommunity ? (
          <div
            style={{
              padding: '28px 32px',
              backgroundColor: 'var(--color-pollen, #fff386)',
              borderRadius: 'var(--radius-cards, 24px)',
              border: '1.5px solid var(--color-bumble-ink, #202020)',
              boxShadow: 'var(--shadow-sm, 0px 1px 8px rgba(32, 32, 32, 0.12))',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '20px',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ maxWidth: '480px' }}>
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
                  fontSize: '11px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  marginBottom: '8px',
                }}
              >
                <Users size={12} />
                {selectedCommunity.member_count} Members Nationwide
              </div>
              <h1
                style={{
                  fontSize: '28px',
                  fontWeight: 800,
                  color: 'var(--color-bumble-ink, #202020)',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.15,
                }}
              >
                {selectedCommunity.name}
              </h1>
              <p
                style={{
                  fontSize: '15px',
                  color: 'var(--color-charcoal, #3b3b3b)',
                  marginTop: '6px',
                  lineHeight: 1.4,
                }}
              >
                {selectedCommunity.description}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button
                onClick={() => handleToggleJoin(selectedCommunity)}
                className="btn-bumble-action"
                style={{
                  padding: '10px 18px',
                  borderRadius: 'var(--radius-buttons, 16px)',
                  backgroundColor: selectedCommunity.is_member ? 'var(--color-paper-white, #ffffff)' : 'transparent',
                  border: '1.5px solid var(--color-bumble-ink, #202020)',
                  color: 'var(--color-bumble-ink, #202020)',
                  fontSize: '13px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                {selectedCommunity.is_member ? (
                  <>
                    <Check size={14} /> Joined Hole
                  </>
                ) : (
                  'Join Hole Free'
                )}
              </button>

              <button
                onClick={() => setShowCreatePostModal(true)}
                className="btn-bumble-action"
                style={{
                  padding: '10px 22px',
                  borderRadius: 'var(--radius-buttons, 16px)',
                  backgroundColor: 'var(--color-bumble-ink, #202020)',
                  color: 'var(--color-paper-white, #ffffff)',
                  fontSize: '13px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  letterSpacing: '0.01em',
                }}
              >
                <Plus size={16} /> Start Thread
              </button>
            </div>
          </div>
        ) : (
          <div
            style={{
              padding: '48px 32px',
              backgroundColor: 'var(--color-paper-white, #ffffff)',
              borderRadius: 'var(--radius-cards, 24px)',
              border: '1.5px solid var(--color-bumble-ink, #202020)',
              textAlign: 'center',
              boxShadow: 'var(--shadow-sm, 0px 1px 8px rgba(32, 32, 32, 0.12))',
              marginBottom: '24px',
            }}
          >
            <Compass size={40} style={{ margin: '0 auto 12px', color: 'var(--color-bumble-ink, #202020)' }} />
            <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-bumble-ink, #202020)', marginBottom: '8px' }}>
              Create Your First Rabbit Hole
            </h2>
            <p style={{ fontSize: '15px', color: 'var(--color-graphite, #575656)', maxWidth: '440px', margin: '0 auto 20px', lineHeight: 1.5 }}>
              Rabbit Holes are user-created hubs for curious minds. Start a community around any subject you find fascinating.
            </p>
            <button
              onClick={() => setShowCreateCommModal(true)}
              className="btn-bumble-action"
              style={{
                padding: '12px 28px',
                borderRadius: 'var(--radius-buttons, 16px)',
                backgroundColor: 'var(--color-bumble-ink, #202020)',
                color: 'var(--color-paper-white, #ffffff)',
                fontWeight: 800,
                fontSize: '14px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Plus size={16} /> Create Community Now
            </button>
          </div>
        )}

        {/* Create Community Modal */}
        {showCreateCommModal && (
          <div
            role="dialog"
            aria-modal="true"
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(32, 32, 32, 0.55)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: '20px',
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowCreateCommModal(false);
            }}
          >
            <div
              className="animate-modal-spring"
              style={{
                backgroundColor: 'var(--color-paper-white, #ffffff)',
                borderRadius: 'var(--radius-cards, 24px)',
                border: '1.5px solid var(--color-bumble-ink, #202020)',
                padding: '36px',
                maxWidth: '520px',
                width: '100%',
                boxShadow: '0 20px 48px rgba(32, 32, 32, 0.18)',
                position: 'relative',
              }}
            >
              <button
                onClick={() => setShowCreateCommModal(false)}
                aria-label="Close"
                style={{
                  position: 'absolute',
                  top: '20px',
                  right: '20px',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-mist, #f3f3f3)',
                  border: '1px solid #d4d4d4',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-bumble-ink, #202020)',
                }}
              >
                <X size={16} />
              </button>

              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 12px',
                  borderRadius: 'var(--radius-badges, 1000px)',
                  backgroundColor: 'var(--color-bumble-honey, #ffdb5b)',
                  color: 'var(--color-bumble-ink, #202020)',
                  fontSize: '11px',
                  fontWeight: 800,
                  marginBottom: '10px',
                }}
              >
                <FolderPlus size={12} />
                User-Created Community
              </div>

              <h2
                style={{
                  fontSize: '22px',
                  fontWeight: 800,
                  color: 'var(--color-bumble-ink, #202020)',
                  marginBottom: '6px',
                  letterSpacing: '-0.02em',
                }}
              >
                Create a Rabbit Hole
              </h2>
              <p style={{ fontSize: '14px', color: 'var(--color-graphite, #575656)', marginBottom: '20px' }}>
                Create a dedicated space for people who share your fascination.
              </p>

              <form onSubmit={handleCreateCommunity} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
                    Community Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Nigerian Indie Film, Quantum Computing, Afrobeats Theory..."
                    value={newCommName}
                    onChange={(e) => setNewCommName(e.target.value)}
                    required
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
                      display: 'block',
                      fontSize: '13px',
                      fontWeight: 700,
                      color: 'var(--color-bumble-ink, #202020)',
                      marginBottom: '6px',
                    }}
                  >
                    Category
                  </label>
                  <select
                    value={newCommCategory}
                    onChange={(e) => setNewCommCategory(e.target.value)}
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
                    <option value="Curiosity">General Curiosity</option>
                    <option value="Technology">Technology & Software</option>
                    <option value="Philosophy">Philosophy & Ideas</option>
                    <option value="Arts & Culture">Arts & Culture</option>
                    <option value="Literature">Books & Writing</option>
                    <option value="Science">Science & Research</option>
                    <option value="Gaming">Gaming & Interactive Media</option>
                    <option value="Entrepreneurship">Building & Startups</option>
                  </select>
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
                    Description
                  </label>
                  <textarea
                    rows={3}
                    placeholder="What kind of ideas, discussions, or inquiries will live in this Rabbit Hole?"
                    value={newCommDesc}
                    onChange={(e) => setNewCommDesc(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      fontSize: '14px',
                      borderRadius: 'var(--radius-buttons, 16px)',
                      border: '1.5px solid var(--color-bumble-ink, #202020)',
                      backgroundColor: 'var(--color-paper-white, #ffffff)',
                      color: 'var(--color-bumble-ink, #202020)',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setShowCreateCommModal(false)}
                    style={{
                      padding: '10px 18px',
                      color: 'var(--color-graphite, #575656)',
                      fontSize: '14px',
                      fontWeight: 600,
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-bumble-action"
                    style={{
                      padding: '12px 26px',
                      borderRadius: 'var(--radius-buttons, 16px)',
                      backgroundColor: 'var(--color-bumble-ink, #202020)',
                      color: 'var(--color-paper-white, #ffffff)',
                      fontWeight: 800,
                      fontSize: '14px',
                      letterSpacing: '0.01em',
                    }}
                  >
                    Create Rabbit Hole
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Create Post Modal */}
        {showCreatePostModal && (
          <div
            role="dialog"
            aria-modal="true"
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(32, 32, 32, 0.55)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: '20px',
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowCreatePostModal(false);
            }}
          >
            <div
              className="animate-modal-spring"
              style={{
                backgroundColor: 'var(--color-paper-white, #ffffff)',
                borderRadius: 'var(--radius-cards, 24px)',
                border: '1.5px solid var(--color-bumble-ink, #202020)',
                padding: '36px',
                maxWidth: '540px',
                width: '100%',
                boxShadow: '0 20px 48px rgba(32, 32, 32, 0.18)',
                position: 'relative',
              }}
            >
              <button
                onClick={() => setShowCreatePostModal(false)}
                aria-label="Close"
                style={{
                  position: 'absolute',
                  top: '20px',
                  right: '20px',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-mist, #f3f3f3)',
                  border: '1px solid #d4d4d4',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-bumble-ink, #202020)',
                }}
              >
                <X size={16} />
              </button>

              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 12px',
                  borderRadius: 'var(--radius-badges, 1000px)',
                  backgroundColor: 'var(--color-bumble-honey, #ffdb5b)',
                  color: 'var(--color-bumble-ink, #202020)',
                  fontSize: '11px',
                  fontWeight: 800,
                  marginBottom: '10px',
                }}
              >
                <Compass size={12} />
                {selectedCommunity?.name}
              </div>

              <h2
                style={{
                  fontSize: '22px',
                  fontWeight: 800,
                  color: 'var(--color-bumble-ink, #202020)',
                  marginBottom: '6px',
                  letterSpacing: '-0.02em',
                }}
              >
                Start a Discussion
              </h2>
              <p style={{ fontSize: '14px', color: 'var(--color-graphite, #575656)', marginBottom: '20px' }}>
                Ask a provocative question, share an obsession, or spark a new perspective.
              </p>

              <form onSubmit={handleCreatePost} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
                    Discussion Title or Provocative Question
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Why doesn't Nigerian architecture borrow from pre-colonial thermodynamics?"
                    value={newPostTitle}
                    onChange={(e) => setNewPostTitle(e.target.value)}
                    required
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
                      display: 'block',
                      fontSize: '13px',
                      fontWeight: 700,
                      color: 'var(--color-bumble-ink, #202020)',
                      marginBottom: '6px',
                    }}
                  >
                    Elaborate on your idea
                  </label>
                  <textarea
                    rows={5}
                    placeholder="Elaborate on your inquiry, provide context or share what made you think about this..."
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      fontSize: '14px',
                      borderRadius: 'var(--radius-buttons, 16px)',
                      border: '1.5px solid var(--color-bumble-ink, #202020)',
                      backgroundColor: 'var(--color-paper-white, #ffffff)',
                      color: 'var(--color-bumble-ink, #202020)',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setShowCreatePostModal(false)}
                    style={{
                      padding: '10px 18px',
                      color: 'var(--color-graphite, #575656)',
                      fontSize: '14px',
                      fontWeight: 600,
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-bumble-action"
                    style={{
                      padding: '12px 26px',
                      borderRadius: 'var(--radius-buttons, 16px)',
                      backgroundColor: 'var(--color-bumble-ink, #202020)',
                      color: 'var(--color-paper-white, #ffffff)',
                      fontWeight: 800,
                      fontSize: '14px',
                      letterSpacing: '0.01em',
                    }}
                  >
                    Publish Discussion
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Posts Feed */}
        {selectedCommunity && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--color-graphite, #575656)', fontSize: '15px' }}>
                Loading discussions...
              </div>
            ) : posts.length === 0 ? (
              <div
                style={{
                  padding: '48px 24px',
                  textAlign: 'center',
                  backgroundColor: 'var(--color-paper-white, #ffffff)',
                  borderRadius: 'var(--radius-cards, 24px)',
                  border: '1.5px solid var(--color-bumble-ink, #202020)',
                  color: 'var(--color-graphite, #575656)',
                }}
              >
                <Compass size={32} style={{ margin: '0 auto 12px', color: 'var(--color-bumble-ink, #202020)' }} />
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-bumble-ink, #202020)', marginBottom: '6px' }}>
                  No discussions in this Hole yet
                </h3>
                <p style={{ fontSize: '14px', marginBottom: '18px' }}>
                  Be the pioneer. Start the very first curiosity thread here.
                </p>
                <button
                  onClick={() => setShowCreatePostModal(true)}
                  className="btn-bumble-action"
                  style={{
                    padding: '10px 22px',
                    borderRadius: 'var(--radius-buttons, 16px)',
                    backgroundColor: 'var(--color-bumble-ink, #202020)',
                    color: 'var(--color-paper-white, #ffffff)',
                    fontSize: '13px',
                    fontWeight: 700,
                  }}
                >
                  <Plus size={15} style={{ display: 'inline', verticalAlign: '-2px', marginRight: '4px' }} />
                  Start First Discussion
                </button>
              </div>
            ) : (
              posts.map((post) => (
                <div
                  key={post.id}
                  className="editorial-card-lift"
                  style={{
                    backgroundColor: 'var(--color-paper-white, #ffffff)',
                    borderRadius: 'var(--radius-cards, 24px)',
                    border: '1.5px solid var(--color-bumble-ink, #202020)',
                    padding: '28px 32px',
                    boxShadow: 'var(--shadow-sm, 0px 1px 8px rgba(32, 32, 32, 0.12))',
                  }}
                >
                  {/* Header Author Row */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--color-bumble-honey, #ffdb5b)',
                          border: '1px solid var(--color-bumble-ink, #202020)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '13px',
                          color: 'var(--color-bumble-ink, #202020)',
                        }}
                      >
                        {(post.author?.display_name || 'M')[0].toUpperCase()}
                      </div>
                      <div>
                        <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--color-bumble-ink, #202020)' }}>
                          {post.author?.display_name || 'Member'}, {post.author?.age}
                        </span>
                        <span style={{ fontSize: '12px', color: 'var(--color-graphite, #575656)', marginLeft: '6px' }}>
                          • {post.author?.city || 'Nigeria'}
                        </span>
                      </div>
                    </div>

                    {post.user_id && (
                      <button
                        onClick={() =>
                          onSparkAuthor(
                            post.user_id,
                            post.author?.display_name || 'Author',
                            post.title,
                            post.content.slice(0, 100)
                          )
                        }
                        className="pill-interactive"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '12px',
                          fontWeight: 800,
                          color: 'var(--color-bumble-ink, #202020)',
                          backgroundColor: 'var(--color-pollen, #fff386)',
                          border: '1px solid var(--color-bumble-ink, #202020)',
                          padding: '6px 14px',
                          borderRadius: 'var(--radius-badges, 1000px)',
                        }}
                      >
                        <CupiddleIcon size={14} color="var(--color-bumble-ink, #202020)" />
                        Spark Author Free
                      </button>
                    )}
                  </div>

                  <h3
                    style={{
                      fontSize: '20px',
                      fontWeight: 800,
                      color: 'var(--color-bumble-ink, #202020)',
                      marginBottom: '10px',
                      lineHeight: 1.3,
                    }}
                  >
                    {post.title}
                  </h3>

                  <p
                    style={{
                      fontSize: '15px',
                      color: 'var(--color-charcoal, #3b3b3b)',
                      lineHeight: 1.6,
                      marginBottom: '18px',
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {post.content}
                  </p>

                  {/* Footer / Comments Toggle */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderTop: '1px solid #e5e5e5',
                      paddingTop: '14px',
                    }}
                  >
                    <button
                      onClick={() => handleToggleComments(post.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '13px',
                        fontWeight: 700,
                        color: 'var(--color-bumble-ink, #202020)',
                        backgroundColor: 'var(--color-mist, #f3f3f3)',
                        padding: '6px 14px',
                        borderRadius: 'var(--radius-badges, 1000px)',
                      }}
                    >
                      <MessageSquare size={14} />
                      <span>{post.comment_count} Curious Replies</span>
                    </button>

                    <span style={{ fontSize: '12px', color: 'var(--color-graphite, #575656)' }}>
                      {new Date(post.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>

                  {/* Expanded Comments Drawer */}
                  {expandedCommentsPostId === post.id && (
                    <div
                      style={{
                        marginTop: '20px',
                        padding: '20px',
                        backgroundColor: 'var(--color-mist, #f3f3f3)',
                        borderRadius: 'var(--radius-buttons, 16px)',
                        border: '1.5px solid var(--color-bumble-ink, #202020)',
                      }}
                    >
                      <h4
                        style={{
                          fontSize: '14px',
                          fontWeight: 800,
                          color: 'var(--color-bumble-ink, #202020)',
                          marginBottom: '14px',
                        }}
                      >
                        Curious Responses
                      </h4>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                        {(commentsMap[post.id] || []).length === 0 ? (
                          <p style={{ fontSize: '13px', color: 'var(--color-graphite, #575656)', fontStyle: 'italic' }}>
                            No responses yet. Add your curious perspective below!
                          </p>
                        ) : (
                          (commentsMap[post.id] || []).map((comm) => (
                            <div
                              key={comm.id}
                              style={{
                                padding: '12px 16px',
                                backgroundColor: 'var(--color-paper-white, #ffffff)',
                                borderRadius: 'var(--radius-buttons, 16px)',
                                border: '1px solid #d4d4d4',
                              }}
                            >
                              <span
                                style={{
                                  fontSize: '12px',
                                  fontWeight: 800,
                                  color: 'var(--color-bumble-ink, #202020)',
                                  display: 'block',
                                  marginBottom: '2px',
                                }}
                              >
                                {comm.author?.display_name || 'Member'}:
                              </span>
                              <span style={{ fontSize: '14px', color: 'var(--color-charcoal, #3b3b3b)', lineHeight: 1.4 }}>
                                {comm.content}
                              </span>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Reply Input */}
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <input
                          type="text"
                          placeholder="Add a curious perspective..."
                          value={commentInput}
                          onChange={(e) => setCommentInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddComment(post.id);
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
                          onClick={() => handleAddComment(post.id)}
                          className="btn-bumble-action"
                          style={{
                            padding: '10px 20px',
                            borderRadius: 'var(--radius-buttons, 16px)',
                            backgroundColor: 'var(--color-bumble-ink, #202020)',
                            color: 'var(--color-paper-white, #ffffff)',
                            fontSize: '13px',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                          }}
                        >
                          <Send size={14} /> Reply
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
