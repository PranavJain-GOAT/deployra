import { useState, useEffect, useRef } from "react";
import { MessageSquare, Search, Send, Paperclip, Check, CheckCheck, MoreHorizontal, Phone, Video, Loader2 } from "lucide-react";
import axios from "axios";
import { API_URL } from "@/lib/config";

function MessageBubble({ msg, currentUserId }) {
  const isMe = msg.senderId === currentUserId || msg.from === "me";
  return (
    <div className={`flex ${isMe ? "justify-end" : "justify-start"} mb-2`}>
      <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl ${isMe ? "bg-foreground text-background rounded-br-sm" : "bg-foreground/8 text-foreground border border-foreground/8 rounded-bl-sm"}`}>
        <p className="text-sm leading-relaxed" style={{ fontFamily: "'Inter', sans-serif" }}>{msg.content || msg.text}</p>
        <div className={`flex items-center gap-1 mt-1 ${isMe ? "justify-end" : ""}`}>
          <span className="text-[9px] font-mono opacity-50">
            {new Date(msg.createdAt || msg.time || Date.now()).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
          </span>
          {isMe && (msg.read ? <CheckCheck className="w-3 h-3 opacity-50" /> : <Check className="w-3 h-3 opacity-30" />)}
        </div>
      </div>
    </div>
  );
}

export default function ClientMessages() {
  const [conversations, setConversations] = useState([]);
  const [activeId,      setActiveId]      = useState(null);
  const [messages,      setMessages]      = useState([]);
  const [input,         setInput]         = useState("");
  const [search,        setSearch]        = useState("");
  const [loading,       setLoading]       = useState(true);
  const [msgLoading,    setMsgLoading]    = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    axios.get(`${API_URL}/users/me`, { withCredentials: true, headers })
      .then(res => setCurrentUserId(res.data?.data?.id || res.data?.user?.id))
      .catch(() => {});

    axios.get(`${API_URL}/messages/conversations`, { withCredentials: true, headers })
      .then(res => {
        const data = Array.isArray(res.data?.data) ? res.data.data : [];
        setConversations(data);
        if (data.length > 0) setActiveId(data[0].id);
      })
      .catch(() => setConversations([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!activeId) return;
    setMsgLoading(true);
    const token = localStorage.getItem("auth_token");
    axios.get(`${API_URL}/messages/${activeId}`, {
      withCredentials: true,
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
      .then(res => setMessages(Array.isArray(res.data?.data) ? res.data.data : []))
      .catch(() => setMessages([]))
      .finally(() => setMsgLoading(false));
  }, [activeId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !activeId) return;
    const text = input.trim();
    setInput("");
    const token = localStorage.getItem("auth_token");
    try {
      const res = await axios.post(`${API_URL}/messages/${activeId}`,
        { content: text },
        { withCredentials: true, headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      const newMsg = res.data?.data || { id: Date.now(), content: text, senderId: currentUserId, createdAt: new Date().toISOString() };
      setMessages(p => [...p, newMsg]);
    } catch {
      setMessages(p => [...p, { id: Date.now(), content: text, senderId: currentUserId, createdAt: new Date().toISOString() }]);
    }
  };

  const getLabel   = (c) => c.name || c.otherUser?.name || c.otherUser?.email?.split("@")[0] || "User";
  const getAvatar  = (c) => getLabel(c)[0]?.toUpperCase() || "?";
  const getProduct = (c) => c.product?.title || c.order?.product?.title || "";
  const getLastMsg = (c) => c.lastMessage?.content || c.lastMessage || "";
  const getLastTime = (c) => c.lastMessage?.createdAt
    ? new Date(c.lastMessage.createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
    : "";

  const active   = conversations.find(c => c.id === activeId);
  const filtered = conversations.filter(c =>
    !search ||
    getLabel(c).toLowerCase().includes(search.toLowerCase()) ||
    getProduct(c).toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-foreground/30" />
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center max-w-sm px-6">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{ background: "rgba(150,150,150,0.06)", border: "0.5px solid rgba(150,150,150,0.1)" }}>
            <MessageSquare className="w-8 h-8 text-foreground/20" />
          </div>
          <h2 className="text-lg font-bold text-foreground mb-2" style={{ fontFamily: "Georgia, serif" }}>No messages yet</h2>
          <p className="text-sm text-foreground/40 leading-relaxed" style={{ fontFamily: "'Inter', sans-serif" }}>
            When you place an order, you'll be able to message the developer directly here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* Conversation list */}
      <div className="w-72 flex-shrink-0 flex flex-col border-r border-border bg-background/30">
        <div className="p-4 border-b border-border">
          <h2 className="text-white font-bold text-sm mb-3" style={{ fontFamily: "Georgia, serif" }}>Business Inbox</h2>
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: "rgba(150,150,150,0.05)", border: "0.5px solid rgba(150,150,150,0.1)" }}>
            <Search className="w-3.5 h-3.5 text-foreground/30" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search..." className="flex-1 bg-transparent text-xs text-foreground placeholder-foreground/25 outline-none" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto premium-scroll">
          {filtered.map(c => (
            <button key={c.id} onClick={() => setActiveId(c.id)}
              className={`w-full px-4 py-3.5 flex items-start gap-3 text-left transition-all border-b border-foreground/5 ${activeId === c.id ? "bg-foreground/6" : "hover:bg-foreground/[0.03]"}`}
            >
              <div className="relative shrink-0">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm text-background bg-foreground">
                  {getAvatar(c)}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-xs font-semibold text-foreground truncate">{getLabel(c)}</span>
                  <span className="text-[9px] font-mono text-foreground/25 shrink-0 ml-2">{getLastTime(c)}</span>
                </div>
                <div className="text-[9px] text-foreground/25 font-mono uppercase tracking-widest mb-0.5">{getProduct(c)}</div>
                <div className={`text-[11px] truncate ${(c.unreadCount > 0) ? "text-foreground/70 font-semibold" : "text-foreground/35"}`}>
                  {getLastMsg(c)}
                </div>
              </div>
              {(c.unreadCount > 0) && (
                <span className="ml-1 w-5 h-5 rounded-full bg-foreground text-background text-[9px] font-black flex items-center justify-center shrink-0">
                  {c.unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Chat panel */}
      {active ? (
        <div className="flex-1 flex flex-col min-w-0">
          <div className="px-5 py-3.5 flex items-center gap-3 border-b border-border bg-background/20">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm text-background bg-foreground shrink-0">
              {getAvatar(active)}
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-foreground">{getLabel(active)}</div>
              <div className="text-[10px] font-mono text-foreground/35">{getProduct(active)}</div>
            </div>
            <div className="flex items-center gap-1">
              <button className="p-2 rounded-lg text-foreground/30 hover:text-foreground hover:bg-foreground/5"><Phone className="w-4 h-4" /></button>
              <button className="p-2 rounded-lg text-foreground/30 hover:text-foreground hover:bg-foreground/5"><Video className="w-4 h-4" /></button>
              <button className="p-2 rounded-lg text-foreground/30 hover:text-foreground hover:bg-foreground/5"><MoreHorizontal className="w-4 h-4" /></button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-5 premium-scroll">
            {msgLoading ? (
              <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-foreground/20" /></div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-sm text-foreground/30">No messages yet. Say hello!</p>
              </div>
            ) : (
              messages.map(m => <MessageBubble key={m.id} msg={m} currentUserId={currentUserId} />)
            )}
            <div ref={bottomRef} />
          </div>
          <div className="px-5 py-4 border-t border-border">
            <div className="flex items-center gap-3 px-4 py-3 rounded-2xl" style={{ background: "rgba(150,150,150,0.06)", border: "0.5px solid rgba(150,150,150,0.12)" }}>
              <button className="p-1.5 text-foreground/30 hover:text-foreground/60"><Paperclip className="w-4 h-4" /></button>
              <input type="text" value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSend()}
                placeholder="Type a message..."
                className="flex-1 bg-transparent text-sm text-foreground placeholder-foreground/25 outline-none"
                style={{ fontFamily: "'Inter', sans-serif" }} />
              <button onClick={handleSend} disabled={!input.trim()} className="p-2 rounded-xl bg-foreground text-background hover:bg-foreground/90 disabled:opacity-30">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 text-foreground/15" />
            <p className="text-sm text-foreground/30">Select a conversation</p>
          </div>
        </div>
      )}
    </div>
  );
}
