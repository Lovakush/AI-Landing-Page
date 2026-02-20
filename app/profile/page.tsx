'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Edit, Mail, Shield, Bell, Palette,
  CreditCard, User,
  Download, Trash2, Eye, EyeOff,
  RefreshCw, Terminal, Wifi, WifiOff, Copy, CheckCircle,
} from 'lucide-react';

// ======================== API CONFIG ========================
const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://sia-backend.onrender.com';

// ── reads 'access_token' (matches what LoginModal now saves) ──
async function apiFetch(path: string, options: RequestInit = {}) {
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`${res.status}: ${body}`);
  }
  return res.json();
}

async function refreshToken(): Promise<string | null> {
  const refresh =
    typeof window !== 'undefined' ? localStorage.getItem('refresh_token') : null;
  if (!refresh) return null;
  try {
    const data = await apiFetch('/api/auth/refresh/', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refresh }),
    });
    const newToken = data.data?.access_token ?? data.access_token ?? data.access ?? null;
    if (newToken) localStorage.setItem('access_token', newToken);
    return newToken;
  } catch {
    return null;
  }
}

// ======================== DESIGN TOKENS ========================
const T = {
  bg:       '#07060F',
  sidebar:  '#0B0A18',
  card:     'rgba(240,184,73,0.04)',
  border:   'rgba(240,184,73,0.1)',
  gold:     '#f0b849',
  green:    '#4ade80',
  purple:   '#a78bfa',
  cyan:     '#22d3ee',
  red:      '#f87171',
  text:     '#f0ead8',
  textSec:  'rgba(200,185,150,0.75)',
  textMut:  'rgba(200,185,150,0.38)',
  mono:     "'DM Mono', monospace",
  greenDim: 'rgba(74,222,128,0.1)',
};

function Mono(s: React.CSSProperties): React.CSSProperties {
  return { fontFamily: T.mono, ...s };
}

// ======================== TYPES ========================
export type SettingsSection =
  'profile' | 'notifications' | 'appearance' | 'privacy' | 'billing' | 'api';

interface UserProfile { first_name: string; last_name: string; email: string; role?: string; }
interface AgentAccess {
  hr: boolean; marketing: boolean;
  hr_subscription?:         { plan: string; renews: string; status: string };
  marketing_subscription?:  { plan: string; renews: string; status: string };
}
interface AgentStatus {
  mark?: { status: string; active: boolean };
  hr?:   { status: string; active: boolean };
}

// ======================== SMALL COMPONENTS ========================
function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <div onClick={() => onChange(!on)} style={{
      width: 36, height: 20, borderRadius: 10, cursor: 'pointer', position: 'relative', flexShrink: 0,
      background: on ? `linear-gradient(90deg,${T.gold},#f5d070)` : 'rgba(255,255,255,0.08)',
      border: `1px solid ${on ? T.gold : 'rgba(255,255,255,0.12)'}`,
      transition: 'all 0.2s',
    }}>
      <div style={{
        position: 'absolute', top: 2, left: on ? 17 : 2, width: 14, height: 14,
        borderRadius: 7, background: on ? '#0a0a1a' : 'rgba(255,255,255,0.4)',
        transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
      }} />
    </div>
  );
}

function StatCard({
  label, value, sub, badge, color, loading,
}: {
  label: string; value: string; sub?: string; badge?: string; color?: string; loading?: boolean;
}) {
  return (
    <div style={{ padding: '14px 16px', borderRadius: 12, border: `1px solid ${T.border}`, background: T.card }}>
      <div style={Mono({ fontSize: 9, color: T.textMut, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 6 })}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={Mono({ fontSize: 18, fontWeight: 700, color: loading ? T.textMut : (color ?? T.text) })}>
          {loading ? '···' : value}
        </span>
        {badge && !loading && (
          <span style={Mono({ fontSize: 7, padding: '1px 5px', borderRadius: 3, background: T.greenDim, color: T.green, border: `1px solid rgba(74,222,128,0.2)`, letterSpacing: '0.1em' })}>
            {badge}
          </span>
        )}
      </div>
      {sub && <div style={Mono({ fontSize: 9, color: T.textMut, marginTop: 3 })}>{loading ? '···' : sub}</div>}
    </div>
  );
}

function SectionDivider({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '18px 0 12px' }}>
      <div style={{ height: 1, flex: 1, background: T.border }} />
      <span style={Mono({ fontSize: 8.5, color: T.textMut, letterSpacing: '0.18em', textTransform: 'uppercase' })}>{children}</span>
      <div style={{ height: 1, flex: 1, background: T.border }} />
    </div>
  );
}

function CardBox({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ borderRadius: 12, border: `1px solid ${T.border}`, background: T.card, overflow: 'hidden' }}>
      {children}
    </div>
  );
}

function Row({
  title, desc, children, noBorder,
}: {
  title: string; desc?: string; children?: React.ReactNode; noBorder?: boolean;
}) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '13px 16px', borderBottom: noBorder ? 'none' : `1px solid ${T.border}`,
      gap: 16,
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, color: T.textSec, marginBottom: desc ? 2 : 0 }}>{title}</div>
        {desc && <div style={Mono({ fontSize: 9, color: T.textMut })}>{desc}</div>}
      </div>
      {children}
    </div>
  );
}

function GoldBtn({
  children, onClick, disabled,
}: {
  children: React.ReactNode; onClick?: () => void; disabled?: boolean;
}) {
  return (
    <button onClick={onClick} disabled={disabled} style={Mono({
      padding: '8px 16px', borderRadius: 8, border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
      background: disabled ? 'rgba(240,184,73,0.25)' : `linear-gradient(135deg,#e8a835,#f5d070)`,
      color: '#0a0a1a', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
      textTransform: 'uppercase', display: 'inline-flex', alignItems: 'center', gap: 5,
      opacity: disabled ? 0.6 : 1,
    })}>
      {children}
    </button>
  );
}

function GhostBtn({
  children, onClick, danger,
}: {
  children: React.ReactNode; onClick?: () => void; danger?: boolean;
}) {
  const c = danger ? T.red : T.textMut;
  return (
    <button onClick={onClick} style={Mono({
      padding: '7px 14px', borderRadius: 8, border: `1px solid ${c}40`, background: 'transparent',
      color: c, fontSize: 9.5, letterSpacing: '0.08em', textTransform: 'uppercase',
      cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 5, transition: 'all 0.15s',
    })}>
      {children}
    </button>
  );
}

function StatusDot({ active }: { active?: boolean }) {
  return (
    <div style={{
      width: 8, height: 8, borderRadius: 4, flexShrink: 0,
      background: active ? T.green : 'rgba(255,255,255,0.12)',
      boxShadow: active ? `0 0 6px ${T.green}` : 'none',
    }} />
  );
}

function ApiMethodTag({ method }: { method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' }) {
  const map: Record<string, string> = {
    GET: T.green, POST: T.gold, PUT: T.purple, DELETE: T.red, PATCH: T.cyan,
  };
  const c = map[method] ?? T.textMut;
  return (
    <span style={Mono({
      fontSize: 8, padding: '2px 7px', borderRadius: 4, fontWeight: 700,
      letterSpacing: '0.07em', color: c, background: `${c}18`,
      border: `1px solid ${c}35`, flexShrink: 0,
    })}>{method}</span>
  );
}

function SaveBar({ onSave }: { onSave?: () => Promise<void> }) {
  const [st, setSt] = useState<'idle' | 'saving' | 'done'>('idle');
  const save = async () => {
    setSt('saving');
    try { await onSave?.(); } catch {}
    setSt('done');
    setTimeout(() => setSt('idle'), 2200);
  };
  return (
    <div style={{
      display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 10,
      marginTop: 26, paddingTop: 18, borderTop: `1px solid ${T.border}`,
    }}>
      <GhostBtn>Discard</GhostBtn>
      <GoldBtn onClick={save} disabled={st === 'saving'}>
        {st === 'saving' ? <>Saving…</> : st === 'done' ? <>✓ Saved</> : 'Save Changes'}
      </GoldBtn>
    </div>
  );
}

// ======================== PROFILE SECTION ========================
function ProfileSection({
  profile, setProfile, access, agentStatus, apiOnline, loading,
}: {
  profile: UserProfile; setProfile: (p: UserProfile) => void;
  access: AgentAccess; agentStatus: AgentStatus; apiOnline: boolean; loading: boolean;
}) {
  const [editMode, setEditMode] = useState(false);
  const [buf, setBuf] = useState(profile);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setBuf(profile); }, [profile]);

  const initials =
    `${profile.first_name?.[0] ?? ''}${profile.last_name?.[0] ?? ''}`.toUpperCase() || '?';
  const fullName = `${profile.first_name} ${profile.last_name}`.trim() || 'User';

  const saveProfile = async () => {
    try {
      await apiFetch('/api/auth/profile/update/', {
        method: 'PUT',
        body: JSON.stringify({ first_name: buf.first_name, last_name: buf.last_name }),
      });
    } catch { /* optimistic */ }
    setProfile(buf);
    setEditMode(false);
  };

  return (
    <div style={{ animation: 's-fadeUp 0.35s ease both' }}>
      <style>{`
        @keyframes s-fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes s-flow   { 0%{background-position:200% 50%} 100%{background-position:-200% 50%} }
        @keyframes s-scan   { from{top:0} to{top:100%} }
        .s-spinner { display:inline-block;width:14px;height:14px;border:2px solid rgba(240,184,73,0.2);border-top-color:${T.gold};border-radius:50%;animation:spin 0.7s linear infinite;vertical-align:middle }
        @keyframes spin { to{transform:rotate(360deg)} }
        .s-plan-card { transition: box-shadow 0.2s; }
        .s-plan-card:hover { box-shadow: 0 0 20px rgba(240,184,73,0.08); }
      `}</style>

      {/* ── Hero card ── */}
      <div style={{
        borderRadius: 14, border: `1px solid rgba(240,184,73,0.16)`,
        background: 'rgba(240,184,73,0.025)', padding: '24px 28px', marginBottom: 22,
        position: 'relative', overflow: 'hidden', boxShadow: '0 0 30px rgba(240,184,73,0.07)',
      }}>
        <div style={{
          position: 'absolute', inset: -1, borderRadius: 14,
          background: 'linear-gradient(90deg,transparent,rgba(240,184,73,0.4) 40%,rgba(245,208,112,0.7) 50%,rgba(240,184,73,0.4) 60%,transparent)',
          backgroundSize: '300% 100%', animation: 's-flow 4.5s linear infinite',
          WebkitMask: 'linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor', maskComposite: 'exclude', padding: 1, pointerEvents: 'none',
        }} />

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 22 }}>
          {/* Avatar */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div onClick={() => fileRef.current?.click()} style={{
              width: 76, height: 76, borderRadius: 14,
              background: 'linear-gradient(135deg,rgba(240,184,73,0.14),rgba(240,184,73,0.06))',
              border: '1px solid rgba(240,184,73,0.32)', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', position: 'relative', overflow: 'hidden',
            }}>
              {loading
                ? <span className="s-spinner" />
                : <span style={Mono({ fontSize: 24, fontWeight: 600, color: T.gold, letterSpacing: '-0.02em' })}>{initials}</span>}
              <div style={{
                position: 'absolute', left: 0, right: 0, height: 1.5,
                background: 'linear-gradient(90deg,transparent,rgba(240,184,73,0.9) 40%,rgba(245,208,112,1) 50%,rgba(240,184,73,0.9) 60%,transparent)',
                animation: 's-scan 3s linear infinite', pointerEvents: 'none', zIndex: 2,
              }} />
            </div>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} />
          </div>

          {/* Info */}
          <div style={{ flex: 1 }}>
            {editMode ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input value={buf.first_name} onChange={e => setBuf(p => ({ ...p, first_name: e.target.value }))}
                    placeholder="First name"
                    style={Mono({ flex: 1, padding: '7px 10px', borderRadius: 8, background: 'rgba(240,184,73,0.06)', border: `1px solid rgba(240,184,73,0.25)`, color: T.text, fontSize: 13 })} />
                  <input value={buf.last_name} onChange={e => setBuf(p => ({ ...p, last_name: e.target.value }))}
                    placeholder="Last name"
                    style={Mono({ flex: 1, padding: '7px 10px', borderRadius: 8, background: 'rgba(240,184,73,0.06)', border: `1px solid rgba(240,184,73,0.25)`, color: T.text, fontSize: 13 })} />
                </div>
              </div>
            ) : (
              <>
                <div style={Mono({ fontSize: 18, fontWeight: 700, color: T.text, marginBottom: 3 })}>
                  {loading ? '···' : fullName}
                </div>
                <div style={Mono({ fontSize: 11, color: T.textMut, marginBottom: 6 })}>
                  {loading ? '···' : (profile.role ?? '—')}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <Mail size={11} color={T.textMut} />
                  <span style={Mono({ fontSize: 10.5, color: 'rgba(240,184,73,0.52)' })}>
                    {loading ? '···' : profile.email}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
                  {apiOnline ? <Wifi size={10} color={T.green} /> : <WifiOff size={10} color={T.textMut} />}
                  <span style={Mono({ fontSize: 8.5, color: apiOnline ? 'rgba(74,222,128,0.6)' : T.textMut, letterSpacing: '0.06em' })}>
                    {apiOnline ? `Live · ${BASE_URL}` : 'Demo mode · API offline'}
                  </span>
                </div>
              </>
            )}
          </div>

          <button
            onClick={() => { if (editMode) { saveProfile(); } else { setBuf(profile); setEditMode(true); } }}
            style={Mono({
              padding: '8px 17px', borderRadius: 8, border: `1px solid rgba(240,184,73,0.3)`,
              background: 'rgba(240,184,73,0.07)', color: T.gold, fontSize: 9.5,
              letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer',
              transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 6,
            })}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(240,184,73,0.15)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(240,184,73,0.07)'; }}>
            <Edit size={11} /> {editMode ? 'Save' : 'Edit'}
          </button>
        </div>
      </div>

      {/* Metrics */}
      <SectionDivider>Performance Metrics</SectionDivider>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 22 }}>
        <StatCard label="Documents Processed" value="1,284" sub="+12 this week" color={T.gold} loading={loading} />
        <StatCard
          label="Agents Used"
          value={`${[access.hr, access.marketing].filter(Boolean).length}`}
          sub={[access.hr && 'HR', access.marketing && 'Marketing'].filter(Boolean).join(' · ') || '—'}
          color={T.cyan} loading={loading}
        />
        <StatCard
          label="HR Agent"
          value={access.hr_subscription?.plan ?? (access.hr ? 'Active' : 'No Access')}
          badge={access.hr ? (access.hr_subscription?.status ?? 'ACTIVE') : undefined}
          sub={access.hr ? `Renews ${access.hr_subscription?.renews ?? '—'}` : 'Not subscribed'}
          color={T.green} loading={loading}
        />
        <StatCard
          label="Marketing Agent"
          value={access.marketing_subscription?.plan ?? (access.marketing ? 'Active' : 'No Access')}
          badge={access.marketing ? (access.marketing_subscription?.status ?? 'ACTIVE') : undefined}
          sub={access.marketing ? `Renews ${access.marketing_subscription?.renews ?? '—'}` : 'Not subscribed'}
          color={T.purple} loading={loading}
        />
      </div>

      {/* Live agent status */}
      <SectionDivider>Live Agent Status</SectionDivider>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 22 }}>
        {([['hr', 'HR Agent', '#f0b849'] as const, ['mark', 'Marketing Agent', '#a78bfa'] as const]).map(([key, label, color]) => {
          const st = agentStatus[key as keyof AgentStatus];
          return (
            <div key={key} style={{
              padding: '14px 16px', borderRadius: 11, border: `1px solid ${color}22`,
              background: `${color}06`, display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <StatusDot active={loading ? false : st?.active} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11.5, color: T.textSec }}>{label}</div>
                <div style={Mono({ fontSize: 9, color: st?.active ? T.green : T.textMut, letterSpacing: '0.08em', marginTop: 2 })}>
                  {loading ? '···' : (st?.status ?? 'UNKNOWN')}
                </div>
              </div>
              <div style={Mono({ fontSize: 8.5, color: `${color}55` })}>
                /api/.../agents/{key}/
              </div>
            </div>
          );
        })}
      </div>

      {/* API Endpoints */}
      <SectionDivider>API Endpoints — Profile</SectionDivider>
      <CardBox>
        {[
          { m: 'GET' as const, path: '/api/auth/profile/',          desc: 'Fetch user profile data' },
          { m: 'PUT' as const, path: '/api/auth/profile/update/',   desc: 'Update first_name, last_name' },
          { m: 'GET' as const, path: '/api/auth/access/',           desc: 'Check agent subscriptions' },
          { m: 'GET' as const, path: '/api/auth/session/validate/', desc: 'Validate current session token' },
        ].map((ep, i, arr) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
            borderBottom: i < arr.length - 1 ? `1px solid ${T.border}` : 'none',
          }}>
            <ApiMethodTag method={ep.m} />
            <span style={Mono({ fontSize: 10, color: 'rgba(240,184,73,0.55)', flex: 1 })}>{ep.path}</span>
            <span style={Mono({ fontSize: 9, color: T.textMut })}>{ep.desc}</span>
          </div>
        ))}
      </CardBox>
    </div>
  );
}

// ======================== NOTIFICATIONS SECTION ========================
function NotificationsSection() {
  const [n, setN] = useState({
    agentCompleted: true, agentError: true, weeklyReport: true,
    leadAlert: false, docProcessed: true, systemUpdates: false,
    emailDigest: true, slackPush: false, smsCritical: false,
  });
  const set = (k: keyof typeof n) => (v: boolean) => setN(p => ({ ...p, [k]: v }));

  return (
    <div style={{ animation: 's-fadeUp 0.35s ease both' }}>
      <SectionDivider>Agent Activity</SectionDivider>
      <CardBox>
        {[
          { k: 'agentCompleted', t: 'Task Completed',   d: 'When any agent finishes' },
          { k: 'agentError',     t: 'Agent Error',      d: 'Critical failures' },
          { k: 'leadAlert',      t: 'Lead Alerts',      d: 'High-intent signals from MARK' },
          { k: 'docProcessed',   t: 'Document Processed', d: 'HR Agent file analysis complete' },
        ].map((r, ri, arr) => (
          <Row key={r.k} title={r.t} desc={r.d} noBorder={ri === arr.length - 1}>
            <Toggle on={n[r.k as keyof typeof n]} onChange={set(r.k as keyof typeof n)} />
          </Row>
        ))}
      </CardBox>
      <SectionDivider>Reports &amp; Digests</SectionDivider>
      <CardBox>
        {[
          { k: 'weeklyReport',   t: 'Weekly Performance Report', d: 'Every Monday 09:00' },
          { k: 'systemUpdates',  t: 'System Updates',            d: 'Platform changes and API upgrades' },
        ].map((r, ri, arr) => (
          <Row key={r.k} title={r.t} desc={r.d} noBorder={ri === arr.length - 1}>
            <Toggle on={n[r.k as keyof typeof n]} onChange={set(r.k as keyof typeof n)} />
          </Row>
        ))}
      </CardBox>
      <SectionDivider>Delivery Channels</SectionDivider>
      <CardBox>
        {[
          { k: 'emailDigest', t: 'Email Digest', d: 'Sent to profile email' },
          { k: 'slackPush',   t: 'Slack Push',   d: '#sia-notifications channel' },
          { k: 'smsCritical', t: 'SMS — Critical', d: 'Agent errors only' },
        ].map((r, ri, arr) => (
          <Row key={r.k} title={r.t} desc={r.d} noBorder={ri === arr.length - 1}>
            <Toggle on={n[r.k as keyof typeof n]} onChange={set(r.k as keyof typeof n)} />
          </Row>
        ))}
      </CardBox>
      <SaveBar onSave={async () => { await new Promise(r => setTimeout(r, 600)); }} />
    </div>
  );
}

// ======================== APPEARANCE SECTION ========================
function AppearanceSection() {
  const [theme,     setTheme]     = useState<'dark' | 'darker' | 'terminal'>('darker');
  const [density,   setDensity]   = useState<'compact' | 'default' | 'spacious'>('default');
  const [fontSize,  setFontSize]  = useState(13);
  const [animations, setAnimations] = useState(true);
  const [scanlines,  setScanlines]  = useState(false);
  const [gridOverlay, setGridOverlay] = useState(false);

  return (
    <div style={{ animation: 's-fadeUp 0.35s ease both' }}>
      <SectionDivider>Theme</SectionDivider>
      <CardBox>
        <Row title="Color Theme" desc="Terminal background palette">
          <div style={{ display: 'flex', gap: 6 }}>
            {(['dark', 'darker', 'terminal'] as const).map(d => (
              <button key={d} onClick={() => setTheme(d)} style={Mono({
                padding: '5px 10px', borderRadius: 7, fontSize: 9, letterSpacing: '0.06em',
                border: `1px solid ${theme === d ? T.gold : T.border}`,
                background: theme === d ? 'rgba(240,184,73,0.12)' : 'transparent',
                color: theme === d ? T.gold : T.textMut, cursor: 'pointer', transition: 'all 0.15s',
              })}>{d}</button>
            ))}
          </div>
        </Row>
        <Row title="Density" desc="Interface spacing">
          <div style={{ display: 'flex', gap: 6 }}>
            {(['compact', 'default', 'spacious'] as const).map(d => (
              <button key={d} onClick={() => setDensity(d)} style={Mono({
                padding: '5px 10px', borderRadius: 7, fontSize: 9, letterSpacing: '0.06em',
                border: `1px solid ${density === d ? T.gold : T.border}`,
                background: density === d ? 'rgba(240,184,73,0.12)' : 'transparent',
                color: density === d ? T.gold : T.textMut, cursor: 'pointer', transition: 'all 0.15s',
              })}>{d}</button>
            ))}
          </div>
        </Row>
        <Row title="Base Font Size" desc={`Terminal mono size: ${fontSize}px`}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button onClick={() => setFontSize(f => Math.max(10, f - 1))} style={Mono({ width: 28, height: 28, borderRadius: 7, border: `1px solid ${T.border}`, background: 'transparent', color: T.textSec, cursor: 'pointer', fontSize: 16 })}>−</button>
            <span style={Mono({ color: T.gold, fontSize: 13, width: 26, textAlign: 'center' })}>{fontSize}</span>
            <button onClick={() => setFontSize(f => Math.min(18, f + 1))} style={Mono({ width: 28, height: 28, borderRadius: 7, border: `1px solid ${T.border}`, background: 'transparent', color: T.textSec, cursor: 'pointer', fontSize: 16 })}>+</button>
          </div>
        </Row>
        <Row title="Motion &amp; Animations" desc="Smooth transitions, pulse effects"><Toggle on={animations} onChange={setAnimations} /></Row>
        <Row title="CRT Scanlines" desc="Retro terminal overlay effect"><Toggle on={scanlines} onChange={setScanlines} /></Row>
        <Row title="Grid Overlay" desc="Subtle background grid pattern" noBorder><Toggle on={gridOverlay} onChange={setGridOverlay} /></Row>
      </CardBox>
      <SaveBar onSave={async () => { await new Promise(r => setTimeout(r, 700)); }} />
    </div>
  );
}

// ======================== PRIVACY SECTION ========================
function PrivacySection() {
  const [twoFA,   setTwoFA]   = useState(false);
  const [pub,     setPub]     = useState(true);
  const [log,     setLog]     = useState(true);
  const [sharing, setSharing] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [copied,  setCopied]  = useState(false);

  const apiKey = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  const apiKeyDisplay = apiKey
    ? (showKey ? apiKey.slice(0, 60) + '…' : `${apiKey.slice(0, 8)}${'•'.repeat(20)}${apiKey.slice(-8)}`)
    : '— not logged in —';

  const copyKey = () => {
    if (apiKey) {
      navigator.clipboard.writeText(apiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  };

  return (
    <div style={{ animation: 's-fadeUp 0.35s ease both' }}>
      <SectionDivider>Security</SectionDivider>
      <CardBox>
        <Row title="Two-Factor Authentication" desc="TOTP app or SMS"><Toggle on={twoFA} onChange={setTwoFA} /></Row>
        <Row title="Public Profile" desc="Other agents can see your profile"><Toggle on={pub} onChange={setPub} /></Row>
        <Row title="Activity Logging" desc="Log all agent interactions"><Toggle on={log} onChange={setLog} /></Row>
        <Row title="Data Sharing" desc="Share anonymised usage for product improvement" noBorder><Toggle on={sharing} onChange={setSharing} /></Row>
      </CardBox>

      <SectionDivider>Access Token (JWT)</SectionDivider>
      <CardBox>
        <Row title="Current Session Token" desc="Bearer token for API calls">
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={() => setShowKey(v => !v)} style={Mono({ background: 'none', border: `1px solid ${T.border}`, borderRadius: 7, padding: '5px 9px', color: T.textMut, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 9 })}>
              {showKey ? <EyeOff size={10} /> : <Eye size={10} />} {showKey ? 'Hide' : 'Show'}
            </button>
            <button onClick={copyKey} style={Mono({ background: 'none', border: `1px solid ${T.border}`, borderRadius: 7, padding: '5px 9px', color: copied ? T.green : T.textMut, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 9 })}>
              {copied ? <><CheckCircle size={10} /> Copied</> : <><Copy size={10} /> Copy</>}
            </button>
          </div>
        </Row>
        <div style={{ padding: '10px 16px', borderTop: `1px solid ${T.border}` }}>
          <div style={Mono({ fontSize: 9, color: T.textMut, wordBreak: 'break-all', lineHeight: 1.6 })}>
            {apiKeyDisplay}
          </div>
        </div>
      </CardBox>

      {/* Danger zone */}
      <div style={{ borderRadius: 12, border: '1px solid rgba(248,113,113,0.2)', background: 'rgba(248,113,113,0.04)', padding: 18, marginTop: 22 }}>
        <SectionDivider>Danger Zone</SectionDivider>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <div style={{ fontSize: 12, color: T.textSec, marginBottom: 3 }}>Delete Account</div>
            <div style={Mono({ fontSize: 9.5, color: T.textMut })}>Permanently delete your account and all data.</div>
          </div>
          <GhostBtn danger><Trash2 size={11} /> Delete</GhostBtn>
        </div>
      </div>
    </div>
  );
}

// ======================== BILLING SECTION ========================
function BillingSection({ access, loading }: { access: AgentAccess; loading: boolean }) {
  const PLANS = [
    { id: 'starter', name: 'Starter', price: '$0',   sub: '/mo', features: ['1 Agent', '100 docs/mo', 'Community support'], color: T.textMut },
    { id: 'pro',     name: 'Pro',     price: '$12',  sub: '/mo', features: ['3 Agents', '5,000 docs/mo', 'Priority support', 'API access'], color: T.gold, active: true },
    { id: 'team',    name: 'Team',    price: '$49',  sub: '/mo', features: ['Unlimited agents', 'Unlimited docs', 'Dedicated support', 'SSO + SAML'], color: T.cyan },
  ];
  const INVOICES = [
    { date: 'Feb 1, 2026', id: 'INV-2026-002', amount: '$12.00' },
    { date: 'Jan 1, 2026', id: 'INV-2026-001', amount: '$12.00' },
    { date: 'Dec 1, 2025', id: 'INV-2025-012', amount: '$12.00' },
  ];
  const activeAgents = [access.hr, access.marketing].filter(Boolean).length;

  return (
    <div style={{ animation: 's-fadeUp 0.35s ease both' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 22 }}>
        <StatCard label="Current Plan" value="Pro" color={T.gold} loading={loading} />
        <StatCard label="Monthly Cost" value="$12" sub="Renews Mar 1, 2026" color={T.cyan} loading={loading} />
        <StatCard label="Docs / Month" value="1,284" sub="of 5,000 limit" color={T.green} loading={loading} />
        <StatCard
          label="Active Agents"
          value={loading ? '···' : `${activeAgents}/3`}
          sub={[access.hr && 'HR', access.marketing && 'Marketing'].filter(Boolean).join(' · ') || '—'}
          color={T.purple} loading={loading}
        />
      </div>

      <SectionDivider>Plans</SectionDivider>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 22 }}>
        {PLANS.map(p => (
          <div key={p.id} className="s-plan-card" style={{
            borderRadius: 14, padding: 20, border: `1px solid ${p.active ? p.color + '45' : T.border}`,
            background: p.active ? `${p.color}07` : T.card, position: 'relative',
          }}>
            {p.active && (
              <div style={Mono({
                position: 'absolute', top: 10, right: 12, fontSize: 7,
                padding: '2px 6px', borderRadius: 4, background: `${p.color}20`,
                color: p.color, border: `1px solid ${p.color}35`, letterSpacing: '0.1em',
              })}>CURRENT</div>
            )}
            <div style={Mono({ fontSize: 11, fontWeight: 700, color: p.color, marginBottom: 6 })}>{p.name}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 3, marginBottom: 14 }}>
              <span style={Mono({ fontSize: 22, fontWeight: 700, color: T.text })}>{p.price}</span>
              <span style={Mono({ fontSize: 10, color: T.textMut })}>{p.sub}</span>
            </div>
            {p.features.map(f => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 7 }}>
                <div style={{ width: 5, height: 5, borderRadius: 2, background: p.color, flexShrink: 0 }} />
                <span style={Mono({ fontSize: 10, color: T.textSec })}>{f}</span>
              </div>
            ))}
            {!p.active && (
              <button style={Mono({
                width: '100%', marginTop: 14, padding: '8px', borderRadius: 8,
                border: `1px solid ${p.color}35`, background: `${p.color}08`,
                color: p.color, fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer',
              })}>Upgrade →</button>
            )}
          </div>
        ))}
      </div>

      <SectionDivider>Invoice History</SectionDivider>
      <CardBox>
        {INVOICES.map((inv, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
            borderBottom: i < INVOICES.length - 1 ? `1px solid ${T.border}` : 'none',
          }}>
            <div style={{ flex: 1 }}>
              <div style={Mono({ fontSize: 11.5, color: T.textSec, fontWeight: 600 })}>{inv.date}</div>
              <div style={Mono({ fontSize: 9, color: T.textMut, marginTop: 2 })}>{inv.id} · Pro Plan</div>
            </div>
            <span style={Mono({ fontSize: 14, fontWeight: 600, color: T.text })}>{inv.amount}</span>
            <span style={Mono({ fontSize: 8, padding: '2px 7px', borderRadius: 4, background: T.greenDim, color: T.green, border: `1px solid rgba(74,222,128,0.28)`, letterSpacing: '0.1em' })}>PAID</span>
            <button style={Mono({ background: 'none', border: 'none', cursor: 'pointer', color: T.gold, fontSize: 9, fontWeight: 700 })}>PDF ↓</button>
          </div>
        ))}
      </CardBox>
    </div>
  );
}

// ======================== API EXPLORER SECTION ========================
function ApiExplorerSection() {
  const [copied, setCopied] = useState<string | null>(null);

  const copy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 1800);
  };

  const ENDPOINT_GROUPS = [
    {
      section: 'Authentication', color: T.gold, items: [
        { m: 'POST' as const, path: '/api/auth/register/', body: '{ email, password, first_name, last_name }', desc: 'Create new user account' },
        { m: 'POST' as const, path: '/api/auth/login/',   body: '{ email, password }',                        desc: 'Returns access_token + refresh_token' },
        { m: 'POST' as const, path: '/api/auth/refresh/', body: '{ refresh_token }',                          desc: 'Refresh expired access token' },
        { m: 'POST' as const, path: '/api/auth/logout/',  body: 'Bearer token required',                      desc: 'Revoke current session' },
        { m: 'GET'  as const, path: '/api/auth/profile/', body: 'Bearer token required',                      desc: 'Get user profile data' },
        { m: 'PUT'  as const, path: '/api/auth/profile/update/', body: '{ first_name, last_name }',           desc: 'Update profile fields' },
        { m: 'GET'  as const, path: '/api/auth/access/',  body: 'Bearer token required',                      desc: 'Check agent subscriptions' },
        { m: 'GET'  as const, path: '/api/auth/session/validate/', body: 'Bearer token required',             desc: 'Validate session token' },
      ],
    },
    {
      section: 'Chatbot (Public)', color: T.cyan, items: [
        { m: 'POST' as const, path: '/api/chat/',                    body: '{ message, session_id }',           desc: 'Send chat message' },
        { m: 'GET'  as const, path: '/api/chat/session/{id}/',       body: '—',                                 desc: 'Get session info' },
        { m: 'POST' as const, path: '/api/chat/session/reset/',      body: '{ session_id }',                    desc: 'Reset chat session' },
        { m: 'POST' as const, path: '/api/chat/session/close/',      body: '{ session_id }',                    desc: 'Close and delete session' },
      ],
    },
    {
      section: 'Agent Proxy (Auth Required)', color: T.purple, items: [
        { m: 'POST' as const, path: '/api/tenants/v2/agents/mark/chat/', body: '{ message, session_id }',       desc: 'Chat with Marketing Agent' },
        { m: 'POST' as const, path: '/api/tenants/v2/agents/hr/chat/',   body: '{ message, session_id }',       desc: 'Chat with HR Agent' },
        { m: 'GET'  as const, path: '/api/tenants/v2/agents/status/',    body: 'Bearer token required',         desc: 'Check agent status' },
      ],
    },
    {
      section: 'Waitlist', color: T.green, items: [
        { m: 'POST' as const, path: '/api/waitlist/join/', body: '{ email }', desc: 'Join product waitlist' },
        { m: 'GET'  as const, path: '/api/waitlist/stats/', body: '—',        desc: 'Get waitlist count' },
      ],
    },
  ];

  return (
    <div style={{ animation: 's-fadeUp 0.35s ease both' }}>
      {ENDPOINT_GROUPS.map((grp, gi) => (
        <div key={gi} style={{ marginBottom: 22 }}>
          <SectionDivider>{grp.section}</SectionDivider>
          <CardBox>
            {grp.items.map((ep, ei) => (
              <div key={ei} style={{
                padding: '12px 16px',
                borderBottom: ei < grp.items.length - 1 ? `1px solid ${T.border}` : 'none',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 5 }}>
                  <ApiMethodTag method={ep.m} />
                  <span style={Mono({ fontSize: 10.5, color: 'rgba(240,184,73,0.6)', flex: 1 })}>{ep.path}</span>
                  <button
                    onClick={() => copy(`${BASE_URL}${ep.path}`, `${gi}-${ei}`)}
                    style={Mono({ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 9, color: copied === `${gi}-${ei}` ? T.green : T.textMut, transition: 'color .15s' })}>
                    {copied === `${gi}-${ei}` ? <><CheckCircle size={10} /> Copied</> : <><Copy size={10} /> Copy</>}
                  </button>
                </div>
                <div style={{ display: 'flex', gap: 16 }}>
                  <span style={Mono({ fontSize: 9, color: T.textMut })}>{ep.desc}</span>
                  <span style={Mono({ fontSize: 9, color: 'rgba(34,211,238,0.45)', marginLeft: 'auto' })}>body: {ep.body}</span>
                </div>
              </div>
            ))}
          </CardBox>
        </div>
      ))}
    </div>
  );
}

// ======================== NAV ========================
const S_NAV: { id: SettingsSection; label: string; sub: string; Icon: typeof User }[] = [
  { id: 'profile',       label: 'Profile',      sub: 'Identity & agents', Icon: User       },
  { id: 'notifications', label: 'Alerts',       sub: 'Events & channels', Icon: Bell       },
  { id: 'appearance',    label: 'Appearance',   sub: 'Theme & display',   Icon: Palette    },
  { id: 'privacy',       label: 'Privacy',      sub: 'Security & keys',   Icon: Shield     },
  { id: 'billing',       label: 'Billing',      sub: 'Plans & invoices',  Icon: CreditCard },
  { id: 'api',           label: 'API Explorer', sub: 'All endpoints',     Icon: Terminal   },
];

// ======================== MAIN EXPORT ========================
export default function SettingsPage({ onBack }: { onBack?: () => void }) {
  const [active, setActive]     = useState<SettingsSection>('profile');

  // ── no hardcoded dummy data — start empty, load from API ──
  const [profile, setProfile]   = useState<UserProfile>({ first_name: '', last_name: '', email: '', role: '' });
  const [access,  setAccess]    = useState<AgentAccess>({ hr: false, marketing: false });
  const [agentStatus, setAgentStatus] = useState<AgentStatus>({ mark: { status: 'UNKNOWN', active: false }, hr: { status: 'UNKNOWN', active: false } });
  const [apiOnline, setApiOnline]     = useState(false);
  const [loading,   setLoading]       = useState(true);
  const [apiError,  setApiError]      = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setApiError(null);
    try {
      const [pRes, aRes, sRes] = await Promise.all([
        apiFetch('/api/auth/profile/'),
        apiFetch('/api/auth/access/'),
        apiFetch('/api/tenants/v2/agents/status/'),
      ]);

      // Backend wraps responses in { success: true, data: {...} }
      const p = pRes.data ?? pRes;
      const a = aRes.data ?? aRes;
      const s = sRes.data ?? sRes;

      setProfile({
        first_name: p.first_name ?? '',
        last_name:  p.last_name  ?? '',
        email:      p.email      ?? '',
        role:       p.role       ?? '',
      });

      setAccess({
        hr:        a.hr        ?? a.has_hr      ?? a.can_access_hr   ?? false,
        marketing: a.marketing ?? a.has_marketing ?? a.can_access_mark ?? false,
        hr_subscription:        a.hr_subscription        ?? (a.hr        ? { plan: 'Pro', renews: '—', status: 'ACTIVE' } : undefined),
        marketing_subscription: a.marketing_subscription ?? (a.marketing ? { plan: 'Pro', renews: '—', status: 'ACTIVE' } : undefined),
      });

      setAgentStatus({
        mark: s.mark ?? { status: s.marketing_status ?? 'Unknown', active: s.marketing_active ?? false },
        hr:   s.hr   ?? { status: s.hr_status        ?? 'Unknown', active: s.hr_active        ?? false },
      });

      setApiOnline(true);
    } catch (e: any) {
      const msg = e?.message ?? '';
      // Auto-refresh on 401
      if (msg.includes('401')) {
        const newToken = await refreshToken();
        if (newToken) { loadAll(); return; }
      }
      setApiError(msg || 'Network error');
      setApiOnline(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const SECTIONS: Record<SettingsSection, React.ReactElement> = {
    profile:       <ProfileSection profile={profile} setProfile={setProfile} access={access} agentStatus={agentStatus} apiOnline={apiOnline} loading={loading} />,
    notifications: <NotificationsSection />,
    appearance:    <AppearanceSection />,
    privacy:       <PrivacySection />,
    billing:       <BillingSection access={access} loading={loading} />,
    api:           <ApiExplorerSection />,
  };

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden', fontFamily: T.mono, background: T.bg, ...(onBack ? {} : { minHeight: '100vh' }) }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500;600&display=swap');
        @keyframes s-fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes s-flow { 0%{background-position:200% 50%} 100%{background-position:-200% 50%} }
        @keyframes s-scan { from{top:0} to{top:100%} }
        @keyframes spin { to{transform:rotate(360deg)} }
        .s-spinner { display:inline-block;width:14px;height:14px;border:2px solid rgba(240,184,73,0.2);border-top-color:${T.gold};border-radius:50%;animation:spin 0.7s linear infinite;vertical-align:middle }
        .s-plan-card { transition: box-shadow 0.2s; }
        .s-plan-card:hover { box-shadow: 0 0 20px rgba(240,184,73,0.08); }
        .s-nav-item { transition: all 0.15s; }
        .s-nav-item:hover { background: rgba(240,184,73,0.06) !important; }
      `}</style>

      {/* ── Sidebar ── */}
      <div style={{ width: 200, flexShrink: 0, background: T.sidebar, borderRight: `1px solid ${T.border}`, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {onBack && (
          <button onClick={onBack} style={Mono({
            display: 'flex', alignItems: 'center', gap: 7, padding: '14px 16px',
            borderBottom: `1px solid ${T.border}`, background: 'none', border: 'none',
            cursor: 'pointer', color: T.textMut, fontSize: 9.5, letterSpacing: '0.1em', textTransform: 'uppercase',
          })}>
            ← Back
          </button>
        )}
        <div style={{ padding: '16px 14px 8px', flex: 1, overflowY: 'auto' }}>
          <div style={Mono({ fontSize: 8, color: T.textMut, letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 12, paddingLeft: 4 })}>Settings</div>
          {S_NAV.map(({ id, label, sub, Icon }) => {
            const isActive = active === id;
            return (
              <div
                key={id}
                className="s-nav-item"
                onClick={() => setActive(id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px',
                  borderRadius: 10, cursor: 'pointer', marginBottom: 3,
                  background: isActive ? 'rgba(240,184,73,0.09)' : 'transparent',
                  border: `1px solid ${isActive ? 'rgba(240,184,73,0.22)' : 'transparent'}`,
                }}>
                <Icon size={14} color={isActive ? T.gold : T.textMut} />
                <div>
                  <div style={Mono({ fontSize: 11, color: isActive ? T.gold : T.textSec, fontWeight: isActive ? 600 : 400 })}>{label}</div>
                  <div style={Mono({ fontSize: 8, color: T.textMut })}>{sub}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* API status indicator */}
        <div style={{ padding: '12px 14px', borderTop: `1px solid ${T.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: 3, background: apiOnline ? T.green : T.textMut, boxShadow: apiOnline ? `0 0 6px ${T.green}` : 'none' }} />
            <span style={Mono({ fontSize: 8, color: T.textMut, letterSpacing: '0.08em' })}>
              {loading ? 'Loading…' : apiOnline ? 'API Online' : 'API Offline'}
            </span>
            <button onClick={loadAll} style={Mono({ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: T.textMut, padding: 2 })}>
              <RefreshCw size={10} />
            </button>
          </div>
          {apiError && (
            <div style={Mono({ fontSize: 8, color: T.red, marginTop: 4, lineHeight: 1.4 })}>{apiError}</div>
          )}
        </div>
      </div>

      {/* ── Main content ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
        <div style={{ maxWidth: 780 }}>
          {SECTIONS[active]}
        </div>
      </div>
    </div>
  );
}