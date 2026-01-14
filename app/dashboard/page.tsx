'use client';

import { useEffect, useState } from 'react';
import { ParticleBackground } from '@/components/ui/ParticleBackground';
import { Dashboard } from '@/components/screens/Dashboard';
import { Navigation } from '@/components/layout/Navigation';
import { useAppStore } from '@/store/useAppStore';
import { redirect } from 'next/navigation';

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
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

  if (!user) {
    redirect('/');
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-shadow-900 via-shadow-800 to-shadow-900 relative">
      {particlesEnabled && <ParticleBackground />}
      
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

      <Navigation />
      
      <div className="relative z-10">
        <Dashboard />
      </div>
    </main>
  );
}
