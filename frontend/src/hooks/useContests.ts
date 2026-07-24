import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Contest, ApiResponse } from '@/types';

export function useContests() {
  return useQuery<Contest[]>({
    queryKey: ['contests'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Contest[]>>('/contests');
      return data.data ?? [];
    },
    refetchInterval: 5 * 60_000,
    staleTime: 2 * 60_000,
  });
}

export function useContestsByPlatform(platform: string) {
  return useQuery<Contest[]>({
    queryKey: ['contests', platform],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Contest[]>>(`/contests/${platform}`);
      return data.data ?? [];
    },
    enabled: !!platform,
  });
}
