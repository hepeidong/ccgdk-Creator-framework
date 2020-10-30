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
        PoolManager.Instance.push(this);
    }

    public isClearing(): boolean {
        return this._isClearing;
    }

    /**
     * 增加资源对象
     * @param object 资源对象
     */
    public addObject(object: kit.Reference): void {
        this._managedObjectMap.set(object.Key, object);
    }
    
    public addAnimateData(key: string, animate: AnimateT): void {
        this._animateMap.set(key, animate);
    }

    public getObject(key: string): kit.Reference {
        return this._managedObjectMap.get(key);
    }

    public getAnimateData(key: string): AnimateT {
        return this._animateMap.get(key);
    }

    public contains(key: string): boolean {
        return this._managedObjectMap.has(key);
    }

    public delete(key: string): void {
        this._managedObjectMap.delete(key);
    }

    /**释放所有锁定的资源 */
    public clear(): void {
        _DEBUG && (this._isClearing = true);
        this._managedObjectMap.forEach((value: kit.Reference, key: string, map: Map<string, kit.Reference>) => {
            let res: kit.Resource = value as kit.Resource;
            if (res.isLock) {
                res.isLock = false;
                map.delete(key);
                SAFE_RELEASE(res);
            }
        });
    }

    public dump(): void {
        kit.debug('autorelease pool ' + ': ' + this._name.toString() + ', number of managed object ' + this._managedObjectMap.size);
    }
}

export class PoolManager extends EventListeners {
    private _releasePoolStack: kit.Vector<AutoReleasePool> = new kit.Vector<AutoReleasePool>();
    private static _ins: PoolManager = null;
    constructor() {
        super();
        _DEBUG && ASSERT(!this._releasePoolStack, 'The "_releasePoolStack" is null!');
        this._releasePoolStack.reserve(10, true);
    }

    public static get Instance(): PoolManager {
        if (!this._ins) {
            this._ins = new PoolManager();
            let pool: AutoReleasePool = new AutoReleasePool('Resource autorelease pool');
            _DEBUG && ASSERT(!pool, 'The "pool" is null!');
        }
        return this._ins;
    }

    public static purgePoolManager(): void {
        this.destroyPoolManager();
    }

    public static destroyPoolManager(): void {
        delete this._ins;
        this._ins = null;
    }

    public getCurrentPool(): AutoReleasePool {
        return this._releasePoolStack.back();
    }

    public push(pool: AutoReleasePool): void {
        this._releasePoolStack.push(pool);
    }

    public pop(): AutoReleasePool {
        return this._releasePoolStack.pop();
    }

    public isObjectInPools(object: Reference): boolean {
        for (let key: number = 0; key < this._releasePoolStack.length; ++key) {
            if (this._releasePoolStack.back(key).contains((object as kit.Resource).Key)) {
                return true;
            }
        }
        return false;
    }
}