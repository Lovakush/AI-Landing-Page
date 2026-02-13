"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";


function MarketingNetwork() {
  return (
    <div className="relative w-[400px] h-[400px] flex items-center justify-center">
      {}
      <motion.div
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{ 
          repeat: Infinity, 
          duration: 4,
          ease: "easeInOut"
        }}
        className="absolute w-80 h-80 rounded-full bg-gradient-to-r from-[#E8B84A]/30 via-purple-500/30 to-[#E8B84A]/30 blur-3xl"
      />

      {}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
        className="absolute w-72 h-72"
      >
        <div className="absolute inset-0 rounded-full border-2 border-dashed border-[#E8B84A]/30" />
      </motion.div>

      <motion.div
        animate={{ rotate: -360 }}
        transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
        className="absolute w-80 h-80"
      >
        <div className="absolute inset-0 rounded-full border border-purple-400/20" />
      </motion.div>

      {}
      {[...Array(8)].map((_, i) => {
        const angle = (i * 360) / 8;
        const radius = 140;
        return (
          <motion.div
            key={i}
            animate={{
              rotate: 360,
              scale: [1, 1.2, 1],
            }}
            transition={{
              rotate: { repeat: Infinity, duration: 25, ease: "linear" },
              scale: { repeat: Infinity, duration: 2, delay: i * 0.2 }
            }}
            className="absolute"
            style={{
              left: "50%",
              top: "50%",
            }}
          >
            <motion.div
              className="absolute w-3 h-3 rounded-full bg-gradient-to-br from-[#E8B84A] to-purple-400 shadow-lg shadow-[#E8B84A]/50"
              style={{
                transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-${radius}px)`,
              }}
            />
          </motion.div>
        );
      })}

      {}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
        <motion.div
          key={`beam-${i}`}
          style={{ rotate: angle }}
          animate={{ 
            opacity: [0.1, 0.6, 0.1],
            scaleY: [1, 1.1, 1]
          }}
          transition={{ 
            repeat: Infinity, 
            duration: 3, 
            delay: i * 0.2,
            ease: "easeInOut"
          }}
          className="absolute w-[3px] h-32 bg-gradient-to-t from-[#E8B84A]/60 via-[#E8B84A]/30 to-transparent origin-bottom"
        />
      ))}

      {}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={`particle-${i}`}
          animate={{
            rotate: [0, 360],
            scale: [0, 1, 0],
            opacity: [0, 1, 0]
          }}
          transition={{
            repeat: Infinity,
            duration: 4,
            delay: i * 0.3,
            ease: "easeOut"
          }}
          className="absolute"
          style={{
            left: "50%",
            top: "50%",
          }}
        >
          <div 
            className="w-1 h-1 rounded-full bg-[#E8B84A]"
            style={{
              transform: `translate(-50%, -50%) rotate(${i * 30}deg) translateY(-100px)`,
            }}
          />
        </motion.div>
      ))}

      {}
      <motion.div
        animate={{ 
          scale: [1, 1.05, 1],
          boxShadow: [
            "0 0 40px rgba(232,184,74,0.4)",
            "0 0 60px rgba(232,184,74,0.6)",
            "0 0 40px rgba(232,184,74,0.4)"
          ]
        }}
        transition={{ 
          repeat: Infinity, 
          duration: 3,
          ease: "easeInOut"
        }}
        className="relative z-10 w-36 h-36 rounded-full flex items-center justify-center text-center
                   backdrop-blur-xl border-2 border-[#E8B84A]/60
                   bg-gradient-to-br from-[#E8B84A]/30 via-purple-600/20 to-[#E8B84A]/30"
      >
        {}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
          className="absolute inset-2 rounded-full border border-[#E8B84A]/40"
        />
        
        {}
        <div className="relative z-10">
          <motion.div
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <span className="text-xl font-bold text-white leading-tight block">
              AI
            </span>
            <span className="text-lg font-semibold text-white/90 leading-tight block">
              Engine
            </span>
          </motion.div>
        </div>

        {}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
          className="absolute inset-0 opacity-20"
        >
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <polygon 
              points="50,5 90,27.5 90,72.5 50,95 10,72.5 10,27.5" 
              fill="none" 
              stroke="#E8B84A" 
              strokeWidth="1"
            />
          </svg>
        </motion.div>
      </motion.div>

      {}
      {[0, 90, 180, 270].map((rotation, i) => (
        <motion.div
          key={`corner-${i}`}
          animate={{ 
            opacity: [0.3, 0.6, 0.3],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            repeat: Infinity, 
            duration: 2,
            delay: i * 0.5 
          }}
          className="absolute w-full h-full"
          style={{ rotate: rotation }}
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-12 border-t-2 border-l-2 border-[#E8B84A]/40 rounded-tl-3xl" />
        </motion.div>
      ))}
    </div>
  );
}

/* ─── WAITLIST SECTION ─── */
export default function WaitlistSection() {
  const [email, setEmail] = useState("");
  const [status, setStatus] =
    useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const validate = (e: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate(email)) {
      setErrorMsg("Please enter a valid email address.");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setErrorMsg("");

    try {
      const response = await fetch('/api/waitlist/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStatus("success");
        setEmail(""); // Clear the input
      } else {
        setErrorMsg(data.message || "Something went wrong. Please try again.");
        setStatus("error");
      }
    } catch (error) {
      console.error('Waitlist submission error:', error);
      setErrorMsg("Network error. Please check your connection and try again.");
      setStatus("error");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (status === "error") setStatus("idle");
  };

  return (
    <section className="relative w-full overflow-hidden py-28 px-6">
      {}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/4 w-[400px] h-[400px] bg-[#E8B84A] opacity-5 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-1/3 w-[300px] h-[300px] bg-purple-600 opacity-5 blur-[100px] rounded-full" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10 flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
        {}
        <div className="flex-1 max-w-xl">
          <h2 className="text-4xl md:text-5xl font-light leading-tight text-white mb-5">
            Be first to run on{" "}
            <em className="italic text-[#E8B84A]">
              intelligence.
            </em>
          </h2>

          <p className="text-base font-light leading-relaxed mb-10 text-white/50">
            Join the waitlist and get priority access when SIA launches —
            plus a free workflow audit with one of our AI specialists.
          </p>

          <motion.form
            onSubmit={handleSubmit}
            className="w-full"
            noValidate
          >
            <AnimatePresence mode="wait">
              {status === "success" ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-4 px-6 py-5 rounded-2xl border border-[#E8B84A]/30 bg-[#E8B84A]/10"
                >
                  <div className="text-white text-sm font-semibold">
                    You're on the list! 🚀
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="form"
                  className="space-y-3"
                >
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="email"
                      value={email}
                      onChange={handleChange}
                      placeholder="your@email.com"
                      disabled={status === "loading"}
                      className="flex-1 px-5 py-3.5 rounded-xl text-sm text-white placeholder-white/30 bg-white/5 border border-white/10 outline-none focus:border-[#E8B84A]/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    />

                    <motion.button
                      type="submit"
                      disabled={status === "loading"}
                      whileHover={status === "loading" ? {} : { scale: 1.03 }}
                      whileTap={status === "loading" ? {} : { scale: 0.97 }}
                      className="px-7 py-3.5 rounded-xl text-sm font-semibold text-[#050508] whitespace-nowrap bg-gradient-to-r from-[#E8B84A] to-[#E8A87C] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {status === "loading"
                        ? "Joining..."
                        : "Join Waitlist"}
                    </motion.button>
                  </div>

                  {status === "error" && (
                    <motion.p 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs text-red-400 px-1"
                    >
                      {errorMsg}
                    </motion.p>
                  )}

                  <p className="text-xs px-1 text-white/30">
                    No spam. Unsubscribe anytime. We respect
                    your privacy.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.form>
        </div>

        {}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="flex-shrink-0"
        >
          <MarketingNetwork />
        </motion.div>
      </div>
    </section>
  );
}