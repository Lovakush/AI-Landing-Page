'use client';

import { motion } from 'framer-motion';
import Chatbot from '@/components/ui/chatbot';
import { useEffect, useState, useRef } from 'react';

import { useState } from 'react';

export default function AboutPage() {
  const [activePanel, setActivePanel] = useState<'why' | 'how' | 'what' | null>(null);

  const showPanel = (panel: 'why' | 'how' | 'what') => {
    setActivePanel(panel);
  };

  const resetPanel = () => {
    setActivePanel(null);
  };

  return (
    <div className="bg-gradient-to-b from-white via-[#faf5ff] to-white min-h-screen w-full overflow-x-hidden">
      {/* Header/Navbar */}
      <header
        className="fixed top-0 left-0 right-0 z-50 px-8 h-25"
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
          <a href="/" className="flex items-center h-full">
            <img src="/sia-logo.png" alt="SIA" className="h-full py-1 w-auto brightness-0 invert" />
          </a>
          <nav className="flex items-center gap-8">
            <a href="/" className="text-white/60 hover:text-white transition-colors text-sm font-medium tracking-wide">
              Home
            </a>
            <a href="/products" className="text-white/60 hover:text-white transition-colors text-sm font-medium tracking-wide">
              Products
            </a>
            <a href="/about" className="text-white hover:text-white transition-colors text-sm font-medium tracking-wide">
              About Us
            </a>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="text-[#2D1B4E] text-sm font-semibold px-4 py-2 rounded-lg bg-gradient-to-r from-[#E8B84A] to-[#E8A87C] hover:shadow-[0_0_20px_rgba(232,184,74,0.3)] transition-all ml-4"
            >
              Get Started
            </motion.button>
          </nav>
        </div>
      </header>

      {/* Main Content Container */}
      <div className="pt-24 min-h-screen flex flex-col">
        <div className="max-w-[1200px] mx-auto w-full px-6 flex-1 flex flex-col gap-6">
          {/* Upper Container - Orbits */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="bg-white rounded-xl overflow-hidden relative"
            style={{ minHeight: '600px' }}
          >
            {/* Header Text */}
            <div className="text-center pt-12 pb-8 px-6 relative z-10">
              <h1 className="text-4xl md:text-5xl font-light text-[#2D1B4E] mb-4 tracking-tight">
                Defining <span className="italic text-[#6366F1] font-normal">SIA</span>
              </h1>
              <p className="text-lg text-[#2D1B4E]/60 max-w-2xl mx-auto font-light">
                The story, mission and value
              </p>
            </div>

            {/* Orbital Composition */}
            <div className="absolute inset-x-0 bottom-0 h-[400px] overflow-hidden">
              <div className="relative w-full h-full max-w-5xl mx-auto">
                {/* Outermost Orbit - VISION */}
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: mounted ? 1 : 0, opacity: mounted ? 1 : 0 }}
                  transition={{ duration: 0.8, delay: 0 }}
                  className="absolute"
                  style={{
                    width: '900px',
                    height: '900px',
                    borderRadius: '50%',
                    border: '3px solid #6366F1',
                    bottom: '-515px',
                    left: '50%',
                    marginLeft: '-450px',
                    background: 'radial-gradient(circle at center, rgba(99, 102, 241, 0.05) 0%, rgba(99, 102, 241, 0.15) 50%, transparent 100%)',
                  }}
                />

              {/* Why Panel */}
              <motion.div
                className={`absolute inset-0 transition-all duration-500 ${
                  activePanel === 'why' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                }`}
              >
                <div className="inline-block px-4 py-1 rounded-full bg-amber-700/10 mb-6">
                  <span className="text-xs font-semibold tracking-widest text-amber-700 uppercase">Why we exist</span>
                </div>
                <h3 className="text-3xl font-light text-gray-900 mb-4 leading-tight">
                  The future is arriving faster than businesses can react.
                </h3>
                <p className="text-base text-gray-600 font-light leading-relaxed">
                  We exist to turn this uncertainty into an advantage — putting our customers in a position to act decisively, rather than reactively.
                </p>
                <button
                  onClick={resetPanel}
                  className="mt-6 text-sm font-medium text-amber-700 hover:opacity-70 transition-opacity"
                >
                  ← Back
                </button>
              </motion.div>

              {/* How Panel */}
              <motion.div
                className={`absolute inset-0 transition-all duration-500 ${
                  activePanel === 'how' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                }`}
              >
                <div className="inline-block px-4 py-1 rounded-full bg-amber-700/10 mb-6">
                  <span className="text-xs font-semibold tracking-widest text-amber-700 uppercase">How we do it</span>
                </div>
                <h3 className="text-3xl font-light text-gray-900 mb-4 leading-tight">
                  Global reach. In-house brains. Relentless speed.
                </h3>
                <p className="text-base text-gray-600 font-light leading-relaxed">
                  We combine a global footprint with deep in-house expertise and rapid execution — allowing us to adapt and deploy solutions tailored to each client.
                </p>
                <button
                  onClick={resetPanel}
                  className="mt-6 text-sm font-medium text-amber-700 hover:opacity-70 transition-opacity"
                >
                  ← Back
                </button>
              </motion.div>

              {/* What Panel */}
              <motion.div
                className={`absolute inset-0 transition-all duration-500 ${
                  activePanel === 'what' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                }`}
              >
                <div className="inline-block px-4 py-1 rounded-full bg-amber-700/10 mb-6">
                  <span className="text-xs font-semibold tracking-widest text-amber-700 uppercase">What we build</span>
                </div>
                <h3 className="text-3xl font-light text-gray-900 mb-4 leading-tight">
                  Plug-and-play AI agents for the workflows that matter.
                </h3>
                <p className="text-base text-gray-600 font-light leading-relaxed">
                  Domain-specific AI agents that automate critical workflows for startups and SMEs — freeing teams to focus on high-value growth.
                </p>
                <button
                  onClick={resetPanel}
                  className="mt-6 text-sm font-medium text-amber-700 hover:opacity-70 transition-opacity"
                >
                  ← Back
                </button>
              </motion.div>
            </div>

            {/* Right: Inverted Semicircle Orbital */}
            <div className="relative flex justify-center">
              <div className="relative w-96 h-48 overflow-hidden">
                {/* Concentric circles as interactive arcs */}
                <div className="relative w-96 h-96">
                  {/* Outermost Arc - Why */}
                  <motion.div
                    onClick={() => showPanel('why')}
                    className={`absolute rounded-full border-2 cursor-pointer transition-all duration-500 ${
                      activePanel === 'why'
                        ? 'border-amber-700/50'
                        : 'border-gray-900/12 hover:border-gray-900/35'
                    }`}
                    style={{
                      width: '384px',
                      height: '384px',
                      top: '0px',
                      left: '0px',
                      background: activePanel === 'why' ? 'rgba(180, 83, 9, 0.05)' : 'transparent',
                    }}
                  >
                    <motion.div
                      className={`absolute text-xs font-semibold tracking-widest uppercase transition-all duration-500 left-1/2 top-16 -translate-x-1/2 px-3 py-1 rounded-full ${
                        activePanel === 'why'
                          ? 'text-amber-700 bg-white/90'
                          : 'text-gray-900/40 bg-white/70'
                      }`}
                    >
                      Why
                    </motion.div>
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
                      width: '264px',
                      height: '264px',
                      top: '60px',
                      left: '60px',
                      background: activePanel === 'how' ? 'rgba(180, 83, 9, 0.05)' : 'transparent',
                    }}
                  >
                    <motion.div
                      className={`absolute text-xs font-semibold tracking-widest uppercase transition-all duration-500 left-1/2 top-10 -translate-x-1/2 px-3 py-1 rounded-full ${
                        activePanel === 'how'
                          ? 'text-amber-700 bg-white/90'
                          : 'text-gray-900/40 bg-white/70'
                      }`}
                    >
                      How
                    </motion.div>
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
                      width: '144px',
                      height: '144px',
                      top: '126px',
                      left: '126px',
                      background: activePanel === 'what' ? 'rgba(180, 83, 9, 0.1)' : 'rgba(17, 24, 39, 0.06)',
                    }}
                  >
                    <motion.div
                      className={`absolute text-xs font-semibold tracking-widest uppercase transition-all duration-500 left-1/2 top-6 -translate-x-1/2 px-3 py-1 rounded-full ${
                        activePanel === 'what'
                          ? 'text-amber-700 bg-white/90'
                          : 'text-gray-900/40 bg-white/70'
                      }`}
                    >
                      What
                    </motion.div>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: THE PROBLEM */}
      <section className="py-32 px-16 bg-gradient-to-b from-gray-900 to-purple-950 relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 30% 50%, rgba(168, 107, 101, 0.15) 0%, transparent 60%)',
          }}
        />
        <div className="max-w-4xl mx-auto relative z-10">
          <h2 className="text-5xl font-light text-white mb-8 leading-tight">
            The giants are <em className="italic text-amber-700">pulling ahead.</em>
          </h2>
          <p className="text-lg text-white/70 mb-6 font-light leading-relaxed">
            The largest companies in the world are using AI to move faster, decide smarter, and widen the gap every quarter.
          </p>
          <p className="text-lg text-white/70 mb-8 font-light leading-relaxed">
            Meanwhile, growing businesses are left choosing between expensive consultants, half-built tools, and doing everything manually.
          </p>
          <div className="text-xl text-white font-medium pl-6 border-l-4 border-amber-700 mt-12">
            We started OPSERA because we believe that's wrong.
          </div>
        </div>
      </section>

      {/* SECTION 3: THE ANSWER */}
      <section className="py-32 px-16 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-light text-gray-900 mb-6 leading-tight">
              We exist to <em className="italic text-amber-700">level the field.</em>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto font-light leading-relaxed">
              Plug-and-play AI agents that automate critical workflows, so your team stops drowning in operations and starts focusing on growth.
            </p>
          </div>

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

      {/* SECTION 4: HOW WE WORK */}
      <section className="py-32 px-16 bg-gradient-to-b from-amber-50 to-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-light text-gray-900 mb-6 leading-tight">
              How it <em className="italic text-amber-700">works</em>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto font-light leading-relaxed">
              No 40-page SOW. No six-month timeline. Just a clear path from problem to production.
            </p>
          </div>

          <div className="relative">
            {/* Connecting Line */}
            <div className="absolute top-10 left-20 right-20 h-0.5 bg-gradient-to-r from-amber-700 via-purple-600/30 to-amber-700 z-0" />

            {/* Steps */}
            <div className="flex gap-8 relative z-10">
              {[
                {
                  number: '1',
                  title: "You tell us what's slowing you down",
                  description: 'We dig into your workflows, team structure, and the bottlenecks quietly eating your time.',
                },
                {
                  number: '2',
                  title: 'We build around how you actually run',
                  description: "No off-the-shelf platform. We design and deploy an AI agent tailored to your real operations.",
                },
                {
                  number: '3',
                  title: "You're live in weeks",
                  description:
                    'Your agent is running, your team is freed up, and we keep iterating as your business evolves.',
                },
              ].map((step, idx) => (
                <motion.div
                  key={idx}
                  className="flex-1 text-center px-6 hover:-translate-y-1 transition-all duration-300"
                  whileHover={{ scale: 1.02 }}
                >
                  <motion.div className="w-20 h-20 rounded-full border-2 border-amber-700/25 flex items-center justify-center mx-auto mb-7 bg-white hover:border-amber-700 hover:shadow-lg hover:shadow-amber-700/15 transition-all duration-300">
                    <span className="text-3xl font-light text-amber-700">{step.number}</span>
                  </motion.div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">{step.title}</h4>
                  <p className="text-base text-gray-700 font-light leading-relaxed">{step.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: VISION & MISSION */}
      <section className="py-32 px-16 bg-gradient-to-b from-gray-900 to-purple-950 relative overflow-hidden">
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
              >
                <div className="text-xs font-semibold tracking-widest text-amber-700 uppercase mb-6">{item.label}</div>
                <h3 className="text-2xl font-light text-white leading-relaxed">{item.text}</h3>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 6: CTA */}
      <section className="py-40 px-16 bg-gradient-to-b from-white to-amber-50 text-center">
        <h2 className="text-6xl font-light text-gray-900 mb-6 leading-tight">
          Built for those who <em className="italic text-amber-700">punch above their weight.</em>
        </h2>
        <p className="text-xl text-gray-600 mb-12 font-light">If that sounds like you, we should talk.</p>
        <motion.a
          href="#"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="inline-block px-12 py-5 bg-gradient-to-r from-amber-700 to-amber-600 text-white text-lg font-semibold rounded-full hover:shadow-lg hover:shadow-amber-700/40 transition-all"
        >
          Book a Demo →
        </motion.a>
      </section>

      {/* FOOTER */}
      <footer className="py-10 px-16 border-t border-gray-200 flex justify-between items-center text-sm text-gray-600">
        <div>
          <span className="text-lg font-bold text-gray-900">
            OPS<span className="text-amber-700">ERA</span>
          </span>
          <span className="ml-4">Intelligence that levels the field.</span>
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

        <div className="mt-20 text-center text-[#2D1B4E]/20 text-xs tracking-widest">
          © {new Date().getFullYear()} SIA INC. ALL RIGHTS RESERVED.
        </div>
      </footer>
      <Chatbot />
    </div>
  );
}
