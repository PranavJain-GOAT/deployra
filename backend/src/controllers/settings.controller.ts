import { Request, Response } from 'express';

interface Settings {
  connections: {
    gmail: { connected: boolean; email: string };
    whatsapp: { connected: boolean; phone: string };
    codeforces: { connected: boolean; handle: string };
    leetcode: { connected: boolean; username: string };
    telegram: { connected: boolean; chatId: string };
  };
  reminders: {
    timings: number[]; // minutes before deadline
    soundEnabled: boolean;
    browserPush: boolean;
    repeatUntilDone: boolean;
  };
  keywords: {
    critical: string[];
    high: string[];
    ignore: string[];
  };
}

let SETTINGS: Settings = {
  connections: {
    gmail: { connected: false, email: '' },
    whatsapp: { connected: false, phone: '' },
    codeforces: { connected: false, handle: '' },
    leetcode: { connected: false, username: '' },
    telegram: { connected: false, chatId: '' },
  },
  reminders: {
    timings: [1440, 60, 15], // 24h, 1h, 15min
    soundEnabled: true,
    browserPush: true,
    repeatUntilDone: true,
  },
  keywords: {
    critical: ['oa link', 'expires tonight', 'interview tomorrow', 'last date', 'fee payment'],
    high: ['internship', 'placement', 'shortlisted', 'deadline', 'scholarship'],
    ignore: ['promotional', 'newsletter', 'unsubscribe'],
  },
};

export function getSettings(req: Request, res: Response) {
  res.json({ success: true, data: SETTINGS });
}

export function updateSettings(req: Request, res: Response) {
  SETTINGS = { ...SETTINGS, ...req.body };
  res.json({ success: true, data: SETTINGS });
}

export function connectSource(req: Request, res: Response) {
  const { source } = req.params;
  const config = req.body;
  if (!(source in SETTINGS.connections)) {
    res.status(400).json({ success: false, error: 'Unknown source' }); return;
  }
  (SETTINGS.connections as Record<string, object>)[source] = { ...config, connected: true };
  res.json({ success: true, data: SETTINGS.connections });
}

export function disconnectSource(req: Request, res: Response) {
  const { source } = req.params;
  if (!(source in SETTINGS.connections)) {
    res.status(400).json({ success: false, error: 'Unknown source' }); return;
  }
  const current = (SETTINGS.connections as Record<string, Record<string, unknown>>)[source];
  Object.keys(current).forEach(k => { if (k !== 'connected') current[k] = ''; });
  current['connected'] = false;
  res.json({ success: true, data: SETTINGS.connections });
}
