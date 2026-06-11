import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { MOCK_PRODUCTS, MOCK_CUSTOM_SOLUTIONS } from "@/api/mockData";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, Check, Upload, Settings, CreditCard, Loader2, Link as LinkIcon, ExternalLink, Plus, X, Image as ImageIcon, FileText, FileBadge, Building2, MapPin, Mail, Phone, Globe, Briefcase, UserRoundSearch } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { API_URL } from "@/lib/config";

const loadScript = src => new Promise((resolve) => {
  const script = document.createElement('script');
  script.src = src;
  script.onload = () => resolve(true);
  script.onerror = () => resolve(false);
  document.body.appendChild(script);
});

const STEPS = [
  { num: 1, label: "Company Details", icon: Building2 },
  { num: 2, label: "Dev Instructions", icon: UserRoundSearch },
  { num: 3, label: "Payment", icon: CreditCard },
];

export default function InstallFlow() {
  const { id } = useParams();
  const [step, setStep] = useState(1);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  
  // Delivery State Tracking
  // 0: Payment Completed, 1: Setup in Progress, 2: Delivered
  const [deliveryStatus, setDeliveryStatus] = useState(0);

  const [formData, setFormData] = useState({
    companyName: "",
    industry: "",
    email: "",
    phone: "",
    location: "",
    website: "",
    taxId: "",
    logoUploaded: false,
    imagesUploaded: false,
    extraDocuments: [{ name: "", uploaded: false }],
    customInstructions: [""],
  });

  const urlParams = new URLSearchParams(window.location.search);
  const type = urlParams.get("type") || "instant";

  useEffect(() => {
    // Show mock product or custom solution instantly first
    let foundMock = null;
    if (type === "instant") {
      foundMock = MOCK_PRODUCTS.find(p => p.id === id);
    } else {
      foundMock = MOCK_CUSTOM_SOLUTIONS.find(s => s.id === id);
    }

    if (foundMock) {
      setProduct(foundMock);
      setLoading(false);
    } else {
      setLoading(true);
    }

    const loadProduct = async () => {
      if (type === "instant") {
        try {
          const res = await axios.get(`${API_URL}/products/${id}`);
          if (res.data?.success && res.data?.data) {
            setProduct(res.data.data);
            setLoading(false);
            return;
          }
        } catch (err) {
          console.error("Failed to fetch product from backend, trying mock fallback...", err.message);
        }
        if (!foundMock) {
          const found = MOCK_PRODUCTS.find(p => p.id === id);
          setProduct(found || null);
          setLoading(false);
        }
      } else {
        if (!foundMock) {
          const found = MOCK_CUSTOM_SOLUTIONS.find(s => s.id === id);
          setProduct(found || null);
          setLoading(false);
        }
      }
    };

    loadProduct();
  }, [id, type]);

  const handleRazorpayCheckout = async () => {
    const amount = product?.price || product?.price_min || 0;
    setLoading(true);
    
    try {
      const { data } = await axios.post(`${API_URL}/payment/order`, {
        amount: amount,
        currency: 'USD'
      });
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to create order');
      }
      
      const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
      if (!res) {
        alert('Razorpay SDK failed to load. Are you online?');
        setLoading(false);
        return;
      }
      
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || '', // Needs to be added to frontend .env
        amount: Math.round(amount * 100),
        currency: data.currency,
        name: 'Deployra',
        description: `Deployment setup for ${product?.title || 'System'}`,
        order_id: data.order_id,
        handler: async function (response) {
          try {
            const verifyData = await axios.post(`${API_URL}/payment/verify`, {
              orderId: data.order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature
            });
            
            if (verifyData.data.success) {
               setLoading(false);
               setStep(4);
               setDeliveryStatus(0);
               setTimeout(() => setDeliveryStatus(1), 1500);
               setTimeout(() => setDeliveryStatus(2), 4000);
            }
          } catch (err) {
             console.error("Verification failed", err);
             alert("Payment verification failed.");
          }
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          }
        },
        theme: {
          color: '#4D9FFF'
        }
      };
      
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
         console.error(response.error.description);
         alert("Payment failed: " + response.error.description);
      });
      rzp.open();
      
    } catch (error) {
      console.error(error);
      alert("Checkout error: " + (error.response?.data?.message || error.message));
      setLoading(false);
    }
  };

  const simulateUpload = (field) => {
    setFormData(p => ({ ...p, [field]: true }));
  };

  const simulateExtraUpload = (index) => {
    const newDocs = [...formData.extraDocuments];
    newDocs[index].uploaded = true;
    setFormData(p => ({ ...p, extraDocuments: newDocs }));
  };

  const addExtraDoc = () => {
    setFormData(p => ({ ...p, extraDocuments: [...p.extraDocuments, { name: "", uploaded: false }] }));
  };

  const removeExtraDoc = (index) => {
    const newDocs = formData.extraDocuments.filter((_, i) => i !== index);
    setFormData(p => ({ ...p, extraDocuments: newDocs }));
  };

  if (loading && step < 4) {
    return (
      <div className="flex justify-center items-center py-32 flex-col gap-4">
        <div className="w-8 h-8 border-4 border-muted border-t-foreground rounded-full animate-spin" />
        {step === 3 && <p className="text-sm font-semibold text-muted-foreground animate-pulse">Processing Payment securely via Razorpay...</p>}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <svg className="hidden">
        <defs>
          <filter id="goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="goo" />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>
      </svg>

      {/* Floating Breadcrumbs (Desktop) */}
      {step < 4 && (
        <div className="hidden xl:block fixed left-10 top-1/2 -translate-y-1/2 p-7 glass-dark rounded-[2rem] z-50 shadow-2xl border border-white/10 backdrop-blur-xl">
           <div className="text-[10px] font-mono tracking-widest text-[#4D9FFF] mb-8 uppercase text-center font-bold">Install Progress</div>
           <div className="flex flex-col gap-10 relative">
             <div className="absolute left-[15px] top-4 bottom-4 w-px bg-white/10" />
             <motion.div 
                className="absolute left-[15px] top-4 w-[2px] bg-gradient-to-b from-[#4D9FFF] to-[#4D9FFF] rounded-full shadow-[0_0_10px_rgba(77,159,255,0.8)]"
                initial={{ height: 0 }}
                animate={{ height: `${((Math.min(step, 3) - 1) / (STEPS.length - 1)) * 100}%` }} 
                transition={{ type: 'spring', damping: 20, stiffness: 100 }} 
             />
             
             {STEPS.map((s) => (
                <div key={s.num} className="flex items-center gap-4 relative z-10 group">
                   <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                       step > s.num ? 'bg-[#4D9FFF] text-[#0a0a0a] shadow-[0_0_15px_rgba(77,159,255,0.4)]' : 
                       step === s.num ? 'bg-white text-[#0a0a0a] shadow-[0_0_20px_rgba(255,255,255,0.8)] scale-110 border border-white/20' : 
                       'bg-[#0a0a0a] border border-white/20 text-white/30 group-hover:border-white/50'
                   }`}>
                      {step > s.num ? <Check className="w-4 h-4" /> : <s.icon className={`w-3.5 h-3.5 ${step === s.num ? 'stroke-[2.5px]' : ''}`} />}
                   </div>
                   <div className={`font-semibold text-xs tracking-wide transition-colors ${step >= s.num ? 'text-white' : 'text-white/30'}`}>{s.label}</div>
                </div>
             ))}
           </div>
        </div>
      )}

      {/* Progress Bar (Mobile) */}
      {step < 4 && (
        <div className="mb-10 xl:hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-semibold text-white/80" style={{ fontFamily: 'Georgia, serif' }}>
              Step {Math.min(step, 3)} of {STEPS.length}
              <span className="text-white/30 font-normal ml-2 font-mono text-xs">— {STEPS[Math.min(step, 3) - 1]?.label}</span>
            </div>
            <div className="text-xs font-mono text-[#4D9FFF]">{Math.round(((Math.min(step, 3) - 1) / STEPS.length) * 100)}% <span className="opacity-50">complete</span></div>
          </div>
          
          <div className="relative h-2.5 w-full bg-white/5 rounded-full overflow-hidden" style={{ filter: 'url(#goo)' }}>
             <motion.div 
               className="absolute top-0 left-0 bottom-0 bg-gradient-to-r from-nova-blue to-cyber-green rounded-r-full"
               initial={{ width: 0 }}
               animate={{ width: `${((Math.min(step, 3) - 1) / (STEPS.length - 1)) * 100}%` }}
               transition={{ type: "spring", stiffness: 60, damping: 15, mass: 1.5 }}
             />
             <motion.div 
               className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#4D9FFF]"
               initial={{ left: 0 }}
               animate={{ left: `calc(${((Math.min(step, 3) - 1) / (STEPS.length - 1)) * 100}% - 8px)` }}
               transition={{ type: "spring", stiffness: 60, damping: 15, mass: 1.5 }}
             />
          </div>

          <div className="flex justify-between mt-4">
            {STEPS.map((s) => (
              <div key={s.num} className="flex items-center justify-center flex-1 text-center px-1">
                <span className={`text-[8px] sm:text-[10px] leading-tight font-mono tracking-wider uppercase ${step >= s.num ? 'text-[#4D9FFF]' : 'text-white/20'}`}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        {step === 4 ? (
          <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 220, damping: 22 }} className="max-w-xl mx-auto py-8">
            <div className="bg-card border border-white/10 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden">
              {/* Animated glow background */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[150%] h-[150%] bg-gradient-to-b from-nova-blue/10 to-transparent rounded-full blur-[100px] pointer-events-none" />

              <h2 className="font-heading text-3xl font-bold mb-8 text-center text-white relative z-10">Order Status</h2>
              
              <div className="space-y-6 relative z-10 mb-10">
                <StatusItem active={deliveryStatus >= 0} label="Payment Completed" time="Just now" icon={CreditCard} />
                <StatusItem active={deliveryStatus >= 1} label="Developer Workflow: Setup in Progress" time={deliveryStatus >= 1 ? "In Progress" : "Waiting..."} icon={Settings} loading={deliveryStatus === 1} />
                <StatusItem active={deliveryStatus >= 2} label="System Delivered & Hosted" time={deliveryStatus >= 2 ? "Ready" : "Pending..."} icon={Check} isLast />
              </div>

              {deliveryStatus === 2 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center border-t border-white/10 pt-8 mt-4 relative z-10">
                   <div className="w-16 h-16 bg-white text-black rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(255,255,255,0.3)]">
                     <Check className="w-8 h-8" />
                   </div>
                   <h3 className="text-2xl font-bold mb-2">Your system is live!</h3>
                   <p className="text-muted-foreground text-sm mb-6">We've generated a unique client instance for your platform.</p>
                   
                   <div className="bg-black/50 border border-white/10 rounded-xl p-4 flex items-center justify-between mb-8">
                     <div className="flex items-center gap-3">
                       <LinkIcon className="w-4 h-4 text-[#4D9FFF]" />
                       <span className="font-mono text-sm text-white/80">https://platform.com/{formData.companyName?.toLowerCase().replace(/\s+/g, '-') || "client-slug"}</span>
                     </div>
                     <Button size="sm" variant="outline" className="h-8 border-white/20 hover:bg-white/10">Copy</Button>
                   </div>

                   <div className="flex flex-col sm:flex-row gap-3">
                     <Link to="/client" className="flex-1">
                       <Button className="w-full bg-white text-black rounded-xl font-heading font-bold h-12 hover:bg-white/90">
                         Go to Dashboard
                       </Button>
                     </Link>
                     <Button variant="outline" className="flex-1 rounded-xl h-12 border-white/20 gap-2 hover:bg-white/5">
                       Open System <ExternalLink className="w-4 h-4" />
                     </Button>
                   </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 48, scale: 0.97 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -48, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
          >
            <div className="bg-card border-2 border-border rounded-[2rem] p-6 sm:p-10 shadow-xl">
              {step === 1 && (
                <StepContent title="System Blueprint & Data" subtitle="Provide the essential blueprints and documents so we can structure your enterprise AI precisely to your operations.">
                  
                  {/* Enterprise Company Details */}
                  <div className="mb-8">
                    <h3 className="text-lg font-bold text-white mb-2">Company Core Details</h3>
                    <p className="text-xs text-white/40 mb-4">Establishing your business identity for the system.</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <UploadItem 
                        title="Company Name" 
                        description="Official registered business name"
                        icon={Building2}
                        isInput={true}
                        value={formData.companyName}
                        onChange={(val) => setFormData(p => ({ ...p, companyName: val }))}
                        uploaded={formData.companyName.trim().length > 0}
                        placeholder="e.g. Acme Corporation"
                      />
                      <UploadItem 
                        title="Industry / Sector" 
                        description="Primary field of operation"
                        icon={Briefcase}
                        isInput={true}
                        value={formData.industry}
                        onChange={(val) => setFormData(p => ({ ...p, industry: val }))}
                        uploaded={formData.industry.trim().length > 0}
                        placeholder="e.g. E-commerce, Real Estate"
                      />
                      <UploadItem 
                        title="Headquarters / Location" 
                        description="Primary physical or operating region"
                        icon={MapPin}
                        isInput={true}
                        value={formData.location}
                        onChange={(val) => setFormData(p => ({ ...p, location: val }))}
                        uploaded={formData.location.trim().length > 0}
                        placeholder="City, State, Country"
                      />
                      <UploadItem 
                        title="Corporate Website" 
                        description="Main domain URL"
                        icon={Globe}
                        isInput={true}
                        value={formData.website}
                        onChange={(val) => setFormData(p => ({ ...p, website: val }))}
                        uploaded={formData.website.trim().length > 0}
                        placeholder="https://acmecorp.com"
                      />
                      <UploadItem 
                        title="Official Email" 
                        description="Primary contact email"
                        icon={Mail}
                        isInput={true}
                        value={formData.email}
                        onChange={(val) => setFormData(p => ({ ...p, email: val }))}
                        uploaded={formData.email.trim().length > 0}
                        placeholder="contact@acmecorp.com"
                      />
                      <UploadItem 
                        title="Contact Phone" 
                        description="Main operating line"
                        icon={Phone}
                        isInput={true}
                        value={formData.phone}
                        onChange={(val) => setFormData(p => ({ ...p, phone: val }))}
                        uploaded={formData.phone.trim().length > 0}
                        placeholder="+1 (555) 000-0000"
                      />
                      <div className="md:col-span-2">
                        <UploadItem 
                          title="Tax ID / Registration (Optional)" 
                          description="For enterprise billing verification"
                          icon={FileText}
                          isInput={true}
                          value={formData.taxId}
                          onChange={(val) => setFormData(p => ({ ...p, taxId: val }))}
                          uploaded={formData.taxId.trim().length > 0}
                          placeholder="VAT / EIN / GSTIN"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Media & Assets Upload */}
                  <div className="pt-6 border-t border-white/10 mb-2">
                    <h3 className="text-lg font-bold text-white mb-2">Media & Knowledge Base</h3>
                    <p className="text-xs text-white/40 mb-4">Upload necessary files and documentation.</p>
                    
                    <div className="space-y-3">
                      <UploadItem 
                        title="Company Logo" 
                        description="Upload a high-res image of your brand logo (PNG/SVG)."
                        icon={FileBadge}
                        uploaded={formData.logoUploaded}
                        onAction={() => simulateUpload('logoUploaded')}
                      />
                      <UploadItem 
                        title="Product Images & Catalog" 
                        description="Provide your product photos, brochures, or data PDFs."
                        icon={ImageIcon}
                        uploaded={formData.imagesUploaded}
                        onAction={() => simulateUpload('imagesUploaded')}
                      />
                      
                      {/* Dynamic Additional Documents */}
                      <div className="pt-4 border-t border-white/5">
                        <h4 className="text-sm font-bold text-white mb-4">Additional Documents</h4>
                        <div className="space-y-4">
                          <AnimatePresence>
                            {formData.extraDocuments.map((doc, idx) => (
                              <motion.div 
                                key={idx}
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="relative"
                              >
                                <UploadItem 
                                  title={doc.name || `Document #${idx + 1}`}
                                  description="Provide a name and upload your custom document."
                                  icon={Upload}
                                  uploaded={doc.uploaded}
                                  onAction={() => simulateExtraUpload(idx)}
                                  isInput={!doc.uploaded}
                                  value={doc.name}
                                  onChange={(val) => {
                                    const newDocs = [...formData.extraDocuments];
                                    newDocs[idx].name = val;
                                    setFormData(p => ({ ...p, extraDocuments: newDocs }));
                                  }}
                                  placeholder="Document Name (e.g. Sales Deck)"
                                  showUploadButtonForInput={true}
                                />
                                {formData.extraDocuments.length > 1 && (
                                  <Button 
                                    variant="ghost" 
                                    onClick={() => removeExtraDoc(idx)} 
                                    className="absolute -top-2 -right-2 w-6 h-6 p-0 rounded-full bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white z-20"
                                  >
                                    <X className="w-3 h-3"/>
                                  </Button>
                                )}
                              </motion.div>
                            ))}
                          </AnimatePresence>
                          <Button 
                            variant="outline" 
                            className="w-full border-dashed border-white/10 text-white/40 hover:text-white hover:border-white/30 h-12 rounded-xl"
                            onClick={addExtraDoc}
                          >
                            <Plus className="w-4 h-4 mr-2" /> Add Another Document
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </StepContent>
              )}

              {step === 2 && (
                <StepContent title="Custom Instructions to the Developer" subtitle="Specify your exact requirements, requested features, or workflow adjustments for the development team.">
                  <div className="bg-nova-blue/10 border border-nova-blue/30 rounded-xl p-5 mb-8 flex gap-3 items-start">
                    <UserRoundSearch className="w-5 h-5 text-nova-blue shrink-0 mt-0.5" />
                    <p className="text-sm text-nova-blue/90 leading-relaxed">
                      Your requests will be sent directly to our development specialists. Use this section to outline any specific UI changes, custom integrations, or logic adjustments you need for your system.
                    </p>
                  </div>
                    
                  <div className="space-y-3">
                    <AnimatePresence>
                      {formData.customInstructions.map((inst, idx) => (
                        <motion.div 
                          key={idx}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="flex gap-2"
                        >
                          <input 
                            value={inst}
                            onChange={(e) => {
                              const newInst = [...formData.customInstructions];
                              newInst[idx] = e.target.value;
                              setFormData(p => ({ ...p, customInstructions: newInst }));
                            }}
                            placeholder={`Instruction #${idx + 1} (e.g. Integrate with our custom CRM endpoint)`}
                            className="flex-1 bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:border-[#4D9FFF] outline-none transition-all"
                          />
                          {formData.customInstructions.length > 1 && (
                            <Button 
                              variant="ghost" 
                              onClick={() => {
                                const newInst = formData.customInstructions.filter((_, i) => i !== idx);
                                setFormData(p => ({ ...p, customInstructions: newInst }));
                              }} 
                              className="px-3 text-white/40 hover:text-red-400 hover:bg-red-400/10 rounded-lg"
                            >
                              <X className="w-4 h-4"/>
                            </Button>
                          )}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    
                    <Button 
                      variant="outline" 
                      className="w-full border-dashed border-white/20 text-white/60 hover:text-white hover:border-white/50 h-12 rounded-xl mt-2"
                      onClick={() => setFormData(p => ({ ...p, customInstructions: [...p.customInstructions, ""] }))}
                    >
                      <Plus className="w-4 h-4 mr-2" /> Add Next Request
                    </Button>
                  </div>
                </StepContent>
              )}
              
              
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 px-2">
              {step > 1 ? (
                <Button variant="ghost" onClick={() => setStep(step - 1)} className="rounded-xl font-heading font-semibold gap-2 hover:bg-white/5 text-white/60 hover:text-white h-12 px-6">
                  <ArrowLeft className="w-4 h-4" /> Back
                </Button>
              ) : <div />}
              {step === 1 ? (
                <Button onClick={() => setStep(2)} className="bg-white text-black rounded-xl font-heading font-bold gap-2 h-12 px-8 hover:bg-white/90 shadow-[0_0_20px_rgba(255,255,255,0.2)] ml-auto">
                  Continue <ArrowRight className="w-4 h-4" />
                </Button>
              ) : step === 2 ? (
                <Button onClick={handleRazorpayCheckout} className="bg-nova-blue text-white rounded-xl font-heading font-bold gap-2 h-12 px-8 hover:bg-nova-blue/90 shadow-[0_0_20px_rgba(77,159,255,0.3)] ml-auto">
                  Configure and Pay <ArrowRight className="w-4 h-4" />
                </Button>
              ) : null}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StepContent({ title, subtitle, children }) {
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="font-heading text-2xl font-bold text-white mb-2">{title}</h2>
        {subtitle && <p className="text-white/40 text-sm leading-relaxed">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

function UploadItem({ title, description, icon: Icon, uploaded, onAction, isInput, value, onChange, placeholder, showUploadButtonForInput }) {
  return (
    <div className={`border rounded-2xl p-4 sm:p-5 transition-all duration-300 ${uploaded ? 'border-[#4D9FFF]/50 bg-[#4D9FFF]/5' : 'border-white/10 bg-black/40 hover:border-white/20'}`}>
       <div className="flex items-start gap-3 sm:gap-4">
         <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 ${uploaded ? 'bg-[#4D9FFF]/20 text-[#4D9FFF]' : 'bg-white/5 text-white/50'}`}>
           <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
         </div>
         <div className="flex-1 pt-0.5 min-w-0">
           <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
             <h4 className="text-sm font-bold text-white flex items-center gap-2 truncate">
               {title} {uploaded && <Check className="w-4 h-4 text-[#4D9FFF] shrink-0" />}
             </h4>
             {(!isInput || uploaded) && (
               <Button 
                 variant={uploaded ? "outline" : "default"}
                 onClick={onAction}
                 size="sm"
                 className={`h-8 text-xs rounded-lg shrink-0 w-fit ${uploaded ? 'border-[#4D9FFF]/50 text-[#4D9FFF] hover:bg-[#4D9FFF]/10' : 'bg-white text-black hover:bg-white/90'}`}
               >
                 {uploaded ? "Re-upload" : "Upload File"}
               </Button>
             )}
           </div>
           <p className="text-xs text-white/40 mb-3 truncate sm:whitespace-normal">{description}</p>
           {isInput && !uploaded && (
             <div className="flex gap-2">
               <input 
                 value={value} 
                 onChange={(e) => onChange(e.target.value)}
                 placeholder={placeholder}
                 className="flex-1 bg-black/50 border border-white/10 rounded-xl px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm text-white focus:border-[#4D9FFF] outline-none transition-all"
               />
               {showUploadButtonForInput && (
                 <Button 
                   onClick={onAction}
                   size="sm"
                   className="bg-white text-black hover:bg-white/90 rounded-xl px-4 h-auto text-xs"
                 >
                   Upload
                 </Button>
               )}
             </div>
           )}
         </div>
       </div>
    </div>
  )
}

function StatusItem({ active, label, time, icon: Icon, isLast, loading }) {
  return (
    <div className="flex gap-4">
      <div className="relative flex flex-col items-center">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center z-10 transition-all duration-500 ${active ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.4)]' : 'bg-black border-2 border-white/10 text-white/20'}`}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Icon className="w-4 h-4" />}
        </div>
        {!isLast && (
          <div className={`w-0.5 h-12 transition-all duration-500 ${active ? 'bg-gradient-to-b from-white to-transparent opacity-30' : 'bg-white/10'}`} />
        )}
      </div>
      <div className="pt-2 flex-1">
        <p className={`font-bold transition-all duration-500 ${active ? 'text-white' : 'text-white/30'}`}>{label}</p>
        <p className={`text-xs font-mono mt-1 transition-all duration-500 ${active ? 'text-[#4D9FFF]' : 'text-white/20'}`}>{time}</p>
      </div>
    </div>
  );
}
