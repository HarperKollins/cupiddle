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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
      {/* Top Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: '9999px',
              backgroundColor: 'rgba(255, 31, 106, 0.12)',
              border: '1px solid rgba(255, 31, 106, 0.3)',
              color: '#FF1F6A',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            <Compass size={12} />
            Shared Desires & Obsessions
          </div>

          <button
            onClick={() => setShowCreateCommModal(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '9999px',
              backgroundColor: '#1E1116',
              border: '1px solid rgba(255, 31, 106, 0.3)',
              color: '#FF1F6A',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <FolderPlus size={14} /> New Hole
          </button>
        </div>

        <h1
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: '26px',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            color: '#FFFFFF',
            margin: '0 0 4px 0',
          }}
        >
          Rabbit Holes
        </h1>
        <p style={{ fontSize: '13px', color: '#9E8C93', margin: 0, lineHeight: 1.4 }}>
          Campus circles built around late-night curiosity, intellectual passions, and unfiltered questions.
        </p>
      </div>

      {/* Horizontal Community Selector Chips */}
      {communities.length > 0 && (
        <div
          style={{
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
            paddingBottom: '4px',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {communities.map((comm) => {
            const isSelected = comm.slug === selectedSlug;
            return (
              <button
                key={comm.id}
                onClick={() => setSelectedSlug(comm.slug)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  borderRadius: '14px',
                  whiteSpace: 'nowrap',
                  fontSize: '13px',
                  fontWeight: isSelected ? 700 : 500,
                  backgroundColor: isSelected ? 'rgba(255, 31, 106, 0.18)' : '#170E12',
                  border: isSelected ? '1.5px solid #FF1F6A' : '1px solid rgba(255, 255, 255, 0.08)',
                  color: isSelected ? '#FFFFFF' : '#B8A8AF',
                  cursor: 'pointer',
                  boxShadow: isSelected ? '0 2px 10px rgba(255, 31, 106, 0.25)' : 'none',
                  transition: 'all 0.2s ease',
                  flexShrink: 0,
                }}
              >
                <span>{comm.name}</span>
                {comm.is_member && (
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: '#FF1F6A',
                      boxShadow: '0 0 6px #FF1F6A',
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Selected Community Hero Banner */}
      {selectedCommunity ? (
        <div
          style={{
            padding: '20px',
            backgroundColor: '#170E12',
            borderRadius: '20px',
            border: '1px solid rgba(255, 31, 106, 0.22)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
          }}
        >
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '3px 10px',
                borderRadius: '9999px',
                backgroundColor: 'rgba(255, 31, 106, 0.12)',
                color: '#FF1F6A',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.03em',
                marginBottom: '8px',
              }}
            >
              <Users size={12} />
              {selectedCommunity.member_count} Curious Minds
            </div>

            <h2
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: '22px',
                fontWeight: 800,
                color: '#FFFFFF',
                letterSpacing: '-0.02em',
                margin: '0 0 6px 0',
              }}
            >
              {selectedCommunity.name}
            </h2>
            <p
              style={{
                fontSize: '13px',
                color: '#C7B6BC',
                margin: 0,
                lineHeight: 1.45,
              }}
            >
              {selectedCommunity.description}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button
              onClick={() => handleToggleJoin(selectedCommunity)}
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: '14px',
                backgroundColor: selectedCommunity.is_member ? 'rgba(255, 31, 106, 0.15)' : '#1E1116',
                border: selectedCommunity.is_member ? '1px solid #FF1F6A' : '1px solid rgba(255, 255, 255, 0.12)',
                color: selectedCommunity.is_member ? '#FF1F6A' : '#E0D4D8',
                fontSize: '13px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {selectedCommunity.is_member ? (
                <>
                  <Check size={14} /> Joined Hole
                </>
              ) : (
                'Join Hole'
              )}
            </button>

            <button
              onClick={() => setShowCreatePostModal(true)}
              style={{
                flex: 1.2,
                padding: '10px 16px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #FF1F6A 0%, #B81347 100%)',
                border: 'none',
                color: '#FFFFFF',
                fontSize: '13px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                boxShadow: '0 4px 14px rgba(255, 31, 106, 0.3)',
                cursor: 'pointer',
              }}
            >
              <Plus size={15} /> Start Thread
            </button>
          </div>
        </div>
      ) : (
        <div
          style={{
            padding: '36px 20px',
            backgroundColor: '#170E12',
            borderRadius: '20px',
            border: '1px dashed rgba(255, 31, 106, 0.3)',
            textAlign: 'center',
          }}
        >
          <Compass size={36} style={{ margin: '0 auto 12px', color: '#FF1F6A' }} />
          <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '20px', fontWeight: 800, color: '#FFFFFF', marginBottom: '8px' }}>
            No Rabbit Holes Yet
          </h2>
          <p style={{ fontSize: '13px', color: '#9E8C93', maxWidth: '340px', margin: '0 auto 16px', lineHeight: 1.5 }}>
            Be the first to create a community around your passion, trade, or late-night obsession!
          </p>
          <button
            onClick={() => setShowCreateCommModal(true)}
            style={{
              padding: '12px 24px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #FF1F6A 0%, #B81347 100%)',
              border: 'none',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: '14px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(255, 31, 106, 0.35)',
            }}
          >
            <Plus size={16} /> Create Community Now
          </button>
        </div>
      )}

      {/* Posts Feed */}
      {selectedCommunity && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#8A7B82', fontSize: '14px' }}>
              Gathering conversations...
            </div>
          ) : posts.length === 0 ? (
            <div
              style={{
                padding: '36px 20px',
                textAlign: 'center',
                backgroundColor: '#170E12',
                borderRadius: '20px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                color: '#9E8C93',
              }}
            >
              <Compass size={30} style={{ margin: '0 auto 10px', color: '#FF1F6A' }} />
              <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '18px', fontWeight: 700, color: '#FFFFFF', marginBottom: '6px' }}>
                No discussions in this Hole yet
              </h3>
              <p style={{ fontSize: '13px', marginBottom: '16px' }}>
                Be the pioneer. Start the very first curiosity thread here.
              </p>
              <button
                onClick={() => setShowCreatePostModal(true)}
                style={{
                  padding: '10px 20px',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #FF1F6A 0%, #B81347 100%)',
                  border: 'none',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(255, 31, 106, 0.3)',
                }}
              >
                <Plus size={14} style={{ display: 'inline', verticalAlign: '-2px', marginRight: '4px' }} />
                Start First Discussion
              </button>
            </div>
          ) : (
            posts.map((post) => (
              <div
                key={post.id}
                style={{
                  backgroundColor: '#170E12',
                  borderRadius: '20px',
                  border: '1px solid rgba(255, 31, 106, 0.18)',
                  padding: '20px',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                {/* Header Author Row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '50%',
                        backgroundColor: '#2A141E',
                        border: '1px solid rgba(255, 31, 106, 0.4)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '13px',
                        color: '#FF1F6A',
                      }}
                    >
                      {(post.author?.display_name || 'M')[0].toUpperCase()}
                    </div>
                    <div>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#FFFFFF' }}>
                        {post.author?.display_name || 'Member'}, {post.author?.age}
                      </span>
                      <span style={{ fontSize: '11px', color: '#8A7B82', marginLeft: '6px' }}>
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
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        fontSize: '11px',
                        fontWeight: 700,
                        color: '#FF1F6A',
                        backgroundColor: 'rgba(255, 31, 106, 0.12)',
                        border: '1px solid rgba(255, 31, 106, 0.35)',
                        padding: '5px 12px',
                        borderRadius: '9999px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <CupiddleIcon size={12} color="#FF1F6A" />
                      Spark Author
                    </button>
                  )}
                </div>

                <h3
                  style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: '17px',
                    fontWeight: 700,
                    color: '#FFFFFF',
                    margin: 0,
                    lineHeight: 1.35,
                  }}
                >
                  {post.title}
                </h3>

                <p
                  style={{
                    fontSize: '13px',
                    color: '#D4C6CC',
                    lineHeight: 1.55,
                    margin: 0,
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
                    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                    paddingTop: '12px',
                  }}
                >
                  <button
                    onClick={() => handleToggleComments(post.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '12px',
                      fontWeight: 700,
                      color: '#E0D4D8',
                      backgroundColor: '#1E1116',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      padding: '5px 12px',
                      borderRadius: '9999px',
                      cursor: 'pointer',
                    }}
                  >
                    <MessageSquare size={13} color="#FF1F6A" />
                    <span>{post.comment_count} Curious Replies</span>
                  </button>

                  <span style={{ fontSize: '11px', color: '#8A7B82' }}>
                    {new Date(post.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                </div>

                {/* Expanded Comments Drawer */}
                {expandedCommentsPostId === post.id && (
                  <div
                    style={{
                      marginTop: '8px',
                      padding: '16px',
                      backgroundColor: '#140B10',
                      borderRadius: '16px',
                      border: '1px solid rgba(255, 31, 106, 0.2)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                    }}
                  >
                    <h4
                      style={{
                        fontSize: '13px',
                        fontWeight: 700,
                        color: '#FF1F6A',
                        margin: 0,
                      }}
                    >
                      Curious Responses
                    </h4>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {(commentsMap[post.id] || []).length === 0 ? (
                        <p style={{ fontSize: '12px', color: '#8A7B82', fontStyle: 'italic', margin: 0 }}>
                          No responses yet. Add your curious perspective below!
                        </p>
                      ) : (
                        (commentsMap[post.id] || []).map((comm) => (
                          <div
                            key={comm.id}
                            style={{
                              padding: '10px 14px',
                              backgroundColor: '#1E1116',
                              borderRadius: '12px',
                              border: '1px solid rgba(255, 255, 255, 0.06)',
                            }}
                          >
                            <span
                              style={{
                                fontSize: '11px',
                                fontWeight: 700,
                                color: '#FF1F6A',
                                display: 'block',
                                marginBottom: '2px',
                              }}
                            >
                              {comm.author?.display_name || 'Member'}:
                            </span>
                            <span style={{ fontSize: '13px', color: '#E0D4D8', lineHeight: 1.4 }}>
                              {comm.content}
                            </span>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Reply Input */}
                    <div style={{ display: 'flex', gap: '8px' }}>
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
                        onClick={() => handleAddComment(post.id)}
                        style={{
                          padding: '10px 16px',
                          borderRadius: '12px',
                          background: 'linear-gradient(135deg, #FF1F6A 0%, #B81347 100%)',
                          border: 'none',
                          color: '#FFFFFF',
                          fontSize: '13px',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          cursor: 'pointer',
                        }}
                      >
                        <Send size={13} /> Reply
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
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
            backgroundColor: 'rgba(13, 8, 10, 0.85)',
            backdropFilter: 'blur(10px)',
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
              backgroundColor: '#170E12',
              borderRadius: '24px',
              border: '1px solid rgba(255, 31, 106, 0.3)',
              padding: '28px',
              maxWidth: '440px',
              width: '100%',
              boxShadow: '0 20px 48px rgba(0, 0, 0, 0.6)',
              position: 'relative',
            }}
          >
            <button
              onClick={() => setShowCreateCommModal(false)}
              aria-label="Close"
              style={{
                position: 'absolute',
                top: '18px',
                right: '18px',
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                backgroundColor: '#1E1116',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#E0D4D8',
                cursor: 'pointer',
              }}
            >
              <X size={15} />
            </button>

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
                marginBottom: '10px',
              }}
            >
              <FolderPlus size={12} />
              New Rabbit Hole
            </div>

            <h2
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: '22px',
                fontWeight: 800,
                color: '#FFFFFF',
                marginBottom: '6px',
                letterSpacing: '-0.02em',
              }}
            >
              Create a Rabbit Hole
            </h2>
            <p style={{ fontSize: '13px', color: '#9E8C93', marginBottom: '20px' }}>
              Create a space for people on campus who share your fascination.
            </p>

            <form onSubmit={handleCreateCommunity} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#C7B6BC', marginBottom: '6px' }}>
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
                    padding: '12px 14px',
                    fontSize: '14px',
                    borderRadius: '14px',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    backgroundColor: '#1E1116',
                    color: '#FFFFFF',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#C7B6BC', marginBottom: '6px' }}>
                  Category
                </label>
                <select
                  value={newCommCategory}
                  onChange={(e) => setNewCommCategory(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    fontSize: '14px',
                    borderRadius: '14px',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    backgroundColor: '#1E1116',
                    color: '#FFFFFF',
                    fontWeight: 600,
                    outline: 'none',
                    boxSizing: 'border-box',
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
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#C7B6BC', marginBottom: '6px' }}>
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="What kind of ideas, discussions, or inquiries will live here?"
                  value={newCommDesc}
                  onChange={(e) => setNewCommDesc(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    fontSize: '13px',
                    borderRadius: '14px',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    backgroundColor: '#1E1116',
                    color: '#FFFFFF',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateCommModal(false)}
                  style={{
                    padding: '10px 16px',
                    color: '#8A7B82',
                    fontSize: '13px',
                    fontWeight: 600,
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '12px 22px',
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
            backgroundColor: 'rgba(13, 8, 10, 0.85)',
            backdropFilter: 'blur(10px)',
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
              backgroundColor: '#170E12',
              borderRadius: '24px',
              border: '1px solid rgba(255, 31, 106, 0.3)',
              padding: '28px',
              maxWidth: '460px',
              width: '100%',
              boxShadow: '0 20px 48px rgba(0, 0, 0, 0.6)',
              position: 'relative',
            }}
          >
            <button
              onClick={() => setShowCreatePostModal(false)}
              aria-label="Close"
              style={{
                position: 'absolute',
                top: '18px',
                right: '18px',
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                backgroundColor: '#1E1116',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#E0D4D8',
                cursor: 'pointer',
              }}
            >
              <X size={15} />
            </button>

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
                marginBottom: '10px',
              }}
            >
              <Compass size={12} />
              {selectedCommunity?.name}
            </div>

            <h2
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: '22px',
                fontWeight: 800,
                color: '#FFFFFF',
                marginBottom: '6px',
                letterSpacing: '-0.02em',
              }}
            >
              Start a Discussion
            </h2>
            <p style={{ fontSize: '13px', color: '#9E8C93', marginBottom: '20px' }}>
              Ask a provocative question, share an obsession, or spark a new perspective.
            </p>

            <form onSubmit={handleCreatePost} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#C7B6BC', marginBottom: '6px' }}>
                  Discussion Title or Question
                </label>
                <input
                  type="text"
                  placeholder="e.g. Why doesn't Nigerian architecture borrow from pre-colonial thermodynamics?"
                  value={newPostTitle}
                  onChange={(e) => setNewPostTitle(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    fontSize: '14px',
                    borderRadius: '14px',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    backgroundColor: '#1E1116',
                    color: '#FFFFFF',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#C7B6BC', marginBottom: '6px' }}>
                  Elaborate on your idea
                </label>
                <textarea
                  rows={4}
                  placeholder="Elaborate on your inquiry, provide context or share what made you think about this..."
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    fontSize: '13px',
                    borderRadius: '14px',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    backgroundColor: '#1E1116',
                    color: '#FFFFFF',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setShowCreatePostModal(false)}
                  style={{
                    padding: '10px 16px',
                    color: '#8A7B82',
                    fontSize: '13px',
                    fontWeight: 600,
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '12px 22px',
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
                  Publish Discussion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
