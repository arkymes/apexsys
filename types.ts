
export enum Rank {
  BRONZE = 'BRONZE',
  SILVER = 'SILVER',
  GOLD = 'GOLD',
  PLATINUM = 'PLATINUM',
  DIAMOND = 'DIAMOND'
}

export interface PillarStats {
  push: number;
  pull: number;
  core: number;
  legs: number;
  mobility: number;
  resistance: number;
}

export interface Exercise {
  id: string;
  name: string;
  pillar: keyof PillarStats;
  reps: number;
  sets: number;
  notes?: string;
}

export interface WorkoutSession {
  id: string;
  date: string;
  exercises: Exercise[];
  status: 'pending' | 'active' | 'completed';
}

export interface Debuff {
  type: string;
  location: string;
  severity: 'low' | 'medium' | 'high';
}

export interface UserProfile {
  name: string;
  level: number;
  xp: number;
  rank: Rank;
  pillars: PillarStats;
  debuffs: Debuff[];
  recoveryRate: number; // 0-100%
  passiveSkills: string[];
}

export type AppView = 'DASHBOARD' | 'TRAINING' | 'STATUS' | 'LOG';
