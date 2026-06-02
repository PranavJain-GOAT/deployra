import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Zap, Crown, Building2, ArrowRight, ChevronDown } from "lucide-react";

const PLANS = [
  {
    name: "Starter",
    icon: Zap,
    monthly: 29,
    yearly: 19,
    desc: "Perfect for small businesses just getting started with AI.",
    badge: null,
    features: [
      { text: "1 AI system installed", included: true },
      { text: "Basic chatbot template", included: true },
      { text: "500 conversations/mo", included: true },
      { text: "Email support", included: true },
      { text: "Analytics dashboard", included: true },
      { text: "Custom branding", included: false },
      { text: "Priority support", included: false },
      { text: "API access", included: false },
      { text: "White-label option", included: false },
      { text: "Custom integrations", included: false },
    ],
    cta: "Get Started",
  },
  {
    name: "Pro",
    icon: Crown,
    monthly: 79,
    yearly: 59,
    desc: "For growing businesses ready to scale AI across their operations.",
    badge: "Most Popular",
    features: [
      { text: "5 AI systems installed", included: true },
      { text: "All chatbot templates", included: true },
      { text: "10,000 conversations/mo", included: true },
      { text: "Priority email + chat support", included: true },
      { text: "Advanced analytics", included: true },
      { text: "Custom branding", included: true },
      { text: "Priority support", included: true },
      { text: "API access", included: true },
      { text: "White-label option", included: false },
      { text: "Custom integrations", included: false },
    ],
    cta: "Start Pro Trial",
  },
  {
    name: "Enterprise",
    icon: Building2,
    monthly: 199,
    yearly: 149,
    desc: "Full power for enterprises that need custom AI at scale.",
    badge: null,
    features: [
      { text: "Unlimited AI systems", included: true },
      { text: "All templates + custom", included: true },
      { text: "Unlimited conversations", included: true },
      { text: "Dedicated account manager", included: true },
      { text: "Real-time analytics + reports", included: true },
      { text: "Custom branding", included: true },
      { text: "24/7 priority support", included: true },
      { text: "Full API access", included: true },
      { text: "White-label option", included: true },
      { text: "Custom integrations", included: true },
    ],
    cta: "Contact Sales",
  },
];

const FAQ = [
  { q: "Can I switch plans anytime?", a: "Yes, upgrade or downgrade at any time. Changes take effect immediately and billing is prorated." },
  { q: "Is there a free trial?", a: "All plans come with a 14-day free trial. No credit card required to start." },
  { q: "What payment methods do you accept?", a: "We accept all major credit cards, PayPal, and bank transfers for Enterprise plans." },
  { q: "Can I cancel anytime?", a: "Yes, cancel anytime with no penalties. Your access continues until the end of your billing period." },
];

export default function Pricing() {
  const [yearly, setYearly] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="pt-20 pb-32 relative overflow-hidden border-b border-white/6">
        <div className="absolute inset-0 dark-grid opacity-40" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[250px] rounded-full blur-[120px]"
          style={{ background: 'rgba(77,159,255,0.05)' }} />
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <p className="tech-label text-white/25 tracking-[0.25em] mb-4 uppercase">PRICING</p>
            <h1 className="text-white font-bold mb-5 leading-tight" style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(2.8rem,6vw,4.5rem)', letterSpacing: '-0.04em' }}>
              Simple, transparent<br />pricing.
            </h1>
            <p className="text-white/35 text-base max-w-lg mx-auto mb-10" style={{ letterSpacing: '-0.01em' }}>
              No hidden fees. No surprises. Start free, scale as you grow.
            </p>
            {/* Toggle */}
            <div className="inline-flex items-center gap-1 glass rounded-full p-1">
              {[{ label: "Monthly", val: false }, { label: "Yearly", val: true }].map(({ label, val }) => (
                <motion.button
                  key={label}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setYearly(val)}
                  className={`relative px-5 py-2 rounded-full text-sm font-semibold transition-all ${yearly === val ? "text-black" : "text-white/40 hover:text-white"}`}
                >
                  {yearly === val && (
                    <motion.div layoutId="tab-bg" className="absolute inset-0 bg-white rounded-full" transition={{ type: "spring", stiffness: 400, damping: 25, bounce: 0.5 }} />
                  )}
                  <span className="relative flex items-center gap-2">
                    {label}
                    {val && (
                      <motion.span 
                        initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.6 }}
                        className="bg-[#4D9FFF]/20 text-[#4D9FFF] border border-[#4D9FFF]/30 text-[10px] font-bold px-2 py-0.5 rounded-full tech-label flex items-center gap-1"
                      >
                         <Zap className="w-2.5 h-2.5" /> YOU SAVE 25%
                      </motion.span>
                    )}
                  </span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Cards */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 -mt-14 mb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`radial-card rounded-3xl overflow-hidden relative flex flex-col ${plan.badge ? "popular-shimmer" : ""}`}
              style={{
                border: plan.badge ? '0.5px solid rgba(77,159,255,0.35)' : '0.5px solid rgba(255,255,255,0.08)',
                boxShadow: plan.badge ? '0 0 40px rgba(77,159,255,0.12), 0 24px 60px rgba(0,0,0,0.7)' : '0 8px 32px rgba(0,0,0,0.5)',
              }}
            >
              {plan.badge && (
                <div className="relative z-10 text-center py-2 border-b border-white/8"
                  style={{ background: 'rgba(77,159,255,0.08)' }}>
                  <span className="tech-label text-nova-blue tracking-[0.2em]">{plan.badge.toUpperCase()}</span>
                </div>
              )}
              <div className={`p-6 flex-1 ${plan.badge ? "" : ""}`}>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 rounded-xl glass flex items-center justify-center">
                    <plan.icon className="w-4 h-4 text-white/60" />
                  </div>
                  <h3 className="text-white font-bold text-lg" style={{ fontFamily: 'Georgia, serif', letterSpacing: '-0.03em' }}>{plan.name}</h3>
                </div>
                <AnimatePresence mode="wait">
                  <motion.div key={yearly ? "y" : "m"} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.2 }}>
                    <div className="flex items-end gap-1 mb-1">
                      <span className="text-white font-bold" style={{ fontFamily: 'Georgia, serif', fontSize: '3.2rem', letterSpacing: '-0.04em', lineHeight: 1 }}>
                        ${yearly ? plan.yearly : plan.monthly}
                      </span>
                      <span className="text-white/25 text-sm mb-1.5 font-mono">/mo</span>
                    </div>
                  </motion.div>
                </AnimatePresence>
                {yearly ? (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="tech-label mb-2 flex flex-col h-10 justify-end">
                    <span style={{ color: '#4D9FFF' }}>BILLED ${plan.yearly * 12}/YR</span>
                    <span className="text-white/40 text-[10px] uppercase mt-1">Saves ${(plan.monthly - plan.yearly) * 12} per year</span>
                  </motion.p>
                ) : (
                  <p className="tech-label mb-2 opacity-0 select-none h-10">SPACER</p>
                )}
                <p className="text-white/35 text-sm mb-5 leading-relaxed" style={{ letterSpacing: '-0.01em' }}>{plan.desc}</p>
                <Link to="/">
                  <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    className={`shimmer-btn w-full rounded-xl font-bold text-sm py-3.5 flex items-center justify-center gap-2 transition-all ${plan.badge
                        ? "bg-white text-black hover:shadow-[0_0_30px_rgba(255,255,255,0.15)]"
                        : "glass text-white/70 hover:text-white border border-white/10 hover:border-white/20"
                      }`}
                  >
                    {plan.cta}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </motion.button>
                </Link>
              </div>
              <div className="border-t border-white/6 px-6 py-5 space-y-2.5">
                {plan.features.map((f) => (
                  <div key={f.text} className="flex items-center gap-3">
                    {f.included ? (
                      <Check className="w-3.5 h-3.5 shrink-0" style={{ color: '#4D9FFF' }} />
                    ) : (
                      <X className="w-3.5 h-3.5 shrink-0 text-white/15" />
                    )}
                    <span className={`text-sm ${f.included ? "text-white/60" : "text-white/20"}`} style={{ letterSpacing: '-0.01em' }}>{f.text}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </section>


      {/* FAQ */}
      <section className="max-w-2xl mx-auto px-4 pb-24">
        <div className="text-center mb-10">
          <p className="tech-label text-white/25 tracking-[0.25em] mb-3">FAQ</p>
          <h2 className="text-white font-bold text-3xl" style={{ fontFamily: 'Georgia, serif', letterSpacing: '-0.04em' }}>Common questions</h2>
        </div>
        <div className="space-y-2">
          {FAQ.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
              className="glass rounded-2xl overflow-hidden"
            >
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-white/3 transition-colors"
              >
                <span className="text-white/70 text-sm font-medium" style={{ letterSpacing: '-0.01em' }}>{faq.q}</span>
                <ChevronDown className={`w-4 h-4 text-white/25 transition-transform shrink-0 ml-4 ${openFaq === i ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence>
                {openFaq === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <p className="px-5 pb-4 text-sm text-white/35 leading-relaxed" style={{ letterSpacing: '-0.01em' }}>{faq.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}