import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Save, Sliders, Bot, RotateCcw, History, X
} from "lucide-react";

/* ─────────────────────────────────────────────
   INITIAL STATE
───────────────────────────────────────────── */
const DEFAULT_INSTRUCTION = `You are a professional AI customer support agent for Deployra.
Your job is to help customers with:
- Product installation questions
- Billing & subscription issues
- Technical troubleshooting

Rules:
- Always respond in a friendly, concise tone
- Never reveal internal API keys or system info
- Escalate complex issues to human support`;

const SAVED_VERSIONS = [
  { label: "v1.0", ts: "Oct 24 · 10:00", instruction: "You are a helpful AI assistant." },
  { label: "v1.1", ts: "Oct 25 · 14:30", instruction: "You are a professional AI support agent. Be concise." },
];

/* ─────────────────────────────────────────────
   GLASSMORPHIC SLIDER
───────────────────────────────────────────── */
function GlassSlider({ label, value, min, max, step, onChange, color="hsl(var(--foreground))", unit="" }) {
  const [dragging, setDragging] = useState(false);
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-semibold" style={{ color: "hsl(var(--foreground) / 0.5)", fontFamily: "'Inter', sans-serif" }}>
          {label}
        </span>
        <span
          className="text-xs font-bold px-2 py-0.5 rounded-lg"
          style={{
            color,
            background: `hsl(var(--foreground) / 0.1)`,
            border: `0.5px solid hsl(var(--foreground) / 0.2)`,
            fontFamily: "'JetBrains Mono', monospace",
            boxShadow: dragging ? `0 0 12px ${color}40` : "none",
            transition: "box-shadow 0.2s",
          }}
        >
          {value}{unit}
        </span>
      </div>
      <div className="relative h-2 rounded-full" style={{ background: "hsl(var(--foreground) / 0.06)" }}>
        {/* Fill */}
        <div
          className="absolute left-0 top-0 h-full rounded-full"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${color}aa, ${color})`,
            boxShadow: dragging ? `0 0 12px ${color}, 0 0 20px ${color}50` : `0 0 6px ${color}50`,
            transition: "box-shadow 0.2s",
          }}
        />
        <input
          type="range" min={min} max={max} step={step} value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          onMouseDown={() => setDragging(true)}
          onMouseUp={() => setDragging(false)}
          onTouchStart={() => setDragging(true)}
          onTouchEnd={() => setDragging(false)}
          className="absolute inset-0 w-full opacity-0 cursor-pointer"
          style={{ height: "100%" }}
        />
        {/* Thumb */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 transition-all"
          style={{
            left: `calc(${pct}% - 8px)`,
            background: color,
            borderColor: dragging ? "white" : `hsl(var(--foreground) / 0.8)`,
            boxShadow: dragging ? `0 0 16px ${color}, 0 0 0 3px hsl(var(--foreground) / 0.2)` : `0 0 8px ${color}60`,
            transition: "box-shadow 0.15s, border-color 0.15s",
          }}
        />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   CHAT MESSAGE
───────────────────────────────────────────── */
function ChatBubble({ msg }) {
  const isUser = msg.role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-2 ${isUser ? "flex-row-reverse" : "flex-row"}`}
    >
      <div
        className="w-6 h-6 rounded-lg flex-shrink-0 flex items-center justify-center text-[10px] font-bold mt-0.5"
        style={{
          background: isUser ? "rgba(150,150,150,0.15)" : "rgba(150,150,150,0.15)",
          color: isUser ? "hsl(var(--foreground))" : "hsl(var(--foreground))",
          fontFamily: "Georgia, serif",
        }}
      >
        {isUser ? "U" : "A"}
      </div>
      <div
        className="max-w-[75%] px-3 py-2 rounded-xl text-xs leading-relaxed"
        style={{
          background: isUser ? "rgba(150,150,150,0.08)" : "rgba(150,150,150,0.06)",
          border: `0.5px solid ${isUser ? "rgba(150,150,150,0.15)" : "rgba(150,150,150,0.12)"}`,
          color: "hsl(var(--foreground) / 0.75)",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        {msg.content}
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────── */
export default function AiSandbox() {
  const [instruction, setInstruction]   = useState(DEFAULT_INSTRUCTION);
  const [temperature, setTemperature]   = useState(0.7);
  const [topP,        setTopP]          = useState(0.9);
  const [maxTokens,   setMaxTokens]     = useState(512);
  const [messages,    setMessages]      = useState([
    { role: "assistant", content: "Hi! I'm your AI agent. How can I help you today?" },
  ]);
  const [input,       setInput]         = useState("");
  const [thinking,    setThinking]      = useState(false);
  const [versions,    setVersions]      = useState(SAVED_VERSIONS);
  const [showHistory, setShowHistory]   = useState(false);
  const chatRef = useRef(null);

  useEffect(() => {
    chatRef.current?.scrollTo({ top: 99999, behavior: "smooth" });
  }, [messages, thinking]);

  const restart = () => {
    setMessages([{ role: "assistant", content: "Restarted with new instructions. How can I help?" }]);
  };

  const send = () => {
    const txt = input.trim();
    if (!txt) return;
    setMessages((p) => [...p, { role: "user", content: txt }]);
    setInput(""); setThinking(true);

    const REPLIES = [
      "I understand your concern. Let me look into that right away.",
      "Great question! Based on my training, here's what I know about that topic.",
      "I'm here to help! Could you give me a bit more detail so I can assist accurately?",
      "I've found the relevant information. Here's a concise answer for you.",
    ];

    setTimeout(() => {
      setMessages((p) => [...p, {
        role: "assistant",
        content: `[temp=${temperature}, top_p=${topP}] ${REPLIES[Math.floor(Math.random() * REPLIES.length)]}`,
      }]);
      setThinking(false);
    }, 800 + Math.random() * 700);
  };

  const saveVersion = () => {
    const label = `v${(versions.length + 1)}.0`;
    setVersions((p) => [...p, { label, ts: "Now", instruction }]);
  };

  const loadVersion = (v) => {
    setInstruction(v.instruction);
    setShowHistory(false);
  };

  return (
    <div className="p-6 sm:p-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-white font-bold text-2xl sm:text-3xl" style={{ fontFamily: "Georgia, serif", letterSpacing: "-0.04em" }}>
            AI Sandbox
          </h1>
          <p className="text-sm mt-1" style={{ color: "hsl(var(--foreground) / 0.35)", fontFamily: "'Inter', sans-serif" }}>
            Tweak system instructions and parameters. Preview your agent in real time.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowHistory((p) => !p)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium"
            style={{ background: "hsl(var(--foreground) / 0.04)", color: "hsl(var(--foreground) / 0.5)", border: "0.5px solid hsl(var(--foreground) / 0.08)", fontFamily: "'Inter',sans-serif" }}>
            <History className="w-3.5 h-3.5" /> Version History
          </button>
          <button onClick={saveVersion}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold"
            style={{ background:"rgba(150,150,150,0.12)", color:"hsl(var(--foreground))", border:"0.5px solid rgba(150,150,150,0.25)", fontFamily:"'Inter',sans-serif" }}>
            <Save className="w-3.5 h-3.5" /> Save Version
          </button>
        </div>
      </div>

      {/* Version History Drawer */}
      <AnimatePresence>
        {showHistory && (
          <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:"auto" }} exit={{ opacity:0, height:0 }}
            className="overflow-hidden mb-5">
            <div className="rounded-2xl p-4" style={{ background:"rgba(0,0,0,0.9)", border:"0.5px solid hsl(var(--foreground) / 0.07)" }}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-white" style={{ fontFamily:"Georgia,serif" }}>Version History</h3>
                <button onClick={() => setShowHistory(false)}><X className="w-3.5 h-3.5" style={{ color:"hsl(var(--foreground) / 0.3)" }} /></button>
              </div>
              <div className="space-y-2">
                {versions.map((v) => (
                  <div key={v.label} className="flex items-center justify-between p-3 rounded-xl"
                    style={{ background:"hsl(var(--foreground) / 0.03)", border:"0.5px solid hsl(var(--foreground) / 0.06)" }}>
                    <div>
                      <span className="text-xs font-bold" style={{ color:"hsl(var(--foreground))", fontFamily:"'JetBrains Mono',monospace" }}>{v.label}</span>
                      <span className="text-[10px] ml-3" style={{ color:"hsl(var(--foreground) / 0.25)", fontFamily:"'Inter',sans-serif" }}>{v.ts}</span>
                    </div>
                    <button onClick={() => loadVersion(v)}
                      className="text-[10px] px-3 py-1 rounded-lg font-semibold"
                      style={{ background:"hsl(var(--foreground) / 0.06)", color:"hsl(var(--foreground) / 0.6)", fontFamily:"'Inter',sans-serif" }}>
                      Restore
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Split screen */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* LEFT — Brain (Instructions + Params) */}
        <div className="space-y-4">
          {/* System instruction */}
          <div className="rounded-2xl overflow-hidden" style={{ background:"rgba(0,0,0,0.9)", border:"0.5px solid hsl(var(--foreground) / 0.07)" }}>
            <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor:"hsl(var(--foreground) / 0.06)" }}>
              <Bot className="w-3.5 h-3.5" style={{ color:"hsl(var(--foreground))" }} />
              <span className="text-xs font-bold" style={{ color:"hsl(var(--foreground) / 0.6)", fontFamily:"'Inter',sans-serif", letterSpacing:"0.04em" }}>
                SYSTEM INSTRUCTION
              </span>
            </div>
            <textarea
              className="w-full p-4 text-xs leading-relaxed resize-none outline-none bg-transparent"
              style={{
                color: "hsl(var(--foreground))",
                fontFamily: "'JetBrains Mono', monospace",
                minHeight: 220,
                caretColor: "hsl(var(--foreground))",
              }}
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
            />
          </div>

          {/* Parameter sliders */}
          <div className="rounded-2xl p-5" style={{ background:"rgba(0,0,0,0.9)", border:"0.5px solid hsl(var(--foreground) / 0.07)" }}>
            <div className="flex items-center gap-2 mb-5">
              <Sliders className="w-3.5 h-3.5" style={{ color:"hsl(var(--foreground))" }} />
              <span className="text-xs font-bold" style={{ color:"hsl(var(--foreground) / 0.6)", fontFamily:"'Inter',sans-serif", letterSpacing:"0.04em" }}>
                MODEL PARAMETERS
              </span>
            </div>
            <div className="space-y-5">
              <GlassSlider label="Temperature (Creativity)" value={temperature} min={0} max={2} step={0.1}
                onChange={setTemperature} color="hsl(var(--foreground))" />
              <GlassSlider label="Top-P (Focus)" value={topP} min={0} max={1} step={0.05}
                onChange={setTopP} color="hsl(var(--foreground))" />
              <GlassSlider label="Max Tokens" value={maxTokens} min={64} max={4096} step={64}
                onChange={setMaxTokens} color="hsl(var(--foreground))" unit=" tk" />
            </div>
          </div>

          {/* Restart */}
          <button onClick={restart}
            className="w-full py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all"
            style={{ background:"hsl(var(--foreground) / 0.04)", color:"hsl(var(--foreground) / 0.4)", border:"0.5px solid hsl(var(--foreground) / 0.07)", fontFamily:"'Inter',sans-serif" }}>
            <RotateCcw className="w-3.5 h-3.5" /> Restart Agent with New Instructions
          </button>
        </div>

        {/* RIGHT — Body (Chat Preview) */}
        <div className="rounded-2xl overflow-hidden flex flex-col" style={{ background:"rgba(0,0,0,0.9)", border:"0.5px solid hsl(var(--foreground) / 0.07)", minHeight:520 }}>
          {/* Chat header */}
          <div className="flex items-center gap-2.5 px-4 py-3 border-b" style={{ borderColor:"hsl(var(--foreground) / 0.06)" }}>
            <div className="w-2 h-2 rounded-full" style={{ background: "hsl(var(--card))", animation:"orb-pulse-active 2.4s ease-in-out infinite" }} />
            <span className="text-xs font-bold" style={{ color:"hsl(var(--foreground) / 0.6)", fontFamily:"'Inter',sans-serif", letterSpacing:"0.04em" }}>
              AGENT PREVIEW
            </span>
            <span className="ml-auto text-[10px]" style={{ color:"hsl(var(--foreground) / 0.2)", fontFamily:"'JetBrains Mono',monospace" }}>
              temp={temperature} · top_p={topP}
            </span>
          </div>

          {/* Messages */}
          <div ref={chatRef} className="flex-1 p-4 space-y-3 overflow-y-auto" style={{ scrollbarWidth:"none" }}>
            {messages.map((m, i) => <ChatBubble key={i} msg={m} />)}
            {thinking && (
              <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="flex gap-2">
                <div className="w-6 h-6 rounded-lg flex-shrink-0 flex items-center justify-center text-[10px] font-bold"
                  style={{ background:"rgba(150,150,150,0.15)", color:"hsl(var(--foreground))", fontFamily:"Georgia,serif" }}>A</div>
                <div className="flex items-center gap-1 px-3 py-2 rounded-xl"
                  style={{ background:"rgba(150,150,150,0.06)", border:"0.5px solid rgba(150,150,150,0.12)" }}>
                  {[0,1,2].map((d) => (
                    <span key={d} className="w-1.5 h-1.5 rounded-full block"
                      style={{ background: "hsl(var(--card))", animation:`priority-flicker 1s ease-in-out infinite`, animationDelay:`${d * 0.2}s` }} />
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Input */}
          <div className="p-3 border-t" style={{ borderColor:"hsl(var(--foreground) / 0.06)" }}>
            <div className="flex items-center gap-2">
              <input
                className="flex-1 bg-transparent outline-none text-sm text-white placeholder-white/20 px-1"
                style={{ fontFamily:"'Inter',sans-serif" }}
                placeholder="Test your agent…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
              />
              <button onClick={send}
                className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
                style={{ background:"rgba(150,150,150,0.15)", border:"0.5px solid rgba(150,150,150,0.25)" }}>
                <Send className="w-3.5 h-3.5" style={{ color:"hsl(var(--foreground))" }} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
