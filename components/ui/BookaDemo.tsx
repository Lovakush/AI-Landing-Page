"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function BookADemo() {
  return (
    <section className="relative flex items-center justify-center py-24 px-6 bg-gradient-to-br from-[#2a004f] via-[#1a0033] to-[#0d001a] overflow-hidden">
      
      {/* Glow Background Effect */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[400px] h-[400px] bg-[#f6b15c] opacity-20 blur-[140px] rounded-full"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center max-w-4xl">
        <h2 className="text-4xl md:text-6xl font-light text-white mb-6">
          Ready to{" "}
          <span className="text-[#f6b15c] font-medium">automate</span>{" "}
          your business?
        </h2>

        <p className="text-gray-300 text-lg mb-10">
          See how our AI agents can revolutionize your Marketing, HR,
          and Sales operations.
        </p>

        {/* Glowing Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          className="relative inline-flex items-center gap-3 px-10 py-4 rounded-full 
                     bg-[#f6b15c] text-[#2a004f] font-semibold text-lg
                     shadow-[0_0_40px_rgba(246,177,92,0.6)]
                     transition-all duration-300"
        >
          Book a Demo
          <ArrowRight size={20} />
        </motion.button>
      </div>
    </section>
  );
}
