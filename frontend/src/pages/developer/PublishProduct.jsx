import { useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { API_URL } from "@/lib/config";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, ArrowRight, Check, Plus, X, Grip, ChevronDown,
  Eye, Upload, FileText, DollarSign, Settings, Send,
  Image, Video, Globe, RefreshCw, Shield, AlertCircle,
  Info, Layers, Zap, Package, Type, AlignLeft, Hash, Mail,
  Phone, Calendar, List, CheckSquare, Circle, MapPin, Paperclip,
  ChevronRight, ToggleLeft, Palette, LayoutGrid
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
  "AI Agent","Automation","Chatbot","CRM","Dashboard","Data Pipeline",
  "E-Commerce","ERP","SaaS Product","Analytics","DevOps","Marketing",
  "Booking System","Payment System","Other",
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
      <Field label="Cover Image" required hint="Min 1200×630px recommended." error={errors.coverImage}>
        <input value={data.coverImage} onChange={e => onChange("coverImage", e.target.value)}
          placeholder="https://your-cdn.com/cover-image.jpg" className={inputCls} />
        {data.coverImage && (
          <div className="mt-3 rounded-xl overflow-hidden border border-border">
            <img src={data.coverImage} alt="Cover preview" className="w-full h-48 object-cover"
              onError={e => e.target.style.display = "none"} />
          </div>
        )}
      </Field>

      <Field label="Product Screenshots" required hint="Min 3 required." error={errors.screenshots}>
        <div className="flex gap-2 mb-3">
          <input value={screenshotUrl} onChange={e => setScreenshotUrl(e.target.value)}
            onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addScreenshot())}
            placeholder="Screenshot URL..." className={inputCls} />
          <button type="button" onClick={addScreenshot}
            className="px-4 rounded-xl text-xs font-bold bg-muted border border-border text-foreground hover:bg-foreground hover:text-background transition-all">
            <Plus className="w-4 h-4" />
          </button>
        </div>
        {(data.screenshots || []).length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            {(data.screenshots || []).map((url, i) => (
              <div key={i} className="relative group rounded-xl overflow-hidden border border-border">
                <img src={url} alt={`Screenshot ${i+1}`} className="w-full h-24 object-cover" />
                <button type="button" onClick={() => onChange("screenshots", data.screenshots.filter((_,idx) => idx !== i))}
                  className="absolute top-1.5 right-1.5 w-6 h-6 rounded-lg bg-black/80 text-red-400 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
        {(data.screenshots || []).length < 3 && (
          <div className="flex items-center gap-1.5 mt-2">
            <Info className="w-3 h-3 text-amber-500" />
            <span className="text-[11px] text-amber-600 dark:text-amber-400">
              {3 - (data.screenshots || []).length} more screenshot(s) recommended
            </span>
          </div>
        )}
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Product Video URL" hint="YouTube, Loom, or Vimeo">
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
        <Field label="Product Walkthrough URL" hint="Arcade, Loom, or similar">
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
function Step5({ allData, onSubmit, submitting, submitError }) {
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

      <button type="button" onClick={onSubmit} disabled={!confirmed || submitting}
        className="w-full py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-3 transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-foreground text-background hover:bg-foreground/90">
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
  const [submitError, setSubmitError] = useState("");

  const [form, setForm] = useState({
    title:"", shortDesc:"", description:"", category:"",
    tags:[], features:[], industries:[], requirements:[],
    coverImage:"", screenshots:[], videoUrl:"", demoUrl:"", docsUrl:"", walkthroughUrl:"",
    price:"", deliveryDays:"7", revisions:"2", support:"30 Days",
    deploymentMethod:"Developer Hosted", hostingRequirements:"",
    configFields:[],
  });

  const update = useCallback((key, value) => {
    setForm(p => ({ ...p, [key]: value }));
    setErrors(p => ({ ...p, [key]: undefined }));
  }, []);

  // Validate but don't block — show warnings only
  const validate = (currentStep) => {
    const e = {};
    if (currentStep === 1) {
      if (!form.title.trim())    e.title    = "Product name is required";
      if (!form.shortDesc.trim()) e.shortDesc = "Short description is required";
      if (!form.description.trim()) e.description = "Full description is required";
      if (!form.category)        e.category  = "Please select a category";
    }
    if (currentStep === 2) {
      if (!form.demoUrl.trim())  e.demoUrl  = "Demo URL is required";
      if (!form.docsUrl.trim())  e.docsUrl  = "Documentation URL is required";
    }
    if (currentStep === 3) {
      if (!form.price)           e.price    = "Price is required";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // Always advance — show errors but don't block navigation
  const next = () => {
    validate(step); // sets errors for display
    setStep(s => Math.min(s + 1, 5));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const prev = () => {
    setStep(s => Math.max(s - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError("");
    try {
      await axios.post(`${API_URL}/products`, {
        ...form,
        price: parseFloat(form.price) || 0,
        deliveryDays: parseInt(form.deliveryDays, 10) || 7,
        isDraft: false,
      });
      setSubmitted(true);
    } catch (err) {
      const msg = err.response?.data?.message || "Submission failed. Please try again.";
      setSubmitError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setSubmitted(false); setStep(1); setErrors({});
    setForm({ title:"", shortDesc:"", description:"", category:"", tags:[], features:[], industries:[], requirements:[], coverImage:"", screenshots:[], videoUrl:"", demoUrl:"", docsUrl:"", walkthroughUrl:"", price:"", deliveryDays:"7", revisions:"2", support:"30 Days", deploymentMethod:"Developer Hosted", hostingRequirements:"", configFields:[] });
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
    <div className="p-6 sm:p-8 max-w-5xl page-fade-in">
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
            {step === 5 && <Step5 allData={form} onSubmit={handleSubmit} submitting={submitting} submitError={submitError} />}
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
    </div>
  );
}
