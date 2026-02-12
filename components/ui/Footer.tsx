'use client';

import { motion } from 'framer-motion';
import { Twitter, Linkedin, Github } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#2D1B4E] pt-20 pb-10 px-6 border-t border-white/5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">

        {/* Left: Logo & Tagline */}
        <div className="text-center md:text-left">
          <img src="/sia-logo.png" alt="SIA" className="h-25 w-auto brightness-0 invert mb-2" />
          <p className="text-white/40 text-sm tracking-wide font-[family-name:var(--font-inter)]">
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

        {/* Right: Social Icons */}
        <div className="flex gap-6">
          {[Twitter, Linkedin, Github].map((Icon, idx) => (
            <motion.a
              key={idx}
              href="#"
              whileHover={{ y: -5, color: "#E8B84A" }}
              className="text-white/60 transition-colors duration-300"
            >
              <Icon className="w-6 h-6" />
            </motion.a>
          ))}
        </div>
      </div>

      {/* Copyright */}
      <div className="mt-20 text-center text-white/10 text-xs tracking-widest">
        &copy; {new Date().getFullYear()} SIA INC. ALL RIGHTS RESERVED.
      </div>
    </footer>
  );
};

export default Footer;
