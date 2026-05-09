export type EntityId = number;

export abstract class Component {
  entityId: EntityId;
  constructor(entityId: EntityId) {
    this.entityId = entityId;
  }
}

export class StatusComponent extends Component {
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  speed: number;

  constructor(
    entityId: EntityId,
    hp: number,
    maxHp: number,
    attack: number,
    defense: number,
    speed: number
  ) {
    super(entityId);
    this.hp = hp;
    this.maxHp = maxHp;
    this.attack = attack;
    this.defense = defense;
    this.speed = speed;
  }
}

export class ActionComponent extends Component {
  currentAV: number;

  constructor(entityId: EntityId, currentAV: number) {
    super(entityId);
    this.currentAV = currentAV;
  }
}

export class FactionComponent extends Component {
  team: 'player' | 'enemy';
  isFrontline: boolean;

  constructor(entityId: EntityId, team: 'player' | 'enemy', isFrontline: boolean) {
    super(entityId);
    this.team = team;
    this.isFrontline = isFrontline;
  }
}

export class BondComponent extends Component {
  traits: string[];

  constructor(entityId: EntityId, traits: string[]) {
    super(entityId);
    this.traits = traits;
  }
}

export class ECSWorld {
  private nextEntityId = 1;
  public entities: Set<EntityId> = new Set();
  
  public status: Map<EntityId, StatusComponent> = new Map();
  public action: Map<EntityId, ActionComponent> = new Map();
  public faction: Map<EntityId, FactionComponent> = new Map();
  public bond: Map<EntityId, BondComponent> = new Map();

  createEntity(): EntityId {
    const id = this.nextEntityId++;
    this.entities.add(id);
    return id;
  }

  removeEntity(id: EntityId) {
    this.entities.delete(id);
    this.status.delete(id);
    this.action.delete(id);
    this.faction.delete(id);
    this.bond.delete(id);
  }
}
