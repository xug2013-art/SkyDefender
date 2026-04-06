import Sprite from '../base/sprite';
import { SCREEN_WIDTH, SCREEN_HEIGHT } from '../render';

const BACKGROUND_SPEED = 1;
const SEGMENT_HEIGHT = 1500; // 单张背景图高度
const SEGMENTS_PER_LEVEL = 5; // 每个关卡5张背景图

// 各关卡背景配置
const LEVEL_BACKGROUNDS = {
  1: [
    { src: 'images/bg_level1_1.png', width: 750, height: SEGMENT_HEIGHT },
    { src: 'images/bg_level1_2.png', width: 750, height: SEGMENT_HEIGHT },
    { src: 'images/bg_level1_3.png', width: 750, height: SEGMENT_HEIGHT },
    { src: 'images/bg_level1_4.png', width: 750, height: SEGMENT_HEIGHT },
    { src: 'images/bg_level1_5.png', width: 750, height: SEGMENT_HEIGHT }
  ],
  2: [
    { src: 'images/bg_level2_1.png', width: 750, height: SEGMENT_HEIGHT },
    { src: 'images/bg_level2_2.png', width: 750, height: SEGMENT_HEIGHT },
    { src: 'images/bg_level2_3.png', width: 750, height: SEGMENT_HEIGHT },
    { src: 'images/bg_level2_4.png', width: 750, height: SEGMENT_HEIGHT },
    { src: 'images/bg_level2_5.png', width: 750, height: SEGMENT_HEIGHT }
  ],
  3: [
    { src: 'images/bg_level3_1.png', width: 750, height: SEGMENT_HEIGHT },
    { src: 'images/bg_level3_2.png', width: 750, height: SEGMENT_HEIGHT },
    { src: 'images/bg_level3_3.png', width: 750, height: SEGMENT_HEIGHT },
    { src: 'images/bg_level3_4.png', width: 750, height: SEGMENT_HEIGHT },
    { src: 'images/bg_level3_5.png', width: 750, height: SEGMENT_HEIGHT }
  ]
};

/**
 * 游戏背景类
 * 提供 update 和 render 函数实现无限滚动的背景功能
 */
export default class BackGround {
  constructor() {
    this.currentLevel = 1;
    this.segments = []; // 背景段图片对象数组
    this.currentSegmentIndex = 0; // 当前显示的第一段索引
    this.offset = 0; // 滚动偏移量（向上滚动为正）
    this.loadSegments();
  }

  /**
   * 加载当前关卡的所有背景段
   */
  loadSegments() {
    this.segments = LEVEL_BACKGROUNDS[this.currentLevel].map(config => {
      const img = wx.createImage();
      img.src = config.src;
      return {
        img,
        width: config.width,
        height: config.height
      };
    });
    // 初始显示最后两段（从最底部开始向上滚动）
    this.currentSegmentIndex = SEGMENTS_PER_LEVEL - 2;
    this.offset = SEGMENT_HEIGHT - SCREEN_HEIGHT;
  }

  /**
   * 切换关卡背景
   */
  setImage(level) {
    if (this.currentLevel === level) return;
    this.currentLevel = level;
    this.loadSegments();
  }

  /**
   * 重置背景到初始状态
   */
  reset() {
    this.setImage(1); // 重置为第一关背景，自动重置滚动位置
  }

  update() {
    if (GameGlobal.databus.isGameOver || GameGlobal.databus.isPaused) {
      return;
    }

    // 背景向上滚动，偏移量增加
    this.offset += BACKGROUND_SPEED;

    // 当偏移量超过单段高度时，切换到上一段
    if (this.offset >= SEGMENT_HEIGHT) {
      this.offset -= SEGMENT_HEIGHT;
      this.currentSegmentIndex = (this.currentSegmentIndex - 1 + SEGMENTS_PER_LEVEL) % SEGMENTS_PER_LEVEL;
    }
  }

  /**
   * 渲染背景，支持跨段显示和循环
   */
  render(ctx) {
    const firstSegment = this.segments[this.currentSegmentIndex];
    const secondSegmentIndex = (this.currentSegmentIndex + 1) % SEGMENTS_PER_LEVEL;
    const secondSegment = this.segments[secondSegmentIndex];

    // 绘制第一段（上方部分）
    ctx.drawImage(
      firstSegment.img,
      0,
      SEGMENT_HEIGHT - this.offset, // 从第一段的offset位置开始裁剪
      firstSegment.width,
      this.offset, // 裁剪offset高度
      0,
      0,
      SCREEN_WIDTH,
      this.offset
    );

    // 绘制第二段（下方部分）
    ctx.drawImage(
      secondSegment.img,
      0,
      0, // 从第二段顶部开始裁剪
      secondSegment.width,
      SCREEN_HEIGHT - this.offset, // 裁剪剩余高度
      0,
      this.offset,
      SCREEN_WIDTH,
      SCREEN_HEIGHT - this.offset
    );
  }
}
