'use client';

import { forwardRef, InputHTMLAttributes } from 'react';
import { motion } from 'framer-motion';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, icon, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-xs uppercase tracking-wider text-white/60 mb-2 font-display">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={`
              w-full bg-black/40 border border-white/20 rounded-lg
              px-4 py-3 text-white font-body text-lg
              placeholder:text-white/30 placeholder:uppercase placeholder:tracking-widest placeholder:text-sm
              focus:outline-none focus:border-neon-blue/60 focus:shadow-[0_0_15px_rgba(0,212,255,0.2)]
              transition-all duration-300
              ${icon ? 'pl-12' : ''}
              ${error ? 'border-red-500/50' : ''}
              ${className}
            `}
            {...props}
          />
          {/* Focus glow */}
          <motion.div
            className="absolute inset-0 rounded-lg pointer-events-none"
            initial={false}
            whileFocus={{
              boxShadow: '0 0 20px rgba(0, 212, 255, 0.3), inset 0 0 10px rgba(0, 212, 255, 0.1)',
            }}
          />
        </div>
        {error && (
          <p className="text-red-400 text-sm mt-1">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

interface SelectButtonProps {
  options: { value: string; label: string; icon?: React.ReactNode }[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function SelectButtons({ options, value, onChange, className = '' }: SelectButtonProps) {
  return (
    <div className={`flex flex-wrap gap-3 ${className}`}>
      {options.map((option) => (
        <motion.button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`
            flex items-center gap-2 px-6 py-3 rounded-lg font-display text-sm uppercase tracking-wider
            border transition-all duration-300
            ${value === option.value
              ? 'bg-neon-blue/20 border-neon-blue/60 text-neon-blue shadow-[0_0_20px_rgba(0,212,255,0.2)]'
              : 'bg-transparent border-white/20 text-white/60 hover:border-white/40 hover:text-white'
            }
          `}
        >
          {option.icon}
          {option.label}
        </motion.button>
      ))}
    </div>
  );
}
