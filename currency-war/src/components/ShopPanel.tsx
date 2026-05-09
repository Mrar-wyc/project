import React from 'react';
import { useGameStore } from '../store/gameStore';
import HeroCard from './HeroCard';
import { RefreshCcw, Coins } from 'lucide-react';

const ShopPanel: React.FC = () => {
  const { shop, player, buyHero, refreshShop, game } = useGameStore();

  return (
    <div className="glass-panel-hsr flex-1 flex flex-col p-4 relative overflow-hidden">
      {/* 扫光动效背景 */}
      <div className="scan-line pointer-events-none" />

      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-bold text-[var(--color-hsr-title)] tracking-widest flex items-center gap-2">
          <span className="w-1.5 h-4 bg-[var(--color-hsr-gold)] clip-rhombus" />
          招募商店
        </h2>
        <button 
          onClick={refreshShop}
          disabled={player.gold < shop.refreshCost || game.phase !== 'planning'}
          className="glass-panel-hsr px-3 py-1 hover:bg-[rgba(255,255,255,0.1)] transition-colors active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group flex items-center gap-1 border-[var(--color-hsr-cyan)]"
        >
          <RefreshCcw size={14} className="text-[var(--color-hsr-cyan)] group-hover:rotate-180 transition-transform duration-500" />
          <span className="text-[var(--color-hsr-cyan)] font-bold tracking-widest text-xs">刷新</span>
          <span className="text-[var(--color-hsr-gold)] text-[10px] font-mono font-bold ml-1">{shop.refreshCost}<Coins size={8} className="inline ml-0.5" /></span>
        </button>
      </div>
      
      <div className="flex-1 flex flex-wrap gap-2 justify-center content-start">
        {shop.cards.map((heroId, index) => (
          <HeroCard
            key={`${index}-${heroId}`}
            heroId={heroId || undefined}
            isSold={!heroId}
            width="w-[85px]"
            height="h-[120px]"
            onClick={() => heroId && buyHero(index)}
            className={player.gold >= (heroId ? 1 : 999) ? '' : 'opacity-50'}
          />
        ))}
      </div>
    </div>
  );
};

export default ShopPanel;