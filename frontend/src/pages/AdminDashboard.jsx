import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, RefreshCw, ArrowLeft, CheckCircle, XCircle, Clock,
  Package, Users, TrendingUp, ExternalLink, AlertTriangle,
  ChevronRight, X, FileText, Globe, DollarSign, Zap, AlertCircle, Settings, Tag,
} from "lucide-react";
import { Link } from "react-router-dom";
import axios from "axios";
import { API_URL } from "@/lib/config";

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const cfg = {
    PENDING_REVIEW: { label: "Pending Review", color: "text-amber-400",  bg: "bg-amber-400/10",  border: "border-amber-400/25",  icon: Clock },
    APPROVED:       { label: "Approved",        color: "text-emerald-400",bg: "bg-emerald-400/10",border: "border-emerald-400/25", icon: CheckCircle },
    REJECTED:       { label: "Rejected",        color: "text-red-400",    bg: "bg-red-400/10",    border: "border-red-400/25",    icon: XCircle },
    DRAFT:          { label: "Draft",           color: "text-foreground/40",bg:"bg-foreground/5",  border: "border-foreground/10", icon: FileText },
    SUSPENDED:      { label: "Suspended",       color: "text-red-500",    bg: "bg-red-500/10",    border: "border-red-500/25",    icon: AlertTriangle },
  }[status] || { label: status, color: "text-foreground/50", bg: "bg-foreground/5", border: "border-foreground/10", icon: Clock };
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${cfg.color} ${cfg.bg} ${cfg.border}`}>
      <Icon className="w-3 h-3" /> {cfg.label}
    </span>
  );
}

// ─── Rejection Modal ──────────────────────────────────────────────────────────
function RejectModal({ product, onConfirm, onCancel, loading }) {
  const [reason, setReason] = useState("");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }}>
      <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg rounded-2xl p-6"
        style={{ background: "rgba(10,10,10,0.98)", border: "0.5px solid rgba(239,68,68,0.3)", boxShadow: "0 40px 120px rgba(0,0,0,0.8)" }}>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(239,68,68,0.1)", border: "0.5px solid rgba(239,68,68,0.25)" }}>
              <XCircle className="w-4 h-4 text-red-400" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-foreground" style={{ fontFamily: "Georgia, serif" }}>Reject Submission</h3>
              <p className="text-[10px] text-foreground/35 mt-0.5 font-mono truncate max-w-xs">{product?.title}</p>
            </div>
          </div>
          <button onClick={onCancel} className="p-1.5 rounded-lg text-foreground/30 hover:text-foreground hover:bg-foreground/5 transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="mb-4">
          <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/50 font-mono mb-2 block">
            Rejection Reason <span className="text-red-400">*</span>
          </label>
          <textarea
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="Explain what needs to be fixed before this product can be approved. Be specific and constructive — the developer will receive this as an email..."
            rows={5}
            className="w-full px-4 py-3 rounded-xl text-sm font-medium outline-none transition-all resize-none bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-red-500/20 focus:border-red-500/40"
          />
          <p className="text-[10px] text-foreground/30 mt-1.5 font-mono">{reason.length} characters — minimum 20 recommended</p>
        </div>
        <div className="flex gap-3">
          <button onClick={onCancel} disabled={loading}
            className="flex-1 py-3 rounded-xl text-sm font-semibold border border-border text-foreground/50 hover:text-foreground hover:bg-foreground/5 transition-all disabled:opacity-50">
            Cancel
          </button>
          <button onClick={() => onConfirm(reason)} disabled={loading || reason.trim().length < 10}
            className="flex-1 py-3 rounded-xl text-sm font-bold bg-red-500 text-white hover:bg-red-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
            {loading ? "Rejecting..." : "Reject & Notify Developer"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Product Review Card ──────────────────────────────────────────────────────
function ProductReviewCard({ product, onApprove, onReject, approving, rejecting }) {
  const [expanded, setExpanded] = useState(false);
  const configFields = product.configFields || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="frosted-panel overflow-hidden"
    >
      {/* Main row */}
      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 text-lg font-bold"
            style={{ background: "rgba(255,255,255,0.04)", border: "0.5px solid rgba(255,255,255,0.1)", fontFamily: "Georgia, serif", color: "hsl(var(--foreground) / 0.6)" }}>
            {product.title?.[0] || "?"}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <h3 className="font-bold text-sm text-foreground" style={{ fontFamily: "'Inter', sans-serif" }}>{product.title}</h3>
                  <StatusBadge status={product.status} />
                </div>
                <p className="text-xs text-foreground/40 mb-2 leading-relaxed" style={{ fontFamily: "'Inter', sans-serif" }}>
                  {product.shortDesc || product.description?.slice(0, 120) + "..."}
                </p>
                <div className="flex items-center flex-wrap gap-3">
                  <span className="text-[10px] font-mono text-foreground/25">{product.category || "No category"}</span>
                  <span className="text-[10px] font-mono text-foreground/25">₹{Number(product.price || 0).toLocaleString()}</span>
                  <span className="text-[10px] font-mono text-foreground/25">{product.deliveryDays || 7}d delivery</span>
                  <span className="text-[10px] font-mono text-foreground/25">by {product.developer?.name || "Unknown"}</span>
                  <span className="text-[10px] font-mono text-foreground/25">{new Date(product.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Action Buttons (only for PENDING_REVIEW) */}
              {product.status === "PENDING_REVIEW" && (
                <div className="flex items-center gap-2 shrink-0">
                  <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={() => onApprove(product)}
                    disabled={approving === product.id || rejecting === product.id}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                    style={{ background: "rgba(16,138,0,0.12)", border: "0.5px solid rgba(16,138,0,0.4)", color: "#22c55e" }}
                  >
                    {approving === product.id ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                    {approving === product.id ? "Approving..." : "Approve"}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={() => onReject(product)}
                    disabled={approving === product.id || rejecting === product.id}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                    style={{ background: "rgba(239,68,68,0.1)", border: "0.5px solid rgba(239,68,68,0.3)", color: "#f87171" }}
                  >
                    {rejecting === product.id ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                    Reject
                  </motion.button>
                </div>
              )}
            </div>

            {/* Links */}
            <div className="flex items-center gap-3 mt-3 flex-wrap">
              {product.demoUrl && (
                <a href={product.demoUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[10px] font-semibold text-foreground/40 hover:text-foreground transition-colors">
                  <Globe className="w-3 h-3" /> Demo
                </a>
              )}
              {product.docsUrl && (
                <a href={product.docsUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[10px] font-semibold text-foreground/40 hover:text-foreground transition-colors">
                  <FileText className="w-3 h-3" /> Docs
                </a>
              )}
              {product.walkthroughUrl && (
                <a href={product.walkthroughUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[10px] font-semibold text-foreground/40 hover:text-foreground transition-colors">
                  <ExternalLink className="w-3 h-3" /> Walkthrough
                </a>
              )}
              <button onClick={() => setExpanded(p => !p)}
                className="flex items-center gap-1 text-[10px] font-semibold text-foreground/30 hover:text-foreground transition-colors">
                <ChevronRight className={`w-3 h-3 transition-transform ${expanded ? "rotate-90" : ""}`} />
                {expanded ? "Hide Details" : "Full Details"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ overflow: "hidden", borderTop: "0.5px solid hsl(var(--foreground) / 0.05)" }}
          >
            <div className="p-5 space-y-5">
              {/* Description */}
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-foreground/30 font-mono mb-2">Full Description</div>
                <p className="text-xs text-foreground/50 leading-relaxed" style={{ fontFamily: "'Inter', sans-serif" }}>{product.description}</p>
              </div>

              {/* Product Details Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { label: "Category", value: product.category || "—", icon: Tag },
                  { label: "Price", value: `₹${Number(product.price || 0).toLocaleString()}`, icon: DollarSign },
                  { label: "Delivery", value: `${product.deliveryDays || 7} days`, icon: Clock },
                  { label: "Support", value: product.support || "—", icon: Settings },
                  { label: "Deployment", value: product.deploymentMethod || "—", icon: Zap },
                  { label: "Revisions", value: product.revisions || "—", icon: RefreshCw },
                ].map(({ label, value, icon: Icon }) => (
                  <div key={label} className="p-3 rounded-xl" style={{ background: "rgba(150,150,150,0.04)", border: "0.5px solid rgba(150,150,150,0.08)" }}>
                    <div className="flex items-center gap-1.5 mb-1">
                      <Icon className="w-3 h-3 text-foreground/20" />
                      <span className="text-[9px] font-bold uppercase tracking-widest text-foreground/25 font-mono">{label}</span>
                    </div>
                    <p className="text-xs font-semibold text-foreground/70" style={{ fontFamily: "'Inter', sans-serif" }}>{value}</p>
                  </div>
                ))}
              </div>

              {/* Tags & Features */}
              {(product.tags?.length > 0 || product.features?.length > 0) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {product.tags?.length > 0 && (
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-widest text-foreground/30 font-mono mb-2">Tags</div>
                      <div className="flex flex-wrap gap-1.5">
                        {product.tags.map(t => (
                          <span key={t} className="text-[9px] font-mono px-2 py-0.5 rounded-md bg-foreground/5 text-foreground/40 border border-foreground/8">{t}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {product.features?.length > 0 && (
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-widest text-foreground/30 font-mono mb-2">Features</div>
                      <ul className="space-y-1">
                        {product.features.slice(0, 6).map((f, i) => (
                          <li key={i} className="flex items-center gap-1.5 text-[11px] text-foreground/50" style={{ fontFamily: "'Inter', sans-serif" }}>
                            <CheckCircle className="w-2.5 h-2.5 text-emerald-400 shrink-0" /> {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Developer Info */}
              <div className="p-4 rounded-xl" style={{ background: "rgba(150,150,150,0.03)", border: "0.5px solid rgba(150,150,150,0.08)" }}>
                <div className="text-[10px] font-bold uppercase tracking-widest text-foreground/30 font-mono mb-3">Developer</div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-foreground/8 border border-foreground/10 text-sm font-bold text-foreground/60" style={{ fontFamily: "Georgia, serif" }}>
                    {product.developer?.name?.[0] || "?"}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground" style={{ fontFamily: "'Inter', sans-serif" }}>{product.developer?.name || "Unknown"}</p>
                    <p className="text-[10px] text-foreground/40 font-mono">{product.developer?.email || "—"}</p>
                  </div>
                </div>
              </div>

              {/* Config Schema */}
              {configFields.length > 0 && (
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-foreground/30 font-mono mb-2">
                    Config Builder Schema ({configFields.length} fields)
                  </div>
                  <div className="overflow-x-auto rounded-xl" style={{ border: "0.5px solid rgba(150,150,150,0.1)" }}>
                    <table className="w-full text-left">
                      <thead>
                        <tr style={{ background: "rgba(150,150,150,0.05)", borderBottom: "0.5px solid rgba(150,150,150,0.08)" }}>
                          {["Field Label", "Type", "Required", "Placeholder"].map(h => (
                            <th key={h} className="px-3 py-2 text-[9px] font-bold uppercase tracking-widest text-foreground/25 font-mono">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {configFields.map((f, i) => (
                          <tr key={i} style={{ borderBottom: "0.5px solid rgba(150,150,150,0.05)" }}>
                            <td className="px-3 py-2 text-xs font-medium text-foreground/70">{f.label || "—"}</td>
                            <td className="px-3 py-2"><span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-foreground/5 text-foreground/40 border border-foreground/8">{f.type}</span></td>
                            <td className="px-3 py-2 text-[10px] font-mono">{f.required ? <span className="text-emerald-400">Required</span> : <span className="text-foreground/25">Optional</span>}</td>
                            <td className="px-3 py-2 text-[10px] text-foreground/30">{f.placeholder || "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Screenshots */}
              {product.screenshots?.length > 0 && (
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-foreground/30 font-mono mb-2">Screenshots</div>
                  <div className="flex gap-2 flex-wrap">
                    {product.screenshots.map((src, i) => (
                      <a key={i} href={src} target="_blank" rel="noopener noreferrer">
                        <img src={src} alt={`Screenshot ${i + 1}`} className="w-28 h-20 object-cover rounded-lg border border-border hover:opacity-80 transition-opacity" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Rejection Reason (if already rejected) */}
              {product.status === "REJECTED" && product.rejectionReason && (
                <div className="p-3 rounded-xl" style={{ background: "rgba(239,68,68,0.05)", border: "0.5px solid rgba(239,68,68,0.2)" }}>
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] font-bold text-red-400 mb-0.5 font-mono uppercase tracking-wider">Rejection Reason</p>
                      <p className="text-xs text-red-400/70" style={{ fontFamily: "'Inter', sans-serif" }}>{product.rejectionReason}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState("PENDING_REVIEW");
  const [approving, setApproving] = useState(null);
  const [rejecting, setRejecting] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadAll = useCallback(async () => {
    try {
      const [productsRes, statsRes] = await Promise.all([
        axios.get(`${API_URL}/admin/products`),
        axios.get(`${API_URL}/admin/stats`),
      ]);
      setProducts(productsRes.data?.data || []);
      setStats(statsRes.data?.data || null);
    } catch (err) {
      console.error("Admin load failed:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const refresh = async () => {
    setRefreshing(true);
    await loadAll();
  };

  const handleApprove = async (product) => {
    setApproving(product.id);
    try {
      await axios.patch(`${API_URL}/admin/products/${product.id}/approve`);
      setProducts(p => p.map(x => x.id === product.id ? { ...x, status: "APPROVED" } : x));
      setStats(s => s ? { ...s, pendingCount: s.pendingCount - 1, approvedCount: s.approvedCount + 1 } : s);
      showToast(`✅ "${product.title}" is now LIVE on the marketplace!`);
    } catch (err) {
      showToast(err.response?.data?.message || "Approval failed", "error");
    } finally {
      setApproving(null);
    }
  };

  const handleRejectConfirm = async (reason) => {
    if (!rejectTarget) return;
    setRejecting(rejectTarget.id);
    try {
      await axios.patch(`${API_URL}/admin/products/${rejectTarget.id}/reject`, { reason });
      setProducts(p => p.map(x => x.id === rejectTarget.id ? { ...x, status: "REJECTED", rejectionReason: reason } : x));
      setStats(s => s ? { ...s, pendingCount: s.pendingCount - 1, rejectedCount: s.rejectedCount + 1 } : s);
      showToast(`📋 "${rejectTarget.title}" rejected. Developer notified.`, "warn");
    } catch (err) {
      showToast(err.response?.data?.message || "Rejection failed", "error");
    } finally {
      setRejecting(null);
      setRejectTarget(null);
    }
  };

  const TABS = [
    { key: "PENDING_REVIEW", label: "Pending Review", count: stats?.pendingCount ?? 0,  color: "text-amber-400" },
    { key: "APPROVED",       label: "Approved",       count: stats?.approvedCount ?? 0, color: "text-emerald-400" },
    { key: "REJECTED",       label: "Rejected",       count: stats?.rejectedCount ?? 0, color: "text-red-400" },
    { key: "ALL",            label: "All Products",   count: stats?.totalProducts ?? 0, color: "text-foreground/50" },
  ];

  const visibleProducts = tab === "ALL" ? products : products.filter(p => p.status === tab);

  const kpiCards = stats ? [
    { label: "Pending Review",    value: stats.pendingCount,    icon: Clock,       color: "#f59e0b", sub: "Awaiting your decision" },
    { label: "Live Products",     value: stats.approvedCount,   icon: CheckCircle, color: "#22c55e", sub: "On marketplace" },
    { label: "Rejected",          value: stats.rejectedCount,   icon: XCircle,     color: "#f87171", sub: "Needs developer changes" },
    { label: "Total Developers",  value: stats.totalDevelopers, icon: Users,       color: "#a78bfa", sub: "Registered on platform", wide: true },
    { label: "Platform Revenue",  value: `$${Number(stats.totalRevenue || 0).toLocaleString()}`, icon: TrendingUp, color: "#60a5fa", sub: "All-time completed orders", wide: true },
  ] : [];

  if (loading) return (
    <div className="min-h-screen page-fade-in">
      <div className="max-w-7xl mx-auto px-6 py-16 space-y-4">
        {[1,2,3,4].map(i => <div key={i} className="skeleton-beam rounded-2xl" style={{ height: 80 }} />)}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen page-fade-in" style={{ background: "transparent" }}>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 px-5 py-3 rounded-xl text-sm font-semibold shadow-2xl"
            style={{
              background: toast.type === "error" ? "rgba(239,68,68,0.95)" : toast.type === "warn" ? "rgba(234,179,8,0.95)" : "rgba(22,163,74,0.95)",
              color: "#fff", fontFamily: "'Inter', sans-serif", maxWidth: 360,
            }}
          >
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reject Modal */}
      <AnimatePresence>
        {rejectTarget && (
          <RejectModal
            product={rejectTarget}
            onConfirm={handleRejectConfirm}
            onCancel={() => setRejectTarget(null)}
            loading={rejecting === rejectTarget?.id}
          />
        )}
      </AnimatePresence>

      {/* ── Header ── */}
      <div className="premium-header-bar aurora-header" style={{ borderBottom: "0.5px solid hsl(var(--foreground) / 0.06)" }}>
        <div className="max-w-7xl mx-auto px-6 py-7 flex items-center justify-between flex-wrap gap-4">
          <div>
            <Link to="/" className="inline-flex items-center gap-1.5 mb-4 transition-colors group" style={{ color: "hsl(var(--foreground) / 0.25)" }}>
              <ArrowLeft className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform" />
              <span className="text-xs" style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "0.04em" }}>Back to Marketplace</span>
            </Link>
            <div className="stat-label-caps mb-1.5">Admin · Review Center</div>
            <h1 className="text-white font-bold text-3xl section-title-gradient" style={{ fontFamily: "Georgia, serif", letterSpacing: "-0.04em", lineHeight: 1.1 }}>
              Product Review Center
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Pending alert pill */}
            {(stats?.pendingCount || 0) > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-full" style={{ background: "rgba(245,158,11,0.1)", border: "0.5px solid rgba(245,158,11,0.3)" }}>
                <span className="w-2 h-2 rounded-full pulse-aura" style={{ background: "#f59e0b" }} />
                <span className="text-xs font-bold" style={{ color: "#f59e0b", fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.06em" }}>
                  {stats.pendingCount} PENDING
                </span>
              </div>
            )}
            <div className="flex items-center gap-2 px-3 py-2 rounded-full" style={{ background: "rgba(150,150,150,0.06)", border: "0.5px solid rgba(150,150,150,0.15)" }}>
              <Shield className="w-3.5 h-3.5" style={{ color: "hsl(var(--foreground))" }} />
              <span className="text-xs font-semibold" style={{ color: "rgba(150,150,150,0.7)", fontFamily: "'Inter', sans-serif" }}>Admin Only</span>
            </div>
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={refresh}
              className="flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-xl transition-all"
              style={{ background: "hsl(var(--foreground) / 0.04)", color: "hsl(var(--foreground) / 0.5)", border: "0.5px solid hsl(var(--foreground) / 0.08)", fontFamily: "'Inter', sans-serif" }}>
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </motion.button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">

        {/* ── KPI Cards ── */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {kpiCards.map((kpi, i) => (
              <motion.div key={kpi.label}
                initial={{ opacity: 0, y: 20, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: i * 0.07, type: "spring", stiffness: 260, damping: 24 }}
                className={`frosted-panel p-5 relative overflow-hidden ${kpi.wide ? "md:col-span-2" : ""}`}
              >
                <div className="absolute pointer-events-none" style={{ top: -40, right: -40, width: 140, height: 140, borderRadius: "50%", background: kpi.color, opacity: 0.07, filter: "blur(40px)" }} />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${kpi.color}18`, border: `0.5px solid ${kpi.color}40` }}>
                      <kpi.icon className="w-4 h-4" style={{ color: kpi.color }} />
                    </div>
                  </div>
                  <div className="stat-label-caps mb-1.5">{kpi.label}</div>
                  <div className="font-bold text-white" style={{ fontFamily: "Georgia, serif", fontSize: "1.8rem", letterSpacing: "-0.04em", lineHeight: 1 }}>
                    {kpi.value}
                  </div>
                  <p className="text-[10px] text-foreground/30 mt-1.5 font-mono">{kpi.sub}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* ── Tabs ── */}
        <div className="flex items-center gap-1 p-1 rounded-xl w-fit" style={{ background: "rgba(150,150,150,0.05)", border: "0.5px solid rgba(150,150,150,0.1)" }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${tab === t.key ? "bg-foreground text-background" : "text-foreground/40 hover:text-foreground/70"}`}
              style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              {t.label}
              <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-mono ${tab === t.key ? "bg-background/20 text-background/70" : `${t.color} bg-foreground/5`}`}>
                {t.count}
              </span>
            </button>
          ))}
        </div>

        {/* ── Product List ── */}
        <div className="space-y-3">
          {visibleProducts.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="frosted-panel p-16 text-center">
              <Package className="w-10 h-10 mx-auto mb-3 text-foreground/15" />
              <p className="text-sm font-semibold text-foreground/40" style={{ fontFamily: "'Inter', sans-serif" }}>
                {tab === "PENDING_REVIEW" ? "No products pending review." : `No ${tab.toLowerCase().replace("_", " ")} products.`}
              </p>
              {tab === "PENDING_REVIEW" && (
                <p className="text-xs text-foreground/25 mt-1" style={{ fontFamily: "'Inter', sans-serif" }}>
                  When developers submit products, they'll appear here for your approval.
                </p>
              )}
            </motion.div>
          ) : (
            <AnimatePresence>
              {visibleProducts.map(product => (
                <ProductReviewCard
                  key={product.id}
                  product={product}
                  onApprove={handleApprove}
                  onReject={(p) => setRejectTarget(p)}
                  approving={approving}
                  rejecting={rejecting}
                />
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}