'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send } from 'lucide-react';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
}

const quickQuestions = [
  "What AI agents do you offer?",
  "How does the 30-day deployment work?",
  "Can I book a demo?",
];

function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="bg-white/8 border border-white/10 rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="w-2 h-2 rounded-full bg-white/40"
            animate={{ y: [0, -4, 0] }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.15,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "Hi! I'm the SIA assistant. How can I help you today?", sender: 'bot' },
  ]);
  const [input, setInput] = useState('');
  const [showQuickQuestions, setShowQuickQuestions] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isOpenRef = useRef(isOpen);

  // Keep ref in sync so the timeout callback sees the latest value
  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  // Scroll to bottom on new messages or when typing indicator appears
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Auto-focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
      // Small delay to let the panel animate in
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleSend = useCallback(() => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      text: input.trim(),
      sender: 'user',
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setShowQuickQuestions(false);
    setIsTyping(true);

    // Simulated bot reply
    setTimeout(() => {
      const botMessage: Message = {
        id: Date.now() + 1,
        text: "Thanks for your message! Our team will get back to you shortly. In the meantime, feel free to explore our products.",
        sender: 'bot',
      };
      setIsTyping(false);
      setMessages((prev) => [...prev, botMessage]);

      // Show notification dot if chat is closed
      if (!isOpenRef.current) {
        setUnreadCount((prev) => prev + 1);
      }
    }, 1500);
  }, [input]);

  return (
    <>
      {/* Toggle Button */}
      <motion.button
        onClick={() => setIsOpen((prev) => !prev)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-lg cursor-pointer"
        style={{
          background: 'linear-gradient(135deg, #6B4E9B, #2D1B4E)',
          boxShadow: '0 4px 24px rgba(107, 78, 155, 0.5)',
        }}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        {/* Notification badge */}
        {unreadCount > 0 && !isOpen && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-red-500 border-2 border-[#2D1B4E] flex items-center justify-center"
          >
            <span className="text-white text-[10px] font-bold leading-none">{unreadCount}</span>
          </motion.span>
        )}

        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.span
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="w-6 h-6 text-white" />
            </motion.span>
          ) : (
            <motion.span
              key="chat"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <MessageCircle className="w-6 h-6 text-white" />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="fixed bottom-24 right-6 z-50 w-[380px] max-h-[520px] flex flex-col rounded-2xl overflow-hidden border"
            style={{
              backgroundColor: '#1a1a2e',
              borderColor: 'rgba(107, 78, 155, 0.3)',
              boxShadow: '0 8px 40px rgba(0, 0, 0, 0.4), 0 0 60px rgba(107, 78, 155, 0.15)',
            }}
          >
            {/* Header */}
            <div
              className="flex items-center gap-3 px-5 py-4 shrink-0"
              style={{
                background: 'linear-gradient(135deg, #2D1B4E, #3d2a5f)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#E8B84A] to-[#E8A87C] flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-[#2D1B4E]" />
              </div>
              <div>
                <p className="text-white text-sm font-semibold">SIA Assistant</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-[300px] chatbot-scrollbar">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-gradient-to-r from-[#6B4E9B] to-[#8B5CF6] text-white rounded-br-md'
                        : 'bg-white/8 text-white/85 border border-white/10 rounded-bl-md'
                    }`}
                  >
                    {msg.text}
                  </div>
                </motion.div>
              ))}
              {/* Typing Indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <TypingIndicator />
                </motion.div>
              )}
              {/* Quick Questions */}
              {showQuickQuestions && (
                <div className="flex flex-col gap-2 pt-1">
                  {quickQuestions.map((q, i) => (
                    <motion.button
                      key={q}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: 0.3 + i * 0.1 }}
                      onClick={() => setInput(q)}
                      className="text-left text-sm px-3.5 py-2.5 rounded-xl border border-[#6B4E9B]/30 text-white/70 hover:text-white hover:bg-[#6B4E9B]/15 hover:border-[#6B4E9B]/50 transition-all cursor-pointer"
                    >
                      {q}
                    </motion.button>
                  ))}
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2 px-4 py-3 shrink-0"
              style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 bg-white/5 border border-white/10 text-white placeholder-white/30 text-sm px-4 py-2.5 rounded-xl focus:outline-none focus:border-[#6B4E9B]/60 focus:ring-1 focus:ring-[#6B4E9B]/30 transition-all"
              />
              <motion.button
                type="submit"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{
                  background: input.trim()
                    ? 'linear-gradient(135deg, #E8B84A, #E8A87C)'
                    : 'rgba(255,255,255,0.05)',
                  transition: 'background 0.3s',
                }}
                disabled={!input.trim()}
              >
                <Send className={`w-4 h-4 ${input.trim() ? 'text-[#2D1B4E]' : 'text-white/30'}`} />
              </motion.button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
