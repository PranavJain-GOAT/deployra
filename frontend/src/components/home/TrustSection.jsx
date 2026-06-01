import { motion, AnimatePresence } from "framer-motion";
import WordReveal from "./WordReveal";
import ScrollRevealSection from "../ScrollRevealSection";
import { Play, X } from "lucide-react";
import { useState } from "react";

const TESTIMONIALS = [
  {
    name: "Sarah K.", role: "Restaurant Owner",
    text: "Installed the WhatsApp ordering system in 3 minutes. My orders doubled in the first week.",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=80&q=80"
  },
  {
    name: "Michael R.", role: "E-commerce Manager",
    text: "The AI chatbot handles 80% of customer queries now. Best investment we've made this year.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&q=80"
  },
  {
    name: "Priya D.", role: "Salon Owner",
    text: "No more missed appointments. The automated booking system is a genuine game-changer.",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&q=80"
  },
];

export default function TrustSection() {
  const [activeVideo, setActiveVideo] = useState(null);

  return (
    <section className="py-20 border-t border-white/6 relative overflow-hidden">
      <div className="absolute inset-0 dark-grid opacity-20" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <p className="text-[11px] font-mono tracking-[0.25em] text-white/25 mb-3">TRUSTED BY</p>
          <WordReveal text="Industry leaders across sectors" tag="h2" className="text-white font-bold" style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(2rem, 4vw, 3rem)', letterSpacing: '-0.04em' }} />
        </motion.div>

        {/* Marquee */}
        <div className="relative w-full max-w-5xl mx-auto mb-24 overflow-hidden py-4" style={{ maskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)', WebkitMaskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)' }}>
          <style>{`
            @keyframes marqueeScroll {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
          `}</style>
          <div className="flex gap-20 whitespace-nowrap" style={{ animation: 'marqueeScroll 35s linear infinite', width: 'max-content' }}>
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex gap-20 items-center px-10">
                {['STRIPE', 'SHOPIFY', 'META', 'LINEAR', 'NOTION', 'VERCEL', 'SUPABASE', 'AIRBNB'].map(logo => (
                  <span key={logo} className="text-white/20 font-bold text-3xl tracking-widest inline-flex items-center gap-2 grayscale hover:grayscale-0 hover:text-white transition-all duration-500" style={{ fontFamily: 'Georgia, serif' }}>
                     {logo === 'META' && "∞ "}
                     {logo}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-14">
          {TESTIMONIALS.map((t) => (
            <ScrollRevealSection key={t.name}>
              <motion.div
                className="border-beam-card radial-card rounded-2xl p-6 h-full"
              >
                <div className="flex gap-0.5 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <span key={j} className="text-xs" style={{ color: '#00FF41' }}>★</span>
                  ))}
                </div>
                <p className="text-white/50 text-sm leading-relaxed mb-6" style={{ letterSpacing: '-0.01em' }}>"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden border border-white/15 shrink-0 cursor-pointer group shadow-lg" onClick={() => setActiveVideo(t)}>
                    <img src={t.avatar} alt={t.name} className="w-full h-full object-cover transition-transform group-hover:scale-110" onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerHTML = `<span class="text-white/60 text-xs font-mono font-bold flex items-center justify-center w-full h-full">${t.name.split(' ').map(n => n[0]).join('')}</span>`; }} />
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play className="w-4 h-4 text-white ml-0.5" />
                    </div>
                  </div>
                  <div>
                    <div className="text-white font-semibold text-sm hover:text-[#00FF41] cursor-pointer transition-colors" onClick={() => setActiveVideo(t)}>{t.name} <Play className="w-3 h-3 inline-block ml-1 opacity-50" /></div>
                    <div className="text-white/25 text-[11px] font-mono mt-0.5">{t.role.toUpperCase()}</div>
                  </div>
                </div>
              </motion.div>
            </ScrollRevealSection>
          ))}
        </div>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-wrap items-center justify-center gap-10 text-center border-t border-white/6 pt-12"
        >
          {[
            { value: "500+", label: "BUSINESSES" },
            { value: "4.9", label: "AVG RATING" },
            { value: "2 min", label: "AVG SETUP" },
            { value: "98%", label: "SATISFACTION" },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-white font-bold text-3xl" style={{ fontFamily: 'Georgia, serif', letterSpacing: '-0.04em' }}>{s.value}</div>
              <div className="text-white/25 text-[11px] mt-1 font-mono tracking-widest">{s.label}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Video Modal PiP */}
      <AnimatePresence>
        {activeVideo && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" 
            onClick={() => setActiveVideo(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} 
              animate={{ scale: 1, y: 0 }} 
              exit={{ scale: 0.9, y: 20 }} 
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="relative bg-[#0a0a0a] rounded-3xl overflow-hidden w-full max-w-2xl border border-white/10 shadow-2xl glass-dark aspect-video" 
              onClick={e => e.stopPropagation()}
            >
              <button 
                 onClick={() => setActiveVideo(null)} 
                 className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center glass rounded-full hover:bg-white/20 text-white transition-colors"
              >
                 <X className="w-5 h-5" />
              </button>
              
              {/* Fake Video Player content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#0a0a0a] to-[#111]">
                 <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }} transition={{ repeat: Infinity, duration: 2 }}>
                    <Play className="w-16 h-16 text-[#00FF41]/40 mb-6" />
                 </motion.div>
                 <div className="text-white font-bold text-2xl font-serif mb-2">{activeVideo.name}</div>
                 <p className="font-mono text-white/30 text-sm tracking-widest uppercase">{activeVideo.role}</p>
                 <p className="absolute bottom-6 left-6 text-white/20 font-mono text-xs">Simulated video element</p>
                 
                 {/* Fake Progress Bar */}
                 <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
                    <motion.div initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: 15, ease: "linear" }} className="h-full bg-[#00FF41]" />
                 </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}