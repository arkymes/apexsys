'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Settings,
  Bell,
  Volume2,
  Sparkles,
  User,
  AlertTriangle,
  HeartPulse,
  Dumbbell,
  Clock3,
  Repeat,
  CheckCircle2,
  CircleOff,
  Minus,
  Plus,
  FileText,
} from 'lucide-react';
import { GlassPanel } from '@/components/ui/CyberFrame';
import { EngineHeatBar } from '@/components/ui/EngineHeatBar';
import { useAppStore } from '@/store/useAppStore';
import { getAllEquipmentTypesSync, isExercisesLoaded, preloadExercises } from '@/lib/exerciseService';
import type { Equipment } from '@/types';

function DebuffCard({ debuff }: { debuff: any }) {
  return (
    <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-lg flex items-start gap-4">
      <div className="bg-red-500/20 p-2 rounded-full">
        <AlertTriangle className="w-5 h-5 text-red-500" />
      </div>
      <div>
        <h4 className="text-white font-display text-sm uppercase tracking-wider">{debuff.name}</h4>
        <p className="text-white/60 text-xs mb-2">{debuff.description}</p>
        <div className="flex flex-wrap gap-2">
          {debuff.affectedExercises?.map((ex: string) => (
            <span
              key={ex}
              className="text-[10px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded border border-red-500/20"
            >
              AVOID: {ex}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

interface ToggleSwitchProps {
  enabled: boolean;
  onToggle: () => void;
  label: string;
  description: string;
  icon: React.ReactNode;
}

function ToggleSwitch({ enabled, onToggle, label, description, icon }: ToggleSwitchProps) {
  return (
    <div className="bg-transparent border border-white/30 flex items-center justify-between p-4 transition-all duration-300 shadow-[0_0_16px_rgba(255,255,255,0.12)] hover:border-neon-blue/35">
      <div className="flex items-center gap-3">
        <div className="text-white/60">{icon}</div>
        <div>
          <div className="text-white font-body">{label}</div>
          <div className="text-white/40 text-sm">{description}</div>
        </div>
      </div>
      <button
        onClick={onToggle}
        className={`relative w-12 h-6 rounded-full transition-all duration-300 ${
          enabled ? 'bg-neon-blue/30' : 'bg-white/10'
        }`}
      >
        <motion.div
          animate={{ x: enabled ? 24 : 2 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className={`absolute top-1 w-4 h-4 rounded-full transition-colors ${
            enabled ? 'bg-neon-blue shadow-[0_0_10px_rgba(0,212,255,0.5)]' : 'bg-white/50'
          }`}
        />
      </button>
    </div>
  );
}

interface EquipmentCardProps {
  item: Equipment;
  onEnable: () => void;
  onDisable: () => void;
}

function EquipmentCard({ item, onEnable, onDisable }: EquipmentCardProps) {
  const enabled = item.enabledForAI ?? item.equipped ?? true;
  const isAI = item.source === 'assessment-ai';
  const isUser = item.source === 'user';
  const borderColor = isAI ? 'border-purple-500/30' : isUser ? 'border-amber-500/25' : 'border-white/15';
  const bgColor = isAI ? 'bg-purple-950/20' : isUser ? 'bg-amber-950/10' : 'bg-shadow-700/40';

  return (
    <div className={`p-3 rounded-lg border ${borderColor} ${bgColor}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-white font-display truncate">{item.name}</span>
            {isAI && (
              <span className="flex-shrink-0 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                IA
              </span>
            )}
            {isUser && (
              <span className="flex-shrink-0 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded bg-amber-500/15 text-amber-300 border border-amber-500/25">
                Custom
              </span>
            )}
          </div>
          <div className="text-xs text-white/40 uppercase tracking-wider">
            {item.category || 'other'}
          </div>
          {item.notes ? <div className="text-xs text-white/55 mt-1">{item.notes}</div> : null}
        </div>
        <button
          onClick={enabled ? onDisable : onEnable}
          className={`flex-shrink-0 px-2 py-1 rounded text-xs border transition-colors ${
            enabled
              ? isAI
                ? 'border-purple-500/40 text-purple-300 bg-purple-500/10'
                : 'border-green-500/40 text-green-300 bg-green-500/10'
              : 'border-white/20 text-white/60 bg-black/20'
          }`}
        >
          {enabled ? 'Ativo IA' : 'Inativo IA'}
        </button>
      </div>
    </div>
  );
}

export function ProfilePage() {
  const user = useAppStore((state) => state.user);
  const equipment = useAppStore((state) => state.equipment);
  const availableEquipment = useAppStore((state) => state.availableEquipment);
  const equipItem = useAppStore((state) => state.equipItem);
  const unequipItem = useAppStore((state) => state.unequipItem);
  const syncEquipmentFromExercises = useAppStore((state) => state.syncEquipmentFromExercises);
  const particlesEnabled = useAppStore((state) => state.particlesEnabled);
  const soundEnabled = useAppStore((state) => state.soundEnabled);
  const notificationsEnabled = useAppStore((state) => state.notificationsEnabled);
  const toggleParticles = useAppStore((state) => state.toggleParticles);
  const toggleSound = useAppStore((state) => state.toggleSound);
  const toggleNotifications = useAppStore((state) => state.toggleNotifications);
  const resetApp = useAppStore((state) => state.resetApp);
  const setTrainingFrequency = useAppStore((state) => state.setTrainingFrequency);
  const [showWipeModal, setShowWipeModal] = useState(false);

  // Sync equipment list from exercise database on mount
  useEffect(() => {
    const sync = () => {
      const types = getAllEquipmentTypesSync();
      if (types.length > 0) {
        syncEquipmentFromExercises(types);
      }
    };
    if (isExercisesLoaded()) {
      sync();
    } else {
      preloadExercises().then(sync);
    }
  }, [syncEquipmentFromExercises]);

  if (!user) return null;

  const handleWipeProfile = () => {
    sessionStorage.removeItem('tempHunterName');
    sessionStorage.removeItem('tempHunterRank');
    resetApp();
    setShowWipeModal(false);
  };

  return (
    <div className="pt-20 md:pt-24 pb-24 md:pb-8 px-3 sm:px-4 max-w-7xl mx-auto relative">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-display text-2xl sm:text-3xl font-bold text-white mb-6 sm:mb-8"
      >
        Profile
      </motion.h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {user.debuffs && user.debuffs.length > 0 && (
          <GlassPanel className="p-4 sm:p-6 lg:col-span-2 border-red-500/30 bg-red-950/20">
            <div className="flex items-center gap-2 mb-4 text-red-400">
              <HeartPulse className="w-5 h-5" />
              <h3 className="font-display text-lg uppercase tracking-wider">
                Active Debuffs (Injuries/Limitations)
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {user.debuffs.map((debuff, i) => (
                <DebuffCard key={i} debuff={debuff} />
              ))}
            </div>
          </GlassPanel>
        )}

        {/* AI Clinical Notes / Recommendations */}
        {user.bioData && user.bioData.trim() && (
          <GlassPanel className="p-4 sm:p-6 lg:col-span-2 border-neon-blue/20">
            <div className="flex items-center gap-2 mb-4 text-neon-blue">
              <FileText className="w-5 h-5" />
              <h3 className="font-display text-lg uppercase tracking-wider">
                Notas da IA / Recomendacoes
              </h3>
            </div>
            <div className="bg-shadow-800/50 rounded-lg border border-white/5 p-4">
              <p className="text-white/70 text-sm leading-relaxed whitespace-pre-line">
                {user.bioData}
              </p>
            </div>
            <p className="text-white/30 text-xs mt-2">
              Gerado durante o Assessment. A IA usa essas notas para personalizar seus treinos.
            </p>
          </GlassPanel>
        )}

        <GlassPanel className="p-4 sm:p-6">
          <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-shadow-600 border-2 border-neon-blue/30 flex items-center justify-center">
              <User className="w-7 h-7 sm:w-10 sm:h-10 text-white/60" />
            </div>
            <div>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-white">{user.name}</h2>
              <div className="text-white/60 font-body">
                Level {user.level} - {user.rank}-Rank
              </div>
              <div className="text-white/40 text-sm font-mono mt-1">{user.totalWorkouts} workouts completed</div>
            </div>
          </div>

          <div className="bg-transparent border border-white/30 grid grid-cols-3 gap-2 sm:gap-4 p-3 sm:p-4 shadow-[0_0_16px_rgba(255,255,255,0.12)]">
            <div className="text-center">
              <div className="text-white/40 text-xs uppercase mb-1">Height</div>
              <div className="text-white font-display">{user.height} cm</div>
            </div>
            <div className="text-center border-x border-white/10">
              <div className="text-white/40 text-xs uppercase mb-1">Weight</div>
              <div className="text-white font-display">{user.weight} kg</div>
            </div>
            <div className="text-center">
              <div className="text-white/40 text-xs uppercase mb-1">Age</div>
              <div className="text-white font-display">{user.age}</div>
            </div>
          </div>

          <div className="mt-4 bg-transparent border border-white/30 grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 sm:p-4 shadow-[0_0_16px_rgba(255,255,255,0.08)]">
            <div className="text-center">
              <div className="text-white/40 text-xs uppercase mb-1">Available Time</div>
              <div className="text-white font-display flex items-center justify-center gap-1">
                <Clock3 className="w-4 h-4 text-neon-blue" />
                {user.availableTime || 45} min/day
              </div>
            </div>
            <div className="text-center sm:border-l border-white/10">
              <div className="text-white/40 text-xs uppercase mb-1">Training Frequency</div>
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => setTrainingFrequency((user.trainingFrequency || 3) - 1)}
                  disabled={(user.trainingFrequency || 3) <= 2}
                  className="w-7 h-7 rounded border border-white/20 flex items-center justify-center text-white/60 hover:bg-white/10 hover:text-neon-blue transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <div className="text-white font-display flex items-center gap-1">
                  <Repeat className="w-4 h-4 text-neon-blue" />
                  {user.trainingFrequency || 3}x/week
                </div>
                <button
                  onClick={() => setTrainingFrequency((user.trainingFrequency || 3) + 1)}
                  disabled={(user.trainingFrequency || 3) >= 7}
                  className="w-7 h-7 rounded border border-white/20 flex items-center justify-center text-white/60 hover:bg-white/10 hover:text-neon-blue transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Engine Heat Bar */}
          <div className="mt-4 pt-4 border-t border-white/10">
            <EngineHeatBar />
          </div>
        </GlassPanel>

        <GlassPanel className="p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <Dumbbell className="w-5 h-5 text-neon-blue" />
            <h3 className="font-display text-lg uppercase tracking-wider text-white">Equipamentos</h3>
          </div>

          <p className="text-white/40 text-xs mb-3">
            Ative os equipamentos que você tem acesso. A IA usará apenas os ativos para gerar treinos.
          </p>

          {equipment.length > 0 ? (
            <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
              {[...equipment]
                .sort((a, b) => {
                  const order: Record<string, number> = { 'assessment-ai': 0, 'user': 1, 'system': 2 };
                  return (order[a.source ?? 'system'] ?? 2) - (order[b.source ?? 'system'] ?? 2);
                })
                .map((item) => (
                <EquipmentCard
                  key={item.id}
                  item={item}
                  onEnable={() => equipItem(item.id)}
                  onDisable={() => unequipItem(item.id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-white/40">
              <CircleOff className="w-8 h-8 mx-auto mb-2" />
              Carregando equipamentos...
            </div>
          )}

          <p className="text-xs text-white/40 mt-3 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-green-400" />
            Itens marcados como "Ativo IA" serão usados na geração dos treinos.
          </p>
        </GlassPanel>

        <GlassPanel className="p-4 sm:p-6 lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <Settings className="w-5 h-5 text-white/60" />
            <h3 className="font-display text-lg uppercase tracking-wider text-white">Settings</h3>
          </div>

          <div className="space-y-3">
            <ToggleSwitch
              enabled={notificationsEnabled}
              onToggle={toggleNotifications}
              label="Notifications"
              description="Receive quest reminders and level up alerts"
              icon={<Bell className="w-5 h-5" />}
            />
            <ToggleSwitch
              enabled={soundEnabled}
              onToggle={toggleSound}
              label="Sound Effects"
              description="Play sounds for achievements and level ups"
              icon={<Volume2 className="w-5 h-5" />}
            />
            <ToggleSwitch
              enabled={particlesEnabled}
              onToggle={toggleParticles}
              label="Particle Effects"
              description="Show animated background particles"
              icon={<Sparkles className="w-5 h-5" />}
            />
          </div>
        </GlassPanel>
      </div>

      <button
        onClick={() => setShowWipeModal(true)}
        className="absolute bottom-2 right-2 text-[10px] uppercase tracking-wider text-red-300/80 border border-red-500/40 bg-red-500/10 px-2 py-1 rounded hover:bg-red-500/20 hover:text-red-200 transition-colors"
      >
        Wipe profile
      </button>

      {showWipeModal && (
        <div className="fixed inset-0 z-[110] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <GlassPanel className="w-full max-w-xl p-6 border-red-500/50 shadow-[0_0_40px_rgba(239,68,68,0.25)]">
            <div className="flex items-center gap-3 text-red-400 mb-4">
              <AlertTriangle className="w-7 h-7" />
              <h3 className="font-display text-2xl uppercase tracking-wider">Danger Zone</h3>
            </div>

            <p className="text-white text-base mb-3">
              This action will permanently erase your profile, quests, progress, and training history.
            </p>
            <p className="text-red-300 font-display text-sm uppercase tracking-wider mb-6">
              This cannot be undone.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowWipeModal(false)}
                className="flex-1 px-4 py-2 border border-white/20 text-white/80 rounded hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleWipeProfile}
                className="flex-1 px-4 py-2 border border-red-500/60 text-red-200 bg-red-600/20 rounded hover:bg-red-600/35 transition-colors font-semibold"
              >
                Yes, wipe everything
              </button>
            </div>
          </GlassPanel>
        </div>
      )}
    </div>
  );
}
