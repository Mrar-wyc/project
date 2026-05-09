import React from 'react';
import { useGameStore } from '../store/gameStore';
import HeroCard from './HeroCard';
import { motion } from 'framer-motion';

const BattleBoard: React.FC = () => {
  const { board, ui, selectSlot, player } = useGameStore();

  const boardCount = board.slots.filter(s => s !== null).length;

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

      {/* 棋盘主区 (2x4) */}
      <div className="relative z-10 flex flex-col gap-12 mt-10">
        
        {/* 前排 */}
        <div className="flex flex-col items-center">
          <span className="text-[var(--color-hsr-muted)] text-sm tracking-widest mb-2 font-bold">FRONT LINE / 前排防线</span>
          <div className="flex gap-6 justify-center">
            {board.slots.slice(0, 4).map((instance, index) => (
              <motion.div key={index} whileHover={{ y: -5 }}>
                <HeroCard 
                  instance={instance} 
                  isSelected={ui.selectedSlot?.type === 'board' && ui.selectedSlot?.index === index}
                  onClick={() => selectSlot('board', index)}
                />
              </motion.div>
            ))}
          </div>
        </div>

        {/* 分界线 */}
        <div className="w-[120%] h-[2px] bg-gradient-to-r from-transparent via-[var(--color-hsr-cyan)] to-transparent opacity-40 -ml-[10%]" />

        {/* 后排 */}
        <div className="flex flex-col items-center">
          <span className="text-[var(--color-hsr-muted)] text-sm tracking-widest mb-2 font-bold">BACK LINE / 后排支援</span>
          <div className="flex gap-6 justify-center">
            {board.slots.slice(4, 8).map((instance, index) => (
              <motion.div key={index + 4} whileHover={{ y: -5 }}>
                <HeroCard 
                  instance={instance} 
                  isSelected={ui.selectedSlot?.type === 'board' && ui.selectedSlot?.index === index + 4}
                  onClick={() => selectSlot('board', index + 4)}
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