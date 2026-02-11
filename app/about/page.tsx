'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Chatbot from '@/components/ui/chatbot';
import { useState, useEffect, useRef } from 'react';
import Navbar from '@/components/ui/Navbar';

export default function AboutPage() {
  const [activePanel, setActivePanel] = useState<'why' | 'how' | 'what' | null>(null);
  const [activeWorkPanel, setActiveWorkPanel] = useState<'pain' | 'solution' | 'live' | null>(null);
  const [navVisible, setNavVisible] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
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

  const showPanel = (panel: 'why' | 'how' | 'what') => {
    setActivePanel(panel);
  };

  const resetPanel = () => {
    setActivePanel(null);
  };

  const showWorkPanel = (panel: 'pain' | 'solution' | 'live') => {
    setActiveWorkPanel(panel);
  };

  const resetWorkPanel = () => {
    setActiveWorkPanel(null);
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-white">
      <Navbar/>

      {/* SECTION 1: HERO + ORBITAL (Side by Side) */}
      <section className="pt-32 pb-20 px-16 bg-gradient-to-b from-amber-50 to-amber-50">
        <motion.div
          className="max-w-7xl mx-auto"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="grid grid-cols-2 gap-16 items-center min-h-[500px]">
            {/* Left: Hero Text + Panels */}
            <div className="relative min-h-72">
              <AnimatePresence mode="wait">
                {!activePanel && (
                  <motion.div
                    key="hero"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-light text-gray-900 mb-4 leading-tight tracking-tighter">
                      The AI revolution is <em className="italic text-amber-700">already here.</em>
                    </h1>
                    <p className="text-base md:text-lg text-gray-600 font-light mb-6 leading-relaxed">
                      The story, mission, and value behind SIA
                    </p>
                    <span className="text-xs md:text-sm text-gray-400 font-normal tracking-wider">
                      Click the circle to explore our story →
                    </span>
                  </motion.div>
                )}

                {activePanel === 'why' && (
                  <motion.div
                    key="why"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="inline-block px-4 py-1 rounded-full bg-amber-700/10 mb-6">
                      <span className="text-xs font-semibold tracking-widest text-amber-700 uppercase">Why we exist</span>
                    </div>
                    <h3 className="text-2xl md:text-3xl lg:text-4xl font-light text-gray-900 mb-4 leading-tight tracking-tight">
                      The future is arriving faster than businesses can react.
                    </h3>
                    <p className="text-base md:text-lg text-gray-600 font-light leading-relaxed">
                      We exist to turn this uncertainty into an advantage — putting our customers in a position to act decisively, rather than reactively.
                    </p>
                    <button
                      onClick={resetPanel}
                      className="mt-6 text-sm font-medium text-amber-700 hover:opacity-70 transition-opacity"
                    >
                      ← Back
                    </button>
                  </motion.div>
                )}

                {activePanel === 'how' && (
                  <motion.div
                    key="how"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="inline-block px-4 py-1 rounded-full bg-amber-700/10 mb-6">
                      <span className="text-xs font-semibold tracking-widest text-amber-700 uppercase">How we do it</span>
                    </div>
                    <h3 className="text-2xl md:text-3xl lg:text-4xl font-light text-gray-900 mb-4 leading-tight tracking-tight">
                      Global reach. In-house brains. Relentless speed.
                    </h3>
                    <p className="text-base md:text-lg text-gray-600 font-light leading-relaxed">
                      We combine a global footprint with deep in-house expertise and rapid execution — allowing us to adapt and deploy solutions tailored to each client.
                    </p>
                    <button
                      onClick={resetPanel}
                      className="mt-6 text-sm font-medium text-amber-700 hover:opacity-70 transition-opacity"
                    >
                      ← Back
                    </button>
                  </motion.div>
                )}

                {activePanel === 'what' && (
                  <motion.div
                    key="what"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="inline-block px-4 py-1 rounded-full bg-amber-700/10 mb-6">
                      <span className="text-xs font-semibold tracking-widest text-amber-700 uppercase">What we build</span>
                    </div>
                    <h3 className="text-2xl md:text-3xl lg:text-4xl font-light text-gray-900 mb-9 leading-tight tracking-tight">
                      Plug-and-play AI agents for the workflows that matter.
                    </h3>
                    <p className="text-base md:text-lg text-gray-600 font-light leading-relaxed">
                      Domain-specific AI agents that automate critical workflows for startups and SMEs — freeing teams to focus on high-value growth.
                    </p>
                    <button
                      onClick={resetPanel}
                      className="mt-6 text-sm font-medium text-amber-700 hover:opacity-70 transition-opacity"
                    >
                      ← Back
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right: Inverted Semicircle Orbital */}
            <div className="relative flex justify-center">
              <div
                className="relative w-[450px] h-64 pt-12 overflow-hidden"
                style={{
                  maskImage: 'linear-gradient(to bottom, black 75%, transparent 100%)',
                  WebkitMaskImage: 'linear-gradient(to bottom, black 75%, transparent 100%)',
                }}
              >
                {/* Concentric circles as interactive arcs */}
                <div className="relative w-[450px] h-[450px] -mt-4">
                  {/* Outermost Arc - Why */}
                  <motion.div
                    onClick={() => showPanel('why')}
                    className={`absolute rounded-full border-2 cursor-pointer transition-all duration-500 ${
                      activePanel === 'why'
                        ? 'border-amber-700/50'
                        : 'border-gray-900/12 hover:border-gray-900/35'
                    }`}
                    style={{
                      width: '450px',
                      height: '450px',
                      top: '0px',
                      left: '0px',
                      background: activePanel === 'why'
                        ? 'rgba(180, 83, 9, 0.05)'
                        : 'radial-gradient(circle at center, rgba(17, 24, 39, 0.02) 0%, rgba(17, 24, 39, 0.01) 100%)',
                    }}
                    animate={{
                      y: activePanel === 'why' ? -8 : 0,
                    }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                  >
                    <div
                      className={`absolute text-xs font-semibold tracking-widest uppercase transition-all duration-500 px-3 py-1 rounded-full z-20 ${
                        activePanel === 'why'
                          ? 'text-amber-700 bg-white/90'
                          : 'text-gray-900/40 bg-white/70'
                      }`}
                      style={{
                        left: '50%',
                        top: '0px',
                        transform: 'translate(-50%, -50%)',
                      }}
                    >
                      Why
                    </div>
                  </motion.div>

                  {/* Middle Arc - How */}
                  <motion.div
                    onClick={() => showPanel('how')}
                    className={`absolute rounded-full border-2 cursor-pointer transition-all duration-500 ${
                      activePanel === 'how'
                        ? 'border-amber-700/50'
                        : 'border-gray-900/12 hover:border-gray-900/35'
                    }`}
                    style={{
                      width: '310px',
                      height: '310px',
                      top: '70px',
                      left: '70px',
                      background: activePanel === 'how'
                        ? 'rgba(180, 83, 9, 0.05)'
                        : 'radial-gradient(circle at center, rgba(17, 24, 39, 0.04) 0%, rgba(17, 24, 39, 0.02) 100%)',
                    }}
                    animate={{
                      y: activePanel === 'how' ? -8 : 0,
                    }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                  >
                    <div
                      className={`absolute text-xs font-semibold tracking-widest uppercase transition-all duration-500 px-3 py-1 rounded-full z-10 ${
                        activePanel === 'how'
                          ? 'text-amber-700 bg-white/90'
                          : 'text-gray-900/40 bg-white/70'
                      }`}
                      style={{
                        left: '50%',
                        top: '2px',
                        transform: 'translate(-50%, -50%)',
                      }}
                    >
                      How
                    </div>
                  </motion.div>

                  {/* Innermost Arc - What */}
                  <motion.div
                    onClick={() => showPanel('what')}
                    className={`absolute rounded-full border-2 cursor-pointer transition-all duration-500 ${
                      activePanel === 'what'
                        ? 'border-amber-700/50'
                        : 'border-gray-900/12 hover:border-gray-900/35'
                    }`}
                    style={{
                      width: '170px',
                      height: '170px',
                      top: '140px',
                      left: '140px',
                      background: activePanel === 'what'
                        ? 'rgba(180, 83, 9, 0.1)'
                        : 'radial-gradient(circle at center, rgba(17, 24, 39, 0.08) 0%, rgba(17, 24, 39, 0.04) 100%)',
                    }}
                    animate={{
                      y: activePanel === 'what' ? -8 : 0,
                    }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                  >
                    <div
                      className={`absolute text-xs font-semibold tracking-widest uppercase transition-all duration-500 px-3 py-1 rounded-full z-10 ${
                        activePanel === 'what'
                          ? 'text-amber-700 bg-white/90'
                          : 'text-gray-900/40 bg-white/70'
                      }`}
                      style={{
                        left: '48%',
                        top: '2px',
                        transform: 'translate(-50%, -50%)',
                      }}
                    >
                      What
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* SECTION 2: THE PROBLEM */}
      <section className="py-32 px-16 bg-gradient-to-br from-gray-900 via-purple-900 to-purple-950 relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 30% 50%, rgba(168, 107, 101, 0.15) 0%, transparent 60%)',
          }}
        />
        <motion.div
          className="max-w-4xl mx-auto relative z-10"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-light text-white mb-8 leading-tight tracking-tight">
            The giants are <em className="italic text-amber-700">pulling ahead.</em>
          </h2>
          <p className="text-base md:text-lg text-white/70 mb-6 font-light leading-relaxed">
            The largest companies in the world are using AI to move faster, decide smarter, and widen the gap every quarter.
          </p>
          <p className="text-base md:text-lg text-white/70 mb-8 font-light leading-relaxed">
            Meanwhile, growing businesses are left choosing between expensive consultants, half-built tools, and doing everything manually.
          </p>
          <motion.div
            className="text-xl text-white font-medium pl-6 border-l-4 border-amber-700 mt-12"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            We started SIA because we believe that's wrong.
          </motion.div>
        </motion.div>
      </section>

      {/* SECTION 3: THE ANSWER */}
      <section className="py-32 px-16 bg-gradient-to-b from-white via-gray-50 to-white">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-light text-gray-900 mb-6 leading-tight tracking-tight">
              We exist to <em className="italic text-amber-700">level the field.</em>
            </h2>
            <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto font-light leading-relaxed">
              Plug-and-play AI agents that automate critical workflows, so your team stops drowning in operations and starts focusing on growth.
            </p>
          </motion.div>

          <div className="grid grid-cols-3 gap-8">
            {[
              {
                icon: '⚡',
                title: '30 days, not 6 months',
                description: 'No drawn-out implementation timelines. No enterprise-only pricing. No 40-page SOW before you see results.',
                bg: 'bg-amber-700/10',
                color: 'text-amber-700',
              },
              {
                icon: '⚙️',
                title: 'Tailored to how you run',
                description: "We don't hand you a platform and wish you luck. We deploy solutions built for how your business actually operates.",
                bg: 'bg-purple-600/10',
                color: 'text-purple-600',
              },
              {
                icon: '🎯',
                title: 'Free your best people',
                description: 'Our agents handle the workflows that quietly eat your team\'s time — sales, reporting, follow-ups, internal ops.',
                bg: 'bg-teal-600/10',
                color: 'text-teal-600',
              },
            ].map((card, idx) => (
              <motion.div
                key={idx}
                className="p-11 rounded-3xl border border-gray-200 bg-gradient-to-br from-amber-50 to-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: idx * 0.2 }}
              >
                <div className={`w-14 h-14 rounded-2xl ${card.bg} ${card.color} flex items-center justify-center text-2xl mb-6`}>
                  {card.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{card.title}</h3>
                <p className="text-base text-gray-700 font-light leading-relaxed">{card.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4: HOW WE WORK - Orbital Design */}
      <section className="py-32 px-16 bg-gradient-to-b from-amber-50 to-white">
        <div className="max-w-7xl mx-auto">
          {/* Scroll-based header that fades in and out */}
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.8, margin: "-50px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <motion.h2
              className="text-4xl md:text-5xl lg:text-6xl font-light text-gray-900 mb-6 leading-tight tracking-tight"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.8 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              How it <em className="italic text-amber-700">works</em>
            </motion.h2>
            <motion.p
              className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto font-light leading-relaxed"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: false, amount: 0.8 }}
              transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
            >
              No 40-page SOW. No six-month timeline. Just a clear path from problem to production.
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-2 gap-16 items-center min-h-[500px]">
            {/* Left: Inverted Semicircle Orbital */}
            <div className="relative flex justify-center">
              <div
                className="relative w-[450px] h-64 pt-12 overflow-hidden"
                style={{
                  maskImage: 'linear-gradient(to bottom, black 75%, transparent 100%)',
                  WebkitMaskImage: 'linear-gradient(to bottom, black 75%, transparent 100%)',
                }}
              >
                {/* Concentric circles as interactive arcs */}
                <div className="relative w-[450px] h-[450px] -mt-4">
                  {/* Outermost Arc - Going Live */}
                  <motion.div
                    onClick={() => showWorkPanel('live')}
                    className={`absolute rounded-full border-2 cursor-pointer transition-all duration-500 ${
                      activeWorkPanel === 'live'
                        ? 'border-amber-700/50'
                        : 'border-gray-900/12 hover:border-gray-900/35'
                    }`}
                    style={{
                      width: '450px',
                      height: '450px',
                      top: '0px',
                      left: '0px',
                      background: activeWorkPanel === 'live'
                        ? 'rgba(180, 83, 9, 0.05)'
                        : 'radial-gradient(circle at center, rgba(17, 24, 39, 0.02) 0%, rgba(17, 24, 39, 0.01) 100%)',
                    }}
                    animate={{
                      y: activeWorkPanel === 'live' ? -8 : 0,
                    }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                  >
                    <motion.div
                      className={`absolute text-xs font-semibold tracking-widest uppercase transition-all duration-500 px-3 py-1 rounded-full z-20 whitespace-nowrap ${
                        activeWorkPanel === 'live'
                          ? 'text-amber-700 bg-white/90'
                          : 'text-gray-900/40 bg-white/70'
                      }`}
                      style={{
                        left: '50%',
                        top: '0px',
                        transform: 'translate(-50%, -50%)',
                      }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.6, delay: 0.2 }}
                    >
                      Going Live
                    </motion.div>
                  </motion.div>

                  {/* Middle Arc - Custom Solution */}
                  <motion.div
                    onClick={() => showWorkPanel('solution')}
                    className={`absolute rounded-full border-2 cursor-pointer transition-all duration-500 ${
                      activeWorkPanel === 'solution'
                        ? 'border-amber-700/50'
                        : 'border-gray-900/12 hover:border-gray-900/35'
                    }`}
                    style={{
                      width: '310px',
                      height: '310px',
                      top: '70px',
                      left: '70px',
                      background: activeWorkPanel === 'solution'
                        ? 'rgba(180, 83, 9, 0.05)'
                        : 'radial-gradient(circle at center, rgba(17, 24, 39, 0.04) 0%, rgba(17, 24, 39, 0.02) 100%)',
                    }}
                    animate={{
                      y: activeWorkPanel === 'solution' ? -8 : 0,
                    }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                  >
                    <motion.div
                      className={`absolute text-xs font-semibold tracking-widest uppercase transition-all duration-500 px-3 py-1 rounded-full z-10 ${
                        activeWorkPanel === 'solution'
                          ? 'text-amber-700 bg-white/90'
                          : 'text-gray-900/40 bg-white/70'
                      }`}
                      style={{
                        left: '50%',
                        top: '2px',
                        transform: 'translate(-50%, -50%)',
                      }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.6, delay: 0.4 }}
                    >
                      Custom Solution
                    </motion.div>
                  </motion.div>

                  {/* Innermost Arc - Pain Points */}
                  <motion.div
                    onClick={() => showWorkPanel('pain')}
                    className={`absolute rounded-full border-2 cursor-pointer transition-all duration-500 ${
                      activeWorkPanel === 'pain'
                        ? 'border-amber-700/50'
                        : 'border-gray-900/12 hover:border-gray-900/35'
                    }`}
                    style={{
                      width: '170px',
                      height: '170px',
                      top: '140px',
                      left: '140px',
                      background: activeWorkPanel === 'pain'
                        ? 'rgba(180, 83, 9, 0.1)'
                        : 'radial-gradient(circle at center, rgba(17, 24, 39, 0.08) 0%, rgba(17, 24, 39, 0.04) 100%)',
                    }}
                    animate={{
                      y: activeWorkPanel === 'pain' ? -8 : 0,
                    }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                  >
                    <motion.div
                      className={`absolute text-xs font-semibold tracking-widest uppercase transition-all duration-500 px-3 py-1 rounded-full z-10 whitespace-nowrap ${
                        activeWorkPanel === 'pain'
                          ? 'text-amber-700 bg-white/90'
                          : 'text-gray-900/40 bg-white/70'
                      }`}
                      style={{
                        left: '48%',
                        top: '2px',
                        transform: 'translate(-50%, -50%)',
                      }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.6, delay: 0.6 }}
                    >
                      Pain Points
                    </motion.div>
                  </motion.div>
                </div>
              </div>
            </div>

            {/* Right: Text Explanations */}
            <div className="relative min-h-72">
              <AnimatePresence mode="wait">
                {!activeWorkPanel && (
                  <motion.div
                    key="default"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h3 className="text-2xl md:text-3xl lg:text-4xl font-light text-gray-900 mb-4 leading-tight tracking-tight">
                      Three steps to <em className="italic text-amber-700">operational freedom</em>
                    </h3>
                    <p className="text-base md:text-lg text-gray-600 font-light leading-relaxed mb-4">
                      From diagnosis to deployment, we move fast and build solutions that fit how your business actually runs.
                    </p>
                    <span className="text-xs md:text-sm text-gray-400 font-normal tracking-wider">
                      Click a circle to explore each step →
                    </span>
                  </motion.div>
                )}

                {activeWorkPanel === 'pain' && (
                  <motion.div
                    key="pain"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="inline-block px-4 py-1 rounded-full bg-amber-700/10 mb-6">
                      <span className="text-xs font-semibold tracking-widest text-amber-700 uppercase">Step 1</span>
                    </div>
                    <h3 className="text-2xl md:text-3xl lg:text-4xl font-light text-gray-900 mb-4 leading-tight tracking-tight">
                      You tell us what's <em className="italic text-amber-700">slowing you down</em>
                    </h3>
                    <p className="text-base md:text-lg text-gray-600 font-light leading-relaxed">
                      We dig into your workflows, team structure, and the bottlenecks quietly eating your time. No surface-level audits — we go deep.
                    </p>
                    <button
                      onClick={resetWorkPanel}
                      className="mt-6 text-sm font-medium text-amber-700 hover:opacity-70 transition-opacity"
                    >
                      ← Back
                    </button>
                  </motion.div>
                )}

                {activeWorkPanel === 'solution' && (
                  <motion.div
                    key="solution"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="inline-block px-4 py-1 rounded-full bg-amber-700/10 mb-6">
                      <span className="text-xs font-semibold tracking-widest text-amber-700 uppercase">Step 2</span>
                    </div>
                    <h3 className="text-2xl md:text-3xl lg:text-4xl font-light text-gray-900 mb-4 leading-tight tracking-tight">
                      We build around <em className="italic text-amber-700">how you actually run</em>
                    </h3>
                    <p className="text-base md:text-lg text-gray-600 font-light leading-relaxed">
                      No off-the-shelf platform. We design and deploy an AI agent tailored to your real operations — not a generic tool you'll need to bend around.
                    </p>
                    <button
                      onClick={resetWorkPanel}
                      className="mt-6 text-sm font-medium text-amber-700 hover:opacity-70 transition-opacity"
                    >
                      ← Back
                    </button>
                  </motion.div>
                )}

                {activeWorkPanel === 'live' && (
                  <motion.div
                    key="live"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="inline-block px-4 py-1 rounded-full bg-amber-700/10 mb-6">
                      <span className="text-xs font-semibold tracking-widest text-amber-700 uppercase">Step 3</span>
                    </div>
                    <h3 className="text-2xl md:text-3xl lg:text-4xl font-light text-gray-900 mb-4 leading-tight tracking-tight">
                      You're <em className="italic text-amber-700">live in weeks</em>
                    </h3>
                    <p className="text-base md:text-lg text-gray-600 font-light leading-relaxed">
                      Your agent is running, your team is freed up, and we keep iterating as your business evolves. No six-month timelines — just results.
                    </p>
                    <button
                      onClick={resetWorkPanel}
                      className="mt-6 text-sm font-medium text-amber-700 hover:opacity-70 transition-opacity"
                    >
                      ← Back
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: VISION & MISSION */}
      <section className="py-32 px-16 bg-gradient-to-br from-purple-950 via-gray-900 to-purple-900 relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at right, rgba(201, 149, 43, 0.08) 0%, transparent 60%)',
          }}
        />
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="grid grid-cols-2 gap-12">
            {[
              {
                label: 'Vision',
                text: 'A future where businesses of any size can act with the intelligence, intent, and speed once reserved for the few.',
              },
              {
                label: 'Mission',
                text: "To help growing businesses grow faster and operate smarter — by making tomorrow's technologies accessible today.",
              },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                className="p-12 rounded-3xl border border-white/8 bg-white/3 backdrop-blur-xl hover:bg-white/5 transition-all duration-300"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: idx * 0.2 }}
              >
                <div className="text-xs font-semibold tracking-widest text-amber-700 uppercase mb-6">{item.label}</div>
                <h3 className="text-2xl font-light text-white leading-relaxed">{item.text}</h3>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 6: CTA Form */}
      <section id="cta" className="py-40 px-16 bg-gradient-to-br from-white via-amber-50 to-purple-50 flex items-center justify-center">
        <motion.div
          className="w-full max-w-4xl"
          initial={{ opacity: 0, y: 120, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{
            duration: 1,
            ease: [0.22, 1, 0.36, 1],
            opacity: { duration: 0.8 },
            y: { duration: 1 },
            scale: { duration: 1 }
          }}
        >
          <div
            className="rounded-3xl p-10 text-center backdrop-blur-lg border border-white/60 shadow-2xl"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0.3) 100%)',
              boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.2), inset 0 1px 1px 0 rgba(255, 255, 255, 0.3)',
            }}
          >
            <motion.h2
              className="text-4xl font-light text-gray-900 mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Ready to <em className="italic text-amber-700">punch above your weight?</em>
            </motion.h2>
            <motion.p
              className="text-lg text-gray-600 mb-8 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              If that sounds like you, let's talk!
            </motion.p>

            <motion.form
              className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <input
                type="email"
                placeholder="you@company.com"
                className="w-full sm:w-96 px-5 py-3 rounded-lg bg-gray-50 border border-gray-300 text-gray-900 placeholder:text-gray-400 outline-none text-base focus:border-amber-700 focus:ring-2 focus:ring-amber-700/20 transition-all"
                aria-label="Email address"
              />
              <motion.button
                type="submit"
                whileTap={{ scale: 0.95 }}
                whileHover={{
                  y: -4,
                  boxShadow: '0 10px 25px rgba(147, 51, 234, 0.3)'
                }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="w-full sm:w-auto px-8 py-3 rounded-lg text-base font-semibold whitespace-nowrap text-white"
                style={{
                  background: 'linear-gradient(135deg, #9333ea 0%, #7e22ce 100%)',
                  boxShadow: '0 4px 15px rgba(147, 51, 234, 0.2)'
                }}
              >
                Book a Demo →
              </motion.button>
            </motion.form>
          </div>
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer className="py-10 px-16 border-t border-gray-200 flex justify-between items-center text-sm text-gray-600">
        <div className="flex items-center">
          <img src="/sia-logo.png" alt="SIA" className="h-10 w-auto" />
        </div>
        <div className="flex gap-8">
          <a href="#" className="hover:text-gray-900 transition-colors">
            Privacy
          </a>
          <a href="#" className="hover:text-gray-900 transition-colors">
            Terms
          </a>
          <a href="#" className="hover:text-gray-900 transition-colors">
            Cookies
          </a>
        </div>

        <div className="mt-20 text-center text-[#2D1B4E]/20 text-xs tracking-widest">
          © {new Date().getFullYear()} SIA INC. ALL RIGHTS RESERVED.
        </div>
      </footer>
      <Chatbot />
    </div>
  );
}
