import { IEntity, IEntityArchetype, IEntityManager, IMatcher } from "../lib.cck";
import { removeElement } from "./ecs-utils";
import { MatchingMethodHasBeenSelectedException } from "./exceptions/MatchingMethodHasBeenSelectedException";
import { World } from "./World";

/**-1（不符合任何匹配类型），0（符合all匹配类型），1（符合any匹配类型），2（符合none匹配类型） */
type MatcherType = -1|0|1|2;

export class Matcher<T extends IEntity> implements IMatcher<T> {
    private _currType: MatcherType;
    private _cacheEntities: T[];
    private _manager: IEntityManager<T>;
    constructor(manager: IEntityManager<T>) {
        this._currType = -1;
        this._manager  = manager;
        this._cacheEntities   = null;
        manager.onArchetypeChunkChange.add(this.onArchetypeChunkChange.bind(this));
    }

    public static forEach<T extends IEntity>(callback: (entity: T) => void) {
        const entities = World.instance.entityManager.getEntities();
        entities.forEach(callback);
    }

    public withAll(...args: number[]) {
        if (this._currType > -1) {
            throw new Error(new MatchingMethodHasBeenSelectedException('withAll').toString());
        }
        if (!this._cacheEntities) {
            this._currType = 0;
            this.mergeEntity(args, (group, type) => {
                if (group.types.indexOf(type) === -1) {
                    return 0;
                }
                return -1
            });
        }
        return this;
    }

    public withAny(...args: number[]) {
        if (this._currType > -1) {
            throw new Error(new MatchingMethodHasBeenSelectedException('withAny').toString());
        }
        if (!this._cacheEntities) {
            this._currType = 1;
            this.mergeEntity(args, (group, type) => {
                if (group.types.indexOf(type) >= 0) {
                    return 1;
                }
                return -1;
            });
        }
        return this;
    }

    public withNone(...args: number[]) {
        if (this._currType > -1) {
            throw new Error(new MatchingMethodHasBeenSelectedException('withNone').toString());
        }
        if (!this._cacheEntities) {
            this._currType = 2;
            this.mergeEntity(args, (group, type, index) => {
                if (group.types.indexOf(type) === -1 && args.length === index + 1) {
                    return 2;
                }
                return -1;
            });
        }
        return this;
    }

    public forEach(callback: (entity: T) => void) {
        if (this._cacheEntities) {
            this._cacheEntities.forEach(callback);
        }
    }

    /**
     * 根据选择的匹配类型和匹配条件，组合所有符合条件的实体
     * @param types 组件类型组合
     * @param conditionfn 合并的条件判定回调，分为三种，all, any, none，返回值对应为-1（不符合任何匹配类型），0（符合all匹配类型），1（符合any匹配类型），2（符合none匹配类型）
     */
    private mergeEntity(types: number[], conditionfn: (group: IEntityArchetype<T>, type: number, index?: number) => number) {
        this._cacheEntities = [];
        const groups = this._manager.getGroups();
        for (const key in groups) {
            const group = groups[key];
            this.mergeEntityFromGroup(group, types, conditionfn);
        }
    }

    /**
     * 从符合条件的组中组合实体
     * @param group 
     * @param types 
     * @param conditionfn 
     */
    private mergeEntityFromGroup(group: IEntityArchetype<T>, types: number[], conditionfn: (group: IEntityArchetype<T>, type: number, index?: number) => number) {
        let flag: number = -1;
        for (let i: number = 0, len = types.length; i < len; ++i) {
            flag = conditionfn(group, types[i], i);
            if (flag > -1) {
                break;
            }
        }
        if (flag > -1) {
            this._cacheEntities.concat(group.getEntities());
            group.onEntityAdded.add(this.onEntityAdded.bind(this));
            group.onEntityRemoved.add(this.onEntityRemove.bind(this));
        }
    }

    private onEntityAdded(entity: T) {
        const index: number = this.indexOf(entity);
        if (index === -1) {
            this._cacheEntities.push(entity);
        }
    }

    private onEntityRemove(entity: T) {
        const index: number = this.indexOf(entity);
        if (index > -1) {
            removeElement(this._cacheEntities, index);
        }
    }

    private onArchetypeChunkChange(archetype: IEntityArchetype<T>) {

    }

    private indexOf(entity: T) {
        let index: number = -1;
        for (let i: number = 0, len = this._cacheEntities.length; i < len; i++) {
            if (this._cacheEntities[i].ID === entity.ID) {
                index = i;
                return index;
            }
        }
        return index;
    }
}