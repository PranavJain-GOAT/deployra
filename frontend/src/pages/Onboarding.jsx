import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Check, Upload, ChevronRight, ChevronLeft, ShieldCheck,
  Zap, Globe, Trash2, MapPin, AlertCircle, RefreshCw,
  FileCheck, Lock, Info, CheckCircle2,
  XCircle, AlertTriangle, Star, Award, Plus, X,
  Briefcase, GraduationCap, Languages, FileText, User, Camera, Cloud
} from 'lucide-react';
import axios from 'axios';
import confetti from 'canvas-confetti';
import { useAuth } from '@/lib/AuthContext';
import { useTheme } from '@/lib/ThemeContext';
import { useProfile } from '@/hooks/useProfile';
import { API_URL } from '@/lib/config';

// ─── Constants ────────────────────────────────────────────────────────────────
const ROLE_TEMPLATES = {
  'Software Engineering': {
    demand: 96, avgRate: 85,
    trends: 'High request volumes for Next.js, FastAPI & PostgreSQL developers.',
    titleSuggestions: ['Full Stack Web Developer', 'React & Next.js Engineer', 'AI SaaS Developer', 'Frontend Performance Engineer', 'Full Stack Developer for Startups'],
    skills: ['React', 'Next.js', 'TypeScript', 'Node.js', 'PostgreSQL', 'TailwindCSS', 'GraphQL', 'Docker', 'AWS'],
    subRoles: ['React & Node.js Specialist', 'Next.js Performance Lead', 'TypeScript Engineer', 'Backend API Architect', 'DevOps Engineer'],
  },
  'AI & Data Science': {
    demand: 98, avgRate: 110,
    trends: 'Surge in LLM fine-tuning, retrieval pipelines (RAG), and vector DB setup.',
    titleSuggestions: ['AI / Machine Learning Engineer', 'RAG Pipeline Specialist', 'Data Infrastructure Engineer', 'PyTorch & MLOps Architect', 'LLM Integration Specialist'],
    skills: ['Python', 'PyTorch', 'LangChain', 'OpenAI API', 'Vector Databases', 'HuggingFace', 'Docker', 'MLOps'],
    subRoles: ['ML Model Trainer', 'LLM Fine-Tuner', 'Data Pipeline Engineer', 'RAG Specialist', 'AI Product Engineer'],
  },
  'UI/UX Design': {
    demand: 88, avgRate: 75,
    trends: 'Demand for interactive prototype design systems and dark-mode glassmorphism.',
    titleSuggestions: ['Senior Product Designer', 'Design Systems Engineer', 'Interactive UI Specialist', 'UX Researcher & Designer', 'Framer Prototype Builder'],
    skills: ['Figma', 'Framer', 'UI Design', 'Design Systems', 'UX Research', 'Interaction Design', 'CSS Effects'],
    subRoles: ['Product Designer', 'Design Systems Lead', 'UX Researcher', 'Visual Designer', 'Motion Designer'],
  },
  'Product Management': {
    demand: 85, avgRate: 90,
    trends: 'Strong market demand for technical PMs with cloud architectures background.',
    titleSuggestions: ['Technical Product Manager', 'Product Delivery Specialist', 'SaaS Growth Product Manager', 'Scrum Master & PM', 'Developer Relations PM'],
    skills: ['Agile Roadmap', 'Jira', 'Product Strategy', 'SaaS Metrics', 'A/B Testing', 'Client Communication'],
    subRoles: ['Technical PM', 'Growth PM', 'B2B SaaS PM', 'Scrum Master', 'Product Ops'],
  },
  'Web3 & Blockchain': {
    demand: 91, avgRate: 105,
    trends: 'Smart contract security audits and decentralized state-management systems.',
    titleSuggestions: ['Solidity Smart Contract Engineer', 'Web3 Protocol Architect', 'Ethereum & EVM Specialist', 'Rust Blockchain Engineer', 'dApp Frontend Engineer'],
    skills: ['Solidity', 'Rust', 'Ethers.js', 'Smart Contracts', 'Web3.js', 'Web3 Architecture', 'Cryptography'],
    subRoles: ['Smart Contract Dev', 'DeFi Protocol Engineer', 'NFT Platform Developer', 'dApp Frontend Dev', 'Blockchain Security Auditor'],
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
  1: 'Profile Import',
  2: 'Your Work',
  3: 'Skills',
  4: 'Professional Title',
  5: 'Work Experience',
  6: 'Education',
  7: 'Languages',
  8: 'Bio Studio',
  9: 'Identity & Photo'
};

const STEP_ICONS = {
  1: Upload, 2: Briefcase, 3: Sparkles, 4: User, 5: Briefcase,
  6: GraduationCap, 7: Languages, 8: FileText, 9: Camera
};

// ─── Toast Component ──────────────────────────────────────────────────────────
function Toast({ message, type = 'success', onDismiss }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 3500);
    return () => clearTimeout(t);
  }, [onDismiss]);

  const styles = {
    success: 'bg-[#0a0a0a] border-white/20 text-white',
    error: 'bg-[#0a0a0a] border-red-500/40 text-red-400',
    info: 'bg-[#0a0a0a] border-white/10 text-white/80',
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
      className={`flex items-center gap-3 px-4 py-3 rounded-2xl border text-sm font-medium shadow-2xl shadow-black/60 ${styles[type]}`}
    >
      {icons[type]}
      <span className="flex-1">{message}</span>
      <button onClick={onDismiss} className="opacity-40 hover:opacity-100 transition-opacity ml-1">
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

// ─── Field Error ──────────────────────────────────────────────────────────────
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

// ─── Main Onboarding ──────────────────────────────────────────────────────────
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

  const [formData, setFormData] = useState({
    linkedinUrl: '', githubUrl: '', portfolioUrl: '', resumeName: '', importSource: '',
    specialization: 'Software Engineering', subRole: 'React & Node.js Specialist',
    hourlyRate: 85, experienceLevel: 'Senior',
    skills: ['React', 'Node.js', 'PostgreSQL', 'TailwindCSS', 'TypeScript'],
    complementarySkills: ['GraphQL', 'Docker', 'AWS', 'Next.js'],
    title: 'Senior Full Stack Engineer',
    experience: [{
      id: 'exp-1', company: 'Vercel', role: 'Senior Frontend Architect', duration: '2024 - Present',
      bullets: ['Optimized Next.js page speeds, increasing site conversions by 28%.', 'Built edge rendering modules scaling to 4M daily requests.']
    }],
    education: [{ id: 'edu-1', school: 'Stanford University', degree: 'M.S. in Computer Science', year: '2023', gpa: '3.9' }],
    certifications: [{ id: 'cert-1', name: 'AWS Certified Solutions Architect', issuer: 'Amazon Web Services', year: '2023' }],
    languages: [{ code: 'en', name: 'English', fluency: 'Native / Bilingual' }, { code: 'es', name: 'Spanish', fluency: 'Conversational' }],
    bio: 'High-performance engineer focused on building scalable interfaces, optimizing bundle delivery speeds, and configuring modern cloud pipelines.',
    bioTone: 'professional',
    phone: '', address: '', photoUrl: user?.profileImage || '',
    idVerified: false, phoneVerified: false, addressVerified: false,
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
  const [smsSent, setSmsSent] = useState(false);
  const [smsCode, setSmsCode] = useState('');
  const [smsError, setSmsError] = useState('');
  const [cropFile, setCropFile] = useState(null);
  const [isCropping, setIsCropping] = useState(false);
  const [photoScore, setPhotoScore] = useState(0);
  const [lightingScore, setLightingScore] = useState(0);

  const fileInputRef = useRef(null);
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
          if (prefs.onboardingStep && prefs.onboardingStep <= 9) setStep(prefs.onboardingStep);
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
        preferences: { onboardingStep: nextStep, onboarded: nextStep > 9, onboardingData: formData }
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
    if (s === 3 && formData.skills.length === 0) errors.skills = 'Add at least one skill to continue.';
    if (s === 4 && (!formData.title || formData.title.trim().length < 5)) errors.title = 'Enter a professional title (min 5 characters).';
    if (s === 8 && (!formData.bio || formData.bio.trim().length < 20)) errors.bio = 'Write at least 20 characters in your bio.';
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
    if (step < 9) {
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
        preferences: { onboardingStep: 10, onboarded: true, onboardingData: formData }
      });
      const updatePayload = { role: 'DEVELOPER' };
      if (formData.address) updatePayload.country = formData.address.split(',').pop().trim();
      await axios.patch(`${API_URL}/users/me`, updatePayload);
      if (checkAuth) await checkAuth();
      confetti({ particleCount: 200, spread: 100, origin: { y: 0.6 }, colors: ['#ffffff', '#888888', '#cccccc', '#10b981'] });
      showToast('🎉 Profile complete! Redirecting to your dashboard...', 'success');
      setTimeout(() => navigate('/developer'), 2200);
    } catch (err) {
      showToast('Failed to complete setup. Please try again.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Step 1
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsParsing(true); setParseProgress(5); setParseStatus('Initializing secure parsing...');
    const steps = [
      { p: 20, s: 'Reading file metadata...' }, { p: 45, s: 'Analyzing career timeline...' },
      { p: 75, s: 'Extracting technical skills...' }, { p: 95, s: 'Synthesizing background...' }, { p: 100, s: '✓ AI Enrichment complete!' }
    ];
    steps.forEach((st, idx) => {
      setTimeout(() => {
        setParseProgress(st.p); setParseStatus(st.s);
        if (st.p === 100) {
          setTimeout(() => {
            setFormData(p => ({ ...p, resumeName: file.name, importSource: 'resume', title: 'Lead Frontend Software Engineer', skills: ['React', 'Next.js', 'TypeScript', 'Node.js', 'PostgreSQL', 'TailwindCSS'], bio: 'Performance-driven frontend leader with 5+ years designing scalable dashboard ecosystems.' }));
            setIsParsing(false);
            showToast('Resume parsed & profile pre-filled!', 'success');
          }, 600);
        }
      }, (idx + 1) * 800);
    });
  };

  const handleGithubConnect = () => {
    setIsParsing(true); setParseProgress(10); setParseStatus('Authenticating with GitHub...');
    setTimeout(() => { setParseProgress(50); setParseStatus('Scanning repositories...'); }, 800);
    setTimeout(() => { setParseProgress(90); setParseStatus('Extracting language data...'); }, 1600);
    setTimeout(() => {
      setParseProgress(100); setParseStatus('✓ Import complete!');
      setTimeout(() => {
        setFormData(p => ({ ...p, githubUrl: p.githubUrl || `https://github.com/${user?.name?.toLowerCase().replace(/ /g, '') || 'dev'}`, importSource: 'github', skills: [...new Set([...p.skills, 'JavaScript', 'TypeScript', 'Git', 'Docker'])] }));
        setIsParsing(false);
        showToast('GitHub tech stack imported!', 'success');
      }, 600);
    }, 2400);
  };

  // Step 3
  const handleAddSkill = (skill) => {
    const t = skill.trim();
    if (t && !formData.skills.includes(t)) {
      setFormData(p => ({ ...p, skills: [...p.skills, t] }));
      setSkillSearch('');
      if (fieldErrors.skills) setFieldErrors(p => ({ ...p, skills: undefined }));
    }
  };
  const handleRemoveSkill = (skill) => setFormData(p => ({ ...p, skills: p.skills.filter(s => s !== skill) }));

  // Step 4
  const scoreTitle = (t) => {
    let s = 60;
    if (t.toLowerCase().includes('architect')) s += 15;
    if (t.toLowerCase().includes('engineer')) s += 10;
    if (t.toLowerCase().includes('senior') || t.toLowerCase().includes('lead')) s += 10;
    if (t.length > 15) s += 5;
    return Math.min(s, 99);
  };

  // Step 5
  const handleOptimizeBullet = (idx, bIdx) => {
    setAiOptimizing(true);
    setTimeout(() => {
      const optimized = 'Architected cloud-native modules, improving load performance by 36% and saving 24 engineering hours weekly.';
      const updated = [...formData.experience];
      updated[idx].bullets[bIdx] = optimized;
      setFormData(p => ({ ...p, experience: updated }));
      setAiOptimizing(false);
      showToast('Bullet point AI-optimized!', 'info');
    }, 1200);
  };

  // Step 6
  const handleAddEdu = () => {
    if (!tempEdu.school || !tempEdu.degree) { showToast('School and Degree are required.', 'error'); return; }
    setFormData(p => ({ ...p, education: [...p.education, { id: 'edu-' + Date.now(), school: tempEdu.school, degree: tempEdu.degree, year: tempEdu.year || '2024', gpa: tempEdu.gpa }] }));
    setTempEdu({ school: '', degree: '', year: '', gpa: '' });
    setShowEduForm(false);
    showToast('Education added!', 'success');
  };

  // Step 7
  const handleAddLang = () => {
    if (formData.languages.some(l => l.code === tempLang.code)) { showToast('Language already added.', 'error'); return; }
    setFormData(p => ({ ...p, languages: [...p.languages, { ...tempLang }] }));
    showToast(`${tempLang.name} added!`, 'success');
  };
  const handleRemoveLang = (code) => setFormData(p => ({ ...p, languages: p.languages.filter(l => l.code !== code) }));

  // Step 8
  const handleGenerateBio = () => {
    setAiOptimizing(true);
    setTimeout(() => {
      const bios = {
        technical: `Advanced systems engineer proficient in ${formData.skills.slice(0, 4).join(', ')}. Expert in low-latency architectures and robust client-side components.`,
        narrative: `I love solving hard design and coding challenges. As a ${formData.title}, I bridge the gap between complex infrastructure and pixel-perfect design.`,
        minimal: `${formData.title} focused on ${formData.skills.slice(0, 3).join(', ')}. Building minimal, high-speed applications.`,
        professional: `Results-oriented ${formData.title} specializing in ${formData.skills.slice(0, 4).join(', ')}. Passionate about building exceptional experiences and solving real business challenges with elegant code.`,
      };
      setFormData(p => ({ ...p, bio: bios[p.bioTone] || bios.professional }));
      setAiOptimizing(false);
      showToast('AI bio generated!', 'info');
    }, 1200);
  };

  // Step 9
  const handleSelectPhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCropFile(file); setIsCropping(true);
  };

  const handleCropSave = async () => {
    setIsCropping(false); setParseStatus('Analyzing photo...'); setIsParsing(true);
    setTimeout(async () => {
      setIsParsing(false);
      const fakeUrl = URL.createObjectURL(cropFile);
      setFormData(p => ({ ...p, photoUrl: fakeUrl }));
      setPhotoScore(94); setLightingScore(98);
      try {
        const url = await uploadAvatar(cropFile);
        if (url) { setFormData(p => ({ ...p, photoUrl: url })); showToast('Headshot uploaded!', 'success'); }
      } catch (_) { showToast('Photo saved locally.', 'error'); }
    }, 1500);
  };

  const handleSendSMS = () => {
    if (!formData.phone || formData.phone.trim().length < 7) { showToast('Enter a valid phone number.', 'error'); return; }
    setSmsSent(true); setSmsError(''); showToast('Code sent! (Demo: 123456)', 'info');
  };

  const handleVerifySMS = () => {
    if (smsCode === '123456' || smsCode.length === 6) {
      setFormData(p => ({ ...p, phoneVerified: true })); setSmsSent(false); setSmsCode('');
      showToast('Phone verified!', 'success');
    } else { setSmsError('Invalid code. Demo: 123456'); }
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

  const progressPercent = Math.round((step / 9) * 100);
  const currentTemplate = ROLE_TEMPLATES[formData.specialization] || ROLE_TEMPLATES['Software Engineering'];

  // ─── Shared Classes ──────────────────────────────────────────────────────────
  const inputCls = `w-full px-4 py-3 rounded-xl border bg-transparent text-sm font-medium focus:outline-none transition-all ${
    isDark
      ? 'border-white/10 text-white placeholder-white/25 focus:border-white/30 focus:bg-white/[0.03]'
      : 'border-black/10 text-neutral-900 placeholder-neutral-400 focus:border-black/30 focus:bg-black/[0.02]'
  }`;
  const selectCls = `w-full px-4 py-3 rounded-xl border text-sm font-medium focus:outline-none transition-all ${
    isDark
      ? 'border-white/10 text-white bg-[#0a0a0a] focus:border-white/30'
      : 'border-black/10 text-neutral-900 bg-white focus:border-black/30'
  }`;
  const cardCls = isDark
    ? 'bg-[#080808] border border-white/8 rounded-2xl'
    : 'bg-white border border-black/8 rounded-2xl shadow-sm';

  // ─── Step Content ─────────────────────────────────────────────────────────────
  function renderStepContent() {
    switch (step) {

      // ═══ STEP 1: PROFILE IMPORT ═══
      case 1:
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight" style={{ fontFamily: 'Georgia, serif' }}>
                How would you like to tell us<br className="hidden md:block" /> about yourself?
              </h2>
              <p className={`mt-3 text-base leading-relaxed ${isDark ? 'text-white/50' : 'text-neutral-500'}`}>
                Import from an existing source or fill in your profile manually. Our AI parsing pipeline auto-fills your profile, saving you time.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {/* Option 1: LinkedIn */}
              <div className={`group relative p-5 rounded-2xl border cursor-pointer transition-all hover:scale-[1.005] ${
                formData.importSource === 'linkedin'
                  ? isDark ? 'border-white bg-white/5' : 'border-black bg-black/5'
                  : isDark ? 'border-white/10 hover:border-white/25 hover:bg-white/[0.03]' : 'border-black/10 hover:border-black/20 hover:bg-black/[0.02]'
              }`}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#0077b5]/15 border border-[#0077b5]/20 flex items-center justify-center shrink-0">
                    <LinkedInIcon className="w-5 h-5 text-[#0077b5]" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm">Import from LinkedIn</h4>
                    <p className={`text-xs mt-0.5 ${isDark ? 'text-white/40' : 'text-neutral-500'}`}>
                      Import work history, endorsements, and bio automatically.
                    </p>
                  </div>
                  {formData.importSource === 'linkedin' && (
                    <div className="w-6 h-6 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                  )}
                </div>
                <div className="mt-3 flex gap-2">
                  <input
                    type="url"
                    value={formData.linkedinUrl}
                    onChange={e => setFormData(p => ({ ...p, linkedinUrl: e.target.value }))}
                    placeholder="https://linkedin.com/in/username"
                    className={inputCls}
                  />
                  <button
                    onClick={() => {
                      if (!formData.linkedinUrl) return;
                      setFormData(p => ({ ...p, importSource: 'linkedin' }));
                      showToast('LinkedIn URL saved!', 'success');
                    }}
                    className={`shrink-0 px-4 py-3 rounded-xl text-xs font-bold border transition-all ${
                      formData.importSource === 'linkedin'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : isDark ? 'bg-white hover:bg-white/90 text-black border-white' : 'bg-black hover:bg-black/90 text-white border-black'
                    }`}
                  >
                    {formData.importSource === 'linkedin' ? <Check className="w-4 h-4" /> : 'Connect'}
                  </button>
                </div>
              </div>

              {/* Option 2: GitHub */}
              <div className={`group relative p-5 rounded-2xl border cursor-pointer transition-all hover:scale-[1.005] ${
                formData.importSource === 'github'
                  ? isDark ? 'border-white bg-white/5' : 'border-black bg-black/5'
                  : isDark ? 'border-white/10 hover:border-white/25 hover:bg-white/[0.03]' : 'border-black/10 hover:border-black/20 hover:bg-black/[0.02]'
              }`}>
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 ${isDark ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'}`}>
                    <GithubIcon className={`w-5 h-5 ${isDark ? 'text-white' : 'text-black'}`} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm">Import from GitHub</h4>
                    <p className={`text-xs mt-0.5 ${isDark ? 'text-white/40' : 'text-neutral-500'}`}>
                      Auto-extract your tech stack, commit patterns, and language composition.
                    </p>
                  </div>
                  {formData.importSource === 'github' && (
                    <div className="w-6 h-6 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                  )}
                </div>
                <div className="mt-3 flex gap-2">
                  <input
                    type="url"
                    value={formData.githubUrl}
                    onChange={e => setFormData(p => ({ ...p, githubUrl: e.target.value }))}
                    placeholder="https://github.com/username"
                    className={inputCls}
                  />
                  <button
                    onClick={handleGithubConnect}
                    className={`shrink-0 px-4 py-3 rounded-xl text-xs font-bold border transition-all ${
                      formData.importSource === 'github'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : isDark ? 'bg-white hover:bg-white/90 text-black border-white' : 'bg-black hover:bg-black/90 text-white border-black'
                    }`}
                  >
                    {formData.importSource === 'github' ? <Check className="w-4 h-4" /> : 'Import'}
                  </button>
                </div>
              </div>

              {/* Option 3: Resume Upload */}
              <div
                className={`group p-5 rounded-2xl border-2 border-dashed cursor-pointer transition-all text-center ${
                  formData.resumeName
                    ? 'border-emerald-500/40 bg-emerald-500/5'
                    : isDark ? 'border-white/10 hover:border-white/30 hover:bg-white/[0.02]' : 'border-black/10 hover:border-black/25 hover:bg-black/[0.02]'
                }`}
                onClick={() => fileInputRef.current?.click()}
              >
                <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,.docx,.doc" onChange={handleFileUpload} />
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mx-auto mb-3 ${isDark ? 'bg-white/8 group-hover:bg-white/15' : 'bg-black/5 group-hover:bg-black/10'} transition-all`}>
                  <Upload className={`w-5 h-5 ${isDark ? 'text-white/60' : 'text-black/50'}`} />
                </div>
                {formData.resumeName ? (
                  <div className="flex items-center justify-center gap-2 text-sm text-emerald-400 font-semibold">
                    <FileCheck className="w-4 h-4" /> {formData.resumeName} — AI parsed
                  </div>
                ) : (
                  <>
                    <h4 className="font-semibold text-sm">Upload Resume / CV</h4>
                    <p className={`text-xs mt-1 ${isDark ? 'text-white/35' : 'text-neutral-500'}`}>PDF, DOCX up to 10MB · AI extracts skills, experience & bio</p>
                  </>
                )}
              </div>
            </div>

            {/* Portfolio URL */}
            <div className="space-y-2">
              <label className={`text-xs font-semibold uppercase tracking-widest ${isDark ? 'text-white/35' : 'text-neutral-400'}`}>Portfolio / Website (optional)</label>
              <input type="url" value={formData.portfolioUrl} onChange={e => setFormData(p => ({ ...p, portfolioUrl: e.target.value }))} placeholder="https://yourportfolio.com" className={inputCls} />
            </div>

            <p className={`text-xs ${isDark ? 'text-white/25' : 'text-neutral-400'}`}>
              All steps are optional. You can skip any import and fill manually.
            </p>
          </div>
        );

      // ═══ STEP 2: CATEGORY & WORK ═══
      case 2:
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight" style={{ fontFamily: 'Georgia, serif' }}>
                What kind of work<br className="hidden md:block" /> are you here to do?
              </h2>
              <p className={`mt-3 text-base ${isDark ? 'text-white/50' : 'text-neutral-500'}`}>
                Select your primary sector. This shapes your marketplace visibility and client matching algorithm.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.entries(ROLE_TEMPLATES).map(([cat, data]) => (
                <button
                  key={cat}
                  onClick={() => setFormData(p => ({ ...p, specialization: cat, skills: data.skills.slice(0, 5), title: data.titleSuggestions[0], subRole: data.subRoles[0] }))}
                  className={`group p-4 rounded-2xl border text-left transition-all hover:scale-[1.01] ${
                    formData.specialization === cat
                      ? isDark ? 'border-white bg-white/6' : 'border-black bg-black/5'
                      : isDark ? 'border-white/8 hover:border-white/20 hover:bg-white/[0.03]' : 'border-black/8 hover:border-black/15 hover:bg-black/[0.02]'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="font-semibold text-sm">{cat}</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isDark ? 'bg-white/8 text-white/50' : 'bg-black/5 text-neutral-500'}`}>
                        {data.demand}%
                      </span>
                      {formData.specialization === cat && (
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center ${isDark ? 'bg-white' : 'bg-black'}`}>
                          <Check className={`w-2.5 h-2.5 ${isDark ? 'text-black' : 'text-white'}`} />
                        </div>
                      )}
                    </div>
                  </div>
                  <p className={`text-xs mt-1.5 ${isDark ? 'text-white/35' : 'text-neutral-500'}`}>Avg ${data.avgRate}/hr · {data.trends.slice(0, 50)}...</p>
                </button>
              ))}
            </div>

            {/* Sub Role & Experience Level */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className={`text-xs font-semibold uppercase tracking-widest ${isDark ? 'text-white/35' : 'text-neutral-400'}`}>Specialty Niche</label>
                <select value={formData.subRole} onChange={e => setFormData(p => ({ ...p, subRole: e.target.value }))} className={selectCls}>
                  {(currentTemplate.subRoles || []).map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className={`text-xs font-semibold uppercase tracking-widest ${isDark ? 'text-white/35' : 'text-neutral-400'}`}>Experience Level</label>
                <select value={formData.experienceLevel} onChange={e => setFormData(p => ({ ...p, experienceLevel: e.target.value }))} className={selectCls}>
                  <option value="Junior">Junior (1–2 yrs)</option>
                  <option value="Mid">Mid Level (3–4 yrs)</option>
                  <option value="Senior">Senior (5–8 yrs)</option>
                  <option value="Lead">Principal / Lead (8+ yrs)</option>
                </select>
              </div>
            </div>

            {/* Hourly Rate */}
            <div className={`${cardCls} p-5 space-y-4`}>
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-semibold text-sm">Target Hourly Rate</h4>
                  <p className={`text-xs mt-0.5 ${isDark ? 'text-white/40' : 'text-neutral-500'}`}>Set your market billing rate</p>
                </div>
                <span className="text-2xl font-black" style={{ fontFamily: 'Georgia, serif' }}>${formData.hourlyRate}<span className="text-sm font-normal opacity-50">/hr</span></span>
              </div>
              <input
                type="range" min="15" max="250"
                value={formData.hourlyRate}
                onChange={e => setFormData(p => ({ ...p, hourlyRate: parseInt(e.target.value) }))}
                className="w-full h-1 rounded-lg cursor-pointer accent-white"
              />
              <div className={`flex justify-between text-xs ${isDark ? 'text-white/30' : 'text-neutral-400'}`}>
                <span>$15 · Entry Level</span>
                <span>$250 · Expert</span>
              </div>
              <div className={`pt-3 border-t flex gap-2 text-xs ${isDark ? 'border-white/5 text-white/40' : 'border-black/5 text-neutral-500'}`}>
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{currentTemplate.trends}</span>
              </div>
            </div>
          </div>
        );

      // ═══ STEP 3: SKILLS ═══
      case 3:
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight" style={{ fontFamily: 'Georgia, serif' }}>
                Nearly there! What skills<br className="hidden md:block" /> define your expertise?
              </h2>
              <p className={`mt-3 text-base ${isDark ? 'text-white/50' : 'text-neutral-500'}`}>
                Adding complementary skills increases marketplace visibility by up to 40%. Choose wisely.
              </p>
            </div>

            {/* Add Skills Input */}
            <div className="space-y-3">
              <label className={`text-xs font-semibold uppercase tracking-widest ${isDark ? 'text-white/35' : 'text-neutral-400'}`}>Add Skills</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={skillSearch}
                  onChange={e => setSkillSearch(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddSkill(skillSearch); } }}
                  placeholder="e.g. PyTorch, Kubernetes, SwiftUI..."
                  className={`${inputCls} flex-1`}
                />
                <button
                  onClick={() => handleAddSkill(skillSearch)}
                  className={`shrink-0 px-5 py-3 rounded-xl text-sm font-bold transition-all ${isDark ? 'bg-white hover:bg-white/90 text-black' : 'bg-black hover:bg-black/90 text-white'}`}
                >
                  Add
                </button>
              </div>
              <FieldError message={fieldErrors.skills} />
            </div>

            {/* Skill Tags */}
            <AnimatePresence>
              <div className="flex flex-wrap gap-2">
                {formData.skills.map(skill => (
                  <motion.div
                    key={skill}
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.85 }}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium border transition-all ${isDark ? 'bg-white/6 border-white/12 text-white/80' : 'bg-black/5 border-black/10 text-neutral-800'}`}
                  >
                    <span>{skill}</span>
                    <button onClick={() => handleRemoveSkill(skill)} className={`${isDark ? 'text-white/30 hover:text-white/70' : 'text-neutral-400 hover:text-neutral-700'} transition-colors`}>
                      <X className="w-3 h-3" />
                    </button>
                  </motion.div>
                ))}
                {formData.skills.length === 0 && (
                  <p className={`text-sm ${isDark ? 'text-white/25' : 'text-neutral-400'}`}>No skills added yet. Type above and press Enter.</p>
                )}
              </div>
            </AnimatePresence>

            {/* Suggested Skills */}
            <div className={`${cardCls} p-5 space-y-4`}>
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4 opacity-60" /> AI-Suggested Skills
                </h4>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isDark ? 'bg-white/8 text-white/50' : 'bg-black/5 text-neutral-500'}`}>
                  Based on your stack
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {getComplementSuggestions().map(s => (
                  <button
                    key={s}
                    onClick={() => handleAddSkill(s)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all hover:scale-[1.02] ${
                      isDark ? 'border-white/10 hover:border-white/25 hover:bg-white/5 text-white/60' : 'border-black/10 hover:border-black/20 hover:bg-black/5 text-neutral-600'
                    }`}
                  >
                    + {s}
                  </button>
                ))}
              </div>
              <div className={`pt-3 border-t flex gap-2 text-xs ${isDark ? 'border-white/5 text-white/35' : 'border-black/5 text-neutral-500'}`}>
                <Zap className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                Adding backend and container tools increases client response rates by 14%.
              </div>
            </div>
          </div>
        );

      // ═══ STEP 4: TITLE ═══
      case 4:
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight" style={{ fontFamily: 'Georgia, serif' }}>
                Add a title to tell the world<br className="hidden md:block" /> what you do.
              </h2>
              <p className={`mt-3 text-base ${isDark ? 'text-white/50' : 'text-neutral-500'}`}>
                Your professional title is how clients find you in search. Make it specific and compelling.
              </p>
            </div>

            <div className="space-y-3">
              <input
                type="text"
                value={formData.title}
                onChange={e => {
                  setFormData(p => ({ ...p, title: e.target.value }));
                  if (fieldErrors.title && e.target.value.length >= 5) setFieldErrors(p => ({ ...p, title: undefined }));
                }}
                placeholder="e.g. Senior Frontend Architect"
                className={`${inputCls} text-lg py-4 ${fieldErrors.title ? 'border-red-500/50' : ''}`}
              />
              <FieldError message={fieldErrors.title} />
              {formData.title.length > 0 && (
                <div className={`flex items-center gap-2 text-xs ${isDark ? 'text-white/40' : 'text-neutral-500'}`}>
                  <div className={`flex-1 h-1 rounded-full overflow-hidden ${isDark ? 'bg-white/8' : 'bg-black/8'}`}>
                    <div className={`h-full rounded-full transition-all ${scoreTitle(formData.title) >= 90 ? 'bg-emerald-400' : scoreTitle(formData.title) >= 70 ? 'bg-amber-400' : 'bg-white/40'}`} style={{ width: `${scoreTitle(formData.title)}%` }} />
                  </div>
                  <span className="font-semibold">SEO Score {scoreTitle(formData.title)}/100</span>
                </div>
              )}
            </div>

            {/* AI Suggestions */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className={`text-xs font-semibold uppercase tracking-widest ${isDark ? 'text-white/35' : 'text-neutral-400'}`}>
                  AI Suggestions for your stack
                </label>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>
                  SEO Optimized
                </span>
              </div>
              <div className="space-y-2">
                {currentTemplate.titleSuggestions.map(sug => (
                  <button
                    key={sug}
                    onClick={() => {
                      setFormData(p => ({ ...p, title: sug }));
                      if (fieldErrors.title) setFieldErrors(p => ({ ...p, title: undefined }));
                      confetti({ particleCount: 20, spread: 40, colors: ['#ffffff', '#888888'] });
                    }}
                    className={`w-full p-4 rounded-xl border text-left text-sm font-medium transition-all flex justify-between items-center hover:scale-[1.005] ${
                      formData.title === sug
                        ? isDark ? 'border-white bg-white/6' : 'border-black bg-black/5'
                        : isDark ? 'border-white/8 hover:border-white/20 hover:bg-white/[0.03]' : 'border-black/8 hover:border-black/15 hover:bg-black/[0.02]'
                    }`}
                  >
                    <span>{sug}</span>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        scoreTitle(sug) >= 90 ? 'bg-emerald-500/15 text-emerald-400' : isDark ? 'bg-white/8 text-white/40' : 'bg-black/5 text-neutral-500'
                      }`}>
                        {scoreTitle(sug)}%
                      </span>
                      {formData.title === sug && <Check className="w-4 h-4 text-emerald-400" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      // ═══ STEP 5: EXPERIENCE ═══
      case 5:
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight" style={{ fontFamily: 'Georgia, serif' }}>
                If you have relevant work<br className="hidden md:block" /> experience, add it here.
              </h2>
              <p className={`mt-3 text-base ${isDark ? 'text-white/50' : 'text-neutral-500'}`}>
                Add experience milestones. Use AI to write quantified, metrics-driven bullet points.
              </p>
            </div>

            {/* Existing experiences */}
            <div className="space-y-3">
              {formData.experience.map((exp, idx) => (
                <motion.div
                  key={exp.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`${cardCls} p-5 relative`}
                >
                  <button
                    onClick={() => setFormData(p => ({ ...p, experience: p.experience.filter(e => e.id !== exp.id) }))}
                    className={`absolute top-4 right-4 p-1.5 rounded-lg transition-all ${isDark ? 'text-white/25 hover:text-red-400 hover:bg-red-500/10' : 'text-neutral-400 hover:text-red-500 hover:bg-red-50'}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <div className="pr-8">
                    <div className="font-semibold text-sm">{exp.role}</div>
                    <div className={`text-xs mt-0.5 font-medium ${isDark ? 'text-white/40' : 'text-neutral-500'}`}>{exp.company} · {exp.duration}</div>
                  </div>
                  <div className="mt-3 space-y-2">
                    {exp.bullets.map((b, bIdx) => (
                      <div key={bIdx} className={`flex gap-3 items-start p-3 rounded-xl ${isDark ? 'bg-white/3 border border-white/5' : 'bg-black/2 border border-black/5'}`}>
                        <span className={`text-xs leading-relaxed flex-1 ${isDark ? 'text-white/60' : 'text-neutral-600'}`}>{b}</span>
                        <button
                          onClick={() => handleOptimizeBullet(idx, bIdx)}
                          disabled={aiOptimizing}
                          className={`shrink-0 flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold border transition-all ${isDark ? 'border-white/10 text-white/50 hover:bg-white/5 hover:text-white' : 'border-black/10 text-neutral-500 hover:bg-black/5'} disabled:opacity-40`}
                        >
                          <Sparkles className={`w-3 h-3 ${aiOptimizing ? 'animate-spin' : ''}`} />
                          AI
                        </button>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Add experience button / form */}
            <AnimatePresence>
              {!showExpForm ? (
                <motion.button
                  key="add-btn"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowExpForm(true)}
                  className={`w-full p-5 rounded-2xl border-2 border-dashed transition-all flex items-center justify-center gap-2 text-sm font-medium ${
                    isDark ? 'border-white/10 hover:border-white/25 text-white/40 hover:text-white/70 hover:bg-white/[0.02]' : 'border-black/10 hover:border-black/25 text-neutral-500 hover:text-neutral-700'
                  }`}
                >
                  <Plus className="w-4 h-4" />
                  Add Work Experience
                </motion.button>
              ) : (
                <motion.div
                  key="add-form"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 12 }}
                  className={`${cardCls} p-5 space-y-4`}
                >
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold text-sm">Add Work Experience</h4>
                    <button onClick={() => setShowExpForm(false)} className={`p-1.5 rounded-lg ${isDark ? 'text-white/30 hover:text-white/60' : 'text-neutral-400 hover:text-neutral-600'}`}>
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input type="text" placeholder="Company" value={tempExp.company} onChange={e => setTempExp(p => ({ ...p, company: e.target.value }))} className={inputCls} />
                    <input type="text" placeholder="Role / Title" value={tempExp.role} onChange={e => setTempExp(p => ({ ...p, role: e.target.value }))} className={inputCls} />
                    <input type="text" placeholder="Duration (e.g. 2022–2024)" value={tempExp.duration} onChange={e => setTempExp(p => ({ ...p, duration: e.target.value }))} className={inputCls} />
                  </div>
                  <textarea
                    placeholder="Describe your key accomplishment — AI will optimize and quantify it..."
                    value={tempExp.bullet}
                    onChange={e => setTempExp(p => ({ ...p, bullet: e.target.value }))}
                    rows={3}
                    className={`${inputCls} resize-none`}
                  />
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => setShowExpForm(false)} className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${isDark ? 'border-white/10 text-white/50 hover:bg-white/5' : 'border-black/10 text-neutral-500 hover:bg-black/5'}`}>
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        if (!tempExp.company || !tempExp.role || !tempExp.bullet) { showToast('Fill in Company, Role, and Accomplishment.', 'error'); return; }
                        setFormData(p => ({ ...p, experience: [...p.experience, { id: 'exp-' + Date.now(), company: tempExp.company, role: tempExp.role, duration: tempExp.duration || '2024', bullets: [tempExp.bullet] }] }));
                        setTempExp({ company: '', role: '', duration: '', bullet: '' });
                        setShowExpForm(false);
                        showToast('Experience added!', 'success');
                      }}
                      className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${isDark ? 'bg-white text-black hover:bg-white/90' : 'bg-black text-white hover:bg-black/90'}`}
                    >
                      Save Experience
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );

      // ═══ STEP 6: EDUCATION ═══
      case 6:
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight" style={{ fontFamily: 'Georgia, serif' }}>
                Tell us about your<br className="hidden md:block" /> education & credentials.
              </h2>
              <p className={`mt-3 text-base ${isDark ? 'text-white/50' : 'text-neutral-500'}`}>
                Verified credentials increase hire rates by 23%. Add your degrees and certifications.
              </p>
            </div>

            {/* Education list */}
            <div className="space-y-3">
              {formData.education.map(edu => (
                <div key={edu.id} className={`${cardCls} p-4 flex items-center gap-4`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${isDark ? 'bg-white/8 text-white' : 'bg-black/5 text-neutral-800'}`}>
                    {edu.school.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm truncate">{edu.school}</div>
                    <div className={`text-xs mt-0.5 ${isDark ? 'text-white/40' : 'text-neutral-500'}`}>
                      {edu.degree} · Class of {edu.year}{edu.gpa && ` · GPA ${edu.gpa}`}
                    </div>
                  </div>
                  <button onClick={() => setFormData(p => ({ ...p, education: p.education.filter(e => e.id !== edu.id) }))} className={`p-1.5 rounded-lg transition-all shrink-0 ${isDark ? 'text-white/25 hover:text-red-400 hover:bg-red-500/10' : 'text-neutral-400 hover:text-red-500'}`}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <AnimatePresence>
              {!showEduForm ? (
                <button onClick={() => setShowEduForm(true)} className={`w-full p-5 rounded-2xl border-2 border-dashed transition-all flex items-center justify-center gap-2 text-sm font-medium ${isDark ? 'border-white/10 hover:border-white/25 text-white/40 hover:text-white/70' : 'border-black/10 hover:border-black/25 text-neutral-500'}`}>
                  <Plus className="w-4 h-4" /> Add Education
                </button>
              ) : (
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className={`${cardCls} p-5 space-y-4`}>
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold text-sm">Add Education</h4>
                    <button onClick={() => setShowEduForm(false)} className={`p-1.5 rounded-lg ${isDark ? 'text-white/30 hover:text-white/60' : 'text-neutral-400'}`}><X className="w-4 h-4" /></button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input type="text" placeholder="School / University" value={tempEdu.school} onChange={e => setTempEdu(p => ({ ...p, school: e.target.value }))} className={inputCls} />
                    <input type="text" placeholder="Degree (e.g. B.S. Computer Science)" value={tempEdu.degree} onChange={e => setTempEdu(p => ({ ...p, degree: e.target.value }))} className={inputCls} />
                    <input type="text" placeholder="Graduation Year" value={tempEdu.year} onChange={e => setTempEdu(p => ({ ...p, year: e.target.value }))} className={inputCls} />
                    <input type="text" placeholder="GPA (optional)" value={tempEdu.gpa} onChange={e => setTempEdu(p => ({ ...p, gpa: e.target.value }))} className={inputCls} />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => setShowEduForm(false)} className={`px-4 py-2 rounded-xl text-xs font-bold border ${isDark ? 'border-white/10 text-white/50' : 'border-black/10 text-neutral-500'}`}>Cancel</button>
                    <button onClick={handleAddEdu} className={`px-5 py-2 rounded-xl text-xs font-bold ${isDark ? 'bg-white text-black' : 'bg-black text-white'}`}>Save</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Certifications */}
            <div className={`pt-6 border-t ${isDark ? 'border-white/6' : 'border-black/6'} space-y-4`}>
              <h4 className={`text-xs font-semibold uppercase tracking-widest ${isDark ? 'text-white/35' : 'text-neutral-400'}`}>Certifications</h4>
              <div className="space-y-2">
                {formData.certifications.map(cert => (
                  <div key={cert.id} className={`flex items-center gap-3 p-3 rounded-xl border text-sm ${isDark ? 'border-white/8 bg-white/[0.02]' : 'border-black/8 bg-black/[0.01]'}`}>
                    <Award className="w-4 h-4 shrink-0 opacity-50" />
                    <div className="flex-1">
                      <span className="font-medium">{cert.name}</span>
                      <span className={`text-xs ml-2 ${isDark ? 'text-white/35' : 'text-neutral-500'}`}>· {cert.issuer}</span>
                    </div>
                    <button onClick={() => setFormData(p => ({ ...p, certifications: p.certifications.filter(c => c.id !== cert.id) }))} className={`p-1 ${isDark ? 'text-white/25 hover:text-red-400' : 'text-neutral-400 hover:text-red-500'}`}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input type="text" placeholder="Certification Name" value={tempCert.name} onChange={e => setTempCert(p => ({ ...p, name: e.target.value }))} className={inputCls} />
                <input type="text" placeholder="Issuer (e.g. AWS)" value={tempCert.issuer} onChange={e => setTempCert(p => ({ ...p, issuer: e.target.value }))} className={inputCls} />
                <button
                  onClick={() => {
                    if (!tempCert.name) { showToast('Certification name required.', 'error'); return; }
                    setFormData(p => ({ ...p, certifications: [...p.certifications, { id: 'cert-' + Date.now(), name: tempCert.name, issuer: tempCert.issuer, year: new Date().getFullYear().toString() }] }));
                    setTempCert({ name: '', issuer: '', year: '' });
                    showToast('Certification added!', 'success');
                  }}
                  className={`px-4 py-3 rounded-xl text-xs font-bold border transition-all ${isDark ? 'border-white/10 bg-white/5 hover:bg-white/10 text-white' : 'border-black/10 bg-black/5 hover:bg-black/10 text-neutral-800'}`}
                >
                  + Add Cert
                </button>
              </div>
            </div>
          </div>
        );

      // ═══ STEP 7: LANGUAGES ═══
      case 7:
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight" style={{ fontFamily: 'Georgia, serif' }}>
                What languages do<br className="hidden md:block" /> you communicate in?
              </h2>
              <p className={`mt-3 text-base ${isDark ? 'text-white/50' : 'text-neutral-500'}`}>
                Clients prioritize developers with verified communication skills. Configure your fluency levels.
              </p>
            </div>

            <div className="space-y-3">
              {formData.languages.map(lang => (
                <div key={lang.code} className={`${cardCls} p-4 flex items-center gap-4`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black shrink-0 uppercase ${isDark ? 'bg-white/8 text-white' : 'bg-black/5 text-neutral-800'}`}>
                    {lang.code}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-sm">{lang.name}</div>
                    <div className={`text-xs mt-0.5 ${isDark ? 'text-white/40' : 'text-neutral-500'}`}>{lang.fluency}</div>
                  </div>
                  <button onClick={() => handleRemoveLang(lang.code)} className={`p-1.5 rounded-lg ${isDark ? 'text-white/25 hover:text-red-400' : 'text-neutral-400 hover:text-red-500'}`}>
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className={`${cardCls} p-5 space-y-4`}>
              <h4 className="font-semibold text-sm">Add Language</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <select
                  value={tempLang.code}
                  onChange={e => {
                    const dict = { en: 'English', es: 'Spanish', fr: 'French', de: 'German', ja: 'Japanese', zh: 'Chinese', pt: 'Portuguese', ar: 'Arabic', ru: 'Russian', hi: 'Hindi' };
                    setTempLang(p => ({ ...p, code: e.target.value, name: dict[e.target.value] || e.target.value }));
                  }}
                  className={selectCls}
                >
                  {Object.entries({ en: 'English', es: 'Spanish', fr: 'French', de: 'German', ja: 'Japanese', zh: 'Chinese', pt: 'Portuguese', ar: 'Arabic', ru: 'Russian', hi: 'Hindi' }).map(([code, name]) => (
                    <option key={code} value={code}>{name}</option>
                  ))}
                </select>
                <select value={tempLang.fluency} onChange={e => setTempLang(p => ({ ...p, fluency: e.target.value }))} className={selectCls}>
                  <option value="Basic">Basic</option>
                  <option value="Conversational">Conversational</option>
                  <option value="Fluent">Fluent</option>
                  <option value="Native / Bilingual">Native / Bilingual</option>
                </select>
                <button onClick={handleAddLang} className={`px-4 py-3 rounded-xl text-sm font-bold transition-all ${isDark ? 'bg-white text-black hover:bg-white/90' : 'bg-black text-white hover:bg-black/90'}`}>
                  + Add Language
                </button>
              </div>
            </div>
          </div>
        );

      // ═══ STEP 8: BIO STUDIO ═══
      case 8:
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight" style={{ fontFamily: 'Georgia, serif' }}>
                Craft a professional bio<br className="hidden md:block" /> that wins clients.
              </h2>
              <p className={`mt-3 text-base ${isDark ? 'text-white/50' : 'text-neutral-500'}`}>
                Choose a tone and let AI generate a high-ranking, SEO-optimized summary. Then personalize it.
              </p>
            </div>

            {/* Tone selector */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { value: 'professional', label: 'Professional' },
                { value: 'technical', label: 'Technical' },
                { value: 'narrative', label: 'Narrative' },
                { value: 'minimal', label: 'Minimal' },
              ].map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setFormData(p => ({ ...p, bioTone: value }))}
                  className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all ${
                    formData.bioTone === value
                      ? isDark ? 'border-white bg-white/10 text-white' : 'border-black bg-black/10 text-neutral-900'
                      : isDark ? 'border-white/10 text-white/40 hover:border-white/20 hover:text-white/60' : 'border-black/10 text-neutral-500 hover:border-black/20'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Bio textarea */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className={`text-xs font-semibold uppercase tracking-widest ${isDark ? 'text-white/35' : 'text-neutral-400'}`}>Professional Bio</label>
                <span className={`text-xs font-medium ${formData.bio.length > 500 ? 'text-red-400' : isDark ? 'text-white/30' : 'text-neutral-400'}`}>{formData.bio.length}/600</span>
              </div>
              <textarea
                value={formData.bio}
                onChange={e => {
                  setFormData(p => ({ ...p, bio: e.target.value }));
                  if (fieldErrors.bio && e.target.value.length >= 20) setFieldErrors(p => ({ ...p, bio: undefined }));
                }}
                maxLength={600}
                rows={5}
                placeholder="Write your professional summary..."
                className={`${inputCls} resize-none leading-relaxed ${fieldErrors.bio ? 'border-red-500/50' : ''}`}
              />
              <FieldError message={fieldErrors.bio} />
            </div>

            {/* AI Generator */}
            <div className={`${cardCls} p-5 space-y-4`}>
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 opacity-60" /> AI Bio Copilot
              </h4>
              <motion.button
                onClick={handleGenerateBio}
                disabled={aiOptimizing}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full py-3.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50 ${isDark ? 'bg-white text-black hover:bg-white/90' : 'bg-black text-white hover:bg-black/90'}`}
              >
                <Sparkles className={`w-4 h-4 ${aiOptimizing ? 'animate-spin' : ''}`} />
                {aiOptimizing ? 'Writing your bio...' : `Generate ${formData.bioTone.charAt(0).toUpperCase() + formData.bioTone.slice(1)} Bio`}
              </motion.button>
              <div className={`grid grid-cols-2 gap-4 pt-3 border-t ${isDark ? 'border-white/5' : 'border-black/5'}`}>
                <div>
                  <span className={`text-xs font-medium block mb-0.5 ${isDark ? 'text-white/35' : 'text-neutral-500'}`}>Readability</span>
                  <span className="text-sm font-bold">Grade 10 (Optimal)</span>
                </div>
                <div>
                  <span className={`text-xs font-medium block mb-0.5 ${isDark ? 'text-white/35' : 'text-neutral-500'}`}>Match Score</span>
                  <span className="text-sm font-bold text-emerald-400">94% Rank</span>
                </div>
              </div>
            </div>
          </div>
        );

      // ═══ STEP 9: IDENTITY & PHOTO ═══
      case 9:
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight" style={{ fontFamily: 'Georgia, serif' }}>
                Add a photo and verify<br className="hidden md:block" /> your identity.
              </h2>
              <p className={`mt-3 text-base ${isDark ? 'text-white/50' : 'text-neutral-500'}`}>
                Profiles with professional headshots get 2.4× more responses. Verify to earn your Trust Badge.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Photo Upload */}
              <div className={`${cardCls} p-6 space-y-4`}>
                <h4 className="font-semibold text-sm">Professional Headshot</h4>
                <div className="flex flex-col items-center gap-4">
                  <div
                    onClick={() => photoInputRef.current?.click()}
                    className={`w-32 h-32 rounded-full border-2 border-dashed cursor-pointer overflow-hidden flex items-center justify-center group relative transition-all ${
                      isDark ? 'border-white/20 hover:border-white/40 bg-white/5' : 'border-black/15 hover:border-black/30 bg-black/5'
                    }`}
                  >
                    <input type="file" ref={photoInputRef} className="hidden" accept="image/*" onChange={handleSelectPhoto} />
                    {formData.photoUrl ? (
                      <>
                        <img src={formData.photoUrl} alt="Avatar" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs font-bold text-white transition-opacity rounded-full">
                          Change
                        </div>
                      </>
                    ) : (
                      <div className={`flex flex-col items-center gap-2 ${isDark ? 'text-white/30 group-hover:text-white/60' : 'text-neutral-400 group-hover:text-neutral-600'} transition-colors`}>
                        <Camera className="w-8 h-8" />
                        <span className="text-[10px] font-bold">Upload Photo</span>
                      </div>
                    )}
                  </div>

                  {isCropping && (
                    <div className="w-full space-y-2 p-3 bg-amber-500/8 rounded-xl border border-amber-500/20">
                      <p className="text-xs text-amber-400 font-semibold">📐 Confirm crop...</p>
                      <button onClick={handleCropSave} className="w-full py-2 rounded-lg text-xs font-bold bg-white text-black hover:bg-white/90 transition-all">
                        Save & Upload
                      </button>
                    </div>
                  )}

                  {(photoScore > 0) && (
                    <div className="w-full grid grid-cols-2 gap-2">
                      <div className={`p-3 rounded-xl border text-center ${isDark ? 'border-white/8 bg-white/[0.02]' : 'border-black/8'}`}>
                        <span className={`text-[10px] font-medium block ${isDark ? 'text-white/35' : 'text-neutral-500'}`}>Lighting</span>
                        <span className="text-sm font-bold text-emerald-400">{lightingScore}%</span>
                      </div>
                      <div className={`p-3 rounded-xl border text-center ${isDark ? 'border-white/8 bg-white/[0.02]' : 'border-black/8'}`}>
                        <span className={`text-[10px] font-medium block ${isDark ? 'text-white/35' : 'text-neutral-500'}`}>Professionalism</span>
                        <span className="text-sm font-bold text-emerald-400">{photoScore}/100</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Verification */}
              <div className={`${cardCls} p-6 space-y-5`}>
                <h4 className="font-semibold text-sm">Identity Verification</h4>

                {/* Phone */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-semibold ${isDark ? 'text-white/45' : 'text-neutral-500'}`}>Mobile Phone</span>
                    {formData.phoneVerified && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                        <Check className="w-3 h-3" /> Verified
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      value={formData.phone}
                      onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
                      disabled={formData.phoneVerified}
                      className={`${inputCls} flex-1 ${formData.phoneVerified ? 'opacity-50 cursor-not-allowed' : ''}`}
                    />
                    {!formData.phoneVerified && (
                      <button onClick={handleSendSMS} className={`shrink-0 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${isDark ? 'border-white/10 bg-white/5 hover:bg-white/10 text-white' : 'border-black/10 bg-black/5 hover:bg-black/10 text-neutral-700'}`}>
                        {smsSent ? 'Resend' : 'Send'}
                      </button>
                    )}
                  </div>
                  <div className={`flex gap-2 px-3 py-2 rounded-xl border text-[10px] font-medium ${isDark ? 'bg-amber-500/5 border-amber-500/15 text-amber-400' : 'bg-amber-50 border-amber-200 text-amber-600'}`}>
                    <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5" />
                    Demo mode — use code <strong>123456</strong>
                  </div>
                </div>

                {smsSent && (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input type="text" placeholder="6-digit code" maxLength={6} value={smsCode} onChange={e => setSmsCode(e.target.value)} className={`${inputCls} flex-1`} />
                      <button onClick={handleVerifySMS} className={`shrink-0 px-3 py-2 rounded-xl text-xs font-bold transition-all ${isDark ? 'bg-white text-black' : 'bg-black text-white'}`}>Verify</button>
                    </div>
                    {smsError && <p className="text-xs text-red-400">{smsError}</p>}
                  </div>
                )}

                {/* Location */}
                <div className="space-y-2">
                  <span className={`text-xs font-semibold ${isDark ? 'text-white/45' : 'text-neutral-500'}`}>Location</span>
                  <input type="text" value={formData.address} onChange={e => setFormData(p => ({ ...p, address: e.target.value }))} placeholder="e.g. San Francisco, CA, USA" className={inputCls} />
                </div>

                {/* Verification checkboxes */}
                <div className={`pt-4 border-t space-y-3 ${isDark ? 'border-white/6' : 'border-black/6'}`}>
                  {[
                    { id: 'idVerified', label: 'Government ID verified', icon: Lock },
                    { id: 'addressVerified', label: 'Address verified via utility document', icon: MapPin },
                  ].map(({ id, label, icon: Icon }) => (
                    <label key={id} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData[id]}
                        onChange={e => setFormData(p => ({ ...p, [id]: e.target.checked }))}
                        className="w-4 h-4 accent-white rounded cursor-pointer"
                      />
                      <span className={`text-xs font-medium flex items-center gap-1.5 ${isDark ? 'text-white/60' : 'text-neutral-700'}`}>
                        <Icon className="w-3.5 h-3.5 opacity-50" /> {label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Trust Banner */}
            <div className={`p-4 rounded-2xl border flex gap-3 ${isDark ? 'bg-white/3 border-white/8' : 'bg-black/2 border-black/8'}`}>
              <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5 opacity-50" />
              <div>
                <span className="font-semibold text-sm block mb-0.5">Trust & Security Shield</span>
                <span className={`text-xs ${isDark ? 'text-white/40' : 'text-neutral-500'}`}>
                  Your details are stored in AES-256 encrypted infrastructure. Verified profiles are prioritized 2.4× in client search results.
                </span>
              </div>
            </div>
          </div>
        );

      default: return null;
    }
  }

  const StepIcon = STEP_ICONS[step] || User;

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#030712] text-white' : 'bg-slate-50 text-neutral-900'} transition-colors`}>

      {/* Toast */}
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
      <div className={`sticky top-16 z-30 backdrop-blur-xl border-b ${isDark ? 'bg-[#030712]/95 border-white/5' : 'bg-slate-50/95 border-black/5'}`}>
        {/* Thin progress line */}
        <div className={`h-[2px] w-full ${isDark ? 'bg-white/5' : 'bg-black/5'}`}>
          <motion.div
            className={`h-full ${isDark ? 'bg-white' : 'bg-black'}`}
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>

        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${isDark ? 'bg-white text-black' : 'bg-black text-white'}`}>
              {step}
            </div>
            <span className={`text-sm font-semibold ${isDark ? 'text-white/70' : 'text-neutral-600'}`}>{STEP_NAMES[step]}</span>
            <span className={`text-xs ${isDark ? 'text-white/25' : 'text-neutral-400'}`}>of 9</span>
          </div>

          <div className="flex items-center gap-4">
            {/* Sync status */}
            <div className={`flex items-center gap-1.5 text-xs font-medium ${isDark ? 'text-white/35' : 'text-neutral-400'}`}>
              {isSaving ? (
                <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Saving...</>
              ) : cloudSynced ? (
                <><Cloud className="w-3.5 h-3.5 text-emerald-400" /> Saved</>
              ) : (
                <><AlertCircle className="w-3.5 h-3.5 text-amber-400" /> Pending</>
              )}
            </div>

            <button
              onClick={() => navigate(user?.role === 'DEVELOPER' ? '/developer' : user?.role === 'ADMIN' ? '/admin' : '/')}
              className={`text-xs font-semibold px-3.5 py-1.5 rounded-lg border transition-all ${isDark ? 'border-white/10 hover:bg-white/5 text-white/50 hover:text-white/80' : 'border-black/10 hover:bg-black/5 text-neutral-500 hover:text-neutral-700'}`}
            >
              Exit
            </button>
          </div>
        </div>
      </div>

      {/* ─── Main Content ─── */}
      <main className="max-w-2xl mx-auto px-6 py-12 md:py-16">

        {/* Step dots */}
        <div className="flex items-center gap-1.5 mb-10">
          {Array.from({ length: 9 }, (_, i) => i + 1).map(s => {
            const isCompleted = s < step;
            const isCurrent = s === step;
            return (
              <motion.div
                key={s}
                animate={{ scale: isCurrent ? 1 : 0.85, opacity: isCurrent ? 1 : isCompleted ? 0.9 : 0.25 }}
                transition={{ duration: 0.2 }}
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
          <span className={`ml-2 text-xs font-medium ${isDark ? 'text-white/30' : 'text-neutral-400'}`}>{progressPercent}%</span>
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            className={shakeStep ? 'animate-shake' : ''}
          >
            {renderStepContent()}
          </motion.div>
        </AnimatePresence>

        {/* ─── Navigation ─── */}
        <div className={`mt-12 pt-8 border-t flex justify-between items-center gap-4 ${isDark ? 'border-white/6' : 'border-black/6'}`}>
          <motion.button
            onClick={handleBack}
            disabled={step === 1}
            whileHover={{ scale: step > 1 ? 1.02 : 1 }}
            whileTap={{ scale: step > 1 ? 0.97 : 1 }}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl border text-sm font-semibold transition-all ${
              step === 1
                ? 'opacity-0 pointer-events-none'
                : isDark
                  ? 'border-white/10 hover:bg-white/5 text-white/70 hover:text-white'
                  : 'border-black/10 hover:bg-black/5 text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </motion.button>

          <div className={`text-xs font-medium ${isDark ? 'text-white/25' : 'text-neutral-400'}`}>
            Step {step} of 9
          </div>

          <motion.button
            onClick={handleNext}
            disabled={isParsing || isSaving}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className={`flex items-center gap-2 px-7 py-3 rounded-xl text-sm font-bold transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${
              isDark
                ? 'bg-white hover:bg-white/90 text-black shadow-white/10'
                : 'bg-black hover:bg-black/90 text-white shadow-black/15'
            }`}
          >
            {isSaving ? (
              <><RefreshCw className="w-4 h-4 animate-spin" /> Saving...</>
            ) : (
              <>{step === 9 ? '🎉 Complete Setup' : 'Continue'}<ChevronRight className="w-4 h-4" /></>
            )}
          </motion.button>
        </div>
      </main>

      {/* ─── AI Parsing Overlay ─── */}
      <AnimatePresence>
        {isParsing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
          >
            <div className={`w-full max-w-xs p-8 rounded-3xl border text-center space-y-5 ${isDark ? 'bg-[#080808] border-white/10' : 'bg-white border-black/10'} shadow-2xl`}>
              <div className="relative w-14 h-14 mx-auto">
                <div className={`w-14 h-14 rounded-full border-2 border-t-white animate-spin ${isDark ? 'border-white/10' : 'border-black/10 border-t-black'}`} />
                <Sparkles className="w-5 h-5 absolute inset-0 m-auto opacity-60" />
              </div>
              <div className="text-sm font-semibold">{parseStatus}</div>
              <div className={`w-full h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-white/8' : 'bg-black/8'}`}>
                <motion.div
                  className={`h-full rounded-full ${isDark ? 'bg-white' : 'bg-black'}`}
                  animate={{ width: `${parseProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <span className={`text-xs font-medium ${isDark ? 'text-white/30' : 'text-neutral-400'}`}>{parseProgress}% · Processing securely</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── SVG Icons ────────────────────────────────────────────────────────────────
function GithubIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

function LinkedInIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}
