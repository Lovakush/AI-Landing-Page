'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Rocket } from 'lucide-react';

interface WaitlistModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WaitlistModal({ isOpen, onClose }: WaitlistModalProps) {
  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleClose = () => {
    onClose();
    setShowSuccess(false);
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/70 backdrop-blur-sm"
      onClick={handleClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-md w-full rounded-2xl p-8 border"
        style={{
          backgroundColor: '#1a1a2e',
          borderColor: 'rgba(232, 184, 74, 0.3)',
          boxShadow: '0 0 60px rgba(232, 184, 74, 0.2)',
        }}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {showSuccess ? (
          <div className="text-center py-4">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h4 className="text-2xl font-bold text-white mb-2">You&apos;re on the list!</h4>
            <p className="text-white/60 text-sm mb-6">
              We&apos;ll be in touch soon. Keep an eye on your inbox.
            </p>
            <motion.button
              onClick={handleClose}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 rounded-xl font-semibold text-[#2D1B4E] bg-gradient-to-r from-[#E8B84A] to-[#E8A87C] hover:shadow-[0_0_30px_rgba(232,184,74,0.4)] transition-all"
            >
              Done
            </motion.button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-[#E8B84A] to-[#E8A87C] flex items-center justify-center">
                <Rocket className="w-8 h-8 text-[#2D1B4E]" />
              </div>
              <h4 className="text-2xl font-bold text-white mb-2">Request Access</h4>
              <p className="text-white/60 text-sm">
                Enter your email to join the waitlist and be among the first to experience SIA.
              </p>
            </div>

            {/* Email Input */}
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setErrorMessage('');
                try {
                  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
                  const res = await fetch(`${apiUrl}/api/waitlist/join/`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email }),
                  });
                  if (!res.ok) {
                    const errorData = await res.json().catch(() => null);
                    let message = res.status === 400 ? 'Email already registered.' : 'Something went wrong. Please try again.';
                    if (errorData) {
                      const emailErr = errorData.email;
                      if (Array.isArray(emailErr) && emailErr[0]) {
                        message = emailErr[0];
                      } else if (typeof emailErr === 'string') {
                        message = emailErr;
                      } else if (typeof errorData.error === 'string') {
                        message = errorData.error;
                      } else if (typeof errorData.detail === 'string') {
                        message = errorData.detail;
                      }
                    }
                    setErrorMessage(message);
                    return;
                  }
                  setShowSuccess(true);
                  setEmail('');
                } catch (err) {
                  console.error('Waitlist error:', err);
                  setErrorMessage('Could not connect to the server. Please check if the backend is running.');
                }
              }}
              className="space-y-4"
            >
              <div>
                <label htmlFor="waitlist-email" className="block text-sm font-medium text-white/70 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="waitlist-email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrorMessage('');
                  }}
                  placeholder="you@company.com"
                  required
                  className={`w-full px-4 py-3 rounded-xl bg-white/5 border text-white placeholder-white/30 focus:outline-none transition-all ${
                    errorMessage
                      ? 'border-red-500/60 focus:border-red-500/80 focus:ring-2 focus:ring-red-500/20'
                      : 'border-white/10 focus:border-[#E8B84A]/50 focus:ring-2 focus:ring-[#E8B84A]/20'
                  }`}
                />
                {errorMessage && (
                  <p className="text-red-400 text-sm mt-2">{errorMessage}</p>
                )}
              </div>

              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 rounded-xl font-semibold text-[#2D1B4E] bg-gradient-to-r from-[#E8B84A] to-[#E8A87C] hover:shadow-[0_0_30px_rgba(232,184,74,0.4)] transition-all"
              >
                Join Waitlist
              </motion.button>
            </form>

            {/* Footer note */}
            <p className="text-center text-white/40 text-xs mt-4">
              We respect your privacy. No spam, ever.
            </p>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}
