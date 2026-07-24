import { Request, Response } from 'express';
import { parseIntent, extractDeadlineDate } from '../utils/textParser';
import { v4 as uuid } from 'uuid';
import { Deadline } from '../types';

const MOCK_DEADLINES: Deadline[] = [
  { id: uuid(), title: 'GATE 2025 Registration', dueAt: new Date(Date.now() + 10 * 86400000), source: 'email', priority: 'high', status: 'pending', tags: ['exam'], createdAt: new Date() },
  { id: uuid(), title: 'Assignment 3 Submission', dueAt: new Date(Date.now() + 2 * 86400000), source: 'whatsapp', priority: 'high', status: 'pending', tags: ['assignment'], createdAt: new Date() },
  { id: uuid(), title: 'Google OA Attempt', dueAt: new Date(new Date().setHours(23, 59, 0, 0)), source: 'email', priority: 'critical', status: 'pending', tags: ['placement', 'interview'], createdAt: new Date() },
  { id: uuid(), title: 'Cultural Fest Google Form', dueAt: new Date(new Date().setHours(22, 0, 0, 0)), source: 'whatsapp', priority: 'medium', status: 'pending', tags: ['form'], createdAt: new Date() },
  { id: uuid(), title: 'Microsoft Intern Application', dueAt: new Date(Date.now() + 3 * 86400000), source: 'email', priority: 'high', status: 'pending', tags: ['placement', 'internship'], createdAt: new Date() },
];

export function getDeadlines(req: Request, res: Response) {
  const { status } = req.query;
  const filtered = status ? MOCK_DEADLINES.filter(d => d.status === status) : MOCK_DEADLINES;
  const sorted = [...filtered].sort((a, b) => a.dueAt.getTime() - b.dueAt.getTime());
  res.json({ success: true, data: sorted, count: sorted.length });
}

export function createDeadline(req: Request, res: Response) {
  const { title, text, dueAt } = req.body as { title: string; text?: string; dueAt?: string };
  if (!title) { res.status(400).json({ success: false, error: 'title is required' }); return; }
  const parsed = text ? parseIntent(text) : null;
  const deadline: Deadline = {
    id: uuid(),
    title,
    dueAt: dueAt ? new Date(dueAt) : (text ? extractDeadlineDate(text) ?? new Date(Date.now() + 86400000) : new Date(Date.now() + 86400000)),
    source: 'manual',
    priority: parsed?.priority ?? 'medium',
    status: 'pending',
    tags: parsed?.tags ?? [],
    createdAt: new Date(),
  };
  MOCK_DEADLINES.push(deadline);
  res.status(201).json({ success: true, data: deadline });
}

export function updateDeadline(req: Request, res: Response) {
  const { id } = req.params;
  const deadline = MOCK_DEADLINES.find(d => d.id === id);
  if (!deadline) { res.status(404).json({ success: false, error: 'Deadline not found' }); return; }
  Object.assign(deadline, req.body);
  res.json({ success: true, data: deadline });
}
