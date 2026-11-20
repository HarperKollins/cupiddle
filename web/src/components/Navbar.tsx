import React from 'react';
import { LogOut, ShieldCheck, Sparkles } from 'lucide-react';
import { Profile } from '../types';

interface NavbarProps {
  activeTab?: 'stream' | 'sparks' | 'chat' | 'communities' | 'profile';
  setActiveTab: (tab: 'stream' | 'sparks' | 'chat' | 'communities' | 'profile') => void;
  myProfile: Profile | null;
  unreadSparksCount?: number;
  unreadChatCount?: number;
  onOpenAuth: () => void;
  onLogout: () => void;
  onOpenSuggestion?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  setActiveTab,
  myProfile,
  onOpenAuth,
  onLogout,
  onOpenSuggestion,
}) => {
  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: 'rgba(13, 8, 10, 0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 31, 106, 0.15)',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        maxWidth: 'var(--mobile-app-width, 480px)',
        margin: '0 auto',
      }}
    >
      {/* Brand & Campus Handle */}
      <div
        onClick={() => setActiveTab('stream')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        <div
          style={{
            width: '34px',
            height: '34px',
            borderRadius: '10px',
            backgroundColor: '#5E081E',
            border: '1px solid rgba(255, 31, 106, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 12px rgba(255, 31, 106, 0.3)',
          }}
        >
          <span style={{ color: '#FFFFFF', fontWeight: 900, fontSize: '18px', fontStyle: 'italic', fontFamily: 'serif' }}>
            C
          </span>
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span
              style={{
                fontSize: '17px',
                fontWeight: 800,
                color: '#FFFFFF',
                letterSpacing: '-0.02em',
                fontFamily: "'Playfair Display', serif",
                fontStyle: 'italic',
              }}
            >
              Cupiddle
            </span>
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: '#FF1F6A',
                boxShadow: '0 0 8px #FF1F6A',
                display: 'inline-block',
              }}
            />
          </div>

          {myProfile?.campus ? (
            <span
              style={{
                fontSize: '10px',
                color: '#E0D4D8',
                fontWeight: 600,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                display: 'block',
                lineHeight: 1,
                marginTop: '1px',
              }}
            >
              {myProfile.campus}
            </span>
          ) : (
            <span
              style={{
                fontSize: '10px',
                color: '#9E8C93',
                fontWeight: 600,
                display: 'block',
                lineHeight: 1,
              }}
            >
              Campus Desire
            </span>
          )}
        </div>
      </div>

      {/* Right Action Icons: Handle Badge & Logout */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {myProfile ? (
          <>
            <button
              onClick={() => setActiveTab('profile')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 10px',
                borderRadius: '100px',
                backgroundColor: 'rgba(255, 31, 106, 0.1)',
                border: '1px solid rgba(255, 31, 106, 0.25)',
                color: '#FF1F6A',
                fontSize: '12px',
                fontWeight: 700,
              }}
            >
              <ShieldCheck size={13} />
              <span>@{myProfile.username || 'me'}</span>
            </button>

            {onOpenSuggestion && (
              <button
                onClick={onOpenSuggestion}
                title="Campus Suggestion"
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 31, 106, 0.1)',
                  border: '1px solid rgba(255, 31, 106, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FF1F6A',
                  cursor: 'pointer',
                }}
              >
                <Sparkles size={14} />
              </button>
            )}

            <button
              onClick={onLogout}
              title="Sign Out"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#9E8C93',
                cursor: 'pointer',
              }}
            >
              <LogOut size={15} />
            </button>
          </>
        ) : (
          <button
            onClick={onOpenAuth}
            style={{
              padding: '7px 16px',
              borderRadius: '100px',
              backgroundColor: '#FF1F6A',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: '13px',
              boxShadow: '0 0 14px rgba(255, 31, 106, 0.4)',
            }}
          >
            Enter
          </button>
        )}
      </div>
    </header>
  );
};
