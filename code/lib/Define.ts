

/**调试模式 */
export const CCK_DEBUG: boolean = CC_DEBUG;
/**日志显示时间 */
export const SHOW_DATE: boolean = false;
/**在网页上运行调试 */
export const IN_WEB_DEBUG: boolean = cc.sys.platform !== cc.sys.ANDROID || cc.sys.platform !== cc.sys.MACOS;

export function SAFE_CALLBACK(fn: Function, ...args: any) {
    if (typeof fn === 'function') {
        fn.apply(null, args);
    }
}

export function SAFE_CALLBACK_CALLER(fn: Function, caller: any, ...args: any) {
    if (typeof fn === 'function') {
        fn.apply(caller, args);
    }
}

export const GAME_NAME = {
    name: ""
}
