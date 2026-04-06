// 调试状态单例
export const DebugState = {
  // 是否启用调试模式
  enabled: false,

  // 选中的道具列表: [{type, level}, ...]
  selectedProps: [],

  // 经验倍率
  expMultiplier: 1,

  // 起始关卡
  startLevel: 1,

  // 起始波次
  startWave: 1,

  // 重置为默认值
  reset() {
    this.selectedProps = [];
    this.expMultiplier = 1;
    this.startLevel = 1;
    this.startWave = 1;
    this.enabled = false;
  },

  // 应用调试配置到游戏
  apply() {
    const databus = GameGlobal.databus;
    const main = GameGlobal.main;

    // 1. 应用道具
    if (this.selectedProps.length > 0) {
      databus.propsInventory = this.selectedProps.map(p => ({
        type: p.type,
        level: p.level || 1
      }));
    }

    // 2. 设置起始关卡和波次
    if (this.startLevel > 1 || this.startWave > 1) {
      databus.currentLevel = this.startLevel;
      databus.currentWave = this.startWave - 1; // 设为前一波，触发下一波逻辑
      databus.isWaveActive = false;
      databus.lastWaveFrame = 0;

      // 切换背景
      const { getLevelConfig } = require('../config/level');
      const levelConfig = getLevelConfig(this.startLevel);
      if (main.bg && levelConfig) {
        main.bg.setImage(levelConfig.background);
      }
    }

    // 3. 经验倍率通过注入实现
    if (this.expMultiplier > 1) {
      this.injectExpMultiplier();
    }

    console.log('✅ 调试配置已应用:', {
      props: this.selectedProps,
      expMultiplier: this.expMultiplier,
      level: this.startLevel,
      wave: this.startWave
    });
  },

  // 注入经验倍率
  injectExpMultiplier() {
    const databus = GameGlobal.databus;
    const multiplier = this.expMultiplier;

    // 保存原始经验值
    let actualExp = databus.experience || 0;

    // 拦截经验值设置
    Object.defineProperty(databus, 'experience', {
      configurable: true,
      get: () => actualExp,
      set: (v) => {
        if (v > actualExp) {
          // 增加经验时应用倍率
          const diff = v - actualExp;
          actualExp += diff * multiplier;
        } else {
          actualExp = v;
        }
      }
    });
  }
};
