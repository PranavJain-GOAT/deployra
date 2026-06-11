import { useState, useEffect, useRef } from "react";
import { Search, Star, Command, Package, Layers, ArrowUpRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { useTheme } from "@/lib/ThemeContext";
import { MOCK_PRODUCTS, MOCK_CUSTOM_SOLUTIONS } from "@/api/mockData";
import axios from "axios";
import { API_URL } from "@/lib/config";

/* ── Fuzzy scorer ──────────────────────────────────────────
   Returns a score 0–100 for how well a product matches query.
──────────────────────────────────────────────────────────── */
function scoreProduct(p, terms) {
  const fields = [
    (p.title        || "").toLowerCase(),
    (p.description  || "").toLowerCase(),
    (p.category     || "").toLowerCase(),
    (p.what_it_does || "").toLowerCase(),
    ...(p.features    || []).map(f => f.toLowerCase()),
    ...(p.who_its_for || []).map(f => f.toLowerCase()),
  ];
  const blob = fields.join(" ");
  let score = 0;
  for (const term of terms) {
    if (!term) continue;
    if ((p.title || "").toLowerCase().includes(term)) score += 50;
    if (blob.includes(term)) score += 20;
    const words = blob.split(/\s+/);
    if (words.some(w => w.startsWith(term))) score += 10;
  }
  return score;
}

export default function LiveSearch() {
  const [query, setQuery]           = useState("");
  const [results, setResults]       = useState({ products: [], custom: [] });
  const [open, setOpen]             = useState(false);
  const [allProducts, setAllProducts]   = useState([]);
  const [allCustom, setAllCustom]       = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const inputRef     = useRef(null);
  const containerRef = useRef(null);
  const { isDark }   = useTheme();

  /* ── Load all products once on mount ───────────────────
     Same pattern as Home.jsx:
     - If placeholder env → use mock data
     - Else fetch from API; fall back to mock if empty/error
  ──────────────────────────────────────────────────────── */
  useEffect(() => {
    // Load mock data instantly to enable search function immediately
    setAllProducts(MOCK_PRODUCTS);
    setAllCustom(MOCK_CUSTOM_SOLUTIONS);
    setDataLoaded(true);

    const loadProducts = async () => {
      try {
        const res = await axios.get(`${API_URL}/products/public`);
        const data = res.data?.data || [];
        const mapped = data.map(p => ({
          id: p.id,
          title: p.title,
          description: p.description,
          category: p.category || 'Other',
          price: p.price,
          rating: p.rating || 5.0,
          image_url: p.coverImage || undefined,
          demo_url: p.demoUrl || undefined,
          features: p.features || [],
          what_it_does: p.shortDesc || p.description
        }));
        setAllProducts([...mapped, ...MOCK_PRODUCTS]);
      } catch (err) {
        console.error("Failed to load products in search dropdown:", err.message);
      }
    };

    loadProducts();
  }, []);

  /* ── Keyboard shortcuts ─────────────────────────────── */
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
      if (e.key === "Escape") { setOpen(false); setQuery(""); }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  /* ── Click outside ──────────────────────────────────── */
  useEffect(() => {
    const onOut = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target))
        setOpen(false);
    };
    document.addEventListener("mousedown", onOut);
    return () => document.removeEventListener("mousedown", onOut);
  }, []);

  /* ── Search logic ───────────────────────────────────── */
  const handleInput = (val) => {
    setQuery(val);
    const q = val.trim().toLowerCase();
    if (!q) { setResults({ products: [], custom: [] }); setOpen(false); return; }

    const terms = q.split(/\s+/);

    const rankAndSlice = (list, maxItems = 4) =>
      list
        .map(p => ({ ...p, _score: scoreProduct(p, terms) }))
        .filter(p => p._score > 0)
        .sort((a, b) => b._score - a._score)
        .slice(0, maxItems);

    const products = rankAndSlice(allProducts);
    const custom   = rankAndSlice(allCustom);

    setResults({ products, custom });
    setOpen(products.length > 0 || custom.length > 0);
  };

  const totalResults = results.products.length + results.custom.length;

  /* ── Result row ─────────────────────────────────────── */
  const ResultRow = ({ p, to, tag }) => (
    <Link
      to={to}
      onClick={() => { setOpen(false); setQuery(""); }}
      className={`flex items-center gap-3 px-4 py-3 transition-colors border-b last:border-0 ${
        isDark
          ? "hover:bg-white/5 border-white/5"
          : "hover:bg-black/4 border-black/6"
      }`}
    >
      <div className={`w-10 h-10 rounded-lg overflow-hidden shrink-0 flex items-center justify-center ${isDark ? "bg-white/5" : "bg-black/5"}`}>
        {p.image_url ? (
          <img src={p.image_url} alt={p.title} className="w-full h-full object-cover opacity-80" />
        ) : tag === "product" ? (
          <Package className={`w-4 h-4 ${isDark ? "text-white/20" : "text-neutral-300"}`} />
        ) : (
          <Layers className={`w-4 h-4 ${isDark ? "text-white/20" : "text-neutral-300"}`} />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div
          className={`text-sm font-semibold truncate ${isDark ? "text-white" : "text-neutral-900"}`}
          style={{ fontFamily: "Georgia, serif" }}
        >
          {p.title}
        </div>
        <div className={`text-xs truncate font-mono ${isDark ? "text-white/30" : "text-neutral-400"}`}>
          {p.category}
        </div>
      </div>
      <div className="shrink-0 text-right">
        <div
          className={`font-bold text-sm ${isDark ? "text-white" : "text-neutral-900"}`}
          style={{ fontFamily: "Georgia, serif" }}
        >
          {tag === "product"
            ? `$${p.price}`
            : p.price_min === p.price_max
              ? `$${p.price_min}`
              : `$${p.price_min}–$${p.price_max}`}
        </div>
        {p.rating && (
          <div className="flex items-center gap-1 justify-end">
            <Star className="w-2.5 h-2.5 text-yellow-400 fill-yellow-400" />
            <span className={`text-xs font-mono ${isDark ? "text-white/30" : "text-neutral-400"}`}>
              {p.rating}
            </span>
          </div>
        )}
      </div>
    </Link>
  );

  const SectionLabel = ({ icon: Icon, label, count }) => (
    <div
      className={`flex items-center gap-2 px-4 pt-3 pb-1 text-[10px] font-mono uppercase tracking-widest ${
        isDark ? "text-white/40 bg-black/40" : "text-neutral-400 bg-black/3"
      }`}
    >
      <Icon className="w-3 h-3" />
      {label}
      <span className="ml-auto opacity-60">{count}</span>
    </div>
  );

  const dropdownStyle = {
    background:           isDark ? "rgba(12,12,12,0.95)" : "rgba(250,250,250,0.97)",
    border:               isDark ? "0.5px solid rgba(255,255,255,0.1)"  : "0.5px solid rgba(0,0,0,0.1)",
    borderTop:            isDark ? "0.5px solid rgba(255,255,255,0.2)" : "0.5px solid rgba(0,0,0,0.15)",
    backdropFilter:       "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    boxShadow:            isDark ? "0 24px 80px rgba(0,0,0,0.8)" : "0 12px 40px rgba(0,0,0,0.12)",
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-xl mx-auto">
      {/* Input */}
      <div className="relative">
        <Search
          className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${
            isDark ? "text-white/30" : "text-neutral-400"
          }`}
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleInput(e.target.value)}
          onFocus={() => query && setOpen(totalResults > 0)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && query.trim()) {
              window.location.href = `/?search=${encodeURIComponent(query.trim())}`;
              setOpen(false);
            }
          }}
          placeholder={dataLoaded ? "Search AI solutions..." : "Loading products…"}
          disabled={!dataLoaded}
          className={`w-full pl-11 pr-24 py-3.5 rounded-2xl text-sm focus:outline-none transition-all shadow-[0_8px_32px_rgba(0,0,0,0.4)] ${
            isDark
              ? "text-white placeholder:text-white/25"
              : "text-neutral-900 placeholder:text-neutral-400"
          }`}
          style={{
            background:           isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
            border:               isDark ? "0.5px solid rgba(255,255,255,0.1)"  : "0.5px solid rgba(0,0,0,0.1)",
            borderTop:            isDark ? "0.5px solid rgba(255,255,255,0.25)" : "0.5px solid rgba(0,0,0,0.18)",
            backdropFilter:       "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
          }}
        />
        <div
          className={`absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-3`}
        >
          {query.trim() && (
            <button 
              onClick={() => window.location.href = `/?search=${encodeURIComponent(query.trim())}`}
              className={`p-1.5 rounded-lg transition-colors ${isDark ? "bg-white/10 hover:bg-white/20 text-white" : "bg-black/5 hover:bg-black/10 text-black"}`}
            >
              <Search className="w-3.5 h-3.5" />
            </button>
          )}
          <div className={`flex items-center gap-1 text-xs font-mono pointer-events-none ${isDark ? "text-white/20" : "text-neutral-400"}`}>
            <Command className="w-3 h-3" />K
          </div>
        </div>
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {open && totalResults > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="absolute top-full mt-2 left-0 right-0 z-50 rounded-2xl overflow-hidden"
            style={dropdownStyle}
          >
            {results.products.length > 0 && (
              <>
                <SectionLabel icon={Package} label="Marketplace Products" count={results.products.length} />
                {results.products.map(p => (
                  <ResultRow key={p.id} p={p} to={`/product/${p.id}`} tag="product" />
                ))}
              </>
            )}

            {results.custom.length > 0 && (
              <>
                <SectionLabel icon={Layers} label="Custom Solutions" count={results.custom.length} />
                {results.custom.map(p => (
                  <ResultRow key={p.id} p={p} to={`/custom/${p.id}`} tag="custom" />
                ))}
              </>
            )}

            <Link
              to={`/?search=${encodeURIComponent(query.trim())}`}
              onClick={() => { setOpen(false); setQuery(""); }}
              className={`border-t flex items-center justify-between px-4 py-3 transition-colors group ${
                isDark
                  ? "border-white/8 bg-black/40 hover:bg-white/5"
                  : "border-black/6 bg-neutral-50 hover:bg-neutral-100"
              }`}
            >
              <span className={`text-[11px] font-semibold transition-colors ${
                isDark ? "text-white/50 group-hover:text-white" : "text-neutral-500 group-hover:text-neutral-900"
              }`}>
                View all {totalResults} result{totalResults !== 1 ? "s" : ""} for “{query}”
              </span>
              <ArrowUpRight className={`w-3.5 h-3.5 transition-colors ${
                isDark ? "text-white/25 group-hover:text-white" : "text-neutral-400 group-hover:text-neutral-900"
              }`} />
            </Link>
          </motion.div>
        )}

        {/* No results */}
        {open && query.trim() && totalResults === 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="absolute top-full mt-2 left-0 right-0 z-50 rounded-2xl overflow-hidden px-6 py-8 text-center"
            style={dropdownStyle}
          >
            <Search className={`w-8 h-8 mx-auto mb-3 ${isDark ? "text-white/15" : "text-neutral-300"}`} />
            <p className={`text-sm font-medium ${isDark ? "text-white/40" : "text-neutral-500"}`}>
              No results for "<span className="font-semibold">{query}</span>"
            </p>
            <p className={`text-xs mt-1 font-mono ${isDark ? "text-white/20" : "text-neutral-400"}`}>
              Try "chatbot", "booking", "SEO", "inventory"…
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}