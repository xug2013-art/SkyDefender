import { ALL_PROPS, LEVELS, EXP_MULTIPLIERS } from './config.js';
import { DebugState } from './state.js';
import { SCREEN_WIDTH, SCREEN_HEIGHT } from '../render.js';

export class DebugMenu {
  constructor() {
    this.activeTab = 0; // 0:道具, 1:倍率, 2:关卡, 3:确认
    this.tabs = ['道具配置', '经验倍率', '关卡选择', '开始游戏'];
    this.scrollOffset = 0; // 道具列表滚动偏移

    // UI区域配置
    this.tabArea = { startY: 60, height: 50 };
    this.contentArea = { startY: 120, height: SCREEN_HEIGHT - 200 }; // 扩大内容区，包含确认按钮
    this.btnArea = { startY: SCREEN_HEIGHT - 140, height: 80 };

    this.backBtnArea = null;
  }

  // 渲染调试菜单
  render(ctx) {
    // 背景
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

    // 标题
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('开发者模式', SCREEN_WIDTH / 2, 40);

    // Tab栏
    this.renderTabs(ctx);

    // 内容区
    this.renderContent(ctx);

    // 返回按钮
    this.renderBackButton(ctx);

    ctx.textAlign = 'left';
  }

  renderTabs(ctx) {
    const tabWidth = SCREEN_WIDTH / this.tabs.length;

    this.tabs.forEach((tab, i) => {
      const x = i * tabWidth;
      const y = this.tabArea.startY;

      // Tab背景
      ctx.fillStyle = this.activeTab === i ? '#e94560' : '#16213e';
      ctx.fillRect(x, y, tabWidth, this.tabArea.height);

      // Tab文字
      ctx.fillStyle = '#ffffff';
      ctx.font = '16px Arial';
      ctx.fillText(tab, x + tabWidth / 2, y + this.tabArea.height / 2 + 6);
    });
  }

  renderContent(ctx) {
    switch (this.activeTab) {
      case 0: this.renderPropConfig(ctx); break;
      case 1: this.renderExpConfig(ctx); break;
      case 2: this.renderLevelConfig(ctx); break;
      case 3: this.renderConfirm(ctx); break;
    }
  }

  renderPropConfig(ctx) {
    const y = this.contentArea.startY;
    const height = this.contentArea.height;

    // 提示
    ctx.fillStyle = '#aaaaaa';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('选择道具 (最多6个) - 点击可调整等级', SCREEN_WIDTH / 2, y + 20);

    // 已选道具显示
    ctx.fillStyle = '#ffffff';
    ctx.font = '16px Arial';
    ctx.fillText(`已选: ${DebugState.selectedProps.length}/6`, 80, y + 50);

    // 清空按钮
    ctx.fillStyle = '#ff4444';
    ctx.fillRect(SCREEN_WIDTH - 100, y + 30, 80, 30);
    ctx.fillStyle = '#ffffff';
    ctx.fillText('清空', SCREEN_WIDTH - 60, y + 50);

    // 道具列表
    this.renderPropList(ctx, y + 70, height - 70);
  }

  renderPropList(ctx, startY, availableHeight) {
    const itemHeight = 50;
    const padding = 10;

    ALL_PROPS.forEach((prop, i) => {
      const y = startY + i * (itemHeight + padding);

      // 检查是否选中
      const selected = DebugState.selectedProps.find(p => p.type === prop.type);

      // 背景
      ctx.fillStyle = selected ? '#0f3460' : '#16213e';
      ctx.fillRect(20, y, SCREEN_WIDTH - 40, itemHeight);

      // 选中边框
      if (selected) {
        ctx.strokeStyle = '#e94560';
        ctx.lineWidth = 2;
        ctx.strokeRect(20, y, SCREEN_WIDTH - 40, itemHeight);
      }

      // 道具名称
      ctx.fillStyle = '#ffffff';
      ctx.font = '16px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(prop.name, 40, y + 30);

      // 等级选择器（如果选中）
      if (selected) {
        const levelX = SCREEN_WIDTH - 150;
        ctx.fillStyle = '#aaaaaa';
        ctx.fillText('Lv', levelX, y + 30);

        // 减号
        ctx.fillStyle = '#ff6666';
        ctx.fillRect(levelX + 35, y + 12, 30, 26);
        ctx.fillStyle = '#ffffff';
        ctx.fillText('-', levelX + 48, y + 30);

        // 等级数字
        ctx.fillStyle = '#ffff00';
        ctx.fillText(String(selected.level), levelX + 75, y + 30);

        // 加号
        ctx.fillStyle = '#66ff66';
        ctx.fillRect(levelX + 95, y + 12, 30, 26);
        ctx.fillStyle = '#ffffff';
        ctx.fillText('+', levelX + 108, y + 30);
      }
    });

    ctx.textAlign = 'left';
  }

  renderExpConfig(ctx) {
    const y = this.contentArea.startY;

    ctx.fillStyle = '#ffffff';
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('选择经验倍率', SCREEN_WIDTH / 2, y + 40);

    // 倍率按钮网格
    const btnWidth = 120;
    const btnHeight = 60;
    const padding = 20;
    const cols = 3;

    EXP_MULTIPLIERS.forEach((mult, i) => {
      const row = Math.floor(i / cols);
      const col = i % cols;
      const x = SCREEN_WIDTH / 2 - ((cols * btnWidth + (cols-1) * padding) / 2) + col * (btnWidth + padding);
      const btnY = y + 80 + row * (btnHeight + padding);

      const selected = DebugState.expMultiplier === mult;

      ctx.fillStyle = selected ? '#e94560' : '#16213e';
      ctx.fillRect(x, btnY, btnWidth, btnHeight);

      if (selected) {
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, btnY, btnWidth, btnHeight);
      }

      ctx.fillStyle = '#ffffff';
      ctx.font = '20px Arial';
      ctx.fillText(`${mult}x`, x + btnWidth / 2, btnY + btnHeight / 2 + 7);
    });
  }

  renderLevelConfig(ctx) {
    const y = this.contentArea.startY;

    ctx.fillStyle = '#ffffff';
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('选择起始关卡和波次', SCREEN_WIDTH / 2, y + 40);

    // 关卡选择
    ctx.fillStyle = '#aaaaaa';
    ctx.font = '16px Arial';
    ctx.fillText('关卡', SCREEN_WIDTH / 2, y + 80);

    LEVELS.forEach((level, i) => {
      const x = 30 + i * (SCREEN_WIDTH - 60) / LEVELS.length;
      const btnY = y + 100;
      const width = (SCREEN_WIDTH - 60) / LEVELS.length - 10;

      const selected = DebugState.startLevel === level.level;

      ctx.fillStyle = selected ? '#e94560' : '#16213e';
      ctx.fillRect(x, btnY, width, 50);

      ctx.fillStyle = '#ffffff';
      ctx.font = '14px Arial';
      ctx.fillText(level.name, x + width / 2, btnY + 30);
    });

    // 波次选择
    const currentLevel = LEVELS.find(l => l.level === DebugState.startLevel);
    if (currentLevel) {
      ctx.fillStyle = '#aaaaaa';
      ctx.font = '16px Arial';
      ctx.fillText(`波次 (1-${currentLevel.waves})`, SCREEN_WIDTH / 2, y + 180);

      // 波次加减按钮
      const btnY = y + 200;
      const centerX = SCREEN_WIDTH / 2;

      ctx.fillStyle = '#ff6666';
      ctx.fillRect(centerX - 100, btnY, 60, 50);
      ctx.fillStyle = '#66ff66';
      ctx.fillRect(centerX + 40, btnY, 60, 50);

      ctx.fillStyle = '#ffffff';
      ctx.font = '24px Arial';
      ctx.fillText('-', centerX - 70, btnY + 32);
      ctx.fillText('+', centerX + 70, btnY + 32);

      ctx.fillStyle = '#ffff00';
      ctx.font = '28px Arial';
      ctx.fillText(String(DebugState.startWave), centerX, btnY + 35);
    }
  }

  renderConfirm(ctx) {
    const y = this.contentArea.startY;

    ctx.fillStyle = '#ffffff';
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('确认配置', SCREEN_WIDTH / 2, y + 40);

    // 显示配置摘要
    let summaryY = y + 80;
    ctx.font = '16px Arial';
    ctx.textAlign = 'left';

    // 道具
    ctx.fillStyle = '#aaaaaa';
    ctx.fillText('道具配置:', 40, summaryY);
    summaryY += 25;
    if (DebugState.selectedProps.length > 0) {
      DebugState.selectedProps.forEach(prop => {
        const propInfo = ALL_PROPS.find(p => p.type === prop.type);
        ctx.fillStyle = '#ffffff';
        ctx.fillText(`  ${propInfo?.name || prop.type} Lv.${prop.level}`, 40, summaryY);
        summaryY += 25;
      });
    } else {
      ctx.fillStyle = '#666666';
      ctx.fillText('  无（使用默认初始道具）', 40, summaryY);
      summaryY += 25;
    }

    // 经验倍率
    ctx.fillStyle = '#aaaaaa';
    ctx.fillText('经验倍率:', 40, summaryY);
    ctx.fillStyle = '#ffff00';
    ctx.fillText(`${DebugState.expMultiplier}x`, 160, summaryY);
    summaryY += 25;

    // 关卡波次
    ctx.fillStyle = '#aaaaaa';
    ctx.fillText('起始位置:', 40, summaryY);
    const levelInfo = LEVELS.find(l => l.level === DebugState.startLevel);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`${levelInfo?.name || '第' + DebugState.startLevel + '关'} 第${DebugState.startWave}波`, 160, summaryY);

    // 开始游戏按钮
    const btnWidth = 250;
    const btnHeight = 70;
    const btnY = SCREEN_HEIGHT - 160;
    ctx.fillStyle = '#e94560';
    ctx.fillRect((SCREEN_WIDTH - btnWidth) / 2, btnY, btnWidth, btnHeight);
    ctx.fillStyle = '#ffffff';
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('开始调试游戏', SCREEN_WIDTH / 2, btnY + btnHeight / 2 + 8);
  }

  renderBackButton(ctx) {
    const btnWidth = 100;
    const btnHeight = 40;
    const x = 20;
    const y = 20;

    ctx.fillStyle = '#666666';
    ctx.fillRect(x, y, btnWidth, btnHeight);
    ctx.fillStyle = '#ffffff';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('返回', x + btnWidth / 2, y + btnHeight / 2 + 6);

    // 保存按钮区域
    this.backBtnArea = { startX: x, startY: y, endX: x + btnWidth, endY: y + btnHeight };
  }

  // 处理触摸
  handleTouch(x, y) {
    // 返回按钮
    if (this.backBtnArea &&
        x >= this.backBtnArea.startX && x <= this.backBtnArea.endX &&
        y >= this.backBtnArea.startY && y <= this.backBtnArea.endY) {
      return 'back';
    }

    // Tab切换
    const tabWidth = SCREEN_WIDTH / this.tabs.length;
    if (y >= this.tabArea.startY && y <= this.tabArea.startY + this.tabArea.height) {
      this.activeTab = Math.floor(x / tabWidth);
      return null;
    }

    // 内容区处理
    if (y >= this.contentArea.startY && y <= this.contentArea.startY + this.contentArea.height) {
      const result = this.handleContentTouch(x, y);
      if (result) return result;
      return null;
    }

    return null;
  }

  handleContentTouch(x, y) {
    switch (this.activeTab) {
      case 0: this.handlePropTouch(x, y); break;
      case 1: this.handleExpTouch(x, y); break;
      case 2: this.handleLevelTouch(x, y); break;
      case 3:
        const result = this.handleConfirmTouch(x, y);
        if (result) return result;
        break;
    }
    return null;
  }

  handlePropTouch(x, y) {
    // 检查清空按钮
    if (x >= SCREEN_WIDTH - 100 && x <= SCREEN_WIDTH - 20 &&
        y >= this.contentArea.startY + 30 && y <= this.contentArea.startY + 60) {
      DebugState.selectedProps = [];
      return;
    }

    // 检查道具点击
    const itemHeight = 50;
    const padding = 10;
    const startY = this.contentArea.startY + 70;

    ALL_PROPS.forEach((prop, i) => {
      const itemY = startY + i * (itemHeight + padding);
      if (y >= itemY && y <= itemY + itemHeight && x >= 20 && x <= SCREEN_WIDTH - 20) {
        const selected = DebugState.selectedProps.find(p => p.type === prop.type);

        if (selected) {
          // 已选中，检查是否点击了等级按钮
          const levelX = SCREEN_WIDTH - 150;
          if (x >= levelX + 35 && x <= levelX + 65) {
            // 减号
            if (selected.level > 1) selected.level--;
          } else if (x >= levelX + 95 && x <= levelX + 125) {
            // 加号
            if (selected.level < prop.maxLevel) selected.level++;
          } else {
            // 点击其他区域，取消选中
            DebugState.selectedProps = DebugState.selectedProps.filter(p => p.type !== prop.type);
          }
        } else {
          // 未选中，添加
          if (DebugState.selectedProps.length < 6) {
            DebugState.selectedProps.push({ type: prop.type, level: 1 });
          }
        }
      }
    });
  }

  handleExpTouch(x, y) {
    const btnWidth = 120;
    const btnHeight = 60;
    const padding = 20;
    const cols = 3;
    const startY = this.contentArea.startY + 80;

    EXP_MULTIPLIERS.forEach((mult, i) => {
      const row = Math.floor(i / cols);
      const col = i % cols;
      const btnX = SCREEN_WIDTH / 2 - ((cols * btnWidth + (cols-1) * padding) / 2) + col * (btnWidth + padding);
      const btnY = startY + row * (btnHeight + padding);

      if (x >= btnX && x <= btnX + btnWidth && y >= btnY && y <= btnY + btnHeight) {
        DebugState.expMultiplier = mult;
      }
    });
  }

  handleLevelTouch(x, y) {
    // 关卡选择
    const levelBtnY = this.contentArea.startY + 100;
    const levelWidth = (SCREEN_WIDTH - 60) / LEVELS.length - 10;

    LEVELS.forEach((level, i) => {
      const btnX = 30 + i * (SCREEN_WIDTH - 60) / LEVELS.length;
      if (x >= btnX && x <= btnX + levelWidth && y >= levelBtnY && y <= levelBtnY + 50) {
        DebugState.startLevel = level.level;
        DebugState.startWave = 1; // 切换关卡时重置波次
      }
    });

    // 波次选择
    const waveBtnY = this.contentArea.startY + 200;
    const centerX = SCREEN_WIDTH / 2;
    const currentLevel = LEVELS.find(l => l.level === DebugState.startLevel);

    if (currentLevel) {
      // 减号
      if (x >= centerX - 100 && x <= centerX - 40 && y >= waveBtnY && y <= waveBtnY + 50) {
        if (DebugState.startWave > 1) DebugState.startWave--;
      }
      // 加号
      if (x >= centerX + 40 && x <= centerX + 100 && y >= waveBtnY && y <= waveBtnY + 50) {
        if (DebugState.startWave < currentLevel.waves) DebugState.startWave++;
      }
    }
  }

  handleConfirmTouch(x, y) {
    const btnWidth = 250;
    const btnHeight = 70;
    const btnY = SCREEN_HEIGHT - 160;

    if (x >= (SCREEN_WIDTH - btnWidth) / 2 && x <= (SCREEN_WIDTH + btnWidth) / 2 &&
        y >= btnY && y <= btnY + btnHeight) {
      // 直接开始游戏，不通过事件传递
      console.log('🎮 调试菜单：直接开始游戏');
      DebugState.enabled = true;

      const databus = GameGlobal.databus;
      const main = GameGlobal.main;

      if (databus && main) {
        // 重置数据
        databus.reset();

        // 应用调试配置
        DebugState.apply();

        // 初始化玩家
        main.player.init();
        main.player.initWeapons();
        main.bg.reset();

        // 直接进入游戏
        databus.gameState = 'playing';

        console.log('✅ 调试模式游戏已启动');
        console.log('   关卡:', databus.currentLevel);
        console.log('   波次:', databus.currentWave);
        console.log('   道具:', databus.propsInventory);
      }
      return 'start_game_direct';
    }
    return null;
  }
}
