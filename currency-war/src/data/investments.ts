export interface InvestmentConfig {
  id: string;
  name: string;
  description: string;
  effect: (gameState: any) => void;
  tier: 1 | 2 | 3;
}

export const INVESTMENTS: InvestmentConfig[] = [
  {
    id: 'inv_1',
    name: '信用点扩张',
    description: '立即获得20金币，但下一次商店刷新费用翻倍。',
    tier: 1,
    effect: () => {}
  },
  {
    id: 'inv_2',
    name: '高维数据降维',
    description: '你的队伍等级上限+1，但全体角色最大生命值降低10%。',
    tier: 3,
    effect: () => {}
  },
  {
    id: 'inv_3',
    name: '激进型风险对冲',
    description: '连胜金币奖励+1，但战斗失败扣除双倍生命值。',
    tier: 2,
    effect: () => {}
  },
  {
    id: 'inv_4',
    name: '资产重组',
    description: '立即获得一次免费的商店刷新，并将当前商店所有卡牌变为4费及以上。',
    tier: 2,
    effect: () => {}
  }
];