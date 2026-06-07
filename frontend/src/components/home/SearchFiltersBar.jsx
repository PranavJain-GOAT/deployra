import { useState, useRef, useEffect } from "react";
import { ChevronDown, X, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/* ── shared dropdown shell ──────────────────────────────────── */
function DropPanel({ label, active, children, onClear, onApply, width = "w-80" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const close = () => setOpen(false);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-semibold border transition-all whitespace-nowrap ${
          active
            ? "bg-white text-black border-white"
            : "bg-white/5 text-white/70 border-white/10 hover:border-white/20"
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
            className={`absolute top-full mt-2 left-0 z-50 rounded-2xl overflow-hidden ${width} glass-dark border border-white/10 shadow-2xl backdrop-blur-3xl`}
          >
            <div className="max-h-[500px] overflow-y-auto p-5 space-y-6">{children}</div>
            <div className="flex items-center justify-between px-5 py-3 border-t border-white/8 bg-white/[0.02]">
              <button onClick={() => { onClear(); close(); }} className="text-xs font-bold text-white/30 hover:text-white transition-colors">Clear all</button>
              <button onClick={() => { onApply(); close(); }} className="px-6 py-2 rounded-lg bg-neutral-800 text-white text-xs font-bold hover:bg-neutral-700 transition-all">Apply</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── checkbox row ───────────────────────────────────────────── */
function CheckRow({ label, count, checked, onChange }) {
  return (
    <label className="flex items-center justify-between gap-3 cursor-pointer group py-0.5">
      <div className="flex items-center gap-3">
        <div
          onClick={(e) => { e.preventDefault(); onChange(); }}
          className={`w-4.5 h-4.5 rounded border transition-all flex items-center justify-center flex-shrink-0 ${
            checked ? "bg-black border-black" : "border-white/20 group-hover:border-white/40 bg-white/5"
          }`}
        >
          {checked && <Check className="w-3 h-3 text-white" strokeWidth={4} />}
        </div>
        <span className={`text-sm transition-colors ${checked ? "text-white font-medium" : "text-white/60 group-hover:text-white"}`}>
          {label}
        </span>
      </div>
      {count !== undefined && (
        <span className="text-[11px] font-mono text-white/20">({count.toLocaleString()})</span>
      )}
    </label>
  );
}

/* ── radio row ──────────────────────────────────────────────── */
function RadioRow({ label, sub, checked, onChange }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer group py-1">
      <div
        onClick={(e) => { e.preventDefault(); onChange(); }}
        className={`w-4.5 h-4.5 rounded-full border transition-all flex items-center justify-center flex-shrink-0 ${
          checked ? "border-black bg-black" : "border-white/20 group-hover:border-white/40 bg-white/5"
        }`}
      >
        {checked && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
            <span className={`text-sm transition-colors ${checked ? "text-white font-bold" : "text-white/60 group-hover:text-white"}`}>
                {label}
            </span>
            {sub && <span className="text-[11px] font-mono text-white/20">{sub}</span>}
        </div>
      </div>
    </label>
  );
}

const CATEGORIES = [
    { name: "Chatbot Development", count: 59000 },
    { name: "Automation Workflows", count: 36000 },
    { name: "SaaS Kits", count: 28000 },
    { name: "Analytics Dashboard", count: 120000 },
    { name: "Voice Agents", count: 44000 },
    { name: "API Integration", count: 25000 },
    { name: "Marketing Bots", count: 17000 },
];

export default function SearchFiltersBar({ filters, onFiltersChange }) {
  const [tempFilters, setTempFilters] = useState(filters);

  // Sync temp filters when prop changes
  useEffect(() => {
    setTempFilters(filters);
  }, [filters]);

  const update = (key, val) => setTempFilters(prev => ({ ...prev, [key]: val }));
  const toggleArray = (key, val) => {
    const arr = tempFilters[key] || [];
    update(key, arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]);
  };

  const apply = () => onFiltersChange(tempFilters);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          
          {/* Category Dropdown */}
          <DropPanel 
            label={filters.category || "Category"} 
            active={!!filters.category}
            onClear={() => update("category", "")}
            onApply={apply}
          >
            <div className="space-y-3">
              <RadioRow label="All Categories" checked={!tempFilters.category} onChange={() => update("category", "")} />
              {CATEGORIES.map(c => (
                <RadioRow 
                  key={c.name} 
                  label={c.name} 
                  sub={c.count.toLocaleString()} 
                  checked={tempFilters.category === c.name} 
                  onChange={() => update("category", c.name)} 
                />
              ))}
            </div>
          </DropPanel>

          {/* Service Options */}
          <DropPanel 
            label="Service options" 
            active={!!filters.serviceOptions?.length}
            onClear={() => update("serviceOptions", [])}
            onApply={apply}
            width="w-[400px]"
          >
            <div className="space-y-6">
                <section>
                    <p className="text-xs font-bold text-white mb-4">Solution type</p>
                    <div className="grid grid-cols-2 gap-y-3 gap-x-6">
                        {["Business AI", "Landing page", "E-commerce", "Blog Automation"].map(opt => (
                            <CheckRow key={opt} label={opt} count={Math.floor(Math.random()*100)} checked={tempFilters.serviceOptions?.includes(opt)} onChange={() => toggleArray("serviceOptions", opt)} />
                        ))}
                    </div>
                    <button className="text-[11px] font-bold text-white mt-4 hover:underline">+ 12 more</button>
                </section>
                <section className="pt-6 border-t border-white/5">
                    <p className="text-xs font-bold text-white mb-4">Service offerings</p>
                    <div className="grid grid-cols-2 gap-y-3 gap-x-6">
                        {["Offers Subscriptions", "Video Consultations"].map(opt => (
                            <CheckRow key={opt} label={opt} count={100} checked={tempFilters.serviceOptions?.includes(opt)} onChange={() => toggleArray("serviceOptions", opt)} />
                        ))}
                    </div>
                </section>
            </div>
          </DropPanel>

          {/* Seller Details */}
          <DropPanel 
            label="Seller details" 
            active={!!filters.devLevel?.length}
            onClear={() => update("devLevel", [])}
            onApply={apply}
            width="w-[450px]"
          >
            <div className="space-y-6">
                <section>
                    <p className="text-xs font-bold text-white mb-4">Seller level</p>
                    <div className="grid grid-cols-2 gap-y-3 gap-x-6">
                        {["Top Rated Seller", "Level 2", "Level 1", "New Seller"].map(opt => (
                            <CheckRow key={opt} label={opt} count={Math.floor(Math.random()*5000)} checked={tempFilters.devLevel?.includes(opt)} onChange={() => toggleArray("devLevel", opt)} />
                        ))}
                    </div>
                </section>
                <section className="pt-6 border-t border-white/5">
                    <p className="text-xs font-bold text-white mb-4">Hourly rate</p>
                    <CheckRow label="Hourly rate" count={200} checked={tempFilters.hasHourly} onChange={() => update("hasHourly", !tempFilters.hasHourly)} />
                    <p className="text-[10px] text-white/30 mt-1 ml-7">Hire hourly for long-term projects</p>
                </section>
            </div>
          </DropPanel>

          {/* Budget */}
          <DropPanel 
            label="Budget" 
            active={!!filters.budget}
            onClear={() => update("budget", "")}
            onApply={apply}
          >
            <p className="text-[11px] text-white/30 mb-4">Budget reflects the base price.</p>
            <div className="space-y-3">
                {["Value (Under $50)", "Mid-range ($50-$200)", "High-end ($200+)"].map(opt => (
                    <RadioRow key={opt} label={opt.split(' (')[0]} sub={opt.split(' (')[1].replace(')','')} checked={tempFilters.budget === opt} onChange={() => update("budget", opt)} />
                ))}
                <div className="pt-2">
                    <RadioRow label="Custom" checked={tempFilters.budget === "custom"} onChange={() => update("budget", "custom")} />
                    <div className="mt-3 relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 text-sm">$</span>
                        <input type="number" placeholder="Up to" className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-8 pr-4 text-sm focus:outline-none focus:border-white/30 transition-all" />
                    </div>
                </div>
            </div>
          </DropPanel>

          {/* Delivery Time */}
          <DropPanel 
            label="Delivery time" 
            active={!!filters.deliveryTime}
            onClear={() => update("deliveryTime", "")}
            onApply={apply}
          >
            <div className="space-y-4">
                {[
                    { id: "24h", label: "Express 24H" },
                    { id: "3d", label: "Up to 3 days" },
                    { id: "7d", label: "Up to 7 days" },
                    { id: "any", label: "Anytime" }
                ].map(opt => (
                    <RadioRow key={opt.id} label={opt.label} checked={tempFilters.deliveryTime === opt.id} onChange={() => update("deliveryTime", opt.id)} />
                ))}
            </div>
          </DropPanel>

        </div>

        {/* Right Toggles */}
        <div className="flex items-center gap-6">
            <label className="flex items-center gap-3 cursor-pointer group">
                <div 
                    onClick={() => onFiltersChange({ ...filters, proOnly: !filters.proOnly })}
                    className={`relative w-9 h-5 rounded-full transition-all ${filters.proOnly ? "bg-black" : "bg-white/10"}`}
                >
                    <motion.div animate={{ x: filters.proOnly ? 16 : 0 }} className={`absolute top-1 left-1 w-3 h-3 rounded-full ${filters.proOnly ? "bg-white" : "bg-white/40"}`} />
                </div>
                <span className="text-xs font-bold text-white/40 group-hover:text-white">Pro services</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
                <div 
                    onClick={() => onFiltersChange({ ...filters, instantOnly: !filters.instantOnly })}
                    className={`relative w-9 h-5 rounded-full transition-all ${filters.instantOnly ? "bg-black" : "bg-white/10"}`}
                >
                    <motion.div animate={{ x: filters.instantOnly ? 16 : 0 }} className={`absolute top-1 left-1 w-3 h-3 rounded-full ${filters.instantOnly ? "bg-white" : "bg-white/40"}`} />
                </div>
                <span className="text-xs font-bold text-white/40 group-hover:text-white">Instant response</span>
            </label>
        </div>
      </div>

      {/* Active Filter Tags */}
      <div className="flex flex-wrap gap-2">
        {filters.category && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[11px] font-bold text-white/60">
                {filters.category} <X className="w-3 h-3 cursor-pointer hover:text-white" onClick={() => onFiltersChange({ ...filters, category: "" })} />
            </div>
        )}
        {filters.deliveryTime && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[11px] font-bold text-white/60">
                {filters.deliveryTime === '24h' ? 'Express 24H' : `Up to ${filters.deliveryTime}`} <X className="w-3 h-3 cursor-pointer hover:text-white" onClick={() => onFiltersChange({ ...filters, deliveryTime: "" })} />
            </div>
        )}
        {/* ... add more chips as needed */}
      </div>
    </div>
  );
}
