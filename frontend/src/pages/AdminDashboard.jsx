import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  Activity, Cpu, RefreshCw, TrendingUp, MessageSquare, Zap, Settings, Eye, Users, Clock, ArrowLeft,
  CheckCircle, AlertTriangle, XCircle, ArrowUpRight, Shield
} from "lucide-react";
import { Link } from "react-router-dom";

const UPTIME_DATA = [
  { time: "00:00", uptime: 100 }, { time: "04:00", uptime: 99.8 }, { time: "08:00", uptime: 100 },
  { time: "12:00", uptime: 100 }, { time: "16:00", uptime: 99.5 }, { time: "20:00", uptime: 100 }, { time: "Now", uptime: 100 },
];
const USAGE_DATA = [
  { day: "Mon", conversations: 142, automations: 38 },
  { day: "Tue", conversations: 189, automations: 52 },
  { day: "Wed", conversations: 234, automations: 61 },
  { day: "Thu", conversations: 198, automations: 44 },
  { day: "Fri", conversations: 312, automations: 87 },
  { day: "Sat", conversations: 267, automations: 71 },
  { day: "Sun", conversations: 178, automations: 39 },
];
const SYSTEMS = [
  { name: "WhatsApp Order Bot",   type: "Chatbot",    status: "online",  uptime: "99.9%", conversations: 1842, lastActive: "2 min ago", health: 98 },
  { name: "Customer Support AI",  type: "Chatbot",    status: "online",  uptime: "99.7%", conversations: 3241, lastActive: "Just now",  health: 95 },
  { name: "Appointment Booking",  type: "Automation", status: "online",  uptime: "100%",  conversations: 892,  lastActive: "5 min ago", health: 100 },
  { name: "Lead Capture Flow",    type: "Automation", status: "warning", uptime: "97.2%", conversations: 412,  lastActive: "18 min ago",health: 72 },
  { name: "Social Media Poster",  type: "Automation", status: "offline", uptime: "91.0%", conversations: 0,    lastActive: "2h ago",    health: 0 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="frosted-panel px-4 py-3 text-xs" style={{ borderRadius: "12px", minWidth: 120 }}>
      <p className="stat-label-caps mb-2">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2 mt-1">
          <span className="w-2 h-2 rounded-full block" style={{ background: p.color }} />
          <span style={{ color: "hsl(var(--foreground) / 0.6)", fontFamily: "'Inter', sans-serif" }}>{p.name}:</span>
          <span style={{ color: p.color, fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
};

function StatusIcon({ status }) {
  if (status === "online")  return <CheckCircle className="w-3.5 h-3.5" style={{ color: "hsl(var(--foreground))" }} />;
  if (status === "warning") return <AlertTriangle className="w-3.5 h-3.5" style={{ color: "hsl(var(--foreground))" }} />;
  return <XCircle className="w-3.5 h-3.5" style={{ color: "hsl(var(--foreground))" }} />;
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  // Admin dashboard uses static demonstration data
  useEffect(() => { setOrders([]); }, []);

  const refresh = async () => {
    setRefreshing(true);
    await new Promise((r) => setTimeout(r, 1200));
    setRefreshing(false);
  };

  const totalRevenue = orders.reduce((s, o) => s + (o.amount || 0), 0);
  const onlineCount  = SYSTEMS.filter((s) => s.status === "online").length;

  const [displayRevenue, setDisplayRevenue] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = totalRevenue;
    if (end === 0) return;
    const duration = 1400;
    const step = 16;
    const increment = end / (duration / step);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) { setDisplayRevenue(end); clearInterval(timer); }
      else setDisplayRevenue(Math.floor(start));
    }, step);
    return () => clearInterval(timer);
  }, [totalRevenue]);

  const kpiCards = [
    {
      label: "Total Revenue", value: `$${displayRevenue.toLocaleString()}`,
      icon: TrendingUp, color: "hsl(var(--foreground))",
      sub: "+12% this week", wide: true,
    },
    {
      label: "Conversations", value: "6,381",
      icon: MessageSquare, color: "hsl(var(--foreground))",
      sub: "All bots · Active",
    },
    {
      label: "Automations Run", value: "392",
      icon: Zap, color: "hsl(var(--foreground))",
      sub: "This week",
    },
    {
      label: "Active Users", value: "1,240",
      icon: Users, color: "hsl(var(--foreground))",
      sub: "Last 30 days", wide: true,
    },
  ];

  return (
    <div className="min-h-screen page-fade-in" style={{ background: "transparent" }}>

      {/* ── Header ── */}
      <div className="premium-header-bar aurora-header" style={{ borderBottom: "0.5px solid hsl(var(--foreground) / 0.06)" }}>
        <div className="max-w-7xl mx-auto px-6 py-7 flex items-center justify-between flex-wrap gap-4">
          <div>
            <Link to="/" className="inline-flex items-center gap-1.5 mb-4 transition-colors group" style={{ color: "hsl(var(--foreground) / 0.25)" }}>
              <ArrowLeft className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform" />
              <span className="text-xs" style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "0.04em" }}>Back to Marketplace</span>
            </Link>
            <div className="stat-label-caps mb-1.5">Admin · System Dashboard</div>
            <h1 className="text-white font-bold text-3xl section-title-gradient" style={{ fontFamily: "Georgia, serif", letterSpacing: "-0.04em", lineHeight: 1.1 }}>
              Control Center
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* System Status Pill */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-full" style={{ background: "rgba(150,150,150,0.06)", border: "0.5px solid rgba(150,150,150,0.2)" }}>
              <span className="w-2 h-2 rounded-full pulse-aura" style={{ background: "hsl(var(--card))" }} />
              <span className="text-xs font-semibold" style={{ color: "rgba(150,150,150,0.8)", fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.06em" }}>
                {onlineCount}/{SYSTEMS.length} ONLINE
              </span>
            </div>

            {/* Shield badge */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-full" style={{ background: "rgba(150,150,150,0.06)", border: "0.5px solid rgba(150,150,150,0.15)" }}>
              <Shield className="w-3.5 h-3.5" style={{ color: "hsl(var(--foreground))" }} />
              <span className="text-xs font-semibold" style={{ color: "rgba(150,150,150,0.7)", fontFamily: "'Inter', sans-serif" }}>Secured</span>
            </div>

            <motion.button
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={refresh}
              className="flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-xl transition-all"
              style={{
                background: "hsl(var(--foreground) / 0.04)",
                color: "hsl(var(--foreground) / 0.5)",
                border: "0.5px solid hsl(var(--foreground) / 0.08)",
                fontFamily: "'Inter', sans-serif",
                letterSpacing: "0.04em",
              }}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </motion.button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-5">

        {/* ── KPI Cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {kpiCards.map((kpi, i) => (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: i * 0.07, type: "spring", stiffness: 260, damping: 24 }}
              className={`admin-kpi-card p-6 relative overflow-hidden group ${kpi.wide ? "md:col-span-2" : ""}`}
              style={{
                background: `linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.7) 100%)`,
                border: `0.5px solid hsl(var(--foreground) / 0.2)`,
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                boxShadow: `0 4px 32px rgba(0,0,0,0.4), 0 0 0 0.5px hsl(var(--foreground) / 0.08) inset`,
              }}
            >
              {/* Glow stamp */}
              <div
                className="absolute pointer-events-none"
                style={{ top: -40, right: -40, width: 180, height: 180, borderRadius: "50%", background: kpi.color, opacity: 0.08, filter: "blur(50px)", transition: "opacity 0.4s" }}
              />
              {/* Top line accent */}
              <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, hsl(var(--foreground) / 0.3), transparent)` }} />

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: `hsl(var(--foreground) / 0.12)`, border: `0.5px solid hsl(var(--foreground) / 0.25)` }}
                  >
                    <kpi.icon className="w-4 h-4" style={{ color: kpi.color }} />
                  </div>
                  <div
                    className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full"
                    style={{ background: `hsl(var(--foreground) / 0.12)`, color: kpi.color, fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.04em", border: `0.5px solid hsl(var(--foreground) / 0.25)` }}
                  >
                    <ArrowUpRight className="w-3 h-3" />
                    {kpi.sub}
                  </div>
                </div>

                <div className="stat-label-caps mb-2">{kpi.label}</div>
                <div
                  className="font-bold section-title-gradient"
                  style={{
                    fontFamily: "Georgia, serif",
                    fontSize: kpi.wide ? "clamp(2.2rem,4vw,3.5rem)" : "2rem",
                    letterSpacing: "-0.04em",
                    lineHeight: 1,
                    background: `linear-gradient(135deg, hsl(var(--foreground)) 0%, hsl(var(--foreground) / 0.8) 100%)`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  {kpi.value}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── Charts ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="frosted-panel p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-white font-bold text-sm" style={{ fontFamily: "Georgia, serif", letterSpacing: "-0.02em" }}>Conversations / Week</h2>
                <p className="stat-label-caps mt-0.5">Blue · Conversations</p>
              </div>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(150,150,150,0.1)", border: "0.5px solid rgba(150,150,150,0.2)" }}>
                <Activity className="w-4 h-4" style={{ color: "hsl(var(--foreground))" }} />
              </div>
            </div>
            <div className="chart-container h-52">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={USAGE_DATA}>
                  <defs>
                    <linearGradient id="convGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--foreground))" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="hsl(var(--foreground))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="hsl(var(--foreground) / 0.03)" strokeDasharray="4 4" />
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: "hsl(var(--foreground) / 0.25)", fontFamily: "monospace" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(var(--foreground) / 0.25)", fontFamily: "monospace" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(150,150,150,0.15)", strokeWidth: 1 }} />
                  <Area
                    type="monotone" dataKey="conversations" stroke="hsl(var(--foreground))" strokeWidth={2}
                    fill="url(#convGrad)" dot={false}
                    style={{ filter: "drop-shadow(0 0 8px rgba(150,150,150,0.7))" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="frosted-panel p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-white font-bold text-sm" style={{ fontFamily: "Georgia, serif", letterSpacing: "-0.02em" }}>System Uptime — 24H</h2>
                <p className="stat-label-caps mt-0.5">Green · Uptime %</p>
              </div>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(150,150,150,0.08)", border: "0.5px solid rgba(150,150,150,0.2)" }}>
                <Cpu className="w-4 h-4" style={{ color: "hsl(var(--foreground))" }} />
              </div>
            </div>
            <div className="chart-container h-52">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={UPTIME_DATA}>
                  <CartesianGrid stroke="hsl(var(--foreground) / 0.03)" strokeDasharray="4 4" />
                  <XAxis dataKey="time" tick={{ fontSize: 10, fill: "hsl(var(--foreground) / 0.25)", fontFamily: "monospace" }} axisLine={false} tickLine={false} />
                  <YAxis domain={[98.5, 100.5]} tick={{ fontSize: 10, fill: "hsl(var(--foreground) / 0.25)", fontFamily: "monospace" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(150,150,150,0.15)", strokeWidth: 1 }} />
                  <Line
                    type="monotone" dataKey="uptime" stroke="hsl(var(--foreground))" strokeWidth={2}
                    dot={{ fill: "hsl(var(--foreground))", r: 4, strokeWidth: 0 }}
                    style={{ filter: "drop-shadow(0 0 8px rgba(150,150,150,0.9)) drop-shadow(0 0 20px rgba(150,150,150,0.4))" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* ── Systems Table ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="frosted-panel overflow-hidden"
        >
          <div className="px-6 py-5 flex items-center justify-between" style={{ borderBottom: "0.5px solid hsl(var(--foreground) / 0.05)" }}>
            <div>
              <h2 className="text-white font-bold" style={{ fontFamily: "Georgia, serif", letterSpacing: "-0.02em" }}>Installed AI Systems</h2>
              <p className="stat-label-caps mt-0.5">Live system health monitor</p>
            </div>
            <span className="premium-badge premium-badge-blue">{SYSTEMS.length} systems</span>
          </div>

          <div className="divide-y" style={{ borderColor: "hsl(var(--foreground) / 0.04)" }}>
            {SYSTEMS.map((sys, i) => {
              const isOnline  = sys.status === "online";
              const isWarning = sys.status === "warning";
              const statusColor = isOnline ? "hsl(var(--foreground))" : isWarning ? "hsl(var(--foreground))" : "hsl(var(--foreground))";
              const statusBg    = isOnline ? "rgba(150,150,150,0.06)" : isWarning ? "rgba(150,150,150,0.06)" : "rgba(150,150,150,0.06)";
              const dotClass    = isOnline ? "pulse-aura" : isWarning ? "pulse-aura-amber" : "pulse-aura-red";
              const dotBg       = isOnline ? "hsl(var(--foreground))" : isWarning ? "hsl(var(--foreground))" : "hsl(var(--foreground))";

              return (
                <motion.div
                  key={sys.name}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.07 }}
                  className="admin-table-row px-6 py-4 flex items-center gap-4 flex-wrap"
                >
                  {/* System Identity */}
                  <div className="flex items-center gap-3 flex-1 min-w-[180px]">
                    <div className="relative flex-shrink-0">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: statusBg, border: `0.5px solid hsl(var(--foreground) / 0.2)` }}>
                        {sys.type === "Chatbot"
                          ? <MessageSquare className="w-4 h-4" style={{ color: statusColor }} />
                          : <Zap className="w-4 h-4" style={{ color: statusColor }} />
                        }
                      </div>
                      <div
                        className={`absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 ${dotClass}`}
                        style={{ background: dotBg, borderColor: "transparent" }}
                      />
                    </div>
                    <div>
                      <div className="text-white text-sm font-semibold" style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "-0.01em" }}>{sys.name}</div>
                      <div className="stat-label-caps">{sys.type}</div>
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="flex items-center gap-6 flex-wrap">

                    {/* Status */}
                    <div className="min-w-[70px]">
                      <div className="stat-label-caps mb-1">Status</div>
                      <div className="flex items-center gap-1.5">
                        <StatusIcon status={sys.status} />
                        <span className="text-xs font-bold" style={{ color: statusColor, fontFamily: "'JetBrains Mono', monospace" }}>
                          {sys.status.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    {/* Uptime */}
                    <div className="min-w-[60px]">
                      <div className="stat-label-caps mb-1">Uptime</div>
                      <div className="text-white text-xs font-bold metric-num">{sys.uptime}</div>
                    </div>

                    {/* Conversations */}
                    <div className="min-w-[70px]">
                      <div className="stat-label-caps mb-1">Convs</div>
                      <div className="text-white text-xs font-bold metric-num">{sys.conversations.toLocaleString()}</div>
                    </div>

                    {/* Health bar */}
                    <div className="min-w-[110px]">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="stat-label-caps">Health</div>
                        <span className="text-[10px] font-bold" style={{ color: statusColor, fontFamily: "'JetBrains Mono', monospace" }}>{sys.health}%</span>
                      </div>
                      <div className="health-bar-track" style={{ width: 90 }}>
                        <div
                          className="health-bar-fill"
                          style={{
                            width: `${sys.health}%`,
                            background: sys.health > 90
                              ? "linear-gradient(90deg, hsl(var(--foreground)), hsl(var(--foreground)))"
                              : sys.health > 60
                                ? "linear-gradient(90deg, hsl(var(--foreground)), hsl(var(--foreground)))"
                                : "linear-gradient(90deg, hsl(var(--foreground)), hsl(var(--foreground)))",
                            boxShadow: `0 0 8px hsl(var(--foreground) / 0.6)`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Last Active */}
                    <div className="flex items-center gap-1.5 min-w-[90px]">
                      <Clock className="w-3 h-3 flex-shrink-0" style={{ color: "hsl(var(--foreground) / 0.2)" }} />
                      <span className="text-[11px]" style={{ color: "hsl(var(--foreground) / 0.3)", fontFamily: "'Inter', sans-serif" }}>{sys.lastActive}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-1.5">
                      <button
                        className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
                        style={{ background: "hsl(var(--foreground) / 0.04)", border: "0.5px solid hsl(var(--foreground) / 0.07)", color: "hsl(var(--foreground) / 0.3)" }}
                        onMouseEnter={e => e.currentTarget.style.color = "#fff"}
                        onMouseLeave={e => e.currentTarget.style.color = "hsl(var(--foreground) / 0.3)"}
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
                        style={{ background: "hsl(var(--foreground) / 0.04)", border: "0.5px solid hsl(var(--foreground) / 0.07)", color: "hsl(var(--foreground) / 0.3)" }}
                        onMouseEnter={e => e.currentTarget.style.color = "#fff"}
                        onMouseLeave={e => e.currentTarget.style.color = "hsl(var(--foreground) / 0.3)"}
                      >
                        <Settings className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}