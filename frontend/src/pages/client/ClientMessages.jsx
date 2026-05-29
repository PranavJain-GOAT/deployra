import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Search, Send, Paperclip, Check, CheckCheck, MoreHorizontal, Phone, Video } from "lucide-react";

const CONVERSATIONS = [
  {
    id: "conv-1", name: "BotLabs Support", type: "Vendor", product: "AI Support Chatbot",
    avatar: "B", online: true, unread: 1, lastMessage: "The update is live on your env!", lastTime: "10:45 AM",
    messages: [
      { id: 1, from: "them", text: "Hi! Just letting you know your chatbot config update has been deployed to staging.", time: "10:22 AM", read: true },
      { id: 2, from: "me",   text: "Great, thanks! Can you confirm the webhook endpoint is correctly configured?", time: "10:38 AM", read: true },
      { id: 3, from: "them", text: "The update is live on your env!", time: "10:45 AM", read: false },
    ]
  },
  {
    id: "conv-2", name: "Priya Systems", type: "Vendor", product: "Data Pipeline Pro",
    avatar: "P", online: false, unread: 0, lastMessage: "Sure, I'll send the config file.", lastTime: "Yesterday",
    messages: [
      { id: 1, from: "me",   text: "We need to increase the batch processing limit to 50k records per job.", time: "Yesterday 2:00 PM", read: true },
      { id: 2, from: "them", text: "Sure, I'll send the config file. This is a straightforward change.", time: "Yesterday 3:15 PM", read: true },
    ]
  },
  {
    id: "conv-3", name: "Deployra Support", type: "Support", product: "Platform",
    avatar: "D", online: true, unread: 0, lastMessage: "Your ticket has been escalated.", lastTime: "May 24",
    messages: [
      { id: 1, from: "me",   text: "We have a billing discrepancy on invoice INV-0039.", time: "May 24 9:00 AM", read: true },
      { id: 2, from: "them", text: "Your ticket has been escalated to our billing team. You'll hear from us within 2 hours.", time: "May 24 9:30 AM", read: true },
    ]
  },
];

function MessageBubble({ msg }) {
  const isMe = msg.from === "me";
  return (
    <div className={`flex ${isMe ? "justify-end" : "justify-start"} mb-2`}>
      <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl ${isMe ? "bg-foreground text-background rounded-br-sm" : "bg-foreground/8 text-foreground border border-foreground/8 rounded-bl-sm"}`}>
        <p className="text-sm leading-relaxed" style={{ fontFamily: "'Inter', sans-serif" }}>{msg.text}</p>
        <div className={`flex items-center gap-1 mt-1 ${isMe ? "justify-end" : ""}`}>
          <span className="text-[9px] font-mono opacity-50">{msg.time}</span>
          {isMe && (msg.read ? <CheckCheck className="w-3 h-3 opacity-50" /> : <Check className="w-3 h-3 opacity-30" />)}
        </div>
      </div>
    </div>
  );
}

export default function ClientMessages() {
  const [convos, setConvos] = useState(CONVERSATIONS);
  const [activeId, setActiveId] = useState(CONVERSATIONS[0].id);
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const bottomRef = useRef(null);

  const active = convos.find(c => c.id === activeId);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [activeId, active?.messages?.length]);

  const handleSelect = (id) => {
    setActiveId(id);
    setConvos(p => p.map(c => c.id === id ? { ...c, unread: 0 } : c));
  };

  const handleSend = () => {
    if (!input.trim()) return;
    const newMsg = { id: Date.now(), from: "me", text: input.trim(), time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }), read: false };
    setConvos(p => p.map(c => c.id === activeId ? { ...c, messages: [...c.messages, newMsg], lastMessage: input.trim(), lastTime: "Just now" } : c));
    setInput("");
  };

  const filtered = convos.filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.product.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* Conversation list */}
      <div className="w-72 flex-shrink-0 flex flex-col border-r border-border bg-background/30">
        <div className="p-4 border-b border-border">
          <h2 className="text-white font-bold text-sm mb-3" style={{ fontFamily: "Georgia, serif" }}>Business Inbox</h2>
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: "rgba(150,150,150,0.05)", border: "0.5px solid rgba(150,150,150,0.1)" }}>
            <Search className="w-3.5 h-3.5 text-foreground/30" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="flex-1 bg-transparent text-xs text-foreground placeholder-foreground/25 outline-none" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto premium-scroll">
          {filtered.map(c => (
            <button key={c.id} onClick={() => handleSelect(c.id)} className={`w-full px-4 py-3.5 flex items-start gap-3 text-left transition-all border-b border-foreground/5 ${activeId === c.id ? "bg-foreground/6" : "hover:bg-foreground/[0.03]"}`}>
              <div className="relative shrink-0">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm text-background bg-foreground">{c.avatar}</div>
                {c.online && <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-background" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-xs font-semibold text-foreground truncate">{c.name}</span>
                  <span className="text-[9px] font-mono text-foreground/25 shrink-0 ml-2">{c.lastTime}</span>
                </div>
                <div className="text-[9px] text-foreground/25 font-mono uppercase tracking-widest mb-0.5">{c.type} · {c.product}</div>
                <div className={`text-[11px] truncate ${c.unread > 0 ? "text-foreground/70 font-semibold" : "text-foreground/35"}`}>{c.lastMessage}</div>
              </div>
              {c.unread > 0 && <span className="ml-1 w-5 h-5 rounded-full bg-foreground text-background text-[9px] font-black flex items-center justify-center shrink-0">{c.unread}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Chat panel */}
      {active ? (
        <div className="flex-1 flex flex-col min-w-0">
          <div className="px-5 py-3.5 flex items-center gap-3 border-b border-border bg-background/20">
            <div className="relative shrink-0">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm text-background bg-foreground">{active.avatar}</div>
              {active.online && <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-background" />}
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-foreground">{active.name}</div>
              <div className="text-[10px] font-mono text-foreground/35">{active.type} · {active.product} · {active.online ? "Online now" : "Offline"}</div>
            </div>
            <div className="flex items-center gap-1">
              <button className="p-2 rounded-lg text-foreground/30 hover:text-foreground hover:bg-foreground/5"><Phone className="w-4 h-4" /></button>
              <button className="p-2 rounded-lg text-foreground/30 hover:text-foreground hover:bg-foreground/5"><Video className="w-4 h-4" /></button>
              <button className="p-2 rounded-lg text-foreground/30 hover:text-foreground hover:bg-foreground/5"><MoreHorizontal className="w-4 h-4" /></button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-5 premium-scroll">
            {active.messages.map(m => <MessageBubble key={m.id} msg={m} />)}
            <div ref={bottomRef} />
          </div>
          <div className="px-5 py-4 border-t border-border">
            <div className="flex items-center gap-3 px-4 py-3 rounded-2xl" style={{ background: "rgba(150,150,150,0.06)", border: "0.5px solid rgba(150,150,150,0.12)" }}>
              <button className="p-1.5 text-foreground/30 hover:text-foreground/60"><Paperclip className="w-4 h-4" /></button>
              <input type="text" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSend()} placeholder="Type a message..." className="flex-1 bg-transparent text-sm text-foreground placeholder-foreground/25 outline-none" style={{ fontFamily: "'Inter', sans-serif" }} />
              <button onClick={handleSend} disabled={!input.trim()} className="p-2 rounded-xl bg-foreground text-background hover:bg-foreground/90 disabled:opacity-30"><Send className="w-4 h-4" /></button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center"><MessageSquare className="w-12 h-12 mx-auto mb-3 text-foreground/15" /><p className="text-sm text-foreground/30">Select a conversation</p></div>
        </div>
      )}
    </div>
  );
}
