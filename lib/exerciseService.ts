import type { Exercise, MovementPillar } from '@/types';

let exerciseCache: Exercise[] | null = null;
let indexByPillar: Record<string, Exercise[]> | null = null;
let indexById: Record<string, Exercise> | null = null;
let allEquipmentTypes: string[] | null = null;
let allMuscleGroups: string[] | null = null;

function buildIndexes(exercises: Exercise[]) {
  if (!indexByPillar) {
    indexByPillar = {};
    for (const ex of exercises) {
      const key = ex.pillar;
      if (!indexByPillar[key]) indexByPillar[key] = [];
      indexByPillar[key].push(ex);
    }
  }
  if (!indexById) {
    indexById = {};
    for (const ex of exercises) {
      indexById[ex.id] = ex;
    }
  }
}

// Async loader — call once at app start
export async function preloadExercises(): Promise<Exercise[]> {
  if (exerciseCache) return exerciseCache;
  const res = await fetch('/data/exercises.json');
  exerciseCache = await res.json();
  buildIndexes(exerciseCache!);
  return exerciseCache!;
}

// Sync access — returns cached data (empty array if not yet loaded)
export function getExercisesSync(): Exercise[] {
  return exerciseCache || [];
}

export function getExerciseByIdSync(id: string): Exercise | undefined {
  return indexById?.[id];
}

export function getExercisesByPillarSync(pillar: MovementPillar): Exercise[] {
  return indexByPillar?.[pillar] || [];
}

export function isExercisesLoaded(): boolean {
  return exerciseCache !== null;
}

export function getExercisesFilteredSync(options: {
  pillar?: MovementPillar;
  level?: number;
  muscle?: string;
  enabledEquipment?: string[];
}): Exercise[] {
  const exercises = getExercisesSync();
  return exercises.filter((ex) => {
    if (options.pillar && ex.pillar !== options.pillar) return false;
    if (options.level !== undefined && ex.level !== options.level) return false;
    if (options.muscle && ex.muscle !== options.muscle) return false;
    if (options.enabledEquipment) {
      const enabled = new Set(options.enabledEquipment);
      enabled.add('None'); // Bodyweight always available
      if (!ex.equipment.every((eq) => enabled.has(eq))) return false;
    }
    return true;
  });
}

export function getExercisesForQuestSync(
  pillar: MovementPillar,
  pillarLevel: number,
  enabledEquipment?: string[]
): Exercise[] {
  const maxLevel = Math.min(5, pillarLevel + 1);
  const exercises = getExercisesSync();
  return exercises.filter((ex) => {
    if (ex.pillar !== pillar) return false;
    if (ex.level > maxLevel) return false;
    if (enabledEquipment) {
      const enabled = new Set(enabledEquipment);
      enabled.add('None');
      if (!ex.equipment.every((eq) => enabled.has(eq))) return false;
    }
    return true;
  });
}

export function getAllEquipmentTypesSync(): string[] {
  if (allEquipmentTypes) return allEquipmentTypes;
  const exercises = getExercisesSync();
  if (exercises.length === 0) return [];
  const set = new Set<string>();
  for (const ex of exercises) {
    for (const eq of ex.equipment) {
      if (eq !== 'None') set.add(eq);
    }
  }
  allEquipmentTypes = Array.from(set).sort();
  return allEquipmentTypes;
}

export function getAllMuscleGroupsSync(): string[] {
  if (allMuscleGroups) return allMuscleGroups;
  const exercises = getExercisesSync();
  if (exercises.length === 0) return [];
  const set = new Set<string>();
  for (const ex of exercises) set.add(ex.muscle);
  allMuscleGroups = Array.from(set).sort();
  return allMuscleGroups;
}

export function getLevelsForPillar(exercises: Exercise[], pillar: MovementPillar): number[] {
  const levels = new Set<number>();
  for (const ex of exercises) {
    if (ex.pillar === pillar) levels.add(ex.level);
  }
  return Array.from(levels).sort((a, b) => a - b);
}

export function getMusclesForExercises(exercises: Exercise[]): string[] {
  const set = new Set<string>();
  for (const ex of exercises) set.add(ex.muscle);
  return Array.from(set).sort();
}
