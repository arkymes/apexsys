'use client';

import { motion } from 'framer-motion';

interface ApexsysLogoProps {
  className?: string;
}

export function ApexsysLogo({ className }: ApexsysLogoProps) {
  return (
    <div className={className}>
      <div className="relative h-8 w-[180px]">
        <svg viewBox="0 0 320 64" className="h-full w-full" role="img" aria-label="APEXSYS">
          <defs>
            <linearGradient id="apexsys-main-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8BF3FF" />
              <stop offset="55%" stopColor="#00D4FF" />
              <stop offset="100%" stopColor="#9A7CFF" />
            </linearGradient>
          </defs>
          <text
            x="6"
            y="45"
            fontFamily="'Orbitron', 'Rajdhani', sans-serif"
            fontSize="40"
            fontWeight="800"
            letterSpacing="4"
            fill="url(#apexsys-main-gradient)"
            style={{ textShadow: '0 0 18px rgba(0, 212, 255, 0.45)' }}
          >
            APEXSYS
          </text>
        </svg>

        <svg
          viewBox="0 0 320 64"
          className="pointer-events-none absolute inset-0 h-full w-full mix-blend-screen"
          aria-hidden
        >
          <motion.text
            x="6"
            y="45"
            fontFamily="'Orbitron', 'Rajdhani', sans-serif"
            fontSize="40"
            fontWeight="800"
            letterSpacing="4"
            fill="#FF3D71"
            initial={{ opacity: 0, x: 0 }}
            animate={{
              opacity: [0, 0, 0.75, 0, 0, 0],
              x: [0, 0, 1.5, -1.5, 0, 0],
            }}
            transition={{
              duration: 7,
              repeat: Infinity,
              times: [0, 0.7, 0.73, 0.76, 0.8, 1],
              ease: 'linear',
            }}
          >
            APEXSYS
          </motion.text>
        </svg>
      </div>
    </div>
  );
}
