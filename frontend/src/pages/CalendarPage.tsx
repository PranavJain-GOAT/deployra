import { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Deadline, ApiResponse } from '@/types';
import { cn, PRIORITY_CONFIG } from '@/lib/utils';

export default function CalendarPage() {
  const [current, setCurrent] = useState(new Date());

  const { data: deadlines = [] } = useQuery<Deadline[]>({
    queryKey: ['deadlines'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Deadline[]>>('/deadlines');
      return data.data ?? [];
    },
  });

  const days = eachDayOfInterval({ start: startOfMonth(current), end: endOfMonth(current) });
  const startPad = startOfMonth(current).getDay();

  const getDeadlinesForDay = (day: Date) =>
    deadlines.filter(d => isSameDay(new Date(d.dueAt), day));

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-semibold">Calendar</h2>
        <p className="text-sm text-muted mt-1">Visualize all your deadlines and events</p>
      </div>

      <div className="card p-6">
        {/* Month nav */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => setCurrent(d => { const n = new Date(d); n.setMonth(n.getMonth() - 1); return n; })} className="btn-ghost p-1.5">
            <ChevronLeft size={16} />
          </button>
          <h3 className="text-sm font-semibold">{format(current, 'MMMM yyyy')}</h3>
          <button onClick={() => setCurrent(d => { const n = new Date(d); n.setMonth(n.getMonth() + 1); return n; })} className="btn-ghost p-1.5">
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 mb-2">
          {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
            <div key={d} className="text-center text-xs text-muted font-medium py-1">{d}</div>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: startPad }).map((_, i) => <div key={`pad-${i}`} />)}
          {days.map(day => {
            const dayDeadlines = getDeadlinesForDay(day);
            const today = isToday(day);
            return (
              <div
                key={day.toISOString()}
                className={cn(
                  'min-h-[60px] rounded-md p-1.5 border transition-colors',
                  today ? 'border-blue bg-blue/5' : 'border-transparent hover:border-border hover:bg-secondary'
                )}
              >
                <div className={cn('text-xs font-medium mb-1', today ? 'text-blue' : 'text-foreground')}>
                  {format(day, 'd')}
                </div>
                {dayDeadlines.slice(0, 2).map(d => (
                  <div
                    key={d.id}
                    className={cn('text-[9px] px-1 py-0.5 rounded mb-0.5 truncate', PRIORITY_CONFIG[d.priority].bg, PRIORITY_CONFIG[d.priority].color)}
                    title={d.title}
                  >
                    {d.title}
                  </div>
                ))}
                {dayDeadlines.length > 2 && (
                  <div className="text-[9px] text-muted">+{dayDeadlines.length - 2} more</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming list */}
      <section>
        <h3 className="section-title mb-3">Upcoming this month</h3>
        <div className="space-y-2">
          {deadlines
            .filter(d => d.status === 'pending' && isSameMonth(new Date(d.dueAt), current))
            .sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime())
            .map(d => (
              <div key={d.id} className={cn('card p-3 flex items-center gap-3 priority-' + d.priority)}>
                <span className={cn('badge text-[10px]', `badge-${d.priority}`)}>{PRIORITY_CONFIG[d.priority].label}</span>
                <span className="text-sm font-medium flex-1">{d.title}</span>
                <span className="text-xs text-muted">{format(new Date(d.dueAt), 'MMM d, h:mm a')}</span>
              </div>
            ))
          }
        </div>
      </section>
    </div>
  );
}
