'use client';

import { motion } from 'framer-motion';
import { Twitter, Linkedin, Github, MapPin, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#2D1B4E] pt-20 pb-10 px-6 border-t border-white/5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12">

        {/* Left: Logo & Tagline */}
        <div className="text-center md:text-left flex flex-col items-center md:items-start">
          <div className="relative">
            <img src="/sia-text.png" alt="SIA" className="h-16 w-brightness-0 invert -bold" />
            <img src="/sia-globe-v2.png" alt="SIA Globe" className="h-12 w-auto mix-blend-lighten absolute left-1/2 -translate-x-[56%] -top-7" />
          </div>
          <p className="text-white/40 text-sm tracking-wide font-[family-name:var(--font-inter)] mt-2">
            Execution-first AI for the Enterprise.
          </p>
        </div>

        {/* Center: Links */}
        <div className="flex flex-col items-center gap-4">
          <div className="flex gap-8 text-white/60 text-sm font-light tracking-wider">
            {["Privacy", "Terms", "Cookies"].map((link) => (
              <a key={link} href="#" className="relative group overflow-hidden">
                {link}
                <span className="absolute left-0 bottom-0 w-full h-[1px] bg-[#E8B84A] -translate-x-full transition-transform duration-300 group-hover:translate-x-0" />
              </a>
            ))}
          </div>
        </div>

        {/* Right: Contact Info + Social Icons */}
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-3 text-white/50 text-sm">
            <MapPin className="w-4 h-4 mt-0.5 text-[#E8B84A]/60 shrink-0" />
            <span className="leading-relaxed">
              Zeestraat 100, 2518 AD, Den Haag<br />
              The Netherlands
            </span>
          </div>
          <div className="flex items-center gap-3 text-white/50 text-sm">
            <Mail className="w-4 h-4 text-[#E8B84A]/60 shrink-0" />
            <a href="mailto:hello@sia.com" className="hover:text-[#E8B84A] transition-colors duration-300">
              info@siasolutions.ai
            </a>
          </div>
          <div className="flex gap-6 mt-2">
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

      </div>

      {/* Copyright */}
      <div className="mt-20 text-center text-white/10 text-xs tracking-widest">
        &copy; {new Date().getFullYear()} SIA INC. ALL RIGHTS RESERVED.
      </div>
    </footer>
  );
};

export default Footer;