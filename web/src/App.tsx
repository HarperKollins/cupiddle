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
import { MoodTagSelector } from './components/MoodTagSelector';
import { useScreenshotProtection } from './hooks/useScreenshotProtection';
import { NotificationToast, ToastData } from './components/NotificationToast';
import { notifications } from './utils/notifications';
import { User, Profile, DiscoveryCandidate, Spark, Conversation } from './types';
import { api } from './api';
import { Compass, Heart, MessageCircle, Users, User as UserIcon, ShieldAlert } from 'lucide-react';
import './styles/design-tokens.css';

export const App: React.FC = () => {
  const isShieldActive = useScreenshotProtection();
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
  const [authInitialCampus, setAuthInitialCampus] = useState<string | undefined>(undefined);
  const [sparkModalData, setSparkModalData] = useState<{
    isOpen: boolean;
    receiverId: string;
    receiverName: string;
    receiverHandle?: string;
    gateQuestion?: string;
    targetType: string;
    targetContent: string;
  }>({
    isOpen: false,
    receiverId: '',
    receiverName: '',
    receiverHandle: '',
    gateQuestion: '',
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
      receiverHandle: current.profile.username,
      gateQuestion: current.profile.gate_question,
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
          onOpenAuth={(preselectedState, mode, preselectedCampus) => {
            setAuthInitialState(preselectedState);
            setAuthInitialCampus(preselectedCampus);
            setAuthMode(mode || 'register');
            setIsAuthOpen(true);
          }}
          onOpenSuggestion={() => setIsSuggestionOpen(true)}
        />
        <AuthModal
          isOpen={isAuthOpen}
          initialState={authInitialState}
          initialCampus={authInitialCampus}
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
        <PwaInstallBanner hideFloatingBanner />
      </div>
    );
  }

  const currentCandidate = candidates[candidateIndex];

  return (
    <div
      className="secure-student-app"
      style={{
        minHeight: '100vh',
        backgroundColor: '#0D080A',
        color: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        overflowX: 'hidden',
      }}
    >
      <div
        className="mobile-app-viewport"
        style={{
          width: '100%',
          maxWidth: '480px',
          minHeight: '100vh',
          backgroundColor: '#0D080A',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          boxShadow: '0 0 60px rgba(0, 0, 0, 0.8)',
        }}
      >
        {/* Anti-Screenshot & Screen Recording Privacy Shield */}
        {isShieldActive && currentUser && (
          <div className="privacy-curtain">
            <ShieldAlert size={52} color="#FF1F6A" style={{ marginBottom: '16px' }} />
            <h2 style={{ fontSize: '24px', fontWeight: 800, margin: '0 0 8px', color: '#fff', fontFamily: "'Playfair Display', serif" }}>
              🔒 Student Privacy Shield Active
            </h2>
            <p style={{ fontSize: '14px', maxWidth: '420px', color: '#E0D4D8', lineHeight: 1.5, margin: 0 }}>
              Cupiddle protects student identity and campus chats against screenshots, screen recording, and unauthorized leaks.
            </p>
          </div>
        )}

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
        <main style={{ padding: '14px 14px 84px', width: '100%', flex: 1 }}>

          {/* Tab 1: The Idea Stream */}
          {activeTab === 'stream' && (
            <div>
              {myProfile && (
                <div
                  style={{
                    width: '100%',
                    margin: '0 auto 14px',
                    padding: '12px 14px',
                    backgroundColor: '#170E12',
                    borderRadius: '20px',
                    border: '1px solid rgba(255, 31, 106, 0.2)',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#E0D4D8' }}>
                      Broadcast Your Campus Vibe
                    </span>
                    {myProfile.username && (
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#FF1F6A' }}>
                        @{myProfile.username} · {myProfile.campus || 'EBSU'}
                      </span>
                    )}
                  </div>
                  <MoodTagSelector
                    compact
                    selectedTag={myProfile.vibe_tag}
                    onSelectTag={async (tagId) => {
                      try {
                        const updated = await api.updateProfile({ vibe_tag: tagId });
                        setMyProfile(updated);
                      } catch (err) {
                        console.error('Failed to update vibe tag', err);
                      }
                    }}
                  />
                </div>
              )}

              {currentCandidate ? (
                <IdeaStreamCard
                  candidate={currentCandidate}
                  onSpark={handleSparkCandidate}
                  onPass={handlePassCandidate}
                />
              ) : (
                <div style={{
                  maxWidth: '420px',
                  margin: '24px auto',
                  padding: '36px 20px',
                  textAlign: 'center',
                  backgroundColor: '#170E12',
                  borderRadius: '24px',
                  border: '1px solid rgba(255, 31, 106, 0.25)',
                  boxShadow: '0 16px 40px rgba(0, 0, 0, 0.6)',
                  color: '#FFFFFF',
                }}>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '16px',
                    backgroundColor: '#5E081E',
                    border: '1px solid #FF1F6A',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                    boxShadow: '0 0 16px rgba(255, 31, 106, 0.4)',
                  }}>
                    <Compass size={28} color="#FF1F6A" />
                  </div>
                  <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#FFFFFF', marginBottom: '8px', letterSpacing: '-0.02em', fontFamily: "'Playfair Display', serif", fontStyle: 'italic' }}>
                    All Campus Desires Explored
                  </h3>
                  <p style={{ fontSize: '14px', color: '#E0D4D8', lineHeight: 1.5, marginBottom: '24px' }}>
                    Cupiddle connects students across EBSU, UNN, UNILAG and all 36 states. Rediscover fresh perspectives or explore campus rabbit holes.
                  </p>
                  <button
                    onClick={async () => {
                      await api.resetPasses();
                      await loadDiscoveryFeed();
                    }}
                    style={{
                      padding: '12px 28px',
                      borderRadius: '100px',
                      backgroundColor: '#FF1F6A',
                      color: '#ffffff',
                      fontWeight: 800,
                      fontSize: '14px',
                      border: 'none',
                      cursor: 'pointer',
                      boxShadow: '0 0 16px rgba(255, 31, 106, 0.45)',
                    }}
                  >
                    Rediscover Campus Sparks
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
        receiverHandle={sparkModalData.receiverHandle}
        gateQuestion={sparkModalData.gateQuestion}
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
              left: '50%',
              transform: 'translateX(-50%)',
              width: '100%',
              maxWidth: '480px',
              height: '66px',
              backgroundColor: 'rgba(13, 8, 10, 0.94)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderTop: '1px solid rgba(255, 31, 106, 0.18)',
              display: 'flex',
              justifyContent: 'space-around',
              alignItems: 'center',
              zIndex: 900,
              paddingBottom: 'env(safe-area-inset-bottom)',
              boxShadow: '0 -8px 24px rgba(0, 0, 0, 0.5)',
            }}
          >
            <button
              onClick={() => setActiveTab('stream')}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                color: activeTab === 'stream' ? '#FF1F6A' : '#8A7B82',
                fontSize: '11px',
                fontWeight: activeTab === 'stream' ? 800 : 600,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '6px 12px',
                transition: 'all 0.15s ease',
              }}
            >
              <Compass size={21} color={activeTab === 'stream' ? '#FF1F6A' : '#8A7B82'} />
              <span>Discover</span>
            </button>

            <button
              onClick={() => setActiveTab('sparks')}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                color: activeTab === 'sparks' ? '#FF1F6A' : '#8A7B82',
                fontSize: '11px',
                fontWeight: activeTab === 'sparks' ? 800 : 600,
                position: 'relative',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '6px 12px',
                transition: 'all 0.15s ease',
              }}
            >
              <Heart size={21} color={activeTab === 'sparks' ? '#FF1F6A' : '#8A7B82'} />
              <span>Sparks</span>
              {(sparks || []).length > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '2px',
                  right: '12px',
                  minWidth: '16px',
                  height: '16px',
                  backgroundColor: '#FF1F6A',
                  color: '#ffffff',
                  boxShadow: '0 0 8px rgba(255, 31, 106, 0.6)',
                  borderRadius: '10px',
                  fontSize: '10px',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 4px',
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
                gap: '4px',
                color: activeTab === 'chat' ? '#FF1F6A' : '#8A7B82',
                fontSize: '11px',
                fontWeight: activeTab === 'chat' ? 800 : 600,
                position: 'relative',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '6px 12px',
                transition: 'all 0.15s ease',
              }}
            >
              <MessageCircle size={21} color={activeTab === 'chat' ? '#FF1F6A' : '#8A7B82'} />
              <span>Chats</span>
              {(conversations || []).reduce((sum, c) => sum + (c.unread_count || 0), 0) > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '2px',
                  right: '12px',
                  minWidth: '16px',
                  height: '16px',
                  backgroundColor: '#FF1F6A',
                  color: '#ffffff',
                  boxShadow: '0 0 8px rgba(255, 31, 106, 0.6)',
                  borderRadius: '10px',
                  fontSize: '10px',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 4px',
                }}>
                  {(conversations || []).reduce((sum, c) => sum + (c.unread_count || 0), 0)}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('communities')}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                color: activeTab === 'communities' ? '#FF1F6A' : '#8A7B82',
                fontSize: '11px',
                fontWeight: activeTab === 'communities' ? 800 : 600,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '6px 12px',
                transition: 'all 0.15s ease',
              }}
            >
              <Users size={21} color={activeTab === 'communities' ? '#FF1F6A' : '#8A7B82'} />
              <span>Rabbit Holes</span>
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                color: activeTab === 'profile' ? '#FF1F6A' : '#8A7B82',
                fontSize: '11px',
                fontWeight: activeTab === 'profile' ? 800 : 600,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '6px 12px',
                transition: 'all 0.15s ease',
              }}
            >
              <UserIcon size={21} color={activeTab === 'profile' ? '#FF1F6A' : '#8A7B82'} />
              <span>Profile</span>
            </button>
          </nav>
        )}
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        initialState={authInitialState}
        initialCampus={authInitialCampus}
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
