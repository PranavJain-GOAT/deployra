import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { FeedItem, ApiResponse } from '@/types';

export function useFeed() {
  return useQuery<FeedItem[]>({
    queryKey: ['feed'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<FeedItem[]>>('/feed');
      return data.data ?? [];
    },
    refetchInterval: 30_000,
  });
}

export function useEmailFeed() {
  return useQuery<FeedItem[]>({
    queryKey: ['feed', 'email'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<FeedItem[]>>('/feed/email');
      return data.data ?? [];
    },
    refetchInterval: 60_000,
  });
}

export function useWhatsAppFeed() {
  return useQuery<FeedItem[]>({
    queryKey: ['feed', 'whatsapp'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<FeedItem[]>>('/feed/whatsapp');
      return data.data ?? [];
    },
    refetchInterval: 30_000,
  });
}

export function useMarkDone() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.patch(`/feed/${id}/done`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['feed'] }); qc.invalidateQueries({ queryKey: ['deadlines'] }); },
  });
}

export function useSnooze() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, minutes }: { id: string; minutes: number }) => api.patch(`/feed/${id}/snooze`, { minutes }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['feed'] }),
  });
}

export function useDismiss() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.patch(`/feed/${id}/dismiss`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['feed'] }),
  });
}
