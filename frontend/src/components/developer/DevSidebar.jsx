import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Package, Plus, ArrowLeft, MessageSquare, User,
  BarChart3, Zap, Terminal, Shield, DollarSign, Star,
  TrendingUp, Users, GitBranch, CheckSquare, Wallet, FileText,
  Trophy, ShoppingBag, Settings
} from "lucide-react";
import { useRef } from "react";

const NAV_GROUPS = [
  {
    label: "Revenue",
    items: [
      { path: "/developer",           label: "Dashboard",        icon: LayoutDashboard },
      { path: "/developer/orders",    label: "Orders",           icon: ShoppingBag     },
      { path: "/developer/earnings",  label: "Earnings & Escrow",icon: Wallet          },
    ],
  },
  {
    label: "Products",
    items: [
      { path: "/developer/listings",      label: "My Listings",     icon: Package     },
      { path: "/developer/add",           label: "Publish Product", icon: Plus        },
      { path: "/developer/verification",  label: "Verification",    icon: CheckSquare },
    ],
  },
  {
    label: "Marketplace",
    items: [
      { path: "/developer/analytics",  label: "Analytics",    icon: BarChart3  },
      { path: "/developer/reviews",    label: "Reviews",       icon: Star       },
      { path: "/developer/rankings",   label: "Rankings",      icon: Trophy     },
    ],
  },
  {
    label: "Communication",
    items: [
      { path: "/developer/messages", label: "Inbox", icon: MessageSquare },
    ],
  },
  {
    label: "Developer Tools",
    items: [
      { path: "/developer/api-vault",  label: "API Vault",   icon: Shield   },
      { path: "/developer/webhooks",   label: "Webhooks",    icon: Zap      },
      { path: "/developer/logs",       label: "Logs",        icon: Terminal },
      { path: "/developer/sandbox",    label: "AI Sandbox",  icon: GitBranch},
    ],
  },
  {
    label: "Account",
    items: [
      { path: "/developer/profile",  label: "Dev Profile",  icon: User     },
      { path: "/developer/payouts",  label: "Payouts",      icon: DollarSign},
      { path: "/developer/team",     label: "Team & Org",   icon: Users    },
    ],
  },
];

function MagneticNavItem({ item, isActive }) {
  const iconRef = useRef(null);

  const handleMouseMove = (e) => {
    const el = iconRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dist = Math.hypot(e.clientX - cx, e.clientY - cy);
    if (dist < 50) {
      const dx = (e.clientX - cx) * 0.28;
      const dy = (e.clientY - cy) * 0.28;
      el.style.transform = `translate(${dx}px,${dy}px)`;
    } else {
      el.style.transform = "";
    }
  };

  const handleMouseLeave = () => {
    if (iconRef.current) iconRef.current.style.transform = "";
  };

  return (
    <Link
      to={item.path}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all relative group ${
        isActive ? "text-foreground" : "text-foreground/60 hover:text-foreground/90"
      }`}
      style={{
        background: isActive
          ? "rgba(150,150,150,0.08)"
          : "transparent",
        boxShadow: isActive
          ? "inset 0 0 0 0.5px rgba(150,150,150,0.15)"
          : "none",
      }}
    >
      {isActive && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-r-full bg-foreground" />
      )}

      {!isActive && (
        <span
          className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          style={{ background: "hsl(var(--foreground) / 0.025)" }}
        />
      )}

      <span
        ref={iconRef}
        className={`relative z-10 ${isActive ? 'text-foreground' : 'text-inherit'}`}
        style={{ transition: "transform 0.12s cubic-bezier(0.34,1.56,0.64,1)", willChange: "transform" }}
      >
        <item.icon className="w-4 h-4" />
      </span>
      <span className="relative z-10 flex-1" style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "0.01em", fontSize: "0.8125rem" }}>
        {item.label}
      </span>
      {item.badge && (
        <span className="ml-auto relative z-10 border border-foreground/20 text-foreground bg-foreground/5 rounded font-mono text-[10px] font-bold tracking-widest px-1.5 py-0.5 uppercase">
          {item.badge}
        </span>
      )}
    </Link>
  );
}

export default function DevSidebar() {
  const location = useLocation();

  return (
    <aside
      className="w-64 min-h-screen flex-shrink-0 hidden lg:flex flex-col bg-background/50 backdrop-blur-xl border-r border-border"
      style={{ position: "relative", zIndex: 10 }}
    >
      {/* Logo area */}
      <div className="p-5 pt-8 border-b border-border">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 mb-5 text-xs group transition-colors"
          style={{ color: "hsl(var(--foreground) / 0.2)", fontFamily: "'Inter', sans-serif", letterSpacing: "0.03em" }}
        >
          <ArrowLeft className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform" />
          <span className="group-hover:text-white/50 transition-colors">Back to Marketplace</span>
        </Link>

        <div className="flex items-center gap-3">
          <div className="logo-mark w-10 h-10 rounded-xl flex items-center justify-center bg-foreground text-background">
            <span className="font-bold text-sm relative z-10" style={{ fontFamily: "Georgia, serif" }}>D</span>
          </div>
          <div>
            <span className="text-foreground font-bold text-sm block" style={{ fontFamily: "Georgia, serif", letterSpacing: "-0.03em" }}>
              Developer
            </span>
            <span className="block text-foreground/50 font-mono text-[9px] tracking-widest uppercase">
              Command Center
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-3 overflow-y-auto premium-scroll">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="mb-2">
            <div className="nav-section-label">{group.label}</div>
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <MagneticNavItem
                  key={item.path}
                  item={item}
                  isActive={
                    item.path === "/developer"
                      ? location.pathname === "/developer"
                      : location.pathname.startsWith(item.path)
                  }
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom status + settings */}
      <div className="border-t border-border p-4 space-y-3">
        <Link
          to="/settings"
          className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl transition-all group text-foreground/50 hover:text-foreground hover:bg-foreground/5"
        >
          <Settings className="w-4 h-4" />
          <span className="text-xs font-medium" style={{ fontFamily: "'Inter', sans-serif" }}>Settings</span>
        </Link>
        <div className="flex items-center gap-2.5 px-3.5 py-3 rounded-xl border border-border">
          <div className="relative">
            <span className="block w-2.5 h-2.5 rounded-full flex-shrink-0 bg-foreground" />
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
    </aside>
  );
}