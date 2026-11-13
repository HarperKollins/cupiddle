import React, { useState, useEffect } from 'react';
import { Download, X, Share2, PlusSquare } from 'lucide-react';
import { CupiddleAppBadge } from './CupiddleLogo';

export const PwaInstallBanner: React.FC = () => {
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

    // Detect app installed
    window.addEventListener('appinstalled', () => {
      setIsStandalone(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

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
      {/* Floating Install Banner - only shown if not dismissed */}
      {!isDismissed && (
        <aside
          aria-label="Install Cupiddle application"
          className="desktop-nav"
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 9000,
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            border: '2px solid #202020',
            boxShadow: '0 12px 36px rgba(32, 32, 32, 0.25)',
            padding: '14px 18px',
            maxWidth: '360px',
            width: 'calc(100vw - 48px)',
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

      {/* Guided Install Modal for iOS & Desktop Fallback */}
      {showIosGuide && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(32, 32, 32, 0.7)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '20px',
          }}
        >
          <div
            className="animate-modal-spring"
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '24px',
              border: '2px solid #202020',
              padding: '32px',
              maxWidth: '440px',
              width: '100%',
              boxShadow: '0 24px 60px rgba(32, 32, 32, 0.3)',
              position: 'relative',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <CupiddleAppBadge size={40} />
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#202020', margin: 0 }}>
                    Install Cupiddle
                  </h3>
                  <span style={{ fontSize: '12px', color: '#575656', fontWeight: 600 }}>
                    Add to your Home Screen in 2 clicks
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowIosGuide(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#202020',
                  padding: '6px',
                  cursor: 'pointer',
                }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', margin: '20px 0' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  padding: '12px',
                  borderRadius: '16px',
                  backgroundColor: '#f8f8f8',
                  border: '1px solid #e0e0e0',
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: '#ffdb5b',
                    border: '1px solid #202020',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    fontWeight: 800,
                    fontSize: '13px',
                  }}
                >
                  1
                </div>
                <div>
                  <strong style={{ fontSize: '14px', color: '#202020', display: 'block' }}>
                    Tap the Share Icon
                  </strong>
                  <span style={{ fontSize: '12px', color: '#575656' }}>
                    In Safari (bottom bar) or Chrome menu, tap the{' '}
                    <Share2 size={13} style={{ display: 'inline', verticalAlign: 'middle' }} /> Share button.
                  </span>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  padding: '12px',
                  borderRadius: '16px',
                  backgroundColor: '#f8f8f8',
                  border: '1px solid #e0e0e0',
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: '#ffdb5b',
                    border: '1px solid #202020',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    fontWeight: 800,
                    fontSize: '13px',
                  }}
                >
                  2
                </div>
                <div>
                  <strong style={{ fontSize: '14px', color: '#202020', display: 'block' }}>
                    Select "Add to Home Screen"
                  </strong>
                  <span style={{ fontSize: '12px', color: '#575656' }}>
                    Scroll down and choose{' '}
                    <PlusSquare size={13} style={{ display: 'inline', verticalAlign: 'middle' }} /> "Add to Home Screen".
                  </span>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  padding: '12px',
                  borderRadius: '16px',
                  backgroundColor: '#fff386',
                  border: '1px solid #202020',
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: '#202020',
                    color: '#ffdb5b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    fontWeight: 800,
                    fontSize: '13px',
                  }}
                >
                  3
                </div>
                <div>
                  <strong style={{ fontSize: '14px', color: '#202020', display: 'block' }}>
                    Launch Cupiddle Anytime!
                  </strong>
                  <span style={{ fontSize: '12px', color: '#3b3b3b' }}>
                    The official app badge will appear on your phone home screen with full offline and push support.
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIosGuide(false)}
              className="btn-bumble-action"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '16px',
                backgroundColor: '#202020',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </>
  );
};
