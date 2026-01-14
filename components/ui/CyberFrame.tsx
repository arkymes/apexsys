'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface CyberFrameProps {
  children: ReactNode;
  className?: string;
  animated?: boolean;
}

export function CyberFrame({ children, className = '', animated = true }: CyberFrameProps) {
  return (
    <motion.div
      initial={animated ? { opacity: 0, scale: 0.95 } : undefined}
      animate={animated ? { opacity: 1, scale: 1 } : undefined}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`relative ${className}`}
    >
      {/* Outer glow */}
      <div className="absolute -inset-1 bg-gradient-to-r from-neon-blue/20 via-transparent to-neon-blue/20 rounded-xl blur-xl opacity-60" />

      {/* Main content container (same family as QuestsPage blocks) */}
      <div className="relative z-10 overflow-hidden rounded-xl border border-white/10 bg-shadow-800/60 backdrop-blur-md shadow-[0_12px_40px_rgba(0,0,0,0.45)]">
        {/* Top glow line */}
        <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-neon-blue/50 to-transparent" />

        {/* Corner accents */}
        <div className="absolute top-0 left-0 w-6 h-6 border-t border-l border-neon-blue/40 rounded-tl-xl" />
        <div className="absolute top-0 right-0 w-6 h-6 border-t border-r border-neon-blue/40 rounded-tr-xl" />
        <div className="absolute bottom-0 left-0 w-6 h-6 border-b border-l border-neon-blue/20 rounded-bl-xl" />
        <div className="absolute bottom-0 right-0 w-6 h-6 border-b border-r border-neon-blue/20 rounded-br-xl" />

        <div className="relative z-10">{children}</div>
      </div>
    </motion.div>
  );
}

interface GlassPanelProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
}

export function GlassPanel({ children, className = '', hover = false, glow = false }: GlassPanelProps) {
  return (
    <div
      className={`
        relative overflow-hidden
        border border-white/40 bg-transparent transition-all duration-300
        shadow-[0_0_24px_rgba(255,255,255,0.18)]
        ${hover ? 'hover:border-neon-blue/40 hover:shadow-[0_0_26px_rgba(0,212,255,0.26)]' : ''}
        ${glow ? 'shadow-[0_0_26px_rgba(0,212,255,0.22)]' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'highlight' | 'dark';
}

export function GlassCard({ children, className = '', variant = 'default' }: GlassCardProps) {
  const variants = {
    default: 'bg-shadow-700/50 border-white/10',
    highlight: 'bg-neon-blue/10 border-neon-blue/30',
    dark: 'bg-shadow-900/60 border-white/10',
  };

  return (
    <div
      className={`
        relative overflow-hidden rounded-lg backdrop-blur-md border
        ${variants[variant]}
        transition-all duration-300 hover:border-neon-blue/30
        ${className}
      `}
    >
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

