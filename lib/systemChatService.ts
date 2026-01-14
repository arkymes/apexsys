import { GoogleGenAI, FunctionDeclaration, Type, Tool, Content } from "@google/genai";
import { ChatMessage } from '@/types';

// --- TOOL DEFINITIONS ---

const getUserStateTool: FunctionDeclaration = {
  name: "get_user_state",
  description: "Retorna o estado completo atual do usuário (perfil, stats, quests). Use isso para entender a situação do Hunter.",
  parameters: {
    type: Type.OBJECT,
    properties: {},
  }
};

const updateBioTool: FunctionDeclaration = {
  name: "update_bio",
  description: "Atualiza as informações biológicas ou de contexto do usuário (ex: lesões, rotina, equipamentos).",
  parameters: {
    type: Type.OBJECT,
    properties: {
      bioUpdate: { type: Type.STRING, description: "O novo texto de bio ou informação adicional." },
      operation: { type: Type.STRING, description: "append' para adicionar, 'replace' para substituir.", enum: ["append", "replace"] }
    },
    required: ["bioUpdate"]
  }
};

const manageQuestsTool: FunctionDeclaration = {
  name: "manage_quests",
  description: "Modifica, adiciona ou remove quests do usuário.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      action: { type: Type.STRING, enum: ["add", "remove", "update"], description: "Ação a realizar." },
      questId: { type: Type.STRING, description: "ID da quest (para update/remove)." },
      questData: {
        type: Type.OBJECT,
        description: "Dados da quest para adicionar/atualizar.",
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          xpReward: { type: Type.NUMBER },
          pillar: { type: Type.STRING },
          difficulty: { type: Type.STRING }
        }
      }
    },
    required: ["action"]
  }
};

export const createSystemChat = (apiKey: string, history: ChatMessage[]) => {
  const ai = new GoogleGenAI({ apiKey });
  
  const apiHistory: Content[] = history
    .filter(msg => msg.text && msg.text.trim() !== '')
    .map(msg => ({
      role: msg.role,
      parts: [{ text: msg.text }]
    }));

  const systemInstruction = `
    Você é o SYSTEM CORE (Núcleo do Sistema), a IA central do Shadow Gym.
    Você fala diretamente com o Hunter (usuário) através deste terminal.
    
    SUA PERSONALIDADE:
    - Fria, objetiva, mas encorajadora de uma forma "tough love".
    - Use termos como "Protocolo", "Calibração", "Hunter", "Sistema".
    - Referência estética: Cyberpunk, Solo Leveling, Matrix.
    
    SUAS CAPACIDADES:
    - Você pode LER o estado do usuário (use 'get_user_state').
    - Você pode ALTERAR quests e rotinas se o usuário pedir (use 'manage_quests').
    - Você pode REGISTRAR informações médicas ou de rotina (use 'update_bio').
    
    REGRAS:
    - Se o usuário relatar lesão, use 'update_bio' para registrar e sugira alterar quests.
    - Se o usuário pedir treino em casa, modifique as quests atuais para versões calistênicas.
    - Mantenha o tom imersivo.
  `;

  // Define tools
  const tools: Tool[] = [
    {
      functionDeclarations: [getUserStateTool, updateBioTool, manageQuestsTool],
    }
  ];

  return ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: systemInstruction,
      tools: tools,
    },
    history: apiHistory
  });
};
