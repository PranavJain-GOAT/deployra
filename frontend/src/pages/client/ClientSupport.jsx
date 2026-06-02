import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HeadphonesIcon, Plus, X, Clock, CheckCircle,
  MessageSquare, Send, Paperclip, ChevronDown, ChevronUp,
  RefreshCw
} from "lucide-react";

const PRIORITY_CONFIG = {
  CRITICAL: { label: "Critical", color: "text-red-400",    bg: "bg-red-400/8",    border: "border-red-400/20",  sla: "2h"  },
  HIGH:     { label: "High",     color: "text-orange-400", bg: "bg-orange-400/8", border: "border-orange-400/20",sla: "8h"  },
  MEDIUM:   { label: "Medium",   color: "text-amber-400",  bg: "bg-amber-400/8",  border: "border-amber-400/20", sla: "24h" },
  LOW:      { label: "Low",      color: "text-blue-400",   bg: "bg-blue-400/8",   border: "border-blue-400/20",  sla: "48h" },
};

const STATUS_CONFIG = {
  OPEN:        { label: "Open",        color: "text-amber-400",  bg: "bg-amber-400/8",  border: "border-amber-400/20", icon: Clock       },
  IN_PROGRESS: { label: "In Progress", color: "text-blue-400",   bg: "bg-blue-400/8",   border: "border-blue-400/20",  icon: RefreshCw   },
  RESOLVED:    { label: "Resolved",    color: "text-emerald-400",bg: "bg-emerald-400/8",border: "border-emerald-400/20",icon: CheckCircle },
  CLOSED:      { label: "Closed",      color: "text-foreground/30",bg: "bg-foreground/3",border: "border-foreground/8", icon: X           },
};

const TICKETS = [
  {
    id: "T-201", subject: "AI Support Bot not responding to webhooks",
    category: "Integration", priority: "HIGH", status: "IN_PROGRESS",
    product: "AutoSupport Chatbot Pro", created: "May 27, 2025", lastUpdate: "1h ago",
    messages: [
      { from: "user",    text: "Our Slack webhook is returning 403 errors on all incoming messages. The bot was working fine until yesterday.", time: "May 27 · 9:14 AM" },
      { from: "support", text: "Thanks for reporting this. We're investigating. Can you share your webhook URL and the exact error response body?", time: "May 27 · 9:38 AM" },
      { from: "user",    text: "Here's the error: `{\"error\": \"Invalid signature\", \"code\": 403}`. The webhook URL is https://bot.acme.io/slack/events", time: "May 27 · 9:52 AM" },
      { from: "support", text: "Found the issue — your Slack signing secret was rotated but not updated in the bot configuration. I'll send a guide to update it.", time: "May 27 · 10:15 AM" },
    ]
  },
  {
    id: "T-200", subject: "Need custom data retention policy for EU compliance",
    category: "Compliance", priority: "CRITICAL", status: "OPEN",
    product: "DataFlow AI Pipeline", created: "May 28, 2025", lastUpdate: "30m ago",
    messages: [
      { from: "user",    text: "We need to configure a 90-day data retention policy per GDPR requirements. Is this configurable in the current version?", time: "May 28 · 2:00 PM" },
    ]
  },
  {
    id: "T-198", subject: "Analytics dashboard not loading on Firefox",
    category: "Bug", priority: "MEDIUM", status: "RESOLVED",
    product: "Analytics Core", created: "May 24, 2025", lastUpdate: "May 25",
    messages: [
      { from: "user",    text: "The main analytics dashboard shows a blank page on Firefox v125. Chrome works fine.", time: "May 24 · 11:00 AM" },
      { from: "support", text: "This was a CSS transform issue in Firefox. Patched in v3.1.3 — please redeploy to get the fix.", time: "May 25 · 9:00 AM" },
      { from: "user",    text: "Redeployed and confirmed fixed. Thank you!", time: "May 25 · 10:15 AM" },
    ]
  },
];

function PriorityBadge({ priority }) {
  const cfg = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.MEDIUM;
  return <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${cfg.color} ${cfg.bg} ${cfg.border}`}>{cfg.label} · SLA {cfg.sla}</span>;
}

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.OPEN;
  const Icon = cfg.icon;
  return <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border ${cfg.color} ${cfg.bg} ${cfg.border}`}><Icon className="w-3 h-3" />{cfg.label}</span>;
}

function TicketCard({ ticket, idx }) {
  const [expanded, setExpanded] = useState(false);
  const [reply, setReply] = useState("");
  const [messages, setMessages] = useState(ticket.messages);

  const handleReply = () => {
    if (!reply.trim()) return;
    setMessages(p => [...p, { from: "user", text: reply.trim(), time: "Just now" }]);
    setReply("");
  };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.09, duration: 0.4 }}
      className="frosted-panel overflow-hidden"
    >
      <div className="px-5 py-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono text-foreground/30">{ticket.id}</span>
              <PriorityBadge priority={ticket.priority} />
              <StatusBadge status={ticket.status} />
            </div>
            <h3 className="font-bold text-sm text-foreground">{ticket.subject}</h3>
            <p className="text-[10px] font-mono text-foreground/30 mt-0.5">{ticket.category} · {ticket.product} · {ticket.created}</p>
          </div>
          <button onClick={() => setExpanded(p => !p)} className="p-1.5 rounded-lg text-foreground/30 hover:text-foreground hover:bg-foreground/5 shrink-0">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[10px] text-foreground/25 font-mono">Last update: {ticket.lastUpdate}</span>
          <button onClick={() => setExpanded(p => !p)} className="text-xs font-semibold text-foreground/40 hover:text-foreground flex items-center gap-1">
            <MessageSquare className="w-3.5 h-3.5" />
            {messages.length} {messages.length === 1 ? "message" : "messages"}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} style={{ overflow: "hidden", borderTop: "0.5px solid hsl(var(--foreground) / 0.06)" }}>
            <div className="p-5">
              {/* Message Thread */}
              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto premium-scroll">
                {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed ${
                      m.from === "user"
                        ? "bg-foreground text-background rounded-br-sm"
                        : "bg-foreground/6 text-foreground border border-foreground/8 rounded-bl-sm"
                    }`}>
                      <p>{m.text}</p>
                      <div className={`text-[9px] mt-1 opacity-40 font-mono ${m.from === "user" ? "text-right" : ""}`}>{m.time}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Reply */}
              {ticket.status !== "CLOSED" && ticket.status !== "RESOLVED" && (
                <div className="flex items-center gap-2 px-3.5 py-3 rounded-xl" style={{ background: "rgba(150,150,150,0.04)", border: "0.5px solid rgba(150,150,150,0.09)" }}>
                  <button className="p-1 text-foreground/30 hover:text-foreground/60"><Paperclip className="w-3.5 h-3.5" /></button>
                  <input
                    type="text"
                    value={reply}
                    onChange={e => setReply(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleReply()}
                    placeholder="Add a reply..."
                    className="flex-1 bg-transparent text-xs text-foreground placeholder-foreground/25 outline-none"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  />
                  <button onClick={handleReply} disabled={!reply.trim()} className="p-2 rounded-lg bg-foreground text-background hover:bg-foreground/90 transition-all disabled:opacity-30">
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

const NEW_TICKET_CATEGORIES = ["Integration", "Bug", "Performance", "Billing", "Compliance", "Feature Request", "Other"];
const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

export default function ClientSupport() {
  const [showNew, setShowNew] = useState(false);
  const [newTicket, setNewTicket] = useState({ subject: "", category: "Integration", priority: "MEDIUM", description: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [tickets, setTickets] = useState(TICKETS);
  const [filterStatus, setFilterStatus] = useState("ALL");

  const handleSubmit = () => {
    if (!newTicket.subject || !newTicket.description) return;
    setSubmitting(true);
    setTimeout(() => {
      setTickets(p => [{
        id: `T-${202 + p.length}`, subject: newTicket.subject, category: newTicket.category,
        priority: newTicket.priority, status: "OPEN", product: "General", created: "Just now", lastUpdate: "Just now",
        messages: [{ from: "user", text: newTicket.description, time: "Just now" }]
      }, ...p]);
      setSubmitting(false);
      setSubmitted(true);
      setTimeout(() => { setSubmitted(false); setShowNew(false); setNewTicket({ subject: "", category: "Integration", priority: "MEDIUM", description: "" }); }, 2000);
    }, 1800);
  };

  const filtered = tickets.filter(t => filterStatus === "ALL" || t.status === filterStatus);

  return (
    <div className="p-6 sm:p-8 max-w-4xl page-fade-in">

      {/* Header */}
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <div className="stat-label-caps mb-2">Business Hub · Support</div>
          <h1 className="text-white font-bold text-2xl sm:text-3xl section-title-gradient" style={{ fontFamily: "Georgia, serif", letterSpacing: "-0.04em" }}>
            Support Tickets
          </h1>
          <p className="text-sm mt-1.5" style={{ color: "hsl(var(--foreground) / 0.35)", fontFamily: "'Inter', sans-serif" }}>
            Priority-based ticketing with SLA guarantees on every plan.
          </p>
        </div>
        <button onClick={() => setShowNew(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-foreground text-background hover:bg-foreground/90 transition-all shrink-0">
          <Plus className="w-4 h-4" />
          New Ticket
        </button>
      </div>

      {/* SLA Banner */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="frosted-panel p-4 mb-6 grid grid-cols-2 sm:grid-cols-4 gap-4"
      >
        {Object.entries(PRIORITY_CONFIG).map(([k, v]) => (
          <div key={k} className="text-center">
            <div className={`text-lg font-bold metric-num ${v.color}`}>{v.sla}</div>
            <div className={`text-[10px] font-bold uppercase tracking-widest ${v.color}`}>{v.label}</div>
            <div className="stat-label-caps mt-0.5">SLA Guarantee</div>
          </div>
        ))}
      </motion.div>

      {/* Status Filter */}
      <div className="flex items-center gap-1 mb-5 p-1 rounded-xl inline-flex" style={{ background: "rgba(150,150,150,0.05)", border: "0.5px solid rgba(150,150,150,0.1)" }}>
        {["ALL", "OPEN", "IN_PROGRESS", "RESOLVED"].map(s => (
          <button key={s} onClick={() => setFilterStatus(s)}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${filterStatus === s ? "bg-foreground text-background" : "text-foreground/40 hover:text-foreground/70"}`}
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            {s === "ALL" ? "All" : STATUS_CONFIG[s]?.label || s}
          </button>
        ))}
      </div>

      {/* Tickets */}
      <div className="space-y-4">
        {filtered.map((t, i) => <TicketCard key={t.id} ticket={t} idx={i} />)}
      </div>

      {/* New Ticket Modal */}
      <AnimatePresence>
        {showNew && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }} onClick={() => setShowNew(false)}>
            <motion.div className="w-full max-w-lg rounded-2xl p-6" style={{ background: "rgba(0,0,0,0.97)", border: "0.5px solid rgba(150,150,150,0.2)", boxShadow: "0 40px 80px rgba(0,0,0,0.8)" }} initial={{ scale: 0.94, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.94, y: 20 }} onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-white font-bold" style={{ fontFamily: "Georgia, serif" }}>New Support Ticket</h3>
                <button onClick={() => setShowNew(false)} className="p-2 rounded-lg text-foreground/30 hover:text-foreground hover:bg-foreground/5"><X className="w-4 h-4" /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="stat-label-caps mb-1.5 block">Subject</label>
                  <input type="text" value={newTicket.subject} onChange={e => setNewTicket(p => ({ ...p, subject: e.target.value }))} placeholder="Brief description of your issue" className="w-full px-4 py-3 rounded-xl border border-foreground/10 bg-transparent text-sm text-foreground placeholder-foreground/25 outline-none focus:border-foreground/25 transition-all" style={{ fontFamily: "'Inter', sans-serif" }} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="stat-label-caps mb-1.5 block">Category</label>
                    <select value={newTicket.category} onChange={e => setNewTicket(p => ({ ...p, category: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-foreground/10 bg-transparent text-sm text-foreground outline-none">
                      {NEW_TICKET_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="stat-label-caps mb-1.5 block">Priority</label>
                    <select value={newTicket.priority} onChange={e => setNewTicket(p => ({ ...p, priority: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border border-foreground/10 bg-transparent text-sm text-foreground outline-none">
                      {PRIORITIES.map(p => <option key={p} value={p}>{PRIORITY_CONFIG[p].label} ({PRIORITY_CONFIG[p].sla} SLA)</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="stat-label-caps mb-1.5 block">Description</label>
                  <textarea value={newTicket.description} onChange={e => setNewTicket(p => ({ ...p, description: e.target.value }))} placeholder="Describe the issue in detail — include error messages, steps to reproduce, and expected behavior..." rows={4} className="w-full px-4 py-3 rounded-xl border border-foreground/10 bg-transparent text-sm text-foreground placeholder-foreground/25 outline-none resize-none focus:border-foreground/25 transition-all" style={{ fontFamily: "'Inter', sans-serif" }} />
                </div>
                <button onClick={handleSubmit} disabled={submitting || submitted || !newTicket.subject || !newTicket.description}
                  className={`w-full py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-40 ${submitted ? "bg-emerald-400/10 text-emerald-400 border border-emerald-400/20" : "bg-foreground text-background hover:bg-foreground/90"}`}
                >
                  {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : submitted ? <CheckCircle className="w-4 h-4" /> : <HeadphonesIcon className="w-4 h-4" />}
                  {submitting ? "Submitting..." : submitted ? "Ticket Created!" : "Submit Ticket"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
