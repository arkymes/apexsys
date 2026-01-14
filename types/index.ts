export type Rank = 'E' | 'D' | 'C' | 'B' | 'A' | 'S';

export type Objective = 'lose-weight' | 'gain-muscle' | 'maintain';

export type FitnessLevel = 'beginner' | 'intermediate' | 'advanced';

export type MovementPillar = 
  | 'push' 
  | 'pull' 
  | 'core' 
  | 'legs' 
  | 'mobility' 
  | 'endurance';

export type AthleteTier = 'Bronze' | 'Prata' | 'Ouro' | 'Platina' | 'Diamante';

export type QuestType = 'daily' | 'weekly' | 'special';

export type QuestStatus = 'pending' | 'in-progress' | 'completed' | 'failed';

export interface UserStats {
  push: number;
  pull: number;
  legs: number;
  core: number;
  endurance: number;
  mobility: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface RadarStats {

  force: number;
  explosion: number;
  resistance: number;
  mobility: number;
  mechanics: number; // Estática/Técnica
  coordination: number;
}

export interface UserProfile {
  name: string;
  rank: Rank;
  athleteTier?: AthleteTier;
  level: number;
  exp: number;
  expToNextLevel: number;
  stats: UserStats;
  radarStats: RadarStats;
  height: number;
  weight: number;
  age: number;
  objective: Objective;
  fitnessLevel: FitnessLevel;
  bio?: string;
  streak: number;
  totalWorkouts: number;
  debuffs: Debuff[];
  passiveSkills: PassiveSkill[];
  movementProgress: Record<MovementPillar, MovementProgress>;
  hasGymAccess?: boolean;
  geminiApiKey?: string | null;
  bioData?: string; // Additional info from onboarding
  availableTime?: number; // Minutes per day
  trainingFrequency?: number; // Days per week
}

export interface Quest {
  id: string;
  name: string;
  description: string;
  type: QuestType;
  pillar: MovementPillar;
  sets: number;
  reps: number | string;
  xpReward: number;
  statBoost?: {
    stat: keyof UserStats;
    amount: number;
  };
  difficulty: 'easy' | 'medium' | 'hard';
  status: QuestStatus;
  completedAt?: Date;
}

export interface Debuff {
  id: string;
  name: string;
  description: string;
  icon: string;
  affectedExercises: string[];
  expiresAt?: Date;
}

export interface PassiveSkill {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: Date;
}

export interface MovementProgress {
  pillar: MovementPillar;
  level: number; // 1-100
  xp: number;
  xpToNext: number;
}

export interface RecoveryStatus {
  recoveryRateHours: number;
  debuffs: Debuff[];
  passiveSkills: PassiveSkill[];
}

export interface CheckInEntry {
  sleepQuality: 'poor' | 'ok' | 'great';
  painAreas: string[];
  notes?: string;
}

export interface TrainingLogEntry {
  id: string;
  text: string;
  timestamp: Date;
  recommendedAdjustment?: {
    volumePercent?: number;
    cadenceNote?: string;
    protectionTags?: string[];
  };
}

export interface StatusWindow {
  recoveryRateHours: number;
  debuffs: Debuff[];
  passiveSkills: PassiveSkill[];
  athleteTier: AthleteTier;
  movementProgress: Record<MovementPillar, MovementProgress>;
}

export interface Equipment {
  id: string;
  slot: 'weapon' | 'head' | 'chest' | 'hands' | 'accessory' | 'boots';
  name: string;
  icon: string;
  bonus: string;
  equipped: boolean;
}

export interface TrainingDay {
  date: Date;
  completed: boolean;
  questsCompleted: number;
  expGained: number;
}

export type AppScreen = 
  | 'awakening'
  | 'welcome'
  | 'assessment'
  | 'protocol-generating'
  | 'protocol-generated'
  | 'dashboard';

export interface RankRequirement {
  level: number;
  workouts: number;
  streak: number;
  statThreshold: number;
}

export const RANK_REQUIREMENTS: Record<Rank, RankRequirement> = {
  E: { level: 1, workouts: 0, streak: 0, statThreshold: 0 },
  D: { level: 1, workouts: 0, streak: 0, statThreshold: 10 },
  C: { level: 20, workouts: 100, streak: 14, statThreshold: 40 },
  B: { level: 40, workouts: 300, streak: 30, statThreshold: 70 },
  A: { level: 60, workouts: 500, streak: 60, statThreshold: 100 },
  S: { level: 80, workouts: 1000, streak: 100, statThreshold: 150 },
};

export const PILLAR_NAMES: Record<MovementPillar, string> = {
  push: 'Push (Empurrar)',
  pull: 'Pull (Puxar)',
  core: 'Core (Estabilidade)',
  legs: 'Legs (Inferiores)',
  mobility: 'Mobility (Flexibilidade)',
  endurance: 'Endurance (Resistência)',
};

export const ATHLETE_TIER_THRESHOLDS: { tier: AthleteTier; minLevel: number }[] = [
  { tier: 'Bronze', minLevel: 1 },
  { tier: 'Prata', minLevel: 21 },
  { tier: 'Ouro', minLevel: 51 },
  { tier: 'Platina', minLevel: 76 },
  { tier: 'Diamante', minLevel: 90 },
];

export const BASE_MOVEMENT_PROGRESS: Record<MovementPillar, MovementProgress> = {
  push: { pillar: 'push', level: 1, xp: 0, xpToNext: 100 },
  pull: { pillar: 'pull', level: 1, xp: 0, xpToNext: 100 },
  core: { pillar: 'core', level: 1, xp: 0, xpToNext: 100 },
  legs: { pillar: 'legs', level: 1, xp: 0, xpToNext: 100 },
  mobility: { pillar: 'mobility', level: 1, xp: 0, xpToNext: 100 },
  endurance: { pillar: 'endurance', level: 1, xp: 0, xpToNext: 100 },
};

export const STAT_COLORS: Record<keyof UserStats, string> = {
  push: '#ef4444',
  pull: '#22c55e',
  legs: '#eab308',
  core: '#3b82f6',
  endurance: '#8b5cf6',
  mobility: '#06b6d4',
};
