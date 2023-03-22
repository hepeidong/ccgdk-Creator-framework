import { Debug } from "../Debugger";
import { ECS_DEBUG } from "./ECSDef";
import { entityIndexOf, removeElement } from "./ecs-utils";
import { EntityArchetype } from "./EntityArchetype";
import { UUID } from "../utils";
import { ArchetypeChunkChange, IArchetypeChunk, IArchetypeChunkChange, IEntitiesGroup, IBaseEntity, IEntityArchetype, IEntityManager } from "../lib.cck";
import { tools } from "../tools";
import { EventSystem } from "../event/EventSystem";

export class ArchetypeChunk<T extends IBaseEntity> implements IArchetypeChunk<T> {
    private _cacheEntities: T[];               //所有实体的缓存
    private _entitiesGroup: IEntitiesGroup<T>; //存放所有正在引用的组
    private _reusableArchetype: tools.ObjectPool<IEntityArchetype<T>>; //组对象池
    private _onArchetypeChunkChange: IArchetypeChunkChange<ArchetypeChunkChange, IArchetypeChunk<T>>;
    constructor() {
        this._cacheEntities      = null;
        this._entitiesGroup      = {};
        this._reusableArchetype  = new tools.ObjectPool();
        this._onArchetypeChunkChange = new EventSystem.Signal(this);
    }

    public get archetypes(): IEntitiesGroup<T> { return this._entitiesGroup; }
    public get onArchetypeChunkChange() { return this._onArchetypeChunkChange; }

    public createArchetype(manager: IEntityManager<T>, types: number[]) {
        for (const key in this._entitiesGroup) {
            const archetype = this._entitiesGroup[key];
            if (archetype.typesCount === types.length) {
                let flag: boolean = true;
                for (const type of types) {
                    const index = archetype.types.indexOf(type);
                    if (index === -1) {
                        flag = false;
                        break;
                    }
                }
                if (flag) {
                    return archetype;
                }
            }
        }
        const archetype = this._reusableArchetype.size() > 0 ? this._reusableArchetype.get() : new EntityArchetype(manager, this);
        archetype.setGroupId(UUID.randomUUID());
        archetype.setComponentTypes(types);
        archetype.onEntityAdded.add(this.onEntitiesAdd);
        archetype.onEntityRemoved.add(this.onEntitiesRemove);
        archetype.onGroupReleased.add(this.onGroupReleased);
        this._entitiesGroup[archetype.version] = archetype;
        if (this.onArchetypeChunkChange.active) {
            this.onArchetypeChunkChange.dispatch(archetype);
        }
        return archetype;
    }

    public getEntities() {
        if (this._cacheEntities === null) {
            this._cacheEntities = [];
            for (const key in this._entitiesGroup) {
                const archetype = this._entitiesGroup[key];
                this._cacheEntities.concat(archetype.getEntities());
            }
        }
        return this._cacheEntities;
    }

    public handleEntity(entity: T, type: number) {
        for (const key in this._entitiesGroup) {
            const archetype = this._entitiesGroup[key];
            if (archetype.handleEntity(entity, type)) {
                return true;
            }
        }
        return false;
    }

    public updateEntity(entity: T, type: number) {
        for (const key in this._entitiesGroup) {
            const archetype = this._entitiesGroup[key];
            if (archetype.updateEntity(entity, type)) {
                for (const key2 in this._entitiesGroup) {
                    const archetype2 = this._entitiesGroup[key2];
                    if (archetype2.checkComponentType(entity)) {
                        archetype2.addEntityToChunk(entity);
                        return true;
                    }
                }
            }
        }
        return false;
    }

    private onEntitiesAdd(entity: T) {
        this._cacheEntities.push(entity);
    }

    private onEntitiesRemove(entity: T) {
        const index = entityIndexOf(this._cacheEntities, entity);
        if (index > -1) {
            removeElement(this._cacheEntities, index);
        }
    }

    private onGroupReleased(group: IEntityArchetype<T>) {
        ECS_DEBUG && Debug.log(group.toString(), '移除组');
        delete this._entitiesGroup[group.version];
        this._reusableArchetype.put(group);
    }
}