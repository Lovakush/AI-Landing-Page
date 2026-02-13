'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Loader2, User, Bot } from 'lucide-react';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
}

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [session, setSession] = useState<{session_id: string} | null>(null);
  const [quickReplies, setQuickReplies] = useState<string[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', company: '' });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isOpenRef = useRef(isOpen);

  // Sound effects (inline, no external files needed)
  const playSound = (type: 'send' | 'receive' | 'typing') => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      if (type === 'send') {
        // Quick "pop" sound
        oscillator.frequency.value = 800;
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
      } else if (type === 'receive') {
        // Pleasant "ding"
        oscillator.frequency.value = 600;
        gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
      } else if (type === 'typing') {
        // Subtle click
        oscillator.frequency.value = 400;
        gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.05);
      }
    } catch (e) {
      // Silently fail if audio context not available
      console.log('Audio not available');
    }
  };

  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      loadInitialMessage();
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, session]);

  const handleClose = async () => {
    setIsOpen(false);
    
    if (session?.session_id) {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
        await fetch(`${apiUrl}/api/chat/session/close/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            session_id: session.session_id,
            delete_messages: true,
          }),
        });
      } catch (error) {
        console.error('Error closing session:', error);
      }
    }
    
    setMessages([]);
    setSession(null);
    setQuickReplies([]);
    setShowForm(false);
  };

  const loadInitialMessage = async () => {
    const initialMessage = {
      id: Date.now(),
      text: "Hi! I'm SIA Assistant 👋\n\nI help businesses explore our AI agents:\n• ARGO (Sales)\n• MARK (Marketing)\n• CONSUELO (HR)\n\nWould you like to share your details to get started faster?",
      sender: 'bot' as const
    };
    setMessages([initialMessage]);
    setQuickReplies(['Yes, fill form', 'No, let\'s chat', 'Book a demo']);
    playSound('receive');
  };

  const handleFormSubmit = async () => {
    if (!formData.name || !formData.email) {
      alert('Please fill in at least your name and email');
      return;
    }

    setShowForm(false);
    
    const welcomeMessage: Message = {
      id: Date.now(),
      text: `Thanks ${formData.name}! I've noted your details. How can I help you today?`,
      sender: 'bot'
    };
    
    setMessages(prev => [...prev, welcomeMessage]);
    setQuickReplies(['Book a demo', 'Learn about products', 'See pricing']);
    playSound('receive');

    // Submit form data to backend
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
      const response = await fetch(`${apiUrl}/api/chat/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `My name is ${formData.name}, email is ${formData.email}${formData.company ? `, company is ${formData.company}` : ''}`,
          user_name: formData.name,
          user_email: formData.email,
          company_name: formData.company,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setSession({ session_id: data.session_id });
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleSend = useCallback(async (messageText?: string) => {
    const textToSend = messageText || input.trim();
    if (!textToSend) return;

    // Handle quick replies
    if (textToSend === 'Yes, fill form') {
      setShowForm(true);
      setQuickReplies([]);
      return;
    }

    if (textToSend === 'No, let\'s chat') {
      setQuickReplies([]);
      const msg: Message = {
        id: Date.now(),
        text: "No problem! What's your name?",
        sender: 'bot'
      };
      setMessages(prev => [...prev, msg]);
      playSound('receive');
      return;
    }

    const userMessage: Message = {
      id: Date.now(),
      text: textToSend,
      sender: 'user',
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    setQuickReplies([]);

    // Play send sound
    playSound('send');

    // Play typing sound after delay
    setTimeout(() => playSound('typing'), 500);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
      
      const response = await fetch(`${apiUrl}/api/chat/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          session_id: session?.session_id,
        }),
      });

      const data = await response.json();
      setIsTyping(false);

      if (data.success && data.response) {
        setSession({ session_id: data.session_id });
        
        const botMessage: Message = {
          id: Date.now() + 1,
          text: data.response,
          sender: 'bot',
        };
        setMessages((prev) => [...prev, botMessage]);
        
        // Play receive sound
        playSound('receive');
        
        if (data.suggested_actions && data.suggested_actions.length > 0) {
          setQuickReplies(data.suggested_actions);
        }
        
        if (!isOpenRef.current) {
          setUnreadCount((prev) => prev + 1);
        }
      } else {
        const errorMessage: Message = {
          id: Date.now() + 1,
          text: data.error || "Sorry, something went wrong.",
          sender: 'bot',
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setIsTyping(false);
      
      const errorMessage: Message = {
        id: Date.now() + 1,
        text: "Connection error. Please try again.",
        sender: 'bot',
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  }, [input, session]);

  const renderMessageWithLinks = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    
    return parts.map((part, index) => {
      if (part.match(urlRegex)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: '#E8B84A',
              textDecoration: 'underline',
              fontWeight: 600,
              wordBreak: 'break-all'
            }}
          >
            {part}
          </a>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className="chatbot-container">
      {/* Toggle Button */}
      <motion.button
        onClick={() => isOpen ? handleClose() : setIsOpen(true)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9999,
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #E8B84A 0%, #E8A87C 100%)',
          boxShadow: '0 4px 24px rgba(232, 184, 74, 0.6)',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {unreadCount > 0 && !isOpen && (
          <span
            style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              minWidth: '22px',
              height: '22px',
              padding: '0 6px',
              borderRadius: '11px',
              backgroundColor: '#ef4444',
              border: '2px solid white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '11px',
              fontWeight: 'bold',
              color: 'white',
            }}
          >
            {unreadCount}
          </span>
        )}

        {isOpen ? (
          <X style={{ width: '26px', height: '26px', color: '#2D1B4E' }} />
        ) : (
          <MessageCircle style={{ width: '26px', height: '26px', color: '#2D1B4E' }} />
        )}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            style={{
              position: 'fixed',
              bottom: '100px',
              right: '24px',
              zIndex: 9998,
              width: '400px',
              maxWidth: 'calc(100vw - 48px)',
              height: '600px',
              maxHeight: 'calc(100vh - 140px)',
              borderRadius: '24px',
              background: 'linear-gradient(135deg, rgba(45, 27, 78, 0.98) 0%, rgba(30, 20, 50, 0.98) 100%)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: '24px',
                background: 'linear-gradient(to right, rgba(232, 184, 74, 0.15), rgba(232, 168, 124, 0.15))',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                flexShrink: 0,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #E8B84A, #E8A87C)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Bot style={{ width: '22px', height: '22px', color: '#2D1B4E' }} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: 'white' }}>
                    SIA Assistant
                  </h3>
                  <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)' }}>
                    {isTyping ? 'Typing...' : 'Online'}
                  </p>
                </div>
              </div>
            </div>

            {/* Form Modal */}
            {showForm && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(45, 27, 78, 0.95)',
                zIndex: 10,
                display: 'flex',
                flexDirection: 'column',
                padding: '24px',
              }}>
                <h3 style={{ color: 'white', marginBottom: '20px', fontSize: '20px' }}>Quick Start Form</h3>
                <input
                  type="text"
                  placeholder="Your Name *"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  style={{
                    marginBottom: '12px',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.2)',
                    background: 'rgba(255,255,255,0.05)',
                    color: 'white',
                    fontSize: '14px'
                  }}
                />
                <input
                  type="email"
                  placeholder="Your Email *"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  style={{
                    marginBottom: '12px',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.2)',
                    background: 'rgba(255,255,255,0.05)',
                    color: 'white',
                    fontSize: '14px'
                  }}
                />
                <input
                  type="text"
                  placeholder="Company (optional)"
                  value={formData.company}
                  onChange={(e) => setFormData({...formData, company: e.target.value})}
                  style={{
                    marginBottom: '20px',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.2)',
                    background: 'rgba(255,255,255,0.05)',
                    color: 'white',
                    fontSize: '14px'
                  }}
                />
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    onClick={handleFormSubmit}
                    style={{
                      flex: 1,
                      padding: '12px',
                      borderRadius: '8px',
                      background: 'linear-gradient(to right, #E8B84A, #E8A87C)',
                      border: 'none',
                      color: '#2D1B4E',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    Submit
                  </button>
                  <button
                    onClick={() => setShowForm(false)}
                    style={{
                      flex: 1,
                      padding: '12px',
                      borderRadius: '8px',
                      background: 'transparent',
                      border: '1px solid rgba(255,255,255,0.2)',
                      color: 'white',
                      cursor: 'pointer'
                    }}
                  >
                    Skip
                  </button>
                </div>
              </div>
            )}

            {/* Messages */}
            <div
              className="chatbot-messages"
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
              }}
            >
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    display: 'flex',
                    justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                    alignItems: 'flex-start',
                    gap: '8px',
                  }}
                >
                  {msg.sender === 'bot' && (
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #E8B84A, #E8A87C)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <Bot style={{ width: '18px', height: '18px', color: '#2D1B4E' }} />
                    </div>
                  )}
                  <div
                    style={{
                      maxWidth: '75%',
                      padding: '14px 16px',
                      borderRadius: msg.sender === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                      background: msg.sender === 'user'
                        ? 'linear-gradient(135deg, #E8B84A 0%, #E8A87C 100%)'
                        : 'rgba(255, 255, 255, 0.08)',
                      color: msg.sender === 'user' ? '#2D1B4E' : 'white',
                      fontSize: '14px',
                      lineHeight: '1.6',
                      wordBreak: 'break-word',
                      whiteSpace: 'pre-wrap',
                      fontWeight: msg.sender === 'user' ? 500 : 400,
                    }}
                  >
                    {renderMessageWithLinks(msg.text)}
                  </div>
                  {msg.sender === 'user' && (
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: 'rgba(255, 255, 255, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <User style={{ width: '18px', height: '18px', color: 'white' }} />
                    </div>
                  )}
                </motion.div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #E8B84A, #E8A87C)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <Bot style={{ width: '18px', height: '18px', color: '#2D1B4E' }} />
                  </div>
                  <div
                    style={{
                      padding: '14px 16px',
                      borderRadius: '18px 18px 18px 4px',
                      background: 'rgba(255, 255, 255, 0.08)',
                      display: 'flex',
                      gap: '6px',
                    }}
                  >
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: '#E8B84A',
                          animation: `bounce 0.6s infinite ${i * 0.2}s`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Replies */}
            {quickReplies.length > 0 && !isTyping && !showForm && (
              <div
                style={{
                  padding: '0 20px 12px',
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '8px',
                }}
              >
                {quickReplies.map((reply, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(reply)}
                    style={{
                      padding: '8px 14px',
                      fontSize: '13px',
                      borderRadius: '20px',
                      border: '1px solid rgba(232, 184, 74, 0.4)',
                      background: 'rgba(232, 184, 74, 0.1)',
                      color: '#E8B84A',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      fontWeight: 500,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(232, 184, 74, 0.2)';
                      e.currentTarget.style.borderColor = 'rgba(232, 184, 74, 0.6)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(232, 184, 74, 0.1)';
                      e.currentTarget.style.borderColor = 'rgba(232, 184, 74, 0.4)';
                    }}
                  >
                    {reply}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div
              style={{
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '20px',
                display: 'flex',
                gap: '10px',
                flexShrink: 0,
              }}
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Type your message..."
                disabled={isTyping}
                style={{
                  flex: 1,
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '14px',
                  padding: '12px 16px',
                  fontSize: '14px',
                  color: 'white',
                  outline: 'none',
                }}
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isTyping}
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '14px',
                  background: (!input.trim() || isTyping) ? 'rgba(232, 184, 74, 0.3)' : 'linear-gradient(135deg, #E8B84A, #E8A87C)',
                  border: 'none',
                  cursor: (!input.trim() || isTyping) ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s',
                }}
              >
                {isTyping ? (
                  <Loader2 style={{ width: '20px', height: '20px', color: '#2D1B4E', animation: 'spin 1s linear infinite' }} />
                ) : (
                  <Send style={{ width: '20px', height: '20px', color: '#2D1B4E' }} />
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .chatbot-messages::-webkit-scrollbar {
          width: 6px;
        }
        .chatbot-messages::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .chatbot-messages::-webkit-scrollbar-thumb {
          background: rgba(232, 184, 74, 0.4);
          border-radius: 10px;
        }
        .chatbot-messages::-webkit-scrollbar-thumb:hover {
          background: rgba(232, 184, 74, 0.6);
        }
      `}</style>
    </div>
  );
}

export default Chatbot;