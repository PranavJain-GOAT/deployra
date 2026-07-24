import { EventEmitter } from 'events';
import logger from '../utils/logger';
import { parseIntent } from '../utils/textParser';
import { FeedItem } from '../types';
import { v4 as uuid } from 'uuid';

export const waEvents = new EventEmitter();

// ─── State ────────────────────────────────────────────────────────────────────
type WAState = 'disconnected' | 'connecting' | 'qr_ready' | 'connected';
let connectionState: WAState = 'disconnected';
let qrCode: string | null = null;
let importantMessages: FeedItem[] = [];
let baileysLoaded = false;
let sock: any = null;

export function getQRCode() { return qrCode; }
export function getConnectionState() { return connectionState; }
export function getImportantMessages(): FeedItem[] {
  return importantMessages.length > 0 ? importantMessages : getMockMessages();
}

// ─── Dynamically load Baileys (avoids crashing the server if it fails) ────────
async function loadBaileys() {
  if (baileysLoaded) return true;
  try {
    // Test import
    await import('@whiskeysockets/baileys');
    baileysLoaded = true;
    return true;
  } catch (e) {
    logger.warn('Baileys could not load (Node version issue) — WhatsApp will use mock data');
    return false;
  }
}

// ─── Connect via Baileys ──────────────────────────────────────────────────────
export async function connectWhatsApp(): Promise<void> {
  if (connectionState === 'connected') return;
  connectionState = 'connecting';
  qrCode = null;
  waEvents.emit('state', connectionState);

  const canLoad = await loadBaileys();
  if (!canLoad) {
    // Simulate QR flow with mock for demo purposes
    logger.info('WhatsApp: running in demo mode (Baileys unavailable on Node 24)');
    await simulateDemoConnect();
    return;
  }

  try {
    const {
      default: makeWASocket,
      useMultiFileAuthState,
      fetchLatestBaileysVersion,
      makeCacheableSignalKeyStore,
      DisconnectReason,
    } = await import('@whiskeysockets/baileys');
    const { Boom } = await import('@hapi/boom');
    const path = await import('path');
    const AUTH_DIR = path.join(process.cwd(), '.whatsapp-auth');

    const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
    const { version } = await fetchLatestBaileysVersion();

    sock = makeWASocket({
      version,
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, logger as any),
      },
      printQRInTerminal: false,
      syncFullHistory: false,
      markOnlineOnConnect: false,
      generateHighQualityLinkPreview: false,
      logger: logger as any,
      getMessage: async () => undefined,
    });

    sock.ev.on('connection.update', async (update: any) => {
      const { connection, lastDisconnect, qr } = update;
      if (qr) {
        qrCode = qr;
        connectionState = 'qr_ready';
        waEvents.emit('qr', qr);
        waEvents.emit('state', connectionState);
      }
      if (connection === 'close') {
        const statusCode = (lastDisconnect?.error as any)?.output?.statusCode;
        const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
        connectionState = 'disconnected';
        qrCode = null;
        waEvents.emit('state', connectionState);
        if (shouldReconnect) setTimeout(connectWhatsApp, 5000);
      }
      if (connection === 'open') {
        connectionState = 'connected';
        qrCode = null;
        waEvents.emit('state', connectionState);
        logger.info('✅ WhatsApp connected!');
      }
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('messages.upsert', async ({ messages, type }: any) => {
      if (type !== 'notify') return;
      for (const msg of messages) {
        if (!msg.message || msg.key.fromMe) continue;
        const text = msg.message.conversation || msg.message.extendedTextMessage?.text || '';
        if (!text || text.length < 10) continue;
        const parsed = parseIntent(text);
        if (!parsed.isImportant && !parsed.isCritical) continue;
        const from = msg.pushName || 'Unknown';
        const jid = msg.key.remoteJid || '';
        const isGroup = jid.endsWith('@g.us');
        const url = isGroup ? 'https://web.whatsapp.com' : `https://wa.me/${jid.replace('@s.whatsapp.net', '')}`;
        const item: FeedItem = {
          id: uuid(),
          title: `${from} (${isGroup ? 'Group' : 'Direct'})`,
          summary: parsed.summary,
          body: `${from}:\n"${text}"`,
          source: 'whatsapp',
          priority: parsed.priority,
          status: 'pending',
          url,
          deadline: null,
          extractedDates: parsed.extractedDateText ? [parsed.extractedDateText] : [],
          tags: parsed.tags,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        importantMessages.unshift(item);
        if (importantMessages.length > 100) importantMessages.pop();
        waEvents.emit('message', item);
      }
    });
  } catch (err) {
    logger.error('WhatsApp connection failed:', (err as Error).message);
    connectionState = 'disconnected';
    waEvents.emit('state', connectionState);
  }
}

// ─── Demo mode (when Baileys can't load) ──────────────────────────────────────
async function simulateDemoConnect() {
  // Show a "demo QR" after 2 seconds
  setTimeout(() => {
    qrCode = 'OMNIPULSE_DEMO_QR_NOT_REAL';
    connectionState = 'qr_ready';
    waEvents.emit('qr', qrCode);
    waEvents.emit('state', connectionState);
  }, 2000);
}

export function disconnectWhatsApp() {
  try { sock?.end?.(); } catch {}
  sock = null;
  connectionState = 'disconnected';
  qrCode = null;
  importantMessages = [];
  waEvents.emit('state', connectionState);
}

// ─── Mock data ────────────────────────────────────────────────────────────────
function getMockMessages(): FeedItem[] {
  const now = Date.now();
  return [
    { id: 'wa-1', title: 'TCS Drive Tomorrow at 9 AM', summary: 'Placement Group: TCS on-campus drive tomorrow 9 AM. Seminar Hall. Carry ID, photos, resume.', body: 'Placement Coordinator (via Placements 2026):\n"TCS drive tomorrow 9 AM, Seminar Hall. Bring: College ID, 2 passport photos, 2 copies resume, all marksheets."', source: 'whatsapp', priority: 'critical', status: 'pending', url: 'https://web.whatsapp.com', deadline: new Date(now + 16 * 3600000), extractedDates: ['tomorrow', '9 AM'], tags: ['placement', 'interview'], createdAt: new Date(now - 3600000), updatedAt: new Date() },
    { id: 'wa-2', title: 'Assignment 3 Extended to Monday 11:59 PM', summary: 'Prof. Sharma: Assignment 3 submission extended to Monday 11:59 PM.', body: 'Prof Sharma (via CSE-2026 Batch):\n"Assignment 3 extended to Monday 11:59 PM. Push to GitHub before midnight."', source: 'whatsapp', priority: 'high', status: 'pending', url: 'https://web.whatsapp.com', deadline: new Date(now + 2 * 86400000), extractedDates: ['Monday', '11:59 PM'], tags: ['assignment', 'deadline'], createdAt: new Date(now - 1800000), updatedAt: new Date() },
    { id: 'wa-3', title: 'Google Form — Cultural Fest Registration Tonight', summary: 'Fill Google Form for cultural fest before tonight midnight. 50 spots left.', body: 'Event Committee (via College Events):\n"Fill cultural fest form before midnight. forms.gle/xxx. Only 50 spots!"', source: 'whatsapp', priority: 'medium', status: 'pending', url: 'https://web.whatsapp.com', deadline: new Date(new Date().setHours(23, 59, 0, 0)), extractedDates: ['tonight'], tags: ['form', 'deadline'], createdAt: new Date(now - 7200000), updatedAt: new Date() },
    { id: 'wa-4', title: 'CF Round 960 Tonight — Register by 10:25 PM', summary: 'Codeforces Round 960 Div 2 tonight. Register before 10:25 PM.', body: 'Coding Club (via CSIT Coding Club):\n"CF Round 960 Div 2 tonight! Register: codeforces.com/contest/1987. Closes 10:25 PM."', source: 'whatsapp', priority: 'medium', status: 'pending', url: 'https://web.whatsapp.com', deadline: new Date(new Date().setHours(22, 25, 0, 0)), extractedDates: ['tonight', '10:25 PM'], tags: ['contest', 'codeforces'], createdAt: new Date(now - 10800000), updatedAt: new Date() },
  ];
}
