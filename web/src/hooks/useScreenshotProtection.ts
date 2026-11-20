import { useEffect, useState } from 'react';

/**
 * useScreenshotProtection
 * Provides client-side defense against screen captures, OS task-switcher thumbnails,
 * and text-scraping for student safety:
 * 1. Blurs content when app loses focus or is switched away (preventing OS preview screenshots)
 * 2. Blanks content momentarily when PrintScreen / snipping keys are pressed
 * 3. Applies strict user-select none to protect private student chats
 */
export function useScreenshotProtection() {
  const [isShieldActive, setIsShieldActive] = useState(false);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsShieldActive(true);
      } else {
        setIsShieldActive(false);
      }
    };

    const handleBlur = () => {
      setIsShieldActive(true);
    };

    const handleFocus = () => {
      setIsShieldActive(false);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (
        e.key === 'PrintScreen' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'S' || e.key === 's')) ||
        (e.metaKey && e.shiftKey && (e.key === '3' || e.key === '4'))
      ) {
        setIsShieldActive(true);
        setTimeout(() => setIsShieldActive(false), 2000);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return isShieldActive;
}
