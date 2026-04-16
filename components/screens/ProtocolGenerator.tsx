'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle2, Scroll, Crown, ArrowRight } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import type { Quest, MovementPillar, Exercise } from '@/types';
import { EXERCISE_XP_BY_LEVEL } from '@/types';
import { getExercisesForQuestSync, getExerciseByIdSync, isExercisesLoaded } from '@/lib/exerciseService';
import { sanitizeText } from '@/lib/textSanitizer';
import { recordApiCall } from '@/lib/engineUsageTracker';

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

const buildExercisePoolByPillar = (
  user: any,
  options?: { enabledEquipment?: string[] }
): Record<MovementPillar, Exercise[]> => {
  const byPillar: Record<MovementPillar, Exercise[]> = {
    push: [], pull: [], legs: [], core: [], mobility: [], endurance: [],
  };
  if (!isExercisesLoaded()) return byPillar;
  for (const pillar of PILLARS) {
    const pillarLevel = Math.max(0, Math.min(5, user?.pillarLevels?.[pillar]?.level ?? 0));
    byPillar[pillar] = getExercisesForQuestSync(pillar, pillarLevel, options?.enabledEquipment);
  }
  return byPillar;
};

const pickExerciseForPillar = (
  byPillar: Record<MovementPillar, Exercise[]>,
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

const normalizeSets = (value: unknown) => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.max(1, Math.min(8, Math.floor(value)));
  }
  return 3;
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
  const exercisePoolByPillar = buildExercisePoolByPillar(user, {
    enabledEquipment: options.availableEquipment,
  });
  const activePillars = PILLARS.filter((pillar) => exercisePoolByPillar[pillar].length > 0);
  const effectivePillars = activePillars.length > 0 ? activePillars : PILLARS;
  if (!options.apiKey) {
    throw new Error('NO_API_KEY');
  }

  try {
    // Gather recent context for the AI
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

    // Build full exercise pool for prompt (all pillars — AI decides the split)
    const exercisePoolForPrompt = effectivePillars.map((pillar) => ({
      pillar,
      count: exercisePoolByPillar[pillar].length,
      exercises: exercisePoolByPillar[pillar].map((ex) => ({
        id: ex.id,
        name: ex.name,
        muscle: ex.muscle,
        level: ex.level,
        equipment: ex.equipment,
      })),
    }));

    // Summarize stats for the AI
    const statsSummary = user.stats
      ? Object.entries(user.stats).map(([k, v]) => `${k}: ${v}`).join(', ')
      : 'sem dados';

    const pillarLevelsSummary = user.pillarLevels
      ? Object.entries(user.pillarLevels).map(([k, v]: [string, any]) => `${k}: lv${v?.level ?? 0} (${v?.xp ?? 0}xp)`).join(', ')
      : 'sem dados';

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
        prompt: `Voce e um personal trainer experiente. Monte a sessao de treino de HOJE para este usuario.

PERFIL DO USUARIO:
- Status fisicos: ${statsSummary}
- Niveis por pilar: ${pillarLevelsSummary}
- Nivel de fitness: ${user.fitnessLevel || 'intermediario'}
- Bio/historico clinico: ${user.bioData ?? user.bio ?? 'nenhum'}
- Debuffs/lesoes: ${user.debuffs?.length ? JSON.stringify(user.debuffs) : 'nenhum'}
- Tempo disponivel: ${Number(user.availableTime) || 45} minutos
- Frequencia semanal: ${Number(user.trainingFrequency) || 3}x/semana
- Equipamentos disponiveis: ${options.availableEquipment.length ? options.availableEquipment.join(', ') : 'apenas peso corporal'}

HISTORICO RECENTE (ultimos 10 dias):
${recentHistory.length > 0 ? JSON.stringify(recentHistory) : 'Nenhum treino recente.'}

BANCO DE EXERCICIOS DISPONIVEL (use SOMENTE exercicios deste banco):
${JSON.stringify(exercisePoolForPrompt)}

INSTRUCOES:
- Analise o perfil, status, historico recente e debuffs para decidir o foco de hoje.
- Decida quantos exercicios sao adequados para ${Number(user.availableTime) || 45} min (considere tempo de descanso entre series).
- Decida quantas series e repeticoes para cada exercicio com base no objetivo e tempo.
- Escolha o split de pilares ideal considerando o que ja foi treinado recentemente.
- Para cada exercicio, use o "id" exato do banco e preencha exerciseId.
- Monte como um treino real: compostos antes de isolados, ordem logica de grupamentos.
- Inclua executionGuide com cues tecnicos em portugues para cada exercicio.
- Retorne 1 weekly quest sobre consistencia semanal.
- NAO invente exercicios. Use SOMENTE os IDs do banco fornecido.`,
      }),
    });

    const data = await response.json();
    recordApiCall();
    const wasRetried = !!data.retried;
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
    // Process ALL quests the AI returned (AI decides the count)
    const normalizedDaily: Quest[] = aiDaily.map((aiQuest: any, i: number) => {
      const pillar: MovementPillar = isMovementPillar(aiQuest.pillar)
        ? aiQuest.pillar
        : effectivePillars[i % effectivePillars.length];
      const exercisePool = exercisePoolByPillar[pillar];
      // Direct ID lookup first (most reliable), then fuzzy name fallback
      const idMatch = aiQuest.exerciseId ? getExerciseByIdSync(String(aiQuest.exerciseId)) : undefined;
      const normalizedAiName = normalizeText(sanitizeText(String(aiQuest.name || '')));
      const matchedExercise = idMatch || exercisePool.find((ex) =>
        normalizeText(ex.name) === normalizedAiName ||
        normalizeText(ex.name).includes(normalizedAiName) ||
        normalizedAiName.includes(normalizeText(ex.name))
      );
      const uniquePool = exercisePool.filter((ex) => {
        const key = normalizeText(ex.name);
        return key && !recentNameSet.has(key) && !selectedNameSet.has(key);
      });
      const noRepeatPool = exercisePool.filter((ex) => {
        const key = normalizeText(ex.name);
        return key && !selectedNameSet.has(key);
      });
      const availablePool =
        uniquePool.length > 0
          ? uniquePool
          : noRepeatPool.length > 0
          ? noRepeatPool
          : exercisePool;
      const matchedIsAllowed =
        matchedExercise &&
        !recentNameSet.has(normalizeText(matchedExercise.name)) &&
        !selectedNameSet.has(normalizeText(matchedExercise.name));
      const selectedExercise =
        (matchedIsAllowed ? matchedExercise : undefined) ||
        availablePool[i % Math.max(1, availablePool.length)] ||
        pickExerciseForPillar(exercisePoolByPillar, pillar, i);
      const selectedName = sanitizeText(
        selectedExercise?.name || String(aiQuest.name || `${pillar.toUpperCase()} Training`)
      );
      const selectedNameKey = normalizeText(selectedName);
      if (selectedNameKey) selectedNameSet.add(selectedNameKey);

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
        executionGuide: selectedExercise?.howTo
          || (typeof aiQuest.executionGuide === 'string' && aiQuest.executionGuide.trim() ? sanitizeText(aiQuest.executionGuide.trim()) : ''),
        exerciseId: selectedExercise?.id,
        previewSrc: selectedExercise?.previewSrc,
        sets: normalizeSets(aiQuest.sets),
        reps: normalizeReps(aiQuest.reps, pillar),
        xpReward: selectedExercise ? (EXERCISE_XP_BY_LEVEL[selectedExercise.level] ?? 24) : 24,
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
      retried: wasRetried,
    };
  } catch (error) {
    console.error('AI generation failed:', error);
    throw error;
  }
};

export function ProtocolGenerator() {
  const [phase, setPhase] = useState<'analyzing' | 'generated' | 'error'>('analyzing');
  const [errorMessage, setErrorMessage] = useState('');
  const [loadingText, setLoadingText] = useState('Generating personalized protocol...');
  const [highDemand, setHighDemand] = useState(false);
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
          .map((item) => item.originalName || item.name)
          .filter(Boolean);

        // Show high-demand warning if it takes too long (>12s)
        const demandTimer = setTimeout(() => setHighDemand(true), 12000);

        try {
          const { daily, weekly, retried } = await generateProtocol(user, questHistory || [], {
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
          if (retried) setHighDemand(true);
          clearTimeout(demandTimer);
          setQuests(daily, weekly);
          setPhase('generated');
        } catch (err: any) {
          clearTimeout(demandTimer);
          if (err?.message === 'NO_API_KEY') {
            setErrorMessage('Sistema superaquecido. Configure uma chave API nas configurações do perfil para gerar treinos.');
          } else {
            setErrorMessage(err?.message || 'Falha ao gerar protocolo de treino. Tente novamente.');
          }
          setPhase('error');
        }
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
              GENERATING PROTOCOL
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
          {highDemand && (
            <motion.p
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-amber-400/70 text-xs font-body mt-2"
            >
              Alta demanda detectada — a resposta pode demorar um pouco mais.
            </motion.p>
          )}
        </motion.div>
      </div>
    );
  }

  // Error phase
  if (phase === 'error') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="notification-popup mb-8 px-8 py-4"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 border-2 border-red-500/60 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-400" />
            </div>
            <h2 className="font-display text-lg md:text-xl tracking-wider text-red-400 font-bold">
              SYSTEM OVERLOAD
            </h2>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center max-w-md mb-8"
        >
          <p className="text-white/70 font-body leading-relaxed">
            {errorMessage}
          </p>
        </motion.div>

        <div className="flex gap-4">
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            onClick={() => {
              setPhase('analyzing');
              setErrorMessage('');
              setHighDemand(false);
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-8 py-3 font-display text-sm tracking-wider border-2 border-amber-500/60 text-amber-400 hover:border-amber-400 hover:shadow-[0_0_15px_rgba(245,158,11,0.2)] transition-all"
          >
            TENTAR NOVAMENTE
          </motion.button>
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            onClick={() => setScreen('dashboard')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-8 py-3 font-display text-sm tracking-wider border-2 border-white/20 text-white/60 hover:border-white/40 transition-all"
          >
            VOLTAR
          </motion.button>
        </div>
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
