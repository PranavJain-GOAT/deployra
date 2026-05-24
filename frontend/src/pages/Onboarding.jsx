import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Check, Upload, ChevronRight, ChevronLeft, ShieldCheck,
  Zap, Globe, Trash2, MapPin, Eye, AlertCircle, RefreshCw,
  FileCheck, Moon, Sun, Cloud, Lock, Clock
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

export default function Onboarding() {
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const { isDark } = useTheme();
  const { uploadAvatar, updateProfile, isUploading: isProfileUploading } = useProfile();

  // Onboarding Wizard steps (1 to 9)
  const [step, setStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [cloudSynced, setCloudSynced] = useState(true);

  // Form State
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
    address: 'San Francisco, CA, USA',
    photoUrl: '',
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

  // Sync state with backend preferencesJson on step transitions
  const saveProgress = async (nextStep) => {
    setIsSaving(true);
    setCloudSynced(false);
    try {
      // 1. Save all details inside backend preferencesJson
      const onboardingPrefs = {
        onboardingStep: nextStep,
        onboarded: nextStep > 9,
        onboardingData: formData
      };

      await axios.patch(`${API_URL}/users/preferences`, { preferences: onboardingPrefs });

      // 2. If changing photo, name, or country, patch core user fields
      if (nextStep > 1) {
        const updatePayload = {};
        if (formData.phone) updatePayload.country = formData.address.split(',').pop().trim();
        await axios.patch(`${API_URL}/users/me`, updatePayload);
      }

      setCloudSynced(true);
    } catch (err) {
      console.error('Failed to sync progress:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Check for existing saved onboarding data
  useEffect(() => {
    const fetchExistingProgress = async () => {
      try {
        const res = await axios.get(`${API_URL}/users/preferences`);
        if (res.data?.success && res.data?.data) {
          const prefs = res.data.data;
          if (prefs.onboardingData) {
            setFormData(prev => ({
              ...prev,
              ...prefs.onboardingData
            }));
          }
          if (prefs.onboardingStep) {
            setStep(prefs.onboardingStep);
          }
        }
      } catch (_) {}
    };
    fetchExistingProgress();
  }, []);

  const handleNext = () => {
    if (step < 9) {
      const next = step + 1;
      setStep(next);
      saveProgress(next);
    } else {
      // Complete Onboarding
      handleComplete();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleComplete = async () => {
    setIsSaving(true);
    try {
      // Mark as fully onboarded
      const onboardingPrefs = {
        onboardingStep: 10,
        onboarded: true,
        onboardingData: formData
      };

      await axios.patch(`${API_URL}/users/preferences`, { preferences: onboardingPrefs });

      // Update name/role
      await axios.patch(`${API_URL}/users/me`, {
        role: 'DEVELOPER'
      });

      // Confetti fire
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }
      });

      setTimeout(() => {
        navigate('/developer');
      }, 1500);
    } catch (err) {
      console.error('Error completing onboarding:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Step 1: Mock file/resume upload parsing
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    simulateResumeParsing(file.name);
  };

  const simulateResumeParsing = (fileName) => {
    setIsParsing(true);
    setParseProgress(5);
    setParseStatus('Initializing secure connection...');

    const intervals = [
      { progress: 20, status: 'Reading file metadata and format logs...' },
      { progress: 45, status: 'Analyzing career timeline and milestones...' },
      { progress: 75, status: 'Extracting key technical skills and expertise...' },
      { progress: 95, status: 'Synthesizing professional background summary...' },
      { progress: 100, status: 'AI Enrichment complete!' }
    ];

    intervals.forEach((stepItem, idx) => {
      setTimeout(() => {
        setParseProgress(stepItem.progress);
        setParseStatus(stepItem.status);
        if (stepItem.progress === 100) {
          setTimeout(() => {
            // Apply mock parsed data
            setFormData(prev => ({
              ...prev,
              resumeName: fileName,
              importSource: 'resume',
              title: 'Lead Frontend Software Engineer',
              skills: ['React', 'Next.js', 'TypeScript', 'Node.js', 'PostgreSQL', 'CSS effects', 'TailwindCSS'],
              bio: 'Performance-driven frontend leader with 5+ years of experience designing scalable dashboard ecosystems. Specialized in edge computing and modern UI rendering pipelines.',
              experience: [
                {
                  id: 'exp-parsed-1',
                  company: 'Linear Corp',
                  role: 'Frontend Lead',
                  duration: '2022 - 2024',
                  bullets: [
                    'Architected next-gen keyboard navigation components, increasing average customer speed index by 40%.',
                    'Spearheaded transition from legacy state container to optimized reactive hooks.'
                  ]
                }
              ]
            }));
            setIsParsing(false);
          }, 600);
        }
      }, (idx + 1) * 800);
    });
  };

  // Step 1: Github mock import
  const handleGithubConnect = () => {
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
          setParseStatus('Import complete! Extracted metadata successfully.');
          setTimeout(() => {
            setFormData(prev => ({
              ...prev,
              githubUrl: 'https://github.com/' + (user?.name?.toLowerCase().replace(' ', '') || 'dev'),
              importSource: 'github',
              skills: ['JavaScript', 'TypeScript', 'HTML5', 'Next.js', 'Git', 'Webpack', 'Docker']
            }));
            setIsParsing(false);
          }, 600);
        }, 800);
      }, 800);
    }, 800);
  };

  // Step 3: Skill Actions
  const handleAddSkill = (skill) => {
    const trimmed = skill.trim();
    if (trimmed && !formData.skills.includes(trimmed)) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, trimmed]
      }));
      setSkillSearch('');
    }
  };

  const handleRemoveSkill = (skill) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
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
        optimized = 'Architected and deployed cloud-native dashboard modules, improving page loading performance by 36% and saving 24 hours of manual tasks weekly.';
      } else if (original.toLowerCase().includes('optimized') || original.toLowerCase().includes('speed')) {
        optimized = 'Optimized resource delivery pipeline and bundled code delivery, decreasing browser latency indices by 42% and increasing conversions by 18%.';
      } else {
        optimized = 'Spearheaded critical engineering features, raising runtime stability by 31% while decreasing memory consumption to support 15k concurrent web clients.';
      }

      const updatedExp = [...formData.experience];
      updatedExp[index].bullets[bulletIndex] = optimized;
      setFormData(prev => ({ ...prev, experience: updatedExp }));
      setAiOptimizing(false);
    }, 1200);
  };

  // Step 6: Education add
  const handleAddEdu = () => {
    if (!tempEdu.school || !tempEdu.degree) return;
    const newEdu = {
      id: 'edu-' + Date.now(),
      school: tempEdu.school,
      degree: tempEdu.degree,
      year: tempEdu.year || '2024',
      gpa: tempEdu.gpa || '4.0'
    };
    setFormData(prev => ({
      ...prev,
      education: [...prev.education, newEdu]
    }));
    setTempEdu({ school: '', degree: '', year: '', gpa: '' });
  };

  // Step 7: Language Actions
  const handleAddLang = () => {
    if (formData.languages.some(l => l.code === tempLang.code)) return;
    setFormData(prev => ({
      ...prev,
      languages: [...prev.languages, { code: tempLang.code, name: tempLang.name, fluency: tempLang.fluency }]
    }));
  };

  const handleRemoveLang = (code) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.filter(l => l.code !== code)
    }));
  };

  // Step 8: AI Bio Writer Studio
  const handleGenerateBio = () => {
    setAiOptimizing(true);
    setTimeout(() => {
      let generated = '';
      if (formData.bioTone === 'technical') {
        generated = `Advanced systems engineer with focus on ${formData.skills.slice(0, 4).join(', ')}. Expert in designing low-latency API architectures, edge caching structures, and robust client side components. Confirmed track record improving core web metrics.`;
      } else if (formData.bioTone === 'narrative') {
        generated = `I love solving hard design and coding challenges. As a ${formData.title}, I bridge the gap between complex web infrastructure and pixel-perfect design. From writing fast backend endpoints in Node.js to rendering complex visuals, I focus on shipping high-trust applications.`;
      } else if (formData.bioTone === 'minimal') {
        generated = `${formData.title} focused on ${formData.skills.slice(0, 3).join(', ')}. Building minimal, high-speed applications.`;
      } else {
        generated = `Results-oriented ${formData.title} specializing in ${formData.skills.slice(0, 4).join(', ')}. Passionate about building client experiences, orchestrating scalable workflows, and working alongside remote teams to solve real business needs.`;
      }

      setFormData(prev => ({ ...prev, bio: generated }));
      setAiOptimizing(false);
    }, 1000);
  };

  // Step 9: Image Cropper & Upload Mocks
  const handleSelectPhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCropFile(file);
    setIsCropping(true);
  };

  const handleCropSave = async () => {
    setIsCropping(false);
    // Simulate smart background cleanup and scoring
    setParseStatus('Cleaning up photo background and analyzing quality...');
    setIsParsing(true);
    
    setTimeout(async () => {
      setIsParsing(false);
      // Generate object URL for preview
      const fakeUrl = URL.createObjectURL(cropFile);
      setFormData(prev => ({ ...prev, photoUrl: fakeUrl }));
      setPhotoScore(94);
      setLightingScore(98);
      
      // Attempt backend upload if user wants real persistent CDN
      try {
        const url = await uploadAvatar(cropFile);
        if (url) {
          setFormData(prev => ({ ...prev, photoUrl: url }));
        }
      } catch (_) {}
    }, 1500);
  };

  // Step 9: Phone Verification Flow
  const handleSendSMS = () => {
    if (!formData.phone) return;
    setSmsSent(true);
    setSmsError('');
  };

  const handleVerifySMS = () => {
    if (smsCode === '123456' || smsCode.length === 6) {
      setFormData(prev => ({ ...prev, phoneVerified: true }));
      setSmsSent(false);
    } else {
      setSmsError('Invalid code. Try entering 123456');
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

  return (
    <div className={`min-h-screen ${bgTheme} flex flex-col font-sans transition-all`}>
      
      {/* ─── Top Sticky Status Header ─── */}
      <header className={`sticky top-16 z-30 h-14 border-b flex items-center justify-between px-6 backdrop-blur-xl bg-opacity-70 ${
        isDark ? 'border-white/5 bg-[#030712]' : 'border-black/5 bg-slate-50'
      }`}>
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold uppercase tracking-widest text-violet-500">Identity Builder</span>
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 opacity-40" />
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
            <Clock className="w-3.5 h-3.5" />
            <span>Est. time: {10 - step} mins remaining</span>
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
            onClick={() => navigate(user?.role === 'DEVELOPER' ? '/developer' : '/')} 
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
          
          {/* Progress Tracker Dial */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                Step {step} of 9 — {getStepName(step)}
              </span>
              <span className="text-xs font-bold text-violet-400">{progressPercent}% Completed</span>
            </div>
            
            <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-white/5 overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>

            {/* Smart psychological nudge */}
            <div className="mt-3 flex items-center gap-1 text-[10px] text-slate-400">
              <Sparkles className="w-3 h-3 text-violet-400 animate-pulse" />
              <span>You are ahead of 78% of new users. Finish this setup to achieve Elite Badge.</span>
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
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                {renderStepContent(step)}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Stepper Navigation Actions */}
          <div className="pt-8 mt-10 border-t border-slate-200/50 dark:border-white/5 flex justify-between items-center">
            <button
              onClick={handleBack}
              disabled={step === 1}
              className={`flex items-center gap-1.5 text-xs font-bold px-4 py-2.5 rounded-xl border transition-all ${
                step === 1 
                  ? 'opacity-40 cursor-not-allowed border-transparent' 
                  : isDark ? 'border-white/10 hover:bg-white/5 text-white' : 'border-black/10 hover:bg-black/5 text-neutral-900'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              onClick={handleNext}
              disabled={isParsing || isSaving}
              className="flex items-center gap-1.5 text-xs font-bold px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white transition-all shadow-lg shadow-violet-600/25 hover:shadow-violet-600/35"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Syncing...</span>
                </>
              ) : (
                <>
                  <span>{step === 9 ? 'Finish Setup' : 'Save & Continue'}</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* ================= RIGHT SIDE: Live Client Preview (5 cols) ================= */}
        <div className="lg:col-span-5 p-6 md:p-10 lg:sticky lg:top-32 h-fit flex flex-col items-center justify-start self-start space-y-6 bg-slate-100/50 dark:bg-black/10 rounded-2xl m-4 lg:m-8 border border-slate-200/30 dark:border-white/5">
          
          {/* Preview Header / Device Toggle */}
          <div className="w-full flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Live client view</span>
            </div>

            {/* Layout Toggle */}
            <div className="flex items-center gap-1 p-0.5 rounded-lg bg-slate-200 dark:bg-white/5 border border-slate-300/30 dark:border-white/5">
              <button 
                onClick={() => setPreviewTheme('light')}
                className={`p-1.5 rounded-md transition-all ${previewTheme === 'light' ? 'bg-white text-neutral-900 shadow-sm' : 'text-slate-400 hover:text-white'}`}
              >
                <Sun className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={() => setPreviewTheme('dark')}
                className={`p-1.5 rounded-md transition-all ${previewTheme === 'dark' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-neutral-900'}`}
              >
                <Moon className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* THE PREMIUM PREVIEW CARD */}
          <div className={`w-full rounded-2xl border transition-all ${
            previewTheme === 'dark' 
              ? 'bg-[#090d16] border-white/10 text-white shadow-2xl shadow-black/80' 
              : 'bg-white border-slate-200 text-neutral-900 shadow-xl'
          }`}>
            
            {/* Glowing top line */}
            <div className="h-1 w-full bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500 rounded-t-2xl" />

            {/* Card Content */}
            <div className="p-6 space-y-6">
              
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
                        {user?.name ? user.name.split(' ').map(n=>n[0]).join('').toUpperCase() : 'U'}
                      </div>
                    )}
                    <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 ring-2 ring-[#090d16] animate-pulse" />
                  </div>

                  <div>
                    <div className="flex items-center gap-1">
                      <h4 className="text-base font-bold tracking-tight">{user?.name || 'Anonymous User'}</h4>
                      {formData.idVerified && (
                        <ShieldCheck className="w-4 h-4 text-sky-400" />
                      )}
                    </div>
                    <p className={`text-xs ${previewTheme === 'dark' ? 'text-slate-400' : 'text-neutral-500'} font-medium`}>
                      {formData.title || 'Add Title...'}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1 text-[10px] text-slate-400">
                      <MapPin className="w-3 h-3" />
                      <span>{formData.address || 'Address'}</span>
                    </div>
                  </div>
                </div>

                {/* Pricing / Plan Badge */}
                <div className="text-right">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold ${
                    previewTheme === 'dark' ? 'bg-violet-500/10 text-violet-400' : 'bg-violet-50 text-violet-600'
                  }`}>
                    PRO MEMBER
                  </span>
                  <div className="text-sm font-bold mt-1.5">${formData.hourlyRate}/hr</div>
                  <div className="text-[9px] text-slate-400">Market Rate</div>
                </div>
              </div>

              {/* Bio Summary Section */}
              <div className={`p-3 rounded-xl text-xs leading-relaxed ${
                previewTheme === 'dark' ? 'bg-white/5 border border-white/5' : 'bg-slate-50 border border-slate-100'
              }`}>
                <p className={formData.bio ? '' : 'text-slate-400 italic'}>
                  {formData.bio || 'Your parsed or written bio will display here. Use step 8 to optimize tone and flow...'}
                </p>
              </div>

              {/* Skills Grid */}
              <div className="space-y-2">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Expertise tags</div>
                <div className="flex flex-wrap gap-1.5">
                  {formData.skills.map((skill) => (
                    <span 
                      key={skill}
                      className={`px-2 py-1 rounded-lg text-[10px] font-medium transition-all ${
                        previewTheme === 'dark' ? 'bg-white/5 text-white/80 border border-white/5' : 'bg-slate-100 text-neutral-700'
                      }`}
                    >
                      {skill}
                    </span>
                  ))}
                  {formData.skills.length === 0 && (
                    <span className="text-xs text-slate-400 italic">No skills added yet.</span>
                  )}
                </div>
              </div>

              {/* Timeline Experience */}
              <div className="space-y-3">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Recent Professional History</div>
                
                {formData.experience.map((exp) => (
                  <div key={exp.id} className="border-l-2 border-violet-500/30 pl-3.5 space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold">{exp.role}</span>
                      <span className="text-[10px] text-slate-400">{exp.duration}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-semibold">{exp.company}</div>
                    <ul className="list-disc list-inside text-[10px] text-slate-400 space-y-1 mt-1 leading-relaxed">
                      {exp.bullets.map((b, bIdx) => (
                        <li key={bIdx} className="truncate max-w-[340px]">{b}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

            </div>
          </div>

          {/* Performance Analytics Dial */}
          <div className={`w-full p-4 rounded-xl border grid grid-cols-2 gap-4 ${cardTheme}`}>
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Completeness</div>
              <div className="flex items-center gap-2">
                <div className="text-lg font-black">{getCompleteness()}%</div>
                <div className="flex-1 h-1.5 bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-400" style={{ width: `${getCompleteness()}%` }} />
                </div>
              </div>
            </div>

            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Discoverability</div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                <span>{formData.skills.length > 4 ? 'Top Match (94%)' : 'Good (72%)'}</span>
              </div>
            </div>

            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Reputation Dial</div>
              <div className="text-xs font-bold text-indigo-400">Level 3 Specialist</div>
            </div>

            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Trust Score</div>
              <div className="text-xs font-bold text-sky-400">
                {formData.phoneVerified && formData.idVerified ? '100% Verified' : '60% Verified'}
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md"
          >
            <div className={`w-full max-w-sm p-6 rounded-2xl border text-center space-y-4 ${cardTheme}`}>
              <RefreshCw className="w-8 h-8 text-violet-500 animate-spin mx-auto" />
              <div className="text-sm font-bold">{parseStatus}</div>
              
              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-violet-600 transition-all duration-300" style={{ width: `${parseProgress}%` }} />
              </div>
              <span className="text-[10px] text-slate-400 font-bold">Extraction Engine running offline</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );

  // Helper functions to fetch Step Titles
  function getStepName(stepIdx) {
    const stepNames = {
      1: 'Profile Import',
      2: 'Category & Specialization',
      3: 'Skills Intelligence',
      4: 'Professional Title',
      5: 'Timeline Experience',
      6: 'Education & Credentials',
      7: 'Language Portfolio',
      8: 'AI Bio Studio',
      9: 'Identity & Photo setup'
    };
    return stepNames[stepIdx] || '';
  }

  // ─── Rendering Step Views ───
  function renderStepContent(stepIndex) {
    switch (stepIndex) {
      
      // STEP 1: IMPORT ID
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Import your Professional Identity</h2>
              <p className="text-sm text-slate-400 mt-1">
                Sync data from platforms or upload your resume. Our parsing pipeline will auto-fill your profile details.
              </p>
            </div>

            {/* Connect Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* GitHub Card */}
              <button 
                onClick={handleGithubConnect}
                className={`p-5 rounded-2xl border text-left flex items-start gap-4 transition-all hover:scale-[1.01] ${
                  formData.importSource === 'github' 
                    ? 'border-violet-500 bg-violet-500/5' 
                    : isDark ? 'border-white/5 hover:bg-white/5' : 'border-black/5 hover:bg-black/5'
                }`}
              >
                <div className="p-2.5 rounded-xl bg-slate-900 border border-white/10 text-white shrink-0">
                  <GithubIcon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold">Import from GitHub</h4>
                  <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                    Auto-extract your repository tech stack, languages, and coding metrics.
                  </p>
                  {formData.importSource === 'github' && (
                    <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-400 mt-2">
                      <Check className="w-3 h-3" /> Connected
                    </span>
                  )}
                </div>
              </button>

              {/* LinkedIn Mock */}
              <button 
                onClick={() => {
                  setFormData(prev => ({ ...prev, importSource: 'linkedin', linkedinUrl: 'linkedin.com/in/profile' }));
                  confetti({ particleCount: 30, spread: 40 });
                }}
                className={`p-5 rounded-2xl border text-left flex items-start gap-4 transition-all hover:scale-[1.01] ${
                  formData.importSource === 'linkedin' 
                    ? 'border-violet-500 bg-violet-500/5' 
                    : isDark ? 'border-white/5 hover:bg-white/5' : 'border-black/5 hover:bg-black/5'
                }`}
              >
                <div className="p-2.5 rounded-xl bg-blue-600 text-white shrink-0">
                  <LinkedInIcon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold">Connect LinkedIn</h4>
                  <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                    Import work timeline history, titles, endorsements, and current bio.
                  </p>
                  {formData.importSource === 'linkedin' && (
                    <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-400 mt-2">
                      <Check className="w-3 h-3" /> Imported
                    </span>
                  )}
                </div>
              </button>

            </div>

            {/* Resume upload panel */}
            <div 
              className={`p-8 rounded-2xl border border-dashed text-center space-y-4 cursor-pointer hover:border-violet-500 transition-all ${
                formData.resumeName ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-white/10 bg-white/3'
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
              
              <div className="w-12 h-12 rounded-full bg-violet-500/10 flex items-center justify-center mx-auto text-violet-500">
                <Upload className="w-5 h-5" />
              </div>
              
              <div>
                <h4 className="text-xs font-bold">Drag & Drop Resume</h4>
                <p className="text-[10px] text-slate-400 mt-1">PDF, DOCX up to 10MB. We parse details in real time.</p>
              </div>

              {formData.resumeName && (
                <div className="flex items-center justify-center gap-1 text-xs text-emerald-400 font-bold bg-emerald-500/10 py-1.5 px-3 rounded-lg w-fit mx-auto">
                  <FileCheck className="w-4 h-4" />
                  <span>{formData.resumeName} (98% parsed)</span>
                </div>
              )}
            </div>
          </div>
        );

      // STEP 2: CATEGORY & RATE
      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Specialization & Rates</h2>
              <p className="text-sm text-slate-400 mt-1">
                Select your primary sector, experience, and configure your target freelance billing rate.
              </p>
            </div>

            {/* Primary Sector Selection */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Career Category</label>
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
                    className={`p-4 rounded-xl border text-left transition-all ${
                      formData.specialization === cat 
                        ? 'border-violet-500 bg-violet-500/5 text-white' 
                        : isDark ? 'border-white/5 bg-white/3 hover:bg-white/5' : 'border-black/5 bg-black/[0.02] hover:bg-black/5'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold">{cat}</span>
                      <span className="text-[9px] text-emerald-400 font-bold bg-emerald-400/10 px-1.5 py-0.5 rounded">
                        {ROLE_TEMPLATES[cat].demand}% Demand
                      </span>
                    </div>
                    <p className="text-[9px] text-slate-400 mt-1">Avg Rate: ${ROLE_TEMPLATES[cat].avgRate}/hr</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Sub specialization detail */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Specialty Niche</label>
                <input 
                  type="text"
                  value={formData.subRole}
                  onChange={(e) => setFormData(prev => ({ ...prev, subRole: e.target.value }))}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-medium focus:ring-1 focus:ring-violet-500 focus:outline-none ${
                    isDark ? 'bg-white/3 border-white/5' : 'bg-white border-slate-200'
                  }`}
                  placeholder="e.g. Next.js performance lead"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Experience Level</label>
                <select
                  value={formData.experienceLevel}
                  onChange={(e) => setFormData(prev => ({ ...prev, experienceLevel: e.target.value }))}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-medium focus:ring-1 focus:ring-violet-500 focus:outline-none ${
                    isDark ? 'bg-[#0b0f19] border-white/5' : 'bg-white border-slate-200'
                  }`}
                >
                  <option value="Junior">Junior Specialist (1-2 yrs)</option>
                  <option value="Mid">Mid Level (3-4 yrs)</option>
                  <option value="Senior">Senior Specialist (5-8 yrs)</option>
                  <option value="Lead">Principal / Lead (8+ yrs)</option>
                </select>
              </div>
            </div>

            {/* Billing Rate Slider */}
            <div className={`p-5 rounded-xl border ${cardTheme} space-y-4`}>
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-xs font-bold">Target Hourly Billing Rate</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Adjust according to your market expectations.</p>
                </div>
                <div className="text-xl font-black text-violet-400">${formData.hourlyRate}/hr</div>
              </div>

              <input 
                type="range"
                min="15"
                max="250"
                value={formData.hourlyRate}
                onChange={(e) => setFormData(prev => ({ ...prev, hourlyRate: parseInt(e.target.value) }))}
                className="w-full accent-violet-500 h-1.5 rounded-lg bg-slate-200 dark:bg-white/10"
              />

              <div className="text-[10px] text-slate-400 flex items-center gap-1.5 font-medium">
                <Info className="w-3.5 h-3.5 text-violet-400" />
                <span>{currentTemplate.trends}</span>
              </div>
            </div>

          </div>
        );

      // STEP 3: SKILLS
      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Skills Intelligence</h2>
              <p className="text-sm text-slate-400 mt-1">
                Manage your core developer stack. Adding complementary recommendations increases marketplace SEO visibility.
              </p>
            </div>

            {/* Input Stack */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Add Technical Skills</label>
              <div className="flex gap-2">
                <input 
                  type="text"
                  value={skillSearch}
                  onChange={(e) => setSkillSearch(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { handleAddSkill(skillSearch); } }}
                  className={`flex-1 px-3.5 py-2.5 rounded-xl border text-xs font-medium focus:ring-1 focus:ring-violet-500 focus:outline-none ${
                    isDark ? 'bg-white/3 border-white/5' : 'bg-white border-slate-200'
                  }`}
                  placeholder="e.g. PyTorch, Docker, Kubernetes..."
                />
                <button
                  onClick={() => handleAddSkill(skillSearch)}
                  className="px-4 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-bold"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Selected Tags list */}
            <div className="flex flex-wrap gap-2">
              {formData.skills.map((skill) => (
                <div 
                  key={skill}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-violet-500/10 border border-violet-500/25 text-violet-300"
                >
                  <span>{skill}</span>
                  <button onClick={() => handleRemoveSkill(skill)} className="hover:text-white text-violet-500">×</button>
                </div>
              ))}
            </div>

            {/* Recommended Skills */}
            <div className={`p-5 rounded-xl border ${cardTheme} space-y-3`}>
              <h4 className="text-xs font-bold">Suggested Complementary Tech</h4>
              <p className="text-[10px] text-slate-400">Based on your selections, we recommend adding:</p>
              
              <div className="flex flex-wrap gap-1.5">
                {getComplementSuggestions().map((s) => (
                  <button
                    key={s}
                    onClick={() => handleAddSkill(s)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors ${
                      isDark ? 'border-white/10 hover:bg-white/5 text-slate-300' : 'border-black/10 hover:bg-black/5 text-neutral-600'
                    }`}
                  >
                    + {s}
                  </button>
                ))}
              </div>

              {/* Skill salary index tip */}
              <div className="pt-2 border-t border-white/5 text-[9px] text-slate-400 flex items-center gap-1 font-semibold">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Adding advanced backend and container tools increases client response indexes by 14%.</span>
              </div>
            </div>

          </div>
        );

      // STEP 4: PROFESSIONAL TITLE
      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">AI-Assisted Positioning Engine</h2>
              <p className="text-sm text-slate-400 mt-1">
                Your professional title dictates how search engines index your profile. Let our engine draft a high-ranking title.
              </p>
            </div>

            {/* Current Input */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Professional Title</label>
              <input 
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-medium focus:ring-1 focus:ring-violet-500 focus:outline-none ${
                  isDark ? 'bg-white/3 border-white/5' : 'bg-white border-slate-200'
                }`}
                placeholder="e.g. Senior Frontend Architect"
              />
            </div>

            {/* AI Suggestion Box */}
            <div className={`p-5 rounded-xl border ${cardTheme} space-y-4`}>
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-bold flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-violet-400" />
                  <span>AI Suggestions for your stack</span>
                </h4>
                <span className="text-[10px] text-emerald-400 font-bold bg-emerald-400/10 px-2 py-0.5 rounded-full">
                  SEO optimized
                </span>
              </div>

              <div className="space-y-2">
                {currentTemplate.titleSuggestions.map((sug) => (
                  <button
                    key={sug}
                    onClick={() => {
                      setFormData(prev => ({ ...prev, title: sug }));
                      confetti({ particleCount: 15, spread: 30 });
                    }}
                    className={`w-full p-3 rounded-lg border text-left text-xs font-bold transition-all flex justify-between items-center ${
                      formData.title === sug 
                        ? 'border-violet-500 bg-violet-500/5' 
                        : isDark ? 'border-white/5 hover:bg-white/5 bg-white/3' : 'border-black/5 hover:bg-black/5 bg-slate-50'
                    }`}
                  >
                    <span>{sug}</span>
                    <span className="text-[9px] text-slate-400 font-medium">Rank index: {scoreTitle(sug)}%</span>
                  </button>
                ))}
              </div>

              {/* Title SEO scoring dial */}
              <div className="pt-2 border-t border-white/5 flex justify-between text-[10px] text-slate-400 font-medium">
                <span>Discoverability score:</span>
                <span className="font-bold text-violet-400">{scoreTitle(formData.title)}/100</span>
              </div>
            </div>

          </div>
        );

      // STEP 5: EXPERIENCE TIMELINE
      case 5:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Timeline-Based History Builder</h2>
              <p className="text-sm text-slate-400 mt-1">
                Add your experience milestones. Use our Sparkles engine to automatically write quantified metrics.
              </p>
            </div>

            {/* List existing experiences */}
            <div className="space-y-4">
              {formData.experience.map((exp, idx) => (
                <div key={exp.id} className={`p-4 rounded-xl border relative ${cardTheme} space-y-2`}>
                  <button 
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        experience: prev.experience.filter(e => e.id !== exp.id)
                      }));
                    }}
                    className="absolute top-4 right-4 p-1 text-slate-400 hover:text-red-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <div className="text-xs font-black text-white">{exp.role}</div>
                  <div className="text-[10px] text-slate-400">{exp.company} • {exp.duration}</div>
                  
                  {/* Bullet inputs */}
                  <div className="space-y-2 mt-3">
                    {exp.bullets.map((b, bIdx) => (
                      <div key={bIdx} className="flex gap-2 items-start bg-black/20 p-2.5 rounded-lg border border-white/5">
                        <p className="text-[10px] text-slate-300 leading-relaxed flex-1">{b}</p>
                        <button
                          onClick={() => handleOptimizeBullet(idx, bIdx)}
                          disabled={aiOptimizing}
                          className="text-[9px] font-bold text-violet-400 hover:text-violet-300 flex items-center gap-1 shrink-0 p-1 bg-violet-500/10 rounded-md border border-violet-500/20"
                        >
                          <Sparkles className="w-3 h-3 text-violet-400 animate-pulse" />
                          <span>Optimize</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Input fields to add new experience */}
            <div className={`p-5 rounded-xl border ${cardTheme} space-y-4`}>
              <h4 className="text-xs font-bold">Add New Work Experience</h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input 
                  type="text"
                  placeholder="Company"
                  value={tempExp.company}
                  onChange={(e) => setTempExp(prev => ({ ...prev, company: e.target.value }))}
                  className={`px-3 py-2 rounded-lg border text-xs font-medium focus:ring-1 focus:ring-violet-500 focus:outline-none ${
                    isDark ? 'bg-white/3 border-white/5' : 'bg-white border-slate-200'
                  }`}
                />
                <input 
                  type="text"
                  placeholder="Role/Title"
                  value={tempExp.role}
                  onChange={(e) => setTempExp(prev => ({ ...prev, role: e.target.value }))}
                  className={`px-3 py-2 rounded-lg border text-xs font-medium focus:ring-1 focus:ring-violet-500 focus:outline-none ${
                    isDark ? 'bg-white/3 border-white/5' : 'bg-white border-slate-200'
                  }`}
                />
                <input 
                  type="text"
                  placeholder="Duration (e.g. 2022-2024)"
                  value={tempExp.duration}
                  onChange={(e) => setTempExp(prev => ({ ...prev, duration: e.target.value }))}
                  className={`px-3 py-2 rounded-lg border text-xs font-medium focus:ring-1 focus:ring-violet-500 focus:outline-none ${
                    isDark ? 'bg-white/3 border-white/5' : 'bg-white border-slate-200'
                  }`}
                />
              </div>

              <div className="space-y-2">
                <textarea
                  placeholder="Enter a simple sentence of what you did..."
                  value={tempExp.bullet}
                  onChange={(e) => setTempExp(prev => ({ ...prev, bullet: e.target.value }))}
                  rows={2}
                  className={`w-full px-3 py-2 rounded-lg border text-xs font-medium focus:ring-1 focus:ring-violet-500 focus:outline-none ${
                    isDark ? 'bg-white/3 border-white/5' : 'bg-white border-slate-200'
                  }`}
                />
              </div>

              <button
                onClick={() => {
                  if (!tempExp.company || !tempExp.role || !tempExp.bullet) return;
                  const newExp = {
                    id: 'exp-' + Date.now(),
                    company: tempExp.company,
                    role: tempExp.role,
                    duration: tempExp.duration || '2024',
                    bullets: [tempExp.bullet]
                  };
                  setFormData(prev => ({
                    ...prev,
                    experience: [...prev.experience, newExp]
                  }));
                  setTempExp({ company: '', role: '', duration: '', bullet: '' });
                }}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-xs font-bold border border-white/10"
              >
                + Save Experience
              </button>
            </div>

          </div>
        );

      // STEP 6: EDUCATION
      case 6:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Credentials & Education</h2>
              <p className="text-sm text-slate-400 mt-1">
                Log your degrees, credentials, and certified qualifications.
              </p>
            </div>

            {/* University list */}
            <div className="space-y-3">
              {formData.education.map((edu) => (
                <div key={edu.id} className={`p-4 rounded-xl border flex justify-between items-center ${cardTheme}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 text-xs font-black">
                      {edu.school.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold">{edu.school}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">{edu.degree} • Class of {edu.year}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      setFormData(prev => ({ ...prev, education: prev.education.filter(e => e.id !== edu.id) }));
                    }}
                    className="text-slate-400 hover:text-red-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Form addition */}
            <div className={`p-5 rounded-xl border ${cardTheme} space-y-4`}>
              <h4 className="text-xs font-bold">Add Academic Milestone</h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input 
                  type="text" 
                  placeholder="School/University"
                  value={tempEdu.school}
                  onChange={(e) => setTempEdu(prev => ({ ...prev, school: e.target.value }))}
                  className={`px-3 py-2 rounded-lg border text-xs font-medium ${isDark ? 'bg-white/3 border-white/5' : 'bg-white border-slate-200'}`}
                />
                <input 
                  type="text" 
                  placeholder="Degree (e.g. B.S. in CS)"
                  value={tempEdu.degree}
                  onChange={(e) => setTempEdu(prev => ({ ...prev, degree: e.target.value }))}
                  className={`px-3 py-2 rounded-lg border text-xs font-medium ${isDark ? 'bg-white/3 border-white/5' : 'bg-white border-slate-200'}`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input 
                  type="text" 
                  placeholder="Graduation Year"
                  value={tempEdu.year}
                  onChange={(e) => setTempEdu(prev => ({ ...prev, year: e.target.value }))}
                  className={`px-3 py-2 rounded-lg border text-xs font-medium ${isDark ? 'bg-white/3 border-white/5' : 'bg-white border-slate-200'}`}
                />
                <input 
                  type="text" 
                  placeholder="GPA (optional)"
                  value={tempEdu.gpa}
                  onChange={(e) => setTempEdu(prev => ({ ...prev, gpa: e.target.value }))}
                  className={`px-3 py-2 rounded-lg border text-xs font-medium ${isDark ? 'bg-white/3 border-white/5' : 'bg-white border-slate-200'}`}
                />
              </div>

              <button 
                onClick={handleAddEdu}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-xs font-bold border border-white/10"
              >
                + Add Academic Track
              </button>
            </div>

            {/* Certifications Block */}
            <div className="space-y-4 border-t border-white/5 pt-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Certifications</h4>
              
              <div className="space-y-2">
                {formData.certifications.map((cert) => (
                  <div key={cert.id} className="flex justify-between items-center p-3 rounded-lg border border-white/5 bg-black/20 text-xs">
                    <div>
                      <span className="font-bold">{cert.name}</span>
                      <span className="text-[10px] text-slate-400 ml-2">({cert.issuer})</span>
                    </div>
                    <button 
                      onClick={() => {
                        setFormData(prev => ({ ...prev, certifications: prev.certifications.filter(c => c.id !== cert.id) }));
                      }}
                      className="text-slate-400 hover:text-red-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input 
                  type="text"
                  placeholder="Cert Name"
                  value={tempCert.name}
                  onChange={(e) => setTempCert(prev => ({ ...prev, name: e.target.value }))}
                  className={`px-3 py-2 rounded-lg border text-xs font-medium ${isDark ? 'bg-white/3 border-white/5' : 'bg-white border-slate-200'}`}
                />
                <input 
                  type="text"
                  placeholder="Issuer"
                  value={tempCert.issuer}
                  onChange={(e) => setTempCert(prev => ({ ...prev, issuer: e.target.value }))}
                  className={`px-3 py-2 rounded-lg border text-xs font-medium ${isDark ? 'bg-white/3 border-white/5' : 'bg-white border-slate-200'}`}
                />
                <button
                  onClick={() => {
                    if (!tempCert.name) return;
                    setFormData(prev => ({
                      ...prev,
                      certifications: [...prev.certifications, { id: 'cert-' + Date.now(), name: tempCert.name, issuer: tempCert.issuer, year: '2024' }]
                    }));
                    setTempCert({ name: '', issuer: '', year: '' });
                  }}
                  className="bg-white/5 hover:bg-white/10 text-white rounded-lg text-xs font-bold border border-white/10"
                >
                  + Add Cert
                </button>
              </div>
            </div>

          </div>
        );

      // STEP 7: LANGUAGES
      case 7:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Global Communication Portfolio</h2>
              <p className="text-sm text-slate-400 mt-1">
                Configure your fluency levels. Clients prioritize developers with verified written and oral capabilities.
              </p>
            </div>

            {/* List */}
            <div className="flex flex-wrap gap-2.5">
              {formData.languages.map((lang) => (
                <div 
                  key={lang.code}
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-white/5 bg-black/30 text-xs font-bold"
                >
                  <Globe className="w-3.5 h-3.5 text-violet-400" />
                  <span>{lang.name} — <span className="text-violet-400">{lang.fluency}</span></span>
                  <button onClick={() => handleRemoveLang(lang.code)} className="text-slate-500 hover:text-white">×</button>
                </div>
              ))}
            </div>

            {/* Input Row */}
            <div className={`p-5 rounded-xl border ${cardTheme} space-y-4`}>
              <h4 className="text-xs font-bold">Register Fluent Languages</h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <select
                  value={tempLang.code}
                  onChange={(e) => {
                    const dict = { en: 'English', es: 'Spanish', fr: 'French', de: 'German', ja: 'Japanese', zh: 'Chinese' };
                    setTempLang(prev => ({ ...prev, code: e.target.value, name: dict[e.target.value] || 'English' }));
                  }}
                  className={`px-3 py-2 rounded-lg border text-xs font-medium focus:ring-1 focus:ring-violet-500 focus:outline-none ${
                    isDark ? 'bg-[#0b0f19] border-white/5' : 'bg-white border-slate-200'
                  }`}
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                  <option value="ja">Japanese</option>
                  <option value="zh">Chinese</option>
                </select>

                <select
                  value={tempLang.fluency}
                  onChange={(e) => setTempLang(prev => ({ ...prev, fluency: e.target.value }))}
                  className={`px-3 py-2 rounded-lg border text-xs font-medium focus:ring-1 focus:ring-violet-500 focus:outline-none ${
                    isDark ? 'bg-[#0b0f19] border-white/5' : 'bg-white border-slate-200'
                  }`}
                >
                  <option value="Basic">Basic Communication</option>
                  <option value="Conversational">Conversational</option>
                  <option value="Fluent">Fluent</option>
                  <option value="Native / Bilingual">Native / Bilingual</option>
                </select>

                <button
                  onClick={handleAddLang}
                  className="px-4 bg-white/5 hover:bg-white/10 text-white rounded-lg text-xs font-bold border border-white/10"
                >
                  + Add Language
                </button>
              </div>
            </div>

          </div>
        );

      // STEP 8: BIO / STUDIO
      case 8:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">AI Profile Writing Studio</h2>
              <p className="text-sm text-slate-400 mt-1">
                Refine your summary narrative. Choose a tone configuration and run the optimizer to raise your discoverability.
              </p>
            </div>

            {/* Notion AI writing box */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Bio Overview</label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                rows={5}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-medium leading-relaxed focus:ring-1 focus:ring-violet-500 focus:outline-none ${
                  isDark ? 'bg-white/3 border-white/5' : 'bg-white border-slate-200'
                }`}
                placeholder="Write or generate a short brief about your engineering accomplishments..."
              />
            </div>

            {/* AI Assistant Toolkit */}
            <div className={`p-5 rounded-xl border ${cardTheme} space-y-4`}>
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-bold flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-violet-400" />
                  <span>AI Copilot Engine</span>
                </h4>
                
                {/* Tone Select */}
                <select
                  value={formData.bioTone}
                  onChange={(e) => setFormData(prev => ({ ...prev, bioTone: e.target.value }))}
                  className={`px-2 py-1 rounded-md text-[10px] font-bold border border-white/10 ${
                    isDark ? 'bg-[#0b0f19] text-white' : 'bg-white text-neutral-900'
                  }`}
                >
                  <option value="professional">Professional Tone</option>
                  <option value="technical">Technical Focus</option>
                  <option value="narrative">Personal Narrative</option>
                  <option value="minimal">Minimalist Layout</option>
                </select>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleGenerateBio}
                  disabled={aiOptimizing}
                  className="flex-1 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{aiOptimizing ? 'Rewriting Bio...' : 'Generate with AI'}</span>
                </button>
              </div>

              {/* Bio optimization score dials */}
              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-white/5">
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold block">Readability index</span>
                  <span className="text-xs font-bold text-white">Grade 10 (Optimal)</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold block">Attractiveness Score</span>
                  <span className="text-xs font-bold text-emerald-400">94% Rank Match</span>
                </div>
              </div>
            </div>

          </div>
        );

      // STEP 9: PERSONAL DETAILS, PHOTO & MOCK VERIFY
      case 9:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Identity & Professional Photo</h2>
              <p className="text-sm text-slate-400 mt-1">
                Upload a professional headshot, setup phone verification, and claim your verified identity seal.
              </p>
            </div>

            {/* Split layout for Photo upload & verification */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* Photo upload Box */}
              <div className={`p-5 rounded-xl border ${cardTheme} space-y-4 text-center`}>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block text-left">Headshot Image</label>
                
                <div 
                  onClick={() => photoInputRef.current?.click()}
                  className="w-24 h-24 rounded-full border border-dashed border-white/20 hover:border-violet-500 cursor-pointer mx-auto flex items-center justify-center overflow-hidden bg-black/40 group relative"
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
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] font-bold text-white transition-opacity">
                        Change Photo
                      </div>
                    </>
                  ) : (
                    <CameraIcon className="w-6 h-6 text-slate-500" />
                  )}
                </div>

                {isCropping && (
                  <div className="space-y-2">
                    <div className="text-[10px] text-amber-400 font-semibold">Verify cropping alignment...</div>
                    <button 
                      onClick={handleCropSave}
                      className="px-3 py-1 bg-violet-600 hover:bg-violet-500 text-white rounded text-[10px] font-bold"
                    >
                      Save & Clean Background
                    </button>
                  </div>
                )}

                {/* Face analysis dials */}
                <div className="grid grid-cols-2 gap-2 pt-2 text-[10px] text-slate-400">
                  <div className="border border-white/5 rounded p-1.5 bg-black/20">
                    <span className="block font-semibold">Lighting</span>
                    <span className="text-emerald-400 font-bold">{lightingScore ? `${lightingScore}%` : 'Pending'}</span>
                  </div>
                  <div className="border border-white/5 rounded p-1.5 bg-black/20">
                    <span className="block font-semibold">Professionalism</span>
                    <span className="text-emerald-400 font-bold">{photoScore ? `${photoScore}/100` : 'Pending'}</span>
                  </div>
                </div>
              </div>

              {/* Secure verification credentials Box */}
              <div className={`p-5 rounded-xl border ${cardTheme} space-y-4`}>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Identity Protection Check</label>
                
                {/* Phone Setup */}
                <div className="space-y-2">
                  <span className="text-[10px] text-slate-400 font-bold block">Mobile Phone Verification</span>
                  <div className="flex gap-2">
                    <input 
                      type="text"
                      placeholder="+1 (555) 000-0000"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      disabled={formData.phoneVerified}
                      className={`flex-1 px-3 py-1.5 rounded-lg border text-xs font-medium focus:outline-none ${
                        isDark ? 'bg-white/3 border-white/5' : 'bg-white border-slate-200'
                      }`}
                    />
                    {!formData.phoneVerified && (
                      <button
                        onClick={handleSendSMS}
                        className="px-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-lg text-[10px] font-bold"
                      >
                        {smsSent ? 'Resend' : 'Send Code'}
                      </button>
                    )}
                  </div>
                </div>

                {/* SMS Code Input */}
                {smsSent && (
                  <div className="space-y-2 p-3 bg-black/20 rounded-lg border border-white/5">
                    <span className="text-[9px] text-amber-400 font-bold block">SMS sent to phone. Enter code:</span>
                    <div className="flex gap-2">
                      <input 
                        type="text"
                        placeholder="6-digit code (e.g. 123456)"
                        value={smsCode}
                        onChange={(e) => setSmsCode(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-xs text-white"
                      />
                      <button
                        onClick={handleVerifySMS}
                        className="px-3 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-[10px] font-bold"
                      >
                        Verify
                      </button>
                    </div>
                    {smsError && <div className="text-[9px] text-red-400 mt-1 font-semibold">{smsError}</div>}
                  </div>
                )}

                {/* Verification Checkboxes */}
                <div className="space-y-2 pt-2 border-t border-white/5 text-xs font-medium">
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="idCheck"
                      checked={formData.idVerified}
                      onChange={(e) => setFormData(prev => ({ ...prev, idVerified: e.target.checked }))}
                      className="accent-violet-600 rounded" 
                    />
                    <label htmlFor="idCheck" className="text-slate-300 flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5 text-slate-500" />
                      <span>Secure Government ID uploaded</span>
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="addressCheck"
                      checked={formData.addressVerified}
                      onChange={(e) => setFormData(prev => ({ ...prev, addressVerified: e.target.checked }))}
                      className="accent-violet-600 rounded" 
                    />
                    <label htmlFor="addressCheck" className="text-slate-300">Address verified (Utility check)</label>
                  </div>
                </div>
              </div>

            </div>

            {/* Secure trust messages */}
            <div className="p-4 rounded-xl bg-sky-500/10 border border-sky-500/20 flex gap-3 text-xs text-sky-300 leading-relaxed font-medium">
              <ShieldCheck className="w-6 h-6 text-sky-400 shrink-0" />
              <div>
                <span className="font-bold block text-white">Trust & Security Shield</span>
                Your details are stored in AES-256 cloud infrastructure. Client directories prioritize verified identity profiles over anonymous profiles, maximizing your hiring rate.
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
    // Fallback if no matching complements
    if (list.length === 0) {
      return ['GraphQL', 'Docker', 'Kubernetes', 'FastAPI'];
    }
    return list;
  }
}

// ─── Small Inline SVG Mocks ───
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
