import { EventListeners } from "../event_manager/EventListeners";
import { Reference } from "./Reference";
import * as kit from "../Kit";

type AnimateT = sp.SkeletonData;

export class AutoReleasePool extends EventListeners {
    private _isClearing: boolean;
    private _name: string;
    private _managedObjectMap: Map<string, Reference>;
    private _animateMap: Map<string, AnimateT> = new Map();
    constructor(name: string = null) {
        super();
        this._name = name;
        _DEBUG && (this._isClearing = false);
        this._managedObjectMap = new Map();
        ASSERT(!this._managedObjectMap, 'The managedObjectMap is null!');
        PoolManager.Instance.Push(this);
    }

    public IsClearing(): boolean {
        return this._isClearing;
    }

    /**
     * 增加资源对象
     * @param object 资源对象
     */
    public AddObject(object: kit.Reference): void {
        this._managedObjectMap.set(object.Key, object);
    }
    
    public AddAnimateData(key: string, animate: AnimateT): void {
        this._animateMap.set(key, animate);
    }

    public GetObject(key: string): kit.Reference {
        return this._managedObjectMap.get(key);
    }

    public GetAnimateData(key: string): AnimateT {
        return this._animateMap.get(key);
    }

    public Contains(key: string): boolean {
        return this._managedObjectMap.has(key);
    }

    public Delete(key: string): void {
        this._managedObjectMap.delete(key);
    }

    /**释放所有锁定的资源 */
    public Clear(): void {
        _DEBUG && (this._isClearing = true);
        this._managedObjectMap.forEach((value: kit.Reference, key: string, map: Map<string, kit.Reference>) => {
            let res: kit.Resource = value as kit.Resource;
            if (res.IsLock) {
                res.IsLock = false;
                map.delete(key);
                SAFE_RELEASE(res);
            }
        });
    }

    public Dump(): void {
        kit.Debug('autorelease pool ' + ': ' + this._name.toString() + ', number of managed object ' + this._managedObjectMap.size);
    }
}

export class PoolManager extends EventListeners {
    private _releasePoolStack: kit.Vector<AutoReleasePool> = new kit.Vector<AutoReleasePool>();
    private static _ins: PoolManager = null;
    constructor() {
        super();
        _DEBUG && ASSERT(!this._releasePoolStack, 'The "_releasePoolStack" is null!');
        this._releasePoolStack.Reserve(10, true);
    }

    public static get Instance(): PoolManager {
        if (!this._ins) {
            this._ins = new PoolManager();
            let pool: AutoReleasePool = new AutoReleasePool('Resource autorelease pool');
            _DEBUG && ASSERT(!pool, 'The "pool" is null!');
        }
        return this._ins;
    }

    public static PurgePoolManager(): void {
        this.DestroyPoolManager();
    }

    public static DestroyPoolManager(): void {
        delete this._ins;
        this._ins = null;
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
            if (this._releasePoolStack.Back(key).Contains((object as kit.Resource).Key)) {
                return true;
            }
        }
        return false;
    }
}