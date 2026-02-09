'use client';

import { motion } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';

export default function AboutPage() {
  const [mounted, setMounted] = useState(false);
  const [visionRotation, setVisionRotation] = useState(0);
  const [visionOpacity, setVisionOpacity] = useState(1);
  const [purposeRotation, setPurposeRotation] = useState(0);
  const [purposeOpacity, setPurposeOpacity] = useState(1);
  const [missionRotation, setMissionRotation] = useState(0);
  const [missionOpacity, setMissionOpacity] = useState(1);
  const [hoveredBox, setHoveredBox] = useState<'vision' | 'purpose' | 'mission' | null>(null);
  const [selectedBox, setSelectedBox] = useState<'vision' | 'purpose' | 'mission' | null>(null);

  // Use refs to track individual pause states
  const isVisionPausedRef = useRef(false);
  const isPurposePausedRef = useRef(false);
  const isMissionPausedRef = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Update pause states and selected box based on hover
  useEffect(() => {
    isVisionPausedRef.current = hoveredBox === 'vision';
    isPurposePausedRef.current = hoveredBox === 'purpose';
    isMissionPausedRef.current = hoveredBox === 'mission';

    if (hoveredBox !== null) {
      setSelectedBox(hoveredBox);
    }
  }, [hoveredBox]);

  // Vision animation (35s duration)
  useEffect(() => {
    if (!mounted) return;

    const startTime = Date.now(); // No delay
    const duration = 35000;
    let totalPausedTime = 0;
    let pauseStartTime: number | null = null;

    const animate = () => {
      if (isVisionPausedRef.current) {
        if (pauseStartTime === null) {
          pauseStartTime = Date.now();
        }
        requestAnimationFrame(animate);
        return;
      }

      // If we just resumed from pause
      if (pauseStartTime !== null) {
        totalPausedTime += Date.now() - pauseStartTime;
        pauseStartTime = null;
      }

      const elapsed = Date.now() - startTime - totalPausedTime;

      if (elapsed < 0) {
        requestAnimationFrame(animate);
        return;
      }

      const progress = (elapsed % duration) / duration;

      let degrees, opacity;

      if (progress < 0.44) {
        // 0 to 90 degrees (first 44% of cycle) - constant speed
        degrees = (progress / 0.44) * 90;
        opacity = 1;
      } else if (progress < 0.52) {
        // Fade out at 90 degrees (no movement)
        degrees = 90;
        opacity = 1 - (progress - 0.44) / 0.08;
      } else {
        // Jump to 270 degrees and continue moving continuously until loop restarts
        const elapsedAfterJump = progress - 0.52;
        const remainingDuration = 0.48; // From 0.52 to 1.0

        // Move exactly 90 degrees (270 to 360) over the entire remaining duration
        // This ensures continuous movement with no pause at the end
        degrees = 270 + (elapsedAfterJump / remainingDuration) * 90;

        // Fade in during first 0.04
        opacity = elapsedAfterJump < 0.04 ? elapsedAfterJump / 0.04 : 1;
      }

      setVisionRotation(degrees);
      setVisionOpacity(opacity);
      requestAnimationFrame(animate);
    };

    const animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [mounted]);

  // Purpose animation (28s duration)
  useEffect(() => {
    if (!mounted) return;

    const startTime = Date.now(); // No delay
    const duration = 28000;
    let totalPausedTime = 0;
    let pauseStartTime: number | null = null;

    const animate = () => {
      if (isPurposePausedRef.current) {
        if (pauseStartTime === null) {
          pauseStartTime = Date.now();
        }
        requestAnimationFrame(animate);
        return;
      }

      // If we just resumed from pause
      if (pauseStartTime !== null) {
        totalPausedTime += Date.now() - pauseStartTime;
        pauseStartTime = null;
      }

      const elapsed = Date.now() - startTime - totalPausedTime;

      if (elapsed < 0) {
        requestAnimationFrame(animate);
        return;
      }

      const progress = (elapsed % duration) / duration;

      let degrees, opacity;

      if (progress < 0.44) {
        // 0 to 90 degrees (first 44% of cycle) - constant speed
        degrees = (progress / 0.44) * 90;
        opacity = 1;
      } else if (progress < 0.52) {
        // Fade out at 90 degrees (no movement)
        degrees = 90;
        opacity = 1 - (progress - 0.44) / 0.08;
      } else {
        // Jump to 270 degrees and continue moving continuously until loop restarts
        const elapsedAfterJump = progress - 0.52;
        const remainingDuration = 0.48; // From 0.52 to 1.0

        // Move exactly 90 degrees (270 to 360) over the entire remaining duration
        // This ensures continuous movement with no pause at the end
        degrees = 270 + (elapsedAfterJump / remainingDuration) * 90;

        // Fade in during first 0.04
        opacity = elapsedAfterJump < 0.04 ? elapsedAfterJump / 0.04 : 1;
      }

      setPurposeRotation(degrees);
      setPurposeOpacity(opacity);
      requestAnimationFrame(animate);
    };

    const animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [mounted]);

  // Mission animation (21s duration)
  useEffect(() => {
    if (!mounted) return;

    const startTime = Date.now(); // No delay
    const duration = 21000;
    let totalPausedTime = 0;
    let pauseStartTime: number | null = null;

    const animate = () => {
      if (isMissionPausedRef.current) {
        if (pauseStartTime === null) {
          pauseStartTime = Date.now();
        }
        requestAnimationFrame(animate);
        return;
      }

      // If we just resumed from pause
      if (pauseStartTime !== null) {
        totalPausedTime += Date.now() - pauseStartTime;
        pauseStartTime = null;
      }

      const elapsed = Date.now() - startTime - totalPausedTime;

      if (elapsed < 0) {
        requestAnimationFrame(animate);
        return;
      }

      const progress = (elapsed % duration) / duration;

      let degrees, opacity;

      if (progress < 0.44) {
        // 0 to 90 degrees (first 44% of cycle) - constant speed
        degrees = (progress / 0.44) * 90;
        opacity = 1;
      } else if (progress < 0.52) {
        // Fade out at 90 degrees (no movement)
        degrees = 90;
        opacity = 1 - (progress - 0.44) / 0.08;
      } else {
        // Jump to 270 degrees and continue moving continuously until loop restarts
        const elapsedAfterJump = progress - 0.52;
        const remainingDuration = 0.48; // From 0.52 to 1.0

        // Move exactly 90 degrees (270 to 360) over the entire remaining duration
        // This ensures continuous movement with no pause at the end
        degrees = 270 + (elapsedAfterJump / remainingDuration) * 90;

        // Fade in during first 0.04
        opacity = elapsedAfterJump < 0.04 ? elapsedAfterJump / 0.04 : 1;
      }

      setMissionRotation(degrees);
      setMissionOpacity(opacity);
      requestAnimationFrame(animate);
    };

    const animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [mounted]);

  return (
    <div className="bg-gradient-to-b from-white via-[#faf5ff] to-white min-h-screen w-full overflow-x-hidden">
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
          <a href="/" className="flex items-center">
            <img src="/sia-logo.png" alt="SIA" className="h-14 w-auto brightness-0 invert" />
          </a>
          <nav className="flex items-center gap-4">
            <a href="/" className="text-white/70 hover:text-white transition-colors font-medium px-4 py-2 rounded-full border border-white/20 hover:border-white/40">
              Home
            </a>
            <a href="/products" className="text-white/70 hover:text-white transition-colors font-medium px-4 py-2 rounded-full border border-white/20 hover:border-white/40">
              Products
            </a>
            <a href="/about" className="text-white hover:text-white transition-colors font-medium px-4 py-2 rounded-full border border-white/40">
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

                {/* Middle Orbit - PURPOSE */}
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: mounted ? 1 : 0, opacity: mounted ? 1 : 0 }}
                  transition={{ duration: 0.8, delay: 0 }}
                  className="absolute"
                  style={{
                    width: '600px',
                    height: '600px',
                    borderRadius: '50%',
                    border: '3px solid #6366F1',
                    bottom: '-375px',
                    left: '50%',
                    marginLeft: '-300px',
                    background: 'radial-gradient(circle at center, rgba(99, 102, 241, 0.15) 0%, rgba(99, 102, 241, 0.25) 50%, transparent 100%)',
                  }}
                />

                {/* Innermost Orbit - MISSION */}
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: mounted ? 1 : 0, opacity: mounted ? 1 : 0 }}
                  transition={{ duration: 0.8, delay: 0 }}
                  className="absolute"
                  style={{
                    width: '300px',
                    height: '300px',
                    borderRadius: '50%',
                    border: '3px solid #6366F1',
                    bottom: '-205px',
                    left: '50%',
                    marginLeft: '-150px',
                    background: 'radial-gradient(circle at center, rgba(99, 102, 241, 0.25) 0%, rgba(99, 102, 241, 0.35) 50%, transparent 100%)',
                  }}
                />

                {/* Text Boxes on Orbits - Moving with teleport */}
                {/* Vision - Outermost (moving on orbit) */}
                <div
                  className="absolute z-30"
                  style={{
                    left: '50%',
                    bottom: '-65px',
                    width: '0px',
                    height: '0px',
                    transform: `rotate(${visionRotation}deg)`,
                    opacity: visionOpacity,
                    transition: 'opacity 0.3s ease-in-out',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      left: '-50px',
                      top: '-460px',
                    }}
                    onMouseEnter={() => setHoveredBox('vision')}
                    onMouseLeave={() => setHoveredBox(null)}
                  >
                    <div
                      className="px-5 py-2 rounded-full cursor-pointer transition-all duration-300"
                      style={{
                        background: 'rgba(243, 232, 255, 0.75)',
                        backdropFilter: 'blur(12px)',
                        WebkitBackdropFilter: 'blur(12px)',
                        border: '2px solid rgba(99, 102, 241, 0.3)',
                        boxShadow: '0 8px 32px rgba(99, 102, 241, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
                      }}
                    >
                      <svg width="70" height="18" viewBox="0 0 70 18" className="overflow-visible">
                        <defs>
                          <path id="visionCurve" d="M 0,11 Q 35,6 70,11" fill="none" />
                        </defs>
                        <text className="text-xs font-semibold fill-[#2D1B4E] uppercase tracking-wider" dominantBaseline="middle">
                          <textPath href="#visionCurve" startOffset="50%" textAnchor="middle">
                            Vision
                          </textPath>
                        </text>
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Purpose - Middle (moving on orbit) */}
                <div
                  className="absolute z-30"
                  style={{
                    left: '50%',
                    bottom: '-75px',
                    width: '0px',
                    height: '0px',
                    transform: `rotate(${purposeRotation}deg)`,
                    opacity: purposeOpacity,
                    transition: 'opacity 0.3s ease-in-out',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      left: '-50px',
                      top: '-315px',
                    }}
                    onMouseEnter={() => setHoveredBox('purpose')}
                    onMouseLeave={() => setHoveredBox(null)}
                  >
                    <div
                      className="px-5 py-2 rounded-full cursor-pointer transition-all duration-300"
                      style={{
                        background: 'rgba(233, 213, 255, 0.75)',
                        backdropFilter: 'blur(12px)',
                        WebkitBackdropFilter: 'blur(12px)',
                        border: '2px solid rgba(99, 102, 241, 0.3)',
                        boxShadow: '0 8px 32px rgba(99, 102, 241, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
                      }}
                    >
                      <svg width="80" height="18" viewBox="0 0 80 18" className="overflow-visible">
                        <defs>
                          <path id="purposeCurve" d="M 0,11 Q 40,6 80,11" fill="none" />
                        </defs>
                        <text className="text-xs font-semibold fill-[#2D1B4E] uppercase tracking-wider" dominantBaseline="middle">
                          <textPath href="#purposeCurve" startOffset="50%" textAnchor="middle">
                            Purpose
                          </textPath>
                        </text>
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Mission - Innermost (moving on orbit) */}
                <div
                  className="absolute z-30"
                  style={{
                    left: '50%',
                    bottom: '-55px',
                    width: '0px',
                    height: '0px',
                    transform: `rotate(${missionRotation}deg)`,
                    opacity: missionOpacity,
                    transition: 'opacity 0.3s ease-in-out',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      left: '-50px',
                      top: '-160px',
                    }}
                    onMouseEnter={() => setHoveredBox('mission')}
                    onMouseLeave={() => setHoveredBox(null)}
                  >
                    <div
                      className="px-4 py-2 rounded-full cursor-pointer transition-all duration-300"
                      style={{
                        background: 'rgba(221, 214, 254, 0.75)',
                        backdropFilter: 'blur(12px)',
                        WebkitBackdropFilter: 'blur(12px)',
                        border: '2px solid rgba(99, 102, 241, 0.3)',
                        boxShadow: '0 8px 32px rgba(99, 102, 241, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.6)',
                      }}
                    >
                      <svg width="70" height="16" viewBox="0 0 70 16" className="overflow-visible">
                        <defs>
                          <path id="missionCurve" d="M 0,10 Q 35,5 70,10" fill="none" />
                        </defs>
                        <text className="text-xs font-semibold fill-[#2D1B4E] uppercase tracking-wider" dominantBaseline="middle">
                          <textPath href="#missionCurve" startOffset="50%" textAnchor="middle">
                            Mission
                          </textPath>
                        </text>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Lower Container - Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="bg-white rounded-xl overflow-hidden mb-12 relative"
            style={{ minHeight: '400px' }}
          >
            {!selectedBox ? (
              /* Default 3-column layout */
              <div className="p-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Vision */}
                  <div className="text-center">
                    <h3 className="text-xl font-semibold text-[#6366F1] mb-4 uppercase tracking-wider">
                      Vision
                    </h3>
                    <p className="text-[#2D1B4E]/70 leading-relaxed font-light">
                      Lead the future where every enterprise harnesses AI to unlock unprecedented growth and innovation.
                    </p>
                  </div>

                  {/* Purpose. */}
                  <div className="text-center">
                    <h3 className="text-xl font-semibold text-[#6366F1] mb-4 uppercase tracking-wider">
                      Purpose
                    </h3>
                    <p className="text-[#2D1B4E]/70 leading-relaxed font-light">
                      Transform the way enterprises operate by making AI accessible, reliable, and execution-ready.
                    </p>
                  </div>

                  {/* Mission */}
                  <div className="text-center">
                    <h3 className="text-xl font-semibold text-[#6366F1] mb-4 uppercase tracking-wider">
                      Mission
                    </h3>
                    <p className="text-[#2D1B4E]/70 leading-relaxed font-light">
                      Empower businesses with AI-driven solutions that streamline operations and boost efficiency.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              /* Interactive layout when hovering */
              <motion.div
                key={selectedBox}
                initial={{ x: '100%', opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: '100%', opacity: 0 }}
                transition={{
                  duration: 0.5,
                  ease: [0.25, 0.1, 0.25, 1]
                }}
                className="flex h-full absolute inset-0 rounded-l-xl overflow-hidden"
                style={{
                  background: selectedBox === 'vision'
                    ? 'rgba(99, 102, 241, 0.75)'
                    : selectedBox === 'purpose'
                    ? 'rgba(99, 102, 241, 0.85)'
                    : 'rgba(99, 102, 241, 0.95)',
                }}
              >
                {/* Text Description - 1/3 */}
                <div className="w-1/3 p-12 flex flex-col justify-center">
                  <h2 className="text-3xl font-bold text-white mb-6 uppercase tracking-wider">
                    {selectedBox === 'vision' && 'Vision'}
                    {selectedBox === 'purpose' && 'Purpose'}
                    {selectedBox === 'mission' && 'Mission'}
                  </h2>
                  <p className="text-white/90 leading-relaxed text-lg font-light">
                    {selectedBox === 'vision' &&
                      'Lead the future where every enterprise harnesses AI to unlock unprecedented growth and innovation. We envision a world where artificial intelligence seamlessly integrates with business operations.'}
                    {selectedBox === 'purpose' &&
                      'Transform the way enterprises operate by making AI accessible, reliable, and execution-ready. Our purpose is to bridge the gap between cutting-edge AI technology and practical business applications.'}
                    {selectedBox === 'mission' &&
                      'Empower businesses with AI-driven solutions that streamline operations and boost efficiency. We are committed to delivering tools that make a tangible difference in day-to-day operations.'}
                  </p>
                </div>

                {/* Image Frame - 2/3 */}
                <div className="w-2/3 bg-white flex items-center justify-center p-12">
                  <div className="w-full h-full border-4 border-[#6366F1]/20 rounded-lg flex items-center justify-center">
                    <p className="text-[#2D1B4E]/30 text-xl font-light">
                      Image Placeholder
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Footer Section */}
      <footer className="pt-20 pb-10 px-6 border-t border-[#6366F1]/10 bg-gradient-to-b from-white to-[#faf5ff]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="text-center md:text-left">
            <img src="/sia-logo.png" alt="SIA" className="h-12 w-auto mb-2" />
            <p className="text-[#2D1B4E]/60 text-sm tracking-wide font-light">
              Execution-first AI for the Enterprise.
            </p>
          </div>

          <div className="flex gap-8 text-[#2D1B4E]/70 text-sm font-light tracking-wider">
            {["Privacy", "Terms", "Cookies"].map((link) => (
              <a key={link} href="#" className="relative group overflow-hidden hover:text-[#6366F1] transition-colors">
                {link}
                <span className="absolute left-0 bottom-0 w-full h-[1px] bg-[#6366F1] -translate-x-full transition-transform duration-300 group-hover:translate-x-0" />
              </a>
            ))}
          </div>
        </div>

        <div className="mt-20 text-center text-[#2D1B4E]/20 text-xs tracking-widest">
          © {new Date().getFullYear()} SIA INC. ALL RIGHTS RESERVED.
        </div>
      </footer>
    </div>
  );
}
