import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag, Clock, CheckCircle, AlertTriangle, ChevronRight,
  MessageSquare, Upload, X, Download, Eye, Filter,
  DollarSign, Shield, Rocket, FileText, RefreshCw, Search,
  ArrowUpRight, MoreHorizontal, Paperclip, Send
} from "lucide-react";
import axios from "axios";
import { API_URL } from "@/lib/config";

// ─── Order Status Config ───────────────────────────────────────────────────────
const STATUS_CONFIG = {
  PENDING:          { label: "Pending",          color: "text-amber-400",   bg: "bg-amber-400/8",   border: "border-amber-400/20",  step: 0 },
  CONFIG_REQUESTED: { label: "Config Requested", color: "text-blue-400",    bg: "bg-blue-400/8",    border: "border-blue-400/20",   step: 1 },
  ESCROW_FUNDED:    { label: "Escrow Funded",    color: "text-violet-400",  bg: "bg-violet-400/8",  border: "border-violet-400/20", step: 2 },
  IN_DEVELOPMENT:   { label: "In Development",   color: "text-indigo-400",  bg: "bg-indigo-400/8",  border: "border-indigo-400/20", step: 3 },
  DEPLOYING:        { label: "Deploying",        color: "text-sky-400",     bg: "bg-sky-400/8",     border: "border-sky-400/20",    step: 4 },
  TESTING:          { label: "Testing",          color: "text-cyan-400",    bg: "bg-cyan-400/8",    border: "border-cyan-400/20",   step: 5 },
  COMPLETED:        { label: "Completed",        color: "text-emerald-400", bg: "bg-emerald-400/8", border: "border-emerald-400/20",step: 6 },
  REFUNDED:         { label: "Refunded",         color: "text-orange-400",  bg: "bg-orange-400/8",  border: "border-orange-400/20", step: -1 },
  DISPUTED:         { label: "Disputed",         color: "text-red-400",     bg: "bg-red-400/8",     border: "border-red-400/20",    step: -1 },
};

const TIMELINE_STEPS = [
  { key: "PENDING",          label: "Order Placed",     icon: ShoppingBag },
  { key: "ESCROW_FUNDED",    label: "Escrow Funded",    icon: Shield      },
  { key: "IN_DEVELOPMENT",   label: "Development",      icon: FileText    },
  { key: "DEPLOYING",        label: "Deployment",       icon: Rocket      },
  { key: "TESTING",          label: "Testing & QA",     icon: CheckCircle },
  { key: "COMPLETED",        label: "Completed",        icon: CheckCircle },
];

// Mock orders enriched for dev experience
const MOCK_ORDERS = [
  {
    id: "ORD-7842", productTitle: "AI Support Chatbot", clientEmail: "cto@acme.io",
    amount: 299, status: "IN_DEVELOPMENT", escrow: "FUNDED", createdAt: "2025-05-24",
    deliverables: [], messages: 3, eta: "Jun 2, 2025"
  },
  {
    id: "ORD-7841", productTitle: "Data Pipeline Pro", clientEmail: "ops@techcorp.com",
    amount: 499, status: "ESCROW_FUNDED", escrow: "FUNDED", createdAt: "2025-05-22",
    deliverables: [], messages: 1, eta: "Jun 8, 2025"
  },
  {
    id: "ORD-7836", productTitle: "E-Commerce Analytics", clientEmail: "analytics@shop.co",
    amount: 149, status: "COMPLETED", escrow: "RELEASED", createdAt: "2025-05-15",
    deliverables: ["setup_guide.pdf", "config.env"], messages: 0, eta: "Delivered"
  },
  {
    id: "ORD-7831", productTitle: "CRM Integration Suite", clientEmail: "dev@startup.vc",
    amount: 799, status: "DISPUTED", escrow: "DISPUTED", createdAt: "2025-05-10",
    deliverables: [], messages: 7, eta: "Under Review"
  },
];

// ─── Status Badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${cfg.color} ${cfg.bg} ${cfg.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.color.replace("text-", "bg-")}`} />
      {cfg.label}
    </span>
  );
}

// ─── Order Timeline ────────────────────────────────────────────────────────────
function OrderTimeline({ status }) {
  const cfg = STATUS_CONFIG[status];
  const currentStep = cfg?.step ?? -1;
  if (currentStep < 0) return null;

  return (
    <div className="flex items-center gap-0 w-full mt-4">
      {TIMELINE_STEPS.map((step, i) => {
        const done = i < currentStep;
        const active = i === currentStep;
        return (
          <div key={step.key} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center border transition-all ${
                done ? "bg-emerald-400/15 border-emerald-400/40" :
                active ? "bg-foreground/15 border-foreground/40 ring-2 ring-foreground/15" :
                "bg-foreground/5 border-foreground/10"
              }`}>
                <step.icon className={`w-3 h-3 ${done ? "text-emerald-400" : active ? "text-foreground" : "text-foreground/25"}`} />
              </div>
              <span className={`text-[8px] font-bold mt-1 whitespace-nowrap ${active ? "text-foreground" : "text-foreground/25"}`} style={{ fontFamily: "'Inter', sans-serif" }}>
                {step.label}
              </span>
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

// ─── Message Drawer ────────────────────────────────────────────────────────────
function MessageDrawer({ order, onClose }) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    { from: "client", text: "Hi, can you provide deployment ETA?", time: "10:22 AM" },
    { from: "dev",    text: "We're targeting June 2nd. CI/CD is 60% complete.", time: "10:45 AM" },
    { from: "client", text: "Great, please share the staging link when ready.", time: "11:03 AM" },
  ]);

  const send = () => {
    if (!message.trim()) return;
    setMessages(p => [...p, { from: "dev", text: message.trim(), time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) }]);
    setMessage("");
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end justify-end p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <motion.div
        className="w-full max-w-md h-[600px] rounded-2xl flex flex-col overflow-hidden"
        style={{ background: "rgba(0,0,0,0.97)", border: "0.5px solid rgba(150,150,150,0.2)", boxShadow: "0 40px 80px rgba(0,0,0,0.8)" }}
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "0.5px solid rgba(150,150,150,0.1)" }}>
          <div>
            <h3 className="text-white font-bold text-sm" style={{ fontFamily: "Georgia, serif" }}>Order Chat</h3>
            <p className="stat-label-caps mt-0.5">{order.id} · {order.clientEmail}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-foreground/30 hover:text-foreground hover:bg-foreground/5">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 premium-scroll">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.from === "dev" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                m.from === "dev"
                  ? "bg-foreground text-background rounded-br-sm"
                  : "bg-foreground/8 text-foreground border border-foreground/8 rounded-bl-sm"
              }`} style={{ fontFamily: "'Inter', sans-serif" }}>
                {m.text}
                <div className={`text-[9px] mt-1 opacity-50 font-mono ${m.from === "dev" ? "text-right" : ""}`}>{m.time}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="p-4" style={{ borderTop: "0.5px solid rgba(150,150,150,0.1)" }}>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg text-foreground/30 hover:text-foreground/60 hover:bg-foreground/5">
              <Paperclip className="w-4 h-4" />
            </button>
            <input
              type="text"
              value={message}
              onChange={e => setMessage(e.target.value)}
              onKeyDown={e => e.key === "Enter" && send()}
              placeholder="Reply to client..."
              className="flex-1 bg-transparent text-sm text-foreground placeholder-foreground/25 outline-none"
              style={{ fontFamily: "'Inter', sans-serif" }}
            />
            <button
              onClick={send}
              className="p-2 rounded-lg bg-foreground text-background hover:bg-foreground/90 transition-all"
            >
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
  const [showMessages, setShowMessages] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleUpload = () => {
    setUploading(true);
    setTimeout(() => setUploading(false), 2000);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: idx * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="frosted-panel overflow-hidden"
      >
        {/* Card Header */}
        <div className="px-5 py-4 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(150,150,150,0.08)", border: "0.5px solid rgba(150,150,150,0.12)" }}>
            <ShoppingBag className="w-4 h-4 text-foreground/60" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-bold text-sm text-foreground" style={{ fontFamily: "'Inter', sans-serif" }}>{order.productTitle}</h3>
                <p className="text-[11px] font-mono text-foreground/35 mt-0.5">{order.id} · {order.clientEmail}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <StatusBadge status={order.status} />
                <button onClick={() => setExpanded(p => !p)} className="p-1.5 rounded-lg text-foreground/30 hover:text-foreground hover:bg-foreground/5">
                  <ChevronRight className={`w-4 h-4 transition-transform ${expanded ? "rotate-90" : ""}`} />
                </button>
              </div>
            </div>

            {/* Row 2 */}
            <div className="flex items-center gap-4 mt-3">
              <div>
                <span className="text-xl font-bold metric-num" style={{ fontFamily: "Georgia, serif" }}>${order.amount}</span>
                <span className="text-xs text-foreground/30 ml-1">USD</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-foreground/35 font-mono">
                <Clock className="w-3 h-3" />
                {order.createdAt}
              </div>
              {order.eta && (
                <div className="flex items-center gap-1 text-xs text-foreground/35 font-mono">
                  <Rocket className="w-3 h-3" />
                  ETA: {order.eta}
                </div>
              )}
              <div className="ml-auto flex items-center gap-2">
                <button
                  onClick={() => setShowMessages(true)}
                  className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-foreground/10 text-foreground/50 hover:text-foreground hover:bg-foreground/5 transition-all"
                >
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

            {/* Timeline */}
            <OrderTimeline status={order.status} />
          </div>
        </div>

        {/* Expanded Details */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              style={{ borderTop: "0.5px solid hsl(var(--foreground) / 0.06)", overflow: "hidden" }}
            >
              <div className="px-5 py-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Escrow Status */}
                <div className="p-3.5 rounded-xl" style={{ background: "hsl(var(--foreground) / 0.03)", border: "0.5px solid hsl(var(--foreground) / 0.06)" }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-3.5 h-3.5 text-foreground/50" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/35">Escrow</span>
                  </div>
                  <span className={`text-sm font-bold ${order.escrow === "FUNDED" ? "text-violet-400" : order.escrow === "RELEASED" ? "text-emerald-400" : "text-red-400"}`}>
                    {order.escrow}
                  </span>
                  <p className="text-[10px] text-foreground/30 mt-1 font-mono">${order.amount} held by Deployra</p>
                </div>

                {/* Deliverables */}
                <div className="p-3.5 rounded-xl" style={{ background: "hsl(var(--foreground) / 0.03)", border: "0.5px solid hsl(var(--foreground) / 0.06)" }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5 text-foreground/50" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/35">Deliverables</span>
                    </div>
                    <button onClick={handleUpload} className="p-1 rounded-lg text-foreground/30 hover:text-foreground hover:bg-foreground/5">
                      {uploading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                    </button>
                  </div>
                  {order.deliverables.length === 0 ? (
                    <p className="text-[11px] text-foreground/25">No files uploaded yet</p>
                  ) : (
                    <div className="space-y-1">
                      {order.deliverables.map(f => (
                        <div key={f} className="flex items-center gap-2 text-[11px] text-foreground/60">
                          <FileText className="w-3 h-3 shrink-0" />
                          {f}
                          <Download className="w-3 h-3 ml-auto text-foreground/30 hover:text-foreground cursor-pointer" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="p-3.5 rounded-xl space-y-2" style={{ background: "hsl(var(--foreground) / 0.03)", border: "0.5px solid hsl(var(--foreground) / 0.06)" }}>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/35 block mb-3">Actions</span>
                  {order.status !== "COMPLETED" && order.status !== "DISPUTED" && (
                    <button className="w-full py-2 rounded-lg text-xs font-bold bg-foreground text-background hover:bg-foreground/90 transition-all">
                      Mark Completed
                    </button>
                  )}
                  <button className="w-full py-2 rounded-lg text-xs font-semibold border border-foreground/10 text-foreground/50 hover:text-foreground hover:bg-foreground/5 transition-all">
                    Request More Info
                  </button>
                  {order.status !== "DISPUTED" && (
                    <button className="w-full py-2 rounded-lg text-xs font-semibold border border-red-500/20 text-red-400 hover:bg-red-400/5 transition-all">
                      Raise Dispute
                    </button>
                  )}
                </div>
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

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function DevOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get(`${API_URL}/orders/my`);
        const data = res.data?.data || res.data?.orders || [];
        setOrders(data.length > 0 ? data : MOCK_ORDERS);
      } catch {
        setOrders(MOCK_ORDERS);
      }
      setLoading(false);
    };
    load();
  }, []);

  const FILTERS = ["ALL", "PENDING", "ESCROW_FUNDED", "IN_DEVELOPMENT", "COMPLETED", "DISPUTED"];

  const filtered = orders.filter(o => {
    const matchFilter = filter === "ALL" || o.status === filter;
    const matchSearch = !search || (o.productTitle || o.product?.title || "").toLowerCase().includes(search.toLowerCase()) || (o.clientEmail || "").toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const summaryStats = {
    total: orders.length,
    pending: orders.filter(o => ["PENDING", "CONFIG_REQUESTED"].includes(o.status)).length,
    active: orders.filter(o => ["ESCROW_FUNDED", "IN_DEVELOPMENT", "DEPLOYING", "TESTING"].includes(o.status)).length,
    completed: orders.filter(o => o.status === "COMPLETED").length,
  };

  if (loading) return (
    <div className="p-6 sm:p-8 max-w-5xl space-y-4">
      {[1,2,3].map(i => <div key={i} className="skeleton-beam rounded-2xl" style={{ height: 140 }} />)}
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
          Full visibility into every order's journey from placement to delivery.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total Orders",    value: summaryStats.total,     color: "text-foreground" },
          { label: "Pending Action",  value: summaryStats.pending,   color: "text-amber-400" },
          { label: "Active",          value: summaryStats.active,    color: "text-indigo-400" },
          { label: "Completed",       value: summaryStats.completed, color: "text-emerald-400" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className="frosted-panel p-4"
          >
            <div className={`text-2xl font-bold metric-num ${s.color}`} style={{ fontFamily: "Georgia, serif" }}>{s.value}</div>
            <div className="text-xs text-foreground/40 mt-0.5" style={{ fontFamily: "'Inter', sans-serif" }}>{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Filters + Search */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: "rgba(150,150,150,0.05)", border: "0.5px solid rgba(150,150,150,0.1)" }}>
          {FILTERS.slice(0, 4).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${filter === f ? "bg-foreground text-background" : "text-foreground/40 hover:text-foreground/70"}`}
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              {f === "ALL" ? "All" : STATUS_CONFIG[f]?.label || f}
            </button>
          ))}
        </div>
        <div className="flex-1 flex items-center gap-2 px-3.5 py-2.5 rounded-xl" style={{ background: "rgba(150,150,150,0.05)", border: "0.5px solid rgba(150,150,150,0.1)" }}>
          <Search className="w-4 h-4 text-foreground/30" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by product or client..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder-foreground/25 outline-none"
            style={{ fontFamily: "'Inter', sans-serif" }}
          />
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
            <OrderCard key={o.id} order={{ ...o, productTitle: o.productTitle || o.product?.title || "Product", clientEmail: o.clientEmail || o.user?.email || o.details || "—" }} idx={i} />
          ))
        )}
      </div>
    </div>
  );
}
