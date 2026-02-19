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
  Dumbbell
} from 'lucide-react';
import { GlassPanel } from '@/components/ui/CyberFrame';
import { RankBadge } from '@/components/ui/RankBadge';
import { StatCard, XPBar, CircularProgress } from '@/components/ui/StatDisplay';
import { useAppStore } from '@/store/useAppStore';

export function Dashboard() {
  const user = useAppStore((state) => state.user);
  const dailyQuests = useAppStore((state) => state.dailyQuests);
  const weeklyQuests = useAppStore((state) => state.weeklyQuests);
  const completeQuest = useAppStore((state) => state.completeQuest);

  if (!user) return null;

  const completedDaily = dailyQuests.filter((q) => q.status === 'completed').length;
  const totalDaily = dailyQuests.length;

  return (
    <div className="pt-24 pb-8 px-4 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Profile */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <GlassPanel className="p-6">
            {/* Avatar & Name */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-shadow-600 border border-white/10 flex items-center justify-center">
                <User className="w-8 h-8 text-white/60" />
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
            <div className="text-center mb-6">
              <span className="text-white/60 font-display text-sm uppercase tracking-wider">Level</span>
              <div className="level-display">LV.{user.level}</div>
            </div>

            {/* XP Bar */}
            <div className="mb-6">
              <XPBar current={user.exp} max={user.expToNextLevel} level={user.level} />
            </div>

            {/* Stats Grid (Standardized Pillars) */}
            <div className="grid grid-cols-2 gap-3">
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
          <GlassPanel className="p-6">
            <div className="flex items-center justify-between mb-4">
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
          <GlassPanel className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Crown className="w-5 h-5 text-yellow-400" />
              <h3 className="font-display text-lg uppercase tracking-wider text-white">Weekly Quest</h3>
            </div>

            {weeklyQuests.map((quest) => (
              <motion.div
                key={quest.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`flex items-center gap-4 p-4 rounded-lg border transition-all duration-300 bg-shadow-700/50 border-white/10 hover:border-neon-blue/30`}
              >
                <button
                  className="w-6 h-6 rounded border-2 border-yellow-500/40 flex items-center justify-center"
                >
                  {quest.status === 'completed' && <CheckCircle2 className="w-4 h-4 text-yellow-400" />}
                </button>
                <span className="font-display font-semibold text-white flex-1">{quest.name}</span>
                <span className="text-yellow-400 font-mono text-sm">+{quest.xpReward} XP</span>
              </motion.div>
            ))}
          </GlassPanel>
        </motion.div>
      </div>
    </div>
  );
}
