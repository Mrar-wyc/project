# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Quick commands

```bash
# Dev server (frontend)
cd currency-war && npm run dev

# Build (production)
cd currency-war && npm run build        # runs: tsc -b && vite build

# Lint
cd currency-war && npm run lint         # all files (eslint .)
cd currency-war && npx eslint src/components/TopBar.tsx  # single file

# Playwright e2e
cd currency-war && npm run test:e2e     # headless full suite
cd currency-war && npm run test:e2e:headed  # headed
cd currency-war && npx playwright test path/to/spec.ts        # single file
cd currency-war && npx playwright test -g "test name"          # single test
```

## High-level architecture

- **Frontend-only SPA** in `currency-war/` — an auto-chess game inspired by Honkai: Star Rail.
- **Vite + React 19 + TypeScript 6**, styled with **Tailwind CSS 3** (HSR space-fantasy theme via CSS custom properties in `src/index.css`).
- **State management**: single Zustand store at `src/store/gameStore.ts`, exported as `useGameStore`.
- **Component tree**: `src/main.tsx` → `App.tsx` → TopBar / BattleBoard / BenchPanel / ShopPanel / InfoPanel.
- **Data-driven**: gameplay content lives in `src/data/`:
  - `heroes.ts` — 19 hero configs (id, cost, traits, baseStats)
  - `bonds.ts` — Bond/trait definitions and activation thresholds
  - `investments.ts` — Investment strategies
- **Custom ECS combat engine** in `src/engine/`:
  - `ECS.ts` — Entity Component System (Status, Action, Faction, Bond components)
  - `CombatEngine.ts` — Action-value-based turn-based battle simulation
- **Utilities**: `src/utils/bondCalculator.ts` — derives active bonds from board state.

## Key conventions

- **IDs**: hero ids use `h1`–`h19`; bond keys use Chinese trait names (e.g. `'仙舟'`); investment ids use `inv_1`–`inv_4`.
- **HeroInstance shape** (on bench/board): `{ uuid, heroId, star }` — uuid is client-generated.
- **Shop**: `shop.cards` is an array of `heroId | null`. Buying sets the slot to `null`.
- **Board**: 2 rows × 4 cols (8 slots); bench: 9 slots. Board capacity gated by `player.level`.
- **Bond counting**: `calculateActiveBonds` counts unique heroIds on board (duplicate 1-star copies count once).
- **Game phases**: `'planning' | 'combat' | 'event' | 'gameover'` — use these exact strings.
- **State mutations**: always use `useGameStore` actions (`buyHero`, `moveHero`, `startCombat`, etc.), never mutate store objects directly.
- **Level/XP**: centralized in `LEVEL_XP_REQ` array in `gameStore.ts`.
