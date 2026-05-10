export interface HeroConfig {
  id: string;
  name: string;
  cost: number;
  traits: string[]; // Bonds/Factions
  isAdvisor?: boolean; // If true, not in initial pool
  baseStats: {
    hp: number;
    attack: number;
    defense: number;
    speed: number;
  };
}

export const HEROES: HeroConfig[] = [
  // 1 Cost
  { id: 'h1', name: '三月七', cost: 1, traits: ['星穹列车', '存护'], baseStats: { hp: 500, attack: 40, defense: 50, speed: 100 } },
  { id: 'h2', name: '丹恒', cost: 1, traits: ['星穹列车', '巡猎'], baseStats: { hp: 400, attack: 55, defense: 30, speed: 110 } },
  { id: 'h3', name: '青雀', cost: 1, traits: ['仙舟', '智识'], baseStats: { hp: 400, attack: 50, defense: 30, speed: 98 } },
  { id: 'h4', name: '佩拉', cost: 1, traits: ['贝洛伯格', '虚无'], baseStats: { hp: 450, attack: 45, defense: 40, speed: 105 } },
  
  // 2 Cost
  { id: 'h5', name: '停云', cost: 2, traits: ['仙舟', '同谐'], baseStats: { hp: 500, attack: 45, defense: 40, speed: 112 } },
  { id: 'h6', name: '素裳', cost: 2, traits: ['仙舟', '巡猎'], baseStats: { hp: 450, attack: 65, defense: 35, speed: 107 } },
  { id: 'h7', name: '娜塔莎', cost: 2, traits: ['贝洛伯格', '丰饶'], baseStats: { hp: 600, attack: 35, defense: 45, speed: 98 } },
  { id: 'h8', name: '艾丝妲', cost: 2, traits: ['星际和平公司', '同谐'], baseStats: { hp: 550, attack: 40, defense: 40, speed: 105 } },

  // 3 Cost
  { id: 'h9', name: '姬子', cost: 3, traits: ['星穹列车', '智识'], baseStats: { hp: 600, attack: 70, defense: 40, speed: 96 } },
  { id: 'h10', name: '瓦尔特', cost: 3, traits: ['星穹列车', '虚无'], baseStats: { hp: 650, attack: 65, defense: 45, speed: 104 } },
  { id: 'h11', name: '布洛妮娅', cost: 3, traits: ['贝洛伯格', '同谐'], baseStats: { hp: 600, attack: 50, defense: 50, speed: 99 } },
  { id: 'h12', name: '彦卿', cost: 3, traits: ['仙舟', '巡猎'], baseStats: { hp: 550, attack: 80, defense: 35, speed: 109 } },

  // 4 Cost
  { id: 'h13', name: '景元', cost: 4, traits: ['仙舟', '智识'], baseStats: { hp: 750, attack: 90, defense: 50, speed: 99 } },
  { id: 'h14', name: '希儿', cost: 4, traits: ['贝洛伯格', '巡猎'], baseStats: { hp: 650, attack: 95, defense: 40, speed: 115 } },
  { id: 'h15', name: '托帕', cost: 4, traits: ['星际和平公司', '巡猎'], baseStats: { hp: 700, attack: 85, defense: 45, speed: 110 } },
  { id: 'h16', name: '卡芙卡', cost: 4, traits: ['星核猎手', '持续伤害'], baseStats: { hp: 700, attack: 88, defense: 45, speed: 100 } },
  { id: 'h16_1', name: '斯帕克西', cost: 4, traits: ['星核猎手', '欢愉'], baseStats: { hp: 650, attack: 80, defense: 45, speed: 105 } },
  { id: 'h16_2', name: '特里比', cost: 4, traits: ['能量', '白昼半神'], baseStats: { hp: 600, attack: 85, defense: 40, speed: 110 } },
  { id: 'h16_3', name: '风信子', cost: 4, traits: ['能量', '白昼半神'], baseStats: { hp: 650, attack: 90, defense: 45, speed: 108 } },

  // 5 Cost
  { id: 'h17', name: '银狼', cost: 5, traits: ['星核猎手', '虚无'], baseStats: { hp: 800, attack: 90, defense: 50, speed: 107 } },
  { id: 'h18', name: '饮月', cost: 5, traits: ['仙舟', '毁灭'], baseStats: { hp: 850, attack: 110, defense: 55, speed: 101 } },
  { id: 'h19', name: '刃', cost: 5, traits: ['星核猎手', '毁灭'], baseStats: { hp: 1000, attack: 95, defense: 60, speed: 97 } },
  { id: 'h20', name: '黑天鹅', cost: 5, traits: ['星际和平公司', '持续伤害'], baseStats: { hp: 850, attack: 100, defense: 50, speed: 102 } },
  { id: 'h21', name: '阿格莱雅', cost: 5, traits: ['能量', '白昼半神'], baseStats: { hp: 800, attack: 120, defense: 55, speed: 120 } },
  
  // Advisors (Not in standard pool initially)
  { id: 'h22', name: '银狼 LV.999', cost: 5, traits: ['星核猎手', '欢愉'], isAdvisor: true, baseStats: { hp: 1000, attack: 150, defense: 60, speed: 130 } },
  { id: 'h23', name: '加拉赫', cost: 2, traits: ['丰饶'], isAdvisor: true, baseStats: { hp: 550, attack: 40, defense: 50, speed: 100 } },
];
