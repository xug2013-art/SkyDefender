import './render'; // 初始化Canvas
import Player from './player/index'; // 导入玩家类
import Enemy from './npc/enemy'; // 导入敌机类
import Boss from './npc/boss'; // 导入Boss类
import BackGround from './runtime/background'; // 导入背景类
import GameInfo from './runtime/gameinfo'; // 导入游戏UI类
import Music from './runtime/music'; // 导入音乐类
import DataBus from './databus'; // 导入数据类，用于管理游戏状态和数据
import Danmaku from './bullet/danmaku'; // 导入弹幕类
import Prop from './prop/index'; // 导入道具类
import { getLevelConfig, getWaveConfig, ENEMY_CONFIG, BOSS_TYPES } from './config/level';

const ENEMY_GENERATE_INTERVAL = 60; // 降低敌机生成频率，避免太密集
const ctx = canvas.getContext('2d'); // 获取canvas的2D绘图上下文;

// 日志收集系统
GameGlobal.logs = [];
const originalConsoleLog = console.log;
console.log = function(...args) {
  // 保存到全局日志数组
  const timestamp = new Date().toISOString().substr(11, 8);
  const logMessage = `[${timestamp}] ${args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : arg).join(' ')}`;
  GameGlobal.logs.unshift(logMessage); // 最新日志放在最前面
  // 最多保存1000条日志
  if (GameGlobal.logs.length > 1000) {
    GameGlobal.logs.pop();
  }
  // 原样输出到控制台
  originalConsoleLog.apply(console, args);
};

GameGlobal.databus = new DataBus(); // 全局数据管理，用于管理游戏状态和数据
GameGlobal.musicManager = new Music(); // 全局音乐管理实例

/**
 * 游戏主函数
 */
export default class Main {
  aniId = 0; // 用于存储动画帧的ID
  bg = new BackGround(); // 创建背景
  player = new Player(); // 创建玩家
  gameInfo = new GameInfo(); // 创建游戏UI显示

  constructor() {
    // 挂载到全局，方便其他模块访问
    GameGlobal.main = this;

    // 当开始游戏被点击时，重新开始游戏
    this.gameInfo.on('restart', this.start.bind(this));

    // 开始游戏
    this.start();
  }

  /**
   * 开始或重启游戏
   */
  start() {
    GameGlobal.databus.reset(); // 重置数据
    this.player.init(); // 重置玩家状态
    cancelAnimationFrame(this.aniId); // 清除上一局的动画
    this.aniId = requestAnimationFrame(this.loop.bind(this)); // 开始新的动画循环
  }

  /**
   * 敌机生成逻辑 - 按波次配置生成
   */
  enemyGenerate() {
    const databus = GameGlobal.databus;

    // Boss战期间不生成普通敌机
    if (databus.isBossFight) return;

    // 波次管理
    if (!databus.isWaveActive) {
      const timeUntilNextWave = databus.waveInterval - (databus.frame - databus.lastWaveFrame);
      // 每秒打印一次下一波倒计时
      if (databus.frame % 60 === 0 && timeUntilNextWave > 0) {
        console.log(`波次间隔中，${Math.ceil(timeUntilNextWave / 60)}秒后开始第${databus.currentWave + 1}波`);
      }
      // 波次间隔判断
      if (databus.frame - databus.lastWaveFrame >= databus.waveInterval) {
        console.log('波次间隔结束，开始下一波');
        this.startNextWave();
      }
      return;
    }

    // 当前波次配置
    const waveConfig = getWaveConfig(databus.currentLevel, databus.currentWave);
    if (!waveConfig || !waveConfig.enemies) {
      console.log('当前波次没有敌人配置');
      return;
    }

    // 每60帧打印一次波次进度
    if (databus.frame % 60 === 0) {
      const activeEnemies = databus.enemys.filter(e => e.isActive).length;
      console.log(`波次进度: ${databus.currentWave}波，已生成:${databus.waveSpawnedCount}/${databus.waveTotalEnemies}，存活敌人:${activeEnemies}`);
    }

    // 按间隔生成敌机
    if (databus.waveSpawnedCount < databus.waveTotalEnemies &&
        databus.frame % waveConfig.interval === 0) {

      // 查找还没生成完的敌人类型
      for (const enemyGroup of waveConfig.enemies) {
        const spawnedCount = this.getSpawnedCountByType(enemyGroup.type);
        if (spawnedCount < enemyGroup.count) {
          const enemy = databus.pool.getItemByClass('enemy', Enemy);
          enemy.init(enemyGroup.type);
          // 应用关卡难度加成
          const difficultyMultiplier = 1 + (databus.currentLevel - 1) * 0.2;
          enemy.hp = Math.floor(enemy.hp * difficultyMultiplier);
          enemy.maxHp = Math.floor(enemy.maxHp * difficultyMultiplier);
          databus.enemys.push(enemy);
          databus.waveSpawnedCount++;
          console.log(`生成敌机: ${enemyGroup.type}，波次已生成:${databus.waveSpawnedCount}/${databus.waveTotalEnemies}`);
          break;
        }
      }
    }
  }

  /**
   * 获取当前波次已生成的指定类型敌人数量
   */
  getSpawnedCountByType(enemyType) {
    const databus = GameGlobal.databus;
    // 简单统计：遍历所有敌人（包括已回收的？暂时用存活的，只要生成过就算）
    // 实际上我们不需要这么精确，只要生成足够数量就行
    return databus.enemys.filter(e => e.enemyType === enemyType).length;
  }

  /**
   * 开始下一波
   */
  startNextWave() {
    const databus = GameGlobal.databus;
    const levelConfig = getLevelConfig(databus.currentLevel);

    databus.currentWave++;
    databus.isWaveActive = true;
    databus.waveSpawnedCount = 0;
    databus.waveKilledCount = 0;

    const waveConfig = getWaveConfig(databus.currentLevel, databus.currentWave);

    if (waveConfig) {
      // 计算当前波次总敌人数量
      if (waveConfig.enemies) {
        databus.waveTotalEnemies = waveConfig.enemies.reduce((total, group) => total + group.count, 0);
      } else if (waveConfig.boss) {
        // Boss波
        this.spawnBoss(waveConfig.boss);
      } else if (waveConfig.elite) {
        // 精英波
        this.spawnElite(waveConfig.elite);
      }

      console.log(`开始第${databus.currentLevel}关 第${databus.currentWave}波，敌人总数：${databus.waveTotalEnemies}`);
    } else {
      // 波次都打完了，关卡完成
      this.onLevelComplete();
    }
  }

  /**
   * 检查波次是否完成
   */
  checkWaveComplete() {
    const databus = GameGlobal.databus;

    // 只有波次正在进行时才检查完成
    if (!databus.isWaveActive) {
      return;
    }

    // Boss战期间不检查普通波次完成
    if (databus.isBossFight) {
      if (databus.frame % 120 === 0) {
        const activeEnemies = databus.enemys.filter(e => e.isActive).length;
        console.log(`Boss战中，存活敌人:${activeEnemies}, Boss存活:${databus.boss?.isActive ? '是' : '否'}`);
      }
      return;
    }

    // 检查所有敌人是否都被消灭（包括Boss和精英）
    const activeEnemies = databus.enemys.filter(e => e.isActive).length;
    const allEnemiesSpawned = databus.waveSpawnedCount >= databus.waveTotalEnemies;

    // 每60帧打印一次检查状态
    if (databus.frame % 60 === 0) {
      console.log(`波次完成检查: 所有敌人已生成:${allEnemiesSpawned}, 存活敌人:${activeEnemies}, isWaveActive:${databus.isWaveActive}`);
    }

    if (allEnemiesSpawned && activeEnemies === 0) {
      console.log(`波次完成条件满足! 第${databus.currentLevel}关 第${databus.currentWave}波完成`);
      databus.isWaveActive = false;
      databus.lastWaveFrame = databus.frame;

      // 检查是否有下一波
      const levelConfig = getLevelConfig(databus.currentLevel);
      console.log(`当前波次:${databus.currentWave}, 总波次:${levelConfig.wavesPerLevel}`);
      if (databus.currentWave >= levelConfig.wavesPerLevel) {
        // 所有小怪波次打完，生成关底Boss
        const bossWave = levelConfig.waves.find(w => w.boss && !w.isMidBoss);
        if (bossWave && !databus.isBossFight) {
          console.log('所有小怪波次完成，生成关底Boss');
          this.spawnBoss(bossWave.boss);
        } else {
          console.log('所有关卡完成');
          this.onLevelComplete();
        }
      } else {
        console.log(`还有下一波，进入波次间隔，当前波次:${databus.currentWave}, 下一波:${databus.currentWave + 1}`);
      }
      // 不需要额外调用startNextWave，enemyGenerate方法会自动处理波次间隔后开始下一波
    }
  }

  /**
   * 生成Boss
   */
  spawnBoss(bossType) {
    const databus = GameGlobal.databus;
    const boss = databus.pool.getItemByClass('boss', Boss);
    boss.init(bossType);
    databus.enemys.push(boss);
    databus.boss = boss;

    // 清空屏幕上的普通敌机和弹幕
    databus.enemys.forEach(e => {
      if (!e.isBoss) e.destroy();
    });
    databus.danmakus.forEach(d => d.destroy());

    // 设置波次状态
    databus.isBossFight = true;
    databus.isMidBossFight = boss.isMidBoss;
    databus.waveTotalEnemies = 1;
    databus.waveSpawnedCount = 1;
    databus.waveKilledCount = 0;

    console.log(`生成Boss: ${bossType}`);
    GameGlobal.musicManager.playBossEnter();
  }

  /**
   * 生成精英敌人
   */
  spawnElite(eliteConfig) {
    const databus = GameGlobal.databus;

    for (let i = 0; i < eliteConfig.count; i++) {
      const enemy = databus.pool.getItemByClass('enemy', Enemy);
      enemy.init(eliteConfig.type);
      // 精英属性加成
      enemy.hp = Math.floor(enemy.hp * eliteConfig.hpMultiplier);
      enemy.maxHp = Math.floor(enemy.maxHp * eliteConfig.hpMultiplier);
      enemy.dropRate = 1; // 必定掉落
      databus.enemys.push(enemy);
    }

    databus.waveTotalEnemies = eliteConfig.count;
    databus.waveSpawnedCount = eliteConfig.count;
    databus.waveKilledCount = 0;
    console.log(`生成道中精英: ${eliteConfig.type} × ${eliteConfig.count}`);
  }

  /**
   * Boss被击败处理
   */
  onBossDefeated(boss) {
    const databus = GameGlobal.databus;

    // 结束Boss战
    databus.isBossFight = false;
    databus.isMidBossFight = false;
    databus.showBossHealthBar = false;
    databus.boss = null;

    if (boss.isMidBoss) {
      // 道中Boss被击败，继续下一波
      databus.isWaveActive = false;
      databus.lastWaveFrame = databus.frame;
      console.log('道中Boss被击败，准备下一波');
    } else {
      // 关底Boss被击败，关卡完成
      console.log('关底Boss被击败，关卡完成');
      this.onLevelComplete();
    }
  }

  /**
   * 关卡完成处理
   */
  onLevelComplete() {
    const databus = GameGlobal.databus;

    console.log(`第${databus.currentLevel}关完成！`);

    // 进入关卡过渡状态
    databus.isLevelTransition = true;
    databus.levelTransitionTimer = databus.frame;

    // TODO: 显示关卡完成UI，升级选择界面

    // 3秒后进入下一关
    setTimeout(() => {
      if (databus.currentLevel < databus.totalLevels) {
        this.goToNextLevel();
      } else {
        // 全部关卡完成，游戏通关
        databus.gameState = 'gameComplete';
      }
    }, 3000);
  }

  /**
   * 进入下一关
   */
  goToNextLevel() {
    const databus = GameGlobal.databus;

    databus.currentLevel++;
    databus.currentWave = 0;
    databus.isWaveActive = false;
    databus.isLevelTransition = false;
    databus.lastWaveFrame = databus.frame;

    const levelConfig = getLevelConfig(databus.currentLevel);
    databus.wavesPerLevel = levelConfig.wavesPerLevel;

    // 切换背景
    this.bg.setImage(levelConfig.background);

    console.log(`进入第${databus.currentLevel}关: ${levelConfig.name}`);
  }

  /**
   * 生成升级选项
   */
  generateUpgradeOptions() {
    const databus = GameGlobal.databus;
    const options = [];

    // 1. 升级已有道具选项（排除已满级道具）
    const upgradableProps = databus.propsInventory.filter(p => p.level < 6);
    if (upgradableProps.length > 0) {
      // 道具名称映射
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

      // 随机选一个可升级道具
      const randomProp = upgradableProps[Math.floor(Math.random() * upgradableProps.length)];
      options.push({
        id: 'upgrade_prop',
        propType: randomProp.type,
        name: `升级 ${propNames[randomProp.type] || randomProp.type} (Lv${randomProp.level} → Lv${randomProp.level + 1})`,
        description: '提升该道具效果'
      });
    }

    // 2. 获得随机道具选项（道具栏未满时出现）
    if (databus.propsInventory.length < 6) {
      options.push({
        id: 'random_prop',
        name: '获得随机道具',
        description: '从所有道具中随机获得一个新道具'
      });
    }

    // 3. 合成道具选项（满足合成条件时出现）
    const availableSynths = this.checkAvailableSynthesis();
    if (availableSynths.length > 0) {
      const randomSynth = availableSynths[Math.floor(Math.random() * availableSynths.length)];
      options.push({
        id: 'synth_prop',
        recipe: randomSynth,
        name: `合成 ${randomSynth.name}`,
        description: randomSynth.description
      });
    }

    // 随机打乱选项顺序
    databus.currentUpgradeOptions = options.sort(() => 0.5 - Math.random());
    console.log('生成升级选项:', databus.currentUpgradeOptions);
  }

  /**
   * 检查可用的合成配方
   */
  checkAvailableSynthesis() {
    const databus = GameGlobal.databus;
    const { SYNTH_RECIPES } = require('./prop/index');
    const available = [];

    for (const recipe of SYNTH_RECIPES) {
      let match = true;
      for (const material of recipe.materials) {
        if (material.type === 'any_attack') {
          // 任意5种满级攻击道具
          const attackProps = databus.propsInventory.filter(p =>
            ['pulse_cannon', 'shotgun', 'homing_missile', 'arc_grenade', 'ring_blast', 'pierce_laser', 'cross_barrage', 'drone_support'].includes(p.type) && p.level >= 6
          );
          if (attackProps.length < material.count) {
            match = false;
            break;
          }
        } else {
          // 指定类型的满级道具
          const prop = databus.propsInventory.find(p => p.type === material.type && p.level >= material.level);
          if (!prop) {
            match = false;
            break;
          }
        }
      }
      if (match) {
        available.push(recipe);
      }
    }

    return available;
  }

  /**
   * 检查是否有可合成的道具
   */
  checkSynthesis() {
    const databus = GameGlobal.databus;
    const { SYNTH_RECIPES } = require('./prop/index');
    const player = GameGlobal.main.player;

    // 遍历所有合成配方
    for (const recipe of SYNTH_RECIPES) {
      let materialsMatch = true;
      const usedIndices = new Set();

      for (const material of recipe.materials) {
        if (material.type === 'any_attack') {
          // 任意攻击道具
          const attackProps = databus.propsInventory.filter(p =>
            ['pulse_cannon', 'shotgun', 'homing_missile', 'arc_grenade',
             'ring_blast', 'pierce_laser', 'cross_barrage', 'drone_support'].includes(p.type)
            && p.level >= material.level
          );
          if (attackProps.length < material.count) {
            materialsMatch = false;
            break;
          }
          // 记录使用的道具索引
          attackProps.slice(0, material.count).forEach(p => {
            const index = databus.propsInventory.indexOf(p);
            usedIndices.add(index);
          });
        } else {
          // 指定类型道具
          const prop = databus.propsInventory.find(p =>
            p.type === material.type && p.level >= material.level
          );
          if (!prop) {
            materialsMatch = false;
            break;
          }
          usedIndices.add(databus.propsInventory.indexOf(prop));
        }
      }

      if (materialsMatch) {
        console.log(`合成成功: ${recipe.name}`);
        // 移除消耗的材料
        const sortedIndices = Array.from(usedIndices).sort((a, b) => b - a); // 从后往前删避免索引错乱
        sortedIndices.forEach(index => {
          databus.propsInventory.splice(index, 1);
        });
        // 添加合成后的道具
        databus.propsInventory.push({
          type: recipe.result,
          level: 1,
          isSynth: true
        });
        // 重新初始化武器和效果
        player.initWeapons();
        // 显示合成提示
        wx.showToast({
          title: `合成: ${recipe.name}`,
          icon: 'success',
          duration: 2000
        });
        // 继续检查是否还有可合成的
        this.checkSynthesis();
        return;
      }
    }
  }

  /**
   * 全局碰撞检测
   */
  collisionDetection() {
    const databus = GameGlobal.databus;
    const player = this.player;

    // 1. 检测玩家子弹与敌机的碰撞
    databus.bullets.forEach((bullet) => {
      for (let i = 0, il = databus.enemys.length; i < il; i++) {
        const enemy = databus.enemys[i];

        // 如果敌机存活并且发生了碰撞
        if (enemy.isActive && bullet.isActive && enemy.isCollideWith(bullet)) {
          // 扣除敌机血量
          enemy.hp -= bullet.damage;

          // 处理穿透子弹
          bullet.penetration--;
          if (bullet.penetration <= 0) {
            bullet.destroy(); // 销毁子弹
          }

          // 敌机死亡
          if (enemy.hp <= 0) {
            // 增加得分
            let score = 100; // 默认得分
            switch (enemy.enemyType) {
              case 'dragonfly': score = 100; break;
              case 'beetle': score = 200; break;
              case 'viper': score = 150; break;
            }
            databus.score += score;

            // 增加经验
            let exp = 2; // 默认经验
            switch (enemy.enemyType) {
              case 'dragonfly': exp = 2; break;
              case 'beetle': exp = 4; break;
              case 'viper': exp = 2; break;
            }
            databus.experience += exp;

            // 概率掉落道具
            let dropRate = enemy.dropRate;
            // 掠夺芯片加成：每级+10%掉落率
            const lootProp = databus.propsInventory.find(p => p.type === 'loot_chip');
            if (lootProp) {
              dropRate *= 1 + 0.1 * lootProp.level;
            }
            if (Math.random() < dropRate) {
              const prop = databus.pool.getItemByClass('prop', Prop);
              prop.init(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
              databus.props.push(prop);
            }

            enemy.destroy(); // 销毁敌机
          }
          break; // 退出循环
        }
      }
    });

    // 2. 检测敌方弹幕与玩家的碰撞
    databus.danmakus.forEach((danmaku) => {
      if (danmaku.isActive && player.isActive && player.isCollideWith(danmaku)) {
        this.onPlayerHit();
        danmaku.destroy();
      }
    });

    // 3. 检测敌机与玩家的碰撞
    for (let i = 0, il = databus.enemys.length; i < il; i++) {
      const enemy = databus.enemys[i];
      if (enemy.isActive && player.isActive && player.isCollideWith(enemy)) {
        this.onPlayerHit();
        enemy.destroy();
        break;
      }
    }

    // 4. 检测道具与玩家的碰撞
    databus.props.forEach((prop) => {
      if (prop.isActive && player.isActive && player.isCollideWith(prop)) {
        prop.onPickup();
      }
    });
  }

  /**
   * 玩家被击中处理
   */
  onPlayerHit() {
    const databus = GameGlobal.databus;
    const player = this.player;

    // 先判断闪避
    if (Math.random() < player.dodgeRate) {
      return; // 闪避成功
    }

    // 再判断护盾
    if (player.shield > 0) {
      player.shield--;
      return; // 护盾抵消伤害
    }

    // 扣生命
    databus.lives--;

    if (databus.lives <= 0) {
      // 生命耗尽，游戏结束
      player.destroy();
      databus.gameOver();
    } else {
      // 还有生命，短暂无敌
      // TODO: 无敌时间和闪烁效果
    }
  }

  /**
   * canvas重绘函数
   * 每一帧重新绘制所有的需要展示的元素
   */
  render() {
    const databus = GameGlobal.databus;
    ctx.clearRect(0, 0, canvas.width, canvas.height); // 清空画布

    this.bg.render(ctx); // 绘制背景
    this.player.render(ctx); // 绘制玩家飞机
    databus.bullets.forEach((item) => item.render(ctx)); // 绘制所有子弹
    databus.enemys.forEach((item) => item.render(ctx)); // 绘制所有敌机
    databus.danmakus.forEach((item) => item.render(ctx)); // 绘制所有敌方弹幕
    databus.props.forEach((item) => item.render(ctx)); // 绘制所有掉落道具
    this.gameInfo.render(ctx); // 绘制游戏UI
    databus.animations.forEach((ani) => {
      if (ani.isPlaying) {
        ani.aniRender(ctx); // 渲染动画
      }
    }); // 绘制所有动画
  }

  // 游戏逻辑更新主函数
  update() {
    const databus = GameGlobal.databus;
    databus.frame++; // 增加帧数

    // 非游戏进行状态下不更新战斗逻辑
    if (databus.isGameOver || databus.isPaused || databus.showUpgradeUI ||
        databus.gameState === 'start' || // 开始界面不更新战斗逻辑
        databus.gameState === 'selecting_prop' ||
        databus.gameState === 'upgrading' ||
        databus.isLevelTransition) {
      return;
    }

    // 奖命逻辑：每10000分奖励一条命，最多奖励2条
    if (databus.score - databus.lastScoreAwardLife >= 10000 && databus.lives < 5) {
      databus.lives++;
      databus.lastScoreAwardLife = databus.score;
      // TODO: 播放奖命音效
    }

    // 升级检测：每20经验升一级
    const expNeededPerLevel = 20;
    const currentLevel = Math.floor(databus.experience / expNeededPerLevel);
    if (currentLevel > databus.playerLevel && !databus.showUpgradeUI) {
      databus.playerLevel = currentLevel;
      console.log(`玩家升级到${currentLevel}级！`);
      // 生成升级选项
      this.generateUpgradeOptions();

      if (databus.currentUpgradeOptions.length > 0) {
        // 有可用升级选项，显示升级界面
        databus.showUpgradeUI = true;
      } else {
        // 没有可用升级选项，奖励1万分作为补偿
        databus.score += 10000;
        console.log('无可用升级选项，奖励10000分');
      }
    }

    this.bg.update(); // 更新背景
    this.player.update(); // 更新玩家
    // 更新所有子弹
    databus.bullets.forEach((item) => item.update());
    // 更新所有敌机
    databus.enemys.forEach((item) => item.update());
    // 更新所有弹幕
    databus.danmakus.forEach((item) => item.update());
    // 更新所有道具
    databus.props.forEach((item) => item.update());

    this.enemyGenerate(); // 生成敌机
    this.collisionDetection(); // 检测碰撞
    this.checkWaveComplete(); // 检查波次是否完成
  }

  // 实现游戏帧循环
  loop() {
    this.update(); // 更新游戏逻辑
    this.render(); // 渲染游戏画面

    // 请求下一帧动画
    this.aniId = requestAnimationFrame(this.loop.bind(this));
  }
}
