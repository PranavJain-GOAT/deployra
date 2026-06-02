import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, ShoppingBag, Rocket, Search,
  Heart, MessageSquare, CreditCard, ArrowLeft, Users,
  HeadphonesIcon, FileText, Layers, Building2, Settings,
  Shield
} from "lucide-react";
import { useRef } from "react";

const NAV_GROUPS = [
  {
    label: "Operations",
    items: [
      { path: "/client",              label: "Business Dashboard",  icon: LayoutDashboard },
      { path: "/client/orders",       label: "Order Lifecycle",     icon: ShoppingBag     },
      { path: "/client/deployments",  label: "Deployments",         icon: Rocket          },
      { path: "/client/escrow",       label: "Escrow Tracker",      icon: Shield          },
    ],
  },
  {
    label: "Marketplace",
    items: [
      { path: "/client/marketplace",  label: "Discover Products",  icon: Search          },
      { path: "/client/saved",        label: "Saved & Watchlists", icon: Heart           },
      { path: "/client/hire",         label: "Dev Direct",         icon: Users           },
    ],
  },
  {
    label: "Communication",
    items: [
      { path: "/client/messages",     label: "Inbox",              icon: MessageSquare   },
      { path: "/client/support",      label: "Support Tickets",    icon: HeadphonesIcon  },
    ],
  },
  {
    label: "Finance",
    items: [
      { path: "/client/billing",      label: "Billing Dashboard",  icon: CreditCard      },
      { path: "/client/invoices",     label: "Invoice Center",     icon: FileText        },
    ],
  },
  {
    label: "Account",
    items: [
      { path: "/client/team",         label: "Team Management",    icon: Building2       },
      { path: "/client/integrations", label: "Integrations",       icon: Layers, badge: "NEW" },
    ],
  },
];

function MagneticNavItem({ item, isActive }) {
  const ref = useRef(null);

  const handleMouseMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) * 0.22;
    const dy = (e.clientY - cy) * 0.22;
    el.style.transform = `translate(${dx}px, ${dy}px)`;
  };

  const handleMouseLeave = () => {
    if (ref.current) ref.current.style.transform = "";
  };

  return (
    <Link
      to={item.path}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      title={item.hint}
      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all relative group ${
        isActive ? "text-foreground" : "text-foreground/60 hover:text-foreground/90"
      }`}
      style={{
        background: isActive ? "rgba(150,150,150,0.08)" : "transparent",
        boxShadow: isActive ? "inset 0 0 0 0.5px rgba(150,150,150,0.15)" : "none",
      }}
    >
      {isActive && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-r-full bg-foreground" />
      )}
      {!isActive && (
        <span
          className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          style={{ background: "hsl(var(--foreground) / 0.03)" }}
        />
      )}

      <span ref={ref} className="magnetic-icon relative z-10">
        <item.icon className={`w-4 h-4 ${isActive ? 'text-foreground' : 'text-inherit'}`} />
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

export default function ClientSidebar() {
  const location = useLocation();

  return (
    <aside
      className="w-64 min-h-screen flex-shrink-0 hidden lg:flex flex-col bg-background/50 backdrop-blur-xl border-r border-border"
      style={{ position: "relative", zIndex: 10 }}
    >
      {/* Top Logo Area */}
      <div className="p-5 border-b border-border">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 mb-5 text-xs group transition-colors"
          style={{ color: "hsl(var(--foreground) / 0.2)", fontFamily: "'Inter', sans-serif", letterSpacing: "0.03em" }}
        >
          <ArrowLeft className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform" />
          <span className="group-hover:text-white/50 transition-colors">Back to Marketplace</span>
        </Link>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden bg-transparent">
            <img src="/logo.png" alt="Deployra Logo" className="w-9 h-9 object-contain" />
          </div>
          <div>
            <span className="text-foreground font-bold text-sm block" style={{ fontFamily: "Georgia, serif", letterSpacing: "-0.03em" }}>
              Business Hub
            </span>
            <span className="block text-foreground/50 font-mono text-[9px] tracking-widest uppercase">
              Operations Center
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
                    item.path === "/client"
                      ? location.pathname === "/client"
                      : location.pathname.startsWith(item.path)
                  }
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom */}
      <div className="border-t border-border p-4 space-y-2">
        <Link
          to="/settings"
          className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl transition-all text-foreground/50 hover:text-foreground hover:bg-foreground/5"
        >
          <Settings className="w-4 h-4" />
          <span className="text-xs font-medium" style={{ fontFamily: "'Inter', sans-serif" }}>Settings</span>
        </Link>
      </div>
    </aside>
  );
}
