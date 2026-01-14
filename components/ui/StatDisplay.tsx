'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: number;
  color: string;
  maxValue?: number;
}

export function StatCard({ icon: Icon, label, value, color, maxValue = 100 }: StatCardProps) {
  const percentage = Math.min((value / maxValue) * 100, 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className="relative overflow-hidden border border-white/35 bg-transparent p-4 transition-all duration-300 hover:border-neon-blue/35 shadow-[0_0_22px_rgba(255,255,255,0.16)]"
      style={{
        boxShadow: `0 4px 20px ${color}15`,
      }}
    >
      {/* Glow effect on hover */}
      <div 
        className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle at center, ${color}10 0%, transparent 70%)`,
        }}
      />
      
      <div className="relative z-10 flex flex-col items-center gap-2">
        <div 
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{
            background: `linear-gradient(135deg, ${color}20 0%, ${color}10 100%)`,
            border: `1px solid ${color}30`,
          }}
        >
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        <span className="text-xs uppercase tracking-wider text-white/50 font-display">
          {label}
        </span>
        <span
          className="text-2xl font-display font-bold"
          style={{ 
            color,
            textShadow: `0 0 20px ${color}50`,
          }}
        >
          {value}
        </span>
      </div>
      
      {/* Bottom progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="h-full"
          style={{ 
            background: `linear-gradient(90deg, ${color} 0%, ${color}80 100%)`,
            boxShadow: `0 0 10px ${color}`,
          }}
        />
      </div>
    </motion.div>
  );
}

interface XPBarProps {
  current: number;
  max: number;
  level: number;
  showLabels?: boolean;
}

export function XPBar({ current, max, level, showLabels = true }: XPBarProps) {
  const percentage = (current / max) * 100;

  return (
    <div className="w-full">
      {showLabels && (
        <div className="flex justify-between items-center mb-2 text-sm font-mono">
          <span className="text-white/60">EXP: {current}</span>
          <span className="text-white/40">NEXT: {max}</span>
        </div>
      )}
      <div className="relative h-3 bg-black/30 backdrop-blur-sm rounded-full border border-white/[0.15] overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="h-full bg-gradient-to-r from-neon-blue to-neon-cyan rounded-full"
          style={{
            boxShadow: '0 0 15px rgba(0, 212, 255, 0.5)',
          }}
        />
        {/* Shimmer effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          animate={{ x: ['-100%', '200%'] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    </div>
  );
}

interface CircularProgressProps {
  value: number;
  max: number;
  size?: number;
  strokeWidth?: number;
  children?: React.ReactNode;
}

export function CircularProgress({
  value,
  max,
  size = 120,
  strokeWidth = 8,
  children,
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / max) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="circular-progress" width={size} height={size}>
        <circle
          className="bg"
          cx={size / 2}
          cy={size / 2}
          r={radius}
        />
        <motion.circle
          className="progress"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          style={{ strokeDasharray: circumference }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}
