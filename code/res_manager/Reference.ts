import {EventListeners} from "../event_manager/EventListeners";
import { PoolManager } from "./AutoReleasePool";

export class Reference extends EventListeners {
    /** @private 引用计数 */
    private _referenceCount: number;
    /** @private 是否已经做释放处理 */
    private _isDestoryed: boolean;
    /** @private 资源内存大小*/
    private _memorySize: number;
    constructor() {
        super();
        this._referenceCount = 0;
        this._memorySize = 0
        this._isDestoryed = false;
    }

    /** @public 设置资源内存大小*/
    public set memorySize(value: number) { this._memorySize = value; }
    /** @public 返回资源内存大小*/
    public get memorySize(): number { return this._memorySize; }

    public Retain(): void {
        cf.LogID(203);
        ++this._referenceCount;
    }

    public IsDestroyed(): boolean { return this._isDestoryed; }

    public Release(): void {
        cf.LogID(201);
        --this._referenceCount;
        if (this._referenceCount == 0) {
            if (_DEBUG) {
                let poolManager = PoolManager.Instance;
                if (poolManager.GetCurrentPool().IsClearing() && poolManager.IsObjectInPools(this)) {
                    ASSERT(false, "The reference shouldn't be 0 because it is still in autorelease pool.");
                }
            }
            this.Destroy();
        }
    }

    public AutoRelease(): Reference {
        PoolManager.Instance.GetCurrentPool().AddObject(this);
        return this;
    }

    public GetReferenceCount(): number {
        return this._referenceCount;
    }

    protected Destroy(): void {
        this._isDestoryed = true;
    }
}
