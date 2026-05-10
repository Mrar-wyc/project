import React from 'react';
import { useGameStore } from '../store/gameStore';
import HeroCard from './HeroCard';
import { motion } from 'framer-motion';

const BattleBoard: React.FC = () => {
  const { board, ui, selectSlot, player, game } = useGameStore();

  const boardCount = board.onFieldSlots.filter(s => s !== null).length + board.offFieldSlots.filter(s => s !== null).length;

  return (
    <div className="w-full h-full flex flex-col justify-center items-center relative">
      
      {/* 人口与视界特效 */}
      <div className="absolute top-0 right-0 glass-panel-hsr clip-bevel-tl-br px-6 py-2 border-[var(--color-hsr-cyan)] text-[var(--color-hsr-cyan)] font-bold z-20 shadow-[0_0_15px_rgba(78,226,236,0.2)]">
        上阵核心: {boardCount} / {player.level}
      </div>

      {/* 透视全息网格地面 */}
      <div 
        className="absolute bottom-[20%] w-[120%] h-[60%] border-t border-[var(--color-hsr-cyan)] opacity-20 pointer-events-none"
        style={{ 
          perspective: 1000, 
          transform: 'rotateX(70deg)', 
          backgroundImage: 'linear-gradient(var(--color-hsr-cyan) 1px, transparent 1px), linear-gradient(90deg, var(--color-hsr-cyan) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }}
      />

      {/* 棋盘主区 */}
      <div className="relative z-10 flex flex-col gap-8 mt-4">
        
        {/* 敌方阵容 (仅在战斗中显示) */}
        {game.phase === 'combat' && (
          <div className="flex flex-col items-center mb-8">
            <span className="text-[var(--color-hsr-danger)] text-sm tracking-widest mb-2 font-bold drop-shadow-[0_0_5px_rgba(220,38,38,0.8)]">TARGETS / 敌对目标</span>
            <div className="flex gap-6 justify-center">
              {[0, 1, 2, 3].map((index) => (
                <div key={`enemy-${index}`} className="opacity-80 scale-90 grayscale-[50%] sepia-[30%] hue-rotate-[-30deg]">
                  <HeroCard 
                    heroId="h4" // Placeholder enemy visual
                    slotKey={`enemy-${index}`} 
                  />
                </div>
              ))}
            </div>
            {/* 对峙光效分界 */}
            <div className="w-[150%] h-[1px] bg-gradient-to-r from-transparent via-[var(--color-hsr-danger)] to-transparent mt-8 opacity-50" />
          </div>
        )}

        {/* 前台主战位 (4槽) */}
        <div className="flex flex-col items-center">
          <span className="text-[var(--color-hsr-cyan)] text-sm tracking-widest mb-2 font-bold drop-shadow-[0_0_5px_rgba(78,226,236,0.5)]">ON-FIELD / 前台作战</span>
          <div className="flex gap-6 justify-center">
            {board.onFieldSlots.map((instance, index) => (
              <motion.div key={`onfield-${index}`} whileHover={{ y: -5 }}>
                <HeroCard 
                  instance={instance} 
                  slotKey={`player-onField-${index}`}
                  isSelected={ui.selectedSlot?.type === 'onField' && ui.selectedSlot?.index === index}
                  onClick={() => selectSlot('onField', index)}
                  zoneType="onField"
                  zoneIndex={index}
                />
              </motion.div>
            ))}
          </div>
        </div>

        {/* 分界线 */}
        <div className="w-[120%] h-[2px] bg-gradient-to-r from-transparent via-[var(--color-hsr-cyan)] to-transparent opacity-40 -ml-[10%] my-4" />

        {/* 后台支援位 (6槽) */}
        <div className="flex flex-col items-center">
          <span className="text-[var(--color-hsr-muted)] text-xs tracking-widest mb-2 font-bold opacity-80">OFF-FIELD / 后台光环与追击</span>
          <div className="flex gap-4 justify-center scale-90"> {/* 缩小模型 */}
            {board.offFieldSlots.map((instance, index) => (
              <motion.div key={`offfield-${index}`} whileHover={{ y: -5 }}>
                <HeroCard 
                  instance={instance} 
                  slotKey={`player-offField-${index}`}
                  isSelected={ui.selectedSlot?.type === 'offField' && ui.selectedSlot?.index === index}
                  onClick={() => selectSlot('offField', index)}
                  zoneType="offField"
                  zoneIndex={index}
                />
              </motion.div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};

export default BattleBoard;