import { useState } from "react";
import { motion } from "framer-motion";
import {
  Shield, CheckCircle, Clock, AlertTriangle, RefreshCw, Info
} from "lucide-react";

const ESCROW_ITEMS = [
  {
    id: "ESC-001", orderId: "ORD-7842", product: "AI Support Chatbot",
    vendor: "BotLabs Inc.", amount: 299, status: "FUNDED",
    fundedAt: "May 24, 2025", estimatedRelease: "Jun 2, 2025",
    description: "Awaiting successful deployment verification before funds are released to developer.",
    steps: [
      { label: "Funds deposited to Deployra escrow", done: true,   time: "May 24" },
      { label: "Developer notified",                 done: true,   time: "May 24" },
      { label: "Development completed",              done: false,  time: "Est. Jun 1" },
      { label: "You verify delivery",                done: false,  time: "After delivery" },
      { label: "Funds released to developer",        done: false,  time: "After verification" },
    ]
  },
  {
    id: "ESC-002", orderId: "ORD-7841", product: "Data Pipeline Pro",
    vendor: "Priya Systems", amount: 499, status: "FUNDED",
    fundedAt: "May 22, 2025", estimatedRelease: "Jun 8, 2025",
    description: "Escrow funded. Developer has started configuration.",
    steps: [
      { label: "Funds deposited to Deployra escrow", done: true,   time: "May 22" },
      { label: "Developer notified",                 done: true,   time: "May 22" },
      { label: "Development completed",              done: false,  time: "Est. Jun 6" },
      { label: "You verify delivery",                done: false,  time: "After delivery" },
      { label: "Funds released to developer",        done: false,  time: "After verification" },
    ]
  },
  {
    id: "ESC-003", orderId: "ORD-7836", product: "E-Commerce Analytics",
    vendor: "MetricFlow", amount: 149, status: "RELEASED",
    fundedAt: "May 10, 2025", estimatedRelease: "May 18, 2025",
    description: "Funds released after successful deployment confirmation.",
    steps: [
      { label: "Funds deposited to Deployra escrow", done: true,   time: "May 10" },
      { label: "Developer notified",                 done: true,   time: "May 10" },
      { label: "Development completed",              done: true,   time: "May 17" },
      { label: "You verified delivery",              done: true,   time: "May 18" },
      { label: "Funds released to developer",        done: true,   time: "May 18" },
    ]
  },
  {
    id: "ESC-004", orderId: "ORD-7831", product: "CRM Integration Suite",
    vendor: "GrowthStack", amount: 799, status: "DISPUTED",
    fundedAt: "May 8, 2025", estimatedRelease: "TBD",
    description: "Dispute in progress. Deployra Mediation Team reviewing case. Expected resolution: 5 business days.",
    steps: [
      { label: "Funds deposited to Deployra escrow", done: true,   time: "May 8" },
      { label: "Developer notified",                 done: true,   time: "May 8" },
      { label: "Dispute filed",                      done: true,   time: "May 12" },
      { label: "Mediation in progress",              done: true,   time: "May 13" },
      { label: "Resolution pending",                 done: false,  time: "~May 22" },
    ]
  },
];

const STATUS_CFG = {
  FUNDED:   { label: "Escrow Funded",  color: "text-violet-400",  bg: "bg-violet-400/8",   border: "border-violet-400/20",  icon: Shield  },
  RELEASED: { label: "Released",       color: "text-emerald-400", bg: "bg-emerald-400/8",  border: "border-emerald-400/20", icon: CheckCircle },
  DISPUTED: { label: "Disputed",       color: "text-red-400",     bg: "bg-red-400/8",      border: "border-red-400/20",     icon: AlertTriangle },
  REFUNDED: { label: "Refunded",       color: "text-amber-400",   bg: "bg-amber-400/8",    border: "border-amber-400/20",   icon: RefreshCw },
};

function EscrowCard({ item, idx }) {
  const [releasing, setReleasing] = useState(false);
  const [released, setReleased] = useState(item.status === "RELEASED");


  const cfg = STATUS_CFG[item.status] || STATUS_CFG.FUNDED;
  const CFGIcon = cfg.icon;

  const handleRelease = () => {
    setReleasing(true);
    setTimeout(() => { setReleasing(false); setReleased(true); }, 2000);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1, duration: 0.4 }}
      className="frosted-panel overflow-hidden"
    >
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-sm text-foreground">{item.product}</span>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${cfg.color} ${cfg.bg} ${cfg.border}`}>
                <CFGIcon className="w-3 h-3" />
                {cfg.label}
              </span>
            </div>
            <p className="text-[10px] font-mono text-foreground/30">{item.id} · {item.orderId} · {item.vendor}</p>
          </div>
          <div className="text-right shrink-0">
            <div className="text-2xl font-bold metric-num" style={{ fontFamily: "Georgia, serif" }}>${item.amount}</div>
            <div className="text-[10px] font-mono text-foreground/30 mt-0.5">USD</div>
          </div>
        </div>

        {/* Description */}
        <div className="flex items-start gap-2 p-3 rounded-xl mb-4" style={{ background: "rgba(150,150,150,0.03)", border: "0.5px solid rgba(150,150,150,0.07)" }}>
          <Info className="w-3.5 h-3.5 text-foreground/30 shrink-0 mt-0.5" />
          <p className="text-xs text-foreground/50 leading-relaxed">{item.description}</p>
        </div>

        {/* Timeline */}
        <div className="space-y-2 mb-4">
          {item.steps.map((step, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${step.done ? "bg-emerald-400/15 border border-emerald-400/30" : "bg-foreground/5 border border-foreground/10"}`}>
                {step.done ? <CheckCircle className="w-3 h-3 text-emerald-400" /> : <Clock className="w-3 h-3 text-foreground/20" />}
              </div>
              <div className="flex-1">
                <span className={`text-xs ${step.done ? "text-foreground/70" : "text-foreground/30"}`}>{step.label}</span>
              </div>
              <span className="text-[9px] font-mono text-foreground/20">{step.time}</span>
              {i < item.steps.length - 1 && (
                <div className="absolute left-[28px] w-px" style={{ display: "none" }} />
              )}
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="text-[10px] font-mono text-foreground/25">Funded: {item.fundedAt} · Est. release: {item.estimatedRelease}</div>
          <div className="ml-auto flex items-center gap-2">
            {item.status === "FUNDED" && !released && (
              <>
                <button onClick={handleRelease} disabled={releasing}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-400/10 text-emerald-400 border border-emerald-400/20 hover:bg-emerald-400/15 transition-all disabled:opacity-40"
                >
                  {releasing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                  {releasing ? "Releasing..." : "Release Funds"}
                </button>
                <button onClick={() => alert("Your dispute request has been sent to our mediation team. We will contact you within 24 hours.")}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border border-red-400/20 text-red-400 hover:bg-red-400/5 transition-all"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Dispute
                </button>
              </>
            )}
            {released && item.status !== "RELEASED" && (
              <span className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold">
                <CheckCircle className="w-3.5 h-3.5" /> Funds Released
              </span>
            )}
            {item.status === "DISPUTED" && (
              <span className="flex items-center gap-1.5 text-amber-400 text-xs font-semibold">
                <AlertTriangle className="w-3.5 h-3.5" /> Mediation Active
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function ClientEscrow() {
  const held     = ESCROW_ITEMS.filter(e => e.status === "FUNDED").reduce((s, e) => s + e.amount, 0);
  const released = ESCROW_ITEMS.filter(e => e.status === "RELEASED").reduce((s, e) => s + e.amount, 0);
  const disputed = ESCROW_ITEMS.filter(e => e.status === "DISPUTED").reduce((s, e) => s + e.amount, 0);

  return (
    <div className="p-6 sm:p-8 max-w-4xl page-fade-in">

      {/* Header */}
      <div className="mb-8">
        <div className="stat-label-caps mb-2">Business Hub · Finance & Trust</div>
        <h1 className="text-white font-bold text-2xl sm:text-3xl section-title-gradient" style={{ fontFamily: "Georgia, serif", letterSpacing: "-0.04em" }}>
          Escrow Tracker
        </h1>
        <p className="text-sm mt-1.5" style={{ color: "hsl(var(--foreground) / 0.35)", fontFamily: "'Inter', sans-serif" }}>
          Deployra holds all payments in escrow until you confirm delivery. Your funds are always protected.
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "Currently Held",  value: `$${held}`,     sub: "In active escrow",   color: "text-violet-400"  },
          { label: "Total Released",  value: `$${released}`, sub: "All time",           color: "text-emerald-400" },
          { label: "In Dispute",      value: `$${disputed}`, sub: "Under mediation",    color: "text-red-400"     },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className="frosted-panel p-5"
          >
            <div className={`text-2xl font-bold metric-num ${s.color}`} style={{ fontFamily: "Georgia, serif" }}>{s.value}</div>
            <div className="text-xs font-semibold text-foreground/60 mt-0.5">{s.label}</div>
            <div className="stat-label-caps mt-1">{s.sub}</div>
          </motion.div>
        ))}
      </div>

      {/* Info Banner */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
        className="frosted-panel p-4 mb-6 flex items-start gap-3"
      >
        <Shield className="w-5 h-5 text-foreground/50 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-foreground">How Deployra Escrow Works</p>
          <p className="text-xs text-foreground/45 mt-1 leading-relaxed">
            When you place an order, payment is held securely by Deployra. Funds are only released to the developer after you verify the delivery meets your requirements. If there's a problem, you can open a dispute and our mediation team will review within 5 business days.
          </p>
        </div>
      </motion.div>

      {/* Escrow Items */}
      <div className="space-y-4">
        {ESCROW_ITEMS.map((item, i) => <EscrowCard key={item.id} item={item} idx={i} />)}
      </div>
    </div>
  );
}
