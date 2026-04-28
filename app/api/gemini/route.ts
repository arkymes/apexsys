import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI, FunctionDeclaration, Tool, Type } from '@google/genai';
import { sanitizeText } from '@/lib/textSanitizer';
import { promises as fs } from 'fs';
import path from 'path';

const setInitialProfileTool: FunctionDeclaration = {
  name: 'set_initial_profile',
  description: 'Define o perfil inicial do usuario apos a avaliacao.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      rank: { type: Type.STRING, description: 'Rank inicial', enum: ['E', 'D', 'C', 'B', 'A', 'S'] },
      stats: {
        type: Type.OBJECT,
        description: 'Status fisicos iniciais do usuario',
        properties: {
          push: { type: Type.NUMBER },
          pull: { type: Type.NUMBER },
          legs: { type: Type.NUMBER },
          core: { type: Type.NUMBER },
          endurance: { type: Type.NUMBER },
          mobility: { type: Type.NUMBER },
        },
        required: ['push', 'pull', 'legs', 'core', 'endurance', 'mobility'],
      },
      radarStats: {
        type: Type.OBJECT,
        description: 'Status do grafico de radar',
        properties: {
          force: { type: Type.NUMBER },
          explosion: { type: Type.NUMBER },
          resistance: { type: Type.NUMBER },
          mobility: { type: Type.NUMBER },
          mechanics: { type: Type.NUMBER },
          coordination: { type: Type.NUMBER },
        },
        required: ['force', 'explosion', 'resistance', 'mobility', 'mechanics', 'coordination'],
      },
      movementLevels: {
        type: Type.OBJECT,
        description: 'Nivel inicial em cada pilar de movimento',
        properties: {
          push: { type: Type.NUMBER },
          pull: { type: Type.NUMBER },
          core: { type: Type.NUMBER },
          legs: { type: Type.NUMBER },
          mobility: { type: Type.NUMBER },
          endurance: { type: Type.NUMBER },
        },
        required: ['push', 'pull', 'core', 'legs', 'mobility', 'endurance'],
      },
      bioSummary: { type: Type.STRING, description: 'Resumo clinico curto.' },
      equipmentCatalog: {
        type: Type.ARRAY,
        description:
          'Catalogo de equipamentos disponiveis para treino informado pelo usuario, normalizado e categorizado.',
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            category: {
              type: Type.STRING,
              enum: ['free-weight', 'barbell', 'machine', 'cable', 'bodyweight', 'cardio', 'accessory', 'other'],
            },
            notes: { type: Type.STRING },
            enabledForAI: { type: Type.BOOLEAN },
          },
          required: ['name', 'category'],
        },
      },
      debuffs: {
        type: Type.ARRAY,
        description: 'Lesoes, dores ou limitacoes.',
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            description: { type: Type.STRING },
            affectedExercises: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ['name', 'description', 'affectedExercises'],
        },
      },
    },
    required: ['rank', 'stats', 'radarStats', 'movementLevels', 'bioSummary'],
  },
};

const generateQuestsTool: FunctionDeclaration = {
  name: 'generate_quests',
  description: 'Gera daily e weekly quests com base no contexto do usuario.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      daily: {
        type: Type.ARRAY,
        description: 'Lista de quests diarias.',
        items: {
          type: Type.OBJECT,
          properties: {
            exerciseId: { type: Type.STRING, description: 'ID exato do exercicio escolhido do pool fornecido.' },
            name: { type: Type.STRING, description: 'Nome real do exercicio.' },
            description: { type: Type.STRING, description: 'Objetivo curto da quest.' },
            executionGuide: { type: Type.STRING, description: 'Como executar o exercicio.' },
            pillar: { type: Type.STRING, enum: ['push', 'pull', 'legs', 'core', 'mobility', 'endurance'] },
            sets: { type: Type.NUMBER },
            reps: { type: Type.STRING },
            xpReward: { type: Type.NUMBER },
            difficulty: { type: Type.STRING, enum: ['easy', 'medium', 'hard'] },
          },
          required: ['exerciseId', 'name', 'description', 'executionGuide', 'pillar', 'sets', 'reps', 'xpReward', 'difficulty'],
        },
      },
      weekly: {
        type: Type.ARRAY,
        description: 'Lista de quests semanais.',
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            description: { type: Type.STRING },
            executionGuide: { type: Type.STRING },
            pillar: { type: Type.STRING },
            sets: { type: Type.NUMBER },
            reps: { type: Type.STRING },
            xpReward: { type: Type.NUMBER },
            difficulty: { type: Type.STRING },
          },
          required: ['name', 'description', 'executionGuide', 'pillar', 'sets', 'reps', 'xpReward', 'difficulty'],
        },
      },
    },
    required: ['daily', 'weekly'],
  },
};

const searchExercisesTool: FunctionDeclaration = {
  name: 'search_exercises',
  description:
    'Busca exercicios no banco do sistema via RAG/recuperacao por filtros. Use antes de gerar treino para obter IDs validos.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      pillar: { type: Type.STRING, enum: ['push', 'pull', 'legs', 'core', 'mobility', 'endurance'] },
      goal: { type: Type.STRING, description: 'Objetivo da busca. Ex: pull sem sobrecarga no ombro.' },
      include: { type: Type.ARRAY, items: { type: Type.STRING } },
      exclude: { type: Type.ARRAY, items: { type: Type.STRING } },
      limit: { type: Type.NUMBER },
      maxLevel: { type: Type.NUMBER },
    },
  },
};

type ExerciseRecord = {
  id: string;
  name: string;
  pillar: string;
  muscle?: string;
  level?: number;
  equipment?: string[];
  howTo?: string;
};

let exerciseCache: ExerciseRecord[] | null = null;

const normalize = (value: unknown) =>
  String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const loadExercises = async (): Promise<ExerciseRecord[]> => {
  if (exerciseCache) return exerciseCache;
  const filePath = path.join(process.cwd(), 'public', 'data', 'exercises.json');
  const raw = await fs.readFile(filePath, 'utf-8');
  exerciseCache = JSON.parse(raw) as ExerciseRecord[];
  return exerciseCache;
};

const runExerciseRagSearch = async (
  args: Record<string, unknown>,
  context: Record<string, any>
) => {
  const exercises = await loadExercises();
  const requestedPillar = normalize(args.pillar);
  const pillar = ['push', 'pull', 'legs', 'core', 'mobility', 'endurance'].includes(requestedPillar)
    ? requestedPillar
    : '';
  const goal = normalize(args.goal);
  const includeTerms = Array.isArray(args.include) ? args.include.map((v) => normalize(v)).filter(Boolean) : [];
  const excludeTerms = Array.isArray(args.exclude) ? args.exclude.map((v) => normalize(v)).filter(Boolean) : [];
  const recentNames = new Set(
    Array.isArray(context?.recentHistory)
      ? context.recentHistory.map((h: any) => normalize(h?.name)).filter(Boolean)
      : []
  );
  const enabledEquipment = new Set<string>(
    Array.isArray(context?.availableEquipment) ? context.availableEquipment.map((e: any) => String(e)) : []
  );
  enabledEquipment.add('None');

  const parsedLimit = Number(args.limit);
  const limit = Number.isFinite(parsedLimit) ? Math.max(3, Math.min(40, Math.floor(parsedLimit))) : 16;
  const parsedMaxLevel = Number(args.maxLevel);
  const maxLevel = Number.isFinite(parsedMaxLevel) ? Math.max(0, Math.min(5, Math.floor(parsedMaxLevel))) : 5;

  const scored = exercises
    .filter((ex) => (pillar ? ex.pillar === pillar : true))
    .filter((ex) => (typeof ex.level === 'number' ? ex.level <= maxLevel : true))
    .filter((ex) => Array.isArray(ex.equipment) ? ex.equipment.every((eq) => enabledEquipment.has(eq)) : true)
    .filter((ex) => !recentNames.has(normalize(ex.name)))
    .map((ex) => {
      const bag = `${normalize(ex.name)} ${normalize(ex.muscle)} ${normalize(ex.howTo)}`;
      let score = 0;
      for (const term of includeTerms) if (bag.includes(term)) score += 3;
      for (const term of excludeTerms) if (bag.includes(term)) score -= 5;
      if (goal && bag.includes(goal)) score += 2;
      if (ex.level === 0) score += 0.3;
      return { ex, score };
    })
    .filter((item) => item.score > -4)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => ({
      id: item.ex.id,
      name: item.ex.name,
      pillar: item.ex.pillar,
      muscle: item.ex.muscle,
      level: item.ex.level,
      equipment: item.ex.equipment,
      score: Number(item.score.toFixed(2)),
    }));

  return {
    totalFound: scored.length,
    query: { pillar, goal, includeTerms, excludeTerms, limit, maxLevel },
    exercises: scored,
  };
};

const evaluateTrainingTool: FunctionDeclaration = {
  name: 'evaluate_training',
  description: 'Avalia log de treino e define ajustes sistemicos.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      volumePercent: { type: Type.NUMBER },
      cadenceNote: { type: Type.STRING },
      protectionTags: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
      },
      xpMultiplier: { type: Type.NUMBER },
      analysis: { type: Type.STRING },
    },
    required: ['volumePercent', 'xpMultiplier', 'analysis'],
  },
};

const sanitizePayloadStrings = (payload: unknown): unknown => {
  if (typeof payload === 'string') return sanitizeText(payload);
  if (Array.isArray(payload)) return payload.map((item) => sanitizePayloadStrings(item));
  if (payload && typeof payload === 'object') {
    return Object.fromEntries(
      Object.entries(payload as Record<string, unknown>).map(([key, value]) => [
        key,
        sanitizePayloadStrings(value),
      ])
    );
  }
  return payload;
};

export async function POST(request: NextRequest) {
  try {
    const { prompt, apiKey, intent, context } = await request.json();

    if (!apiKey) {
      return NextResponse.json({ error: 'API key is required' }, { status: 400 });
    }

    const ai = new GoogleGenAI({ apiKey });

    const baseSystemInstruction = `
      Voce e o SYSTEM CORE do APEXSYS, um sistema de treino gamificado.
      Voce deve responder usando as tools disponiveis.
      Seja frio, preciso e analitico.
    `;

    const assessmentInstruction = `
      Voce e o SYSTEM CORE do APEXSYS, um sistema de treino gamificado.
      Voce deve responder usando a tool set_initial_profile.
      Seja frio, preciso e analitico.

      REGRAS PARA ASSESSMENT:
      - Analise TODOS os dados fornecidos incluindo o historico de conversa (Bio/Historico).
      - O campo "bioSummary" deve conter um RESUMO CLINICO COMPLETO incluindo:
        * Lesoes, dores ou limitacoes mencionadas pelo usuario
        * Recomendacoes terapeuticas e protocolos acordados com o usuario (ex: fortalecimento do manguito rotador)
        * Observacoes relevantes sobre postura, tecnica ou cuidados especiais
        * Qualquer acordo feito durante a conversa de assessment (ex: etapas de reabilitacao)
      - O campo "debuffs" DEVE listar TODAS as lesoes, dores ou limitacoes fisicas encontradas no texto.
        Se o usuario mencionou qualquer dor, problema articular, lesao passada ou condicao anatomica (ex: acromio tipo 2, tendinite, hérnia), GERE um debuff correspondente.
        Inclua em affectedExercises os exercicios que devem ser evitados ou modificados.
      - NAO ignore informacoes clinicas. Se o usuario falou sobre um problema, ele DEVE aparecer nos debuffs E no bioSummary.
    `;

    // Enhanced instruction for quest generation with full user context
    const generateQuestsInstruction = context ? `
      Voce e o SYSTEM CORE do APEXSYS, um personal trainer IA dentro de um sistema gamificado.
      Voce deve responder usando a tool generate_quests.

      REGRAS CRITICAS PARA GERACAO DE TREINO:
      - TEMPO DISPONIVEL: ${Number(context.availableTime) || 45} minutos. Gere exercicios suficientes para preencher esse tempo (considere ~3-4 min por exercicio com descanso).
      - FREQUENCIA SEMANAL: ${Number(context.trainingFrequency) || 3}x por semana.
      - NIVEL DE FITNESS: ${context.fitnessLevel || 'intermediario'}.
      - Para ${Number(context.availableTime) || 45} minutos, gere entre ${Math.max(4, Math.round((Number(context.availableTime) || 45) / 6))} e ${Math.max(6, Math.round((Number(context.availableTime) || 45) / 4))} exercicios diarios.
      - Monte um treino REAL e coeso: compostos antes de isolados, agrupados por pilar/musculo.
      - NAO distribua 1 exercicio por pilar. Foque em 2-3 pilares por sessao com multiplos exercicios cada.
      - Antes de fechar o treino, use a tool search_exercises para recuperar IDs reais via RAG conforme objetivo e restricoes.
      - Use SOMENTE exerciseIds recuperados via tool. NAO invente exercicios.
      - Considere debuffs/lesoes: ${context.debuffs?.length ? JSON.stringify(context.debuffs) : 'nenhum'}.
      - Bio/historico clinico: ${context.bio || 'nenhum'}.
      - Equipamentos disponiveis: ${context.availableEquipment?.length ? context.availableEquipment.join(', ') : 'apenas peso corporal'}.
      - Retorne exatamente 1 weekly quest sobre consistencia semanal.
    ` : baseSystemInstruction;

    let activeTools: Tool[] = [];
    let activeToolConfig = {};

    if (intent === 'assessment') {
      activeTools = [{ functionDeclarations: [setInitialProfileTool] }];
      activeToolConfig = { functionCallingConfig: { mode: 'ANY', allowedFunctionNames: ['set_initial_profile'] } };
    } else if (intent === 'training_log') {
      activeTools = [{ functionDeclarations: [evaluateTrainingTool] }];
      activeToolConfig = { functionCallingConfig: { mode: 'ANY', allowedFunctionNames: ['evaluate_training'] } };
    } else if (intent === 'generate_quests') {
      activeTools = [{ functionDeclarations: [generateQuestsTool, searchExercisesTool] }];
      activeToolConfig = {
        functionCallingConfig: { mode: 'ANY', allowedFunctionNames: ['search_exercises', 'generate_quests'] },
      };
    }

    const models = ['gemini-3-flash-preview', 'gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-2.0-flash'];
    let result = null;
    let lastError = null;
    let retried = false;

    for (const model of models) {
      const maxRetries = 3;
      for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
          const conversation: any[] = [
            {
              role: 'user',
              parts: [{ text: `CONTEXTO:\n${JSON.stringify(context || {})}\n\nINPUT:\n${prompt}` }],
            },
          ];

          let turns = 0;
          while (turns < 8) {
            turns += 1;
            result = await ai.models.generateContent({
              model,
              config: {
                systemInstruction: { parts: [{ text: intent === 'generate_quests' ? generateQuestsInstruction : intent === 'assessment' ? assessmentInstruction : baseSystemInstruction }] },
                tools: activeTools,
                toolConfig: activeToolConfig,
                temperature: 0.5,
              },
              contents: conversation,
            });

            const functionCall = result?.candidates?.[0]?.content?.parts?.find((p) => p.functionCall)?.functionCall;
            if (!functionCall) {
              break;
            }

            if (intent === 'generate_quests' && functionCall.name === 'search_exercises') {
              const ragResponse = await runExerciseRagSearch(
                (functionCall.args as Record<string, unknown>) || {},
                (context as Record<string, any>) || {}
              );
              conversation.push({
                role: 'model',
                parts: [{ functionCall }],
              });
              conversation.push({
                role: 'user',
                parts: [
                  {
                    functionResponse: {
                      name: 'search_exercises',
                      response: ragResponse,
                    },
                  },
                ],
              });
              continue;
            }

            break;
          }

          if (result?.candidates?.length) {
            break;
          }
        } catch (e: any) {
          lastError = e;
          const status = e?.status ?? e?.httpStatusCode ?? e?.code;
          const msg = String(e?.message || '');
          const isUnavailable = status === 503 || status === 429 || msg.includes('UNAVAILABLE') || msg.includes('high demand') || msg.includes('RESOURCE_EXHAUSTED');
          if (isUnavailable && attempt < maxRetries - 1) {
            retried = true;
            const delay = (attempt + 1) * 2000; // 2s, 4s
            console.warn(`Model ${model} returned ${status}, retrying in ${delay}ms (attempt ${attempt + 1})`);
            await new Promise((r) => setTimeout(r, delay));
            continue;
          }
          console.warn(`Model ${model} failed (attempt ${attempt + 1})`, e);
          break;
        }
      }
      if (result?.candidates?.length) break;
    }

    if (!result) {
      throw lastError || new Error('All models failed');
    }

    const call = result.candidates?.[0]?.content?.parts?.find((p) => p.functionCall);

    if (call?.functionCall) {
      return NextResponse.json({
        response: JSON.stringify(sanitizePayloadStrings(call.functionCall.args)),
        retried,
        tokenUsage: result.usageMetadata || null,
      });
    }

    return NextResponse.json({
      response: JSON.stringify({ error: 'System Core failed to execute directives.' }),
      tokenUsage: result.usageMetadata || null,
    });
  } catch (error) {
    console.error('Gemini API error:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
