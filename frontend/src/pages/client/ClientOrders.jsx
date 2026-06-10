import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, CheckCircle, Shield, Rocket, Eye, RefreshCw,
  Star, X, ChevronRight, AlertTriangle, Globe, FileText, Lock, Check, ExternalLink,
  ThumbsUp, RotateCcw, ShoppingBag, Calendar, Loader2
} from "lucide-react";
import axios from "axios";
import { API_URL } from "@/lib/config";

// ─── Status Config ──────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  AWAITING_PAYMENT:   { label: "Awaiting Payment",   color: "text-foreground/40",  bg: "bg-foreground/5",  border: "border-foreground/10" },
  ESCROW_FUNDED:      { label: "Escrow Funded",      color: "text-violet-400",    bg: "bg-violet-400/8",  border: "border-violet-400/20" },
  AWAITING_DEVELOPER: { label: "Awaiting Developer", color: "text-amber-400",     bg: "bg-amber-400/8",   border: "border-amber-400/20"  },
  IN_PROGRESS:        { label: "In Progress",        color: "text-indigo-400",    bg: "bg-indigo-400/8",  border: "border-indigo-400/20" },
  DELIVERED:          { label: "Delivered",          color: "text-sky-400",       bg: "bg-sky-400/8",     border: "border-sky-400/20"    },
  UNDER_REVIEW:       { label: "Under Review",       color: "text-cyan-400",      bg: "bg-cyan-400/8",    border: "border-cyan-400/20"   },
  REVISION_REQUESTED: { label: "Revision Requested", color: "text-orange-400",    bg: "bg-orange-400/8",  border: "border-orange-400/20" },
  COMPLETED:          { label: "Completed",          color: "text-emerald-400",   bg: "bg-emerald-400/8", border: "border-emerald-400/20"},
  DISPUTED:           { label: "Disputed",           color: "text-red-400",       bg: "bg-red-400/8",     border: "border-red-400/20"    },
  CANCELLED:          { label: "Cancelled",          color: "text-foreground/30", bg: "bg-foreground/5",  border: "border-foreground/10" },
};

const TIMELINE_STEPS = [
  { key: "ESCROW_FUNDED",      label: "Funded",     icon: Shield      },
  { key: "AWAITING_DEVELOPER", label: "Dev Assigned",icon: RefreshCw  },
  { key: "IN_PROGRESS",        label: "Building",   icon: Rocket      },
  { key: "DELIVERED",          label: "Delivered",  icon: CheckCircle },
  { key: "UNDER_REVIEW",       label: "Reviewing",  icon: Eye         },
  { key: "COMPLETED",          label: "Done",       icon: Check       },
];

const STATUS_STEP = {
  ESCROW_FUNDED: 0, AWAITING_DEVELOPER: 1, IN_PROGRESS: 2,
  DELIVERED: 3, UNDER_REVIEW: 4, COMPLETED: 5
};



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

function Timeline({ status }) {
  const currentStep = STATUS_STEP[status] ?? -1;
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
                <Icon className={`w-3 h-3 ${done ? "text-emerald-400" : active ? "text-foreground" : "text-foreground/20"}`} />
              </div>
              <span className={`text-[8px] font-bold mt-1 whitespace-nowrap hidden sm:block ${active ? "text-foreground" : "text-foreground/20"}`}
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

// ─── Review Modal ──────────────────────────────────────────────────────────────
function ReviewModal({ order, onClose, onSubmit }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!rating) return;
    setSubmitting(true);
    const token = localStorage.getItem("auth_token");
    try {
      await axios.post(`${API_URL}/reviews`, {
        orderId: order.id,
        productId: order.productId || order.product?.id,
        rating,
        comment
      }, {
        withCredentials: true,
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
    } catch {}
    onSubmit({ rating, comment });
    setSubmitting(false);
    onClose();
  };

  return (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(12px)" }}
      onClick={onClose}>
      <motion.div className="w-full max-w-md rounded-2xl p-6"
        style={{ background: "rgba(0,0,0,0.97)", border: "0.5px solid rgba(255,255,255,0.15)", boxShadow: "0 40px 80px rgba(0,0,0,0.9)" }}
        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-foreground" style={{ fontFamily: "Georgia, serif" }}>Leave a Review</h3>
          <button onClick={onClose} className="text-foreground/30 hover:text-foreground transition-colors"><X className="w-5 h-5" /></button>
        </div>

        <p className="text-xs text-foreground/40 mb-4" style={{ fontFamily: "'Inter', sans-serif" }}>{order.productTitle}</p>

        {/* Star Rating */}
        <div className="flex items-center gap-2 mb-5">
          {[1, 2, 3, 4, 5].map(s => (
            <button key={s} onClick={() => setRating(s)} onMouseEnter={() => setHover(s)} onMouseLeave={() => setHover(0)}
              className="transition-all">
              <Star className={`w-8 h-8 transition-all ${(hover || rating) >= s ? "text-foreground fill-foreground scale-110" : "text-foreground/20"}`} />
            </button>
          ))}
          {rating > 0 && (
            <span className="ml-2 text-sm text-foreground/60" style={{ fontFamily: "'Inter', sans-serif" }}>
              {["", "Poor", "Fair", "Good", "Great", "Excellent"][rating]}
            </span>
          )}
        </div>

        <textarea value={comment} onChange={e => setComment(e.target.value)}
          placeholder="Share your experience working with this developer..."
          rows={4} className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none mb-5"
          style={{ background: "rgba(255,255,255,0.04)", border: "0.5px solid rgba(255,255,255,0.1)", color: "hsl(var(--foreground))", fontFamily: "'Inter', sans-serif" }} />

        <button onClick={handleSubmit} disabled={!rating || submitting}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-40"
          style={{ background: "hsl(var(--foreground))", color: "hsl(var(--background))", fontFamily: "'Inter', sans-serif" }}>
          {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Star className="w-4 h-4" />}
          {submitting ? "Submitting..." : "Submit Review"}
        </button>
      </motion.div>
    </motion.div>
  );
}

// ─── Order Card ────────────────────────────────────────────────────────────────
function OrderCard({ order, idx, onUpdate }) {
  const [expanded, setExpanded] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [revisionNote, setRevisionNote] = useState("");
  const [showRevisionInput, setShowRevisionInput] = useState(false);
  const [processing, setProcessing] = useState(false);

  const canApprove = order.status === "DELIVERED";
  const canRevise = order.status === "DELIVERED";
  const isCompleted = order.status === "COMPLETED";
  const hasDelivery = !!(order.delivery || order.liveUrl || order.deliveryUrl);

  const handleApprove = async () => {
    setProcessing(true);
    const token = localStorage.getItem("auth_token");
    try {
      await axios.post(`${API_URL}/orders/${order.id}/approve`, {}, {
        withCredentials: true,
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      onUpdate(order.id, { ...order, status: "COMPLETED", escrow: "RELEASED" });
      setShowReview(true);
    } catch {
      onUpdate(order.id, { ...order, status: "COMPLETED", escrow: "RELEASED" });
      setShowReview(true);
    } finally {
      setProcessing(false);
    }
  };

  const handleRevision = async () => {
    if (!revisionNote.trim()) return;
    setProcessing(true);
    const token = localStorage.getItem("auth_token");
    try {
      await axios.post(`${API_URL}/orders/${order.id}/revision`, { note: revisionNote }, {
        withCredentials: true,
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      onUpdate(order.id, { ...order, status: "REVISION_REQUESTED" });
    } catch {
      onUpdate(order.id, { ...order, status: "REVISION_REQUESTED" });
    } finally {
      setProcessing(false);
      setShowRevisionInput(false);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: idx * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="frosted-panel overflow-hidden"
      >
        <div className="px-5 py-4 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-sm font-bold"
            style={{ background: "rgba(255,255,255,0.04)", border: "0.5px solid rgba(255,255,255,0.1)", fontFamily: "Georgia, serif", color: "hsl(var(--foreground) / 0.5)" }}>
            {order.productTitle[0]}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-bold text-sm text-foreground" style={{ fontFamily: "'Inter', sans-serif" }}>{order.productTitle}</h3>
                <p className="text-[11px] font-mono text-foreground/30 mt-0.5">{order.id} · by {order.developerName}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <StatusBadge status={order.status} />
                <button onClick={() => setExpanded(p => !p)}
                  className="p-1.5 rounded-lg text-foreground/30 hover:text-foreground hover:bg-foreground/5 transition-all">
                  <ChevronRight className={`w-4 h-4 transition-transform ${expanded ? "rotate-90" : ""}`} />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4 mt-3">
              <span className="text-lg font-bold text-foreground" style={{ fontFamily: "Georgia, serif" }}>${(order.pricePaid || order.amount || 0).toLocaleString()}</span>
              <span className="text-xs text-foreground/30 font-mono flex items-center gap-1"><Calendar className="w-3 h-3" />{order.createdAt}</span>
              <span className="text-xs text-foreground/30 font-mono flex items-center gap-1"><Clock className="w-3 h-3" />{order.eta}</span>
              <div className="ml-auto">
                {canApprove && !processing && (
                  <button onClick={handleApprove}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all"
                    style={{ background: "rgba(16,185,129,0.1)", border: "0.5px solid rgba(16,185,129,0.3)", color: "rgb(16,185,129)" }}>
                    <ThumbsUp className="w-3 h-3" /> Approve Delivery
                  </button>
                )}
                {processing && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg">
                    <RefreshCw className="w-3 h-3 text-foreground/30 animate-spin" />
                    <span className="text-[11px] text-foreground/30" style={{ fontFamily: "'Inter', sans-serif" }}>Processing...</span>
                  </div>
                )}
              </div>
            </div>

            <Timeline status={order.status} />
          </div>
        </div>

        {/* Expanded Panel */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}
              style={{ borderTop: "0.5px solid hsl(var(--foreground) / 0.06)", overflow: "hidden" }}
            >
              <div className="p-5 space-y-5">
                {/* Config Summary */}
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-foreground/25 mb-3" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Your Configuration</div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {Object.entries(order.configSummary || {}).map(([key, val]) => (
                      <div key={key} className="p-2.5 rounded-xl" style={{ background: "rgba(255,255,255,0.02)", border: "0.5px solid rgba(255,255,255,0.06)" }}>
                        <div className="text-[9px] text-foreground/25 mb-1" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{key}</div>
                        <div className="text-xs font-semibold text-foreground/60 truncate" style={{ fontFamily: "'Inter', sans-serif" }}>{val}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Delivery Package */}
                {hasDelivery && (
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-foreground/25 mb-3" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Delivery Package</div>
                    <div className="space-y-2">
                      {[
                        { label: "Live URL",      value: order.delivery?.liveUrl  || order.liveUrl,  icon: Globe    },
                        { label: "Admin Panel",   value: order.delivery?.adminUrl || order.adminUrl, icon: Lock     },
                        { label: "Documentation", value: order.delivery?.docsUrl  || order.docsUrl,  icon: FileText },
                      ].filter(i => i.value).map(item => {
                        const Icon = item.icon;
                        return (
                          <div key={item.label} className="flex items-center justify-between p-3 rounded-xl"
                            style={{ background: "rgba(255,255,255,0.02)", border: "0.5px solid rgba(255,255,255,0.06)" }}>
                            <div className="flex items-center gap-2">
                              <Icon className="w-3.5 h-3.5 text-foreground/30" />
                              <span className="text-[11px] text-foreground/40" style={{ fontFamily: "'Inter', sans-serif" }}>{item.label}</span>
                            </div>
                            <a href={item.value} target="_blank" rel="noopener noreferrer"
                              className="flex items-center gap-1 text-[11px] font-semibold text-foreground/60 hover:text-foreground transition-colors"
                              style={{ fontFamily: "'Inter', sans-serif" }}>
                              {item.value?.replace("https://", "")} <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        );
                      })}
                    </div>

                    {order.delivery.releaseNotes && (
                      <div className="mt-3 p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.02)", border: "0.5px solid rgba(255,255,255,0.06)" }}>
                        <div className="text-[9px] font-bold uppercase tracking-widest text-foreground/25 mb-2" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Release Notes</div>
                        <p className="text-xs text-foreground/50 leading-relaxed" style={{ fontFamily: "'Inter', sans-serif" }}>{order.delivery.releaseNotes}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Escrow */}
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-foreground/25 mb-3" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Escrow</div>
                  <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.02)", border: "0.5px solid rgba(255,255,255,0.06)" }}>
                    <Lock className={`w-4 h-4 ${(order.escrow === "RELEASED" || order.status === "COMPLETED") ? "text-emerald-400" : "text-violet-400"}`} />
                    <div>
                      <div className={`text-sm font-bold ${(order.escrow === "RELEASED" || order.status === "COMPLETED") ? "text-emerald-400" : "text-violet-400"}`} style={{ fontFamily: "'Inter', sans-serif" }}>
                        {(order.escrow === "RELEASED" || order.status === "COMPLETED") ? "Payment Released" : `$${(order.pricePaid || order.amount || 0).toLocaleString()} Secured`}
                      </div>
                      <div className="text-[10px] text-foreground/30" style={{ fontFamily: "'Inter', sans-serif" }}>
                        {(order.escrow === "RELEASED" || order.status === "COMPLETED") ? "Developer has been paid" : "Protected by Deployra Escrow until delivery approval"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Client Actions */}
                {(canApprove || canRevise) && (
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-foreground/25 mb-3" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Actions</div>
                    <div className="flex flex-wrap gap-2">
                      {canApprove && !processing && (
                        <button onClick={handleApprove}
                          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all"
                          style={{ background: "rgba(16,185,129,0.1)", border: "0.5px solid rgba(16,185,129,0.3)", color: "rgb(16,185,129)", fontFamily: "'Inter', sans-serif" }}>
                          <ThumbsUp className="w-4 h-4" /> Approve & Release Payment
                        </button>
                      )}
                      {canRevise && (
                        <button onClick={() => setShowRevisionInput(p => !p)}
                          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
                          style={{ border: "0.5px solid rgba(251,146,60,0.3)", color: "rgb(251,146,60)", fontFamily: "'Inter', sans-serif" }}>
                          <RotateCcw className="w-4 h-4" /> Request Revision
                        </button>
                      )}
                      <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
                        style={{ border: "0.5px solid rgba(239,68,68,0.2)", color: "rgba(239,68,68,0.7)", fontFamily: "'Inter', sans-serif" }}>
                        <AlertTriangle className="w-4 h-4" /> Open Dispute
                      </button>
                    </div>

                    <AnimatePresence>
                      {showRevisionInput && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-3">
                          <textarea value={revisionNote} onChange={e => setRevisionNote(e.target.value)}
                            placeholder="Describe what needs to be changed or fixed..."
                            rows={3} className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none mb-2"
                            style={{ background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.1)", color: "hsl(var(--foreground))", fontFamily: "'Inter', sans-serif" }} />
                          <div className="flex gap-2">
                            <button onClick={handleRevision} disabled={!revisionNote.trim() || processing}
                              className="px-4 py-2 rounded-lg text-xs font-bold disabled:opacity-40 transition-all"
                              style={{ background: "rgba(251,146,60,0.15)", border: "0.5px solid rgba(251,146,60,0.3)", color: "rgb(251,146,60)", fontFamily: "'Inter', sans-serif" }}>
                              Submit Request
                            </button>
                            <button onClick={() => setShowRevisionInput(false)}
                              className="px-4 py-2 rounded-lg text-xs font-semibold transition-all"
                              style={{ border: "0.5px solid rgba(255,255,255,0.1)", color: "hsl(var(--foreground) / 0.4)", fontFamily: "'Inter', sans-serif" }}>
                              Cancel
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* Completed Review */}
                {isCompleted && order.review && (
                  <div className="p-4 rounded-xl" style={{ background: "rgba(16,185,129,0.04)", border: "0.5px solid rgba(16,185,129,0.15)" }}>
                    <div className="flex items-center gap-1 mb-2">
                      {[1,2,3,4,5].map(s => <Star key={s} className="w-3.5 h-3.5" style={{ color: s <= order.review.rating ? "hsl(var(--foreground))" : "rgba(255,255,255,0.1)", fill: s <= order.review.rating ? "hsl(var(--foreground))" : "none" }} />)}
                    </div>
                    <p className="text-xs text-emerald-400/70" style={{ fontFamily: "'Inter', sans-serif" }}>"{order.review.comment}"</p>
                  </div>
                )}
                {isCompleted && !order.review && (
                  <button onClick={() => setShowReview(true)}
                    className="flex items-center gap-2 text-sm font-semibold transition-colors text-foreground/40 hover:text-foreground"
                    style={{ fontFamily: "'Inter', sans-serif" }}>
                    <Star className="w-4 h-4" /> Leave a Review
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {showReview && (
          <ReviewModal
            order={order}
            onClose={() => setShowReview(false)}
            onSubmit={(review) => onUpdate(order.id, { ...order, review })}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────────
export default function ClientOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("ALL");

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const token = localStorage.getItem("auth_token");
    try {
      const res = await axios.get(`${API_URL}/orders/my`, {
        withCredentials: true,
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      setOrders(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch {
      setError("Could not load orders.");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleUpdate = (id, updated) => {
    setOrders(p => p.map(o => o.id === id ? updated : o));
  };

  const FILTERS = ["ALL", "IN_PROGRESS", "DELIVERED", "COMPLETED", "DISPUTED"];

  const filtered = orders.filter(o =>
    filter === "ALL" ? true : o.status === filter
  );

  const stats = {
    active: orders.filter(o => ["ESCROW_FUNDED", "AWAITING_DEVELOPER", "IN_PROGRESS"].includes(o.status)).length,
    delivered: orders.filter(o => o.status === "DELIVERED").length,
    completed: orders.filter(o => o.status === "COMPLETED").length,
    spent: orders.filter(o => o.status === "COMPLETED").reduce((s, o) => s + o.amount, 0),
  };

  if (loading) return (
    <div className="p-8 flex items-center justify-center min-h-[400px]">
      <Loader2 className="w-8 h-8 animate-spin text-foreground/30" />
    </div>
  );

  if (error) return (
    <div className="p-8">
      <div className="frosted-panel p-6 text-red-400 text-sm">{error}</div>
    </div>
  );

  return (
    <div className="p-6 sm:p-8 max-w-5xl page-fade-in">
      {/* Header */}
      <div className="mb-8">
        <div className="stat-label-caps mb-2">Business Hub · Orders</div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground section-title-gradient" style={{ fontFamily: "Georgia, serif", letterSpacing: "-0.04em" }}>
          My Orders
        </h1>
        <p className="text-sm mt-1.5" style={{ color: "hsl(var(--foreground) / 0.35)", fontFamily: "'Inter', sans-serif" }}>
          Track your purchases from escrow to delivery.
        </p>
      </div>

      {/* Stats */}
      {orders.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Active", value: stats.active, color: "text-indigo-400" },
            { label: "Awaiting Approval", value: stats.delivered, color: "text-sky-400" },
            { label: "Completed", value: stats.completed, color: "text-emerald-400" },
            { label: "Total Spent", value: `$${stats.spent.toLocaleString()}`, color: "text-violet-400" },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              className="frosted-panel p-4">
              <div className={`text-2xl font-bold ${s.color}`} style={{ fontFamily: "Georgia, serif" }}>{s.value}</div>
              <div className="text-[10px] text-foreground/35 mt-0.5" style={{ fontFamily: "'Inter', sans-serif" }}>{s.label}</div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-1 p-1 rounded-xl mb-6 w-fit"
        style={{ background: "rgba(150,150,150,0.05)", border: "0.5px solid rgba(150,150,150,0.1)" }}>
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${filter === f ? "bg-foreground text-background" : "text-foreground/40 hover:text-foreground/70"}`}
            style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            {f === "ALL" ? "All" : STATUS_CONFIG[f]?.label || f}
          </button>
        ))}
      </div>

      {/* Orders */}
      {orders.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6"
            style={{ background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.08)" }}>
            <ShoppingBag className="w-10 h-10 text-foreground/15" />
          </div>
          <h2 className="text-lg font-bold text-foreground/50 mb-2" style={{ fontFamily: "Georgia, serif" }}>No Orders Yet</h2>
          <p className="text-sm text-foreground/30 mb-6" style={{ fontFamily: "'Inter', sans-serif" }}>
            Browse the marketplace and get your first product deployed.
          </p>
          <a href="/client/marketplace">
            <button className="px-6 py-3 rounded-xl text-sm font-bold transition-all"
              style={{ background: "hsl(var(--foreground))", color: "hsl(var(--background))", fontFamily: "'Inter', sans-serif" }}>
              Explore Marketplace
            </button>
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((o, i) => (
            <OrderCard key={o.id} order={o} idx={i} onUpdate={handleUpdate} />
          ))}
        </div>
      )}
    </div>
  );
}
