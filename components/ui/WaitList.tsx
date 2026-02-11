"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ─── MINIMAL AI CORE ANIMATION ─── */
function MarketingNetwork() {
  return (
    <div className="relative w-[340px] h-[340px] flex items-center justify-center">
      <div className="absolute w-72 h-72 rounded-full bg-[#E8B84A]/20 blur-3xl animate-pulse" />

      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
        className="absolute w-64 h-64 rounded-full border border-[#E8B84A]/20"
      />

      {[0, 60, 120, 180, 240, 300].map((angle, i) => (
        <motion.div
          key={i}
          style={{ rotate: angle }}
          animate={{ opacity: [0.2, 0.6, 0.2] }}
          transition={{ repeat: Infinity, duration: 3, delay: i * 0.3 }}
          className="absolute w-[2px] h-24 bg-gradient-to-b from-[#E8B84A]/60 to-transparent origin-bottom"
        />
      ))}

      <motion.div
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ repeat: Infinity, duration: 3 }}
        className="relative z-10 w-32 h-32 rounded-full flex items-center justify-center text-center
                   backdrop-blur-xl border border-[#E8B84A]/40
                   bg-gradient-to-br from-[#E8B84A]/20 to-purple-600/20
                   shadow-[0_0_60px_rgba(232,184,74,0.5)]"
      >
        <span className="text-lg font-semibold text-white leading-tight">
          AI<br />Engine
        </span>
      </motion.div>
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

    await new Promise((r) => setTimeout(r, 1400));
    setStatus("success");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (status === "error") setStatus("idle");
  };

  return (
    <section
      className="relative w-full overflow-hidden py-28 px-6"
      style={{
        background:
          "linear-gradient(to bottom, #050508, #0e0818, #050508)",
      }}
    >
      <div className="max-w-6xl mx-auto relative z-10 flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
        {/* LEFT SIDE */}
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
                      className="flex-1 px-5 py-3.5 rounded-xl text-sm text-white placeholder-white/30 bg-white/5 border border-white/10 outline-none focus:border-[#E8B84A]/40 transition-all"
                    />

                    <motion.button
                      type="submit"
                      disabled={status === "loading"}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className="px-7 py-3.5 rounded-xl text-sm font-semibold text-[#050508] whitespace-nowrap bg-gradient-to-r from-[#E8B84A] to-[#E8A87C]"
                    >
                      {status === "loading"
                        ? "Joining..."
                        : "Join Waitlist"}
                    </motion.button>
                  </div>

                  {status === "error" && (
                    <p className="text-xs text-red-400 px-1">
                      {errorMsg}
                    </p>
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

        {/* RIGHT SIDE ANIMATION */}
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
