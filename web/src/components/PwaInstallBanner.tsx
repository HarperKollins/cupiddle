import React, { useState, useEffect } from 'react';
import { Download, X, Share2, PlusSquare } from 'lucide-react';
import { CupiddleAppBadge } from './CupiddleLogo';

interface PwaInstallBannerProps {
  hideFloatingBanner?: boolean;
}

export const PwaInstallBanner: React.FC<PwaInstallBannerProps> = ({ hideFloatingBanner = false }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    return localStorage.getItem('cupiddle_pwa_dismissed') === 'true';
  });
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    // Check if running in standalone PWA mode
    const standaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(standaloneMode);

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isAppleDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(isAppleDevice);

    // Capture standard PWA install event (Chrome, Android, Edge)
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Listen for custom trigger from any button across the app
    const handleCustomOpen = () => {
      handleInstallClick();
    };
    window.addEventListener('cupiddle:open-install', handleCustomOpen);

    // Detect app installed
    window.addEventListener('appinstalled', () => {
      setIsStandalone(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('cupiddle:open-install', handleCustomOpen);
    };
  }, [deferredPrompt, isIos]);

  if (isStandalone) {
    return null; // Already running as installed app!
  }

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        await deferredPrompt.userChoice;
        setDeferredPrompt(null);
      } catch (err) {
        console.error('PWA Install prompt error:', err);
      }
    } else if (isIos) {
      setShowIosGuide(true);
    } else {
      // Fallback instruction
      setShowIosGuide(true);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('cupiddle_pwa_dismissed', 'true');
  };

  return (
    <>
      {/* Floating Install Banner - only shown if not dismissed and not hidden on landing */}
      {!hideFloatingBanner && !isDismissed && (
        <aside
          aria-label="Install Cupiddle application"
          style={{
            position: 'fixed',
            bottom: '76px', // Clear of mobile bottom tab bar (height 60px)
            right: '16px',
            zIndex: 85,
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            border: '2px solid #202020',
            boxShadow: '0 12px 36px rgba(32, 32, 32, 0.25)',
            padding: '12px 16px',
            maxWidth: '360px',
            width: 'calc(100vw - 32px)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <CupiddleAppBadge size={40} />

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 800,
                  backgroundColor: '#ffdb5b',
                  color: '#202020',
                  padding: '1px 7px',
                  borderRadius: '1000px',
                  border: '1px solid #202020',
                  textTransform: 'uppercase',
                }}
              >
                PWA
              </span>
            </div>
            <h4
              style={{
                fontSize: '14px',
                fontWeight: 800,
                color: '#202020',
                margin: '2px 0 0',
                letterSpacing: '-0.01em',
              }}
            >
              Install Cupiddle App
            </h4>
            <p
              style={{
                fontSize: '11px',
                color: '#575656',
                margin: 0,
                lineHeight: 1.3,
                fontWeight: 500,
              }}
            >
              Fast home screen app • Zero app store wait
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              onClick={handleInstallClick}
              className="btn-bumble-action"
              style={{
                backgroundColor: '#ffdb5b',
                color: '#202020',
                border: '1.5px solid #202020',
                padding: '7px 12px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              <Download size={13} /> Install
            </button>

            <button
              onClick={handleDismiss}
              title="Dismiss"
              style={{
                background: 'none',
                border: 'none',
                color: '#575656',
                padding: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={16} />
            </button>
          </div>
        </aside>
      )}

      {/* Guided Install Modal for Android Chrome & iPhone Safari (No Play Store Needed) */}
      {showIosGuide && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Install Cupiddle Mobile App"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(14, 15, 16, 0.72)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '20px',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowIosGuide(false);
          }}
        >
          <div
            className="animate-modal-spring"
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '24px',
              border: '1px solid rgba(14, 15, 16, 0.12)',
              padding: '32px',
              maxWidth: '460px',
              width: '100%',
              boxShadow: 'rgba(38, 42, 62, 0.16) 0px 12px 40px 0px',
              position: 'relative',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '12px',
                    backgroundColor: '#7B112C',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '18px',
                    flexShrink: 0,
                  }}
                >
                  C
                </div>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0e0f10', margin: 0 }}>
                    Install Cupiddle Mobile App
                  </h3>
                  <span style={{ fontSize: '13px', color: '#666666', fontWeight: 500 }}>
                    Direct install to your phone · Not on Play Store
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowIosGuide(false)}
                aria-label="Close install guide"
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#0e0f10',
                  padding: '6px',
                  cursor: 'pointer',
                  minWidth: '40px',
                  minHeight: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', margin: '20px 0' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  padding: '14px',
                  borderRadius: '16px',
                  backgroundColor: '#f4f4f8',
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '100px',
                    backgroundColor: '#7B112C',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    fontWeight: 700,
                    fontSize: '13px',
                  }}
                >
                  1
                </div>
                <div>
                  <strong style={{ fontSize: '14px', color: '#0e0f10', display: 'block' }}>
                    Open browser menu or Share bar
                  </strong>
                  <span style={{ fontSize: '13px', color: '#666666', lineHeight: 1.4 }}>
                    On Android Chrome tap the 3-dot menu; on iPhone Safari tap{' '}
                    <Share2 size={13} style={{ display: 'inline', verticalAlign: 'middle' }} /> Share.
                  </span>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  padding: '14px',
                  borderRadius: '16px',
                  backgroundColor: '#f4f4f8',
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '100px',
                    backgroundColor: '#7B112C',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    fontWeight: 700,
                    fontSize: '13px',
                  }}
                >
                  2
                </div>
                <div>
                  <strong style={{ fontSize: '14px', color: '#0e0f10', display: 'block' }}>
                    Tap &quot;Install app&quot; or &quot;Add to Home Screen&quot;
                  </strong>
                  <span style={{ fontSize: '13px', color: '#666666', lineHeight: 1.4 }}>
                    Choose <PlusSquare size={13} style={{ display: 'inline', verticalAlign: 'middle' }} /> Add to Home Screen — installs in under 10 seconds with zero Play Store download.
                  </span>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  padding: '14px',
                  borderRadius: '16px',
                  backgroundColor: '#F9EBEF',
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '100px',
                    backgroundColor: '#0e0f10',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    fontWeight: 700,
                    fontSize: '13px',
                  }}
                >
                  3
                </div>
                <div>
                  <strong style={{ fontSize: '14px', color: '#0e0f10', display: 'block' }}>
                    Launch full-screen anytime
                  </strong>
                  <span style={{ fontSize: '13px', color: '#2f3133', lineHeight: 1.4 }}>
                    Runs natively on your phone with private chats, real-time notifications, and discreet home-screen icon.
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIosGuide(false)}
              style={{
                width: '100%',
                padding: '13px 24px',
                borderRadius: '100px',
                backgroundColor: '#7B112C',
                color: '#ffffff',
                fontWeight: 600,
                fontSize: '15px',
                cursor: 'pointer',
              }}
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};
