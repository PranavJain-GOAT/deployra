import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, X, Save, Loader2, CheckCircle, AlertCircle, Info } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { API_URL } from "@/lib/config";

const CATEGORIES = ["Chatbot", "Automation", "Website", "Analytics", "Marketing", "Data", "DevOps", "CRM", "Security", "AI Agent", "Support", "Monitoring", "Forms", "Other"];

export default function AddProduct() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);

    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(isEdit);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState("");

    const [form, setForm] = useState({
        title: "",
        shortDesc: "",
        description: "",
        price: "",
        category: "Chatbot",
        deliveryDays: 7,
        revisions: "2",
        support: "30 Days",
        deploymentMethod: "Developer Hosted",
        hostingRequirements: "",
        demoUrl: "",
        docsUrl: "",
        videoUrl: "",
        walkthroughUrl: "",
        coverImage: "",
        screenshots: [],
        tags: [],
        features: [],
        industries: [],
        requirements: [],
        configFields: [],
        isDraft: false,
    });

    // Tag/list input states
    const [tagInput, setTagInput] = useState("");
    const [featureInput, setFeatureInput] = useState("");
    const [industryInput, setIndustryInput] = useState("");
    const [requirementInput, setRequirementInput] = useState("");
    const [screenshotInput, setScreenshotInput] = useState("");

    // Load existing product if editing
    useEffect(() => {
        if (!isEdit) return;
        const token = localStorage.getItem("auth_token");
        axios.get(`${API_URL}/products/${id}`, {
            withCredentials: true,
            headers: token ? { Authorization: `Bearer ${token}` } : {}
        })
        .then(res => {
            const p = res.data?.data || {};
            setForm({
                title: p.title || "",
                shortDesc: p.shortDesc || "",
                description: p.description || "",
                price: p.price || "",
                category: p.category || "Chatbot",
                deliveryDays: p.deliveryDays || 7,
                revisions: p.revisions || "2",
                support: p.support || "30 Days",
                deploymentMethod: p.deploymentMethod || "Developer Hosted",
                hostingRequirements: p.hostingRequirements || "",
                demoUrl: p.demoUrl || "",
                docsUrl: p.docsUrl || "",
                videoUrl: p.videoUrl || "",
                walkthroughUrl: p.walkthroughUrl || "",
                coverImage: p.coverImage || "",
                screenshots: p.screenshots || [],
                tags: p.tags || [],
                features: p.features || [],
                industries: p.industries || [],
                requirements: p.requirements || [],
                configFields: p.configSchema || [],
                isDraft: p.status === "DRAFT",
            });
        })
        .catch(() => setError("Could not load product."))
        .finally(() => setLoading(false));
    }, [id, isEdit]);

    const f = (field) => (e) => setForm(p => ({ ...p, [field]: e.target.value }));

    const addToList = (field, value, setter) => {
        if (value.trim()) {
            setForm(p => ({ ...p, [field]: [...(p[field] || []), value.trim()] }));
            setter("");
        }
    };
    const removeFromList = (field, index) => {
        setForm(p => ({ ...p, [field]: p[field].filter((_, i) => i !== index) }));
    };

    const handleSubmit = async (e, asDraft = false) => {
        if (e) e.preventDefault();
        setError("");
        setSaving(true);

        const token = localStorage.getItem("auth_token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const payload = {
            ...form,
            isDraft: asDraft,
            price: parseFloat(form.price) || 0,
            deliveryDays: parseInt(form.deliveryDays, 10) || 7,
        };

        try {
            if (isEdit) {
                await axios.patch(`${API_URL}/products/${id}`, payload, { withCredentials: true, headers });
            } else {
                await axios.post(`${API_URL}/products`, payload, { withCredentials: true, headers });
            }

            if (!asDraft) {
                setSubmitted(true);
            } else {
                navigate("/developer/listings");
            }
        } catch (err) {
            setError(err.response?.data?.message || "Something went wrong. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-32">
                <Loader2 className="w-8 h-8 animate-spin text-foreground/30" />
            </div>
        );
    }

    // ── Success State ────────────────────────────────────────────────────────────
    if (submitted) {
        return (
            <div className="p-6 sm:p-8 max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center">
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 300, damping: 24 }}>
                    <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6"
                        style={{ background: "rgba(16,138,0,0.12)", border: "0.5px solid rgba(16,138,0,0.3)" }}>
                        <CheckCircle className="w-10 h-10 text-emerald-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: "Georgia, serif", letterSpacing: "-0.04em" }}>
                        Product Submitted for Review!
                    </h1>
                    <p className="text-sm text-foreground/50 leading-relaxed mb-2 max-w-md" style={{ fontFamily: "'Inter', sans-serif" }}>
                        Your product has been submitted and a full review request has been sent to the Deployra admin.
                    </p>
                    <p className="text-xs text-foreground/35 mb-8 max-w-md" style={{ fontFamily: "'Inter', sans-serif" }}>
                        Once approved, your product will automatically go live on the marketplace and you'll receive an email notification. This typically takes 1–3 business days.
                    </p>

                    <div className="frosted-panel p-5 mb-8 text-left max-w-md mx-auto"
                        style={{ border: "0.5px solid rgba(245,158,11,0.2)", background: "rgba(245,158,11,0.05)" }}>
                        <div className="flex items-start gap-3">
                            <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-xs font-semibold text-amber-400 mb-1">What happens next?</p>
                                <ul className="text-xs text-foreground/40 space-y-1" style={{ fontFamily: "'Inter', sans-serif" }}>
                                    <li>• Admin receives an email with all product details</li>
                                    <li>• Admin reviews from the Deployra Admin Center</li>
                                    <li>• If approved → your product goes live immediately</li>
                                    <li>• If changes needed → you'll receive an email with feedback</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <Link to="/developer/listings">
                        <button className="px-8 py-3 rounded-xl font-bold text-sm bg-foreground text-background hover:bg-foreground/90 transition-all">
                            View My Listings
                        </button>
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="p-6 sm:p-8 max-w-3xl page-fade-in">
            <Link to="/developer/listings" className="flex items-center gap-2 text-foreground/40 hover:text-foreground text-sm mb-6 transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Listings
            </Link>

            <div className="mb-8">
                <div className="stat-label-caps mb-2">Developer · {isEdit ? "Edit Product" : "New Submission"}</div>
                <h1 className="font-bold text-2xl sm:text-3xl text-white section-title-gradient" style={{ fontFamily: "Georgia, serif", letterSpacing: "-0.04em" }}>
                    {isEdit ? "Edit Product" : "Publish a Product"}
                </h1>
                <p className="text-sm mt-1.5" style={{ color: "hsl(var(--foreground) / 0.35)", fontFamily: "'Inter', sans-serif" }}>
                    {isEdit
                        ? "Update your product details. Changes to approved products require re-review."
                        : "Fill in the details below. After submission, admin will review and approve before it goes live on the marketplace."}
                </p>
            </div>

            {/* Review Notice */}
            {!isEdit && (
                <div className="frosted-panel p-4 mb-6 flex items-start gap-3"
                    style={{ border: "0.5px solid rgba(245,158,11,0.2)", background: "rgba(245,158,11,0.04)" }}>
                    <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-foreground/50 leading-relaxed" style={{ fontFamily: "'Inter', sans-serif" }}>
                        <strong className="text-amber-400">Approval Required:</strong> Submitted products are sent to the Deployra admin for review. Only approved products are visible on the marketplace. You'll receive an email with the decision.
                    </p>
                </div>
            )}

            {/* Error Banner */}
            <AnimatePresence>
                {error && (
                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="frosted-panel p-4 mb-5 flex items-start gap-3"
                        style={{ border: "0.5px solid rgba(239,68,68,0.25)", background: "rgba(239,68,68,0.05)" }}>
                        <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                        <p className="text-xs text-red-400" style={{ fontFamily: "'Inter', sans-serif" }}>{error}</p>
                    </motion.div>
                )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-5">

                {/* ── Basic Info ─────────────────────────────────────────────── */}
                <Section title="Basic Information">
                    <Field label="Product Title" required>
                        <input value={form.title} onChange={f("title")} required
                            placeholder="e.g. AI Customer Support Bot"
                            className="input-base" />
                    </Field>
                    <Field label="Short Description" required>
                        <input value={form.shortDesc} onChange={f("shortDesc")} required
                            placeholder="One-liner (shown in marketplace cards)"
                            className="input-base" maxLength={160} />
                        <p className="text-[10px] text-foreground/25 mt-1 font-mono">{form.shortDesc.length}/160</p>
                    </Field>
                    <Field label="Full Description" required>
                        <textarea value={form.description} onChange={f("description")} required rows={5}
                            placeholder="Describe what your product does, how it works, and who it's for..."
                            className="input-base resize-none" />
                    </Field>
                </Section>

                {/* ── Pricing & Delivery ─────────────────────────────────────── */}
                <Section title="Pricing & Delivery">
                    <div className="grid grid-cols-2 gap-4">
                        <Field label="Price ($)" required>
                            <input type="number" value={form.price} onChange={f("price")} required min="1"
                                placeholder="e.g. 299"
                                className="input-base" />
                        </Field>
                        <Field label="Delivery (days)">
                            <input type="number" value={form.deliveryDays} onChange={f("deliveryDays")} min="1"
                                className="input-base" />
                        </Field>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Field label="Category">
                            <select value={form.category} onChange={f("category")} className="input-base">
                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </Field>
                        <Field label="Revisions Included">
                            <select value={form.revisions} onChange={f("revisions")} className="input-base">
                                {["0", "1", "2", "3", "5", "Unlimited"].map(v => <option key={v} value={v}>{v}</option>)}
                            </select>
                        </Field>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Field label="Support Duration">
                            <select value={form.support} onChange={f("support")} className="input-base">
                                {["7 Days", "14 Days", "30 Days", "60 Days", "90 Days", "1 Year", "Lifetime"].map(v => <option key={v} value={v}>{v}</option>)}
                            </select>
                        </Field>
                        <Field label="Deployment Method">
                            <select value={form.deploymentMethod} onChange={f("deploymentMethod")} className="input-base">
                                {["Developer Hosted", "Client Hosted", "Cloud Managed", "SaaS"].map(v => <option key={v} value={v}>{v}</option>)}
                            </select>
                        </Field>
                    </div>
                </Section>

                {/* ── Links ─────────────────────────────────────────────────── */}
                <Section title="Links & Media">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field label="Demo URL">
                            <input type="url" value={form.demoUrl} onChange={f("demoUrl")}
                                placeholder="https://demo.example.com"
                                className="input-base" />
                        </Field>
                        <Field label="Documentation URL">
                            <input type="url" value={form.docsUrl} onChange={f("docsUrl")}
                                placeholder="https://docs.example.com"
                                className="input-base" />
                        </Field>
                        <Field label="Video / Walkthrough URL">
                            <input type="url" value={form.videoUrl} onChange={f("videoUrl")}
                                placeholder="https://youtube.com/watch?v=..."
                                className="input-base" />
                        </Field>
                        <Field label="Cover Image URL">
                            <input type="url" value={form.coverImage} onChange={f("coverImage")}
                                placeholder="https://cdn.example.com/cover.png"
                                className="input-base" />
                        </Field>
                    </div>
                    <ListInput
                        label="Screenshot URLs"
                        items={form.screenshots}
                        value={screenshotInput}
                        onChange={setScreenshotInput}
                        onAdd={() => addToList("screenshots", screenshotInput, setScreenshotInput)}
                        onRemove={(i) => removeFromList("screenshots", i)}
                        placeholder="https://cdn.example.com/screenshot1.png"
                    />
                </Section>

                {/* ── Features & Tags ───────────────────────────────────────── */}
                <Section title="Features & Tags">
                    <ListInput
                        label="Key Features"
                        items={form.features}
                        value={featureInput}
                        onChange={setFeatureInput}
                        onAdd={() => addToList("features", featureInput, setFeatureInput)}
                        onRemove={(i) => removeFromList("features", i)}
                        placeholder="e.g. Multi-language support"
                    />
                    <ListInput
                        label="Tags"
                        items={form.tags}
                        value={tagInput}
                        onChange={setTagInput}
                        onAdd={() => addToList("tags", tagInput, setTagInput)}
                        onRemove={(i) => removeFromList("tags", i)}
                        placeholder="e.g. GPT-4, Slack, Stripe"
                    />
                    <ListInput
                        label="Industries / Who it's for"
                        items={form.industries}
                        value={industryInput}
                        onChange={setIndustryInput}
                        onAdd={() => addToList("industries", industryInput, setIndustryInput)}
                        onRemove={(i) => removeFromList("industries", i)}
                        placeholder="e.g. Restaurants, E-commerce"
                    />
                    <ListInput
                        label="Requirements (for client)"
                        items={form.requirements}
                        value={requirementInput}
                        onChange={setRequirementInput}
                        onAdd={() => addToList("requirements", requirementInput, setRequirementInput)}
                        onRemove={(i) => removeFromList("requirements", i)}
                        placeholder="e.g. Valid domain name"
                    />
                </Section>

                {/* ── Hosting ───────────────────────────────────────────────── */}
                <Section title="Technical Details">
                    <Field label="Hosting Requirements">
                        <textarea value={form.hostingRequirements} onChange={f("hostingRequirements")} rows={2}
                            placeholder="e.g. Node.js 18+, PostgreSQL, 2GB RAM minimum"
                            className="input-base resize-none" />
                    </Field>
                </Section>

                {/* ── Action Buttons ────────────────────────────────────────── */}
                <div className="flex items-center gap-3 pt-2">
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm bg-foreground text-background hover:bg-foreground/90 transition-all disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {saving ? "Submitting..." : isEdit ? "Update & Resubmit" : "Submit for Review"}
                    </button>
                    <button
                        type="button"
                        disabled={saving}
                        onClick={(e) => handleSubmit(null, true)}
                        className="px-5 py-3.5 rounded-xl font-semibold text-sm border border-foreground/10 text-foreground/50 hover:text-foreground hover:bg-foreground/5 transition-all disabled:opacity-40"
                    >
                        Save as Draft
                    </button>
                </div>

                <p className="text-[10px] text-foreground/25 text-center pb-4" style={{ fontFamily: "'Inter', sans-serif" }}>
                    By submitting, you confirm that all information is accurate and you own the rights to this product.
                    Only approved products appear on the marketplace.
                </p>
            </form>
        </div>
    );
}

// ── Reusable Components ──────────────────────────────────────────────────────────

function Section({ title, children }) {
    return (
        <div className="frosted-panel p-5 space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-widest text-foreground/30 font-mono border-b border-foreground/5 pb-3">{title}</h2>
            {children}
        </div>
    );
}

function Field({ label, children, required }) {
    return (
        <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 font-mono mb-1.5 block">
                {label} {required && <span className="text-red-400">*</span>}
            </label>
            {children}
        </div>
    );
}

function ListInput({ label, items, value, onChange, onAdd, onRemove, placeholder }) {
    return (
        <Field label={label}>
            <div className="flex gap-2 mb-2">
                <input
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    placeholder={placeholder}
                    onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); onAdd(); } }}
                    className="flex-1 input-base"
                />
                <button type="button" onClick={onAdd}
                    className="px-3 py-2 rounded-xl border border-foreground/10 text-foreground/50 hover:text-foreground hover:bg-foreground/5 transition-all shrink-0">
                    <Plus className="w-4 h-4" />
                </button>
            </div>
            {items.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                    {items.map((item, i) => (
                        <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium"
                            style={{ background: "rgba(150,150,150,0.06)", border: "0.5px solid rgba(150,150,150,0.12)", color: "hsl(var(--foreground) / 0.7)" }}>
                            {item}
                            <button type="button" onClick={() => onRemove(i)} className="ml-0.5 text-foreground/30 hover:text-foreground">
                                <X className="w-2.5 h-2.5" />
                            </button>
                        </span>
                    ))}
                </div>
            )}
        </Field>
    );
}