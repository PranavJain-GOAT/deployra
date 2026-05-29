import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Filter, Star, Shield, Zap, TrendingUp, Tag,
  ChevronRight, SlidersHorizontal, Package, Award, Clock,
  ArrowUpRight, Heart, ShoppingCart, Check, X, RefreshCw, Globe
} from "lucide-react";

const PRODUCTS = [
  {
    id: "p1", title: "DataFlow AI Pipeline", vendor: "Priya Systems", category: "Data",
    price: 499, rating: 4.9, reviews: 128, verified: true, featured: true, trending: true,
    deployTime: "< 10 min", description: "Enterprise-grade data pipeline with real-time stream processing, ML-ready transforms, and 50+ connectors. Zero-config deployment.",
    tags: ["PostgreSQL", "Kafka", "ML", "Real-time"], installs: 312
  },
  {
    id: "p2", title: "AutoSupport Chatbot Pro", vendor: "BotLabs Inc.", category: "Support",
    price: 299, rating: 4.8, reviews: 94, verified: true, featured: true, trending: false,
    deployTime: "< 5 min", description: "GPT-4 powered support agent that learns your product docs. Handles 85% of tickets automatically with human handoff.",
    tags: ["GPT-4", "Zendesk", "Slack", "API"], installs: 284
  },
  {
    id: "p3", title: "DeployKit Ultra", vendor: "CloudBridge", category: "DevOps",
    price: 189, rating: 4.9, reviews: 211, verified: true, featured: false, trending: true,
    deployTime: "< 3 min", description: "One-click CI/CD for any stack. Auto-scales, zero-downtime deploys, built-in rollback. Supports AWS, GCP, Azure.",
    tags: ["CI/CD", "Kubernetes", "AWS", "GCP"], installs: 504
  },
  {
    id: "p4", title: "SalesAI CRM Suite", vendor: "GrowthStack", category: "CRM",
    price: 399, rating: 4.7, reviews: 67, verified: true, featured: false, trending: false,
    deployTime: "< 15 min", description: "AI-powered CRM that predicts churn, auto-qualifies leads, and syncs with Salesforce, HubSpot, and Pipedrive.",
    tags: ["Salesforce", "HubSpot", "AI", "Analytics"], installs: 189
  },
  {
    id: "p5", title: "SecureVault API Gateway", vendor: "AuthGuard", category: "Security",
    price: 249, rating: 4.8, reviews: 82, verified: true, featured: false, trending: true,
    deployTime: "< 8 min", description: "Zero-trust API gateway with OAuth2, rate limiting, WAF, and full audit logging. SOC2 compliant.",
    tags: ["OAuth2", "WAF", "SOC2", "Audit"], installs: 152
  },
  {
    id: "p6", title: "Analytics Core", vendor: "MetricFlow", category: "Analytics",
    price: 149, rating: 4.6, reviews: 143, verified: false, featured: false, trending: false,
    deployTime: "< 7 min", description: "Full-stack analytics platform with real-time dashboards, funnel analysis, A/B testing, and data export.",
    tags: ["Dashboards", "A/B Testing", "SQL", "BigQuery"], installs: 398
  },
  {
    id: "p7", title: "FormFlow Builder", vendor: "NoCode Labs", category: "Forms",
    price: 79, rating: 4.4, reviews: 256, verified: true, featured: false, trending: false,
    deployTime: "< 2 min", description: "Drag-and-drop form builder with conditional logic, webhooks, payment collection, and 100+ integrations.",
    tags: ["No-code", "Webhooks", "Stripe", "Zapier"], installs: 712
  },
  {
    id: "p8", title: "LogStream Monitor", vendor: "ObserveHQ", category: "Monitoring",
    price: 99, rating: 4.6, reviews: 108, verified: true, featured: false, trending: false,
    deployTime: "< 5 min", description: "Centralized log management with real-time alerting, anomaly detection, and Slack/PagerDuty integration.",
    tags: ["Logs", "Alerts", "PagerDuty", "Grafana"], installs: 267
  },
];

const CATEGORIES = ["All", "Data", "Support", "DevOps", "CRM", "Security", "Analytics", "Forms", "Monitoring"];
const PRICE_RANGES = ["Any price", "Under $100", "$100–$300", "$300–$600", "Over $600"];
const SORT_OPTIONS = ["Trending", "Highest Rated", "Most Popular", "Price: Low to High", "Price: High to Low", "Newest"];

function StarRow({ rating, size = "w-3.5 h-3.5" }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(s => <Star key={s} className={size} style={{ color: s <= Math.round(rating) ? "hsl(var(--foreground) / 0.8)" : "rgba(150,150,150,0.15)", fill: s <= Math.round(rating) ? "hsl(var(--foreground) / 0.8)" : "none" }} />)}
    </div>
  );
}

function ProductCard({ p, inCompare, onCompare, onSave, isSaved }) {
  const [purchasing, setPurchasing] = useState(false);
  const [purchased, setPurchased] = useState(false);

  const handlePurchase = () => {
    setPurchasing(true);
    setTimeout(() => { setPurchasing(false); setPurchased(true); }, 1800);
  };

  return (
    <motion.div whileHover={{ y: -4, boxShadow: "0 20px 60px rgba(0,0,0,0.6)" }} transition={{ duration: 0.2 }}
      className="frosted-panel p-5 flex flex-col relative overflow-hidden"
    >
      {p.featured && (
        <div className="absolute top-3 left-3">
          <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest bg-foreground text-background px-2 py-1 rounded-full">
            <Award className="w-2.5 h-2.5" /> Featured
          </span>
        </div>
      )}
      <button onClick={() => onSave(p.id)} className="absolute top-3 right-3 p-2 rounded-lg text-foreground/20 hover:text-foreground/60 hover:bg-foreground/5 transition-all">
        <Heart className={`w-4 h-4 ${isSaved ? "text-foreground fill-foreground" : ""}`} />
      </button>

      <div className="mt-4 mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: "rgba(150,150,150,0.08)", border: "0.5px solid rgba(150,150,150,0.12)" }}>
          <Package className="w-5 h-5 text-foreground/50" />
        </div>
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-bold text-sm text-foreground leading-tight">{p.title}</h3>
          {p.verified && <Shield className="w-3.5 h-3.5 text-emerald-400 shrink-0" title="Deployra Verified" />}
          {p.trending && <TrendingUp className="w-3.5 h-3.5 text-amber-400 shrink-0" title="Trending" />}
        </div>
        <p className="text-[10px] font-mono text-foreground/30 mb-2">{p.vendor} · {p.category}</p>
        <p className="text-xs text-foreground/50 leading-relaxed mb-3" style={{ fontFamily: "'Inter', sans-serif" }}>{p.description}</p>

        <div className="flex flex-wrap gap-1 mb-4">
          {p.tags.slice(0, 3).map(t => (
            <span key={t} className="text-[9px] font-mono px-1.5 py-0.5 rounded-md bg-foreground/5 text-foreground/40 border border-foreground/8">{t}</span>
          ))}
        </div>

        <div className="flex items-center justify-between mb-4">
          <div>
            <StarRow rating={p.rating} />
            <span className="text-[10px] font-mono text-foreground/25 mt-0.5 block">{p.rating} · {p.reviews} reviews</span>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-[10px] font-mono text-foreground/30">
              <Zap className="w-3 h-3" /> {p.deployTime}
            </div>
            <div className="text-[10px] font-mono text-foreground/20 mt-0.5">{p.installs} deployed</div>
          </div>
        </div>
      </div>

      <div className="mt-auto">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xl font-bold metric-num" style={{ fontFamily: "Georgia, serif" }}>${p.price}</span>
          <span className="text-[10px] font-mono text-foreground/30">per deployment</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePurchase}
            disabled={purchasing || purchased}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              purchased ? "bg-emerald-400/10 text-emerald-400 border border-emerald-400/20" : "bg-foreground text-background hover:bg-foreground/90"
            } disabled:opacity-50`}
          >
            {purchasing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : purchased ? <Check className="w-3.5 h-3.5" /> : <ShoppingCart className="w-3.5 h-3.5" />}
            {purchasing ? "Processing..." : purchased ? "Purchased!" : "Purchase"}
          </button>
          <button
            onClick={() => onCompare(p.id)}
            className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${inCompare ? "bg-foreground text-background border-foreground" : "border-foreground/10 text-foreground/40 hover:text-foreground hover:border-foreground/25"}`}
            title="Add to compare"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function ClientMarketplace() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [priceRange, setPriceRange] = useState("Any price");
  const [sortBy, setSortBy] = useState("Trending");
  const [compareList, setCompareList] = useState([]);
  const [savedList, setSavedList] = useState([]);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const toggleCompare = (id) => {
    setCompareList(p => p.includes(id) ? p.filter(i => i !== id) : p.length < 3 ? [...p, id] : p);
  };
  const toggleSave = (id) => {
    setSavedList(p => p.includes(id) ? p.filter(i => i !== id) : [...p, id]);
  };

  const filtered = PRODUCTS.filter(p => {
    const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.vendor.toLowerCase().includes(search.toLowerCase()) || p.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
    const matchCat = category === "All" || p.category === category;
    const matchVerified = !verifiedOnly || p.verified;
    const matchPrice =
      priceRange === "Any price" ? true :
      priceRange === "Under $100" ? p.price < 100 :
      priceRange === "$100–$300" ? p.price >= 100 && p.price <= 300 :
      priceRange === "$300–$600" ? p.price > 300 && p.price <= 600 :
      p.price > 600;
    return matchSearch && matchCat && matchVerified && matchPrice;
  }).sort((a, b) => {
    if (sortBy === "Highest Rated") return b.rating - a.rating;
    if (sortBy === "Most Popular") return b.installs - a.installs;
    if (sortBy === "Price: Low to High") return a.price - b.price;
    if (sortBy === "Price: High to Low") return b.price - a.price;
    return (b.trending ? 1 : 0) - (a.trending ? 1 : 0);
  });

  const featured = filtered.filter(p => p.featured);
  const rest = filtered.filter(p => !p.featured);

  return (
    <div className="p-6 sm:p-8 max-w-6xl page-fade-in">

      {/* Header */}
      <div className="mb-8">
        <div className="stat-label-caps mb-2">Business Hub · Marketplace</div>
        <h1 className="text-white font-bold text-2xl sm:text-3xl section-title-gradient" style={{ fontFamily: "Georgia, serif", letterSpacing: "-0.04em" }}>
          Discover Products
        </h1>
        <p className="text-sm mt-1.5" style={{ color: "hsl(var(--foreground) / 0.35)", fontFamily: "'Inter', sans-serif" }}>
          {PRODUCTS.length} verified deployable systems. Purchase, deploy, and run in minutes.
        </p>
      </div>

      {/* Search + Filters Bar */}
      <div className="flex flex-col gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: "rgba(150,150,150,0.05)", border: "0.5px solid rgba(150,150,150,0.1)" }}>
            <Search className="w-4 h-4 text-foreground/30 shrink-0" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search products, vendors, or technologies..."
              className="flex-1 bg-transparent text-sm text-foreground placeholder-foreground/25 outline-none"
              style={{ fontFamily: "'Inter', sans-serif" }}
            />
            {search && <button onClick={() => setSearch("")} className="p-1 text-foreground/30 hover:text-foreground"><X className="w-3.5 h-3.5" /></button>}
          </div>
          <button onClick={() => setShowFilters(p => !p)} className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold border transition-all ${showFilters ? "bg-foreground/8 border-foreground/20 text-foreground" : "border-foreground/10 text-foreground/40 hover:text-foreground hover:bg-foreground/5"}`}>
            <SlidersHorizontal className="w-4 h-4" />
            Filters
          </button>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 premium-scroll">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCategory(c)}
              className={`px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-all ${category === c ? "bg-foreground text-background" : "bg-foreground/5 text-foreground/40 hover:text-foreground border border-foreground/8"}`}
            >
              {c}
            </button>
          ))}
          <div className="flex items-center gap-1.5 ml-2 pl-2" style={{ borderLeft: "0.5px solid rgba(150,150,150,0.1)" }}>
            <button onClick={() => setVerifiedOnly(p => !p)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all ${verifiedOnly ? "bg-emerald-400/10 text-emerald-400 border border-emerald-400/20" : "bg-foreground/5 text-foreground/40 border border-foreground/8"}`}
            >
              <Shield className="w-3 h-3" />
              Verified Only
            </button>
          </div>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: "hidden" }}>
              <div className="flex flex-wrap gap-3 p-4 rounded-xl" style={{ background: "rgba(150,150,150,0.03)", border: "0.5px solid rgba(150,150,150,0.08)" }}>
                <div>
                  <label className="stat-label-caps mb-1.5 block">Price Range</label>
                  <div className="flex gap-1 flex-wrap">
                    {PRICE_RANGES.map(r => <button key={r} onClick={() => setPriceRange(r)} className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${priceRange === r ? "bg-foreground text-background" : "bg-foreground/5 text-foreground/40 border border-foreground/8 hover:text-foreground"}`}>{r}</button>)}
                  </div>
                </div>
                <div className="ml-auto">
                  <label className="stat-label-caps mb-1.5 block">Sort By</label>
                  <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="px-3 py-2 rounded-lg text-xs font-semibold border border-foreground/10 bg-transparent text-foreground/60 outline-none">
                    {SORT_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Compare Bar */}
      <AnimatePresence>
        {compareList.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} className="frosted-panel p-3.5 mb-5 flex items-center gap-3">
            <SlidersHorizontal className="w-4 h-4 text-foreground/50" />
            <span className="text-xs font-semibold text-foreground/60">Comparing: {compareList.map(id => PRODUCTS.find(p => p.id === id)?.title).join(" vs ")}</span>
            <button onClick={() => setCompareList([])} className="ml-auto p-1 text-foreground/30 hover:text-foreground">
              <X className="w-3.5 h-3.5" />
            </button>
            <button className="px-4 py-1.5 rounded-lg text-xs font-bold bg-foreground text-background hover:bg-foreground/90 transition-all">
              Compare Now
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Featured Section */}
      {featured.length > 0 && (
        <>
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-4 h-4 text-foreground/40" />
            <h2 className="text-white font-bold text-sm" style={{ fontFamily: "Georgia, serif" }}>Featured Products</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {featured.map((p, i) => (
              <motion.div key={p.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                <ProductCard p={p} inCompare={compareList.includes(p.id)} onCompare={toggleCompare} onSave={toggleSave} isSaved={savedList.includes(p.id)} />
              </motion.div>
            ))}
          </div>
        </>
      )}

      {/* All Products */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white font-bold text-sm" style={{ fontFamily: "Georgia, serif" }}>
          {filtered.length} Products
          {search && <span className="text-foreground/30 font-normal ml-2">matching "{search}"</span>}
        </h2>
      </div>

      {filtered.length === 0 ? (
        <div className="frosted-panel p-12 text-center">
          <Package className="w-10 h-10 mx-auto mb-3 text-foreground/15" />
          <p className="text-sm font-semibold text-foreground/40">No products match your filters</p>
          <p className="text-xs text-foreground/25 mt-1">Try adjusting your search or category filter.</p>
          <button onClick={() => { setSearch(""); setCategory("All"); setVerifiedOnly(false); setPriceRange("Any price"); }} className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold border border-foreground/10 text-foreground/50 hover:text-foreground hover:bg-foreground/5">
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rest.map((p, i) => (
            <motion.div key={p.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 + (featured.length ? 0.3 : 0) }}>
              <ProductCard p={p} inCompare={compareList.includes(p.id)} onCompare={toggleCompare} onSave={toggleSave} isSaved={savedList.includes(p.id)} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
