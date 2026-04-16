'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Flame,
  Zap,
  Shield,
  Heart,
  Move,
  Dumbbell,
  Search,
  X,
  ExternalLink,
  ChevronRight,
  Filter,
  Lock,
} from 'lucide-react';
import { GlassPanel } from '@/components/ui/CyberFrame';
import { useAppStore } from '@/store/useAppStore';
import { PILLAR_NAMES, EXERCISE_XP_BY_LEVEL, type MovementPillar, type Exercise } from '@/types';
import {
  getExercisesSync,
  isExercisesLoaded,
  preloadExercises,
  getLevelsForPillar,
  getMusclesForExercises,
} from '@/lib/exerciseService';

const pillarColors: Record<MovementPillar, string> = {
  push: '#ef4444',
  pull: '#eab308',
  legs: '#3b82f6',
  core: '#8b5cf6',
  endurance: '#ec4899',
  mobility: '#22c55e',
};

const pillarIcons: Record<MovementPillar, typeof Flame> = {
  push: Flame,
  pull: Zap,
  legs: Dumbbell,
  core: Shield,
  endurance: Heart,
  mobility: Move,
};

const levelLabels: Record<number, string> = {
  0: 'Iniciante',
  1: 'Básico',
  2: 'Intermediário',
  3: 'Avançado',
  4: 'Expert',
  5: 'Elite',
};

// â”€â”€â”€ Exercise Detail Popup â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface ExercisePopupProps {
  exercise: Exercise;
  onClose: () => void;
}

function ExercisePopup({ exercise, onClose }: ExercisePopupProps) {
  const color = pillarColors[exercise.pillar];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <GlassPanel className="p-6 border-white/20">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h2 className="font-display text-xl text-white mb-1">{exercise.name}</h2>
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className="px-2 py-0.5 text-xs rounded border"
                  style={{ borderColor: `${color}60`, color, background: `${color}15` }}
                >
                  {PILLAR_NAMES[exercise.pillar]}
                </span>
                <span className="px-2 py-0.5 text-xs rounded border border-white/20 text-white/60">
                  {exercise.muscle}
                </span>
                <span className="px-2 py-0.5 text-xs rounded border border-neon-blue/30 text-neon-blue">
                  Nível {exercise.level} • {EXERCISE_XP_BY_LEVEL[exercise.level] ?? 10} XP
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5 text-white/60" />
            </button>
          </div>

          {/* GIF Preview */}
          {exercise.previewSrc && (
            <div className="mb-4 rounded-lg overflow-hidden border border-white/10 bg-black/40">
              <img
                src={exercise.previewSrc}
                alt={exercise.name}
                className="w-full h-auto max-h-64 object-contain"
                loading="lazy"
              />
            </div>
          )}

          {/* Equipment */}
          <div className="mb-4">
            <div className="text-white/40 text-xs uppercase tracking-wider mb-1.5">Equipamento</div>
            <div className="flex flex-wrap gap-1.5">
              {exercise.equipment.map((eq) => (
                <span
                  key={eq}
                  className="px-2 py-0.5 text-xs rounded border border-white/15 bg-shadow-700/50 text-white/70"
                >
                  {eq === 'None' ? 'Peso Corporal' : eq}
                </span>
              ))}
            </div>
          </div>

          {/* How To */}
          <div className="mb-4">
            <div className="text-white/40 text-xs uppercase tracking-wider mb-1.5">Como Executar</div>
            <div className="bg-shadow-800/60 border border-neon-blue/15 rounded-lg p-4">
              <p className="text-white/80 text-sm leading-relaxed">{exercise.howTo}</p>
            </div>
          </div>

          {/* Video Link */}
          {exercise.videoLink && (
            <a
              href={exercise.videoLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/20 transition-colors text-sm"
            >
              <ExternalLink className="w-4 h-4" />
              Ver vídeo tutorial
            </a>
          )}
        </GlassPanel>
      </motion.div>
    </motion.div>
  );
}

// â”€â”€â”€ Exercise Card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface ExerciseCardProps {
  exercise: Exercise;
  onClick: () => void;
}

function ExerciseCard({ exercise, onClick }: ExerciseCardProps) {
  const color = pillarColors[exercise.pillar];

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className="cursor-pointer p-3.5 rounded-lg border border-white/10 bg-shadow-700/40 hover:border-neon-blue/30 transition-all duration-200 group"
    >
      <div className="flex items-center gap-3">
        {/* Level indicator */}
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: `${color}15`, border: `1px solid ${color}30` }}
        >
          <span className="font-mono text-sm font-bold" style={{ color }}>
            L{exercise.level}
          </span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="font-display text-sm text-white truncate">{exercise.name}</div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[11px] text-white/40">{exercise.muscle}</span>
            <span className="text-[10px] text-white/20">•</span>
            <span className="text-[11px] text-white/40">
              {exercise.equipment.map((e) => (e === 'None' ? 'BW' : e)).join(', ')}
            </span>
          </div>
        </div>

        {/* XP + Arrow */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-xs font-mono text-neon-blue">
            {EXERCISE_XP_BY_LEVEL[exercise.level] ?? 10} XP
          </span>
          <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-neon-blue/60 transition-colors" />
        </div>
      </div>
    </motion.div>
  );
}

// â”€â”€â”€ Main Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export function SkillsPage() {
  const pillarLevels = useAppStore((state) => state.pillarLevels);
  const [loaded, setLoaded] = useState(isExercisesLoaded());
  const [selectedPillar, setSelectedPillar] = useState<MovementPillar>('push');
  const [selectedLevel, setSelectedLevel] = useState<number>(0);
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

  const pillars: MovementPillar[] = ['push', 'pull', 'core', 'legs', 'mobility', 'endurance'];

  // User's max accessible exercise level for current pillar (pillarLevel + 1, capped at 5)
  const userPillarLevel = pillarLevels?.[selectedPillar]?.level ?? 0;
  const maxAccessibleLevel = Math.min(5, userPillarLevel + 1);

  useEffect(() => {
    if (!loaded) {
      preloadExercises().then(() => setLoaded(true));
    }
  }, [loaded]);

  const allExercises = useMemo(() => getExercisesSync(), [loaded]);

  const pillarExercises = useMemo(
    () => allExercises.filter((ex) => ex.pillar === selectedPillar),
    [allExercises, selectedPillar]
  );

  // Only exercises the user can access (up to maxAccessibleLevel)
  const accessibleExercises = useMemo(
    () => pillarExercises.filter((ex) => ex.level <= maxAccessibleLevel),
    [pillarExercises, maxAccessibleLevel]
  );

  const availableLevels = useMemo(
    () => getLevelsForPillar(allExercises, selectedPillar),
    [allExercises, selectedPillar]
  );

  // Reset level/muscle when switching pillar — default to user's pillar level
  useEffect(() => {
    const pLvl = pillarLevels?.[selectedPillar]?.level ?? 0;
    setSelectedLevel(pLvl);
    setSelectedMuscle(null);
    setSearchQuery('');
  }, [selectedPillar, pillarLevels]);

  const filteredByLevel = useMemo(
    () => accessibleExercises.filter((ex) => ex.level === selectedLevel),
    [accessibleExercises, selectedLevel]
  );

  const availableMuscles = useMemo(() => getMusclesForExercises(filteredByLevel), [filteredByLevel]);

  const filteredExercises = useMemo(() => {
    let result = filteredByLevel;
    if (selectedMuscle) {
      result = result.filter((ex) => ex.muscle === selectedMuscle);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (ex) =>
          ex.name.toLowerCase().includes(q) ||
          ex.muscle.toLowerCase().includes(q) ||
          ex.equipment.some((eq) => eq.toLowerCase().includes(q))
      );
    }
    return result;
  }, [filteredByLevel, selectedMuscle, searchQuery]);

  // Reset muscle when it's no longer available after level change
  useEffect(() => {
    if (selectedMuscle && !availableMuscles.includes(selectedMuscle)) {
      setSelectedMuscle(null);
    }
  }, [availableMuscles, selectedMuscle]);

  if (!loaded) {
    return (
      <div className="pt-20 md:pt-24 pb-24 md:pb-8 px-3 sm:px-4 max-w-7xl mx-auto flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-neon-blue/20 border-t-neon-blue rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="pt-20 md:pt-24 pb-24 md:pb-8 px-3 sm:px-4 max-w-7xl mx-auto">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-display text-2xl sm:text-3xl font-bold text-white mb-1"
      >
        Exercise Catalog
      </motion.h1>
      <p className="text-white/50 text-sm mb-6">
        {accessibleExercises.length} exercícios disponíveis • Toque para ver detalhes e GIF
      </p>

      {/* Pillar Tabs */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-4">
        {pillars.map((pillar) => {
          const Icon = pillarIcons[pillar];
          const pLevel = pillarLevels?.[pillar]?.level ?? 0;
          const maxLvl = Math.min(5, pLevel + 1);
          const accessibleCount = allExercises.filter((ex) => ex.pillar === pillar && ex.level <= maxLvl).length;
          const isActive = selectedPillar === pillar;
          return (
            <motion.button
              key={pillar}
              whileTap={{ scale: 0.97 }}
              onClick={() => setSelectedPillar(pillar)}
              className={`relative p-3 rounded-lg border text-center transition-all duration-200 ${
                isActive
                  ? 'border-neon-blue bg-neon-blue/10'
                  : 'border-white/10 bg-shadow-700/30 hover:border-white/20'
              }`}
            >
              <Icon
                className="w-5 h-5 mx-auto mb-1"
                style={{ color: isActive ? pillarColors[pillar] : 'rgba(255,255,255,0.4)' }}
              />
              <div className={`font-display text-[11px] uppercase tracking-wider ${isActive ? 'text-white' : 'text-white/50'}`}>
                {pillar}
              </div>
              <div className="text-[10px] text-white/30 mt-0.5">{accessibleCount} ex</div>
              <div className="text-[9px] text-neon-blue/50 mt-0.5">Lv {pLevel}</div>
            </motion.button>
          );
        })}
      </div>

      {/* Current pillar level info */}
      <div className="flex items-center gap-2 mb-4 px-1">
        <span className="text-xs text-white/40">Seu nível em <span className="text-white/70 font-display uppercase">{selectedPillar}</span>:</span>
        <span className="text-xs font-mono font-bold text-neon-blue">Lv {userPillarLevel}</span>
        <span className="text-xs text-white/30">•</span>
        <span className="text-xs text-white/40">Exercícios até <span className="font-mono text-white/60">L{maxAccessibleLevel}</span></span>
      </div>

      {/* Level Tabs */}
      <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1">
        {availableLevels.map((level) => {
          const isLocked = level > maxAccessibleLevel;
          const count = pillarExercises.filter((ex) => ex.level === level).length;
          const isActive = selectedLevel === level;
          const color = pillarColors[selectedPillar];
          return (
            <button
              key={level}
              onClick={() => !isLocked && setSelectedLevel(level)}
              disabled={isLocked}
              className={`relative flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs whitespace-nowrap transition-all duration-200 ${
                isLocked
                  ? 'bg-shadow-800/60 text-white/15 border border-white/5 cursor-not-allowed'
                  : isActive
                  ? 'text-white font-semibold border shadow-lg'
                  : 'bg-shadow-700/40 text-white/50 border border-white/10 hover:border-white/25 hover:text-white/70'
              }`}
              style={isActive && !isLocked ? {
                borderColor: `${color}60`,
                background: `${color}15`,
                boxShadow: `0 0 12px ${color}20`,
              } : undefined}
            >
              {isLocked ? (
                <Lock className="w-3 h-3 text-white/20" />
              ) : (
                <span
                  className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold"
                  style={{
                    background: isActive ? `${color}30` : 'rgba(255,255,255,0.08)',
                    color: isActive ? color : 'rgba(255,255,255,0.4)',
                  }}
                >
                  {level}
                </span>
              )}
              <span>{levelLabels[level] || `Nível ${level}`}</span>
              <span className={`text-[10px] ${isActive ? 'text-white/60' : 'text-white/25'}`}>({count})</span>
            </button>
          );
        })}
      </div>

      {/* Muscle Filter Chips */}
      {availableMuscles.length > 1 && (
        <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1">
          <div className="flex items-center gap-1 mr-1 flex-shrink-0">
            <Filter className="w-3.5 h-3.5 text-white/30" />
          </div>
          {availableMuscles.map((muscle) => {
            const count = filteredByLevel.filter((ex) => ex.muscle === muscle).length;
            const isActive = selectedMuscle === muscle;
            return (
              <button
                key={muscle}
                onClick={() => setSelectedMuscle(isActive ? null : muscle)}
                className={`px-2.5 py-1 rounded-full text-[11px] whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-neon-blue/20 text-neon-blue border border-neon-blue/40'
                    : 'bg-shadow-700/40 text-white/50 border border-white/10 hover:border-white/20'
                }`}
              >
                {muscle} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* Search */}
      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
        <input
          type="text"
          placeholder="Buscar exercício, músculo ou equipamento..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-shadow-700/40 border border-white/10 rounded-lg text-sm text-white placeholder-white/30 focus:outline-none focus:border-neon-blue/40"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            <X className="w-4 h-4 text-white/30 hover:text-white/60" />
          </button>
        )}
      </div>

      {/* Results Count */}
      <div className="text-xs text-white/40 mb-3">
        {filteredExercises.length} exercício{filteredExercises.length !== 1 ? 's' : ''}
        {selectedMuscle && ` • ${selectedMuscle}`}
        {searchQuery && ` • busca: "${searchQuery}"`}
      </div>

      {/* Exercise List */}
      <div className="space-y-2">
        {filteredExercises.length > 0 ? (
          filteredExercises.map((exercise) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              onClick={() => setSelectedExercise(exercise)}
            />
          ))
        ) : (
          <div className="text-center py-12">
            <Dumbbell className="w-12 h-12 mx-auto text-white/15 mb-3" />
            <p className="text-white/40 font-display">Nenhum exercício encontrado</p>
            <p className="text-white/25 text-sm mt-1">Tente mudar os filtros ou busca</p>
          </div>
        )}
      </div>

      {/* Exercise Detail Popup */}
      <AnimatePresence>
        {selectedExercise && (
          <ExercisePopup
            exercise={selectedExercise}
            onClose={() => setSelectedExercise(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
