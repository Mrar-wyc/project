import React from 'react';
import { useGameStore } from '../store/gameStore';
import { Heart, Coins, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// 数值脉冲动画组件
const AnimatedNumber: React.FC<{ value: number, prefix?: string }> = ({ value, prefix = '' }) => {
  return (
    <div className="relative inline-block">
      <AnimatePresence mode="popLayout">
        <motion.span
          key={value}
          initial={{ opacity: 0, y: 10, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.8 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="inline-block relative z-10"
        >
          {prefix}{value}
        </motion.span>
      </AnimatePresence>
      {/* 脉冲光圈 */}
      <motion.div
        key={`pulse-${value}`}
        initial={{ opacity: 0.8, scale: 1 }}
        animate={{ opacity: 0, scale: 1.5 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="absolute inset-0 rounded-full bg-[var(--color-hsr-cyan)] blur-sm z-0"
      />
    </div>
  );
};

const TopBar: React.FC = () => {
  const { player, game } = useGameStore();

  return (
    <div className="absolute top-4 left-0 w-full flex justify-between px-8 z-20 pointer-events-none">
      {/* 左侧：生命值与回合信息 */}
      <div className="flex gap-4 pointer-events-auto">
        <div className="glass-panel-hsr clip-bevel-tl-br px-6 py-2 flex items-center gap-3">
          <Heart size={20} className="text-[var(--color-hsr-danger)] drop-shadow-[0_0_5px_rgba(255,77,77,0.8)]" />
          <span className="text-[var(--color-hsr-danger)] font-bold text-xl font-mono tracking-wider">
            <AnimatedNumber value={player.hp} /> / {player.maxHp}
          </span>
        </div>
        
        <div className="glass-panel-hsr clip-bevel-tl-br px-6 py-2 flex items-center gap-2 border-[var(--color-hsr-cyan)]">
          <span className="text-[var(--color-hsr-cyan)] font-bold tracking-widest text-sm uppercase">
            ROUND {game.node} / {game.plane * 5}
          </span>
        </div>
      </div>

      {/* 右侧：经济与等级 */}
      <div className="flex gap-4 pointer-events-auto items-center">
        <div className="glass-panel-hsr clip-bevel-tl-br px-6 py-2 flex items-center gap-3 bg-[rgba(212,168,83,0.1)]">
          <Coins size={20} className="text-[var(--color-hsr-gold)]" />
          <span className="text-[var(--color-hsr-gold)] font-bold text-xl font-mono">
            <AnimatedNumber value={player.gold} />
          </span>
        </div>

        <button 
          onClick={useGameStore.getState().buyExp}
          disabled={player.gold < 4 || player.level >= 10 || game.phase !== 'planning'}
          className="glass-panel-hsr px-4 py-2 hover:bg-[rgba(255,255,255,0.1)] transition-colors active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group flex items-center gap-2 border-[var(--color-hsr-cyan)]"
        >
          <span className="text-[var(--color-hsr-cyan)] font-bold tracking-widest text-sm">购买经验</span>
          <span className="text-[var(--color-hsr-gold)] text-xs font-mono font-bold">4<Coins size={10} className="inline ml-0.5" /></span>
        </button>

        <div className="glass-panel-hsr clip-bevel-tl-br px-6 py-2 flex items-center gap-3">
          <Zap size={20} className="text-[var(--color-hsr-cyan)]" />
          <span className="text-[var(--color-hsr-cyan)] font-bold text-xl font-mono">
            LV.<AnimatedNumber value={player.level} />
          </span>
          <span className="text-[var(--color-hsr-muted)] text-xs ml-2">
            ({player.xp} EXP)
          </span>
        </div>
      </div>
    </div>
  );
};

export default TopBar;