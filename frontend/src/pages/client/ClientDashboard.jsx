import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Package, Rocket, Shield, HeadphonesIcon, TrendingUp,
  ArrowUpRight, CheckCircle, Clock, DollarSign, Activity, Star,
  ShoppingBag, ExternalLink,
} from "lucide-react";
import axios from "axios";
import { API_URL } from "@/lib/config";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Link } from "react-router-dom";

function Skeleton({ h = 120 }) {
  return <div className="skeleton-beam rounded-2xl" style={{ height: h }} />;
}

function StatCard({ label, value, sub, icon: Icon, trend, trendUp, delay = 0 }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="frosted-panel p-5" whileHover={{ y: -3, boxShadow: "0 12px 40px rgba(0,0,0,0.5)" }}>
      <div className="flex items-start justify-between mb-4">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(150,150,150,0.08)", border: "0.5px solid rgba(150,150,150,0.15)" }}>
          <Icon className="w-4 h-4 text-foreground" />
        </div>
        {trend && (
          <span className={`flex items-center gap-0.5 text-[11px] font-bold px-2 py-0.5 rounded-full ${trendUp ? "text-emerald-400 bg-emerald-400/10" : "text-foreground/30 bg-foreground/5"}`}>
            {trendUp && <ArrowUpRight className="w-3 h-3" />}
            {trend}
          </span>
        )}
      </div>
      <div className="text-2xl font-bold metric-num mb-0.5" style={{ fontFamily: "Georgia, serif", letterSpacing: "-0.03em" }}>{value}</div>
      <div className="text-xs font-semibold text-foreground/70">{label}</div>
      {sub && <div className="stat-label-caps mt-1">{sub}</div>}
    </motion.div>
  );
}

// ─── Onboarding Welcome (shown when no purchases) ─────────────────────────────
function WelcomeCard() {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      className="frosted-panel p-8 text-center mb-6">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
        style={{ background: "rgba(255,255,255,0.04)", border: "0.5px solid rgba(255,255,255,0.1)" }}>
        <ShoppingBag className="w-8 h-8 text-foreground/30" />
      </div>
      <h2 className="text-xl font-bold text-foreground mb-2" style={{ fontFamily: "Georgia, serif" }}>
        Welcome to Deployra
      </h2>
      <p className="text-sm text-foreground/40 mb-6 max-w-sm mx-auto" style={{ fontFamily: "'Inter', sans-serif" }}>
        Discover and deploy AI solutions for your business. Browse the marketplace to find the perfect tools.
      </p>
      <Link to="/client/marketplace">
        <button className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold shimmer-btn transition-all"
          style={{ background: "hsl(var(--foreground))", color: "hsl(var(--background))", fontFamily: "'Inter', sans-serif" }}>
          <ExternalLink className="w-4 h-4" /> Browse Marketplace
        </button>
      </Link>
    </motion.div>
  );
}

const EMPTY_SPEND_DATA = [
  { month: "Jan", spend: 0 }, { month: "Feb", spend: 0 }, { month: "Mar", spend: 0 },
  { month: "Apr", spend: 0 }, { month: "May", spend: 0 }, { month: "Jun", spend: 0 },
];

export default function ClientDashboard() {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API_URL}/purchases/my`)
      .then(res => setPurchases(res.data?.data || res.data?.purchases || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="p-6 sm:p-8 max-w-6xl space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">{[1,2,3,4].map(i => <Skeleton key={i} />)}</div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4"><div className="lg:col-span-2"><Skeleton h={300} /></div><Skeleton h={300} /></div>
    </div>
  );

  const totalSpend  = purchases.reduce((s, p) => s + (p.pricePaid || p.amount || 0), 0);
  const activeCount = purchases.filter(p => ["installed", "paid", "COMPLETED"].includes(p.status)).length;
  const isEmpty     = purchases.length === 0;

  // Build monthly spend chart from real purchases
  const spendData = (() => {
    if (purchases.length === 0) return EMPTY_SPEND_DATA;
    const months = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toLocaleString("en-US", { month: "short" });
      months[key] = 0;
    }
    purchases.forEach(p => {
      const d = new Date(p.createdAt || p.purchasedAt);
      const key = d.toLocaleString("en-US", { month: "short" });
      if (key in months) months[key] += (p.pricePaid || p.amount || 0);
    });
    return Object.entries(months).map(([month, spend]) => ({ month, spend }));
  })();

  return (
    <div className="p-6 sm:p-8 max-w-6xl page-fade-in">

      {/* Header */}
      <div className="mb-8">
        <div className="stat-label-caps mb-2">Business Hub · {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</div>
        <h1 className="text-white font-bold text-2xl sm:text-3xl section-title-gradient" style={{ fontFamily: "Georgia, serif", letterSpacing: "-0.04em" }}>
          Operations Dashboard
        </h1>
        <p className="text-sm mt-1.5" style={{ color: "hsl(var(--foreground) / 0.35)", fontFamily: "'Inter', sans-serif" }}>
          Your real-time overview of deployments, purchases, and business health.
        </p>
      </div>

      {/* Welcome card for new users */}
      {isEmpty && <WelcomeCard />}

      {/* Primary Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard label="Total Purchases"    value={purchases.length}  sub="All time"          icon={Package}      delay={0.00} />
        <StatCard label="Active Deployments" value={activeCount}       sub="Running now"       icon={Rocket}       delay={0.06} />
        <StatCard label="Total Spend"        value={`$${totalSpend.toLocaleString()}`} sub="All-time" icon={DollarSign} delay={0.12} />
        <StatCard label="Escrow Held"        value="$0"                sub="Awaiting release"  icon={Shield}       delay={0.18} />
      </div>

      {/* Secondary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard label="Deployment Health" value={isEmpty ? "—" : "Active"}    sub="System status"    icon={TrendingUp}     delay={0.24} />
        <StatCard label="Open Tickets"      value="0"                           sub="Support requests" icon={HeadphonesIcon} delay={0.30} />
        <StatCard label="Avg Rating"        value={isEmpty ? "—" : "No data"}   sub="Your vendors"     icon={Star}           delay={0.36} />
        <StatCard label="Renewals (30d)"    value="0"                           sub="Upcoming"         icon={Activity}       delay={0.42} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">

        {/* Spend Trend */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="lg:col-span-2 frosted-panel p-5">
          <div className="flex items-center justify-between mb-5" style={{ borderBottom: "0.5px solid hsl(var(--foreground) / 0.05)", paddingBottom: "1rem" }}>
            <div>
              <h2 className="text-white font-bold text-sm" style={{ fontFamily: "Georgia, serif" }}>Investment Trend</h2>
              <p className="stat-label-caps mt-0.5">Monthly platform spend</p>
            </div>
            <span className="premium-badge premium-badge-monochrome">6 months</span>
          </div>
          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={spendData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--foreground))" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="hsl(var(--foreground))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--foreground) / 0.3)", fontFamily: "'JetBrains Mono', monospace" }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip contentStyle={{ background: "rgba(0,0,0,0.95)", color: "#fff", border: "0.5px solid rgba(150,150,150,0.2)", borderRadius: "10px", fontSize: "11px", fontFamily: "'JetBrains Mono', monospace" }} formatter={v => [`$${v.toLocaleString()}`, "Spend"]} />
                <Area type="monotone" dataKey="spend" stroke="hsl(var(--foreground) / 0.7)" strokeWidth={2} fill="url(#cg)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
          className="frosted-panel p-5">
          <div className="flex items-center justify-between mb-4" style={{ borderBottom: "0.5px solid hsl(var(--foreground) / 0.05)", paddingBottom: "0.75rem" }}>
            <h2 className="text-white font-bold text-sm" style={{ fontFamily: "Georgia, serif" }}>Recent Activity</h2>
            <span className="premium-badge premium-badge-monochrome">Live</span>
          </div>
          <div className="space-y-3">
            {purchases.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="w-8 h-8 mx-auto mb-2 text-foreground/15" />
                <p className="text-xs text-foreground/30" style={{ fontFamily: "'Inter', sans-serif" }}>No activity yet</p>
              </div>
            ) : (
              purchases.slice(0, 5).map((p, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(150,150,150,0.06)", border: "0.5px solid rgba(150,150,150,0.1)" }}>
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-foreground/70 leading-snug truncate">{p.product?.title || "Product purchase"}</p>
                    <span className="text-[9px] font-mono text-foreground/25">{new Date(p.createdAt || Date.now()).toLocaleDateString()}</span>
                  </div>
                  <span className="text-xs font-bold metric-num" style={{ fontFamily: "Georgia, serif" }}>${(p.pricePaid || 0).toLocaleString()}</span>
                </div>
              ))
            )}
          </div>
          {isEmpty && (
            <Link to="/client/marketplace">
              <button className="mt-4 w-full py-2 rounded-xl text-xs font-semibold border border-foreground/10 text-foreground/40 hover:text-foreground hover:bg-foreground/5 transition-all">
                Browse Marketplace
              </button>
            </Link>
          )}
        </motion.div>
      </div>

      {/* Purchases Table */}
      {purchases.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
          className="frosted-panel overflow-hidden">
          <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "0.5px solid hsl(var(--foreground) / 0.05)" }}>
            <div>
              <h2 className="text-white font-bold text-sm" style={{ fontFamily: "Georgia, serif" }}>My Purchases</h2>
              <p className="stat-label-caps mt-0.5">{purchases.length} products purchased</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="premium-table w-full">
              <thead>
                <tr>
                  <th className="text-left">Product</th>
                  <th className="text-center">Status</th>
                  <th className="text-center">Date</th>
                  <th className="text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {purchases.map(p => (
                  <tr key={p.id}>
                    <td><span className="font-semibold text-sm text-foreground">{p.product?.title || "Product"}</span></td>
                    <td className="text-center">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${["installed","COMPLETED","paid"].includes(p.status) ? "text-emerald-400 bg-emerald-400/10" : "text-amber-400 bg-amber-400/10"}`}>
                        {p.status || "ACTIVE"}
                      </span>
                    </td>
                    <td className="text-center"><span className="text-xs font-mono text-foreground/35">{new Date(p.createdAt || Date.now()).toLocaleDateString()}</span></td>
                    <td className="text-right"><span className="font-bold text-sm metric-num" style={{ fontFamily: "Georgia, serif" }}>${(p.pricePaid || 0).toLocaleString()}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
}
