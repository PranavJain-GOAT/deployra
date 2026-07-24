import { useState, useEffect } from 'react';
import { ExternalLink, Bell, BellOff, ExternalLink as LinkIcon } from 'lucide-react';
import { Contest } from '@/types';
import { cn, getCountdown, PLATFORM_COLORS } from '@/lib/utils';
import { format } from 'date-fns';

const PLATFORM_LABELS: Record<string, string> = {
  codeforces: 'Codeforces',
  leetcode:   'LeetCode',
  codechef:   'CodeChef',
  atcoder:    'AtCoder',
  hackerrank: 'HackerRank',
  hackerearth:'HackerEarth',
};

const PLATFORM_REGISTER_URLS: Record<string, (url: string) => string> = {
  codeforces: (url) => url,
  leetcode:   (url) => url,
  codechef:   (url) => url,
  atcoder:    (url) => url,
};

interface ContestCardProps {
  contest: Contest;
}

export default function ContestCard({ contest }: ContestCardProps) {
  const [countdown, setCountdown] = useState(getCountdown(contest.startTime));
  const [reminded, setReminded] = useState(contest.reminderSet);
  const started = new Date(contest.startTime) <= new Date();
  const ended = new Date(contest.endTime) <= new Date();
  const color = PLATFORM_COLORS[contest.platform] ?? '#3B82F6';
  const durationH = Math.floor(contest.durationSeconds / 3600);
  const durationM = Math.floor((contest.durationSeconds % 3600) / 60);

  const hoursUntil = (new Date(contest.startTime).getTime() - Date.now()) / 3_600_000;
  const isVerySoon = hoursUntil > 0 && hoursUntil < 2;
  const isToday = hoursUntil > 0 && hoursUntil < 24;

  useEffect(() => {
    const timer = setInterval(() => setCountdown(getCountdown(contest.startTime)), 1000);
    return () => clearInterval(timer);
  }, [contest.startTime]);

  const handleReminder = () => {
    const next = !reminded;
    setReminded(next);
    if (next && 'Notification' in window) {
      Notification.requestPermission().then(perm => {
        if (perm === 'granted') {
          // Schedule a notification 30min before contest
          const msBefore = new Date(contest.startTime).getTime() - Date.now() - 30 * 60 * 1000;
          if (msBefore > 0) {
            setTimeout(() => {
              new Notification(`🏆 Contest starts in 30 min!`, {
                body: `${contest.name}\nClick to open → ${contest.url}`,
                icon: '/favicon.svg',
                requireInteraction: true,
              });
            }, msBefore);
          }
        }
      });
    }
  };

  if (ended) return null;

  return (
    <div className={cn(
      'card p-4 transition-all duration-200 group',
      isVerySoon ? 'border-warning/40' : 'hover:border-zinc-600',
    )}>
      <div className="flex items-start gap-3">
        {/* Platform color dot */}
        <div
          className="w-2.5 h-2.5 rounded-full mt-1 shrink-0"
          style={{ backgroundColor: color }}
        />

        <div className="flex-1 min-w-0">
          {/* Platform + duration + badges */}
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-xs font-semibold" style={{ color }}>{PLATFORM_LABELS[contest.platform]}</span>
            <span className="text-zinc-600 text-xs">·</span>
            <span className="text-xs text-muted">
              {durationH > 0 ? `${durationH}h` : ''}{durationM > 0 ? ` ${durationM}m` : ''}
            </span>
            {contest.isRegistered && (
              <span className="badge bg-success/10 text-success border border-success/20 text-[10px]">✓ Registered</span>
            )}
            {started && !ended && (
              <span className="badge bg-danger/15 text-danger border border-danger/25 text-[10px] animate-pulse">🔴 Live</span>
            )}
            {isVerySoon && (
              <span className="badge bg-warning/15 text-warning border border-warning/25 text-[10px]">⚡ Starting soon</span>
            )}
          </div>

          {/* Contest name */}
          <h3 className="text-sm font-semibold text-foreground leading-snug mb-2">{contest.name}</h3>

          {/* Start time */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted">
              {started
                ? `Ends ${format(new Date(contest.endTime), 'h:mm a')}`
                : format(new Date(contest.startTime), 'MMM d · h:mm a')}
            </span>
            {!started && (
              <span className={cn(
                'text-xs font-mono font-semibold tabular-nums',
                isVerySoon ? 'text-warning' : isToday ? 'text-foreground' : 'text-muted'
              )}>
                {countdown}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Reminder bell */}
          <button
            onClick={handleReminder}
            className={cn(
              'p-1.5 rounded-md transition-all',
              reminded ? 'text-blue bg-blue/10 hover:bg-blue/15' : 'text-muted hover:text-foreground hover:bg-card'
            )}
            title={reminded ? 'Reminder set — click to remove' : 'Set reminder (30min before)'}
          >
            {reminded ? <Bell size={14} fill="currentColor" /> : <Bell size={14} />}
          </button>
        </div>
      </div>

      {/* ── Action buttons row ── */}
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
        {/* Go to contest — most important CTA */}
        <a
          href={contest.url}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors',
            started
              ? 'bg-danger/10 text-danger hover:bg-danger/20 border border-danger/20'
              : contest.isRegistered
                ? 'bg-success/10 text-success hover:bg-success/20 border border-success/20'
                : 'bg-blue/10 text-blue hover:bg-blue/20 border border-blue/20'
          )}
        >
          <ExternalLink size={11} />
          {started ? 'Join Now' : contest.isRegistered ? 'View Contest' : 'Register →'}
        </a>

        {/* Platform home link */}
        <a
          href={contest.url.split('/contest')[0] || contest.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-muted hover:text-foreground transition-colors flex items-center gap-1 ml-auto"
        >
          {PLATFORM_LABELS[contest.platform]}
          <ExternalLink size={10} />
        </a>
      </div>
    </div>
  );
}
