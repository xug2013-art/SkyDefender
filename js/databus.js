import Pool from './base/pool';

let instance;

/**
 * 全局状态管理器
 * 负责管理游戏的状态，包括帧数、分数、子弹、敌人和动画等
 */
export default class DataBus {
  // 直接在类中定义实例属性
  enemys = []; // 存储敌人
  bullets = []; // 存储玩家子弹
  danmakus = []; // 存储敌方弹幕
  props = []; // 存储掉落的道具
  animations = []; // 存储动画
  frame = 0; // 当前帧数
  score = 0; // 当前分数
  experience = 0; // 玩家经验值
  lives = 3; // 剩余生命数
  playerLevel = 1; // 玩家等级
  level = 1; // 当前关卡
  wave = 0; // 当前波次
  propsInventory = []; // 玩家持有的道具（最多6个）
  isGameOver = false; // 游戏是否结束
  isPaused = false; // 游戏是否暂停
  boss = null; // 当前Boss实例
  lastScoreAwardLife = 0; // 上次奖励生命的分数
  pool = new Pool(); // 初始化对象池

  // 关卡和波次相关字段
  currentLevel = 1; // 当前关卡号
  totalLevels = 3; // 总关卡数
  currentWave = 0; // 当前波次号
  wavesPerLevel = 8; // 当前关卡的总波次数
  isWaveActive = false; // 当前波次是否正在进行
  waveTotalEnemies = 0; // 当前波次的总敌人数量
  waveKilledCount = 0; // 当前波次已消灭的敌人数量
  waveSpawnedCount = 0; // 当前波次已生成的敌人数量
  lastWaveFrame = 0; // 上一波次开始的帧数
  waveInterval = 200; // 波次之间的间隔帧数

  // Boss相关字段
  bossHealth = 0; // 当前Boss血量
  bossMaxHealth = 0; // Boss最大血量
  bossPhase = 0; // 当前Boss阶段
  bossTotalPhases = 0; // Boss总阶段数
  isBossFight = false; // 是否正在Boss战
  isMidBossFight = false; // 是否正在道中Boss战
  showBossHealthBar = false; // 是否显示Boss血条

  // 游戏流程控制字段
  gameState = 'start'; // 游戏状态: start, selecting_prop, playing, paused, bossFight, levelTransition, levelComplete, gameOver
  isLevelTransition = false; // 是否处于关卡过渡
  levelTransitionTimer = 0; // 关卡过渡计时器
  currentUpgradeOptions = []; // 当前可选的升级道具
  showUpgradeUI = false; // 是否显示升级选择界面

  constructor() {
    // 确保单例模式
    if (instance) return instance;

    instance = this;
  }

  // 重置游戏状态
  reset() {
    this.frame = 0; // 当前帧数
    this.score = 0; // 当前分数
    this.experience = 0; // 玩家经验值
    this.lives = 3; // 剩余生命数
    this.playerLevel = 1; // 玩家等级
    this.level = 1; // 当前关卡
    this.wave = 0; // 当前波次
    this.bullets = []; // 存储玩家子弹
    this.enemys = []; // 存储敌人
    this.danmakus = []; // 存储敌方弹幕
    this.props = []; // 存储掉落的道具
    this.animations = []; // 存储动画
    this.propsInventory = []; // 玩家持有的道具
    this.isGameOver = false; // 游戏是否结束
    this.isPaused = false; // 游戏是否暂停
    this.boss = null; // 当前Boss实例
    this.lastScoreAwardLife = 0; // 上次奖励生命的分数

    // 重置关卡和波次字段
    this.currentLevel = 1;
    this.currentWave = 0;
    this.wavesPerLevel = 8;
    this.isWaveActive = false;
    this.waveTotalEnemies = 0;
    this.waveKilledCount = 0;
    this.waveSpawnedCount = 0;
    this.lastWaveFrame = 0;
    this.waveInterval = 200;

    // 重置Boss字段
    this.bossHealth = 0;
    this.bossMaxHealth = 0;
    this.bossPhase = 0;
    this.bossTotalPhases = 0;
    this.isBossFight = false;
    this.isMidBossFight = false;
    this.showBossHealthBar = false;

    // 重置游戏流程字段
    this.gameState = 'start';
    this.isLevelTransition = false;
    this.levelTransitionTimer = 0;
    this.currentUpgradeOptions = [];
    this.showUpgradeUI = false;
  }

  // 游戏结束
  gameOver() {
    this.isGameOver = true;
  }

  /**
   * 回收敌人，进入对象池
   * 此后不进入帧循环
   * @param {Object} enemy - 要回收的敌人对象
   */
  removeEnemy(enemy) {
    const temp = this.enemys.splice(this.enemys.indexOf(enemy), 1);
    if (temp) {
      this.pool.recover('enemy', enemy); // 回收敌人到对象池
    }
  }

  /**
   * 回收子弹，进入对象池
   * 此后不进入帧循环
   * @param {Object} bullet - 要回收的子弹对象
   */
  removeBullets(bullet) {
    const temp = this.bullets.splice(this.bullets.indexOf(bullet), 1);
    if (temp) {
      this.pool.recover('bullet', bullet); // 回收子弹到对象池
    }
  }

  /**
   * 回收敌方弹幕，进入对象池
   * 此后不进入帧循环
   * @param {Object} danmaku - 要回收的弹幕对象
   */
  removeDanmaku(danmaku) {
    const temp = this.danmakus.splice(this.danmakus.indexOf(danmaku), 1);
    if (temp) {
      this.pool.recover('danmaku', danmaku); // 回收弹幕到对象池
    }
  }

  /**
   * 回收道具，进入对象池
   * 此后不进入帧循环
   * @param {Object} prop - 要回收的道具对象
   */
  removeProp(prop) {
    const temp = this.props.splice(this.props.indexOf(prop), 1);
    if (temp) {
      this.pool.recover('prop', prop); // 回收到具到对象池
    }
  }
}
