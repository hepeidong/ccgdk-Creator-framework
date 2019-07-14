import {Reference} from "./Reference";
import {PoolManager} from "./AutoReleasePool";
 export namespace G {
    export const G_DEBUG: number = 1;
    export const IF_DEFINE_DEBUG = (G_DEBUG && G_DEBUG > 0);
    export const ASSERT = function(_Expression1: boolean, _Expression2: string = ''): void {
        if (G_DEBUG && G_DEBUG > 0) {
            if(_Expression1) {
                if (_Expression2) throw _Expression2;
                debugger;
            }
        }
    }
    export const DEBUG_LOG = function(msg: any, ...agr: Array<any>): void {
        G.IF_DEFINE_DEBUG && console.log(msg, agr);
    }
    export const SAFE_RELEASE = function (_Obj: Reference) {
        do {
            if (_Obj.GetReferenceCount() == 1) { SAFE_RELEASE_NULL(_Obj); }
            else if (_Obj.GetReferenceCount() > 1) { _Obj.Release(); }
        } while (0);
    }
    export const SAFE_RELEASE_NULL = function (_Obj: Reference) {
        do { if (_Obj) { _Obj.Release(); _Obj = null; } } while (0);
    }
    export const SAFE_RETAIN = function (_Obj: Reference) {
        do { if (_Obj) { _Obj.Retain(); } } while (0);
    }
    export const SAFE_ADDAUTORELEASE = function () {
        do { if ( PoolManager.Instance) PoolManager.Instance.AddAutoRelease(); } while (0)
    }

    export let EventName = null;
    export let Loader = null;
}