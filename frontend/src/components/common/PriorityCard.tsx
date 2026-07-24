import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Check, Clock, X, MessageSquare, Mail, Trophy, ChevronDown, ChevronUp, Bell } from 'lucide-react';
import { FeedItem } from '@/types';
import { cn, PRIORITY_CONFIG, SOURCE_ICONS, formatRelativeTime, formatDeadline, getCountdown, isUrgent } from '@/lib/utils';
import { useMarkDone, useSnooze, useDismiss } from '@/hooks/useFeed';
import toast from 'react-hot-toast';

// ── Build "View Original" URL for each source ────────────────────────────────
function getSourceUrl(item: FeedItem): { label: string; url: string } | null {
  if (item.url) {
    if (item.source === 'email') return { label: 'Open in Gmail', url: item.url };
    if (item.source === 'whatsapp') return { label: 'Open WhatsApp', url: item.url };
    return { label: 'Open', url: item.url };
  }
  if (item.source === 'email') return { label: 'Open Gmail', url: 'https://mail.google.com' };
  if (item.source === 'whatsapp') return { label: 'View in WhatsApp', url: 'https://web.whatsapp.com' };
  if (item.source === 'codeforces') return { label: 'Open Codeforces', url: 'https://codeforces.com' };
  if (item.source === 'leetcode') return { label: 'Open LeetCode', url: 'https://leetcode.com/contest' };
  if (item.source === 'codechef') return { label: 'Open CodeChef', url: 'https://codechef.com' };
  if (item.source === 'atcoder') return { label: 'Open AtCoder', url: 'https://atcoder.jp' };
  return null;
}

function SourceIcon({ source }: { source: string }) {
  if (source === 'whatsapp') return <MessageSquare size={13} className="text-success" />;
  if (source === 'email') return <Mail size={13} className="text-blue" />;
  if (source === 'codeforces' || source === 'leetcode' || source === 'codechef' || source === 'atcoder') return <Trophy size={13} className="text-warning" />;
  return <span className="text-sm">{SOURCE_ICONS[source] ?? '📌'}</span>;
}

interface PriorityCardProps {
  item: FeedItem;
  compact?: boolean;
}

export default function PriorityCard({ item, compact = false }: PriorityCardProps) {
  const [countdown, setCountdown] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [justDone, setJustDone] = useState(false);
  const markDone = useMarkDone();
  const snooze = useSnooze();
  const dismiss = useDismiss();

  const cfg = PRIORITY_CONFIG[item.priority];
  const urgent = isUrgent(item.deadline);
  const sourceLink = getSourceUrl(item);

  useEffect(() => {
    if (!item.deadline) return;
    const update = () => setCountdown(getCountdown(item.deadline!));
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [item.deadline]);

  const handleDone = () => {
    setJustDone(true);
    setTimeout(() => markDone.mutate(item.id), 400);
    toast.success('✓ Done! Reminder stopped.');
  };

  const handleSnooze = (minutes: number) => {
    snooze.mutate({ id: item.id, minutes });
    toast(`⏰ Reminder in ${minutes >= 60 ? `${minutes / 60}h` : `${minutes}m`}`, { icon: '⏰' });
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: justDone ? 0.4 : 1, y: 0, scale: justDone ? 0.98 : 1 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.25 }}
      className={cn(
        'card transition-all duration-200 group border-l-2',
        item.priority === 'critical' ? 'border-l-danger' :
        item.priority === 'high'     ? 'border-l-warning' :
        item.priority === 'medium'   ? 'border-l-blue' :
                                       'border-l-border'
      )}
    >
      <div className="p-4">
        {/* Top row */}
        <div className="flex items-start gap-3">
          {/* ── BIG TICK BUTTON ── */}
          <button
            onClick={handleDone}
            disabled={justDone}
            className={cn(
              'w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5',
              'transition-all duration-200 hover:scale-110',
              justDone
                ? 'bg-success border-success text-white'
                : item.priority === 'critical'
                  ? 'border-danger hover:bg-danger hover:border-danger hover:text-white'
                  : item.priority === 'high'
                    ? 'border-warning hover:bg-warning hover:border-warning hover:text-white'
                    : 'border-border hover:bg-success hover:border-success hover:text-white'
            )}
            title="Mark done — stops all reminders"
          >
            {justDone && <Check size={12} strokeWidth={3} />}
          </button>

          <div className="flex-1 min-w-0">
            {/* Meta row */}
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <span className={cn('badge', `badge-${item.priority}`)}>{cfg.label}</span>

              {/* Source with icon */}
              <span className="flex items-center gap-1 text-xs text-muted">
                <SourceIcon source={item.source} />
                <span className="capitalize">{item.source}</span>
              </span>

              {/* Urgent countdown badge */}
              {urgent && item.deadline && (
                <span className="badge bg-danger/20 text-danger border border-danger/30 font-mono animate-pulse">
                  ⏳ {countdown}
                </span>
              )}

              {/* Reminder active indicator */}
              {(item.priority === 'critical' || item.priority === 'high') && item.status === 'pending' && (
                <span className="flex items-center gap-1 text-[10px] text-muted bg-secondary border border-border px-1.5 py-0.5 rounded-full">
                  <Bell size={9} className="text-blue" />
                  Reminding until done
                </span>
              )}
            </div>

            {/* Title */}
            <h3 className="text-sm font-semibold text-foreground leading-snug">{item.title}</h3>

            {/* Summary */}
            <p className="text-xs text-muted leading-relaxed mt-1 line-clamp-2">{item.summary}</p>

            {/* Deadline */}
            {item.deadline && (
              <div className="flex items-center gap-1.5 mt-2">
                <Clock size={11} className="text-muted shrink-0" />
                <span className={cn('text-xs', urgent ? 'text-danger font-medium' : 'text-muted')}>
                  {formatDeadline(item.deadline)}
                </span>
                {!urgent && countdown && countdown !== 'Expired' && (
                  <span className="text-xs text-muted font-mono">· {countdown}</span>
                )}
                {countdown === 'Expired' && (
                  <span className="text-xs text-danger font-medium">· Expired</span>
                )}
              </div>
            )}

            {/* Tags */}
            {item.tags.length > 0 && (
              <div className="flex gap-1.5 mt-2 flex-wrap">
                {item.tags.slice(0, 4).map(tag => (
                  <span key={tag} className="px-1.5 py-0.5 text-[10px] bg-secondary border border-border rounded text-muted capitalize">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Dismiss × */}
          <button
            onClick={() => dismiss.mutate(item.id)}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-card text-muted hover:text-foreground shrink-0"
            title="Dismiss"
          >
            <X size={12} />
          </button>
        </div>

        {/* ── ACTION BAR ── */}
        {!compact && (
          <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-border flex-wrap">
            {/* Mark Done — primary action */}
            <button
              onClick={handleDone}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-success/10 text-success hover:bg-success/20 border border-success/20 transition-colors"
            >
              <Check size={12} strokeWidth={2.5} /> Mark Done
            </button>

            {/* View Original — most important */}
            {sourceLink && (
              <a
                href={sourceLink.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-blue/10 text-blue hover:bg-blue/20 border border-blue/20 transition-colors"
              >
                <SourceIcon source={item.source} />
                {sourceLink.label}
                <ExternalLink size={10} />
              </a>
            )}

            {/* Snooze dropdown */}
            <div className="relative group/snooze">
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-muted hover:text-foreground hover:bg-card border border-transparent hover:border-border transition-colors">
                <Clock size={12} /> Snooze
                <ChevronDown size={10} />
              </button>
              <div className="absolute left-0 top-full mt-1 bg-card border border-border rounded-lg shadow-soft overflow-hidden z-20 hidden group-hover/snooze:block min-w-[120px]">
                {[
                  { label: '15 minutes', min: 15 },
                  { label: '1 hour', min: 60 },
                  { label: '3 hours', min: 180 },
                  { label: 'Tomorrow', min: 1440 },
                ].map(opt => (
                  <button
                    key={opt.min}
                    onClick={() => handleSnooze(opt.min)}
                    className="w-full text-left px-3 py-2 text-xs text-muted hover:text-foreground hover:bg-secondary transition-colors"
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Expand body */}
            {item.body && (
              <button
                onClick={() => setExpanded(e => !e)}
                className="ml-auto flex items-center gap-1 text-xs text-muted hover:text-foreground transition-colors"
              >
                {expanded ? <><ChevronUp size={12} /> Less</> : <><ChevronDown size={12} /> Full message</>}
              </button>
            )}
          </div>
        )}

        {/* Expanded body */}
        {expanded && item.body && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 pt-3 border-t border-border"
          >
            <p className="text-xs text-muted leading-relaxed whitespace-pre-wrap font-mono bg-secondary p-3 rounded-md">
              {item.body}
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
