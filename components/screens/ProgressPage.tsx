'use client';

import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Flame,
  Zap,
  Shield,
  Heart,
  Move,
  Dumbbell,
  Calendar,
  Trophy,
  ChevronRight
} from 'lucide-react';
import { GlassPanel } from '@/components/ui/CyberFrame';
import { CircularProgress } from '@/components/ui/StatDisplay';
import { RankBadge } from '@/components/ui/RankBadge';
import { useAppStore } from '@/store/useAppStore';
import { RANK_REQUIREMENTS, type Rank } from '@/types';

const DAYS_OF_WEEK = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

// Generate mock calendar data
const generateCalendarDays = () => {
  const days = [];
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const startDay = startOfMonth.getDay();
  
  // Previous month padding
  for (let i = 0; i < startDay; i++) {
    days.push({ day: null, status: 'empty' as const });
  }
  
  // Current month days
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  for (let i = 1; i <= daysInMonth; i++) {
    const isToday = i === today.getDate();
    const isPast = i < today.getDate();
    let status: 'completed' | 'missed' | 'today' | 'future' = 'future';
    
    if (isToday) status = 'today';
    else if (isPast) {
      // Simulate some completed and missed days
      status = Math.random() > 0.2 ? 'completed' : 'missed';
    }
    
    days.push({ day: i, status });
  }
  
  return days;
};

export function ProgressPage() {
  const user = useAppStore((state) => state.user);
  const calendarDays = generateCalendarDays();

  if (!user) return null;

  const nextRank = user.rank === 'S' ? 'S' : 
    (['E', 'D', 'C', 'B', 'A', 'S'] as Rank[])[
      (['E', 'D', 'C', 'B', 'A', 'S'] as Rank[]).indexOf(user.rank) + 1
    ];
  
  const requirements = RANK_REQUIREMENTS[nextRank];
  const maxStat = Math.max(
    user.stats.push, 
    user.stats.pull, 
    user.stats.legs, 
    user.stats.core,
    user.stats.endurance, 
    user.stats.mobility
  );

  const currentReqs = {
    level: { current: user.level, required: requirements.level },
    workouts: { current: user.totalWorkouts, required: requirements.workouts },
    streak: { current: user.streak, required: requirements.streak },
    stat: { current: maxStat, required: requirements.statThreshold },
  };

  return (
    <div className="pt-24 pb-8 px-4 max-w-7xl mx-auto">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-display text-3xl font-bold text-white mb-8"
      >
        Progress Tracking
      </motion.h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Level Progress */}
        <GlassPanel className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-lg uppercase tracking-wider text-white/80 mb-4">
                Hunter Level
              </h3>
              <CircularProgress
                value={user.exp}
                max={user.expToNextLevel}
                size={150}
                strokeWidth={10}
              >
                <div className="text-center">
                  <div className="text-4xl font-display font-black text-yellow-400">{user.level}</div>
                  <div className="text-xs text-white/40 uppercase">Level</div>
                </div>
              </CircularProgress>
            </div>
            
            {/* Stats Bars */}
            <div className="flex-1 ml-8 space-y-4">
              {[
                { icon: Flame, label: 'PUSH', value: user.stats.push, color: '#ef4444', max: 100 },
                { icon: Zap, label: 'PULL', value: user.stats.pull, color: '#eab308', max: 100 },
                { icon: Dumbbell, label: 'LEGS', value: user.stats.legs, color: '#3b82f6', max: 100 },
                { icon: Shield, label: 'CORE', value: user.stats.core, color: '#8b5cf6', max: 100 },
                { icon: Heart, label: 'CARDIO', value: user.stats.endurance, color: '#ec4899', max: 100 },
                { icon: Move, label: 'FLEX', value: user.stats.mobility, color: '#22c55e', max: 100 },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center gap-3">
                  <span className="font-display text-sm text-white/60 w-8">{stat.label}</span>
                  <div className="flex-1 h-3 bg-shadow-700/50 rounded-full overflow-hidden border border-white/10">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(stat.value / stat.max) * 100}%` }}
                      transition={{ duration: 1, delay: 0.2 }}
                      className="h-full rounded-full"
                      style={{ background: stat.color }}
                    />
                  </div>
                  <span className="font-mono text-sm text-white/80 w-8">{stat.value}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex justify-between mt-6 text-sm">
            <span className="text-white/60">EXP: {user.exp}</span>
            <span className="text-white/40">NEXT: {user.expToNextLevel}</span>
          </div>
        </GlassPanel>

        {/* Empty panel for layout balance - can be used for future features */}
        <GlassPanel className="p-6 opacity-50">
          <h3 className="font-display text-lg uppercase tracking-wider text-white/60 mb-4">
            Stats Overview
          </h3>
          <p className="text-white/40 text-sm">Detailed stats coming soon...</p>
        </GlassPanel>

        {/* Training Streak */}
        <GlassPanel className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-neon-blue" />
            <h3 className="font-display text-lg uppercase tracking-wider text-white">
              Training Streak
            </h3>
          </div>

          <div className="text-center mb-6">
            <div className="text-6xl font-display font-black text-yellow-400">{user.streak}</div>
            <div className="text-white/40 uppercase text-sm tracking-wider">Day Streak</div>
          </div>

          {/* Calendar */}
          <div className="bg-transparent border border-white/30 p-4 shadow-[0_0_18px_rgba(255,255,255,0.14)]">
            {/* Days header */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {DAYS_OF_WEEK.map((day, i) => (
                <div key={i} className="text-center text-xs text-white/40 font-display">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, i) => (
                <div
                  key={i}
                  className={`
                    aspect-square flex items-center justify-center rounded text-xs font-mono
                    ${day.status === 'empty' ? '' : ''}
                    ${day.status === 'completed' ? 'bg-green-500/30 border border-green-500/50 text-green-400' : ''}
                    ${day.status === 'missed' ? 'bg-red-500/20 border border-red-500/30 text-red-400' : ''}
                    ${day.status === 'today' ? 'bg-yellow-500/30 border border-yellow-500/50 text-yellow-400' : ''}
                    ${day.status === 'future' ? 'text-white/30' : ''}
                  `}
                >
                  {day.day}
                </div>
              ))}
            </div>
          </div>
        </GlassPanel>

        {/* Rank Progress */}
        <GlassPanel className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <h3 className="font-display text-lg uppercase tracking-wider text-white">
              Rank Progress
            </h3>
          </div>

          {/* Current to Next Rank */}
          <div className="flex items-center justify-center gap-6 mb-8">
            <RankBadge rank={user.rank} size="lg" />
            <ChevronRight className="w-8 h-8 text-white/40" />
            <RankBadge rank={nextRank} size="lg" />
          </div>

          {/* Requirements */}
          <div className="space-y-3">
            <h4 className="font-display text-sm uppercase tracking-wider text-white/60 flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              Rank Up Requirements
            </h4>
            
            {Object.entries(currentReqs).map(([key, { current, required }]) => {
              const labels: Record<string, string> = {
                level: 'Reach Level',
                workouts: 'Complete Workouts',
                streak: 'Day Streak',
                stat: 'STR/AGI/END',
              };
              const units: Record<string, string> = {
                level: '',
                workouts: '',
                streak: '',
                stat: '>',
              };
              
              return (
                <div key={key} className="flex items-center justify-between text-sm">
                  <span className="text-white/70">{labels[key]} {units[key]}{required}</span>
                  <span className={`font-mono ${current >= required ? 'text-green-400' : 'text-white/50'}`}>
                    {current}/{required}
                  </span>
                </div>
              );
            })}
          </div>
        </GlassPanel>
      </div>
    </div>
  );
}
