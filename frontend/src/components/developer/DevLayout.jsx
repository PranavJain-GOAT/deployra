import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import DevSidebar from "./DevSidebar";
import {
  Menu, X, LayoutDashboard, Package, Plus,
  ArrowLeft, MessageSquare, User, Command
} from "lucide-react";
import { useState, useEffect, useRef } from "react";

const NAV_ITEMS = [
  { path: "/developer",            label: "Dashboard",    icon: LayoutDashboard },
  { path: "/developer/listings",   label: "My Listings",  icon: Package },
  { path: "/developer/add",        label: "Add Product",  icon: Plus },
  { path: "/developer/messages",   label: "Messages",     icon: MessageSquare },
  { path: "/developer/profile",    label: "Profile",      icon: User },
];

const CMDK_COMMANDS = [
  { label: "Dashboard",       path: "/developer",            hint: "Home",      icon: LayoutDashboard },
  { label: "My Listings",     path: "/developer/listings",   hint: "Products",  icon: Package },
  { label: "New Product",     path: "/developer/add",        hint: "NP",        icon: Plus },
  { label: "Messages",        path: "/developer/messages",   hint: "Chat",      icon: MessageSquare },
  { label: "Profile",         path: "/developer/profile",    hint: "Settings",  icon: User },
];

// Web Audio shutter click
function playClick() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(1900, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.04);
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.08);
    osc.start(); osc.stop(ctx.currentTime + 0.08);
  } catch (_) {}
}

export default function DevLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cmdkOpen,   setCmdkOpen]   = useState(false);
  const [cmdkQuery,  setCmdkQuery]  = useState("");
  const [cmdkIdx,    setCmdkIdx]    = useState(0);
  const location  = useLocation();
  const navigate  = useNavigate();
  const inputRef  = useRef(null);
  const prevPath  = useRef(location.pathname);

  /* CMD+K shortcut */
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault(); setCmdkOpen((p) => !p); setCmdkQuery(""); setCmdkIdx(0);
      }
      if (e.key === "Escape") setCmdkOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (cmdkOpen) setTimeout(() => inputRef.current?.focus(), 50);
  }, [cmdkOpen]);

  /* Click sound on nav */
  useEffect(() => {
    if (location.pathname !== prevPath.current) { playClick(); prevPath.current = location.pathname; }
  }, [location.pathname]);

  const filtered = cmdkQuery.trim()
    ? CMDK_COMMANDS.filter((c) => c.label.toLowerCase().includes(cmdkQuery.toLowerCase()) || c.hint.toLowerCase().includes(cmdkQuery.toLowerCase()))
    : CMDK_COMMANDS;

  const doNavigate = (path) => { navigate(path); setCmdkOpen(false); setCmdkQuery(""); };

  const handleKey = (e) => {
    if (e.key === "ArrowDown") setCmdkIdx((p) => Math.min(p + 1, filtered.length - 1));
    if (e.key === "ArrowUp")   setCmdkIdx((p) => Math.max(p - 1, 0));
    if (e.key === "Enter" && filtered[cmdkIdx]) doNavigate(filtered[cmdkIdx].path);
  };

  return (
    <div id="dev-dashboard-root" className="flex min-h-screen relative" style={{ background: "#f7f7f7" }}>

      {/* Sidebar */}
      <div style={{ position: "relative", zIndex: 10 }}>
        <DevSidebar />
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col" style={{ position: "relative", zIndex: 1 }}>

        {/* Mobile header */}
        <div
          className="lg:hidden sticky top-0 z-50 px-4 py-3 flex items-center justify-between"
          style={{ background: "rgba(0,0,0,0.9)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(150,150,150,0.1)" }}
        >
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center overflow-hidden bg-transparent">
              <img src="/logo.png" alt="Deployra Logo" className="w-6 h-6 object-contain" />
            </div>
            <span className="text-white font-bold text-sm" style={{ fontFamily: "Georgia, serif" }}>Developer Hub</span>
          </div>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="text-white/50 hover:text-white transition-colors">
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="lg:hidden px-4 pb-4 space-y-1 border-b"
            style={{ background: "rgba(0,0,0,0.97)", backdropFilter: "blur(20px)", borderColor: "rgba(150,150,150,0.1)" }}>
            <Link to="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 text-white/30 text-xs py-2">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Marketplace
            </Link>
            {NAV_ITEMS.map((item) => (
              <Link key={item.path} to={item.path} onClick={() => { setMobileOpen(false); playClick(); }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${location.pathname === item.path ? "text-white" : "text-white/40"}`}
                style={{ background: location.pathname === item.path ? "rgba(150,150,150,0.1)" : "transparent" }}>
                <item.icon className="w-4 h-4" style={{ color: location.pathname === item.path ? "hsl(var(--foreground))" : "" }} />
                {item.label}
              </Link>
            ))}
            <div className="pt-2 border-t mt-2" style={{ borderColor: "rgba(150,150,150,0.1)" }}>
              <div
                className="flex items-center gap-2.5 px-3.5 py-3 rounded-xl border border-border"
              >
                <div className="relative">
                  <span
                    className="block w-2.5 h-2.5 rounded-full flex-shrink-0 bg-foreground"
                  />
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] font-semibold text-foreground tracking-wide">
                    All Systems Nominal
                  </div>
                  <div className="text-[9px] text-foreground/50 font-mono">
                    Latency 24ms · 99.9% uptime
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <main className="flex-1 overflow-auto pb-10 relative">
          <Outlet />
        </main>
      </div>

      {/* ── CMD+K Modal ── */}
      {cmdkOpen && (
        <div className="cmdk-backdrop" onClick={() => setCmdkOpen(false)}>
          <div className="cmdk-modal" onClick={(e) => e.stopPropagation()}
            style={{ border: "0.5px solid rgba(150,150,150,0.25)", boxShadow: "0 32px 80px rgba(0,0,0,0.85), 0 0 0 0.5px rgba(150,150,150,0.1) inset" }}>
            <div className="flex items-center border-b" style={{ borderColor: "rgba(150,150,150,0.12)" }}>
              <Command className="w-4 h-4 ml-6 flex-shrink-0" style={{ color: "rgba(150,150,150,0.6)" }} />
              <input
                ref={inputRef}
                className="cmdk-input"
                placeholder="Type a command or NP for New Product..."
                value={cmdkQuery}
                onChange={(e) => { setCmdkQuery(e.target.value); setCmdkIdx(0); }}
                onKeyDown={handleKey}
              />
              <span className="mr-4 text-[10px] px-2 py-1 rounded font-mono flex-shrink-0"
                style={{ background:"hsl(var(--foreground) / 0.04)", color:"hsl(var(--foreground) / 0.2)", border:"0.5px solid hsl(var(--foreground) / 0.08)" }}>
                ESC
              </span>
            </div>
            <div className="py-2 max-h-72 overflow-y-auto">
              {filtered.map((cmd, i) => (
                <div key={i}
                  className={`cmdk-result ${i === cmdkIdx ? "active" : ""}`}
                  onClick={() => doNavigate(cmd.path)}
                  onMouseEnter={() => setCmdkIdx(i)}
                  style={{ "--accent": "rgba(150,150,150,0.1)" }}
                >
                  <div className="cmdk-result-icon">
                    <cmd.icon className="w-3.5 h-3.5" style={{ color: "rgba(150,150,150,0.8)" }} />
                  </div>
                  <span>{cmd.label}</span>
                  <span className="ml-auto text-[10px] px-2 py-0.5 rounded"
                    style={{ background:"hsl(var(--foreground) / 0.04)", color:"hsl(var(--foreground) / 0.2)" }}>
                    {cmd.hint}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-4 px-5 py-3 border-t text-[10px]"
              style={{ borderColor:"hsl(var(--foreground) / 0.06)", color:"hsl(var(--foreground) / 0.2)", fontFamily:"'Inter',sans-serif", letterSpacing:"0.04em" }}>
              <span>↑↓ Navigate</span><span>↵ Select</span><span>ESC Close</span>
              <span className="ml-auto">⌘K to toggle</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Neural Network Particle Background ─── */
function NeuralBg() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    const nodes = Array.from({ length: 5 }, (_, i) => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: 2 + Math.random() * 2,
    }));

    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // Move
      nodes.forEach((n) => {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > canvas.width)  n.vx *= -1;
        if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
      });
      // Draw edges
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const d  = Math.hypot(dx, dy);
          if (d < 400) {
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(150,150,150,${0.06 * (1 - d / 400)})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }
      // Draw nodes
      nodes.forEach((n) => {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(150,150,150,0.18)";
        ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };
    draw();

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    window.addEventListener("resize", resize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", opacity: 0.9 }}
    />
  );
}