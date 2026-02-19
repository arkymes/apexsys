'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, X, Loader2, Terminal } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useAppStore } from '@/store/useAppStore';
import { createSystemChat } from '@/lib/systemChatService';
import {
  ChatMessage,
  Quest,
  MovementPillar,
  Debuff,
  Objective,
  FitnessLevel,
  Rank,
  UserStats,
  RadarStats,
  SkillDefinition,
} from '@/types';
import { SKILL_DEFINITIONS } from '@/lib/skillDefinitions';
import { buildEquipmentCatalogFromNames } from '@/lib/equipmentCatalog';
import { GlassPanel } from './CyberFrame';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SystemChatPanel: React.FC<ChatPanelProps> = ({ isOpen, onClose }) => {
  const apiKey = useAppStore((state) => state.geminiApiKey);
  const user = useAppStore((state) => state.user);
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [processingTool, setProcessingTool] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatInstance = useRef<any>(null);

  // Initial greeting
  useEffect(() => {
    if (isOpen && messages.length === 0) {
        setMessages([{
            id: 'init',
            role: 'model',
            text: `**SYSTEM CORE ONLINE**\n\nIdentificação confirmada: **${user?.name || 'Unknown'}**.\nPronto para ajustar seus protocolos.`,
            timestamp: Date.now()
        }]);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // --- TOOL EXECUTION LOGIC ---
  const executeTools = async (functionCalls: any[]) => {
    setProcessingTool(true);
    const responses = [];

    for (const call of functionCalls) {
      const { name, args } = call;
      console.log(`[SystemCore] Executing: ${name}`, args);
      
      let result = { result: "Done" };

      try {
        switch (name) {
          case 'get_user_state':
            const currentState = useAppStore.getState();
            const pillarsForCatalog: MovementPillar[] = ['push', 'pull', 'core', 'legs', 'mobility', 'endurance'];
            const staticSkillCatalog = pillarsForCatalog.flatMap((pillar) =>
              Object.values(SKILL_DEFINITIONS[pillar] || {})
                .flatMap((defs) => defs || [])
                .map((skill) => ({
                  id: skill.id,
                  name: skill.name,
                  pillar: skill.pillar,
                  level: skill.level,
                  source: skill.source || 'core',
                }))
            );
            const customSkillCatalog = pillarsForCatalog.flatMap((pillar) =>
              (currentState.user?.customSkills?.[pillar] || []).map((skill) => ({
                id: skill.id,
                name: skill.name,
                pillar: skill.pillar,
                level: skill.level,
                source: skill.source || 'adaptive-ai',
                tags: skill.tags || [],
                reason: skill.clinicalReason || '',
              }))
            );
            result = { 
                result: JSON.stringify({
                    profile: currentState.user,
                    quests: { daily: currentState.dailyQuests, weekly: currentState.weeklyQuests },
                    progress: currentState.pillarLevels,
                    skills: currentState.user?.userSkills || {},
                    customSkills: currentState.user?.customSkills || {},
                    skillConstraints: currentState.user?.skillConstraints || {},
                    skillCatalog: [...staticSkillCatalog, ...customSkillCatalog],
                    recovery: currentState.recoveryStatus,
                    equipment: {
                      hasGymAccess: currentState.hasGymAccess,
                      availableEquipment: currentState.availableEquipment,
                      inventory: currentState.equipment,
                    },
                    history: {
                      questHistory: currentState.questHistory,
                      trainingHistory: currentState.trainingHistory,
                      trainingLogs: currentState.trainingLogs,
                      lastCheckIn: currentState.lastCheckIn,
                    },
                }) 
            };
            break;

          case 'update_bio':
            const currentBio = useAppStore.getState().user?.bioData || "";
            const newBio = args.operation === 'append' 
                ? `${currentBio}\n${args.bioUpdate}` 
                : args.bioUpdate;
            
            // Direct state mutation for bio (assuming user exists)
            useAppStore.setState((state) => {
                if (!state.user) return state;
                return { 
                    user: { ...state.user, bioData: newBio } 
                };
            });
            result = { result: "Bio data updated in System Core." };
            break;

          case 'update_equipment':
            const incomingItems: string[] = Array.isArray(args.items)
              ? args.items.map((item: unknown) => String(item))
              : typeof args.items === 'string'
              ? args.items.split(/[\n,;]+/)
              : [];
            const normalizedItems: string[] = Array.from(
              new Set(incomingItems.map((item) => item.trim()).filter(Boolean))
            );
            const hasGymAccessArg =
              typeof args.hasGymAccess === 'boolean' ? args.hasGymAccess : undefined;
            const resolvedGymAccess =
              typeof hasGymAccessArg === 'boolean'
                ? hasGymAccessArg
                : normalizedItems.length > 0
                ? true
                : useAppStore.getState().hasGymAccess;

            useAppStore.setState((state) => ({
              availableEquipment: normalizedItems,
              equipment: buildEquipmentCatalogFromNames(normalizedItems, 'system'),
              hasGymAccess: resolvedGymAccess ?? state.hasGymAccess,
              user: state.user
                ? {
                    ...state.user,
                    availableEquipment: normalizedItems,
                    hasGymAccess: resolvedGymAccess ?? state.user.hasGymAccess,
                  }
                : state.user,
            }));
            result = {
              result: `Equipamentos atualizados: ${normalizedItems.join(', ') || 'nenhum'}. Gym access: ${
                resolvedGymAccess ? 'sim' : 'nao'
              }.`,
            };
            break;

          case 'update_user_context':
            useAppStore.setState((state) => {
              if (!state.user) return state;

              const incomingTime = Number(args.availableTime);
              const incomingFrequency = Number(args.trainingFrequency);
              const allowedObjectives = new Set(['lose-weight', 'gain-muscle', 'maintain']);
              const allowedFitnessLevels = new Set(['beginner', 'intermediate', 'advanced']);

              const nextAvailableTime = Number.isFinite(incomingTime)
                ? Math.max(10, Math.min(180, Math.floor(incomingTime)))
                : state.user.availableTime;
              const nextTrainingFrequency = Number.isFinite(incomingFrequency)
                ? Math.max(1, Math.min(7, Math.floor(incomingFrequency)))
                : state.user.trainingFrequency;
              const nextObjective: Objective =
                typeof args.objective === 'string' && allowedObjectives.has(args.objective)
                  ? (args.objective as Objective)
                  : state.user.objective;
              const nextFitnessLevel: FitnessLevel =
                typeof args.fitnessLevel === 'string' && allowedFitnessLevels.has(args.fitnessLevel)
                  ? (args.fitnessLevel as FitnessLevel)
                  : state.user.fitnessLevel;
              const nextGymAccess =
                typeof args.hasGymAccess === 'boolean'
                  ? args.hasGymAccess
                  : state.user.hasGymAccess ?? state.hasGymAccess;

              return {
                hasGymAccess: nextGymAccess ?? state.hasGymAccess,
                user: {
                  ...state.user,
                  hasGymAccess: nextGymAccess,
                  availableTime: nextAvailableTime,
                  trainingFrequency: nextTrainingFrequency,
                  objective: nextObjective,
                  fitnessLevel: nextFitnessLevel,
                },
              };
            });
            result = { result: 'Contexto de treino atualizado com sucesso.' };
            break;

          case 'update_performance_profile':
            useAppStore.setState((state) => {
              if (!state.user) return state;

              const clamp = (value: number, min: number, max: number) =>
                Math.max(min, Math.min(max, Math.floor(value)));
              const allowedRanks = new Set<Rank>(['E', 'D', 'C', 'B', 'A', 'S']);
              const pillars: MovementPillar[] = [
                'push',
                'pull',
                'core',
                'legs',
                'mobility',
                'endurance',
              ];
              const resolvePillarXpToNext = (level: number) =>
                level <= 0 ? 100 : Math.max(100, Math.floor(150 * Math.pow(1.2, level)));
              const resolveAutoUnlockCount = (level: number, availableSkills: number) =>
                level <= 0 ? Math.min(availableSkills, 2) : Math.min(availableSkills, 3);

              const nextRank =
                typeof args.rank === 'string' && allowedRanks.has(args.rank as Rank)
                  ? (args.rank as Rank)
                  : state.user.rank;

              const nextStats: UserStats = { ...state.user.stats };
              const incomingStats =
                args.stats && typeof args.stats === 'object'
                  ? (args.stats as Record<string, unknown>)
                  : undefined;
              if (incomingStats) {
                (['push', 'pull', 'legs', 'core', 'endurance', 'mobility'] as const).forEach((key) => {
                  const value = Number(incomingStats[key]);
                  if (Number.isFinite(value)) nextStats[key] = clamp(value, 1, 100);
                });
              }

              const nextRadarStats: RadarStats = { ...state.user.radarStats };
              const incomingRadar =
                args.radarStats && typeof args.radarStats === 'object'
                  ? (args.radarStats as Record<string, unknown>)
                  : undefined;
              if (incomingRadar) {
                (['force', 'explosion', 'resistance', 'mobility', 'mechanics', 'coordination'] as const).forEach(
                  (key) => {
                    const value = Number(incomingRadar[key]);
                    if (Number.isFinite(value)) nextRadarStats[key] = clamp(value, 1, 100);
                  }
                );
              }

              const nextPillarLevels = { ...state.pillarLevels };
              const nextUserSkills = { ...(state.user.userSkills || {}) };
              const incomingPillarLevels =
                args.pillarLevels && typeof args.pillarLevels === 'object'
                  ? (args.pillarLevels as Record<string, unknown>)
                  : undefined;

              if (incomingPillarLevels) {
                for (const pillar of pillars) {
                  const rawLevel = Number(incomingPillarLevels[pillar]);
                  if (!Number.isFinite(rawLevel)) continue;
                  const level = clamp(rawLevel, 0, 4);
                  const current = nextPillarLevels[pillar];
                  const unlockedSkillIds = new Set<string>(current?.unlockedSkills || []);

                  for (let skillLevel = 0; skillLevel <= level; skillLevel += 1) {
                    const defs = SKILL_DEFINITIONS[pillar]?.[skillLevel] || [];
                    const unlockCount =
                      skillLevel < level
                        ? defs.length
                        : resolveAutoUnlockCount(skillLevel, defs.length);
                    for (const def of defs.slice(0, unlockCount)) {
                      unlockedSkillIds.add(def.id);
                      const existing = nextUserSkills[def.id];
                      nextUserSkills[def.id] = {
                        skillId: def.id,
                        unlocked: true,
                        unlockedAt: existing?.unlockedAt || new Date(),
                        masteryLevel: existing?.masteryLevel ?? 0,
                      };
                    }
                  }

                  const xpToNext = resolvePillarXpToNext(level);
                  const safeCurrentXp = Number.isFinite(Number(current?.xp))
                    ? Number(current?.xp)
                    : 0;

                  nextPillarLevels[pillar] = {
                    ...current,
                    level,
                    xp: Math.max(0, Math.min(safeCurrentXp, Math.max(0, xpToNext - 1))),
                    xpToNext,
                    unlockedSkills: Array.from(unlockedSkillIds),
                  };
                }
              }

              return {
                pillarLevels: nextPillarLevels,
                user: {
                  ...state.user,
                  rank: nextRank,
                  stats: nextStats,
                  radarStats: nextRadarStats,
                  pillarLevels: nextPillarLevels,
                  userSkills: nextUserSkills,
                },
              };
            });
            result = { result: 'Perfil de performance recalibrado no System Core.' };
            break;

          case 'manage_debuffs':
            useAppStore.setState((state) => {
              if (!state.user) return state;

              const action = String(args.action || 'add').toLowerCase();
              const currentDebuffs: Debuff[] = Array.isArray(state.user.debuffs)
                ? state.user.debuffs
                : [];
              let nextDebuffs = [...currentDebuffs];

              const normalize = (value: string) =>
                value
                  .toLowerCase()
                  .normalize('NFD')
                  .replace(/[\u0300-\u036f]/g, '')
                  .replace(/[^a-z0-9 ]/g, ' ')
                  .replace(/\s+/g, ' ')
                  .trim();

              if (action === 'clear') {
                nextDebuffs = [];
              } else if (action === 'remove' || action === 'resolve') {
                const targetId =
                  typeof args.debuffId === 'string' ? args.debuffId.trim() : '';
                const targetName =
                  typeof args.debuffName === 'string' ? normalize(args.debuffName) : '';
                nextDebuffs = currentDebuffs.filter((debuff) => {
                  if (targetId && debuff.id === targetId) return false;
                  if (targetName && normalize(debuff.name) === targetName) return false;
                  return true;
                });
              } else if (action === 'add') {
                const data = args.debuffData || {};
                const name =
                  typeof data.name === 'string' && data.name.trim()
                    ? data.name.trim()
                    : typeof args.debuffName === 'string' && args.debuffName.trim()
                    ? args.debuffName.trim()
                    : '';
                if (!name) return state;
                const description =
                  typeof data.description === 'string' && data.description.trim()
                    ? data.description.trim()
                    : 'Limitacao registrada pelo System Core.';
                const affectedExercises = Array.isArray(data.affectedExercises)
                  ? data.affectedExercises.map((entry: unknown) => String(entry).trim()).filter(Boolean)
                  : [];
                const debuffId = `debuff-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
                const nextDebuff: Debuff = {
                  id: debuffId,
                  name,
                  description,
                  icon: typeof data.icon === 'string' && data.icon.trim() ? data.icon.trim() : 'AlertTriangle',
                  affectedExercises,
                };
                nextDebuffs = [...currentDebuffs, nextDebuff];
              }

              return {
                recoveryStatus: {
                  ...state.recoveryStatus,
                  debuffs: nextDebuffs,
                },
                user: {
                  ...state.user,
                  debuffs: nextDebuffs,
                },
              };
            });
            result = { result: 'Debuffs atualizados no perfil e no status de recovery.' };
            break;

          case 'manage_skills':
            useAppStore.setState((state) => {
              if (!state.user) return state;
              const currentUser = state.user;

              const pillars: MovementPillar[] = ['push', 'pull', 'core', 'legs', 'mobility', 'endurance'];
              const isPillar = (value: unknown): value is MovementPillar =>
                typeof value === 'string' && pillars.includes(value as MovementPillar);
              const clamp = (value: number, min: number, max: number) =>
                Math.max(min, Math.min(max, Math.floor(value)));
              const normalizeTags = (value: unknown): string[] => {
                if (!Array.isArray(value)) return [];
                return Array.from(
                  new Set(
                    value
                      .map((entry) => String(entry).trim())
                    .filter(Boolean)
                  )
                );
              };
              const normalizeSkillText = (value: string) =>
                value
                  .toLowerCase()
                  .normalize('NFD')
                  .replace(/[\u0300-\u036f]/g, '')
                  .replace(/[^a-z0-9 ]/g, ' ')
                  .replace(/\s+/g, ' ')
                  .trim();
              const collectSkillIds = () => {
                const ids = new Set<string>();
                if (typeof args.skillId === 'string' && args.skillId.trim()) ids.add(args.skillId.trim());
                if (Array.isArray(args.skillIds)) {
                  args.skillIds
                    .map((entry: unknown) => String(entry).trim())
                    .filter(Boolean)
                    .forEach((id: string) => ids.add(id));
                }
                const requestedNames = Array.isArray(args.skillNames)
                  ? args.skillNames
                      .map((entry: unknown) => normalizeSkillText(String(entry)))
                      .filter(Boolean)
                  : [];
                if (requestedNames.length > 0) {
                  const catalog: Array<{ id: string; name: string }> = [];
                  for (const pillar of pillars) {
                    const staticDefs = Object.values(SKILL_DEFINITIONS[pillar] || {}).flatMap(
                      (defs) => defs || []
                    );
                    staticDefs.forEach((skill) => catalog.push({ id: skill.id, name: skill.name }));
                    (currentUser.customSkills?.[pillar] || []).forEach((skill) =>
                      catalog.push({ id: skill.id, name: skill.name })
                    );
                  }
                  for (const skill of catalog) {
                    const normalizedName = normalizeSkillText(skill.name);
                    if (!normalizedName) continue;
                    const matched = requestedNames.some(
                      (target: string) =>
                        normalizedName === target ||
                        normalizedName.includes(target) ||
                        target.includes(normalizedName)
                    );
                    if (matched) ids.add(skill.id);
                  }
                }
                return Array.from(ids);
              };
              const resolveSkillById = (
                skillId: string,
                customSkills: Record<MovementPillar, SkillDefinition[]>
              ) => {
                for (const pillar of pillars) {
                  const staticFound = Object.values(SKILL_DEFINITIONS[pillar] || {})
                    .flatMap((defs) => defs || [])
                    .find((skill) => skill.id === skillId);
                  if (staticFound) return { skill: staticFound, isCustom: false as const };

                  const customFound = (customSkills[pillar] || []).find((skill) => skill.id === skillId);
                  if (customFound) return { skill: customFound, isCustom: true as const };
                }
                return undefined;
              };

              const action = String(args.action || '').toLowerCase();
              const reason =
                (typeof args.reason === 'string' && args.reason.trim()) ||
                (typeof args.skillData?.clinicalReason === 'string' && args.skillData.clinicalReason.trim()) ||
                'Ajuste aplicado pelo System Core.';
              const condition =
                typeof args.condition === 'string' && args.condition.trim() ? args.condition.trim() : undefined;
              const tags = Array.from(
                new Set([
                  ...normalizeTags(args.tags),
                  ...normalizeTags(args.skillData?.tags),
                  ...(condition ? [condition] : []),
                ])
              );

              const customSkills: Record<MovementPillar, SkillDefinition[]> = {
                push: [...(currentUser.customSkills?.push || [])],
                pull: [...(currentUser.customSkills?.pull || [])],
                core: [...(currentUser.customSkills?.core || [])],
                legs: [...(currentUser.customSkills?.legs || [])],
                mobility: [...(currentUser.customSkills?.mobility || [])],
                endurance: [...(currentUser.customSkills?.endurance || [])],
              };
              const skillConstraints = { ...(currentUser.skillConstraints || {}) };
              const userSkills = { ...(currentUser.userSkills || {}) };
              const nextPillarLevels = { ...state.pillarLevels };

              const ensureSkillUnlocked = (skillId: string, pillar: MovementPillar) => {
                const existing = userSkills[skillId];
                userSkills[skillId] = {
                  skillId,
                  unlocked: true,
                  unlockedAt: existing?.unlockedAt || new Date(),
                  masteryLevel: existing?.masteryLevel ?? 0,
                };
                const pillarState = nextPillarLevels[pillar];
                if (!pillarState) return;
                nextPillarLevels[pillar] = {
                  ...pillarState,
                  unlockedSkills: Array.from(new Set([...(pillarState.unlockedSkills || []), skillId])),
                };
              };

              if (action === 'add') {
                const targetPillar = isPillar(args.skillData?.pillar)
                  ? (args.skillData.pillar as MovementPillar)
                  : isPillar(args.pillar)
                  ? (args.pillar as MovementPillar)
                  : 'mobility';
                const targetLevel = Number.isFinite(Number(args.skillData?.level))
                  ? clamp(Number(args.skillData.level), 0, 4)
                  : clamp(Number(nextPillarLevels[targetPillar]?.level ?? 0), 0, 4);
                const baseId =
                  typeof args.skillData?.id === 'string' && args.skillData.id.trim()
                    ? args.skillData.id.trim()
                    : `adaptive-${targetPillar}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
                let skillId = baseId;
                if (resolveSkillById(skillId, customSkills)) {
                  skillId = `${baseId}-${Math.random().toString(36).slice(2, 5)}`;
                }
                const name =
                  typeof args.skillData?.name === 'string' && args.skillData.name.trim()
                    ? args.skillData.name.trim()
                    : `Adaptive ${targetPillar.toUpperCase()} Skill`;
                const description =
                  typeof args.skillData?.description === 'string' && args.skillData.description.trim()
                    ? args.skillData.description.trim()
                    : `Movimento adaptado para ${condition || 'contexto clinico'} com foco em seguranca.`;
                const benefits = Array.isArray(args.skillData?.benefits)
                  ? args.skillData.benefits.map((entry: unknown) => String(entry).trim()).filter(Boolean)
                  : ['Movimento adaptado com foco terapeutico e controle de dor.'];
                const staticCountAtLevel = (SKILL_DEFINITIONS[targetPillar]?.[targetLevel] || []).length;
                const customCountAtLevel = customSkills[targetPillar].filter(
                  (skill) => Number(skill.level) === targetLevel
                ).length;

                const newSkill: SkillDefinition = {
                  id: skillId,
                  name,
                  description,
                  pillar: targetPillar,
                  level: targetLevel,
                  skillIndex: staticCountAtLevel + customCountAtLevel,
                  requirements: {
                    pillarLevel: targetLevel,
                    description:
                      typeof args.skillData?.requirementDescription === 'string' &&
                      args.skillData.requirementDescription.trim()
                        ? args.skillData.requirementDescription.trim()
                        : `Skill adaptativa para ${condition || 'restricao clinica'}.`,
                  },
                  benefits,
                  icon: 'Adaptive',
                  tags,
                  clinicalReason: reason,
                  source: 'adaptive-ai',
                };

                const withoutSameId = customSkills[targetPillar].filter((skill) => skill.id !== newSkill.id);
                customSkills[targetPillar] = [...withoutSameId, newSkill];
                ensureSkillUnlocked(newSkill.id, targetPillar);

                if (skillConstraints[newSkill.id]?.status === 'disabled') {
                  skillConstraints[newSkill.id] = {
                    ...skillConstraints[newSkill.id],
                    status: 'active',
                    reason,
                    condition,
                    tags,
                    updatedAt: new Date(),
                  };
                }

                result = {
                  result: `Skill adaptativa criada (${newSkill.id}) em ${targetPillar} com tags: ${
                    tags.join(', ') || 'sem tags'
                  }.`,
                };
              } else if (action === 'disable') {
                const ids = collectSkillIds();
                for (const skillId of ids) {
                  const found = resolveSkillById(skillId, customSkills);
                  if (!found) continue;
                  skillConstraints[skillId] = {
                    skillId,
                    status: 'disabled',
                    reason,
                    condition,
                    tags,
                    updatedAt: new Date(),
                  };
                }
                result = { result: `${ids.length} skill(s) marcadas como desativadas por seguranca.` };
              } else if (action === 'enable') {
                const ids = collectSkillIds();
                for (const skillId of ids) {
                  if (!skillConstraints[skillId]) continue;
                  skillConstraints[skillId] = {
                    ...skillConstraints[skillId],
                    status: 'active',
                    reason,
                    condition,
                    tags,
                    updatedAt: new Date(),
                  };
                }
                result = { result: `${ids.length} skill(s) reativadas.` };
              } else if (action === 'remove') {
                const ids = collectSkillIds();
                for (const skillId of ids) {
                  let removedCustom = false;
                  for (const pillar of pillars) {
                    const prevLength = customSkills[pillar].length;
                    customSkills[pillar] = customSkills[pillar].filter((skill) => skill.id !== skillId);
                    if (customSkills[pillar].length !== prevLength) {
                      removedCustom = true;
                    }
                    nextPillarLevels[pillar] = {
                      ...nextPillarLevels[pillar],
                      unlockedSkills: (nextPillarLevels[pillar].unlockedSkills || []).filter(
                        (id) => id !== skillId
                      ),
                    };
                  }
                  if (removedCustom) {
                    delete userSkills[skillId];
                    delete skillConstraints[skillId];
                  } else {
                    skillConstraints[skillId] = {
                      skillId,
                      status: 'disabled',
                      reason,
                      condition,
                      tags,
                      updatedAt: new Date(),
                    };
                  }
                }
                result = { result: `${ids.length} skill(s) removidas/custom ou desativadas.` };
              } else {
                result = { result: "Acao de manage_skills invalida." };
              }

              return {
                pillarLevels: nextPillarLevels,
                user: {
                  ...currentUser,
                  pillarLevels: nextPillarLevels,
                  userSkills,
                  customSkills,
                  skillConstraints,
                },
              };
            });
            break;

          case 'manage_quests':
            if (args.action === 'add' && args.questData) {
                const normalizedXpReward =
                    typeof args.questData.xpReward === 'number' && Number.isFinite(args.questData.xpReward)
                        ? Math.max(18, Math.min(40, Math.floor(args.questData.xpReward)))
                        : 24;
                const newQuest: Quest = {
                    id: crypto.randomUUID(),
                    name: args.questData.title || "System Directive",
                    description: args.questData.description || "Auto-generated task",
                    executionGuide: args.questData.executionGuide || "Execute com tecnica controlada e sem dor.",
                    xpReward: normalizedXpReward,
                    skillId:
                      typeof args.questData.skillId === 'string' ? args.questData.skillId : undefined,
                    skillLevel:
                      typeof args.questData.skillLevel === 'number'
                        ? Math.max(0, Math.floor(args.questData.skillLevel))
                        : undefined,
                    skillTags: Array.isArray(args.questData.skillTags)
                      ? args.questData.skillTags.map((entry: unknown) => String(entry).trim()).filter(Boolean)
                      : undefined,
                    skillReason:
                      typeof args.questData.skillReason === 'string' && args.questData.skillReason.trim()
                        ? args.questData.skillReason.trim()
                        : undefined,
                    type: 'daily',
                    difficulty: (args.questData.difficulty as any) || 'medium',
                    status: 'pending',
                    pillar: (args.questData.pillar as any) || 'endurance',
                    sets: 3,
                    reps: '10-12',
                };
                useAppStore.setState((state) => ({
                    dailyQuests: [...state.dailyQuests, newQuest]
                }));
                result = { result: `Quest '${newQuest.name}' added to protocol.` };
            } else if (args.action === 'update' && args.questId && args.questData) {
                const normalizeQuest = (quest: Quest): Quest => {
                  if (quest.id !== args.questId) return quest;
                  const normalizedXpReward =
                    typeof args.questData.xpReward === 'number' && Number.isFinite(args.questData.xpReward)
                      ? Math.max(18, Math.min(220, Math.floor(args.questData.xpReward)))
                      : quest.xpReward;
                  const nextPillar =
                    typeof args.questData.pillar === 'string' &&
                    ['push', 'pull', 'core', 'legs', 'mobility', 'endurance'].includes(args.questData.pillar)
                      ? (args.questData.pillar as Quest['pillar'])
                      : quest.pillar;
                  const nextDifficulty =
                    args.questData.difficulty === 'easy' ||
                    args.questData.difficulty === 'medium' ||
                    args.questData.difficulty === 'hard'
                      ? args.questData.difficulty
                      : quest.difficulty;

                  return {
                    ...quest,
                    name:
                      typeof args.questData.title === 'string' && args.questData.title.trim()
                        ? args.questData.title.trim()
                        : quest.name,
                    description:
                      typeof args.questData.description === 'string' && args.questData.description.trim()
                        ? args.questData.description.trim()
                        : quest.description,
                    executionGuide:
                      typeof args.questData.executionGuide === 'string' && args.questData.executionGuide.trim()
                        ? args.questData.executionGuide.trim()
                        : quest.executionGuide,
                    xpReward: normalizedXpReward,
                    pillar: nextPillar,
                    difficulty: nextDifficulty,
                    skillId:
                      typeof args.questData.skillId === 'string' ? args.questData.skillId : quest.skillId,
                    skillLevel:
                      typeof args.questData.skillLevel === 'number'
                        ? Math.max(0, Math.floor(args.questData.skillLevel))
                        : quest.skillLevel,
                    skillTags: Array.isArray(args.questData.skillTags)
                      ? args.questData.skillTags.map((entry: unknown) => String(entry).trim()).filter(Boolean)
                      : quest.skillTags,
                    skillReason:
                      typeof args.questData.skillReason === 'string' && args.questData.skillReason.trim()
                        ? args.questData.skillReason.trim()
                        : quest.skillReason,
                  };
                };
                useAppStore.setState((state) => ({
                  dailyQuests: state.dailyQuests.map(normalizeQuest),
                  weeklyQuests: state.weeklyQuests.map(normalizeQuest),
                }));
                result = { result: `Quest '${args.questId}' updated.` };
            } else if (args.action === 'remove' && args.questId) {
                useAppStore.setState((state) => ({
                    dailyQuests: state.dailyQuests.filter(q => q.id !== args.questId),
                     weeklyQuests: state.weeklyQuests.filter(q => q.id !== args.questId)
                }));
                result = { result: "Quest removed from protocol." };
            }
            break;

          case 'generate_training':
            const { user: trainingUser, pillarLevels: trainingPillars, geminiApiKey: trainingApiKey } = useAppStore.getState();
            if (!trainingUser || !trainingApiKey) {
                result = { result: "User data or API key not available." };
                break;
            }

            // Generate training based on unlocked skills
            const unlockedSkills = Object.entries(trainingUser.userSkills || {})
                .filter(([_, skill]) => skill.unlocked)
                .map(([skillId, _]) => skillId);

            // Create training protocol using skills
            const trainingProtocol = {
                skills: unlockedSkills,
                customSkills: trainingUser.customSkills || {},
                skillConstraints: trainingUser.skillConstraints || {},
                pillarLevels: trainingPillars,
                fitnessLevel: trainingUser.fitnessLevel,
                availableTime: trainingUser.availableTime,
                trainingFrequency: trainingUser.trainingFrequency,
                availableEquipment: useAppStore.getState().availableEquipment,
                debuffs: trainingUser.debuffs,
                trainingHistory: useAppStore.getState().trainingHistory.slice(-20),
            };

            result = { result: JSON.stringify(trainingProtocol) };
            break;

          case 'validate_level_up':
            const { user: validationUser, pillarLevels: validationPillars } = useAppStore.getState();
            if (!validationUser) {
                result = { result: "User data not available." };
                break;
            }

            const pillar = args.pillar as MovementPillar;
            const currentLevel = validationPillars[pillar]?.level || 0;
            const skillsForCurrentLevel = SKILL_DEFINITIONS[pillar]?.[currentLevel] || [];
            
            // Check if user can attempt level up
            const canAttempt = currentLevel < 4;
            const requiredSkills = Object.entries(validationUser.userSkills || {})
                .filter(([skillId, skill]) => {
                    // Check if skill belongs to current level and pillar
                    const skillDef = SKILL_DEFINITIONS[pillar]?.[currentLevel]?.find(s => s.id === skillId);
                    return skillDef && skill.unlocked;
                });
            const requiredSkillsCount =
                skillsForCurrentLevel.length > 0 ? Math.max(2, Math.ceil(skillsForCurrentLevel.length * 0.6)) : 0;
            const hasRequiredSkills = requiredSkills.length >= requiredSkillsCount;
            
            result = { 
                result: JSON.stringify({
                    canAttempt,
                    currentLevel,
                    hasRequiredSkills,
                    unlockedSkillsCount: requiredSkills.length,
                    requiredSkillsCount,
                    validation: canAttempt && hasRequiredSkills
                })
            };
            break;

          default:
            result = { result: "Unknown Protocol." };
        }
      } catch (e: any) {
        console.error("Tool execution error", e);
        result = { result: `System Error: ${e.message}` };
      }

      responses.push({
        id: call.id, 
        name: name,
        response: result
      });
    }

    setProcessingTool(false);
    return responses;
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading || !apiKey) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      if (!chatInstance.current) {
        chatInstance.current = createSystemChat(apiKey, messages); 
      }
      
      let result = await chatInstance.current.sendMessage({ message: userMsg.text });
      
      let functionCalls = result?.functionCalls;
      
      while (functionCalls && functionCalls.length > 0) {
        const toolResponses = await executeTools(functionCalls);
        
        result = await chatInstance.current.sendMessage({
          message: toolResponses.map(tr => ({
            functionResponse: tr
          }))
        });
        
        functionCalls = result?.functionCalls;
      }

      const responseText = result?.text;
      
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: responseText || "System Acknowledged.",
        timestamp: Date.now()
      }]);

    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: "CONNECTION INTERRUPTED. Check API Key or Network.",
        timestamp: Date.now()
      }]);
    } finally {
      setIsLoading(false);
      setProcessingTool(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          
          {/* Panel */}
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-full md:w-[450px] bg-shadow-900 border-l border-neon-blue/20 z-50 flex flex-col shadow-[0_0_50px_rgba(0,212,255,0.1)]"
          >
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-gradient-to-r from-shadow-800 to-shadow-900">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-neon-blue/10 flex items-center justify-center border border-neon-blue/50">
                    <Sparkles className="w-4 h-4 text-neon-blue" />
                </div>
                <div>
                    <h2 className="font-display font-bold text-white tracking-wide">SYSTEM CORE</h2>
                    <p className="text-[10px] text-neon-blue font-mono uppercase tracking-widest">Online</p>
                </div>
              </div>
              <button 
                onClick={onClose} 
                className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/50 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-shadow-900">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-lg px-4 py-3 text-sm border ${
                      msg.role === 'user'
                        ? 'bg-neon-blue/10 border-neon-blue/30 text-white rounded-br-none'
                        : 'bg-shadow-800 border-white/10 text-white/80 rounded-bl-none'
                    }`}
                  >
                    <div className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-black/50 prose-pre:border prose-pre:border-white/10">
                      <ReactMarkdown>
                        {msg.text || "..."}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              ))}
              
              {(isLoading || processingTool) && (
                 <div className="flex justify-start">
                   <div className="bg-shadow-800 px-4 py-3 rounded-lg rounded-bl-none border border-white/10 flex items-center gap-3">
                     {processingTool ? (
                        <>
                          <Terminal className="w-4 h-4 animate-pulse text-neon-purple" />
                          <span className="text-xs text-neon-purple font-mono">EXECUTING PROTOCOLS...</span>
                        </>
                     ) : (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-neon-blue" />
                          <span className="text-xs text-neon-blue font-mono">PROCESSING...</span>
                        </>
                     )}
                   </div>
                 </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <GlassPanel className="p-4 border-t border-white/10 !bg-shadow-800/80 !rounded-none">
              <div className="flex items-center gap-2 relative">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Insert System Command..."
                  className="w-full resize-none border border-white/10 rounded bg-black/50 py-3 pl-4 pr-12 text-white font-mono text-sm focus:border-neon-blue focus:outline-none transition-colors max-h-32 placeholder:text-white/20"
                  rows={1}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 p-2 bg-neon-blue/20 text-neon-blue border border-neon-blue/50 rounded hover:bg-neon-blue/40 disabled:opacity-50 disabled:grayscale transition-all"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </GlassPanel>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
