import { useState, useCallback } from 'react';
import axios from 'axios';
import { useQueryClient } from '@tanstack/react-query';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5001/api/v1';
axios.defaults.withCredentials = true;

/**
 * useProfile
 * ──────────
 * Encapsulates all profile-mutation operations:
 *  - uploadAvatar(file)    — POSTs to /uploads/image then PATCHes /users/me
 *  - removeAvatar()        — DELETEs /users/me/avatar
 *  - updateProfile(data)   — PATCHes /users/me with any profile fields
 *  - logoutAllDevices()    — POSTs /auth/logout-all then redirects to /auth
 *
 * Returns operation state: { isUploading, isRemoving, isUpdating, isLoggingOut, error }
 */
export function useProfile() {
  const queryClient = useQueryClient();

  const [isUploading,    setIsUploading]    = useState(false);
  const [isRemoving,     setIsRemoving]     = useState(false);
  const [isUpdating,     setIsUpdating]     = useState(false);
  const [isLoggingOut,   setIsLoggingOut]   = useState(false);
  const [error,          setError]          = useState(null);

  // ── Upload + set avatar ──────────────────────────────────────────────────
  const uploadAvatar = useCallback(async (file) => {
    setIsUploading(true);
    setError(null);
    try {
      // Step 1: Upload image to CDN / storage
      const formData = new FormData();
      formData.append('image', file);
      const uploadRes = await axios.post(`${API}/uploads/image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const imageUrl = uploadRes.data?.data?.url;
      if (!imageUrl) throw new Error('Upload failed — no URL returned.');

      // Step 2: Persist the image URL on the user profile
      await axios.patch(`${API}/users/me`, { profileImage: imageUrl });

      // Step 3: Invalidate user query so AuthContext re-fetches
      await queryClient.invalidateQueries({ queryKey: ['user'] });
      return imageUrl;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Upload failed.';
      setError(msg);
      throw err;
    } finally {
      setIsUploading(false);
    }
  }, [queryClient]);

  // ── Remove avatar ────────────────────────────────────────────────────────
  const removeAvatar = useCallback(async () => {
    setIsRemoving(true);
    setError(null);
    try {
      await axios.delete(`${API}/users/me/avatar`);
      await queryClient.invalidateQueries({ queryKey: ['user'] });
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Remove failed.';
      setError(msg);
      throw err;
    } finally {
      setIsRemoving(false);
    }
  }, [queryClient]);

  // ── Update profile fields ────────────────────────────────────────────────
  const updateProfile = useCallback(async (data) => {
    setIsUpdating(true);
    setError(null);
    try {
      const res = await axios.patch(`${API}/users/me`, data);
      await queryClient.invalidateQueries({ queryKey: ['user'] });
      return res.data?.data;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Update failed.';
      setError(msg);
      throw err;
    } finally {
      setIsUpdating(false);
    }
  }, [queryClient]);

  // ── Logout all devices ───────────────────────────────────────────────────
  const logoutAllDevices = useCallback(async () => {
    setIsLoggingOut(true);
    setError(null);
    try {
      await axios.post(`${API}/auth/logout-all`);
    } catch (_) {
      // Soft fail — we still redirect even if the API call fails
    } finally {
      localStorage.clear();
      setIsLoggingOut(false);
      window.location.href = '/auth';
    }
  }, []);

  return {
    uploadAvatar,
    removeAvatar,
    updateProfile,
    logoutAllDevices,
    isUploading,
    isRemoving,
    isUpdating,
    isLoggingOut,
    error,
  };
}
