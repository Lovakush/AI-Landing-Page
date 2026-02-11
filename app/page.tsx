'use client';

import { motion, useScroll, useTransform, animate, useInView } from 'framer-motion';
import { useRef, MouseEvent, useEffect, useState, useMemo } from 'react';
import { ShaderAnimation } from "@/components/ui/shader-lines";
import RadialOrbitalTimeline from "@/components/ui/radial-orbital-timeline";
import { Users, Target, Box, Bot, Zap, ScanSearch, Rocket, MoveRight, Brain, BookOpen, Lightbulb } from 'lucide-react';
import Link from 'next/link';
import Chatbot from '@/components/ui/chatbot';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';


const CountUp = ({ to, duration = 2, suffix = "", prefix = "" }: { to: number, duration?: number, suffix?: string, prefix?: string }) => {
  const nodeRef = useRef<HTMLSpanElement>(null);
  const inView = useInView(nodeRef, { once: true, margin: "-20px" });

  useEffect(() => {
    if (!inView) return;

    const node = nodeRef.current;
    if (!node) return;

    const controls = animate(0, to, {
      duration: duration,
      onUpdate(value) {
        node.textContent = `${prefix}${Math.floor(value)}${suffix}`;
      }
    });

    return () => controls.stop();
  }, [inView, to, duration, prefix, suffix]);

  return <span ref={nodeRef} />;
};

// Animated words for hero
const heroWords = ["powerful", "intelligent", "automated", "seamless", "efficient"];

// Robot chat messages - cycle through these
const robotChats = {
  argo: [
    "Found 12 hot leads!",
    "Deal closing at 87%",
    "Revenue up 23%",
    "3 meetings booked!",
  ],
  mark: [
    "Campaign launched! 🚀",
    "Posts scheduled!",
    "Engagement +45%",
    "Trending now! 📈",
  ],
  consuelo: [
    "50 resumes screened!",
    "Top 5 candidates ready",
    "Interview scheduled",
    "Skills matched! ✨",
  ],
};

// Product timeline data for RadialOrbitalTimeline
const productTimelineData = [
  { id: 1, title: "Accelerators", icon: Rocket },
  { id: 2, title: "AI Agents", icon: Bot },
  { id: 3, title: "AI Labs", icon: Brain },
  { id: 4, title: "Workshops", icon: Lightbulb },
  { id: 5, title: "Coaching", icon: BookOpen },
];

// Product KPI data
const productKPIs: Record<number, { description: string; kpis: { value: string; label: string }[] }> = {
  1: {
    description: "Pre-built solution templates that compress months of AI implementation into weeks. Tested frameworks, not blank-slate experiments.",
    kpis: [
      { value: "2 weeks", label: "from kickoff to first results" },
      { value: "70%", label: "less implementation effort vs. custom builds" },
      { value: "5x", label: "faster time-to-value" },
    ],
  },
  2: {
    description: "Autonomous workflows that handle repetitive operational tasks in HR, Marketing, and Procurement — end-to-end, no babysitting required.",
    kpis: [
      { value: "80%", label: "operational work automated" },
      { value: "20+ hrs", label: "saved per team member monthly" },
      { value: "90%+", label: "task accuracy" },
    ],
  },
  3: {
    description: "Rapid prototyping environment to test and validate AI use cases before committing to full deployment. Fail fast, invest smart.",
    kpis: [
      { value: "48 hrs", label: "from idea to working prototype" },
      { value: "5+", label: "use cases tested per engagement" },
      { value: "60%", label: "reduction in failed AI investments" },
    ],
  },
  4: {
    description: "Structured sessions to identify your highest-impact automation opportunities and build an actionable roadmap — in a single day.",
    kpis: [
      { value: "1 day", label: "to a prioritized AI roadmap" },
      { value: "Top 5", label: "automation opportunities identified" },
      { value: "100%", label: "of participants leave with clear next steps" },
    ],
  },
  5: {
    description: "Hands-on guidance to help your team confidently adopt and scale AI within their existing workflows.",
    kpis: [
      { value: "3x", label: "faster team adoption" },
      { value: "85%", label: "of teams self-sufficient within 30 days" },
      { value: "40%", label: "increase in AI tool utilization" },
    ],
  },
};

// AI Agents data
const aiAgentsData = [
  {
    id: 'argo',
    name: 'Argo',
    role: 'Sales Intelligence',
    shortDesc: 'Only work deals that close',
    description: 'Prospects sound great until they don\'t. Argo scores & disputes every lead so your team stops chasing ghosts and only works deals that close.',
    features: ['Lead Generation', 'Product Matching', 'Machine Learning', 'Next-Best-Action'],
    color: '#E8B84A',
    icon: Target,
    dashboardImg: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
  },
  {
    id: 'mark',
    name: 'Mark',
    role: 'Marketing Intelligence',
    shortDesc: 'Campaigns that convert',
    description: 'Spot the spike. Own the feed. Mark scans live trends, drafts scroll-stopping posts, and runs campaigns that actually convert — while you sleep.',
    features: ['Live-Trend Radar', 'AI Post Generator', 'Engagement Predictor', 'Smart Scheduler'],
    color: '#A855F7',
    icon: Zap,
    dashboardImg: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80',
  },
  {
    id: 'consuelo',
    name: 'Consuelo',
    role: 'HR Intelligence',
    shortDesc: 'Screens 1000 resumes by 9am',
    description: 'Great talent hides before lunch. Consuelo screens 1000 resumes by 9am, scores soft skills and flags who to call first — bias-free.',
    features: ['Resume Parser', 'Smart Filter', 'AI Soft-Skills Test', 'Hiring Insights'],
    color: '#06B6D4',
    icon: Users,
    dashboardImg: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
  },
];

export default function OpseraLanding() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [wordIndex, setWordIndex] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState<number | null>(2);
  const [selectedAgent, setSelectedAgent] = useState<string | null>('argo');
  const [showAgentDetails, setShowAgentDetails] = useState(false);
  const [chatTick, setChatTick] = useState(0);
  const [showAccessModal, setShowAccessModal] = useState(false);
  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [navVisible, setNavVisible] = useState(true);
  const lastScrollY = useRef(0);

  // Auto-hide navbar on scroll
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY < lastScrollY.current || currentScrollY < 100) {
        setNavVisible(true);
      } else if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setNavVisible(false);
      }
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Single timer for all robot chat cycling - prevents multiple interval conflicts
  useEffect(() => {
    const interval = setInterval(() => {
      setChatTick(prev => prev + 1);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Auto-rotate agents every 10 seconds (pause when details modal is open)
  useEffect(() => {
    if (showAgentDetails) return; // Don't rotate when modal is open

    const interval = setInterval(() => {
      setSelectedAgent(prev => {
        const currentIndex = aiAgentsData.findIndex(a => a.id === prev);
        const nextIndex = (currentIndex + 1) % aiAgentsData.length;
        return aiAgentsData[nextIndex].id;
      });
    }, 10000);
    return () => clearInterval(interval);
  }, [showAgentDetails]);

  // Auto-advance products every 25 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setSelectedProduct(prev => {
        if (prev === null) return 1;
        const currentIndex = productTimelineData.findIndex(p => p.id === prev);
        const nextIndex = (currentIndex + 1) % productTimelineData.length;
        return productTimelineData[nextIndex].id;
      });
    }, 25000);
    return () => clearTimeout(timer);
  }, [selectedProduct]);

  // Prevent deselection — always keep a product selected
  const handleProductSelect = (id: number | null) => {
    if (id !== null) {
      setSelectedProduct(id);
    }
  };

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  // Rotate words
  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % heroWords.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  // Get selected product data
  const selectedProductData = selectedProduct ? {
    ...productTimelineData.find(p => p.id === selectedProduct),
    ...productKPIs[selectedProduct]
  } : null;

  return (
    <div ref={containerRef} className="bg-[#0d0015] min-h-screen w-full overflow-x-hidden">
      <Navbar/>

      {/* Hero Section with Shader Background */}
      <section
        className="relative min-h-screen flex items-center overflow-hidden"
      >
        {/* Shader Animation Background - Full opacity */}
        <div className="absolute inset-0 z-0">
          <ShaderAnimation />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center pt-20">
          {/* Left - Text Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-start gap-6"
          >
            {/* Main Heading with Animated Word */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl tracking-tighter text-left font-light text-white">
              <span>Operations made</span>
              <div className="relative w-full h-[1.2em]">
                {heroWords.map((word, index) => (
                  <motion.span
                    key={word}
                    className="absolute inset-0 flex items-center justify-start font-semibold bg-gradient-to-r from-[#E8B84A] to-[#E8A87C] bg-clip-text text-transparent"
                    initial={{ opacity: 0, y: 50 }}
                    animate={
                      wordIndex === index
                        ? { y: 0, opacity: 1 }
                        : { y: wordIndex > index ? -50 : 50, opacity: 0 }
                    }
                    transition={{ type: "spring", stiffness: 100, damping: 20 }}
                  >
                    {word}
                  </motion.span>
                ))}
              </div>
            </h1>

            {/* Subtitle */}
            <p className="text-base md:text-lg leading-relaxed tracking-tight text-white/70 max-w-md text-left font-light">
              Domain-specific AI agents that deliver clarity and automation in 30 days — not 6 months.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mt-2">
              <motion.button
                onClick={() => {
                  document.getElementById('cta')?.scrollIntoView({ behavior: 'smooth' });
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm border border-white/30 text-white px-6 py-3 rounded-full text-sm hover:bg-white/20 transition-all"
              >
                Book a Demo
              </motion.button>
              <Link href="/about">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#6B4E9B] to-[#2D1B4E] text-white font-semibold px-6 py-3 rounded-full text-sm shadow-[0_0_30px_rgba(107,78,155,0.4)] hover:shadow-[0_0_50px_rgba(107,78,155,0.6)] transition-all"
                >
                  Read our launch article <MoveRight className="w-4 h-4" />
                </motion.button>
              </Link>
            </div>
          </motion.div>

          {/* Right - Friendly Robot Agents */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="relative h-[400px] hidden lg:flex items-center justify-center"
          >
            <div className="relative w-full h-full">
              {/* Argo Robot - Gold - Top Left */}
              <motion.div
                className="absolute top-8 left-4"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="relative">
                  {/* Robot Head/Body */}
                  <div className="w-20 h-24 rounded-3xl bg-gradient-to-b from-[#E8B84A] to-[#d4a43d] shadow-xl relative">
                    {/* Face plate */}
                    <div className="absolute top-3 left-2 right-2 bottom-6 bg-[#2D1B4E]/10 rounded-2xl flex flex-col items-center justify-center gap-1">
                      {/* Eyes */}
                      <div className="flex gap-3">
                        <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-[#2D1B4E] rounded-full" />
                        </div>
                        <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-[#2D1B4E] rounded-full" />
                        </div>
                      </div>
                      {/* Smile */}
                      <div className="w-6 h-3 border-b-2 border-[#2D1B4E]/40 rounded-b-full mt-1" />
                    </div>
                    {/* Ears/Sides */}
                    <div className="absolute -left-1 top-8 w-2 h-6 bg-[#c9983a] rounded-full" />
                    <div className="absolute -right-1 top-8 w-2 h-6 bg-[#c9983a] rounded-full" />
                  </div>
                  {/* Antenna */}
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex flex-col items-center">
                    <div className="w-3 h-3 bg-[#E8B84A] rounded-full shadow-lg shadow-[#E8B84A]/50" />
                    <div className="w-1 h-3 bg-[#c9983a]" />
                  </div>
                </div>
                {/* Chat Bubble */}
                <div className="absolute left-full ml-2 top-2 bg-white/95 backdrop-blur-sm rounded-2xl px-3 py-2 shadow-lg shadow-[#E8B84A]/20 min-w-max">
                  <p className="text-sm text-[#2D1B4E] font-semibold">{robotChats.argo[chatTick % robotChats.argo.length]}</p>
                  <div className="absolute left-0 top-4 -translate-x-1 w-2 h-2 bg-white/95 rotate-45" />
                </div>
              </motion.div>

              {/* Mark Robot - Purple - Right */}
              <motion.div
                className="absolute top-1/2 -translate-y-1/2 right-4"
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              >
                <div className="relative">
                  {/* Robot Head/Body */}
                  <div className="w-18 h-22 rounded-3xl bg-gradient-to-b from-[#A855F7] to-[#8B5CF6] shadow-xl relative" style={{ width: '72px', height: '88px' }}>
                    {/* Face plate */}
                    <div className="absolute top-2.5 left-2 right-2 bottom-5 bg-white/10 rounded-2xl flex flex-col items-center justify-center gap-1">
                      {/* Eyes */}
                      <div className="flex gap-2.5">
                        <div className="w-3.5 h-3.5 bg-white rounded-full flex items-center justify-center">
                          <div className="w-1.5 h-1.5 bg-[#2D1B4E] rounded-full" />
                        </div>
                        <div className="w-3.5 h-3.5 bg-white rounded-full flex items-center justify-center">
                          <div className="w-1.5 h-1.5 bg-[#2D1B4E] rounded-full" />
                        </div>
                      </div>
                      {/* Smile */}
                      <div className="w-5 h-2.5 border-b-2 border-white/50 rounded-b-full mt-0.5" />
                    </div>
                    {/* Ears */}
                    <div className="absolute -left-1 top-6 w-2 h-5 bg-[#7c3aed] rounded-full" />
                    <div className="absolute -right-1 top-6 w-2 h-5 bg-[#7c3aed] rounded-full" />
                  </div>
                  {/* Antenna */}
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 flex flex-col items-center">
                    <div className="w-2.5 h-2.5 bg-[#A855F7] rounded-full shadow-lg shadow-[#A855F7]/50" />
                    <div className="w-1 h-2.5 bg-[#7c3aed]" />
                  </div>
                </div>
                {/* Chat Bubble */}
                <div className="absolute right-full mr-2 top-2 bg-white/95 backdrop-blur-sm rounded-2xl px-3 py-2 shadow-lg shadow-[#A855F7]/20 min-w-max">
                  <p className="text-sm text-[#2D1B4E] font-semibold">{robotChats.mark[(chatTick + 1) % robotChats.mark.length]}</p>
                  <div className="absolute right-0 top-4 translate-x-1 w-2 h-2 bg-white/95 rotate-45" />
                </div>
              </motion.div>

              {/* Consuelo Robot - Cyan - Bottom */}
              <motion.div
                className="absolute bottom-8 left-1/3"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              >
                <div className="relative">
                  {/* Robot Head/Body */}
                  <div className="w-16 h-20 rounded-3xl bg-gradient-to-b from-[#06B6D4] to-[#0891B2] shadow-xl relative">
                    {/* Face plate */}
                    <div className="absolute top-2 left-1.5 right-1.5 bottom-4 bg-white/10 rounded-2xl flex flex-col items-center justify-center gap-1">
                      {/* Eyes */}
                      <div className="flex gap-2">
                        <div className="w-3 h-3 bg-white rounded-full flex items-center justify-center">
                          <div className="w-1.5 h-1.5 bg-[#2D1B4E] rounded-full" />
                        </div>
                        <div className="w-3 h-3 bg-white rounded-full flex items-center justify-center">
                          <div className="w-1.5 h-1.5 bg-[#2D1B4E] rounded-full" />
                        </div>
                      </div>
                      {/* Smile */}
                      <div className="w-4 h-2 border-b-2 border-white/50 rounded-b-full" />
                    </div>
                    {/* Ears */}
                    <div className="absolute -left-1 top-5 w-1.5 h-4 bg-[#0e7490] rounded-full" />
                    <div className="absolute -right-1 top-5 w-1.5 h-4 bg-[#0e7490] rounded-full" />
                  </div>
                  {/* Antenna */}
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex flex-col items-center">
                    <div className="w-2 h-2 bg-[#06B6D4] rounded-full shadow-lg shadow-[#06B6D4]/50" />
                    <div className="w-0.5 h-2 bg-[#0e7490]" />
                  </div>
                </div>
                {/* Chat Bubble */}
                <div className="absolute left-full ml-2 top-0 bg-white/95 backdrop-blur-sm rounded-2xl px-3 py-2 shadow-lg shadow-[#06B6D4]/20 min-w-max">
                  <p className="text-sm text-[#2D1B4E] font-semibold">{robotChats.consuelo[(chatTick + 2) % robotChats.consuelo.length]}</p>
                  <div className="absolute left-0 top-4 -translate-x-1 w-2 h-2 bg-white/95 rotate-45" />
                </div>
              </motion.div>

              {/* Simple connection lines */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: -1 }}>
                <path d="M 60 80 Q 150 150 240 160" stroke="#E8B84A" strokeWidth="2" fill="none" opacity="0.3" strokeDasharray="6,6" />
                <path d="M 240 200 Q 180 280 130 300" stroke="#A855F7" strokeWidth="2" fill="none" opacity="0.3" strokeDasharray="6,6" />
                <path d="M 130 320 Q 60 250 60 100" stroke="#06B6D4" strokeWidth="2" fill="none" opacity="0.3" strokeDasharray="6,6" />
              </svg>
            </div>
          </motion.div>
        </div>

      </section>

      {/* Products Section - Built on Reality */}
      <section className="relative py-24 px-6 overflow-hidden min-h-[700px]" style={{ background: "linear-gradient(180deg, #1a0a2e 0%, #2D1B4E 50%, #3d2a5f 100%)" }}>
        {/* Purple glow effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#A855F7]/15 rounded-full blur-[150px]" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#8B5CF6]/10 rounded-full blur-[120px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#E8B84A]/5 rounded-full blur-[180px]" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h3 className="text-4xl md:text-5xl lg:text-6xl font-light">
              <span className="text-white">Built on reality, </span>
              <span className="italic text-[#E8B84A]">not AI hype</span>
            </h3>
          </motion.div>

          {/* Interactive Layout - Orbit on right, info on left */}
          <div className="relative min-h-[600px] flex items-center">
            {/* The Orbit - Always positioned on the right */}
            <div
              className="w-full"
              style={{
                transform: 'translateX(20%) scale(0.75)',
                transformOrigin: 'center center',
              }}
            >
              <RadialOrbitalTimeline
                timelineData={productTimelineData}
                selectedId={selectedProduct}
                onSelectNode={handleProductSelect}
                isCompact={false}
              />
            </div>

            {/* Left Side - Product Info & KPIs (always visible) */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[45%]">
              {selectedProduct && selectedProductData && (
                <div className="space-y-6">
                  {/* Product Title */}
                  <div>
                    <motion.h4
                      key={`title-${selectedProduct}`}
                      className="text-3xl md:text-4xl font-semibold text-white mb-3"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      {selectedProductData.title}
                    </motion.h4>
                    <motion.p
                      key={`desc-${selectedProduct}`}
                      className="text-base text-white/70 leading-relaxed"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 }}
                    >
                      {selectedProductData.description}
                    </motion.p>
                  </div>

                  {/* KPI Cards - Stacked Vertically */}
                  <div className="flex flex-col gap-3">
                    {selectedProductData.kpis?.map((kpi, index) => (
                      <motion.div
                        key={`kpi-${selectedProduct}-${index}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 + index * 0.1 }}
                        className="group relative bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 overflow-hidden cursor-pointer hover:bg-white/10 hover:border-white/20 transition-all duration-300"
                      >
                        {/* Shine effect on hover */}
                        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12" />

                        <div className="relative flex items-center gap-4">
                          <div className="text-3xl md:text-4xl font-bold text-[#E8B84A]">
                            {kpi.value}
                          </div>
                          <div className="text-sm text-white/60">
                            {kpi.label}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* AI Agents Showcase Section - New Launches */}
      <section className="relative py-32 px-6 overflow-hidden" style={{ background: "linear-gradient(180deg, #3d2a5f 0%, #2D1B4E 15%, #2D1B4E 100%)" }}>

        {/* Purple glow effects */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[#A855F7]/10 rounded-full blur-[200px]" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-[#E8B84A]/8 rounded-full blur-[180px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#8B5CF6]/8 rounded-full blur-[150px]" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h3 className="text-4xl md:text-5xl lg:text-6xl font-light mb-4">
              <span className="text-white">New </span>
              <span className="italic text-[#E8B84A]">Launches</span>
            </h3>
            <p className="text-lg text-white/50 max-w-2xl mx-auto">
              Domain-specific AI agents for Sales, Marketing, and HR
            </p>
          </motion.div>

          {/* Interactive Layout: Stacked Cards on Left, Dashboard on Right */}
          <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[500px]">
            {/* Left - Stacked Display Cards */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.8 }}
              className="flex items-center justify-center"
            >
              <div className="grid [grid-template-areas:'stack'] place-items-center">
                {aiAgentsData.map((agent, index) => {
                  const isSelected = selectedAgent === agent.id;
                  const IconComponent = agent.icon;

                  // Stack positions like the reference:
                  // Position 0 (back): x=0, y=0
                  // Position 1 (middle): x=64, y=40
                  // Position 2 (front): x=128, y=80
                  // Selected card always goes to front (position 2)
                  const selectedIndex = aiAgentsData.findIndex(a => a.id === selectedAgent);

                  let visualPosition: number;
                  if (isSelected) {
                    visualPosition = 2; // Front position
                  } else {
                    // Distribute other cards in remaining positions (0 and 1)
                    const otherCards = aiAgentsData.filter(a => a.id !== selectedAgent);
                    const otherIndex = otherCards.findIndex(a => a.id === agent.id);
                    visualPosition = otherIndex; // 0 or 1
                  }

                  const positions = [
                    { x: 0, y: 0 },      // Back
                    { x: 64, y: 40 },    // Middle
                    { x: 128, y: 80 },   // Front
                  ];

                  const pos = positions[visualPosition];

                  return (
                    <motion.div
                      key={agent.id}
                      onClick={() => setSelectedAgent(agent.id)}
                      initial={false}
                      animate={{
                        x: pos.x,
                        y: pos.y,
                        zIndex: visualPosition + 1,
                        opacity: isSelected ? 1 : 0.6,
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 35,
                        mass: 0.8,
                      }}
                      whileHover={{ y: pos.y - 15, opacity: 1 }}
                      whileTap={{ scale: 0.98 }}
                      className={`[grid-area:stack] relative flex h-28 w-[20rem] -skew-y-[8deg] select-none items-center rounded-xl border backdrop-blur-sm px-5 py-3 cursor-pointer transition-colors duration-300
                        ${isSelected
                          ? 'bg-[#1a1a2e]/95 shadow-[0_0_40px_rgba(232,184,74,0.2)]'
                          : 'bg-[#1a1a2e]/60'
                        }
                      `}
                      style={{
                        borderColor: isSelected ? `${agent.color}40` : 'rgba(255,255,255,0.08)',
                      }}
                    >
                      {/* Gradient fade on right */}
                      <div
                        className="absolute -right-1 top-[-5%] h-[110%] w-[18rem] pointer-events-none z-20 transition-opacity duration-500"
                        style={{
                          background: `linear-gradient(to left, #2D1B4E, transparent)`,
                          opacity: isSelected ? 0 : 0.6,
                        }}
                      />

                      {/* NEW badge */}
                      {agent.id === 'argo' && (
                        <div className="absolute -top-2 -left-2 z-40">
                          <div className="relative">
                            <div className="absolute inset-0 bg-[#E8B84A] rounded-full blur-md opacity-50" />
                            <div className="relative bg-gradient-to-r from-[#E8B84A] to-[#d4a43d] text-[#0a0612] text-[10px] font-bold px-2 py-0.5 rounded-full">
                              NEW
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="relative z-30 flex items-center gap-3">
                        <span
                          className="inline-block rounded-full p-2"
                          style={{ backgroundColor: `${agent.color}25` }}
                        >
                          <IconComponent className="size-5" style={{ color: agent.color }} />
                        </span>
                        <p className="text-xl font-semibold" style={{ color: agent.color }}>{agent.name}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            {/* Right - Dashboard Screenshot (Large) */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex flex-col gap-4"
            >
              {selectedAgent && (() => {
                const agent = aiAgentsData.find(a => a.id === selectedAgent)!;

                return (
                  <>
                    <motion.div
                      key={`dashboard-${selectedAgent}`}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                      className="relative group"
                    >
                      {/* Glow effect behind */}
                      <div
                        className="absolute -inset-4 rounded-3xl blur-3xl opacity-30 transition-opacity duration-500 group-hover:opacity-50"
                        style={{ backgroundColor: agent.color }}
                      />

                      <div
                        className="relative rounded-2xl overflow-hidden border-2 shadow-2xl shadow-black/50"
                        style={{ borderColor: `${agent.color}40` }}
                      >
                        <img
                          src={agent.dashboardImg}
                          alt={`${agent.name} Dashboard`}
                          className="w-full h-[350px] object-cover"
                        />
                        {/* Overlay gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0612]/80 via-transparent to-transparent" />

                        {/* Agent info overlay at bottom with glassmorphism backdrop */}
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <div
                            className="rounded-xl p-4 backdrop-blur-md border"
                            style={{
                              backgroundColor: 'rgba(10, 6, 18, 0.6)',
                              borderColor: `${agent.color}30`,
                            }}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className="w-10 h-10 rounded-lg flex items-center justify-center"
                                style={{ backgroundColor: agent.color }}
                              >
                                <agent.icon className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <h4 className="text-lg font-bold text-white">{agent.name}</h4>
                                <p className="text-xs" style={{ color: agent.color }}>{agent.role}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    {/* More Details Button */}
                    <motion.button
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      onClick={() => setShowAgentDetails(true)}
                      className="w-full py-3 rounded-xl font-medium text-white border transition-all duration-300 hover:scale-[1.02]"
                      style={{
                        backgroundColor: `${agent.color}15`,
                        borderColor: `${agent.color}40`,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = `${agent.color}30`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = `${agent.color}15`;
                      }}
                    >
                      More Details
                    </motion.button>

                    {/* Details Modal */}
                    {showAgentDetails && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/70 backdrop-blur-sm"
                        onClick={() => setShowAgentDetails(false)}
                      >
                        <motion.div
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.9, opacity: 0 }}
                          onClick={(e) => e.stopPropagation()}
                          className="relative max-w-lg w-full rounded-2xl p-6 border"
                          style={{
                            backgroundColor: '#1a1a2e',
                            borderColor: `${agent.color}40`,
                          }}
                        >
                          {/* Close button */}
                          <button
                            onClick={() => setShowAgentDetails(false)}
                            className="absolute top-4 right-4 text-white/50 hover:text-white"
                          >
                            ✕
                          </button>

                          {/* Agent Header */}
                          <div className="flex items-center gap-4 mb-4">
                            <div
                              className="w-14 h-14 rounded-xl flex items-center justify-center"
                              style={{ backgroundColor: agent.color }}
                            >
                              <agent.icon className="w-7 h-7 text-white" />
                            </div>
                            <div>
                              <h4 className="text-2xl font-bold text-white">{agent.name}</h4>
                              <p className="text-sm" style={{ color: agent.color }}>{agent.role}</p>
                            </div>
                          </div>

                          {/* Description */}
                          <p className="text-white/80 leading-relaxed mb-6">
                            {agent.description}
                          </p>

                          {/* Features */}
                          <div className="space-y-2">
                            <p className="text-white/50 text-sm font-medium mb-3">Features</p>
                            <div className="grid grid-cols-2 gap-2">
                              {agent.features.map((feature) => (
                                <div key={feature} className="flex items-center gap-2 text-sm text-white/70">
                                  <div
                                    className="w-2 h-2 rounded-full"
                                    style={{ backgroundColor: agent.color }}
                                  />
                                  {feature}
                                </div>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      </motion.div>
                    )}
                  </>
                );
              })()}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Smooth transition from AI Agents to Market Positioning */}
      <div className="h-64" style={{ background: "linear-gradient(to bottom, #2D1B4E 0%, #3d2a5f 15%, #6b4e9b 35%, #b8a5d4 55%, #e8e0f0 75%, white 100%)" }} />

      {/* Market Positioning Section - The Intelligence Matrix */}
      <section className="relative py-32 px-6 bg-gradient-to-b from-white to-[#f5f0ff]">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <h3 className="text-5xl md:text-6xl font-light text-[#2D1B4E] mb-6 tracking-tight font-[family-name:var(--font-space-grotesk)]">
              The Intelligence Gap, Solved.
            </h3>
            <p className="text-xl text-[#2D1B4E]/60 max-w-3xl mx-auto font-light font-[family-name:var(--font-inter)] leading-relaxed">
              Too fast for enterprise suites. Too powerful for generic bots.
              <br className="hidden md:block" />
              <span className="text-[#2D1B4E] font-medium"> SIA exists in the sweet spot of execution.</span>
            </p>
          </motion.div>

          <div className="relative max-w-5xl mx-auto">
            {/* Chart Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.8 }}
              className="relative aspect-[4/3] md:aspect-[16/9] bg-[#2D1B4E] rounded-3xl overflow-hidden shadow-2xl border border-[#2D1B4E]/10 group"
            >
              {/* Scan Line Effect */}
              <motion.div
                className="absolute inset-0 z-0 bg-gradient-to-b from-transparent via-[#E8B84A]/5 to-transparent pointer-events-none"
                initial={{ y: "-100%" }}
                animate={{ y: "200%" }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              />

              {/* Grid Lines */}
              <div className="absolute inset-0 p-8 md:p-12 z-0">
                <svg className="w-full h-full opacity-20" width="100%" height="100%">
                  <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" strokeDasharray="4 4" />
                    </pattern>
                  </defs>

                  {/* Drawing Grid Animation */}
                  <motion.rect
                    width="100%"
                    height="100%"
                    fill="url(#grid)"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.5 }}
                  />

                  {/* Axes */}
                  <motion.line
                    x1="40" y1="100%" x2="40" y2="40"
                    stroke="white" strokeWidth="2"
                    initial={{ pathLength: 0 }}
                    whileInView={{ pathLength: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.5 }}
                  />
                  <motion.line
                    x1="40" y1="calc(100% - 40px)" x2="100%" y2="calc(100% - 40px)"
                    stroke="white" strokeWidth="2"
                    initial={{ pathLength: 0 }}
                    whileInView={{ pathLength: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.5 }}
                  />
                </svg>

                {/* Axis Labels */}
                <div className="absolute bottom-4 left-16 right-0 text-white/40 text-xs tracking-widest font-mono flex justify-between uppercase">
                  <span>Months to Value</span>
                  <span>Days to Value</span>
                </div>
                <div className="absolute left-14 top-8 text-white/40 text-xs tracking-widest font-mono uppercase pointer-events-none">
                  <span>High Capability</span>
                </div>
                <div className="absolute left-28 bottom-14 text-white/40 text-xs tracking-widest font-mono uppercase pointer-events-none">
                  <span>Low Capability</span>
                </div>
              </div>

              {/* Data Points */}
              <div className="absolute inset-0 p-8 md:p-12 z-10">

                {/* Competitor: Legacy ERP (High Capability, Slow Time) - Top Left */}
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 0.8, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 1 }}
                  className="absolute top-[30%] left-[20%]"
                >
                  <div className="relative flex items-center justify-center">
                    <div className="absolute w-full h-full bg-white/20 rounded-full blur-sm" />
                    <div className="w-4 h-4 bg-gradient-to-br from-white/60 to-white/30 rounded-full ring-2 ring-white/10" />
                  </div>
                  <div className="mt-3 text-xs text-white/70 font-mono whitespace-nowrap -ml-4">Legacy ERP</div>
                </motion.div>

                {/* Competitor: Consulting (Mid Capability, Slow Time) - Mid Left */}
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 0.8, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 1.2 }}
                  className="absolute top-[50%] left-[25%]"
                >
                  <div className="relative flex items-center justify-center">
                    <div className="absolute w-full h-full bg-white/20 rounded-full blur-sm" />
                    <div className="w-4 h-4 bg-gradient-to-br from-white/60 to-white/30 rounded-full ring-2 ring-white/10" />
                  </div>
                  <div className="mt-3 text-xs text-white/70 font-mono whitespace-nowrap -ml-4">Consulting Firms</div>
                </motion.div>

                {/* Competitor: Generic AI (Low Capability, Fast Time) - Bottom Right */}
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 0.8, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 1.4 }}
                  className="absolute bottom-[20%] right-[30%]"
                >
                  <div className="relative flex items-center justify-center">
                    <div className="absolute w-full h-full bg-white/20 rounded-full blur-sm" />
                    <div className="w-4 h-4 bg-gradient-to-br from-white/60 to-white/30 rounded-full ring-2 ring-white/10" />
                  </div>
                  <div className="mt-3 text-xs text-white/70 font-mono whitespace-nowrap -ml-8">Generic AI Bots</div>
                </motion.div>

                {/* OPSERA: The Hero (High Capability, Fast Time) - Top Right */}
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ type: "spring", stiffness: 260, damping: 20, delay: 1.8 }}
                  className="absolute top-[20%] right-[15%]"
                >
                  <div className="relative flex items-center justify-center">
                    {/* Pulsing Rings */}
                    <div className="absolute w-full h-full bg-[#E8B84A] rounded-full animate-ping opacity-20" />
                    <div className="absolute w-[200%] h-[200%] border border-[#E8B84A]/30 rounded-full animate-[spin_10s_linear_infinite]" />

                    {/* Main Orb */}
                    <div className="w-6 h-6 bg-gradient-to-br from-[#E8B84A] to-[#E8A87C] rounded-full shadow-[0_0_20px_rgba(232,184,74,0.6)] z-20 relative ring-4 ring-[#2D1B4E]/50" />

                    {/* Badge */}
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 2.2 }}
                      className="absolute right-full mr-4 bg-white/10 backdrop-blur-md border border-[#E8B84A]/30 text-[#E8B84A] px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap shadow-lg"
                    >
                      30-Day Deployment
                    </motion.div>
                  </div>
                  <div className="mt-4 text-sm text-white font-bold tracking-widest text-center flex flex-col items-center gap-1">
                    SIA
                    <span className="w-1 h-8 bg-gradient-to-b from-[#E8B84A] to-transparent opacity-50 absolute -bottom-10" />
                  </div>
                </motion.div>

              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Smooth transition from Market to Technology */}
      <div className="h-64" style={{ background: "linear-gradient(to bottom, #f5f0ff 0%, #e0d5f0 20%, #b8a5d4 40%, #6b4e9b 65%, #3d2a5f 80%, #2D1B4E 100%)" }} />

      {/* Technology Stack Section - 3D Platform with Bars */}
      <section className="relative py-32 px-6 bg-[#2D1B4E] overflow-hidden">
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h3 className="text-5xl md:text-6xl font-light text-white mb-6 tracking-tight font-[family-name:var(--font-space-grotesk)]">
              Robust architecture
            </h3>
            <p className="text-xl text-white/40 max-w-2xl mx-auto font-light font-[family-name:var(--font-inter)]">
              From raw data to autonomous action
            </p>
          </motion.div>

          {/* 3D Platform Scene */}
          <div className="relative max-w-4xl mx-auto">
            {/* Platform with perspective */}
            <div
              className="relative mx-auto rounded-2xl p-8 md:p-12"
              style={{
                background: "linear-gradient(180deg, #1a1a1a 0%, #0a0a0a 100%)",
                boxShadow: "0 40px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.05)"
              }}
            >
              {/* Grid overlay */}
              <div
                className="absolute inset-0 rounded-2xl opacity-20 pointer-events-none"
                style={{
                  backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
                  backgroundSize: "30px 30px"
                }}
              />

              {/* Bars Container */}
              <div className="relative flex items-end justify-center gap-3 md:gap-5 h-[320px] md:h-[380px]">
                {[
                  { height: 35, label: "Connect", desc: "Data ingestion" },
                  { height: 50, label: "Process", desc: "ETL pipeline" },
                  { height: 70, label: "Analyze", desc: "AI reasoning", highlight: true },
                  { height: 85, label: "Learn", desc: "Model training", highlight: true },
                  { height: 100, label: "Execute", desc: "Automation", highlight: true },
                  { height: 80, label: "Monitor", desc: "Observability" },
                  { height: 55, label: "Optimize", desc: "Continuous improvement" },
                ].map((bar, idx) => (
                  <motion.button
                    key={bar.label}
                    initial={{ height: 0, opacity: 0 }}
                    whileInView={{ height: `${bar.height}%`, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.1 * idx, ease: "easeOut" }}
                    whileHover={{ scale: 1.05, y: -8 }}
                    whileTap={{ scale: 0.98 }}
                    className="group relative flex-1 max-w-[70px] md:max-w-[80px] cursor-pointer"
                    style={{ height: `${bar.height}%` }}
                  >
                    {/* Bar */}
                    <div
                      className={`
                        w-full h-full rounded-t-lg relative overflow-hidden transition-all duration-300
                        ${bar.highlight
                          ? "bg-gradient-to-t from-[#E8B84A] via-[#d4a843] to-[#c9a03d] shadow-[0_0_30px_rgba(232,184,74,0.3)]"
                          : "bg-gradient-to-t from-[#3a3a42] via-[#4a4a52] to-[#5a5a62]"
                        }
                        group-hover:shadow-[0_0_40px_rgba(232,184,74,0.5)]
                      `}
                    >
                      {/* Metallic shine effect */}
                      <div
                        className="absolute inset-0 opacity-40"
                        style={{
                          background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 30%, rgba(255,255,255,0.5) 50%, rgba(255,255,255,0.3) 70%, transparent 100%)"
                        }}
                      />

                      {/* Left edge highlight */}
                      <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-white/40 via-white/20 to-transparent" />

                      {/* Top cap */}
                      <div
                        className={`absolute top-0 left-0 right-0 h-3 rounded-t-lg ${bar.highlight ? "bg-[#f5cc5a]" : "bg-[#6a6a72]"}`}
                        style={{
                          boxShadow: bar.highlight ? "0 -2px 10px rgba(232,184,74,0.5)" : "none"
                        }}
                      />
                    </div>

                    {/* Reflection */}
                    <div
                      className={`
                        absolute -bottom-8 left-0 right-0 h-8 rounded-b-lg opacity-20 blur-sm
                        ${bar.highlight
                          ? "bg-gradient-to-b from-[#E8B84A] to-transparent"
                          : "bg-gradient-to-b from-[#4a4a52] to-transparent"
                        }
                      `}
                    />

                    {/* Label */}
                    <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 text-center whitespace-nowrap">
                      <p className={`text-[10px] md:text-xs font-medium ${bar.highlight ? "text-[#E8B84A]" : "text-white/50"} group-hover:text-white transition-colors`}>
                        {bar.label}
                      </p>
                    </div>

                    {/* Hover tooltip */}
                    <div className="absolute -top-16 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg px-3 py-2 whitespace-nowrap">
                        <p className="text-white text-xs font-medium">{bar.label}</p>
                        <p className="text-white/60 text-[10px]">{bar.desc}</p>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* Platform edge glow */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#E8B84A]/30 to-transparent" />
            </div>

            {/* Flow description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.8 }}
              className="flex items-center justify-center gap-4 mt-20 text-sm"
            >
              <span className="text-white/40">Your Data</span>
              <span className="text-white/20">→</span>
              <span className="text-[#E8B84A] font-medium">AI Processing Pipeline</span>
              <span className="text-white/20">→</span>
              <span className="text-white/40">Autonomous Action</span>
            </motion.div>
          </div>
        </div>
      </section>

      {/* The Grand Finale - CTA Section */}
      <section id="cta" className="relative py-48 px-6 bg-gradient-to-b from-[#2D1B4E] via-[#3d2a5f] to-[#2D1B4E] overflow-hidden">
        {/* Energy Orb Background Effect */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-[#E8B84A] to-[#E8A87C] rounded-full blur-[120px] opacity-20 animate-pulse pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1 }}
          >
            <h3 className="text-6xl md:text-8xl font-light text-white mb-10 tracking-tight font-[family-name:var(--font-space-grotesk)] leading-tight">
              Start seeing your
              <br />
              operations clearly.
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E8B84A] to-[#E8A87C] font-normal">
                In 30 days.
              </span>
            </h3>

            <motion.button
              onClick={() => { setShowAccessModal(true); setErrorMessage(''); setShowSuccess(false); }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative group bg-gradient-to-r from-[#E8B84A] to-[#E8A87C] text-[#2D1B4E] font-bold px-16 py-6 text-xl rounded-full shadow-[0_0_40px_rgba(232,184,74,0.4)] hover:shadow-[0_0_80px_rgba(232,184,74,0.6)] transition-all duration-300 overflow-hidden"
            >
              <span className="relative z-10">Request Access</span>
              {/* Shine Animation */}
              <div className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12 group-hover:animate-[shine_1s_ease-in-out_infinite]" />
            </motion.button>
          </motion.div>
        </div>

        {/* Request Access Modal */}
        {showAccessModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowAccessModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-md w-full rounded-2xl p-8 border"
              style={{
                backgroundColor: '#1a1a2e',
                borderColor: 'rgba(232, 184, 74, 0.3)',
                boxShadow: '0 0 60px rgba(232, 184, 74, 0.2)',
              }}
            >
              {/* Close button */}
              <button
                onClick={() => { setShowAccessModal(false); setShowSuccess(false); }}
                className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {showSuccess ? (
                <div className="text-center py-4">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
                    <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h4 className="text-2xl font-bold text-white mb-2">You're on the list!</h4>
                  <p className="text-white/60 text-sm mb-6">
                    We'll be in touch soon. Keep an eye on your inbox.
                  </p>
                  <motion.button
                    onClick={() => { setShowAccessModal(false); setShowSuccess(false); }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3 rounded-xl font-semibold text-[#2D1B4E] bg-gradient-to-r from-[#E8B84A] to-[#E8A87C] hover:shadow-[0_0_30px_rgba(232,184,74,0.4)] transition-all"
                  >
                    Done
                  </motion.button>
                </div>
              ) : (
                <>
                  {/* Header */}
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-[#E8B84A] to-[#E8A87C] flex items-center justify-center">
                      <Rocket className="w-8 h-8 text-[#2D1B4E]" />
                    </div>
                    <h4 className="text-2xl font-bold text-white mb-2">Request Access</h4>
                    <p className="text-white/60 text-sm">
                      Enter your email to join the waitlist and be among the first to experience SIA.
                    </p>
                  </div>

                  {/* Email Input */}
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      setErrorMessage('');
                      try {
                        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
                        const res = await fetch(`${apiUrl}/api/waitlist/join/`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ email }),
                        });
                        if (!res.ok) {
                          const errorData = await res.json().catch(() => null);
                          let message = res.status === 400 ? 'Email already registered.' : 'Something went wrong. Please try again.';
                          if (errorData) {
                            const emailErr = errorData.email;
                            if (Array.isArray(emailErr) && emailErr[0]) {
                              message = emailErr[0];
                            } else if (typeof emailErr === 'string') {
                              message = emailErr;
                            } else if (typeof errorData.error === 'string') {
                              message = errorData.error;
                            } else if (typeof errorData.detail === 'string') {
                              message = errorData.detail;
                            }
                          }
                          setErrorMessage(message);
                          return;
                        }
                        setShowSuccess(true);
                        setEmail('');
                      } catch (err) {
                        console.error('Waitlist error:', err);
                        setErrorMessage('Could not connect to the server. Please check if the backend is running.');
                      }
                    }}
                    className="space-y-4"
                  >
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-white/70 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setErrorMessage('');
                        }}
                        placeholder="you@company.com"
                        required
                        className={`w-full px-4 py-3 rounded-xl bg-white/5 border text-white placeholder-white/30 focus:outline-none transition-all ${
                          errorMessage
                            ? 'border-red-500/60 focus:border-red-500/80 focus:ring-2 focus:ring-red-500/20'
                            : 'border-white/10 focus:border-[#E8B84A]/50 focus:ring-2 focus:ring-[#E8B84A]/20'
                        }`}
                      />
                      {errorMessage && (
                        <p className="text-red-400 text-sm mt-2">{errorMessage}</p>
                      )}
                    </div>

                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-3 rounded-xl font-semibold text-[#2D1B4E] bg-gradient-to-r from-[#E8B84A] to-[#E8A87C] hover:shadow-[0_0_30px_rgba(232,184,74,0.4)] transition-all"
                    >
                      Join Waitlist
                    </motion.button>
                  </form>

                  {/* Footer note */}
                  <p className="text-center text-white/40 text-xs mt-4">
                    We respect your privacy. No spam, ever.
                  </p>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </section>

      <Footer />
      {/* Chatbot */}
      <Chatbot />
    </div >
  );
}