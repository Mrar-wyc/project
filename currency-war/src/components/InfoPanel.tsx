import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { calculateActiveBonds } from '../utils/bondCalculator';
import { motion } from 'framer-motion';
import { CombatEngine } from '../engine/CombatEngine';

const InfoPanel: React.FC = () => {
  const { board, game, startCombat, endCombat } = useGameStore();
  const [tab, setTab] = useState<'bonds' | 'investments'>('bonds');

  const activeBonds = calculateActiveBonds([...board.onFieldSlots, ...board.offFieldSlots]);

  const handleSimulateCombat = () => {
    startCombat();
    
    if (board.onFieldSlots.filter(s => s !== null).length === 0) {
      setTimeout(() => endCombat(false), 500);
      return;
    }

    const engine = new CombatEngine();
    
    // completely flattened early game scaling to match 1-cost hero performance
    const enemyStats = {
      hp: 100 * Math.pow(1.05, game.node - 1),
      attack: 10 * Math.pow(1.05, game.node - 1),
      speed: 95
    };
    
    engine.init(
      board.onFieldSlots,
      board.offFieldSlots,
      [
        { ...enemyStats }, { ...enemyStats }, { ...enemyStats }, { ...enemyStats }
      ]
    );

    // Initialize UI Combat State
    const initStates: Record<string, { hp: number, maxHp: number }> = {};
    for (const [id, status] of engine.world.status.entries()) {
      const slotKey = engine.entityToSlot.get(id);
      if (slotKey) {
        initStates[slotKey] = { hp: status.hp, maxHp: status.maxHp };
      }
    }
    useGameStore.getState().initCombatState(initStates);

    engine.onAttack = () => {
      // Could trigger attack animation here if needed
    };
    
    engine.onDamage = (entityId, damage, hp) => {
      const slotKey = engine.entityToSlot.get(entityId);
      if (slotKey) {
        useGameStore.getState().updateCombatHp(slotKey, hp);
        useGameStore.getState().addDamageEvent(slotKey, damage);
      }
    };

    engine.onDeath = (entityId) => {
      const slotKey = engine.entityToSlot.get(entityId);
      if (slotKey) {
        useGameStore.getState().updateCombatHp(slotKey, 0);
      }
    };

    engine.onCombatEnd = (win) => {
      endCombat(win);
    };

    // run engine loop
    const interval = setInterval(() => {
      const isRunning = engine.tick();
      if (!isRunning) {
        clearInterval(interval);
      }
    }, 800); // Slowed down from 200ms to 800ms for better visibility
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

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar flex flex-col gap-2 min-h-0">
        {tab === 'bonds' && activeBonds.map(bond => {
          const isActive = !!bond.activeLevel;
          return (
            <div 
              key={bond.bondId} 
              className={`relative p-2 pl-4 clip-rhombus-reverse transition-all shrink-0 ${isActive ? 'bg-[rgba(212,168,83,0.1)] border-l-2 border-[var(--color-hsr-gold)]' : 'bg-[rgba(255,255,255,0.02)] border-l-2 border-[var(--color-hsr-muted)] grayscale opacity-60'}`}
            >
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
      <div className="shrink-0 pt-2">
        {game.phase === 'planning' ? (
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSimulateCombat}
            className="mt-2 relative group w-full py-3 bg-[var(--color-hsr-bg)] border border-[var(--color-hsr-gold)] text-[var(--color-hsr-gold)] font-bold tracking-widest overflow-hidden shrink-0"
          >
            <div className="absolute inset-0 bg-[var(--color-hsr-gold)] opacity-0 group-hover:opacity-20 transition-opacity" />
            开始战斗
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-[var(--color-hsr-cyan)] clip-rhombus animate-ping" />
          </motion.button>
        ) : game.phase === 'event' ? (
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => useGameStore.getState().nextNode()}
            className="mt-2 relative group w-full py-3 bg-[var(--color-hsr-purple)] border border-[var(--color-hsr-cyan)] text-[var(--color-hsr-cyan)] font-bold tracking-widest overflow-hidden shrink-0"
          >
            处理事件并继续
          </motion.button>
        ) : (
          <button disabled className="mt-2 w-full py-3 bg-[var(--color-hsr-bg)] border border-[var(--color-hsr-danger)] text-[var(--color-hsr-danger)] font-bold tracking-widest opacity-80 flex justify-center gap-2 items-center shrink-0">
            <div className="w-2 h-2 bg-[var(--color-hsr-danger)] rounded-full animate-pulse" />
            战斗中...
          </button>
        )}
      </div>
    </div>
  );
};

export default InfoPanel;