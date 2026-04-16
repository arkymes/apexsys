'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { 
  Dumbbell, 
  CheckCircle2, 
  Loader2,
  Clock, 
  Flame,
  Shield,
  Heart,
  Move,
  Moon,
  Zap,
  MessageSquare,
  Video
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VideoFormAnalysis } from '@/components/ui/VideoFormAnalysis';
import { useAppStore } from '@/store/useAppStore';
import type { Quest } from '@/types';
import { sanitizeText } from '@/lib/textSanitizer';
import { useMemo } from 'react';
import { useRouter } from 'next/navigation';

const difficultyColors = {
  easy: '#22c55e',
  medium: '#eab308',
  hard: '#ef4444',
};

const pillarColors = {
  push: '#ef4444',
  pull: '#eab308',
  core: '#8b5cf6',
  legs: '#3b82f6',
  mobility: '#22c55e',
  endurance: '#ec4899',
} as const;

const pillarIcons = {
  push: Flame,
  pull: Zap,
  core: Shield,
  legs: Dumbbell,
  mobility: Move,
  endurance: Heart,
} as const;

interface QuestCardProps {
  quest: Quest;
  onComplete: () => void;
  weeklyProgress?: { current: number; target: number };
}

function QuestCard({ quest, onComplete, weeklyProgress }: QuestCardProps) {
  const isCompleted = quest.status === 'completed';
  const PillarIcon = pillarIcons[quest.pillar] || Dumbbell;
  const pillarColor = pillarColors[quest.pillar] || '#00d4ff';
  const [showVideoAnalysis, setShowVideoAnalysis] = useState(false);
  const isWeekly = quest.type === 'weekly';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        relative overflow-hidden rounded-lg border transition-all duration-300
        ${isCompleted 
          ? 'bg-green-500/5 border-green-500/30' 
          : 'bg-shadow-700/50 border-white/10 hover:border-neon-blue/30'
        }
      `}
    >
      {/* Quest type indicator */}
      {quest.type === 'daily' && (
        <div className="absolute top-2 right-2 px-2 py-1 bg-neon-blue/20 rounded text-xs font-display text-neon-blue uppercase text-right">
          <span>Daily</span>
          {quest.exerciseId && (
            <span className="block text-[10px] font-mono tracking-normal text-white/75 normal-case mt-0.5">
              {quest.xpReward} XP
            </span>
          )}
        </div>
      )}
      
      <div className="p-4 sm:p-6">
        {/* Exercise GIF preview */}
        {quest.previewSrc && !isCompleted && (
          <div className="mb-4 rounded-lg overflow-hidden border border-white/10 bg-shadow-800">
            <img
              src={quest.previewSrc}
              alt={quest.name}
              className="w-full h-36 sm:h-48 object-contain bg-black/30"
              loading="lazy"
            />
          </div>
        )}

        {/* Pillar Icon + Title */}
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 rounded-lg bg-shadow-600 border border-white/10 flex items-center justify-center flex-shrink-0">
            <PillarIcon className="w-5 h-5" style={{ color: pillarColor }} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className={`font-display text-lg font-bold ${isCompleted ? 'text-white/50 line-through' : 'text-white'}`}>
              {sanitizeText(quest.name)}
            </h3>
            <p className="text-white/40 text-xs mt-0.5">{sanitizeText(quest.description)}</p>
          </div>
        </div>

        {/* Sets/Reps + Difficulty + XP */}
        <div className="grid grid-cols-3 gap-3 p-3 bg-shadow-800/50 rounded-lg mb-4">
          <div className="text-center">
            <div className="text-white/40 text-[10px] uppercase mb-0.5">Séries</div>
            <div className="text-white font-display text-sm">{quest.sets}x{quest.reps}</div>
          </div>
          <div className="text-center">
            <div className="text-white/40 text-[10px] uppercase mb-0.5">Dificuldade</div>
            <div 
              className="font-display text-sm font-bold uppercase"
              style={{ color: difficultyColors[quest.difficulty] }}
            >
              {quest.difficulty}
            </div>
          </div>
          <div className="text-center">
            <div className="text-white/40 text-[10px] uppercase mb-0.5">XP</div>
            <div className="text-yellow-400 font-display text-sm font-bold">+{quest.xpReward}</div>
          </div>
        </div>

        {/* How To / Execution Guide */}
        {quest.executionGuide && (
          <div className="mb-4 p-3 bg-neon-blue/5 border border-neon-blue/20 rounded-lg">
            <p className="text-neon-blue text-[11px] uppercase tracking-wider mb-1">Como Executar</p>
            <p className="text-white/75 text-sm leading-relaxed">
              {sanitizeText(quest.executionGuide)}
            </p>
          </div>
        )}

        {/* Video Analysis button - daily only */}
        {!isWeekly && (
          <Button
            onClick={() => setShowVideoAnalysis(true)}
            variant="outline"
            className="w-full mb-2"
            size="sm"
          >
            <Video className="w-4 h-4 mr-2" />
            Analisar Forma (Vídeo IA)
          </Button>
        )}

        {/* Weekly quest progress bar */}
        {isWeekly && weeklyProgress && (
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-white/50 text-xs font-mono uppercase">Sessões esta semana</span>
              <span className={`text-xs font-mono font-bold ${isCompleted ? 'text-green-400' : 'text-neon-blue'}`}>
                {weeklyProgress.current}/{weeklyProgress.target}
              </span>
            </div>
            <div className="h-2.5 rounded-full bg-shadow-700 overflow-hidden border border-white/5">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  isCompleted
                    ? 'bg-green-500'
                    : 'bg-gradient-to-r from-neon-blue to-neon-cyan'
                }`}
                style={{ width: `${Math.min(100, (weeklyProgress.current / weeklyProgress.target) * 100)}%` }}
              />
            </div>
            {!isCompleted && (
              <p className="text-white/30 text-[10px] mt-1.5 text-center font-mono">
                Completa automaticamente ao atingir {weeklyProgress.target} sessões
              </p>
            )}
          </div>
        )}

        {/* Complete button - daily quests only (weekly auto-completes) */}
        {!isWeekly && (
          <Button
            onClick={onComplete}
            disabled={isCompleted}
            className="w-full"
            variant={isCompleted ? 'secondary' : 'primary'}
          >
            {isCompleted ? (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Completed
              </>
            ) : (
              'Mark as Completed'
            )}
          </Button>
        )}

        {/* Weekly completed badge */}
        {isWeekly && isCompleted && (
          <div className="w-full flex items-center justify-center gap-2 py-3 rounded bg-green-500/10 border border-green-500/30">
            <CheckCircle2 className="w-5 h-5 text-green-400" />
            <span className="text-green-400 font-display text-sm uppercase tracking-wider">
              Weekly Completed
            </span>
          </div>
        )}

        {/* Video Analysis Modal */}
        {showVideoAnalysis && (
          <VideoFormAnalysis
            quest={quest}
            onClose={() => setShowVideoAnalysis(false)}
          />
        )}
      </div>

      {/* Completed overlay effect */}
      {isCompleted && (
        <div className="absolute inset-0 bg-green-500/5 pointer-events-none" />
      )}
    </motion.div>
  );
}

export function QuestsPage() {
  const dailyQuests = useAppStore((state) => state.dailyQuests);
  const weeklyQuests = useAppStore((state) => state.weeklyQuests);
  const completeQuest = useAppStore((state) => state.completeQuest);
  const setScreen = useAppStore((state) => state.setScreen);
  const logCheckIn = useAppStore((state) => state.logCheckIn);
  const setGymAccess = useAppStore((state) => state.setGymAccess);
  const lastCheckIn = useAppStore((state) => state.lastCheckIn);
  const hasGymAccess = useAppStore(
    (state) => state.hasGymAccess ?? state.user?.hasGymAccess ?? null
  );
  const user = useAppStore((state) => state.user);
  const trainingHistory = useAppStore((state) => state.trainingHistory);
  const router = useRouter();

  // Compute weekly training progress
  const weeklyProgress = useMemo(() => {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0=Sun
    const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - mondayOffset);
    weekStart.setHours(0, 0, 0, 0);

    const uniqueDays = new Set(
      trainingHistory
        .filter((day) => {
          const d = new Date(day.date);
          return d >= weekStart && day.questsCompleted > 0;
        })
        .map((day) => {
          const d = new Date(day.date);
          d.setHours(0, 0, 0, 0);
          return d.getTime();
        })
    ).size;

    return uniqueDays;
  }, [trainingHistory]);

  // Show check-in only if no check-in today
  const hasTodayCheckIn = (() => {
    if (!lastCheckIn) return false;
    const checkInDate = new Date((lastCheckIn as any).timestamp || (lastCheckIn as any).date || 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return checkInDate.getTime() >= today.getTime();
  })();

  const hasPendingQuests = dailyQuests.length > 0 &&
    dailyQuests.some((q) => q.status === 'pending');

  const [showCheckIn, setShowCheckIn] = useState(!hasTodayCheckIn && !hasPendingQuests);
  const [checkInData, setCheckInData] = useState({
    sleepQuality: 'ok' as 'poor' | 'ok' | 'great',
    painAreas: [] as string[],
    hasGymAccess: hasGymAccess ?? false,
  });
  const [trainingLog, setTrainingLog] = useState('');
  const [showTrainingLog, setShowTrainingLog] = useState(false);
  const [isSubmittingTrainingLog, setIsSubmittingTrainingLog] = useState(false);
  const [trainingLogFeedback, setTrainingLogFeedback] = useState<{
    type: 'idle' | 'success' | 'error';
    message: string;
  }>({ type: 'idle', message: '' });

  useEffect(() => {
    const allDailyResolved =
      dailyQuests.length > 0 &&
      dailyQuests.every((q) => q.status === 'completed' || q.status === 'failed');
    const lastDailyCompletion = dailyQuests
      .map((q) => q.completedAt)
      .filter(Boolean)
      .map((date) => new Date(date as string | number | Date))
      .sort((a, b) => b.getTime() - a.getTime())[0];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const shouldRefreshForNewDay =
      allDailyResolved && !!lastDailyCompletion && lastDailyCompletion.getTime() < today.getTime();

    if (user && !showCheckIn && (dailyQuests.length === 0 || shouldRefreshForNewDay)) {
      // Redirect to AI-based protocol generation
      setScreen('protocol-generating');
      router.push('/');
    }
  }, [user, showCheckIn, dailyQuests, setScreen, router]);

  const handleCheckIn = () => {
    logCheckIn(checkInData);
    setGymAccess(checkInData.hasGymAccess);
    setShowCheckIn(false);
    
    // Only regenerate if there are no pending quests
    if (dailyQuests.length === 0 || dailyQuests.every((q) => q.status === 'completed' || q.status === 'failed')) {
      setScreen('protocol-generating');
      router.push('/');
    }
  };

  const handleTrainingLogSubmit = async () => {
    if (!trainingLog.trim() || isSubmittingTrainingLog) return;
    
    const logTrainingEntry = useAppStore.getState().logTrainingEntry;
    setIsSubmittingTrainingLog(true);
    setTrainingLogFeedback({ type: 'idle', message: '' });
    try {
      const result = await logTrainingEntry(trainingLog);
      if (!result) {
        setTrainingLogFeedback({
          type: 'error',
          message: 'Nao foi possivel registrar. Tente novamente.',
        });
        return;
      }
      setTrainingLogFeedback({
        type: 'success',
        message: 'Treino enviado e processado com sucesso.',
      });
      setTrainingLog('');
      setTimeout(() => {
        setShowTrainingLog(false);
        setTrainingLogFeedback({ type: 'idle', message: '' });
      }, 700);
    } catch {
      setTrainingLogFeedback({
        type: 'error',
        message: 'Erro ao enviar para IA. Verifique chave/rede.',
      });
    } finally {
      setIsSubmittingTrainingLog(false);
    }
  };

  if (showCheckIn) {
    return (
      <div className="pt-20 md:pt-24 pb-24 md:pb-8 px-3 sm:px-4 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-shadow-800/50 border border-white/10 rounded-lg p-4 sm:p-8"
        >
          <h2 className="font-display text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6 text-center">
            Check-in Diário - Sistema PMF
          </h2>
          
          {/* Sleep Quality */}
          <div className="mb-6">
            <label className="block text-white/80 font-body mb-3">Qualidade do Sono:</label>
            <div className="flex gap-4">
              {[
                { value: 'poor', label: 'Ruim', icon: Moon },
                { value: 'ok', label: 'Ok', icon: Clock },
                { value: 'great', label: 'Ótimo', icon: Zap },
              ].map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => setCheckInData(prev => ({ ...prev, sleepQuality: value as any }))}
                  className={`flex items-center gap-2 px-4 py-2 rounded border transition-all ${
                    checkInData.sleepQuality === value
                      ? 'border-neon-blue text-neon-blue bg-neon-blue/10'
                      : 'border-white/20 text-white/60 hover:border-white/40'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Pain Areas */}
          <div className="mb-6">
            <label className="block text-white/80 font-body mb-3">Áreas com Dor ou Desconforto:</label>
            <div className="grid grid-cols-2 gap-2">
              {['ombro', 'cotovelo', 'pulso', 'costas', 'joelho', 'tornozelo', 'quadril', 'pescoço'].map((area) => (
                <button
                  key={area}
                  onClick={() => setCheckInData(prev => ({
                    ...prev,
                    painAreas: prev.painAreas.includes(area)
                      ? prev.painAreas.filter(a => a !== area)
                      : [...prev.painAreas, area]
                  }))}
                  className={`px-3 py-2 rounded border text-sm transition-all ${
                    checkInData.painAreas.includes(area)
                      ? 'border-red-500 text-red-400 bg-red-500/10'
                      : 'border-white/20 text-white/60 hover:border-white/40'
                  }`}
                >
                  {area}
                </button>
              ))}
            </div>
          </div>

          {/* Gym Access */}
          <div className="mb-8">
            <label className="block text-white/80 font-body mb-3">Acesso à Academia:</label>
            <div className="flex gap-4">
              <button
                onClick={() => setCheckInData(prev => ({ ...prev, hasGymAccess: true }))}
                className={`px-4 py-2 rounded border transition-all ${
                  checkInData.hasGymAccess
                    ? 'border-green-500 text-green-400 bg-green-500/10'
                    : 'border-white/20 text-white/60 hover:border-white/40'
                }`}
              >
                Sim
              </button>
              <button
                onClick={() => setCheckInData(prev => ({ ...prev, hasGymAccess: false }))}
                className={`px-4 py-2 rounded border transition-all ${
                  !checkInData.hasGymAccess
                    ? 'border-red-500 text-red-400 bg-red-500/10'
                    : 'border-white/20 text-white/60 hover:border-white/40'
                }`}
              >
                Não
              </button>
            </div>
          </div>

          <div className="text-center">
            <Button onClick={handleCheckIn} className="px-8">
              Iniciar Treino PMF
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pt-20 md:pt-24 pb-24 md:pb-8 px-3 sm:px-4 max-w-7xl mx-auto">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-display text-2xl sm:text-3xl font-bold text-white mb-6 sm:mb-8"
      >
        Missões PMF Ativas
      </motion.h1>

      {/* Training Log Button */}
      <div className="mb-6 text-center">
        <Button
          onClick={() => setShowTrainingLog(true)}
          variant="secondary"
          className="mb-4"
        >
          <MessageSquare className="w-4 h-4 mr-2" />
          Registrar Treino Concluído
        </Button>
      </div>

      {/* Training Log Modal */}
      {showTrainingLog && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowTrainingLog(false)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="bg-shadow-800 border border-white/10 rounded-lg p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-display text-xl font-bold text-white mb-4">
              Log de Treino
            </h3>
            <textarea
              value={trainingLog}
              onChange={(e) => setTrainingLog(e.target.value)}
              placeholder="Descreva seu treino (ex: 'Fiz 12 flexões, mas senti dor no ombro')"
              className="w-full h-32 bg-shadow-700 border border-white/20 rounded p-3 text-white resize-none"
            />
            <div className="flex gap-3 mt-4">
              <Button onClick={handleTrainingLogSubmit} disabled={!trainingLog.trim() || isSubmittingTrainingLog}>
                {isSubmittingTrainingLog ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processando...
                  </>
                ) : (
                  'Enviar para IA'
                )}
              </Button>
              <Button onClick={() => setShowTrainingLog(false)} variant="secondary" disabled={isSubmittingTrainingLog}>
                Cancelar
              </Button>
            </div>
            {trainingLogFeedback.type !== 'idle' && (
              <p
                className={`mt-3 text-xs ${
                  trainingLogFeedback.type === 'success' ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {trainingLogFeedback.message}
              </p>
            )}
          </motion.div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {[...dailyQuests, ...weeklyQuests].map((quest) => (
          <QuestCard
            key={quest.id}
            quest={quest}
            onComplete={() => completeQuest(quest.id)}
            weeklyProgress={
              quest.type === 'weekly'
                ? { current: weeklyProgress, target: quest.sets }
                : undefined
            }
          />
        ))}
      </div>
    </div>
  );
}
