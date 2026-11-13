// Notification and Sound Dispatcher for Cupiddle

class NotificationManager {
  private hasPermission: boolean = false;
  private audioCtx: AudioContext | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      this.hasPermission = Notification.permission === 'granted';
    }
  }

  async requestPermission(): Promise<boolean> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return false;
    }

    try {
      const perm = await Notification.requestPermission();
      this.hasPermission = perm === 'granted';
      return this.hasPermission;
    } catch (e) {
      console.warn('Could not request notification permission', e);
      return false;
    }
  }

  isPermissionGranted(): boolean {
    if (typeof window === 'undefined' || !('Notification' in window)) return false;
    return Notification.permission === 'granted';
  }

  // Pure Web Audio API tactile notification chime (no MP3 asset needed!)
  playNotificationSound(type: 'spark' | 'match' | 'message' = 'message') {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      if (!this.audioCtx) {
        this.audioCtx = new AudioCtx();
      }

      const ctx = this.audioCtx;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'match') {
        // Melodic triple-note celebration chime
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.12); // E5
        osc.frequency.setValueAtTime(783.99, now + 0.24); // G5
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
        osc.start(now);
        osc.stop(now + 0.55);
      } else if (type === 'spark') {
        // Crisp dual-tone curiosity bell
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.setValueAtTime(880.00, now + 0.1); // A5
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
        osc.start(now);
        osc.stop(now + 0.45);
      } else {
        // Gentle bubble pop message chime
        osc.type = 'sine';
        osc.frequency.setValueAtTime(659.25, now); // E5
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      }
    } catch (e) {
      // Audio playback failed or blocked by browser policy
    }
  }

  showPush(title: string, options: { body: string; icon?: string; tag?: string; onClick?: () => void }) {
    // 1. Play sound
    this.playNotificationSound(
      title.toLowerCase().includes('match')
        ? 'match'
        : title.toLowerCase().includes('spark')
        ? 'spark'
        : 'message'
    );

    // 2. Dispatch browser notification if granted
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        const notif = new Notification(title, {
          body: options.body,
          icon: options.icon || '/cupiddle-icon-192.png',
          tag: options.tag || 'cupiddle-alert',
          badge: '/cupiddle-icon-192.png',
        });

        if (options.onClick) {
          notif.onclick = () => {
            window.focus();
            options.onClick!();
            notif.close();
          };
        }
      } catch (e) {
        console.warn('Browser push failed', e);
      }
    }
  }
}

export const notifications = new NotificationManager();

