'use client';

import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { useState, useEffect, useRef, forwardRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { MoveRight, Sparkles, Zap, Target, Users, TrendingUp, BarChart3, Bot, Check, X, Network, GitBranch, Workflow, Cpu, Activity } from 'lucide-react';
import Chatbot from '@/components/ui/chatbot';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import WaitlistSection from "@/components/ui/WaitList";
import BookADemo from "@/components/ui/BookaDemo";
import { CreateBundleSection } from '@/components/ui/BundleSection';

const dynamicWords = ["Procurement","Customer Services","Sales","Sourcing","Collections","Accounts Payable","Accounts Receivable","Reporting","Marketing","Human Resources","Sales","Advertising","Job Postings","Lead Generation"];

const categories = [
  { id: 'category1', label: 'Marketing',       color: '#A855F7', gradient: 'linear-gradient(135deg, #A855F7, #C084FC)', comingSoon: false },
  { id: 'category2', label: 'Human Resources', color: '#E8B84A', gradient: 'linear-gradient(135deg, #E8B84A, #F59E0B)', comingSoon: false },
  { id: 'category3', label: 'Sales',           color: '#06B6D4', gradient: 'linear-gradient(135deg, #06B6D4, #22D3EE)', comingSoon: false },
  { id: 'category4', label: 'Finance',         color: '#10B981', gradient: 'linear-gradient(135deg, #10B981, #34D399)', comingSoon: true },
  { id: 'category5', label: 'Supply Chain',    color: '#F97316', gradient: 'linear-gradient(135deg, #F97316, #FB923C)', comingSoon: true },
  { id: 'category6', label: 'Back Office',     color: '#8B5CF6', gradient: 'linear-gradient(135deg, #8B5CF6, #A78BFA)', comingSoon: true },
];

const getBrandName = (category: string): string => {
  switch (category) {
    case 'category1': return 'Mark';
    case 'category2': return 'Consuelo';
    case 'category3': return 'Argeo';
    default: return 'Our Product';
  }
};

const getProductImage = (category: string): string => {
  switch (category) {
    case 'category1': return '/Mark.png';
    case 'category2': return '/Consuelo.png';
    default: return '/Argo.png';
  }
};

// ─── Floating Particle Dots ───
const FloatingDots = () => {
  const dots = [
    { size: 6,  x: '8%',  y: '15%', duration: 18, delay: 0,    color: 'rgba(168,85,247,0.55)',  driftX: 28,  driftY: -22 },
    { size: 4,  x: '18%', y: '72%', duration: 24, delay: 3,    color: 'rgba(232,184,74,0.45)',  driftX: -18, driftY: 32  },
    { size: 8,  x: '82%', y: '20%', duration: 20, delay: 5,    color: 'rgba(168,85,247,0.35)',  driftX: -30, driftY: 18  },
    { size: 3,  x: '90%', y: '65%', duration: 28, delay: 8,    color: 'rgba(6,182,212,0.50)',   driftX: 22,  driftY: -28 },
    { size: 5,  x: '50%', y: '10%', duration: 22, delay: 2,    color: 'rgba(232,184,74,0.40)',  driftX: -14, driftY: 20  },
    { size: 7,  x: '30%', y: '85%', duration: 26, delay: 6,    color: 'rgba(6,182,212,0.30)',   driftX: 20,  driftY: -16 },
    { size: 3,  x: '70%', y: '45%', duration: 32, delay: 10,   color: 'rgba(168,85,247,0.40)',  driftX: -24, driftY: 24  },
    { size: 5,  x: '14%', y: '42%', duration: 19, delay: 1,    color: 'rgba(6,182,212,0.45)',   driftX: 16,  driftY: -30 },
    { size: 4,  x: '60%', y: '78%', duration: 25, delay: 7,    color: 'rgba(232,184,74,0.35)',  driftX: -20, driftY: 12  },
    { size: 6,  x: '92%', y: '30%', duration: 21, delay: 4,    color: 'rgba(168,85,247,0.30)',  driftX: 14,  driftY: 26  },
    { size: 3,  x: '42%', y: '55%', duration: 30, delay: 12,   color: 'rgba(6,182,212,0.35)',   driftX: -26, driftY: -18 },
    { size: 5,  x: '75%', y: '88%', duration: 23, delay: 9,    color: 'rgba(232,184,74,0.30)',  driftX: 18,  driftY: -24 },
    { size: 4,  x: '25%', y: '25%', duration: 27, delay: 11,   color: 'rgba(168,85,247,0.45)',  driftX: -12, driftY: 30  },
    { size: 7,  x: '55%', y: '35%', duration: 35, delay: 15,   color: 'rgba(6,182,212,0.25)',   driftX: 22,  driftY: -14 },
    { size: 3,  x: '88%', y: '52%', duration: 16, delay: 0.5,  color: 'rgba(232,184,74,0.50)',  driftX: -16, driftY: 20  },
  ];
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 2 }}>
      {dots.map((dot, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{ width: dot.size, height: dot.size, left: dot.x, top: dot.y, backgroundColor: dot.color, boxShadow: `0 0 ${dot.size * 3}px ${dot.color}` }}
          animate={{ x: [0, dot.driftX, dot.driftX * 0.4, -dot.driftX * 0.6, 0], y: [0, dot.driftY, dot.driftY * 0.8, dot.driftY * 0.2, 0], opacity: [0.4, 0.85, 0.6, 0.9, 0.4], scale: [1, 1.2, 0.9, 1.1, 1] }}
          transition={{ duration: dot.duration, delay: dot.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
};

const products = [
  { id: 1, category: 'category1', icon: Network,   color: '#A855F7', colorIntensity: 0.4, name: 'Content & Social Media Agent',       tagline: 'Create and manage engaging social content',        description: 'An AI-powered agent that generates, schedules, and optimizes social media content across all major platforms. From caption writing to content calendar management.',                                                           features: ['Content Generation', 'Social Scheduling', 'Engagement Analytics', 'Brand Voice Consistency'], price: '$499/mo',   ctaType: 'demo' },
  { id: 2, category: 'category1', icon: Cpu,        color: '#A855F7', colorIntensity: 0.6, name: 'Advertising Agent',                  tagline: 'Optimize ad campaigns and maximize ROI',          description: 'Intelligent ad management automation that creates, tests, and optimizes campaigns across Google Ads, Meta, and LinkedIn. Real-time bid optimization and audience targeting.',    features: ['Campaign Automation', 'Bid Optimization', 'A/B Testing', 'ROI Tracking'],                     price: '$699/mo',   ctaType: 'waitlist' },
  { id: 3, category: 'category1', icon: Workflow,   color: '#A855F7', colorIntensity: 0.8, name: 'Full Marketing Agent',               tagline: 'Complete marketing automation suite',             description: 'The complete Mark solution combining content creation, ad management, and analytics. Unified platform for all your marketing needs with full AI automation.',                  features: ['Content Generation', 'Ad Optimization', 'Lead Scoring', 'Performance Analytics'],             price: '$1,299/mo', ctaType: 'waitlist' },
  { id: 4, category: 'category2', icon: GitBranch,  color: '#E8B84A', colorIntensity: 0.4, name: 'Candidate Screening',                tagline: 'Intelligent resume screening and evaluation',      description: 'Automate resume review and candidate qualification. AI evaluates CVs against job requirements, identifies top candidates, and flags red flags in seconds.',                    features: ['Resume Parsing', 'Skill Matching', 'Qualification Scoring', 'Bias-free Evaluation'],           price: '$399/mo',   ctaType: 'demo' },
  { id: 5, category: 'category2', icon: Activity,   color: '#E8B84A', colorIntensity: 0.6, name: 'Talent Acquisition',                 tagline: 'Automated job description generation',            description: 'Generate compelling and SEO-optimized job descriptions in minutes. AI creates role-specific descriptions, requirements, and benefits tailored to your company culture.',        features: ['Description Generation', 'SEO Optimization', 'Salary Recommendation', 'Culture Matching'],     price: '$299/mo',   ctaType: 'waitlist' },
  { id: 6, category: 'category2', icon: Workflow,   color: '#E8B84A', colorIntensity: 0.8, name: 'Full HR Agent',                      tagline: 'Comprehensive HR automation platform',             description: 'The complete Consuelo solution combining CV screening, job creation, and candidate engagement. End-to-end recruitment and HR automation in one platform.',                     features: ['Resume Screening', 'Job Description', 'Candidate Engagement', 'Analytics Dashboard'],           price: '$899/mo',   ctaType: 'waitlist' },
  { id: 7, category: 'category3', icon: Network,   color: '#06B6D4', colorIntensity: 0.4, name: 'Lead Generation and Classification', tagline: 'AI-powered lead identification and scoring',       description: 'Discover and qualify hot leads automatically. AI scans the market, identifies prospects matching your ideal customer profile, and scores them for sales-readiness.',           features: ['Lead Discovery', 'Qualification Scoring', 'Prospect Research', 'CRM Integration'],             price: '$499/mo',   ctaType: 'waitlist' },
  { id: 8, category: 'category3', icon: Cpu,        color: '#06B6D4', colorIntensity: 0.6, name: 'Meeting Agent',                      tagline: 'Autonomous meeting scheduling and management',    description: 'Never chase meeting availability again. AI proactively schedules calls with prospects, sends reminders, and follows up—moving deals forward 24/7.',                            features: ['Meeting Scheduling', 'Calendar Integration', 'Intelligent Reminders', 'Follow-up Automation'],  price: '$599/mo',   ctaType: 'waitlist' },
  { id: 9, category: 'category3', icon: Workflow,   color: '#06B6D4', colorIntensity: 0.8, name: 'Full Sales Agent',                   tagline: 'End-to-end sales automation',                     description: 'The complete Argeo solution combining lead generation, meeting management, and pipeline tracking. Your complete autonomous sales team working 24/7.',                          features: ['Lead Generation', 'Meeting Scheduling', 'Pipeline Management', 'Win Rate Analytics'],           price: '$1,199/mo', ctaType: 'waitlist' },
];

export default function ProductsPageWrapper() {
  return <Suspense><ProductsPage /></Suspense>;
}

function ProductsPage() {
  const searchParams = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState('category1');
  const [wordIndex, setWordIndex] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState<typeof products[0] | null>(null);
  const [shouldScrollToDetails, setShouldScrollToDetails] = useState(false);
  const [hoveredProduct, setHoveredProduct] = useState<number | null>(null);
  const [hoveredComingSoon, setHoveredComingSoon] = useState<string | null>(null);
  const [showPilotOverlay, setShowPilotOverlay] = useState(false);
  const [pilotStep, setPilotStep] = useState<'info' | 'email' | 'success'>('info');
  const [pilotEmail, setPilotEmail] = useState('');
  const [pilotSubmitting, setPilotSubmitting] = useState(false);
  const [pilotError, setPilotError] = useState('');
  const productDetailsRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  useEffect(() => {
    const interval = setInterval(() => setWordIndex(p => (p + 1) % dynamicWords.length), 2500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const first = products.find(p => p.category === selectedCategory);
    setSelectedProduct(first || null);
  }, [selectedCategory]);

  useEffect(() => {
    if (selectedProduct && productDetailsRef.current && shouldScrollToDetails) {
      setTimeout(() => productDetailsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
      setShouldScrollToDetails(false);
    }
  }, [selectedProduct, shouldScrollToDetails]);

  useEffect(() => {
    const agentParam = searchParams.get('agent');
    if (!agentParam) return;
    const map: Record<string, string> = { argo: 'category3', mark: 'category1', consuelo: 'category2' };
    const cat = map[agentParam.toLowerCase()];
    if (cat) {
      setSelectedCategory(cat);
      const scrollToHow = () => {
        const el = document.getElementById('how-it-works');
        if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 100, behavior: 'smooth' });
        else setTimeout(scrollToHow, 200);
      };
      setTimeout(scrollToHow, 300);
    }
  }, [searchParams]);

  useEffect(() => {
    const handler = (e: MouseEvent) => { mouseX.set(e.clientX); mouseY.set(e.clientY); };
    window.addEventListener('mousemove', handler);
    return () => window.removeEventListener('mousemove', handler);
  }, [mouseX, mouseY]);

  const closePilotOverlay = () => {
    setShowPilotOverlay(false);
    setTimeout(() => { setPilotStep('info'); setPilotEmail(''); setPilotError(''); }, 350);
  };

  const handlePilotSubmit = async () => {
    if (!pilotEmail.trim()) { setPilotError('Please enter your email address.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(pilotEmail.trim())) { setPilotError('Please enter a valid email address.'); return; }
    setPilotSubmitting(true); setPilotError('');
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
      const res = await fetch(`${apiUrl}/api/waitlist/join/`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: pilotEmail.trim() }) });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        let msg = res.status === 400 ? 'Email already registered.' : 'Something went wrong. Please try again.';
        if (err) {
          const e = err.email;
          if (Array.isArray(e) && e[0]) msg = e[0];
          else if (typeof e === 'string') msg = e;
          else if (typeof err.error === 'string') msg = err.error;
          else if (typeof err.detail === 'string') msg = err.detail;
        }
        setPilotError(msg);
      } else { setPilotStep('success'); }
    } catch { setPilotError('Network error — please check your connection and try again.'); }
    finally { setPilotSubmitting(false); }
  };

  const filteredProducts = products.filter(p => p.category === selectedCategory);
  const activeCategory = categories.find(c => c.id === selectedCategory)!;

  return (
    <div className="min-h-screen w-full overflow-x-hidden" style={{ background: 'linear-gradient(160deg, #12041a 0%, #1e0835 30%, #2a0d4a 55%, #160228 80%, #0c0118 100%)' }}>
      <Navbar />

      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(168,85,247,0.18) 0%, transparent 70%)', filter: 'blur(40px)' }} />
        <div style={{ position: 'absolute', bottom: '20%', left: '-10%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(232,184,74,0.12) 0%, transparent 70%)', filter: 'blur(40px)' }} />
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '600px', height: '300px', background: 'radial-gradient(circle, rgba(6,182,212,0.07) 0%, transparent 70%)', filter: 'blur(60px)' }} />
        <motion.div style={{ position: 'absolute', width: '600px', height: '600px', borderRadius: '50%', background: `radial-gradient(circle, ${activeCategory.color}15 0%, transparent 70%)`, filter: 'blur(80px)', x: useTransform(mouseX, [0, typeof window !== 'undefined' ? window.innerWidth : 1920], [-100, 100]), y: useTransform(mouseY, [0, typeof window !== 'undefined' ? window.innerHeight : 1080], [-100, 100]) }} />
      </div>

      <div className="relative">
        <FloatingDots />

        {/* ══ HERO ══ */}
        <section className="relative z-10 min-h-screen flex items-center justify-center px-4 sm:px-6 text-center pt-20 sm:pt-24">
          <div className="max-w-4xl mx-auto relative z-10 w-full">
            <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: 'easeOut' }}>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light text-white leading-tight mb-6 relative">
                <motion.span aria-hidden="true" className="absolute left-1/2 -translate-x-1/2 pointer-events-none hidden sm:block"
                  style={{ top: '-20%', width: '900px', height: '140%', borderRadius: '50%', background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(232,184,74,0.42) 0%, rgba(232,140,50,0.16) 45%, transparent 72%)', filter: 'blur(48px)', zIndex: 0 }}
                  animate={{ opacity: [0.5, 1, 0.5], scaleX: [0.92, 1.06, 0.92], scaleY: [0.9, 1.05, 0.9] }} transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }} />
                <span className="relative z-10">Intelligent solutions</span>
                <div className="text-white/60 text-2xl sm:text-3xl md:text-4xl lg:text-5xl mt-2 sm:mt-3">for your</div>
                <div className="relative h-[1.4em] mt-3 sm:mt-4 overflow-hidden flex justify-center">
                  {dynamicWords.map((word, index) => (
                    <motion.span key={word}
                      className="absolute inset-0 flex justify-center text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold"
                      style={{ background: 'linear-gradient(135deg, #E8B84A, #E8A87C)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
                      initial={{ opacity: 0, y: 50 }}
                      animate={wordIndex === index ? { y: 0, opacity: 1 } : { y: wordIndex > index ? -50 : 50, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 100, damping: 20 }}>
                      {word}
                    </motion.span>
                  ))}
                </div>
              </h1>
              <p className="text-sm sm:text-base lg:text-lg text-white/50 leading-relaxed max-w-2xl mx-auto mt-6 sm:mt-8 lg:mt-10 px-2">
                Autonomous AI agents designed for Marketing, HR, and Sales.
                Choose the perfect level of automation — from specialized tools to full-suite intelligent platforms.
              </p>
            </motion.div>
          </div>
        </section>

        {/* ══ ECOSYSTEM SECTION ══ */}
        <section className="relative z-10 py-12 sm:py-16 lg:py-24 px-4 sm:px-6" data-products-section>
          <div className="max-w-6xl mx-auto">

            {/* Category Pills */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="flex justify-center mb-10 sm:mb-14 lg:mb-16 relative">
              {/* Floating indicator dots — desktop only */}
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 hidden sm:flex gap-2">
                {categories.filter(c => !c.comingSoon).map((cat, idx) => (
                  <motion.div key={cat.id} className="w-1.5 h-1.5 rounded-full"
                    style={{ background: selectedCategory === cat.id ? cat.color : 'rgba(255,255,255,0.2)' }}
                    animate={selectedCategory === cat.id ? { scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] } : {}}
                    transition={{ duration: 2, repeat: Infinity, delay: idx * 0.2 }} />
                ))}
              </div>

              <div className="relative inline-flex items-center gap-1 sm:gap-2 p-1.5 sm:p-2 rounded-full flex-wrap justify-center max-w-[95vw]"
                style={{ background: 'linear-gradient(135deg, rgba(20,15,30,0.95), rgba(30,20,40,0.95))', border: '2px solid rgba(255,255,255,0.15)', backdropFilter: 'blur(24px)', boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 60px ${activeCategory.color}20` }}>
                {categories.map((cat) => {
                  const isActive = selectedCategory === cat.id;
                  const isTooltipVisible = hoveredComingSoon === cat.id;
                  return (
                    <div key={cat.id} className="relative"
                      onMouseEnter={() => cat.comingSoon && setHoveredComingSoon(cat.id)}
                      onMouseLeave={() => setHoveredComingSoon(null)}>
                      <motion.button
                        onClick={() => !cat.comingSoon && setSelectedCategory(cat.id)}
                        className="relative px-3 sm:px-4 lg:px-6 py-2 sm:py-2.5 lg:py-3 rounded-full text-[11px] sm:text-xs lg:text-sm font-bold transition-all z-10"
                        style={{ color: cat.comingSoon ? 'rgba(255,255,255,0.35)' : isActive ? '#FFFFFF' : 'rgba(255,255,255,0.6)', cursor: 'pointer', textShadow: isActive ? `0 0 20px ${cat.color}80` : 'none' }}
                        whileHover={!isActive ? { color: cat.comingSoon ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.9)', scale: 1.02 } : {}}
                        whileTap={{ scale: 0.97 }}>
                        {isActive && !cat.comingSoon && (
                          <motion.div layoutId="activePill" className="absolute inset-0 rounded-full -z-10"
                            style={{ background: cat.gradient, boxShadow: `0 0 30px ${cat.color}60, inset 0 1px 0 rgba(255,255,255,0.2)` }}
                            transition={{ type: 'spring', stiffness: 350, damping: 30 }} />
                        )}
                        {!isActive && !cat.comingSoon && (
                          <motion.div className="absolute inset-0 rounded-full -z-10" initial={{ opacity: 0 }} whileHover={{ opacity: 1 }}
                            style={{ background: `${cat.color}15`, border: `1px solid ${cat.color}30` }} />
                        )}
                        {cat.comingSoon && (
                          <div className="absolute inset-0 rounded-full -z-10" style={{ background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.12)' }} />
                        )}
                        <span className="relative z-10 tracking-wide whitespace-nowrap">{cat.label}</span>
                        {cat.comingSoon && <span className="ml-1 text-[10px] opacity-40">🔒</span>}
                      </motion.button>

                      {/* Coming Soon Tooltip — desktop only */}
                      <AnimatePresence>
                        {isTooltipVisible && (
                          <motion.div className="absolute z-[100] pointer-events-none hidden sm:block"
                            style={{ bottom: 'calc(100% + 16px)', left: '50%', x: '-50%' }}
                            initial={{ opacity: 0, y: 8, scale: 0.92 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 6, scale: 0.94 }}
                            transition={{ duration: 0.2, ease: 'easeOut' }}>
                            <div className="relative overflow-hidden rounded-2xl"
                              style={{ background: 'linear-gradient(135deg, rgba(6,4,16,0.99), rgba(14,8,28,0.99))', border: `1px solid ${cat.color}50`, boxShadow: `0 20px 60px rgba(0,0,0,0.8), 0 0 40px ${cat.color}25`, minWidth: '220px', padding: '16px 18px' }}>
                              <div className="absolute -bottom-[7px] left-1/2 -translate-x-1/2" style={{ width: 0, height: 0, borderLeft: '7px solid transparent', borderRight: '7px solid transparent', borderTop: `7px solid ${cat.color}50` }} />
                              <motion.div className="absolute inset-0 pointer-events-none" style={{ background: `linear-gradient(180deg, transparent 0%, ${cat.color}10 50%, transparent 100%)` }} animate={{ y: ['-100%', '200%'] }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} />
                              {['top-2 left-2 border-t border-l', 'top-2 right-2 border-t border-r', 'bottom-4 left-2 border-b border-l', 'bottom-4 right-2 border-b border-r'].map((cls, i) => (
                                <div key={i} className={`absolute w-2.5 h-2.5 ${cls}`} style={{ borderColor: `${cat.color}70` }} />
                              ))}
                              <div className="flex items-center justify-between mb-3 relative z-10">
                                <div className="flex items-center gap-2">
                                  <motion.div className="w-1.5 h-1.5 rounded-full" style={{ background: cat.color, boxShadow: `0 0 6px ${cat.color}` }} animate={{ opacity: [0.3, 1, 0.3], scale: [1, 1.6, 1] }} transition={{ duration: 1.2, repeat: Infinity }} />
                                  <span className="text-[10px] font-bold tracking-[0.18em] uppercase" style={{ color: cat.color }}>In Development</span>
                                </div>
                                <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}>
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={cat.color} strokeWidth="2"><path d="M12 2a10 10 0 1 0 10 10" strokeLinecap="round" /><path d="M12 6v6l4 2" strokeLinecap="round" /></svg>
                                </motion.div>
                              </div>
                              <div className="relative z-10 mb-3">
                                <div className="text-white font-semibold text-sm mb-0.5">{cat.label} Agent</div>
                                <div className="text-white/40 text-[11px]">Currently being trained &amp; tested</div>
                              </div>
                              <div className="relative z-10 mb-3">
                                <div className="flex justify-between items-center mb-1">
                                  <span className="text-[9px] text-white/30 tracking-wider uppercase">Build Progress</span>
                                  <motion.span className="text-[9px] font-mono font-bold" style={{ color: cat.color }} animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity }}>~Q3 2025</motion.span>
                                </div>
                                <div className="h-[3px] rounded-full w-full" style={{ background: 'rgba(255,255,255,0.07)' }}>
                                  <motion.div className="h-full rounded-full" style={{ background: `linear-gradient(90deg, ${cat.color}70, ${cat.color})` }} initial={{ width: '0%' }} animate={{ width: ['60%', '75%', '68%', '72%'] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }} />
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5 relative z-10">
                                {[0, 1, 2, 3, 4, 5].map(i => (
                                  <motion.div key={i} className="rounded-full" style={{ background: cat.color, width: i % 3 === 0 ? 4 : 3, height: i % 3 === 0 ? 4 : 3 }} animate={{ opacity: [0.15, 1, 0.15], scale: [0.8, 1.4, 0.8] }} transition={{ duration: 1, repeat: Infinity, delay: i * 0.12 }} />
                                ))}
                                <span className="text-[10px] text-white/30 ml-1 tracking-wide">initializing agents</span>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Section Heading */}
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="text-center mb-10 sm:mb-14 lg:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light text-white mb-3 sm:mb-4">
                Explore our <span className="font-semibold" style={{ color: activeCategory.color }}>ecosystem</span>
              </h2>
              <p className="text-sm sm:text-base lg:text-lg text-white/60 max-w-2xl mx-auto">Interactive view of how our AI agents work together</p>
            </motion.div>

            {/* ── TWO-COLUMN: Pilot CTA + Orbital ── */}
            <div className="flex flex-col lg:grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">

              {/* PILOT CTA */}
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="relative w-full">
                <div className="relative">
                  <motion.div className="absolute -inset-4 rounded-3xl opacity-40"
                    style={{ background: `radial-gradient(circle at 30% 50%, ${activeCategory.color}30, transparent 70%)`, filter: 'blur(40px)' }}
                    animate={{ opacity: [0.3, 0.5, 0.3], scale: [1, 1.05, 1] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }} />
                  <div className="relative p-6 sm:p-8 lg:p-10 rounded-3xl overflow-hidden backdrop-blur-xl"
                    style={{ background: 'linear-gradient(135deg, rgba(20,15,30,0.6), rgba(30,20,40,0.8))', border: '1px solid rgba(232,184,74,0.25)', boxShadow: '0 20px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)' }}>
                    <div className="absolute inset-0 opacity-20" style={{ background: `linear-gradient(135deg, transparent 0%, ${activeCategory.color}15 50%, transparent 100%)` }} />
                    <svg className="absolute inset-0 w-full h-full opacity-5" xmlns="http://www.w3.org/2000/svg">
                      <defs><pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse"><path d="M 30 0 L 0 0 0 30" fill="none" stroke="white" strokeWidth="0.5" /></pattern></defs>
                      <rect width="100%" height="100%" fill="url(#grid)" />
                    </svg>

                    <div className="relative z-10">
                      {/* Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
                        <div className="flex items-center gap-3 sm:gap-4">
                          <motion.div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-2xl flex items-center justify-center relative flex-shrink-0"
                            style={{ background: 'linear-gradient(135deg, rgba(232,184,74,0.15), rgba(232,184,74,0.05))', border: '1px solid rgba(232,184,74,0.3)', boxShadow: '0 8px 24px rgba(232,184,74,0.2), inset 0 1px 0 rgba(255,255,255,0.1)' }}
                            whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }} transition={{ duration: 0.4 }}>
                            {[0, 120, 240].map((angle, i) => (
                              <motion.div key={i} className="absolute w-1.5 h-1.5 rounded-full" style={{ background: '#E8B84A', top: '50%', left: '50%' }}
                                animate={{ x: [Math.cos((angle * Math.PI) / 180) * 28, Math.cos(((angle + 360) * Math.PI) / 180) * 28], y: [Math.sin((angle * Math.PI) / 180) * 28, Math.sin(((angle + 360) * Math.PI) / 180) * 28] }}
                                transition={{ duration: 3, repeat: Infinity, ease: 'linear', delay: i * 0.33 }} />
                            ))}
                            <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 relative z-10" style={{ color: '#E8B84A' }} />
                          </motion.div>
                          <div>
                            <motion.div className="px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold mb-1 inline-flex items-center gap-1.5"
                              style={{ background: 'rgba(232,184,74,0.15)', border: '1px solid rgba(232,184,74,0.3)', color: '#E8B84A' }}
                              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                              <motion.div className="w-1.5 h-1.5 rounded-full bg-green-400" animate={{ boxShadow: ['0 0 0 0 rgba(74,222,128,0.7)', '0 0 0 4px rgba(74,222,128,0)'] }} transition={{ duration: 1.5, repeat: Infinity }} />
                              <span className="hidden sm:inline">ELITE ACCESS · PILOT PROGRAM</span>
                              <span className="sm:hidden">ELITE ACCESS · PILOT</span>
                            </motion.div>
                            <div className="text-[10px] sm:text-xs text-white/40 font-medium">Limited to 20 Organizations</div>
                          </div>
                        </div>
                      </div>

                      <motion.h3 className="text-xl sm:text-2xl lg:text-3xl font-light mb-3 tracking-tight"
                        style={{ background: 'linear-gradient(135deg, #FFFFFF 0%, #E8B84A 50%, #FFFFFF 100%)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundSize: '200% auto' }}
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                        Join our Pilot Program
                      </motion.h3>

                      <p className="text-sm sm:text-base text-white/70 leading-relaxed mb-2">
                        Experience autonomous AI agents working in harmony. <span className="text-white font-medium">First 20 companies</span> receive exclusive access.
                      </p>

                      <div className="flex flex-wrap gap-2 sm:gap-3 mb-6 sm:mb-8">
                        {['Exclusive Access', 'Premium Support', 'Early Advantage'].map((feature, idx) => (
                          <motion.div key={feature} className="flex items-center gap-1.5 text-xs text-white/60" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + idx * 0.1 }}>
                            <Check className="w-3 h-3 flex-shrink-0" style={{ color: '#E8B84A' }} />{feature}
                          </motion.div>
                        ))}
                      </div>

                      <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:gap-4 mb-6 sm:mb-8">
                        {[
                          { icon: Users,  value: '20',  label: 'Companies Only', sublabel: 'Spots Remaining' },
                          { icon: Zap,    value: '67%', label: 'Special Pricing', sublabel: 'Early Adopter' },
                          { icon: Target, value: 'Mar', label: 'Launch Date',     sublabel: '2026' },
                        ].map((stat, idx) => (
                          <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + idx * 0.1 }}>
                            <div className="p-3 sm:p-4 rounded-xl relative overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(232,184,74,0.05), rgba(232,184,74,0.02))', border: '1px solid rgba(232,184,74,0.15)' }}>
                              <stat.icon className="w-4 h-4 sm:w-5 sm:h-5 mb-2 sm:mb-3 relative z-10" style={{ color: '#E8B84A', opacity: 0.8 }} />
                              <div className="text-lg sm:text-xl lg:text-2xl font-light text-white mb-1 relative z-10">{stat.value}</div>
                              <div className="text-[10px] sm:text-xs font-medium text-white/70 relative z-10 leading-tight">{stat.label}</div>
                              <div className="text-[10px] sm:text-xs text-white/40 relative z-10">{stat.sublabel}</div>
                            </div>
                          </motion.div>
                        ))}
                      </div>

                      <motion.button onClick={() => setShowPilotOverlay(true)} className="w-full relative group/btn overflow-hidden"
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
                        whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                        <motion.div className="absolute inset-0 rounded-xl blur-lg" style={{ background: 'linear-gradient(135deg, #E8B84A, #E8A87C)', opacity: 0.3 }} animate={{ opacity: [0.2, 0.4, 0.2] }} transition={{ duration: 2, repeat: Infinity }} />
                        <div className="relative px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl flex items-center justify-between overflow-hidden" style={{ background: 'linear-gradient(135deg, #E8B84A 0%, #E8A87C 100%)', boxShadow: '0 4px 20px rgba(232,184,74,0.3), inset 0 1px 0 rgba(255,255,255,0.2)' }}>
                          <motion.div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)' }} animate={{ x: ['-100%', '200%'] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }} />
                          <span className="relative z-10 font-semibold text-black flex items-center gap-2 text-sm sm:text-base">
                            <span>Secure Your Position</span>
                            <motion.span className="px-2 py-0.5 rounded-full text-xs bg-black/15 font-bold hidden sm:inline" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1, type: 'spring' }}>6 MONTHS</motion.span>
                          </span>
                          <motion.div className="relative z-10" animate={{ x: [0, 4, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                            <MoveRight className="w-4 h-4 sm:w-5 sm:h-5 text-black" />
                          </motion.div>
                        </div>
                      </motion.button>

                      <motion.div className="mt-4 sm:mt-6 pt-4 sm:pt-5 border-t border-white/5 flex items-center justify-between" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                          <span className="text-[10px] sm:text-xs text-white/50">No long-term commitment</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex -space-x-2">
                            {[...Array(4)].map((_, i) => (
                              <motion.div key={i} className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2"
                                style={{ borderColor: '#1a1525', background: `linear-gradient(135deg, ${activeCategory.color}${60 + i * 10}, ${activeCategory.color}40)` }}
                                initial={{ scale: 0, x: -20 }} animate={{ scale: 1, x: 0 }} transition={{ delay: 1.1 + i * 0.1, type: 'spring' }} />
                            ))}
                          </div>
                          <span className="text-[10px] sm:text-xs text-white/50">15+ applied</span>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* ORBITAL / MOBILE CARDS */}
              <div className="relative w-full">
                {/* Desktop orbital */}
                <div className="hidden lg:flex items-center justify-center" style={{ minHeight: '520px' }}>
                  <OrbitalDisplay
                    filteredProducts={filteredProducts}
                    activeCategory={activeCategory}
                    hoveredProduct={hoveredProduct}
                    setHoveredProduct={setHoveredProduct}
                    hoverTimeoutRef={hoverTimeoutRef}
                    onSelectProduct={(prod) => { setSelectedProduct(prod); setShouldScrollToDetails(true); }}
                  />
                </div>

                {/* Mobile / tablet product list */}
                <div className="lg:hidden">
                  <p className="text-xs text-white/40 tracking-widest uppercase text-center mb-4">Tap a product to explore</p>
                  <div className="flex flex-col gap-3">
                    {filteredProducts.map((product, index) => {
                      const isSelected = selectedProduct?.id === product.id;
                      return (
                        <motion.button key={product.id}
                          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08 }}
                          onClick={() => { setSelectedProduct(product); setShouldScrollToDetails(true); }}
                          className="w-full text-left p-4 rounded-2xl flex items-center gap-4 transition-all"
                          style={{ background: isSelected ? `linear-gradient(135deg, ${product.color}20, ${product.color}08)` : 'rgba(255,255,255,0.04)', border: `1px solid ${isSelected ? product.color + '60' : 'rgba(255,255,255,0.1)'}`, boxShadow: isSelected ? `0 4px 24px ${product.color}30` : 'none' }}>
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${product.color}20`, border: `1px solid ${product.color}40` }}>
                            <product.icon className="w-5 h-5" style={{ color: product.color }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-white text-sm font-semibold truncate">{product.name}</div>
                            <div className="text-white/45 text-xs mt-0.5 truncate">{product.tagline}</div>
                          </div>
                          {isSelected && (
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex-shrink-0">
                              <div className="w-2 h-2 rounded-full" style={{ background: product.color }} />
                            </motion.div>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══ PILOT OVERLAY ══ */}
        <AnimatePresence>
          {showPilotOverlay && (
            <motion.div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-0 sm:px-6"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closePilotOverlay}>
              <motion.div className="absolute inset-0 bg-black/80 backdrop-blur-xl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
              <motion.div className="relative w-full sm:max-w-2xl rounded-t-3xl sm:rounded-2xl overflow-hidden shadow-2xl max-h-[92vh] overflow-y-auto"
                style={{ background: 'linear-gradient(135deg, rgba(10,0,20,0.98), rgba(30,10,40,0.98))', border: '1px solid rgba(232,184,74,0.5)', boxShadow: '0 25px 80px rgba(232,184,74,0.4), inset 0 1px 0 rgba(255,255,255,0.1)' }}
                initial={{ scale: 0.95, y: 60, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.95, y: 60, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }} onClick={e => e.stopPropagation()}>
                {/* drag handle on mobile */}
                <div className="sm:hidden flex justify-center pt-3 pb-1">
                  <div className="w-10 h-1 rounded-full bg-white/20" />
                </div>
                <button onClick={closePilotOverlay} className="absolute top-4 right-4 sm:top-5 sm:right-5 w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/15 transition-all z-20 group"
                  style={{ border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
                  <X className="w-4 h-4 sm:w-5 sm:h-5 group-hover:rotate-90 transition-transform duration-300" />
                </button>
                <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none" style={{ background: 'radial-gradient(circle, #E8B84A, transparent)' }} />
                <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full blur-3xl opacity-15 pointer-events-none" style={{ background: 'radial-gradient(circle, #E8A87C, transparent)' }} />

                <AnimatePresence mode="wait">
                  {pilotStep === 'info' && (
                    <motion.div key="info" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 30 }} transition={{ duration: 0.3 }}>
                      <div className="relative px-5 sm:px-8 pt-5 sm:pt-8 pb-3 sm:pb-4">
                        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1 }}>
                          <motion.div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-3"
                            style={{ background: 'linear-gradient(135deg, rgba(232,184,74,0.2), rgba(232,184,74,0.1))', border: '1px solid rgba(232,184,74,0.3)' }}
                            initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2, type: 'spring' }}>
                            <motion.div className="w-1.5 h-1.5 rounded-full" style={{ background: '#E8B84A' }} animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }} />
                            <span className="text-xs font-bold tracking-wider" style={{ color: '#E8B84A' }}>AI-POWERED PILOT PROGRAM</span>
                            <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}>
                              <Bot className="w-3.5 h-3.5" style={{ color: '#E8B84A' }} />
                            </motion.div>
                          </motion.div>
                          <h2 className="text-2xl sm:text-3xl font-bold mb-2 relative z-10">
                            <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(135deg, #FFFFFF 0%, #E8B84A 50%, #FFFFFF 100%)', backgroundSize: '200% auto' }}>Join Our Pilot Project</span>
                          </h2>
                          <p className="text-white/70 text-sm sm:text-base relative z-10 flex items-center gap-2">
                            Lock in your competitive advantage with exclusive early access
                            <motion.span animate={{ x: [0, 4, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>→</motion.span>
                          </p>
                        </motion.div>
                      </div>
                      <div className="px-5 sm:px-8 pb-6 sm:pb-8">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-5 sm:mb-6">
                          {[
                            { val: '2 Years', label: 'Early Access Head Start', desc: 'Get first-mover advantage while competitors are still figuring out where to start', icon: TrendingUp },
                            { val: '67% Off', label: 'Brand Presence Discount', desc: 'Marketing & digital presence bundled at a fraction of standard rates', icon: Zap },
                            { val: '€4,200', label: 'Complete Package', desc: 'Enterprise-grade AI infrastructure at SME pricing—10x less than competitors', icon: Target },
                          ].map((item, idx) => (
                            <motion.div key={item.val} className="p-4 rounded-xl relative overflow-hidden"
                              style={{ background: 'linear-gradient(135deg, rgba(232,184,74,0.08), rgba(232,184,74,0.03))', border: '1px solid rgba(232,184,74,0.2)' }}
                              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} whileHover={{ scale: 1.02 }}>
                              <item.icon className="w-5 h-5 mb-2 sm:mb-3" style={{ color: '#E8B84A' }} />
                              <div className="text-xl sm:text-2xl font-bold mb-1" style={{ color: '#E8B84A' }}>{item.val}</div>
                              <div className="text-xs font-semibold text-white mb-1">{item.label}</div>
                              <p className="text-xs text-white/60 leading-snug">{item.desc}</p>
                            </motion.div>
                          ))}
                        </div>
                        <motion.div className="p-4 rounded-xl mb-5 sm:mb-6 relative overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-sm">
                            {[['Duration', '6 months', '⏱'], ['Start Date', 'March 2026', '📅'], ['Spots Left', '20 companies', '🎯'], ['Commitment', 'Active feedback', '💬']].map(([label, val, emoji], idx) => (
                              <motion.div key={label as string} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + idx * 0.1 }}>
                                <div className="text-white/50 text-xs mb-1 flex items-center gap-1"><span>{emoji}</span>{label}</div>
                                <div className="text-white font-semibold text-sm">{val}</div>
                              </motion.div>
                            ))}
                          </div>
                        </motion.div>
                        <div className="flex flex-col sm:flex-row gap-3">
                          <motion.button onClick={() => setPilotStep('email')} className="flex-1 relative group/btn overflow-hidden"
                            whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
                            <div className="relative px-6 py-3.5 rounded-xl font-bold text-black text-sm flex items-center justify-center gap-2 overflow-hidden"
                              style={{ background: 'linear-gradient(135deg, #E8B84A, #E8A87C)', boxShadow: '0 4px 20px rgba(232,184,74,0.4), inset 0 1px 0 rgba(255,255,255,0.3)' }}>
                              <span>Apply for Pilot Access</span><MoveRight className="w-5 h-5" />
                            </div>
                          </motion.button>
                          <motion.button onClick={closePilotOverlay} className="px-6 py-3.5 rounded-xl font-semibold text-white text-sm border hover:bg-white/10 transition-all"
                            style={{ borderColor: 'rgba(255,255,255,0.2)' }} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
                            Maybe Later
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {pilotStep === 'email' && (
                    <motion.div key="email" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }} className="px-5 sm:px-10 py-8 sm:py-12">
                      <button onClick={() => { setPilotStep('info'); setPilotError(''); }} className="flex items-center gap-2 text-white/50 hover:text-white text-sm mb-8 sm:mb-10 transition-colors group">
                        <MoveRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />Back
                      </button>
                      <div className="max-w-md mx-auto">
                        <motion.div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mb-6 sm:mb-8 mx-auto relative"
                          style={{ background: 'rgba(232,184,74,0.15)', border: '1px solid rgba(232,184,74,0.4)', boxShadow: '0 8px 32px rgba(232,184,74,0.3)' }}
                          initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 200, damping: 15 }}>
                          <svg className="w-7 h-7 sm:w-8 sm:h-8 relative z-10" viewBox="0 0 24 24" fill="none" stroke="#E8B84A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="3" /><path d="M2 7l10 7 10-7" /></svg>
                        </motion.div>
                        <motion.h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 text-center" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>Reserve your spot</motion.h2>
                        <motion.p className="text-white/60 text-sm mb-8 sm:mb-10 leading-relaxed text-center" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                          Drop your work email below. We'll reach out personally before the pilot kicks off in March 2026 — no spam, ever.
                        </motion.p>
                        <motion.div className="relative mb-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                          <input type="email" value={pilotEmail}
                            onChange={e => { setPilotEmail(e.target.value); if (pilotError) setPilotError(''); }}
                            onKeyDown={e => e.key === 'Enter' && handlePilotSubmit()}
                            placeholder="you@company.com"
                            className="w-full px-5 sm:px-6 py-3.5 sm:py-4 rounded-xl text-white text-base placeholder-white/30 outline-none transition-all"
                            style={{ background: 'rgba(255,255,255,0.08)', border: `2px solid ${pilotError ? 'rgba(239,68,68,0.6)' : pilotEmail ? 'rgba(232,184,74,0.5)' : 'rgba(255,255,255,0.15)'}`, boxShadow: pilotError ? '0 0 0 4px rgba(239,68,68,0.15)' : pilotEmail ? '0 0 0 4px rgba(232,184,74,0.15)' : 'none' }}
                            autoFocus />
                        </motion.div>
                        <AnimatePresence>
                          {pilotError && (
                            <motion.div className="mb-4 p-3 rounded-lg flex items-start gap-2" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }} initial={{ opacity: 0, y: -10, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }} exit={{ opacity: 0, y: -10, height: 0 }}>
                              <X className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                              <p className="text-red-400 text-xs leading-relaxed">{pilotError}</p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                        <motion.button onClick={handlePilotSubmit} disabled={pilotSubmitting} className="w-full py-3.5 sm:py-4 rounded-xl font-bold text-black text-base relative overflow-hidden"
                          style={{ background: 'linear-gradient(135deg, #E8B84A, #E8A87C)', opacity: pilotSubmitting ? 0.7 : 1, boxShadow: pilotSubmitting ? 'none' : '0 4px 20px rgba(232,184,74,0.4)' }}
                          whileHover={!pilotSubmitting ? { scale: 1.02 } : {}} whileTap={!pilotSubmitting ? { scale: 0.98 } : {}}
                          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                          <AnimatePresence mode="wait">
                            {pilotSubmitting ? (
                              <motion.span key="loading" className="flex items-center justify-center gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" /></svg>
                                Saving your spot…
                              </motion.span>
                            ) : (
                              <motion.span key="idle" className="flex items-center justify-center gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                Apply for Pilot Access <MoveRight className="w-5 h-5" />
                              </motion.span>
                            )}
                          </AnimatePresence>
                        </motion.button>
                        <p className="text-white/30 text-xs text-center mt-4">By applying you agree to be contacted about our pilot program.</p>
                      </div>
                    </motion.div>
                  )}

                  {pilotStep === 'success' && (
                    <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="px-5 sm:px-10 py-16 sm:py-20 flex flex-col items-center text-center">
                      <div className="relative mb-8 sm:mb-10">
                        {[0, 1, 2].map(i => (
                          <motion.div key={i} className="absolute inset-0 rounded-full" style={{ border: '2px solid rgba(232,184,74,0.3)' }} animate={{ scale: [1, 2 + i * 0.3], opacity: [0.8, 0] }} transition={{ duration: 2, repeat: Infinity, delay: i * 0.4, ease: 'easeOut' }} />
                        ))}
                        <motion.div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center"
                          style={{ background: 'linear-gradient(135deg, rgba(232,184,74,0.2), rgba(232,184,74,0.1))', border: '3px solid rgba(232,184,74,0.6)', boxShadow: '0 0 40px rgba(232,184,74,0.4)' }}
                          initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}>
                          <motion.svg className="w-10 h-10 sm:w-12 sm:h-12" viewBox="0 0 24 24" fill="none" stroke="#E8B84A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <motion.path d="M5 13l4 4L19 7" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6, delay: 0.4, ease: 'easeInOut' }} />
                          </motion.svg>
                        </motion.div>
                      </div>
                      <motion.h2 className="text-3xl sm:text-4xl font-bold text-white mb-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>You're on the list!</motion.h2>
                      <motion.p className="text-white/60 text-sm sm:text-base max-w-md leading-relaxed mb-2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
                        We've saved <span style={{ color: '#E8B84A' }} className="font-semibold">{pilotEmail}</span>
                      </motion.p>
                      <motion.p className="text-white/45 text-sm max-w-md leading-relaxed mb-10 sm:mb-12" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
                        Expect a personal message from our team before March 2026. Only 20 spots are available — we'll be in touch soon.
                      </motion.p>
                      <motion.button onClick={closePilotOverlay} className="px-8 sm:px-10 py-3.5 sm:py-4 rounded-xl font-bold text-black text-base relative overflow-hidden"
                        style={{ background: 'linear-gradient(135deg, #E8B84A, #E8A87C)', boxShadow: '0 4px 20px rgba(232,184,74,0.4)' }}
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}>
                        <span className="relative z-10">Back to the site</span>
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ══ PRODUCT DETAILS ══ */}
        <AnimatePresence mode="wait">
          {selectedProduct && (
            <ProductDetailsSection
              key={`product-${selectedProduct.id}`}
              product={selectedProduct}
              products={filteredProducts}
              onSelectProduct={(prod) => {
                setSelectedProduct(prod);
                setShouldScrollToDetails(true);
                setTimeout(() => document.querySelector('[data-products-section]')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
              }}
              ref={productDetailsRef}
            />
          )}
        </AnimatePresence>

        {selectedProduct && (
          <div className="relative z-10 w-full">
            {selectedCategory === 'category3' ? <WaitlistSection /> : <BookADemo />}
          </div>
        )}
      </div>

      <Footer />
      <Chatbot />
    </div>
  );
}

// ══ ORBITAL DISPLAY (desktop) ══
function OrbitalDisplay({ filteredProducts, activeCategory, hoveredProduct, setHoveredProduct, hoverTimeoutRef, onSelectProduct }: {
  filteredProducts: typeof products;
  activeCategory: typeof categories[0];
  hoveredProduct: number | null;
  setHoveredProduct: (id: number | null) => void;
  hoverTimeoutRef: React.MutableRefObject<ReturnType<typeof setTimeout> | null>;
  onSelectProduct: (p: typeof products[0]) => void;
}) {
  return (
    <div className="relative" style={{ width: '520px', height: '520px' }}>
      {/* Central circle */}
      <motion.div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 80, damping: 12 }}>
        <div className="relative w-24 h-24">
          <motion.div className="absolute inset-0 rounded-full" style={{ border: `2px solid ${activeCategory.color}40`, boxShadow: `0 0 30px ${activeCategory.color}30, inset 0 0 30px ${activeCategory.color}20` }} animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 3, repeat: Infinity }} />
          <motion.div className="absolute inset-3 rounded-full" style={{ background: `radial-gradient(circle, ${activeCategory.color}20, transparent)`, border: `1px solid ${activeCategory.color}60` }} animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity }} />
        </div>
      </motion.div>

      {/* Rings */}
      {[0, 1].map(ringIndex => {
        const radius = 135 + ringIndex * 45;
        return (
          <motion.div key={ringIndex} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
            style={{ width: radius * 2, height: radius * 2, border: `1px solid ${activeCategory.color}15` }}
            initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1, rotate: ringIndex % 2 === 0 ? 360 : -360 }}
            transition={{ scale: { duration: 0.8, delay: ringIndex * 0.1 }, opacity: { duration: 0.8, delay: ringIndex * 0.1 }, rotate: { duration: 50 + ringIndex * 10, repeat: Infinity, ease: 'linear' } }} />
        );
      })}

      {/* Agent nodes */}
      {filteredProducts.map((product, index) => {
        const total = filteredProducts.length;
        const angle = (index / total) * Math.PI * 2 - Math.PI / 2;
        const r = 185;
        const x = Math.cos(angle) * r, y = Math.sin(angle) * r;
        const isHovered = hoveredProduct === product.id;
        const isDimmed = hoveredProduct !== null && hoveredProduct !== product.id;
        return (
          <motion.div key={product.id} className="absolute left-1/2 top-1/2" style={{ x: x - 68, y: y - 68 }}
            initial={{ opacity: 0, scale: 0 }} animate={{ opacity: isDimmed ? 0.3 : 1, scale: 1 }}
            transition={{ delay: index * 0.15, type: 'spring', stiffness: 100, opacity: { duration: 0.3 }, scale: { duration: 0.3 } }}
            onMouseEnter={() => { if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current); setHoveredProduct(product.id); }}
            onMouseLeave={() => { hoverTimeoutRef.current = setTimeout(() => setHoveredProduct(null), 180); }}
            onClick={() => onSelectProduct(product)}>
            <AgenticNode product={product} isActive={isHovered} index={index} size={136} />
          </motion.div>
        );
      })}

      {/* Connection lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {filteredProducts.map((product, index) => {
          const total = filteredProducts.length;
          const angle = (index / total) * Math.PI * 2 - Math.PI / 2;
          const r = 185, cx = 260;
          const x1 = Math.cos(angle) * r + cx, y1 = Math.sin(angle) * r + cx;
          const ni = (index + 1) % total;
          const na = (ni / total) * Math.PI * 2 - Math.PI / 2;
          const x2 = Math.cos(na) * r + cx, y2 = Math.sin(na) * r + cx;
          const isDimmed = hoveredProduct !== null && hoveredProduct !== product.id && hoveredProduct !== filteredProducts[ni].id;
          return (
            <motion.g key={`line-${index}`}>
              <motion.line x1={x1} y1={y1} x2={x2} y2={y2} stroke={`${activeCategory.color}${isDimmed ? '10' : '20'}`} strokeWidth="1" initial={{ pathLength: 0 }} animate={{ pathLength: 1, opacity: isDimmed ? 0.3 : 1 }} transition={{ duration: 1, delay: index * 0.2 }} />
              <motion.circle r="3" fill={activeCategory.color} filter="blur(2px)" animate={{ cx: [x1, x2, x1], cy: [y1, y2, y1], opacity: isDimmed ? [0, 0.3, 0.3, 0] : [0, 1, 1, 0] }} transition={{ duration: 3, delay: index * 0.5, repeat: Infinity, ease: 'linear' }} />
            </motion.g>
          );
        })}
        {filteredProducts.map((product, index) => {
          const total = filteredProducts.length;
          const angle = (index / total) * Math.PI * 2 - Math.PI / 2;
          const r = 185, cx = 260;
          const x = Math.cos(angle) * r + cx, y = Math.sin(angle) * r + cx;
          const isHighlighted = hoveredProduct === product.id;
          const isDimmed = hoveredProduct !== null && hoveredProduct !== product.id;
          return (
            <motion.line key={`center-${index}`} x1={cx} y1={cx} x2={x} y2={y}
              stroke={isHighlighted ? `${activeCategory.color}60` : `${activeCategory.color}${isDimmed ? '08' : '15'}`}
              strokeWidth={isHighlighted ? "2" : "1"} strokeDasharray="4,4"
              initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: isDimmed ? 0.3 : 1 }} transition={{ duration: 0.8, delay: index * 0.1 }} />
          );
        })}
      </svg>

      {/* Hover info box */}
      <AnimatePresence>
        {hoveredProduct !== null && (
          <motion.div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-64 rounded-2xl overflow-hidden z-50"
            style={{ background: 'linear-gradient(135deg, rgba(0,0,0,0.95), rgba(10,5,15,0.98))', border: `1px solid ${products.find(p => p.id === hoveredProduct)?.color}60`, backdropFilter: 'blur(20px)', boxShadow: `0 20px 80px ${products.find(p => p.id === hoveredProduct)?.color}40` }}
            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} transition={{ duration: 0.2 }}
            onMouseEnter={() => { if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current); }}
            onMouseLeave={() => { hoverTimeoutRef.current = setTimeout(() => setHoveredProduct(null), 100); }}>
            {(() => {
              const product = products.find(p => p.id === hoveredProduct);
              if (!product) return null;
              return (
                <>
                  <div className="h-1" style={{ background: `linear-gradient(90deg, ${product.color}, transparent)` }} />
                  <div className="p-5">
                    <h4 className="text-white font-bold text-base mb-1">{product.name}</h4>
                    <p className="text-white/60 text-xs mb-3">{product.tagline}</p>
                    <motion.button className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer"
                      style={{ background: `${product.color}20`, border: `1px solid ${product.color}40` }}
                      whileHover={{ background: `${product.color}35`, scale: 1.02 }} whileTap={{ scale: 0.97 }}
                      onClick={() => { onSelectProduct(product); setHoveredProduct(null); }}>
                      <span className="text-white text-xs font-semibold">Click to learn more</span>
                      <MoveRight className="w-3.5 h-3.5" style={{ color: product.color }} />
                    </motion.button>
                  </div>
                </>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ══ AGENTIC NODE ══
function AgenticNode({ product, isActive, index, size = 144 }: { product: typeof products[0]; isActive: boolean; index: number; size?: number; }) {
  const AgenticIcon = product.icon;
  const iconSize = Math.round(size * 0.33);
  const fontSize = size < 120 ? 'text-[9px]' : 'text-xs';
  return (
    <motion.div className="cursor-pointer" style={{ width: size, height: size }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
      <div className="w-full h-full rounded-2xl p-3 relative overflow-hidden transition-all duration-300"
        style={{ background: isActive ? `linear-gradient(135deg, ${product.color}25, ${product.color}10)` : 'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04))', border: `2px solid ${isActive ? product.color + '80' : product.color + '30'}`, boxShadow: isActive ? `0 8px 32px ${product.color}50, inset 0 0 24px ${product.color}20` : `0 4px 16px ${product.color}20`, backdropFilter: 'blur(10px)' }}>
        {isActive && (<motion.div className="absolute inset-0" style={{ background: `radial-gradient(circle at 50% 50%, ${product.color}20, transparent)` }} animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }} />)}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100">
          {["M5,5 L20,5 M5,5 L5,20", "M95,5 L80,5 M95,5 L95,20", "M5,95 L20,95 M5,95 L5,80", "M95,95 L80,95 M95,95 L95,80"].map((d, i) => (
            <motion.path key={i} d={d} stroke={product.color} strokeWidth="1.5" strokeOpacity={isActive ? "1" : "0.5"} strokeLinecap="square" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: index * 0.1 + i * 0.1, duration: 0.5 }} />
          ))}
        </svg>
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center">
          <div className="relative mb-2">
            <motion.div className="absolute inset-0 blur-xl" style={{ background: product.color, opacity: isActive ? 0.6 : 0.3 }} animate={isActive ? { scale: [1, 1.2, 1] } : {}} transition={{ duration: 2, repeat: Infinity }} />
            <AgenticIcon style={{ width: iconSize, height: iconSize, color: product.color, filter: `drop-shadow(0 0 6px ${product.color})` }} className="relative z-10" />
          </div>
          <div className={`text-white ${fontSize} font-bold leading-tight px-1`}>{product.name.split(' ').slice(0, 6).join(' ')}</div>
          <div className="flex gap-1 mt-1.5">
            {[0, 1, 2].map(i => (<motion.div key={i} className="w-1 h-1 rounded-full" style={{ backgroundColor: product.color }} animate={{ opacity: [0.3, 1, 0.3], scale: [1, 1.5, 1] }} transition={{ duration: 1.5, delay: i * 0.2, repeat: Infinity }} />))}
          </div>
        </div>
        {isActive && (<>
          <motion.div className="absolute inset-0 rounded-2xl" style={{ border: `2px solid ${product.color}` }} initial={{ scale: 1, opacity: 0.8 }} animate={{ scale: 1.4, opacity: 0 }} transition={{ duration: 1.2, repeat: Infinity }} />
          <motion.div className="absolute inset-0 rounded-2xl" style={{ border: `2px solid ${product.color}` }} initial={{ scale: 1, opacity: 0.6 }} animate={{ scale: 1.4, opacity: 0 }} transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }} />
        </>)}
      </div>
    </motion.div>
  );
}

// ══ PRODUCT DETAILS SECTION ══
const ProductDetailsSection = forwardRef<
  HTMLDivElement,
  { product: typeof products[0]; products: typeof products; onSelectProduct: (p: typeof products[0]) => void }
>(({ product, products, onSelectProduct }, ref) => {
  const featureIcons = [Sparkles, Target, Users, BarChart3, TrendingUp, Zap, Bot, MoveRight, Check];
  const otherProducts = products.filter(p => p.id !== product.id).slice(0, 2);
  const productImg = getProductImage(product.category);
  const brandName = getBrandName(product.category);

  return (
    <motion.div ref={ref} className="relative z-10 py-12 sm:py-16 lg:py-24 px-4 sm:px-6 w-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="max-w-7xl mx-auto mb-10 sm:mb-16 lg:mb-24" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }} />
      <div className="max-w-7xl mx-auto">

        {/* ── Product Hero ── */}
        <motion.div className="mb-12 sm:mb-16 lg:mb-28" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, amount: 0.2 }} transition={{ duration: 0.6 }}>
          {/* Mobile */}
          <div className="flex flex-col gap-6 lg:hidden">
            <div className="text-center">
              <h2 className="text-2xl sm:text-3xl font-light text-white mb-3 leading-tight">{product.name}</h2>
              <p className="text-sm sm:text-base text-white/55 leading-relaxed mb-4 max-w-lg mx-auto">{product.description}</p>
              <div className="flex items-center gap-2 justify-center">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: product.color }} />
                <span className="text-white/40 text-sm">Premium features included</span>
              </div>
            </div>
            <div className="w-full rounded-2xl overflow-hidden" style={{ background: `linear-gradient(135deg, ${product.color}14, ${product.color}06)`, border: `1px solid ${product.color}25` }}>
              <img src={productImg} alt={brandName} className="w-full h-auto block" />
            </div>
          </div>

          {/* Desktop */}
          <div className="hidden lg:grid lg:grid-cols-2 lg:gap-16 xl:gap-20 lg:items-center">
            <div>
              <h2 className="text-4xl xl:text-5xl font-light text-white mb-6 leading-tight">{product.name}</h2>
              <p className="text-base xl:text-lg text-white/55 leading-relaxed mb-8">{product.description}</p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: product.color }} />
                <span className="text-white/40 text-sm">Premium features included</span>
              </div>
            </div>
            <div className="w-full rounded-3xl overflow-hidden"
              style={{ background: `linear-gradient(135deg, ${product.color}14, ${product.color}06)`, border: `1px solid ${product.color}25`, boxShadow: `0 40px 80px ${product.color}25, 0 0 0 1px ${product.color}10` }}>
              <img src={productImg} alt={brandName} className="w-full h-auto block" />
            </div>
          </div>
        </motion.div>

        {/* ── How It Works ── */}
        <motion.div id="how-it-works" className="mb-12 sm:mb-16 lg:mb-28" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, amount: 0.2 }} transition={{ duration: 0.6 }}>
          {/* Mobile */}
          <div className="flex flex-col gap-5 lg:hidden">
            <div>
              <h3 className="text-2xl sm:text-3xl font-light text-white mb-1">How does</h3>
              <div className="text-2xl sm:text-3xl font-semibold mb-3" style={{ color: product.color }}>{brandName} work?</div>
              <p className="text-sm text-white/50 leading-relaxed">Core capabilities designed to save time, reduce effort, and deliver results.</p>
            </div>
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
              {product.features.map((feat, idx) => {
                const FeatureIcon = featureIcons[idx % featureIcons.length];
                return (
                  <motion.div key={idx} className="py-4 flex gap-4 items-start" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
                    initial={{ opacity: 0, x: 16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: false, amount: 0.2 }} transition={{ delay: idx * 0.07 }}>
                    <div className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center" style={{ background: `${product.color}18`, border: `1px solid ${product.color}30` }}>
                      <FeatureIcon className="w-4 h-4" style={{ color: product.color }} />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white mb-0.5">{feat}</h4>
                      <p className="text-white/45 text-xs leading-relaxed">Provides {feat.toLowerCase()} to streamline processes and save time.</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Desktop */}
          <div className="hidden lg:grid lg:grid-cols-3 lg:gap-14 lg:items-start">
            <div className="self-start lg:sticky lg:top-32">
              <h3 className="text-3xl xl:text-4xl font-light text-white mb-3">
                How does
                <div className="text-3xl xl:text-4xl font-semibold mt-2" style={{ color: product.color }}>{brandName} work?</div>
              </h3>
              <p className="text-base text-white/50 leading-relaxed">A breakdown of core capabilities — each designed to save time, reduce manual effort, and deliver measurable results.</p>
            </div>
            <div className="lg:col-span-2 w-full" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
              {product.features.map((feat, idx) => {
                const FeatureIcon = featureIcons[idx % featureIcons.length];
                return (
                  <motion.div key={idx} className="py-5 flex gap-6 items-start" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
                    initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: false, amount: 0.2 }} transition={{ delay: idx * 0.07 }}>
                    <div className="w-11 h-11 rounded-xl flex-shrink-0 flex items-center justify-center" style={{ background: `${product.color}18`, border: `1px solid ${product.color}30` }}>
                      <FeatureIcon className="w-5 h-5" style={{ color: product.color }} />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-1">{feat}</h4>
                      <p className="text-white/45 text-sm leading-relaxed">Provides {feat.toLowerCase()} to streamline processes, increase accuracy, and save time.</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* ── Demo Section ── */}
        <motion.div className="mb-12 sm:mb-16 lg:mb-28" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, amount: 0.2 }} transition={{ duration: 0.6 }}>
          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-light text-white text-center mb-8 sm:mb-10">
            See <span style={{ color: product.color }}>{product.name}</span> in action
          </h3>
          {product.id === 1 ? (
            <div className="relative w-full overflow-hidden rounded-xl sm:rounded-2xl" style={{ paddingTop: '56.25%' }}>
              <iframe src="https://app.supademo.com/embed/cmlqpvjs63bf5egrdgc2zf548?embed_v=2&utm_source=embed" loading="lazy" title="Master Social Media Marketing with AI-Powered Content Creation" allow="clipboard-write" frameBorder="0" allowFullScreen className="absolute inset-0 w-full h-full" />
            </div>
          ) : product.category === 'category2' ? (
            <div className="relative w-full overflow-hidden rounded-xl sm:rounded-2xl" style={{ paddingTop: '56.25%' }}>
              <iframe src="https://app.supademo.com/embed/cmlpd72lu1d20egrdab9h62t3?embed_v=2&utm_source=embed" loading="lazy" title="Revalidate Rejected Candidates Through Job Applicant Review" allow="clipboard-write" frameBorder="0" allowFullScreen className="absolute inset-0 w-full h-full" />
            </div>
          ) : (
            <div className="w-full rounded-2xl flex items-center justify-center" style={{ height: 'clamp(180px, 35vw, 460px)', background: `linear-gradient(135deg, ${product.color}10, ${product.color}04)`, border: `1px solid ${product.color}18` }}>
              <div className="text-center opacity-40">
                <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: `${product.color}25`, border: `2px solid ${product.color}50` }}>
                  <span className="text-2xl sm:text-4xl">▶</span>
                </div>
                <p className="text-white text-sm">Demo video coming soon</p>
              </div>
            </div>
          )}
        </motion.div>

        {/* ── Other Solutions ── */}
        <motion.div className="mb-10 sm:mb-14" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false, amount: 0.3 }} transition={{ duration: 0.6 }}>
          {/* Mobile */}
          <div className="flex flex-col gap-5 lg:hidden">
            <div>
              <p className="text-white/40 text-sm mb-1">Not what you're looking for?</p>
              <h3 className="text-2xl sm:text-3xl font-light text-white">
                Other <span style={{ color: product.color }}>solutions</span>
              </h3>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              {otherProducts.map(prod => (
                <motion.button key={prod.id} onClick={() => onSelectProduct(prod)}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  className="flex-1 p-4 rounded-2xl text-left transition-all"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = prod.color + '60'; (e.currentTarget as HTMLElement).style.background = `${prod.color}0D`; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.1)'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; }}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <prod.icon className="w-4 h-4 flex-shrink-0" style={{ color: prod.color }} />
                    <h4 className="text-sm font-semibold text-white leading-tight">{prod.name}</h4>
                  </div>
                  <p className="text-xs text-white/40 leading-relaxed">{prod.tagline}</p>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Desktop — full width layout */}
          <div className="hidden lg:flex lg:items-center lg:gap-14">
            <div className="w-72 xl:w-80 flex-shrink-0">
              <p className="text-white/40 text-base mb-2">Not what you're looking for?</p>
              <h3 className="text-3xl font-light text-white">
                Check our other <span style={{ color: product.color }}>solutions</span>
              </h3>
            </div>
            <div className="flex-1 flex gap-5">
              {otherProducts.map(prod => (
                <motion.button key={prod.id} onClick={() => onSelectProduct(prod)}
                  whileHover={{ scale: 1.02, y: -4 }} whileTap={{ scale: 0.98 }}
                  className="flex-1 px-7 py-6 rounded-xl text-left transition-all min-h-[120px]"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = prod.color + '60'; (e.currentTarget as HTMLElement).style.background = `${prod.color}0D`; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.1)'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'; }}>
                  <div className="flex items-center gap-2 mb-2">
                    <prod.icon className="w-5 h-5 flex-shrink-0" style={{ color: prod.color }} />
                    <h4 className="text-base font-semibold text-white leading-tight">{prod.name}</h4>
                  </div>
                  <p className="text-sm text-white/40 leading-relaxed">{prod.tagline}</p>
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        <CreateBundleSection product={product} />
      </div>
    </motion.div>
  );
});

ProductDetailsSection.displayName = 'ProductDetailsSection';