
import { Reference } from "./Reference";

export class Resource extends Reference {
    /**@private 依赖资源列表 */
    private _depends: Set<string>;
    /** @private 是否加锁，加锁则需要手动释放 */
    private _isLock: boolean;
    constructor() {
        super();
        this._key = '';
        this._depends = new Set();
        this._isLock = false;
    }

    static Create(key: string, isLock: boolean): Resource {
        let res: Resource = new Resource();
        if (res) {
            res.Key = key;
            res.IsLock = isLock;
        }
        SAFE_AUTORELEASE(res);
        return res;
    }

    public AddDepend(dep: string): void { this._depends.add(dep); }
    public HasDepend(key: string): boolean { return this._depends.has(key); }
    /** @public 是否加锁，加锁则需要手动释放 */
    public set IsLock(is: boolean) { this._isLock = is; }
    /** @public 是否加锁，加锁则需要手动释放 */
    public get IsLock(): boolean { return this._isLock; }

    public Release() {
        super.Release();
        this._depends.forEach((value: string, _value2: string, _set: Set<string>) => {
            SAFE_RELEASE(kit.PoolManager.Instance.GetCurrentPool().GetObject(value) as kit.Resource);
        });
    }

    public Retain() {
        super.Retain();
        this._depends.forEach((value: string, _value2: string, _set: Set<string>) => {
            SAFE_RETAIN(kit.PoolManager.Instance.GetCurrentPool().GetObject(value) as kit.Resource);
        });
    }

    Destroy(): void {
        if (!this._isLock) {
            super.Destroy();
            kit.PoolManager.Instance.GetCurrentPool().Delete(this.Key);
            // kit.LogID(202, this.Key);
            cc.loader.release(this.Key);
            this.Emit(kit.EventName.DESTROYED_AFTER, this.Key);
        }
    }
}