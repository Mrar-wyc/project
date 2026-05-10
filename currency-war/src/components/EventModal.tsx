import React from 'react';
import { useGameStore } from '../store/gameStore';

const STRATEGIES = [
  {
    id: 'prism_cut_costs',
    name: '降本增效 (棱镜)',
    description: '瞬间提供10枚金币并将利息上限拉升至9。',
    color: 'var(--color-hsr-gold)',
    rarity: 'prism'
  },
  {
    id: 'silver_market',
    name: '市场干预 (白银)',
    description: '提供后续节点刷新免费(简化：直接获得3次刷新等价的6金币)。',
    color: 'var(--color-hsr-cyan)',
    rarity: 'silver'
  },
  {
    id: 'advisor_silver_wolf',
    name: '头号玩家 (特殊)',
    description: '解锁专家顾问【银狼 LV.999】进入商店卡池。',
    color: 'var(--color-hsr-purple)',
    rarity: 'advisor'
  },
  {
    id: 'advisor_gallagher',
    name: '击破专家 (特殊)',
    description: '解锁专家顾问【加拉赫】进入商店卡池。',
    color: 'var(--color-hsr-purple)',
    rarity: 'advisor'
  }
];

const EventModal: React.FC = () => {
  const { game, applyInvestment, nextNode } = useGameStore();

  if (game.phase !== 'event') return null;

  // Randomly pick 3
  const choices = [...STRATEGIES].sort(() => 0.5 - Math.random()).slice(0, 3);

  const handleSelect = (id: string) => {
    applyInvestment(id);
    nextNode(); // Moves to planning phase
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="glass-panel-hsr p-8 w-[800px] flex flex-col items-center">
        <h2 className="text-3xl font-bold text-[var(--color-hsr-gold)] mb-2 tracking-widest text-center">INVESTMENT STRATEGY</h2>
        <p className="text-[var(--color-hsr-cyan)] mb-10 tracking-widest text-sm">选择你的投资策略</p>

        <div className="flex gap-6 w-full justify-center">
          {choices.map((strat, idx) => (
            <div 
              key={idx}
              onClick={() => handleSelect(strat.id)}
              className="flex-1 min-h-[250px] glass-panel p-6 flex flex-col justify-between cursor-pointer group hover:scale-105 transition-all relative overflow-hidden"
              style={{ borderColor: strat.color }}
            >
              <div 
                className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity"
                style={{ backgroundColor: strat.color }}
              />
              <div>
                <div className="text-xl font-bold mb-4 drop-shadow-md" style={{ color: strat.color }}>{strat.name}</div>
                <div className="text-[var(--color-hsr-text)] text-sm leading-relaxed">{strat.description}</div>
              </div>
              <div className="mt-6 text-right">
                <span className="text-xs font-bold px-2 py-1 bg-black/50 rounded" style={{ color: strat.color }}>
                  {strat.rarity.toUpperCase()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EventModal;
