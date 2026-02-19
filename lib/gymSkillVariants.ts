import type { MovementPillar, PillarLevel, SkillDefinition } from '@/types';

interface GymSkillVariant {
  id: string;
  name: string;
  pillar: MovementPillar;
  description: string;
  equipmentKeywords: string[];
  benefits: string[];
}

const normalizeText = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const GYM_SKILL_VARIANTS: GymSkillVariant[] = [
  {
    id: 'gym-push-dumbbell-bench',
    name: 'Supino com Halteres',
    pillar: 'push',
    description: 'Empurrar horizontal com carga livre e controle escapular.',
    equipmentKeywords: ['halter', 'dumbbell', 'banco'],
    benefits: ['Forca de peitoral', 'Estabilidade de ombro'],
  },
  {
    id: 'gym-push-barbell-bench',
    name: 'Supino com Barra',
    pillar: 'push',
    description: 'Base de forca para empurrar com barra reta.',
    equipmentKeywords: ['barra', 'barbell', 'banco', 'smith'],
    benefits: ['Forca maxima de push', 'Progressao de carga'],
  },
  {
    id: 'gym-pull-lat-pulldown',
    name: 'Puxada na Roldana',
    pillar: 'pull',
    description: 'Puxada vertical controlada para dorsais e escapulas.',
    equipmentKeywords: ['roldana', 'pulley', 'cabo', 'cross'],
    benefits: ['Forca de dorsais', 'Controle escapular'],
  },
  {
    id: 'gym-pull-row-machine',
    name: 'Remada na Maquina',
    pillar: 'pull',
    description: 'Remada horizontal com foco em dorsais e romboides.',
    equipmentKeywords: ['maquina', 'machine', 'remada'],
    benefits: ['Espessura de costas', 'Controle de tronco'],
  },
  {
    id: 'gym-legs-barbell-squat',
    name: 'Agachamento com Barra',
    pillar: 'legs',
    description: 'Padrao dominante de joelho com carga progressiva.',
    equipmentKeywords: ['barra', 'barbell', 'rack', 'smith'],
    benefits: ['Forca de pernas', 'Estabilidade de core'],
  },
  {
    id: 'gym-legs-leg-press',
    name: 'Leg Press',
    pillar: 'legs',
    description: 'Trabalho de quadriceps e gluteos com controle de amplitude.',
    equipmentKeywords: ['leg press', 'maquina'],
    benefits: ['Volume para pernas', 'Seguranca articular'],
  },
  {
    id: 'gym-core-cable-crunch',
    name: 'Crunch na Roldana',
    pillar: 'core',
    description: 'Flexao de tronco com resistencia por cabo.',
    equipmentKeywords: ['roldana', 'cabo', 'pulley'],
    benefits: ['Forca de core', 'Resistencia abdominal'],
  },
  {
    id: 'gym-core-loaded-carry',
    name: 'Farmer Walk',
    pillar: 'core',
    description: 'Caminhada carregada para estabilizacao total.',
    equipmentKeywords: ['halter', 'dumbbell', 'kettlebell'],
    benefits: ['Estabilidade global', 'Resistencia de pegada'],
  },
  {
    id: 'gym-mobility-cable-rotation',
    name: 'Rotacao Toracica no Cabo',
    pillar: 'mobility',
    description: 'Mobilidade ativa de tronco com resistencia leve.',
    equipmentKeywords: ['cabo', 'roldana', 'pulley'],
    benefits: ['Mobilidade toracica', 'Controle de rotacao'],
  },
  {
    id: 'gym-endurance-rower-interval',
    name: 'Intervalado no Remo',
    pillar: 'endurance',
    description: 'Intervalos para condicao cardiorrespiratoria.',
    equipmentKeywords: ['remo', 'rower'],
    benefits: ['Capacidade aerobica', 'Potencia anaerobica'],
  },
  {
    id: 'gym-endurance-treadmill-interval',
    name: 'Intervalado na Esteira',
    pillar: 'endurance',
    description: 'Blocos de corrida com recuperacao ativa.',
    equipmentKeywords: ['esteira', 'treadmill'],
    benefits: ['Condicionamento', 'Controle de ritmo'],
  },
];

interface BuildGymSkillOptions {
  hasGymAccess?: boolean | null;
  availableEquipment?: string[];
  pillarLevels?: Record<MovementPillar, PillarLevel>;
}

export const getGymSkillDefinitionsByPillar = (
  options: BuildGymSkillOptions
): Record<MovementPillar, SkillDefinition[]> => {
  const grouped: Record<MovementPillar, SkillDefinition[]> = {
    push: [],
    pull: [],
    core: [],
    legs: [],
    mobility: [],
    endurance: [],
  };

  if (!options.hasGymAccess) return grouped;

  const equipmentText = (options.availableEquipment || []).map(normalizeText);

  const matchesEquipment = (keywords: string[]) => {
    if (keywords.length === 0) return true;
    if (equipmentText.length === 0) return true;
    return keywords.some((keyword) => {
      const normalizedKeyword = normalizeText(keyword);
      return equipmentText.some((item) => item.includes(normalizedKeyword));
    });
  };

  for (const variant of GYM_SKILL_VARIANTS) {
    if (!matchesEquipment(variant.equipmentKeywords)) continue;
    const pillarLevel = Math.max(0, Math.min(4, options.pillarLevels?.[variant.pillar]?.level ?? 0));
    const skillList = grouped[variant.pillar];
    grouped[variant.pillar] = [
      ...skillList,
      {
        id: variant.id,
        name: variant.name,
        description: variant.description,
        pillar: variant.pillar,
        level: pillarLevel,
        skillIndex: skillList.length,
        requirements: {
          pillarLevel: Math.max(0, pillarLevel - 1),
          description: 'Acesso a equipamento compativel',
        },
        benefits: variant.benefits,
        icon: 'Gym',
      },
    ];
  }

  return grouped;
};

