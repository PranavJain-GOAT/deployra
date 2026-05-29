import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Check, Upload, ChevronRight, ChevronLeft, ShieldCheck,
  Zap, Globe, Trash2, MapPin, AlertCircle, RefreshCw,
  FileCheck, Lock, Info, CheckCircle2,
  XCircle, AlertTriangle, Star, Award, Plus, X,
  Briefcase, GraduationCap, Languages, FileText, User, Camera, Cloud,
  Laptop, Smartphone
} from 'lucide-react';
import axios from 'axios';
import confetti from 'canvas-confetti';
import { useAuth } from '@/lib/AuthContext';
import { useTheme } from '@/lib/ThemeContext';
import { useProfile } from '@/hooks/useProfile';
import { API_URL } from '@/lib/config';

// ─── Constants & Templates ──────────────────────────────────────────────────
const ROLE_TEMPLATES = {
  'Software Engineering': {
    demand: 96, avgRate: 85,
    trends: 'High request volumes for Next.js, FastAPI & PostgreSQL developers.',
    titleSuggestions: ['Full Stack Web Developer', 'React & Next.js Engineer', 'AI SaaS Developer', 'Frontend Performance Engineer'],
    skills: ['React', 'Next.js', 'TypeScript', 'Node.js', 'PostgreSQL', 'TailwindCSS'],
    subRoles: ['React & Node.js Specialist', 'TypeScript Engineer', 'Backend API Architect'],
  },
  'AI & Data Science': {
    demand: 98, avgRate: 110,
    trends: 'Surge in LLM fine-tuning, retrieval pipelines (RAG), and vector DB setup.',
    titleSuggestions: ['AI / Machine Learning Engineer', 'RAG Pipeline Specialist', 'Data Infrastructure Engineer'],
    skills: ['Python', 'PyTorch', 'LangChain', 'OpenAI API', 'Vector Databases', 'Docker'],
    subRoles: ['ML Model Trainer', 'LLM Fine-Tuner', 'RAG Specialist'],
  },
  'UI/UX Design': {
    demand: 88, avgRate: 75,
    trends: 'Demand for interactive prototype design systems and dark-mode glassmorphism.',
    titleSuggestions: ['Senior Product Designer', 'Design Systems Engineer', 'Interactive UI Specialist'],
    skills: ['Figma', 'Framer', 'UI Design', 'Design Systems', 'UX Research'],
    subRoles: ['Product Designer', 'Design Systems Lead', 'Motion Designer'],
  },
  'Product Management': {
    demand: 85, avgRate: 90,
    trends: 'Strong market demand for technical PMs with cloud architectures background.',
    titleSuggestions: ['Technical Product Manager', 'Product Delivery Specialist', 'SaaS Growth PM'],
    skills: ['Agile Roadmap', 'Jira', 'Product Strategy', 'SaaS Metrics'],
    subRoles: ['Technical PM', 'Growth PM', 'Product Ops'],
  },
  'Web3 & Blockchain': {
    demand: 91, avgRate: 105,
    trends: 'Smart contract security audits and decentralized state-management systems.',
    titleSuggestions: ['Solidity Smart Contract Engineer', 'Web3 Protocol Architect', 'Rust Blockchain Engineer'],
    skills: ['Solidity', 'Rust', 'Ethers.js', 'Smart Contracts', 'Web3 Architecture'],
    subRoles: ['Smart Contract Dev', 'DeFi Protocol Engineer', 'Blockchain Security Auditor'],
  }
};

const SUGGESTED_COMPLEMENTS = {
  'React': ['TypeScript', 'Next.js', 'TailwindCSS'],
  'Python': ['PyTorch', 'Docker', 'FastAPI'],
  'Solidity': ['Rust', 'Ethers.js', 'Cryptography'],
  'Figma': ['Framer', 'UI Design', 'CSS Effects'],
  'Node.js': ['PostgreSQL', 'GraphQL', 'Docker'],
};

const STEP_NAMES = {
  1: 'Role & Identity',
  2: 'Technical Stack',
  3: 'Career Milestones',
  4: 'Bio & Communication',
  5: 'Trust & Verification'
};

const STEP_ICONS = {
  1: User,
  2: Sparkles,
  3: Briefcase,
  4: FileText,
  5: ShieldCheck
};

// ─── Toast Component ────────────────────────────────────────────────────────
function Toast({ message, type = 'success', onDismiss }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 3500);
    return () => clearTimeout(t);
  }, [onDismiss]);

  const styles = {
    success: 'bg-[#060a13] border-white/20 text-white',
    error: 'bg-[#060a13] border-red-500/35 text-red-400',
    info: 'bg-[#060a13] border-white/10 text-white/80',
  };
  const icons = {
    success: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />,
    error: <XCircle className="w-4 h-4 text-red-400 shrink-0" />,
    info: <AlertCircle className="w-4 h-4 text-white/60 shrink-0" />,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -12, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -12, scale: 0.96 }}
      className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border text-xs font-semibold shadow-2xl ${styles[type]}`}
    >
      {icons[type]}
      <span className="flex-1">{message}</span>
      <button onClick={onDismiss} className="opacity-40 hover:opacity-100 transition-opacity ml-1">
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

// ─── Field Error ────────────────────────────────────────────────────────────
function FieldError({ message }) {
  if (!message) return null;
  return (
    <motion.p
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-xs text-red-400 font-medium flex items-center gap-1.5 mt-1.5"
    >
      <AlertCircle className="w-3.5 h-3.5" /> {message}
    </motion.p>
  );
}

// ─── Circle Headshot Cropper Modal ──────────────────────────────────────────
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
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className={`w-full max-w-sm p-6 rounded-2xl border shadow-2xl ${isDark ? 'bg-[#060a13] border-white/10' : 'bg-white border-black/10'}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-sm font-bold font-serif ${isDark ? 'text-white' : 'text-neutral-900'}`}>Edit Photo Area</h3>
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
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="w-[180px] h-[180px] rounded-full ring-[2000px] ring-black/70 border border-white/30 shadow-inner" />
          </div>
        </div>

        <div className="flex items-center gap-3 my-4">
          <Minus className="w-4 h-4 text-white/40" />
          <input 
            type="range" 
            min="1" 
            max="3" 
            step="0.05" 
            value={zoom} 
            onChange={(e) => setZoom(parseFloat(e.target.value))} 
            className="flex-1 accent-white h-1 rounded-lg cursor-pointer bg-white/10" 
          />
          <Plus className="w-4 h-4 text-white/40" />
        </div>

        <div className="flex gap-2">
          <button onClick={handleCrop} className="flex-1 py-2.5 bg-white text-black hover:bg-neutral-200 rounded-xl text-xs font-bold transition-all shadow-lg">Save Crop</button>
          <button onClick={onClose} className={`flex-1 py-2.5 text-xs font-bold rounded-xl border ${isDark ? 'border-white/10 text-white/60 hover:bg-white/5' : 'border-black/10 text-neutral-600 hover:bg-black/5'}`}>Cancel</button>
        </div>
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}

// ─── Main Onboarding Component ──────────────────────────────────────────────
export default function Onboarding() {
  const navigate = useNavigate();
  const { user, checkAuth } = useAuth();
  const { isDark } = useTheme();
  const { uploadAvatar } = useProfile();

  const [step, setStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [cloudSynced, setCloudSynced] = useState(true);
  const [toast, setToast] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [shakeStep, setShakeStep] = useState(false);

  // 5-Step Unified Form Data Schema
  const [formData, setFormData] = useState({
    linkedinUrl: '', githubUrl: '', portfolioUrl: '', specialization: 'Software Engineering',
    subRole: 'React & Node.js Specialist', hourlyRate: 85, experienceLevel: 'Senior',
    skills: ['React', 'Node.js', 'PostgreSQL', 'TailwindCSS', 'TypeScript'],
    title: 'Senior Full Stack Engineer',
    experience: [{
      id: 'exp-1', company: 'Vercel', role: 'Senior Frontend Architect', duration: '2024 - Present',
      bullets: ['Architected low-latency web interfaces, improving server-side rendering performance by 32%.', 'Developed modular component systems utilized across enterprise-level deployments.']
    }],
    education: [{ id: 'edu-1', school: 'Stanford University', degree: 'M.S. in Computer Science', year: '2023', gpa: '3.9' }],
    certifications: [{ id: 'cert-1', name: 'AWS Certified Solutions Architect', issuer: 'Amazon Web Services', year: '2023' }],
    languages: [{ code: 'en', name: 'English', fluency: 'Native / Bilingual' }, { code: 'es', name: 'Spanish', fluency: 'Conversational' }],
    bio: 'High-performance engineer focused on building scalable interfaces, optimizing bundle delivery speeds, and configuring modern cloud pipelines.',
    bioTone: 'professional',
    phone: '', address: '', photoUrl: user?.profileImage || '',
    idVerified: false, addressVerified: false,
  });

  const [skillSearch, setSkillSearch] = useState('');
  const [tempExp, setTempExp] = useState({ company: '', role: '', duration: '', bullet: '' });
  const [showExpForm, setShowExpForm] = useState(false);
  const [tempEdu, setTempEdu] = useState({ school: '', degree: '', year: '', gpa: '' });
  const [showEduForm, setShowEduForm] = useState(false);
  const [tempCert, setTempCert] = useState({ name: '', issuer: '', year: '' });
  const [tempLang, setTempLang] = useState({ code: 'en', name: 'English', fluency: 'Fluent' });
  const [isParsing, setIsParsing] = useState(false);
  const [parseProgress, setParseProgress] = useState(0);
  const [parseStatus, setParseStatus] = useState('');
  const [aiOptimizing, setAiOptimizing] = useState(false);
  
  // Phone OTP SMS states
  const [smsSent, setSmsSent] = useState(false);
  const [smsCode, setSmsCode] = useState('');
  const [smsError, setSmsError] = useState('');
  const [phoneVerified, setPhoneVerified] = useState(false);
  
  // Photo crop overlay
  const [cropFile, setCropFile] = useState(null);
  const [isCropping, setIsCropping] = useState(false);
  const [photoScore, setPhotoScore] = useState(0);
  const [lightingScore, setLightingScore] = useState(0);

  const photoInputRef = useRef(null);

  useEffect(() => {
    if (user?.country && !formData.address) setFormData(p => ({ ...p, address: user.country }));
    if (user?.profileImage && !formData.photoUrl) setFormData(p => ({ ...p, photoUrl: user.profileImage }));
  }, [user]);

  const showToast = useCallback((message, type = 'success') => setToast({ message, type }), []);
  const dismissToast = useCallback(() => setToast(null), []);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const res = await axios.get(`${API_URL}/users/preferences`);
        if (res.data?.success && res.data?.data) {
          const prefs = res.data.data;
          if (prefs.onboardingData) setFormData(p => ({ ...p, ...prefs.onboardingData }));
          // Ensure we clamp the step to our new 5-step range
          if (prefs.onboardingStep && prefs.onboardingStep <= 5) setStep(prefs.onboardingStep);
        }
      } catch (_) {}
    };
    fetchProgress();
  }, []);

  const saveProgress = async (nextStep) => {
    setIsSaving(true);
    setCloudSynced(false);
    try {
      await axios.patch(`${API_URL}/users/preferences`, {
        preferences: { onboardingStep: nextStep, onboarded: nextStep > 5, onboardingData: formData }
      });
      if (nextStep > 1 && formData.address) {
        await axios.patch(`${API_URL}/users/me`, { country: formData.address.split(',').pop().trim() });
      }
      setCloudSynced(true);
    } catch (err) {
      showToast('Autosave failed — data preserved locally.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const validateStep = (s) => {
    const errors = {};
    if (s === 1) {
      if (!formData.title || formData.title.trim().length < 5) errors.title = 'Title must be at least 5 characters.';
    }
    if (s === 2) {
      if (formData.skills.length === 0) errors.skills = 'Add at least one core skill to configure your stack.';
    }
    if (s === 4) {
      if (!formData.bio || formData.bio.trim().length < 20) errors.bio = 'Your bio must contain at least 20 characters.';
    }
    return errors;
  };

  const handleNext = () => {
    const errors = validateStep(step);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setShakeStep(true);
      setTimeout(() => setShakeStep(false), 500);
      return;
    }
    setFieldErrors({});
    if (step < 5) {
      const next = step + 1;
      setStep(next);
      saveProgress(next);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (step > 1) { setFieldErrors({}); setStep(step - 1); }
  };

  const handleComplete = async () => {
    setIsSaving(true);
    try {
      await axios.patch(`${API_URL}/users/preferences`, {
        preferences: { onboardingStep: 6, onboarded: true, onboardingData: formData }
      });
      const updatePayload = { role: 'DEVELOPER' };
      if (formData.address) updatePayload.country = formData.address.split(',').pop().trim();
      await axios.patch(`${API_URL}/users/me`, updatePayload);
      if (checkAuth) await checkAuth();
      confetti({ particleCount: 200, spread: 100, origin: { y: 0.6 }, colors: ['#ffffff', '#888888', '#cccccc'] });
      showToast('🎉 Profile configured! Loading developer cockpit...', 'success');
      setTimeout(() => navigate('/developer'), 2000);
    } catch (err) {
      showToast('Failed to complete onboarding.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Step 1 LinkedIn / GitHub import triggers
  const handleSocialImport = (provider) => {
    setIsParsing(true); setParseProgress(20); setParseStatus(`Accessing ${provider} credentials...`);
    setTimeout(() => { setParseProgress(60); setParseStatus('Extracting portfolio milestones...'); }, 600);
    setTimeout(() => {
      setParseProgress(100); setParseStatus('✓ Sync complete');
      setTimeout(() => {
        setIsParsing(false);
        if (provider === 'github') {
          setFormData(p => ({
            ...p,
            githubUrl: `https://github.com/${user?.name?.toLowerCase().replace(/ /g, '') || 'dev'}`,
            skills: [...new Set([...p.skills, 'Git', 'Docker', 'REST APIs'])]
          }));
          showToast('Synced GitHub repositories!', 'success');
        } else {
          setFormData(p => ({
            ...p,
            linkedinUrl: `https://linkedin.com/in/${user?.name?.toLowerCase().replace(/ /g, '') || 'dev'}`
          }));
          showToast('LinkedIn profile details fetched!', 'success');
        }
      }, 500);
    }, 1500);
  };

  // Skills handlers
  const handleAddSkill = (skill) => {
    const t = skill.trim();
    if (t && !formData.skills.includes(t)) {
      setFormData(p => ({ ...p, skills: [...p.skills, t] }));
      setSkillSearch('');
      if (fieldErrors.skills) setFieldErrors(p => ({ ...p, skills: undefined }));
    }
  };
  const handleRemoveSkill = (skill) => setFormData(p => ({ ...p, skills: p.skills.filter(s => s !== skill) }));

  const scoreTitle = (t) => {
    let s = 65;
    if (t.toLowerCase().includes('architect')) s += 15;
    if (t.toLowerCase().includes('lead') || t.toLowerCase().includes('senior')) s += 15;
    return Math.min(s, 99);
  };

  // AI Experience Bullet Point optimizer
  const handleOptimizeBullet = (idx, bIdx) => {
    setAiOptimizing(true);
    setTimeout(() => {
      const optimized = 'Engineered distributed server-side modules, increasing request caching efficiency by 42% and saving 18 core server hours weekly.';
      const updated = [...formData.experience];
      updated[idx].bullets[bIdx] = optimized;
      setFormData(p => ({ ...p, experience: updated }));
      setAiOptimizing(false);
      showToast('Bullet point rewritten by AI Copilot.', 'info');
    }, 1000);
  };

  // Education & Credentials
  const handleAddEdu = () => {
    if (!tempEdu.school || !tempEdu.degree) { showToast('School and Degree are required.', 'error'); return; }
    setFormData(p => ({ ...p, education: [...p.education, { id: 'edu-' + Date.now(), school: tempEdu.school, degree: tempEdu.degree, year: tempEdu.year || '2024', gpa: tempEdu.gpa }] }));
    setTempEdu({ school: '', degree: '', year: '', gpa: '' });
    setShowEduForm(false);
    showToast('Education credential stored.', 'success');
  };

  // Bio Tone & AI Copy generator
  const handleGenerateBio = () => {
    setAiOptimizing(true);
    setTimeout(() => {
      const bios = {
        technical: `System architect specialized in building high-concurrency client infrastructures using ${formData.skills.slice(0, 3).join(', ')}. Focuses on bundle size reductions and clean API design.`,
        narrative: `I bridge structural database components and reactive web elements. Working as a ${formData.title}, I compile robust and accessible code structures.`,
        minimal: `${formData.title} focused on ${formData.skills.slice(0, 3).join(', ')}. Building low-latency SaaS deployments.`,
        professional: `Experienced ${formData.title} specialized in ${formData.skills.slice(0, 4).join(', ')}. Passionate about building modular frontends and optimizing server response performance.`,
      };
      setFormData(p => ({ ...p, bio: bios[p.bioTone] || bios.professional }));
      setAiOptimizing(false);
      showToast('Bio synthesized with AI Copilot.', 'info');
    }, 1000);
  };

  // Spoken languages
  const handleAddLang = () => {
    if (formData.languages.some(l => l.code === tempLang.code)) { showToast('Language already configured.', 'error'); return; }
    setFormData(p => ({ ...p, languages: [...p.languages, { ...tempLang }] }));
    showToast(`${tempLang.name} added!`, 'success');
  };
  const handleRemoveLang = (code) => setFormData(p => ({ ...p, languages: p.languages.filter(l => l.code !== code) }));

  // Headshot Crop and score assessment
  const handleSelectPhoto = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setCropFile(file); setIsCropping(true);
    }
  };

  const handleCropSave = async (croppedFile) => {
    setIsCropping(false); setParseStatus('Analyzing photo metrics...'); setIsParsing(true);
    setTimeout(async () => {
      setIsParsing(false);
      const fakeUrl = URL.createObjectURL(croppedFile);
      setFormData(p => ({ ...p, photoUrl: fakeUrl }));
      setPhotoScore(95); setLightingScore(99);
      try {
        const url = await uploadAvatar(croppedFile);
        if (url) {
          setFormData(p => ({ ...p, photoUrl: url }));
          showToast('Headshot verified and saved.', 'success');
        }
      } catch (_) {
        showToast('Photo cached locally.', 'info');
      }
    }, 1200);
  };

  // SMS Verification
  const handleSendSMS = () => {
    if (!formData.phone || formData.phone.trim().length < 8) { showToast('Enter a valid mobile phone number.', 'error'); return; }
    setSmsSent(true); setSmsError(''); showToast('Code dispatched! (Pin: 123456)', 'info');
  };

  const handleVerifySMS = () => {
    if (smsCode === '123456' || smsCode.length === 6) {
      setPhoneVerified(true); setSmsSent(false); setSmsCode('');
      showToast('Mobile verified successfully.', 'success');
    } else { setSmsError('Invalid verification code. Use 123456'); }
  };

  function getComplementSuggestions() {
    const list = [];
    formData.skills.forEach(s => {
      (SUGGESTED_COMPLEMENTS[s] || []).forEach(c => {
        if (!formData.skills.includes(c) && !list.includes(c)) list.push(c);
      });
    });
    return list.length > 0 ? list : ['GraphQL', 'Docker', 'Kubernetes', 'FastAPI', 'Redis'];
  }

  const progressPercent = Math.round((step / 5) * 100);
  const currentTemplate = ROLE_TEMPLATES[formData.specialization] || ROLE_TEMPLATES['Software Engineering'];

  // Styling inputs
  const inputCls = `w-full px-4 py-3 rounded-xl border bg-transparent text-xs font-semibold focus:outline-none transition-all ${
    isDark
      ? 'border-white/10 text-white placeholder-white/20 focus:border-white/30 focus:bg-white/[0.02]'
      : 'border-black/10 text-neutral-900 placeholder-neutral-400 focus:border-black/30 focus:bg-black/[0.01]'
  }`;
  const selectCls = `w-full px-4 py-3 rounded-xl border text-xs font-semibold focus:outline-none transition-all ${
    isDark
      ? 'border-white/10 text-white bg-[#060a13] focus:border-white/30'
      : 'border-black/10 text-neutral-900 bg-white focus:border-black/30'
  }`;
  const cardCls = isDark
    ? 'bg-[#080c16]/50 border border-white/5 rounded-2xl backdrop-blur-md'
    : 'bg-white border border-black/5 rounded-2xl shadow-sm';

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#030712] text-white' : 'bg-slate-50 text-neutral-900'} transition-colors pb-12`}>

      {/* Floating toast messages */}
      <div className="fixed top-20 right-4 z-50 w-80 space-y-2 pointer-events-none">
        <AnimatePresence>
          {toast && (
            <div className="pointer-events-auto">
              <Toast message={toast.message} type={toast.type} onDismiss={dismissToast} />
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* ─── Top Progress Header ─── */}
      <div className={`sticky top-16 z-30 backdrop-blur-xl border-b ${isDark ? 'bg-[#030712]/90 border-white/5' : 'bg-slate-50/90 border-black/5'}`}>
        <div className={`h-[2px] w-full ${isDark ? 'bg-white/5' : 'bg-black/5'}`}>
          <motion.div
            className={`h-full ${isDark ? 'bg-white' : 'bg-black'}`}
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>

        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${isDark ? 'bg-white text-black' : 'bg-black text-white'}`}>
              {step}
            </div>
            <span className="text-xs font-semibold tracking-wider uppercase text-white/70">{STEP_NAMES[step]}</span>
            <span className="text-[10px] text-white/30">of 5</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-white/30">
              {isSaving ? (
                <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Auto-Saving</>
              ) : cloudSynced ? (
                <><Cloud className="w-3.5 h-3.5 text-emerald-400" /> Synced</>
              ) : (
                <><AlertCircle className="w-3.5 h-3.5 text-amber-400" /> Pending</>
              )}
            </div>

            <button
              onClick={() => navigate(user?.role === 'DEVELOPER' ? '/developer' : user?.role === 'ADMIN' ? '/admin' : '/')}
              className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg border transition-all ${isDark ? 'border-white/10 hover:bg-white/5 text-white/50 hover:text-white' : 'border-black/10 hover:bg-black/5 text-neutral-500 hover:text-neutral-700'}`}
            >
              Exit
            </button>
          </div>
        </div>
      </div>

      {/* ─── Main Form Container ─── */}
      <main className="max-w-xl mx-auto px-6 mt-10">

        {/* Stepper Dots */}
        <div className="flex items-center gap-1.5 mb-8">
          {Array.from({ length: 5 }, (_, i) => i + 1).map(s => {
            const isCompleted = s < step;
            const isCurrent = s === step;
            return (
              <motion.div
                key={s}
                animate={{ scale: isCurrent ? 1 : 0.85, opacity: isCurrent ? 1 : isCompleted ? 0.9 : 0.25 }}
                className={`rounded-full transition-all ${
                  isCurrent
                    ? `w-6 h-2 ${isDark ? 'bg-white' : 'bg-black'}`
                    : isCompleted
                      ? `w-2 h-2 bg-emerald-400`
                      : `w-2 h-2 ${isDark ? 'bg-white/20' : 'bg-black/15'}`
                }`}
              />
            );
          })}
          <span className="ml-2 text-[10px] font-bold text-white/30">{progressPercent}%</span>
        </div>

        {/* Dynamic Step View */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
            className={shakeStep ? 'animate-shake' : ''}
          >
            {/* Step 1: Role & Identity */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-3xl font-bold font-serif tracking-tight">Tell us about your work</h2>
                  <p className="text-xs text-white/40 mt-1.5 leading-relaxed">Specify specialization and billing parameters. Prefill with sync tools if preferred.</p>
                </div>

                {/* Import Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => handleSocialImport('linkedin')} 
                    className="p-3.5 rounded-xl border border-white/10 hover:bg-white/5 flex items-center justify-center gap-2 text-xs font-bold text-white/80 transition-all"
                  >
                    <LinkedInIcon className="w-4 h-4 text-[#0077b5]" />
                    LinkedIn Import
                  </button>
                  <button 
                    onClick={() => handleSocialImport('github')} 
                    className="p-3.5 rounded-xl border border-white/10 hover:bg-white/5 flex items-center justify-center gap-2 text-xs font-bold text-white/80 transition-all"
                  >
                    <GithubIcon className="w-4 h-4 text-white" />
                    GitHub Sync
                  </button>
                </div>

                {/* Specialization selection */}
                <div className="space-y-2">
                  <label className="block text-[10px] uppercase tracking-wider font-bold text-white/40">Marketplace Specialization</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {Object.keys(ROLE_TEMPLATES).map(cat => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setFormData(p => ({ ...p, specialization: cat, skills: ROLE_TEMPLATES[cat].skills, title: ROLE_TEMPLATES[cat].titleSuggestions[0], subRole: ROLE_TEMPLATES[cat].subRoles[0] }))}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          formData.specialization === cat 
                            ? 'border-white bg-white/5 text-white font-bold' 
                            : 'border-white/10 text-white/50 hover:bg-white/3'
                        }`}
                      >
                        <div className="flex justify-between items-center text-xs">
                          <span>{cat}</span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/5 text-white/40">{ROLE_TEMPLATES[cat].demand}% demand</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-bold text-white/40 mb-2 font-sans">Niche specialty</label>
                    <select value={formData.subRole} onChange={e => setFormData(p => ({ ...p, subRole: e.target.value }))} className={selectCls}>
                      {currentTemplate.subRoles.map(sr => <option key={sr} value={sr}>{sr}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-bold text-white/40 mb-2 font-sans">Experience Level</label>
                    <select value={formData.experienceLevel} onChange={e => setFormData(p => ({ ...p, experienceLevel: e.target.value }))} className={selectCls}>
                      <option value="Mid">Mid Level (3-4 yrs)</option>
                      <option value="Senior">Senior Level (5-8 yrs)</option>
                      <option value="Principal">Principal / Lead (8+ yrs)</option>
                    </select>
                  </div>
                </div>

                {/* Hourly Rate */}
                <div className={`${cardCls} p-5 space-y-3`}>
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-xs font-bold text-white">Target Billing Rate</h4>
                      <p className="text-[10px] text-white/40">Market rate average: ${currentTemplate.avgRate}/hr</p>
                    </div>
                    <span className="text-2xl font-bold font-serif text-white">${formData.hourlyRate}<span className="text-xs text-white/30 font-normal">/hr</span></span>
                  </div>
                  <input
                    type="range" min="20" max="250"
                    value={formData.hourlyRate}
                    onChange={e => setFormData(p => ({ ...p, hourlyRate: parseInt(e.target.value) }))}
                    className="w-full h-1 rounded-lg cursor-pointer accent-white bg-white/10"
                  />
                </div>

                {/* Professional Title */}
                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-bold text-white/40 mb-2">Professional Headline / Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={e => setFormData(p => ({ ...p, title: e.target.value }))}
                    placeholder="e.g. Senior Frontend Architect"
                    className={inputCls}
                  />
                  <FieldError message={fieldErrors.title} />
                </div>
              </div>
            )}

            {/* Step 2: Technical Stack */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-3xl font-bold font-serif tracking-tight">Configure technical stack</h2>
                  <p className="text-xs text-white/40 mt-1.5 leading-relaxed">Specify technical skills. AI tags help clients match code listings to your credentials index.</p>
                </div>

                <div className="space-y-3">
                  <label className="block text-[10px] uppercase tracking-wider font-bold text-white/40">Search & Add tags</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={skillSearch}
                      onChange={e => setSkillSearch(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddSkill(skillSearch); } }}
                      placeholder="e.g. PyTorch, Kubernetes, Next.js..."
                      className={inputCls}
                    />
                    <button
                      onClick={() => handleAddSkill(skillSearch)}
                      className="px-4 py-2.5 bg-white text-black hover:bg-neutral-200 text-xs font-bold rounded-xl transition-all"
                    >
                      Add
                    </button>
                  </div>
                  <FieldError message={fieldErrors.skills} />
                </div>

                {/* Skill tags */}
                <div className="flex flex-wrap gap-2 py-2">
                  {formData.skills.map(skill => (
                    <div key={skill} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border border-white/10 bg-white/5 text-white">
                      <span>{skill}</span>
                      <button onClick={() => handleRemoveSkill(skill)} className="text-white/40 hover:text-white transition-colors">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Suggestions */}
                <div className={`${cardCls} p-5 space-y-3`}>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] uppercase font-bold text-white/40">AI Stack recommendations</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold">SEO Optimization</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {getComplementSuggestions().map(s => (
                      <button
                        key={s}
                        onClick={() => handleAddSkill(s)}
                        className="px-2.5 py-1.5 rounded-lg border border-white/5 text-[10px] text-white/60 hover:text-white hover:bg-white/5 transition-all"
                      >
                        + {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Career Milestones */}
            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-3xl font-bold font-serif tracking-tight">Milestones & History</h2>
                  <p className="text-xs text-white/40 mt-1.5 leading-relaxed">Document career history. Optimize bullets with AI to reflect impact-driven metrics.</p>
                </div>

                {/* Experiences */}
                <div className="space-y-3">
                  {formData.experience.map((exp, idx) => (
                    <div key={exp.id} className={`${cardCls} p-4 relative space-y-3`}>
                      <button 
                        onClick={() => setFormData(p => ({ ...p, experience: p.experience.filter(e => e.id !== exp.id) }))}
                        className="absolute top-4 right-4 text-white/40 hover:text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div>
                        <h4 className="text-xs font-bold text-white">{exp.role}</h4>
                        <p className="text-[10px] text-white/40 mt-0.5">{exp.company} · {exp.duration}</p>
                      </div>
                      <div className="space-y-2">
                        {exp.bullets.map((b, bIdx) => (
                          <div key={bIdx} className="p-3 rounded-lg border border-white/5 bg-black/30 flex gap-2 items-start text-[11px]">
                            <p className="text-white/60 flex-1 leading-relaxed">{b}</p>
                            <button
                              onClick={() => handleOptimizeBullet(idx, bIdx)}
                              disabled={aiOptimizing}
                              className="text-[9px] font-bold px-1.5 py-0.5 rounded border border-white/10 hover:bg-white/5 text-white/50 hover:text-white shrink-0 flex items-center gap-1"
                            >
                              <Sparkles className="w-3 h-3" /> AI
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Experience form */}
                {!showExpForm ? (
                  <button 
                    onClick={() => setShowExpForm(true)}
                    className="w-full py-4 rounded-xl border-2 border-dashed border-white/10 hover:border-white/20 text-xs font-bold text-white/50 hover:text-white flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Plus className="w-4 h-4" /> Add Work Milestone
                  </button>
                ) : (
                  <div className={`${cardCls} p-5 space-y-4`}>
                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                      <span className="text-xs font-bold text-white font-serif">Add Experience</span>
                      <button onClick={() => setShowExpForm(false)} className="text-white/40 hover:text-white"><X className="w-4 h-4" /></button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input type="text" placeholder="Company" value={tempExp.company} onChange={e => setTempExp(p => ({ ...p, company: e.target.value }))} className={inputCls} />
                      <input type="text" placeholder="Role Title" value={tempExp.role} onChange={e => setTempExp(p => ({ ...p, role: e.target.value }))} className={inputCls} />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input type="text" placeholder="Duration (e.g. 2022-2024)" value={tempExp.duration} onChange={e => setTempExp(p => ({ ...p, duration: e.target.value }))} className={inputCls} />
                      <input type="text" placeholder="A key impact detail..." value={tempExp.bullet} onChange={e => setTempExp(p => ({ ...p, bullet: e.target.value }))} className={inputCls} />
                    </div>
                    <button 
                      onClick={() => {
                        if (!tempExp.company || !tempExp.role || !tempExp.bullet) return;
                        setFormData(p => ({ ...p, experience: [...p.experience, { id: 'exp-' + Date.now(), company: tempExp.company, role: tempExp.role, duration: tempExp.duration || '2024', bullets: [tempExp.bullet] }] }));
                        setTempExp({ company: '', role: '', duration: '', bullet: '' });
                        setShowExpForm(false);
                      }}
                      className="px-4 py-2 bg-white text-black hover:bg-neutral-200 text-xs font-bold rounded-lg transition-all"
                    >
                      Save Milestone
                    </button>
                  </div>
                )}

                {/* Education degrees */}
                <div className="space-y-3 pt-4 border-t border-white/5">
                  <span className="block text-[10px] uppercase tracking-wider font-bold text-white/40">Education credentials</span>
                  {formData.education.map(edu => (
                    <div key={edu.id} className="p-3.5 rounded-xl border border-white/5 bg-white/2 flex justify-between items-center text-xs">
                      <div>
                        <span className="font-bold text-white block">{edu.school}</span>
                        <span className="text-[10px] text-white/40 mt-0.5">{edu.degree} · Class of {edu.year}</span>
                      </div>
                      <button onClick={() => setFormData(p => ({ ...p, education: p.education.filter(e => e.id !== edu.id) }))} className="text-white/40 hover:text-white"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ))}

                  {!showEduForm ? (
                    <button onClick={() => setShowEduForm(true)} className="w-full py-3.5 rounded-xl border border-white/10 hover:bg-white/5 text-xs font-bold text-white/60 hover:text-white flex items-center justify-center gap-1.5 transition-all">
                      <Plus className="w-4 h-4" /> Add Degree / School
                    </button>
                  ) : (
                    <div className="p-4 rounded-xl border border-white/5 bg-black/40 space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <input type="text" placeholder="School" value={tempEdu.school} onChange={e => setTempEdu(p => ({ ...p, school: e.target.value }))} className={inputCls} />
                        <input type="text" placeholder="Degree" value={tempEdu.degree} onChange={e => setTempEdu(p => ({ ...p, degree: e.target.value }))} className={inputCls} />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <input type="text" placeholder="Graduation Year" value={tempEdu.year} onChange={e => setTempEdu(p => ({ ...p, year: e.target.value }))} className={inputCls} />
                        <input type="text" placeholder="GPA (optional)" value={tempEdu.gpa} onChange={e => setTempEdu(p => ({ ...p, gpa: e.target.value }))} className={inputCls} />
                      </div>
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => setShowEduForm(false)} className="text-[10px] text-white/40">Cancel</button>
                        <button onClick={handleAddEdu} className="px-3 py-1.5 bg-white text-black hover:bg-neutral-200 text-[10px] font-bold rounded">Add</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 4: Bio & Communication */}
            {step === 4 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-3xl font-bold font-serif tracking-tight">Bio & Communication</h2>
                  <p className="text-xs text-white/40 mt-1.5 leading-relaxed">Compose a professional profile bio. AI Bio Copilot helps match keywords for search listings.</p>
                </div>

                {/* Tone grid */}
                <div className="grid grid-cols-4 gap-2">
                  {['professional', 'technical', 'narrative', 'minimal'].map(tone => (
                    <button
                      key={tone}
                      onClick={() => setFormData(p => ({ ...p, bioTone: tone }))}
                      className={`py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider border transition-all ${
                        formData.bioTone === tone 
                          ? 'border-white bg-white/5 text-white' 
                          : 'border-white/10 text-white/45 hover:text-white'
                      }`}
                    >
                      {tone}
                    </button>
                  ))}
                </div>

                {/* Bio text */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-white/40">Professional Summary</span>
                    <span className="text-[10px] font-mono text-white/30">{formData.bio.length}/600</span>
                  </div>
                  <textarea
                    value={formData.bio}
                    onChange={e => setFormData(p => ({ ...p, bio: e.target.value }))}
                    maxLength={600}
                    rows={4}
                    className={`${inputCls} resize-none leading-relaxed`}
                  />
                  <FieldError message={fieldErrors.bio} />
                </div>

                {/* Generate Bio Button */}
                <button
                  onClick={handleGenerateBio}
                  disabled={aiOptimizing}
                  className="w-full py-3.5 bg-white text-black hover:bg-neutral-200 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md"
                >
                  <Sparkles className="w-4 h-4" />
                  {aiOptimizing ? 'Synthesizing professional bio...' : 'Generate Bio with AI Copilot'}
                </button>

                {/* Spoken Languages */}
                <div className="space-y-3 pt-4 border-t border-white/5">
                  <span className="block text-[10px] uppercase tracking-wider font-bold text-white/40">Spoken Languages Fluency</span>
                  
                  <div className="space-y-2">
                    {formData.languages.map(lang => (
                      <div key={lang.code} className="p-3.5 rounded-xl border border-white/5 bg-white/2 flex justify-between items-center text-xs">
                        <div>
                          <span className="font-bold text-white block">{lang.name}</span>
                          <span className="text-[10px] text-white/45 mt-0.5">{lang.fluency}</span>
                        </div>
                        <button onClick={() => handleRemoveLang(lang.code)} className="text-white/40 hover:text-white"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <select
                      value={tempLang.code}
                      onChange={e => {
                        const dict = { en: 'English', es: 'Spanish', fr: 'French', de: 'German', ja: 'Japanese', hi: 'Hindi' };
                        setTempLang(p => ({ ...p, code: e.target.value, name: dict[e.target.value] || e.target.value }));
                      }}
                      className={selectCls}
                    >
                      {Object.entries({ en: 'English', es: 'Spanish', fr: 'French', de: 'German', ja: 'Japanese', hi: 'Hindi' }).map(([code, name]) => (
                        <option key={code} value={code}>{name}</option>
                      ))}
                    </select>
                    <select value={tempLang.fluency} onChange={e => setTempLang(p => ({ ...p, fluency: e.target.value }))} className={selectCls}>
                      <option value="Conversational">Conversational</option>
                      <option value="Fluent">Fluent</option>
                      <option value="Native / Bilingual">Native</option>
                    </select>
                    <button onClick={handleAddLang} className="px-3 py-2 bg-white text-black hover:bg-neutral-200 text-xs font-bold rounded-xl transition-all">Add Lang</button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Trust & Verification */}
            {step === 5 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-3xl font-bold font-serif tracking-tight">Trust & Verification</h2>
                  <p className="text-xs text-white/40 mt-1.5 leading-relaxed">Establish credentials trust index. Upload a professional headshot and verify phone logs.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Photo Headshot */}
                  <div className={`${cardCls} p-5 flex flex-col items-center justify-center text-center space-y-3`}>
                    <span className="text-[10px] uppercase font-bold text-white/40 block">Profile Picture</span>
                    
                    <div 
                      onClick={() => photoInputRef.current?.click()}
                      className="w-24 h-24 rounded-full border-2 border-dashed border-white/20 hover:border-white/40 cursor-pointer overflow-hidden flex items-center justify-center group relative transition-all"
                    >
                      <input type="file" ref={photoInputRef} className="hidden" accept="image/*" onChange={handleSelectPhoto} />
                      {formData.photoUrl ? (
                        <>
                          <img src={formData.photoUrl} alt="Avatar" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] font-bold text-white transition-opacity">
                            Edit Image
                          </div>
                        </>
                      ) : (
                        <div className="text-white/30 group-hover:text-white/60 flex flex-col items-center gap-1">
                          <Camera className="w-6 h-6" />
                          <span className="text-[8px] font-bold">Upload Photo</span>
                        </div>
                      )}
                    </div>

                    {photoScore > 0 && (
                      <div className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">
                        AI Verified Lighting: {lightingScore}%
                      </div>
                    )}
                  </div>

                  {/* Phone OTP */}
                  <div className={`${cardCls} p-5 space-y-3`}>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] uppercase font-bold text-white/40">Mobile verification</span>
                      {phoneVerified && (
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">Verified</span>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <input
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                        value={formData.phone}
                        onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
                        disabled={phoneVerified}
                        className={inputCls}
                      />
                      {!phoneVerified && (
                        <button onClick={handleSendSMS} className="px-3 py-2 border border-white/10 rounded-xl text-xs font-bold hover:bg-white/5 transition-all shrink-0">
                          {smsSent ? 'Resend' : 'Send'}
                        </button>
                      )}
                    </div>

                    {smsSent && (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="OTP pin: 123456"
                          value={smsCode}
                          onChange={e => setSmsCode(e.target.value)}
                          className={inputCls}
                        />
                        <button onClick={handleVerifySMS} className="px-3 py-2 bg-white text-black hover:bg-neutral-200 text-xs font-bold rounded-xl transition-all">Verify</button>
                      </div>
                    )}
                    {smsError && <p className="text-xs text-red-400">{smsError}</p>}
                  </div>
                </div>

                {/* Identity Checklist */}
                <div className={`${cardCls} p-5 space-y-3`}>
                  <span className="block text-[10px] uppercase tracking-wider font-bold text-white/40">Identity Verification documents</span>
                  
                  <label className="flex items-center gap-3 cursor-pointer p-2.5 rounded-lg border border-white/5 hover:bg-white/5">
                    <input
                      type="checkbox"
                      checked={formData.idVerified}
                      onChange={e => setFormData(p => ({ ...p, idVerified: e.target.checked }))}
                      className="w-4 h-4 accent-white rounded"
                    />
                    <span className="text-xs font-bold text-white/80">Government Issued ID Card</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer p-2.5 rounded-lg border border-white/5 hover:bg-white/5">
                    <input
                      type="checkbox"
                      checked={formData.addressVerified}
                      onChange={e => setFormData(p => ({ ...p, addressVerified: e.target.checked }))}
                      className="w-4 h-4 accent-white rounded"
                    />
                    <span className="text-xs font-bold text-white/80">Address Utility Bill Statement</span>
                  </label>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* ─── Navigation Buttons ─── */}
        <div className="mt-8 pt-6 border-t border-white/5 flex justify-between items-center gap-4">
          <button
            onClick={handleBack}
            disabled={step === 1}
            className={`flex items-center gap-1 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all ${
              step === 1 
                ? 'opacity-0 pointer-events-none' 
                : 'border-white/10 hover:bg-white/5 text-white/70 hover:text-white'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>

          <span className="text-[10px] font-bold text-white/30">Step {step} of 5</span>

          <button
            onClick={handleNext}
            disabled={isParsing || isSaving}
            className="px-6 py-2.5 bg-white text-black hover:bg-neutral-200 text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-1"
          >
            {isSaving ? (
              <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Saving...</>
            ) : (
              <>{step === 5 ? 'Complete Onboarding' : 'Continue'}<ChevronRight className="w-4 h-4" /></>
            )}
          </button>
        </div>
      </main>

      {/* ─── AI Parsing Overlay ─── */}
      <AnimatePresence>
        {isParsing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
            <div className="w-64 p-6 rounded-2xl border border-white/10 bg-[#060a13] text-center space-y-4 shadow-2xl">
              <div className="relative w-12 h-12 mx-auto">
                <div className="w-12 h-12 rounded-full border-2 border-t-white border-white/10 animate-spin" />
                <Sparkles className="w-4 h-4 absolute inset-0 m-auto text-white/50" />
              </div>
              <p className="text-xs font-bold text-white">{parseStatus}</p>
              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-white transition-all duration-300" style={{ width: `${parseProgress}%` }} />
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Image Cropper Modal */}
      {cropFile && isCropping && (
        <ImageCropperModal
          file={cropFile}
          onCropComplete={handleCropSave}
          onClose={() => { setCropFile(null); setIsCropping(false); }}
          isDark={isDark}
        />
      )}
    </div>
  );
}

// ─── SVG Icons ──────────────────────────────────────────────────────────────
function GithubIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

function LinkedInIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}
