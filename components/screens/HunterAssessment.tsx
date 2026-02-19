'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Target, 
  Activity, 
  ChevronRight, 
  ChevronLeft,
  Scale,
  Ruler,
  Calendar,
  Dumbbell,
  TrendingUp,
  TrendingDown,
  Minus,
  Play,
  Square,
  Timer,
  Key,
  Plus,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GlassPanel } from '@/components/ui/CyberFrame';
import { AssessmentChat } from '@/components/ui';
import { useAppStore } from '@/store/useAppStore';
import type {
  Objective,
  FitnessLevel,
  MovementPillar,
  PillarLevel,
  Equipment,
  EquipmentCategory,
  UserStats,
  RadarStats,
  Rank,
  UserSkill,
} from '@/types';
import { SKILL_DEFINITIONS } from '@/lib/skillDefinitions';
import { buildEquipmentCatalogFromNames, normalizeEquipmentCatalog } from '@/lib/equipmentCatalog';

interface AssessmentData {
  height: number;
  weight: number;
  age: number;
  objective: Objective | null;
  fitnessLevel: FitnessLevel | null;
  hasGymAccess: boolean | null;
  equipmentNotes: string;
  pushTest: number;
  pullTest: number;
  coreTest: number;
  legsTest: number;
  availableTime: number;
  trainingFrequency?: number;
}

const objectives: { value: Objective; label: string; icon: typeof TrendingUp; description: string }[] = [
  { value: 'lose-weight', label: 'Perder Peso', icon: TrendingDown, description: 'Queimar gordura e emagrecer' },
  { value: 'gain-muscle', label: 'Ganhar Músculo', icon: TrendingUp, description: 'Hipertrofia e força' },
  { value: 'maintain', label: 'Manter Forma', icon: Minus, description: 'Saúde e condicionamento' },
];

const fitnessLevels: { value: FitnessLevel; label: string; description: string }[] = [
  { value: 'beginner', label: 'Iniciante', description: 'Pouca ou nenhuma experiência' },
  { value: 'intermediate', label: 'Intermediário', description: '6 meses a 2 anos treinando' },
  { value: 'advanced', label: 'Avançado', description: 'Mais de 2 anos de treino' },
];


const parseEquipmentInput = (input: string) =>
  Array.from(
    new Set(
      input
        .split(/[\n,;]+/)
        .map((item) => item.trim())
        .filter(Boolean)
    )
  );

const EQUIPMENT_CATEGORIES: EquipmentCategory[] = [
  'free-weight',
  'barbell',
  'machine',
  'cable',
  'bodyweight',
  'cardio',
  'accessory',
  'other',
];

const parseEquipmentCategory = (value: unknown): EquipmentCategory | undefined => {
  if (typeof value !== 'string') return undefined;
  return EQUIPMENT_CATEGORIES.includes(value as EquipmentCategory)
    ? (value as EquipmentCategory)
    : undefined;
};

const buildAssessmentEquipmentCatalog = (aiCatalog: unknown, parsedEquipment: string[]): Equipment[] => {
  const aiItems = Array.isArray(aiCatalog)
    ? aiCatalog.map((item) => {
        if (!item || typeof item !== 'object') return {};
        const candidate = item as Record<string, unknown>;
        return {
          id: typeof candidate.id === 'string' ? candidate.id : undefined,
          name: typeof candidate.name === 'string' ? candidate.name : undefined,
          category: parseEquipmentCategory(candidate.category),
          notes: typeof candidate.notes === 'string' ? candidate.notes : undefined,
          enabledForAI:
            typeof candidate.enabledForAI === 'boolean' ? candidate.enabledForAI : true,
          source: 'assessment-ai' as const,
        };
      })
    : [];

  const normalized = normalizeEquipmentCatalog(aiItems, parsedEquipment);
  if (normalized.length > 0) return normalized;
  return buildEquipmentCatalogFromNames(parsedEquipment, 'assessment-ai');
};

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, Math.round(value)));

const getExperienceBonus = (fitnessLevel: FitnessLevel) => {
  if (fitnessLevel === 'advanced') return 8;
  if (fitnessLevel === 'intermediate') return 4;
  return 0;
};

const getFitnessStatCap = (fitnessLevel: FitnessLevel) => {
  if (fitnessLevel === 'advanced') return 90;
  if (fitnessLevel === 'intermediate') return 70;
  return 45;
};

const buildBaselineStats = (assessmentData: AssessmentData): UserStats => {
  const fitnessLevel = assessmentData.fitnessLevel || 'beginner';
  const expBonus = getExperienceBonus(fitnessLevel);
  const statCap = getFitnessStatCap(fitnessLevel);
  const push = clamp(6 + assessmentData.pushTest * 1.2 + expBonus, 5, statCap);
  const pull = clamp(5 + assessmentData.pullTest * 2.2 + expBonus, 5, statCap);
  const legs = clamp(8 + assessmentData.legsTest * 0.8 + expBonus, 5, statCap);
  const core = clamp(6 + assessmentData.coreTest * 0.35 + expBonus, 5, statCap);
  const endurance = clamp((legs + core) / 2, 5, statCap);
  const mobility = clamp(12 + expBonus * 0.8, 5, statCap);
  return { push, pull, legs, core, endurance, mobility };
};

const mergeAIStats = (baseline: UserStats, aiStats: any): UserStats => {
  const keys: Array<keyof UserStats> = ['push', 'pull', 'legs', 'core', 'endurance', 'mobility'];
  const merged = { ...baseline };
  for (const key of keys) {
    const aiValue = Number(aiStats?.[key]);
    if (!Number.isFinite(aiValue)) continue;
    const aiClamped = clamp(aiValue, 1, 100);
    const delta = Math.abs(aiClamped - baseline[key]);
    if (delta > 25) continue;
    merged[key] = clamp(baseline[key] * 0.75 + aiClamped * 0.25, 1, 100);
  }
  return merged;
};

const buildRadarFromStats = (stats: UserStats): RadarStats => ({
  force: clamp((stats.push + stats.legs) / 2, 1, 100),
  explosion: clamp((stats.push + stats.pull + stats.legs) / 3, 1, 100),
  resistance: clamp((stats.endurance + stats.core) / 2, 1, 100),
  mobility: clamp(stats.mobility, 1, 100),
  mechanics: clamp((stats.pull + stats.core + stats.mobility) / 3, 1, 100),
  coordination: clamp((stats.core + stats.mobility + stats.endurance) / 3, 1, 100),
});

const mergeAIRadar = (baseline: RadarStats, aiRadar: any): RadarStats => {
  const keys: Array<keyof RadarStats> = [
    'force',
    'explosion',
    'resistance',
    'mobility',
    'mechanics',
    'coordination',
  ];
  const merged = { ...baseline };
  for (const key of keys) {
    const aiValue = Number(aiRadar?.[key]);
    if (!Number.isFinite(aiValue)) continue;
    const aiClamped = clamp(aiValue, 1, 100);
    const delta = Math.abs(aiClamped - baseline[key]);
    if (delta > 25) continue;
    merged[key] = clamp(baseline[key] * 0.7 + aiClamped * 0.3, 1, 100);
  }
  return merged;
};

const parseRank = (value: unknown, fallback: Rank = 'E'): Rank => {
  if (value === 'E' || value === 'D' || value === 'C' || value === 'B' || value === 'A' || value === 'S') {
    return value;
  }
  return fallback;
};

const resolveFallbackRank = (fitnessLevel: FitnessLevel): Rank => {
  if (fitnessLevel === 'advanced') return 'C';
  if (fitnessLevel === 'intermediate') return 'D';
  return 'E';
};

const resolvePillarXpToNext = (level: number) => {
  if (level <= 0) return 100;
  return Math.max(100, Math.floor(150 * Math.pow(1.2, level)));
};

const determineStrengthPillarInitialLevel = (
  pillar: 'push' | 'pull' | 'core' | 'legs',
  performance: number,
  fitnessLevel: FitnessLevel
) => {
  const thresholds = {
    push: [12, 28, 45],
    pull: [4, 10, 18],
    core: [35, 80, 140],
    legs: [20, 45, 75],
  } as const;

  const [levelOneThreshold, levelTwoThreshold, levelThreeThreshold] = thresholds[pillar];
  let level = fitnessLevel === 'advanced' ? 1 : 0;

  if (performance >= levelOneThreshold) level = Math.max(level, 1);
  if (fitnessLevel !== 'beginner' && performance >= levelTwoThreshold) level = Math.max(level, 2);
  if (fitnessLevel === 'advanced' && performance >= levelThreeThreshold) level = Math.max(level, 3);

  return Math.max(0, Math.min(3, level));
};

const determineMobilityOrEnduranceLevel = (
  pillar: 'mobility' | 'endurance',
  assessmentData: AssessmentData
) => {
  const fitnessLevel = assessmentData.fitnessLevel || 'beginner';
  let level = fitnessLevel === 'beginner' ? 0 : fitnessLevel === 'intermediate' ? 1 : 2;

  const hasHighVolumeProfile =
    (assessmentData.availableTime || 45) >= 60 && (assessmentData.trainingFrequency || 3) >= 5;
  const hasStrongPerformanceSignal =
    pillar === 'mobility' ? assessmentData.coreTest >= 90 : assessmentData.legsTest >= 60;

  if (fitnessLevel !== 'beginner' && (hasHighVolumeProfile || hasStrongPerformanceSignal)) {
    level += 1;
  }

  return Math.max(0, Math.min(3, level));
};

const buildInitialPillarLevels = (
  assessmentData: AssessmentData
): Record<MovementPillar, PillarLevel> => {
  const fitnessLevel = assessmentData.fitnessLevel || 'beginner';
  const pushLevel = determineStrengthPillarInitialLevel('push', assessmentData.pushTest, fitnessLevel);
  const pullLevel = determineStrengthPillarInitialLevel('pull', assessmentData.pullTest, fitnessLevel);
  const coreLevel = determineStrengthPillarInitialLevel('core', assessmentData.coreTest, fitnessLevel);
  const legsLevel = determineStrengthPillarInitialLevel('legs', assessmentData.legsTest, fitnessLevel);
  const mobilityLevel = determineMobilityOrEnduranceLevel('mobility', assessmentData);
  const enduranceLevel = determineMobilityOrEnduranceLevel('endurance', assessmentData);

  return {
    push: {
      pillar: 'push',
      level: pushLevel,
      xp: 0,
      xpToNext: resolvePillarXpToNext(pushLevel),
      unlockedSkills: [],
    },
    pull: {
      pillar: 'pull',
      level: pullLevel,
      xp: 0,
      xpToNext: resolvePillarXpToNext(pullLevel),
      unlockedSkills: [],
    },
    core: {
      pillar: 'core',
      level: coreLevel,
      xp: 0,
      xpToNext: resolvePillarXpToNext(coreLevel),
      unlockedSkills: [],
    },
    legs: {
      pillar: 'legs',
      level: legsLevel,
      xp: 0,
      xpToNext: resolvePillarXpToNext(legsLevel),
      unlockedSkills: [],
    },
    mobility: {
      pillar: 'mobility',
      level: mobilityLevel,
      xp: 0,
      xpToNext: resolvePillarXpToNext(mobilityLevel),
      unlockedSkills: [],
    },
    endurance: {
      pillar: 'endurance',
      level: enduranceLevel,
      xp: 0,
      xpToNext: resolvePillarXpToNext(enduranceLevel),
      unlockedSkills: [],
    },
  };
};

const resolveCurrentLevelUnlockCount = (
  pillar: MovementPillar,
  level: number,
  assessmentData: AssessmentData
) => {
  const skillsInLevel = SKILL_DEFINITIONS[pillar]?.[level] || [];
  if (skillsInLevel.length === 0) return 0;

  const fitnessLevel = assessmentData.fitnessLevel || 'beginner';
  let count = level === 0 ? 2 : 3;
  if (fitnessLevel === 'intermediate') count += 1;
  if (fitnessLevel === 'advanced') count += 2;

  if (pillar === 'push' && assessmentData.pushTest >= 25) count += 1;
  if (pillar === 'pull' && assessmentData.pullTest >= 8) count += 1;
  if (pillar === 'core' && assessmentData.coreTest >= 60) count += 1;
  if (pillar === 'legs' && assessmentData.legsTest >= 35) count += 1;
  if ((pillar === 'mobility' || pillar === 'endurance') && (assessmentData.trainingFrequency || 3) >= 5) {
    count += 1;
  }

  return Math.max(2, Math.min(skillsInLevel.length, count));
};

const buildInitialUserSkills = (
  pillarLevels: Record<MovementPillar, PillarLevel>,
  assessmentData: AssessmentData
) => {
  const userSkills: Record<string, UserSkill> = {};

  for (const pillar of Object.keys(pillarLevels) as MovementPillar[]) {
    const levelData = pillarLevels[pillar];
    const unlockedIds: string[] = [];

    for (let level = 0; level <= levelData.level; level++) {
      const skillsForLevel = SKILL_DEFINITIONS[pillar]?.[level] || [];
      const unlockLimit =
        level < levelData.level
          ? skillsForLevel.length
          : resolveCurrentLevelUnlockCount(pillar, level, assessmentData);

      for (const skill of skillsForLevel.slice(0, unlockLimit)) {
        userSkills[skill.id] = {
          skillId: skill.id,
          unlocked: true,
          unlockedAt: new Date(),
          masteryLevel: 0,
        };
        unlockedIds.push(skill.id);
      }
    }

    levelData.unlockedSkills = Array.from(new Set(unlockedIds));
  }

  return userSkills;
};

function AssessmentTimer({ onFinish, label, defaultMode = 'stopwatch' }: { onFinish: (value: number) => void, label: string, defaultMode?: 'stopwatch' | 'counter' }) {
  const [isActive, setIsActive] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [showTimer, setShowTimer] = useState(false);
  const [manualValue, setManualValue] = useState("");

  useEffect(() => {
    let interval: any = null;
    if (isActive) {
      interval = setInterval(() => {
        setSeconds(prev => prev + 1);
      }, 1000);
    } else if (!isActive && seconds !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, seconds]);

  const handleConfirm = () => {
    if(manualValue) {
        onFinish(parseInt(manualValue));
    } else if (seconds > 0) {
        onFinish(seconds);
    }
  };

  if(!showTimer) {
      return (
          <div className="flex flex-col gap-4">
               <div className="flex items-center justify-between bg-shadow-800 border-2 border-white/10 rounded-2xl p-2 transition-all focus-within:border-neon-blue hover:border-white/20 group">
                    {/* Decrement Button - Only in Counter Mode */}
                    {defaultMode === 'counter' && (
                        <button 
                            onClick={() => setManualValue(prev => String(Math.max(0, (parseInt(prev) || 0) - 1)))}
                            className="w-20 h-20 flex items-center justify-center text-white/20 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all active:scale-95"
                        >
                            <Minus className="w-8 h-8" />
                        </button>
                    )}

                    <div className="relative flex-1 flex flex-col items-center justify-center">
                        <input 
                            type="number" 
                            value={manualValue}
                            onChange={(e) => setManualValue(e.target.value)}
                            placeholder="0"
                            onKeyDown={(e) => e.key === 'Enter' && manualValue && onFinish(parseInt(manualValue))}
                            className="w-full bg-transparent border-none p-2 text-center text-6xl text-neon-blue font-mono focus:ring-0 focus:outline-none placeholder:text-white/5 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            autoFocus
                        />
                        <span className="text-white/30 text-xs font-display tracking-[0.2em]">
                            {defaultMode === 'stopwatch' ? 'SEGUNDOS' : 'REPETIÇÕES'}
                        </span>
                    </div>

                    {/* Increment Button - Only in Counter Mode */}
                    {defaultMode === 'counter' && (
                        <button 
                            onClick={() => setManualValue(prev => String((parseInt(prev) || 0) + 1))}
                            className="w-20 h-20 flex items-center justify-center text-white/20 hover:text-neon-blue hover:bg-neon-blue/10 rounded-xl transition-all active:scale-95"
                        >
                            <Plus className="w-8 h-8" />
                        </button>
                    )}
               </div>

               <div className="flex gap-4">
                  {defaultMode === 'stopwatch' && (
                  <Button 
                    variant="outline" 
                    className="flex-1 py-6 border-white/10 hover:bg-white/5"
                    onClick={() => setShowTimer(true)}
                  >
                    <Timer className="w-4 h-4 mr-2" />
                    USAR CRONÔMETRO
                  </Button>
                  )}
                  
                  <Button 
                    variant="cyber" 
                    className="flex-1 py-6 text-lg"
                    onClick={() => manualValue && onFinish(parseInt(manualValue))}
                    disabled={!manualValue}
                  >
                    CONFIRMAR
                  </Button>
               </div>
          </div>
      )
  }

  return (
    <div className="flex flex-col items-center gap-6 py-6 border border-white/10 rounded-lg bg-shadow-800/50">
        <div className="w-40 h-40 rounded-full border-4 border-neon-blue flex items-center justify-center relative shadow-[0_0_30px_rgba(0,212,255,0.3)] bg-shadow-950">
             <span className="font-mono text-4xl text-white font-bold tracking-wider">
                {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, '0')}
             </span>
             {isActive && (
                <div className="absolute inset-0 rounded-full border-4 border-white animate-ping opacity-20" />
            )}
        </div>
        
        <div className="flex gap-4 w-full px-8">
            <Button 
                onClick={() => setIsActive(!isActive)}
                className={`flex-1 ${isActive ? 'bg-red-500 hover:bg-red-600' : 'bg-neon-blue hover:bg-neon-blue/80'}`}
            >
                {isActive ? <><Square className="w-4 h-4 mr-2"/> PAUSAR</> : <><Play className="w-4 h-4 mr-2"/> INICIAR</>}
            </Button>
        </div>

        <div className="flex gap-4 w-full px-8">
            <Button variant="ghost" onClick={() => setShowTimer(false)} className="flex-1 text-white/40">
                Voltar
            </Button>
            <Button variant="outline" className="flex-1 border-neon-blue/50 text-neon-blue hover:bg-neon-blue/10"
                onClick={() => onFinish(seconds)}
                disabled={seconds === 0}
            >
                Confirmar Tempo
            </Button>
        </div>
    </div>
  );
}

export function HunterAssessment() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<AssessmentData>({
    height: 170,
    weight: 70,
    age: 25,
    objective: 'gain-muscle', // Defaulted, hidden from user
    fitnessLevel: null,
    hasGymAccess: null,
    equipmentNotes: '',
    pushTest: 0,
    pullTest: 0,
    coreTest: 0,
    legsTest: 0,
    availableTime: 45, // Default 45 mins
    trainingFrequency: 3, // Default 3 days/week
  });
  const [testFeedback, setTestFeedback] = useState('');
  const [bioInfo, setBioInfo] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  
  // API Key handling
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [tempApiKey, setTempApiKey] = useState('');
  
  const geminiApiKey = useAppStore((state) => state.geminiApiKey);
  const setGeminiApiKey = useAppStore((state) => state.setGeminiApiKey);
  const setAvailableEquipment = useAppStore((state) => state.setAvailableEquipment);

  const setScreen = useAppStore((state) => state.setScreen);
  const initializeUser = useAppStore((state) => state.initializeUser);

  // Extended steps for individual exercises
  // 0: Data
  // 1: Experience
  // 2: Gym + Equipment
  // 3: Time Availability
  // 4: Pushups
  // 5: Pullups
  // 6: Squats
  // 7: Plank
  // 8: Chat
  const totalSteps = 9;

  const handleNext = () => {
    if (step < totalSteps - 1) {
      // Before entering Chat (Step 8), ensure API Key
      if (step === 7 && !geminiApiKey) {
          setShowApiKeyModal(true);
          return;
      }
      setStep(step + 1);
    } else {
      // Complete assessment
      handleComplete();
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const saveApiKeyAndRetry = () => {
      if(tempApiKey.trim()) {
          setGeminiApiKey(tempApiKey.trim());
          setShowApiKeyModal(false);
          
          // Only retry submission if we are at the final step (Chat/Bio) or later
          // Step 7 is the Chat.
          if (step === totalSteps - 1) {
              handleComplete(undefined, tempApiKey.trim());
          }
      }
  };

  const handleComplete = async (overrideBio?: string, overrideKey?: string) => {
    const finalBio = overrideBio ?? bioInfo;
    const activeKey = overrideKey || geminiApiKey;
    const parsedEquipment = parseEquipmentInput(data.equipmentNotes);
    setAvailableEquipment(parsedEquipment);

    if (!activeKey) {
        setShowApiKeyModal(true);
        return;
    }

    if (!data.fitnessLevel) {
       // Fallback logic
       console.error("Missing Data");
       const fallbackData: AssessmentData = { ...data, fitnessLevel: 'beginner' };
       const fallbackPillarLevels = buildInitialPillarLevels(fallbackData);
       const fallbackUserSkills = buildInitialUserSkills(fallbackPillarLevels, fallbackData);
       const fallbackStats = buildBaselineStats(fallbackData);
       const fallbackEquipmentCatalog = buildEquipmentCatalogFromNames(parsedEquipment, 'assessment-ai');

       initializeUser({
         name: sessionStorage.getItem('tempHunterName') || 'User',
         rank: resolveFallbackRank('beginner'),
         height: data.height,
         weight: data.weight,
         age: data.age,
         objective: 'gain-muscle',
         fitnessLevel: 'beginner',
         stats: fallbackStats,
         radarStats: buildRadarFromStats(fallbackStats),
         pillarLevels: fallbackPillarLevels,
         userSkills: fallbackUserSkills,
         hasGymAccess: data.hasGymAccess ?? false,
         availableEquipment: parsedEquipment,
         equipmentCatalog: fallbackEquipmentCatalog,
         availableTime: data.availableTime,
         trainingFrequency: data.trainingFrequency
       });
       setScreen('protocol-generating');
       return;
    }

    const fallbackFitnessLevel = data.fitnessLevel;
    const fallbackRank = resolveFallbackRank(fallbackFitnessLevel);
    const fallbackStats = buildBaselineStats(data);
    const fallbackRadarStats = buildRadarFromStats(fallbackStats);
    const fallbackPillarLevels = buildInitialPillarLevels(data);
    const fallbackUserSkills = buildInitialUserSkills(fallbackPillarLevels, data);
    const fallbackEquipmentCatalog = buildEquipmentCatalogFromNames(parsedEquipment, 'assessment-ai');

    setIsSyncing(true);

    try {
      const prompt = `
      DADOS FISICOS:
      Altura: ${data.height}cm, Peso: ${data.weight}kg, Idade: ${data.age}
      Objetivo: PROGRESSAO DE MOVIMENTO FUNCIONAL (Strength/Skill)
      Tempo Disponivel Diario: ${data.availableTime} minutos
      Frequencia Semanal: ${data.trainingFrequency || 3} dias/semana
      Experiencia: ${data.fitnessLevel}

      TESTE FISICO (Performance):
      Push (Flexao): ${data.pushTest} reps
      Pull (Barra): ${data.pullTest} reps
      Legs (Agachamento): ${data.legsTest} reps
      Core (Prancha): ${data.coreTest} segundos

      EQUIPAMENTOS DISPONIVEIS INFORMADOS PELO USUARIO:
      ${parsedEquipment.length ? parsedEquipment.join(', ') : 'nenhum'}

      RELATO DO USUARIO (Sensacoes/Tecnica):
      "${testFeedback}"

      INFORMACOES ADICIONAIS (Bio/Historico):
      "${finalBio}"

      IMPORTANTE:
      - Analise o texto acima em busca de lesoes, dores ou limitacoes. Se encontrar (ex: dor no ombro), gere debuffs.
      - Gere equipmentCatalog normalizado com os equipamentos informados.
      - Categorias permitidas: free-weight, barbell, machine, cable, bodyweight, cardio, accessory e other.
      - Marque enabledForAI=true para equipamentos realmente utilizaveis.
      `;

      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt, 
          apiKey: activeKey, 
          intent: 'assessment'
        }),
      });

      const result = await response.json();
      const assessment = JSON.parse(result.response);
      const equipmentCatalog = buildAssessmentEquipmentCatalog(
        assessment?.equipmentCatalog,
        parsedEquipment
      );
      const calibratedStats = mergeAIStats(fallbackStats, assessment?.stats);
      const baselineRadarFromCalibratedStats = buildRadarFromStats(calibratedStats);
      const calibratedRadar = mergeAIRadar(baselineRadarFromCalibratedStats, assessment?.radarStats);
      const resolvedRank = parseRank(assessment?.rank, fallbackRank);

      initializeUser({
        name: sessionStorage.getItem('tempHunterName') || 'User',
        rank: resolvedRank,
        height: data.height,
        weight: data.weight,
        age: data.age,
        objective: data.objective!,
        fitnessLevel: data.fitnessLevel!,
        stats: calibratedStats,
        radarStats: calibratedRadar,
        pillarLevels: fallbackPillarLevels,
        userSkills: fallbackUserSkills,
        hasGymAccess: data.hasGymAccess!,
        availableEquipment: parsedEquipment,
        equipmentCatalog,
        bioData: assessment.bioSummary,
        availableTime: data.availableTime,
        trainingFrequency: data.trainingFrequency,
        debuffs: (assessment.debuffs || []).map((d: any, i: number) => ({
             id: `debuff-${Date.now()}-${i}`,
             name: d.name,
             description: d.description,
             icon: 'AlertTriangle', // Defaulting icon string, component will map later
             affectedExercises: d.affectedExercises || []
        }))
      });

    } catch (error) {
      console.error("Gemini Assessment Failed", error);
      initializeUser({
         name: sessionStorage.getItem('tempHunterName') || 'User',
         rank: fallbackRank,
         height: data.height,
         weight: data.weight,
         age: data.age,
         objective: data.objective!,
         fitnessLevel: data.fitnessLevel!,
         stats: fallbackStats,
         radarStats: fallbackRadarStats,
         pillarLevels: fallbackPillarLevels,
         userSkills: fallbackUserSkills,
         hasGymAccess: data.hasGymAccess ?? false,
         availableEquipment: parsedEquipment,
         equipmentCatalog: fallbackEquipmentCatalog,
         availableTime: data.availableTime,
         trainingFrequency: data.trainingFrequency,
         debuffs: []
       });
    } finally {
      setIsSyncing(false);
      setScreen('protocol-generating');
    }
  };

  const canProceed = () => {
    switch (step) {
      case 0:
        return data.height > 0 && data.weight > 0 && data.age > 0;
      case 1: // Fitness Level
        return data.fitnessLevel !== null;
      case 2: // Gym Access
        return data.hasGymAccess !== null;
      case 3: // Available Time
        return data.availableTime >= 10;
      case 4: // Pushups
        return data.pushTest > 0;
      case 5: // Pullups
        return true; 
      case 6: // Squats
        return data.legsTest > 0;
      case 7: // Core
        return data.coreTest > 0;
      case 8: // Chat
        return true; 
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Decorative frame */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-4 left-4 right-4 h-1 bg-gradient-to-r from-transparent via-neon-blue/40 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4 h-1 bg-gradient-to-r from-transparent via-neon-blue/40 to-transparent" />
        <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-neon-blue/40" />
        <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-neon-blue/40" />
        <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-neon-blue/40" />
        <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-neon-blue/40" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-neon-blue/10 border border-neon-blue/30 mb-4">
            <Activity className="w-4 h-4 text-neon-blue" />
            <span className="text-neon-blue font-mono text-sm">ASSESSMENT</span>
          </div>
          <h1 className="font-display text-3xl font-bold gradient-text mb-2">
            AVALIAÇÃO FÍSICA
          </h1>
          <p className="text-white/60">Etapa {step + 1} de {totalSteps}</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="h-1 bg-shadow-700 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-neon-blue to-neon-cyan"
              initial={{ width: 0 }}
              animate={{ width: `${((step + 1) / totalSteps) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Content */}
        <GlassPanel className="p-6 mb-6">
          <AnimatePresence mode="wait">
            {/* Step 0: Physical Data */}
            {step === 0 && (
              <motion.div
                key="step-0"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center mb-6">
                  <User className="w-12 h-12 mx-auto text-neon-blue mb-2" />
                  <h2 className="font-display text-xl text-white">DADOS FÍSICOS</h2>
                </div>

                {/* Height */}
                <div>
                  <label className="flex items-center gap-2 text-white/60 text-sm mb-2">
                    <Ruler className="w-4 h-4" />
                    Altura (cm)
                  </label>
                  <input
                    type="number"
                    value={data.height}
                    onChange={(e) => setData({ ...data, height: Number(e.target.value) })}
                    className="w-full px-4 py-3 bg-shadow-800 border border-white/10 text-white font-mono text-lg focus:border-neon-blue focus:outline-none transition-colors"
                  />
                </div>

                {/* Weight */}
                <div>
                  <label className="flex items-center gap-2 text-white/60 text-sm mb-2">
                    <Scale className="w-4 h-4" />
                    Peso (kg)
                  </label>
                  <input
                    type="number"
                    value={data.weight}
                    onChange={(e) => setData({ ...data, weight: Number(e.target.value) })}
                    className="w-full px-4 py-3 bg-shadow-800 border border-white/10 text-white font-mono text-lg focus:border-neon-blue focus:outline-none transition-colors"
                  />
                </div>

                {/* Age */}
                <div>
                  <label className="flex items-center gap-2 text-white/60 text-sm mb-2">
                    <Calendar className="w-4 h-4" />
                    Idade
                  </label>
                  <input
                    type="number"
                    value={data.age}
                    onChange={(e) => setData({ ...data, age: Number(e.target.value) })}
                    className="w-full px-4 py-3 bg-shadow-800 border border-white/10 text-white font-mono text-lg focus:border-neon-blue focus:outline-none transition-colors"
                  />
                </div>
              </motion.div>
            )}

            {/* Step 1: Fitness Level */}
            {step === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="text-center mb-6">
                  <Dumbbell className="w-12 h-12 mx-auto text-neon-blue mb-2" />
                  <h2 className="font-display text-xl text-white">NÍVEL DE EXPERIÊNCIA</h2>
                  <p className="text-white/40 text-sm">Qual seu nível atual de treino?</p>
                </div>

                {fitnessLevels.map((level) => (
                  <motion.button
                    key={level.value}
                    onClick={() => setData({ ...data, fitnessLevel: level.value })}
                    className={`w-full p-4 border-2 transition-all text-left ${
                      data.fitnessLevel === level.value
                        ? 'border-neon-blue bg-neon-blue/10'
                        : 'border-white/10 bg-shadow-800 hover:border-white/20'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <h3 className={`font-display text-lg ${
                      data.fitnessLevel === level.value ? 'text-neon-blue' : 'text-white'
                    }`}>{level.label}</h3>
                    <p className="text-white/40 text-sm">{level.description}</p>
                  </motion.button>
                ))}
              </motion.div>
            )}

            {/* Step 2: Gym Access */}
            {step === 2 && (
              <motion.div
                key="step-2-gym"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="text-center mb-6">
                  <Dumbbell className="w-12 h-12 mx-auto text-neon-blue mb-2" />
                  <h2 className="font-display text-xl text-white">ACESSO À ACADEMIA</h2>
                  <p className="text-white/40 text-sm">Você tem acesso a equipamentos de academia?</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <motion.button
                    onClick={() => setData({ ...data, hasGymAccess: true })}
                    className={`p-6 border-2 transition-all text-center ${
                      data.hasGymAccess === true
                        ? 'border-neon-blue bg-neon-blue/10'
                        : 'border-white/10 bg-shadow-800 hover:border-white/20'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Dumbbell className="w-8 h-8 mx-auto mb-2 text-green-400" />
                    <h3 className={`font-display text-lg ${
                      data.hasGymAccess === true ? 'text-neon-blue' : 'text-white'
                    }`}>Sim</h3>
                    <p className="text-white/40 text-sm">Tenho acesso completo</p>
                  </motion.button>

                  <motion.button
                    onClick={() => setData({ ...data, hasGymAccess: false })}
                    className={`p-6 border-2 transition-all text-center ${
                      data.hasGymAccess === false
                        ? 'border-neon-blue bg-neon-blue/10'
                        : 'border-white/10 bg-shadow-800 hover:border-white/20'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <User className="w-8 h-8 mx-auto mb-2 text-orange-400" />
                    <h3 className={`font-display text-lg ${
                      data.hasGymAccess === false ? 'text-neon-blue' : 'text-white'
                    }`}>Não</h3>
                    <p className="text-white/40 text-sm">Calistenia apenas</p>
                  </motion.button>
                </div>

                <div className="mt-2">
                  <label className="block text-white/60 text-sm mb-2">
                    Liste os equipamentos que voce realmente tem (separados por virgula)
                  </label>
                  <textarea
                    value={data.equipmentNotes}
                    onChange={(e) => setData({ ...data, equipmentNotes: e.target.value })}
                    placeholder="Ex: halteres, barra, anilhas, banco, roldana, kettlebell"
                    className="w-full min-h-24 px-4 py-3 bg-shadow-800 border border-white/10 text-white text-sm focus:border-neon-blue focus:outline-none transition-colors resize-y"
                  />
                </div>
              </motion.div>
            )}

            {/* Step 3: Available Time */}
            {step === 3 && (
              <motion.div
                key="step-2-time"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                 <div className="text-center mb-6">
                  <Clock className="w-12 h-12 mx-auto text-neon-blue mb-2" />
                  <h2 className="font-display text-xl text-white">DISPONIBILIDADE</h2>
                  <p className="text-white/40 text-sm max-w-xs mx-auto">
                    Quanto tempo você pode dedicar aos treinos diariamente?
                  </p>
                </div>

                <div className="flex flex-col gap-4">
                     <div className="bg-shadow-800 border-2 border-white/10 p-6 rounded-lg text-center">
                         <span className="text-6xl font-mono text-neon-blue font-bold">{data.availableTime}</span>
                         <span className="text-white/40 text-sm block mt-2">MINUTOS / DIA</span>
                     </div>
                     
                     <div className="grid grid-cols-3 gap-3">
                        {[15, 30, 45, 60, 90, 120].map(time => (
                             <Button
                                key={time}
                                variant={data.availableTime === time ? "cyber" : "outline"}
                                className={data.availableTime === time ? "" : "border-white/10 hover:bg-white/5"}
                                onClick={() => setData({ ...data, availableTime: time })}
                             >
                                 {time} min
                             </Button>
                        ))}
                     </div>

                     <div className="mt-8 pt-8 border-t border-white/10">
                        <h3 className="text-center font-display text-white mb-4">FREQUÊNCIA SEMANAL</h3>
                        <div className="bg-shadow-800 border-2 border-white/10 p-4 rounded-lg text-center mb-4">
                             <span className="text-4xl font-mono text-neon-blue font-bold">{data.trainingFrequency || 3}x</span>
                             <span className="text-white/40 text-sm block mt-1">POR SEMANA</span>
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                            {[2, 3, 4, 5, 6, 7].map(freq => (
                                <Button
                                    key={freq}
                                    variant={data.trainingFrequency === freq ? "cyber" : "outline"}
                                    className={data.trainingFrequency === freq ? "" : "border-white/10 hover:bg-white/5"}
                                    onClick={() => setData({ ...data, trainingFrequency: freq })}
                                >
                                    {freq}x
                                </Button>
                            ))}
                        </div>
                     </div>
                </div>
              </motion.div>
            )}

            {/* Step 4: Push Ups */}
            {step === 4 && (
              <motion.div
                key="step-3-push"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                 <div className="text-center mb-6">
                  <Activity className="w-12 h-12 mx-auto text-red-400 mb-2" />
                  <h2 className="font-display text-xl text-white">TESTE DE FORÇA - PUSH</h2>
                  <p className="text-white/40 text-sm max-w-xs mx-auto">
                    Realize o máximo de <strong className='text-neon-blue'>flexões</strong> que aguentar com boa forma técnica.
                  </p>
                </div>

                <AssessmentTimer 
                    label="Flexões" 
                    defaultMode="counter"
                    onFinish={(val) => {
                        setData({ ...data, pushTest: val });
                        handleNext();
                    }} 
                />
              </motion.div>
            )}

            {/* Step 5: Pull Ups */}
            {step === 5 && (
              <motion.div
                key="step-4-pull"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                 <div className="text-center mb-6">
                  <Activity className="w-12 h-12 mx-auto text-yellow-400 mb-2" />
                  <h2 className="font-display text-xl text-white">TESTE DE FORÇA - PULL</h2>
                  <p className="text-white/40 text-sm max-w-xs mx-auto">
                    Realize o máximo de <strong className='text-neon-blue'>barras fixas</strong>. Se não conseguir nenhuma, utilize elástico ou faça remadas.
                  </p>
                </div>



                <AssessmentTimer 
                    label="Barra Fixa" 
                    defaultMode="counter"
                    onFinish={(val) => {
                         setData({ ...data, pullTest: val });
                         handleNext();
                    }} 
                />
                 <div className='text-center'>
                    <Button variant="ghost" className="text-xs text-white/30 hover:text-white" onClick={() => {
                        setData({ ...data, pullTest: 0 });
                        handleNext();
                    }}>
                        Não consigo fazer nenhuma (Pular)
                    </Button>
                </div>
              </motion.div>
            )}

            {/* Step 6: Squats */}
            {step === 6 && (
              <motion.div
                key="step-5-legs"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                 <div className="text-center mb-6">
                  <Activity className="w-12 h-12 mx-auto text-blue-400 mb-2" />
                  <h2 className="font-display text-xl text-white">TESTE DE PERNAS</h2>
                  <p className="text-white/40 text-sm max-w-xs mx-auto">
                    Agachamentos libres (Air Squats) até a falha ou perda de técnica.
                  </p>
                </div>

                <AssessmentTimer 
                    label="Agachamento" 
                    defaultMode="counter"
                    onFinish={(val) => {
                        setData({ ...data, legsTest: val });
                        handleNext();
                    }} 
                />
              </motion.div>
            )}

            {/* Step 7: Core */}
            {step === 7 && (
              <motion.div
                key="step-6-core"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                 <div className="text-center mb-6">
                  <Activity className="w-12 h-12 mx-auto text-green-400 mb-2" />
                  <h2 className="font-display text-xl text-white">TESTE DE RESISTÊNCIA</h2>
                  <p className="text-white/40 text-sm max-w-xs mx-auto">
                    Fique na posição de <strong className='text-neon-blue'>Prancha (Plank)</strong> o máximo de tempo possível.
                  </p>
                </div>

                <AssessmentTimer 
                    label="Prancha" 
                    defaultMode="stopwatch"
                    onFinish={(val) => {
                         setData({ ...data, coreTest: val });
                         handleNext();
                    }} 
                />
              </motion.div>
            )}

            {/* Step 8: Reviews (Chat Interactive) */}
            {step === 8 && (
              <motion.div
                key="step-7-chat"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center mb-6">
                  <User className="w-12 h-12 mx-auto text-neon-blue mb-2" />
                  <h2 className="font-display text-xl text-white">CALIBRAÇÃO DE PERFIL</h2>
                  <p className="text-white/40 text-sm">Entrevista com o Núcleo</p>
                </div>

                <div className="bg-shadow-800 rounded-lg p-1 border border-neon-blue/20">
                    <AssessmentChat 
                        context={data}
                        onComplete={(chatSummary) => {
                            setBioInfo(chatSummary);
                            handleComplete(chatSummary); 
                        }} 
                    />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </GlassPanel>

        {/* Syncing Overlay */}
        {isSyncing && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-50 backdrop-blur-sm">
             <div className="w-16 h-16 border-4 border-neon-blue border-t-transparent rounded-full animate-spin mb-4" />
             <h2 className="text-neon-blue font-display text-xl animate-pulse">SINCRONIZANDO NÚCLEO...</h2>
             <p className="text-white/50 text-sm mt-2">Processando Análise Biomecânica</p>
          </div>
        )}

        {/* Navigation */}

        {/* Navigation */}
        <div className="flex gap-4">
          {step > 0 && (
            <Button
              variant="outline"
              onClick={handleBack}
              className="flex-1"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          )}
          <Button
            variant="cyber"
            onClick={handleNext}
            disabled={!canProceed()}
            className="flex-1"
          >
            {step === totalSteps - 1 ? 'Completar' : 'Continuar'}
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </motion.div>

      {/* API Key Modal */}
      <AnimatePresence>
        {showApiKeyModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                <GlassPanel className="w-full max-w-md p-6 border-neon-blue/50 box-glow">
                    <div className="flex items-center gap-4 mb-4">
                         <div className="w-10 h-10 rounded border border-neon-blue/30 flex items-center justify-center bg-neon-blue/10">
                            <Key className="w-5 h-5 text-neon-blue" />
                         </div>
                         <div>
                             <h3 className="font-display text-white text-lg">CONFIGURAÇÃO DE ACESSO</h3>
                             <p className="text-white/40 text-sm">Chave de Api Requerida</p>
                         </div>
                    </div>
                    
                    <p className="text-white/70 text-sm mb-4">
                        Para processar sua avaliação física e gerar seu protocolo APEXSYS, o sistema precisa de acesso ao núcleo Gemini IA.
                    </p>

                    <input 
                        type="password"
                        placeholder="Cole sua API Key aqui (começa com AIza...)"
                        value={tempApiKey}
                        onChange={(e) => setTempApiKey(e.target.value)}
                        className="w-full bg-shadow-800 border border-white/10 p-3 rounded text-white font-mono text-sm mb-6 focus:border-neon-blue focus:outline-none"
                    />

                    <div className="flex gap-4">
                        <Button variant="outline" onClick={() => setShowApiKeyModal(false)} className="flex-1">
                            Cancelar
                        </Button>
                        <Button variant="cyber" onClick={saveApiKeyAndRetry} disabled={!tempApiKey.trim()} className="flex-1">
                            Conectar Núcleo
                        </Button>
                    </div>
                </GlassPanel>
            </div>
        )}
      </AnimatePresence>
    </div>
  );
}

