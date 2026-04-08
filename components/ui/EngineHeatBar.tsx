'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getUsageSnapshot, type EngineUsageSnapshot } from '@/lib/engineUsageTracker';

const POLL_INTERVAL_MS = 3000;

/** Resolve bar color from heat 0→1: green → yellow → orange → red → black */
function resolveBarColor(heat: number): string {
  if (heat >= 0.95) return '#000000';
  if (heat >= 0.8) return '#dc2626';
  if (heat >= 0.6) return '#ea580c';
  if (heat >= 0.4) return '#eab308';
  if (heat >= 0.2) return '#84cc16';
  return '#22c55e';
}

function resolveBarGlow(heat: number): string {
  if (heat >= 0.95) return '0 0 12px rgba(0,0,0,0.8)';
  if (heat >= 0.8) return '0 0 16px rgba(220,38,38,0.6)';
  if (heat >= 0.6) return '0 0 12px rgba(234,88,12,0.4)';
  if (heat >= 0.4) return '0 0 10px rgba(234,179,8,0.3)';
  return '0 0 8px rgba(34,197,94,0.2)';
}

function resolveLabel(heat: number): { text: string; color: string } {
  if (heat >= 0.95) return { text: 'OVERHEAT', color: '#ff0000' };
  if (heat >= 0.8) return { text: 'CRITICAL', color: '#fca5a5' };
  if (heat >= 0.6) return { text: 'HIGH', color: '#fdba74' };
  if (heat >= 0.4) return { text: 'MODERATE', color: '#fde047' };
  if (heat >= 0.15) return { text: 'ACTIVE', color: '#86efac' };
  return { text: 'IDLE', color: '#4ade80' };
}

/** SVG "OVERHEAT" text with glitch/glow effect */
function OverheatSVG() {
  return (
    <svg
      viewBox="0 0 200 32"
      className="w-full h-6"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <filter id="overheat-glow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feFlood floodColor="#ff0000" floodOpacity="0.6" result="color" />
          <feComposite in="color" in2="blur" operator="in" result="shadow" />
          <feMerge>
            <feMergeNode in="shadow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="overheat-glitch">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.08"
            numOctaves="3"
            seed="2"
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="2"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>
      {/* Background glitch layer */}
      <text
        x="100"
        y="23"
        textAnchor="middle"
        fontFamily="monospace"
        fontWeight="900"
        fontSize="22"
        letterSpacing="6"
        fill="#ff0000"
        opacity="0.3"
        filter="url(#overheat-glitch)"
      >
        OVERHEAT
      </text>
      {/* Main text with glow */}
      <text
        x="100"
        y="23"
        textAnchor="middle"
        fontFamily="monospace"
        fontWeight="900"
        fontSize="22"
        letterSpacing="6"
        fill="#000000"
        stroke="#ff0000"
        strokeWidth="0.5"
        filter="url(#overheat-glow)"
      >
        OVERHEAT
      </text>
    </svg>
  );
}

interface EngineHeatBarProps {
  className?: string;
  compact?: boolean;
}

export function EngineHeatBar({ className = '', compact = false }: EngineHeatBarProps) {
  const [snapshot, setSnapshot] = useState<EngineUsageSnapshot | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const refresh = useCallback(() => {
    setSnapshot(getUsageSnapshot());
  }, []);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [refresh]);

  if (!snapshot) return null;

  const { heatLevel, rpm, rpd, limits } = snapshot;
  const barColor = resolveBarColor(heatLevel);
  const barGlow = resolveBarGlow(heatLevel);
  const label = resolveLabel(heatLevel);
  const isOverheat = heatLevel >= 0.95;
  const pct = Math.max(2, Math.round(heatLevel * 100));

  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="relative w-16 h-2 rounded-full bg-shadow-700 overflow-hidden">
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{ backgroundColor: barColor, boxShadow: barGlow }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.6 }}
          />
        </div>
        <span className="text-[10px] font-mono" style={{ color: label.color }}>
          {label.text}
        </span>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      {/* Header */}
      <button
        onClick={() => setShowDetails((v) => !v)}
        className="w-full flex items-center justify-between mb-2 group cursor-pointer"
      >
        <div className="flex items-center gap-2">
          {/* Engine icon */}
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke={label.color} strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
          </svg>
          <span className="text-xs font-display uppercase tracking-wider text-white/60 group-hover:text-white/80 transition-colors">
            Engine Load
          </span>
        </div>
        <span
          className="text-xs font-mono font-bold"
          style={{ color: label.color }}
        >
          {isOverheat ? '' : `${pct}%`}
        </span>
      </button>

      {/* Bar */}
      <div className="relative h-3 rounded-full bg-shadow-700 overflow-hidden border border-white/5">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            backgroundColor: barColor,
            boxShadow: barGlow,
          }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
        {/* Pulse effect when high */}
        {heatLevel >= 0.6 && (
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{ backgroundColor: barColor }}
            animate={{ opacity: [0.15, 0.35, 0.15] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}
      </div>

      {/* Overheat SVG label */}
      <AnimatePresence>
        {isOverheat && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-2"
          >
            <OverheatSVG />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status label when not overheat */}
      {!isOverheat && (
        <div className="mt-1.5 flex items-center justify-between">
          <span className="text-[10px] font-mono" style={{ color: label.color }}>
            {label.text}
          </span>
          <span className="text-[10px] font-mono text-white/30">
            {rpd}/{limits.rpd} RPD
          </span>
        </div>
      )}

      {/* Expandable details */}
      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-3 pt-3 border-t border-white/10 space-y-2">
              <MiniStat label="Requests/min" value={rpm} max={limits.rpm} />
              <MiniStat label="Requests/day" value={rpd} max={limits.rpd} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MiniStat({ label, value, max }: { label: string; value: number; max: number }) {
  const ratio = Math.min(1, value / max);
  const color = resolveBarColor(ratio);
  return (
    <div className="flex items-center justify-between text-[10px]">
      <span className="text-white/40 font-mono">{label}</span>
      <div className="flex items-center gap-2">
        <div className="w-20 h-1.5 rounded-full bg-shadow-700 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.max(2, ratio * 100)}%`, backgroundColor: color }}
          />
        </div>
        <span className="text-white/50 font-mono w-16 text-right">
          {value}/{max}
        </span>
      </div>
    </div>
  );
}
