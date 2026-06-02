import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star, MessageSquare, RefreshCw,
  ThumbsUp, ChevronDown, ChevronUp, Send, Repeat, Shield
} from "lucide-react";

const REVIEWS = [
  {
    id: "rev-1", reviewer: "Sarah M.", company: "AcmeCorp", product: "AI Support Chatbot",
    rating: 5, date: "May 27, 2025",
    comment: "Deployed in under 10 minutes. The escrow process was seamless and the product exceeded every expectation. Incredible ROI from day one.",
    helpful: 14, replied: false, verified: true
  },
  {
    id: "rev-2", reviewer: "Tech Corp", company: "TechCorp Inc.", product: "Data Pipeline Pro",
    rating: 4, date: "May 22, 2025",
    comment: "Solid data extraction. Documentation is thorough. Would appreciate a Spark integration in the next version. Support was responsive.",
    helpful: 8, replied: true, replyText: "Thank you! Spark integration is on our Q3 roadmap. Stay tuned.", verified: true
  },
  {
    id: "rev-3", reviewer: "Alex K.", company: "VC Startup Fund",  product: "Analytics Suite",
    rating: 5, date: "May 18, 2025",
    comment: "Best enterprise analytics tool on Deployra. Saved our team 40 hours per month. The deployment was flawless.",
    helpful: 22, replied: false, verified: true
  },
  {
    id: "rev-4", reviewer: "Dev Team", company: "Enterprise Co.", product: "CRM Integration",
    rating: 3, date: "May 10, 2025",
    comment: "Product has potential but setup documentation needs improvement. Took longer than expected to configure Salesforce connector.",
    helpful: 3, replied: true, replyText: "We've updated the Salesforce setup guide based on your feedback. Thank you for helping us improve!", verified: false
  },
];

const RATING_DIST = { 5: 68, 4: 22, 3: 7, 2: 2, 1: 1 };

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
  const [reply, setReply] = useState(review.replyText || "");
  const [submitted, setSubmitted] = useState(review.replied);
  const [submitting, setSubmitting] = useState(false);

  const handleReply = () => {
    if (!reply.trim()) return;
    setSubmitting(true);
    setTimeout(() => { setSubmitting(false); setSubmitted(true); setReplyOpen(false); }, 1200);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="frosted-panel p-5"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm text-background bg-foreground shrink-0" style={{ fontFamily: "Georgia, serif" }}>
            {review.reviewer[0]}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-foreground" style={{ fontFamily: "'Inter', sans-serif" }}>{review.reviewer}</span>
              {review.verified && (
                <span className="flex items-center gap-0.5 text-[9px] text-emerald-400 font-bold uppercase tracking-widest">
                  <Shield className="w-2.5 h-2.5" /> Verified
                </span>
              )}
            </div>
            <span className="text-[10px] text-foreground/35 font-mono">{review.company} · {review.product}</span>
          </div>
        </div>
        <div className="text-right shrink-0">
          <StarDisplay rating={review.rating} />
          <span className="text-[9px] font-mono text-foreground/25 mt-1 block">{review.date}</span>
        </div>
      </div>

      {/* Comment */}
      <p className="text-sm text-foreground/70 leading-relaxed mb-4" style={{ fontFamily: "'Inter', sans-serif" }}>
        "{review.comment}"
      </p>

      {/* Existing Reply */}
      {submitted && reply && (
        <div className="mb-4 ml-4 pl-4 border-l border-foreground/10">
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="text-[10px] font-bold text-foreground/50 uppercase tracking-widest">Your Reply</span>
          </div>
          <p className="text-xs text-foreground/60 leading-relaxed" style={{ fontFamily: "'Inter', sans-serif" }}>{reply}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-1.5 text-[11px] text-foreground/35 hover:text-foreground/60 transition-colors">
            <ThumbsUp className="w-3.5 h-3.5" />
            {review.helpful} found helpful
          </button>
        </div>
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

      {/* Reply Input */}
      <AnimatePresence>
        {replyOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: "hidden" }}>
            <div className="mt-4 pt-4" style={{ borderTop: "0.5px solid hsl(var(--foreground) / 0.06)" }}>
              <textarea
                value={reply}
                onChange={e => setReply(e.target.value)}
                placeholder="Write a professional response to this review..."
                rows={3}
                className="w-full bg-transparent border border-foreground/10 rounded-xl px-4 py-3 text-sm text-foreground placeholder-foreground/25 outline-none resize-none focus:border-foreground/25 transition-all"
                style={{ fontFamily: "'Inter', sans-serif" }}
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
  const [sortBy, setSortBy] = useState("recent");

  const avgRating = (REVIEWS.reduce((s, r) => s + r.rating, 0) / REVIEWS.length).toFixed(1);

  const sorted = [...REVIEWS].sort((a, b) => {
    if (sortBy === "rating-high") return b.rating - a.rating;
    if (sortBy === "rating-low") return a.rating - b.rating;
    if (sortBy === "helpful") return b.helpful - a.helpful;
    return new Date(b.date) - new Date(a.date);
  });

  return (
    <div className="p-6 sm:p-8 max-w-4xl page-fade-in">

      {/* Header */}
      <div className="mb-8">
        <div className="stat-label-caps mb-2">Developer · Reputation Center</div>
        <h1 className="text-white font-bold text-2xl sm:text-3xl section-title-gradient" style={{ fontFamily: "Georgia, serif", letterSpacing: "-0.04em" }}>
          Reviews & Reputation
        </h1>
        <p className="text-sm mt-1.5" style={{ color: "hsl(var(--foreground) / 0.35)", fontFamily: "'Inter', sans-serif" }}>
          Manage your marketplace reputation. Respond to reviews and build trust.
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Overall Rating",    value: avgRating, sub: `${REVIEWS.length} reviews`, icon: Star     },
          { label: "Response Rate",     value: "100%",    sub: "All reviews replied",        icon: MessageSquare },
          { label: "Verified Reviews",  value: `${REVIEWS.filter(r => r.verified).length}/${REVIEWS.length}`, sub: "Verified buyers", icon: Shield },
          { label: "Repeat Clients",    value: "38%",     sub: "Returning customers",        icon: Repeat   },
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

      {/* Rating Distribution */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}
        className="frosted-panel p-5 mb-6"
      >
        <div className="flex items-start gap-8">
          <div className="text-center shrink-0">
            <div className="text-5xl font-black metric-num" style={{ fontFamily: "Georgia, serif" }}>{avgRating}</div>
            <StarDisplay rating={Math.round(parseFloat(avgRating))} size="w-4 h-4" />
            <div className="stat-label-caps mt-2">{REVIEWS.length} total reviews</div>
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
                    animate={{ width: `${RATING_DIST[star] || 0}%` }}
                    transition={{ duration: 0.8, delay: 0.3 + (5 - star) * 0.05 }}
                  />
                </div>
                <span className="text-[10px] font-mono text-foreground/35 w-8 text-right">{RATING_DIST[star]}%</span>
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
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          <option value="recent">Most Recent</option>
          <option value="rating-high">Highest Rating</option>
          <option value="rating-low">Lowest Rating</option>
          <option value="helpful">Most Helpful</option>
        </select>
      </div>

      <div className="space-y-4">
        {sorted.map((r, i) => <ReviewCard key={r.id} review={r} idx={i} />)}
      </div>
    </div>
  );
}
