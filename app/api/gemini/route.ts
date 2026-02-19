import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI, FunctionDeclaration, Tool, Type } from '@google/genai';
import { sanitizeText } from '@/lib/textSanitizer';

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
            name: { type: Type.STRING, description: 'Nome real do exercicio.' },
            description: { type: Type.STRING, description: 'Objetivo curto da quest.' },
            executionGuide: { type: Type.STRING, description: 'Como executar o exercicio.' },
            pillar: { type: Type.STRING, enum: ['push', 'pull', 'legs', 'core', 'mobility', 'endurance'] },
            sets: { type: Type.NUMBER },
            reps: { type: Type.STRING },
            xpReward: { type: Type.NUMBER },
            difficulty: { type: Type.STRING, enum: ['easy', 'medium', 'hard'] },
          },
          required: ['name', 'description', 'executionGuide', 'pillar', 'sets', 'reps', 'xpReward', 'difficulty'],
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
      Voce e o SYSTEM CORE do APEXSYS.
      Voce deve responder usando as tools disponiveis.
      Seja frio, preciso e analitico.
    `;

    let activeTools: Tool[] = [];
    let activeToolConfig = {};

    if (intent === 'assessment') {
      activeTools = [{ functionDeclarations: [setInitialProfileTool] }];
      activeToolConfig = { functionCallingConfig: { mode: 'ANY', allowedFunctionNames: ['set_initial_profile'] } };
    } else if (intent === 'training_log') {
      activeTools = [{ functionDeclarations: [evaluateTrainingTool] }];
      activeToolConfig = { functionCallingConfig: { mode: 'ANY', allowedFunctionNames: ['evaluate_training'] } };
    } else if (intent === 'generate_quests') {
      activeTools = [{ functionDeclarations: [generateQuestsTool] }];
      activeToolConfig = { functionCallingConfig: { mode: 'ANY', allowedFunctionNames: ['generate_quests'] } };
    }

    const models = ['gemini-3-flash-preview', 'gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-2.0-flash'];
    let result = null;
    let lastError = null;

    for (const model of models) {
      try {
        result = await ai.models.generateContent({
          model,
          config: {
            systemInstruction: { parts: [{ text: baseSystemInstruction }] },
            tools: activeTools,
            toolConfig: activeToolConfig,
            temperature: 0.5,
          },
          contents: [
            {
              role: 'user',
              parts: [{ text: `CONTEXTO:\n${JSON.stringify(context || {})}\n\nINPUT:\n${prompt}` }],
            },
          ],
        });

        if (result?.candidates?.length) {
          break;
        }
      } catch (e) {
        console.warn(`Model ${model} failed`, e);
        lastError = e;
      }
    }

    if (!result) {
      throw lastError || new Error('All models failed');
    }

    const call = result.candidates?.[0]?.content?.parts?.find((p) => p.functionCall);

    if (call?.functionCall) {
      return NextResponse.json({
        response: JSON.stringify(sanitizePayloadStrings(call.functionCall.args)),
      });
    }

    return NextResponse.json({ response: JSON.stringify({ error: 'System Core failed to execute directives.' }) });
  } catch (error) {
    console.error('Gemini API error:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
