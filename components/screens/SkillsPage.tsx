'use client';

import { motion } from 'framer-motion';
import { 
  Flame,
  Zap,
  Shield,
  Heart,
  Move,
  Dumbbell,
  Lock,
  HelpCircle
} from 'lucide-react';
import { GlassPanel } from '@/components/ui/CyberFrame';
import { useAppStore } from '@/store/useAppStore';
import { PILLAR_NAMES, type MovementPillar } from '@/types';

interface SkillNode {
  id: string;
  name: string;
  pillar: MovementPillar;
  level: number;
  maxLevel: number;
  description: string;
  unlocked: boolean;
  icon: React.ElementType;
}

function getProgressionName(pillar: MovementPillar, level: number): string {
  const p = pillar;
  if (p === 'push') {
    if (level < 10) return 'Wall Pushups';
    if (level < 20) return 'Knee Pushups';
    if (level < 30) return 'Standard Pushups';
    if (level < 50) return 'Diamond Pushups';
    if (level < 80) return 'One Arm Pushup';
    return 'Planche';
  }
  if (p === 'pull') {
    if (level < 10) return 'Dead Hang';
    if (level < 20) return 'Australian Pullups';
    if (level < 30) return 'Negative Pullups';
    if (level < 50) return 'Strict Pullups';
    if (level < 80) return 'Weighted Pullups';
    return 'Front Lever';
  }
  if (p === 'core') {
    if (level < 20) return 'Knee Plank';
    if (level < 40) return 'Plank';
    if (level < 60) return 'Leg Raises';
    if (level < 80) return 'L-Sit';
    return 'Human Flag';
  }
  if (p === 'legs') {
    if (level < 20) return 'Air Squats';
    if (level < 40) return 'Lunges';
    if (level < 60) return 'Jump Squats';
    if (level < 80) return 'Pistol Squats';
    return 'Weighted Pistols';
  }
  if (p === 'mobility') {
    if (level < 10) return 'Joint Circles';
    if (level < 20) return 'Dynamic Stretching';
    if (level < 30) return 'Basic Flow';
    if (level < 50) return 'Deep Squat Hold';
    if (level < 80) return 'Bridge Progression';
    return 'Full Contortion';
  }
  if (p === 'endurance') {
    if (level < 10) return 'Brisk Walking';
    if (level < 20) return 'Light Jogging';
    if (level < 30) return 'Steady State Run';
    if (level < 50) return 'HIIT Intervals';
    if (level < 80) return 'Sprint Repeats';
    return 'Ultra Endurance';
  }
  return 'Foundation';
}

const pillarColors: Record<MovementPillar, string> = {
  push: '#ef4444', // Red
  pull: '#eab308', // Yellow
  legs: '#3b82f6', // Blue
  core: '#8b5cf6', // Indigo/Purple
  endurance: '#ec4899', // Pink
  mobility: '#22c55e', // Green
};

interface SkillCardProps {
  skill: SkillNode;
}

function SkillCard({ skill }: SkillCardProps) {
  const Icon = skill.icon;
  const color = pillarColors[skill.pillar];
  const progress = (skill.level / skill.maxLevel) * 100;
  
  // Example: "Targeting Level 30" -> means "Unlocks at global pillar level 30"
  // Example: "Level 5/10" -> means "Mastery of this specific skill"

  return (
    <motion.div
      whileHover={{ scale: skill.unlocked ? 1.02 : 1 }}
      className={`
        group relative p-4 rounded-lg border transition-all duration-300
        ${skill.unlocked 
          ? 'bg-shadow-700/50 border-white/10 hover:border-neon-blue/30 cursor-pointer'
          : 'bg-shadow-800/50 border-white/5 opacity-50'
        }
      `}
    >
      {!skill.unlocked && (
        <div className="absolute top-2 right-2 flex gap-2">
            <Lock className="w-4 h-4 text-white/30" />
        </div>
      )}

       {/* Help Tooltip */}
       <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="relative group/tooltip">
                <HelpCircle className="w-4 h-4 text-white/20 hover:text-white/60" />
                <div className="absolute right-0 top-6 w-48 bg-black/90 border border-white/10 p-2 rounded text-[10px] text-white/70 z-50 pointer-events-none opacity-0 group-hover/tooltip:opacity-100 transition-opacity">
                    {skill.unlocked 
                        ? "Mastery Level represents your proficiency in this specific movement."
                        : `This skill unlocks when your ${skill.pillar.toUpperCase()} pillar reaches the required level.`
                    }
                </div>
            </div>
      </div>
      
      <div className="flex items-start gap-3">
        <div 
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ background: `${color}20`, border: `1px solid ${color}40` }}
        >
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1 pr-6">
            <span className="font-display font-semibold text-white">{skill.name}</span>
          </div>
          
          <div className="flex items-center justify-between text-xs mb-2">
             <span className="text-white/40">{skill.description}</span>
             <span className="font-mono text-neon-blue">
                {skill.unlocked ? `Mastery: ${skill.level}/${skill.maxLevel}` : 'LOCKED'}
             </span>
          </div>
          
          {/* Progress bar */}
          <div className="h-1.5 bg-black/30 rounded-full overflow-hidden border border-white/10">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
              className="h-full rounded-full"
              style={{ background: color }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function SkillsPage() {
  const user = useAppStore((state) => state.user);
  const movementProgress = useAppStore((state) => state.movementProgress);

  const pillars: MovementPillar[] = ['push', 'pull', 'core', 'legs', 'mobility', 'endurance'];
  
  // Generate skills dynamically based on user progress
  const skillsByPillar = pillars.reduce((acc, pillar) => {
    const progress = movementProgress[pillar];
    
    const icons: Record<MovementPillar, any> = {
        push: Flame,
        pull: Zap,
        legs: Dumbbell,
        core: Shield,
        endurance: Heart,
        mobility: Move
    };

    // Create a "Current Focus" node
    const focusNode: SkillNode = {
      id: `${pillar}-focus`,
      name: getProgressionName(pillar, progress.level),
      pillar,
      level: progress.level % 10, // Visual level within the tier
      maxLevel: 10,
      description: `Targeting Level ${Math.ceil(progress.level / 10) * 10}`,
      unlocked: true,
      icon: icons[pillar],
    };

    // Create a "Next Unlock" node (Locked)
    const nextNode: SkillNode = {
      id: `${pillar}-next`,
      name: getProgressionName(pillar, progress.level + 10),
      pillar,
      level: 0,
      maxLevel: 10,
      description: 'LOCKED - Reach next proficiency tier',
      unlocked: false,
      icon: Lock,
    };

    acc[pillar] = [focusNode, nextNode];
    return acc;
  }, {} as Record<MovementPillar, SkillNode[]>);

  const skillNodes = Object.values(skillsByPillar).flat();

  return (
    <div className="pt-24 pb-8 px-4 max-w-7xl mx-auto">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-display text-3xl font-bold text-white mb-2"
      >
        Skill Tree
      </motion.h1>
      <p className="text-white/50 mb-8">
        Develop your abilities across 6 movement pillars
      </p>

      {/* Pillar XP Overview */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {pillars.map((pillar) => {
           const Icon = {
                push: Flame,
                pull: Zap,
                legs: Dumbbell,
                core: Shield,
                endurance: Heart,
                mobility: Move
            }[pillar];
            
          return (
          <GlassPanel key={pillar} className="p-4">
            <div className="text-center">
              <div 
                className="w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center"
                style={{ background: `${pillarColors[pillar]}20` }}
              >
                <Icon className="w-4 h-4" style={{ color: pillarColors[pillar] }} />
              </div>
              <div className="font-display text-xs uppercase tracking-wider text-white/60 mb-1">
                {PILLAR_NAMES[pillar]}
              </div>
              <div className="font-mono text-sm" style={{ color: pillarColors[pillar] }}>
                Lv. {movementProgress[pillar]?.level || 1}
              </div>
            </div>
          </GlassPanel>
          );
        })}
      </div>

      {/* Skills Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {skillNodes.map((skill) => (
          <SkillCard key={skill.id} skill={skill} />
        ))}
      </div>
    </div>
  );
}
