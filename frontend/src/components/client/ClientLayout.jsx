import { Outlet, Link, useLocation } from "react-router-dom";
import ClientSidebar from "./ClientSidebar";
import {
  Menu, X, History, ListTodo, Users, Heart, MessageSquare,
  CreditCard, ArrowLeft, Puzzle, Rocket, Wallet, Search, Command
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const NAV_ITEMS = [
  { path: "/client",              label: "Overview",         icon: History },
  { path: "/client/orders",       label: "Order Management", icon: ListTodo },
  { path: "/client/hire",         label: "Dev Direct",       icon: Users },
  { path: "/client/integrations", label: "Integrations",     icon: Puzzle },
  { path: "/client/wishlist",     label: "Wishlist",         icon: Heart },
  { path: "/client/messages",     label: "Messages",         icon: MessageSquare },
  { path: "/client/billing",      label: "Billing & Wallet", icon: CreditCard },
];

const CMDK_COMMANDS = [
  { label: "Overview Dashboard",    path: "/client",              icon: History,       hint: "Home" },
  { label: "Launch Support Agent",  path: "/client",              icon: Rocket,        hint: "Action" },
  { label: "Order Management",      path: "/client/orders",       icon: ListTodo,      hint: "Orders" },
  { label: "Hire Developers",       path: "/client/hire",         icon: Users,         hint: "Dev" },
  { label: "Integrations Hub",      path: "/client/integrations", icon: Puzzle,        hint: "Apps" },
  { label: "Billing & Wallet",      path: "/client/billing",      icon: Wallet,        hint: "Payments" },
  { label: "Find invoices from Oct",path: "/client/billing",      icon: CreditCard,    hint: "Billing" },
  { label: "Messages",              path: "/client/messages",     icon: MessageSquare, hint: "Chat" },
  { label: "Wishlist",              path: "/client/wishlist",     icon: Heart,         hint: "Saved" },
];

// Web Audio API click sound
function playClickSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(1800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.04);
    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.08);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.08);
  } catch (_) {}
}

export default function ClientLayout() {
  const [mobileOpen, setMobileOpen]   = useState(false);
  const [cmdkOpen,   setCmdkOpen]     = useState(false);
  const [cmdkQuery,  setCmdkQuery]    = useState("");
  const [cmdkIdx,    setCmdkIdx]      = useState(0);
  const [vipMode,    setVipMode]      = useState(false);
  const [refillAnim, setRefillAnim]   = useState(false); // exposed via context if needed
  const location  = useLocation();
  const navigate  = useNavigate();
  const inputRef  = useRef(null);

  /* ─── CMD+K keyboard shortcut ─── */
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCmdkOpen((p) => !p);
        setCmdkQuery("");
        setCmdkIdx(0);
      }
      if (e.key === "Escape") setCmdkOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  /* Focus input when modal opens */
  useEffect(() => {
    if (cmdkOpen) setTimeout(() => inputRef.current?.focus(), 50);
  }, [cmdkOpen]);

  /* ─── Play sound on route change ─── */
  const prevPath = useRef(location.pathname);
  useEffect(() => {
    if (location.pathname !== prevPath.current) {
      playClickSound();
      prevPath.current = location.pathname;
    }
  }, [location.pathname]);

  /* ─── VIP gold mode — apply class to root ─── */
  useEffect(() => {
    const el = document.getElementById("client-dashboard-root");
    if (!el) return;
    if (vipMode) el.classList.add("vip-gold-mode");
    else         el.classList.remove("vip-gold-mode");
  }, [vipMode]);

  /* ─── CMD+K filtered results ─── */
  const filteredCmds = cmdkQuery.trim()
    ? CMDK_COMMANDS.filter((c) =>
        c.label.toLowerCase().includes(cmdkQuery.toLowerCase())
      )
    : CMDK_COMMANDS;

  const handleCmdkNavigate = (path) => {
    navigate(path);
    setCmdkOpen(false);
    setCmdkQuery("");
  };

  const handleCmdkKeyDown = (e) => {
    if (e.key === "ArrowDown") setCmdkIdx((p) => Math.min(p + 1, filteredCmds.length - 1));
    if (e.key === "ArrowUp")   setCmdkIdx((p) => Math.max(p - 1, 0));
    if (e.key === "Enter" && filteredCmds[cmdkIdx]) {
      handleCmdkNavigate(filteredCmds[cmdkIdx].path);
    }
  };

  return (
    <div id="client-dashboard-root" className="flex min-h-screen relative" style={{ background: "#f7f7f7" }}>

      {/* Sidebar */}
      <div style={{ position: "relative", zIndex: 10 }}>
        <ClientSidebar vipMode={vipMode} onVipToggle={() => setVipMode((p) => !p)} />
      </div>

      {/* ── Main area ── */}
      <div className="flex-1 flex flex-col" style={{ position: "relative", zIndex: 1 }}>

        {/* Mobile header */}
        <div
          className="lg:hidden sticky top-0 z-50 px-4 py-3 flex items-center justify-between"
          style={{
            background: "rgba(0,0,0,0.9)",
            backdropFilter: "blur(20px)",
            borderBottom: "1px solid rgba(150,150,150,0.1)",
          }}
        >
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, hsl(var(--foreground)), hsl(var(--foreground)))" }}
            >
              <span className="text-white font-bold text-xs" style={{ fontFamily: "Georgia, serif" }}>C</span>
            </div>
            <span className="text-white font-bold text-sm" style={{ fontFamily: "Georgia, serif" }}>Client Hub</span>
          </div>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="text-white/50 hover:text-white transition-colors">
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div
            className="lg:hidden px-4 pb-4 space-y-1 border-b"
            style={{
              background: "rgba(0,0,0,0.97)",
              backdropFilter: "blur(20px)",
              borderColor: "rgba(150,150,150,0.1)",
            }}
          >
            <Link to="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 text-white/30 text-xs py-2">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Marketplace
            </Link>
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => { setMobileOpen(false); playClickSound(); }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${
                  location.pathname === item.path ? "text-white" : "text-white/40"
                }`}
                style={{
                  background: location.pathname === item.path
                    ? "rgba(150,150,150,0.1)"
                    : "transparent",
                }}
              >
                <item.icon className="w-4 h-4" style={{ color: location.pathname === item.path ? "hsl(var(--foreground))" : "" }} />
                {item.label}
              </Link>
            ))}
            <div className="pt-2 border-t mt-2" style={{ borderColor: "rgba(150,150,150,0.1)" }}>
              <button
                onClick={() => setVipMode((p) => !p)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${vipMode ? 'bg-[hsl(var(--foreground))]/20' : 'bg-transparent'}`}
              >
                <div className="flex items-center gap-3">
                  <Heart className={`w-4 h-4 ${vipMode ? 'text-white' : 'text-white/40'}`} />
                  <span className={`text-sm font-medium ${vipMode ? 'text-white' : 'text-white/40'}`}>
                    VIP Priority
                  </span>
                </div>
                <div className={`w-8 h-4 rounded-full border transition-colors flex items-center p-0.5 ${vipMode ? 'bg-[hsl(var(--foreground))]/40 border-[hsl(var(--foreground))]/60' : 'bg-transparent border-white/20'}`}>
                  <div className={`w-3 h-3 rounded-full transition-transform ${vipMode ? 'bg-white translate-x-4' : 'bg-white/30 translate-x-0'}`} />
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Page content */}
        <main className="flex-1 overflow-auto pb-40 lg:pb-24 relative">
          <Outlet context={{ vipMode, setVipMode }} />
        </main>
      </div>

      {/* ── Quick Action HUD ── */}
      <div className="client-hud">
        <button className="hud-btn hud-primary" onClick={() => { playClickSound(); navigate("/client"); }}>
          <Rocket className="w-3.5 h-3.5" />
          Launch Agent
        </button>
        <div className="hud-divider" />
        <button className="hud-btn" onClick={() => { playClickSound(); navigate("/client/billing"); }}>
          <Wallet className="w-3.5 h-3.5" />
          Top Up
        </button>
        <div className="hud-divider" />
        <button className="hud-btn" onClick={() => { playClickSound(); setCmdkOpen(true); }}>
          <Search className="w-3.5 h-3.5" />
          Search
          <span
            className="text-[9px] px-1.5 py-0.5 rounded font-mono"
            style={{
              background: "hsl(var(--foreground) / 0.06)",
              color: "hsl(var(--foreground) / 0.3)",
              border: "0.5px solid hsl(var(--foreground) / 0.08)",
            }}
          >
            ⌘K
          </span>
        </button>
      </div>

      {/* ── CMD+K Modal ── */}
      {cmdkOpen && (
        <div className="cmdk-backdrop" onClick={() => setCmdkOpen(false)}>
          <div className="cmdk-modal" onClick={(e) => e.stopPropagation()}>
            {/* Search input */}
            <div className="flex items-center border-b" style={{ borderColor: "rgba(150,150,150,0.12)" }}>
              <Command className="w-4 h-4 ml-6 flex-shrink-0" style={{ color: "rgba(150,150,150,0.6)" }} />
              <input
                ref={inputRef}
                className="cmdk-input"
                placeholder="Type a command or search..."
                value={cmdkQuery}
                onChange={(e) => { setCmdkQuery(e.target.value); setCmdkIdx(0); }}
                onKeyDown={handleCmdkKeyDown}
              />
              <div
                className="mr-4 text-xs px-2 py-1 rounded font-mono flex-shrink-0"
                style={{
                  background: "hsl(var(--foreground) / 0.04)",
                  color: "hsl(var(--foreground) / 0.2)",
                  border: "0.5px solid hsl(var(--foreground) / 0.08)",
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                ESC
              </div>
            </div>

            {/* Results */}
            <div className="py-2 max-h-80 overflow-y-auto">
              {filteredCmds.length === 0 && (
                <p className="text-center py-8 text-sm" style={{ color: "hsl(var(--foreground) / 0.2)", fontFamily: "'Inter', sans-serif" }}>
                  No results found
                </p>
              )}
              {filteredCmds.map((cmd, i) => (
                <div
                  key={i}
                  className={`cmdk-result ${i === cmdkIdx ? "active" : ""}`}
                  onClick={() => handleCmdkNavigate(cmd.path)}
                  onMouseEnter={() => setCmdkIdx(i)}
                >
                  <div className="cmdk-result-icon">
                    <cmd.icon className="w-3.5 h-3.5" style={{ color: "rgba(150,150,150,0.8)" }} />
                  </div>
                  <span>{cmd.label}</span>
                  <span
                    className="ml-auto text-[10px] px-2 py-0.5 rounded"
                    style={{
                      background: "hsl(var(--foreground) / 0.04)",
                      color: "hsl(var(--foreground) / 0.2)",
                      fontFamily: "'Inter', sans-serif",
                      letterSpacing: "0.04em",
                    }}
                  >
                    {cmd.hint}
                  </span>
                </div>
              ))}
            </div>

            <div
              className="flex items-center gap-4 px-5 py-3 border-t text-[10px]"
              style={{
                borderColor: "hsl(var(--foreground) / 0.06)",
                color: "hsl(var(--foreground) / 0.2)",
                fontFamily: "'Inter', sans-serif",
                letterSpacing: "0.04em",
              }}
            >
              <span>↑↓ Navigate</span>
              <span>↵ Select</span>
              <span>ESC Close</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
