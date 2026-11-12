import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { IdeaStreamCard } from './components/IdeaStreamCard';
import { SparkModal } from './components/SparkModal';
import { SparksInbox } from './components/SparksInbox';
import { ChatRoom } from './components/ChatRoom';
import { CommunitiesView } from './components/CommunitiesView';
import { ProfileEditor } from './components/ProfileEditor';
import { AuthModal } from './components/AuthModal';
import { User, Profile, DiscoveryCandidate, Spark, Conversation } from './types';
import { api } from './api';
import { Sparkles, Compass, ArrowRight } from 'lucide-react';
import './styles/design-tokens.css';

export const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [myProfile, setMyProfile] = useState<Profile | null>(null);
  const [activeTab, setActiveTab] = useState<'stream' | 'sparks' | 'chat' | 'communities' | 'profile'>('stream');
  
  // Data state
  const [candidates, setCandidates] = useState<DiscoveryCandidate[]>([]);
  const [candidateIndex, setCandidateIndex] = useState(0);
  const [sparks, setSparks] = useState<Spark[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Modals
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [sparkModalData, setSparkModalData] = useState<{
    isOpen: boolean;
    receiverId: string;
    receiverName: string;
    targetType: string;
    targetContent: string;
  }>({
    isOpen: false,
    receiverId: '',
    receiverName: '',
    targetType: 'general',
    targetContent: '',
  });

  // Load User & Profile
  useEffect(() => {
    if (api.getToken()) {
      api.getMe().then((res) => {
        setCurrentUser(res.user);
        setMyProfile(res.profile);
        api.connectWebSocket();
      }).catch(() => {
        api.logout();
      });
    }
  }, []);

  // Load Feed, Sparks, Conversations when authenticated
  useEffect(() => {
    if (!currentUser) return;

    loadDiscoveryFeed();
    loadSparks();
    loadConversations();

    // Listen to real-time events
    const unsub = api.onWebSocketEvent((event) => {
      if (event.type === 'spark_received') {
        loadSparks();
      }
      if (event.type === 'match_created') {
        loadConversations();
      }
    });

    return unsub;
  }, [currentUser]);

  const loadDiscoveryFeed = async () => {
    try {
      setLoading(true);
      const res = await api.getDiscoveryFeed(10);
      setCandidates(res.candidates);
      setCandidateIndex(0);
    } catch (err) {
      console.error('Failed to load feed', err);
    } finally {
      setLoading(false);
    }
  };

  const loadSparks = async () => {
    try {
      const res = await api.getIncomingSparks();
      setSparks(res.sparks);
    } catch (err) {
      console.error('Failed to load sparks', err);
    }
  };

  const loadConversations = async () => {
    try {
      const res = await api.getConversations();
      setConversations(res.conversations);
      if (res.conversations.length > 0 && !selectedConvId) {
        setSelectedConvId(res.conversations[0].id);
      }
    } catch (err) {
      console.error('Failed to load conversations', err);
    }
  };

  const handleSparkCandidate = (targetType: string, targetContent: string) => {
    if (!currentUser) {
      setIsAuthOpen(true);
      return;
    }
    const current = candidates[candidateIndex];
    if (!current) return;

    setSparkModalData({
      isOpen: true,
      receiverId: current.profile.user_id,
      receiverName: current.profile.display_name,
      targetType,
      targetContent,
    });
  };

  const handlePassCandidate = async () => {
    const current = candidates[candidateIndex];
    if (current && currentUser) {
      api.passProfile(current.profile.user_id).catch(console.error);
    }
    if (candidateIndex < candidates.length - 1) {
      setCandidateIndex(candidateIndex + 1);
    } else {
      setCandidates([]);
    }
  };

  const handleAcceptSpark = async (sparkId: string) => {
    try {
      const res = await api.acceptSpark(sparkId);
      setSparks((prev) => prev.filter((s) => s.id !== sparkId));
      await loadConversations();
      setSelectedConvId(res.conversation_id);
      setActiveTab('chat');
    } catch (err) {
      console.error('Failed to accept spark', err);
    }
  };

  const handlePassSpark = async (sparkId: string) => {
    try {
      await api.passSpark(sparkId);
      setSparks((prev) => prev.filter((s) => s.id !== sparkId));
    } catch (err) {
      console.error('Failed to pass spark', err);
    }
  };

  const handleSparkAuthor = (authorId: string, authorName: string, postTitle: string, snippet: string) => {
    if (!currentUser) {
      setIsAuthOpen(true);
      return;
    }
    setSparkModalData({
      isOpen: true,
      receiverId: authorId,
      receiverName: authorName,
      targetType: 'community_post',
      targetContent: `${postTitle}: "${snippet}"`,
    });
  };

  const handleLogout = () => {
    api.logout();
    setCurrentUser(null);
    setMyProfile(null);
    setActiveTab('stream');
  };

  const handleDeleteAccount = async () => {
    try {
      await fetch('/api/auth/account', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${api.getToken()}` },
      });
      handleLogout();
    } catch (err) {
      console.error('Delete account failed', err);
    }
  };

  const currentCandidate = candidates[candidateIndex];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-surface-bg)' }}>
      {/* Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        myProfile={myProfile}
        unreadSparksCount={sparks.length}
        unreadChatCount={conversations.reduce((sum, c) => sum + (c.unread_count || 0), 0)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Container */}
      <main style={{ padding: '28px 20px', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Unauthenticated Landing Hero */}
        {!currentUser && (
          <div style={{ textAlign: 'center', padding: '40px 16px 60px', maxWidth: '780px', margin: '0 auto' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 16px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'rgba(124, 58, 237, 0.15)',
              border: '1px solid rgba(124, 58, 237, 0.3)',
              color: 'var(--color-lavender-100)',
              fontSize: '13px',
              fontWeight: 700,
              marginBottom: '20px',
            }}>
              <Sparkles size={16} color="var(--color-coral-400)" />
              100% Free Curiosity-First Dating & Social Discovery
            </span>

            <h1 style={{
              fontSize: '48px',
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: '-0.03em',
              color: '#ffffff',
              marginBottom: '20px',
            }}>
              Curiosity is attractive.
            </h1>

            <p style={{
              fontSize: '18px',
              color: 'var(--color-text-secondary)',
              lineHeight: 1.6,
              marginBottom: '32px',
            }}>
              Tired of superficial swipes and repetitive introductions? Cupiddle introduces you to people through their obsessions, opinions they're ready to defend, and ideas worth exploring.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <button
                onClick={() => setIsAuthOpen(true)}
                style={{
                  padding: '14px 36px',
                  borderRadius: 'var(--radius-full)',
                  background: 'linear-gradient(135deg, var(--color-violet-600), var(--color-coral-500))',
                  color: '#ffffff',
                  fontSize: '16px',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: 'var(--shadow-coral-glow)',
                }}
              >
                Join Cupiddle Free <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Tab 1: The Idea Stream */}
        {activeTab === 'stream' && (
          <div>
            {currentCandidate ? (
              <IdeaStreamCard
                candidate={currentCandidate}
                onSpark={handleSparkCandidate}
                onPass={handlePassCandidate}
              />
            ) : (
              <div style={{
                maxWidth: '540px',
                margin: '40px auto',
                padding: '40px 24px',
                textAlign: 'center',
                backgroundColor: 'var(--color-surface-card)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-surface-border)',
              }}>
                <Compass size={36} color="var(--color-violet-400)" style={{ margin: '0 auto 16px' }} />
                <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#ffffff', marginBottom: '8px' }}>
                  {currentUser ? "You've Explored All Current Recommendations" : "Curiosity Feed Preview"}
                </h3>
                <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: '20px' }}>
                  {currentUser
                    ? "You can reset your discovery feed to rediscover passed profiles or widen your distance preference."
                    : "Create a free account to unlock your personalized Idea Stream, send contextual Sparks, and connect."}
                </p>
                {currentUser ? (
                  <button
                    onClick={async () => {
                      await api.resetPasses();
                      await loadDiscoveryFeed();
                    }}
                    style={{
                      padding: '10px 24px',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: 'var(--color-violet-600)',
                      color: '#ffffff',
                      fontWeight: 700,
                    }}
                  >
                    Reset Discovery Feed
                  </button>
                ) : (
                  <button
                    onClick={() => setIsAuthOpen(true)}
                    style={{
                      padding: '12px 28px',
                      borderRadius: 'var(--radius-full)',
                      background: 'linear-gradient(135deg, var(--color-violet-600), var(--color-coral-500))',
                      color: '#ffffff',
                      fontWeight: 700,
                    }}
                  >
                    Get Started Free
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Sparks Inbox */}
        {activeTab === 'sparks' && (
          <SparksInbox
            sparks={sparks}
            loading={loading}
            onAccept={handleAcceptSpark}
            onPass={handlePassSpark}
            onOpenProfile={() => {}}
          />
        )}

        {/* Tab 3: Conversations & Chat */}
        {activeTab === 'chat' && currentUser && (
          <ChatRoom
            conversations={conversations}
            selectedConvId={selectedConvId}
            onSelectConv={setSelectedConvId}
            currentUserId={currentUser.id}
          />
        )}

        {/* Tab 4: Rabbit Holes Communities */}
        {activeTab === 'communities' && (
          <CommunitiesView onSparkAuthor={handleSparkAuthor} />
        )}

        {/* Tab 5: My Curiosity Profile */}
        {activeTab === 'profile' && myProfile && (
          <ProfileEditor
            profile={myProfile}
            onUpdate={setMyProfile}
            onDeleteAccount={handleDeleteAccount}
          />
        )}
      </main>

      {/* Contextual Spark Modal */}
      <SparkModal
        isOpen={sparkModalData.isOpen}
        onClose={() => setSparkModalData((prev) => ({ ...prev, isOpen: false }))}
        receiverId={sparkModalData.receiverId}
        receiverName={sparkModalData.receiverName}
        targetType={sparkModalData.targetType}
        targetContent={sparkModalData.targetContent}
        onSuccess={() => {
          if (activeTab === 'stream') {
            handlePassCandidate();
          }
        }}
        sendSparkFn={api.sendSpark.bind(api)}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={async () => {
          const me = await api.getMe();
          setCurrentUser(me.user);
          setMyProfile(me.profile);
          api.connectWebSocket();
        }}
      />
    </div>
  );
};
