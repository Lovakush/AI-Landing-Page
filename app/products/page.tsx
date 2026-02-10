'use client';

import { motion, AnimatePresence, useScroll, useTransform, useInView } from 'framer-motion';
import { useState, useEffect, useRef, forwardRef } from 'react';
import { MoveRight, Sparkles, Zap, Target, Users, TrendingUp, BarChart3, Bot, Check } from 'lucide-react';

// Dynamic words for header
const dynamicWords = ["marketing", "hr", "sales", "advertising", "job postings", "lead generation"];

// Product categories with colors
const categories = [
  { id: 'category1', label: 'Marketing', color: '#A855F7' }, // Purple
  { id: 'category2', label: 'Human Resources', color: '#E8B84A' }, // Golden
  { id: 'category3', label: 'Sales', color: '#06B6D4' }, // Blue
];

// Brand names for each category
const getBrandName = (category: string): string => {
  switch(category) {
    case 'category1':
      return 'Mark';
    case 'category2':
      return 'Consuelo';
    case 'category3':
      return 'Argeo';
    default:
      return 'Our Product';
  }
};

// Product data with placeholder content - 3 hero cards per category
const products = [
  // Marketing Category - Mark (Purple)
  {
    id: 1,
    category: 'category1',
    icon: Sparkles,
    color: '#A855F7',
    colorIntensity: 0.4,
    name: 'Content & Social Media Agent',
    tagline: 'Create and manage engaging social content',
    description: 'An AI-powered agent that generates, schedules, and optimizes social media content across all major platforms. From caption writing to content calendar management.',
    features: ['Content Generation', 'Social Scheduling', 'Engagement Analytics', 'Brand Voice Consistency'],
    price: '$499/mo',
  },
  {
    id: 2,
    category: 'category1',
    icon: Target,
    color: '#A855F7',
    colorIntensity: 0.6,
    name: 'Advertising Agent',
    tagline: 'Optimize ad campaigns and maximize ROI',
    description: 'Intelligent ad management automation that creates, tests, and optimizes campaigns across Google Ads, Meta, and LinkedIn. Real-time bid optimization and audience targeting.',
    features: ['Campaign Automation', 'Bid Optimization', 'A/B Testing', 'ROI Tracking'],
    price: '$699/mo',
  },
  {
    id: 3,
    category: 'category1',
    icon: Zap,
    color: '#A855F7',
    colorIntensity: 0.8,
    name: 'Full Marketing Agent',
    tagline: 'Complete marketing automation suite',
    description: 'The complete Mark solution combining content creation, ad management, and analytics. Unified platform for all your marketing needs with full AI automation.',
    features: ['Content Generation', 'Ad Optimization', 'Lead Scoring', 'Performance Analytics'],
    price: '$1,299/mo',
  },
  // Human Resources Category - Consuelo (Golden)
  {
    id: 4,
    category: 'category2',
    icon: Users,
    color: '#E8B84A',
    colorIntensity: 0.4,
    name: 'CV Screening',
    tagline: 'Intelligent resume screening and evaluation',
    description: 'Automate resume review and candidate qualification. AI evaluates CVs against job requirements, identifies top candidates, and flags red flags in seconds.',
    features: ['Resume Parsing', 'Skill Matching', 'Qualification Scoring', 'Bias-free Evaluation'],
    price: '$399/mo',
  },
  {
    id: 5,
    category: 'category2',
    icon: BarChart3,
    color: '#E8B84A',
    colorIntensity: 0.6,
    name: 'Job Creation',
    tagline: 'Automated job description generation',
    description: 'Generate compelling and SEO-optimized job descriptions in minutes. AI creates role-specific descriptions, requirements, and benefits tailored to your company culture.',
    features: ['Description Generation', 'SEO Optimization', 'Salary Recommendation', 'Culture Matching'],
    price: '$299/mo',
  },
  {
    id: 6,
    category: 'category2',
    icon: Bot,
    color: '#E8B84A',
    colorIntensity: 0.8,
    name: 'Full HR Agent',
    tagline: 'Comprehensive HR automation platform',
    description: 'The complete Consuelo solution combining CV screening, job creation, and candidate engagement. End-to-end recruitment and HR automation in one platform.',
    features: ['Resume Screening', 'Job Description', 'Candidate Engagement', 'Analytics Dashboard'],
    price: '$899/mo',
  },
  // Sales Category - Argeo (Blue)
  {
    id: 7,
    category: 'category3',
    icon: Target,
    color: '#06B6D4',
    colorIntensity: 0.4,
    name: 'Lead Generation and Classification',
    tagline: 'AI-powered lead identification and scoring',
    description: 'Discover and qualify hot leads automatically. AI scans the market, identifies prospects matching your ideal customer profile, and scores them for sales-readiness.',
    features: ['Lead Discovery', 'Qualification Scoring', 'Prospect Research', 'CRM Integration'],
    price: '$499/mo',
  },
  {
    id: 8,
    category: 'category3',
    icon: MoveRight,
    color: '#06B6D4',
    colorIntensity: 0.6,
    name: 'Meeting Agent',
    tagline: 'Autonomous meeting scheduling and management',
    description: 'Never chase meeting availability again. AI proactively schedules calls with prospects, sends reminders, and follows up—moving deals forward 24/7.',
    features: ['Meeting Scheduling', 'Calendar Integration', 'Intelligent Reminders', 'Follow-up Automation'],
    price: '$599/mo',
  },
  {
    id: 9,
    category: 'category3',
    icon: TrendingUp,
    color: '#06B6D4',
    colorIntensity: 0.8,
    name: 'Full Sales Agent',
    tagline: 'End-to-end sales automation',
    description: 'The complete Argeo solution combining lead generation, meeting management, and pipeline tracking. Your complete autonomous sales team working 24/7.',
    features: ['Lead Generation', 'Meeting Scheduling', 'Pipeline Management', 'Win Rate Analytics'],
    price: '$1,199/mo',
  },
];

export default function ProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState('category1');
  const [wordIndex, setWordIndex] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState<typeof products[0] | null>(null);
  const [navVisible, setNavVisible] = useState(true);
  const lastScrollY = useRef(0);

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
  const [shouldScrollToDetails, setShouldScrollToDetails] = useState(false);
  const productDetailsRef = useRef<HTMLDivElement>(null);

  // Rotate words
  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % dynamicWords.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  // Update selected product when category changes - select first product of the category
  useEffect(() => {
    const firstProductInCategory = products.find(p => p.category === selectedCategory);
    setSelectedProduct(firstProductInCategory || null);
  }, [selectedCategory]);

  // Scroll to product details when product is selected AND shouldScrollToDetails flag is true
  useEffect(() => {
    if (selectedProduct && productDetailsRef.current && shouldScrollToDetails) {
      setTimeout(() => {
        productDetailsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
      // Reset the flag after scrolling
      setShouldScrollToDetails(false);
    }
  }, [selectedProduct, shouldScrollToDetails]);

  // Filter products based on selected category - always show exactly 3 hero cards
  const filteredProducts = products.filter(product => product.category === selectedCategory);

  return (
    <div className="bg-gradient-to-b from-white via-[#faf5ff] via-[#e9d5ff] to-[#12041a] min-h-screen w-full overflow-x-hidden">
      {/* Header/Navbar */}
      <header
        className="fixed top-0 left-0 right-0 z-50 px-8 h-20"
        style={{
          background: 'rgba(13, 0, 21, 0.85)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          transform: navVisible ? 'translateY(0)' : 'translateY(-100%)',
          transition: 'transform 0.3s ease-in-out',
        }}
      >
        <div className="max-w-7xl mx-auto h-full flex items-center justify-between">
          {/* Logo */}
          <a href="/" className="flex items-center h-full">
            <img src="/sia-logo.png" alt="SIA" className="h-full py-3 w-auto brightness-0 invert" />
          </a>

          {/* Nav Links + CTA */}
          <nav className="flex items-center gap-8">
            <a href="/" className="text-white/60 hover:text-white transition-colors text-sm font-medium tracking-wide">
              Home
            </a>
            <a href="/products" className="text-white hover:text-white transition-colors text-sm font-medium tracking-wide">
              Products
            </a>
            <a href="/about" className="text-white/60 hover:text-white transition-colors text-sm font-medium tracking-wide">
              About Us
            </a>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                document.getElementById('cta')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-[#2D1B4E] text-sm font-semibold px-4 py-2 rounded-lg bg-gradient-to-r from-[#E8B84A] to-[#E8A87C] hover:shadow-[0_0_20px_rgba(232,184,74,0.3)] transition-all ml-4"
            >
              Get Started
            </motion.button>
          </nav>
        </div>
      </header>

      {/* Hero Section - Removed */}

      {/* Products Grid Section */}
      <section className="relative pt-20 pb-20 px-6 min-h-screen" data-products-section>
        {/* Background effects */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#A855F7]/10 rounded-full blur-[200px]" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#E8B84A]/8 rounded-full blur-[180px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#06B6D4]/5 rounded-full blur-[150px]" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Page Description Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-light text-[#2D1B4E] mb-25 mt-32 tracking-tight drop-shadow-lg">
              Intelligent solutions for your:
              <div className="relative w-full h-[1.7em] mt-3 overflow-hidden">
                {dynamicWords.map((word, index) => (
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
            <p className="text-xl text-[#2D1B4E]/70 max-w-3xl mx-auto leading-relaxed">
              Autonomous AI agents designed for Marketing, HR, and Sales. Choose the perfect level of automation—from specialized tools to full-suite intelligent platforms.
            </p>
          </motion.div>

          {/* Category Selection Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex justify-center mb-16"
          >
            <div className="relative inline-flex items-center gap-1 p-2 rounded-full border border-[#2D1B4E]/20 bg-white/10 backdrop-blur-md">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`
                    relative z-10 px-6 py-3 rounded-full text-base font-semibold transition-colors duration-300 flex items-center justify-center whitespace-nowrap
                    ${selectedCategory === category.id
                      ? 'text-white'
                      : 'text-[#2D1B4E]/70 hover:text-[#2D1B4E]'
                    }
                  `}
                >
                  {selectedCategory === category.id && (
                    <motion.div
                      layoutId="categoryFill"
                      className="absolute inset-0 rounded-full -z-10"
                      style={{
                        backgroundColor: category.color,
                        boxShadow: `0 0 20px ${category.color}40`,
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30
                      }}
                    />
                  )}
                  {category.label}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Product Cards Grid */}
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedCategory}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-3 gap-8"
            >
              {filteredProducts.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  index={index}
                  onLearnMore={() => setSelectedProduct(product)}
                  selectedId={selectedProduct?.id}
                />
              ))}
            </motion.div>
          </AnimatePresence>

          {/* No products message */}
          {filteredProducts.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <p className="text-white/40 text-lg">No products found in this category</p>
            </motion.div>
          )}
        </div>
      </section>

      {/* Product Details Section */}
      <AnimatePresence mode="wait">
        {selectedProduct && (
          <ProductDetailsSection
            key={`product-${selectedProduct.id}`}
            product={selectedProduct}
            products={filteredProducts}
            onSelectProduct={(prod) => {
              setSelectedProduct(prod);
              setShouldScrollToDetails(true);
              // Scroll back to products section
              setTimeout(() => {
                document.querySelector('[data-products-section]')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }, 100);
            }}
            ref={productDetailsRef}
          />
        )}
      </AnimatePresence>

      {/* CTA Section */}
      <section className="relative py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h3 className="text-4xl md:text-5xl font-light text-white mb-6">
              Ready to <span className="italic text-[#E8B84A]">automate</span> your business?
            </h3>
            <p className="text-xl text-white/60 mb-8">
              See how our AI agents can revolutionize your Marketing, HR, and Sales operations
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#E8B84A] to-[#E8A87C] text-[#2D1B4E] font-bold px-8 py-4 rounded-full text-lg shadow-[0_0_30px_rgba(232,184,74,0.4)] hover:shadow-[0_0_50px_rgba(232,184,74,0.6)] transition-all mx-auto"
            >
              Book a Demo <MoveRight className="w-5 h-5" />
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="pt-20 pb-10 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
          {/* Left: Logo & Tagline */}
          <div className="text-center md:text-left">
            <h4 className="text-2xl text-white tracking-widest mb-2">
              OPSERA
            </h4>
            <p className="text-white/40 text-sm tracking-wide">
              Execution-first AI for the Enterprise.
            </p>
          </div>

          {/* Center: Links */}
          <div className="flex gap-8 text-white/60 text-sm font-light tracking-wider">
            {["Privacy", "Terms", "Cookies"].map((link) => (
              <a key={link} href="#" className="relative group overflow-hidden">
                {link}
                <span className="absolute left-0 bottom-0 w-full h-[1px] bg-[#E8B84A] -translate-x-full transition-transform duration-300 group-hover:translate-x-0" />
              </a>
            ))}
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-20 text-center text-white/10 text-xs tracking-widest">
          © {new Date().getFullYear()} OPSERA INC. ALL RIGHTS RESERVED.
        </div>
      </footer>
    </div>
  );
}

// Product Card Component with Learn More Animation
function ProductCard({ product, index, onLearnMore, selectedId }: { product: typeof products[0], index: number, onLearnMore: () => void, selectedId?: number }) {
  const [isHovered, setIsHovered] = useState(false);
  const IconComponent = product.icon;
  const isSelected = selectedId === product.id;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="perspective-1000"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        className="relative w-full h-[400px] cursor-pointer"
        onClick={onLearnMore}
        transition={{
          duration: 0.45,
          ease: [0.4, 0, 0.2, 1]
        }}
        animate={{
          translateY: isHovered || isSelected ? -12 : 0,
          boxShadow: isHovered || isSelected ? `0 24px 48px ${product.color}20` : '0 8px 24px rgba(0,0,0,0.08)'
        }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Front of Card */}
        <div
          className="absolute inset-0 rounded-2xl border-2 backdrop-blur-md p-6 flex flex-col justify-between overflow-hidden"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
            borderColor: `${product.color}`,
            boxShadow: `0 8px 32px 0 rgba(0, 0, 0, 0.1), inset 0 1px 1px 0 rgba(255, 255, 255, 0.2), 0 0 40px ${product.color}20`,
          }}
        >
          {/* Frosted glass effect overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(circle at top right, ${product.color}25, transparent 70%)`,
            }}
          />

          <div className="relative z-10">
            {/* Icon */}
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 backdrop-blur-sm"
              style={{
                backgroundColor: `${product.color}${Math.round((product.colorIntensity || 0.5) * 255).toString(16).padStart(2, '0')}`,
                boxShadow: `0 4px 16px ${product.color}${Math.round((product.colorIntensity || 0.5) * 100)}`,
              }}
            >
              <IconComponent className="w-7 h-7" style={{ color: product.color }} />
            </div>

            {/* Name & Tagline */}
            <h4 className="text-2xl font-semibold text-[#2D1B4E] mb-2">{product.name}</h4>
            <p className="text-sm text-[#2D1B4E]/60 mb-4">{product.tagline}</p>

            {/* Description */}
            <p className="text-[#2D1B4E]/80 text-sm leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Price & Learn More */}
          <div className="relative z-10 flex items-center justify-between group">
            <span className="text-2xl font-bold text-[#2D1B4E]">{product.price}</span>
            <div className="flex items-center gap-1 overflow-hidden">
              <motion.span
                className="text-sm font-medium"
                style={{ color: product.color }}
                animate={isHovered || isSelected ? { opacity: [1, 0.25, 1], scale: [1, 1.05, 1] } : { opacity: 1, scale: 1 }}
                transition={isHovered || isSelected ? { duration: 0.8, repeat: Infinity } : {}}
              >
                Learn more
              </motion.span>
              <motion.span
                className="text-sm font-medium"
                style={{ color: product.color }}
                animate={isHovered || isSelected ? { x: [0, 6, 0] } : { x: 0 }}
                transition={isHovered || isSelected ? { duration: 0.8, repeat: Infinity, delay: 0.1 } : {}}
              >
                →
              </motion.span>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Product Details Section Component
const ProductDetailsSection = forwardRef<HTMLDivElement, { product: typeof products[0], products: typeof products, onSelectProduct: (prod: typeof products[0]) => void }>(
  ({ product, products, onSelectProduct }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
      target: containerRef,
      offset: ["start center", "end center"]
    });

    const overviewOpacity = useTransform(scrollYProgress, [0, 0.2], [0, 1]);
    const overviewY = useTransform(scrollYProgress, [0, 0.2], [50, 0]);

    const howItWorksOpacity = useTransform(scrollYProgress, [0.2, 0.4], [0, 1]);
    const howItWorksY = useTransform(scrollYProgress, [0.2, 0.4], [50, 0]);

    const waitlistOpacity = useTransform(scrollYProgress, [0.7, 0.85], [0, 1]);
    const waitlistY = useTransform(scrollYProgress, [0.7, 0.85], [100, 0]);

    const otherSolutionsOpacity = useTransform(scrollYProgress, [0.5, 0.65], [0, 1]);
    const otherSolutionsY = useTransform(scrollYProgress, [0.5, 0.65], [50, 0]);

    // Get other products from the same category
    const otherProducts = products.filter(p => p.id !== product.id).slice(0, 2);

    // Icons used for product feature items (cycled if more features than icons)
    const featureIcons = [Sparkles, Target, Users, BarChart3, TrendingUp, Zap, Bot, MoveRight, Check];

    return (
      <motion.div
        ref={ref}
        className="relative py-24 px-6 w-full"
        style={{
          background: `linear-gradient(to bottom, rgba(255,255,255,0.01) 0%, rgba(45,27,78,0.65) 45%, rgba(255,255,255,0.8) 100%)`
        }}
      >
        <div className="max-w-7xl mx-auto relative z-10" ref={containerRef}>
          {/* Overview Section */}
          <motion.div
            className="mb-32 py-32"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.6 }}
          >
            <div className="grid grid-cols-3 gap-12 items-center">
              {/* Text - 1/3 */}
              <div className="col-span-1">
                <motion.h2 
                  className="text-5xl font-light text-white mb-6"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, amount: 0.5 }}
                  transition={{ duration: 0.6 }}
                >
                  {product.name}
                </motion.h2>
                <motion.p 
                  className="text-lg text-white/70 leading-relaxed mb-6"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, amount: 0.5 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                >
                  {product.description}
                </motion.p>
                <motion.div 
                  className="flex items-center gap-2"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, amount: 0.5 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: product.color }}
                  />
                  <span className="text-white/60 text-sm">Premium features included</span>
                </motion.div>
              </div>

              {/* Illustration Placeholder - 2/3 */}
              <div className="col-span-2">
                <div
                  className="w-full h-[400px] rounded-2xl flex items-center justify-center border-2 border-white/10"
                  style={{
                    background: `linear-gradient(135deg, ${product.color}15, ${product.color}05)`
                  }}
                >
                  <div className="text-center">
                    <div
                      className="w-24 h-24 rounded-2xl flex items-center justify-center mx-auto mb-4"
                      style={{
                        backgroundColor: `${product.color}20`,
                        border: `2px solid ${product.color}40`
                      }}
                    >
                      <div className="text-6xl" style={{ color: product.color }}>
                        📊
                      </div>
                    </div>
                    <p className="text-white/40 text-sm">Illustration placeholder</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* How It Works / Feature List Section (image reference layout) */}
          <motion.div
            className="mb-32 py-32"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-full">
            <div className="grid grid-cols-3 gap-12 items-start">
              {/* Left: Heading & short intro (1/3) */}
              <div className="col-span-1">
                <motion.h3 
                  className="text-4xl font-light text-white mb-6"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, amount: 0.5 }}
                  transition={{ duration: 0.6 }}
                >
                  How does
                  <motion.div 
                    className="text-4xl font-semibold mt-2" 
                    style={{ color: product.color }}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, amount: 0.5 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                  >
                    {getBrandName(product.category)} work?
                  </motion.div>
                </motion.h3>
                <motion.p 
                  className="text-lg text-white/70 leading-relaxed"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, amount: 0.5 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  A short summary of the product capabilities — what it does and who it helps. Each item on the right shows a core function, a short description, and an icon for quick scanning.
                </motion.p>
              </div>

              {/* Right: Feature list (2/3) */}
              <div className="col-span-2">
                <div className="divide-y divide-white/6">
                  {product.features.map((feat, idx) => {
                    const FeatureIcon = featureIcons[idx % featureIcons.length];
                    return (
                      <motion.div
                        key={idx}
                        className="py-6 flex gap-6 items-start"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: false, amount: 0.2 }}
                        transition={{ delay: idx * 0.08 }}
                      >
                        <div className="flex-shrink-0">
                          <div
                            className="w-12 h-12 rounded-lg flex items-center justify-center shadow-lg"
                            style={{
                              background: `linear-gradient(135deg, ${product.color}20, transparent)`,
                              border: `1px solid ${product.color}30`,
                              boxShadow: `0 6px 24px ${product.color}20`
                            }}
                          >
                            <FeatureIcon className="w-5 h-5" style={{ color: product.color }} />
                          </div>
                        </div>

                        <div className="flex-1">
                          <h4 className="text-xl font-semibold text-white mb-2">{feat}</h4>
                          <p className="text-white/60 text-sm leading-relaxed">
                            {`Provides ${feat.toLowerCase()} to streamline processes, increase accuracy, and save time.`}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>
            </div>
          </motion.div>

          {/* See in Action Section */}
          <motion.div
            className="mb-32 py-32"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-full">
            <motion.h3 
              className="text-5xl font-light text-white text-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.5 }}
              transition={{ duration: 0.6 }}
            >
              See <span style={{ color: product.color }}>{product.name}</span> in action
            </motion.h3>
            <div
              className="w-full h-[500px] rounded-2xl flex items-center justify-center border-2 border-white/10 backdrop-blur-sm"
              style={{
                background: `linear-gradient(135deg, ${product.color}10, ${product.color}05)`
              }}
            >
              <div className="text-center">
                <div
                  className="w-32 h-32 rounded-2xl flex items-center justify-center mx-auto mb-6"
                  style={{
                    backgroundColor: `${product.color}20`,
                    border: `2px solid ${product.color}40`
                  }}
                >
                  <div className="text-7xl">▶️</div>
                </div>
                <p className="text-white/40 text-lg">Demo video placeholder</p>
              </div>
            </div>
            </div>
          </motion.div>

          {/* Other Solutions Section - appears almost instantly after demo */}
          <motion.div
            className="mb-8 py-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.5 }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-full">
            <div className="grid grid-cols-3 gap-12 items-center">
              {/* Left: Text */}
              <div className="col-span-1">
                <motion.p 
                  className="text-lg text-white/70 leading-relaxed"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, amount: 0.5 }}
                  transition={{ duration: 0.6 }}
                >
                  Not what you're looking for?
                </motion.p>
                <motion.h3 
                  className="text-3xl font-light text-white mt-4 mb-4"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, amount: 0.5 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                >
                  Check our other <span style={{ color: product.color }}>solutions</span>
                </motion.h3>
              </div>

              {/* Right: Product buttons */}
              <div className="col-span-2 flex gap-6">
                {otherProducts.map((prod) => (
                  <motion.button
                    key={prod.id}
                    onClick={() => onSelectProduct(prod)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 px-6 py-4 rounded-xl border border-white/20 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all text-left group"
                  >
                    <h4 className="text-lg font-semibold text-white group-hover:text-white mb-1 flex items-center gap-2">
                      {prod.icon && <prod.icon className="w-5 h-5" style={{ color: prod.color }} />}
                      {prod.name}
                    </h4>
                    <p className="text-sm text-white/60">{prod.tagline}</p>
                  </motion.button>
                ))}
              </div>
            </div>
            </div>
          </motion.div>

          {/* Waitlist Section - slide-in from bottom on final scroll */}
          <motion.div
            className="mb-12 py-24"
            initial={{ rotateX: -50, opacity: 0, y: 200 }}
            whileInView={{ rotateX: 0, opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            viewport={{ once: false, amount: 0.1 }}
          >
            <div 
              className="w-full rounded-2xl p-10 text-center bg-white shadow-lg"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <h4 className="text-4xl font-light text-gray-900 mb-4">
                Join the <span style={{ color: product.color }}>waitlist</span>
              </h4>
              <p className="text-lg text-gray-600 mb-8 max-w-3xl mx-auto">
                Get early access to {product.name} and be among the first to experience the future.
              </p>

              <form className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center gap-4 justify-center">
                <input
                  aria-label="Email address"
                  type="email"
                  className="w-full sm:w-96 px-5 py-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 placeholder:text-gray-400 outline-none text-base"
                  placeholder="you@company.com"
                />
                <label className="flex items-center gap-3 text-gray-700">
                  <input type="checkbox" className="w-5 h-5 accent-purple-600 bg-white border border-gray-300 rounded" />
                  <span className="text-base">Receive product updates</span>
                </label>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  whileHover={{
                    y: -4,
                    boxShadow: '0 10px 25px rgba(147, 51, 234, 0.3)'
                  }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className="px-8 py-3 rounded-lg font-semibold text-base whitespace-nowrap text-white"
                  style={{
                    background: 'linear-gradient(135deg, #9333ea 0%, #7e22ce 100%)',
                    boxShadow: '0 4px 15px rgba(147, 51, 234, 0.2)'
                  }}
                >
                  Join Waitlist
                </motion.button>
              </form>
            </div>
          </motion.div>
        </div>
      </motion.div>
    );
  }
);

ProductDetailsSection.displayName = 'ProductDetailsSection';