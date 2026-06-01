import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown, LogOut, LayoutDashboard, User, Bell,
  Heart, Settings, Shield, Eye,
  HelpCircle, BookOpen, Headphones,
  Bug, Lightbulb, MessageCircle, Sun,
  Globe, BellRing,
  Camera, Code2, BadgeCheck,
  Sparkles, Crown, Star, ChevronRight, X, Minus, Plus, ExternalLink
} from 'lucide-react';

import { useAuth } from '@/lib/AuthContext';
import { useTheme } from '@/lib/ThemeContext';
import { useProfile } from '@/hooks/useProfile';
import { useNotifications } from '@/hooks/useNotifications';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const PLAN_CONFIG = {
  CLIENT:    { label: 'Free Plan',       color: 'text-slate-400',   bg: 'bg-slate-400/10',   icon: Star      },
  DEVELOPER: { label: 'Pro Plan',        color: 'text-white font-bold',  bg: 'bg-white/10 border border-white/10',  icon: Sparkles  },
  ADMIN:     { label: 'Enterprise',      color: 'text-amber-400',   bg: 'bg-amber-400/10',   icon: Crown     },
};

const AVATAR_GRADIENT = [
  ['#667eea','#764ba2'], ['#f093fb','#f5576c'], ['#4facfe','#00f2fe'],
  ['#43e97b','#38f9d7'], ['#fa709a','#fee140'], ['#a18cd1','#fbc2eb'],
  ['#ffecd2','#fcb69f'], ['#ff9a9e','#fecfef'],
];

function getAvatarGradient(name = '') {
  const idx = name.charCodeAt(0) % AVATAR_GRADIENT.length;
  return AVATAR_GRADIENT[idx];
}

function getInitials(name) {
  if (!name) return 'U';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function Avatar({ user, size = 'md' }) {
  const [imgError, setImgError] = useState(false);
  const sizes = { sm: 'w-7 h-7 text-[9px]', md: 'w-9 h-9 text-xs', lg: 'w-12 h-12 text-sm' };
  const [g1, g2] = getAvatarGradient(user?.name || '');

  if (user?.profileImage && !imgError) {
    return (
      <img
        src={user.profileImage}
        alt={user?.name || 'Avatar'}
        onError={() => setImgError(true)}
        className={`${sizes[size]} rounded-full object-cover ring-2 ring-white/10`}
        referrerPolicy="no-referrer"
      />
    );
  }

  return (
    <div
      className={`${sizes[size]} rounded-full flex items-center justify-center font-bold shrink-0`}
      style={{ background: `linear-gradient(135deg, ${g1}, ${g2})`, color: '#fff' }}
    >
      {getInitials(user?.name)}
    </div>
  );
}

// Image Cropper Modal for Profile Menu
function DropdownCropper({ file, onCropComplete, onClose, isDark }) {
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

    canvas.width = 200;
    canvas.height = 200;
    ctx.clearRect(0, 0, 200, 200);

    ctx.beginPath();
    ctx.arc(100, 100, 100, 0, Math.PI * 2);
    ctx.clip();

    const iw = img.naturalWidth;
    const ih = img.naturalHeight;
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
    <div className="absolute inset-0 z-[300] flex flex-col p-4 bg-black/95 backdrop-blur-md rounded-2xl">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-bold text-white uppercase tracking-wider">Crop Photo</span>
        <button onClick={onClose} className="p-1 text-white/40 hover:text-white rounded-lg"><X className="w-3.5 h-3.5" /></button>
      </div>

      <div 
        className="relative flex-1 w-full overflow-hidden rounded-xl bg-black/40 border border-white/5 cursor-move"
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
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="w-[120px] h-[120px] rounded-full ring-[2000px] ring-black/70 border border-white/30" />
        </div>
      </div>

      <div className="flex items-center gap-2 my-2">
        <Minus className="w-3.5 h-3.5 text-white/40" />
        <input 
          type="range" 
          min="1" 
          max="3" 
          step="0.05" 
          value={zoom} 
          onChange={(e) => setZoom(parseFloat(e.target.value))} 
          className="flex-1 accent-white h-1 rounded-lg bg-white/10" 
        />
        <Plus className="w-3.5 h-3.5 text-white/40" />
      </div>

      <div className="flex gap-2">
        <button onClick={handleCrop} className="flex-1 py-1.5 bg-white text-black hover:bg-white/90 rounded-xl text-[10px] font-bold transition-all">Save</button>
        <button onClick={onClose} className="flex-1 py-1.5 text-[10px] font-bold rounded-xl border border-white/10 text-white/60 hover:bg-white/5">Cancel</button>
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}

function AvatarUploadOverlay({ user, onUpload, onRemove, isUploading, isDark, onSelectFile }) {
  const fileRef = useRef(null);

  return (
    <div className="relative group/av inline-block shrink-0">
      <Avatar user={user} size="lg" />
      <div className={`absolute inset-0 rounded-full flex flex-col items-center justify-center
        opacity-0 group-hover/av:opacity-100 transition-opacity cursor-pointer
        ${isDark ? 'bg-black/60' : 'bg-white/70'}`}
        onClick={() => fileRef.current?.click()}
      >
        <Camera className={`w-4 h-4 ${isDark ? 'text-white' : 'text-neutral-700'}`} />
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/png,image/jpeg,image/gif,image/webp"
        className="hidden"
        onChange={onSelectFile}
      />
      {isUploading && (
        <div className="absolute inset-0 rounded-full flex items-center justify-center bg-black/50">
          <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}

// Redesigned Menu Accordion Group Component
function AccordionGroup({ title, icon: Icon, isOpen, onToggle, children, isDark }) {
  return (
    <div className={`border-b ${isDark ? 'border-white/5' : 'border-black/5'}`}>
      <button
        onClick={onToggle}
        className={`w-full flex items-center justify-between px-4 py-3 text-xs font-bold transition-all text-left ${
          isOpen 
            ? isDark ? 'text-white bg-white/3' : 'text-neutral-900 bg-black/3' 
            : isDark ? 'text-white/60 hover:text-white hover:bg-white/5' : 'text-neutral-600 hover:text-neutral-900 hover:bg-black/5'
        }`}
      >
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4 opacity-75" />}
          <span>{title}</span>
        </div>
        <ChevronRight className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-90 text-white' : 'opacity-40'}`} />
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={`overflow-hidden px-2 py-1 space-y-0.5 ${isDark ? 'bg-black/20' : 'bg-black/[0.02]'}`}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Redesigned Menu Item Component (Accordion Children)
function DropdownItem({ icon: Icon, label, to, onClick, isDark, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = to && location.pathname === to;

  const handleClick = () => {
    if (onClick) onClick();
    if (to) navigate(to);
    if (onClose) onClose();
  };

  return (
    <button
      onClick={handleClick}
      className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all text-left ${
        isActive
          ? isDark ? 'text-white bg-white/10 font-bold' : 'text-neutral-900 bg-black/10 font-bold'
          : isDark ? 'text-white/50 hover:text-white hover:bg-white/5' : 'text-neutral-500 hover:text-neutral-900 hover:bg-black/5'
      }`}
    >
      {Icon && <Icon className="w-3.5 h-3.5 opacity-70" />}
      <span>{label}</span>
    </button>
  );
}

export default function ProfileMenu() {
  const [open, setOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [activeAccordion, setActiveAccordion] = useState(null);
  const [cropFile, setCropFile] = useState(null);

  const ref = useRef(null);
  const { user, logout } = useAuth();
  const { isDark } = useTheme();
  const { uploadAvatar, removeAvatar, isUploading } = useProfile();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();

  const plan = PLAN_CONFIG[user?.role] || PLAN_CONFIG.CLIENT;
  const PlanIcon = plan.icon;
  const isGoogle = user?.authProvider === 'google';
  const isVerified = user?.isEmailVerified;
  const isDev = user?.role === 'DEVELOPER';
  const isAdmin = user?.role === 'ADMIN';
  const dashPath = isAdmin ? '/admin' : isDev ? '/developer' : '/client';

  const prefs = user?.preferencesJson ? (typeof user.preferencesJson === 'string' ? JSON.parse(user.preferencesJson) : user.preferencesJson) : {};

  // outside clicks
  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);

  // Escape key close
  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (e.key === 'Escape') { setOpen(false); setShowLogoutConfirm(false); setCropFile(null); } };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [open]);

  const close = useCallback(() => { 
    setOpen(false); 
    setShowLogoutConfirm(false); 
    setCropFile(null); 
  }, []);

  const handleSelectFile = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setCropFile(file);
    }
    e.target.value = '';
  };

  const handleCropComplete = async (croppedFile) => {
    setCropFile(null);
    try {
      await uploadAvatar(croppedFile);
    } catch (_) {}
  };

  const toggleAccordion = (name) => {
    setActiveAccordion(activeAccordion === name ? null : name);
  };

  if (!user) return null;

  const panelBg = isDark ? 'bg-[#0b0f19] border-white/5' : 'bg-white border-black/5';

  return (
    <div ref={ref} className="relative">
      
      {/* ── Trigger button ── */}
      <motion.button
        id="profile-menu-trigger"
        aria-label="Open profile menu"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen(v => !v)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        className={`flex items-center gap-1.5 p-1 pr-2.5 rounded-full transition-all ${
          isDark
            ? open ? 'bg-white/10' : 'hover:bg-white/8'
            : open ? 'bg-black/8' : 'hover:bg-black/6'
        }`}
      >
        <div className="relative">
          <Avatar user={user} size="sm" />
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-[1.5px] ring-[#0f0f0f] z-10 animate-pulse" />
        </div>
        <span className={`text-xs font-semibold hidden sm:inline ${isDark ? 'text-white/80' : 'text-neutral-800'}`}>
          {user.name.split(' ')[0]}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isDark ? 'text-white/40' : 'text-neutral-400'} ${open ? 'rotate-180' : ''}`} />
      </motion.button>

      {/* ── Dropdown panel ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96, transition: { duration: 0.12 } }}
            transition={{ type: 'spring', stiffness: 420, damping: 32 }}
            className={`absolute right-0 top-full mt-2 w-[280px] rounded-2xl border shadow-2xl overflow-hidden z-[200] ${panelBg}`}
            style={{
              boxShadow: isDark
                ? '0 32px 80px -12px rgba(0,0,0,0.9), 0 0 0 0.5px rgba(255,255,255,0.06)'
                : '0 32px 80px -12px rgba(0,0,0,0.18), 0 0 0 0.5px rgba(0,0,0,0.07)',
              maxHeight: '70vh',
              overflowY: 'auto'
            }}
            role="menu"
            aria-label="Profile menu"
          >
            {/* Identity Cropper Overlay */}
            {cropFile && (
              <DropdownCropper
                file={cropFile}
                onCropComplete={handleCropComplete}
                onClose={() => setCropFile(null)}
                isDark={isDark}
              />
            )}

            {/* ═══ SECTION 1 — User Identity ═══ */}
            <div className={`p-4 border-b ${isDark ? 'border-white/5' : 'border-black/5'}`}>
              <div className="flex items-center gap-3">
                <AvatarUploadOverlay
                  user={user}
                  onUpload={uploadAvatar}
                  onRemove={removeAvatar}
                  isUploading={isUploading}
                  isDark={isDark}
                  onSelectFile={handleSelectFile}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <p className={`text-xs font-bold truncate ${isDark ? 'text-white' : 'text-neutral-900'}`}>{user.name}</p>
                    {isVerified && <BadgeCheck className="w-3.5 h-3.5 text-sky-400 shrink-0" />}
                  </div>
                  <p className={`text-[10px] truncate mt-0.5 ${isDark ? 'text-white/40' : 'text-neutral-400'}`}>{user.email}</p>
                  
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-bold ${plan.bg} ${plan.color}`}>
                      <PlanIcon className="w-2.5 h-2.5" />
                      {plan.label}
                    </span>
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-400/10 text-emerald-400 text-[9px] font-bold">
                      Online
                    </span>
                  </div>
                </div>
              </div>
            </div>



            {/* ═══ SECTION 3 — Accordion Groups ═══ */}
            <div className="flex flex-col">
              
              {/* Accordion 1: Navigation */}
              <AccordionGroup title="Navigation" icon={LayoutDashboard} isOpen={activeAccordion === 'nav'} onToggle={() => toggleAccordion('nav')} isDark={isDark}>
                <DropdownItem icon={LayoutDashboard} label="Dashboard" to={dashPath} isDark={isDark} onClose={close} />
                <DropdownItem icon={User} label="My Profile" to="/settings?tab=profile" isDark={isDark} onClose={close} />
                <DropdownItem icon={Bell} label="Notifications" to="/settings?tab=notifications" isDark={isDark} onClose={close} />
                {!isDev && !isAdmin && (
                  <DropdownItem icon={Heart} label="Saved Items" to="/client/wishlist" isDark={isDark} onClose={close} />
                )}
                {isDev && (
                  <DropdownItem icon={Code2} label="My Listings" to="/developer/listings" isDark={isDark} onClose={close} />
                )}
              </AccordionGroup>

              {/* Accordion 2: Account & Security */}
              <AccordionGroup title="Account & Security" icon={Shield} isOpen={activeAccordion === 'sec'} onToggle={() => toggleAccordion('sec')} isDark={isDark}>
                <DropdownItem icon={Settings} label="Account Settings" to="/settings?tab=profile" isDark={isDark} onClose={close} />
                <DropdownItem icon={Shield} label="Security Settings" to="/settings?tab=security" isDark={isDark} onClose={close} />
                <DropdownItem icon={Eye} label="Privacy Controls" to="/settings?tab=privacy" isDark={isDark} onClose={close} />
              </AccordionGroup>



              {/* Accordion 3: Support & Resources */}
              <AccordionGroup title="Support & Resources" icon={HelpCircle} isOpen={activeAccordion === 'supp'} onToggle={() => toggleAccordion('supp')} isDark={isDark}>
                <DropdownItem icon={HelpCircle} label="Help Center" to="/settings?tab=support" isDark={isDark} onClose={close} />
                <DropdownItem icon={BookOpen} label="Documentation" to="/settings?tab=support" isDark={isDark} onClose={close} />
                <DropdownItem icon={Headphones} label="Contact Support" to="/settings?tab=support" isDark={isDark} onClose={close} />
                <DropdownItem icon={Bug} label="Report a Bug" to="/settings?tab=support" isDark={isDark} onClose={close} />
                <DropdownItem icon={Lightbulb} label="Feature Requests" to="/settings?tab=support" isDark={isDark} onClose={close} />
                <button
                  onClick={() => { window.open('https://discord.gg/deployra', '_blank', 'noopener,noreferrer'); close(); }}
                  className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all text-left ${
                    isDark ? 'text-white/50 hover:text-white hover:bg-white/5' : 'text-neutral-500 hover:text-neutral-900 hover:bg-black/5'
                  }`}
                >
                  <MessageCircle className="w-3.5 h-3.5 opacity-70" />
                  <span>Community</span>
                  <ExternalLink className="w-3 h-3 opacity-40 ml-auto" />
                </button>
              </AccordionGroup>

              {/* Accordion 4: Preferences */}
              <AccordionGroup title="Preferences" icon={Settings} isOpen={activeAccordion === 'pref'} onToggle={() => toggleAccordion('pref')} isDark={isDark}>
                <DropdownItem icon={Sun} label="Theme Selection" to="/settings?tab=preferences" isDark={isDark} onClose={close} />
                <DropdownItem icon={Globe} label="Language Settings" to="/settings?tab=preferences" isDark={isDark} onClose={close} />
                <DropdownItem icon={BellRing} label="Notification Preferences" to="/settings?tab=preferences" isDark={isDark} onClose={close} />
              </AccordionGroup>

            </div>

            {/* Logout conformation below Accordion */}
            <div className={`p-4 border-t ${isDark ? 'border-white/5' : 'border-black/5'}`}>
              <AnimatePresence mode="wait">
                {showLogoutConfirm ? (
                  <motion.div
                    key="confirm"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <div className={`p-3 rounded-xl border text-[11px] ${
                      isDark ? 'bg-red-500/5 border-red-500/10 text-white/60' : 'bg-red-50 border-red-100 text-neutral-600'
                    }`}>
                      <p className="font-semibold mb-2">Sign out of your account?</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => { logout(); close(); }}
                          className="flex-1 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-[10px] font-bold transition-all"
                        >
                          Sign Out
                        </button>
                        <button
                          onClick={() => setShowLogoutConfirm(false)}
                          className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-colors ${
                            isDark ? 'bg-white/5 text-white/60 hover:bg-white/10' : 'bg-black/5 text-neutral-600 hover:bg-black/10'
                          }`}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.button
                    key="btn"
                    onClick={() => setShowLogoutConfirm(true)}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold text-red-400 hover:bg-red-500/10 transition-all border border-red-500/20"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out Account
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
            
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
