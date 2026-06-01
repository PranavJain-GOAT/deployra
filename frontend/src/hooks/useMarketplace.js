import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { API_URL as API } from '@/lib/config';

axios.defaults.withCredentials = true;

export function useMarketplaceProducts(filters = {}) {
  return useQuery({
    queryKey: ['marketplaceProducts', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.category && filters.category !== 'All') params.append('category', filters.category);
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit);
      if (filters.status) params.append('status', filters.status);

      const res = await axios.get(`${API}/products?${params.toString()}`);
      return res.data;
    },
    staleTime: 5000,
  });
}

export function useProductById(id) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      if (!id) return null;
      const res = await axios.get(`${API}/products/${id}`);
      return res.data.data;
    },
    enabled: !!id,
  });
}

export function useMyProducts() {
  return useQuery({
    queryKey: ['myProducts'],
    queryFn: async () => {
      const res = await axios.get(`${API}/products/my`);
      return res.data.data ?? [];
    },
  });
}

export function useMyActivities() {
  return useQuery({
    queryKey: ['myActivities'],
    queryFn: async () => {
      const res = await axios.get(`${API}/activities`);
      return res.data.data ?? [];
    },
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (productData) => {
      const res = await axios.post(`${API}/products`, productData);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myProducts'] });
      queryClient.invalidateQueries({ queryKey: ['marketplaceProducts'] });
      queryClient.invalidateQueries({ queryKey: ['myActivities'] });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }) => {
      const res = await axios.patch(`${API}/products/${id}`, data);
      return res.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['product', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['myProducts'] });
      queryClient.invalidateQueries({ queryKey: ['marketplaceProducts'] });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      await axios.delete(`${API}/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myProducts'] });
      queryClient.invalidateQueries({ queryKey: ['marketplaceProducts'] });
    },
  });
}

export function usePurchaseProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (productId) => {
      const res = await axios.post(`${API}/purchases/checkout`, { productId });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['myActivities'] });
      queryClient.invalidateQueries({ queryKey: ['myProducts'] });
    },
  });
}

export function useIncrementViews() {
  return useMutation({
    mutationFn: async (id) => {
      await axios.post(`${API}/products/${id}/view`);
    },
  });
}

export function useIncrementDemoViews() {
  return useMutation({
    mutationFn: async (id) => {
      await axios.post(`${API}/products/${id}/demo-view`);
    },
  });
}
