import { EntityAlreadyHasComponentException } from "./exceptions/EntityAlreadyHasComponentException";
import { EntityDoesNotHaveComponentException } from "./exceptions/EntityDoesNotHaveComponentException";
import { EntityAlreadyReleasedException } from "./exceptions/EntityAlreadyReleasedException";
import { EntityIsNotEnabledException } from "./exceptions/EntityIsNotEnabledException";
import { ECS_DEBUG } from "./ECSDef";
import { ComponentTypes } from "./ComponentTypes";
import { utils } from "../utils";
import { Debug } from "../Debugger";
import { EntityChange, EntityReleased, IComponent, IBaseEntity, IEntityChange, IEntityManager, IEntityReleased } from "../lib.cck";
import { EventSystem } from "../event/EventSystem";


/**
 * 实体类
 */
export class Entity implements IBaseEntity {
    private _ID: string;                      //实体ID， 实体的唯一标识
    private _name: string;                    //实体名
    private _totalComponent: number;          //组件的最大个数，一般是项目当前所有组件的数量
    private _enabled: boolean;                //是否被激活，实体一旦被销毁，则此项设为false，将被实体对象池回收
    private _groupId: string;              //实体被引用的所有组ID，其数量跟引用计数ref相等
    private _componentTypes: ComponentTypes;  //组件类型
    private _componentNum: {};                //所有的组件枚举
    private _onComponentAdded: IEntityChange<EntityChange, IEntityManager<IBaseEntity>>;       //增加组件时的事件回调
    private _onComponentRemoved: IEntityChange<EntityChange, IEntityManager<IBaseEntity>>;     //移除组件时的事件回调
    private _onEntityReleased: IEntityReleased<EntityReleased, IEntityManager<IBaseEntity>>;   //释放实体时的事件回调
    private _onEntityDestroyed: IEntityReleased<EntityReleased, IEntityManager<IBaseEntity>>;  //销毁组件时的事件回调
    constructor(context: IEntityManager<IBaseEntity>, componentNum: {}, totalComponent: number) {
        this._ID       = '';
        this._enabled  = true;
        this._groupId = '';
        this._componentTypes = new ComponentTypes();
        this._componentNum   = componentNum;
        this._totalComponent = totalComponent;
        this._onComponentAdded   = new EventSystem.Signal(context);
        this._onComponentRemoved = new EventSystem.Signal(context);
        this._onEntityReleased   = new EventSystem.Signal(context);
        this._onEntityDestroyed  = new EventSystem.Signal(context);
        this.initialize();
    }

    /**该实体的唯一标志 */
    public get ID(): string { return this._ID; }
    /**实体名 */
    public get name(): string { return this._name; }
    /**实体是否被激活 */
    public get enabled(): boolean { return this._enabled; }
    /**所有组件类型 */
    public get types(): number[] { return this._componentTypes.types; }
    /**该实体所处的所有组的所有组id */
    public get groupId(): string { return this._groupId; }
    /**组件增加后执行的回调 */
    public get onComponentAdded(): IEntityChange<EntityChange, IEntityManager<IBaseEntity>> { return this._onComponentAdded; }
    /**组件删除后执行的回调 */
    public get onComponentRemoved(): IEntityChange<EntityChange, IEntityManager<IBaseEntity>> { return this._onComponentRemoved; }
    /**该实体释放时的回调 */
    public get onEntityReleased(): IEntityReleased<EntityReleased, IEntityManager<IBaseEntity>> { return this._onEntityReleased; }
    /**该实体销毁时的回调 */
    public get onEntityDestroyed(): IEntityReleased<EntityReleased, IEntityManager<IBaseEntity>> { return this._onEntityDestroyed; }

    private initialize() {
        for (let i: number = 0; i < this._totalComponent; ++i) {
            let k: string = this._componentNum[i];
            if (!this[k]) {
                Object.defineProperty(this, k, {get: () => {
                    return this.getComponentData(i);
                }});
            }
        }
    }

    public setID(id: string) {
        this._ID = id;
    }

    public setName(name: string) {
        this._name = name;
    }

    public setEnabled(enabled: boolean) {
        this._enabled = enabled;
    }

    public destroyEntity() {
        if (!this._enabled) {
            throw new Error(new EntityAlreadyReleasedException(this.toString()).toString());
        }

        let onEntityDestroyed = this.onEntityDestroyed;
        if (onEntityDestroyed.active) onEntityDestroyed.dispatch(this);

        ECS_DEBUG && Debug.log(this.toString(), '销毁实体');
    }

    public clear() {
        this._groupId = '';
        this.onComponentAdded.clear();
        this.onComponentRemoved.clear();
        this.onEntityReleased.clear();
        this.onEntityDestroyed.clear();
    }

    public setGroupId(id: string) {
        this._groupId = id;
    }

    public addComponentData(type: number) {
        if (!this._enabled) {
            throw new Error(new EntityIsNotEnabledException(this.toString() + " Cannot add component!").toString());
        }

        if (this._componentTypes.addComponent(type)) {
            const onComponentAdded = this.onComponentAdded;
            if (onComponentAdded.active) this.onComponentAdded.dispatch(this, type);
        }
        else {
            const index: number = type;
            throw new Error(new EntityAlreadyHasComponentException(
                this.toString() + 
                "Cannot add " + 
                this._componentNum[index] + 
                " component!", index).toString()); 
        }
    }

    public getComponentData(type: number): IComponent {
        const component = this._componentTypes.getComponent(type);
        if (!component) {
            const index: number = type;
            throw new Error(new EntityDoesNotHaveComponentException(
                this.toString() + 
                "Cannot get" + 
                this._componentNum[index] + 
                " component!", 
                index).toString());
        }
        return component;
    }

    public getComponentIndices(): number[] {
        return this._componentTypes.types;
    }

    public removeComponentData(type: number) {
        if (!this._enabled) {
            throw new Error(new EntityIsNotEnabledException(this.toString() + " Cannot remove component!").toString());
        }
        if (this._componentTypes.removeComponent(type)) {
            const onComponentRemoved = this.onComponentRemoved;
            if (onComponentRemoved.active) this.onComponentRemoved.dispatch(this, type);
        }
        else {
            const i: number = type;
            throw new Error(new EntityDoesNotHaveComponentException(
                this.toString() + 
                "Cannot remove" + 
                this._componentNum[i] + 
                "component from " + 
                this.toString() + 
                "!", 
                i).toString());
        }
    }

    public removeAllComponentData() {
        this._componentTypes.removeAllComponent();
    }

    public hasComponentData(type: number): boolean {
        return this._componentTypes.hasComponent(type);
    }

    public toString() {
        return utils.StringUtil.replace('[Entity:{0}] ', this._name);
    }
}