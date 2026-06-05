import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, Code2, Briefcase, Eye, EyeOff, Loader2, 
  ChevronRight, Lock, Mail, KeyRound, CheckCircle2, ShieldAlert
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useAuth } from "@/lib/AuthContext";
import { toast } from "react-hot-toast";
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


export default function Auth() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, isAuthenticated, user } = useAuth();
  
  // Tabs: "signup", "login", "forgot", "reset"
  const [tab, setTab] = useState("signup"); 
  const [step, setStep] = useState(1); // 1: Role Selection, 2: Form Details
  
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  
  const [form, setForm] = useState({ 
    firstName: "", 
    lastName: "", 
    email: "", 
    password: "",
    country: "India",
    role: "client",
    rememberMe: false
  });

  const [resetForm, setResetForm] = useState({
    password: "",
    confirmPassword: ""
  });

  // Extract query parameters for password reset flow
  const tokenParam = searchParams.get("token");
  const tabParam = searchParams.get("tab");

  useEffect(() => {
    if (tabParam === "reset" && tokenParam) {
      setTab("reset");
      setStep(2);
    }
  }, [tabParam, tokenParam]);

  // If user is already authenticated, redirect to their dashboard
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(getRedirectPath(user), { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const passwordRequirements = [
    { label: "8+ characters", regex: /.{8,}/ },
    { label: "1 uppercase letter", regex: /[A-Z]/ },
    { label: "1 lowercase letter", regex: /[a-z]/ },
    { label: "1 number", regex: /[0-9]/ },
    { label: "1 special character (@$!%*?&)", regex: /[@$!%*?&]/ },
  ];

  const isPasswordValid = passwordRequirements.every(req => req.regex.test(form.password));
  const isResetPasswordValid = passwordRequirements.every(req => req.regex.test(resetForm.password));

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(p => ({
      ...p,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleResetInputChange = (e) => {
    const { name, value } = e.target;
    setResetForm(p => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (tab === "signup" && !isPasswordValid) {
      setError("Please fulfill all password requirements.");
      toast.error("Weak password strength detected");
      return;
    }

    setLoading(true);

    try {
      let endpoint = "/auth/register";
      let payload = {};

      if (tab === "login") {
        endpoint = "/auth/login";
        payload = { 
          email: form.email, 
          password: form.password,
          rememberMe: form.rememberMe
        };
      } else {
        payload = { 
          ...form, 
          name: `${form.firstName} ${form.lastName}` 
        };
      }

      const response = await axios.post(`${API_URL}${endpoint}`, payload);

      if (response.data.success) {
        toast.success(tab === "login" ? "Logged in successfully!" : "Account created successfully!");
        const { user, accessToken, refreshToken } = response.data.data;
        login(user, accessToken, refreshToken);
        navigate(getRedirectPath(user));
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Authentication failed. Please check your credentials.";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/auth/forgot-password`, { email: form.email });
      
      if (response.data.success) {
        const msg = response.data.message || "Reset link dispatched! If that email is registered, you will receive instructions shortly.";
        setSuccessMsg(msg);
        toast.success("Security token sent to email");
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Something went wrong. Please try again.";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!isResetPasswordValid) {
      setError("Please fulfill all password requirements.");
      toast.error("Weak password strength detected");
      return;
    }

    if (resetForm.password !== resetForm.confirmPassword) {
      setError("Passwords do not match.");
      toast.error("Passwords must match");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/auth/reset-password`, { 
        token: tokenParam,
        newPassword: resetForm.password
      });

      if (response.data.success) {
        toast.success("Password reset successful!");
        setSuccessMsg("Password reset successfully. You will be redirected to Login in a moment...");
        
        setTimeout(() => {
          setTab("login");
          setStep(2);
          setSuccessMsg("");
          setResetForm({ password: "", confirmPassword: "" });
          navigate('/auth');
        }, 3000);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to reset password. The link may have expired.";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const RoleCard = ({ id, icon: Icon, title, desc }) => (
    <button
      type="button"
      onClick={() => setForm(p => ({ ...p, role: id }))}
      className={`relative flex flex-col items-center justify-center p-8 rounded-2xl border-2 transition-all duration-300 group ${
        form.role === id 
          ? "border-[#108a00] bg-[#f4fbf4] dark:bg-[#071607] ring-1 ring-[#108a00]" 
          : "border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0b0f19] hover:border-gray-300 dark:hover:border-gray-700"
      }`}
      style={{ width: '280px', height: '320px' }}
    >
      <div className={`p-6 rounded-full mb-6 transition-transform group-hover:scale-110 ${form.role === id ? 'bg-[#d2f1d2] dark:bg-[#0e2c0e]' : 'bg-gray-50 dark:bg-gray-900'}`}>
        <Icon className={`w-12 h-12 transition-colors ${form.role === id ? 'text-[#108a00]' : 'text-gray-800 dark:text-gray-200'}`} strokeWidth={1.5} />
      </div>
      
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-1">
        {title} <ChevronRight className="w-5 h-5 mt-0.5" />
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 text-center px-4 leading-relaxed">{desc}</p>
      
      <div className={`absolute top-4 right-4 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
        form.role === id ? 'bg-gray-900 dark:bg-white border-gray-900 dark:border-white' : 'border-gray-200 dark:border-gray-700'
      }`}>
        {form.role === id && <div className="w-2 h-2 rounded-full bg-white dark:bg-gray-900" />}
      </div>
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#030712] flex flex-col font-sans transition-colors duration-300">
      {/* Header */}
      <div className="p-6 sm:p-8 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <img src="/logo.png" alt="Logo" className="w-9 h-9" />
          <span className="font-extrabold text-2xl tracking-tighter text-gray-900 dark:text-white">Deployra</span>
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-5xl">
          <AnimatePresence mode="wait">
            {step === 1 && tab === "signup" ? (
              <motion.div
                key="role-step"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                className="text-center"
              >
                <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white mb-4 tracking-tight">
                  Join Deployra Premium
                </h1>
                <p className="text-lg text-gray-500 dark:text-gray-400 mb-12">
                  Choose your account type to continue
                </p>

                <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-16">
                  <RoleCard 
                    id="client" 
                    icon={Briefcase} 
                    title="Client" 
                    desc="Post projects and hire world-class AI developers" 
                  />
                  <RoleCard 
                    id="developer" 
                    icon={Code2} 
                    title="Freelancer" 
                    desc="Work and get paid for your AI expertise" 
                  />
                </div>

                <div className="space-y-6">
                  <Button
                    onClick={() => setStep(2)}
                    className="h-13 px-14 rounded-full bg-gray-950 text-white font-bold text-base hover:bg-gray-800 transition-all dark:bg-white dark:text-gray-950 dark:hover:bg-gray-100 shadow-xl min-w-[260px]"
                  >
                    {form.role === 'client' ? 'Join as a Client' : 'Apply as a Freelancer'}
                  </Button>
                  
                  <p className="text-gray-500 dark:text-gray-400 font-medium">
                    Already have an account?{" "}
                    <button 
                      onClick={() => { setTab("login"); setStep(2); }} 
                      className="text-[#108a00] font-bold hover:underline transition-colors"
                    >
                      Log in
                    </button>
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="form-step"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                className="max-w-xl mx-auto w-full"
              >
                <div className="bg-white dark:bg-[#0b0f19] rounded-3xl p-8 sm:p-10 border border-gray-100 dark:border-gray-800 shadow-2xl relative">
                  
                  {/* Back Navigation Arrow */}
                  <button 
                    onClick={() => {
                      setError("");
                      setSuccessMsg("");
                      if (tab === "signup") setStep(1);
                      else if (tab === "forgot") setTab("login");
                      else if (tab === "reset") setTab("login");
                      else {
                        setTab("signup");
                        setStep(1);
                      }
                    }}
                    className="absolute left-6 top-6 sm:left-8 sm:top-8 p-2.5 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-full border border-gray-100 dark:border-gray-800 transition-colors group"
                  >
                    <ArrowLeft className="w-5 h-5 text-gray-500 group-hover:text-gray-950 dark:group-hover:text-white" />
                  </button>

                  <div className="text-center mb-8 pt-4">
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2 tracking-tight">
                      {tab === "login" && "Welcome back"}
                      {tab === "signup" && "Sign up to Deployra"}
                      {tab === "forgot" && "Reset Password"}
                      {tab === "reset" && "Choose a New Password"}
                    </h1>
                    <p className="text-sm text-gray-400 dark:text-gray-500">
                      {tab === "login" && "Enter your credentials to access your dashboard"}
                      {tab === "signup" && "Create a secure account to find work or hire developers"}
                      {tab === "forgot" && "We will email you a secure link to reset your password"}
                      {tab === "reset" && "Make sure to write a strong, high-entropy password"}
                    </p>
                  </div>

                  {/* Errors / Success Alerts */}
                  {error && (
                    <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 flex gap-3 items-start text-red-600 dark:text-red-400 text-sm font-semibold">
                      <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-500" />
                      <div>{error}</div>
                    </div>
                  )}

                  {successMsg && (
                    <div className="mb-6 p-4 rounded-xl bg-green-50 dark:bg-green-950/20 border border-green-100 dark:border-green-900/30 flex gap-3 items-start text-green-700 dark:text-green-400 text-sm font-semibold animate-pulse">
                      <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-green-500" />
                      <div>{successMsg}</div>
                    </div>
                  )}

                  {/* Google OAuth Section - Hidden for Reset tab */}
                  {tab !== "reset" && (
                    <>
                      <div className="grid grid-cols-1 gap-3">
                        <Button
                          variant="outline"
                          type="button"
                          onClick={() => {
                            window.location.href = `${API_URL}/auth/google`;
                          }}
                          className="h-12 rounded-full gap-3 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 bg-white dark:bg-transparent font-bold text-gray-700 dark:text-gray-300 shadow-sm transition-all"
                        >
                          <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                          </svg>
                          Continue with Google
                        </Button>
                      </div>

                      <div className="relative py-5">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t border-gray-100 dark:border-gray-800"></span>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-white dark:bg-[#0b0f19] px-3 text-gray-400 font-bold tracking-wider">or</span>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Dynamic Render Form Tabs */}
                  <AnimatePresence mode="wait">
                    {tab === "forgot" ? (
                      <motion.form 
                        key="forgot-form"
                        onSubmit={handleForgotPassword} 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-5"
                      >
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-gray-800 dark:text-gray-300 flex items-center gap-2">
                            <Mail className="w-4 h-4 text-gray-400" /> Registered Email Address
                          </label>
                          <input
                            type="email"
                            name="email"
                            required
                            placeholder="you@example.com"
                            value={form.email}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 bg-white dark:bg-[#060a13] border border-gray-300 dark:border-gray-800 focus:border-gray-900 dark:focus:border-white rounded-xl outline-none transition-all text-gray-900 dark:text-white font-medium"
                          />
                        </div>

                        <div className="pt-4">
                          <Button
                            type="submit"
                            disabled={loading}
                            className="w-full h-12 rounded-full bg-[#108a00] hover:bg-[#0c6b00] text-white font-bold text-base shadow-lg shadow-green-100 dark:shadow-none"
                          >
                            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Send Password Reset Link"}
                          </Button>
                        </div>
                      </motion.form>
                    ) : tab === "reset" ? (
                      <motion.form 
                        key="reset-form"
                        onSubmit={handleResetPassword} 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-5"
                      >
                        {/* New Password */}
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-gray-800 dark:text-gray-300 flex items-center gap-2">
                            <Lock className="w-4 h-4 text-gray-400" /> New Password
                          </label>
                          <div className="relative">
                            <input
                              type={showPass ? "text" : "password"}
                              name="password"
                              required
                              placeholder="New password (8+ characters)"
                              value={resetForm.password}
                              onChange={handleResetInputChange}
                              className={`w-full px-4 py-3 pr-12 bg-white dark:bg-[#060a13] border ${resetForm.password ? (isResetPasswordValid ? 'border-green-500' : 'border-red-300') : 'border-gray-300 dark:border-gray-800'} focus:border-gray-900 dark:focus:border-white rounded-xl outline-none transition-all text-gray-900 dark:text-white font-medium`}
                            />
                            <button 
                              type="button" 
                              onClick={() => setShowPass(!showPass)} 
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-800 transition-colors"
                            >
                              {showPass ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                            </button>
                          </div>
                          
                          {/* Requirements tracker */}
                          {resetForm.password && !isResetPasswordValid && (
                            <div className="p-4 bg-gray-50 dark:bg-gray-900/40 rounded-xl space-y-2 mt-2 border border-gray-100 dark:border-gray-800">
                              <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Password Requirements</p>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5">
                                {passwordRequirements.map((req, i) => {
                                  const met = req.regex.test(resetForm.password);
                                  return (
                                    <div key={i} className="flex items-center gap-2">
                                      <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center transition-colors ${met ? 'bg-[#108a00]' : 'bg-gray-200 dark:bg-gray-800'}`}>
                                        {met && <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}><path d="M5 13l4 4L19 7" /></svg>}
                                      </div>
                                      <span className={`text-[11px] font-medium transition-colors ${met ? 'text-green-700 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'}`}>{req.label}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-gray-800 dark:text-gray-300 flex items-center gap-2">
                            <KeyRound className="w-4 h-4 text-gray-400" /> Confirm New Password
                          </label>
                          <input
                            type="password"
                            name="confirmPassword"
                            required
                            placeholder="Re-enter password"
                            value={resetForm.confirmPassword}
                            onChange={handleResetInputChange}
                            className="w-full px-4 py-3 bg-white dark:bg-[#060a13] border border-gray-300 dark:border-gray-800 focus:border-gray-900 dark:focus:border-white rounded-xl outline-none transition-all text-gray-900 dark:text-white font-medium"
                          />
                        </div>

                        <div className="pt-4">
                          <Button
                            type="submit"
                            disabled={loading}
                            className="w-full h-12 rounded-full bg-[#108a00] hover:bg-[#0c6b00] text-white font-bold text-base shadow-lg shadow-green-100 dark:shadow-none"
                          >
                            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Reset and Update Password"}
                          </Button>
                        </div>
                      </motion.form>
                    ) : (
                      <motion.form 
                        key="main-form"
                        onSubmit={handleSubmit} 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-5"
                      >
                        {/* Name Grid (Signup only) */}
                        {tab === "signup" && (
                          <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
                            <div className="space-y-2">
                              <label className="text-sm font-bold text-gray-800 dark:text-gray-300">First name</label>
                              <input
                                required
                                name="firstName"
                                value={form.firstName}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 bg-white dark:bg-[#060a13] border border-gray-200 dark:border-gray-800 focus:border-gray-900 dark:focus:border-white rounded-xl outline-none transition-all text-gray-900 dark:text-white font-medium"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-bold text-gray-800 dark:text-gray-300">Last name</label>
                              <input
                                required
                                name="lastName"
                                value={form.lastName}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 bg-white dark:bg-[#060a13] border border-gray-200 dark:border-gray-800 focus:border-gray-900 dark:focus:border-white rounded-xl outline-none transition-all text-gray-900 dark:text-white font-medium"
                              />
                            </div>
                          </div>
                        )}

                        {/* Email Input */}
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-gray-800 dark:text-gray-300 flex items-center gap-2">
                            <Mail className="w-4 h-4 text-gray-400" /> Email address
                          </label>
                          <input
                            type="email"
                            name="email"
                            required
                            placeholder="you@example.com"
                            value={form.email}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 bg-white dark:bg-[#060a13] border border-gray-200 dark:border-gray-800 focus:border-gray-900 dark:focus:border-white rounded-xl outline-none transition-all text-gray-900 dark:text-white font-medium"
                          />
                        </div>

                        {/* Password Input */}
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <label className="text-sm font-bold text-gray-800 dark:text-gray-300 flex items-center gap-2">
                              <Lock className="w-4 h-4 text-gray-400" /> Password
                            </label>
                            {tab === "login" && (
                              <button 
                                type="button"
                                onClick={() => { setError(""); setSuccessMsg(""); setTab("forgot"); }}
                                className="text-xs font-bold text-[#108a00] hover:underline"
                              >
                                Forgot password?
                              </button>
                            )}
                          </div>
                          
                          <div className="relative">
                            <input
                              type={showPass ? "text" : "password"}
                              name="password"
                              required
                              placeholder="Password (8+ characters)"
                              value={form.password}
                              onChange={handleInputChange}
                              className={`w-full px-4 py-3 pr-12 bg-white dark:bg-[#060a13] border ${tab === "signup" && form.password ? (isPasswordValid ? 'border-green-500' : 'border-red-300') : 'border-gray-200 dark:border-gray-800'} focus:border-gray-900 dark:focus:border-white rounded-xl outline-none transition-all text-gray-900 dark:text-white font-medium`}
                            />
                            <button 
                              type="button" 
                              onClick={() => setShowPass(!showPass)} 
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-800 transition-colors"
                            >
                              {showPass ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                            </button>
                          </div>

                          {/* Signup Requirements Tracker */}
                          {tab === "signup" && form.password && !isPasswordValid && (
                            <div className="p-4 bg-gray-50 dark:bg-gray-900/40 rounded-xl space-y-2 mt-2 border border-gray-100 dark:border-gray-800">
                              <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Password Requirements</p>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5">
                                {passwordRequirements.map((req, i) => {
                                  const met = req.regex.test(form.password);
                                  return (
                                    <div key={i} className="flex items-center gap-2">
                                      <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center transition-colors ${met ? 'bg-[#108a00]' : 'bg-gray-200 dark:bg-gray-800'}`}>
                                        {met && <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}><path d="M5 13l4 4L19 7" /></svg>}
                                      </div>
                                      <span className={`text-[11px] font-medium transition-colors ${met ? 'text-green-700 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'}`}>{req.label}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Country Input (Signup only) */}
                        {tab === "signup" && (
                          <div className="space-y-2 animate-in fade-in slide-in-from-top-4 duration-300">
                            <label className="text-sm font-bold text-gray-800 dark:text-gray-300">Country</label>
                            <select
                              name="country"
                              value={form.country}
                              onChange={handleInputChange}
                              className="w-full px-4 py-3 bg-white dark:bg-[#060a13] border border-gray-200 dark:border-gray-800 focus:border-gray-900 dark:focus:border-white rounded-xl outline-none transition-all appearance-none font-medium cursor-pointer text-gray-900 dark:text-white"
                            >
                              <option value="India">India</option>
                              <option value="United States">United States</option>
                              <option value="United Kingdom">United Kingdom</option>
                              <option value="Canada">Canada</option>
                            </select>
                          </div>
                        )}

                        {/* Remember Me Checkbox (Login only) */}
                        {tab === "login" && (
                          <div className="flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-300">
                            <input
                              type="checkbox"
                              id="rememberMe"
                              name="rememberMe"
                              checked={form.rememberMe}
                              onChange={handleInputChange}
                              className="w-4 h-4 text-[#108a00] border-gray-300 rounded focus:ring-[#108a00] cursor-pointer"
                            />
                            <label htmlFor="rememberMe" className="text-xs font-bold text-gray-600 dark:text-gray-400 cursor-pointer select-none">
                              Remember me on this device
                            </label>
                          </div>
                        )}

                        {/* Action buttons */}
                        <div className="pt-4 space-y-6">
                          <Button
                            type="submit"
                            disabled={loading}
                            className="w-full h-13 rounded-full bg-[#108a00] hover:bg-[#0c6b00] text-white font-bold text-base shadow-lg shadow-green-100 dark:shadow-none transition-all"
                          >
                            {loading ? <Loader2 className="w-6 h-6 animate-spin text-white" /> : tab === "login" ? "Log In" : "Create Account"}
                          </Button>
                          
                          <p className="text-center text-gray-500 dark:text-gray-400 font-medium">
                            {tab === "login" ? (
                              <>
                                Don't have an account?{" "}
                                <button 
                                  type="button" 
                                  onClick={() => { setError(""); setSuccessMsg(""); setTab("signup"); setStep(1); }} 
                                  className="text-[#108a00] font-bold hover:underline transition-colors"
                                >
                                  Sign Up
                                </button>
                              </>
                            ) : (
                              <>
                                Already have an account?{" "}
                                <button 
                                  type="button" 
                                  onClick={() => { setError(""); setSuccessMsg(""); setTab("login"); }} 
                                  className="text-[#108a00] font-bold hover:underline transition-colors"
                                >
                                  Log In
                                </button>
                              </>
                            )}
                          </p>
                        </div>
                      </motion.form>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      {/* Footer copyright for role selection screen */}
      {step === 1 && tab === "signup" && (
        <div className="p-8 text-center text-sm text-gray-400 dark:text-gray-500 border-t border-gray-100 dark:border-gray-900 bg-white/50 dark:bg-slate-900/30">
          Deployra Marketplace © 2026
        </div>
      )}
    </div>
  );
}
