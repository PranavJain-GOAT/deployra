import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Rss, Trophy, Calendar, Clock,
  Mail, MessageSquare, Settings, Bell, Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV = [
  { to: '/',             icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/feed',         icon: Rss,             label: 'Priority Feed' },
  { to: '/contests',     icon: Trophy,           label: 'Contests' },
  { to: '/deadlines',    icon: Clock,            label: 'Deadlines' },
  { to: '/calendar',     icon: Calendar,         label: 'Calendar' },
  { to: '/email',        icon: Mail,             label: 'Email' },
  { to: '/whatsapp',     icon: MessageSquare,    label: 'WhatsApp' },
  { to: '/notifications',icon: Bell,             label: 'Notifications' },
  { to: '/settings',     icon: Settings,         label: 'Settings' },
];

export default function Sidebar() {
  const { pathname } = useLocation();

  return (
    <aside className="flex flex-col w-56 h-screen bg-secondary border-r border-border shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 h-14 border-b border-border">
        <div className="w-7 h-7 bg-blue rounded-md flex items-center justify-center">
          <Zap size={14} className="text-white" fill="white" />
        </div>
        <span className="text-sm font-semibold tracking-tight">OmniPulse</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {NAV.map(({ to, icon: Icon, label }) => {
          const isActive = to === '/' ? pathname === '/' : pathname.startsWith(to);
          return (
            <NavLink key={to} to={to}>
              <motion.div
                whileHover={{ x: 2 }}
                transition={{ duration: 0.15 }}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150',
                  isActive
                    ? 'bg-card text-foreground'
                    : 'text-muted hover:text-foreground hover:bg-card/50'
                )}
              >
                <Icon size={16} className={isActive ? 'text-blue' : ''} />
                {label}
              </motion.div>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-border">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse-dot" />
          <span className="text-xs text-muted">System active</span>
        </div>
      </div>
    </aside>
  );
}
