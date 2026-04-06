/**
 * 调试模块桥接文件
 * 这个文件永远不import任何调试模块，仅通过GameGlobal检测
 */

// 存根实现
const noop = () => null;

// 内部状态：即使调试模块还没挂载，也允许UI先显示按钮
let _debugButtonEnabled = true;

export const DebugBridge = {
  _check() {
    // 检查GameGlobal上是否已挂载调试模块
    return GameGlobal.__DevDebugModule || null;
  },

  // initialized 属性：兼容旧代码，但总是返回 true 来显示开发者按钮
  get initialized() {
    return _debugButtonEnabled;
  },

  init() {
    console.log('DebugBridge: 等待调试模块挂载...');
    // 尝试动态加载调试模块（如果还没加载）
    try {
      // 只有在调试模块存在时才require
      if (typeof require !== 'undefined') {
        require('./debug/autoload.js');
        console.log('DebugBridge: 动态加载调试模块成功');
      }
    } catch (e) {
      console.log('DebugBridge: 动态加载调试模块失败（可能是发布环境）', e.message);
    }
  },

  isDebugMenuActive() {
    const m = this._check();
    return m ? m.isDebugMenuActive() : false;
  },

  enterDebugMenu() {
    const m = this._check();
    if (m) {
      m.enterDebugMenu();
    } else {
      console.log('DebugBridge: 调试模块未挂载，尝试加载...');
      try {
        if (typeof require !== 'undefined') {
          require('./debug/autoload.js');
          const m2 = this._check();
          if (m2) m2.enterDebugMenu();
        }
      } catch (e) {
        console.error('DebugBridge: 加载调试模块失败', e);
      }
    }
  },

  // 别名方法，兼容 gameinfo.js 中的调用
  enterMenu() {
    this.enterDebugMenu();
  },

  renderIfActive(ctx) {
    const m = this._check();
    return m ? m.renderIfActive(ctx) : false;
  },

  handleTouchIfActive(x, y) {
    const m = this._check();
    return m ? m.handleTouchIfActive(x, y) : null;
  },

  isDebugEnabled() {
    const m = this._check();
    return m ? m.isDebugEnabled() : false;
  },

  applyConfig() {
    const m = this._check();
    if (m) m.applyDebugConfig();
  }
};
