import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Clock, CheckCircle, X, Upload, RefreshCw, AlertTriangle, Eye, Package, Loader2, AlertCircle } from "lucide-react";
import axios from "axios";
import { API_URL } from "@/lib/config";
import { Link } from "react-router-dom";

const VERIFICATION_ITEMS = [
  { id: "docs",        label: "Technical Documentation",    desc: "README, API docs, setup guide uploaded", required: true  },
  { id: "demo",        label: "Live Demo / Video Walkthrough", desc: "Working demo URL or screen recording",  required: true  },
  { id: "pricing",     label: "Pricing & License",          desc: "Clear pricing model and license terms",  required: true  },
  { id: "screenshots", label: "Screenshots / Media",        desc: "Minimum 3 product screenshots uploaded", required: true  },
  { id: "deploy",      label: "Deployment Instructions",    desc: "Step-by-step deployment guide",          required: true  },
  { id: "support",     label: "Support Contact",            desc: "Support email or channel defined",       required: false },
];

const STATUS_CFG = {
  APPROVED:          { label: "Approved",           color: "text-emerald-400", bg: "bg-emerald-400/8",  border: "border-emerald-400/20", icon: CheckCircle    },
  PENDING_REVIEW:    { label: "Under Review",       color: "text-blue-400",   bg: "bg-blue-400/8",    border: "border-blue-400/20",   icon: Clock          },
  CHANGES_REQUIRED:  { label: "Changes Required",   color: "text-amber-400",  bg: "bg-amber-400/8",   border: "border-amber-400/20",  icon: AlertTriangle  },
  REJECTED:          { label: "Rejected",           color: "text-red-400",    bg: "bg-red-400/8",     border: "border-red-400/20",    icon: X              },
  DRAFT:             { label: "Draft",              color: "text-foreground/40", bg: "bg-foreground/5", border: "border-foreground/10", icon: Clock         },
  PENDING:           { label: "Pending Submission", color: "text-foreground/50", bg: "bg-foreground/5", border: "border-foreground/10", icon: Clock         },
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

// Infer checklist completion from product fields
function inferChecks(product) {
  return {
    docs:        !!(product.description && product.description.length > 100),
    demo:        !!(product.demoUrl || product.videoUrl),
    pricing:     !!(product.price > 0 && product.licenseType),
    screenshots: !!(product.images?.length >= 1 || product.coverImage),
    deploy:      !!(product.deploymentInstructions || product.readme),
    support:     !!(product.supportEmail || product.supportUrl),
  };
}

export default function DevVerification() {
  const [products,     setProducts]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState("");
  const [resubmitting, setResubmitting] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    axios.get(`${API_URL}/products/my`, { withCredentials: true, headers })
      .then(res => setProducts(Array.isArray(res.data?.data) ? res.data.data : res.data?.products || []))
      .catch(() => setError("Could not load your products. Please refresh."))
      .finally(() => setLoading(false));
  }, []);

  const handleResubmit = async (id) => {
    setResubmitting(id);
    const token = localStorage.getItem("auth_token");
    try {
      await axios.post(`${API_URL}/products/${id}/resubmit`, {}, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
    } catch {}
    setTimeout(() => setResubmitting(null), 1500);
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-foreground/30" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="frosted-panel p-6 flex items-center gap-3 text-red-400">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

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
        <h2 className="text-white font-bold text-sm mb-2" style={{ fontFamily: "Georgia, serif" }}>Verification Requirements</h2>
        <p className="text-xs text-foreground/40 mb-4" style={{ fontFamily: "'Inter', sans-serif" }}>
          All required items must be present before Deployra can review your product listing.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {VERIFICATION_ITEMS.map(item => (
            <ChecklistItem key={item.id} item={item} checked={false} />
          ))}
        </div>
      </motion.div>

      {/* Products */}
      <h2 className="text-white font-bold text-sm mb-4" style={{ fontFamily: "Georgia, serif" }}>Your Product Submissions</h2>

      {products.length === 0 ? (
        <div className="frosted-panel p-16 text-center">
          <Package className="w-12 h-12 mx-auto mb-4 text-foreground/10" />
          <p className="text-sm font-semibold text-foreground/40">No products submitted yet</p>
          <p className="text-xs text-foreground/25 mt-1 mb-5">Publish your first product to start the verification process.</p>
          <Link to="/developer/publish">
            <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-foreground text-background hover:bg-foreground/90 transition-all">
              Publish a Product
            </button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {products.map((product, i) => {
            const checks = inferChecks(product);
            const completedChecks = Object.values(checks).filter(Boolean).length;
            const totalChecks = Object.keys(checks).length;
            const pct = Math.round((completedChecks / totalChecks) * 100);
            const status = product.status || "DRAFT";

            return (
              <motion.div key={product.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 + 0.2 }}
                className="frosted-panel p-5"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-sm text-foreground">{product.title}</h3>
                    <p className="text-[10px] font-mono text-foreground/30 mt-0.5">
                      {product.id?.slice(0, 8)}… · Submitted {product.createdAt ? new Date(product.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                      {product.updatedAt && ` · Updated ${new Date(product.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`}
                    </p>
                  </div>
                  <VerificationBadge status={status} />
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
                    <ChecklistItem key={item.id} item={item} checked={checks[item.id]} />
                  ))}
                </div>

                {/* Reviewer Feedback */}
                {product.reviewFeedback && (
                  <div className="mb-4 p-4 rounded-xl" style={{ background: "rgba(251,191,36,0.05)", border: "0.5px solid rgba(251,191,36,0.2)" }}>
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                      <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">Reviewer Feedback</span>
                    </div>
                    <p className="text-xs text-foreground/60 leading-relaxed">{product.reviewFeedback}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {status === "CHANGES_REQUIRED" && (
                    <button
                      onClick={() => handleResubmit(product.id)}
                      disabled={resubmitting === product.id}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-foreground text-background hover:bg-foreground/90 transition-all disabled:opacity-50"
                    >
                      {resubmitting === product.id ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                      {resubmitting === product.id ? "Resubmitting..." : "Resubmit for Review"}
                    </button>
                  )}
                  {status === "PENDING_REVIEW" && (
                    <div className="flex items-center gap-2 text-xs text-blue-400 font-semibold">
                      <Clock className="w-3.5 h-3.5" />
                      Under review · Typically 1–3 business days
                    </div>
                  )}
                  {status === "APPROVED" && (
                    <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Live on marketplace · Verified badge active
                    </div>
                  )}
                  <Link to={`/marketplace/${product.id}`} className="ml-auto">
                    <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-foreground/10 text-foreground/50 hover:text-foreground hover:bg-foreground/5 transition-all">
                      <Eye className="w-3.5 h-3.5" />
                      View Listing
                    </button>
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
