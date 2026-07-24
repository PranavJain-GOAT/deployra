import { useEmailFeed } from '@/hooks/useFeed';
import PriorityCard from '@/components/common/PriorityCard';
import { Loader2, Mail, ExternalLink } from 'lucide-react';

export default function EmailPage() {
  const { data: emails = [], isLoading } = useEmailFeed();
  const critical = emails.filter(e => e.priority === 'critical');
  const high     = emails.filter(e => e.priority === 'high');
  const others   = emails.filter(e => e.priority !== 'critical' && e.priority !== 'high');

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Email Inbox</h2>
          <p className="text-sm text-muted mt-1">Only important emails — AI-filtered from your Gmail</p>
        </div>
        <a href="https://mail.google.com" target="_blank" rel="noopener noreferrer" className="btn-ghost text-xs">
          Open Gmail <ExternalLink size={11} />
        </a>
      </div>

      {/* Connection notice */}
      <div className="card p-4 flex items-center gap-3 border-blue/30">
        <div className="w-2 h-2 rounded-full bg-warning animate-pulse" />
        <div className="flex-1">
          <div className="text-sm font-medium">Gmail not connected</div>
          <div className="text-xs text-muted">Showing mock data — go to Settings to connect your Gmail account</div>
        </div>
        <a href="/settings" className="btn-primary text-xs py-1 px-2.5">Connect</a>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 text-muted text-sm py-16 justify-center">
          <Loader2 size={16} className="animate-spin" /> Scanning inbox...
        </div>
      ) : (
        <div className="space-y-6">
          {critical.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1.5 h-1.5 rounded-full bg-danger animate-pulse" />
                <h3 className="section-title">Critical</h3>
                <span className="badge badge-critical">{critical.length}</span>
              </div>
              <div className="space-y-3">{critical.map(e => <PriorityCard key={e.id} item={e} />)}</div>
            </section>
          )}

          {high.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1.5 h-1.5 rounded-full bg-warning" />
                <h3 className="section-title">Important</h3>
                <span className="badge badge-high">{high.length}</span>
              </div>
              <div className="space-y-3">{high.map(e => <PriorityCard key={e.id} item={e} />)}</div>
            </section>
          )}

          {others.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <h3 className="section-title">Others</h3>
              </div>
              <div className="space-y-3">{others.map(e => <PriorityCard key={e.id} item={e} />)}</div>
            </section>
          )}

          {emails.length === 0 && (
            <div className="card p-16 text-center">
              <Mail size={32} className="text-muted mx-auto mb-3" />
              <div className="text-sm font-medium">No important emails</div>
              <div className="text-xs text-muted mt-1">Connect Gmail in Settings to start scanning</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
