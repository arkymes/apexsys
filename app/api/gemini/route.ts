import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI, FunctionDeclaration, Tool, Type } from "@google/genai";

// --- Ferramentas / Tools Definitions ---

const setInitialProfileTool: FunctionDeclaration = {
  name: "set_initial_profile",
  description: "Define o perfil inicial do Hunter após a avaliação (Awakening). Configura status, rank e níveis de movimento.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      rank: { type: Type.STRING, description: "Rank inicial (E, D, C, B, A, S)", enum: ["E", "D", "C", "B", "A", "S"] },
      stats: {
        type: Type.OBJECT,
        description: "Status do Hunter (Baseados em performance funcional)",
        properties: {
          push: { type: Type.NUMBER },
          pull: { type: Type.NUMBER },
          legs: { type: Type.NUMBER },
          core: { type: Type.NUMBER },
          endurance: { type: Type.NUMBER },
          mobility: { type: Type.NUMBER }
        },
        required: ["push", "pull", "legs", "core", "endurance", "mobility"]
      },
      radarStats: {
        type: Type.OBJECT,
        description: "Status do gráfico de radar (PMF)",
        properties: {
          force: { type: Type.NUMBER },
          explosion: { type: Type.NUMBER },
          resistance: { type: Type.NUMBER },
          mobility: { type: Type.NUMBER },
          mechanics: { type: Type.NUMBER },
          coordination: { type: Type.NUMBER }
        },
        required: ["force", "explosion", "resistance", "mobility", "mechanics", "coordination"]
      },
      movementLevels: {
        type: Type.OBJECT,
        description: "Nível inicial (1-100) em cada pilar de movimento",
        properties: {
          push: { type: Type.NUMBER },
          pull: { type: Type.NUMBER },
          core: { type: Type.NUMBER },
          legs: { type: Type.NUMBER },
          mobility: { type: Type.NUMBER },
          endurance: { type: Type.NUMBER }
        },
        required: ["push", "pull", "core", "legs", "mobility", "endurance"]
      },
      bioSummary: { type: Type.STRING, description: "Resumo clínico curto e direto e num tom 'cyberpunk' ou 'médico'. Ex: 'Indivíduo apresenta instabilidade glenoumeral.'" },
      debuffs: {
        type: Type.ARRAY,
        description: "Lista de lesões, dores ou limitações físicas identificadas no relato.",
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: "Nome da condição (Ex: 'Instabilidade de Ombro', 'Dor Lombar')" },
            description: { type: Type.STRING, description: "Breve explicação do impacto." },
            affectedExercises: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                description: "Lista de exercícios ou movimentos que devem ser evitados ou adaptados." 
            }
          },
          required: ["name", "description", "affectedExercises"]
        }
      }
    },
    required: ["rank", "stats", "radarStats", "movementLevels", "bioSummary"]
  }
};

const generateQuestsTool: FunctionDeclaration = {
  name: "generate_quests",
  description: "Gera a lista de Daily e Weekly Quests baseada no perfil do usuário.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      daily: {
        type: Type.ARRAY,
        description: "Lista de missões diárias calibrada para o tempo disponível do usuário (Ex: 15min=2 quests, 45min=4 quests, 90min=6 quests). Use NOMES REAIS de exercícios.",
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: "Nome TÉCNICO e NORMAL do exercício (ex: Flexão de Braços, Agachamento Livre, Prancha). PROIBIDO usar nomes de RPG/Fantasia." },
            description: { type: Type.STRING, description: "Instrução técnica de execução. Ex: 'Pés na largura dos ombros, desça controlando o peso.'." },
            pillar: { type: Type.STRING, enum: ["push", "pull", "legs", "core", "mobility", "endurance"] },
            sets: { type: Type.NUMBER },
            reps: { type: Type.STRING },
            xpReward: { type: Type.NUMBER },
            difficulty: { type: Type.STRING, enum: ["easy", "medium", "hard"] }
          },
          required: ["name", "description", "pillar", "sets", "reps", "xpReward", "difficulty"]
        }
      },
      weekly: {
        type: Type.ARRAY,
        description: "Lista de 1 missão semanal.",
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            description: { type: Type.STRING },
            pillar: { type: Type.STRING },
            sets: { type: Type.NUMBER },
            reps: { type: Type.STRING },
            xpReward: { type: Type.NUMBER },
            difficulty: { type: Type.STRING }
          },
          required: ["name", "description", "pillar", "sets", "reps", "xpReward", "difficulty"]
        }
      }
    },
    required: ["daily", "weekly"]
  }
};

const evaluateTrainingTool: FunctionDeclaration = {
  name: "evaluate_training",
  description: "Avalia um log de treino e define ajustes sistêmicos.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      volumePercent: { type: Type.NUMBER, description: "Porcentagem do volume para o próximo treino (ex: 100 para manter, 80 para reduzir)." },
      cadenceNote: { type: Type.STRING, description: "Instrução de cadência (ex: '3010' ou 'Explosiva')." },
      protectionTags: { 
        type: Type.ARRAY, 
        items: { type: Type.STRING }, 
        description: "Tags de proteção corporal (ex: 'Shoulder-Left', 'Lower-Back')." 
      },
      xpMultiplier: { type: Type.NUMBER, description: "Multiplicador de XP baseado na performance (1.0 a 2.0)." },
      analysis: { type: Type.STRING, description: "Feedback curto do sistema." }
    },
    required: ["volumePercent", "xpMultiplier", "analysis"]
  }
};

export async function POST(request: NextRequest) {
  try {
    const { prompt, apiKey, intent, context } = await request.json();

    if (!apiKey) {
      return NextResponse.json({ error: 'API key is required' }, { status: 400 });
    }

    const ai = new GoogleGenAI({ apiKey });

    // Instrução base do Sistema
    const baseSystemInstruction = `
      Você é o SYSTEM CORE (Núcleo do Sistema), a inteligência central do "Shadow Gym".
      Sua função é gerenciar a evolução biológica e os dados dos Hunters (usuários).
      
      Você NÃO responde com texto simples (chat).
      Você DEVE usar as FERRAMENTAS (Tools) disponíveis para interagir com o banco de dados do Sistema.
      Seja frio, preciso e analítico.
    `;

    // Configuração Dinâmica de Ferramentas
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

    // Execução da IA com Fallback de Modelos
    const models = ['gemini-3-flash-preview', 'gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-2.0-flash'];
    let result = null;
    let lastError = null;

    for (const model of models) {
        try {
            console.log(`Trying model: ${model}`);
            result = await ai.models.generateContent({
              model: model,
              config: {
                systemInstruction: { parts: [{ text: baseSystemInstruction }] },
                tools: activeTools,
                toolConfig: activeToolConfig,
                temperature: 0.5,
              },
              contents: [
                {
                  role: 'user',
                  parts: [
                    { text: `CONTEXTO ATUAL:\n${JSON.stringify(context || {})}\n\nINPUT DO USUÁRIO:\n${prompt}` }
                  ]
                }
              ]
            });
            
            if (result && result.candidates && result.candidates.length > 0) {
                break; // Sucesso
            }
        } catch (e) {
            console.warn(`Model ${model} failed:`, e);
            lastError = e;
            continue; // Tenta o próximo
        }
    }

    if (!result) {
        throw lastError || new Error("All models failed");
    }

    // Processamento da Resposta (Function Calling)
    const call = result.candidates?.[0]?.content?.parts?.find(p => p.functionCall);
    
    if (call && call.functionCall) {
      // O frontend espera um JSON string na propriedade "response"
      // Vamos serializar os argumentos da ferramenta chamada para manter compatibilidade
      const args = call.functionCall.args;
      return NextResponse.json({ response: JSON.stringify(args) });
    }

    // Fallback caso a IA decida não chamar ferramenta (não deve acontecer com mode: ANY)
    return NextResponse.json({ response: JSON.stringify({ error: "System Core failed to execute directives." }) });

  } catch (error) {
    console.error('Gemini API error:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
