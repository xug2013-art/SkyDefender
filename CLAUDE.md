```
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.
```

## 项目概述
这是一个基于微信小游戏模板开发的东方风格弹幕射击游戏《星空入侵者》，采用原生Canvas 2D渲染，面向对象架构。

## 高层架构
### 核心数据流
1. **全局状态管理**：所有游戏状态通过`js/databus.js`单例统一管理，包括实体列表、分数、经验、关卡等数据
2. **主循环**：`js/main.js`是游戏入口，通过`requestAnimationFrame`实现60fps帧循环，每帧依次执行：
   - 更新所有实体状态（背景、玩家、子弹、敌机、弹幕、道具）
   - 生成新敌机
   - 全局碰撞检测
   - 渲染所有元素
3. **对象池**：所有频繁创建销毁的对象（子弹、弹幕、敌机、道具）通过`js/base/pool.js`复用，减少GC

### 核心模块
| 模块 | 职责 |
|------|------|
| **基础类** (`js/base/`) | Sprite（所有游戏实体基类）、Animation（帧动画）、Pool（对象池） |
| **玩家系统** (`js/player/`) | 玩家控制、子弹发射、属性管理 |
| **敌人系统** (`js/npc/`) | 敌机逻辑、弹幕发射、Boss逻辑 |
| **弹幕系统** (`js/bullet/`) | 多种弹道实现、弹幕生成 |
| **道具系统** (`js/prop/`) | 道具生成、拾取、升级、合成逻辑 |
| **UI系统** (`js/runtime/gameinfo.js`) | 界面渲染、交互处理 |
| **关卡系统** | 关卡进度、波次管理（待开发） |

### 阵营设计
所有精灵都有`camp`属性：
- `player`：玩家方（玩家、玩家子弹）
- `enemy`：敌方（敌机、敌方弹幕）
- `neutral`：中立（道具）
碰撞检测时根据阵营判断伤害逻辑

## 常用开发操作
### 运行与调试
1. 下载并打开[微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
2. 导入项目根目录，选择"小游戏"项目类型
3. 工具内直接预览和调试，支持真机预览

### 代码检查
```bash
eslint js/**/*.js
```

### 构建发布
1. 在微信开发者工具中点击"上传"
2. 填写版本号和项目备注
3. 提交到微信公众平台审核发布

## 开发规范
1. 所有新增实体类继承自`Sprite`或`Animation`基类
2. 频繁创建的对象使用对象池复用，避免直接new实例
3. 全局状态统一通过`GameGlobal.databus`访问
4. 玩家操作只在`Player`类中处理
5. 所有碰撞逻辑统一在`main.js`的`collisionDetection`方法中处理
6. 数值配置尽量抽离为常量，避免硬编码
