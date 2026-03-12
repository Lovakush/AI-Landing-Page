'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  isAuthenticated, fetchProfile, fetchAdminStats, fetchAdminUsers,
  fetchAdminTenants, fetchAdminLogs, updateUserStatus, assignUserTenant,
  createTenant, updateTenant, createApiKey, apiFetch,
  type UserProfile,
} from '@/lib/api';

// ======================== GLOBAL KEYFRAMES ========================
const STYLES = `
  @keyframes fadeSlideIn {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeSlideLeft {
    from { opacity: 0; transform: translateX(-18px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes pulseDot {
    0%, 100% { box-shadow: 0 0 4px 1px currentColor; opacity: 1; }
    50%       { box-shadow: 0 0 10px 4px currentColor; opacity: 0.7; }
  }
  @keyframes shimmer {
    0%   { background-position: -400px 0; }
    100% { background-position: 400px 0; }
  }
  @keyframes scanLine {
    0%   { transform: translateY(-100%); }
    100% { transform: translateY(400%); }
  }
  @keyframes counterUp {
    from { opacity: 0; transform: translateY(8px) scale(0.92); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes sidebarItemIn {
    from { opacity: 0; transform: translateX(-12px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes orb {
    0%, 100% { transform: scale(1) translate(0, 0); opacity: 0.6; }
    33%       { transform: scale(1.12) translate(8px, -6px); opacity: 0.9; }
    66%       { transform: scale(0.95) translate(-6px, 8px); opacity: 0.7; }
  }
  @keyframes spinRing {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  @keyframes badgePop {
    0%   { transform: scale(0.7); opacity: 0; }
    70%  { transform: scale(1.08); }
    100% { transform: scale(1); opacity: 1; }
  }

  .admin-card {
    transition: border-color 0.25s, box-shadow 0.25s, transform 0.2s;
  }
  .admin-card:hover {
    border-color: rgba(139,92,246,0.32) !important;
    box-shadow: 0 0 28px rgba(139,92,246,0.10);
    transform: translateY(-1px);
  }
  .nav-btn {
    transition: background 0.18s, color 0.18s, transform 0.15s;
  }
  .nav-btn:hover {
    transform: translateX(3px);
  }
  .action-btn {
    transition: opacity 0.18s, transform 0.15s, box-shadow 0.18s;
  }
  .action-btn:hover {
    opacity: 0.88;
    transform: translateY(-1px);
    box-shadow: 0 4px 14px rgba(0,0,0,0.3);
  }
  .action-btn:active {
    transform: translateY(0px) scale(0.97);
  }
`;

// ======================== DESIGN TOKENS ========================
const C = {
  bg: '#060612',
  bgCard: 'rgba(139, 92, 246, 0.05)',
  border: 'rgba(139, 92, 246, 0.15)',
  purple: '#8B5CF6',
  purpleLight: '#A78BFA',
  purpleDim: 'rgba(139, 92, 246, 0.15)',
  gold: '#F5A623',
  goldDim: 'rgba(245, 166, 35, 0.12)',
  green: '#22C55E',
  greenDim: 'rgba(34, 197, 94, 0.12)',
  red: '#EF4444',
  redDim: 'rgba(239, 68, 68, 0.12)',
  blue: '#3B82F6',
  blueDim: 'rgba(59, 130, 246, 0.12)',
  text: '#FFFFFF',
  textSec: 'rgba(255,255,255,0.75)',
  textMut: 'rgba(255,255,255,0.45)',
  sidebar: '#0A0918',
  sidebarBorder: 'rgba(139, 92, 246, 0.12)',
};

const FONT = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";
type Tab = 'overview' | 'users' | 'tenants' | 'logs';

const SUB_TYPE_LABELS: Record<string, string> = {
  none: 'No Access', mark: 'MARK Only', hr: 'HR Only', both: 'Both Agents',
};
const SUB_STATUS_COLORS: Record<string, string> = {
  active: C.green, trial: C.gold, suspended: C.red, cancelled: C.textMut,
};

// ======================== ANIMATED WRAPPER ========================
function FadeIn({ children, delay = 0, style }: { children: React.ReactNode; delay?: number; style?: React.CSSProperties }) {
  return (
    <div style={{ animation: `fadeSlideIn 0.45s cubic-bezier(0.22,1,0.36,1) ${delay}ms both`, ...style }}>
      {children}
    </div>
  );
}

// ======================== SPINNER ========================
function Spinner() {
  return (
    <div style={{ padding: 40, textAlign: 'center', color: C.textMut, fontSize: 12 }}>
      <div style={{ width: 28, height: 28, borderRadius: '50%', border: `2px solid ${C.border}`, borderTopColor: C.purple, animation: 'spinRing 0.8s linear infinite', margin: '0 auto 10px' }} />
      Loading...
    </div>
  );
}

// ======================== PULSING DOT ========================
function PulseDot({ color }: { color: string }) {
  return (
    <div style={{
      width: 8, height: 8, borderRadius: '50%', background: color, color,
      animation: 'pulseDot 2s ease-in-out infinite', flexShrink: 0,
    }} />
  );
}

// ======================== BADGE ========================
function Badge({ label, color }: { label: string; color: string }) {
  return (
    <span style={{
      fontSize: 9, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
      padding: '2px 7px', borderRadius: 5, background: color + '22', color,
      animation: 'badgePop 0.35s cubic-bezier(0.22,1,0.36,1) both', display: 'inline-block',
    }}>
      {label}
    </span>
  );
}

// ======================== CARD ========================
function Card({ children, style, delay = 0 }: { children: React.ReactNode; style?: React.CSSProperties; delay?: number }) {
  return (
    <div className="admin-card" style={{
      borderRadius: 12, background: C.bgCard, border: `1px solid ${C.border}`,
      padding: '16px 18px',
      animation: `fadeSlideIn 0.45s cubic-bezier(0.22,1,0.36,1) ${delay}ms both`,
      ...style,
    }}>
      {children}
    </div>
  );
}

// ======================== STAT CARD ========================
function StatCard({ label, value, sub, color, delay = 0 }: { label: string; value: string | number; sub?: string; color: string; delay?: number }) {
  return (
    <div className="admin-card" style={{
      borderRadius: 12, border: `1px solid ${C.border}`, padding: '16px 18px',
      position: 'relative', overflow: 'hidden', background: C.bgCard,
      animation: `fadeSlideIn 0.45s cubic-bezier(0.22,1,0.36,1) ${delay}ms both`,
    }}>
      {/* Shimmer */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: `linear-gradient(105deg, transparent 40%, ${color}12 50%, transparent 60%)`,
        backgroundSize: '800px 100%', animation: 'shimmer 3.5s linear infinite',
        animationDelay: `${delay}ms`,
      }} />
      {/* Scan line */}
      <div style={{
        position: 'absolute', left: 0, right: 0, height: 1,
        background: `linear-gradient(90deg, transparent, ${color}33, transparent)`,
        animation: 'scanLine 4s linear infinite', animationDelay: `${delay * 0.5}ms`,
        pointerEvents: 'none',
      }} />
      <div style={{ fontSize: 10, color: C.textMut, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 800, color, lineHeight: 1, letterSpacing: '-0.5px', animation: `counterUp 0.5s cubic-bezier(0.22,1,0.36,1) ${delay + 100}ms both` }}>{value}</div>
      {sub && <div style={{ fontSize: 10, color: C.textMut, marginTop: 5 }}>{sub}</div>}
    </div>
  );
}

// ======================== SECTION DIVIDER ========================
function SectionDivider({ label, delay = 0 }: { label: string; delay?: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '6px 0', animation: `fadeSlideIn 0.4s ease ${delay}ms both` }}>
      <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, transparent, ${C.border})` }} />
      <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', color: C.textMut, textTransform: 'uppercase' }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${C.border}, transparent)` }} />
    </div>
  );
}

// ======================== AVATAR ========================
function Avatar({ name, size = 56 }: { name: string; size?: number }) {
  const initials = name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2);
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <div style={{ position: 'absolute', inset: -3, borderRadius: 18, border: `1.5px dashed ${C.gold}55`, animation: 'spinRing 12s linear infinite', pointerEvents: 'none' }} />
      <div style={{
        width: size, height: size, borderRadius: 14,
        background: 'linear-gradient(135deg, #3a2a00 0%, #1a1200 100%)',
        border: `2px solid ${C.gold}55`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: size * 0.3, fontWeight: 800, color: C.gold,
      }}>
        {initials}
      </div>
    </div>
  );
}

// ======================== NAV ITEM ========================
function NavItem({ icon, label, sub, active, onClick, delay = 0 }: {
  icon: string; label: string; sub: string; active: boolean; onClick: () => void; delay?: number;
}) {
  return (
    <button onClick={onClick} className="nav-btn" style={{
      width: '100%', display: 'flex', alignItems: 'center', gap: 12,
      padding: '10px 14px', borderRadius: 10, border: 'none', cursor: 'pointer',
      background: active ? `linear-gradient(135deg, ${C.gold}22, ${C.gold}11)` : 'transparent',
      textAlign: 'left',
      boxShadow: active ? `inset 0 0 0 1px ${C.gold}33` : 'none',
      animation: `sidebarItemIn 0.4s cubic-bezier(0.22,1,0.36,1) ${delay}ms both`,
    }}>
      <span style={{ color: active ? C.gold : C.textMut, fontSize: 16, lineHeight: 1, transition: 'color 0.18s' }}>{icon}</span>
      <div>
        <div style={{ fontSize: 13, fontWeight: active ? 700 : 500, color: active ? C.gold : C.textSec, transition: 'color 0.18s' }}>{label}</div>
        <div style={{ fontSize: 9, color: C.textMut, marginTop: 1 }}>{sub}</div>
      </div>
      {active && <div style={{ marginLeft: 'auto', width: 4, height: 4, borderRadius: '50%', background: C.gold, color: C.gold, animation: 'pulseDot 2s ease-in-out infinite' }} />}
    </button>
  );
}

// ======================== MODAL SHELL ========================
function ModalShell({ children, onClose, width = 480 }: { children: React.ReactNode; onClose: () => void; width?: number }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)', animation: 'fadeSlideIn 0.25s ease both' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ width, background: '#0E0C1D', border: `1px solid ${C.border}`, borderRadius: 16, overflow: 'hidden', boxShadow: '0 40px 100px rgba(0,0,0,0.8)', animation: 'fadeSlideIn 0.3s cubic-bezier(0.22,1,0.36,1) both' }}>
        {children}
      </div>
    </div>
  );
}

const fieldStyle: React.CSSProperties = {
  width: '100%', padding: '8px 11px', borderRadius: 8, fontSize: 12,
  background: 'rgba(255,255,255,0.05)', border: `1px solid ${C.border}`,
  color: C.text, outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s',
};
const labelStyle: React.CSSProperties = {
  fontSize: 10, color: C.textMut, fontWeight: 700, letterSpacing: '0.08em',
  textTransform: 'uppercase', marginBottom: 4, display: 'block',
};

// ======================== CREATE TENANT MODAL ========================
function CreateTenantModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subscription_type: 'none', subscription_status: 'active', duration_months: '', notes: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!form.name || !form.email) { setError('Name and email are required.'); return; }
    setSaving(true); setError('');
    try {
      const now = new Date();
      let subscription_start: string | undefined, subscription_end: string | undefined;
      const months = parseInt(form.duration_months, 10);
      if (form.subscription_type !== 'none' && !isNaN(months) && months > 0) {
        subscription_start = now.toISOString();
        const end = new Date(now); end.setMonth(end.getMonth() + months);
        subscription_end = end.toISOString();
      }
      await createTenant({ name: form.name, email: form.email, phone: form.phone || undefined, subscription_type: form.subscription_type, subscription_status: form.subscription_status, subscription_start, subscription_end, notes: form.notes || undefined });
      onCreated(); onClose();
    } catch (e: any) { setError(e?.message ?? 'Failed to create tenant'); }
    finally { setSaving(false); }
  };

  return (
    <ModalShell onClose={onClose}>
      <div style={{ padding: '14px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 14, fontWeight: 800 }}>Create Tenant</span>
        <button onClick={onClose} className="action-btn" style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.textMut, fontSize: 18, lineHeight: 1 }}>×</button>
      </div>
      <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {error && <div style={{ padding: '8px 12px', borderRadius: 8, background: C.redDim, border: `1px solid ${C.red}44`, color: C.red, fontSize: 11, animation: 'fadeSlideIn 0.2s ease both' }}>{error}</div>}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div><label style={labelStyle}>Company Name *</label><input style={fieldStyle} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Acme Corp" /></div>
          <div><label style={labelStyle}>Email *</label><input style={fieldStyle} type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="admin@acme.com" /></div>
        </div>
        <div><label style={labelStyle}>Phone</label><input style={fieldStyle} value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+1 555-0100" /></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div><label style={labelStyle}>Subscription Type</label>
            <select style={fieldStyle} value={form.subscription_type} onChange={e => setForm(f => ({ ...f, subscription_type: e.target.value }))}>
              <option value="none">None</option><option value="mark">MARK Only</option><option value="hr">HR Only</option><option value="both">Both Agents</option>
            </select>
          </div>
          <div><label style={labelStyle}>Status</label>
            <select style={fieldStyle} value={form.subscription_status} onChange={e => setForm(f => ({ ...f, subscription_status: e.target.value }))}>
              <option value="active">Active</option><option value="trial">Trial</option><option value="suspended">Suspended</option><option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
        {form.subscription_type !== 'none' && (
          <div style={{ animation: 'fadeSlideIn 0.25s ease both' }}>
            <label style={labelStyle}>Duration (months)</label>
            <input style={fieldStyle} type="number" min="1" max="120" value={form.duration_months} onChange={e => setForm(f => ({ ...f, duration_months: e.target.value }))} placeholder="e.g. 12 for 1 year" />
          </div>
        )}
        <div><label style={labelStyle}>Notes</label><textarea style={{ ...fieldStyle, resize: 'vertical', minHeight: 60 }} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Internal notes..." /></div>
      </div>
      <div style={{ padding: '12px 20px', borderTop: `1px solid ${C.border}`, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
        <button onClick={onClose} className="action-btn" style={{ padding: '8px 16px', borderRadius: 8, fontSize: 12, background: 'none', border: `1px solid ${C.border}`, color: C.textMut, cursor: 'pointer' }}>Cancel</button>
        <button onClick={handleSubmit} disabled={saving} className="action-btn" style={{ padding: '8px 20px', borderRadius: 8, fontSize: 12, fontWeight: 700, background: `linear-gradient(135deg, ${C.purple}, #7c3aed)`, border: 'none', color: '#fff', cursor: saving ? 'default' : 'pointer', opacity: saving ? 0.7 : 1 }}>
          {saving ? 'Creating...' : 'Create Tenant'}
        </button>
      </div>
    </ModalShell>
  );
}

// ======================== CREATE API KEY MODAL ========================
function CreateApiKeyModal({ tenantId, tenantName, onClose }: { tenantId: string; tenantName: string; onClose: () => void }) {
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [key, setKey] = useState<string | null>(null);
  const [error, setError] = useState('');

  const handleCreate = async () => {
    if (!name) { setError('Key name is required.'); return; }
    setSaving(true); setError('');
    try {
      const res = await createApiKey(tenantId, { name });
      setKey(res?.raw_key ?? res?.key ?? res?.api_key ?? JSON.stringify(res));
    } catch (e: any) { setError(e?.message ?? 'Failed to create key'); }
    finally { setSaving(false); }
  };

  return (
    <ModalShell onClose={onClose} width={440}>
      <div style={{ padding: '14px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div><div style={{ fontSize: 14, fontWeight: 800 }}>Create API Key</div><div style={{ fontSize: 10, color: C.textMut, marginTop: 2 }}>{tenantName}</div></div>
        <button onClick={onClose} className="action-btn" style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.textMut, fontSize: 18, lineHeight: 1 }}>×</button>
      </div>
      <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {error && <div style={{ padding: '8px 12px', borderRadius: 8, background: C.redDim, border: `1px solid ${C.red}44`, color: C.red, fontSize: 11 }}>{error}</div>}
        {key ? (
          <div style={{ animation: 'fadeSlideIn 0.3s ease both' }}>
            <div style={{ padding: '10px 14px', borderRadius: 10, background: C.greenDim, border: `1px solid ${C.green}44`, marginBottom: 12 }}>
              <div style={{ fontSize: 10, color: C.green, fontWeight: 700, marginBottom: 6 }}>Key created — copy it now. It will not be shown again.</div>
              <div style={{ fontFamily: 'monospace', fontSize: 12, color: C.text, wordBreak: 'break-all', background: 'rgba(0,0,0,0.4)', padding: '8px 10px', borderRadius: 7 }}>{key}</div>
            </div>
            <button onClick={() => navigator.clipboard.writeText(key)} className="action-btn" style={{ padding: '7px 14px', borderRadius: 8, fontSize: 11, fontWeight: 700, background: C.greenDim, border: `1px solid ${C.green}44`, color: C.green, cursor: 'pointer', width: '100%' }}>Copy to Clipboard</button>
          </div>
        ) : (
          <div><label style={labelStyle}>Key Name</label><input style={fieldStyle} value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Website Widget, Mobile App" /></div>
        )}
      </div>
      <div style={{ padding: '12px 20px', borderTop: `1px solid ${C.border}`, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
        <button onClick={onClose} className="action-btn" style={{ padding: '8px 16px', borderRadius: 8, fontSize: 12, background: 'none', border: `1px solid ${C.border}`, color: C.textMut, cursor: 'pointer' }}>{key ? 'Done' : 'Cancel'}</button>
        {!key && <button onClick={handleCreate} disabled={saving} className="action-btn" style={{ padding: '8px 20px', borderRadius: 8, fontSize: 12, fontWeight: 700, background: `linear-gradient(135deg, ${C.purple}, #7c3aed)`, border: 'none', color: '#fff', cursor: saving ? 'default' : 'pointer', opacity: saving ? 0.7 : 1 }}>{saving ? 'Creating...' : 'Generate Key'}</button>}
      </div>
    </ModalShell>
  );
}

// ======================== ASSIGN TENANT MODAL ========================
function AssignTenantModal({ userId, userName, currentTenantId, onClose, onAssigned }: { userId: string; userName: string; currentTenantId: string | null; onClose: () => void; onAssigned: () => void; }) {
  const [tenants, setTenants] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string>(currentTenantId ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { fetchAdminTenants().then(setTenants).catch(() => {}); }, []);

  const handleSave = async () => {
    setSaving(true); setError('');
    try { await assignUserTenant(userId, selectedId || null); onAssigned(); onClose(); }
    catch (e: any) { setError(e?.message ?? 'Failed to assign tenant'); }
    finally { setSaving(false); }
  };

  return (
    <ModalShell onClose={onClose} width={420}>
      <div style={{ padding: '14px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div><div style={{ fontSize: 14, fontWeight: 800 }}>Assign Tenant</div><div style={{ fontSize: 10, color: C.textMut, marginTop: 2 }}>{userName}</div></div>
        <button onClick={onClose} className="action-btn" style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.textMut, fontSize: 18, lineHeight: 1 }}>×</button>
      </div>
      <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {error && <div style={{ padding: '8px 12px', borderRadius: 8, background: C.redDim, border: `1px solid ${C.red}44`, color: C.red, fontSize: 11 }}>{error}</div>}
        <div>
          <label style={labelStyle}>Select Tenant</label>
          <select style={fieldStyle} value={selectedId} onChange={e => setSelectedId(e.target.value)}>
            <option value="">— No Tenant (remove access) —</option>
            {tenants.map((t: any) => <option key={t.tenant_id} value={t.tenant_id}>{t.name} ({SUB_TYPE_LABELS[t.subscription_type] ?? t.subscription_type} · {t.subscription_status})</option>)}
          </select>
        </div>
        {selectedId && <div style={{ padding: '8px 12px', borderRadius: 8, background: C.purpleDim, border: `1px solid ${C.border}`, fontSize: 11, color: C.textSec, animation: 'fadeSlideIn 0.2s ease both' }}>User will get access to agents based on the selected tenant&apos;s subscription.</div>}
      </div>
      <div style={{ padding: '12px 20px', borderTop: `1px solid ${C.border}`, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
        <button onClick={onClose} className="action-btn" style={{ padding: '8px 16px', borderRadius: 8, fontSize: 12, background: 'none', border: `1px solid ${C.border}`, color: C.textMut, cursor: 'pointer' }}>Cancel</button>
        <button onClick={handleSave} disabled={saving} className="action-btn" style={{ padding: '8px 20px', borderRadius: 8, fontSize: 12, fontWeight: 700, background: `linear-gradient(135deg, ${C.purple}, #7c3aed)`, border: 'none', color: '#fff', cursor: saving ? 'default' : 'pointer', opacity: saving ? 0.7 : 1 }}>{saving ? 'Saving...' : 'Save'}</button>
      </div>
    </ModalShell>
  );
}

// ======================== OVERVIEW PANEL ========================
function OverviewPanel({ stats, adminProfile }: { stats: any; adminProfile: UserProfile | null }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <FadeIn delay={0}>
        <div className="admin-card" style={{ padding: '20px 24px', borderRadius: 16, background: C.bgCard, border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 18, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', right: -40, top: -40, width: 160, height: 160, borderRadius: '50%', background: `radial-gradient(circle, ${C.gold}18, transparent 70%)`, animation: 'orb 8s ease-in-out infinite', pointerEvents: 'none' }} />
          <Avatar name={adminProfile?.full_name ?? 'Admin'} size={60} />
          <div>
            <div style={{ fontSize: 20, fontWeight: 800, color: C.text, letterSpacing: '-0.5px' }}>{adminProfile?.full_name ?? '—'}</div>
            <div style={{ fontSize: 12, color: C.textMut, marginTop: 2 }}>Super Admin</div>
            <div style={{ fontSize: 11, color: C.textMut, marginTop: 4 }}>✉ {adminProfile?.email}</div>
          </div>
        </div>
      </FadeIn>

      <SectionDivider label="Platform Stats" delay={80} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10 }}>
        <StatCard label="Total Users"    value={stats?.total_users ?? '—'}          sub="All registered"  color={C.purpleLight} delay={100} />
        <StatCard label="Active Subs"    value={stats?.active_subscriptions ?? '—'} sub="Active & trial"  color={C.green}       delay={160} />
        <StatCard label="Tenants"        value={stats?.total_tenants ?? '—'}        sub="Companies"       color={C.gold}        delay={220} />
        <StatCard label="Agent Requests" value={stats?.total_api_requests ?? '—'}   sub="All time"        color={C.blue}        delay={280} />
      </div>

      <SectionDivider label="Subscription Breakdown" delay={320} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {stats?.subscriptions_by_type
          ? Object.entries(stats.subscriptions_by_type).map(([type, count], i) => (
            <FadeIn key={type} delay={360 + i * 50}>
              <div className="admin-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderRadius: 10, background: C.bgCard, border: `1px solid ${C.border}` }}>
                <span style={{ fontSize: 12, color: C.textSec }}>{SUB_TYPE_LABELS[type] ?? type}</span>
                <span style={{ fontSize: 14, fontWeight: 800, color: C.text }}>{count as number}</span>
              </div>
            </FadeIn>
          ))
          : <div style={{ fontSize: 11, color: C.textMut }}>No data available</div>
        }
      </div>

      <SectionDivider label="Today's Activity" delay={480} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {[
          { label: "Requests Today",       value: stats?.requests_today ?? '—',       color: C.gold },
          { label: "Total API Requests",   value: stats?.total_api_requests ?? '—',   color: C.blue },
          { label: "Active Subscriptions", value: stats?.active_subscriptions ?? '—', color: C.green },
        ].map((row, i) => (
          <FadeIn key={row.label} delay={520 + i * 50}>
            <div className="admin-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderRadius: 10, background: C.bgCard, border: `1px solid ${C.border}` }}>
              <span style={{ fontSize: 12, color: C.textSec }}>{row.label}</span>
              <span style={{ fontSize: 16, fontWeight: 800, color: row.color }}>{row.value}</span>
            </div>
          </FadeIn>
        ))}
      </div>
    </div>
  );
}

// ======================== USERS PANEL ========================
function UsersPanel({ users, dataLoading, loadUsers, toggleUserStatus, setAssignModal }: any) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <FadeIn>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 16, fontWeight: 800 }}>All Users <span style={{ fontSize: 12, fontWeight: 500, color: C.textMut }}>({users.length})</span></div>
          <button onClick={loadUsers} className="action-btn" style={{ padding: '7px 14px', borderRadius: 8, fontSize: 11, fontWeight: 600, background: C.purpleDim, border: `1px solid ${C.border}`, color: C.purpleLight, cursor: 'pointer' }}>Refresh</button>
        </div>
      </FadeIn>
      {dataLoading ? <Spinner /> : users.length === 0 ? <div style={{ padding: 40, textAlign: 'center', color: C.textMut, fontSize: 12 }}>No users found</div> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {users.map((u: any, i: number) => (
            <FadeIn key={u.id} delay={i * 40}>
              <div className="admin-card" style={{ padding: '14px 16px', borderRadius: 12, background: C.bgCard, border: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Avatar name={u.full_name || u.email} size={38} />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700 }}>{u.full_name || '—'}</div>
                      <div style={{ fontSize: 10, color: C.textMut }}>{u.email}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {u.role === 'super_admin' ? <Badge label="Admin" color={C.purple} /> : <Badge label="User" color={C.textMut} />}
                    <Badge label={u.is_active ? 'Active' : 'Inactive'} color={u.is_active ? C.green : C.red} />
                  </div>
                </div>
                <div style={{ height: 1, background: C.border }} />
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 10, color: C.textMut }}>Tenant:</span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: u.tenant?.name ? C.textSec : C.textMut }}>{u.tenant?.name ?? 'No tenant'}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => setAssignModal({ userId: u.id, userName: u.full_name || u.email, currentTenantId: u.tenant?.id ?? null })} className="action-btn" style={{ padding: '5px 10px', borderRadius: 7, fontSize: 10, fontWeight: 600, background: C.purpleDim, border: `1px solid ${C.border}`, color: C.purpleLight, cursor: 'pointer' }}>Assign</button>
                    <button onClick={() => toggleUserStatus(u.id, u.is_active)} className="action-btn" style={{ padding: '5px 10px', borderRadius: 7, fontSize: 10, fontWeight: 600, background: u.is_active ? C.redDim : C.greenDim, border: `1px solid ${u.is_active ? C.red + '44' : C.green + '44'}`, color: u.is_active ? C.red : C.green, cursor: 'pointer' }}>{u.is_active ? 'Deactivate' : 'Activate'}</button>
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      )}
    </div>
  );
}

// ======================== TENANTS PANEL ========================
function TenantsPanel({ tenants, dataLoading, loadTenants, setShowCreateTenant, expandedTenant, toggleTenantExpand, tenantKeys, setKeyModal, revokeKey }: any) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <FadeIn>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 16, fontWeight: 800 }}>Tenants <span style={{ fontSize: 12, fontWeight: 500, color: C.textMut }}>({tenants.length})</span></div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={loadTenants} className="action-btn" style={{ padding: '7px 14px', borderRadius: 8, fontSize: 11, fontWeight: 600, background: C.purpleDim, border: `1px solid ${C.border}`, color: C.purpleLight, cursor: 'pointer' }}>Refresh</button>
            <button onClick={() => setShowCreateTenant(true)} className="action-btn" style={{ padding: '7px 16px', borderRadius: 8, fontSize: 11, fontWeight: 700, background: `linear-gradient(135deg, ${C.purple}, #7c3aed)`, border: 'none', color: '#fff', cursor: 'pointer' }}>+ Create Tenant</button>
          </div>
        </div>
      </FadeIn>
      {dataLoading ? <Spinner /> : tenants.length === 0 ? <div style={{ padding: 40, textAlign: 'center', color: C.textMut, fontSize: 12 }}>No tenants found. Create one to get started.</div> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {tenants.map((t: any, i: number) => (
            <FadeIn key={t.tenant_id} delay={i * 50}>
              <div style={{ borderRadius: 12, background: C.bgCard, border: `1px solid ${C.border}`, overflow: 'hidden', transition: 'border-color 0.2s, box-shadow 0.2s' }}>
                <div style={{ padding: '14px 16px', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 8 }} onClick={() => toggleTenantExpand(t.tenant_id)}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700 }}>{t.name}</div>
                      <div style={{ fontSize: 10, color: C.textMut, marginTop: 2 }}>{t.email}</div>
                    </div>
                    <span style={{ color: C.textMut, fontSize: 12, transition: 'transform 0.25s', transform: expandedTenant === t.tenant_id ? 'rotate(180deg)' : 'rotate(0deg)', display: 'inline-block' }}>▼</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 10, color: C.textSec }}>{SUB_TYPE_LABELS[t.subscription_type] ?? t.subscription_type}</span>
                    <span style={{ color: C.border }}>·</span>
                    <Badge label={t.subscription_status} color={SUB_STATUS_COLORS[t.subscription_status] ?? C.textMut} />
                    <span style={{ color: C.border }}>·</span>
                    <span style={{ fontSize: 10, color: C.textMut }}>{t.member_count ?? 0} member{t.member_count !== 1 ? 's' : ''}</span>
                  </div>
                </div>
                {expandedTenant === t.tenant_id && (
                  <div style={{ padding: '12px 16px', borderTop: `1px solid ${C.border}`, background: 'rgba(0,0,0,0.15)', animation: 'fadeSlideIn 0.25s ease both' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: C.textMut }}>API Keys</span>
                      <button onClick={() => setKeyModal({ tenantId: t.tenant_id, tenantName: t.name })} className="action-btn" style={{ padding: '5px 12px', borderRadius: 7, fontSize: 10, fontWeight: 700, background: C.goldDim, border: `1px solid ${C.gold}44`, color: C.gold, cursor: 'pointer' }}>+ New Key</button>
                    </div>
                    {(tenantKeys[t.tenant_id] ?? []).length === 0 ? (
                      <div style={{ fontSize: 10, color: C.textMut, padding: '8px 0' }}>No API keys created yet.</div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                        {(tenantKeys[t.tenant_id] ?? []).map((k: any, ki: number) => (
                          <div key={k.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 10px', borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: `1px solid ${C.border}`, animation: `fadeSlideIn 0.2s ease ${ki * 40}ms both` }}>
                            <div>
                              <span style={{ fontSize: 11, fontWeight: 600 }}>{k.name}</span>
                              <span style={{ marginLeft: 8, fontSize: 9, color: C.textMut, fontFamily: 'monospace' }}>{k.key_prefix}...</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <Badge label={k.is_active ? 'Active' : 'Revoked'} color={k.is_active ? C.green : C.red} />
                              {k.is_active && <button onClick={() => revokeKey(t.tenant_id, k.id)} className="action-btn" style={{ padding: '3px 8px', borderRadius: 6, fontSize: 9, fontWeight: 700, background: C.redDim, border: `1px solid ${C.red}44`, color: C.red, cursor: 'pointer' }}>Revoke</button>}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </FadeIn>
          ))}
        </div>
      )}
    </div>
  );
}

// ======================== LOGS PANEL ========================
function LogsPanel({ logs, dataLoading, loadLogs }: any) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <FadeIn>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 16, fontWeight: 800 }}>Request Logs <span style={{ fontSize: 12, fontWeight: 500, color: C.textMut }}>last 100</span></div>
          <button onClick={loadLogs} className="action-btn" style={{ padding: '7px 14px', borderRadius: 8, fontSize: 11, fontWeight: 600, background: C.purpleDim, border: `1px solid ${C.border}`, color: C.purpleLight, cursor: 'pointer' }}>Refresh</button>
        </div>
      </FadeIn>
      {dataLoading ? <Spinner /> : logs.length === 0 ? <div style={{ padding: 40, textAlign: 'center', color: C.textMut, fontSize: 12 }}>No request logs yet.</div> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {logs.map((log: any, i: number) => (
            <FadeIn key={i} delay={i * 25}>
              <div className="admin-card" style={{ padding: '12px 14px', borderRadius: 10, background: C.bgCard, border: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <PulseDot color={log.status === 'error' ? C.red : C.green} />
                    <span style={{ color: C.textSec, textTransform: 'uppercase', fontSize: 10, fontWeight: 800, letterSpacing: '0.08em' }}>{log.agent_type ?? '—'}</span>
                    <Badge label={log.status ?? 'ok'} color={log.status === 'error' ? C.red : C.green} />
                  </div>
                  <span style={{ fontSize: 10, color: C.textMut }}>{log.created_at ? new Date(log.created_at).toLocaleString() : '—'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 10, color: C.textMut }}>
                  <span>{log.user_email ?? '—'}</span>
                  {log.status_code && <><span>·</span><span>HTTP {log.status_code}</span></>}
                  {log.response_time_ms != null && <><span>·</span><span>{log.response_time_ms}ms</span></>}
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      )}
    </div>
  );
}

// ======================== MAIN ADMIN PAGE ========================
export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [adminProfile, setAdminProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);

  const [stats, setStats]     = useState<any>(null);
  const [users, setUsers]     = useState<any[]>([]);
  const [tenants, setTenants] = useState<any[]>([]);
  const [logs, setLogs]       = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(false);

  const [showCreateTenant, setShowCreateTenant] = useState(false);
  const [keyModal, setKeyModal] = useState<{ tenantId: string; tenantName: string } | null>(null);
  const [expandedTenant, setExpandedTenant] = useState<string | null>(null);
  const [tenantKeys, setTenantKeys] = useState<Record<string, any[]>>({});
  const [assignModal, setAssignModal] = useState<{ userId: string; userName: string; currentTenantId: string | null } | null>(null);

  useEffect(() => {
    if (!isAuthenticated()) { router.replace('/'); return; }
    fetchProfile().then(p => { setAdminProfile(p); if (p.role !== 'super_admin') setAccessDenied(true); })
      .catch(() => router.replace('/')).finally(() => setLoading(false));
  }, [router]);

  useEffect(() => {
    if (activeTab === 'overview') loadStats();
    if (activeTab === 'users') loadUsers();
    if (activeTab === 'tenants') loadTenants();
    if (activeTab === 'logs') loadLogs();
  }, [activeTab]);

  const loadStats   = async () => { try { setStats(await fetchAdminStats()); } catch {} };
  const loadUsers   = async () => { setDataLoading(true); try { setUsers(await fetchAdminUsers()); } catch {} finally { setDataLoading(false); } };
  const loadTenants = async () => { setDataLoading(true); try { setTenants(await fetchAdminTenants()); } catch {} finally { setDataLoading(false); } };
  const loadLogs    = async () => { setDataLoading(true); try { setLogs(await fetchAdminLogs()); } catch {} finally { setDataLoading(false); } };

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try { await updateUserStatus(userId, !currentStatus); setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_active: !currentStatus } : u)); } catch {}
  };

  const loadTenantKeys = async (tenantId: string) => {
    try {
      const res = await apiFetch(`/api/auth/admin/tenants/${tenantId}/keys/`);
      const keys = res?.keys ?? res?.data ?? [];
      setTenantKeys(prev => ({ ...prev, [tenantId]: Array.isArray(keys) ? keys : [] }));
    } catch {}
  };

  const revokeKey = async (tenantId: string, keyId: string) => {
    try { await apiFetch(`/api/auth/admin/tenants/${tenantId}/keys/${keyId}/revoke/`, { method: 'POST' }); loadTenantKeys(tenantId); } catch {}
  };

  const toggleTenantExpand = (tenantId: string) => {
    if (expandedTenant === tenantId) { setExpandedTenant(null); }
    else { setExpandedTenant(tenantId); if (!tenantKeys[tenantId]) loadTenantKeys(tenantId); }
  };

  const NAV_ITEMS: { id: Tab; icon: string; label: string; sub: string }[] = [
    { id: 'overview', icon: '◎', label: 'Overview',     sub: 'Stats & profile' },
    { id: 'users',    icon: '◉', label: 'Users',        sub: 'Manage accounts' },
    { id: 'tenants',  icon: '▣', label: 'Tenants',      sub: 'Organizations' },
    { id: 'logs',     icon: '≡', label: 'Request Logs', sub: 'Activity & audit' },
  ];

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, color: C.text }}>
        <style dangerouslySetInnerHTML={{ __html: STYLES }} />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', border: `2px solid ${C.border}`, borderTopColor: C.purple, animation: 'spinRing 0.8s linear infinite' }} />
          <div style={{ fontSize: 12, color: C.textMut }}>Loading admin portal...</div>
        </div>
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONT, color: C.text, flexDirection: 'column', gap: 12, animation: 'fadeSlideIn 0.4s ease both' }}>
        <style dangerouslySetInnerHTML={{ __html: STYLES }} />
        <div style={{ fontSize: 48 }}>🔒</div>
        <div style={{ fontSize: 18, fontWeight: 800 }}>Access Denied</div>
        <div style={{ fontSize: 12, color: C.textMut }}>This page is restricted to super administrators.</div>
        <button onClick={() => router.push('/platform')} className="action-btn" style={{ marginTop: 8, padding: '9px 20px', borderRadius: 10, fontSize: 12, fontWeight: 700, background: C.purpleDim, border: `1px solid ${C.border}`, color: C.purpleLight, cursor: 'pointer' }}>Back to Dashboard</button>
      </div>
    );
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />
      <div style={{ minHeight: '100vh', background: C.bg, fontFamily: FONT, color: C.text, display: 'flex' }}>
        {/* Modals */}
        {showCreateTenant && <CreateTenantModal onClose={() => setShowCreateTenant(false)} onCreated={loadTenants} />}
        {keyModal && <CreateApiKeyModal tenantId={keyModal.tenantId} tenantName={keyModal.tenantName} onClose={() => { setKeyModal(null); if (expandedTenant) loadTenantKeys(expandedTenant); }} />}
        {assignModal && <AssignTenantModal userId={assignModal.userId} userName={assignModal.userName} currentTenantId={assignModal.currentTenantId} onClose={() => setAssignModal(null)} onAssigned={loadUsers} />}

        {/* ===== SIDEBAR ===== */}
        <div style={{
          width: 240, flexShrink: 0, background: C.sidebar, borderRight: `1px solid ${C.sidebarBorder}`,
          display: 'flex', flexDirection: 'column', position: 'sticky', top: 0, height: '100vh', overflowY: 'auto',
          animation: 'fadeSlideLeft 0.45s cubic-bezier(0.22,1,0.36,1) both',
        }}>
          {/* Ambient orb */}
          <div style={{ position: 'absolute', bottom: 60, left: -30, width: 120, height: 120, borderRadius: '50%', background: `radial-gradient(circle, ${C.purple}18, transparent 70%)`, animation: 'orb 10s ease-in-out infinite', pointerEvents: 'none' }} />

          <div style={{ padding: '16px 14px 8px' }}>
            <button onClick={() => router.push('/platform')} className="nav-btn" style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.textMut, display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 600, padding: '4px 6px', borderRadius: 6 }}>← BACK</button>
          </div>

          <div style={{ padding: '8px 20px 6px', fontSize: 9, fontWeight: 700, color: C.textMut, letterSpacing: '0.12em', textTransform: 'uppercase' }}>SETTINGS</div>

          <div style={{ padding: '4px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
            {NAV_ITEMS.map((item, i) => (
              <NavItem key={item.id} icon={item.icon} label={item.label} sub={item.sub} active={activeTab === item.id} onClick={() => setActiveTab(item.id)} delay={i * 60 + 100} />
            ))}
          </div>

          <div style={{ marginTop: 'auto', padding: '16px 14px', borderTop: `1px solid ${C.sidebarBorder}` }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: C.textSec, marginBottom: 2 }}>{adminProfile?.full_name}</div>
            <div style={{ fontSize: 10, color: C.textMut }}>{adminProfile?.email}</div>
            <div style={{ marginTop: 6 }}>
              <span style={{ fontSize: 9, fontWeight: 800, color: C.purpleLight, background: C.purpleDim, padding: '2px 8px', borderRadius: 5, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Super Admin</span>
            </div>
          </div>
        </div>

        {/* ===== MAIN CONTENT ===== */}
        <div style={{ flex: 1, padding: '32px 36px', overflowY: 'auto' }}>
          {activeTab === 'overview' && <OverviewPanel stats={stats} adminProfile={adminProfile} />}
          {activeTab === 'users'    && <UsersPanel users={users} dataLoading={dataLoading} loadUsers={loadUsers} toggleUserStatus={toggleUserStatus} setAssignModal={setAssignModal} />}
          {activeTab === 'tenants'  && <TenantsPanel tenants={tenants} dataLoading={dataLoading} loadTenants={loadTenants} setShowCreateTenant={setShowCreateTenant} expandedTenant={expandedTenant} toggleTenantExpand={toggleTenantExpand} tenantKeys={tenantKeys} setKeyModal={setKeyModal} revokeKey={revokeKey} />}
          {activeTab === 'logs'     && <LogsPanel logs={logs} dataLoading={dataLoading} loadLogs={loadLogs} />}
        </div>
      </div>
    </>
  );
}