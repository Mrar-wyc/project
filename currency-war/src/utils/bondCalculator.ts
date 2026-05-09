import { HEROES } from '../data/heroes';
import { BONDS } from '../data/bonds';
import type { BondLevel } from '../data/bonds';
import type { HeroInstance } from '../store/gameStore';

export interface ActiveBond {
  bondId: string;
  name: string;
  count: number;
  activeLevel: BondLevel | null;
  nextLevelCount: number | null;
}

export function calculateActiveBonds(boardSlots: (HeroInstance | null)[]): ActiveBond[] {
  // 1. Get unique heroes on board (multiple same 1-star heroes only count as 1 for bonds)
  const uniqueHeroIds = new Set<string>();
  boardSlots.forEach(slot => {
    if (slot) {
      uniqueHeroIds.add(slot.heroId);
    }
  });

  // 2. Count traits
  const traitCounts: Record<string, number> = {};
  uniqueHeroIds.forEach(heroId => {
    const hero = HEROES.find(h => h.id === heroId);
    if (hero) {
      hero.traits.forEach(trait => {
        traitCounts[trait] = (traitCounts[trait] || 0) + 1;
      });
    }
  });

  // 3. Map to active bonds
  const activeBonds: ActiveBond[] = [];
  
  for (const [traitName, count] of Object.entries(traitCounts)) {
    const bondConfig = BONDS[traitName];
    if (bondConfig) {
      let activeLevel: BondLevel | null = null;
      let nextLevelCount: number | null = null;

      for (const level of bondConfig.levels) {
        if (count >= level.count) {
          activeLevel = level;
        } else {
          if (nextLevelCount === null) {
            nextLevelCount = level.count;
          }
        }
      }

      if (count > 0) {
        activeBonds.push({
          bondId: bondConfig.id,
          name: bondConfig.name,
          count,
          activeLevel,
          nextLevelCount
        });
      }
    }
  }

  // Sort by count descending
  return activeBonds.sort((a, b) => b.count - a.count);
}