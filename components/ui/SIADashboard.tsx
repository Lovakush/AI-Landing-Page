'use client';

import { useState, useEffect, useRef } from "react";
import {
  Bot, Settings, Bell, Search, Activity,
  Users, Zap,
  ChevronRight, Home, MessageSquare,
  FileText, Target, Upload, X, CloudUpload,
  FolderOpen, Check, Sparkles, Brain, Cpu, ArrowRight,
  Shield, Star, Briefcase, ChevronDown, AlertCircle,
  Loader, CircleCheck, ScanSearch, Wand2,
  Mail, CreditCard, Menu,
} from "lucide-react";
import { useRouter } from "next/navigation";

import SettingsPage from "@/app/settings/page";
import {
  fetchProfile, fetchAgentStatus, isAuthenticated, requestAgentSSO,
  type UserProfile, type AgentStatus,
} from "@/lib/api";

// ======================== DESIGN TOKENS ========================
const C = {
  bg: '#0A0818',
  bgSidebar: '#0E0C1D',
  bgCard: 'rgba(139, 92, 246, 0.06)',
  bgCardHover: 'rgba(139, 92, 246, 0.12)',
  border: 'rgba(139, 92, 246, 0.15)',
  borderHover: 'rgba(139, 92, 246, 0.30)',
  purple: '#8B5CF6',
  purpleLight: '#A78BFA',
  purpleDim: 'rgba(139, 92, 246, 0.15)',
  gold: '#F5A623',
  goldDim: 'rgba(245, 166, 35, 0.15)',
  green: '#22C55E',
  greenDim: 'rgba(34, 197, 94, 0.15)',
  blue: '#3B82F6',
  blueDim: 'rgba(59, 130, 246, 0.15)',
  cyan: '#06B6D4',
  cyanDim: 'rgba(6, 182, 212, 0.15)',
  pink: '#EC4899',
  pinkDim: 'rgba(236, 72, 153, 0.15)',
  text: '#FFFFFF',
  textSec: 'rgba(255,255,255,0.75)',
  textMut: 'rgba(255,255,255,0.55)',
};

const AGENT_OPTIONS = [
  { id: 'hr',        label: 'HR Agent',    sub: 'Recruitment & people ops',  color: C.pink, dim: C.pinkDim, Icon: Users,  href: '/hr-agent'    },
  { id: 'marketing', label: 'MARK Agent',  sub: 'Marketing & campaigns',     color: C.gold, dim: C.goldDim, Icon: Target, href: '/agents/mark' },
];

const NAV = [
  { Icon: Home, label: 'Dashboard' },
  { Icon: Briefcase, label: 'Agents' },
  { Icon: Activity, label: 'Analytics' },
  { Icon: Zap, label: 'Automations' },
  { Icon: MessageSquare, label: 'Messages', badge: 3 },
  { Icon: Settings, label: 'Settings' },
];

const HR_DOC_TYPES = [
  { icon: '📄', label: 'Resumes', desc: 'PDF, DOCX — auto-parsed & ranked' },
  { icon: '📋', label: 'Job Descriptions', desc: 'Extract requirements & skills' },
  { icon: '📊', label: 'Assessment Reports', desc: 'Score sheets, test results' },
  { icon: '🤝', label: 'Offer Letters', desc: 'Templates & signed copies' },
];

const ANALYSIS_STEPS = [
  { id: 'parse',   label: 'Parsing document structure',    icon: ScanSearch, dur: 1200 },
  { id: 'extract', label: 'Extracting candidate data',     icon: Brain,      dur: 1800 },
  { id: 'score',   label: 'Scoring against job criteria',  icon: Star,       dur: 1500 },
  { id: 'rank',    label: 'Ranking & generating insights', icon: Wand2,      dur: 1000 },
];

// ======================== EXPANDED KEYFRAMES ========================
const KEYFRAMES = `
  /* ── Existing ── */
  @keyframes dashPulse { 0%,100%{opacity:1} 50%{opacity:0.35} }
  @keyframes dashSlideIn { from{opacity:0;transform:translateX(-10px)} to{opacity:1;transform:translateX(0)} }
  @keyframes dashFillBar { from{width:0%} }
  @keyframes dashGlow { 0%,100%{opacity:0.3} 50%{opacity:0.6} }
  @keyframes dashTyping { 0%,60%,100%{opacity:0.2} 30%{opacity:1} }
  @keyframes dashFadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
  @keyframes dashShimmer { 0%{transform:translateX(-100%)} 100%{transform:translateX(200%)} }
  @keyframes modalIn { from{opacity:0;transform:scale(0.95) translateY(8px)} to{opacity:1;transform:scale(1) translateY(0)} }
  @keyframes overlayIn { from{opacity:0} to{opacity:1} }
  @keyframes agentPanelIn { from{opacity:0;transform:translateY(-8px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
  @keyframes dropdownIn { from{opacity:0;transform:translateY(-6px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
  @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
  @keyframes progressFill { from{width:0%} }
  @keyframes stepIn { from{opacity:0;transform:translateX(-8px)} to{opacity:1;transform:translateX(0)} }
  @keyframes resultIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  @keyframes pulseRing { 0%{transform:scale(1);opacity:0.6} 100%{transform:scale(1.6);opacity:0} }
  @keyframes borderGlow { 0%,100%{border-color:rgba(236,72,153,0.3)} 50%{border-color:rgba(236,72,153,0.7)} }

  /* ── NEW AGENTIC ANIMATIONS ── */

  /* Staggered card reveal */
  @keyframes cardReveal {
    from { opacity:0; transform:translateY(18px) scale(0.97); }
    to   { opacity:1; transform:translateY(0)    scale(1);    }
  }

  /* Sidebar slide-in from left */
  @keyframes sidebarIn {
    from { opacity:0; transform:translateX(-16px); }
    to   { opacity:1; transform:translateX(0); }
  }

  /* Floating ambient orb */
  @keyframes orbFloat {
    0%,100% { transform:translate(0,0) scale(1);   opacity:0.45; }
    33%     { transform:translate(10px,-12px) scale(1.1); opacity:0.7; }
    66%     { transform:translate(-8px,8px) scale(0.95); opacity:0.5; }
  }

  /* Stat card shimmer sweep */
  @keyframes shimmerSweep {
    0%   { background-position: -400px 0; }
    100% { background-position: 400px 0; }
  }

  /* Scan line vertical */
  @keyframes scanLineY {
    0%   { top: -4px; opacity: 0.7; }
    80%  { opacity: 0.7; }
    100% { top: 100%; opacity: 0; }
  }

  /* Pulse dot glow */
  @keyframes glowDot {
    0%,100% { box-shadow: 0 0 3px 1px currentColor; transform: scale(1); }
    50%     { box-shadow: 0 0 10px 3px currentColor; transform: scale(1.25); }
  }

  /* Badge pop */
  @keyframes badgePop {
    0%   { transform: scale(0.6); opacity: 0; }
    70%  { transform: scale(1.1); }
    100% { transform: scale(1);   opacity: 1; }
  }

  /* Typewriter cursor blink */
  @keyframes cursorBlink {
    0%,100% { opacity: 1; }
    50%     { opacity: 0; }
  }

  /* Rotating dashed ring */
  @keyframes dashRotate {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }

  /* Sidebar nav item hover slide */
  @keyframes navItemIn {
    from { opacity:0; transform:translateX(-8px); }
    to   { opacity:1; transform:translateX(0); }
  }

  /* Welcome banner gradient shift */
  @keyframes bannerGrad {
    0%   { background-position: 0% 50%; }
    50%  { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }

  /* Agent card border glow pulse */
  @keyframes agentBorderPulse {
    0%,100% { box-shadow: 0 0 0 0 rgba(236,72,153,0); }
    50%     { box-shadow: 0 0 16px 2px rgba(236,72,153,0.18); }
  }

  /* Data stream lines */
  @keyframes dataStream {
    0%   { transform: translateY(-100%); opacity: 0; }
    10%  { opacity: 0.6; }
    90%  { opacity: 0.6; }
    100% { transform: translateY(500%); opacity: 0; }
  }

  /* Sparkle twinkle */
  @keyframes twinkle {
    0%,100% { opacity:0.2; transform:scale(0.7); }
    50%     { opacity:1;   transform:scale(1); }
  }

  /* Counter number tick */
  @keyframes numTick {
    from { opacity:0; transform:translateY(6px) scale(0.9); }
    to   { opacity:1; transform:translateY(0)   scale(1); }
  }

  /* ── Scrollbar ── */
  .sia-dash *::-webkit-scrollbar { width:6px; height:6px; }
  .sia-dash *::-webkit-scrollbar-track { background:rgba(255,255,255,0.03); border-radius:3px; }
  .sia-dash *::-webkit-scrollbar-thumb { background:rgba(139,92,246,0.25); border-radius:3px; }
  .sia-dash *::-webkit-scrollbar-thumb:hover { background:rgba(139,92,246,0.4); }
  .sia-dash { scrollbar-color:rgba(139,92,246,0.25) rgba(255,255,255,0.03); scrollbar-width:thin; }

  /* ── Interactive helpers ── */
  .sia-stat-card { transition: border-color 0.25s, box-shadow 0.25s, transform 0.2s; }
  .sia-stat-card:hover {
    border-color: rgba(139,92,246,0.35) !important;
    box-shadow: 0 0 24px rgba(139,92,246,0.12);
    transform: translateY(-2px);
  }
  .sia-agent-card { transition: border-color 0.25s, box-shadow 0.25s, transform 0.2s; }
  .sia-agent-card:hover {
    transform: translateY(-1px);
    box-shadow: 0 8px 32px rgba(0,0,0,0.4);
  }
  .sia-nav-item { transition: background 0.15s, border-color 0.15s; }
  .sia-btn { transition: opacity 0.18s, transform 0.15s, box-shadow 0.18s; }
  .sia-btn:hover { opacity:0.88; transform:translateY(-1px); box-shadow:0 4px 14px rgba(0,0,0,0.3); }
  .sia-btn:active { transform:translateY(0) scale(0.97); }

  .upload-drop-zone.dragging {
    border-color: rgba(236,72,153,0.7) !important;
    background: rgba(236,72,153,0.1) !important;
  }

  /* ── RESPONSIVE BREAKPOINTS ── */
  /* Mobile: < 640px */
  @media (max-width: 639px) {
    .sia-dash { height: 100%; min-height: 100vh; }
    .sia-sidebar-mobile-toggle { display: flex !important; }
    .sia-sidebar-desktop { display: none !important; }
    .sia-stat-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 8px !important; }
    .sia-agent-right-grid { grid-template-columns: 1fr !important; }
    .sia-header-search { display: none !important; }
    .sia-welcome-banner { padding: 10px 12px !important; font-size: 13px !important; }
    .sia-main-body { padding: 10px 12px !important; }
    .sia-stat-card { padding: 9px 10px !important; }
    .sia-agent-card { padding: 10px 12px !important; }
  }

  /* Tablet: 640px - 1024px */
  @media (min-width: 640px) and (max-width: 1024px) {
    .sia-stat-grid { grid-template-columns: repeat(2, 1fr) !important; }
    .sia-agent-right-grid { grid-template-columns: 1fr !important; gap: 10px !important; }
    .sia-header-search { min-width: 120px !important; }
  }

  /* Small Tablet: 1024px - 1280px */
  @media (max-width: 1279px) {
    .sia-agent-right-grid { grid-template-columns: 1fr !important; }
  }

  /* Desktop: 1280px+ */
  @media (min-width: 1280px) {
    .sia-stat-grid { grid-template-columns: repeat(4, 1fr) !important; }
    .sia-agent-right-grid { grid-template-columns: 1.1fr 0.9fr !important; }
  }

  /* Hide scrollbar for mobile if needed */
  @media (max-width: 639px) {
    .sia-dash *::-webkit-scrollbar { width: 4px; }
  }
`;


// ======================== HOOKS ========================
function useCounter(target: number, dur = 1600, dec = 0) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let n = 0;
    const step = target / (dur / 16);
    const t = setInterval(() => {
      n += step;
      if (n >= target) { setV(target); clearInterval(t); }
      else setV(Number(n.toFixed(dec)));
    }, 16);
    return () => clearInterval(t);
  }, [target, dur, dec]);
  return v;
}

// ======================== AGENTIC BACKGROUND CANVAS ========================
function AgenticBackground() {
  return (
    <>
      {/* Floating orbs */}
      {[
        { top: '-120px', right: '-80px', w: 450, h: 450, color: 'rgba(139,92,246,0.08)', dur: '4s', delay: '0s' },
        { top: 'auto', right: 'auto', bottom: '-80px', left: '180px', w: 350, h: 350, color: 'rgba(245,166,35,0.04)', dur: '5s', delay: '1s' },
        { top: '30%', right: '10%', w: 200, h: 200, color: 'rgba(236,72,153,0.05)', dur: '7s', delay: '2s' },
      ].map((orb, i) => (
        <div key={i} style={{
          position: 'absolute',
          top: orb.top ?? undefined,
          bottom: (orb as any).bottom ?? undefined,
          right: orb.right ?? undefined,
          left: (orb as any).left ?? undefined,
          width: orb.w, height: orb.h,
          background: `radial-gradient(circle, ${orb.color} 0%, transparent 70%)`,
          pointerEvents: 'none',
          animation: `orbFloat ${orb.dur} ease-in-out infinite ${orb.delay}`,
          borderRadius: '50%',
        }} />
      ))}

      {/* Data stream lines */}
      {[15, 35, 55, 75, 88].map((left, i) => (
        <div key={i} style={{
          position: 'absolute', top: 0, left: `${left}%`,
          width: 1, height: '60px',
          background: `linear-gradient(180deg, transparent, ${i % 2 === 0 ? C.purple : C.pink}44, transparent)`,
          animation: `dataStream ${3 + i * 0.7}s linear infinite ${i * 0.9}s`,
          pointerEvents: 'none',
        }} />
      ))}
    </>
  );
}

// ======================== ANIMATED STAT CARD ========================
function AnimatedStatCard({ label, val, suf, color, Icon, tag, delay, style }: any) {
  return (
    <div
      className="sia-stat-card"
      style={{
        padding: '10px 12px', borderRadius: 10, background: C.bgCard,
        border: `1px solid ${C.border}`, position: 'relative', overflow: 'hidden',
        animation: `cardReveal 0.5s cubic-bezier(0.22,1,0.36,1) ${delay}s both`,
        ...style,
      }}
    >
      {/* Shimmer sweep */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: `linear-gradient(105deg, transparent 40%, ${color}10 50%, transparent 60%)`,
        backgroundSize: '800px 100%',
        animation: `shimmerSweep 4s linear infinite ${delay}s`,
      }} />
      {/* Scan line */}
      <div style={{
        position: 'absolute', left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg, transparent, ${color}44, transparent)`,
        animation: `scanLineY ${3 + parseFloat(delay) * 0.5}s linear infinite ${delay}s`,
        pointerEvents: 'none',
      }} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <div style={{ width: 24, height: 24, borderRadius: 7, background: color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={12} color={color} />
        </div>
        {tag && (
          <span style={{
            fontSize: 8, color, fontWeight: 700, background: color + '20', padding: '2px 6px', borderRadius: 5,
            animation: `badgePop 0.4s cubic-bezier(0.22,1,0.36,1) ${parseFloat(delay) + 0.2}s both`,
          }}>{tag}</span>
        )}
      </div>
      <div style={{
        fontSize: typeof val === 'string' && val.length > 6 ? 12 : 20,
        fontWeight: 800, lineHeight: 1, letterSpacing: '-0.5px', color,
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        animation: `numTick 0.5s cubic-bezier(0.22,1,0.36,1) ${parseFloat(delay) + 0.15}s both`,
      }}>
        {val}{suf}
      </div>
      <div style={{ fontSize: 9, color: C.textMut, marginTop: 3 }}>{label}</div>
    </div>
  );
}

// ======================== PULSING STATUS DOT ========================
function PulseStatusDot({ color, ok }: { color: string; ok: boolean }) {
  return (
    <div style={{
      width: 5, height: 5, borderRadius: 3,
      background: ok ? color : C.textMut,
      color: ok ? color : C.textMut,
      boxShadow: ok ? `0 0 5px ${color}` : 'none',
      animation: ok ? `glowDot 2s ease-in-out infinite` : 'none',
      flexShrink: 0,
    }} />
  );
}

// ======================== SPINNING AVATAR RING ========================
function AvatarWithRing({ initials, color, size = 30 }: { initials: string; color: string; size?: number }) {
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      {/* Spinning dashed ring */}
      <div style={{
        position: 'absolute', inset: -3, borderRadius: '50%',
        border: `1.5px dashed ${color}55`,
        animation: 'dashRotate 10s linear infinite',
        pointerEvents: 'none',
      }} />
      <div style={{
        width: size, height: size, borderRadius: size / 2,
        background: `linear-gradient(135deg,rgba(240,184,73,0.2),rgba(240,184,73,0.1))`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: size * 0.37, fontWeight: 700, color,
        border: `1.5px solid ${color}35`,
        boxShadow: `0 2px 8px rgba(0,0,0,0.4)`,
        letterSpacing: '-0.3px',
      }}>
        {initials}
      </div>
    </div>
  );
}

// ======================== HR AGENTIC UPLOAD MODAL ========================
type UploadedFile = { name: string; size: string; type: string };
type AnalysisPhase = 'idle' | 'analyzing' | 'done';

function HRAgentUploadModal({ onClose }: { onClose: () => void }) {
  const [dragging, setDragging] = useState(false);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [phase, setPhase] = useState<AnalysisPhase>('idle');
  const [currentStep, setCurrentStep] = useState(0);
  const [stepsDone, setStepsDone] = useState<number[]>([]);
  const [progress, setProgress] = useState(0);
  const [jobRole] = useState('Senior Product Designer');
  const fileRef = useRef<HTMLInputElement>(null);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const addFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    setFiles(prev => [...prev, ...Array.from(fileList).map(f => ({ name: f.name, size: formatSize(f.size), type: f.type || 'unknown' }))]);
  };

  const handleDrop = (e: React.DragEvent) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); };

  const startAnalysis = () => {
    if (files.length === 0) return;
    setPhase('analyzing'); setCurrentStep(0); setStepsDone([]); setProgress(0);
    let prog = 0;
    const totalDur = ANALYSIS_STEPS.reduce((a, s) => a + s.dur, 0);
    const runStep = (idx: number) => {
      if (idx >= ANALYSIS_STEPS.length) { setPhase('done'); setProgress(100); return; }
      setCurrentStep(idx);
      const dur = ANALYSIS_STEPS[idx].dur;
      const startProg = prog, endProg = prog + (dur / totalDur) * 100;
      const startTime = Date.now();
      const tick = () => {
        const elapsed = Date.now() - startTime;
        const frac = Math.min(elapsed / dur, 1);
        setProgress(startProg + (endProg - startProg) * frac);
        if (frac < 1) requestAnimationFrame(tick);
        else { prog = endProg; setStepsDone(p => [...p, idx]); runStep(idx + 1); }
      };
      requestAnimationFrame(tick);
    };
    runStep(0);
  };

  const MOCK_RESULTS = [
    { name: files[0]?.name?.replace(/\.[^.]+$/, '') || 'Candidate A', score: 94, tag: 'Top Match', color: C.green, skills: ['Product Strategy', 'Figma', 'User Research'] },
    { name: 'Secondary Profile', score: 78, tag: 'Strong', color: C.purple, skills: ['UI Design', 'Prototyping', 'A/B Testing'] },
    { name: 'Third Candidate', score: 61, tag: 'Moderate', color: C.gold, skills: ['Visual Design', 'Branding'] },
  ];

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.8)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(8px)', animation:'overlayIn 0.2s ease', padding:'12px' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ width:'100%', maxWidth:580, maxHeight:'90vh', overflow:'hidden', display:'flex', flexDirection:'column', background:'#0D0B1E', border:`1px solid rgba(236,72,153,0.25)`, borderRadius:18, boxShadow:'0 40px 100px rgba(0,0,0,0.9), 0 0 60px rgba(236,72,153,0.08)', animation:'modalIn 0.28s cubic-bezier(0.16,1,0.3,1)' }}>
        <div style={{ padding:'16px 20px', borderBottom:`1px solid rgba(236,72,153,0.15)`, display:'flex', alignItems:'center', justifyContent:'space-between', background:'rgba(236,72,153,0.04)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ position:'relative' }}>
              <div style={{ width:34, height:34, borderRadius:10, background:C.pinkDim, display:'flex', alignItems:'center', justifyContent:'center', border:`1px solid rgba(236,72,153,0.3)` }}>
                <Users size={15} color={C.pink} />
              </div>
              <div style={{ position:'absolute', inset:-2, borderRadius:12, border:`1px solid rgba(236,72,153,0.4)`, animation:'pulseRing 2s ease-out infinite' }} />
            </div>
            <div>
              <div style={{ fontSize:13, fontWeight:800, color:C.text, letterSpacing:'-0.3px' }}>HR Agent</div>
              <div style={{ fontSize:9, color:C.pink, fontWeight:600, letterSpacing:'0.06em' }}>DOCUMENT INTELLIGENCE</div>
            </div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            {phase === 'analyzing' && (
              <div style={{ display:'flex', alignItems:'center', gap:5, padding:'4px 10px', borderRadius:20, background:'rgba(236,72,153,0.12)', border:`1px solid rgba(236,72,153,0.25)` }}>
                <div style={{ width:6, height:6, borderRadius:3, background:C.pink, animation:'dashPulse 1s ease-in-out infinite' }} />
                <span style={{ fontSize:9, color:C.pink, fontWeight:700 }}>ANALYZING</span>
              </div>
            )}
            {phase === 'done' && (
              <div style={{ display:'flex', alignItems:'center', gap:5, padding:'4px 10px', borderRadius:20, background:'rgba(34,197,94,0.12)', border:`1px solid rgba(34,197,94,0.25)` }}>
                <CircleCheck size={11} color={C.green} />
                <span style={{ fontSize:9, color:C.green, fontWeight:700 }}>COMPLETE</span>
              </div>
            )}
            <button onClick={onClose} className="sia-btn" style={{ background:'none', border:'none', cursor:'pointer', color:C.textMut, padding:4, borderRadius:6, display:'flex' }}><X size={15} /></button>
          </div>
        </div>
        <div style={{ flex:1, overflowY:'auto', padding:20 }}>
          {phase === 'idle' && (
            <>
              <div style={{ padding:'10px 14px', borderRadius:10, background:'rgba(236,72,153,0.07)', border:`1px solid rgba(236,72,153,0.18)`, marginBottom:16, display:'flex', alignItems:'center', gap:10 }}>
                <Brain size={14} color={C.pink} style={{ flexShrink:0 }} />
                <div style={{ fontSize:10, color:C.textSec, lineHeight:1.5 }}>
                  HR Agent will <span style={{ color:C.pink, fontWeight:700 }}>automatically parse, score, and rank</span> uploaded documents against your active job role.
                </div>
              </div>
              <div style={{ marginBottom:14 }}>
                <label style={{ fontSize:9, color:C.textMut, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', display:'block', marginBottom:6 }}>Active Job Role</label>
                <div style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 12px', borderRadius:9, background:C.bgCard, border:`1px solid ${C.border}`, cursor:'pointer' }}>
                  <Briefcase size={12} color={C.pink} />
                  <span style={{ fontSize:11, color:C.text, fontWeight:600, flex:1 }}>{jobRole}</span>
                  <ChevronDown size={11} color={C.textMut} />
                </div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6, marginBottom:14 }}>
                {HR_DOC_TYPES.map((d, i) => (
                  <div key={i} style={{ padding:'8px 10px', borderRadius:8, background:C.bgCard, border:`1px solid ${C.border}`, display:'flex', alignItems:'center', gap:8, animation:`cardReveal 0.4s ease ${i*0.07}s both` }}>
                    <span style={{ fontSize:16 }}>{d.icon}</span>
                    <div>
                      <div style={{ fontSize:10, fontWeight:700, color:C.text }}>{d.label}</div>
                      <div style={{ fontSize:8, color:C.textMut }}>{d.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className={`upload-drop-zone${dragging ? ' dragging' : ''}`}
                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
                style={{ border:`2px dashed ${dragging ? C.pink : 'rgba(236,72,153,0.3)'}`, borderRadius:12, padding:'28px 20px', textAlign:'center', cursor:'pointer', background:dragging ? 'rgba(236,72,153,0.08)' : 'rgba(236,72,153,0.04)', transition:'all 0.2s', marginBottom:files.length > 0 ? 12 : 0 }}>
                <input ref={fileRef} type="file" multiple style={{ display:'none' }} onChange={e => addFiles(e.target.files)} />
                <div style={{ width:42, height:42, borderRadius:11, background:'rgba(236,72,153,0.15)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 10px', border:'1px solid rgba(236,72,153,0.3)' }}>
                  <CloudUpload size={18} color={C.pink} />
                </div>
                <div style={{ fontSize:12, fontWeight:700, color:C.textSec, marginBottom:3 }}>Drop resumes or documents here</div>
                <div style={{ fontSize:10, color:C.textMut }}>or <span style={{ color:C.pink, textDecoration:'underline' }}>browse files</span></div>
                <div style={{ fontSize:9, color:C.textMut, marginTop:8 }}>PDF · DOCX · CSV · XLSX · Max 50MB</div>
              </div>
              {files.length > 0 && (
                <div style={{ display:'flex', flexDirection:'column', gap:5, maxHeight:130, overflowY:'auto' }}>
                  {files.map((f, i) => (
                    <div key={i} style={{ display:'flex', alignItems:'center', gap:9, padding:'8px 12px', borderRadius:8, background:'rgba(236,72,153,0.07)', border:`1px solid rgba(236,72,153,0.2)`, animation:`cardReveal 0.3s ease ${i*0.05}s both` }}>
                      <div style={{ width:26, height:26, borderRadius:7, background:C.greenDim, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}><Check size={12} color={C.green} /></div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:11, fontWeight:600, color:C.text, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{f.name}</div>
                        <div style={{ fontSize:9, color:C.textMut }}>{f.size}</div>
                      </div>
                      <button onClick={() => setFiles(p => p.filter((_,j) => j !== i))} className="sia-btn" style={{ background:'none', border:'none', cursor:'pointer', color:C.textMut, padding:2, display:'flex' }}><X size={12} /></button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
          {phase === 'analyzing' && (
            <div style={{ animation:'dashFadeIn 0.4s ease' }}>
              <div style={{ marginBottom:20 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                  <span style={{ fontSize:11, fontWeight:700, color:C.text }}>Analyzing {files.length} document{files.length > 1 ? 's' : ''}...</span>
                  <span style={{ fontSize:11, fontWeight:800, color:C.pink }}>{Math.round(progress)}%</span>
                </div>
                <div style={{ height:6, borderRadius:3, background:'rgba(255,255,255,0.06)', overflow:'hidden' }}>
                  <div style={{ height:'100%', borderRadius:3, background:`linear-gradient(90deg, ${C.pink}, #c026d3)`, width:`${progress}%`, transition:'width 0.1s linear', position:'relative', overflow:'hidden' }}>
                    <div style={{ position:'absolute', inset:0, background:'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)', animation:'dashShimmer 1.5s ease-in-out infinite' }} />
                  </div>
                </div>
              </div>
              <div style={{ padding:'14px 16px', borderRadius:12, background:'rgba(236,72,153,0.06)', border:`1px solid rgba(236,72,153,0.2)`, marginBottom:16, animation:'borderGlow 2s ease-in-out infinite' }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
                  <div style={{ width:28, height:28, borderRadius:8, background:C.pinkDim, display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <Cpu size={13} color={C.pink} style={{ animation:'spin 2s linear infinite' }} />
                  </div>
                  <span style={{ fontSize:11, fontWeight:700, color:C.pink }}>HR Agent Processing</span>
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {ANALYSIS_STEPS.map((step, i) => {
                    const isDone = stepsDone.includes(i);
                    const isActive = currentStep === i && !isDone;
                    const StepIcon = step.icon;
                    return (
                      <div key={step.id} style={{ display:'flex', alignItems:'center', gap:10, opacity:i > currentStep && !isDone ? 0.3 : 1, transition:'opacity 0.3s', animation: isActive || isDone ? 'stepIn 0.3s ease' : 'none' }}>
                        <div style={{ width:22, height:22, borderRadius:6, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, background:isDone ? C.greenDim : isActive ? C.pinkDim : 'rgba(255,255,255,0.04)', border:`1px solid ${isDone ? C.green+'44' : isActive ? C.pink+'44' : 'rgba(255,255,255,0.08)'}` }}>
                          {isDone ? <Check size={11} color={C.green} strokeWidth={3} />
                            : isActive ? <StepIcon size={11} color={C.pink} style={{ animation:'spin 1.5s linear infinite' }} />
                            : <StepIcon size={11} color={C.textMut} />}
                        </div>
                        <span style={{ fontSize:10, color:isDone ? C.textSec : isActive ? C.pink : C.textMut, fontWeight:isActive ? 700 : 500 }}>{step.label}</span>
                        {isDone && <Check size={10} color={C.green} strokeWidth={2.5} style={{ marginLeft:'auto' }} />}
                        {isActive && (
                          <div style={{ marginLeft:'auto', display:'flex', gap:2 }}>
                            {[0,1,2].map(j => <div key={j} style={{ width:3, height:3, borderRadius:2, background:C.pink, animation:`dashTyping 1.2s ease infinite ${j*0.15}s` }} />)}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
                {files.map((f,i) => (
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:9, padding:'7px 12px', borderRadius:8, background:C.bgCard, border:`1px solid ${C.border}` }}>
                    <FileText size={12} color={C.pink} />
                    <span style={{ fontSize:10, color:C.textSec, flex:1 }}>{f.name}</span>
                    <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                      <Loader size={10} color={C.pink} style={{ animation:'spin 1s linear infinite' }} />
                      <span style={{ fontSize:9, color:C.pink, fontWeight:600 }}>Processing</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {phase === 'done' && (
            <div style={{ animation:'resultIn 0.5s ease' }}>
              <div style={{ padding:'12px 16px', borderRadius:12, background:'rgba(34,197,94,0.08)', border:`1px solid rgba(34,197,94,0.25)`, marginBottom:16, display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ width:36, height:36, borderRadius:10, background:C.greenDim, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}><CircleCheck size={18} color={C.green} /></div>
                <div>
                  <div style={{ fontSize:12, fontWeight:800, color:C.text }}>Analysis Complete</div>
                  <div style={{ fontSize:9, color:C.textSec, marginTop:2 }}>Processed {files.length} document{files.length > 1 ? 's' : ''} · Matched against <span style={{ color:C.pink }}>"{jobRole}"</span></div>
                </div>
                <div style={{ marginLeft:'auto', textAlign:'right' }}>
                  <div style={{ fontSize:18, fontWeight:900, color:C.green }}>{files.length}</div>
                  <div style={{ fontSize:8, color:C.textMut }}>profiles ranked</div>
                </div>
              </div>
              <div style={{ padding:'10px 14px', borderRadius:10, background:'rgba(139,92,246,0.08)', border:`1px solid rgba(139,92,246,0.2)`, marginBottom:14, display:'flex', gap:10 }}>
                <Sparkles size={13} color={C.purpleLight} style={{ flexShrink:0, marginTop:2 }} />
                <div style={{ fontSize:10, color:C.textSec, lineHeight:1.6 }}>
                  <span style={{ color:C.purpleLight, fontWeight:700 }}>AI Insight: </span>
                  Top candidate shows strong alignment in product strategy and UX research. Recommend fast-tracking to technical interview. Second candidate excels in execution but lacks strategic depth.
                </div>
              </div>
              <div style={{ marginBottom:14 }}>
                <div style={{ fontSize:9, color:C.textMut, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:8 }}>Candidate Rankings</div>
                <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
                  {MOCK_RESULTS.map((r,i) => (
                    <div key={i} style={{ padding:'10px 14px', borderRadius:10, background:C.bgCard, border:`1px solid ${C.border}`, animation:`resultIn 0.4s ease ${i*0.1}s both` }}>
                      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                          <div style={{ width:22, height:22, borderRadius:6, background:r.color+'20', display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, fontWeight:800, color:r.color }}>#{i+1}</div>
                          <span style={{ fontSize:11, fontWeight:700, color:C.text }}>{r.name}</span>
                          <span style={{ fontSize:8, padding:'2px 7px', borderRadius:5, background:r.color+'20', color:r.color, fontWeight:700 }}>{r.tag}</span>
                        </div>
                        <span style={{ fontSize:16, fontWeight:900, color:r.color }}>{r.score}</span>
                      </div>
                      <div style={{ height:3, borderRadius:2, background:'rgba(255,255,255,0.05)', overflow:'hidden', marginBottom:8 }}>
                        <div style={{ height:'100%', borderRadius:2, background:`linear-gradient(90deg, ${r.color}, ${r.color}88)`, width:`${r.score}%`, animation:'progressFill 1s ease' }} />
                      </div>
                      <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
                        {r.skills.map((s,j) => <span key={j} style={{ fontSize:8, padding:'2px 7px', borderRadius:4, background:'rgba(255,255,255,0.06)', color:C.textSec, fontWeight:600 }}>{s}</span>)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
        <div style={{ padding:'12px 20px', borderTop:`1px solid rgba(236,72,153,0.12)`, display:'flex', justifyContent:'space-between', alignItems:'center', background:'rgba(236,72,153,0.03)', flexShrink:0 }}>
          <div style={{ fontSize:9, color:C.textMut }}>
            {phase === 'idle' && `${files.length} file${files.length !== 1 ? 's' : ''} selected`}
            {phase === 'analyzing' && `${Math.round(progress)}% complete`}
            {phase === 'done' && `Ready to export results`}
          </div>
          <div style={{ display:'flex', gap:8 }}>
            {phase !== 'analyzing' && (
              <button onClick={onClose} className="sia-btn" style={{ padding:'7px 14px', borderRadius:8, fontSize:11, fontWeight:600, background:'none', border:`1px solid ${C.border}`, color:C.textMut, cursor:'pointer' }}>
                {phase === 'done' ? 'Close' : 'Cancel'}
              </button>
            )}
            {phase === 'idle' && (
              <button onClick={startAnalysis} disabled={files.length === 0} className="sia-btn"
                style={{ padding:'7px 18px', borderRadius:8, fontSize:11, fontWeight:700, background:files.length > 0 ? `linear-gradient(135deg, ${C.pink}, #c026d3)` : 'rgba(236,72,153,0.15)', border:'none', color:files.length > 0 ? '#fff' : C.textMut, cursor:files.length > 0 ? 'pointer' : 'default', display:'flex', alignItems:'center', gap:6 }}>
                <Brain size={12} />Analyze with AI
              </button>
            )}
            {phase === 'done' && (
              <button className="sia-btn" style={{ padding:'7px 18px', borderRadius:8, fontSize:11, fontWeight:700, background:`linear-gradient(135deg, ${C.green}, #16a34a)`, border:'none', color:'#fff', cursor:'pointer', display:'flex', alignItems:'center', gap:6 }}>
                <ArrowRight size={12} />Export Results
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ======================== UPLOAD DROPDOWN ========================
function UploadDropdown({ onSelectAgent, onClose }: { onSelectAgent: (id: string) => void; onClose: () => void }) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  return (
    <div style={{ position:'absolute', top:'calc(100% + 10px)', right:0, zIndex:500, width:260, background:'#0F0D20', border:`1px solid rgba(139,92,246,0.2)`, borderRadius:14, overflow:'hidden', boxShadow:'0 24px 70px rgba(0,0,0,0.8)', animation:'dropdownIn 0.22s cubic-bezier(0.16,1,0.3,1)' }}>
      <div style={{ padding:'11px 14px', borderBottom:`1px solid rgba(139,92,246,0.12)`, display:'flex', alignItems:'center', justifyContent:'space-between', background:'rgba(139,92,246,0.04)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:7 }}>
          <span style={{ fontSize:9, fontWeight:800, color:C.purpleLight, letterSpacing:'0.12em', textTransform:'uppercase' }}>Upload via Agent</span>
        </div>
        <button onClick={onClose} className="sia-btn" style={{ background:'none', border:'none', cursor:'pointer', color:C.textMut, padding:3, borderRadius:5 }}><X size={12} /></button>
      </div>
      <div style={{ padding:'8px', display:'flex', flexDirection:'column', gap:2 }}>
        {AGENT_OPTIONS.map(ag => {
          const isHovered = hoveredId === ag.id;
          return (
            <button key={ag.id} onClick={() => { onSelectAgent(ag.id); onClose(); }}
              onMouseEnter={() => setHoveredId(ag.id)} onMouseLeave={() => setHoveredId(null)}
              style={{ display:'flex', alignItems:'center', gap:12, padding:'11px 12px', borderRadius:10, background:isHovered ? 'rgba(255,255,255,0.05)' : 'transparent', border:`1px solid ${isHovered ? 'rgba(139,92,246,0.18)' : 'transparent'}`, cursor:'pointer', textAlign:'left', width:'100%', transition:'all 0.16s' }}>
              <div style={{ width:38, height:38, borderRadius:11, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', background:ag.dim, border:`1px solid ${ag.color}44`, transition:'transform 0.18s', transform:isHovered ? 'scale(1.05)' : 'scale(1)' }}>
                <ag.Icon size={16} color={ag.color} />
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:12, fontWeight:700, color:isHovered ? C.text : C.textSec, marginBottom:2 }}>{ag.label}</div>
                <div style={{ fontSize:9, color:C.textMut }}>{ag.sub}</div>
              </div>
              <ArrowRight size={13} color={isHovered ? ag.color : C.textMut} style={{ flexShrink:0, transition:'color 0.15s, transform 0.15s', transform:isHovered ? 'translateX(2px)' : 'none' }} />
            </button>
          );
        })}
      </div>
      <div style={{ padding:'8px 14px 10px', borderTop:`1px solid rgba(139,92,246,0.10)`, display:'flex', alignItems:'center', gap:6 }}>
        <Sparkles size={10} color={C.purpleLight} style={{ opacity:0.7, animation:'twinkle 2s ease-in-out infinite' }} />
        <span style={{ fontSize:9, color:C.textMut }}>Agents auto-process & analyze uploads</span>
      </div>
    </div>
  );
}

// ======================== AGENT SELECTOR PANEL ========================
function AgentSelectorPanel({ selectedId, onSelect, canMark, canHR }: { selectedId: string | null; onSelect: (id: string) => void; canMark?: boolean; canHR?: boolean; }) {
  return (
    <div style={{ borderRadius:10, background:C.bgCard, border:`1px solid ${C.border}`, overflow:'hidden', animation:'agentPanelIn 0.22s cubic-bezier(0.16,1,0.3,1)' }}>
      <div style={{ padding:'9px 12px', borderBottom:`1px solid ${C.border}`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ fontSize:11, fontWeight:700, display:'flex', alignItems:'center', gap:6 }}>
          <Bot size={12} color={C.purple} /> Your Agents
        </div>
        <span style={{ fontSize:8, color:C.textMut, letterSpacing:'0.1em', textTransform:'uppercase' }}>click to open</span>
      </div>
      <div style={{ padding:'6px 8px', display:'flex', flexDirection:'column', gap:4 }}>
        {AGENT_OPTIONS.map((ag, i) => {
          const hasAccess = ag.id === 'marketing' ? canMark : canHR;
          const isSelected = selectedId === ag.id;
          return (
            <div key={ag.id} style={{ position:'relative', animation:`navItemIn 0.35s cubic-bezier(0.22,1,0.36,1) ${i*0.08}s both` }}>
              <button
                onClick={() => hasAccess ? (window.location.href = ag.href) : onSelect(ag.id)}
                style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 10px', borderRadius:8, background:isSelected ? ag.dim : 'transparent', border:`1px solid ${isSelected ? ag.color+'55' : 'transparent'}`, cursor:'pointer', textAlign:'left', width:'100%', transition:'all 0.18s', opacity:hasAccess ? 1 : 0.5 }}
                onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = C.bgCardHover; }}
                onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
                <div style={{ width:32, height:32, borderRadius:9, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', background:ag.dim, border:`1px solid ${ag.color}33`, position:'relative' }}>
                  <ag.Icon size={14} color={ag.color} />
                  {hasAccess && <div style={{ position:'absolute', inset:-2, borderRadius:11, border:`1px solid ${ag.color}33`, animation:`pulseRing 3s ease-out infinite ${i*0.5}s` }} />}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:11, fontWeight:700, color:isSelected ? ag.color : C.text }}>{ag.label}</div>
                  <div style={{ fontSize:9, color:C.textMut, marginTop:1 }}>{hasAccess ? ag.sub : 'No subscription — contact admin'}</div>
                </div>
                {hasAccess ? <ArrowRight size={12} color={ag.color} /> : <div style={{ fontSize:8, color:C.textMut }}>🔒</div>}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ======================== MAIN COMPONENT ========================
export default function SIADashboard() {
  const router = useRouter();
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [uploadDropdownOpen, setUploadDropdownOpen] = useState(false);
  const [sidebarDropdownOpen, setSidebarDropdownOpen] = useState(false);
  const [activeAgentModal, setActiveAgentModal] = useState<string | null>(null);
  const [activeNav, setActiveNav] = useState('Dashboard');
  const [navHovered, setNavHovered] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const uploadBtnRef = useRef<HTMLDivElement>(null);
  const sidebarAgentBtnRef = useRef<HTMLDivElement>(null);

  // SSO loading state (stores agent id while redirect is in progress)
  const [ssoLoading, setSsoLoading] = useState<string | null>(null);

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [agentStatus, setAgentStatus] = useState<AgentStatus | null>(null);

  useEffect(() => {
    if (!isAuthenticated()) return;
    Promise.all([
      fetchProfile().catch(() => null),
      fetchAgentStatus().catch(() => null),
    ]).then(([p, a]) => {
      if (p) setUserProfile(p);
      if (a) setAgentStatus(a);
    });
  }, []);

  useEffect(() => {
    if (!uploadDropdownOpen) return;
    const handler = (e: MouseEvent) => { if (uploadBtnRef.current && !uploadBtnRef.current.contains(e.target as Node)) setUploadDropdownOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [uploadDropdownOpen]);

  useEffect(() => {
    if (!sidebarDropdownOpen) return;
    const handler = (e: MouseEvent) => { if (sidebarAgentBtnRef.current && !sidebarAgentBtnRef.current.contains(e.target as Node)) setSidebarDropdownOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [sidebarDropdownOpen]);

  const font = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";

  // Open Agent: SSO flow for HR Agent, direct link for MARK Agent
  const openAgent = async (agentId: string, href: string) => {
    if (agentId === 'hr') {
      setSsoLoading('hr');
      try {
        await requestAgentSSO('hr');
      } catch (err) {
        setSsoLoading(null);
        console.error('[SSO] HR Agent SSO failed:', err);
      }
    } else {
      window.location.href = href;
    }
  };

  const canMark = agentStatus?.can_access_mark ?? userProfile?.can_access_mark ?? false;
  const canHR   = agentStatus?.can_access_hr   ?? userProfile?.can_access_hr   ?? false;

  const userInitials = userProfile
    ? (userProfile.full_name || '?').split(' ').filter(Boolean).map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)
    : '·';

  return (
    <div className="sia-dash" style={{ fontFamily:font, color:C.text, background:C.bg, borderRadius:16, overflow:'hidden', display:'flex', height:'100%', minHeight:500, position:'relative', border:`1px solid ${C.border}` }}>
      <style>{KEYFRAMES}</style>

      {/* Modals */}
      {activeAgentModal === 'hr' && <HRAgentUploadModal onClose={() => setActiveAgentModal(null)} />}
      {activeAgentModal === 'marketing' && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.8)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(8px)', padding:'12px' }}
          onClick={() => setActiveAgentModal(null)}>
          <div style={{ padding:'30px 40px', borderRadius:16, background:'#0E0C1D', border:`1px solid ${C.goldDim}`, textAlign:'center', animation:'modalIn 0.25s ease' }}>
            <Target size={32} color={C.gold} style={{ marginBottom:12 }} />
            <div style={{ fontSize:14, fontWeight:800, marginBottom:6 }}>Marketing Agent Upload</div>
            <div style={{ fontSize:11, color:C.textMut }}>Coming soon — campaign assets & briefs</div>
          </div>
        </div>
      )}

      {/* Agentic Background */}
      <AgenticBackground />

      {/* SIDEBAR - DESKTOP */}
      <div className="sia-sidebar-desktop" style={{ width:52, background:C.bgSidebar, borderRight:`1px solid ${C.border}`, display:'flex', flexDirection:'column', alignItems:'center', padding:'12px 0', flexShrink:0, zIndex:10, animation:'sidebarIn 0.45s cubic-bezier(0.22,1,0.36,1) both' }}>
        {/* Logo with subtle spin ring */}
        <div style={{ position:'relative', marginBottom:20 }}>
          <div style={{ position:'absolute', inset:-4, borderRadius:'50%', border:`1px dashed ${C.purple}30`, animation:'dashRotate 20s linear infinite', pointerEvents:'none' }} />
          <img src="/sia-globe-v2.png" alt="SIA" style={{ width:32, height:32, objectFit:'contain', mixBlendMode:'lighten' }} />
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:3, flex:1 }}>
          {NAV.map((item, i) => {
            const isAgents = item.label === 'Agents';
            const isActive = isAgents ? sidebarDropdownOpen : activeNav === item.label;
            const isHov = navHovered === item.label;

            const navItem = (
              <div
                key={i}
                title={item.label}
                onClick={() => {
                  if (isAgents) { setSidebarDropdownOpen(v => !v); }
                  else { setActiveNav(item.label); setSidebarDropdownOpen(false); }
                }}
                onMouseEnter={() => setNavHovered(item.label)}
                onMouseLeave={() => setNavHovered(null)}
                className="sia-nav-item"
                style={{
                  width:36, height:36, borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center',
                  cursor:'pointer', position:'relative',
                  background:isActive ? 'rgba(139,92,246,0.20)' : isHov ? 'rgba(255,255,255,0.05)' : 'transparent',
                  border:isActive ? `1px solid rgba(139,92,246,0.40)` : isHov ? `1px solid rgba(255,255,255,0.08)` : '1px solid transparent',
                  animation:`navItemIn 0.4s cubic-bezier(0.22,1,0.36,1) ${i*0.06}s both`,
                  boxShadow:isActive ? `0 0 14px rgba(139,92,246,0.2)` : 'none',
                  transition:'background 0.15s, border-color 0.15s, box-shadow 0.2s',
                }}
              >
                <item.Icon size={16} color={isActive ? C.purple : isHov ? C.textSec : C.textMut} strokeWidth={isActive ? 2.2 : 1.8} style={{ transition:'color 0.15s' }} />
                {item.badge && (
                  <div style={{ position:'absolute', top:4, right:4, minWidth:14, height:14, borderRadius:7, background:C.purple, fontSize:8, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, padding:'0 3px', color:'#fff', border:`1.5px solid ${C.bgSidebar}`, boxShadow:`0 0 6px rgba(139,92,246,0.5)`, animation:'badgePop 0.4s ease both' }}>{item.badge}</div>
                )}
                {isActive && !isAgents && (
                  <div style={{ position:'absolute', left:-1, top:'50%', transform:'translateY(-50%)', width:3, height:18, borderRadius:'0 3px 3px 0', background:C.purple, boxShadow:`0 0 8px ${C.purple}` }} />
                )}
              </div>
            );

            if (isAgents) {
              return (
                <div key={i} ref={sidebarAgentBtnRef} style={{ position:'relative' }}>
                  {navItem}
                  {sidebarDropdownOpen && (
                    <div style={{ position:'absolute', left:44, top:-6, zIndex:999, width:270, background:'#0F0D20', border:`1px solid rgba(139,92,246,0.22)`, borderRadius:14, overflow:'hidden', boxShadow:'0 24px 70px rgba(0,0,0,0.85)', animation:'dropdownIn 0.22s cubic-bezier(0.16,1,0.3,1)' }}>
                      <div style={{ padding:'11px 14px', borderBottom:`1px solid rgba(139,92,246,0.12)`, display:'flex', alignItems:'center', justifyContent:'space-between', background:'rgba(139,92,246,0.05)' }}>
                        <span style={{ fontSize:9, fontWeight:800, color:C.purpleLight, letterSpacing:'0.12em', textTransform:'uppercase' }}>Upload via Agent</span>
                        <button onClick={() => setSidebarDropdownOpen(false)} className="sia-btn" style={{ background:'none', border:'none', cursor:'pointer', color:C.textMut, padding:3, borderRadius:5 }}><X size={12} /></button>
                      </div>
                      <div style={{ padding:'8px', display:'flex', flexDirection:'column', gap:2 }}>
                        {AGENT_OPTIONS.map((ag, idx) => (
                          <button key={ag.id}
                            onClick={() => { setSidebarDropdownOpen(false); setActiveAgentModal(ag.id); }}
                            style={{ display:'flex', alignItems:'center', gap:12, padding:'11px 12px', borderRadius:10, background:'transparent', border:`1px solid transparent`, cursor:'pointer', textAlign:'left', width:'100%', transition:'all 0.16s', animation:`navItemIn 0.3s ease ${idx*0.06}s both` }}
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(139,92,246,0.18)'; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.borderColor = 'transparent'; }}>
                            <div style={{ width:40, height:40, borderRadius:12, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', background:ag.dim, border:`1px solid ${ag.color}44` }}>
                              <ag.Icon size={17} color={ag.color} />
                            </div>
                            <div style={{ flex:1, minWidth:0 }}>
                              <div style={{ fontSize:12, fontWeight:700, color:C.text, marginBottom:2 }}>{ag.label}</div>
                              <div style={{ fontSize:9, color:C.textMut }}>{ag.sub}</div>
                            </div>
                            <ArrowRight size={13} color={C.textMut} style={{ flexShrink:0 }} />
                          </button>
                        ))}
                      </div>
                      <div style={{ padding:'8px 14px 10px', borderTop:`1px solid rgba(139,92,246,0.10)`, display:'flex', alignItems:'center', gap:6 }}>
                        <Sparkles size={10} color={C.purpleLight} style={{ opacity:0.7, animation:'twinkle 2s ease-in-out infinite' }} />
                        <span style={{ fontSize:9, color:C.textMut }}>Agents auto-process & analyze uploads</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            }
            return navItem;
          })}
        </div>

        {/* Avatar with spinning ring */}
        <div onClick={() => router.push('/profile')} title={userProfile?.full_name ?? 'Profile'} style={{ cursor:'pointer' }}>
          <AvatarWithRing initials={userInitials} color={C.gold} size={30} />
        </div>
      </div>

      {/* MAIN */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden', zIndex:1 }}>
        {/* Header */}
        <div style={{ padding:'10px 16px', borderBottom:`1px solid ${C.border}`, display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0, backdropFilter:'blur(10px)', animation:'dashFadeIn 0.4s ease 0.1s both' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            {/* Mobile Menu Button */}
            <button
              className="sia-sidebar-mobile-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{
                display:'none', background:'none', border:'none', cursor:'pointer',
                padding:'6px 8px', borderRadius:8, color:C.textMut,
                marginRight:'4px',
              }}>
              {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
            <span style={{ fontSize:13, fontWeight:800, animation:'dashFadeIn 0.4s ease 0.15s both' }}>{activeNav}</span>
            <span style={{ fontSize:8, fontWeight:700, color:C.purpleLight, background:C.purpleDim, padding:'2px 6px', borderRadius:5, letterSpacing:0.5, textTransform:'uppercase', animation:'badgePop 0.4s ease 0.3s both' }}>Beta</span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div className="sia-header-search" style={{ display:'flex', alignItems:'center', gap:6, padding:'5px 10px', borderRadius:8, background:C.bgCard, border:`1px solid ${C.border}`, fontSize:10, color:C.textMut, cursor:'text', minWidth:140, animation:'dashFadeIn 0.4s ease 0.2s both' }}>
              <Search size={11} /><span>Search agents...</span>
              <span style={{ marginLeft:'auto', width:1, height:10, background:C.textMut, animation:'cursorBlink 1.2s ease-in-out infinite' }} />
            </div>
            <div style={{ position:'relative', cursor:'pointer', padding:4, animation:'dashFadeIn 0.4s ease 0.25s both' }}>
              <Bell size={14} color={C.textSec} />
              <div style={{ position:'absolute', top:3, right:3, width:6, height:6, borderRadius:3, background:C.gold, border:`2px solid ${C.bg}`, animation:'glowDot 2s ease-in-out infinite' }} />
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="sia-main-body" style={{ flex:1, overflow: activeNav === 'Settings' ? 'hidden' : 'auto', padding: activeNav === 'Settings' ? '0' : '12px 16px' }}>

          {activeNav === 'Settings' && <SettingsPage onBack={() => setActiveNav('Dashboard')} />}

          {activeNav !== 'Settings' && (
            <>
              {/* WELCOME BANNER */}
              <div className="sia-welcome-banner" style={{
                padding:'12px 16px', borderRadius:12, marginBottom:12,
                background:'linear-gradient(270deg, rgba(139,92,246,0.12), rgba(245,166,35,0.06), rgba(139,92,246,0.10))',
                backgroundSize:'400% 400%',
                border:`1px solid ${C.border}`,
                animation:'cardReveal 0.5s cubic-bezier(0.22,1,0.36,1) 0s both, bannerGrad 8s ease infinite',
                position:'relative', overflow:'hidden',
              }}>
                {/* Subtle sparkles */}
                {[20, 60, 85].map((left, i) => (
                  <div key={i} style={{
                    position:'absolute', top:'20%', left:`${left}%`,
                    width:4, height:4, borderRadius:'50%',
                    background:i % 2 === 0 ? C.purpleLight : C.gold,
                    animation:`twinkle ${2 + i}s ease-in-out infinite ${i*0.7}s`,
                    pointerEvents:'none',
                  }} />
                ))}
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:8 }}>
                  <div>
                    <div style={{ fontSize:15, fontWeight:800, letterSpacing:'-0.2px', marginBottom:2, animation:'dashFadeIn 0.5s ease 0.1s both' }}>
                      {userProfile?.full_name ? `Welcome back, ${userProfile.full_name.split(' ')[0]}.` : 'Welcome to SIA.'}
                    </div>
                    <div style={{ fontSize:10, color:C.textMut, animation:'dashFadeIn 0.5s ease 0.2s both' }}>
                      {userProfile?.tenant
                        ? <>{userProfile.tenant.name} · <span style={{ color: userProfile.tenant.subscription_status === 'active' || userProfile.tenant.subscription_status === 'trial' ? C.green : '#f87171', fontWeight:700 }}>{userProfile.tenant.subscription_status.toUpperCase()}</span></>
                        : 'No organisation assigned — contact your administrator'}
                    </div>
                  </div>
                  <div style={{ display:'flex', gap:6 }}>
                    {[
                      { label:'MARK Agent', color:C.gold,  ok: canMark },
                      { label:'HR Agent',   color:C.pink,  ok: canHR },
                    ].map((a, i) => (
                      <div key={a.label} style={{
                        display:'flex', alignItems:'center', gap:5, padding:'4px 10px', borderRadius:20,
                        background:a.ok ? `${a.color}15` : 'rgba(255,255,255,0.04)',
                        border:`1px solid ${a.ok ? a.color+'44' : 'rgba(255,255,255,0.08)'}`,
                        fontSize:9, color:a.ok ? a.color : C.textMut, fontWeight:700, letterSpacing:'0.04em',
                        animation:`badgePop 0.4s cubic-bezier(0.22,1,0.36,1) ${0.3 + i*0.1}s both`,
                      }}>
                        <PulseStatusDot color={a.color} ok={a.ok} />
                        {a.label}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* STAT CARDS */}
              <div className="sia-stat-grid" style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:10, marginBottom:14 }}>
                {[
                  { label:'Agents Accessible', val: [canMark, canHR].filter(Boolean).length, suf:'/2', color:C.purple, Icon:Bot, tag:'Now', delay:'0.05' },
                  { label:'Subscription', val: userProfile?.tenant?.subscription_type?.toUpperCase() ?? 'NONE', suf:'', color:C.gold, Icon:Star, tag:'', delay:'0.12' },
                  { label:'Status', val: userProfile?.tenant?.subscription_status?.toUpperCase() ?? 'N/A', suf:'', color: userProfile?.tenant?.subscription_status === 'active' ? C.green : userProfile?.tenant?.subscription_status === 'trial' ? C.gold : C.textMut, Icon:Shield, tag:'', delay:'0.19' },
                  { label:'Company', val: userProfile?.tenant?.name ?? '—', suf:'', color:C.cyan, Icon:Briefcase, tag:'', delay:'0.26' },
                ].map((s, i) => (
                  <AnimatedStatCard key={i} {...s} />
                ))}
              </div>

              {/* AGENT CARDS + RIGHT PANEL */}
              <div className="sia-agent-right-grid" style={{ display:'grid', gridTemplateColumns:'1.1fr 0.9fr', gap:10, marginBottom:12 }}>

                {/* LEFT */}
                <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                  <AgentSelectorPanel selectedId={selectedAgent} onSelect={setSelectedAgent} canMark={canMark} canHR={canHR} />

                  {[
                    {
                      id:'marketing', name:'MARK Agent', role:'Marketing Intelligence',
                      desc:'AI-powered marketing automation — campaigns, content strategy, lead generation, and performance analytics powered by n8n.',
                      color:C.gold, dim:C.goldDim, Icon:Target, href:'/agents/mark',
                      has:canMark, infra:'n8n · Cloud', delay:'0.22',
                    },
                    {
                      id:'hr', name:'HR Agent', role:'HR Operations',
                      desc:'Intelligent HR automation — resume screening, candidate ranking, onboarding workflows, and people analytics deployed on AWS.',
                      color:C.pink, dim:C.pinkDim, Icon:Users, href:'/hr-agent',
                      has:canHR, infra:'AWS · Enterprise', delay:'0.3',
                    },
                  ].map((ag) => (
                    <div key={ag.id} className="sia-agent-card" style={{
                      padding:'12px 14px', borderRadius:10, background:C.bgCard,
                      border:`1px solid ${ag.has ? ag.color+'30' : C.border}`,
                      animation:`cardReveal 0.5s cubic-bezier(0.22,1,0.36,1) ${ag.delay}s both`,
                      position:'relative', overflow:'hidden',
                    }}>
                      {/* Shimmer on active agents */}
                      {ag.has && (
                        <div style={{ position:'absolute', inset:0, pointerEvents:'none', background:`linear-gradient(105deg, transparent 40%, ${ag.color}08 50%, transparent 60%)`, backgroundSize:'800px 100%', animation:`shimmerSweep 5s linear infinite` }} />
                      )}
                      <div style={{ display:'flex', alignItems:'flex-start', gap:10 }}>
                        <div style={{ width:36, height:36, borderRadius:10, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', background:ag.dim, border:`1px solid ${ag.color}33`, position:'relative' }}>
                          <ag.Icon size={16} color={ag.color} />
                          {ag.has && <div style={{ position:'absolute', inset:-2, borderRadius:12, border:`1px solid ${ag.color}33`, animation:`pulseRing 3s ease-out infinite` }} />}
                        </div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:2 }}>
                            <span style={{ fontSize:12, fontWeight:800 }}>{ag.name}</span>
                            <span style={{ fontSize:8, padding:'1px 6px', borderRadius:4, background:ag.has ? `${ag.color}20` : 'rgba(255,255,255,0.06)', color:ag.has ? ag.color : C.textMut, fontWeight:700, letterSpacing:'0.05em', animation:'badgePop 0.4s ease both' }}>
                              {ag.has ? 'ACTIVE' : 'NO ACCESS'}
                            </span>
                          </div>
                          <div style={{ fontSize:9, color:C.textMut, marginBottom:6, lineHeight:1.5 }}>{ag.desc}</div>
                          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                            <span style={{ fontSize:8, color:C.textMut }}>{ag.infra}</span>
                            {ag.has ? (
                              <button
                                onClick={() => openAgent(ag.id, ag.href)}
                                disabled={ssoLoading === ag.id}
                                style={{ display:'flex', alignItems:'center', gap:4, padding:'5px 12px', borderRadius:7, border:'none', cursor: ssoLoading === ag.id ? 'wait' : 'pointer', background:`linear-gradient(135deg, ${ag.color}, ${ag.color}cc)`, color:'#0a0a1a', fontSize:9, fontWeight:800, letterSpacing:'0.05em', opacity: ssoLoading === ag.id ? 0.7 : 1 }}>
                                {ssoLoading === ag.id ? 'Opening…' : 'Open Agent'} <ArrowRight size={9} />
                              </button>
                            ) : (
                              <span style={{ fontSize:8, color:C.textMut }}>Contact admin to activate</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* RIGHT PANEL */}
                <div style={{ display:'flex', flexDirection:'column', gap:10 }}>

                  {/* Subscription Card */}
                  <div style={{ borderRadius:10, background:C.bgCard, border:`1px solid ${C.border}`, overflow:'hidden', animation:'cardReveal 0.5s cubic-bezier(0.22,1,0.36,1) 0.18s both' }}>
                    <div style={{ padding:'9px 12px', borderBottom:`1px solid ${C.border}`, display:'flex', alignItems:'center', gap:6 }}>
                      <CreditCard size={12} color={C.purple} />
                      <span style={{ fontSize:11, fontWeight:700 }}>Subscription</span>
                    </div>
                    <div style={{ padding:'12px' }}>
                      {userProfile?.tenant ? (
                        <>
                          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                            <div>
                              <div style={{ fontSize:13, fontWeight:800, animation:'numTick 0.4s ease 0.3s both' }}>{userProfile.tenant.name}</div>
                              <div style={{ fontSize:9, color:C.textMut, marginTop:1 }}>Organisation account</div>
                            </div>
                            <div style={{ textAlign:'right' }}>
                              <div style={{ fontSize:11, fontWeight:700, color:C.gold }}>{userProfile.tenant.subscription_type.toUpperCase()}</div>
                              <div style={{ fontSize:9, color: userProfile.tenant.subscription_status === 'active' ? C.green : C.textMut, fontWeight:600 }}>{userProfile.tenant.subscription_status}</div>
                            </div>
                          </div>
                          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6 }}>
                            {[
                              { l:'MARK Agent', v: userProfile.can_access_mark ? 'Enabled' : 'Disabled', c: userProfile.can_access_mark ? C.green : C.textMut },
                              { l:'HR Agent',   v: userProfile.can_access_hr   ? 'Enabled' : 'Disabled', c: userProfile.can_access_hr   ? C.green : C.textMut },
                            ].map(r => (
                              <div key={r.l} style={{ padding:'7px 9px', borderRadius:7, background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)' }}>
                                <div style={{ fontSize:8, color:C.textMut, marginBottom:2 }}>{r.l}</div>
                                <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                                  <PulseStatusDot color={r.c} ok={r.v === 'Enabled'} />
                                  <div style={{ fontSize:10, fontWeight:700, color:r.c }}>{r.v}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </>
                      ) : (
                        <div style={{ textAlign:'center', padding:'20px 0' }}>
                          <AlertCircle size={24} color={C.textMut} style={{ marginBottom:8 }} />
                          <div style={{ fontSize:11, color:C.textMut, lineHeight:1.5 }}>No organisation assigned.<br/>Contact your administrator.</div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Quick Start */}
                  <div style={{ borderRadius:10, background:C.bgCard, border:`1px solid ${C.border}`, overflow:'hidden', animation:'cardReveal 0.5s cubic-bezier(0.22,1,0.36,1) 0.26s both', flex:1 }}>
                    <div style={{ padding:'9px 12px', borderBottom:`1px solid ${C.border}`, display:'flex', alignItems:'center', gap:6 }}>
                      <Sparkles size={12} color={C.gold} style={{ animation:'twinkle 2.5s ease-in-out infinite' }} />
                      <span style={{ fontSize:11, fontWeight:700 }}>Quick Start</span>
                    </div>
                    <div style={{ padding:'10px 12px', display:'flex', flexDirection:'column', gap:6 }}>
                      {[
                        { icon:'💬', label:'Chat with MARK', desc:'Run marketing tasks', ok: agentStatus?.can_access_mark ?? userProfile?.can_access_mark ?? false, href:'/agents/mark', agentId: 'marketing' as string | undefined },
                        { icon:'📄', label:'Screen Candidates', desc:'Upload CVs to HR Agent', ok: agentStatus?.can_access_hr ?? userProfile?.can_access_hr ?? false, href:'/hr-agent', agentId: 'hr' as string | undefined },
                        { icon:'⚙️', label:'Account Settings', desc:'Profile & integration', ok: true, href:'', agentId: undefined, onCl: () => setActiveNav('Settings') },
                      ].map(item => (
                        <button
                          key={item.label}
                          disabled={!item.ok || ssoLoading === item.agentId}
                          onClick={() => item.onCl ? item.onCl() : (item.agentId ? openAgent(item.agentId, item.href) : (item.href && (window.location.href = item.href)))}
                          style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 10px', borderRadius:8, background: item.ok ? 'rgba(255,255,255,0.03)' : 'transparent', border:`1px solid ${item.ok ? 'rgba(255,255,255,0.08)' : 'transparent'}`, cursor: item.ok ? 'pointer' : 'default', textAlign:'left', width:'100%', opacity: item.ok ? 1 : 0.45, transition:'all 0.15s' }}
                          onMouseEnter={e => item.ok && ((e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)')}
                          onMouseLeave={e => item.ok && ((e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)')}>
                          <span style={{ fontSize:14 }}>{item.icon}</span>
                          <div style={{ flex:1, textAlign:'left' }}>
                            <div style={{ fontSize:10, fontWeight:600, color:C.text }}>{item.label}</div>
                            <div style={{ fontSize:8, color:C.textMut }}>{item.desc}</div>
                          </div>
                          {item.ok && <ChevronRight size={11} color={C.textMut} />}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Support */}
                  <div style={{ padding:'10px 12px', borderRadius:10, background:`${C.purple}08`, border:`1px solid ${C.purple}22`, display:'flex', alignItems:'center', gap:10, animation:'cardReveal 0.5s cubic-bezier(0.22,1,0.36,1) 0.34s both' }}>
                    <Mail size={14} color={C.purpleLight} style={{ flexShrink:0 }} />
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:10, fontWeight:700, marginBottom:1 }}>Need help?</div>
                      <div style={{ fontSize:8, color:C.textMut }}>Contact your SIA account manager</div>
                    </div>
                    <button onClick={() => window.open('mailto:support@siasolutions.com')} className="sia-btn"
                      style={{ padding:'5px 11px', borderRadius:7, border:`1px solid ${C.purple}44`, background:'transparent', color:C.purpleLight, fontSize:9, fontWeight:700, cursor:'pointer', whiteSpace:'nowrap' }}>
                      Contact
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}