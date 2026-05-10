import React from 'react';
import { useGameStore } from '../store/gameStore';
import HeroCard from './HeroCard';
import { BadgeDollarSign } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const BenchPanel: React.FC = () => {
  const { bench, ui, selectSlot, sellHero, game } = useGameStore();

  return (
    <div className="w-full flex flex-col items-center justify-end pb-8">
      {/* 备战席卡槽区 */}
      <div className="glass-panel-hsr flex gap-4 justify-center p-4">
        {bench.slots.map((instance, index) => {
          const isSelected = ui.selectedSlot?.type === 'bench' && ui.selectedSlot?.index === index;
          return (
            <div key={index} className="relative">
              <HeroCard 
                instance={instance} 
                isSelected={isSelected}
                onClick={() => selectSlot('bench', index)}
                width="w-[80px]"
                height="h-[110px]"
                zoneType="bench"
                zoneIndex={index}
              />
              
              {/* 悬浮出售按钮 */}
              <AnimatePresence>
                {isSelected && instance && game.phase === 'planning' && (
                  <motion.button
                    initial={{ opacity: 0, y: 10, scale: 0.8 }}
                    animate={{ opacity: 1, y: -10, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.8 }}
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      sellHero(index); 
                      selectSlot('bench', index); 
                    }}
                    className="absolute -top-12 left-1/2 -translate-x-1/2 z-50 glass-panel-hsr px-4 py-1 flex items-center gap-2 bg-[rgba(255,77,77,0.2)] border-[var(--color-hsr-danger)] hover:bg-[var(--color-hsr-danger)] text-[var(--color-hsr-danger)] hover:text-white transition-colors"
                  >
                    <BadgeDollarSign size={14} />
                    <span className="font-bold text-xs">出售</span>
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BenchPanel;