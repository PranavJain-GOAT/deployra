import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";
import { ShoppingBag, DollarSign, TrendingUp, Loader2, AlertCircle } from "lucide-react";
import axios from "axios";
import { API_URL } from "@/lib/config";

function Skeleton({ h = 120 }) {
  return <div className="skeleton-beam rounded-2xl" style={{ height: h }} />;
}

function buildMonthlyData(orders) {
  const months = {};
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = d.toLocaleString("en-US", { month: "short" });
    months[key] = { month: key, revenue: 0, installs: 0 };
  }
  orders.forEach(o => {
    const d = new Date(o.createdAt || Date.now());
    const key = d.toLocaleString("en-US", { month: "short" });
    if (key in months) {
      months[key].revenue += o.pricePaid || o.amount || 0;
      months[key].installs += 1;
    }
  });
  return Object.values(months);
}

export default function Analytics() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    axios.get(`${API_URL}/orders/my`, { withCredentials: true, headers })
      .then(res => setOrders(Array.isArray(res.data?.data) ? res.data.data : []))
      .catch(() => setError("Could not load analytics data. Please refresh."))
      .finally(() => setLoading(false));
  }, []);

  const paidOrders   = orders.filter(o => ["COMPLETED", "paid", "installed"].includes((o.status || "").toLowerCase()));
  const totalRevenue = paidOrders.reduce((s, o) => s + (o.pricePaid || o.amount || 0), 0);
  const conversionRate = orders.length > 0 ? Math.round((paidOrders.length / orders.length) * 100) : 0;
  const monthlyData  = buildMonthlyData(orders);
  const hasData      = orders.length > 0;

  if (loading) {
    return (
      <div className="p-6 sm:p-8 max-w-6xl space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {[1, 2, 3].map(i => <Skeleton key={i} h={100} />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton h={280} /><Skeleton h={280} />
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
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 max-w-6xl page-fade-in">
      <div className="stat-label-caps mb-2">Developer · Analytics Center</div>
      <h1 className="text-white font-bold text-2xl sm:text-3xl section-title-gradient mb-2" style={{ fontFamily: "Georgia, serif", letterSpacing: "-0.04em" }}>Analytics</h1>
      <p className="text-sm mb-8" style={{ color: "hsl(var(--foreground) / 0.35)", fontFamily: "'Inter', sans-serif" }}>Track your real sales and performance data.</p>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        {[
          { label: "Total Revenue",    value: `$${totalRevenue.toLocaleString()}`, icon: DollarSign  },
          { label: "Total Orders",     value: orders.length,                        icon: ShoppingBag },
          { label: "Conversion Rate",  value: `${conversionRate}%`,                 icon: TrendingUp  },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className="frosted-panel p-6"
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-4" style={{ background: "rgba(150,150,150,0.08)", border: "0.5px solid rgba(150,150,150,0.12)" }}>
              <s.icon className="w-4 h-4 text-foreground/60" />
            </div>
            <div className="text-xs font-mono font-semibold text-foreground/30 uppercase tracking-wider mb-1">{s.label}</div>
            <div className="text-white font-bold text-3xl" style={{ fontFamily: "Georgia, serif", letterSpacing: "-0.04em" }}>{s.value}</div>
          </motion.div>
        ))}
      </div>

      {!hasData ? (
        <div className="frosted-panel p-16 text-center">
          <ShoppingBag className="w-12 h-12 mx-auto mb-4 text-foreground/10" />
          <p className="text-sm font-semibold text-foreground/40" style={{ fontFamily: "'Inter', sans-serif" }}>No data yet</p>
          <p className="text-xs text-foreground/25 mt-1">Analytics will appear here once you have orders.</p>
        </div>
      ) : (
        <>
          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="frosted-panel p-6">
              <h2 className="text-white font-bold mb-6" style={{ fontFamily: "Georgia, serif" }}>Revenue (6 months)</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--foreground) / 0.06)" />
                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: "hsl(var(--foreground) / 0.4)" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: "hsl(var(--foreground) / 0.4)" }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
                    <Tooltip
                      contentStyle={{ background: "#111", color: "hsl(var(--foreground))", border: "1px solid hsl(var(--foreground) / 0.1)", borderRadius: "10px", fontSize: "12px" }}
                      formatter={v => [`$${v.toLocaleString()}`, "Revenue"]}
                    />
                    <defs>
                      <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--foreground))" stopOpacity={1} />
                        <stop offset="100%" stopColor="hsl(var(--foreground))" stopOpacity={0.7} />
                      </linearGradient>
                    </defs>
                    <Bar dataKey="revenue" fill="url(#revenueGrad)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="frosted-panel p-6">
              <h2 className="text-white font-bold mb-6" style={{ fontFamily: "Georgia, serif" }}>Orders (6 months)</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--foreground) / 0.06)" />
                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: "hsl(var(--foreground) / 0.4)" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: "hsl(var(--foreground) / 0.4)" }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ background: "#111", color: "hsl(var(--foreground))", border: "1px solid hsl(var(--foreground) / 0.1)", borderRadius: "10px", fontSize: "12px" }}
                      formatter={v => [v, "Orders"]}
                    />
                    <Bar dataKey="installs" fill="hsl(var(--foreground) / 0.5)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Orders table */}
          <div className="frosted-panel overflow-hidden mt-6">
            <div className="px-6 py-4" style={{ borderBottom: "0.5px solid hsl(var(--foreground) / 0.05)" }}>
              <h2 className="text-white font-bold" style={{ fontFamily: "Georgia, serif" }}>All Orders</h2>
              <p className="stat-label-caps mt-0.5">{orders.length} total orders</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: "0.5px solid hsl(var(--foreground) / 0.06)" }}>
                    {["Product", "Customer", "Amount", "Status", "Date"].map(h => (
                      <th key={h} className="text-left px-6 py-3 text-[10px] font-mono font-semibold text-foreground/25 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-foreground/5">
                  {orders.map((o, i) => (
                    <motion.tr key={o.id || i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                      className="hover:bg-foreground/[0.02] transition-colors"
                    >
                      <td className="px-6 py-4 text-sm text-foreground font-medium">{o.product?.title || o.productTitle || "—"}</td>
                      <td className="px-6 py-4 text-sm text-foreground/40 font-mono">{o.user?.email || o.clientEmail || "—"}</td>
                      <td className="px-6 py-4 text-sm text-foreground font-bold" style={{ fontFamily: "Georgia, serif" }}>${(o.pricePaid || o.amount || 0).toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md ${
                          ["COMPLETED", "paid", "installed"].includes((o.status || "").toLowerCase())
                            ? "bg-foreground/20 text-foreground border border-foreground/30"
                            : "bg-foreground/5 text-foreground/30 border border-foreground/10"
                        }`}>
                          {o.status || "PENDING"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-foreground/30 font-mono">{new Date(o.createdAt || Date.now()).toLocaleDateString()}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}