'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Edit, Mail, Shield, Bell, Palette, Phone,
  CreditCard, User, Key,
  Eye, EyeOff,
  RefreshCw, Copy, CheckCircle,
  Trash2, LogOut, Bot,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  apiFetch, BASE_URL, refreshAccessToken, clearAuth,
  fetchProfile, updateProfile, fetchAgentStatus,
  type UserProfile as BackendUserProfile,
  type AgentStatus,
} from '@/lib/api';

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
  'profile' | 'notifications' | 'appearance' | 'privacy' | 'billing' | 'integration';

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
    <div className="s-stat-card" style={{ padding: '14px 16px', borderRadius: 12, border: `1px solid ${T.border}`, background: T.card }}>
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
    <div className="s-row" style={{
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
// DROP-IN REPLACEMENT for the ProfileSection function in settings/page.tsx
// Adds: avatar image upload, local preview, hover overlay, remove button

function ProfileSection({
  profile, setProfile, agentStatus, loading,
}: {
  profile: BackendUserProfile | null;
  setProfile: (p: BackendUserProfile) => void;
  agentStatus: AgentStatus | null;
  loading: boolean;
}) {
  const [editMode, setEditMode] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);

  // ── avatar state ──────────────────────────────────────────────────────────
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [avatarHover, setAvatarHover] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'done' | 'error'>('idle');
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setFullName(profile?.full_name ?? '');
    setPhone(profile?.phone ?? '');
    // If your backend returns an avatar URL: setAvatarUrl(profile?.avatar_url ?? null);
  }, [profile]);

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      if (avatarUrl?.startsWith('blob:')) URL.revokeObjectURL(avatarUrl);
    };
  }, [avatarUrl]);

  const initials = (profile?.full_name ?? '?')
    .split(' ')
    .filter(Boolean)
    .map((w: string) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?';

  // ── avatar handlers ───────────────────────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (avatarUrl?.startsWith('blob:')) URL.revokeObjectURL(avatarUrl);
    const url = URL.createObjectURL(file);
    setAvatarUrl(url);
    setPendingFile(file);
    e.target.value = ''; // allow re-selecting same file
  };

  const removeAvatar = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (avatarUrl?.startsWith('blob:')) URL.revokeObjectURL(avatarUrl);
    setAvatarUrl(null);
    setPendingFile(null);
  };

  /**
   * Upload avatar to your backend.
   * Replace this stub with your real API call, e.g.:
   *   const form = new FormData();
   *   form.append('avatar', file);
   *   const res = await apiFetch('/api/users/avatar/', { method: 'POST', body: form });
   *   return res.avatar_url;
   */
  const uploadAvatar = async (file: File): Promise<string | null> => {
    setUploadStatus('uploading');
    try {
      await new Promise(r => setTimeout(r, 900)); // ← replace with real call
      setUploadStatus('done');
      setTimeout(() => setUploadStatus('idle'), 2000);
      return URL.createObjectURL(file); // ← replace with server URL
    } catch {
      setUploadStatus('error');
      setTimeout(() => setUploadStatus('idle'), 2500);
      return null;
    }
  };

  // ── save profile ──────────────────────────────────────────────────────────
  const saveProfile = async () => {
    setSaving(true);
    try {
      if (pendingFile) {
        const finalUrl = await uploadAvatar(pendingFile);
        if (finalUrl) { setAvatarUrl(finalUrl); setPendingFile(null); }
      }
      const updated = await updateProfile({ full_name: fullName, phone: phone || undefined });
      setProfile(updated);
      setEditMode(false);
    } catch {
      setEditMode(false);
    }
    setSaving(false);
  };

  const canMark = agentStatus?.can_access_mark ?? profile?.can_access_mark ?? false;
  const canHR   = agentStatus?.can_access_hr   ?? profile?.can_access_hr   ?? false;
  const tenant  = agentStatus?.tenant ?? profile?.tenant;

  // upload status label
  const uploadLabel = { idle: '', uploading: 'Uploading…', done: '✓ Uploaded', error: '✗ Failed' };
  const uploadColor = { idle: T.textMut, uploading: T.gold, done: T.green, error: T.red };

  return (
    <div style={{ animation: 's-fadeUp 0.35s ease both' }}>
      <style>{`
        @keyframes s-fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes s-flow   { 0%{background-position:200% 50%} 100%{background-position:-200% 50%} }
        @keyframes s-scan   { from{top:0} to{top:100%} }
        .s-spinner { display:inline-block;width:14px;height:14px;border:2px solid rgba(240,184,73,0.2);border-top-color:${T.gold};border-radius:50%;animation:spin 0.7s linear infinite;vertical-align:middle }
        @keyframes spin { to{transform:rotate(360deg)} }
      `}</style>

      {/* Hero card */}
      <div style={{
        borderRadius: 14, border: `1px solid rgba(240,184,73,0.16)`,
        background: 'rgba(240,184,73,0.025)', padding: '24px 28px', marginBottom: 22,
        position: 'relative', overflow: 'hidden', boxShadow: '0 0 30px rgba(240,184,73,0.07)',
      }}>
        {/* Animated shimmer border */}
        <div style={{
          position: 'absolute', inset: -1, borderRadius: 14,
          background: 'linear-gradient(90deg,transparent,rgba(240,184,73,0.4) 40%,rgba(245,208,112,0.7) 50%,rgba(240,184,73,0.4) 60%,transparent)',
          backgroundSize: '300% 100%', animation: 's-flow 4.5s linear infinite',
          WebkitMask: 'linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor', maskComposite: 'exclude', padding: 1, pointerEvents: 'none',
        }} />

        <div className="s-user-hero" style={{ display: 'flex', alignItems: 'flex-start', gap: 22, flexWrap: 'wrap' }}>

          {/* ── Avatar picker ── */}
          <div className="s-user-avatar" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, flexShrink: 0 }}>
            <div style={{ position: 'relative' }}>
              {/* Main avatar tile */}
              <div
                onClick={() => fileRef.current?.click()}
                onMouseEnter={() => setAvatarHover(true)}
                onMouseLeave={() => setAvatarHover(false)}
                title="Click to upload photo"
                style={{
                  width: 76, height: 76, borderRadius: 14, cursor: 'pointer',
                  background: avatarUrl
                    ? 'transparent'
                    : 'linear-gradient(135deg,rgba(240,184,73,0.14),rgba(240,184,73,0.06))',
                  border: `1px solid ${avatarHover ? T.gold : 'rgba(240,184,73,0.32)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  position: 'relative', overflow: 'hidden',
                  transition: 'border-color 0.2s',
                  boxShadow: avatarHover ? `0 0 14px rgba(240,184,73,0.2)` : 'none',
                }}
              >
                {loading ? (
                  <span className="s-spinner" />
                ) : avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Avatar"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                ) : (
                  <span style={Mono({ fontSize: 24, fontWeight: 600, color: T.gold, letterSpacing: '-0.02em' })}>
                    {initials}
                  </span>
                )}

                {/* Scan line */}
                <div style={{
                  position: 'absolute', left: 0, right: 0, height: 1.5,
                  background: 'linear-gradient(90deg,transparent,rgba(240,184,73,0.9) 40%,rgba(245,208,112,1) 50%,rgba(240,184,73,0.9) 60%,transparent)',
                  animation: 's-scan 3s linear infinite', pointerEvents: 'none', zIndex: 2,
                }} />

                {/* Hover overlay */}
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'rgba(7,6,15,0.65)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3,
                  opacity: avatarHover ? 1 : 0, transition: 'opacity 0.18s', zIndex: 3,
                }}>
                  {/* Camera SVG icon (no extra import needed) */}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={T.gold} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                    <circle cx="12" cy="13" r="4"/>
                  </svg>
                  <span style={Mono({ fontSize: 7, color: T.gold, letterSpacing: '0.12em', textTransform: 'uppercase' })}>
                    {avatarUrl ? 'Change' : 'Upload'}
                  </span>
                </div>
              </div>

              {/* Remove button — only shown when photo exists */}
              {avatarUrl && (
                <button
                  onClick={removeAvatar}
                  title="Remove photo"
                  style={{
                    position: 'absolute', top: -6, right: -6,
                    width: 18, height: 18, borderRadius: 9,
                    border: `1px solid rgba(248,113,113,0.5)`,
                    background: '#1a0f0f', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: 0, zIndex: 10,
                  }}
                >
                  {/* × icon */}
                  <svg width="8" height="8" viewBox="0 0 10 10" fill="none" stroke={T.red} strokeWidth="2" strokeLinecap="round">
                    <line x1="1" y1="1" x2="9" y2="9"/><line x1="9" y1="1" x2="1" y2="9"/>
                  </svg>
                </button>
              )}
            </div>

            {/* Hidden file input */}
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />

            {/* Status text */}
            <span style={Mono({
              fontSize: 7.5, letterSpacing: '0.07em', textAlign: 'center', maxWidth: 80,
              color: uploadStatus !== 'idle' ? uploadColor[uploadStatus] : T.textMut,
            })}>
              {uploadStatus !== 'idle'
                ? uploadLabel[uploadStatus]
                : avatarUrl
                  ? (pendingFile ? 'Unsaved' : 'Photo set')
                  : 'No photo'}
            </span>
          </div>

          {/* Info / edit fields */}
          <div className="s-user-info" style={{ flex: 1, minWidth: 200 }}>
            {editMode ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <input
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="Full name"
                  style={Mono({ padding: '7px 10px', borderRadius: 8, background: 'rgba(240,184,73,0.06)', border: `1px solid rgba(240,184,73,0.25)`, color: T.text, fontSize: 13 })}
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Phone size={11} color={T.textMut} style={{ flexShrink: 0 }} />
                  <input
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="Phone (optional)"
                    style={Mono({ flex: 1, padding: '7px 10px', borderRadius: 8, background: 'rgba(240,184,73,0.06)', border: `1px solid rgba(240,184,73,0.25)`, color: T.text, fontSize: 13 })}
                  />
                </div>
              </div>
            ) : (
              <>
                <div style={Mono({ fontSize: 18, fontWeight: 700, color: T.text, marginBottom: 3 })}>
                  {loading ? '···' : (profile?.full_name || 'User')}
                </div>
                <div style={Mono({ fontSize: 11, color: T.textMut, marginBottom: 6 })}>
                  {loading ? '···' : (profile?.role === 'super_admin' ? 'Super Admin' : 'User')}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <Mail size={11} color={T.textMut} />
                    <span style={Mono({ fontSize: 10.5, color: 'rgba(240,184,73,0.52)' })}>
                      {loading ? '···' : profile?.email}
                    </span>
                  </div>
                  {profile?.phone && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <Phone size={11} color={T.textMut} />
                      <span style={Mono({ fontSize: 10.5, color: 'rgba(240,184,73,0.52)' })}>
                        {profile.phone}
                      </span>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Edit / Save / Cancel */}
          <div className="s-user-actions" style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
            <button
              onClick={() => { if (editMode) { saveProfile(); } else { setEditMode(true); } }}
              disabled={saving}
              style={Mono({
                padding: '8px 17px', borderRadius: 8, border: `1px solid rgba(240,184,73,0.3)`,
                background: 'rgba(240,184,73,0.07)', color: T.gold, fontSize: 9.5,
                letterSpacing: '0.1em', textTransform: 'uppercase', cursor: saving ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 6,
              })}>
              <Edit size={11} /> {saving ? 'Saving…' : editMode ? 'Save' : 'Edit'}
            </button>
            {editMode && !saving && (
              <button
                onClick={() => {
                  setEditMode(false);
                  setFullName(profile?.full_name ?? '');
                  setPhone(profile?.phone ?? '');
                  // discard pending photo
                  if (pendingFile) {
                    if (avatarUrl?.startsWith('blob:')) URL.revokeObjectURL(avatarUrl);
                    setAvatarUrl(null);
                    setPendingFile(null);
                  }
                }}
                style={Mono({
                  padding: '8px 14px', borderRadius: 8, border: `1px solid ${T.border}`,
                  background: 'transparent', color: T.textMut, fontSize: 9.5, cursor: 'pointer',
                })}>
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Agent access */}
      <SectionDivider>Agent Access</SectionDivider>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 22 }}>
        {([
          { key: 'mark', label: 'Marketing Agent (MARK)', can: canMark, color: T.purple },
          { key: 'hr',   label: 'HR Agent',               can: canHR,   color: T.green },
        ] as const).map(({ key, label, can, color }) => (
          <div key={key} style={{
            padding: '14px 16px', borderRadius: 11, border: `1px solid ${color}22`,
            background: `${color}06`, display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <StatusDot active={loading ? false : can} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11.5, color: T.textSec }}>{label}</div>
              <div style={Mono({ fontSize: 9, color: can ? T.green : T.textMut, letterSpacing: '0.08em', marginTop: 2 })}>
                {loading ? '···' : can ? 'ACCESS GRANTED' : 'NO SUBSCRIPTION'}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tenant info */}
      {tenant && (
        <>
          <SectionDivider>Organisation</SectionDivider>
          <CardBox>
            <Row title="Company" desc={tenant.name}>
              <span style={Mono({ fontSize: 8, padding: '2px 7px', borderRadius: 4, background: `${T.cyan}18`, color: T.cyan, border: `1px solid ${T.cyan}35` })}>
                {tenant.subscription_type.toUpperCase()}
              </span>
            </Row>
            <Row title="Subscription Status" desc={`Plan: ${tenant.subscription_type}`} noBorder>
              <span style={Mono({
                fontSize: 8, padding: '2px 7px', borderRadius: 4, fontWeight: 700,
                background: tenant.subscription_status === 'active' || tenant.subscription_status === 'trial'
                  ? T.greenDim : 'rgba(248,113,113,0.1)',
                color: tenant.subscription_status === 'active' || tenant.subscription_status === 'trial'
                  ? T.green : T.red,
                border: `1px solid ${tenant.subscription_status === 'active' || tenant.subscription_status === 'trial' ? 'rgba(74,222,128,0.2)' : 'rgba(248,113,113,0.2)'}`,
              })}>
                {tenant.subscription_status.toUpperCase()}
              </span>
            </Row>
          </CardBox>
        </>
      )}
    </div>
  );
}
// ======================== NOTIFICATIONS SECTION ========================
const NOTIF_KEY = 'sia_notifications';
const NOTIF_DEFAULTS = {
  agentCompleted: true, agentError: true, weeklyReport: true,
  leadAlert: false, docProcessed: true, systemUpdates: false,
  emailDigest: true, slackPush: false, smsCritical: false,
};

function NotificationsSection() {
  const [n, setN] = useState(() => {
    if (typeof window === 'undefined') return NOTIF_DEFAULTS;
    try {
      const stored = localStorage.getItem(NOTIF_KEY);
      return stored ? { ...NOTIF_DEFAULTS, ...JSON.parse(stored) } : NOTIF_DEFAULTS;
    } catch { return NOTIF_DEFAULTS; }
  });
  const set = (k: keyof typeof n) => (v: boolean) => setN((p: typeof n) => {
    const next = { ...p, [k]: v };
    localStorage.setItem(NOTIF_KEY, JSON.stringify(next));
    return next;
  });

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
          { k: 'weeklyReport',  t: 'Weekly Performance Report', d: 'Every Monday 09:00' },
          { k: 'systemUpdates', t: 'System Updates',            d: 'Platform changes and API upgrades' },
        ].map((r, ri, arr) => (
          <Row key={r.k} title={r.t} desc={r.d} noBorder={ri === arr.length - 1}>
            <Toggle on={n[r.k as keyof typeof n]} onChange={set(r.k as keyof typeof n)} />
          </Row>
        ))}
      </CardBox>
      <SectionDivider>Delivery Channels</SectionDivider>
      <CardBox>
        {[
          { k: 'emailDigest', t: 'Email Digest',    d: 'Sent to profile email' },
          { k: 'slackPush',   t: 'Slack Push',      d: '#sia-notifications channel' },
          { k: 'smsCritical', t: 'SMS — Critical',  d: 'Agent errors only' },
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
const APPEAR_KEY = 'sia_appearance';
const APPEAR_DEFAULTS = {
  theme: 'darker' as 'dark' | 'darker' | 'terminal',
  density: 'default' as 'compact' | 'default' | 'spacious',
  fontSize: 13,
  animations: true,
  scanlines: false,
  gridOverlay: false,
};

function AppearanceSection() {
  const [prefs, setPrefs] = useState(() => {
    if (typeof window === 'undefined') return APPEAR_DEFAULTS;
    try {
      const stored = localStorage.getItem(APPEAR_KEY);
      return stored ? { ...APPEAR_DEFAULTS, ...JSON.parse(stored) } : APPEAR_DEFAULTS;
    } catch { return APPEAR_DEFAULTS; }
  });

  const save = (patch: Partial<typeof APPEAR_DEFAULTS>) => {
    setPrefs((p: typeof APPEAR_DEFAULTS) => {
      const next = { ...p, ...patch };
      localStorage.setItem(APPEAR_KEY, JSON.stringify(next));
      return next;
    });
  };

  const { theme, density, fontSize, animations, scanlines, gridOverlay } = prefs;

  return (
    <div style={{ animation: 's-fadeUp 0.35s ease both' }}>
      <SectionDivider>Theme</SectionDivider>
      <CardBox>
        <Row title="Color Theme" desc="Terminal background palette">
          <div style={{ display: 'flex', gap: 6 }}>
            {(['dark', 'darker', 'terminal'] as const).map(d => (
              <button key={d} onClick={() => save({ theme: d })} style={Mono({
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
              <button key={d} onClick={() => save({ density: d })} style={Mono({
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
            <button onClick={() => save({ fontSize: Math.max(10, fontSize - 1) })} style={Mono({ width: 28, height: 28, borderRadius: 7, border: `1px solid ${T.border}`, background: 'transparent', color: T.textSec, cursor: 'pointer', fontSize: 16 })}>−</button>
            <span style={Mono({ color: T.gold, fontSize: 13, width: 26, textAlign: 'center' })}>{fontSize}</span>
            <button onClick={() => save({ fontSize: Math.min(18, fontSize + 1) })} style={Mono({ width: 28, height: 28, borderRadius: 7, border: `1px solid ${T.border}`, background: 'transparent', color: T.textSec, cursor: 'pointer', fontSize: 16 })}>+</button>
          </div>
        </Row>
        <Row title="Motion &amp; Animations" desc="Smooth transitions, pulse effects"><Toggle on={animations} onChange={v => save({ animations: v })} /></Row>
        <Row title="CRT Scanlines" desc="Retro terminal overlay effect"><Toggle on={scanlines} onChange={v => save({ scanlines: v })} /></Row>
        <Row title="Grid Overlay" desc="Subtle background grid pattern" noBorder><Toggle on={gridOverlay} onChange={v => save({ gridOverlay: v })} /></Row>
      </CardBox>
      <SaveBar onSave={async () => { await new Promise(r => setTimeout(r, 700)); }} />
    </div>
  );
}

// ======================== PRIVACY SECTION ========================
const PRIVACY_KEY = 'sia_privacy';
const PRIVACY_DEFAULTS = { twoFA: false, pub: true, log: true, sharing: false };

function PrivacySection() {
  const [priv, setPriv] = useState(() => {
    if (typeof window === 'undefined') return PRIVACY_DEFAULTS;
    try {
      const stored = localStorage.getItem(PRIVACY_KEY);
      return stored ? { ...PRIVACY_DEFAULTS, ...JSON.parse(stored) } : PRIVACY_DEFAULTS;
    } catch { return PRIVACY_DEFAULTS; }
  });
  const setP = (k: keyof typeof PRIVACY_DEFAULTS) => (v: boolean) => setPriv((p: typeof PRIVACY_DEFAULTS) => {
    const next = { ...p, [k]: v };
    localStorage.setItem(PRIVACY_KEY, JSON.stringify(next));
    return next;
  });
  const { twoFA, pub, log, sharing } = priv;

  const [showKey, setShowKey] = useState(false);
  const [copied,  setCopied]  = useState(false);

  const apiKey = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  const apiKeyDisplay = apiKey
    ? (showKey ? apiKey.slice(0, 80) + '…' : `${apiKey.slice(0, 8)}${'•'.repeat(20)}${apiKey.slice(-8)}`)
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
        <Row title="Two-Factor Authentication" desc="TOTP app or SMS"><Toggle on={twoFA} onChange={setP('twoFA')} /></Row>
        <Row title="Public Profile" desc="Other users in your org can see your profile"><Toggle on={pub} onChange={setP('pub')} /></Row>
        <Row title="Activity Logging" desc="Log all agent interactions for audit trail"><Toggle on={log} onChange={setP('log')} /></Row>
        <Row title="Data Sharing" desc="Share anonymised usage for product improvement" noBorder><Toggle on={sharing} onChange={setP('sharing')} /></Row>
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
function BillingSection({ profile, loading }: { profile: BackendUserProfile | null; loading: boolean }) {
  const canMark = profile?.can_access_mark ?? false;
  const canHR   = profile?.can_access_hr   ?? false;
  const tenant  = profile?.tenant;
  const activeAgents = [canMark, canHR].filter(Boolean).length;

  return (
    <div style={{ animation: 's-fadeUp 0.35s ease both' }}>
      <div className="s-billing-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 22 }}>
        <StatCard
          label="Subscription"
          value={tenant?.subscription_type?.toUpperCase() ?? 'NONE'}
          color={T.gold} loading={loading}
        />
        <StatCard
          label="Status"
          value={tenant?.subscription_status?.toUpperCase() ?? 'N/A'}
          color={T.cyan} loading={loading}
        />
        <StatCard
          label="HR Agent"
          value={canHR ? 'Active' : 'No Access'}
          badge={canHR ? 'ON' : undefined}
          color={T.green} loading={loading}
        />
        <StatCard
          label="Marketing Agent"
          value={canMark ? 'Active' : 'No Access'}
          badge={canMark ? 'ON' : undefined}
          sub={`${activeAgents}/2 agents`}
          color={T.purple} loading={loading}
        />
      </div>

      {!tenant ? (
        <CardBox>
          <div style={{ padding: '28px 18px', textAlign: 'center' }}>
            <div style={Mono({ fontSize: 11, color: T.textMut, marginBottom: 12 })}>
              No active subscription. Contact your admin to get access.
            </div>
          </div>
        </CardBox>
      ) : (
        <CardBox>
          <Row title="Company" desc={tenant.name}>
            <span style={Mono({ fontSize: 9, color: T.cyan })}>{tenant.id}</span>
          </Row>
          <Row title="Plan" desc={`subscription_type: ${tenant.subscription_type}`} noBorder>
            <span style={Mono({
              fontSize: 8, padding: '3px 8px', borderRadius: 4, fontWeight: 700,
              background: tenant.subscription_status === 'active' ? T.greenDim : 'rgba(248,113,113,0.1)',
              color: tenant.subscription_status === 'active' ? T.green : T.red,
              border: `1px solid ${tenant.subscription_status === 'active' ? 'rgba(74,222,128,0.2)' : 'rgba(248,113,113,0.2)'}`,
            })}>
              {tenant.subscription_status.toUpperCase()}
            </span>
          </Row>
        </CardBox>
      )}
    </div>
  );
}

// ======================== API INTEGRATION SECTION ========================
function ApiIntegrationSection({ profile }: { profile: BackendUserProfile | null }) {
  const [copied, setCopied] = useState<string | null>(null);

  const copy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 1800);
  };

  const canMark = profile?.can_access_mark ?? false;
  const canHR   = profile?.can_access_hr   ?? false;
  const apiBase = BASE_URL;

  const CodeBlock = ({ id, code }: { id: string; code: string }) => (
    <div style={{ position: 'relative', borderRadius: 10, background: 'rgba(0,0,0,0.4)', border: `1px solid ${T.border}`, overflow: 'hidden', marginTop: 8 }}>
      <button
        onClick={() => copy(code, id)}
        style={Mono({
          position: 'absolute', top: 8, right: 10, background: 'none', border: 'none',
          cursor: 'pointer', color: copied === id ? T.green : T.textMut, fontSize: 9,
          display: 'flex', alignItems: 'center', gap: 4, padding: '2px 4px',
        })}>
        {copied === id ? <><CheckCircle size={9} /> Copied</> : <><Copy size={9} /> Copy</>}
      </button>
      <pre style={Mono({ fontSize: 9.5, color: 'rgba(240,184,73,0.7)', padding: '14px 16px', margin: 0, lineHeight: 1.7, overflowX: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-all' })}>
        {code}
      </pre>
    </div>
  );

  return (
    <div style={{ animation: 's-fadeUp 0.35s ease both' }}>
      {/* How it works */}
      <div style={{ padding: '16px 18px', borderRadius: 12, background: 'rgba(167,139,250,0.06)', border: `1px solid rgba(167,139,250,0.18)`, marginBottom: 22 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: T.purple, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 7 }}>
          <Bot size={13} /> How SIA Agent Integration Works
        </div>
        <div style={Mono({ fontSize: 10, color: T.textSec, lineHeight: 1.75 })}>
          You can connect our agents to your own tools, CRMs, or workflows via API.
          Authenticate using your <span style={{ color: T.gold }}>Bearer token</span> (login session) or a dedicated{' '}
          <span style={{ color: T.gold }}>API key</span> (for server-to-server use).
          API keys are provisioned by your SIA account manager — contact us to get one.
        </div>
      </div>

      {/* Agent access status */}
      <SectionDivider>Your Agent Access</SectionDivider>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 22 }}>
        {([
          { id: 'mark', label: 'Marketing Agent (MARK)', endpoint: '/api/agents/mark/chat/', can: canMark, color: T.purple },
          { id: 'hr',   label: 'HR Agent',               endpoint: '/api/agents/hr/chat/',   can: canHR,   color: T.green  },
        ] as const).map(a => (
          <div key={a.id} style={{ padding: '14px 16px', borderRadius: 11, border: `1px solid ${a.can ? a.color + '30' : T.border}`, background: a.can ? `${a.color}06` : T.card }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <div style={{ width: 7, height: 7, borderRadius: 4, background: a.can ? T.green : T.textMut, boxShadow: a.can ? `0 0 5px ${T.green}` : 'none', flexShrink: 0 }} />
              <span style={{ fontSize: 11, color: a.can ? T.textSec : T.textMut, fontWeight: 600 }}>{a.label}</span>
            </div>
            {a.can ? (
              <div style={Mono({ fontSize: 9, color: 'rgba(240,184,73,0.55)', letterSpacing: '0.03em' })}>{a.endpoint}</div>
            ) : (
              <div style={Mono({ fontSize: 9, color: T.textMut })}>No subscription — contact your admin</div>
            )}
          </div>
        ))}
      </div>

      {/* Authentication */}
      <SectionDivider>Authentication</SectionDivider>
      <CardBox>
        <Row title="Bearer Token (Session)" desc="Use after login — short-lived, for web use">
          <span style={Mono({ fontSize: 9, color: T.gold, background: 'rgba(240,184,73,0.08)', border: `1px solid rgba(240,184,73,0.2)`, borderRadius: 5, padding: '2px 7px' })}>JWT</span>
        </Row>
        <Row title="API Key" desc="Server-to-server, long-lived. Contact your SIA manager to obtain one." noBorder>
          <span style={Mono({ fontSize: 9, color: T.cyan, background: 'rgba(34,211,238,0.08)', border: `1px solid rgba(34,211,238,0.2)`, borderRadius: 5, padding: '2px 7px' })}>X-API-Key</span>
        </Row>
      </CardBox>

      {/* Code examples */}
      {(canMark || canHR) && (
        <>
          <SectionDivider>Example — Chat with Agent</SectionDivider>
          <div style={{ marginBottom: 16 }}>
            <div style={Mono({ fontSize: 9.5, color: T.textMut, marginBottom: 4 })}>
              Using Bearer token (your session JWT):
            </div>
            <CodeBlock
              id="curl-jwt"
              code={`curl -X POST ${apiBase}/api/agents/${canMark ? 'mark' : 'hr'}/chat/ \\
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"message": "Hello, what can you help me with?", "session_id": "optional-session-id"}'`}
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <div style={Mono({ fontSize: 9.5, color: T.textMut, marginBottom: 4 })}>
              Using API key (for integrations):
            </div>
            <CodeBlock
              id="curl-apikey"
              code={`curl -X POST ${apiBase}/api/agents/${canMark ? 'mark' : 'hr'}/chat/ \\
  -H "X-API-Key: sia_your_api_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{"message": "Hello, what can you help me with?"}'`}
            />
          </div>
          <div style={{ marginBottom: 22 }}>
            <div style={Mono({ fontSize: 9.5, color: T.textMut, marginBottom: 4 })}>
              JavaScript / Node.js:
            </div>
            <CodeBlock
              id="js-example"
              code={`const response = await fetch('${apiBase}/api/agents/${canMark ? 'mark' : 'hr'}/chat/', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + accessToken,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    message: 'What campaigns should I run this quarter?',
    session_id: sessionId, // optional — maintains conversation context
  }),
});
const data = await response.json();
console.log(data.data.response);`}
            />
          </div>
        </>
      )}

      {/* Response shape */}
      <SectionDivider>Response Format</SectionDivider>
      <CardBox>
        <div style={{ padding: '12px 16px' }}>
          <div style={Mono({ fontSize: 9, color: T.textMut, marginBottom: 8 })}>All responses follow this structure:</div>
          <CodeBlock
            id="response-shape"
            code={`// Success
{ "success": true, "data": { "response": "...", "session_id": "uuid" } }

// Error
{ "success": false, "error": "Human readable error message" }`}
          />
        </div>
      </CardBox>

      {/* Get API key CTA */}
      <div style={{ marginTop: 22, padding: '18px 20px', borderRadius: 12, background: 'rgba(240,184,73,0.04)', border: `1px solid rgba(240,184,73,0.15)`, display: 'flex', alignItems: 'center', gap: 16 }}>
        <Key size={20} color={T.gold} style={{ flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, color: T.textSec, fontWeight: 600, marginBottom: 4 }}>Need an API Key for Integration?</div>
          <div style={Mono({ fontSize: 9.5, color: T.textMut, lineHeight: 1.6 })}>
            API keys enable server-to-server access without user sessions. Contact your SIA account manager or email support to request a key for your organisation.
          </div>
        </div>
      </div>
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
  { id: 'integration',   label: 'Integration',  sub: 'API & embedding',   Icon: Key        },
];

// ======================== MAIN EXPORT ========================
export default function SettingsPage({ onBack }: { onBack?: () => void }) {
  const router = useRouter();
  const [active, setActive] = useState<SettingsSection>('profile');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [profile, setProfile]         = useState<BackendUserProfile | null>(null);
  const [agentStatus, setAgentStatus] = useState<AgentStatus | null>(null);
  const [apiOnline, setApiOnline]     = useState(false);
  const [loading, setLoading]         = useState(true);
  const [apiError, setApiError]       = useState<string | null>(null);
  const [loggingOut, setLoggingOut]   = useState(false);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setApiError(null);
    try {
      const [p, s] = await Promise.all([
        fetchProfile(),
        fetchAgentStatus().catch(() => null),
      ]);
      setProfile(p);
      if (s) setAgentStatus(s);
      setApiOnline(true);
    } catch (e: any) {
      const msg = e?.message ?? '';
      if (msg.includes('401')) {
        const newToken = await refreshAccessToken();
        if (newToken) { loadAll(); return; }
      }
      setApiError(msg || 'Network error');
      setApiOnline(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try { await apiFetch('/api/auth/logout/', { method: 'POST' }); } catch {}
    clearAuth();
    if (onBack) onBack(); // close embedded settings first
    router.replace('/');
  };

  const SECTIONS: Record<SettingsSection, React.ReactElement> = {
    profile:       <ProfileSection profile={profile} setProfile={setProfile} agentStatus={agentStatus} loading={loading} />,
    notifications: <NotificationsSection />,
    appearance:    <AppearanceSection />,
    privacy:       <PrivacySection />,
    billing:       <BillingSection profile={profile} loading={loading} />,
    integration:   <ApiIntegrationSection profile={profile} />,
  };

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden', fontFamily: T.mono, background: T.bg, ...(onBack ? {} : { minHeight: '100vh' }), position: 'relative' }}>
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
        
        /* RESPONSIVE DESIGN */
        .s-nav-toggle { display: none; }
        .s-sidebar { width: 200px; }
        .s-main-content { flex: 1; padding: 24px 28px; }
        
        /* Tablet: 640px - 1024px */
        @media (max-width: 1024px) {
          .s-sidebar { width: 180px; }
          .s-main-content { padding: 20px 24px; }
          .s-billing-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .s-api-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        
        /* Mobile: < 640px */
        @media (max-width: 639px) {
          .s-nav-toggle { display: flex !important; align-items: center !important; justify-content: center !important; }
          .s-sidebar { 
            position: fixed;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            z-index: 100;
            transform: translateX(-100%);
            transition: transform 0.3s ease;
            box-shadow: 0 0 0 9999px rgba(0,0,0,0.5);
          }
          .s-sidebar.open { transform: translateX(0); }
          .s-sidebar-overlay { position: fixed; inset: 0; z-index: 99; }
          .s-main-content { padding: 18px 16px; }
          .s-nav-item { padding: 10px 12px !important; gap: 8px !important; }
          .s-nav-item > div { flex: 1; min-width: 0; }
          .s-nav-item span { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
          .s-stat-card { padding: 12px 14px !important; }
          .s-user-hero { gap: 16px !important; }
          .s-user-avatar { width: 66px !important; height: 66px !important; flex-shrink: 0; }
          .s-user-info { flex: 1; min-width: 0; }
          .s-user-actions { gap: 4px !important; }
          .s-row-content { flex-direction: column; gap: 12px !important; align-items: flex-start !important; }
          .s-row { flex-direction: column; align-items: flex-start !important; gap: 8px !important; }
          .s-billing-grid { grid-template-columns: 1fr !important; gap: 8px !important; }
          .s-api-grid { grid-template-columns: 1fr !important; gap: 8px !important; }
          .s-plan-card { padding: 16px !important; }
        }
      `}</style>

      {/* Mobile Menu Toggle */}
      <button 
        className="s-nav-toggle"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        style={Mono({
          position: 'absolute', top: 0, left: 0, width: 44, height: 44, zIndex: 110,
          background: 'none', border: 'none', cursor: 'pointer', color: T.gold,
          alignItems: 'center', justifyContent: 'center', fontSize: 20,
        })}
      >
        {sidebarOpen ? '✕' : '☰'}
      </button>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="s-sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div 
        className={`s-sidebar${sidebarOpen ? ' open' : ''}`}
        style={{ 
          width: 200, 
          flexShrink: 0, 
          background: T.sidebar, 
          borderRight: `1px solid ${T.border}`, 
          display: 'flex', 
          flexDirection: 'column', 
          overflow: 'hidden',
          ...(typeof window !== 'undefined' && window.innerWidth < 640 ? { maxWidth: '70vw' } : {})
        }}
      >
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
              <div key={id} className="s-nav-item" onClick={() => { setActive(id); setSidebarOpen(false); }} style={{
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

        {/* Bottom: status + logout */}
        <div style={{ padding: '10px 14px', borderTop: `1px solid ${T.border}`, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: 3, background: apiOnline ? T.green : T.textMut, boxShadow: apiOnline ? `0 0 6px ${T.green}` : 'none', flexShrink: 0 }} />
            <span style={Mono({ fontSize: 8, color: T.textMut, letterSpacing: '0.08em', flex: 1 })}>
              {loading ? 'Loading…' : apiOnline ? 'Connected' : 'Offline'}
            </span>
            <button onClick={loadAll} style={Mono({ background: 'none', border: 'none', cursor: 'pointer', color: T.textMut, padding: 2 })}>
              <RefreshCw size={10} />
            </button>
          </div>
          {apiError && (
            <div style={Mono({ fontSize: 8, color: T.red, lineHeight: 1.4 })}>{apiError}</div>
          )}
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            style={Mono({
              display: 'flex', alignItems: 'center', gap: 6, padding: '7px 10px',
              borderRadius: 8, background: 'none', border: `1px solid rgba(248,113,113,0.2)`,
              color: T.red, fontSize: 9, letterSpacing: '0.07em', cursor: loggingOut ? 'not-allowed' : 'pointer',
              opacity: loggingOut ? 0.6 : 1, transition: 'all 0.15s', width: '100%',
            })}>
            <LogOut size={10} /> {loggingOut ? 'Signing out…' : 'Sign Out'}
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="s-main-content" style={{ flex: 1, overflowY: 'auto', paddingTop: 'calc(44px + 24px)', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 780 }}>
          {SECTIONS[active]}
        </div>
      </div>
    </div>
  );
}
