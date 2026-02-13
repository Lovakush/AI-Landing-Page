'use client';

import { motion, useScroll, useTransform, animate, useInView, AnimatePresence } from 'framer-motion';
import { useRef, MouseEvent, useEffect, useState, useMemo } from 'react';
import { ShaderAnimation } from "@/components/ui/shader-lines";
import RadialOrbitalTimeline from "@/components/ui/radial-orbital-timeline";
import { Users, Target, Box, Bot, Zap, ScanSearch, Rocket, MoveRight, Brain, BookOpen, Lightbulb } from 'lucide-react';
import Link from 'next/link';
import Chatbot from '@/components/ui/chatbot';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import SIADashboard from '@/components/ui/SIADashboard';
import WaitlistModal from '@/components/ui/WaitlistModal';


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
    color: '#06B6D4',
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
    color: '#E8B84A',
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
  const [showAccessModal, setShowAccessModal] = useState(false);
  const [navVisible, setNavVisible] = useState(true);
  const [archHovered, setArchHovered] = useState<number | null>(null);
  const [archRevealed, setArchRevealed] = useState(-1);
  const [archCycled, setArchCycled] = useState(false);

  const archPreview = archRevealed === -1;
  const archComplete = archRevealed >= 3;

  const getLayerOpacity = (idx: number) => {
    if (archPreview) return 0.4;
    if (!archComplete) return archRevealed >= idx ? 1 : 0;
    if (archHovered === null) return 1;
    return archHovered >= idx ? 1 : 0;
  };

  const showAutonomous = !archPreview && (
    archHovered === 3 || (archComplete && archHovered === null)
  );

  // Columns & crown visible in preview (dimmed) and when showAutonomous
  const columnsVisible = archPreview || showAutonomous;
  const columnsOpacity = archPreview ? 0.4 : (showAutonomous ? 1 : 0);

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
        className="relative overflow-visible"
      >
        {/* Shader Animation Background - Full opacity */}
        <div className="absolute inset-0 z-0">
          <ShaderAnimation />
        </div>

        {/* Text Content - Centered */}
        <div className="relative z-10 max-w-4xl mx-auto px-6 pt-32 pb-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center gap-6"
          >
            {/* Main Heading with Animated Word */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl tracking-tighter font-light text-white">
              <span>Operations made</span>
              <div className="relative w-full h-[1.2em]">
                {heroWords.map((word, index) => (
                  <motion.span
                    key={word}
                    className="absolute inset-0 flex items-center justify-center font-semibold bg-gradient-to-r from-[#E8B84A] to-[#E8A87C] bg-clip-text text-transparent"
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
            <p className="text-base md:text-lg leading-relaxed tracking-tight text-white/60 max-w-xl font-light">
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
                  Our Story <MoveRight className="w-4 h-4" />
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Dashboard Preview - Below text, with perspective */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 w-full px-4 pb-32"
        >
          <div
            style={{
              perspective: '2000px',
            }}
          >
            <div
              className="relative rounded-2xl overflow-hidden border border-white/10 shadow-[0_-20px_80px_rgba(139,92,246,0.15)]"
              style={{
                height: '85vh',
                maxHeight: '900px',
                transform: 'translateX(10%) translateY(-80px) translateZ(100px) rotateY(35deg) rotateX(36deg) rotateZ(-12deg) translateX(80px)',
                transformOrigin: 'center center',
              }}
            >
              <SIADashboard />
            </div>
          </div>
        </motion.div>
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
                transform: 'translateX(30%) scale(1.1)',
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
              className="flex items-center justify-start"
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
                    { x: 80, y: 50 },    // Middle
                    { x: 160, y: 100 },  // Front
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
                      className={`[grid-area:stack] relative flex h-36 w-[28rem] -skew-y-[8deg] select-none items-center rounded-2xl border backdrop-blur-sm px-7 py-4 cursor-pointer transition-colors duration-300
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
                        className="absolute -right-1 top-[-5%] h-[110%] w-[24rem] pointer-events-none z-20 transition-opacity duration-500"
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
                            <div className="relative bg-gradient-to-r from-[#E8B84A] to-[#d4a43d] text-[#0a0612] text-xs font-bold px-3 py-1 rounded-full">
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
                          <IconComponent className="size-7" style={{ color: agent.color }} />
                        </span>
                        <p className="text-2xl font-semibold" style={{ color: agent.color }}>{agent.name}</p>
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

                          {/* How does it work CTA */}
                          <Link
                            href={`/products?agent=${agent.id}#how-it-works`}
                            className="mt-6 flex items-center justify-center gap-2 w-full py-3 rounded-xl font-medium text-sm border transition-all duration-200 hover:scale-[1.02]"
                            style={{
                              color: agent.color,
                              borderColor: `${agent.color}40`,
                              backgroundColor: `${agent.color}15`,
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = `${agent.color}30`;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = `${agent.color}15`;
                            }}
                          >
                            How does {agent.name} work? <MoveRight className="w-4 h-4" />
                          </Link>
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
      <section className="relative py-16 md:py-24 lg:py-32 px-4 sm:px-6 bg-[#2D1B4E] overflow-hidden">
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="mb-10 md:mb-16 text-center lg:text-left"
          >
            <h3 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light text-white mb-4 md:mb-6 tracking-tight font-[family-name:var(--font-space-grotesk)]">
              Robust architecture
            </h3>
            <p className="text-base md:text-lg lg:text-xl text-white/40 max-w-2xl font-light font-[family-name:var(--font-inter)] mx-auto lg:mx-0">
              From raw data to autonomous action
            </p>
          </motion.div>

          {/* Isometric 3D Architecture Visualization */}
          <div className="relative max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-6 md:gap-8 lg:gap-12">

            {/* Left column — interactive layer headers */}
            <div className="flex flex-row lg:flex-col justify-center gap-0 w-full lg:w-56 shrink-0 order-2 lg:order-1 overflow-x-auto">
              {[
                { title: 'Data Integration', desc: 'We break data silos by unifying information across your enterprise apps, cloud storage, and ERPs under a single roof.' },
                { title: 'AI Reasoning', desc: 'Your unified data powers intelligent solutions through LLMs and machine learning, enabling smarter decision-making at scale.' },
                { title: 'Model Training', desc: 'Continuous improvement, data enrichment, and training deliver sharper insights into how your enterprise operates with each iteration.' },
                { title: 'Autonomous Action', desc: 'Self-orchestrating agentic workflows run analytics, enable automations, and deliver intelligence grounded in your enterprise data.' },
              ].map((item, i) => {
                const isRevealed = archPreview || i <= archRevealed;
                const isHovered = archHovered === i;
                return (
                  <div
                    key={item.title}
                    className="cursor-pointer group flex-1 lg:flex-none min-w-0"
                    onMouseEnter={() => {
                      setArchHovered(i);
                      setArchRevealed(prev => Math.max(prev, i));
                    }}
                    onMouseLeave={() => {
                      if (archComplete && !archCycled) setArchCycled(true);
                      setArchHovered(null);
                    }}
                    onClick={() => {
                      setArchHovered(i);
                      setArchRevealed(prev => Math.max(prev, i));
                    }}
                  >
                    {i > 0 && (
                      <div className="hidden lg:block w-full h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
                    )}
                    <div className="py-3 lg:py-4 px-2 lg:px-0 transition-all duration-300 text-center lg:text-left">
                      <span className={`text-[10px] sm:text-xs lg:text-sm font-semibold tracking-[2px] lg:tracking-[3px] uppercase font-[family-name:var(--font-space-grotesk)] transition-colors duration-300 whitespace-nowrap ${
                        isRevealed ? (archPreview ? 'text-white/50' : 'text-white/80') : 'text-white/30'
                      } ${isHovered ? '!text-[#E8B84A]' : ''}`}>
                        {item.title}
                      </span>
                      <AnimatePresence>
                        {isHovered && (
                          <motion.p
                            initial={{ height: 0, opacity: 0, marginTop: 0 }}
                            animate={{ height: 'auto', opacity: 1, marginTop: 8 }}
                            exit={{ height: 0, opacity: 0, marginTop: 0 }}
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                            className="hidden lg:block text-xs text-white/40 font-light leading-relaxed overflow-hidden"
                          >
                            {item.desc}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Visualization */}
            <div className="relative flex-1 w-full order-1 lg:order-2">
            <div
              className="relative flex items-center justify-center scale-[0.45] sm:scale-[0.55] md:scale-[0.7] lg:scale-[0.85] xl:scale-100 origin-center h-[300px] sm:h-[360px] md:h-[440px] lg:h-[520px] xl:h-[560px]"
              style={{ perspective: '1200px' }}
            >
              {/* Hover float wrapper — outer div for y animation only */}
              <motion.div
                whileHover={{ y: -12 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              >
                {/* Scene container — isometric rotation, never touched by framer-motion */}
                <div
                  style={{
                    transformStyle: 'preserve-3d',
                    transform: 'rotateX(55deg) rotateZ(-45deg)',
                    position: 'relative',
                    width: '400px',
                    height: '400px',
                  }}
                >
                {/* ═══════ Shadow under base ═══════ */}
                <div className="absolute pointer-events-none" style={{
                  left: '50%', top: '50%',
                  transform: 'translate(-50%, -50%) translateZ(-5px)',
                  width: '420px', height: '420px',
                  background: 'radial-gradient(ellipse, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.12) 50%, transparent 70%)',
                  filter: 'blur(20px)',
                }} />

                {/* ═══════ Layer 1: Source Systems (base) ═══════ */}
                <div
                  className="absolute"
                  style={{
                    left: '50%',
                    top: '50%',
                    transform: `translate(-50%, -50%) translateZ(${archComplete && archHovered === 0 ? 20 : 0}px)`,
                    transition: 'transform 0.4s ease',
                    width: '400px',
                    height: '400px',
                    transformStyle: 'preserve-3d',
                  }}
                >
                  {/* Left side face — edges appear first (no delay) */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: getLayerOpacity(0) }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                    className="absolute top-0 bottom-0 left-0 overflow-hidden"
                    style={{
                      width: '56px',
                      transform: 'rotateY(90deg)',
                      transformOrigin: 'left',
                      background: 'linear-gradient(180deg, #18182e 0%, #0e0e1e 100%)',
                      borderTop: '1px solid rgba(255,255,255,0.06)',
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                      borderLeft: '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    <div className="absolute inset-0 opacity-15" style={{
                      background: 'linear-gradient(0deg, transparent 0%, rgba(255,255,255,0.12) 30%, transparent 60%)',
                    }} />
                    <div className="absolute inset-0 flex items-center justify-center" style={{ transform: 'scaleX(-1)' }}>
                      <span className="text-[12px] text-white/50 font-semibold tracking-[2px] uppercase whitespace-nowrap"
                        style={{ writingMode: 'vertical-rl', textOrientation: 'mixed', transform: 'rotate(-360deg)' }}
                      >
                        Enterprise Source Systems &amp; ETL
                      </span>
                    </div>
                  </motion.div>

                  {/* Right side face — edges appear first (no delay) */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: getLayerOpacity(0) }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                    className="absolute left-0 right-0 bottom-0 overflow-hidden"
                    style={{
                      height: '56px',
                      transform: 'rotateX(90deg)',
                      transformOrigin: 'bottom',
                      background: 'linear-gradient(180deg, #12122a 0%, #0a0a18 100%)',
                      borderLeft: '1px solid rgba(255,255,255,0.06)',
                      borderRight: '1px solid rgba(255,255,255,0.04)',
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                    }}
                  >
                    <div className="absolute inset-0 opacity-10" style={{
                      background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 20%, transparent 40%, rgba(255,255,255,0.05) 60%, transparent 80%)',
                    }} />
                    <div className="absolute inset-0 flex items-center justify-center gap-2 px-4" style={{ transform: 'scaleY(-1)' }}>
                      {['CRM', 'ERP', 'Databases', "API's", 'Webhooks'].map((label) => (
                        <span
                          key={label}
                          className="text-[10px] text-white/45 font-medium tracking-wide whitespace-nowrap rounded-full px-2.5 py-1"
                          style={{
                            background: 'rgba(255,255,255,0.06)',
                            border: '1px solid rgba(255,255,255,0.1)',
                          }}
                        >
                          {label}
                        </span>
                      ))}
                    </div>
                  </motion.div>

                  {/* Top face — surface appears second (delay 0.3s) */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: getLayerOpacity(0) }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="absolute inset-0 rounded-lg overflow-hidden"
                    style={{
                      background: 'linear-gradient(135deg, #1c1c2e 0%, #2a2a40 25%, #1e1e32 50%, #2c2c44 75%, #1a1a2c 100%)',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
                      backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)',
                    }} />
                    <div className="absolute inset-0 opacity-30 pointer-events-none" style={{
                      background: 'linear-gradient(135deg, transparent 30%, rgba(255,255,255,0.08) 45%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.08) 55%, transparent 70%)',
                    }} />
                    <div className="absolute inset-0 opacity-15 pointer-events-none" style={{
                      backgroundImage: 'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
                      backgroundSize: '40px 40px',
                    }} />
                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-white/20 via-white/10 to-transparent" />
                    <div className="absolute top-0 left-0 bottom-0 w-[1px] bg-gradient-to-b from-white/20 via-white/10 to-transparent" />
                  </motion.div>
                </div>

                {/* ═══════ Layer 2: AI Reasoning & Model Training ═══════ */}
                <div
                  className="absolute"
                  style={{
                    left: '50%',
                    top: '50%',
                    transform: `translate(-50%, -50%) translateZ(${archComplete && archHovered === 1 ? 90 : 70}px)`,
                    transition: 'transform 0.4s ease',
                    width: '320px',
                    height: '320px',
                    transformStyle: 'preserve-3d',
                  }}
                >
                  {/* Left side face */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: getLayerOpacity(1) }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                    className="absolute top-2 bottom-0 left-0 overflow-hidden"
                    style={{
                      width: '24px',
                      transform: 'rotateY(90deg)',
                      transformOrigin: 'left',
                      background: 'linear-gradient(180deg, #2a1245 0%, #1e0a38 50%, #160830 100%)',
                      borderTop: '1px solid rgba(168,85,247,0.3)',
                      borderBottom: '1px solid rgba(168,85,247,0.15)',
                      borderLeft: '1px solid rgba(168,85,247,0.3)',
                      boxShadow: 'inset 0 0 12px rgba(168,85,247,0.1), inset 0 1px 0 rgba(255,255,255,0.06)',
                    }}
                  >
                    <div className="absolute inset-0 opacity-30" style={{
                      backgroundImage: 'linear-gradient(180deg, rgba(200,160,255,0.12) 0%, transparent 30%, rgba(200,160,255,0.08) 70%, transparent 100%)',
                    }} />
                    <div className="absolute inset-0 flex items-center justify-center" style={{ transform: 'scaleX(-1)' }}>
                      <span className="text-[10px] text-purple-300/50 font-semibold tracking-[2px] uppercase whitespace-nowrap"
                        style={{ writingMode: 'vertical-rl', textOrientation: 'mixed', transform: 'rotate(-360deg)' }}
                      >
                        AI Reasoning &amp; Model Training
                      </span>
                    </div>
                  </motion.div>

                  {/* Right side face */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: getLayerOpacity(1) }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                    className="absolute left-0 right-2 bottom-0 overflow-hidden"
                    style={{
                      height: '24px',
                      transform: 'rotateX(90deg)',
                      transformOrigin: 'bottom',
                      background: 'linear-gradient(90deg, #2a1245 0%, #1e0a38 50%, #160830 100%)',
                      borderLeft: '1px solid rgba(168,85,247,0.3)',
                      borderRight: '1px solid rgba(168,85,247,0.15)',
                      borderBottom: '1px solid rgba(168,85,247,0.15)',
                      boxShadow: 'inset 0 0 12px rgba(168,85,247,0.1), inset 0 1px 0 rgba(255,255,255,0.06)',
                    }}
                  >
                    <div className="absolute inset-0 opacity-30" style={{
                      backgroundImage: 'linear-gradient(90deg, rgba(200,160,255,0.12) 0%, transparent 30%, rgba(200,160,255,0.08) 70%, transparent 100%)',
                    }} />
                  </motion.div>

                  {/* Top face */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: getLayerOpacity(1) }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                    className="absolute inset-0 rounded-xl overflow-hidden"
                    style={{
                      background: 'linear-gradient(135deg, rgba(120,60,200,0.15) 0%, rgba(168,85,247,0.2) 30%, rgba(140,70,220,0.12) 60%, rgba(168,85,247,0.18) 100%)',
                      border: '1px solid rgba(168,85,247,0.25)',
                      backdropFilter: 'blur(8px)',
                      boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.1), 0 0 30px rgba(168,85,247,0.1)',
                    }}
                  >
                    {/* Glass refraction highlight */}
                    <div className="absolute inset-0 opacity-40 pointer-events-none" style={{
                      background: 'linear-gradient(135deg, transparent 20%, rgba(200,160,255,0.15) 40%, rgba(255,255,255,0.1) 50%, rgba(200,160,255,0.1) 60%, transparent 80%)',
                    }} />
                    {/* Grid texture */}
                    <div className="absolute inset-0 pointer-events-none" style={{
                      backgroundImage: 'linear-gradient(rgba(168,85,247,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(168,85,247,0.12) 1px, transparent 1px)',
                      backgroundSize: '40px 40px',
                    }} />
                    {/* Grid cubes with labels - scattered on the surface */}
                    {[
                      { label: 'LLM', x: 24, y: 20 },
                      { label: 'RAG', x: 230, y: 50 },
                      { label: 'AI Agents', x: 10, y: 240 },
                      { label: 'ML', x: 100, y: 130 },
                      { label: 'Fine-Tuning', x: 200, y: 180 },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="absolute rounded-md flex items-center justify-center"
                        style={{
                          left: `${item.x}px`,
                          top: `${item.y}px`,
                          width: item.label.length > 3 ? '80px' : '50px',
                          height: '36px',
                          background: 'linear-gradient(135deg, rgba(168,85,247,0.2) 0%, rgba(120,60,200,0.15) 100%)',
                          border: '1px solid rgba(168,85,247,0.3)',
                          boxShadow: '0 0 12px rgba(168,85,247,0.15), inset 0 1px 1px rgba(255,255,255,0.08)',
                        }}
                      >
                        <span className="text-[9px] text-purple-300/70 font-bold tracking-[1px] uppercase transition-opacity duration-300"
                          style={{ opacity: columnsVisible ? 0 : 1 }}
                        >
                          {item.label}
                        </span>
                      </div>
                    ))}
                    {/* Edge highlights */}
                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-purple-400/30 via-purple-300/15 to-transparent" />
                    <div className="absolute top-0 left-0 bottom-0 w-[1px] bg-gradient-to-b from-purple-400/30 via-purple-300/15 to-transparent" />
                  </motion.div>
                </div>

                {/* ═══════ Layer 3: Golden Orbit Arcs — single SVG paths ═══════ */}
                {(() => {
                  const arcs = [
                    'M 49 38 Q 152 0 255 68',
                    'M 255 68 Q 305 120 240 198',
                    'M 240 198 Q 183 218 125 148',
                    'M 125 148 Q 32 93 49 38',
                    'M 255 68 Q 230 85 125 148',
                    'M 50 258 Q 100 148 49 38',
                    'M 50 258 Q 30 190 125 148',
                  ];
                  return (
                    <div
                      className="absolute pointer-events-none"
                      style={{
                        left: '50%',
                        top: '50%',
                        marginLeft: '-160px',
                        marginTop: '-160px',
                        width: '320px',
                        height: '320px',
                        transform: 'translateZ(72px)',
                      }}
                    >
                    <motion.svg
                      initial={{ opacity: 0 }}
                      animate={{ opacity: (() => {
                        if (archPreview) return 0.4;
                        if (!archComplete) return archRevealed >= 2 ? 1 : 0;
                        if (archHovered === null) return 0;
                        return archHovered >= 2 && archHovered < 3 ? 1 : 0;
                      })() }}
                      transition={{ duration: 0.8 }}
                      className="absolute inset-0 pointer-events-none"
                      viewBox="0 0 320 320"
                      overflow="visible"
                      style={{
                        width: '320px',
                        height: '320px',
                      }}
                    >
                      <defs>
                        <filter id="arcGlow" x="-30%" y="-30%" width="160%" height="160%">
                          <feGaussianBlur stdDeviation="3" result="blur" />
                          <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                          </feMerge>
                        </filter>
                        <filter id="arcGlowStrong" x="-30%" y="-30%" width="160%" height="160%">
                          <feGaussianBlur stdDeviation="5" result="blur" />
                          <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                          </feMerge>
                        </filter>
                      </defs>

                      {/* Static golden glow arcs — 1 path = 1 arc */}
                      {arcs.map((d, i) => (
                        <path key={`glow-${i}`} d={d} fill="none" stroke="rgba(232,184,74,0.3)" strokeWidth="1.5" filter="url(#arcGlow)" />
                      ))}

                      {/* Animated traveling particles along each arc */}
                      {arcs.map((d, i) => (
                        <motion.path
                          key={`particle-${i}`}
                          d={d}
                          fill="none"
                          stroke="rgba(255,230,150,0.9)"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          filter="url(#arcGlowStrong)"
                          pathLength={1000}
                          strokeDasharray="40 960"
                          initial={{ strokeDashoffset: 0 }}
                          animate={{ strokeDashoffset: -1000 }}
                          transition={{ duration: 3 + i * 0.2, repeat: Infinity, ease: 'linear', delay: i * 0.4 }}
                        />
                      ))}

                      {/* Endpoint halos moved to separate 3D-positioned divs below */}
                    </motion.svg>
                    </div>
                  );
                })()}

                {/* Ambient glow beneath platform */}
                <motion.div
                  className="absolute rounded-full pointer-events-none"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: archPreview ? 0.2 : (getLayerOpacity(0) > 0 ? (archComplete ? 1 : 0.4) : 0) }}
                  transition={{ duration: 1 }}
                  style={{
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%) translateZ(-15px)',
                    width: '480px',
                    height: '480px',
                    background: 'radial-gradient(circle, rgba(168,85,247,0.05) 0%, rgba(255,255,255,0.02) 40%, transparent 60%)',
                    filter: 'blur(25px)',
                  }}
                />

                {/* ═══════ Golden 3D columns — grow from textboxes on Autonomous Action ═══════ */}
                <div
                  className="absolute pointer-events-none"
                  style={{
                    left: '50%',
                    top: '50%',
                    marginLeft: '-160px',
                    marginTop: '-160px',
                    transform: `translateZ(${archCycled && archHovered === 3 ? 90 : 70}px)`,
                    transition: 'transform 0.4s ease',
                    width: '320px',
                    height: '320px',
                    transformStyle: 'preserve-3d',
                  }}
                >
                  {[
                    { x: 24, y: 20, tw: 50, colH: 190, label: 'Marketing' },
                    { x: 230, y: 50, tw: 50, colH: 110, label: 'Procurement' },
                    { x: 10, y: 240, tw: 80, colH: 155, label: 'Accounting' },
                    { x: 100, y: 130, tw: 50, colH: 230, label: 'Human Resource' },
                    { x: 200, y: 180, tw: 80, colH: 75, label: 'Sales' },
                  ].map((col, i) => (
                    <div
                      key={i}
                      className="absolute"
                      style={{
                        left: `${col.x}px`,
                        top: `${col.y}px`,
                        width: `${col.tw}px`,
                        height: '36px',
                        transformStyle: 'preserve-3d',
                        transform: `scaleZ(${columnsVisible ? 1 : 0})`,
                        opacity: columnsOpacity,
                        transition: 'transform 1.2s linear, opacity 0.15s linear',
                      }}
                    >
                      {/* Top cap */}
                      <div
                        className="absolute inset-0"
                        style={{
                          transform: `translateZ(${col.colH}px)`,
                          background: 'linear-gradient(135deg, rgba(232,184,74,0.55) 0%, rgba(232,184,74,0.38) 100%)',
                          border: '2px solid rgba(232,184,74,0.6)',
                          boxShadow: '0 0 18px rgba(232,184,74,0.25)',
                        }}
                      />
                      {/* Left visible face */}
                      <div
                        className="absolute top-0 left-0 overflow-hidden"
                        style={{
                          width: `${col.colH}px`,
                          height: '36px',
                          transform: `translateZ(${col.colH}px) rotateY(90deg)`,
                          transformOrigin: 'left',
                          background: 'linear-gradient(to right, rgba(232,184,74,0.45), rgba(232,184,74,0.22))',
                          borderLeft: '2px solid rgba(232,184,74,0.55)',
                          borderTop: '2px solid rgba(232,184,74,0.45)',
                          borderBottom: '2px solid rgba(232,184,74,0.30)',
                        }}
                      >
                        <span
                          className="absolute whitespace-nowrap font-semibold uppercase"
                          style={{
                            fontSize: '10px',
                            color: 'rgba(255,235,170,0.95)',
                            textShadow: '0 0 8px rgba(232,184,74,0.6)',
                            left: '50%',
                            top: '50%',
                            transform: 'translate(-50%, -50%) scaleX(-1)',
                            letterSpacing: '1.5px',
                            opacity: columnsVisible ? (archPreview ? 0.4 : 1) : 0,
                            transition: 'opacity 0.5s ease',
                            transitionDelay: (!archPreview && showAutonomous) ? '1.2s' : '0s',
                          }}
                        >
                          {col.label}
                        </span>
                      </div>
                      {/* Bottom visible face */}
                      <div
                        className="absolute bottom-0 left-0"
                        style={{
                          width: `${col.tw}px`,
                          height: `${col.colH}px`,
                          transform: `translateZ(${col.colH}px) rotateX(90deg)`,
                          transformOrigin: 'bottom',
                          background: 'linear-gradient(to top, rgba(232,184,74,0.40), rgba(232,184,74,0.18))',
                          borderBottom: '2px solid rgba(232,184,74,0.50)',
                          borderLeft: '2px solid rgba(232,184,74,0.30)',
                          borderRight: '2px solid rgba(232,184,74,0.30)',
                        }}
                      />
                    </div>
                  ))}
                </div>

                {/* ═══════ Crown ring above columns with traveling particle ═══════ */}
                <div
                  className="absolute pointer-events-none"
                  style={{
                    left: '50%',
                    top: '50%',
                    marginLeft: '-160px',
                    marginTop: '-160px',
                    width: '320px',
                    height: '320px',
                    transform: `translateZ(${archCycled && archHovered === 3 ? 330 : 310}px)`,
                    transition: 'transform 0.4s ease',
                  }}
                >
                  <motion.svg
                    initial={{ opacity: archPreview ? 0.4 : 0 }}
                    animate={{ opacity: columnsOpacity }}
                    transition={{ duration: 0.5, delay: (!archPreview && showAutonomous) ? 1.2 : 0 }}
                    className="absolute inset-0 pointer-events-none"
                    viewBox="0 0 320 320"
                    overflow="visible"
                    style={{ width: '320px', height: '320px' }}
                  >
                    <defs>
                      <filter id="crownGlow" x="-30%" y="-30%" width="160%" height="160%">
                        <feGaussianBlur stdDeviation="4" result="blur" />
                        <feMerge>
                          <feMergeNode in="blur" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                    </defs>
                    <circle cx="140" cy="150" r="135" fill="none" stroke="rgba(232,184,74,0.25)" strokeWidth="1.5" filter="url(#crownGlow)" />
                    <motion.circle
                      cx="140"
                      cy="150"
                      r="135"
                      fill="none"
                      stroke="rgba(255,230,150,0.9)"
                      strokeWidth="3"
                      strokeLinecap="round"
                      filter="url(#crownGlow)"
                      pathLength={1000}
                      strokeDasharray="40 960"
                      initial={{ strokeDashoffset: 0 }}
                      animate={{ strokeDashoffset: -1000 }}
                      transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
                    />
                  </motion.svg>
                </div>

              </div>
              </motion.div>
            </div>
          </div>
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
              onClick={() => setShowAccessModal(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative group bg-gradient-to-r from-[#E8B84A] to-[#E8A87C] text-[#2D1B4E] font-bold px-16 py-6 text-xl rounded-full shadow-[0_0_40px_rgba(232,184,74,0.4)] hover:shadow-[0_0_80px_rgba(232,184,74,0.6)] transition-all duration-300 overflow-hidden"
            >
              <span className="relative z-10">Join the Waitlist</span>
              {/* Shine Animation */}
              <div className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12 group-hover:animate-[shine_1s_ease-in-out_infinite]" />
            </motion.button>
          </motion.div>
        </div>

        {/* Request Access Modal */}
        <WaitlistModal isOpen={showAccessModal} onClose={() => setShowAccessModal(false)} />
      </section>

      <Footer />
      {/* Chatbot */}
      <Chatbot />
    </div >
  );
}