export interface EquipmentConfig {
  id: string;
  name: string;
  type: 'basic' | 'advanced';
  icon: string;
  description: string;
  stats?: {
    attack?: number; // multiplier e.g. 1.2 for +20%
    speed?: number;
    hp?: number;
    defense?: number;
  };
  recipe?: [string, string]; // For advanced equipment
}

export const EQUIPMENTS: Record<string, EquipmentConfig> = {
  // Basic Equipment
  'basic_sword': {
    id: 'basic_sword',
    name: '生锈的铁剑',
    type: 'basic',
    icon: '🗡️',
    description: '攻击力 +10%',
    stats: { attack: 1.1 }
  },
  'basic_shield': {
    id: 'basic_shield',
    name: '木盾',
    type: 'basic',
    icon: '🛡️',
    description: '防御力 +10%',
    stats: { defense: 1.1 }
  },
  'basic_boots': {
    id: 'basic_boots',
    name: '皮靴',
    type: 'basic',
    icon: '👢',
    description: '速度 +10%',
    stats: { speed: 1.1 }
  },
  'basic_crystal': {
    id: 'basic_crystal',
    name: '充能水晶',
    type: 'basic',
    icon: '💎',
    description: '生命值 +10%',
    stats: { hp: 1.1 }
  },

  // Advanced Equipment
  'anti_grav_boots': {
    id: 'anti_grav_boots',
    name: '反重力靴',
    type: 'advanced',
    icon: '🥾',
    description: '速度大幅提升 (+30%)，攻击力 +15%',
    stats: { speed: 1.3, attack: 1.15 },
    recipe: ['basic_boots', 'basic_sword']
  },
  'high_freq_chainsaw': {
    id: 'high_freq_chainsaw',
    name: '高频链锯',
    type: 'advanced',
    icon: '🪚',
    description: '极高的斩杀线，攻击力 +40%',
    stats: { attack: 1.4 },
    recipe: ['basic_sword', 'basic_sword']
  },
  'perpetual_engine': {
    id: 'perpetual_engine',
    name: '永动机',
    type: 'advanced',
    icon: '⚙️',
    description: '生命值 +30%，速度 +20%',
    stats: { hp: 1.3, speed: 1.2 },
    recipe: ['basic_crystal', 'basic_boots']
  },
  'molecular_solvent': {
    id: 'molecular_solvent',
    name: '分子溶剂',
    type: 'advanced',
    icon: '🧪',
    description: '穿透能力，攻击力 +20%，防御力 +20%',
    stats: { attack: 1.2, defense: 1.2 },
    recipe: ['basic_sword', 'basic_shield']
  }
};
