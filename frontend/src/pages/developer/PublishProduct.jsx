import { useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, ArrowRight, Check, Plus, X, Grip, ChevronDown,
  Eye, Upload, Link2, FileText, DollarSign, Settings, Send,
  Image, Video, Globe, Clock, RefreshCw, Shield, Star,
  AlertCircle, Info, Layers, Zap, Package, Move,
  Type, AlignLeft, Hash, Mail, Phone, Calendar, List,
  CheckSquare, Circle, MapPin, Paperclip, ChevronRight,
  ToggleLeft, Palette, LayoutGrid
} from "lucide-react";

// ─── Constants ─────────────────────────────────────────────────────────────────
const STEPS = [
  { id: 1, label: "Product Info",     icon: Package,     desc: "Name, description & category" },
  { id: 2, label: "Media & Demo",     icon: Image,       desc: "Screenshots, video & links" },
  { id: 3, label: "Pricing",          icon: DollarSign,  desc: "Pricing, delivery & support" },
  { id: 4, label: "Config Builder",   icon: Settings,    desc: "Define buyer onboarding" },
  { id: 5, label: "Review & Submit",  icon: Send,        desc: "Final review & publish" },
];

const CATEGORIES = [
  "AI Agent", "Automation", "Chatbot", "CRM", "Dashboard",
  "Data Pipeline", "E-Commerce", "ERP", "SaaS Product", "Analytics",
  "DevOps", "Marketing", "Booking System", "Payment System", "Other",
];

const INDUSTRIES = [
  "Restaurants", "Healthcare", "E-Commerce", "Real Estate", "Education",
  "Finance", "Logistics", "Hospitality", "Legal", "Marketing Agencies",
  "SaaS Companies", "Retail", "Manufacturing", "Non-Profit", "General",
];

const DEPLOYMENT_METHODS = ["Developer Hosted", "Client Hosted", "Custom Deployment"];
const SUPPORT_MODELS = ["No Support", "30 Days", "90 Days", "6 Months", "1 Year", "Custom"];
const REVISION_OPTIONS = ["0", "1", "2", "3", "5", "Unlimited"];

const FIELD_TYPES = [
  { type: "text",        label: "Text Input",    icon: Type,        color: "text-blue-400" },
  { type: "textarea",    label: "Text Area",     icon: AlignLeft,   color: "text-indigo-400" },
  { type: "number",      label: "Number",        icon: Hash,        color: "text-violet-400" },
  { type: "email",       label: "Email",         icon: Mail,        color: "text-sky-400" },
  { type: "phone",       label: "Phone",         icon: Phone,       color: "text-cyan-400" },
  { type: "url",         label: "URL",           icon: Globe,       color: "text-teal-400" },
  { type: "dropdown",    label: "Dropdown",      icon: ChevronDown, color: "text-emerald-400" },
  { type: "multiselect", label: "Multi Select",  icon: List,        color: "text-green-400" },
  { type: "checkbox",    label: "Checkbox",      icon: CheckSquare, color: "text-lime-400" },
  { type: "radio",       label: "Radio Button",  icon: Circle,      color: "text-yellow-400" },
  { type: "date",        label: "Date Picker",   icon: Calendar,    color: "text-orange-400" },
  { type: "file",        label: "File Upload",   icon: Paperclip,   color: "text-red-400" },
  { type: "pdf",         label: "PDF Upload",    icon: FileText,    color: "text-pink-400" },
  { type: "image",       label: "Image Upload",  icon: Image,       color: "text-rose-400" },
  { type: "video",       label: "Video Upload",  icon: Video,       color: "text-amber-400" },
  { type: "color",       label: "Color Picker",  icon: Palette,     color: "text-purple-400" },
  { type: "location",    label: "Location",      icon: MapPin,      color: "text-fuchsia-400" },
  { type: "toggle",      label: "Toggle",        icon: ToggleLeft,  color: "text-cyan-400" },
];

function getFieldIcon(type) {
  return FIELD_TYPES.find(f => f.type === type) || FIELD_TYPES[0];
}

// ─── Step Indicator ─────────────────────────────────────────────────────────────
function StepIndicator({ current, steps }) {
  return (
    <div className="flex items-center gap-0 mb-10">
      {steps.map((step, i) => {
        const done = step.id < current;
        const active = step.id === current;
        const Icon = step.icon;
        return (
          <div key={step.id} className="flex items-center flex-1">
            <div className="flex flex-col items-center gap-1.5 min-w-0">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all duration-300 shrink-0 ${
                done   ? "bg-foreground border-foreground" :
                active ? "bg-foreground/10 border-foreground ring-2 ring-foreground/15 ring-offset-2 ring-offset-background" :
                         "bg-foreground/4 border-foreground/12"
              }`}>
                {done
                  ? <Check className="w-4 h-4 text-background" />
                  : <Icon className={`w-4 h-4 ${active ? "text-foreground" : "text-foreground/25"}`} />
                }
              </div>
              <span className={`text-[9px] font-bold uppercase tracking-wider whitespace-nowrap hidden sm:block ${
                active ? "text-foreground" : done ? "text-foreground/50" : "text-foreground/20"
              }`} style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-px mx-2 transition-all duration-500 ${done ? "bg-foreground/50" : "bg-foreground/8"}`} />
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
      <div className="flex items-center gap-2 mb-2">
        <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/40" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          {label} {required && <span className="text-red-400">*</span>}
        </label>
        {hint && (
          <span className="text-[10px] text-foreground/25 font-normal normal-case" style={{ fontFamily: "'Inter', sans-serif", letterSpacing: 0 }}>
            — {hint}
          </span>
        )}
      </div>
      {children}
      {error && (
        <div className="flex items-center gap-1.5 mt-1.5">
          <AlertCircle className="w-3 h-3 text-red-400" />
          <span className="text-[11px] text-red-400" style={{ fontFamily: "'Inter', sans-serif" }}>{error}</span>
        </div>
      )}
    </div>
  );
}

const inputCls = "w-full px-4 py-3 rounded-xl text-sm font-medium outline-none transition-all duration-200 placeholder-foreground/20 focus:ring-1 focus:ring-foreground/30";
const inputStyle = { background: "rgba(255,255,255,0.04)", border: "0.5px solid rgba(255,255,255,0.1)", color: "hsl(var(--foreground))", fontFamily: "'Inter', sans-serif" };
const inputFocusStyle = {};

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
          <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
            style={{ background: "rgba(255,255,255,0.06)", border: "0.5px solid rgba(255,255,255,0.15)", color: "hsl(var(--foreground))", fontFamily: "'Inter', sans-serif" }}>
            {tag}
            <button type="button" onClick={() => remove(i)} className="text-foreground/40 hover:text-foreground transition-colors"><X className="w-3 h-3" /></button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); add(); } if (e.key === "," && input) { e.preventDefault(); add(); } }}
          placeholder={placeholder}
          className={inputCls} style={inputStyle}
        />
        <button type="button" onClick={() => add()} className="px-4 py-3 rounded-xl text-xs font-bold transition-all hover:bg-foreground/8"
          style={{ border: "0.5px solid rgba(255,255,255,0.15)", color: "hsl(var(--foreground) / 0.6)" }}>
          <Plus className="w-4 h-4" />
        </button>
      </div>
      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {suggestions.filter(s => !value.includes(s)).slice(0, 8).map(s => (
            <button key={s} type="button" onClick={() => add(s)}
              className="px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all hover:bg-foreground/8"
              style={{ background: "rgba(255,255,255,0.02)", border: "0.5px solid rgba(255,255,255,0.08)", color: "hsl(var(--foreground) / 0.4)" }}>
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
          placeholder="e.g. Restaurant WhatsApp Ordering Bot" className={inputCls} style={inputStyle} />
      </Field>

      <Field label="Short Description" required hint="1-2 sentences. Shown in marketplace cards." error={errors.shortDesc}>
        <input value={data.shortDesc} onChange={e => onChange("shortDesc", e.target.value)}
          placeholder="Automate your restaurant's WhatsApp orders with AI — zero coding required." className={inputCls} style={inputStyle} />
      </Field>

      <Field label="Full Description" required hint="Comprehensive overview for the product page.">
        <textarea value={data.description} onChange={e => onChange("description", e.target.value)}
          placeholder="Describe what your product does, how it works, and what makes it unique..." rows={5}
          className={inputCls} style={{ ...inputStyle, resize: "none" }} />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Category" required>
          <select value={data.category} onChange={e => onChange("category", e.target.value)}
            className={inputCls} style={inputStyle}>
            <option value="">Select category...</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="Tags" hint="Enter & press comma or Enter">
          <TagInput value={data.tags} onChange={v => onChange("tags", v)}
            placeholder="e.g. WhatsApp, AI, Restaurant"
            suggestions={["AI", "Automation", "WhatsApp", "CRM", "No-code", "Analytics", "Stripe", "API"]} />
        </Field>
      </div>

      <Field label="Key Features" hint="What does this product do? Add bullet points.">
        <TagInput value={data.features} onChange={v => onChange("features", v)}
          placeholder="e.g. Real-time order notifications" />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Industries Supported">
          <TagInput value={data.industries} onChange={v => onChange("industries", v)}
            placeholder="e.g. Restaurants"
            suggestions={INDUSTRIES} />
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
function Step2({ data, onChange, errors }) {
  const [screenshotUrl, setScreenshotUrl] = useState("");
  const addScreenshot = () => {
    if (screenshotUrl.trim()) {
      onChange("screenshots", [...(data.screenshots || []), screenshotUrl.trim()]);
      setScreenshotUrl("");
    }
  };
  return (
    <div className="space-y-6">
      <Field label="Cover Image" required hint="Main product thumbnail. Min 1200×630px recommended." error={errors.coverImage}>
        <div className="flex gap-3">
          <input value={data.coverImage} onChange={e => onChange("coverImage", e.target.value)}
            placeholder="https://your-cdn.com/cover-image.jpg" className={inputCls} style={inputStyle} />
        </div>
        {data.coverImage && (
          <div className="mt-3 rounded-xl overflow-hidden" style={{ border: "0.5px solid rgba(255,255,255,0.1)" }}>
            <img src={data.coverImage} alt="Cover preview" className="w-full h-48 object-cover" onError={e => e.target.style.display = "none"} />
          </div>
        )}
      </Field>

      <Field label="Product Screenshots" required hint="Min 3 required. Show real product UI." error={errors.screenshots}>
        <div className="flex gap-2 mb-3">
          <input value={screenshotUrl} onChange={e => setScreenshotUrl(e.target.value)}
            onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addScreenshot())}
            placeholder="Screenshot URL..." className={inputCls} style={inputStyle} />
          <button type="button" onClick={addScreenshot}
            className="px-4 rounded-xl text-xs font-bold transition-all"
            style={{ background: "rgba(255,255,255,0.06)", border: "0.5px solid rgba(255,255,255,0.15)", color: "hsl(var(--foreground) / 0.7)" }}>
            <Plus className="w-4 h-4" />
          </button>
        </div>
        {(data.screenshots || []).length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            {(data.screenshots || []).map((url, i) => (
              <div key={i} className="relative group rounded-xl overflow-hidden" style={{ border: "0.5px solid rgba(255,255,255,0.1)" }}>
                <img src={url} alt={`Screenshot ${i + 1}`} className="w-full h-24 object-cover" />
                <button type="button" onClick={() => onChange("screenshots", data.screenshots.filter((_, idx) => idx !== i))}
                  className="absolute top-1.5 right-1.5 w-6 h-6 rounded-lg bg-black/80 text-red-400 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                  <X className="w-3 h-3" />
                </button>
                <div className="absolute bottom-1.5 left-1.5 text-[9px] font-mono text-white/40 bg-black/60 px-1.5 py-0.5 rounded">
                  {i + 1}/{data.screenshots.length}
                </div>
              </div>
            ))}
          </div>
        )}
        {(data.screenshots || []).length < 3 && (
          <div className="flex items-center gap-1.5 mt-2">
            <Info className="w-3 h-3 text-amber-400" />
            <span className="text-[11px] text-amber-400" style={{ fontFamily: "'Inter', sans-serif" }}>
              {3 - (data.screenshots || []).length} more screenshot(s) required
            </span>
          </div>
        )}
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Product Video URL" hint="YouTube, Loom, or Vimeo demo">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "0.5px solid rgba(255,255,255,0.1)" }}>
            <Video className="w-4 h-4 text-foreground/30 shrink-0" />
            <input value={data.videoUrl} onChange={e => onChange("videoUrl", e.target.value)}
              placeholder="https://loom.com/share/..." className="flex-1 bg-transparent text-sm outline-none placeholder-foreground/20"
              style={{ color: "hsl(var(--foreground))", fontFamily: "'Inter', sans-serif" }} />
          </div>
        </Field>
        <Field label="Live Demo URL" required hint="Working demo the buyer can try." error={errors.demoUrl}>
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "0.5px solid rgba(255,255,255,0.1)" }}>
            <Globe className="w-4 h-4 text-foreground/30 shrink-0" />
            <input value={data.demoUrl} onChange={e => onChange("demoUrl", e.target.value)}
              placeholder="https://demo.yourproduct.com" className="flex-1 bg-transparent text-sm outline-none placeholder-foreground/20"
              style={{ color: "hsl(var(--foreground))", fontFamily: "'Inter', sans-serif" }} />
          </div>
        </Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Documentation URL" required hint="Setup guide & docs." error={errors.docsUrl}>
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "0.5px solid rgba(255,255,255,0.1)" }}>
            <FileText className="w-4 h-4 text-foreground/30 shrink-0" />
            <input value={data.docsUrl} onChange={e => onChange("docsUrl", e.target.value)}
              placeholder="https://docs.yourproduct.com" className="flex-1 bg-transparent text-sm outline-none placeholder-foreground/20"
              style={{ color: "hsl(var(--foreground))", fontFamily: "'Inter', sans-serif" }} />
          </div>
        </Field>
        <Field label="Product Walkthrough URL" hint="Guided walkthrough video or page">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "0.5px solid rgba(255,255,255,0.1)" }}>
            <Layers className="w-4 h-4 text-foreground/30 shrink-0" />
            <input value={data.walkthroughUrl} onChange={e => onChange("walkthroughUrl", e.target.value)}
              placeholder="https://app.arcade.software/..." className="flex-1 bg-transparent text-sm outline-none placeholder-foreground/20"
              style={{ color: "hsl(var(--foreground))", fontFamily: "'Inter', sans-serif" }} />
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
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "0.5px solid rgba(255,255,255,0.1)" }}>
            <span className="text-sm font-bold text-foreground/40">₹</span>
            <input type="number" value={data.price} onChange={e => onChange("price", e.target.value)}
              placeholder="4999" className="flex-1 bg-transparent text-sm font-bold outline-none placeholder-foreground/20"
              style={{ color: "hsl(var(--foreground))", fontFamily: "'Inter', sans-serif" }} />
          </div>
        </Field>
        <Field label="Delivery Time" required error={errors.deliveryDays}>
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", border: "0.5px solid rgba(255,255,255,0.1)" }}>
            <Clock className="w-4 h-4 text-foreground/30 shrink-0" />
            <select value={data.deliveryDays} onChange={e => onChange("deliveryDays", e.target.value)}
              className="flex-1 bg-transparent text-sm outline-none" style={{ color: "hsl(var(--foreground))", fontFamily: "'Inter', sans-serif" }}>
              {[1,2,3,5,7,10,14,21,30].map(d => <option key={d} value={d}>{d} day{d > 1 ? "s" : ""}</option>)}
            </select>
          </div>
        </Field>
        <Field label="Revisions Included">
          <select value={data.revisions} onChange={e => onChange("revisions", e.target.value)}
            className={inputCls} style={inputStyle}>
            {REVISION_OPTIONS.map(r => <option key={r} value={r}>{r} revision{r !== "1" && r !== "Unlimited" ? "s" : r === "1" ? "" : ""}</option>)}
          </select>
        </Field>
      </div>

      <Field label="Support Duration" required>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {SUPPORT_MODELS.map(m => (
            <button key={m} type="button" onClick={() => onChange("support", m)}
              className="py-2.5 px-3 rounded-xl text-xs font-bold transition-all"
              style={{
                background: data.support === m ? "hsl(var(--foreground))" : "rgba(255,255,255,0.03)",
                border: `0.5px solid ${data.support === m ? "hsl(var(--foreground))" : "rgba(255,255,255,0.1)"}`,
                color: data.support === m ? "hsl(var(--background))" : "hsl(var(--foreground) / 0.5)",
                fontFamily: "'Inter', sans-serif"
              }}>
              {m}
            </button>
          ))}
        </div>
      </Field>

      <Field label="Deployment Method" required hint="How will this product be deployed to buyers?">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {DEPLOYMENT_METHODS.map(m => (
            <button key={m} type="button" onClick={() => onChange("deploymentMethod", m)}
              className="p-4 rounded-xl text-left transition-all"
              style={{
                background: data.deploymentMethod === m ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.02)",
                border: `0.5px solid ${data.deploymentMethod === m ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.08)"}`,
              }}>
              <div className={`w-2 h-2 rounded-full mb-2 ${data.deploymentMethod === m ? "bg-foreground" : "bg-foreground/20"}`} />
              <div className="text-sm font-semibold text-foreground/80" style={{ fontFamily: "'Inter', sans-serif" }}>{m}</div>
              <div className="text-[10px] text-foreground/30 mt-0.5" style={{ fontFamily: "'Inter', sans-serif" }}>
                {m === "Developer Hosted" ? "You host & manage infrastructure" :
                 m === "Client Hosted" ? "Buyer provides their own hosting" :
                 "Custom setup & deployment plan"}
              </div>
            </button>
          ))}
        </div>
      </Field>

      <Field label="Hosting Requirements" hint="What infrastructure does the buyer need?">
        <textarea value={data.hostingRequirements} onChange={e => onChange("hostingRequirements", e.target.value)}
          placeholder="e.g. WhatsApp Business API key, any hosting plan (deployment provided), domain name optional..."
          rows={3} className={inputCls} style={{ ...inputStyle, resize: "none" }} />
      </Field>

      {/* Pricing Preview */}
      <div className="p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.02)", border: "0.5px solid rgba(255,255,255,0.08)" }}>
        <div className="text-[10px] font-bold uppercase tracking-widest text-foreground/30 mb-3" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Pricing Preview</div>
        <div className="space-y-2">
          {[
            { label: "Product Price", value: data.price ? `₹${Number(data.price).toLocaleString()}` : "—" },
            { label: "Platform Fee (12%)", value: data.price ? `₹${Math.round(Number(data.price) * 0.12).toLocaleString()}` : "—", muted: true },
            { label: "Your Earnings", value: data.price ? `₹${Math.round(Number(data.price) * 0.88).toLocaleString()}` : "—", highlight: true },
          ].map(row => (
            <div key={row.label} className="flex items-center justify-between">
              <span className="text-xs text-foreground/40" style={{ fontFamily: "'Inter', sans-serif" }}>{row.label}</span>
              <span className={`text-sm font-bold ${row.highlight ? "text-emerald-400" : row.muted ? "text-foreground/30" : "text-foreground"}`}
                style={{ fontFamily: "Georgia, serif" }}>{row.value}</span>
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
  const fieldMeta = getFieldIcon(field.type);
  const FieldIcon = fieldMeta.icon;

  const addOption = () => {
    if (optionInput.trim()) {
      onChange({ ...field, options: [...(field.options || []), optionInput.trim()] });
      setOptionInput("");
    }
  };

  const conditionalSourceFields = allFields
    .filter(f => f.id !== field.id && ["dropdown", "radio", "checkbox", "toggle"].includes(f.type));

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="rounded-xl overflow-hidden"
      style={{ background: "rgba(255,255,255,0.02)", border: "0.5px solid rgba(255,255,255,0.1)" }}
    >
      {/* Field Header */}
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-foreground/3 transition-colors"
        onClick={() => setExpanded(p => !p)}
      >
        <div className="cursor-grab text-foreground/20 hover:text-foreground/40">
          <Grip className="w-4 h-4" />
        </div>
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0`}
          style={{ background: "rgba(255,255,255,0.04)", border: "0.5px solid rgba(255,255,255,0.08)" }}>
          <FieldIcon className={`w-3.5 h-3.5 ${fieldMeta.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-foreground/80 truncate" style={{ fontFamily: "'Inter', sans-serif" }}>
            {field.label || <span className="text-foreground/25 italic">Untitled Field</span>}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[10px] font-mono text-foreground/30">{fieldMeta.label}</span>
            {field.required && <span className="text-[9px] font-bold text-red-400/70 uppercase tracking-wider">Required</span>}
            {field.conditionalOn && <span className="text-[9px] font-bold text-blue-400/70 uppercase tracking-wider">Conditional</span>}
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button type="button" onClick={e => { e.stopPropagation(); onDelete(); }}
            className="p-1.5 rounded-lg text-foreground/20 hover:text-red-400 hover:bg-red-400/8 transition-all">
            <X className="w-3.5 h-3.5" />
          </button>
          <ChevronRight className={`w-4 h-4 text-foreground/30 transition-transform duration-200 ${expanded ? "rotate-90" : ""}`} />
        </div>
      </div>

      {/* Field Settings */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: "hidden", borderTop: "0.5px solid rgba(255,255,255,0.06)" }}
          >
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/30 mb-1.5 block" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Field Name *</label>
                  <input value={field.label} onChange={e => onChange({ ...field, label: e.target.value })}
                    placeholder="e.g. Restaurant Name" className={inputCls} style={{ ...inputStyle, padding: "10px 14px", fontSize: "12px" }} />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/30 mb-1.5 block" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Field Type</label>
                  <select value={field.type} onChange={e => onChange({ ...field, type: e.target.value, options: [] })}
                    className={inputCls} style={{ ...inputStyle, padding: "10px 14px", fontSize: "12px" }}>
                    {FIELD_TYPES.map(ft => <option key={ft.type} value={ft.type}>{ft.label}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/30 mb-1.5 block" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Description / Helper Text</label>
                <input value={field.description || ""} onChange={e => onChange({ ...field, description: e.target.value })}
                  placeholder="Help text shown below the field..." className={inputCls} style={{ ...inputStyle, padding: "10px 14px", fontSize: "12px" }} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/30 mb-1.5 block" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Placeholder</label>
                  <input value={field.placeholder || ""} onChange={e => onChange({ ...field, placeholder: e.target.value })}
                    placeholder="e.g. Enter your restaurant name..." className={inputCls} style={{ ...inputStyle, padding: "10px 14px", fontSize: "12px" }} />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/30 mb-1.5 block" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Default Value</label>
                  <input value={field.defaultValue || ""} onChange={e => onChange({ ...field, defaultValue: e.target.value })}
                    placeholder="Optional default..." className={inputCls} style={{ ...inputStyle, padding: "10px 14px", fontSize: "12px" }} />
                </div>
              </div>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <div
                    onClick={() => onChange({ ...field, required: !field.required })}
                    className={`w-10 h-5.5 rounded-full relative transition-all duration-200 cursor-pointer ${field.required ? "bg-foreground" : "bg-foreground/15"}`}
                    style={{ width: 40, height: 22 }}>
                    <div className={`absolute top-0.5 w-4.5 h-4.5 rounded-full bg-background transition-all duration-200 shadow-sm`}
                      style={{ width: 18, height: 18, left: field.required ? 20 : 2, top: 2 }} />
                  </div>
                  <span className="text-xs font-semibold text-foreground/60" style={{ fontFamily: "'Inter', sans-serif" }}>Required</span>
                </label>
              </div>

              {/* Options for dropdown/radio/multiselect */}
              {["dropdown", "radio", "multiselect"].includes(field.type) && (
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/30 mb-2 block" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Options *</label>
                  <div className="space-y-1.5 mb-2">
                    {(field.options || []).map((opt, i) => (
                      <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.06)" }}>
                        <span className="flex-1 text-xs text-foreground/70" style={{ fontFamily: "'Inter', sans-serif" }}>{opt}</span>
                        <button type="button" onClick={() => onChange({ ...field, options: field.options.filter((_, idx) => idx !== i) })}
                          className="text-foreground/20 hover:text-red-400 transition-colors"><X className="w-3 h-3" /></button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input value={optionInput} onChange={e => setOptionInput(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addOption())}
                      placeholder="Add option..." className={inputCls} style={{ ...inputStyle, padding: "8px 12px", fontSize: "12px" }} />
                    <button type="button" onClick={addOption}
                      className="px-3 py-2 rounded-xl text-xs font-bold transition-all"
                      style={{ background: "rgba(255,255,255,0.06)", border: "0.5px solid rgba(255,255,255,0.15)", color: "hsl(var(--foreground) / 0.6)" }}>
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* File restrictions */}
              {["file", "pdf", "image", "video"].includes(field.type) && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/30 mb-1.5 block" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Max File Size</label>
                    <select value={field.maxSize || "10MB"} onChange={e => onChange({ ...field, maxSize: e.target.value })}
                      className={inputCls} style={{ ...inputStyle, padding: "10px 14px", fontSize: "12px" }}>
                      {["1MB", "5MB", "10MB", "25MB", "50MB", "100MB"].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/30 mb-1.5 block" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Accepted Formats</label>
                    <input value={field.accept || ""} onChange={e => onChange({ ...field, accept: e.target.value })}
                      placeholder={field.type === "pdf" ? ".pdf" : field.type === "image" ? ".jpg,.png,.webp" : "any"}
                      className={inputCls} style={{ ...inputStyle, padding: "10px 14px", fontSize: "12px" }} />
                  </div>
                </div>
              )}

              {/* Conditional Logic */}
              {conditionalSourceFields.length > 0 && (
                <div className="p-3 rounded-xl space-y-3" style={{ background: "rgba(59,130,246,0.04)", border: "0.5px solid rgba(59,130,246,0.15)" }}>
                  <div className="flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400/70" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Conditional Logic</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-foreground/40 mb-1 block">Show this field if...</label>
                      <select value={field.conditionalOn || ""} onChange={e => onChange({ ...field, conditionalOn: e.target.value, conditionalValue: "" })}
                        className={inputCls} style={{ ...inputStyle, padding: "8px 12px", fontSize: "12px" }}>
                        <option value="">Always show</option>
                        {conditionalSourceFields.map(f => <option key={f.id} value={f.id}>{f.label || f.id}</option>)}
                      </select>
                    </div>
                    {field.conditionalOn && (
                      <div>
                        <label className="text-[10px] text-foreground/40 mb-1 block">...equals value</label>
                        <input value={field.conditionalValue || ""} onChange={e => onChange({ ...field, conditionalValue: e.target.value })}
                          placeholder="e.g. Yes" className={inputCls} style={{ ...inputStyle, padding: "8px 12px", fontSize: "12px" }} />
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
    const sourceField = fields.find(sf => sf.id === f.conditionalOn);
    if (!sourceField) return true;
    return values[f.conditionalOn] === f.conditionalValue;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Eye className="w-4 h-4 text-foreground/40" />
        <span className="text-xs font-bold text-foreground/40 uppercase tracking-widest" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Live Preview — Buyer View</span>
      </div>
      {visibleFields.length === 0 ? (
        <div className="text-center py-8">
          <LayoutGrid className="w-8 h-8 mx-auto mb-2 text-foreground/15" />
          <p className="text-xs text-foreground/25" style={{ fontFamily: "'Inter', sans-serif" }}>Add fields to see preview</p>
        </div>
      ) : (
        visibleFields.map(field => {
          const fieldMeta = getFieldIcon(field.type);
          const FieldIcon = fieldMeta.icon;
          return (
            <div key={field.id}>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-foreground/70 mb-1.5" style={{ fontFamily: "'Inter', sans-serif" }}>
                <FieldIcon className={`w-3 h-3 ${fieldMeta.color}`} />
                {field.label || "Untitled Field"}
                {field.required && <span className="text-red-400">*</span>}
              </label>
              {field.description && <p className="text-[10px] text-foreground/30 mb-1.5" style={{ fontFamily: "'Inter', sans-serif" }}>{field.description}</p>}
              {field.type === "textarea" ? (
                <textarea rows={2} placeholder={field.placeholder || ""} onChange={e => setValues(p => ({ ...p, [field.id]: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-lg text-xs outline-none resize-none" style={{ ...inputStyle, fontSize: "12px", padding: "10px 12px" }} />
              ) : field.type === "dropdown" ? (
                <select onChange={e => setValues(p => ({ ...p, [field.id]: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-lg text-xs outline-none" style={{ ...inputStyle, fontSize: "12px", padding: "10px 12px" }}>
                  <option value="">{field.placeholder || "Select..."}</option>
                  {(field.options || []).map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              ) : ["file", "pdf", "image", "video"].includes(field.type) ? (
                <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer" style={{ ...inputStyle, fontSize: "12px" }}>
                  <Upload className="w-3.5 h-3.5 text-foreground/30" />
                  <span className="text-xs text-foreground/30" style={{ fontFamily: "'Inter', sans-serif" }}>Click to upload {field.type === "pdf" ? "PDF" : field.type}</span>
                </div>
              ) : field.type === "toggle" ? (
                <div className="flex items-center gap-2">
                  <div className="w-10 rounded-full bg-foreground/15 cursor-pointer" style={{ height: 22 }}>
                    <div className="w-4.5 h-4.5 rounded-full bg-background shadow-sm" style={{ width: 18, height: 18, margin: 2 }} />
                  </div>
                  <span className="text-xs text-foreground/40" style={{ fontFamily: "'Inter', sans-serif" }}>{field.placeholder || "Toggle option"}</span>
                </div>
              ) : field.type === "color" ? (
                <div className="flex items-center gap-2">
                  <input type="color" className="w-10 h-8 rounded-lg cursor-pointer" style={{ border: "0.5px solid rgba(255,255,255,0.15)", background: "transparent" }} />
                  <span className="text-xs text-foreground/30" style={{ fontFamily: "'Inter', sans-serif" }}>Click to pick color</span>
                </div>
              ) : (
                <input type={field.type === "email" ? "email" : field.type === "phone" ? "tel" : field.type === "url" ? "url" : field.type === "number" ? "number" : "text"}
                  placeholder={field.placeholder || ""}
                  onChange={e => setValues(p => ({ ...p, [field.id]: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-lg text-xs outline-none" style={{ ...inputStyle, fontSize: "12px", padding: "10px 12px" }} />
              )}
            </div>
          );
        })
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
      id: `field_${Date.now()}`,
      type, label: "", description: "", placeholder: "",
      required: false, options: [], defaultValue: "",
      conditionalOn: "", conditionalValue: "", _new: true
    };
    onChange("configFields", [...fields, newField]);
    setShowFieldPicker(false);
  };

  const updateField = (id, updated) => {
    onChange("configFields", fields.map(f => f.id === id ? { ...updated, _new: false } : f));
  };

  const deleteField = (id) => {
    onChange("configFields", fields.filter(f => f.id !== id));
  };

  const QUICK_TEMPLATES = [
    { label: "Restaurant Bot", fields: [
      { id: "f1", type: "text", label: "Restaurant Name", required: true, placeholder: "Enter restaurant name..." },
      { id: "f2", type: "pdf", label: "Menu PDF", required: true, description: "Upload your complete menu" },
      { id: "f3", type: "image", label: "Restaurant Logo", required: true },
      { id: "f4", type: "phone", label: "WhatsApp Number", required: true, placeholder: "+91 98765 43210" },
      { id: "f5", type: "text", label: "Address", required: true },
      { id: "f6", type: "text", label: "Business Hours", required: false, placeholder: "e.g. Mon-Sat 10am-10pm" },
    ]},
    { label: "CRM Dashboard", fields: [
      { id: "f1", type: "text", label: "Company Name", required: true },
      { id: "f2", type: "email", label: "Admin Email", required: true },
      { id: "f3", type: "number", label: "Team Size", required: true },
      { id: "f4", type: "multiselect", label: "Departments", required: false, options: ["Sales", "Marketing", "Support", "HR", "Engineering"] },
    ]},
    { label: "E-Commerce Store", fields: [
      { id: "f1", type: "text", label: "Store Name", required: true },
      { id: "f2", type: "url", label: "Domain Name", required: false, placeholder: "yourstore.com" },
      { id: "f3", type: "image", label: "Brand Logo", required: true },
      { id: "f4", type: "file", label: "Product Catalog (CSV)", required: false },
      { id: "f5", type: "color", label: "Brand Primary Color", required: false },
    ]},
  ];

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-xl" style={{ background: "rgba(59,130,246,0.04)", border: "0.5px solid rgba(59,130,246,0.2)" }}>
        <div className="flex items-start gap-3">
          <Shield className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-blue-400" style={{ fontFamily: "'Inter', sans-serif" }}>Dynamic Buyer Onboarding</p>
            <p className="text-[11px] text-foreground/40 mt-0.5" style={{ fontFamily: "'Inter', sans-serif" }}>
              Define exactly what information you need from every buyer before work begins. This generates a dynamic onboarding form — no hardcoded fields, fully customizable per product.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Templates */}
      {fields.length === 0 && (
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-foreground/30 mb-3" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Quick Start Templates</div>
          <div className="grid grid-cols-3 gap-3">
            {QUICK_TEMPLATES.map(t => (
              <button key={t.label} type="button"
                onClick={() => onChange("configFields", t.fields.map(f => ({ ...f, options: f.options || [], description: f.description || "", placeholder: f.placeholder || "", defaultValue: "", conditionalOn: "", conditionalValue: "", _new: false })))}
                className="p-4 rounded-xl text-left transition-all hover:bg-foreground/4"
                style={{ background: "rgba(255,255,255,0.02)", border: "0.5px solid rgba(255,255,255,0.08)" }}>
                <div className="text-sm font-semibold text-foreground/70 mb-1" style={{ fontFamily: "'Inter', sans-serif" }}>{t.label}</div>
                <div className="text-[10px] text-foreground/30" style={{ fontFamily: "'Inter', sans-serif" }}>{t.fields.length} fields</div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Builder Side */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="text-[10px] font-bold uppercase tracking-widest text-foreground/30" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              Fields ({fields.length})
            </div>
            <button type="button" onClick={() => setShowFieldPicker(p => !p)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all"
              style={{ background: showFieldPicker ? "hsl(var(--foreground))" : "rgba(255,255,255,0.06)", border: "0.5px solid rgba(255,255,255,0.15)", color: showFieldPicker ? "hsl(var(--background))" : "hsl(var(--foreground) / 0.7)" }}>
              <Plus className="w-3.5 h-3.5" /> Add Field
            </button>
          </div>

          {/* Field Type Picker */}
          <AnimatePresence>
            {showFieldPicker && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                className="mb-4 p-3 rounded-xl" style={{ background: "rgba(0,0,0,0.6)", border: "0.5px solid rgba(255,255,255,0.1)", backdropFilter: "blur(20px)" }}>
                <div className="grid grid-cols-3 gap-1.5">
                  {FIELD_TYPES.map(ft => {
                    const FtIcon = ft.icon;
                    return (
                      <button key={ft.type} type="button" onClick={() => addField(ft.type)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-all hover:bg-foreground/6"
                        style={{ background: "rgba(255,255,255,0.02)", border: "0.5px solid rgba(255,255,255,0.06)" }}>
                        <FtIcon className={`w-3.5 h-3.5 shrink-0 ${ft.color}`} />
                        <span className="text-[10px] font-semibold text-foreground/60 truncate" style={{ fontFamily: "'Inter', sans-serif" }}>{ft.label}</span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Field List */}
          <div className="space-y-2">
            <AnimatePresence>
              {fields.map((field) => (
                <ConfigFieldEditor
                  key={field.id}
                  field={field}
                  onChange={(updated) => updateField(field.id, updated)}
                  onDelete={() => deleteField(field.id)}
                  allFields={fields}
                />
              ))}
            </AnimatePresence>
            {fields.length === 0 && (
              <div className="text-center py-10 rounded-xl" style={{ border: "0.5px dashed rgba(255,255,255,0.1)" }}>
                <Settings className="w-8 h-8 mx-auto mb-2 text-foreground/15" />
                <p className="text-xs text-foreground/25" style={{ fontFamily: "'Inter', sans-serif" }}>No fields yet. Click "Add Field" to start building.</p>
              </div>
            )}
          </div>
        </div>

        {/* Preview Side */}
        <div className="sticky top-6">
          <div className="p-5 rounded-xl" style={{ background: "rgba(255,255,255,0.02)", border: "0.5px solid rgba(255,255,255,0.08)" }}>
            <ConfigPreview fields={fields} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── STEP 5: Review & Submit ────────────────────────────────────────────────────
function Step5({ allData, onSubmit, submitting }) {
  const [confirmed, setConfirmed] = useState(false);

  const sections = [
    {
      title: "Product Information",
      rows: [
        { label: "Name", value: allData.title },
        { label: "Category", value: allData.category },
        { label: "Tags", value: (allData.tags || []).join(", ") || "—" },
        { label: "Features", value: (allData.features || []).length + " defined" },
        { label: "Industries", value: (allData.industries || []).join(", ") || "—" },
      ]
    },
    {
      title: "Media & Demo",
      rows: [
        { label: "Cover Image", value: allData.coverImage ? "✓ Uploaded" : "✗ Missing", ok: !!allData.coverImage },
        { label: "Screenshots", value: (allData.screenshots || []).length + " / 3 minimum", ok: (allData.screenshots || []).length >= 3 },
        { label: "Demo URL", value: allData.demoUrl || "—", ok: !!allData.demoUrl },
        { label: "Documentation", value: allData.docsUrl || "—", ok: !!allData.docsUrl },
      ]
    },
    {
      title: "Pricing & Delivery",
      rows: [
        { label: "Price", value: allData.price ? `₹${Number(allData.price).toLocaleString()}` : "—" },
        { label: "Delivery", value: allData.deliveryDays ? `${allData.deliveryDays} days` : "—" },
        { label: "Revisions", value: allData.revisions || "—" },
        { label: "Support", value: allData.support || "—" },
        { label: "Deployment", value: allData.deploymentMethod || "—" },
      ]
    },
    {
      title: "Config Builder",
      rows: [
        { label: "Fields Defined", value: (allData.configFields || []).length + " fields", ok: (allData.configFields || []).length > 0 },
        { label: "Required Fields", value: (allData.configFields || []).filter(f => f.required).length + " required" },
        { label: "Conditional Rules", value: (allData.configFields || []).filter(f => f.conditionalOn).length + " rules" },
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <div className="p-4 rounded-xl" style={{ background: "rgba(234,179,8,0.04)", border: "0.5px solid rgba(234,179,8,0.2)" }}>
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-yellow-400" />
          <p className="text-xs text-yellow-400 font-bold" style={{ fontFamily: "'Inter', sans-serif" }}>
            Your product will be submitted for review. It will only become public after Deployra verification (24–48 hours).
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {sections.map(section => (
          <div key={section.title} className="p-5 rounded-xl" style={{ background: "rgba(255,255,255,0.02)", border: "0.5px solid rgba(255,255,255,0.08)" }}>
            <div className="text-[10px] font-bold uppercase tracking-widest text-foreground/30 mb-4" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              {section.title}
            </div>
            <div className="space-y-2.5">
              {section.rows.map(row => (
                <div key={row.label} className="flex items-center justify-between gap-3">
                  <span className="text-[11px] text-foreground/40 shrink-0" style={{ fontFamily: "'Inter', sans-serif" }}>{row.label}</span>
                  <span className={`text-[11px] font-semibold text-right truncate ${row.ok === false ? "text-red-400" : row.ok === true ? "text-emerald-400" : "text-foreground/70"}`}
                    style={{ fontFamily: "'Inter', sans-serif" }}>{row.value || "—"}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Config Fields Preview */}
      {(allData.configFields || []).length > 0 && (
        <div className="p-5 rounded-xl" style={{ background: "rgba(255,255,255,0.02)", border: "0.5px solid rgba(255,255,255,0.08)" }}>
          <div className="text-[10px] font-bold uppercase tracking-widest text-foreground/30 mb-3" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            Buyer Onboarding Fields
          </div>
          <div className="flex flex-wrap gap-2">
            {(allData.configFields || []).map(f => {
              const meta = getFieldIcon(f.type);
              const Icon = meta.icon;
              return (
                <span key={f.id} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold"
                  style={{ background: "rgba(255,255,255,0.04)", border: "0.5px solid rgba(255,255,255,0.1)", color: "hsl(var(--foreground) / 0.65)", fontFamily: "'Inter', sans-serif" }}>
                  <Icon className={`w-3 h-3 ${meta.color}`} />
                  {f.label || "Untitled"}
                  {f.required && <span className="text-red-400/70">*</span>}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Confirmations */}
      <div className="space-y-3">
        {[
          "I confirm that the demo URL is live and accessible",
          "All screenshots are real product screenshots",
          "Documentation is complete and up to date",
          "The configuration builder is set up correctly",
        ].map((text, i) => (
          <label key={i} className="flex items-start gap-3 cursor-pointer group">
            <div onClick={() => setConfirmed(p => !p)}
              className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-all ${confirmed ? "bg-foreground border-foreground" : "border-foreground/20 group-hover:border-foreground/40"}`}>
              {confirmed && <Check className="w-3 h-3 text-background" />}
            </div>
            <span className="text-xs text-foreground/50 leading-relaxed" style={{ fontFamily: "'Inter', sans-serif" }}>{text}</span>
          </label>
        ))}
      </div>

      <button
        type="button"
        onClick={onSubmit}
        disabled={!confirmed || submitting}
        className="w-full py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-3 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        style={{
          background: confirmed && !submitting ? "hsl(var(--foreground))" : "rgba(255,255,255,0.08)",
          color: confirmed && !submitting ? "hsl(var(--background))" : "hsl(var(--foreground) / 0.4)",
          fontFamily: "'Inter', sans-serif",
        }}>
        {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        {submitting ? "Submitting for Review..." : "Submit Product for Review"}
      </button>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────────
export default function PublishProduct() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    // Step 1
    title: "", shortDesc: "", description: "", category: "",
    tags: [], features: [], industries: [], requirements: [],
    // Step 2
    coverImage: "", screenshots: [], videoUrl: "", demoUrl: "", docsUrl: "", walkthroughUrl: "",
    // Step 3
    price: "", deliveryDays: "7", revisions: "2", support: "30 Days",
    deploymentMethod: "Developer Hosted", hostingRequirements: "",
    // Step 4
    configFields: [],
  });

  const update = useCallback((key, value) => {
    setForm(p => ({ ...p, [key]: value }));
    setErrors(p => ({ ...p, [key]: undefined }));
  }, []);

  const validate = (currentStep) => {
    const e = {};
    if (currentStep === 1) {
      if (!form.title.trim()) e.title = "Product name is required";
      if (!form.shortDesc.trim()) e.shortDesc = "Short description is required";
      if (!form.description.trim()) e.description = "Full description is required";
      if (!form.category) e.category = "Category is required";
    }
    if (currentStep === 2) {
      if (!form.demoUrl.trim()) e.demoUrl = "Demo URL is required";
      if (!form.docsUrl.trim()) e.docsUrl = "Documentation URL is required";
      if ((form.screenshots || []).length < 3) e.screenshots = "Minimum 3 screenshots required";
    }
    if (currentStep === 3) {
      if (!form.price) e.price = "Price is required";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => {
    if (validate(step)) setStep(s => Math.min(s + 1, 5));
  };

  const prev = () => setStep(s => Math.max(s - 1, 1));

  const handleSubmit = async () => {
    setSubmitting(true);
    // TODO: POST to /api/v1/products with form data
    await new Promise(r => setTimeout(r, 2000));
    setSubmitting(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="p-6 sm:p-8 max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-20"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6"
            style={{ background: "rgba(255,255,255,0.06)", border: "0.5px solid rgba(255,255,255,0.15)" }}>
            <Check className="w-10 h-10 text-emerald-400" />
          </motion.div>
          <h1 className="text-2xl font-bold text-foreground mb-2" style={{ fontFamily: "Georgia, serif", letterSpacing: "-0.04em" }}>
            Submitted for Review
          </h1>
          <p className="text-sm text-foreground/40 mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>
            Your product is under review by the Deployra team.
          </p>
          <div className="flex items-center justify-center gap-2 mb-8">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold"
              style={{ background: "rgba(234,179,8,0.1)", border: "0.5px solid rgba(234,179,8,0.3)", color: "rgb(234,179,8)" }}>
              <div className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
              Pending Verification
            </span>
          </div>
          <div className="p-4 rounded-xl mb-8 text-left" style={{ background: "rgba(255,255,255,0.02)", border: "0.5px solid rgba(255,255,255,0.08)" }}>
            <div className="text-[10px] font-bold uppercase tracking-widest text-foreground/30 mb-3" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Verification Checklist</div>
            {["Demo URL Works", "Screenshots Exist", "Documentation Exists", "Config Builder Set Up", "Pricing Defined", "Category Valid"].map(item => (
              <div key={item} className="flex items-center gap-2.5 py-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-yellow-400/60" />
                <span className="text-xs text-foreground/50" style={{ fontFamily: "'Inter', sans-serif" }}>{item}</span>
                <span className="ml-auto text-[10px] text-yellow-400/60 font-mono">Under Review</span>
              </div>
            ))}
          </div>
          <div className="flex gap-3 justify-center">
            <Link to="/developer/listings">
              <button className="px-6 py-3 rounded-xl text-sm font-bold transition-all"
                style={{ background: "hsl(var(--foreground))", color: "hsl(var(--background))", fontFamily: "'Inter', sans-serif" }}>
                Back to Listings
              </button>
            </Link>
            <button onClick={() => { setSubmitted(false); setStep(1); setForm({ title: "", shortDesc: "", description: "", category: "", tags: [], features: [], industries: [], requirements: [], coverImage: "", screenshots: [], videoUrl: "", demoUrl: "", docsUrl: "", walkthroughUrl: "", price: "", deliveryDays: "7", revisions: "2", support: "30 Days", deploymentMethod: "Developer Hosted", hostingRequirements: "", configFields: [] }); }}
              className="px-6 py-3 rounded-xl text-sm font-semibold transition-all"
              style={{ border: "0.5px solid rgba(255,255,255,0.15)", color: "hsl(var(--foreground) / 0.5)", fontFamily: "'Inter', sans-serif" }}>
              Publish Another
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 max-w-5xl page-fade-in">
      {/* Header */}
      <div className="mb-8">
        <Link to="/developer/listings" className="inline-flex items-center gap-2 text-xs text-foreground/40 hover:text-foreground/70 transition-colors mb-4"
          style={{ fontFamily: "'Inter', sans-serif" }}>
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Listings
        </Link>
        <div className="stat-label-caps mb-2">Developer · Product Publishing</div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground section-title-gradient" style={{ fontFamily: "Georgia, serif", letterSpacing: "-0.04em" }}>
          Publish Product
        </h1>
        <p className="text-sm text-foreground/35 mt-1.5" style={{ fontFamily: "'Inter', sans-serif" }}>
          {STEPS[step - 1]?.desc}
        </p>
      </div>

      {/* Step Indicator */}
      <StepIndicator current={step} steps={STEPS} />

      {/* Step Content */}
      <div className="p-6 sm:p-8 rounded-2xl" style={{ background: "rgba(255,255,255,0.02)", border: "0.5px solid rgba(255,255,255,0.08)" }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.2 }}
          >
            {step === 1 && <Step1 data={form} onChange={update} errors={errors} />}
            {step === 2 && <Step2 data={form} onChange={update} errors={errors} />}
            {step === 3 && <Step3 data={form} onChange={update} errors={errors} />}
            {step === 4 && <Step4 data={form} onChange={update} />}
            {step === 5 && <Step5 allData={form} onSubmit={handleSubmit} submitting={submitting} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      {step < 5 && (
        <div className="flex items-center justify-between mt-6">
          <button onClick={prev} disabled={step === 1}
            className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-30"
            style={{ border: "0.5px solid rgba(255,255,255,0.12)", color: "hsl(var(--foreground) / 0.5)", fontFamily: "'Inter', sans-serif" }}>
            <ArrowLeft className="w-4 h-4" /> Previous
          </button>

          <div className="flex items-center gap-2">
            {STEPS.map(s => (
              <div key={s.id} className={`rounded-full transition-all duration-300 ${s.id === step ? "w-6 h-2 bg-foreground" : s.id < step ? "w-2 h-2 bg-foreground/50" : "w-2 h-2 bg-foreground/15"}`} />
            ))}
          </div>

          <button onClick={next}
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all"
            style={{ background: "hsl(var(--foreground))", color: "hsl(var(--background))", fontFamily: "'Inter', sans-serif" }}>
            {step === 4 ? "Review & Submit" : "Continue"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
