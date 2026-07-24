import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, LayoutDashboard, Rss, Trophy, Calendar, Clock, Mail, MessageSquare, Settings, Bell, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const COMMANDS = [
  { id: 'dashboard',     label: 'Dashboard',       icon: LayoutDashboard, to: '/',             desc: 'What do I need to do today?' },
  { id: 'feed',          label: 'Priority Feed',   icon: Rss,             to: '/feed',         desc: 'Unified AI priority timeline' },
  { id: 'contests',      label: 'Contests',        icon: Trophy,          to: '/contests',     desc: 'Upcoming coding contests' },
  { id: 'deadlines',     label: 'Deadlines',       icon: Clock,           to: '/deadlines',    desc: 'All pending deadlines' },
  { id: 'calendar',      label: 'Calendar',        icon: Calendar,        to: '/calendar',     desc: 'Schedule and events' },
  { id: 'email',         label: 'Email',           icon: Mail,            to: '/email',        desc: 'Important detected emails' },
  { id: 'whatsapp',      label: 'WhatsApp',        icon: MessageSquare,   to: '/whatsapp',     desc: 'Important WhatsApp messages' },
  { id: 'notifications', label: 'Notifications',  icon: Bell,            to: '/notifications',desc: 'Alert history' },
  { id: 'settings',      label: 'Settings',        icon: Settings,        to: '/settings',     desc: 'Connect accounts and configure' },
];

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const filtered = COMMANDS.filter(c =>
    c.label.toLowerCase().includes(query.toLowerCase()) ||
    c.desc.toLowerCase().includes(query.toLowerCase())
  );

  const go = useCallback((to: string) => {
    navigate(to);
    onClose();
    setQuery('');
    setSelected(0);
  }, [navigate, onClose]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelected(0);
    }
  }, [isOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key === 'ArrowDown') { e.preventDefault(); setSelected(s => Math.min(s + 1, filtered.length - 1)); }
      if (e.key === 'ArrowUp')   { e.preventDefault(); setSelected(s => Math.max(s - 1, 0)); }
      if (e.key === 'Enter' && filtered[selected]) go(filtered[selected].to);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, filtered, selected, go, onClose]);

  useEffect(() => { setSelected(0); }, [query]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60" />

          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -8 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="relative w-full max-w-lg mx-4 bg-card border border-border rounded-xl shadow-2xl overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Search Input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
              <Search size={16} className="text-muted shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search pages, actions..."
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted outline-none"
              />
              <button onClick={onClose} className="text-muted hover:text-foreground transition-colors">
                <X size={14} />
              </button>
            </div>

            {/* Results */}
            <div className="py-1.5 max-h-80 overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-muted">No results found</div>
              ) : (
                filtered.map((cmd, i) => {
                  const Icon = cmd.icon;
                  return (
                    <button
                      key={cmd.id}
                      onClick={() => go(cmd.to)}
                      className={cn(
                        'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors duration-100',
                        i === selected ? 'bg-secondary text-foreground' : 'text-muted hover:bg-secondary/50 hover:text-foreground'
                      )}
                    >
                      <div className={cn('p-1.5 rounded-md', i === selected ? 'bg-blue/20' : 'bg-card')}>
                        <Icon size={14} className={i === selected ? 'text-blue' : 'text-muted'} />
                      </div>
                      <div>
                        <div className="text-sm font-medium">{cmd.label}</div>
                        <div className="text-xs text-muted">{cmd.desc}</div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center gap-4 px-4 py-2 border-t border-border">
              <span className="flex items-center gap-1 text-xs text-muted">
                <kbd className="px-1 py-0.5 bg-background border border-border rounded text-[10px] font-mono">↑↓</kbd> navigate
              </span>
              <span className="flex items-center gap-1 text-xs text-muted">
                <kbd className="px-1 py-0.5 bg-background border border-border rounded text-[10px] font-mono">↵</kbd> open
              </span>
              <span className="flex items-center gap-1 text-xs text-muted">
                <kbd className="px-1 py-0.5 bg-background border border-border rounded text-[10px] font-mono">Esc</kbd> close
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
