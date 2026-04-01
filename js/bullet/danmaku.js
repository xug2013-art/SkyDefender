import Sprite from '../base/sprite';
import { SCREEN_WIDTH, SCREEN_HEIGHT } from '../render';

const DANMAKU_IMG_SRC = 'images/bullet_enemy_normal.png';
const DANMAKU_WIDTH = 8;
const DANMAKU_HEIGHT = 8;

/**
 * 敌方弹幕类
 * 支持多种弹道类型
 */
export default class Danmaku extends Sprite {
  constructor() {
    // 敌方弹幕，默认伤害1，阵营enemy
    super(DANMAKU_IMG_SRC, DANMAKU_WIDTH, DANMAKU_HEIGHT, 0, 0, 0, 1, 'enemy');

    this.speed = 3; // 飞行速度
    this.angle = 0; // 飞行角度（弧度）
    this.danmakuType = 'straight'; // 弹幕类型
    this.angularVelocity = 0; // 角速度，用于曲线/螺旋弹道
    this.acceleration = 0; // 加速度
    this.trackTarget = null; // 追踪目标
    this.lifeTime = 0; // 存在时间
    this.maxLifeTime = 600; // 最大存在时间（10秒，60fps）
  }

  /**
   * 初始化弹幕
   * @param {number} x 初始X坐标
   * @param {number} y 初始Y坐标
   * @param {number} speed 飞行速度
   * @param {number} angle 初始角度
   * @param {string} danmakuType 弹幕类型
   * @param {object} options 额外选项
   */
  init(x, y, speed, angle, danmakuType = 'straight', options = {}) {
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.angle = angle;
    this.danmakuType = danmakuType;
    this.angularVelocity = options.angularVelocity || 0;
    this.acceleration = options.acceleration || 0;
    this.trackTarget = options.trackTarget || null;
    this.width = options.width || DANMAKU_WIDTH;
    this.height = options.height || DANMAKU_HEIGHT;
    this.damage = options.damage || 1;
    this.lifeTime = 0;

    this.isActive = true;
    this.visible = true;
  }

  /**
   * 每一帧更新弹幕位置
   */
  update() {
    if (GameGlobal.databus.isGameOver || GameGlobal.databus.isPaused) {
      return;
    }

    this.lifeTime++;

    // 根据弹幕类型更新位置
    switch (this.danmakuType) {
      case 'straight': // 直线弹
        this.updateStraight();
        break;
      case 'curve': // 曲线/弧形弹
        this.updateCurve();
        break;
      case 'spiral': // 螺旋弹
        this.updateSpiral();
        break;
      case 'homing': // 追踪弹
        this.updateHoming();
        break;
      default:
        this.updateStraight();
    }

    // 加速
    this.speed += this.acceleration;

    // 超出屏幕或超过最大生命周期则销毁
    if (this.isOutOfScreen() || this.lifeTime > this.maxLifeTime) {
      this.destroy();
    }
  }

  /**
   * 直线弹道更新
   */
  updateStraight() {
    this.x += this.speed * Math.cos(this.angle);
    this.y += this.speed * Math.sin(this.angle);
  }

  /**
   * 曲线弹道更新
   */
  updateCurve() {
    this.angle += this.angularVelocity;
    this.x += this.speed * Math.cos(this.angle);
    this.y += this.speed * Math.sin(this.angle);
  }

  /**
   * 螺旋弹道更新
   */
  updateSpiral() {
    this.angle += this.angularVelocity;
    this.speed += this.acceleration;
    this.x += this.speed * Math.cos(this.angle);
    this.y += this.speed * Math.sin(this.angle);
  }

  /**
   * 追踪弹道更新
   */
  updateHoming() {
    if (this.trackTarget && this.trackTarget.isActive) {
      // 计算目标角度
      const targetX = this.trackTarget.x + this.trackTarget.width / 2;
      const targetY = this.trackTarget.y + this.trackTarget.height / 2;
      const dx = targetX - (this.x + this.width / 2);
      const dy = targetY - (this.y + this.height / 2);
      const targetAngle = Math.atan2(dy, dx);

      // 平滑转向，最大转向角度
      const maxTurnAngle = 0.05;
      const angleDiff = targetAngle - this.angle;
      const normalizedDiff = Math.atan2(Math.sin(angleDiff), Math.cos(angleDiff));

      this.angle += Math.max(-maxTurnAngle, Math.min(maxTurnAngle, normalizedDiff));
    }

    this.x += this.speed * Math.cos(this.angle);
    this.y += this.speed * Math.sin(this.angle);
  }

  /**
   * 判断是否超出屏幕
   */
  isOutOfScreen() {
    return (
      this.x < -this.width * 2 ||
      this.x > SCREEN_WIDTH + this.width * 2 ||
      this.y < -this.height * 2 ||
      this.y > SCREEN_HEIGHT + this.height * 2
    );
  }

  /**
   * 销毁弹幕
   */
  destroy() {
    this.isActive = false;
    this.visible = false;
    GameGlobal.databus.removeDanmaku(this);
  }

  /**
   * 静态方法：生成扇形弹幕
   * @param {number} x 发射点X
   * @param {number} y 发射点Y
   * @param {number} count 弹幕数量
   * @param {number} totalAngle 总角度（弧度）
   * @param {number} startAngle 起始角度
   * @param {number} speed 速度
   * @param {object} options 额外选项
   */
  static createSector(x, y, count, totalAngle, startAngle, speed, options = {}) {
    const danmakus = [];
    const angleStep = totalAngle / (count - 1);

    for (let i = 0; i < count; i++) {
      const angle = startAngle - totalAngle / 2 + angleStep * i;
      const danmaku = GameGlobal.databus.pool.getItemByClass('danmaku', Danmaku);
      danmaku.init(x, y, speed, angle, 'straight', options);
      danmakus.push(danmaku);
    }

    return danmakus;
  }

  /**
   * 静态方法：生成环形弹幕
   * @param {number} x 发射点X
   * @param {number} y 发射点Y
   * @param {number} count 弹幕数量
   * @param {number} speed 速度
   * @param {object} options 额外选项
   */
  static createRing(x, y, count, speed, options = {}) {
    return Danmaku.createSector(x, y, count, Math.PI * 2, 0, speed, options);
  }

  /**
   * 静态方法：生成螺旋弹幕
   * @param {number} x 发射点X
   * @param {number} y 发射点Y
   * @param {number} count 弹幕数量
   * @param {number} startAngle 起始角度
   * @param {number} speed 速度
   * @param {number} angularVelocity 角速度
   * @param {object} options 额外选项
   */
  static createSpiral(x, y, count, startAngle, speed, angularVelocity, options = {}) {
    const danmakus = [];
    const angleStep = (Math.PI * 2) / count;

    for (let i = 0; i < count; i++) {
      const angle = startAngle + angleStep * i;
      const danmaku = GameGlobal.databus.pool.getItemByClass('danmaku', Danmaku);
      danmaku.init(x, y, speed, angle, 'spiral', {
        ...options,
        angularVelocity
      });
      danmakus.push(danmaku);
    }

    return danmakus;
  }
}
