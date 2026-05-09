import React, { useRef } from 'react';
import { HEROES } from '../data/heroes';
import { useGameStore, type HeroInstance } from '../store/gameStore';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { Coins } from 'lucide-react';

interface Props {
  instance?: HeroInstance | null;
  heroId?: string; // For shop
  isSold?: boolean; // For shop
  isSelected?: boolean;
  onClick?: () => void;
  className?: string;
  width?: string;
  height?: string;
  slotKey?: string; // For combat state binding
}

const HeroCard: React.FC<Props> = ({ 
  instance, 
  heroId,
  isSold,
  isSelected, 
  onClick, 
  className = '',
  width = 'w-24',
  height = 'h-32',
  slotKey
}) => {
  const combatState = useGameStore(state => slotKey ? state.combatState[slotKey] : undefined);
  const removeDamageEvent = useGameStore(state => state.removeDamageEvent);

  const cardRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useTransform(y, [-100, 100], [15, -15]);
  const rotateY = useTransform(x, [-100, 100], [-15, 15]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    x.set(e.clientX - cx);
    y.set(e.clientY - cy);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  if (isSold) {
    return (
      <div className={`${width} ${height} glass-panel-hsr opacity-30 flex items-center justify-center relative overflow-hidden rounded-sm ${className}`}>
        <div className="absolute inset-0 bg-[var(--color-hsr-bg)] z-0" />
        <div className="z-10 text-[var(--color-hsr-text)] opacity-50 font-bold rotate-[-30deg] border-y border-[var(--color-hsr-text)] px-4 py-1 tracking-widest">已售出</div>
      </div>
    );
  }

  // Determine actual hero data
  const targetHeroId = instance ? instance.heroId : heroId;
  if (!targetHeroId) {
    // Empty slot (Holographic placeholder)
    return (
      <div 
        onClick={onClick}
        className={`${width} ${height} border border-dashed border-[var(--color-hsr-cyan)] opacity-40 rounded-sm cursor-pointer animate-breathing flex items-center justify-center ${className} ${isSelected ? 'ring-2 ring-[var(--color-hsr-gold)] opacity-100 animate-none' : ''}`}
      >
        <div className="w-1/2 h-1/2 border-[0.5px] border-[var(--color-hsr-cyan)] rotate-45 opacity-30" />
      </div>
    );
  }

  const hero = HEROES.find(h => h.id === targetHeroId);
  if (!hero) return null;

  return (
    <div className={`card-3d-container ${width} ${height} ${className}`} style={{ perspective: 1000 }}>
      <motion.div 
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={onClick}
        style={{ rotateX, rotateY }}
        whileHover={{ scale: 1.05, zIndex: 10, boxShadow: '0 0 20px rgba(212,168,83,0.5)' }}
        className={`card-3d-inner w-full h-full relative cursor-pointer glass-panel-hsr bg-[var(--color-hsr-bg)] rounded-sm overflow-hidden flex flex-col justify-between p-1 transition-all ${isSelected ? 'ring-2 ring-[var(--color-hsr-gold)]' : ''}`}
      >
        {/* Background gradient based on cost/rarity */}
        <div className={`absolute inset-0 opacity-20 pointer-events-none ${hero.cost >= 4 ? 'bg-gradient-to-t from-[var(--color-hsr-purple)] to-transparent' : 'bg-gradient-to-t from-[var(--color-hsr-cyan)] to-transparent'}`} />

        {/* Cost Hexagon / Rhombus */}
        <div className="absolute top-0 left-0 bg-[var(--color-hsr-gold)] text-[var(--color-hsr-bg)] font-bold text-xs px-2 py-0.5 clip-rhombus z-10 flex items-center gap-0.5 shadow-md">
          {hero.cost}<Coins size={10}/>
        </div>

        {/* Stars */}
        {instance && (
          <div className="absolute top-1 right-1 flex flex-col gap-0.5 z-10">
            {Array(instance.star).fill(0).map((_, i) => (
              <div key={i} className="w-2 h-2 clip-rhombus bg-[var(--color-hsr-gold)] shadow-[0_0_5px_var(--color-hsr-gold)]" />
            ))}
          </div>
        )}

        <div className="flex-1" />

        {/* Info */}
        <div className="z-10 relative">
          <div className="text-center font-bold text-sm tracking-wider text-[var(--color-hsr-title)] drop-shadow-md mb-1">{hero.name}</div>
          <div className="flex flex-wrap gap-0.5 justify-center">
            {hero.traits.map(t => (
              <span key={t} className="text-[9px] bg-[rgba(255,255,255,0.1)] px-1 rounded-sm text-[var(--color-hsr-text)] whitespace-nowrap">
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Combat HP Bar */}
        {combatState && (
          <div className="absolute bottom-0 left-0 w-full h-1.5 bg-[rgba(0,0,0,0.5)] z-20">
            <div 
              className="h-full bg-[var(--color-hsr-danger)] transition-all duration-200"
              style={{ width: `${Math.max(0, (combatState.hp / combatState.maxHp) * 100)}%` }}
            />
          </div>
        )}

        {/* Damage Floating Text */}
        <div className="absolute top-1/4 left-0 w-full h-full pointer-events-none z-30 flex items-center justify-center">
          <AnimatePresence>
            {combatState?.damageEvents.map((evt) => (
              <motion.div
                key={evt.id}
                initial={{ opacity: 1, y: 0, scale: 0.5 }}
                animate={{ opacity: 1, y: -40, scale: 1.2 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                onAnimationComplete={() => removeDamageEvent(slotKey!, evt.id)}
                className="absolute text-xl font-black text-white drop-shadow-[0_0_5px_rgba(220,38,38,1)]"
                style={{ textShadow: '2px 2px 0 #000' }}
              >
                -{Math.round(evt.amount)}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

      </motion.div>
    </div>
  );
};

export default HeroCard;