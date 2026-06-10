import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag, CheckCircle, ChevronRight, MessageSquare, X, Download, Shield, Rocket, FileText, RefreshCw,
  Search, Paperclip, Send, Settings, Package, Eye,
  User, Calendar, Globe, Zap, Lock
} from "lucide-react";
import axios from "axios";
import { API_URL } from "@/lib/config";

// ─── Status Config ──────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  AWAITING_PAYMENT:    { label: "Awaiting Payment",    color: "text-foreground/50",  bg: "bg-foreground/5",    border: "border-foreground/15",  step: -1 },
  ESCROW_FUNDED:       { label: "Escrow Funded",       color: "text-violet-400",    bg: "bg-violet-400/8",   border: "border-violet-400/20",  step: 0 },
  AWAITING_DEVELOPER:  { label: "Awaiting Developer",  color: "text-amber-400",     bg: "bg-amber-400/8",    border: "border-amber-400/20",   step: 1 },
  IN_PROGRESS:         { label: "In Progress",         color: "text-indigo-400",    bg: "bg-indigo-400/8",   border: "border-indigo-400/20",  step: 2 },
  DELIVERED:           { label: "Delivered",           color: "text-sky-400",       bg: "bg-sky-400/8",      border: "border-sky-400/20",     step: 3 },
  UNDER_REVIEW:        { label: "Under Review",        color: "text-cyan-400",      bg: "bg-cyan-400/8",     border: "border-cyan-400/20",    step: 4 },
  REVISION_REQUESTED:  { label: "Revision Requested",  color: "text-orange-400",    bg: "bg-orange-400/8",   border: "border-orange-400/20",  step: 2 },
  COMPLETED:           { label: "Completed",           color: "text-emerald-400",   bg: "bg-emerald-400/8",  border: "border-emerald-400/20", step: 5 },
  DISPUTED:            { label: "Disputed",            color: "text-red-400",       bg: "bg-red-400/8",      border: "border-red-400/20",     step: -1 },
  CANCELLED:           { label: "Cancelled",           color: "text-foreground/30", bg: "bg-foreground/5",   border: "border-foreground/10",  step: -1 },
};

const TIMELINE_STEPS = [
  { key: "ESCROW_FUNDED",      label: "Escrow Funded",    icon: Shield      },
  { key: "AWAITING_DEVELOPER", label: "Dev Assigned",     icon: User        },
  { key: "IN_PROGRESS",        label: "In Progress",      icon: Zap         },
  { key: "DELIVERED",          label: "Delivered",        icon: Rocket      },
  { key: "UNDER_REVIEW",       label: "Client Review",    icon: Eye         },
  { key: "COMPLETED",          label: "Completed",        icon: CheckCircle },
];

// ─── Components ────────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.AWAITING_PAYMENT;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${cfg.color} ${cfg.bg} ${cfg.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.color.replace("text-", "bg-")}`} />
      {cfg.label}
    </span>
  );
}

function OrderTimeline({ status }) {
  const cfg = STATUS_CONFIG[status];
  const currentStep = cfg?.step ?? -1;
  if (currentStep < 0) return null;
  return (
    <div className="flex items-center gap-0 w-full mt-4">
      {TIMELINE_STEPS.map((step, i) => {
        const done = i < currentStep;
        const active = i === currentStep;
        const Icon = step.icon;
        return (
          <div key={step.key} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center border transition-all ${
                done   ? "bg-emerald-400/15 border-emerald-400/40" :
                active ? "bg-foreground/15 border-foreground/40 ring-2 ring-foreground/15" :
                         "bg-foreground/5 border-foreground/10"
              }`}>
                <Icon className={`w-3 h-3 ${done ? "text-emerald-400" : active ? "text-foreground" : "text-foreground/25"}`} />
              </div>
              <span className={`text-[8px] font-bold mt-1 whitespace-nowrap hidden sm:block ${active ? "text-foreground" : "text-foreground/25"}`}
                style={{ fontFamily: "'Inter', sans-serif" }}>{step.label}</span>
            </div>
            {i < TIMELINE_STEPS.length - 1 && (
              <div className={`flex-1 h-px mx-1 ${done ? "bg-emerald-400/40" : "bg-foreground/8"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Config Package Viewer ────────────────────────────────────────────────────
function ConfigPackagePanel({ config }) {
  const entries = Object.entries(config || {});
  const fileEntries = entries.filter(([, v]) => typeof v === "object" && v.type);
  const textEntries = entries.filter(([, v]) => typeof v !== "object" || !v.type);

  return (
    <div className="space-y-4">
      <div className="text-[10px] font-bold uppercase tracking-widest text-foreground/30 mb-3" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
        Client Configuration Package
      </div>

      {/* Text Fields */}
      {textEntries.length > 0 && (
        <div className="p-4 rounded-xl space-y-2.5" style={{ background: "rgba(255,255,255,0.02)", border: "0.5px solid rgba(255,255,255,0.06)" }}>
          {textEntries.map(([key, value]) => (
            <div key={key} className="flex items-start justify-between gap-3">
              <span className="text-[11px] text-foreground/35 shrink-0" style={{ fontFamily: "'Inter', sans-serif" }}>{key}</span>
              <span className="text-[11px] font-semibold text-foreground/70 text-right" style={{ fontFamily: "'Inter', sans-serif" }}>{String(value)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Files */}
      {fileEntries.length > 0 && (
        <div className="space-y-2">
          <div className="text-[10px] font-bold uppercase tracking-widest text-foreground/25 mb-2" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            Uploaded Files
          </div>
          {fileEntries.map(([key, file]) => (
            <div key={key} className="flex items-center gap-3 p-3 rounded-xl"
              style={{ background: "rgba(255,255,255,0.02)", border: "0.5px solid rgba(255,255,255,0.06)" }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: file.type === "pdf" ? "rgba(239,68,68,0.08)" : "rgba(59,130,246,0.08)", border: `0.5px solid ${file.type === "pdf" ? "rgba(239,68,68,0.2)" : "rgba(59,130,246,0.2)"}` }}>
                {file.type === "pdf" ? <FileText className="w-4 h-4 text-red-400" /> : <Eye className="w-4 h-4 text-blue-400" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-foreground/70 truncate" style={{ fontFamily: "'Inter', sans-serif" }}>{key}</div>
                <div className="text-[10px] text-foreground/30 font-mono">{file.name} · {file.size}</div>
              </div>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all"
                style={{ background: "rgba(255,255,255,0.04)", border: "0.5px solid rgba(255,255,255,0.1)", color: "hsl(var(--foreground) / 0.5)" }}>
                <Download className="w-3 h-3" /> Download
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Delivery Panel ────────────────────────────────────────────────────────────
function DeliveryPanel({ onDeliverySubmit }) {
  const [form, setForm] = useState({ liveUrl: "", adminUrl: "", adminUser: "", adminPass: "", docsUrl: "", releaseNotes: "", setupGuide: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 1500));
    setSubmitting(false);
    setSubmitted(true);
    onDeliverySubmit?.();
  };

  if (submitted) {
    return (
      <div className="text-center py-8">
        <CheckCircle className="w-10 h-10 mx-auto mb-3 text-emerald-400" />
        <p className="text-sm font-bold text-emerald-400" style={{ fontFamily: "'Inter', sans-serif" }}>Delivery submitted!</p>
        <p className="text-xs text-foreground/40 mt-1" style={{ fontFamily: "'Inter', sans-serif" }}>Client has been notified for review.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-[10px] font-bold uppercase tracking-widest text-foreground/30 mb-3" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
        Submit Delivery Package
      </div>
      {[
        { key: "liveUrl", label: "Live URL", placeholder: "https://yourproduct.com", icon: Globe },
        { key: "adminUrl", label: "Admin Panel URL", placeholder: "https://admin.yourproduct.com", icon: Settings },
        { key: "adminUser", label: "Admin Username", placeholder: "admin@client.com", icon: User },
        { key: "adminPass", label: "Admin Password", placeholder: "••••••••••", icon: Lock },
        { key: "docsUrl", label: "Documentation URL", placeholder: "https://docs.yourproduct.com", icon: FileText },
      ].map(({ key, label, placeholder, icon: Icon }) => (
        <div key={key}>
          <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/30 mb-1.5 block" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{label}</label>
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.08)" }}>
            <Icon className="w-4 h-4 text-foreground/25 shrink-0" />
            <input value={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
              placeholder={placeholder} type={key === "adminPass" ? "password" : "text"}
              className="flex-1 bg-transparent text-sm outline-none placeholder-foreground/20"
              style={{ color: "hsl(var(--foreground))", fontFamily: "'Inter', sans-serif" }} />
          </div>
        </div>
      ))}
      <div>
        <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/30 mb-1.5 block" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Release Notes</label>
        <textarea value={form.releaseNotes} onChange={e => setForm(p => ({ ...p, releaseNotes: e.target.value }))}
          placeholder="What was built, what's included, known limitations..." rows={4}
          className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none"
          style={{ background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.08)", color: "hsl(var(--foreground))", fontFamily: "'Inter', sans-serif", placeholder: "rgba(255,255,255,0.2)" }} />
      </div>
      <button onClick={handleSubmit} disabled={submitting || !form.liveUrl}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-40"
        style={{ background: "hsl(var(--foreground))", color: "hsl(var(--background))", fontFamily: "'Inter', sans-serif" }}>
        {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Rocket className="w-4 h-4" />}
        {submitting ? "Submitting..." : "Submit Delivery"}
      </button>
    </div>
  );
}

// ─── Message Drawer ────────────────────────────────────────────────────────────
function MessageDrawer({ order, onClose }) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    { from: "client", text: "Hi, when can I expect the first draft?", time: "10:22 AM" },
    { from: "dev", text: "Working on it! Will share a preview by end of day.", time: "10:45 AM" },
    { from: "client", text: "Great, please keep me updated on progress.", time: "11:03 AM" },
  ]);

  const send = () => {
    if (!message.trim()) return;
    setMessages(p => [...p, { from: "dev", text: message.trim(), time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) }]);
    setMessage("");
  };

  return (
    <motion.div className="fixed inset-0 z-50 flex items-end justify-end p-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
      onClick={onClose}>
      <motion.div className="w-full max-w-md h-[600px] rounded-2xl flex flex-col overflow-hidden"
        style={{ background: "rgba(0,0,0,0.97)", border: "0.5px solid rgba(150,150,150,0.2)", boxShadow: "0 40px 80px rgba(0,0,0,0.8)" }}
        initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
        onClick={e => e.stopPropagation()}>
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "0.5px solid rgba(150,150,150,0.1)" }}>
          <div>
            <h3 className="text-white font-bold text-sm" style={{ fontFamily: "Georgia, serif" }}>Order Chat</h3>
            <p className="text-[10px] font-mono text-foreground/30 mt-0.5">{order.id} · {order.clientEmail}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-foreground/30 hover:text-foreground hover:bg-foreground/5">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.from === "dev" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                m.from === "dev" ? "bg-foreground text-background rounded-br-sm" : "bg-foreground/8 text-foreground border border-foreground/8 rounded-bl-sm"
              }`} style={{ fontFamily: "'Inter', sans-serif" }}>
                {m.text}
                <div className={`text-[9px] mt-1 opacity-50 font-mono ${m.from === "dev" ? "text-right" : ""}`}>{m.time}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="p-4" style={{ borderTop: "0.5px solid rgba(150,150,150,0.1)" }}>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg text-foreground/30 hover:text-foreground/60 hover:bg-foreground/5"><Paperclip className="w-4 h-4" /></button>
            <input type="text" value={message} onChange={e => setMessage(e.target.value)}
              onKeyDown={e => e.key === "Enter" && send()}
              placeholder="Reply to client..."
              className="flex-1 bg-transparent text-sm text-foreground placeholder-foreground/25 outline-none"
              style={{ fontFamily: "'Inter', sans-serif" }} />
            <button onClick={send} className="p-2 rounded-lg bg-foreground text-background hover:bg-foreground/90 transition-all">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Order Card ────────────────────────────────────────────────────────────────
function OrderCard({ order, idx }) {
  const [expanded, setExpanded] = useState(false);
  const [activePanel, setActivePanel] = useState("config");
  const [showMessages, setShowMessages] = useState(false);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: idx * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="frosted-panel overflow-hidden"
      >
        {/* Header */}
        <div className="px-5 py-4 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "rgba(150,150,150,0.08)", border: "0.5px solid rgba(150,150,150,0.12)" }}>
            <Package className="w-4 h-4 text-foreground/60" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-bold text-sm text-foreground" style={{ fontFamily: "'Inter', sans-serif" }}>{order.productTitle}</h3>
                <p className="text-[11px] font-mono text-foreground/35 mt-0.5">{order.id} · {order.clientEmail}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <StatusBadge status={order.status} />
                <button onClick={() => setExpanded(p => !p)}
                  className="p-1.5 rounded-lg text-foreground/30 hover:text-foreground hover:bg-foreground/5">
                  <ChevronRight className={`w-4 h-4 transition-transform ${expanded ? "rotate-90" : ""}`} />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4 mt-3">
              <div>
                <span className="text-xl font-bold" style={{ fontFamily: "Georgia, serif" }}>₹{order.amount.toLocaleString()}</span>
                <span className="text-xs text-foreground/30 ml-1">INR</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-foreground/35 font-mono">
                <Calendar className="w-3 h-3" />{order.createdAt}
              </div>
              {order.eta && (
                <div className="flex items-center gap-1 text-xs text-foreground/35 font-mono">
                  <Rocket className="w-3 h-3" />ETA: {order.eta}
                </div>
              )}
              <div className="ml-auto flex items-center gap-2">
                <button onClick={() => setShowMessages(true)}
                  className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-foreground/10 text-foreground/50 hover:text-foreground hover:bg-foreground/5 transition-all">
                  <MessageSquare className="w-3.5 h-3.5" />
                  Messages
                  {order.messages > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-foreground text-background text-[9px] font-black flex items-center justify-center">
                      {order.messages}
                    </span>
                  )}
                </button>
              </div>
            </div>

            <OrderTimeline status={order.status} />
          </div>
        </div>

        {/* Expanded */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              style={{ borderTop: "0.5px solid hsl(var(--foreground) / 0.06)", overflow: "hidden" }}
            >
              {/* Panel Tabs */}
              <div className="flex items-center gap-1 px-5 pt-4 pb-0">
                {[
                  { id: "config", label: "Config Package", icon: Settings },
                  { id: "delivery", label: order.status === "COMPLETED" ? "Delivered" : "Submit Delivery", icon: Rocket },
                  { id: "escrow", label: "Escrow", icon: Shield },
                ].map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button key={tab.id} onClick={() => setActivePanel(tab.id)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-t-xl text-[11px] font-bold transition-all border-b-0"
                      style={{
                        background: activePanel === tab.id ? "rgba(255,255,255,0.05)" : "transparent",
                        border: `0.5px solid ${activePanel === tab.id ? "rgba(255,255,255,0.1)" : "transparent"}`,
                        color: activePanel === tab.id ? "hsl(var(--foreground) / 0.8)" : "hsl(var(--foreground) / 0.3)",
                        fontFamily: "'JetBrains Mono', monospace"
                      }}>
                      <Icon className="w-3.5 h-3.5" /> {tab.label}
                    </button>
                  );
                })}
              </div>

              <div className="px-5 py-5 rounded-b-2xl" style={{ background: "rgba(255,255,255,0.02)", margin: "0 16px 16px", borderRadius: 16, border: "0.5px solid rgba(255,255,255,0.06)" }}>
                {activePanel === "config" && <ConfigPackagePanel config={order.configPackage} />}
                {activePanel === "delivery" && <DeliveryPanel />}
                {activePanel === "escrow" && (
                  <div className="space-y-4">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-foreground/30 mb-3" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Escrow Status</div>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { label: "Amount Held", value: `₹${order.amount.toLocaleString()}`, color: "text-violet-400" },
                        { label: "Platform Fee", value: `₹${Math.round(order.amount * 0.12).toLocaleString()}`, color: "text-foreground/50" },
                        { label: "Your Payout", value: `₹${Math.round(order.amount * 0.88).toLocaleString()}`, color: "text-emerald-400" },
                        { label: "Status", value: order.escrow, color: order.escrow === "FUNDED" ? "text-violet-400" : order.escrow === "RELEASED" ? "text-emerald-400" : "text-red-400" },
                      ].map(item => (
                        <div key={item.label} className="p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.02)", border: "0.5px solid rgba(255,255,255,0.06)" }}>
                          <div className="text-[10px] text-foreground/30 mb-1" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{item.label}</div>
                          <div className={`text-sm font-bold ${item.color}`} style={{ fontFamily: "Georgia, serif" }}>{item.value}</div>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: "rgba(16,185,129,0.04)", border: "0.5px solid rgba(16,185,129,0.15)" }}>
                      <Lock className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-[11px] text-emerald-400/70" style={{ fontFamily: "'Inter', sans-serif" }}>
                        Payment released automatically when client approves delivery.
                      </span>
                    </div>
                    {order.status !== "COMPLETED" && order.status !== "DISPUTED" && (
                      <div className="flex gap-2">
                        <button className="flex-1 py-2.5 rounded-xl text-xs font-bold border border-foreground/10 text-foreground/50 hover:text-foreground hover:bg-foreground/5 transition-all"
                          style={{ fontFamily: "'Inter', sans-serif" }}>
                          Request Extension
                        </button>
                        <button className="flex-1 py-2.5 rounded-xl text-xs font-bold border border-red-500/20 text-red-400 hover:bg-red-400/5 transition-all"
                          style={{ fontFamily: "'Inter', sans-serif" }}>
                          Raise Dispute
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {showMessages && <MessageDrawer order={order} onClose={() => setShowMessages(false)} />}
      </AnimatePresence>
    </>
  );
}

// ─── Main Export ───────────────────────────────────────────────────────────────
export default function DevOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem("auth_token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await axios.get(`${API_URL}/orders/my`, {
          withCredentials: true,
          headers,
        });
        const data = res.data?.data || res.data?.orders || [];
        setOrders(Array.isArray(data) ? data : []);
      } catch {
        setOrders([]);
      }
      setLoading(false);
    };
    load();
  }, []);

  const FILTERS = ["ALL", "AWAITING_DEVELOPER", "IN_PROGRESS", "DELIVERED", "COMPLETED", "DISPUTED"];

  const filtered = orders.filter(o => {
    const matchFilter = filter === "ALL" || o.status === filter;
    const matchSearch = !search || (o.productTitle || "").toLowerCase().includes(search.toLowerCase()) || (o.clientEmail || "").toLowerCase().includes(search.toLowerCase()) || o.id.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const stats = {
    total: orders.length,
    active: orders.filter(o => ["ESCROW_FUNDED", "AWAITING_DEVELOPER", "IN_PROGRESS"].includes(o.status)).length,
    delivered: orders.filter(o => ["DELIVERED", "UNDER_REVIEW"].includes(o.status)).length,
    completed: orders.filter(o => o.status === "COMPLETED").length,
    revenue: orders.filter(o => o.status === "COMPLETED").reduce((s, o) => s + Math.round(o.amount * 0.88), 0),
  };

  if (loading) return (
    <div className="p-6 sm:p-8 max-w-5xl space-y-4">
      {[1, 2, 3].map(i => <div key={i} className="skeleton-beam rounded-2xl" style={{ height: 140 }} />)}
    </div>
  );

  return (
    <div className="p-6 sm:p-8 max-w-5xl page-fade-in">
      {/* Header */}
      <div className="mb-8">
        <div className="stat-label-caps mb-2">Developer · Order Management</div>
        <h1 className="text-white font-bold text-2xl sm:text-3xl section-title-gradient" style={{ fontFamily: "Georgia, serif", letterSpacing: "-0.04em" }}>
          Order Lifecycle
        </h1>
        <p className="text-sm mt-1.5" style={{ color: "hsl(var(--foreground) / 0.35)", fontFamily: "'Inter', sans-serif" }}>
          Full visibility into every order — from configuration package to delivery.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        {[
          { label: "Total Orders",   value: stats.total,     color: "text-foreground" },
          { label: "Active",         value: stats.active,    color: "text-indigo-400" },
          { label: "Delivered",      value: stats.delivered, color: "text-sky-400" },
          { label: "Completed",      value: stats.completed, color: "text-emerald-400" },
          { label: "Earned (₹)",     value: stats.revenue.toLocaleString(), color: "text-violet-400" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className="frosted-panel p-4">
            <div className={`text-2xl font-bold ${s.color}`} style={{ fontFamily: "Georgia, serif" }}>{s.value}</div>
            <div className="text-[10px] text-foreground/40 mt-0.5" style={{ fontFamily: "'Inter', sans-serif" }}>{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Filters + Search */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex items-center gap-1 p-1 rounded-xl flex-wrap" style={{ background: "rgba(150,150,150,0.05)", border: "0.5px solid rgba(150,150,150,0.1)" }}>
          {FILTERS.slice(0, 5).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${filter === f ? "bg-foreground text-background" : "text-foreground/40 hover:text-foreground/70"}`}
              style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              {f === "ALL" ? "All" : STATUS_CONFIG[f]?.label || f}
            </button>
          ))}
        </div>
        <div className="flex-1 flex items-center gap-2 px-3.5 py-2.5 rounded-xl" style={{ background: "rgba(150,150,150,0.05)", border: "0.5px solid rgba(150,150,150,0.1)" }}>
          <Search className="w-4 h-4 text-foreground/30" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by product, client, or order ID..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder-foreground/25 outline-none"
            style={{ fontFamily: "'Inter', sans-serif" }} />
        </div>
      </div>

      {/* Orders */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="frosted-panel p-12 text-center">
            <ShoppingBag className="w-10 h-10 mx-auto mb-3 text-foreground/15" />
            <p className="text-sm font-semibold text-foreground/40">No orders found</p>
            <p className="text-xs text-foreground/25 mt-1">Try adjusting your filters or search.</p>
          </div>
        ) : (
          filtered.map((o, i) => (
            <OrderCard key={o.id} order={o} idx={i} />
          ))
        )}
      </div>
    </div>
  );
}
