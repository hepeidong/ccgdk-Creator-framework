import { SystemDoesNotHaveNameException } from "./exceptions/SystemDoesNotHaveNameException";
import { ECS_DEBUG } from "./ECSDef";
import { Utils } from "../utils/GameUtils";
import { setParentType } from "../app/Decorator";

/**
 * 系统类
 */
export abstract class System<T extends IEntity> implements ISystem<T> {
    private static createIndexes: number = 0;

    private _ID: string;
    private _name: string;
    private _createIndex: number;
    private _pool: IEntityManager<T>;

    protected _enabled: boolean;
    
    constructor() {
        this._ID          = '';
        this._enabled     = true;
        this._createIndex = System.createIndexes++;
        if (Utils.isUndefined(this._name)) {
            this._name = this['__classname__'];
            if (Utils.isUndefined(this._name) || Utils.isNull(this._name) || this._name.length === 0) {
                throw new Error(new SystemDoesNotHaveNameException(this._createIndex, this.toString()).toString());
            }
        }
    }

    public get ID(): string { return this._ID; }
    public get name(): string { return this._name; }
    public set enabled(val: boolean) { 
        if (typeof val === 'boolean') {
            this._enabled = val; 
            if (!val) {
                this.onDisable();
            }
        }
        else {
            throw console.error("给'enabled'赋值的类型必须是boolean");
        }
    }
    public get enabled(): boolean { return this._enabled; }
    protected get pool(): IEntityManager<T> { return this._pool; }

    public setID(id: string) {
        this._ID = id;
    }

    public setPool(pool: IEntityManager<T>) {
        this._pool = pool;
    }

    /**基类方法，外部不可调用此方法，否则会引发不可预知错误 */
    create(): void {
        this.onCreate();
    }
    /**基类方法，外部不可调用此方法，否则会引发不可预知错误 */
    start(): void {
        this.onStart();
    }
    /**基类方法，外部不可调用此方法，否则会引发不可预知错误 */
    update(dt: number): void {
        if (this._enabled) {
            this.onUpdate(dt);
        }
    }
    destroy(): void {
        this.onDestroy();
    }
    /**系统创建时调用，该方法为生命周期方法，子类可以重写覆盖该方法，父类未必会有实现，并且只能在方法内部调用父类方法，不能在其他地方调用该方法 */
    protected onCreate() {}
    /**该方法是在系统第一次激活运行时, 并且在onUpdate运行之前被调用一次，子类可以重写覆盖该方法，父类未必会有实现，并且只能在方法内部调用父类方法，不能在其他地方调用该方法 */
    protected onStart(): void {}
    /**
     * 每一帧运行时被调用，该方法为生命周期方法，子类可以重写覆盖该方法，父类未必会有实现，并且只能在方法内部调用父类方法，不能在其他地方调用该方法
     * @param dt 
     */
    protected onUpdate(dt: number): void {}
    /**当前系统被禁用时调用，该方法为生命周期方法，子类可以重写覆盖该方法，父类未必会有实现，并且只能在方法内部调用父类方法，不能在其他地方调用该方法 */
    protected onDisable(): void {}
    /**当前系统被销毁时调用，该方法为生命周期方法，子类可以重写覆盖该方法，父类未必会有实现，并且只能在方法内部调用父类方法，不能在其他地方调用该方法 */
    protected onDestroy(): void {}

    public toString() {
        return Utils.StringUtil.replace("[System:{0}] ", this._name);
    }

    static NAME = "System";
}

setParentType("system", System);