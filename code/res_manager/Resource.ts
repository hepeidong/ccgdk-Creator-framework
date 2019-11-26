import { Reference } from "./Reference";
import { PoolManager } from "./AutoReleasePool";
// import { EventName } from "./EventName";

export class Resource extends Reference {
    /** @private 资源的key值*/
    private _key: string;
    /** @private 是否加锁，加锁则需要手动释放 */
    private _isLock: boolean;
    /**处在释放过程中 */
    private _isReleasing: boolean;
    constructor() {
        super();
        this._key = '';
        this._isLock = false;
        this._isReleasing = false;
    }

    /** @public 资源的key值*/
    public set Key(value: string) { this._key = value; }
    /** @public 资源的key值*/
    public get Key():string { return this._key; }
    /** @public 是否加锁，加锁则需要手动释放 */
    public set IsLock(is: boolean) { this._isLock = is; }
    /** @public 是否加锁，加锁则需要手动释放 */
    public get IsLock(): boolean { return this._isLock; }

    Destroy(): void {
        if (!this._isLock) {
            cf.LogID(202, this.Key);
            super.Destroy();
            PoolManager.Instance.GetCurrentPool().ClearOf(this.Key);
            this.ReleaseRes();
            this.Emit(cf.EventName.DESTROYED_AFTER, [this.Key, this.memorySize]);
        }
    }

    /**
     * 释放资源
     * @constructor
     */
    private ReleaseRes(): void {
        this._isReleasing =true;
        this.Emit(cf.EventName.DESTROYED_BEFORE);
        let releaseAssets: string[] = [];
        let dependKeys = {};
        for (let k in cc.loader['_cache']) {
            if (cc.loader['_cache'][k].dependKeys && cc.loader['_cache'][k].dependKeys.length > 0) {
                dependKeys[k] = cc.loader['_cache'][k].dependKeys;
            }
        }
        
        cc.loader.release(this._key);
        releaseAssets.push(this._key);
        this.ReleaseDependAsset(releaseAssets, dependKeys);
    }

    /** 释放资源数据 */
    private ReleaseDependAsset(releaseAssets: string[], dependKeys: any): void {
        let releaseJsonAssets: string[] = [];
        for (let dep_k in dependKeys) {
            for (let i = 0; i < dependKeys[dep_k].length; ++i) {
                if (releaseAssets.indexOf(dependKeys[dep_k][i]) !== -1) {
                    releaseJsonAssets.push(cc.loader['_cache'][dep_k].url);
                    cc.loader.release(cc.loader['_cache'][dep_k].url);
                }
            }
        }

        for (let dep_k in dependKeys) {
            for (let i = 0; i < dependKeys[dep_k].length; ++i) {
                if (releaseJsonAssets.indexOf(dependKeys[dep_k][i]) !== -1) {
                    if (cc.loader['_cache'][dep_k]) {
                        cc.loader.release(cc.loader['_cache'][dep_k].url);
                    }
                }
            }
        }
    }
}