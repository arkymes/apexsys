import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { 
  UserProfile, 
  Quest, 
  Equipment, 
  TrainingDay, 
  AppScreen,
  Rank,
  Objective,
  FitnessLevel,
  MovementPillar,
  PillarLevel,
  CheckInEntry,
  RecoveryStatus,
  AthleteTier,
  TrainingLogEntry,
  UserSkill,
  SkillDefinition,
  SkillConstraint
} from '@/types';
import { ATHLETE_TIER_THRESHOLDS, BASE_PILLAR_LEVELS, PILLAR_NAMES, EXERCISE_XP_BY_LEVEL } from '@/types';
import { SKILL_DEFINITIONS } from '@/lib/skillDefinitions';
import { sanitizeText } from '@/lib/textSanitizer';
import { buildEquipmentCatalogFromNames, normalizeEquipmentCatalog, translateEquipmentName, COMMON_GYM_EQUIPMENT, inferEquipmentCategory } from '@/lib/equipmentCatalog';
import { getGymSkillDefinitionsByPillar } from '@/lib/gymSkillVariants';
import { getInvisibleSkillHowTo } from '@/lib/skillHowTo';
import { recordApiCall } from '@/lib/engineUsageTracker';
import { getExercisesForQuestSync, getExerciseByIdSync, isExercisesLoaded } from '@/lib/exerciseService';

interface AppState {
  // App State
  currentScreen: AppScreen;
  isLoading: boolean;
  particlesEnabled: boolean;
  soundEnabled: boolean;
  notificationsEnabled: boolean;

  // Access / integration
  geminiApiKey: string | null;
  hasGymAccess: boolean | null;
  lastCheckIn?: CheckInEntry;
  recoveryStatus: RecoveryStatus;

  // Movement progression (PMF pillars)
  pillarLevels: Record<MovementPillar, PillarLevel>;
  athleteTier: AthleteTier;

  // Logs
  trainingLogs: TrainingLogEntry[];

  // User Profile
  user: UserProfile | null;

  // Quests
  dailyQuests: Quest[];
  weeklyQuests: Quest[];
  questHistory: Quest[]; // Completed quests history for AI context

  // Equipment
  equipment: Equipment[];
  availableEquipment: string[];

  // Training History
  trainingHistory: TrainingDay[];
  dailyQuestDateKey?: string; // YYYY-MM-DD
  lastWeeklyPenaltyCheck?: string; // ISO week key e.g. "2026-W15"

  // Actions: access
  setGeminiApiKey: (key: string) => void;
  setGymAccess: (hasAccess: boolean) => void;
  setAvailableEquipment: (items: string[]) => void;
  setEquipmentCatalog: (items: Equipment[]) => void;
  logCheckIn: (entry: CheckInEntry) => void;
  logTrainingEntry: (text: string) => Promise<TrainingLogEntry | undefined>;

  // Actions
  setScreen: (screen: AppScreen) => void;
  setLoading: (loading: boolean) => void;
  toggleParticles: () => void;
  toggleSound: () => void;
  toggleNotifications: () => void;

  // User Actions
  initializeUser: (data: {
    name: string;
    rank: Rank;
    height: number;
    weight: number;
    age: number;
    objective: Objective;
    fitnessLevel: FitnessLevel;
    hasGymAccess?: boolean;
    geminiApiKey?: string;
    stats?: UserProfile['stats'];
    radarStats?: UserProfile['radarStats'];
    pillarLevels?: Record<MovementPillar, PillarLevel>;
    userSkills?: Record<string, UserSkill>;
    customSkills?: Partial<Record<MovementPillar, SkillDefinition[]>>;
    skillConstraints?: Record<string, SkillConstraint>;
    bioData?: string;
    availableEquipment?: string[];
    equipmentCatalog?: Equipment[];
    availableTime?: number;
    trainingFrequency?: number;
    debuffs?: any[];
}) => void;
  addExp: (amount: number) => void;
  addMovementXP: (pillar: MovementPillar, amount: number) => void;
  updateStat: (stat: keyof UserProfile['stats'], amount: number) => void;
  levelUp: () => void;

  // Quest Actions
  setQuests: (daily: Quest[], weekly: Quest[]) => void;
  generatePMFQuests: (options: {
    priorityPillars?: MovementPillar[];
    painAreas?: string[];
    hasGymAccess?: boolean;
  }) => void;
  completeQuest: (questId: string) => void;
  failQuest: (questId: string) => void;
  addSkillXP: (skillId: string, xpAmount: number) => void;
  unlockSkill: (skillId: string) => void;
  attemptLevelUp: (pillar: MovementPillar, success: boolean) => void;

  // Equipment Actions
  equipItem: (itemId: string) => void;
  unequipItem: (itemId: string) => void;
  syncEquipmentFromExercises: (exerciseEquipmentTypes: string[]) => void;

  // Training Actions
  recordTrainingDay: (day: TrainingDay) => void;
  setTrainingFrequency: (freq: number) => void;
  checkWeeklyPenalty: () => { penaltyApplied: boolean; xpLost: number; sessionsDone: number; sessionsGoal: number } | null;
  runQuestMaintenance: () => { failedDailyCount: number; weeklyPenaltyApplied: boolean };

  // Reset
  resetApp: () => void;
}

const initialUserStats = {
  push: 10,
  pull: 10,
  legs: 10,
  core: 10,
  endurance: 10,
  mobility: 10,
};

const initialRadarStats = {
  force: 10,
  explosion: 10,
  resistance: 10,
  mobility: 10,
  mechanics: 10,
  coordination: 10,
};

const initialRecovery: RecoveryStatus = {
  recoveryRateHours: 24,
  debuffs: [],
  passiveSkills: [],
};

const resolveAthleteTier = (level: number): AthleteTier => {
  let tier: AthleteTier = 'Bronze';
  for (const entry of ATHLETE_TIER_THRESHOLDS) {
    if (level >= entry.minLevel) tier = entry.tier;
  }
  return tier;
};

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const MAX_USER_LEVEL = 100;
const BASE_USER_EXP_TO_NEXT = 220;
const USER_EXP_GROWTH = 1.12;
const MAX_SKILL_MASTERY_XP = 500;
const LEGACY_SKILL_LEVEL_CAP = 5;
const AUTO_UNLOCK_LEVEL_ZERO_SKILLS = 2;
const AUTO_UNLOCK_CURRENT_LEVEL_SKILLS = 3;

const resolveUserExpToNext = (level: number) => {
  if (level >= MAX_USER_LEVEL) return 0;
  return Math.floor(BASE_USER_EXP_TO_NEXT * Math.pow(USER_EXP_GROWTH, level - 1));
};

const resolveSkillXpGainByDifficulty = (difficulty: Quest['difficulty']) => {
  if (difficulty === 'hard') return 10;
  if (difficulty === 'medium') return 8;
  return 6;
};

const resolveAutoUnlockCountForLevel = (level: number, availableSkills: number) => {
  if (level <= 0) return Math.min(availableSkills, AUTO_UNLOCK_LEVEL_ZERO_SKILLS);
  return Math.min(availableSkills, AUTO_UNLOCK_CURRENT_LEVEL_SKILLS);
};

const normalizeDateToDayKey = (value: Date | string | number) => {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
};

const toLocalDayKey = (value: Date | string | number = Date.now()) => {
  const d = new Date(value);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const normalizeEquipmentList = (items: string[]) =>
  Array.from(new Set(items.map((item) => item.trim()).filter(Boolean)));

const resolveEnabledEquipmentNames = (equipment: Equipment[], fallback: string[]) => {
  const enabledNames = equipment
    .filter((item) => item.enabledForAI !== false)
    .map((item) => item.originalName || item.name)
    .filter(Boolean);
  return normalizeEquipmentList(enabledNames.length > 0 ? enabledNames : fallback);
};

const normalizeText = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const mergeCompletedQuests = (
  current: NonNullable<TrainingDay['completedQuests']>,
  incoming: NonNullable<TrainingDay['completedQuests']>
) => {
  const byId = new Map<string, NonNullable<TrainingDay['completedQuests']>[number]>();
  for (const quest of current) byId.set(quest.questId, quest);
  for (const quest of incoming) byId.set(quest.questId, quest);
  return Array.from(byId.values());
};

const calculateWorkoutMetrics = (history: TrainingDay[]) => {
  const completedKeys = Array.from(
    new Set(
      history
        .filter((day) => day.completed)
        .map((day) => normalizeDateToDayKey(day.date))
    )
  ).sort((a, b) => a - b);

  const totalWorkouts = completedKeys.length;
  if (!totalWorkouts) {
    return { totalWorkouts: 0, streak: 0 };
  }

  let streak = 1;
  for (let i = completedKeys.length - 1; i > 0; i -= 1) {
    if (completedKeys[i] - completedKeys[i - 1] === DAY_IN_MS) {
      streak += 1;
    } else {
      break;
    }
  }

  return { totalWorkouts, streak };
};

const upsertTrainingDay = (history: TrainingDay[], day: TrainingDay) => {
  const dayKey = normalizeDateToDayKey(day.date);
  const normalizedHistory = history.map((entry) => ({
    ...entry,
    date: new Date(entry.date),
  }));
  const index = normalizedHistory.findIndex(
    (entry) => normalizeDateToDayKey(entry.date) === dayKey
  );

  if (index === -1) {
    return [...normalizedHistory, { ...day, date: new Date(day.date) }];
  }

  const current = normalizedHistory[index];
  const next = [...normalizedHistory];
  next[index] = {
    ...current,
    completed: current.completed || day.completed,
    questsCompleted: Math.max(current.questsCompleted, day.questsCompleted),
    expGained: Math.max(current.expGained, day.expGained),
    completedQuests: mergeCompletedQuests(current.completedQuests || [], day.completedQuests || []),
    date: new Date(current.date),
  };
  return next;
};

const ALL_PILLARS: MovementPillar[] = ['push', 'pull', 'core', 'legs', 'mobility', 'endurance'];

const createEmptyCustomSkillMap = (): Record<MovementPillar, SkillDefinition[]> => ({
  push: [],
  pull: [],
  core: [],
  legs: [],
  mobility: [],
  endurance: [],
});

const normalizeCustomSkillMap = (
  source?: Partial<Record<MovementPillar, SkillDefinition[]>>
): Record<MovementPillar, SkillDefinition[]> => {
  const base = createEmptyCustomSkillMap();
  if (!source) return base;
  for (const pillar of ALL_PILLARS) {
    const list = source[pillar];
    if (!Array.isArray(list)) continue;
    const seen = new Set<string>();
    base[pillar] = list.filter((skill) => {
      if (!skill || typeof skill.id !== 'string') return false;
      if (seen.has(skill.id)) return false;
      seen.add(skill.id);
      return true;
    });
  }
  return base;
};

const isSkillDisabled = (constraints: Record<string, SkillConstraint> | undefined, skillId: string) =>
  constraints?.[skillId]?.status === 'disabled';

const mapPillarToStat = (pillar: MovementPillar): keyof UserProfile['stats'] => {
  if (pillar === 'pull') return 'pull';
  if (pillar === 'legs') return 'legs';
  if (pillar === 'core') return 'core';
  if (pillar === 'mobility') return 'mobility';
  if (pillar === 'endurance') return 'endurance';
  return 'push';
};

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
  if (pillar === 'core') return '30-45s';
  if (pillar === 'mobility') return '8-12 reps';
  if (pillar === 'endurance') return '8-15 min';
  return '8-12 reps';
};

const defaultExecutionGuide = (exerciseName: string, pillar: MovementPillar, skillId?: string) =>
  getInvisibleSkillHowTo({ skillId, exerciseName, pillar });

const getSkillDefinitionById = (skillId: string, user?: UserProfile | null) => {
  for (const pillar of ALL_PILLARS) {
    const levelGroups = SKILL_DEFINITIONS[pillar];
    for (const level of Object.keys(levelGroups)) {
      const defs = levelGroups[Number(level)] || [];
      const found = defs.find((def) => def.id === skillId);
      if (found) return found;
    }
  }
  if (user?.customSkills) {
    for (const pillar of ALL_PILLARS) {
      const found = (user.customSkills[pillar] || []).find((def) => def.id === skillId);
      if (found) return found;
    }
  }
  return undefined;
};

const dedupeSkillsById = (
  defs: Array<NonNullable<ReturnType<typeof getSkillDefinitionById>>>
) => {
  const seen = new Set<string>();
  return defs.filter((def) => {
    if (seen.has(def.id)) return false;
    seen.add(def.id);
    return true;
  });
};

const synchronizeUserSkillsWithPillarLevels = (
  sourceUserSkills: Record<string, UserSkill>,
  sourcePillarLevels: Record<MovementPillar, PillarLevel>,
  pillarsToSync: MovementPillar[] = ALL_PILLARS,
  skillConstraints?: Record<string, SkillConstraint>
) => {
  const userSkills: Record<string, UserSkill> = { ...sourceUserSkills };
  const pillarLevels: Record<MovementPillar, PillarLevel> = {
    ...sourcePillarLevels,
  };
  const unlockedAt = new Date();

  for (const pillar of pillarsToSync) {
    const pillarData = pillarLevels[pillar];
    if (!pillarData) continue;

    const unlockedSkillIds = new Set<string>(pillarData.unlockedSkills || []);
    const cappedLevel = Math.max(0, Math.min(4, pillarData.level));

    for (let level = 0; level <= cappedLevel; level += 1) {
      const levelDefs = SKILL_DEFINITIONS[pillar]?.[level] || [];
      const unlockCount =
        level < cappedLevel
          ? levelDefs.length
          : resolveAutoUnlockCountForLevel(level, levelDefs.length);
      for (const skillDef of levelDefs.slice(0, unlockCount)) {
        if (isSkillDisabled(skillConstraints, skillDef.id)) continue;
        const existing = userSkills[skillDef.id];
        userSkills[skillDef.id] = {
          skillId: skillDef.id,
          unlocked: true,
          unlockedAt: existing?.unlockedAt || unlockedAt,
          masteryLevel: existing?.masteryLevel ?? 0,
        };
        unlockedSkillIds.add(skillDef.id);
      }
    }

    pillarLevels[pillar] = {
      ...pillarData,
      unlockedSkills: Array.from(unlockedSkillIds),
    };
  }

  return { userSkills, pillarLevels };
};

const getUnlockedSkillsByPillar = (user: UserProfile, pillar: MovementPillar) => {
  const constraints = user.skillConstraints || {};
  const unlockedIds = Object.entries(user.userSkills || {})
    .filter(([, skill]) => skill.unlocked)
    .map(([skillId]) => skillId);

  const unlockedDefs = unlockedIds
    .map((skillId) => getSkillDefinitionById(skillId, user))
    .filter((def): def is NonNullable<ReturnType<typeof getSkillDefinitionById>> => Boolean(def))
    .filter((def) => def.pillar === pillar);

  const customDefs = (user.customSkills?.[pillar] || []).filter((def) => Boolean(def?.id));
  const pillarLevel = Math.max(0, Math.min(4, user.pillarLevels?.[pillar]?.level ?? 0));
  const levelDefs = (SKILL_DEFINITIONS[pillar]?.[pillarLevel] || []).slice(0, 5);
  const customForCurrentWindow = customDefs.filter((def) => {
    const level = Number(def.level);
    if (!Number.isFinite(level)) return true;
    return level <= pillarLevel;
  });

  const filterDisabled = (defs: SkillDefinition[]) =>
    defs.filter((def) => !isSkillDisabled(constraints, def.id));

  if (unlockedDefs.length === 0 && customForCurrentWindow.length === 0) {
    const fallback = levelDefs.length > 0 ? levelDefs : SKILL_DEFINITIONS[pillar]?.[0] || [];
    return filterDisabled(fallback.slice(0, 5));
  }

  const mergedUnlocked = dedupeSkillsById([...unlockedDefs, ...customForCurrentWindow]);
  const hasCurrentLevelSkill = mergedUnlocked.some((def) => def.level >= pillarLevel);
  const resolved = hasCurrentLevelSkill
    ? mergedUnlocked
    : dedupeSkillsById([...mergedUnlocked, ...levelDefs, ...customForCurrentWindow]);
  const filtered = filterDisabled(resolved);
  if (filtered.length > 0) {
    return filtered;
  }

  const lastFallback = dedupeSkillsById([
    ...customForCurrentWindow,
    ...levelDefs,
    ...((SKILL_DEFINITIONS[pillar]?.[0] || []).slice(0, 5)),
  ]);
  const finalFallback = filterDisabled(lastFallback);
  if (finalFallback.length > 0) {
    return finalFallback;
  }

  const disabledCustomFallback = customForCurrentWindow.filter((def) => def.id);
  if (disabledCustomFallback.length > 0) {
    return disabledCustomFallback;
  }

  const hasAnyUnlocked = mergedUnlocked.length > 0;
  if (!hasAnyUnlocked) {
    return levelDefs;
  }

  if (hasCurrentLevelSkill) {
    return mergedUnlocked;
  }

  return dedupeSkillsById([...mergedUnlocked, ...levelDefs]);
};

const getSkillPoolByPillar = (
  user: UserProfile,
  pillar: MovementPillar,
  hasGymAccess?: boolean | null,
  availableEquipment?: string[]
) => {
  const baseSkills = getUnlockedSkillsByPillar(user, pillar);
  const gymSkillsByPillar = getGymSkillDefinitionsByPillar({
    hasGymAccess,
    availableEquipment,
    pillarLevels: user.pillarLevels,
  });
  const combined = [...baseSkills, ...(gymSkillsByPillar[pillar] || [])].filter(
    (skill) => !isSkillDisabled(user.skillConstraints, skill.id)
  );
  const seen = new Set<string>();
  return combined.filter((skill) => {
    const key = normalizeText(skill.name);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const initialEquipment: Equipment[] = [];

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial State
      currentScreen: 'awakening',
      isLoading: false,
      particlesEnabled: true,
      soundEnabled: true,
      notificationsEnabled: false,
      geminiApiKey: null,
      hasGymAccess: null,
      lastCheckIn: undefined,
      recoveryStatus: initialRecovery,
      pillarLevels: Object.fromEntries(
        Object.entries(BASE_PILLAR_LEVELS).map(([k, v]) => [k, { ...v }])
      ) as Record<MovementPillar, PillarLevel>,
      athleteTier: 'Bronze',
      user: null,
      dailyQuests: [],
      weeklyQuests: [],
      questHistory: [],
      equipment: initialEquipment,
      availableEquipment: [],
      trainingHistory: [],
      dailyQuestDateKey: undefined,
      trainingLogs: [],
      lastWeeklyPenaltyCheck: undefined,

      // Screen Navigation
      setScreen: (screen) => set({ currentScreen: screen }),
      setLoading: (loading) => set({ isLoading: loading }),
      toggleParticles: () => set((state) => ({ particlesEnabled: !state.particlesEnabled })),
      toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
      toggleNotifications: () => set((state) => ({ notificationsEnabled: !state.notificationsEnabled })),

      setGeminiApiKey: (key) =>
        set((state) => ({
          geminiApiKey: key,
          user: state.user ? { ...state.user, geminiApiKey: key } : state.user,
        })),
      setGymAccess: (hasAccess) =>
        set((state) => {
          // Auto-enable common gym equipment when gym access is granted
          const updatedEquipment = hasAccess
            ? state.equipment.map((eq) => {
                const origName = eq.originalName || eq.name;
                if (COMMON_GYM_EQUIPMENT.includes(origName) && !eq.enabledForAI) {
                  return { ...eq, enabledForAI: true };
                }
                return eq;
              })
            : state.equipment;
          const enabledEquipment = resolveEnabledEquipmentNames(updatedEquipment, state.availableEquipment);
          return {
            hasGymAccess: hasAccess,
            equipment: updatedEquipment,
            user: state.user
              ? { ...state.user, hasGymAccess: hasAccess, availableEquipment: enabledEquipment }
              : state.user,
          };
        }),
      setAvailableEquipment: (items) => {
        const normalized = normalizeEquipmentList(items);
        const equipmentCatalog = normalizeEquipmentCatalog(
          buildEquipmentCatalogFromNames(normalized, 'user'),
          normalized
        );
        set((state) => ({
          availableEquipment: normalized,
          equipment: equipmentCatalog,
          user: state.user ? { ...state.user, availableEquipment: normalized } : state.user,
        }));
      },
      setEquipmentCatalog: (items) => {
        const normalized = normalizeEquipmentCatalog(items, get().availableEquipment);
        set((state) => ({
          equipment: normalized,
          user: state.user
            ? { ...state.user, availableEquipment: normalized.map((item) => item.name) }
            : state.user,
        }));
      },
      logCheckIn: (entry) => {
        const debuffs = entry.painAreas.map((area, idx) => ({
          id: `pain-${area}-${idx}`,
          name: `Protecao ${area}`,
          description: `Reduzir carga em ${area}.`,
          icon: 'warning',
          affectedExercises: [area],
        }));

        set((state) => ({
          lastCheckIn: entry,
          recoveryStatus: {
            recoveryRateHours: entry.sleepQuality === 'great' ? 16 : entry.sleepQuality === 'ok' ? 24 : 32,
            debuffs,
            passiveSkills: state.recoveryStatus.passiveSkills,
          },
          user: state.user
            ? {
                ...state.user,
                debuffs,
              }
            : state.user,
        }));
      },

      logTrainingEntry: async (text) => {
        const {
          geminiApiKey,
          user,
          pillarLevels,
          recoveryStatus,
          equipment,
          availableEquipment,
          trainingHistory,
          trainingLogs,
          questHistory,
          dailyQuests,
          weeklyQuests,
          lastCheckIn,
          hasGymAccess,
        } = get();
        
        if (!user) return undefined;

        if (!geminiApiKey) {
          const entry: TrainingLogEntry = {
            id: `log-${Date.now()}`,
            text,
            timestamp: new Date(),
            recommendedAdjustment: {
              volumePercent: 100,
              cadenceNote: 'Treino registrado sem analise de IA',
              protectionTags: [],
            },
          };
          const todayRecord: TrainingDay = {
            date: new Date(),
            completed: true,
            questsCompleted: 1,
            expGained: 0,
          };
          set((state) => ({
            trainingLogs: [...state.trainingLogs, entry],
            trainingHistory: upsertTrainingDay(state.trainingHistory, todayRecord),
            user: state.user
              ? {
                  ...state.user,
                  ...calculateWorkoutMetrics(upsertTrainingDay(state.trainingHistory, todayRecord)),
                }
              : state.user,
          }));
          return entry;
        }

        try {
          const enabledEquipment = resolveEnabledEquipmentNames(equipment, availableEquipment);
          const context = {
            profile: {
              level: user.level,
              tier: user.athleteTier,
              objective: user.objective,
              fitnessLevel: user.fitnessLevel,
              availableTime: user.availableTime,
              trainingFrequency: user.trainingFrequency,
              hasGymAccess,
              availableEquipment: enabledEquipment,
              equipmentCatalog: equipment,
              bioData: user.bioData ?? user.bio ?? '',
            },
            progress: pillarLevels,
            recovery: recoveryStatus,
            stats: user.stats,
            radar: user.radarStats,
            quests: {
              daily: dailyQuests,
              weekly: weeklyQuests,
              history: questHistory.slice(-50),
            },
            skills: {
              unlockedIds: Object.entries(user.userSkills || {})
                .filter(([, skill]) => skill.unlocked)
                .map(([skillId]) => skillId),
              custom: user.customSkills || createEmptyCustomSkillMap(),
              constraints: user.skillConstraints || {},
            },
            logs: {
              trainingHistory: trainingHistory.slice(-60),
              trainingLogs: trainingLogs.slice(-30),
            },
            lastCheckIn,
          };

          const response = await fetch('/api/gemini', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              prompt: text, 
              apiKey: geminiApiKey,
              intent: 'training_log',
              context
            }),
          });

          const data = await response.json();
          recordApiCall(Number(data?.tokenUsage?.totalTokenCount) || 0);
          
          let adjustment;
          try {
            const geminiResponse = JSON.parse(data.response);
            adjustment = {
              volumePercent: geminiResponse.volumePercent || 100,
              cadenceNote: geminiResponse.cadenceNote || '',
              protectionTags: geminiResponse.protectionTags || [],
            };

            // Apply a bounded XP bonus from AI feedback to avoid progression spikes
            const rawMultiplier = Number(geminiResponse.xpMultiplier);
            const boundedMultiplier = Math.min(1.35, rawMultiplier);
            if (Number.isFinite(boundedMultiplier) && boundedMultiplier > 1) {
              get().addExp(Math.max(4, Math.floor(28 * (boundedMultiplier - 1))));
            }

            // Update Debuffs if protection needed
            if (geminiResponse.protectionTags?.length) {
               // Logic to add temp debuffs could go here, for now we just log it
            }

          } catch {
            // Fallback if parsing fails
            adjustment = {
              volumePercent: 100,
              cadenceNote: "Treino registrado com sucesso",
              protectionTags: [],
            };
          }

          const entry: TrainingLogEntry = {
            id: `log-${Date.now()}`,
            text,
            timestamp: new Date(),
            recommendedAdjustment: adjustment,
          };

          const completedToday = dailyQuests.filter((quest) => {
            if (!quest.completedAt || quest.status !== 'completed') return false;
            return normalizeDateToDayKey(quest.completedAt) === normalizeDateToDayKey(new Date());
          }).length;
          const todayRecord: TrainingDay = {
            date: new Date(),
            completed: true,
            questsCompleted: Math.max(1, completedToday),
            expGained: 0,
          };

          set((state) => ({
            trainingLogs: [...state.trainingLogs, entry],
            trainingHistory: upsertTrainingDay(state.trainingHistory, todayRecord),
            user: state.user
              ? {
                  ...state.user,
                  ...calculateWorkoutMetrics(upsertTrainingDay(state.trainingHistory, todayRecord)),
                }
              : state.user,
          }));

          return entry;
        } catch (error) {
          console.error('Failed to process training log:', error);
          // Fallback entry
          const entry: TrainingLogEntry = {
            id: `log-${Date.now()}`,
            text,
            timestamp: new Date(),
          };
          const todayRecord: TrainingDay = {
            date: new Date(),
            completed: true,
            questsCompleted: 1,
            expGained: 0,
          };
          set((state) => ({
            trainingLogs: [...state.trainingLogs, entry],
            trainingHistory: upsertTrainingDay(state.trainingHistory, todayRecord),
            user: state.user
              ? {
                  ...state.user,
                  ...calculateWorkoutMetrics(upsertTrainingDay(state.trainingHistory, todayRecord)),
                }
              : state.user,
          }));
          return entry;
        }
      },

      // User Initialization
      initializeUser: (data) => {
        const customSkills = normalizeCustomSkillMap(data.customSkills);
        const skillConstraints = data.skillConstraints || {};
        const incomingPillarLevels = data.pillarLevels || Object.fromEntries(
          Object.entries(BASE_PILLAR_LEVELS).map(([k, v]) => [k, { ...v }])
        ) as Record<MovementPillar, PillarLevel>;
        const synchronized = synchronizeUserSkillsWithPillarLevels(
          data.userSkills || {},
          incomingPillarLevels,
          ALL_PILLARS,
          skillConstraints
        );
        const pillarLevels = synchronized.pillarLevels;
        const userSkills = synchronized.userSkills;
        const availableEquipment = normalizeEquipmentList(data.availableEquipment || []);
        const providedEquipmentCatalog = normalizeEquipmentCatalog(
          data.equipmentCatalog || [],
          availableEquipment
        );
        const equipmentCatalog =
          providedEquipmentCatalog.length > 0
            ? providedEquipmentCatalog
            : normalizeEquipmentCatalog(
                buildEquipmentCatalogFromNames(availableEquipment, 'assessment-ai'),
                availableEquipment
              );

        // Calculate stats based on pillar levels if not provided
        const calculatedStats = data.stats || {
          push: 5 + (pillarLevels.push?.level || 0) * 2,
          pull: 5 + (pillarLevels.pull?.level || 0) * 2,
          legs: 5 + (pillarLevels.legs?.level || 0) * 2,
          core: 5 + (pillarLevels.core?.level || 0) * 2,
          endurance: 5 + (pillarLevels.endurance?.level || 0) * 2,
          mobility: 5 + (pillarLevels.mobility?.level || 0) * 2,
        };

        const user: UserProfile = {
          name: data.name,
          rank: data.rank,
          athleteTier: resolveAthleteTier(1),
          level: 1,
          exp: 0,
          expToNextLevel: resolveUserExpToNext(1),
          stats: calculatedStats,
          radarStats: data.radarStats || { ...initialRadarStats },
          height: data.height,
          weight: data.weight,
          age: data.age,
          objective: data.objective,
          fitnessLevel: data.fitnessLevel,
          streak: 0,
          totalWorkouts: 0,
          debuffs: data.debuffs || [],
          passiveSkills: [],
          pillarLevels,
          userSkills,
          customSkills,
          skillConstraints,
          hasGymAccess: data.hasGymAccess,
          availableEquipment,
          geminiApiKey: data.geminiApiKey ?? null,
          bioData: data.bioData,
          availableTime: data.availableTime,
          trainingFrequency: data.trainingFrequency,
        };
        set({
          user,
          pillarLevels,
          athleteTier: resolveAthleteTier(1),
          hasGymAccess: data.hasGymAccess ?? null,
          recoveryStatus: {
            ...initialRecovery,
            debuffs: data.debuffs || [],
          },
          equipment: equipmentCatalog,
          availableEquipment,
        });
      },

      // Experience System
      addExp: (amount) => {
        const { user } = get();
        if (!user || amount <= 0 || user.level >= MAX_USER_LEVEL) return;

        let newExp = user.exp + amount;
        let newLevel = user.level;
        let newExpToNext = user.expToNextLevel;

        while (newLevel < MAX_USER_LEVEL && newExp >= newExpToNext) {
          newExp -= newExpToNext;
          newLevel += 1;
          newExpToNext = resolveUserExpToNext(newLevel);
        }

        if (newLevel >= MAX_USER_LEVEL) {
          newLevel = MAX_USER_LEVEL;
          newExp = 0;
          newExpToNext = 0;
        }

        const nextTier = resolveAthleteTier(newLevel);

        set({
          athleteTier: nextTier,
          user: {
            ...user,
            exp: newExp,
            level: newLevel,
            expToNextLevel: newExpToNext,
            athleteTier: nextTier,
          },
        });
      },

      addMovementXP: (pillar, amount) => {
        const { pillarLevels, user } = get();
        const current = pillarLevels[pillar];
        if (!current) return;

        let xp = current.xp + amount;
        let level = current.level;
        let xpToNext = current.xpToNext;

        while (xp >= xpToNext && level < 4) {
          xp -= xpToNext;
          level += 1;
          xpToNext = Math.max(100, Math.floor(150 * Math.pow(1.2, level)));
        }

        const nextPillarLevels = {
          ...pillarLevels,
          [pillar]: { ...current, xp, level, xpToNext },
        };
        const leveledUp = level > current.level;

        if (!user) {
          set({ pillarLevels: nextPillarLevels });
          return;
        }

        if (leveledUp) {
          const synchronized = synchronizeUserSkillsWithPillarLevels(
            user.userSkills || {},
            nextPillarLevels,
            [pillar],
            user.skillConstraints
          );
          set({
            pillarLevels: synchronized.pillarLevels,
            user: {
              ...user,
              pillarLevels: synchronized.pillarLevels,
              userSkills: synchronized.userSkills,
            },
          });
          return;
        }

        set({
          pillarLevels: nextPillarLevels,
          user: {
            ...user,
            pillarLevels: nextPillarLevels,
          },
        });
      },

      // Stats
      updateStat: (stat, amount) => {
        const { user } = get();
        if (!user) return;

        set({
          user: {
            ...user,
            stats: {
              ...user.stats,
              [stat]: user.stats[stat] + amount,
            },
          },
        });
      },

      levelUp: () => {
        const { user } = get();
        if (!user || user.level >= MAX_USER_LEVEL) return;

        const newLevel = user.level + 1;
        const newExpToNext = resolveUserExpToNext(newLevel);
        const nextTier = resolveAthleteTier(newLevel);

        set({
          athleteTier: nextTier,
          user: {
            ...user,
            level: newLevel,
            exp: 0,
            expToNextLevel: newExpToNext,
            athleteTier: nextTier,
          },
        });
      },

      // Quests
      setQuests: (daily, weekly) =>
        set({ dailyQuests: daily, weeklyQuests: weekly, dailyQuestDateKey: toLocalDayKey() }),

      /** @deprecated Use ProtocolGenerator (AI-based) instead. Kept for interface compat. */
      generatePMFQuests: ({ priorityPillars = ['push', 'pull', 'core'], painAreas = [], hasGymAccess }) => {
        const { user, pillarLevels, equipment, availableEquipment, questHistory } = get();
        if (!user) return;

        // Check weekly penalty when generating new quests (new week starts)
        get().checkWeeklyPenalty();

        const sortedPillars = ALL_PILLARS
          .filter(p => !painAreas.includes(p))
          .sort((a, b) => pillarLevels[a].level - pillarLevels[b].level);
        const preferredPillars = priorityPillars.filter(
          (pillar): pillar is MovementPillar => ALL_PILLARS.includes(pillar) && !painAreas.includes(pillar)
        );
        const activePillars = Array.from(new Set([...preferredPillars, ...sortedPillars]));
        const effectivePillars = activePillars.length > 0 ? activePillars : ALL_PILLARS;
        const questCount = resolveDailyQuestCount(user.availableTime);
        const sets = resolveSetCount(user.availableTime, user.trainingFrequency);
        const enabledEquipment = resolveEnabledEquipmentNames(equipment, availableEquipment);
        const tenDaysAgo = Date.now() - 10 * DAY_IN_MS;
        const recentQuestNames = new Set(
          (questHistory || [])
            .filter((quest) => quest.completedAt && new Date(quest.completedAt).getTime() >= tenDaysAgo)
            .map((quest) => normalizeText(quest.name))
        );
        const selectedInRun = new Set<string>();

        // Use exercise database if loaded, otherwise fall back to old skill system
        const useExerciseDB = isExercisesLoaded();

        const daily: Quest[] = Array.from({ length: questCount }).map((_, index) => {
          const pillar = effectivePillars[index % effectivePillars.length];
          const level = pillarLevels[pillar].level;
          const difficulty: 'easy' | 'medium' | 'hard' =
            level <= 1 ? 'easy' : level >= 3 ? 'hard' : 'medium';
          const reps = defaultRepsByPillar(pillar);

          if (useExerciseDB) {
            // New exercise-based quest generation
            const exercisePool = getExercisesForQuestSync(pillar, level, enabledEquipment);
            const candidatePool = exercisePool.filter((ex) => {
              const norm = normalizeText(ex.name);
              return !recentQuestNames.has(norm) && !selectedInRun.has(norm);
            });
            const finalPool = candidatePool.length > 0 ? candidatePool : exercisePool;
            const selectedExercise = finalPool[index % Math.max(1, finalPool.length)];
            const exerciseName = sanitizeText(selectedExercise?.name || `${PILLAR_NAMES[pillar]} Exercise`);
            selectedInRun.add(normalizeText(exerciseName));
            const xp = EXERCISE_XP_BY_LEVEL[selectedExercise?.level ?? 0] ?? 10;

            return {
              id: `pmf-daily-${pillar}-${Date.now()}-${index}`,
              name: exerciseName,
              description: sanitizeText(
                `${selectedExercise?.muscle || pillar} exercise. Equipment: ${
                  selectedExercise?.equipment?.join(', ') || 'bodyweight'
                }.`
              ),
              executionGuide: selectedExercise?.howTo || defaultExecutionGuide(exerciseName, pillar),
              exerciseId: selectedExercise?.id,
              previewSrc: selectedExercise?.previewSrc,
              skillId: selectedExercise?.id,
              skillLevel: selectedExercise?.level,
              type: 'daily',
              pillar,
              sets,
              reps,
              xpReward: xp,
              statBoost: { stat: mapPillarToStat(pillar), amount: 1 },
              difficulty,
              status: 'pending',
            };
          }

          // Fallback: old skill system
          const skillPool = getSkillPoolByPillar(user, pillar, Boolean(hasGymAccess ?? get().hasGymAccess), enabledEquipment);
          const candidatePool =
            skillPool.filter((skill) => {
              const normalizedName = normalizeText(skill.name);
              return !recentQuestNames.has(normalizedName) && !selectedInRun.has(normalizedName);
            }) ||
            [];
          const secondaryPool =
            candidatePool.length > 0
              ? candidatePool
              : skillPool.filter((skill) => !selectedInRun.has(normalizeText(skill.name)));
          const finalPool = secondaryPool.length > 0 ? secondaryPool : skillPool;
          const selectedSkill = finalPool[index % Math.max(1, finalPool.length)];
          const exerciseName = sanitizeText(selectedSkill?.name || `${PILLAR_NAMES[pillar]} Skill`);
          selectedInRun.add(normalizeText(exerciseName));
          const xp = Math.min(40, Math.max(18, 20 + level * 5));

          return {
            id: `pmf-daily-${pillar}-${Date.now()}-${index}`,
            name: exerciseName,
            description: sanitizeText(
              `Progression on ${PILLAR_NAMES[pillar]} with unlocked skills. Equipment mode: ${
                Boolean(hasGymAccess ?? get().hasGymAccess) ? 'gym/accessories' : 'bodyweight'
              }.`
            ),
            executionGuide: defaultExecutionGuide(exerciseName, pillar, selectedSkill?.id),
            skillId: selectedSkill?.id,
            skillLevel: selectedSkill?.level,
            skillTags: Array.isArray(selectedSkill?.tags)
              ? selectedSkill.tags.map((tag) => sanitizeText(String(tag))).filter(Boolean)
              : undefined,
            skillReason:
              typeof selectedSkill?.clinicalReason === 'string' && selectedSkill.clinicalReason.trim()
                ? sanitizeText(selectedSkill.clinicalReason)
                : undefined,
            type: 'daily',
            pillar,
            sets,
            reps,
            xpReward: xp,
            statBoost: { stat: mapPillarToStat(pillar), amount: 1 },
            difficulty,
            status: 'pending',
          };
        });

        const weeklySessions = Math.max(2, Math.min(7, Number(user.trainingFrequency) || 3));
        const weekly: Quest[] = [
          {
            id: `pmf-weekly-${Date.now()}`,
            name: 'Weekly Skill Progression',
            description: `Complete ${weeklySessions} sessions this week focusing on: ${effectivePillars
              .slice(0, 3)
              .map((p) => PILLAR_NAMES[p])
              .join(', ')}.`,
            executionGuide: `Distribute ${weeklySessions} sessions across the week and complete all daily quests with good form.`,
            type: 'weekly',
            pillar: effectivePillars[0] || 'push',
            sets: weeklySessions,
            reps: `${weeklySessions} sessions`,
            xpReward: 140,
            difficulty: 'hard',
            status: 'pending',
          },
        ];

        set({
          dailyQuests: daily,
          weeklyQuests: weekly,
          dailyQuestDateKey: toLocalDayKey(),
          availableEquipment,
          user: {
            ...user,
            availableEquipment,
            availableTime: user.availableTime,
            trainingFrequency: user.trainingFrequency,
          },
        });
      },

      completeQuest: (questId) => {
        const { dailyQuests, weeklyQuests, user } = get();
        const quest = [...dailyQuests, ...weeklyQuests].find((q) => q.id === questId);
        if (!quest || !user || quest.status === 'completed') return;
        const completedAt = new Date();
        const questPillarLevelBefore = get().pillarLevels[quest.pillar]?.level || 0;
        const completedQuestRecord: NonNullable<TrainingDay['completedQuests']>[number] = {
          questId: quest.id,
          name: quest.name,
          pillar: quest.pillar,
          skillId: quest.skillId,
          skillLevel: quest.skillLevel,
          skillTags: quest.skillTags,
          skillReason: quest.skillReason,
          sets: quest.sets,
          reps: quest.reps,
          xpReward: quest.xpReward,
          completedAt,
        };
        
        const updateQuests = (quests: Quest[]) =>
          quests.map((q) =>
            q.id === questId
              ? { ...q, status: 'completed' as const, completedAt }
              : q
          );

        // Add XP
        get().addExp(quest.xpReward);

        // Add pillar XP
        get().addMovementXP(quest.pillar, Math.max(8, Math.floor(quest.xpReward * 0.35)));

        if (quest.skillId && !user.userSkills?.[quest.skillId]?.unlocked) {
          get().unlockSkill(quest.skillId);
        }
        
        // Add skill XP: if quest has an exerciseId, use it directly; otherwise fallback to old logic
        if (quest.exerciseId) {
          // New exercise-based: auto-unlock and add mastery XP
          if (!user.userSkills?.[quest.exerciseId]?.unlocked) {
            get().unlockSkill(quest.exerciseId);
          }
          get().addSkillXP(quest.exerciseId, resolveSkillXpGainByDifficulty(quest.difficulty));
        } else {
          const latestUser = get().user;
          if (latestUser?.userSkills) {
            if (quest.skillId && latestUser.userSkills[quest.skillId]?.unlocked) {
              get().addSkillXP(quest.skillId, resolveSkillXpGainByDifficulty(quest.difficulty));
            } else {
              const pillarSkills = SKILL_DEFINITIONS[quest.pillar];
              const levelSkills = (pillarSkills[questPillarLevelBefore] || []).filter(
                (skillDef) => latestUser.userSkills[skillDef.id]?.unlocked
              );
              if (levelSkills.length > 0) {
                const normalizedQuestName = normalizeText(quest.name);
                const matchedSkill = levelSkills.find((skillDef) => {
                  const normalizedSkillName = normalizeText(skillDef.name);
                  return (
                    normalizedSkillName === normalizedQuestName ||
                    normalizedSkillName.includes(normalizedQuestName) ||
                    normalizedQuestName.includes(normalizedSkillName)
                  );
                });
                const targetSkill = matchedSkill || levelSkills[0];
                get().addSkillXP(targetSkill.id, resolveSkillXpGainByDifficulty(quest.difficulty));
              }
            }
          }
        }
        
        // Update stat if applicable
        if (quest.statBoost) {
          get().updateStat(quest.statBoost.stat, quest.statBoost.amount);
        }

        set((state) => {
          let nextTrainingHistory = state.trainingHistory;

          if (quest.type === 'daily') {
            const todayKey = normalizeDateToDayKey(completedAt);
            const existingIndex = nextTrainingHistory.findIndex(
              (day) => normalizeDateToDayKey(day.date) === todayKey
            );

            if (existingIndex === -1) {
              nextTrainingHistory = [
                ...nextTrainingHistory,
                {
                  date: new Date(completedAt),
                  completed: true,
                  questsCompleted: 1,
                  expGained: quest.xpReward,
                  completedQuests: [completedQuestRecord],
                },
              ];
            } else {
              nextTrainingHistory = nextTrainingHistory.map((day, idx) => {
                if (idx !== existingIndex) return day;
                return {
                  ...day,
                  completed: true,
                  questsCompleted: day.questsCompleted + 1,
                  expGained: day.expGained + quest.xpReward,
                  completedQuests: mergeCompletedQuests(day.completedQuests || [], [completedQuestRecord]),
                  date: new Date(day.date),
                };
              });
            }
          }

          const metrics = calculateWorkoutMetrics(nextTrainingHistory);

          // Auto-complete weekly quests when session target is met
          let updatedWeeklyQuests = updateQuests(weeklyQuests);
          if (quest.type === 'daily') {
            // Count unique training days this week (Mon-Sun)
            const now = new Date(completedAt);
            const dayOfWeek = now.getDay(); // 0=Sun
            const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
            const weekStart = new Date(now);
            weekStart.setDate(now.getDate() - mondayOffset);
            weekStart.setHours(0, 0, 0, 0);

            const uniqueTrainingDays = new Set(
              nextTrainingHistory
                .filter((day) => {
                  const d = new Date(day.date);
                  return d >= weekStart && day.questsCompleted > 0;
                })
                .map((day) => normalizeDateToDayKey(day.date))
            ).size;

            updatedWeeklyQuests = updatedWeeklyQuests.map((wq) => {
              if (wq.status === 'completed' || wq.type !== 'weekly') return wq;
              // weekly quest.sets = required session count
              if (uniqueTrainingDays >= wq.sets) {
                // Award weekly XP
                get().addExp(wq.xpReward);
                get().addMovementXP(wq.pillar, Math.max(10, Math.floor(wq.xpReward * 0.3)));
                return { ...wq, status: 'completed' as const, completedAt };
              }
              return wq;
            });
          }

          return {
            dailyQuests: updateQuests(dailyQuests),
            weeklyQuests: updatedWeeklyQuests,
            questHistory: [
              ...(state.questHistory || []),
              { ...quest, status: 'completed', completedAt },
              // Also add auto-completed weekly quests to history
              ...updatedWeeklyQuests
                .filter((wq) => wq.status === 'completed' && !weeklyQuests.find((owq) => owq.id === wq.id && owq.status === 'completed'))
                .map((wq) => ({ ...wq, completedAt })),
            ],
            trainingHistory: nextTrainingHistory,
            user: state.user
              ? {
                  ...state.user,
                  totalWorkouts: metrics.totalWorkouts,
                  streak: metrics.streak,
                }
              : state.user,
          };
        });
      },

      failQuest: (questId) => {
        const { dailyQuests, weeklyQuests } = get();
        
        const updateQuests = (quests: Quest[]) =>
          quests.map((q) =>
            q.id === questId ? { ...q, status: 'failed' as const } : q
          );

        set({
          dailyQuests: updateQuests(dailyQuests),
          weeklyQuests: updateQuests(weeklyQuests),
        });
      },

      addSkillXP: (skillId, xpAmount) => {
        const { user } = get();
        if (!user || !user.userSkills || xpAmount <= 0) return;

        const skill = user.userSkills[skillId];
        if (!skill || !skill.unlocked) return;

        // Find the skill definition to validate progression context
        const skillDef = getSkillDefinitionById(skillId, user);

        if (!skillDef) return;

        const normalizedCurrentXP =
          skill.masteryLevel <= LEGACY_SKILL_LEVEL_CAP
            ? skill.masteryLevel * 100
            : skill.masteryLevel;
        const newMasteryXP = Math.min(normalizedCurrentXP + xpAmount, MAX_SKILL_MASTERY_XP);
        
        set((state) => ({
          user: state.user ? {
            ...state.user,
            userSkills: {
              ...state.user.userSkills,
              [skillId]: {
                ...skill,
                masteryLevel: newMasteryXP
              }
            }
          } : state.user
        }));
      },

      // Equipment
      equipItem: (itemId) => {
        set((state) => {
          const updatedEquipment = state.equipment.map((e) => ({
            ...e,
            enabledForAI: e.id === itemId ? true : e.enabledForAI,
            equipped: e.id === itemId ? true : e.equipped,
          }));
          const enabledEquipment = resolveEnabledEquipmentNames(
            updatedEquipment,
            state.availableEquipment
          );
          return {
            equipment: updatedEquipment,
            user: state.user
              ? {
                  ...state.user,
                  availableEquipment: enabledEquipment,
                }
              : state.user,
          };
        });
      },

      unequipItem: (itemId) => {
        set((state) => {
          const updatedEquipment = state.equipment.map((e) =>
            e.id === itemId ? { ...e, enabledForAI: false, equipped: false } : e
          );
          const enabledEquipment = resolveEnabledEquipmentNames(
            updatedEquipment,
            state.availableEquipment
          );
          return {
            equipment: updatedEquipment,
            user: state.user
              ? {
                  ...state.user,
                  availableEquipment: enabledEquipment,
                }
              : state.user,
          };
        });
      },

      syncEquipmentFromExercises: (exerciseEquipmentTypes) => {
        set((state) => {
          const hasGym = state.hasGymAccess ?? state.user?.hasGymAccess ?? false;
          // Build a lookup from both original and translated names
          const existingByOriginal = new Map(state.equipment.map((e) => [e.name, e]));
          // Also check by translated name in case equipment was already stored with EN name
          const existingByKey = new Map(state.equipment.map((e) => [e.id, e]));
          const merged: Equipment[] = exerciseEquipmentTypes.map((originalName) => {
            const displayName = translateEquipmentName(originalName);
            // Check if we already have this equipment (by original or translated name)
            const existing = existingByOriginal.get(originalName) || existingByOriginal.get(displayName);
            if (existing) {
              // Update name to PT-BR and ensure originalName is set
              return { ...existing, name: displayName, originalName: existing.originalName || originalName };
            }
            const isCommonGym = COMMON_GYM_EQUIPMENT.includes(originalName);
            return {
              id: `eq-${originalName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
              name: displayName,
              originalName,
              category: inferEquipmentCategory(originalName),
              equipped: hasGym && isCommonGym,
              enabledForAI: hasGym && isCommonGym,
              source: 'system' as const,
            };
          });
          // Keep any custom equipment not in exercise DB
          const mergedNames = new Set(merged.map((e) => e.id));
          for (const e of state.equipment) {
            if (!mergedNames.has(e.id) && !exerciseEquipmentTypes.includes(e.name)) {
              merged.push(e);
            }
          }
          const enabledEquipment = resolveEnabledEquipmentNames(merged, state.availableEquipment);
          return {
            equipment: merged,
            user: state.user
              ? { ...state.user, availableEquipment: enabledEquipment }
              : state.user,
          };
        });
      },

      // Training
      recordTrainingDay: (day) => {
        set((state) => {
          const trainingHistory = upsertTrainingDay(state.trainingHistory, day);
          const metrics = calculateWorkoutMetrics(trainingHistory);
          return {
            trainingHistory,
            user: state.user
              ? {
                  ...state.user,
                  totalWorkouts: metrics.totalWorkouts,
                  streak: metrics.streak,
                }
              : state.user,
          };
        });
      },

      setTrainingFrequency: (freq) => {
        const clamped = Math.max(2, Math.min(7, freq));
        set((state) => ({
          user: state.user
            ? { ...state.user, trainingFrequency: clamped }
            : state.user,
        }));
      },

      checkWeeklyPenalty: () => {
        const { user, trainingHistory, lastWeeklyPenaltyCheck } = get();
        if (!user) return null;

        const now = new Date();
        const dayOfWeek = now.getDay(); // 0=Sun
        const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

        // Current week key (ISO week)
        const currentMonday = new Date(now);
        currentMonday.setDate(now.getDate() - mondayOffset);
        currentMonday.setHours(0, 0, 0, 0);
        const weekKey = `${currentMonday.getFullYear()}-W${Math.ceil(
          ((currentMonday.getTime() - new Date(currentMonday.getFullYear(), 0, 1).getTime()) / 86400000 + 1) / 7
        )}`;

        // Already checked this week
        if (lastWeeklyPenaltyCheck === weekKey) {
          return null;
        }

        // Previous week boundaries
        const prevWeekEnd = new Date(currentMonday);
        const prevWeekStart = new Date(prevWeekEnd);
        prevWeekStart.setDate(prevWeekEnd.getDate() - 7);

        const sessionsGoal = Math.max(2, Math.min(7, Number(user.trainingFrequency) || 3));

        // Count unique training days in previous week
        const sessionsDone = new Set(
          trainingHistory
            .filter((day) => {
              const d = new Date(day.date);
              return d >= prevWeekStart && d < prevWeekEnd && day.questsCompleted > 0;
            })
            .map((day) => normalizeDateToDayKey(day.date))
        ).size;

        // Mark as checked for this week
        set({ lastWeeklyPenaltyCheck: weekKey });

        if (sessionsDone >= sessionsGoal) {
          return { penaltyApplied: false, xpLost: 0, sessionsDone, sessionsGoal };
        }

        // Only apply penalty if there's actual training history before this week
        const hasAnyHistory = trainingHistory.some((day) => {
          const d = new Date(day.date);
          return d < prevWeekEnd;
        });

        if (!hasAnyHistory) {
          return { penaltyApplied: false, xpLost: 0, sessionsDone, sessionsGoal };
        }

        // Penalty: 50 XP per missed session
        const missedSessions = sessionsGoal - sessionsDone;
        const xpLost = missedSessions * 50;

        const latestUser = get().user;
        if (latestUser) {
          const newExp = Math.max(0, latestUser.exp - xpLost);
          set({ user: { ...latestUser, exp: newExp } });
        }

        return { penaltyApplied: true, xpLost, sessionsDone, sessionsGoal };
      },

      runQuestMaintenance: () => {
        const { dailyQuestDateKey, dailyQuests, trainingHistory } = get();
        const todayKey = toLocalDayKey();
        let failedDailyCount = 0;
        const latestTrainingDay = trainingHistory
          .map((day) => new Date(day.date).getTime())
          .filter(Number.isFinite)
          .sort((a, b) => b - a)[0];
        const inferredQuestDay =
          dailyQuestDateKey || (latestTrainingDay ? toLocalDayKey(latestTrainingDay) : undefined);

        if (inferredQuestDay && inferredQuestDay !== todayKey && dailyQuests.length > 0) {
          set((state) => {
            const newlyFailed = state.dailyQuests
              .filter((quest) => quest.type === 'daily' && quest.status === 'pending')
              .map((quest) => ({ ...quest, status: 'failed' as const }));
            failedDailyCount = newlyFailed.length;
            return {
              dailyQuests: state.dailyQuests.map((quest) =>
                quest.type === 'daily' && quest.status === 'pending'
                  ? { ...quest, status: 'failed' as const }
                  : quest
              ),
              dailyQuestDateKey: todayKey,
              questHistory: [...(state.questHistory || []), ...newlyFailed],
            };
          });
        }

        const weeklyPenalty = get().checkWeeklyPenalty();
        return {
          failedDailyCount,
          weeklyPenaltyApplied: Boolean(weeklyPenalty?.penaltyApplied),
        };
      },

      // Skill System
      unlockSkill: (skillId: string) => {
        const { user } = get();
        if (!user) return;

        const skillDef = getSkillDefinitionById(skillId, user);
        const userSkills = { ...user.userSkills };
        userSkills[skillId] = {
          skillId,
          unlocked: true,
          unlockedAt: userSkills[skillId]?.unlockedAt || new Date(),
          masteryLevel: userSkills[skillId]?.masteryLevel || 0
        };
        const updatedPillarLevels = skillDef
          ? {
              ...user.pillarLevels,
              [skillDef.pillar]: {
                ...user.pillarLevels[skillDef.pillar],
                unlockedSkills: Array.from(
                  new Set([...(user.pillarLevels[skillDef.pillar]?.unlockedSkills || []), skillId])
                ),
              },
            }
          : user.pillarLevels;

        set({
          pillarLevels: updatedPillarLevels,
          user: {
            ...user,
            userSkills,
            pillarLevels: updatedPillarLevels,
          }
        });
      },

      attemptLevelUp: (pillar: MovementPillar, success: boolean) => {
        const { pillarLevels, user } = get();
        if (!user) return;

        const currentLevel = pillarLevels[pillar];
        if (currentLevel.level >= 4) return; // Ja no nivel maximo

        if (success) {
          // Level up bem-sucedido
          const newLevel = currentLevel.level + 1;
          const updatedPillarLevels = {
            ...pillarLevels,
            [pillar]: {
              ...currentLevel,
              level: newLevel,
              xp: 0,
              xpToNext: Math.max(100, Math.floor(150 * Math.pow(1.2, newLevel)))
            }
          };
          const synchronized = synchronizeUserSkillsWithPillarLevels(
            user.userSkills || {},
            updatedPillarLevels,
            [pillar],
            user.skillConstraints
          );

          set({
            pillarLevels: synchronized.pillarLevels,
            user: {
              ...user,
              pillarLevels: synchronized.pillarLevels,
              userSkills: synchronized.userSkills,
            }
          });
        } else {
          // Falha - perde XP
          const penalty = Math.floor(currentLevel.xp * 0.2); // Perde 20% do XP atual
          const newXp = Math.max(0, currentLevel.xp - penalty);

          const updatedPillarLevels = {
            ...pillarLevels,
            [pillar]: {
              ...currentLevel,
              xp: newXp
            }
          };

          set({
            pillarLevels: updatedPillarLevels,
            user: {
              ...user,
              pillarLevels: updatedPillarLevels
            }
          });
        }
      },

      // Reset
      resetApp: () =>
        set({
          currentScreen: 'awakening',
          isLoading: false,
          user: null,
          dailyQuests: [],
          weeklyQuests: [],
          questHistory: [],
          equipment: initialEquipment,
          availableEquipment: [],
          trainingHistory: [],
          dailyQuestDateKey: undefined,
          trainingLogs: [],
          hasGymAccess: null,
          lastCheckIn: undefined,
          recoveryStatus: initialRecovery,
          pillarLevels: Object.fromEntries(
            Object.entries(BASE_PILLAR_LEVELS).map(([k, v]) => [k, { ...v }])
          ) as Record<MovementPillar, PillarLevel>,
          athleteTier: 'Bronze',
        }),
    }),
    {
      name: 'shadow-gym-storage',
      partialize: (state) => ({
        currentScreen: state.currentScreen,
        user: state.user,
        dailyQuests: state.dailyQuests,
        weeklyQuests: state.weeklyQuests,
        questHistory: state.questHistory,
        equipment: state.equipment,
        availableEquipment: state.availableEquipment,
        trainingHistory: state.trainingHistory,
        dailyQuestDateKey: state.dailyQuestDateKey,
        trainingLogs: state.trainingLogs,
        particlesEnabled: state.particlesEnabled,
        soundEnabled: state.soundEnabled,
        notificationsEnabled: state.notificationsEnabled,
        geminiApiKey: state.geminiApiKey,
        hasGymAccess: state.hasGymAccess,
        lastCheckIn: state.lastCheckIn,
        recoveryStatus: state.recoveryStatus,
        pillarLevels: state.pillarLevels,
        athleteTier: state.athleteTier,
        lastWeeklyPenaltyCheck: state.lastWeeklyPenaltyCheck,
      }),
    }
  )
);
