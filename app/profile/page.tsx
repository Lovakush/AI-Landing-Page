'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const TABS = ['Overview', 'Activity'];

const STATS = [
  { label: 'Documents Processed', value: '1,284', delta: '+12 this week' },
  { label: 'Agents Used', value: '2', delta: 'HR · Marketing' },
  { label: 'HR Agent', value: 'Pro', delta: 'Renews Jan 15, 2026', isSubscription: true, badge: 'ACTIVE' },
  { label: 'Marketing Agent', value: 'Pro', delta: 'Renews Jan 15, 2026', isSubscription: true, badge: 'ACTIVE' },
];

const RECENT = [
  { type: 'HR',        name: 'Q4_Hiring_Plan.pdf',         time: '2 hours ago',   status: 'done' },
  { type: 'Marketing', name: 'Campaign_Brief_Nov.docx',    time: '5 hours ago',   status: 'done' },
  { type: 'HR',        name: 'Contractor_Agreements.pdf',  time: 'Yesterday',     status: 'done' },
  { type: 'Marketing', name: 'Brand_Guidelines_v3.pptx',  time: '2 days ago',    status: 'done' },
  { type: 'HR',        name: 'Onboarding_Checklist.xlsx',  time: '3 days ago',    status: 'done' },
];

const TYPE_COLOR: Record<string, string> = {
  HR: '#f0b849',
  Marketing: '#a78bfa',
};

export default function ProfilePage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('Overview');
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState('Alex Johnson');
  const [role, setRole] = useState('Head of Operations');
  const [email, setEmail] = useState('alex.johnson@company.com');
  const [scanLine, setScanLine] = useState(0);

  useEffect(() => { setTimeout(() => setMounted(true), 60); }, []);

  useEffect(() => {
    const iv = setInterval(() => setScanLine(p => (p + 1) % 100), 30);
    return () => clearInterval(iv);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500;600&display=swap');

        @keyframes pp-fadeUp {
          from { opacity:0; transform:translateY(18px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes pp-pulse {
          0%,100% { opacity:0.4; transform:scale(1); }
          50%      { opacity:1;   transform:scale(1.3); }
        }
        @keyframes pp-glow {
          0%,100% { box-shadow: 0 0 16px rgba(240,184,73,0.2); }
          50%      { box-shadow: 0 0 32px rgba(240,184,73,0.45); }
        }
        @keyframes pp-border-flow {
          0%   { background-position: 0% 50%; }
          100% { background-position: 300% 50%; }
        }
        @keyframes pp-corner {
          0%,100% { opacity:0.25; } 50% { opacity:0.9; }
        }

        .pp-wrap {
          min-height: 100vh;
          background: radial-gradient(ellipse at 65% 15%, #0d0c28 0%, #080718 45%, #050412 100%);
          font-family: 'DM Mono', monospace;
          padding-top: 88px;
          color: #f0ead8;
        }
        .pp-inner {
          max-width: 900px;
          margin: 0 auto;
          padding: 48px 24px 96px;
        }

        .pp-back {
          display: inline-flex; align-items: center; gap: 6px;
          background: none; border: none; cursor: pointer; padding: 0;
          margin-bottom: 36px;
          font-family: 'DM Mono', monospace; font-size: 10px;
          color: rgba(240,184,73,0.4); letter-spacing: 0.1em; text-transform: uppercase;
          transition: color 0.15s;
        }
        .pp-back:hover { color: rgba(240,184,73,0.75); }

        .pp-hero {
          display: flex; align-items: flex-start; gap: 28px;
          padding: 28px 28px 24px;
          border-radius: 14px;
          border: 1px solid rgba(240,184,73,0.15);
          background: rgba(240,184,73,0.025);
          margin-bottom: 28px;
          position: relative; overflow: hidden;
          animation: pp-glow 4s ease-in-out infinite;
        }
        .pp-hero::before {
          content: '';
          position: absolute; inset: -1px; border-radius: inherit;
          background: linear-gradient(90deg, transparent, rgba(240,184,73,0.4) 40%, rgba(245,208,112,0.7) 50%, rgba(240,184,73,0.4) 60%, transparent);
          background-size: 300% 100%;
          animation: pp-border-flow 4s linear infinite;
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor; mask-composite: exclude;
          padding: 1px; pointer-events: none;
        }

        .pp-avatar-wrap { position: relative; flex-shrink: 0; width: 80px; height: 80px; }
        .pp-avatar {
          width: 80px; height: 80px; border-radius: 14px;
          background: linear-gradient(135deg, rgba(240,184,73,0.12), rgba(240,184,73,0.05));
          border: 1px solid rgba(240,184,73,0.3);
          display: flex; align-items: center; justify-content: center;
          font-size: 28px; font-weight: 600; color: #f0b849;
          position: relative; overflow: hidden; letter-spacing: -0.02em;
        }
        .pp-avatar-scan {
          position: absolute; left: 0; right: 0; height: 1.5px;
          background: linear-gradient(90deg, transparent, rgba(240,184,73,0.8) 40%, rgba(245,208,112,1) 50%, rgba(240,184,73,0.8) 60%, transparent);
          pointer-events: none; z-index: 2; transition: top 0.03s linear;
        }
        .pp-status-dot {
          position: absolute; bottom: -3px; right: -3px;
          width: 12px; height: 12px; border-radius: 50%;
          background: #4ade80; border: 2px solid #080718;
          box-shadow: 0 0 8px rgba(74,222,128,0.8);
          animation: pp-pulse 1.5s ease-in-out infinite;
        }
        .pp-av-corner {
          position: absolute; width: 8px; height: 8px;
          border-color: rgba(240,184,73,0.7); border-style: solid;
          animation: pp-corner 2s ease-in-out infinite; pointer-events: none; z-index: 3;
        }
        .pp-av-corner.tl { top: -1px;    left: -1px;  border-width: 1.5px 0 0 1.5px; }
        .pp-av-corner.tr { top: -1px;    right: -1px; border-width: 1.5px 1.5px 0 0; animation-delay: 0.5s; }
        .pp-av-corner.bl { bottom: -1px; left: -1px;  border-width: 0 0 1.5px 1.5px; animation-delay: 1s; }
        .pp-av-corner.br { bottom: -1px; right: -1px; border-width: 0 1.5px 1.5px 0; animation-delay: 1.5s; }

        .pp-hero-info { flex: 1; min-width: 0; }
        .pp-tag {
          display: inline-flex; align-items: center; gap: 5px;
          font-size: 9px; color: rgba(240,184,73,0.45);
          letter-spacing: 0.16em; text-transform: uppercase; margin-bottom: 8px;
        }
        .pp-tag-dot { width: 4px; height: 4px; border-radius: 50%; background: #f0b849; animation: pp-pulse 2s ease-in-out infinite; }
        .pp-name {
          font-size: 22px; font-weight: 600; color: #f0ead8;
          letter-spacing: -0.01em; margin: 0 0 4px;
          display: flex; align-items: center; gap: 10px;
        }
        .pp-role { font-size: 12px; color: rgba(200,185,150,0.45); letter-spacing: 0.04em; margin-bottom: 14px; }
        .pp-email {
          font-size: 11px; color: rgba(240,184,73,0.55); letter-spacing: 0.04em;
          display: flex; align-items: center; gap: 6px;
        }

        .pp-edit-btn {
          margin-left: auto; align-self: flex-start; flex-shrink: 0;
          padding: 8px 18px; border-radius: 7px;
          border: 1px solid rgba(240,184,73,0.3);
          background: rgba(240,184,73,0.06);
          color: #f0b849; font-family: 'DM Mono', monospace;
          font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase;
          cursor: pointer; transition: all 0.2s;
        }
        .pp-edit-btn:hover { background: rgba(240,184,73,0.12); border-color: rgba(240,184,73,0.55); }

        .pp-input {
          background: rgba(240,184,73,0.06);
          border: 1px solid rgba(240,184,73,0.3);
          border-radius: 6px; padding: 6px 10px;
          color: #f0ead8; font-family: 'DM Mono', monospace;
          font-size: inherit; letter-spacing: inherit; outline: none;
          width: 100%; transition: border-color 0.2s;
        }
        .pp-input:focus { border-color: rgba(240,184,73,0.65); }

        .pp-tabs {
          display: flex; gap: 2px;
          border-bottom: 1px solid rgba(240,184,73,0.1);
          margin-bottom: 28px;
        }
        .pp-tab {
          padding: 10px 20px; background: none; border: none;
          font-family: 'DM Mono', monospace; font-size: 10.5px;
          letter-spacing: 0.1em; text-transform: uppercase;
          cursor: pointer; color: rgba(200,185,150,0.35);
          border-bottom: 2px solid transparent; margin-bottom: -1px;
          transition: color 0.2s, border-color 0.2s;
        }
        .pp-tab.active { color: #f0b849; border-bottom-color: #f0b849; }
        .pp-tab:hover:not(.active) { color: rgba(200,185,150,0.65); }

        .pp-stats {
          display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;
          margin-bottom: 28px;
        }
        @media (min-width: 640px) { .pp-stats { grid-template-columns: repeat(4, 1fr); } }

        .pp-stat {
          padding: 16px 18px; border-radius: 11px;
          border: 1px solid rgba(240,184,73,0.1);
          background: rgba(240,184,73,0.02);
          animation: pp-fadeUp 0.4s ease both;
          transition: border-color 0.2s, background 0.2s;
        }
        .pp-stat:hover { border-color: rgba(240,184,73,0.25); background: rgba(240,184,73,0.05); }
        .pp-stat-val { font-size: 20px; font-weight: 600; color: #f0b849; letter-spacing: -0.02em; margin-bottom: 4px; }
        .pp-stat-label { font-size: 9.5px; color: rgba(200,185,150,0.4); letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 8px; }
        .pp-stat-delta { font-size: 9.5px; color: rgba(200,185,150,0.3); letter-spacing: 0.03em; }

        .pp-section-label {
          font-size: 9.5px; color: rgba(240,184,73,0.4); letter-spacing: 0.14em; text-transform: uppercase;
          margin-bottom: 12px; display: flex; align-items: center; gap: 10px;
        }
        .pp-section-label::after { content:''; flex:1; height:1px; background:rgba(240,184,73,0.08); }

        .pp-file-list { display: flex; flex-direction: column; gap: 8px; }
        .pp-file {
          display: flex; align-items: center; gap: 12px;
          padding: 12px 14px; border-radius: 10px;
          border: 1px solid rgba(240,184,73,0.08);
          background: rgba(255,255,255,0.015);
          animation: pp-fadeUp 0.3s ease both;
          transition: border-color 0.2s, background 0.2s;
          cursor: default;
        }
        .pp-file:hover { border-color: rgba(240,184,73,0.2); background: rgba(240,184,73,0.04); }
        .pp-file-type {
          font-size: 8.5px; letter-spacing: 0.08em; text-transform: uppercase;
          padding: 3px 8px; border-radius: 4px; font-weight: 500; flex-shrink: 0;
        }
        .pp-file-name { flex: 1; font-size: 12px; color: #f0ead8; letter-spacing: 0.01em; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .pp-file-time { font-size: 10px; color: rgba(200,185,150,0.3); letter-spacing: 0.03em; flex-shrink: 0; }
        .pp-file-done { font-size: 9px; color: #4ade80; letter-spacing: 0.06em; flex-shrink: 0; }
      `}</style>

      <div className="pp-wrap">
        <div className="pp-inner" style={{ opacity: mounted ? 1 : 0, transition: 'opacity 0.3s' }}>

          <button className="pp-back" onClick={() => router.back()}>
            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
            back
          </button>

          {/* Hero */}
          <div className="pp-hero" style={{ animation: mounted ? 'pp-fadeUp 0.4s ease both' : 'none' }}>
            <div className="pp-avatar-wrap">
              <div className="pp-avatar">
                {name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                <div className="pp-avatar-scan" style={{ top: `${scanLine}%` }} />
              </div>
              <span className="pp-av-corner tl" /><span className="pp-av-corner tr" />
              <span className="pp-av-corner bl" /><span className="pp-av-corner br" />
              <div className="pp-status-dot" />
            </div>

            <div className="pp-hero-info">
              <div className="pp-tag"><span className="pp-tag-dot" />AGENT PROFILE</div>
              {editMode ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
                  <input className="pp-input" style={{ fontSize: 18, fontWeight: 600 }} value={name}  onChange={e => setName(e.target.value)} />
                  <input className="pp-input" style={{ fontSize: 12 }} value={role}  onChange={e => setRole(e.target.value)} />
                  <input className="pp-input" style={{ fontSize: 11 }} value={email} onChange={e => setEmail(e.target.value)} />
                </div>
              ) : (
                <>
                  <div className="pp-name">
                    {name}
                    <span style={{ fontSize: 9, padding: '2px 7px', borderRadius: 4, background: 'rgba(74,222,128,0.1)', color: '#4ade80', letterSpacing: '0.08em', textTransform: 'uppercase' }}>ACTIVE</span>
                  </div>
                  <div className="pp-role">{role}</div>
                  <div className="pp-email">
                    <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                    </svg>
                    {email}
                  </div>
                </>
              )}
            </div>

            <button className="pp-edit-btn" onClick={() => setEditMode(e => !e)}>
              {editMode ? '✓ Save' : '✎ Edit'}
            </button>
          </div>

          {/* Tabs */}
          <div className="pp-tabs" style={{ animation: mounted ? 'pp-fadeUp 0.4s ease 0.08s both' : 'none' }}>
            {TABS.map(t => (
              <button key={t} className={`pp-tab${activeTab === t ? ' active' : ''}`} onClick={() => setActiveTab(t)}>
                {t}
              </button>
            ))}
          </div>

          {/* Overview */}
          {activeTab === 'Overview' && (
            <div style={{ animation: 'pp-fadeUp 0.3s ease both' }}>
              <div className="pp-section-label">performance metrics</div>
              <div className="pp-stats">
                {(STATS as any[]).map((s, i) => (
                  <div key={s.label} className="pp-stat" style={{ animationDelay: `${i * 0.06}s`, borderColor: s.isSubscription ? 'rgba(240,184,73,0.2)' : undefined }}>
                    <div className="pp-stat-label">{s.label}</div>
                    <div className="pp-stat-val" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {s.value}
                      {s.badge && (
                        <span style={{ fontSize: 8, padding: '2px 6px', borderRadius: 4, background: 'rgba(74,222,128,0.12)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.25)', letterSpacing: '0.08em', fontWeight: 500 }}>
                          {s.badge}
                        </span>
                      )}
                    </div>
                    <div className="pp-stat-delta">{s.delta}</div>
                    {s.isSubscription && (
                      <button style={{ marginTop: 10, fontSize: 9, padding: '3px 10px', borderRadius: 4, background: 'rgba(240,184,73,0.08)', border: '1px solid rgba(240,184,73,0.25)', color: 'rgba(240,184,73,0.7)', fontFamily: "'DM Mono',monospace", letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer' }}>
                        Manage →
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="pp-section-label" style={{ marginTop: 28 }}>recent documents</div>
              <div className="pp-file-list">
                {RECENT.map((f, i) => (
                  <div key={i} className="pp-file" style={{ animationDelay: `${i * 0.05}s` }}>
                    <span className="pp-file-type" style={{ background: `${TYPE_COLOR[f.type]}18`, color: TYPE_COLOR[f.type], border: `1px solid ${TYPE_COLOR[f.type]}30` }}>
                      {f.type}
                    </span>
                    <span className="pp-file-name">{f.name}</span>
                    <span className="pp-file-time">{f.time}</span>
                    <span className="pp-file-done">✓ done</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Activity */}
          {activeTab === 'Activity' && (
            <div style={{ animation: 'pp-fadeUp 0.3s ease both' }}>
              <div className="pp-section-label">agent usage this month</div>
              {[
                { label: 'HR Agent',        pct: 64, color: '#f0b849', count: '742 docs' },
                { label: 'Marketing Agent', pct: 36, color: '#a78bfa', count: '409 docs' },
              ].map((a, i) => (
                <div key={a.label} style={{ marginBottom: 18, animation: `pp-fadeUp 0.3s ease ${i * 0.07}s both` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
                    <span style={{ fontSize: 11, color: 'rgba(200,185,150,0.65)', letterSpacing: '0.03em' }}>{a.label}</span>
                    <span style={{ fontSize: 10, color: 'rgba(200,185,150,0.35)', letterSpacing: '0.04em' }}>{a.count} · {a.pct}%</span>
                  </div>
                  <div style={{ height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: 3, background: `linear-gradient(90deg, ${a.color}99, ${a.color})`, width: `${a.pct}%`, boxShadow: `0 0 10px ${a.color}55`, transition: 'width 1s cubic-bezier(0.4,0,0.2,1)' }} />
                  </div>
                </div>
              ))}

              <div className="pp-section-label" style={{ marginTop: 32 }}>all documents</div>
              <div className="pp-file-list">
                {RECENT.map((f, i) => (
                  <div key={i} className="pp-file" style={{ animationDelay: `${i * 0.05}s` }}>
                    <span className="pp-file-type" style={{ background: `${TYPE_COLOR[f.type]}18`, color: TYPE_COLOR[f.type], border: `1px solid ${TYPE_COLOR[f.type]}30` }}>
                      {f.type}
                    </span>
                    <span className="pp-file-name">{f.name}</span>
                    <span className="pp-file-time">{f.time}</span>
                    <span className="pp-file-done">✓ done</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}