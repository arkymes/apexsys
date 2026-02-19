import { SkillDefinition, MovementPillar, LevelUpChallenge } from '@/types';

// Skills organizadas por pilar e nível (0-4)
// Cada nível tem 5 skills específicas

export const SKILL_DEFINITIONS: Record<MovementPillar, Record<number, SkillDefinition[]>> = {
  push: {
    // Nível 0: Iniciante Total - Movimentos muito básicos
    0: [
      {
        id: 'push-0-0',
        name: 'Wall Push-ups',
        description: 'Flexões na parede - base para força de empurrar',
        pillar: 'push',
        level: 0,
        skillIndex: 0,
        requirements: { pillarLevel: 0, description: 'Nível base' },
        benefits: ['+5% força push', 'Melhora técnica básica'],
        icon: 'WallPush'
      },
      {
        id: 'push-0-1',
        name: 'Knee Push-ups',
        description: 'Flexões de joelhos - primeiro passo real',
        pillar: 'push',
        level: 0,
        skillIndex: 1,
        requirements: { pillarLevel: 0, description: 'Nível base' },
        benefits: ['+10% força push', 'Coordenação básica'],
        icon: 'KneePush'
      },
      {
        id: 'push-0-2',
        name: 'Push-up Negatives',
        description: 'Descida controlada da flexão',
        pillar: 'push',
        level: 0,
        skillIndex: 2,
        requirements: { pillarLevel: 0, description: 'Nível base' },
        benefits: ['+8% força push', 'Controle excêntrico'],
        icon: 'NegativePush'
      },
      {
        id: 'push-0-3',
        name: 'Incline Push-ups',
        description: 'Flexões inclinadas em banco',
        pillar: 'push',
        level: 0,
        skillIndex: 3,
        requirements: { pillarLevel: 0, description: 'Nível base' },
        benefits: ['+12% força push', 'Adaptação gradual'],
        icon: 'InclinePush'
      },
      {
        id: 'push-0-4',
        name: 'Push-up Holds',
        description: 'Isometria na posição de flexão',
        pillar: 'push',
        level: 0,
        skillIndex: 4,
        requirements: { pillarLevel: 0, description: 'Nível base' },
        benefits: ['+6% força push', 'Estabilidade básica'],
        icon: 'HoldPush'
      }
    ],
    // Nível 1: Iniciante - Flexões completas
    1: [
      {
        id: 'push-1-0',
        name: 'Standard Push-ups',
        description: 'Flexões completas no chão',
        pillar: 'push',
        level: 1,
        skillIndex: 0,
        requirements: { pillarLevel: 1, description: '5 flexões completas' },
        benefits: ['+15% força push', 'Base sólida'],
        icon: 'StandardPush'
      },
      {
        id: 'push-1-1',
        name: 'Diamond Push-ups',
        description: 'Flexões com mãos juntas em diamante',
        pillar: 'push',
        level: 1,
        skillIndex: 1,
        requirements: { pillarLevel: 1, description: '10 flexões padrão' },
        benefits: ['+18% força push', 'Ênfase em tríceps'],
        icon: 'DiamondPush'
      },
      {
        id: 'push-1-2',
        name: 'Wide Push-ups',
        description: 'Flexões com mãos afastadas',
        pillar: 'push',
        level: 1,
        skillIndex: 2,
        requirements: { pillarLevel: 1, description: '8 flexões padrão' },
        benefits: ['+16% força push', 'Ênfase em peito'],
        icon: 'WidePush'
      },
      {
        id: 'push-1-3',
        name: 'Archer Push-ups',
        description: 'Flexões arqueiro (um braço dominante)',
        pillar: 'push',
        level: 1,
        skillIndex: 3,
        requirements: { pillarLevel: 1, description: '15 flexões padrão' },
        benefits: ['+20% força push', 'Desequilíbrio unilateral'],
        icon: 'ArcherPush'
      },
      {
        id: 'push-1-4',
        name: 'Explosive Push-ups',
        description: 'Flexões com explosão para cima',
        pillar: 'push',
        level: 1,
        skillIndex: 4,
        requirements: { pillarLevel: 1, description: '12 flexões padrão' },
        benefits: ['+14% força push', '+5% explosão'],
        icon: 'ExplosivePush'
      }
    ],
    // Nível 2: Intermediário - Progressões avançadas
    2: [
      {
        id: 'push-2-0',
        name: 'One-Arm Push-ups',
        description: 'Flexões com um braço',
        pillar: 'push',
        level: 2,
        skillIndex: 0,
        requirements: { pillarLevel: 2, description: '25 flexões padrão' },
        benefits: ['+25% força push', 'Força unilateral máxima'],
        icon: 'OneArmPush'
      },
      {
        id: 'push-2-1',
        name: 'Planche Leans',
        description: 'Inclinações para planche',
        pillar: 'push',
        level: 2,
        skillIndex: 1,
        requirements: { pillarLevel: 2, description: '20 flexões explosivas' },
        benefits: ['+22% força push', 'Base para planche'],
        icon: 'PlancheLean'
      },
      {
        id: 'push-2-2',
        name: 'Ring Push-ups',
        description: 'Flexões em argolas',
        pillar: 'push',
        level: 2,
        skillIndex: 2,
        requirements: { pillarLevel: 2, description: '30 flexões padrão' },
        benefits: ['+28% força push', 'Instabilidade controlada'],
        icon: 'RingPush'
      },
      {
        id: 'push-2-3',
        name: 'Weighted Push-ups',
        description: 'Flexões com peso adicional',
        pillar: 'push',
        level: 2,
        skillIndex: 3,
        requirements: { pillarLevel: 2, description: '35 flexões padrão' },
        benefits: ['+30% força push', 'Força máxima'],
        icon: 'WeightedPush'
      },
      {
        id: 'push-2-4',
        name: 'Pike Push-ups',
        description: 'Flexões em pike (para handstand)',
        pillar: 'push',
        level: 2,
        skillIndex: 4,
        requirements: { pillarLevel: 2, description: '25 flexões diamante' },
        benefits: ['+24% força push', 'Preparação para handstand'],
        icon: 'PikePush'
      }
    ],
    // Nível 3: Avançado - Movimentos elite
    3: [
      {
        id: 'push-3-0',
        name: 'Planche Push-ups',
        description: 'Flexões em posição de planche',
        pillar: 'push',
        level: 3,
        skillIndex: 0,
        requirements: { pillarLevel: 3, description: '10 planche leans' },
        benefits: ['+35% força push', 'Controle avançado'],
        icon: 'PlanchePush'
      },
      {
        id: 'push-3-1',
        name: 'Handstand Push-ups',
        description: 'Flexões de cabeça para baixo',
        pillar: 'push',
        level: 3,
        skillIndex: 1,
        requirements: { pillarLevel: 3, description: '20 pike push-ups' },
        benefits: ['+40% força push', 'Força invertida'],
        icon: 'HSPush'
      },
      {
        id: 'push-3-2',
        name: 'Ring HSPU',
        description: 'HSPU em argolas',
        pillar: 'push',
        level: 3,
        skillIndex: 2,
        requirements: { pillarLevel: 3, description: '15 HSPU strict' },
        benefits: ['+45% força push', 'Instabilidade extrema'],
        icon: 'RingHSPU'
      },
      {
        id: 'push-3-3',
        name: 'Maltese Push-ups',
        description: 'Flexões maltesas',
        pillar: 'push',
        level: 3,
        skillIndex: 3,
        requirements: { pillarLevel: 3, description: '25 planche push-ups' },
        benefits: ['+50% força push', 'Elite level'],
        icon: 'MaltesePush'
      },
      {
        id: 'push-3-4',
        name: 'One-Arm HSPU',
        description: 'HSPU com um braço',
        pillar: 'push',
        level: 3,
        skillIndex: 4,
        requirements: { pillarLevel: 3, description: '50 HSPU strict' },
        benefits: ['+60% força push', 'Pinnacle of strength'],
        icon: 'OneArmHSPU'
      }
    ],
    // Nível 4: Mestre - Movimentos lendários
    4: [
      {
        id: 'push-4-0',
        name: 'Full Planche',
        description: 'Planche completa suspensa',
        pillar: 'push',
        level: 4,
        skillIndex: 0,
        requirements: { pillarLevel: 4, description: '30s planche hold' },
        benefits: ['+70% força push', 'Mastery achieved'],
        icon: 'FullPlanche'
      },
      {
        id: 'push-4-1',
        name: 'One-Arm Planche',
        description: 'Planche com um braço',
        pillar: 'push',
        level: 4,
        skillIndex: 1,
        requirements: { pillarLevel: 4, description: '10s full planche' },
        benefits: ['+80% força push', 'Legendary strength'],
        icon: 'OneArmPlanche'
      },
      {
        id: 'push-4-2',
        name: 'Maltese',
        description: 'Maltese completa',
        pillar: 'push',
        level: 4,
        skillIndex: 2,
        requirements: { pillarLevel: 4, description: '20 maltese push-ups' },
        benefits: ['+75% força push', 'Cross mastery'],
        icon: 'Maltese'
      },
      {
        id: 'push-4-3',
        name: 'Inverted Cross',
        description: 'Cruz invertida',
        pillar: 'push',
        level: 4,
        skillIndex: 3,
        requirements: { pillarLevel: 4, description: '30s maltese' },
        benefits: ['+85% força push', 'Ultimate control'],
        icon: 'InvertedCross'
      },
      {
        id: 'push-4-4',
        name: 'One-Arm Maltese',
        description: 'Maltese com um braço',
        pillar: 'push',
        level: 4,
        skillIndex: 4,
        requirements: { pillarLevel: 4, description: '15s inverted cross' },
        benefits: ['+100% força push', 'Transcendent power'],
        icon: 'OneArmMaltese'
      }
    ]
  },

  pull: {
    // Nível 0: Iniciante Total
    0: [
      {
        id: 'pull-0-0',
        name: 'Dead Hang',
        description: 'Suspensão passiva na barra',
        pillar: 'pull',
        level: 0,
        skillIndex: 0,
        requirements: { pillarLevel: 0, description: 'Nível base' },
        benefits: ['+5% força pull', 'Prepara pegada'],
        icon: 'DeadHang'
      },
      {
        id: 'pull-0-1',
        name: 'Scapular Pulls',
        description: 'Retração escapular na barra',
        pillar: 'pull',
        level: 0,
        skillIndex: 1,
        requirements: { pillarLevel: 0, description: 'Nível base' },
        benefits: ['+6% força pull', 'Controle escapular'],
        icon: 'ScapularPull'
      },
      {
        id: 'pull-0-2',
        name: 'Negative Pull-ups',
        description: 'Descida controlada da barra',
        pillar: 'pull',
        level: 0,
        skillIndex: 2,
        requirements: { pillarLevel: 0, description: 'Nível base' },
        benefits: ['+8% força pull', 'Controle excêntrico'],
        icon: 'NegativePull'
      },
      {
        id: 'pull-0-3',
        name: 'Australian Pull-ups',
        description: 'Pull-ups australianos (barra baixa)',
        pillar: 'pull',
        level: 0,
        skillIndex: 3,
        requirements: { pillarLevel: 0, description: 'Nível base' },
        benefits: ['+10% força pull', 'Introdução ao movimento'],
        icon: 'AustralianPull'
      },
      {
        id: 'pull-0-4',
        name: 'Inverted Rows',
        description: 'Remadas invertidas na barra',
        pillar: 'pull',
        level: 0,
        skillIndex: 4,
        requirements: { pillarLevel: 0, description: 'Nível base' },
        benefits: ['+9% força pull', 'Base horizontal'],
        icon: 'InvertedRow'
      }
    ],
    // Nível 1: Iniciante
    1: [
      {
        id: 'pull-1-0',
        name: 'Strict Pull-ups',
        description: 'Pull-ups estritos completos',
        pillar: 'pull',
        level: 1,
        skillIndex: 0,
        requirements: { pillarLevel: 1, description: '5 pull-ups australianos' },
        benefits: ['+15% força pull', 'Força vertical básica'],
        icon: 'StrictPull'
      },
      {
        id: 'pull-1-1',
        name: 'L-Sit Pull-ups',
        description: 'Pull-ups com L-sit',
        pillar: 'pull',
        level: 1,
        skillIndex: 1,
        requirements: { pillarLevel: 1, description: '8 pull-ups strict' },
        benefits: ['+18% força pull', '+10% core stability'],
        icon: 'LSitPull'
      },
      {
        id: 'pull-1-2',
        name: 'Wide Pull-ups',
        description: 'Pull-ups com pegada larga',
        pillar: 'pull',
        level: 1,
        skillIndex: 2,
        requirements: { pillarLevel: 1, description: '6 pull-ups strict' },
        benefits: ['+16% força pull', 'Ênfase em dorsais'],
        icon: 'WidePull'
      },
      {
        id: 'pull-1-3',
        name: 'Commando Pull-ups',
        description: 'Pull-ups comando (pegada alternada)',
        pillar: 'pull',
        level: 1,
        skillIndex: 3,
        requirements: { pillarLevel: 1, description: '10 pull-ups strict' },
        benefits: ['+20% força pull', 'Coordenação'],
        icon: 'CommandoPull'
      },
      {
        id: 'pull-1-4',
        name: 'Archer Pull-ups',
        description: 'Pull-ups arqueiro',
        pillar: 'pull',
        level: 1,
        skillIndex: 4,
        requirements: { pillarLevel: 1, description: '12 pull-ups strict' },
        benefits: ['+22% força pull', 'Força unilateral'],
        icon: 'ArcherPull'
      }
    ],
    // Nível 2: Intermediário
    2: [
      {
        id: 'pull-2-0',
        name: 'One-Arm Pull-ups',
        description: 'Pull-ups com um braço',
        pillar: 'pull',
        level: 2,
        skillIndex: 0,
        requirements: { pillarLevel: 2, description: '20 pull-ups strict' },
        benefits: ['+30% força pull', 'Força máxima unilateral'],
        icon: 'OneArmPull'
      },
      {
        id: 'pull-2-1',
        name: 'Front Lever Raises',
        description: 'Elevações para front lever',
        pillar: 'pull',
        level: 2,
        skillIndex: 1,
        requirements: { pillarLevel: 2, description: '15 pull-ups strict' },
        benefits: ['+25% força pull', 'Base para front lever'],
        icon: 'FrontLeverRaise'
      },
      {
        id: 'pull-2-2',
        name: 'Ring Pull-ups',
        description: 'Pull-ups em argolas',
        pillar: 'pull',
        level: 2,
        skillIndex: 2,
        requirements: { pillarLevel: 2, description: '25 pull-ups strict' },
        benefits: ['+28% força pull', 'Instabilidade'],
        icon: 'RingPull'
      },
      {
        id: 'pull-2-3',
        name: 'Weighted Pull-ups',
        description: 'Pull-ups com peso',
        pillar: 'pull',
        level: 2,
        skillIndex: 3,
        requirements: { pillarLevel: 2, description: '30 pull-ups strict' },
        benefits: ['+35% força pull', 'Força máxima'],
        icon: 'WeightedPull'
      },
      {
        id: 'pull-2-4',
        name: 'Muscle-ups',
        description: 'Muscle-ups (pull-up + dip)',
        pillar: 'pull',
        level: 2,
        skillIndex: 4,
        requirements: { pillarLevel: 2, description: '15 pull-ups strict + dips' },
        benefits: ['+32% força pull', '+15% força push'],
        icon: 'MuscleUp'
      }
    ],
    // Nível 3: Avançado
    3: [
      {
        id: 'pull-3-0',
        name: 'Front Lever',
        description: 'Front lever suspenso',
        pillar: 'pull',
        level: 3,
        skillIndex: 0,
        requirements: { pillarLevel: 3, description: '20s front lever raise' },
        benefits: ['+40% força pull', 'Controle estático'],
        icon: 'FrontLever'
      },
      {
        id: 'pull-3-1',
        name: 'One-Arm Front Lever',
        description: 'Front lever com um braço',
        pillar: 'pull',
        level: 3,
        skillIndex: 1,
        requirements: { pillarLevel: 3, description: '10s front lever' },
        benefits: ['+50% força pull', 'Força unilateral extrema'],
        icon: 'OneArmFrontLever'
      },
      {
        id: 'pull-3-2',
        name: 'Ring Muscle-ups',
        description: 'Muscle-ups em argolas',
        pillar: 'pull',
        level: 3,
        skillIndex: 2,
        requirements: { pillarLevel: 3, description: '20 muscle-ups strict' },
        benefits: ['+45% força pull', 'Instabilidade avançada'],
        icon: 'RingMuscleUp'
      },
      {
        id: 'pull-3-3',
        name: 'Weighted Muscle-ups',
        description: 'Muscle-ups com peso',
        pillar: 'pull',
        level: 3,
        skillIndex: 3,
        requirements: { pillarLevel: 3, description: '25 muscle-ups strict' },
        benefits: ['+48% força pull', 'Força máxima composta'],
        icon: 'WeightedMuscleUp'
      },
      {
        id: 'pull-3-4',
        name: 'Hector',
        description: 'Hector (front lever + handstand)',
        pillar: 'pull',
        level: 3,
        skillIndex: 4,
        requirements: { pillarLevel: 3, description: '15s front lever + HSPU' },
        benefits: ['+55% força pull', 'Movimento lendário'],
        icon: 'Hector'
      }
    ],
    // Nível 4: Mestre
    4: [
      {
        id: 'pull-4-0',
        name: 'Full Front Lever',
        description: 'Front lever completo',
        pillar: 'pull',
        level: 4,
        skillIndex: 0,
        requirements: { pillarLevel: 4, description: '30s front lever' },
        benefits: ['+65% força pull', 'Mastery achieved'],
        icon: 'FullFrontLever'
      },
      {
        id: 'pull-4-1',
        name: 'One-Arm Full Front Lever',
        description: 'Front lever completo com um braço',
        pillar: 'pull',
        level: 4,
        skillIndex: 1,
        requirements: { pillarLevel: 4, description: '15s one-arm front lever' },
        benefits: ['+80% força pull', 'Legendary control'],
        icon: 'OneArmFullFrontLever'
      },
      {
        id: 'pull-4-2',
        name: 'Barani Ball',
        description: 'Barani ball (front lever dinâmico)',
        pillar: 'pull',
        level: 4,
        skillIndex: 2,
        requirements: { pillarLevel: 4, description: '20s full front lever' },
        benefits: ['+70% força pull', 'Dynamic mastery'],
        icon: 'BaraniBall'
      },
      {
        id: 'pull-4-3',
        name: 'Victorian Cross',
        description: 'Cruz vitoriana',
        pillar: 'pull',
        level: 4,
        skillIndex: 3,
        requirements: { pillarLevel: 4, description: '25s full front lever' },
        benefits: ['+75% força pull', 'Cross mastery'],
        icon: 'VictorianCross'
      },
      {
        id: 'pull-4-4',
        name: 'One-Arm Victorian',
        description: 'Cruz vitoriana com um braço',
        pillar: 'pull',
        level: 4,
        skillIndex: 4,
        requirements: { pillarLevel: 4, description: '30s victorian cross' },
        benefits: ['+100% força pull', 'Ultimate achievement'],
        icon: 'OneArmVictorian'
      }
    ]
  },

  core: {
    // Nível 0: Iniciante Total
    0: [
      {
        id: 'core-0-0',
        name: 'Knee Plank',
        description: 'Prancha de joelhos',
        pillar: 'core',
        level: 0,
        skillIndex: 0,
        requirements: { pillarLevel: 0, description: 'Nível base' },
        benefits: ['+5% força core', 'Base de estabilidade'],
        icon: 'KneePlank'
      },
      {
        id: 'core-0-1',
        name: 'Dead Bug',
        description: 'Dead bug básico',
        pillar: 'core',
        level: 0,
        skillIndex: 1,
        requirements: { pillarLevel: 0, description: 'Nível base' },
        benefits: ['+6% força core', 'Coordenação básica'],
        icon: 'DeadBug'
      },
      {
        id: 'core-0-2',
        name: 'Bird Dog',
        description: 'Bird dog (um lado por vez)',
        pillar: 'core',
        level: 0,
        skillIndex: 2,
        requirements: { pillarLevel: 0, description: 'Nível base' },
        benefits: ['+7% força core', 'Estabilidade unilateral'],
        icon: 'BirdDog'
      },
      {
        id: 'core-0-3',
        name: 'Seated Russian Twists',
        description: 'Russos sentados',
        pillar: 'core',
        level: 0,
        skillIndex: 3,
        requirements: { pillarLevel: 0, description: 'Nível base' },
        benefits: ['+8% força core', 'Rotação controlada'],
        icon: 'RussianTwist'
      },
      {
        id: 'core-0-4',
        name: 'Leg Raises',
        description: 'Elevações de pernas deitado',
        pillar: 'core',
        level: 0,
        skillIndex: 4,
        requirements: { pillarLevel: 0, description: 'Nível base' },
        benefits: ['+9% força core', 'Força inferior'],
        icon: 'LegRaise'
      }
    ],
    // Nível 1: Iniciante
    1: [
      {
        id: 'core-1-0',
        name: 'Standard Plank',
        description: 'Prancha completa',
        pillar: 'core',
        level: 1,
        skillIndex: 0,
        requirements: { pillarLevel: 1, description: '30s knee plank' },
        benefits: ['+15% força core', 'Estabilidade básica'],
        icon: 'StandardPlank'
      },
      {
        id: 'core-1-1',
        name: 'Side Plank',
        description: 'Prancha lateral',
        pillar: 'core',
        level: 1,
        skillIndex: 1,
        requirements: { pillarLevel: 1, description: '20s standard plank' },
        benefits: ['+16% força core', 'Estabilidade lateral'],
        icon: 'SidePlank'
      },
      {
        id: 'core-1-2',
        name: 'Mountain Climbers',
        description: 'Mountain climbers',
        pillar: 'core',
        level: 1,
        skillIndex: 2,
        requirements: { pillarLevel: 1, description: '25s standard plank' },
        benefits: ['+14% força core', '+5% endurance'],
        icon: 'MountainClimber'
      },
      {
        id: 'core-1-3',
        name: 'Hollow Body Hold',
        description: 'Hollow body hold',
        pillar: 'core',
        level: 1,
        skillIndex: 3,
        requirements: { pillarLevel: 1, description: '15s standard plank' },
        benefits: ['+18% força core', 'Controle corporal'],
        icon: 'HollowBody'
      },
      {
        id: 'core-1-4',
        name: 'L-Sit',
        description: 'L-sit básico',
        pillar: 'core',
        level: 1,
        skillIndex: 4,
        requirements: { pillarLevel: 1, description: '10s hollow body' },
        benefits: ['+20% força core', 'Força isométrica'],
        icon: 'LSit'
      }
    ],
    // Nível 2: Intermediário
    2: [
      {
        id: 'core-2-0',
        name: 'Dragon Flag',
        description: 'Dragon flag negativo',
        pillar: 'core',
        level: 2,
        skillIndex: 0,
        requirements: { pillarLevel: 2, description: '45s standard plank' },
        benefits: ['+25% força core', 'Controle avançado'],
        icon: 'DragonFlag'
      },
      {
        id: 'core-2-1',
        name: 'V-Ups',
        description: 'V-ups',
        pillar: 'core',
        level: 2,
        skillIndex: 1,
        requirements: { pillarLevel: 2, description: '20 leg raises' },
        benefits: ['+22% força core', 'Dinâmico avançado'],
        icon: 'VUp'
      },
      {
        id: 'core-2-2',
        name: 'Windshield Wipers',
        description: 'Limpadores de para-brisa',
        pillar: 'core',
        level: 2,
        skillIndex: 2,
        requirements: { pillarLevel: 2, description: '30s side plank' },
        benefits: ['+24% força core', 'Rotação extrema'],
        icon: 'WindshieldWiper'
      },
      {
        id: 'core-2-3',
        name: 'Full L-Sit',
        description: 'L-sit completo',
        pillar: 'core',
        level: 2,
        skillIndex: 3,
        requirements: { pillarLevel: 2, description: '20s L-sit básico' },
        benefits: ['+28% força core', 'Força máxima isométrica'],
        icon: 'FullLSit'
      },
      {
        id: 'core-2-4',
        name: 'Human Flag Prep',
        description: 'Preparação para human flag',
        pillar: 'core',
        level: 2,
        skillIndex: 4,
        requirements: { pillarLevel: 2, description: '40s standard plank' },
        benefits: ['+26% força core', 'Base para flag'],
        icon: 'HumanFlagPrep'
      }
    ],
    // Nível 3: Avançado
    3: [
      {
        id: 'core-3-0',
        name: 'Full Dragon Flag',
        description: 'Dragon flag completo',
        pillar: 'core',
        level: 3,
        skillIndex: 0,
        requirements: { pillarLevel: 3, description: '10 dragon flag negatives' },
        benefits: ['+35% força core', 'Controle lendário'],
        icon: 'FullDragonFlag'
      },
      {
        id: 'core-3-1',
        name: 'Human Flag',
        description: 'Human flag',
        pillar: 'core',
        level: 3,
        skillIndex: 1,
        requirements: { pillarLevel: 3, description: '20s human flag prep' },
        benefits: ['+40% força core', 'Ultimate lateral control'],
        icon: 'HumanFlag'
      },
      {
        id: 'core-3-2',
        name: 'Manna',
        description: 'Manna (V-sit avançado)',
        pillar: 'core',
        level: 3,
        skillIndex: 2,
        requirements: { pillarLevel: 3, description: '25 V-ups' },
        benefits: ['+38% força core', 'Flexibilidade + força'],
        icon: 'Manna'
      },
      {
        id: 'core-3-3',
        name: 'Inverted Cross Core',
        description: 'Cruz invertida (core)',
        pillar: 'core',
        level: 3,
        skillIndex: 3,
        requirements: { pillarLevel: 3, description: '30s full L-sit' },
        benefits: ['+42% força core', 'Cross training mastery'],
        icon: 'InvertedCrossCore'
      },
      {
        id: 'core-3-4',
        name: 'Straddle Planche',
        description: 'Planche aberta (core focus)',
        pillar: 'core',
        level: 3,
        skillIndex: 4,
        requirements: { pillarLevel: 3, description: '20s human flag' },
        benefits: ['+45% força core', 'Flexibilidade extrema'],
        icon: 'StraddlePlanche'
      }
    ],
    // Nível 4: Mestre
    4: [
      {
        id: 'core-4-0',
        name: 'Full Manna',
        description: 'Manna completa',
        pillar: 'core',
        level: 4,
        skillIndex: 0,
        requirements: { pillarLevel: 4, description: '30s manna' },
        benefits: ['+55% força core', 'Mastery achieved'],
        icon: 'FullManna'
      },
      {
        id: 'core-4-1',
        name: 'One-Arm Human Flag',
        description: 'Human flag com um braço',
        pillar: 'core',
        level: 4,
        skillIndex: 1,
        requirements: { pillarLevel: 4, description: '15s human flag' },
        benefits: ['+65% força core', 'Legendary control'],
        icon: 'OneArmHumanFlag'
      },
      {
        id: 'core-4-2',
        name: 'Triple Clap Dragon Flag',
        description: 'Dragon flag com batidas triplas',
        pillar: 'core',
        level: 4,
        skillIndex: 2,
        requirements: { pillarLevel: 4, description: '20 full dragon flags' },
        benefits: ['+60% força core', 'Dynamic mastery'],
        icon: 'TripleClapDragon'
      },
      {
        id: 'core-4-3',
        name: 'Victorian Cross Core',
        description: 'Cruz vitoriana (core)',
        pillar: 'core',
        level: 4,
        skillIndex: 3,
        requirements: { pillarLevel: 4, description: '25s inverted cross' },
        benefits: ['+70% força core', 'Ultimate cross mastery'],
        icon: 'VictorianCrossCore'
      },
      {
        id: 'core-4-4',
        name: 'One-Arm Manna',
        description: 'Manna com um braço',
        pillar: 'core',
        level: 4,
        skillIndex: 4,
        requirements: { pillarLevel: 4, description: '20s full manna' },
        benefits: ['+80% força core', 'Transcendent control'],
        icon: 'OneArmManna'
      }
    ]
  },

  legs: {
    // Nível 0: Iniciante Total
    0: [
      {
        id: 'legs-0-0',
        name: 'Air Squats',
        description: 'Agachamentos no ar',
        pillar: 'legs',
        level: 0,
        skillIndex: 0,
        requirements: { pillarLevel: 0, description: 'Nível base' },
        benefits: ['+5% força legs', 'Mobilidade básica'],
        icon: 'AirSquat'
      },
      {
        id: 'legs-0-1',
        name: 'Assisted Squats',
        description: 'Agachamentos assistidos',
        pillar: 'legs',
        level: 0,
        skillIndex: 1,
        requirements: { pillarLevel: 0, description: 'Nível base' },
        benefits: ['+6% força legs', 'Introdução gradual'],
        icon: 'AssistedSquat'
      },
      {
        id: 'legs-0-2',
        name: 'Wall Sit',
        description: 'Parede sentada',
        pillar: 'legs',
        level: 0,
        skillIndex: 2,
        requirements: { pillarLevel: 0, description: 'Nível base' },
        benefits: ['+7% força legs', 'Isometria básica'],
        icon: 'WallSit'
      },
      {
        id: 'legs-0-3',
        name: 'Lunges',
        description: 'Afundos básicos',
        pillar: 'legs',
        level: 0,
        skillIndex: 3,
        requirements: { pillarLevel: 0, description: 'Nível base' },
        benefits: ['+8% força legs', 'Equilíbrio unilateral'],
        icon: 'Lunge'
      },
      {
        id: 'legs-0-4',
        name: 'Calf Raises',
        description: 'Elevações de panturrilha',
        pillar: 'legs',
        level: 0,
        skillIndex: 4,
        requirements: { pillarLevel: 0, description: 'Nível base' },
        benefits: ['+6% força legs', 'Força de panturrilha'],
        icon: 'CalfRaise'
      }
    ],
    // Nível 1: Iniciante
    1: [
      {
        id: 'legs-1-0',
        name: 'Bodyweight Squats',
        description: 'Agachamentos completos',
        pillar: 'legs',
        level: 1,
        skillIndex: 0,
        requirements: { pillarLevel: 1, description: '20 air squats' },
        benefits: ['+15% força legs', 'Força básica'],
        icon: 'BodyweightSquat'
      },
      {
        id: 'legs-1-1',
        name: 'Jump Squats',
        description: 'Agachamentos com salto',
        pillar: 'legs',
        level: 1,
        skillIndex: 1,
        requirements: { pillarLevel: 1, description: '15 bodyweight squats' },
        benefits: ['+16% força legs', '+8% explosão'],
        icon: 'JumpSquat'
      },
      {
        id: 'legs-1-2',
        name: 'Bulgarian Split Squats',
        description: 'Afundos búlgaros',
        pillar: 'legs',
        level: 1,
        skillIndex: 2,
        requirements: { pillarLevel: 1, description: '10 lunges por perna' },
        benefits: ['+18% força legs', 'Equilíbrio avançado'],
        icon: 'BulgarianSplit'
      },
      {
        id: 'legs-1-3',
        name: 'Pistol Squat Prep',
        description: 'Preparação para pistol squat',
        pillar: 'legs',
        level: 1,
        skillIndex: 3,
        requirements: { pillarLevel: 1, description: '25 bodyweight squats' },
        benefits: ['+20% força legs', 'Mobilidade unilateral'],
        icon: 'PistolPrep'
      },
      {
        id: 'legs-1-4',
        name: 'Box Jumps',
        description: 'Saltos na caixa',
        pillar: 'legs',
        level: 1,
        skillIndex: 4,
        requirements: { pillarLevel: 1, description: '20 jump squats' },
        benefits: ['+17% força legs', '+12% explosão'],
        icon: 'BoxJump'
      }
    ],
    // Nível 2: Intermediário
    2: [
      {
        id: 'legs-2-0',
        name: 'Pistol Squats',
        description: 'Pistol squats completos',
        pillar: 'legs',
        level: 2,
        skillIndex: 0,
        requirements: { pillarLevel: 2, description: '5 pistol prep por perna' },
        benefits: ['+25% força legs', 'Força unilateral máxima'],
        icon: 'PistolSquat'
      },
      {
        id: 'legs-2-1',
        name: 'Shrimp Squats',
        description: 'Shrimp squats',
        pillar: 'legs',
        level: 2,
        skillIndex: 1,
        requirements: { pillarLevel: 2, description: '10 pistol squats' },
        benefits: ['+28% força legs', 'Mobilidade extrema'],
        icon: 'ShrimpSquat'
      },
      {
        id: 'legs-2-2',
        name: 'Weighted Squats',
        description: 'Agachamentos com peso',
        pillar: 'legs',
        level: 2,
        skillIndex: 2,
        requirements: { pillarLevel: 2, description: '40 bodyweight squats' },
        benefits: ['+30% força legs', 'Força máxima'],
        icon: 'WeightedSquat'
      },
      {
        id: 'legs-2-3',
        name: 'Depth Jumps',
        description: 'Saltos de profundidade',
        pillar: 'legs',
        level: 2,
        skillIndex: 3,
        requirements: { pillarLevel: 2, description: '30 box jumps' },
        benefits: ['+26% força legs', '+15% explosão'],
        icon: 'DepthJump'
      },
      {
        id: 'legs-2-4',
        name: 'Nordic Hamstring Curls',
        description: 'Curls nórdicos de isquiotibiais',
        pillar: 'legs',
        level: 2,
        skillIndex: 4,
        requirements: { pillarLevel: 2, description: '35 bodyweight squats' },
        benefits: ['+24% força legs', 'Controle excêntrico'],
        icon: 'NordicCurl'
      }
    ],
    // Nível 3: Avançado
    3: [
      {
        id: 'legs-3-0',
        name: 'One-Legged Pistol',
        description: 'Pistol com uma perna (avançado)',
        pillar: 'legs',
        level: 3,
        skillIndex: 0,
        requirements: { pillarLevel: 3, description: '20 pistol squats' },
        benefits: ['+35% força legs', 'Elite unilateral'],
        icon: 'OneLegPistol'
      },
      {
        id: 'legs-3-1',
        name: 'Weighted Pistols',
        description: 'Pistols com peso',
        pillar: 'legs',
        level: 3,
        skillIndex: 1,
        requirements: { pillarLevel: 3, description: '15 pistol squats' },
        benefits: ['+40% força legs', 'Força máxima unilateral'],
        icon: 'WeightedPistol'
      },
      {
        id: 'legs-3-2',
        name: 'Dragon Pistol Squats',
        description: 'Dragon pistol squats',
        pillar: 'legs',
        level: 3,
        skillIndex: 2,
        requirements: { pillarLevel: 3, description: '25 shrimp squats' },
        benefits: ['+38% força legs', 'Ultimate mobility'],
        icon: 'DragonPistol'
      },
      {
        id: 'legs-3-3',
        name: 'Standing Triple Jump',
        description: 'Triplo salto parado',
        pillar: 'legs',
        level: 3,
        skillIndex: 3,
        requirements: { pillarLevel: 3, description: '50 depth jumps' },
        benefits: ['+36% força legs', '+20% explosão'],
        icon: 'TripleJump'
      },
      {
        id: 'legs-3-4',
        name: 'Human Flag Legs',
        description: 'Human flag (legs focus)',
        pillar: 'legs',
        level: 3,
        skillIndex: 4,
        requirements: { pillarLevel: 3, description: '30 weighted squats' },
        benefits: ['+42% força legs', 'Cross training mastery'],
        icon: 'HumanFlagLegs'
      }
    ],
    // Nível 4: Mestre
    4: [
      {
        id: 'legs-4-0',
        name: 'One-Arm Shrimp Squat',
        description: 'Shrimp squat com um braço',
        pillar: 'legs',
        level: 4,
        skillIndex: 0,
        requirements: { pillarLevel: 4, description: '30 dragon pistols' },
        benefits: ['+55% força legs', 'Mastery achieved'],
        icon: 'OneArmShrimp'
      },
      {
        id: 'legs-4-1',
        name: 'Standing Quintuple Jump',
        description: 'Quíntuplo salto parado',
        pillar: 'legs',
        level: 4,
        skillIndex: 1,
        requirements: { pillarLevel: 4, description: '20 triple jumps' },
        benefits: ['+65% força legs', 'Legendary explosion'],
        icon: 'QuintupleJump'
      },
      {
        id: 'legs-4-2',
        name: 'One-Legged Weighted Pistol',
        description: 'Pistol com peso e uma perna',
        pillar: 'legs',
        level: 4,
        skillIndex: 2,
        requirements: { pillarLevel: 4, description: '25 weighted pistols' },
        benefits: ['+60% força legs', 'Ultimate strength'],
        icon: 'OneLegWeightedPistol'
      },
      {
        id: 'legs-4-3',
        name: 'Victorian Cross Legs',
        description: 'Cruz vitoriana (legs)',
        pillar: 'legs',
        level: 4,
        skillIndex: 3,
        requirements: { pillarLevel: 4, description: '20s human flag legs' },
        benefits: ['+70% força legs', 'Cross mastery'],
        icon: 'VictorianCrossLegs'
      },
      {
        id: 'legs-4-4',
        name: 'One-Arm Dragon Pistol',
        description: 'Dragon pistol com um braço',
        pillar: 'legs',
        level: 4,
        skillIndex: 4,
        requirements: { pillarLevel: 4, description: '15 one-arm shrimp' },
        benefits: ['+80% força legs', 'Transcendent power'],
        icon: 'OneArmDragonPistol'
      }
    ]
  },

  mobility: {
    // Nível 0: Iniciante Total
    0: [
      {
        id: 'mobility-0-0',
        name: 'Joint Circles',
        description: 'Círculos articulares básicos',
        pillar: 'mobility',
        level: 0,
        skillIndex: 0,
        requirements: { pillarLevel: 0, description: 'Nível base' },
        benefits: ['+5% mobility', 'Mobilidade básica'],
        icon: 'JointCircle'
      },
      {
        id: 'mobility-0-1',
        name: 'Cat-Cow Stretch',
        description: 'Alongamento gato-vaca',
        pillar: 'mobility',
        level: 0,
        skillIndex: 1,
        requirements: { pillarLevel: 0, description: 'Nível base' },
        benefits: ['+6% mobility', 'Flexibilidade coluna'],
        icon: 'CatCow'
      },
      {
        id: 'mobility-0-2',
        name: 'Shoulder Rolls',
        description: 'Rolos de ombro',
        pillar: 'mobility',
        level: 0,
        skillIndex: 2,
        requirements: { pillarLevel: 0, description: 'Nível base' },
        benefits: ['+7% mobility', 'Mobilidade ombro'],
        icon: 'ShoulderRoll'
      },
      {
        id: 'mobility-0-3',
        name: 'Hip Circles',
        description: 'Círculos de quadril',
        pillar: 'mobility',
        level: 0,
        skillIndex: 3,
        requirements: { pillarLevel: 0, description: 'Nível base' },
        benefits: ['+6% mobility', 'Mobilidade quadril'],
        icon: 'HipCircle'
      },
      {
        id: 'mobility-0-4',
        name: 'Neck Rolls',
        description: 'Rolos de pescoço',
        pillar: 'mobility',
        level: 0,
        skillIndex: 4,
        requirements: { pillarLevel: 0, description: 'Nível base' },
        benefits: ['+5% mobility', 'Mobilidade cervical'],
        icon: 'NeckRoll'
      }
    ],
    // Nível 1: Iniciante
    1: [
      {
        id: 'mobility-1-0',
        name: 'Deep Squat Hold',
        description: 'Agachamento profundo estático',
        pillar: 'mobility',
        level: 1,
        skillIndex: 0,
        requirements: { pillarLevel: 1, description: '30s joint circles' },
        benefits: ['+15% mobility', 'Mobilidade tornozelo/quadril'],
        icon: 'DeepSquat'
      },
      {
        id: 'mobility-1-1',
        name: 'Bridge Pose',
        description: 'Postura da ponte',
        pillar: 'mobility',
        level: 1,
        skillIndex: 1,
        requirements: { pillarLevel: 1, description: '20s cat-cow' },
        benefits: ['+16% mobility', 'Extensão anterior'],
        icon: 'BridgePose'
      },
      {
        id: 'mobility-1-2',
        name: 'Pigeon Pose',
        description: 'Postura do pombo',
        pillar: 'mobility',
        level: 1,
        skillIndex: 2,
        requirements: { pillarLevel: 1, description: '25s hip circles' },
        benefits: ['+18% mobility', 'Mobilidade quadril'],
        icon: 'PigeonPose'
      },
      {
        id: 'mobility-1-3',
        name: 'Thread the Needle',
        description: 'Enfiar a agulha',
        pillar: 'mobility',
        level: 1,
        skillIndex: 3,
        requirements: { pillarLevel: 1, description: '30s shoulder rolls' },
        benefits: ['+17% mobility', 'Mobilidade ombro posterior'],
        icon: 'ThreadNeedle'
      },
      {
        id: 'mobility-1-4',
        name: 'Cobra Pose',
        description: 'Postura da cobra',
        pillar: 'mobility',
        level: 1,
        skillIndex: 4,
        requirements: { pillarLevel: 1, description: '20s neck rolls' },
        benefits: ['+14% mobility', 'Extensão cervical'],
        icon: 'CobraPose'
      }
    ],
    // Nível 2: Intermediário
    2: [
      {
        id: 'mobility-2-0',
        name: 'Full Bridge',
        description: 'Ponte completa',
        pillar: 'mobility',
        level: 2,
        skillIndex: 0,
        requirements: { pillarLevel: 2, description: '45s bridge pose' },
        benefits: ['+25% mobility', 'Extensão máxima'],
        icon: 'FullBridge'
      },
      {
        id: 'mobility-2-1',
        name: 'Middle Split',
        description: 'Meio splits',
        pillar: 'mobility',
        level: 2,
        skillIndex: 1,
        requirements: { pillarLevel: 2, description: '60s pigeon pose' },
        benefits: ['+28% mobility', 'Flexibilidade adutora'],
        icon: 'MiddleSplit'
      },
      {
        id: 'mobility-2-2',
        name: 'Forearm Stand',
        description: 'Equilíbrio nos antebraços',
        pillar: 'mobility',
        level: 2,
        skillIndex: 2,
        requirements: { pillarLevel: 2, description: '30s deep squat' },
        benefits: ['+26% mobility', 'Controle invertido'],
        icon: 'ForearmStand'
      },
      {
        id: 'mobility-2-3',
        name: 'Straddle Forward Fold',
        description: 'Dobra para frente aberta',
        pillar: 'mobility',
        level: 2,
        skillIndex: 3,
        requirements: { pillarLevel: 2, description: '45s cobra pose' },
        benefits: ['+24% mobility', 'Flexibilidade posterior'],
        icon: 'StraddleFold'
      },
      {
        id: 'mobility-2-4',
        name: 'Wheel Pose',
        description: 'Postura da roda',
        pillar: 'mobility',
        level: 2,
        skillIndex: 4,
        requirements: { pillarLevel: 2, description: '40s thread the needle' },
        benefits: ['+27% mobility', 'Extensão completa'],
        icon: 'WheelPose'
      }
    ],
    // Nível 3: Avançado
    3: [
      {
        id: 'mobility-3-0',
        name: 'One-Arm Bridge',
        description: 'Ponte com um braço',
        pillar: 'mobility',
        level: 3,
        skillIndex: 0,
        requirements: { pillarLevel: 3, description: '20s full bridge' },
        benefits: ['+35% mobility', 'Controle unilateral'],
        icon: 'OneArmBridge'
      },
      {
        id: 'mobility-3-1',
        name: 'Full Middle Split',
        description: 'Meio splits completo',
        pillar: 'mobility',
        level: 3,
        skillIndex: 1,
        requirements: { pillarLevel: 3, description: '90s middle split' },
        benefits: ['+40% mobility', 'Flexibilidade extrema'],
        icon: 'FullMiddleSplit'
      },
      {
        id: 'mobility-3-2',
        name: 'Handstand',
        description: 'Equilíbrio de mão',
        pillar: 'mobility',
        level: 3,
        skillIndex: 2,
        requirements: { pillarLevel: 3, description: '30s forearm stand' },
        benefits: ['+38% mobility', 'Controle invertido avançado'],
        icon: 'Handstand'
      },
      {
        id: 'mobility-3-3',
        name: 'Full Front Bend',
        description: 'Dobra frontal completa',
        pillar: 'mobility',
        level: 3,
        skillIndex: 3,
        requirements: { pillarLevel: 3, description: '60s straddle fold' },
        benefits: ['+36% mobility', 'Flexibilidade máxima'],
        icon: 'FullFrontBend'
      },
      {
        id: 'mobility-3-4',
        name: 'Drop Back',
        description: 'Queda para trás (para wheel)',
        pillar: 'mobility',
        level: 3,
        skillIndex: 4,
        requirements: { pillarLevel: 3, description: '50s wheel pose' },
        benefits: ['+42% mobility', 'Transição dinâmica'],
        icon: 'DropBack'
      }
    ],
    // Nível 4: Mestre
    4: [
      {
        id: 'mobility-4-0',
        name: 'One-Arm Handstand',
        description: 'Handstand com um braço',
        pillar: 'mobility',
        level: 4,
        skillIndex: 0,
        requirements: { pillarLevel: 4, description: '30s handstand' },
        benefits: ['+55% mobility', 'Mastery achieved'],
        icon: 'OneArmHandstand'
      },
      {
        id: 'mobility-4-1',
        name: 'Full Splits',
        description: 'Splits completos',
        pillar: 'mobility',
        level: 4,
        skillIndex: 1,
        requirements: { pillarLevel: 4, description: '120s full middle split' },
        benefits: ['+65% mobility', 'Legendary flexibility'],
        icon: 'FullSplits'
      },
      {
        id: 'mobility-4-2',
        name: 'Press to Handstand',
        description: 'Press para handstand',
        pillar: 'mobility',
        level: 4,
        skillIndex: 2,
        requirements: { pillarLevel: 4, description: '20s one-arm bridge' },
        benefits: ['+60% mobility', 'Dynamic mastery'],
        icon: 'PressHandstand'
      },
      {
        id: 'mobility-4-3',
        name: 'Contortion Backbend',
        description: 'Contorção para trás',
        pillar: 'mobility',
        level: 4,
        skillIndex: 3,
        requirements: { pillarLevel: 4, description: '70s full front bend' },
        benefits: ['+70% mobility', 'Ultimate flexibility'],
        icon: 'ContortionBackbend'
      },
      {
        id: 'mobility-4-4',
        name: 'One-Arm Wheel',
        description: 'Wheel com um braço',
        pillar: 'mobility',
        level: 4,
        skillIndex: 4,
        requirements: { pillarLevel: 4, description: '60s drop back' },
        benefits: ['+75% mobility', 'Transcendent control'],
        icon: 'OneArmWheel'
      }
    ]
  },

  endurance: {
    // Nível 0: Iniciante Total
    0: [
      {
        id: 'endurance-0-0',
        name: 'Brisk Walking',
        description: 'Caminhada rápida',
        pillar: 'endurance',
        level: 0,
        skillIndex: 0,
        requirements: { pillarLevel: 0, description: 'Nível base' },
        benefits: ['+5% endurance', 'Base cardiovascular'],
        icon: 'BriskWalk'
      },
      {
        id: 'endurance-0-1',
        name: 'Light Jogging',
        description: 'Corrida leve',
        pillar: 'endurance',
        level: 0,
        skillIndex: 1,
        requirements: { pillarLevel: 0, description: 'Nível base' },
        benefits: ['+6% endurance', 'Introdução à corrida'],
        icon: 'LightJog'
      },
      {
        id: 'endurance-0-2',
        name: 'Marching in Place',
        description: 'Marcha no lugar',
        pillar: 'endurance',
        level: 0,
        skillIndex: 2,
        requirements: { pillarLevel: 0, description: 'Nível base' },
        benefits: ['+4% endurance', 'Ativação cardiovascular'],
        icon: 'Marching'
      },
      {
        id: 'endurance-0-3',
        name: 'Step-Ups',
        description: 'Subidas em degrau',
        pillar: 'endurance',
        level: 0,
        skillIndex: 3,
        requirements: { pillarLevel: 0, description: 'Nível base' },
        benefits: ['+7% endurance', 'Força + cardio'],
        icon: 'StepUp'
      },
      {
        id: 'endurance-0-4',
        name: 'Burpees Prep',
        description: 'Preparação para burpees',
        pillar: 'endurance',
        level: 0,
        skillIndex: 4,
        requirements: { pillarLevel: 0, description: 'Nível base' },
        benefits: ['+8% endurance', 'Movimento composto básico'],
        icon: 'BurpeePrep'
      }
    ],
    // Nível 1: Iniciante
    1: [
      {
        id: 'endurance-1-0',
        name: 'Steady State Run',
        description: 'Corrida em estado estacionário',
        pillar: 'endurance',
        level: 1,
        skillIndex: 0,
        requirements: { pillarLevel: 1, description: '10min light jogging' },
        benefits: ['+15% endurance', 'Base aeróbica'],
        icon: 'SteadyRun'
      },
      {
        id: 'endurance-1-1',
        name: 'Burpees',
        description: 'Burpees completos',
        pillar: 'endurance',
        level: 1,
        skillIndex: 1,
        requirements: { pillarLevel: 1, description: '5 burpee prep' },
        benefits: ['+16% endurance', '+5% força total'],
        icon: 'Burpee'
      },
      {
        id: 'endurance-1-2',
        name: 'Mountain Climber Run',
        description: 'Mountain climbers em corrida',
        pillar: 'endurance',
        level: 1,
        skillIndex: 2,
        requirements: { pillarLevel: 1, description: '20 burpees' },
        benefits: ['+14% endurance', '+6% core'],
        icon: 'MountainRun'
      },
      {
        id: 'endurance-1-3',
        name: 'Sprint Intervals',
        description: 'Intervalos de sprint',
        pillar: 'endurance',
        level: 1,
        skillIndex: 3,
        requirements: { pillarLevel: 1, description: '15min steady run' },
        benefits: ['+18% endurance', '+10% explosão'],
        icon: 'SprintInterval'
      },
      {
        id: 'endurance-1-4',
        name: 'Circuit Training',
        description: 'Circuito básico',
        pillar: 'endurance',
        level: 1,
        skillIndex: 4,
        requirements: { pillarLevel: 1, description: '25 burpees' },
        benefits: ['+17% endurance', 'Resistência muscular'],
        icon: 'Circuit'
      }
    ],
    // Nível 2: Intermediário
    2: [
      {
        id: 'endurance-2-0',
        name: 'Tempo Run',
        description: 'Corrida em ritmo controlado',
        pillar: 'endurance',
        level: 2,
        skillIndex: 0,
        requirements: { pillarLevel: 2, description: '30min steady run' },
        benefits: ['+25% endurance', 'Controle de ritmo'],
        icon: 'TempoRun'
      },
      {
        id: 'endurance-2-1',
        name: 'Burpee Box Jumps',
        description: 'Burpees com saltos na caixa',
        pillar: 'endurance',
        level: 2,
        skillIndex: 1,
        requirements: { pillarLevel: 2, description: '40 burpees' },
        benefits: ['+26% endurance', '+8% explosão'],
        icon: 'BurpeeBox'
      },
      {
        id: 'endurance-2-2',
        name: 'Hill Sprints',
        description: 'Sprints na subida',
        pillar: 'endurance',
        level: 2,
        skillIndex: 2,
        requirements: { pillarLevel: 2, description: '20 sprint intervals' },
        benefits: ['+28% endurance', '+12% força pernas'],
        icon: 'HillSprint'
      },
      {
        id: 'endurance-2-3',
        name: 'AMRAP Circuits',
        description: 'Circuitos AMRAP',
        pillar: 'endurance',
        level: 2,
        skillIndex: 3,
        requirements: { pillarLevel: 2, description: '45min circuit training' },
        benefits: ['+24% endurance', 'Mental toughness'],
        icon: 'AMRAP'
      },
      {
        id: 'endurance-2-4',
        name: 'Long Distance Run',
        description: 'Corrida de longa distância',
        pillar: 'endurance',
        level: 2,
        skillIndex: 4,
        requirements: { pillarLevel: 2, description: '45min tempo run' },
        benefits: ['+27% endurance', 'Base aeróbica avançada'],
        icon: 'LongRun'
      }
    ],
    // Nível 3: Avançado
    3: [
      {
        id: 'endurance-3-0',
        name: 'Ultramarathon Prep',
        description: 'Preparação para ultramaratona',
        pillar: 'endurance',
        level: 3,
        skillIndex: 0,
        requirements: { pillarLevel: 3, description: '2h long distance run' },
        benefits: ['+35% endurance', 'Elite aerobic capacity'],
        icon: 'UltraPrep'
      },
      {
        id: 'endurance-3-1',
        name: 'Death by Burpees',
        description: 'Burpees progressivos',
        pillar: 'endurance',
        level: 3,
        skillIndex: 1,
        requirements: { pillarLevel: 3, description: '100 burpee box jumps' },
        benefits: ['+38% endurance', 'Mental + physical dominance'],
        icon: 'DeathBurpee'
      },
      {
        id: 'endurance-3-2',
        name: 'Max Effort Sprints',
        description: 'Sprints em esforço máximo',
        pillar: 'endurance',
        level: 3,
        skillIndex: 2,
        requirements: { pillarLevel: 3, description: '50 hill sprints' },
        benefits: ['+36% endurance', '+15% explosão máxima'],
        icon: 'MaxSprint'
      },
      {
        id: 'endurance-3-3',
        name: 'Ironman Training',
        description: 'Treino estilo Ironman',
        pillar: 'endurance',
        level: 3,
        skillIndex: 3,
        requirements: { pillarLevel: 3, description: '3h AMRAP circuits' },
        benefits: ['+40% endurance', 'Triathlon mastery'],
        icon: 'Ironman'
      },
      {
        id: 'endurance-3-4',
        name: 'Endurance Games',
        description: 'Jogos de resistência extrema',
        pillar: 'endurance',
        level: 3,
        skillIndex: 4,
        requirements: { pillarLevel: 3, description: '4h ultramarathon prep' },
        benefits: ['+42% endurance', 'Ultimate human endurance'],
        icon: 'EnduranceGames'
      }
    ],
    // Nível 4: Mestre
    4: [
      {
        id: 'endurance-4-0',
        name: '100-Mile Run',
        description: 'Corrida de 100 milhas',
        pillar: 'endurance',
        level: 4,
        skillIndex: 0,
        requirements: { pillarLevel: 4, description: '50h ultramarathon prep' },
        benefits: ['+55% endurance', 'Mastery achieved'],
        icon: 'HundredMile'
      },
      {
        id: 'endurance-4-1',
        name: 'Infinite Burpees',
        description: 'Burpees infinitos (até o limite)',
        pillar: 'endurance',
        level: 4,
        skillIndex: 1,
        requirements: { pillarLevel: 4, description: '500 death by burpees' },
        benefits: ['+65% endurance', 'Legendary mental toughness'],
        icon: 'InfiniteBurpee'
      },
      {
        id: 'endurance-4-2',
        name: 'Olympic Sprint Trials',
        description: 'Sprints estilo olímpico',
        pillar: 'endurance',
        level: 4,
        skillIndex: 2,
        requirements: { pillarLevel: 4, description: '200 max effort sprints' },
        benefits: ['+60% endurance', 'World-class speed'],
        icon: 'OlympicSprint'
      },
      {
        id: 'endurance-4-3',
        name: 'Decathlon',
        description: 'Decatlo completo',
        pillar: 'endurance',
        level: 4,
        skillIndex: 3,
        requirements: { pillarLevel: 4, description: '10h ironman training' },
        benefits: ['+70% endurance', 'Ultimate athleticism'],
        icon: 'Decathlon'
      },
      {
        id: 'endurance-4-4',
        name: 'Human Endurance Limit',
        description: 'Limite de resistência humana',
        pillar: 'endurance',
        level: 4,
        skillIndex: 4,
        requirements: { pillarLevel: 4, description: '24h endurance games' },
        benefits: ['+80% endurance', 'Transcendent human potential'],
        icon: 'HumanLimit'
      }
    ]
  }
};

// Desafios para subir de nível
export const LEVEL_UP_CHALLENGES: Record<MovementPillar, LevelUpChallenge[]> = {
  push: [
    {
      id: 'push-level-1',
      pillar: 'push',
      fromLevel: 0,
      toLevel: 1,
      challenge: {
        name: 'Push Foundation Challenge',
        description: 'Complete 50 wall push-ups + 25 knee push-ups + hold plank for 60 seconds',
        requirements: ['50 wall push-ups', '25 knee push-ups', '60s plank hold'],
        timeLimit: 15
      },
      rewards: { xpBonus: 50, skillUnlocks: ['push-1-0', 'push-1-1', 'push-1-2', 'push-1-3', 'push-1-4'] },
      risk: { xpPenalty: 25, debuffChance: 0.1 }
    },
    {
      id: 'push-level-2',
      pillar: 'push',
      fromLevel: 1,
      toLevel: 2,
      challenge: {
        name: 'Push Mastery Trial',
        description: 'Perform 30 standard push-ups + 15 diamond push-ups + 10 one-arm negatives',
        requirements: ['30 standard push-ups', '15 diamond push-ups', '10 one-arm negatives'],
        timeLimit: 20
      },
      rewards: { xpBonus: 100, skillUnlocks: ['push-2-0', 'push-2-1', 'push-2-2', 'push-2-3', 'push-2-4'] },
      risk: { xpPenalty: 50, debuffChance: 0.2 }
    },
    {
      id: 'push-level-3',
      pillar: 'push',
      fromLevel: 2,
      toLevel: 3,
      challenge: {
        name: 'Push Elite Challenge',
        description: 'Complete 20 one-arm push-ups + 10 planche leans + 5 ring HSPU',
        requirements: ['20 one-arm push-ups', '10 planche leans', '5 ring HSPU'],
        timeLimit: 25
      },
      rewards: { xpBonus: 200, skillUnlocks: ['push-3-0', 'push-3-1', 'push-3-2', 'push-3-3', 'push-3-4'] },
      risk: { xpPenalty: 100, debuffChance: 0.3 }
    },
    {
      id: 'push-level-4',
      pillar: 'push',
      fromLevel: 3,
      toLevel: 4,
      challenge: {
        name: 'Push Legendary Trial',
        description: 'Hold full planche for 30s + perform 10 one-arm HSPU + 5 maltese push-ups',
        requirements: ['30s full planche', '10 one-arm HSPU', '5 maltese push-ups'],
        timeLimit: 30
      },
      rewards: { xpBonus: 500, skillUnlocks: ['push-4-0', 'push-4-1', 'push-4-2', 'push-4-3', 'push-4-4'] },
      risk: { xpPenalty: 250, debuffChance: 0.5 }
    }
  ],
  pull: [
    {
      id: 'pull-level-1',
      pillar: 'pull',
      fromLevel: 0,
      toLevel: 1,
      challenge: {
        name: 'Pull Foundation Challenge',
        description: 'Hang for 90s + 15 Australian pull-ups + 10 inverted rows',
        requirements: ['90s dead hang', '15 Australian pull-ups', '10 inverted rows'],
        timeLimit: 15
      },
      rewards: { xpBonus: 50, skillUnlocks: ['pull-1-0', 'pull-1-1', 'pull-1-2', 'pull-1-3', 'pull-1-4'] },
      risk: { xpPenalty: 25, debuffChance: 0.1 }
    },
    {
      id: 'pull-level-2',
      pillar: 'pull',
      fromLevel: 1,
      toLevel: 2,
      challenge: {
        name: 'Pull Mastery Trial',
        description: 'Perform 25 strict pull-ups + 15 L-sit pull-ups + 5 one-arm negatives',
        requirements: ['25 strict pull-ups', '15 L-sit pull-ups', '5 one-arm negatives'],
        timeLimit: 20
      },
      rewards: { xpBonus: 100, skillUnlocks: ['pull-2-0', 'pull-2-1', 'pull-2-2', 'pull-2-3', 'pull-2-4'] },
      risk: { xpPenalty: 50, debuffChance: 0.2 }
    },
    {
      id: 'pull-level-3',
      pillar: 'pull',
      fromLevel: 2,
      toLevel: 3,
      challenge: {
        name: 'Pull Elite Challenge',
        description: 'Complete 15 one-arm pull-ups + 10 front lever raises + 5 ring muscle-ups',
        requirements: ['15 one-arm pull-ups', '10 front lever raises', '5 ring muscle-ups'],
        timeLimit: 25
      },
      rewards: { xpBonus: 200, skillUnlocks: ['pull-3-0', 'pull-3-1', 'pull-3-2', 'pull-3-3', 'pull-3-4'] },
      risk: { xpPenalty: 100, debuffChance: 0.3 }
    },
    {
      id: 'pull-level-4',
      pillar: 'pull',
      fromLevel: 3,
      toLevel: 4,
      challenge: {
        name: 'Pull Legendary Trial',
        description: 'Hold full front lever for 30s + perform 10 one-arm front lever + 5 victorian crosses',
        requirements: ['30s full front lever', '10 one-arm front lever', '5 victorian crosses'],
        timeLimit: 30
      },
      rewards: { xpBonus: 500, skillUnlocks: ['pull-4-0', 'pull-4-1', 'pull-4-2', 'pull-4-3', 'pull-4-4'] },
      risk: { xpPenalty: 250, debuffChance: 0.5 }
    }
  ],
  core: [
    {
      id: 'core-level-1',
      pillar: 'core',
      fromLevel: 0,
      toLevel: 1,
      challenge: {
        name: 'Core Foundation Challenge',
        description: 'Hold knee plank 60s + 30 dead bugs + 20 bird dogs per side',
        requirements: ['60s knee plank', '30 dead bugs', '20 bird dogs per side'],
        timeLimit: 15
      },
      rewards: { xpBonus: 50, skillUnlocks: ['core-1-0', 'core-1-1', 'core-1-2', 'core-1-3', 'core-1-4'] },
      risk: { xpPenalty: 25, debuffChance: 0.1 }
    },
    {
      id: 'core-level-2',
      pillar: 'core',
      fromLevel: 1,
      toLevel: 2,
      challenge: {
        name: 'Core Mastery Trial',
        description: 'Hold standard plank 90s + 25 V-ups + 15 windshield wipers per side',
        requirements: ['90s standard plank', '25 V-ups', '15 windshield wipers per side'],
        timeLimit: 20
      },
      rewards: { xpBonus: 100, skillUnlocks: ['core-2-0', 'core-2-1', 'core-2-2', 'core-2-3', 'core-2-4'] },
      risk: { xpPenalty: 50, debuffChance: 0.2 }
    },
    {
      id: 'core-level-3',
      pillar: 'core',
      fromLevel: 2,
      toLevel: 3,
      challenge: {
        name: 'Core Elite Challenge',
        description: 'Complete 10 full dragon flags + 20 manna + 30s inverted cross',
        requirements: ['10 full dragon flags', '20 manna', '30s inverted cross'],
        timeLimit: 25
      },
      rewards: { xpBonus: 200, skillUnlocks: ['core-3-0', 'core-3-1', 'core-3-2', 'core-3-3', 'core-3-4'] },
      risk: { xpPenalty: 100, debuffChance: 0.3 }
    },
    {
      id: 'core-level-4',
      pillar: 'core',
      fromLevel: 3,
      toLevel: 4,
      challenge: {
        name: 'Core Legendary Trial',
        description: 'Hold full manna for 30s + perform 15 one-arm human flags + 10 triple clap dragon flags',
        requirements: ['30s full manna', '15 one-arm human flags', '10 triple clap dragon flags'],
        timeLimit: 30
      },
      rewards: { xpBonus: 500, skillUnlocks: ['core-4-0', 'core-4-1', 'core-4-2', 'core-4-3', 'core-4-4'] },
      risk: { xpPenalty: 250, debuffChance: 0.5 }
    }
  ],
  legs: [
    {
      id: 'legs-level-1',
      pillar: 'legs',
      fromLevel: 0,
      toLevel: 1,
      challenge: {
        name: 'Legs Foundation Challenge',
        description: 'Perform 100 air squats + hold wall sit 60s + 20 lunges per leg',
        requirements: ['100 air squats', '60s wall sit', '20 lunges per leg'],
        timeLimit: 15
      },
      rewards: { xpBonus: 50, skillUnlocks: ['legs-1-0', 'legs-1-1', 'legs-1-2', 'legs-1-3', 'legs-1-4'] },
      risk: { xpPenalty: 25, debuffChance: 0.1 }
    },
    {
      id: 'legs-level-2',
      pillar: 'legs',
      fromLevel: 1,
      toLevel: 2,
      challenge: {
        name: 'Legs Mastery Trial',
        description: 'Complete 50 bodyweight squats + 20 pistol squats + 15 nordic hamstring curls per leg',
        requirements: ['50 bodyweight squats', '20 pistol squats', '15 nordic hamstring curls per leg'],
        timeLimit: 20
      },
      rewards: { xpBonus: 100, skillUnlocks: ['legs-2-0', 'legs-2-1', 'legs-2-2', 'legs-2-3', 'legs-2-4'] },
      risk: { xpPenalty: 50, debuffChance: 0.2 }
    },
    {
      id: 'legs-level-3',
      pillar: 'legs',
      fromLevel: 2,
      toLevel: 3,
      challenge: {
        name: 'Legs Elite Challenge',
        description: 'Perform 30 weighted squats + 15 one-legged pistols + 10 standing triple jumps',
        requirements: ['30 weighted squats', '15 one-legged pistols', '10 standing triple jumps'],
        timeLimit: 25
      },
      rewards: { xpBonus: 200, skillUnlocks: ['legs-3-0', 'legs-3-1', 'legs-3-2', 'legs-3-3', 'legs-3-4'] },
      risk: { xpPenalty: 100, debuffChance: 0.3 }
    },
    {
      id: 'legs-level-4',
      pillar: 'legs',
      fromLevel: 3,
      toLevel: 4,
      challenge: {
        name: 'Legs Legendary Trial',
        description: 'Complete 20 one-arm shrimp squats + 15 standing quintuple jumps + 30s victorian cross legs',
        requirements: ['20 one-arm shrimp squats', '15 standing quintuple jumps', '30s victorian cross legs'],
        timeLimit: 30
      },
      rewards: { xpBonus: 500, skillUnlocks: ['legs-4-0', 'legs-4-1', 'legs-4-2', 'legs-4-3', 'legs-4-4'] },
      risk: { xpPenalty: 250, debuffChance: 0.5 }
    }
  ],
  mobility: [
    {
      id: 'mobility-level-1',
      pillar: 'mobility',
      fromLevel: 0,
      toLevel: 1,
      challenge: {
        name: 'Mobility Foundation Challenge',
        description: 'Hold deep squat 60s + bridge pose 45s + pigeon pose 30s per side',
        requirements: ['60s deep squat', '45s bridge pose', '30s pigeon pose per side'],
        timeLimit: 15
      },
      rewards: { xpBonus: 50, skillUnlocks: ['mobility-1-0', 'mobility-1-1', 'mobility-1-2', 'mobility-1-3', 'mobility-1-4'] },
      risk: { xpPenalty: 25, debuffChance: 0.1 }
    },
    {
      id: 'mobility-level-2',
      pillar: 'mobility',
      fromLevel: 1,
      toLevel: 2,
      challenge: {
        name: 'Mobility Mastery Trial',
        description: 'Hold full bridge 45s + middle split 60s + forearm stand 30s',
        requirements: ['45s full bridge', '60s middle split', '30s forearm stand'],
        timeLimit: 20
      },
      rewards: { xpBonus: 100, skillUnlocks: ['mobility-2-0', 'mobility-2-1', 'mobility-2-2', 'mobility-2-3', 'mobility-2-4'] },
      risk: { xpPenalty: 50, debuffChance: 0.2 }
    },
    {
      id: 'mobility-level-3',
      pillar: 'mobility',
      fromLevel: 2,
      toLevel: 3,
      challenge: {
        name: 'Mobility Elite Challenge',
        description: 'Complete 20s one-arm bridge + 90s full middle split + 30s handstand',
        requirements: ['20s one-arm bridge', '90s full middle split', '30s handstand'],
        timeLimit: 25
      },
      rewards: { xpBonus: 200, skillUnlocks: ['mobility-3-0', 'mobility-3-1', 'mobility-3-2', 'mobility-3-3', 'mobility-3-4'] },
      risk: { xpPenalty: 100, debuffChance: 0.3 }
    },
    {
      id: 'mobility-level-4',
      pillar: 'mobility',
      fromLevel: 3,
      toLevel: 4,
      challenge: {
        name: 'Mobility Legendary Trial',
        description: 'Hold one-arm handstand 30s + full splits 120s + perform 20 press to handstands',
        requirements: ['30s one-arm handstand', '120s full splits', '20 press to handstands'],
        timeLimit: 30
      },
      rewards: { xpBonus: 500, skillUnlocks: ['mobility-4-0', 'mobility-4-1', 'mobility-4-2', 'mobility-4-3', 'mobility-4-4'] },
      risk: { xpPenalty: 250, debuffChance: 0.5 }
    }
  ],
  endurance: [
    {
      id: 'endurance-level-1',
      pillar: 'endurance',
      fromLevel: 0,
      toLevel: 1,
      challenge: {
        name: 'Endurance Foundation Challenge',
        description: 'Run 2km + perform 50 burpees + complete 10min circuit',
        requirements: ['2km run', '50 burpees', '10min circuit'],
        timeLimit: 25
      },
      rewards: { xpBonus: 50, skillUnlocks: ['endurance-1-0', 'endurance-1-1', 'endurance-1-2', 'endurance-1-3', 'endurance-1-4'] },
      risk: { xpPenalty: 25, debuffChance: 0.1 }
    },
    {
      id: 'endurance-level-2',
      pillar: 'endurance',
      fromLevel: 1,
      toLevel: 2,
      challenge: {
        name: 'Endurance Mastery Trial',
        description: 'Run 5km tempo + 100 burpees + 20min AMRAP circuit',
        requirements: ['5km tempo run', '100 burpees', '20min AMRAP circuit'],
        timeLimit: 45
      },
      rewards: { xpBonus: 100, skillUnlocks: ['endurance-2-0', 'endurance-2-1', 'endurance-2-2', 'endurance-2-3', 'endurance-2-4'] },
      risk: { xpPenalty: 50, debuffChance: 0.2 }
    },
    {
      id: 'endurance-level-3',
      pillar: 'endurance',
      fromLevel: 2,
      toLevel: 3,
      challenge: {
        name: 'Endurance Elite Challenge',
        description: 'Complete 50km bike + 200 death by burpees + 3h ironman training',
        requirements: ['50km bike', '200 death by burpees', '3h ironman training'],
        timeLimit: 240
      },
      rewards: { xpBonus: 200, skillUnlocks: ['endurance-3-0', 'endurance-3-1', 'endurance-3-2', 'endurance-3-3', 'endurance-3-4'] },
      risk: { xpPenalty: 100, debuffChance: 0.3 }
    },
    {
      id: 'endurance-level-4',
      pillar: 'endurance',
      fromLevel: 3,
      toLevel: 4,
      challenge: {
        name: 'Endurance Legendary Trial',
        description: 'Run 100 miles + perform 500 infinite burpees + complete decathlon',
        requirements: ['100 mile run', '500 infinite burpees', 'complete decathlon'],
        timeLimit: 1680
      },
      rewards: { xpBonus: 500, skillUnlocks: ['endurance-4-0', 'endurance-4-1', 'endurance-4-2', 'endurance-4-3', 'endurance-4-4'] },
      risk: { xpPenalty: 250, debuffChance: 0.5 }
    }
  ]
};
