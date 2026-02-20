"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function BookADemo() {
  return (
    <section className="relative flex items-center justify-center py-32 px-6 overflow-hidden">
      
      {/* Ambient Glow Effects - Very Subtle */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[600px] h-[400px] bg-[#f6b15c] opacity-8 blur-[160px] rounded-full"></div>
      </div>
      
      <div className="absolute top-0 left-1/4 w-[300px] h-[300px] bg-purple-600 opacity-5 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-[#f6b15c] opacity-5 blur-[120px] rounded-full"></div>

      {/* Content */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="relative z-10 text-center max-w-4xl"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <h2 className="text-5xl md:text-7xl font-light text-white mb-6 leading-tight">
            Ready to{" "}
            <span className="relative inline-block">
              <span className="text-[#f6b15c] font-medium">automate</span>
              <motion.div
                className="absolute -bottom-2 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#f6b15c] to-transparent"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                viewport={{ once: true }}
              />
            </span>{" "}
            your business?
          </h2>
        </motion.div>

        <motion.p 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-gray-400 text-lg md:text-xl mb-12 max-w-2xl mx-auto"
        >
          See how our AI agents can revolutionize your Marketing, HR,
          and Sales operations.
        </motion.p>

        {}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: true }}
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className="group relative inline-flex items-center gap-3 px-12 py-5 rounded-full 
                       bg-gradient-to-r from-[#f6b15c] to-[#ffc976] text-[#2a004f] 
                       font-semibold text-lg
                       shadow-[0_0_50px_rgba(246,177,92,0.4)]
                       hover:shadow-[0_0_70px_rgba(246,177,92,0.6)]
                       transition-all duration-300
                       before:absolute before:inset-0 before:rounded-full
                       before:bg-gradient-to-r before:from-[#ffc976] before:to-[#f6b15c]
                       before:opacity-0 hover:before:opacity-100
                       before:transition-opacity before:duration-300"
          >
            <span className="relative z-10">Book a Demo</span>
            <motion.div
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="relative z-10"
            >
              <ArrowRight size={20} />
            </motion.div>
          </motion.button>
        </motion.div>

        {/* Trust Indicator */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          viewport={{ once: true }}
          className="mt-8 text-gray-500 text-sm"
        >
          No credit card required • 30-minute consultation
        </motion.p>
      </motion.div>
    </section>
  );
}