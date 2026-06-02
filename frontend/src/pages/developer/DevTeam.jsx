import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Plus, X, Shield, Crown, BarChart3, Code2, Mail, Check, RefreshCw, Trash2, Clock } from "lucide-react";

const ROLES = [
  { value: "owner",     label: "Owner",     desc: "Full access. Can delete org.",          color: "text-amber-400",  icon: Crown    },
  { value: "admin",     label: "Admin",     desc: "Manage members, billing, products.",     color: "text-violet-400", icon: Shield   },
  { value: "developer", label: "Developer", desc: "Publish and manage products.",           color: "text-blue-400",   icon: Code2    },
  { value: "analyst",   label: "Analyst",   desc: "View analytics and reports only.",       color: "text-emerald-400",icon: BarChart3},
];

const INITIAL_MEMBERS = [
  { id: "m1", name: "You (Owner)",      email: "you@company.io",     role: "owner",     joined: "Jan 2025",   lastActive: "Now",        avatar: "Y", isYou: true  },
  { id: "m2", name: "Anjali Sharma",    email: "anjali@company.io",  role: "developer", joined: "Mar 2025",   lastActive: "2h ago",     avatar: "A" },
  { id: "m3", name: "Marcus Chen",      email: "marcus@company.io",  role: "analyst",   joined: "Apr 2025",   lastActive: "Yesterday",  avatar: "M" },
  { id: "m4", name: "Sarah Williams",   email: "sarah@company.io",   role: "admin",     joined: "Feb 2025",   lastActive: "1h ago",     avatar: "S" },
];

const PENDING_INVITES = [
  { id: "inv-1", email: "dev@newstartup.io", role: "developer", sentAt: "May 27, 2025" },
  { id: "inv-2", email: "cto@enterprise.co", role: "admin",     sentAt: "May 26, 2025" },
];

const ACTIVITY_LOG = [
  { actor: "Sarah Williams", action: "Approved product review",     time: "1h ago",       type: "product" },
  { actor: "You",            action: "Invited dev@newstartup.io",   time: "2h ago",       type: "invite"  },
  { actor: "Anjali Sharma",  action: "Published Data Pipeline Pro", time: "Yesterday",    type: "product" },
  { actor: "Marcus Chen",    action: "Exported analytics report",   time: "May 26",       type: "analytics"},
  { actor: "You",            action: "Updated billing method",      time: "May 25",       type: "billing" },
];

function RoleBadge({ role }) {
  const cfg = ROLES.find(r => r.value === role);
  return cfg ? (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold ${cfg.color}`}>
      <cfg.icon className="w-3 h-3" />
      {cfg.label}
    </span>
  ) : null;
}

export default function DevTeam() {
  const [members, setMembers] = useState(INITIAL_MEMBERS);
  const [invites, setInvites] = useState(PENDING_INVITES);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("developer");
  const [inviting, setInviting] = useState(false);
  const [invited, setInvited] = useState(false);

  const handleInvite = () => {
    if (!inviteEmail.trim()) return;
    setInviting(true);
    setTimeout(() => {
      setInvites(p => [...p, { id: `inv-${Date.now()}`, email: inviteEmail.trim(), role: inviteRole, sentAt: "Just now" }]);
      setInviting(false);
      setInvited(true);
      setInviteEmail("");
      setTimeout(() => { setInvited(false); setShowInvite(false); }, 2000);
    }, 1500);
  };

  const handleRemoveMember = (id) => {
    setMembers(p => p.filter(m => m.id !== id));
  };

  const handleCancelInvite = (id) => {
    setInvites(p => p.filter(i => i.id !== id));
  };

  return (
    <div className="p-6 sm:p-8 max-w-4xl page-fade-in">

      {/* Header */}
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <div className="stat-label-caps mb-2">Developer · Organization</div>
          <h1 className="text-white font-bold text-2xl sm:text-3xl section-title-gradient" style={{ fontFamily: "Georgia, serif", letterSpacing: "-0.04em" }}>
            Team & Organization
          </h1>
          <p className="text-sm mt-1.5" style={{ color: "hsl(var(--foreground) / 0.35)", fontFamily: "'Inter', sans-serif" }}>
            Manage your team members, roles, and collaborative access to your developer account.
          </p>
        </div>
        <button
          onClick={() => setShowInvite(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-foreground text-background hover:bg-foreground/90 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          Invite Member
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "Team Members", value: members.length,     icon: Users  },
          { label: "Pending Invites", value: invites.length,  icon: Mail   },
          { label: "Plan Seats",    value: "10 / 25",         icon: Crown  },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className="frosted-panel p-4"
          >
            <s.icon className="w-4 h-4 text-foreground/40 mb-2" />
            <div className="text-xl font-bold metric-num" style={{ fontFamily: "Georgia, serif" }}>{s.value}</div>
            <div className="stat-label-caps mt-0.5">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Members Table */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="frosted-panel overflow-hidden mb-5"
      >
        <div className="px-5 py-4" style={{ borderBottom: "0.5px solid hsl(var(--foreground) / 0.05)" }}>
          <h2 className="text-white font-bold text-sm" style={{ fontFamily: "Georgia, serif" }}>Members ({members.length})</h2>
        </div>
        <div>
          {members.map((m, i) => (
            <motion.div key={m.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 + 0.25 }}
              className="flex items-center gap-4 px-5 py-4 border-b border-foreground/5 hover:bg-foreground/[0.02] transition-colors"
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm text-background bg-foreground shrink-0">
                {m.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-foreground">{m.name}</span>
                  {m.isYou && <span className="text-[9px] font-black text-foreground/40 bg-foreground/8 px-1.5 py-0.5 rounded uppercase tracking-widest">You</span>}
                </div>
                <span className="text-[10px] font-mono text-foreground/30">{m.email}</span>
              </div>
              <div className="text-center">
                <RoleBadge role={m.role} />
              </div>
              <div className="text-right shrink-0">
                <div className="text-[10px] font-mono text-foreground/30">Joined {m.joined}</div>
                <div className="text-[10px] font-mono text-foreground/20 mt-0.5">{m.lastActive}</div>
              </div>
              {!m.isYou && (
                <button onClick={() => handleRemoveMember(m.id)}
                  className="p-2 rounded-lg text-foreground/20 hover:text-red-400 hover:bg-red-400/5 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Pending Invites */}
      {invites.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="frosted-panel overflow-hidden mb-5"
        >
          <div className="px-5 py-4" style={{ borderBottom: "0.5px solid hsl(var(--foreground) / 0.05)" }}>
            <h2 className="text-white font-bold text-sm" style={{ fontFamily: "Georgia, serif" }}>Pending Invitations</h2>
          </div>
          {invites.map(inv => (
            <div key={inv.id} className="flex items-center gap-4 px-5 py-3.5 border-b border-foreground/5">
              <Mail className="w-4 h-4 text-foreground/30 shrink-0" />
              <div className="flex-1">
                <span className="text-sm font-mono text-foreground/70">{inv.email}</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <RoleBadge role={inv.role} />
                  <span className="text-[10px] font-mono text-foreground/25">Sent {inv.sentAt}</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="flex items-center gap-1 text-[10px] font-mono text-amber-400">
                  <Clock className="w-3 h-3" /> Pending
                </span>
                <button onClick={() => handleCancelInvite(inv.id)} className="p-1.5 rounded-lg text-foreground/25 hover:text-red-400 hover:bg-red-400/5 transition-all">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* Activity Log */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
        className="frosted-panel overflow-hidden"
      >
        <div className="px-5 py-4" style={{ borderBottom: "0.5px solid hsl(var(--foreground) / 0.05)" }}>
          <h2 className="text-white font-bold text-sm" style={{ fontFamily: "Georgia, serif" }}>Team Activity</h2>
          <p className="stat-label-caps mt-0.5">Audit log of all team actions</p>
        </div>
        <div className="p-4 space-y-2">
          {ACTIVITY_LOG.map((a, i) => (
            <div key={i} className="flex items-center gap-3 py-2">
              <div className="w-1.5 h-1.5 rounded-full bg-foreground/20 shrink-0" />
              <div className="flex-1">
                <span className="text-xs font-semibold text-foreground/70">{a.actor}</span>
                <span className="text-xs text-foreground/40 ml-1.5">{a.action}</span>
              </div>
              <span className="text-[10px] font-mono text-foreground/25">{a.time}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Invite Modal */}
      <AnimatePresence>
        {showInvite && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }} onClick={() => setShowInvite(false)}>
            <motion.div className="w-full max-w-md rounded-2xl p-6" style={{ background: "rgba(0,0,0,0.97)", border: "0.5px solid rgba(150,150,150,0.2)", boxShadow: "0 40px 80px rgba(0,0,0,0.8)" }} initial={{ scale: 0.94, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.94, y: 20 }} onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-white font-bold" style={{ fontFamily: "Georgia, serif" }}>Invite Team Member</h3>
                <button onClick={() => setShowInvite(false)} className="p-2 rounded-lg text-foreground/30 hover:text-foreground hover:bg-foreground/5">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="stat-label-caps mb-2 block">Email Address</label>
                  <input type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="colleague@company.com" className="w-full px-4 py-3 rounded-xl border border-foreground/10 bg-transparent text-sm text-foreground placeholder-foreground/25 outline-none focus:border-foreground/25 transition-all" style={{ fontFamily: "'Inter', sans-serif" }} />
                </div>
                <div>
                  <label className="stat-label-caps mb-2 block">Role</label>
                  <div className="space-y-2">
                    {ROLES.filter(r => r.value !== "owner").map(role => (
                      <button key={role.value} onClick={() => setInviteRole(role.value)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${inviteRole === role.value ? "border-foreground/25 bg-foreground/5" : "border-foreground/8 hover:border-foreground/15"}`}
                      >
                        <role.icon className={`w-4 h-4 shrink-0 ${role.color}`} />
                        <div>
                          <span className={`text-xs font-bold ${role.color}`}>{role.label}</span>
                          <p className="text-[10px] text-foreground/35 mt-0.5">{role.desc}</p>
                        </div>
                        {inviteRole === role.value && <Check className="w-4 h-4 ml-auto text-foreground/50" />}
                      </button>
                    ))}
                  </div>
                </div>
                <button onClick={handleInvite} disabled={inviting || invited || !inviteEmail.trim()}
                  className={`w-full py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-40 ${invited ? "bg-emerald-400/10 text-emerald-400 border border-emerald-400/20" : "bg-foreground text-background hover:bg-foreground/90"}`}
                >
                  {inviting ? <RefreshCw className="w-4 h-4 animate-spin" /> : invited ? <Check className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                  {inviting ? "Sending..." : invited ? "Invitation Sent!" : "Send Invitation"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
