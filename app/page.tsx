'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ParticleBackground } from '@/components/ui/ParticleBackground';
import { 
  SystemAwakening, 
  WelcomeScreen, 
  HunterAssessment,
  ProtocolGenerator,
  Dashboard
} from '@/components/screens';
import { Navigation } from '@/components/layout';
import { useAppStore } from '@/store/useAppStore';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const currentScreen = useAppStore((state) => state.currentScreen);
  const user = useAppStore((state) => state.user);
  const particlesEnabled = useAppStore((state) => state.particlesEnabled);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-shadow-900 flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-neon-blue/20 border-t-neon-blue rounded-full animate-spin" />
      </div>
    );
  }

  const showNavigation = currentScreen === 'dashboard';

  return (
    <main className="min-h-screen bg-gradient-to-b from-shadow-900 via-shadow-800 to-shadow-900 relative">
      {/* Particle Background */}
      {particlesEnabled && <ParticleBackground />}
      
      {/* Grid overlay */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-30 z-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 212, 255, 0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 212, 255, 0.02) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Navigation */}
      {showNavigation && <Navigation />}

      {/* Main Content */}
      <div className="relative z-10">
        <AnimatePresence mode="wait">
          {currentScreen === 'awakening' && <SystemAwakening key="awakening" />}
          {currentScreen === 'welcome' && <WelcomeScreen key="welcome" />}
          {currentScreen === 'assessment' && <HunterAssessment key="assessment" />}
          {currentScreen === 'protocol-generating' && <ProtocolGenerator key="protocol" />}
          {currentScreen === 'dashboard' && <Dashboard key="dashboard" />}
        </AnimatePresence>
      </div>
    </main>
  );
}
