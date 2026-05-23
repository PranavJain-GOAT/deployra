import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, CheckCheck, Package, CreditCard, MessageSquare,
  AlertCircle, Info, X, Inbox
} from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { useTheme } from '@/lib/ThemeContext';
import { formatDistanceToNow } from 'date-fns';

// ── Notification type → icon + color ──────────────────────────────────────────
const TYPE_CONFIG = {
  payment:  { icon: CreditCard,     color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  order:    { icon: Package,        color: 'text-violet-400',  bg: 'bg-violet-400/10'  },
  message:  { icon: MessageSquare,  color: 'text-sky-400',     bg: 'bg-sky-400/10'     },
  warning:  { icon: AlertCircle,    color: 'text-amber-400',   bg: 'bg-amber-400/10'   },
  system:   { icon: Info,           color: 'text-slate-400',   bg: 'bg-slate-400/10'   },
  default:  { icon: Bell,           color: 'text-slate-400',   bg: 'bg-slate-400/10'   },
};

function getTypeConfig(type = '') {
  const key = type.toLowerCase();
  return TYPE_CONFIG[key] || TYPE_CONFIG.default;
}

function formatTime(date) {
  if (!date) return '';
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  } catch {
    return '';
  }
}

// ── Skeleton loader ─────────────────────────────────────────────────────────
function NotifSkeleton() {
  return (
    <div className="flex items-start gap-3 px-4 py-3 animate-pulse">
      <div className="w-8 h-8 rounded-full bg-white/5 shrink-0" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3 w-3/4 rounded bg-white/5" />
        <div className="h-2.5 w-full rounded bg-white/5" />
        <div className="h-2 w-1/4 rounded bg-white/5" />
      </div>
    </div>
  );
}

// ── Single notification row ───────────────────────────────────────────────────
function NotifItem({ notif, onRead }) {
  const { isDark } = useTheme();
  const cfg = getTypeConfig(notif.type);
  const Icon = cfg.icon;

  return (
    <motion.button
      layout
      onClick={() => !notif.isRead && onRead(notif.id)}
      className={`w-full flex items-start gap-3 px-4 py-3 text-left group transition-all
        ${!notif.isRead
          ? isDark ? 'bg-white/[0.03] hover:bg-white/[0.06]' : 'bg-black/[0.03] hover:bg-black/[0.05]'
          : isDark ? 'hover:bg-white/[0.03]' : 'hover:bg-black/[0.02]'
        }`}
      whileHover={{ x: 1 }}
    >
      {/* Icon bubble */}
      <span className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center ${cfg.bg}`}>
        <Icon className={`w-3.5 h-3.5 ${cfg.color}`} />
      </span>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={`text-xs font-semibold truncate
          ${isDark ? 'text-white/90' : 'text-neutral-900'}`}>
          {notif.title}
        </p>
        <p className={`text-[11px] mt-0.5 leading-relaxed line-clamp-2
          ${isDark ? 'text-white/45' : 'text-neutral-500'}`}>
          {notif.message}
        </p>
        <p className={`text-[10px] mt-1 ${isDark ? 'text-white/25' : 'text-neutral-400'}`}>
          {formatTime(notif.createdAt)}
        </p>
      </div>

      {/* Unread dot */}
      {!notif.isRead && (
        <span className="w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0 mt-1.5" />
      )}
    </motion.button>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const { isDark } = useTheme();
  const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead } = useNotifications();

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  const panelBg  = isDark ? 'bg-[#111111] border-white/8' : 'bg-white border-black/8';
  const headerBg = isDark ? 'border-white/6' : 'border-black/6';

  return (
    <div ref={ref} className="relative">
      {/* ── Bell trigger ── */}
      <motion.button
        id="notification-bell-btn"
        aria-label={`Notifications${unreadCount > 0 ? ` — ${unreadCount} unread` : ''}`}
        onClick={() => setOpen(v => !v)}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.93 }}
        className={`relative flex items-center justify-center w-8 h-8 rounded-full transition-all
          ${isDark ? 'text-white/50 hover:text-white hover:bg-white/8' : 'text-neutral-500 hover:text-neutral-900 hover:bg-black/6'}`}
      >
        <Bell className="w-[17px] h-[17px]" />

        {/* Unread badge */}
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              key="badge"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] px-1 rounded-full
                bg-violet-500 text-white text-[9px] font-bold flex items-center justify-center
                ring-[1.5px] ring-[#111111]"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* ── Dropdown panel ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className={`absolute right-0 top-full mt-2 w-[360px] rounded-2xl border shadow-2xl overflow-hidden z-50 ${panelBg}`}
            style={{ boxShadow: isDark
              ? '0 24px 80px -8px rgba(0,0,0,0.8), 0 0 0 0.5px rgba(255,255,255,0.05)'
              : '0 24px 80px -8px rgba(0,0,0,0.15), 0 0 0 0.5px rgba(0,0,0,0.06)' }}
            role="dialog"
            aria-label="Notifications panel"
          >
            {/* Header */}
            <div className={`flex items-center justify-between px-4 py-3.5 border-b ${headerBg}`}>
              <div className="flex items-center gap-2">
                <Bell className={`w-3.5 h-3.5 ${isDark ? 'text-white/40' : 'text-neutral-400'}`} />
                <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-neutral-900'}`}>
                  Notifications
                </span>
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-violet-500/15 text-violet-400 text-[10px] font-bold">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                {unreadCount > 0 && (
                  <motion.button
                    onClick={() => markAllAsRead()}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-lg transition-all
                      ${isDark ? 'text-white/40 hover:text-white hover:bg-white/6' : 'text-neutral-400 hover:text-neutral-700 hover:bg-black/5'}`}
                  >
                    <CheckCheck className="w-3 h-3" />
                    Mark all read
                  </motion.button>
                )}
                <motion.button
                  onClick={() => setOpen(false)}
                  whileTap={{ scale: 0.9 }}
                  className={`p-1 rounded-lg transition-all
                    ${isDark ? 'text-white/30 hover:text-white/60 hover:bg-white/5' : 'text-neutral-300 hover:text-neutral-600 hover:bg-black/4'}`}
                >
                  <X className="w-3.5 h-3.5" />
                </motion.button>
              </div>
            </div>

            {/* Body */}
            <div className="max-h-[400px] overflow-y-auto">
              {isLoading ? (
                <div className="py-2">
                  {[...Array(4)].map((_, i) => <NotifSkeleton key={i} />)}
                </div>
              ) : notifications.length === 0 ? (
                /* Empty state */
                <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3
                    ${isDark ? 'bg-white/4' : 'bg-black/4'}`}>
                    <Inbox className={`w-5 h-5 ${isDark ? 'text-white/20' : 'text-neutral-300'}`} />
                  </div>
                  <p className={`text-xs font-semibold ${isDark ? 'text-white/40' : 'text-neutral-400'}`}>
                    All caught up!
                  </p>
                  <p className={`text-[11px] mt-0.5 ${isDark ? 'text-white/20' : 'text-neutral-300'}`}>
                    No notifications yet
                  </p>
                </div>
              ) : (
                <motion.div layout className="py-1">
                  {notifications.map(n => (
                    <NotifItem key={n.id} notif={n} onRead={markAsRead} />
                  ))}
                </motion.div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className={`px-4 py-2.5 border-t ${headerBg} flex items-center justify-center`}>
                <span className={`text-[10px] ${isDark ? 'text-white/20' : 'text-neutral-300'}`}>
                  Showing {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
                </span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
