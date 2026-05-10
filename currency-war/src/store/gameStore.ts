import { create } from 'zustand';
import { HEROES } from '../data/heroes';

export interface HeroInstance {
  uuid: string;
  heroId: string;
  star: number;
  equipments: string[]; // array of equipment IDs
}

export interface PlayerState {
  gold: number;
  hp: number;
  level: number;
  xp: number;
  maxHp: number;
  maxInterest: number;
  inventory: string[]; // array of unequipped equipment IDs
}

export interface ShopState {
  cards: (string | null)[]; // heroIds, null if bought
  refreshCost: number;
}

export interface BenchState {
  slots: (HeroInstance | null)[];
}

export interface BoardState {
  onFieldSlots: (HeroInstance | null)[]; // 4 slots
  offFieldSlots: (HeroInstance | null)[]; // 6 slots
}

export interface GameState {
  plane: number;
  node: number;
  phase: 'planning' | 'combat' | 'event' | 'gameover';
  winStreak: number;
}

export interface UIState {
  selectedSlot: { type: 'bench' | 'onField' | 'offField', index: number } | null;
}

export interface CombatEntityState {
  hp: number;
  maxHp: number;
  damageEvents: { id: string, amount: number }[];
}

export interface RootState {
  player: PlayerState;
  shop: ShopState;
  bench: BenchState;
  board: BoardState;
  game: GameState;
  investments: string[]; // Active investment IDs
  ui: UIState;
  poolCounts: Record<string, number>; // heroId -> remaining count in shared pool
  combatState: Record<string, CombatEntityState>; // slotKey -> state

  // Actions
  selectSlot: (type: 'bench' | 'onField' | 'offField', index: number) => void;
  buyExp: () => void;
  refreshShop: () => void;
  buyHero: (shopIndex: number) => void;
  sellHero: (benchIndex: number) => void;
  moveHero: (from: { type: 'bench' | 'onField' | 'offField', index: number }, to: { type: 'bench' | 'onField' | 'offField', index: number }) => void;
  startCombat: () => void;
  endCombat: (win: boolean) => void;
  nextNode: () => void;
  initCombatState: (states: Record<string, { hp: number, maxHp: number }>) => void;
  updateCombatHp: (slotKey: string, hp: number) => void;
  addDamageEvent: (slotKey: string, amount: number) => void;
  removeDamageEvent: (slotKey: string, eventId: string) => void;

  // Equipment Actions
  addEquipment: (equipId: string) => void;
  equipItem: (fromInventoryIndex: number, target: { type: 'bench' | 'onField' | 'offField', index: number }) => void;
  unequipItem: (source: { type: 'bench' | 'onField' | 'offField', index: number }, equipIndex: number) => void;
  craftEquipment: (invIndex1: number, invIndex2: number, resultId: string) => void;

  // Investment / Advisor Actions
  unlockAdvisor: (heroId: string) => void;
  applyInvestment: (strategyId: string) => void;
}

const LEVEL_XP_REQ = [0, 2, 4, 8, 14, 24, 36, 50, 70, 100];

const COST_POOL_COUNTS: Record<number, number> = {
  1: 29, 2: 22, 3: 18, 4: 12, 5: 10
};

const INITIAL_POOL: Record<string, number> = {};
HEROES.forEach(hero => {
  INITIAL_POOL[hero.id] = COST_POOL_COUNTS[hero.cost] || 0;
});

const PROBABILITY_MATRIX: Record<number, number[]> = {
  1: [100, 0, 0, 0, 0],
  2: [100, 0, 0, 0, 0],
  3: [100, 0, 0, 0, 0],
  4: [65, 25, 10, 0, 0],
  5: [45, 33, 20, 2, 0],
  6: [30, 40, 25, 5, 0],
  7: [19, 30, 40, 10, 1],
  8: [18, 25, 32, 22, 3],
  9: [15, 20, 25, 30, 10],
  10: [5, 10, 20, 40, 25],
};

const drawCardsFromPool = (level: number, pool: Record<string, number>): (string | null)[] => {
  const probs = PROBABILITY_MATRIX[level] || PROBABILITY_MATRIX[1];
  const newCards: (string | null)[] = [];

  for (let i = 0; i < 5; i++) {
    const roll = Math.random() * 100;
    let targetCost = 1;
    let acc = 0;
    for (let c = 0; c < 5; c++) {
      acc += probs[c];
      if (roll < acc) {
        targetCost = c + 1;
        break;
      }
    }

    const availableHeroes = HEROES.filter(h => h.cost === targetCost && pool[h.id] > 0);
    if (availableHeroes.length > 0) {
      const selected = availableHeroes[Math.floor(Math.random() * availableHeroes.length)];
      pool[selected.id] -= 1;
      newCards.push(selected.id);
    } else {
      newCards.push(null);
    }
  }

  return newCards;
};

// Helper to recursively merge 3 identical heroes of the same star into 1 higher star hero
const checkAndMergeStars = (state: RootState): Partial<RootState> | null => {
  const allSlots = [
    { type: 'bench', index: 0, slot: state.bench.slots[0] },
    ...state.bench.slots.map((slot, index) => ({ type: 'bench' as const, index, slot })),
    ...state.board.onFieldSlots.map((slot, index) => ({ type: 'onField' as const, index, slot })),
    ...state.board.offFieldSlots.map((slot, index) => ({ type: 'offField' as const, index, slot }))
  ].filter(s => s.slot !== null) as { type: 'bench'|'onField'|'offField', index: number, slot: HeroInstance }[];

  // Group by heroId and star
  const groups: Record<string, typeof allSlots> = {};
  allSlots.forEach(s => {
    const key = `${s.slot.heroId}-${s.slot.star}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(s);
  });

  for (const key in groups) {
    if (groups[key].length >= 3) {
      // We found 3 identical heroes to merge!
      const mergeTargets = groups[key].slice(0, 3);
      const newStar = mergeTargets[0].slot.star + 1;
      
      // Determine where the merged hero should go.
      // Priority: 1. onField, 2. offField, 3. bench. 
      // If multiple in the same zone, pick the first one.
      const sortedTargets = mergeTargets.sort((a, b) => {
        const rank = { 'onField': 1, 'offField': 2, 'bench': 3 };
        return rank[a.type] - rank[b.type];
      });

      const keepTarget = sortedTargets[0];
      const removeTargets = sortedTargets.slice(1);

      // Create copies of slots to mutate
      const newBenchSlots = [...state.bench.slots];
      const newOnFieldSlots = [...state.board.onFieldSlots];
      const newOffFieldSlots = [...state.board.offFieldSlots];

      const getSlotsRef = (type: string) => {
        if (type === 'bench') return newBenchSlots;
        if (type === 'onField') return newOnFieldSlots;
        return newOffFieldSlots;
      };

      // Upgrade the kept hero
      const keptSlotRef = getSlotsRef(keepTarget.type);
      keptSlotRef[keepTarget.index] = {
        ...keptSlotRef[keepTarget.index]!,
        star: newStar
      };

      // Remove the consumed heroes and reclaim equipments
      const reclaimedEquips: string[] = [];
      removeTargets.forEach(t => {
        const tSlotRef = getSlotsRef(t.type);
        const hero = tSlotRef[t.index];
        if (hero && hero.equipments) {
          reclaimedEquips.push(...hero.equipments);
        }
        tSlotRef[t.index] = null;
      });

      const newState: Partial<RootState> = {
        bench: { slots: newBenchSlots },
        board: { onFieldSlots: newOnFieldSlots, offFieldSlots: newOffFieldSlots }
      };

      if (reclaimedEquips.length > 0) {
        newState.player = {
          ...state.player,
          inventory: [...state.player.inventory, ...reclaimedEquips]
        };
      }

      return newState;
    }
  }

  return null; // No merge happened
};

// Initial setup to get the first shop cards and deduct them from the pool
const initPool = { ...INITIAL_POOL };
const initShopCards = drawCardsFromPool(1, initPool);

export const useGameStore = create<RootState>((set, get) => ({
  player: { gold: 10, hp: 100, maxHp: 100, level: 1, xp: 0, maxInterest: 3, inventory: ['basic_sword', 'basic_boots'] },
  shop: { cards: initShopCards, refreshCost: 2 },
  bench: { slots: Array(9).fill(null) },
  board: { onFieldSlots: Array(4).fill(null), offFieldSlots: Array(6).fill(null) },
  game: { plane: 1, node: 1, phase: 'planning', winStreak: 0 },
  investments: [],
  ui: { selectedSlot: null },
  poolCounts: initPool,
  combatState: {},

  initCombatState: (states) => set({
    combatState: Object.fromEntries(
      Object.entries(states).map(([k, v]) => [k, { hp: v.hp, maxHp: v.maxHp, damageEvents: [] }])
    )
  }),

  updateCombatHp: (slotKey, hp) => set((state) => {
    const s = state.combatState[slotKey];
    if (!s) return state;
    return {
      combatState: {
        ...state.combatState,
        [slotKey]: { ...s, hp }
      }
    };
  }),

  addDamageEvent: (slotKey, amount) => set((state) => {
    const s = state.combatState[slotKey];
    if (!s) return state;
    return {
      combatState: {
        ...state.combatState,
        [slotKey]: {
          ...s,
          damageEvents: [...s.damageEvents, { id: Math.random().toString(36).substring(7), amount }]
        }
      }
    };
  }),

  removeDamageEvent: (slotKey, eventId) => set((state) => {
    const s = state.combatState[slotKey];
    if (!s) return state;
    return {
      combatState: {
        ...state.combatState,
        [slotKey]: {
          ...s,
          damageEvents: s.damageEvents.filter(e => e.id !== eventId)
        }
      }
    };
  }),

  selectSlot: (type, index) => set((state) => {
    const { selectedSlot } = state.ui;
    if (!selectedSlot) {
      // selecting first time
      const slots = type === 'bench' ? state.bench.slots : type === 'onField' ? state.board.onFieldSlots : state.board.offFieldSlots;
      if (slots[index]) {
        return { ui: { selectedSlot: { type, index } } };
      }
      return state;
    } else {
      // moving
      if (selectedSlot.type === type && selectedSlot.index === index) {
        return { ui: { selectedSlot: null } }; // deselect
      }
      // perform move
      get().moveHero(selectedSlot, { type, index });
      return { ui: { selectedSlot: null } };
    }
  }),

  buyExp: () => set((state) => {
    if (state.player.gold >= 4 && state.player.level < 10) {
      let newXp = state.player.xp + 4;
      let newLevel = state.player.level;
      if (newXp >= LEVEL_XP_REQ[newLevel]) {
        newXp -= LEVEL_XP_REQ[newLevel];
        newLevel += 1;
      }
      return {
        player: { ...state.player, gold: state.player.gold - 4, xp: newXp, level: newLevel }
      };
    }
    return state;
  }),

  refreshShop: () => set((state) => {
    if (state.player.gold >= state.shop.refreshCost) {
      const newPool = { ...state.poolCounts };
      // Return unbought cards to pool
      state.shop.cards.forEach(card => {
        if (card) newPool[card] += 1;
      });
      
      const newCards = drawCardsFromPool(state.player.level, newPool);
      
      return {
        player: { ...state.player, gold: state.player.gold - state.shop.refreshCost },
        shop: { ...state.shop, cards: newCards },
        poolCounts: newPool
      };
    }
    return state;
  }),

  buyHero: (shopIndex: number) => set((state) => {
    const heroId = state.shop.cards[shopIndex];
    if (!heroId) return state;
    
    const heroConfig = HEROES.find(h => h.id === heroId);
    if (!heroConfig || state.player.gold < heroConfig.cost) return state;

    const emptyBenchIndex = state.bench.slots.findIndex(s => s === null);
    if (emptyBenchIndex === -1) return state; // Bench is full

    const newShopCards = [...state.shop.cards];
    newShopCards[shopIndex] = null;

    const newBenchSlots = [...state.bench.slots];
    newBenchSlots[emptyBenchIndex] = {
      uuid: Math.random().toString(36).substring(7),
      heroId: heroId,
      star: 1,
      equipments: []
    };
    
    const newState = {
      player: { ...state.player, gold: state.player.gold - heroConfig.cost },
      shop: { ...state.shop, cards: newShopCards },
      bench: { ...state.bench, slots: newBenchSlots }
    };

    // Recursively check for merges
    let finalState = { ...state, ...newState };
    let mergeUpdate = checkAndMergeStars(finalState);
    while (mergeUpdate) {
      finalState = { ...finalState, ...mergeUpdate };
      mergeUpdate = checkAndMergeStars(finalState);
    }

    return finalState;
  }),

  sellHero: (benchIndex: number) => set((state) => {
    const hero = state.bench.slots[benchIndex];
    if (!hero) return state;
    
    const heroConfig = HEROES.find(h => h.id === hero.heroId);
    const sellValue = heroConfig ? heroConfig.cost * Math.pow(3, hero.star - 1) : 0;

    const newBenchSlots = [...state.bench.slots];
    newBenchSlots[benchIndex] = null;

    const newPool = { ...state.poolCounts };
    // Add back copies based on star level (1 star = 1, 2 star = 3, 3 star = 9)
    newPool[hero.heroId] += Math.pow(3, hero.star - 1);

    return {
      player: { ...state.player, gold: state.player.gold + sellValue },
      bench: { ...state.bench, slots: newBenchSlots },
      poolCounts: newPool
    };
  }),

  moveHero: (from, to) => set((state) => {
    if (from.type === to.type && from.index === to.index) return state;

    const getSlots = (type: 'bench' | 'onField' | 'offField') => 
      type === 'bench' ? [...state.bench.slots] : 
      type === 'onField' ? [...state.board.onFieldSlots] : 
      [...state.board.offFieldSlots];
    
    const fromSlots = getSlots(from.type);
    const toSlots = from.type === to.type ? fromSlots : getSlots(to.type);
    
    const hero = fromSlots[from.index];
    if (!hero) return state;

    const isMovingToBoard = (to.type === 'onField' || to.type === 'offField') && from.type === 'bench';

    // 1. Check board capacity if moving from bench to board
    if (isMovingToBoard) {
      const currentBoardCount = 
        state.board.onFieldSlots.filter(s => s !== null).length + 
        state.board.offFieldSlots.filter(s => s !== null).length;
      if (currentBoardCount >= state.player.level && toSlots[to.index] === null) {
        return state; // Reached level cap
      }
    }

    // 2. Check for duplicate hero on board (Rule: Only 1 unique hero per board)
    if (isMovingToBoard) {
      const allBoardHeroes = [
        ...state.board.onFieldSlots, 
        ...state.board.offFieldSlots
      ].filter(s => s !== null) as HeroInstance[];
      
      const hasDuplicate = allBoardHeroes.some(h => h.heroId === hero.heroId);
      // But wait! If we are replacing an existing hero on the board with the same ID, that's fine.
      // Also, if we are swapping with a hero on the board that has the same ID, that's fine.
      const targetHero = toSlots[to.index];
      if (hasDuplicate && (!targetHero || targetHero.heroId !== hero.heroId)) {
        return state; // Refuse move: duplicate hero already on board
      }
    }

    const targetHero = toSlots[to.index];
    
    fromSlots[from.index] = targetHero;
    toSlots[to.index] = hero;

    const newState: Partial<RootState> = {};

    if (from.type === 'bench' || to.type === 'bench') {
      newState.bench = { 
        slots: from.type === 'bench' ? fromSlots : toSlots
      };
    }
    
    if (from.type !== 'bench' || to.type !== 'bench') {
      newState.board = {
        onFieldSlots: from.type === 'onField' ? fromSlots : 
                      to.type === 'onField' ? toSlots : state.board.onFieldSlots,
        offFieldSlots: from.type === 'offField' ? fromSlots : 
                       to.type === 'offField' ? toSlots : state.board.offFieldSlots
      };
    }

    // Recursively check for merges after a move
    let finalState = { ...state, ...newState };
    let mergeUpdate = checkAndMergeStars(finalState);
    while (mergeUpdate) {
      finalState = { ...finalState, ...mergeUpdate };
      mergeUpdate = checkAndMergeStars(finalState);
    }

    return finalState;
  }),

  startCombat: () => set({ game: { ...get().game, phase: 'combat' } }),
  
  endCombat: (win: boolean) => set((state) => {
    const interest = Math.min(state.player.maxInterest, Math.floor(state.player.gold / 10));
    const winGold = win ? 1 : 0;
    const baseGold = 5;
    
    const hpLoss = win ? 0 : 10; // Simplify HP loss
    
    const nextNode = state.game.node + 1;
    const nextPhase = nextNode % 5 === 0 ? 'event' : 'planning';

    // 免费刷新商店逻辑
    const newPool = { ...state.poolCounts };
    state.shop.cards.forEach(card => {
      if (card) newPool[card] += 1;
    });
    const newCards = drawCardsFromPool(state.player.level, newPool);

    return {
      player: { 
        ...state.player, 
        gold: state.player.gold + baseGold + interest + winGold,
        hp: Math.max(0, state.player.hp - hpLoss)
      },
      game: {
        ...state.game,
        phase: nextPhase,
        winStreak: win ? state.game.winStreak + 1 : 0,
        node: nextNode
      },
      shop: { ...state.shop, cards: newCards },
      poolCounts: newPool,
      combatState: {} // Clear combat state
    };
  }),

  nextNode: () => set((state) => {
    return {
      game: { ...state.game, phase: 'planning' },
    };
  }),

  addEquipment: (equipId) => set(state => ({
    player: { ...state.player, inventory: [...state.player.inventory, equipId] }
  })),

  equipItem: (fromInventoryIndex, target) => set(state => {
    const equipId = state.player.inventory[fromInventoryIndex];
    if (!equipId) return state;

    const getSlotsRef = (type: string) => {
      if (type === 'bench') return [...state.bench.slots];
      if (type === 'onField') return [...state.board.onFieldSlots];
      return [...state.board.offFieldSlots];
    };

    const slots = getSlotsRef(target.type);
    const hero = slots[target.index];
    if (!hero) return state;
    if (hero.equipments.length >= 3) return state; // Max 3 items

    const newInventory = [...state.player.inventory];
    newInventory.splice(fromInventoryIndex, 1);

    slots[target.index] = {
      ...hero,
      equipments: [...hero.equipments, equipId]
    };

    const newState: Partial<RootState> = { player: { ...state.player, inventory: newInventory } };
    if (target.type === 'bench') newState.bench = { slots };
    else if (target.type === 'onField') newState.board = { ...state.board, onFieldSlots: slots };
    else newState.board = { ...state.board, offFieldSlots: slots };

    return newState;
  }),

  unequipItem: (source, equipIndex) => set(state => {
    const getSlotsRef = (type: string) => {
      if (type === 'bench') return [...state.bench.slots];
      if (type === 'onField') return [...state.board.onFieldSlots];
      return [...state.board.offFieldSlots];
    };

    const slots = getSlotsRef(source.type);
    const hero = slots[source.index];
    if (!hero || !hero.equipments[equipIndex]) return state;

    const equipId = hero.equipments[equipIndex];
    const newEquipments = [...hero.equipments];
    newEquipments.splice(equipIndex, 1);

    slots[source.index] = {
      ...hero,
      equipments: newEquipments
    };

    const newState: Partial<RootState> = { 
      player: { ...state.player, inventory: [...state.player.inventory, equipId] } 
    };
    if (source.type === 'bench') newState.bench = { slots };
    else if (source.type === 'onField') newState.board = { ...state.board, onFieldSlots: slots };
    else newState.board = { ...state.board, offFieldSlots: slots };

    return newState;
  }),

  craftEquipment: (invIndex1, invIndex2, resultId) => set(state => {
    const inv = [...state.player.inventory];
    const i1 = Math.max(invIndex1, invIndex2);
    const i2 = Math.min(invIndex1, invIndex2);
    
    if (i1 >= inv.length || i2 >= inv.length || i1 === i2) return state;

    inv.splice(i1, 1);
    inv.splice(i2, 1);
    inv.push(resultId);

    return {
      player: { ...state.player, inventory: inv }
    };
  }),

  unlockAdvisor: (heroId) => set(state => {
    if (state.poolCounts[heroId] !== undefined) return state; // Already unlocked
    const heroConfig = HEROES.find(h => h.id === heroId);
    if (!heroConfig) return state;
    
    const newPool = { ...state.poolCounts };
    newPool[heroId] = COST_POOL_COUNTS[heroConfig.cost] || 0;
    
    return { poolCounts: newPool };
  }),

  applyInvestment: (strategyId) => set(state => {
    let newInterest = state.player.maxInterest;
    let newGold = state.player.gold;
    
    if (strategyId === 'prism_cut_costs') {
      newInterest = 9;
      newGold += 10;
    } else if (strategyId === 'silver_market') {
      // 5 free refreshes could be implemented by adding to a specific counter, keeping it simple for now
    } else if (strategyId === 'advisor_silver_wolf') {
      get().unlockAdvisor('h22'); // Silver Wolf LV.999
    } else if (strategyId === 'advisor_gallagher') {
      get().unlockAdvisor('h23'); // Gallagher
    }

    return {
      player: { ...state.player, maxInterest: newInterest, gold: newGold },
      investments: [...state.investments, strategyId]
    };
  })
}));
