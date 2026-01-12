import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, AppView, Exercise } from './types.ts';
import { INITIAL_USER, RANK_COLORS, PILLAR_LABELS } from './constants.tsx';
import { generateMission, getSystemAdvice } from './services/geminiService.ts';
import PillarChart from './components/PillarChart.tsx';
import GlitchText from './components/GlitchText.tsx';

// Moved SystemWindow outside to avoid re-creation on render and fix TS props issues
const SystemWindow: React.FC<{ children: React.ReactNode, className?: string, title?: string }> = ({ children, className = "", title }) => (
  <div className={`relative bg-[#0f172a]/90 border border-[#38bdf8]/50 shadow-system backdrop-blur-sm ${className}`}>
    {title && (
      <div className="absolute -top-3 left-4 px-2 bg-[#020617] border border-[#38bdf8]/50 text-[#38bdf8] text-[10px] font-orbitron font-bold tracking-widest uppercase">
        {title}
      </div>
    )}
    {children}
  </div>
);

// Moved StatRow outside to avoid re-creation on render and fix TS 'key' prop issue
const StatRow: React.FC<{ label: string, value: number }> = ({ label, value }) => (
  <div className="flex justify-between items-center py-1 border-b border-[#38bdf8]/10 last:border-0">
    <span className="text-gray-400 text-xs font-medium">{label}</span>
    <span className="text-white font-mono font-bold text-sm">{value}</span>
  </div>
);

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile>(INITIAL_USER);
  const [view, setView] = useState<AppView>('DASHBOARD');
  const [currentMission, setCurrentMission] = useState<{ exercises: Exercise[]; message: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAwake, setIsAwake] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [systemLogs, setSystemLogs] = useState<{ role: 'system' | 'user'; content: string }[]>([
    { role: 'system', content: 'SYSTEM INITIALIZED.' },
    { role: 'system', content: 'PLAYER BIOMETRICS SCANNED.' },
    { role: 'system', content: 'WELCOME, PLAYER.' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [systemLogs]);

  // Initial Awakening Animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAwake(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleStartMission = async () => {
    setIsLoading(true);
    const mission = await generateMission(user);
    setCurrentMission(mission);
    setSystemLogs(prev => [...prev, { role: 'system', content: 'DAILY QUEST GENERATED: ' + mission.message }]);
    setView('TRAINING');
    setIsLoading(false);
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;
    const msg = chatInput;
    setChatInput('');
    setSystemLogs(prev => [...prev, { role: 'user', content: msg }]);
    
    const advice = await getSystemAdvice(user, msg);
    setSystemLogs(prev => [...prev, { role: 'system', content: advice || "SYSTEM ERROR." }]);
  };

  if (!isAwake) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-black text-[#38bdf8] font-orbitron">
        <div className="text-center space-y-4 animate-pulse">
          <div className="text-2xl font-black tracking-[0.3em]">SYSTEM LOADING...</div>
          <div className="text-xs text-[#38bdf8]/50">SYNCHRONIZING NEURAL LINK</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col p-4 md:p-6 max-w-4xl mx-auto space-y-6 relative z-10">
      
      {/* Welcome Modal for new players */}
      {showWelcome && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <SystemWindow className="w-full max-w-md p-8 text-center space-y-6 border-2 border-[#38bdf8]">
            <h2 className="text-2xl font-orbitron font-black text-[#38bdf8] glow-cyan">WELCOME, PLAYER.</h2>
            <p className="text-sm text-gray-300">
              You have been chosen by the System. Your daily quest for physical evolution begins now.
              <br/><br/>
              <span className="text-xs text-gray-500">
                [ WARNING: Failure to complete daily quests may result in physical regression. ]
              </span>
            </p>
            <button 
              onClick={() => setShowWelcome(false)}
              className="w-full py-3 bg-[#38bdf8] text-black font-orbitron font-bold hover:bg-white transition-colors"
            >
              ACCEPT
            </button>
          </SystemWindow>
        </div>
      )}

      {/* Header / Top Bar */}
      <header className="flex justify-between items-center border-b border-[#38bdf8]/30 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-2 h-8 bg-[#38bdf8] shadow-[0_0_10px_#38bdf8]"></div>
          <div>
            <h1 className="text-xl font-orbitron font-bold text-white tracking-wider">APEX SYSTEM</h1>
            <p className="text-[9px] text-[#38bdf8] uppercase tracking-[0.3em]">Player Interface</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden md:block">
            <div className="text-[10px] text-gray-400 uppercase">Current Rank</div>
            <div className="font-orbitron text-[#f97316] font-bold">{user.rank}</div>
          </div>
          <button 
            onClick={() => setView(view === 'LOG' ? 'DASHBOARD' : 'LOG')}
            className={`p-2 border ${view === 'LOG' ? 'bg-[#38bdf8] text-black border-[#38bdf8]' : 'border-[#38bdf8]/50 text-[#38bdf8] hover:bg-[#38bdf8]/10'} transition-all`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
          </button>
        </div>
      </header>

      {/* Main Interface Layout */}
      <main className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Left Col: Player Status (Always visible on Desktop, Top on Mobile) */}
        <div className={`md:col-span-5 space-y-6 ${view !== 'DASHBOARD' ? 'hidden md:block' : ''}`}>
          
          {/* Status Window */}
          <SystemWindow title="STATUS" className="p-6">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-16 h-16 bg-[#020617] border border-[#38bdf8]/30 flex items-center justify-center">
                 <svg className="w-8 h-8 text-[#38bdf8]/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
              </div>
              <div className="flex-1 space-y-1">
                <div className="text-lg font-orbitron font-bold">{user.name}</div>
                <div className="text-xs text-gray-400">LEVEL {user.level}</div>
                <div className="w-full h-1.5 bg-[#1e293b] mt-1">
                  <div className="h-full bg-[#f97316]" style={{ width: `${(user.xp / 1000) * 100}%` }}></div>
                </div>
                <div className="text-[9px] text-right text-gray-500">{user.xp}/1000 XP</div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-[#38bdf8] font-bold">
                  <span>HP (RECOVERY)</span>
                  <span>{user.recoveryRate}%</span>
                </div>
                <div className="w-full h-2 bg-[#1e293b]">
                  <div className="h-full bg-[#ef4444]" style={{ width: `${user.recoveryRate}%` }}></div>
                </div>
              </div>
              
              <div className="pt-4 border-t border-[#38bdf8]/20 space-y-2">
                {Object.entries(user.pillars).map(([key, val]) => (
                  <StatRow key={key} label={PILLAR_LABELS[key as keyof typeof PILLAR_LABELS]} value={val as number} />
                ))}
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-[#38bdf8]/20">
               <div className="text-[10px] text-gray-500 mb-2 uppercase">Titles & Skills</div>
               {user.passiveSkills.length === 0 ? (
                 <div className="text-xs text-gray-600 italic">None acquired.</div>
               ) : (
                 <div className="flex flex-wrap gap-2">
                   {user.passiveSkills.map(s => (
                     <span key={s} className="px-2 py-0.5 bg-[#38bdf8]/10 text-[#38bdf8] text-[9px] border border-[#38bdf8]/30">{s}</span>
                   ))}
                 </div>
               )}
            </div>
          </SystemWindow>

          {/* Chart Window */}
          <SystemWindow title="EVALUATION" className="p-4 h-64">
            <PillarChart stats={user.pillars} />
          </SystemWindow>
        </div>

        {/* Right Col: Active View */}
        <div className="md:col-span-7 space-y-6">
          
          {/* Navigation Tabs */}
          <div className="flex gap-1 border-b border-[#38bdf8]/30">
            {['DASHBOARD', 'TRAINING'].map((t) => (
              <button 
                key={t}
                onClick={() => setView(t as AppView)}
                className={`px-4 py-2 text-xs font-orbitron font-bold transition-all ${
                  view === t 
                    ? 'text-[#38bdf8] border-b-2 border-[#38bdf8] bg-[#38bdf8]/5' 
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {t === 'TRAINING' ? 'QUESTS' : t}
              </button>
            ))}
          </div>

          {view === 'DASHBOARD' && (
            <div className="space-y-6 animate-fadeIn">
              <SystemWindow title="NOTIFICATIONS" className="p-6 flex items-center gap-4 border-l-4 border-l-[#f97316]">
                <div className="text-[#f97316] text-2xl font-black">!</div>
                <div>
                  <div className="text-[#38bdf8] font-bold text-sm">DAILY QUEST AVAILABLE</div>
                  <div className="text-gray-400 text-xs mt-1">
                    "Preparing the Vessel"<br/>
                    Complete the daily workout to earn XP and recover fatigue.
                  </div>
                </div>
                <button 
                  onClick={handleStartMission} 
                  disabled={isLoading}
                  className="ml-auto px-4 py-2 bg-[#38bdf8]/10 border border-[#38bdf8] text-[#38bdf8] text-xs font-bold hover:bg-[#38bdf8] hover:text-black transition-all"
                >
                  {isLoading ? 'GENERATING...' : 'ACCEPT'}
                </button>
              </SystemWindow>

              <SystemWindow title="SYSTEM LOG" className="p-4 h-[300px] flex flex-col">
                <div className="flex-1 overflow-y-auto space-y-2 font-mono text-xs pr-2">
                  {systemLogs.map((log, i) => (
                    <div key={i} className={`p-2 border-l-2 ${log.role === 'system' ? 'border-[#38bdf8] bg-[#38bdf8]/5' : 'border-[#f97316] bg-[#f97316]/5'}`}>
                      <span className={`font-bold ${log.role === 'system' ? 'text-[#38bdf8]' : 'text-[#f97316]'}`}>
                        [{log.role.toUpperCase()}]
                      </span> 
                      <span className="text-gray-300 ml-2">{log.content}</span>
                    </div>
                  ))}
                  <div ref={logEndRef} />
                </div>
                <div className="mt-4 flex gap-2 border-t border-[#38bdf8]/20 pt-2">
                  <input 
                    className="flex-1 bg-[#020617] border border-[#38bdf8]/30 text-white text-xs p-2 focus:border-[#38bdf8] outline-none"
                    placeholder="Enter command or report condition..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <button onClick={handleSendMessage} className="px-3 bg-[#38bdf8] text-black font-bold text-xs hover:bg-white">SEND</button>
                </div>
              </SystemWindow>
            </div>
          )}

          {view === 'TRAINING' && (
            <div className="animate-fadeIn">
              {!currentMission ? (
                <div className="flex flex-col items-center justify-center h-64 border border-dashed border-[#38bdf8]/30 bg-[#38bdf8]/5 space-y-4">
                  <div className="text-[#38bdf8] font-orbitron text-sm tracking-widest">NO ACTIVE QUEST</div>
                  <button onClick={handleStartMission} className="px-6 py-2 bg-[#38bdf8] text-black font-bold text-xs hover:scale-105 transition-transform">
                    GENERATE DAILY QUEST
                  </button>
                </div>
              ) : (
                <SystemWindow className="p-0 overflow-hidden border-2 border-[#38bdf8]">
                  <div className="bg-[#38bdf8] text-black p-3 flex justify-between items-center">
                    <h3 className="font-orbitron font-black text-lg">QUEST INFO</h3>
                    <div className="text-[10px] font-bold bg-black/20 px-2 py-1">DIFFICULTY: E</div>
                  </div>
                  
                  <div className="p-6 space-y-6">
                    <div className="space-y-2">
                      <div className="text-[#f97316] font-bold text-xs uppercase">Goal</div>
                      <p className="text-sm text-gray-300 italic">"{currentMission.message}"</p>
                    </div>

                    <div className="space-y-1">
                      {currentMission.exercises.map((ex, idx) => (
                        <div key={ex.id} className="flex items-center gap-4 p-3 bg-[#020617] border border-[#38bdf8]/20 group hover:border-[#38bdf8] transition-colors">
                          <div className="w-6 h-6 flex items-center justify-center border border-[#38bdf8] text-[#38bdf8] text-xs font-bold group-hover:bg-[#38bdf8] group-hover:text-black">
                            {idx + 1}
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-bold text-white group-hover:text-[#38bdf8]">{ex.name}</div>
                            <div className="text-[10px] text-gray-500">{PILLAR_LABELS[ex.pillar]}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-orbitron text-[#38bdf8] leading-none">{ex.reps}</div>
                            <div className="text-[8px] text-gray-500 uppercase">REPS / {ex.sets} SETS</div>
                          </div>
                          <div className="w-6 h-6 border border-gray-600 ml-2 cursor-pointer hover:bg-green-500 hover:border-green-500"></div>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-[#38bdf8]/20 pt-4">
                      <div className="text-[#f97316] text-[10px] font-bold uppercase mb-2">Warning</div>
                      <p className="text-xs text-gray-500">Incomplete quests will result in a penalty to recovery rate.</p>
                    </div>

                    <button 
                      onClick={() => {
                         setView('DASHBOARD');
                         setCurrentMission(null);
                         setUser(prev => ({ ...prev, xp: prev.xp + 100, pillars: { ...prev.pillars, mobility: prev.pillars.mobility + 1 } }));
                         setSystemLogs(prev => [...prev, { role: 'system', content: 'QUEST COMPLETE. REWARDS DISTRIBUTED.' }]);
                      }}
                      className="w-full py-3 bg-transparent border border-[#38bdf8] text-[#38bdf8] font-orbitron font-bold hover:bg-[#38bdf8] hover:text-black transition-all glow-cyan"
                    >
                      COMPLETE QUEST
                    </button>
                  </div>
                </SystemWindow>
              )}
            </div>
          )}

          {view === 'LOG' && (
             <SystemWindow title="FULL LOGS" className="h-[500px] flex flex-col p-4">
                <div className="flex-1 overflow-y-auto space-y-2 font-mono text-xs">
                  {systemLogs.map((log, i) => (
                    <div key={i} className="pb-2 border-b border-[#38bdf8]/10 mb-2">
                       <span className="text-[#38bdf8] opacity-50 text-[10px]">{new Date().toLocaleTimeString()}</span>
                       <div className={log.role === 'system' ? 'text-white' : 'text-gray-400'}>{log.content}</div>
                    </div>
                  ))}
                </div>
             </SystemWindow>
          )}

        </div>
      </main>
    </div>
  );
};

export default App;