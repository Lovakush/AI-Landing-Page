'use client';

import { useState, useEffect, useRef } from 'react';


function AgenticBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    let raf: number;
    let t = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const NODE_COUNT = 55;
    const nodes = Array.from({ length: NODE_COUNT }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.28,
      vy: (Math.random() - 0.5) * 0.28,
      r: Math.random() * 1.5 + 0.5,
      pulse: Math.random() * Math.PI * 2,
    }));

    const hexLabels = Array.from({ length: 18 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vy: -(Math.random() * 0.18 + 0.06),
      opacity: Math.random() * 0.3 + 0.06,
      label: `0x${Math.floor(Math.random() * 0xFFFFFF).toString(16).padStart(6,'0').toUpperCase()}`,
    }));

    const scanLines = Array.from({ length: 4 }, (_, i) => ({
      y: (window.innerHeight / 4) * i,
      speed: Math.random() * 0.35 + 0.12,
      opacity: Math.random() * 0.035 + 0.015,
    }));

    const radar = { x: window.innerWidth * 0.15, y: window.innerHeight * 0.22, radius: 110, angle: 0 };
    const radar2 = { x: window.innerWidth * 0.88, y: window.innerHeight * 0.78, radius: 65 };

    const draw = () => {
      t += 0.012;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const bg = ctx.createRadialGradient(canvas.width*.5, canvas.height*.4, 0, canvas.width*.5, canvas.height*.4, canvas.width*.75);
      bg.addColorStop(0, 'rgba(14,12,32,1)');
      bg.addColorStop(0.5, 'rgba(8,7,20,1)');
      bg.addColorStop(1, 'rgba(4,3,12,1)');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = 'rgba(240,184,73,0.055)';
      for (let gx = 0; gx < canvas.width; gx += 48)
        for (let gy = 0; gy < canvas.height; gy += 48) {
          ctx.beginPath(); ctx.arc(gx, gy, 0.6, 0, Math.PI*2); ctx.fill();
        }

      scanLines.forEach(sl => {
        sl.y += sl.speed;
        if (sl.y > canvas.height) sl.y = 0;
        const g = ctx.createLinearGradient(0, sl.y-1, 0, sl.y+1);
        g.addColorStop(0, 'transparent');
        g.addColorStop(0.5, `rgba(240,184,73,${sl.opacity})`);
        g.addColorStop(1, 'transparent');
        ctx.fillStyle = g;
        ctx.fillRect(0, sl.y-1, canvas.width, 2);
      });

      radar.angle += 0.008;
      for (let i = 0; i < 30; i++) {
        const ta = radar.angle - i*0.07;
        ctx.beginPath(); ctx.moveTo(radar.x, radar.y);
        ctx.arc(radar.x, radar.y, radar.radius, ta-0.07, ta); ctx.closePath();
        ctx.fillStyle = `rgba(240,184,73,${(1-i/30)*0.09})`; ctx.fill();
      }
      ctx.beginPath(); ctx.arc(radar.x, radar.y, radar.radius, 0, Math.PI*2);
      ctx.strokeStyle='rgba(240,184,73,0.13)'; ctx.lineWidth=1; ctx.stroke();
      [0.33, 0.66].forEach(f => {
        ctx.beginPath(); ctx.arc(radar.x, radar.y, radar.radius*f, 0, Math.PI*2);
        ctx.strokeStyle='rgba(240,184,73,0.07)'; ctx.lineWidth=0.5; ctx.stroke();
      });
      ctx.strokeStyle='rgba(240,184,73,0.1)'; ctx.lineWidth=0.5;
      ctx.beginPath(); ctx.moveTo(radar.x-radar.radius,radar.y); ctx.lineTo(radar.x+radar.radius,radar.y); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(radar.x,radar.y-radar.radius); ctx.lineTo(radar.x,radar.y+radar.radius); ctx.stroke();
      const blipX = radar.x + Math.cos(radar.angle)*radar.radius*0.68;
      const blipY = radar.y + Math.sin(radar.angle)*radar.radius*0.68;
      ctx.beginPath(); ctx.arc(blipX, blipY, 2.5, 0, Math.PI*2);
      ctx.fillStyle = `rgba(240,184,73,${Math.abs(Math.sin(t*3))*0.6+0.2})`; ctx.fill();

      ctx.beginPath(); ctx.arc(radar2.x, radar2.y, radar2.radius, 0, Math.PI*2);
      ctx.strokeStyle='rgba(240,184,73,0.08)'; ctx.lineWidth=0.8; ctx.stroke();
      const r2a = -radar.angle*0.6;
      for (let i=0; i<20; i++) {
        const ta = r2a - i*0.08;
        ctx.beginPath(); ctx.moveTo(radar2.x, radar2.y);
        ctx.arc(radar2.x, radar2.y, radar2.radius, ta-0.08, ta); ctx.closePath();
        ctx.fillStyle = `rgba(240,184,73,${(1-i/20)*0.06})`; ctx.fill();
      }

      nodes.forEach(n => {
        n.x+=n.vx; n.y+=n.vy; n.pulse+=0.025;
        if(n.x<0) n.x=canvas.width; if(n.x>canvas.width) n.x=0;
        if(n.y<0) n.y=canvas.height; if(n.y>canvas.height) n.y=0;
      });
      for (let i=0; i<nodes.length; i++) for (let j=i+1; j<nodes.length; j++) {
        const dx=nodes[i].x-nodes[j].x, dy=nodes[i].y-nodes[j].y;
        const dist=Math.sqrt(dx*dx+dy*dy);
        if(dist<130) {
          ctx.beginPath(); ctx.moveTo(nodes[i].x,nodes[i].y); ctx.lineTo(nodes[j].x,nodes[j].y);
          ctx.strokeStyle=`rgba(240,184,73,${(1-dist/130)*0.13})`; ctx.lineWidth=0.6; ctx.stroke();
        }
      }
      nodes.forEach(n => {
        ctx.beginPath(); ctx.arc(n.x,n.y,n.r,0,Math.PI*2);
        ctx.fillStyle=`rgba(240,184,73,${Math.abs(Math.sin(n.pulse))*0.5+0.12})`; ctx.fill();
      });

      ctx.font = "9px 'DM Mono', monospace";
      hexLabels.forEach(h => {
        h.y+=h.vy;
        if(h.y<-20) { h.y=canvas.height+20; h.x=Math.random()*canvas.width; }
        ctx.fillStyle=`rgba(240,184,73,${h.opacity})`;
        ctx.fillText(h.label, h.x, h.y);
      });

      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);

  return <canvas ref={canvasRef} style={{ position:'absolute', inset:0, width:'100%', height:'100%', pointerEvents:'none' }} />;
}

function validateEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

// ── Added 'register-success' to the View type ──
type View = 'login' | 'forgot' | 'register' | 'forgot-sent' | 'register-success';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess?: (name: string, email: string) => void;
}

export default function LoginModal({ isOpen, onClose, onLoginSuccess }: LoginModalProps) {
  const [view, setView] = useState<View>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const [phase, setPhase] = useState<'hidden' | 'entering' | 'visible' | 'leaving'>('hidden');

  useEffect(() => {
    if (isOpen) {
      setPhase('entering');
      setTimeout(() => setPhase('visible'), 50);
      document.body.style.overflow = 'hidden';
    } else {
      setPhase('leaving');
      setTimeout(() => {
        setPhase('hidden');
        document.body.style.overflow = '';
        setView('login'); setErrors({});
        setPassword(''); setConfirmPassword(''); setEmail(''); setFirstName(''); setLastName('');
      }, 380);
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  const triggerShake = () => { setShake(true); setTimeout(() => setShake(false), 450); };
  const switchView = (v: View) => { setErrors({}); setPassword(''); setConfirmPassword(''); setView(v); };

  const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();

  const errs: Record<string, string> = {};
  if (!email) errs.email = 'Email required';
  else if (!validateEmail(email)) errs.email = 'Invalid email address';
  if (!password) errs.password = 'Password required';

  if (Object.keys(errs).length) {
    setErrors(errs);
    triggerShake();
    return;
  }

  setLoading(true);

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login/`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      setErrors({ password: data?.error || 'Invalid credentials' });
      triggerShake();
      return;
    }

    // ✅ SAVE TOKENS CORRECTLY FROM data.data
localStorage.setItem('access_token', data.data.access_token);
localStorage.setItem('refresh_token', data.data.refresh_token);

// Optional: save user
localStorage.setItem('user', JSON.stringify(data.data.user));

const displayName =
  `${data.data.user?.first_name || ''} ${data.data.user?.last_name || ''}`.trim() || email;


    onLoginSuccess?.(displayName, email);
    onClose();

  } catch {
    setErrors({ email: 'Network error — please try again.' });
    triggerShake();
  } finally {
    setLoading(false);
  }
};


  const handleForgot = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!email) errs.email = 'Email required';
    else if (!validateEmail(email)) errs.email = 'Invalid email address';
    if (Object.keys(errs).length) { setErrors(errs); triggerShake(); return; }
    setLoading(true);
    setTimeout(() => { setLoading(false); setView('forgot-sent'); }, 1200);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!firstName) errs.firstName = 'First name required';
    if (!lastName)  errs.lastName  = 'Last name required';
    if (!email) errs.email = 'Email required';
    else if (!validateEmail(email)) errs.email = 'Invalid email address';
    if (!password) errs.password = 'Password required';
    else if (password.length < 8) errs.password = 'Min. 8 characters';
    if (confirmPassword !== password) errs.confirm = 'Passwords do not match';
    if (Object.keys(errs).length) { setErrors(errs); triggerShake(); return; }

    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          first_name: firstName,
          last_name: lastName,
          tenant_id: '',
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        const msg = data?.message || 'Registration failed. Please try again.';
        setErrors({ email: msg });
        triggerShake();
        return;
      }

      // ── Changed from 'forgot-sent' to 'register-success' ──
      switchView('register-success');

    } catch {
      setErrors({ email: 'Network error — please try again.' });
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  if (phase === 'hidden') return null;

  const isEntering = phase === 'entering';
  const isLeaving = phase === 'leaving';

  const ErrMsg = ({ msg }: { msg: string }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4, fontSize: 11, color: '#ff6b6b', fontFamily: 'monospace', letterSpacing: '0.02em' }}>
      <span>✕</span> {msg}
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&display=swap');

        @keyframes iris-in {
          0%   { clip-path: circle(0% at var(--ox) var(--oy)); }
          100% { clip-path: circle(150% at var(--ox) var(--oy)); }
        }
        @keyframes iris-out {
          0%   { clip-path: circle(150% at var(--ox) var(--oy)); opacity:1; }
          100% { clip-path: circle(0% at var(--ox) var(--oy)); opacity:0; }
        }

        @keyframes card-materialize {
          0%   { opacity:0; transform: scale(0.72) translateY(20px); filter: blur(12px) brightness(3); }
          35%  { filter: blur(2px) brightness(1.4); }
          65%  { opacity:1; transform: scale(1.02) translateY(-2px); filter: blur(0) brightness(1); }
          100% { opacity:1; transform: scale(1) translateY(0); filter: blur(0) brightness(1); }
        }
        @keyframes card-dissolve {
          0%   { opacity:1; transform: scale(1); filter: blur(0); }
          100% { opacity:0; transform: scale(0.88) translateY(12px); filter: blur(8px); }
        }

        @keyframes scan-sweep {
          0%   { top: -2px; opacity: 0.6; }
          100% { top: 100%; opacity: 0; }
        }

        @keyframes content-rise {
          from { opacity:0; transform: translateY(10px); }
          to   { opacity:1; transform: translateY(0); }
        }

        @keyframes shake {
          0%,100%{transform:translateX(0) scale(1)}
          20%{transform:translateX(-7px) scale(1.01)}
          40%{transform:translateX(7px) scale(1.01)}
          60%{transform:translateX(-4px)}
          80%{transform:translateX(4px)}
        }
        @keyframes spin  { to { transform: rotate(360deg) } }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes orbitA { to { transform: translate(-50%,-50%) rotate(360deg) } }
        @keyframes orbitB { to { transform: translate(-50%,-50%) rotate(-360deg) } }
        @keyframes viewIn {
          from { opacity:0; transform:translateX(10px); }
          to   { opacity:1; transform:translateX(0); }
        }
        @keyframes gold-line {
          from { width: 0; }
          to   { width: 100%; }
        }
        @keyframes pulse-ring {
          0%,100% { transform: scale(1); opacity: 0.5; }
          50%      { transform: scale(1.06); opacity: 1; }
        }
        @keyframes icon-pop {
          from { transform: scale(0.5); opacity: 0; }
          to   { transform: scale(1); opacity: 1; }
        }

        .lm-overlay-iris {
          --ox: 50%; --oy: 50%;
          position: fixed; inset: 0; z-index: 1001;
          background: transparent;
        }
        .lm-overlay-iris.entering { animation: iris-in 0.55s cubic-bezier(0.4,0,0.2,1) forwards; }
        .lm-overlay-iris.visible  { clip-path: circle(150% at 50% 50%); }
        .lm-overlay-iris.leaving  { animation: iris-out 0.35s cubic-bezier(0.4,0,1,1) forwards; }

        .lm-card {
          position: relative; width:100%; max-width:320px;
          background: linear-gradient(155deg, rgba(13,12,30,0.98) 0%, rgba(7,6,18,1) 100%);
          border-radius: 14px; overflow: hidden;
          border: 1px solid rgba(240,184,73,0.22);
          box-shadow: 0 0 0 1px rgba(240,184,73,0.04),
                      0 24px 80px rgba(0,0,0,0.8),
                      0 0 60px rgba(240,184,73,0.06),
                      inset 0 1px 0 rgba(240,184,73,0.1);
          padding: 28px 24px 24px;
        }
        .lm-card.entering { animation: card-materialize 0.65s cubic-bezier(0.16,1,0.3,1) 0.08s both; }
        .lm-card.visible  { opacity:1; }
        .lm-card.leaving  { animation: card-dissolve 0.32s ease forwards; }
        .lm-card.shaking  { animation: shake 0.4s cubic-bezier(0.36,0.07,0.19,0.97) !important; }

        .lm-scan {
          position: absolute; left:0; right:0; height: 2px;
          background: linear-gradient(90deg, transparent, rgba(240,184,73,0.6), transparent);
          animation: scan-sweep 0.7s ease 0.3s forwards;
          pointer-events: none; z-index: 10;
        }

        .lm-content-item {
          animation: content-rise 0.4s ease both;
        }

        .lm-input {
          width: 100%; background: rgba(255,255,255,0.025);
          border: 1px solid rgba(240,184,73,0.18); border-radius: 8px;
          padding: 9px 12px; color: #f0ead8;
          font-family: 'DM Mono', monospace; font-size: 13px;
          outline: none; box-sizing: border-box;
          transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;
        }
        .lm-input::placeholder { color: rgba(200,185,150,0.22); font-size: 12px; }
        .lm-input:focus {
          border-color: rgba(240,184,73,0.55);
          background: rgba(240,184,73,0.04);
          box-shadow: 0 0 0 2px rgba(240,184,73,0.1);
        }
        .lm-input-err { border-color: rgba(255,107,107,0.5) !important; background: rgba(255,60,60,0.03) !important; }

        .lm-btn {
          width:100%; padding:10px; border-radius:8px; border:none; cursor:pointer;
          font-family:'DM Mono',monospace; font-size:12px; font-weight:500;
          letter-spacing:0.08em; text-transform:uppercase;
          background: linear-gradient(135deg, #e8a835, #f5d070, #e8a835);
          background-size: 200% auto; color:#0a0a1a;
          transition: background-position 0.4s, transform 0.1s, box-shadow 0.2s;
          position: relative; overflow: hidden;
        }
        .lm-btn::after {
          content:''; position:absolute; inset:0;
          background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.25) 50%, transparent 100%);
          transform: translateX(-100%); transition: transform 0.4s ease;
        }
        .lm-btn:hover:not(:disabled)::after { transform: translateX(100%); }
        .lm-btn:hover:not(:disabled) { background-position: right center; box-shadow: 0 4px 22px rgba(240,184,73,0.3); transform: translateY(-1px); }
        .lm-btn:active:not(:disabled) { transform: translateY(0); }
        .lm-btn:disabled { opacity:0.55; cursor:not-allowed; }

        .lm-btn-ghost {
          width:100%; padding:9px; border-radius:8px; cursor:pointer;
          background:transparent; border:1px solid rgba(240,184,73,0.22);
          color:rgba(240,184,73,0.7); font-family:'DM Mono',monospace;
          font-size:12px; letter-spacing:0.08em; text-transform:uppercase;
          transition: background 0.15s, border-color 0.15s, color 0.15s;
        }
        .lm-btn-ghost:hover { background:rgba(240,184,73,0.06); border-color:rgba(240,184,73,0.4); color:#f0b849; }

        .lm-label {
          font-family:'DM Mono',monospace; font-size:9.5px; font-weight:500;
          color:rgba(240,184,73,0.5); letter-spacing:0.14em; text-transform:uppercase;
          display:block; margin-bottom:5px;
        }
        .lm-link {
          background:none; border:none; cursor:pointer; padding:0;
          font-family:'DM Mono',monospace; font-size:11px;
          color:rgba(240,184,73,0.55); letter-spacing:0.04em;
          transition: color 0.15s;
        }
        .lm-link:hover { color:#f0b849; }
        .lm-back {
          background:none; border:none; cursor:pointer; padding:0;
          display:flex; align-items:center; gap:5px; margin-bottom:16px;
          font-family:'DM Mono',monospace; font-size:10px;
          color:rgba(240,184,73,0.38); letter-spacing:0.08em; text-transform:uppercase;
          transition: color 0.15s;
        }
        .lm-back:hover { color:rgba(240,184,73,0.7); }
        .lm-spinner {
          display:inline-block; width:12px; height:12px;
          border:1.5px solid rgba(10,10,26,0.2); border-top-color:#0a0a1a;
          border-radius:50%; animation:spin 0.6s linear infinite;
          vertical-align:middle; margin-right:6px;
        }
        .lm-divider { display:flex; align-items:center; gap:8px; margin:14px 0; }
        .lm-divider-line { flex:1; height:1px; background:rgba(240,184,73,0.1); }
        .lm-divider-text { font-family:'DM Mono',monospace; font-size:9px; color:rgba(240,184,73,0.28); letter-spacing:0.12em; text-transform:uppercase; }
        .lm-cursor { display:inline-block; width:6px; height:12px; background:#f0b849; margin-left:2px; vertical-align:middle; animation:blink 1s step-end infinite; border-radius:1px; }
        .lm-view { animation: viewIn 0.22s ease forwards; }

        .lm-gold-underline {
          display:block; height:1px; background:#f0b849; margin-top:16px; margin-bottom:20px;
          animation: gold-line 0.5s cubic-bezier(0.4,0,0.2,1) 0.45s both;
        }
      `}</style>

      {/* Background */}
      <div style={{ position:'fixed', inset:0, zIndex:999, pointerEvents:'none' }}>
        <AgenticBackground />
      </div>

      {/* Overlay */}
      <div
        className={`lm-overlay-iris ${phase}`}
        onClick={phase === 'visible' ? onClose : undefined}
        style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}
      >
        {/* Card */}
        <div
          className={`lm-card ${phase}${shake ? ' shaking' : ''}`}
          onClick={e => e.stopPropagation()}
        >
          {/* Scan sweep */}
          {(phase === 'entering' || phase === 'visible') && <div className="lm-scan" />}

          {/* Grid overlay */}
          <div style={{ position:'absolute', inset:0, pointerEvents:'none', opacity:0.022,
            backgroundImage:'linear-gradient(rgba(240,184,73,1) 1px,transparent 1px),linear-gradient(90deg,rgba(240,184,73,1) 1px,transparent 1px)',
            backgroundSize:'24px 24px' }} />

          {/* Orbit rings */}
          <div style={{ position:'absolute', width:260, height:260, border:'1px solid rgba(240,184,73,0.07)', borderRadius:'50%', top:'50%', left:'50%', animation:'orbitA 30s linear infinite', pointerEvents:'none' }} />
          <div style={{ position:'absolute', width:180, height:180, border:'1px solid rgba(240,184,73,0.05)', borderRadius:'50%', top:'50%', left:'50%', animation:'orbitB 22s linear infinite', pointerEvents:'none' }} />

          {/* Corner brackets */}
          {[{t:0,l:0,bt:true,bl:true},{t:0,r:0,bt:true,br:true},{b:0,l:0,bb:true,bl:true},{b:0,r:0,bb:true,br:true}].map((c,i)=>(
            <div key={i} style={{
              position:'absolute', width:10, height:10,
              top:(c as any).t!==undefined?(c as any).t:undefined,
              bottom:(c as any).b!==undefined?(c as any).b:undefined,
              left:(c as any).l!==undefined?(c as any).l:undefined,
              right:(c as any).r!==undefined?(c as any).r:undefined,
              borderTop:(c as any).bt?'1.5px solid #f0b849':'none',
              borderBottom:(c as any).bb?'1.5px solid #f0b849':'none',
              borderLeft:(c as any).bl?'1.5px solid #f0b849':'none',
              borderRight:(c as any).br?'1.5px solid #f0b849':'none',
              borderTopLeftRadius:i===0?14:0, borderTopRightRadius:i===1?14:0,
              borderBottomLeftRadius:i===2?14:0, borderBottomRightRadius:i===3?14:0,
            }} />
          ))}

          {/* Close button */}
          <button onClick={onClose} style={{
            position:'absolute', top:10, right:10, width:24, height:24,
            borderRadius:6, background:'rgba(240,184,73,0.06)', border:'1px solid rgba(240,184,73,0.15)',
            cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
            color:'rgba(240,184,73,0.4)', fontSize:11, fontFamily:'monospace',
            transition:'all 0.15s', zIndex:2,
          }}
            onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background='rgba(240,184,73,0.13)';(e.currentTarget as HTMLElement).style.color='rgba(240,184,73,0.85)';}}
            onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background='rgba(240,184,73,0.06)';(e.currentTarget as HTMLElement).style.color='rgba(240,184,73,0.4)';}}
          >✕</button>

          {/* Content */}
          <div style={{ position:'relative', zIndex:1 }}>

            {/* Header */}
            <div className="lm-content-item" style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4, animationDelay:'0.18s' }}>
              <img src="/sia-globe-v2.png" alt="SIA" style={{ height:26, width:'auto', mixBlendMode:'lighten' }} />
              <div style={{ width:1, height:14, background:'rgba(240,184,73,0.2)' }} />
              <span style={{ fontFamily:"'DM Mono',monospace", fontSize:9, color:'rgba(240,184,73,0.4)', letterSpacing:'0.18em', textTransform:'uppercase' }}>
                {view === 'login'
                  ? 'auth/sign-in'
                  : view === 'forgot' || view === 'forgot-sent'
                  ? 'auth/reset'
                  : view === 'register-success'
                  ? 'auth/registered'
                  : 'auth/register'}
              </span>
              <span className="lm-cursor" />
            </div>

            <span className="lm-gold-underline" />

            {/* ── LOGIN VIEW ── */}
            {view === 'login' && (
              <div className="lm-view">
                <h2 className="lm-content-item" style={{ fontFamily:"'DM Mono',monospace", fontSize:20, fontWeight:700, color:'#f0ead8', margin:'0 0 2px', letterSpacing:'-0.01em', animationDelay:'0.22s' }}>
                  Welcome back.
                </h2>
                <p className="lm-content-item" style={{ fontFamily:"'DM Mono',monospace", fontSize:11.5, color:'rgba(200,185,150,0.38)', margin:'0 0 18px', animationDelay:'0.26s', letterSpacing:'0.02em' }}>
                  Sign in to continue.
                </p>

                <form onSubmit={handleLogin} noValidate>
                  <div className="lm-content-item" style={{ marginBottom:12, animationDelay:'0.3s' }}>
                    <label className="lm-label">Email</label>
                    <input type="email" className={`lm-input${errors.email?' lm-input-err':''}`} placeholder="you@example.com" value={email} onChange={e=>{setEmail(e.target.value);setErrors(p=>({...p,email:''}));}} />
                    {errors.email && <ErrMsg msg={errors.email} />}
                  </div>

                  <div className="lm-content-item" style={{ marginBottom:6, animationDelay:'0.34s' }}>
                    <label className="lm-label">Password</label>
                    <div style={{ position:'relative' }}>
                      <input type={showPass?'text':'password'} className={`lm-input${errors.password?' lm-input-err':''}`} placeholder="••••••••" value={password} onChange={e=>{setPassword(e.target.value);setErrors(p=>({...p,password:''}));}} style={{paddingRight:36}} />
                      <button type="button" onClick={()=>setShowPass(!showPass)} style={{ position:'absolute',right:10,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',color:'rgba(240,184,73,0.35)',padding:0,lineHeight:1,transition:'color 0.15s' }} onMouseEnter={e=>(e.currentTarget.style.color='rgba(240,184,73,0.75)')} onMouseLeave={e=>(e.currentTarget.style.color='rgba(240,184,73,0.35)')}>
                        {showPass
                          ? <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                          : <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>}
                      </button>
                    </div>
                    {errors.password && <ErrMsg msg={errors.password} />}
                  </div>

                  <div className="lm-content-item" style={{ textAlign:'right', marginBottom:16, animationDelay:'0.36s' }}>
                    <button type="button" className="lm-link" onClick={()=>switchView('forgot')}>forgot password?</button>
                  </div>

                  <div className="lm-content-item" style={{ animationDelay:'0.4s' }}>
                    <button type="submit" className="lm-btn" disabled={loading}>
                      {loading ? <><span className="lm-spinner"/>authenticating…</> : '→ sign_in()'}
                    </button>
                  </div>
                </form>

                <div className="lm-divider lm-content-item" style={{ animationDelay:'0.44s' }}>
                  <div className="lm-divider-line"/><span className="lm-divider-text">no account?</span><div className="lm-divider-line"/>
                </div>

                <div className="lm-content-item" style={{ animationDelay:'0.47s' }}>
                  <button type="button" className="lm-btn-ghost" onClick={()=>switchView('register')}>→ register()</button>
                </div>
              </div>
            )}

            {/* ── FORGOT PASSWORD VIEW ── */}
            {view === 'forgot' && (
              <div className="lm-view">
                <button className="lm-back" onClick={()=>switchView('login')}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>back
                </button>
                <h2 style={{ fontFamily:"'DM Mono',monospace", fontSize:19, fontWeight:700, color:'#f0ead8', margin:'0 0 2px', letterSpacing:'-0.01em' }}>Reset password.</h2>
                <p style={{ fontFamily:"'DM Mono',monospace", fontSize:11.5, color:'rgba(200,185,150,0.38)', margin:'0 0 18px', letterSpacing:'0.02em' }}>We'll send a link to your inbox.</p>
                <form onSubmit={handleForgot} noValidate>
                  <div style={{ marginBottom:16 }}>
                    <label className="lm-label">Email</label>
                    <input type="email" className={`lm-input${errors.email?' lm-input-err':''}`} placeholder="you@example.com" value={email} onChange={e=>{setEmail(e.target.value);setErrors(p=>({...p,email:''}));}} />
                    {errors.email && <ErrMsg msg={errors.email} />}
                  </div>
                  <button type="submit" className="lm-btn" disabled={loading}>
                    {loading ? <><span className="lm-spinner"/>sending…</> : '→ send_reset()'}
                  </button>
                </form>
              </div>
            )}

            {/* ── FORGOT SENT VIEW ── */}
            {view === 'forgot-sent' && (
              <div className="lm-view" style={{ textAlign:'center', padding:'8px 0' }}>
                <div style={{ width:44,height:44,borderRadius:10,background:'rgba(240,184,73,0.08)',border:'1px solid rgba(240,184,73,0.25)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 14px' }}>
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#f0b849" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                </div>
                <h2 style={{ fontFamily:"'DM Mono',monospace", fontSize:17, fontWeight:700, color:'#f0ead8', margin:'0 0 6px', letterSpacing:'-0.01em' }}>Check your inbox.</h2>
                <p style={{ fontFamily:"'DM Mono',monospace", fontSize:11.5, color:'rgba(200,185,150,0.38)', margin:'0 0 18px', lineHeight:1.6, letterSpacing:'0.02em' }}>
                  Reset link sent to<br/><span style={{ color:'rgba(240,184,73,0.7)', fontFamily:"'DM Mono',monospace", fontSize:11 }}>{email}</span>
                </p>
                <button type="button" className="lm-btn" onClick={()=>switchView('login')}>→ back_to_login()</button>
              </div>
            )}

            {/* ── REGISTER SUCCESS VIEW ── */}
            {view === 'register-success' && (
              <div className="lm-view" style={{ textAlign: 'center', padding: '8px 0' }}>

                {/* Shield icon with pulse ring */}
                <div style={{
                  width: 52, height: 52, borderRadius: 12,
                  background: 'rgba(240,184,73,0.1)',
                  border: '1px solid rgba(240,184,73,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 16px', position: 'relative',
                  boxShadow: '0 0 24px rgba(240,184,73,0.12)',
                  animation: 'icon-pop 0.55s cubic-bezier(0.34,1.56,0.64,1) both',
                }}>
                  {/* Pulse ring */}
                  <div style={{
                    position: 'absolute', inset: -8, borderRadius: 18,
                    border: '1px solid rgba(240,184,73,0.2)',
                    animation: 'pulse-ring 2s ease-in-out infinite',
                    pointerEvents: 'none',
                  }} />
                  <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#f0b849" strokeWidth="1.8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.5C16.5 22.15 20 17.25 20 12V6l-8-4z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
                  </svg>
                </div>

                <h2 style={{ fontFamily:"'DM Mono',monospace", fontSize:18, fontWeight:700, color:'#f0ead8', margin:'0 0 6px', letterSpacing:'-0.01em' }}>
                  Account generated.
                </h2>
                <p style={{ fontFamily:"'DM Mono',monospace", fontSize:11.5, color:'rgba(200,185,150,0.38)', margin:'0 0 4px', lineHeight:1.6, letterSpacing:'0.02em' }}>
                  Identity registered in the system.
                </p>
                <p style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color:'rgba(240,184,73,0.65)', margin:'0 0 20px' }}>
                  {email}
                </p>

                {/* Status checklist */}
                <div style={{ marginBottom: 20, textAlign: 'left' }}>
                  {[
                    { done: true,  label: 'Identity verified',              active: false },
                    { done: true,  label: 'Credentials encrypted & stored', active: false },
                    { done: false, label: 'Awaiting email confirmation',    active: true  },
                  ].map((step, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '6px 0',
                      borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                      fontFamily: "'DM Mono',monospace", fontSize: 10.5,
                      letterSpacing: '0.05em',
                      color: step.active ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.38)',
                    }}>
                      <div style={{
                        width: 16, height: 16, borderRadius: 3, flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: step.done ? 'rgba(240,184,73,0.15)' : 'transparent',
                        border: step.done ? 'none' : `1px solid ${step.active ? 'rgba(240,184,73,0.5)' : 'rgba(255,255,255,0.15)'}`,
                      }}>
                        {step.done
                          ? (
                            <svg width="10" height="10" fill="none" stroke="#f0b849" strokeWidth="2.2">
                              <path d="M2 5l2.5 2.5L8 3"/>
                            </svg>
                          ) : (
                            <div style={{
                              width: 5, height: 5, borderRadius: '50%',
                              background: 'rgba(240,184,73,0.5)',
                              animation: 'blink 1s step-end infinite',
                            }} />
                          )
                        }
                      </div>
                      {step.label}
                    </div>
                  ))}
                </div>

                <button type="button" className="lm-btn" onClick={() => switchView('login')}>
                  → proceed_to_login()
                </button>
              </div>
            )}

            {/* ── REGISTER VIEW ── */}
            {view === 'register' && (
              <div className="lm-view">
                <button className="lm-back" onClick={()=>switchView('login')}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>back
                </button>
                <h2 style={{ fontFamily:"'DM Mono',monospace", fontSize:19, fontWeight:700, color:'#f0ead8', margin:'0 0 2px', letterSpacing:'-0.01em' }}>Create account.</h2>
                <p style={{ fontFamily:"'DM Mono',monospace", fontSize:11.5, color:'rgba(200,185,150,0.38)', margin:'0 0 16px', letterSpacing:'0.02em' }}>Takes less than a minute.</p>
                <form onSubmit={handleRegister} noValidate>
                  {/* Name row */}
                  <div style={{ display:'flex', gap:8, marginBottom:10 }}>
                    <div style={{ flex:1 }}>
                      <label className="lm-label">First Name</label>
                      <input type="text" className={`lm-input${errors.firstName?' lm-input-err':''}`} placeholder="Jane" value={firstName} onChange={e=>{setFirstName(e.target.value);setErrors(p=>({...p,firstName:''}));}} />
                      {errors.firstName && <ErrMsg msg={errors.firstName} />}
                    </div>
                    <div style={{ flex:1 }}>
                      <label className="lm-label">Last Name</label>
                      <input type="text" className={`lm-input${errors.lastName?' lm-input-err':''}`} placeholder="Smith" value={lastName} onChange={e=>{setLastName(e.target.value);setErrors(p=>({...p,lastName:''}));}} />
                      {errors.lastName && <ErrMsg msg={errors.lastName} />}
                    </div>
                  </div>
                  {/* Email */}
                  <div style={{ marginBottom:10 }}>
                    <label className="lm-label">Email</label>
                    <input type="email" className={`lm-input${errors.email?' lm-input-err':''}`} placeholder="you@example.com" value={email} onChange={e=>{setEmail(e.target.value);setErrors(p=>({...p,email:''}));}} />
                    {errors.email && <ErrMsg msg={errors.email} />}
                  </div>
                  {/* Password */}
                  <div style={{ marginBottom:10 }}>
                    <label className="lm-label">Password</label>
                    <div style={{ position:'relative' }}>
                      <input type={showPass?'text':'password'} className={`lm-input${errors.password?' lm-input-err':''}`} placeholder="Min. 8 chars" value={password} onChange={e=>{setPassword(e.target.value);setErrors(p=>({...p,password:''}));}} style={{paddingRight:36}} />
                      <button type="button" onClick={()=>setShowPass(!showPass)} style={{ position:'absolute',right:10,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',color:'rgba(240,184,73,0.35)',padding:0,lineHeight:1 }}>
                        {showPass
                          ? <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                          : <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>}
                      </button>
                    </div>
                    {errors.password && <ErrMsg msg={errors.password} />}
                  </div>
                  {/* Confirm Password */}
                  <div style={{ marginBottom:18 }}>
                    <label className="lm-label">Confirm Password</label>
                    <input type={showPass?'text':'password'} className={`lm-input${errors.confirm?' lm-input-err':''}`} placeholder="••••••••" value={confirmPassword} onChange={e=>{setConfirmPassword(e.target.value);setErrors(p=>({...p,confirm:''}));}} />
                    {errors.confirm && <ErrMsg msg={errors.confirm} />}
                  </div>
                  <button type="submit" className="lm-btn" disabled={loading}>
                    {loading ? <><span className="lm-spinner"/>creating…</> : '→ create_account()'}
                  </button>
                </form>
                <p style={{ textAlign:'center', fontFamily:"'DM Mono',monospace", fontSize:9.5, color:'rgba(200,185,150,0.22)', marginTop:12, lineHeight:1.6, letterSpacing:'0.03em' }}>
                  agrees to <a href="/terms" style={{ color:'rgba(240,184,73,0.35)', textDecoration:'none' }}>terms</a> &amp; <a href="/privacy" style={{ color:'rgba(240,184,73,0.45)', textDecoration:'none' }}>privacy</a>
                </p>
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  );
}