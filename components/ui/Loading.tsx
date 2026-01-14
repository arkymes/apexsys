'use client';

import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
}

export function LoadingSpinner({ size = 'md', message }: LoadingSpinnerProps) {
  const sizes = {
    sm: 'w-8 h-8 border-2',
    md: 'w-12 h-12 border-3',
    lg: 'w-16 h-16 border-4',
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className={`
          ${sizes[size]}
          border-neon-blue/20 border-t-neon-blue
          rounded-full animate-spin
        `}
      />
      {message && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-white/60 font-body text-sm uppercase tracking-wider"
        >
          {message}
        </motion.p>
      )}
    </div>
  );
}

interface AnalyzingLoaderProps {
  title?: string;
  subtitle?: string;
}

export function AnalyzingLoader({ 
  title = 'ANALYZING DATA...', 
  subtitle = 'Generating personalized protocol...' 
}: AnalyzingLoaderProps) {
  return (
    <div className="flex flex-col items-center gap-6">
      {/* Outer ring */}
      <div className="relative w-24 h-24">
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-neon-blue/30"
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="absolute inset-2 rounded-full border-2 border-transparent border-t-neon-blue"
          animate={{ rotate: -360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="absolute inset-4 rounded-full border-2 border-neon-blue/20"
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        />
        
        {/* Center pulse */}
        <motion.div
          className="absolute inset-8 rounded-full bg-neon-blue/20"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.8, 0.5]
          }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>
      
      {/* Text */}
      <div className="text-center">
        <motion.p
          className="text-white/80 font-display text-lg tracking-wider"
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {title}
        </motion.p>
        <p className="text-white/40 font-body text-sm mt-1">{subtitle}</p>
      </div>
    </div>
  );
}

interface SystemBootProps {
  onComplete?: () => void;
}

export function SystemBoot({ onComplete }: SystemBootProps) {
  return (
    <motion.div
      className="flex flex-col items-center gap-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="text-neon-blue font-display text-xl tracking-[0.3em]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        INITIALIZING SYSTEM
      </motion.div>
      
      <div className="w-64 h-2 bg-shadow-700 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-neon-blue to-neon-cyan"
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ duration: 2, ease: 'easeInOut' }}
          onAnimationComplete={onComplete}
        />
      </div>
      
      <motion.div
        className="flex flex-col gap-1 font-mono text-xs text-white/40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {'>'} Loading neural pathways...
        </motion.span>
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          {'>'} Calibrating bio-metrics...
        </motion.span>
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          {'>'} Syncing user data...
        </motion.span>
      </motion.div>
    </motion.div>
  );
}
