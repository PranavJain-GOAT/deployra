import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Webhook, Plus, Send, Trash2, X, ChevronDown
} from "lucide-react";

/* ─────────────────────────────────────────────
   INIT DATA
───────────────────────────────────────────── */
const INIT_HOOKS = [
  {
    id: "wh_1",
    name: "Order Placed → Notify CRM",
    url: "https://hooks.yourapp.com/crm/orders",
    event: "order.placed",
    active: true,
    attempts: [],
    lastFired: "10:22:04",
    status: "success",
  },
  {
    id: "wh_2",
    name: "Payment Success → Slack",
    url: "https://hooks.slack.com/services/T0X...ABC",
    event: "payment.success",
    active: true,
    attempts: [],
    lastFired: "09:40:07",
    status: "success",
  },
  {
    id: "wh_3",
    name: "Agent Error → PagerDuty",
    url: "https://events.pagerduty.com/v2/enqueue",
    event: "agent.error",
    active: false,
    attempts: [
      { n: 1, ts: "09:12:03", status: "failed" },
      { n: 2, ts: "09:12:08", status: "failed" },
      { n: 3, ts: "09:12:18", status: "failed" },
    ],
    lastFired: "09:12:03",
    status: "failed",
  },
];

const EVENTS = [
  "order.placed", "order.updated", "payment.success",
  "payment.failed", "install.completed", "agent.error",
];

/* ─────────────────────────────────────────────
   HEARTBEAT SVG
───────────────────────────────────────────── */
function HeartbeatLine({ spiking, color = "hsl(var(--foreground))" }) {
  const WIDTH = 220, HEIGHT = 36, MID = HEIGHT / 2;

  const flat  = `M0,${MID} L${WIDTH},${MID}`;
  const spike = `M0,${MID} L60,${MID} L75,${MID - 14} L83,${MID + 10} L93,${MID - 20} L105,${MID + 12} L116,${MID} L${WIDTH},${MID}`;

  return (
    <svg width={WIDTH} height={HEIGHT} style={{ overflow: "visible" }}>
      <defs>
        <filter id="hb-glow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <motion.path
        d={spiking ? spike : flat}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        filter="url(#hb-glow)"
        animate={{ d: spiking ? spike : flat, opacity: spiking ? 1 : 0.45 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        style={{ strokeDasharray: spiking ? "none" : "4 4" }}
      />
    </svg>
  );
}

/* ─────────────────────────────────────────────
   WEBHOOK CARD
───────────────────────────────────────────── */
function WebhookCard({ hook, onDelete }) {
  const [spiking,  setSpiking]  = useState(false);
  const [testing,  setTesting]  = useState(false);
  const [testLog,  setTestLog]  = useState(null);
  const [expanded, setExpanded] = useState(false);

  const handleTest = () => {
    setTesting(true);
    setSpiking(true);
    setTimeout(() => setSpiking(false), 1800);

    const steps = [];
    let i = 0;
    const int = setInterval(() => {
      i++;
      steps.push({ n: i, ts: new Date().toLocaleTimeString(), status: i < 3 || hook.status === "success" ? (i === 3 && hook.status !== "success" ? "failed" : "pending") : "success" });
      setTestLog([...steps]);
      if (i >= 3) {
        clearInterval(int);
        setTesting(false);
        setTestLog((p) => p.map((s, idx) => idx === p.length - 1 ? { ...s, status: hook.status === "success" ? "success" : "failed" } : s));
      }
    }, 700);
  };

  const statusColor = hook.status === "success" ? "hsl(var(--foreground))" : hook.status === "failed" ? "hsl(var(--foreground))" : "hsl(var(--foreground))";

  return (
    <motion.div layout className="rounded-2xl overflow-hidden"
      style={{ background: "rgba(0,0,0,0.85)", border: "0.5px solid hsl(var(--foreground) / 0.07)", backdropFilter: "blur(12px)" }}>

      {/* Header */}
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: `${statusColor}15`, border: `0.5px solid ${statusColor}30` }}>
              <Webhook className="w-4 h-4" style={{ color: statusColor }} />
            </div>
            <div>
              <h3 className="text-white font-bold text-sm" style={{ fontFamily: "'Inter', sans-serif" }}>{hook.name}</h3>
              <p className="text-[10px] mt-0.5 font-mono truncate max-w-xs" style={{ color: "hsl(var(--foreground) / 0.25)" }}>{hook.url}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] px-2 py-0.5 rounded font-mono"
              style={{ background: "hsl(var(--foreground) / 0.04)", color: "hsl(var(--foreground) / 0.3)" }}>
              {hook.event}
            </span>
            <button onClick={() => onDelete(hook.id)} className="p-1.5 rounded-lg"
              style={{ background: "rgba(150,150,150,0.06)", color: "rgba(150,150,150,0.5)" }}>
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Heartbeat line */}
        <div className="flex items-center justify-between mb-4">
          <HeartbeatLine spiking={spiking} color={statusColor} />
          <div className="text-right">
            <div className="text-[10px]" style={{ color: "hsl(var(--foreground) / 0.25)", fontFamily: "'JetBrains Mono', monospace" }}>
              Last: {hook.lastFired}
            </div>
            <div className="text-[10px] font-bold uppercase mt-0.5"
              style={{ color: statusColor, fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.08em" }}>
              {hook.status}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button onClick={handleTest} disabled={testing}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all"
            style={{
              background: "rgba(150,150,150,0.12)", color: "hsl(var(--foreground))",
              border: "0.5px solid rgba(150,150,150,0.25)", fontFamily: "'Inter', sans-serif",
              opacity: testing ? 0.7 : 1,
            }}>
            <Send className="w-3.5 h-3.5" />
            {testing ? "Sending…" : "Send Test"}
          </button>
          {hook.attempts.length > 0 && (
            <button onClick={() => setExpanded((p) => !p)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium transition-all"
              style={{ background: "hsl(var(--foreground) / 0.04)", color: "hsl(var(--foreground) / 0.4)", fontFamily: "'Inter', sans-serif" }}>
              Retry Log ({hook.attempts.length}) <ChevronDown className={`w-3 h-3 transition-transform ${expanded ? "rotate-180" : ""}`} />
            </button>
          )}
        </div>
      </div>

      {/* Retry log */}
      <AnimatePresence>
        {(expanded || testLog) && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t"
            style={{ borderColor: "hsl(var(--foreground) / 0.06)" }}>
            <div className="px-5 py-3 space-y-1.5">
              {(testLog || hook.attempts).map((a) => (
                <div key={a.n} className="flex items-center gap-3 text-[11px]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  <span style={{ color: "hsl(var(--foreground) / 0.2)", minWidth: 64 }}>[{a.ts}]</span>
                  <span style={{ color: a.status === "success" ? "hsl(var(--foreground))" : a.status === "failed" ? "hsl(var(--foreground))" : "hsl(var(--foreground))" }}>
                    {a.status === "success" ? "✓" : a.status === "failed" ? "✗" : "…"}
                  </span>
                  <span style={{ color: "hsl(var(--foreground) / 0.5)" }}>Attempt {a.n} — {a.status}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────── */
export default function WebhookOrchestrator() {
  const [hooks,     setHooks]    = useState(INIT_HOOKS);
  const [adding,    setAdding]   = useState(false);
  const [newUrl,    setNewUrl]   = useState("");
  const [newName,   setNewName]  = useState("");
  const [newEvent,  setNewEvent] = useState(EVENTS[0]);

  const deleteHook = (id) => setHooks((p) => p.filter((h) => h.id !== id));

  const addHook = () => {
    if (!newUrl.trim() || !newName.trim()) return;
    setHooks((p) => [...p, {
      id: "wh_" + Date.now(), name: newName, url: newUrl, event: newEvent,
      active: true, attempts: [], lastFired: "—", status: "pending",
    }]);
    setNewUrl(""); setNewName(""); setAdding(false);
  };

  return (
    <div className="p-6 sm:p-8 max-w-4xl">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-white font-bold text-2xl sm:text-3xl" style={{ fontFamily: "Georgia, serif", letterSpacing: "-0.04em" }}>
            Webhook Orchestrator
          </h1>
          <p className="text-sm mt-1" style={{ color: "hsl(var(--foreground) / 0.35)", fontFamily: "'Inter', sans-serif" }}>
            Map events to real-world endpoints. Test connections and monitor retries.
          </p>
        </div>
        <button onClick={() => setAdding(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold shimmer-btn"
          style={{ background: "linear-gradient(135deg,hsl(var(--foreground)),hsl(var(--foreground)))", color:"white", fontFamily:"'Inter',sans-serif", boxShadow:"0 0 20px rgba(150,150,150,0.3)" }}>
          <Plus className="w-4 h-4" /> Add Endpoint
        </button>
      </div>

      {/* Add endpoint */}
      <AnimatePresence>
        {adding && (
          <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:"auto" }} exit={{ opacity:0, height:0 }} className="mb-5 overflow-hidden">
            <div className="rounded-2xl p-5 space-y-3" style={{ background:"rgba(150,150,150,0.05)", border:"0.5px solid rgba(150,150,150,0.18)" }}>
              <div className="grid grid-cols-2 gap-3">
                <input className="px-3 py-2 rounded-xl text-sm outline-none bg-transparent text-white placeholder-white/20"
                  style={{ border:"0.5px solid hsl(var(--foreground) / 0.1)", fontFamily:"'Inter',sans-serif" }}
                  placeholder="Webhook name…" value={newName} onChange={(e) => setNewName(e.target.value)} />
                <input className="px-3 py-2 rounded-xl text-sm outline-none bg-transparent text-white placeholder-white/20"
                  style={{ border:"0.5px solid hsl(var(--foreground) / 0.1)", fontFamily:"'Inter',sans-serif" }}
                  placeholder="https://your-server.com/hook" value={newUrl} onChange={(e) => setNewUrl(e.target.value)} />
              </div>
              <div className="flex items-center gap-3">
                <select className="flex-1 px-3 py-2 rounded-xl text-sm outline-none"
                  style={{ background:"hsl(var(--foreground) / 0.04)", border:"0.5px solid hsl(var(--foreground) / 0.08)", color:"hsl(var(--foreground) / 0.7)", fontFamily:"'Inter',sans-serif" }}
                  value={newEvent} onChange={(e) => setNewEvent(e.target.value)}>
                  {EVENTS.map((e) => <option key={e} value={e}>{e}</option>)}
                </select>
                <button onClick={addHook} className="px-4 py-2 rounded-xl text-xs font-bold"
                  style={{ background:"rgba(150,150,150,0.2)", color:"hsl(var(--foreground))", fontFamily:"'Inter',sans-serif" }}>Create</button>
                <button onClick={() => setAdding(false)}><X className="w-4 h-4" style={{ color:"hsl(var(--foreground) / 0.3)" }} /></button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        {hooks.map((h, i) => (
          <motion.div key={h.id} initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }} transition={{ delay: i * 0.07 }}>
            <WebhookCard hook={h} onDelete={deleteHook} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
