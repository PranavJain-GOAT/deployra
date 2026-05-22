import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import axios from "axios";
import { useAuth } from "@/lib/AuthContext";

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login, checkAuth } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      const accessToken = searchParams.get("accessToken");
      const refreshToken = searchParams.get("refreshToken");
      const code = searchParams.get("code");
      const success = searchParams.get("success");
      const error = searchParams.get("error");

      if (error) {
        navigate(`/auth?error=${error}`);
        return;
      }

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api/v1';

      // Helper function to fetch user profile with retries to handle cookie propagation lag
      const fetchUserWithRetry = async (retries = 3, delay = 500) => {
        for (let i = 0; i < retries; i++) {
          try {
            const res = await axios.get(`${apiUrl}/users/me`);
            if (res.data.success) {
              return res.data.data;
            }
          } catch (e) {
            console.warn(`Attempt ${i + 1} to fetch user info failed:`, e);
            if (i < retries - 1) {
              await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
            }
          }
        }
        return null;
      };

      // 1. If success=true is in URL, backend successfully authenticated & set cookies
      if (success === "true") {
        const userData = await fetchUserWithRetry(3, 500);
        if (userData) {
          login(userData);
        }
        // Direct back to homepage and not the sign in page again
        navigate('/');
        return;
      }

      // 2. Double check if cookies are already present and active (standard HTTP-only flow)
      try {
        const res = await axios.get(`${apiUrl}/users/me`);
        if (res.data.success) {
          login(res.data.data);
          navigate('/');
          return;
        }
      } catch (e) {
        // No cookies yet or invalid, proceed to query checks
      }

      // 3. If tokens are in URL (backward compatibility or query params fallback)
      if (accessToken) {
        try {
          const res = await axios.get(`${apiUrl}/users/me`, {
            headers: { Authorization: `Bearer ${accessToken}` }
          });
          if (res.data.success) {
            login(res.data.data);
            navigate('/');
            return;
          }
        } catch (e) {
          console.error("Token login query error:", e);
        }
      }

      // 4. If OAuth code is in URL (standard frontend code exchange flow)
      if (code) {
        try {
          const response = await axios.post(`${apiUrl}/auth/google/callback`, { code });
          
          if (response.data.success) {
            const { user } = response.data.data;
            login(user);
            navigate('/');
          } else {
            navigate('/auth?error=google_auth_failed');
          }
        } catch (error) {
          console.error("Google Exchange Error:", error);
          navigate('/auth?error=google_auth_failed');
        }
        return;
      }

      // If nothing worked
      navigate('/auth');
    };

    handleCallback();
  }, [searchParams, navigate, login]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#030712]">
      <div className="text-center p-8 max-w-md w-full bg-white dark:bg-[#0b0f19] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xl">
        <Loader2 className="w-12 h-12 animate-spin text-[#108a00] mx-auto mb-6" />
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Authenticating</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">Verifying credentials and synchronizing with Google...</p>
      </div>
    </div>
  );
}
