'use client';

import { motion } from 'framer-motion';
import { 
  Sword,
  Crown,
  Shield as ShieldIcon,
  Hand,
  Glasses,
  Footprints,
  Settings,
  Bell,
  Volume2,
  Sparkles,
  User,
  AlertTriangle,
  HeartPulse
} from 'lucide-react';
import { GlassPanel } from '@/components/ui/CyberFrame';
import { useAppStore } from '@/store/useAppStore';
import type { Equipment } from '@/types';

const slotIcons: Record<Equipment['slot'], React.ElementType> = {
  weapon: Sword,
  head: Crown,
  chest: ShieldIcon,
  hands: Hand,
  accessory: Glasses,
  boots: Footprints,
};

const slotLabels: Record<Equipment['slot'], string> = {
  weapon: 'WEAPON',
  head: 'HEAD',
  chest: 'CHEST',
  hands: 'HANDS',
  accessory: 'ACCESSORY',
  boots: 'BOOTS',
};

interface EquipmentSlotProps {
  slot: Equipment['slot'];
  equipment?: Equipment;
}

function EquipmentSlot({ slot, equipment }: EquipmentSlotProps) {
  const Icon = slotIcons[slot];
  const isEquipped = !!equipment?.equipped;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`
        relative p-4 bg-transparent border border-white/30 transition-all duration-300 cursor-pointer
        shadow-[0_0_16px_rgba(255,255,255,0.14)]
        ${isEquipped 
          ? 'border-yellow-500/40 shadow-[0_0_20px_rgba(255,215,0,0.15)]'
          : 'hover:border-neon-blue/35'
        }
      `}
    >
      <div className="flex flex-col items-center gap-2">
        <span className="text-2xl">{equipment?.equipped ? equipment.icon : ''}</span>
        {!equipment?.equipped && (
          <Icon className="w-8 h-8 text-white/30" />
        )}
        <span className="font-display text-xs uppercase tracking-wider text-white/60">
          {slotLabels[slot]}
        </span>
        {equipment?.equipped ? (
          <>
            <span className="text-white text-sm font-body text-center">{equipment.name}</span>
            <span className="equipment-bonus text-xs font-mono">{equipment.bonus}</span>
          </>
        ) : (
          <span className="text-white/30 text-sm">None</span>
        )}
      </div>
    </motion.div>
  );
}

function DebuffCard({ debuff }: { debuff: any }) {
  return (
     <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-lg flex items-start gap-4">
        <div className="bg-red-500/20 p-2 rounded-full">
            <AlertTriangle className="w-5 h-5 text-red-500" />
        </div>
        <div>
            <h4 className="text-white font-display text-sm uppercase tracking-wider">{debuff.name}</h4>
            <p className="text-white/60 text-xs mb-2">{debuff.description}</p>
             <div className="flex flex-wrap gap-2">
                {debuff.affectedExercises?.map((ex: string) => (
                    <span key={ex} className="text-[10px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded border border-red-500/20">
                        AVOID: {ex}
                    </span>
                ))}
            </div>
        </div>
     </div>
  );
}

interface ToggleSwitchProps {
  enabled: boolean;
  onToggle: () => void;
  label: string;
  description: string;
  icon: React.ReactNode;
}

function ToggleSwitch({ enabled, onToggle, label, description, icon }: ToggleSwitchProps) {
  return (
    <div className="bg-transparent border border-white/30 flex items-center justify-between p-4 transition-all duration-300 shadow-[0_0_16px_rgba(255,255,255,0.12)] hover:border-neon-blue/35">
      <div className="flex items-center gap-3">
        <div className="text-white/60">{icon}</div>
        <div>
          <div className="text-white font-body">{label}</div>
          <div className="text-white/40 text-sm">{description}</div>
        </div>
      </div>
      <button
        onClick={onToggle}
        className={`
          relative w-12 h-6 rounded-full transition-all duration-300
          ${enabled ? 'bg-neon-blue/30' : 'bg-white/10'}
        `}
      >
        <motion.div
          animate={{ x: enabled ? 24 : 2 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className={`
            absolute top-1 w-4 h-4 rounded-full transition-colors
            ${enabled ? 'bg-neon-blue shadow-[0_0_10px_rgba(0,212,255,0.5)]' : 'bg-white/50'}
          `}
        />
      </button>
    </div>
  );
}

export function ProfilePage() {
  const user = useAppStore((state) => state.user);
  const equipment = useAppStore((state) => state.equipment);
  const particlesEnabled = useAppStore((state) => state.particlesEnabled);
  const soundEnabled = useAppStore((state) => state.soundEnabled);
  const notificationsEnabled = useAppStore((state) => state.notificationsEnabled);
  const toggleParticles = useAppStore((state) => state.toggleParticles);
  const toggleSound = useAppStore((state) => state.toggleSound);
  const toggleNotifications = useAppStore((state) => state.toggleNotifications);

  if (!user) return null;

  const getEquipmentForSlot = (slot: Equipment['slot']) => 
    equipment.find(e => e.slot === slot && e.equipped);

  const slots: Equipment['slot'][] = ['weapon', 'head', 'chest', 'hands', 'accessory', 'boots'];

  return (
    <div className="pt-24 pb-8 px-4 max-w-7xl mx-auto">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-display text-3xl font-bold text-white mb-8"
      >
        Hunter Profile
      </motion.h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">         {/* STATUS PANEL - Debuffs (New) */}
         {user.debuffs && user.debuffs.length > 0 && (
            <GlassPanel className="p-6 lg:col-span-2 border-red-500/30 bg-red-950/20">
                 <div className="flex items-center gap-2 mb-4 text-red-400">
                    <HeartPulse className="w-5 h-5" />
                    <h3 className="font-display text-lg uppercase tracking-wider">Active Debuffs (Injuries/Limitations)</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {user.debuffs.map((debuff, i) => (
                        <DebuffCard key={i} debuff={debuff} />
                    ))}
                </div>
            </GlassPanel>
         )}
        {/* Profile Info */}
        <GlassPanel className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 rounded-full bg-shadow-600 border-2 border-neon-blue/30 flex items-center justify-center">
              <User className="w-10 h-10 text-white/60" />
            </div>
            <div>
              <h2 className="font-display text-2xl font-bold text-white">{user.name}</h2>
              <div className="text-white/60 font-body">
                Level {user.level} • {user.rank}-Rank Hunter
              </div>
              <div className="text-white/40 text-sm font-mono mt-1">
                {user.totalWorkouts} workouts completed
              </div>
            </div>
          </div>

          {/* Physical Stats */}
          <div className="bg-transparent border border-white/30 grid grid-cols-3 gap-4 p-4 shadow-[0_0_16px_rgba(255,255,255,0.12)]">
            <div className="text-center">
              <div className="text-white/40 text-xs uppercase mb-1">Height</div>
              <div className="text-white font-display">{user.height} cm</div>
            </div>
            <div className="text-center border-x border-white/10">
              <div className="text-white/40 text-xs uppercase mb-1">Weight</div>
              <div className="text-white font-display">{user.weight} kg</div>
            </div>
            <div className="text-center">
              <div className="text-white/40 text-xs uppercase mb-1">Age</div>
              <div className="text-white font-display">{user.age}</div>
            </div>
          </div>
        </GlassPanel>

        {/* Equipment Grid */}
        <GlassPanel className="p-6">
          <h3 className="font-display text-lg uppercase tracking-wider text-white/80 mb-4">
            Equipment
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {slots.map((slot) => (
              <EquipmentSlot
                key={slot}
                slot={slot}
                equipment={getEquipmentForSlot(slot)}
              />
            ))}
          </div>
        </GlassPanel>

        {/* Settings */}
        <GlassPanel className="p-6 lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <Settings className="w-5 h-5 text-white/60" />
            <h3 className="font-display text-lg uppercase tracking-wider text-white">
              Settings
            </h3>
          </div>

          <div className="space-y-3">
            <ToggleSwitch
              enabled={notificationsEnabled}
              onToggle={toggleNotifications}
              label="Notifications"
              description="Receive quest reminders and level up alerts"
              icon={<Bell className="w-5 h-5" />}
            />
            <ToggleSwitch
              enabled={soundEnabled}
              onToggle={toggleSound}
              label="Sound Effects"
              description="Play sounds for achievements and level ups"
              icon={<Volume2 className="w-5 h-5" />}
            />
            <ToggleSwitch
              enabled={particlesEnabled}
              onToggle={toggleParticles}
              label="Particle Effects"
              description="Show animated background particles"
              icon={<Sparkles className="w-5 h-5" />}
            />
          </div>
        </GlassPanel>
      </div>
    </div>
  );
}
