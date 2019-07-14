import { PoolManager } from "./AutoReleasePool";
import {G} from "./G";
import {EventListeners} from "./EventListeners";
import {IDestroy} from "./IDestroy";

export class Reference extends EventListeners implements IDestroy{
    /** @private 引用计数 */
    private _referenceCount: number;
    /** @private 是否已经做释放处理 */
    private _isDestoryed: boolean;
    /** @private 自动释放池id */
    private _groupID: number;
    constructor() {
        super();
        this._referenceCount = 0;
        this._isDestoryed = false;
    }

    public set GroupID(id: number) {
        this._groupID = id;
    }

    public Retain(): void {
        ++this._referenceCount;
    }

    public Release(): void {
        --this._referenceCount;
        if (this._referenceCount == 0) {
            if (G.IF_DEFINE_DEBUG) {
                let poolManager = PoolManager.Instance;
                if (poolManager.GetCurrentPool(this._groupID).IsClearing() && poolManager.IsObjectInPools(this)) {
                    G.ASSERT(false, "The reference shouldn't be 0 because it is still in autorelease pool.");
                }
            }
            this.OnDestroy();
        }
    }

    public AutoRelease(): Reference {
        PoolManager.Instance.GetCurrentPool(this._groupID).AddObject(this);
        return this;
    }

    public GetReferenceCount(): number {
        return this._referenceCount;
    }

    OnDestroy(): void {
        this.Emit(G.EventName.DESTROYED_BEFORE);
        this._isDestoryed = true;
        for (let key in this) {
            if (this.hasOwnProperty(key)) delete this[key];
        }
    }

    IsDestroyed(): boolean { return this._isDestoryed; }
}
