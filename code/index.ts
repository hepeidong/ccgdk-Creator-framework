import { initFrame } from "./Boot";
import { initDebugSetting } from "./Debugger";
import { initDebugInfos } from "./DebugInfos";
import { ENABLE,
         DEBUG,
         IN_WEB_DEBUG,
         ASSERT,
         SAFE_RELEASE,
         SAFE_RELEASE_NULL,
         SAFE_AUTORELEASE,
         SAFE_RETAIN } from "./CFDefine";


/**
 * @property {boolean} _ENABLE 框架启动
 */
/**
 * @property {boolean} _DEBUG 调试模式
 */
/**
 * @property {boolean} _IN_WEB_DEBUG  在web端调试游戏
 */


// var _global: any = typeof window === 'undefined' ? global : window;
var _global: Window = (<any>window);
function defineMacro(name: string, defaultValue: any): void {
    if (typeof _global[name] === 'undefined') {
        _global[name] = defaultValue;
    }
}

function ifDefined(name): boolean {
    return typeof _global[name] === 'undefined';
}



/**
 * 定义一些宏
 */
defineMacro('define', defineMacro);
defineMacro('ifDefined', ifDefined);
defineMacro('_ENABLE', ENABLE);
defineMacro('_DEBUG', DEBUG);
defineMacro('_IN_WEB_DEBUG', IN_WEB_DEBUG);
defineMacro('ASSERT', ASSERT);
defineMacro('SAFE_RELEASE', SAFE_RELEASE);
defineMacro('SAFE_RELEASE_NULL', SAFE_RELEASE_NULL);
defineMacro('SAFE_RETAIN', SAFE_RETAIN);
defineMacro('SAFE_AUTORELEASE', SAFE_AUTORELEASE);


if (_ENABLE) {
    initFrame();
}

initDebugSetting();
if (_DEBUG) {
    initDebugInfos();
}
