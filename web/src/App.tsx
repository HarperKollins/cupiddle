import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { IdeaStreamCard } from './components/IdeaStreamCard';
import { SparkModal } from './components/SparkModal';
import { SparksInbox } from './components/SparksInbox';
import { ChatRoom } from './components/ChatRoom';
import { CommunitiesView } from './components/CommunitiesView';
import { ProfileEditor } from './components/ProfileEditor';
import { AuthModal } from './components/AuthModal';
import { OnboardingModal } from './components/OnboardingModal';
import { SunlitLandingPage } from './components/SunlitLandingPage';
import { PwaInstallBanner } from './components/PwaInstallBanner';
import { SuggestionModal } from './components/SuggestionModal';
import { NotificationToast, ToastData } from './components/NotificationToast';
import { notifications } from './utils/notifications';
import { User, Profile, DiscoveryCandidate, Spark, Conversation } from './types';
import { api } from './api';
import { Compass, Heart, MessageCircle, Users, User as UserIcon } from 'lucide-react';
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
  const [toasts, setToasts] = useState<ToastData[]>([]);

  // Modals
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register');
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isSuggestionOpen, setIsSuggestionOpen] = useState(false);
  const [authInitialState, setAuthInitialState] = useState<string | undefined>(undefined);
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
        if (!res.profile?.rabbit_hole && !res.profile?.defend_take && (!res.profile?.photos || res.profile.photos.length === 0)) {
          setIsOnboardingOpen(true);
        }
        api.connectWebSocket();
      }).catch(() => {
        api.logout();
      });
    }
  }, []);

  const addToast = (toast: Omit<ToastData, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev.slice(-3), { ...toast, id }]);
  };

  // Load Feed, Sparks, Conversations when authenticated
  useEffect(() => {
    if (!currentUser) return;

    loadDiscoveryFeed();
    loadSparks();
    loadConversations();

    // Request notification permission once signed in
    if (!notifications.isPermissionGranted()) {
      notifications.requestPermission().catch(() => {});
    }

    // Listen to real-time events with tactile in-app push and sound alerts
    const unsub = api.onWebSocketEvent((event) => {
      if (event.type === 'spark_received') {
        loadSparks();
        const senderName = event.payload?.sender_name || 'A curious connection';
        addToast({
          type: 'spark',
          title: '✨ New Spark Received!',
          body: `${senderName} sparked your perspective!`,
          onClick: () => setActiveTab('sparks'),
        });
        notifications.showPush('✨ New Spark Received!', {
          body: `${senderName} sparked your perspective!`,
          onClick: () => setActiveTab('sparks'),
        });
      }

      if (event.type === 'match_created') {
        loadConversations();
        const partnerName = event.payload?.partner?.display_name || 'A new connection';
        addToast({
          type: 'match',
          title: "💛 It's a Match!",
          body: `You and ${partnerName} sparked each other! Start chatting.`,
          onClick: () => setActiveTab('chat'),
        });
        notifications.showPush("💛 It's a Match on Cupiddle!", {
          body: `You and ${partnerName} sparked each other!`,
          onClick: () => setActiveTab('chat'),
        });
      }

      if (event.type === 'new_message') {
        loadConversations();
        const senderName = event.payload?.sender_name || 'Your match';
        const content = event.payload?.content || 'Sent a new message';
        // Only alert if we aren't currently inside this chat room
        if (activeTab !== 'chat' || selectedConvId !== event.payload?.conversation_id) {
          addToast({
            type: 'message',
            title: `💬 ${senderName}`,
            body: content,
            onClick: () => {
              setSelectedConvId(event.payload?.conversation_id);
              setActiveTab('chat');
            },
          });
          notifications.showPush(`💬 Message from ${senderName}`, {
            body: content,
            onClick: () => {
              setSelectedConvId(event.payload?.conversation_id);
              setActiveTab('chat');
            },
          });
        }
      }
    });

    return unsub;
  }, [currentUser, activeTab, selectedConvId]);

  const loadDiscoveryFeed = async () => {
    try {
      setLoading(true);
      const res = await api.getDiscoveryFeed(10);
      setCandidates(res?.candidates || []);
      setCandidateIndex(0);
    } catch (err) {
      console.error('Failed to load feed', err);
      setCandidates([]);
    } finally {
      setLoading(false);
    }
  };

  const loadSparks = async () => {
    try {
      const res = await api.getIncomingSparks();
      setSparks(res?.sparks || []);
    } catch (err) {
      console.error('Failed to load sparks', err);
      setSparks([]);
    }
  };

  const loadConversations = async () => {
    try {
      const res = await api.getConversations();
      const list = res?.conversations || [];
      setConversations(list);
      if (list.length > 0 && !selectedConvId) {
        setSelectedConvId(list[0].id);
      }
    } catch (err) {
      console.error('Failed to load conversations', err);
      setConversations([]);
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

  // Unauthenticated visitors see the Bumble Sunlit Honey Editorial Landing Page
  if (!currentUser) {
    return (
      <div style={{ backgroundColor: 'var(--surface-page-canvas, #ffffff)', minHeight: '100vh' }}>
        <SunlitLandingPage
          onOpenAuth={(preselectedState, mode) => {
            setAuthInitialState(preselectedState);
            setAuthMode(mode || 'register');
            setIsAuthOpen(true);
          }}
          onOpenSuggestion={() => setIsSuggestionOpen(true)}
        />
        <AuthModal
          isOpen={isAuthOpen}
          initialState={authInitialState}
          initialMode={authMode}
          onClose={() => setIsAuthOpen(false)}
          onSuccess={async () => {
            const me = await api.getMe();
            setCurrentUser(me.user);
            setMyProfile(me.profile);
            setIsOnboardingOpen(true);
            api.connectWebSocket();
          }}
        />
        <SuggestionModal
          isOpen={isSuggestionOpen}
          onClose={() => setIsSuggestionOpen(false)}
        />
      </div>
    );
  }

  const currentCandidate = candidates[candidateIndex];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--surface-page-canvas, #ffffff)', color: 'var(--color-bumble-ink, #202020)' }}>
      {/* Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        myProfile={myProfile}
        unreadSparksCount={(sparks || []).length}
        unreadChatCount={(conversations || []).reduce((sum, c) => sum + (c.unread_count || 0), 0)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        onOpenSuggestion={() => setIsSuggestionOpen(true)}
      />

      {/* Main Container */}
      <main style={{ padding: 'clamp(16px, 2.5vw, 32px) clamp(12px, 2.5vw, 20px) 96px', maxWidth: '1200px', margin: '0 auto' }}>

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
                backgroundColor: 'var(--color-paper-white, #ffffff)',
                borderRadius: 'var(--radius-cards, 24px)',
                border: '1.5px solid var(--color-bumble-ink, #202020)',
                boxShadow: 'var(--shadow-sm, 0px 1px 8px rgba(32, 32, 32, 0.12))',
              }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: 'var(--radius-buttons, 16px)',
                  backgroundColor: 'var(--color-bumble-honey, #ffdb5b)',
                  border: '1.5px solid var(--color-bumble-ink, #202020)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                }}>
                  <Compass size={28} color="var(--color-bumble-ink, #202020)" />
                </div>
                <h3 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-bumble-ink, #202020)', marginBottom: '8px', letterSpacing: '-0.02em' }}>
                  You've Explored All Current Recommendations
                </h3>
                <p style={{ fontSize: '15px', color: 'var(--color-graphite, #575656)', lineHeight: 1.5, marginBottom: '24px' }}>
                  Cupiddle is nationwide across all 36 Nigerian states and Abuja. You can reset your feed to rediscover profiles or explore communities.
                </p>
                <button
                  onClick={async () => {
                    await api.resetPasses();
                    await loadDiscoveryFeed();
                  }}
                  style={{
                    padding: '14px 28px',
                    borderRadius: 'var(--radius-buttons, 16px)',
                    backgroundColor: 'var(--color-bumble-ink, #202020)',
                    color: 'var(--color-paper-white, #ffffff)',
                    fontWeight: 700,
                    fontSize: '15px',
                    letterSpacing: '0.01em',
                  }}
                >
                  Reset Discovery Feed
                </button>
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
            onSelectConversation={setSelectedConvId}
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

      {/* Mobile App Bottom Navigation Bar */}
      {myProfile && (
        <nav
          className="mobile-bottom-bar"
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            height: '64px',
            backgroundColor: 'var(--color-paper-white, #ffffff)',
            borderTop: '1.5px solid var(--color-bumble-ink, #202020)',
            display: 'none',
            justifyContent: 'space-around',
            alignItems: 'center',
            zIndex: 90,
            paddingBottom: 'env(safe-area-inset-bottom)',
          }}
        >
          <button
            onClick={() => setActiveTab('stream')}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '2px',
              color: activeTab === 'stream' ? 'var(--color-bumble-ink, #202020)' : 'var(--color-graphite, #575656)',
              fontSize: '11px',
              fontWeight: 700,
            }}
          >
            <Compass size={20} />
            <span>Discover</span>
          </button>

          <button
            onClick={() => setActiveTab('sparks')}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '2px',
              color: activeTab === 'sparks' ? 'var(--color-bumble-ink, #202020)' : 'var(--color-graphite, #575656)',
              fontSize: '11px',
              fontWeight: 700,
              position: 'relative',
            }}
          >
            <Heart size={20} />
            <span>Sparks</span>
            {(sparks || []).length > 0 && (
              <span style={{
                position: 'absolute',
                top: '-4px',
                right: '4px',
                width: '16px',
                height: '16px',
                backgroundColor: 'var(--color-bumble-honey, #ffdb5b)',
                color: 'var(--color-bumble-ink, #202020)',
                border: '1px solid var(--color-bumble-ink, #202020)',
                borderRadius: '50%',
                fontSize: '10px',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {(sparks || []).length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '2px',
              color: activeTab === 'chat' ? 'var(--color-bumble-ink, #202020)' : 'var(--color-graphite, #575656)',
              fontSize: '11px',
              fontWeight: 700,
            }}
          >
            <MessageCircle size={20} />
            <span>Chats</span>
          </button>

          <button
            onClick={() => setActiveTab('communities')}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '2px',
              color: activeTab === 'communities' ? 'var(--color-bumble-ink, #202020)' : 'var(--color-graphite, #575656)',
              fontSize: '11px',
              fontWeight: 700,
            }}
          >
            <Users size={20} />
            <span>Rabbit Holes</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '2px',
              color: activeTab === 'profile' ? 'var(--color-bumble-ink, #202020)' : 'var(--color-graphite, #575656)',
              fontSize: '11px',
              fontWeight: 700,
            }}
          >
            <UserIcon size={20} />
            <span>Profile</span>
          </button>
        </nav>
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        initialState={authInitialState}
        initialMode={authMode}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={async () => {
          const me = await api.getMe();
          setCurrentUser(me.user);
          setMyProfile(me.profile);
          setIsOnboardingOpen(true);
          api.connectWebSocket();
        }}
      />

      {/* Curiosity Onboarding Modal */}
      {myProfile && (
        <OnboardingModal
          isOpen={isOnboardingOpen}
          profile={myProfile}
          onComplete={(updated) => {
            setMyProfile(updated);
            setIsOnboardingOpen(false);
            loadDiscoveryFeed();
          }}
          onDismiss={() => setIsOnboardingOpen(false)}
        />
      )}

      {/* Suggestion Box Modal */}
      <SuggestionModal
        isOpen={isSuggestionOpen}
        onClose={() => setIsSuggestionOpen(false)}
        userEmail={currentUser?.email}
      />

      {/* Real-Time Push Notification Toasts */}
      <NotificationToast
        toasts={toasts}
        onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))}
      />

      {/* Persistent PWA Install Banner */}
      <PwaInstallBanner />
    </div>
  );
};
