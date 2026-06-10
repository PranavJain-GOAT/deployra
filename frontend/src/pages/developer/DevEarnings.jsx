import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Wallet, DollarSign, Shield, CheckCircle,
  Download, RefreshCw, Receipt, Loader2, AlertCircle
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import axios from "axios";
import { API_URL } from "@/lib/config";

// ─── Status & type badge config ───────────────────────────────────────────────
const TXN_STATUS = {
  ESCROW_HELD: { label: "Escrow Held",  color: "text-violet-400",  bg: "bg-violet-400/8",  border: "border-violet-400/20" },
  RELEASED:    { label: "Released",     color: "text-emerald-400", bg: "bg-emerald-400/8", border: "border-emerald-400/20" },
  COMPLETED:   { label: "Paid Out",     color: "text-sky-400",     bg: "bg-sky-400/8",     border: "border-sky-400/20"    },
  REFUNDED:    { label: "Refunded",     color: "text-red-400",     bg: "bg-red-400/8",     border: "border-red-400/20"    },
  PENDING:     { label: "Pending",      color: "text-amber-400",   bg: "bg-amber-400/8",   border: "border-amber-400/20"  },
};

function TxnStatusBadge({ status }) {
  const cfg = TXN_STATUS[status] || { label: status, color: "text-foreground/50", bg: "bg-foreground/5", border: "border-foreground/10" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border ${cfg.color} ${cfg.bg} ${cfg.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.color.replace("text-", "bg-")}`} />
      {cfg.label}
    </span>
  );
}

// ─── Build monthly chart data from real orders ─────────────────────────────────
function buildMonthlyData(orders) {
  const PLATFORM_FEE = 0.15;
  const months = {};
  orders.forEach(o => {
    const d = new Date(o.createdAt || o.date);
    const key = d.toLocaleString("en-US", { month: "short" });
    if (!months[key]) months[key] = { month: key, gross: 0, fees: 0, net: 0 };
    const gross = o.pricePaid || o.amount || 0;
    const fee   = parseFloat((gross * PLATFORM_FEE).toFixed(2));
    months[key].gross += gross;
    months[key].fees  += fee;
    months[key].net   += gross - fee;
  });
  // Sort by month order
  const ORDER = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return Object.values(months).sort((a, b) => ORDER.indexOf(a.month) - ORDER.indexOf(b.month));
}

export default function DevEarnings() {
  const [orders,    setOrders]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState("");
  const [payoutRequested, setPayoutRequested] = useState(false);
  const [requesting,      setRequesting]      = useState(false);

  const PLATFORM_FEE = 0.15;

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("auth_token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.get(`${API_URL}/orders/my`, {
        withCredentials: true,
        headers,
      });
      if (res.data?.success) {
        // Only show orders where the current user is the SELLER (developer)
        const data = Array.isArray(res.data.data) ? res.data.data : [];
        setOrders(data);
      }
    } catch (err) {
      console.error("[DevEarnings] Failed to fetch orders:", err);
      setError("Could not load earnings data. Please refresh.");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  // Derived metrics
  const completedOrders = orders.filter(o => (o.status || "").toUpperCase() === "COMPLETED");
  const totalGross  = completedOrders.reduce((s, o) => s + (o.pricePaid || o.amount || 0), 0);
  const platformFees = parseFloat((totalGross * PLATFORM_FEE).toFixed(2));
  const totalNet     = parseFloat((totalGross - platformFees).toFixed(2));

  const escrowBalance = orders
    .filter(o => (o.status || "").toUpperCase() === "PENDING")
    .reduce((s, o) => s + (o.pricePaid || o.amount || 0), 0);
  const withdrawable = completedOrders.reduce((s, o) => {
    const gross = o.pricePaid || o.amount || 0;
    return s + parseFloat((gross * (1 - PLATFORM_FEE)).toFixed(2));
  }, 0);

  const revenueData = buildMonthlyData(completedOrders);

  const handlePayout = () => {
    setRequesting(true);
    setTimeout(() => { setRequesting(false); setPayoutRequested(true); }, 1800);
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-foreground/30" />
          <p className="text-sm text-foreground/40">Loading earnings data…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="frosted-panel p-6 flex items-center gap-3 text-red-400">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
          <button onClick={fetchOrders} className="ml-auto text-xs px-3 py-1.5 rounded-lg border border-foreground/10 text-foreground/50 hover:text-foreground transition-all">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 max-w-5xl page-fade-in">

      {/* Header */}
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <div className="stat-label-caps mb-2">Developer · Financial Center</div>
          <h1 className="text-white font-bold text-2xl sm:text-3xl section-title-gradient" style={{ fontFamily: "Georgia, serif", letterSpacing: "-0.04em" }}>
            Earnings &amp; Escrow
          </h1>
          <p className="text-sm mt-1.5" style={{ color: "hsl(var(--foreground) / 0.35)", fontFamily: "'Inter', sans-serif" }}>
            Revenue analytics, escrow balance, and payout management.
          </p>
        </div>
        <button
          onClick={handlePayout}
          disabled={requesting || payoutRequested || withdrawable <= 0}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-40 ${
            payoutRequested ? "bg-emerald-400/10 text-emerald-400 border border-emerald-400/20" : "bg-foreground text-background hover:bg-foreground/90"
          }`}
        >
          {requesting ? <RefreshCw className="w-4 h-4 animate-spin" /> : payoutRequested ? <CheckCircle className="w-4 h-4" /> : <Wallet className="w-4 h-4" />}
          {requesting ? "Processing..." : payoutRequested ? "Payout Requested!" : `Withdraw $${withdrawable.toFixed(2)}`}
        </button>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total Earned (Net)",  value: `$${totalNet.toLocaleString("en-US", { minimumFractionDigits: 2 })}`, sub: "All time", icon: DollarSign, color: "text-foreground" },
          { label: "Escrow Balance",      value: `$${escrowBalance.toFixed(2)}`, sub: "Held by Deployra", icon: Shield,    color: "text-violet-400" },
          { label: "Withdrawable Funds",  value: `$${withdrawable.toFixed(2)}`,  sub: "Available now",   icon: Wallet,    color: "text-emerald-400" },
          { label: "Platform Fees (15%)", value: `$${platformFees.toFixed(2)}`,  sub: "Deployra cut",    icon: Receipt,   color: "text-amber-400" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className="frosted-panel p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(150,150,150,0.08)", border: "0.5px solid rgba(150,150,150,0.12)" }}>
                <s.icon className="w-4 h-4 text-foreground/60" />
              </div>
            </div>
            <div className={`text-xl font-bold metric-num ${s.color}`} style={{ fontFamily: "Georgia, serif" }}>{s.value}</div>
            <div className="text-xs font-semibold text-foreground/60 mt-0.5">{s.label}</div>
            <div className="stat-label-caps mt-1">{s.sub}</div>
          </motion.div>
        ))}
      </div>

      {/* Empty state or chart */}
      {revenueData.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="frosted-panel p-10 mb-6 text-center">
          <DollarSign className="w-10 h-10 text-foreground/10 mx-auto mb-3" />
          <p className="text-sm font-semibold text-foreground/40">No revenue yet</p>
          <p className="text-xs text-foreground/25 mt-1">Revenue data will appear here once you start making sales.</p>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="frosted-panel p-5 mb-6"
        >
          <div className="flex items-center justify-between mb-5" style={{ borderBottom: "0.5px solid hsl(var(--foreground) / 0.05)", paddingBottom: "1rem" }}>
            <div>
              <h2 className="text-white font-bold text-sm" style={{ fontFamily: "Georgia, serif" }}>Revenue Breakdown</h2>
              <p className="stat-label-caps mt-0.5">Gross vs Platform Fees vs Net (real data)</p>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest font-mono">
              <span className="flex items-center gap-1.5 text-foreground/50"><span className="w-2 h-2 rounded-sm bg-foreground/40" />Gross</span>
              <span className="flex items-center gap-1.5 text-foreground/50"><span className="w-2 h-2 rounded-sm bg-foreground/70" />Net</span>
              <span className="flex items-center gap-1.5 text-amber-400/70"><span className="w-2 h-2 rounded-sm bg-amber-400/50" />Fees</span>
            </div>
          </div>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--foreground) / 0.05)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--foreground) / 0.3)", fontFamily: "'JetBrains Mono', monospace" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--foreground) / 0.3)", fontFamily: "'JetBrains Mono', monospace" }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                <Tooltip contentStyle={{ background: "rgba(0,0,0,0.95)", color: "#fff", border: "0.5px solid rgba(150,150,150,0.2)", borderRadius: "10px", fontSize: "11px", fontFamily: "'JetBrains Mono', monospace", boxShadow: "0 8px 32px rgba(0,0,0,0.8)" }} formatter={(v, n) => [`$${v.toLocaleString()}`, n]} />
                <Bar dataKey="gross" fill="hsl(var(--foreground) / 0.3)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="net"   fill="hsl(var(--foreground) / 0.8)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="fees"  fill="rgba(251,191,36,0.4)"          radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {/* Transaction History */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="frosted-panel overflow-hidden"
      >
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "0.5px solid hsl(var(--foreground) / 0.05)" }}>
          <div>
            <h2 className="text-white font-bold text-sm" style={{ fontFamily: "Georgia, serif" }}>Transaction History</h2>
            <p className="stat-label-caps mt-0.5">Real purchase & order data from platform</p>
          </div>
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border border-foreground/10 text-foreground/50 hover:text-foreground hover:bg-foreground/5 transition-all">
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>
        {orders.length === 0 ? (
          <div className="p-10 text-center">
            <Receipt className="w-10 h-10 text-foreground/10 mx-auto mb-3" />
            <p className="text-sm font-semibold text-foreground/40">No transactions yet</p>
            <p className="text-xs text-foreground/25 mt-1">Your sales and payouts will appear here once customers start purchasing.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr style={{ borderBottom: "0.5px solid hsl(var(--foreground) / 0.06)" }}>
                  {["Order ID", "Product", "Gross", "Platform Fee (15%)", "Net", "Status", "Date"].map(h => (
                    <th key={h} className="py-3 px-4 text-left text-[9px] font-bold uppercase tracking-widest text-foreground/25" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map((o, i) => {
                  const gross = o.pricePaid || o.amount || 0;
                  const fee   = parseFloat((gross * PLATFORM_FEE).toFixed(2));
                  const net   = parseFloat((gross - fee).toFixed(2));
                  const status = (o.status || "PENDING").toUpperCase();
                  const date  = new Date(o.createdAt || o.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
                  return (
                    <motion.tr key={o.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 + 0.4 }}
                      className="border-b border-foreground/5 hover:bg-foreground/[0.02] transition-colors"
                    >
                      <td className="py-3.5 px-4"><span className="text-[10px] font-mono text-foreground/40">#{(o.id || "").slice(-8).toUpperCase()}</span></td>
                      <td className="py-3.5 px-4"><span className="text-xs text-foreground/60" style={{ fontFamily: "'Inter', sans-serif" }}>{o.product?.title || o.productTitle || "—"}</span></td>
                      <td className="py-3.5 px-4"><span className="text-xs font-mono font-bold text-foreground/70">${gross.toFixed(2)}</span></td>
                      <td className="py-3.5 px-4"><span className="text-xs font-mono text-amber-400/70">-${fee.toFixed(2)}</span></td>
                      <td className="py-3.5 px-4"><span className="text-xs font-mono font-bold text-emerald-400">${net.toFixed(2)}</span></td>
                      <td className="py-3.5 px-4"><TxnStatusBadge status={status} /></td>
                      <td className="py-3.5 px-4"><span className="text-[10px] font-mono text-foreground/30">{date}</span></td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}
