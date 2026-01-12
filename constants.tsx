
import { Rank, UserProfile, PillarStats } from './types';

export const INITIAL_USER: UserProfile = {
  name: "PLAYER",
  level: 1,
  xp: 0,
  rank: Rank.BRONZE, // E-RANK equivalent
  pillars: {
    push: 5,
    pull: 5,
    core: 5,
    legs: 5,
    mobility: 5,
    resistance: 5
  },
  debuffs: [],
  recoveryRate: 100,
  passiveSkills: [] // Empty start
};

export const RANK_COLORS = {
  [Rank.BRONZE]: '#b08d55',
  [Rank.SILVER]: '#c0c0c0',
  [Rank.GOLD]: '#ffd700',
  [Rank.PLATINUM]: '#00ffcc',
  [Rank.DIAMOND]: '#b9f2ff'
};

export const PILLAR_LABELS: Record<keyof PillarStats, string> = {
  push: 'PUSH STR',
  pull: 'PULL STR',
  core: 'CORE STABILITY',
  legs: 'LOWER BODY',
  mobility: 'FLEXIBILITY',
  resistance: 'STAMINA'
};
