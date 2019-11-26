import { initFrame } from "./Boot";
import { initDebugSetting } from "./Debugger";
import { initDebugInfos } from "./DebugInfos";


/**
 * @property {boolean} _ACTIVE 框架启动
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

function define(name: string, defaultValue: any): void {
    defineMacro(name, defaultValue);
}

function assert(_Expression1: boolean, _Expression2: string = ''): void {
    if (_DEBUG) {
        if(_Expression1) {
            if (_Expression2) throw new Error(_Expression2);
            debugger;
        }
    }
}

function safe_release(_Obj: cf.Reference): void {
    do {
        if (_Obj && _Obj.GetReferenceCount() == 1) { SAFE_RELEASE_NULL(_Obj); }
        else if (_Obj && _Obj.GetReferenceCount() > 1) { _Obj.Release(); }
    } while (0);
}

function safe_release_null(_Obj: cf.Reference): void {
    do { if (_Obj) { _Obj.Release(); _Obj = null; } } while (0);
}

function safe_retain(_Obj: cf.Reference): void {
    do { if (_Obj) { _Obj.Retain(); } } while (0);
}

function safe_addAutoRelease(): void {
    do { if ( cf.PoolManager.Instance) cf.PoolManager.Instance.AddAutoRelease(); } while (0);
}


/**
 * 定义一些宏
 */
defineMacro('define', define);
defineMacro('ifDefined', ifDefined);
defineMacro('_ENABLE', true);
defineMacro('_DEBUG', true);
defineMacro('_IN_WEB_DEBUG', cc.sys.platform !== cc.sys.ANDROID || cc.sys.platform !== cc.sys.MACOS);
defineMacro('ASSERT', assert);
defineMacro('SAFE_RELEASE', safe_release);
defineMacro('SAFE_RELEASE_NULL', safe_release_null);
defineMacro('SAFE_RETAIN', safe_retain);
defineMacro('SAFE_ADDAUTORELEASE', safe_addAutoRelease);


if (_ENABLE) {
    initFrame();
}

initDebugSetting();
if (_DEBUG) {
    initDebugInfos();
}
