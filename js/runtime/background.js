import Sprite from '../base/sprite';
import { SCREEN_WIDTH, SCREEN_HEIGHT } from '../render';

const BACKGROUND_SPEED = 2;

// 各关卡背景配置
const LEVEL_BACKGROUNDS = {
  1: { src: 'images/bg_level1_city.png', width: 750, height: 3000 },
  2: { src: 'images/bg_level2_atmosphere.png', width: 750, height: 3000 },
  3: { src: 'images/bg_level3_space.png', width: 750, height: 3000 }
};

/**
 * 游戏背景类
 * 提供 update 和 render 函数实现无限滚动的背景功能
 */
export default class BackGround extends Sprite {
  constructor() {
    const config = LEVEL_BACKGROUNDS[1]; // 默认第一关背景
    super(config.src, config.width, config.height);
    this.top = 0;
    this.currentLevel = 1;
  }

  /**
   * 切换关卡背景
   */
  setImage(level) {
    if (this.currentLevel === level) return;

    const config = LEVEL_BACKGROUNDS[level];
    this.img.src = config.src;
    this.width = config.width;
    this.height = config.height;
    this.currentLevel = level;
    this.top = 0; // 重置滚动位置
  }

  update() {
    if (GameGlobal.databus.isGameOver || GameGlobal.databus.isPaused) {
      return;
    }

    // 背景向上滚动（数值越大，背景越靠下，视觉上向上飞）
    this.top += BACKGROUND_SPEED;

    // 不需要循环，滚动到背景末尾就停止
    if (this.top >= this.height - SCREEN_HEIGHT) {
      this.top = this.height - SCREEN_HEIGHT;
    }
  }

  /**
   * 长背景渲染，不需要拼接
   */
  render(ctx) {
    ctx.drawImage(
      this.img,
      0,
      this.top, // 从背景图的top位置开始裁剪
      this.width,
      SCREEN_HEIGHT, // 裁剪一屏高度
      0,
      0,
      SCREEN_WIDTH,
      SCREEN_HEIGHT
    );
  }
}
