'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

// ── Types ──────────────────────────────────────────────────────────────────────
interface Tenant {
  id: string;
  name: string;
  email: string;
  subscribed_agents: 'mark' | 'hr' | 'both' | 'none';
  monthly_quota: number;
  subscription_end: string | null;
  is_active: boolean;
  created_at: string;
}

interface AdminProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  is_staff: boolean;
  is_superuser: boolean;
}

interface ChatSession {
  session_id: string;
  user_name?: string;
  user_email?: string;
  company_name?: string;
  message_count?: number;
  created_at?: string;
  last_active?: string;
  is_active?: boolean;
}

interface AgentStatus {
  mark?: { status: string; endpoint?: string };
  hr?: { status: string; endpoint?: string };
}

type Panel = 'tenants' | 'create' | 'agent-config' | 'waitlist' | 'sessions' | 'tenant-detail' | 'profile';

// ── API Helpers ───────────────────────────────────────────────────────────────
const BASE = process.env.NEXT_PUBLIC_API_URL || '';

function getToken() {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('admin_access_token') || '';
}

function apiHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getToken()}`,
  };
}

async function apiFetch(path: string, opts?: RequestInit) {
  const res = await fetch(`${BASE}${path}`, { ...opts, headers: { ...apiHeaders(), ...(opts?.headers || {}) } });
  let data: any = {};
  try { data = await res.json(); } catch { }
  return { ok: res.ok, status: res.status, data };
}

// ── Sub-components ────────────────────────────────────────────────────────────
function SubscriptionBadge({ type }: { type: string }) {
  const map: Record<string, { color: string; bg: string; label: string }> = {
    both: { color: '#4ade80', bg: 'rgba(74,222,128,0.1)', label: 'MARK + HR' },
    mark: { color: '#f0b849', bg: 'rgba(240,184,73,0.1)', label: 'MARK' },
    hr:   { color: '#60a5fa', bg: 'rgba(96,165,250,0.1)', label: 'HR' },
    none: { color: '#666',    bg: 'rgba(100,100,100,0.1)', label: 'NONE' },
  };
  const s = map[type] || map.none;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 4, background: s.bg, border: `1px solid ${s.color}33`, fontFamily: "'DM Mono',monospace", fontSize: 10, letterSpacing: '0.1em', color: s.color, textTransform: 'uppercase' }}>
      {s.label}
    </span>
  );
}

function fmt(date: string | null | undefined) {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function fmtTime(date: string | null | undefined) {
  if (!date) return '—';
  return new Date(date).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// ── Toast Hook ────────────────────────────────────────────────────────────────
function useToast() {
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' | 'info' } | null>(null);
  const show = (msg: string, type: 'ok' | 'err' | 'info' = 'ok') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };
  return { toast, show };
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const router = useRouter();
  const { toast, show: showToast } = useToast();

  // State
  const [panel, setPanel]                   = useState<Panel>('tenants');
  const [tenants, setTenants]               = useState<Tenant[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [sessions, setSessions]             = useState<ChatSession[]>([]);
  const [agentStatus, setAgentStatus]       = useState<AgentStatus | null>(null);
  const [waitlistStats, setWaitlistStats]   = useState<{ count: number } | null>(null);
  const [adminProfile, setAdminProfile]     = useState<AdminProfile | null>(null);
  const [loading, setLoading]               = useState(false);
  const [validatingSession, setValidatingSession] = useState(true);

  // Session detail
  const [sessionDetail, setSessionDetail]   = useState<ChatSession | null>(null);
  const [sessionDetailOpen, setSessionDetailOpen] = useState(false);

  // Forms
  const [cf, setCf] = useState({ name: '', email: '', subscribed_agents: 'both', monthly_quota: '5000' });
  const [cfErr, setCfErr] = useState<Record<string, string>>({});
  const [sf, setSf] = useState({ subscribed_agents: 'both', subscription_end: '' });
  const [subModalOpen, setSubModalOpen] = useState(false);
  const [acf, setAcf] = useState({ agent_type: 'mark', endpoint_url: '', timeout_seconds: '30', tenant_id: '' });
  const [acfErr, setAcfErr] = useState<Record<string, string>>({});
  const [profileEdit, setProfileEdit] = useState({ first_name: '', last_name: '' });
  const [profileEditMode, setProfileEditMode] = useState(false);

//   // ── Auth: validate session via API ─────────────────────────────────────────
//   useEffect(() => {
//     const validate = async () => {
//       const token = localStorage.getItem('admin_access_token');
//       if (!token) { router.push('/'); return; }

//       try {
//         const { ok, status } = await apiFetch('/api/auth/session/validate/');
//         if (!ok || status === 401 || status === 403) {
//           // Try refresh
//           const refresh = localStorage.getItem('admin_refresh_token');
//           if (refresh) {
//             const { ok: rok, data } = await apiFetch('/api/auth/refresh/', {
//               method: 'POST',
//               body: JSON.stringify({ refresh_token: refresh }),
//             });
//             if (rok && data.access_token) {
//               localStorage.setItem('admin_access_token', data.access_token);
//             } else {
//               handleLogout();
//               return;
//             }
//           } else {
//             handleLogout();
//             return;
//           }
//         }
//       } catch {
//         // Network error — allow dashboard but warn
//         showToast('Session validation failed — working offline', 'info');
//       } finally {
//         setValidatingSession(false);
//       }
//     };
//     validate();
//   }, []);
useEffect(() => {
  // TEMP: Skip auth — remove this before production
  setValidatingSession(false);
}, []);

  // ── Fetch admin profile ────────────────────────────────────────────────────
  const loadProfile = useCallback(async () => {
    try {
      const { ok, data } = await apiFetch('/api/auth/profile/');
      if (ok) {
        setAdminProfile(data.user || data);
        setProfileEdit({ first_name: data.user?.first_name || data.first_name || '', last_name: data.user?.last_name || data.last_name || '' });
      }
    } catch { }
  }, []);

  // ── Check agent access ─────────────────────────────────────────────────────
  const checkAccess = useCallback(async () => {
    try {
      const { ok, data } = await apiFetch('/api/auth/access/');
      if (ok) setAgentStatus(data);
    } catch { }
  }, []);

  // ── Load tenants ───────────────────────────────────────────────────────────
  const loadTenants = useCallback(async () => {
    setLoading(true);
    try {
      const { ok, data } = await apiFetch('/api/tenants/');
      if (ok) setTenants(data.results || data || []);
      else showToast('Failed to load tenants', 'err');
    } catch { showToast('Network error', 'err'); }
    finally { setLoading(false); }
  }, []);

  // ── Load waitlist stats ────────────────────────────────────────────────────
  const loadWaitlist = useCallback(async () => {
    try {
      const { ok, data } = await apiFetch('/api/waitlist/stats/');
      if (ok) setWaitlistStats(data);
    } catch { }
  }, []);

  // ── Load tenant detail ─────────────────────────────────────────────────────
  const loadTenantDetail = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const { ok, data } = await apiFetch(`/api/tenants/${id}/`);
      if (ok) setSelectedTenant(data);
      else showToast('Failed to load tenant detail', 'err');
    } catch { showToast('Network error', 'err'); }
    finally { setLoading(false); }
  }, []);

  // ── Load sessions (public endpoint, lists known session IDs from chatbot) ──
  // Note: The JSON has no "list all sessions" endpoint — sessions are identified by session_id
  // We store known session IDs in localStorage when they are created
  const loadSessions = useCallback(async () => {
    try {
      const stored = localStorage.getItem('admin_known_sessions');
      if (!stored) { setSessions([]); return; }
      const ids: string[] = JSON.parse(stored);
      const results: ChatSession[] = [];
      for (const sid of ids.slice(0, 20)) {
        try {
          const { ok, data } = await apiFetch(`/api/chat/session/${sid}/`);
          if (ok) results.push({ ...data, session_id: sid });
        } catch { }
      }
      setSessions(results);
    } catch { setSessions([]); }
  }, []);

  useEffect(() => {
    if (!validatingSession) {
      loadProfile();
      loadTenants();
      loadWaitlist();
      checkAccess();
    }
  }, [validatingSession]);

  useEffect(() => {
    if (panel === 'sessions') loadSessions();
  }, [panel]);

  // ── Create tenant ──────────────────────────────────────────────────────────
  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!cf.name) errs.name = 'Required';
    if (!cf.email) errs.email = 'Required';
    if (!cf.monthly_quota || isNaN(+cf.monthly_quota)) errs.quota = 'Valid number required';
    if (Object.keys(errs).length) { setCfErr(errs); return; }

    setLoading(true);
    try {
      const { ok, data } = await apiFetch('/api/tenants/', {
        method: 'POST',
        body: JSON.stringify({ name: cf.name, email: cf.email, subscribed_agents: cf.subscribed_agents, monthly_quota: +cf.monthly_quota }),
      });
      if (ok) {
        showToast(`Tenant "${cf.name}" created ✓`);
        setCf({ name: '', email: '', subscribed_agents: 'both', monthly_quota: '5000' });
        loadTenants();
        setPanel('tenants');
      } else {
        showToast(data?.message || 'Create failed', 'err');
      }
    } catch { showToast('Network error', 'err'); }
    finally { setLoading(false); }
  };

  // ── Update subscription ────────────────────────────────────────────────────
  const handleUpdateSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTenant) return;
    setLoading(true);
    try {
      const body: Record<string, unknown> = { subscribed_agents: sf.subscribed_agents };
      if (sf.subscription_end) body.subscription_end = new Date(sf.subscription_end).toISOString();
      const { ok, data } = await apiFetch(`/api/tenants/${selectedTenant.id}/subscription/`, { method: 'POST', body: JSON.stringify(body) });
      if (ok) {
        showToast('Subscription updated ✓');
        setSubModalOpen(false);
        if (panel === 'tenant-detail') loadTenantDetail(selectedTenant.id);
        loadTenants();
      } else showToast(data?.message || 'Update failed', 'err');
    } catch { showToast('Network error', 'err'); }
    finally { setLoading(false); }
  };

  // ── Configure agent ────────────────────────────────────────────────────────
  const handleAgentConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!acf.tenant_id) errs.tid = 'Select a tenant';
    if (!acf.endpoint_url) errs.url = 'Endpoint URL required';
    if (Object.keys(errs).length) { setAcfErr(errs); return; }

    setLoading(true);
    try {
      const { ok, data } = await apiFetch(`/api/tenants/${acf.tenant_id}/agents/`, {
        method: 'POST',
        body: JSON.stringify({ agent_type: acf.agent_type, endpoint_url: acf.endpoint_url, timeout_seconds: +acf.timeout_seconds }),
      });
      if (ok) { showToast('Agent endpoint configured ✓'); setAcf(p => ({ ...p, endpoint_url: '' })); }
      else showToast(data?.message || 'Config failed', 'err');
    } catch { showToast('Network error', 'err'); }
    finally { setLoading(false); }
  };

  // ── Profile update ─────────────────────────────────────────────────────────
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { ok, data } = await apiFetch('/api/auth/profile/update/', {
        method: 'PUT',
        body: JSON.stringify(profileEdit),
      });
      if (ok) {
        showToast('Profile updated ✓');
        setProfileEditMode(false);
        loadProfile();
      } else showToast(data?.message || 'Update failed', 'err');
    } catch { showToast('Network error', 'err'); }
    finally { setLoading(false); }
  };

  // ── Session actions ────────────────────────────────────────────────────────
  const handleResetSession = async (sid: string) => {
    try {
      const { ok } = await apiFetch('/api/chat/session/reset/', { method: 'POST', body: JSON.stringify({ session_id: sid }) });
      if (ok) { showToast('Session reset ✓'); loadSessions(); }
      else showToast('Reset failed', 'err');
    } catch { showToast('Network error', 'err'); }
  };

  const handleCloseSession = async (sid: string, deleteMessages = false) => {
    try {
      const { ok } = await apiFetch('/api/chat/session/close/', { method: 'POST', body: JSON.stringify({ session_id: sid, delete_messages: deleteMessages }) });
      if (ok) {
        showToast(`Session ${deleteMessages ? 'deleted' : 'closed'} ✓`);
        // Remove from known sessions
        const stored = localStorage.getItem('admin_known_sessions');
        if (stored) {
          const ids: string[] = JSON.parse(stored);
          localStorage.setItem('admin_known_sessions', JSON.stringify(ids.filter(i => i !== sid)));
        }
        setSessions(p => p.filter(s => s.session_id !== sid));
        setSessionDetailOpen(false);
      } else showToast('Close failed', 'err');
    } catch { showToast('Network error', 'err'); }
  };

  const handleViewSession = async (sid: string) => {
    try {
      const { ok, data } = await apiFetch(`/api/chat/session/${sid}/`);
      if (ok) { setSessionDetail({ ...data, session_id: sid }); setSessionDetailOpen(true); }
      else showToast('Failed to load session', 'err');
    } catch { showToast('Network error', 'err'); }
  };

  // ── Logout ─────────────────────────────────────────────────────────────────
  const handleLogout = () => {
    ['admin_access_token', 'admin_refresh_token', 'admin_user'].forEach(k => localStorage.removeItem(k));
    router.push('/');
  };

  // ── Loading screen ─────────────────────────────────────────────────────────
  if (validatingSession) {
    return (
      <div style={{ minHeight: '100vh', background: '#04030c', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, fontFamily: "'DM Mono',monospace" }}>
        <div style={{ width: 32, height: 32, border: '2px solid rgba(240,184,73,0.2)', borderTopColor: '#f0b849', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
        <div style={{ fontSize: 11, letterSpacing: '0.18em', color: 'rgba(240,184,73,0.4)', textTransform: 'uppercase' }}>Validating session…</div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const adminName = adminProfile ? `${adminProfile.first_name} ${adminProfile.last_name}`.trim() || adminProfile.email : 'Admin';

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #04030c; color: #f0ead8; font-family: 'DM Mono', monospace; }

        @keyframes fadeUp  { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        @keyframes slideIn { from { opacity:0; transform:translateX(-10px); } to { opacity:1; transform:translateX(0); } }
        @keyframes toastIn { from { opacity:0; transform:translateX(40px) scale(0.95); } to { opacity:1; transform:translateX(0) scale(1); } }
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes blink   { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes pulse   { 0%,100%{opacity:1} 50%{opacity:0.35} }
        @keyframes scan    { 0%{top:-60px} 100%{top:calc(100% + 60px)} }
        @keyframes orb     { 0%{transform:translate(-50%,-50%) rotate(0deg)} 100%{transform:translate(-50%,-50%) rotate(360deg)} }

        /* Layout */
        .ad-shell { display:flex; min-height:100vh; }

        /* Sidebar */
        .ad-sidebar {
          width:230px; flex-shrink:0;
          background:rgba(6,5,16,0.99);
          border-right:1px solid rgba(240,184,73,0.1);
          display:flex; flex-direction:column;
          position:fixed; top:0; left:0; height:100vh; z-index:100;
        }
        .ad-logo { padding:20px 18px 16px; border-bottom:1px solid rgba(240,184,73,0.07); display:flex; align-items:center; gap:10px; }
        .ad-nav  { flex:1; padding:10px 8px; display:flex; flex-direction:column; gap:1px; overflow-y:auto; }
        .ad-nav-section { font-size:8.5px; letter-spacing:0.2em; color:rgba(240,184,73,0.22); text-transform:uppercase; padding:10px 10px 4px; }
        .nav-btn {
          display:flex; align-items:center; gap:9px;
          padding:9px 11px; border-radius:8px;
          background:none; border:none; cursor:pointer;
          color:rgba(200,185,150,0.4); font-family:'DM Mono',monospace;
          font-size:10.5px; letter-spacing:0.06em; text-align:left;
          transition:all 0.15s; width:100%; text-transform:uppercase;
        }
        .nav-btn:hover  { background:rgba(240,184,73,0.06); color:rgba(240,184,73,0.7); }
        .nav-btn.active { background:rgba(240,184,73,0.1); color:#f0b849; border:1px solid rgba(240,184,73,0.14); }
        .nav-btn.red    { color:rgba(248,113,113,0.5); }
        .nav-btn.red:hover { background:rgba(248,113,113,0.07); color:#f87171; }

        /* Topbar */
        .ad-topbar {
          height:54px; background:rgba(6,5,16,0.95); backdrop-filter:blur(20px);
          border-bottom:1px solid rgba(240,184,73,0.08);
          display:flex; align-items:center; justify-content:space-between;
          padding:0 28px; position:sticky; top:0; z-index:50;
        }

        /* Main */
        .ad-main  { flex:1; margin-left:230px; display:flex; flex-direction:column; min-height:100vh; }
        .ad-content { flex:1; padding:26px 28px; animation:fadeUp 0.28s ease; }

        /* Cards */
        .card {
          background:rgba(9,8,22,0.92);
          border:1px solid rgba(240,184,73,0.1);
          border-radius:12px; overflow:hidden;
          position:relative;
        }
        .card::before { content:''; position:absolute; top:0; left:0; right:0; height:1px; background:linear-gradient(90deg,transparent,rgba(240,184,73,0.2),transparent); pointer-events:none; }
        .card-header {
          padding:15px 20px; border-bottom:1px solid rgba(240,184,73,0.07);
          display:flex; align-items:center; justify-content:space-between;
        }
        .card-title { font-size:13px; font-weight:600; color:#f0ead8; }
        .card-sub   { font-size:10px; color:rgba(200,185,150,0.3); margin-top:2px; letter-spacing:0.03em; }

        /* Stats grid */
        .stat-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(170px,1fr)); gap:12px; margin-bottom:22px; }
        .stat-card {
          background:rgba(9,8,22,0.92); border:1px solid rgba(240,184,73,0.1); border-radius:12px;
          padding:18px 20px; position:relative; overflow:hidden;
          animation:fadeUp 0.28s ease both;
        }
        .stat-card::before { content:''; position:absolute; top:0; left:0; right:0; height:1px; background:linear-gradient(90deg,transparent,rgba(240,184,73,0.18),transparent); }
        .stat-val  { font-size:28px; font-weight:700; line-height:1; }
        .stat-lbl  { font-size:9px; letter-spacing:0.16em; color:rgba(200,185,150,0.35); text-transform:uppercase; margin-top:6px; }

        /* Table */
        .ad-table  { width:100%; border-collapse:collapse; }
        .ad-table th { padding:10px 16px; text-align:left; font-size:9px; letter-spacing:0.16em; text-transform:uppercase; color:rgba(240,184,73,0.38); border-bottom:1px solid rgba(240,184,73,0.07); background:rgba(240,184,73,0.02); white-space:nowrap; }
        .ad-table td { padding:13px 16px; border-bottom:1px solid rgba(255,255,255,0.03); font-size:11.5px; color:rgba(230,218,190,0.75); vertical-align:middle; }
        .ad-table tr:hover td { background:rgba(240,184,73,0.025); }
        .ad-table tr:last-child td { border-bottom:none; }

        /* Buttons */
        .btn { display:inline-flex; align-items:center; gap:6px; padding:8px 16px; border-radius:8px; border:none; cursor:pointer; font-family:'DM Mono',monospace; font-size:10.5px; letter-spacing:0.08em; text-transform:uppercase; font-weight:500; transition:all 0.15s; white-space:nowrap; }
        .btn.primary { background:linear-gradient(135deg,#e8a835,#f5d070); color:#0a0a1a; }
        .btn.primary:hover { box-shadow:0 4px 20px rgba(240,184,73,0.28); transform:translateY(-1px); }
        .btn.ghost   { background:transparent; border:1px solid rgba(240,184,73,0.18); color:rgba(240,184,73,0.6); }
        .btn.ghost:hover { background:rgba(240,184,73,0.06); border-color:rgba(240,184,73,0.38); color:#f0b849; }
        .btn.danger  { background:rgba(220,38,38,0.1); border:1px solid rgba(220,38,38,0.22); color:#f87171; }
        .btn.danger:hover { background:rgba(220,38,38,0.18); }
        .btn.blue    { background:rgba(96,165,250,0.1); border:1px solid rgba(96,165,250,0.2); color:#60a5fa; }
        .btn.blue:hover { background:rgba(96,165,250,0.18); }
        .btn.sm   { padding:5px 11px; font-size:9.5px; }
        .btn.full { width:100%; justify-content:center; }
        .btn:disabled { opacity:0.5; cursor:not-allowed; transform:none !important; box-shadow:none !important; }

        /* Forms */
        .form-group { margin-bottom:14px; }
        .form-label { display:block; font-size:9px; letter-spacing:0.16em; text-transform:uppercase; color:rgba(240,184,73,0.42); margin-bottom:5px; }
        .form-input {
          width:100%; background:rgba(255,255,255,0.02); border:1px solid rgba(240,184,73,0.14);
          border-radius:8px; padding:9px 12px; color:#f0ead8;
          font-family:'DM Mono',monospace; font-size:12.5px; outline:none;
          transition:border-color 0.15s, box-shadow 0.15s; box-sizing:border-box;
        }
        .form-input:focus { border-color:rgba(240,184,73,0.42); box-shadow:0 0 0 2px rgba(240,184,73,0.07); }
        .form-input.err { border-color:rgba(255,107,107,0.45); }
        .form-select {
          width:100%; background:rgba(9,8,22,0.95); border:1px solid rgba(240,184,73,0.14);
          border-radius:8px; padding:9px 32px 9px 12px; color:#f0ead8;
          font-family:'DM Mono',monospace; font-size:12.5px; outline:none; cursor:pointer;
          appearance:none;
          background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(240,184,73,0.35)' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
          background-repeat:no-repeat; background-position:right 12px center;
          transition:border-color 0.15s;
        }
        .form-select:focus { border-color:rgba(240,184,73,0.42); }
        .form-select option { background:#090816; }
        .err-msg  { font-size:10px; color:#ff6b6b; margin-top:4px; }
        .form-row { display:grid; grid-template-columns:1fr 1fr; gap:14px; }

        /* Modal */
        .modal-backdrop { position:fixed; inset:0; background:rgba(0,0,0,0.8); backdrop-filter:blur(8px); z-index:200; display:flex; align-items:center; justify-content:center; padding:20px; }
        .modal { background:rgba(9,8,22,0.99); border:1px solid rgba(240,184,73,0.18); border-radius:14px; padding:28px; width:100%; max-width:440px; animation:fadeUp 0.2s ease; position:relative; }
        .modal-close { position:absolute; top:14px; right:14px; background:rgba(240,184,73,0.06); border:1px solid rgba(240,184,73,0.12); border-radius:6px; width:26px; height:26px; display:flex; align-items:center; justify-content:center; cursor:pointer; color:rgba(240,184,73,0.4); font-size:12px; transition:all 0.15s; }
        .modal-close:hover { background:rgba(240,184,73,0.12); color:rgba(240,184,73,0.8); }

        /* Toast */
        .toast { position:fixed; bottom:24px; right:24px; z-index:500; padding:11px 18px; border-radius:9px; display:flex; align-items:center; gap:9px; font-family:'DM Mono',monospace; font-size:11px; letter-spacing:0.04em; animation:toastIn 0.25s ease; backdrop-filter:blur(16px); }
        .toast.ok   { background:rgba(8,28,16,0.97); border:1px solid rgba(74,222,128,0.28); color:#4ade80; }
        .toast.err  { background:rgba(28,8,8,0.97); border:1px solid rgba(248,113,113,0.28); color:#f87171; }
        .toast.info { background:rgba(8,16,28,0.97); border:1px solid rgba(96,165,250,0.28); color:#60a5fa; }

        /* Spinner */
        .spin  { display:inline-block; width:14px; height:14px; border:2px solid rgba(240,184,73,0.15); border-top-color:#f0b849; border-radius:50%; animation:spin 0.7s linear infinite; }
        .spin.sm { width:10px; height:10px; border-width:1.5px; }
        .spin.white { border-top-color:#0a0a1a; border-color:rgba(0,0,0,0.15); }

        /* Misc */
        .dot-live { width:7px; height:7px; border-radius:50%; background:#4ade80; animation:pulse 2s ease-in-out infinite; flex-shrink:0; }
        .dot-off  { width:7px; height:7px; border-radius:50%; background:#666; flex-shrink:0; }
        .cursor   { display:inline-block; width:6px; height:11px; background:#f0b849; border-radius:1px; animation:blink 1s step-end infinite; vertical-align:middle; margin-left:3px; }
        .divider  { height:1px; background:rgba(240,184,73,0.07); margin:12px 0; }
        .empty    { padding:44px 24px; text-align:center; color:rgba(200,185,150,0.28); font-size:11px; letter-spacing:0.06em; }
        .mono     { font-family:'DM Mono',monospace; }
        .tag      { display:inline-flex; align-items:center; padding:2px 8px; border-radius:4px; font-size:9.5px; letter-spacing:0.1em; text-transform:uppercase; font-family:'DM Mono',monospace; }

        /* Profile */
        .avatar-lg { width:52px; height:52px; border-radius:12px; background:linear-gradient(135deg,#d99830,#f5d070); display:flex; align-items:center; justify-content:center; font-size:18px; font-weight:700; color:#0a0a1a; letter-spacing:0.04em; flex-shrink:0; }

        /* Scan overlay */
        .scan-wrap { position:relative; overflow:hidden; }
        .scan-wrap::after { content:''; position:absolute; left:0; right:0; height:60px; background:linear-gradient(180deg,transparent,rgba(240,184,73,0.018),transparent); animation:scan 5s ease-in-out infinite; pointer-events:none; z-index:1; }

        /* Access indicator */
        .access-pill { display:inline-flex; align-items:center; gap:5px; padding:3px 10px; border-radius:20px; font-size:9.5px; letter-spacing:0.1em; text-transform:uppercase; }
        .access-pill.up { background:rgba(74,222,128,0.1); border:1px solid rgba(74,222,128,0.22); color:#4ade80; }
        .access-pill.dn { background:rgba(248,113,113,0.1); border:1px solid rgba(248,113,113,0.22); color:#f87171; }

        @media(max-width:900px) { .form-row { grid-template-columns:1fr; } }
      `}</style>

      {/* Toast */}
      {toast && (
        <div className={`toast ${toast.type}`}>
          {toast.type === 'ok'   && <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>}
          {toast.type === 'err'  && <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>}
          {toast.type === 'info' && <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>}
          {toast.msg}
        </div>
      )}

      {/* Subscription Modal */}
      {subModalOpen && selectedTenant && (
        <div className="modal-backdrop" onClick={() => setSubModalOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSubModalOpen(false)}>✕</button>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 9.5, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(240,184,73,0.38)', marginBottom: 4 }}>Update Subscription</div>
              <div style={{ fontSize: 17, fontWeight: 700, color: '#f0ead8' }}>{selectedTenant.name}</div>
              <div style={{ fontSize: 10.5, color: 'rgba(200,185,150,0.35)', marginTop: 3 }}>{selectedTenant.email}</div>
            </div>
            <form onSubmit={handleUpdateSubscription}>
              <div className="form-group">
                <label className="form-label">Subscribed Agents</label>
                <select className="form-select" value={sf.subscribed_agents} onChange={e => setSf(p => ({ ...p, subscribed_agents: e.target.value }))}>
                  <option value="both">Both (Mark + HR)</option>
                  <option value="mark">Mark only</option>
                  <option value="hr">HR only</option>
                  <option value="none">None</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Subscription End Date</label>
                <input type="datetime-local" className="form-input" value={sf.subscription_end} onChange={e => setSf(p => ({ ...p, subscription_end: e.target.value }))} />
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                <button type="submit" className="btn primary full" disabled={loading}>
                  {loading ? <><span className="spin sm white" /> Saving…</> : '→ update_subscription()'}
                </button>
                <button type="button" className="btn ghost" onClick={() => setSubModalOpen(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Session Detail Modal */}
      {sessionDetailOpen && sessionDetail && (
        <div className="modal-backdrop" onClick={() => setSessionDetailOpen(false)}>
          <div className="modal" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSessionDetailOpen(false)}>✕</button>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 9.5, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(240,184,73,0.38)', marginBottom: 4 }}>Session Detail</div>
              <div style={{ fontSize: 12, fontFamily: 'DM Mono', color: '#f0b849', wordBreak: 'break-all' }}>{sessionDetail.session_id}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
              {[
                { label: 'User Name',    val: sessionDetail.user_name    || '—' },
                { label: 'User Email',   val: sessionDetail.user_email   || '—' },
                { label: 'Company',      val: sessionDetail.company_name || '—' },
                { label: 'Messages',     val: sessionDetail.message_count?.toString() || '—' },
                { label: 'Created',      val: fmtTime(sessionDetail.created_at) },
                { label: 'Last Active',  val: fmtTime(sessionDetail.last_active) },
              ].map((row, i) => (
                <div key={i} style={{ padding: '10px 12px', background: 'rgba(240,184,73,0.03)', border: '1px solid rgba(240,184,73,0.08)', borderRadius: 8 }}>
                  <div style={{ fontSize: 8.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(240,184,73,0.35)', marginBottom: 4 }}>{row.label}</div>
                  <div style={{ fontSize: 12, color: '#f0ead8' }}>{row.val}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn ghost sm" onClick={() => handleResetSession(sessionDetail.session_id)}>
                <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>
                Reset
              </button>
              <button className="btn danger sm" onClick={() => handleCloseSession(sessionDetail.session_id, false)}>Close</button>
              <button className="btn danger sm" onClick={() => handleCloseSession(sessionDetail.session_id, true)}>
                Delete + Messages
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="ad-shell">
        {/* ── Sidebar ──────────────────────────────────────────────── */}
        <aside className="ad-sidebar">
          <div className="ad-logo">
            <img src="/sia-globe-v2.png" alt="SIA" style={{ height: 30, mixBlendMode: 'lighten' }} />
            <div>
              <div style={{ fontSize: 11, letterSpacing: '0.1em', color: '#f0b849', textTransform: 'uppercase', fontWeight: 500 }}>SIA Admin</div>
              <div style={{ fontSize: 8.5, color: 'rgba(240,184,73,0.28)', letterSpacing: '0.08em', marginTop: 1 }}>Control Panel v2</div>
            </div>
          </div>

          <nav className="ad-nav">
            <div className="ad-nav-section">Management</div>
            {([
              { id: 'tenants',       label: 'Tenants',      icon: <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /> },
              { id: 'create',        label: 'New Tenant',   icon: <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /> },
              { id: 'agent-config',  label: 'Agent Config', icon: <><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><circle cx="12" cy="12" r="3"/></> },
            ] as { id: Panel; label: string; icon: React.ReactNode }[]).map(item => (
              <button key={item.id} className={`nav-btn${panel === item.id ? ' active' : ''}`} onClick={() => setPanel(item.id)}>
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">{item.icon}</svg>
                {item.label}
              </button>
            ))}

            <div className="ad-nav-section" style={{ marginTop: 6 }}>Monitor</div>
            {([
              { id: 'sessions', label: 'Chat Sessions', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /> },
              { id: 'waitlist', label: 'Waitlist',      icon: <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /> },
            ] as { id: Panel; label: string; icon: React.ReactNode }[]).map(item => (
              <button key={item.id} className={`nav-btn${panel === item.id ? ' active' : ''}`} onClick={() => setPanel(item.id)}>
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">{item.icon}</svg>
                {item.label}
              </button>
            ))}

            <div className="ad-nav-section" style={{ marginTop: 6 }}>Account</div>
            <button className={`nav-btn${panel === 'profile' ? ' active' : ''}`} onClick={() => setPanel('profile')}>
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
              My Profile
            </button>
          </nav>

          <div style={{ padding: '10px 8px', borderTop: '1px solid rgba(240,184,73,0.07)' }}>
            {/* Mini profile */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '9px 11px', marginBottom: 4, background: 'rgba(240,184,73,0.04)', borderRadius: 9, border: '1px solid rgba(240,184,73,0.08)' }}>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: 'linear-gradient(135deg,#d99830,#f5d070)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#0a0a1a', flexShrink: 0 }}>
                {adminName.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 11, color: '#f0ead8', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{adminName}</div>
                <div style={{ fontSize: 8.5, color: 'rgba(200,185,150,0.32)', marginTop: 1 }}>{adminProfile?.is_superuser ? 'Superuser' : 'Staff Admin'}</div>
              </div>
              <div className="dot-live" style={{ marginLeft: 'auto' }} />
            </div>
            <button className="nav-btn red" onClick={handleLogout}>
              <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
              Sign Out
            </button>
          </div>
        </aside>

        {/* ── Main ─────────────────────────────────────────────────── */}
        <main className="ad-main">
          {/* Topbar */}
          <div className="ad-topbar">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 8.5, letterSpacing: '0.2em', color: 'rgba(240,184,73,0.28)', textTransform: 'uppercase' }}>admin</span>
              <span style={{ color: 'rgba(240,184,73,0.18)' }}>/</span>
              <span style={{ fontSize: 11, letterSpacing: '0.1em', color: 'rgba(240,184,73,0.6)', textTransform: 'uppercase' }}>
                {{ tenants: 'Tenant Registry', create: 'Provision Tenant', 'agent-config': 'Agent Endpoints', sessions: 'Chat Sessions', waitlist: 'Waitlist', 'tenant-detail': 'Tenant Detail', profile: 'My Profile' }[panel]}
              </span>
              <span className="cursor" />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {agentStatus && (
                <div style={{ display: 'flex', gap: 6 }}>
                  {(['mark', 'hr'] as const).map(a => {
                    const s = agentStatus[a];
                    return (
                      <div key={a} className={`access-pill ${s?.status === 'online' || s?.status === 'active' ? 'up' : 'dn'}`}>
                        <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor' }} />
                        {a.toUpperCase()}
                      </div>
                    );
                  })}
                </div>
              )}
              <button className="btn ghost sm" onClick={() => { loadTenants(); loadWaitlist(); checkAccess(); }} disabled={loading}>
                {loading ? <span className="spin sm" /> : (
                  <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>
                )}
                Refresh
              </button>
            </div>
          </div>

          <div className="ad-content">

            {/* ════════════════════════════════════════════════════ */}
            {/* TENANTS PANEL                                        */}
            {/* ════════════════════════════════════════════════════ */}
            {panel === 'tenants' && (
              <>
                <div className="stat-grid">
                  {[
                    { label: 'Total Tenants', val: tenants.length,                                          color: '#f0b849', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16' },
                    { label: 'Both Agents',   val: tenants.filter(t => t.subscribed_agents === 'both').length, color: '#4ade80', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
                    { label: 'Mark Only',     val: tenants.filter(t => t.subscribed_agents === 'mark').length, color: '#f0b849', icon: 'M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z' },
                    { label: 'HR Only',       val: tenants.filter(t => t.subscribed_agents === 'hr').length,   color: '#60a5fa', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
                    { label: 'Waitlist',      val: waitlistStats?.count ?? '—',                                color: '#a78bfa', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
                  ].map((s, i) => (
                    <div key={i} className="stat-card" style={{ animationDelay: `${i * 0.05}s` }}>
                      <div style={{ marginBottom: 12 }}>
                        <div style={{ padding: 8, background: `${s.color}12`, borderRadius: 8, border: `1px solid ${s.color}20`, display: 'inline-flex' }}>
                          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke={s.color} strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d={s.icon} /></svg>
                        </div>
                      </div>
                      <div className="stat-val" style={{ color: s.color }}>{s.val}</div>
                      <div className="stat-lbl">{s.label}</div>
                    </div>
                  ))}
                </div>

                <div className="card scan-wrap">
                  <div className="card-header">
                    <div>
                      <div className="card-title">Tenant Registry</div>
                      <div className="card-sub">{tenants.length} organizations · POST /api/tenants/ · GET /api/tenants/</div>
                    </div>
                    <button className="btn primary sm" onClick={() => setPanel('create')}>
                      <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
                      New Tenant
                    </button>
                  </div>

                  {loading && tenants.length === 0 ? (
                    <div style={{ padding: 48, textAlign: 'center' }}>
                      <span className="spin" style={{ display: 'inline-block' }} />
                      <div style={{ marginTop: 12, fontSize: 11, color: 'rgba(200,185,150,0.3)' }}>Loading tenants…</div>
                    </div>
                  ) : tenants.length === 0 ? (
                    <div className="empty">No tenants yet. Provision your first organization.</div>
                  ) : (
                    <div style={{ overflowX: 'auto' }}>
                      <table className="ad-table">
                        <thead>
                          <tr><th>Organization</th><th>Agents</th><th>Quota/mo</th><th>Sub Ends</th><th>Created</th><th>Actions</th></tr>
                        </thead>
                        <tbody>
                          {tenants.map((t, i) => (
                            <tr key={t.id} style={{ animation: `slideIn 0.2s ease ${i * 0.03}s both` }}>
                              <td>
                                <div style={{ fontWeight: 600, color: '#f0ead8', fontSize: 12.5 }}>{t.name}</div>
                                <div style={{ fontSize: 10, color: 'rgba(200,185,150,0.35)', marginTop: 2 }}>{t.email}</div>
                                <div style={{ fontSize: 9, color: 'rgba(200,185,150,0.2)', marginTop: 1, fontFamily: 'DM Mono' }}>{t.id}</div>
                              </td>
                              <td><SubscriptionBadge type={t.subscribed_agents} /></td>
                              <td><span style={{ color: '#f0b849', fontFamily: 'DM Mono', fontSize: 12 }}>{t.monthly_quota?.toLocaleString()}</span></td>
                              <td style={{ fontSize: 11, color: t.subscription_end ? 'rgba(200,185,150,0.55)' : 'rgba(200,185,150,0.22)' }}>{fmt(t.subscription_end)}</td>
                              <td style={{ fontSize: 11, color: 'rgba(200,185,150,0.4)' }}>{fmt(t.created_at)}</td>
                              <td>
                                <div style={{ display: 'flex', gap: 6 }}>
                                  <button className="btn ghost sm" onClick={() => { setSelectedTenant(t); setSf({ subscribed_agents: t.subscribed_agents, subscription_end: '' }); setSubModalOpen(true); }}>Edit Sub</button>
                                  <button className="btn blue sm" onClick={() => { loadTenantDetail(t.id); setPanel('tenant-detail'); }}>Detail</button>
                                  <button className="btn ghost sm" onClick={() => { setPanel('agent-config'); setAcf(p => ({ ...p, tenant_id: t.id })); }}>Agents</button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* ════════════════════════════════════════════════════ */}
            {/* TENANT DETAIL PANEL                                  */}
            {/* ════════════════════════════════════════════════════ */}
            {panel === 'tenant-detail' && (
              <div style={{ maxWidth: 700 }}>
                <button className="btn ghost sm" style={{ marginBottom: 20 }} onClick={() => setPanel('tenants')}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
                  Back to Tenants
                </button>

                {loading && !selectedTenant && (
                  <div style={{ padding: 40, textAlign: 'center' }}><span className="spin" style={{ display: 'inline-block' }} /></div>
                )}

                {selectedTenant && (
                  <>
                    {/* Header card */}
                    <div className="card" style={{ marginBottom: 16 }}>
                      <div style={{ padding: '22px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                          <div>
                            <div style={{ fontSize: 9.5, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(240,184,73,0.38)', marginBottom: 6 }}>GET /api/tenants/{selectedTenant.id}/</div>
                            <div style={{ fontSize: 22, fontWeight: 700, color: '#f0ead8', marginBottom: 4 }}>{selectedTenant.name}</div>
                            <div style={{ fontSize: 12, color: 'rgba(200,185,150,0.45)' }}>{selectedTenant.email}</div>
                            <div style={{ fontSize: 10, color: 'rgba(200,185,150,0.22)', marginTop: 4, fontFamily: 'DM Mono' }}>ID: {selectedTenant.id}</div>
                          </div>
                          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                            <SubscriptionBadge type={selectedTenant.subscribed_agents} />
                            <button className="btn primary sm" onClick={() => { setSf({ subscribed_agents: selectedTenant.subscribed_agents, subscription_end: '' }); setSubModalOpen(true); }}>
                              Edit Subscription
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Detail grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                      {[
                        { label: 'Monthly Quota',   val: selectedTenant.monthly_quota?.toLocaleString() + ' msgs', color: '#f0b849' },
                        { label: 'Subscription End', val: fmt(selectedTenant.subscription_end), color: selectedTenant.subscription_end ? '#4ade80' : '#666' },
                        { label: 'Status',           val: selectedTenant.is_active ? 'Active' : 'Inactive', color: selectedTenant.is_active ? '#4ade80' : '#f87171' },
                        { label: 'Created',          val: fmt(selectedTenant.created_at), color: 'rgba(200,185,150,0.55)' },
                      ].map((item, i) => (
                        <div key={i} className="card" style={{ padding: '16px 18px' }}>
                          <div style={{ fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(240,184,73,0.35)', marginBottom: 6 }}>{item.label}</div>
                          <div style={{ fontSize: 15, fontWeight: 600, color: item.color, fontFamily: 'DM Mono' }}>{item.val}</div>
                        </div>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="card">
                      <div className="card-header">
                        <span style={{ fontSize: 11, letterSpacing: '0.12em', color: 'rgba(240,184,73,0.5)', textTransform: 'uppercase' }}>Quick Actions</span>
                      </div>
                      <div style={{ padding: '16px 20px', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        <button className="btn ghost" onClick={() => { setPanel('agent-config'); setAcf(p => ({ ...p, tenant_id: selectedTenant.id })); }}>
                          <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><circle cx="12" cy="12" r="3"/></svg>
                          Configure Agents
                        </button>
                        <button className="btn blue" onClick={async () => {
                          const { ok, data } = await apiFetch(`/api/tenants/v2/agents/status/`);
                          if (ok) { showToast(`Mark: ${data.mark?.status || '?'} · HR: ${data.hr?.status || '?'}`, 'info'); setAgentStatus(data); }
                          else showToast('Could not fetch agent status', 'err');
                        }}>
                          <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                          Check Agent Status
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ════════════════════════════════════════════════════ */}
            {/* CREATE TENANT PANEL                                  */}
            {/* ════════════════════════════════════════════════════ */}
            {panel === 'create' && (
              <div style={{ maxWidth: 580 }}>
                <button className="btn ghost sm" style={{ marginBottom: 20 }} onClick={() => setPanel('tenants')}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
                  Back
                </button>
                <div style={{ marginBottom: 24 }}>
                  <div style={{ fontSize: 9.5, letterSpacing: '0.18em', color: 'rgba(240,184,73,0.38)', textTransform: 'uppercase', marginBottom: 4 }}>POST /api/tenants/</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: '#f0ead8' }}>Provision New Tenant</div>
                  <div style={{ fontSize: 11.5, color: 'rgba(200,185,150,0.35)', marginTop: 5, lineHeight: 1.7 }}>Create a new organization with agent subscription access.</div>
                </div>

                <div className="card">
                  <div className="card-header"><span style={{ fontSize: 11, letterSpacing: '0.12em', color: 'rgba(240,184,73,0.5)', textTransform: 'uppercase' }}>Tenant Details</span></div>
                  <div style={{ padding: 24 }}>
                    <form onSubmit={handleCreateTenant} noValidate>
                      <div className="form-row">
                        <div className="form-group">
                          <label className="form-label">Organization Name</label>
                          <input type="text" className={`form-input${cfErr.name ? ' err' : ''}`} placeholder="Acme Corp" value={cf.name} onChange={e => { setCf(p => ({ ...p, name: e.target.value })); setCfErr(p => ({ ...p, name: '' })); }} />
                          {cfErr.name && <div className="err-msg">✕ {cfErr.name}</div>}
                        </div>
                        <div className="form-group">
                          <label className="form-label">Admin Email</label>
                          <input type="email" className={`form-input${cfErr.email ? ' err' : ''}`} placeholder="admin@acme.com" value={cf.email} onChange={e => { setCf(p => ({ ...p, email: e.target.value })); setCfErr(p => ({ ...p, email: '' })); }} />
                          {cfErr.email && <div className="err-msg">✕ {cfErr.email}</div>}
                        </div>
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label className="form-label">Subscribed Agents</label>
                          <select className="form-select" value={cf.subscribed_agents} onChange={e => setCf(p => ({ ...p, subscribed_agents: e.target.value }))}>
                            <option value="both">Both (Mark + HR)</option>
                            <option value="mark">Mark only</option>
                            <option value="hr">HR only</option>
                            <option value="none">None</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label className="form-label">Monthly Quota (msgs)</label>
                          <input type="number" className={`form-input${cfErr.quota ? ' err' : ''}`} placeholder="5000" min="0" value={cf.monthly_quota} onChange={e => { setCf(p => ({ ...p, monthly_quota: e.target.value })); setCfErr(p => ({ ...p, quota: '' })); }} />
                          {cfErr.quota && <div className="err-msg">✕ {cfErr.quota}</div>}
                        </div>
                      </div>

                      {(cf.name || cf.email) && (
                        <div style={{ marginBottom: 20, padding: '14px 16px', borderRadius: 9, background: 'rgba(240,184,73,0.04)', border: '1px solid rgba(240,184,73,0.1)' }}>
                          <div style={{ fontSize: 8.5, letterSpacing: '0.16em', color: 'rgba(240,184,73,0.38)', textTransform: 'uppercase', marginBottom: 8 }}>Preview</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'space-between' }}>
                            <div>
                              <div style={{ fontSize: 14, fontWeight: 600, color: '#f0ead8' }}>{cf.name || '—'}</div>
                              <div style={{ fontSize: 10.5, color: 'rgba(200,185,150,0.38)', marginTop: 2 }}>{cf.email || '—'}</div>
                            </div>
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
                              <SubscriptionBadge type={cf.subscribed_agents} />
                              <span style={{ fontSize: 11, color: '#f0b849', fontFamily: 'DM Mono' }}>{(+cf.monthly_quota || 0).toLocaleString()} msgs/mo</span>
                            </div>
                          </div>
                        </div>
                      )}
                      <button type="submit" className="btn primary full" disabled={loading}>
                        {loading ? <><span className="spin sm white" /> Creating…</> : '→ provision_tenant()'}
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {/* ════════════════════════════════════════════════════ */}
            {/* AGENT CONFIG PANEL                                   */}
            {/* ════════════════════════════════════════════════════ */}
            {panel === 'agent-config' && (
              <div style={{ maxWidth: 640 }}>
                <div style={{ marginBottom: 24 }}>
                  <div style={{ fontSize: 9.5, letterSpacing: '0.18em', color: 'rgba(240,184,73,0.38)', textTransform: 'uppercase', marginBottom: 4 }}>POST /api/tenants/&#123;id&#125;/agents/</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: '#f0ead8' }}>Configure Agent Endpoints</div>
                  <div style={{ fontSize: 11.5, color: 'rgba(200,185,150,0.35)', marginTop: 5, lineHeight: 1.7 }}>Wire up n8n webhooks or AWS Lambda endpoints per agent per tenant.</div>
                </div>

                <div className="card" style={{ marginBottom: 16 }}>
                  <div className="card-header"><span style={{ fontSize: 11, letterSpacing: '0.12em', color: 'rgba(240,184,73,0.5)', textTransform: 'uppercase' }}>Endpoint Configuration</span></div>
                  <div style={{ padding: 24 }}>
                    <form onSubmit={handleAgentConfig} noValidate>
                      <div className="form-group">
                        <label className="form-label">Select Tenant</label>
                        <select className={`form-select${acfErr.tid ? ' err' : ''}`} value={acf.tenant_id} onChange={e => { setAcf(p => ({ ...p, tenant_id: e.target.value })); setAcfErr(p => ({ ...p, tid: '' })); }}>
                          <option value="">Choose tenant…</option>
                          {tenants.map(t => <option key={t.id} value={t.id}>{t.name} — {t.email}</option>)}
                        </select>
                        {acfErr.tid && <div className="err-msg">✕ {acfErr.tid}</div>}
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label className="form-label">Agent Type</label>
                          <select className="form-select" value={acf.agent_type} onChange={e => setAcf(p => ({ ...p, agent_type: e.target.value as 'mark' | 'hr' }))}>
                            <option value="mark">Mark (Marketing)</option>
                            <option value="hr">HR Agent</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label className="form-label">Timeout (seconds)</label>
                          <input type="number" className="form-input" placeholder="30" min="5" max="120" value={acf.timeout_seconds} onChange={e => setAcf(p => ({ ...p, timeout_seconds: e.target.value }))} />
                        </div>
                      </div>
                      <div className="form-group">
                        <label className="form-label">
                          Webhook URL
                          <span style={{ marginLeft: 8, padding: '1px 7px', borderRadius: 4, background: acf.agent_type === 'mark' ? 'rgba(240,184,73,0.1)' : 'rgba(96,165,250,0.1)', border: `1px solid ${acf.agent_type === 'mark' ? 'rgba(240,184,73,0.2)' : 'rgba(96,165,250,0.2)'}`, color: acf.agent_type === 'mark' ? '#f0b849' : '#60a5fa', fontSize: 8, letterSpacing: '0.1em' }}>
                            {acf.agent_type === 'mark' ? 'n8n recommended' : 'AWS recommended'}
                          </span>
                        </label>
                        <input type="url" className={`form-input${acfErr.url ? ' err' : ''}`}
                          placeholder={acf.agent_type === 'mark' ? 'https://n8n.yourinstance.com/webhook/mark-agent' : 'https://api.execute-api.region.amazonaws.com/prod/hr-agent'}
                          value={acf.endpoint_url} onChange={e => { setAcf(p => ({ ...p, endpoint_url: e.target.value })); setAcfErr(p => ({ ...p, url: '' })); }} />
                        {acfErr.url && <div className="err-msg">✕ {acfErr.url}</div>}
                      </div>
                      <button type="submit" className="btn primary full" disabled={loading}>
                        {loading ? <><span className="spin sm white" /> Saving…</> : '→ configure_agent()'}
                      </button>
                    </form>
                  </div>
                </div>

                {/* Agent status check */}
                <div className="card" style={{ marginBottom: 16 }}>
                  <div className="card-header">
                    <span style={{ fontSize: 11, letterSpacing: '0.12em', color: 'rgba(240,184,73,0.5)', textTransform: 'uppercase' }}>Live Agent Status</span>
                    <button className="btn ghost sm" onClick={async () => {
                      const { ok, data } = await apiFetch('/api/tenants/v2/agents/status/');
                      if (ok) { setAgentStatus(data); showToast('Agent status refreshed', 'info'); }
                      else showToast('Failed to fetch status', 'err');
                    }}>GET /agents/status/</button>
                  </div>
                  <div style={{ padding: '14px 20px', display: 'flex', gap: 12 }}>
                    {agentStatus ? (['mark', 'hr'] as const).map(agent => {
                      const s = agentStatus[agent];
                      const isUp = s?.status === 'online' || s?.status === 'active';
                      return (
                        <div key={agent} style={{ flex: 1, padding: '14px 16px', borderRadius: 10, background: isUp ? 'rgba(74,222,128,0.05)' : 'rgba(248,113,113,0.05)', border: `1px solid ${isUp ? 'rgba(74,222,128,0.15)' : 'rgba(248,113,113,0.15)'}` }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
                            <div style={{ width: 7, height: 7, borderRadius: '50%', background: isUp ? '#4ade80' : '#f87171', animation: isUp ? 'pulse 2s ease-in-out infinite' : 'none' }} />
                            <span style={{ fontSize: 11, fontWeight: 600, color: '#f0ead8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{agent}</span>
                          </div>
                          <div style={{ fontSize: 11, color: isUp ? '#4ade80' : '#f87171' }}>{s?.status || 'unknown'}</div>
                          {s?.endpoint && <div style={{ fontSize: 9.5, color: 'rgba(200,185,150,0.3)', marginTop: 4, wordBreak: 'break-all' }}>{s.endpoint}</div>}
                        </div>
                      );
                    }) : (
                      <div style={{ color: 'rgba(200,185,150,0.3)', fontSize: 11 }}>Click "GET /agents/status/" to check live status.</div>
                    )}
                  </div>
                </div>

                {/* Endpoint reference */}
                <div className="card">
                  <div className="card-header"><span style={{ fontSize: 11, letterSpacing: '0.12em', color: 'rgba(240,184,73,0.5)', textTransform: 'uppercase' }}>Agent Proxy Endpoints</span></div>
                  <div style={{ padding: '8px 0' }}>
                    {[
                      { method: 'POST', path: '/api/tenants/v2/agents/mark/chat/', desc: 'Chat with Marketing Agent', color: '#f0b849' },
                      { method: 'POST', path: '/api/tenants/v2/agents/hr/chat/',   desc: 'Chat with HR Agent',         color: '#60a5fa' },
                      { method: 'GET',  path: '/api/tenants/v2/agents/status/',    desc: 'Check agent availability',    color: '#4ade80' },
                    ].map((ep, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 20px', borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.03)' : 'none' }}>
                        <span style={{ fontFamily: 'DM Mono', fontSize: 9, padding: '2px 7px', borderRadius: 4, background: `${ep.color}12`, border: `1px solid ${ep.color}22`, color: ep.color, letterSpacing: '0.1em', flexShrink: 0 }}>{ep.method}</span>
                        <span style={{ fontFamily: 'DM Mono', fontSize: 11, color: 'rgba(200,185,150,0.55)', flex: 1 }}>{ep.path}</span>
                        <span style={{ fontSize: 10.5, color: 'rgba(200,185,150,0.28)' }}>{ep.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ════════════════════════════════════════════════════ */}
            {/* CHAT SESSIONS PANEL                                  */}
            {/* ════════════════════════════════════════════════════ */}
            {panel === 'sessions' && (
              <div>
                <div style={{ marginBottom: 20, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: 9.5, letterSpacing: '0.18em', color: 'rgba(240,184,73,0.38)', textTransform: 'uppercase', marginBottom: 4 }}>GET /api/chat/session/&#123;id&#125;/</div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: '#f0ead8' }}>Chat Sessions</div>
                    <div style={{ fontSize: 11.5, color: 'rgba(200,185,150,0.35)', marginTop: 4, lineHeight: 1.7 }}>Monitor, reset, or close public chatbot sessions.</div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                    <button className="btn ghost sm" onClick={loadSessions}>Refresh</button>
                  </div>
                </div>

                {/* Manual session lookup */}
                <div className="card" style={{ marginBottom: 16 }}>
                  <div className="card-header"><span style={{ fontSize: 11, letterSpacing: '0.12em', color: 'rgba(240,184,73,0.5)', textTransform: 'uppercase' }}>Look Up Session by ID</span></div>
                  <div style={{ padding: '16px 20px' }}>
                    <SessionLookup onView={handleViewSession} onToast={showToast} />
                  </div>
                </div>

                {/* Known sessions */}
                <div className="card scan-wrap">
                  <div className="card-header">
                    <div>
                      <div className="card-title">Known Sessions</div>
                      <div className="card-sub">{sessions.length} sessions tracked in admin · session IDs auto-stored from chatbot</div>
                    </div>
                  </div>
                  {sessions.length === 0 ? (
                    <div className="empty">
                      No sessions tracked yet.<br/>
                      <span style={{ fontSize: 10, color: 'rgba(200,185,150,0.2)', marginTop: 6, display: 'block' }}>Use the lookup above to find sessions by ID.</span>
                    </div>
                  ) : (
                    <div style={{ overflowX: 'auto' }}>
                      <table className="ad-table">
                        <thead><tr><th>Session ID</th><th>User</th><th>Company</th><th>Last Active</th><th>Actions</th></tr></thead>
                        <tbody>
                          {sessions.map((s, i) => (
                            <tr key={s.session_id} style={{ animation: `slideIn 0.2s ease ${i * 0.04}s both` }}>
                              <td><span style={{ fontFamily: 'DM Mono', fontSize: 10.5, color: '#f0b849' }}>{s.session_id.slice(0, 16)}…</span></td>
                              <td>
                                <div style={{ fontSize: 12, color: '#f0ead8' }}>{s.user_name || '—'}</div>
                                <div style={{ fontSize: 10, color: 'rgba(200,185,150,0.35)' }}>{s.user_email || ''}</div>
                              </td>
                              <td style={{ fontSize: 11 }}>{s.company_name || '—'}</td>
                              <td style={{ fontSize: 11, color: 'rgba(200,185,150,0.45)' }}>{fmtTime(s.last_active)}</td>
                              <td>
                                <div style={{ display: 'flex', gap: 6 }}>
                                  <button className="btn blue sm" onClick={() => handleViewSession(s.session_id)}>View</button>
                                  <button className="btn ghost sm" onClick={() => handleResetSession(s.session_id)}>Reset</button>
                                  <button className="btn danger sm" onClick={() => handleCloseSession(s.session_id, true)}>Delete</button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Session endpoint reference */}
                <div className="card" style={{ marginTop: 16 }}>
                  <div className="card-header"><span style={{ fontSize: 11, letterSpacing: '0.12em', color: 'rgba(240,184,73,0.5)', textTransform: 'uppercase' }}>Session Endpoints</span></div>
                  <div style={{ padding: '8px 0' }}>
                    {[
                      { method: 'POST', path: '/api/chat/',                       desc: 'Send chat message (public)',   color: '#f0b849' },
                      { method: 'GET',  path: '/api/chat/session/{id}/',           desc: 'Get session info',             color: '#4ade80' },
                      { method: 'POST', path: '/api/chat/session/reset/',          desc: 'Reset session history',        color: '#60a5fa' },
                      { method: 'POST', path: '/api/chat/session/close/',          desc: 'Close / delete session',       color: '#f87171' },
                      { method: 'POST', path: '/api/chat/update-info/',            desc: 'Update user info in session',  color: '#a78bfa' },
                    ].map((ep, i, arr) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 20px', borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none' }}>
                        <span style={{ fontFamily: 'DM Mono', fontSize: 9, padding: '2px 7px', borderRadius: 4, background: `${ep.color}12`, border: `1px solid ${ep.color}22`, color: ep.color, letterSpacing: '0.1em', flexShrink: 0 }}>{ep.method}</span>
                        <span style={{ fontFamily: 'DM Mono', fontSize: 11, color: 'rgba(200,185,150,0.55)', flex: 1 }}>{ep.path}</span>
                        <span style={{ fontSize: 10.5, color: 'rgba(200,185,150,0.28)' }}>{ep.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ════════════════════════════════════════════════════ */}
            {/* WAITLIST PANEL                                       */}
            {/* ════════════════════════════════════════════════════ */}
            {panel === 'waitlist' && (
              <div style={{ maxWidth: 520 }}>
                <div style={{ marginBottom: 24 }}>
                  <div style={{ fontSize: 9.5, letterSpacing: '0.18em', color: 'rgba(240,184,73,0.38)', textTransform: 'uppercase', marginBottom: 4 }}>GET /api/waitlist/stats/</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: '#f0ead8' }}>Waitlist</div>
                </div>

                <div className="stat-card" style={{ marginBottom: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                    <div style={{ padding: 16, background: 'rgba(167,139,250,0.1)', borderRadius: 14, border: '1px solid rgba(167,139,250,0.18)' }}>
                      <svg width="30" height="30" fill="none" viewBox="0 0 24 24" stroke="#a78bfa" strokeWidth="1.6"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                    </div>
                    <div>
                      <div className="stat-val" style={{ color: '#a78bfa', fontSize: 42 }}>{waitlistStats?.count ?? '—'}</div>
                      <div className="stat-lbl">Total Signups</div>
                    </div>
                    <button className="btn ghost sm" style={{ marginLeft: 'auto' }} onClick={loadWaitlist}>Refresh</button>
                  </div>
                </div>

                <div className="card" style={{ marginBottom: 16 }}>
                  <div className="card-header"><span style={{ fontSize: 11, letterSpacing: '0.12em', color: 'rgba(240,184,73,0.5)', textTransform: 'uppercase' }}>Waitlist Endpoints</span></div>
                  <div style={{ padding: '8px 0' }}>
                    {[
                      { method: 'POST', path: '/api/waitlist/join/', desc: 'Add email — no auth required', color: '#f0b849' },
                      { method: 'GET',  path: '/api/waitlist/stats/', desc: 'Get total count — no auth', color: '#4ade80' },
                    ].map((ep, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', borderBottom: i < 1 ? '1px solid rgba(255,255,255,0.03)' : 'none' }}>
                        <span style={{ fontFamily: 'DM Mono', fontSize: 9, padding: '2px 7px', borderRadius: 4, background: `${ep.color}12`, border: `1px solid ${ep.color}22`, color: ep.color, letterSpacing: '0.1em', flexShrink: 0 }}>{ep.method}</span>
                        <span style={{ fontFamily: 'DM Mono', fontSize: 11, color: 'rgba(200,185,150,0.55)', flex: 1 }}>{ep.path}</span>
                        <span style={{ fontSize: 10.5, color: 'rgba(200,185,150,0.28)' }}>{ep.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ padding: '14px 18px', borderRadius: 10, background: 'rgba(240,184,73,0.04)', border: '1px solid rgba(240,184,73,0.1)', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="rgba(240,184,73,0.45)" strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  <span style={{ fontFamily: 'DM Mono', fontSize: 10.5, color: 'rgba(200,185,150,0.42)', lineHeight: 1.6 }}>
                    Waitlist is public — no auth required to sign up. When ready to onboard a signup, go to <button onClick={() => setPanel('create')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f0b849', fontFamily: 'DM Mono', fontSize: 10.5, textDecoration: 'underline', padding: 0 }}>New Tenant</button> and provision them directly.
                  </span>
                </div>
              </div>
            )}

            {/* ════════════════════════════════════════════════════ */}
            {/* PROFILE PANEL                                        */}
            {/* ════════════════════════════════════════════════════ */}
            {panel === 'profile' && (
              <div style={{ maxWidth: 520 }}>
                <div style={{ marginBottom: 24 }}>
                  <div style={{ fontSize: 9.5, letterSpacing: '0.18em', color: 'rgba(240,184,73,0.38)', textTransform: 'uppercase', marginBottom: 4 }}>GET /api/auth/profile/ · PUT /api/auth/profile/update/</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: '#f0ead8' }}>My Profile</div>
                </div>

                {adminProfile ? (
                  <>
                    {/* Profile card */}
                    <div className="card" style={{ marginBottom: 16 }}>
                      <div style={{ padding: '22px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                          <div className="avatar-lg">
                            {adminName.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)}
                          </div>
                          <div>
                            <div style={{ fontSize: 18, fontWeight: 700, color: '#f0ead8' }}>{adminName}</div>
                            <div style={{ fontSize: 11.5, color: 'rgba(200,185,150,0.45)', marginTop: 3 }}>{adminProfile.email}</div>
                            <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                              {adminProfile.is_superuser && <span className="tag" style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)', color: '#f87171' }}>Superuser</span>}
                              {adminProfile.is_staff && <span className="tag" style={{ background: 'rgba(240,184,73,0.1)', border: '1px solid rgba(240,184,73,0.2)', color: '#f0b849' }}>Staff</span>}
                            </div>
                          </div>
                        </div>

                        {/* Info grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
                          {[
                            { label: 'First Name', val: adminProfile.first_name || '—' },
                            { label: 'Last Name',  val: adminProfile.last_name || '—' },
                            { label: 'Email',      val: adminProfile.email },
                            { label: 'User ID',    val: adminProfile.id },
                          ].map((item, i) => (
                            <div key={i} style={{ padding: '10px 12px', background: 'rgba(240,184,73,0.03)', border: '1px solid rgba(240,184,73,0.08)', borderRadius: 8 }}>
                              <div style={{ fontSize: 8.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(240,184,73,0.35)', marginBottom: 4 }}>{item.label}</div>
                              <div style={{ fontSize: 12, color: '#f0ead8', wordBreak: 'break-all' }}>{item.val}</div>
                            </div>
                          ))}
                        </div>

                        {!profileEditMode ? (
                          <button className="btn ghost" onClick={() => setProfileEditMode(true)}>
                            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                            Edit Profile
                          </button>
                        ) : (
                          <form onSubmit={handleProfileUpdate}>
                            <div className="form-row" style={{ marginBottom: 14 }}>
                              <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">First Name</label>
                                <input type="text" className="form-input" value={profileEdit.first_name} onChange={e => setProfileEdit(p => ({ ...p, first_name: e.target.value }))} />
                              </div>
                              <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Last Name</label>
                                <input type="text" className="form-input" value={profileEdit.last_name} onChange={e => setProfileEdit(p => ({ ...p, last_name: e.target.value }))} />
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: 8 }}>
                              <button type="submit" className="btn primary" disabled={loading}>
                                {loading ? <><span className="spin sm white" /> Saving…</> : '→ update_profile()'}
                              </button>
                              <button type="button" className="btn ghost" onClick={() => setProfileEditMode(false)}>Cancel</button>
                            </div>
                          </form>
                        )}
                      </div>
                    </div>

                    {/* Auth endpoints reference */}
                    <div className="card">
                      <div className="card-header"><span style={{ fontSize: 11, letterSpacing: '0.12em', color: 'rgba(240,184,73,0.5)', textTransform: 'uppercase' }}>Auth Endpoints</span></div>
                      <div style={{ padding: '8px 0' }}>
                        {[
                          { method: 'GET',  path: '/api/auth/profile/',          desc: 'Get admin profile',       color: '#4ade80' },
                          { method: 'PUT',  path: '/api/auth/profile/update/',   desc: 'Update name fields',      color: '#f0b849' },
                          { method: 'GET',  path: '/api/auth/access/',           desc: 'Check agent access',      color: '#60a5fa' },
                          { method: 'GET',  path: '/api/auth/session/validate/', desc: 'Validate active session', color: '#a78bfa' },
                          { method: 'POST', path: '/api/auth/refresh/',          desc: 'Refresh access token',    color: '#f0b849' },
                          { method: 'POST', path: '/api/auth/logout/',           desc: 'Invalidate session',      color: '#f87171' },
                        ].map((ep, i, arr) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 20px', borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none' }}>
                            <span style={{ fontFamily: 'DM Mono', fontSize: 9, padding: '2px 7px', borderRadius: 4, background: `${ep.color}12`, border: `1px solid ${ep.color}22`, color: ep.color, letterSpacing: '0.1em', flexShrink: 0 }}>{ep.method}</span>
                            <span style={{ fontFamily: 'DM Mono', fontSize: 11, color: 'rgba(200,185,150,0.55)', flex: 1 }}>{ep.path}</span>
                            <span style={{ fontSize: 10.5, color: 'rgba(200,185,150,0.28)' }}>{ep.desc}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <div style={{ padding: 40, textAlign: 'center' }}><span className="spin" style={{ display: 'inline-block' }} /></div>
                )}
              </div>
            )}

          </div>
        </main>
      </div>
    </>
  );
}

// ── Session Lookup Sub-component ──────────────────────────────────────────────
function SessionLookup({ onView, onToast }: { onView: (id: string) => void; onToast: (msg: string, type: 'ok' | 'err' | 'info') => void }) {
  const [sid, setSid] = useState('');
  const [busy, setBusy] = useState(false);

  const lookup = async () => {
    if (!sid.trim()) return;
    setBusy(true);
    try {
      await onView(sid.trim());
      // Also save to known sessions
      const stored = localStorage.getItem('admin_known_sessions');
      const ids: string[] = stored ? JSON.parse(stored) : [];
      if (!ids.includes(sid.trim())) {
        ids.unshift(sid.trim());
        localStorage.setItem('admin_known_sessions', JSON.stringify(ids.slice(0, 50)));
      }
    } catch {
      onToast('Session not found', 'err');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ display: 'flex', gap: 10 }}>
      <input
        type="text"
        className="form-input"
        placeholder="Paste session ID…"
        value={sid}
        onChange={e => setSid(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && lookup()}
        style={{ flex: 1 }}
      />
      <button className="btn ghost" onClick={lookup} disabled={busy || !sid.trim()}>
        {busy ? <span className="spin sm" /> : (
          <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        )}
        Lookup
      </button>
    </div>
  );
}