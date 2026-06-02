import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowUp, ArrowDown, Star } from "lucide-react";

const RANKINGS = [
  { rank: 1,  name: "DataFlow AI",      dev: "Priya Systems",     category: "Data",       rating: 4.9, revenue: 128400, installs: 312, change: 0    },
  { rank: 2,  name: "AutoSupport Pro",  dev: "BotLabs Inc.",      category: "Support",    rating: 4.8, revenue: 98200,  installs: 284, change: +1   },
  { rank: 3,  name: "DeployKit Ultra",  dev: "CloudBridge",       category: "DevOps",     rating: 4.9, revenue: 89600,  installs: 247, change: -1   },
  { rank: 4,  name: "PipelineOS",       dev: "PipelineOS",        category: "Data",       rating: 4.7, revenue: 76800,  installs: 201, change: +2   },
  { rank: 5,  name: "SalesAI Suite",    dev: "GrowthStack",       category: "CRM",        rating: 4.8, revenue: 68400,  installs: 189, change: -1   },
  { rank: 6,  name: "AnalyticsCore",    dev: "MetricFlow",        category: "Analytics",  rating: 4.6, revenue: 54200,  installs: 164, change: +3   },
  { rank: 7,  name: "SecureVault API",  dev: "AuthGuard",         category: "Security",   rating: 4.7, revenue: 48700,  installs: 152, change: 0    },
  { rank: 8,  name: "ContentEngine",    dev: "WordSmith AI",      category: "Content",    rating: 4.5, revenue: 42100,  installs: 138, change: -2   },
  { rank: 9,  name: "LogStream Pro",    dev: "ObserveHQ",         category: "Monitoring", rating: 4.6, revenue: 38900,  installs: 127, change: +1   },
  { rank: 10, name: "FormFlow Builder", dev: "NoCode Labs",       category: "Forms",      rating: 4.4, revenue: 34600,  installs: 118, change: -1   },
  { rank: 11, name: "ShipFast SDK",     dev: "Launchpad Co.",     category: "DevOps",     rating: 4.5, revenue: 31200,  installs: 104, change: +4   },
  { rank: 12, name: "Your Product",     dev: "You",               category: "AI",         rating: 4.8, revenue: 28900,  installs: 97,  change: +5, isYou: true },
];

const CATEGORIES = ["All", "Data", "Support", "DevOps", "Analytics", "CRM", "Security", "AI", "Content"];

export default function DevRankings() {
  const [category, setCategory] = useState("All");
  const [period, setPeriod] = useState("30d");

  const myRank = RANKINGS.find(r => r.isYou);

  const filtered = RANKINGS.filter(r => category === "All" || r.category === category);

  return (
    <div className="p-6 sm:p-8 max-w-5xl page-fade-in">

      {/* Header */}
      <div className="mb-8">
        <div className="stat-label-caps mb-2">Developer · Marketplace Intelligence</div>
        <h1 className="text-white font-bold text-2xl sm:text-3xl section-title-gradient" style={{ fontFamily: "Georgia, serif", letterSpacing: "-0.04em" }}>
          Marketplace Rankings
        </h1>
        <p className="text-sm mt-1.5" style={{ color: "hsl(var(--foreground) / 0.35)", fontFamily: "'Inter', sans-serif" }}>
          Track your competitive position and benchmark against top-performing products.
        </p>
      </div>

      {/* My Ranking Banner */}
      {myRank && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="frosted-panel p-5 mb-6 border border-foreground/10"
          style={{ boxShadow: "0 0 0 1px rgba(150,150,150,0.05) inset" }}
        >
          <div className="flex items-center gap-5">
            <div className="flex flex-col items-center">
              <div className="text-4xl font-black metric-num text-foreground" style={{ fontFamily: "Georgia, serif" }}>#{myRank.rank}</div>
              <div className="stat-label-caps">Your Rank</div>
            </div>
            <div className="w-px h-12 bg-foreground/10" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-base text-foreground" style={{ fontFamily: "'Inter', sans-serif" }}>{myRank.name}</span>
                <span className="flex items-center gap-0.5 text-[11px] font-bold text-emerald-400">
                  <ArrowUp className="w-3 h-3" /> {Math.abs(myRank.change)} positions this week
                </span>
              </div>
              <p className="text-xs text-foreground/40" style={{ fontFamily: "'Inter', sans-serif" }}>
                Top 12 globally · {myRank.category} category · {myRank.installs} total deployments
              </p>
            </div>
            <div className="grid grid-cols-3 gap-4 shrink-0">
              {[
                { label: "Revenue",   value: `$${(myRank.revenue/1000).toFixed(0)}k` },
                { label: "Rating",    value: myRank.rating.toFixed(1)              },
                { label: "Deploys",   value: myRank.installs                        },
              ].map(s => (
                <div key={s.label} className="text-center">
                  <div className="text-lg font-bold metric-num" style={{ fontFamily: "Georgia, serif" }}>{s.value}</div>
                  <div className="stat-label-caps">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="flex flex-wrap gap-1 p-1 rounded-xl" style={{ background: "rgba(150,150,150,0.05)", border: "0.5px solid rgba(150,150,150,0.1)" }}>
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCategory(c)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${category === c ? "bg-foreground text-background" : "text-foreground/40 hover:text-foreground/70"}`}
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 ml-auto">
          {["7d","30d","90d"].map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${period === p ? "bg-foreground/10 text-foreground border border-foreground/15" : "text-foreground/30 hover:text-foreground/60"}`}
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Rankings Table */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
        className="frosted-panel overflow-hidden"
      >
        <div className="px-5 py-4" style={{ borderBottom: "0.5px solid hsl(var(--foreground) / 0.05)" }}>
          <h2 className="text-white font-bold text-sm" style={{ fontFamily: "Georgia, serif" }}>Global Leaderboard · {category}</h2>
          <p className="stat-label-caps mt-0.5">Ranked by revenue · updated every 6 hours</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr style={{ borderBottom: "0.5px solid hsl(var(--foreground) / 0.06)" }}>
                {["Rank", "Product", "Category", "Revenue", "Installs", "Rating", "Weekly Change"].map(h => (
                  <th key={h} className="py-3 px-4 text-left text-[9px] font-bold uppercase tracking-widest text-foreground/25" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => (
                <motion.tr
                  key={r.rank}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 + 0.3 }}
                  className={`border-b border-foreground/5 hover:bg-foreground/[0.02] transition-colors ${r.isYou ? "bg-foreground/[0.04]" : ""}`}
                >
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      {r.rank <= 3 ? (
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${
                          r.rank === 1 ? "bg-yellow-400/15 text-yellow-400" :
                          r.rank === 2 ? "bg-slate-400/15 text-slate-300" :
                          "bg-amber-700/15 text-amber-600"
                        }`}>
                          {r.rank === 1 ? "🥇" : r.rank === 2 ? "🥈" : "🥉"}
                        </div>
                      ) : (
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-foreground/40" style={{ background: "rgba(150,150,150,0.06)" }}>
                          {r.rank}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-sm text-foreground flex items-center gap-2">
                      {r.name}
                      {r.isYou && <span className="text-[9px] font-black text-foreground bg-foreground/10 px-1.5 py-0.5 rounded uppercase tracking-widest">You</span>}
                    </div>
                    <div className="text-[10px] text-foreground/30 font-mono mt-0.5">{r.dev}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-foreground/5 text-foreground/50 border border-foreground/8">{r.category}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="text-sm font-bold metric-num text-foreground/80" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                      ${(r.revenue/1000).toFixed(1)}k
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="text-sm font-bold metric-num text-foreground/60" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{r.installs}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1">
                      {[1,2,3,4,5].map(s => <Star key={s} className="w-2.5 h-2.5" style={{ color: s <= Math.round(r.rating) ? "hsl(var(--foreground) / 0.7)" : "rgba(150,150,150,0.12)", fill: s <= Math.round(r.rating) ? "hsl(var(--foreground) / 0.7)" : "none" }} />)}
                      <span className="text-[10px] font-mono text-foreground/40 ml-1">{r.rating}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    {r.change === 0 ? (
                      <span className="text-[11px] text-foreground/25 font-mono">—</span>
                    ) : (
                      <span className={`flex items-center gap-0.5 text-[11px] font-bold ${r.change > 0 ? "text-emerald-400" : "text-red-400"}`}>
                        {r.change > 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                        {Math.abs(r.change)}
                      </span>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
