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
  passiveSkills: string[];
  pillarLevels: Record<MovementPillar, PillarLevel>; // Novo sistema de níveis por pilar
  userSkills: Record<string, UserSkill>; // Skills desbloqueadas e progresso
  customSkills?: Record<MovementPillar, SkillDefinition[]>;
  skillConstraints?: Record<string, SkillConstraint>;
  hasGymAccess?: boolean;
  availableEquipment?: string[];
  geminiApiKey?: string | null;
  bioData?: string; // Additional info from onboarding
  availableTime?: number; // Minutes per day
  trainingFrequency?: number; // Days per week
}

export interface Quest {
  id: string;
  name: string;
  description: string;
  executionGuide?: string;
  skillId?: string;
  skillLevel?: number;
  skillTags?: string[];
  skillReason?: string;
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

export interface SkillDefinition {
  id: string;
  name: string;
  description: string;
  pillar: MovementPillar;
  level: number; // 0-4 (5 níveis)
  skillIndex: number; // 0-4 (5 skills por nível)
  requirements: {
    pillarLevel: number; // nível mínimo do pilar necessário
    description: string;
  };
  benefits: string[];
  icon: string;
  tags?: string[];
  clinicalReason?: string;
  source?: 'core' | 'adaptive-ai' | 'assessment-ai' | 'gym-variant' | 'user';
}

export interface UserSkill {
  skillId: string;
  unlocked: boolean;
  unlockedAt?: Date;
  masteryLevel: number; // XP acumulado da skill (0-500)
}

export interface SkillConstraint {
  skillId: string;
  status: 'active' | 'disabled';
  reason: string;
  condition?: string;
  tags?: string[];
  updatedAt?: Date;
}

export interface PillarLevel {
  pillar: MovementPillar;
  level: number; // 0-4 (5 níveis)
  xp: number;
  xpToNext: number;
  unlockedSkills: string[]; // IDs das skills desbloqueadas
  currentSkillFocus?: string; // Skill que está treinando atualmente
}

export interface LevelUpChallenge {
  id: string;
  pillar: MovementPillar;
  fromLevel: number;
  toLevel: number;
  challenge: {
    name: string;
    description: string;
    requirements: string[];
    timeLimit?: number; // em minutos
  };
  rewards: {
    xpBonus: number;
    skillUnlocks: string[];
  };
  risk: {
    xpPenalty: number; // XP perdido se falhar
    debuffChance: number; // chance de debuff temporário
  };
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
  passiveSkills: string[];
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
  passiveSkills: string[];
  athleteTier: AthleteTier;
  movementProgress: Record<MovementPillar, MovementProgress>;
}

export type EquipmentCategory =
  | 'free-weight'
  | 'barbell'
  | 'machine'
  | 'cable'
  | 'bodyweight'
  | 'cardio'
  | 'accessory'
  | 'other';

export interface Equipment {
  id: string;
  name: string;
  category?: EquipmentCategory;
  notes?: string;
  enabledForAI?: boolean;
  source?: 'assessment-ai' | 'user' | 'system';
  // Legacy fields kept optional for backward compatibility with older persisted data.
  slot?: 'weapon' | 'head' | 'chest' | 'hands' | 'accessory' | 'boots';
  icon?: string;
  bonus?: string;
  equipped?: boolean;
}

export interface CompletedTrainingQuest {
  questId: string;
  name: string;
  pillar: MovementPillar;
  skillId?: string;
  skillLevel?: number;
  skillTags?: string[];
  skillReason?: string;
  sets: number;
  reps: number | string;
  xpReward: number;
  completedAt?: Date;
}

export interface TrainingDay {
  date: Date;
  completed: boolean;
  questsCompleted: number;
  expGained: number;
  completedQuests?: CompletedTrainingQuest[];
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

export const BASE_PILLAR_LEVELS: Record<MovementPillar, PillarLevel> = {
  push: { pillar: 'push', level: 0, xp: 0, xpToNext: 100, unlockedSkills: [] },
  pull: { pillar: 'pull', level: 0, xp: 0, xpToNext: 100, unlockedSkills: [] },
  core: { pillar: 'core', level: 0, xp: 0, xpToNext: 100, unlockedSkills: [] },
  legs: { pillar: 'legs', level: 0, xp: 0, xpToNext: 100, unlockedSkills: [] },
  mobility: { pillar: 'mobility', level: 0, xp: 0, xpToNext: 100, unlockedSkills: [] },
  endurance: { pillar: 'endurance', level: 0, xp: 0, xpToNext: 100, unlockedSkills: [] },
};

export const STAT_COLORS: Record<keyof UserStats, string> = {
  push: '#ef4444',
  pull: '#22c55e',
  legs: '#eab308',
  core: '#3b82f6',
  endurance: '#8b5cf6',
  mobility: '#06b6d4',
};
