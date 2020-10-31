import { initDebugSetting } from "./Debugger";
import { initDebugInfos } from "./DebugInfos";
import * as Kit from "./Kit";
import { ENABLE,
         DEBUG,
         IN_WEB_DEBUG,
         MEMORY_CAP_SIZE,
         EXPLOIT_PIXELS_W,
         EXPLOIT_PIXELS_H,
         ASSERT,
         SAFE_RELEASE,
         SAFE_RELEASE_NULL,
         SAFE_AUTORELEASE,
         SAFE_RETAIN,
         SAFE_DESTROY_VIEW, 
         SAFE_CALLBACK} from "./KDefine";
import Utils from "./utils/Utils";
import { WX } from "./wx_api/WxApi";


/**
 * @property {boolean} _ENABLE 框架启动
 */
/**
 * @property {boolean} _DEBUG 调试模式
 */
/**
 * @property {boolean} _IN_WEB_DEBUG  在web端调试游戏
 */


var _global = typeof window === 'undefined' ? global : window;
// var _global: Window = (<any>window);
function defineMacro(name, defaultValue) {
    if (typeof _global[name] === 'undefined') {
        _global[name] = defaultValue;
    }
}

function ifDefined(name) {
    return typeof _global[name] === 'undefined';
}

/**
 * 定义一些宏
 */
defineMacro('define', defineMacro);
defineMacro('ifDefined', ifDefined);
defineMacro('ENABLE', ENABLE);
defineMacro('DEBUG', DEBUG);
defineMacro('IN_WEB_DEBUG', IN_WEB_DEBUG);
defineMacro('ASSERT', ASSERT);
defineMacro('SAFE_RELEASE', SAFE_RELEASE);
defineMacro('SAFE_RELEASE_NULL', SAFE_RELEASE_NULL);
defineMacro('SAFE_RETAIN', SAFE_RETAIN);
defineMacro('SAFE_AUTORELEASE', SAFE_AUTORELEASE);
defineMacro('SAFE_DESTROY_VIEW', SAFE_DESTROY_VIEW);
defineMacro('SAFE_CALLBACK', SAFE_CALLBACK);

cc.LogManager = {
    init(tag) {
        this.tag = tag;
        initDebugSetting(tag);
    }
}
//全局命名空间
_global.kit = _global.kit || {}
_global.utils = _global.utils || {}
_global.wx = _global.wx || {}
if (ENABLE) {
    kit = Kit;
    utils = Utils;
    wx = WX;
}

if (DEBUG) {
    initDebugInfos();
}
initDebugSetting(cc.LogManager.tag);

module.exports = _global.ck;