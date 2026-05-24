import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from '@/lib/ThemeContext';
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ProtectedRoute from '@/components/ProtectedRoute';
import Layout from './components/Layout';
import DevLayout from './components/developer/DevLayout';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import CustomSolutionDetail from './pages/CustomSolutionDetail';
import InstallFlow from './pages/InstallFlow';
import AdminDashboard from "./pages/AdminDashboard.jsx";
import DevDashboard from './pages/developer/Dashboard';
import DevListings from './pages/developer/Listings';
import AddProduct from './pages/developer/AddProduct';
import DevAnalytics from './pages/developer/Analytics';
import ApiVault from './pages/developer/ApiVault';
import WebhookOrchestrator from './pages/developer/WebhookOrchestrator';
import LogsDebugger from './pages/developer/LogsDebugger';
import AiSandbox from './pages/developer/AiSandbox';
import Auth from './pages/Auth';
import AuthCallback from './pages/AuthCallback';
import VerifyEmail from './pages/VerifyEmail';
import Pricing from './pages/Pricing';
import SettingsPage from './pages/SettingsPage';
import Onboarding from './pages/Onboarding';
import PaymentHistory from './pages/PaymentHistory';
import About from './pages/About';
import Features from './pages/Features';
import ClientLayout from './components/client/ClientLayout';
import { PurchaseHistory, OrderManagement, HireDevelopers, Wishlist, Messaging, Billing, Integrations } from './pages/client/ClientPages';
import ScrollToTop from './components/ScrollToTop';

// Placeholder empty components for missing dev features, will create real ones next if we didn't
const DevProfile = () => <div className="p-8 text-white">Profile & Skill Management coming soon</div>;
const DevMessaging = () => <div className="p-8 text-white">Developer Messaging System coming soon</div>;

const AuthenticatedApp = () => {
  const { isLoadingAuth, authError } = useAuth();

  // Show loading spinner while checking auth
  if (isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-[#030712]">
        <div className="w-8 h-8 border-4 border-slate-200 dark:border-white/10 border-t-slate-800 dark:border-t-white rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Use window.location as fallback if navigateToLogin is not available in original state
      window.location.href = '/auth';
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      {/* Admin Route Protection */}
      <Route element={<ProtectedRoute allowedRoles={['ADMIN']} unauthenticatedElement={<Navigate to="/auth" replace />} />}>
        <Route path="/admin" element={<AdminDashboard />} />
      </Route>

      {/* Public Routes */}
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/custom/:id" element={<CustomSolutionDetail />} />
        <Route path="/install/:id" element={<InstallFlow />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/payment-history" element={<PaymentHistory />} />
        <Route path="/about" element={<About />} />
        <Route path="/features" element={<Features />} />
        <Route path="*" element={<PageNotFound />} />
      </Route>

      {/* Developer Routes Protection */}
      <Route element={<ProtectedRoute allowedRoles={['DEVELOPER', 'ADMIN']} unauthenticatedElement={<Navigate to="/auth" replace />} />}>
        <Route element={<DevLayout />}>
          <Route path="/developer" element={<DevDashboard />} />
          <Route path="/developer/listings" element={<DevListings />} />
          <Route path="/developer/add" element={<AddProduct />} />
          <Route path="/developer/edit/:id" element={<AddProduct />} />
          <Route path="/developer/analytics" element={<DevAnalytics />} />
          <Route path="/developer/api-vault" element={<ApiVault />} />
          <Route path="/developer/webhooks" element={<WebhookOrchestrator />} />
          <Route path="/developer/logs" element={<LogsDebugger />} />
          <Route path="/developer/sandbox" element={<AiSandbox />} />
          <Route path="/developer/messages" element={<DevMessaging />} />
          <Route path="/developer/profile" element={<DevProfile />} />
        </Route>
      </Route>

      {/* Client Routes Protection */}
      <Route element={<ProtectedRoute allowedRoles={['CLIENT', 'ADMIN']} unauthenticatedElement={<Navigate to="/auth" replace />} />}>
        <Route element={<ClientLayout />}>
          <Route path="/client" element={<PurchaseHistory />} />
          <Route path="/client/orders" element={<OrderManagement />} />
          <Route path="/client/hire" element={<HireDevelopers />} />
          <Route path="/client/integrations" element={<Integrations />} />
          <Route path="/client/wishlist" element={<Wishlist />} />
          <Route path="/client/messages" element={<Messaging />} />
          <Route path="/client/billing" element={<Billing />} />
        </Route>
      </Route>
      <Route element={<ProtectedRoute allowedRoles={['CLIENT', 'DEVELOPER', 'ADMIN']} unauthenticatedElement={<Navigate to="/auth" replace />} />}>
        <Route element={<Layout />}>
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/onboarding" element={<Onboarding />} />
        </Route>
      </Route>
      
      <Route path="/auth" element={<Auth />} />
      <Route path="/auth/verify-email" element={<VerifyEmail />} />
      <Route path="/auth/google/callback" element={<AuthCallback />} />
      <Route path="/auth-callback" element={<AuthCallback />} />
    </Routes>
  );
};


function App() {

  return (
    <ThemeProvider>
      <AuthProvider>
        <QueryClientProvider client={queryClientInstance}>
          <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <ScrollToTop />
            <AuthenticatedApp />
          </Router>
          <Toaster />
        </QueryClientProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App