import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check } from "lucide-react";
import { useEffect, useState } from "react";
import confetti from "canvas-confetti";

function LiveTerminalPreview() {
  const [lines, setLines] = useState([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const sequence = [
      "Initializing environment...",
      "Resolving smart agent dependencies...",
      "Configuring neural vectors...",
      "Testing endpoints...",
      "Success: AI is live at edge."
    ];
    let i = 0;
    const interval = setInterval(() => {
      if (i < sequence.length) {
        setLines(prev => [...prev, sequence[i]]);
        i++;
      } else {
        clearInterval(interval);
      }
    }, 700);
    return () => clearInterval(interval);
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText("npx @deployra/cli deploy --auto");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfetti = (e) => {
    const rect = e.target.getBoundingClientRect();
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { x: (rect.left + rect.width / 2) / window.innerWidth, y: (rect.top + rect.height / 2) / window.innerHeight },
      colors: ['#00FF41', '#ffffff', '#4D9FFF']
    });
  };

  return (
    <div className="w-full h-full glass-dark rounded-3xl p-6 font-mono text-[13px] sm:text-sm shadow-2xl flex flex-col relative overflow-hidden group">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-nova-blue via-cyber-green to-nova-blue opacity-50" />
      <div className="flex gap-2 mb-6 border-b border-white/5 pb-4">
        <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
        <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
        <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
        <div className="ml-auto text-white/30 text-xs">sh - deployment</div>
      </div>
      <div className="flex-1 overflow-y-auto space-y-3 relative">
        <button onClick={handleCopy} className="absolute right-0 top-0 p-1.5 glass rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/10 z-10 border border-white/10">
          {copied ? <Check className="w-3.5 h-3.5 text-[#00FF41]" /> : <Copy className="w-3.5 h-3.5 text-white/50 hover:text-white" />}
        </button>
        <div 
           className="text-cyber-green/90 font-medium cursor-pointer hover:text-cyber-green transition-colors inline-block" 
           onClick={handleConfetti}
           title="Click to execute"
        >
           $ npx @deployra/cli deploy --auto
        </div>
        <AnimatePresence>
          {lines.map((ln, idx) => (
            <motion.div key={idx} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-white/70">
              <span className="text-white/20 mr-3">{'>'}</span> {ln}
            </motion.div>
          ))}
        </AnimatePresence>
        <motion.div animate={{ opacity: [1, 0, 1] }} transition={{ repeat: Infinity, duration: 0.9 }} className="inline-block w-2 h-[1.1rem] bg-white/50 align-sub mt-2" />
      </div>
    </div>
  );
}

function RotatingPersona() {
  const personas = ["Agencies.", "Startups.", "Enterprise.", "Developers."];
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setIndex(i => (i + 1) % personas.length), 2500);
    return () => clearInterval(id);
  }, []);
  return (
    <span className="inline-block min-w-[200px] overflow-hidden align-bottom">
      <AnimatePresence mode="wait">
        <motion.span
          key={index}
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -30, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="text-cyber-green inline-block"
        >
          {personas[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}




export default function HeroSection() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    setMousePosition({
      x: (clientX / window.innerWidth) - 0.5,
      y: (clientY / window.innerHeight) - 0.5
    });
  };

  return (
    <section onMouseMove={handleMouseMove} className="relative min-h-[90vh] flex items-center overflow-hidden bg-background">
      {/* Dark grid bg */}
      <div className="absolute inset-0 dark-grid opacity-60" />
      {/* Radial vignette */}
      <div className="absolute inset-0 bg-radial-gradient" style={{
        background: 'radial-gradient(ellipse 80% 70% at 50% 0%, rgba(255,255,255,0.03) 0%, transparent 70%)'
      }} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center" style={{ perspective: '1000px' }}>
          {/* Left: Typography */}
          <motion.div
             animate={{ x: mousePosition.x * 25, y: mousePosition.y * 25 }}
             transition={{ type: "spring", stiffness: 70, damping: 30 }}
             className="relative z-10"
          >


            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="font-heading leading-[1.1] mb-6 block"
              style={{ fontSize: 'clamp(2.5rem, 6vw, 4.8rem)', letterSpacing: '-0.04em' }}
            >
              <span className="text-white mr-3">Configure. Deploy. Scale for</span>
              <RotatingPersona />
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="text-white/50 text-lg leading-relaxed mb-10 max-w-lg"
              style={{ letterSpacing: '-0.02em' }}
            >
              Enterprise-ready agents installed directly into your workflow. Skip the 6-month build cycle and deploy instantly.
            </motion.p>


          </motion.div>

          {/* Right: Live Terminal */}
          <motion.div
             initial={{ opacity: 0, scale: 0.95 }}
             animate={{ 
                opacity: 1, 
                scale: 1,
                x: mousePosition.x * -40,
                y: mousePosition.y * -40,
                rotateY: mousePosition.x * 10,
               rotateX: mousePosition.y * -10,
             }}
             transition={{ type: "spring", stiffness: 50, damping: 20 }}
            className="relative h-72 lg:h-[450px] w-full flex items-center justify-center lg:ml-10"
            style={{ transformStyle: 'preserve-3d' }}
          >
             <LiveTerminalPreview />
          </motion.div>
        </div>
      </div>
    </section>
  );
}