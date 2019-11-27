/**开启框架 */
export const ENABLE: boolean = true;
/**调试模式 */
export const DEBUG: boolean = true;
/**在网页上运行调试 */
export const IN_WEB_DEBUG: boolean = cc.sys.platform !== cc.sys.ANDROID || cc.sys.platform !== cc.sys.MACOS;

export function ASSERT(_Expression1: boolean, _Expression2: string = ''): void {
    if (_DEBUG) {
        if(_Expression1) {
            if (_Expression2) throw new Error(_Expression2);
            debugger;
        }
    }
}

export function SAFE_RELEASE(_Obj: cf.Reference): void {
    do {
        if (_Obj && _Obj.GetReferenceCount() == 1) { SAFE_RELEASE_NULL(_Obj); }
        else if (_Obj && _Obj.GetReferenceCount() > 1) { _Obj.Release(); }
    } while (0);
}

export function SAFE_RELEASE_NULL(_Obj: cf.Reference): void {
    do { if (_Obj) { _Obj.Release(); _Obj = null; } } while (0);
}

export function SAFE_RETAIN(_Obj: cf.Reference): void {
    do { if (_Obj) { _Obj.Retain(); } } while (0);
}

export function SAFE_AUTORELEASE(_Obj: cf.Reference): void {
    do { if ( _Obj) { _Obj.AutoRelease(); } } while (0);
}