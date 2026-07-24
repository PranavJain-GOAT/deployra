import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow, isPast, isToday } from 'date-fns';
import { Priority } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRelativeTime(date: string | Date) {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function formatDeadline(date: string | Date) {
  const d = new Date(date);
  if (isToday(d)) return `Today ${format(d, 'h:mm a')}`;
  return format(d, 'MMM d, h:mm a');
}

export function getCountdown(date: string | Date): string {
  const target = new Date(date).getTime();
  const now = Date.now();
  const diff = target - now;
  if (diff <= 0) return 'Expired';
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  const s = Math.floor((diff % 60_000) / 1_000);
  if (h > 24) return `${Math.floor(h / 24)}d ${h % 24}h`;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function isUrgent(deadline: string | null | undefined): boolean {
  if (!deadline) return false;
  const diff = new Date(deadline).getTime() - Date.now();
  return diff > 0 && diff < 3 * 60 * 60 * 1000; // < 3h
}

export function isExpired(deadline: string | null | undefined): boolean {
  if (!deadline) return false;
  return isPast(new Date(deadline));
}

export const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; bg: string; border: string }> = {
  critical: { label: 'Critical', color: 'text-danger', bg: 'bg-danger/10', border: 'border-danger/30' },
  high:     { label: 'High',     color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/30' },
  medium:   { label: 'Medium',   color: 'text-blue',    bg: 'bg-blue/10',    border: 'border-blue/30' },
  low:      { label: 'Low',      color: 'text-muted',   bg: 'bg-border',     border: 'border-border' },
};

export const SOURCE_ICONS: Record<string, string> = {
  email:      '📩',
  whatsapp:   '💬',
  codeforces: '🏆',
  leetcode:   '🟠',
  codechef:   '👨‍🍳',
  atcoder:    '🟣',
  manual:     '📝',
};

export const PLATFORM_COLORS: Record<string, string> = {
  codeforces: '#1A73E8',
  leetcode:   '#F89F1B',
  codechef:   '#5B4638',
  atcoder:    '#222',
  hackerrank: '#2EC866',
  hackerearth:'#323754',
};
