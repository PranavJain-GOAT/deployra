import { FeedItem, Priority, ItemSource } from '../types';
import { parseIntent } from '../utils/textParser';
import { v4 as uuid } from 'uuid';

// ── Mock feed data (replaces DB when Prisma isn't connected) ─────────────────
export const MOCK_FEED_ITEMS: FeedItem[] = [
  {
    id: uuid(),
    title: 'Google OA Link Expires Tonight at 11:59 PM',
    summary: 'You have received an Online Assessment link from Google that expires tonight. Complete it before midnight.',
    body: 'Dear Candidate, please find your OA link below. The link expires at 11:59 PM today. Failure to attempt will disqualify you.',
    source: 'email',
    priority: 'critical',
    status: 'pending',
    url: 'https://mail.google.com',
    deadline: new Date(new Date().setHours(23, 59, 0, 0)),
    extractedDates: ['tonight at 11:59 PM'],
    tags: ['interview', 'placement', 'deadline'],
    createdAt: new Date(Date.now() - 30 * 60 * 1000),
    updatedAt: new Date(),
  },
  {
    id: uuid(),
    title: 'Assignment 3 Submission Due — Extended to Monday',
    summary: 'Prof. Sharma extended Assignment 3 deadline to Monday 11:59 PM. Update your existing reminder.',
    source: 'whatsapp',
    priority: 'high',
    status: 'pending',
    deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    extractedDates: ['Monday'],
    tags: ['assignment', 'deadline'],
    createdAt: new Date(Date.now() - 60 * 60 * 1000),
    updatedAt: new Date(),
  },
  {
    id: uuid(),
    title: 'Internship Application — Microsoft SWE Intern',
    summary: 'Microsoft India is hiring SWE interns. Apply before Friday. Resume shortlisting starts Monday.',
    source: 'email',
    priority: 'high',
    status: 'pending',
    url: 'https://careers.microsoft.com',
    deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    extractedDates: ['before Friday'],
    tags: ['placement', 'internship', 'deadline'],
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    updatedAt: new Date(),
  },
  {
    id: uuid(),
    title: 'Fill the Cultural Fest Registration Form',
    summary: 'Google Form for cultural fest closes tomorrow. Link shared in WhatsApp group.',
    source: 'whatsapp',
    priority: 'medium',
    status: 'pending',
    deadline: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    extractedDates: ['tomorrow'],
    tags: ['form', 'deadline'],
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
    updatedAt: new Date(),
  },
  {
    id: uuid(),
    title: 'GATE 2025 Registration Closes Jan 15',
    summary: 'GATE 2025 registration deadline is January 15. Late fee applies after January 10.',
    source: 'email',
    priority: 'high',
    status: 'pending',
    deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    extractedDates: ['January 15'],
    tags: ['exam', 'deadline', 'form'],
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    updatedAt: new Date(),
  },
  {
    id: uuid(),
    title: 'Amazon SDE Intern Interview Scheduled Tomorrow 10 AM',
    summary: 'Your Amazon SDE intern interview is scheduled for tomorrow at 10:00 AM IST. Join via the link in email.',
    source: 'email',
    priority: 'critical',
    status: 'pending',
    deadline: new Date(Date.now() + 20 * 60 * 60 * 1000),
    extractedDates: ['tomorrow', '10 AM'],
    tags: ['interview', 'placement'],
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
    updatedAt: new Date(),
  },
];

export function scoreFeedItems(items: FeedItem[]): FeedItem[] {
  const priorityOrder: Record<Priority, number> = { critical: 4, high: 3, medium: 2, low: 1 };
  return [...items].sort((a, b) => {
    const scoreDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
    if (scoreDiff !== 0) return scoreDiff;
    // Sooner deadlines first
    if (a.deadline && b.deadline) return a.deadline.getTime() - b.deadline.getTime();
    if (a.deadline) return -1;
    if (b.deadline) return 1;
    return b.createdAt.getTime() - a.createdAt.getTime();
  });
}

export function buildFeedItem(text: string, source: ItemSource, title?: string): FeedItem {
  const parsed = parseIntent(text);
  return {
    id: uuid(),
    title: title || parsed.summary.slice(0, 80),
    summary: parsed.summary,
    body: text,
    source,
    priority: parsed.priority,
    status: 'pending',
    deadline: parsed.hasDeadline ? (new Date()) : null,
    extractedDates: parsed.extractedDateText ? [parsed.extractedDateText] : [],
    tags: parsed.tags,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export function getUnifiedFeed(): FeedItem[] {
  return scoreFeedItems(MOCK_FEED_ITEMS.filter(i => i.status === 'pending'));
}
