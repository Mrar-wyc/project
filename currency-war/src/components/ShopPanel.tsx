import React from 'react';
import { useGameStore } from '../store/gameStore';
import HeroCard from './HeroCard';

const ShopPanel: React.FC = () => {
  const { shop, player, buyHero } = useGameStore();

  return (
    <div className="glass-panel-hsr flex-1 flex flex-col p-4 relative overflow-hidden">
      {/* 扫光动效背景 */}
      <div className="scan-line pointer-events-none" />

      <h2 className="text-lg font-bold text-[var(--color-hsr-title)] mb-3 tracking-widest flex items-center gap-2">
        <span className="w-1.5 h-4 bg-[var(--color-hsr-gold)] clip-rhombus" />
        招募商店
      </h2>
      
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