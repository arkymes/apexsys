'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, UploadCloud, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useAppStore } from '@/store/useAppStore';
import { GoogleGenAI } from "@google/genai";

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
}

interface AssessmentChatProps {
  onComplete: (summary: string) => void;
  context: any; 
}

export function AssessmentChat({ onComplete, context }: AssessmentChatProps) {
  const apiKey = useAppStore((state) => state.geminiApiKey);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionData, setSessionData] = useState<string>('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatInstance = useRef<any>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Initial system greeting
    if (apiKey && messages.length === 0) {
        initChat();
    }
  }, [apiKey]);

  const initChat = async () => {
    if (!apiKey) return;
    
    setIsLoading(true);
    const ai = new GoogleGenAI({ apiKey });
    
    chatInstance.current = ai.chats.create({
        model: 'gemini-3-flash-preview',
        config: {
            systemInstruction: `
                Você é o SYSTEM CORE durante a fase de Avaliação (Awakening).
                
                CONTEXTO DO USUÁRIO JA COLETADO:
                ${JSON.stringify(context, null, 2)}
                
                SEU OBJETIVO:
                1. Analisar os dados físicos já coletados silenciosamente (não mostrar análise detalhada ao usuário).
                2. Fazer APENAS UMA pergunta por vez para entender o perfil psicológico ou histórico de lesões do usuário, caso não esteja claro.
                3. Manter o tom imersivo de "Sistema".
                4. Após cada resposta do usuário, fazer a próxima pergunta relevante ou finalizar se tiver dados suficientes.
                
                QUANDO FINALIZAR:
                Se você sentir que tem dados suficientes, agradeça e finalize dizendo a palavra-chave "TERMINAL_LOCK".
                
                IMPORTANTE: 
                - Sempre faça apenas uma pergunta por resposta.
                - Não liste múltiplas perguntas de uma vez.
                - Não mostre análises longas ou dumps de informação.
                - Seja conciso e direto.
            `,
            temperature: 0.7,
        }
    });

    try {
        const result = await chatInstance.current.sendMessage({ message: "Analise os dados coletados e faça a primeira pergunta relevante sobre o perfil do usuário." });
        setMessages([{
            id: 'init',
            role: 'model',
            text: result.text || "Conectando ao Núcleo..."
        }]);
    } catch (e) {
        console.error(e);
    } finally {
        setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading || !chatInstance.current) return;

    const userText = input;
    setInput('');
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', text: userText }]);
    setIsLoading(true);

    try {
        const result = await chatInstance.current.sendMessage({ message: userText });
        const text = result.text || "";
        
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text }]);
        
        // Append context for final bio
        const updatedSessionData = `${sessionData}\nUser: ${userText}\nSystem: ${text}`;
        setSessionData(updatedSessionData);

        if (text.includes("TERMINAL_LOCK")) {
            onComplete(updatedSessionData);
        }

    } catch (e) {
        console.error(e);
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: "Erro de conexão." }]);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[400px]">
      <div className="flex-1 overflow-y-auto space-y-4 p-2 custom-scrollbar">
        {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                 <div className={`max-w-[85%] rounded-lg px-4 py-3 text-sm border ${
                      msg.role === 'user'
                        ? 'bg-neon-blue/10 border-neon-blue/30 text-white rounded-br-none'
                        : 'bg-shadow-700 border-white/10 text-white/80 rounded-bl-none'
                    }`}>
                    <div className="prose prose-invert prose-sm">
                        <ReactMarkdown>
                            {msg.text.replace("TERMINAL_LOCK", "")}
                        </ReactMarkdown>
                    </div>
                 </div>
            </div>
        ))}
         {isLoading && (
            <div className="flex justify-start">
                <div className="bg-shadow-800 border border-white/10 px-4 py-2 rounded-lg rounded-bl-none">
                    <Loader2 className="w-4 h-4 animate-spin text-neon-blue" />
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="mt-4 flex gap-2">
        <input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Responda ao Sistema..."
            className="flex-1 bg-shadow-800 border border-white/10 rounded px-4 py-2 text-sm text-white focus:outline-none focus:border-neon-blue"
        />
        <button 
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="p-2 bg-neon-blue/20 border border-neon-blue/50 rounded text-neon-blue hover:bg-neon-blue/30 disabled:opacity-50"
        >
            <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
