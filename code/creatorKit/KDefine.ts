/**开启框架 */
export const ENABLE: boolean = true;
/**调试模式 */
export const DEBUG: boolean = true;
/**在网页上运行调试 */
export const IN_WEB_DEBUG: boolean = cc.sys.platform !== cc.sys.ANDROID || cc.sys.platform !== cc.sys.MACOS;
/**内存上限(20M) */
export const MEMORY_CAP_SIZE: number = 50;
/**设计分辨率宽 */
export const EXPLOIT_PIXELS_W: number = 1280;
/**设计分辨率高 */
export const EXPLOIT_PIXELS_H: number = 720;

export function ASSERT(_Expression1: boolean, _Expression2: string = ''): void {
    if (_DEBUG) {
        if(_Expression1) {
            if (_Expression2) throw new Error(_Expression2);
            debugger;
        }
    }
}

export function SAFE_RELEASE(_Obj: kit.Reference): void {
    do {
        if (_Obj && _Obj.getReferenceCount() > 0) {  _Obj.release(); }
    } while (0);
}

export function SAFE_RELEASE_NULL(_Obj: kit.Reference): void {
    do { if (_Obj) { _Obj.release(); _Obj = null; } } while (0);
}

export function SAFE_RETAIN(_Obj: kit.Reference): void {
    do { if (_Obj) { _Obj.retain(); } } while (0);
}

export function SAFE_AUTORELEASE(_Obj: kit.Reference): void {
    do { if ( _Obj) { _Obj.autoRelease(); } } while (0);
}

export function SAFE_DESTROY_VIEW(_Obj: kit.Controller): void {
    do { if (_Obj) {_Obj.destroy(false); } } while (0);
}

export function SAFE_CALLBACK(fn, ...args) {
    if (typeof fn === 'function') {
        fn.apply(null, args);
    }
}
