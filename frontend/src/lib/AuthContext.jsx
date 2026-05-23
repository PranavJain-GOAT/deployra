import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';

// Ensure Axios automatically transmits HTTP-only cookies in cross-origin requests
axios.defaults.withCredentials = true;

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [authError, setAuthError] = useState(null);

  /**
   * Fetch authenticated user state.
   * Leverages silent JWT refresh if the current access token has expired.
   */
  const fetchUser = useCallback(async () => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api/v1';
    const axiosConfig = { withCredentials: true };

    try {
      const response = await axios.get(`${apiUrl}/users/me`, axiosConfig);
      if (response.data.success) {
        setUser(response.data.data);
        setIsAuthenticated(true);
        setAuthError(null);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      // 401/expired access token - try to silently refresh it
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        try {
          const refreshResponse = await axios.post(`${apiUrl}/auth/refresh`, {}, axiosConfig);
          if (refreshResponse.data.success) {
            // Token refreshed, retry fetching profile
            const retryResponse = await axios.get(`${apiUrl}/users/me`, axiosConfig);
            if (retryResponse.data.success) {
              setUser(retryResponse.data.data);
              setIsAuthenticated(true);
              setAuthError(null);
              return;
            }
          }
        } catch (refreshErr) {
          console.warn("Silent token refresh failed or no valid session exists.");
        }
      }

      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoadingAuth(false);
      setAuthChecked(true);
    }
  }, []);


  // Initiate initial authentication check on mount
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  /**
   * Handle local authentication context initialization upon successful manual login/signup.
   */
  const login = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    setAuthChecked(true);
    setAuthError(null);
    if (userData.role) {
      localStorage.setItem('user_role', userData.role.toLowerCase());
    }
  };

  /**
   * Securely terminate session by calling logout API (clears cookies) and resetting state.
   */
  const logout = async () => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api/v1';
    try {
      await axios.post(`${apiUrl}/auth/logout`);
    } catch (error) {
      console.error("API logout request failed:", error);
    } finally {
      localStorage.removeItem('user_role');
      setUser(null);
      setIsAuthenticated(false);
      setAuthChecked(true);
      setAuthError(null);
      window.location.href = '/auth';
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoadingAuth,
      authChecked,
      authError,
      login,
      logout,
      checkAuth: fetchUser,
      checkUserAuth: fetchUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
