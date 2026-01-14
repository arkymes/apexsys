'use client';

import { motion } from 'framer-motion';
import type { Rank } from '@/types';

interface RankBadgeProps {
  rank: Rank;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  showGlow?: boolean;
}

const rankColors: Record<Rank, { bg: string; border: string; text: string; glow: string }> = {
  E: {
    bg: 'rgba(128, 128, 128, 0.2)',
    border: '#808080',
    text: '#808080',
    glow: 'rgba(128, 128, 128, 0.5)',
  },
  D: {
    bg: 'rgba(34, 197, 94, 0.2)',
    border: '#22c55e',
    text: '#22c55e',
    glow: 'rgba(34, 197, 94, 0.5)',
  },
  C: {
    bg: 'rgba(234, 179, 8, 0.2)',
    border: '#eab308',
    text: '#eab308',
    glow: 'rgba(234, 179, 8, 0.5)',
  },
  B: {
    bg: 'rgba(249, 115, 22, 0.2)',
    border: '#f97316',
    text: '#f97316',
    glow: 'rgba(249, 115, 22, 0.5)',
  },
  A: {
    bg: 'rgba(239, 68, 68, 0.2)',
    border: '#ef4444',
    text: '#ef4444',
    glow: 'rgba(239, 68, 68, 0.5)',
  },
  S: {
    bg: 'rgba(168, 85, 247, 0.2)',
    border: '#a855f7',
    text: '#a855f7',
    glow: 'rgba(168, 85, 247, 0.5)',
  },
};

const sizes = {
  sm: { container: 'w-8 h-8', text: 'text-sm' },
  md: { container: 'w-12 h-12', text: 'text-xl' },
  lg: { container: 'w-16 h-16', text: 'text-2xl' },
};

export function RankBadge({ rank, size = 'md', animated = true, showGlow = true }: RankBadgeProps) {
  const colors = rankColors[rank];
  const sizeClasses = sizes[size];

  return (
    <motion.div
      initial={animated ? { scale: 0, opacity: 0 } : undefined}
      animate={animated ? { scale: 1, opacity: 1 } : undefined}
      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
      className={`
        relative flex items-center justify-center rounded-full font-display font-bold
        ${sizeClasses.container} ${sizeClasses.text}
      `}
      style={{
        background: colors.bg,
        border: `2px solid ${colors.border}`,
        color: colors.text,
        boxShadow: showGlow ? `0 0 20px ${colors.glow}, 0 0 40px ${colors.glow}` : undefined,
      }}
    >
      {rank}
      {showGlow && (
        <motion.div
          className="absolute inset-0 rounded-full"
          animate={{
            boxShadow: [
              `0 0 10px ${colors.glow}`,
              `0 0 25px ${colors.glow}`,
              `0 0 10px ${colors.glow}`,
            ],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
    </motion.div>
  );
}

interface RankSelectorProps {
  selectedRank: Rank;
  onChange: (rank: Rank) => void;
}

export function RankSelector({ selectedRank, onChange }: RankSelectorProps) {
  const ranks: Rank[] = ['E', 'D', 'C', 'B', 'A', 'S'];

  return (
    <div className="flex items-center gap-3">
      {ranks.map((rank) => (
        <motion.button
          key={rank}
          onClick={() => onChange(rank)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className={`
            relative flex items-center justify-center w-12 h-12 rounded-full font-display font-bold text-lg
            transition-all duration-300 cursor-pointer
          `}
          style={{
            background: rank === selectedRank ? rankColors[rank].bg : 'transparent',
            border: `2px solid ${rank === selectedRank ? rankColors[rank].border : 'rgba(255,255,255,0.2)'}`,
            color: rank === selectedRank ? rankColors[rank].text : 'rgba(255,255,255,0.4)',
            boxShadow: rank === selectedRank ? `0 0 20px ${rankColors[rank].glow}` : undefined,
          }}
        >
          {rank}
        </motion.button>
      ))}
    </div>
  );
}
