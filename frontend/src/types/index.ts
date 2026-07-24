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
  deadline?: string | null;
  extractedDates: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Contest {
  id: string;
  name: string;
  platform: ContestPlatform;
  url: string;
  startTime: string;
  endTime: string;
  durationSeconds: number;
  isRegistered: boolean;
  reminderSet: boolean;
}

export interface Deadline {
  id: string;
  title: string;
  description?: string;
  dueAt: string;
  source: ItemSource;
  priority: Priority;
  status: ItemStatus;
  tags: string[];
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  count?: number;
  error?: string;
}
