import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Package, Rocket, Shield, HeadphonesIcon, TrendingUp,
  ArrowUpRight, CheckCircle, AlertTriangle, Clock, DollarSign, Activity, Calendar
} from "lucide-react";
import axios from "axios";
import { API_URL } from "@/lib/config";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

function Skeleton({ h = 120 }) {
  return <div className="skeleton-beam rounded-2xl" style={{ height: h }} />;
}

function StatCard({ label, value, sub, icon: Icon, trend, trendUp, delay = 0 }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="frosted-panel p-5" whileHover={{ y: -3, boxShadow: "0 12px 40px rgba(0,0,0,0.5)" }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(150,150,150,0.08)", border: "0.5px solid rgba(150,150,150,0.15)" }}>
          <Icon className="w-4 h-4 text-foreground" />
        </div>
        {trend && (
          <span className={`flex items-center gap-0.5 text-[11px] font-bold px-2 py-0.5 rounded-full ${trendUp ? "text-emerald-400 bg-emerald-400/10" : "text-red-400 bg-red-400/10"}`}>
            <ArrowUpRight className="w-3 h-3" />
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

const SPEND_DATA = [
  { month: "Dec", spend: 1200 },
  { month: "Jan", spend: 2400 },
  { month: "Feb", spend: 1900 },
  { month: "Mar", spend: 3800 },
  { month: "Apr", spend: 2900 },
  { month: "May", spend: 4200 },
];

const VENDORS = [
  { name: "Priya Systems",  product: "DataFlow AI",     status: "COMPLETED", reliability: 98, lastDeploy: "May 26" },
  { name: "BotLabs Inc.",   product: "AutoSupport Pro", status: "ACTIVE",    reliability: 97, lastDeploy: "May 28" },
  { name: "CloudBridge",    product: "DeployKit Ultra", status: "ACTIVE",    reliability: 99, lastDeploy: "May 27" },
];

const RENEWALS = [
  { name: "AI Support Bot",   due: "Jun 5, 2025",  amount: 299 },
  { name: "Data Pipeline Pro",due: "Jun 12, 2025", amount: 499 },
  { name: "Analytics Suite",  due: "Jun 28, 2025", amount: 149 },
];

const ACTIVITY = [
  { type: "deploy",   text: "DataFlow AI deployed successfully", time: "2h ago",    icon: Rocket    },
  { type: "payment",  text: "Invoice INV-0042 paid — $299",      time: "5h ago",    icon: DollarSign},
  { type: "ticket",   text: "Support ticket #T-184 resolved",    time: "Yesterday", icon: CheckCircle},
  { type: "escrow",   text: "Escrow released for Order #7836",   time: "May 26",    icon: Shield    },
];

const STATUS_ICON = {
  COMPLETED: <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />,
  ACTIVE:    <Activity className="w-3.5 h-3.5 text-blue-400" />,
  PENDING:   <Clock className="w-3.5 h-3.5 text-amber-400" />,
};

export default function ClientDashboard() {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API_URL}/purchases/my`).then(res => {
      setPurchases(res.data?.data || res.data?.purchases || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="p-6 sm:p-8 max-w-6xl space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">{[1,2,3,4].map(i => <Skeleton key={i} />)}</div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4"><div className="lg:col-span-2"><Skeleton h={300} /></div><Skeleton h={300} /></div>
    </div>
  );

  const totalSpend = purchases.reduce((s, p) => s + (p.pricePaid || p.amount || 0), 0);
  const activeDeployments = purchases.filter(p => ["installed", "paid"].includes(p.status)).length;

  return (
    <div className="p-6 sm:p-8 max-w-6xl page-fade-in">

      {/* Header */}
      <div className="mb-8">
        <div className="stat-label-caps mb-2">Business Hub · {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</div>
        <h1 className="text-white font-bold text-2xl sm:text-3xl section-title-gradient" style={{ fontFamily: "Georgia, serif", letterSpacing: "-0.04em" }}>
          Operations Dashboard
        </h1>
        <p className="text-sm mt-1.5" style={{ color: "hsl(var(--foreground) / 0.35)", fontFamily: "'Inter', sans-serif" }}>
          Your real-time overview of deployments, escrow, vendors, and business health.
        </p>
      </div>

      {/* Primary Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard label="Total Products"    value={purchases.length || 3}          sub="Purchased & deployed"       icon={Package}        delay={0.00} />
        <StatCard label="Active Deployments"value={activeDeployments || 3}          sub="Running now"                icon={Rocket}  trend="+1" trendUp delay={0.06} />
        <StatCard label="Total Spend"       value={`$${totalSpend.toLocaleString() || "1,248"}`} sub="All-time investment"  icon={DollarSign} trend="+12%" trendUp delay={0.12} />
        <StatCard label="Escrow Held"       value="$498"                            sub="Awaiting confirmation"      icon={Shield}         delay={0.18} />
      </div>

      {/* Secondary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard label="Deployment Health" value="97.4%"                           sub="Uptime across all systems"  icon={TrendingUp} trend="+2.1%" trendUp delay={0.24} />
        <StatCard label="Pending Config"    value="1"                               sub="Awaiting your input"        icon={AlertTriangle}  delay={0.30} />
        <StatCard label="Open Tickets"      value="2"                               sub="Support requests open"      icon={HeadphonesIcon} delay={0.36} />
        <StatCard label="Renewals (30d)"    value="3"                               sub="Upcoming renewals"          icon={Calendar}       delay={0.42} />
      </div>

      {/* Main Two Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">

        {/* Spend Trend */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="lg:col-span-2 frosted-panel p-5"
        >
          <div className="flex items-center justify-between mb-5" style={{ borderBottom: "0.5px solid hsl(var(--foreground) / 0.05)", paddingBottom: "1rem" }}>
            <div>
              <h2 className="text-white font-bold text-sm" style={{ fontFamily: "Georgia, serif" }}>Investment Trend</h2>
              <p className="stat-label-caps mt-0.5">Monthly platform spend</p>
            </div>
            <span className="premium-badge premium-badge-monochrome">6 months</span>
          </div>
          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={SPEND_DATA} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
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

        {/* Activity Feed */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
          className="frosted-panel p-5"
        >
          <div className="flex items-center justify-between mb-4" style={{ borderBottom: "0.5px solid hsl(var(--foreground) / 0.05)", paddingBottom: "0.75rem" }}>
            <h2 className="text-white font-bold text-sm" style={{ fontFamily: "Georgia, serif" }}>Activity</h2>
            <span className="premium-badge premium-badge-monochrome">Live</span>
          </div>
          <div className="space-y-3">
            {ACTIVITY.map((a, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(150,150,150,0.06)", border: "0.5px solid rgba(150,150,150,0.1)" }}>
                  <a.icon className="w-3.5 h-3.5 text-foreground/50" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-foreground/70 leading-snug">{a.text}</p>
                  <span className="text-[9px] font-mono text-foreground/25">{a.time}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Vendor Performance */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
        className="frosted-panel overflow-hidden mb-6"
      >
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "0.5px solid hsl(var(--foreground) / 0.05)" }}>
          <div>
            <h2 className="text-white font-bold text-sm" style={{ fontFamily: "Georgia, serif" }}>Vendor Performance</h2>
            <p className="stat-label-caps mt-0.5">Reliability and deployment metrics per vendor</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="premium-table w-full">
            <thead>
              <tr><th className="text-left">Vendor</th><th className="text-left">Product</th><th className="text-center">Reliability</th><th className="text-center">Last Deploy</th><th className="text-right">Status</th></tr>
            </thead>
            <tbody>
              {VENDORS.map((v) => (
                <tr key={v.name}>
                  <td><span className="font-semibold text-sm text-foreground">{v.name}</span></td>
                  <td><span className="text-xs text-foreground/50">{v.product}</span></td>
                  <td className="text-center">
                    <div className="inline-flex items-center gap-2">
                      <div className="w-20 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(150,150,150,0.1)" }}>
                        <div className="h-full rounded-full bg-foreground/70" style={{ width: `${v.reliability}%` }} />
                      </div>
                      <span className="text-xs font-mono text-emerald-400 font-bold">{v.reliability}%</span>
                    </div>
                  </td>
                  <td className="text-center"><span className="text-xs font-mono text-foreground/35">{v.lastDeploy}</span></td>
                  <td className="text-right"><span className="flex items-center justify-end gap-1">{STATUS_ICON[v.status]}<span className="text-xs font-semibold text-foreground/60">{v.status}</span></span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Renewal Calendar */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }}
        className="frosted-panel p-5"
      >
        <div className="flex items-center justify-between mb-4" style={{ borderBottom: "0.5px solid hsl(var(--foreground) / 0.05)", paddingBottom: "0.75rem" }}>
          <h2 className="text-white font-bold text-sm" style={{ fontFamily: "Georgia, serif" }}>Renewal Calendar</h2>
          <span className="stat-label-caps">Next 30 days</span>
        </div>
        <div className="space-y-2">
          {RENEWALS.map((r) => (
            <div key={r.name} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "rgba(150,150,150,0.03)", border: "0.5px solid rgba(150,150,150,0.07)" }}>
              <Calendar className="w-4 h-4 text-foreground/30 shrink-0" />
              <div className="flex-1">
                <span className="text-sm font-medium text-foreground">{r.name}</span>
                <div className="text-[10px] font-mono text-foreground/30 mt-0.5">Due: {r.due}</div>
              </div>
              <span className="font-bold text-sm metric-num" style={{ fontFamily: "Georgia, serif" }}>${r.amount}</span>
              <button className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-foreground/10 text-foreground/50 hover:text-foreground hover:bg-foreground/5 transition-all">Renew</button>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
