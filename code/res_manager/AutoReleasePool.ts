import { EventListeners } from "../event_manager/EventListeners";
import { Reference } from "./Reference";
import { Resource } from "./Resource";

export class AutoReleasePool extends EventListeners {
    private isClearing: boolean;
    private _name: string;
    private _managedObjectArray: Map<string, Reference> = new Map();
    constructor(name: string = null) {
        super();
        this._name = name;
        _DEBUG && (this.isClearing = false);
        _DEBUG && ASSERT(!this._managedObjectArray, 'Error:_managedObjectArray is null!');
        PoolManager.Instance.Push(this);
    }

    public IsClearing(): boolean {
        return this.isClearing;
    }

    public AddObject(object: Reference): void {
        PoolManager.Instance.memorySize += object.memorySize;
        if (PoolManager.Instance.memorySize >= PoolManager.Instance.memoryCapSize) {
            this.Emit(cf.EventName.DESIGN_OUT_OF_MEMORY);
            cf.LogID(108);
        }
        this._managedObjectArray.set((object as Resource).Key, object);
    }

    public GetObject(key: string): Reference {
        this._managedObjectArray.keys()
        return this._managedObjectArray.get(key);
    }

    public Contains(key: string): boolean {
        return this._managedObjectArray.has(key);
    }

    /** */
    public ClearOf(key: string): void {
        _DEBUG && (this.isClearing = true);
        let res: Resource = this._managedObjectArray.get(key) as Resource;
        SAFE_RELEASE(res);
        this._managedObjectArray.delete(key);
        _DEBUG && (this.isClearing = false);
    }

    /**释放所有锁定的资源 */
    public Clear(): void {
        this._managedObjectArray.forEach((value: Reference, key: string, map: Map<string, Reference>) => {
            let res: Resource = value as Resource;
            if (res.IsLock) {
                res.IsLock = false;
                SAFE_RELEASE(res);
            }
        });
    }

    public Dump(): void {
        cf.Log('autorelease pool ' + ': ' + this._name.toString() + ', number of managed object ' + this._managedObjectArray.size);

    }
}

export class PoolManager extends EventListeners {
    private _releasePoolStack: cf.Vector<AutoReleasePool> = new cf.Vector<AutoReleasePool>();
    /**@private 资源内存上限 */
    private _memoryCapSize: number;
    /**@private 资源内存大小总量 */
    private _memorySize: number;
    private static _ins: PoolManager = null;
    constructor() {
        super();
        this.On(cf.EventName.DESTROYED_AFTER, this, this.OnDestroyedAfter);
        _DEBUG && ASSERT(!this._releasePoolStack, 'The "_releasePoolStack" is null!');
        this._releasePoolStack.Reserve(10, true);
        //初始化内存上限
        this._memoryCapSize = 1024 * 1024 * MEMORY_CAP_SIZE;
        this._memorySize = 0;
    }

    public static get Instance(): PoolManager {
        if (!this._ins) {
            this._ins = new PoolManager();
            let pool: AutoReleasePool = new AutoReleasePool('Resource autorelease pool');
            _DEBUG && ASSERT(!pool, 'The "pool" is null!');
        }
        return this._ins;
    }

    public set memorySize(value: number) { this._memorySize = value; }
    public get memorySize(): number { return this._memorySize; }
    public get memoryCapSize(): number { return this._memoryCapSize; }

    public static PurgePoolManager(): void {
        this.DestroyPoolManager();
    }

    public static DestroyPoolManager(): void {
        delete this._ins;
        this._ins = null;
    }

    public AddAutoRelease(): boolean {
        return new AutoReleasePool('Resource autorelease pool') ? true : false;
    }

    public GetCurrentPool(): AutoReleasePool {
        return this._releasePoolStack.Back();
    }

    public Push(pool: AutoReleasePool): void {
        this._releasePoolStack.Push(pool);
    }

    public Pop(): AutoReleasePool {
        return this._releasePoolStack.Pop();
    }

    public IsObjectInPools(object: Reference): boolean {
        for (let key: number = 0; key < this._releasePoolStack.Length(); ++key) {
            if (this._releasePoolStack.Back(key).Contains((object as Resource).Key)) {
                return true;
            }
        }
        return false;
    }

    private OnDestroyedAfter(key: string, memory: number): void {
        this._memorySize -= memory;
        if (this._memorySize >= this._memoryCapSize) {
            this.Emit(cf.EventName.DESIGN_OUT_OF_MEMORY);
        }
    }
}
