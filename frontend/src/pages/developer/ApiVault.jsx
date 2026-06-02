import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Key, Eye, EyeOff, Copy, Check, Trash2, Plus, RefreshCw,
  Shield, Lock, Unlock, Zap, AlertTriangle, X
} from "lucide-react";

/* ─────────────────────────────────────────────
   MOCK DATA
───────────────────────────────────────────── */
const INIT_KEYS = [
  {
    id: "ak_1",
    name: "Production Agent",
    key: "sk-aivault-prod-0x9f2a3b8c1d4e5f6a7b8c9d0e1f2a3b4c",
    scope: "full",
    limit: 5000,
    used: 3820,
    created: "Oct 15, 2025",
    active: true,
  },
  {
    id: "ak_2",
    name: "Analytics Read",
    key: "sk-aivault-read-7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f",
    scope: "read",
    limit: 2000,
    used: 410,
    created: "Nov 1, 2025",
    active: true,
  },
];

/* ─────────────────────────────────────────────
   UNLOCK SOUND
───────────────────────────────────────────── */
function playUnlockSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const freqs = [880, 1100, 1320];
    freqs.forEach((f, i) => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(f, ctx.currentTime + i * 0.07);
      gain.gain.setValueAtTime(0.04, ctx.currentTime + i * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + i * 0.07 + 0.12);
      osc.start(ctx.currentTime + i * 0.07);
      osc.stop(ctx.currentTime + i * 0.07 + 0.15);
    });
  } catch {}
}

/* ─────────────────────────────────────────────
   USAGE GAUGE
───────────────────────────────────────────── */
function UsageGauge({ used, limit, color = "hsl(var(--foreground))" }) {
  const pct = Math.min((used / limit) * 100, 100);
  const warn = pct > 80;
  const c = warn ? "hsl(var(--foreground))" : color;

  return (
    <div>
      <div className="flex justify-between text-[10px] mb-1.5" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
        <span style={{ color: "hsl(var(--foreground) / 0.3)" }}>Daily Budget</span>
        <span style={{ color: warn ? "hsl(var(--foreground))" : c }}>
          {used.toLocaleString()} / {limit.toLocaleString()} tokens
        </span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "hsl(var(--foreground) / 0.06)" }}>
        <motion.div
          className="h-full rounded-full"
          style={{
            background: `linear-gradient(90deg, ${c}, ${c}cc)`,
            boxShadow: `0 0 8px ${c}`,
          }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
      {warn && (
        <div className="flex items-center gap-1 mt-1.5 text-[10px]" style={{ color: "hsl(var(--foreground))", fontFamily: "'Inter', sans-serif" }}>
          <AlertTriangle className="w-2.5 h-2.5" /> Approaching daily limit
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   KEY CARD
───────────────────────────────────────────── */
function KeyCard({ apiKey, onDelete, onRoll }) {
  const [revealed, setRevealedState] = useState(false);
  const [copied,   setCopied]        = useState(false);
  const [rolling,  setRolling]       = useState(false);
  const [editLimit, setEditLimit]    = useState(false);
  const [newLimit,  setNewLimit]     = useState(apiKey.limit);

  const reveal = () => {
    if (!revealed) playUnlockSound();
    setRevealedState((p) => !p);
  };

  const copy = () => {
    navigator.clipboard.writeText(apiKey.key);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const roll = () => {
    setRolling(true);
    setTimeout(() => { onRoll(apiKey.id); setRolling(false); }, 900);
  };

  return (
    <motion.div
      layout
      className="rounded-2xl p-5"
      style={{
        background: "rgba(0,0,0,0.85)",
        border: "0.5px solid hsl(var(--foreground) / 0.07)",
        backdropFilter: "blur(12px)",
      }}
    >
      {/* Top row */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{
              background: apiKey.scope === "full"
                ? "rgba(150,150,150,0.12)"
                : "rgba(150,150,150,0.12)",
              border: `0.5px solid ${apiKey.scope === "full" ? "rgba(150,150,150,0.25)" : "rgba(150,150,150,0.25)"}`,
            }}
          >
            {apiKey.scope === "full"
              ? <Unlock className="w-4 h-4" style={{ color: "hsl(var(--foreground))" }} />
              : <Lock   className="w-4 h-4" style={{ color: "hsl(var(--foreground))" }} />}
          </div>
          <div>
            <h3 className="text-white font-bold text-sm" style={{ fontFamily: "'Inter', sans-serif" }}>
              {apiKey.name}
            </h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span
                className="text-[10px] px-2 py-0.5 rounded-lg font-bold tracking-widest"
                style={{
                  background: apiKey.scope === "full" ? "rgba(150,150,150,0.1)" : "rgba(150,150,150,0.1)",
                  color:      apiKey.scope === "full" ? "hsl(var(--foreground))" : "hsl(var(--foreground))",
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                {apiKey.scope === "full" ? "FULL ACCESS" : "READ ONLY"}
              </span>
              <span className="text-[9px]" style={{ color: "hsl(var(--foreground) / 0.2)", fontFamily: "'JetBrains Mono', monospace" }}>
                Created {apiKey.created}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Scope toggle */}
          <select
            className="text-[10px] px-2 py-1 rounded-lg border outline-none cursor-pointer transition-all"
            style={{
              background: "hsl(var(--foreground) / 0.04)",
              borderColor: "hsl(var(--foreground) / 0.08)",
              color: "hsl(var(--foreground) / 0.5)",
              fontFamily: "'Inter', sans-serif",
            }}
            defaultValue={apiKey.scope}
          >
            <option value="read">Read Only</option>
            <option value="full">Full Access</option>
          </select>
          <button
            onClick={roll}
            className="p-1.5 rounded-lg transition-all"
            style={{ background: "hsl(var(--foreground) / 0.04)", color: "hsl(var(--foreground) / 0.4)" }}
            title="Roll key"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${rolling ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => onDelete(apiKey.id)}
            className="p-1.5 rounded-lg transition-all"
            style={{ background: "rgba(150,150,150,0.06)", color: "rgba(150,150,150,0.5)" }}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Key display */}
      <div
        className="flex items-center gap-2 p-3 rounded-xl mb-4"
        style={{
          background: "rgba(0,0,0,0.3)",
          border: "0.5px solid hsl(var(--foreground) / 0.06)",
        }}
      >
        <Key className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "hsl(var(--foreground) / 0.2)" }} />
        <span
          className="flex-1 text-xs truncate select-all"
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            color: revealed ? "hsl(var(--foreground))" : "hsl(var(--foreground) / 0.6)",
            filter: revealed ? "none" : "blur(6px)",
            transition: "filter 0.4s ease, color 0.3s ease",
            letterSpacing: revealed ? "0" : "0.1em",
          }}
        >
          {apiKey.key}
        </span>
        <button onClick={reveal} className="flex-shrink-0 transition-all">
          {revealed
            ? <EyeOff className="w-3.5 h-3.5" style={{ color: "hsl(var(--foreground))" }} />
            : <Eye    className="w-3.5 h-3.5" style={{ color: "hsl(var(--foreground) / 0.3)" }} />}
        </button>
        <button onClick={copy} className="flex-shrink-0 transition-all">
          {copied
            ? <Check className="w-3.5 h-3.5" style={{ color: "hsl(var(--foreground))" }} />
            : <Copy  className="w-3.5 h-3.5" style={{ color: "hsl(var(--foreground) / 0.3)" }} />}
        </button>
      </div>

      {/* Usage gauge */}
      <UsageGauge used={apiKey.used} limit={apiKey.limit} />

      {/* Kill switch rate limit */}
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Zap className="w-3 h-3" style={{ color: "hsl(var(--foreground))" }} />
          <span className="text-[10px] font-semibold" style={{ color: "hsl(var(--foreground) / 0.35)", fontFamily: "'Inter', sans-serif" }}>
            Kill Switch Limit
          </span>
        </div>
        {editLimit ? (
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              className="w-20 text-xs text-center rounded-lg px-2 py-1 outline-none"
              style={{
                background: "hsl(var(--foreground) / 0.06)",
                border: "0.5px solid rgba(150,150,150,0.3)",
                color: "white",
                fontFamily: "'JetBrains Mono', monospace",
              }}
              value={newLimit}
              onChange={(e) => setNewLimit(Number(e.target.value))}
            />
            <button
              onClick={() => setEditLimit(false)}
              className="text-[10px] px-2 py-1 rounded-lg font-semibold"
              style={{ background: "rgba(150,150,150,0.15)", color: "hsl(var(--foreground))", fontFamily: "'Inter', sans-serif" }}
            >
              Save
            </button>
          </div>
        ) : (
          <button
            onClick={() => setEditLimit(true)}
            className="text-[10px] font-semibold transition-colors"
            style={{ color: "hsl(var(--foreground))", fontFamily: "'JetBrains Mono', monospace" }}
          >
            {newLimit.toLocaleString()} tokens/day ✎
          </button>
        )}
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────── */
export default function ApiVault() {
  const [keys,    setKeys]    = useState(INIT_KEYS);
  const [adding,  setAdding]  = useState(false);
  const [newName, setNewName] = useState("");

  const deleteKey = (id) => setKeys((p) => p.filter((k) => k.id !== id));

  const rollKey = (id) => {
    setKeys((p) =>
      p.map((k) =>
        k.id === id
          ? { ...k, key: "sk-aivault-" + Math.random().toString(36).slice(2, 34) }
          : k
      )
    );
  };

  const addKey = () => {
    if (!newName.trim()) return;
    setKeys((p) => [
      ...p,
      {
        id: "ak_" + Date.now(),
        name: newName.trim(),
        key: "sk-aivault-new-" + Math.random().toString(36).slice(2, 34),
        scope: "read",
        limit: 1000,
        used: 0,
        created: "Today",
        active: true,
      },
    ]);
    setNewName("");
    setAdding(false);
  };

  return (
    <div className="p-6 sm:p-8 max-w-4xl">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-white font-bold text-2xl sm:text-3xl" style={{ fontFamily: "Georgia, serif", letterSpacing: "-0.04em" }}>
            API Vault
          </h1>
          <p className="text-sm mt-1" style={{ color: "hsl(var(--foreground) / 0.35)", fontFamily: "'Inter', sans-serif" }}>
            Manage keys, scopes, and daily rate limits for your AI agents.
          </p>
        </div>
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold shimmer-btn transition-all"
          style={{
            background: "linear-gradient(135deg, hsl(var(--foreground)), hsl(var(--foreground)))",
            color: "white",
            boxShadow: "0 0 20px rgba(150,150,150,0.3)",
            fontFamily: "'Inter', sans-serif",
          }}
        >
          <Plus className="w-4 h-4" /> New Key
        </button>
      </div>

      {/* Add key modal */}
      <AnimatePresence>
        {adding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 overflow-hidden"
          >
            <div className="rounded-2xl p-5 flex items-center gap-3"
              style={{ background: "rgba(150,150,150,0.06)", border: "0.5px solid rgba(150,150,150,0.2)" }}>
              <input
                autoFocus
                className="flex-1 bg-transparent outline-none text-sm text-white placeholder-white/20"
                style={{ fontFamily: "'Inter', sans-serif" }}
                placeholder="Key name (e.g. WhatsApp Production)…"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") addKey(); if (e.key === "Escape") setAdding(false); }}
              />
              <button onClick={addKey}
                className="px-4 py-1.5 rounded-xl text-xs font-bold"
                style={{ background: "rgba(150,150,150,0.2)", color: "hsl(var(--foreground))", fontFamily: "'Inter', sans-serif" }}>
                Create
              </button>
              <button onClick={() => setAdding(false)}>
                <X className="w-4 h-4" style={{ color: "hsl(var(--foreground) / 0.3)" }} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        {keys.map((k, i) => (
          <motion.div key={k.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
            <KeyCard apiKey={k} onDelete={deleteKey} onRoll={rollKey} />
          </motion.div>
        ))}
      </div>

      {/* Info box */}
      <div className="mt-6 rounded-2xl p-4 flex items-start gap-3"
        style={{ background: "rgba(150,150,150,0.05)", border: "0.5px solid rgba(150,150,150,0.12)" }}>
        <Shield className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "hsl(var(--foreground))" }} />
        <p className="text-xs leading-relaxed" style={{ color: "hsl(var(--foreground) / 0.4)", fontFamily: "'Inter', sans-serif" }}>
          API keys are hashed and stored encrypted. The full key is only shown once at creation and when you explicitly reveal it.
          Roll a key immediately if it's been compromised.
        </p>
      </div>
    </div>
  );
}
