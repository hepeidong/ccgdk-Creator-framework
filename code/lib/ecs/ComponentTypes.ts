import { Tools } from "../cck";
import { removeElement } from "./ecs_utils";

interface IComponentType extends IComponent {
    componentId: number;
}

/**存放组件对象 */
class DataPool {
    private static _ins: DataPool = null;

    private _pool: Tools.ObjectPool<IComponentType>;
    constructor() {
        this._pool = new Tools.ObjectPool();
    }

    public static get instance(): DataPool { return this._ins = this._ins ? this._ins : new DataPool(); }

    public size() { return this._pool.size(); }

    public put(components: IComponentType[], type: number) {
        for (let i: number, len = components.length; i < len; ++i) {
            if (components[i].componentId === type) {
                this._pool.put(components[i]);
                removeElement(components, i);
                return true;
            }
        }
        return false;
    }

    public get() { 
        if (this._pool.size() > 0) {
            return this._pool.get();
        }
        else {
            /**
             * `Object.create(null)` 用于创建无 prototype （也就无继承）的空对象。
             * 这样我们在该对象上查找属性时，就不用进行 `hasOwnProperty` 判断，此时对性能提升有帮助。
             * 如果forceDictMode=false，将会删除运算符，并且会应用在新创建的对象中。
             * 这会导致V8引擎把对象设成字典模式，并且禁止隐藏类的创建，这对于频繁发生改变的对象来说是不利的。
             */
            return Object.create(null) as IComponentType;
        }
    }
}

export class ComponentTypes {
    private _types: number[];              //缓存的所引用的组件ID
    private _components: IComponentType[]; //缓存的所引用的组件
    constructor() {
        this._types      = [];
        this._components = [];
    }

    public get types(): number[] { return this._types; }

    public addComponent(type: number) {
        if (!this.hasComponent(type)) {
            this._types.push(type);
            const component: IComponentType = DataPool.instance.get();
            component.componentId = type;
            this._components.push(component);
            return true;
        }
        return false;
    }

    public getComponent(type: number) {
        for (const component of this._components) {
            if (component.componentId === type) {
                return component;
            }
        }
        return null;
    }

    public removeComponent(type: number) {
        if (this.hasComponent(type)) {
            removeElement(this._types, this._types.indexOf(type));
            return DataPool.instance.put(this._components, type);
        }
        return false;
    }

    public removeAllComponent() {
        for (const type of this._types) {
            this.removeComponent(type);
        }
    }

    public hasComponent(type: number) {
        for (let i: number = 0, len = this._types.length; i < len; ++i) {
            if (this._types[i] === type) {
                return true;
            }
        }

        return false;
    }
}