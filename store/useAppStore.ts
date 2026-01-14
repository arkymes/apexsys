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
  MovementProgress,
  CheckInEntry,
  RecoveryStatus,
  AthleteTier,
  TrainingLogEntry
} from '@/types';
import { ATHLETE_TIER_THRESHOLDS, BASE_MOVEMENT_PROGRESS, PILLAR_NAMES } from '@/types';

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
  movementProgress: Record<MovementPillar, MovementProgress>;
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

  // Training History
  trainingHistory: TrainingDay[];

  // Actions: access
  setGeminiApiKey: (key: string) => void;
  setGymAccess: (hasAccess: boolean) => void;
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
    movementProgress?: Record<MovementPillar, MovementProgress>;
    bioData?: string;
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

  // Equipment Actions
  equipItem: (itemId: string) => void;
  unequipItem: (itemId: string) => void;

  // Training Actions
  recordTrainingDay: (day: TrainingDay) => void;

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

const initialEquipment: Equipment[] = [
  {
    id: 'weapon-1',
    slot: 'weapon',
    name: 'Iron Dumbbells',
    icon: '🏋️',
    bonus: '+5% STR XP',
    equipped: true,
  },
  {
    id: 'hands-1',
    slot: 'hands',
    name: 'Training Gloves',
    icon: '🧤',
    bonus: '+3% All XP',
    equipped: true,
  },
  {
    id: 'boots-1',
    slot: 'boots',
    name: 'Running Shoes',
    icon: '👟',
    bonus: '+5% AGI XP',
    equipped: true,
  },
];

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
      movementProgress: Object.fromEntries(
        Object.entries(BASE_MOVEMENT_PROGRESS).map(([k, v]) => [k, { ...v }])
      ) as Record<MovementPillar, MovementProgress>,
      athleteTier: 'Bronze',
      user: null,
      dailyQuests: [],
      weeklyQuests: [],
      questHistory: [],
      equipment: initialEquipment,
      trainingHistory: [],
      trainingLogs: [],

      // Screen Navigation
      setScreen: (screen) => set({ currentScreen: screen }),
      setLoading: (loading) => set({ isLoading: loading }),
      toggleParticles: () => set((state) => ({ particlesEnabled: !state.particlesEnabled })),
      toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
      toggleNotifications: () => set((state) => ({ notificationsEnabled: !state.notificationsEnabled })),

      setGeminiApiKey: (key) => set({ geminiApiKey: key }),
      setGymAccess: (hasAccess) => set({ hasGymAccess: hasAccess }),
      logCheckIn: (entry) => {
        const debuffs = entry.painAreas.map((area, idx) => ({
          id: `pain-${area}-${idx}`,
          name: `Proteção ${area}`,
          description: `Reducionar carga em ${area}.`,
          icon: '⚠️',
          affectedExercises: [area],
        }));

        set({
          lastCheckIn: entry,
          recoveryStatus: {
            recoveryRateHours: entry.sleepQuality === 'great' ? 16 : entry.sleepQuality === 'ok' ? 24 : 32,
            debuffs,
            passiveSkills: get().recoveryStatus.passiveSkills,
          },
        });
      },

      logTrainingEntry: async (text) => {
        const { geminiApiKey, user, movementProgress, recoveryStatus } = get();
        
        if (!geminiApiKey || !user) return undefined;

        try {
          const context = {
            level: user.level,
            tier: user.athleteTier,
            progress: movementProgress,
            recovery: recoveryStatus,
            stats: user.stats,
            radar: user.radarStats
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
          
          let adjustment;
          try {
            const geminiResponse = JSON.parse(data.response);
            adjustment = {
              volumePercent: geminiResponse.volumePercent || 100,
              cadenceNote: geminiResponse.cadenceNote || '',
              protectionTags: geminiResponse.protectionTags || [],
            };

            // Apply XP Multiplier if present (hidden internal logic)
            if (geminiResponse.xpMultiplier && geminiResponse.xpMultiplier > 1) {
              get().addExp(Math.floor(50 * (geminiResponse.xpMultiplier - 1)));
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

          set((state) => ({
            trainingLogs: [...state.trainingLogs, entry],
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
          set((state) => ({
            trainingLogs: [...state.trainingLogs, entry],
          }));
          return entry;
        }
      },

      // User Initialization
      initializeUser: (data) => {
        const movementProgress = data.movementProgress || Object.fromEntries(
          Object.entries(BASE_MOVEMENT_PROGRESS).map(([k, v]) => [k, { ...v }])
        ) as Record<MovementPillar, MovementProgress>;

        const user: UserProfile = {
          name: data.name,
          rank: data.rank,
          athleteTier: resolveAthleteTier(1),
          level: 1,
          exp: 0,
          expToNextLevel: 100,
          stats: data.stats || { ...initialUserStats },
          radarStats: data.radarStats || { ...initialRadarStats },
          height: data.height,
          weight: data.weight,
          age: data.age,
          objective: data.objective,
          fitnessLevel: data.fitnessLevel,
          streak: 0,
          totalWorkouts: 0,
          debuffs: [],
          passiveSkills: [],
          movementProgress,
          hasGymAccess: data.hasGymAccess,
          geminiApiKey: data.geminiApiKey ?? null,
          bioData: data.bioData,
          availableTime: data.availableTime,
          trainingFrequency: data.trainingFrequency,
          debuffs: data.debuffs || [],
        };
        set({ user, movementProgress, athleteTier: resolveAthleteTier(1) });
      },

      // Experience System
      addExp: (amount) => {
        const { user } = get();
        if (!user) return;

        let newExp = user.exp + amount;
        let newLevel = user.level;
        let newExpToNext = user.expToNextLevel;

        while (newExp >= newExpToNext) {
          newExp -= newExpToNext;
          newLevel += 1;
          newExpToNext = Math.floor(100 * Math.pow(1.1, newLevel - 1));
        }

        set({
          user: {
            ...user,
            exp: newExp,
            level: newLevel,
            expToNextLevel: newExpToNext,
            athleteTier: resolveAthleteTier(newLevel),
          },
        });
      },

      addMovementXP: (pillar, amount) => {
        const { movementProgress } = get();
        const current = movementProgress[pillar];
        if (!current) return;

        let xp = current.xp + amount;
        let level = current.level;
        let xpToNext = current.xpToNext;

        while (xp >= xpToNext && level < 100) {
          xp -= xpToNext;
          level += 1;
          xpToNext = Math.max(100, Math.floor(120 * Math.pow(1.05, level)));
        }

        const updated = {
          ...movementProgress,
          [pillar]: { ...current, xp, level, xpToNext },
        };

        set((state) => ({
          movementProgress: updated,
          user: state.user ? { ...state.user, movementProgress: updated } : state.user,
        }));
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
        if (!user) return;

        const newLevel = user.level + 1;
        const newExpToNext = Math.floor(100 * Math.pow(1.1, newLevel - 1));

        set({
          user: {
            ...user,
            level: newLevel,
            exp: 0,
            expToNextLevel: newExpToNext,
          },
        });
      },

      // Quests
      setQuests: (daily, weekly) => set({ dailyQuests: daily, weeklyQuests: weekly }),

      generatePMFQuests: ({ priorityPillars = ['push', 'pull', 'core'], painAreas = [], hasGymAccess }) => {
        const { user, movementProgress } = get();
        if (!user) return;

        const pillars: MovementPillar[] = ['push', 'pull', 'core', 'legs', 'mobility', 'endurance'];
        
        // Find weakest pillars (lowest level)
        const sortedPillars = pillars
          .filter(p => !painAreas.includes(p))
          .sort((a, b) => movementProgress[a].level - movementProgress[b].level);
        
        const activePillars = sortedPillars.slice(0, 3);

        const makeQuest = (id: string, pillar: MovementPillar, name: string, sets: number, reps: number | string, difficulty: 'easy' | 'medium' | 'hard', xp: number): Quest => {
          const level = movementProgress[pillar].level;
          const usesEquipment = Boolean(hasGymAccess ?? get().hasGymAccess);
          
          // Adjust difficulty based on level
          let adjustedDifficulty: 'easy' | 'medium' | 'hard' = 'medium';
          if (level < 10) adjustedDifficulty = 'easy';
          else if (level > 50) adjustedDifficulty = 'hard';
          
          // Adjust reps based on level
          let adjustedReps = reps;
          if (typeof reps === 'number') {
            if (level < 20) adjustedReps = Math.max(5, reps - 3);
            else if (level > 60) adjustedReps = reps + 2;
          }

          return {
            id,
            name,
            description: `PMF Progressão no pilar ${PILLAR_NAMES[pillar]}. Nível atual: ${level}. ${usesEquipment ? 'Com equipamento' : 'Calistenia'}.`,
            type: 'daily',
            pillar,
            sets,
            reps: adjustedReps,
            xpReward: xp,
            difficulty: adjustedDifficulty,
            status: 'pending',
          };
        };

        const exercises = {
          push: hasGymAccess ? 'Supino com Halteres' : 'Flexão de Braço',
          pull: hasGymAccess ? 'Remada Curvada' : 'Barra Fixa',
          core: 'Prancha',
          legs: hasGymAccess ? 'Agachamento' : 'Agachamento Pistola',
          mobility: 'Alongamento Dinâmico',
          endurance: 'Corrida ou Burpees',
        };

        const daily: Quest[] = activePillars.map((pillar, idx) => {
          const baseXP = 50 + (movementProgress[pillar].level * 2);
          return makeQuest(
            `pmf-daily-${pillar}-${Date.now()}`,
            pillar,
            exercises[pillar],
            pillar === 'core' ? 3 : 4,
            pillar === 'core' ? 30 : pillar === 'endurance' ? '10min' : 10,
            'medium',
            baseXP
          );
        });

        const weekly: Quest[] = [
          {
            id: 'pmf-weekly-progression',
            name: 'Prova de Progressão Semanal',
            description: `Complete 5 sessões de treino focando nos pilares mais fracos: ${activePillars.map(p => PILLAR_NAMES[p]).join(', ')}.`,
            type: 'weekly',
            pillar: activePillars[0] || 'push',
            sets: 5,
            reps: 'sessions',
            xpReward: 250,
            difficulty: 'hard',
            status: 'pending',
          },
        ];

        set({ dailyQuests: daily, weeklyQuests: weekly });
      },

      completeQuest: (questId) => {
        const { dailyQuests, weeklyQuests, user } = get();
        
        const updateQuests = (quests: Quest[]) =>
          quests.map((q) =>
            q.id === questId
              ? { ...q, status: 'completed' as const, completedAt: new Date() }
              : q
          );

        const quest = [...dailyQuests, ...weeklyQuests].find((q) => q.id === questId);
        
        if (quest && user) {
          // Add XP
          get().addExp(quest.xpReward);

          // Add pillar XP
          get().addMovementXP(quest.pillar, Math.max(20, Math.floor(quest.xpReward * 0.5)));
          
          // Update stat if applicable
          if (quest.statBoost) {
            get().updateStat(quest.statBoost.stat, quest.statBoost.amount);
          }
        }

        set((state) => ({
          dailyQuests: updateQuests(dailyQuests),
          weeklyQuests: updateQuests(weeklyQuests),
          questHistory: quest ? [...(state.questHistory || []), { ...quest, status: 'completed', completedAt: new Date() }] : state.questHistory
        }));
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

      // Equipment
      equipItem: (itemId) => {
        const { equipment } = get();
        const item = equipment.find((e) => e.id === itemId);
        if (!item) return;

        set({
          equipment: equipment.map((e) => ({
            ...e,
            equipped: e.id === itemId ? true : e.slot === item.slot ? false : e.equipped,
          })),
        });
      },

      unequipItem: (itemId) => {
        const { equipment } = get();
        set({
          equipment: equipment.map((e) =>
            e.id === itemId ? { ...e, equipped: false } : e
          ),
        });
      },

      // Training
      recordTrainingDay: (day) => {
        const { trainingHistory, user } = get();
        set({
          trainingHistory: [...trainingHistory, day],
          user: user
            ? {
                ...user,
                totalWorkouts: user.totalWorkouts + 1,
                streak: day.completed ? user.streak + 1 : 0,
              }
            : null,
        });
      },

      // Reset
      resetApp: () =>
        set({
          currentScreen: 'awakening',
          isLoading: false,
          user: null,
          dailyQuests: [],
          weeklyQuests: [],
          equipment: initialEquipment,
          trainingHistory: [],
        }),
    }),
    {
      name: 'shadow-gym-storage',
      partialize: (state) => ({
        user: state.user,
        dailyQuests: state.dailyQuests,
        weeklyQuests: state.weeklyQuests,
        equipment: state.equipment,
        trainingHistory: state.trainingHistory,
        particlesEnabled: state.particlesEnabled,
        soundEnabled: state.soundEnabled,
        notificationsEnabled: state.notificationsEnabled,
        geminiApiKey: state.geminiApiKey,
        hasGymAccess: state.hasGymAccess,
        lastCheckIn: state.lastCheckIn,
        recoveryStatus: state.recoveryStatus,
        movementProgress: state.movementProgress,
        athleteTier: state.athleteTier,
      }),
    }
  )
);
