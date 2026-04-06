import Animation from '../base/animation';
import { SCREEN_WIDTH, SCREEN_HEIGHT } from '../render';
import Bullet from './bullet';

// 玩家相关常量设置
const PLAYER_IMG_SRC = 'images/player_eagle.png';
const PLAYER_DAMAGED_IMG_SRC = 'images/player_damaged.png';
const SHIELD_IMG_SRC = 'images/effect_shield.png';
const PLAYER_WIDTH = 80;
const PLAYER_HEIGHT = 80;
const EXPLO_IMG_PREFIX = 'images/effect_explode_';
const BASE_SHOOT_INTERVAL = 20; // 基础射击间隔
const DAMAGE_INVINCIBLE_TIME = 2000; // 受伤后无敌时间（毫秒）

export default class Player extends Animation {
  constructor() {
    // 玩家阵营，血量默认1，伤害默认1
    super(PLAYER_IMG_SRC, PLAYER_WIDTH, PLAYER_HEIGHT, 0, 0, 1, 1, 'player');

    // 玩家属性
    this.baseMoveSpeed = 1; // 基础移动速度
    this.moveSpeedMultiplier = 1; // 移动速度加成倍数
    this.baseHitboxSize = 10; // 基础判定点大小（像素）
    this.hitboxSizeMultiplier = 1; // 判定点大小倍数
    this.shield = 0; // 护盾层数
    this.dodgeRate = 0; // 闪避概率（0-1）
    this.shootSpeedMultiplier = 1; // 射速加成倍数
    this.bulletDamageMultiplier = 1; // 子弹伤害加成倍数

    // 受伤状态相关
    this.isInvincible = false; // 是否处于无敌状态
    this.invincibleEndTime = 0; // 无敌结束时间
    this.normalImg = wx.createImage();
    this.normalImg.src = PLAYER_IMG_SRC;
    this.damagedImg = wx.createImage();
    this.damagedImg.src = PLAYER_DAMAGED_IMG_SRC;
    // 护盾相关
    this.shieldImg = wx.createImage();
    this.shieldImg.src = SHIELD_IMG_SRC;
    this.shieldSize = 120; // 护盾大小

    // 触摸控制相关
    this.touchStartX = 0; // 触摸开始时手指X坐标
    this.touchStartY = 0; // 触摸开始时手指Y坐标
    this.playerStartX = 0; // 触摸开始时飞机X坐标
    this.playerStartY = 0; // 触摸开始时飞机Y坐标
    this.isPrecisionMode = false; // 是否是精密移动模式
    this.precisionSpeedMultiplier = 0.5; // 精密模式移动速度倍数

    // 喷射动画相关
    this.thrusterFrames = [];
    this.currentThrusterFrame = 0;
    this.thrusterFrameCount = 3;
    this.thrusterFrameInterval = 5; // 每5帧切换一次
    this.thrusterFrameTimer = 0;

    // 初始化坐标
    this.init();

    // 初始化事件监听
    this.initEvent();

    // 初始化喷射动画
    this.initThrusterAnimation();
  }

  init() {
    // 玩家默认处于屏幕底部居中位置
    this.x = SCREEN_WIDTH / 2 - this.width / 2;
    this.y = SCREEN_HEIGHT - this.height - 30;

    // 用于在手指移动的时候标识手指是否已经在飞机上了
    this.touched = false;

    this.isActive = true;
    this.visible = true;

    // 重置属性加成
    this.moveSpeedMultiplier = 1;
    this.hitboxSizeMultiplier = 1;
    this.shield = 0;
    this.dodgeRate = 0;
    this.shootSpeedMultiplier = 1;
    this.bulletDamageMultiplier = 1;

    // 设置爆炸动画
    this.initExplosionAnimation();

    // 武器配置
    this.weapons = [];
  }

  /**
   * 根据选择的道具初始化武器
   */
  /**
   * 更新所有道具效果
   */
  updatePropsEffect() {
    const databus = GameGlobal.databus;
    console.log('重新计算道具效果');

    // 重置所有属性加成
    this.shootSpeedMultiplier = 1;
    this.bulletDamageMultiplier = 1;
    this.moveSpeedMultiplier = 1;
    this.hitboxSizeMultiplier = 1;
    this.shield = 0;
    this.dodgeRate = 0;

    // 遍历道具栏计算加成
    databus.propsInventory.forEach(prop => {
      const level = prop.level;
      switch(prop.type) {
        // 辅助道具效果
        case 'energy_core': // 能量核心：每级+15%射速
          this.shootSpeedMultiplier *= 1 + 0.15 * level;
          break;
        case 'armor_plate': // 装甲片：每级+1生命，最多+3
          const addLives = Math.min(level, 3);
          if (databus.lives < 3 + addLives) {
            databus.lives = 3 + addLives;
          }
          break;
        case 'deflect_shield': // 偏转护盾：每级+1护盾
          this.shield += level;
          break;
        case 'explosive_warhead': // 爆炸弹头：每级+15%伤害
          this.bulletDamageMultiplier *= 1 + 0.15 * level;
          break;
        case 'concentrated_energy': // 浓缩能源：每级+10%子弹速度（后续实现）
          // TODO: 子弹速度加成
          break;
        case 'thruster': // 推进器：每级+15%移动速度
          this.moveSpeedMultiplier *= 1 + 0.15 * level;
          break;
        case 'magnetic_field': // 磁力场：拾取范围扩大（在prop类中实现吸引逻辑）
          break;
        case 'loot_chip': // 掠夺芯片：掉落率提升（在敌机死亡逻辑中实现）
          break;
      }
    });

    console.log('道具效果计算完成:', {
      shootSpeedMultiplier: this.shootSpeedMultiplier,
      bulletDamageMultiplier: this.bulletDamageMultiplier,
      moveSpeedMultiplier: this.moveSpeedMultiplier,
      shield: this.shield
    });
  }

  initWeapons() {
    const databus = GameGlobal.databus;
    console.log('开始初始化武器，当前道具栏:', databus.propsInventory);
    this.weapons = [];

    // 从道具栏中获取攻击道具
    databus.propsInventory.forEach(prop => {
      let weapon = null;
      switch(prop.type) {
        case 'pulse_cannon':
          weapon = {
            type: 'pulse_cannon',
            level: prop.level,
            interval: prop.level >=6 ? 15 : prop.level >=4 ? 17 : prop.level >=2 ? 18 : 20,
            cooldown: 0
          };
          break;
        case 'shotgun':
          weapon = {
            type: 'shotgun',
            level: prop.level,
            interval: prop.level >=5 ? 20 : prop.level >=3 ? 24 : 30,
            cooldown: 0
          };
          break;
        case 'homing_missile':
          weapon = {
            type: 'homing_missile',
            level: prop.level,
            interval: prop.level >=5 ? 30 : prop.level >=3 ? 40 : 60,
            cooldown: 0
          };
          break;
        case 'arc_grenade':
          weapon = {
            type: 'arc_grenade',
            level: prop.level,
            interval: prop.level >=5 ? 20 : prop.level >=3 ? 24 : 30,
            cooldown: 0
          };
          break;
        case 'ring_blast':
          weapon = {
            type: 'ring_blast',
            level: prop.level,
            interval: prop.level >=5 ? 30 : prop.level >=3 ? 36 : 48,
            cooldown: 0
          };
          break;
        case 'pierce_laser':
          weapon = {
            type: 'pierce_laser',
            level: prop.level,
            interval: prop.level >=5 ? 25 : 30,
            cooldown: 0
          };
          break;
        case 'cross_barrage':
          weapon = {
            type: 'cross_barrage',
            level: prop.level,
            interval: prop.level >=6 ? 12 : prop.level >=4 ? 15 : prop.level >=2 ? 17 : 20,
            cooldown: 0
          };
          break;
        case 'drone_support':
          weapon = {
            type: 'drone_support',
            level: prop.level,
            interval: prop.level >=5 ? 30 : prop.level >=3 ? 40 : 60,
            cooldown: 0
          };
          break;

        // 合成高阶武器
        case 'synth_gatling': // 加特林机炮
          weapon = {
            type: 'pulse_cannon',
            level: 8,
            interval: 8, // 超高速
            cooldown: 0
          };
          // 额外属性加成
          this.bulletDamageMultiplier *= 1.5;
          this.shootSpeedMultiplier *= 2;
          break;

        case 'synth_rain': // 暴雨霰弹
          weapon = {
            type: 'shotgun',
            level: 8,
            interval: 15,
            cooldown: 0
          };
          this.bulletDamageMultiplier *= 1.8;
          break;

        case 'synth_swarm': // 蜂群导弹
          weapon = {
            type: 'homing_missile',
            level: 8,
            interval: 20,
            cooldown: 0
          };
          this.bulletDamageMultiplier *= 1.5;
          break;

        case 'synth_plasma': // 等离子榴弹
          weapon = {
            type: 'arc_grenade',
            level: 8,
            interval: 18,
            cooldown: 0
          };
          this.bulletDamageMultiplier *= 2;
          break;

        case 'synth_blackhole': // 黑洞爆破
          weapon = {
            type: 'ring_blast',
            level: 8,
            interval: 25,
            cooldown: 0
          };
          this.bulletDamageMultiplier *= 2;
          break;

        case 'synth_particle': // 粒子光束
          weapon = {
            type: 'pierce_laser',
            level: 8,
            interval: 15,
            cooldown: 0
          };
          this.bulletDamageMultiplier *= 2.5;
          break;

        case 'synth_omni': // 全方向弹幕
          weapon = {
            type: 'cross_barrage',
            level: 8,
            interval: 10,
            cooldown: 0
          };
          this.bulletDamageMultiplier *= 1.5;
          this.shootSpeedMultiplier *= 1.5;
          break;

        case 'synth_war_machine': // 战争机器
          // 添加所有武器
          ['pulse_cannon', 'shotgun', 'homing_missile', 'arc_grenade',
           'ring_blast', 'pierce_laser', 'cross_barrage', 'drone_support'].forEach(type => {
            this.weapons.push({
              type,
              level: 8,
              interval: type === 'pierce_laser' ? 15 : type === 'cross_barrage' ? 10 : 20,
              cooldown: 0
            });
          });
          // 全属性翻倍
          this.bulletDamageMultiplier *= 2;
          this.shootSpeedMultiplier *= 2;
          this.moveSpeedMultiplier *= 2;
          this.shield += 5;
          break;
      }
      if (weapon) {
        this.weapons.push(weapon);
        console.log('添加武器:', weapon);
      }
    });

    // 强制添加默认武器，确保一定会发射子弹
    if (this.weapons.length === 0) {
      console.log('没有找到武器，添加默认武器');
      this.weapons.push({
        type: 'pulse_cannon',
        level: 1,
        interval: 20,
        cooldown: 0
      });
    }

    // 更新道具效果
    this.updatePropsEffect();

    console.log('初始化武器完成，最终武器列表:', this.weapons);
  }

  /**
   * 重写碰撞检测，使用小判定点
   * @param {Sprite} sp: 其他精灵实例
   */
  isCollideWith(sp) {
    // 无敌状态下不碰撞
    if (this.isInvincible || !this.visible || !sp.visible || !this.isActive || !sp.isActive) return false;

    // 玩家判定点：中心的小圆形
    const playerCenterX = this.x + this.width / 2;
    const playerCenterY = this.y + this.height / 2;
    const hitboxRadius = this.baseHitboxSize * this.hitboxSizeMultiplier;

    // 敌方子弹/敌机的矩形碰撞
    return !!(
      playerCenterX + hitboxRadius >= sp.x &&
      playerCenterX - hitboxRadius <= sp.x + sp.width &&
      playerCenterY + hitboxRadius >= sp.y &&
      playerCenterY - hitboxRadius <= sp.y + sp.height
    );
  }

  /**
   * 玩家受伤处理
   */
  onHit() {
    // 受伤后进入无敌状态
    this.isInvincible = true;
    this.invincibleEndTime = Date.now() + DAMAGE_INVINCIBLE_TIME;
    // 切换为受伤图片
    this.img = this.damagedImg;
  }

  // 预定义爆炸的帧动画
  initExplosionAnimation() {
    const EXPLO_FRAME_COUNT = 5;
    const frames = Array.from(
      { length: EXPLO_FRAME_COUNT },
      (_, i) => `${EXPLO_IMG_PREFIX}${i + 1}.png`
    );
    this.initFrames(frames);
  }

  // 初始化引擎喷射动画
  initThrusterAnimation() {
    // 暂时用纯色矩形代替，后续替换为实际图片
    this.thrusterFrames = [
      { width: 20, height: 30, color: '#4488ff' }, // 小火焰
      { width: 20, height: 40, color: '#66aaff' }, // 中火焰
      { width: 20, height: 50, color: '#88ccff' }  // 大火焰
    ];

    // 实际项目中替换为图片加载：
    // this.thrusterFrames = [
    //   wx.createImage(), wx.createImage(), wx.createImage()
    // ];
    // this.thrusterFrames[0].src = 'images/thruster1.png';
    // this.thrusterFrames[1].src = 'images/thruster2.png';
    // this.thrusterFrames[2].src = 'images/thruster3.png';
  }

  /**
   * 判断手指是否在飞机上
   * @param {Number} x: 手指的X轴坐标
   * @param {Number} y: 手指的Y轴坐标
   * @return {Boolean}: 用于标识手指是否在飞机上的布尔值
   */
  checkIsFingerOnAir(x, y) {
    const deviation = 30;
    return (
      x >= this.x - deviation &&
      y >= this.y - deviation &&
      x <= this.x + this.width + deviation &&
      y <= this.y + this.height + deviation
    );
  }

  /**
   * 根据手指的位置设置飞机的位置
   * 保证手指处于飞机中间
   * 同时限定飞机的活动范围限制在屏幕中
   */
  setAirPosAcrossFingerPosZ(x, y) {
    const disX = Math.max(
      0,
      Math.min(x - this.width / 2, SCREEN_WIDTH - this.width)
    );
    const disY = Math.max(
      0,
      Math.min(y - this.height / 2, SCREEN_HEIGHT - this.height)
    );

    this.x = disX;
    this.y = disY;
  }

  /**
   * 玩家响应手指的触摸事件
   * 改变战机的位置，任意位置按住即可拖动
   */
  initEvent() {
    wx.onTouchStart((e) => {
      const { clientX: x, clientY: y } = e.touches[0];

      if (GameGlobal.databus.isGameOver || GameGlobal.databus.isPaused) {
        return;
      }

      // 判断是否是右侧30%精密区域
      this.isPrecisionMode = x >= SCREEN_WIDTH * 0.7;

      // 记录触摸初始位置和飞机当前位置
      this.touchStartX = x;
      this.touchStartY = y;
      this.playerStartX = this.x;
      this.playerStartY = this.y;
      this.touched = true;
    });

    wx.onTouchMove((e) => {
      const { clientX: x, clientY: y } = e.touches[0];

      if (GameGlobal.databus.isGameOver || GameGlobal.databus.isPaused || !this.touched) {
        return;
      }

      // 计算手指移动的偏移量
      let deltaX = x - this.touchStartX;
      let deltaY = y - this.touchStartY;

      // 精密模式下移动速度减半
      if (this.isPrecisionMode) {
        deltaX *= this.precisionSpeedMultiplier;
        deltaY *= this.precisionSpeedMultiplier;
      }

      // 计算飞机新位置：初始位置 + 偏移量
      let newX = this.playerStartX + deltaX;
      let newY = this.playerStartY + deltaY;

      // 限制飞机在屏幕范围内
      newX = Math.max(0, Math.min(newX, SCREEN_WIDTH - this.width));
      newY = Math.max(0, Math.min(newY, SCREEN_HEIGHT - this.height));

      // 更新飞机位置
      this.x = newX;
      this.y = newY;
    });

    wx.onTouchEnd((e) => {
      this.touched = false;
    });

    wx.onTouchCancel((e) => {
      this.touched = false;
    });
  }

  /**
   * 玩家射击操作
   * 发射单个武器的子弹
   */
  shootWeapon(weapon) {
    const centerX = this.x + this.width / 2;
    const centerY = this.y;

    switch (weapon.type) {
      case 'pulse_cannon': // 脉冲机炮
        const bulletCount = weapon.level >= 5 ? 3 : weapon.level >= 3 ? 2 : 1;
        for (let i = -(bulletCount - 1); i <= bulletCount - 1; i += 2) {
          const bullet = GameGlobal.databus.pool.getItemByClass('bullet', Bullet);
          bullet.init(centerX + i * 15 - 8, centerY - 10, 10, -Math.PI / 2, 'pulse');
          bullet.damage = Math.floor(bullet.damage * this.bulletDamageMultiplier);
          GameGlobal.databus.bullets.push(bullet);
        }
        break;

      case 'shotgun': // 散射霰弹
        const scatterCount = weapon.level >= 5 ? 16 : weapon.level >= 3 ? 10 : weapon.level >= 2 ? 8 : 6;
        const spread = Math.PI / 3; // 60度扇形
        for (let i = 0; i < scatterCount; i++) {
          const angle = -spread / 2 + (spread / (scatterCount - 1)) * i - Math.PI / 2;
          const bullet = GameGlobal.databus.pool.getItemByClass('bullet', Bullet);
          bullet.init(centerX, centerY, 8, angle, 'shotgun');
          bullet.damage = Math.floor(bullet.damage * this.bulletDamageMultiplier * 0.8); // 散射伤害稍低
          GameGlobal.databus.bullets.push(bullet);
        }
        break;

      case 'homing_missile': // 追踪导弹
        const missileCount = weapon.level >= 5 ? 3 : weapon.level >= 2 ? 2 : 1;
        for (let i = 0; i < missileCount; i++) {
          const bullet = GameGlobal.databus.pool.getItemByClass('bullet', Bullet);
          const offsetX = (i - (missileCount - 1) / 2) * 20;
          bullet.init(centerX + offsetX, centerY, 7, -Math.PI / 2, 'missile');
          bullet.damage = Math.floor(bullet.damage * this.bulletDamageMultiplier * 1.5); // 导弹伤害更高
          GameGlobal.databus.bullets.push(bullet);
        }
        break;

      case 'arc_grenade': // 弧形榴弹
        const grenadeCount = weapon.level >= 5 ? 5 : weapon.level >= 3 ? 4 : 3;
        const arcSpread = Math.PI / 2; // 90度弧形
        for (let i = 0; i < grenadeCount; i++) {
          const angle = -arcSpread / 2 + (arcSpread / (grenadeCount - 1)) * i - Math.PI / 2;
          const bullet = GameGlobal.databus.pool.getItemByClass('bullet', Bullet);
          bullet.init(centerX, centerY, 8, angle, 'grenade');
          bullet.damage = Math.floor(bullet.damage * this.bulletDamageMultiplier * 1.2);
          GameGlobal.databus.bullets.push(bullet);
        }
        break;

      case 'ring_blast': // 环形爆破
        const ringCount = weapon.level >= 5 ? 3 : weapon.level >= 3 ? 2 : 1;
        for (let r = 0; r < ringCount; r++) {
          const bulletCount = weapon.level >= 4 ? 16 : weapon.level >= 2 ? 12 : 8;
          for (let i = 0; i < bulletCount; i++) {
            const angle = (Math.PI * 2 / bulletCount) * i;
            const bullet = GameGlobal.databus.pool.getItemByClass('bullet', Bullet);
            bullet.init(centerX, centerY, 6 + r * 2, angle, 'ring');
            bullet.damage = Math.floor(bullet.damage * this.bulletDamageMultiplier * 0.7);
            GameGlobal.databus.bullets.push(bullet);
          }
        }
        break;

      case 'pierce_laser': // 穿刺光束
        const laserCount = weapon.level >= 5 ? 3 : weapon.level >= 3 ? 2 : 1;
        for (let i = -(laserCount - 1); i <= laserCount - 1; i += 2) {
          const bullet = GameGlobal.databus.pool.getItemByClass('bullet', Bullet);
          bullet.init(centerX + i * 20 - 4, centerY, 12, -Math.PI / 2, 'laser');
          bullet.penetration = 999; // 无限穿透
          bullet.damage = Math.floor(bullet.damage * this.bulletDamageMultiplier * 2);
          GameGlobal.databus.bullets.push(bullet);
        }
        break;

      case 'cross_barrage': // 交叉弹幕
        const crossCount = weapon.level >= 6 ? 5 : weapon.level >= 4 ? 4 : weapon.level >= 2 ? 3 : 2;
        // 左侧弹幕
        for (let i = -crossCount; i <= crossCount; i++) {
          const bullet = GameGlobal.databus.pool.getItemByClass('bullet', Bullet);
          const angle = Math.atan2(-1, -0.5) + i * 0.1;
          bullet.init(centerX, centerY, 7, angle, 'cross');
          bullet.damage = Math.floor(bullet.damage * this.bulletDamageMultiplier);
          GameGlobal.databus.bullets.push(bullet);
        }
        // 右侧弹幕
        for (let i = -crossCount; i <= crossCount; i++) {
          const bullet = GameGlobal.databus.pool.getItemByClass('bullet', Bullet);
          const angle = Math.atan2(-1, 0.5) + i * 0.1;
          bullet.init(centerX, centerY, 7, angle, 'cross');
          bullet.damage = Math.floor(bullet.damage * this.bulletDamageMultiplier);
          GameGlobal.databus.bullets.push(bullet);
        }
        break;

      case 'drone_support': // 无人机支援
        const droneCount = weapon.level >= 5 ? 4 : weapon.level >= 3 ? 3 : weapon.level >= 2 ? 2 : 1;
        for (let i = 0; i < droneCount; i++) {
          const offsetX = (i - (droneCount - 1) / 2) * 30;
          const bullet = GameGlobal.databus.pool.getItemByClass('bullet', Bullet);
          bullet.init(centerX + offsetX, centerY - 20, 7, -Math.PI / 2, 'drone');
          bullet.damage = Math.floor(bullet.damage * this.bulletDamageMultiplier * 0.9);
          GameGlobal.databus.bullets.push(bullet);
        }
        break;

      default: // 默认单发射击
        const bullet = GameGlobal.databus.pool.getItemByClass('bullet', Bullet);
        bullet.init(centerX - 8, centerY - 10, 10, -Math.PI / 2, 'pulse');
        bullet.damage = Math.floor(bullet.damage * this.bulletDamageMultiplier);
        GameGlobal.databus.bullets.push(bullet);
    }

    GameGlobal.musicManager.playShoot(); // 播放射击音效
  }

  /**
   * 兼容旧的shoot方法，发射所有武器
   */
  shoot() {
    this.weapons.forEach(weapon => this.shootWeapon(weapon));
  }

  update() {
    const databus = GameGlobal.databus;

    // 处理无敌状态
    if (this.isInvincible && Date.now() >= this.invincibleEndTime) {
      this.isInvincible = false;
      this.img = this.normalImg; // 恢复正常图片
    }

    // 更新引擎喷射动画
    this.thrusterFrameTimer++;
    if (this.thrusterFrameTimer >= this.thrusterFrameInterval) {
      this.currentThrusterFrame = (this.currentThrusterFrame + 1) % this.thrusterFrameCount;
      this.thrusterFrameTimer = 0;
    }

    if (databus.isGameOver || databus.isPaused ||
        databus.gameState === 'selecting_prop' ||
        databus.gameState === 'upgrading' ||
        databus.isLevelTransition) {
      return;
    }

    // 按武器的各自间隔射击
    this.weapons.forEach((weapon, index) => {
      // 计算实际间隔，应用射速加成
      const actualInterval = Math.max(5, Math.floor(weapon.interval / this.shootSpeedMultiplier));

      // 冷却计时
      if (weapon.cooldown <= 0) {
        this.shootWeapon(weapon); // 只发射当前冷却好的武器
        weapon.cooldown = actualInterval; // 重置冷却
      } else {
        weapon.cooldown--;
      }
    });

    // 如果没有武器，用默认单发射击
    if (this.weapons.length === 0) {
      if (!this.defaultWeaponCooldown) this.defaultWeaponCooldown = 0;

      const actualInterval = Math.max(5, Math.floor(BASE_SHOOT_INTERVAL / this.shootSpeedMultiplier));
      if (this.defaultWeaponCooldown <= 0) {
        // 直接创建默认子弹，不调用shoot()避免空循环
        const centerX = this.x + this.width / 2;
        const centerY = this.y;
        const bullet = databus.pool.getItemByClass('bullet', Bullet);
        bullet.init(centerX - 6, centerY - 10, 10, -Math.PI / 2, 'drone');
        bullet.damage = Math.floor(bullet.damage * this.bulletDamageMultiplier);
        databus.bullets.push(bullet);
        GameGlobal.musicManager.playShoot();

        this.defaultWeaponCooldown = actualInterval;
      } else {
        this.defaultWeaponCooldown--;
      }
    }
  }

  /**
   * 重写渲染方法，添加引擎喷射效果
   */
  render(ctx) {
    if (!this.visible) return;

    // 先绘制引擎喷射（在战机下方，所以先画）
    if (this.isActive && !this.isPlaying) { // 非爆炸状态显示喷射
      const frame = this.thrusterFrames[this.currentThrusterFrame];
      const x = this.x + this.width / 2 - frame.width / 2;
      const y = this.y + this.height; // 喷射在战机背部下方

      // 暂时用纯色矩形代替，后续替换为图片绘制
      ctx.fillStyle = frame.color;
      ctx.fillRect(x, y, frame.width, frame.height);

      // 实际项目中替换为图片绘制：
      // ctx.drawImage(this.thrusterFrames[this.currentThrusterFrame], x, y, frame.width, frame.height);
    }

    // 无敌状态闪烁效果
    let renderAlpha = 1;
    if (this.isInvincible && this.isActive && !this.isPlaying) {
      const now = Date.now();
      // 每200ms闪烁一次：显示/隐藏交替
      renderAlpha = Math.floor(now / 200) % 2 === 0 ? 1 : 0.3;
    }

    // 绘制战机
    ctx.globalAlpha = renderAlpha;
    super.render(ctx);
    ctx.globalAlpha = 1;

    // 绘制护盾效果（不受闪烁影响）
    if (this.shield > 0 && this.isActive && !this.isPlaying) {
      const x = this.x + this.width / 2 - this.shieldSize / 2;
      const y = this.y + this.height / 2 - this.shieldSize / 2;
      ctx.drawImage(this.shieldImg, x, y, this.shieldSize, this.shieldSize);
    }
  }

  destroy() {
    this.isActive = false;
    this.playAnimation();
    GameGlobal.musicManager.playExplosion(); // 播放爆炸音效
    wx.vibrateShort({
      type: 'medium'
    }); // 震动
  }
}
