import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5001/api/v1';
axios.defaults.withCredentials = true;

/**
 * useNotifications
 * ────────────────
 * Fetches the authenticated user's notifications from the backend.
 * Automatically refetches every 30 seconds for near-real-time updates.
 *
 * Returns:
 *  - notifications   — full array
 *  - unreadCount     — derived integer
 *  - isLoading       — boolean
 *  - markAsRead(id)  — mutation fn
 *  - markAllAsRead() — bulk mutation fn
 */
export function useNotifications() {
  const queryClient = useQueryClient();

  // ── Fetch ────────────────────────────────────────────────────────────────
  const { data, isLoading, isError } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await axios.get(`${API}/notifications`);
      return res.data.data ?? [];
    },
    refetchInterval: 30_000,       // poll every 30s
    refetchIntervalInBackground: true,
    staleTime: 10_000,
    retry: 1,
  });

  const notifications = data ?? [];
  const unreadCount   = notifications.filter(n => !n.isRead).length;

  // ── Mark single as read ──────────────────────────────────────────────────
  const { mutate: markAsRead } = useMutation({
    mutationFn: async (id) => {
      await axios.patch(`${API}/notifications/${id}/read`);
    },
    onMutate: async (id) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['notifications'] });
      const prev = queryClient.getQueryData(['notifications']);
      queryClient.setQueryData(['notifications'], (old = []) =>
        old.map(n => (n.id === id ? { ...n, isRead: true } : n))
      );
      return { prev };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(['notifications'], ctx.prev);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  // ── Mark ALL as read ─────────────────────────────────────────────────────
  const { mutate: markAllAsRead } = useMutation({
    mutationFn: async () => {
      const unread = notifications.filter(n => !n.isRead);
      await Promise.allSettled(
        unread.map(n => axios.patch(`${API}/notifications/${n.id}/read`))
      );
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['notifications'] });
      const prev = queryClient.getQueryData(['notifications']);
      queryClient.setQueryData(['notifications'], (old = []) =>
        old.map(n => ({ ...n, isRead: true }))
      );
      return { prev };
    },
    onError: (_err, _v, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(['notifications'], ctx.prev);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  return {
    notifications,
    unreadCount,
    isLoading,
    isError,
    markAsRead,
    markAllAsRead,
  };
}
