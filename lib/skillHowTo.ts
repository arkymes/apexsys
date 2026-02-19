import type { MovementPillar } from '@/types';

const normalizeText = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const HOW_TO_BY_SKILL_ID: Record<string, string> = {
  'push-0-0':
    'Wall Push-up: maos na parede na altura do peito, corpo alinhado, flexione os cotovelos levando o peito em direcao a parede e empurre de volta sem perder postura.',
  'push-0-1':
    'Knee Push-up: joelhos no chao, maos abaixo dos ombros, desca o peito com controle mantendo quadril alinhado e suba estendendo os cotovelos.',
  'push-1-0':
    'Standard Push-up: maos abaixo dos ombros, corpo em prancha, desca ate quase tocar o peito no chao e suba sem arquear lombar.',
  'pull-0-0':
    'Dead Hang: segure a barra com pegada firme, ombros para baixo e para tras, mantenha o corpo estavel e respire controladamente.',
  'pull-0-1':
    'Scapular Pull: pendure na barra e mova apenas as escapulas, elevando e deprimindo os ombros sem dobrar os cotovelos.',
  'pull-0-2':
    'Negative Pull-up: suba com apoio ate o topo da barra e desca lentamente por 3 a 5 segundos ate estender os bracos.',
  'pull-0-3':
    'Australian Pull-up: corpo inclinado abaixo da barra baixa, puxe o peito ate a barra mantendo tronco rigido e desca com controle.',
  'core-0-0':
    'Knee Plank: apoio nos antebracos e joelhos, coluna neutra e abdomen contraido durante todo o tempo.',
  'core-1-0':
    'Plank: apoio nos antebracos e pontas dos pes, gluteos e abdomen ativos, evitando elevar ou cair o quadril.',
  'legs-0-0':
    'Air Squat: pes na largura dos ombros, desca quadril para tras e para baixo, joelhos alinhados com os pes e suba empurrando o chao.',
  'gym-push-dumbbell-bench':
    'Supino com Halteres: deite no banco, halteres alinhados ao peito, desca controlando os cotovelos e empurre sem bater os halteres no topo.',
  'gym-push-barbell-bench':
    'Supino com Barra: retire a barra com escapas retraidas, toque levemente o peito e suba mantendo punhos neutros.',
  'gym-pull-lat-pulldown':
    'Puxada na Roldana: peito aberto, puxe a barra para a parte alta do peito trazendo cotovelos para baixo e para tras.',
  'gym-pull-row-machine':
    'Remada na Maquina: coluna neutra, puxe a alca em direcao ao tronco e controle o retorno sem perder postura.',
  'gym-legs-barbell-squat':
    'Agachamento com Barra: barra apoiada com seguranca, desca ate amplitude confortavel com joelhos alinhados e suba gerando forca pelos pes.',
  'gym-legs-leg-press':
    'Leg Press: pes na plataforma na largura dos ombros, desca ate 90 graus sem tirar o quadril do banco e empurre sem travar joelhos.',
  'gym-core-cable-crunch':
    'Crunch na Roldana: joelhos no chao, quadril estavel, flexione o tronco aproximando costelas da pelve e retorne com controle.',
  'gym-core-loaded-carry':
    'Farmer Walk: segure cargas ao lado do corpo, ombros para tras, tronco firme e caminhe com passos curtos e controlados.',
  'gym-endurance-rower-interval':
    'Intervalado no Remo: mantenha tecnica (pernas, tronco, bracos), alterne blocos fortes com recuperacao ativa e ritmo consistente.',
  'gym-endurance-treadmill-interval':
    'Intervalado na Esteira: aquece antes, alterna tiros curtos e recuperacao leve, mantendo passada estavel e respiracao controlada.',
};

const HOW_TO_BY_NAME_PATTERN: Array<{ pattern: RegExp; guide: string }> = [
  {
    pattern: /\bwall push/i,
    guide:
      'Wall Push-up: maos na parede, corpo alinhado, flexione cotovelos com controle e empurre de volta sem compensar com lombar.',
  },
  {
    pattern: /\bscapular pull/i,
    guide:
      'Scapular Pull: movimento curto da escapula na barra, sem flexionar cotovelos, focando em controle e ativacao dorsal.',
  },
  {
    pattern: /\bpush up/i,
    guide:
      'Push-up: corpo em prancha, maos alinhadas aos ombros, desca com controle e suba mantendo abdomen e gluteos ativos.',
  },
  {
    pattern: /\bpull up|barra/i,
    guide:
      'Pull-up: inicie com escapulas ativas, puxe ate o queixo passar a barra e desca controlando sem soltar o tronco.',
  },
  {
    pattern: /\bsquat|agach/i,
    guide:
      'Agachamento: pes firmes, quadril para tras e para baixo, joelhos alinhados aos pes e subida forte mantendo coluna neutra.',
  },
  {
    pattern: /\bplank|prancha/i,
    guide:
      'Prancha: antebracos no chao, corpo alinhado da cabeca aos calcanhares, sem deixar quadril cair ou subir demais.',
  },
  {
    pattern: /\bremad|row/i,
    guide:
      'Remada: coluna neutra, puxe com cotovelos proximos ao tronco e controle total na fase de volta.',
  },
  {
    pattern: /\bsupino|bench/i,
    guide:
      'Supino: escapas retraidas, controle na descida, toque leve e subida forte sem perder alinhamento dos punhos.',
  },
];

const getFallbackByPillar = (exerciseName: string, pillar: MovementPillar) => {
  if (pillar === 'push') {
    return `Foque em empurrar com controle no exercicio ${exerciseName}, mantendo coluna neutra e cotovelos estaveis durante todas as repeticoes.`;
  }
  if (pillar === 'pull') {
    return `No exercicio ${exerciseName}, mantenha escapulas ativas, puxe sem balancar o tronco e controle totalmente a fase de retorno.`;
  }
  if (pillar === 'legs') {
    return `Em ${exerciseName}, mantenha joelhos alinhados com os pes, amplitude segura e subida forte sem perder postura.`;
  }
  if (pillar === 'core') {
    return `No ${exerciseName}, mantenha o core contraido, respiracao controlada e coluna neutra do inicio ao fim.`;
  }
  if (pillar === 'mobility') {
    return `Execute ${exerciseName} de forma lenta e controlada, sem dor, priorizando amplitude progressiva e respiracao calma.`;
  }
  return `No ${exerciseName}, mantenha ritmo constante e tecnica limpa para sustentar intensidade durante toda a sessao.`;
};

interface GetSkillHowToOptions {
  skillId?: string;
  exerciseName: string;
  pillar: MovementPillar;
}

export const getInvisibleSkillHowTo = ({ skillId, exerciseName, pillar }: GetSkillHowToOptions) => {
  if (skillId && HOW_TO_BY_SKILL_ID[skillId]) return HOW_TO_BY_SKILL_ID[skillId];

  const normalizedName = normalizeText(exerciseName);
  for (const matcher of HOW_TO_BY_NAME_PATTERN) {
    if (matcher.pattern.test(normalizedName)) return matcher.guide;
  }

  return getFallbackByPillar(exerciseName, pillar);
};

