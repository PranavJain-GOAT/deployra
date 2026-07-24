import { useState } from 'react';
import { useContests } from '@/hooks/useContests';
import ContestCard from '@/components/common/ContestCard';
import { ContestPlatform } from '@/types';
import { Loader2, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQueryClient } from '@tanstack/react-query';

const PLATFORMS: Array<{ value: ContestPlatform | 'all'; label: string; emoji: string }> = [
  { value: 'all',        label: 'All',        emoji: '🏆' },
  { value: 'codeforces', label: 'Codeforces', emoji: '🔵' },
  { value: 'leetcode',   label: 'LeetCode',   emoji: '🟠' },
  { value: 'codechef',   label: 'CodeChef',   emoji: '👨‍🍳' },
  { value: 'atcoder',    label: 'AtCoder',    emoji: '🟣' },
];

export default function ContestsPage() {
  const { data: contests = [], isLoading, isFetching } = useContests();
  const [platform, setPlatform] = useState<ContestPlatform | 'all'>('all');
  const qc = useQueryClient();

  const filtered = platform === 'all'
    ? contests
    : contests.filter(c => c.platform === platform);

  const upcoming = filtered.filter(c => new Date(c.startTime) > new Date());
  const live     = filtered.filter(c => new Date(c.startTime) <= new Date() && new Date(c.endTime) >= new Date());

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Coding Contests</h2>
          <p className="text-sm text-muted mt-1">Live and upcoming contests from all platforms</p>
        </div>
        <button
          onClick={() => qc.invalidateQueries({ queryKey: ['contests'] })}
          className={cn('btn-ghost text-xs', isFetching && 'opacity-50 pointer-events-none')}
        >
          <RefreshCw size={13} className={isFetching ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Platform tabs */}
      <div className="flex gap-1.5 flex-wrap">
        {PLATFORMS.map(p => (
          <button
            key={p.value}
            onClick={() => setPlatform(p.value)}
            className={cn(
              'px-3 py-1.5 rounded-md text-xs font-medium transition-colors border',
              platform === p.value
                ? 'bg-card text-foreground border-zinc-600'
                : 'text-muted hover:text-foreground hover:bg-card border-transparent'
            )}
          >
            {p.emoji} {p.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 text-muted text-sm py-16 justify-center">
          <Loader2 size={16} className="animate-spin" /> Fetching live contests...
        </div>
      ) : (
        <div className="space-y-6">
          {/* Live now */}
          {live.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1.5 h-1.5 rounded-full bg-danger animate-pulse" />
                <h3 className="section-title">Live Now</h3>
                <span className="badge badge-critical">{live.length}</span>
              </div>
              <div className="space-y-2">
                {live.map(c => <ContestCard key={c.id} contest={c} />)}
              </div>
            </section>
          )}

          {/* Upcoming */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <h3 className="section-title">Upcoming</h3>
              <span className="text-xs text-muted">{upcoming.length} contests</span>
            </div>
            {upcoming.length === 0 ? (
              <div className="card p-12 text-center text-xs text-muted">
                No upcoming contests for this platform. Check back later.
              </div>
            ) : (
              <div className="space-y-2">
                {upcoming.map(c => <ContestCard key={c.id} contest={c} />)}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
