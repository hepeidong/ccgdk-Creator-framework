import { EventListeners } from "../event_manager/EventListeners";
import { Reference } from "./Reference";
import { Resource } from "./Resource";
import { UIViewController } from "../ui_manager/UIViewController";
import { RootViewController } from "../ui_manager/RootViewController";

type winType = UIViewController | RootViewController;//窗口类型

export class AutoReleasePool extends EventListeners {
    private _outOfMemory: boolean;
    private _name: string;
    private _managedObjectMap: Map<string, Reference> = new Map();
    /**窗口队列 */
    private _winQueue: cf.PriorityQueue<winType> = new cf.PriorityQueue((a: winType, b: winType) => {
        //根视图放在最后面
        return a.priority < b.priority;
    });
    constructor(name: string = null) {
        super();
        this._name = name;
        this._outOfMemory = false;
        ASSERT(!this._managedObjectMap, 'Error:_managedObjectMap is null!');
        ASSERT(!this._winQueue, 'Error:_winQueue is null!');
        PoolManager.Instance.Push(this);
    }

    /**
     * 增加资源对象
     * @param object 资源对象
     */
    public AddObject(object: Reference): void {
        PoolManager.Instance.memorySize += object.memorySize;
        if (PoolManager.Instance.IsOutOfMemory()) {
            this._outOfMemory = true;
            this.Emit(cf.EventName.DESIGN_OUT_OF_MEMORY);
            cf.LogID(108);
        }
        this._managedObjectMap.set((object as Resource).Key, object);
    }
    /**
     * 增加窗口控制器
     * @param controller 控制器
     */
    public AddController(controller: winType): void {
        this._winQueue.Push(controller);
    }
    /**
     * 移除指定窗口
     * @param controller 
     */
    public Remove(controller: winType): void {
        this._winQueue.Remove(controller, (a: winType) => {
            return a.priority;
        });
    }

    /**检测内存 */
    public CheckMemory(fn: (outOfMemory: boolean) => void): void {
        while(1) {
            fn(this._outOfMemory);
            if (this._outOfMemory) {
                let  controller: winType = this._winQueue.Pop();
                ASSERT(!controller, 'Error:The _winQueue calling Pop error,return error value!');
                if (!controller.isRootView) {
                    controller.Destroy();
                }
                else {
                    controller.Destroy();
                    cf.ErrorID(204);
                }
            }
            else {
                break;
            }
            this._outOfMemory = PoolManager.Instance.IsOutOfMemory();
        }
    }

    public GetObject(key: string): Reference {
        this._managedObjectMap.keys()
        return this._managedObjectMap.get(key);
    }

    public Contains(key: string): boolean {
        return this._managedObjectMap.has(key);
    }

    /** */
    public ClearOf(key: string): void {
        let res: Resource = this._managedObjectMap.get(key) as Resource;
        SAFE_RELEASE(res);
        this._managedObjectMap.delete(key);
    }

    /**释放所有锁定的资源 */
    public Clear(): void {
        this._managedObjectMap.forEach((value: Reference, key: string, map: Map<string, Reference>) => {
            let res: Resource = value as Resource;
            if (res.IsLock) {
                res.IsLock = false;
                SAFE_RELEASE(res);
            }
        });
    }

    public Dump(): void {
        cf.Debug('autorelease pool ' + ': ' + this._name.toString() + ', number of managed object ' + this._managedObjectMap.size);

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

    public IsOutOfMemory(): boolean {
        return this.memorySize >= this.memoryCapSize;
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
            if (this._releasePoolStack.Back(key).Contains((object as Resource).Key)) {
                return true;
            }
        }
        return false;
    }
}
