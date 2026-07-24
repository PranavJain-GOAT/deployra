import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Deadline, ApiResponse, Priority } from '@/types';
import { cn, formatDeadline, getCountdown, PRIORITY_CONFIG } from '@/lib/utils';
import { Plus, Check, Clock, Loader2, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

function DeadlineRow({ d }: { d: Deadline }) {
  const [countdown, setCountdown] = useState(getCountdown(d.dueAt));
  const qc = useQueryClient();

  useEffect(() => {
    const t = setInterval(() => setCountdown(getCountdown(d.dueAt)), 1000);
    return () => clearInterval(t);
  }, [d.dueAt]);

  const done = useMutation({
    mutationFn: () => api.patch(`/deadlines/${d.id}`, { status: 'done' }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['deadlines'] }); toast.success('Done!'); },
  });

  const cfg = PRIORITY_CONFIG[d.priority];
  const expired = new Date(d.dueAt) < new Date();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -4 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 4 }}
      className={cn('card p-4 flex items-center gap-4 priority-' + d.priority, d.status === 'done' && 'opacity-50')}
    >
      <button
        onClick={() => done.mutate()}
        className={cn('w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors',
          d.status === 'done' ? 'bg-success border-success text-white' : 'border-border hover:border-success')}
      >
        {d.status === 'done' && <Check size={10} strokeWidth={3} />}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className={cn('badge text-[10px]', `badge-${d.priority}`)}>{cfg.label}</span>
          {d.tags.map(t => (
            <span key={t} className="px-1.5 py-0.5 text-[10px] bg-secondary border border-border rounded text-muted capitalize">{t}</span>
          ))}
        </div>
        <div className={cn('text-sm font-medium', d.status === 'done' && 'line-through text-muted')}>{d.title}</div>
        <div className={cn('text-xs mt-0.5', expired ? 'text-danger' : 'text-muted')}>
          {formatDeadline(d.dueAt)}
        </div>
      </div>

      <div className={cn('text-xs font-mono tabular-nums shrink-0', expired ? 'text-danger' : 'text-foreground')}>
        {expired ? 'Expired' : countdown}
      </div>
    </motion.div>
  );
}

export default function DeadlinesPage() {
  const [title, setTitle] = useState('');
  const [adding, setAdding] = useState(false);
  const qc = useQueryClient();

  const { data: deadlines = [], isLoading } = useQuery<Deadline[]>({
    queryKey: ['deadlines'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Deadline[]>>('/deadlines');
      return data.data ?? [];
    },
    refetchInterval: 30_000,
  });

  const create = useMutation({
    mutationFn: (t: string) => api.post('/deadlines', { title: t }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['deadlines'] }); setTitle(''); setAdding(false); toast.success('Deadline added'); },
  });

  const pending = deadlines.filter(d => d.status === 'pending');
  const done    = deadlines.filter(d => d.status === 'done');

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Deadlines</h2>
          <p className="text-sm text-muted mt-1">All your pending deadlines with live countdowns</p>
        </div>
        <button onClick={() => setAdding(a => !a)} className="btn-primary text-xs">
          <Plus size={13} /> Add Deadline
        </button>
      </div>

      {/* Add form */}
      <AnimatePresence>
        {adding && (
          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="card p-4">
            <div className="flex gap-2">
              <input
                autoFocus
                value={title}
                onChange={e => setTitle(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && title.trim() && create.mutate(title.trim())}
                placeholder="Deadline title... (AI will extract dates from your message)"
                className="input flex-1 text-sm"
              />
              <button onClick={() => title.trim() && create.mutate(title.trim())} className="btn-primary text-xs shrink-0">
                Add
              </button>
            </div>
            <p className="text-xs text-muted mt-2">Press Enter to save. Tip: include date context like "before tonight" or "by Friday"</p>
          </motion.div>
        )}
      </AnimatePresence>

      {isLoading ? (
        <div className="flex items-center gap-2 text-muted text-sm py-16 justify-center">
          <Loader2 size={16} className="animate-spin" /> Loading deadlines...
        </div>
      ) : (
        <div className="space-y-6">
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Clock size={12} className="text-muted" />
              <h3 className="section-title">Pending</h3>
              <span className="badge badge-high">{pending.length}</span>
            </div>
            <div className="space-y-2">
              <AnimatePresence mode="popLayout">
                {pending.map(d => <DeadlineRow key={d.id} d={d} />)}
              </AnimatePresence>
            </div>
          </section>

          {done.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Check size={12} className="text-muted" />
                <h3 className="section-title">Completed</h3>
                <span className="badge badge-low">{done.length}</span>
              </div>
              <div className="space-y-2">
                {done.map(d => <DeadlineRow key={d.id} d={d} />)}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
