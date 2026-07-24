import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWhatsAppFeed } from '@/hooks/useFeed';
import PriorityCard from '@/components/common/PriorityCard';
import { Loader2, MessageSquare, RefreshCw, CheckCircle2, WifiOff, Wifi } from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/lib/api';

// ── QR code rendering using native canvas ─────────────────────────────────────
// We use a simple CSS-based QR display since we can't import qrcode lib
// The QR string from Baileys is the raw data — we show it as text for now
// and link to a QR renderer
function QRDisplay({ qr }: { qr: string }) {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="bg-white p-4 rounded-xl">
        {/* We render QR using Google Charts API — no API key needed */}
        <img
          src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(qr)}&bgcolor=ffffff&color=000000&margin=10`}
          alt="WhatsApp QR Code"
          className="w-56 h-56 rounded-lg"
          onError={(e) => {
            // Fallback: show raw QR data for manual scanning
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      </div>
      <p className="text-xs text-muted text-center max-w-xs">
        Open WhatsApp → ⋮ Menu → Linked Devices → Link a Device → Scan this code
      </p>
    </div>
  );
}

type WAState = 'disconnected' | 'connecting' | 'qr_ready' | 'connected';

export default function WhatsAppPage() {
  const { data: messages = [], isLoading } = useWhatsAppFeed();
  const [waState, setWaState] = useState<WAState>('disconnected');
  const [qr, setQr] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const sseRef = useRef<EventSource | null>(null);

  // Check current WhatsApp status on mount
  useEffect(() => {
    api.get('/whatsapp/status').then(({ data }) => {
      if (data.success) setWaState(data.data.state);
    }).catch(() => {});
  }, []);

  // Connect to SSE stream when connecting
  const startSSE = () => {
    if (sseRef.current) sseRef.current.close();
    const sse = new EventSource('/api/v1/whatsapp/stream');
    sseRef.current = sse;

    sse.addEventListener('state', (e) => {
      const d = JSON.parse(e.data);
      setWaState(d.state as WAState);
      if (d.qr) setQr(d.qr);
      if (d.state === 'connected') {
        setQr(null);
        sse.close();
      }
    });

    sse.addEventListener('qr', (e) => {
      const d = JSON.parse(e.data);
      setQr(d.qr);
      setWaState('qr_ready');
    });
  };

  const handleConnect = async () => {
    setConnecting(true);
    setQr(null);
    setWaState('connecting');
    try {
      await api.post('/whatsapp/connect');
      startSSE();
    } catch {
      setWaState('disconnected');
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    sseRef.current?.close();
    await api.post('/whatsapp/disconnect');
    setWaState('disconnected');
    setQr(null);
  };

  useEffect(() => () => sseRef.current?.close(), []);

  const critical = messages.filter(m => m.priority === 'critical');
  const high     = messages.filter(m => m.priority === 'high');
  const others   = messages.filter(m => m.priority !== 'critical' && m.priority !== 'high');

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-semibold">WhatsApp</h2>
        <p className="text-sm text-muted mt-1">
          Important messages from your groups — placements, deadlines, assignments, forms
        </p>
      </div>

      {/* ── Connection card ── */}
      <div className={cn(
        'card p-5 border transition-colors duration-300',
        waState === 'connected'  ? 'border-success/30 bg-success/5' :
        waState === 'qr_ready'   ? 'border-blue/30' :
        waState === 'connecting' ? 'border-warning/30' :
                                   'border-border'
      )}>
        <div className="flex items-start gap-4">
          {/* Status icon */}
          <div className={cn(
            'p-3 rounded-xl shrink-0',
            waState === 'connected'  ? 'bg-success/10 text-success' :
            waState === 'connecting' ? 'bg-warning/10 text-warning' :
            waState === 'qr_ready'   ? 'bg-blue/10 text-blue' :
                                       'bg-card text-muted'
          )}>
            {waState === 'connected' ? <Wifi size={20} /> :
             waState === 'connecting' ? <Loader2 size={20} className="animate-spin" /> :
             <WifiOff size={20} />}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-sm font-semibold">
                {waState === 'connected'  ? '✅ WhatsApp Connected' :
                 waState === 'connecting' ? '⏳ Connecting...' :
                 waState === 'qr_ready'   ? '📱 Scan QR Code' :
                                            'WhatsApp Not Connected'}
              </h3>
              {waState === 'connected' && (
                <span className="badge bg-success/10 text-success border border-success/20 text-[10px]">Live</span>
              )}
            </div>
            <p className="text-xs text-muted">
              {waState === 'connected'
                ? 'OmniPulse is reading your messages. Important ones appear below automatically.'
                : waState === 'qr_ready'
                  ? 'Scan the QR code with your phone to link WhatsApp. Works exactly like WhatsApp Web.'
                  : waState === 'connecting'
                    ? 'Generating QR code... this takes a few seconds'
                    : 'Connect once — OmniPulse will auto-detect important messages from your groups (placements, deadlines, forms etc.)'}
            </p>

            {/* Action buttons */}
            <div className="flex items-center gap-2 mt-3">
              {waState === 'disconnected' && (
                <button onClick={handleConnect} disabled={connecting} className="btn-primary text-xs">
                  {connecting ? <Loader2 size={12} className="animate-spin" /> : <MessageSquare size={12} />}
                  Connect WhatsApp
                </button>
              )}
              {waState === 'connecting' && (
                <span className="text-xs text-muted flex items-center gap-1.5">
                  <Loader2 size={12} className="animate-spin" /> Generating QR...
                </span>
              )}
              {waState === 'connected' && (
                <button onClick={handleDisconnect} className="btn-danger text-xs">
                  Disconnect
                </button>
              )}
              {(waState === 'qr_ready' || waState === 'disconnected') && waState !== 'disconnected' && (
                <button onClick={handleConnect} className="btn-ghost text-xs">
                  <RefreshCw size={12} /> Refresh QR
                </button>
              )}
            </div>
          </div>
        </div>

        {/* QR Code */}
        <AnimatePresence>
          {qr && waState === 'qr_ready' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-5 pt-5 border-t border-border flex justify-center"
            >
              <QRDisplay qr={qr} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Connected confirmation */}
        {waState === 'connected' && (
          <div className="mt-4 pt-4 border-t border-border flex items-center gap-2 text-xs text-muted">
            <CheckCircle2 size={13} className="text-success" />
            <span>Messages are being parsed in real-time. Only important ones (placements, deadlines, forms) will appear.</span>
          </div>
        )}
      </div>

      {/* ── How it works ── */}
      {waState !== 'connected' && (
        <div className="card p-4 border-blue/15 space-y-2">
          <div className="text-xs font-semibold text-blue mb-2">What OmniPulse detects from WhatsApp</div>
          {[
            ['🎯', 'Placement drives', 'campus interviews, shortlists, OA links'],
            ['📚', 'Assignments & deadlines', '"submit by", "due date", "last date"'],
            ['📝', 'Google Forms', '"fill this form", "register before"'],
            ['🏆', 'Contest alerts', '"CF round", "register", "starts tonight"'],
            ['📢', 'Critical notices', 'fee payment, exam schedules, urgent announcements'],
          ].map(([icon, title, desc]) => (
            <div key={title} className="flex items-start gap-2 text-xs">
              <span className="shrink-0 mt-0.5">{icon}</span>
              <span><strong className="text-foreground">{title}</strong> — <span className="text-muted">{desc}</span></span>
            </div>
          ))}
        </div>
      )}

      {/* ── Messages ── */}
      {isLoading ? (
        <div className="flex items-center gap-2 text-muted text-sm py-16 justify-center">
          <Loader2 size={16} className="animate-spin" /> Loading messages...
        </div>
      ) : (
        <div className="space-y-6">
          {critical.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1.5 h-1.5 rounded-full bg-danger animate-pulse" />
                <h3 className="section-title">Critical</h3>
                <span className="badge badge-critical">{critical.length}</span>
              </div>
              <div className="space-y-3">
                <AnimatePresence>{critical.map(m => <PriorityCard key={m.id} item={m} />)}</AnimatePresence>
              </div>
            </section>
          )}
          {high.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1.5 h-1.5 rounded-full bg-warning" />
                <h3 className="section-title">Important</h3>
                <span className="badge badge-high">{high.length}</span>
              </div>
              <div className="space-y-3">
                <AnimatePresence>{high.map(m => <PriorityCard key={m.id} item={m} />)}</AnimatePresence>
              </div>
            </section>
          )}
          {others.length > 0 && (
            <section>
              <h3 className="section-title mb-3">Others</h3>
              <div className="space-y-3">{others.map(m => <PriorityCard key={m.id} item={m} />)}</div>
            </section>
          )}
          {messages.length === 0 && waState === 'connected' && (
            <div className="card p-16 text-center">
              <MessageSquare size={32} className="text-success mx-auto mb-3" />
              <div className="text-sm font-medium">Connected — watching for important messages</div>
              <div className="text-xs text-muted mt-1">New important messages from your groups will appear here instantly</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
