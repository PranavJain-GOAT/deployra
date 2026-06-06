import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Edit, Trash2, Eye, Shield, Clock, CheckCircle, XCircle,
  AlertCircle, Package, BarChart2, Settings, ChevronRight,
  TrendingUp, Star, Zap, RefreshCw, ExternalLink, MoreHorizontal,
  Globe, FileText, Copy
} from "lucide-react";
import axios from "axios";
import { API_URL } from "@/lib/config";

// ─── Verification Badge ────────────────────────────────────────────────────────
function VerificationBadge({ status }) {
  const config = {
    APPROVED:       { label: "Live",          icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-400/8",   border: "border-emerald-400/20" },
    PENDING_REVIEW: { label: "Under Review",  icon: Clock,       color: "text-amber-400",  bg: "bg-amber-400/8",    border: "border-amber-400/20"  },
    REJECTED:       { label: "Needs Changes", icon: XCircle,     color: "text-red-400",    bg: "bg-red-400/8",      border: "border-red-400/20"    },
    DRAFT:          { label: "Draft",         icon: AlertCircle, color: "text-foreground/40", bg: "bg-foreground/5", border: "border-foreground/10" },
    SUSPENDED:      { label: "Suspended",     icon: XCircle,     color: "text-red-500",    bg: "bg-red-500/8",      border: "border-red-500/20"    },
  };
  const cfg = config[status] || config.PENDING_REVIEW;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${cfg.color} ${cfg.bg} ${cfg.border}`}>
      <Icon className="w-3.5 h-3.5" /> {cfg.label}
    </span>
  );
}

// ─── Listing Card ──────────────────────────────────────────────────────────────
function ListingCard({ listing, idx, onDelete }) {
  const [showMenu, setShowMenu] = useState(false);
  const isLive      = listing.verificationStatus === "APPROVED";
  const isPending   = listing.verificationStatus === "PENDING_REVIEW";
  const isRejected  = listing.verificationStatus === "REJECTED";
  const isSuspended = listing.verificationStatus === "SUSPENDED";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.06, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="frosted-panel overflow-hidden"
    >
      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 text-lg font-bold"
            style={{ background: "rgba(255,255,255,0.04)", border: "0.5px solid rgba(255,255,255,0.1)", fontFamily: "Georgia, serif", color: "hsl(var(--foreground) / 0.6)" }}>
            {listing.title[0]}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="font-bold text-sm text-foreground truncate" style={{ fontFamily: "'Inter', sans-serif" }}>{listing.title}</h3>
                  {isLive && <Shield className="w-3.5 h-3.5 text-emerald-400 shrink-0" title="Deployra Verified" />}
                </div>
                <p className="text-xs text-foreground/35 truncate" style={{ fontFamily: "'Inter', sans-serif" }}>{listing.shortDesc}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-[10px] font-mono text-foreground/25">{listing.category}</span>
                  <span className="text-[10px] font-mono text-foreground/25">₹{listing.price.toLocaleString()}</span>
                  <span className="text-[10px] font-mono text-foreground/25">{listing.createdAt}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <VerificationBadge status={listing.verificationStatus} />
                <div className="relative">
                  <button onClick={() => setShowMenu(p => !p)}
                    className="p-1.5 rounded-lg text-foreground/30 hover:text-foreground hover:bg-foreground/5 transition-all">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                  <AnimatePresence>
                    {showMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: -4, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -4, scale: 0.95 }}
                        className="absolute right-0 top-8 z-20 min-w-40 rounded-xl overflow-hidden py-1"
                        style={{ background: "rgba(0,0,0,0.95)", border: "0.5px solid rgba(255,255,255,0.12)", boxShadow: "0 20px 60px rgba(0,0,0,0.8)" }}
                        onClick={() => setShowMenu(false)}>
                        <Link to={`/developer/edit/${listing.id}`}>
                          <button className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-left text-foreground/60 hover:text-foreground hover:bg-foreground/5 transition-all"
                            style={{ fontFamily: "'Inter', sans-serif" }}>
                            <Edit className="w-3.5 h-3.5" /> Edit Product
                          </button>
                        </Link>
                        {listing.demoUrl && (
                          <a href={listing.demoUrl} target="_blank" rel="noopener noreferrer">
                            <button className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-left text-foreground/60 hover:text-foreground hover:bg-foreground/5 transition-all"
                              style={{ fontFamily: "'Inter', sans-serif" }}>
                              <Globe className="w-3.5 h-3.5" /> View Demo
                            </button>
                          </a>
                        )}
                        <button
                          onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/product/${listing.id}`); setShowMenu(false); }}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-left text-foreground/60 hover:text-foreground hover:bg-foreground/5 transition-all"
                          style={{ fontFamily: "'Inter', sans-serif" }}>
                          <Copy className="w-3.5 h-3.5" /> Copy Link
                        </button>
                        <div className="h-px mx-3 my-1 bg-foreground/8" />
                        <button onClick={() => { setShowMenu(false); onDelete(listing.id); }}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-left text-red-400 hover:bg-red-400/8 transition-all"
                          style={{ fontFamily: "'Inter', sans-serif" }}>
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Stats Row (only for live) */}
            {isLive && (
              <div className="flex items-center gap-4 mt-4 pt-3" style={{ borderTop: "0.5px solid rgba(255,255,255,0.05)" }}>
                {[
                  { icon: Eye, label: "Views", value: listing.views.toLocaleString() },
                  { icon: Package, label: "Orders", value: listing.orders },
                  { icon: Star, label: "Rating", value: listing.rating || "—" },
                  { icon: TrendingUp, label: "Revenue", value: `₹${listing.revenue.toLocaleString()}` },
                ].map(stat => {
                  const Icon = stat.icon;
                  return (
                    <div key={stat.label} className="flex items-center gap-1.5">
                      <Icon className="w-3 h-3 text-foreground/25" />
                      <span className="text-[10px] text-foreground/30" style={{ fontFamily: "'Inter', sans-serif" }}>{stat.label}:</span>
                      <span className="text-xs font-bold text-foreground/60" style={{ fontFamily: "'Inter', sans-serif" }}>{stat.value}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Rejection Reason */}
            {isRejected && listing.rejectionReason && (
              <div className="mt-3 p-3 rounded-xl flex items-start gap-2.5" style={{ background: "rgba(239,68,68,0.05)", border: "0.5px solid rgba(239,68,68,0.2)" }}>
                <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[11px] font-bold text-red-400 mb-0.5" style={{ fontFamily: "'Inter', sans-serif" }}>Needs Changes</p>
                  <p className="text-[11px] text-red-400/70" style={{ fontFamily: "'Inter', sans-serif" }}>{listing.rejectionReason}</p>
                  <Link to={`/developer/edit/${listing.id}`}>
                    <button className="mt-2 flex items-center gap-1.5 text-[10px] font-bold text-red-400 hover:text-red-300 transition-colors"
                      style={{ fontFamily: "'Inter', sans-serif" }}>
                      Fix & Resubmit
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </Link>
                </div>
              </div>
            )}

            {/* Pending message */}
            {isPending && (
              <div className="mt-3 p-3 rounded-xl flex items-center gap-2.5" style={{ background: "rgba(234,179,8,0.04)", border: "0.5px solid rgba(234,179,8,0.2)" }}>
                <RefreshCw className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: "3s" }} />
                <p className="text-[11px] text-amber-400/80" style={{ fontFamily: "'Inter', sans-serif" }}>
                  Under Deployra review. Usually takes 24–48 hours.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Empty State ───────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <div className="text-center py-20">
      <div className="w-20 h-20 rounded-20 flex items-center justify-center mx-auto mb-6"
        style={{ background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.08)" }}>
        <Package className="w-10 h-10 text-foreground/15" />
      </div>
      <h2 className="text-lg font-bold text-foreground/60 mb-2" style={{ fontFamily: "Georgia, serif" }}>No Products Yet</h2>
      <p className="text-sm text-foreground/30 mb-8 max-w-xs mx-auto" style={{ fontFamily: "'Inter', sans-serif" }}>
        Build and publish your first product on Deployra. Every product is verified before going live.
      </p>
      <div className="flex flex-col items-center gap-3">
        <Link to="/developer/publish">
          <button className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all shimmer-btn"
            style={{ background: "hsl(var(--foreground))", color: "hsl(var(--background))", fontFamily: "'Inter', sans-serif" }}>
            <Plus className="w-4 h-4" /> Publish Your First Product
          </button>
        </Link>
        <p className="text-[11px] text-foreground/20" style={{ fontFamily: "'Inter', sans-serif" }}>
          Verification takes 24–48 hours
        </p>
      </div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────────
export default function Listings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get(`${API_URL}/products/my`);
        const data = res.data?.data || [];
        setListings(data);
      } catch {
        setListings([]);
      }
      setLoading(false);
    };
    const timer = setTimeout(load, 400);
    return () => clearTimeout(timer);
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Delete this listing permanently?")) return;
    try {
      await axios.delete(`${API_URL}/products/${id}`);
      setListings(p => p.filter(l => l.id !== id));
    } catch {
      setListings(p => p.filter(l => l.id !== id)); // optimistic
    }
  };

  const FILTERS = ["ALL", "APPROVED", "PENDING_REVIEW", "REJECTED"];

  const filtered = listings.filter(l =>
    filter === "ALL" ? true : l.verificationStatus === filter
  );

  const totalRevenue = listings.filter(l => l.verificationStatus === "APPROVED").reduce((s, l) => s + (l.revenue || 0), 0);
  const totalOrders  = listings.reduce((s, l) => s + (l.orders || 0), 0);

  const filterLabel = (f) => {
    if (f === "ALL") return "All";
    if (f === "APPROVED") return "Live";
    if (f === "PENDING_REVIEW") return "Under Review";
    if (f === "REJECTED") return "Needs Changes";
    return f;
  };

  if (loading) return (
    <div className="p-6 sm:p-8 max-w-5xl space-y-4">
      {[1, 2, 3].map(i => <div key={i} className="skeleton-beam rounded-2xl" style={{ height: 100 }} />)}
    </div>
  );

  return (
    <div className="p-6 sm:p-8 max-w-5xl page-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="stat-label-caps mb-2">Developer · Marketplace</div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground section-title-gradient" style={{ fontFamily: "Georgia, serif, letterSpacing: -0.04em" }}>
            My Listings
          </h1>
          <p className="text-sm mt-1.5" style={{ color: "hsl(var(--foreground) / 0.35)", fontFamily: "'Inter', sans-serif" }}>
            {listings.length} product{listings.length !== 1 ? "s" : ""} · {listings.filter(l => l.verificationStatus === "APPROVED").length} live
          </p>
        </div>
        <Link to="/developer/publish">
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all shimmer-btn"
            style={{ background: "hsl(var(--foreground))", color: "hsl(var(--background))", fontFamily: "'Inter', sans-serif" }}>
            <Plus className="w-4 h-4" /> Publish Product
          </button>
        </Link>
      </div>

      {/* Summary Stats */}
      {listings.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Total Products", value: listings.length, color: "text-foreground" },
            { label: "Live Products",  value: listings.filter(l => l.verificationStatus === "APPROVED").length, color: "text-emerald-400" },
            { label: "Total Orders",   value: totalOrders, color: "text-indigo-400" },
            { label: "Total Revenue",  value: `₹${totalRevenue.toLocaleString()}`, color: "text-violet-400" },
          ].map((s, i) => (
            <div key={s.label} className="frosted-panel p-4">
              <div className={`text-2xl font-bold ${s.color}`} style={{ fontFamily: "Georgia, serif" }}>{s.value}</div>
              <div className="text-[10px] text-foreground/35 mt-0.5" style={{ fontFamily: "'Inter', sans-serif" }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      {listings.length > 0 && (
        <div className="flex items-center gap-1 p-1 rounded-xl mb-5 w-fit"
          style={{ background: "rgba(150,150,150,0.05)", border: "0.5px solid rgba(150,150,150,0.1)" }}>
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-lg text-[11px] font-bold transition-all ${filter === f ? "bg-foreground text-background" : "text-foreground/40 hover:text-foreground/70"}`}
              style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              {filterLabel(f)}
              {f !== "ALL" && (
                <span className="ml-1.5 opacity-60">
                  ({listings.filter(l => l.verificationStatus === f).length})
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Listings */}
      {listings.length === 0 ? (
        <EmptyState />
      ) : filtered.length === 0 ? (
        <div className="frosted-panel p-12 text-center">
          <Package className="w-10 h-10 mx-auto mb-3 text-foreground/15" />
          <p className="text-sm text-foreground/40" style={{ fontFamily: "'Inter', sans-serif" }}>No products in this status.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filtered.map((listing, i) => (
              <ListingCard key={listing.id} listing={listing} idx={i} onDelete={handleDelete} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
