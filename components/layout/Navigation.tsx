'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MessageSquare } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { SystemChatPanel } from '@/components/ui';

const navItems = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/quests', label: 'Quests' },
  { href: '/skills', label: 'Skills' },
  { href: '/progress', label: 'Progress' },
  { href: '/profile', label: 'Profile' },
];

export function Navigation() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const pathname = usePathname();
  const user = useAppStore((state) => state.user);
  const level = user?.level || 1;
  const exp = user?.exp || 0;
  const expToNextLevel = user?.expToNextLevel || 100;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      {/* Glassmorphism background */}
      <div className="absolute inset-0 bg-gradient-to-r from-shadow-900/80 via-shadow-800/70 to-shadow-900/80 backdrop-blur-xl border-b border-white/[0.1]" />
      
      {/* Glow line at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-neon-blue/50 to-transparent" />
      
      <div className="relative max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2">
            <motion.span
              className="font-display text-xl font-bold tracking-wider text-white"
              style={{ textShadow: '0 0 20px rgba(0, 212, 255, 0.5)' }}
              whileHover={{ textShadow: '0 0 30px rgba(0, 212, 255, 0.8)' }}
            >
              SHADOW GYM
            </motion.span>
          </Link>

          {/* Nav Items */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || 
                (item.href !== '/dashboard' && pathname?.startsWith(item.href));
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    relative px-4 py-2 font-display text-sm uppercase tracking-wider
                    transition-all duration-300 rounded-lg
                    ${isActive 
                      ? 'text-white bg-shadow-700/50 border border-white/10' 
                      : 'text-white/50 border border-transparent hover:text-white hover:bg-shadow-700/30 hover:border-neon-blue/20'
                    }
                  `}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Level Badge with XP Bar */}
          <div className="flex items-center gap-4">
            
            {/* Chat Trigger */}
            <button
              onClick={() => setIsChatOpen(true)}
              className="p-2 rounded-lg bg-neon-blue/10 border border-neon-blue/30 text-neon-blue hover:bg-neon-blue/20 hover:scale-105 transition-all"
            >
              <MessageSquare className="w-5 h-5" />
            </button>

            <div className="hidden sm:block w-32">
              <div className="h-2 bg-black/30 rounded-full overflow-hidden border border-white/10">
                <motion.div
                  className="h-full bg-gradient-to-r from-neon-blue to-neon-cyan"
                  initial={{ width: 0 }}
                  animate={{ width: `${(exp / expToNextLevel) * 100}%` }}
                  style={{ boxShadow: '0 0 10px rgba(0, 212, 255, 0.5)' }}
                />
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-shadow-700/50 border border-white/10 backdrop-blur-md">
              <span className="text-white/60 text-xs font-display">LV.</span>
              <span className="text-gold font-display font-bold" style={{ textShadow: '0 0 10px rgba(255, 215, 0, 0.5)' }}>{level}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <div className="md:hidden relative flex items-center justify-around py-2 border-t border-white/[0.05] bg-shadow-900/50 backdrop-blur-md">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                px-3 py-1.5 font-display text-xs uppercase tracking-wider rounded-lg transition-all
                ${isActive 
                  ? 'text-white bg-shadow-700/50 border border-white/10' 
                  : 'text-white/50'
                }
              `}
            >
              {item.label}
            </Link>
          );
        })}
      </div>

      <SystemChatPanel isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </nav>
  );
}
