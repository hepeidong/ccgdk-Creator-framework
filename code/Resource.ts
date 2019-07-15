import {Reference} from "./Reference";
import {G} from "./G";
export class Resource extends Reference {
    /** @private 资源的key值*/
    private _key: string;
    /** @private 是否加锁，加锁则需要手动释放 */
    private _isLock: boolean;

    constructor() {
        super();
        this._key = '';
        this._isLock = false;
    }

    /** @public 资源的key值*/
    public set Key(value: string) { this._key = value; }
    /** @public 资源的key值*/
    public get Key():string { return this._key; }
    /** @public 是否加锁，加锁则需要手动释放 */
    public set IsLock(is: boolean) { this._isLock = is; }
    /** @public 是否加锁，加锁则需要手动释放 */
    public get IsLock(): boolean { return this._isLock; }

    OnDestroy(): void {
        if (!this._isLock) {
            let key: string = this._key;
            super.OnDestroy();
            this.ReleaseRes();
            this.Emit(G.EventName.DESTROYED_AFTER, [key]);
        }
    }

    /**
     * 释放资源
     * @constructor
     */
    private ReleaseRes(): void {
        let releaseAssets = [];
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
    private ReleaseDependAsset(releaseAssets, dependKeys) {
        let releaseJsonAssets = [];
        for (let dep_k in dependKeys) {
            for (let i = 0; i < dependKeys.length; ++i) {
                if (releaseAssets.indexOf(dependKeys[i]) !== -1) {
                    cc.loader.release(cc.loader['_cache'][dep_k].url);
                    releaseJsonAssets.push(cc.loader['_cache'][dep_k].url);
                }
            }
        }

        for (let dep_k in dependKeys) {
            for (let i = 0; i < dependKeys.length; ++i) {
                if (releaseJsonAssets.indexOf(dependKeys[i]) !== -1) {
                    cc.loader.release(cc.loader['_cache'][dep_k].url);
                }
            }
        }
    }
}