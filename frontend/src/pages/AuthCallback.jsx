import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import axios from "axios";
import { useAuth } from "@/lib/AuthContext";

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login, checkAuth } = useAuth();
  const hasRun = useRef(false); // prevent double-execution in React StrictMode

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const handleCallback = async () => {
      const success      = searchParams.get("success");
      const error        = searchParams.get("error");
      const code         = searchParams.get("code");
      const accessToken  = searchParams.get("accessToken");
      const userParam    = searchParams.get("u"); // base64url-encoded user payload

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api/v1';

      // ── Error from backend ──────────────────────────────────────────────────
      if (error) {
        navigate(`/auth?error=${error}`, { replace: true });
        return;
      }

      // ── 1. MAIN PATH: success=true with embedded user payload (u=...) ───────
      //    Backend encodes user data as base64url in the redirect URL.
      //    This avoids any cross-origin cookie reads entirely.
      if (success === "true" && userParam) {
        try {
          // Decode base64url → JSON → user object
          const decoded = JSON.parse(
            atob(userParam.replace(/-/g, '+').replace(/_/g, '/'))
          );
          if (decoded?.id && decoded?.email) {
            login(decoded);
            navigate('/', { replace: true });
            return;
          }
        } catch (decodeErr) {
          console.warn("[AuthCallback] Failed to decode user payload, falling back to API call:", decodeErr);
        }
      }

      // ── 2. FALLBACK: success=true but no/invalid u= param ──────────────────
      //    Try fetching /users/me (cookies may have been sent correctly in some cases)
      if (success === "true") {
        await new Promise(r => setTimeout(r, 400)); // brief cookie-settle delay
        for (let i = 0; i < 5; i++) {
          try {
            const res = await axios.get(`${apiUrl}/users/me`, { withCredentials: true });
            if (res.data?.success && res.data?.data) {
              login(res.data.data);
              navigate('/', { replace: true });
              return;
            }
          } catch (_) {}
          if (i < 4) await new Promise(r => setTimeout(r, 600 * (i + 1)));
        }
        // Couldn't verify, but Google said success — still navigate home
        navigate('/', { replace: true });
        return;
      }

      // ── 3. OAuth code exchange (frontend-initiated PKCE flow) ───────────────
      if (code) {
        try {
          const response = await axios.post(
            `${apiUrl}/auth/google/callback`,
            { code },
            { withCredentials: true }
          );
          if (response.data?.success) {
            const { user } = response.data.data;
            login(user);
            navigate('/', { replace: true });
          } else {
            navigate('/auth?error=google_auth_failed', { replace: true });
          }
        } catch (err) {
          console.error("[AuthCallback] Code exchange error:", err);
          navigate('/auth?error=google_auth_failed', { replace: true });
        }
        return;
      }

      // ── 4. Bearer token fallback (legacy) ────────────────────────────────────
      if (accessToken) {
        try {
          const res = await axios.get(`${apiUrl}/users/me`, {
            headers: { Authorization: `Bearer ${accessToken}` },
            withCredentials: true,
          });
          if (res.data?.success) {
            login(res.data.data);
            navigate('/', { replace: true });
            return;
          }
        } catch (_) {}
      }

      // ── 5. Cookies already set (user navigated to this page directly) ────────
      try {
        const res = await axios.get(`${apiUrl}/users/me`, { withCredentials: true });
        if (res.data?.success) {
          login(res.data.data);
          navigate('/', { replace: true });
          return;
        }
      } catch (_) {}

      // ── Nothing worked ────────────────────────────────────────────────────────
      navigate('/auth', { replace: true });
    };

    handleCallback();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#030712]">
      <div className="text-center p-8 max-w-md w-full bg-white dark:bg-[#0b0f19] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-xl">
        <Loader2 className="w-12 h-12 animate-spin text-[#108a00] mx-auto mb-6" />
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Signing you in</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Syncing your Google account...
        </p>
      </div>
    </div>
  );
}
