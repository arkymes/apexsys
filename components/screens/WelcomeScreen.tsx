'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';

export function WelcomeScreen() {
  const [hunterName, setHunterName] = useState('');
  const [showText, setShowText] = useState(false);
  const setScreen = useAppStore((state) => state.setScreen);

  useEffect(() => {
    const name = sessionStorage.getItem('tempHunterName') || 'Hunter';
    setHunterName(name);

    // Show welcome text after brief delay
    const showTimer = setTimeout(() => {
      setShowText(true);
    }, 500);

    // Auto-transition after animation
    const transitionTimer = setTimeout(() => {
      setScreen('assessment');
    }, 3500);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(transitionTimer);
    };
  }, [setScreen]);

  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* System message */}
      {showText && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-yellow-500 font-mono text-lg mb-4"
          >
            [SYSTEM]
          </motion.p>
          
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="font-display text-4xl md:text-6xl font-bold text-white mb-4 text-glow-strong"
          >
            Welcome, Hunter
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="gradient-text text-3xl md:text-5xl font-display font-bold"
          >
            {hunterName}
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="text-white/60 mt-8 text-lg font-body"
          >
            Your training begins now...
          </motion.p>

          {/* Loading indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="mt-8 flex justify-center"
          >
            <div className="flex gap-2">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 bg-neon-cyan rounded-full"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1, delay: i * 0.2, repeat: Infinity }}
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Scan line effect */}
      <motion.div
        className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-neon-cyan/50 to-transparent"
        initial={{ top: '0%' }}
        animate={{ top: '100%' }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
      />
    </motion.div>
  );
}
