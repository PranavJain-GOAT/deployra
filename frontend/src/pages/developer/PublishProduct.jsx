import { useState, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { API_URL } from "@/lib/config";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, ArrowRight, Check, Plus, X, Grip, ChevronDown,
  Eye, Upload, FileText, DollarSign, Settings, Send,
  Image, Video, Globe, RefreshCw, Shield, AlertCircle,
  Info, Layers, Zap, Package, Type, AlignLeft, Hash, Mail,
  Phone, Calendar, List, CheckSquare, Circle, MapPin, Paperclip,
  ChevronLeft, ChevronRight, ToggleLeft, Palette, LayoutGrid, Star, Award,
  Lock, CreditCard, Clock
} from "lucide-react";

// ─── Constants ─────────────────────────────────────────────────────────────────
const STEPS = [
  { id: 1, label: "Product Info",    icon: Package,     desc: "Name, description & category" },
  { id: 2, label: "Media & Demo",    icon: Image,       desc: "Screenshots, video & links" },
  { id: 3, label: "Pricing",         icon: DollarSign,  desc: "Pricing, delivery & support" },
  { id: 4, label: "Config Builder",  icon: Settings,    desc: "Define buyer onboarding" },
  { id: 5, label: "Review & Submit", icon: Send,        desc: "Final review & publish" },
];

const CATEGORIES = [
  "AI Agents",
  "Chatbots",
  "SaaS Applications",
  "CRM Systems",
  "E-commerce Solutions",
  "Automation Tools",
  "Analytics Dashboards",
  "Internal Business Tools",
  "Marketing Tools",
  "Customer Support Systems",
  "Developer Tools",
  "Productivity Tools",
  "Other (Requires Admin Review)"
];
const INDUSTRIES = [
  "Restaurants","Healthcare","E-Commerce","Real Estate","Education","Finance",
  "Logistics","Hospitality","Legal","Marketing Agencies","SaaS Companies",
  "Retail","Manufacturing","Non-Profit","General",
];
const SUPPORT_MODELS   = ["No Support","30 Days","90 Days","6 Months","1 Year","Custom"];
const REVISION_OPTIONS = ["0","1","2","3","5","Unlimited"];
const DEPLOYMENT_METHODS = ["Developer Hosted","Client Hosted","Custom Deployment"];

const FIELD_TYPES = [
  { type:"text",        label:"Text Input",    icon:Type,        color:"text-blue-500" },
  { type:"textarea",    label:"Text Area",     icon:AlignLeft,   color:"text-indigo-500" },
  { type:"number",      label:"Number",        icon:Hash,        color:"text-violet-500" },
  { type:"email",       label:"Email",         icon:Mail,        color:"text-sky-500" },
  { type:"phone",       label:"Phone",         icon:Phone,       color:"text-cyan-500" },
  { type:"url",         label:"URL",           icon:Globe,       color:"text-teal-500" },
  { type:"dropdown",    label:"Dropdown",      icon:ChevronDown, color:"text-emerald-500" },
  { type:"multiselect", label:"Multi Select",  icon:List,        color:"text-green-500" },
  { type:"checkbox",    label:"Checkbox",      icon:CheckSquare, color:"text-lime-600" },
  { type:"radio",       label:"Radio Button",  icon:Circle,      color:"text-yellow-600" },
  { type:"date",        label:"Date Picker",   icon:Calendar,    color:"text-orange-500" },
  { type:"file",        label:"File Upload",   icon:Paperclip,   color:"text-red-500" },
  { type:"pdf",         label:"PDF Upload",    icon:FileText,    color:"text-pink-500" },
  { type:"image",       label:"Image Upload",  icon:Image,       color:"text-rose-500" },
  { type:"video",       label:"Video Upload",  icon:Video,       color:"text-amber-500" },
  { type:"color",       label:"Color Picker",  icon:Palette,     color:"text-purple-500" },
  { type:"location",    label:"Location",      icon:MapPin,      color:"text-fuchsia-500" },
  { type:"toggle",      label:"Toggle",        icon:ToggleLeft,  color:"text-cyan-600" },
];

function getFieldMeta(type) { return FIELD_TYPES.find(f => f.type === type) || FIELD_TYPES[0]; }

// ─── Shared input class ─────────────────────────────────────────────────────────
const inputCls = `w-full px-4 py-3 rounded-xl text-sm font-medium outline-none transition-all duration-200
  bg-muted border border-border text-foreground placeholder:text-muted-foreground
  focus:ring-2 focus:ring-foreground/20 focus:border-foreground/40`;

const selectCls = `w-full px-4 py-3 rounded-xl text-sm font-medium outline-none cursor-pointer
  bg-muted border border-border text-foreground
  focus:ring-2 focus:ring-foreground/20 focus:border-foreground/40`;

// ─── Step Indicator ─────────────────────────────────────────────────────────────
function StepIndicator({ current, steps }) {
  return (
    <div className="flex items-center gap-0 mb-10">
      {steps.map((step, i) => {
        const done   = step.id < current;
        const active = step.id === current;
        const Icon   = step.icon;
        return (
          <div key={step.id} className="flex items-center flex-1">
            <div className="flex flex-col items-center gap-1.5 min-w-0">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center border-2 transition-all duration-300 shrink-0 ${
                done   ? "bg-foreground border-foreground" :
                active ? "bg-foreground/10 border-foreground ring-4 ring-foreground/10" :
                         "bg-muted border-border"
              }`}>
                {done
                  ? <Check className="w-4 h-4 text-background" />
                  : <Icon className={`w-4 h-4 ${active ? "text-foreground" : "text-muted-foreground"}`} />
                }
              </div>
              <span className={`text-[9px] font-bold uppercase tracking-wider whitespace-nowrap hidden sm:block font-mono ${
                active ? "text-foreground" : done ? "text-muted-foreground" : "text-muted-foreground/50"
              }`}>
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-px mx-2 transition-all duration-500 ${done ? "bg-foreground/60" : "bg-border"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Field Component ─────────────────────────────────────────────────────────────
function Field({ label, required, hint, children, error }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/70 font-mono">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        {hint && (
          <span className="text-[10px] text-muted-foreground font-normal normal-case font-sans tracking-normal">
            — {hint}
          </span>
        )}
      </div>
      {children}
      {error && (
        <div className="flex items-center gap-1.5 mt-1.5">
          <AlertCircle className="w-3 h-3 text-red-500 shrink-0" />
          <span className="text-[11px] text-red-500">{error}</span>
        </div>
      )}
    </div>
  );
}

// ─── Tag Input ────────────────────────────────────────────────────────────────
function TagInput({ value = [], onChange, placeholder, suggestions = [] }) {
  const [input, setInput] = useState("");
  const add = (tag) => {
    const t = (tag || input).trim();
    if (t && !value.includes(t)) onChange([...value, t]);
    setInput("");
  };
  const remove = (i) => onChange(value.filter((_, idx) => idx !== i));
  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {value.map((tag, i) => (
          <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-foreground text-background">
            {tag}
            <button type="button" onClick={() => remove(i)} className="opacity-60 hover:opacity-100">
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); add(); } if (e.key === "," && input) { e.preventDefault(); add(); } }}
          placeholder={placeholder}
          className={inputCls}
        />
        <button type="button" onClick={() => add()}
          className="px-4 py-3 rounded-xl text-xs font-bold border border-border bg-muted text-foreground hover:bg-foreground hover:text-background transition-all">
          <Plus className="w-4 h-4" />
        </button>
      </div>
      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {suggestions.filter(s => !value.includes(s)).slice(0, 8).map(s => (
            <button key={s} type="button" onClick={() => add(s)}
              className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-muted border border-border text-muted-foreground hover:text-foreground hover:bg-foreground/10 transition-all">
              + {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── STEP 1: Product Info ──────────────────────────────────────────────────────
function Step1({ data, onChange, errors }) {
  return (
    <div className="space-y-6">
      <Field label="Product Name" required error={errors.title}>
        <input value={data.title} onChange={e => onChange("title", e.target.value)}
          placeholder="e.g. Restaurant WhatsApp Ordering Bot"
          className={inputCls} />
      </Field>

      <Field label="Short Description" required hint="1-2 sentences. Shown in marketplace cards." error={errors.shortDesc}>
        <input value={data.shortDesc} onChange={e => onChange("shortDesc", e.target.value)}
          placeholder="Automate your restaurant's WhatsApp orders with AI — zero coding required."
          className={inputCls} />
      </Field>

      <Field label="Full Description" required hint="Comprehensive overview for the product page." error={errors.description}>
        <textarea value={data.description} onChange={e => onChange("description", e.target.value)}
          placeholder="Describe what your product does, how it works, and what makes it unique..."
          rows={5} className={`${inputCls} resize-none`} />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Category" required error={errors.category}>
          <select value={data.category} onChange={e => onChange("category", e.target.value)} className={selectCls}>
            <option value="">Select category...</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="Tags" hint="Press Enter or comma to add">
          <TagInput value={data.tags} onChange={v => onChange("tags", v)}
            placeholder="e.g. WhatsApp, AI, Restaurant"
            suggestions={["AI","Automation","WhatsApp","CRM","No-code","Analytics","Stripe","API"]} />
        </Field>
      </div>

      <Field label="Key Features" hint="What does this product do?">
        <TagInput value={data.features} onChange={v => onChange("features", v)}
          placeholder="e.g. Real-time order notifications" />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Industries Supported">
          <TagInput value={data.industries} onChange={v => onChange("industries", v)}
            placeholder="e.g. Restaurants" suggestions={INDUSTRIES} />
        </Field>
        <Field label="Technical Requirements" hint="What does the buyer need?">
          <TagInput value={data.requirements} onChange={v => onChange("requirements", v)}
            placeholder="e.g. WhatsApp Business API" />
        </Field>
      </div>
    </div>
  );
}

// ─── STEP 2: Media & Demo ──────────────────────────────────────────────────────
// ─── Helpers ───────────────────────────────────────────────────────────────────
const getFullImageUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const baseHost = API_URL.replace("/api/v1", "");
  return `${baseHost}${cleanPath}`;
};

const isValidHttpsUrl = (url) => {
  if (!url) return true;
  if (url.startsWith("/uploads/") || url.startsWith("http://localhost:5001/uploads/") || url.startsWith("http://127.0.0.1:5001/uploads/")) return true;
  if (!url.startsWith("https://")) return false;
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
};

// ─── Media Carousel ────────────────────────────────────────────────────────────
function MediaCarousel({ coverImage, screenshots = [] }) {
  const [index, setIndex] = useState(0);
  const media = [coverImage, ...screenshots].filter(Boolean);

  if (media.length === 0) {
    return (
      <div className="w-full aspect-video rounded-2xl bg-muted border border-border flex items-center justify-center">
        <span className="text-xs text-muted-foreground">No media available</span>
      </div>
    );
  }

  const nextSlide = () => {
    setIndex((prev) => (prev + 1) % media.length);
  };

  const prevSlide = () => {
    setIndex((prev) => (prev - 1 + media.length) % media.length);
  };

  return (
    <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-border bg-black group">
      <AnimatePresence mode="wait">
        <motion.img
          key={index}
          src={getFullImageUrl(media[index])}
          alt={`Media ${index}`}
          className="w-full h-full object-cover"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.3 }}
        />
      </AnimatePresence>

      {/* Slide Index Badge */}
      <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] font-bold text-white uppercase tracking-wider font-mono">
        {index === 0 ? "Cover Image" : `Screenshot ${index}`}
      </div>

      {media.length > 1 && (
        <>
          <button
            type="button"
            onClick={prevSlide}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/75 transition-all opacity-0 group-hover:opacity-100"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={nextSlide}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/75 transition-all opacity-0 group-hover:opacity-100"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          {/* Dots */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
            {media.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIndex(i)}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  i === index ? "bg-white w-4" : "bg-white/40"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── STEP 2: Media & Demo ──────────────────────────────────────────────────────
function Step2({ data, onChange, errors }) {
  const [dragActive, setDragActive] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState({});

  const handleUpload = async (files) => {
    const validTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    const token = localStorage.getItem("auth_token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    for (let file of files) {
      if (!validTypes.includes(file.type)) {
        alert("Invalid file format. Supported formats: PNG, JPG, JPEG, WEBP");
        continue;
      }

      const fileId = `${file.name}-${Date.now()}`;
      setUploadingFiles(prev => ({ ...prev, [fileId]: { name: file.name, progress: 0 } }));

      const formData = new FormData();
      formData.append("image", file);

      try {
        const res = await axios.post(`${API_URL}/uploads/image`, formData, {
          headers: {
            ...headers,
            "Content-Type": "multipart/form-data"
          },
          withCredentials: true,
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadingFiles(prev => ({
              ...prev,
              [fileId]: { ...prev[fileId], progress: percentCompleted }
            }));
          }
        });

        if (res.data?.success && res.data?.data?.url) {
          const uploadedUrl = res.data.data.url;
          onChange("screenshots", [...(data.screenshots || []), uploadedUrl]);
        }
      } catch (err) {
        console.error("Upload failed for", file.name, err);
        alert(`Failed to upload image: ${err.response?.data?.message || err.message}`);
      } finally {
        setUploadingFiles(prev => {
          const next = { ...prev };
          delete next[fileId];
          return next;
        });
      }
    }
  };

  const handleCoverUpload = async (file) => {
    const validTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    if (!validTypes.includes(file.type)) {
      alert("Invalid file format. Supported formats: PNG, JPG, JPEG, WEBP");
      return;
    }
    const token = localStorage.getItem("auth_token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await axios.post(`${API_URL}/uploads/image`, formData, {
        headers: {
          ...headers,
          "Content-Type": "multipart/form-data"
        },
        withCredentials: true
      });
      if (res.data?.success && res.data?.data?.url) {
        onChange("coverImage", res.data.data.url);
      }
    } catch (err) {
      console.error("Cover upload failed", err);
      alert(`Cover image upload failed: ${err.response?.data?.message || err.message}`);
    }
  };

  const onDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(Array.from(e.dataTransfer.files));
    }
  };

  const moveLeft = (index) => {
    if (index === 0) return;
    const newScreenshots = [...data.screenshots];
    const temp = newScreenshots[index];
    newScreenshots[index] = newScreenshots[index - 1];
    newScreenshots[index - 1] = temp;
    onChange("screenshots", newScreenshots);
  };

  const moveRight = (index) => {
    if (index === data.screenshots.length - 1) return;
    const newScreenshots = [...data.screenshots];
    const temp = newScreenshots[index];
    newScreenshots[index] = newScreenshots[index + 1];
    newScreenshots[index + 1] = temp;
    onChange("screenshots", newScreenshots);
  };

  const removeScreenshot = (index) => {
    onChange("screenshots", data.screenshots.filter((_, idx) => idx !== index));
  };

  return (
    <div className="space-y-6">
      {/* Cover Image Field */}
      <Field label="Cover Image" required hint="Min 1200×630px recommended. Paste a URL or upload an image." error={errors.coverImage}>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            value={data.coverImage}
            onChange={e => onChange("coverImage", e.target.value)}
            placeholder="https://your-cdn.com/cover-image.jpg"
            className={`${inputCls} flex-1`}
          />
          <label className="cursor-pointer shrink-0">
            <div className="px-4 py-3 rounded-xl text-xs font-bold bg-muted border border-border text-foreground hover:bg-foreground hover:text-background transition-all flex items-center gap-2">
              <Upload className="w-4 h-4" /> Upload Cover
            </div>
            <input
              type="file"
              accept=".png,.jpg,.jpeg,.webp"
              className="hidden"
              onChange={e => e.target.files?.[0] && handleCoverUpload(e.target.files[0])}
            />
          </label>
        </div>
        {data.coverImage && (
          <div className="mt-3 rounded-xl overflow-hidden border border-border max-w-md">
            <img src={getFullImageUrl(data.coverImage)} alt="Cover preview" className="w-full h-48 object-cover"
              onError={e => e.target.style.display = "none"} />
          </div>
        )}
      </Field>

      {/* Screenshots Uploader Field */}
      <Field label="Product Screenshots" required hint="Upload at least 3 screenshots (PNG, JPG, JPEG, WEBP)." error={errors.screenshots}>
        {/* Drop Zone */}
        <div
          onDragEnter={onDrag}
          onDragOver={onDrag}
          onDragLeave={onDrag}
          onDrop={onDrop}
          className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer ${
            dragActive
              ? "border-foreground bg-foreground/10"
              : "border-border bg-muted/30 hover:border-foreground/40 hover:bg-muted/50"
          }`}
          onClick={() => document.getElementById("screenshot-file-input")?.click()}
        >
          <input
            id="screenshot-file-input"
            type="file"
            multiple
            accept=".png,.jpg,.jpeg,.webp"
            className="hidden"
            onChange={e => e.target.files && handleUpload(Array.from(e.target.files))}
          />
          <Upload className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
          <p className="text-sm font-semibold text-foreground">Drag and drop screenshots here, or click to browse</p>
          <p className="text-xs text-muted-foreground mt-1">Supports PNG, JPG, JPEG, WEBP</p>
        </div>

        {/* Uploading Progress Indicators */}
        {Object.keys(uploadingFiles).length > 0 && (
          <div className="mt-4 space-y-2.5">
            {Object.entries(uploadingFiles).map(([id, file]) => (
              <div key={id} className="p-3.5 rounded-xl border border-border bg-muted/40">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-foreground truncate max-w-[80%]">{file.name}</span>
                  <span className="text-muted-foreground font-mono">{file.progress}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-border overflow-hidden">
                  <div className="h-full bg-foreground transition-all duration-150" style={{ width: `${file.progress}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Screenshots Grid & Controls */}
        {(data.screenshots || []).length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
            {(data.screenshots || []).map((url, i) => (
              <div key={i} className="relative group rounded-xl overflow-hidden border border-border bg-muted/20 flex flex-col">
                <div className="aspect-video w-full overflow-hidden">
                  <img src={getFullImageUrl(url)} alt={`Screenshot ${i+1}`} className="w-full h-full object-cover" />
                </div>
                {/* Control Overlay */}
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200">
                  <button
                    type="button"
                    disabled={i === 0}
                    onClick={() => moveLeft(i)}
                    className="w-8 h-8 rounded-lg bg-black/80 text-white flex items-center justify-center hover:bg-black disabled:opacity-40 disabled:hover:bg-black/80 transition-all"
                    title="Move Left"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={i === data.screenshots.length - 1}
                    onClick={() => moveRight(i)}
                    className="w-8 h-8 rounded-lg bg-black/80 text-white flex items-center justify-center hover:bg-black disabled:opacity-40 disabled:hover:bg-black/80 transition-all"
                    title="Move Right"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeScreenshot(i)}
                    className="w-8 h-8 rounded-lg bg-black/80 text-red-400 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
                    title="Remove Image"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Required Count Reminder */}
        <div className="flex items-center gap-1.5 mt-3">
          {data.screenshots.length >= 3 ? (
            <div className="flex items-center gap-1 text-emerald-600 dark:text-cyber-green text-[11px] font-bold">
              <Check className="w-3.5 h-3.5" /> {data.screenshots.length} screenshot(s) uploaded
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 text-[11px] font-bold">
              <Info className="w-3.5 h-3.5" /> {3 - data.screenshots.length} more screenshot(s) required (Minimum 3)
            </div>
          )}
        </div>
      </Field>

      {/* Product Live Media Carousel Preview */}
      { (data.coverImage || data.screenshots.length > 0) && (
        <div className="p-5 rounded-2xl border border-border bg-card">
          <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground font-mono mb-3">
            Product Media Carousel Preview
          </div>
          <MediaCarousel coverImage={data.coverImage} screenshots={data.screenshots} />
        </div>
      )}

      {/* URL fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Product Video URL" hint="YouTube, Loom, or Vimeo" error={errors.videoUrl}>
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-muted border border-border">
            <Video className="w-4 h-4 text-muted-foreground shrink-0" />
            <input value={data.videoUrl} onChange={e => onChange("videoUrl", e.target.value)}
              placeholder="https://loom.com/share/..."
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none" />
          </div>
        </Field>
        <Field label="Live Demo URL" required hint="Working demo for buyers." error={errors.demoUrl}>
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-muted border border-border">
            <Globe className="w-4 h-4 text-muted-foreground shrink-0" />
            <input value={data.demoUrl} onChange={e => onChange("demoUrl", e.target.value)}
              placeholder="https://demo.yourproduct.com"
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none" />
          </div>
        </Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Documentation URL" required error={errors.docsUrl}>
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-muted border border-border">
            <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
            <input value={data.docsUrl} onChange={e => onChange("docsUrl", e.target.value)}
              placeholder="https://docs.yourproduct.com"
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none" />
          </div>
        </Field>
        <Field label="Product Walkthrough URL" hint="Arcade, Loom, or similar" error={errors.walkthroughUrl}>
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-muted border border-border">
            <Layers className="w-4 h-4 text-muted-foreground shrink-0" />
            <input value={data.walkthroughUrl} onChange={e => onChange("walkthroughUrl", e.target.value)}
              placeholder="https://app.arcade.software/..."
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none" />
          </div>
        </Field>
      </div>
    </div>
  );
}


// ─── STEP 3: Pricing & Delivery ────────────────────────────────────────────────
function Step3({ data, onChange, errors }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Field label="Product Price (₹)" required error={errors.price}>
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-muted border border-border">
            <span className="text-sm font-bold text-muted-foreground">₹</span>
            <input type="number" value={data.price} onChange={e => onChange("price", e.target.value)}
              placeholder="4999"
              className="flex-1 bg-transparent text-sm font-bold text-foreground placeholder:text-muted-foreground outline-none" />
          </div>
        </Field>
        <Field label="Delivery Time" required>
          <select value={data.deliveryDays} onChange={e => onChange("deliveryDays", e.target.value)} className={selectCls}>
            {[1,2,3,5,7,10,14,21,30].map(d => <option key={d} value={d}>{d} day{d > 1 ? "s" : ""}</option>)}
          </select>
        </Field>
        <Field label="Revisions Included">
          <select value={data.revisions} onChange={e => onChange("revisions", e.target.value)} className={selectCls}>
            {REVISION_OPTIONS.map(r => <option key={r} value={r}>{r} revision{r === "1" ? "" : r === "Unlimited" ? "s" : "s"}</option>)}
          </select>
        </Field>
      </div>

      <Field label="Support Duration" required>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {SUPPORT_MODELS.map(m => (
            <button key={m} type="button" onClick={() => onChange("support", m)}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all border ${
                data.support === m
                  ? "bg-foreground text-background border-foreground"
                  : "bg-muted text-muted-foreground border-border hover:border-foreground/40 hover:text-foreground"
              }`}>
              {m}
            </button>
          ))}
        </div>
      </Field>

      <Field label="Deployment Method" required hint="How will this product reach buyers?">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {DEPLOYMENT_METHODS.map(m => (
            <button key={m} type="button" onClick={() => onChange("deploymentMethod", m)}
              className={`p-4 rounded-xl text-left transition-all border ${
                data.deploymentMethod === m
                  ? "bg-foreground/10 border-foreground"
                  : "bg-muted border-border hover:border-foreground/40"
              }`}>
              <div className={`w-2 h-2 rounded-full mb-2 ${data.deploymentMethod === m ? "bg-foreground" : "bg-muted-foreground/30"}`} />
              <div className="text-sm font-semibold text-foreground">{m}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">
                {m === "Developer Hosted" ? "You host & manage infrastructure"
                  : m === "Client Hosted" ? "Buyer provides their own hosting"
                  : "Custom setup & deployment plan"}
              </div>
            </button>
          ))}
        </div>
      </Field>

      <Field label="Hosting Requirements" hint="What infrastructure does the buyer need?">
        <textarea value={data.hostingRequirements} onChange={e => onChange("hostingRequirements", e.target.value)}
          placeholder="e.g. WhatsApp Business API key, any hosting plan (deployment provided), domain name optional..."
          rows={3} className={`${inputCls} resize-none`} />
      </Field>

      {/* Pricing Preview */}
      <div className="p-5 rounded-xl bg-muted border border-border">
        <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground font-mono mb-3">Pricing Preview</div>
        <div className="space-y-2">
          {[
            { label: "Product Price",    value: data.price ? `₹${Number(data.price).toLocaleString()}` : "—", cls: "text-foreground" },
            { label: "Platform Fee (12%)", value: data.price ? `₹${Math.round(Number(data.price)*0.12).toLocaleString()}` : "—", cls: "text-muted-foreground" },
            { label: "Your Earnings",    value: data.price ? `₹${Math.round(Number(data.price)*0.88).toLocaleString()}` : "—", cls: "text-emerald-600 dark:text-emerald-400 font-bold" },
          ].map(row => (
            <div key={row.label} className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{row.label}</span>
              <span className={`text-sm font-bold ${row.cls}`}>{row.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Config Field Editor ─────────────────────────────────────────────────────────
function ConfigFieldEditor({ field, onChange, onDelete, allFields }) {
  const [expanded, setExpanded] = useState(field._new || false);
  const [optionInput, setOptionInput] = useState("");
  const fieldMeta = getFieldMeta(field.type);
  const FieldIcon = fieldMeta.icon;

  const addOption = () => {
    if (optionInput.trim()) {
      onChange({ ...field, options: [...(field.options || []), optionInput.trim()] });
      setOptionInput("");
    }
  };

  const conditionalSourceFields = allFields.filter(f =>
    f.id !== field.id && ["dropdown","radio","checkbox","toggle"].includes(f.type)
  );

  return (
    <motion.div layout initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-10 }}
      className="rounded-xl overflow-hidden border border-border bg-card">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => setExpanded(p => !p)}>
        <div className="cursor-grab text-muted-foreground/50 hover:text-muted-foreground"><Grip className="w-4 h-4" /></div>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-muted border border-border shrink-0">
          <FieldIcon className={`w-3.5 h-3.5 ${fieldMeta.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-foreground truncate">
            {field.label || <span className="text-muted-foreground italic">Untitled Field</span>}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[10px] font-mono text-muted-foreground">{fieldMeta.label}</span>
            {field.required && <span className="text-[9px] font-bold text-red-500 uppercase tracking-wider">Required</span>}
            {field.conditionalOn && <span className="text-[9px] font-bold text-blue-500 uppercase tracking-wider">Conditional</span>}
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button type="button" onClick={e => { e.stopPropagation(); onDelete(); }}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all">
            <X className="w-3.5 h-3.5" />
          </button>
          <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${expanded ? "rotate-90" : ""}`} />
        </div>
      </div>

      {/* Expanded Settings */}
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height:0, opacity:0 }} animate={{ height:"auto", opacity:1 }}
            exit={{ height:0, opacity:0 }} transition={{ duration:0.2 }}
            className="border-t border-border overflow-hidden">
            <div className="p-4 space-y-4 bg-muted/30">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/70 font-mono mb-1.5 block">Field Name *</label>
                  <input value={field.label} onChange={e => onChange({ ...field, label: e.target.value })}
                    placeholder="e.g. Restaurant Name" className={inputCls} />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/70 font-mono mb-1.5 block">Field Type</label>
                  <select value={field.type} onChange={e => onChange({ ...field, type: e.target.value, options: [] })} className={selectCls}>
                    {FIELD_TYPES.map(ft => <option key={ft.type} value={ft.type}>{ft.label}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/70 font-mono mb-1.5 block">Helper Text</label>
                <input value={field.description || ""} onChange={e => onChange({ ...field, description: e.target.value })}
                  placeholder="Help text shown below the field..." className={inputCls} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/70 font-mono mb-1.5 block">Placeholder</label>
                  <input value={field.placeholder || ""} onChange={e => onChange({ ...field, placeholder: e.target.value })}
                    placeholder="e.g. Enter your name..." className={inputCls} />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/70 font-mono mb-1.5 block">Default Value</label>
                  <input value={field.defaultValue || ""} onChange={e => onChange({ ...field, defaultValue: e.target.value })}
                    placeholder="Optional..." className={inputCls} />
                </div>
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <div onClick={() => onChange({ ...field, required: !field.required })}
                  className={`relative rounded-full transition-all duration-200 cursor-pointer flex-shrink-0 ${field.required ? "bg-foreground" : "bg-muted-foreground/30"}`}
                  style={{ width:40, height:22 }}>
                  <div className={`absolute top-0.5 w-[18px] h-[18px] rounded-full bg-white shadow transition-all duration-200`}
                    style={{ left: field.required ? 20 : 2 }} />
                </div>
                <span className="text-sm font-semibold text-foreground">Required field</span>
              </label>

              {["dropdown","radio","multiselect"].includes(field.type) && (
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/70 font-mono mb-2 block">Options *</label>
                  <div className="space-y-1.5 mb-2">
                    {(field.options || []).map((opt, i) => (
                      <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted border border-border">
                        <span className="flex-1 text-xs text-foreground">{opt}</span>
                        <button type="button" onClick={() => onChange({ ...field, options: field.options.filter((_,idx) => idx !== i) })}
                          className="text-muted-foreground hover:text-red-500 transition-colors"><X className="w-3 h-3" /></button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input value={optionInput} onChange={e => setOptionInput(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addOption())}
                      placeholder="Add option..." className={inputCls} />
                    <button type="button" onClick={addOption}
                      className="px-3 py-2 rounded-xl text-xs font-bold bg-muted border border-border text-foreground hover:bg-foreground hover:text-background transition-all">
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {conditionalSourceFields.length > 0 && (
                <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30">
                  <div className="flex items-center gap-2 mb-3">
                    <Zap className="w-3.5 h-3.5 text-blue-500" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 font-mono">Conditional Logic</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-muted-foreground mb-1 block">Show this field if...</label>
                      <select value={field.conditionalOn || ""} onChange={e => onChange({ ...field, conditionalOn: e.target.value, conditionalValue: "" })} className={selectCls}>
                        <option value="">Always show</option>
                        {conditionalSourceFields.map(f => <option key={f.id} value={f.id}>{f.label || f.id}</option>)}
                      </select>
                    </div>
                    {field.conditionalOn && (
                      <div>
                        <label className="text-[10px] text-muted-foreground mb-1 block">...equals value</label>
                        <input value={field.conditionalValue || ""} onChange={e => onChange({ ...field, conditionalValue: e.target.value })}
                          placeholder="e.g. Yes" className={inputCls} />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Config Live Preview ─────────────────────────────────────────────────────────
function ConfigPreview({ fields }) {
  const [values, setValues] = useState({});
  const visibleFields = fields.filter(f => {
    if (!f.conditionalOn) return true;
    return values[f.conditionalOn] === f.conditionalValue;
  });

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Eye className="w-4 h-4 text-muted-foreground" />
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest font-mono">Live Preview — Buyer View</span>
      </div>
      {visibleFields.length === 0 ? (
        <div className="text-center py-10">
          <LayoutGrid className="w-8 h-8 mx-auto mb-2 text-muted-foreground/30" />
          <p className="text-xs text-muted-foreground">Add fields to see preview</p>
        </div>
      ) : (
        <div className="space-y-4">
          {visibleFields.map(field => {
            const meta = getFieldMeta(field.type);
            const MetaIcon = meta.icon;
            return (
              <div key={field.id}>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-foreground mb-1.5">
                  <MetaIcon className={`w-3 h-3 ${meta.color}`} />
                  {field.label || "Untitled Field"}
                  {field.required && <span className="text-red-500">*</span>}
                </label>
                {field.description && <p className="text-[10px] text-muted-foreground mb-1.5">{field.description}</p>}
                {field.type === "textarea" ? (
                  <textarea rows={2} placeholder={field.placeholder || ""} onChange={e => setValues(p => ({ ...p, [field.id]: e.target.value }))}
                    className={`${inputCls} resize-none text-xs py-2.5`} />
                ) : field.type === "dropdown" ? (
                  <select onChange={e => setValues(p => ({ ...p, [field.id]: e.target.value }))} className={`${selectCls} text-xs py-2.5`}>
                    <option value="">{field.placeholder || "Select..."}</option>
                    {(field.options || []).map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                ) : ["file","pdf","image","video"].includes(field.type) ? (
                  <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-muted border border-border cursor-pointer hover:bg-muted/80 transition-colors">
                    <Upload className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Click to upload {field.type === "pdf" ? "PDF" : field.type}</span>
                  </div>
                ) : field.type === "toggle" ? (
                  <div className="flex items-center gap-2">
                    <div className="rounded-full bg-muted-foreground/30 cursor-pointer" style={{ width:40, height:22 }}>
                      <div className="w-[18px] h-[18px] rounded-full bg-white shadow m-[2px]" />
                    </div>
                    <span className="text-xs text-muted-foreground">{field.placeholder || "Toggle option"}</span>
                  </div>
                ) : field.type === "color" ? (
                  <div className="flex items-center gap-2">
                    <input type="color" className="w-10 h-8 rounded-lg cursor-pointer border border-border" />
                    <span className="text-xs text-muted-foreground">Click to pick color</span>
                  </div>
                ) : (
                  <input type={field.type === "email" ? "email" : field.type === "number" ? "number" : "text"}
                    placeholder={field.placeholder || ""}
                    onChange={e => setValues(p => ({ ...p, [field.id]: e.target.value }))}
                    className={`${inputCls} text-xs py-2.5`} />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── STEP 4: Config Builder ────────────────────────────────────────────────────
function Step4({ data, onChange }) {
  const [showFieldPicker, setShowFieldPicker] = useState(false);
  const fields = data.configFields || [];

  const addField = (type) => {
    const newField = {
      id: `field_${Date.now()}`, type, label: "", description: "", placeholder: "",
      required: false, options: [], defaultValue: "", conditionalOn: "", conditionalValue: "", _new: true
    };
    onChange("configFields", [...fields, newField]);
    setShowFieldPicker(false);
  };

  const updateField = (id, updated) => onChange("configFields", fields.map(f => f.id === id ? { ...updated, _new: false } : f));
  const deleteField = (id) => onChange("configFields", fields.filter(f => f.id !== id));

  const QUICK_TEMPLATES = [
    { label: "🍽️ Restaurant Bot", fields: [
      { id:"f1", type:"text",  label:"Restaurant Name", required:true,  placeholder:"Enter restaurant name..." },
      { id:"f2", type:"pdf",   label:"Menu PDF",        required:true,  description:"Upload your complete menu" },
      { id:"f3", type:"image", label:"Restaurant Logo", required:true },
      { id:"f4", type:"phone", label:"WhatsApp Number", required:true,  placeholder:"+91 98765 43210" },
      { id:"f5", type:"text",  label:"Address",         required:true },
      { id:"f6", type:"text",  label:"Business Hours",  required:false, placeholder:"Mon-Sat 10am-10pm" },
    ]},
    { label: "📊 CRM Dashboard", fields: [
      { id:"f1", type:"text",        label:"Company Name", required:true },
      { id:"f2", type:"email",       label:"Admin Email",  required:true },
      { id:"f3", type:"number",      label:"Team Size",    required:true },
      { id:"f4", type:"multiselect", label:"Departments",  required:false, options:["Sales","Marketing","Support","HR","Engineering"] },
    ]},
    { label: "🛒 E-Commerce", fields: [
      { id:"f1", type:"text",  label:"Store Name",   required:true },
      { id:"f2", type:"url",   label:"Domain Name",  required:false, placeholder:"yourstore.com" },
      { id:"f3", type:"image", label:"Brand Logo",   required:true },
      { id:"f4", type:"color", label:"Brand Color",  required:false },
    ]},
  ];

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30">
        <div className="flex items-start gap-3">
          <Shield className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-blue-700 dark:text-blue-400">Dynamic Buyer Onboarding</p>
            <p className="text-[11px] text-blue-600/80 dark:text-blue-400/70 mt-0.5">
              Define exactly what information you need from every buyer. This generates a custom onboarding form — no hardcoded fields.
            </p>
          </div>
        </div>
      </div>

      {fields.length === 0 && (
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground font-mono mb-3">Quick Start Templates</div>
          <div className="grid grid-cols-3 gap-3">
            {QUICK_TEMPLATES.map(t => (
              <button key={t.label} type="button"
                onClick={() => onChange("configFields", t.fields.map(f => ({ ...f, options: f.options || [], description: f.description || "", placeholder: f.placeholder || "", defaultValue: "", conditionalOn: "", conditionalValue: "", _new: false })))}
                className="p-4 rounded-xl text-left border border-border bg-card hover:bg-muted hover:border-foreground/40 transition-all">
                <div className="text-sm font-semibold text-foreground mb-1">{t.label}</div>
                <div className="text-[10px] text-muted-foreground font-mono">{t.fields.length} fields</div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Builder */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground font-mono">Fields ({fields.length})</div>
            <button type="button" onClick={() => setShowFieldPicker(p => !p)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                showFieldPicker ? "bg-foreground text-background border-foreground" : "bg-muted border-border text-foreground hover:bg-foreground hover:text-background"
              }`}>
              <Plus className="w-3.5 h-3.5" /> Add Field
            </button>
          </div>

          <AnimatePresence>
            {showFieldPicker && (
              <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }}
                className="mb-4 p-3 rounded-xl bg-popover border border-border shadow-xl">
                <div className="grid grid-cols-3 gap-1.5">
                  {FIELD_TYPES.map(ft => {
                    const FtIcon = ft.icon;
                    return (
                      <button key={ft.type} type="button" onClick={() => addField(ft.type)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-left bg-muted border border-border hover:bg-foreground hover:text-background transition-all group">
                        <FtIcon className={`w-3.5 h-3.5 shrink-0 ${ft.color} group-hover:text-background`} />
                        <span className="text-[10px] font-semibold text-foreground group-hover:text-background truncate">{ft.label}</span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-2">
            <AnimatePresence>
              {fields.map(field => (
                <ConfigFieldEditor key={field.id} field={field}
                  onChange={(updated) => updateField(field.id, updated)}
                  onDelete={() => deleteField(field.id)}
                  allFields={fields} />
              ))}
            </AnimatePresence>
            {fields.length === 0 && (
              <div className="text-center py-12 rounded-xl border-2 border-dashed border-border">
                <Settings className="w-8 h-8 mx-auto mb-2 text-muted-foreground/30" />
                <p className="text-xs text-muted-foreground">No fields yet. Click "Add Field" or use a template above.</p>
              </div>
            )}
          </div>
        </div>

        {/* Preview */}
        <div className="sticky top-6">
          <div className="p-5 rounded-xl border border-border bg-card">
            <ConfigPreview fields={fields} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── STEP 5: Review & Submit ────────────────────────────────────────────────────
// ─── Preview Support Components ────────────────────────────────────────────────
const FIELD_META = {
  text: { icon: Type, label: "Text" },
  textarea: { icon: AlignLeft, label: "Text Area" },
  number: { icon: Hash, label: "Number" },
  email: { icon: Mail, label: "Email" },
  phone: { icon: Phone, label: "Phone" },
  url: { icon: Globe, label: "URL" },
  dropdown: { icon: ChevronDown, label: "Dropdown" },
  multiselect: { icon: List, label: "Multi Select" },
  checkbox: { icon: CheckSquare, label: "Checkbox" },
  radio: { icon: Circle, label: "Radio" },
  date: { icon: Calendar, label: "Date" },
  file: { icon: Paperclip, label: "File" },
  pdf: { icon: FileText, label: "PDF" },
  image: { icon: Image, label: "Image" },
  video: { icon: Video, label: "Video" },
  color: { icon: Palette, label: "Color" },
  location: { icon: MapPin, label: "Location" },
  toggle: { icon: ToggleLeft, label: "Toggle" },
};

function PreviewFieldRenderer({ field, value, onChange, error }) {
  const meta = FIELD_META[field.type] || FIELD_META.text;
  const Icon = meta.icon;

  const wrapperStyle = {
    background: "rgba(255,255,255,0.03)",
    border: error ? "0.5px solid rgba(239,68,68,0.5)" : "0.5px solid rgba(255,255,255,0.1)",
    borderRadius: 12,
    padding: "12px 16px",
    display: "flex",
    alignItems: "flex-start",
    gap: 12,
  };

  const inputStyle = {
    background: "transparent",
    color: "white",
    outline: "none",
    width: "100%",
    fontSize: 13,
    fontFamily: "'Inter', sans-serif",
  };

  return (
    <div>
      <label className="flex items-center gap-1.5 text-xs font-semibold text-foreground/70 mb-2">
        <Icon className="w-3.5 h-3.5 text-foreground/45 shrink-0" />
        {field.label || "Untitled Field"}
        {field.required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {field.description && (
        <p className="text-[11px] text-foreground/35 mb-2">{field.description}</p>
      )}

      {field.type === "textarea" ? (
        <div style={wrapperStyle}>
          <textarea value={value || ""} onChange={e => onChange(e.target.value)}
            placeholder={field.placeholder || ""} rows={3}
            style={{ ...inputStyle, resize: "none", lineHeight: 1.6 }} />
        </div>
      ) : field.type === "dropdown" ? (
        <div style={wrapperStyle}>
          <Icon className="w-4 h-4 text-foreground/30 shrink-0 mt-0.5" />
          <select value={value || ""} onChange={e => onChange(e.target.value)} style={{ ...inputStyle, appearance: "none" }} className="bg-black/90 text-white border-0 outline-none w-full cursor-pointer">
            <option value="">Select option...</option>
            {(field.options || []).map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
      ) : ["file", "pdf", "image", "video"].includes(field.type) ? (
        <label className="cursor-pointer block">
          <div style={{ ...wrapperStyle, cursor: "pointer" }} className="hover:bg-foreground/4 transition-colors">
            <Upload className="w-4 h-4 text-foreground/30 shrink-0 mt-0.5" />
            <div>
              {value ? (
                <span className="text-sm text-emerald-400 font-semibold">✓ {value.name || "File selected"}</span>
              ) : (
                <span className="text-sm text-foreground/30">
                  Click to mock upload {field.type === "pdf" ? "PDF" : field.type}
                </span>
              )}
            </div>
          </div>
          <input type="file" className="hidden" accept={field.accept || (field.type === "pdf" ? ".pdf" : field.type === "image" ? ".jpg,.jpeg,.png,.webp,.svg" : "")}
            onChange={e => onChange({ name: e.target.files?.[0]?.name || "MockFile.ext" })} />
        </label>
      ) : field.type === "toggle" ? (
        <div className="flex items-center gap-3">
          <div onClick={() => onChange(value === "true" ? "false" : "true")}
            className="cursor-pointer rounded-full relative transition-all duration-200"
            style={{ width: 44, height: 24, background: value === "true" ? "white" : "rgba(255,255,255,0.12)" }}>
            <div className="absolute rounded-full bg-black shadow-sm transition-all duration-200"
              style={{ width: 18, height: 18, top: 3, left: value === "true" ? 23 : 3 }} />
          </div>
          <span className="text-sm text-foreground/60 font-medium">
            {value === "true" ? "Yes" : "No"}
          </span>
        </div>
      ) : field.type === "color" ? (
        <div className="flex items-center gap-3">
          <input type="color" value={value || "#000000"} onChange={e => onChange(e.target.value)}
            className="w-12 h-10 rounded-xl cursor-pointer bg-transparent border-0" />
          <span className="text-sm text-foreground/40 font-mono">{value || "#000000"}</span>
        </div>
      ) : (
        <div style={wrapperStyle}>
          <Icon className="w-4 h-4 text-foreground/30 shrink-0 mt-0.5" />
          <input
            type={field.type === "email" ? "email" : field.type === "phone" ? "tel" : field.type === "url" ? "url" : field.type === "number" ? "number" : "text"}
            value={value || ""} onChange={e => onChange(e.target.value)}
            placeholder={field.placeholder || ""}
            style={inputStyle}
          />
        </div>
      )}

      {error && (
        <div className="flex items-center gap-1.5 mt-1.5">
          <AlertCircle className="w-3 h-3 text-red-400" />
          <span className="text-[11px] text-red-400">{error}</span>
        </div>
      )}
    </div>
  );
}

function PreviewConfigWizard({ configFields, onComplete, onBack }) {
  const fields = configFields || [];
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});
  const [currentGroup, setCurrentGroup] = useState(0);

  const groups = [];
  for (let i = 0; i < fields.length; i += 4) groups.push(fields.slice(i, i + 4));
  if (groups.length === 0) groups.push([]);

  const visibleFields = (groups[currentGroup] || []).filter(f => {
    if (!f.conditionalOn) return true;
    return values[f.conditionalOn] === f.conditionalValue;
  });

  const validate = () => {
    const e = {};
    (groups[currentGroup] || []).forEach(f => {
      if (f.required && !values[f.id]) e[f.id] = `${f.label || 'Field'} is required`;
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => {
    if (!validate()) return;
    if (currentGroup < groups.length - 1) setCurrentGroup(g => g + 1);
    else onComplete(values);
  };

  const groupLabels = ["Business Information", "Brand Assets", "Technical Setup", "Custom Requirements"];

  return (
    <div className="space-y-6 text-foreground">
      {/* Progress */}
      <div className="flex items-center gap-2 mb-6">
        {groups.map((_, i) => (
          <div key={i} className="flex items-center flex-1">
            <div className={`h-1.5 w-full rounded-full transition-all duration-500 ${i <= currentGroup ? "bg-white" : "bg-white/10"}`} />
          </div>
        ))}
      </div>

      <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1 font-mono">
        Step {currentGroup + 1} of {Math.max(groups.length, 1)}
      </div>
      <h2 className="text-lg font-bold mb-6" style={{ fontFamily: "Georgia, serif" }}>
        {groupLabels[currentGroup] || "Configuration Setup"}
      </h2>

      <div className="space-y-5">
        {fields.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No dynamic onboarding fields defined.
          </div>
        ) : visibleFields.length > 0 ? (
          visibleFields.map(field => (
            <PreviewFieldRenderer
              key={field.id}
              field={field}
              value={values[field.id]}
              onChange={v => setValues(p => ({ ...p, [field.id]: v }))}
              error={errors[field.id]}
            />
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No fields visible on this step.
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-4">
        <button onClick={() => currentGroup > 0 ? setCurrentGroup(g => g - 1) : onBack()}
          className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all border border-border bg-muted hover:bg-foreground/10">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <button onClick={next}
          className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold bg-foreground text-background hover:bg-foreground/90">
          {currentGroup < groups.length - 1 ? "Continue" : "Review Configuration"}
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function PreviewConfigReview({ allData, configValues, onConfirm, onBack }) {
  const [confirmed, setConfirmed] = useState(false);
  const fields = allData.configFields || [];
  const price = parseFloat(allData.price) || 0;
  const gst = Math.round(price * 0.18);
  const total = price + gst;

  const getDisplayValue = (field, value) => {
    if (!value) return "—";
    if (value.name) return value.name;
    if (field.type === "toggle") return value === "true" ? "Yes" : "No";
    if (field.type === "color") return value;
    return String(value);
  };

  return (
    <div className="space-y-6 text-foreground">
      <div>
        <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1 font-mono">Step 5 of 5</div>
        <h2 className="text-lg font-bold" style={{ fontFamily: "Georgia, serif" }}>
          Review & Confirm Onboarding
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          Verify configuration fields from the buyer's perspective.
        </p>
      </div>

      <div className="p-5 rounded-xl border border-border bg-muted/20">
        <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4 font-mono">
          Configuration Summary
        </div>
        <div className="space-y-3">
          {fields.map(field => {
            const val = getDisplayValue(field, configValues[field.id]);
            return (
              <div key={field.id} className="flex items-start justify-between gap-3">
                <span className="text-xs text-muted-foreground shrink-0">{field.label || "Untitled field"}</span>
                <span className="text-xs font-semibold text-right text-foreground/85 truncate max-w-xs">
                  {val === "—" ? <span className="text-muted-foreground/30">Not provided</span> : val}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="p-5 rounded-xl border border-border bg-muted/20">
        <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4 font-mono">
          Order Summary (Escrow Mockup)
        </div>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-xs text-muted-foreground">Product: {allData.title}</span>
            <span className="text-sm font-bold">₹{price.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-muted-foreground">GST (18%)</span>
            <span className="text-xs text-muted-foreground">₹{gst.toLocaleString()}</span>
          </div>
          <div className="h-px bg-border" />
          <div className="flex justify-between items-center">
            <span className="text-sm font-bold">Total (Escrow)</span>
            <span className="text-xl font-bold">₹{total.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="text-[10px] text-emerald-400/80">
              Protected by Deployra Escrow. Released only after delivery approval.
            </span>
          </div>
        </div>
      </div>

      {/* Confirmations */}
      <div className="space-y-3">
        {[
          "My configuration is correct and complete",
          "Uploaded files are the final versions",
          "I understand payment goes into Deployra Escrow",
        ].map((text, i) => (
          <label key={i} className="flex items-start gap-3 cursor-pointer group">
            <div onClick={() => setConfirmed(p => !p)}
              className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-all ${confirmed ? "bg-foreground border-foreground" : "border-border group-hover:border-foreground/40"}`}>
              {confirmed && <Check className="w-3 h-3 text-background" />}
            </div>
            <span className="text-xs text-muted-foreground leading-relaxed">{text}</span>
          </label>
        ))}
      </div>

      <div className="flex gap-3">
        <button onClick={onBack}
          className="px-5 py-3 rounded-xl text-sm font-semibold border border-border bg-muted hover:bg-foreground/10">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <button onClick={() => confirmed && onConfirm()} disabled={!confirmed}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold bg-foreground text-background hover:bg-foreground/90 disabled:opacity-40">
          <CreditCard className="w-4 h-4" /> Proceed to Payment — ₹{total.toLocaleString()}
        </button>
      </div>
    </div>
  );
}

function PreviewModalContent({ allData }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [showCheckout, setShowCheckout] = useState(false);
  const [purchaseStep, setPurchaseStep] = useState("detail"); // detail | config | review | success
  const [configValues, setConfigValues] = useState({});
  const [mockOrderId, setMockOrderId] = useState("");
  const [processing, setProcessing] = useState(false);

  const price = parseFloat(allData.price) || 0;
  const deliveryDays = parseInt(allData.deliveryDays, 10) || 7;
  const revisions = allData.revisions || "2";
  const support = allData.support || "30 Days";
  const deploymentMethod = allData.deploymentMethod || "Developer Hosted";
  const category = allData.category || "Other";

  const handlePayment = async () => {
    setProcessing(true);
    await new Promise(r => setTimeout(r, 2000));
    setMockOrderId("ORD-" + Math.floor(Math.random() * 90000 + 10000));
    setProcessing(false);
    setPurchaseStep("success");
  };

  const mockReviews = [
    { name: "John Doe", rating: 5, comment: "This fits perfectly into our team's workflow. Extremely easy to use and maintain.", date: "Today" },
    { name: "Sarah Connor", rating: 4.8, comment: "Outstanding product, robust configurations. The support duration is great.", date: "Yesterday" }
  ];

  const rating = 5.0;
  const reviewCount = mockReviews.length;

  if (showCheckout) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <div className="flex items-center justify-between mb-8 border-b border-border pb-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground font-mono">MOCK CHECKOUT</span>
            <h3 className="text-xl font-bold text-foreground mt-0.5" style={{ fontFamily: "Georgia, serif" }}>{allData.title || "Product Preview"}</h3>
          </div>
          <button
            onClick={() => {
              setShowCheckout(false);
              setPurchaseStep("detail");
            }}
            className="w-9 h-9 rounded-full bg-muted border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {purchaseStep === "success" && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 bg-emerald-500/10 border border-emerald-500/30">
              <Check className="w-10 h-10 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2" style={{ fontFamily: "Georgia, serif" }}>
              Order Created! (Mock)
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Onboarding simulation completed successfully.
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 bg-muted border border-border">
              <span className="text-xs font-mono text-muted-foreground">Mock Order ID:</span>
              <span className="text-xs font-bold text-foreground font-mono">{mockOrderId}</span>
            </div>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => {
                  setShowCheckout(false);
                  setPurchaseStep("detail");
                }}
                className="px-6 py-3 rounded-xl text-sm font-bold bg-foreground text-background hover:bg-foreground/90 transition-all"
              >
                Back to Product Detail
              </button>
            </div>
          </motion.div>
        )}

        {purchaseStep === "review" && (
          <div>
            {processing ? (
              <div className="text-center py-20">
                <RefreshCw className="w-12 h-12 animate-spin mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm font-semibold text-muted-foreground">Simulating escrow payment...</p>
              </div>
            ) : (
              <PreviewConfigReview
                allData={allData}
                configValues={configValues}
                onConfirm={handlePayment}
                onBack={() => setPurchaseStep("config")}
              />
            )}
          </div>
        )}

        {purchaseStep === "config" && (
          <div className="p-6 rounded-2xl border border-border bg-card">
            <PreviewConfigWizard
              configFields={allData.configFields}
              onComplete={(values) => {
                setConfigValues(values);
                setPurchaseStep("review");
              }}
              onBack={() => {
                setShowCheckout(false);
                setPurchaseStep("detail");
              }}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Column */}
      <div className="lg:col-span-2 space-y-6">
        {/* Cover + Screenshots Carousel */}
        <div className="p-4 rounded-2xl border border-border bg-card">
          <MediaCarousel coverImage={allData.coverImage} screenshots={allData.screenshots} />
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-muted border border-border">
          {["overview", "features", "requirements", "reviews"].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className="flex-1 py-2 rounded-lg text-[11px] font-bold capitalize transition-all font-mono"
              style={{
                background: activeTab === tab ? "white" : "transparent",
                color: activeTab === tab ? "black" : "rgba(255, 255, 255, 0.4)"
              }}>
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
            {activeTab === "overview" && (
              <div className="space-y-4">
                <p className="text-sm text-foreground/60 leading-relaxed">{allData.description || "No description provided."}</p>
                <div className="flex flex-wrap gap-2">
                  {(allData.tags || []).map(t => (
                    <span key={t} className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-muted border border-border text-muted-foreground font-mono">
                      {t}
                    </span>
                  ))}
                </div>
                {allData.demoUrl && (
                  <a href={allData.demoUrl} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border border-border bg-muted text-foreground hover:bg-foreground/10 transition-all">
                    <Play className="w-4 h-4" /> Try Live Demo
                  </a>
                )}
              </div>
            )}
            {activeTab === "features" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(allData.features || []).map(f => (
                  <div key={f} className="flex items-center gap-3 p-3 rounded-xl bg-muted/20 border border-border/60">
                    <div className="w-5 h-5 rounded-lg flex items-center justify-center shrink-0 bg-emerald-500/10">
                      <Check className="w-3 h-3 text-emerald-400" />
                    </div>
                    <span className="text-xs text-foreground/75">{f}</span>
                  </div>
                ))}
                {(allData.features || []).length === 0 && (
                  <p className="text-xs text-muted-foreground italic col-span-2">No features defined.</p>
                )}
              </div>
            )}
            {activeTab === "requirements" && (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground mb-3">
                  What you need to provide for deployment:
                </p>
                {(allData.configFields || []).map(f => {
                  const meta = FIELD_META[f.type] || FIELD_META.text;
                  const Icon = meta.icon;
                  return (
                    <div key={f.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/20 border border-border/60">
                      <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
                      <div>
                        <div className="text-xs font-semibold text-foreground/80">
                          {f.label || "Untitled Field"}
                          {f.required && <span className="text-red-400 ml-1">*</span>}
                        </div>
                        {f.description && <div className="text-[10px] text-muted-foreground mt-0.5">{f.description}</div>}
                      </div>
                    </div>
                  );
                })}
                {(allData.configFields || []).length === 0 && (
                  <p className="text-xs text-muted-foreground italic">No custom configuration fields defined.</p>
                )}
              </div>
            )}
            {activeTab === "reviews" && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="text-4xl font-bold" style={{ fontFamily: "Georgia, serif" }}>{rating.toFixed(1)}</div>
                  <div>
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map(s => (
                        <Star key={s} className="w-4 h-4 text-foreground fill-foreground" />
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{reviewCount} reviews (Mocked for Preview)</p>
                  </div>
                </div>
                {mockReviews.map((r, i) => (
                  <div key={i} className="p-4 rounded-xl bg-muted/20 border border-border/60">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-foreground/10 flex items-center justify-center text-xs font-bold">{r.name[0]}</div>
                        <span className="text-xs font-semibold text-muted-foreground">{r.name}</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground font-mono">{r.date}</span>
                    </div>
                    <p className="text-xs text-muted-foreground/80 leading-relaxed">{r.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Right Column (Purchase Card) */}
      <div className="lg:col-span-1">
        <div className="sticky top-6 space-y-4">
          <div className="p-6 rounded-2xl border border-border bg-card">
            {/* Badges */}
            <div className="flex items-center gap-2 mb-4">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 border border-emerald-500/25 text-emerald-400">
                <Shield className="w-2.5 h-2.5" /> Verified
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-yellow-500/10 border border-yellow-500/25 text-yellow-400">
                <Award className="w-2.5 h-2.5" /> Featured
              </span>
            </div>

            <h1 className="text-lg font-bold mb-1" style={{ fontFamily: "Georgia, serif" }}>
              {allData.title || "Product Title Preview"}
            </h1>
            <p className="text-xs text-muted-foreground mb-4">{allData.shortDesc || "No short description provided."}</p>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map(s => (
                  <Star key={s} className="w-3.5 h-3.5 text-foreground fill-foreground" />
                ))}
              </div>
              <span className="text-xs text-muted-foreground font-mono">5.0 (2)</span>
              <span className="text-[10px] text-muted-foreground/50">·</span>
              <span className="text-[10px] text-muted-foreground font-mono">0 deployed</span>
            </div>

            <div className="text-3xl font-bold mb-1" style={{ fontFamily: "Georgia, serif" }}>
              ₹{price.toLocaleString()}
            </div>
            <div className="text-[10px] text-muted-foreground font-mono mb-5">+ 18% GST = ₹{Math.round(price * 1.18).toLocaleString()} total</div>

            <button
              onClick={() => {
                setShowCheckout(true);
                setPurchaseStep("config");
              }}
              className="w-full py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all bg-foreground text-background hover:bg-foreground/90 shimmer-btn"
            >
              <Zap className="w-4 h-4" /> Get Access
            </button>

            <div className="flex items-center justify-center gap-1.5 mt-3">
              <Lock className="w-3 h-3 text-muted-foreground/30" />
              <span className="text-[10px] text-muted-foreground/30">Protected by Deployra Escrow</span>
            </div>

            {/* Meta */}
            <div className="mt-5 pt-5 space-y-3 border-t border-border/60">
              {[
                { icon: Clock, label: "Delivery", value: `${deliveryDays} days` },
                { icon: RefreshCw, label: "Revisions", value: revisions },
                { icon: Shield, label: "Support", value: support },
                { icon: Package, label: "Deployment", value: deploymentMethod },
              ].map(item => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-[11px] text-muted-foreground">{item.label}</span>
                    </div>
                    <span className="text-[11px] font-semibold text-foreground/80">{item.value}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── STEP 5: Review & Submit ────────────────────────────────────────────────────
function Step5({ allData, onSubmit, submitting, submitError, hasPreviewed, onOpenPreview }) {
  const [confirmed, setConfirmed] = useState(false);

  const sections = [
    { title: "Product Information", rows: [
      { label: "Name",       value: allData.title || "—" },
      { label: "Category",   value: allData.category || "—" },
      { label: "Tags",       value: (allData.tags || []).join(", ") || "—" },
      { label: "Features",   value: `${(allData.features || []).length} defined` },
    ]},
    { title: "Media & Demo", rows: [
      { label: "Cover Image",   value: allData.coverImage ? "✓ Set" : "✗ Missing", ok: !!allData.coverImage },
      { label: "Screenshots",   value: `${(allData.screenshots || []).length} added`, ok: (allData.screenshots || []).length >= 3 },
      { label: "Demo URL",      value: allData.demoUrl || "—",   ok: !!allData.demoUrl },
      { label: "Documentation", value: allData.docsUrl || "—",   ok: !!allData.docsUrl },
    ]},
    { title: "Pricing & Delivery", rows: [
      { label: "Price",      value: allData.price ? `₹${Number(allData.price).toLocaleString()}` : "—" },
      { label: "Delivery",   value: allData.deliveryDays ? `${allData.deliveryDays} days` : "—" },
      { label: "Support",    value: allData.support || "—" },
      { label: "Deployment", value: allData.deploymentMethod || "—" },
    ]},
    { title: "Config Builder", rows: [
      { label: "Fields Defined",   value: `${(allData.configFields || []).length} fields`, ok: (allData.configFields || []).length > 0 },
      { label: "Required Fields",  value: `${(allData.configFields || []).filter(f => f.required).length} required` },
    ]},
  ];

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          <p className="text-xs font-bold text-amber-700 dark:text-amber-400">
            Your product will be submitted for review. It goes live after Deployra verification (24–48 hours).
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {sections.map(section => (
          <div key={section.title} className="p-5 rounded-xl border border-border bg-card">
            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground font-mono mb-4">{section.title}</div>
            <div className="space-y-2.5">
              {section.rows.map(row => (
                <div key={row.label} className="flex items-center justify-between gap-3">
                  <span className="text-[11px] text-muted-foreground shrink-0">{row.label}</span>
                  <span className={`text-[11px] font-semibold text-right truncate ${row.ok === false ? "text-red-500" : row.ok === true ? "text-emerald-600 dark:text-emerald-400" : "text-foreground"}`}>
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Marketplace Preview Section */}
      <div className="p-5 rounded-xl border border-border bg-muted/40 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-foreground uppercase tracking-wider font-mono">Marketplace Preview Required</h4>
          <p className="text-xs text-muted-foreground">
            Verify how buyers will view and configure your product listing before submitting.
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenPreview}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-foreground text-background hover:bg-foreground/90 transition-all shrink-0"
        >
          <Eye className="w-4 h-4" /> Preview Listing
        </button>
      </div>

      <div className="space-y-3">
        {["I confirm the demo URL is live and accessible",
          "All screenshots are real product screenshots",
          "Documentation is complete and up to date",
          "The configuration builder is set up correctly"].map((text, i) => (
          <label key={i} className="flex items-start gap-3 cursor-pointer group">
            <div onClick={() => setConfirmed(p => !p)}
              className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                confirmed ? "bg-foreground border-foreground" : "border-border group-hover:border-foreground/50"
              }`}>
              {confirmed && <Check className="w-3 h-3 text-background" />}
            </div>
            <span className="text-xs text-muted-foreground leading-relaxed">{text}</span>
          </label>
        ))}
      </div>

      {submitError && (
        <div className="flex items-start gap-2.5 p-3 rounded-xl border border-red-500/30 bg-red-500/8">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <p className="text-xs text-red-400 font-medium">{submitError}</p>
        </div>
      )}

      <button type="button" onClick={onSubmit} disabled={!confirmed || submitting || !hasPreviewed}
        className="w-full py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-3 transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-foreground text-background hover:bg-foreground/90">
        {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        {!hasPreviewed ? "Please preview listing first" : submitting ? "Submitting for Review..." : "Submit Product for Review"}
      </button>
    </div>
  );
}

// ─── Persistence Key ────────────────────────────────────────────────────────────
const DRAFT_KEY = "deployra_publish_draft";
const STEP_KEY  = "deployra_publish_step";

const EMPTY_FORM = {
  title:"", shortDesc:"", description:"", category:"",
  tags:[], features:[], industries:[], requirements:[],
  coverImage:"", screenshots:[], videoUrl:"", demoUrl:"", docsUrl:"", walkthroughUrl:"",
  price:"", deliveryDays:"7", revisions:"2", support:"30 Days",
  deploymentMethod:"Developer Hosted", hostingRequirements:"",
  configFields:[],
};

function loadDraft() {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    return raw ? { ...EMPTY_FORM, ...JSON.parse(raw) } : EMPTY_FORM;
  } catch { return EMPTY_FORM; }
}

function loadStep() {
  try {
    const s = parseInt(localStorage.getItem(STEP_KEY) || "1", 10);
    return (s >= 1 && s <= 5) ? s : 1;
  } catch { return 1; }
}

// ─── Main Component ─────────────────────────────────────────────────────────────
export default function PublishProduct() {
  const [step, setStep] = useState(loadStep);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [hasPreviewed, setHasPreviewed] = useState(false);

  const [form, setForm] = useState(loadDraft);

  // ── Auto-save form to localStorage on every change ───────────────────────────
  useEffect(() => {
    try { localStorage.setItem(DRAFT_KEY, JSON.stringify(form)); } catch {}
  }, [form]);

  // ── Auto-save current step ───────────────────────────────────────────────────
  useEffect(() => {
    try { localStorage.setItem(STEP_KEY, String(step)); } catch {}
  }, [step]);

  const update = useCallback((key, value) => {
    setForm(p => ({ ...p, [key]: value }));
    setErrors(p => ({ ...p, [key]: undefined }));
  }, []);

  const validate = (currentStep) => {
    const e = {};
    if (currentStep === 1) {
      if (!form.title.trim())    e.title    = "Product name is required";
      if (!form.shortDesc.trim()) e.shortDesc = "Short description is required";
      if (!form.description.trim()) e.description = "Full description is required";
      if (!form.category || !CATEGORIES.includes(form.category)) e.category = "Please select a valid category.";
    }
    if (currentStep === 2) {
      if (!form.coverImage.trim()) {
        e.coverImage = "Cover image is required";
      } else if (!isValidHttpsUrl(form.coverImage)) {
        e.coverImage = "Please enter a valid URL starting with https://";
      }
      if (!form.demoUrl.trim()) {
        e.demoUrl = "Demo URL is required";
      } else if (!isValidHttpsUrl(form.demoUrl)) {
        e.demoUrl = "Please enter a valid URL starting with https://";
      }
      if (!form.docsUrl.trim()) {
        e.docsUrl = "Documentation URL is required";
      } else if (!isValidHttpsUrl(form.docsUrl)) {
        e.docsUrl = "Please enter a valid URL starting with https://";
      }
      if (form.videoUrl && !isValidHttpsUrl(form.videoUrl)) {
        e.videoUrl = "Please enter a valid URL starting with https://";
      }
      if (form.walkthroughUrl && !isValidHttpsUrl(form.walkthroughUrl)) {
        e.walkthroughUrl = "Please enter a valid URL starting with https://";
      }
      if (!form.screenshots || form.screenshots.length < 3) {
        e.screenshots = "Please upload at least 3 screenshots";
      }
    }
    if (currentStep === 3) {
      if (!form.price)           e.price    = "Price is required";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => {
    if (validate(step)) {
      setStep(s => Math.min(s + 1, 5));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const prev = () => {
    setStep(s => Math.max(s - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError("");
    try {
      const token = localStorage.getItem("auth_token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await axios.post(`${API_URL}/products`, {
        ...form,
        price: parseFloat(form.price) || 0,
        deliveryDays: parseInt(form.deliveryDays, 10) || 7,
        isDraft: false,
      }, { withCredentials: true, headers });
      // Clear draft after successful submission
      try { localStorage.removeItem(DRAFT_KEY); localStorage.removeItem(STEP_KEY); } catch {}
      setSubmitted(true);
    } catch (err) {
      const msg = err.response?.data?.message || "Submission failed. Please try again.";
      setSubmitError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setSubmitted(false); setStep(1); setErrors({}); setHasPreviewed(false); setShowPreviewModal(false);
    setForm(EMPTY_FORM);
    // Clear saved draft from localStorage
    try { localStorage.removeItem(DRAFT_KEY); localStorage.removeItem(STEP_KEY); } catch {}
  };

  // ─── Success Screen ─────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="p-6 sm:p-8 max-w-2xl mx-auto">
        <motion.div initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} className="text-center py-20">
          <motion.div initial={{ scale:0 }} animate={{ scale:1 }} transition={{ type:"spring", delay:0.2 }}
            className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 bg-emerald-100 dark:bg-emerald-500/10 border-2 border-emerald-300 dark:border-emerald-500/30">
            <Check className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
          </motion.div>
          <h1 className="text-2xl font-bold text-foreground mb-2" style={{ fontFamily:"Georgia, serif" }}>
            Submitted for Review
          </h1>
          <p className="text-sm text-muted-foreground mb-6">
            Your product is under review by the Deployra team. Verification takes 24–48 hours.
          </p>
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 dark:bg-amber-500/10 border border-amber-300 dark:border-amber-500/30 text-amber-700 dark:text-amber-400 text-[11px] font-bold mb-8">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Pending Verification
          </span>
          <div className="flex gap-3 justify-center mt-6">
            <Link to="/developer/listings">
              <button className="px-6 py-3 rounded-xl text-sm font-bold bg-foreground text-background hover:bg-foreground/90 transition-all">
                Back to Listings
              </button>
            </Link>
            <button onClick={resetForm}
              className="px-6 py-3 rounded-xl text-sm font-semibold border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-all">
              Publish Another
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ─── Wizard ─────────────────────────────────────────────────────────────────
  return (
    <div className="p-6 sm:p-8 max-w-5xl page-fade-in relative">
      {/* Header */}
      <div className="mb-8">
        <Link to="/developer/listings"
          className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors mb-4">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Listings
        </Link>
        <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground font-mono mb-2">
          Developer · Product Publishing
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground" style={{ fontFamily:"Georgia, serif", letterSpacing:"-0.04em" }}>
          Publish Product
        </h1>
        <p className="text-sm text-muted-foreground mt-1.5">{STEPS[step - 1]?.desc}</p>
      </div>

      {/* Step Indicator */}
      <StepIndicator current={step} steps={STEPS} />

      {/* Step Content */}
      <div className="p-6 sm:p-8 rounded-2xl border border-border bg-card shadow-sm">
        <AnimatePresence mode="wait">
          <motion.div key={step}
            initial={{ opacity:0, x:16 }} animate={{ opacity:1, x:0 }}
            exit={{ opacity:0, x:-16 }} transition={{ duration:0.2 }}>
            {step === 1 && <Step1 data={form} onChange={update} errors={errors} />}
            {step === 2 && <Step2 data={form} onChange={update} errors={errors} />}
            {step === 3 && <Step3 data={form} onChange={update} errors={errors} />}
            {step === 4 && <Step4 data={form} onChange={update} />}
            {step === 5 && <Step5 allData={form} onSubmit={handleSubmit} submitting={submitting} submitError={submitError} hasPreviewed={hasPreviewed} onOpenPreview={() => setShowPreviewModal(true)} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      {step < 5 && (
        <div className="flex items-center justify-between mt-6">
          <button onClick={prev} disabled={step === 1}
            className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-all disabled:opacity-30 disabled:cursor-not-allowed">
            <ArrowLeft className="w-4 h-4" /> Previous
          </button>

          {/* Progress dots */}
          <div className="flex items-center gap-2">
            {STEPS.map(s => (
              <div key={s.id} className={`rounded-full transition-all duration-300 ${
                s.id === step ? "w-6 h-2 bg-foreground" : s.id < step ? "w-2 h-2 bg-foreground/50" : "w-2 h-2 bg-border"
              }`} />
            ))}
          </div>

          <button onClick={next}
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold bg-foreground text-background hover:bg-foreground/90 transition-all shadow-sm">
            {step === 4 ? "Review & Submit" : "Continue"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Marketplace Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 bg-[#080808]/98 backdrop-blur-xl overflow-y-auto text-foreground flex flex-col">
          {/* Sticky Header */}
          <div className="sticky top-0 bg-black/80 backdrop-blur-md border-b border-white/10 px-6 py-4 flex items-center justify-between z-50">
            <div className="flex items-center gap-2.5">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-wider font-mono text-muted-foreground">
                Marketplace Preview Mode
              </span>
            </div>
            <button
              onClick={() => {
                setHasPreviewed(true);
                setShowPreviewModal(false);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-white text-black hover:bg-white/90 transition-all shadow-sm"
            >
              <X className="w-4 h-4" /> Close Preview
            </button>
          </div>

          {/* Preview Content */}
          <div className="flex-1 p-6 sm:p-12 max-w-7xl mx-auto w-full relative">
            <PreviewModalContent allData={form} />
          </div>
        </div>
      )}
    </div>
  );
}

