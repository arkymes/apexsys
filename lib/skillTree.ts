import { MovementPillar } from '@/types';

export interface SkillDefinition {
  id: string;
  name: string;
  description: string;
  pillar: MovementPillar;
  level: number; // 0-4 (5 níveis)
  skillIndex: number; // 0-4 (5 skills por nível)
  requirements: {
    pillarLevel: number; // nível mínimo do pilar necessário
    description: string;
  };
  benefits: string[];
  icon: string;
}

// Skills organizadas por pilar e nível
export const SKILL_TREE: Record<MovementPillar, SkillDefinition[][]> = {
  push: [
    // Nível 0: Iniciante Total
    [
      {
        id: 'push-0-0',
        name: 'Flexão de Parede',
        description: 'Flexões apoiadas na parede',
        pillar: 'push',
        level: 0,
        skillIndex: 0,
        requirements: { pillarLevel: 1, description: 'Nível básico de push' },
        benefits: ['Fundamentos de push', '+5% força de empurrar'],
        icon: 'WallPushup'
      },
      {
        id: 'push-0-1',
        name: 'Flexão de Joelhos',
        description: 'Flexões com joelhos no chão',
        pillar: 'push',
        level: 0,
        skillIndex: 1,
        requirements: { pillarLevel: 3, description: 'Leve experiência em push' },
        benefits: ['Técnica básica', '+10% eficiência'],
        icon: 'KneePushup'
      },
      {
        id: 'push-0-2',
        name: 'Flexão Incompleta',
        description: 'Flexões parciais (metade do movimento)',
        pillar: 'push',
        level: 0,
        skillIndex: 2,
        requirements: { pillarLevel: 5, description: 'Experiência moderada' },
        benefits: ['Controle parcial', '+15% força'],
        icon: 'PartialPushup'
      },
      {
        id: 'push-0-3',
        name: 'Flexão Negativa',
        description: 'Descer lentamente na flexão',
        pillar: 'push',
        level: 0,
        skillIndex: 3,
        requirements: { pillarLevel: 7, description: 'Boa base técnica' },
        benefits: ['Controle excêntrico', '+20% resistência'],
        icon: 'NegativePushup'
      },
      {
        id: 'push-0-4',
        name: 'Flexão Estática',
        description: 'Pausas na posição baixa',
        pillar: 'push',
        level: 0,
        skillIndex: 4,
        requirements: { pillarLevel: 9, description: 'Quase nível 1' },
        benefits: ['Força isométrica', '+25% estabilidade'],
        icon: 'StaticPushup'
      }
    ],
    // Nível 1: Básico
    [
      {
        id: 'push-1-0',
        name: 'Flexão Padrão',
        description: 'Flexões completas do chão',
        pillar: 'push',
        level: 1,
        skillIndex: 0,
        requirements: { pillarLevel: 10, description: 'Nível básico alcançado' },
        benefits: ['Fundamentos sólidos', '+30% força geral'],
        icon: 'StandardPushup'
      },
      {
        id: 'push-1-1',
        name: 'Flexão Larga',
        description: 'Mãos mais afastadas',
        pillar: 'push',
        level: 1,
        skillIndex: 1,
        requirements: { pillarLevel: 15, description: 'Progresso intermediário' },
        benefits: ['Peitoral enfatizado', '+15% peito'],
        icon: 'WidePushup'
      },
      {
        id: 'push-1-2',
        name: 'Flexão Diamante',
        description: 'Mãos juntas em diamante',
        pillar: 'push',
        level: 1,
        skillIndex: 2,
        requirements: { pillarLevel: 20, description: 'Técnica aprimorada' },
        benefits: ['Tríceps enfatizado', '+20% tríceps'],
        icon: 'DiamondPushup'
      },
      {
        id: 'push-1-3',
        name: 'Flexão com Peso',
        description: 'Flexões com mochila ou peso',
        pillar: 'push',
        level: 1,
        skillIndex: 3,
        requirements: { pillarLevel: 25, description: 'Força estabelecida' },
        benefits: ['Sobrecarga progressiva', '+25% força máxima'],
        icon: 'WeightedPushup'
      },
      {
        id: 'push-1-4',
        name: 'Flexão Explosiva',
        description: 'Flexões com salto no topo',
        pillar: 'push',
        level: 1,
        skillIndex: 4,
        requirements: { pillarLevel: 29, description: 'Próximo do nível 2' },
        benefits: ['Potência explosiva', '+30% potência'],
        icon: 'ExplosivePushup'
      }
    ],
    // Nível 2: Intermediário
    [
      {
        id: 'push-2-0',
        name: 'Flexão de Um Braço',
        description: 'Flexão com uma mão',
        pillar: 'push',
        level: 2,
        skillIndex: 0,
        requirements: { pillarLevel: 30, description: 'Nível intermediário' },
        benefits: ['Força unilateral', '+35% força assimétrica'],
        icon: 'OneArmPushup'
      },
      {
        id: 'push-2-1',
        name: 'Planche Lean',
        description: 'Posição inicial do planche',
        pillar: 'push',
        level: 2,
        skillIndex: 1,
        requirements: { pillarLevel: 35, description: 'Boa base' },
        benefits: ['Preparação para planche', '+20% core no push'],
        icon: 'PlancheLean'
      },
      {
        id: 'push-2-2',
        name: 'Planche Tuck',
        description: 'Planche com joelhos dobrados',
        pillar: 'push',
        level: 2,
        skillIndex: 2,
        requirements: { pillarLevel: 40, description: 'Técnica avançada' },
        benefits: ['Controle avançado', '+40% estabilidade'],
        icon: 'PlancheTuck'
      },
      {
        id: 'push-2-3',
        name: 'Planche Avançado',
        description: 'Planche com pernas estendidas',
        pillar: 'push',
        level: 2,
        skillIndex: 3,
        requirements: { pillarLevel: 45, description: 'Força consolidada' },
        benefits: ['Força excepcional', '+50% força máxima'],
        icon: 'AdvancedPlanche'
      },
      {
        id: 'push-2-4',
        name: 'Planche Completo',
        description: 'Planche total com elevação',
        pillar: 'push',
        level: 2,
        skillIndex: 4,
        requirements: { pillarLevel: 49, description: 'Quase mestre' },
        benefits: ['Domínio total', '+60% força e controle'],
        icon: 'FullPlanche'
      }
    ],
    // Nível 3: Avançado
    [
      {
        id: 'push-3-0',
        name: 'Mão de Ferro',
        description: 'Suporte em uma mão',
        pillar: 'push',
        level: 3,
        skillIndex: 0,
        requirements: { pillarLevel: 50, description: 'Nível avançado' },
        benefits: ['Força de preensão', '+25% grip strength'],
        icon: 'IronPalm'
      },
      {
        id: 'push-3-1',
        name: 'Planche com Peso',
        description: 'Planche carregando peso',
        pillar: 'push',
        level: 3,
        skillIndex: 1,
        requirements: { pillarLevel: 60, description: 'Força excepcional' },
        benefits: ['Sobrecarga extrema', '+70% força máxima'],
        icon: 'WeightedPlanche'
      },
      {
        id: 'push-3-2',
        name: 'Planche Explosivo',
        description: 'Planche com movimento dinâmico',
        pillar: 'push',
        level: 3,
        skillIndex: 2,
        requirements: { pillarLevel: 70, description: 'Potência máxima' },
        benefits: ['Explosividade total', '+80% potência'],
        icon: 'ExplosivePlanche'
      },
      {
        id: 'push-3-3',
        name: 'Mestre Planche',
        description: 'Variações complexas do planche',
        pillar: 'push',
        level: 3,
        skillIndex: 3,
        requirements: { pillarLevel: 80, description: 'Domínio técnico' },
        benefits: ['Maestria completa', '+90% eficiência'],
        icon: 'MasterPlanche'
      },
      {
        id: 'push-3-4',
        name: 'Planche Lendário',
        description: 'Planche com elementos acrobáticos',
        pillar: 'push',
        level: 3,
        skillIndex: 4,
        requirements: { pillarLevel: 89, description: 'Próximo da lenda' },
        benefits: ['Habilidade lendária', '+100% força e técnica'],
        icon: 'LegendaryPlanche'
      }
    ],
    // Nível 4: Mestre
    [
      {
        id: 'push-4-0',
        name: 'Planche de Elite',
        description: 'Planche com variações extremas',
        pillar: 'push',
        level: 4,
        skillIndex: 0,
        requirements: { pillarLevel: 90, description: 'Nível de elite' },
        benefits: ['Perfeição técnica', '+50% todos os atributos'],
        icon: 'ElitePlanche'
      },
      {
        id: 'push-4-1',
        name: 'Planche com Uma Mão',
        description: 'Planche suportado em uma mão',
        pillar: 'push',
        level: 4,
        skillIndex: 1,
        requirements: { pillarLevel: 95, description: 'Força sobre-humana' },
        benefits: ['Força unilateral máxima', '+120% força'],
        icon: 'OneHandPlanche'
      },
      {
        id: 'push-4-2',
        name: 'Mestre dos Céus',
        description: 'Planche invertido ou voador',
        pillar: 'push',
        level: 4,
        skillIndex: 2,
        requirements: { pillarLevel: 98, description: 'Domínio absoluto' },
        benefits: ['Controle gravitacional', '+150% potência'],
        icon: 'SkyMaster'
      },
      {
        id: 'push-4-3',
        name: 'Avatar do Push',
        description: 'Maestria completa em empurrar',
        pillar: 'push',
        level: 4,
        skillIndex: 3,
        requirements: { pillarLevel: 99, description: 'Quase deus' },
        benefits: ['Poder divino', '+200% força total'],
        icon: 'PushAvatar'
      },
      {
        id: 'push-4-4',
        name: 'Deus do Empurrar',
        description: 'Perfeição absoluta no push',
        pillar: 'push',
        level: 4,
        skillIndex: 4,
        requirements: { pillarLevel: 100, description: 'Nível máximo alcançado' },
        benefits: ['Poder ilimitado', '+300% força e controle'],
        icon: 'PushGod'
      }
    ]
  ],
  pull: [
    // Nível 0: Iniciante Total
    [
      {
        id: 'pull-0-0',
        name: 'Pêndulo Inativo',
        description: 'Segurar na barra sem movimento',
        pillar: 'pull',
        level: 0,
        skillIndex: 0,
        requirements: { pillarLevel: 1, description: 'Nível básico de pull' },
        benefits: ['Preensão básica', '+5% força de tração'],
        icon: 'DeadHang'
      },
      {
        id: 'pull-0-1',
        name: 'Pêndulo Ativo',
        description: 'Balançar levemente na barra',
        pillar: 'pull',
        level: 0,
        skillIndex: 1,
        requirements: { pillarLevel: 3, description: 'Leve experiência' },
        benefits: ['Mobilidade inicial', '+10% amplitude'],
        icon: 'ActiveHang'
      },
      {
        id: 'pull-0-2',
        name: 'Pull-up Australiano',
        description: 'Barra baixa, joelhos apoiados',
        pillar: 'pull',
        level: 0,
        skillIndex: 2,
        requirements: { pillarLevel: 5, description: 'Experiência moderada' },
        benefits: ['Introdução ao movimento', '+15% força'],
        icon: 'AustralianPullup'
      },
      {
        id: 'pull-0-3',
        name: 'Negativo Assistido',
        description: 'Descer lentamente com ajuda',
        pillar: 'pull',
        level: 0,
        skillIndex: 3,
        requirements: { pillarLevel: 7, description: 'Boa base' },
        benefits: ['Controle excêntrico', '+20% resistência'],
        icon: 'AssistedNegative'
      },
      {
        id: 'pull-0-4',
        name: 'Pull-up Negativo',
        description: 'Apenas a fase negativa',
        pillar: 'pull',
        level: 0,
        skillIndex: 4,
        requirements: { pillarLevel: 9, description: 'Quase nível 1' },
        benefits: ['Força excêntrica', '+25% força negativa'],
        icon: 'NegativePullup'
      }
    ],
    // Nível 1: Básico
    [
      {
        id: 'pull-1-0',
        name: 'Pull-up Estrito',
        description: 'Pull-up completo sem balanço',
        pillar: 'pull',
        level: 1,
        skillIndex: 0,
        requirements: { pillarLevel: 10, description: 'Nível básico' },
        benefits: ['Fundamentos sólidos', '+30% força de costas'],
        icon: 'StrictPullup'
      },
      {
        id: 'pull-1-1',
        name: 'Pull-up com Kipping',
        description: 'Usando momentum do quadril',
        pillar: 'pull',
        level: 1,
        skillIndex: 1,
        requirements: { pillarLevel: 15, description: 'Progresso intermediário' },
        benefits: ['Eficiência energética', '+15% velocidade'],
        icon: 'KippingPullup'
      },
      {
        id: 'pull-1-2',
        name: 'L-Sit Pull-up',
        description: 'Pull-up com pernas elevadas',
        pillar: 'pull',
        level: 1,
        skillIndex: 2,
        requirements: { pillarLevel: 20, description: 'Técnica aprimorada' },
        benefits: ['Core integrado', '+20% estabilidade'],
        icon: 'LSitPullup'
      },
      {
        id: 'pull-1-3',
        name: 'Pull-up com Peso',
        description: 'Adicionando sobrecarga',
        pillar: 'pull',
        level: 1,
        skillIndex: 3,
        requirements: { pillarLevel: 25, description: 'Força estabelecida' },
        benefits: ['Força máxima', '+25% potência'],
        icon: 'WeightedPullup'
      },
      {
        id: 'pull-1-4',
        name: 'Muscle-up',
        description: 'Transição para cima da barra',
        pillar: 'pull',
        level: 1,
        skillIndex: 4,
        requirements: { pillarLevel: 29, description: 'Próximo do nível 2' },
        benefits: ['Transição explosiva', '+30% potência total'],
        icon: 'MuscleUp'
      }
    ],
    // Nível 2: Intermediário
    [
      {
        id: 'pull-2-0',
        name: 'Front Lever Tuck',
        description: 'Front lever com joelhos dobrados',
        pillar: 'pull',
        level: 2,
        skillIndex: 0,
        requirements: { pillarLevel: 30, description: 'Nível intermediário' },
        benefits: ['Controle horizontal', '+35% força isométrica'],
        icon: 'FrontLeverTuck'
      },
      {
        id: 'pull-2-1',
        name: 'Front Lever Avançado',
        description: 'Front lever com uma perna estendida',
        pillar: 'pull',
        level: 2,
        skillIndex: 1,
        requirements: { pillarLevel: 35, description: 'Boa base' },
        benefits: ['Equilíbrio avançado', '+20% core no pull'],
        icon: 'AdvancedFrontLever'
      },
      {
        id: 'pull-2-2',
        name: 'Front Lever Completo',
        description: 'Front lever total',
        pillar: 'pull',
        level: 2,
        skillIndex: 2,
        requirements: { pillarLevel: 40, description: 'Técnica avançada' },
        benefits: ['Maestria horizontal', '+40% controle'],
        icon: 'FullFrontLever'
      },
      {
        id: 'pull-2-3',
        name: 'Back Lever',
        description: 'Lever invertido',
        pillar: 'pull',
        level: 2,
        skillIndex: 3,
        requirements: { pillarLevel: 45, description: 'Força consolidada' },
        benefits: ['Força invertida', '+50% força máxima'],
        icon: 'BackLever'
      },
      {
        id: 'pull-2-4',
        name: 'Front Lever com Peso',
        description: 'Front lever carregando peso',
        pillar: 'pull',
        level: 2,
        skillIndex: 4,
        requirements: { pillarLevel: 49, description: 'Quase mestre' },
        benefits: ['Sobrecarga extrema', '+60% força e controle'],
        icon: 'WeightedFrontLever'
      }
    ],
    // Nível 3: Avançado
    [
      {
        id: 'pull-3-0',
        name: 'Muscle-up Estrito',
        description: 'Muscle-up sem kipping',
        pillar: 'pull',
        level: 3,
        skillIndex: 0,
        requirements: { pillarLevel: 50, description: 'Nível avançado' },
        benefits: ['Força pura', '+25% potência'],
        icon: 'StrictMuscleUp'
      },
      {
        id: 'pull-3-1',
        name: 'Muscle-up com Peso',
        description: 'Muscle-up carregando peso',
        pillar: 'pull',
        level: 3,
        skillIndex: 1,
        requirements: { pillarLevel: 60, description: 'Força excepcional' },
        benefits: ['Explosividade máxima', '+70% potência'],
        icon: 'WeightedMuscleUp'
      },
      {
        id: 'pull-3-2',
        name: 'Front Lever Explosivo',
        description: 'Transições dinâmicas',
        pillar: 'pull',
        level: 3,
        skillIndex: 2,
        requirements: { pillarLevel: 70, description: 'Potência máxima' },
        benefits: ['Dinâmica total', '+80% velocidade'],
        icon: 'ExplosiveFrontLever'
      },
      {
        id: 'pull-3-3',
        name: 'Mestre do Lever',
        description: 'Variações complexas',
        pillar: 'pull',
        level: 3,
        skillIndex: 3,
        requirements: { pillarLevel: 80, description: 'Domínio técnico' },
        benefits: ['Maestria completa', '+90% eficiência'],
        icon: 'MasterLever'
      },
      {
        id: 'pull-3-4',
        name: 'Lever Lendário',
        description: 'Elementos acrobáticos',
        pillar: 'pull',
        level: 3,
        skillIndex: 4,
        requirements: { pillarLevel: 89, description: 'Próximo da lenda' },
        benefits: ['Habilidade lendária', '+100% força e técnica'],
        icon: 'LegendaryLever'
      }
    ],
    // Nível 4: Mestre
    [
      {
        id: 'pull-4-0',
        name: 'Elite Lever',
        description: 'Variações extremas',
        pillar: 'pull',
        level: 4,
        skillIndex: 0,
        requirements: { pillarLevel: 90, description: 'Nível de elite' },
        benefits: ['Perfeição técnica', '+50% todos os atributos'],
        icon: 'EliteLever'
      },
      {
        id: 'pull-4-1',
        name: 'Human Flag',
        description: 'Bandeira humana completa',
        pillar: 'pull',
        level: 4,
        skillIndex: 1,
        requirements: { pillarLevel: 95, description: 'Força sobre-humana' },
        benefits: ['Controle absoluto', '+120% força lateral'],
        icon: 'HumanFlag'
      },
      {
        id: 'pull-4-2',
        name: 'Mestre dos Ares',
        description: 'Controle gravitacional total',
        pillar: 'pull',
        level: 4,
        skillIndex: 2,
        requirements: { pillarLevel: 98, description: 'Domínio absoluto' },
        benefits: ['Poder aéreo', '+150% controle'],
        icon: 'AirMaster'
      },
      {
        id: 'pull-4-3',
        name: 'Avatar do Pull',
        description: 'Maestria completa em puxar',
        pillar: 'pull',
        level: 4,
        skillIndex: 3,
        requirements: { pillarLevel: 99, description: 'Quase deus' },
        benefits: ['Poder divino', '+200% força total'],
        icon: 'PullAvatar'
      },
      {
        id: 'pull-4-4',
        name: 'Deus do Puxar',
        description: 'Perfeição absoluta no pull',
        pillar: 'pull',
        level: 4,
        skillIndex: 4,
        requirements: { pillarLevel: 100, description: 'Nível máximo alcançado' },
        benefits: ['Poder ilimitado', '+300% força e controle'],
        icon: 'PullGod'
      }
    ]
  ],
  core: [
    // Nível 0: Iniciante Total
    [
      {
        id: 'core-0-0',
        name: 'Prancha de Parede',
        description: 'Prancha apoiada na parede',
        pillar: 'core',
        level: 0,
        skillIndex: 0,
        requirements: { pillarLevel: 1, description: 'Nível básico de core' },
        benefits: ['Fundamentos de estabilidade', '+5% resistência core'],
        icon: 'WallPlank'
      },
      {
        id: 'core-0-1',
        name: 'Prancha de Joelho',
        description: 'Prancha com joelhos no chão',
        pillar: 'core',
        level: 0,
        skillIndex: 1,
        requirements: { pillarLevel: 3, description: 'Leve experiência' },
        benefits: ['Introdução ao core', '+10% estabilidade'],
        icon: 'KneePlank'
      },
      {
        id: 'core-0-2',
        name: 'Prancha Parcial',
        description: 'Prancha por tempo limitado',
        pillar: 'core',
        level: 0,
        skillIndex: 2,
        requirements: { pillarLevel: 5, description: 'Experiência moderada' },
        benefits: ['Resistência inicial', '+15% endurance core'],
        icon: 'PartialPlank'
      },
      {
        id: 'core-0-3',
        name: 'Prancha com Apoio',
        description: 'Prancha com mãos elevadas',
        pillar: 'core',
        level: 0,
        skillIndex: 3,
        requirements: { pillarLevel: 7, description: 'Boa base' },
        benefits: ['Progressão gradual', '+20% força core'],
        icon: 'SupportedPlank'
      },
      {
        id: 'core-0-4',
        name: 'Prancha Estática',
        description: 'Prancha mantida por 30s',
        pillar: 'core',
        level: 0,
        skillIndex: 4,
        requirements: { pillarLevel: 9, description: 'Quase nível 1' },
        benefits: ['Base sólida', '+25% resistência'],
        icon: 'StaticPlank'
      }
    ],
    // Nível 1: Básico
    [
      {
        id: 'core-1-0',
        name: 'Prancha Completa',
        description: 'Prancha padrão por 1 minuto',
        pillar: 'core',
        level: 1,
        skillIndex: 0,
        requirements: { pillarLevel: 10, description: 'Nível básico' },
        benefits: ['Fundamentos sólidos', '+30% estabilidade geral'],
        icon: 'FullPlank'
      },
      {
        id: 'core-1-1',
        name: 'Prancha Lateral',
        description: 'Prancha de lado',
        pillar: 'core',
        level: 1,
        skillIndex: 1,
        requirements: { pillarLevel: 15, description: 'Progresso intermediário' },
        benefits: ['Obliques enfatizados', '+15% força lateral'],
        icon: 'SidePlank'
      },
      {
        id: 'core-1-2',
        name: 'L-Sit',
        description: 'Posição L com pernas elevadas',
        pillar: 'core',
        level: 1,
        skillIndex: 2,
        requirements: { pillarLevel: 20, description: 'Técnica aprimorada' },
        benefits: ['Flexibilidade e força', '+20% core dinâmico'],
        icon: 'LSit'
      },
      {
        id: 'core-1-3',
        name: 'Hollow Hold',
        description: 'Posição hollow mantida',
        pillar: 'core',
        level: 1,
        skillIndex: 3,
        requirements: { pillarLevel: 25, description: 'Força estabelecida' },
        benefits: ['Controle postural', '+25% estabilidade'],
        icon: 'HollowHold'
      },
      {
        id: 'core-1-4',
        name: 'Dragon Flag',
        description: 'Bandeira de dragão negativa',
        pillar: 'core',
        level: 1,
        skillIndex: 4,
        requirements: { pillarLevel: 29, description: 'Próximo do nível 2' },
        benefits: ['Controle excêntrico', '+30% força total core'],
        icon: 'DragonFlagNeg'
      }
    ],
    // Nível 2: Intermediário
    [
      {
        id: 'core-2-0',
        name: 'Dragon Flag',
        description: 'Bandeira de dragão completa',
        pillar: 'core',
        level: 2,
        skillIndex: 0,
        requirements: { pillarLevel: 30, description: 'Nível intermediário' },
        benefits: ['Controle total', '+35% força isométrica'],
        icon: 'DragonFlag'
      },
      {
        id: 'core-2-1',
        name: 'V-Up',
        description: 'Elevação de pernas em V',
        pillar: 'core',
        level: 2,
        skillIndex: 1,
        requirements: { pillarLevel: 35, description: 'Boa base' },
        benefits: ['Coordenação avançada', '+20% explosividade'],
        icon: 'VUp'
      },
      {
        id: 'core-2-2',
        name: 'Human Flag Prep',
        description: 'Preparação para bandeira humana',
        pillar: 'core',
        level: 2,
        skillIndex: 2,
        requirements: { pillarLevel: 40, description: 'Técnica avançada' },
        benefits: ['Força lateral máxima', '+40% obliques'],
        icon: 'HumanFlagPrep'
      },
      {
        id: 'core-2-3',
        name: 'Planche Core',
        description: 'Core durante planche',
        pillar: 'core',
        level: 2,
        skillIndex: 3,
        requirements: { pillarLevel: 45, description: 'Força consolidada' },
        benefits: ['Integração push-core', '+50% estabilidade'],
        icon: 'PlancheCore'
      },
      {
        id: 'core-2-4',
        name: 'Core Mastery',
        description: 'Combinação avançada',
        pillar: 'core',
        level: 2,
        skillIndex: 4,
        requirements: { pillarLevel: 49, description: 'Quase mestre' },
        benefits: ['Domínio técnico', '+60% eficiência'],
        icon: 'CoreMastery'
      }
    ],
    // Nível 3: Avançado
    [
      {
        id: 'core-3-0',
        name: 'Human Flag',
        description: 'Bandeira humana completa',
        pillar: 'core',
        level: 3,
        skillIndex: 0,
        requirements: { pillarLevel: 50, description: 'Nível avançado' },
        benefits: ['Controle gravitacional', '+25% força lateral'],
        icon: 'HumanFlag'
      },
      {
        id: 'core-3-1',
        name: 'Dragon Flag Full',
        description: 'Variações da bandeira',
        pillar: 'core',
        level: 3,
        skillIndex: 1,
        requirements: { pillarLevel: 60, description: 'Força excepcional' },
        benefits: ['Arte do core', '+70% controle'],
        icon: 'DragonFlagFull'
      },
      {
        id: 'core-3-2',
        name: 'Core Explosivo',
        description: 'Movimentos dinâmicos',
        pillar: 'core',
        level: 3,
        skillIndex: 2,
        requirements: { pillarLevel: 70, description: 'Potência máxima' },
        benefits: ['Explosividade total', '+80% potência'],
        icon: 'ExplosiveCore'
      },
      {
        id: 'core-3-3',
        name: 'Mestre do Core',
        description: 'Variações complexas',
        pillar: 'core',
        level: 3,
        skillIndex: 3,
        requirements: { pillarLevel: 80, description: 'Domínio técnico' },
        benefits: ['Maestria completa', '+90% eficiência'],
        icon: 'CoreMaster'
      },
      {
        id: 'core-3-4',
        name: 'Core Lendário',
        description: 'Elementos acrobáticos',
        pillar: 'core',
        level: 3,
        skillIndex: 4,
        requirements: { pillarLevel: 89, description: 'Próximo da lenda' },
        benefits: ['Habilidade lendária', '+100% força e técnica'],
        icon: 'LegendaryCore'
      }
    ],
    // Nível 4: Mestre
    [
      {
        id: 'core-4-0',
        name: 'Elite Core',
        description: 'Variações extremas',
        pillar: 'core',
        level: 4,
        skillIndex: 0,
        requirements: { pillarLevel: 90, description: 'Nível de elite' },
        benefits: ['Perfeição técnica', '+50% todos os atributos'],
        icon: 'EliteCore'
      },
      {
        id: 'core-4-1',
        name: 'Mestre Gravitacional',
        description: 'Controle absoluto da gravidade',
        pillar: 'core',
        level: 4,
        skillIndex: 1,
        requirements: { pillarLevel: 95, description: 'Força sobre-humana' },
        benefits: ['Poder gravitacional', '+120% controle'],
        icon: 'GravityMaster'
      },
      {
        id: 'core-4-2',
        name: 'Avatar do Core',
        description: 'Maestria completa em estabilidade',
        pillar: 'core',
        level: 4,
        skillIndex: 2,
        requirements: { pillarLevel: 98, description: 'Domínio absoluto' },
        benefits: ['Centro de poder', '+150% estabilidade'],
        icon: 'CoreAvatar'
      },
      {
        id: 'core-4-3',
        name: 'Deus da Estabilidade',
        description: 'Perfeição absoluta no core',
        pillar: 'core',
        level: 4,
        skillIndex: 3,
        requirements: { pillarLevel: 99, description: 'Quase deus' },
        benefits: ['Poder divino', '+200% força total'],
        icon: 'StabilityGod'
      },
      {
        id: 'core-4-4',
        name: 'Avatar Supremo',
        description: 'Unidade perfeita de corpo e mente',
        pillar: 'core',
        level: 4,
        skillIndex: 4,
        requirements: { pillarLevel: 100, description: 'Nível máximo alcançado' },
        benefits: ['Iluminação física', '+300% força e controle'],
        icon: 'SupremeAvatar'
      }
    ]
  ],
  legs: [
    // Nível 0: Iniciante Total
    [
      {
        id: 'legs-0-0',
        name: 'Agachamento Assistido',
        description: 'Agachamento com apoio',
        pillar: 'legs',
        level: 0,
        skillIndex: 0,
        requirements: { pillarLevel: 1, description: 'Nível básico de legs' },
        benefits: ['Fundamentos de squat', '+5% força inferior'],
        icon: 'AssistedSquat'
      },
      {
        id: 'legs-0-1',
        name: 'Agachamento Parcial',
        description: 'Agachamento até metade',
        pillar: 'legs',
        level: 0,
        skillIndex: 1,
        requirements: { pillarLevel: 3, description: 'Leve experiência' },
        benefits: ['Mobilidade inicial', '+10% amplitude'],
        icon: 'PartialSquat'
      },
      {
        id: 'legs-0-2',
        name: 'Agachamento com Apoio',
        description: 'Segurando em algo para equilíbrio',
        pillar: 'legs',
        level: 0,
        skillIndex: 2,
        requirements: { pillarLevel: 5, description: 'Experiência moderada' },
        benefits: ['Equilíbrio básico', '+15% estabilidade'],
        icon: 'SupportedSquat'
      },
      {
        id: 'legs-0-3',
        name: 'Agachamento Negativo',
        description: 'Descer lentamente no squat',
        pillar: 'legs',
        level: 0,
        skillIndex: 3,
        requirements: { pillarLevel: 7, description: 'Boa base' },
        benefits: ['Controle excêntrico', '+20% força negativa'],
        icon: 'NegativeSquat'
      },
      {
        id: 'legs-0-4',
        name: 'Agachamento Estático',
        description: 'Pausa na posição baixa',
        pillar: 'legs',
        level: 0,
        skillIndex: 4,
        requirements: { pillarLevel: 9, description: 'Quase nível 1' },
        benefits: ['Força isométrica', '+25% resistência'],
        icon: 'StaticSquat'
      }
    ],
    // Nível 1: Básico
    [
      {
        id: 'legs-1-0',
        name: 'Agachamento Completo',
        description: 'Squat full range of motion',
        pillar: 'legs',
        level: 1,
        skillIndex: 0,
        requirements: { pillarLevel: 10, description: 'Nível básico' },
        benefits: ['Fundamentos sólidos', '+30% força de pernas'],
        icon: 'FullSquat'
      },
      {
        id: 'legs-1-1',
        name: 'Agachamento Búlgaro',
        description: 'Squat com uma perna elevada',
        pillar: 'legs',
        level: 1,
        skillIndex: 1,
        requirements: { pillarLevel: 15, description: 'Progresso intermediário' },
        benefits: ['Equilíbrio unilateral', '+15% força assimétrica'],
        icon: 'BulgarianSplitSquat'
      },
      {
        id: 'legs-1-2',
        name: 'Pistol Squat Prep',
        description: 'Preparação para pistol squat',
        pillar: 'legs',
        level: 1,
        skillIndex: 2,
        requirements: { pillarLevel: 20, description: 'Técnica aprimorada' },
        benefits: ['Mobilidade avançada', '+20% flexibilidade'],
        icon: 'PistolPrep'
      },
      {
        id: 'legs-1-3',
        name: 'Agachamento com Peso',
        description: 'Squat carregando peso',
        pillar: 'legs',
        level: 1,
        skillIndex: 3,
        requirements: { pillarLevel: 25, description: 'Força estabelecida' },
        benefits: ['Sobrecarga progressiva', '+25% força máxima'],
        icon: 'WeightedSquat'
      },
      {
        id: 'legs-1-4',
        name: 'Pistol Squat',
        description: 'Squat em uma perna',
        pillar: 'legs',
        level: 1,
        skillIndex: 4,
        requirements: { pillarLevel: 29, description: 'Próximo do nível 2' },
        benefits: ['Força unilateral máxima', '+30% potência'],
        icon: 'PistolSquat'
      }
    ],
    // Nível 2: Intermediário
    [
      {
        id: 'legs-2-0',
        name: 'Pistol com Peso',
        description: 'Pistol squat carregando peso',
        pillar: 'legs',
        level: 2,
        skillIndex: 0,
        requirements: { pillarLevel: 30, description: 'Nível intermediário' },
        benefits: ['Força excepcional', '+35% potência unilateral'],
        icon: 'WeightedPistol'
      },
      {
        id: 'legs-2-1',
        name: 'Shrimp Squat',
        description: 'Squat invertido em uma perna',
        pillar: 'legs',
        level: 2,
        skillIndex: 1,
        requirements: { pillarLevel: 35, description: 'Boa base' },
        benefits: ['Mobilidade extrema', '+20% flexibilidade'],
        icon: 'ShrimpSquat'
      },
      {
        id: 'legs-2-2',
        name: 'Squat Explosivo',
        description: 'Squat com salto',
        pillar: 'legs',
        level: 2,
        skillIndex: 2,
        requirements: { pillarLevel: 40, description: 'Técnica avançada' },
        benefits: ['Potência máxima', '+40% explosividade'],
        icon: 'ExplosiveSquat'
      },
      {
        id: 'legs-2-3',
        name: 'Squat Isométrico',
        description: 'Pausas prolongadas',
        pillar: 'legs',
        level: 2,
        skillIndex: 3,
        requirements: { pillarLevel: 45, description: 'Força consolidada' },
        benefits: ['Resistência extrema', '+50% endurance'],
        icon: 'IsometricSquat'
      },
      {
        id: 'legs-2-4',
        name: 'Mestre do Squat',
        description: 'Variações complexas',
        pillar: 'legs',
        level: 2,
        skillIndex: 4,
        requirements: { pillarLevel: 49, description: 'Quase mestre' },
        benefits: ['Domínio técnico', '+60% eficiência'],
        icon: 'SquatMaster'
      }
    ],
    // Nível 3: Avançado
    [
      {
        id: 'legs-3-0',
        name: 'Squat de Elite',
        description: 'Variações extremas',
        pillar: 'legs',
        level: 3,
        skillIndex: 0,
        requirements: { pillarLevel: 50, description: 'Nível avançado' },
        benefits: ['Força sobre-humana', '+25% potência total'],
        icon: 'EliteSquat'
      },
      {
        id: 'legs-3-1',
        name: 'Pistol Mastery',
        description: 'Domínio completo do pistol',
        pillar: 'legs',
        level: 3,
        skillIndex: 1,
        requirements: { pillarLevel: 60, description: 'Força excepcional' },
        benefits: ['Arte do unilateral', '+70% controle'],
        icon: 'PistolMastery'
      },
      {
        id: 'legs-3-2',
        name: 'Explosive Mastery',
        description: 'Potência máxima em todas as formas',
        pillar: 'legs',
        level: 3,
        skillIndex: 2,
        requirements: { pillarLevel: 70, description: 'Potência máxima' },
        benefits: ['Explosividade lendária', '+80% velocidade'],
        icon: 'ExplosiveMastery'
      },
      {
        id: 'legs-3-3',
        name: 'Mestre das Pernas',
        description: 'Maestria completa',
        pillar: 'legs',
        level: 3,
        skillIndex: 3,
        requirements: { pillarLevel: 80, description: 'Domínio técnico' },
        benefits: ['Perfeição técnica', '+90% eficiência'],
        icon: 'LegsMaster'
      },
      {
        id: 'legs-3-4',
        name: 'Lendas das Pernas',
        description: 'Elementos míticos',
        pillar: 'legs',
        level: 3,
        skillIndex: 4,
        requirements: { pillarLevel: 89, description: 'Próximo da lenda' },
        benefits: ['Poder lendário', '+100% força e técnica'],
        icon: 'LegendaryLegs'
      }
    ],
    // Nível 4: Mestre
    [
      {
        id: 'legs-4-0',
        name: 'Elite Unilateral',
        description: 'Domínio absoluto do unilateral',
        pillar: 'legs',
        level: 4,
        skillIndex: 0,
        requirements: { pillarLevel: 90, description: 'Nível de elite' },
        benefits: ['Perfeição assimétrica', '+50% todos os atributos'],
        icon: 'EliteUnilateral'
      },
      {
        id: 'legs-4-1',
        name: 'Mestre Gravitacional',
        description: 'Controle da gravidade',
        pillar: 'legs',
        level: 4,
        skillIndex: 1,
        requirements: { pillarLevel: 95, description: 'Força sobre-humana' },
        benefits: ['Poder gravitacional', '+120% força'],
        icon: 'GravityLegs'
      },
      {
        id: 'legs-4-2',
        name: 'Avatar das Pernas',
        description: 'Maestria completa em inferiores',
        pillar: 'legs',
        level: 4,
        skillIndex: 2,
        requirements: { pillarLevel: 98, description: 'Domínio absoluto' },
        benefits: ['Força titânica', '+150% potência'],
        icon: 'LegsAvatar'
      },
      {
        id: 'legs-4-3',
        name: 'Deus das Pernas',
        description: 'Perfeição absoluta nas pernas',
        pillar: 'legs',
        level: 4,
        skillIndex: 3,
        requirements: { pillarLevel: 99, description: 'Quase deus' },
        benefits: ['Poder divino', '+200% força total'],
        icon: 'LegsGod'
      },
      {
        id: 'legs-4-4',
        name: 'Titan das Profundezas',
        description: 'Poder ilimitado das pernas',
        pillar: 'legs',
        level: 4,
        skillIndex: 4,
        requirements: { pillarLevel: 100, description: 'Nível máximo alcançado' },
        benefits: ['Força titânica', '+300% força e controle'],
        icon: 'TitanLegs'
      }
    ]
  ],
  mobility: [
    // Nível 0: Iniciante Total
    [
      {
        id: 'mobility-0-0',
        name: 'Alongamentos Básicos',
        description: 'Alongamentos simples de membros',
        pillar: 'mobility',
        level: 0,
        skillIndex: 0,
        requirements: { pillarLevel: 1, description: 'Nível básico de mobility' },
        benefits: ['Flexibilidade inicial', '+5% amplitude'],
        icon: 'BasicStretch'
      },
      {
        id: 'mobility-0-1',
        name: 'Circunduções',
        description: 'Movimentos circulares das articulações',
        pillar: 'mobility',
        level: 0,
        skillIndex: 1,
        requirements: { pillarLevel: 3, description: 'Leve experiência' },
        benefits: ['Mobilização articular', '+10% lubrificação'],
        icon: 'JointCircles'
      },
      {
        id: 'mobility-0-2',
        name: 'Postura Básica',
        description: 'Correção postural simples',
        pillar: 'mobility',
        level: 0,
        skillIndex: 2,
        requirements: { pillarLevel: 5, description: 'Experiência moderada' },
        benefits: ['Alinhamento inicial', '+15% postura'],
        icon: 'BasicPosture'
      },
      {
        id: 'mobility-0-3',
        name: 'Mobilidade de Ombros',
        description: 'Exercícios específicos para ombros',
        pillar: 'mobility',
        level: 0,
        skillIndex: 3,
        requirements: { pillarLevel: 7, description: 'Boa base' },
        benefits: ['Ombros funcionais', '+20% amplitude'],
        icon: 'ShoulderMobility'
      },
      {
        id: 'mobility-0-4',
        name: 'Quadril Aberto',
        description: 'Abertura básica de quadril',
        pillar: 'mobility',
        level: 0,
        skillIndex: 4,
        requirements: { pillarLevel: 9, description: 'Quase nível 1' },
        benefits: ['Base para squat', '+25% flexibilidade inferior'],
        icon: 'HipOpeners'
      }
    ],
    // Nível 1: Básico
    [
      {
        id: 'mobility-1-0',
        name: 'Flow Dinâmico',
        description: 'Sequências de mobilização',
        pillar: 'mobility',
        level: 1,
        skillIndex: 0,
        requirements: { pillarLevel: 10, description: 'Nível básico' },
        benefits: ['Coordenação fluida', '+30% eficiência articular'],
        icon: 'DynamicFlow'
      },
      {
        id: 'mobility-1-1',
        name: 'Deep Squat Hold',
        description: 'Agachamento profundo mantido',
        pillar: 'mobility',
        level: 1,
        skillIndex: 1,
        requirements: { pillarLevel: 15, description: 'Progresso intermediário' },
        benefits: ['Mobilidade profunda', '+15% flexibilidade total'],
        icon: 'DeepSquatHold'
      },
      {
        id: 'mobility-1-2',
        name: 'Ponte Completa',
        description: 'Bridge full range',
        pillar: 'mobility',
        level: 1,
        skillIndex: 2,
        requirements: { pillarLevel: 20, description: 'Técnica aprimorada' },
        benefits: ['Extensão posterior', '+20% mobilidade dorsal'],
        icon: 'FullBridge'
      },
      {
        id: 'mobility-1-3',
        name: 'Contortion Prep',
        description: 'Preparação para contorcionismo',
        pillar: 'mobility',
        level: 1,
        skillIndex: 3,
        requirements: { pillarLevel: 25, description: 'Força estabelecida' },
        benefits: ['Flexibilidade avançada', '+25% amplitude total'],
        icon: 'ContortionPrep'
      },
      {
        id: 'mobility-1-4',
        name: 'Stand to Stand',
        description: 'Transições fluidas',
        pillar: 'mobility',
        level: 1,
        skillIndex: 4,
        requirements: { pillarLevel: 29, description: 'Próximo do nível 2' },
        benefits: ['Coordenação perfeita', '+30% eficiência'],
        icon: 'StandToStand'
      }
    ],
    // Nível 2: Intermediário
    [
      {
        id: 'mobility-2-0',
        name: 'Contortion Básico',
        description: 'Posições básicas de contorcionismo',
        pillar: 'mobility',
        level: 2,
        skillIndex: 0,
        requirements: { pillarLevel: 30, description: 'Nível intermediário' },
        benefits: ['Flexibilidade extrema', '+35% amplitude articular'],
        icon: 'BasicContortion'
      },
      {
        id: 'mobility-2-1',
        name: 'Ponte de Mão',
        description: 'Handstand com ponte',
        pillar: 'mobility',
        level: 2,
        skillIndex: 1,
        requirements: { pillarLevel: 35, description: 'Boa base' },
        benefits: ['Controle invertido', '+20% equilíbrio'],
        icon: 'HandBridge'
      },
      {
        id: 'mobility-2-2',
        name: 'Contortion Avançado',
        description: 'Variações complexas',
        pillar: 'mobility',
        level: 2,
        skillIndex: 2,
        requirements: { pillarLevel: 40, description: 'Técnica avançada' },
        benefits: ['Arte corporal', '+40% flexibilidade'],
        icon: 'AdvancedContortion'
      },
      {
        id: 'mobility-2-3',
        name: 'Mestre da Amplitude',
        description: 'Domínio da mobilidade',
        pillar: 'mobility',
        level: 2,
        skillIndex: 3,
        requirements: { pillarLevel: 45, description: 'Força consolidada' },
        benefits: ['Liberdade corporal', '+50% amplitude total'],
        icon: 'RangeMaster'
      },
      {
        id: 'mobility-2-4',
        name: 'Contortion Mastery',
        description: 'Maestria no contorcionismo',
        pillar: 'mobility',
        level: 2,
        skillIndex: 4,
        requirements: { pillarLevel: 49, description: 'Quase mestre' },
        benefits: ['Corpo líquido', '+60% eficiência'],
        icon: 'ContortionMastery'
      }
    ],
    // Nível 3: Avançado
    [
      {
        id: 'mobility-3-0',
        name: 'Elite Contortion',
        description: 'Variações de elite',
        pillar: 'mobility',
        level: 3,
        skillIndex: 0,
        requirements: { pillarLevel: 50, description: 'Nível avançado' },
        benefits: ['Arte suprema', '+25% amplitude máxima'],
        icon: 'EliteContortion'
      },
      {
        id: 'mobility-3-1',
        name: 'Mestre Invertido',
        description: 'Controle perfeito invertido',
        pillar: 'mobility',
        level: 3,
        skillIndex: 1,
        requirements: { pillarLevel: 60, description: 'Força excepcional' },
        benefits: ['Equilíbrio absoluto', '+70% controle'],
        icon: 'InvertedMaster'
      },
      {
        id: 'mobility-3-2',
        name: 'Contortion Explosivo',
        description: 'Transições dinâmicas',
        pillar: 'mobility',
        level: 3,
        skillIndex: 2,
        requirements: { pillarLevel: 70, description: 'Potência máxima' },
        benefits: ['Velocidade extrema', '+80% fluidez'],
        icon: 'ExplosiveContortion'
      },
      {
        id: 'mobility-3-3',
        name: 'Mestre da Forma',
        description: 'Perfeição anatômica',
        pillar: 'mobility',
        level: 3,
        skillIndex: 3,
        requirements: { pillarLevel: 80, description: 'Domínio técnico' },
        benefits: ['Forma perfeita', '+90% eficiência'],
        icon: 'FormMaster'
      },
      {
        id: 'mobility-3-4',
        name: 'Lendas da Flexibilidade',
        description: 'Elementos míticos',
        pillar: 'mobility',
        level: 3,
        skillIndex: 4,
        requirements: { pillarLevel: 89, description: 'Próximo da lenda' },
        benefits: ['Corpo lendário', '+100% amplitude e controle'],
        icon: 'LegendaryFlexibility'
      }
    ],
    // Nível 4: Mestre
    [
      {
        id: 'mobility-4-0',
        name: 'Elite da Forma',
        description: 'Perfeição anatômica máxima',
        pillar: 'mobility',
        level: 4,
        skillIndex: 0,
        requirements: { pillarLevel: 90, description: 'Nível de elite' },
        benefits: ['Forma divina', '+50% todos os atributos'],
        icon: 'EliteForm'
      },
      {
        id: 'mobility-4-1',
        name: 'Mestre Dimensional',
        description: 'Controle em múltiplas dimensões',
        pillar: 'mobility',
        level: 4,
        skillIndex: 1,
        requirements: { pillarLevel: 95, description: 'Força sobre-humana' },
        benefits: ['Movimento quadridimensional', '+120% amplitude'],
        icon: 'DimensionalMaster'
      },
      {
        id: 'mobility-4-2',
        name: 'Avatar da Forma',
        description: 'Maestria completa na forma',
        pillar: 'mobility',
        level: 4,
        skillIndex: 2,
        requirements: { pillarLevel: 98, description: 'Domínio absoluto' },
        benefits: ['Forma perfeita', '+150% controle'],
        icon: 'FormAvatar'
      },
      {
        id: 'mobility-4-3',
        name: 'Deus da Forma',
        description: 'Perfeição absoluta na mobilidade',
        pillar: 'mobility',
        level: 4,
        skillIndex: 3,
        requirements: { pillarLevel: 99, description: 'Quase deus' },
        benefits: ['Poder divino', '+200% amplitude total'],
        icon: 'FormGod'
      },
      {
        id: 'mobility-4-4',
        name: 'Ser Fluido',
        description: 'Unidade perfeita com o movimento',
        pillar: 'mobility',
        level: 4,
        skillIndex: 4,
        requirements: { pillarLevel: 100, description: 'Nível máximo alcançado' },
        benefits: ['Essência do movimento', '+300% amplitude e controle'],
        icon: 'FluidBeing'
      }
    ]
  ],
  endurance: [
    // Nível 0: Iniciante Total
    [
      {
        id: 'endurance-0-0',
        name: 'Caminhada Leve',
        description: 'Caminhada curta e lenta',
        pillar: 'endurance',
        level: 0,
        skillIndex: 0,
        requirements: { pillarLevel: 1, description: 'Nível básico de endurance' },
        benefits: ['Base cardiovascular', '+5% resistência'],
        icon: 'LightWalk'
      },
      {
        id: 'endurance-0-1',
        name: 'Caminhada Moderada',
        description: 'Caminhada com ritmo constante',
        pillar: 'endurance',
        level: 0,
        skillIndex: 1,
        requirements: { pillarLevel: 3, description: 'Leve experiência' },
        benefits: ['Condição inicial', '+10% endurance'],
        icon: 'ModerateWalk'
      },
      {
        id: 'endurance-0-2',
        name: 'Caminhada Acelerada',
        description: 'Caminhada mais rápida',
        pillar: 'endurance',
        level: 0,
        skillIndex: 2,
        requirements: { pillarLevel: 5, description: 'Experiência moderada' },
        benefits: ['Ritmo crescente', '+15% capacidade'],
        icon: 'BriskWalk'
      },
      {
        id: 'endurance-0-3',
        name: 'Trote Leve',
        description: 'Corrida muito lenta',
        pillar: 'endurance',
        level: 0,
        skillIndex: 3,
        requirements: { pillarLevel: 7, description: 'Boa base' },
        benefits: ['Introdução à corrida', '+20% resistência'],
        icon: 'LightJog'
      },
      {
        id: 'endurance-0-4',
        name: 'Trote Moderado',
        description: 'Corrida constante',
        pillar: 'endurance',
        level: 0,
        skillIndex: 4,
        requirements: { pillarLevel: 9, description: 'Quase nível 1' },
        benefits: ['Base sólida', '+25% endurance aeróbica'],
        icon: 'ModerateJog'
      }
    ],
    // Nível 1: Básico
    [
      {
        id: 'endurance-1-0',
        name: 'Corrida Contínua',
        description: 'Corrida steady state',
        pillar: 'endurance',
        level: 1,
        skillIndex: 0,
        requirements: { pillarLevel: 10, description: 'Nível básico' },
        benefits: ['Resistência estabelecida', '+30% capacidade aeróbica'],
        icon: 'SteadyRun'
      },
      {
        id: 'endurance-1-1',
        name: 'Intervalos Básicos',
        description: 'HIIT simples',
        pillar: 'endurance',
        level: 1,
        skillIndex: 1,
        requirements: { pillarLevel: 15, description: 'Progresso intermediário' },
        benefits: ['Capacidade anaeróbica', '+15% potência'],
        icon: 'BasicIntervals'
      },
      {
        id: 'endurance-1-2',
        name: 'Corrida Longa',
        description: 'Distâncias maiores',
        pillar: 'endurance',
        level: 1,
        skillIndex: 2,
        requirements: { pillarLevel: 20, description: 'Técnica aprimorada' },
        benefits: ['Resistência prolongada', '+20% endurance'],
        icon: 'LongRun'
      },
      {
        id: 'endurance-1-3',
        name: 'Fartlek',
        description: 'Corrida com variações',
        pillar: 'endurance',
        level: 1,
        skillIndex: 3,
        requirements: { pillarLevel: 25, description: 'Força estabelecida' },
        benefits: ['Adaptabilidade', '+25% eficiência'],
        icon: 'Fartlek'
      },
      {
        id: 'endurance-1-4',
        name: 'Repeats',
        description: 'Repetições de velocidade',
        pillar: 'endurance',
        level: 1,
        skillIndex: 4,
        requirements: { pillarLevel: 29, description: 'Próximo do nível 2' },
        benefits: ['Velocidade específica', '+30% potência máxima'],
        icon: 'SpeedRepeats'
      }
    ],
    // Nível 2: Intermediário
    [
      {
        id: 'endurance-2-0',
        name: 'Ultra Endurance',
        description: 'Distâncias extremas',
        pillar: 'endurance',
        level: 2,
        skillIndex: 0,
        requirements: { pillarLevel: 30, description: 'Nível intermediário' },
        benefits: ['Resistência sobre-humana', '+35% capacidade máxima'],
        icon: 'UltraEndurance'
      },
      {
        id: 'endurance-2-1',
        name: 'HIIT Avançado',
        description: 'Intervalos complexos',
        pillar: 'endurance',
        level: 2,
        skillIndex: 1,
        requirements: { pillarLevel: 35, description: 'Boa base' },
        benefits: ['Potência anaeróbica máxima', '+20% explosividade'],
        icon: 'AdvancedHIIT'
      },
      {
        id: 'endurance-2-2',
        name: 'Corrida Montanha',
        description: 'Terreno variado',
        pillar: 'endurance',
        level: 2,
        skillIndex: 2,
        requirements: { pillarLevel: 40, description: 'Técnica avançada' },
        benefits: ['Força funcional', '+40% resistência total'],
        icon: 'HillRunning'
      },
      {
        id: 'endurance-2-3',
        name: 'Mestre do Ritmo',
        description: 'Controle perfeito do pace',
        pillar: 'endurance',
        level: 2,
        skillIndex: 3,
        requirements: { pillarLevel: 45, description: 'Força consolidada' },
        benefits: ['Eficiência máxima', '+50% economia'],
        icon: 'PaceMaster'
      },
      {
        id: 'endurance-2-4',
        name: 'Endurance Mastery',
        description: 'Domínio completo',
        pillar: 'endurance',
        level: 2,
        skillIndex: 4,
        requirements: { pillarLevel: 49, description: 'Quase mestre' },
        benefits: ['Resistência lendária', '+60% capacidade'],
        icon: 'EnduranceMastery'
      }
    ],
    // Nível 3: Avançado
    [
      {
        id: 'endurance-3-0',
        name: 'Ultra Runner',
        description: 'Corrida de ultra distâncias',
        pillar: 'endurance',
        level: 3,
        skillIndex: 0,
        requirements: { pillarLevel: 50, description: 'Nível avançado' },
        benefits: ['Resistência infinita', '+25% capacidade máxima'],
        icon: 'UltraRunner'
      },
      {
        id: 'endurance-3-1',
        name: 'Sprint Mastery',
        description: 'Velocidade máxima',
        pillar: 'endurance',
        level: 3,
        skillIndex: 1,
        requirements: { pillarLevel: 60, description: 'Força excepcional' },
        benefits: ['Explosividade máxima', '+70% velocidade'],
        icon: 'SprintMastery'
      },
      {
        id: 'endurance-3-2',
        name: 'Endurance Explosivo',
        description: 'Combinação perfeita',
        pillar: 'endurance',
        level: 3,
        skillIndex: 2,
        requirements: { pillarLevel: 70, description: 'Potência máxima' },
        benefits: ['Poder total', '+80% eficiência'],
        icon: 'ExplosiveEndurance'
      },
      {
        id: 'endurance-3-3',
        name: 'Mestre da Resistência',
        description: 'Maestria completa',
        pillar: 'endurance',
        level: 3,
        skillIndex: 3,
        requirements: { pillarLevel: 80, description: 'Domínio técnico' },
        benefits: ['Perfeição', '+90% capacidade'],
        icon: 'EnduranceMaster'
      },
      {
        id: 'endurance-3-4',
        name: 'Lendas da Resistência',
        description: 'Elementos míticos',
        pillar: 'endurance',
        level: 3,
        skillIndex: 4,
        requirements: { pillarLevel: 89, description: 'Próximo da lenda' },
        benefits: ['Poder lendário', '+100% resistência e velocidade'],
        icon: 'LegendaryEndurance'
      }
    ],
    // Nível 4: Mestre
    [
      {
        id: 'endurance-4-0',
        name: 'Elite Endurance',
        description: 'Resistência de elite',
        pillar: 'endurance',
        level: 4,
        skillIndex: 0,
        requirements: { pillarLevel: 90, description: 'Nível de elite' },
        benefits: ['Perfeição atlética', '+50% todos os atributos'],
        icon: 'EliteEndurance'
      },
      {
        id: 'endurance-4-1',
        name: 'Mestre do Tempo',
        description: 'Controle absoluto do tempo',
        pillar: 'endurance',
        level: 4,
        skillIndex: 1,
        requirements: { pillarLevel: 95, description: 'Força sobre-humana' },
        benefits: ['Velocidade infinita', '+120% capacidade'],
        icon: 'TimeMaster'
      },
      {
        id: 'endurance-4-2',
        name: 'Avatar da Resistência',
        description: 'Maestria completa na endurance',
        pillar: 'endurance',
        level: 4,
        skillIndex: 2,
        requirements: { pillarLevel: 98, description: 'Domínio absoluto' },
        benefits: ['Energia ilimitada', '+150% resistência'],
        icon: 'EnduranceAvatar'
      },
      {
        id: 'endurance-4-3',
        name: 'Deus da Resistência',
        description: 'Perfeição absoluta na endurance',
        pillar: 'endurance',
        level: 4,
        skillIndex: 3,
        requirements: { pillarLevel: 99, description: 'Quase deus' },
        benefits: ['Poder divino', '+200% capacidade total'],
        icon: 'EnduranceGod'
      },
      {
        id: 'endurance-4-4',
        name: 'Ser Eterno',
        description: 'Energia infinita e imortal',
        pillar: 'endurance',
        level: 4,
        skillIndex: 4,
        requirements: { pillarLevel: 100, description: 'Nível máximo alcançado' },
        benefits: ['Imortalidade física', '+300% resistência e velocidade'],
        icon: 'EternalBeing'
      }
    ]
  ]
};