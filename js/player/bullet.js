import Sprite from '../base/sprite';
import { SCREEN_WIDTH, SCREEN_HEIGHT } from '../render';

// 子弹类型配置
const BULLET_CONFIG = {
  'pulse': {
    src: 'images/bullet_player_pulse.png',
    width: 16,
    height: 30
  },
  'shotgun': {
    src: 'images/bullet_shotgun.png',
    width: 12,
    height: 12
  },
  'missile': {
    src: 'images/bullet_missile.png',
    width: 20,
    height: 32
  },
  'grenade': {
    src: 'images/bullet_grenade.png',
    width: 24,
    height: 24
  },
  'ring': {
    src: 'images/bullet_ring.png',
    width: 8,
    height: 8
  },
  'laser': {
    src: 'images/bullet_laser.png',
    width: 8,
    height: 64
  },
  'cross': {
    src: 'images/bullet_cross.png',
    width: 12,
    height: 20
  },
  'drone': {
    src: 'images/bullet_drone.png',
    width: 12,
    height: 16
  }
};

// 默认子弹配置
const DEFAULT_BULLET = BULLET_CONFIG.pulse;

export default class Bullet extends Sprite {
  constructor() {
    // 玩家子弹，默认伤害1，阵营player
    super(DEFAULT_BULLET.src, DEFAULT_BULLET.width, DEFAULT_BULLET.height, 0, 0, 1, 1, 'player');

    this.bulletType = 'pulse'; // 子弹类型
    this.angle = -Math.PI / 2; // 飞行角度，默认向上（-90度）
    this.penetration = 1; // 穿透次数，1代表只能击中一次
    this.hitEnemies = []; // 已经击中过的敌人列表，避免重复击中
  }

  init(x, y, speed, angle = -Math.PI / 2, bulletType = 'pulse', damage = 1) {
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.angle = angle;
    this.bulletType = bulletType;
    this.damage = damage;

    // 根据子弹类型更新配置
    const config = BULLET_CONFIG[bulletType] || DEFAULT_BULLET;
    this.img.src = config.src;
    this.width = config.width;
    this.height = config.height;

    // 激光子弹穿透性更高
    this.penetration = bulletType === 'laser' ? 10 : 1;
    this.hitEnemies = [];
    this.isActive = true;
    this.visible = true;
  }

  // 每一帧更新子弹位置
  update() {
    if (GameGlobal.databus.isGameOver || GameGlobal.databus.isPaused) {
      return;
    }

    // 根据角度计算位移
    this.x += this.speed * Math.cos(this.angle);
    this.y += this.speed * Math.sin(this.angle);

    // 超出屏幕外销毁
    if (this.y < -this.height || this.y > SCREEN_HEIGHT + this.height ||
        this.x < -this.width || this.x > SCREEN_WIDTH + this.width) {
      this.destroy();
    }
  }

  destroy() {
    this.isActive = false;
    // 子弹没有销毁动画，直接移除
    this.remove();
  }

  remove() {
    this.isActive = false;
    this.visible = false;
    // 回收子弹对象
    GameGlobal.databus.removeBullets(this);
  }
}
