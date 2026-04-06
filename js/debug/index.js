import { DebugMenu } from './menu.js';
import { DebugState } from './state.js';

let menu = null;
let isInDebugMenu = false;

// 导出 DebugState，方便外部访问
export { DebugState };

// 初始化调试模块
export function init() {
  menu = new DebugMenu();
  console.log('✅ 开发者调试模块已加载');
}

// 检查是否在调试菜单
export function isDebugMenuActive() {
  return isInDebugMenu;
}

// 进入调试菜单
export function enterDebugMenu() {
  isInDebugMenu = true;
  DebugState.reset();
}

// 退出调试菜单
export function exitDebugMenu() {
  isInDebugMenu = false;
}

// 渲染调试菜单（如果激活）
export function renderIfActive(ctx) {
  if (isInDebugMenu && menu) {
    menu.render(ctx);
    return true;
  }
  return false;
}

// 处理调试菜单触摸（如果激活）
export function handleTouchIfActive(x, y) {
  if (isInDebugMenu && menu) {
    const result = menu.handleTouch(x, y);
    if (result === 'back') {
      exitDebugMenu();
      return 'back_to_start';
    }
    if (result === 'start_game') {
      isInDebugMenu = false;
      DebugState.enabled = true;
      return 'start_with_debug';
    }
    if (result === 'start_game_direct') {
      isInDebugMenu = false;
      return 'handled'; // 已经直接处理了，不需要后续处理
    }
    return 'handled';
  }
  return null;
}

// 应用调试配置
export function applyDebugConfig() {
  if (DebugState.enabled) {
    DebugState.apply();
  }
}

// 检查是否启用了调试模式
export function isDebugEnabled() {
  return DebugState.enabled;
}
