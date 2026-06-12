import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_URL } from '@/lib/config';

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
    const token = localStorage.getItem('auth_token');
    
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }

    const axiosConfig = { 
      withCredentials: true,
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    };

    try {
      const response = await axios.get(`${API_URL}/users/me`, axiosConfig);
      if (response.data.success) {
        setUser(response.data.data);
        setIsAuthenticated(true);
        setAuthError(null);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      const isAuthError = error.response && (error.response.status === 401 || error.response.status === 403);
      
      if (isAuthError) {
        try {
          // Try refreshing using the stored refresh token OR the httpOnly cookie
          // (the cookie is sent automatically via withCredentials)
          const storedRefreshToken = localStorage.getItem('refresh_token');
          const refreshResponse = await axios.post(
            `${API_URL}/auth/refresh`, 
            storedRefreshToken ? { refreshToken: storedRefreshToken } : {},
            { withCredentials: true }
          );
          
          if (refreshResponse.data.success) {
            const newAccessToken = refreshResponse.data.data?.accessToken;
            const newRefreshToken = refreshResponse.data.data?.refreshToken;
            
            if (newAccessToken) {
              localStorage.setItem('auth_token', newAccessToken);
              axios.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
              axiosConfig.headers = { Authorization: `Bearer ${newAccessToken}` };
            }
            if (newRefreshToken) {
              localStorage.setItem('refresh_token', newRefreshToken);
            }

            // Token refreshed, retry fetching profile
            const retryResponse = await axios.get(`${API_URL}/users/me`, axiosConfig);
            if (retryResponse.data.success) {
              setUser(retryResponse.data.data);
              setIsAuthenticated(true);
              setAuthError(null);
              return;
            }
          }
        } catch {
          console.warn("Silent token refresh failed or no valid session exists.");
        }

        // Refresh also failed — clear all stored credentials
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('remember_me');
        localStorage.removeItem('user_role');
        delete axios.defaults.headers.common['Authorization'];
        setUser(null);
        setIsAuthenticated(false);
      } else {
        // Network error or 5xx — preserve tokens so session restores when server wakes up
        console.warn("fetchUser failed due to network/server issue. Session preserved:", error.message);
        setUser(null);
        setIsAuthenticated(false);
      }
    } finally {
      setIsLoadingAuth(false);
      setAuthChecked(true);
    }
  }, []);


  // Always attempt to restore session on app mount.
  // Even if localStorage is empty, a valid httpOnly cookie may exist
  // (set by the server when the user previously logged in with Remember Me).
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  /**
   * Handle local authentication context initialization upon successful manual login/signup.
   */
  const login = (userData, accessToken, refreshToken, rememberMe = false) => {
    setUser(userData);
    setIsAuthenticated(true);
    setAuthChecked(true);
    setAuthError(null);
    if (userData.role) {
      localStorage.setItem('user_role', userData.role.toLowerCase());
    }
    if (accessToken) {
      localStorage.setItem('auth_token', accessToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    }
    if (refreshToken) {
      localStorage.setItem('refresh_token', refreshToken);
    }
    // Track remember-me preference so we know whether to clean up on next startup
    localStorage.setItem('remember_me', rememberMe ? '1' : '0');
  };

  /**
   * Securely terminate session by calling logout API (clears cookies) and resetting state.
   */
  const logout = async () => {
    const token = localStorage.getItem('auth_token');
    const axiosConfig = {
      withCredentials: true,
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    };
    try {
      await axios.post(`${API_URL}/auth/logout`, {}, axiosConfig);
    } catch (error) {
      console.error("API logout request failed:", error);
    } finally {
      localStorage.removeItem('user_role');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('remember_me');
      delete axios.defaults.headers.common['Authorization'];
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
