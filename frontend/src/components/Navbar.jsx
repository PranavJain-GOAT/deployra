import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LiveSearch from "./home/LiveSearch";
import { useTheme } from "@/lib/ThemeContext";
import { useAuth } from "@/lib/AuthContext";
import ProfileMenu from "./ProfileMenu";


function GlitchLink({ to, label, onClick }) {
  const [glitching, setGlitching] = useState(false);
  const location = useLocation();
  const active = location.pathname === to;
  const { isDark } = useTheme();
  return (
    <Link
      to={to}
      onClick={() => { onClick?.(); }}
      onMouseEnter={() => { setGlitching(true); setTimeout(() => setGlitching(false), 400); }}
      className={`relative text-xs font-medium transition-colors px-3 py-1.5 rounded-full overflow-hidden select-none ${active
          ? isDark
            ? 'text-white bg-white/8'
            : 'text-neutral-900 bg-black/8'
          : isDark
            ? 'text-white/50 hover:text-white hover:bg-white/6'
            : 'text-neutral-500 hover:text-neutral-900 hover:bg-black/6'
        }`}
      style={{ letterSpacing: '-0.01em' }}
    >
      <span className={glitching ? 'glitch-text' : ''}>{label}</span>
    </Link>
  );
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled]     = useState(false);
  const { isDark }                  = useTheme();
  const { user, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navBg = scrolled
    ? isDark ? 'rgba(5,5,5,0.88)' : 'rgba(250,250,250,0.92)'
    : 'transparent';
  
  const navBorder = scrolled
    ? isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)'
    : '1px solid transparent';

  const logoTextColor = isDark ? '#ffffff' : '#0a0a0a';

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 px-0">
        <motion.nav
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            borderBottom: navBorder,
            background: navBg,
            backdropFilter: scrolled ? 'blur(12px)' : 'none',
            WebkitBackdropFilter: scrolled ? 'blur(12px)' : 'none',
            height: '60px',
          }}
          className="flex items-center px-4 sm:px-8"
        >
          <div className="flex items-center justify-between w-full" style={{ maxWidth: '1400px', margin: '0 auto' }}>
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 shrink-0 group z-50">
              <motion.img
                whileHover={{ scale: 1.1, rotate: 5 }}
                src="/logo.png"
                alt="Deployra Logo"
                className="w-9 h-9 sm:w-10 sm:h-10 object-contain"
              />
              <span
                className="font-bold tracking-tight text-base sm:text-xl flex items-center"
                style={{ fontFamily: 'Georgia, serif', letterSpacing: '-0.04em', color: logoTextColor }}
              >
                Deployra
              </span>
            </Link>

            {/* Live Search */}
            <div className="flex-1 hidden md:block px-8">
              <LiveSearch />
            </div>

            {/* Nav Links */}
            <div className="hidden md:flex items-center gap-1">
              {[
                { label: "Marketplace", to: "/" },
                { label: "Features",   to: "/features" },
                { label: "About",      to: "/about" },
              ].map((item) => (
                <GlitchLink key={item.label} to={item.to} label={item.label} />
              ))}
            </div>

            {/* CTAs & Profile */}
            <div className="flex items-center gap-2.5 shrink-0 ml-auto z-50">

              {isAuthenticated ? (
                <>
                  {/* World-class Profile Menu */}
                  <ProfileMenu />
                </>
              ) : (
                <Link to="/auth" className="flex">
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    className={`flex items-center gap-1.5 text-xs font-bold px-5 py-2 rounded-full transition-all ${isDark
                        ? 'text-white bg-white/10 hover:bg-white/20'
                        : 'text-white bg-gray-900 hover:bg-gray-800'
                      }`}
                  >
                    Sign In
                  </motion.button>
                </Link>
              )}
              
              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className={`md:hidden p-1 ${isDark ? 'text-white/60 hover:text-white' : 'text-neutral-500 hover:text-neutral-900'}`}
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </motion.nav>
      </div>

      {/* ── Mobile Dropdown ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-16 left-4 right-4 z-40 glass rounded-2xl p-4 space-y-2
              bg-white/95 dark:bg-[#0a0a0a]/95 backdrop-blur-xl border border-gray-100 dark:border-white/5"
          >
            {[
              { label: "Marketplace", to: "/" },
              { label: "Features",   to: "/features" },
              { label: "About",      to: "/about" },
              ...(isAuthenticated ? [
                { label: "Dashboard", to: user?.role === 'DEVELOPER' ? '/developer' : user?.role === 'ADMIN' ? '/admin' : '/client' },
              ] : [
                { label: "Login / Sign Up", to: "/auth" }
              ])
            ].map((item) => (
              <Link
                key={item.label}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={`block text-sm px-3 py-3 rounded-xl font-bold transition-colors ${isDark
                    ? 'text-white/60 hover:text-white hover:bg-white/6'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-black/6'
                  }`}
              >
                {item.label}
              </Link>
            ))}
            {isAuthenticated && (
              <button
                onClick={logout}
                className="w-full text-left block text-sm px-3 py-3 rounded-xl font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
              >
                Logout
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      <div className="h-16" />
    </>
  );
}