import { useState, useRef, useEffect } from "react";
import { 
  ChevronDown, 
  Check, 
  MessageSquare, 
  Zap, 
  Globe, 
  BarChart3, 
  Target, 
  Grid2X2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const CATEGORIES = [
  { id: "chatbot", label: "Chatbots", icon: MessageSquare },
  { id: "automation", label: "Automation", icon: Zap },
  { id: "website", label: "SaaS Kits", icon: Globe },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "marketing", label: "Marketing", icon: Target },
  { id: "other", label: "Other", icon: Grid2X2 },
];

/* ── shared dropdown shell ──────────────────────────────────── */
function DropPanel({ label, active, children, onClear }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-semibold border transition-all whitespace-nowrap ${
          active
            ? "bg-white text-black border-white"
            : "glass text-white/70 border-white/10 hover:text-white hover:border-white/20"
        }`}
      >
        {label} <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full mt-2 left-0 z-50 rounded-2xl overflow-hidden w-64 glass-dark border border-white/10 shadow-2xl backdrop-blur-2xl"
          >
            <div className="p-4 space-y-4">{children}</div>
            <div className="flex items-center justify-between px-4 py-3 border-t border-white/5 bg-white/[0.02]">
              <button onClick={onClear} className="text-xs text-white/30 hover:text-white transition-colors">Clear all</button>
              <button onClick={() => setOpen(false)} className="px-4 py-1.5 rounded-lg bg-white text-black text-xs font-bold">Apply</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function MarketplaceFilter({ filters, onFilterChange }) {
  return (
    <div className="mb-12 space-y-8">
      {/* Categories Row */}
      <div className="flex items-center justify-between gap-8 border-b border-white/5 pb-8 overflow-x-auto no-scrollbar">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onFilterChange("category", filters.category === cat.id ? "" : cat.id)}
            className={`flex flex-col items-center gap-3 group transition-all shrink-0 ${
              filters.category === cat.id ? "text-white" : "text-white/40 hover:text-white"
            }`}
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
              filters.category === cat.id ? "bg-white/10 border border-white/20" : "bg-white/[0.02] border border-white/5 group-hover:bg-white/5"
            }`}>
              <cat.icon className={`w-6 h-6 ${filters.category === cat.id ? "text-white" : "text-white/40 group-hover:text-white"}`} />
            </div>
            <span className="text-xs font-bold tracking-tight">{cat.label}</span>
            {filters.category === cat.id && (
              <motion.div layoutId="cat-underline" className="h-0.5 w-full bg-white rounded-full mt-1" />
            )}
          </button>
        ))}
      </div>

      {/* Filter Row */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3 flex-1 min-w-[300px]">

          <div className="flex items-center gap-2 flex-wrap">
            <DropPanel 
              label={filters.serviceOptions?.length ? `Service options (${filters.serviceOptions.length})` : "Service options"} 
              active={!!filters.serviceOptions?.length}
              onClear={() => onFilterChange("serviceOptions", [])}
            >
             <div className="space-y-3">
               {["Instant Setup", "Custom Solution", "Verified Dev"].map(opt => (
                 <label key={opt} className="flex items-center gap-3 cursor-pointer group">
                   <div 
                    onClick={() => {
                      const current = filters.serviceOptions || [];
                      const next = current.includes(opt) ? current.filter(x => x !== opt) : [...current, opt];
                      onFilterChange("serviceOptions", next);
                    }}
                    className={`w-4 h-4 rounded border transition-all flex items-center justify-center ${
                      filters.serviceOptions?.includes(opt) ? "bg-white border-white" : "border-white/20 group-hover:border-white/40"
                    }`}
                   >
                     {filters.serviceOptions?.includes(opt) && <Check className="w-3 h-3 text-black" strokeWidth={3} />}
                   </div>
                   <span className={`text-sm transition-colors ${filters.serviceOptions?.includes(opt) ? "text-white" : "text-white/60 group-hover:text-white"}`}>{opt}</span>
                 </label>
               ))}
             </div>
          </DropPanel>

          <DropPanel 
            label={filters.devLevel?.length ? `Developer (${filters.devLevel.length})` : "Developer Level"} 
            active={!!filters.devLevel?.length}
            onClear={() => onFilterChange("devLevel", [])}
          >
             <div className="space-y-3">
               {["Top Rated", "Verified", "Pro"].map(opt => (
                 <label key={opt} className="flex items-center gap-3 cursor-pointer group">
                   <div 
                    onClick={() => {
                      const current = filters.devLevel || [];
                      const next = current.includes(opt) ? current.filter(x => x !== opt) : [...current, opt];
                      onFilterChange("devLevel", next);
                    }}
                    className={`w-4 h-4 rounded border transition-all flex items-center justify-center ${
                      filters.devLevel?.includes(opt) ? "bg-white border-white" : "border-white/20 group-hover:border-white/40"
                    }`}
                   >
                     {filters.devLevel?.includes(opt) && <Check className="w-3 h-3 text-black" strokeWidth={3} />}
                   </div>
                   <span className={`text-sm transition-colors ${filters.devLevel?.includes(opt) ? "text-white" : "text-white/60 group-hover:text-white"}`}>{opt}</span>
                 </label>
               ))}
             </div>
          </DropPanel>

          <DropPanel label={filters.price || "Budget"} active={!!filters.price} onClear={() => onFilterChange("price", "")}>
             <div className="space-y-1">
               {["Under $50", "$50–$200", "$200+"].map(opt => (
                 <button 
                  key={opt}
                  onClick={() => onFilterChange("price", filters.price === opt ? "" : opt)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all ${filters.price === opt ? "bg-white/10 text-white font-bold" : "text-white/40 hover:bg-white/5 hover:text-white"}`}
                 >
                   {opt}
                 </button>
               ))}
             </div>
          </DropPanel>

          <DropPanel label={filters.setupTime || "Setup Time"} active={!!filters.setupTime} onClear={() => onFilterChange("setupTime", "")}>
             <div className="space-y-1">
               {["Under 5 min", "Under 1 hour", "Same day"].map(opt => (
                 <button 
                  key={opt}
                  onClick={() => onFilterChange("setupTime", filters.setupTime === opt ? "" : opt)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all ${filters.setupTime === opt ? "bg-white/10 text-white font-bold" : "text-white/40 hover:bg-white/5 hover:text-white"}`}
                 >
                   {opt}
                 </button>
               ))}
             </div>
          </DropPanel>
        </div>
      </div>

      {/* Right Toggles */}
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-3 cursor-pointer group">
            <div 
              onClick={() => onFilterChange("proOnly", !filters.proOnly)}
              className={`relative w-10 h-5 rounded-full transition-all ${filters.proOnly ? "bg-white" : "bg-white/10 group-hover:bg-white/20"}`}
            >
              <motion.div 
                animate={{ x: filters.proOnly ? 20 : 0 }}
                className={`absolute top-1 left-1 w-3 h-3 rounded-full ${filters.proOnly ? "bg-black" : "bg-white/30"}`} 
              />
            </div>
            <span className={`text-xs font-bold transition-colors ${filters.proOnly ? "text-white" : "text-white/40 group-hover:text-white"}`}>Pro services</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer group">
            <div 
              onClick={() => onFilterChange("instantOnly", !filters.instantOnly)}
              className={`relative w-10 h-5 rounded-full transition-all ${filters.instantOnly ? "bg-white" : "bg-white/10 group-hover:bg-white/20"}`}
            >
              <motion.div 
                animate={{ x: filters.instantOnly ? 20 : 0 }}
                className={`absolute top-1 left-1 w-3 h-3 rounded-full ${filters.instantOnly ? "bg-black" : "bg-white/30"}`} 
              />
            </div>
            <span className={`text-xs font-bold transition-colors ${filters.instantOnly ? "text-white" : "text-white/40 group-hover:text-white"}`}>Instant Setup</span>
          </label>
        </div>
      </div>
    </div>
  );
}
