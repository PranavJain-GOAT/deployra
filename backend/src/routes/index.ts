import { Router } from 'express';
import { getFeed, getEmailFeed, markDone, snoozeItem, dismissItem } from '../controllers/feed.controller';
import { getContests, getContestsByPlatform } from '../controllers/contests.controller';
import { getDeadlines, createDeadline, updateDeadline } from '../controllers/deadlines.controller';
import { getSettings, updateSettings, connectSource, disconnectSource } from '../controllers/settings.controller';
import {
  getWhatsAppStatus,
  getWhatsAppQR,
  startWhatsAppConnect,
  stopWhatsApp,
  whatsappSSE,
  getWhatsAppFeed,
} from '../controllers/whatsapp.controller';

const router = Router();

// ── Health ────────────────────────────────────────────────────────────────────
router.get('/health', (_, res) => res.json({ status: 'ok', service: 'OmniPulse API', timestamp: new Date() }));

// ── Unified feed ──────────────────────────────────────────────────────────────
router.get('/feed',              getFeed);
router.get('/feed/email',        getEmailFeed);
router.get('/feed/whatsapp',     getWhatsAppFeed);
router.patch('/feed/:id/done',   markDone);
router.patch('/feed/:id/snooze', snoozeItem);
router.patch('/feed/:id/dismiss',dismissItem);

// ── Contests ──────────────────────────────────────────────────────────────────
router.get('/contests',           getContests);
router.get('/contests/:platform', getContestsByPlatform);

// ── Deadlines ─────────────────────────────────────────────────────────────────
router.get('/deadlines',      getDeadlines);
router.post('/deadlines',     createDeadline);
router.patch('/deadlines/:id',updateDeadline);

// ── WhatsApp (Baileys) ────────────────────────────────────────────────────────
router.get('/whatsapp/status',  getWhatsAppStatus);
router.get('/whatsapp/qr',      getWhatsAppQR);
router.get('/whatsapp/stream',  whatsappSSE);          // SSE for real-time QR
router.post('/whatsapp/connect',startWhatsAppConnect);
router.post('/whatsapp/disconnect', stopWhatsApp);

// ── Settings ──────────────────────────────────────────────────────────────────
router.get('/settings',                     getSettings);
router.patch('/settings',                   updateSettings);
router.post('/settings/connect/:source',    connectSource);
router.delete('/settings/connect/:source',  disconnectSource);

export default router;
