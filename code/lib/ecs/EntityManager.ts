/**
 * 还需要实现 GameNodeConversionSystem 这个系统是用于将游戏节点转换成实体 
 * 
 * IConvertGameNodeToEntity
 * 
 * BeginInitializationEntityCommandBufferSystem 
 * 
 * EntityCommandBufferSystem, 
 * 
 */


import { Entity } from "./Entity";
import { EntityIsNotReleasedException } from "./exceptions/EntityIsNotReleasedException";
import { UUID } from "./UUID";
import { EntityAlreadyDestroyedException } from "./exceptions/EntityAlreadyDestroyedException";
import { ECS_DEBUG } from "./ECSDef";
import { ArchetypeChunk } from "./ArchetypeChunk";
import { Debug } from "../cck/Debugger";
import { Tools } from "../cck";

/**
 * 实体服务类, 管理运行的实体, 实体对象, 运行的组, 组对象
 */
export class EntityManager<T extends IEntity> implements IEntityManager<T> {
    private _entitys: IEntities;           //存放所有正在运行的实体的表
    private _componentNum: {};               //组件枚举
    private _totalComponent: number;         //组件最大个数
    private _reusableEntitys: Tools.ObjectPool<T>;             //实体对象池
    private _archetypeChunk: ArchetypeChunk<T>;
    private _cacheUpdateGroupByComponentAdded: EntityChange;          //缓存实体组件增加的事件
    private _cacheUpdateGroupByComponentRemoved: EntityChange;        //缓存实体组件移除的事件
    private _cacheEntityReleased: EntityReleased;          //缓存实体释放的事件
    private _cacheEntityDestroyed: EntityReleased;         //缓存实体已经销毁的事件
    constructor(componentNum: {}, totalComponent: number) {
        this._entitys = {};
        this._componentNum = componentNum;
        this._totalComponent = totalComponent;
        this._reusableEntitys = new Tools.ObjectPool();
        this._archetypeChunk = new ArchetypeChunk();
        this._cacheUpdateGroupByComponentAdded = this.updateGroupByComponentAdded;
        this._cacheUpdateGroupByComponentRemoved = this.updateGroupByComponentRemoved;
        this._cacheEntityReleased = this.onEntityReleased;
        this._cacheEntityDestroyed = this.onEntityDestroyed;
    } 

    public get onArchetypeChunkChange() { return this._archetypeChunk.onArchetypeChunkChange; } 

    public createEntity(name: string): T {
        //构建实体对象, 注意: 用三木运算, 不要乱删东西
        let entity: IEntity = this._reusableEntitys.size() > 0 ? this._reusableEntitys.get() : 
        new Entity(this, this._componentNum, this._totalComponent);

        entity.setName(name);
        entity.setID(UUID.randomUUID());
        entity.setEnabled(true);
        entity.removeAllComponent();

        this._entitys[entity.ID] = entity;
        entity.onComponentAdded.add(this._cacheUpdateGroupByComponentAdded);
        entity.onComponentRemoved.add(this._cacheUpdateGroupByComponentRemoved);
        entity.onEntityReleased.add(this._cacheEntityReleased);
        entity.onEntityDestroyed.add(this._cacheEntityDestroyed);

        ECS_DEBUG && Debug.log(entity.toString(), '创建新实体');
        return entity as T;
    }

    public createArchetype(types: number[]) {
        return this._archetypeChunk.createArchetype(this, types);
    }

    public destroyEntity(entity: T) {
        if (!entity.enabled) {
            throw new Error(new EntityAlreadyDestroyedException(
                entity.toString() + 
                "Cannot destroy entity at name " +
                 entity.name).toString());
        }
        let group: IEntityArchetype<T> = this._archetypeChunk.archetypes[entity.groupId];
        group.removeEntityFromChunk(entity);
    }

    public destroyEntityAll() {
        for (let k in this._entitys) {
            this.destroyEntity(this._entitys[k] as T);
        }
    }

    public getGroups() {
        return this._archetypeChunk.archetypes;
    }

    public getEntities(): T[] {
        return this._archetypeChunk.getEntities();
    }

    private updateGroupByComponentAdded(entity: T, index: number) {
        if (!this._archetypeChunk.handleEntity(entity, index)) {
            const archtype = this.createArchetype(entity.types);
            archtype.addEntityToChunk(entity);
        }
    }

    private updateGroupByComponentRemoved(entity: T, index: number) {
        if (!this._archetypeChunk.updateEntity(entity, index)) {
            const archtype = this.createArchetype(entity.types);
            archtype.addEntityToChunk(entity);
        }
    }

    private onEntityReleased(entity: T) {
        entity.onEntityReleased.remove(this.onEntityReleased);
        entity.destroy();
    }

    private onEntityDestroyed(entity: T) {
        if (entity.enabled) {
            throw new Error(new EntityIsNotReleasedException(entity.toString() + "Cannot destoryed entity.").toString());
        }

        entity.clear();
        delete this._entitys[entity.ID];
        this._reusableEntitys.put(entity);
    }
}