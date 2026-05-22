import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, X, Save, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

export default function AddProduct() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(isEdit);
    const [form, setForm] = useState({
        title: "", description: "", price: "",
        category: "chatbot", delivery_days: 5, demo_url: "",
        features: [], whats_included: [], whats_not_included: [],
        who_its_for: [], what_it_does: "", customization_options: [],
        developer_name: "", developer_email: "",
    });
    const [newFeature, setNewFeature] = useState("");
    const [newIncluded, setNewIncluded] = useState("");
    const [newNotIncluded, setNewNotIncluded] = useState("");
    const [newWho, setNewWho] = useState("");
    const [newCustom, setNewCustom] = useState("");

    useEffect(() => {
        // In a real integration, load product data from the backend API by ID
        setLoading(false);
    }, [id, isEdit]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        // TODO: Connect to backend API to save product data
        await new Promise(r => setTimeout(r, 600)); // Simulate save
        setSaving(false);
        navigate("/developer/listings");
    };

    const addToList = (field, value, setter) => {
        if (value.trim()) {
            setForm((p) => ({ ...p, [field]: [...(p[field] || []), value.trim()] }));
            setter("");
        }
    };

    const removeFromList = (field, index) => {
        setForm((p) => ({ ...p, [field]: p[field].filter((_, i) => i !== index) }));
    };

    if (loading) {
        return (
            <div className="flex justify-center py-32">
                <div className="w-8 h-8 border-4 border-muted border-t-foreground rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-6 sm:p-8 max-w-3xl">
            <Link to="/developer/listings" className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm mb-6 transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Listings
            </Link>

            <h1 className="font-heading text-2xl sm:text-3xl font-bold mb-2">
                {isEdit ? "Edit Product" : "Add New Product"}
            </h1>
            <p className="text-muted-foreground text-sm mb-8">
                {isEdit ? "Update your product details" : "List your product on the marketplace"}
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
                <Field label="Title" required>
                    <input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} required
                        className="w-full px-4 py-3 bg-muted border-2 border-transparent focus:border-foreground rounded-xl text-sm font-medium focus:outline-none transition-colors"
                        placeholder="e.g. AI Customer Support Bot" />
                </Field>

                <Field label="Description" required>
                    <textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} required rows={3}
                        className="w-full px-4 py-3 bg-muted border-2 border-transparent focus:border-foreground rounded-xl text-sm font-medium focus:outline-none transition-colors resize-none"
                        placeholder="Describe what your product does and its benefits" />
                </Field>

                <Field label="Price ($)" required>
                    <input type="number" value={form.price} onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))} required
                        className="w-full px-4 py-3 bg-muted border-2 border-transparent focus:border-foreground rounded-xl text-sm font-medium focus:outline-none transition-colors"
                        placeholder="e.g. 49" />
                </Field>

                <div className="grid grid-cols-2 gap-4">
                    <Field label="Category">
                        <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                            className="w-full px-4 py-3 bg-muted border-2 border-transparent focus:border-foreground rounded-xl text-sm font-medium focus:outline-none transition-colors">
                            <option value="chatbot">Chatbot</option>
                            <option value="automation">Automation</option>
                            <option value="website">Website</option>
                            <option value="analytics">Analytics</option>
                            <option value="marketing">Marketing</option>
                            <option value="other">Other</option>
                        </select>
                    </Field>
                    <Field label="Delivery (days)">
                        <input type="number" value={form.delivery_days} onChange={(e) => setForm((p) => ({ ...p, delivery_days: e.target.value }))}
                            className="w-full px-4 py-3 bg-muted border-2 border-transparent focus:border-foreground rounded-xl text-sm font-medium focus:outline-none transition-colors" />
                    </Field>
                </div>

                <Field label="Demo URL">
                    <input value={form.demo_url} onChange={(e) => setForm((p) => ({ ...p, demo_url: e.target.value }))}
                        className="w-full px-4 py-3 bg-muted border-2 border-transparent focus:border-foreground rounded-xl text-sm font-medium focus:outline-none transition-colors"
                        placeholder="https://demo.example.com" />
                </Field>

                <div className="grid grid-cols-2 gap-4">
                    <Field label="Your Name">
                        <input value={form.developer_name} onChange={(e) => setForm((p) => ({ ...p, developer_name: e.target.value }))}
                            className="w-full px-4 py-3 bg-muted border-2 border-transparent focus:border-foreground rounded-xl text-sm font-medium focus:outline-none transition-colors" />
                    </Field>
                    <Field label="Your Email">
                        <input type="email" value={form.developer_email} onChange={(e) => setForm((p) => ({ ...p, developer_email: e.target.value }))}
                            className="w-full px-4 py-3 bg-muted border-2 border-transparent focus:border-foreground rounded-xl text-sm font-medium focus:outline-none transition-colors" />
                    </Field>
                </div>

                <Field label="What it does">
                    <textarea value={form.what_it_does} onChange={(e) => setForm((p) => ({ ...p, what_it_does: e.target.value }))} rows={2}
                        className="w-full px-4 py-3 bg-muted border-2 border-transparent focus:border-foreground rounded-xl text-sm font-medium focus:outline-none transition-colors resize-none"
                        placeholder="Simple explanation in non-technical language" />
                </Field>

                <ListField label="Features" items={form.features} value={newFeature} onChange={setNewFeature}
                    onAdd={() => addToList("features", newFeature, setNewFeature)}
                    onRemove={(i) => removeFromList("features", i)} placeholder="e.g. Multi-language support" />

                <ListField label="What's Included" items={form.whats_included} value={newIncluded} onChange={setNewIncluded}
                    onAdd={() => addToList("whats_included", newIncluded, setNewIncluded)}
                    onRemove={(i) => removeFromList("whats_included", i)} placeholder="e.g. Full setup & configuration" />

                <ListField label="What's NOT Included" items={form.whats_not_included} value={newNotIncluded} onChange={setNewNotIncluded}
                    onAdd={() => addToList("whats_not_included", newNotIncluded, setNewNotIncluded)}
                    onRemove={(i) => removeFromList("whats_not_included", i)} placeholder="e.g. Hosting costs" />

                <ListField label="Who it's for" items={form.who_its_for} value={newWho} onChange={setNewWho}
                    onAdd={() => addToList("who_its_for", newWho, setNewWho)}
                    onRemove={(i) => removeFromList("who_its_for", i)} placeholder="e.g. Restaurants" />

                <ListField label="Customization Options" items={form.customization_options} value={newCustom} onChange={setNewCustom}
                    onAdd={() => addToList("customization_options", newCustom, setNewCustom)}
                    onRemove={(i) => removeFromList("customization_options", i)} placeholder="e.g. Custom branding" />

                <Button type="submit" disabled={saving} className="w-full bg-foreground text-background font-heading font-bold text-base rounded-xl h-14 gap-2">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {isEdit ? "Update Product" : "Publish Product"}
                </Button>
            </form>
        </div>
    );
}

function Field({ label, children, required }) {
    return (
        <div>
            <label className="text-xs font-heading font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                {label} {required && <span className="text-destructive">*</span>}
            </label>
            {children}
        </div>
    );
}

function ListField({ label, items, value, onChange, onAdd, onRemove, placeholder }) {
    return (
        <Field label={label}>
            <div className="flex gap-2 mb-2">
                <input
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); onAdd(); } }}
                    className="flex-1 px-4 py-3 bg-muted border-2 border-transparent focus:border-foreground rounded-xl text-sm font-medium focus:outline-none transition-colors"
                />
                <Button type="button" onClick={onAdd} variant="outline" className="border-2 border-foreground/20 rounded-xl shrink-0">
                    <Plus className="w-4 h-4" />
                </Button>
            </div>
            {items.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {items.map((item, i) => (
                        <span key={i} className="inline-flex items-center gap-1.5 bg-muted border border-border px-3 py-1.5 rounded-lg text-xs font-medium">
                            {item}
                            <button type="button" onClick={() => onRemove(i)}><X className="w-3 h-3" /></button>
                        </span>
                    ))}
                </div>
            )}
        </Field>
    );
}