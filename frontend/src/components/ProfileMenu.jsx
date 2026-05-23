import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown, LogOut, LayoutDashboard, Home, User, Bell,
  Activity, Heart, Users, Settings, Shield, KeyRound, Smartphone,
  Fingerprint, Lock, Eye, CreditCard, BarChart3, TrendingUp,
  Receipt, FileText, Zap, HelpCircle, BookOpen, Headphones,
  Bug, Lightbulb, MessageCircle, Keyboard, Sun, Moon, Monitor,
  Globe, Accessibility, BellRing, ShieldAlert,
  Camera, Trash2, ExternalLink, Package, Code2, BadgeCheck,
  Sparkles, Crown, Star
} from 'lucide-react';

import { useAuth } from '@/lib/AuthContext';
import { useTheme } from '@/lib/ThemeContext';
import { useProfile } from '@/hooks/useProfile';
import { useNotifications } from '@/hooks/useNotifications';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PLAN_CONFIG = {
  CLIENT:    { label: 'Free Plan',       color: 'text-slate-400',   bg: 'bg-slate-400/10',   icon: Star      },
  DEVELOPER: { label: 'Pro Plan',        color: 'text-violet-400',  bg: 'bg-violet-400/10',  icon: Sparkles  },
  ADMIN:     { label: 'Enterprise',      color: 'text-amber-400',   bg: 'bg-amber-400/10',   icon: Crown     },
};

const AVATAR_GRADIENT = [
  ['#667eea','#764ba2'], ['#f093fb','#f5576c'], ['#4facfe','#00f2fe'],
  ['#43e97b','#38f9d7'], ['#fa709a','#fee140'], ['#a18cd1','#fbc2eb'],
  ['#ffecd2','#fcb69f'], ['#ff9a9e','#fecfef'],
];

function getAvatarGradient(name = '') {
  const idx = name.charCodeAt(0) % AVATAR_GRADIENT.length;
  return AVATAR_GRADIENT[idx];
}

function getInitials(name) {
  if (!name) return 'U';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Avatar image with graceful fallback to colored initials */
function Avatar({ user, size = 'md' }) {
  const [imgError, setImgError] = useState(false);
  const sizes = { sm: 'w-7 h-7 text-[9px]', md: 'w-9 h-9 text-xs', lg: 'w-12 h-12 text-sm' };
  const [g1, g2] = getAvatarGradient(user?.name || '');

  if (user?.profileImage && !imgError) {
    return (
      <img
        src={user.profileImage}
        alt={user?.name || 'Avatar'}
        onError={() => setImgError(true)}
        className={`${sizes[size]} rounded-full object-cover ring-2 ring-white/10`}
        referrerPolicy="no-referrer"
      />
    );
  }

  return (
    <div
      className={`${sizes[size]} rounded-full flex items-center justify-center font-bold shrink-0`}
      style={{ background: `linear-gradient(135deg, ${g1}, ${g2})`, color: '#fff' }}
    >
      {getInitials(user?.name)}
    </div>
  );
}

/** Section divider */
function Divider({ isDark }) {
  return (
    <div className={`my-1 mx-3 h-px ${isDark ? 'bg-white/5' : 'bg-black/6'}`} />
  );
}

/** Section label */
function SectionLabel({ label, isDark }) {
  return (
    <p className={`px-3 pt-2 pb-1 text-[9px] font-bold tracking-widest uppercase
      ${isDark ? 'text-white/20' : 'text-neutral-400'}`}>
      {label}
    </p>
  );
}

/** Standard menu item row */
function MenuItem({
  icon: Icon, label, to, onClick, badge, badgeColor = 'bg-violet-500',
  danger = false, disabled = false, external = false, soon = false,
  isDark, onClose, highlight = false
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = to && location.pathname === to;

  const handleClick = useCallback(() => {
    if (disabled || soon) return;
    if (onClick) onClick();
    if (to) navigate(to);
    if (onClose) onClose();
  }, [disabled, soon, onClick, to, navigate, onClose]);

  const base = `w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium
    transition-all duration-150 relative group select-none`;

  const colorClass = danger
    ? isDark
      ? 'text-red-400 hover:text-red-300 hover:bg-red-500/10'
      : 'text-red-500 hover:text-red-600 hover:bg-red-50'
    : disabled || soon
    ? isDark
      ? 'text-white/20 cursor-default'
      : 'text-neutral-300 cursor-default'
    : isActive
    ? isDark
      ? 'text-white bg-white/8'
      : 'text-neutral-900 bg-black/8'
    : highlight
    ? isDark
      ? 'text-violet-300 hover:text-violet-200 hover:bg-violet-500/10'
      : 'text-violet-600 hover:text-violet-700 hover:bg-violet-50'
    : isDark
    ? 'text-white/60 hover:text-white hover:bg-white/6'
    : 'text-neutral-600 hover:text-neutral-900 hover:bg-black/5';

  const content = (
    <>
      {Icon && <Icon className={`w-3.5 h-3.5 shrink-0 ${danger ? '' : isActive ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'}`} />}
      <span className="flex-1 truncate">{label}</span>
      {soon && (
        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full
          ${isDark ? 'bg-white/6 text-white/30' : 'bg-black/5 text-neutral-400'}`}>
          SOON
        </span>
      )}
      {badge !== undefined && !soon && (
        <span className={`min-w-[18px] h-[18px] px-1 rounded-full text-[9px] font-bold
          text-white flex items-center justify-center ${badgeColor}`}>
          {badge > 99 ? '99+' : badge}
        </span>
      )}
      {external && !soon && (
        <ExternalLink className={`w-3 h-3 opacity-0 group-hover:opacity-40 transition-opacity`} />
      )}
    </>
  );

  if (external && to && !disabled && !soon) {
    return (
      <a href={to} target="_blank" rel="noopener noreferrer" className={`${base} ${colorClass}`}>
        {content}
      </a>
    );
  }

  return (
    <button onClick={handleClick} className={`${base} ${colorClass}`} disabled={disabled || soon}
      role="menuitem" tabIndex={disabled || soon ? -1 : 0}>
      {content}
    </button>
  );
}

/** Theme selector — 3 pill buttons */
function ThemeSelector({ isDark, theme, toggleTheme, setTheme }) {
  const options = [
    { key: 'light',  icon: Sun,     label: 'Light'  },
    { key: 'dark',   icon: Moon,    label: 'Dark'   },
    { key: 'system', icon: Monitor, label: 'System' },
  ];

  return (
    <div className={`mx-3 my-1 flex rounded-xl p-0.5 gap-0.5
      ${isDark ? 'bg-white/5' : 'bg-black/5'}`}>
      {options.map(({ key, icon: Icon, label }) => {
        const isActive = theme === key || (key === 'dark' && theme === 'dark') || (key === 'light' && theme === 'light');
        return (
          <button
            key={key}
            onClick={() => {
              if (key !== 'system') {
                // Our ThemeContext only supports 'dark' | 'light'
                if (key !== theme) toggleTheme();
              }
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[10px] font-semibold transition-all
              ${isActive
                ? isDark
                  ? 'bg-white/10 text-white shadow-sm'
                  : 'bg-white text-neutral-900 shadow-sm'
                : isDark
                ? 'text-white/30 hover:text-white/60'
                : 'text-neutral-400 hover:text-neutral-600'
              }`}
          >
            <Icon className="w-3 h-3" />
            {label}
          </button>
        );
      })}
    </div>
  );
}

// ─── Avatar Upload Overlay ────────────────────────────────────────────────────
function AvatarUploadOverlay({ user, onUpload, onRemove, isUploading, isDark }) {
  const fileRef = useRef(null);

  return (
    <div className="relative group/av inline-block">
      <Avatar user={user} size="lg" />
      {/* hover overlay */}
      <div className={`absolute inset-0 rounded-full flex flex-col items-center justify-center
        opacity-0 group-hover/av:opacity-100 transition-opacity cursor-pointer
        ${isDark ? 'bg-black/60' : 'bg-white/70'}`}
        onClick={() => fileRef.current?.click()}
      >
        <Camera className={`w-3.5 h-3.5 ${isDark ? 'text-white' : 'text-neutral-700'}`} />
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/png,image/jpeg,image/gif,image/webp"
        className="hidden"
        onChange={e => {
          const file = e.target.files?.[0];
          if (file) onUpload(file);
          e.target.value = '';
        }}
      />
      {isUploading && (
        <div className="absolute inset-0 rounded-full flex items-center justify-center bg-black/50">
          <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}

// ─── Main ProfileMenu ─────────────────────────────────────────────────────────
export default function ProfileMenu() {
  const [open, setOpen]               = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const ref = useRef(null);
  const { user, logout }  = useAuth();
  const { isDark, theme, toggleTheme } = useTheme();
  const { uploadAvatar, removeAvatar, isUploading, isRemoving, logoutAllDevices, isLoggingOut } = useProfile();
  const { unreadCount }   = useNotifications();
  const navigate          = useNavigate();

  const plan = PLAN_CONFIG[user?.role] || PLAN_CONFIG.CLIENT;
  const PlanIcon = plan.icon;
  const isGoogle = user?.authProvider === 'google';
  const isVerified = user?.isEmailVerified;
  const isDev = user?.role === 'DEVELOPER';
  const isAdmin = user?.role === 'ADMIN';
  const dashPath = isAdmin ? '/admin' : isDev ? '/developer' : '/client';

  // close on outside click
  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);

  // close on Escape
  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (e.key === 'Escape') { setOpen(false); setShowLogoutConfirm(false); } };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [open]);

  const close = useCallback(() => { setOpen(false); setShowLogoutConfirm(false); }, []);

  // ── Panel styles ────────────────────────────────────────────────────────
  const panelBg    = isDark ? 'bg-[#0f0f0f] border-white/8' : 'bg-white border-black/8';
  const headerDivider = isDark ? 'border-white/6' : 'border-black/5';

  if (!user) return null;

  return (
    <div ref={ref} className="relative">
      {/* ── Trigger button ── */}
      <motion.button
        id="profile-menu-trigger"
        aria-label="Open profile menu"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen(v => !v)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        className={`flex items-center gap-1.5 p-1 pr-2 rounded-full transition-all
          ${isDark
            ? open ? 'bg-white/10' : 'hover:bg-white/8'
            : open ? 'bg-black/8' : 'hover:bg-black/6'
          }`}
      >
        {/* Avatar with green online dot */}
        <div className="relative">
          <Avatar user={user} size="sm" />
          <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-400 ring-[1.5px]
            ring-[#0f0f0f] z-10" />
        </div>
        <ChevronDown
          className={`w-3 h-3 transition-transform duration-200
            ${isDark ? 'text-white/40' : 'text-neutral-400'}
            ${open ? 'rotate-180' : ''}`}
        />
      </motion.button>

      {/* ── Dropdown panel ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96, transition: { duration: 0.15 } }}
            transition={{ type: 'spring', stiffness: 420, damping: 32 }}
            className={`absolute right-0 top-full mt-2 w-[300px] rounded-2xl border shadow-2xl
              overflow-hidden z-[200] ${panelBg}`}
            style={{
              boxShadow: isDark
                ? '0 32px 80px -12px rgba(0,0,0,0.9), 0 0 0 0.5px rgba(255,255,255,0.06)'
                : '0 32px 80px -12px rgba(0,0,0,0.18), 0 0 0 0.5px rgba(0,0,0,0.07)',
              maxHeight: 'calc(100vh - 90px)',
              overflowY: 'auto',
            }}
            role="menu"
            aria-label="Profile menu"
          >
            {/* ═══ SECTION 1 — User Identity ═══ */}
            <div className={`px-4 pt-4 pb-3 border-b ${headerDivider}`}>
              <div className="flex items-start gap-3">
                {/* Avatar with upload */}
                <AvatarUploadOverlay
                  user={user}
                  onUpload={uploadAvatar}
                  onRemove={removeAvatar}
                  isUploading={isUploading}
                  isDark={isDark}
                />
                {/* Identity info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p className={`text-sm font-bold truncate ${isDark ? 'text-white' : 'text-neutral-900'}`}>
                      {user.name}
                    </p>
                    {isVerified && (
                      <BadgeCheck className="w-3.5 h-3.5 text-sky-400 shrink-0" title="Email verified" />
                    )}
                  </div>
                  <p className={`text-[11px] truncate mt-0.5 ${isDark ? 'text-white/40' : 'text-neutral-400'}`}>
                    {user.email}
                  </p>
                  <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                    {/* Plan badge */}
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold
                      ${plan.bg} ${plan.color}`}>
                      <PlanIcon className="w-2.5 h-2.5" />
                      {plan.label}
                    </span>
                    {/* Auth provider */}
                    {isGoogle && (
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold
                        ${isDark ? 'bg-white/6 text-white/40' : 'bg-black/5 text-neutral-500'}`}>
                        <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                        Google
                      </span>
                    )}
                    {/* Online status */}
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full
                      bg-emerald-400/10 text-emerald-400 text-[10px] font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Online
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick avatar remove if exists */}
              {user.profileImage && (
                <button
                  onClick={() => removeAvatar()}
                  className={`mt-2.5 w-full flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-[10px] font-semibold transition-all
                    ${isDark ? 'text-white/25 hover:text-red-400 hover:bg-red-500/8' : 'text-neutral-300 hover:text-red-500 hover:bg-red-50'}`}
                >
                  {isRemoving
                    ? <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                    : <Trash2 className="w-3 h-3" />
                  }
                  Remove photo
                </button>
              )}
            </div>

            {/* ═══ SECTION 2 — Core Navigation ═══ */}
            <div className="pt-1 pb-1">
              <SectionLabel label="Navigation" isDark={isDark} />
              <MenuItem icon={LayoutDashboard} label="Dashboard"       to={dashPath}             isDark={isDark} onClose={close} />
              <MenuItem icon={Home}            label="Marketplace"     to="/"                    isDark={isDark} onClose={close} />
              <MenuItem icon={User}            label="My Profile"      to={`${dashPath}/profile`} isDark={isDark} onClose={close} />
              <MenuItem icon={Bell}            label="Notifications"   to={null} onClick={close}  isDark={isDark} onClose={close}
                badge={unreadCount || undefined} badgeColor="bg-violet-500" />
              <MenuItem icon={Activity}        label="Recent Activity" soon isDark={isDark} />
              {!isDev && !isAdmin && (
                <MenuItem icon={Heart}    label="Saved Items"  to="/client/wishlist" isDark={isDark} onClose={close} />
              )}
              {!isDev && !isAdmin && (
                <MenuItem icon={Package}  label="My Orders"    to="/client/orders"   isDark={isDark} onClose={close} />
              )}
              {isDev && (
                <MenuItem icon={Code2}    label="My Listings"  to="/developer/listings" isDark={isDark} onClose={close} />
              )}
              <MenuItem icon={Users} label="Teams / Orgs" soon isDark={isDark} />
            </div>

            <Divider isDark={isDark} />

            {/* ═══ SECTION 3 — Account & Security ═══ */}
            <div className="pt-1 pb-1">
              <SectionLabel label="Account & Security" isDark={isDark} />
              <MenuItem icon={Settings}     label="Account Settings" to={dashPath}            isDark={isDark} onClose={close} />
              <MenuItem icon={Shield}       label="Security Settings" soon isDark={isDark} />
              <MenuItem icon={KeyRound}     label="Change Password"  soon isDark={isDark} />
              <MenuItem icon={Smartphone}   label="Sessions & Devices" soon isDark={isDark} />
              <MenuItem icon={Fingerprint}  label="Two-Factor Auth"  soon isDark={isDark} />
              {isDev && (
                <MenuItem icon={Lock} label="API Keys" to="/developer/api-vault" isDark={isDark} onClose={close} />
              )}
              <MenuItem icon={Eye}          label="Privacy Controls" soon isDark={isDark} />
              {isGoogle && (
                <div className={`mx-3 my-1 flex items-center gap-2 px-3 py-2 rounded-xl text-[11px]
                  ${isDark ? 'bg-white/3 text-white/30' : 'bg-black/3 text-neutral-400'}`}>
                  <BadgeCheck className="w-3.5 h-3.5 text-sky-400" />
                  Connected with Google
                </div>
              )}
            </div>

            <Divider isDark={isDark} />

            {/* ═══ SECTION 4 — Billing & Subscription ═══ */}
            <div className="pt-1 pb-1">
              <SectionLabel label="Billing" isDark={isDark} />
              {/* Upgrade CTA */}
              {user.role === 'CLIENT' && (
                <div className={`mx-3 my-1 flex items-center gap-3 px-3 py-2.5 rounded-xl border cursor-pointer
                  transition-all group
                  ${isDark
                    ? 'bg-violet-500/8 border-violet-500/20 hover:bg-violet-500/15'
                    : 'bg-violet-50 border-violet-200 hover:bg-violet-100'
                  }`}
                  onClick={() => { navigate('/pricing'); close(); }}
                >
                  <Zap className="w-4 h-4 text-violet-400 shrink-0 group-hover:scale-110 transition-transform" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold text-violet-400">Upgrade to Pro</p>
                    <p className={`text-[10px] ${isDark ? 'text-white/30' : 'text-neutral-400'}`}>
                      Unlock premium features
                    </p>
                  </div>
                  <ChevronDown className="w-3 h-3 text-violet-400/60 -rotate-90" />
                </div>
              )}
              <MenuItem icon={CreditCard}    label="Billing"            to="/client/billing"    isDark={isDark} onClose={close} />
              <MenuItem icon={BarChart3}     label="Usage Analytics"
                to={isDev ? '/developer/analytics' : null} soon={!isDev} isDark={isDark} onClose={close} />
              <MenuItem icon={Receipt}       label="Payment History"    to="/payment-history"   isDark={isDark} onClose={close} />
              <MenuItem icon={FileText}      label="Invoices"           soon isDark={isDark} />
              <MenuItem icon={TrendingUp}    label="Manage Subscription" soon isDark={isDark} />
            </div>

            <Divider isDark={isDark} />

            {/* ═══ SECTION 5 — Support & Resources ═══ */}
            <div className="pt-1 pb-1">
              <SectionLabel label="Support & Resources" isDark={isDark} />
              <MenuItem icon={HelpCircle}    label="Help Center"      to="https://docs.deployra.dev"      external isDark={isDark} />
              <MenuItem icon={BookOpen}      label="Documentation"    to="https://docs.deployra.dev"      external isDark={isDark} />
              <MenuItem icon={Headphones}    label="Contact Support"  to="mailto:support@deployra.dev"    external isDark={isDark} />
              <MenuItem icon={Bug}           label="Report a Bug"     soon isDark={isDark} />
              <MenuItem icon={Lightbulb}     label="Feature Requests" soon isDark={isDark} />
              <MenuItem icon={MessageCircle} label="Community"        to="https://discord.gg/deployra"    external isDark={isDark} />
              <MenuItem icon={Keyboard}      label="Keyboard Shortcuts" soon isDark={isDark} />
            </div>

            <Divider isDark={isDark} />

            {/* ═══ SECTION 6 — Theme & Preferences ═══ */}
            <div className="pt-1 pb-1">
              <SectionLabel label="Preferences" isDark={isDark} />
              <ThemeSelector isDark={isDark} theme={theme} toggleTheme={toggleTheme} />
              <MenuItem icon={Globe}         label="Language"                soon isDark={isDark} />
              <MenuItem icon={Accessibility} label="Accessibility"           soon isDark={isDark} />
              <MenuItem icon={BellRing}      label="Notification Preferences" soon isDark={isDark} />
            </div>

            <Divider isDark={isDark} />

            {/* ═══ SECTION 7 — Logout ═══ */}
            <div className="pt-1 pb-2">
              <SectionLabel label="Session" isDark={isDark} />

              {/* Logout confirmation state */}
              <AnimatePresence mode="wait">
                {showLogoutConfirm ? (
                  <motion.div
                    key="confirm"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mx-3 my-1"
                  >
                    <div className={`px-3 py-2.5 rounded-xl border text-[11px]
                      ${isDark
                        ? 'bg-red-500/8 border-red-500/20 text-white/60'
                        : 'bg-red-50 border-red-100 text-neutral-600'
                      }`}>
                      <p className="font-semibold mb-2">Sign out of your account?</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => { logout(); close(); }}
                          className="flex-1 py-1.5 rounded-lg bg-red-500 text-white text-[10px] font-bold
                            hover:bg-red-600 transition-colors"
                        >
                          Sign Out
                        </button>
                        <button
                          onClick={() => setShowLogoutConfirm(false)}
                          className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-colors
                            ${isDark ? 'bg-white/6 text-white/60 hover:bg-white/10' : 'bg-black/6 text-neutral-600 hover:bg-black/10'}`}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key="btns" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <MenuItem
                      icon={LogOut}
                      label="Sign Out"
                      onClick={() => setShowLogoutConfirm(true)}
                      danger
                      isDark={isDark}
                    />
                    <MenuItem
                      icon={ShieldAlert}
                      label="Sign Out All Devices"
                      onClick={logoutAllDevices}
                      danger
                      isDark={isDark}
                      badge={isLoggingOut ? undefined : undefined}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
