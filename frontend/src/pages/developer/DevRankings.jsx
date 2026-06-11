import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, Package, Loader2, AlertCircle, ArrowUp, Star, TrendingUp } from "lucide-react";
import axios from "axios";
import { API_URL } from "@/lib/config";

export default function DevRankings() {
  const [products, setProducts] = useState([]);
  const [orders,   setOrders]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");
  const [sortBy,   setSortBy]   = useState("revenue");

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    Promise.all([
      axios.get(`${API_URL}/products/my`, { withCredentials: true, headers }).catch(() => ({ data: { data: [] } })),
      axios.get(`${API_URL}/orders/my`,   { withCredentials: true, headers }).catch(() => ({ data: { data: [] } })),
    ]).then(([prodRes, orderRes]) => {
      setProducts(Array.isArray(prodRes.data?.data) ? prodRes.data.data : []);
      setOrders(Array.isArray(orderRes.data?.data)  ? orderRes.data.data  : []);
    }).catch(() => setError("Could not load ranking data."))
      .finally(() => setLoading(false));
  }, []);

  // Build per-product stats from real orders
  const productStats = products.map(p => {
    const productOrders = orders.filter(o => o.product?.id === p.id || o.productId === p.id);
    const revenue       = productOrders.reduce((s, o) => s + (o.pricePaid || o.amount || 0), 0);
    const installs      = productOrders.filter(o => ["COMPLETED", "installed", "paid"].includes((o.status || "").toLowerCase())).length;
    return { ...p, revenue, installs, orders: productOrders.length };
  });

  const sorted = [...productStats].sort((a, b) => {
    if (sortBy === "installs") return b.installs - a.installs;
    if (sortBy === "orders")   return b.orders   - a.orders;
    if (sortBy === "rating")   return (b.rating || 0) - (a.rating || 0);
    return b.revenue - a.revenue;
  });

  const totalRevenue  = productStats.reduce((s, p) => s + p.revenue, 0);
  const totalInstalls = productStats.reduce((s, p) => s + p.installs, 0);
  const avgRating     = products.filter(p => p.rating).length
    ? (products.reduce((s, p) => s + (p.rating || 0), 0) / products.filter(p => p.rating).length).toFixed(1)
    : "—";

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-foreground/30" />
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
    <div className="p-6 sm:p-8 max-w-5xl page-fade-in">

      <div className="stat-label-caps mb-2">Developer · Product Performance</div>
      <h1 className="text-white font-bold text-2xl sm:text-3xl section-title-gradient mb-2" style={{ fontFamily: "Georgia, serif", letterSpacing: "-0.04em" }}>
        Rankings & Performance
      </h1>
      <p className="text-sm mb-8 mt-1.5" style={{ color: "hsl(var(--foreground) / 0.35)", fontFamily: "'Inter', sans-serif" }}>
        See how your products perform against each other.
      </p>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total Products",   value: products.length, icon: Package    },
          { label: "Total Revenue",    value: `$${totalRevenue.toLocaleString()}`, icon: TrendingUp },
          { label: "Total Installs",   value: totalInstalls,   icon: ArrowUp    },
          { label: "Avg Rating",       value: avgRating,       icon: Star       },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className="frosted-panel p-5"
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: "rgba(150,150,150,0.08)", border: "0.5px solid rgba(150,150,150,0.12)" }}>
              <s.icon className="w-4 h-4 text-foreground/60" />
            </div>
            <div className="text-2xl font-bold metric-num" style={{ fontFamily: "Georgia, serif" }}>{s.value}</div>
            <div className="text-xs font-semibold text-foreground/60 mt-0.5">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {products.length === 0 ? (
        <div className="frosted-panel p-16 text-center">
          <Trophy className="w-12 h-12 mx-auto mb-4 text-foreground/10" />
          <p className="text-sm font-semibold text-foreground/40">No products yet</p>
          <p className="text-xs text-foreground/25 mt-1">Publish your first product to see performance rankings.</p>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="frosted-panel overflow-hidden"
        >
          <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "0.5px solid hsl(var(--foreground) / 0.05)" }}>
            <div>
              <h2 className="text-white font-bold text-sm" style={{ fontFamily: "Georgia, serif" }}>Your Product Leaderboard</h2>
              <p className="stat-label-caps mt-0.5">Ranked by your real sales data</p>
            </div>
            <div className="flex items-center gap-1">
              {[
                { key: "revenue",  label: "Revenue"  },
                { key: "installs", label: "Installs" },
                { key: "orders",   label: "Orders"   },
                { key: "rating",   label: "Rating"   },
              ].map(s => (
                <button key={s.key} onClick={() => setSortBy(s.key)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${sortBy === s.key ? "bg-foreground/10 text-foreground border border-foreground/15" : "text-foreground/30 hover:text-foreground/60"}`}
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr style={{ borderBottom: "0.5px solid hsl(var(--foreground) / 0.06)" }}>
                  {["Rank", "Product", "Status", "Orders", "Installs", "Rating", "Revenue"].map(h => (
                    <th key={h} className="py-3 px-4 text-left text-[9px] font-bold uppercase tracking-widest text-foreground/25" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sorted.map((p, i) => (
                  <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 + 0.3 }}
                    className="border-b border-foreground/5 hover:bg-foreground/[0.02] transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                        i === 0 ? "bg-yellow-400/15 text-yellow-400" :
                        i === 1 ? "bg-slate-400/15 text-slate-300" :
                        i === 2 ? "bg-amber-700/15 text-amber-600" :
                        "text-foreground/40"
                      }`} style={{ background: i > 2 ? "rgba(150,150,150,0.06)" : undefined }}>
                        {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-sm text-foreground">{p.title?.slice(0, 36) || "—"}</div>
                      <div className="text-[10px] text-foreground/30 font-mono mt-0.5">${p.price}/deploy</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        p.status === "APPROVED" ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" :
                        p.status === "PENDING_REVIEW" ? "text-amber-400 bg-amber-400/10 border-amber-400/20" :
                        "text-foreground/40 bg-foreground/5 border-foreground/10"
                      }`}>{p.status || "PENDING"}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-sm font-bold metric-num text-foreground/60" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{p.orders}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-sm font-bold metric-num text-foreground/60" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{p.installs}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1">
                        {p.rating ? (
                          <>
                            {[1,2,3,4,5].map(s => <Star key={s} className="w-2.5 h-2.5" style={{ color: s <= Math.round(p.rating) ? "hsl(var(--foreground) / 0.7)" : "rgba(150,150,150,0.12)", fill: s <= Math.round(p.rating) ? "hsl(var(--foreground) / 0.7)" : "none" }} />)}
                            <span className="text-[10px] font-mono text-foreground/40 ml-1">{p.rating}</span>
                          </>
                        ) : (
                          <span className="text-[10px] text-foreground/25 font-mono">—</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-sm font-bold metric-num text-foreground/80" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                        ${p.revenue.toLocaleString()}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
}
