import { Request, Response } from 'express';
import { getUnifiedFeed } from '../services/feed.service';
import { getImportantEmails } from '../services/email.service';
import { getImportantMessages } from '../services/whatsapp.service';
import { MOCK_FEED_ITEMS } from '../services/feed.service';

export function getFeed(req: Request, res: Response) {
  const feed = getUnifiedFeed();
  res.json({ success: true, data: feed, count: feed.length });
}

export function getEmailFeed(req: Request, res: Response) {
  const emails = getImportantEmails();
  res.json({ success: true, data: emails, count: emails.length });
}

export function getWhatsAppFeed(req: Request, res: Response) {
  const messages = getImportantMessages();
  res.json({ success: true, data: messages, count: messages.length });
}

export function markDone(req: Request, res: Response) {
  const { id } = req.params;
  const item = MOCK_FEED_ITEMS.find(i => i.id === id);
  if (!item) { res.status(404).json({ success: false, error: 'Item not found' }); return; }
  item.status = 'done';
  item.updatedAt = new Date();
  res.json({ success: true, data: item });
}

export function snoozeItem(req: Request, res: Response) {
  const { id } = req.params;
  const { minutes = 60 } = req.body as { minutes?: number };
  const item = MOCK_FEED_ITEMS.find(i => i.id === id);
  if (!item) { res.status(404).json({ success: false, error: 'Item not found' }); return; }
  item.status = 'snoozed';
  item.updatedAt = new Date();
  res.json({ success: true, data: item, snoozedUntil: new Date(Date.now() + minutes * 60 * 1000) });
}

export function dismissItem(req: Request, res: Response) {
  const { id } = req.params;
  const item = MOCK_FEED_ITEMS.find(i => i.id === id);
  if (!item) { res.status(404).json({ success: false, error: 'Item not found' }); return; }
  item.status = 'dismissed';
  item.updatedAt = new Date();
  res.json({ success: true, data: item });
}
