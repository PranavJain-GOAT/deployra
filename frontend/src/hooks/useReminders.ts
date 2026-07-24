import { useEffect, useRef } from 'react';
import { FeedItem } from '@/types';

// ─── Browser notification reminder engine ─────────────────────────────────────
// Fires browser push notifications every N minutes for unresolved critical/high items
// until the user marks them done.

const REMINDER_INTERVAL_MS = 15 * 60 * 1000; // 15 min
const CRITICAL_INTERVAL_MS = 5 * 60 * 1000;  // 5 min for critical

function playChime() {
  try {
    const ctx = new AudioContext();
    [880, 1100, 880].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.18);
      gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + i * 0.18 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.18 + 0.4);
      osc.start(ctx.currentTime + i * 0.18);
      osc.stop(ctx.currentTime + i * 0.18 + 0.4);
    });
  } catch { /* ignore */ }
}

async function fireBrowserNotification(item: FeedItem) {
  if (!('Notification' in window)) return;
  if (Notification.permission !== 'granted') {
    await Notification.requestPermission();
  }
  if (Notification.permission !== 'granted') return;

  const urgencyPrefix = item.priority === 'critical' ? '🔴 CRITICAL: ' : '🟠 ';
  const deadline = item.deadline
    ? ` · Due: ${new Date(item.deadline).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`
    : '';

  const notif = new Notification(`${urgencyPrefix}${item.title}`, {
    body: `${item.summary}${deadline}\n\nClick to open OmniPulse`,
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    tag: `omnipulse-${item.id}`,        // deduplicates — replaces old one
    requireInteraction: item.priority === 'critical', // stays until clicked
    silent: false,
  });

  notif.onclick = () => {
    window.focus();
    notif.close();
  };

  if (item.priority === 'critical') {
    playChime();
  }
}

export function useReminderEngine(items: FeedItem[], soundEnabled = true) {
  const timerRef = useRef<Record<string, ReturnType<typeof setInterval>>>({});
  const lastFiredRef = useRef<Record<string, number>>({});

  useEffect(() => {
    // Clear existing timers for items no longer in list
    const currentIds = new Set(items.map(i => i.id));
    Object.keys(timerRef.current).forEach(id => {
      if (!currentIds.has(id)) {
        clearInterval(timerRef.current[id]);
        delete timerRef.current[id];
      }
    });

    // Set up reminders for pending critical/high items
    items
      .filter(i => i.status === 'pending' && (i.priority === 'critical' || i.priority === 'high'))
      .forEach(item => {
        if (timerRef.current[item.id]) return; // already tracking

        const interval = item.priority === 'critical' ? CRITICAL_INTERVAL_MS : REMINDER_INTERVAL_MS;

        // Fire first reminder after 1 min to not be intrusive on load
        const firstFire = setTimeout(() => {
          fireBrowserNotification(item);
          lastFiredRef.current[item.id] = Date.now();

          // Then repeat on interval
          timerRef.current[item.id] = setInterval(() => {
            fireBrowserNotification(item);
            lastFiredRef.current[item.id] = Date.now();
          }, interval);
        }, 60_000);

        // Store first-fire so we can clear it
        timerRef.current[item.id] = firstFire as unknown as ReturnType<typeof setInterval>;
      });

    return () => {
      Object.values(timerRef.current).forEach(t => clearInterval(t));
    };
  }, [items]);
}

export function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}

export { playChime, fireBrowserNotification };
