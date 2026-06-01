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
import ClientLayout from './components/client/ClientLayout';
import ScrollToTop from './components/ScrollToTop';

// ─── Public Pages ──────────────────────────────────────────────────────────────
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import CustomSolutionDetail from './pages/CustomSolutionDetail';
import InstallFlow from './pages/InstallFlow';
import AdminDashboard from "./pages/AdminDashboard.jsx";
import Auth from './pages/Auth';
import AuthCallback from './pages/AuthCallback';
import VerifyEmail from './pages/VerifyEmail';
import Pricing from './pages/Pricing';
import SettingsPage from './pages/SettingsPage';
import PaymentHistory from './pages/PaymentHistory';
import About from './pages/About';
import Features from './pages/Features';

// ─── Developer Pages ───────────────────────────────────────────────────────────
import DevDashboard from './pages/developer/Dashboard';
import DevListings from './pages/developer/Listings';
import AddProduct from './pages/developer/AddProduct';
import DevAnalytics from './pages/developer/Analytics';
import ApiVault from './pages/developer/ApiVault';
import WebhookOrchestrator from './pages/developer/WebhookOrchestrator';
import LogsDebugger from './pages/developer/LogsDebugger';
import AiSandbox from './pages/developer/AiSandbox';
import DevOrders from './pages/developer/DevOrders';
import DevEarnings from './pages/developer/DevEarnings';
import DevReviews from './pages/developer/DevReviews';
import DevMessages from './pages/developer/DevMessages';
import DevRankings from './pages/developer/DevRankings';
import DevVerification from './pages/developer/DevVerification';
import DevTeam from './pages/developer/DevTeam';

// ─── Client Pages ──────────────────────────────────────────────────────────────
import { HireDevelopers, Wishlist, Billing, Integrations } from './pages/client/ClientPages';
import ClientDashboard from './pages/client/ClientDashboard';
import ClientDeployments from './pages/client/ClientDeployments';
import ClientEscrow from './pages/client/ClientEscrow';
import ClientMarketplace from './pages/client/ClientMarketplace';
import ClientSupport from './pages/client/ClientSupport';

import ClientMessages from './pages/client/ClientMessages';

// ─── Placeholder components (Phase 3 — next batch) ───────────────────────────
const DevProfile = () => <div className="p-8 text-white text-sm opacity-50">Developer Profile — Coming soon</div>;
const ClientOrders = () => <div className="p-8 text-white text-sm opacity-50">Order Lifecycle — Coming soon</div>;
const ClientSaved = () => <div className="p-8 text-white text-sm opacity-50">Saved & Watchlists — Coming soon</div>;
const ClientInvoices = () => <div className="p-8 text-white text-sm opacity-50">Invoice Center — Coming soon</div>;
const ClientTeam = () => <div className="p-8 text-white text-sm opacity-50">Team Management — Coming soon</div>;
const DevPayouts = () => <div className="p-8 text-white text-sm opacity-50">Payout Settings — Coming soon</div>;

const AuthenticatedApp = () => {
  const { isLoadingAuth, authError } = useAuth();

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      window.location.href = '/auth';
      return null;
    }
  }

  return (
    <Routes>
      {/* Admin */}
      <Route element={<ProtectedRoute allowedRoles={['ADMIN']} unauthenticatedElement={<Navigate to="/auth" replace />} />}>
        <Route path="/admin" element={<AdminDashboard />} />
      </Route>

      {/* Public */}
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

      {/* Developer Routes */}
      <Route element={<ProtectedRoute allowedRoles={['DEVELOPER', 'ADMIN']} unauthenticatedElement={<Navigate to="/auth" replace />} />}>
        <Route element={<DevLayout />}>
          {/* Core */}
          <Route path="/developer"                element={<DevDashboard />} />
          <Route path="/developer/listings"       element={<DevListings />} />
          <Route path="/developer/add"            element={<AddProduct />} />
          <Route path="/developer/edit/:id"       element={<AddProduct />} />
          {/* Revenue */}
          <Route path="/developer/orders"         element={<DevOrders />} />
          <Route path="/developer/earnings"       element={<DevEarnings />} />
          <Route path="/developer/payouts"        element={<DevPayouts />} />
          {/* Marketplace */}
          <Route path="/developer/analytics"      element={<DevAnalytics />} />
          <Route path="/developer/reviews"        element={<DevReviews />} />
          <Route path="/developer/rankings"       element={<DevRankings />} />
          <Route path="/developer/verification"   element={<DevVerification />} />
          {/* Communication */}
          <Route path="/developer/messages"       element={<DevMessages />} />
          {/* Tools */}
          <Route path="/developer/api-vault"      element={<ApiVault />} />
          <Route path="/developer/webhooks"       element={<WebhookOrchestrator />} />
          <Route path="/developer/logs"           element={<LogsDebugger />} />
          <Route path="/developer/sandbox"        element={<AiSandbox />} />
          {/* Account */}
          <Route path="/developer/profile"        element={<DevProfile />} />
          <Route path="/developer/team"           element={<DevTeam />} />
        </Route>
      </Route>

      {/* Client Routes */}
      <Route element={<ProtectedRoute allowedRoles={['CLIENT', 'ADMIN']} unauthenticatedElement={<Navigate to="/auth" replace />} />}>
        <Route element={<ClientLayout />}>
          {/* Operations */}
          <Route path="/client"                   element={<ClientDashboard />} />
          <Route path="/client/orders"            element={<ClientOrders />} />
          <Route path="/client/deployments"       element={<ClientDeployments />} />
          <Route path="/client/escrow"            element={<ClientEscrow />} />
          {/* Marketplace */}
          <Route path="/client/marketplace"       element={<ClientMarketplace />} />
          <Route path="/client/saved"             element={<ClientSaved />} />
          <Route path="/client/wishlist"          element={<Wishlist />} />
          <Route path="/client/hire"              element={<HireDevelopers />} />
          {/* Communication */}
          <Route path="/client/messages"          element={<ClientMessages />} />
          <Route path="/client/support"           element={<ClientSupport />} />
          {/* Finance */}
          <Route path="/client/billing"           element={<Billing />} />
          <Route path="/client/invoices"          element={<ClientInvoices />} />
          {/* Account */}
          <Route path="/client/team"              element={<ClientTeam />} />
          <Route path="/client/integrations"      element={<Integrations />} />
        </Route>
      </Route>

      {/* Shared Authenticated */}
      <Route element={<ProtectedRoute allowedRoles={['CLIENT', 'DEVELOPER', 'ADMIN']} unauthenticatedElement={<Navigate to="/auth" replace />} />}>
        <Route element={<Layout />}>
          <Route path="/settings"   element={<SettingsPage />} />
        </Route>
      </Route>

      {/* Auth */}
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