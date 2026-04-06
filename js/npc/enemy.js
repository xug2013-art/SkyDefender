import Animation from '../base/animation';
import { SCREEN_WIDTH, SCREEN_HEIGHT } from '../render';
import Danmaku from '../bullet/danmaku';
import { ENEMY_CONFIG } from '../config/level'; // 统一使用全局配置

const ENEMY_IMG_SRC = 'images/enemy.png';
const ENEMY_WIDTH = 60;
const ENEMY_HEIGHT = 60;
const EXPLO_IMG_PREFIX = 'images/explosion';

export default class Enemy extends Animation {
  constructor() {
    // 敌方阵营，默认血量10，伤害1
    super(ENEMY_IMG_SRC, ENEMY_WIDTH, ENEMY_HEIGHT, 0, 0, 10, 1, 'enemy');

    this.enemyType = 'normal'; // 敌机类型
    this.speed = 3; // 飞行速度
    this.movePattern = 'straight'; // 移动模式：straight/curve/teleport
    this.shootInterval = 60; // 射击间隔（帧）
    this.lastShootFrame = 0; // 上次射击帧数
    this.dropRate = 0.1; // 道具掉落概率
    this.bulletType = 'straight'; // 弹幕类型
  }

  init(enemyType = 'normal', x = null) {
    this.enemyType = enemyType;

    // 根据类型加载配置
    if (ENEMY_CONFIG[enemyType]) {
      const config = ENEMY_CONFIG[enemyType];
      this.hp = config.hp;
      this.maxHp = config.hp;
      this.damage = config.damage;
      this.speed = config.speed;
      this.width = config.width;
      this.height = config.height;
      this.dropRate = config.dropRate;
      this.shootInterval = config.shootInterval;
      this.bulletType = config.bulletType;
      // 动态设置敌机图片
      if (config.imgSrc) {
        this.img.src = config.imgSrc;
      }
    } else {
      // 默认配置
      this.hp = 10;
      this.maxHp = 10;
      this.speed = Math.random() * 6 + 3;
      this.dropRate = 0.1;
    }

    // 如果传入了x坐标就用传入的，否则随机
    if (x !== null) {
      this.x = x;
    } else {
      this.x = this.getRandomX();
    }
    this.y = -this.height;
    this.lastShootFrame = 0;
    this.spawnTime = null; // 重置生成时间，避免对象池复用时超时误判

    this.isActive = true;
    this.visible = true;
    // 设置爆炸动画
    this.initExplosionAnimation();
  }

  // 生成随机 X 坐标
  getRandomX() {
    return Math.floor(Math.random() * (SCREEN_WIDTH - ENEMY_WIDTH));
  }

  // 预定义爆炸的帧动画
  initExplosionAnimation() {
    const EXPLO_FRAME_COUNT = 19;
    const frames = Array.from(
      { length: EXPLO_FRAME_COUNT },
      (_, i) => `${EXPLO_IMG_PREFIX}${i + 1}.png`
    );
    this.initFrames(frames);
  }

  // 每一帧更新敌人位置
  update() {
    // 精英怪每30帧输出一次状态调试
    if (this.dropRate >= 1 && GameGlobal.databus.frame % 30 === 0) {
      console.log(`精英状态: type=${this.enemyType}, x=${this.x.toFixed(1)}, y=${this.y.toFixed(1)}, isActive=${this.isActive}, visible=${this.visible}, hp=${this.hp}`);
    }

    if (GameGlobal.databus.isGameOver || GameGlobal.databus.isPaused || !this.isActive) {
      return;
    }

    // 记录生成时间
    if (!this.spawnTime) {
      this.spawnTime = GameGlobal.databus.frame;
    }

    // 精英怪超时自动销毁（防止卡关）
    if (this.dropRate >= 1 && GameGlobal.databus.frame - this.spawnTime > 30 * 60) { // 30秒超时
      console.log(`精英怪 ${this.enemyType} 超时，自动销毁`);
      this.hp = 0;
      this.destroy();
      return;
    }

    // 移动逻辑
    if (this.movePattern === 'straight') {
      this.y += this.speed;
    }

    // 边界约束（精英怪不会移出屏幕）
    if (this.dropRate >= 1) { // 必定掉落的是精英怪
      this.x = Math.max(0, Math.min(SCREEN_WIDTH - this.width, this.x));
      this.y = Math.min(SCREEN_HEIGHT / 2, this.y); // 精英怪停留在上半屏幕
    }

    // 射击逻辑
    if (GameGlobal.databus.frame - this.lastShootFrame >= this.shootInterval) {
      this.shoot();
      this.lastShootFrame = GameGlobal.databus.frame;
    }

    // 对象回收（普通敌机移出屏幕回收，精英怪不回收）
    if (this.dropRate < 1 && this.y > SCREEN_HEIGHT + this.height) {
      this.remove();
      // 统计波次杀敌数
      if (GameGlobal.databus.isWaveActive) {
        GameGlobal.databus.waveKilledCount++;
      }
    }
  }

  // 敌机射击
  shoot() {
    if (!this.isActive) return;

    const centerX = this.x + this.width / 2;
    const centerY = this.y + this.height / 2;
    const player = GameGlobal.main.player;

    let danmakus = [];

    switch (this.bulletType) {
      case 'straight': // 直线弹，3发
        danmakus = Danmaku.createSector(centerX, centerY, 3, Math.PI / 6, Math.PI / 2, 3);
        break;
      case 'scatter': // 散射，8发
        danmakus = Danmaku.createSector(centerX, centerY, 8, Math.PI / 2, Math.PI / 2, 2.5);
        break;
      case 'homing': // 追踪弹，2发
        for (let i = 0; i < 2; i++) {
          const danmaku = GameGlobal.databus.pool.getItemByClass('danmaku', Danmaku);
          danmaku.init(centerX, centerY, 2.5, Math.PI / 2, 'homing', {
            trackTarget: player
          });
          danmakus.push(danmaku);
        }
        break;
      default: // 默认直线弹
        const danmaku = GameGlobal.databus.pool.getItemByClass('danmaku', Danmaku);
        danmaku.init(centerX, centerY, 3, Math.PI / 2);
        danmakus.push(danmaku);
    }

    // 将弹幕加入全局数组
    GameGlobal.databus.danmakus.push(...danmakus);
  }

  destroy() {
    console.log(`精英怪被销毁: type=${this.enemyType}, x=${this.x?.toFixed(1)}, y=${this.y?.toFixed(1)}, hp=${this.hp}`);
    this.isActive = false;

    // 统计波次杀敌数
    if (GameGlobal.databus.isWaveActive && !this.isBoss) {
      GameGlobal.databus.waveKilledCount++;
      console.log(`杀敌+1，当前波次已消灭: ${GameGlobal.databus.waveKilledCount}/${GameGlobal.databus.waveTotalEnemies}`);
    }

    // 播放销毁动画后移除
    this.playAnimation();
    GameGlobal.musicManager.playExplosion(); // 播放爆炸音效
    wx.vibrateShort({
      type: 'light'
    }); // 轻微震动
    this.on('stopAnimation', () => this.remove());
  }

  remove() {
    this.isActive = false;
    this.visible = false;
    this.stopAnimation(); // 停止动画，防止内存泄漏
    GameGlobal.databus.removeEnemy(this);
  }
}
