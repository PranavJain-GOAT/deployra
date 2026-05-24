import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  User, Shield, CreditCard, Users, Settings, Bell, Camera, 
  BarChart3, Zap, HelpCircle, Sun, Moon, Info, ShieldCheck, 
  RefreshCw, Plus, Minus, Download, ThumbsUp, X, Search
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '@/lib/AuthContext';
import { useTheme } from '@/lib/ThemeContext';
import { useProfile } from '@/hooks/useProfile';
import { useNotifications } from '@/hooks/useNotifications';
import { API_URL } from '@/lib/config';

// ─── Constants & Dictionaries ────────────────────────────────────────────────
const LANGUAGES = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
  { code: 'es', label: 'Spanish', native: 'Español' },
  { code: 'fr', label: 'French', native: 'Français' },
  { code: 'de', label: 'German', native: 'Deutsch' },
  { code: 'ja', label: 'Japanese', native: '日本語' }
];

const MOCK_I18N = {
  en: { title: 'Settings', welcome: 'Manage your profile, security preferences, and subscription.', profile: 'Profile & Account', security: 'Security & 2FA', billing: 'Billing & Wallet', teams: 'Team Workspace', preferences: 'Preferences', support: 'Support & Resources', notifications: 'Notifications Hub', save: 'Save Changes', saved: 'Settings saved!' },
  hi: { title: 'सेटिंग्स', welcome: 'अपनी प्रोफ़ाइल, सुरक्षा प्राथमिकताओं और सदस्यता का प्रबंधन करें।', profile: 'प्रोफ़ाइल और खाता', security: 'सुरक्षा और 2FA', billing: 'बिलिंग और वॉलेट', teams: 'टीम वर्कस्पेस', preferences: 'प्राथमिकताएं', support: 'सहायता और संसाधन', notifications: 'अधिसूचना हब', save: 'सहेजें', saved: 'सेटिंग्स सहेजी गईं!' },
  es: { title: 'Configuración', welcome: 'Administre su perfil, preferencias de seguridad y suscripción.', profile: 'Perfil y Cuenta', security: 'Seguridad y 2FA', billing: 'Facturación y Billetera', teams: 'Espacio de Equipo', preferences: 'Preferencias', support: 'Soporte y Recursos', notifications: 'Centro de Notificaciones', save: 'Guardar Cambios', saved: '¡Configuración guardada!' },
  fr: { title: 'Paramètres', welcome: 'Gérez votre profil, vos préférences de sécurité et votre abonnement.', profile: 'Profil et Compte', security: 'Sécurité et 2FA', billing: 'Facturation et Portefeuille', teams: 'Espace d\'Équipe', preferences: 'Préférences', support: 'Support et Ressources', notifications: 'Centre de Notifications', save: 'Enregistrer', saved: 'Paramètres enregistrés!' },
  de: { title: 'Einstellungen', welcome: 'Verwalten Sie Ihr Profil, Ihre Sicherheitspräferenzen und Ihr Abonnement.', profile: 'Profil & Konto', security: 'Sicherheit & 2FA', billing: 'Abrechnung & Geldbörse', teams: 'Team-Arbeitsbereich', preferences: 'Einstellungen', support: 'Support & Ressourcen', notifications: 'Benachrichtigungszentrum', save: 'Speichern', saved: 'Einstellungen gespeichert!' },
  ja: { title: '設定', welcome: 'プロファイル、セキュリティ設定、およびサブスクリプションを管理します。', profile: 'プロフィールとアカウント', security: 'セキュリティと2FA', billing: '請求とウォレット', teams: 'チームワークスペース', preferences: '環境設定', support: 'サポートとリソース', notifications: '通知ハブ', save: '変更を保存', saved: '設定が保存されました！' }
};

// Simple Circle Avatar Cropper Modal Component
function ImageCropperModal({ file, onCropComplete, onClose, isDark }) {
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const canvasRef = useRef(null);
  const imgRef = useRef(null);
  const [imgSrc, setImgSrc] = useState('');

  useEffect(() => {
    const reader = new FileReader();
    reader.onload = (e) => setImgSrc(e.target.result);
    reader.readAsDataURL(file);
  }, [file]);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX - offset.x, y: e.clientY - offset.y };
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setOffset({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleCrop = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = imgRef.current;

    // Output is 200x200
    canvas.width = 200;
    canvas.height = 200;

    // Clear
    ctx.clearRect(0, 0, 200, 200);

    // Draw circle clip
    ctx.beginPath();
    ctx.arc(100, 100, 100, 0, Math.PI * 2);
    ctx.clip();

    // Source image dimensions
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;

    // Calculate crop parameters
    const size = Math.min(iw, ih);
    const scale = size / (150 * zoom);

    const sx = (iw - size) / 2 - (offset.x * scale);
    const sy = (ih - size) / 2 - (offset.y * scale);
    const sWidth = size / zoom;
    const sHeight = size / zoom;

    ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, 200, 200);

    canvas.toBlob((blob) => {
      const croppedFile = new File([blob], file.name, { type: file.type });
      onCropComplete(croppedFile);
    }, file.type);
  };

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className={`w-full max-w-md p-6 rounded-2xl border shadow-2xl ${isDark ? 'bg-[#0b0f19] border-white/10' : 'bg-white border-black/10'}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">Adjust Avatar</h3>
          <button onClick={onClose} className="p-1 text-white/40 hover:text-white rounded-lg"><X className="w-5 h-5" /></button>
        </div>

        <div 
          className="relative w-full aspect-square overflow-hidden rounded-xl bg-black/40 border border-white/5 cursor-move"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {imgSrc && (
            <img
              ref={imgRef}
              src={imgSrc}
              alt="Crop target"
              draggable="false"
              className="absolute pointer-events-none origin-center max-w-none"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                transform: `scale(${zoom}) translate(${offset.x}px, ${offset.y}px)`
              }}
            />
          )}
          {/* Circular Mask Overlay */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="w-[200px] h-[200px] rounded-full ring-[2000px] ring-black/60 border border-white/40 shadow-inner" />
          </div>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-3 my-4">
          <Minus className="w-4 h-4 text-white/40" />
          <input 
            type="range" 
            min="1" 
            max="3" 
            step="0.05" 
            value={zoom} 
            onChange={(e) => setZoom(parseFloat(e.target.value))} 
            className="flex-1 accent-violet-500 h-1 rounded-lg cursor-pointer bg-white/10" 
          />
          <Plus className="w-4 h-4 text-white/40" />
        </div>

        <div className="flex gap-2">
          <button onClick={handleCrop} className="flex-1 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-violet-500/25">Save Avatar</button>
          <button onClick={onClose} className={`flex-1 py-2 text-sm font-bold rounded-xl border ${isDark ? 'border-white/10 text-white/60 hover:bg-white/5' : 'border-black/10 text-neutral-600 hover:bg-black/5'}`}>Cancel</button>
        </div>
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}

// Main Settings Page Component
export default function SettingsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const { isDark, theme, toggleTheme } = useTheme();
  const { uploadAvatar, removeAvatar, isUploading, isRemoving } = useProfile();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  const activeTab = searchParams.get('tab') || 'profile';

  // State Management
  const [activeLang, setActiveLang] = useState('en');
  const [name, setName] = useState(user?.name || '');
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [country, setCountry] = useState(user?.country || 'India');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMsg, setUpdateMsg] = useState('');

  // Crop & Avatar
  const [cropTarget, setCropTarget] = useState(null);

  // Security (Password)
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwMsg, setPwMsg] = useState({ text: '', isError: false });
  const [pwLoading, setPwLoading] = useState(false);

  // Sessions list
  const [sessions, setSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);

  // 2FA Flow
  const [is2faSetup, setIs2faSetup] = useState(false);
  const [totpSecret, setTotpSecret] = useState('');
  const [totpQr, setTotpQr] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [totpError, setTotpError] = useState('');
  const [recoveryCodes, setRecoveryCodes] = useState([]);
  const [disableTotpCode, setDisableTotpCode] = useState('');
  const [disableError, setDisableError] = useState('');

  // GDPR export
  const [exportLoading, setExportLoading] = useState(false);
  const [exportData, setExportData] = useState(null);

  // Preferences (stored in database preferenceJson)
  const [prefTheme, setPrefTheme] = useState(theme);
  const [prefLang, setPrefLang] = useState('en');
  const [accessibility, setAccessibility] = useState({ reducedMotion: false, fontScale: 100, highContrast: false });
  const [notifPreferences, setNotifPreferences] = useState({ email: true, push: true, marketing: false, security: true, billing: true, productUpdates: true });

  // Teams mock list
  const [teamMembers, setTeamMembers] = useState([
    { id: 1, name: 'Pranav Jain', email: 'pranav@deployra.com', role: 'Owner', avatar: 'PJ' },
    { id: 2, name: 'Aisha Rahman', email: 'aisha@deployra.com', role: 'Admin', avatar: 'AR' }
  ]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Member');
  const [inviteMsg, setInviteMsg] = useState('');

  // Feature request board mock
  const [featuresList, setFeaturesList] = useState([
    { id: 1, title: 'Edge Deployment to AWS regions', description: 'Enable edge rendering in multiple cloud regions automatically.', votes: 42, status: 'Planned', upvoted: false, commentsCount: 7 },
    { id: 2, title: 'PostgreSQL Database Tunneling', description: 'Access backend Neon databases directly from terminal.', votes: 28, status: 'In Progress', upvoted: true, commentsCount: 3 },
    { id: 3, title: 'One-click SSL Renewals', description: 'Auto-renewal of SSL certificates using Let\'s Encrypt.', votes: 15, status: 'Backlog', upvoted: false, commentsCount: 0 }
  ]);
  const [newFeatureTitle, setNewFeatureTitle] = useState('');
  const [newFeatureDesc, setNewFeatureDesc] = useState('');

  // Bug report board mock
  const [bugCategory, setBugCategory] = useState('Frontend UI');
  const [bugSeverity, setBugSeverity] = useState('Medium');
  const [bugSteps, setBugSteps] = useState('');
  const [bugScreenshot, setBugScreenshot] = useState(null);
  const [bugMsg, setBugMsg] = useState('');
  const [bugLoading, setBugLoading] = useState(false);

  // FAQs
  const [faqSearch, setFaqSearch] = useState('');
  const faqs = [
    { q: 'How does Deployra compute token usages?', a: 'Deployra calculates tokens using GPT-4 and Claude 3 standard tokenizers directly from request streams, rounded to the nearest integer.' },
    { q: 'Can I use multiple Stripe accounts for billing?', a: 'Currently, Deployra supports one primary credit card/wallet or Stripe Billing profile per account. Organization billing will be rolled out shortly.' },
    { q: 'Is edge caching supported by default?', a: 'Yes. All listings deployed through Deployra receive free automated cloudflare edge caching on their primary APIs.' }
  ];

  // Load backend sessions and user preferences on tab load
  useEffect(() => {
    if (activeTab === 'security' || activeTab === 'sessions') {
      fetchSessions();
    }
    if (user?.id) {
      fetchPreferences();
    }
  }, [activeTab, user?.id]);

  const fetchPreferences = async () => {
    try {
      const res = await axios.get(`${API_URL}/users/preferences`);
      if (res.data.success && res.data.data) {
        const p = res.data.data;
        if (p.theme) setPrefTheme(p.theme);
        if (p.lang) { setPrefLang(p.lang); setActiveLang(p.lang); }
        if (p.accessibility) setAccessibility(p.accessibility);
        if (p.notifications) setNotifPreferences(p.notifications);
      }
    } catch (_) {}
  };

  const savePreferences = async (updatedPrefs) => {
    try {
      await axios.patch(`${API_URL}/users/preferences`, { preferences: updatedPrefs });
    } catch (err) {
      console.error('Failed to save preferences:', err);
    }
  };

  const fetchSessions = async () => {
    setSessionsLoading(true);
    try {
      const res = await axios.get(`${API_URL}/users/sessions`);
      if (res.data.success) {
        setSessions(res.data.data);
      }
    } catch (_) {}
    setSessionsLoading(false);
  };

  const revokeSession = async (id) => {
    try {
      const res = await axios.delete(`${API_URL}/users/sessions/${id}`);
      if (res.data.success) {
        setSessions(prev => prev.filter(s => s.id !== id));
      }
    } catch (_) {}
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    setUpdateMsg('');
    try {
      const res = await axios.patch(`${API_URL}/users/me`, {
        firstName,
        lastName,
        country
      });
      if (res.data.success) {
        setUpdateMsg('Profile updated successfully!');
        if (login) {
          login(res.data.data);
        }
      }
    } catch (err) {
      setUpdateMsg(err.response?.data?.message || 'Update failed.');
    }
    setIsUpdating(false);
  };

  // Avatar Upload Wrapper with Crop Modal Trigger
  const handleSelectFile = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setCropTarget(file);
    }
    e.target.value = '';
  };

  const handleCropComplete = async (croppedFile) => {
    setCropTarget(null);
    try {
      await uploadAvatar(croppedFile);
    } catch (err) {
      alert(err.message || 'Avatar upload failed.');
    }
  };

  const handleGoogleSync = async () => {
    setUpdateMsg('Syncing avatar from Google profile...');
    try {
      if (user?.email) {
        // Mock query from Google API or re-initialize google sync payload
        const syncUrl = `https://lh3.googleusercontent.com/a/default-user=s200`; // Google fallback icon
        await axios.patch(`${API_URL}/users/me`, { profileImage: user.profileImage || syncUrl });
        setUpdateMsg('Google Profile Image synchronized!');
      }
    } catch (_) {
      setUpdateMsg('Sync failed.');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPwMsg({ text: 'New passwords do not match.', isError: true });
      return;
    }
    setPwLoading(true);
    setPwMsg({ text: '', isError: false });
    try {
      const res = await axios.post(`${API_URL}/users/change-password`, {
        oldPassword,
        newPassword
      });
      if (res.data.success) {
        setPwMsg({ text: 'Password updated successfully!', isError: false });
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      setPwMsg({ text: err.response?.data?.message || 'Password update failed.', isError: true });
    }
    setPwLoading(false);
  };

  const setup2FA = async () => {
    try {
      const res = await axios.post(`${API_URL}/users/2fa/setup`);
      if (res.data.success) {
        setTotpSecret(res.data.data.secret);
        setTotpQr(res.data.data.qrCodeUrl);
        setIs2faSetup(true);
        setTotpError('');
      }
    } catch (_) {}
  };

  const enable2FA = async () => {
    setTotpError('');
    try {
      const res = await axios.post(`${API_URL}/users/2fa/enable`, {
        token: totpCode,
        secret: totpSecret
      });
      if (res.data.success) {
        setRecoveryCodes(res.data.data.recoveryCodes);
        setIs2faSetup(false);
        setTotpCode('');
        // Update user context
        if (login) {
          login({ ...user, twoFactorEnabled: true });
        }
      }
    } catch (err) {
      setTotpError(err.response?.data?.message || 'Invalid activation token.');
    }
  };

  const disable2FA = async () => {
    setDisableError('');
    try {
      const res = await axios.post(`${API_URL}/users/2fa/disable`, {
        token: disableTotpCode
      });
      if (res.data.success) {
        setDisableTotpCode('');
        if (login) {
          login({ ...user, twoFactorEnabled: false });
        }
      }
    } catch (err) {
      setDisableError(err.response?.data?.message || 'Verification failed.');
    }
  };

  const exportGDPRData = async () => {
    setExportLoading(true);
    try {
      const res = await axios.post(`${API_URL}/users/gdpr/export`);
      if (res.data.success) {
        setExportData(res.data.data);
      }
    } catch (_) {}
    setExportLoading(false);
  };

  const deleteAccount = async () => {
    if (confirm('WARNING: Are you absolutely sure you want to permanently delete your account? This action is irreversible and all your configurations, listings, and purchases will be permanently destroyed.')) {
      try {
        await axios.delete(`${API_URL}/users/me`);
        localStorage.clear();
        window.location.href = '/auth';
      } catch (_) {
        alert('Failed to delete account.');
      }
    }
  };

  const handleInviteTeam = (e) => {
    e.preventDefault();
    if (!inviteEmail) return;
    setInviteMsg('Sending invitation...');
    setTimeout(() => {
      setTeamMembers(prev => [...prev, {
        id: Date.now(),
        name: inviteEmail.split('@')[0],
        email: inviteEmail,
        role: inviteRole,
        avatar: inviteEmail.substring(0, 2).toUpperCase()
      }]);
      setInviteEmail('');
      setInviteMsg('Invite sent to ' + inviteEmail);
    }, 600);
  };

  const handleUpvoteFeature = (id) => {
    setFeaturesList(prev => prev.map(f => {
      if (f.id === id) {
        return {
          ...f,
          votes: f.upvoted ? f.votes - 1 : f.votes + 1,
          upvoted: !f.upvoted
        };
      }
      return f;
    }));
  };

  const handleCreateFeature = (e) => {
    e.preventDefault();
    if (!newFeatureTitle || !newFeatureDesc) return;
    setFeaturesList(prev => [...prev, {
      id: Date.now(),
      title: newFeatureTitle,
      description: newFeatureDesc,
      votes: 1,
      status: 'Backlog',
      upvoted: true,
      commentsCount: 0
    }]);
    setNewFeatureTitle('');
    setNewFeatureDesc('');
  };

  const handleBugSubmit = (e) => {
    e.preventDefault();
    if (!bugSteps) return;
    setBugLoading(true);
    setBugMsg('');
    setTimeout(() => {
      setBugMsg('Bug report filed successfully under reference BUG-' + Math.floor(Math.random() * 9000 + 1000));
      setBugSteps('');
      setBugScreenshot(null);
      setBugLoading(false);
    }, 1000);
  };

  // Keyboard shortcut config list
  const SHORTCUTS = [
    { keys: '⌘ K or Ctrl K', desc: 'Open Command Palette' },
    { keys: 'ESC', desc: 'Close open overlays and dialogs' },
    { keys: '⇧ T or Shift T', desc: 'Toggle Dark/Light Mode' },
    { keys: '⌥ H or Alt H', desc: 'Go to Command Dashboard' }
  ];

  // Helper Initials
  const getInitials = (n) => {
    if (!n) return 'U';
    return n.split(' ').map(part => part[0]).join('').toUpperCase().substring(0, 2);
  };

  // Language mapping translation helper
  const t = (key) => {
    return MOCK_I18N[activeLang]?.[key] || MOCK_I18N.en[key] || key;
  };

  const isGoogle = user?.authProvider === 'google';

  const tabStyle = (tabId) => {
    const isCurrent = activeTab === tabId;
    return `w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all text-left ${
      isCurrent 
        ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/15' 
        : isDark ? 'text-white/60 hover:text-white hover:bg-white/5' : 'text-neutral-600 hover:text-neutral-900 hover:bg-black/5'
    }`;
  };

  return (
    <div className={`min-h-[calc(100vh-60px)] py-8 px-4 sm:px-8 max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 ${isDark ? 'text-white' : 'text-neutral-900'}`}>
      
      {/* ── Left Sidebar Navigation ── */}
      <div className="w-full lg:w-64 shrink-0 flex flex-col gap-1.5">
        <h2 className="text-xl font-bold font-serif tracking-tight mb-4 px-2">{t('title')}</h2>
        
        <button onClick={() => setSearchParams({ tab: 'profile' })} className={tabStyle('profile')}>
          <User className="w-4 h-4" />
          {t('profile')}
        </button>
        <button onClick={() => setSearchParams({ tab: 'security' })} className={tabStyle('security')}>
          <Shield className="w-4 h-4" />
          {t('security')}
        </button>
        <button onClick={() => setSearchParams({ tab: 'billing' })} className={tabStyle('billing')}>
          <CreditCard className="w-4 h-4" />
          {t('billing')}
        </button>
        <button onClick={() => setSearchParams({ tab: 'teams' })} className={tabStyle('teams')}>
          <Users className="w-4 h-4" />
          {t('teams')}
        </button>
        <button onClick={() => setSearchParams({ tab: 'preferences' })} className={tabStyle('preferences')}>
          <Settings className="w-4 h-4" />
          {t('preferences')}
        </button>
        <button onClick={() => setSearchParams({ tab: 'notifications' })} className={tabStyle('notifications')}>
          <div className="relative">
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && <span className="absolute -top-1.5 -right-1.5 w-2 h-2 bg-violet-500 rounded-full" />}
          </div>
          {t('notifications')}
          {unreadCount > 0 && (
            <span className="ml-auto bg-white/10 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
              {unreadCount}
            </span>
          )}
        </button>
        <button onClick={() => setSearchParams({ tab: 'support' })} className={tabStyle('support')}>
          <HelpCircle className="w-4 h-4" />
          {t('support')}
        </button>
      </div>

      {/* ── Right Content Container ── */}
      <div className={`flex-1 min-w-0 p-6 sm:p-8 rounded-2xl border shadow-xl ${isDark ? 'bg-[#0b0f19] border-white/5' : 'bg-white border-black/5'}`}>
        
        {/* Tab 1: Profile & GDPR */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold font-serif mb-4">Account Settings</h3>
            
            {/* Identity card */}
            <div className={`p-5 rounded-xl border flex flex-col sm:flex-row items-center gap-6 ${isDark ? 'bg-white/3 border-white/5' : 'bg-black/3 border-black/5'}`}>
              <div className="relative group cursor-pointer">
                {user?.profileImage ? (
                  <img src={user.profileImage} alt="Avatar" className="w-20 h-20 rounded-full object-cover ring-2 ring-white/10" />
                ) : (
                  <div className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold bg-gradient-to-tr from-violet-500 to-indigo-600 text-white">
                    {getInitials(user?.name)}
                  </div>
                )}
                <label className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                  <Camera className="w-5 h-5 text-white" />
                  <input type="file" accept="image/*" onChange={handleSelectFile} className="hidden" />
                </label>
              </div>

              <div className="flex-1 text-center sm:text-left">
                <h4 className="text-base font-bold flex items-center justify-center sm:justify-start gap-2">
                  {user?.name}
                  {user?.isEmailVerified && <ShieldCheck className="w-4.5 h-4.5 text-emerald-400" />}
                </h4>
                <p className="text-xs text-white/40 mt-1">{user?.email}</p>
                <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
                  <button onClick={handleGoogleSync} className={`px-3 py-1 text-[10px] font-semibold border rounded-lg hover:bg-white/5 transition-all ${isDark ? 'border-white/10' : 'border-black/10'}`}>Sync Google Image</button>
                  {user?.profileImage && (
                    <button onClick={removeAvatar} className="px-3 py-1 text-[10px] font-semibold text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/10 transition-all">Remove Image</button>
                  )}
                </div>
              </div>
            </div>

            {/* Profile fields form */}
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-bold text-white/40 mb-1.5">First Name</label>
                  <input 
                    type="text" 
                    value={firstName} 
                    onChange={e => setFirstName(e.target.value)} 
                    className={`w-full px-4 py-2.5 rounded-xl border text-xs bg-transparent focus:outline-none focus:ring-1 focus:ring-violet-500 ${isDark ? 'border-white/10 text-white' : 'border-black/10 text-black'}`} 
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-bold text-white/40 mb-1.5">Last Name</label>
                  <input 
                    type="text" 
                    value={lastName} 
                    onChange={e => setLastName(e.target.value)} 
                    className={`w-full px-4 py-2.5 rounded-xl border text-xs bg-transparent focus:outline-none focus:ring-1 focus:ring-violet-500 ${isDark ? 'border-white/10 text-white' : 'border-black/10 text-black'}`} 
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-bold text-white/40 mb-1.5">Country / Region</label>
                <input 
                  type="text" 
                  value={country} 
                  onChange={e => setCountry(e.target.value)} 
                  className={`w-full px-4 py-2.5 rounded-xl border text-xs bg-transparent focus:outline-none focus:ring-1 focus:ring-violet-500 ${isDark ? 'border-white/10 text-white' : 'border-black/10 text-black'}`} 
                />
              </div>

              {updateMsg && (
                <p className={`text-xs ${updateMsg.includes('successfully') ? 'text-emerald-400' : 'text-red-400'}`}>{updateMsg}</p>
              )}

              <button type="submit" disabled={isUpdating} className="px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-violet-500/15">
                {isUpdating ? 'Saving...' : t('save')}
              </button>
            </form>

            {/* Privacy & GDPR settings */}
            <div className={`mt-8 pt-6 border-t ${isDark ? 'border-white/5' : 'border-black/5'}`}>
              <h4 className="text-sm font-bold text-red-400 mb-2">Danger Zone</h4>
              <p className="text-xs text-white/40 mb-4">Export audit trail database logs or permanently destroy your Deployra login profile.</p>
              
              <div className="flex flex-wrap gap-3">
                <button onClick={exportGDPRData} disabled={exportLoading} className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border hover:bg-white/5 transition-all ${isDark ? 'border-white/10' : 'border-black/10'}`}>
                  <Download className="w-3.5 h-3.5" />
                  {exportLoading ? 'Exporting...' : 'Export GDPR Archive'}
                </button>
                <button onClick={deleteAccount} className="px-4 py-2 text-xs font-bold bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white border border-red-500/20 rounded-xl transition-all">
                  Permanently Delete Profile
                </button>
              </div>

              {exportData && (
                <div className={`mt-4 p-4 rounded-xl border text-[11px] font-mono overflow-x-auto max-h-40 premium-scroll ${isDark ? 'bg-black/40 border-white/10' : 'bg-neutral-50 border-black/10'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-white">gdpr_archive.json Ready</span>
                    <a 
                      href={`data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(exportData, null, 2))}`} 
                      download="gdpr_archive.json" 
                      className="text-violet-400 hover:text-white font-bold"
                    >
                      Download File
                    </a>
                  </div>
                  {JSON.stringify(exportData, null, 2)}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Security & Devices */}
        {activeTab === 'security' && (
          <div className="space-y-8">
            {/* Change password */}
            {isGoogle ? (
              <div className={`p-4 rounded-xl border ${isDark ? 'bg-white/3 border-white/5' : 'bg-black/3 border-black/5'}`}>
                <p className="text-xs text-white/60 flex items-center gap-2">
                  <Info className="w-4 h-4 text-sky-400" />
                  Your account is secured via Google OAuth. Password changes are managed through Google Settings.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="text-lg font-bold font-serif">Change Password</h3>
                <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-bold text-white/40 mb-1.5">Current Password</label>
                    <input 
                      type="password" 
                      value={oldPassword} 
                      onChange={e => setOldPassword(e.target.value)} 
                      className={`w-full px-4 py-2 rounded-xl border text-xs bg-transparent focus:outline-none focus:ring-1 focus:ring-violet-500 ${isDark ? 'border-white/10 text-white' : 'border-black/10 text-black'}`} 
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-bold text-white/40 mb-1.5">New Password</label>
                    <input 
                      type="password" 
                      value={newPassword} 
                      onChange={e => setNewPassword(e.target.value)} 
                      className={`w-full px-4 py-2 rounded-xl border text-xs bg-transparent focus:outline-none focus:ring-1 focus:ring-violet-500 ${isDark ? 'border-white/10 text-white' : 'border-black/10 text-black'}`} 
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-bold text-white/40 mb-1.5">Confirm New Password</label>
                    <input 
                      type="password" 
                      value={confirmPassword} 
                      onChange={e => setConfirmPassword(e.target.value)} 
                      className={`w-full px-4 py-2 rounded-xl border text-xs bg-transparent focus:outline-none focus:ring-1 focus:ring-violet-500 ${isDark ? 'border-white/10 text-white' : 'border-black/10 text-black'}`} 
                    />
                  </div>

                  {pwMsg.text && (
                    <p className={`text-xs ${pwMsg.isError ? 'text-red-400' : 'text-emerald-400'}`}>{pwMsg.text}</p>
                  )}

                  <button type="submit" disabled={pwLoading} className="px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-violet-500/15">
                    Update Password
                  </button>
                </form>
              </div>
            )}

            {/* Sessions list */}
            <div className={`pt-8 border-t ${isDark ? 'border-white/5' : 'border-black/5'}`}>
              <h3 className="text-lg font-bold font-serif mb-2">Sessions & Devices</h3>
              <p className="text-xs text-white/40 mb-4">Manage access tokens and revoke specific device authorization keys.</p>

              {sessionsLoading ? (
                <div className="flex items-center gap-2 text-xs text-white/40"><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Loading sessions...</div>
              ) : (
                <div className="space-y-3">
                  {sessions.map(s => {
                    const isMobile = /mobile/i.test(s.userAgent || '');
                    return (
                      <div key={s.id} className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${isDark ? 'bg-white/3 border-white/5' : 'bg-black/3 border-black/5'}`}>
                        <div className="flex items-center gap-3 min-w-0">
                          <Smartphone className="w-5 h-5 text-white/40" />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-white truncate max-w-xs">{s.userAgent || 'Unknown Device'}</p>
                            <p className="text-[10px] text-white/40 mt-0.5">{s.ipAddress || 'Unknown IP'} · Created {new Date(s.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <button onClick={() => revokeSession(s.id)} className="px-3 py-1.5 text-[10px] font-bold text-red-400 hover:text-white bg-red-500/10 hover:bg-red-500 rounded-lg transition-all">Revoke</button>
                      </div>
                    );
                  })}
                  {sessions.length === 0 && <p className="text-xs text-white/40">No active login sessions found.</p>}
                </div>
              )}
            </div>

            {/* 2FA Authenticator setup */}
            <div className={`pt-8 border-t ${isDark ? 'border-white/5' : 'border-black/5'}`}>
              <h3 className="text-lg font-bold font-serif mb-2">Two-Factor Authentication (2FA)</h3>
              
              {user?.twoFactorEnabled ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-xs text-emerald-400 font-bold">
                    <ShieldCheck className="w-5 h-5" />
                    Two-Factor Authentication is currently Active
                  </div>
                  
                  <div className="max-w-md space-y-2">
                    <label className="block text-xs font-bold text-white/60">Deactivate 2FA</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="6-digit OTP code" 
                        value={disableTotpCode}
                        onChange={e => setDisableTotpCode(e.target.value)}
                        className={`w-full max-w-[150px] px-3 py-2 rounded-xl border text-xs bg-transparent focus:outline-none ${isDark ? 'border-white/10 text-white' : 'border-black/10 text-black'}`}
                      />
                      <button onClick={disable2FA} className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl transition-all">Disable 2FA</button>
                    </div>
                    {disableError && <p className="text-xs text-red-400">{disableError}</p>}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-xs text-white/40">Secure your database configurations and api pipelines with multi-factor OTP keys.</p>
                  
                  {!is2faSetup ? (
                    <button onClick={setup2FA} className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold rounded-xl transition-all">
                      Setup 2FA Key
                    </button>
                  ) : (
                    <div className="p-5 rounded-xl border border-white/5 bg-white/3 max-w-md space-y-4">
                      <p className="text-xs font-bold text-white">Scan with Google Authenticator or Authy:</p>
                      {totpQr && <img src={totpQr} alt="2FA QR Code" className="w-40 h-40 border border-white/10 rounded-lg mx-auto bg-white p-2" />}
                      <p className="text-xs text-white/40 break-all text-center">Secret Code: <span className="font-mono text-white font-bold">{totpSecret}</span></p>
                      
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-white/60">Verification Code</label>
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            placeholder="Enter 6-digit OTP" 
                            value={totpCode}
                            onChange={e => setTotpCode(e.target.value)}
                            className={`w-full px-3 py-2 rounded-xl border text-xs bg-transparent focus:outline-none ${isDark ? 'border-white/10 text-white' : 'border-black/10 text-black'}`}
                          />
                          <button onClick={enable2FA} className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold rounded-xl transition-all">Verify & Enable</button>
                        </div>
                        {totpError && <p className="text-xs text-red-400">{totpError}</p>}
                      </div>
                    </div>
                  )}

                  {recoveryCodes.length > 0 && (
                    <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 max-w-md">
                      <p className="text-xs font-bold text-emerald-400 mb-2">Backup Recovery Codes</p>
                      <p className="text-[10px] text-white/50 mb-3">Save these codes safely. Each code can be used once to recover account access.</p>
                      <div className="grid grid-cols-2 gap-1.5 font-mono text-xs text-white">
                        {recoveryCodes.map((code, idx) => (
                          <div key={idx} className="bg-white/5 p-1 rounded text-center border border-white/5">{code}</div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Billing & Analytics */}
        {activeTab === 'billing' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold font-serif">Billing Center</h3>
              <span className="text-xs px-2 py-0.5 bg-violet-500/10 text-violet-400 rounded-full font-bold border border-violet-500/20">Stripe Sandbox</span>
            </div>

            {/* Usage metrics charts mockup */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className={`p-5 rounded-xl border ${isDark ? 'bg-white/3 border-white/5' : 'bg-black/3 border-black/5'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-white/40">Credits Balance</span>
                  <Wallet className="w-4 h-4 text-violet-400" />
                </div>
                <p className="text-2xl font-bold font-serif">$124.50</p>
                <p className="text-[10px] text-white/40 mt-1">Resets next month billing cycle</p>
              </div>

              <div className={`p-5 rounded-xl border ${isDark ? 'bg-white/3 border-white/5' : 'bg-black/3 border-black/5'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-white/40">API Analytics</span>
                  <BarChart3 className="w-4 h-4 text-emerald-400" />
                </div>
                <p className="text-2xl font-bold font-serif">58.4K <span className="text-xs text-white/30 font-normal">/ 100K calls</span></p>
                <p className="text-[10px] text-white/40 mt-1">58.4% monthly quota consumed</p>
              </div>
            </div>

            {/* Upgrades */}
            <div className={`p-6 rounded-2xl border bg-gradient-to-br from-violet-600/10 via-indigo-600/5 to-transparent border-violet-500/20`}>
              <h4 className="text-base font-bold flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-violet-400" />
                Need more region scaling?
              </h4>
              <p className="text-xs text-white/50 mt-1 mb-4">Upgrade to Pro to enable multitenant load balancing and 24/7 technical support engineers.</p>
              <button onClick={() => navigate('/pricing')} className="px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-violet-500/20">Upgrade Now</button>
            </div>

            {/* Invoices list */}
            <div>
              <h4 className="text-sm font-bold mb-3">Recent Invoices</h4>
              <div className="space-y-2">
                {[
                  { id: 'INV-0042', amount: 39, date: '2026-05-12', desc: 'SaaS Pro Monthly Subscription' },
                  { id: 'INV-0021', amount: 19, date: '2026-04-12', desc: 'Credits Wallet Top-Up' }
                ].map(inv => (
                  <div key={inv.id} className={`p-4 rounded-xl border flex items-center justify-between ${isDark ? 'bg-white/3 border-white/5' : 'bg-black/3 border-black/5'}`}>
                    <div>
                      <p className="text-xs font-bold text-white">{inv.desc}</p>
                      <p className="text-[10px] text-white/40 mt-0.5">{inv.id} · {inv.date}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold font-mono">${inv.amount}.00</span>
                      <a 
                        href={`data:text/plain;charset=utf-8,${encodeURIComponent(`Deployra Invoice ${inv.id}\nDate: ${inv.date}\nAmount: $${inv.amount}.00\nStatus: Paid`)}`} 
                        download={`deployra_${inv.id}.txt`}
                        className="p-1 text-white/40 hover:text-white hover:bg-white/5 rounded-lg"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Teams / Organizations */}
        {activeTab === 'teams' && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold font-serif mb-2">Team Workspace</h3>
            <p className="text-xs text-white/40 mb-4">Invite administrators or developers to manage listings in collaboration.</p>

            <form onSubmit={handleInviteTeam} className="flex gap-2 max-w-md">
              <input 
                type="email" 
                placeholder="developer@email.com" 
                value={inviteEmail} 
                onChange={e => setInviteEmail(e.target.value)} 
                className={`flex-1 px-3 py-2 rounded-xl border text-xs bg-transparent focus:outline-none ${isDark ? 'border-white/10 text-white' : 'border-black/10 text-black'}`} 
              />
              <select 
                value={inviteRole} 
                onChange={e => setInviteRole(e.target.value)} 
                className={`px-3 py-2 rounded-xl border text-xs bg-transparent focus:outline-none ${isDark ? 'border-white/10 text-white bg-[#0b0f19]' : 'border-black/10 text-black bg-white'}`}
              >
                <option value="Admin">Admin</option>
                <option value="Developer">Developer</option>
                <option value="Member">Member</option>
              </select>
              <button type="submit" className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold rounded-xl transition-all">Invite</button>
            </form>
            {inviteMsg && <p className="text-xs text-emerald-400">{inviteMsg}</p>}

            <div className="pt-4 space-y-3">
              <h4 className="text-xs uppercase tracking-wider font-bold text-white/40">Workspace Members</h4>
              <div className="space-y-2">
                {teamMembers.map(m => (
                  <div key={m.id} className={`p-4 rounded-xl border flex items-center justify-between ${isDark ? 'bg-white/3 border-white/5' : 'bg-black/3 border-black/5'}`}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-violet-500 flex items-center justify-center text-xs text-white font-bold">{m.avatar}</div>
                      <div>
                        <p className="text-xs font-bold text-white">{m.name}</p>
                        <p className="text-[10px] text-white/40">{m.email}</p>
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 bg-white/5 border border-white/10 rounded-full font-bold text-white/70">{m.role}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Preferences */}
        {activeTab === 'preferences' && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold font-serif mb-4">System Preferences</h3>

            {/* Theme selector */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-white/60">Theme Mode</label>
              <div className="flex gap-2 max-w-sm bg-white/5 p-1 rounded-xl border border-white/5">
                {[
                  { mode: 'light', icon: Sun, label: 'Light' },
                  { mode: 'dark', icon: Moon, label: 'Dark' }
                ].map(opt => {
                  const isActive = prefTheme === opt.mode;
                  return (
                    <button 
                      key={opt.mode} 
                      onClick={() => { setPrefTheme(opt.mode); if (opt.mode !== theme) toggleTheme(); savePreferences({ theme: opt.mode, lang: prefLang, accessibility, notifications: notifPreferences }); }} 
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${isActive ? 'bg-violet-600 text-white shadow-md' : 'text-white/40 hover:text-white/60'}`}
                    >
                      <opt.icon className="w-3.5 h-3.5" />
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Language picker */}
            <div className="space-y-2 pt-4 border-t border-white/5">
              <label className="block text-xs font-bold text-white/60">Internationalization (i18n)</label>
              <select 
                value={prefLang} 
                onChange={e => { setPrefLang(e.target.value); setActiveLang(e.target.value); savePreferences({ theme: prefTheme, lang: e.target.value, accessibility, notifications: notifPreferences }); }}
                className={`w-full max-w-sm px-3 py-2.5 rounded-xl border text-xs bg-transparent focus:outline-none ${isDark ? 'border-white/10 text-white bg-[#0b0f19]' : 'border-black/10 text-black bg-white'}`}
              >
                {LANGUAGES.map(lang => (
                  <option key={lang.code} value={lang.code}>{lang.label} ({lang.native})</option>
                ))}
              </select>
            </div>

            {/* Accessibility */}
            <div className="space-y-4 pt-4 border-t border-white/5">
              <label className="block text-xs font-bold text-white/60">Accessibility Adjustments</label>
              
              <div className="space-y-3">
                <label className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-white/3 cursor-pointer">
                  <div>
                    <p className="text-xs font-bold">Reduced Motion</p>
                    <p className="text-[10px] text-white/40">Disable spring translations and fade animations.</p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={accessibility.reducedMotion} 
                    onChange={e => {
                      const val = { ...accessibility, reducedMotion: e.target.checked };
                      setAccessibility(val);
                      savePreferences({ theme: prefTheme, lang: prefLang, accessibility: val, notifications: notifPreferences });
                    }} 
                    className="w-4 h-4 accent-violet-500" 
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-white/3 cursor-pointer">
                  <div>
                    <p className="text-xs font-bold">High Contrast Mode</p>
                    <p className="text-[10px] text-white/40">Increase visibility borders and element contrasts.</p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={accessibility.highContrast} 
                    onChange={e => {
                      const val = { ...accessibility, highContrast: e.target.checked };
                      setAccessibility(val);
                      savePreferences({ theme: prefTheme, lang: prefLang, accessibility: val, notifications: notifPreferences });
                    }} 
                    className="w-4 h-4 accent-violet-500" 
                  />
                </label>
              </div>
            </div>

            {/* Notification channels checkboxes */}
            <div className="space-y-4 pt-4 border-t border-white/5">
              <label className="block text-xs font-bold text-white/60">Granular Notification Channels</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { key: 'email', label: 'Email Alerts' },
                  { key: 'push', label: 'Push Notifications' },
                  { key: 'security', label: 'Security & Auth logs' },
                  { key: 'billing', label: 'Billing Invoices' },
                  { key: 'productUpdates', label: 'Product releases' }
                ].map(channel => (
                  <label key={channel.key} className="flex items-center gap-2 p-2.5 rounded-xl border border-white/5 hover:bg-white/5 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={notifPreferences[channel.key]} 
                      onChange={e => {
                        const val = { ...notifPreferences, [channel.key]: e.target.checked };
                        setNotifPreferences(val);
                        savePreferences({ theme: prefTheme, lang: prefLang, accessibility, notifications: val });
                      }}
                      className="w-4 h-4 accent-violet-500" 
                    />
                    <span className="text-xs font-semibold">{channel.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 6: Notifications Hub */}
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold font-serif">Notifications History</h3>
              {notifications.length > 0 && (
                <button onClick={markAllAsRead} className="text-xs text-violet-400 hover:text-white font-bold">Mark all read</button>
              )}
            </div>

            <div className="space-y-3">
              {notifications.map(n => (
                <div 
                  key={n.id} 
                  onClick={() => { if (!n.isRead) markAsRead(n.id); }}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    n.isRead 
                      ? isDark ? 'bg-white/3 border-white/5 opacity-60' : 'bg-black/3 border-black/5 opacity-60'
                      : 'bg-gradient-to-r from-violet-500/10 to-indigo-500/5 border-violet-500/20'
                  }`}
                >
                  <div className="flex items-start justify-between mb-1">
                    <h4 className="text-xs font-bold text-white">{n.title}</h4>
                    <span className="text-[9px] text-white/30">{new Date(n.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-xs text-white/50">{n.message}</p>
                </div>
              ))}
              {notifications.length === 0 && (
                <div className="text-center py-12 text-white/40">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-25" />
                  <p className="text-xs">Your inbox is completely clear.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 7: Support, Help Center & Feedback Boards */}
        {activeTab === 'support' && (
          <div className="space-y-8">
            {/* Help FAQs */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold font-serif">Help Center & FAQ</h3>
              
              <div className="flex gap-2 mb-4">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-white/30" />
                  <input 
                    type="text" 
                    placeholder="Search query..." 
                    value={faqSearch}
                    onChange={e => setFaqSearch(e.target.value)}
                    className={`w-full pl-9 pr-4 py-2 rounded-xl border text-xs bg-transparent focus:outline-none ${isDark ? 'border-white/10 text-white' : 'border-black/10 text-black'}`}
                  />
                </div>
              </div>

              <div className="space-y-3">
                {faqs.filter(f => f.q.toLowerCase().includes(faqSearch.toLowerCase()) || f.a.toLowerCase().includes(faqSearch.toLowerCase())).map((f, i) => (
                  <div key={i} className={`p-4 rounded-xl border ${isDark ? 'bg-white/3 border-white/5' : 'bg-black/3 border-black/5'}`}>
                    <h4 className="text-xs font-bold mb-1.5">{f.q}</h4>
                    <p className="text-xs text-white/50">{f.a}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Feature request upvotes (Canny mock) */}
            <div className={`pt-8 border-t ${isDark ? 'border-white/5' : 'border-black/5'}`}>
              <h3 className="text-lg font-bold font-serif mb-2">Feature Request Board</h3>
              <p className="text-xs text-white/40 mb-4">Suggest or upvote future roadmap priorities.</p>

              <div className="space-y-4">
                <form onSubmit={handleCreateFeature} className="space-y-3 p-4 rounded-xl border border-white/5 bg-white/3">
                  <p className="text-xs font-bold">Propose a feature</p>
                  <input 
                    type="text" 
                    placeholder="Title" 
                    value={newFeatureTitle} 
                    onChange={e => setNewFeatureTitle(e.target.value)} 
                    className={`w-full px-3 py-2 rounded-lg border text-xs bg-transparent focus:outline-none ${isDark ? 'border-white/10 text-white' : 'border-black/10 text-black'}`}
                  />
                  <textarea 
                    placeholder="Description / details" 
                    value={newFeatureDesc} 
                    onChange={e => setNewFeatureDesc(e.target.value)} 
                    className={`w-full px-3 py-2 rounded-lg border text-xs bg-transparent focus:outline-none ${isDark ? 'border-white/10 text-white' : 'border-black/10 text-black'}`}
                    rows={2}
                  />
                  <button type="submit" className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold rounded-xl transition-all">Submit Idea</button>
                </form>

                <div className="space-y-3">
                  {featuresList.sort((a,b) => b.votes - a.votes).map(f => (
                    <div key={f.id} className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${isDark ? 'bg-white/3 border-white/5' : 'bg-black/3 border-black/5'}`}>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h4 className="text-xs font-bold text-white">{f.title}</h4>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${f.status === 'Shipped' ? 'bg-emerald-500/10 text-emerald-400' : f.status === 'In Progress' ? 'bg-violet-500/10 text-violet-400' : 'bg-white/5 text-white/40'}`}>{f.status}</span>
                        </div>
                        <p className="text-[11px] text-white/50 max-w-md">{f.description}</p>
                      </div>
                      <button onClick={() => handleUpvoteFeature(f.id)} className={`flex flex-col items-center justify-center p-2.5 rounded-xl border w-12 shrink-0 transition-all ${f.upvoted ? 'bg-violet-600/20 border-violet-500 text-violet-400' : 'border-white/10 text-white/30 hover:text-white'}`}>
                        <ThumbsUp className="w-3.5 h-3.5 mb-1" />
                        <span className="text-[10px] font-bold font-mono">{f.votes}</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bug report form */}
            <div className={`pt-8 border-t ${isDark ? 'border-white/5' : 'border-black/5'}`}>
              <h3 className="text-lg font-bold font-serif mb-2">Report a Bug</h3>
              
              <form onSubmit={handleBugSubmit} className="space-y-4 max-w-lg">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-bold text-white/40 mb-1.5">Category</label>
                    <select 
                      value={bugCategory} 
                      onChange={e => setBugCategory(e.target.value)}
                      className={`w-full px-3 py-2 rounded-xl border text-xs bg-transparent focus:outline-none ${isDark ? 'border-white/10 text-white bg-[#0b0f19]' : 'border-black/10 text-black bg-white'}`}
                    >
                      <option value="Frontend UI">Frontend UI</option>
                      <option value="Database API">Database API</option>
                      <option value="OAuth Login">OAuth Login</option>
                      <option value="Billing Checkout">Billing Checkout</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-bold text-white/40 mb-1.5">Severity</label>
                    <select 
                      value={bugSeverity} 
                      onChange={e => setBugSeverity(e.target.value)}
                      className={`w-full px-3 py-2 rounded-xl border text-xs bg-transparent focus:outline-none ${isDark ? 'border-white/10 text-white bg-[#0b0f19]' : 'border-black/10 text-black bg-white'}`}
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-bold text-white/40 mb-1.5">Reproduction Steps</label>
                  <textarea 
                    placeholder="Describe how to reproduce the issue..." 
                    value={bugSteps} 
                    onChange={e => setBugSteps(e.target.value)} 
                    className={`w-full px-3 py-2 rounded-xl border text-xs bg-transparent focus:outline-none ${isDark ? 'border-white/10 text-white' : 'border-black/10 text-black'}`}
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-bold text-white/40 mb-1.5">Screenshot upload (Mock)</label>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={e => setBugScreenshot(e.target.files?.[0])}
                    className="text-xs text-white/40"
                  />
                </div>

                {bugMsg && <p className="text-xs text-emerald-400 font-bold">{bugMsg}</p>}

                <button type="submit" disabled={bugLoading} className="px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-violet-500/15">
                  {bugLoading ? 'Filing Bug...' : 'File Bug Report'}
                </button>
              </form>
            </div>

            {/* Keyboard Shortcuts Cheatsheet */}
            <div className={`pt-8 border-t ${isDark ? 'border-white/5' : 'border-black/5'}`}>
              <h3 className="text-lg font-bold font-serif mb-3">Keyboard Shortcuts</h3>
              <div className="border border-white/5 rounded-xl overflow-hidden max-w-md">
                {SHORTCUTS.map((s, idx) => (
                  <div key={idx} className={`p-3 flex items-center justify-between border-b border-white/5 text-xs ${idx % 2 === 0 ? 'bg-white/3' : 'bg-transparent'}`}>
                    <span className="font-semibold text-white/70">{s.desc}</span>
                    <kbd className="px-2 py-0.5 rounded bg-white/10 border border-white/10 font-mono text-[10px] text-white">{s.keys}</kbd>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Image Cropper Modal */}
      {cropTarget && (
        <ImageCropperModal
          file={cropTarget}
          onCropComplete={handleCropComplete}
          onClose={() => setCropTarget(null)}
          isDark={isDark}
        />
      )}
    </div>
  );
}
