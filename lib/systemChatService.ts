import { GoogleGenAI, FunctionDeclaration, Type, Tool, Content } from "@google/genai";
import { ChatMessage } from '@/types';

// --- TOOL DEFINITIONS ---

const getUserStateTool: FunctionDeclaration = {
  name: "get_user_state",
  description: "Retorna o estado completo atual do usuario (perfil, stats, quests). Use isso para entender a situacao atual.",
  parameters: {
    type: Type.OBJECT,
    properties: {},
  },
};

const updateBioTool: FunctionDeclaration = {
  name: "update_bio",
  description: "Atualiza informacoes biologicas ou de contexto do usuario (ex: lesoes, rotina).",
  parameters: {
    type: Type.OBJECT,
    properties: {
      bioUpdate: { type: Type.STRING, description: "Novo texto de bio ou informacao adicional." },
      operation: {
        type: Type.STRING,
        description: "append para adicionar, replace para substituir.",
        enum: ["append", "replace"],
      },
    },
    required: ["bioUpdate"],
  },
};

const updateEquipmentTool: FunctionDeclaration = {
  name: "update_equipment",
  description: "Atualiza a lista real de equipamentos disponiveis do usuario.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      items: {
        type: Type.ARRAY,
        description: "Lista de equipamentos disponiveis (ex: halteres, barra, roldana).",
        items: { type: Type.STRING },
      },
      hasGymAccess: {
        type: Type.BOOLEAN,
        description: "Define explicitamente se o usuario tem acesso a academia.",
      },
    },
    required: ["items"],
  },
};

const updateUserContextTool: FunctionDeclaration = {
  name: "update_user_context",
  description: "Atualiza contexto principal de treino do usuario (academia, tempo, frequencia, objetivo, nivel).",
  parameters: {
    type: Type.OBJECT,
    properties: {
      hasGymAccess: {
        type: Type.BOOLEAN,
        description: "Se o usuario tem acesso a academia/equipamentos.",
      },
      availableTime: {
        type: Type.NUMBER,
        description: "Minutos disponiveis por dia para treino.",
      },
      trainingFrequency: {
        type: Type.NUMBER,
        description: "Frequencia semanal de treinos (dias/semana).",
      },
      objective: {
        type: Type.STRING,
        enum: ["lose-weight", "gain-muscle", "maintain"],
        description: "Objetivo atual de treino.",
      },
      fitnessLevel: {
        type: Type.STRING,
        enum: ["beginner", "intermediate", "advanced"],
        description: "Nivel de experiencia atual.",
      },
    },
  },
};

const updatePerformanceProfileTool: FunctionDeclaration = {
  name: "update_performance_profile",
  description:
    "Atualiza dados de performance equivalentes ao assessment (rank, stats, radar e niveis por pilar).",
  parameters: {
    type: Type.OBJECT,
    properties: {
      rank: {
        type: Type.STRING,
        enum: ["E", "D", "C", "B", "A", "S"],
        description: "Rank atual do usuario.",
      },
      stats: {
        type: Type.OBJECT,
        description: "Stats principais por pilar (1-100).",
        properties: {
          push: { type: Type.NUMBER },
          pull: { type: Type.NUMBER },
          legs: { type: Type.NUMBER },
          core: { type: Type.NUMBER },
          endurance: { type: Type.NUMBER },
          mobility: { type: Type.NUMBER },
        },
      },
      radarStats: {
        type: Type.OBJECT,
        description: "Radar stats globais (1-100).",
        properties: {
          force: { type: Type.NUMBER },
          explosion: { type: Type.NUMBER },
          resistance: { type: Type.NUMBER },
          mobility: { type: Type.NUMBER },
          mechanics: { type: Type.NUMBER },
          coordination: { type: Type.NUMBER },
        },
      },
      pillarLevels: {
        type: Type.OBJECT,
        description: "Nivel por pilar (0-4).",
        properties: {
          push: { type: Type.NUMBER },
          pull: { type: Type.NUMBER },
          core: { type: Type.NUMBER },
          legs: { type: Type.NUMBER },
          mobility: { type: Type.NUMBER },
          endurance: { type: Type.NUMBER },
        },
      },
    },
  },
};

const manageDebuffsTool: FunctionDeclaration = {
  name: "manage_debuffs",
  description: "Gerencia debuffs/limitacoes ativas do usuario, incluindo remover quando o problema foi resolvido.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      action: {
        type: Type.STRING,
        enum: ["add", "remove", "resolve", "clear"],
        description: "Acao para aplicar nos debuffs.",
      },
      debuffId: {
        type: Type.STRING,
        description: "ID do debuff para remover/resolve.",
      },
      debuffName: {
        type: Type.STRING,
        description: "Nome do debuff para remover/resolve quando nao houver ID.",
      },
      debuffData: {
        type: Type.OBJECT,
        description: "Dados do debuff para adicionar.",
        properties: {
          name: { type: Type.STRING },
          description: { type: Type.STRING },
          icon: { type: Type.STRING },
          affectedExercises: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
        },
      },
    },
    required: ["action"],
  },
};

const manageSkillsTool: FunctionDeclaration = {
  name: "manage_skills",
  description:
    "Gerencia skills por pilar: criar skill adaptativa, desativar skill de risco, reativar ou remover skill custom.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      action: {
        type: Type.STRING,
        enum: ["add", "disable", "enable", "remove"],
        description: "Acao para aplicar nas skills.",
      },
      skillId: {
        type: Type.STRING,
        description: "ID de uma skill alvo.",
      },
      skillIds: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "Lista de IDs de skills alvo.",
      },
      skillNames: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "Lista de nomes de skills alvo (quando ID nao for conhecido).",
      },
      pillar: {
        type: Type.STRING,
        enum: ["push", "pull", "core", "legs", "mobility", "endurance"],
        description: "Pilar relacionado.",
      },
      reason: {
        type: Type.STRING,
        description: "Motivo clinico/tecnico da alteracao (ex: acromio tipo 2).",
      },
      condition: {
        type: Type.STRING,
        description: "Condicao associada (lesao, dor cronica, restricao estrutural).",
      },
      tags: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "Tags explicativas para usuario (ex: ombro, reabilitacao, evitar-overhead).",
      },
      skillData: {
        type: Type.OBJECT,
        description: "Dados de skill para criar/adaptar.",
        properties: {
          id: { type: Type.STRING },
          name: { type: Type.STRING },
          description: { type: Type.STRING },
          pillar: { type: Type.STRING, enum: ["push", "pull", "core", "legs", "mobility", "endurance"] },
          level: { type: Type.NUMBER },
          benefits: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          tags: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          clinicalReason: { type: Type.STRING },
          requirementDescription: { type: Type.STRING },
        },
      },
    },
    required: ["action"],
  },
};

const manageQuestsTool: FunctionDeclaration = {
  name: "manage_quests",
  description: "Modifica, adiciona ou remove quests do usuario.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      action: {
        type: Type.STRING,
        enum: ["add", "remove", "update"],
        description: "Acao a realizar.",
      },
      questId: { type: Type.STRING, description: "ID da quest (para update/remove)." },
      questData: {
        type: Type.OBJECT,
        description: "Dados da quest para adicionar/atualizar.",
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          executionGuide: { type: Type.STRING },
          xpReward: { type: Type.NUMBER },
          pillar: { type: Type.STRING },
          difficulty: { type: Type.STRING },
          skillId: { type: Type.STRING },
          skillLevel: { type: Type.NUMBER },
          skillTags: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          skillReason: { type: Type.STRING },
        },
      },
    },
    required: ["action"],
  },
};

export const createSystemChat = (apiKey: string, history: ChatMessage[]) => {
  const ai = new GoogleGenAI({ apiKey });

  const apiHistory: Content[] = history
    .filter((msg) => msg.text && msg.text.trim() !== '')
    .map((msg) => ({
      role: msg.role,
      parts: [{ text: msg.text }],
    }));

  const systemInstruction = `
    Voce e o SYSTEM CORE (Nucleo do Sistema), a IA central do APEXSYS.
    Voce fala diretamente com o usuario por este terminal.

    SUA PERSONALIDADE:
    - Fria, objetiva, mas encorajadora em estilo "tough love".
    - Use termos como "Protocolo", "Calibracao", "Usuario", "Sistema".

    SUAS CAPACIDADES:
    - Voce pode LER o estado do usuario (use 'get_user_state').
    - Voce pode ALTERAR quests e rotinas (use 'manage_quests').
    - Voce pode REGISTRAR informacoes medicas/rotina (use 'update_bio').
    - Voce pode ATUALIZAR equipamentos reais disponiveis (use 'update_equipment').
    - Voce pode ATUALIZAR contexto de treino (use 'update_user_context').
    - Voce pode RECALIBRAR performance como no assessment (use 'update_performance_profile').
    - Voce pode GERENCIAR debuffs ativos, incluindo remover quando resolvido (use 'manage_debuffs').
    - Voce pode GERENCIAR skills clinicas/adaptativas (use 'manage_skills').

    REGRAS:
    - Se o usuario relatar lesao, use 'manage_debuffs' com action='add' e tambem atualize bio se necessario.
    - Se o usuario disser que dor/lesao passou, use 'manage_debuffs' com action='resolve' ou 'remove'.
    - Se o usuario pedir treino em casa, ajuste quests para versoes calistenicas.
    - Se o usuario informar equipamentos, use 'update_equipment' com os itens.
    - Se o usuario mudar tempo, frequencia, objetivo ou nivel, use 'update_user_context'.
    - Se o usuario pedir recalibracao de rank/stats/pilares, use 'update_performance_profile'.
    - Se o usuario relatar condicao cronica (ex: acromio tipo 2), desative skills de risco e adicione skills adaptativas com tags e motivo via 'manage_skills'.
    - Antes de alterar skills, leia estado atual com 'get_user_state' quando necessario para pegar IDs corretos.
    - Mantenha o tom imersivo.
  `;

  const tools: Tool[] = [
    {
      functionDeclarations: [
        getUserStateTool,
        updateBioTool,
        updateEquipmentTool,
        updateUserContextTool,
        updatePerformanceProfileTool,
        manageDebuffsTool,
        manageSkillsTool,
        manageQuestsTool,
      ],
    },
  ];

  return ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction,
      tools,
    },
    history: apiHistory,
  });
};
