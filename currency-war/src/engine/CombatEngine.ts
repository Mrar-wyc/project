import { ECSWorld, StatusComponent, ActionComponent, FactionComponent, BondComponent } from './ECS';
import type { HeroInstance } from '../store/gameStore';
import { HEROES } from '../data/heroes';
import { calculateActiveBonds } from '../utils/bondCalculator';

export class CombatEngine {
  world: ECSWorld;
  currentTime: number = 0; // Global AV timeline
  maxAV: number = 180;
  
  // Callbacks for UI
  onDamage?: (entityId: number, damage: number, currentHp: number) => void;
  onAttack?: (attackerId: number, targetId: number) => void;
  onDeath?: (entityId: number) => void;
  onCombatEnd?: (win: boolean) => void;

  private combatEnded: boolean = false;

  constructor() {
    this.world = new ECSWorld();
  }

  entityToSlot: Map<number, string> = new Map();
  slotToEntity: Map<string, number> = new Map();

  // Setup the board
  init(
    onFieldSlots: (HeroInstance | null)[],
    offFieldSlots: (HeroInstance | null)[],
    // Mock enemies for now
    enemies: { hp: number, attack: number, speed: number }[] 
  ) {
    this.world = new ECSWorld();
    this.currentTime = 0;
    this.combatEnded = false;
    this.entityToSlot.clear();
    this.slotToEntity.clear();

    // Add player heroes
    const processSlot = (slots: (HeroInstance | null)[], isFrontline: boolean, prefix: string) => {
      slots.forEach((slot, index) => {
        if (!slot) return;
        const config = HEROES.find(h => h.id === slot.heroId);
        if (!config) return;
        
        // Multiplier for stats based on star
        const multiplier = Math.pow(1.8, slot.star - 1); 
        
        const id = this.world.createEntity();
        const slotKey = `${prefix}-${index}`;
        this.entityToSlot.set(id, slotKey);
        this.slotToEntity.set(slotKey, id);

        this.world.status.set(id, new StatusComponent(
          id, 
          config.baseStats.hp * multiplier, 
          config.baseStats.hp * multiplier, 
          config.baseStats.attack * multiplier, 
          config.baseStats.defense * multiplier, 
          config.baseStats.speed
        ));
        
        // 10000 / speed = base AV needed
        this.world.action.set(id, new ActionComponent(id, 10000 / config.baseStats.speed));
        this.world.faction.set(id, new FactionComponent(id, 'player', isFrontline));
        this.world.bond.set(id, new BondComponent(id, config.traits));
      });
    };

    processSlot(onFieldSlots, true, 'player-onField');
    processSlot(offFieldSlots, false, 'player-offField');

    // Add enemies
    enemies.forEach((e, index) => {
      const id = this.world.createEntity();
      const slotKey = `enemy-${index}`;
      this.entityToSlot.set(id, slotKey);
      this.slotToEntity.set(slotKey, id);

      this.world.status.set(id, new StatusComponent(id, e.hp, e.hp, e.attack, 30, e.speed));
      this.world.action.set(id, new ActionComponent(id, 10000 / e.speed));
      this.world.faction.set(id, new FactionComponent(id, 'enemy', true));
    });

    // --- Apply Bond Effects ---
    const allPlayerSlots = [...onFieldSlots, ...offFieldSlots];
    const activeBonds = calculateActiveBonds(allPlayerSlots);

    let globalEnemyDefenseMultiplier = 1.0;

    activeBonds.forEach(bond => {
      if (bond.activeLevel?.statsMultiplier) {
        const mods = bond.activeLevel.statsMultiplier;
        // Apply stats multiplier to all player entities
        for (const [id, faction] of this.world.faction.entries()) {
          if (faction.team === 'player') {
            const status = this.world.status.get(id);
            if (status) {
              if (mods.hp) {
                status.maxHp *= mods.hp;
                status.hp *= mods.hp;
              }
              if (mods.attack) status.attack *= mods.attack;
              if (mods.defense) status.defense *= mods.defense;
              if (mods.speed) {
                status.speed *= mods.speed;
                // Re-adjust AV
                const action = this.world.action.get(id);
                if (action) action.currentAV = 10000 / status.speed;
              }
            }
          }
        }
      }

      // Hardcode Nihility bond logic for enemy defense reduction
      if (bond.name === '虚无' && bond.activeLevel) {
        globalEnemyDefenseMultiplier *= 0.8; // Defense -20%
      }
    });

    // Apply global debuffs to enemies
    for (const [id, faction] of this.world.faction.entries()) {
      if (faction.team === 'enemy') {
        const status = this.world.status.get(id);
        if (status) {
          status.defense *= globalEnemyDefenseMultiplier;
        }
      }
    }
  }

  tick() {
    if (this.combatEnded) return false;

    if (this.currentTime >= this.maxAV) {
      this.finishCombat(false); // Time out
      return false;
    }

    // Find the next entity to act (min currentAV)
    let minAV = Infinity;
    let nextEntityId: number | null = null;

    for (const [id, action] of this.world.action.entries()) {
      if (!this.world.status.has(id)) continue;
      const status = this.world.status.get(id)!;
      if (status.hp <= 0) continue;

      if (action.currentAV < minAV) {
        minAV = action.currentAV;
        nextEntityId = id;
      }
    }

    if (nextEntityId === null) {
      return false;
    }

    // Fast forward time to minAV
    const timeElapsed = minAV;
    this.currentTime += timeElapsed;

    // Deduct timeElapsed from everyone's AV
    for (const [id, action] of this.world.action.entries()) {
      if (this.world.status.has(id) && this.world.status.get(id)!.hp > 0) {
        action.currentAV -= timeElapsed;
      }
    }

    // Entity takes action
    this.performAction(nextEntityId);

    // Reset AV for the acting entity
    const actionComp = this.world.action.get(nextEntityId);
    const statusComp = this.world.status.get(nextEntityId);
    if (actionComp && statusComp) {
      actionComp.currentAV += 10000 / statusComp.speed;
    }

    // Check win condition
    this.checkWinCondition();

    return !this.combatEnded; // Continue simulation
  }

  performAction(entityId: number) {
    const faction = this.world.faction.get(entityId);
    if (!faction || !faction.isFrontline) {
      return; 
    }

    const status = this.world.status.get(entityId);
    if (!status || status.hp <= 0) return;

    // Find target
    const targetFaction = faction.team === 'player' ? 'enemy' : 'player';
    const validTargets: number[] = [];
    for (const [id, fac] of this.world.faction.entries()) {
      if (fac.team === targetFaction && fac.isFrontline) {
        const tStatus = this.world.status.get(id);
        if (tStatus && tStatus.hp > 0) {
          validTargets.push(id);
        }
      }
    }

    if (validTargets.length === 0) return;
    
    // Pick random target
    const targetId = validTargets[Math.floor(Math.random() * validTargets.length)];
    const targetStatus = this.world.status.get(targetId)!;

    // Apply Damage
    const damage = Math.max(1, status.attack - (targetStatus.defense * 0.5));
    targetStatus.hp -= damage;

    if (this.onAttack) this.onAttack(entityId, targetId);
    if (this.onDamage) this.onDamage(targetId, damage, targetStatus.hp);

    if (targetStatus.hp <= 0) {
      if (this.onDeath) this.onDeath(targetId);
      this.world.action.delete(targetId);
    }
  }

  checkWinCondition() {
    let playerAlive = false;
    let enemyAlive = false;

    for (const [id, faction] of this.world.faction.entries()) {
      if (!faction.isFrontline) continue;
      const status = this.world.status.get(id);
      if (status && status.hp > 0) {
        if (faction.team === 'player') playerAlive = true;
        if (faction.team === 'enemy') enemyAlive = true;
      }
    }

    if (!enemyAlive) this.finishCombat(true);
    else if (!playerAlive) this.finishCombat(false);
  }

  finishCombat(win: boolean) {
    this.combatEnded = true;
    if (this.onCombatEnd) {
      this.onCombatEnd(win);
    }
  }
}
