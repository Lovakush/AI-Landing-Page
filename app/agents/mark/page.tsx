'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import {
  isAuthenticated, chatWithAgent, fetchProfile, redirectToMarkAgent,
  refreshAccessToken, type UserProfile,
} from '@/lib/api';

// ── design tokens ─────────────────────────────────────────
const T = {
  bg:      '#07060F',
  bgCard:  '#0D0B1E',
  border:  'rgba(167,139,250,0.15)',
  purple:  '#a78bfa',
  purpleDim: 'rgba(167,139,250,0.12)',
  gold:    '#f0b849',
  green:   '#4ade80',
  red:     '#f87171',
  text:    '#f0ead8',
  textSec: 'rgba(200,185,150,0.75)',
  textMut: 'rgba(200,185,150,0.38)',
  mono:    "'DM Mono', monospace",
};
function M(s: React.CSSProperties): React.CSSProperties {
  return { fontFamily: T.mono, ...s };
}

interface Message {
  id: string;
  role: 'user' | 'agent';
  content: string;
  ts: number;
}

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// ── typing dots ───────────────────────────────────────────
function TypingDots() {
  return (
    <div style={{ display: 'flex', gap: 4, alignItems: 'center', padding: '4px 0' }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: 6, height: 6, borderRadius: 3, background: T.purple,
          animation: `mark-dot 1.2s ease-in-out ${i * 0.18}s infinite`,
        }} />
      ))}
    </div>
  );
}

// ── message bubble ────────────────────────────────────────
function Bubble({ msg }: { msg: Message }) {
  const isUser = msg.role === 'user';
  return (
    <div style={{
      display: 'flex', flexDirection: isUser ? 'row-reverse' : 'row',
      alignItems: 'flex-end', gap: 10, marginBottom: 14,
      animation: 'mark-slideIn 0.3s ease both',
    }}>
      {/* Avatar */}
      {!isUser && (
        <div style={{
          width: 32, height: 32, borderRadius: 10, flexShrink: 0,
          background: T.purpleDim, border: `1px solid rgba(167,139,250,0.3)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14,
        }}>
          🎯
        </div>
      )}

      <div className="mark-message" style={{ maxWidth: '74%' }}>
        <div style={{
          padding: '11px 15px', borderRadius: isUser ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
          background: isUser
            ? 'linear-gradient(135deg,rgba(240,184,73,0.15),rgba(240,184,73,0.08))'
            : 'rgba(167,139,250,0.08)',
          border: `1px solid ${isUser ? 'rgba(240,184,73,0.25)' : 'rgba(167,139,250,0.18)'}`,
          lineHeight: 1.6,
        }}>
          <div style={M({ fontSize: 12.5, color: isUser ? T.gold : T.textSec, whiteSpace: 'pre-wrap', wordBreak: 'break-word' })}>
            {msg.content}
          </div>
        </div>
        <div style={M({ fontSize: 8.5, color: T.textMut, marginTop: 4, textAlign: isUser ? 'right' : 'left' })}>
          {formatTime(msg.ts)}
        </div>
      </div>
    </div>
  );
}

// ── suggestion chips ──────────────────────────────────────
const SUGGESTIONS = [
  'Write a LinkedIn post for our product launch',
  'Create a Q1 marketing campaign strategy',
  'Draft 5 email subject lines for our newsletter',
  'Analyse our target audience for SaaS B2B',
  'Create social media content calendar for this month',
  'Write a compelling product description',
];

export default function MarkAgentPage() {
  const router = useRouter();

  const [profile, setProfile]   = useState<UserProfile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput]       = useState('');
  const [sessionId, setSessionId] = useState<string>('');
  const [typing, setTyping]     = useState(false);
  const [loading, setLoading]   = useState(true);
  const [noAccess, setNoAccess] = useState(false);
  const [error, setError]       = useState('');
  const bottomRef               = useRef<HTMLDivElement>(null);
  const inputRef                = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  // Auth + access check + redirect to Mark frontend
  useEffect(() => {
    if (!isAuthenticated()) { 
      router.replace('/login?redirect=/agents/mark'); 
      return; 
    }
    
    fetchProfile()
      .then(p => {
        setProfile(p);
        if (!p.can_access_mark) {
          setNoAccess(true);
          setLoading(false);
        } else {
          // User has access - redirect to standalone Mark frontend
          redirectToMarkAgent();
          // Stop loading spinner after opening new tab
          setLoading(false);
        }
      })
      .catch(async (e: any) => {
        if (e?.message?.includes('401')) {
          const t = await refreshAccessToken();
          if (!t) { 
            router.replace('/login?redirect=/agents/mark'); 
            return; 
          }
        }
        setNoAccess(true);
        setLoading(false);
      });
  }, [router]);

  const send = useCallback(async (text: string) => {
    const msg = text.trim();
    if (!msg || typing) return;
    setInput('');
    setError('');

    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', content: msg, ts: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setTyping(true);

    try {
      const res = await chatWithAgent('mark', msg, sessionId || undefined);
      if (res.session_id) setSessionId(res.session_id);
      const agentMsg: Message = { id: crypto.randomUUID(), role: 'agent', content: res.response, ts: Date.now() };
      setMessages(prev => [...prev, agentMsg]);
    } catch (e: any) {
      const errMsg = e?.message?.includes('403')
        ? 'You do not have access to MARK agent. Contact your admin.'
        : e?.message?.includes('401')
          ? 'Session expired. Please log in again.'
          : 'Failed to reach MARK agent. Please try again.';
      setError(errMsg);
    } finally {
      setTyping(false);
    }
  }, [typing, sessionId]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  const initials = (profile?.full_name ?? '?')
    .split(' ')
    .filter(Boolean)
    .map((w: string) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500;600&display=swap');
        @keyframes mark-dot { 0%,60%,100%{transform:translateY(0);opacity:0.3} 30%{transform:translateY(-4px);opacity:1} }
        @keyframes mark-slideIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes mark-pulse { 0%,100%{opacity:0.3} 50%{opacity:0.8} }
        @keyframes mark-grid { 0%,100%{opacity:0.02} 50%{opacity:0.055} }
        @keyframes mark-spin { to{transform:rotate(360deg)} }
        .mark-spinner {
          width:18px;height:18px;border:2px solid rgba(167,139,250,0.2);
          border-top-color:${T.purple};border-radius:50%;
          animation:mark-spin 0.7s linear infinite;
        }
        .mark-input {
          flex:1;padding:12px 14px;border-radius:10px;resize:none;
          background:rgba(167,139,250,0.04);border:1px solid rgba(167,139,250,0.2);
          color:${T.text};font-family:${T.mono};font-size:13px;
          outline:none;transition:border-color 0.15s;line-height:1.5;
          max-height:160px;overflow-y:auto;
        }
        .mark-input:focus { border-color:rgba(167,139,250,0.45); }
        .mark-input::placeholder { color:${T.textMut}; }
        .mark-send {
          padding:12px 22px;border-radius:10px;border:none;cursor:pointer;
          background:linear-gradient(135deg,#7c3aed,#a78bfa);
          color:#fff;font-family:${T.mono};font-size:12px;font-weight:700;
          letter-spacing:0.08em;text-transform:uppercase;
          transition:box-shadow 0.2s,transform 0.1s;align-self:flex-end;
          white-space:nowrap;display:flex;align-items:center;justify-content:center;
        }
        .mark-send:hover { box-shadow:0 4px 18px rgba(139,92,246,0.4);transform:translateY(-1px); }
        .mark-send:disabled { opacity:0.45;cursor:not-allowed;transform:none;box-shadow:none; }
        .mark-send-text { display: inline; }
        .mark-send-icon { display: none; font-size: 16px; }
        .mark-chip {
          padding:7px 12px;border-radius:8px;border:1px solid rgba(167,139,250,0.2);
          background:rgba(167,139,250,0.06);color:${T.textSec};
          font-family:${T.mono};font-size:10px;cursor:pointer;
          transition:all 0.15s;white-space:nowrap;text-align:left;
        }
        .mark-chip:hover { background:rgba(167,139,250,0.12);border-color:rgba(167,139,250,0.35);color:${T.purple}; }
        .chat-scroll::-webkit-scrollbar { width:4px; }
        .chat-scroll::-webkit-scrollbar-track { background:transparent; }
        .chat-scroll::-webkit-scrollbar-thumb { background:rgba(167,139,250,0.2);border-radius:2px; }
        
        /* RESPONSIVE DESIGN */
        .mark-container { max-width: 900px; width: 100%; padding: 88px 24px 0; }
        .mark-header { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
        .mark-header-content { flex: 1; min-width: 200px; }
        .mark-message { max-width: 74%; }
        .mark-suggestions { display: flex; flex-wrap: wrap; gap: 7px; }
        .mark-input-group { display: flex; gap: 10px; align-items: flex-end; }
        
        /* Tablet: 640px - 1024px */
        @media (max-width: 1024px) {
          .mark-container { padding: 80px 20px 0; }
          .mark-header { gap: 12px; }
        }
        
        /* Mobile: < 640px */
        @media (max-width: 639px) {
          .mark-container { 
            max-width: 100%; 
            padding: 76px 12px 0; 
            margin: 0;
          }
          .mark-header { 
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }
          .mark-header-content { width: 100%; }
          .mark-header-info { flex-direction: column; gap: 6px !important; }
          .mark-message { max-width: 100% !important; }
          .mark-suggestions { gap: 5px; }
          .mark-chip {
            padding: 6px 10px !important;
            font-size: 9px !important;
            flex: 0 1 calc(50% - 3px);
          }
          .mark-input { width: 100% !important; }
          .mark-input-group { 
            flex-direction: row;
            align-items: flex-end;
            gap: 8px;
          }
          .mark-send { 
            width: 44px !important;
            padding: 12px !important;
            align-self: flex-end !important;
            flex-shrink: 0;
          }
          .mark-send-text { display: none !important; }
          .mark-send-icon { display: inline !important; }
          .mark-avatar { width: 40px !important; height: 40px !important; font-size: 18px !important; }
          .mark-user-avatar { display: none !important; }
        }
      `}</style>

      <div style={{ minHeight: '100vh', background: T.bg, display: 'flex', flexDirection: 'column' }}>
        <Navbar />

        {/* Background grid */}
        <div style={{
          position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
          backgroundImage: 'linear-gradient(rgba(167,139,250,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(167,139,250,0.03) 1px,transparent 1px)',
          backgroundSize: '60px 60px', animation: 'mark-grid 6s ease-in-out infinite',
        }} />

        <div className="mark-container" style={{ flex: 1, display: 'flex', flexDirection: 'column', margin: '0 auto', position: 'relative', zIndex: 1 }}>

          {/* Loading */}
          {loading && (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, color: T.textMut }}>
              <span className="mark-spinner" />
              <span style={M({ fontSize: 12 })}>Connecting to MARK…</span>
            </div>
          )}

          {/* No access */}
          {!loading && noAccess && (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
              <div style={{ textAlign: 'center', maxWidth: 400 }}>
                <div style={{ fontSize: 48, marginBottom: 20 }}>🔒</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: T.text, marginBottom: 10 }}>No Access</div>
                <div style={M({ fontSize: 12, color: T.textMut, lineHeight: 1.7, marginBottom: 24 })}>
                  You don't have access to the Marketing Agent (MARK). Contact your administrator to enable this subscription.
                </div>
                <Link href="/profile" style={{
                  display: 'inline-block', padding: '10px 22px', borderRadius: 9,
                  background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.25)',
                  color: T.purple, textDecoration: 'none',
                  ...M({ fontSize: 10, letterSpacing: '0.08em' }),
                }}>
                  → View Profile
                </Link>
              </div>
            </div>
          )}

          {/* Chat interface */}
          {!loading && !noAccess && (
            <>
              {/* Agent header */}
              <div className="mark-header" style={{
                display: 'flex', alignItems: 'center', gap: 16, padding: '20px 0 18px',
                borderBottom: `1px solid ${T.border}`, marginBottom: 0,
              }}>
                <div className="mark-avatar" style={{
                  width: 48, height: 48, borderRadius: 14, background: T.purpleDim,
                  border: '1px solid rgba(167,139,250,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
                  flexShrink: 0,
                }}>
                  🎯
                </div>
                <div className="mark-header-content" style={{ flex: 1 }}>
                  <div className="mark-header-info" style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 16, fontWeight: 700, color: T.text }}>MARK</span>
                    <span style={M({ fontSize: 8, padding: '2px 6px', borderRadius: 4, background: T.purpleDim, color: T.purple, fontWeight: 700, letterSpacing: '0.1em' })}>MARKETING AGENT</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <div style={{ width: 6, height: 6, borderRadius: 3, background: T.green, animation: 'mark-pulse 2s ease-in-out infinite' }} />
                      <span style={M({ fontSize: 8.5, color: T.green })}>Online</span>
                    </div>
                  </div>
                  <div style={M({ fontSize: 10, color: T.textMut, marginTop: 2 })}>
                    Marketing automation, content creation &amp; campaign intelligence
                  </div>
                </div>
                {sessionId && (
                  <div style={M({ fontSize: 8, color: T.textMut, textAlign: 'right' })}>
                    <div>Session</div>
                    <div style={{ color: T.purple }}>{sessionId.slice(0, 8)}…</div>
                  </div>
                )}
                <Link href="/profile" style={{
                  padding: '7px 12px', borderRadius: 8,
                  border: '1px solid rgba(167,139,250,0.15)', background: 'transparent',
                  color: T.textMut, textDecoration: 'none',
                  ...M({ fontSize: 9, letterSpacing: '0.06em' }),
                }}>
                  ← Back
                </Link>
              </div>

              {/* Messages area */}
              <div
                className="chat-scroll"
                style={{
                  flex: 1, overflowY: 'auto', padding: '24px 0',
                  display: 'flex', flexDirection: 'column',
                  minHeight: 0, maxHeight: 'calc(100vh - 340px)',
                }}
              >
                {/* Welcome message */}
                {messages.length === 0 && (
                  <div style={{ animation: 'mark-slideIn 0.4s ease' }}>
                    <Bubble msg={{
                      id: 'welcome',
                      role: 'agent',
                      content: `Hi ${profile?.full_name?.split(' ')[0] ?? 'there'}! I'm MARK, your Marketing Agent. I can help you with:\n\n• Content creation (posts, emails, copy)\n• Campaign strategy and planning\n• Audience analysis and targeting\n• Brand messaging and positioning\n\nWhat would you like to work on today?`,
                      ts: Date.now(),
                    }} />
                    {/* Suggestions */}
                    <div style={{ marginBottom: 20 }}>
                      <div style={M({ fontSize: 9, color: T.textMut, marginBottom: 10, letterSpacing: '0.1em', textTransform: 'uppercase' })}>Suggestions</div>
                      <div className="mark-suggestions" style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                        {SUGGESTIONS.map(s => (
                          <button key={s} className="mark-chip" onClick={() => send(s)}>{s}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Messages */}
                {messages.map(msg => <Bubble key={msg.id} msg={msg} />)}

                {/* Typing indicator */}
                {typing && (
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, marginBottom: 14 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                      background: T.purpleDim, border: '1px solid rgba(167,139,250,0.3)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
                    }}>🎯</div>
                    <div className="mark-message" style={{
                      padding: '11px 15px', borderRadius: '14px 14px 14px 4px',
                      background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.18)',
                    }}>
                      <TypingDots />
                    </div>
                  </div>
                )}

                <div ref={bottomRef} />
              </div>

              {/* Error */}
              {error && (
                <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.2)', marginBottom: 10 }}>
                  <span style={M({ fontSize: 11, color: T.red })}>⚠ {error}</span>
                </div>
              )}

              {/* Input area */}
              <div style={{ padding: '12px 0 24px', flexShrink: 0 }}>
                <div className="mark-input-group" style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
                  {/* User avatar */}
                  <div className="mark-user-avatar" style={{
                    width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                    background: 'rgba(240,184,73,0.1)', border: '1px solid rgba(240,184,73,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    ...M({ fontSize: 11, fontWeight: 600, color: T.gold }),
                  }}>
                    {initials}
                  </div>
                  <textarea
                    ref={inputRef}
                    className="mark-input"
                    rows={1}
                    placeholder="Message MARK… (Shift+Enter for new line)"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={typing}
                    onInput={e => {
                      const el = e.currentTarget;
                      el.style.height = 'auto';
                      el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
                    }}
                  />
                  <button
                    className="mark-send"
                    onClick={() => send(input)}
                    disabled={!input.trim() || typing}
                  >
                    <span className="mark-send-text">{typing ? '···' : '→ Send'}</span>
                    <span className="mark-send-icon">{typing ? '···' : '↑'}</span>
                  </button>
                </div>
                <div style={M({ fontSize: 9, color: T.textMut, marginTop: 8, textAlign: 'center' })}>
                  MARK is powered by AI — responses may vary. Review important content before publishing.
                </div>
              </div>
            </>
          )}
        </div>

        <Footer />
      </div>
    </>
  );
}
