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
  MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store/useAppStore';
import type { Quest } from '@/types';
import { sanitizeText } from '@/lib/textSanitizer';

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
}

function QuestCard({ quest, onComplete }: QuestCardProps) {
  const isCompleted = quest.status === 'completed';
  const PillarIcon = pillarIcons[quest.pillar] || Dumbbell;
  const pillarColor = pillarColors[quest.pillar] || '#00d4ff';

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
          {typeof quest.skillLevel === 'number' && (
            <span className="block text-[10px] font-mono tracking-normal text-white/75 normal-case mt-0.5">
              Skill L{quest.skillLevel}
            </span>
          )}
        </div>
      )}
      
      <div className="p-6">
        {/* Icon */}
        <div className="w-12 h-12 rounded-lg bg-shadow-600 border border-white/10 flex items-center justify-center mb-4">
          <PillarIcon className="w-6 h-6" style={{ color: pillarColor }} />
        </div>

        {/* Title */}
        <h3 className={`font-display text-xl font-bold mb-2 ${isCompleted ? 'text-white/50 line-through' : 'text-white'}`}>
          {sanitizeText(quest.name)}
        </h3>

        {/* Description */}
        <p className="text-white/50 text-sm mb-4 font-body">{sanitizeText(quest.description)}</p>

        {/* Difficulty indicators */}
        <div className="flex gap-1 mb-4">
          {[1, 2, 3, 4].map((dot) => (
            <div
              key={dot}
              className={`w-2 h-2 rounded-full ${
                dot <= (quest.difficulty === 'easy' ? 1 : quest.difficulty === 'medium' ? 2 : 3)
                  ? 'bg-neon-blue'
                  : 'bg-white/20'
              }`}
            />
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-shadow-800/50 rounded-lg mb-4">
          <div className="text-center">
            <div className="text-white/40 text-xs uppercase mb-1">Reward XP</div>
            <div className="text-yellow-400 font-display font-bold">+{quest.xpReward} XP</div>
          </div>
          <div className="text-center">
            <div className="text-white/40 text-xs uppercase mb-1">Stat Boost</div>
            <div className="text-red-400 font-display font-bold">
              {quest.statBoost ? `+${quest.statBoost.amount} ${quest.statBoost.stat.slice(0, 3).toUpperCase()}` : '-'}
            </div>
          </div>
          <div className="text-center">
            <div className="text-white/40 text-xs uppercase mb-1">Sets/Reps</div>
            <div className="text-white font-display">{quest.sets}x{quest.reps}</div>
          </div>
          <div className="text-center">
            <div className="text-white/40 text-xs uppercase mb-1">Difficulty</div>
            <div 
              className="font-display font-bold uppercase"
              style={{ color: difficultyColors[quest.difficulty] }}
            >
              {quest.difficulty}
            </div>
          </div>
        </div>

        {/* Exercise info */}
        <div className="flex items-center justify-between p-3 bg-shadow-700/50 rounded-lg border border-white/5 mb-4">
          <span className="text-white/80 font-body">{sanitizeText(quest.name)}</span>
          <span className="text-white/40 font-mono text-sm">{quest.sets}x {quest.reps}</span>
        </div>

        <div className="mb-4 p-3 bg-neon-blue/5 border border-neon-blue/20 rounded-lg">
          <p className="text-neon-blue text-[11px] uppercase tracking-wider mb-1">How to do</p>
          <p className="text-white/75 text-sm">
            {sanitizeText(quest.executionGuide || quest.description)}
          </p>
        </div>

        {(Array.isArray(quest.skillTags) && quest.skillTags.length > 0) || quest.skillReason ? (
          <div className="mb-4 p-3 bg-amber-500/5 border border-amber-400/20 rounded-lg">
            <p className="text-amber-300 text-[11px] uppercase tracking-wider mb-1">Adaptive Tags</p>
            {Array.isArray(quest.skillTags) && quest.skillTags.length > 0 ? (
              <div className="flex flex-wrap gap-2 mb-2">
                {quest.skillTags.map((tag) => (
                  <span
                    key={`${quest.id}-${tag}`}
                    className="px-2 py-0.5 text-[10px] rounded border border-amber-400/30 bg-amber-400/10 text-amber-200"
                  >
                    {sanitizeText(tag)}
                  </span>
                ))}
              </div>
            ) : null}
            {quest.skillReason ? (
              <p className="text-amber-100/80 text-xs">{sanitizeText(quest.skillReason)}</p>
            ) : null}
          </div>
        ) : null}

        {/* Complete button */}
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
  const generatePMFQuests = useAppStore((state) => state.generatePMFQuests);
  const logCheckIn = useAppStore((state) => state.logCheckIn);
  const setGymAccess = useAppStore((state) => state.setGymAccess);
  const lastCheckIn = useAppStore((state) => state.lastCheckIn);
  const hasGymAccess = useAppStore(
    (state) => state.hasGymAccess ?? state.user?.hasGymAccess ?? null
  );
  const user = useAppStore((state) => state.user);

  const [showCheckIn, setShowCheckIn] = useState(!lastCheckIn);
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
      // Generate initial PMF quests if none exist, or rotate to a new day
      generatePMFQuests({
        priorityPillars: ['push', 'pull', 'core'],
        painAreas: lastCheckIn?.painAreas || [],
        hasGymAccess: checkInData.hasGymAccess,
      });
    }
  }, [user, showCheckIn, dailyQuests, generatePMFQuests, lastCheckIn, checkInData.hasGymAccess]);

  const handleCheckIn = () => {
    logCheckIn(checkInData);
    setGymAccess(checkInData.hasGymAccess);
    setShowCheckIn(false);
    
    // Generate quests based on check-in
    generatePMFQuests({
      priorityPillars: ['push', 'pull', 'core'],
      painAreas: checkInData.painAreas,
      hasGymAccess: checkInData.hasGymAccess,
    });
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
      <div className="pt-24 pb-8 px-4 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-shadow-800/50 border border-white/10 rounded-lg p-8"
        >
          <h2 className="font-display text-2xl font-bold text-white mb-6 text-center">
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
    <div className="pt-24 pb-8 px-4 max-w-7xl mx-auto">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-display text-3xl font-bold text-white mb-8"
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...dailyQuests, ...weeklyQuests].map((quest) => (
          <QuestCard
            key={quest.id}
            quest={quest}
            onComplete={() => completeQuest(quest.id)}
          />
        ))}
      </div>
    </div>
  );
}
