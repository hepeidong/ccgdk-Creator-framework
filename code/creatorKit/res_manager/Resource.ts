
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

    static create(key: string, isLock: boolean): Resource {
        let res: Resource = new Resource();
        if (res) {
            res.Key = key;
            res.isLock = isLock;
        }
        SAFE_AUTORELEASE(res);
        return res;
    }

    public addDepend(dep: string): void { this._depends.add(dep); }
    public hasDepend(key: string): boolean { return this._depends.has(key); }
    /** @public 是否加锁，加锁则需要手动释放 */
    public set isLock(is: boolean) { this._isLock = is; }
    /** @public 是否加锁，加锁则需要手动释放 */
    public get isLock(): boolean { return this._isLock; }

    public release() {
        super.release();
        this._depends.forEach((value: string, _value2: string, _set: Set<string>) => {
            SAFE_RELEASE(kit.PoolManager.Instance.getCurrentPool().getObject(value) as kit.Resource);
        });
    }

    public retain() {
        super.retain();
        this._depends.forEach((value: string, _value2: string, _set: Set<string>) => {
            SAFE_RETAIN(kit.PoolManager.Instance.getCurrentPool().getObject(value) as kit.Resource);
        });
    }

    destroy(): void {
        if (!this._isLock) {
            super.destroy();
            kit.PoolManager.Instance.getCurrentPool().delete(this.Key);
            // kit.LogID(202, this.Key);
            cc.loader.release(this.Key);
            this.emit(kit.EventName.DESTROYED_AFTER, this.Key);
        }
    }
}