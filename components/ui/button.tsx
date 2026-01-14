'use client';

import { motion, type HTMLMotionProps } from 'framer-motion';
import { forwardRef } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline' | 'cyber';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', loading, icon, children, disabled, ...props }, ref) => {
    const baseStyles = 'relative inline-flex items-center justify-center font-display font-semibold uppercase tracking-wider transition-all duration-300 overflow-hidden';
    
    const variantStyles: Record<ButtonVariant, string> = {
      primary: 'bg-gradient-to-r from-neon-blue/20 to-neon-glow/30 border border-neon-blue/50 text-neon-blue hover:from-neon-blue/30 hover:to-neon-glow/40 hover:border-neon-blue hover:shadow-[0_0_30px_rgba(0,212,255,0.4)]',
      secondary: 'bg-transparent border border-white/20 text-white/70 hover:border-white/40 hover:text-white hover:bg-white/5',
      ghost: 'bg-transparent text-white/60 hover:text-white hover:bg-white/10',
      danger: 'bg-gradient-to-r from-red-500/20 to-red-600/30 border border-red-500/50 text-red-400 hover:from-red-500/30 hover:to-red-600/40 hover:border-red-500',
      outline: 'bg-transparent border-2 border-white/30 text-white/80 hover:border-white/60 hover:text-white hover:bg-white/5',
      cyber: 'bg-gradient-to-r from-neon-blue to-neon-cyan border-2 border-neon-blue text-shadow-900 font-bold hover:shadow-[0_0_40px_rgba(0,212,255,0.6)] hover:scale-105',
    };

    const sizeStyles: Record<ButtonSize, string> = {
      sm: 'px-4 py-2 text-xs gap-2',
      md: 'px-6 py-3 text-sm gap-2',
      lg: 'px-8 py-4 text-base gap-3',
    };

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
        whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
        className={`
          ${baseStyles}
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${disabled || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${className}
        `}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            {icon && <span>{icon}</span>}
            {children}
          </>
        )}
        
        {/* Hover shine effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
          initial={{ x: '-100%' }}
          whileHover={{ x: '100%' }}
          transition={{ duration: 0.5 }}
        />
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

interface IconButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  icon: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className = '', variant = 'ghost', icon, ...props }, ref) => {
    const variantStyles = {
      primary: 'bg-neon-blue/20 border border-neon-blue/50 text-neon-blue hover:bg-neon-blue/30',
      secondary: 'bg-white/5 border border-white/20 text-white/70 hover:bg-white/10 hover:text-white',
      ghost: 'text-white/60 hover:text-white hover:bg-white/10',
    };

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className={`
          p-2 rounded-lg transition-all duration-200
          ${variantStyles[variant]}
          ${className}
        `}
        {...props}
      >
        {icon}
      </motion.button>
    );
  }
);

IconButton.displayName = 'IconButton';
