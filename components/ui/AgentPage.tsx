'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';

/* ─── types ─────────────────────────────────────────────────────── */
type FileStatus = 'pending' | 'uploading' | 'done' | 'error';

interface UploadFile {
  id: string;
  name: string;
  size: number;
  ext: string;
  status: FileStatus;
  progress: number;
  url?: string;       // set after successful upload
  error?: string;     // set if upload fails
  raw: File;          // original File object for sending
}

/* ─── config per agent ──────────────────────────────────────────── */
export type AgentType = 'hr' | 'marketing';

const AGENT_CONFIG = {
  hr: {
    label: 'HR Agent',
    subtitle: 'Upload HR documents to analyse, summarise, and extract insights.',
    accent: '#f0b849',
    tag: 'RECRUITMENT & PEOPLE OPS',
    icon: (
      <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.6">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M17 20h5v-2a4 4 0 00-5-3.87M9 20H4v-2a4 4 0 015-3.87m6-4a4 4 0 11-8 0 4 4 0 018 0zm6 0a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    accepts: '.pdf,.doc,.docx,.txt,.xls,.xlsx',
    hint: 'CVs, job descriptions, policies, contracts…',
    maxSizeMB: 20,
  },
  marketing: {
    label: 'Marketing Agent',
    subtitle: 'Upload campaign briefs, content, and reports for AI-powered analysis.',
    accent: '#f0b849',
    tag: 'CAMPAIGNS & CONTENT',
    icon: (
      <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.6">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
      </svg>
    ),
    accepts: '.pdf,.doc,.docx,.txt,.ppt,.pptx,.png,.jpg,.jpeg',
    hint: 'Briefs, decks, reports, images, copy…',
    maxSizeMB: 20,
  },
};

const CLOUD = [
  {
    id: 'google',
    label: 'Google Drive',
    icon: (
      <svg width="16" height="16" viewBox="0 0 87.3 78" fill="none">
        <path d="M6.6 66.85l3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3L27.5 53H0c0 1.55.4 3.1 1.2 4.5z" fill="#0066DA"/>
        <path d="M43.65 25L29.9 1.2c-1.35.8-2.5 1.9-3.3 3.3L1.2 48.5C.4 49.9 0 51.45 0 53h27.5z" fill="#00AC47"/>
        <path d="M73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5H59.8l5.85 11.5z" fill="#EA4335"/>
        <path d="M43.65 25L57.4 1.2C56.05.4 54.5 0 52.9 0H34.4c-1.6 0-3.15.45-4.5 1.2z" fill="#00832D"/>
        <path d="M59.8 53H27.5L13.75 76.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.4 4.5-1.2z" fill="#2684FC"/>
        <path d="M73.4 26.5l-12.65-21.9c-.8-1.4-1.95-2.5-3.3-3.3L43.65 25 59.8 53h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#FFBA00"/>
      </svg>
    ),
  },
  {
    id: 'dropbox',
    label: 'Dropbox',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="#0061FF">
        <path d="M12 2.5L6 6.25 12 10 6 13.75 12 17.5l6-3.75L12 10l6-3.75L12 2.5zM6 17.5l6 3.75 6-3.75-6-3.75L6 17.5z"/>
      </svg>
    ),
  },
  {
    id: 'onedrive',
    label: 'OneDrive',
    icon: (
      <svg width="18" height="13" viewBox="0 0 20 14" fill="none">
        <path d="M11.5 5.5A5.5 5.5 0 000 8.5h9l2.5-3z" fill="#0364B8"/>
        <path d="M12 5a4 4 0 00-3.5 2.1L11.5 8.5H19A4 4 0 0012 5z" fill="#0078D4"/>
        <path d="M0 8.5a5.5 5.5 0 005.5 5.5h13a1.5 1.5 0 000-3H5.5A2.5 2.5 0 013 8.5H0z" fill="#28A8E8"/>
      </svg>
    ),
  },
];

/* ─── helpers ───────────────────────────────────────────────────── */
function formatBytes(b: number) {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}

function ExtBadge({ name }: { name: string }) {
  const ext = name.split('.').pop()?.toUpperCase() || 'FILE';
  const colors: Record<string, string> = {
    PDF: '#FF4444', DOC: '#2B5CE6', DOCX: '#2B5CE6',
    XLS: '#1D7044', XLSX: '#1D7044', PPT: '#C84B31', PPTX: '#C84B31',
    PNG: '#F5A623', JPG: '#F5A623', JPEG: '#F5A623', TXT: '#888',
  };
  const c = colors[ext] || '#f0b849';
  return (
    <div style={{
      width: 36, height: 40, borderRadius: 7,
      background: `${c}18`, border: `1px solid ${c}35`,
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>
      <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 8, fontWeight: 600, color: c, letterSpacing: '0.04em' }}>
        {ext}
      </span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
export default function AgentPage({ agent }: { agent: AgentType }) {
  const cfg = AGENT_CONFIG[agent];
  const router = useRouter();

  const [files, setFiles]       = useState<UploadFile[]>([]);
  const [dragging, setDragging] = useState(false);
  const [mounted, setMounted]   = useState(false);
  const [toast, setToast]       = useState<{ msg: string; type: 'ok' | 'err' } | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setTimeout(() => setMounted(true), 60); }, []);

  /* ── toast helper ── */
  const showToast = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  /* ── real upload via fetch + XHR progress simulation ── */
  const uploadFile = useCallback(async (uploadFile: UploadFile) => {
    const id = uploadFile.id;

    // Kick off visual progress animation immediately
    let prog = 0;
    const iv = setInterval(() => {
      prog += Math.random() * 12 + 5;
      if (prog < 85) {
        setFiles(f => f.map(x => x.id === id
          ? { ...x, progress: Math.round(prog), status: 'uploading' }
          : x
        ));
      } else {
        clearInterval(iv);
      }
    }, 200);

    try {
      const formData = new FormData();
      formData.append('agent', agent);
      formData.append('files', uploadFile.raw, uploadFile.name);

      const res  = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();

      clearInterval(iv);

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Upload failed');
      }

      const saved = data.files?.[0];
      setFiles(f => f.map(x => x.id === id
        ? { ...x, progress: 100, status: 'done', url: saved?.url }
        : x
      ));
    } catch (err: any) {
      clearInterval(iv);
      setFiles(f => f.map(x => x.id === id
        ? { ...x, progress: 0, status: 'error', error: err.message }
        : x
      ));
      showToast(`Failed: ${uploadFile.name}`, 'err');
    }
  }, [agent]);

  /* ── add files to queue and start uploading ── */
  const addFiles = useCallback((raw: FileList | null) => {
    if (!raw) return;

    const maxBytes = cfg.maxSizeMB * 1024 * 1024;
    const allowedExts = cfg.accepts.split(',').map(e => e.trim().replace('.', '').toLowerCase());

    Array.from(raw).forEach(file => {
      const ext = file.name.split('.').pop()?.toLowerCase() || '';

      if (!allowedExts.includes(ext)) {
        showToast(`"${file.name}" is not a supported file type`, 'err');
        return;
      }
      if (file.size > maxBytes) {
        showToast(`"${file.name}" exceeds ${cfg.maxSizeMB} MB limit`, 'err');
        return;
      }

      const newFile: UploadFile = {
        id: `${Date.now()}-${Math.random()}`,
        name: file.name,
        size: file.size,
        ext,
        status: 'pending',
        progress: 0,
        raw: file,
      };

      setFiles(f => [...f, newFile]);

      // Start uploading after a tiny delay (lets React render the pending state first)
      setTimeout(() => uploadFile(newFile), 120);
    });
  }, [cfg, uploadFile]);

  /* ── drag handlers ── */
  const onDragOver  = (e: React.DragEvent) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = () => setDragging(false);
  const onDrop      = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const removeFile = (id: string) =>
    setFiles(f => f.filter(x => x.id !== id));

  const retryFile = (file: UploadFile) => {
    setFiles(f => f.map(x => x.id === file.id
      ? { ...x, status: 'pending', progress: 0, error: undefined }
      : x
    ));
    setTimeout(() => uploadFile(file), 60);
  };

  const cloudClick = (source: string) =>
    alert(`${source} picker coming soon — connect OAuth credentials to enable.`);

  const doneCount = files.filter(f => f.status === 'done').length;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&display=swap');

        @keyframes ap-fadeUp {
          from { opacity:0; transform:translateY(20px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes ap-spin { to { transform:rotate(360deg) } }
        @keyframes ap-pulse {
          0%,100% { opacity:0.4; }
          50%      { opacity:1; }
        }
        @keyframes ap-toastIn {
          from { opacity:0; transform:translateY(12px) scale(0.97); }
          to   { opacity:1; transform:translateY(0)    scale(1); }
        }

        /* ── Agentic background effects ── */
        @keyframes ap-float {
          0%, 100% { transform: translate(0, 0); }
          33%      { transform: translate(30px, -30px); }
          66%      { transform: translate(-20px, 20px); }
        }
        @keyframes ap-gridPulse {
          0%, 100% { opacity: 0.03; }
          50%      { opacity: 0.08; }
        }
        @keyframes ap-particleGlow {
          0%, 100% { opacity: 0.2; box-shadow: 0 0 8px rgba(240,184,73,0.3); }
          50%      { opacity: 0.6; box-shadow: 0 0 20px rgba(240,184,73,0.6); }
        }

        .ap-wrap {
          min-height:100vh;
          background:radial-gradient(ellipse at 60% 20%, #0d0c28 0%, #080718 45%, #050412 100%);
          font-family:'DM Mono',monospace;
          padding-top:88px;
          position:relative;
          overflow:hidden;
        }

        /* Animated grid overlay */
        .ap-bg-grid {
          position:absolute;
          inset:0;
          background-image:
            linear-gradient(rgba(240,184,73,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(240,184,73,0.04) 1px, transparent 1px);
          background-size: 60px 60px;
          animation: ap-gridPulse 4s ease-in-out infinite;
          pointer-events:none;
          z-index:1;
        }

        /* Floating particles container */
        .ap-particles {
          position:absolute;
          inset:0;
          pointer-events:none;
          z-index:1;
        }
        .ap-particle {
          position:absolute;
          width:4px;
          height:4px;
          border-radius:50%;
          background:rgba(240,184,73,0.4);
          animation: ap-particleGlow 3s ease-in-out infinite;
        }
        .ap-particle.large {
          width:6px;
          height:6px;
        }
        .ap-inner { max-width:780px; margin:0 auto; padding:48px 24px 80px; position:relative; z-index:10; }

        /* header */
        .ap-header { margin-bottom:40px; }
        .ap-tag {
          display:inline-flex; align-items:center; gap:6px;
          font-size:9.5px; color:rgba(240,184,73,0.5);
          letter-spacing:0.16em; text-transform:uppercase; margin-bottom:14px;
        }
        .ap-tag-dot { width:5px; height:5px; border-radius:50%; background:#f0b849; animation:ap-pulse 2s ease-in-out infinite; }
        .ap-title {
          font-size:28px; font-weight:700; color:#f0ead8;
          letter-spacing:-0.02em; margin:0 0 8px; display:flex; align-items:center; gap:12px;
        }
        .ap-title-icon {
          width:44px; height:44px; border-radius:11px;
          background:rgba(240,184,73,0.1); border:1px solid rgba(240,184,73,0.25);
          display:flex; align-items:center; justify-content:center; color:#f0b849; flex-shrink:0;
        }
        .ap-sub { font-size:13px; color:rgba(200,185,150,0.45); line-height:1.6; margin:0; letter-spacing:0.02em; }

        /* drop zone */
        .ap-dropzone {
          border:1.5px dashed rgba(240,184,73,0.25);
          border-radius:16px;
          background:rgba(240,184,73,0.025);
          padding:44px 24px;
          text-align:center;
          cursor:pointer;
          transition:border-color 0.2s, background 0.2s;
          position:relative; overflow:hidden;
          margin-bottom:16px;
        }
        .ap-dropzone:hover, .ap-dropzone.drag {
          border-color:rgba(240,184,73,0.55);
          background:rgba(240,184,73,0.06);
        }
        .ap-dropzone.drag { border-style:solid; }
        .ap-dz-icon {
          width:52px; height:52px; border-radius:14px; margin:0 auto 16px;
          background:rgba(240,184,73,0.08); border:1px solid rgba(240,184,73,0.2);
          display:flex; align-items:center; justify-content:center; color:rgba(240,184,73,0.6);
        }
        .ap-dz-title  { font-size:15px; color:#f0ead8; font-weight:500; margin-bottom:6px; letter-spacing:0.01em; }
        .ap-dz-sub    { font-size:11.5px; color:rgba(200,185,150,0.38); letter-spacing:0.03em; margin-bottom:20px; }
        .ap-browse-btn {
          display:inline-flex; align-items:center; gap:6px;
          padding:9px 20px; border-radius:8px;
          background:linear-gradient(135deg,#e8a835,#f5d070);
          color:#0a0a1a; font-family:'DM Mono',monospace;
          font-size:11.5px; font-weight:500; letter-spacing:0.07em; text-transform:uppercase;
          border:none; cursor:pointer;
          transition:box-shadow 0.2s, transform 0.1s;
        }
        .ap-browse-btn:hover { box-shadow:0 4px 18px rgba(240,184,73,0.3); transform:translateY(-1px); }
        .ap-hint { font-size:10px; color:rgba(200,185,150,0.28); margin-top:12px; letter-spacing:0.04em; }

        /* cloud row */
        .ap-cloud-row { display:flex; gap:10px; margin-bottom:28px; flex-wrap:wrap; }
        .ap-cloud-btn {
          flex:1; min-width:130px; display:flex; align-items:center; gap:8px;
          padding:10px 14px; border-radius:10px;
          background:rgba(255,255,255,0.03); border:1px solid rgba(240,184,73,0.15);
          cursor:pointer; color:rgba(230,218,190,0.7);
          font-family:'DM Mono',monospace; font-size:11.5px; letter-spacing:0.03em;
          transition:background 0.15s, border-color 0.15s, color 0.15s;
        }
        .ap-cloud-btn:hover { background:rgba(255,255,255,0.06); border-color:rgba(240,184,73,0.3); color:#f0ead8; }

        /* divider */
        .ap-or { display:flex; align-items:center; gap:10px; margin-bottom:16px; }
        .ap-or-line { flex:1; height:1px; background:rgba(240,184,73,0.1); }
        .ap-or-text { font-size:10px; color:rgba(240,184,73,0.3); letter-spacing:0.12em; text-transform:uppercase; }

        /* file list */
        .ap-file-list  { display:flex; flex-direction:column; gap:8px; }
        .ap-file-item  {
          display:flex; align-items:center; gap:12px;
          padding:12px 14px; border-radius:11px;
          background:rgba(255,255,255,0.03); border:1px solid rgba(240,184,73,0.12);
          animation:ap-fadeUp 0.25s ease both;
          transition:border-color 0.2s;
        }
        .ap-file-item.error { border-color:rgba(255,80,80,0.25); background:rgba(255,80,80,0.03); }
        .ap-file-name  { font-size:12.5px; color:#f0ead8; letter-spacing:0.01em; margin-bottom:3px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:320px; }
        .ap-file-meta  { font-size:10px; color:rgba(200,185,150,0.38); letter-spacing:0.03em; }
        .ap-file-error { font-size:10px; color:rgba(255,100,100,0.65); letter-spacing:0.03em; margin-top:2px; }

        /* progress */
        .ap-prog-track { height:3px; background:rgba(240,184,73,0.1); border-radius:2px; margin-top:6px; overflow:hidden; width:100%; }
        .ap-prog-fill  { height:100%; border-radius:2px; background:linear-gradient(90deg,#e8a835,#f5d070); transition:width 0.18s linear; }

        /* badges */
        .ap-badge { font-size:9px; padding:2px 7px; border-radius:4px; letter-spacing:0.08em; text-transform:uppercase; flex-shrink:0; }
        .ap-badge.uploading { background:rgba(240,184,73,0.1); color:rgba(240,184,73,0.7); }
        .ap-badge.done      { background:rgba(74,222,128,0.1); color:#4ade80; }
        .ap-badge.error     { background:rgba(255,80,80,0.1); color:#ff8080; }

        /* icon buttons */
        .ap-icon-btn {
          background:none; border:none; cursor:pointer; padding:4px;
          color:rgba(200,185,150,0.25); transition:color 0.15s; flex-shrink:0; line-height:1;
        }
        .ap-icon-btn:hover { color:rgba(240,184,73,0.7); }
        .ap-icon-btn.remove:hover { color:rgba(255,80,80,0.7); }

        /* back link */
        .ap-back {
          display:inline-flex; align-items:center; gap:6px;
          background:none; border:none; cursor:pointer; padding:0; margin-bottom:32px;
          font-family:'DM Mono',monospace; font-size:10.5px;
          color:rgba(240,184,73,0.4); letter-spacing:0.08em; text-transform:uppercase;
          transition:color 0.15s;
        }
        .ap-back:hover { color:rgba(240,184,73,0.75); }

        /* section label */
        .ap-section-label {
          font-size:9.5px; color:rgba(240,184,73,0.45); letter-spacing:0.14em; text-transform:uppercase;
          margin-bottom:10px; display:flex; align-items:center; gap:8px;
        }
        .ap-section-label::after { content:''; flex:1; height:1px; background:rgba(240,184,73,0.1); }

        /* process button */
        .ap-process-btn {
          margin-top:24px; width:100%; padding:13px;
          border-radius:10px; border:none; cursor:pointer;
          background:linear-gradient(135deg,#e8a835,#f5d070);
          color:#0a0a1a; font-family:'DM Mono',monospace;
          font-size:12px; font-weight:500; letter-spacing:0.08em; text-transform:uppercase;
          transition:box-shadow 0.2s, transform 0.1s;
          animation:ap-fadeUp 0.3s ease both;
        }
        .ap-process-btn:hover {
          box-shadow:0 6px 24px rgba(240,184,73,0.35);
          transform:translateY(-1px);
        }

        /* toast */
        .ap-toast {
          position:fixed; bottom:28px; left:50%; transform:translateX(-50%);
          padding:10px 18px; border-radius:10px; z-index:9999;
          font-family:'DM Mono',monospace; font-size:12px; letter-spacing:0.03em;
          animation:ap-toastIn 0.25s ease both;
          pointer-events:none;
        }
        .ap-toast.ok  { background:rgba(74,222,128,0.1); border:1px solid rgba(74,222,128,0.25); color:#4ade80; }
        .ap-toast.err { background:rgba(255,80,80,0.08); border:1px solid rgba(255,80,80,0.25); color:#ff8080; }

        /* spinner */
        .ap-spin { animation:ap-spin 0.9s linear infinite; }
      `}</style>

      {/* toast */}
      {toast && (
        <div className={`ap-toast ${toast.type}`}>{toast.msg}</div>
      )}

      <div className="ap-wrap">
        {/* ── Animated grid background ── */}
        <div className="ap-bg-grid" />

        {/* ── Floating particles ── */}
        <div className="ap-particles">
          {[...Array(20)].map((_, i) => {
            const size = Math.random() > 0.7 ? 'large' : '';
            const left = Math.random() * 100;
            const top  = Math.random() * 100;
            const delay = Math.random() * 8;
            const duration = 12 + Math.random() * 8;
            
            return (
              <div
                key={i}
                className={`ap-particle ${size}`}
                style={{
                  left: `${left}%`,
                  top: `${top}%`,
                  animation: `ap-float ${duration}s ease-in-out ${delay}s infinite, ap-particleGlow 3s ease-in-out ${delay}s infinite`,
                }}
              />
            );
          })}
        </div>

        <div className="ap-inner" style={{ opacity: mounted ? 1 : 0, transition: 'opacity 0.3s' }}>

          {/* back */}
          <button className="ap-back" onClick={() => router.back()}>
            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
            back
          </button>

          {/* header */}
          <div className="ap-header" style={{ animation: mounted ? 'ap-fadeUp 0.4s ease both' : 'none' }}>
            <div className="ap-tag">
              <span className="ap-tag-dot" />
              {cfg.tag}
            </div>
            <h1 className="ap-title">
              <div className="ap-title-icon">{cfg.icon}</div>
              {cfg.label}
            </h1>
            <p className="ap-sub">{cfg.subtitle}</p>
          </div>

          {/* upload section */}
          <div style={{ animation: mounted ? 'ap-fadeUp 0.4s ease 0.1s both' : 'none' }}>
            <div className="ap-section-label">upload document</div>

            {/* drop zone */}
            <div
              className={`ap-dropzone${dragging ? ' drag' : ''}`}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              onClick={() => inputRef.current?.click()}
            >
              <input
                ref={inputRef}
                type="file"
                multiple
                accept={cfg.accepts}
                style={{ display: 'none' }}
                onChange={e => { addFiles(e.target.files); e.target.value = ''; }}
              />
              <div className="ap-dz-icon">
                <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                </svg>
              </div>
              <div className="ap-dz-title">
                {dragging ? 'Drop files here' : 'Drag & drop files here'}
              </div>
              <div className="ap-dz-sub">
                or click to browse — up to {cfg.maxSizeMB} MB per file
              </div>
              <button
                className="ap-browse-btn"
                onClick={e => { e.stopPropagation(); inputRef.current?.click(); }}
              >
                <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/>
                </svg>
                Browse files
              </button>
              <div className="ap-hint">{cfg.hint}</div>
            </div>

            {/* cloud divider */}
            <div className="ap-or">
              <div className="ap-or-line"/>
              <span className="ap-or-text">or import from cloud</span>
              <div className="ap-or-line"/>
            </div>

            {/* cloud buttons */}
            <div className="ap-cloud-row">
              {CLOUD.map(c => (
                <button key={c.id} className="ap-cloud-btn" onClick={() => cloudClick(c.label)}>
                  {c.icon}
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* file list */}
          {files.length > 0 && (
            <div style={{ animation: 'ap-fadeUp 0.3s ease both' }}>
              <div className="ap-section-label" style={{ marginTop: 32 }}>
                uploaded files ({files.length})
                {doneCount > 0 && (
                  <span style={{ color: 'rgba(74,222,128,0.6)', fontSize: 9, marginLeft: 4 }}>
                    {doneCount} ready
                  </span>
                )}
              </div>

              <div className="ap-file-list">
                {files.map((f, i) => (
                  <div
                    key={f.id}
                    className={`ap-file-item${f.status === 'error' ? ' error' : ''}`}
                    style={{ animationDelay: `${i * 0.04}s` }}
                  >
                    <ExtBadge name={f.name} />

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="ap-file-name">{f.name}</div>
                      <div className="ap-file-meta">{formatBytes(f.size)}</div>
                      {f.status === 'error' && f.error && (
                        <div className="ap-file-error">⚠ {f.error}</div>
                      )}
                      {f.status === 'uploading' && (
                        <div className="ap-prog-track">
                          <div className="ap-prog-fill" style={{ width: `${f.progress}%` }} />
                        </div>
                      )}
                      {f.status === 'done' && (
                        <div className="ap-prog-track">
                          <div className="ap-prog-fill" style={{ width: '100%' }} />
                        </div>
                      )}
                    </div>

                    {/* status badge */}
                    {f.status === 'uploading' && (
                      <span className="ap-badge uploading">
                        <svg className="ap-spin" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ display:'inline', marginRight:4, verticalAlign:'middle' }}>
                          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4"/>
                        </svg>
                        {f.progress}%
                      </span>
                    )}
                    {f.status === 'done'  && <span className="ap-badge done">✓ ready</span>}
                    {f.status === 'error' && <span className="ap-badge error">failed</span>}

                    {/* retry on error */}
                    {f.status === 'error' && (
                      <button className="ap-icon-btn" title="Retry" onClick={() => retryFile(f)}>
                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                        </svg>
                      </button>
                    )}

                    {/* remove */}
                    <button className="ap-icon-btn remove" title="Remove" onClick={() => removeFile(f.id)}>
                      <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                      </svg>
                    </button>
                  </div>
                ))}
              </div>

              {/* process button */}
              {doneCount > 0 && (
                <button
                  className="ap-process-btn"
                  onClick={() => showToast(`Processing ${doneCount} document${doneCount > 1 ? 's' : ''}…`, 'ok')}
                >
                  → process_{agent}_documents ({doneCount} file{doneCount > 1 ? 's' : ''})
                </button>
              )}
            </div>
          )}

        </div>
      </div>
    </>
  );
}