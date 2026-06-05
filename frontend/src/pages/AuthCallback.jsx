import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import axios from "axios";
import { useAuth } from "@/lib/AuthContext";
import { API_URL } from "@/lib/config";

// ─── Role-based dashboard redirect helper ────────────────────────────────────
function getRedirectPath(user) {
  if (!user) return '/';
  const role = (user.role || '').toUpperCase();
  if (role === 'ADMIN')     return '/admin';
  if (role === 'DEVELOPER') return '/developer';
  if (role === 'CLIENT')    return '/client';
  return '/';
}


export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const hasRun = useRef(false); // prevent double-execution in React StrictMode

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const handleCallback = async () => {
      const success      = searchParams.get("success");
      const error        = searchParams.get("error");
      const code         = searchParams.get("code");
      const tokenParam   = searchParams.get("token") || searchParams.get("accessToken");
      const rTokenParam  = searchParams.get("refreshToken");
      const userParam    = searchParams.get("u"); // base64url-encoded user payload

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
            login(decoded, tokenParam, rTokenParam);
            navigate(getRedirectPath(decoded), { replace: true });
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
            const res = await axios.get(`${API_URL}/users/me`, { withCredentials: true });
            if (res.data?.success && res.data?.data) {
              login(res.data.data, tokenParam, rTokenParam);
              navigate(getRedirectPath(res.data.data), { replace: true });
              return;
            }
          } catch {}
          if (i < 4) await new Promise(r => setTimeout(r, 600 * (i + 1)));
        }
        // Couldn't verify, but Google said success — navigate to home as fallback
        navigate('/', { replace: true });
        return;
      }

      // ── 3. OAuth code exchange (frontend-initiated PKCE flow) ───────────────
      if (code) {
        try {
          const response = await axios.post(
            `${API_URL}/auth/google/callback`,
            { code },
            { withCredentials: true }
          );
          if (response.data?.success) {
            const { user, accessToken, refreshToken } = response.data.data;
            login(user, accessToken, refreshToken);
            navigate(getRedirectPath(user), { replace: true });
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
      if (tokenParam) {
        try {
          const res = await axios.get(`${API_URL}/users/me`, {
            headers: { Authorization: `Bearer ${tokenParam}` },
            withCredentials: true,
          });
          if (res.data?.success) {
            login(res.data.data, tokenParam, rTokenParam);
            navigate(getRedirectPath(res.data.data), { replace: true });
            return;
          }
        } catch {}
      }

      // ── 5. Cookies already set (user navigated to this page directly) ────────
      try {
        const res = await axios.get(`${API_URL}/users/me`, { withCredentials: true });
        if (res.data?.success) {
          login(res.data.data);
          navigate(getRedirectPath(res.data.data), { replace: true });
          return;
        }
      } catch {}

      // ── Nothing worked ────────────────────────────────────────────────────────
      navigate('/auth', { replace: true });
    };

    handleCallback();
  }, []);  

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
