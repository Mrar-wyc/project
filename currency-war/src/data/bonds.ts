export interface BondLevel {
  count: number;
  description: string;
  statsMultiplier?: {
    attack?: number;
    hp?: number;
    speed?: number;
    defense?: number;
  };
}

export interface BondConfig {
  id: string;
  name: string;
  levels: BondLevel[];
}

export const BONDS: Record<string, BondConfig> = {
  '仙舟': {
    id: 'xianzhou',
    name: '仙舟',
    levels: [
      { count: 2, description: '全员最大生命值+15%', statsMultiplier: { hp: 1.15 } },
      { count: 4, description: '全员最大生命值+30%，并召唤神君协同攻击', statsMultiplier: { hp: 1.30 } },
      { count: 6, description: '全员最大生命值+50%，神君伤害大幅提升', statsMultiplier: { hp: 1.50 } }
    ]
  },
  '星穹列车': {
    id: 'astral_express',
    name: '星穹列车',
    levels: [
      { count: 2, description: '全员攻击力+10%，速度+5%', statsMultiplier: { attack: 1.10, speed: 1.05 } },
      { count: 4, description: '全员攻击力+25%，速度+15%', statsMultiplier: { attack: 1.25, speed: 1.15 } }
    ]
  },
  '贝洛伯格': {
    id: 'belobog',
    name: '贝洛伯格',
    levels: [
      { count: 2, description: '全员防御力+20%', statsMultiplier: { defense: 1.20 } },
      { count: 4, description: '全员防御力+45%', statsMultiplier: { defense: 1.45 } }
    ]
  },
  '星际和平公司': {
    id: 'ipc',
    name: '星际和平公司',
    levels: [
      { count: 2, description: '利息结算时，额外获得1金币' }
    ]
  },
  '星核猎手': {
    id: 'stellaron_hunters',
    name: '星核猎手',
    levels: [
      { count: 2, description: '攻击力+20%', statsMultiplier: { attack: 1.20 } },
      { count: 3, description: '攻击力+50%', statsMultiplier: { attack: 1.50 } }
    ]
  },
  // 命途羁绊
  '智识': {
    id: 'erudition',
    name: '智识',
    levels: [
      { count: 2, description: '技能伤害提升20%' },
      { count: 4, description: '技能伤害提升50%' }
    ]
  },
  '巡猎': {
    id: 'hunt',
    name: '巡猎',
    levels: [
      { count: 2, description: '攻击速度+15%', statsMultiplier: { speed: 1.15 } },
      { count: 4, description: '攻击速度+35%', statsMultiplier: { speed: 1.35 } }
    ]
  },
  '存护': {
    id: 'preservation',
    name: '存护',
    levels: [
      { count: 2, description: '战斗开始时获得护盾' }
    ]
  },
  '虚无': {
    id: 'nihility',
    name: '虚无',
    levels: [
      { count: 2, description: '敌人全体防御力-20%' },
      { count: 4, description: '敌人全体防御力-40%' }
    ]
  },
  '持续伤害': {
    id: 'dot',
    name: '持续伤害',
    levels: [
      { count: 2, description: '行动时对敌方造成基于最大生命值的真实伤害' },
      { count: 4, description: '真实伤害翻倍，并附带减伤效果' }
    ]
  },
  '欢愉': {
    id: 'elation',
    name: '欢愉',
    levels: [
      { count: 2, description: '后台角色积攒笑料，前台释放阿哈时刻爆发伤害' },
      { count: 4, description: '笑料积攒速度加倍，阿哈时刻伤害极大幅度提升' }
    ]
  },
  '能量': {
    id: 'energy',
    name: '能量',
    levels: [
      { count: 2, description: '行动后额外恢复能量' },
      { count: 4, description: '能量溢出时重置行动值(AV)' }
    ]
  },
  '白昼半神': {
    id: 'day_demigod',
    name: '白昼半神',
    levels: [
      { count: 2, description: '极速行动，速度+30%' }
    ]
  },
  '同谐': {
    id: 'harmony',
    name: '同谐',
    levels: [
      { count: 2, description: '相邻友军属性提升10%' }
    ]
  },
  '毁灭': {
    id: 'destruction',
    name: '毁灭',
    levels: [
      { count: 2, description: '生命值越低，攻击力越高' }
    ]
  },
  '丰饶': {
    id: 'abundance',
    name: '丰饶',
    levels: [
      { count: 2, description: '每秒恢复生命值' }
    ]
  }
};