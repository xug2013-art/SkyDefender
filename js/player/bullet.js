import Sprite from '../base/sprite';
import { SCREEN_WIDTH, SCREEN_HEIGHT } from '../render';

const BULLET_IMG_SRC = 'images/bullet_player_pulse.png';
const BULLET_WIDTH = 16;
const BULLET_HEIGHT = 30;

export default class Bullet extends Sprite {
  constructor() {
    // 玩家子弹，默认伤害1，阵营player
    super(BULLET_IMG_SRC, BULLET_WIDTH, BULLET_HEIGHT, 0, 0, 1, 1, 'player');

    this.bulletType = 'normal'; // 子弹类型：normal/pierce/explosive
    this.angle = -Math.PI / 2; // 飞行角度，默认向上（-90度）
    this.penetration = 1; // 穿透次数，1代表只能击中一次
    this.hitEnemies = []; // 已经击中过的敌人列表，避免重复击中
  }

  init(x, y, speed, angle = -Math.PI / 2, bulletType = 'normal', damage = 1) {
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.angle = angle;
    this.bulletType = bulletType;
    this.damage = damage;
    this.penetration = bulletType === 'pierce' ? 5 : 1;
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
