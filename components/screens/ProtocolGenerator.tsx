'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle2, Scroll, Crown, ArrowRight } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import type { Quest, MovementPillar, SkillDefinition } from '@/types';
import { SKILL_DEFINITIONS } from '@/lib/skillDefinitions';
import { sanitizeText } from '@/lib/textSanitizer';
import { getGymSkillDefinitionsByPillar } from '@/lib/gymSkillVariants';
import { getInvisibleSkillHowTo } from '@/lib/skillHowTo';

const mapPillarToStat = (pillar?: string) => {
  switch (pillar) {
    case 'pull':
      return 'pull' as const;
    case 'legs':
      return 'legs' as const;
    case 'core':
      return 'core' as const;
    case 'endurance':
      return 'endurance' as const;
    case 'mobility':
      return 'mobility' as const;
    default:
      return 'push' as const;
  }
};

const PILLARS: MovementPillar[] = ['push', 'pull', 'legs', 'core', 'mobility', 'endurance'];

const normalizeText = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const isMovementPillar = (value: unknown): value is MovementPillar =>
  typeof value === 'string' && PILLARS.includes(value as MovementPillar);

const resolveDailyQuestCount = (availableTime?: number) => {
  const time = Number(availableTime) || 45;
  if (time <= 20) return 2;
  if (time <= 35) return 3;
  if (time <= 50) return 4;
  if (time <= 70) return 5;
  return 6;
};

const resolveSetCount = (availableTime?: number, trainingFrequency?: number) => {
  const time = Number(availableTime) || 45;
  const freq = Number(trainingFrequency) || 3;
  let sets = time >= 60 ? 4 : time <= 20 ? 2 : 3;
  if (freq <= 3) sets += 1;
  if (freq >= 6) sets -= 1;
  return Math.max(2, Math.min(5, sets));
};

const defaultRepsByPillar = (pillar: MovementPillar) => {
  switch (pillar) {
    case 'core':
      return '30-45s';
    case 'mobility':
      return '8-12 reps';
    case 'endurance':
      return '8-15 min';
    default:
      return '8-12 reps';
  }
};

const defaultExecutionGuide = (exerciseName: string, pillar: MovementPillar, skillId?: string) =>
  getInvisibleSkillHowTo({ skillId, exerciseName, pillar });

const buildSkillDefinitionLookup = () => {
  const lookup: Record<string, SkillDefinition> = {};
  for (const pillar of PILLARS) {
    const levels = SKILL_DEFINITIONS[pillar] || {};
    for (const level of Object.keys(levels)) {
      const skillDefs = levels[Number(level)] || [];
      for (const skillDef of skillDefs) {
        lookup[skillDef.id] = skillDef;
      }
    }
  }
  return lookup;
};

const SKILL_LOOKUP = buildSkillDefinitionLookup();

const buildUnlockedSkillsByPillar = (
  user: any,
  options?: { hasGymAccess?: boolean | null; availableEquipment?: string[] }
): Record<MovementPillar, SkillDefinition[]> => {
  const byPillar: Record<MovementPillar, SkillDefinition[]> = {
    push: [],
    pull: [],
    legs: [],
    core: [],
    mobility: [],
    endurance: [],
  };
  const skillConstraints = (user?.skillConstraints || {}) as Record<
    string,
    { status?: string; reason?: string; tags?: string[]; condition?: string }
  >;
  const isDisabled = (skillId: string) => skillConstraints?.[skillId]?.status === 'disabled';
  const customSkillsByPillar = (user?.customSkills || {}) as Partial<
    Record<MovementPillar, SkillDefinition[]>
  >;
  const findCustomSkillById = (skillId: string) => {
    for (const pillar of PILLARS) {
      const found = (customSkillsByPillar[pillar] || []).find((skill) => skill.id === skillId);
      if (found) return found;
    }
    return undefined;
  };

  const unlockedIds = Object.entries(user?.userSkills || {})
    .filter(([, skill]: [string, any]) => skill?.unlocked)
    .map(([skillId]) => skillId);

  for (const skillId of unlockedIds) {
    const skillDef = SKILL_LOOKUP[skillId] || findCustomSkillById(skillId);
    if (skillDef) {
      byPillar[skillDef.pillar].push(skillDef);
    }
  }

  for (const pillar of PILLARS) {
    const pillarLevel = Math.max(0, Math.min(4, user?.pillarLevels?.[pillar]?.level ?? 0));
    const currentLevelDefs = (SKILL_DEFINITIONS[pillar]?.[pillarLevel] || []).slice(0, 5);
    const customForPillar = (customSkillsByPillar[pillar] || []).filter((skill) => {
      const level = Number(skill?.level);
      if (!Number.isFinite(level)) return true;
      return level <= pillarLevel;
    });
    const unlockedForPillar = byPillar[pillar];

    if (unlockedForPillar.length === 0) {
      const fallback =
        currentLevelDefs.length > 0
          ? currentLevelDefs
          : (SKILL_DEFINITIONS[pillar]?.[0] || []).slice(0, 5);
      byPillar[pillar] = [...fallback, ...customForPillar];
      continue;
    }

    const hasCurrentLevelSkill = unlockedForPillar.some((skill) => skill.level >= pillarLevel);
    if (!hasCurrentLevelSkill) {
      byPillar[pillar] = [...unlockedForPillar, ...currentLevelDefs, ...customForPillar];
    } else if (customForPillar.length > 0) {
      byPillar[pillar] = [...unlockedForPillar, ...customForPillar];
    }
  }

  const gymSkillsByPillar = getGymSkillDefinitionsByPillar({
    hasGymAccess: options?.hasGymAccess,
    availableEquipment: options?.availableEquipment,
    pillarLevels: user?.pillarLevels,
  });
  for (const pillar of PILLARS) {
    const byId = new Map<string, SkillDefinition>();
    for (const skill of byPillar[pillar]) {
      if (!skill?.id || isDisabled(skill.id)) continue;
      byId.set(skill.id, skill);
    }
    const merged = [
      ...Array.from(byId.values()),
      ...(gymSkillsByPillar[pillar] || []).filter((skill) => !isDisabled(skill.id)),
    ];
    const dedup = new Map<string, SkillDefinition>();
    for (const skill of merged) {
      dedup.set(normalizeText(skill.name), skill);
    }
    byPillar[pillar] = Array.from(dedup.values());
  }

  return byPillar;
};

const pickSkillForPillar = (
  byPillar: Record<MovementPillar, SkillDefinition[]>,
  pillar: MovementPillar,
  index: number
) => {
  const list = byPillar[pillar];
  if (!list || list.length === 0) return undefined;
  return list[index % list.length];
};

const normalizeDifficulty = (value: unknown): 'easy' | 'medium' | 'hard' => {
  if (value === 'easy' || value === 'medium' || value === 'hard') return value;
  return 'medium';
};

const normalizeReps = (value: unknown, pillar: MovementPillar) => {
  if (typeof value === 'string' && value.trim()) return value.trim();
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return defaultRepsByPillar(pillar);
};

const normalizeSets = (value: unknown, user: any) => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.max(1, Math.min(8, Math.floor(value)));
  }
  return resolveSetCount(user?.availableTime, user?.trainingFrequency);
};

// AI Generation Logic
const generateProtocol = async (
  user: any,
  history: any[],
  options: {
    apiKey: string | null;
    availableEquipment: string[];
    equipmentCatalog: any[];
    trainingHistory: any[];
    trainingLogs: any[];
  }
) => {
  const targetDailyCount = resolveDailyQuestCount(user?.availableTime);
  const unlockedSkillsByPillar = buildUnlockedSkillsByPillar(user, {
    hasGymAccess: user?.hasGymAccess,
    availableEquipment: options.availableEquipment,
  });
  const activePillars = PILLARS.filter((pillar) => unlockedSkillsByPillar[pillar].length > 0);
  const effectivePillars = activePillars.length > 0 ? activePillars : PILLARS;
  const allowedSkillsForPrompt = effectivePillars.map((pillar) => ({
    pillar,
    skills: unlockedSkillsByPillar[pillar].map((skill) => ({
      id: skill.id,
      name: skill.name,
      tags: skill.tags || [],
      reason: skill.clinicalReason || '',
    })),
  }));
  const disabledSkillsForPrompt = Object.entries(user?.skillConstraints || {})
    .filter(([, constraint]: [string, any]) => constraint?.status === 'disabled')
    .map(([skillId, constraint]: [string, any]) => ({
      skillId,
      reason: constraint?.reason || '',
      condition: constraint?.condition || '',
      tags: Array.isArray(constraint?.tags) ? constraint.tags : [],
    }));

  if (!options.apiKey) {
    console.warn('No API key, using fallback');
    return fallbackQuests(user);
  }

  try {
    // Filter history to last 10 days to avoid repeated sessions
    const recentHistory = history
      .filter((h) => new Date(h.completedAt).getTime() > Date.now() - 10 * 24 * 60 * 60 * 1000)
      .map((h) => ({ name: h.name, pillar: h.pillar, difficulty: h.difficulty, completedAt: h.completedAt }));

    const recentTrainingDays = options.trainingHistory
      .filter((entry: any) => new Date(entry.date).getTime() > Date.now() - 10 * 24 * 60 * 60 * 1000)
      .slice(-10)
      .map((entry: any) => ({
        date: entry.date,
        completed: entry.completed,
        questsCompleted: entry.questsCompleted,
        expGained: entry.expGained,
      }));

    const recentTrainingLogs = options.trainingLogs
      .slice(-20)
      .map((entry: any) => ({
        text: entry.text,
        timestamp: entry.timestamp,
        adjustment: entry.recommendedAdjustment,
      }));

    const response = await fetch('/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apiKey: options.apiKey,
        intent: 'generate_quests',
        context: {
          userStats: user.stats,
          fitnessLevel: user.fitnessLevel,
          availableTime: user.availableTime,
          trainingFrequency: user.trainingFrequency,
          debuffs: user.debuffs,
          bio: user.bioData ?? user.bio ?? '',
          hasGymAccess: user.hasGymAccess,
          availableEquipment: options.availableEquipment,
          equipmentCatalog: options.equipmentCatalog,
          recentHistory,
          recentTrainingDays,
          recentTrainingLogs,
        },
        prompt: `Generate a personalized workout protocol based on current skill pool, current pillar levels, and training history.

USER'S CURRENT SKILL POOL: ${JSON.stringify(
  allowedSkillsForPrompt
)}
DISABLED SKILLS (DO NOT PRESCRIBE): ${JSON.stringify(disabledSkillsForPrompt)}
PILLAR LEVELS: ${JSON.stringify(user.pillarLevels)}
ENABLED TRAINING EQUIPMENT: ${
  options.availableEquipment.length ? options.availableEquipment.join(', ') : 'Bodyweight only'
}
AVAILABLE TIME: ${Number(user.availableTime) || 45} minutes
TRAINING FREQUENCY: ${Number(user.trainingFrequency) || 3} sessions per week

RULES:
- Respect available equipment. Do not prescribe exercises requiring unavailable equipment.
- If no equipment is informed, default to bodyweight alternatives.
- Use only exercise names from USER'S CURRENT SKILL POOL.
- Never use skills listed in DISABLED SKILLS.
- Return EXACTLY ${targetDailyCount} daily quests and exactly 1 weekly quest.
- Every quest must contain executionGuide with clear technical instructions.
- Vary sessions from recent history.
- Avoid repeating the same main exercise names used in the last 10 days whenever alternatives exist.
- Respect all debuffs/limitations.
- Match volume to available time (${user.availableTime} min).
- Keep frequency aligned with ${user.trainingFrequency || 3}x/week.`,
      }),
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error);

    const result = JSON.parse(data.response);
    if (!Array.isArray(result.daily) || !Array.isArray(result.weekly)) {
      throw new Error('Invalid quest payload from AI');
    }

    const aiDaily = result.daily as any[];
    const recentNameSet = new Set(
      recentHistory.map((entry) => normalizeText(sanitizeText(String(entry?.name || '')))).filter(Boolean)
    );
    const selectedNameSet = new Set<string>();
    const normalizedDaily: Quest[] = Array.from({ length: targetDailyCount }).map((_, i) => {
      const aiQuest = aiDaily[i] || {};
      const pillar: MovementPillar = isMovementPillar(aiQuest.pillar)
        ? aiQuest.pillar
        : effectivePillars[i % effectivePillars.length];
      const allowedSkills = unlockedSkillsByPillar[pillar];
      const normalizedAiName = normalizeText(sanitizeText(String(aiQuest.name || '')));
      const matchedSkill = allowedSkills.find((skill) =>
        normalizeText(skill.name) === normalizedAiName ||
        normalizeText(skill.name).includes(normalizedAiName) ||
        normalizedAiName.includes(normalizeText(skill.name))
      );
      const allowedUnique = allowedSkills.filter((skill) => {
        const key = normalizeText(skill.name);
        return key && !recentNameSet.has(key) && !selectedNameSet.has(key);
      });
      const allowedWithoutSameRun = allowedSkills.filter((skill) => {
        const key = normalizeText(skill.name);
        return key && !selectedNameSet.has(key);
      });
      const skillPool =
        allowedUnique.length > 0
          ? allowedUnique
          : allowedWithoutSameRun.length > 0
          ? allowedWithoutSameRun
          : allowedSkills;
      const matchedSkillIsAllowed =
        matchedSkill &&
        !recentNameSet.has(normalizeText(matchedSkill.name)) &&
        !selectedNameSet.has(normalizeText(matchedSkill.name));
      const selectedSkill =
        (matchedSkillIsAllowed ? matchedSkill : undefined) ||
        skillPool[i % Math.max(1, skillPool.length)] ||
        pickSkillForPillar(unlockedSkillsByPillar, pillar, i);
      const selectedName = sanitizeText(
        selectedSkill?.name || String(aiQuest.name || `${pillar.toUpperCase()} Training`)
      );
      const selectedNameKey = normalizeText(selectedName);
      if (selectedNameKey) selectedNameSet.add(selectedNameKey);
      const invisibleHowTo = defaultExecutionGuide(selectedName, pillar, selectedSkill?.id);

      return {
        id: `daily-${Date.now()}-${i}`,
        type: 'daily',
        status: 'pending',
        pillar,
        name: selectedName,
        description:
          typeof aiQuest.description === 'string' && aiQuest.description.trim()
            ? sanitizeText(aiQuest.description.trim())
            : `Progressive work focused on ${pillar}.`,
        executionGuide: invisibleHowTo,
        skillId: selectedSkill?.id,
        skillLevel: selectedSkill?.level,
        skillTags: Array.isArray(selectedSkill?.tags) ? selectedSkill.tags : undefined,
        skillReason:
          typeof selectedSkill?.clinicalReason === 'string' && selectedSkill.clinicalReason.trim()
            ? selectedSkill.clinicalReason.trim()
            : undefined,
        sets: normalizeSets(aiQuest.sets, user),
        reps: normalizeReps(aiQuest.reps, pillar),
        xpReward:
          typeof aiQuest.xpReward === 'number' && Number.isFinite(aiQuest.xpReward)
            ? Math.max(18, Math.min(40, Math.floor(aiQuest.xpReward)))
            : 24,
        difficulty: normalizeDifficulty(aiQuest.difficulty),
        statBoost: aiQuest.statBoost || { stat: mapPillarToStat(pillar), amount: 1 },
      };
    });

    const weeklySessions = Math.max(2, Math.min(7, Number(user?.trainingFrequency) || 3));
    const aiWeekly = (result.weekly as any[])[0] || {};
    const weeklyPillar = isMovementPillar(aiWeekly.pillar)
      ? aiWeekly.pillar
      : effectivePillars[0] || 'core';
    const normalizedWeekly: Quest[] = [
      {
        id: `weekly-${Date.now()}-0`,
        type: 'weekly',
        status: 'pending',
        pillar: weeklyPillar,
        name:
          typeof aiWeekly.name === 'string' && aiWeekly.name.trim()
            ? sanitizeText(aiWeekly.name.trim())
            : 'Weekly Consistency Protocol',
        description:
          typeof aiWeekly.description === 'string' && aiWeekly.description.trim()
            ? sanitizeText(aiWeekly.description.trim())
            : `Complete ${weeklySessions} training sessions this week.`,
        executionGuide:
          typeof aiWeekly.executionGuide === 'string' && aiWeekly.executionGuide.trim()
            ? sanitizeText(aiWeekly.executionGuide.trim())
            : `Spread ${weeklySessions} sessions during the week and keep form quality on every quest.`,
        sets: weeklySessions,
        reps:
          typeof aiWeekly.reps === 'string' && aiWeekly.reps.trim()
            ? aiWeekly.reps.trim()
            : `${weeklySessions} sessions`,
        xpReward:
          typeof aiWeekly.xpReward === 'number' && Number.isFinite(aiWeekly.xpReward)
            ? Math.max(110, Math.min(220, Math.floor(aiWeekly.xpReward)))
            : 140,
        difficulty: normalizeDifficulty(aiWeekly.difficulty),
      },
    ];

    return {
      daily: normalizedDaily,
      weekly: normalizedWeekly,
    };
  } catch (error) {
    console.error('AI generation failed:', error);
    return fallbackQuests(user);
  }
};

const fallbackQuests = (user?: any): { daily: Quest[]; weekly: Quest[] } => {
  const count = resolveDailyQuestCount(user?.availableTime);
  const unlockedByPillar = buildUnlockedSkillsByPillar(user, {
    hasGymAccess: user?.hasGymAccess,
    availableEquipment: user?.availableEquipment || [],
  });
  const activePillars = PILLARS.filter((pillar) => unlockedByPillar[pillar].length > 0);
  const effectivePillars = activePillars.length > 0 ? activePillars : PILLARS;

  const daily: Quest[] = Array.from({ length: count }).map((_, i) => {
    const pillar = effectivePillars[i % effectivePillars.length];
    const skill = pickSkillForPillar(unlockedByPillar, pillar, i);
    const name = skill?.name || `${pillar.toUpperCase()} Skill Quest`;
    return {
      id: `daily-local-${Date.now()}-${i}`,
      name,
      description: `Skill-based progression for ${pillar}.`,
      executionGuide: defaultExecutionGuide(name, pillar, skill?.id),
      skillId: skill?.id,
      skillLevel: skill?.level,
      skillTags: Array.isArray(skill?.tags) ? skill.tags : undefined,
      skillReason:
        typeof skill?.clinicalReason === 'string' && skill.clinicalReason.trim()
          ? skill.clinicalReason.trim()
          : undefined,
      type: 'daily',
      pillar,
      sets: resolveSetCount(user?.availableTime, user?.trainingFrequency),
      reps: defaultRepsByPillar(pillar),
      xpReward: 24,
      statBoost: { stat: mapPillarToStat(pillar), amount: 1 },
      difficulty: 'medium',
      status: 'pending',
    };
  });

  const weeklySessions = Math.max(2, Math.min(7, Number(user?.trainingFrequency) || 3));
  const weekly: Quest[] = [
    {
      id: `weekly-local-${Date.now()}`,
      name: 'Weekly Consistency Protocol',
      description: `Complete ${weeklySessions} sessions this week.`,
      executionGuide: `Distribute ${weeklySessions} sessions in the week and complete all daily quests with good form.`,
      type: 'weekly',
      pillar: effectivePillars[0] || 'core',
      sets: weeklySessions,
      reps: `${weeklySessions} sessions`,
      xpReward: 140,
      difficulty: 'hard',
      status: 'pending',
    },
  ];

  return { daily, weekly };
};

export function ProtocolGenerator() {
  const [phase, setPhase] = useState<'analyzing' | 'generated'>('analyzing');
  const [loadingText, setLoadingText] = useState('Generating personalized protocol...');
  const user = useAppStore((state) => state.user);
  const geminiApiKey = useAppStore((state) => state.geminiApiKey);
  const availableEquipment = useAppStore((state) => state.availableEquipment);
  const equipmentCatalog = useAppStore((state) => state.equipment);
  const trainingHistory = useAppStore((state) => state.trainingHistory);
  const trainingLogs = useAppStore((state) => state.trainingLogs);
  const setQuests = useAppStore((state) => state.setQuests);
  const setScreen = useAppStore((state) => state.setScreen);
  const questHistory = useAppStore((state) => state.questHistory);
  const dailyQuests = useAppStore((state) => state.dailyQuests);
  const weeklyQuests = useAppStore((state) => state.weeklyQuests);

  useEffect(() => {
    // Cycle loading messages
    const messages = [
      'Generating personalized protocol...',
      'Analyzing physical parameters...',
      'Calculating optimal training volume...',
      'Calibrating difficulty levels...',
      'Finalizing quest parameters...',
    ];
    let index = 0;
    
    const messageTimer = setInterval(() => {
      index = (index + 1) % messages.length;
      setLoadingText(messages[index]);
    }, 1500);

    // AI Analysis Execution
    const runAnalysis = async () => {
        if (!user) return;
        const enabledEquipment = equipmentCatalog
          .filter((item) => item.enabledForAI !== false)
          .map((item) => item.name)
          .filter(Boolean);
        const { daily, weekly } = await generateProtocol(user, questHistory || [], {
          apiKey: geminiApiKey,
          availableEquipment:
            enabledEquipment.length > 0
              ? enabledEquipment
              : availableEquipment.length > 0
              ? availableEquipment
              : user.availableEquipment || [],
          equipmentCatalog,
          trainingHistory,
          trainingLogs,
        });
        setQuests(daily, weekly);
        setPhase('generated');
    };

    const analysisTimer = setTimeout(() => {
        runAnalysis();
    }, 3000); // 3 seconds delay for effect


    return () => {
      clearInterval(messageTimer);
      clearTimeout(analysisTimer);
    };
  }, [
    setQuests,
    user,
    questHistory,
    geminiApiKey,
    availableEquipment,
    equipmentCatalog,
    trainingHistory,
    trainingLogs,
  ]);

  const handleBeginTraining = () => {
    setScreen('dashboard');
  };

  // Analyzing phase
  if (phase === 'analyzing') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
        {/* Header Panel */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="notification-popup mb-12 px-8 py-4"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 border-2 border-white/60 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-white/80" />
            </div>
            <h2 className="font-display text-lg md:text-xl tracking-wider text-white font-bold">
              ASSESSMENT
            </h2>
          </div>
        </motion.div>

        {/* User Info */}
        {user && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-2"
          >
            <span className="text-neon-cyan font-display">User: </span>
            <span className="text-white font-body">{user.name}</span>
            <span className="text-white/40 mx-3">|</span>
            <span className="text-neon-cyan font-display">Rank: </span>
            <span className="text-rank-d font-display font-bold">{user.rank}</span>
          </motion.div>
        )}

        {/* System Message */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center mb-12"
        >
          <span className="text-yellow-500 font-mono">[SYSTEM]</span>
          <span className="text-white/80 ml-2">
            Analyzing{' '}
            <span className="gradient-text font-semibold">physical parameters</span>
            {' '}for optimal
          </span>
          <br />
          <span className="gradient-text font-semibold">training protocol</span>
          <span className="text-white/80">...</span>
        </motion.p>

        {/* Loading Ring */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="relative mb-10"
        >
          <div className="loading-ring" />
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              className="w-3 h-3 bg-neon-cyan rounded-full"
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </div>
        </motion.div>

        {/* Status Text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center"
        >
          <p className="text-white/50 uppercase tracking-[0.2em] text-sm font-display mb-2">
            ANALYZING DATA...
          </p>
          <motion.p
            key={loadingText}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-white/40 text-sm font-body"
          >
            {loadingText}
          </motion.p>
        </motion.div>
      </div>
    );
  }

  // Generated phase - show quests
  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="notification-popup w-full max-w-3xl relative"
      >
        {/* Corner accents */}
        <div className="absolute -top-1 -left-1 w-6 h-6 border-l-2 border-t-2 border-neon-cyan" />
        <div className="absolute -top-1 -right-1 w-6 h-6 border-r-2 border-t-2 border-neon-cyan" />
        <div className="absolute -bottom-1 -left-1 w-6 h-6 border-l-2 border-b-2 border-neon-cyan" />
        <div className="absolute -bottom-1 -right-1 w-6 h-6 border-r-2 border-b-2 border-neon-cyan" />

        <div className="p-8 md:p-12">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-4 mb-6"
          >
            <div className="w-10 h-10 border-2 border-white/60 rounded flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-success-green" />
            </div>
            <h2 className="font-display text-lg md:text-xl tracking-wider text-white font-bold">
              PROTOCOL GENERATED
            </h2>
          </motion.div>

          {/* System Message */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-8"
          >
            <span className="text-yellow-500 font-mono">[SYSTEM]</span>
            <span className="text-white/80 ml-2">
              Your personalized training quests have been created!
            </span>
          </motion.div>

          {/* Daily Quests */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Scroll className="w-5 h-5 text-neon-blue" />
              <span className="font-display text-sm uppercase tracking-wider text-white/80">
                Daily Quests
              </span>
            </div>
            <div className="space-y-2">
              {dailyQuests.map((quest, index) => (
                <motion.div
                  key={quest.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="quest-item px-4 py-3 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <Scroll className="w-4 h-4 text-neon-blue/60" />
                    <span className="text-white/90 font-body">{quest.name}</span>
                  </div>
                  <span className="text-gold font-mono text-sm">+{quest.xpReward} XP</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Weekly Quest */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <Crown className="w-5 h-5 text-gold" />
              <span className="font-display text-sm uppercase tracking-wider text-white/80">
                Weekly Quest
              </span>
            </div>
            <div className="space-y-2">
              {weeklyQuests.map((quest, index) => (
                <motion.div
                  key={quest.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="quest-item px-4 py-3 flex items-center justify-between"
                  style={{ borderLeftColor: '#ffd700' }}
                >
                  <div className="flex items-center gap-3">
                    <Crown className="w-4 h-4 text-gold/60" />
                    <span className="text-white/90 font-body">{quest.name}</span>
                  </div>
                  <span className="text-gold font-mono text-sm">+{quest.xpReward} XP</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Begin Training Button */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            onClick={handleBeginTraining}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-4 font-display text-sm tracking-wider border-2 border-neon-cyan/60 text-neon-cyan bg-gradient-to-b from-neon-cyan/20 to-transparent hover:border-neon-cyan hover:shadow-[0_0_20px_rgba(0,245,255,0.3)] transition-all flex items-center justify-center gap-2"
          >
            BEGIN TRAINING
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
