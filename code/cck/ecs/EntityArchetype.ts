import { Debug } from "../Debugger";
import { utils } from "../utils";
import { ECS_DEBUG } from "./ECSDef";
import { entityIndexOf, removeElement } from "./ecs-utils";
import { ArchetypeAlreadyReleasedException } from "./exceptions/ArchetypeAlreadyReleasedException";
import { EntityChangeInGroup, GroupChange, IArchetypeChunk, IEntity, IEntityArchetype, IEntityChangeInGroup, IEntityManager, IGroupChange } from "../lib.cck";
import { EventSystem } from "../event/EventSystem";

export class EntityArchetype<T extends IEntity> implements IEntityArchetype<T> {
    private _valid: boolean;
    private _name: string;                 //组名
    private _version: string;              //组id, 该组的唯一标示, 与系统id一致
    private _types: number[];         //该组成员实体身上需要挂载的组件, 用于区分实体是否属于该组
    private _entityChunk: T[];
    private _onEntityAdded: IEntityChangeInGroup<EntityChangeInGroup, IEntityManager<T>>;       //实体增加事件, 当前系统中实体增加后返回的事件回调
    private _onEntityRemoved: IEntityChangeInGroup<EntityChangeInGroup, IEntityManager<T>>;     //实体减少事件, 当前系统中实体减少后返回的事件回调
    private _onGroupReleased: IGroupChange<GroupChange, IEntityManager<T>>;     //组释放事件, 用于移除ECSEntityService管理中的组
    constructor(manager: IEntityManager<T>, archetypeChunk: IArchetypeChunk<T>) {
        this._valid      = false;
        this._version    = '';
        this._types      = [];
        this._entityChunk     = [];
        this._onEntityAdded   = new EventSystem.Signal(archetypeChunk);
        this._onEntityRemoved = new EventSystem.Signal(archetypeChunk);
        this._onGroupReleased = new EventSystem.Signal(manager);
    }

    public get valid(): boolean { return this._valid; }
    public get chunkCapacity(): number { return this._entityChunk.length; }
    public get typesCount(): number { return this._types.length; }
    public get version(): string { return this._version; }
    public get types(): number[] { return this._types; }
    public get onEntityAdded(): IEntityChangeInGroup<EntityChangeInGroup, any> { return this._onEntityAdded; }
    public get onEntityRemoved(): IEntityChangeInGroup<EntityChangeInGroup, any> { return this._onEntityRemoved; }
    public get onGroupReleased(): IGroupChange<GroupChange, IEntityManager<T>> { return this._onGroupReleased; }

    public setName(name: string) {
        this._name = name;
    }

    public setGroupId(id: string) {
        this._valid   = true;
        this._version = id;
    }

    public setComponentTypes(comments: number[]) {
        this._types = comments;
    }

    public setEntityAddedSignal(signal: IEntityChangeInGroup<EntityChangeInGroup, any>): void {
        this._onEntityAdded = signal;
    }
    public setEntityRemoveSignal(signal: IEntityChangeInGroup<EntityChangeInGroup, any>): void {
        this._onEntityRemoved = signal;
    }

    public getEntities(): T[] {
        return this._entityChunk;
    }

    /**
     * 增加组成员
     * @param member 
     */
    public addEntityToChunk(member: T): IEntityArchetype<T> {
        if (!this._valid) {
            throw new Error(new ArchetypeAlreadyReleasedException(this.toString()).toString());
        }
        this._entityChunk.push(member);
        member.setGroupId(this.version);
        let onEntityAdded = this.onEntityAdded;
        if (onEntityAdded.active) onEntityAdded.dispatch(member);
        return this;
    }

    /**
     * 移除组
     * @param member 
     */
    public removeEntityFromChunk(member: T): boolean {
        if (!this._valid) {
            throw new Error(new ArchetypeAlreadyReleasedException(this.toString()).toString());
        }
        const index: number = entityIndexOf(this._entityChunk, member);
        if (index > -1) {
            removeElement(this._entityChunk, index);
            //发射移除实体的信号
            let onEntityRemoved = this.onEntityRemoved;
            if (onEntityRemoved.active) onEntityRemoved.dispatch(member);
            ECS_DEBUG && Debug.log(member.toString(), 'from', this.toString(), '移除实体');

            //如果该组没有可执行的实体了, 则释放该组别
            if (this._entityChunk.length === 0) {
                ECS_DEBUG && Debug.log(this.toString(), '释放组');
                this._valid = false;
                let onGroupReleased = this.onGroupReleased;
                if (onGroupReleased.active) onGroupReleased.dispatch(this);
                this.clear();
            }
            return true;
        }
        return false;
    }
    /**
     * 处理新增加的实体
     * @param entity 
     * @param componentId 
     */
    public handleEntity(entity: T, componentId: number): boolean {
        if (this._types.indexOf(componentId) > -1 && this.checkComponentType(entity)) {
            this.addEntityToChunk(entity);
        }
        return false;
    }

    public checkComponentType(entity: T): boolean {
        if (entity.types.length === this.typesCount) {
            let flag: boolean = true;
            for (let c of this._types) {
                if (!entity.hasComponent(c)) {
                    flag = false;
                    break;
                }
            }
            return flag;
        }
        return false;
    }

    /**
     * 更新组的实体成员
     * @param entity 
     * @param componentId 
     */
    public updateEntity(entity: T, componentId: number) {
        if (this._types.indexOf(componentId) > -1 && entity.types.length === this.typesCount) {
            //移除实体
            return this.removeEntityFromChunk(entity);
        }
    }

    public toString() {
        return utils.StringUtil.replace("[EntityArchetype:{0}] ", this._name);
    }

    private clear() {
        this.onEntityAdded.clear();
        this.onEntityRemoved.clear();
        this.onGroupReleased.clear();
        this._types = [];
    }
}