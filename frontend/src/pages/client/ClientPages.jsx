import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Clock, CreditCard, Heart, MessageSquare,
  TrendingUp, Activity, Users, Zap, Bot, Brain, ChevronRight, ArrowUpRight, RefreshCw, Wallet, FileText, X, FileUp, BarChart2, Target
} from "lucide-react";
import { useState, useRef } from "react";

/* ════════════════════════════════════════════════════════════
   SHARED HELPERS
════════════════════════════════════════════════════════════ */

function SectionHeader({ title, subtitle, badge }) {
  return (
    <div className="mb-8 aurora-header rounded-2xl px-6 py-5" style={{ background: "hsl(var(--foreground) / 0.015)", border: "0.5px solid hsl(var(--foreground) / 0.06)" }}>
      <div className="flex items-start justify-between">
        <div>
          {badge && (
            <div className="stat-label-caps mb-2">{badge}</div>
          )}
          <h1
            className="text-white font-bold text-2xl sm:text-3xl section-title-gradient"
            style={{ fontFamily: "Georgia, serif", letterSpacing: "-0.04em", lineHeight: 1.1 }}
          >
            {title}
          </h1>
          <p
            className="text-sm mt-1.5"
            style={{ color: "hsl(var(--foreground) / 0.35)", fontFamily: "'Inter', sans-serif", letterSpacing: "-0.01em" }}
          >
            {subtitle}
          </p>
        </div>
      </div>
    </div>
  );
}


/* ════════════════════════════════════════════════════════════
   PURCHASE HISTORY (OVERVIEW HOME)
════════════════════════════════════════════════════════════ */

const PURCHASES = [
  {
    id: "P-1002",
    title: "AI Customer Support Agent",
    price: 39,
    date: "Oct 24, 2025",
    active: true,
    metrics: { tickets: 142, accuracy: 98, sessions: 1840 },
    renewal: "Nov 24, 2025",
    category: "Support Automation",
  },
  {
    id: "P-1001",
    title: "Automated Data Extractor",
    price: 19,
    date: "Oct 12, 2025",
    active: false,
    metrics: { records: 58412, accuracy: 99.3, sessions: 312 },
    renewal: "Nov 12, 2025",
    category: "Data Processing",
  },
];

function StatusOrbBig({ active }) {
  return (
    <div className="relative flex items-center justify-center" style={{ width: 20, height: 20 }}>
      {active ? (
        <>
          <span
            className="absolute inset-0 rounded-full"
            style={{ background: "rgba(150,150,150,0.15)", animation: "orb-pulse-active 2.4s ease-in-out infinite" }}
          />
          <span className="status-orb-active" style={{ width: 10, height: 10 }} />
        </>
      ) : (
        <span className="status-orb-idle" style={{ width: 10, height: 10 }} />
      )}
    </div>
  );
}

function BentoGrid() {
  const stats = [
    {
      label: "Active Agents",
      value: PURCHASES.filter((p) => p.active).length,
      sub: `of ${PURCHASES.length} total`,
      icon: Bot,
      color: "hsl(var(--foreground))",
      bg: "rgba(150,150,150,0.07)",
    },
    {
      label: "Monthly ROI",
      value: "+340%",
      sub: "vs. manual support",
      icon: TrendingUp,
      color: "hsl(var(--foreground))",
      bg: "rgba(150,150,150,0.07)",
    },
    {
      label: "System Health",
      value: "99.9%",
      sub: "uptime last 30d",
      icon: Activity,
      color: "hsl(var(--foreground))",
      bg: "rgba(150,150,150,0.06)",
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-4 mb-6">
      {stats.map((s, i) => (
        <motion.div
          key={i}
          className="premium-stat-card p-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          style={{
            background: "white",
            border: "0.5px solid rgba(0,0,0,0.08)",
          }}
          whileHover={{ y: -4, boxShadow: "0 8px 32px rgba(0,0,0,0.1)" }}
        >
          <div className="flex items-start justify-between mb-3 relative z-10">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(0,0,0,0.05)", border: "0.5px solid rgba(0,0,0,0.1)" }}
            >
              <s.icon className="w-4 h-4" style={{ color: "rgba(0,0,0,0.6)" }} />
            </div>
            <ArrowUpRight className="w-3.5 h-3.5" style={{ color: "rgba(0,0,0,0.2)" }} />
          </div>
          <div className="relative z-10">
            <div
              className="text-2xl font-bold mb-0.5 metric-num"
              style={{ color: "hsl(0,0%,8%)", letterSpacing: "-0.03em", fontFamily: "Georgia, serif" }}
            >
              {s.value}
            </div>
            <div className="text-xs font-semibold" style={{ color: "rgba(0,0,0,0.75)", fontFamily: "'Inter', sans-serif" }}>
              {s.label}
            </div>
            <div className="stat-label-caps mt-1">{s.sub}</div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function AgentSettingsModal({ agent, onClose }) {
  const [uploaded, setUploaded] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef();

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    setUploaded(true);
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(14px)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="w-full max-w-lg rounded-2xl p-6 relative"
          style={{
            background: "rgba(0,0,0,0.97)",
            border: "0.5px solid rgba(150,150,150,0.25)",
            boxShadow: "0 40px 80px rgba(0,0,0,0.85), 0 0 0 0.5px rgba(150,150,150,0.08) inset",
          }}
          initial={{ scale: 0.92, y: 30 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
          transition={{ type: "spring", stiffness: 320, damping: 28 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top accent line */}
          <div className="absolute top-0 left-0 right-0 h-px rounded-t-2xl" style={{ background: "linear-gradient(90deg, transparent, rgba(150,150,150,0.5), transparent)" }} />

          <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-xl flex items-center justify-center transition-all" style={{ background: "hsl(var(--foreground) / 0.04)", color: "hsl(var(--foreground) / 0.3)" }}>
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(150,150,150,0.12)", border: "0.5px solid rgba(150,150,150,0.3)" }}
            >
              <Brain className="w-5 h-5" style={{ color: "hsl(var(--foreground))" }} />
            </div>
            <div>
              <h3 className="text-white font-bold" style={{ fontFamily: "Georgia, serif", letterSpacing: "-0.02em" }}>
                Agent Brain Config
              </h3>
              <p className="stat-label-caps mt-0.5">{agent?.title}</p>
            </div>
          </div>

          <div
            className={`border-dashed rounded-xl p-8 text-center transition-all mb-4`}
            style={{
              borderWidth: 1.5,
              borderStyle: "dashed",
              borderColor: dragging ? "rgba(150,150,150,0.5)" : "hsl(var(--foreground) / 0.08)",
              background: dragging ? "rgba(150,150,150,0.05)" : "transparent",
            }}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
          >
            {uploaded ? (
              <div>
                <CheckCircle className="w-8 h-8 mx-auto mb-2" style={{ color: "hsl(var(--foreground))" }} />
                <p className="text-sm font-semibold" style={{ color: "hsl(var(--foreground))", fontFamily: "'Inter', sans-serif" }}>
                  business_docs.pdf uploaded!
                </p>
                <p className="text-xs mt-1" style={{ color: "hsl(var(--foreground) / 0.3)", fontFamily: "'Inter', sans-serif" }}>
                  Agent is being retrained with your data...
                </p>
              </div>
            ) : (
              <div>
                <FileUp className="w-8 h-8 mx-auto mb-2" style={{ color: "rgba(150,150,150,0.4)" }} />
                <p className="text-sm font-semibold text-white mb-1" style={{ fontFamily: "'Inter', sans-serif" }}>
                  Drop your business PDFs here
                </p>
                <p className="text-xs mb-4" style={{ color: "hsl(var(--foreground) / 0.3)", fontFamily: "'Inter', sans-serif" }}>
                  Product docs, FAQs, policies — anything to train your agent
                </p>
                <button
                  className="px-5 py-2 rounded-xl text-xs font-semibold transition-all shimmer-btn"
                  style={{
                    background: "rgba(150,150,150,0.15)",
                    color: "hsl(var(--foreground))",
                    border: "0.5px solid rgba(150,150,150,0.3)",
                    fontFamily: "'Inter', sans-serif",
                    boxShadow: "0 0 16px rgba(150,150,150,0.1)",
                  }}
                  onClick={() => fileRef.current?.click()}
                >
                  Browse Files
                </button>
                <input ref={fileRef} type="file" className="hidden" accept=".pdf" onChange={() => setUploaded(true)} />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Knowledge Base", value: "3 documents indexed" },
              { label: "Last Trained", value: "2 days ago" },
            ].map(item => (
              <div key={item.label} className="p-3 rounded-xl" style={{ background: "hsl(var(--foreground) / 0.03)", border: "0.5px solid hsl(var(--foreground) / 0.06)" }}>
                <p className="stat-label-caps mb-1">{item.label}</p>
                <p className="text-xs text-white" style={{ fontFamily: "'Inter', sans-serif" }}>{item.value}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function InvoiceUnroll({ purchase, onClose }) {
  return (
    <motion.div
      className="mt-4 rounded-xl overflow-hidden invoice-unroll"
      style={{
        background: "rgba(0,0,0,0.98)",
        border: "0.5px solid rgba(150,150,150,0.2)",
        boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
      }}
    >
      <div
        className="px-5 py-4 flex items-center justify-between"
        style={{ borderBottom: "0.5px solid hsl(var(--foreground) / 0.05)" }}
      >
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4" style={{ color: "hsl(var(--foreground))" }} />
          <span className="text-sm font-bold text-white" style={{ fontFamily: "Georgia, serif" }}>Invoice #{purchase.id}</span>
        </div>
        <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-white/30 hover:text-white transition-colors" style={{ background: "hsl(var(--foreground) / 0.04)" }}>
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="p-5 grid grid-cols-2 gap-3">
        {[
          { label: "Product", value: purchase.title },
          { label: "Date", value: purchase.date, mono: true },
          { label: "Renewal", value: purchase.renewal, mono: true },
          { label: "Total", value: `$${purchase.price}/mo`, green: true },
        ].map(row => (
          <div key={row.label}>
            <p className="stat-label-caps mb-1">{row.label}</p>
            <p
              className="text-xs font-semibold"
              style={{
                color: row.green ? "hsl(var(--foreground))" : "hsl(var(--foreground) / 0.8)",
                fontFamily: row.mono ? "'JetBrains Mono', monospace" : "'Inter', sans-serif",
              }}
            >
              {row.value}
            </p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export function PurchaseHistory() {
  const [expandedInvoice, setExpandedInvoice] = useState(null);
  const [settingsAgent, setSettingsAgent]     = useState(null);

  return (
    <div className="p-6 sm:p-8 max-w-5xl page-fade-in">
      <SectionHeader
        title="Command Overview"
        subtitle="Your AI fleet status, performance metrics, and live insights."
        badge="Client Hub · Overview"
      />

      <BentoGrid />

      {/* Active Agents Header */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-bold text-white" style={{ fontFamily: "Georgia, serif", letterSpacing: "-0.02em" }}>
          Active Agents
        </h2>
        <span className="premium-badge premium-badge-monochrome">
          {PURCHASES.filter((p) => p.active).length} running
        </span>
      </div>

      <div className="space-y-4">
        {PURCHASES.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 + 0.3, duration: 0.5, ease: [0.16,1,0.3,1] }}
          >
            <div
              className="rounded-2xl p-5 transition-all"
              style={{
                background: "white",
                border: p.active ? "0.5px solid rgba(0,0,0,0.1)" : "0.5px solid rgba(0,0,0,0.07)",
                boxShadow: p.active ? "0 2px 16px rgba(0,0,0,0.08)" : "0 1px 8px rgba(0,0,0,0.05)",
              }}
            >
              {/* Header row */}
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{
                      background: "rgba(0,0,0,0.05)",
                      border: "0.5px solid rgba(0,0,0,0.1)",
                    }}
                  >
                    <Bot className="w-5 h-5" style={{ color: p.active ? "rgba(0,0,0,0.8)" : "rgba(0,0,0,0.35)" }} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <StatusOrbBig active={p.active} />
                      <h3 className="font-bold text-sm" style={{ fontFamily: "'Inter', sans-serif", color: "rgba(0,0,0,0.85)" }}>
                        {p.title}
                      </h3>
                    </div>
                    <p className="text-[11px]" style={{ color: "hsl(var(--foreground) / 0.3)", fontFamily: "'JetBrains Mono', monospace" }}>
                      {p.id} · {p.date} · {p.category}
                    </p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="text-xl font-bold metric-num" style={{ color: "hsl(var(--foreground))", fontFamily: "Georgia, serif" }}>
                    ${p.price}<span className="text-xs text-white/25 font-normal">/mo</span>
                  </span>
                  <div className="stat-label-caps mt-1">Renews {p.renewal}</div>
                </div>
              </div>

              {/* AI Performance Insights */}
              <div
                className="rounded-xl p-4 mb-4"
                style={{
                  background: "rgba(0,0,0,0.03)",
                  border: "0.5px solid rgba(0,0,0,0.07)",
                }}
              >
                <div className="flex items-center gap-1.5 mb-3">
                  <BarChart2 className="w-3.5 h-3.5" style={{ color: "hsl(var(--foreground))" }} />
                  <span className="stat-label-caps" style={{ color: "rgba(150,150,150,0.7)" }}>
                    Success Metrics — This Week
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {p.id === "P-1002" ? (
                    <>
                      <div>
                        <div className="text-xl font-bold text-white metric-num" style={{ fontFamily: "Georgia, serif" }}>142</div>
                        <div className="stat-label-caps">Tickets Handled</div>
                      </div>
                      <div>
                        <div className="text-xl font-bold metric-num" style={{ fontFamily: "Georgia, serif", color: "hsl(var(--foreground))" }}>98%</div>
                        <div className="stat-label-caps">Accuracy Rate</div>
                      </div>
                      <div>
                        <div className="text-xl font-bold text-white metric-num" style={{ fontFamily: "Georgia, serif" }}>1,840</div>
                        <div className="stat-label-caps">User Sessions</div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <div className="text-xl font-bold text-white metric-num" style={{ fontFamily: "Georgia, serif" }}>58.4K</div>
                        <div className="stat-label-caps">Records Extracted</div>
                      </div>
                      <div>
                        <div className="text-xl font-bold metric-num" style={{ fontFamily: "Georgia, serif", color: "hsl(var(--foreground))" }}>99.3%</div>
                        <div className="stat-label-caps">Accuracy Rate</div>
                      </div>
                      <div>
                        <div className="text-xl font-bold text-white metric-num" style={{ fontFamily: "Georgia, serif" }}>312</div>
                        <div className="stat-label-caps">Batch Sessions</div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2">
                <button
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all"
                  style={{
                    background: "rgba(150,150,150,0.12)",
                    color: "hsl(var(--foreground))",
                    border: "0.5px solid rgba(150,150,150,0.25)",
                    fontFamily: "'Inter', sans-serif",
                  }}
                  onClick={() => setSettingsAgent(p)}
                >
                  <Brain className="w-3.5 h-3.5" /> Configure Brain
                </button>
                <button
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all"
                  style={{
                    background: "hsl(var(--foreground) / 0.04)",
                    color: "hsl(var(--foreground) / 0.5)",
                    border: "0.5px solid hsl(var(--foreground) / 0.07)",
                    fontFamily: "'Inter', sans-serif",
                  }}
                  onClick={() => setExpandedInvoice((prev) => (prev === p.id ? null : p.id))}
                >
                  <FileText className="w-3.5 h-3.5" />
                  {expandedInvoice === p.id ? "Hide Invoice" : "View Invoice"}
                </button>
                <span
                  className="ml-auto premium-badge"
                  style={{
                    background: p.active ? "rgba(150,150,150,0.08)" : "hsl(var(--foreground) / 0.05)",
                    color: p.active ? "hsl(var(--foreground))" : "hsl(var(--foreground) / 0.3)",
                    border: p.active ? "0.5px solid rgba(150,150,150,0.2)" : "0.5px solid hsl(var(--foreground) / 0.07)",
                  }}
                >
                  {p.active ? "● RUNNING" : "● IDLE"}
                </span>
              </div>

              {/* Invoice unroll */}
              {expandedInvoice === p.id && (
                <InvoiceUnroll purchase={p} onClose={() => setExpandedInvoice(null)} />
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {settingsAgent && (
        <AgentSettingsModal
          agent={settingsAgent}
          onClose={() => setSettingsAgent(null)}
        />
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   ORDER MANAGEMENT
════════════════════════════════════════════════════════════ */

export function OrderManagement() {
  return (
    <div className="p-6 sm:p-8 max-w-5xl page-fade-in">
      <SectionHeader
        title="Order Management"
        subtitle="Track ongoing projects and visualize your AI pipeline."
        badge="Client Hub · Orders"
      />

      {/* Workflow node map */}
      <div
        className="frosted-panel p-8 mb-5"
      >
        <div className="flex items-center gap-2 mb-7">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(150,150,150,0.12)", border: "0.5px solid rgba(150,150,150,0.25)" }}>
            <Target className="w-3.5 h-3.5" style={{ color: "hsl(var(--foreground))" }} />
          </div>
          <span className="stat-label-caps" style={{ color: "rgba(150,150,150,0.8)" }}>
            Live Agent Workflow Map
          </span>
        </div>

        <div className="flex items-start justify-center gap-6 overflow-x-auto py-4">
          {[
            {
              icon: Activity, label: "Data Extractor", sub: "P-1001 · IDLE",
              color: "rgba(150,150,150,0.15)", borderColor: "rgba(150,150,150,0.2)",
              connector: "feeds data →", active: false,
            },
            {
              icon: Bot, label: "Support Agent", sub: "P-1002 · RUNNING",
              color: "rgba(150,150,150,0.12)", borderColor: "rgba(150,150,150,0.4)",
              connector: "resolves tickets →", active: true,
              glow: "0 0 30px rgba(150,150,150,0.12)",
            },
            {
              icon: Users, label: "End Customers", sub: "1,840 sessions",
              color: "rgba(150,150,150,0.1)", borderColor: "rgba(150,150,150,0.2)",
              connector: null, active: false, altColor: "hsl(var(--foreground))",
            },
          ].map((node, i) => (
            <div key={i} className="workflow-node min-w-max">
              <div
                className="workflow-node-box"
                style={{
                  borderColor: node.borderColor,
                  background: node.color,
                  boxShadow: node.glow || "none",
                }}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center mx-auto mb-2.5"
                  style={{ background: node.active ? "rgba(150,150,150,0.2)" : "hsl(var(--foreground) / 0.06)" }}
                >
                  <node.icon className="w-4.5 h-4.5" style={{ color: node.altColor || (node.active ? "hsl(var(--foreground))" : "hsl(var(--foreground))") }} />
                </div>
                <p className="text-xs font-bold text-white mb-0.5 text-center" style={{ fontFamily: "'Inter', sans-serif" }}>{node.label}</p>
                <p
                  className="text-[10px] text-center"
                  style={{
                    color: node.active ? "hsl(var(--foreground))" : "hsl(var(--foreground) / 0.3)",
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  {node.sub}
                </p>
              </div>
              {node.connector && (
                <>
                  <div className="workflow-connector" />
                  <div className="premium-badge" style={{ background: "rgba(150,150,150,0.06)", color: "rgba(150,150,150,0.6)", border: "0.5px solid rgba(150,150,150,0.12)" }}>
                    {node.connector}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Active order card */}
      <div className="frosted-panel p-6">
        <div className="flex items-start justify-between mb-5">
          <div>
            <h3 className="text-white font-bold text-sm mb-0.5" style={{ fontFamily: "'Inter', sans-serif" }}>Custom Recommendation Engine</h3>
            <p className="stat-label-caps">ORDER-003 · Started Nov 1, 2025</p>
          </div>
          <span className="premium-badge premium-badge-monochrome flex items-center gap-1">
            <Clock className="w-3 h-3" /> In Progress
          </span>
        </div>

        <div className="mb-3">
          <div className="flex justify-between mb-2">
            <span className="stat-label-caps">Milestone 2 of 4</span>
            <span className="text-xs font-bold metric-num" style={{ color: "hsl(var(--foreground))", fontFamily: "'JetBrains Mono', monospace" }}>60%</span>
          </div>
          <div className="health-bar-track">
            <motion.div
              className="health-bar-fill"
              style={{ background: "linear-gradient(90deg, hsl(var(--foreground)), hsl(var(--foreground)), hsl(var(--foreground)))", boxShadow: "0 0 10px rgba(150,150,150,0.4)" }}
              initial={{ width: "0%" }}
              animate={{ width: "60%" }}
              transition={{ duration: 1.2, delay: 0.3, ease: [0.16,1,0.3,1] }}
            />
          </div>
        </div>

        <div className="flex justify-between text-xs" style={{ color: "hsl(var(--foreground) / 0.3)", fontFamily: "'Inter', sans-serif" }}>
          <span>🏗 Architecture · ✅ Design · 🔄 Development · ⏳ Testing</span>
          <span className="premium-badge-monochrome px-2 py-0.5 rounded text-[10px]" style={{ color: "hsl(var(--foreground))", fontFamily: "'JetBrains Mono', monospace" }}>ETA: Nov 15</span>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   HIRE DEVELOPERS
════════════════════════════════════════════════════════════ */

const DEVS = [
  { id: 1, name: "Aisha Rahman",    role: "AI/ML Engineer",       rating: 5.0, rate: "$65/hr", live: true,  avatar: "AR", stack: ["Python", "LangChain", "FastAPI"], projects: 34, badge: "Top Rated" },
  { id: 2, name: "Carlos Mendes",   role: "Full-Stack Dev",        rating: 4.9, rate: "$48/hr", live: false, avatar: "CM", stack: ["React", "Node.js", "PostgreSQL"], projects: 61, badge: "Expert" },
  { id: 3, name: "Priya Nair",      role: "Automation Specialist", rating: 4.8, rate: "$42/hr", live: true,  avatar: "PN", stack: ["Zapier", "n8n", "Python"],         projects: 27, badge: "Rising Star" },
  { id: 4, name: "James Whitfield", role: "Backend Engineer",      rating: 4.9, rate: "$55/hr", live: false, avatar: "JW", stack: ["Go", "Redis", "AWS"],               projects: 48, badge: "Expert" },
];

export function HireDevelopers() {
  const [selected, setSelected] = useState(null);
  const [priority, setPriority] = useState(null);

  return (
    <div className="p-6 sm:p-8 max-w-5xl page-fade-in">
      <SectionHeader
        title="Dev Direct Portal"
        subtitle="Connect with elite AI specialists who can extend your agents on demand."
        badge="Client Hub · Dev Direct"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {DEVS.map((dev, i) => (
          <motion.div
            key={dev.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="frosted-panel p-5 cursor-pointer transition-all"
            style={{
              border: selected === dev.id
                ? "0.5px solid rgba(150,150,150,0.3)"
                : "0.5px solid hsl(var(--foreground) / 0.06)",
              boxShadow: selected === dev.id ? "0 0 0 0.5px rgba(150,150,150,0.08) inset" : "none",
            }}
            onClick={() => setSelected(selected === dev.id ? null : dev.id)}
            whileHover={{ y: -3, boxShadow: "0 12px 40px rgba(0,0,0,0.6)" }}
          >
            <div className="flex items-start gap-4 mb-4">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-white"
                  style={{
                    background: "linear-gradient(135deg, hsl(var(--foreground)), hsl(var(--foreground)))",
                    boxShadow: "0 0 24px rgba(150,150,150,0.3)",
                    fontFamily: "Georgia, serif",
                    fontSize: "1.15rem",
                  }}
                >
                  {dev.avatar}
                </div>
                <div
                  className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center"
                  style={{ background: "transparent", border: "2px solid hsl(var(--foreground) / 0.08)" }}
                >
                  {dev.live ? (
                    <span className="status-orb-active" style={{ width: 8, height: 8 }} />
                  ) : (
                    <span className="status-orb-idle" style={{ width: 8, height: 8 }} />
                  )}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div>
                    <h3 className="text-white font-bold text-sm" style={{ fontFamily: "'Inter', sans-serif" }}>{dev.name}</h3>
                    <p className="text-xs mt-0.5" style={{ color: "hsl(var(--foreground) / 0.4)", fontFamily: "'Inter', sans-serif" }}>{dev.role}</p>
                  </div>
                  <span className="premium-badge premium-badge-monochrome flex-shrink-0">{dev.badge}</span>
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-xs font-bold" style={{ color: "hsl(var(--foreground))", fontFamily: "'JetBrains Mono', monospace" }}>★ {dev.rating}</span>
                  <span className="text-xs font-bold metric-num" style={{ color: "hsl(var(--foreground) / 0.5)", fontFamily: "'JetBrains Mono', monospace" }}>{dev.rate}</span>
                  <span className="stat-label-caps">{dev.projects} projects</span>
                </div>
              </div>
            </div>

            {/* Stack tags */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {dev.stack.map((s) => (
                <span key={s} className="cyber-tag">{s}</span>
              ))}
            </div>

            {/* Live status */}
            <div className="flex items-center gap-2 mb-4">
              <span
                className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider"
                style={{
                  color: dev.live ? "hsl(var(--foreground))" : "hsl(var(--foreground) / 0.3)",
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                {dev.live ? (
                  <><span className="status-orb-active" style={{ width: 6, height: 6 }} /> Online Now</>
                ) : (
                  <><span className="status-orb-idle" style={{ width: 6, height: 6 }} /> Available Soon</>
                )}
              </span>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all"
                style={{
                  background: "rgba(150,150,150,0.12)",
                  color: "hsl(var(--foreground))",
                  border: "0.5px solid rgba(150,150,150,0.25)",
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                Contact
              </button>
              <button
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
                style={{
                  background: priority === dev.id ? "rgba(150,150,150,0.12)" : "hsl(var(--foreground) / 0.04)",
                  color: priority === dev.id ? "hsl(var(--foreground))" : "hsl(var(--foreground) / 0.4)",
                  border: priority === dev.id ? "0.5px solid rgba(150,150,150,0.3)" : "0.5px solid hsl(var(--foreground) / 0.06)",
                  fontFamily: "'Inter', sans-serif",
                }}
                onClick={(e) => { e.stopPropagation(); setPriority(priority === dev.id ? null : dev.id); }}
              >
                <Zap className="w-3 h-3" /> Priority
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   INTEGRATIONS HUB
════════════════════════════════════════════════════════════ */

const INTEGRATIONS = [
  { name: "WhatsApp Business", desc: "Send AI responses directly through WhatsApp",         color: "hsl(var(--foreground))", bg: "rgba(150,150,150,0.07)",  connected: true,  icon: "💬", users: "2B+ users" },
  { name: "Shopify",           desc: "Sync orders and inventory with your support agent",   color: "hsl(var(--foreground))", bg: "rgba(150,150,150,0.07)",  connected: false, icon: "🛍",  users: "2M+ stores" },
  { name: "Slack",             desc: "Get AI alerts and escalations in your Slack workspace",color: "hsl(var(--foreground))", bg: "rgba(150,150,150,0.07)",   connected: true,  icon: "⚡", users: "750K+ teams" },
  { name: "Stripe",            desc: "Automate payment follow-ups and billing queries",      color: "hsl(var(--foreground))", bg: "rgba(150,150,150,0.07)",   connected: false, icon: "💳", users: "Global" },
  { name: "Notion",            desc: "Export AI insights and ticket summaries to Notion",    color: "hsl(var(--foreground))", bg: "hsl(var(--foreground) / 0.04)", connected: false, icon: "📝", users: "35M+ users" },
  { name: "Google Sheets",     desc: "Stream extracted data directly to your spreadsheets",  color: "hsl(var(--foreground))", bg: "rgba(150,150,150,0.07)",   connected: false, icon: "📊", users: "Enterprise" },
];

export function Integrations() {
  const [states, setStates] = useState(
    Object.fromEntries(INTEGRATIONS.map((i) => [i.name, i.connected]))
  );
  const [animating, setAnimating] = useState(null);

  const toggle = (name) => {
    setAnimating(name);
    setTimeout(() => {
      setStates((p) => ({ ...p, [name]: !p[name] }));
      setAnimating(null);
    }, 300);
  };

  return (
    <div className="p-6 sm:p-8 max-w-5xl page-fade-in">
      <SectionHeader
        title="Integrations Hub"
        subtitle="Connect your AI agents to the tools your business already uses."
        badge="Client Hub · Integrations"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {INTEGRATIONS.map((intg, i) => (
          <motion.div
            key={intg.name}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.4, ease: [0.16,1,0.3,1] }}
            className="frosted-panel p-5 transition-all"
            style={{
              background: states[intg.name] ? intg.bg : "hsl(var(--foreground) / 0.02)",
              border: states[intg.name]
                ? `0.5px solid ${intg.color}30`
                : "0.5px solid hsl(var(--foreground) / 0.06)",
            }}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0 transition-all"
                  style={{
                    background: states[intg.name] ? `${intg.color}18` : "hsl(var(--foreground) / 0.04)",
                    border: `0.5px solid ${states[intg.name] ? intg.color + "30" : "hsl(var(--foreground) / 0.06)"}`,
                  }}
                >
                  {intg.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="text-white font-bold text-sm" style={{ fontFamily: "'Inter', sans-serif" }}>
                      {intg.name}
                    </h3>
                    {states[intg.name] && (
                      <span className="premium-badge premium-badge-monochrome">Connected</span>
                    )}
                  </div>
                  <p className="text-xs mb-1" style={{ color: "hsl(var(--foreground) / 0.35)", fontFamily: "'Inter', sans-serif" }}>
                    {intg.desc}
                  </p>
                  <span className="stat-label-caps">{intg.users}</span>
                </div>
              </div>

              <button
                className={`integration-toggle ${states[intg.name] ? "on" : ""} ${animating === intg.name ? "scale-95" : ""} flex-shrink-0 ml-3`}
                onClick={() => toggle(intg.name)}
                style={states[intg.name] ? {
                  background: `${intg.color}25`,
                  borderColor: `${intg.color}50`,
                  boxShadow: `0 0 14px ${intg.color}25`,
                } : {}}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   WISHLIST
════════════════════════════════════════════════════════════ */

export function Wishlist() {
  return (
    <div className="p-6 sm:p-8 max-w-5xl page-fade-in">
      <SectionHeader title="Saved Items" subtitle="Services and products you saved for later." badge="Client Hub · Wishlist" />
      <div
        className="frosted-panel py-24 flex flex-col items-center justify-center text-center"
      >
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: "hsl(var(--foreground) / 0.04)", border: "0.5px solid hsl(var(--foreground) / 0.07)" }}>
          <Heart className="w-8 h-8" style={{ color: "hsl(var(--foreground) / 0.12)" }} />
        </div>
        <p className="text-base font-semibold text-white mb-2" style={{ fontFamily: "Georgia, serif", letterSpacing: "-0.02em" }}>Your wishlist is empty</p>
        <p className="text-sm max-w-xs" style={{ color: "hsl(var(--foreground) / 0.3)", fontFamily: "'Inter', sans-serif" }}>
          Browse the marketplace and save items you're interested in.
        </p>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   MESSAGING
════════════════════════════════════════════════════════════ */

export function Messaging() {
  const conversations = [
    { name: "Aisha Rahman",  msg: "I'll push the update tonight.", time: "2m",  active: true },
    { name: "Carlos Mendes", msg: "Can you send the requirements?", time: "1h", active: false },
  ];

  return (
    <div className="p-6 sm:p-8 max-w-5xl page-fade-in">
      <SectionHeader title="Messages" subtitle="Communicate directly with your hired developers." badge="Client Hub · Messages" />
      <div
        className="frosted-panel overflow-hidden"
        style={{ height: 520, display: "flex" }}
      >
        {/* Sidebar */}
        <div
          className="w-64 flex-shrink-0 border-r hidden md:flex flex-col"
          style={{ borderColor: "hsl(var(--foreground) / 0.05)" }}
        >
          <div className="p-4 border-b" style={{ borderColor: "hsl(var(--foreground) / 0.05)" }}>
            <p className="stat-label-caps">Conversations</p>
          </div>
          <div className="p-2 flex-1 overflow-y-auto premium-scroll">
            {conversations.map((c) => (
              <div
                key={c.name}
                className="p-3 rounded-xl mb-1 cursor-pointer transition-all"
                style={{
                  background: c.active ? "rgba(150,150,150,0.08)" : "transparent",
                  border: c.active ? "0.5px solid rgba(150,150,150,0.15)" : "0.5px solid transparent",
                }}
              >
                <div className="flex items-center justify-between mb-0.5">
                  <h4 className="text-xs font-semibold text-white" style={{ fontFamily: "'Inter', sans-serif" }}>{c.name}</h4>
                  <span className="stat-label-caps">{c.time}</span>
                </div>
                <p className="text-xs truncate" style={{ color: "hsl(var(--foreground) / 0.35)", fontFamily: "'Inter', sans-serif" }}>{c.msg}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Main chat area */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3" style={{ background: "hsl(var(--foreground) / 0.04)", border: "0.5px solid hsl(var(--foreground) / 0.06)" }}>
            <MessageSquare className="w-6 h-6" style={{ color: "hsl(var(--foreground) / 0.12)" }} />
          </div>
          <p className="text-sm font-semibold text-white/50" style={{ fontFamily: "Georgia, serif" }}>Select a conversation</p>
          <p className="text-xs mt-1" style={{ color: "hsl(var(--foreground) / 0.2)", fontFamily: "'Inter', sans-serif" }}>Choose from the sidebar to start chatting</p>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   BILLING & WALLET
════════════════════════════════════════════════════════════ */

export function Billing() {
  const [refilling, setRefilling]   = useState(false);
  const [balance,   setBalance]     = useState(124.50);
  const [expandedInvoice, setExpanded] = useState(null);

  const invoices = [
    { id: "INV-1002", label: "AI Customer Support Agent", amount: 39,  date: "Oct 24, 2025", status: "Paid" },
    { id: "INV-1001", label: "Automated Data Extractor",  amount: 19,  date: "Oct 12, 2025", status: "Paid" },
    { id: "INV-1000", label: "Custom Dev Work — Aisha",   amount: 340, date: "Sep 28, 2025", status: "Paid" },
  ];

  const handleRefill = () => {
    setRefilling(true);
    setTimeout(() => {
      setBalance((p) => p + 50);
      setRefilling(false);
    }, 800);
  };

  return (
    <div className="p-6 sm:p-8 max-w-5xl page-fade-in">
      <SectionHeader title="Billing & Wallet" subtitle="Manage your credits, invoices, and payment methods." badge="Client Hub · Billing" />

      {/* Virtual Wallet Card */}
      <motion.div
        className="wallet-card p-7 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16,1,0.3,1] }}
      >
        {/* Top shimmer line */}
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(150,150,150,0.4), transparent)" }} />

        <div className="flex items-start justify-between mb-7">
          <div>
            <div className="stat-label-caps mb-2">Available Credits</div>
            <div
              className="text-5xl font-bold counter-highlight"
              style={{ fontFamily: "Georgia, serif", letterSpacing: "-0.05em", lineHeight: 1 }}
            >
              ${balance.toFixed(2)}
            </div>
            <p className="text-xs mt-2" style={{ color: "hsl(var(--foreground) / 0.25)", fontFamily: "'Inter', sans-serif" }}>
              Resets on Nov 1, 2025
            </p>
          </div>
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: "rgba(150,150,150,0.12)", border: "0.5px solid rgba(150,150,150,0.25)" }}
          >
            <Wallet className="w-7 h-7" style={{ color: "hsl(var(--foreground))" }} />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefill}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all shimmer-btn ${refilling ? "refill-anim" : ""}`}
            style={{
              background: "linear-gradient(135deg, hsl(var(--foreground)), hsl(var(--foreground)))",
              color: "white",
              boxShadow: refilling ? "0 0 32px rgba(150,150,150,0.5)" : "0 0 20px rgba(150,150,150,0.25)",
              fontFamily: "'Inter', sans-serif",
              letterSpacing: "0.02em",
            }}
          >
            <RefreshCw className={`w-4 h-4 ${refilling ? "animate-spin" : ""}`} />
            {refilling ? "Processing..." : "One-Tap Refill +$50"}
          </button>
          <div className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl" style={{ background: "hsl(var(--foreground) / 0.04)", border: "0.5px solid hsl(var(--foreground) / 0.07)" }}>
            <CreditCard className="w-4 h-4" style={{ color: "hsl(var(--foreground) / 0.3)" }} />
            <span className="text-xs" style={{ color: "hsl(var(--foreground) / 0.3)", fontFamily: "'JetBrains Mono', monospace" }}>Visa •••• 4242</span>
          </div>
        </div>
      </motion.div>

      {/* Invoice Timeline */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-white" style={{ fontFamily: "Georgia, serif", letterSpacing: "-0.02em" }}>Transaction History</h2>
        <span className="premium-badge premium-badge-monochrome">{invoices.length} transactions</span>
      </div>

      <div className="space-y-2 relative">
        <div className="absolute left-4 top-4 bottom-4 w-px" style={{ background: "linear-gradient(180deg, rgba(150,150,150,0.4) 0%, transparent 100%)" }} />

        {invoices.map((inv, i) => (
          <div key={inv.id} className="pl-10 relative">
            <div className="timeline-dot absolute left-3.5 top-5" />
            <motion.div
              className="rounded-2xl overflow-hidden"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
            >
              <button
                className="w-full p-4 flex items-center gap-4 text-left transition-all frosted-panel"
                style={{ borderRadius: "1rem" }}
                onClick={() => setExpanded(expandedInvoice === inv.id ? null : inv.id)}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(150,150,150,0.1)", border: "0.5px solid rgba(150,150,150,0.2)" }}
                >
                  <FileText className="w-4 h-4" style={{ color: "hsl(var(--foreground))" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate" style={{ fontFamily: "'Inter', sans-serif" }}>{inv.label}</p>
                  <p className="stat-label-caps mt-0.5">{inv.id} · {inv.date}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold metric-num" style={{ color: "hsl(var(--foreground))", fontFamily: "Georgia, serif" }}>
                    ${inv.amount}
                  </p>
                  <span className="premium-badge premium-badge-monochrome">✓ {inv.status}</span>
                </div>
                <ChevronRight
                  className="w-4 h-4 ml-2 flex-shrink-0 transition-transform"
                  style={{
                    color: "hsl(var(--foreground) / 0.15)",
                    transform: expandedInvoice === inv.id ? "rotate(90deg)" : "rotate(0deg)",
                  }}
                />
              </button>

              {expandedInvoice === inv.id && (
                <div
                  className="invoice-unroll px-5 py-4 border-t"
                  style={{
                    background: "rgba(0,0,0,0.95)",
                    borderColor: "rgba(150,150,150,0.1)",
                    borderRadius: "0 0 1rem 1rem",
                  }}
                >
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: "Invoice ID", value: inv.id, mono: true },
                      { label: "Status",     value: `✓ ${inv.status}`, green: true },
                      { label: "Date",       value: inv.date, mono: true },
                      { label: "Amount",     value: `$${inv.amount}.00`, green: true },
                    ].map(row => (
                      <div key={row.label}>
                        <p className="stat-label-caps mb-1">{row.label}</p>
                        <p
                          className="text-xs font-semibold"
                          style={{
                            color: row.green ? "hsl(var(--foreground))" : "hsl(var(--foreground) / 0.8)",
                            fontFamily: row.mono ? "'JetBrains Mono', monospace" : "'Inter', sans-serif",
                          }}
                        >
                          {row.value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        ))}
      </div>

      {/* Saved card */}
      <div
        className="frosted-panel p-5 mt-5 flex items-center gap-4"
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "hsl(var(--foreground) / 0.04)", border: "0.5px solid hsl(var(--foreground) / 0.08)" }}
        >
          <CreditCard className="w-5 h-5" style={{ color: "hsl(var(--foreground) / 0.35)" }} />
        </div>
        <div className="flex-1">
          <p className="text-sm text-white font-semibold" style={{ fontFamily: "'Inter', sans-serif" }}>Visa ending in 4242</p>
          <p className="stat-label-caps mt-0.5">Expires 12/26 · Default card</p>
        </div>
        <CheckCircle className="w-5 h-5 flex-shrink-0" style={{ color: "hsl(var(--foreground))" }} />
      </div>
    </div>
  );
}
