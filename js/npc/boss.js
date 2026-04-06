import Enemy from './enemy';
import { SCREEN_WIDTH, SCREEN_HEIGHT } from '../render';
import Danmaku from '../bullet/danmaku';
import Prop from '../prop/index';
import { BOSS_CONFIG, BOSS_TYPES } from '../config/level';

const BOSS_IMG_SRC = 'images/boss.png';
const BOSS_EXPLO_PREFIX = 'images/explosion';

export default class Boss extends Enemy {
  constructor() {
    super();

    this.bossType = ''; // Boss类型
    this.phaseCount = 1; // 总阶段数
    this.currentPhase = 1; // 当前阶段
    this.phases = []; // 阶段配置
    this.phaseStartTime = 0; // 阶段开始帧数
    this.skillCooldowns = {}; // 技能冷却
    this.isBoss = true; // 标记为Boss
  }

  /**
   * 初始化Boss
   * @param {string} bossType - Boss类型，来自BOSS_TYPES
   */
  init(bossType = BOSS_TYPES.INTERCEPTOR) {
    this.bossType = bossType;
    const config = BOSS_CONFIG[bossType];

    if (!config) {
      console.error(`Boss config not found for type: ${bossType}`);
      return;
    }

    // 根据Boss类型设置对应的图片
    const bossImageMap = {
      [BOSS_TYPES.INTERCEPTOR]: 'images/boss_interceptor_1.png',
      [BOSS_TYPES.INTERCEPTOR_REMNANT]: 'images/boss_interceptor_1_damaged.png',
      [BOSS_TYPES.ORBITAL_GUARD]: 'images/boss_orbital_guardian.png',
      [BOSS_TYPES.ORBITAL_GUARD_REMNANT]: 'images/boss_orbital_guardian_damaged.png',
      [BOSS_TYPES.MOTHERSHIP_CORE]: 'images/boss_mothership_core.png'
    };
    if (bossImageMap[bossType]) {
      // 重新创建Image对象，避免对象池复用导致的加载状态问题
      this.img = wx.createImage();
      const imageSrc = bossImageMap[bossType];

      // 图片加载成功回调
      this.img.onload = () => {
        console.log(`Boss图片加载成功: ${imageSrc}, size=${this.img.naturalWidth}x${this.img.naturalHeight}`);
      };

      // 图片加载失败回调
      this.img.onerror = (err) => {
        console.error(`Boss图片加载失败: ${imageSrc}`, err);
      };

      // 设置图片源，触发加载
      this.img.src = imageSrc;
      console.log(`开始加载Boss图片: ${imageSrc}`);
    }

    // 基础属性
    this.name = config.name;
    this.hp = config.hp;
    this.maxHp = config.maxHp;
    this.damage = config.damage;
    this.speed = config.speed;
    this.width = config.width;
    this.height = config.height;
    this.phaseCount = config.phaseCount;
    this.phases = config.phases;
    this.dropProp = config.dropProp || false;
    this.isMidBoss = config.isMidBoss || false;
    this.score = config.score || 10000;
    this.exp = config.exp || 50;

    // 初始位置：屏幕顶部中央
    this.x = SCREEN_WIDTH / 2 - this.width / 2;
    this.y = -this.height;
    this.targetY = 100; // 入场后停留的Y坐标

    // 状态初始化
    this.currentPhase = 1;
    this.phaseStartTime = GameGlobal.databus.frame;
    this.lastShootFrame = 0;
    this.isActive = true;
    this.visible = true;
    this.isEntering = true; // 是否正在入场

    // 更新全局Boss状态
    GameGlobal.databus.boss = this;
    GameGlobal.databus.bossHealth = this.hp;
    GameGlobal.databus.bossMaxHealth = this.maxHp;
    GameGlobal.databus.bossPhase = this.currentPhase;
    GameGlobal.databus.bossTotalPhases = this.phaseCount;
    GameGlobal.databus.isBossFight = true;
    GameGlobal.databus.isMidBossFight = this.isMidBoss;
    GameGlobal.databus.showBossHealthBar = true;

    // 初始化爆炸动画
    this.initBossExplosionAnimation();
  }

  // Boss专属爆炸动画
  initBossExplosionAnimation() {
    const EXPLO_FRAME_COUNT = 19;
    const frames = Array.from(
      { length: EXPLO_FRAME_COUNT },
      (_, i) => `${BOSS_EXPLO_PREFIX}${i + 1}.png`
    );
    this.initFrames(frames);
  }

  // 更新逻辑
  update() {
    // 每120帧打印一次更新状态
    if (GameGlobal.databus.frame % 120 === 0) {
      console.log(`Boss update被调用: isActive=${this.isActive}, visible=${this.visible}, isEntering=${this.isEntering}, x=${this.x?.toFixed(1)}, y=${this.y?.toFixed(1)}`);
    }

    if (GameGlobal.databus.isGameOver || GameGlobal.databus.isPaused || !this.isActive) {
      if (GameGlobal.databus.frame % 120 === 0) {
        console.log(`Boss update被跳过: isGameOver=${GameGlobal.databus.isGameOver}, isPaused=${GameGlobal.databus.isPaused}, isActive=${this.isActive}`);
      }
      return;
    }

    // 入场动画
    if (this.isEntering) {
      this.y += this.speed * 1.5; // 加快入场速度，避免用户以为没生成

      // 入场调试信息（每30帧打印一次）
      if (GameGlobal.databus.frame % 30 === 0) {
        console.log(`Boss入场中: y=${this.y.toFixed(2)}, 目标Y=${this.targetY}, 速度=${this.speed * 1.5}`);
      }

      if (this.y >= this.targetY) {
        this.isEntering = false;
        this.phaseStartTime = GameGlobal.databus.frame;
        this.spawnTime = GameGlobal.databus.frame; // 记录生成时间
        console.log(`Boss入场完成，位置: x=${this.x.toFixed(2)}, y=${this.y.toFixed(2)}`);
      }
      return;
    }

    // 超时自动销毁（防止Boss卡关）
    if (!this.isEntering && GameGlobal.databus.frame - this.spawnTime > 60 * 60) { // 60秒超时
      console.log(`Boss ${this.bossType} 超时，自动销毁`);
      this.hp = 0;
      this.destroy();
      return;
    }

    // 阶段更新
    this.updatePhase();

    // 移动逻辑
    this.updateMovement();

    // 边界约束（强制留在屏幕内）
    this.x = Math.max(0, Math.min(SCREEN_WIDTH - this.width, this.x));
    this.y = Math.max(0, Math.min(SCREEN_HEIGHT / 2, this.y));

    // 射击逻辑
    const currentPhaseConfig = this.phases[this.currentPhase - 1];
    if (GameGlobal.databus.frame - this.lastShootFrame >= currentPhaseConfig.shootInterval) {
      this.shoot();
      this.lastShootFrame = GameGlobal.databus.frame;
    }

    // 技能逻辑
    this.updateSkills();
  }

  // 阶段更新
  updatePhase() {
    if (this.currentPhase >= this.phaseCount) return;

    const currentPhaseConfig = this.phases[this.currentPhase - 1];
    const hpPercent = this.hp / this.maxHp;

    // 检查是否进入下一阶段
    if (hpPercent <= currentPhaseConfig.hpThreshold) {
      this.currentPhase++;
      this.phaseStartTime = GameGlobal.databus.frame;
      this.onPhaseChange(this.currentPhase);

      // 更新全局Boss状态
      GameGlobal.databus.bossPhase = this.currentPhase;

      // 阶段切换特效
      GameGlobal.musicManager.playPhaseChange();
    }
  }

  // 阶段切换回调
  onPhaseChange(newPhase) {
    // 可以在这里添加阶段切换的特效、提示等
    console.log(`Boss进入第${newPhase}阶段`);
  }

  // 移动逻辑
  updateMovement() {
    const currentPhaseConfig = this.phases[this.currentPhase - 1];
    const movePattern = currentPhaseConfig.movePattern;
    const frame = GameGlobal.databus.frame - this.phaseStartTime;

    switch (movePattern) {
      case 'float': // 浮动移动
        this.y = this.targetY + Math.sin(frame * 0.02) * 20;
        this.x = (SCREEN_WIDTH / 2 - this.width / 2) + Math.sin(frame * 0.015) * 60;
        break;

      case 'zigzag': // 之字形移动
        this.y = this.targetY + Math.sin(frame * 0.01) * 15;
        this.x = (SCREEN_WIDTH / 2 - this.width / 2) + Math.sin(frame * 0.03) * 80;
        break;

      case 'fixed': // 固定位置
        this.x = SCREEN_WIDTH / 2 - this.width / 2;
        this.y = this.targetY;
        break;

      case 'horizontal_swing': // 水平摆动
        this.y = this.targetY;
        this.x = (SCREEN_WIDTH / 2 - this.width / 2) + Math.sin(frame * 0.02) * 100;
        break;

      case 'slow_float': // 缓慢浮动
        this.y = this.targetY + Math.sin(frame * 0.01) * 30;
        this.x = (SCREEN_WIDTH / 2 - this.width / 2) + Math.sin(frame * 0.008) * 50;
        break;

      case 'fixed_center': // 固定在中心
        this.x = SCREEN_WIDTH / 2 - this.width / 2;
        this.y = SCREEN_HEIGHT / 3;
        break;

      case 'slow_swing': // 缓慢摆动
        this.y = SCREEN_HEIGHT / 3 + Math.sin(frame * 0.008) * 20;
        this.x = (SCREEN_WIDTH / 2 - this.width / 2) + Math.sin(frame * 0.01) * 70;
        break;

      case 'erratic': // 不稳定移动
        this.y = this.targetY + Math.sin(frame * 0.03) * 25;
        this.x = (SCREEN_WIDTH / 2 - this.width / 2) + Math.sin(frame * 0.04) * 90 + Math.cos(frame * 0.02) * 40;
        break;

      case 'unstable': // 不稳定移动（残魂）
        this.y = this.targetY + Math.sin(frame * 0.025) * 30;
        this.x = (SCREEN_WIDTH / 2 - this.width / 2) + Math.sin(frame * 0.035) * 80;
        break;

      case 'erratic_fast': // 快速不稳定移动
        this.y = SCREEN_HEIGHT / 3 + Math.sin(frame * 0.04) * 40;
        this.x = (SCREEN_WIDTH / 2 - this.width / 2) + Math.sin(frame * 0.05) * 120;
        break;

      default:
        this.y += this.speed * 0.5;
    }

    // 边界约束
    this.x = Math.max(0, Math.min(SCREEN_WIDTH - this.width, this.x));
    this.y = Math.max(0, Math.min(SCREEN_HEIGHT / 2, this.y));
  }

  // 射击逻辑
  shoot() {
    if (!this.isActive || this.isEntering) return;

    const centerX = this.x + this.width / 2;
    const centerY = this.y + this.height / 2;
    const player = GameGlobal.main.player;
    const currentPhaseConfig = this.phases[this.currentPhase - 1];
    const shootPatterns = currentPhaseConfig.shootPatterns;

    // 随机选择一个弹幕模式
    const pattern = shootPatterns[Math.floor(Math.random() * shootPatterns.length)];
    let danmakus = [];

    switch (pattern) {
      // 拦截者一号阶段一
      case 'straight_sweep': // 单向直弹扫射
        const angle = Math.atan2(player.y + player.height / 2 - centerY,
                                player.x + player.width / 2 - centerX);
        for (let i = -5; i <= 5; i++) {
          const danmaku = GameGlobal.databus.pool.getItemByClass('danmaku', Danmaku);
          danmaku.init(centerX, centerY, 4, angle + i * 0.08);
          danmakus.push(danmaku);
        }
        break;

      case 'double_ring': // 双圈散射
        const ring1 = Danmaku.createRing(centerX, centerY, 16, 3);
        const ring2 = Danmaku.createRing(centerX, centerY, 8, 2, Math.PI / 16);
        danmakus = [...ring1, ...ring2];
        break;

      // 拦截者一号阶段二
      case 'sector_sweep': // 扇形扫射
        const playerAngle = Math.atan2(player.y + player.height / 2 - centerY,
                                      player.x + player.width / 2 - centerX);
        for (let row = 0; row < 3; row++) {
          for (let i = -6; i <= 6; i++) {
            const danmaku = GameGlobal.databus.pool.getItemByClass('danmaku', Danmaku);
            danmaku.init(centerX, centerY, 3.5 + row * 0.3,
                        playerAngle + i * 0.12 + Math.sin(GameGlobal.databus.frame * 0.02) * 0.2);
            danmakus.push(danmaku);
          }
        }
        break;

      case 'spiral': // 螺旋弹
        danmakus = Danmaku.createSpiral(centerX, centerY, 8, 0, 3, 0.04);
        break;

      // 拦截者一号·残响
      case 'random_sector': // 随机扇形
        for (let i = 0; i < 3; i++) {
          const randomAngle = Math.random() * Math.PI + Math.PI / 4;
          const sector = Danmaku.createSector(centerX, centerY, 10, Math.PI / 2, randomAngle, 3.5);
          danmakus.push(...sector);
        }
        break;

      case 'spiral_small': // 小螺旋
        danmakus = Danmaku.createSpiral(centerX, centerY, 6, 0, 4, 0.05);
        break;

      // 轨道守卫阶段一
      case 'four_direction_sector': // 四方向散射
        for (let i = 0; i < 4; i++) {
          const sector = Danmaku.createSector(centerX, centerY, 8, Math.PI / 3, Math.PI / 4 + i * Math.PI / 2, 3);
          danmakus.push(...sector);
        }
        break;

      case 'homing_group': // 追踪弹组
        for (let i = 0; i < 6; i++) {
          const danmaku = GameGlobal.databus.pool.getItemByClass('danmaku', Danmaku);
          danmaku.init(centerX, centerY, 2.5, 0, 'homing', {
            trackTarget: player
          });
          danmakus.push(danmaku);
        }
        break;

      // 轨道守卫阶段二
      case 'arc_alternate': // 弧形弹幕轮射
        const arcCount = 8;
        const direction = Math.sin(GameGlobal.databus.frame * 0.05) > 0 ? 1 : -1;
        for (let i = 0; i < arcCount; i++) {
          const danmaku = GameGlobal.databus.pool.getItemByClass('danmaku', Danmaku);
          danmaku.init(centerX, centerY, 3, Math.PI / 3 + i * 0.1 * direction, 'arc', {
            curve: direction * 0.02
          });
          danmakus.push(danmaku);
        }
        break;

      case 'laser_ring': // 激光+环形散射
        // 中间激光
        const laser = GameGlobal.databus.pool.getItemByClass('danmaku', Danmaku);
        laser.init(centerX, centerY, 5, Math.PI / 2, 'straight', {
          width: 10,
          height: 40,
          damage: 2
        });
        danmakus.push(laser);
        // 外围环形
        const ring = Danmaku.createRing(centerX, centerY, 24, 3.5);
        danmakus.push(...ring);
        break;

      // 轨道守卫阶段三
      case 'rain': // 全屏弹幕雨
        for (let i = 0; i < 15; i++) {
          const x = Math.random() * SCREEN_WIDTH;
          const danmaku = GameGlobal.databus.pool.getItemByClass('danmaku', Danmaku);
          danmaku.init(x, -10, 3, Math.PI / 2);
          danmakus.push(danmaku);
        }
        break;

      case 'homing_arc_mixed': // 追踪+弧形混合
        // 追踪弹
        for (let i = 0; i < 4; i++) {
          const danmaku = GameGlobal.databus.pool.getItemByClass('danmaku', Danmaku);
          danmaku.init(centerX, centerY, 2.5, 0, 'homing', {
            trackTarget: player
          });
          danmakus.push(danmaku);
        }
        // 弧形弹
        for (let i = 0; i < 12; i++) {
          const danmaku = GameGlobal.databus.pool.getItemByClass('danmaku', Danmaku);
          const angle = Math.PI / 4 + i * Math.PI / 6;
          danmaku.init(centerX, centerY, 3, angle, 'arc', {
            curve: (i % 2 === 0 ? 1 : -1) * 0.015
          });
          danmakus.push(danmaku);
        }
        break;

      // 轨道守卫·残魂
      case 'random_three_sector': // 随机三方向散射
        for (let i = 0; i < 3; i++) {
          const angle = Math.random() * Math.PI * 2;
          const sector = Danmaku.createSector(centerX, centerY, 6, Math.PI / 2, angle, 3.5);
          danmakus.push(...sector);
        }
        break;

      case 'arc_slow': // 慢速弧形
        for (let i = 0; i < 16; i++) {
          const danmaku = GameGlobal.databus.pool.getItemByClass('danmaku', Danmaku);
          const angle = i * Math.PI / 8;
          danmaku.init(centerX, centerY, 2.5, angle, 'arc', {
            curve: (i % 2 === 0 ? 1 : -1) * 0.01
          });
          danmakus.push(danmaku);
        }
        break;

      case 'final_rain': // 临死全屏雨
        for (let i = 0; i < 20; i++) {
          const x = Math.random() * SCREEN_WIDTH;
          const danmaku = GameGlobal.databus.pool.getItemByClass('danmaku', Danmaku);
          danmaku.init(x, -10, 4, Math.PI / 2);
          danmakus.push(danmaku);
        }
        break;

      // 母舰核心阶段一
      case 'eight_direction': // 八方向放射弹
        for (let i = 0; i < 8; i++) {
          const danmaku = GameGlobal.databus.pool.getItemByClass('danmaku', Danmaku);
          danmaku.init(centerX, centerY, 4, i * Math.PI / 4);
          danmakus.push(danmaku);
        }
        break;

      case 'small_homing_group': // 小型追踪弹群
        for (let i = 0; i < 10; i++) {
          const danmaku = GameGlobal.databus.pool.getItemByClass('danmaku', Danmaku);
          danmaku.init(centerX, centerY, 2, 0, 'homing', {
            trackTarget: player,
            width: 6,
            height: 6
          });
          danmakus.push(danmaku);
        }
        break;

      // 母舰核心阶段二
      case 'contract_expand_ring': // 收缩/扩散环形弹
        // 收缩环
        for (let i = 0; i < 24; i++) {
          const danmaku = GameGlobal.databus.pool.getItemByClass('danmaku', Danmaku);
          const angle = i * Math.PI / 12;
          danmaku.init(centerX + Math.cos(angle) * 200,
                      centerY + Math.sin(angle) * 200,
                      3, angle + Math.PI);
          danmakus.push(danmaku);
        }
        // 扩散环（延迟）
        setTimeout(() => {
          if (this.isActive) {
            const expandRing = Danmaku.createRing(centerX, centerY, 24, 3);
            GameGlobal.databus.danmakus.push(...expandRing);
          }
        }, 1000);
        break;

      case 'cross_slash': // 斜线交叉弹
        for (let i = 0; i < 10; i++) {
          // 左上到右下
          const danmaku1 = GameGlobal.databus.pool.getItemByClass('danmaku', Danmaku);
          danmaku1.init(-50, i * 60, 3.5, Math.PI / 4);
          // 右上到左下
          const danmaku2 = GameGlobal.databus.pool.getItemByClass('danmaku', Danmaku);
          danmaku2.init(SCREEN_WIDTH + 50, i * 60, 3.5, Math.PI * 3 / 4);
          danmakus.push(danmaku1, danmaku2);
        }
        break;

      // 母舰核心阶段三
      case 'mixed_all': // 混合弹幕
        // 放射弹
        for (let i = 0; i < 8; i++) {
          const danmaku = GameGlobal.databus.pool.getItemByClass('danmaku', Danmaku);
          danmaku.init(centerX, centerY, 3.5, i * Math.PI / 4);
          danmakus.push(danmaku);
        }
        // 追踪弹
        for (let i = 0; i < 6; i++) {
          const danmaku = GameGlobal.databus.pool.getItemByClass('danmaku', Danmaku);
          danmaku.init(centerX, centerY, 2.5, 0, 'homing', {
            trackTarget: player
          });
          danmakus.push(danmaku);
        }
        // 弧形弹
        for (let i = 0; i < 12; i++) {
          const danmaku = GameGlobal.databus.pool.getItemByClass('danmaku', Danmaku);
          const angle = i * Math.PI / 6;
          danmaku.init(centerX, centerY, 3, angle, 'arc', {
            curve: (i % 2 === 0 ? 1 : -1) * 0.02
          });
          danmakus.push(danmaku);
        }
        break;

      case 'crazy_sector': // 疯狂散射
        for (let i = 0; i < 20; i++) {
          const angle = Math.random() * Math.PI * 2;
          const danmaku = GameGlobal.databus.pool.getItemByClass('danmaku', Danmaku);
          danmaku.init(centerX, centerY, 3 + Math.random() * 2, angle);
          danmakus.push(danmaku);
        }
        break;

      // 母舰核心阶段四
      case 'starburst': // 满天星
        for (let i = 0; i < 30; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 2.5 + Math.random() * 2;
          const danmaku = GameGlobal.databus.pool.getItemByClass('danmaku', Danmaku);
          danmaku.init(centerX, centerY, speed, angle);
          danmakus.push(danmaku);
        }
        break;

      case 'double_spiral_homing': // 双层螺旋+追踪
        // 双层螺旋
        const spiral1 = Danmaku.createSpiral(centerX, centerY, 8, 0, 3.5, 0.05);
        const spiral2 = Danmaku.createSpiral(centerX, centerY, 8, Math.PI, 3.5, 0.05);
        danmakus.push(...spiral1, ...spiral2);
        // 追踪弹
        for (let i = 0; i < 8; i++) {
          const danmaku = GameGlobal.databus.pool.getItemByClass('danmaku', Danmaku);
          danmaku.init(centerX, centerY, 3, 0, 'homing', {
            trackTarget: player
          });
          danmakus.push(danmaku);
        }
        break;

      default:
        // 默认环形弹幕
        danmakus = Danmaku.createRing(centerX, centerY, 12, 3);
    }

    // 添加弹幕到全局
    GameGlobal.databus.danmakus.push(...danmakus);
  }

  // 技能逻辑
  updateSkills() {
    // 可以在这里实现Boss的特殊技能，比如全屏大招、召唤小怪等
    const currentFrame = GameGlobal.databus.frame;

    // 示例：每300帧释放一次技能
    if (!this.skillCooldowns['special'] || currentFrame - this.skillCooldowns['special'] >= 300) {
      this.castSpecialSkill();
      this.skillCooldowns['special'] = currentFrame;
    }
  }

  // 特殊技能
  castSpecialSkill() {
    // 不同Boss可以有不同的特殊技能
    if (this.bossType === BOSS_TYPES.MOTHERSHIP_CORE && this.currentPhase >= 3) {
      // 母舰核心召唤小怪
      for (let i = 0; i < 3; i++) {
        const enemy = GameGlobal.databus.pool.getItemByClass('enemy', Enemy);
        enemy.init('drone');
        enemy.x = SCREEN_WIDTH / 2 - 100 + i * 100;
        enemy.y = 50;
        GameGlobal.databus.enemys.push(enemy);
      }
    }
  }

  // 重写销毁逻辑
  destroy() {
    this.isActive = false;

    // 统计波次杀敌数
    if (GameGlobal.databus.isWaveActive) {
      GameGlobal.databus.waveKilledCount++;
      console.log(`Boss消灭，波次杀敌+1，当前: ${GameGlobal.databus.waveKilledCount}/${GameGlobal.databus.waveTotalEnemies}`);
    }

    // 更新全局状态
    GameGlobal.databus.isBossFight = false;
    GameGlobal.databus.isMidBossFight = false;
    GameGlobal.databus.showBossHealthBar = false;
    GameGlobal.databus.boss = null;

    // 播放爆炸动画
    this.playAnimation(19); // 19帧爆炸动画
    GameGlobal.musicManager.playBossExplosion();
    wx.vibrateShort({ type: 'heavy' });

    // 掉落道具（道中Boss）
    if (this.dropProp) {
      const prop = GameGlobal.databus.pool.getItemByClass('prop', Prop);
      prop.init(this.x + this.width / 2, this.y + this.height / 2);
      GameGlobal.databus.props.push(prop);
    }

    // 动画结束后移除
    this.on('stopAnimation', () => {
      this.remove();

      // 奖励得分和经验
      GameGlobal.databus.score += this.score;
      GameGlobal.databus.experience += this.exp;

      // 触发关卡进度更新
      GameGlobal.main.onBossDefeated(this);
    });
  }

  // 重写移除方法，Boss单独回收到boss对象池
  remove() {
    this.isActive = false;
    this.visible = false;
    const index = GameGlobal.databus.enemys.indexOf(this);
    if (index !== -1) {
      GameGlobal.databus.enemys.splice(index, 1);
      GameGlobal.databus.pool.recover('boss', this);
    }
  }

  // 重写渲染，添加血条和阶段特效
  render(ctx) {
    if (!this.visible) return;

    // 绘制Boss本体
    super.render(ctx);

    // 阶段特效
    if (this.currentPhase > 1) {
      // 阶段边框特效
      ctx.strokeStyle = `hsl(${this.currentPhase * 30}, 100%, 50%)`;
      ctx.lineWidth = 3;
      ctx.strokeRect(this.x - 5, this.y - 5, this.width + 10, this.height + 10);

      // 暴走特效
      if (this.currentPhase === this.phaseCount) {
        ctx.shadowColor = '#ff0000';
        ctx.shadowBlur = 15;
        ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
        ctx.shadowBlur = 0;
      }
    }
  }
}
