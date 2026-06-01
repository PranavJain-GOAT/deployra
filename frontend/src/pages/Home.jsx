import { useState, useEffect, useMemo, useRef } from "react";
import { Search, X, Package, Layers, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import SearchFiltersBar from "../components/home/SearchFiltersBar";
import { useMarketplaceProducts } from "@/hooks/useMarketplace";

import HeroSection from "../components/home/HeroSection";
import ModeSwitch from "../components/home/ModeSwitch";
import MarketplaceFilter from "../components/home/MarketplaceFilter";
import ProductCard from "../components/home/ProductCard";
import CustomCard from "../components/home/CustomCard";
import UseCasesSection from "../components/home/UseCasesSection";
import TrustSection from "../components/home/TrustSection";
import HowWorksSection from "../components/home/HowWorksSection";
import WhyBusinessesSection from "../components/home/WhyBusinessesSection";
import DeveloperCTA from "../components/home/DeveloperCTA";
import WordReveal from "../components/home/WordReveal";
import { MarketplaceSkeletons } from "../components/home/MarketplaceSkeleton";

const CATEGORY_IMAGES = {
  chatbot: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&q=80",
  automation: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80",
  website: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&q=80",
  analytics: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80",
  marketing: "https://images.unsplash.com/photo-1535378917042-10a22c95931a?w=600&q=80",
  other: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&q=80",
};

/* ── Dropdown filter pill ────────────────────────────────────── */
function FilterDropdown({ label, options, value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const active = !!value;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold border transition-all whitespace-nowrap ${
          active
            ? "bg-white text-black border-white"
            : "glass text-white/60 border-white/15 hover:text-white hover:border-white/30"
        }`}
        style={{ letterSpacing: "-0.01em" }}
      >
        {active ? value : label}
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full mt-2 left-0 z-50 rounded-2xl overflow-hidden min-w-[160px]"
            style={{
              background: "rgba(12,12,12,0.97)",
              border: "0.5px solid rgba(255,255,255,0.1)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.8)",
              backdropFilter: "blur(20px)",
            }}
          >
            {active && (
              <button
                onClick={() => { onChange(""); setOpen(false); }}
                className="w-full text-left px-4 py-2.5 text-xs text-white/30 hover:text-white hover:bg-white/5 transition-colors border-b border-white/6 flex items-center gap-2"
              >
                <X className="w-3 h-3" /> Clear
              </button>
            )}
            {options.map((opt) => (
              <button
                key={opt}
                onClick={() => { onChange(value === opt ? "" : opt); setOpen(false); }}
                className={`w-full text-left px-4 py-2.5 text-xs font-medium transition-colors ${
                  value === opt
                    ? "text-white bg-white/10"
                    : "text-white/50 hover:text-white hover:bg-white/5"
                }`}
                style={{ letterSpacing: "-0.01em" }}
              >
                {opt}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Sort dropdown ───────────────────────────────────────────── */
function SortDropdown({ value, onChange }) {
  const options = ["Relevance", "Price: Low to High", "Price: High to Low", "Newest"];
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-xs font-mono text-white/40 hover:text-white transition-colors"
      >
        Sort by: <span className="text-white font-semibold">{value}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full mt-2 right-0 z-50 rounded-2xl overflow-hidden min-w-[200px]"
            style={{
              background: "rgba(12,12,12,0.97)",
              border: "0.5px solid rgba(255,255,255,0.1)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.8)",
              backdropFilter: "blur(20px)",
            }}
          >
            {options.map((opt) => (
              <button
                key={opt}
                onClick={() => { onChange(opt); setOpen(false); }}
                className={`w-full text-left px-4 py-2.5 text-xs font-medium transition-colors ${
                  value === opt ? "text-white bg-white/10" : "text-white/50 hover:text-white hover:bg-white/5"
                }`}
              >
                {opt}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Search result card ──────────────────────────────────────── */
function SearchResultCard({ item, type, index }) {
  const isProduct = type === "product" || item.price !== undefined;
  const price = `$${item.price}`;
  const to = `/product/${item.id}`;
  const imageUrl = (item.images && item.images.length > 0 ? item.images[0] : null) || item.image_url;
  const img = imageUrl || CATEGORY_IMAGES[item.category] || CATEGORY_IMAGES.other;
  const developerName = item.developer?.name || item.seller_name || "AlphaDev";
  const rating = item.rating || 5.0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 80,
        damping: 17,
        delay: Math.min(index, 8) * 0.04
      }}
    >
      <Link to={to} className="group block h-full">
        <div className="rounded-xl overflow-hidden flex flex-col h-full bg-white/[0.02] border border-white/5 hover:border-white/15 transition-all duration-300">
          <div className="relative aspect-[16/10] overflow-hidden shrink-0">
            <img
              src={img}
              alt={item.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10">
                    <span className="text-white text-lg">♡</span>
                </div>
            </div>
          </div>
          
          <div className="p-4 flex flex-col flex-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-full bg-white/10 overflow-hidden border border-white/10">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${developerName}`} alt="avatar" />
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-white hover:underline leading-none">{developerName}</span>
                <span className="text-[9px] text-white/30 font-mono">Level 2 Seller</span>
              </div>
            </div>

            <h3 className="text-white text-[14px] leading-tight mb-2 line-clamp-2 font-medium group-hover:text-white/80 transition-colors">
              {item.title}
            </h3>

            <div className="flex items-center gap-1 mb-4">
              <span className="text-white text-xs font-bold">★ {rating.toFixed(1)}</span>
              <span className="text-white/20 text-[11px]">({item.reviewCount || 0})</span>
            </div>

            <div className="mt-auto pt-3 border-t border-white/5 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[10px] text-white/30 font-bold uppercase tracking-tight">Starting at</span>
                <span className="text-white font-bold text-base leading-none">{price}</span>
              </div>
              {item.badge && (
                <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] font-bold text-white/40 uppercase">{item.badge}</span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════════ */

export default function Home() {
  const [mode, setMode] = useState("instant");
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({ category: "", price: "", setupTime: "" });

  const [searchFilters, setSearchFilters] = useState({
    category: "",
    serviceOptions: [],
    devLevel: [],
    budget: "",
    setupTime: "",
    verifiedOnly: false,
    hasDemo: false,
  });
  const [sortBy, setSortBy] = useState("Relevance");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("search");
    if (q) setSearchQuery(q);
  }, []);

  const backendSortBy = useMemo(() => {
    if (sortBy === "Price: Low to High") return "price-asc";
    if (sortBy === "Price: High to Low") return "price-desc";
    if (sortBy === "Newest") return "newest";
    return undefined;
  }, [sortBy]);

  // Dynamic loading of products from backend
  const { data: marketplaceData, isLoading: loading } = useMarketplaceProducts({
    search: searchQuery || undefined,
    category: searchQuery ? (searchFilters.category || undefined) : (filters.category || undefined),
    sortBy: backendSortBy,
    limit: 100
  });

  const dbProducts = useMemo(() => {
    return marketplaceData?.data || [];
  }, [marketplaceData]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  /* Normal filtered lists (homepage) */
  const filteredProducts = useMemo(() => {
    let items = dbProducts;
    if (filters.price) {
      if (filters.price === "Under $50") items = items.filter((p) => p.price < 50);
      else if (filters.price === "$50–$200") items = items.filter((p) => p.price >= 50 && p.price <= 200);
      else if (filters.price === "$200+") items = items.filter((p) => p.price > 200);
    }
    return items;
  }, [dbProducts, filters.price]);

  const filteredCustom = useMemo(() => {
    let items = dbProducts;
    if (filters.price) {
      if (filters.price === "Under $50") items = items.filter((p) => p.price < 50);
      else if (filters.price === "$50–$200") items = items.filter((p) => p.price >= 50 && p.price <= 200);
      else if (filters.price === "$200+") items = items.filter((p) => p.price > 200);
    }
    return items;
  }, [dbProducts, filters.price]);

  /* Search results */
  const displayedResults = useMemo(() => {
    const { budget } = searchFilters;
    let items = [...dbProducts];
    if (budget === "value") items = items.filter((r) => r.price < 50);
    else if (budget === "mid") items = items.filter((r) => r.price >= 50 && r.price <= 200);
    else if (budget === "high") items = items.filter((r) => r.price > 200);
    return items;
  }, [dbProducts, searchFilters]);

  const clearAll = () => {
    setSearchQuery("");
    setSearchFilters({ category: "", serviceOptions: [], devLevel: [], budget: "", setupTime: "", verifiedOnly: false, hasDemo: false });
    setSortBy("Relevance");
    window.history.replaceState({}, "", "/");
  };

  if (loading) return (
    <div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <MarketplaceSkeletons />
      </div>
    </div>
  );

  /* ════════ SEARCH RESULTS VIEW ════════ */
  if (searchQuery.trim()) {
    return (
      <div className="min-h-screen">
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-24">

          {/* Heading */}
          <div className="mb-6">
            <p className="text-white/30 text-sm font-mono mb-1">Results for</p>
            <div className="flex items-center gap-3 flex-wrap">
              <h1
                className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2"
                style={{ fontFamily: "Georgia, serif", letterSpacing: "-0.04em" }}
              >
                Results for <span className="text-white/90">"{searchQuery}"</span>
              </h1>
              <button
                onClick={clearAll}
                className="flex items-center gap-1 text-xs font-mono text-white/30 hover:text-white border border-white/10 hover:border-white/30 rounded-full px-3 py-1 transition-all"
              >
                <X className="w-3 h-3" /> Clear
              </button>
            </div>
          </div>

          {/* Fiverr-style filter bar */}
          <div className="mb-4">
            <SearchFiltersBar
              filters={searchFilters}
              onFiltersChange={setSearchFilters}
              results={dbProducts}
            />
          </div>
          {/* Sort row */}
          <div className="flex items-center justify-between mb-3">
            <div />
            <div className="flex items-center gap-1.5 text-xs font-mono text-white/40">
              Sort by:
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-white font-semibold text-xs border-none focus:outline-none cursor-pointer"
              >
                {["Relevance","Price: Low to High","Price: High to Low","Newest"].map((o) => (
                  <option key={o} value={o} className="bg-[#0e0e0e]">{o}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Result count + type breakdown */}
          <div className="flex items-center gap-4 text-[11px] font-mono text-white/25 mb-6">
            <span>{displayedResults.length} result{displayedResults.length !== 1 ? "s" : ""}</span>
          </div>

          {/* Grid */}
          {displayedResults.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-28 glass rounded-3xl"
            >
              <Search className="w-10 h-10 mx-auto mb-4 text-white/10" />
              <p className="text-white font-semibold text-lg mb-1" style={{ fontFamily: "Georgia, serif" }}>
                No results for "{searchQuery}"
              </p>
              <p className="text-white/30 text-sm font-mono">Try adjusting your filters or search again</p>
              {Object.values(searchFilters).some((v) => (Array.isArray(v) ? v.length > 0 : !!v)) && (
                <button
                  onClick={() => setSearchFilters({ category: "", serviceOptions: [], devLevel: [], budget: "", setupTime: "", verifiedOnly: false, hasDemo: false })}
                  className="mt-4 text-xs font-mono text-white/40 hover:text-white underline transition-colors"
                >
                  Clear all filters
                </button>
              )}
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {displayedResults.map((item, i) => (
                <SearchResultCard key={`product-${item.id}`} item={item} type="product" index={i} />
              ))}
            </div>
          )}
        </section>
      </div>
    );
  }

  /* ════════ NORMAL HOMEPAGE ════════ */
  return (
    <div>
      <HeroSection />
      <HowWorksSection />
      <WhyBusinessesSection />
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24" id="instant">
        <ModeSwitch mode={mode} onModeChange={setMode} />
        <MarketplaceFilter
          filters={filters}
          onFilterChange={handleFilterChange}
        />

        {mode === "instant" ? (
          <div>
            <div className="flex items-center justify-between mb-8">
              <div>
                <WordReveal text="Instant Setup" tag="h2" className="text-white font-bold text-3xl sm:text-4xl" style={{ fontFamily: "Georgia,serif", letterSpacing: "-0.04em" }} />
                <p className="text-white/30 text-sm mt-1 font-mono">Install and go live in minutes</p>
              </div>
              <span className="text-white/20 text-xs font-mono">{filteredProducts.length} SOLUTIONS</span>
            </div>
            {filteredProducts.length === 0 ? (
              <div className="text-center py-20 glass rounded-3xl">
                <p className="text-white font-semibold text-lg mb-1" style={{ fontFamily: "Georgia,serif" }}>No products found</p>
                <p className="text-white/30 text-sm font-mono">Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProducts.slice(0, 1).map((p) => (
                  <div key={p.id} className="sm:col-span-2 lg:col-span-3">
                    <ProductCard product={p} index={0} featured />
                  </div>
                ))}
                {filteredProducts.slice(1).map((p, i) => (
                  <ProductCard key={p.id} product={p} index={i + 1} />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div id="custom">
            <div className="flex items-center justify-between mb-8">
              <div>
                <WordReveal text="Custom Solutions" tag="h2" className="text-white font-bold text-3xl sm:text-4xl" style={{ fontFamily: "Georgia,serif", letterSpacing: "-0.04em" }} />
                <p className="text-white/30 text-sm mt-1 font-mono">Developer-built, tailored to your needs</p>
              </div>
              <span className="text-white/20 text-xs font-mono">{filteredCustom.length} SOLUTIONS</span>
            </div>
            {filteredCustom.length === 0 ? (
              <div className="text-center py-20 glass rounded-3xl">
                <p className="text-white font-semibold text-lg mb-1" style={{ fontFamily: "Georgia,serif" }}>No custom solutions found</p>
                <p className="text-white/30 text-sm font-mono">Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCustom.map((s, i) => (
                  <CustomCard key={s.id} solution={s} index={i} />
                ))}
              </div>
            )}
          </div>
        )}
      </section>
      <UseCasesSection />
      <TrustSection />
      <DeveloperCTA />
    </div>
  );
}