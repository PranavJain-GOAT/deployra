// OmniPulse Types

export type Priority = 'critical' | 'high' | 'medium' | 'low';
export type ItemSource = 'email' | 'whatsapp' | 'codeforces' | 'leetcode' | 'codechef' | 'atcoder' | 'manual';
export type ItemStatus = 'pending' | 'done' | 'snoozed' | 'dismissed';
export type ContestPlatform = 'codeforces' | 'leetcode' | 'codechef' | 'atcoder' | 'hackerrank' | 'hackerearth';

export interface FeedItem {
  id: string;
  title: string;
  summary: string;
  body?: string;
  source: ItemSource;
  priority: Priority;
  status: ItemStatus;
  url?: string;
  deadline?: Date | null;
  extractedDates: string[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Contest {
  id: string;
  name: string;
  platform: ContestPlatform;
  url: string;
  startTime: Date;
  endTime: Date;
  durationSeconds: number;
  isRegistered: boolean;
  reminderSet: boolean;
}

export interface Deadline {
  id: string;
  title: string;
  description?: string;
  dueAt: Date;
  source: ItemSource;
  sourceItemId?: string;
  priority: Priority;
  status: ItemStatus;
  tags: string[];
  createdAt: Date;
}

export interface ParsedIntent {
  hasDeadline: boolean;
  extractedDate?: Date;
  extractedDateText?: string;
  priority: Priority;
  category: string;
  tags: string[];
  isCritical: boolean;
  isImportant: boolean;
  summary: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
