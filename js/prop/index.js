import Sprite from '../base/sprite';
import { SCREEN_WIDTH, SCREEN_HEIGHT } from '../render';

const PROP_WIDTH = 30;
const PROP_HEIGHT = 30;
const PROP_IMG_SRC = 'images/Common.png'; // 暂时用公共图片，后续替换

// 道具类型
export const PROP_TYPE = {
  // 攻击道具
  ATTACK_PULSE_CANNON: 'pulse_cannon',     // 脉冲机炮
  ATTACK_SCATTER_SHOT: 'scatter_shot',     // 散射霰弹
  ATTACK_HOMING_MISSILE: 'homing_missile', // 追踪导弹
  ATTACK_ARC_GRENADE: 'arc_grenade',       // 弧形榴弹
  ATTACK_RING_BLAST: 'ring_blast',         // 环形爆破
  ATTACK_PIERCE_LASER: 'pierce_laser',     // 穿刺光束
  ATTACK_CROSS_BARRAGE: 'cross_barrage',   // 交叉弹幕
  ATTACK_DRONE_SUPPORT: 'drone_support',   // 无人机支援

  // 辅助道具
  ASSIST_ENERGY_CORE: 'energy_core',       // 能量核心
  ASSIST_ARMOR_PLATE: 'armor_plate',       // 装甲片
  ASSIST_DEFLECT_SHIELD: 'deflect_shield', // 偏转护盾
  ASSIST_EXPLOSIVE_WARHEAD: 'explosive_warhead', // 爆炸弹头
  ASSIST_MAGNETIC_FIELD: 'magnetic_field', // 磁力场
  ASSIST_CONCENTRATED_ENERGY: 'concentrated_energy', // 浓缩能源
  ASSIST_LOOT_CHIP: 'loot_chip',           // 掠夺芯片
  ASSIST_THRUSTER: 'thruster',              // 推进器

  // 合成高阶道具
  SYNTH_GATLING_CANNON: 'synth_gatling',   // 加特林机炮（脉冲+能量核心）
  SYNTH_RAIN_SHOTGUN: 'synth_rain',        // 暴雨霰弹（霰弹+爆炸弹头）
  SYNTH_SWARM_MISSILE: 'synth_swarm',      // 蜂群导弹（追踪+无人机）
  SYNTH_PLASMA_GRENADE: 'synth_plasma',    // 等离子榴弹（榴弹+浓缩能源）
  SYNTH_BLACK_HOLE: 'synth_blackhole',     // 黑洞爆破（环形+磁力场）
  SYNTH_PARTICLE_BEAM: 'synth_particle',   // 粒子光束（激光+能源）
  SYNTH_OMNI_BARRAGE: 'synth_omni',        // 全方向弹幕（交叉+推进器）
  SYNTH_WAR_MACHINE: 'synth_war_machine'   // 战争机器（任意5种满级攻击道具）
};

// 合成配方：两个满级道具合成一个高阶道具
export const SYNTH_RECIPES = [
  {
    result: 'synth_gatling',
    name: '加特林机炮',
    materials: [
      { type: 'pulse_cannon', level: 6 },
      { type: 'energy_core', level: 6 }
    ],
    description: '超高速射击，伤害+50%，射速+100%'
  },
  {
    result: 'synth_rain',
    name: '暴雨霰弹',
    materials: [
      { type: 'shotgun', level: 6 },
      { type: 'explosive_warhead', level: 6 }
    ],
    description: '范围爆炸伤害，弹丸数量+100%，伤害+80%'
  },
  {
    result: 'synth_swarm',
    name: '蜂群导弹',
    materials: [
      { type: 'homing_missile', level: 6 },
      { type: 'drone_support', level: 6 }
    ],
    description: '发射大量追踪导弹，导弹数量+200%，伤害+50%'
  },
  {
    result: 'synth_plasma',
    name: '等离子榴弹',
    materials: [
      { type: 'arc_grenade', level: 6 },
      { type: 'concentrated_energy', level: 6 }
    ],
    description: '等离子爆炸伤害，爆炸范围+200%，持续灼烧效果'
  },
  {
    result: 'synth_blackhole',
    name: '黑洞爆破',
    materials: [
      { type: 'ring_blast', level: 6 },
      { type: 'magnetic_field', level: 6 }
    ],
    description: '产生黑洞吸引敌人，造成持续范围伤害'
  },
  {
    result: 'synth_particle',
    name: '粒子光束',
    materials: [
      { type: 'pierce_laser', level: 6 },
      { type: 'concentrated_energy', level: 6 }
    ],
    description: '贯穿全屏的粒子光束，伤害+150%，穿透所有敌人'
  },
  {
    result: 'synth_omni',
    name: '全方向弹幕',
    materials: [
      { type: 'cross_barrage', level: 6 },
      { type: 'thruster', level: 6 }
    ],
    description: '360度全方位弹幕覆盖，射速+50%，伤害+50%'
  },
  {
    result: 'synth_war_machine',
    name: '战争机器',
    materials: [
      // 任意5种满级攻击道具即可合成
      { type: 'any_attack', level: 6, count: 5 }
    ],
    description: '解锁所有攻击模式，全属性+100%，无敌时间+5秒'
  }
];

/**
 * 道具基类
 */
export default class Prop extends Sprite {
  constructor() {
    super(PROP_IMG_SRC, PROP_WIDTH, PROP_HEIGHT, 0, 0, 1, 0, 'neutral');

    this.propType = PROP_TYPE.ATTACK_PULSE_CANNON;
    this.speedY = 1; // 下落速度
    this.speedX = 0; // 水平漂浮速度
    this.switchInterval = 120; // 切换种类间隔（2秒）
    this.lastSwitchFrame = 0;
    this.lifeTime = 0;
    this.maxLifeTime = 600; // 最大存在时间10秒
    this.canSwitch = true; // 是否可以切换种类
  }

  /**
   * 初始化道具
   * @param {number} x 初始X坐标
   * @param {number} y 初始Y坐标
   * @param {string} propType 道具类型，不传则随机
   * @param {boolean} canSwitch 是否可以随机切换种类
   */
  init(x, y, propType = null, canSwitch = true) {
    this.x = x;
    this.y = y;
    this.propType = propType || this.getRandomPropType();
    this.canSwitch = canSwitch;
    this.speedY = 0.5 + Math.random() * 0.5;
    this.speedX = (Math.random() - 0.5) * 1;
    this.lastSwitchFrame = GameGlobal.databus.frame;
    this.lifeTime = 0;

    this.isActive = true;
    this.visible = true;
  }

  /**
   * 获取随机道具类型
   */
  getRandomPropType() {
    const propTypes = Object.values(PROP_TYPE);
    return propTypes[Math.floor(Math.random() * propTypes.length)];
  }

  /**
   * 每一帧更新道具位置
   */
  update() {
    if (GameGlobal.databus.isGameOver || GameGlobal.databus.isPaused) {
      return;
    }

    this.lifeTime++;

    // 漂浮移动
    this.y += this.speedY;
    this.x += this.speedX;

    // 左右边界反弹
    if (this.x <= 0 || this.x >= SCREEN_WIDTH - this.width) {
      this.speedX *= -1;
    }

    // 随机切换道具类型
    if (this.canSwitch && GameGlobal.databus.frame - this.lastSwitchFrame >= this.switchInterval) {
      this.propType = this.getRandomPropType();
      this.lastSwitchFrame = GameGlobal.databus.frame;
    }

    // 超出屏幕或超过最大生命周期则销毁
    if (this.y > SCREEN_HEIGHT + this.height || this.lifeTime > this.maxLifeTime) {
      this.destroy();
    }

    // 磁力场吸引效果
    const player = GameGlobal.main.player;
    if (player && player.isActive) {
      // 计算玩家磁力场等级
      const databus = GameGlobal.databus;
      const magneticProp = databus.propsInventory.find(p => p.type === 'magnetic_field');
      if (magneticProp) {
        const attractRange = 80 + magneticProp.level * 30; // 基础80像素，每级+30
        const dx = player.x + player.width / 2 - (this.x + this.width / 2);
        const dy = player.y + player.height / 2 - (this.y + this.height / 2);
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < attractRange) {
          // 距离小于吸引范围，向玩家移动
          const attractSpeed = 2 + magneticProp.level * 0.5;
          const ratio = attractSpeed / distance;
          this.speedX = dx * ratio;
          this.speedY = dy * ratio;
        }
      }
    }
  }

  /**
   * 被玩家拾取
   */
  onPickup() {
    const databus = GameGlobal.databus;
    const player = GameGlobal.main.player;

    // 查找玩家是否已有这个道具
    const existingProp = databus.propsInventory.find(p => p.type === this.propType);

    if (existingProp) {
      // 已有同类型道具
      if (existingProp.level < 6) {
        // 未满级，直接升级
        existingProp.level++;
        console.log(`道具升级: ${this.propType} Lv.${existingProp.level}`);
      } else {
        // 已满级，加20经验
        databus.experience += 20;
        console.log(`道具已满级，增加20经验`);
      }
    } else {
      // 新道具
      if (databus.propsInventory.length < 6) {
        // 道具栏有空位，添加新道具
        databus.propsInventory.push({
          type: this.propType,
          level: 1
        });
        console.log(`获得新道具: ${this.propType}`);
      } else {
        // 道具栏满了，加20经验
        databus.experience += 20;
        console.log(`道具栏已满，增加20经验`);
      }
    }

    // 重新初始化武器和道具效果
    player.initWeapons();

    // 检查是否可以合成道具
    GameGlobal.main.checkSynthesis();

    // 销毁道具
    this.destroy();

    // TODO: 播放拾取音效
  }

  /**
   * 销毁道具
   */
  destroy() {
    this.isActive = false;
    this.visible = false;
    GameGlobal.databus.removeProp(this);
  }
}
