import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, X, RefreshCw, CheckCircle } from "lucide-react";
import axios from "axios";
import { useAuth } from "@/lib/AuthContext";
import { toast } from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api/v1";

/**
 * EmailVerificationBanner
 * Shown at the top of the app for authenticated users who haven't verified their email.
 * Allows inline resend of the verification link.
 */
export default function EmailVerificationBanner() {
  const { user } = useAuth();
  const [dismissed, setDismissed] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  // Only show for authenticated, unverified, email-registered users
  if (!user || user.isEmailVerified || user.authProvider !== "email" || dismissed) {
    return null;
  }

  const handleResend = async () => {
    setSending(true);
    try {
      await axios.post(`${API_URL}/auth/resend-verification`, {}, { withCredentials: true });
      setSent(true);
      toast.success("Verification email sent! Check your inbox.");
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to send email. Please try again.";
      toast.error(msg);
    } finally {
      setSending(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -60, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="w-full bg-amber-950/40 border-b border-amber-500/20 backdrop-blur-sm"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2.5">
            <Mail className="w-4 h-4 text-amber-400 shrink-0" />
            <p className="text-sm font-medium text-amber-200/90">
              Please verify your email address to unlock all features.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {sent ? (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-green-400">
                <CheckCircle className="w-3.5 h-3.5" /> Email sent!
              </span>
            ) : (
              <button
                onClick={handleResend}
                disabled={sending}
                className="flex items-center gap-1.5 text-xs font-semibold text-amber-300 hover:text-amber-100 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${sending ? "animate-spin" : ""}`} />
                {sending ? "Sending..." : "Resend Email"}
              </button>
            )}

            <button
              onClick={() => setDismissed(true)}
              className="ml-1 text-amber-500/60 hover:text-amber-300 transition-colors"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
