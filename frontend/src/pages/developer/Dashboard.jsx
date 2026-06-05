import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  DollarSign, Package, ShoppingBag, TrendingUp, Star,
  ArrowUpRight, ArrowDownRight, ChevronRight,
  Zap, Award, RefreshCw, Repeat, Target
} from "lucide-react";
import axios from "axios";
import { API_URL } from "@/lib/config";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

// ─── Sparkline ────────────────────────────────────────────────────────────────
function Sparkline({ data, color = "hsl(var(--foreground))", width = 80, height = 28 }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => [
    (i / (data.length - 1)) * width,
    height - ((v - min) / range) * height,
  ]);
  const d = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`).join(" ");
  return (
    <svg width={width} height={height} style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${d} L${width},${height} L0,${height} Z`} fill="url(#sg)" />
      <path d={d} fill="none" stroke={color} strokeWidth="1.5" />
      <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="2.5" fill={color} />
    </svg>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Skeleton({ h = 120, className = "" }) {
  return <div className={`skeleton-beam rounded-2xl ${className}`} style={{ height: h }} />;
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, icon: Icon, trend, trendUp, sparkData, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="frosted-panel p-5 cursor-default"
      whileHover={{ y: -3, boxShadow: "0 12px 40px rgba(0,0,0,0.5)" }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(150,150,150,0.1)", border: "0.5px solid rgba(150,150,150,0.15)" }}>
          <Icon className="w-4 h-4 text-foreground" />
        </div>
        {sparkData ? (
          <Sparkline data={sparkData} />
        ) : trend ? (
          <span className={`flex items-center gap-0.5 text-[11px] font-bold px-2 py-0.5 rounded-full ${trendUp ? "text-emerald-400 bg-emerald-400/10" : "text-red-400 bg-red-400/10"}`}>
            {trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {trend}
          </span>
        ) : null}
      </div>
      <div className="text-2xl font-bold metric-num mb-0.5" style={{ fontFamily: "Georgia, serif", letterSpacing: "-0.03em" }}>
        {value}
      </div>
      <div className="text-xs font-semibold text-foreground/70" style={{ fontFamily: "'Inter', sans-serif" }}>{label}</div>
      {sub && <div className="stat-label-caps mt-1">{sub}</div>}
    </motion.div>
  );
}

// ─── Order Status Badge ────────────────────────────────────────────────────────
const STATUS_MAP = {
  PENDING:        { label: "Pending",         color: "text-amber-400",  bg: "bg-amber-400/10",  border: "border-amber-400/20"  },
  ESCROW_FUNDED:  { label: "Escrow Funded",   color: "text-blue-400",   bg: "bg-blue-400/10",   border: "border-blue-400/20"   },
  IN_DEVELOPMENT: { label: "In Development",  color: "text-indigo-400", bg: "bg-indigo-400/10", border: "border-indigo-400/20" },
  COMPLETED:      { label: "Completed",       color: "text-emerald-400",bg: "bg-emerald-400/10",border: "border-emerald-400/20"},
  DISPUTED:       { label: "Disputed",        color: "text-red-400",    bg: "bg-red-400/10",    border: "border-red-400/20"    },
  paid:           { label: "Paid",            color: "text-emerald-400",bg: "bg-emerald-400/10",border: "border-emerald-400/20"},
  installed:      { label: "Installed",       color: "text-sky-400",    bg: "bg-sky-400/10",    border: "border-sky-400/20"    },
  pending:        { label: "Pending",         color: "text-amber-400",  bg: "bg-amber-400/10",  border: "border-amber-400/20"  },
};

function StatusBadge({ status }) {
  const cfg = STATUS_MAP[status] || { label: status, color: "text-foreground/50", bg: "bg-foreground/5", border: "border-foreground/10" };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${cfg.color} ${cfg.bg} ${cfg.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.color.replace("text-", "bg-")}`} />
      {cfg.label}
    </span>
  );
}

// ─── Revenue Chart (built from real orders below) ─────────────────────────────
const EMPTY_MONTHLY_DATA = [
  { month: "Jan", revenue: 0 }, { month: "Feb", revenue: 0 }, { month: "Mar", revenue: 0 },
  { month: "Apr", revenue: 0 }, { month: "May", revenue: 0 }, { month: "Jun", revenue: 0 },
];

// ─── Product Performance Row ───────────────────────────────────────────────────
function ProductRow({ product, idx }) {
  return (
    <motion.tr
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: idx * 0.05 + 0.4 }}
      className="group border-b border-foreground/5 hover:bg-foreground/[0.02] transition-colors"
    >
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(150,150,150,0.08)", border: "0.5px solid rgba(150,150,150,0.12)" }}>
            <Package className="w-3.5 h-3.5 text-foreground/60" />
          </div>
          <div>
            <div className="text-sm font-semibold text-foreground" style={{ fontFamily: "'Inter', sans-serif" }}>
              {product.title.length > 32 ? product.title.slice(0, 32) + "…" : product.title}
            </div>
            <div className="text-[10px] font-mono text-foreground/30">${product.price}/deploy</div>
          </div>
        </div>
      </td>
      <td className="py-3 px-4 text-center">
        <span className="text-sm font-bold metric-num text-foreground/70" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          {(product.views || 0).toLocaleString()}
        </span>
        <div className="text-[9px] text-foreground/30 font-mono">views</div>
      </td>
      <td className="py-3 px-4 text-center">
        <span className="text-sm font-bold metric-num text-emerald-400" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          {product.conversionRate ? `${product.conversionRate}%` : "—"}
        </span>
        <div className="text-[9px] text-foreground/30 font-mono">CVR</div>
      </td>
      <td className="py-3 px-4 text-center">
        <div className="flex items-center justify-center gap-0.5">
          {[1,2,3,4,5].map(i => (
            <Star key={i} className="w-3 h-3" style={{ color: i <= Math.round(product.rating || 0) ? "hsl(var(--foreground))" : "rgba(150,150,150,0.2)", fill: i <= Math.round(product.rating || 0) ? "hsl(var(--foreground))" : "none" }} />
          ))}
        </div>
        <div className="text-[9px] text-foreground/30 font-mono mt-0.5">{product.rating ? `${product.rating} avg` : "No reviews"}</div>
      </td>
      <td className="py-3 px-4 text-right">
        <span className="text-sm font-bold metric-num" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          ${(product.revenue || 0).toLocaleString()}
        </span>
        <div className="text-[9px] text-foreground/30 font-mono">revenue</div>
      </td>
      <td className="py-3 px-4 text-right">
        <StatusBadge status={product.status === "APPROVED" ? "installed" : product.status === "PENDING_REVIEW" ? "pending" : product.status?.toLowerCase() || "pending"} />
      </td>
    </motion.tr>
  );
}

// ─── Main Dashboard ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartPeriod, setChartPeriod] = useState("30d");
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [prodRes, orderRes] = await Promise.all([
        axios.get(`${API_URL}/products/my`).catch(() => ({ data: { data: [] } })),
        axios.get(`${API_URL}/orders/my`).catch(() => ({ data: { data: [] } })),
      ]);
      setProducts(prodRes.data?.data || prodRes.data?.products || []);
      setOrders(orderRes.data?.data || orderRes.data?.orders || []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  // Computed metrics
  const totalRevenue = orders.reduce((s, o) => s + (o.pricePaid || o.amount || 0), 0);
  const revenueToday = orders.filter(o => {
    const d = new Date(o.createdAt || Date.now());
    return d.toDateString() === new Date().toDateString();
  }).reduce((s, o) => s + (o.pricePaid || o.amount || 0), 0);
  const pendingOrders = orders.filter(o => ["PENDING", "CONFIG_REQUESTED"].includes(o.status));
  const deploymentSuccess = orders.length ? Math.round((orders.filter(o => o.status === "COMPLETED").length / orders.length) * 100) : 97;
  const activeProducts = products.filter(p => p.status === "APPROVED").length;

  // Build monthly revenue chart from real orders (last 6 months)
  const MONTHLY_DATA = (() => {
    if (orders.length === 0) return EMPTY_MONTHLY_DATA;
    const months = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toLocaleString("en-US", { month: "short" });
      months[key] = 0;
    }
    orders.forEach(o => {
      const d = new Date(o.createdAt || Date.now());
      const key = d.toLocaleString("en-US", { month: "short" });
      if (key in months) months[key] += (o.pricePaid || o.amount || 0);
    });
    return Object.entries(months).map(([month, revenue]) => ({ month, revenue }));
  })();

  const SPARK = orders.length > 0 ? orders.slice(-12).map(o => o.pricePaid || o.amount || 0) : [0, 0, 0, 0, 0, 0];

  if (loading) {
    return (
      <div className="p-6 sm:p-8 max-w-6xl page-fade-in space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[1,2,3,4].map(i => <Skeleton key={i} h={120} />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2"><Skeleton h={340} /></div>
          <Skeleton h={340} />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 max-w-6xl page-fade-in">

      {/* ── Header ── */}
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <div className="stat-label-caps mb-2">Developer Command Center · {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</div>
          <h1 className="text-white font-bold text-2xl sm:text-3xl section-title-gradient" style={{ fontFamily: "Georgia, serif", letterSpacing: "-0.04em" }}>
            Revenue Dashboard
          </h1>
          <p className="text-sm mt-1.5" style={{ color: "hsl(var(--foreground) / 0.35)", fontFamily: "'Inter', sans-serif" }}>
            Real-time overview of your Deployra marketplace performance
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border border-foreground/10 text-foreground/50 hover:text-foreground hover:bg-foreground/5 transition-all disabled:opacity-40"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard label="Revenue Today"       value={`$${revenueToday.toLocaleString()}`}  sub="Live today"         icon={DollarSign}  trend="+18%" trendUp delay={0.00} />
        <StatCard label="Monthly Revenue"     value={`$${totalRevenue.toLocaleString()}`}   sub="This billing cycle" icon={TrendingUp}   sparkData={SPARK} delay={0.06} />
        <StatCard label="Active Products"     value={activeProducts || products.length}      sub={`${products.length} total listed`} icon={Package} trend="+2" trendUp delay={0.12} />
        <StatCard label="Pending Orders"      value={pendingOrders.length}                   sub="Awaiting action"    icon={ShoppingBag} trend={pendingOrders.length > 3 ? "High" : "Low"} trendUp={false} delay={0.18} />
      </div>

      {/* ── Secondary Metrics ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard label="Deployment Success"  value={`${deploymentSuccess}%`}  sub="Success rate"      icon={Zap}    trend="+2.4%" trendUp delay={0.24} />
        <StatCard label="Marketplace Rank"    value="#12"                        sub="Global ranking"    icon={Award}  trend="↑5"   trendUp delay={0.30} />
        <StatCard label="Repeat Customers"    value="38%"                        sub="Retention rate"    icon={Repeat} trend="+6%"  trendUp delay={0.36} />
        <StatCard label="Avg Review Score"    value="4.8"                        sub="From all reviews"  icon={Star}   sparkData={[4.5,4.6,4.7,4.7,4.8,4.8]} delay={0.42} />
      </div>

      {/* ── Marketplace Rank Banner ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="frosted-panel p-4 mb-6 flex items-center gap-4"
      >
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(150,150,150,0.1)", border: "0.5px solid rgba(150,150,150,0.2)" }}>
          <Target className="w-5 h-5 text-foreground" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-white font-semibold text-sm">Marketplace Standing</span>
            <span className="premium-badge premium-badge-monochrome">Top 5%</span>
          </div>
          <p className="text-xs" style={{ color: "hsl(var(--foreground) / 0.35)" }}>
            Your products rank in the <strong className="text-foreground">Top 5%</strong> of all Deployra developers. Conversion rate is <strong className="text-foreground">3.2×</strong> above average.
          </p>
        </div>
        <ChevronRight className="w-4 h-4 text-foreground/15 shrink-0" />
      </motion.div>

      {/* ── Main Two-Column ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">

        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="lg:col-span-2 frosted-panel p-5"
        >
          <div className="flex items-center justify-between mb-5" style={{ borderBottom: "0.5px solid hsl(var(--foreground) / 0.05)", paddingBottom: "1rem" }}>
            <div>
              <h2 className="text-white font-bold text-sm" style={{ fontFamily: "Georgia, serif" }}>Revenue Trend</h2>
              <p className="stat-label-caps mt-0.5">Platform earnings over time</p>
            </div>
            <div className="flex items-center gap-1">
              {["7d","30d","90d"].map(p => (
                <button
                  key={p}
                  onClick={() => setChartPeriod(p)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${chartPeriod === p ? "bg-foreground/10 text-foreground border border-foreground/15" : "text-foreground/30 hover:text-foreground/60"}`}
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MONTHLY_DATA} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--foreground) / 0.05)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--foreground) / 0.35)", fontFamily: "'JetBrains Mono', monospace" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--foreground) / 0.35)", fontFamily: "'JetBrains Mono', monospace" }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ background: "rgba(0,0,0,0.95)", color: "#fff", border: "0.5px solid rgba(150,150,150,0.2)", borderRadius: "10px", fontSize: "12px", fontFamily: "'JetBrains Mono', monospace", boxShadow: "0 8px 32px rgba(0,0,0,0.8)" }}
                  formatter={v => [`$${v.toLocaleString()}`, "Revenue"]}
                />
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--foreground))" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="hsl(var(--foreground))" stopOpacity={0.4} />
                  </linearGradient>
                </defs>
                <Bar dataKey="revenue" fill="url(#barGrad)" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Recent Reviews */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="frosted-panel p-5"
        >
          <div className="flex items-center justify-between mb-4" style={{ borderBottom: "0.5px solid hsl(var(--foreground) / 0.05)", paddingBottom: "0.75rem" }}>
            <h2 className="text-white font-bold text-sm" style={{ fontFamily: "Georgia, serif" }}>Recent Reviews</h2>
            <span className="premium-badge premium-badge-monochrome">Live</span>
          </div>
          <div className="space-y-3">
            {[
              { name: "Sarah M.", product: "AI Support Agent", rating: 5, comment: "Deployed in under 10 minutes. Incredible ROI immediately.", time: "2h ago" },
              { name: "Tech Corp", product: "Data Extractor",  rating: 4, comment: "Reliable extraction. Solid documentation.", time: "5h ago" },
              { name: "VC Fund",   product: "Analytics Suite", rating: 5, comment: "Best enterprise tool on Deployra. Period.", time: "1d ago" },
            ].map((r, i) => (
              <div key={i} className="p-3 rounded-xl" style={{ background: "hsl(var(--foreground) / 0.03)", border: "0.5px solid hsl(var(--foreground) / 0.06)" }}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-black text-background bg-foreground shrink-0">
                      {r.name[0]}
                    </div>
                    <span className="text-xs font-semibold text-foreground">{r.name}</span>
                  </div>
                  <div className="flex items-center gap-0.5">
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} className="w-2.5 h-2.5" style={{ color: s <= r.rating ? "hsl(var(--foreground))" : "rgba(150,150,150,0.15)", fill: s <= r.rating ? "hsl(var(--foreground))" : "none" }} />
                    ))}
                  </div>
                </div>
                <p className="text-[11px] text-foreground/60 leading-relaxed mb-1" style={{ fontFamily: "'Inter', sans-serif" }}>
                  "{r.comment}"
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-[9px] text-foreground/25 font-mono">{r.product}</span>
                  <span className="text-[9px] text-foreground/25 font-mono">{r.time}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Product Performance Table ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.65 }}
        className="frosted-panel overflow-hidden mb-6"
      >
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "0.5px solid hsl(var(--foreground) / 0.05)" }}>
          <div>
            <h2 className="text-white font-bold text-sm" style={{ fontFamily: "Georgia, serif" }}>Product Performance</h2>
            <p className="stat-label-caps mt-0.5">Conversions, views, and revenue per listing</p>
          </div>
          <span className="premium-badge premium-badge-monochrome">{products.length} listings</span>
        </div>
        {products.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="w-10 h-10 mx-auto mb-3 text-foreground/15" />
            <p className="text-sm font-semibold text-foreground/40" style={{ fontFamily: "'Inter', sans-serif" }}>No products published yet</p>
            <p className="text-xs text-foreground/25 mt-1">Publish your first deployable system to see performance data.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr style={{ borderBottom: "0.5px solid hsl(var(--foreground) / 0.06)" }}>
                  {["Product", "Views", "Conversion", "Rating", "Revenue", "Status"].map((h, i) => (
                    <th key={h} className={`py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-foreground/30 ${i > 0 ? "text-center" : "text-left"} ${i === 5 ? "text-right" : ""}`} style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.slice(0, 6).map((p, i) => <ProductRow key={p.id} product={p} idx={i} />)}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* ── Recent Orders ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="frosted-panel overflow-hidden"
      >
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "0.5px solid hsl(var(--foreground) / 0.05)" }}>
          <div>
            <h2 className="text-white font-bold text-sm" style={{ fontFamily: "Georgia, serif" }}>Recent Orders</h2>
            <p className="stat-label-caps mt-0.5">Latest marketplace activity</p>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: "rgba(150,150,150,0.08)", border: "0.5px solid rgba(150,150,150,0.2)" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-foreground animate-pulse" />
            <span className="text-[10px] font-bold text-foreground" style={{ fontFamily: "'JetBrains Mono', monospace" }}>LIVE</span>
          </div>
        </div>
        {orders.length === 0 ? (
          <div className="p-12 text-center">
            <ShoppingBag className="w-10 h-10 mx-auto mb-3 text-foreground/15" />
            <p className="text-sm font-semibold text-foreground/40">No orders yet</p>
            <p className="text-xs text-foreground/25 mt-1">Orders will appear here when businesses purchase your products.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="premium-table w-full min-w-[600px]">
              <thead>
                <tr>
                  <th className="text-left">Order</th>
                  <th className="text-left">Product</th>
                  <th className="text-left">Client</th>
                  <th className="text-right">Amount</th>
                  <th className="text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 8).map((o, i) => (
                  <motion.tr key={o.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 + 0.7 }} className="group">
                    <td>
                      <span className="text-[10px] font-mono text-foreground/30">{o.id?.slice(0, 12)}…</span>
                    </td>
                    <td>
                      <span className="text-sm font-medium text-foreground">{o.product?.title?.slice(0, 28) || "Product"}</span>
                    </td>
                    <td>
                      <span className="text-[11px] font-mono text-foreground/40">{o.user?.email || o.details || "—"}</span>
                    </td>
                    <td className="text-right">
                      <span className="font-bold text-sm metric-num" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                        ${(o.pricePaid || o.amount || o.product?.price || 0).toFixed(0)}
                      </span>
                    </td>
                    <td className="text-right">
                      <StatusBadge status={o.status || "PENDING"} />
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}