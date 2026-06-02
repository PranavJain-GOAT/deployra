import { useState, useEffect, useRef } from "react";
import { MessageSquare, Search, Send, Paperclip, Check, CheckCheck, Phone, Video, MoreHorizontal } from "lucide-react";

const CONVERSATIONS = [
  {
    id: "conv-1", name: "Sarah M.", company: "AcmeCorp", product: "AI Support Chatbot",
    avatar: "S", online: true, unread: 2, lastMessage: "Can you share the staging link?", lastTime: "10:45 AM",
    messages: [
      { id: 1, from: "client", text: "Hi! We've completed the escrow funding. When can we expect the first milestone?", time: "10:22 AM", read: true },
      { id: 2, from: "dev",    text: "Great! We'll have the first deployment ready by June 2nd. I'll share the staging environment link then.", time: "10:38 AM", read: true },
      { id: 3, from: "client", text: "Can you share the staging link earlier for review?", time: "10:45 AM", read: false },
      { id: 4, from: "client", text: "Also, can we schedule a demo call this week?", time: "10:46 AM", read: false },
    ]
  },
  {
    id: "conv-2", name: "Tech Corp", company: "TechCorp Inc.", product: "Data Pipeline Pro",
    avatar: "T", online: false, unread: 0, lastMessage: "The config file worked!", lastTime: "Yesterday",
    messages: [
      { id: 1, from: "client", text: "Having trouble connecting the PostgreSQL adapter. Getting timeout errors.", time: "Yesterday 2:10 PM", read: true },
      { id: 2, from: "dev",    text: "Try increasing the connection pool size to 20 in the config.env file. I'll share an updated file.", time: "Yesterday 3:45 PM", read: true },
      { id: 3, from: "client", text: "The config file worked! Connections are stable now.", time: "Yesterday 4:22 PM", read: true },
    ]
  },
  {
    id: "conv-3", name: "Alex K.", company: "VC Fund",  product: "Analytics Suite",
    avatar: "A", online: true, unread: 0, lastMessage: "Looking forward to the launch!", lastTime: "May 24",
    messages: [
      { id: 1, from: "client", text: "This is looking incredible. The dashboard is exactly what we needed.", time: "May 24 11:00 AM", read: true },
      { id: 2, from: "dev",    text: "Thank you! We put a lot of care into the UX. The performance charts update in real-time.", time: "May 24 11:15 AM", read: true },
      { id: 3, from: "client", text: "Looking forward to the launch!", time: "May 24 11:20 AM", read: true },
    ]
  },
];

function MessageBubble({ msg, isLast }) {
  const isDev = msg.from === "dev";
  return (
    <div className={`flex ${isDev ? "justify-end" : "justify-start"} mb-2`}>
      <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl ${
        isDev
          ? "bg-foreground text-background rounded-br-sm"
          : "bg-foreground/8 text-foreground border border-foreground/8 rounded-bl-sm"
      }`}>
        <p className="text-sm leading-relaxed" style={{ fontFamily: "'Inter', sans-serif" }}>{msg.text}</p>
        <div className={`flex items-center gap-1 mt-1 ${isDev ? "justify-end" : ""}`}>
          <span className={`text-[9px] font-mono opacity-50`}>{msg.time}</span>
          {isDev && (
            msg.read
              ? <CheckCheck className="w-3 h-3 opacity-50" />
              : <Check className="w-3 h-3 opacity-30" />
          )}
        </div>
      </div>
    </div>
  );
}

export default function DevMessages() {
  const [convos, setConvos] = useState(CONVERSATIONS);
  const [activeId, setActiveId] = useState(CONVERSATIONS[0].id);
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const bottomRef = useRef(null);

  const active = convos.find(c => c.id === activeId);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeId, active?.messages?.length]);

  const handleSelect = (id) => {
    setActiveId(id);
    setConvos(p => p.map(c => c.id === id ? { ...c, unread: 0 } : c));
  };

  const handleSend = () => {
    if (!input.trim()) return;
    const newMsg = { id: Date.now(), from: "dev", text: input.trim(), time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }), read: false };
    setConvos(p => p.map(c => c.id === activeId ? { ...c, messages: [...c.messages, newMsg], lastMessage: input.trim(), lastTime: "Just now" } : c));
    setInput("");
  };

  const filtered = convos.filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.product.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">

      {/* Sidebar */}
      <div className="w-72 flex-shrink-0 flex flex-col border-r border-border bg-background/30">
        <div className="p-4 border-b border-border">
          <h2 className="text-white font-bold text-sm mb-3" style={{ fontFamily: "Georgia, serif" }}>Client Inbox</h2>
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: "rgba(150,150,150,0.05)", border: "0.5px solid rgba(150,150,150,0.1)" }}>
            <Search className="w-3.5 h-3.5 text-foreground/30" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search conversations..."
              className="flex-1 bg-transparent text-xs text-foreground placeholder-foreground/25 outline-none"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto premium-scroll">
          {filtered.map(c => (
            <button
              key={c.id}
              onClick={() => handleSelect(c.id)}
              className={`w-full px-4 py-3.5 flex items-start gap-3 text-left transition-all border-b border-foreground/5 ${activeId === c.id ? "bg-foreground/6" : "hover:bg-foreground/[0.03]"}`}
            >
              <div className="relative shrink-0">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm text-background bg-foreground">
                  {c.avatar}
                </div>
                {c.online && <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-background" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-xs font-semibold text-foreground truncate">{c.name}</span>
                  <span className="text-[9px] font-mono text-foreground/25 shrink-0 ml-2">{c.lastTime}</span>
                </div>
                <div className="text-[10px] text-foreground/35 truncate">{c.product}</div>
                <div className={`text-[11px] truncate mt-0.5 ${c.unread > 0 ? "text-foreground/70 font-semibold" : "text-foreground/35"}`}>
                  {c.lastMessage}
                </div>
              </div>
              {c.unread > 0 && (
                <span className="ml-1 w-5 h-5 rounded-full bg-foreground text-background text-[9px] font-black flex items-center justify-center shrink-0">
                  {c.unread}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Panel */}
      {active ? (
        <div className="flex-1 flex flex-col min-w-0">
          {/* Chat Header */}
          <div className="px-5 py-3.5 flex items-center gap-3 border-b border-border bg-background/20">
            <div className="relative shrink-0">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm text-background bg-foreground">
                {active.avatar}
              </div>
              {active.online && <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-background" />}
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-foreground">{active.name}</div>
              <div className="text-[10px] font-mono text-foreground/35">{active.company} · {active.product} · {active.online ? "Online now" : "Last seen recently"}</div>
            </div>
            <div className="flex items-center gap-1">
              <button className="p-2 rounded-lg text-foreground/30 hover:text-foreground hover:bg-foreground/5 transition-all">
                <Phone className="w-4 h-4" />
              </button>
              <button className="p-2 rounded-lg text-foreground/30 hover:text-foreground hover:bg-foreground/5 transition-all">
                <Video className="w-4 h-4" />
              </button>
              <button className="p-2 rounded-lg text-foreground/30 hover:text-foreground hover:bg-foreground/5 transition-all">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 premium-scroll">
            {active.messages.map((m, i) => (
              <MessageBubble key={m.id} msg={m} isLast={i === active.messages.length - 1} />
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-5 py-4 border-t border-border">
            <div className="flex items-center gap-3 px-4 py-3 rounded-2xl" style={{ background: "rgba(150,150,150,0.06)", border: "0.5px solid rgba(150,150,150,0.12)" }}>
              <button className="p-1.5 rounded-lg text-foreground/30 hover:text-foreground/60 hover:bg-foreground/5">
                <Paperclip className="w-4 h-4" />
              </button>
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend()}
                placeholder="Type a message..."
                className="flex-1 bg-transparent text-sm text-foreground placeholder-foreground/25 outline-none"
                style={{ fontFamily: "'Inter', sans-serif" }}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="p-2 rounded-xl bg-foreground text-background hover:bg-foreground/90 transition-all disabled:opacity-30"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="text-center text-[9px] text-foreground/20 mt-2 font-mono">Messages are end-to-end encrypted · Deployra Secure</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 text-foreground/15" />
            <p className="text-sm font-semibold text-foreground/30">Select a conversation</p>
          </div>
        </div>
      )}
    </div>
  );
}
