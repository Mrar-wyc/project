import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { calculateActiveBonds } from '../utils/bondCalculator';
import { motion } from 'framer-motion';

const InfoPanel: React.FC = () => {
  const { board, game, startCombat, endCombat } = useGameStore();
  const [tab, setTab] = useState<'bonds' | 'investments'>('bonds');

  const activeBonds = calculateActiveBonds(board.slots);

  const handleSimulateCombat = () => {
    startCombat();
    setTimeout(() => {
      const win = Math.random() > 0.3; 
      endCombat(win);
    }, 2000);
  };

  return (
    <div className="glass-panel-hsr flex-1 flex flex-col p-4 relative">
      <div className="flex border-b border-[var(--color-hsr-muted)] mb-4">
        <button 
          className={`flex-1 pb-2 font-bold tracking-widest transition-colors relative ${tab === 'bonds' ? 'text-[var(--color-hsr-gold)]' : 'text-[var(--color-hsr-text)] opacity-60 hover:opacity-100'}`}
          onClick={() => setTab('bonds')}
        >
          羁绊
          {tab === 'bonds' && <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 w-full h-[2px] bg-[var(--color-hsr-gold)]" />}
        </button>
        <button 
          className={`flex-1 pb-2 font-bold tracking-widest transition-colors relative ${tab === 'investments' ? 'text-[var(--color-hsr-cyan)]' : 'text-[var(--color-hsr-text)] opacity-60 hover:opacity-100'}`}
          onClick={() => setTab('investments')}
        >
          策略
          {tab === 'investments' && <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 w-full h-[2px] bg-[var(--color-hsr-cyan)]" />}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar flex flex-col gap-2">
        {tab === 'bonds' && activeBonds.map(bond => {
          const isActive = !!bond.activeLevel;
          return (
            <div 
              key={bond.bondId} 
              className={`relative p-2 pl-4 clip-rhombus-reverse transition-all ${isActive ? 'bg-gradient-to-r from-[rgba(212,168,83,0.2)] to-transparent border-l-2 border-[var(--color-hsr-gold)]' : 'bg-[rgba(255,255,255,0.02)] border-l-2 border-[var(--color-hsr-muted)] grayscale opacity-60'}`}
            >
              {isActive && <div className="scan-line opacity-30 pointer-events-none" />}
              <div className="flex justify-between items-center">
                <span className={`font-bold ${isActive ? 'text-[var(--color-hsr-title)] drop-shadow-[0_0_2px_rgba(255,255,255,0.8)]' : ''}`}>{bond.name}</span>
                <div className={`clip-hexagon px-2 py-0.5 text-xs font-bold ${isActive ? 'bg-[var(--color-hsr-gold)] text-[var(--color-hsr-bg)]' : 'bg-[var(--color-hsr-muted)]'}`}>
                  {bond.count} / {bond.nextLevelCount || bond.activeLevel?.count}
                </div>
              </div>
              <div className="text-[10px] text-[var(--color-hsr-text)] mt-1 opacity-80 leading-tight">
                {bond.activeLevel ? bond.activeLevel.description : `还需 ${bond.nextLevelCount! - bond.count} 名激活`}
              </div>
            </div>
          );
        })}
      </div>

      {/* 动态发光脉冲按钮 */}
      {game.phase === 'planning' ? (
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSimulateCombat}
          className="mt-4 relative group w-full py-3 bg-[var(--color-hsr-bg)] border border-[var(--color-hsr-gold)] text-[var(--color-hsr-gold)] font-bold tracking-widest overflow-hidden"
        >
          <div className="absolute inset-0 bg-[var(--color-hsr-gold)] opacity-0 group-hover:opacity-20 transition-opacity" />
          <div className="absolute top-0 left-0 w-full h-full scan-line pointer-events-none group-hover:opacity-100 opacity-0" />
          开始战斗
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-[var(--color-hsr-cyan)] clip-rhombus animate-ping" />
        </motion.button>
      ) : (
        <button disabled className="mt-4 w-full py-3 bg-[var(--color-hsr-bg)] border border-[var(--color-hsr-danger)] text-[var(--color-hsr-danger)] font-bold tracking-widest opacity-80 flex justify-center gap-2 items-center">
          <div className="w-2 h-2 bg-[var(--color-hsr-danger)] rounded-full animate-pulse" />
          战斗中...
        </button>
      )}
    </div>
  );
};

export default InfoPanel;