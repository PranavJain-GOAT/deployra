import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useFeed } from '@/hooks/useFeed';
import PriorityCard from '@/components/common/PriorityCard';
import { Priority, ItemSource } from '@/types';
import { Loader2, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';

const PRIORITY_FILTERS: Array<{ label: string; value: Priority | 'all' }> = [
  { label: 'All', value: 'all' },
  { label: '🔴 Critical', value: 'critical' },
  { label: '🟠 High', value: 'high' },
  { label: '🔵 Medium', value: 'medium' },
  { label: '⚪ Low', value: 'low' },
];

const SOURCE_FILTERS: Array<{ label: string; value: ItemSource | 'all' }> = [
  { label: 'All Sources', value: 'all' },
  { label: '📩 Email', value: 'email' },
  { label: '💬 WhatsApp', value: 'whatsapp' },
  { label: '🏆 Contests', value: 'codeforces' },
];

export default function FeedPage() {
  const { data: feed = [], isLoading } = useFeed();
  const [priority, setPriority] = useState<Priority | 'all'>('all');
  const [source, setSource] = useState<ItemSource | 'all'>('all');

  const filtered = feed
    .filter(i => priority === 'all' || i.priority === priority)
    .filter(i => source === 'all' || i.source === source);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-semibold">Priority Feed</h2>
        <p className="text-sm text-muted mt-1">Unified timeline from all your connected sources</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <Filter size={13} className="text-muted" />
        <div className="flex gap-1.5 flex-wrap">
          {PRIORITY_FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setPriority(f.value)}
              className={cn(
                'px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
                priority === f.value ? 'bg-card text-foreground border border-zinc-600' : 'text-muted hover:text-foreground hover:bg-card border border-transparent'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="w-px h-4 bg-border mx-1" />
        <div className="flex gap-1.5 flex-wrap">
          {SOURCE_FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setSource(f.value as ItemSource | 'all')}
              className={cn(
                'px-3 py-1.5 rounded-md text-xs font-medium transition-colors',
                source === f.value ? 'bg-card text-foreground border border-zinc-600' : 'text-muted hover:text-foreground hover:bg-card border border-transparent'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Feed */}
      {isLoading ? (
        <div className="flex items-center gap-2 text-muted text-sm py-16 justify-center">
          <Loader2 size={16} className="animate-spin" /> Fetching your feed...
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="text-4xl mb-3">🎉</div>
          <div className="text-sm font-medium">Nothing here</div>
          <div className="text-xs text-muted mt-1">Try changing filters or connect more sources in Settings</div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="text-xs text-muted">{filtered.length} items</div>
          <AnimatePresence mode="popLayout">
            {filtered.map(item => <PriorityCard key={item.id} item={item} />)}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
