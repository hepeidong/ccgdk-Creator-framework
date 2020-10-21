import {EventListeners} from "../event_manager/EventListeners";
import { PoolManager } from "./AutoReleasePool";
// import CreatorKit from "../Kit";

export class Reference extends EventListeners {
    /** @private 引用计数 */
    private _referenceCount: number;
    /** @private 是否已经做释放处理 */
    private _isDestoryed: boolean;
    /** @private 资源的key值*/
    protected _key: string;
    constructor() {
        super();
        this._referenceCount = 0;
        this._isDestoryed = false;
    }

    /** @public 资源的key值*/
    public set Key(value: string) { this._key = value; }
    /** @public 资源的key值*/
    public get Key():string { return this._key; }

    public Retain(): void {
        ++this._referenceCount;
        // kit.LogID(203, `${this.Key} ${this._referenceCount}`);
    }

    public IsDestroyed(): boolean { return this._isDestoryed; }

    public Release(): void {
        --this._referenceCount;
        // kit.LogID(201, `${this.Key} ${this._referenceCount}`);
        if (this._referenceCount == 0) {
            if (_DEBUG) {
                if (PoolManager.Instance.GetCurrentPool().IsClearing() && PoolManager.Instance.IsObjectInPools(this)) {
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