'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import {
  fetchProfile, updateProfile, fetchAgentStatus,
  isAuthenticated, refreshAccessToken, clearAuth, apiFetch,
  type UserProfile, type AgentStatus,
} from '@/lib/api';

// ── design tokens ─────────────────────────────────────────
const T = {
  bg:      '#07060F',
  card:    'rgba(240,184,73,0.04)',
  border:  'rgba(240,184,73,0.10)',
  gold:    '#f0b849',
  green:   '#4ade80',
  purple:  '#a78bfa',
  cyan:    '#22d3ee',
  red:     '#f87171',
  text:    '#f0ead8',
  textSec: 'rgba(200,185,150,0.75)',
  textMut: 'rgba(200,185,150,0.38)',
  mono:    "'DM Mono', monospace",
};
function M(s: React.CSSProperties): React.CSSProperties {
  return { fontFamily: T.mono, ...s };
}

// ── small helpers ─────────────────────────────────────────
function initials(name: string) {
  return (name || '?')
    .split(' ')
    .filter(Boolean)
    .map((w: string) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function Chip({ label, color, dim }: { label: string; color: string; dim: string }) {
  return (
    <span style={M({
      fontSize: 8, padding: '2px 8px', borderRadius: 4, fontWeight: 700,
      letterSpacing: '0.1em', color, background: dim,
      border: `1px solid ${color}35`,
    })}>{label}</span>
  );
}

function AgentCard({
  name, desc, has, href, color,
}: {
  name: string; desc: string; has: boolean; href: string; color: string;
}) {
  return (
    <div style={{
      borderRadius: 14, border: `1px solid ${has ? color + '30' : T.border}`,
      background: has ? `${color}06` : T.card, padding: '20px 22px',
      display: 'flex', flexDirection: 'column', gap: 10,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: has ? color : T.textSec }}>{name}</div>
        <div style={{
          width: 8, height: 8, borderRadius: 4,
          background: has ? T.green : T.textMut,
          boxShadow: has ? `0 0 6px ${T.green}` : 'none',
        }} />
      </div>
      <div style={M({ fontSize: 10, color: T.textMut, lineHeight: 1.55 })}>{desc}</div>
      {has ? (
        <Link href={href} style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '8px 14px', borderRadius: 8,
          background: `linear-gradient(135deg,${color}18,${color}08)`,
          border: `1px solid ${color}35`,
          color, textDecoration: 'none',
          ...M({ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.08em' }),
        }}>
          → Open Agent
        </Link>
      ) : (
        <div style={M({ fontSize: 9.5, color: T.textMut })}>Contact your admin for access.</div>
      )}
    </div>
  );
}

// ── main component ─────────────────────────────────────────
export default function ProfilePage() {
  const router = useRouter();

  const [profile, setProfile]     = useState<UserProfile | null>(null);
  const [agents, setAgents]       = useState<AgentStatus | null>(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [editMode, setEditMode]   = useState(false);
  const [fullName, setFullName]   = useState('');
  const [phone, setPhone]         = useState('');
  const [saving, setSaving]       = useState(false);
  const [saveMsg, setSaveMsg]     = useState('');
  const [loggingOut, setLoggingOut] = useState(false);

  const load = useCallback(async () => {
    if (!isAuthenticated()) {
      router.replace('/');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [p, a] = await Promise.all([
        fetchProfile(),
        fetchAgentStatus().catch(() => null),
      ]);
      setProfile(p);
      if (a) setAgents(a);
      setFullName(p.full_name ?? '');
      setPhone(p.phone ?? '');
    } catch (e: any) {
      const msg = e?.message ?? '';
      if (msg.includes('401')) {
        const t = await refreshAccessToken();
        if (t) { load(); return; }
        router.replace('/');
        return;
      }
      setError(msg || 'Failed to load profile.');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    setSaving(true);
    try {
      const updated = await updateProfile({ full_name: fullName, phone: phone || undefined });
      setProfile(updated);
      setEditMode(false);
      setSaveMsg('Saved!');
      setTimeout(() => setSaveMsg(''), 2000);
    } catch (e: any) {
      setSaveMsg(e?.message ?? 'Save failed');
    }
    setSaving(false);
  };

  const ini = initials(profile?.full_name ?? '');

  const handleLogout = async () => {
    setLoggingOut(true);
    try { await apiFetch('/api/auth/logout/', { method: 'POST' }); } catch {}
    clearAuth();
    router.replace('/');
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500;600&display=swap');
        @keyframes pr-fadeUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pr-scan   { from{top:0} to{top:100%} }
        @keyframes pr-pulse  { 0%,100%{opacity:0.3} 50%{opacity:0.7} }
        @keyframes pr-spin   { to{transform:rotate(360deg)} }
        @keyframes pr-grid   { 0%,100%{opacity:0.025} 50%{opacity:0.06} }
        .pr-spinner {
          display:inline-block;width:16px;height:16px;
          border:2px solid rgba(240,184,73,0.15);border-top-color:${T.gold};
          border-radius:50%;animation:pr-spin 0.7s linear infinite;
        }
        .pr-input {
          width:100%;padding:9px 12px;border-radius:8px;box-sizing:border-box;
          background:rgba(240,184,73,0.04);border:1px solid rgba(240,184,73,0.18);
          color:${T.text};font-family:${T.mono};font-size:12px;
          outline:none;transition:border-color 0.15s;
        }
        .pr-input:focus { border-color:rgba(240,184,73,0.5); }
        .pr-input::placeholder { color:${T.textMut}; }
        .pr-btn {
          padding:9px 18px;border-radius:8px;border:none;cursor:pointer;
          font-family:${T.mono};font-size:10px;font-weight:700;
          letter-spacing:0.08em;text-transform:uppercase;
          background:linear-gradient(135deg,#e8a835,#f5d070);color:#0a0a1a;
          transition:box-shadow 0.2s,transform 0.1s;
        }
        .pr-btn:hover { box-shadow:0 4px 18px rgba(240,184,73,0.3);transform:translateY(-1px); }
        .pr-btn:disabled { opacity:0.5;cursor:not-allowed; }
        .pr-ghost {
          padding:8px 14px;border-radius:8px;cursor:pointer;
          font-family:${T.mono};font-size:10px;letter-spacing:0.07em;text-transform:uppercase;
          background:transparent;border:1px solid rgba(240,184,73,0.15);color:${T.textMut};
          transition:all 0.15s;
        }
        .pr-ghost:hover { border-color:rgba(240,184,73,0.3);color:${T.textSec}; }
        
        /* RESPONSIVE DESIGN */
        .pr-container { max-width: 860px; padding: 100px 24px 80px; }
        .pr-hero { display: flex; align-items: flex-start; gap: 28px; }
        .pr-avatar { width: 88px; height: 88px; flex-shrink: 0; }
        .pr-info { flex: 1; }
        .pr-agents-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .pr-actions { display: flex; gap: 10px; flex-wrap: wrap; }
        
        /* Tablet: 640px - 1024px */
        @media (max-width: 1024px) {
          .pr-container { padding: 80px 20px 60px; }
          .pr-hero { gap: 20px; }
          .pr-avatar { width: 80px; height: 80px; }
        }
        
        /* Mobile: < 640px */
        @media (max-width: 639px) {
          .pr-container { 
            max-width: 100%; 
            padding: 80px 16px 60px; 
            margin: 0 auto;
          }
          .pr-hero { 
            flex-direction: column; 
            align-items: center;
            text-align: center;
            gap: 16px; 
          }
          .pr-avatar { 
            width: 72px; 
            height: 72px; 
            flex-shrink: 0; 
          }
          .pr-info { 
            flex: 1; 
            width: 100%;
          }
          .pr-agents-grid { 
            grid-template-columns: 1fr;
            gap: 12px; 
          }
          .pr-actions { 
            flex-direction: column;
            gap: 8px;
          }
          .pr-actions > * {
            width: 100% !important;
            text-align: center;
            display: block;
          }
        }
      `}</style>

      <div style={{ minHeight: '100vh', background: T.bg, fontFamily: T.mono }}>
        <Navbar />

        {/* Subtle grid */}
        <div style={{
          position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
          backgroundImage: 'linear-gradient(rgba(240,184,73,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(240,184,73,0.03) 1px,transparent 1px)',
          backgroundSize: '60px 60px', animation: 'pr-grid 6s ease-in-out infinite',
        }} />

        <div className="pr-container" style={{ margin: '0 auto', position: 'relative', zIndex: 1 }}>

          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '40px 0', justifyContent: 'center', color: T.textMut }}>
              <span className="pr-spinner" />
              <span style={M({ fontSize: 11 })}>Loading profile…</span>
            </div>
          )}

          {error && !loading && (
            <div style={{ padding: '16px 20px', borderRadius: 10, background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.2)', color: T.red, marginBottom: 20 }}>
              <span style={M({ fontSize: 11 })}>⚠ {error}</span>
            </div>
          )}

          {profile && !loading && (
            <>
              {/* Profile hero */}
              <div style={{
                borderRadius: 18, border: '1px solid rgba(240,184,73,0.15)',
                background: 'rgba(240,184,73,0.025)', padding: '32px 36px',
                marginBottom: 24, position: 'relative', overflow: 'hidden',
                boxShadow: '0 0 40px rgba(240,184,73,0.05)',
                animation: 'pr-fadeUp 0.4s ease both',
              }}>
                {/* shimmer border */}
                <div style={{
                  position: 'absolute', inset: -1, borderRadius: 18, pointerEvents: 'none',
                  background: 'linear-gradient(90deg,transparent,rgba(240,184,73,0.35) 40%,rgba(245,208,112,0.65) 50%,rgba(240,184,73,0.35) 60%,transparent)',
                  backgroundSize: '300% 100%', animation: 'pr-scan 5s linear infinite',
                  WebkitMask: 'linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0)',
                  WebkitMaskComposite: 'xor', maskComposite: 'exclude', padding: 1,
                }} />

                <div className="pr-hero" style={{ display: 'flex', alignItems: 'flex-start', gap: 28 }}>
                  {/* Avatar */}
                  <div className="pr-avatar" style={{
                    width: 88, height: 88, borderRadius: 16, flexShrink: 0,
                    background: 'linear-gradient(135deg,rgba(240,184,73,0.16),rgba(240,184,73,0.06))',
                    border: '1px solid rgba(240,184,73,0.35)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    position: 'relative', overflow: 'hidden',
                  }}>
                    <span style={{ fontSize: 28, fontWeight: 700, color: T.gold, letterSpacing: '-0.02em' }}>{ini}</span>
                    <div style={{
                      position: 'absolute', left: 0, right: 0, height: 1.5,
                      background: 'linear-gradient(90deg,transparent,rgba(240,184,73,0.9),transparent)',
                      animation: 'pr-scan 3s linear infinite', pointerEvents: 'none',
                    }} />
                  </div>

                  {/* Info */}
                  <div className="pr-info" style={{ flex: 1 }}>
                    {editMode ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <input
                          className="pr-input"
                          value={fullName}
                          onChange={e => setFullName(e.target.value)}
                          placeholder="Full name"
                        />
                        <input
                          className="pr-input"
                          value={phone}
                          onChange={e => setPhone(e.target.value)}
                          placeholder="Phone (optional)"
                        />
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button className="pr-btn" onClick={save} disabled={saving}>
                            {saving ? 'Saving…' : '→ Save'}
                          </button>
                          <button className="pr-ghost" onClick={() => {
                            setEditMode(false);
                            setFullName(profile.full_name ?? '');
                            setPhone(profile.phone ?? '');
                          }}>
                            Cancel
                          </button>
                        </div>
                        {saveMsg && <div style={M({ fontSize: 10, color: T.green })}>{saveMsg}</div>}
                      </div>
                    ) : (
                      <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                          <span style={{ fontSize: 22, fontWeight: 700, color: T.text }}>{profile.full_name || 'User'}</span>
                          {profile.role === 'super_admin' && (
                            <Chip label="SUPER ADMIN" color={T.gold} dim="rgba(240,184,73,0.12)" />
                          )}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 14 }}>
                          <div style={M({ fontSize: 11, color: 'rgba(240,184,73,0.52)' })}>✉ {profile.email}</div>
                          {profile.phone && (
                            <div style={M({ fontSize: 11, color: 'rgba(240,184,73,0.52)' })}>📱 {profile.phone}</div>
                          )}
                        </div>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <Chip label={profile.is_active ? 'ACTIVE' : 'INACTIVE'} color={profile.is_active ? T.green : T.red} dim={profile.is_active ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.1)'} />
                          <Chip label={profile.email_confirmed ? 'VERIFIED' : 'UNVERIFIED'} color={profile.email_confirmed ? T.cyan : T.textMut} dim="rgba(34,211,238,0.08)" />
                          {saveMsg && <span style={M({ fontSize: 10, color: T.green })}>{saveMsg}</span>}
                        </div>
                      </>
                    )}
                  </div>

                  {!editMode && (
                    <button
                      onClick={() => setEditMode(true)}
                      style={M({
                        padding: '9px 18px', borderRadius: 9,
                        border: '1px solid rgba(240,184,73,0.25)',
                        background: 'rgba(240,184,73,0.07)',
                        color: T.gold, fontSize: 9.5, letterSpacing: '0.1em',
                        textTransform: 'uppercase', cursor: 'pointer',
                      })}>
                      ✎ Edit
                    </button>
                  )}
                </div>
              </div>

              {/* Agent access */}
              <div style={{ marginBottom: 24, animation: 'pr-fadeUp 0.4s ease 0.1s both' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <div style={{ height: 1, flex: 1, background: T.border }} />
                  <span style={M({ fontSize: 8.5, color: T.textMut, letterSpacing: '0.18em', textTransform: 'uppercase' })}>Your Agents</span>
                  <div style={{ height: 1, flex: 1, background: T.border }} />
                </div>
                <div className="pr-agents-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <AgentCard
                    name="Marketing Agent (MARK)"
                    desc="AI-powered marketing automation, content generation, and campaign intelligence."
                    has={agents?.can_access_mark ?? profile.can_access_mark}
                    href="/agents/mark"
                    color={T.purple}
                  />
                  <AgentCard
                    name="HR Agent"
                    desc="Recruitment automation, document analysis, and people operations intelligence."
                    has={agents?.can_access_hr ?? profile.can_access_hr}
                    href="/hr-agent"
                    color={T.green}
                  />
                </div>
              </div>

              {/* Organisation */}
              {profile.tenant && (
                <div style={{ animation: 'pr-fadeUp 0.4s ease 0.2s both' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                    <div style={{ height: 1, flex: 1, background: T.border }} />
                    <span style={M({ fontSize: 8.5, color: T.textMut, letterSpacing: '0.18em', textTransform: 'uppercase' })}>Organisation</span>
                    <div style={{ height: 1, flex: 1, background: T.border }} />
                  </div>
                  <div style={{ borderRadius: 14, border: `1px solid ${T.border}`, background: T.card, overflow: 'hidden' }}>
                    {[
                      { label: 'Company', value: profile.tenant.name },
                      { label: 'Subscription', value: profile.tenant.subscription_type.toUpperCase() },
                      { label: 'Status', value: profile.tenant.subscription_status.toUpperCase() },
                    ].map((row, i, arr) => (
                      <div key={i} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '13px 18px',
                        borderBottom: i < arr.length - 1 ? `1px solid ${T.border}` : 'none',
                      }}>
                        <span style={M({ fontSize: 11, color: T.textMut })}>{row.label}</span>
                        <span style={M({ fontSize: 11, color: T.textSec, fontWeight: 600 })}>{row.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick links + Logout */}
              <div className="pr-actions" style={{ marginTop: 24, display: 'flex', gap: 10, flexWrap: 'wrap', animation: 'pr-fadeUp 0.4s ease 0.3s both' }}>
                <Link href="/platform" style={{
                  padding: '10px 20px', borderRadius: 9,
                  border: '1px solid rgba(139,92,246,0.2)',
                  background: 'rgba(139,92,246,0.05)',
                  color: T.purple, textDecoration: 'none',
                  ...M({ fontSize: 10, letterSpacing: '0.08em' }),
                }}>
                  ⬡ Dashboard
                </Link>
                <Link href="/settings" style={{
                  padding: '10px 20px', borderRadius: 9,
                  border: '1px solid rgba(240,184,73,0.18)',
                  background: 'rgba(240,184,73,0.05)',
                  color: T.gold, textDecoration: 'none',
                  ...M({ fontSize: 10, letterSpacing: '0.08em' }),
                }}>
                  ⚙ Settings
                </Link>
                {profile.role === 'super_admin' && (
                  <Link href="/admin" style={{
                    padding: '10px 20px', borderRadius: 9,
                    border: '1px solid rgba(240,184,73,0.35)',
                    background: 'rgba(240,184,73,0.1)',
                    color: T.gold, textDecoration: 'none',
                    ...M({ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em' }),
                  }}>
                    🛡 Admin Portal
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  style={{
                    padding: '10px 20px', borderRadius: 9, cursor: loggingOut ? 'not-allowed' : 'pointer',
                    border: '1px solid rgba(248,113,113,0.25)',
                    background: 'rgba(248,113,113,0.05)',
                    ...M({ fontSize: 10, letterSpacing: '0.08em', color: T.red }),
                  }}>
                  {loggingOut ? '···' : '→ Sign Out'}
                </button>
              </div>
            </>
          )}
        </div>

        <Footer />
      </div>
    </>
  );
}
