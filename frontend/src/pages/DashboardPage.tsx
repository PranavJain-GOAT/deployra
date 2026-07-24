import { AnimatePresence, motion } from 'framer-motion';
import { useFeed, useEmailFeed, useWhatsAppFeed } from '@/hooks/useFeed';
import { useContests } from '@/hooks/useContests';
import PriorityCard from '@/components/common/PriorityCard';
import ContestCard from '@/components/common/ContestCard';
import { AlertTriangle, Mail, MessageSquare, Trophy, Clock, Loader2 } from 'lucide-react';

function StatCard({ icon: Icon, label, value, color }: { icon: typeof Mail; label: string; value: number; color: string }) {
  return (
    <div className="card p-4 flex items-center gap-4">
      <div className={`p-2.5 rounded-lg ${color}`}>
        <Icon size={18} />
      </div>
      <div>
        <div className="text-2xl font-bold tabular-nums">{value}</div>
        <div className="text-xs text-muted">{label}</div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { data: feed = [], isLoading: feedLoading } = useFeed();
  const { data: emails = [] } = useEmailFeed();
  const { data: messages = [] } = useWhatsAppFeed();
  const { data: contests = [] } = useContests();

  const critical = feed.filter(f => f.priority === 'critical');
  const high = feed.filter(f => f.priority === 'high');
  const upcoming = contests.filter(c => new Date(c.startTime) > new Date()).slice(0, 3);
  const todayItems = feed.filter(f => {
    if (!f.deadline) return false;
    const d = new Date(f.deadline);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold">What do I need to do today?</h2>
        <p className="text-sm text-muted mt-1">
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={AlertTriangle} label="Critical alerts" value={critical.length} color="bg-danger/10 text-danger" />
        <StatCard icon={Mail}         label="Important emails" value={emails.length}  color="bg-blue/10 text-blue" />
        <StatCard icon={MessageSquare}label="WhatsApp alerts"  value={messages.length}color="bg-success/10 text-success" />
        <StatCard icon={Trophy}       label="Contests today"   value={upcoming.length} color="bg-purple/10 text-purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Critical + High priority — left 2/3 */}
        <div className="lg:col-span-2 space-y-6">

          {/* 🔴 Critical */}
          {critical.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1.5 h-1.5 rounded-full bg-danger animate-pulse" />
                <h3 className="section-title">Critical Alerts</h3>
                <span className="badge badge-critical">{critical.length}</span>
              </div>
              <div className="space-y-3">
                <AnimatePresence>
                  {critical.map(item => <PriorityCard key={item.id} item={item} />)}
                </AnimatePresence>
              </div>
            </section>
          )}

          {/* 🟠 High */}
          {high.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1.5 h-1.5 rounded-full bg-warning" />
                <h3 className="section-title">High Priority</h3>
                <span className="badge badge-high">{high.length}</span>
              </div>
              <div className="space-y-3">
                <AnimatePresence>
                  {high.slice(0, 4).map(item => <PriorityCard key={item.id} item={item} />)}
                </AnimatePresence>
              </div>
            </section>
          )}

          {feedLoading && (
            <div className="flex items-center gap-2 text-muted text-sm py-8 justify-center">
              <Loader2 size={16} className="animate-spin" /> Loading your feed...
            </div>
          )}

          {!feedLoading && feed.length === 0 && (
            <div className="card p-12 text-center">
              <div className="text-4xl mb-3">✅</div>
              <div className="text-sm font-medium text-foreground">All clear!</div>
              <div className="text-xs text-muted mt-1">No pending items. Enjoy your day.</div>
            </div>
          )}
        </div>

        {/* Right sidebar — Upcoming contests + today deadlines */}
        <div className="space-y-6">
          {/* Contests */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Trophy size={12} className="text-muted" />
              <h3 className="section-title">Upcoming Contests</h3>
            </div>
            {upcoming.length === 0 ? (
              <div className="card p-6 text-center text-xs text-muted">No contests soon</div>
            ) : (
              <div className="space-y-2">
                {upcoming.map(c => <ContestCard key={c.id} contest={c} />)}
              </div>
            )}
          </section>

          {/* Today's deadlines */}
          {todayItems.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Clock size={12} className="text-muted" />
                <h3 className="section-title">Due Today</h3>
              </div>
              <div className="space-y-2">
                {todayItems.map(item => <PriorityCard key={item.id} item={item} compact />)}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
