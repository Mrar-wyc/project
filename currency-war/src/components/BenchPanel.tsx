import React from 'react';
import { useGameStore } from '../store/gameStore';
import HeroCard from './HeroCard';
import { RefreshCw, ArrowUpCircle, BadgeDollarSign } from 'lucide-react';
import { motion } from 'framer-motion';

const BenchPanel: React.FC = () => {
  const { bench, ui, player, shop, selectSlot, sellHero, refreshShop, buyExp } = useGameStore();

  return (
    <div className="glass-panel-hsr w-full h-[140px] flex items-center px-6 gap-8">
      {/* 备战席卡槽区 */}
      <div className="flex-1 flex gap-3 justify-center border-r border-[var(--color-hsr-muted)] pr-8">
        {bench.slots.map((instance, index) => (
          <HeroCard 
            key={index} 
            instance={instance} 
            isSelected={ui.selectedSlot?.type === 'bench' && ui.selectedSlot?.index === index}
            onClick={() => selectSlot('bench', index)}
            width="w-[80px]"
            height="h-[110px]"
          />
        ))}
      </div>

      {/* 右侧操作区：出售、刷新、购买经验 */}
      <div className="w-[280px] flex flex-col gap-2">
        <div className="flex gap-2">
          {/* 出售按钮 */}
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => { 
              e.stopPropagation(); 
              if (ui.selectedSlot?.type === 'bench') {
                sellHero(ui.selectedSlot.index); 
                selectSlot('bench', ui.selectedSlot.index); 
              }
            }}
            disabled={ui.selectedSlot?.type !== 'bench' || !bench.slots[ui.selectedSlot.index]}
            className="flex-1 h-10 flex items-center bg-[rgba(255,77,77,0.1)] border border-[var(--color-hsr-danger)] disabled:opacity-30 disabled:grayscale transition-all cursor-pointer group"
          >
            <div className="w-10 h-full bg-[var(--color-hsr-danger)] clip-hexagon flex items-center justify-center text-white mr-2">
              <BadgeDollarSign size={18} />
            </div>
            <span className="text-[var(--color-hsr-danger)] font-bold tracking-widest text-sm">出售</span>
          </motion.button>
        </div>

        <div className="flex gap-2">
          {/* 刷新按钮 */}
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={refreshShop}
            disabled={player.gold < shop.refreshCost}
            className="flex-1 h-10 flex items-center bg-[rgba(78,226,236,0.1)] border border-[var(--color-hsr-cyan)] disabled:opacity-30 disabled:grayscale transition-all cursor-pointer group"
          >
            <div className="w-10 h-full bg-[var(--color-hsr-cyan)] clip-hexagon flex items-center justify-center text-[var(--color-hsr-bg)] mr-2 group-hover:shadow-[0_0_10px_var(--color-hsr-cyan)] transition-shadow">
              <RefreshCw size={16} />
            </div>
            <span className="text-[var(--color-hsr-cyan)] font-bold tracking-wider text-sm flex items-center gap-1">
              刷新 <span className="text-[10px] opacity-80">({shop.refreshCost})</span>
            </span>
          </motion.button>

          {/* 购买经验按钮 */}
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={buyExp}
            disabled={player.gold < 4 || player.level >= 10}
            className="flex-1 h-10 flex items-center bg-[rgba(212,168,83,0.1)] border border-[var(--color-hsr-gold)] disabled:opacity-30 disabled:grayscale transition-all cursor-pointer group"
          >
            <div className="w-10 h-full bg-[var(--color-hsr-gold)] clip-hexagon flex items-center justify-center text-[var(--color-hsr-bg)] mr-2 group-hover:shadow-[0_0_10px_var(--color-hsr-gold)] transition-shadow">
              <ArrowUpCircle size={16} />
            </div>
            <span className="text-[var(--color-hsr-gold)] font-bold tracking-wider text-sm flex items-center gap-1">
              买经验 <span className="text-[10px] opacity-80">(4)</span>
            </span>
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default BenchPanel;