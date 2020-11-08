/**开启框架 */
export const ENABLE: boolean = true;
/**调试模式 */
export const DEBUG: boolean = CC_DEBUG;
/**在网页上运行调试 */
export const IN_WEB_DEBUG: boolean = cc.sys.platform !== cc.sys.ANDROID || cc.sys.platform !== cc.sys.MACOS;

export function ASSERT(_Expression1: boolean, _Expression2: string = ''): void {
    if (DEBUG) {
        kit.assert(_Expression1, _Expression2);
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
