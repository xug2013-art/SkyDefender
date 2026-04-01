/**
 * 关卡配置文件
 * 包含所有关卡、波次、敌人、Boss的配置数据
 */

// 敌机类型配置
export const ENEMY_TYPES = {
  // 第一关敌机
  DRAGONFLY: 'dragonfly', // 蜻蜓侦察机
  BEETLE: 'beetle', // 甲虫轰炸机
  VIPER: 'viper', // 毒蛇追踪机

  // 第二关敌机
  METEOR: 'meteor', // 陨石碎块机
  PRISM: 'prism', // 棱镜炮台
  GHOST: 'ghost', // 幽灵穿梭机

  // 第三关敌机
  DRONE: 'drone', // 无人机群
  ION: 'ion', // 离子切割者
  BLACKHOLE: 'blackhole' // 黑洞干扰者
};

// Boss类型配置
export const BOSS_TYPES = {
  INTERCEPTOR: 'interceptor', // 拦截者一号（第一关关底）
  INTERCEPTOR_REMNANT: 'interceptor_remnant', // 拦截者一号·残响（第二关道中）
  ORBITAL_GUARD: 'orbital_guard', // 轨道守卫（第二关关底）
  ORBITAL_GUARD_REMNANT: 'orbital_guard_remnant', // 轨道守卫·残魂（第三关道中）
  MOTHERSHIP_CORE: 'mothership_core' // 母舰核心（第三关关底）
};

// 敌机属性配置
export const ENEMY_CONFIG = {
  [ENEMY_TYPES.DRAGONFLY]: {
    hp: 10,
    damage: 1,
    speed: 3,
    width: 30,
    height: 30,
    dropRate: 0.08,
    shootInterval: 60,
    bulletType: 'straight',
    score: 100,
    exp: 2
  },
  [ENEMY_TYPES.BEETLE]: {
    hp: 20,
    damage: 1,
    speed: 1.5,
    width: 50,
    height: 50,
    dropRate: 0.1,
    shootInterval: 90,
    bulletType: 'sector',
    score: 200,
    exp: 4
  },
  [ENEMY_TYPES.VIPER]: {
    hp: 10,
    damage: 1,
    speed: 2.5,
    width: 35,
    height: 35,
    dropRate: 0.08,
    shootInterval: 80,
    bulletType: 'homing',
    score: 150,
    exp: 2
  },
  [ENEMY_TYPES.METEOR]: {
    hp: 25,
    damage: 1,
    speed: 2,
    width: 45,
    height: 45,
    dropRate: 0.1,
    shootInterval: 70,
    bulletType: 'arc',
    score: 250,
    exp: 4
  },
  [ENEMY_TYPES.PRISM]: {
    hp: 40,
    damage: 2,
    speed: 0.8,
    width: 60,
    height: 60,
    dropRate: 0.15,
    shootInterval: 120,
    bulletType: 'laser_sector',
    score: 400,
    exp: 8
  },
  [ENEMY_TYPES.GHOST]: {
    hp: 15,
    damage: 1,
    speed: 4,
    width: 40,
    height: 40,
    dropRate: 0.1,
    shootInterval: 100,
    bulletType: 'burst_sector',
    score: 300,
    exp: 4
  },
  [ENEMY_TYPES.DRONE]: {
    hp: 5,
    damage: 1,
    speed: 3.5,
    width: 20,
    height: 20,
    dropRate: 0.08,
    shootInterval: 50,
    bulletType: 'straight',
    score: 50,
    exp: 2
  },
  [ENEMY_TYPES.ION]: {
    hp: 50,
    damage: 2,
    speed: 1.2,
    width: 65,
    height: 65,
    dropRate: 0.15,
    shootInterval: 100,
    bulletType: 'mixed',
    score: 500,
    exp: 8
  },
  [ENEMY_TYPES.BLACKHOLE]: {
    hp: 45,
    damage: 2,
    speed: 1,
    width: 55,
    height: 55,
    dropRate: 0.15,
    shootInterval: 150,
    bulletType: 'ring',
    score: 450,
    exp: 8
  }
};

// Boss属性配置
export const BOSS_CONFIG = {
  [BOSS_TYPES.INTERCEPTOR]: {
    name: '拦截者一号',
    hp: 500,
    maxHp: 500,
    damage: 2,
    speed: 1.5,
    width: 120,
    height: 120,
    phaseCount: 2,
    phases: [
      {
        hpThreshold: 0.5, // 血量低于50%进入下一阶段
        movePattern: 'float',
        shootPatterns: ['straight_sweep', 'double_ring'],
        shootInterval: 60
      },
      {
        hpThreshold: 0,
        movePattern: 'zigzag',
        shootPatterns: ['sector_sweep', 'spiral'],
        shootInterval: 40
      }
    ],
    score: 10000,
    exp: 90,
    isMidBoss: false
  },
  [BOSS_TYPES.INTERCEPTOR_REMNANT]: {
    name: '拦截者一号·残响',
    hp: 250,
    maxHp: 250,
    damage: 2,
    speed: 2,
    width: 100,
    height: 100,
    phaseCount: 1,
    phases: [
      {
        hpThreshold: 0,
        movePattern: 'erratic',
        shootPatterns: ['random_sector', 'spiral_small'],
        shootInterval: 50
      }
    ],
    score: 5000,
    exp: 30,
    isMidBoss: true,
    dropProp: true // 必定掉落道具
  },
  [BOSS_TYPES.ORBITAL_GUARD]: {
    name: '轨道守卫',
    hp: 800,
    maxHp: 800,
    damage: 2,
    speed: 0.8,
    width: 150,
    height: 150,
    phaseCount: 3,
    phases: [
      {
        hpThreshold: 0.66,
        movePattern: 'fixed',
        shootPatterns: ['four_direction_sector', 'homing_group'],
        shootInterval: 70
      },
      {
        hpThreshold: 0.33,
        movePattern: 'horizontal_swing',
        shootPatterns: ['arc_alternate', 'laser_ring'],
        shootInterval: 60
      },
      {
        hpThreshold: 0,
        movePattern: 'slow_float',
        shootPatterns: ['rain', 'homing_arc_mixed'],
        shootInterval: 50
      }
    ],
    score: 20000,
    exp: 80,
    isMidBoss: false
  },
  [BOSS_TYPES.ORBITAL_GUARD_REMNANT]: {
    name: '轨道守卫·残魂',
    hp: 400,
    maxHp: 400,
    damage: 2,
    speed: 1,
    width: 120,
    height: 120,
    phaseCount: 1,
    phases: [
      {
        hpThreshold: 0,
        movePattern: 'unstable',
        shootPatterns: ['random_three_sector', 'arc_slow', 'final_rain'],
        shootInterval: 65
      }
    ],
    score: 5000,
    exp: 30,
    isMidBoss: true,
    dropProp: true // 必定掉落道具
  },
  [BOSS_TYPES.MOTHERSHIP_CORE]: {
    name: '母舰核心',
    hp: 1500,
    maxHp: 1500,
    damage: 3,
    speed: 0.5,
    width: 180,
    height: 180,
    phaseCount: 4,
    phases: [
      {
        hpThreshold: 0.75,
        movePattern: 'fixed_center',
        shootPatterns: ['eight_direction', 'small_homing_group'],
        shootInterval: 50
      },
      {
        hpThreshold: 0.5,
        movePattern: 'slow_swing',
        shootPatterns: ['contract_expand_ring', 'cross_slash'],
        shootInterval: 45
      },
      {
        hpThreshold: 0.25,
        movePattern: 'float',
        shootPatterns: ['mixed_all', 'crazy_sector'],
        shootInterval: 40
      },
      {
        hpThreshold: 0,
        movePattern: 'erratic_fast',
        shootPatterns: ['starburst', 'double_spiral_homing'],
        shootInterval: 35
      }
    ],
    score: 50000,
    exp: 100,
    isMidBoss: false
  }
};

// 道中精英配置
export const ELITE_CONFIG = {
  GHOST_ELITE: {
    type: ENEMY_TYPES.GHOST,
    count: 2,
    hpMultiplier: 2,
    bulletCountMultiplier: 1.5,
    score: 1000,
    exp: 15,
    dropProp: true // 必定掉落道具
  }
};

// 关卡波次配置
export const LEVEL_CONFIG = [
  // 第一关：城市上空
  {
    level: 1,
    name: '城市上空',
    wavesPerLevel: 8,
    waves: [
      { id: 1, enemies: [{ type: ENEMY_TYPES.DRAGONFLY, count: 3 }], interval: 200 },
      { id: 2, enemies: [{ type: ENEMY_TYPES.DRAGONFLY, count: 5 }], interval: 200 },
      { id: 3, enemies: [{ type: ENEMY_TYPES.BEETLE, count: 2 }], interval: 250 },
      { id: 4, enemies: [{ type: ENEMY_TYPES.DRAGONFLY, count: 3 }, { type: ENEMY_TYPES.BEETLE, count: 2 }], interval: 250 },
      // 第4波后生成道中精英
      { id: 5, elite: ELITE_CONFIG.GHOST_ELITE, interval: 300 },
      { id: 6, enemies: [{ type: ENEMY_TYPES.VIPER, count: 3 }], interval: 220 },
      { id: 7, enemies: [{ type: ENEMY_TYPES.BEETLE, count: 3 }, { type: ENEMY_TYPES.VIPER, count: 2 }], interval: 250 },
      { id: 8, enemies: [{ type: ENEMY_TYPES.DRAGONFLY, count: 4 }, { type: ENEMY_TYPES.BEETLE, count: 2 }, { type: ENEMY_TYPES.VIPER, count: 2 }], interval: 280 },
      { id: 9, enemies: [{ type: ENEMY_TYPES.DRAGONFLY, count: 3 }, { type: ENEMY_TYPES.BEETLE, count: 3 }, { type: ENEMY_TYPES.VIPER, count: 3 }], interval: 300 },
      // 第8波后生成关底Boss
      { id: 10, boss: BOSS_TYPES.INTERCEPTOR }
    ],
    background: 'images/bg_city.png'
  },
  // 第二关：大气层边缘
  {
    level: 2,
    name: '大气层边缘',
    wavesPerLevel: 10,
    waves: [
      { id: 1, enemies: [{ type: ENEMY_TYPES.METEOR, count: 3 }], interval: 200 },
      { id: 2, enemies: [{ type: ENEMY_TYPES.METEOR, count: 5 }], interval: 200 },
      { id: 3, enemies: [{ type: ENEMY_TYPES.PRISM, count: 2 }], interval: 250 },
      { id: 4, enemies: [{ type: ENEMY_TYPES.METEOR, count: 3 }, { type: ENEMY_TYPES.PRISM, count: 2 }], interval: 250 },
      { id: 5, enemies: [{ type: ENEMY_TYPES.GHOST, count: 3 }], interval: 220 },
      // 第5波后生成道中Boss
      { id: 6, boss: BOSS_TYPES.INTERCEPTOR_REMNANT },
      { id: 7, enemies: [{ type: ENEMY_TYPES.PRISM, count: 2 }, { type: ENEMY_TYPES.GHOST, count: 3 }], interval: 280 },
      { id: 8, enemies: [{ type: ENEMY_TYPES.METEOR, count: 4 }, { type: ENEMY_TYPES.PRISM, count: 2 }, { type: ENEMY_TYPES.GHOST, count: 2 }], interval: 280 },
      { id: 9, enemies: [{ type: ENEMY_TYPES.METEOR, count: 3 }, { type: ENEMY_TYPES.PRISM, count: 3 }, { type: ENEMY_TYPES.GHOST, count: 3 }], interval: 300 },
      { id: 10, enemies: [{ type: ENEMY_TYPES.METEOR, count: 4 }, { type: ENEMY_TYPES.PRISM, count: 4 }, { type: ENEMY_TYPES.GHOST, count: 4 }], interval: 320 },
      { id: 11, enemies: [{ type: ENEMY_TYPES.METEOR, count: 5 }, { type: ENEMY_TYPES.PRISM, count: 3 }, { type: ENEMY_TYPES.GHOST, count: 3 }], interval: 350 },
      // 第10波后生成关底Boss
      { id: 12, boss: BOSS_TYPES.ORBITAL_GUARD }
    ],
    background: 'images/bg_atmosphere.png'
  },
  // 第三关：太空轨道
  {
    level: 3,
    name: '太空轨道',
    wavesPerLevel: 12,
    waves: [
      { id: 1, enemies: [{ type: ENEMY_TYPES.DRONE, count: 2 }], interval: 180 },
      { id: 2, enemies: [{ type: ENEMY_TYPES.DRONE, count: 4 }], interval: 180 },
      { id: 3, enemies: [{ type: ENEMY_TYPES.ION, count: 2 }], interval: 250 },
      { id: 4, enemies: [{ type: ENEMY_TYPES.DRONE, count: 3 }, { type: ENEMY_TYPES.ION, count: 2 }], interval: 220 },
      { id: 5, enemies: [{ type: ENEMY_TYPES.BLACKHOLE, count: 2 }], interval: 280 },
      { id: 6, enemies: [{ type: ENEMY_TYPES.ION, count: 2 }, { type: ENEMY_TYPES.BLACKHOLE, count: 2 }], interval: 280 },
      // 第6波后生成道中Boss
      { id: 7, boss: BOSS_TYPES.ORBITAL_GUARD_REMNANT },
      { id: 8, enemies: [{ type: ENEMY_TYPES.DRONE, count: 5 }, { type: ENEMY_TYPES.ION, count: 2 }, { type: ENEMY_TYPES.BLACKHOLE, count: 2 }], interval: 300 },
      { id: 9, enemies: [{ type: ENEMY_TYPES.DRONE, count: 3 }, { type: ENEMY_TYPES.ION, count: 3 }, { type: ENEMY_TYPES.BLACKHOLE, count: 3 }], interval: 300 },
      { id: 10, enemies: [{ type: ENEMY_TYPES.DRONE, count: 4 }, { type: ENEMY_TYPES.ION, count: 4 }, { type: ENEMY_TYPES.BLACKHOLE, count: 4 }], interval: 320 },
      { id: 11, enemies: [{ type: ENEMY_TYPES.DRONE, count: 8 }, { type: ENEMY_TYPES.ION, count: 3 }, { type: ENEMY_TYPES.BLACKHOLE, count: 3 }], interval: 350 },
      { id: 12, enemies: [{ type: ENEMY_TYPES.DRONE, count: 10 }, { type: ENEMY_TYPES.ION, count: 4 }, { type: ENEMY_TYPES.BLACKHOLE, count: 4 }], interval: 380 },
      { id: 13, enemies: [{ type: ENEMY_TYPES.DRONE, count: 12 }, { type: ENEMY_TYPES.ION, count: 5 }, { type: ENEMY_TYPES.BLACKHOLE, count: 5 }], interval: 400 },
      // 第12波后生成关底Boss
      { id: 14, boss: BOSS_TYPES.MOTHERSHIP_CORE }
    ],
    background: 'images/bg_space.png'
  }
];

// 获取当前关卡配置
export function getLevelConfig(level) {
  return LEVEL_CONFIG.find(l => l.level === level) || LEVEL_CONFIG[0];
}

// 获取当前波次配置
export function getWaveConfig(level, waveId) {
  const levelConfig = getLevelConfig(level);
  return levelConfig.waves.find(w => w.id === waveId);
}
