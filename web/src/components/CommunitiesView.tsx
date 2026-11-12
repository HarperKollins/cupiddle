import React, { useState, useEffect } from 'react';
import { MessageSquare, Sparkles, Plus, Check } from 'lucide-react';
import { Community, CommunityPost, PostComment } from '../types';
import { api } from '../api';

interface CommunitiesViewProps {
  onSparkAuthor: (authorId: string, authorName: string, postTitle: string, snippet: string) => void;
}

export const CommunitiesView: React.FC<CommunitiesViewProps> = ({ onSparkAuthor }) => {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string>('ai-and-coding');
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [expandedCommentsPostId, setExpandedCommentsPostId] = useState<string | null>(null);
  const [commentsMap, setCommentsMap] = useState<Record<string, PostComment[]>>({});
  const [commentInput, setCommentInput] = useState('');

  useEffect(() => {
    api.getCommunities().then((res) => {
      setCommunities(res.communities);
      if (res.communities.length > 0 && !selectedSlug) {
        setSelectedSlug(res.communities[0].slug);
      }
    }).catch(console.error);
  }, []);

  useEffect(() => {
    if (!selectedSlug) return;
    setLoading(true);
    api.getCommunityPosts(selectedSlug).then((res) => {
      setPosts(res.posts);
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

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostTitle.trim() || !newPostContent.trim()) return;

    try {
      const created = await api.createPost(selectedSlug, newPostTitle.trim(), newPostContent.trim());
      setPosts([created, ...posts]);
      setNewPostTitle('');
      setNewPostContent('');
      setShowCreateModal(false);
    } catch (err) {
      console.error('Failed to create post', err);
    }
  };

  const handleToggleComments = async (postId: string) => {
    if (expandedCommentsPostId === postId) {
      setExpandedCommentsPostId(null);
      return;
    }
    setExpandedCommentsPostId(postId);
    if (!commentsMap[postId]) {
      const res = await api.getPostComments(postId);
      setCommentsMap((prev) => ({ ...prev, [postId]: res.comments }));
    }
  };

  const handleAddComment = async (postId: string) => {
    if (!commentInput.trim()) return;
    try {
      const c = await api.addComment(postId, commentInput.trim());
      setCommentsMap((prev) => ({
        ...prev,
        [postId]: [...(prev[postId] || []), c],
      }));
      setCommentInput('');
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, comment_count: p.comment_count + 1 } : p))
      );
    } catch (err) {
      console.error('Failed to comment', err);
    }
  };

  const selectedCommunity = communities.find((c) => c.slug === selectedSlug);

  return (
    <div style={{ maxWidth: '1040px', margin: '0 auto', display: 'grid', gridTemplateColumns: '280px 1fr', gap: '24px' }}>
      {/* Left: Communities List */}
      <div>
        <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#ffffff', marginBottom: '16px' }}>
          Rabbit Holes
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {communities.map((comm) => {
            const isSelected = comm.slug === selectedSlug;
            return (
              <div
                key={comm.id}
                onClick={() => setSelectedSlug(comm.slug)}
                style={{
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: isSelected ? 'var(--color-violet-800)' : 'var(--color-surface-card)',
                  border: '1px solid var(--color-surface-border)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'background-color 0.2s',
                }}
              >
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff' }}>{comm.name}</h4>
                  <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                    {comm.member_count} members • {comm.post_count} posts
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right: Posts Feed */}
      <div>
        {selectedCommunity && (
          <div style={{
            padding: '24px',
            backgroundColor: 'var(--color-surface-card)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-surface-border)',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div>
              <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#ffffff' }}>
                {selectedCommunity.name}
              </h2>
              <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                {selectedCommunity.description}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => handleToggleJoin(selectedCommunity)}
                style={{
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: selectedCommunity.is_member ? 'rgba(76, 29, 149, 0.4)' : 'var(--color-violet-600)',
                  color: '#ffffff',
                  fontSize: '13px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                {selectedCommunity.is_member ? <><Check size={14} /> Joined</> : 'Join Community'}
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                style={{
                  padding: '8px 16px',
                  borderRadius: 'var(--radius-full)',
                  background: 'linear-gradient(135deg, var(--color-violet-600), var(--color-coral-500))',
                  color: '#ffffff',
                  fontSize: '13px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Plus size={16} /> New Post
              </button>
            </div>
          </div>
        )}

        {/* Create Post Modal */}
        {showCreateModal && (
          <div style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(10, 5, 18, 0.8)',
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
              padding: '24px',
              maxWidth: '520px',
              width: '100%',
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#ffffff', marginBottom: '16px' }}>
                Start a Discussion in {selectedCommunity?.name}
              </h3>
              <form onSubmit={handleCreatePost} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <input
                  type="text"
                  placeholder="Post title or provocative question..."
                  value={newPostTitle}
                  onChange={(e) => setNewPostTitle(e.target.value)}
                  required
                />
                <textarea
                  rows={5}
                  placeholder="Elaborate on your idea, analysis, or curious inquiry..."
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  required
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    style={{ padding: '8px 16px', color: 'var(--color-text-muted)' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      padding: '8px 20px',
                      borderRadius: 'var(--radius-full)',
                      background: 'linear-gradient(135deg, var(--color-violet-600), var(--color-coral-500))',
                      color: '#ffffff',
                      fontWeight: 700,
                    }}
                  >
                    Publish
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Posts List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-muted)' }}>
              Loading posts...
            </div>
          ) : posts.length === 0 ? (
            <div style={{
              padding: '40px',
              textAlign: 'center',
              backgroundColor: 'var(--color-surface-card)',
              borderRadius: 'var(--radius-lg)',
              color: 'var(--color-text-muted)',
            }}>
              No posts in this community yet. Be the first to start a conversation!
            </div>
          ) : (
            posts.map((post) => (
              <div
                key={post.id}
                style={{
                  backgroundColor: 'var(--color-surface-card)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--color-surface-border)',
                  padding: '20px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-violet-400)' }}>
                    {post.author?.display_name || 'Member'}, {post.author?.age} • {post.author?.city || 'Nigeria'}
                  </span>
                  {/* Community Spark Action (Part 12.2) */}
                  {post.user_id && (
                    <button
                      onClick={() => onSparkAuthor(
                        post.user_id,
                        post.author?.display_name || 'Author',
                        post.title,
                        post.content.slice(0, 100)
                      )}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '12px',
                        fontWeight: 700,
                        color: 'var(--color-coral-400)',
                        backgroundColor: 'rgba(244, 63, 94, 0.12)',
                        padding: '4px 10px',
                        borderRadius: 'var(--radius-full)',
                      }}
                    >
                      <Sparkles size={13} /> Spark Author
                    </button>
                  )}
                </div>

                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#ffffff', marginBottom: '8px' }}>
                  {post.title}
                </h3>
                <p style={{ fontSize: '14px', color: 'var(--color-text-primary)', lineHeight: 1.6, marginBottom: '14px' }}>
                  {post.content}
                </p>

                {/* Footer with comment toggle */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', borderTop: '1px solid var(--color-surface-border)', paddingTop: '12px' }}>
                  <button
                    onClick={() => handleToggleComments(post.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '13px',
                      color: 'var(--color-text-secondary)',
                    }}
                  >
                    <MessageSquare size={15} />
                    <span>{post.comment_count} Comments</span>
                  </button>
                </div>

                {/* Expanded Comments */}
                {expandedCommentsPostId === post.id && (
                  <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--color-surface-border)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '14px' }}>
                      {(commentsMap[post.id] || []).map((comm) => (
                        <div key={comm.id} style={{ padding: '8px 12px', backgroundColor: 'var(--color-surface-bg)', borderRadius: 'var(--radius-sm)' }}>
                          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-lavender-200)', display: 'block' }}>
                            {comm.author?.display_name || 'Member'}:
                          </span>
                          <span style={{ fontSize: '13px', color: '#ffffff' }}>{comm.content}</span>
                        </div>
                      ))}
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="text"
                        placeholder="Add a curious reply..."
                        value={commentInput}
                        onChange={(e) => setCommentInput(e.target.value)}
                        style={{ flex: 1, fontSize: '13px' }}
                      />
                      <button
                        onClick={() => handleAddComment(post.id)}
                        style={{
                          padding: '6px 14px',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: 'var(--color-violet-600)',
                          color: '#ffffff',
                          fontSize: '13px',
                          fontWeight: 600,
                        }}
                      >
                        Reply
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
