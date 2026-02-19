'use client';

import { motion } from 'framer-motion';
import { 
  Flame,
  Zap,
  Shield,
  Heart,
  Move,
  Dumbbell,
  Lock,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Trophy,
  AlertTriangle,
  Star,
  Target
} from 'lucide-react';
import { GlassPanel } from '@/components/ui/CyberFrame';
import { useAppStore } from '@/store/useAppStore';
import { PILLAR_NAMES, type MovementPillar, type SkillDefinition } from '@/types';
import { SKILL_DEFINITIONS, LEVEL_UP_CHALLENGES } from '@/lib/skillDefinitions';
import { getGymSkillDefinitionsByPillar } from '@/lib/gymSkillVariants';
import { useEffect, useState } from 'react';

interface SkillNode {
  id: string;
  name: string;
  pillar: MovementPillar;
  level: number;
  skillIndex: number;
  description: string;
  unlocked: boolean;
  icon: string;
  benefits: string[];
  requirements: {
    pillarLevel: number;
    description: string;
  };
  tags?: string[];
  clinicalReason?: string;
  source?: string;
  disabled?: boolean;
  disabledReason?: string;
}

const pillarColors: Record<MovementPillar, string> = {
  push: '#ef4444', // Red
  pull: '#eab308', // Yellow
  legs: '#3b82f6', // Blue
  core: '#8b5cf6', // Indigo/Purple
  endurance: '#ec4899', // Pink
  mobility: '#22c55e', // Green
};

const dedupeSkillDefinitionsById = (skills: SkillDefinition[]) => {
  const seen = new Set<string>();
  return skills.filter((skill) => {
    if (!skill?.id || seen.has(skill.id)) return false;
    seen.add(skill.id);
    return true;
  });
};

interface SkillCardProps {
  skill: SkillNode;
}

function SkillCard({ skill }: SkillCardProps) {
  const color = pillarColors[skill.pillar];
  
  return (
    <motion.div
      whileHover={{ scale: skill.unlocked && !skill.disabled ? 1.02 : 1 }}
      className={`
        group relative p-4 rounded-lg border transition-all duration-300
        ${skill.disabled
          ? 'bg-red-950/20 border-red-500/40 opacity-80'
          : skill.unlocked 
          ? 'bg-shadow-700/50 border-white/10 hover:border-neon-blue/30 cursor-pointer'
          : 'bg-shadow-800/50 border-white/5 opacity-50'
        }
      `}
    >
      {!skill.unlocked && (
        <div className="absolute top-2 right-2 flex gap-2">
            <Lock className="w-4 h-4 text-white/30" />
        </div>
      )}

       {skill.unlocked && !skill.disabled && (
        <div className="absolute top-2 right-2 flex gap-2">
            <Star className="w-4 h-4 text-yellow-400" />
        </div>
      )}

       {/* Help Tooltip */}
       <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="relative group/tooltip">
                <HelpCircle className="w-4 h-4 text-white/20 hover:text-white/60" />
                <div className="absolute right-0 top-6 w-48 bg-black/90 border border-white/10 p-2 rounded text-[10px] text-white/70 z-50 pointer-events-none opacity-0 group-hover/tooltip:opacity-100 transition-opacity">
                    {skill.disabled
                        ? `Skill desativada: ${skill.disabledReason || 'restricao clinica ativa'}`
                        : skill.unlocked 
                        ? `Skill desbloqueada! ${skill.benefits.join(', ')}`
                        : `Requer nível ${skill.requirements.pillarLevel} em ${PILLAR_NAMES[skill.pillar]}`
                    }
                </div>
            </div>
      </div>
      
      <div className="flex items-start gap-3">
        <div 
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ background: `${color}20`, border: `1px solid ${color}40` }}
        >
          <div className="w-6 h-6 rounded" style={{ background: color }} />
        </div>
        
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1 pr-6">
            <span className="font-display font-semibold text-white">{skill.name}</span>
            <span className="text-xs font-mono text-neon-blue">
                Nível {skill.level}.{skill.skillIndex}
            </span>
          </div>
          
          <div className="text-xs mb-2">
             <span className="text-white/40">{skill.description}</span>
          </div>

          {skill.unlocked && !skill.disabled && (
            <div className="text-xs text-green-400 mb-2">
              ✓ {skill.benefits.join(' • ')}
            </div>
          )}

          {skill.disabled ? (
            <div className="text-xs text-red-300 mb-2">
              ⚠ Desativada por segurança: {skill.disabledReason || 'restrição clínica ativa'}
            </div>
          ) : null}

          {Array.isArray(skill.tags) && skill.tags.length > 0 ? (
            <div className="flex flex-wrap gap-1 mb-2">
              {skill.tags.map((tag) => (
                <span
                  key={`${skill.id}-${tag}`}
                  className="px-2 py-0.5 text-[10px] rounded border border-amber-400/30 bg-amber-400/10 text-amber-200"
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : null}

          {skill.clinicalReason ? (
            <div className="text-[11px] text-amber-100/80 mb-2">{skill.clinicalReason}</div>
          ) : null}

          {skill.source === 'adaptive-ai' ? (
            <div className="text-[10px] text-neon-blue/80 uppercase tracking-wider mb-2">Adaptive Skill</div>
          ) : null}
          
          {/* Progress bar */}
          <div className="h-1.5 bg-black/30 rounded-full overflow-hidden border border-white/10">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: skill.unlocked && !skill.disabled ? '100%' : '0%' }}
              transition={{ duration: 0.5 }}
              className="h-full rounded-full"
              style={{ background: skill.disabled ? '#ef4444' : color }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function SkillsPage() {
  const user = useAppStore((state) => state.user);
  const pillarLevels = useAppStore((state) => state.pillarLevels);
  const availableEquipment = useAppStore((state) => state.availableEquipment);
  const userSkills = user?.userSkills || {};
  const customSkillsByPillar = user?.customSkills || {
    push: [],
    pull: [],
    core: [],
    legs: [],
    mobility: [],
    endurance: [],
  };
  const skillConstraints = user?.skillConstraints || {};
  const hasGymAccess = user?.hasGymAccess;

  const pillars: MovementPillar[] = ['push', 'pull', 'core', 'legs', 'mobility', 'endurance'];
  const [selectedPillar, setSelectedPillar] = useState<MovementPillar>('push');
  const currentPillarLevel = pillarLevels[selectedPillar]?.level || 0;
  const [selectedLevel, setSelectedLevel] = useState<number>(currentPillarLevel);
  const [validationResults, setValidationResults] = useState<Record<string, any>>({});
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    setSelectedLevel(currentPillarLevel);
  }, [selectedPillar, currentPillarLevel]);

  // Generate skills for selected pillar and level
  const skillsForCurrentView = SKILL_DEFINITIONS[selectedPillar]?.[selectedLevel] || [];
  const customSkillsForCurrentView = (customSkillsByPillar[selectedPillar] || []).filter(
    (skillDef) => Number(skillDef.level) === selectedLevel
  );
  const mergedSkillsForCurrentView = dedupeSkillDefinitionsById([
    ...skillsForCurrentView,
    ...customSkillsForCurrentView,
  ]);
  
  const skillNodes: SkillNode[] = mergedSkillsForCurrentView.map(skillDef => ({
    id: skillDef.id,
    name: skillDef.name,
    pillar: skillDef.pillar,
    level: skillDef.level,
    skillIndex: skillDef.skillIndex,
    description: skillDef.description,
    unlocked: userSkills[skillDef.id]?.unlocked || false,
    icon: skillDef.icon,
    benefits: skillDef.benefits,
    requirements: skillDef.requirements,
    tags: skillDef.tags,
    clinicalReason: skillDef.clinicalReason,
    source: skillDef.source,
    disabled: skillConstraints[skillDef.id]?.status === 'disabled',
    disabledReason: skillConstraints[skillDef.id]?.reason,
  }));
  const gymSkillPool = getGymSkillDefinitionsByPillar({
    hasGymAccess,
    availableEquipment,
    pillarLevels,
  });
  const gymSkillsForCurrentPillar = gymSkillPool[selectedPillar] || [];
  const canAttemptLevelUp = currentPillarLevel < 4 && LEVEL_UP_CHALLENGES[selectedPillar].some(challenge => 
    challenge.fromLevel === currentPillarLevel
  );

  const validateLevelUpChallenge = async (challengeId: string) => {
    setIsValidating(true);
    try {
      // Call AI validation
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{
            role: 'user',
            text: `Validate if user can attempt level up challenge for pillar ${selectedPillar}. Current level: ${currentPillarLevel}. Check user skills and requirements.`
          }],
          tools: [{
            name: 'validate_level_up',
            args: { pillar: selectedPillar }
          }]
        })
      });

      const data = await response.json();
      const validation = JSON.parse(data.response || '{}');
      
      setValidationResults(prev => ({
        ...prev,
        [challengeId]: validation
      }));
    } catch (error) {
      console.error('Validation failed:', error);
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="pt-24 pb-8 px-4 max-w-7xl mx-auto">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-display text-3xl font-bold text-white mb-2"
      >
        Skill Tree
      </motion.h1>
      <p className="text-white/50 mb-8">
        Domine habilidades específicas em cada pilar de movimento
      </p>

      {/* Pillar Selection */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {pillars.map((pillar) => {
            const Icon = {
                push: Flame,
                pull: Zap,
                legs: Dumbbell,
                core: Shield,
                endurance: Heart,
                mobility: Move
            }[pillar];
            const staticSkillDefsForPillar = Object.values(SKILL_DEFINITIONS[pillar] || {}).flatMap(
              (skills) => skills || []
            );
            const customSkillDefsForPillar = customSkillsByPillar[pillar] || [];
            const allSkillDefsForPillar = dedupeSkillDefinitionsById([
              ...staticSkillDefsForPillar,
              ...customSkillDefsForPillar,
            ]);
            const unlockedSkillsForPillar = allSkillDefsForPillar.filter(
              (skillDef) =>
                userSkills[skillDef.id]?.unlocked && skillConstraints[skillDef.id]?.status !== 'disabled'
            ).length;
            const disabledSkillsForPillar = allSkillDefsForPillar.filter(
              (skillDef) => skillConstraints[skillDef.id]?.status === 'disabled'
            ).length;
            
          return (
          <motion.div
            key={pillar}
            whileHover={{ scale: 1.05 }}
            onClick={() => setSelectedPillar(pillar)}
            className={`cursor-pointer transition-all duration-300 ${
              selectedPillar === pillar ? 'ring-2 ring-neon-blue' : ''
            }`}
          >
            <GlassPanel className="p-4">
              <div className="text-center">
                <div 
                  className="w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center"
                  style={{ background: `${pillarColors[pillar]}20` }}
                >
                  <Icon className="w-4 h-4" style={{ color: pillarColors[pillar] }} />
                </div>
                <div className="font-display text-xs uppercase tracking-wider text-white/60 mb-1">
                  {PILLAR_NAMES[pillar]}
                </div>
                <div className="font-mono text-sm" style={{ color: pillarColors[pillar] }}>
                  Nível {pillarLevels[pillar]?.level || 0}
                </div>
                <div className="text-xs text-white/40 mt-1">
                  {pillarLevels[pillar]?.xp || 0}/{pillarLevels[pillar]?.xpToNext || 100} XP
                </div>
                <div className="text-[10px] text-white/35 mt-1">
                  {unlockedSkillsForPillar}/{allSkillDefsForPillar.length} skills
                </div>
                {disabledSkillsForPillar > 0 ? (
                  <div className="text-[10px] text-red-300/80 mt-1">{disabledSkillsForPillar} desativadas</div>
                ) : null}
              </div>
            </GlassPanel>
          </motion.div>
          );
        })}
      </div>

      {/* Level Selection */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {[0, 1, 2, 3, 4].map((level) => (
          <motion.button
            key={level}
            whileHover={{ scale: 1.05 }}
            onClick={() => setSelectedLevel(level)}
            className={`px-4 py-2 rounded-lg font-mono text-sm transition-all duration-300 whitespace-nowrap ${
              selectedLevel === level
                ? 'bg-neon-blue text-black'
                : level <= currentPillarLevel
                ? 'bg-shadow-700 text-white border border-white/10'
                : 'bg-shadow-800 text-white/30 border border-white/5'
            }`}
            disabled={level > currentPillarLevel}
          >
            Nível {level}
            {level === currentPillarLevel && ' (Atual)'}
            {level > currentPillarLevel && ' (Bloqueado)'}
          </motion.button>
        ))}
      </div>

      {hasGymAccess && (
        <GlassPanel className="p-4 mb-6 border-neon-blue/20">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <Dumbbell className="w-4 h-4 text-neon-blue" />
              <h3 className="font-display text-sm uppercase tracking-wider text-white">
                Gym Skills Available
              </h3>
            </div>
            <span className="text-xs text-white/50">
              {availableEquipment.length > 0
                ? `Equipamentos: ${availableEquipment.join(', ')}`
                : 'Sem filtro de equipamento'}
            </span>
          </div>
          {gymSkillsForCurrentPillar.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {gymSkillsForCurrentPillar.map((skill) => (
                <div key={skill.id} className="p-2 rounded border border-white/10 bg-shadow-800/40">
                  <div className="text-white text-sm font-display">{skill.name}</div>
                  <div className="text-white/50 text-xs">{skill.description}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-white/50 text-sm">
              Nenhuma skill de academia encontrada para este pilar com os equipamentos atuais.
            </p>
          )}
        </GlassPanel>
      )}

      {/* Level Up Challenge */}
      {canAttemptLevelUp && selectedLevel === currentPillarLevel && (
        <GlassPanel className="p-6 mb-6 border-neon-blue/30">
          <div className="flex items-center gap-4 mb-4">
            <Target className="w-6 h-6 text-neon-blue" />
            <div>
              <h3 className="font-display text-lg text-white">Desafio de Subida de Nível</h3>
              <p className="text-white/60 text-sm">
                Complete este desafio para alcançar o Nível {currentPillarLevel + 1} em {PILLAR_NAMES[selectedPillar]}
              </p>
            </div>
          </div>
          
          {LEVEL_UP_CHALLENGES[selectedPillar]
            .filter(challenge => challenge.fromLevel === currentPillarLevel)
            .map(challenge => (
              <div key={challenge.id} className="space-y-3">
                <div className="bg-shadow-800/50 p-4 rounded-lg">
                  <h4 className="font-display text-white mb-2">{challenge.challenge.name}</h4>
                  <p className="text-white/60 text-sm mb-3">{challenge.challenge.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h5 className="text-neon-blue font-semibold mb-2">Requisitos:</h5>
                      <ul className="text-sm text-white/70 space-y-1">
                        {challenge.challenge.requirements.map((req, idx) => (
                          <li key={idx}>• {req}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h5 className="text-green-400 font-semibold mb-2">Recompensas:</h5>
                      <ul className="text-sm text-white/70 space-y-1">
                        <li>• +{challenge.rewards.xpBonus} XP bônus</li>
                        <li>• {challenge.rewards.skillUnlocks.length} novas skills</li>
                      </ul>
                      
                      <h5 className="text-red-400 font-semibold mb-2 mt-3">Riscos:</h5>
                      <ul className="text-sm text-white/70 space-y-1">
                        <li>• -{challenge.risk.xpPenalty} XP se falhar</li>
                        <li>• {Math.round(challenge.risk.debuffChance * 100)}% chance de debuff</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white/40">
                      Tempo limite: {challenge.challenge.timeLimit}min
                    </span>
                    <div className="flex gap-2">
                      {!validationResults[challenge.id] && (
                        <button 
                          onClick={() => validateLevelUpChallenge(challenge.id)}
                          disabled={isValidating}
                          className="px-3 py-2 bg-yellow-600 text-black font-semibold rounded hover:bg-yellow-500 transition-colors disabled:opacity-50 text-sm"
                        >
                          {isValidating ? 'Validando...' : 'Validar Pré-requisitos'}
                        </button>
                      )}
                      {validationResults[challenge.id] && (
                        <button 
                          disabled={!validationResults[challenge.id].validation}
                          className={`px-4 py-2 font-semibold rounded transition-colors text-sm ${
                            validationResults[challenge.id].validation 
                              ? 'bg-neon-blue text-black hover:bg-neon-blue/80' 
                              : 'bg-red-600 text-white cursor-not-allowed'
                          }`}
                        >
                          {validationResults[challenge.id].validation ? 'Iniciar Desafio' : 'Pré-requisitos Não Atendidos'}
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {validationResults[challenge.id] && (
                    <div className={`mt-3 p-2 rounded text-xs ${
                      validationResults[challenge.id].validation 
                        ? 'bg-green-900/50 text-green-300' 
                        : 'bg-red-900/50 text-red-300'
                    }`}>
                      {validationResults[challenge.id].validation 
                        ? `✅ Pronto para desafio! Skills desbloqueadas: ${validationResults[challenge.id].unlockedSkillsCount}/${validationResults[challenge.id].requiredSkillsCount}`
                        : `❌ Requisitos não atendidos. Skills necessárias: ${validationResults[challenge.id].requiredSkillsCount}, desbloqueadas: ${validationResults[challenge.id].unlockedSkillsCount}`
                      }
                    </div>
                  )}
                </div>
              </div>
            ))}
        </GlassPanel>
      )}

      {/* Skills Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {skillNodes.length > 0 ? (
          skillNodes.map((skill) => (
            <SkillCard key={skill.id} skill={skill} />
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <Lock className="w-16 h-16 mx-auto text-white/20 mb-4" />
            <h3 className="font-display text-xl text-white/40 mb-2">Nenhuma Skill Disponível</h3>
            <p className="text-white/60">
              Este nível ainda não foi desbloqueado. Complete desafios para progredir!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
