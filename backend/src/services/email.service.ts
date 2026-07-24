import Imap from 'imap';
import { simpleParser, ParsedMail } from 'mailparser';
import { Readable } from 'stream';
import logger from '../utils/logger';
import { parseIntent } from '../utils/textParser';
import { FeedItem } from '../types';
import { v4 as uuid } from 'uuid';

// ─── In-memory email store ────────────────────────────────────────────────────
let importantEmails: FeedItem[] = [];
let isConnected = false;
let connectionStatus = 'disconnected';

export function getConnectionStatus() {
  return { connected: isConnected, status: connectionStatus };
}

export function getImportantEmails(): FeedItem[] {
  // Return real emails if available, else mock data
  if (importantEmails.length > 0) return importantEmails;
  return getMockEmails();
}

// ─── Gmail IMAP Connection ────────────────────────────────────────────────────
export async function connectGmail(email: string, appPassword: string): Promise<void> {
  connectionStatus = 'connecting';

  return new Promise((resolve, reject) => {
    const imap = new Imap({
      user: email,
      password: appPassword,
      host: 'imap.gmail.com',
      port: 993,
      tls: true,
      tlsOptions: { rejectUnauthorized: false },
      authTimeout: 10000,
    });

    imap.once('ready', () => {
      logger.info('Gmail IMAP connected');
      isConnected = true;
      connectionStatus = 'connected';
      scanInbox(imap).then(resolve).catch(reject);
    });

    imap.once('error', (err: Error) => {
      logger.error('Gmail IMAP error:', err.message);
      isConnected = false;
      connectionStatus = 'error: ' + err.message;
      reject(err);
    });

    imap.connect();
  });
}

async function scanInbox(imap: Imap): Promise<void> {
  return new Promise((resolve, reject) => {
    imap.openBox('INBOX', true, (err, box) => {
      if (err) { reject(err); return; }

      // Fetch last 50 unseen emails
      imap.search(['UNSEEN'], (searchErr, results) => {
        if (searchErr || results.length === 0) {
          logger.info(`No unread emails found`);
          resolve(); return;
        }

        const toFetch = results.slice(-50); // last 50 unread
        const fetch = imap.fetch(toFetch, { bodies: ['HEADER.FIELDS (FROM SUBJECT DATE)', 'TEXT'], struct: true });
        const parsed: ParsedMail[] = [];

        fetch.on('message', (msg) => {
          const chunks: Buffer[] = [];
          msg.on('body', (stream: Readable) => {
            stream.on('data', (chunk: Buffer) => chunks.push(chunk));
            stream.on('end', () => {
              simpleParser(Buffer.concat(chunks)).then(mail => parsed.push(mail)).catch(() => {});
            });
          });
        });

        fetch.once('end', async () => {
          // Filter to only important emails
          const important: FeedItem[] = [];
          for (const mail of parsed) {
            const subject = String(mail.subject || '');
            const textBody = String(mail.text || '');
            const from = String(mail.from?.text || '');
            const combined = `${subject}\n${textBody}`.slice(0, 1000);

            const intent = parseIntent(combined);
            if (intent.isImportant || intent.isCritical) {
              important.push({
                id: uuid(),
                title: subject || '(No subject)',
                summary: intent.summary,
                body: textBody.slice(0, 500),
                source: 'email',
                priority: intent.priority,
                status: 'pending',
                url: 'https://mail.google.com',
                deadline: null,
                extractedDates: intent.extractedDateText ? [intent.extractedDateText] : [],
                tags: intent.tags,
                createdAt: mail.date ?? new Date(),
                updatedAt: new Date(),
              });
            }
          }

          importantEmails = important;
          logger.info(`Scanned ${parsed.length} emails, found ${important.length} important`);
          imap.end();
          resolve();
        });

        fetch.once('error', reject);
      });
    });
  });
}

// ─── Auto-connect on startup if credentials present ──────────────────────────
export async function initEmailScanner() {
  const email = process.env.GMAIL_USER;
  const password = process.env.GMAIL_APP_PASSWORD;
  if (!email || !password || email.includes('your_email')) {
    logger.info('Gmail credentials not set — using mock email data');
    return;
  }
  try {
    await connectGmail(email, password);
    // Re-scan every 5 minutes
    setInterval(() => connectGmail(email, password).catch(() => {}), 5 * 60_000);
  } catch (err) {
    logger.warn('Gmail auto-connect failed:', (err as Error).message);
  }
}

// ─── Mock fallback ────────────────────────────────────────────────────────────
function getMockEmails(): FeedItem[] {
  return [
    { id: 'mock-email-1', title: 'Google OA Link — Expires Tonight 11:59 PM', summary: 'Online Assessment link from Google expires tonight. Attempt before midnight.', source: 'email', priority: 'critical', status: 'pending', url: 'https://mail.google.com', deadline: new Date(new Date().setHours(23, 59, 0, 0)).toISOString() as unknown as null, extractedDates: ['tonight', '11:59 PM'], tags: ['interview', 'placement', 'deadline'], createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() as unknown as Date, updatedAt: new Date().toISOString() as unknown as Date },
    { id: 'mock-email-2', title: 'Amazon SDE Intern Interview — Tomorrow 10 AM', summary: 'Interview scheduled for tomorrow at 10 AM IST.', source: 'email', priority: 'critical', status: 'pending', deadline: new Date(Date.now() + 18 * 60 * 60 * 1000).toISOString() as unknown as null, extractedDates: ['tomorrow', '10 AM'], tags: ['interview', 'placement'], createdAt: new Date().toISOString() as unknown as Date, updatedAt: new Date().toISOString() as unknown as Date },
    { id: 'mock-email-3', title: 'Microsoft Internship — Apply Before Friday', summary: 'Microsoft India SWE Intern applications close Friday.', source: 'email', priority: 'high', status: 'pending', url: 'https://careers.microsoft.com', deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString() as unknown as null, extractedDates: ['Friday'], tags: ['placement', 'internship'], createdAt: new Date().toISOString() as unknown as Date, updatedAt: new Date().toISOString() as unknown as Date },
  ];
}
