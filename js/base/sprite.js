import Emitter from '../libs/tinyemitter';

/**
 * 游戏基础的精灵类
 */
export default class Sprite extends Emitter {
  visible = true; // 是否可见
  isActive = true; // 是否可碰撞
  hp = 1; // 血量
  maxHp = 1; // 最大血量
  damage = 1; // 伤害值
  camp = 'neutral'; // 阵营：player/enemy/neutral

  constructor(imgSrc = '', width = 0, height = 0, x = 0, y = 0, hp = 1, damage = 1, camp = 'neutral') {
    super();
    
    this.img = wx.createImage();
    this.img.src = imgSrc;

    this.width = width;
    this.height = height;

    this.x = x;
    this.y = y;

    this.hp = hp;
    this.maxHp = hp;
    this.damage = damage;
    this.camp = camp;

    this.visible = true;
  }

  /**
   * 将精灵图绘制在canvas上
   */
  render(ctx) {
    if (!this.visible) return;

    // 只绘制已经加载完成的图片
    if (this.img && this.img.complete && this.img.naturalWidth > 0) {
      ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
    }
  }

  /**
   * 简单的碰撞检测定义：
   * 另一个精灵的中心点处于本精灵所在的矩形内即可
   * @param{Sprite} sp: Sptite的实例
   */
  isCollideWith(sp) {
    const spX = sp.x + sp.width / 2;
    const spY = sp.y + sp.height / 2;

    // 不可见则不检测
    if (!this.visible || !sp.visible) return false;
    // 不可碰撞则不检测
    if (!this.isActive || !sp.isActive) return false;

    return !!(
      spX >= this.x &&
      spX <= this.x + this.width &&
      spY >= this.y &&
      spY <= this.y + this.height
    );
  }
}
