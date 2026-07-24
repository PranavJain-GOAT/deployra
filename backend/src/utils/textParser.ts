import { ParsedIntent, Priority } from '../types';

// ─── Critical keywords that auto-escalate priority ───────────────────────────
const CRITICAL_PATTERNS = [
  /oa\s*(link|expires?|closes?|tonight|today)/i,
  /interview\s*(tomorrow|today|tonight|scheduled)/i,
  /deadline\s*(tonight|today|now|expired?)/i,
  /last\s*(date|day|chance)/i,
  /expires?\s*(tonight|today|in\s*\d+\s*hours?)/i,
  /closes?\s*(tonight|today)/i,
  /submit\s*before\s*(11:59|midnight|tonight)/i,
  /fee\s*payment\s*(due|today|tonight)/i,
  /urgent/i,
  /asap/i,
  /immediately/i,
];

const HIGH_PATTERNS = [
  /interview/i,
  /online\s*assessment/i,
  /\bOA\b/,
  /internship\s*(offer|selected|shortlisted)/i,
  /placement/i,
  /shortlisted/i,
  /selected/i,
  /offer\s*letter/i,
  /google\s*form\s*(closes?|deadline|due)/i,
  /registration\s*(closes?|deadline|due)/i,
  /apply\s*before/i,
  /deadline/i,
  /due\s*(date|by|on)/i,
  /submission\s*(deadline|due)/i,
  /exam/i,
  /scholarship/i,
];

const MEDIUM_PATTERNS = [
  /assignment/i,
  /project\s*(submission|deadline|due)/i,
  /fill\s*(this|the)?\s*(form|google\s*form)/i,
  /register/i,
  /contest/i,
  /competition/i,
  /hackathon/i,
  /workshop/i,
  /webinar/i,
  /meeting/i,
];

const IGNORE_PATTERNS = [
  /promo(tion)?s?/i,
  /unsubscribe/i,
  /newsletter/i,
  /sale\s*(off|today|now)/i,
  /discount/i,
  /coupon/i,
  /click\s*here\s*to\s*buy/i,
  /limited\s*time\s*offer/i,
];

// ─── Date extraction patterns ─────────────────────────────────────────────────
const DATE_PATTERNS = [
  // "before Friday", "by Monday"
  { re: /\b(before|by)\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/gi, type: 'weekday' },
  // "tonight", "today", "tomorrow"
  { re: /\b(tonight|today|tomorrow)\b/gi, type: 'relative' },
  // "11:59 PM", "23:59"
  { re: /\b(\d{1,2}:\d{2}\s*(AM|PM)?)\b/gi, type: 'time' },
  // "January 15", "15 Jan", "Jan 15, 2025"
  { re: /\b(\d{1,2}\s+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*|\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s+\d{1,2}(?:,\s*\d{4})?)\b/gi, type: 'date' },
  // "in 2 hours", "in 30 minutes"
  { re: /\bin\s+(\d+)\s+(hour|minute|day)s?\b/gi, type: 'relative_duration' },
  // "closes tomorrow", "deadline is Friday"
  { re: /(?:close[sd]?|deadline|due|expires?|submit)\s+(?:on\s+|by\s+|before\s+)?([A-Za-z]+\s*\d*)/gi, type: 'contextual' },
];

const TAGS_MAP: Record<string, string[]> = {
  placement: ['placement', 'internship', 'job', 'offer', 'selected', 'shortlisted', 'hr', 'recruiter'],
  contest: ['contest', 'codeforces', 'leetcode', 'codechef', 'atcoder', 'competitive', 'hackathon', 'coding'],
  assignment: ['assignment', 'homework', 'lab', 'submission', 'project'],
  deadline: ['deadline', 'due', 'last date', 'closes', 'expires', 'before', 'submit'],
  exam: ['exam', 'quiz', 'test', 'viva', 'midsem', 'endsem'],
  form: ['form', 'google form', 'registration', 'apply', 'application'],
  scholarship: ['scholarship', 'fellowship', 'grant', 'stipend'],
  interview: ['interview', 'oa', 'online assessment', 'technical round', 'hr round'],
};

export function parseIntent(text: string): ParsedIntent {
  const lower = text.toLowerCase();

  // Check if spam/promo
  if (IGNORE_PATTERNS.some(p => p.test(text))) {
    return { hasDeadline: false, priority: 'low', category: 'spam', tags: [], isCritical: false, isImportant: false, summary: text.slice(0, 100) };
  }

  const isCritical = CRITICAL_PATTERNS.some(p => p.test(text));
  const isHigh = HIGH_PATTERNS.some(p => p.test(text));
  const isMedium = MEDIUM_PATTERNS.some(p => p.test(text));

  let priority: Priority = 'low';
  if (isCritical) priority = 'critical';
  else if (isHigh) priority = 'high';
  else if (isMedium) priority = 'medium';

  // Extract dates
  const extractedDates: string[] = [];
  for (const { re } of DATE_PATTERNS) {
    re.lastIndex = 0;
    const matches = [...text.matchAll(re)];
    matches.forEach(m => extractedDates.push(m[0]));
  }

  const hasDeadline = extractedDates.length > 0 || /deadline|due|closes?|expires?|submit|last\s*date/i.test(text);

  // Detect tags
  const tags: string[] = [];
  for (const [category, keywords] of Object.entries(TAGS_MAP)) {
    if (keywords.some(kw => lower.includes(kw))) {
      tags.push(category);
    }
  }

  // Detect category
  let category = 'general';
  if (tags.includes('placement') || tags.includes('interview')) category = 'placement';
  else if (tags.includes('contest')) category = 'contest';
  else if (tags.includes('assignment')) category = 'assignment';
  else if (tags.includes('exam')) category = 'exam';
  else if (tags.includes('form') || tags.includes('deadline')) category = 'deadline';
  else if (tags.includes('scholarship')) category = 'scholarship';

  // Generate summary (first 150 chars, cleaned)
  const summary = text.replace(/\s+/g, ' ').trim().slice(0, 150);

  return {
    hasDeadline,
    extractedDateText: extractedDates[0],
    priority,
    category,
    tags: [...new Set(tags)],
    isCritical,
    isImportant: isCritical || isHigh,
    summary,
  };
}

export function extractDeadlineDate(text: string): Date | null {
  const now = new Date();
  const lower = text.toLowerCase();

  if (/tonight/i.test(text)) {
    const d = new Date(now); d.setHours(23, 59, 0, 0); return d;
  }
  if (/today/i.test(text)) {
    const d = new Date(now); d.setHours(23, 59, 0, 0); return d;
  }
  if (/tomorrow/i.test(text)) {
    const d = new Date(now); d.setDate(d.getDate() + 1); d.setHours(23, 59, 0, 0); return d;
  }

  // "in X hours"
  const inHours = lower.match(/in\s+(\d+)\s+hours?/);
  if (inHours) {
    const d = new Date(now); d.setHours(d.getHours() + parseInt(inHours[1])); return d;
  }

  // "by Monday", "before Friday"
  const days = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
  const weekdayMatch = lower.match(/(?:by|before)\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i);
  if (weekdayMatch) {
    const targetDay = days.indexOf(weekdayMatch[1].toLowerCase());
    const d = new Date(now);
    const currentDay = d.getDay();
    const diff = (targetDay - currentDay + 7) % 7 || 7;
    d.setDate(d.getDate() + diff); d.setHours(23, 59, 0, 0); return d;
  }

  return null;
}
