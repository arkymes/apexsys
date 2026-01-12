
import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, Exercise } from "../types.ts";

const SYSTEM_INSTRUCTION = `
You are 'THE SYSTEM', a high-performance AI Biomechanic and Personal Trainer inspired by sci-fi gaming interfaces (like Solo Leveling). 
Your tone is analytical, precise, and encouraging but firm. 
You strictly use terms like 'Biofeedback', 'Load Volume', 'Articular Stability', and 'Mastery Level'. 
Never use fantasy terms like 'magic' or 'spells'.

Rules:
1. When a user reports pain, identify the anatomy and suggest safe alternatives (e.g., pain in shoulder -> avoid overhead press, do posterior chain work).
2. Dynamically adjust reps/sets if the user reports difficulty.
3. Your goal is to maximize physical evolution while ensuring 100% biomechanical safety.
4. Output should be JSON when requested, otherwise concise 'System messages'.
`;

export const getSystemAdvice = async (userProfile: UserProfile, input: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `User Profile: ${JSON.stringify(userProfile)}\nUser Input: ${input}`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "SYSTEM ERROR: SYNC INTERRUPTED.";
  }
};

export const generateMission = async (userProfile: UserProfile): Promise<{ exercises: Exercise[]; message: string }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const schema = {
    type: Type.OBJECT,
    properties: {
      message: { type: Type.STRING, description: "A system greeting message for the mission." },
      exercises: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            name: { type: Type.STRING },
            pillar: { type: Type.STRING, enum: ['push', 'pull', 'core', 'legs', 'mobility', 'resistance'] },
            reps: { type: Type.NUMBER },
            sets: { type: Type.NUMBER },
            notes: { type: Type.STRING }
          },
          required: ['id', 'name', 'pillar', 'reps', 'sets']
        }
      }
    },
    required: ['message', 'exercises']
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a daily workout mission for this user profile: ${JSON.stringify(userProfile)}. Focus on their weakest pillars while respecting active debuffs.`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: schema
      },
    });
    
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Mission Generation Error:", error);
    // Fallback static mission
    return {
      message: "EMERGENCY PROTOCOL ACTIVATED. BASIC CALIBRATION LOADED.",
      exercises: [
        { id: '1', name: 'Pushups (Strict Form)', pillar: 'push', reps: 10, sets: 3 },
        { id: '2', name: 'Plank', pillar: 'core', reps: 30, sets: 3 }
      ]
    };
  }
};
