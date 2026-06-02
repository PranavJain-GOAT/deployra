import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RefreshCw, RotateCcw, Terminal, ChevronRight,
  ExternalLink, Server, Globe
} from "lucide-react";

const DEPLOYMENTS = [
  {
    id: "dep-1", name: "AI Support Chatbot", version: "v2.3.1", vendor: "BotLabs Inc.",
    env: "production", status: "healthy", uptime: "99.9%", lastDeploy: "May 28, 2025 · 14:32 UTC",
    health: 99.9, region: "US-East", endpoint: "https://bot.acme.io",
    logs: [
      "[14:32:01] Container started · Image: botlabs/support-chatbot:2.3.1",
      "[14:32:03] Health check passed · /health → 200 OK",
      "[14:32:04] WebSocket connection established",
      "[14:32:05] Serving on port 8080 · 3 replicas active",
    ]
  },
  {
    id: "dep-2", name: "Data Pipeline Pro", version: "v1.8.0", vendor: "Priya Systems",
    env: "production", status: "healthy", uptime: "98.4%", lastDeploy: "May 26, 2025 · 09:15 UTC",
    health: 98.4, region: "EU-West", endpoint: "https://pipeline.acme.io",
    logs: [
      "[09:15:12] Pipeline initialized · 24 jobs queued",
      "[09:15:14] PostgreSQL connection pool: 20 connections",
      "[09:15:16] Worker nodes: 4 active, 0 idle",
      "[09:18:41] Batch #1 completed · 12,847 records processed",
    ]
  },
  {
    id: "dep-3", name: "Analytics Suite", version: "v3.1.2", vendor: "MetricFlow",
    env: "staging", status: "warning", uptime: "94.2%", lastDeploy: "May 25, 2025 · 18:00 UTC",
    health: 94.2, region: "US-West", endpoint: "https://analytics-stg.acme.io",
    logs: [
      "[18:00:02] Staging environment started",
      "[18:00:05] Memory usage high: 87% (4.2GB / 4.8GB)",
      "[18:01:12] WARN: Query timeout detected on /api/reports",
      "[18:01:15] Auto-scaling triggered · Adding 1 replica",
    ]
  },
];

const STATUS_CONFIG = {
  healthy: { label: "Healthy",     color: "text-emerald-400", bg: "bg-emerald-400/8",  border: "border-emerald-400/20", dot: "bg-emerald-400" },
  warning: { label: "Warning",     color: "text-amber-400",   bg: "bg-amber-400/8",    border: "border-amber-400/20",   dot: "bg-amber-400"   },
  critical:{ label: "Critical",    color: "text-red-400",     bg: "bg-red-400/8",      border: "border-red-400/20",     dot: "bg-red-400"     },
  deploying:{ label: "Deploying",  color: "text-blue-400",    bg: "bg-blue-400/8",     border: "border-blue-400/20",    dot: "bg-blue-400"    },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.healthy;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${cfg.color} ${cfg.bg} ${cfg.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} ${status === "healthy" ? "animate-pulse" : ""}`} />
      {cfg.label}
    </span>
  );
}

function LogTerminal({ logs }) {
  return (
    <div className="rounded-xl p-4 overflow-x-auto" style={{ background: "#050508", border: "0.5px solid rgba(150,150,150,0.1)", fontFamily: "'JetBrains Mono', monospace" }}>
      {logs.map((line, i) => (
        <div key={i} className="text-[11px] text-emerald-400/80 leading-loose">
          <span className="text-foreground/20 mr-3 select-none">{String(i + 1).padStart(2, "0")}</span>
          {line}
        </div>
      ))}
    </div>
  );
}

function DeploymentCard({ dep, idx }) {
  const [expanded, setExpanded] = useState(false);
  const [redeploying, setRedeploying] = useState(false);

  const handleRedeploy = () => {
    setRedeploying(true);
    setTimeout(() => setRedeploying(false), 2500);
  };


  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="frosted-panel overflow-hidden"
    >
      <div className="px-5 py-4 flex items-start gap-4">
        {/* Icon */}
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(150,150,150,0.07)", border: "0.5px solid rgba(150,150,150,0.12)" }}>
          <Server className="w-4 h-4 text-foreground/50" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-foreground">{dep.name}</h3>
                <span className="text-[10px] font-mono text-foreground/30 bg-foreground/5 px-1.5 py-0.5 rounded">{dep.version}</span>
              </div>
              <p className="text-[10px] font-mono text-foreground/30 mt-0.5">
                {dep.vendor} · {dep.region} · {dep.env}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <StatusBadge status={dep.status} />
              <button onClick={() => setExpanded(p => !p)} className="p-1.5 rounded-lg text-foreground/30 hover:text-foreground hover:bg-foreground/5">
                <ChevronRight className={`w-4 h-4 transition-transform ${expanded ? "rotate-90" : ""}`} />
              </button>
            </div>
          </div>

          {/* Health Metrics */}
          <div className="grid grid-cols-3 gap-4 mb-3">
            {[
              { label: "Uptime",      value: dep.uptime,       color: dep.health >= 99 ? "text-emerald-400" : dep.health >= 95 ? "text-amber-400" : "text-red-400" },
              { label: "Last Deploy", value: dep.lastDeploy.split("·")[0].trim(), color: "text-foreground/60" },
              { label: "Endpoint",    value: dep.endpoint.replace("https://", ""), color: "text-blue-400/70" },
            ].map(m => (
              <div key={m.label}>
                <div className="stat-label-caps mb-0.5">{m.label}</div>
                <div className={`text-[11px] font-mono font-bold truncate ${m.color}`}>{m.value}</div>
              </div>
            ))}
          </div>

          {/* Health Bar */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(150,150,150,0.08)" }}>
              <motion.div
                className={`h-full rounded-full ${dep.health >= 99 ? "bg-emerald-400" : dep.health >= 95 ? "bg-amber-400" : "bg-red-400"}`}
                initial={{ width: 0 }}
                animate={{ width: `${dep.health}%` }}
                transition={{ duration: 0.9, delay: idx * 0.1 + 0.3 }}
              />
            </div>
            <span className="text-[10px] font-mono font-bold text-foreground/40">{dep.health}%</span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={handleRedeploy}
              disabled={redeploying}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-foreground/10 text-foreground/50 hover:text-foreground hover:bg-foreground/5 transition-all disabled:opacity-40"
            >
              <RefreshCw className={`w-3 h-3 ${redeploying ? "animate-spin" : ""}`} />
              {redeploying ? "Redeploying..." : "Redeploy"}
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-foreground/10 text-foreground/50 hover:text-foreground hover:bg-foreground/5 transition-all">
              <RotateCcw className="w-3 h-3" />
              Rollback
            </button>
            <a href={dep.endpoint} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-foreground/10 text-foreground/50 hover:text-foreground hover:bg-foreground/5 transition-all ml-auto">
              <Globe className="w-3 h-3" />
              Open
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Logs Panel */}
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} style={{ overflow: "hidden", borderTop: "0.5px solid hsl(var(--foreground) / 0.06)" }}>
            <div className="p-5">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold text-foreground/60 flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5" />
                  Deployment Logs
                </h4>
                <span className="text-[9px] font-mono text-foreground/25">{dep.lastDeploy}</span>
              </div>
              <LogTerminal logs={dep.logs} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function ClientDeployments() {
  const healthy = DEPLOYMENTS.filter(d => d.status === "healthy").length;
  const warning = DEPLOYMENTS.filter(d => d.status === "warning").length;

  return (
    <div className="p-6 sm:p-8 max-w-4xl page-fade-in">

      {/* Header */}
      <div className="mb-8">
        <div className="stat-label-caps mb-2">Business Hub · Infrastructure</div>
        <h1 className="text-white font-bold text-2xl sm:text-3xl section-title-gradient" style={{ fontFamily: "Georgia, serif", letterSpacing: "-0.04em" }}>
          Deployment Center
        </h1>
        <p className="text-sm mt-1.5" style={{ color: "hsl(var(--foreground) / 0.35)", fontFamily: "'Inter', sans-serif" }}>
          Monitor, redeploy, and rollback all your active Deployra systems.
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="frosted-panel p-5">
          <div className="text-2xl font-bold metric-num text-emerald-400" style={{ fontFamily: "Georgia, serif" }}>{healthy}</div>
          <div className="stat-label-caps mt-1">Healthy</div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="frosted-panel p-5">
          <div className="text-2xl font-bold metric-num text-amber-400" style={{ fontFamily: "Georgia, serif" }}>{warning}</div>
          <div className="stat-label-caps mt-1">Warning</div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="frosted-panel p-5">
          <div className="text-2xl font-bold metric-num" style={{ fontFamily: "Georgia, serif" }}>{DEPLOYMENTS.length}</div>
          <div className="stat-label-caps mt-1">Total Deployments</div>
        </motion.div>
      </div>

      {/* Cards */}
      <div className="space-y-4">
        {DEPLOYMENTS.map((d, i) => <DeploymentCard key={d.id} dep={d} idx={i} />)}
      </div>
    </div>
  );
}
