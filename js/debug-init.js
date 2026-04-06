/**
 * 调试模块初始化文件
 * =====================
 * 开发时：保持下面的 import 语句有效
 * 发布时：注释掉下面这一行！
 */

import * as DebugModule from './debug/index.js';

// 立即挂载到全局（先挂载，让DebugBridge能检测到）
GameGlobal.__DevDebugModule = DebugModule;

// 尝试初始化，如果GameGlobal.databus还没准备好也没关系
try {
  DebugModule.init();
} catch (e) {
  console.log('调试模块延迟初始化:', e.message);
}

console.log('🔧 调试模块已挂载到 GameGlobal.__DevDebugModule（开发环境）');
