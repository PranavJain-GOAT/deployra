import { Request, Response } from 'express';
import { getImportantMessages } from '../services/whatsapp.service';
import {
  connectWhatsApp,
  disconnectWhatsApp,
  getQRCode,
  getConnectionState,
  waEvents,
} from '../services/whatsapp.service';

export function getWhatsAppStatus(req: Request, res: Response) {
  res.json({
    success: true,
    data: {
      state: getConnectionState(),
      qrReady: getConnectionState() === 'qr_ready',
    },
  });
}

export function getWhatsAppQR(req: Request, res: Response) {
  const qr = getQRCode();
  if (!qr) {
    res.status(404).json({ success: false, error: 'QR not ready — call /connect first' });
    return;
  }
  res.json({ success: true, data: { qr } });
}

export async function startWhatsAppConnect(req: Request, res: Response) {
  try {
    // Start connection in background — QR will come via SSE or polling
    connectWhatsApp().catch(err => {
      console.error('WhatsApp connect error:', err);
    });
    res.json({ success: true, message: 'Connecting... poll /api/v1/whatsapp/qr for QR code' });
  } catch (err) {
    res.status(500).json({ success: false, error: (err as Error).message });
  }
}

export function stopWhatsApp(req: Request, res: Response) {
  disconnectWhatsApp();
  res.json({ success: true, message: 'WhatsApp disconnected' });
}

// ── SSE stream — sends QR and state changes in real-time ─────────────────────
export function whatsappSSE(req: Request, res: Response) {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.flushHeaders();

  const sendEvent = (event: string, data: object) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  // Send current state immediately
  sendEvent('state', { state: getConnectionState(), qr: getQRCode() });

  const onQR = (qr: string) => sendEvent('qr', { qr });
  const onState = (state: string) => sendEvent('state', { state, qr: getQRCode() });
  const onMsg = (msg: object) => sendEvent('message', msg);

  waEvents.on('qr', onQR);
  waEvents.on('state', onState);
  waEvents.on('message', onMsg);

  // Heartbeat every 15 seconds
  const hb = setInterval(() => res.write(':heartbeat\n\n'), 15_000);

  req.on('close', () => {
    clearInterval(hb);
    waEvents.off('qr', onQR);
    waEvents.off('state', onState);
    waEvents.off('message', onMsg);
  });
}

export function getWhatsAppFeed(req: Request, res: Response) {
  const messages = getImportantMessages();
  res.json({ success: true, data: messages, count: messages.length });
}
