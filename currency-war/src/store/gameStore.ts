import { create } from 'zustand';
import { HEROES } from '../data/heroes';

export interface HeroInstance {
  uuid: string;
  heroId: string;
  star: number;
}

export interface PlayerState {
  gold: number;
  hp: number;
  level: number;
  xp: number;
  maxHp: number;
}

export interface ShopState {
  cards: (string | null)[]; // heroIds, null if bought
  refreshCost: number;
}

export interface BenchState {
  slots: (HeroInstance | null)[];
}

export interface BoardState {
  // Simple 2-row board for player: Front and Back (e.g., 4 slots each)
  slots: (HeroInstance | null)[];
}

export interface GameState {
  plane: number;
  node: number;
  phase: 'planning' | 'combat' | 'event' | 'gameover';
  winStreak: number;
}

export interface UIState {
  selectedSlot: { type: 'bench' | 'board', index: number } | null;
}

export interface RootState {
  player: PlayerState;
  shop: ShopState;
  bench: BenchState;
  board: BoardState;
  game: GameState;
  investments: string[]; // Active investment IDs
  ui: UIState;

  // Actions
  selectSlot: (type: 'bench' | 'board', index: number) => void;
  buyExp: () => void;
  refreshShop: () => void;
  buyHero: (shopIndex: number) => void;
  sellHero: (benchIndex: number) => void;
  moveHero: (from: { type: 'bench' | 'board', index: number }, to: { type: 'bench' | 'board', index: number }) => void;
  startCombat: () => void;
  endCombat: (win: boolean) => void;
  nextNode: () => void;
}

const LEVEL_XP_REQ = [0, 2, 4, 8, 14, 24, 36, 50, 70, 100];

const generateShop = (_level: number) => {
  // Simplified random shop generation
  return Array(5).fill(null).map(() => {
    const randomHero = HEROES[Math.floor(Math.random() * HEROES.length)];
    return randomHero.id;
  });
};

export const useGameStore = create<RootState>((set, get) => ({
  player: { gold: 10, hp: 100, maxHp: 100, level: 1, xp: 0 },
  shop: { cards: generateShop(1), refreshCost: 2 },
  bench: { slots: Array(9).fill(null) },
  board: { slots: Array(8).fill(null) }, // 2 rows x 4 cols
  game: { plane: 1, node: 1, phase: 'planning', winStreak: 0 },
  investments: [],
  ui: { selectedSlot: null },

  selectSlot: (type, index) => set((state) => {
    const { selectedSlot } = state.ui;
    if (!selectedSlot) {
      // selecting first time
      const slots = type === 'bench' ? state.bench.slots : state.board.slots;
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
      return {
        player: { ...state.player, gold: state.player.gold - state.shop.refreshCost },
        shop: { ...state.shop, cards: generateShop(state.player.level) }
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
      star: 1
    };
    
    return {
      player: { ...state.player, gold: state.player.gold - heroConfig.cost },
      shop: { ...state.shop, cards: newShopCards },
      bench: { ...state.bench, slots: newBenchSlots }
    };
  }),

  sellHero: (benchIndex: number) => set((state) => {
    const hero = state.bench.slots[benchIndex];
    if (!hero) return state;
    
    const heroConfig = HEROES.find(h => h.id === hero.heroId);
    const sellValue = heroConfig ? heroConfig.cost * Math.pow(3, hero.star - 1) : 0;

    const newBenchSlots = [...state.bench.slots];
    newBenchSlots[benchIndex] = null;

    return {
      player: { ...state.player, gold: state.player.gold + sellValue },
      bench: { ...state.bench, slots: newBenchSlots }
    };
  }),

  moveHero: (from, to) => set((state) => {
    const getSlots = (type: 'bench' | 'board') => type === 'bench' ? [...state.bench.slots] : [...state.board.slots];
    
    const fromSlots = getSlots(from.type);
    const toSlots = getSlots(to.type);
    
    const hero = fromSlots[from.index];
    if (!hero) return state;

    // Check board capacity if moving to board
    if (to.type === 'board' && from.type === 'bench') {
      const currentBoardCount = state.board.slots.filter(s => s !== null).length;
      if (currentBoardCount >= state.player.level && toSlots[to.index] === null) {
        return state; // Reached level cap
      }
    }

    const targetHero = toSlots[to.index];
    
    fromSlots[from.index] = targetHero;
    toSlots[to.index] = hero;

    return {
      bench: from.type === 'bench' && to.type === 'bench' ? { slots: fromSlots } : 
             from.type === 'bench' ? { slots: fromSlots } : 
             to.type === 'bench' ? { slots: toSlots } : state.bench,
      board: from.type === 'board' && to.type === 'board' ? { slots: fromSlots } : 
             from.type === 'board' ? { slots: fromSlots } : 
             to.type === 'board' ? { slots: toSlots } : state.board,
    };
  }),

  startCombat: () => set({ game: { ...get().game, phase: 'combat' } }),
  
  endCombat: (win: boolean) => set((state) => {
    const interest = Math.min(5, Math.floor(state.player.gold / 10));
    const winGold = win ? 1 : 0;
    const baseGold = 5;
    
    const hpLoss = win ? 0 : 10; // Simplify HP loss
    
    return {
      player: { 
        ...state.player, 
        gold: state.player.gold + baseGold + interest + winGold,
        hp: Math.max(0, state.player.hp - hpLoss)
      },
      game: {
        ...state.game,
        phase: state.game.node % 5 === 0 ? 'event' : 'planning',
        winStreak: win ? state.game.winStreak + 1 : 0,
        node: state.game.node + 1
      }
    };
  }),

  nextNode: () => set((state) => ({
    game: { ...state.game, phase: 'planning' },
    shop: { ...state.shop, cards: generateShop(state.player.level) }
  }))
}));