import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star, Shield, Clock, RefreshCw, Check, ChevronRight, ArrowLeft,
  Globe, FileText, Video, Play, Zap, Package, Award,
  Upload, AlertCircle, ChevronDown, MapPin, Calendar,
  Phone, Mail, Type, AlignLeft, Hash, List, CheckSquare, Circle,
  Paperclip, Image, Palette, ToggleLeft, Lock, CreditCard
} from "lucide-react";

// ─── Mock Product Data ──────────────────────────────────────────────────────────
const MOCK_PRODUCTS = {
  "p1": {
    id: "p1",
    title: "Restaurant WhatsApp Ordering Bot",
    shortDesc: "Automate your restaurant's WhatsApp orders with AI — zero coding required.",
    description: "A fully automated WhatsApp ordering system for restaurants. Customers browse your menu, place orders, and get confirmations — all through WhatsApp. Integrates with your existing POS system. Deployed and running within 3 days.",
    category: "Chatbot",
    tags: ["WhatsApp", "AI", "Restaurant", "Automation", "Chatbot"],
    features: ["Auto order processing", "Menu PDF integration", "WhatsApp Business API", "Real-time notifications", "Multi-language support", "POS integration"],
    industries: ["Restaurants", "Food & Beverage", "Hospitality"],
    price: 4999,
    deliveryDays: 3,
    revisions: "2",
    support: "90 Days",
    deploymentMethod: "Developer Hosted",
    demoUrl: "https://demo.example.com",
    docsUrl: "https://docs.example.com",
    videoUrl: "https://loom.com/share/demo",
    coverImage: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&q=80",
    screenshots: [
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80",
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
    ],
    rating: 4.9,
    reviewCount: 84,
    installs: 312,
    verified: true,
    featured: true,
    developer: { name: "Priya Systems", avatar: "P", rating: 4.9, products: 7, completionRate: 98 },
    configFields: [
      { id: "f1", type: "text", label: "Restaurant Name", required: true, placeholder: "Enter your restaurant name..." },
      { id: "f2", type: "pdf", label: "Menu PDF", required: true, description: "Upload your complete menu with prices" },
      { id: "f3", type: "image", label: "Restaurant Logo", required: true, description: "Minimum 400×400px, PNG or SVG preferred" },
      { id: "f4", type: "phone", label: "WhatsApp Business Number", required: true, placeholder: "+91 98765 43210" },
      { id: "f5", type: "text", label: "Full Address", required: true, placeholder: "Street, City, State, PIN" },
      { id: "f6", type: "text", label: "Business Hours", required: false, placeholder: "e.g. Mon-Sat 10am-10pm, Sun 12pm-10pm" },
      { id: "f7", type: "dropdown", label: "Cuisine Type", required: true, options: ["Indian", "Chinese", "Continental", "Italian", "Fast Food", "Multi-cuisine"] },
      { id: "f8", type: "toggle", label: "Accept Pre-orders?", required: false, description: "Allow customers to place orders in advance" },
      { id: "f9", type: "text", label: "Delivery Radius", required: false, placeholder: "e.g. 5 km", conditionalOn: "f8", conditionalValue: "true" },
      { id: "f10", type: "textarea", label: "Custom Requirements", required: false, placeholder: "Any special features or integrations you need..." },
    ],
    reviews: [
      { name: "Arjun K.", rating: 5, comment: "Deployed in 2 days, orders are flowing. Best investment for my restaurant.", date: "May 2025" },
      { name: "Meera S.", rating: 5, comment: "Setup was seamless, the developer was very responsive.", date: "Apr 2025" },
      { name: "Raj T.", rating: 4, comment: "Works great! Minor customization needed but overall excellent.", date: "Mar 2025" },
    ]
  }
};

// ─── Field Renderer ─────────────────────────────────────────────────────────────
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

function FieldRenderer({ field, value, onChange, error }) {
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
    color: "hsl(var(--foreground))",
    outline: "none",
    width: "100%",
    fontSize: 13,
    fontFamily: "'Inter', sans-serif",
  };

  return (
    <div>
      <label className="flex items-center gap-1.5 text-xs font-semibold text-foreground/70 mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>
        <Icon className="w-3 h-3 text-foreground/40" />
        {field.label}
        {field.required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {field.description && (
        <p className="text-[11px] text-foreground/35 mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>{field.description}</p>
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
          <select value={value || ""} onChange={e => onChange(e.target.value)} style={{ ...inputStyle, appearance: "none" }}>
            <option value="">Select {field.label.toLowerCase()}...</option>
            {(field.options || []).map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
      ) : ["file", "pdf", "image", "video"].includes(field.type) ? (
        <label className="cursor-pointer block">
          <div style={{ ...wrapperStyle, cursor: "pointer" }} className="hover:bg-foreground/4 transition-colors">
            <Upload className="w-4 h-4 text-foreground/30 shrink-0 mt-0.5" />
            <div>
              {value ? (
                <span className="text-sm text-emerald-400 font-semibold" style={{ fontFamily: "'Inter', sans-serif" }}>✓ {value.name || "File selected"}</span>
              ) : (
                <span className="text-sm text-foreground/30" style={{ fontFamily: "'Inter', sans-serif" }}>
                  Click to upload {field.type === "pdf" ? "PDF" : field.type}
                  {field.maxSize && <span className="text-foreground/20"> · Max {field.maxSize}</span>}
                </span>
              )}
            </div>
          </div>
          <input type="file" className="hidden" accept={field.accept || (field.type === "pdf" ? ".pdf" : field.type === "image" ? ".jpg,.jpeg,.png,.webp,.svg" : "")}
            onChange={e => onChange(e.target.files[0])} />
        </label>
      ) : field.type === "toggle" ? (
        <div className="flex items-center gap-3">
          <div onClick={() => onChange(value === "true" ? "false" : "true")}
            className="cursor-pointer rounded-full relative transition-all duration-200"
            style={{ width: 44, height: 24, background: value === "true" ? "hsl(var(--foreground))" : "rgba(255,255,255,0.12)" }}>
            <div className="absolute rounded-full bg-background shadow-sm transition-all duration-200"
              style={{ width: 18, height: 18, top: 3, left: value === "true" ? 23 : 3 }} />
          </div>
          <span className="text-sm text-foreground/60" style={{ fontFamily: "'Inter', sans-serif" }}>
            {value === "true" ? "Yes" : "No"}
          </span>
        </div>
      ) : field.type === "color" ? (
        <div className="flex items-center gap-3">
          <input type="color" value={value || "#000000"} onChange={e => onChange(e.target.value)}
            className="w-12 h-10 rounded-xl cursor-pointer" style={{ border: "0.5px solid rgba(255,255,255,0.15)", background: "transparent" }} />
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
          <span className="text-[11px] text-red-400" style={{ fontFamily: "'Inter', sans-serif" }}>{error}</span>
        </div>
      )}
    </div>
  );
}

// ─── Star Rating ────────────────────────────────────────────────────────────────
function Stars({ rating, size = 14 }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <Star key={s} style={{ width: size, height: size, color: s <= Math.round(rating) ? "hsl(var(--foreground))" : "rgba(255,255,255,0.1)", fill: s <= Math.round(rating) ? "hsl(var(--foreground))" : "none" }} />
      ))}
    </div>
  );
}

// ─── Configuration Wizard ────────────────────────────────────────────────────────
function ConfigWizard({ product, onComplete, onBack }) {
  const fields = product.configFields || [];
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});
  const [currentGroup, setCurrentGroup] = useState(0);

  // Group fields into logical steps (max 4 per group)
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
      if (f.required && !values[f.id]) e[f.id] = `${f.label} is required`;
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
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex items-center gap-2 mb-6">
        {groups.map((_, i) => (
          <div key={i} className="flex items-center flex-1">
            <div className={`h-1.5 w-full rounded-full transition-all duration-500 ${i <= currentGroup ? "bg-foreground" : "bg-foreground/10"}`} />
          </div>
        ))}
      </div>

      <div className="text-[10px] font-bold uppercase tracking-widest text-foreground/30 mb-1" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
        Step {currentGroup + 1} of {groups.length}
      </div>
      <h2 className="text-lg font-bold text-foreground mb-6" style={{ fontFamily: "Georgia, serif", letterSpacing: "-0.04em" }}>
        {groupLabels[currentGroup] || "Configuration"}
      </h2>

      <div className="space-y-5">
        {visibleFields.length > 0 ? visibleFields.map(field => (
          <FieldRenderer
            key={field.id}
            field={field}
            value={values[field.id]}
            onChange={v => setValues(p => ({ ...p, [field.id]: v }))}
            error={errors[field.id]}
          />
        )) : (
          <div className="text-center py-8 text-foreground/30 text-sm" style={{ fontFamily: "'Inter', sans-serif" }}>
            No fields for this step.
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-4">
        <button onClick={() => currentGroup > 0 ? setCurrentGroup(g => g - 1) : onBack()}
          className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all"
          style={{ border: "0.5px solid rgba(255,255,255,0.12)", color: "hsl(var(--foreground) / 0.5)", fontFamily: "'Inter', sans-serif" }}>
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <button onClick={next}
          className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all"
          style={{ background: "hsl(var(--foreground))", color: "hsl(var(--background))", fontFamily: "'Inter', sans-serif" }}>
          {currentGroup < groups.length - 1 ? "Continue" : "Review Configuration"}
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ─── Configuration Review ─────────────────────────────────────────────────────────
function ConfigReview({ product, configValues, onConfirm, onBack }) {
  const [confirmed, setConfirmed] = useState(false);
  const fields = product.configFields || [];

  const platformFee = Math.round(product.price * 0.12);
  const gst = Math.round(product.price * 0.18);
  const total = product.price + gst;

  const getDisplayValue = (field, value) => {
    if (!value) return "—";
    if (value instanceof File) return value.name;
    if (field.type === "toggle") return value === "true" ? "Yes" : "No";
    if (field.type === "color") return value;
    return String(value);
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="stat-label-caps mb-1">Step 5 of 5</div>
        <h2 className="text-lg font-bold text-foreground" style={{ fontFamily: "Georgia, serif", letterSpacing: "-0.04em" }}>
          Review & Confirm
        </h2>
        <p className="text-xs text-foreground/40 mt-1" style={{ fontFamily: "'Inter', sans-serif" }}>
          Verify your configuration before payment. This cannot be changed after payment.
        </p>
      </div>

      {/* Config Summary */}
      <div className="p-5 rounded-xl" style={{ background: "rgba(255,255,255,0.02)", border: "0.5px solid rgba(255,255,255,0.08)" }}>
        <div className="text-[10px] font-bold uppercase tracking-widest text-foreground/30 mb-4" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          Configuration Summary
        </div>
        <div className="space-y-3">
          {fields.map(field => {
            const val = getDisplayValue(field, configValues[field.id]);
            return (
              <div key={field.id} className="flex items-start justify-between gap-3">
                <span className="text-xs text-foreground/40 shrink-0" style={{ fontFamily: "'Inter', sans-serif" }}>{field.label}</span>
                <span className="text-xs font-semibold text-right text-foreground/70 truncate max-w-xs" style={{ fontFamily: "'Inter', sans-serif" }}>
                  {val === "—" ? <span className="text-foreground/20">Not provided</span> : val}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pricing Breakdown */}
      <div className="p-5 rounded-xl" style={{ background: "rgba(255,255,255,0.02)", border: "0.5px solid rgba(255,255,255,0.08)" }}>
        <div className="text-[10px] font-bold uppercase tracking-widest text-foreground/30 mb-4" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          Order Summary
        </div>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-xs text-foreground/50" style={{ fontFamily: "'Inter', sans-serif" }}>Product: {product.title}</span>
            <span className="text-sm font-bold" style={{ fontFamily: "Georgia, serif" }}>₹{product.price.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-foreground/40" style={{ fontFamily: "'Inter', sans-serif" }}>Platform Fee (12%)</span>
            <span className="text-xs text-foreground/40" style={{ fontFamily: "'Inter', sans-serif" }}>₹{platformFee.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-foreground/40" style={{ fontFamily: "'Inter', sans-serif" }}>GST (18%)</span>
            <span className="text-xs text-foreground/40" style={{ fontFamily: "'Inter', sans-serif" }}>₹{gst.toLocaleString()}</span>
          </div>
          <div className="h-px bg-foreground/8" />
          <div className="flex justify-between items-center">
            <span className="text-sm font-bold text-foreground" style={{ fontFamily: "'Inter', sans-serif" }}>Total (Escrow)</span>
            <span className="text-xl font-bold text-foreground" style={{ fontFamily: "Georgia, serif" }}>₹{total.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Lock className="w-3 h-3 text-emerald-400" />
            <span className="text-[10px] text-emerald-400/70" style={{ fontFamily: "'Inter', sans-serif" }}>
              Protected by Deployra Escrow. Released only after delivery approval.
            </span>
          </div>
        </div>
      </div>

      {/* Delivery Info */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: Clock, label: "Delivery", value: `${product.deliveryDays} days` },
          { icon: RefreshCw, label: "Revisions", value: product.revisions },
          { icon: Shield, label: "Support", value: product.support },
        ].map(item => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="p-3 rounded-xl text-center" style={{ background: "rgba(255,255,255,0.02)", border: "0.5px solid rgba(255,255,255,0.08)" }}>
              <Icon className="w-4 h-4 mx-auto mb-1.5 text-foreground/40" />
              <div className="text-[10px] text-foreground/30 mb-0.5" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{item.label}</div>
              <div className="text-xs font-bold text-foreground/70" style={{ fontFamily: "'Inter', sans-serif" }}>{item.value}</div>
            </div>
          );
        })}
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
              className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-all ${confirmed ? "bg-foreground border-foreground" : "border-foreground/20 group-hover:border-foreground/40"}`}>
              {confirmed && <Check className="w-3 h-3 text-background" />}
            </div>
            <span className="text-xs text-foreground/50 leading-relaxed" style={{ fontFamily: "'Inter', sans-serif" }}>{text}</span>
          </label>
        ))}
      </div>

      <div className="flex gap-3">
        <button onClick={onBack}
          className="px-5 py-3 rounded-xl text-sm font-semibold transition-all"
          style={{ border: "0.5px solid rgba(255,255,255,0.12)", color: "hsl(var(--foreground) / 0.5)", fontFamily: "'Inter', sans-serif" }}>
          <ArrowLeft className="w-4 h-4" />
        </button>
        <button onClick={() => confirmed && onConfirm()} disabled={!confirmed}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-40"
          style={{ background: "hsl(var(--foreground))", color: "hsl(var(--background))", fontFamily: "'Inter', sans-serif" }}>
          <CreditCard className="w-4 h-4" /> Proceed to Payment — ₹{total.toLocaleString()}
        </button>
      </div>
    </div>
  );
}

// ─── Payment Success ─────────────────────────────────────────────────────────────
function PaymentSuccess({ product, orderId }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }}
        className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6"
        style={{ background: "rgba(16,185,129,0.08)", border: "0.5px solid rgba(16,185,129,0.3)" }}>
        <Check className="w-10 h-10 text-emerald-400" />
      </motion.div>
      <h2 className="text-2xl font-bold text-foreground mb-2" style={{ fontFamily: "Georgia, serif", letterSpacing: "-0.04em" }}>
        Order Created!
      </h2>
      <p className="text-sm text-foreground/40 mb-1" style={{ fontFamily: "'Inter', sans-serif" }}>
        Payment secured in Deployra Escrow
      </p>
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
        style={{ background: "rgba(255,255,255,0.04)", border: "0.5px solid rgba(255,255,255,0.1)" }}>
        <span className="text-xs font-mono text-foreground/40">Order ID:</span>
        <span className="text-xs font-bold text-foreground/70" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{orderId}</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8 text-left">
        {[
          { icon: Lock, color: "text-violet-400", bg: "rgba(139,92,246,0.08)", border: "rgba(139,92,246,0.2)", title: "Escrow Funded", desc: "₹" + (product.price * 1.18).toLocaleString() + " secured" },
          { icon: Clock, color: "text-sky-400", bg: "rgba(14,165,233,0.08)", border: "rgba(14,165,233,0.2)", title: "Developer Notified", desc: "Work starts soon" },
          { icon: Shield, color: "text-emerald-400", bg: "rgba(16,185,129,0.08)", border: "rgba(16,185,129,0.2)", title: "Protected", desc: "Full buyer protection" },
        ].map(item => {
          const Icon = item.icon;
          return (
            <div key={item.title} className="p-4 rounded-xl" style={{ background: item.bg, border: `0.5px solid ${item.border}` }}>
              <Icon className={`w-5 h-5 mb-2 ${item.color}`} />
              <div className={`text-sm font-bold ${item.color}`} style={{ fontFamily: "'Inter', sans-serif" }}>{item.title}</div>
              <div className="text-xs text-foreground/40 mt-0.5" style={{ fontFamily: "'Inter', sans-serif" }}>{item.desc}</div>
            </div>
          );
        })}
      </div>

      <div className="flex gap-3 justify-center">
        <button onClick={() => window.location.href = "/client/orders"}
          className="px-6 py-3 rounded-xl text-sm font-bold transition-all"
          style={{ background: "hsl(var(--foreground))", color: "hsl(var(--background))", fontFamily: "'Inter', sans-serif" }}>
          Track Order
        </button>
        <button onClick={() => window.location.href = "/client/marketplace"}
          className="px-6 py-3 rounded-xl text-sm font-semibold transition-all"
          style={{ border: "0.5px solid rgba(255,255,255,0.15)", color: "hsl(var(--foreground) / 0.5)", fontFamily: "'Inter', sans-serif" }}>
          Browse More
        </button>
      </div>
    </motion.div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────────
export default function ProductPurchasePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [activeScreenshot, setActiveScreenshot] = useState(0);

  // Purchase flow state
  const [purchaseStep, setPurchaseStep] = useState("detail"); // detail | config | review | success
  const [configValues, setConfigValues] = useState({});
  const [orderId, setOrderId] = useState(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setProduct(MOCK_PRODUCTS[id] || MOCK_PRODUCTS["p1"]);
      setLoading(false);
    }, 500);
  }, [id]);

  const handlePayment = async () => {
    setProcessing(true);
    await new Promise(r => setTimeout(r, 2500));
    const oid = "ORD-" + Math.floor(Math.random() * 90000 + 10000);
    setOrderId(oid);
    setProcessing(false);
    setPurchaseStep("success");
  };

  if (loading) return (
    <div className="p-8 flex items-center justify-center min-h-screen">
      <div className="w-8 h-8 rounded-full border-2 border-foreground/20 border-t-foreground animate-spin" />
    </div>
  );

  if (!product) return (
    <div className="p-8 text-center">
      <p className="text-foreground/40" style={{ fontFamily: "'Inter', sans-serif" }}>Product not found</p>
    </div>
  );

  if (purchaseStep === "success") {
    return (
      <div className="p-6 sm:p-8 max-w-2xl mx-auto page-fade-in">
        <PaymentSuccess product={product} orderId={orderId} />
      </div>
    );
  }

  if (purchaseStep === "review") {
    return (
      <div className="p-6 sm:p-8 max-w-2xl mx-auto page-fade-in">
        {processing ? (
          <div className="text-center py-20">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="w-12 h-12 rounded-full border-2 border-foreground/20 border-t-foreground mx-auto mb-4" />
            <p className="text-sm font-semibold text-foreground/40" style={{ fontFamily: "'Inter', sans-serif" }}>Processing payment & creating order...</p>
          </div>
        ) : (
          <ConfigReview
            product={product}
            configValues={configValues}
            onConfirm={handlePayment}
            onBack={() => setPurchaseStep("config")}
          />
        )}
      </div>
    );
  }

  if (purchaseStep === "config") {
    return (
      <div className="p-6 sm:p-8 max-w-2xl mx-auto page-fade-in">
        <div className="mb-6">
          <button onClick={() => setPurchaseStep("detail")} className="flex items-center gap-2 text-xs text-foreground/40 hover:text-foreground/70 transition-colors mb-4" style={{ fontFamily: "'Inter', sans-serif" }}>
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Product
          </button>
          <div className="stat-label-caps mb-2">Configuration</div>
          <h1 className="text-xl font-bold text-foreground section-title-gradient" style={{ fontFamily: "Georgia, serif", letterSpacing: "-0.04em" }}>
            {product.title}
          </h1>
          <p className="text-xs text-foreground/35 mt-1" style={{ fontFamily: "'Inter', sans-serif" }}>
            Fill in your business details so the developer can build exactly what you need.
          </p>
        </div>
        <div className="p-6 rounded-2xl" style={{ background: "rgba(255,255,255,0.02)", border: "0.5px solid rgba(255,255,255,0.08)" }}>
          <ConfigWizard
            product={product}
            onComplete={(values) => { setConfigValues(values); setPurchaseStep("review"); }}
            onBack={() => setPurchaseStep("detail")}
          />
        </div>
      </div>
    );
  }

  // ─── Product Detail View ──────────────────────────────────────────────────────
  return (
    <div className="p-6 sm:p-8 max-w-6xl page-fade-in">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-xs text-foreground/40 hover:text-foreground/70 transition-colors mb-6" style={{ fontFamily: "'Inter', sans-serif" }}>
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Marketplace
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ─── Left Column ──────────────────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Cover + Screenshots */}
          <div className="rounded-2xl overflow-hidden" style={{ border: "0.5px solid rgba(255,255,255,0.08)" }}>
            <img src={product.screenshots[activeScreenshot] || product.coverImage} alt={product.title}
              className="w-full h-72 object-cover" />
          </div>
          {product.screenshots.length > 1 && (
            <div className="flex gap-2">
              {product.screenshots.map((s, i) => (
                <button key={i} onClick={() => setActiveScreenshot(i)}
                  className="rounded-xl overflow-hidden transition-all"
                  style={{ border: `0.5px solid ${i === activeScreenshot ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.1)"}`, opacity: i === activeScreenshot ? 1 : 0.5 }}>
                  <img src={s} alt="" className="w-20 h-14 object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Tabs */}
          <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.08)" }}>
            {["overview", "features", "requirements", "reviews"].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className="flex-1 py-2 rounded-lg text-[11px] font-bold capitalize transition-all"
                style={{
                  background: activeTab === tab ? "hsl(var(--foreground))" : "transparent",
                  color: activeTab === tab ? "hsl(var(--background))" : "hsl(var(--foreground) / 0.4)",
                  fontFamily: "'JetBrains Mono', monospace"
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
                  <p className="text-sm text-foreground/60 leading-relaxed" style={{ fontFamily: "'Inter', sans-serif" }}>{product.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map(t => (
                      <span key={t} className="px-2.5 py-1 rounded-lg text-[10px] font-semibold"
                        style={{ background: "rgba(255,255,255,0.04)", border: "0.5px solid rgba(255,255,255,0.1)", color: "hsl(var(--foreground) / 0.5)", fontFamily: "'JetBrains Mono', monospace" }}>
                        {t}
                      </span>
                    ))}
                  </div>
                  {product.demoUrl && (
                    <a href={product.demoUrl} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
                      style={{ background: "rgba(255,255,255,0.04)", border: "0.5px solid rgba(255,255,255,0.12)", color: "hsl(var(--foreground) / 0.7)", fontFamily: "'Inter', sans-serif" }}>
                      <Play className="w-4 h-4" /> Try Live Demo
                    </a>
                  )}
                </div>
              )}
              {activeTab === "features" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {product.features.map(f => (
                    <div key={f} className="flex items-center gap-3 p-3 rounded-xl"
                      style={{ background: "rgba(255,255,255,0.02)", border: "0.5px solid rgba(255,255,255,0.06)" }}>
                      <div className="w-5 h-5 rounded-lg flex items-center justify-center shrink-0 bg-emerald-400/10">
                        <Check className="w-3 h-3 text-emerald-400" />
                      </div>
                      <span className="text-xs text-foreground/70" style={{ fontFamily: "'Inter', sans-serif" }}>{f}</span>
                    </div>
                  ))}
                </div>
              )}
              {activeTab === "requirements" && (
                <div className="space-y-3">
                  <p className="text-xs text-foreground/40 mb-3" style={{ fontFamily: "'Inter', sans-serif" }}>
                    What you need to provide for deployment:
                  </p>
                  {(product.configFields || []).map(f => {
                    const meta = FIELD_META[f.type] || FIELD_META.text;
                    const Icon = meta.icon;
                    return (
                      <div key={f.id} className="flex items-center gap-3 p-3 rounded-xl"
                        style={{ background: "rgba(255,255,255,0.02)", border: "0.5px solid rgba(255,255,255,0.06)" }}>
                        <Icon className="w-4 h-4 text-foreground/30 shrink-0" />
                        <div>
                          <div className="text-xs font-semibold text-foreground/70" style={{ fontFamily: "'Inter', sans-serif" }}>
                            {f.label}
                            {f.required && <span className="text-red-400 ml-1">*</span>}
                          </div>
                          {f.description && <div className="text-[10px] text-foreground/30 mt-0.5" style={{ fontFamily: "'Inter', sans-serif" }}>{f.description}</div>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              {activeTab === "reviews" && (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="text-4xl font-bold text-foreground" style={{ fontFamily: "Georgia, serif" }}>{product.rating}</div>
                    <div>
                      <Stars rating={product.rating} size={16} />
                      <p className="text-xs text-foreground/30 mt-1" style={{ fontFamily: "'Inter', sans-serif" }}>{product.reviewCount} reviews</p>
                    </div>
                  </div>
                  {product.reviews.map((r, i) => (
                    <div key={i} className="p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.02)", border: "0.5px solid rgba(255,255,255,0.06)" }}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-foreground/10 flex items-center justify-center text-xs font-bold text-foreground/60">{r.name[0]}</div>
                          <span className="text-xs font-semibold text-foreground/70" style={{ fontFamily: "'Inter', sans-serif" }}>{r.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Stars rating={r.rating} size={11} />
                          <span className="text-[10px] text-foreground/30 font-mono">{r.date}</span>
                        </div>
                      </div>
                      <p className="text-xs text-foreground/50 leading-relaxed" style={{ fontFamily: "'Inter', sans-serif" }}>{r.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ─── Right Column: Purchase Card ──────────────────────────────────────── */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 space-y-4">
            {/* Main Purchase Card */}
            <div className="p-6 rounded-2xl" style={{ background: "rgba(255,255,255,0.02)", border: "0.5px solid rgba(255,255,255,0.12)" }}>
              {/* Badges */}
              <div className="flex items-center gap-2 mb-4">
                {product.verified && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold"
                    style={{ background: "rgba(16,185,129,0.08)", border: "0.5px solid rgba(16,185,129,0.25)", color: "rgb(16,185,129)" }}>
                    <Shield className="w-2.5 h-2.5" /> Verified
                  </span>
                )}
                {product.featured && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold"
                    style={{ background: "rgba(234,179,8,0.08)", border: "0.5px solid rgba(234,179,8,0.25)", color: "rgb(234,179,8)" }}>
                    <Award className="w-2.5 h-2.5" /> Featured
                  </span>
                )}
              </div>

              <h1 className="text-lg font-bold text-foreground mb-1" style={{ fontFamily: "Georgia, serif", letterSpacing: "-0.04em" }}>
                {product.title}
              </h1>
              <p className="text-xs text-foreground/40 mb-4" style={{ fontFamily: "'Inter', sans-serif" }}>{product.shortDesc}</p>

              <div className="flex items-center gap-3 mb-4">
                <Stars rating={product.rating} />
                <span className="text-xs text-foreground/30 font-mono">{product.rating} ({product.reviewCount})</span>
                <span className="text-[10px] text-foreground/20">·</span>
                <span className="text-[10px] text-foreground/30 font-mono">{product.installs} deployed</span>
              </div>

              <div className="text-3xl font-bold text-foreground mb-1" style={{ fontFamily: "Georgia, serif" }}>
                ₹{product.price.toLocaleString()}
              </div>
              <div className="text-[10px] text-foreground/30 font-mono mb-5">+ 18% GST = ₹{Math.round(product.price * 1.18).toLocaleString()} total</div>

              <button onClick={() => setPurchaseStep("config")}
                className="w-full py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shimmer-btn"
                style={{ background: "hsl(var(--foreground))", color: "hsl(var(--background))", fontFamily: "'Inter', sans-serif" }}>
                <Zap className="w-4 h-4" /> Get Access
              </button>

              <div className="flex items-center justify-center gap-1.5 mt-3">
                <Lock className="w-3 h-3 text-foreground/25" />
                <span className="text-[10px] text-foreground/25" style={{ fontFamily: "'Inter', sans-serif" }}>Protected by Deployra Escrow</span>
              </div>

              {/* Meta */}
              <div className="mt-5 pt-5 space-y-3" style={{ borderTop: "0.5px solid rgba(255,255,255,0.06)" }}>
                {[
                  { icon: Clock, label: "Delivery", value: `${product.deliveryDays} days` },
                  { icon: RefreshCw, label: "Revisions", value: product.revisions },
                  { icon: Shield, label: "Support", value: product.support },
                  { icon: Package, label: "Deployment", value: product.deploymentMethod },
                ].map(item => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="w-3.5 h-3.5 text-foreground/30" />
                        <span className="text-[11px] text-foreground/40" style={{ fontFamily: "'Inter', sans-serif" }}>{item.label}</span>
                      </div>
                      <span className="text-[11px] font-semibold text-foreground/60" style={{ fontFamily: "'Inter', sans-serif" }}>{item.value}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Developer Card */}
            <div className="p-4 rounded-2xl" style={{ background: "rgba(255,255,255,0.02)", border: "0.5px solid rgba(255,255,255,0.08)" }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold"
                  style={{ background: "rgba(255,255,255,0.06)", border: "0.5px solid rgba(255,255,255,0.12)", color: "hsl(var(--foreground))", fontFamily: "Georgia, serif" }}>
                  {product.developer.avatar}
                </div>
                <div>
                  <div className="text-sm font-bold text-foreground/80" style={{ fontFamily: "'Inter', sans-serif" }}>{product.developer.name}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Stars rating={product.developer.rating} size={10} />
                    <span className="text-[10px] text-foreground/30 font-mono">{product.developer.products} products</span>
                  </div>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-[10px] text-foreground/30" style={{ fontFamily: "'Inter', sans-serif" }}>Completion Rate</span>
                <span className="text-xs font-bold text-emerald-400">{product.developer.completionRate}%</span>
              </div>
            </div>

            {/* Links */}
            <div className="flex gap-2">
              {product.docsUrl && (
                <a href={product.docsUrl} target="_blank" rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-all"
                  style={{ border: "0.5px solid rgba(255,255,255,0.1)", color: "hsl(var(--foreground) / 0.4)", fontFamily: "'Inter', sans-serif" }}>
                  <FileText className="w-3.5 h-3.5" /> Docs
                </a>
              )}
              {product.demoUrl && (
                <a href={product.demoUrl} target="_blank" rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-all"
                  style={{ border: "0.5px solid rgba(255,255,255,0.1)", color: "hsl(var(--foreground) / 0.4)", fontFamily: "'Inter', sans-serif" }}>
                  <Globe className="w-3.5 h-3.5" /> Demo
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
