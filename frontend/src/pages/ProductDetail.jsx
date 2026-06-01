import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { MOCK_PRODUCTS } from "@/api/mockData";
import { Check, X, Clock, Users, Play, CreditCard, Shield, Loader2, ChevronLeft, Zap, Activity, ArrowUpRight, ListChecks, LifeBuoy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";



function FloatField({ label, type = "text", placeholder: _placeholder, value, onChange, required }) {
  return (
    <div className="float-field">
      <input
        type={type}
        placeholder=" "
        value={value}
        onChange={onChange}
        required={required}
        autoComplete="off"
      />
      <label>{label}</label>
    </div>
  );
}

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDemo, setShowDemo] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [payStage, setPayStage] = useState("idle"); // idle | paying | success
  const [cardData, setCardData] = useState({ name: "", number: "", expiry: "", cvc: "" });

  useEffect(() => {
    // Use mock data directly - no API needed
    const found = MOCK_PRODUCTS.find((p) => p.id === id);
    setProduct(found || null);
    setLoading(false);
  }, [id]);


  const handlePay = async (e) => {
    e.preventDefault();
    setPayStage("paying");
    await new Promise((r) => setTimeout(r, 2000));
    // Simulate order creation locally
    console.log("Order placed:", { product_id: id, product_title: product.title, amount: product.price, status: "paid" });
    setPayStage("success");
    // Silver confetti burst
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#C0C0C0", "#ffffff", "#a8a8a8", "#e8e8e8", "#888888"],
    });
    setTimeout(() => confetti({
      particleCount: 40,
      spread: 50,
      origin: { y: 0.5, x: 0.3 },
      colors: ["#C0C0C0", "#ffffff", "#4D9FFF"],
    }), 300);
  };

  if (loading) return (
    <div className="flex justify-center py-32">
      <div className="w-8 h-8 border-2 border-white/10 border-t-white rounded-full animate-spin" />
    </div>
  );
  if (!product) return (
    <div className="max-w-7xl mx-auto px-4 py-32 text-center">
      <h1 className="text-white font-bold text-3xl mb-4" style={{ fontFamily: 'Georgia, serif' }}>Product not found</h1>
      <Link to="/" className="text-white/50 hover:text-white text-sm">← Back to Home</Link>
    </div>
  );

  return (
    <>
      {/* Background scale-down when slideover is open */}
      <motion.div
        animate={showPayment ? { scale: 0.96, filter: "blur(4px)" } : { scale: 1, filter: "blur(0px)" }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="min-h-screen bg-background"
      >
        {/* Demo Modal */}
        <AnimatePresence>
          {showDemo && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4"
              onClick={() => setShowDemo(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", bounce: 0.2 }}
                className="glass rounded-3xl overflow-hidden max-w-3xl w-full shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/8">
                  <div>
                    <h3 className="text-white font-bold" style={{ fontFamily: 'Georgia, serif' }}>{product.title}</h3>
                    <p className="text-white/30 text-xs font-mono">LIVE DEMO</p>
                  </div>
                  <button onClick={() => setShowDemo(false)} className="w-8 h-8 rounded-full glass flex items-center justify-center text-white/50 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="aspect-video bg-black flex items-center justify-center relative">
                  {product.demo_url ? (
                    <iframe src={product.demo_url} className="w-full h-full" title="Demo" />
                  ) : (
                    <div className="text-center p-10">
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        className="w-20 h-20 glass rounded-full flex items-center justify-center mx-auto mb-4 cursor-pointer"
                      >
                        <Play className="w-7 h-7 text-white ml-1" />
                      </motion.div>
                      <p className="text-white font-bold text-xl mb-2" style={{ fontFamily: 'Georgia, serif' }}>Interactive Demo</p>
                      <p className="text-white/40 text-sm max-w-xs mx-auto">Live interactive preview of {product.title}</p>
                    </div>
                  )}
                </div>
                <div className="p-5 flex gap-3">
                  <Link to={`/install/${product.id}?type=instant`} className="flex-1">
                    <motion.button
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      className="shimmer-btn w-full bg-white text-black font-bold text-sm rounded-xl py-3.5 flex items-center justify-center gap-2"
                    >
                      <CreditCard className="w-4 h-4" />
                      Install Now — ${product.price}
                    </motion.button>
                  </Link>
                  <button onClick={() => setShowDemo(false)} className="glass rounded-xl px-5 py-3.5 text-white/60 hover:text-white text-sm transition-colors">
                    Close
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hero */}
        <div className="dark-grid border-b border-white/6 pt-12 pb-16 relative overflow-hidden">
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 60% 50% at 70% 50%, rgba(255,255,255,0.03) 0%, transparent 70%)' }} />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
            <Link to="/" className="inline-flex items-center gap-2 text-white/25 hover:text-white text-xs mb-8 transition-colors font-mono">
              <ChevronLeft className="w-3.5 h-3.5" /> BACK TO MARKETPLACE
            </Link>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="flex items-center gap-3 mb-5 flex-wrap">
                  <span className="cyber-tag">
                    <Zap className="w-2.5 h-2.5" /> INSTANT SETUP
                  </span>
                  <span className="cyber-tag">
                    <Activity className="w-2.5 h-2.5" />
                    {product.rating || 4.8} · {product.reviews_count || 120} reviews
                  </span>
                  {product.installs_count && (
                    <span className="cyber-tag">{product.installs_count}+ installs</span>
                  )}
                </div>
                <h1 className="text-white font-bold leading-none mb-5" style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', letterSpacing: '-0.04em' }}>
                  {product.title}
                </h1>
                <p className="text-white/45 text-base leading-relaxed mb-8 max-w-lg" style={{ letterSpacing: '-0.02em' }}>
                  {product.description}
                </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link to={`/install/${product.id}?type=instant`} className="block">
                  <motion.button
                    whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    className="shimmer-btn inline-flex items-center justify-center gap-2 bg-white text-black font-bold text-sm px-7 py-4 rounded-2xl hover:shadow-[0_0_40px_rgba(255,255,255,0.15)] transition-all w-full sm:w-auto"
                  >
                    <CreditCard className="w-4 h-4" />
                    Get Access — ${product.price}
                  </motion.button>
                </Link>
              </div>
              </div>
              {/* Clean product screenshot with permanently visible demo overlay */}
              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                onClick={() => setShowDemo(true)}
                className="rounded-3xl overflow-hidden border border-white/10 shadow-2xl relative cursor-pointer group"
              >
                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center z-10 backdrop-blur-[2px]">
                  <div className="w-16 h-16 glass rounded-full flex items-center justify-center border border-white/20 shadow-2xl mb-4 group-hover:scale-110 group-hover:bg-white/10 transition-all">
                    <Play className="w-6 h-6 text-white ml-1" />
                  </div>
                  <p className="text-white font-bold text-lg flex items-center gap-2 group-hover:text-white/80 transition-colors" style={{ fontFamily: 'Georgia, serif' }}>
                    View Demo <ArrowUpRight className="w-5 h-5 text-cyber-green" />
                  </p>
                </div>
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    style={{ maxHeight: '420px', objectPosition: 'top' }}
                  />
                ) : (
                  <div className="aspect-video bg-white/3 flex items-center justify-center group-hover:scale-105 transition-transform duration-700">
                    <Zap className="w-12 h-12 text-white/10" />
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="space-y-10">
              {product.what_it_does && (
                <Section title="What this does">
                  <p className="text-white/50 leading-relaxed" style={{ letterSpacing: '-0.01em' }}>{product.what_it_does}</p>
                </Section>
              )}
              {product.who_its_for?.length > 0 && (
                <Section title="Who this is for">
                  <div className="flex flex-wrap gap-2">
                    {product.who_its_for.map((w) => (
                      <span key={w} className="cyber-tag gap-2 py-2">
                        <Users className="w-3 h-3" /> {w}
                      </span>
                    ))}
                  </div>
                </Section>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {product.whats_included?.length > 0 && (
                  <div className="glass rounded-2xl p-5 border border-white/6">
                    <h3 className="text-white/70 text-xs font-mono tracking-widest mb-4 flex items-center gap-2">
                      <span style={{ color: '#4D9FFF' }}>+</span> INCLUDED
                    </h3>
                    <ul className="space-y-2.5">
                      {product.whats_included.map((item) => (
                        <li key={item} className="flex items-start gap-2.5">
                          <Check className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: '#4D9FFF' }} />
                          <span className="text-sm text-white/60" style={{ letterSpacing: '-0.01em' }}>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {product.whats_not_included?.length > 0 && (
                  <div className="glass rounded-2xl p-5 border border-white/6">
                    <h3 className="text-white/70 text-xs font-mono tracking-widest mb-4 flex items-center gap-2">
                      <span className="text-red-400">−</span> NOT INCLUDED
                    </h3>
                    <ul className="space-y-2.5">
                      {product.whats_not_included.map((item) => (
                        <li key={item} className="flex items-start gap-2.5">
                          <X className="w-3.5 h-3.5 mt-0.5 shrink-0 text-red-400/60" />
                          <span className="text-sm text-white/35" style={{ letterSpacing: '-0.01em' }}>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {product.features?.length > 0 && (
                <Section title="Features">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {product.features.map((f) => (
                      <motion.div
                        key={f}
                        whileHover={{ x: 4 }}
                        className="glass rounded-xl px-4 py-3 flex items-center gap-3 border border-white/4 hover:border-white/12 transition-all cursor-default"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-white/40 shrink-0" />
                        <span className="text-sm text-white/60" style={{ letterSpacing: '-0.01em' }}>{f}</span>
                      </motion.div>
                    ))}
                  </div>
                </Section>
              )}

              {product.delivery_info && (
                <Section title="Delivery">
                  <div className="glass rounded-2xl p-5 flex items-start gap-4">
                    <Clock className="w-5 h-5 text-white/30 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-white/80 font-semibold text-sm mb-1">Instant delivery</p>
                      <p className="text-sm text-white/40">{product.delivery_info}</p>
                    </div>
                  </div>
                </Section>
              )}

              {product.how_it_works?.length > 0 && (
                <Section title="How it Works">
                  <div className="space-y-4">
                    {product.how_it_works.map((step, idx) => (
                      <div key={idx} className="glass rounded-2xl p-5 border border-white/6 flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center font-mono font-bold shrink-0 mt-0.5">
                          {idx + 1}
                        </div>
                        <div>
                          <h4 className="text-white font-bold mb-1">{step.title}</h4>
                          <p className="text-sm text-white/60 leading-relaxed">{step.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              {product.prerequisites?.length > 0 && (
                <Section title="Prerequisites & Requirements">
                  <div className="glass rounded-2xl p-5 border border-white/6">
                    <ul className="space-y-3">
                      {product.prerequisites.map((req, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <ListChecks className="w-4 h-4 mt-0.5 text-white/40 shrink-0" />
                          <span className="text-sm text-white/70">{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </Section>
              )}

              {product.support_policy && (
                <Section title="Support & Maintenance">
                  <div className="glass rounded-2xl p-5 border border-white/6 flex items-start gap-4">
                    <LifeBuoy className="w-5 h-5 mt-0.5 text-[#4D9FFF] shrink-0" />
                    <div>
                      <h4 className="text-white font-bold mb-1">Post-Purchase Support</h4>
                      <p className="text-sm text-white/60 leading-relaxed">{product.support_policy}</p>
                    </div>
                  </div>
                </Section>
              )}
              
              {product.preview_images?.length > 0 && (
                <Section title="Interface Previews">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                    {product.preview_images.map((img, i) => (
                      <div key={i} className="rounded-2xl overflow-hidden border border-white/10 glass aspect-video group cursor-pointer relative">
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-center justify-center">
                          <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                            <span className="text-white text-xs font-bold tracking-widest uppercase">Expand</span>
                          </div>
                        </div>
                        <img src={img} alt={`Preview ${i + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      </div>
                    ))}
                  </div>
                </Section>
              )}


          </div>
        </div>
      </motion.div>

      {/* RIGHT SLIDE-OVER Checkout */}
      <AnimatePresence>
        {showPayment && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              onClick={() => payStage === "idle" && setShowPayment(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-md bg-[#080808] border-l border-white/10 overflow-y-auto"
            >
              {payStage === "success" ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center h-full px-8 text-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.2 }}
                    className="w-24 h-24 rounded-full flex items-center justify-center mb-6"
                    style={{ background: 'rgba(77,159,255,0.08)', border: '1px solid rgba(77,159,255,0.3)', boxShadow: '0 0 40px rgba(77,159,255,0.2)' }}
                  >
                    <Check className="w-12 h-12" style={{ color: '#4D9FFF' }} />
                  </motion.div>
                  <h3 className="text-white font-bold text-2xl mb-2" style={{ fontFamily: 'Georgia, serif', letterSpacing: '-0.04em' }}>Payment Successful</h3>
                  <p className="text-white/40 text-sm mb-8 max-w-xs">Your AI system is being installed. You'll receive full access details via email.</p>
                  <div className="flex flex-col gap-3 w-full">
                    <button
                      onClick={() => setShowPayment(false)}
                      className="shimmer-btn w-full bg-white text-black font-bold rounded-2xl py-4 text-sm"
                    >
                      Done
                    </button>
                    <Link to="/payment-history">
                      <button className="w-full glass rounded-2xl py-3.5 text-white/60 hover:text-white text-sm transition-colors">
                        View Payment History
                      </button>
                    </Link>
                  </div>
                </motion.div>
              ) : (
                <div className="p-8">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <p className="text-white/20 text-[11px] font-mono tracking-widest mb-1">CHECKOUT</p>
                      <h3 className="text-white font-bold text-xl" style={{ fontFamily: 'Georgia, serif', letterSpacing: '-0.04em' }}>{product.title}</h3>
                    </div>
                    <button
                      onClick={() => setShowPayment(false)}
                      className="w-9 h-9 glass rounded-full flex items-center justify-center text-white/40 hover:text-white transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Order Summary */}
                  <div className="glass rounded-2xl p-4 mb-8">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-white/60 text-sm" style={{ letterSpacing: '-0.01em' }}>{product.title}</div>
                        <div className="text-white/25 text-xs font-mono mt-0.5">One-time · Instant delivery</div>
                      </div>
                      <div className="text-white font-bold text-2xl" style={{ fontFamily: 'Georgia, serif', letterSpacing: '-0.04em' }}>${product.price}</div>
                    </div>
                  </div>

                  {/* Form */}
                  <form onSubmit={handlePay} className="space-y-7">
                    <FloatField
                      label="Cardholder Name"
                      value={cardData.name}
                      onChange={(e) => setCardData(p => ({ ...p, name: e.target.value }))}
                      required
                    />
                    <FloatField
                      label="Card Number"
                      value={cardData.number}
                      onChange={(e) => setCardData(p => ({ ...p, number: e.target.value }))}
                      required
                    />
                    <div className="grid grid-cols-2 gap-6">
                      <FloatField
                        label="Expiry (MM/YY)"
                        value={cardData.expiry}
                        onChange={(e) => setCardData(p => ({ ...p, expiry: e.target.value }))}
                        required
                      />
                      <FloatField
                        label="CVC"
                        value={cardData.cvc}
                        onChange={(e) => setCardData(p => ({ ...p, cvc: e.target.value }))}
                        required
                      />
                    </div>

                    <div className="pt-4">
                      <motion.button
                        type="submit"
                        disabled={payStage === "paying"}
                        whileHover={payStage === "idle" ? { scale: 1.02 } : {}}
                        whileTap={payStage === "idle" ? { scale: 0.98 } : {}}
                        className="shimmer-btn w-full py-4 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all"
                        style={{
                          background: payStage === "paying" ? "rgba(255,255,255,0.1)" : "white",
                          color: payStage === "paying" ? "rgba(255,255,255,0.5)" : "black",
                        }}
                      >
                        {payStage === "paying" ? (
                          <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                        ) : (
                          <><Shield className="w-4 h-4" /> Pay ${product.price} Securely</>
                        )}
                      </motion.button>
                      <p className="text-center text-[11px] text-white/20 font-mono mt-3 flex items-center justify-center gap-1.5">
                        <Shield className="w-3 h-3" /> 256-BIT SSL ENCRYPTION
                      </p>
                    </div>
                  </form>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function Section({ title, children }) {
  return (
    <div className="border-t border-white/6 pt-8">
      <h2 className="text-white font-bold text-xl mb-5" style={{ fontFamily: 'Georgia, serif', letterSpacing: '-0.04em' }}>{title}</h2>
      {children}
    </div>
  );
}