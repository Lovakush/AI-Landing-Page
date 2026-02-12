'use client';

import { useState, useEffect } from "react";
import {
  BarChart3, Bot, Settings, Bell, Search, Activity,
  TrendingUp, Users, Zap, Clock, CheckCircle,
  ChevronRight, Home, MessageSquare,
  Image, FileText, Target,
} from "lucide-react";
import { AreaChart, Area, XAxis, ResponsiveContainer } from "recharts";

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
  textSec: 'rgba(255,255,255,0.60)',
  textMut: 'rgba(255,255,255,0.35)',
};

// ======================== DATA ========================
const AGENTS = [
  { id: 'mark', name: 'MARK', role: 'Marketing Automation', status: 'Active', sColor: C.green, progress: 78, color: C.gold, dim: C.goldDim, Icon: Image, task: 'Generating carousel: slide 4/6 \u2014 adding CTA overlay' },
  { id: 'aria', name: 'ARIA', role: 'Content Writer', status: 'Writing', sColor: C.purple, progress: 92, color: C.purple, dim: C.purpleDim, Icon: FileText, task: 'Drafting blog: "AI Agents in Operations" \u2014 2,400 words' },
  { id: 'scout', name: 'SCOUT', role: 'Sales Intelligence', status: 'Scanning', sColor: C.blue, progress: 34, color: C.blue, dim: C.blueDim, Icon: Target, task: 'Analyzing 847 visitor sessions for intent signals...' },
  { id: 'pulse', name: 'PULSE', role: 'Analytics Engine', status: 'Active', sColor: C.green, progress: 67, color: C.cyan, dim: C.cyanDim, Icon: BarChart3, task: 'Compiling weekly KPI report \u2014 4 data sources' },
  { id: 'nexus', name: 'NEXUS', role: 'HR Operations', status: 'Idle', sColor: C.textMut, progress: 100, color: C.pink, dim: C.pinkDim, Icon: Users, task: 'Standby \u2014 all screening tasks completed' },
];

const FEED = [
  { agent: 'MARK', color: C.gold, text: 'Generated 6 carousel slides for Q1 campaign', time: '2m ago' },
  { agent: 'ARIA', color: C.purple, text: 'Drafted LinkedIn article \u2014 pending review', time: '5m ago' },
  { agent: 'SCOUT', color: C.blue, text: 'Identified 3 high-intent leads from traffic', time: '8m ago' },
  { agent: 'PULSE', color: C.cyan, text: 'Weekly engagement report ready for download', time: '12m ago' },
  { agent: 'MARK', color: C.gold, text: 'Video pipeline: Scene 2/4 rendering complete', time: '15m ago' },
  { agent: 'NEXUS', color: C.pink, text: 'Screened 12 applicants for Senior Design role', time: '23m ago' },
  { agent: 'ARIA', color: C.purple, text: 'A/B test copy variants for email campaign ready', time: '31m ago' },
  { agent: 'SCOUT', color: C.blue, text: 'Sales pipeline updated \u2014 4 deals moved to closing', time: '38m ago' },
];

const STATS = [
  { label: 'Tasks Completed', val: 247, suf: '', Icon: CheckCircle, color: C.green, tag: '+12%' },
  { label: 'Active Agents', val: 5, suf: '/6', Icon: Bot, color: C.purple, tag: 'Online' },
  { label: 'Hours Saved', val: 20, suf: 'h', Icon: Clock, color: C.gold, tag: 'This week' },
  { label: 'Accuracy Rate', val: 94.2, suf: '%', Icon: TrendingUp, color: C.cyan, tag: '+2.1%' },
];

const CHART = [
  { d: 'Mon', tasks: 28, eff: 89 }, { d: 'Tue', tasks: 35, eff: 91 },
  { d: 'Wed', tasks: 42, eff: 93 }, { d: 'Thu', tasks: 38, eff: 90 },
  { d: 'Fri', tasks: 51, eff: 94 }, { d: 'Sat', tasks: 22, eff: 96 },
  { d: 'Sun', tasks: 31, eff: 94 },
];

const NAV = [
  { Icon: Home, label: 'Dashboard', active: true },
  { Icon: Bot, label: 'Agents' },
  { Icon: Activity, label: 'Analytics' },
  { Icon: Zap, label: 'Automations' },
  { Icon: MessageSquare, label: 'Messages', badge: 3 },
  { Icon: Settings, label: 'Settings' },
];

// ======================== HOOKS ========================
function useCounter(target: number, dur = 2000, dec = 0) {
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

// ======================== STYLES (keyframes) ========================
const KEYFRAMES = `
  @keyframes dashPulse { 0%,100%{opacity:1} 50%{opacity:0.35} }
  @keyframes dashSlideIn { from{opacity:0;transform:translateX(-10px)} to{opacity:1;transform:translateX(0)} }
  @keyframes dashFillBar { from{width:0%} }
  @keyframes dashGlow { 0%,100%{opacity:0.3} 50%{opacity:0.6} }
  @keyframes dashTyping { 0%,60%,100%{opacity:0.2} 30%{opacity:1} }
  @keyframes dashFadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
  @keyframes dashShimmer { 0%{transform:translateX(-100%)} 100%{transform:translateX(200%)} }

  /* Dark scrollbar */
  .sia-dash *::-webkit-scrollbar { width: 6px; height: 6px; }
  .sia-dash *::-webkit-scrollbar-track { background: rgba(255,255,255,0.03); border-radius: 3px; }
  .sia-dash *::-webkit-scrollbar-thumb { background: rgba(139,92,246,0.25); border-radius: 3px; }
  .sia-dash *::-webkit-scrollbar-thumb:hover { background: rgba(139,92,246,0.4); }
  .sia-dash { scrollbar-color: rgba(139,92,246,0.25) rgba(255,255,255,0.03); scrollbar-width: thin; }
  .sia-dash * { scrollbar-color: rgba(139,92,246,0.25) rgba(255,255,255,0.03); scrollbar-width: thin; }
`;

// ======================== MAIN COMPONENT ========================
export default function SIADashboard() {
  const [visFeed, setVisFeed] = useState(4);
  const [hovered, setHovered] = useState<string | null>(null);

  useEffect(() => {
    if (visFeed < FEED.length) {
      const t = setTimeout(() => setVisFeed(v => v + 1), 1800);
      return () => clearTimeout(t);
    }
  }, [visFeed]);

  const counters = [
    useCounter(247, 2500),
    useCounter(5, 1000),
    useCounter(20, 2000),
    useCounter(94.2, 2500, 1),
  ];

  const font = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";

  return (
    <div className="sia-dash" style={{ fontFamily: font, color: C.text, background: C.bg, borderRadius: 16, overflow: 'hidden', display: 'flex', height: '100%', minHeight: 500, position: 'relative', border: `1px solid ${C.border}` }}>
      <style>{KEYFRAMES}</style>

      {/* Background glows */}
      <div style={{ position:'absolute', top:-120, right:-80, width:450, height:450, background:'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)', pointerEvents:'none', animation:'dashGlow 4s ease-in-out infinite' }} />
      <div style={{ position:'absolute', bottom:-80, left:180, width:350, height:350, background:'radial-gradient(circle, rgba(245,166,35,0.04) 0%, transparent 70%)', pointerEvents:'none', animation:'dashGlow 5s ease-in-out infinite 1s' }} />

      {/* SIDEBAR */}
      <div style={{ width: 52, background: C.bgSidebar, borderRight: `1px solid ${C.border}`, display:'flex', flexDirection:'column', alignItems:'center', padding:'12px 0', flexShrink:0, zIndex:2 }}>
        <div style={{ width:32, height:32, borderRadius:10, background:`linear-gradient(135deg, ${C.purple}, ${C.gold})`, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:20, fontSize:9, fontWeight:800, letterSpacing:1.5, boxShadow:`0 4px 20px rgba(139,92,246,0.3)` }}>
          SIA
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:4, flex:1 }}>
          {NAV.map((item, i) => (
            <div key={i} title={item.label} style={{
              width:34, height:34, borderRadius:9, display:'flex', alignItems:'center', justifyContent:'center',
              cursor:'pointer', position:'relative', transition:'all 0.2s',
              background: item.active ? C.bgCardHover : 'transparent',
              border: item.active ? `1px solid ${C.borderHover}` : '1px solid transparent',
            }}>
              <item.Icon size={15} color={item.active ? C.purple : C.textMut} strokeWidth={item.active ? 2.2 : 1.8} />
              {item.badge && (
                <div style={{ position:'absolute', top:5, right:5, minWidth:13, height:13, borderRadius:7, background:C.purple, fontSize:8, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, padding:'0 3px' }}>{item.badge}</div>
              )}
              {item.active && <div style={{ position:'absolute', left:-1, top:'50%', transform:'translateY(-50%)', width:3, height:16, borderRadius:'0 2px 2px 0', background:C.purple }} />}
            </div>
          ))}
        </div>
        <div style={{ width:28, height:28, borderRadius:14, background:`linear-gradient(135deg, ${C.purple}, ${C.pink})`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, cursor:'pointer', border:'2px solid rgba(255,255,255,0.1)' }}>L</div>
      </div>

      {/* MAIN */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden', zIndex:1 }}>
        {/* Header */}
        <div style={{ padding:'10px 16px', borderBottom:`1px solid ${C.border}`, display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0, backdropFilter:'blur(10px)' }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ fontSize:13, fontWeight:800 }}>Dashboard</span>
              <span style={{ fontSize:8, fontWeight:700, color:C.purple, background:C.purpleDim, padding:'1px 6px', borderRadius:5, letterSpacing:0.5, textTransform:'uppercase' }}>Beta</span>
            </div>
            <div style={{ fontSize:9, color:C.textMut, marginTop:1 }}>Thursday, Feb 12, 2026</div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ display:'flex', alignItems:'center', gap:6, padding:'5px 10px', borderRadius:8, background:C.bgCard, border:`1px solid ${C.border}`, fontSize:10, color:C.textMut, cursor:'text', minWidth:140 }}>
              <Search size={11} />
              <span>Search agents...</span>
            </div>
            <div style={{ position:'relative', cursor:'pointer', padding:4 }}>
              <Bell size={14} color={C.textSec} />
              <div style={{ position:'absolute', top:3, right:3, width:6, height:6, borderRadius:3, background:C.gold, border:`2px solid ${C.bg}` }} />
            </div>
          </div>
        </div>

        {/* Scrollable body */}
        <div style={{ flex:1, overflow:'auto', padding:'12px 16px' }}>
          {/* STATS ROW */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:10, marginBottom:14 }}>
            {STATS.map((s, i) => (
              <div key={i} style={{
                padding:'10px 12px', borderRadius:10, background:C.bgCard, border:`1px solid ${C.border}`,
                animation:`dashFadeIn 0.5s ease ${i*0.1}s both`,
              }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:6 }}>
                  <div style={{ width:24, height:24, borderRadius:7, background:s.color+'15', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <s.Icon size={12} color={s.color} />
                  </div>
                  <span style={{ fontSize:8, color:s.color, fontWeight:600, background:s.color+'10', padding:'1px 5px', borderRadius:5 }}>{s.tag}</span>
                </div>
                <div style={{ fontSize:20, fontWeight:800, lineHeight:1, letterSpacing:'-0.5px' }}>{counters[i]}{s.suf}</div>
                <div style={{ fontSize:9, color:C.textMut, marginTop:3 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* TWO COLUMNS: Agents + Feed */}
          <div style={{ display:'grid', gridTemplateColumns:'1.1fr 0.9fr', gap:10, marginBottom:14 }}>
            {/* Agent Cards */}
            <div style={{ borderRadius:10, background:C.bgCard, border:`1px solid ${C.border}`, overflow:'hidden' }}>
              <div style={{ padding:'9px 12px', borderBottom:`1px solid ${C.border}`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <div style={{ fontSize:11, fontWeight:700, display:'flex', alignItems:'center', gap:6 }}>
                  <Bot size={12} color={C.purple} /> Active Agents
                </div>
                <div style={{ fontSize:9, color:C.purple, cursor:'pointer', display:'flex', alignItems:'center', gap:3, fontWeight:600 }}>
                  View all <ChevronRight size={9} />
                </div>
              </div>
              <div style={{ padding:'4px 6px' }}>
                {AGENTS.map((a, i) => (
                  <div
                    key={a.id}
                    onMouseEnter={() => setHovered(a.id)}
                    onMouseLeave={() => setHovered(null)}
                    style={{
                      padding:'7px 8px', borderRadius:8, marginBottom:2, cursor:'pointer',
                      background: hovered === a.id ? C.bgCardHover : 'transparent',
                      border: `1px solid ${hovered === a.id ? C.borderHover : 'transparent'}`,
                      transition:'all 0.2s', animation:`dashFadeIn 0.4s ease ${i*0.08}s both`,
                    }}
                  >
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:4 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                        <div style={{ width:22, height:22, borderRadius:6, background:a.dim, display:'flex', alignItems:'center', justifyContent:'center', transition:'transform 0.2s', transform: hovered===a.id ? 'scale(1.08)' : 'scale(1)' }}>
                          <a.Icon size={11} color={a.color} />
                        </div>
                        <div>
                          <div style={{ fontSize:10, fontWeight:700, letterSpacing:'0.3px' }}>{a.name}</div>
                          <div style={{ fontSize:8, color:C.textMut }}>{a.role}</div>
                        </div>
                      </div>
                      <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                        <div style={{ width:5, height:5, borderRadius:3, background:a.sColor, animation: a.status!=='Idle' ? 'dashPulse 2s ease-in-out infinite' : 'none', boxShadow: a.status!=='Idle' ? `0 0 6px ${a.sColor}50` : 'none' }} />
                        <span style={{ fontSize:8, color:a.sColor, fontWeight:600 }}>{a.status}</span>
                      </div>
                    </div>
                    <div style={{ height:2, background:'rgba(255,255,255,0.05)', borderRadius:1, overflow:'hidden', marginBottom:3, position:'relative' }}>
                      <div style={{
                        height:'100%', borderRadius:1, width:`${a.progress}%`,
                        background:`linear-gradient(90deg, ${a.color}, ${a.color}99)`,
                        animation:`dashFillBar 1.5s ease ${i*0.12}s both`,
                        position:'relative', overflow:'hidden',
                      }}>
                        {a.status !== 'Idle' && (
                          <div style={{ position:'absolute', inset:0, background:'linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)', animation:'dashShimmer 2.5s ease-in-out infinite' }} />
                        )}
                      </div>
                    </div>
                    <div style={{ fontSize:8, color:C.textMut, display:'flex', justifyContent:'space-between' }}>
                      <span style={{ maxWidth:'78%', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{a.task}</span>
                      <span style={{ fontWeight:700, color:a.color }}>{a.progress}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Activity Feed */}
            <div style={{ borderRadius:10, background:C.bgCard, border:`1px solid ${C.border}`, overflow:'hidden', display:'flex', flexDirection:'column' }}>
              <div style={{ padding:'9px 12px', borderBottom:`1px solid ${C.border}`, display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
                <div style={{ fontSize:11, fontWeight:700, display:'flex', alignItems:'center', gap:6 }}>
                  <Activity size={12} color={C.gold} /> Activity Feed
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                  <div style={{ width:5, height:5, borderRadius:3, background:C.green, animation:'dashPulse 1.5s ease-in-out infinite' }} />
                  <span style={{ fontSize:8, color:C.green, fontWeight:600 }}>Live</span>
                </div>
              </div>
              <div style={{ padding:'6px 10px', flex:1, overflow:'auto' }}>
                {FEED.slice(0, visFeed).map((item, i) => (
                  <div key={i} style={{
                    display:'flex', gap:7, padding:'6px 0',
                    borderBottom: i < visFeed-1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                    animation:'dashSlideIn 0.4s ease both',
                  }}>
                    <div style={{ width:5, height:5, borderRadius:3, background:item.color, marginTop:4, flexShrink:0, boxShadow:`0 0 4px ${item.color}40` }} />
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:9, lineHeight:1.5 }}>
                        <span style={{ color:item.color, fontWeight:700 }}>{item.agent}</span>{' '}
                        <span style={{ color:C.textSec }}>{item.text}</span>
                      </div>
                      <div style={{ fontSize:8, color:C.textMut, marginTop:2 }}>{item.time}</div>
                    </div>
                  </div>
                ))}
                {visFeed < FEED.length && (
                  <div style={{ display:'flex', alignItems:'center', gap:5, padding:'7px 0', color:C.textMut, fontSize:9 }}>
                    <div style={{ display:'flex', gap:2 }}>
                      {[0,1,2].map(j => (
                        <div key={j} style={{ width:3, height:3, borderRadius:2, background:C.purple, animation:`dashTyping 1.4s ease infinite ${j*0.2}s` }} />
                      ))}
                    </div>
                    <span>Listening for events...</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* PERFORMANCE CHART */}
          <div style={{ borderRadius:10, background:C.bgCard, border:`1px solid ${C.border}`, padding:'10px 14px', animation:'dashFadeIn 0.6s ease 0.5s both' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
              <div style={{ fontSize:11, fontWeight:700, display:'flex', alignItems:'center', gap:6 }}>
                <TrendingUp size={12} color={C.green} /> Weekly Performance
              </div>
              <div style={{ display:'flex', gap:12, fontSize:8, color:C.textMut }}>
                <span style={{ display:'flex', alignItems:'center', gap:4 }}>
                  <div style={{ width:8, height:2, borderRadius:1, background:C.purple }} /> Tasks
                </span>
                <span style={{ display:'flex', alignItems:'center', gap:4 }}>
                  <div style={{ width:8, height:2, borderRadius:1, background:C.gold }} /> Efficiency
                </span>
              </div>
            </div>
            <div style={{ height:90 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={CHART}>
                  <defs>
                    <linearGradient id="gPurple" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={C.purple} stopOpacity={0.25} />
                      <stop offset="100%" stopColor={C.purple} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gGold" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={C.gold} stopOpacity={0.15} />
                      <stop offset="100%" stopColor={C.gold} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="d" tick={{ fill: C.textMut, fontSize:8 }} axisLine={false} tickLine={false} dy={4} />
                  <Area type="monotone" dataKey="tasks" stroke={C.purple} strokeWidth={1.5} fill="url(#gPurple)" dot={false} />
                  <Area type="monotone" dataKey="eff" stroke={C.gold} strokeWidth={1.5} fill="url(#gGold)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
