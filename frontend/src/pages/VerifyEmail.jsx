import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Loader2, ArrowLeft } from "lucide-react";
import axios from "axios";

import { API_URL } from "@/lib/config";

/**
 * VerifyEmail page — /auth/verify-email?token=xxx
 * Automatically calls the backend verification endpoint on mount.
 */
export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState("loading"); // "loading" | "success" | "error"
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("No verification token found. Please check the link in your email.");
      return;
    }

    const verify = async () => {
      try {
        const res = await axios.get(`${API_URL}/auth/verify-email?token=${token}`);
        if (res.data.success) {
          setStatus("success");
          setMessage(res.data.message || "Your email has been verified successfully!");
        } else {
          throw new Error(res.data.message);
        }
      } catch (err) {
        setStatus("error");
        setMessage(
          err.response?.data?.message ||
            "This verification link is invalid or has expired. Please request a new one."
        );
      }
    };

    verify();
  }, [token]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#030712] flex items-center justify-center p-6 font-sans transition-colors">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 group">
            <img src="/logo.png" alt="Deployra" className="w-9 h-9" />
            <span className="font-extrabold text-2xl tracking-tighter text-gray-900 dark:text-white">
              Deployra
            </span>
          </Link>
        </div>

        <div className="bg-white dark:bg-[#0b0f19] rounded-3xl p-10 border border-gray-100 dark:border-gray-800 shadow-2xl text-center">
          {/* Loading */}
          {status === "loading" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-green-50 dark:bg-green-950/20 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-[#108a00] animate-spin" />
                </div>
              </div>
              <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-3 tracking-tight">
                Verifying your email…
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Please wait a moment while we confirm your address.
              </p>
            </motion.div>
          )}

          {/* Success */}
          {status === "success" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 24 }}
            >
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-green-50 dark:bg-green-950/30 flex items-center justify-center ring-4 ring-green-100 dark:ring-green-900/20">
                  <CheckCircle2 className="w-8 h-8 text-[#108a00]" />
                </div>
              </div>
              <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-3 tracking-tight">
                Email verified!
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-8 leading-relaxed">
                {message}
              </p>
              <Link
                to="/"
                className="inline-flex items-center justify-center gap-2 w-full h-12 rounded-full bg-[#108a00] hover:bg-[#0c6b00] text-white font-bold text-sm transition-all shadow-lg shadow-green-100 dark:shadow-none"
              >
                Go to Dashboard
              </Link>
            </motion.div>
          )}

          {/* Error */}
          {status === "error" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 24 }}
            >
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-950/20 flex items-center justify-center ring-4 ring-red-100 dark:ring-red-900/20">
                  <XCircle className="w-8 h-8 text-red-500" />
                </div>
              </div>
              <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-3 tracking-tight">
                Verification failed
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-8 leading-relaxed">
                {message}
              </p>
              <Link
                to="/auth"
                className="inline-flex items-center justify-center gap-2 w-full h-12 rounded-full bg-gray-950 dark:bg-white text-white dark:text-gray-950 font-bold text-sm transition-all mb-3"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Sign In
              </Link>
            </motion.div>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 dark:text-gray-600 mt-6">
          Deployra Marketplace © {new Date().getFullYear()}
        </p>
      </motion.div>
    </div>
  );
}
