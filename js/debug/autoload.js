/**
 * 调试模块自动挂载
 * 这个文件仅在开发环境加载，发布时被排除
 */

import * as DebugModule from './index.js';

// 立即挂载到全局
GameGlobal.__DevDebugModule = DebugModule;

console.log('🔧 调试模块已挂载到 GameGlobal.__DevDebugModule');
