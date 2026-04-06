import Emitter from '../libs/tinyemitter';
import { SCREEN_WIDTH, SCREEN_HEIGHT } from '../render';

// ========== 新增：调试模块桥接（顶层import，永远存在）==========
import { DebugBridge } from '../debug-bridge.js';
// ============================================================

const atlas = wx.createImage();
atlas.src = 'images/Common.png';

// 预加载UI资源
const uiAssets = {
  launchBg: wx.createImage(),
  gameLogo: wx.createImage(),
  btnNormal: wx.createImage(),
  btnActive: wx.createImage(),
  propSlot: wx.createImage(),
  expBarBg: wx.createImage(),
  expBarFill: wx.createImage(),
  bossHpFill: wx.createImage(),
  btnPause: wx.createImage(),
  iconShield: wx.createImage(),
  iconHeart: wx.createImage(),
  iconLevel: wx.createImage(),
  // 道具图标
  propPulseCannon: wx.createImage(),
  propShotgun: wx.createImage(),
  propMissile: wx.createImage(),
  propGrenade: wx.createImage(),
  propRingBlast: wx.createImage(),
  propLaser: wx.createImage(),
  propCrossBullet: wx.createImage(),
  propDroneSupport: wx.createImage(),
  propEnergyCore: wx.createImage(),
  propArmorPlate: wx.createImage(),
  propDeflectShield: wx.createImage(),
  // 新增辅助道具
  propExplosiveWarhead: wx.createImage(),
  propMagneticField: wx.createImage(),
  propEnergyBattery: wx.createImage(),
  propLootingChip: wx.createImage(),
  propThruster: wx.createImage(),
  // 合成道具
  propSynthRapidCannon: wx.createImage(),
  propSynthFortressShotgun: wx.createImage(),
  propSynthSmartDefense: wx.createImage(),
  propSynthAnnihilationLauncher: wx.createImage(),
  propSynthGravityRing: wx.createImage(),
  propSynthGalaxyLaser: wx.createImage(),
  propSynthGlobalLooting: wx.createImage(),
  propSynthStormDrones: wx.createImage()
};

uiAssets.launchBg.src = 'images/launch_bg.png';
uiAssets.gameLogo.src = 'images/game_logo.png';
uiAssets.btnNormal.src = 'images/btn_normal.png';
uiAssets.btnActive.src = 'images/btn_active.png';
uiAssets.propSlot.src = 'images/prop_slot.png';
uiAssets.expBarBg.src = 'images/exp_bar_bg.png';
uiAssets.expBarFill.src = 'images/exp_bar_fill.png';
uiAssets.bossHpFill.src = 'images/boss_hp_fill.png';
uiAssets.btnPause.src = 'images/btn_pause.png';
uiAssets.iconShield.src = 'images/icon_shield.png';
uiAssets.iconHeart.src = 'images/icon_heart.png';
uiAssets.iconLevel.src = 'images/icon_level.png';
// 道具图标
uiAssets.propPulseCannon.src = 'images/prop_pulse_cannon.png';
uiAssets.propShotgun.src = 'images/prop_shotgun.png';
uiAssets.propMissile.src = 'images/prop_missile.png';
uiAssets.propGrenade.src = 'images/prop_grenade.png';
uiAssets.propRingBlast.src = 'images/prop_ring_blast.png';
uiAssets.propLaser.src = 'images/prop_laser.png';
uiAssets.propCrossBullet.src = 'images/prop_cross_bullet.png';
uiAssets.propDroneSupport.src = 'images/prop_drone_support.png';
uiAssets.propEnergyCore.src = 'images/prop_energy_core.png';
uiAssets.propArmorPlate.src = 'images/prop_armor_plate.png';
uiAssets.propDeflectShield.src = 'images/prop_deflect_shield.png';
// 新增辅助道具图标
uiAssets.propExplosiveWarhead.src = 'images/prop_explosive_warhead.png';
uiAssets.propMagneticField.src = 'images/prop_magnetic_field.png';
uiAssets.propEnergyBattery.src = 'images/prop_energy_battery.png';
uiAssets.propLootingChip.src = 'images/prop_looting_chip.png';
uiAssets.propThruster.src = 'images/prop_thruster.png';
// 合成道具图标
uiAssets.propSynthRapidCannon.src = 'images/prop_synth_rapid_cannon.png';
uiAssets.propSynthFortressShotgun.src = 'images/prop_synth_fortress_shotgun.png';
uiAssets.propSynthSmartDefense.src = 'images/prop_synth_smart_defense.png';
uiAssets.propSynthAnnihilationLauncher.src = 'images/prop_synth_annihilation_launcher.png';
uiAssets.propSynthGravityRing.src = 'images/prop_synth_gravity_ring.png';
uiAssets.propSynthGalaxyLaser.src = 'images/prop_synth_galaxy_laser.png';
uiAssets.propSynthGlobalLooting.src = 'images/prop_synth_global_looting.png';
uiAssets.propSynthStormDrones.src = 'images/prop_synth_storm_drones.png';

export default class GameInfo extends Emitter {
  constructor() {
    super();

    // ========== 新增：初始化调试桥接 ==========
    DebugBridge.init();
    // =======================================

    this.btnArea = {
      startX: SCREEN_WIDTH / 2 - 40,
      startY: SCREEN_HEIGHT / 2 - 100 + 180,
      endX: SCREEN_WIDTH / 2 + 50,
      endY: SCREEN_HEIGHT / 2 - 100 + 255,
    };

    // 暂停按钮区域
    this.pauseBtnArea = {
      startX: SCREEN_WIDTH - 60,
      startY: 60,
      endX: SCREEN_WIDTH - 10,
      endY: 110,
    };

    // 随机道具抽奖动画状态
    this.lotteryState = {
      isRunning: false,
      startTime: 0,
      duration: 2000, // 动画持续2秒
      flashDuration: 1000, // 抽中后闪烁持续1秒
      currentIndex: 0,
      allProps: [],
      finalProp: null,
      callback: null,
      isFlashing: false, // 是否处于闪烁阶段
      flashStartTime: 0, // 闪烁开始时间
      lastSwitch: 0 // 上次切换道具的时间
    };

    // 升级道具二级选择状态
    this.upgradeSelectState = {
      isActive: false,
      upgradableProps: [] // 可升级的道具列表
    };

    // 绑定触摸事件
    wx.onTouchStart(this.touchEventHandler.bind(this))
  }

  /**
   * UI状态更新，处理动画逻辑
   */
  update() {
    const databus = GameGlobal.databus;
    const lottery = this.lotteryState;

    // 处理抽奖动画状态更新
    if (lottery.isRunning) {
      const now = Date.now();

      // 防止空数组导致的错误
      if (lottery.allProps.length === 0) {
        this.endLottery();
        return;
      }

      const totalDuration = lottery.duration + lottery.flashDuration;
      const elapsed = now - lottery.startTime;

      // 整个动画结束
      if (elapsed >= totalDuration) {
        this.endLottery();
        return;
      }

      if (!lottery.isFlashing) {
        // 抽奖滚动阶段
        if (elapsed >= lottery.duration) {
          // 进入闪烁阶段
          lottery.isFlashing = true;
          lottery.flashStartTime = now;
          lottery.currentIndex = lottery.allProps.indexOf(lottery.finalProp);
          return;
        }

        // 根据时间计算当前应该显示的道具索引，完全不依赖状态记录，避免累计误差
        const progress = elapsed / lottery.duration;
        // 高速滚动，2秒内200步，每10ms切换一次，保证能看到滚动效果
        const steps = Math.floor(progress * 200);
        lottery.currentIndex = steps % lottery.allProps.length;
      }
    }
  }

  /**
   * 结束抽奖动画
   */
  endLottery() {
    const databus = GameGlobal.databus;
    const lottery = this.lotteryState;

    // 执行回调，添加最终道具
    if (lottery.callback) {
      lottery.callback(lottery.finalProp);
    }
    // 重置所有抽奖状态，彻底关闭界面
    this.lotteryState = {
      isRunning: false,
      startTime: 0,
      duration: 2000,
      flashDuration: 1000,
      currentIndex: 0,
      allProps: [],
      finalProp: null,
      callback: null,
      isFlashing: false,
      flashStartTime: 0,
      lastSwitch: 0
    };
    databus.showUpgradeUI = false;
  }

  setFont(ctx) {
    ctx.fillStyle = '#ffffff';
    ctx.font = '20px Arial';
  }

  render(ctx) {
    // ========== 新增：调试菜单渲染 ==========
    if (DebugBridge.renderIfActive(ctx)) {
      return; // 调试菜单激活时不渲染其他
    }
    // =======================================

    const databus = GameGlobal.databus;

    // 游戏开始界面
    if (databus.gameState === 'start') {
      this.renderStartScreen(ctx);
      return;
    }

    // 初始道具选择界面
    if (databus.gameState === 'selecting_prop') {
      this.renderPropSelection(ctx);
      return;
    }

    // 升级选择界面
    if (databus.showUpgradeUI) {
      if (this.lotteryState.isRunning) {
        this.renderLotteryAnimation(ctx);
      } else {
        this.renderUpgradeSelection(ctx);
      }
      return;
    }

    // 游戏通关界面
    if (databus.gameState === 'gameComplete') {
      this.renderGameComplete(ctx, databus.score);
      return;
    }

    // 游戏进行中的UI
    this.renderGameScore(ctx, databus.score); // 绘制当前分数
    this.renderGameInfo(ctx); // 绘制关卡、生命、经验等信息
    this.renderBossHealthBar(ctx); // 绘制Boss血条
    this.renderLevelTransition(ctx); // 绘制关卡过渡提示

    // 游戏结束时停止帧循环并显示游戏结束画面
    if (databus.isGameOver) {
      this.renderGameOver(ctx, databus.score); // 绘制游戏结束画面
    }

    // 暂停菜单
    if (databus.isPaused) {
      this.renderPauseMenu(ctx);
    }
  }

  /**
   * 绘制游戏信息：生命值、关卡、波次、经验条
   */
  renderGameInfo(ctx) {
    const databus = GameGlobal.databus;
    this.setFont(ctx);

    // 生命值
    ctx.drawImage(uiAssets.iconHeart, 10, 35, 30, 30);
    ctx.fillText(`x ${databus.lives}`, 45, 58);

    // 护盾
    if (GameGlobal.main.player.shield > 0) {
      ctx.drawImage(uiAssets.iconShield, 100, 35, 30, 30);
      ctx.fillText(`x ${GameGlobal.main.player.shield}`, 135, 58);
    }

    // 关卡和波次
    ctx.fillText(`第${databus.currentLevel}关 第${databus.currentWave}波`, 10, 90);

    // 经验条
    const expNeeded = 20; // 每级需要20经验
    const currentExp = databus.experience % expNeeded;
    const barWidth = 400;
    const barHeight = 30;
    const x = 10;
    const y = 100;

    // 背景
    ctx.drawImage(uiAssets.expBarBg, x, y, barWidth, barHeight);
    // 进度
    if (currentExp > 0) {
      ctx.drawImage(uiAssets.expBarFill, x, y, barWidth * (currentExp / expNeeded), barHeight);
    }
    // 等级文字
    ctx.fillStyle = '#fff';
    ctx.font = '20px Arial';
    ctx.fillText(`Lv${Math.floor(databus.experience / expNeeded)}`, x + barWidth + 10, y + 22);

    // 道具栏显示
    this.renderPropInventory(ctx);

    // 暂停按钮
    this.renderPauseButton(ctx);
  }

  /**
   * 绘制玩家持有的道具栏
   */
  renderPropInventory(ctx) {
    const databus = GameGlobal.databus;
    // 道具类型到图片资源的映射
    const propImages = {
      'pulse_cannon': uiAssets.propPulseCannon,
      'shotgun': uiAssets.propShotgun,
      'homing_missile': uiAssets.propMissile,
      'arc_grenade': uiAssets.propGrenade,
      'ring_blast': uiAssets.propRingBlast,
      'pierce_laser': uiAssets.propLaser,
      'cross_barrage': uiAssets.propCrossBullet,
      'drone_support': uiAssets.propDroneSupport,
      'energy_core': uiAssets.propEnergyCore,
      'armor_plate': uiAssets.propArmorPlate,
      'deflect_shield': uiAssets.propDeflectShield,
      'explosive_warhead': uiAssets.propExplosiveWarhead,
      'magnetic_field': uiAssets.propMagneticField,
      'concentrated_energy': uiAssets.propEnergyBattery,
      'loot_chip': uiAssets.propLootingChip,
      'thruster': uiAssets.propThruster,
      // 合成道具
      'synth_gatling': uiAssets.propSynthRapidCannon,
      'synth_rain': uiAssets.propSynthFortressShotgun,
      'synth_swarm': uiAssets.propSynthSmartDefense,
      'synth_plasma': uiAssets.propSynthAnnihilationLauncher,
      'synth_blackhole': uiAssets.propSynthGravityRing,
      'synth_particle': uiAssets.propSynthGalaxyLaser,
      'synth_omni': uiAssets.propSynthGlobalLooting,
      'synth_war_machine': uiAssets.propSynthStormDrones
    };

    // 合成道具名称映射
    const synthNames = {
      'synth_gatling': '狂暴连射炮',
      'synth_rain': '要塞散弹炮台',
      'synth_swarm': '智能防御系统',
      'synth_plasma': '湮灭爆弹',
      'synth_blackhole': '引力湮灭环',
      'synth_particle': '银河粒子光束',
      'synth_omni': '全域掠夺弹幕',
      'synth_war_machine': '暴风无人机编队'
    };

    const slotSize = 40;
    const padding = 5;
    const startX = SCREEN_WIDTH - (slotSize + padding) * 6 - 10; // 最多6个道具，靠右显示
    const startY = 40; // 向下移动40px，适配刘海屏

    ctx.font = '12px Arial';
    ctx.textAlign = 'center';

    let slotIndex = 0;
    for (let i = 0; i < databus.propsInventory.length && slotIndex < 6; i++) {
      const prop = databus.propsInventory[i];
      const isSynth = prop.type.startsWith('synth_');
      const occupiedSlots = isSynth ? 2 : 1; // 合成道具占2格

      // 绘制道具槽背景
      for (let s = 0; s < occupiedSlots && slotIndex + s < 6; s++) {
        const x = startX + (slotIndex + s) * (slotSize + padding);
        const y = startY;
        ctx.drawImage(uiAssets.propSlot, x, y, slotSize, slotSize);
      }

      const x = startX + slotIndex * (slotSize + padding);
      const y = startY;
      const propImg = propImages[prop.type];

      // 绘制道具图标
      if (isSynth) {
        // 合成道具占2格宽度
        if (propImg) {
          ctx.drawImage(propImg, x + 2, y + 2, slotSize * 2 + padding - 4, slotSize - 4);
        } else {
          ctx.fillStyle = '#ffd700'; // 金色背景表示合成道具
          ctx.fillRect(x + 2, y + 2, slotSize * 2 + padding - 4, slotSize - 4);
        }
        // 显示合成道具名称缩写
        ctx.fillStyle = '#ff0000';
        ctx.font = '10px Arial';
        const name = synthNames[prop.type] || '合成';
        ctx.fillText(name.substring(0, 4), x + slotSize + padding / 2, y + slotSize / 2);
      } else {
        // 普通道具占1格
        if (propImg) {
          ctx.drawImage(propImg, x + 2, y + 2, slotSize - 4, slotSize - 4);
        } else {
          ctx.fillStyle = '#1e90ff';
          ctx.fillRect(x + 2, y + 2, slotSize - 4, slotSize - 4);
        }
        // 道具等级
        ctx.fillStyle = '#ffff00';
        ctx.font = '12px Arial';
        ctx.fillText(`Lv${prop.level}`, x + slotSize / 2, y + slotSize - 5);
      }

      slotIndex += occupiedSlots;
    }

    // 绘制剩余空槽
    for (let i = slotIndex; i < 6; i++) {
      const x = startX + i * (slotSize + padding);
      const y = startY;
      ctx.drawImage(uiAssets.propSlot, x, y, slotSize, slotSize);
    }

    ctx.textAlign = 'left';
  }

  /**
   * 绘制暂停按钮
   */
  renderPauseButton(ctx) {
    const databus = GameGlobal.databus;
    if (databus.gameState !== 'playing' || databus.isBossFight) return; // Boss战不显示暂停按钮

    const { startX, startY, endX, endY } = this.pauseBtnArea;
    const width = endX - startX;
    const height = endY - startY;

    // 暂停按钮图片
    ctx.drawImage(uiAssets.btnPause, startX, startY, width, height);
  }

  /**
   * 绘制暂停菜单
   */
  renderPauseMenu(ctx) {
    const databus = GameGlobal.databus;
    if (!databus.isPaused) return;

    // 半透明背景
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

    // 标题
    ctx.fillStyle = '#ffffff';
    ctx.font = '32px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('游戏暂停', SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 - 80);

    // 按钮
    const btnWidth = 200;
    const btnHeight = 60;
    const padding = 20;
    const startY = SCREEN_HEIGHT / 2 - 20;

    const buttons = [
      { label: '继续游戏', action: 'resume' },
      { label: '重新开始', action: 'restart' },
      { label: '返回主菜单', action: 'main_menu' }
    ];

    ctx.font = '20px Arial';
    for (let i = 0; i < buttons.length; i++) {
      const y = startY + i * (btnHeight + padding);
      const x = (SCREEN_WIDTH - btnWidth) / 2;

      // 按钮背景
      ctx.drawImage(uiAssets.btnNormal, x, y, btnWidth, btnHeight);

      // 按钮文字
      ctx.fillStyle = '#ffffff';
      ctx.fillText(buttons[i].label, x + btnWidth / 2, y + btnHeight / 2 + 7);
    }

    ctx.textAlign = 'left';
  }

  /**
   * 绘制Boss血条
   */
  renderBossHealthBar(ctx) {
    const databus = GameGlobal.databus;

    if (!databus.showBossHealthBar || !databus.boss) return;

    const barWidth = SCREEN_WIDTH - 40;
    const barHeight = 15;
    const x = 20;
    const y = 30;

    // 背景（用expBarBg代替，和经验条风格统一）
    ctx.drawImage(uiAssets.expBarBg, x, y, barWidth, barHeight);

    // 血量
    const hpPercent = databus.bossHealth / databus.bossMaxHealth;
    if (hpPercent > 0) {
      ctx.drawImage(uiAssets.bossHpFill, x, y, barWidth * hpPercent, barHeight);
    }

    // 边框
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, barWidth, barHeight);

    // Boss名称和阶段
    ctx.fillStyle = '#ffffff';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`${databus.boss.name || 'BOSS'} 阶段 ${databus.bossPhase}/${databus.bossTotalPhases}`,
      SCREEN_WIDTH / 2, y - 10);
    ctx.textAlign = 'left';
  }

  /**
   * 绘制关卡过渡提示
   */
  renderLevelTransition(ctx) {
    const databus = GameGlobal.databus;

    if (!databus.isLevelTransition) return;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

    ctx.fillStyle = '#ffffff';
    ctx.font = '30px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`第${databus.currentLevel}关 完成!`, SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 - 30);

    if (databus.currentLevel < databus.totalLevels) {
      ctx.font = '20px Arial';
      ctx.fillText('即将进入下一关...', SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 + 20);
    } else {
      ctx.font = '24px Arial';
      ctx.fillText('恭喜通关!', SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 + 20);
    }

    ctx.textAlign = 'left';
  }

  /**
   * 绘制初始道具选择界面
   */
  renderPropSelection(ctx) {
    const databus = GameGlobal.databus;
    const propNames = ['脉冲机炮', '散射霰弹', '追踪导弹', '弧形榴弹', '环形爆破', '穿刺光束', '交叉弹幕', '无人机支援'];
    const props = ['pulse_cannon', 'shotgun', 'homing_missile', 'arc_grenade', 'ring_blast', 'pierce_laser', 'cross_barrage', 'drone_support'];

    // 背景
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

    // 标题
    ctx.fillStyle = '#ffffff';
    ctx.font = '28px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('选择初始武器', SCREEN_WIDTH / 2, 50);

    // 右侧道具列表（竖排）
    const btnWidth = 180;
    const btnHeight = 50;
    const padding = 15;
    const startX = SCREEN_WIDTH - btnWidth - 30;
    const startY = 100;

    for (let i = 0; i < propNames.length; i++) {
      const y = startY + i * (btnHeight + padding);

      // 按钮背景
      ctx.fillStyle = this.selectedProp === props[i] ? '#0f3460' : '#16213e';
      ctx.fillRect(startX, y, btnWidth, btnHeight);
      ctx.strokeStyle = this.selectedProp === props[i] ? '#e94560' : '#0f3460';
      ctx.lineWidth = this.selectedProp === props[i] ? 2 : 1;
      ctx.strokeRect(startX, y, btnWidth, btnHeight);

      // 道具名称
      ctx.fillStyle = '#ffffff';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(propNames[i], startX + btnWidth / 2, y + btnHeight / 2 + 6);
    }

    // 左侧下方显示自机和攻击效果预览
    const playerX = 100;
    const playerY = SCREEN_HEIGHT - 150;
    const player = GameGlobal.main.player;

    // 绘制自机
    ctx.drawImage(player.img, playerX, playerY, player.width, player.height);

    // 绘制攻击效果预览
    if (this.selectedProp) {
      this.renderAttackPreview(ctx, this.selectedProp, playerX + player.width / 2, playerY);
    } else {
      // 默认提示
      ctx.fillStyle = '#aaaaaa';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('选择右侧道具预览攻击效果', playerX + player.width / 2, playerY - 20);
    }

    // 开始游戏提示
    ctx.fillStyle = '#ffffff';
    ctx.font = '18px Arial';
    ctx.textAlign = 'center';
    if (this.selectedProp) {
      ctx.fillText('再次点击选中道具开始游戏', SCREEN_WIDTH / 2, SCREEN_HEIGHT - 50);
    } else {
      ctx.fillText('点击道具预览攻击效果', SCREEN_WIDTH / 2, SCREEN_HEIGHT - 50);
    }

    ctx.textAlign = 'left';
  }

  /**
   * 绘制攻击效果预览
   */
  renderAttackPreview(ctx, propType, x, y) {
    ctx.strokeStyle = '#ffff00';
    ctx.lineWidth = 2;

    switch (propType) {
      case 'pulse_cannon': // 脉冲机炮：3条直线
        for (let i = -1; i <= 1; i++) {
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + i * 20, y - 100);
          ctx.stroke();
        }
        break;

      case 'shotgun': // 散射霰弹：扇形
        for (let i = -3; i <= 3; i++) {
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + i * 15, y - 80);
          ctx.stroke();
        }
        break;

      case 'homing_missile': // 追踪导弹：带弧度
        ctx.strokeStyle = '#ff6600';
        for (let i = -1; i <= 1; i += 2) {
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.quadraticCurveTo(x + i * 30, y - 40, x + i * 20, y - 100);
          ctx.stroke();
        }
        break;

      case 'arc_grenade': // 弧形榴弹
        ctx.strokeStyle = '#ff0000';
        for (let i = -2; i <= 2; i++) {
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.quadraticCurveTo(x + i * 25, y - 50, x + i * 40, y - 90);
          ctx.stroke();
        }
        break;

      case 'ring_blast': // 环形爆破
        ctx.strokeStyle = '#00ffff';
        for (let r = 20; r <= 60; r += 20) {
          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.stroke();
        }
        break;

      case 'pierce_laser': // 穿刺光束
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y - 120);
        ctx.stroke();
        ctx.lineWidth = 2;
        break;

      case 'cross_barrage': // 交叉弹幕
        ctx.strokeStyle = '#ff00ff';
        for (let i = -2; i <= 2; i++) {
          // 左侧弹幕
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x - 80, y - 30 + i * 15);
          ctx.stroke();
          // 右侧弹幕
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + 80, y - 30 + i * 15);
          ctx.stroke();
        }
        break;

      case 'drone_support': // 无人机支援
        ctx.fillStyle = '#66ccff';
        for (let i = -2; i <= 2; i += 2) {
          ctx.fillRect(x + i * 30 - 8, y - 40, 16, 16);
          // 无人机子弹
          ctx.beginPath();
          ctx.moveTo(x + i * 30, y - 40);
          ctx.lineTo(x + i * 30, y - 90);
          ctx.stroke();
        }
        break;
    }
  }

  /**
   * 绘制升级选择界面
   */
  renderUpgradeSelection(ctx) {
    const databus = GameGlobal.databus;
    const propNames = {
      'pulse_cannon': '脉冲机炮',
      'shotgun': '散射霰弹',
      'homing_missile': '追踪导弹',
      'arc_grenade': '弧形榴弹',
      'ring_blast': '环形爆破',
      'pierce_laser': '穿刺光束',
      'cross_barrage': '交叉弹幕',
      'drone_support': '无人机支援',
      'energy_core': '能量核心',
      'armor_plate': '装甲片',
      'deflect_shield': '偏转护盾',
      'explosive_warhead': '爆炸弹头',
      'magnetic_field': '磁力场',
      'concentrated_energy': '浓缩能源',
      'loot_chip': '掠夺芯片',
      'thruster': '推进器'
    };

    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

    ctx.fillStyle = '#ffffff';
    ctx.font = '28px Arial';
    ctx.textAlign = 'center';

    // 二级选择：选择要升级的道具
    if (this.upgradeSelectState.isActive) {
      ctx.fillText('选择要升级的道具', SCREEN_WIDTH / 2, 150);
      const props = this.upgradeSelectState.upgradableProps;

      const btnWidth = 300;
      const btnHeight = 80;
      const padding = 20;
      const startY = 220;

      for (let i = 0; i < props.length; i++) {
        const y = startY + i * (btnHeight + padding);
        const x = (SCREEN_WIDTH - btnWidth) / 2;

        // 按钮背景
        ctx.drawImage(uiAssets.btnNormal, x, y, btnWidth, btnHeight);

        // 道具名称和等级
        const prop = props[i];
        const name = propNames[prop.type] || prop.type;
        ctx.fillStyle = '#ffffff';
        ctx.font = '20px Arial';
        ctx.fillText(`${name} (Lv${prop.level} → Lv${prop.level + 1})`, x + btnWidth / 2, y + btnHeight / 2 + 7);
      }

      // 返回按钮
      const backY = startY + props.length * (btnHeight + padding) + 20;
      const backX = (SCREEN_WIDTH - btnWidth) / 2;
      ctx.drawImage(uiAssets.btnNormal, backX, backY, btnWidth, btnHeight);
      ctx.fillStyle = '#ffffff';
      ctx.fillText('返回', backX + btnWidth / 2, backY + btnHeight / 2 + 7);
    } else {
      // 一级选择界面
      ctx.fillText('选择升级', SCREEN_WIDTH / 2, 150);
      const options = databus.currentUpgradeOptions || [];

      const btnWidth = 300;
      const btnHeight = 80;
      const padding = 20;
      const startY = 220;

      for (let i = 0; i < options.length; i++) {
        const y = startY + i * (btnHeight + padding);
        const x = (SCREEN_WIDTH - btnWidth) / 2;

        // 按钮背景
        ctx.drawImage(uiAssets.btnNormal, x, y, btnWidth, btnHeight);

        // 升级名称
        ctx.fillStyle = '#ffffff';
        ctx.font = '20px Arial';
        ctx.fillText(options[i].name, x + btnWidth / 2, y + btnHeight / 2 + 7);
      }
    }

    ctx.textAlign = 'left';
  }

  /**
   * 渲染随机道具抽奖动画（纯渲染，不修改状态）
   */
  renderLotteryAnimation(ctx) {
    const lottery = this.lotteryState;
    const now = Date.now();

    // 动画背景
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

    // 标题
    ctx.fillStyle = '#ffffff';
    ctx.font = '28px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('获得随机道具', SCREEN_WIDTH / 2, 150);

    // 道具图标区域
    const iconSize = 100;
    const x = SCREEN_WIDTH / 2;
    const y = SCREEN_HEIGHT / 2;

    const propImages = {
      'pulse_cannon': uiAssets.propPulseCannon,
      'shotgun': uiAssets.propShotgun,
      'homing_missile': uiAssets.propMissile,
      'arc_grenade': uiAssets.propGrenade,
      'ring_blast': uiAssets.propRingBlast,
      'pierce_laser': uiAssets.propLaser,
      'cross_barrage': uiAssets.propCrossBullet,
      'drone_support': uiAssets.propDroneSupport,
      'energy_core': uiAssets.propEnergyCore,
      'armor_plate': uiAssets.propArmorPlate,
      'deflect_shield': uiAssets.propDeflectShield,
      'explosive_warhead': uiAssets.propExplosiveWarhead,
      'magnetic_field': uiAssets.propMagneticField,
      'concentrated_energy': uiAssets.propEnergyBattery,
      'loot_chip': uiAssets.propLootingChip,
      'thruster': uiAssets.propThruster
    };
    const propNames = {
      'pulse_cannon': '脉冲机炮',
      'shotgun': '散射霰弹',
      'homing_missile': '追踪导弹',
      'arc_grenade': '弧形榴弹',
      'ring_blast': '环形爆破',
      'pierce_laser': '穿刺光束',
      'cross_barrage': '交叉弹幕',
      'drone_support': '无人机支援',
      'energy_core': '能量核心',
      'armor_plate': '装甲片',
      'deflect_shield': '偏转护盾',
      'explosive_warhead': '爆炸弹头',
      'magnetic_field': '磁力场',
      'concentrated_energy': '浓缩能源',
      'loot_chip': '掠夺芯片',
      'thruster': '推进器'
    };

    if (!lottery.isFlashing) {
      // 抽奖滚动阶段 - 直接使用update阶段计算好的currentIndex
      const currentProp = lottery.allProps[lottery.currentIndex];
      const propImg = propImages[currentProp];
      if (propImg) {
        ctx.drawImage(propImg, x - iconSize / 2, y - iconSize / 2, iconSize, iconSize);
      } else {
        ctx.fillStyle = '#1e90ff';
        ctx.fillRect(x - iconSize / 2, y - iconSize / 2, iconSize, iconSize);
      }

      // 道具名称
      ctx.fillStyle = '#ffff00';
      ctx.font = '24px Arial';
      ctx.fillText(propNames[currentProp] || currentProp, x, y + iconSize / 2 + 40);
    } else {
      // 闪烁阶段，显示最终道具
      const flashElapsed = now - lottery.flashStartTime;
      const flashProgress = Math.min(flashElapsed / lottery.flashDuration, 1);

      // 闪烁效果：每200毫秒切换一次可见性
      const visible = Math.floor(flashElapsed / 200) % 2 === 0 || flashProgress >= 1;

      if (visible) {
        const finalProp = lottery.finalProp;
        const propImg = propImages[finalProp];
        if (propImg) {
          ctx.drawImage(propImg, x - iconSize / 2, y - iconSize / 2, iconSize, iconSize);
        } else {
          ctx.fillStyle = '#1e90ff';
          ctx.fillRect(x - iconSize / 2, y - iconSize / 2, iconSize, iconSize);
        }

        // 道具名称
        ctx.fillStyle = '#ffff00';
        ctx.font = '24px Arial';
        ctx.fillText(`获得: ${propNames[finalProp] || finalProp}`, x, y + iconSize / 2 + 40);
      }
    }

    ctx.textAlign = 'left';
  }

  renderGameScore(ctx, score) {
    this.setFont(ctx);
    ctx.fillText(score, 10, 30);
  }

  renderGameOver(ctx, score) {
    this.drawGameOverImage(ctx);
    this.drawGameOverText(ctx, score);
    this.drawRestartButton(ctx);
  }

  /**
   * 绘制游戏通关界面
   */
  renderGameComplete(ctx, score) {
    // 背景
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

    // 标题
    ctx.fillStyle = '#ffd700';
    ctx.font = '36px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('恭喜通关!', SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 - 100);

    // 副标题
    ctx.fillStyle = '#ffffff';
    ctx.font = '24px Arial';
    ctx.fillText('您成功击败了所有敌人', SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 - 50);

    // 得分
    ctx.font = '20px Arial';
    ctx.fillText(`最终得分: ${score}`, SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2);

    // 等级
    const level = Math.floor(GameGlobal.databus.experience / 20);
    ctx.fillText(`最终等级: ${level}`, SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 + 40);

    // 重新开始按钮
    const btnWidth = 200;
    const btnHeight = 60;
    const x = (SCREEN_WIDTH - btnWidth) / 2;
    const y = SCREEN_HEIGHT / 2 + 100;

    // 按钮背景
    ctx.drawImage(uiAssets.btnNormal, x, y, btnWidth, btnHeight);

    // 按钮文字
    ctx.fillStyle = '#ffffff';
    ctx.font = '20px Arial';
    ctx.fillText('重新开始', x + btnWidth / 2, y + btnHeight / 2 + 7);

    // 保存按钮区域，用于触摸检测
    this.completeBtnArea = {
      startX: x,
      startY: y,
      endX: x + btnWidth,
      endY: y + btnHeight
    };

    ctx.textAlign = 'left';
  }

  drawGameOverImage(ctx) {
    // 只绘制已经加载完成的图片
    if (atlas && atlas.complete && atlas.naturalWidth > 0) {
      ctx.drawImage(
        atlas,
        0,
        0,
        119,
        108,
        SCREEN_WIDTH / 2 - 150,
        SCREEN_HEIGHT / 2 - 100,
        300,
        300
      );
    }
  }

  drawGameOverText(ctx, score) {
    this.setFont(ctx);
    ctx.fillText(
      '游戏结束',
      SCREEN_WIDTH / 2 - 40,
      SCREEN_HEIGHT / 2 - 100 + 50
    );
    ctx.fillText(
      `得分: ${score}`,
      SCREEN_WIDTH / 2 - 40,
      SCREEN_HEIGHT / 2 - 100 + 130
    );
  }

  drawRestartButton(ctx) {
    // 只绘制已经加载完成的图片
    if (atlas && atlas.complete && atlas.naturalWidth > 0) {
      // 重新开始按钮
      ctx.drawImage(
        atlas,
        120,
        6,
        39,
        24,
        SCREEN_WIDTH / 2 - 60,
        SCREEN_HEIGHT / 2 - 100 + 180,
        120,
        40
      );
      // 返回主菜单按钮
      ctx.drawImage(
        atlas,
        120,
        6,
        39,
        24,
        SCREEN_WIDTH / 2 - 60,
        SCREEN_HEIGHT / 2 - 100 + 240,
        120,
        40
      );
    }
    ctx.fillText(
      '重新开始',
      SCREEN_WIDTH / 2 - 40,
      SCREEN_HEIGHT / 2 - 100 + 205
    );
    ctx.fillText(
      '返回主菜单',
      SCREEN_WIDTH / 2 - 48,
      SCREEN_HEIGHT / 2 - 100 + 265
    );

    // 保存返回主菜单按钮区域
    this.backToMainBtnArea = {
      startX: SCREEN_WIDTH / 2 - 60,
      startY: SCREEN_HEIGHT / 2 - 100 + 240,
      endX: SCREEN_WIDTH / 2 + 60,
      endY: SCREEN_HEIGHT / 2 - 100 + 280
    };
  }

  /**
   * 绘制游戏开始界面
   */
  renderStartScreen(ctx) {
    // 背景
    ctx.drawImage(uiAssets.launchBg, 0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

    // 游戏Logo
    const logoWidth = SCREEN_WIDTH; // 占屏幕宽度100%
    const logoHeight = logoWidth * 0.5; // 保持2:1比例
    ctx.drawImage(uiAssets.gameLogo, SCREEN_WIDTH / 2 - logoWidth / 2, SCREEN_HEIGHT / 2 - 200, logoWidth, logoHeight);

    // 开始游戏按钮
    const btnWidth = 300;
    const btnHeight = 100;
    const x = (SCREEN_WIDTH - btnWidth) / 2;
    const y = SCREEN_HEIGHT / 2 + 80;

    // 按钮背景
    ctx.drawImage(uiAssets.btnNormal, x, y, btnWidth, btnHeight);

    // 按钮文字
    ctx.fillStyle = '#ffffff';
    ctx.font = '28px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('开始游戏', x + btnWidth / 2, y + btnHeight / 2);

    // 操作提示
    ctx.fillStyle = '#aaaaaa';
    ctx.font = '16px Arial';
    ctx.fillText('触摸拖动控制飞机移动', SCREEN_WIDTH / 2, SCREEN_HEIGHT - 80);
    ctx.fillText('收集道具合成更强武器', SCREEN_WIDTH / 2, SCREEN_HEIGHT - 50);

    // 保存按钮区域
    this.startBtnArea = {
      startX: x,
      startY: y,
      endX: x + btnWidth,
      endY: y + btnHeight
    };

    // ========== 新增：开发者模式按钮 ==========
    if (DebugBridge.initialized) {
      const devBtnWidth = 200;
      const devBtnHeight = 60;
      const devX = (SCREEN_WIDTH - devBtnWidth) / 2;
      const devY = y + btnHeight + 30;

      // 半透明暗色按钮
      ctx.fillStyle = 'rgba(100, 100, 100, 0.5)';
      ctx.fillRect(devX, devY, devBtnWidth, devBtnHeight);
      ctx.strokeStyle = '#666666';
      ctx.lineWidth = 2;
      ctx.strokeRect(devX, devY, devBtnWidth, devBtnHeight);

      ctx.fillStyle = '#aaaaaa';
      ctx.font = '18px Arial';
      ctx.fillText('开发者模式', devX + devBtnWidth / 2, devY + devBtnHeight / 2 + 6);

      // 保存按钮区域
      this.devBtnArea = {
        startX: devX,
        startY: devY,
        endX: devX + devBtnWidth,
        endY: devY + devBtnHeight
      };
    }
    // ==========================================

    ctx.textAlign = 'left';
  }

  touchEventHandler(event) {
    const { clientX, clientY } = event.touches[0]; // 获取触摸点的坐标
    const databus = GameGlobal.databus;

    // ========== 新增：调试模块触摸处理 ==========
    const debugResult = DebugBridge.handleTouchIfActive(clientX, clientY);
    console.log('调试模块触摸结果:', debugResult);
    if (debugResult === 'back_to_start') {
      // 返回开始菜单
      databus.gameState = 'start';
      return;
    }
    if (debugResult === 'start_with_debug') {
      // 应用调试配置并开始游戏 - 触发main的restart
      console.log('调试模式：开始游戏，触发重启');
      this.emit('restart');
      return;
    }
    if (debugResult === 'handled') {
      return;
    }
    // ===========================================

    // 游戏开始界面
    if (databus.gameState === 'start') {
      if (this.startBtnArea &&
          clientX >= this.startBtnArea.startX &&
          clientX <= this.startBtnArea.endX &&
          clientY >= this.startBtnArea.startY &&
          clientY <= this.startBtnArea.endY) {
        // 进入道具选择界面
        databus.gameState = 'selecting_prop';
        console.log('进入道具选择界面');
      }

      // ========== 新增：开发者模式按钮检测 ==========
      if (DebugBridge.initialized && this.devBtnArea &&
          clientX >= this.devBtnArea.startX &&
          clientX <= this.devBtnArea.endX &&
          clientY >= this.devBtnArea.startY &&
          clientY <= this.devBtnArea.endY) {
        DebugBridge.enterMenu();
        return;
      }
      // ===========================================
      return;
    }

    // 暂停菜单界面
    if (databus.isPaused) {
      this.handlePauseMenuTouch(clientX, clientY);
      return;
    }

    // 初始道具选择界面
    if (databus.gameState === 'selecting_prop') {
      this.handlePropSelectionTouch(clientX, clientY);
      return;
    }

    // 升级选择界面
    if (databus.showUpgradeUI) {
      this.handleUpgradeSelectionTouch(clientX, clientY);
      return;
    }

    // 游戏通关界面
    if (databus.gameState === 'gameComplete') {
      if (this.completeBtnArea &&
          clientX >= this.completeBtnArea.startX &&
          clientX <= this.completeBtnArea.endX &&
          clientY >= this.completeBtnArea.startY &&
          clientY <= this.completeBtnArea.endY) {
        this.emit('restart');
      }
      return;
    }

    // 游戏结束时的重新开始按钮和返回主菜单按钮
    if (databus.isGameOver) {
      // 检查触摸是否在重新开始按钮区域内
      if (
        clientX >= this.btnArea.startX &&
        clientX <= this.btnArea.endX &&
        clientY >= this.btnArea.startY &&
        clientY <= this.btnArea.endY
      ) {
        // 调用重启游戏的回调函数
        this.emit('restart');
      }
      // 检查触摸是否在返回主菜单按钮区域内
      else if (this.backToMainBtnArea &&
        clientX >= this.backToMainBtnArea.startX &&
        clientX <= this.backToMainBtnArea.endX &&
        clientY >= this.backToMainBtnArea.startY &&
        clientY <= this.backToMainBtnArea.endY
      ) {
        // 返回主菜单，重置游戏状态
        databus.reset();
        GameGlobal.main.player.init();
      }
      return;
    }

    // 游戏进行中，检查暂停按钮点击
    if (databus.gameState === 'playing' && !databus.isBossFight) {
      const { startX, startY, endX, endY } = this.pauseBtnArea;
      if (clientX >= startX && clientX <= endX && clientY >= startY && clientY <= endY) {
        databus.isPaused = true;
        console.log('游戏暂停');
        return;
      }
    }
  }

  /**
   * 处理暂停菜单的触摸
   */
  handlePauseMenuTouch(clientX, clientY) {
    const databus = GameGlobal.databus;
    const btnWidth = 200;
    const btnHeight = 60;
    const padding = 20;
    const startY = SCREEN_HEIGHT / 2 - 20;

    const buttons = [
      { action: 'resume' },
      { action: 'restart' },
      { action: 'main_menu' }
    ];

    for (let i = 0; i < buttons.length; i++) {
      const y = startY + i * (btnHeight + padding);
      const x = (SCREEN_WIDTH - btnWidth) / 2;

      if (clientX >= x && clientX <= x + btnWidth &&
          clientY >= y && clientY <= y + btnHeight) {
        switch (buttons[i].action) {
          case 'resume':
            databus.isPaused = false;
            console.log('继续游戏');
            break;
          case 'restart':
            databus.isPaused = false;
            this.emit('restart');
            break;
          case 'main_menu':
            // 返回主菜单，重置游戏并回到道具选择界面
            databus.isPaused = false;
            databus.reset();
            GameGlobal.main.player.init();
            break;
        }
        break;
      }
    }
  }

  /**
   * 处理道具选择界面的触摸
   */
  handlePropSelectionTouch(clientX, clientY) {
    const databus = GameGlobal.databus;
    const props = ['pulse_cannon', 'shotgun', 'homing_missile', 'arc_grenade', 'ring_blast', 'pierce_laser', 'cross_barrage', 'drone_support'];
    const btnWidth = 180;
    const btnHeight = 50;
    const padding = 15;
    const startX = SCREEN_WIDTH - btnWidth - 30; // 右侧
    const startY = 120;

    for (let i = 0; i < props.length; i++) {
      const y = startY + i * (btnHeight + padding);
      if (clientX >= startX && clientX <= startX + btnWidth &&
          clientY >= y && clientY <= y + btnHeight) {
        const tappedProp = props[i];

        if (this.selectedProp === tappedProp) {
          // 重复点击已选中的道具，进入游戏
          // 添加到玩家道具栏
          databus.propsInventory = [{
            type: tappedProp,
            level: 1
          }];
          // 进入游戏
          databus.gameState = 'playing';
          // 初始化玩家武器
          GameGlobal.main.player.initWeapons();
          console.log(`确认选择初始道具: ${tappedProp}，开始游戏`);
        } else {
          // 第一次点击，选中道具，显示预览
          this.selectedProp = tappedProp;
          console.log(`选中道具: ${tappedProp}`);
        }
        break;
      }
    }
  }

  /**
   * 处理升级选择界面的触摸
   */
  handleUpgradeSelectionTouch(clientX, clientY) {
    // 抽奖动画运行时屏蔽触摸
    if (this.lotteryState.isRunning) {
      return;
    }
    const databus = GameGlobal.databus;
    const btnWidth = 300;
    const btnHeight = 80;
    const padding = 20;
    const startY = 220;

    // 处理二级选择界面
    if (this.upgradeSelectState.isActive) {
      const props = this.upgradeSelectState.upgradableProps;
      // 道具选项
      for (let i = 0; i < props.length; i++) {
        const y = startY + i * (btnHeight + padding);
        const x = (SCREEN_WIDTH - btnWidth) / 2;

        if (clientX >= x && clientX <= x + btnWidth &&
            clientY >= y && clientY <= y + btnHeight) {
          // 选择了要升级的道具，执行升级
          const prop = props[i];
          prop.level++;
          console.log(`道具升级: ${prop.type} Lv.${prop.level}`);
          // 重新初始化武器和道具效果
          GameGlobal.main.player.initWeapons();
          GameGlobal.main.player.updatePropsEffect();
          // 关闭界面
          this.upgradeSelectState.isActive = false;
          databus.showUpgradeUI = false;
          return;
        }
      }

      // 返回按钮
      const backY = startY + props.length * (btnHeight + padding) + 20;
      const backX = (SCREEN_WIDTH - btnWidth) / 2;
      if (clientX >= backX && clientX <= backX + btnWidth &&
          clientY >= backY && clientY <= backY + btnHeight) {
        // 返回一级界面
        this.upgradeSelectState.isActive = false;
        return;
      }
    } else {
      // 处理一级选择界面
      const options = databus.currentUpgradeOptions || [];
      for (let i = 0; i < options.length; i++) {
        const y = startY + i * (btnHeight + padding);
        const x = (SCREEN_WIDTH - btnWidth) / 2;

        if (clientX >= x && clientX <= x + btnWidth &&
            clientY >= y && clientY <= y + btnHeight) {
          const option = options[i];
          if (option.id === 'upgrade_prop') {
            // 进入二级选择界面
            this.upgradeSelectState = {
              isActive: true,
              upgradableProps: option.upgradableProps
            };
          } else {
            // 其他升级选项，正常应用
            const shouldClose = this.applyUpgrade(i);
            if (shouldClose) {
              databus.showUpgradeUI = false;
            }
          }
          break;
        }
      }
    }
  }

  /**
   * 应用升级效果
   * @returns {boolean} 是否需要立即关闭升级界面
   */
  applyUpgrade(index) {
    const databus = GameGlobal.databus;
    const player = GameGlobal.main.player;
    const option = databus.currentUpgradeOptions[index];

    if (!option) return true;

    console.log(`选择升级: ${option.name}`);

    switch(option.id) {
      // upgrade_prop 已移到二级选择界面处理，这里不再需要

      case 'random_prop':
        // 获得随机道具 - 先播放抽奖动画
        const { PROP_TYPE } = require('../prop/index');
        const allProps = Object.values(PROP_TYPE).filter(type => !type.startsWith('synth_')); // 排除合成道具
        const existingPropTypes = databus.propsInventory.map(p => p.type);
        const availableProps = allProps.filter(type => !existingPropTypes.includes(type));

        if (availableProps.length > 0 && databus.propsInventory.length < 6) {
          const randomType = availableProps[Math.floor(Math.random() * availableProps.length)];

          // 如果只有一个道具，直接添加，不播放动画
          if (allProps.length <= 1) {
            databus.propsInventory.push({
              type: randomType,
              level: 1
            });
            console.log(`获得随机道具: ${randomType}`);
            GameGlobal.main.player.initWeapons();
            GameGlobal.main.player.updatePropsEffect();
            return true; // 立即关闭界面
          }

          // 启动抽奖动画，完全帧驱动，无额外定时器
          this.lotteryState = {
            isRunning: true,
            startTime: Date.now(),
            duration: 2000, // 2秒滚动动画
            flashDuration: 1000, // 1秒闪烁
            currentIndex: 0,
            allProps: allProps, // 所有道具用于动画切换
            finalProp: randomType, // 最终获得的道具
            callback: (propType) => {
              // 动画结束后添加道具
              databus.propsInventory.push({
                type: propType,
                level: 1
              });
              console.log(`获得随机道具: ${propType}`);
              // 重新初始化武器和道具效果
              GameGlobal.main.player.initWeapons();
              GameGlobal.main.player.updatePropsEffect();
            },
            isFlashing: false,
            flashStartTime: 0
          };

          // 不立即关闭升级界面，继续显示动画
          return false;
        }
        break;

      case 'synth_prop':
        // 合成道具
        const recipe = option.recipe;
        // 移除材料道具
        for (const material of recipe.materials) {
          if (material.type === 'any_attack') {
            // 移除任意5种满级攻击道具
            let count = material.count;
            databus.propsInventory = databus.propsInventory.filter(p => {
              if (count <= 0) return true;
              if (['pulse_cannon', 'shotgun', 'homing_missile', 'arc_grenade', 'ring_blast', 'pierce_laser', 'cross_barrage', 'drone_support'].includes(p.type) && p.level >= 6) {
                count--;
                return false;
              }
              return true;
            });
          } else {
            // 移除指定材料
            databus.propsInventory = databus.propsInventory.filter(p => p.type !== material.type);
          }
        }
        // 添加合成后的道具
        databus.propsInventory.push({
          type: recipe.result,
          level: 6 // 合成道具直接满级
        });
        console.log(`合成道具: ${recipe.name}`);
        break;

      case 'shoot_speed':
        player.shootSpeedMultiplier *= 1.1;
        break;
      case 'damage':
        player.bulletDamageMultiplier *= 1.1;
        break;
      case 'move_speed':
        player.moveSpeedMultiplier *= 1.1;
        break;
      case 'shield':
        player.shield += 1;
        break;
      case 'life':
        if (databus.lives < 5) {
          databus.lives += 1;
        }
        break;
      case 'dodge':
        player.dodgeRate = Math.min(0.5, player.dodgeRate + 0.05); // 最多50%闪避
        break;
    }

    // 重新初始化武器和道具效果
    player.initWeapons();
    player.updatePropsEffect();

    return true;
  }
}
