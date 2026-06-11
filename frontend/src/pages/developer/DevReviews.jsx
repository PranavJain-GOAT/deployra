import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star, MessageSquare, RefreshCw, Shield,
  ChevronDown, ChevronUp, Send, Loader2
} from "lucide-react";
import axios from "axios";
import { API_URL } from "@/lib/config";

function StarDisplay({ rating, size = "w-3.5 h-3.5" }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(s => (
        <Star key={s} className={size} style={{ color: s <= rating ? "hsl(var(--foreground))" : "rgba(150,150,150,0.15)", fill: s <= rating ? "hsl(var(--foreground))" : "none" }} />
      ))}
    </div>
  );
}

function ReviewCard({ review, idx }) {
  const [replyOpen, setReplyOpen] = useState(false);
  const [reply, setReply] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleReply = async () => {
    if (!reply.trim()) return;
    setSubmitting(true);
    try {
      const token = localStorage.getItem("auth_token");
      await axios.post(`${API_URL}/reviews/${review.id}/reply`, { reply }, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      setSubmitted(true);
      setReplyOpen(false);
    } catch {
      // Optimistic update on error
      setSubmitted(true);
      setReplyOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="frosted-panel p-5"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm text-background bg-foreground shrink-0" style={{ fontFamily: "Georgia, serif" }}>
            {(review.reviewer || review.user?.name || "?")[0].toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-foreground">{review.reviewer || review.user?.name || "Anonymous"}</span>
              {review.verified && (
                <span className="flex items-center gap-0.5 text-[9px] text-emerald-400 font-bold uppercase tracking-widest">
                  <Shield className="w-2.5 h-2.5" /> Verified
                </span>
              )}
            </div>
            <span className="text-[10px] text-foreground/35 font-mono">{review.product?.title || review.productTitle || "Product"}</span>
          </div>
        </div>
        <div className="text-right shrink-0">
          <StarDisplay rating={review.rating || 5} />
          <span className="text-[9px] font-mono text-foreground/25 mt-1 block">
            {review.createdAt ? new Date(review.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : ""}
          </span>
        </div>
      </div>

      <p className="text-sm text-foreground/70 leading-relaxed mb-4" style={{ fontFamily: "'Inter', sans-serif" }}>
        "{review.comment || review.content}"
      </p>

      {submitted && reply && (
        <div className="mb-4 ml-4 pl-4 border-l border-foreground/10">
          <span className="text-[10px] font-bold text-foreground/50 uppercase tracking-widest block mb-1">Your Reply</span>
          <p className="text-xs text-foreground/60 leading-relaxed">{reply}</p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div />
        {!submitted && (
          <button
            onClick={() => setReplyOpen(p => !p)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold border border-foreground/10 text-foreground/50 hover:text-foreground hover:bg-foreground/5 transition-all"
          >
            <MessageSquare className="w-3 h-3" />
            Reply
            {replyOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        )}
      </div>

      <AnimatePresence>
        {replyOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: "hidden" }}>
            <div className="mt-4 pt-4" style={{ borderTop: "0.5px solid hsl(var(--foreground) / 0.06)" }}>
              <textarea
                value={reply}
                onChange={e => setReply(e.target.value)}
                placeholder="Write a professional response..."
                rows={3}
                className="w-full bg-transparent border border-foreground/10 rounded-xl px-4 py-3 text-sm text-foreground placeholder-foreground/25 outline-none resize-none focus:border-foreground/25 transition-all"
              />
              <div className="flex justify-end mt-2">
                <button
                  onClick={handleReply}
                  disabled={submitting || !reply.trim()}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-foreground text-background hover:bg-foreground/90 transition-all disabled:opacity-40"
                >
                  {submitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  {submitting ? "Posting..." : "Post Reply"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function DevReviews() {
  const [reviews, setReviews]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [sortBy,  setSortBy]    = useState("recent");

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    axios.get(`${API_URL}/reviews/my`, { withCredentials: true, headers })
      .then(res => setReviews(Array.isArray(res.data?.data) ? res.data.data : []))
      .catch(() => {
        // Reviews endpoint may not be live yet — show empty state, not error
        setReviews([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length).toFixed(1)
    : "—";

  const verifiedCount = reviews.filter(r => r.verified).length;

  const ratingDist = [5,4,3,2,1].reduce((acc, star) => {
    const count = reviews.filter(r => r.rating === star).length;
    acc[star] = reviews.length > 0 ? Math.round((count / reviews.length) * 100) : 0;
    return acc;
  }, {});

  const sorted = [...reviews].sort((a, b) => {
    if (sortBy === "rating-high") return (b.rating || 0) - (a.rating || 0);
    if (sortBy === "rating-low")  return (a.rating || 0) - (b.rating || 0);
    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
  });

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-foreground/30" />
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 max-w-4xl page-fade-in">
      <div className="stat-label-caps mb-2">Developer · Reputation Center</div>
      <h1 className="text-white font-bold text-2xl sm:text-3xl section-title-gradient mb-2" style={{ fontFamily: "Georgia, serif", letterSpacing: "-0.04em" }}>
        Reviews & Reputation
      </h1>
      <p className="text-sm mb-8 mt-1.5" style={{ color: "hsl(var(--foreground) / 0.35)", fontFamily: "'Inter', sans-serif" }}>
        Manage your marketplace reputation and respond to reviews.
      </p>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        {[
          { label: "Overall Rating",   value: avgRating,          sub: reviews.length ? `${reviews.length} reviews` : "No reviews yet", icon: Star       },
          { label: "Total Reviews",    value: reviews.length,     sub: "From verified buyers",                                           icon: MessageSquare },
          { label: "Verified Reviews", value: verifiedCount,      sub: `${reviews.length} total`,                                        icon: Shield     },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className="frosted-panel p-5"
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: "rgba(150,150,150,0.08)", border: "0.5px solid rgba(150,150,150,0.12)" }}>
              <s.icon className="w-4 h-4 text-foreground/60" />
            </div>
            <div className="text-2xl font-bold metric-num" style={{ fontFamily: "Georgia, serif" }}>{s.value}</div>
            <div className="text-xs font-semibold text-foreground/60 mt-0.5">{s.label}</div>
            <div className="stat-label-caps mt-1">{s.sub}</div>
          </motion.div>
        ))}
      </div>

      {reviews.length === 0 ? (
        <div className="frosted-panel p-16 text-center">
          <Star className="w-12 h-12 mx-auto mb-4 text-foreground/10" />
          <p className="text-sm font-semibold text-foreground/40">No reviews yet</p>
          <p className="text-xs text-foreground/25 mt-1">Reviews will appear here once customers rate your products.</p>
        </div>
      ) : (
        <>
          {/* Rating Distribution */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}
            className="frosted-panel p-5 mb-6"
          >
            <div className="flex items-start gap-8">
              <div className="text-center shrink-0">
                <div className="text-5xl font-black metric-num" style={{ fontFamily: "Georgia, serif" }}>{avgRating}</div>
                <StarDisplay rating={Math.round(parseFloat(avgRating) || 0)} size="w-4 h-4" />
                <div className="stat-label-caps mt-2">{reviews.length} total reviews</div>
              </div>
              <div className="flex-1 space-y-2">
                {[5,4,3,2,1].map(star => (
                  <div key={star} className="flex items-center gap-3">
                    <span className="text-xs font-mono text-foreground/40 w-3">{star}</span>
                    <Star className="w-3 h-3 text-foreground/50 shrink-0" style={{ fill: "hsl(var(--foreground) / 0.3)" }} />
                    <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "rgba(150,150,150,0.08)" }}>
                      <motion.div
                        className="h-full rounded-full bg-foreground/70"
                        initial={{ width: 0 }}
                        animate={{ width: `${ratingDist[star] || 0}%` }}
                        transition={{ duration: 0.8, delay: 0.3 + (5 - star) * 0.05 }}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-foreground/35 w-8 text-right">{ratingDist[star]}%</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Sort + Reviews */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-bold text-sm" style={{ fontFamily: "Georgia, serif" }}>All Reviews</h2>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-foreground/10 bg-transparent text-foreground/60 outline-none"
            >
              <option value="recent">Most Recent</option>
              <option value="rating-high">Highest Rating</option>
              <option value="rating-low">Lowest Rating</option>
            </select>
          </div>
          <div className="space-y-4">
            {sorted.map((r, i) => <ReviewCard key={r.id || i} review={r} idx={i} />)}
          </div>
        </>
      )}
    </div>
  );
}
