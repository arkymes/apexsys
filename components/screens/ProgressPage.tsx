'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Flame,
  Zap,
  Shield,
  Heart,
  Move,
  Dumbbell,
  Calendar,
  Trophy,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';
import { GlassPanel } from '@/components/ui/CyberFrame';
import { CircularProgress } from '@/components/ui/StatDisplay';
import { RankBadge } from '@/components/ui/RankBadge';
import { useAppStore } from '@/store/useAppStore';
import { RANK_REQUIREMENTS, type Rank, type TrainingDay } from '@/types';

const DAYS_OF_WEEK = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

type CalendarDayStatus = 'empty' | 'completed' | 'missed' | 'today' | 'future';
type CalendarDay = {
  day: number | null;
  status: CalendarDayStatus;
  dayKey: number | null;
  date?: Date;
};

const getDayKey = (value: Date | string) => {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
};

const formatDateLabel = (date?: Date) => {
  if (!date) return 'No date selected';
  return date.toLocaleDateString(undefined, {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
};

const generateCalendarDays = (trainingHistory: TrainingDay[]) => {
  const days: CalendarDay[] = [];
  const today = new Date();
  const todayKey = getDayKey(today);
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const startDay = startOfMonth.getDay();
  const completedDays = new Set(
    trainingHistory.filter((entry) => entry.completed).map((entry) => getDayKey(entry.date))
  );

  for (let i = 0; i < startDay; i++) {
    days.push({ day: null, status: 'empty', dayKey: null });
  }

  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  for (let i = 1; i <= daysInMonth; i++) {
    const dayDate = new Date(today.getFullYear(), today.getMonth(), i);
    const dayKey = getDayKey(dayDate);
    let status: CalendarDayStatus = 'future';
    if (completedDays.has(dayKey)) status = 'completed';
    else if (dayKey === todayKey) status = 'today';
    else if (dayKey < todayKey) status = 'missed';

    days.push({ day: i, status, dayKey, date: dayDate });
  }

  return days;
};

export function ProgressPage() {
  const user = useAppStore((state) => state.user);
  const trainingHistory = useAppStore((state) => state.trainingHistory);
  const calendarDays = useMemo(() => generateCalendarDays(trainingHistory), [trainingHistory]);

  const trainingByDayKey = useMemo(() => {
    const byKey = new Map<number, TrainingDay>();
    for (const day of trainingHistory) {
      byKey.set(getDayKey(day.date), day);
    }
    return byKey;
  }, [trainingHistory]);

  const [selectedDayKey, setSelectedDayKey] = useState<number | null>(null);

  const selectedDay = selectedDayKey ? trainingByDayKey.get(selectedDayKey) : undefined;
  const selectedDate = selectedDayKey ? new Date(selectedDayKey) : undefined;

  if (!user) return null;

  const nextRank =
    user.rank === 'S'
      ? 'S'
      : (['E', 'D', 'C', 'B', 'A', 'S'] as Rank[])[
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
        <GlassPanel className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-lg uppercase tracking-wider text-white/80 mb-4">Level</h3>
              <CircularProgress value={user.exp} max={user.expToNextLevel} size={150} strokeWidth={10}>
                <div className="text-center">
                  <div className="text-4xl font-display font-black text-yellow-400">{user.level}</div>
                  <div className="text-xs text-white/40 uppercase">Level</div>
                </div>
              </CircularProgress>
            </div>

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

        <GlassPanel className="p-6 opacity-50">
          <h3 className="font-display text-lg uppercase tracking-wider text-white/60 mb-4">Stats Overview</h3>
          <p className="text-white/40 text-sm">Detailed stats coming soon...</p>
        </GlassPanel>

        <GlassPanel className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-neon-blue" />
            <h3 className="font-display text-lg uppercase tracking-wider text-white">Training Streak</h3>
          </div>

          <div className="text-center mb-6">
            <div className="text-6xl font-display font-black text-yellow-400">{user.streak}</div>
            <div className="text-white/40 uppercase text-sm tracking-wider">Day Streak</div>
          </div>

          <div className="bg-transparent border border-white/30 p-4 shadow-[0_0_18px_rgba(255,255,255,0.14)]">
            <div className="grid grid-cols-7 gap-1 mb-2">
              {DAYS_OF_WEEK.map((day, i) => (
                <div key={i} className="text-center text-xs text-white/40 font-display">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, i) => {
                const isSelected = day.dayKey !== null && day.dayKey === selectedDayKey;
                const clickable = day.day !== null && day.status !== 'future';
                return (
                  <button
                    key={i}
                    disabled={!clickable}
                    onClick={() => day.dayKey && setSelectedDayKey(day.dayKey)}
                    className={`
                      aspect-square flex items-center justify-center rounded text-xs font-mono transition-all
                      ${!clickable ? 'cursor-default' : 'cursor-pointer hover:scale-105'}
                      ${day.status === 'completed' ? 'bg-green-500/30 border border-green-500/50 text-green-300' : ''}
                      ${day.status === 'missed' ? 'bg-red-500/20 border border-red-500/30 text-red-400' : ''}
                      ${day.status === 'today' ? 'bg-yellow-500/30 border border-yellow-500/50 text-yellow-300' : ''}
                      ${day.status === 'future' ? 'text-white/30' : ''}
                      ${day.status === 'empty' ? '' : ''}
                      ${isSelected ? 'ring-2 ring-neon-blue' : ''}
                    `}
                  >
                    {day.day}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-4 p-3 rounded border border-neon-blue/20 bg-neon-blue/5">
            <div className="text-neon-blue text-xs uppercase tracking-wider mb-1">Selected day</div>
            <div className="text-white text-sm mb-2">{formatDateLabel(selectedDate)}</div>
            {selectedDay ? (
              <div className="space-y-2">
                <div className="text-xs text-white/60">
                  Quests: {selectedDay.questsCompleted} | XP: {selectedDay.expGained}
                </div>
                {selectedDay.completedQuests && selectedDay.completedQuests.length > 0 ? (
                  <div className="space-y-1">
                    {selectedDay.completedQuests.map((quest) => (
                      <div
                        key={quest.questId}
                        className="text-xs text-white/80 flex items-center justify-between border border-white/10 rounded px-2 py-1"
                      >
                        <span className="truncate mr-2">{quest.name}</span>
                        <span className="text-white/50 whitespace-nowrap">
                          {quest.sets}x{quest.reps}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-white/50 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-green-400" />
                    Treino registrado, sem detalhes de quest para esse dia.
                  </div>
                )}
              </div>
            ) : (
              <div className="text-xs text-white/50">Clique em um dia para ver os treinos registrados.</div>
            )}
          </div>
        </GlassPanel>

        <GlassPanel className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <h3 className="font-display text-lg uppercase tracking-wider text-white">Rank Progress</h3>
          </div>

          <div className="flex items-center justify-center gap-6 mb-8">
            <RankBadge rank={user.rank} size="lg" />
            <ChevronRight className="w-8 h-8 text-white/40" />
            <RankBadge rank={nextRank} size="lg" />
          </div>

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
                  <span className="text-white/70">
                    {labels[key]} {units[key]}
                    {required}
                  </span>
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
