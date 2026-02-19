import { MovementPillar, SkillDefinition, UserSkill, PillarLevel, LevelUpChallenge } from '@/types';
import { SKILL_TREE } from './skillTree';

// Funções utilitárias para o sistema de skills

export function getSkillsForPillar(pillar: MovementPillar): SkillDefinition[][] {
  return SKILL_TREE[pillar];
}

export function getSkillById(skillId: string): SkillDefinition | null {
  for (const pillar of Object.keys(SKILL_TREE) as MovementPillar[]) {
    for (const level of SKILL_TREE[pillar]) {
      for (const skill of level) {
        if (skill.id === skillId) {
          return skill;
        }
      }
    }
  }
  return null;
}

export function getUnlockedSkillsForPillar(pillarLevel: PillarLevel): SkillDefinition[] {
  const skills = getSkillsForPillar(pillarLevel.pillar);
  const unlockedSkills: SkillDefinition[] = [];

  // Para cada nível que o usuário alcançou
  for (let level = 0; level <= pillarLevel.level; level++) {
    if (skills[level]) {
      // Para cada skill no nível
      for (const skill of skills[level]) {
        // Verifica se o usuário tem nível suficiente no pilar
        if (pillarLevel.level >= skill.requirements.pillarLevel) {
          unlockedSkills.push(skill);
        }
      }
    }
  }

  return unlockedSkills;
}

export function canUnlockSkill(skill: SkillDefinition, pillarLevel: PillarLevel): boolean {
  return pillarLevel.level >= skill.requirements.pillarLevel;
}

export function getNextLevelChallenge(pillar: MovementPillar, currentLevel: number): LevelUpChallenge | null {
  if (currentLevel >= 4) return null; // Já está no nível máximo

  const challenges: Record<MovementPillar, LevelUpChallenge[]> = {
    push: [
      {
        id: 'push-0-to-1',
        pillar: 'push',
        fromLevel: 0,
        toLevel: 1,
        challenge: {
          name: 'Prova do Push Básico',
          description: 'Complete 50 flexões padrão em 5 minutos',
          requirements: ['50 flexões completas', 'Forma técnica perfeita', 'Sem pausas > 30s'],
          timeLimit: 5
        },
        rewards: {
          xpBonus: 500,
          skillUnlocks: ['push-1-0', 'push-1-1', 'push-1-2', 'push-1-3', 'push-1-4']
        },
        risk: {
          xpPenalty: 100,
          debuffChance: 20
        }
      },
      {
        id: 'push-1-to-2',
        pillar: 'push',
        fromLevel: 1,
        toLevel: 2,
        challenge: {
          name: 'Prova do Push Intermediário',
          description: 'Complete 20 flexões diamante + 10 flexões de um braço',
          requirements: ['20 diamond pushups', '10 one-arm pushups', 'Técnica impecável'],
          timeLimit: 10
        },
        rewards: {
          xpBonus: 1000,
          skillUnlocks: ['push-2-0', 'push-2-1', 'push-2-2', 'push-2-3', 'push-2-4']
        },
        risk: {
          xpPenalty: 200,
          debuffChance: 30
        }
      },
      {
        id: 'push-2-to-3',
        pillar: 'push',
        fromLevel: 2,
        toLevel: 3,
        challenge: {
          name: 'Prova do Push Avançado',
          description: 'Complete 5 planches completos por 10 segundos cada',
          requirements: ['5 full planches', '10s cada um', 'Forma perfeita'],
          timeLimit: 15
        },
        rewards: {
          xpBonus: 2000,
          skillUnlocks: ['push-3-0', 'push-3-1', 'push-3-2', 'push-3-3', 'push-3-4']
        },
        risk: {
          xpPenalty: 500,
          debuffChance: 40
        }
      },
      {
        id: 'push-3-to-4',
        pillar: 'push',
        fromLevel: 3,
        toLevel: 4,
        challenge: {
          name: 'Prova do Push Mestre',
          description: 'Complete 3 planches de uma mão por 5 segundos cada',
          requirements: ['3 one-hand planches', '5s cada um', 'Controle total'],
          timeLimit: 20
        },
        rewards: {
          xpBonus: 5000,
          skillUnlocks: ['push-4-0', 'push-4-1', 'push-4-2', 'push-4-3', 'push-4-4']
        },
        risk: {
          xpPenalty: 1000,
          debuffChance: 50
        }
      }
    ],
    pull: [
      {
        id: 'pull-0-to-1',
        pillar: 'pull',
        fromLevel: 0,
        toLevel: 1,
        challenge: {
          name: 'Prova do Pull Básico',
          description: 'Complete 30 pull-ups estritos',
          requirements: ['30 strict pull-ups', 'Sem kipping', 'Forma perfeita'],
          timeLimit: 8
        },
        rewards: {
          xpBonus: 500,
          skillUnlocks: ['pull-1-0', 'pull-1-1', 'pull-1-2', 'pull-1-3', 'pull-1-4']
        },
        risk: {
          xpPenalty: 100,
          debuffChance: 20
        }
      },
      {
        id: 'pull-1-to-2',
        pillar: 'pull',
        fromLevel: 1,
        toLevel: 2,
        challenge: {
          name: 'Prova do Pull Intermediário',
          description: 'Complete 10 muscle-ups + front lever tuck por 15s',
          requirements: ['10 strict muscle-ups', '15s front lever tuck', 'Técnica impecável'],
          timeLimit: 12
        },
        rewards: {
          xpBonus: 1000,
          skillUnlocks: ['pull-2-0', 'pull-2-1', 'pull-2-2', 'pull-2-3', 'pull-2-4']
        },
        risk: {
          xpPenalty: 200,
          debuffChance: 30
        }
      },
      {
        id: 'pull-2-to-3',
        pillar: 'pull',
        fromLevel: 2,
        toLevel: 3,
        challenge: {
          name: 'Prova do Pull Avançado',
          description: 'Complete 5 front levers completos por 10s cada',
          requirements: ['5 full front levers', '10s cada um', 'Controle horizontal'],
          timeLimit: 15
        },
        rewards: {
          xpBonus: 2000,
          skillUnlocks: ['pull-3-0', 'pull-3-1', 'pull-3-2', 'pull-3-3', 'pull-3-4']
        },
        risk: {
          xpPenalty: 500,
          debuffChance: 40
        }
      },
      {
        id: 'pull-3-to-4',
        pillar: 'pull',
        fromLevel: 3,
        toLevel: 4,
        challenge: {
          name: 'Prova do Pull Mestre',
          description: 'Complete human flag por 30 segundos',
          requirements: ['30s human flag', 'Controle perfeito', 'Estabilidade total'],
          timeLimit: 20
        },
        rewards: {
          xpBonus: 5000,
          skillUnlocks: ['pull-4-0', 'pull-4-1', 'pull-4-2', 'pull-4-3', 'pull-4-4']
        },
        risk: {
          xpPenalty: 1000,
          debuffChance: 50
        }
      }
    ],
    core: [
      {
        id: 'core-0-to-1',
        pillar: 'core',
        fromLevel: 0,
        toLevel: 1,
        challenge: {
          name: 'Prova do Core Básico',
          description: 'Mantenha prancha por 3 minutos totais',
          requirements: ['3 minutos prancha', 'Forma perfeita', 'Sem quebras'],
          timeLimit: 5
        },
        rewards: {
          xpBonus: 500,
          skillUnlocks: ['core-1-0', 'core-1-1', 'core-1-2', 'core-1-3', 'core-1-4']
        },
        risk: {
          xpPenalty: 100,
          debuffChance: 20
        }
      },
      {
        id: 'core-1-to-2',
        pillar: 'core',
        fromLevel: 1,
        toLevel: 2,
        challenge: {
          name: 'Prova do Core Intermediário',
          description: 'Complete 50 L-sits + dragon flag negativo',
          requirements: ['50 L-sits', '1 dragon flag negativo', 'Técnica perfeita'],
          timeLimit: 10
        },
        rewards: {
          xpBonus: 1000,
          skillUnlocks: ['core-2-0', 'core-2-1', 'core-2-2', 'core-2-3', 'core-2-4']
        },
        risk: {
          xpPenalty: 200,
          debuffChance: 30
        }
      },
      {
        id: 'core-2-to-3',
        pillar: 'core',
        fromLevel: 2,
        toLevel: 3,
        challenge: {
          name: 'Prova do Core Avançado',
          description: 'Complete 10 dragon flags completos',
          requirements: ['10 full dragon flags', 'Controle total', 'Sem quedas'],
          timeLimit: 15
        },
        rewards: {
          xpBonus: 2000,
          skillUnlocks: ['core-3-0', 'core-3-1', 'core-3-2', 'core-3-3', 'core-3-4']
        },
        risk: {
          xpPenalty: 500,
          debuffChance: 40
        }
      },
      {
        id: 'core-3-to-4',
        pillar: 'core',
        fromLevel: 3,
        toLevel: 4,
        challenge: {
          name: 'Prova do Core Mestre',
          description: 'Complete human flag por 45 segundos',
          requirements: ['45s human flag', 'Estabilidade perfeita', 'Controle gravitacional'],
          timeLimit: 20
        },
        rewards: {
          xpBonus: 5000,
          skillUnlocks: ['core-4-0', 'core-4-1', 'core-4-2', 'core-4-3', 'core-4-4']
        },
        risk: {
          xpPenalty: 1000,
          debuffChance: 50
        }
      }
    ],
    legs: [
      {
        id: 'legs-0-to-1',
        pillar: 'legs',
        fromLevel: 0,
        toLevel: 1,
        challenge: {
          name: 'Prova das Pernas Básico',
          description: 'Complete 100 agachamentos + pistol prep',
          requirements: ['100 air squats', '10 pistol preps cada perna', 'Forma perfeita'],
          timeLimit: 8
        },
        rewards: {
          xpBonus: 500,
          skillUnlocks: ['legs-1-0', 'legs-1-1', 'legs-1-2', 'legs-1-3', 'legs-1-4']
        },
        risk: {
          xpPenalty: 100,
          debuffChance: 20
        }
      },
      {
        id: 'legs-1-to-2',
        pillar: 'legs',
        fromLevel: 1,
        toLevel: 2,
        challenge: {
          name: 'Prova das Pernas Intermediário',
          description: 'Complete 20 pistols + 50 shrimp squats',
          requirements: ['20 pistol squats', '50 shrimp squats', 'Equilíbrio perfeito'],
          timeLimit: 12
        },
        rewards: {
          xpBonus: 1000,
          skillUnlocks: ['legs-2-0', 'legs-2-1', 'legs-2-2', 'legs-2-3', 'legs-2-4']
        },
        risk: {
          xpPenalty: 200,
          debuffChance: 30
        }
      },
      {
        id: 'legs-2-to-3',
        pillar: 'legs',
        fromLevel: 2,
        toLevel: 3,
        challenge: {
          name: 'Prova das Pernas Avançado',
          description: 'Complete 10 pistols com peso + 30 pistol explosivos',
          requirements: ['10 weighted pistols', '30 explosive pistols', 'Potência máxima'],
          timeLimit: 15
        },
        rewards: {
          xpBonus: 2000,
          skillUnlocks: ['legs-3-0', 'legs-3-1', 'legs-3-2', 'legs-3-3', 'legs-3-4']
        },
        risk: {
          xpPenalty: 500,
          debuffChance: 40
        }
      },
      {
        id: 'legs-3-to-4',
        pillar: 'legs',
        fromLevel: 3,
        toLevel: 4,
        challenge: {
          name: 'Prova das Pernas Mestre',
          description: 'Complete 20 pistols em uma perna só (sem alternar)',
          requirements: ['20 pistols perna direita', '20 pistols perna esquerda', 'Sem apoio'],
          timeLimit: 20
        },
        rewards: {
          xpBonus: 5000,
          skillUnlocks: ['legs-4-0', 'legs-4-1', 'legs-4-2', 'legs-4-3', 'legs-4-4']
        },
        risk: {
          xpPenalty: 1000,
          debuffChance: 50
        }
      }
    ],
    mobility: [
      {
        id: 'mobility-0-to-1',
        pillar: 'mobility',
        fromLevel: 0,
        toLevel: 1,
        challenge: {
          name: 'Prova da Mobilidade Básico',
          description: 'Complete 5 minutos de flow dinâmico + deep squat hold',
          requirements: ['5 min dynamic flow', '2 min deep squat hold', 'Amplitude máxima'],
          timeLimit: 10
        },
        rewards: {
          xpBonus: 500,
          skillUnlocks: ['mobility-1-0', 'mobility-1-1', 'mobility-1-2', 'mobility-1-3', 'mobility-1-4']
        },
        risk: {
          xpPenalty: 100,
          debuffChance: 20
        }
      },
      {
        id: 'mobility-1-to-2',
        pillar: 'mobility',
        fromLevel: 1,
        toLevel: 2,
        challenge: {
          name: 'Prova da Mobilidade Intermediário',
          description: 'Complete ponte completa + contortion básico',
          requirements: ['3 min full bridge', '30s basic contortion', 'Flexibilidade extrema'],
          timeLimit: 12
        },
        rewards: {
          xpBonus: 1000,
          skillUnlocks: ['mobility-2-0', 'mobility-2-1', 'mobility-2-2', 'mobility-2-3', 'mobility-2-4']
        },
        risk: {
          xpPenalty: 200,
          debuffChance: 30
        }
      },
      {
        id: 'mobility-2-to-3',
        pillar: 'mobility',
        fromLevel: 2,
        toLevel: 3,
        challenge: {
          name: 'Prova da Mobilidade Avançado',
          description: 'Complete 2 minutos de contortion avançado',
          requirements: ['2 min advanced contortion', 'Variações complexas', 'Controle perfeito'],
          timeLimit: 15
        },
        rewards: {
          xpBonus: 2000,
          skillUnlocks: ['mobility-3-0', 'mobility-3-1', 'mobility-3-2', 'mobility-3-3', 'mobility-3-4']
        },
        risk: {
          xpPenalty: 500,
          debuffChance: 40
        }
      },
      {
        id: 'mobility-3-to-4',
        pillar: 'mobility',
        fromLevel: 3,
        toLevel: 4,
        challenge: {
          name: 'Prova da Mobilidade Mestre',
          description: 'Complete 3 minutos de elite contortion',
          requirements: ['3 min elite contortion', 'Variações de elite', 'Forma perfeita'],
          timeLimit: 20
        },
        rewards: {
          xpBonus: 5000,
          skillUnlocks: ['mobility-4-0', 'mobility-4-1', 'mobility-4-2', 'mobility-4-3', 'mobility-4-4']
        },
        risk: {
          xpPenalty: 1000,
          debuffChance: 50
        }
      }
    ],
    endurance: [
      {
        id: 'endurance-0-to-1',
        pillar: 'endurance',
        fromLevel: 0,
        toLevel: 1,
        challenge: {
          name: 'Prova da Endurance Básico',
          description: 'Complete 30 minutos de corrida contínua',
          requirements: ['30 min steady run', 'Ritmo constante', 'Sem pausas'],
          timeLimit: 35
        },
        rewards: {
          xpBonus: 500,
          skillUnlocks: ['endurance-1-0', 'endurance-1-1', 'endurance-1-2', 'endurance-1-3', 'endurance-1-4']
        },
        risk: {
          xpPenalty: 100,
          debuffChance: 20
        }
      },
      {
        id: 'endurance-1-to-2',
        pillar: 'endurance',
        fromLevel: 1,
        toLevel: 2,
        challenge: {
          name: 'Prova da Endurance Intermediário',
          description: 'Complete 20 minutos HIIT + 20 repeats',
          requirements: ['20 min advanced HIIT', '20 speed repeats', 'Máximo esforço'],
          timeLimit: 45
        },
        rewards: {
          xpBonus: 1000,
          skillUnlocks: ['endurance-2-0', 'endurance-2-1', 'endurance-2-2', 'endurance-2-3', 'endurance-2-4']
        },
        risk: {
          xpPenalty: 200,
          debuffChance: 30
        }
      },
      {
        id: 'endurance-2-to-3',
        pillar: 'endurance',
        fromLevel: 2,
        toLevel: 3,
        challenge: {
          name: 'Prova da Endurance Avançado',
          description: 'Complete 45 minutos de ultra endurance',
          requirements: ['45 min ultra run', 'Ritmo sustentável', 'Resistência mental'],
          timeLimit: 50
        },
        rewards: {
          xpBonus: 2000,
          skillUnlocks: ['endurance-3-0', 'endurance-3-1', 'endurance-3-2', 'endurance-3-3', 'endurance-3-4']
        },
        risk: {
          xpPenalty: 500,
          debuffChance: 40
        }
      },
      {
        id: 'endurance-3-to-4',
        pillar: 'endurance',
        fromLevel: 3,
        toLevel: 4,
        challenge: {
          name: 'Prova da Endurance Mestre',
          description: 'Complete 60 minutos de ultra runner',
          requirements: ['60 min ultra runner', 'Velocidade máxima', 'Limite humano'],
          timeLimit: 70
        },
        rewards: {
          xpBonus: 5000,
          skillUnlocks: ['endurance-4-0', 'endurance-4-1', 'endurance-4-2', 'endurance-4-3', 'endurance-4-4']
        },
        risk: {
          xpPenalty: 1000,
          debuffChance: 50
        }
      }
    ]
  };

  return challenges[pillar]?.find(c => c.fromLevel === currentLevel) || null;
}

export function calculatePillarLevelFromFitness(fitnessLevel: string): Record<MovementPillar, number> {
  // Baseado no onboarding, determina nível inicial de cada pilar
  const baseLevels = {
    beginner: 0,
    intermediate: 1,
    advanced: 2
  };

  const baseLevel = baseLevels[fitnessLevel as keyof typeof baseLevels] || 0;

  return {
    push: baseLevel,
    pull: baseLevel,
    core: baseLevel,
    legs: baseLevel,
    mobility: baseLevel,
    endurance: baseLevel
  };
}