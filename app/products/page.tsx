'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { MoveRight, Sparkles, Zap, Target, Users, TrendingUp, BarChart3, Bot } from 'lucide-react';

// Product categories with colors
const categories = [
  { id: 'category1', label: 'Category 1', color: '#A855F7' }, // Purple
  { id: 'category2', label: 'Category 2', color: '#E8B84A' }, // Golden
  { id: 'category3', label: 'Category 3', color: '#06B6D4' }, // Blue
];

// Product data with placeholder content - 3 hero cards per category
const products = [
  // Category 1 Hero Cards - Purple with varying intensity
  {
    id: 1,
    category: 'category1',
    icon: Bot,
    color: '#A855F7',
    colorIntensity: 0.4,
    name: 'Hero Product 1A',
    tagline: 'Premium solution for your needs',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.',
    features: ['Premium Feature 1', 'Premium Feature 2', 'Premium Feature 3', 'Premium Feature 4'],
    price: '$499/mo',
  },
  {
    id: 2,
    category: 'category1',
    icon: Sparkles,
    color: '#A855F7',
    colorIntensity: 0.6,
    name: 'Hero Product 1B',
    tagline: 'Advanced capabilities unleashed',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.',
    features: ['Advanced Feature 1', 'Advanced Feature 2', 'Advanced Feature 3', 'Advanced Feature 4'],
    price: '$699/mo',
  },
  {
    id: 3,
    category: 'category1',
    icon: Zap,
    color: '#A855F7',
    colorIntensity: 0.8,
    name: 'Hero Product 1C',
    tagline: 'Complete enterprise solution',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.',
    features: ['Enterprise Feature 1', 'Enterprise Feature 2', 'Enterprise Feature 3', 'Enterprise Feature 4'],
    price: '$999/mo',
  },
  // Category 2 Hero Cards - Golden with varying intensity
  {
    id: 4,
    category: 'category2',
    icon: Target,
    color: '#E8B84A',
    colorIntensity: 0.4,
    name: 'Hero Product 2A',
    tagline: 'Precision and performance',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.',
    features: ['Performance Feature 1', 'Performance Feature 2', 'Performance Feature 3', 'Performance Feature 4'],
    price: '$599/mo',
  },
  {
    id: 5,
    category: 'category2',
    icon: Users,
    color: '#E8B84A',
    colorIntensity: 0.6,
    name: 'Hero Product 2B',
    tagline: 'Team collaboration made easy',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.',
    features: ['Collaboration Feature 1', 'Collaboration Feature 2', 'Collaboration Feature 3', 'Collaboration Feature 4'],
    price: '$799/mo',
  },
  {
    id: 6,
    category: 'category2',
    icon: BarChart3,
    color: '#E8B84A',
    colorIntensity: 0.8,
    name: 'Hero Product 2C',
    tagline: 'Analytics and insights',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.',
    features: ['Analytics Feature 1', 'Analytics Feature 2', 'Analytics Feature 3', 'Analytics Feature 4'],
    price: '$899/mo',
  },
  // Category 3 Hero Cards - Blue with varying intensity
  {
    id: 7,
    category: 'category3',
    icon: TrendingUp,
    color: '#06B6D4',
    colorIntensity: 0.4,
    name: 'Hero Product 3A',
    tagline: 'Growth acceleration tools',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.',
    features: ['Growth Feature 1', 'Growth Feature 2', 'Growth Feature 3', 'Growth Feature 4'],
    price: '$449/mo',
  },
  {
    id: 8,
    category: 'category3',
    icon: Zap,
    color: '#06B6D4',
    colorIntensity: 0.6,
    name: 'Hero Product 3B',
    tagline: 'Automation excellence',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.',
    features: ['Automation Feature 1', 'Automation Feature 2', 'Automation Feature 3', 'Automation Feature 4'],
    price: '$649/mo',
  },
  {
    id: 9,
    category: 'category3',
    icon: Sparkles,
    color: '#06B6D4',
    colorIntensity: 0.8,
    name: 'Hero Product 3C',
    tagline: 'Innovation at your fingertips',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.',
    features: ['Innovation Feature 1', 'Innovation Feature 2', 'Innovation Feature 3', 'Innovation Feature 4'],
    price: '$849/mo',
  },
];

export default function ProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState('category1');

  // Filter products based on selected category - always show exactly 3 hero cards
  const filteredProducts = products.filter(product => product.category === selectedCategory);

  return (
    <div className="bg-gradient-to-b from-white via-[#faf5ff] to-[#e9d5ff] min-h-screen w-full overflow-x-hidden">
      {/* Header/Navbar */}
      <header
        className="fixed top-0 left-0 right-0 z-50 px-6 py-4"
        style={{
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <a href="/" className="text-2xl font-bold text-white tracking-widest">
            OPSERA
          </a>

          {/* Nav Links */}
          <nav className="flex items-center gap-4">
            <a href="/" className="text-white/70 hover:text-white transition-colors font-medium px-4 py-2 rounded-full border border-white/20 hover:border-white/40">
              Home
            </a>
            <a href="/about" className="text-white/70 hover:text-white transition-colors font-medium px-4 py-2 rounded-full border border-white/20 hover:border-white/40">
              About Us
            </a>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white text-black px-5 py-2 rounded-full text-sm font-medium"
            >
              Get Started
            </motion.button>
          </nav>
        </div>
      </header>

      {/* Hero Section - Removed */}

      {/* Products Grid Section */}
      <section className="relative pt-32 pb-20 px-6 min-h-screen">
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
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-light text-[#2D1B4E] mb-6 tracking-tight drop-shadow-lg">
              Explore our <span className="italic text-[#E8B84A]">solutions</span>
            </h1>
            <p className="text-xl text-[#2D1B4E]/70 max-w-3xl mx-auto leading-relaxed">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>
          </motion.div>

          {/* Category Selection Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex justify-center mb-16"
          >
            <div className="relative inline-flex items-center gap-2 p-2 rounded-full border border-[#2D1B4E]/20 bg-white/10 backdrop-blur-md">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`
                    relative z-10 px-8 py-3 rounded-full text-base font-semibold transition-colors duration-300
                    ${selectedCategory === category.id
                      ? 'text-white'
                      : 'text-[#2D1B4E]/70 hover:text-[#2D1B4E]'
                    }
                  `}
                >
                  {category.label}
                </button>
              ))}
              {/* Animated background fill */}
              <motion.div
                layoutId="categoryFill"
                className="absolute rounded-full"
                style={{
                  backgroundColor: categories.find(c => c.id === selectedCategory)?.color,
                  boxShadow: `0 0 20px ${categories.find(c => c.id === selectedCategory)?.color}40`,
                }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30
                }}
                animate={{
                  left: selectedCategory === 'category1' ? '8px' : selectedCategory === 'category2' ? 'calc(33.33% + 2px)' : 'calc(66.66% - 4px)',
                  width: 'calc(33.33% - 8px)',
                  height: 'calc(100% - 16px)',
                  top: '8px',
                }}
              />
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
                <ProductCard key={product.id} product={product} index={index} />
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
              Ready to <span className="italic text-[#E8B84A]">transform</span> your operations?
            </h3>
            <p className="text-xl text-white/60 mb-8">
              Schedule a demo and see how our products can work for you
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

// Product Card Component with Flip Animation
function ProductCard({ product, index }: { product: typeof products[0], index: number }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const IconComponent = product.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="perspective-1000"
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
    >
      <motion.div
        className="relative w-full h-[400px] cursor-pointer"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{
          duration: 0.6,
          ease: [0.4, 0, 0.2, 1]
        }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Front of Card */}
        <div
          className="absolute inset-0 rounded-2xl border-2 backdrop-blur-md p-6 flex flex-col justify-between overflow-hidden"
          style={{
            backfaceVisibility: "hidden",
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

          {/* Price */}
          <div className="relative z-10 flex items-center justify-between">
            <span className="text-2xl font-bold text-[#2D1B4E]">{product.price}</span>
            <span
              className="text-sm font-medium"
              style={{ color: product.color }}
            >
              Learn more →
            </span>
          </div>
        </div>

        {/* Back of Card */}
        <div
          className="absolute inset-0 rounded-2xl border-2 backdrop-blur-md p-6 flex flex-col justify-between"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
            borderColor: `${product.color}`,
            boxShadow: `0 8px 32px 0 rgba(0, 0, 0, 0.1), inset 0 1px 1px 0 rgba(255, 255, 255, 0.2), 0 0 40px ${product.color}20`,
          }}
        >
          {/* Frosted glass effect overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(circle at bottom left, ${product.color}25, transparent 70%)`,
            }}
          />

          <div className="relative z-10">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center backdrop-blur-sm"
                style={{
                  backgroundColor: product.color,
                  boxShadow: `0 4px 16px ${product.color}30`,
                }}
              >
                <IconComponent className="w-5 h-5 text-white" />
              </div>
              <h4 className="text-xl font-bold text-[#2D1B4E]">{product.name}</h4>
            </div>

            {/* Features */}
            <div className="space-y-3">
              <p className="text-[#2D1B4E]/50 text-xs font-medium uppercase tracking-wider">Features</p>
              <div className="space-y-2">
                {product.features.map((feature, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * idx }}
                    className="flex items-center gap-2 text-sm text-[#2D1B4E]/80"
                  >
                    <div
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: product.color }}
                    />
                    {feature}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="relative z-10 w-full py-3 rounded-xl font-semibold text-white transition-all duration-300 backdrop-blur-sm"
            style={{
              backgroundColor: product.color,
              border: `1px solid ${product.color}`,
              boxShadow: `0 4px 16px ${product.color}40`,
            }}
          >
            Get Started
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}