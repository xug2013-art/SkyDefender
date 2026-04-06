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

    if (this.img && this.img.complete && this.img.naturalWidth > 0) {
      // 图片已加载完成，正常绘制
      ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
    } else {
      // 图片未加载完成，绘制占位框（至少让玩家看到有东西）
      ctx.fillStyle = this.isBoss ? '#ff4444' : '#666666';
      ctx.fillRect(this.x, this.y, this.width, this.height);
      // 画个边框
      ctx.strokeStyle = this.isBoss ? '#ffff00' : '#999999';
      ctx.lineWidth = 2;
      ctx.strokeRect(this.x, this.y, this.width, this.height);
      // 如果是Boss，显示文字
      if (this.isBoss && this.name) {
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(this.name, this.x + this.width / 2, this.y + this.height / 2);
      }
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
