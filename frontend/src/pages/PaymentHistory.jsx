import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Download, CreditCard, CheckCircle, Clock, XCircle, ArrowLeft, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const STATUS_CONFIG = {
  paid: { icon: CheckCircle, color: "text-green-600", bg: "bg-green-50", label: "Paid" },
  installed: { icon: CheckCircle, color: "text-green-600", bg: "bg-green-50", label: "Installed" },
  pending: { icon: Clock, color: "text-amber-600", bg: "bg-amber-50", label: "Pending" },
  cancelled: { icon: XCircle, color: "text-red-600", bg: "bg-red-50", label: "Cancelled" },
};

const MOCK_ORDERS = [
  {
    id: "ord-1",
    product_title: "AI Customer Support Bot",
    product_type: "instant",
    amount: 149,
    status: "installed",
    created_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "ord-2",
    product_title: "WhatsApp Order Automation",
    product_type: "instant",
    amount: 199,
    status: "paid",
    created_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "ord-3",
    product_title: "Lead Generation Dashboard",
    product_type: "instant",
    amount: 179,
    status: "pending",
    created_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  }
];

export default function PaymentHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const timer = setTimeout(() => {
      setOrders(MOCK_ORDERS);
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);
  const totalSpent = orders.filter((o) => o.status === "paid" || o.status === "installed")
    .reduce((sum, o) => sum + (o.amount || 0), 0);

  const generateInvoice = (order) => {
    const content = `INVOICE\n\nOrder ID: ${order.id}\nProduct: ${order.product_title}\nAmount: $${order.amount}\nStatus: ${order.status}\nDate: ${new Date(order.created_date).toLocaleDateString()}\n\nThank you for your business!\nDeployra Platform`;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `invoice-${order.id?.slice(0, 8)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-[#0a0a0a] text-white py-14 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }} />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6">
          <Link to="/" className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm mb-6 transition-colors font-sub">
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </Link>
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <p className="text-xs font-sub font-bold uppercase tracking-[0.25em] text-white/40 mb-2">BILLING</p>
              <h1 className="font-heading text-4xl font-bold">Payment History</h1>
            </div>
            <div className="glass-dark border border-white/10 rounded-2xl px-6 py-4">
              <div className="text-xs text-white/40 font-sub mb-1">Total Spent</div>
              <div className="font-heading text-3xl font-bold">${totalSpent.toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Orders", value: orders.length, icon: CreditCard },
            { label: "Paid", value: orders.filter((o) => o.status === "paid" || o.status === "installed").length, icon: CheckCircle },
            { label: "Pending", value: orders.filter((o) => o.status === "pending").length, icon: Clock },
            { label: "This Month", value: orders.filter((o) => new Date(o.created_date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length, icon: FileText },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="bg-card border-2 border-border rounded-2xl p-5"
            >
              <s.icon className="w-5 h-5 text-muted-foreground mb-3" />
              <div className="font-heading text-2xl font-bold">{s.value}</div>
              <div className="text-xs text-muted-foreground font-sub mt-0.5">{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          {["all", "paid", "installed", "pending", "cancelled"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-xs font-sub font-semibold capitalize transition-all ${filter === f ? "bg-foreground text-background" : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-card border-2 border-border rounded-2xl overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="w-8 h-8 border-4 border-muted border-t-foreground rounded-full animate-spin mx-auto" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-16 text-center">
              <CreditCard className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="font-sub font-semibold text-muted-foreground">No orders found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="min-w-[700px]">
                <div className="grid grid-cols-5 gap-4 px-6 py-4 border-b border-border">
                  {["Product", "Type", "Amount", "Status", "Actions"].map((h) => (
                    <div key={h} className="text-[10px] font-sub font-bold uppercase tracking-widest text-muted-foreground">{h}</div>
                  ))}
                </div>
                <div className="divide-y divide-border">
                  {filtered.map((order, i) => {
                    const sc = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
                    return (
                      <motion.div
                        key={order.id}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className="grid grid-cols-5 gap-4 px-6 py-4 hover:bg-muted/30 transition-colors items-center"
                      >
                        <div>
                          <div className="font-sub font-semibold text-sm truncate">{order.product_title}</div>
                          <div className="text-xs text-muted-foreground">{order.created_date ? new Date(order.created_date).toLocaleDateString() : "—"}</div>
                        </div>
                        <div>
                          <span className="text-[10px] font-sub font-bold uppercase tracking-widest px-2.5 py-1 rounded-md bg-muted text-muted-foreground">
                            {order.product_type}
                          </span>
                        </div>
                        <div className="font-heading font-bold text-lg">${order.amount}</div>
                        <div>
                          <span className={`status-badge inline-flex items-center gap-1.5 text-[11px] tech-label font-bold px-2.5 py-1.5 rounded-lg ${sc.color}`}>
                            <sc.icon className="w-3 h-3" />
                            {sc.label}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => generateInvoice(order)}
                            className="rounded-xl border-2 border-foreground/10 hover:border-foreground font-sub text-xs gap-1.5"
                          >
                            <Download className="w-3 h-3" />
                            Invoice
                          </Button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}