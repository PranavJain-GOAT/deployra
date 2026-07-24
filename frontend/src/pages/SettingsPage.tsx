import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { ApiResponse } from '@/types';
import { cn } from '@/lib/utils';
import { Mail, MessageSquare, Code2, Trophy, Check, X, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

interface Settings {
  connections: {
    gmail: { connected: boolean; email: string };
    whatsapp: { connected: boolean; phone: string };
    codeforces: { connected: boolean; handle: string };
    leetcode: { connected: boolean; username: string };
    telegram: { connected: boolean; chatId: string };
  };
  reminders: { timings: number[]; soundEnabled: boolean; browserPush: boolean; repeatUntilDone: boolean };
  keywords: { critical: string[]; high: string[]; ignore: string[] };
}

function ConnectionRow({ icon: Icon, label, description, connected, onConnect, onDisconnect, children }: {
  icon: typeof Mail; label: string; description: string;
  connected: boolean; onConnect: () => void; onDisconnect: () => void; children?: React.ReactNode;
}) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="card p-4">
      <div className="flex items-center gap-3">
        <div className={cn('p-2 rounded-lg', connected ? 'bg-success/10 text-success' : 'bg-card text-muted')}>
          <Icon size={16} />
        </div>
        <div className="flex-1">
          <div className="text-sm font-medium flex items-center gap-2">
            {label}
            {connected && <span className="badge bg-success/10 text-success border border-success/20 text-[10px]">Connected</span>}
          </div>
          <div className="text-xs text-muted">{description}</div>
        </div>
        {connected ? (
          <button onClick={onDisconnect} className="btn-danger text-xs py-1 px-2.5">
            <X size={11} /> Disconnect
          </button>
        ) : (
          <button onClick={() => setExpanded(e => !e)} className="btn-primary text-xs py-1 px-2.5">
            Connect <ChevronRight size={11} className={cn('transition-transform', expanded && 'rotate-90')} />
          </button>
        )}
      </div>
      {expanded && !connected && (
        <div className="mt-3 pt-3 border-t border-border space-y-2">
          {children}
          <button onClick={onConnect} className="btn-primary text-xs w-full justify-center">
            <Check size={12} /> Save & Connect
          </button>
        </div>
      )}
    </div>
  );
}

export default function SettingsPage() {
  const qc = useQueryClient();
  const [gmailEmail, setGmailEmail] = useState('');
  const [cfHandle, setCfHandle] = useState('');
  const [lcUsername, setLcUsername] = useState('');

  const { data: settings } = useQuery<Settings>({
    queryKey: ['settings'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Settings>>('/settings');
      return data.data!;
    },
  });

  const connect = useMutation({
    mutationFn: ({ source, config }: { source: string; config: object }) =>
      api.post(`/settings/connect/${source}`, config),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['settings'] }); toast.success('Connected!'); },
  });

  const disconnect = useMutation({
    mutationFn: (source: string) => api.delete(`/settings/connect/${source}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['settings'] }); toast('Disconnected'); },
  });

  const updateReminders = useMutation({
    mutationFn: (data: object) => api.patch('/settings', { reminders: data }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['settings'] }); toast.success('Saved'); },
  });

  const conns = settings?.connections;
  const reminders = settings?.reminders;

  return (
    <div className="space-y-8 animate-fade-in max-w-2xl">
      <div>
        <h2 className="text-xl font-semibold">Settings</h2>
        <p className="text-sm text-muted mt-1">Connect your accounts and configure reminder preferences</p>
      </div>

      {/* Connections */}
      <section className="space-y-3">
        <h3 className="section-title">Connected Accounts</h3>

        <ConnectionRow
          icon={Mail} label="Gmail" description="Scan for important emails — placements, OAs, deadlines"
          connected={conns?.gmail.connected ?? false}
          onConnect={() => connect.mutate({ source: 'gmail', config: { email: gmailEmail } })}
          onDisconnect={() => disconnect.mutate('gmail')}
        >
          <input value={gmailEmail} onChange={e => setGmailEmail(e.target.value)} placeholder="your@gmail.com" className="input text-sm" />
          <p className="text-xs text-muted">Use a Gmail App Password (not your real password). Free, no API key needed.</p>
        </ConnectionRow>

        <ConnectionRow
          icon={MessageSquare} label="WhatsApp" description="Parse important messages from groups and chats (via Baileys)"
          connected={conns?.whatsapp.connected ?? false}
          onConnect={() => connect.mutate({ source: 'whatsapp', config: { phone: 'scanned' } })}
          onDisconnect={() => disconnect.mutate('whatsapp')}
        >
          <div className="card p-3 text-xs text-muted bg-secondary">
            Scan QR code to connect your WhatsApp. Works like WhatsApp Web — no phone number stored.
          </div>
        </ConnectionRow>

        <ConnectionRow
          icon={Trophy} label="Codeforces" description="Track upcoming contests and get contest reminders"
          connected={conns?.codeforces.connected ?? false}
          onConnect={() => connect.mutate({ source: 'codeforces', config: { handle: cfHandle } })}
          onDisconnect={() => disconnect.mutate('codeforces')}
        >
          <input value={cfHandle} onChange={e => setCfHandle(e.target.value)} placeholder="your_cf_handle" className="input text-sm" />
        </ConnectionRow>

        <ConnectionRow
          icon={Code2} label="LeetCode" description="Track weekly/biweekly contests and daily challenges"
          connected={conns?.leetcode.connected ?? false}
          onConnect={() => connect.mutate({ source: 'leetcode', config: { username: lcUsername } })}
          onDisconnect={() => disconnect.mutate('leetcode')}
        >
          <input value={lcUsername} onChange={e => setLcUsername(e.target.value)} placeholder="your_leetcode_username" className="input text-sm" />
        </ConnectionRow>

      </section>

      {/* Reminder timings */}
      <section className="space-y-3">
        <h3 className="section-title">Reminder Settings</h3>
        <div className="card p-4 space-y-4">
          <div>
            <div className="text-sm font-medium mb-2">Reminder timings (minutes before deadline)</div>
            <div className="flex gap-2 flex-wrap">
              {(reminders?.timings ?? [1440, 60, 15]).map(t => (
                <span key={t} className="badge bg-card border border-border text-foreground text-xs">
                  {t >= 60 ? `${t / 60}h` : `${t}m`}
                </span>
              ))}
            </div>
            <p className="text-xs text-muted mt-2">Default: 24h, 1h, and 15min before deadline</p>
          </div>

          <div className="flex items-center justify-between py-2 border-t border-border">
            <div>
              <div className="text-sm font-medium">Sound Alerts</div>
              <div className="text-xs text-muted">Play a chime for critical items</div>
            </div>
            <div className={cn('w-8 h-4 rounded-full transition-colors relative cursor-pointer', reminders?.soundEnabled ? 'bg-blue' : 'bg-border')}>
              <div className={cn('w-3 h-3 rounded-full bg-white absolute top-0.5 transition-transform', reminders?.soundEnabled ? 'translate-x-4' : 'translate-x-0.5')} />
            </div>
          </div>

          <div className="flex items-center justify-between py-2 border-t border-border">
            <div>
              <div className="text-sm font-medium">Repeat Until Done</div>
              <div className="text-xs text-muted">Keep notifying until you mark an item complete</div>
            </div>
            <div className={cn('w-8 h-4 rounded-full transition-colors relative cursor-pointer', reminders?.repeatUntilDone ? 'bg-blue' : 'bg-border')}>
              <div className={cn('w-3 h-3 rounded-full bg-white absolute top-0.5 transition-transform', reminders?.repeatUntilDone ? 'translate-x-4' : 'translate-x-0.5')} />
            </div>
          </div>
        </div>
      </section>

      {/* Keywords */}
      <section className="space-y-3">
        <h3 className="section-title">Priority Keywords</h3>
        <div className="card p-4 space-y-4">
          {(['critical', 'high', 'ignore'] as const).map(level => (
            <div key={level}>
              <div className={cn('text-xs font-medium mb-2 capitalize', level === 'critical' ? 'text-danger' : level === 'high' ? 'text-warning' : 'text-muted')}>
                {level === 'ignore' ? '🚫 Ignore' : level === 'critical' ? '🔴 Critical' : '🟠 High'}
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {(settings?.keywords[level] ?? []).map(kw => (
                  <span key={kw} className="px-2 py-0.5 bg-secondary border border-border rounded text-xs text-foreground">
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
