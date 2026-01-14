'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, X, Loader2, Database, Terminal } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useAppStore } from '@/store/useAppStore';
import { createSystemChat } from '@/lib/systemChatService';
import { ChatMessage, Quest, UserProfile } from '@/types';
import { GlassPanel } from './CyberFrame';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SystemChatPanel: React.FC<ChatPanelProps> = ({ isOpen, onClose }) => {
  const apiKey = useAppStore((state) => state.geminiApiKey);
  const user = useAppStore((state) => state.user);
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [processingTool, setProcessingTool] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatInstance = useRef<any>(null);

  // Initial greeting
  useEffect(() => {
    if (isOpen && messages.length === 0) {
        setMessages([{
            id: 'init',
            role: 'model',
            text: `**SYSTEM CORE ONLINE**\n\nIdentificação confirmada: Hunter **${user?.name || 'Unknown'}**.\nEstou pronto para ajustar seus protocolos.`,
            timestamp: Date.now()
        }]);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // --- TOOL EXECUTION LOGIC ---
  const executeTools = async (functionCalls: any[]) => {
    setProcessingTool(true);
    const responses = [];

    for (const call of functionCalls) {
      const { name, args } = call;
      console.log(`[SystemCore] Executing: ${name}`, args);
      
      let result = { result: "Done" };

      try {
        switch (name) {
          case 'get_user_state':
            const currentState = useAppStore.getState();
            result = { 
                result: JSON.stringify({
                    profile: currentState.user,
                    quests: { daily: currentState.dailyQuests, weekly: currentState.weeklyQuests },
                    progress: currentState.movementProgress,
                    recovery: currentState.recoveryStatus
                }) 
            };
            break;

          case 'update_bio':
            const currentBio = useAppStore.getState().user?.bio || "";
            const newBio = args.operation === 'append' 
                ? `${currentBio}\n${args.bioUpdate}` 
                : args.bioUpdate;
            
            // Direct state mutation for bio (assuming user exists)
            useAppStore.setState((state) => {
                if (!state.user) return state;
                return { 
                    user: { ...state.user, bio: newBio } 
                };
            });
            result = { result: "Bio data updated in System Core." };
            break;

          case 'manage_quests':
            if (args.action === 'add' && args.questData) {
                const newQuest: Quest = {
                    id: crypto.randomUUID(),
                    name: args.questData.title || "System Directive",
                    description: args.questData.description || "Auto-generated task",
                    xpReward: args.questData.xpReward || 50,
                    type: 'daily',
                    difficulty: (args.questData.difficulty as any) || 'medium',
                    status: 'pending',
                    pillar: (args.questData.pillar as any) || 'endurance',
                    sets: 3,
                    reps: '10-12',
                };
                useAppStore.setState((state) => ({
                    dailyQuests: [...state.dailyQuests, newQuest]
                }));
                result = { result: `Quest '${newQuest.name}' added to protocol.` };
            } else if (args.action === 'remove' && args.questId) {
                useAppStore.setState((state) => ({
                    dailyQuests: state.dailyQuests.filter(q => q.id !== args.questId),
                     weeklyQuests: state.weeklyQuests.filter(q => q.id !== args.questId)
                }));
                result = { result: "Quest removed from protocol." };
            }
            break;

          default:
            result = { result: "Unknown Protocol." };
        }
      } catch (e: any) {
        console.error("Tool execution error", e);
        result = { result: `System Error: ${e.message}` };
      }

      responses.push({
        id: call.id, 
        name: name,
        response: result
      });
    }

    setProcessingTool(false);
    return responses;
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading || !apiKey) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      if (!chatInstance.current) {
        chatInstance.current = createSystemChat(apiKey, messages); 
      }
      
      let result = await chatInstance.current.sendMessage({ message: userMsg.text });
      
      let functionCalls = result?.functionCalls;
      
      while (functionCalls && functionCalls.length > 0) {
        const toolResponses = await executeTools(functionCalls);
        
        result = await chatInstance.current.sendMessage({
          message: toolResponses.map(tr => ({
            functionResponse: tr
          }))
        });
        
        functionCalls = result?.functionCalls;
      }

      const responseText = result?.text;
      
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: responseText || "System Acknowledged.",
        timestamp: Date.now()
      }]);

    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: "CONNECTION INTERRUPTED. Check API Key or Network.",
        timestamp: Date.now()
      }]);
    } finally {
      setIsLoading(false);
      setProcessingTool(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          
          {/* Panel */}
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-full md:w-[450px] bg-shadow-900 border-l border-neon-blue/20 z-50 flex flex-col shadow-[0_0_50px_rgba(0,212,255,0.1)]"
          >
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-gradient-to-r from-shadow-800 to-shadow-900">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-neon-blue/10 flex items-center justify-center border border-neon-blue/50">
                    <Sparkles className="w-4 h-4 text-neon-blue" />
                </div>
                <div>
                    <h2 className="font-display font-bold text-white tracking-wide">SYSTEM CORE</h2>
                    <p className="text-[10px] text-neon-blue font-mono uppercase tracking-widest">Online</p>
                </div>
              </div>
              <button 
                onClick={onClose} 
                className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/50 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-shadow-900">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-lg px-4 py-3 text-sm border ${
                      msg.role === 'user'
                        ? 'bg-neon-blue/10 border-neon-blue/30 text-white rounded-br-none'
                        : 'bg-shadow-800 border-white/10 text-white/80 rounded-bl-none'
                    }`}
                  >
                    <div className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-black/50 prose-pre:border prose-pre:border-white/10">
                      <ReactMarkdown>
                        {msg.text || "..."}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              ))}
              
              {(isLoading || processingTool) && (
                 <div className="flex justify-start">
                   <div className="bg-shadow-800 px-4 py-3 rounded-lg rounded-bl-none border border-white/10 flex items-center gap-3">
                     {processingTool ? (
                        <>
                          <Terminal className="w-4 h-4 animate-pulse text-neon-purple" />
                          <span className="text-xs text-neon-purple font-mono">EXECUTING PROTOCOLS...</span>
                        </>
                     ) : (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-neon-blue" />
                          <span className="text-xs text-neon-blue font-mono">PROCESSING...</span>
                        </>
                     )}
                   </div>
                 </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <GlassPanel className="p-4 border-t border-white/10 !bg-shadow-800/80 !rounded-none">
              <div className="flex items-center gap-2 relative">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Insert System Command..."
                  className="w-full resize-none border border-white/10 rounded bg-black/50 py-3 pl-4 pr-12 text-white font-mono text-sm focus:border-neon-blue focus:outline-none transition-colors max-h-32 placeholder:text-white/20"
                  rows={1}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 p-2 bg-neon-blue/20 text-neon-blue border border-neon-blue/50 rounded hover:bg-neon-blue/40 disabled:opacity-50 disabled:grayscale transition-all"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </GlassPanel>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
