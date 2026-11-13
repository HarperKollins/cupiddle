import React from 'react';
import { MessageCircle, Users, Heart, User as UserIcon, LogOut, Compass, Lightbulb } from 'lucide-react';
import { CupiddleAppBadge } from './CupiddleLogo';
import { Profile } from '../types';

interface NavbarProps {
  activeTab: 'stream' | 'sparks' | 'chat' | 'communities' | 'profile';
  setActiveTab: (tab: 'stream' | 'sparks' | 'chat' | 'communities' | 'profile') => void;
  myProfile: Profile | null;
  unreadSparksCount: number;
  unreadChatCount: number;
  onOpenAuth: () => void;
  onLogout: () => void;
  onOpenSuggestion?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  myProfile,
  unreadSparksCount,
  unreadChatCount,
  onOpenAuth,
  onLogout,
  onOpenSuggestion,
}) => {
  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px clamp(12px, 3vw, 28px)',
        backgroundColor: 'var(--color-paper-white, #ffffff)',
        borderBottom: '1.5px solid var(--color-bumble-ink, #202020)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      {/* Brand */}
      <div
        onClick={() => setActiveTab('stream')}
        style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', flexShrink: 0 }}
      >
        <CupiddleAppBadge size={36} />
        <div>
          <span
            style={{
              fontSize: '20px',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              color: 'var(--color-bumble-ink, #202020)',
            }}
          >
            Cupiddle
          </span>
          <span
            className="desktop-nav"
            style={{
              display: 'block',
              fontSize: '11px',
              color: 'var(--color-graphite, #575656)',
              fontWeight: 600,
              letterSpacing: '0.02em',
            }}
          >
            Curiosity is attractive
          </span>
        </div>
      </div>

      {/* Nav Tabs (Desktop) */}
      {myProfile && (
        <nav className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={() => setActiveTab('stream')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 18px',
              borderRadius: 'var(--radius-badges, 1000px)',
              color: 'var(--color-bumble-ink, #202020)',
              backgroundColor: activeTab === 'stream' ? 'var(--color-bumble-honey, #ffdb5b)' : 'transparent',
              border: activeTab === 'stream' ? '1.5px solid var(--color-bumble-ink, #202020)' : '1.5px solid transparent',
              fontWeight: 700,
              fontSize: '14px',
              letterSpacing: '0.01em',
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
              padding: '8px 18px',
              borderRadius: 'var(--radius-badges, 1000px)',
              color: 'var(--color-bumble-ink, #202020)',
              backgroundColor: activeTab === 'sparks' ? 'var(--color-bumble-honey, #ffdb5b)' : 'transparent',
              border: activeTab === 'sparks' ? '1.5px solid var(--color-bumble-ink, #202020)' : '1.5px solid transparent',
              fontWeight: 700,
              fontSize: '14px',
              position: 'relative',
              letterSpacing: '0.01em',
            }}
          >
            <Heart size={17} />
            <span>Sparks</span>
            {unreadSparksCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '2px',
                  right: '4px',
                  minWidth: '18px',
                  height: '18px',
                  backgroundColor: 'var(--color-bumble-ink, #202020)',
                  color: 'var(--color-bumble-honey, #ffdb5b)',
                  borderRadius: '50%',
                  fontSize: '11px',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 4px',
                }}
              >
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
              padding: '8px 18px',
              borderRadius: 'var(--radius-badges, 1000px)',
              color: 'var(--color-bumble-ink, #202020)',
              backgroundColor: activeTab === 'chat' ? 'var(--color-bumble-honey, #ffdb5b)' : 'transparent',
              border: activeTab === 'chat' ? '1.5px solid var(--color-bumble-ink, #202020)' : '1.5px solid transparent',
              fontWeight: 700,
              fontSize: '14px',
              position: 'relative',
              letterSpacing: '0.01em',
            }}
          >
            <MessageCircle size={17} />
            <span>Conversations</span>
            {unreadChatCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '2px',
                  right: '4px',
                  minWidth: '18px',
                  height: '18px',
                  backgroundColor: 'var(--color-bumble-ink, #202020)',
                  color: 'var(--color-paper-white, #ffffff)',
                  borderRadius: '50%',
                  fontSize: '11px',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 4px',
                }}
              >
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
              padding: '8px 18px',
              borderRadius: 'var(--radius-badges, 1000px)',
              color: 'var(--color-bumble-ink, #202020)',
              backgroundColor: activeTab === 'communities' ? 'var(--color-bumble-honey, #ffdb5b)' : 'transparent',
              border: activeTab === 'communities' ? '1.5px solid var(--color-bumble-ink, #202020)' : '1.5px solid transparent',
              fontWeight: 700,
              fontSize: '14px',
              letterSpacing: '0.01em',
            }}
          >
            <Users size={17} />
            <span>Rabbit Holes</span>
          </button>
        </nav>
      )}

      {/* User Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Suggestion Box Trigger */}
        {onOpenSuggestion && (
          <button
            onClick={onOpenSuggestion}
            className="pill-interactive"
            title="Suggestion Box - Share feedback or ideas"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: 'var(--radius-badges, 1000px)',
              backgroundColor: '#ffffff',
              color: 'var(--color-bumble-ink, #202020)',
              border: '1.5px solid var(--color-bumble-ink, #202020)',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <Lightbulb size={15} color="#202020" />
            <span className="desktop-nav">Suggestions</span>
          </button>
        )}

        <span
          className="desktop-nav"
          style={{
            fontSize: '12px',
            fontWeight: 700,
            padding: '5px 12px',
            borderRadius: 'var(--radius-badges, 1000px)',
            backgroundColor: 'var(--color-pollen, #fff386)',
            color: 'var(--color-bumble-ink, #202020)',
            border: '1.5px solid var(--color-bumble-ink, #202020)',
            letterSpacing: '0.02em',
          }}
        >
          100% Free
        </span>

        {myProfile ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => setActiveTab('profile')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: 'var(--radius-badges, 1000px)',
                backgroundColor: activeTab === 'profile' ? 'var(--color-bumble-honey, #ffdb5b)' : 'var(--color-mist, #f3f3f3)',
                border: '1.5px solid var(--color-bumble-ink, #202020)',
                color: 'var(--color-bumble-ink, #202020)',
                fontSize: '13px',
                fontWeight: 700,
              }}
            >
              <UserIcon size={15} />
              <span style={{ maxWidth: '110px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {myProfile.display_name || 'Profile'}
              </span>
            </button>
            <button
              onClick={onLogout}
              title="Sign out"
              style={{
                padding: '7px',
                borderRadius: '50%',
                color: 'var(--color-graphite, #575656)',
                border: '1.5px solid var(--color-bumble-ink, #202020)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#ffffff',
              }}
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            style={{
              padding: '9px 18px',
              borderRadius: 'var(--radius-buttons, 16px)',
              backgroundColor: 'var(--color-bumble-ink, #202020)',
              color: 'var(--color-paper-white, #ffffff)',
              fontWeight: 700,
              fontSize: '14px',
              letterSpacing: '0.015em',
              boxShadow: 'var(--shadow-sm, 0px 1px 8px rgba(32, 32, 32, 0.12))',
            }}
          >
            Sign In / Join
          </button>
        )}
      </div>
    </header>
  );
};
