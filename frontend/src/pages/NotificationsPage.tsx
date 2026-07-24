import { useState, useEffect } from 'react';
import { Bell, BellOff, Volume2, VolumeX, Check, RefreshCw, Clock } from 'lucide-react';
import { cn, formatRelativeTime, PRIORITY_CONFIG } from '@/lib/utils';
import { useFeed } from '@/hooks/useFeed';
import { playChime, requestNotificationPermission } from '@/hooks/useReminders';
import { FeedItem } from '@/types';

function ReminderScheduleRow({ item }: { item: FeedItem }) {
  const intervalLabel = item.priority === 'critical' ? 'every 5 min' : 'every 15 min';
  const cfg = PRIORITY_CONFIG[item.priority];
  return (
    <div className={cn('card p-3 flex items-center gap-3 border-l-2',
      item.priority === 'critical' ? 'border-l-danger' : 'border-l-warning'
    )}>
      <div className={cn('w-1.5 h-1.5 rounded-full animate-pulse shrink-0',
        item.priority === 'critical' ? 'bg-danger' : 'bg-warning'
      )} />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate">{item.title}</div>
        <div className="text-xs text-muted flex items-center gap-1.5 mt-0.5">
          <Clock size={10} /> Reminding {intervalLabel} until marked done
          <span className={cn('badge ml-1', `badge-${item.priority}`)}>{cfg.label}</span>
        </div>
      </div>
    </div>
  );
}

export default function NotificationsPage() {
  const [pushEnabled, setPushEnabled] = useState(Notification.permission === 'granted');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const { data: feed = [] } = useFeed();

  const activeReminders = feed.filter(
    i => i.status === 'pending' && (i.priority === 'critical' || i.priority === 'high')
  );

  useEffect(() => {
    setPushEnabled(Notification.permission === 'granted');
  }, []);

  const enablePush = async () => {
    const perm = await Notification.requestPermission();
    setPushEnabled(perm === 'granted');
    if (perm === 'granted') {
      new Notification('✅ OmniPulse alerts enabled', {
        body: 'You will now receive reminders until each item is marked done.',
        icon: '/favicon.svg',
      });
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-2xl">
      <div>
        <h2 className="text-xl font-semibold">Notifications</h2>
        <p className="text-sm text-muted mt-1">Manage how OmniPulse reminds you until things are done</p>
      </div>

      {/* ── How it works ── */}
      <div className="card p-4 space-y-3 border-blue/20">
        <div className="text-sm font-semibold text-blue">How reminders work</div>
        <div className="space-y-2 text-xs text-muted">
          <div className="flex items-start gap-2">
            <span className="text-danger font-mono shrink-0">🔴</span>
            <span><strong className="text-foreground">Critical items</strong> — browser notification every 5 minutes with audio chime. Notification stays on screen until you click it.</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-warning font-mono shrink-0">🟠</span>
            <span><strong className="text-foreground">High priority items</strong> — browser notification every 15 minutes.</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-success shrink-0">✓</span>
            <span><strong className="text-foreground">Reminders stop immediately</strong> when you tick the item as done — from any page.</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-muted shrink-0">⏰</span>
            <span>You can also <strong className="text-foreground">Snooze</strong> an item for 15min, 1h, 3h, or Tomorrow.</span>
          </div>
        </div>
      </div>

      {/* ── Alert Channels ── */}
      <section className="space-y-3">
        <h3 className="section-title">Alert Channels</h3>

        {/* Browser Push */}
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className={cn('p-2.5 rounded-lg', pushEnabled ? 'bg-blue/10 text-blue' : 'bg-card text-muted')}>
              {pushEnabled ? <Bell size={16} /> : <BellOff size={16} />}
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium">Browser Push Notifications</div>
              <div className="text-xs text-muted">
                {pushEnabled
                  ? 'Active — notifications will fire even when the tab is in background'
                  : 'Not enabled — click to allow so OmniPulse can remind you in the background'}
              </div>
            </div>
            {pushEnabled ? (
              <span className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-success bg-success/10 border border-success/20 rounded-md">
                <Check size={12} /> Active
              </span>
            ) : (
              <button onClick={enablePush} className="btn-primary text-xs">
                <Bell size={12} /> Enable
              </button>
            )}
          </div>
        </div>

        {/* Sound */}
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className={cn('p-2.5 rounded-lg', soundEnabled ? 'bg-blue/10 text-blue' : 'bg-card text-muted')}>
              {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium">Audio Chime</div>
              <div className="text-xs text-muted">Plays a 3-tone chime for critical items</div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={playChime} className="btn-ghost text-xs py-1.5 px-3">
                <Volume2 size={12} /> Test
              </button>
              <button
                onClick={() => setSoundEnabled(s => !s)}
                className={cn('px-3 py-1.5 rounded-md text-xs font-medium border transition-colors',
                  soundEnabled
                    ? 'bg-success/10 text-success border-success/20 hover:bg-success/20'
                    : 'bg-card text-muted border-border hover:text-foreground'
                )}
              >
                {soundEnabled ? <><Check size={11} className="inline mr-1" />On</> : 'Enable'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Active Reminders ── */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="section-title">Active Reminders</h3>
          <span className="text-xs text-muted">{activeReminders.length} items being tracked</span>
        </div>

        {activeReminders.length === 0 ? (
          <div className="card p-8 text-center">
            <Check size={24} className="text-success mx-auto mb-2" />
            <div className="text-sm font-medium">All clear!</div>
            <div className="text-xs text-muted mt-1">No active reminders — all critical/high items are resolved</div>
          </div>
        ) : (
          <div className="space-y-2">
            {activeReminders.map(item => <ReminderScheduleRow key={item.id} item={item} />)}
          </div>
        )}
      </section>

      {/* ── Reminder Schedule ── */}
      <section className="space-y-3">
        <h3 className="section-title">Reminder Schedule</h3>
        <div className="card p-4 space-y-3">
          {[
            { label: 'Critical items', interval: 'Every 5 minutes', color: 'text-danger', bg: 'bg-danger/10' },
            { label: 'High priority', interval: 'Every 15 minutes', color: 'text-warning', bg: 'bg-warning/10' },
            { label: 'Contests (30 min before)', interval: 'Single reminder', color: 'text-purple', bg: 'bg-purple/10' },
          ].map(row => (
            <div key={row.label} className="flex items-center justify-between py-1.5">
              <div className="flex items-center gap-2">
                <div className={cn('w-2 h-2 rounded-full', row.bg, 'border', row.color.replace('text-', 'border-'))} />
                <span className="text-sm text-foreground">{row.label}</span>
              </div>
              <span className={cn('text-xs font-medium', row.color)}>{row.interval}</span>
            </div>
          ))}
          <div className="pt-2 border-t border-border text-xs text-muted">
            All reminders stop immediately when you tick ✓ the item as done.
          </div>
        </div>
      </section>
    </div>
  );
}
