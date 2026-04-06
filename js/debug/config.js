// 所有道具配置
export const ALL_PROPS = [
  { type: 'pulse_cannon', name: '脉冲机炮', maxLevel: 6, category: 'attack' },
  { type: 'shotgun', name: '散射霰弹', maxLevel: 6, category: 'attack' },
  { type: 'homing_missile', name: '追踪导弹', maxLevel: 6, category: 'attack' },
  { type: 'arc_grenade', name: '弧形榴弹', maxLevel: 6, category: 'attack' },
  { type: 'ring_blast', name: '环形爆破', maxLevel: 6, category: 'attack' },
  { type: 'pierce_laser', name: '穿刺光束', maxLevel: 6, category: 'attack' },
  { type: 'cross_barrage', name: '交叉弹幕', maxLevel: 6, category: 'attack' },
  { type: 'drone_support', name: '无人机支援', maxLevel: 6, category: 'attack' },
  { type: 'energy_core', name: '能量核心', maxLevel: 6, category: 'assist' },
  { type: 'armor_plate', name: '装甲片', maxLevel: 6, category: 'assist' },
  { type: 'deflect_shield', name: '偏转护盾', maxLevel: 6, category: 'assist' },
  { type: 'explosive_warhead', name: '爆炸弹头', maxLevel: 6, category: 'assist' },
  { type: 'magnetic_field', name: '磁力场', maxLevel: 6, category: 'assist' },
  { type: 'concentrated_energy', name: '浓缩能源', maxLevel: 6, category: 'assist' },
  { type: 'loot_chip', name: '掠夺芯片', maxLevel: 6, category: 'assist' },
  { type: 'thruster', name: '推进器', maxLevel: 6, category: 'assist' },
  // 合成道具
  { type: 'synth_gatling', name: '加特林机炮', maxLevel: 8, category: 'synth' },
  { type: 'synth_rain', name: '暴雨霰弹', maxLevel: 8, category: 'synth' },
  { type: 'synth_swarm', name: '蜂群导弹', maxLevel: 8, category: 'synth' },
  { type: 'synth_plasma', name: '等离子榴弹', maxLevel: 8, category: 'synth' },
  { type: 'synth_blackhole', name: '黑洞爆破', maxLevel: 8, category: 'synth' },
  { type: 'synth_particle', name: '粒子光束', maxLevel: 8, category: 'synth' },
  { type: 'synth_omni', name: '全方向弹幕', maxLevel: 8, category: 'synth' },
  { type: 'synth_war_machine', name: '战争机器', maxLevel: 8, category: 'synth' }
];

// 关卡配置
export const LEVELS = [
  { level: 1, name: '城市上空', waves: 10 },
  { level: 2, name: '大气层边缘', waves: 12 },
  { level: 3, name: '太空轨道', waves: 14 }
];

// 经验倍率选项
export const EXP_MULTIPLIERS = [1, 2, 5, 10, 50, 100];
