'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface GlowingTextProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  animate?: boolean;
}

export function GlowingText({ 
  children, 
  className = '', 
  delay = 0,
  animate = true 
}: GlowingTextProps) {
  return (
    <motion.span
      initial={animate ? { opacity: 0, textShadow: '0 0 0px rgba(0, 212, 255, 0)' } : undefined}
      animate={animate ? { 
        opacity: 1, 
        textShadow: [
          '0 0 10px rgba(0, 212, 255, 0.5), 0 0 20px rgba(0, 212, 255, 0.3), 0 0 30px rgba(0, 212, 255, 0.2)',
          '0 0 20px rgba(0, 212, 255, 0.8), 0 0 40px rgba(0, 212, 255, 0.5), 0 0 60px rgba(0, 212, 255, 0.3)',
          '0 0 10px rgba(0, 212, 255, 0.5), 0 0 20px rgba(0, 212, 255, 0.3), 0 0 30px rgba(0, 212, 255, 0.2)',
        ]
      } : undefined}
      transition={{ 
        delay, 
        duration: 0.5,
        textShadow: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
      }}
      className={`text-white ${className}`}
    >
      {children}
    </motion.span>
  );
}

interface WelcomeTextProps {
  name: string;
}

export function WelcomeText({ name }: WelcomeTextProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="text-center"
    >
      <motion.h1
        className="font-display text-5xl md:text-7xl font-bold tracking-wider"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.8 }}
        style={{
          textShadow: `
            0 0 10px rgba(0, 212, 255, 0.8),
            0 0 20px rgba(0, 212, 255, 0.6),
            0 0 40px rgba(0, 212, 255, 0.4),
            0 0 60px rgba(0, 212, 255, 0.2)
          `,
        }}
      >
        WELCOME, {name.toUpperCase()}
      </motion.h1>
    </motion.div>
  );
}
