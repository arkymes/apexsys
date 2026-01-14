'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle2, Scroll, Crown, ArrowRight } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import type { Quest } from '@/types';

// AI Generation Logic
const generateProtocol = async (user: any, history: any[]) => {
    if (!user.geminiApiKey) {
        console.warn("No API Key, using fallback");
        return fallbackQuests(user);
    }

    try {
        // Filter history to last 7 days to avoid huge payload
        const recentHistory = history.filter(h => 
            new Date(h.completedAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
        ).map(h => ({ name: h.name, pillar: h.pillar, difficulty: h.difficulty }));

        const response = await fetch('/api/gemini', {
            method: 'POST',
            body: JSON.stringify({
                apiKey: user.geminiApiKey,
                intent: 'generate_quests',
                context: {
                    userStats: user.stats,
                    fitnessLevel: user.fitnessLevel,
                    availableTime: user.availableTime,
                    trainingFrequency: user.trainingFrequency,
                    debuffs: user.debuffs,
                    bio: user.bio,
                    equipment: user.hasGymAccess ? 'Full Gym' : 'Home/Bodyweight',
                    recentHistory
                },
                prompt: `Generate a personalized workout protocol. You MUST adjust volume based on user's availableTime (${user.availableTime} mins).
                
                MANDATORY VOLUME RULES:
                - If <= 20 mins: Generate exactly 2 high-intensity quests.
                - If 30-45 mins: Generate exactly 3-4 quests.
                - If >= 60 mins: Generate exactly 5-6 quests.
                
                Training Frequency: ${user.trainingFrequency || 3}x/week.
                
                CRITICAL WARNING: The user has the following DEBUFFS (Injuries/Limitations):
                ${user.debuffs?.map((d: any) => `- ${d.name}: ${d.description}. AVOID: ${d.affectedExercises.join(', ')}`).join('\n') || 'None'}
                
                You MUST respect these limitations. Do not prescribe exercises that aggravate these conditions. 
                Instead, prescribe suitable regressions or alternatives.

                Use REAL EXERCISE NAMES. Include short execution instructions. VARY from recent history.`
            })
        });

        const data = await response.json();
        if(data.error) throw new Error(data.error);

        const result = JSON.parse(data.response);
        
        return {
            daily: result.daily.map((q: any, i: number) => ({
                ...q, 
                id: `daily-${Date.now()}-${i}`, 
                status: 'pending', 
                type: 'daily',
                statBoost: q.statBoost || { stat: 'push', amount: 1 }
            })),
            weekly: result.weekly.map((q: any, i: number) => ({
                ...q, 
                id: `weekly-${Date.now()}-${i}`, 
                status: 'pending', 
                type: 'weekly'
            }))
        };

    } catch (error) {
        console.error("AI Generation failed:", error);
        return fallbackQuests(user);
    }
};

const fallbackQuests = (user?: any): { daily: Quest[]; weekly: Quest[] } => {
  const time = user?.availableTime || 45;
  const count = time <= 20 ? 2 : time <= 45 ? 3 : time <= 60 ? 4 : 5;

  const baseDaily: Quest[] = [
    {
      id: 'daily-1',
      name: 'Bodyweight Squats',
      description: 'Stand with feet shoulder-width apart. Lower your hips back and down as if sitting in a chair. Keep chest up.',
      type: 'daily',
      pillar: 'legs',
      sets: 3,
      reps: 12,
      xpReward: 60,
      statBoost: { stat: 'legs', amount: 1 },
      difficulty: 'medium',
      status: 'pending',
    },
    {
      id: 'daily-2',
      name: 'Push-ups',
      description: 'Start in plank position. Lower body until chest nearly touches floor. Push back up.',
      type: 'daily',
      pillar: 'push',
      sets: 3,
      reps: 10,
      xpReward: 50,
      statBoost: { stat: 'push', amount: 1 },
      difficulty: 'medium',
      status: 'pending',
    },
    {
      id: 'daily-3',
      name: 'Glute Bridges',
      description: 'Lie on back, knees bent. Lift hips until body forms straight line from shoulders to knees.',
      type: 'daily',
      pillar: 'core',
      sets: 3,
      reps: 15,
      xpReward: 40,
      statBoost: { stat: 'core', amount: 1 },
      difficulty: 'easy',
      status: 'pending',
    },
    {
      id: 'daily-4',
      name: 'Lunges',
      description: 'Step forward with one leg, lowering your hips until both knees are bent at approximately a 90-degree angle.',
      type: 'daily',
      pillar: 'legs',
      sets: 3,
      reps: "10/leg",
      xpReward: 55,
      statBoost: { stat: 'legs', amount: 1 },
      difficulty: 'medium',
      status: 'pending',
    },
    {
      id: 'daily-5',
      name: 'Plank',
      description: 'Hold a push-up position on your elbows. Keep your body in a straight line.',
      type: 'daily',
      pillar: 'core',
      sets: 3,
      reps: "45s",
      xpReward: 65,
      statBoost: { stat: 'core', amount: 1 },
      difficulty: 'hard',
      status: 'pending',
    }
  ];
  
  // Slice based on time
  const daily = baseDaily.slice(0, count);

  // Add endurance if time permits > 20 mins to ensure cardio
  if (time > 20 && daily.length < count + 1) {
       daily.push({
          id: 'daily-cardio',
          name: 'Brisk Walk / Jog',
          description: 'Maintain a steady pace. Focus on breathing.',
          type: 'daily',
          pillar: 'endurance',
          sets: 1,
          reps: `${Math.min(time - 15, 30)} min`,
          xpReward: 40,
          statBoost: { stat: 'endurance', amount: 1 },
          difficulty: 'easy',
          status: 'pending',
        });
  }

  const weekly: Quest[] = [
    {
      id: 'weekly-1',
      name: 'Consistency Check',
      description: 'Complete all daily quests for 7 consecutive days.',
      type: 'weekly',
      pillar: 'core',
      sets: 7,
      reps: 'days',
      xpReward: 200,
      difficulty: 'hard',
      status: 'pending',
    },
  ];

  return { daily, weekly };
};

export function ProtocolGenerator() {
  const [phase, setPhase] = useState<'analyzing' | 'generated'>('analyzing');
  const [loadingText, setLoadingText] = useState('Generating personalized protocol...');
  const user = useAppStore((state) => state.user);
  const setQuests = useAppStore((state) => state.setQuests);
  const setScreen = useAppStore((state) => state.setScreen);
  const questHistory = useAppStore((state) => state.questHistory);
  const dailyQuests = useAppStore((state) => state.dailyQuests);
  const weeklyQuests = useAppStore((state) => state.weeklyQuests);

  useEffect(() => {
    // Cycle loading messages
    const messages = [
      'Generating personalized protocol...',
      'Analyzing physical parameters...',
      'Calculating optimal training volume...',
      'Calibrating difficulty levels...',
      'Finalizing quest parameters...',
    ];
    let index = 0;
    
    const messageTimer = setInterval(() => {
      index = (index + 1) % messages.length;
      setLoadingText(messages[index]);
    }, 1500);

    // AI Analysis Execution
    const runAnalysis = async () => {
        const { daily, weekly } = await generateProtocol(user, questHistory || []);
        setQuests(daily, weekly);
        setPhase('generated');
    };

    const analysisTimer = setTimeout(() => {
        runAnalysis();
    }, 3000); // 3 seconds delay for effect


    return () => {
      clearInterval(messageTimer);
      clearTimeout(analysisTimer);
    };
  }, [setQuests]);

  const handleBeginTraining = () => {
    setScreen('dashboard');
  };

  // Analyzing phase
  if (phase === 'analyzing') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
        {/* Header Panel */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="notification-popup mb-12 px-8 py-4"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 border-2 border-white/60 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-white/80" />
            </div>
            <h2 className="font-display text-lg md:text-xl tracking-wider text-white font-bold">
              HUNTER ASSESSMENT
            </h2>
          </div>
        </motion.div>

        {/* Hunter Info */}
        {user && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-2"
          >
            <span className="text-neon-cyan font-display">Hunter: </span>
            <span className="text-white font-body">{user.name}</span>
            <span className="text-white/40 mx-3">|</span>
            <span className="text-neon-cyan font-display">Rank: </span>
            <span className="text-rank-d font-display font-bold">{user.rank}</span>
          </motion.div>
        )}

        {/* System Message */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center mb-12"
        >
          <span className="text-yellow-500 font-mono">[SYSTEM]</span>
          <span className="text-white/80 ml-2">
            Analyzing{' '}
            <span className="gradient-text font-semibold">physical parameters</span>
            {' '}for optimal
          </span>
          <br />
          <span className="gradient-text font-semibold">training protocol</span>
          <span className="text-white/80">...</span>
        </motion.p>

        {/* Loading Ring */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="relative mb-10"
        >
          <div className="loading-ring" />
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              className="w-3 h-3 bg-neon-cyan rounded-full"
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </div>
        </motion.div>

        {/* Status Text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center"
        >
          <p className="text-white/50 uppercase tracking-[0.2em] text-sm font-display mb-2">
            ANALYZING DATA...
          </p>
          <motion.p
            key={loadingText}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-white/40 text-sm font-body"
          >
            {loadingText}
          </motion.p>
        </motion.div>
      </div>
    );
  }

  // Generated phase - show quests
  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="notification-popup w-full max-w-3xl relative"
      >
        {/* Corner accents */}
        <div className="absolute -top-1 -left-1 w-6 h-6 border-l-2 border-t-2 border-neon-cyan" />
        <div className="absolute -top-1 -right-1 w-6 h-6 border-r-2 border-t-2 border-neon-cyan" />
        <div className="absolute -bottom-1 -left-1 w-6 h-6 border-l-2 border-b-2 border-neon-cyan" />
        <div className="absolute -bottom-1 -right-1 w-6 h-6 border-r-2 border-b-2 border-neon-cyan" />

        <div className="p-8 md:p-12">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-4 mb-6"
          >
            <div className="w-10 h-10 border-2 border-white/60 rounded flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-success-green" />
            </div>
            <h2 className="font-display text-lg md:text-xl tracking-wider text-white font-bold">
              PROTOCOL GENERATED
            </h2>
          </motion.div>

          {/* System Message */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-8"
          >
            <span className="text-yellow-500 font-mono">[SYSTEM]</span>
            <span className="text-white/80 ml-2">
              Your personalized training quests have been created!
            </span>
          </motion.div>

          {/* Daily Quests */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Scroll className="w-5 h-5 text-neon-blue" />
              <span className="font-display text-sm uppercase tracking-wider text-white/80">
                Daily Quests
              </span>
            </div>
            <div className="space-y-2">
              {dailyQuests.map((quest, index) => (
                <motion.div
                  key={quest.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="quest-item px-4 py-3 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <Scroll className="w-4 h-4 text-neon-blue/60" />
                    <span className="text-white/90 font-body">{quest.name}</span>
                  </div>
                  <span className="text-gold font-mono text-sm">+{quest.xpReward} XP</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Weekly Quest */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <Crown className="w-5 h-5 text-gold" />
              <span className="font-display text-sm uppercase tracking-wider text-white/80">
                Weekly Quest
              </span>
            </div>
            <div className="space-y-2">
              {weeklyQuests.map((quest, index) => (
                <motion.div
                  key={quest.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="quest-item px-4 py-3 flex items-center justify-between"
                  style={{ borderLeftColor: '#ffd700' }}
                >
                  <div className="flex items-center gap-3">
                    <Crown className="w-4 h-4 text-gold/60" />
                    <span className="text-white/90 font-body">{quest.name}</span>
                  </div>
                  <span className="text-gold font-mono text-sm">+{quest.xpReward} XP</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Begin Training Button */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            onClick={handleBeginTraining}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-4 font-display text-sm tracking-wider border-2 border-neon-cyan/60 text-neon-cyan bg-gradient-to-b from-neon-cyan/20 to-transparent hover:border-neon-cyan hover:shadow-[0_0_20px_rgba(0,245,255,0.3)] transition-all flex items-center justify-center gap-2"
          >
            BEGIN TRAINING
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
