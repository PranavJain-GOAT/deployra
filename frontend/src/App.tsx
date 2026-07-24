import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

import queryClient from '@/lib/queryClient';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import CommandPalette from '@/components/CommandPalette';
import { useReminderEngine, requestNotificationPermission } from '@/hooks/useReminders';
import { useFeed } from '@/hooks/useFeed';

import DashboardPage     from '@/pages/DashboardPage';
import FeedPage          from '@/pages/FeedPage';
import ContestsPage      from '@/pages/ContestsPage';
import CalendarPage      from '@/pages/CalendarPage';
import DeadlinesPage     from '@/pages/DeadlinesPage';
import EmailPage         from '@/pages/EmailPage';
import WhatsAppPage      from '@/pages/WhatsAppPage';
import SettingsPage      from '@/pages/SettingsPage';
import NotificationsPage from '@/pages/NotificationsPage';

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  '/':              { title: 'Dashboard',        subtitle: 'What do I need to do today?' },
  '/feed':          { title: 'Priority Feed',    subtitle: 'Unified timeline from all sources' },
  '/contests':      { title: 'Coding Contests',  subtitle: 'Live and upcoming contests' },
  '/deadlines':     { title: 'Deadlines',        subtitle: 'All pending deadlines with live countdowns' },
  '/calendar':      { title: 'Calendar',         subtitle: 'Schedule and events' },
  '/email':         { title: 'Email',            subtitle: 'AI-filtered important emails' },
  '/whatsapp':      { title: 'WhatsApp',         subtitle: 'Important messages — placements, deadlines, forms' },
  '/notifications': { title: 'Notifications',    subtitle: 'Alert history and channels' },
  '/settings':      { title: 'Settings',         subtitle: 'Connect accounts and configure' },
};

// ── Inner component so it has access to query client context ──────────────────
function ReminderProvider() {
  const { data: feed = [] } = useFeed();
  // Start the reminder engine — fires browser notifications until items are done
  useReminderEngine(feed);
  return null;
}

function AppLayout() {
  const [cmdOpen, setCmdOpen] = useState(false);
  const { pathname } = useLocation();
  const pageInfo = PAGE_TITLES[pathname] ?? { title: 'OmniPulse', subtitle: '' };

  // Request notification permission on first load
  useEffect(() => {
    const timer = setTimeout(requestNotificationPermission, 3000);
    return () => clearTimeout(timer);
  }, []);

  // Global Ctrl+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCmdOpen(o => !o);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar
          title={pageInfo.title}
          subtitle={pageInfo.subtitle}
          onOpenCommand={() => setCmdOpen(true)}
        />

        <main className="flex-1 overflow-y-auto px-6 py-6">
          <div className="max-w-6xl mx-auto">
            <Routes>
              <Route path="/"              element={<DashboardPage />} />
              <Route path="/feed"          element={<FeedPage />} />
              <Route path="/contests"      element={<ContestsPage />} />
              <Route path="/deadlines"     element={<DeadlinesPage />} />
              <Route path="/calendar"      element={<CalendarPage />} />
              <Route path="/email"         element={<EmailPage />} />
              <Route path="/whatsapp"      element={<WhatsAppPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/settings"      element={<SettingsPage />} />
              <Route path="*"             element={<DashboardPage />} />
            </Routes>
          </div>
        </main>
      </div>

      {/* Reminder engine — runs silently in background */}
      <ReminderProvider />

      <CommandPalette isOpen={cmdOpen} onClose={() => setCmdOpen(false)} />

      <Toaster
        position="bottom-right"
        toastOptions={{
          style: { background: '#18181B', color: '#FAFAFA', border: '1px solid #27272A', fontSize: '13px' },
          success: { iconTheme: { primary: '#22C55E', secondary: '#18181B' } },
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
