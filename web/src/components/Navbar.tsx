import React from 'react';
import { Sparkles, MessageCircle, Users, Heart, User as UserIcon, LogOut, Compass } from 'lucide-react';
import { Profile } from '../types';

interface NavbarProps {
  activeTab: 'stream' | 'sparks' | 'chat' | 'communities' | 'profile';
  setActiveTab: (tab: 'stream' | 'sparks' | 'chat' | 'communities' | 'profile') => void;
  myProfile: Profile | null;
  unreadSparksCount: number;
  unreadChatCount: number;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  myProfile,
  unreadSparksCount,
  unreadChatCount,
  onOpenAuth,
  onLogout,
}) => {
  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px 24px',
      backgroundColor: 'rgba(24, 16, 36, 0.85)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--color-surface-border)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>
      {/* Brand */}
      <div 
        onClick={() => setActiveTab('stream')}
        style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
      >
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, var(--color-violet-600), var(--color-coral-500))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'var(--shadow-glow)',
        }}>
          <Sparkles size={22} color="#ffffff" />
        </div>
        <div>
          <span style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '-0.03em', color: '#ffffff' }}>
            Cupiddle
          </span>
          <span style={{
            display: 'block',
            fontSize: '10px',
            color: 'var(--color-text-muted)',
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}>
            Curiosity is attractive
          </span>
        </div>
      </div>

      {/* Nav Tabs (Desktop) */}
      {myProfile && (
        <nav className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setActiveTab('stream')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: 'var(--radius-full)',
              color: activeTab === 'stream' ? '#ffffff' : 'var(--color-text-secondary)',
              backgroundColor: activeTab === 'stream' ? 'var(--color-violet-800)' : 'transparent',
              fontWeight: 600,
              fontSize: '14px',
            }}
          >
            <Compass size={17} />
            <span>Idea Stream</span>
          </button>

          <button
            onClick={() => setActiveTab('sparks')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: 'var(--radius-full)',
              color: activeTab === 'sparks' ? '#ffffff' : 'var(--color-text-secondary)',
              backgroundColor: activeTab === 'sparks' ? 'var(--color-violet-800)' : 'transparent',
              fontWeight: 600,
              fontSize: '14px',
              position: 'relative',
            }}
          >
            <Heart size={17} />
            <span>Sparks</span>
            {unreadSparksCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '4px',
                right: '4px',
                width: '18px',
                height: '18px',
                backgroundColor: 'var(--color-coral-500)',
                color: '#ffffff',
                borderRadius: '50%',
                fontSize: '11px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {unreadSparksCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: 'var(--radius-full)',
              color: activeTab === 'chat' ? '#ffffff' : 'var(--color-text-secondary)',
              backgroundColor: activeTab === 'chat' ? 'var(--color-violet-800)' : 'transparent',
              fontWeight: 600,
              fontSize: '14px',
              position: 'relative',
            }}
          >
            <MessageCircle size={17} />
            <span>Conversations</span>
            {unreadChatCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '4px',
                right: '4px',
                width: '18px',
                height: '18px',
                backgroundColor: 'var(--color-violet-500)',
                color: '#ffffff',
                borderRadius: '50%',
                fontSize: '11px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {unreadChatCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('communities')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: 'var(--radius-full)',
              color: activeTab === 'communities' ? '#ffffff' : 'var(--color-text-secondary)',
              backgroundColor: activeTab === 'communities' ? 'var(--color-violet-800)' : 'transparent',
              fontWeight: 600,
              fontSize: '14px',
            }}
          >
            <Users size={17} />
            <span>Rabbit Holes</span>
          </button>
        </nav>
      )}

      {/* User Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{
          fontSize: '11px',
          fontWeight: 600,
          padding: '4px 10px',
          borderRadius: 'var(--radius-full)',
          backgroundColor: 'rgba(124, 58, 237, 0.15)',
          color: 'var(--color-violet-400)',
          border: '1px solid rgba(124, 58, 237, 0.3)',
        }}>
          100% Free
        </span>

        {myProfile ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => setActiveTab('profile')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: activeTab === 'profile' ? 'var(--color-violet-800)' : 'var(--color-surface-card)',
                border: '1px solid var(--color-surface-border)',
                color: '#ffffff',
                fontSize: '13px',
                fontWeight: 600,
              }}
            >
              <UserIcon size={16} />
              <span>{myProfile.display_name}</span>
            </button>
            <button
              onClick={onLogout}
              title="Sign out"
              style={{
                padding: '8px',
                borderRadius: '50%',
                color: 'var(--color-text-muted)',
              }}
            >
              <LogOut size={18} />
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            style={{
              padding: '8px 20px',
              borderRadius: 'var(--radius-full)',
              background: 'linear-gradient(135deg, var(--color-violet-600), var(--color-coral-500))',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '14px',
              boxShadow: 'var(--shadow-glow)',
            }}
          >
            Sign In / Join
          </button>
        )}
      </div>
    </header>
  );
};

