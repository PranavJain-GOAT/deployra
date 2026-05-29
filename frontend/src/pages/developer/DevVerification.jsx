import { useState } from "react";
import { motion } from "framer-motion";
import { CheckSquare, Clock, AlertCircle, CheckCircle, X, Upload, FileText, RefreshCw, ChevronRight, AlertTriangle, Eye, MessageSquare } from "lucide-react";

const VERIFICATION_ITEMS = [
  { id: "docs",      label: "Technical Documentation",    desc: "README, API docs, setup guide uploaded", required: true  },
  { id: "demo",      label: "Live Demo / Video Walkthrough", desc: "Working demo URL or screen recording",  required: true  },
  { id: "pricing",   label: "Pricing & License",          desc: "Clear pricing model and license terms",  required: true  },
  { id: "screenshots", label: "Screenshots / Media",      desc: "Minimum 3 product screenshots uploaded", required: true  },
  { id: "deploy",    label: "Deployment Instructions",    desc: "Step-by-step deployment guide",          required: true  },
  { id: "support",   label: "Support Contact",            desc: "Support email or channel defined",       required: false },
];

const PRODUCTS_STATUS = [
  {
    id: "prod-1", title: "AI Support Chatbot", status: "APPROVED", submittedAt: "May 10, 2025", reviewedAt: "May 12, 2025",
    checks: { docs: true, demo: true, pricing: true, screenshots: true, deploy: true, support: true },
    feedback: null
  },
  {
    id: "prod-2", title: "Data Pipeline Pro", status: "UNDER_REVIEW", submittedAt: "May 25, 2025", reviewedAt: null,
    checks: { docs: true, demo: true, pricing: true, screenshots: true, deploy: false, support: false },
    feedback: null
  },
  {
    id: "prod-3", title: "Analytics Suite v2", status: "CHANGES_REQUIRED", submittedAt: "May 20, 2025", reviewedAt: "May 23, 2025",
    checks: { docs: true, demo: false, pricing: true, screenshots: true, deploy: true, support: false },
    feedback: "Your live demo URL returned a 404 error during review. Please provide a working demo environment. Also add a screen recording as backup."
  },
];

const STATUS_CFG = {
  APPROVED:          { label: "Approved",          color: "text-emerald-400", bg: "bg-emerald-400/8",  border: "border-emerald-400/20", icon: CheckCircle },
  UNDER_REVIEW:      { label: "Under Review",      color: "text-blue-400",   bg: "bg-blue-400/8",    border: "border-blue-400/20",   icon: Clock       },
  CHANGES_REQUIRED:  { label: "Changes Required",  color: "text-amber-400",  bg: "bg-amber-400/8",   border: "border-amber-400/20",  icon: AlertTriangle},
  REJECTED:          { label: "Rejected",          color: "text-red-400",    bg: "bg-red-400/8",     border: "border-red-400/20",    icon: X           },
  PENDING:           { label: "Pending Submission",color: "text-foreground/50", bg: "bg-foreground/5", border: "border-foreground/10", icon: Clock      },
};

function VerificationBadge({ status }) {
  const cfg = STATUS_CFG[status] || STATUS_CFG.PENDING;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border ${cfg.color} ${cfg.bg} ${cfg.border}`}>
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
}

function ChecklistItem({ item, checked }) {
  return (
    <div className={`flex items-start gap-3 p-3 rounded-xl transition-all ${checked ? "opacity-100" : "opacity-60"}`}
      style={{ background: checked ? "rgba(52,211,153,0.04)" : "rgba(150,150,150,0.03)", border: `0.5px solid ${checked ? "rgba(52,211,153,0.15)" : "rgba(150,150,150,0.08)"}` }}>
      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${checked ? "bg-emerald-400/15 border border-emerald-400/30" : "bg-foreground/5 border border-foreground/10"}`}>
        {checked ? <CheckCircle className="w-3 h-3 text-emerald-400" /> : <Clock className="w-3 h-3 text-foreground/25" />}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-foreground">{item.label}</span>
          {item.required && <span className="text-[9px] font-bold text-foreground/30 uppercase tracking-widest">Required</span>}
        </div>
        <p className="text-[10px] text-foreground/35 mt-0.5">{item.desc}</p>
      </div>
    </div>
  );
}

export default function DevVerification() {
  const [resubmitting, setResubmitting] = useState(null);

  const handleResubmit = (id) => {
    setResubmitting(id);
    setTimeout(() => setResubmitting(null), 2000);
  };

  return (
    <div className="p-6 sm:p-8 max-w-4xl page-fade-in">

      {/* Header */}
      <div className="mb-8">
        <div className="stat-label-caps mb-2">Developer · Product Verification</div>
        <h1 className="text-white font-bold text-2xl sm:text-3xl section-title-gradient" style={{ fontFamily: "Georgia, serif", letterSpacing: "-0.04em" }}>
          Verification Center
        </h1>
        <p className="text-sm mt-1.5" style={{ color: "hsl(var(--foreground) / 0.35)", fontFamily: "'Inter', sans-serif" }}>
          Verified products rank 3× higher in search and earn a trust badge. Complete all requirements to get approved.
        </p>
      </div>

      {/* Verification Requirements */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="frosted-panel p-5 mb-6"
      >
        <h2 className="text-white font-bold text-sm mb-4" style={{ fontFamily: "Georgia, serif" }}>
          Verification Requirements
        </h2>
        <p className="text-xs text-foreground/40 mb-4" style={{ fontFamily: "'Inter', sans-serif" }}>
          All required items must be present before Deployra can review your product listing.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {VERIFICATION_ITEMS.map(item => (
            <ChecklistItem key={item.id} item={item} checked={item.required} />
          ))}
        </div>
      </motion.div>

      {/* Products */}
      <h2 className="text-white font-bold text-sm mb-4" style={{ fontFamily: "Georgia, serif" }}>Your Product Submissions</h2>

      <div className="space-y-4">
        {PRODUCTS_STATUS.map((product, i) => {
          const completedChecks = Object.values(product.checks).filter(Boolean).length;
          const totalChecks = Object.keys(product.checks).length;
          const pct = Math.round((completedChecks / totalChecks) * 100);

          return (
            <motion.div key={product.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 + 0.2 }}
              className="frosted-panel p-5"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-bold text-sm text-foreground" style={{ fontFamily: "'Inter', sans-serif" }}>{product.title}</h3>
                  <p className="text-[10px] font-mono text-foreground/30 mt-0.5">
                    {product.id} · Submitted {product.submittedAt}
                    {product.reviewedAt && ` · Reviewed ${product.reviewedAt}`}
                  </p>
                </div>
                <VerificationBadge status={product.status} />
              </div>

              {/* Progress */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="stat-label-caps">Checklist Completion</span>
                  <span className="text-xs font-bold metric-num text-foreground/70" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{completedChecks}/{totalChecks} items</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(150,150,150,0.1)" }}>
                  <motion.div
                    className={`h-full rounded-full ${pct === 100 ? "bg-emerald-400" : pct >= 70 ? "bg-blue-400" : "bg-amber-400"}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, delay: i * 0.1 + 0.3 }}
                  />
                </div>
              </div>

              {/* Checklist */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
                {VERIFICATION_ITEMS.map(item => (
                  <ChecklistItem key={item.id} item={item} checked={product.checks[item.id]} />
                ))}
              </div>

              {/* Feedback */}
              {product.feedback && (
                <div className="mb-4 p-4 rounded-xl" style={{ background: "rgba(251,191,36,0.05)", border: "0.5px solid rgba(251,191,36,0.2)" }}>
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">Reviewer Feedback</span>
                  </div>
                  <p className="text-xs text-foreground/60 leading-relaxed" style={{ fontFamily: "'Inter', sans-serif" }}>{product.feedback}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2">
                {product.status === "CHANGES_REQUIRED" && (
                  <button
                    onClick={() => handleResubmit(product.id)}
                    disabled={resubmitting === product.id}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-foreground text-background hover:bg-foreground/90 transition-all disabled:opacity-50"
                  >
                    {resubmitting === product.id ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                    {resubmitting === product.id ? "Resubmitting..." : "Resubmit for Review"}
                  </button>
                )}
                {product.status === "UNDER_REVIEW" && (
                  <div className="flex items-center gap-2 text-xs text-blue-400 font-semibold">
                    <Clock className="w-3.5 h-3.5" />
                    Under review · Typically 1–3 business days
                  </div>
                )}
                {product.status === "APPROVED" && (
                  <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Live on marketplace · Verified badge active
                  </div>
                )}
                <button className="ml-auto flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-foreground/10 text-foreground/50 hover:text-foreground hover:bg-foreground/5 transition-all">
                  <Eye className="w-3.5 h-3.5" />
                  View Listing
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
