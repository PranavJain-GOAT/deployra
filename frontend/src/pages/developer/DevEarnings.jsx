import { useState } from "react";
import { motion } from "framer-motion";
import {
  Wallet, DollarSign,
  Shield, CheckCircle, Download, RefreshCw, Receipt
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const REVENUE_DATA = [
  { month: "Dec", gross: 4200, fees: 630, net: 3570 },
  { month: "Jan", gross: 5800, fees: 870, net: 4930 },
  { month: "Feb", gross: 4900, fees: 735, net: 4165 },
  { month: "Mar", gross: 7200, fees: 1080, net: 6120 },
  { month: "Apr", gross: 6100, fees: 915, net: 5185 },
  { month: "May", gross: 9400, fees: 1410, net: 7990 },
];

const TRANSACTIONS = [
  { id: "TXN-9821", type: "SALE",    product: "AI Support Chatbot",  gross: 299, fee: 44.85, net: 254.15, status: "ESCROW_HELD",  date: "May 27, 2025" },
  { id: "TXN-9820", type: "PAYOUT",  product: "—",                   gross: 0,   fee: 0,     net: 2840.00,status: "COMPLETED",    date: "May 25, 2025" },
  { id: "TXN-9818", type: "SALE",    product: "Data Pipeline Pro",   gross: 499, fee: 74.85, net: 424.15, status: "ESCROW_HELD",  date: "May 24, 2025" },
  { id: "TXN-9815", type: "SALE",    product: "Analytics Suite",     gross: 149, fee: 22.35, net: 126.65, status: "RELEASED",     date: "May 20, 2025" },
  { id: "TXN-9810", type: "REFUND",  product: "CRM Integration",     gross: -799,fee: 0,     net: -799.00,status: "REFUNDED",     date: "May 18, 2025" },
  { id: "TXN-9807", type: "SALE",    product: "E-Commerce Analytics",gross: 149, fee: 22.35, net: 126.65, status: "RELEASED",     date: "May 15, 2025" },
];

const TXN_STATUS = {
  ESCROW_HELD: { label: "Escrow Held",  color: "text-violet-400", bg: "bg-violet-400/8",  border: "border-violet-400/20" },
  RELEASED:    { label: "Released",     color: "text-emerald-400",bg: "bg-emerald-400/8", border: "border-emerald-400/20"},
  COMPLETED:   { label: "Paid Out",     color: "text-sky-400",    bg: "bg-sky-400/8",     border: "border-sky-400/20"    },
  REFUNDED:    { label: "Refunded",     color: "text-red-400",    bg: "bg-red-400/8",     border: "border-red-400/20"    },
};

const TXN_TYPE = {
  SALE:   { label: "Sale",   color: "text-emerald-400" },
  PAYOUT: { label: "Payout", color: "text-sky-400"     },
  REFUND: { label: "Refund", color: "text-red-400"     },
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

export default function DevEarnings() {
  const [payoutRequested, setPayoutRequested] = useState(false);
  const [requesting, setRequesting] = useState(false);

  const escrowBalance = TRANSACTIONS.filter(t => t.status === "ESCROW_HELD").reduce((s, t) => s + t.net, 0);
  const withdrawable  = TRANSACTIONS.filter(t => t.status === "RELEASED").reduce((s, t) => s + t.net, 0);
  const totalRevenue  = REVENUE_DATA.reduce((s, d) => s + d.net, 0);
  const platformFees  = REVENUE_DATA.reduce((s, d) => s + d.fees, 0);

  const handlePayout = () => {
    setRequesting(true);
    setTimeout(() => { setRequesting(false); setPayoutRequested(true); }, 1800);
  };

  return (
    <div className="p-6 sm:p-8 max-w-5xl page-fade-in">

      {/* Header */}
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <div className="stat-label-caps mb-2">Developer · Financial Center</div>
          <h1 className="text-white font-bold text-2xl sm:text-3xl section-title-gradient" style={{ fontFamily: "Georgia, serif", letterSpacing: "-0.04em" }}>
            Earnings & Escrow
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
          { label: "Total Earned (Net)",  value: `$${totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}`, sub: "All time", icon: DollarSign, color: "text-foreground" },
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

      {/* Revenue Chart */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="frosted-panel p-5 mb-6"
      >
        <div className="flex items-center justify-between mb-5" style={{ borderBottom: "0.5px solid hsl(var(--foreground) / 0.05)", paddingBottom: "1rem" }}>
          <div>
            <h2 className="text-white font-bold text-sm" style={{ fontFamily: "Georgia, serif" }}>Revenue Breakdown</h2>
            <p className="stat-label-caps mt-0.5">Gross vs Platform Fees vs Net</p>
          </div>
          <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest font-mono">
            <span className="flex items-center gap-1.5 text-foreground/50"><span className="w-2 h-2 rounded-sm bg-foreground/40" />Gross</span>
            <span className="flex items-center gap-1.5 text-foreground/50"><span className="w-2 h-2 rounded-sm bg-foreground/70" />Net</span>
            <span className="flex items-center gap-1.5 text-amber-400/70"><span className="w-2 h-2 rounded-sm bg-amber-400/50" />Fees</span>
          </div>
        </div>
        <div style={{ height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={REVENUE_DATA} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
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

      {/* Transaction History */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="frosted-panel overflow-hidden"
      >
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "0.5px solid hsl(var(--foreground) / 0.05)" }}>
          <div>
            <h2 className="text-white font-bold text-sm" style={{ fontFamily: "Georgia, serif" }}>Transaction History</h2>
            <p className="stat-label-caps mt-0.5">Sales, payouts, escrow movements, and refunds</p>
          </div>
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border border-foreground/10 text-foreground/50 hover:text-foreground hover:bg-foreground/5 transition-all">
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr style={{ borderBottom: "0.5px solid hsl(var(--foreground) / 0.06)" }}>
                {["Transaction", "Type", "Product", "Gross", "Platform Fee (15%)", "Net", "Status", "Date"].map(h => (
                  <th key={h} className="py-3 px-4 text-left text-[9px] font-bold uppercase tracking-widest text-foreground/25" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TRANSACTIONS.map((t, i) => (
                <motion.tr key={t.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 + 0.4 }}
                  className="border-b border-foreground/5 hover:bg-foreground/[0.02] transition-colors group"
                >
                  <td className="py-3.5 px-4">
                    <span className="text-[10px] font-mono text-foreground/40">{t.id}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`text-xs font-bold ${TXN_TYPE[t.type]?.color || "text-foreground/50"}`}>{TXN_TYPE[t.type]?.label || t.type}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="text-xs text-foreground/60" style={{ fontFamily: "'Inter', sans-serif" }}>{t.product}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="text-xs font-mono font-bold text-foreground/70">{t.gross >= 0 ? `$${t.gross.toFixed(2)}` : `-$${Math.abs(t.gross).toFixed(2)}`}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="text-xs font-mono text-amber-400/70">{t.fee > 0 ? `-$${t.fee.toFixed(2)}` : "—"}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`text-xs font-mono font-bold ${t.net >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                      {t.net >= 0 ? `$${t.net.toFixed(2)}` : `-$${Math.abs(t.net).toFixed(2)}`}
                    </span>
                  </td>
                  <td className="py-3.5 px-4"><TxnStatusBadge status={t.status} /></td>
                  <td className="py-3.5 px-4">
                    <span className="text-[10px] font-mono text-foreground/30">{t.date}</span>
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
