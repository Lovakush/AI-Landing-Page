'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import LoginModal from './LoginModal';

/* ─────────────────────────────────────────────────────────────────
   AUTH CONTEXT (lightweight — swap with your real auth when ready)
   Export setLoggedInUser from LoginModal's success callback
───────────────────────────────────────────────────────────────── */
export type AuthUser = { name: string; email: string } | null;

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/* ─── Agent options ─────────────────────────────────────────────── */
const AGENTS = [
  {
    id: 'hr',
    label: 'HR Agent',
    sub: 'Recruitment & people ops',
    icon: (
      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M17 20h5v-2a4 4 0 00-5-3.87M9 20H4v-2a4 4 0 015-3.87m6-4a4 4 0 11-8 0 4 4 0 018 0zm6 0a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    id: 'marketing',
    label: 'Marketing Agent',
    sub: 'Campaigns & content',
    icon: (
      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
      </svg>
    ),
  },
];

/* ═══════════════════════════════════════════════════════════════ */
const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loginOpen, setLoginOpen]   = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [rippleStyle, setRippleStyle]     = useState<React.CSSProperties>({});

  /* logged-in user — set via onLoginSuccess prop from LoginModal */
  const [user, setUser] = useState<AuthUser>(null);

  /* dropdown states */
  const [profileOpen,    setProfileOpen]    = useState(false);
  const [agentOpen,      setAgentOpen]      = useState(false);
  const [selectedAgent,  setSelectedAgent]  = useState<typeof AGENTS[0] | null>(null);

  const btnRef     = useRef<HTMLButtonElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const agentRef   = useRef<HTMLDivElement>(null);
  const pathname   = usePathname();
  const router      = useRouter();

  /* close dropdowns on outside click */
  useEffect(() => {
    const down = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node))
        setProfileOpen(false);
      if (agentRef.current && !agentRef.current.contains(e.target as Node))
        setAgentOpen(false);
    };
    document.addEventListener('mousedown', down);
    return () => document.removeEventListener('mousedown', down);
  }, []);

  /* ripple burst then open modal */
  const handleLoginClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const btn = btnRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top  + rect.height / 2;
    const maxDist = Math.sqrt(
      Math.pow(Math.max(cx, window.innerWidth  - cx), 2) +
      Math.pow(Math.max(cy, window.innerHeight - cy), 2)
    );
    setRippleStyle({ left: cx, top: cy, '--ripple-size': `${maxDist * 2.2}px` } as React.CSSProperties);
    setTransitioning(true);
    setTimeout(() => setLoginOpen(true),       420);
    setTimeout(() => setTransitioning(false),  900);
  };

  /* called by LoginModal after successful sign-in */
  const handleLoginSuccess = (name: string, email: string) => {
    setUser({ name, email });
    setLoginOpen(false);
    setTimeout(() => {
      document.getElementById('dashboard')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 380);
  };

  const handleLogout = () => {
    setUser(null);
    setProfileOpen(false);
  };

  /* ─── NAV LINKS ─── */
  const navLinks = [['/', 'Home'], ['/products', 'Products'], ['/about', 'About Us']];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&display=swap');

        /* ripple */
        @keyframes ripple-expand {
          0%   { transform:translate(-50%,-50%) scale(0); opacity:1; }
          55%  { opacity:1; }
          100% { transform:translate(-50%,-50%) scale(1); opacity:0; }
        }
        @keyframes ripple-flash {
          0%   { transform:translate(-50%,-50%) scale(0); opacity:0.9; }
          40%  { opacity:0.55; }
          100% { transform:translate(-50%,-50%) scale(1); opacity:0; }
        }
        .login-ripple {
          position:fixed; border-radius:50%; pointer-events:none; z-index:9999;
          width:var(--ripple-size); height:var(--ripple-size);
          transform:translate(-50%,-50%) scale(0);
          background:radial-gradient(circle,#f5d070 0%,#f0b849 35%,rgba(240,130,20,0.6) 65%,transparent 100%);
          animation:ripple-expand 0.85s cubic-bezier(0.4,0,0.2,1) forwards;
        }
        .login-ripple-inner {
          position:fixed; border-radius:50%; pointer-events:none; z-index:9998;
          width:var(--ripple-size); height:var(--ripple-size);
          transform:translate(-50%,-50%) scale(0);
          background:radial-gradient(circle,rgba(255,255,255,0.15) 0%,rgba(240,184,73,0.08) 40%,transparent 70%);
          animation:ripple-flash 0.85s cubic-bezier(0.3,0,0.2,1) 0.05s forwards;
        }

        /* dropdown container */
        @keyframes dropIn {
          from { opacity:0; transform:translateY(-6px) scale(0.97); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }
        .nb-drop {
          position:absolute; top:calc(100% + 12px); right:0;
          min-width:210px;
          background:rgba(8,8,22,0.97);
          border:1px solid rgba(240,184,73,0.18);
          border-radius:12px; padding:5px;
          box-shadow:0 24px 64px rgba(0,0,0,0.75), 0 0 0 1px rgba(240,184,73,0.04), 0 0 30px rgba(240,184,73,0.04);
          backdrop-filter:blur(24px);
          animation:dropIn 0.18s cubic-bezier(0.16,1,0.3,1) forwards;
          z-index:300;
          font-family:'DM Mono',monospace;
        }

        /* dropdown row */
        .nb-row {
          display:flex; align-items:center; gap:9px;
          padding:8px 10px; border-radius:8px; width:100%;
          background:none; border:none; cursor:pointer; text-align:left;
          color:rgba(230,218,190,0.72); font-family:'DM Mono',monospace;
          font-size:12px; letter-spacing:0.03em;
          transition:background 0.12s, color 0.12s;
        }
        .nb-row:hover { background:rgba(240,184,73,0.07); color:#f0ead8; }
        .nb-row.red:hover  { background:rgba(255,80,80,0.07); color:#ff8888; }
        .nb-sep { height:1px; background:rgba(240,184,73,0.1); margin:4px 4px; }

        /* profile header */
        .nb-ph {
          padding:10px 10px 8px; border-bottom:1px solid rgba(240,184,73,0.1); margin-bottom:3px;
        }
        .nb-ph-name  { font-family:'DM Mono',monospace; font-size:12px; color:#f0ead8; font-weight:500; letter-spacing:0.03em; }
        .nb-ph-email { font-family:'DM Mono',monospace; font-size:10px; color:rgba(200,185,150,0.38); letter-spacing:0.02em; margin-top:2px; }

        /* initials avatar */
        .nb-avatar {
          width:34px; height:34px; border-radius:50%; flex-shrink:0;
          background:linear-gradient(135deg,#d99830,#f5d070);
          color:#0a0a1a; font-family:'DM Mono',monospace;
          font-size:11.5px; font-weight:500; letter-spacing:0.05em;
          display:flex; align-items:center; justify-content:center;
          cursor:pointer; border:2px solid transparent;
          transition:border-color 0.18s, box-shadow 0.18s;
          user-select:none;
        }
        .nb-avatar:hover, .nb-avatar.on {
          border-color:rgba(240,184,73,0.55);
          box-shadow:0 0 0 3px rgba(240,184,73,0.13);
        }

        /* agent button */
        .nb-agent {
          display:flex; align-items:center; gap:6px;
          padding:6px 13px; border-radius:8px;
          background:rgba(240,184,73,0.06); border:1px solid rgba(240,184,73,0.22);
          color:rgba(240,184,73,0.8); font-family:'DM Mono',monospace;
          font-size:11px; font-weight:500; letter-spacing:0.08em; text-transform:uppercase;
          cursor:pointer; transition:background 0.14s, border-color 0.14s, color 0.14s;
          position:relative;
        }
        .nb-agent:hover, .nb-agent.on {
          background:rgba(240,184,73,0.12); border-color:rgba(240,184,73,0.45); color:#f0b849;
        }
        .nb-chevron { transition:transform 0.18s; }
        .nb-chevron.on { transform:rotate(180deg); }

        /* agent option rows */
        .nb-agent-row {
          display:flex; align-items:flex-start; gap:10px;
          padding:9px 10px; border-radius:8px; width:100%;
          background:none; border:none; cursor:pointer; text-align:left;
          transition:background 0.12s;
        }
        .nb-agent-row:hover { background:rgba(240,184,73,0.06); }
        .nb-agent-row.selected { background:rgba(240,184,73,0.1); }
        .nb-agent-row.selected .nb-agent-label { color:#f0b849; }
        .nb-agent-row.selected .nb-agent-icon { background:rgba(240,184,73,0.2); color:#f0b849; border-color:rgba(240,184,73,0.4); }
        .nb-agent-icon {
          width:28px; height:28px; border-radius:7px; flex-shrink:0;
          background:rgba(240,184,73,0.09); border:1px solid rgba(240,184,73,0.18);
          display:flex; align-items:center; justify-content:center;
          color:rgba(240,184,73,0.65); margin-top:1px;
          transition:background 0.12s, color 0.12s;
        }
        .nb-agent-row:hover .nb-agent-icon { background:rgba(240,184,73,0.16); color:#f0b849; }
        .nb-agent-label { font-family:'DM Mono',monospace; font-size:12px; color:#f0ead8; letter-spacing:0.02em; display:block; margin-bottom:2px; }
        .nb-agent-sub   { font-family:'DM Mono',monospace; font-size:9.5px; color:rgba(200,185,150,0.35); letter-spacing:0.03em; }

        /* pulse dot on avatar when logged in */
        .nb-online {
          position:absolute; bottom:0; right:0;
          width:8px; height:8px; border-radius:50%;
          background:#4ade80; border:2px solid #0a0a1a;
        }
      `}</style>

      {/* ripple layers */}
      {transitioning && (
        <>
          <div className="login-ripple" style={rippleStyle} />
          <div className="login-ripple-inner" style={rippleStyle} />
        </>
      )}

      <nav className="fixed top-0 w-full z-50 bg-[#0a0a1a]/80 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">

            {/* Logo */}
            <Link href="/" className="flex-shrink-0">
              <Image src="/sia-globe-v2.png" alt="SIA Logo" width={200} height={200} className="h-12 w-auto mix-blend-lighten" />
            </Link>

            {/* ── Desktop right side ── */}
            <div className="hidden md:flex items-center gap-8 ml-auto">

              {/* Nav links */}
              <div className="flex items-center gap-10">
                {navLinks.map(([href, label]) => (
                  <Link key={href} href={href}
                    className={`transition-colors duration-200 text-base font-medium ${pathname === href ? 'text-[#f0b849]' : 'text-gray-300 hover:text-white'}`}>
                    {label}
                  </Link>
                ))}
              </div>

              {/* ── LOGGED OUT: Login button ── */}
              {!user && (
                <button ref={btnRef} onClick={handleLoginClick}
                  className="border border-[#f0b849] text-[#f0b849] hover:bg-[#f0b849] hover:text-[#0a0a1a] font-semibold px-6 py-2.5 rounded-full transition-all duration-300 text-base"
                  style={{ isolation:'isolate' }}>
                  Login
                </button>
              )}

              {/* ── LOGGED IN: Agent button + Avatar ── */}
              {user && (
                <div className="flex items-center gap-3">

                  {/* Agent dropdown */}
                  <div ref={agentRef} style={{ position:'relative' }}>
                    <button
                      className={`nb-agent${agentOpen ? ' on' : ''}`}
                      onClick={() => { setAgentOpen(p => !p); setProfileOpen(false); }}
                    >
                      {/* bot icon */}
                      <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="8" width="18" height="12" rx="3"/><path d="M9 8V6a3 3 0 016 0v2"/><circle cx="9" cy="14" r="1.2" fill="currentColor"/><circle cx="15" cy="14" r="1.2" fill="currentColor"/>
                      </svg>
                      {selectedAgent ? selectedAgent.label : 'Agent'}
                      <svg className={`nb-chevron${agentOpen ? ' on' : ''}`} width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6"/>
                      </svg>
                    </button>

                    {agentOpen && (
                      <div className="nb-drop" style={{ minWidth:220 }}>
                        {/* header label */}
                        <div style={{ padding:'8px 10px 6px', borderBottom:'1px solid rgba(240,184,73,0.1)', marginBottom:4 }}>
                          <span style={{ fontFamily:"'DM Mono',monospace", fontSize:'9px', color:'rgba(240,184,73,0.4)', letterSpacing:'0.14em', textTransform:'uppercase' }}>
                            select agent
                          </span>
                        </div>

                        {AGENTS.map(ag => (
                          <button key={ag.id} className={`nb-agent-row${selectedAgent?.id === ag.id ? ' selected' : ''}`} onClick={() => { setSelectedAgent(ag); setAgentOpen(false); router.push(`/${ag.id}-agent`); }}>
                            <div className="nb-agent-icon">{ag.icon}</div>
                            <div style={{flex:1}}>
                              <span className="nb-agent-label">{ag.label}</span>
                              <span className="nb-agent-sub">{ag.sub}</span>
                            </div>
                            {selectedAgent?.id === ag.id && (
                              <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="#f0b849" strokeWidth="2.5" style={{flexShrink:0}}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                              </svg>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Profile avatar */}
                  <div ref={profileRef} style={{ position:'relative' }}>
                    <div
                      className={`nb-avatar${profileOpen ? ' on' : ''}`}
                      style={{ position:'relative' }}
                      onClick={() => { setProfileOpen(p => !p); setAgentOpen(false); }}
                    >
                      {getInitials(user.name)}
                      <span className="nb-online" />
                    </div>

                    {profileOpen && (
                      <div className="nb-drop">
                        {/* user info header */}
                        <div className="nb-ph">
                          <div className="nb-ph-name">{user.name}</div>
                          <div className="nb-ph-email">{user.email}</div>
                        </div>

                        <button className="nb-row">
                          <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                          Profile
                        </button>
                        <button className="nb-row">
                          <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><circle cx="12" cy="12" r="3"/></svg>
                          Settings
                        </button>

                        <div className="nb-sep" />

                        <button className="nb-row red" onClick={handleLogout}>
                          <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
                          Sign out
                        </button>
                      </div>
                    )}
                  </div>

                </div>
              )}
            </div>

            {/* Mobile hamburger */}
            <div className="md:hidden">
              <button onClick={() => setMobileOpen(!mobileOpen)} className="text-gray-300 hover:text-white focus:outline-none" aria-label="Toggle menu">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  {mobileOpen
                    ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* ── Mobile menu ── */}
        {mobileOpen && (
          <div className="md:hidden bg-[#0a0a1a] border-t border-gray-800">
            <div className="px-6 py-4 space-y-3">
              {navLinks.map(([href, label]) => (
                <Link key={href} href={href}
                  className={`block text-base font-medium ${pathname === href ? 'text-[#f0b849]' : 'text-gray-300 hover:text-white'}`}
                  onClick={() => setMobileOpen(false)}>
                  {label}
                </Link>
              ))}

              {!user ? (
                <button
                  onClick={(e) => { setMobileOpen(false); handleLoginClick(e as any); }}
                  className="block w-full mt-4 border border-[#f0b849] text-[#f0b849] font-semibold px-6 py-3 rounded-full text-center transition-all duration-300 hover:bg-[#f0b849] hover:text-[#0a0a1a]">
                  Login
                </button>
              ) : (
                <>
                  <div style={{ paddingTop:8, borderTop:'1px solid rgba(240,184,73,0.12)', marginTop:8 }}>
                    <div style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color:'rgba(240,184,73,0.5)', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:10 }}>
                      Agents
                    </div>
                    {AGENTS.map(ag => (
                      <button key={ag.id} className="nb-agent-row" style={{ marginBottom:4 }} onClick={() => setMobileOpen(false)}>
                        <div className="nb-agent-icon">{ag.icon}</div>
                        <div>
                          <span className="nb-agent-label">{ag.label}</span>
                          <span className="nb-agent-sub">{ag.sub}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                  <button className="nb-row red" style={{ marginTop:8 }} onClick={() => { setMobileOpen(false); handleLogout(); }}>
                    <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
                    Sign out
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      <LoginModal
        isOpen={loginOpen}
        onClose={() => setLoginOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </>
  );
};

export default Navbar;