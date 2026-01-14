'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Key } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

export function SystemAwakening() {
  const [showNotification, setShowNotification] = useState(true);
  const [countdown, setCountdown] = useState(10);
  const [showNameInput, setShowNameInput] = useState(false);
  const [hunterName, setHunterName] = useState('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const setScreen = useAppStore((state) => state.setScreen);
  const geminiApiKey = useAppStore((state) => state.geminiApiKey);
  const setGeminiApiKey = useAppStore((state) => state.setGeminiApiKey);

  // Countdown timer
  useEffect(() => {
    if (!showNotification || countdown <= 0) return;
    
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [showNotification, countdown]);

  // Auto accept when countdown reaches 0
  useEffect(() => {
    if (countdown === 0 && showNotification) {
      handleAccept();
    }
  }, [countdown, showNotification]);

  const handleAccept = () => {
    setShowNotification(false);
    setTimeout(() => {
      // Force check for empty string as well
      if (!geminiApiKey || geminiApiKey.trim() === '') {
        setShowApiKeyInput(true);
      } else {
        setShowNameInput(true);
      }
    }, 500);
  };

  const handleDecline = () => {
    // Reset countdown - can't actually decline!
    setCountdown(10);
  };

  const handleSubmitApiKey = () => {
    if (!apiKey.trim()) return;
    setGeminiApiKey(apiKey.trim());
    setShowApiKeyInput(false);
    setTimeout(() => {
      setShowNameInput(true);
    }, 500);
  };

  const handleSubmitName = () => {
    if (!hunterName.trim()) return;
    sessionStorage.setItem('tempHunterName', hunterName);
    sessionStorage.setItem('tempHunterRank', 'D');
    setScreen('welcome');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative frame borders - Top */}
      <div className="absolute top-0 left-0 right-0 h-16 pointer-events-none">
        <div className="absolute top-4 left-4 right-4 h-1 bg-gradient-to-r from-transparent via-neon-blue/60 to-transparent" />
        <div className="absolute top-6 left-8 w-24 h-px bg-neon-blue/40" />
        <div className="absolute top-6 right-8 w-24 h-px bg-neon-blue/40" />
        
        {/* Corner decorations */}
        <div className="absolute top-4 left-4">
          <div className="w-8 h-8 border-l-2 border-t-2 border-neon-blue/60" />
        </div>
        <div className="absolute top-4 right-4">
          <div className="w-8 h-8 border-r-2 border-t-2 border-neon-blue/60" />
        </div>
      </div>

      {/* Decorative frame borders - Bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none">
        <div className="absolute bottom-4 left-4 right-4 h-1 bg-gradient-to-r from-transparent via-neon-blue/60 to-transparent" />
        <div className="absolute bottom-6 left-8 w-24 h-px bg-neon-blue/40" />
        <div className="absolute bottom-6 right-8 w-24 h-px bg-neon-blue/40" />
        
        {/* Small decorative elements */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
          <div className="w-2 h-2 bg-neon-blue/30 rotate-45" />
          <div className="w-2 h-2 bg-neon-blue/50 rotate-45" />
          <div className="w-2 h-2 bg-neon-blue/30 rotate-45" />
        </div>
        
        {/* Corner decorations */}
        <div className="absolute bottom-4 left-4">
          <div className="w-8 h-8 border-l-2 border-b-2 border-neon-blue/60" />
        </div>
        <div className="absolute bottom-4 right-4">
          <div className="w-8 h-8 border-r-2 border-b-2 border-neon-blue/60" />
        </div>
      </div>

      {/* Side decorations */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 w-1 h-32 bg-gradient-to-b from-transparent via-neon-blue/30 to-transparent" />
      <div className="absolute right-4 top-1/2 -translate-y-1/2 w-1 h-32 bg-gradient-to-b from-transparent via-neon-blue/30 to-transparent" />

      <AnimatePresence mode="wait">
        {/* Initial Notification Popup */}
        {showNotification && (
          <motion.div
            key="notification"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="notification-popup w-full max-w-lg relative"
          >
            {/* Corner accents */}
            <div className="absolute -top-1 -left-1 w-6 h-6 border-l-2 border-t-2 border-neon-cyan" />
            <div className="absolute -top-1 -right-1 w-6 h-6 border-r-2 border-t-2 border-neon-cyan" />
            <div className="absolute -bottom-1 -left-1 w-6 h-6 border-l-2 border-b-2 border-neon-cyan" />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 border-r-2 border-b-2 border-neon-cyan" />

            {/* Header */}
            <div className="flex items-center gap-4 p-6 border-b border-white/20">
              <div className="w-10 h-10 border-2 border-white/60 rounded flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-white/80" />
              </div>
              <h2 className="font-display text-xl tracking-wider text-white font-bold">
                NOTIFICATION
              </h2>
            </div>

            {/* Content */}
            <div className="p-8 text-center">
              <p className="text-white text-lg mb-2 font-body">
                If you don&apos;t accept, your heart will stop in{' '}
                <span className="countdown-timer text-2xl">
                  {countdown} seconds
                </span>
              </p>
              <p className="text-white/90 text-lg mt-6 font-body">
                Do you want to accept ?
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 p-6 pt-0 justify-center">
              <motion.button
                onClick={handleAccept}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-12 py-3 font-display text-sm tracking-wider border-2 border-white/40 text-white bg-gradient-to-b from-white/10 to-transparent hover:from-white/20 hover:border-white/60 transition-all"
              >
                Yes
              </motion.button>
              <motion.button
                onClick={handleDecline}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-12 py-3 font-display text-sm tracking-wider border-2 border-white/40 text-white bg-gradient-to-b from-white/10 to-transparent hover:from-white/20 hover:border-white/60 transition-all"
              >
                No
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* API Key Input Screen */}
        {showApiKeyInput && (
          <motion.div
            key="apiKeyInput"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="notification-popup w-full max-w-lg relative"
          >
            {/* Corner accents */}
            <div className="absolute -top-1 -left-1 w-6 h-6 border-l-2 border-t-2 border-neon-cyan" />
            <div className="absolute -top-1 -right-1 w-6 h-6 border-r-2 border-t-2 border-neon-cyan" />
            <div className="absolute -bottom-1 -left-1 w-6 h-6 border-l-2 border-b-2 border-neon-cyan" />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 border-r-2 border-b-2 border-neon-cyan" />

            {/* Header */}
            <div className="flex items-center gap-4 p-6 border-b border-white/20">
              <div className="w-10 h-10 border-2 border-white/60 rounded flex items-center justify-center">
                <Key className="w-6 h-6 text-white/80" />
              </div>
              <h2 className="font-display text-xl tracking-wider text-white font-bold">
                GEMINI API CONFIGURATION
              </h2>
            </div>

            {/* Content */}
            <div className="p-8">
              <p className="text-white/80 text-center mb-6 font-body">
                [SYSTEM] Para ativar o Núcleo de IA e otimizar seu treinamento PMF, configure sua chave API do Gemini.
              </p>
              
              <p className="text-white/60 text-sm mb-2 font-display uppercase tracking-wider">
                Gemini API Key:
              </p>
              
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmitApiKey()}
                placeholder="Digite sua chave API do Gemini"
                autoFocus
                className="input-cyber w-full text-lg"
              />
            </div>

            {/* Button */}
            <div className="flex justify-center p-6 pt-0">
              <motion.button
                onClick={handleSubmitApiKey}
                disabled={!apiKey.trim()}
                whileHover={{ scale: apiKey.trim() ? 1.02 : 1 }}
                whileTap={{ scale: apiKey.trim() ? 0.98 : 1 }}
                className={`px-16 py-3 font-display text-sm tracking-wider border-2 transition-all ${
                  apiKey.trim()
                    ? 'border-neon-cyan/60 text-neon-cyan bg-gradient-to-b from-neon-cyan/20 to-transparent hover:border-neon-cyan hover:shadow-[0_0_20px_rgba(0,245,255,0.3)]'
                    : 'border-white/20 text-white/40 cursor-not-allowed'
                }`}
              >
                CONFIGURAR
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Name Input Screen */}
        {showNameInput && (
          <motion.div
            key="nameInput"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="notification-popup w-full max-w-lg relative"
          >
            {/* Corner accents */}
            <div className="absolute -top-1 -left-1 w-6 h-6 border-l-2 border-t-2 border-neon-cyan" />
            <div className="absolute -top-1 -right-1 w-6 h-6 border-r-2 border-t-2 border-neon-cyan" />
            <div className="absolute -bottom-1 -left-1 w-6 h-6 border-l-2 border-b-2 border-neon-cyan" />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 border-r-2 border-b-2 border-neon-cyan" />

            {/* Header */}
            <div className="flex items-center gap-4 p-6 border-b border-white/20">
              <div className="w-10 h-10 border-2 border-white/60 rounded flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-white/80" />
              </div>
              <h2 className="font-display text-xl tracking-wider text-white font-bold">
                HUNTER REGISTRATION
              </h2>
            </div>

            {/* Content */}
            <div className="p-8">
              <p className="text-white/80 text-center mb-6 font-body">
                [SYSTEM] Player has been registered as a{' '}
                <span className="text-neon-cyan font-semibold">HUNTER</span>
              </p>
              
              <p className="text-white/60 text-sm mb-2 font-display uppercase tracking-wider">
                Enter your name:
              </p>
              
              <input
                type="text"
                value={hunterName}
                onChange={(e) => setHunterName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmitName()}
                placeholder="Hunter Name"
                autoFocus
                className="input-cyber w-full text-lg"
              />
            </div>

            {/* Button */}
            <div className="flex justify-center p-6 pt-0">
              <motion.button
                onClick={handleSubmitName}
                disabled={!hunterName.trim()}
                whileHover={{ scale: hunterName.trim() ? 1.02 : 1 }}
                whileTap={{ scale: hunterName.trim() ? 0.98 : 1 }}
                className={`px-16 py-3 font-display text-sm tracking-wider border-2 transition-all ${
                  hunterName.trim()
                    ? 'border-neon-cyan/60 text-neon-cyan bg-gradient-to-b from-neon-cyan/20 to-transparent hover:border-neon-cyan hover:shadow-[0_0_20px_rgba(0,245,255,0.3)]'
                    : 'border-white/20 text-white/40 cursor-not-allowed'
                }`}
              >
                CONFIRM
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
