import { Node, Prefab, instantiate, js } from "cc"
import { IConversionSystem, IEntity, IPrimaryEntity } from "../lib.cck";
import { World } from "./World";

type PrefabType = {
    prefab: Node|Prefab;
    parent: Node;
}

export class ConversionSystem implements IConversionSystem {
    private _map: Map<string, PrefabType>;
    constructor() {
        this._map = new Map();
    }

    public add(prefab: Node|Prefab): {to: (parent: Node) => void} {
        const key = prefab.name;
        const item = {
            prefab,
            parent: null
        };
        this._map.set(key, item);
        return {to: parent => {
            this.to(key, parent);
        }};
    }

    public getPrimaryEntity(prefab: Node|Prefab) {
        const key = prefab.name;
        if (this._map.has(key)) {
            const item = this._map.get(key);
            //在当前世界创建一个初级实体
            //再创建一个包含prefab和parent的数据组件，把这个组件加入到该实体上
            const entity = World.instance.entityManager.createEntity(key) as IPrimaryEntity;
            entity.template = Object.create(null);
            entity.template.prefab = item.prefab;
            entity.template.parent = item.parent;
            return entity;
        }
        else {
            throw new Error("'" + key + "'预制体没有预先设置，无法创建初级实体！");
        }
    }

    public getEntity(entity: IPrimaryEntity) {
        const name = entity.template.prefab.name;
        const newEntity = World.instance.entityManager.createEntity(name) as IEntity;
        const newNode = instantiate(entity.template.prefab);
        js.mixin(newEntity, newNode);
        entity.template.parent.addChild(newEntity);
        return newEntity;
    }

    private to(name: string, parent: Node) {
        if (this._map.has(name)) {
            const item = this._map.get(name);
            item.parent = parent;
            this._map.set(name, item);
        }
    }
}