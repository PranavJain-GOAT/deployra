import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Check, Upload, ChevronRight, ChevronLeft, ShieldCheck,
  Zap, Globe, Trash2, MapPin, Eye, AlertCircle, RefreshCw,
  FileCheck, Moon, Sun, Cloud, Lock, Clock, Info, CheckCircle2,
  XCircle, Smartphone, AlertTriangle, Star, Award
} from 'lucide-react';
import axios from 'axios';
import confetti from 'canvas-confetti';
import { useAuth } from '@/lib/AuthContext';
import { useTheme } from '@/lib/ThemeContext';
import { useProfile } from '@/hooks/useProfile';
import { API_URL } from '@/lib/config';

// ─── Constants & Suggestions ────────────────────────────────────────────────
const ROLE_TEMPLATES = {
  'Software Engineering': {
    demand: 96,
    avgRate: 85,
    trends: 'High request volumes for Next.js, FastAPI & PostgreSQL developers.',
    titleSuggestions: [
      'Full Stack Web Developer',
      'React & Next.js Engineer',
      'AI SaaS Developer',
      'Frontend Performance Engineer',
      'Full Stack Developer for Startups'
    ],
    skills: ['React', 'Next.js', 'TypeScript', 'Node.js', 'PostgreSQL', 'TailwindCSS', 'GraphQL', 'Docker', 'AWS']
  },
  'AI & Data Science': {
    demand: 98,
    avgRate: 110,
    trends: 'Surge in LLM fine-tuning, retrieval pipelines (RAG), and vector DB setup.',
    titleSuggestions: [
      'AI / Machine Learning Engineer',
      'RAG Pipeline Specialist',
      'Data Infrastructure Engineer',
      'PyTorch & MLOps Architect',
      'LLM Integration Specialist'
    ],
    skills: ['Python', 'PyTorch', 'LangChain', 'OpenAI API', 'Vector Databases', 'HuggingFace', 'Docker', 'MLOps']
  },
  'UI/UX Design': {
    demand: 88,
    avgRate: 75,
    trends: 'Demand for interactive prototype design systems and dark-mode glassmorphism.',
    titleSuggestions: [
      'Senior Product Designer',
      'Design Systems Engineer',
      'Interactive UI Specialist',
      'UX Researcher & Designer',
      'Framer Prototype Builder'
    ],
    skills: ['Figma', 'Framer', 'UI Design', 'Design Systems', 'UX Research', 'Interaction Design', 'CSS Effects']
  },
  'Product Management': {
    demand: 85,
    avgRate: 90,
    trends: 'Strong market demand for technical PMs with cloud architectures background.',
    titleSuggestions: [
      'Technical Product Manager',
      'Product Delivery Specialist',
      'SaaS Growth Product Manager',
      'Scrum Master & PM',
      'Developer Relations PM'
    ],
    skills: ['Agile Roadmap', 'Jira', 'Product Strategy', 'SaaS Metrics', 'A/B Testing', 'Client Communication']
  },
  'Web3 & Blockchain': {
    demand: 91,
    avgRate: 105,
    trends: 'Smart contract security audits and decentralized state-management systems.',
    titleSuggestions: [
      'Solidity Smart Contract Engineer',
      'Web3 Protocol Architect',
      'Ethereum & EVM Specialist',
      'Rust Blockchain Engineer',
      'dApp Frontend Engineer'
    ],
    skills: ['Solidity', 'Rust', 'Ethers.js', 'Smart Contracts', 'Web3.js', 'Web3 Architecture', 'Cryptography']
  }
};

const SUGGESTED_COMPLEMENTS = {
  'React': ['TypeScript', 'Next.js', 'TailwindCSS'],
  'Python': ['PyTorch', 'Docker', 'FastAPI'],
  'Solidity': ['Rust', 'Ethers.js', 'Cryptography'],
  'Figma': ['Framer', 'UI Design', 'CSS Effects'],
  'Node.js': ['PostgreSQL', 'GraphQL', 'Docker']
};

const STEP_NAMES = {
  1: 'Profile Import',
  2: 'Category & Specialization',
  3: 'Skills Intelligence',
  4: 'Professional Title',
  5: 'Timeline Experience',
  6: 'Education & Credentials',
  7: 'Language Portfolio',
  8: 'AI Bio Studio',
  9: 'Identity & Photo'
};

// ─── Inline Toast Component ─────────────────────────────────────────────────
function InlineToast({ message, type = 'success', onDismiss }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 3500);
    return () => clearTimeout(t);
  }, [onDismiss]);

  const colors = {
    success: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
    error: 'bg-red-500/10 border-red-500/30 text-red-400',
    info: 'bg-violet-500/10 border-violet-500/30 text-violet-400',
  };
  const icons = {
    success: <CheckCircle2 className="w-4 h-4 shrink-0" />,
    error: <XCircle className="w-4 h-4 shrink-0" />,
    info: <AlertCircle className="w-4 h-4 shrink-0" />,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.97 }}
      className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border text-xs font-semibold ${colors[type]}`}
    >
      {icons[type]}
      <span className="flex-1">{message}</span>
      <button onClick={onDismiss} className="opacity-60 hover:opacity-100 transition-opacity">×</button>
    </motion.div>
  );
}

// ─── Step Indicator Component ─────────────────────────────────────────────────
function StepDots({ currentStep, totalSteps, isDark }) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {Array.from({ length: totalSteps }, (_, i) => i + 1).map((s) => {
        const isCompleted = s < currentStep;
        const isCurrent = s === currentStep;
        return (
          <motion.div
            key={s}
            initial={false}
            animate={{
              scale: isCurrent ? 1 : 0.85,
              opacity: isCurrent ? 1 : isCompleted ? 0.8 : 0.3,
            }}
            transition={{ duration: 0.2 }}
            className={`rounded-full transition-all ${
              isCurrent
                ? 'w-6 h-2 bg-violet-500'
                : isCompleted
                  ? 'w-2 h-2 bg-emerald-400'
                  : `w-2 h-2 ${isDark ? 'bg-white/20' : 'bg-black/15'}`
            }`}
          />
        );
      })}
    </div>
  );
}

// ─── Field Error Component ─────────────────────────────────────────────────
function FieldError({ message }) {
  if (!message) return null;
  return (
    <motion.p
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-[10px] text-red-400 font-semibold flex items-center gap-1 mt-1"
    >
      <AlertCircle className="w-3 h-3" />
      {message}
    </motion.p>
  );
}

export default function Onboarding() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isDark } = useTheme();
  const { uploadAvatar } = useProfile();

  // Onboarding Wizard steps (1 to 9)
  const [step, setStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [cloudSynced, setCloudSynced] = useState(true);
  const [toast, setToast] = useState(null); // { message, type }
  const [fieldErrors, setFieldErrors] = useState({});
  const [shakeStep, setShakeStep] = useState(false);

  // Form State — pre-filled from user context where possible
  const [formData, setFormData] = useState({
    // Step 1: Import
    linkedinUrl: '',
    githubUrl: '',
    portfolioUrl: '',
    resumeName: '',
    importSource: '',

    // Step 2: Specialization
    specialization: 'Software Engineering',
    subRole: 'React & Node.js Specialist',
    hourlyRate: 85,
    experienceLevel: 'Senior',

    // Step 3: Skills
    skills: ['React', 'Node.js', 'PostgreSQL', 'TailwindCSS', 'TypeScript'],
    complementarySkills: ['GraphQL', 'Docker', 'AWS', 'Next.js'],

    // Step 4: Title
    title: 'Senior Full Stack Engineer',

    // Step 5: Experience
    experience: [
      {
        id: 'exp-1',
        company: 'Vercel',
        role: 'Senior Frontend Architect',
        duration: '2024 - Present',
        bullets: [
          'Optimized Next.js page speeds, increasing overall site conversions by 28%.',
          'Built modern edge rendering modules scaling to 4 million daily requests.'
        ]
      }
    ],

    // Step 6: Education & Credentials
    education: [
      {
        id: 'edu-1',
        school: 'Stanford University',
        degree: 'M.S. in Computer Science',
        year: '2023',
        gpa: '3.9'
      }
    ],
    certifications: [
      { id: 'cert-1', name: 'AWS Certified Solutions Architect', issuer: 'Amazon Web Services', year: '2023' }
    ],

    // Step 7: Language
    languages: [
      { code: 'en', name: 'English', fluency: 'Native / Bilingual' },
      { code: 'es', name: 'Spanish', fluency: 'Conversational' }
    ],

    // Step 8: Bio Studio
    bio: 'High-performance engineer focused on building scalable interfaces, optimizing bundle delivery speeds, and configuring modern cloud pipelines. Passionate about detail-oriented UI layouts.',
    bioTone: 'professional',

    // Step 9: Personal, Verification & Photo
    phone: '',
    address: '',
    photoUrl: user?.profileImage || '',
    idVerified: false,
    phoneVerified: false,
    addressVerified: false,
  });

  // Local/Temporary State for inputs
  const [skillSearch, setSkillSearch] = useState('');
  const [tempExp, setTempExp] = useState({ company: '', role: '', duration: '', bullet: '' });
  const [tempEdu, setTempEdu] = useState({ school: '', degree: '', year: '', gpa: '' });
  const [tempCert, setTempCert] = useState({ name: '', issuer: '', year: '' });
  const [tempLang, setTempLang] = useState({ code: 'en', name: 'English', fluency: 'Fluent' });

  // Interactive flow states
  const [isParsing, setIsParsing] = useState(false);
  const [parseProgress, setParseProgress] = useState(0);
  const [parseStatus, setParseStatus] = useState('');
  const [aiOptimizing, setAiOptimizing] = useState(false);
  const [previewTheme, setPreviewTheme] = useState('dark');
  const [isCropping, setIsCropping] = useState(false);
  const [cropFile, setCropFile] = useState(null);
  const [photoScore, setPhotoScore] = useState(0);
  const [lightingScore, setLightingScore] = useState(0);
  const [smsSent, setSmsSent] = useState(false);
  const [smsCode, setSmsCode] = useState('');
  const [smsError, setSmsError] = useState('');

  // Refs
  const fileInputRef = useRef(null);
  const photoInputRef = useRef(null);
  const canvasRef = useRef(null);

  // Pre-fill address from user profile if available
  useEffect(() => {
    if (user?.country && !formData.address) {
      setFormData(prev => ({ ...prev, address: user.country }));
    }
    if (user?.profileImage && !formData.photoUrl) {
      setFormData(prev => ({ ...prev, photoUrl: user.profileImage }));
    }
  }, [user]);

  // Show toast helper
  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
  }, []);

  const dismissToast = useCallback(() => setToast(null), []);

  // Sync state with backend preferencesJson on step transitions
  const saveProgress = async (nextStep) => {
    setIsSaving(true);
    setCloudSynced(false);
    try {
      const onboardingPrefs = {
        onboardingStep: nextStep,
        onboarded: nextStep > 9,
        onboardingData: formData
      };
      await axios.patch(`${API_URL}/users/preferences`, { preferences: onboardingPrefs });

      if (nextStep > 1) {
        const updatePayload = {};
        if (formData.address) updatePayload.country = formData.address.split(',').pop().trim();
        if (Object.keys(updatePayload).length > 0) {
          await axios.patch(`${API_URL}/users/me`, updatePayload);
        }
      }
      setCloudSynced(true);
    } catch (err) {
      console.error('Failed to sync progress:', err);
      showToast('Failed to autosave. Your data is still preserved locally.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Load existing saved onboarding data
  useEffect(() => {
    const fetchExistingProgress = async () => {
      try {
        const res = await axios.get(`${API_URL}/users/preferences`);
        if (res.data?.success && res.data?.data) {
          const prefs = res.data.data;
          if (prefs.onboardingData) {
            setFormData(prev => ({ ...prev, ...prefs.onboardingData }));
          }
          if (prefs.onboardingStep && prefs.onboardingStep <= 9) {
            setStep(prefs.onboardingStep);
          }
        }
      } catch (_) {}
    };
    fetchExistingProgress();
  }, []);

  // Per-step validation
  const validateStep = (currentStep) => {
    const errors = {};
    switch (currentStep) {
      case 3:
        if (formData.skills.length === 0) errors.skills = 'Add at least one skill to continue.';
        break;
      case 4:
        if (!formData.title || formData.title.trim().length < 5)
          errors.title = 'Please enter a professional title (at least 5 characters).';
        break;
      case 8:
        if (!formData.bio || formData.bio.trim().length < 20)
          errors.bio = 'Write at least 20 characters in your professional bio.';
        break;
      default:
        break;
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
    if (step < 9) {
      const next = step + 1;
      setStep(next);
      saveProgress(next);
      showToast(`Step ${step} saved! Moving to ${STEP_NAMES[next]}.`, 'success');
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setFieldErrors({});
      setStep(step - 1);
    }
  };

  const handleComplete = async () => {
    setIsSaving(true);
    try {
      const onboardingPrefs = {
        onboardingStep: 10,
        onboarded: true,
        onboardingData: formData
      };
      await axios.patch(`${API_URL}/users/preferences`, { preferences: onboardingPrefs });

      // Update user profile fields (country from address, but don't change role)
      const updatePayload = {};
      if (formData.address) updatePayload.country = formData.address.split(',').pop().trim();
      if (Object.keys(updatePayload).length > 0) {
        await axios.patch(`${API_URL}/users/me`, updatePayload);
      }

      confetti({
        particleCount: 180,
        spread: 90,
        origin: { y: 0.6 },
        colors: ['#7c3aed', '#8b5cf6', '#a78bfa', '#c4b5fd', '#10b981']
      });

      showToast('🎉 Profile complete! Redirecting to your dashboard...', 'success');

      setTimeout(() => {
        // Navigate to role-appropriate dashboard
        if (user?.role === 'DEVELOPER') navigate('/developer');
        else if (user?.role === 'ADMIN') navigate('/admin');
        else navigate('/');
      }, 2000);
    } catch (err) {
      console.error('Error completing onboarding:', err);
      showToast('Failed to complete setup. Please try again.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Step 1: Mock resume upload parsing
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    simulateResumeParsing(file.name);
  };

  const simulateResumeParsing = (fileName) => {
    setIsParsing(true);
    setParseProgress(5);
    setParseStatus('Initializing secure parsing connection...');

    const intervals = [
      { progress: 20, status: 'Reading file metadata and format...' },
      { progress: 45, status: 'Analyzing career timeline & milestones...' },
      { progress: 75, status: 'Extracting key technical skills...' },
      { progress: 95, status: 'Synthesizing professional background...' },
      { progress: 100, status: '✓ AI Enrichment complete!' }
    ];

    intervals.forEach((stepItem, idx) => {
      setTimeout(() => {
        setParseProgress(stepItem.progress);
        setParseStatus(stepItem.status);
        if (stepItem.progress === 100) {
          setTimeout(() => {
            setFormData(prev => ({
              ...prev,
              resumeName: fileName,
              importSource: 'resume',
              title: 'Lead Frontend Software Engineer',
              skills: ['React', 'Next.js', 'TypeScript', 'Node.js', 'PostgreSQL', 'CSS Effects', 'TailwindCSS'],
              bio: 'Performance-driven frontend leader with 5+ years designing scalable dashboard ecosystems. Specialized in edge computing and modern UI rendering pipelines.',
              experience: [
                {
                  id: 'exp-parsed-1',
                  company: 'Linear Corp',
                  role: 'Frontend Lead',
                  duration: '2022 - 2024',
                  bullets: [
                    'Architected next-gen keyboard navigation components, increasing customer speed index by 40%.',
                    'Spearheaded transition from legacy state container to optimized reactive hooks.'
                  ]
                }
              ]
            }));
            setIsParsing(false);
            showToast('Resume parsed successfully! Profile data pre-filled.', 'success');
          }, 600);
        }
      }, (idx + 1) * 800);
    });
  };

  // Step 1: Github mock import
  const handleGithubConnect = () => {
    if (!formData.githubUrl && !formData.githubUrl?.startsWith('http')) {
      // If no URL provided, simulate the connect flow
    }
    setIsParsing(true);
    setParseProgress(10);
    setParseStatus('Authenticating with GitHub...');

    setTimeout(() => {
      setParseProgress(40);
      setParseStatus('Scanning repositories and commit frequencies...');
      setTimeout(() => {
        setParseProgress(80);
        setParseStatus('Analyzing language composition & dependencies...');
        setTimeout(() => {
          setParseProgress(100);
          setParseStatus('✓ Import complete! Extracted metadata successfully.');
          setTimeout(() => {
            setFormData(prev => ({
              ...prev,
              githubUrl: prev.githubUrl || ('https://github.com/' + (user?.name?.toLowerCase().replace(/ /g, '') || 'dev')),
              importSource: 'github',
              skills: [...new Set([...prev.skills, 'JavaScript', 'TypeScript', 'Git', 'Docker'])]
            }));
            setIsParsing(false);
            showToast('GitHub profile connected & tech stack imported!', 'success');
          }, 600);
        }, 800);
      }, 800);
    }, 800);
  };

  // Step 3: Skill Actions
  const handleAddSkill = (skill) => {
    const trimmed = skill.trim();
    if (trimmed && !formData.skills.includes(trimmed)) {
      setFormData(prev => ({ ...prev, skills: [...prev.skills, trimmed] }));
      setSkillSearch('');
      if (fieldErrors.skills) setFieldErrors(prev => ({ ...prev, skills: undefined }));
    }
  };

  const handleRemoveSkill = (skill) => {
    setFormData(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }));
  };

  // Step 4: AI title optimization
  const scoreTitle = (title) => {
    let baseScore = 60;
    if (title.toLowerCase().includes('architect')) baseScore += 15;
    if (title.toLowerCase().includes('engineer')) baseScore += 10;
    if (title.toLowerCase().includes('senior')) baseScore += 10;
    if (title.length > 15) baseScore += 5;
    return Math.min(baseScore, 99);
  };

  // Step 5: AI Bullet Optimizer
  const handleOptimizeBullet = (index, bulletIndex) => {
    setAiOptimizing(true);
    const original = formData.experience[index].bullets[bulletIndex];

    setTimeout(() => {
      let optimized = original;
      if (original.toLowerCase().includes('build') || original.toLowerCase().includes('made')) {
        optimized = 'Architected and deployed cloud-native dashboard modules, improving page load performance by 36% and saving 24 hours of manual work weekly.';
      } else if (original.toLowerCase().includes('optimized') || original.toLowerCase().includes('speed')) {
        optimized = 'Optimized resource delivery pipeline and code bundling, decreasing browser latency by 42% and increasing conversions by 18%.';
      } else {
        optimized = 'Spearheaded critical engineering features, raising runtime stability by 31% while reducing memory consumption to support 15k concurrent clients.';
      }

      const updatedExp = [...formData.experience];
      updatedExp[index].bullets[bulletIndex] = optimized;
      setFormData(prev => ({ ...prev, experience: updatedExp }));
      setAiOptimizing(false);
      showToast('Bullet point optimized with AI metrics!', 'info');
    }, 1200);
  };

  // Step 6: Education add
  const handleAddEdu = () => {
    if (!tempEdu.school || !tempEdu.degree) {
      showToast('Please fill in School and Degree fields.', 'error');
      return;
    }
    const newEdu = {
      id: 'edu-' + Date.now(),
      school: tempEdu.school,
      degree: tempEdu.degree,
      year: tempEdu.year || '2024',
      gpa: tempEdu.gpa || ''
    };
    setFormData(prev => ({ ...prev, education: [...prev.education, newEdu] }));
    setTempEdu({ school: '', degree: '', year: '', gpa: '' });
    showToast('Education record added!', 'success');
  };

  // Step 7: Language Actions
  const handleAddLang = () => {
    if (formData.languages.some(l => l.code === tempLang.code)) {
      showToast('This language is already in your profile.', 'error');
      return;
    }
    setFormData(prev => ({
      ...prev,
      languages: [...prev.languages, { code: tempLang.code, name: tempLang.name, fluency: tempLang.fluency }]
    }));
    showToast(`${tempLang.name} added to your language portfolio!`, 'success');
  };

  const handleRemoveLang = (code) => {
    setFormData(prev => ({ ...prev, languages: prev.languages.filter(l => l.code !== code) }));
  };

  // Step 8: AI Bio Writer Studio
  const handleGenerateBio = () => {
    setAiOptimizing(true);
    setTimeout(() => {
      let generated = '';
      if (formData.bioTone === 'technical') {
        generated = `Advanced systems engineer with focus on ${formData.skills.slice(0, 4).join(', ')}. Expert in designing low-latency API architectures, edge caching structures, and robust client-side components. Confirmed track record improving core web metrics.`;
      } else if (formData.bioTone === 'narrative') {
        generated = `I love solving hard design and coding challenges. As a ${formData.title}, I bridge the gap between complex infrastructure and pixel-perfect design. From writing fast backend endpoints to rendering complex UI visuals, I ship high-trust applications that users love.`;
      } else if (formData.bioTone === 'minimal') {
        generated = `${formData.title} focused on ${formData.skills.slice(0, 3).join(', ')}. Building minimal, high-speed applications with exceptional UX.`;
      } else {
        generated = `Results-oriented ${formData.title} specializing in ${formData.skills.slice(0, 4).join(', ')}. Passionate about building exceptional client experiences, orchestrating scalable workflows, and solving real business challenges with elegant code.`;
      }
      setFormData(prev => ({ ...prev, bio: generated }));
      setAiOptimizing(false);
      showToast('AI bio generated! Feel free to refine it further.', 'info');
    }, 1200);
  };

  // Step 9: Image upload
  const handleSelectPhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCropFile(file);
    setIsCropping(true);
  };

  const handleCropSave = async () => {
    setIsCropping(false);
    setParseStatus('Analyzing photo quality...');
    setIsParsing(true);

    setTimeout(async () => {
      setIsParsing(false);
      const fakeUrl = URL.createObjectURL(cropFile);
      setFormData(prev => ({ ...prev, photoUrl: fakeUrl }));
      setPhotoScore(94);
      setLightingScore(98);

      try {
        const url = await uploadAvatar(cropFile);
        if (url) {
          setFormData(prev => ({ ...prev, photoUrl: url }));
          showToast('Professional headshot uploaded & saved!', 'success');
        }
      } catch (_) {
        showToast('Photo saved locally. Upload to CDN failed — retry later.', 'error');
      }
    }, 1500);
  };

  // Step 9: Phone Verification Flow
  const handleSendSMS = () => {
    if (!formData.phone || formData.phone.trim().length < 7) {
      showToast('Please enter a valid phone number.', 'error');
      return;
    }
    setSmsSent(true);
    setSmsError('');
    showToast('Verification code sent! (Demo: use code 123456)', 'info');
  };

  const handleVerifySMS = () => {
    if (smsCode === '123456' || smsCode.length === 6) {
      setFormData(prev => ({ ...prev, phoneVerified: true }));
      setSmsSent(false);
      setSmsCode('');
      showToast('Phone number verified successfully!', 'success');
    } else {
      setSmsError('Invalid code. Demo code is 123456');
    }
  };

  // Computed metrics for client preview side card
  const progressPercent = Math.round((step / 9) * 100);

  const getCompleteness = () => {
    let score = 10;
    if (formData.importSource) score += 10;
    if (formData.skills.length > 4) score += 15;
    if (formData.title.length > 5) score += 15;
    if (formData.experience.length > 0) score += 15;
    if (formData.bio.length > 20) score += 15;
    if (formData.photoUrl) score += 10;
    if (formData.phoneVerified) score += 10;
    return Math.min(score, 100);
  };

  // Role template insights
  const currentTemplate = ROLE_TEMPLATES[formData.specialization] || ROLE_TEMPLATES['Software Engineering'];

  // Global background depending on dark mode
  const bgTheme = isDark ? 'bg-[#030712] text-white' : 'bg-slate-50 text-neutral-900';
  const cardTheme = isDark ? 'bg-[#0b0f19] border-white/5 shadow-2xl' : 'bg-white border-black/5 shadow-xl';
  const inputClass = `w-full px-3.5 py-2.5 rounded-xl border text-xs font-medium focus:ring-1 focus:ring-violet-500 focus:outline-none transition-all ${
    isDark ? 'bg-white/3 border-white/8 text-white placeholder-white/30' : 'bg-white border-slate-200 text-neutral-900 placeholder-neutral-400'
  }`;
  const selectClass = `w-full px-3.5 py-2.5 rounded-xl border text-xs font-medium focus:ring-1 focus:ring-violet-500 focus:outline-none ${
    isDark ? 'bg-[#0b0f19] border-white/8 text-white' : 'bg-white border-slate-200 text-neutral-900'
  }`;

  return (
    <div className={`min-h-screen ${bgTheme} flex flex-col font-sans transition-all`}>

      {/* ─── Toast Notification ─── */}
      <div className="fixed top-20 right-4 z-50 w-80 space-y-2 pointer-events-none">
        <AnimatePresence>
          {toast && (
            <div className="pointer-events-auto">
              <InlineToast message={toast.message} type={toast.type} onDismiss={dismissToast} />
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* ─── Top Sticky Status Header ─── */}
      <header className={`sticky top-16 z-30 h-14 border-b flex items-center justify-between px-6 backdrop-blur-xl ${
        isDark ? 'border-white/5 bg-[#030712]/90' : 'border-black/5 bg-slate-50/90'
      }`}>
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold uppercase tracking-widest text-violet-500">Identity Builder</span>
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 opacity-40" />
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
            <Clock className="w-3.5 h-3.5" />
            <span>Est. {Math.max(1, 10 - step)} min remaining</span>
          </div>
        </div>

        {/* Sync Indicator */}
        <div className="flex items-center gap-4 text-xs font-medium">
          <div className="flex items-center gap-1.5 text-[11px]">
            {isSaving ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 text-violet-400 animate-spin" />
                <span className="text-slate-400">Autosaving...</span>
              </>
            ) : cloudSynced ? (
              <>
                <Cloud className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-slate-400">Synced to Cloud</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-slate-400">Pending Sync</span>
              </>
            )}
          </div>
          <button
            onClick={() => navigate(user?.role === 'DEVELOPER' ? '/developer' : user?.role === 'ADMIN' ? '/admin' : '/')}
            className={`px-3 py-1 text-[11px] font-bold rounded-lg border transition-colors ${
              isDark ? 'border-white/10 hover:bg-white/5 text-white/70' : 'border-black/10 hover:bg-black/5 text-neutral-600'
            }`}
          >
            Save & Exit
          </button>
        </div>
      </header>

      {/* ─── Main Onboarding Layout (Split-Screen) ─── */}
      <main className="flex-1 w-full max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-0">

        {/* ================= LEFT SIDE: Step Form Wizard (7 cols) ================= */}
        <div className="lg:col-span-7 p-6 md:p-10 flex flex-col border-r border-slate-200/50 dark:border-white/5">

          {/* Step Indicator + Progress */}
          <div className="mb-8 space-y-4">
            {/* Step dots row */}
            <StepDots currentStep={step} totalSteps={9} isDark={isDark} />

            <div className="flex justify-between items-center">
              <div>
                <span className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  Step {step} of 9
                </span>
                <h3 className={`text-sm font-bold mt-0.5 ${isDark ? 'text-white' : 'text-neutral-900'}`}>
                  {STEP_NAMES[step]}
                </h3>
              </div>
              <span className="text-xs font-bold text-violet-400">{progressPercent}%</span>
            </div>

            <div className={`w-full h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-white/5' : 'bg-slate-200'}`}>
              <motion.div
                className="h-full bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>

            {/* Psychological nudge */}
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
              <Sparkles className="w-3 h-3 text-violet-400 animate-pulse" />
              <span>You're ahead of 78% of new users. Complete setup to earn your Elite Badge.</span>
            </div>
          </div>

          {/* Step Form Body */}
          <div className="flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
                className={`space-y-6 ${shakeStep ? 'animate-shake' : ''}`}
              >
                {renderStepContent(step)}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Stepper Navigation Actions */}
          <div className={`pt-8 mt-10 border-t flex justify-between items-center ${isDark ? 'border-white/5' : 'border-slate-200'}`}>
            <button
              onClick={handleBack}
              disabled={step === 1}
              className={`flex items-center gap-1.5 text-xs font-bold px-5 py-2.5 rounded-xl border transition-all ${
                step === 1
                  ? 'opacity-30 cursor-not-allowed border-transparent'
                  : isDark ? 'border-white/10 hover:bg-white/5 text-white' : 'border-black/10 hover:bg-black/5 text-neutral-900'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <motion.button
              onClick={handleNext}
              disabled={isParsing || isSaving}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="shimmer-btn flex items-center gap-2 text-xs font-bold px-7 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white transition-all shadow-lg shadow-violet-600/30 hover:shadow-violet-600/40 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Syncing...</span>
                </>
              ) : (
                <>
                  <span>{step === 9 ? '🎉 Finish Setup' : 'Save & Continue'}</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </div>
        </div>

        {/* ================= RIGHT SIDE: Live Client Preview (5 cols) ================= */}
        <div className="lg:col-span-5 p-6 md:p-10 lg:sticky lg:top-32 h-fit flex flex-col items-center justify-start self-start space-y-6">

          {/* Preview Header / Device Toggle */}
          <div className="w-full flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Live client view</span>
            </div>

            <div className={`flex items-center gap-1 p-0.5 rounded-lg border ${isDark ? 'bg-white/5 border-white/5' : 'bg-slate-200 border-slate-300/30'}`}>
              <button
                onClick={() => setPreviewTheme('light')}
                className={`p-1.5 rounded-md transition-all ${previewTheme === 'light' ? 'bg-white text-neutral-900 shadow-sm' : 'text-slate-400 hover:text-neutral-600'}`}
              >
                <Sun className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setPreviewTheme('dark')}
                className={`p-1.5 rounded-md transition-all ${previewTheme === 'dark' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-neutral-600'}`}
              >
                <Moon className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* THE PREMIUM PREVIEW CARD */}
          <div className={`w-full rounded-2xl border transition-all radial-card ${
            previewTheme === 'dark'
              ? 'bg-[#090d16] border-white/10 text-white shadow-2xl shadow-black/80'
              : 'bg-white border-slate-200 text-neutral-900 shadow-xl'
          }`}>

            {/* Glowing top accent */}
            <div className="h-1 w-full bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500 rounded-t-2xl" />

            {/* Card Content */}
            <div className="p-6 space-y-5">

              {/* Profile Identity Row */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="relative">
                    {formData.photoUrl ? (
                      <img
                        src={formData.photoUrl}
                        alt="Preview Avatar"
                        className="w-14 h-14 rounded-full object-cover ring-2 ring-violet-500/20"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg ring-2 ring-violet-500/20">
                        {user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
                      </div>
                    )}
                    <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 ring-2 ring-[#090d16] animate-pulse" />
                  </div>

                  <div>
                    <div className="flex items-center gap-1">
                      <h4 className="text-sm font-bold tracking-tight">{user?.name || 'Your Name'}</h4>
                      {formData.idVerified && <ShieldCheck className="w-4 h-4 text-sky-400" />}
                    </div>
                    <p className={`text-xs font-medium mt-0.5 ${previewTheme === 'dark' ? 'text-slate-400' : 'text-neutral-500'}`}>
                      {formData.title || 'Your Professional Title...'}
                    </p>
                    {formData.address && (
                      <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-400">
                        <MapPin className="w-3 h-3" />
                        <span>{formData.address}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Pricing / Plan Badge */}
                <div className="text-right shrink-0">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold ${
                    previewTheme === 'dark' ? 'bg-violet-500/10 text-violet-400' : 'bg-violet-50 text-violet-600'
                  }`}>
                    PRO MEMBER
                  </span>
                  <div className="text-sm font-bold mt-1.5">${formData.hourlyRate}/hr</div>
                  <div className="text-[9px] text-slate-400">Market Rate</div>
                </div>
              </div>

              {/* Bio Summary */}
              <div className={`p-3 rounded-xl text-[11px] leading-relaxed ${
                previewTheme === 'dark' ? 'bg-white/5 border border-white/5' : 'bg-slate-50 border border-slate-100'
              }`}>
                <p className={formData.bio ? '' : 'text-slate-400 italic'}>
                  {formData.bio || 'Your professional bio will appear here. Use Step 8 to craft it with AI...'}
                </p>
              </div>

              {/* Skills Grid */}
              <div className="space-y-2">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Expertise Tags</div>
                <div className="flex flex-wrap gap-1.5">
                  {formData.skills.slice(0, 8).map((skill) => (
                    <span
                      key={skill}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-medium ${
                        previewTheme === 'dark' ? 'bg-white/5 text-white/80 border border-white/5' : 'bg-slate-100 text-neutral-700'
                      }`}
                    >
                      {skill}
                    </span>
                  ))}
                  {formData.skills.length > 8 && (
                    <span className="text-[10px] text-slate-400 italic">+{formData.skills.length - 8} more</span>
                  )}
                  {formData.skills.length === 0 && (
                    <span className="text-[11px] text-slate-400 italic">Add skills in Step 3...</span>
                  )}
                </div>
              </div>

              {/* Timeline Experience */}
              {formData.experience.length > 0 && (
                <div className="space-y-3">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Recent History</div>
                  {formData.experience.slice(0, 2).map((exp) => (
                    <div key={exp.id} className="border-l-2 border-violet-500/30 pl-3.5 space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold">{exp.role}</span>
                        <span className="text-[10px] text-slate-400">{exp.duration}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-semibold">{exp.company}</div>
                      <ul className="list-disc list-inside text-[10px] text-slate-400 space-y-0.5 mt-1 leading-relaxed">
                        {exp.bullets.slice(0, 2).map((b, bIdx) => (
                          <li key={bIdx} className="truncate max-w-[300px]">{b}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Performance Analytics Panel */}
          <div className={`w-full p-4 rounded-xl border grid grid-cols-2 gap-4 ${cardTheme}`}>
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">Completeness</div>
              <div className="flex items-center gap-2">
                <div className="text-lg font-black">{getCompleteness()}%</div>
                <div className={`flex-1 h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-white/5' : 'bg-slate-100'}`}>
                  <motion.div
                    className="h-full bg-emerald-400"
                    animate={{ width: `${getCompleteness()}%` }}
                    transition={{ duration: 0.4 }}
                  />
                </div>
              </div>
            </div>

            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">Discoverability</div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                <span>{formData.skills.length > 4 ? 'Top Match (94%)' : 'Good (72%)'}</span>
              </div>
            </div>

            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">Reputation</div>
              <div className="flex items-center gap-1 text-xs font-bold text-indigo-400">
                <Star className="w-3.5 h-3.5" />
                <span>Level 3 Specialist</span>
              </div>
            </div>

            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">Trust Score</div>
              <div className="flex items-center gap-1 text-xs font-bold text-sky-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{formData.phoneVerified && formData.idVerified ? '100% Verified' : '60% Verified'}</span>
              </div>
            </div>
          </div>

        </div>

      </main>

      {/* ─── Global Upload Overlay Loader ─── */}
      <AnimatePresence>
        {isParsing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md"
          >
            <div className={`w-full max-w-sm p-8 rounded-2xl border text-center space-y-5 ${cardTheme}`}>
              <div className="relative w-14 h-14 mx-auto">
                <div className="w-14 h-14 rounded-full border-2 border-violet-500/20 border-t-violet-500 animate-spin" />
                <Sparkles className="w-5 h-5 text-violet-400 absolute inset-0 m-auto" />
              </div>
              <div className="text-sm font-bold">{parseStatus}</div>

              <div className={`w-full h-2 rounded-full overflow-hidden ${isDark ? 'bg-white/5' : 'bg-slate-100'}`}>
                <motion.div
                  className="h-full bg-gradient-to-r from-violet-600 to-indigo-500"
                  animate={{ width: `${parseProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <span className="text-[10px] text-slate-400 font-bold">{parseProgress}% — Processing securely offline</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );

  // ─── Rendering Step Views ───────────────────────────────────────────────────
  function renderStepContent(stepIndex) {
    switch (stepIndex) {

      // ═══ STEP 1: PROFILE IMPORT ═══
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Import your Professional Identity</h2>
              <p className={`text-sm mt-1.5 ${isDark ? 'text-slate-400' : 'text-neutral-500'}`}>
                Sync data from platforms or upload your resume. Our AI parsing pipeline will auto-fill your profile details — saving you time.
              </p>
            </div>

            {/* Connect Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* GitHub Card */}
              <div className={`p-5 rounded-2xl border text-left flex flex-col gap-3 transition-all ${
                formData.importSource === 'github'
                  ? 'border-violet-500 bg-violet-500/5'
                  : isDark ? 'border-white/8 bg-white/[0.02] hover:bg-white/5' : 'border-black/5 bg-white hover:bg-slate-50'
              }`}>
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-white/10 text-white shrink-0">
                    <GithubIcon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold">Import from GitHub</h4>
                    <p className={`text-[10px] mt-1 leading-relaxed ${isDark ? 'text-slate-400' : 'text-neutral-500'}`}>
                      Auto-extract your repository tech stack, commit frequencies, and coding metrics.
                    </p>
                  </div>
                </div>
                {/* URL input */}
                <div className="space-y-1.5">
                  <input
                    type="url"
                    value={formData.githubUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, githubUrl: e.target.value }))}
                    placeholder="https://github.com/username"
                    className={`w-full px-3 py-2 rounded-lg border text-[11px] font-medium focus:ring-1 focus:ring-violet-500 focus:outline-none ${
                      isDark ? 'bg-white/5 border-white/10 text-white placeholder-white/20' : 'bg-slate-50 border-slate-200 text-neutral-900'
                    }`}
                  />
                  <button
                    onClick={handleGithubConnect}
                    className={`w-full py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                      formData.importSource === 'github'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : isDark ? 'bg-white/5 hover:bg-white/10 text-white/70 border border-white/10' : 'bg-slate-100 hover:bg-slate-200 text-neutral-600 border border-slate-200'
                    }`}
                  >
                    {formData.importSource === 'github' ? (
                      <span className="flex items-center justify-center gap-1"><Check className="w-3 h-3" /> Connected</span>
                    ) : 'Connect & Import'}
                  </button>
                </div>
              </div>

              {/* LinkedIn Card */}
              <div className={`p-5 rounded-2xl border text-left flex flex-col gap-3 transition-all ${
                formData.importSource === 'linkedin'
                  ? 'border-violet-500 bg-violet-500/5'
                  : isDark ? 'border-white/8 bg-white/[0.02] hover:bg-white/5' : 'border-black/5 bg-white hover:bg-slate-50'
              }`}>
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-[#0077b5] text-white shrink-0">
                    <LinkedInIcon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold">Connect LinkedIn</h4>
                    <p className={`text-[10px] mt-1 leading-relaxed ${isDark ? 'text-slate-400' : 'text-neutral-500'}`}>
                      Import work timeline history, titles, endorsements, and your current bio.
                    </p>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <input
                    type="url"
                    value={formData.linkedinUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, linkedinUrl: e.target.value }))}
                    placeholder="https://linkedin.com/in/username"
                    className={`w-full px-3 py-2 rounded-lg border text-[11px] font-medium focus:ring-1 focus:ring-violet-500 focus:outline-none ${
                      isDark ? 'bg-white/5 border-white/10 text-white placeholder-white/20' : 'bg-slate-50 border-slate-200 text-neutral-900'
                    }`}
                  />
                  <button
                    onClick={() => {
                      if (!formData.linkedinUrl) return;
                      setFormData(prev => ({ ...prev, importSource: 'linkedin' }));
                      confetti({ particleCount: 30, spread: 40 });
                      showToast('LinkedIn profile URL saved!', 'success');
                    }}
                    className={`w-full py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                      formData.importSource === 'linkedin'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : isDark ? 'bg-white/5 hover:bg-white/10 text-white/70 border border-white/10' : 'bg-slate-100 hover:bg-slate-200 text-neutral-600 border border-slate-200'
                    }`}
                  >
                    {formData.importSource === 'linkedin' ? (
                      <span className="flex items-center justify-center gap-1"><Check className="w-3 h-3" /> Saved</span>
                    ) : 'Save LinkedIn URL'}
                  </button>
                </div>
              </div>

            </div>

            {/* Portfolio URL */}
            <div className="space-y-1.5">
              <label className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-neutral-400'}`}>Portfolio / Personal Website</label>
              <input
                type="url"
                value={formData.portfolioUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, portfolioUrl: e.target.value }))}
                placeholder="https://yourportfolio.com"
                className={inputClass}
              />
            </div>

            {/* Resume upload panel */}
            <div
              className={`p-8 rounded-2xl border border-dashed text-center space-y-4 cursor-pointer transition-all group ${
                formData.resumeName
                  ? 'border-emerald-500/50 bg-emerald-500/5'
                  : isDark ? 'border-white/10 bg-white/[0.02] hover:border-violet-500 hover:bg-violet-500/5' : 'border-black/10 bg-white hover:border-violet-500 hover:bg-violet-50'
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".pdf,.docx,.doc"
                onChange={handleFileUpload}
              />

              <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto transition-all ${
                isDark ? 'bg-violet-500/10 text-violet-400 group-hover:bg-violet-500/20' : 'bg-violet-100 text-violet-600 group-hover:bg-violet-200'
              }`}>
                <Upload className="w-5 h-5" />
              </div>

              <div>
                <h4 className="text-xs font-bold">Drag & Drop Resume / CV</h4>
                <p className={`text-[10px] mt-1 ${isDark ? 'text-slate-400' : 'text-neutral-500'}`}>
                  PDF, DOCX up to 10MB — AI extracts skills, experience & bio automatically
                </p>
              </div>

              {formData.resumeName && (
                <div className="flex items-center justify-center gap-1.5 text-xs text-emerald-400 font-bold bg-emerald-500/10 py-2 px-4 rounded-xl w-fit mx-auto border border-emerald-500/20">
                  <FileCheck className="w-4 h-4" />
                  <span>{formData.resumeName} — 98% parsed</span>
                </div>
              )}
            </div>

            {/* Skip hint */}
            <p className={`text-[10px] text-center ${isDark ? 'text-slate-500' : 'text-neutral-400'}`}>
              All steps are optional. You can skip any import and fill your profile manually.
            </p>
          </div>
        );

      // ═══ STEP 2: CATEGORY & RATE ═══
      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Specialization & Rates</h2>
              <p className={`text-sm mt-1.5 ${isDark ? 'text-slate-400' : 'text-neutral-500'}`}>
                Select your primary sector, experience level, and configure your target freelance billing rate.
              </p>
            </div>

            {/* Primary Sector Selection */}
            <div className="space-y-2">
              <label className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-neutral-400'}`}>Career Category</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.keys(ROLE_TEMPLATES).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        specialization: cat,
                        skills: ROLE_TEMPLATES[cat].skills.slice(0, 5),
                        title: ROLE_TEMPLATES[cat].titleSuggestions[0]
                      }));
                    }}
                    className={`p-4 rounded-xl border text-left transition-all hover:scale-[1.01] ${
                      formData.specialization === cat
                        ? 'border-violet-500 bg-violet-500/8 ring-1 ring-violet-500/30'
                        : isDark ? 'border-white/8 bg-white/[0.02] hover:bg-white/5 hover:border-white/15' : 'border-black/5 bg-white hover:bg-slate-50 hover:border-black/10'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold">{cat}</span>
                      <span className="text-[9px] text-emerald-400 font-bold bg-emerald-400/10 px-1.5 py-0.5 rounded-full">
                        {ROLE_TEMPLATES[cat].demand}% Demand
                      </span>
                    </div>
                    <p className={`text-[9px] mt-1 ${isDark ? 'text-slate-400' : 'text-neutral-500'}`}>Avg Rate: ${ROLE_TEMPLATES[cat].avgRate}/hr</p>
                    {formData.specialization === cat && (
                      <div className="flex items-center gap-1 mt-2 text-[9px] text-violet-400 font-bold">
                        <Check className="w-3 h-3" /> Selected
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Sub specialization detail */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-neutral-400'}`}>Specialty Niche</label>
                <input
                  type="text"
                  value={formData.subRole}
                  onChange={(e) => setFormData(prev => ({ ...prev, subRole: e.target.value }))}
                  className={inputClass}
                  placeholder="e.g. Next.js performance lead"
                />
              </div>

              <div className="space-y-2">
                <label className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-neutral-400'}`}>Experience Level</label>
                <select
                  value={formData.experienceLevel}
                  onChange={(e) => setFormData(prev => ({ ...prev, experienceLevel: e.target.value }))}
                  className={selectClass}
                >
                  <option value="Junior">Junior Specialist (1-2 yrs)</option>
                  <option value="Mid">Mid Level (3-4 yrs)</option>
                  <option value="Senior">Senior Specialist (5-8 yrs)</option>
                  <option value="Lead">Principal / Lead (8+ yrs)</option>
                </select>
              </div>
            </div>

            {/* Billing Rate Slider */}
            <div className={`p-5 rounded-xl border space-y-4 ${cardTheme}`}>
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-xs font-bold">Target Hourly Billing Rate</h4>
                  <p className={`text-[10px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-neutral-500'}`}>
                    Adjust based on your market expectations and experience.
                  </p>
                </div>
                <div className="text-xl font-black text-violet-400">${formData.hourlyRate}/hr</div>
              </div>

              <input
                type="range"
                min="15"
                max="250"
                value={formData.hourlyRate}
                onChange={(e) => setFormData(prev => ({ ...prev, hourlyRate: parseInt(e.target.value) }))}
                className="w-full accent-violet-500 h-1.5 rounded-lg cursor-pointer"
              />

              <div className="flex justify-between text-[10px] text-slate-400">
                <span>$15 Entry</span>
                <span>$250 Expert</span>
              </div>

              <div className={`flex items-start gap-1.5 text-[10px] font-medium pt-2 border-t ${isDark ? 'border-white/5 text-slate-400' : 'border-slate-100 text-neutral-500'}`}>
                <Info className="w-3.5 h-3.5 text-violet-400 shrink-0 mt-0.5" />
                <span>{currentTemplate.trends}</span>
              </div>
            </div>

          </div>
        );

      // ═══ STEP 3: SKILLS ═══
      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Skills Intelligence</h2>
              <p className={`text-sm mt-1.5 ${isDark ? 'text-slate-400' : 'text-neutral-500'}`}>
                Manage your core developer stack. Adding complementary skills increases marketplace SEO visibility by up to 40%.
              </p>
            </div>

            {/* Input Stack */}
            <div className="space-y-2">
              <label className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-neutral-400'}`}>Add Technical Skills</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={skillSearch}
                  onChange={(e) => setSkillSearch(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSkill(skillSearch); } }}
                  className={`${inputClass} flex-1`}
                  placeholder="e.g. PyTorch, Docker, Kubernetes... (Enter to add)"
                />
                <motion.button
                  onClick={() => handleAddSkill(skillSearch)}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-violet-600/20"
                >
                  Add
                </motion.button>
              </div>
              <FieldError message={fieldErrors.skills} />
            </div>

            {/* Selected Tags */}
            <div className="flex flex-wrap gap-2">
              {formData.skills.map((skill) => (
                <motion.div
                  key={skill}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-violet-500/10 border border-violet-500/25 text-violet-300"
                >
                  <span>{skill}</span>
                  <button
                    onClick={() => handleRemoveSkill(skill)}
                    className="hover:text-white text-violet-400 transition-colors ml-0.5 leading-none"
                  >
                    ×
                  </button>
                </motion.div>
              ))}
              {formData.skills.length === 0 && (
                <p className={`text-[11px] italic ${isDark ? 'text-slate-500' : 'text-neutral-400'}`}>
                  No skills added yet. Type above and press Enter or click Add.
                </p>
              )}
            </div>

            {/* Recommended Skills */}
            <div className={`p-5 rounded-xl border space-y-3 ${cardTheme}`}>
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                  Suggested Complementary Tech
                </h4>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${isDark ? 'bg-violet-500/10 text-violet-400' : 'bg-violet-100 text-violet-600'}`}>
                  AI-powered
                </span>
              </div>
              <p className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-neutral-500'}`}>Based on your selections, we recommend adding:</p>

              <div className="flex flex-wrap gap-1.5">
                {getComplementSuggestions().map((s) => (
                  <button
                    key={s}
                    onClick={() => handleAddSkill(s)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all hover:scale-[1.02] ${
                      isDark ? 'border-white/10 hover:bg-white/8 hover:border-violet-500/30 text-slate-300' : 'border-black/10 hover:bg-violet-50 hover:border-violet-200 text-neutral-600'
                    }`}
                  >
                    + {s}
                  </button>
                ))}
              </div>

              <div className={`pt-2 border-t text-[9px] flex items-center gap-1.5 font-semibold ${isDark ? 'border-white/5 text-slate-400' : 'border-slate-100 text-neutral-500'}`}>
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Adding advanced backend and container tools increases client response rates by 14%.</span>
              </div>
            </div>

          </div>
        );

      // ═══ STEP 4: PROFESSIONAL TITLE ═══
      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">AI-Assisted Positioning Engine</h2>
              <p className={`text-sm mt-1.5 ${isDark ? 'text-slate-400' : 'text-neutral-500'}`}>
                Your professional title dictates how search engines index your profile. Let our engine draft a high-ranking, SEO-optimized title.
              </p>
            </div>

            {/* Current Input */}
            <div className="space-y-2">
              <label className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-neutral-400'}`}>Professional Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, title: e.target.value }));
                  if (fieldErrors.title && e.target.value.length >= 5) {
                    setFieldErrors(prev => ({ ...prev, title: undefined }));
                  }
                }}
                className={`${inputClass} ${fieldErrors.title ? 'border-red-500/50 ring-1 ring-red-500/30' : ''}`}
                placeholder="e.g. Senior Frontend Architect"
              />
              <FieldError message={fieldErrors.title} />
            </div>

            {/* AI Suggestion Box */}
            <div className={`p-5 rounded-xl border space-y-4 ${cardTheme}`}>
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-bold flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-violet-400" />
                  <span>AI Suggestions for your stack</span>
                </h4>
                <span className="text-[10px] text-emerald-400 font-bold bg-emerald-400/10 px-2 py-0.5 rounded-full border border-emerald-400/20">
                  SEO Optimized
                </span>
              </div>

              <div className="space-y-2">
                {currentTemplate.titleSuggestions.map((sug) => (
                  <button
                    key={sug}
                    onClick={() => {
                      setFormData(prev => ({ ...prev, title: sug }));
                      confetti({ particleCount: 15, spread: 30 });
                      if (fieldErrors.title) setFieldErrors(prev => ({ ...prev, title: undefined }));
                    }}
                    className={`w-full p-3 rounded-lg border text-left text-xs font-bold transition-all flex justify-between items-center hover:scale-[1.005] ${
                      formData.title === sug
                        ? 'border-violet-500 bg-violet-500/8 ring-1 ring-violet-500/20'
                        : isDark ? 'border-white/5 hover:bg-white/5 bg-white/[0.02]' : 'border-black/5 hover:bg-slate-50 bg-white'
                    }`}
                  >
                    <span>{sug}</span>
                    <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full ${
                      scoreTitle(sug) >= 90 ? 'bg-emerald-400/10 text-emerald-400' : 'bg-slate-400/10 text-slate-400'
                    }`}>
                      Rank: {scoreTitle(sug)}%
                    </span>
                  </button>
                ))}
              </div>

              {/* Title SEO scoring */}
              <div className={`pt-2 border-t flex justify-between text-[10px] font-medium ${isDark ? 'border-white/5 text-slate-400' : 'border-slate-100 text-neutral-500'}`}>
                <span>Discoverability score:</span>
                <span className="font-bold text-violet-400">{scoreTitle(formData.title)}/100</span>
              </div>
            </div>

          </div>
        );

      // ═══ STEP 5: EXPERIENCE TIMELINE ═══
      case 5:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Timeline-Based History Builder</h2>
              <p className={`text-sm mt-1.5 ${isDark ? 'text-slate-400' : 'text-neutral-500'}`}>
                Add your experience milestones. Use the AI Sparkles engine to automatically write quantified, metrics-driven bullet points.
              </p>
            </div>

            {/* Existing Experiences */}
            <div className="space-y-4">
              {formData.experience.map((exp, idx) => (
                <div key={exp.id} className={`p-4 rounded-xl border relative space-y-3 ${cardTheme}`}>
                  <button
                    onClick={() => setFormData(prev => ({ ...prev, experience: prev.experience.filter(e => e.id !== exp.id) }))}
                    className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <div>
                    <div className="text-xs font-black">{exp.role}</div>
                    <div className={`text-[10px] mt-0.5 font-semibold ${isDark ? 'text-slate-400' : 'text-neutral-500'}`}>
                      {exp.company} · {exp.duration}
                    </div>
                  </div>

                  <div className="space-y-2">
                    {exp.bullets.map((b, bIdx) => (
                      <div key={bIdx} className={`flex gap-2 items-start p-2.5 rounded-lg border ${isDark ? 'bg-black/20 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                        <p className={`text-[10px] leading-relaxed flex-1 ${isDark ? 'text-slate-300' : 'text-neutral-600'}`}>{b}</p>
                        <button
                          onClick={() => handleOptimizeBullet(idx, bIdx)}
                          disabled={aiOptimizing}
                          className="text-[9px] font-bold text-violet-400 hover:text-violet-300 flex items-center gap-1 shrink-0 p-1.5 bg-violet-500/10 rounded-lg border border-violet-500/20 transition-all disabled:opacity-50"
                        >
                          <Sparkles className={`w-3 h-3 ${aiOptimizing ? 'animate-spin' : 'animate-pulse'}`} />
                          <span>{aiOptimizing ? '...' : 'AI'}</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Add New Experience */}
            <div className={`p-5 rounded-xl border space-y-4 ${cardTheme}`}>
              <h4 className="text-xs font-bold">Add New Work Experience</h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Company"
                  value={tempExp.company}
                  onChange={(e) => setTempExp(prev => ({ ...prev, company: e.target.value }))}
                  className={inputClass}
                />
                <input
                  type="text"
                  placeholder="Role / Title"
                  value={tempExp.role}
                  onChange={(e) => setTempExp(prev => ({ ...prev, role: e.target.value }))}
                  className={inputClass}
                />
                <input
                  type="text"
                  placeholder="Duration (e.g. 2022-2024)"
                  value={tempExp.duration}
                  onChange={(e) => setTempExp(prev => ({ ...prev, duration: e.target.value }))}
                  className={inputClass}
                />
              </div>

              <textarea
                placeholder="Describe what you accomplished — our AI will quantify and optimize it..."
                value={tempExp.bullet}
                onChange={(e) => setTempExp(prev => ({ ...prev, bullet: e.target.value }))}
                rows={2}
                className={`${inputClass} resize-none`}
              />

              <button
                onClick={() => {
                  if (!tempExp.company || !tempExp.role || !tempExp.bullet) {
                    showToast('Please fill in Company, Role, and at least one accomplishment.', 'error');
                    return;
                  }
                  const newExp = {
                    id: 'exp-' + Date.now(),
                    company: tempExp.company,
                    role: tempExp.role,
                    duration: tempExp.duration || '2024',
                    bullets: [tempExp.bullet]
                  };
                  setFormData(prev => ({ ...prev, experience: [...prev.experience, newExp] }));
                  setTempExp({ company: '', role: '', duration: '', bullet: '' });
                  showToast('Experience added!', 'success');
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold border transition-all hover:scale-[1.01] ${
                  isDark ? 'bg-white/5 hover:bg-white/10 text-white border-white/10' : 'bg-slate-100 hover:bg-slate-200 text-neutral-900 border-slate-200'
                }`}
              >
                + Save Experience
              </button>
            </div>

          </div>
        );

      // ═══ STEP 6: EDUCATION ═══
      case 6:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Credentials & Education</h2>
              <p className={`text-sm mt-1.5 ${isDark ? 'text-slate-400' : 'text-neutral-500'}`}>
                Log your degrees, credentials, and certified qualifications. Verified credentials increase hire rates by 23%.
              </p>
            </div>

            {/* University List */}
            <div className="space-y-3">
              {formData.education.map((edu) => (
                <div key={edu.id} className={`p-4 rounded-xl border flex justify-between items-center ${cardTheme}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 text-xs font-black">
                      {edu.school.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold">{edu.school}</h4>
                      <p className={`text-[10px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-neutral-500'}`}>
                        {edu.degree} · Class of {edu.year}
                        {edu.gpa && ` · GPA ${edu.gpa}`}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setFormData(prev => ({ ...prev, education: prev.education.filter(e => e.id !== edu.id) }))}
                    className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Education Form */}
            <div className={`p-5 rounded-xl border space-y-4 ${cardTheme}`}>
              <h4 className="text-xs font-bold">Add Academic Milestone</h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input type="text" placeholder="School / University" value={tempEdu.school}
                  onChange={(e) => setTempEdu(prev => ({ ...prev, school: e.target.value }))} className={inputClass} />
                <input type="text" placeholder="Degree (e.g. B.S. in CS)" value={tempEdu.degree}
                  onChange={(e) => setTempEdu(prev => ({ ...prev, degree: e.target.value }))} className={inputClass} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input type="text" placeholder="Graduation Year" value={tempEdu.year}
                  onChange={(e) => setTempEdu(prev => ({ ...prev, year: e.target.value }))} className={inputClass} />
                <input type="text" placeholder="GPA (optional)" value={tempEdu.gpa}
                  onChange={(e) => setTempEdu(prev => ({ ...prev, gpa: e.target.value }))} className={inputClass} />
              </div>

              <button onClick={handleAddEdu} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold border transition-all hover:scale-[1.01] ${
                isDark ? 'bg-white/5 hover:bg-white/10 text-white border-white/10' : 'bg-slate-100 hover:bg-slate-200 text-neutral-900 border-slate-200'
              }`}>
                + Add Academic Track
              </button>
            </div>

            {/* Certifications Block */}
            <div className={`space-y-4 pt-4 border-t ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
              <h4 className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-neutral-400'}`}>Certifications & Badges</h4>

              <div className="space-y-2">
                {formData.certifications.map((cert) => (
                  <div key={cert.id} className={`flex justify-between items-center p-3 rounded-lg border text-xs ${
                    isDark ? 'border-white/5 bg-black/20' : 'border-slate-100 bg-slate-50'
                  }`}>
                    <div className="flex items-center gap-2">
                      <Award className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <div>
                        <span className="font-bold">{cert.name}</span>
                        <span className={`text-[10px] ml-2 ${isDark ? 'text-slate-400' : 'text-neutral-500'}`}>({cert.issuer})</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setFormData(prev => ({ ...prev, certifications: prev.certifications.filter(c => c.id !== cert.id) }))}
                      className="p-1 text-slate-400 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input type="text" placeholder="Certification Name" value={tempCert.name}
                  onChange={(e) => setTempCert(prev => ({ ...prev, name: e.target.value }))} className={inputClass} />
                <input type="text" placeholder="Issuing Organization" value={tempCert.issuer}
                  onChange={(e) => setTempCert(prev => ({ ...prev, issuer: e.target.value }))} className={inputClass} />
                <button
                  onClick={() => {
                    if (!tempCert.name) { showToast('Please enter the certification name.', 'error'); return; }
                    setFormData(prev => ({
                      ...prev,
                      certifications: [...prev.certifications, { id: 'cert-' + Date.now(), name: tempCert.name, issuer: tempCert.issuer, year: new Date().getFullYear().toString() }]
                    }));
                    setTempCert({ name: '', issuer: '', year: '' });
                    showToast('Certification added!', 'success');
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all hover:scale-[1.01] ${
                    isDark ? 'bg-white/5 hover:bg-white/10 text-white border-white/10' : 'bg-slate-100 hover:bg-slate-200 text-neutral-900 border-slate-200'
                  }`}
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
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Global Communication Portfolio</h2>
              <p className={`text-sm mt-1.5 ${isDark ? 'text-slate-400' : 'text-neutral-500'}`}>
                Configure your fluency levels. Clients prioritize developers with verified written and oral communication capabilities.
              </p>
            </div>

            {/* Current Languages */}
            <div className="flex flex-wrap gap-2.5">
              {formData.languages.map((lang) => (
                <div
                  key={lang.code}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-bold ${
                    isDark ? 'border-white/8 bg-black/30' : 'border-slate-200 bg-white'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5 text-violet-400" />
                  <span>{lang.name}</span>
                  <span className="text-violet-400">· {lang.fluency}</span>
                  <button onClick={() => handleRemoveLang(lang.code)} className="text-slate-400 hover:text-red-400 transition-colors ml-0.5">
                    ×
                  </button>
                </div>
              ))}
              {formData.languages.length === 0 && (
                <p className={`text-[11px] italic ${isDark ? 'text-slate-500' : 'text-neutral-400'}`}>No languages added yet.</p>
              )}
            </div>

            {/* Add Language */}
            <div className={`p-5 rounded-xl border space-y-4 ${cardTheme}`}>
              <h4 className="text-xs font-bold">Register Fluent Languages</h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <select
                  value={tempLang.code}
                  onChange={(e) => {
                    const dict = { en: 'English', es: 'Spanish', fr: 'French', de: 'German', ja: 'Japanese', zh: 'Chinese', pt: 'Portuguese', ar: 'Arabic', ru: 'Russian' };
                    setTempLang(prev => ({ ...prev, code: e.target.value, name: dict[e.target.value] || 'English' }));
                  }}
                  className={selectClass}
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                  <option value="ja">Japanese</option>
                  <option value="zh">Chinese</option>
                  <option value="pt">Portuguese</option>
                  <option value="ar">Arabic</option>
                  <option value="ru">Russian</option>
                </select>

                <select
                  value={tempLang.fluency}
                  onChange={(e) => setTempLang(prev => ({ ...prev, fluency: e.target.value }))}
                  className={selectClass}
                >
                  <option value="Basic">Basic Communication</option>
                  <option value="Conversational">Conversational</option>
                  <option value="Fluent">Fluent</option>
                  <option value="Native / Bilingual">Native / Bilingual</option>
                </select>

                <button
                  onClick={handleAddLang}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all hover:scale-[1.01] ${
                    isDark ? 'bg-white/5 hover:bg-white/10 text-white border-white/10' : 'bg-slate-100 hover:bg-slate-200 text-neutral-900 border-slate-200'
                  }`}
                >
                  + Add Language
                </button>
              </div>
            </div>

          </div>
        );

      // ═══ STEP 8: BIO STUDIO ═══
      case 8:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">AI Profile Writing Studio</h2>
              <p className={`text-sm mt-1.5 ${isDark ? 'text-slate-400' : 'text-neutral-500'}`}>
                Refine your summary narrative. Choose a tone and run the AI optimizer to raise your discoverability and client response rate.
              </p>
            </div>

            {/* Bio textarea */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-neutral-400'}`}>Professional Bio</label>
                <span className={`text-[10px] font-medium ${
                  formData.bio.length > 500 ? 'text-red-400' : isDark ? 'text-slate-500' : 'text-neutral-400'
                }`}>
                  {formData.bio.length} / 600 chars
                </span>
              </div>
              <textarea
                value={formData.bio}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, bio: e.target.value }));
                  if (fieldErrors.bio && e.target.value.length >= 20) {
                    setFieldErrors(prev => ({ ...prev, bio: undefined }));
                  }
                }}
                maxLength={600}
                rows={5}
                className={`${inputClass} resize-none leading-relaxed ${fieldErrors.bio ? 'border-red-500/50 ring-1 ring-red-500/30' : ''}`}
                placeholder="Write or generate a professional summary about your engineering accomplishments..."
              />
              <FieldError message={fieldErrors.bio} />
            </div>

            {/* AI Assistant Toolkit */}
            <div className={`p-5 rounded-xl border space-y-4 ${cardTheme}`}>
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-bold flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-violet-400" />
                  <span>AI Copilot Engine</span>
                </h4>

                <select
                  value={formData.bioTone}
                  onChange={(e) => setFormData(prev => ({ ...prev, bioTone: e.target.value }))}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${
                    isDark ? 'bg-[#0b0f19] border-white/10 text-white' : 'bg-white border-black/10 text-neutral-900'
                  }`}
                >
                  <option value="professional">Professional Tone</option>
                  <option value="technical">Technical Focus</option>
                  <option value="narrative">Personal Narrative</option>
                  <option value="minimal">Minimalist</option>
                </select>
              </div>

              <motion.button
                onClick={handleGenerateBio}
                disabled={aiOptimizing}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className="shimmer-btn w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition-all shadow-md shadow-violet-500/20 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <Sparkles className={`w-3.5 h-3.5 ${aiOptimizing ? 'animate-spin' : ''}`} />
                <span>{aiOptimizing ? 'Rewriting Bio with AI...' : 'Generate with AI'}</span>
              </motion.button>

              <div className={`grid grid-cols-2 gap-4 pt-3 border-t ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                <div>
                  <span className={`text-[10px] font-semibold block mb-0.5 ${isDark ? 'text-slate-400' : 'text-neutral-500'}`}>Readability Index</span>
                  <span className="text-xs font-bold text-white">Grade 10 (Optimal)</span>
                </div>
                <div>
                  <span className={`text-[10px] font-semibold block mb-0.5 ${isDark ? 'text-slate-400' : 'text-neutral-500'}`}>Attractiveness Score</span>
                  <span className="text-xs font-bold text-emerald-400">94% Rank Match</span>
                </div>
              </div>
            </div>

          </div>
        );

      // ═══ STEP 9: IDENTITY & PHOTO ═══
      case 9:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Identity & Professional Photo</h2>
              <p className={`text-sm mt-1.5 ${isDark ? 'text-slate-400' : 'text-neutral-500'}`}>
                Upload a professional headshot, verify your phone number, and confirm your location to activate your verified identity seal.
              </p>
            </div>

            {/* Split layout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

              {/* Photo Upload Box */}
              <div className={`p-5 rounded-xl border space-y-4 text-center ${cardTheme}`}>
                <label className={`text-[11px] font-bold uppercase tracking-wider block text-left ${isDark ? 'text-slate-400' : 'text-neutral-400'}`}>
                  Headshot Image
                </label>

                <div
                  onClick={() => photoInputRef.current?.click()}
                  className={`w-28 h-28 rounded-full border-2 border-dashed hover:border-violet-500 cursor-pointer mx-auto flex items-center justify-center overflow-hidden group relative transition-all ${
                    isDark ? 'border-white/20 bg-black/40 hover:bg-violet-500/5' : 'border-slate-300 bg-slate-50 hover:bg-violet-50'
                  }`}
                >
                  <input
                    type="file"
                    ref={photoInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleSelectPhoto}
                  />
                  {formData.photoUrl ? (
                    <>
                      <img src={formData.photoUrl} alt="Avatar" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] font-bold text-white transition-opacity rounded-full">
                        Change
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-1.5 text-slate-400 group-hover:text-violet-400 transition-colors">
                      <CameraIcon className="w-7 h-7" />
                      <span className="text-[9px] font-bold">Upload Photo</span>
                    </div>
                  )}
                </div>

                {isCropping && (
                  <div className="space-y-2 p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
                    <div className="text-[10px] text-amber-400 font-semibold">📐 Confirm crop alignment...</div>
                    <button
                      onClick={handleCropSave}
                      className="w-full px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-[10px] font-bold transition-all"
                    >
                      Save & Upload
                    </button>
                  </div>
                )}

                {/* Photo analysis */}
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div className={`border rounded-lg p-2 ${isDark ? 'border-white/5 bg-black/20' : 'border-slate-100 bg-slate-50'}`}>
                    <span className={`block font-semibold mb-0.5 ${isDark ? 'text-slate-400' : 'text-neutral-500'}`}>Lighting</span>
                    <span className={`font-bold ${lightingScore ? 'text-emerald-400' : isDark ? 'text-slate-500' : 'text-neutral-400'}`}>
                      {lightingScore ? `${lightingScore}%` : 'Pending'}
                    </span>
                  </div>
                  <div className={`border rounded-lg p-2 ${isDark ? 'border-white/5 bg-black/20' : 'border-slate-100 bg-slate-50'}`}>
                    <span className={`block font-semibold mb-0.5 ${isDark ? 'text-slate-400' : 'text-neutral-500'}`}>Professionalism</span>
                    <span className={`font-bold ${photoScore ? 'text-emerald-400' : isDark ? 'text-slate-500' : 'text-neutral-400'}`}>
                      {photoScore ? `${photoScore}/100` : 'Pending'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Verification Box */}
              <div className={`p-5 rounded-xl border space-y-5 ${cardTheme}`}>
                <label className={`text-[11px] font-bold uppercase tracking-wider block ${isDark ? 'text-slate-400' : 'text-neutral-400'}`}>
                  Identity Verification
                </label>

                {/* Phone Setup */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-bold ${isDark ? 'text-slate-400' : 'text-neutral-500'}`}>
                      📱 Mobile Phone Verification
                    </span>
                    {formData.phoneVerified && (
                      <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">
                        <Check className="w-3 h-3" /> Verified
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      disabled={formData.phoneVerified}
                      className={`${inputClass} flex-1 ${formData.phoneVerified ? 'opacity-60 cursor-not-allowed' : ''}`}
                    />
                    {!formData.phoneVerified && (
                      <button
                        onClick={handleSendSMS}
                        className={`shrink-0 px-3 py-2 rounded-xl text-[10px] font-bold border transition-all ${
                          isDark ? 'bg-white/5 border-white/10 hover:bg-white/10 text-white' : 'bg-slate-100 border-slate-200 hover:bg-slate-200 text-neutral-700'
                        }`}
                      >
                        {smsSent ? 'Resend' : 'Send Code'}
                      </button>
                    )}
                  </div>

                  {/* Demo badge */}
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-[9px] font-bold ${
                    isDark ? 'bg-amber-400/5 border-amber-400/20 text-amber-400' : 'bg-amber-50 border-amber-200 text-amber-600'
                  }`}>
                    <AlertTriangle className="w-3 h-3 shrink-0" />
                    <span>Demo Mode — verification code is <strong>123456</strong>. Real SMS integration available in production.</span>
                  </div>
                </div>

                {/* SMS Code Input */}
                {smsSent && (
                  <div className={`space-y-2 p-3 rounded-lg border ${isDark ? 'bg-black/20 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                    <span className={`text-[9px] font-bold block ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>Enter the 6-digit code:</span>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. 123456"
                        maxLength={6}
                        value={smsCode}
                        onChange={(e) => setSmsCode(e.target.value)}
                        className={`${inputClass} flex-1`}
                      />
                      <button
                        onClick={handleVerifySMS}
                        className="px-3 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-[10px] font-bold transition-all"
                      >
                        Verify
                      </button>
                    </div>
                    {smsError && <div className="text-[9px] text-red-400 font-semibold">{smsError}</div>}
                  </div>
                )}

                {/* Address / Location */}
                <div className="space-y-2">
                  <span className={`text-[10px] font-bold ${isDark ? 'text-slate-400' : 'text-neutral-500'}`}>
                    📍 Location / City, Country
                  </span>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="e.g. San Francisco, CA, USA"
                    className={inputClass}
                  />
                </div>

                {/* Verification Checkboxes */}
                <div className={`space-y-3 pt-3 border-t ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      id="idCheck"
                      checked={formData.idVerified}
                      onChange={(e) => setFormData(prev => ({ ...prev, idVerified: e.target.checked }))}
                      className="accent-violet-600 w-3.5 h-3.5 rounded cursor-pointer"
                    />
                    <label htmlFor="idCheck" className={`text-[11px] font-medium flex items-center gap-1 cursor-pointer ${isDark ? 'text-slate-300' : 'text-neutral-700'}`}>
                      <Lock className="w-3 h-3 text-slate-400" />
                      Government ID verified (uploaded securely)
                    </label>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      id="addressCheck"
                      checked={formData.addressVerified}
                      onChange={(e) => setFormData(prev => ({ ...prev, addressVerified: e.target.checked }))}
                      className="accent-violet-600 w-3.5 h-3.5 rounded cursor-pointer"
                    />
                    <label htmlFor="addressCheck" className={`text-[11px] font-medium cursor-pointer ${isDark ? 'text-slate-300' : 'text-neutral-700'}`}>
                      Address verified via utility document
                    </label>
                  </div>
                </div>
              </div>

            </div>

            {/* Trust Shield Banner */}
            <div className="p-4 rounded-xl bg-sky-500/8 border border-sky-500/20 flex gap-3 text-xs text-sky-300 leading-relaxed font-medium">
              <ShieldCheck className="w-6 h-6 text-sky-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-white mb-0.5">Trust & Security Shield</span>
                Your details are stored in AES-256 encrypted cloud infrastructure. Client directories prioritize verified identity profiles over anonymous profiles — maximizing your hiring rate by 2.4×.
              </div>
            </div>

          </div>
        );

      default:
        return null;
    }
  }

  function getComplementSuggestions() {
    const list = [];
    formData.skills.forEach(skill => {
      if (SUGGESTED_COMPLEMENTS[skill]) {
        SUGGESTED_COMPLEMENTS[skill].forEach(comp => {
          if (!formData.skills.includes(comp) && !list.includes(comp)) {
            list.push(comp);
          }
        });
      }
    });
    if (list.length === 0) {
      return ['GraphQL', 'Docker', 'Kubernetes', 'FastAPI', 'Redis'];
    }
    return list;
  }
}

// ─── Small Inline SVG Mocks ───────────────────────────────────────────────────
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

function CameraIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}
