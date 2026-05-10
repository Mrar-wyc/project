import { ECSWorld, StatusComponent, ActionComponent, FactionComponent, BondComponent, EnergyComponent } from './ECS';
import type { HeroInstance } from '../store/gameStore';
import { HEROES } from '../data/heroes';
import { EQUIPMENTS } from '../data/equipment';
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

  // Special Mechanics State
  elationPunchlinePoints: number = 0;
  lightningLordEntityId: number | null = null;
  lightningLordHits: number = 0;

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

        let finalHp = config.baseStats.hp * multiplier;
        let finalAtk = config.baseStats.attack * multiplier;
        let finalDef = config.baseStats.defense * multiplier;
        let finalSpd = config.baseStats.speed;

        // Apply Equipments
        if (slot.equipments && slot.equipments.length > 0) {
          slot.equipments.forEach(eqId => {
            const eq = EQUIPMENTS[eqId];
            if (eq && eq.stats) {
              if (eq.stats.hp) finalHp *= eq.stats.hp;
              if (eq.stats.attack) finalAtk *= eq.stats.attack;
              if (eq.stats.defense) finalDef *= eq.stats.defense;
              if (eq.stats.speed) finalSpd *= eq.stats.speed;
            }
          });
        }

        this.world.status.set(id, new StatusComponent(
          id, 
          finalHp, 
          finalHp, 
          finalAtk, 
          finalDef, 
          finalSpd
        ));
        
        // 10000 / speed = base AV needed
        this.world.action.set(id, new ActionComponent(id, 10000 / finalSpd));
        this.world.faction.set(id, new FactionComponent(id, 'player', isFrontline));
        this.world.bond.set(id, new BondComponent(id, config.traits));
        this.world.energy.set(id, new EnergyComponent(id, 100)); // All heroes get energy
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
        globalEnemyDefenseMultiplier *= (bond.activeLevel.count >= 4 ? 0.6 : 0.8);
      }

      // Xianzhou Lightning Lord Summon
      if (bond.name === '仙舟' && bond.activeLevel && bond.activeLevel.count >= 4) {
        this.lightningLordEntityId = this.world.createEntity();
        const baseAtk = 150;
        const llAtk = bond.activeLevel.count >= 6 ? baseAtk * 2 : baseAtk;
        this.world.status.set(this.lightningLordEntityId, new StatusComponent(this.lightningLordEntityId, 9999, 9999, llAtk, 50, 60));
        this.world.action.set(this.lightningLordEntityId, new ActionComponent(this.lightningLordEntityId, 10000 / 60));
        this.world.faction.set(this.lightningLordEntityId, new FactionComponent(this.lightningLordEntityId, 'player', false)); // Acts globally
        this.lightningLordHits = bond.activeLevel.count >= 6 ? 10 : 3;
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
    const status = this.world.status.get(entityId);
    if (!faction || !status || status.hp <= 0) return;

    // Find target
    const targetFaction = faction.team === 'player' ? 'enemy' : 'player';
    const getValidTargets = () => {
      const targets: number[] = [];
      for (const [id, fac] of this.world.faction.entries()) {
        if (fac.team === targetFaction && fac.isFrontline) {
          const tStatus = this.world.status.get(id);
          if (tStatus && tStatus.hp > 0) {
            targets.push(id);
          }
        }
      }
      return targets;
    };

    // --- Lightning Lord Action ---
    if (entityId === this.lightningLordEntityId) {
      // Bounce attack
      for (let i = 0; i < this.lightningLordHits; i++) {
        const targets = getValidTargets();
        if (targets.length === 0) break;
        const tId = targets[Math.floor(Math.random() * targets.length)];
        const tStatus = this.world.status.get(tId)!;
        const damage = Math.max(1, status.attack - (tStatus.defense * 0.5));
        tStatus.hp -= damage;
        if (this.onDamage) this.onDamage(tId, damage, tStatus.hp);
        if (tStatus.hp <= 0) {
          if (this.onDeath) this.onDeath(tId);
          this.world.action.delete(tId);
        }
      }
      return; // LL done
    }

    const bond = this.world.bond.get(entityId);
    const isElation = bond && bond.traits.includes('欢愉');
    
    // --- Off-field Action ---
    if (!faction.isFrontline) {
      if (faction.team === 'player' && isElation) {
        // Generate Punchline points
        this.elationPunchlinePoints += 1;
        // If enough points, trigger Aha Instant from random frontline player
        if (this.elationPunchlinePoints >= 5) {
          this.elationPunchlinePoints -= 5;
          const playerFrontline = [];
          for (const [id, fac] of this.world.faction.entries()) {
            if (fac.team === 'player' && fac.isFrontline) {
              const pStatus = this.world.status.get(id);
              if (pStatus && pStatus.hp > 0) playerFrontline.push(id);
            }
          }
          if (playerFrontline.length > 0) {
            const pId = playerFrontline[Math.floor(Math.random() * playerFrontline.length)];
            const pStatus = this.world.status.get(pId)!;
            const enemies = getValidTargets();
            if (enemies.length > 0) {
              // Aha burst damage
              const eId = enemies[Math.floor(Math.random() * enemies.length)];
              const eStatus = this.world.status.get(eId)!;
              const burstDamage = pStatus.attack * 5; // huge multiplier
              eStatus.hp -= burstDamage;
              if (this.onDamage) this.onDamage(eId, burstDamage, eStatus.hp); // Show burst
              if (eStatus.hp <= 0) {
                if (this.onDeath) this.onDeath(eId);
                this.world.action.delete(eId);
              }
            }
          }
        }
      }
      return; 
    }

    // --- Regular Frontline Action ---
    const targets = getValidTargets();
    if (targets.length === 0) return;
    const targetId = targets[Math.floor(Math.random() * targets.length)];
    const targetStatus = this.world.status.get(targetId)!;

    // Apply Damage
    const damage = Math.max(1, status.attack - (targetStatus.defense * 0.5));
    targetStatus.hp -= damage;

    if (this.onAttack) this.onAttack(entityId, targetId);
    if (this.onDamage) this.onDamage(targetId, damage, targetStatus.hp);

    // --- DoT true damage ---
    if (bond && bond.traits.includes('持续伤害')) {
      const trueDamage = targetStatus.maxHp * 0.05; // 5% max HP true damage
      targetStatus.hp -= trueDamage;
      if (this.onDamage) this.onDamage(targetId, trueDamage, targetStatus.hp);
    }

    if (targetStatus.hp <= 0) {
      if (this.onDeath) this.onDeath(targetId);
      this.world.action.delete(targetId);
    }

    // --- Energy / Day Demigod ---
    if (bond && bond.traits.includes('能量')) {
      const energyComp = this.world.energy.get(entityId);
      if (energyComp) {
        energyComp.currentEnergy += 30; // generate energy
        if (energyComp.currentEnergy >= energyComp.maxEnergy) {
          energyComp.currentEnergy -= energyComp.maxEnergy;
          // Action Advance Forward 100% (reset AV to 0 instead of standard)
          const actionComp = this.world.action.get(entityId);
          if (actionComp) {
            // It will be reset to normal after this method returns, so we offset it by subtracting
            // the amount that will be added.
            actionComp.currentAV -= (10000 / status.speed);
          }
        }
      }
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
