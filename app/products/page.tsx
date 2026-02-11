'use client';

import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { useState, useEffect, useRef, forwardRef } from 'react';
import { MoveRight, Sparkles, Zap, Target, Users, TrendingUp, BarChart3, Bot, Check, X } from 'lucide-react';
import Chatbot from '@/components/ui/chatbot';
import Navbar from '@/components/ui/Navbar';
import WaitlistSection from "@/components/ui/WaitList";
import BookADemo from "@/components/ui/BookaDemo";

const dynamicWords = ["Marketing", "HR", "Sales", "Advertising", "Job Postings", "Lead Generation"];

const categories = [
  { id: 'category1', label: 'Marketing', color: '#A855F7' },
  { id: 'category2', label: 'Human Resources', color: '#E8B84A' },
  { id: 'category3', label: 'Sales', color: '#06B6D4' },
];

const getBrandName = (category: string): string => {
  switch (category) {
    case 'category1': return 'Mark';
    case 'category2': return 'Consuelo';
    case 'category3': return 'Argeo';
    default: return 'Our Product';
  }
};

// Robot mascot SVGs matching the home page style
const RobotMark = ({ size = 80 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="15" y="22" width="50" height="42" rx="10" fill="#A855F7"/>
    <rect x="15" y="22" width="50" height="42" rx="10" fill="url(#markGrad)" opacity="0.4"/>
    <circle cx="40" cy="14" r="5" fill="#A855F7"/>
    <rect x="38" y="14" width="4" height="10" fill="#A855F7"/>
    <circle cx="29" cy="40" r="8" fill="white" opacity="0.15"/>
    <circle cx="51" cy="40" r="8" fill="white" opacity="0.15"/>
    <circle cx="29" cy="40" r="5" fill="white"/>
    <circle cx="51" cy="40" r="5" fill="white"/>
    <circle cx="31" cy="38" r="2" fill="#2D1B4E"/>
    <circle cx="53" cy="38" r="2" fill="#2D1B4E"/>
    <rect x="27" y="52" width="26" height="4" rx="2" fill="white" opacity="0.4"/>
    <defs>
      <linearGradient id="markGrad" x1="15" y1="22" x2="65" y2="64">
        <stop stopColor="white"/>
        <stop offset="1" stopColor="white" stopOpacity="0"/>
      </linearGradient>
    </defs>
  </svg>
);

const RobotConsuelo = ({ size = 80 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="15" y="22" width="50" height="42" rx="10" fill="#E8B84A"/>
    <rect x="15" y="22" width="50" height="42" rx="10" fill="url(#consueloGrad)" opacity="0.4"/>
    <rect x="37" y="10" width="6" height="13" rx="3" fill="#E8B84A"/>
    <circle cx="40" cy="10" r="4" fill="#E8B84A"/>
    <circle cx="29" cy="40" r="8" fill="white" opacity="0.15"/>
    <circle cx="51" cy="40" r="8" fill="white" opacity="0.15"/>
    <circle cx="29" cy="40" r="5" fill="white"/>
    <circle cx="51" cy="40" r="5" fill="white"/>
    <circle cx="31" cy="38" r="2" fill="#2D1B4E"/>
    <circle cx="53" cy="38" r="2" fill="#2D1B4E"/>
    <path d="M30 54 Q40 60 50 54" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.6"/>
    <defs>
      <linearGradient id="consueloGrad" x1="15" y1="22" x2="65" y2="64">
        <stop stopColor="white"/>
        <stop offset="1" stopColor="white" stopOpacity="0"/>
      </linearGradient>
    </defs>
  </svg>
);

const RobotArgeo = ({ size = 80 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="15" y="22" width="50" height="42" rx="10" fill="#06B6D4"/>
    <rect x="15" y="22" width="50" height="42" rx="10" fill="url(#argeoGrad)" opacity="0.4"/>
    <circle cx="40" cy="12" r="5" fill="#06B6D4"/>
    <rect x="38" y="12" width="4" height="12" fill="#06B6D4"/>
    <circle cx="29" cy="40" r="8" fill="white" opacity="0.15"/>
    <circle cx="51" cy="40" r="8" fill="white" opacity="0.15"/>
    <circle cx="29" cy="40" r="5" fill="white"/>
    <circle cx="51" cy="40" r="5" fill="white"/>
    <circle cx="31" cy="38" r="2" fill="#0E1A2B"/>
    <circle cx="53" cy="38" r="2" fill="#0E1A2B"/>
    <rect x="24" y="52" width="12" height="4" rx="2" fill="white" opacity="0.4"/>
    <rect x="44" y="52" width="12" height="4" rx="2" fill="white" opacity="0.4"/>
    <defs>
      <linearGradient id="argeoGrad" x1="15" y1="22" x2="65" y2="64">
        <stop stopColor="white"/>
        <stop offset="1" stopColor="white" stopOpacity="0"/>
      </linearGradient>
    </defs>
  </svg>
);

const getCategoryRobot = (category: string, size = 80) => {
  if (category === 'category1') return <RobotMark size={size} />;
  if (category === 'category2') return <RobotConsuelo size={size} />;
  return <RobotArgeo size={size} />;
};

const products = [
  {
    id: 1, category: 'category1', icon: Sparkles, color: '#A855F7', colorIntensity: 0.4,
    name: 'Content & Social Media Agent', tagline: 'Create and manage engaging social content',
    description: 'An AI-powered agent that generates, schedules, and optimizes social media content across all major platforms. From caption writing to content calendar management.',
    features: ['Content Generation', 'Social Scheduling', 'Engagement Analytics', 'Brand Voice Consistency'],
    price: '$499/mo',
    ctaType: 'demo',
  },
  {
    id: 2, category: 'category1', icon: Target, color: '#A855F7', colorIntensity: 0.6,
    name: 'Advertising Agent', tagline: 'Optimize ad campaigns and maximize ROI',
    description: 'Intelligent ad management automation that creates, tests, and optimizes campaigns across Google Ads, Meta, and LinkedIn. Real-time bid optimization and audience targeting.',
    features: ['Campaign Automation', 'Bid Optimization', 'A/B Testing', 'ROI Tracking'],
    price: '$699/mo',
    ctaType: 'waitlist',
  },
  {
    id: 3, category: 'category1', icon: Zap, color: '#A855F7', colorIntensity: 0.8,
    name: 'Full Marketing Agent', tagline: 'Complete marketing automation suite',
    description: 'The complete Mark solution combining content creation, ad management, and analytics. Unified platform for all your marketing needs with full AI automation.',
    features: ['Content Generation', 'Ad Optimization', 'Lead Scoring', 'Performance Analytics'],
    price: '$1,299/mo',
    ctaType: 'waitlist',
  },
  {
    id: 4, category: 'category2', icon: Users, color: '#E8B84A', colorIntensity: 0.4,
    name: 'Candidate Screening', tagline: 'Intelligent resume screening and evaluation',
    description: 'Automate resume review and candidate qualification. AI evaluates CVs against job requirements, identifies top candidates, and flags red flags in seconds.',
    features: ['Resume Parsing', 'Skill Matching', 'Qualification Scoring', 'Bias-free Evaluation'],
    price: '$399/mo',
    ctaType: 'demo',
  },
  {
    id: 5, category: 'category2', icon: BarChart3, color: '#E8B84A', colorIntensity: 0.6,
    name: 'Talent Acquisition', tagline: 'Automated job description generation',
    description: 'Generate compelling and SEO-optimized job descriptions in minutes. AI creates role-specific descriptions, requirements, and benefits tailored to your company culture.',
    features: ['Description Generation', 'SEO Optimization', 'Salary Recommendation', 'Culture Matching'],
    price: '$299/mo',
    ctaType: 'waitlist',
  },
  {
    id: 6, category: 'category2', icon: Bot, color: '#E8B84A', colorIntensity: 0.8,
    name: 'Full HR Agent', tagline: 'Comprehensive HR automation platform',
    description: 'The complete Consuelo solution combining CV screening, job creation, and candidate engagement. End-to-end recruitment and HR automation in one platform.',
    features: ['Resume Screening', 'Job Description', 'Candidate Engagement', 'Analytics Dashboard'],
    price: '$899/mo',
    ctaType: 'waitlist',
  },
  {
    id: 7, category: 'category3', icon: Target, color: '#06B6D4', colorIntensity: 0.4,
    name: 'Lead Generation and Classification', tagline: 'AI-powered lead identification and scoring',
    description: 'Discover and qualify hot leads automatically. AI scans the market, identifies prospects matching your ideal customer profile, and scores them for sales-readiness.',
    features: ['Lead Discovery', 'Qualification Scoring', 'Prospect Research', 'CRM Integration'],
    price: '$499/mo',
    ctaType: 'waitlist',
  },
  {
    id: 8, category: 'category3', icon: MoveRight, color: '#06B6D4', colorIntensity: 0.6,
    name: 'Meeting Agent', tagline: 'Autonomous meeting scheduling and management',
    description: 'Never chase meeting availability again. AI proactively schedules calls with prospects, sends reminders, and follows up—moving deals forward 24/7.',
    features: ['Meeting Scheduling', 'Calendar Integration', 'Intelligent Reminders', 'Follow-up Automation'],
    price: '$599/mo',
    ctaType: 'waitlist',
  },
  {
    id: 9, category: 'category3', icon: TrendingUp, color: '#06B6D4', colorIntensity: 0.8,
    name: 'Full Sales Agent', tagline: 'End-to-end sales automation',
    description: 'The complete Argeo solution combining lead generation, meeting management, and pipeline tracking. Your complete autonomous sales team working 24/7.',
    features: ['Lead Generation', 'Meeting Scheduling', 'Pipeline Management', 'Win Rate Analytics'],
    price: '$1,199/mo',
    ctaType: 'waitlist',
  },
];

export default function ProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState('category1');
  const [wordIndex, setWordIndex] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState<typeof products[0] | null>(null);
  const [shouldScrollToDetails, setShouldScrollToDetails] = useState(false);
  const [navVisible, setNavVisible] = useState(true);
  const [hoveredProduct, setHoveredProduct] = useState<number | null>(null);
  const productDetailsRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      setNavVisible(currentY < lastScrollY.current || currentY < 10);
      lastScrollY.current = currentY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % dynamicWords.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const firstProduct = products.find(p => p.category === selectedCategory);
    setSelectedProduct(firstProduct || null);
  }, [selectedCategory]);

  useEffect(() => {
    if (selectedProduct && productDetailsRef.current && shouldScrollToDetails) {
      setTimeout(() => {
        productDetailsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
      setShouldScrollToDetails(false);
    }
  }, [selectedProduct, shouldScrollToDetails]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  const filteredProducts = products.filter(p => p.category === selectedCategory);
  const activeCategory = categories.find(c => c.id === selectedCategory)!;

  return (
    <div
      className="min-h-screen w-full overflow-x-hidden"
      style={{
        background: 'linear-gradient(160deg, #12041a 0%, #1e0835 30%, #2a0d4a 55%, #160228 80%, #0c0118 100%)',
      }}
    >
      <Navbar />

      {/* Ambient background effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div style={{
          position: 'absolute', top: '-10%', right: '-5%',
          width: '500px', height: '500px',
          background: 'radial-gradient(circle, rgba(168,85,247,0.18) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }} />
        <div style={{
          position: 'absolute', bottom: '20%', left: '-10%',
          width: '400px', height: '400px',
          background: 'radial-gradient(circle, rgba(232,184,74,0.12) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }} />
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
          width: '600px', height: '300px',
          background: 'radial-gradient(circle, rgba(6,182,212,0.07) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }} />

        {/* Interactive glow that follows category */}
        <motion.div
          style={{
            position: 'absolute',
            width: '600px',
            height: '600px',
            borderRadius: '50%',
            background: `radial-gradient(circle, ${activeCategory.color}15 0%, transparent 70%)`,
            filter: 'blur(80px)',
            x: useTransform(mouseX, [0, typeof window !== 'undefined' ? window.innerWidth : 1920], [-100, 100]),
            y: useTransform(mouseY, [0, typeof window !== 'undefined' ? window.innerHeight : 1080], [-100, 100]),
          }}
        />
      </div>

      {/* ─── Hero Section ─── */}
      <section className="relative z-10 min-h-screen flex items-center justify-center px-6 text-center pt-24">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
          >
            <h1 className="text-6xl font-light text-white leading-tight mb-6 relative">

              {/* Golden blinking glow — covers all 3 lines */}
              <motion.span
                aria-hidden="true"
                className="absolute left-1/2 -translate-x-1/2 pointer-events-none"
                style={{
                  top: '-20%',
                  width: '900px',
                  height: '140%',
                  borderRadius: '50%',
                  background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(232,184,74,0.42) 0%, rgba(232,140,50,0.16) 45%, transparent 72%)',
                  filter: 'blur(48px)',
                  zIndex: 0,
                }}
                animate={{
                  opacity: [0.5, 1, 0.5],
                  scaleX: [0.92, 1.06, 0.92],
                  scaleY: [0.9, 1.05, 0.9],
                }}
                transition={{
                  duration: 2.8,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />

              {/* Secondary sharper inner pulse */}
              <motion.span
                aria-hidden="true"
                className="absolute left-1/2 -translate-x-1/2 pointer-events-none"
                style={{
                  top: '0%',
                  width: '600px',
                  height: '100%',
                  borderRadius: '50%',
                  background: 'radial-gradient(ellipse 65% 55% at 50% 50%, rgba(255,210,100,0.28) 0%, transparent 68%)',
                  filter: 'blur(28px)',
                  zIndex: 0,
                }}
                animate={{
                  opacity: [0.3, 0.8, 0.3],
                  scaleX: [0.88, 1.1, 0.88],
                }}
                transition={{
                  duration: 2.8,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 0.4,
                }}
              />

              <span className="relative z-10">Intelligent solutions</span>
              <div className="text-white/60 text-5xl mt-3">for your</div>

              <div className="relative h-[1.4em] mt-4 overflow-hidden flex justify-center">
                {dynamicWords.map((word, index) => (
                  <motion.span
                    key={word}
                    className="absolute inset-0 flex justify-center text-6xl font-semibold"
                    style={{
                      background: 'linear-gradient(135deg, #E8B84A, #E8A87C)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                    initial={{ opacity: 0, y: 50 }}
                    animate={
                      wordIndex === index
                        ? { y: 0, opacity: 1 }
                        : { y: wordIndex > index ? -50 : 50, opacity: 0 }
                    }
                    transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                  >
                    {word}
                  </motion.span>
                ))}
              </div>
            </h1>

            <p className="text-lg text-white/50 leading-relaxed max-w-2xl mx-auto mt-10">
              Autonomous AI agents designed for Marketing, HR, and Sales.
              Choose the perfect level of automation — from specialized tools
              to full-suite intelligent platforms.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ─── Orbital Interactive Display ─── */}
      <section className="relative z-10 py-32 px-6" data-products-section>
        <div className="max-w-7xl mx-auto">

          {/* Category Pills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex justify-center mb-8"
          >
            <div
              className="inline-flex items-center gap-1 p-1.5 rounded-full"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.1)',
                backdropFilter: 'blur(12px)',
              }}
            >
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className="relative px-7 py-3 rounded-full text-sm font-semibold transition-all duration-300 z-10"
                  style={{
                    color: selectedCategory === cat.id ? 'white' : 'rgba(255,255,255,0.45)',
                  }}
                >
                  {selectedCategory === cat.id && (
                    <motion.div
                      layoutId="activePill"
                      className="absolute inset-0 rounded-full -z-10"
                      style={{
                        backgroundColor: cat.color,
                        boxShadow: `0 0 24px ${cat.color}55`,
                      }}
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                  {cat.label}
                </button>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-light text-white mb-4">
              Explore our <span className="font-semibold" style={{ color: activeCategory.color }}>ecosystem</span>
            </h2>
            <p className="text-lg text-white/45">
              Interactive view of how our AI agents work together
            </p>
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.div
              key={selectedCategory}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="relative"
              style={{ height: '700px' }}
            >
              {/* Center Hub */}
              <motion.div
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 100, damping: 15 }}
              >
                <div
                  className="w-32 h-32 rounded-full flex items-center justify-center"
                  style={{
                    background: `radial-gradient(circle, ${activeCategory.color}30, ${activeCategory.color}10)`,
                    border: `2px solid ${activeCategory.color}60`,
                    boxShadow: `0 0 60px ${activeCategory.color}40, inset 0 0 40px ${activeCategory.color}20`,
                  }}
                >
                  {getCategoryRobot(selectedCategory, 70)}
                </div>
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{
                    border: `1px solid ${activeCategory.color}30`,
                  }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                />
              </motion.div>

              {/* Orbiting Products */}
              {filteredProducts.map((product, index) => {
                const angle = (index / filteredProducts.length) * Math.PI * 2;
                const radius = 250;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;

                return (
                  <OrbitingProduct
                    key={product.id}
                    product={product}
                    x={x}
                    y={y}
                    index={index}
                    isHovered={hoveredProduct === product.id}
                    onHover={() => setHoveredProduct(product.id)}
                    onLeave={() => setHoveredProduct(null)}
                    onClick={() => {
                      setSelectedProduct(product);
                      setShouldScrollToDetails(true);
                    }}
                  />
                );
              })}

              {/* Connecting Lines */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ top: 0, left: 0 }}>
                {filteredProducts.map((product, index) => {
                  const angle = (index / filteredProducts.length) * Math.PI * 2;
                  const radius = 250;
                  const x = Math.cos(angle) * radius;
                  const y = Math.sin(angle) * radius;

                  return (
                    <motion.line
                      key={product.id}
                      x1="50%"
                      y1="50%"
                      x2={`calc(50% + ${x}px)`}
                      y2={`calc(50% + ${y}px)`}
                      stroke={product.color}
                      strokeWidth={hoveredProduct === product.id ? "2" : "1"}
                      strokeOpacity={hoveredProduct === product.id ? "0.6" : "0.15"}
                      strokeDasharray="4 4"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 1, delay: index * 0.1 }}
                    />
                  );
                })}
              </svg>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* ─── Product Detail Section ─── */}
      <AnimatePresence mode="wait">
        {selectedProduct && (
          <ProductDetailsSection
            key={`product-${selectedProduct.id}`}
            product={selectedProduct}
            products={filteredProducts}
            onSelectProduct={(prod) => {
              setSelectedProduct(prod);
              setShouldScrollToDetails(true);
              setTimeout(() => {
                document.querySelector('[data-products-section]')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }, 100);
            }}
            ref={productDetailsRef}
          />
        )}
      </AnimatePresence>

      {/* ─── CTA Section - Book Demo or Waitlist ─── */}
      {selectedProduct && (
        <div className="relative z-10 w-full">
          {selectedProduct.ctaType === 'demo' ? (
            <BookADemo />
          ) : (
            <WaitlistSection />
          )}
        </div>
      )}

      {/* ─── Footer ─── */}
      <footer className="relative z-10 pt-16 pb-10 px-6" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div>
            <img src="/sia-logo.png" alt="SIA" className="h-10 w-auto brightness-0 invert mb-2" />
            <p className="text-white/30 text-sm">Execution-first AI for the Enterprise.</p>
          </div>
          <div className="flex gap-8 text-white/40 text-sm">
            {['Privacy', 'Terms', 'Cookies'].map((link) => (
              <a key={link} href="#" className="relative group overflow-hidden hover:text-white/70 transition-colors">
                {link}
                <span className="absolute bottom-0 left-0 w-full h-px bg-[#E8B84A] -translate-x-full transition-transform duration-300 group-hover:translate-x-0" />
              </a>
            ))}
          </div>
        </div>
        <div className="mt-16 text-center text-white/10 text-xs tracking-widest">
          © {new Date().getFullYear()} SIA INC. ALL RIGHTS RESERVED.
        </div>
      </footer>

      <Chatbot />
    </div>
  );
}



// ─── Orbiting Product Component ───
function OrbitingProduct({
  product, x, y, index, isHovered, onHover, onLeave, onClick
}: {
  product: typeof products[0];
  x: number;
  y: number;
  index: number;
  isHovered: boolean;
  onHover: () => void;
  onLeave: () => void;
  onClick: () => void;
}) {
  const IconComponent = product.icon;

  return (
    <motion.div
      className="absolute left-1/2 top-1/2 cursor-pointer"
      style={{
        x: x - 60,
        y: y - 60,
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{
        scale: isHovered ? 1.15 : 1,
        opacity: 1,
      }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 20,
        delay: index * 0.1,
      }}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onClick={onClick}
    >
      <motion.div
        className="w-32 h-32 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden"
        style={{
          background: isHovered
            ? `linear-gradient(135deg, ${product.color}30, ${product.color}15)`
            : `rgba(255,255,255,0.04)`,
          border: `1px solid ${isHovered ? product.color : 'rgba(255,255,255,0.1)'}`,
          boxShadow: isHovered ? `0 0 40px ${product.color}40` : '0 4px 20px rgba(0,0,0,0.3)',
        }}
        whileHover={{ rotate: [0, -5, 5, 0] }}
        transition={{ duration: 0.4 }}
      >
        <IconComponent
          className="w-10 h-10 mb-2"
          style={{ color: product.color }}
        />
        <span className="text-white text-xs font-semibold text-center px-2">
          {product.name.split(' ')[0]}
        </span>

        {/* Pulse effect on hover */}
        {isHovered && (
          <motion.div
            className="absolute inset-0 rounded-2xl"
            style={{ border: `2px solid ${product.color}` }}
            initial={{ scale: 1, opacity: 0.6 }}
            animate={{ scale: 1.3, opacity: 0 }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        )}
      </motion.div>

      {/* Hover info card */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            className="absolute left-full ml-4 top-1/2 -translate-y-1/2 w-64 p-4 rounded-xl"
            style={{
              background: 'rgba(10, 0, 20, 0.95)',
              border: `1px solid ${product.color}40`,
              backdropFilter: 'blur(20px)',
              boxShadow: `0 10px 40px ${product.color}20`,
            }}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            <h4 className="text-white font-semibold text-sm mb-1">{product.name}</h4>
            <p className="text-white/50 text-xs mb-3">{product.tagline}</p>
            <div className="flex items-center justify-between">
              <span className="text-white font-bold text-lg">{product.price}</span>
              <span className="text-xs" style={{ color: product.color }}>
                Click to learn more →
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

const ProductDetailsSection = forwardRef<
  HTMLDivElement,
  { product: typeof products[0]; products: typeof products; onSelectProduct: (p: typeof products[0]) => void }
>(({ product, products, onSelectProduct }, ref) => {
  const featureIcons = [Sparkles, Target, Users, BarChart3, TrendingUp, Zap, Bot, MoveRight, Check];
  const otherProducts = products.filter(p => p.id !== product.id).slice(0, 2);

  return (
    <motion.div
      ref={ref}
      className="relative z-10 py-24 px-6 w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Subtle divider */}
      <div className="max-w-7xl mx-auto mb-24" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }} />

      <div className="max-w-7xl mx-auto">

        {/* Overview */}
        <motion.div
          className="mb-28"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.6 }}
        >
          <div className="grid grid-cols-3 gap-14 items-center">
            <div className="col-span-1">
              <h2 className="text-4xl font-light text-white mb-6 text-center">
                {product.name}
              </h2>
              <p className="text-base text-white/55 leading-relaxed mb-6">{product.description}</p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: product.color }} />
                <span className="text-white/40 text-sm">Premium features included</span>
              </div>
            </div>
            <div className="col-span-2">
              <div
                className="w-full h-[380px] rounded-2xl flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${product.color}14, ${product.color}06)`,
                  border: `1px solid ${product.color}20`,
                }}
              >
                <div className="text-center opacity-40">
                  {getCategoryRobot(product.category, 120)}
                  <p className="text-white text-sm mt-4">Illustration coming soon</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Features breakdown */}
        <motion.div
          className="mb-28"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.6 }}
        >
          <div className="grid grid-cols-3 gap-14 items-start">
            <div className="col-span-1">
              <h3 className="text-4xl font-light text-white mb-4">
                How does
                <div className="text-4xl font-semibold mt-1" style={{ color: product.color }}>
                  {getBrandName(product.category)} work?
                </div>
              </h3>
              <p className="text-base text-white/50 leading-relaxed">
                A breakdown of the core capabilities — each function is designed to save time, reduce manual effort, and deliver measurable results.
              </p>
            </div>
            <div className="col-span-2">
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                {product.features.map((feat, idx) => {
                  const FeatureIcon = featureIcons[idx % featureIcons.length];
                  return (
                    <motion.div
                      key={idx}
                      className="py-6 flex gap-6 items-start"
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: false, amount: 0.2 }}
                      transition={{ delay: idx * 0.07 }}
                    >
                      <div
                        className="w-11 h-11 rounded-xl flex-shrink-0 flex items-center justify-center"
                        style={{
                          background: `${product.color}18`,
                          border: `1px solid ${product.color}30`,
                        }}
                      >
                        <FeatureIcon className="w-5 h-5" style={{ color: product.color }} />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-white mb-1">{feat}</h4>
                        <p className="text-white/45 text-sm leading-relaxed">
                          {`Provides ${feat.toLowerCase()} to streamline processes, increase accuracy, and save time.`}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Demo/Video */}
        <motion.div
          className="mb-28"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.6 }}
        >
          <h3 className="text-4xl font-light text-white text-center mb-10">
            See <span style={{ color: product.color }}>{product.name}</span> in action
          </h3>
          <div
            className="w-full h-[460px] rounded-2xl flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${product.color}10, ${product.color}04)`,
              border: `1px solid ${product.color}18`,
            }}
          >
            <div className="text-center opacity-40">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: `${product.color}25`, border: `2px solid ${product.color}50` }}
              >
                <span className="text-4xl">▶</span>
              </div>
              <p className="text-white text-sm">Demo video coming soon</p>
            </div>
          </div>
        </motion.div>

        {/* Other products upsell */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <div className="grid grid-cols-3 gap-14 items-center">
            <div className="col-span-1">
              <p className="text-white/40 text-base mb-3">Not what you're looking for?</p>
              <h3 className="text-3xl font-light text-white">
                Check our other{' '}
                <span style={{ color: product.color }}>solutions</span>
              </h3>
            </div>
            <div className="col-span-2 flex gap-5">
              {otherProducts.map((prod) => (
                <motion.button
                  key={prod.id}
                  onClick={() => onSelectProduct(prod)}
                  whileHover={{ scale: 1.02, y: -3 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 px-6 py-5 rounded-xl text-left group"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    transition: 'border-color 0.2s, background 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = prod.color + '60';
                    (e.currentTarget as HTMLElement).style.background = `${prod.color}0D`;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.1)';
                    (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)';
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {prod.icon && <prod.icon className="w-4 h-4" style={{ color: prod.color }} />}
                    <h4 className="text-base font-semibold text-white">{prod.name}</h4>
                  </div>
                  <p className="text-sm text-white/40">{prod.tagline}</p>
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

      </div>
    </motion.div>
  );
});

ProductDetailsSection.displayName = 'ProductDetailsSection';