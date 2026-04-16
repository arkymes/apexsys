'use client';

import { motion } from 'framer-motion';
import { 
  User, 
  Flame, 
  Zap, 
  Shield, 
  Heart, 
  Scroll, 
  Crown,
  AlertTriangle,
  CheckCircle2,
  Move,
  Dumbbell,
  CalendarDays
} from 'lucide-react';
import { GlassPanel } from '@/components/ui/CyberFrame';
import { RankBadge } from '@/components/ui/RankBadge';
import { StatCard, XPBar, CircularProgress } from '@/components/ui/StatDisplay';
import { useAppStore } from '@/store/useAppStore';

function useWeeklyProgress() {
  const user = useAppStore((state) => state.user);
  const trainingHistory = useAppStore((state) => state.trainingHistory);

  const sessionsGoal = Math.max(2, Math.min(7, Number(user?.trainingFrequency) || 3));

  // Count unique training days this week (Mon-Sun)
  const now = new Date();
  const dayOfWeek = now.getDay();
  const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - mondayOffset);
  weekStart.setHours(0, 0, 0, 0);

  const sessionsDone = new Set(
    trainingHistory
      .filter((day) => {
        const d = new Date(day.date);
        return d >= weekStart && day.questsCompleted > 0;
      })
      .map((day) => {
        const d = new Date(day.date);
        return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      })
  ).size;

  return { sessionsDone, sessionsGoal };
}

export function Dashboard() {
  const user = useAppStore((state) => state.user);
  const dailyQuests = useAppStore((state) => state.dailyQuests);
  const weeklyQuests = useAppStore((state) => state.weeklyQuests);
  const completeQuest = useAppStore((state) => state.completeQuest);
  const { sessionsDone, sessionsGoal } = useWeeklyProgress();

  if (!user) return null;

  const completedDaily = dailyQuests.filter((q) => q.status === 'completed').length;
  const totalDaily = dailyQuests.length;

  return (
    <div className="pt-20 md:pt-24 pb-24 md:pb-8 px-3 sm:px-4 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left Panel - Profile */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <GlassPanel className="p-4 sm:p-6">
            {/* Avatar & Name */}
            <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-shadow-600 border border-white/10 flex items-center justify-center">
                <User className="w-6 h-6 sm:w-8 sm:h-8 text-white/60" />
              </div>
              <div>
                <h2 className="font-display text-xl font-bold text-white">{user.name.toUpperCase()}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <RankBadge rank={user.rank} size="sm" showGlow={false} />
                  <span className="text-white/60 font-display text-sm">{user.rank}-RANK</span>
                </div>
              </div>
            </div>

            {/* Level */}
            <div className="text-center mb-4 sm:mb-6">
              <span className="text-white/60 font-display text-sm uppercase tracking-wider">Level</span>
              <div className="level-display">LV.{user.level}</div>
            </div>

            {/* XP Bar */}
            <div className="mb-4 sm:mb-6">
              <XPBar current={user.exp} max={user.expToNextLevel} level={user.level} />
            </div>

            {/* Stats Grid (Standardized Pillars) */}
            <div className="grid grid-cols-3 sm:grid-cols-2 gap-2 sm:gap-3">
              <StatCard icon={Flame} label="PUSH" value={user.stats.push} color="#ef4444" />
              <StatCard icon={Zap} label="PULL" value={user.stats.pull} color="#eab308" />
              <StatCard icon={Dumbbell} label="LEGS" value={user.stats.legs} color="#3b82f6" />
              <StatCard icon={Shield} label="CORE" value={user.stats.core} color="#8b5cf6" />
              <StatCard icon={Heart} label="CARDIO" value={user.stats.endurance} color="#ec4899" />
              <StatCard icon={Move} label="FLEX" value={user.stats.mobility} color="#22c55e" />
            </div>
          </GlassPanel>
        </motion.div>

        {/* Right Panel - Quests */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 space-y-6"
        >
          {/* Daily Quests */}
          <GlassPanel className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="flex items-center gap-2">
                <Scroll className="w-5 h-5 text-neon-blue" />
                <h3 className="font-display text-lg uppercase tracking-wider text-white">Daily Quests</h3>
              </div>
              <span className="font-mono text-sm text-yellow-400">[{completedDaily}/{totalDaily}]</span>
            </div>

            <div className="space-y-3">
              {dailyQuests.map((quest, index) => (
                <motion.div
                  key={quest.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className={`
                    relative flex items-start gap-4 p-4 rounded-lg border transition-all duration-300
                    ${quest.status === 'completed'
                      ? 'bg-green-500/5 border-green-500/30'
                      : 'bg-shadow-700/50 border-white/10 hover:border-neon-blue/30'
                    }
                  `}
                >
                  {/* Checkbox */}
                  <button
                    onClick={() => quest.status !== 'completed' && completeQuest(quest.id)}
                    className={`
                      w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5
                      transition-all duration-300
                      ${quest.status === 'completed'
                        ? 'bg-green-500/20 border-green-500 text-green-400'
                        : 'border-neon-blue/40 hover:border-neon-blue hover:bg-neon-blue/10'
                      }
                    `}
                  >
                    {quest.status === 'completed' && <CheckCircle2 className="w-4 h-4" />}
                  </button>

                  {/* Quest Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`font-display font-semibold ${quest.status === 'completed' ? 'text-white/50 line-through' : 'text-white'}`}>
                        {quest.name} ({quest.sets}x{quest.reps})
                      </span>
                    </div>
                    <p className="text-white/50 text-sm font-body">{quest.description}</p>
                  </div>

                  {/* XP Reward */}
                  <div className="flex-shrink-0 text-right">
                    <span className="text-yellow-400 font-mono text-sm">+{quest.xpReward} XP</span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Warning */}
            <div className="mt-4 flex items-center gap-2 text-red-400 text-sm">
              <AlertTriangle className="w-4 h-4" />
              <span>WARNING: Failure to complete daily quest will result in penalty</span>
            </div>
          </GlassPanel>

          {/* Weekly Quest */}
          <GlassPanel className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-yellow-400" />
                <h3 className="font-display text-lg uppercase tracking-wider text-white">Weekly Quest</h3>
              </div>
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-neon-blue" />
                <span className={`font-mono text-sm ${sessionsDone >= sessionsGoal ? 'text-green-400' : 'text-yellow-400'}`}>
                  [{sessionsDone}/{sessionsGoal}]
                </span>
              </div>
            </div>

            {/* Weekly Progress Bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-xs text-white/50 mb-1.5">
                <span>Sessions this week</span>
                <span>{Math.min(100, Math.round((sessionsDone / sessionsGoal) * 100))}%</span>
              </div>
              <div className="h-2.5 bg-shadow-700 rounded-full overflow-hidden border border-white/5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (sessionsDone / sessionsGoal) * 100)}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className={`h-full rounded-full ${
                    sessionsDone >= sessionsGoal
                      ? 'bg-gradient-to-r from-green-500 to-green-400 shadow-[0_0_8px_rgba(34,197,94,0.5)]'
                      : 'bg-gradient-to-r from-yellow-500 to-yellow-400 shadow-[0_0_8px_rgba(234,179,8,0.3)]'
                  }`}
                />
              </div>
            </div>

            {weeklyQuests.map((quest) => (
              <motion.div
                key={quest.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`flex items-center gap-4 p-4 rounded-lg border transition-all duration-300 ${
                  quest.status === 'completed'
                    ? 'bg-green-500/5 border-green-500/30'
                    : 'bg-shadow-700/50 border-white/10 hover:border-neon-blue/30'
                }`}
              >
                <button
                  className="w-6 h-6 rounded border-2 border-yellow-500/40 flex items-center justify-center"
                >
                  {quest.status === 'completed' && <CheckCircle2 className="w-4 h-4 text-yellow-400" />}
                </button>
                <span className={`font-display font-semibold flex-1 ${quest.status === 'completed' ? 'text-white/50 line-through' : 'text-white'}`}>{quest.name}</span>
                <span className="text-yellow-400 font-mono text-sm">+{quest.xpReward} XP</span>
              </motion.div>
            ))}

            {/* Penalty Warning */}
            {sessionsDone < sessionsGoal && (
              <div className="mt-3 flex items-center gap-2 text-red-400 text-xs">
                <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Missing weekly goal costs <strong>{(sessionsGoal - sessionsDone) * 50} XP</strong> penalty</span>
              </div>
            )}
          </GlassPanel>
        </motion.div>
      </div>
    </div>
  );
}
