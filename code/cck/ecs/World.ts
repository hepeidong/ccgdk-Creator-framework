import { InitializationSystemGroup, PresentationSystemGroup, SimulationSystemGroup } from "./ComponentSystemGroup";
import { EntityManager } from "./EntityManager";
import { asUpdateInGroup, removeElement } from "./ecs-utils";
import { UUID } from "../utils";
import { getSystemClassNames } from "../decorator/Decorator";
import { Constructor, IEntity, IEntityManager, ISystem } from "../lib.cck";
import { js } from "cc";
import { BeginInitializationEntityCommandBufferSystem } from "./BeginInitializationEntityCommandBufferSystem";
import { BeginSimulationEntityCommandBufferSystem } from "./BeginSimulationEntityCommandBufferSystem";
import { BeginPresentationEntityCommandBufferSystem } from "./BeginPresentationEntityCommandBufferSystem";
import { EndInitializationEntityCommandBufferSystem } from "./EndInitializationEntityCommandBufferSystem";
import { EndSimulationEntityCommandBufferSystem } from "./EndSimulationEntityCommandBufferSystem";
import { EndPresentationEntityCommandBufferSystem } from "./EndPresentationEntityCommandBufferSystem";

/**
 * ECS中的默认世界
 */
export class World {
    private static _ins: World = null;
    protected _classNames: string[];
    private _entityManager: IEntityManager<IEntity>;
    private _initializationSystem: InitializationSystemGroup;
    private _simulationSystem: SimulationSystemGroup;
    private _presentationSystem: PresentationSystemGroup;
    private _systems: ISystem<IEntity>[];
    constructor() {
        this._classNames = [];
        this._systems    = [];
    }

    public static get instance() {
        if (!this._ins) {
            this._ins = new World();
        }
        return this._ins;
    }

    public get entityManager(): Readonly<IEntityManager<IEntity>> { return this._entityManager; }
    public get systems(): Readonly<ISystem<IEntity>[]> { return this._systems; }

    public getSystem<T extends ISystem<IEntity>>(type: {new (): T}): T;
    public getSystem(className: string): any;
    public getSystem() {
        if (typeof arguments[0] === 'string') {
            const arg = arguments[0];
            return this.receiveSys((sys) => {
                return sys.name === arg;
            });
        }
        else {
            const arg = arguments[0];
            return this.receiveSys((sys) => {
                return sys instanceof arg;
            });
        }
    }

    /**
     * 从世界中销毁该系统，调用此方法，系统会被永久销毁，需要谨慎
     * @param typeOrClassName 要销毁的系统类或者系统的类名
     * 
     * @example
     * World.instance.destroySystem(MyTestSystem);
     * World.instance.destroySystem('MyTestSystem');
     */
    public destroySystem<T extends ISystem<IEntity>>(type: {new (): T}): void;
    public destroySystem(className: string): void;
    public destroySystem() {
        const arg = arguments[0];
        if (this._initializationSystem.destroySystem(arg)) {
            this.removeFromSystems(arg);
        }
        else if (this._simulationSystem.destroySystem(arg)) {
            this.removeFromSystems(arg);
        }
        else if (this._presentationSystem.destroySystem(arg)) {
            this.removeFromSystems(arg);
        }
    }

    private receiveSys(juage: (sys: ISystem<IEntity>) => boolean) {
        for (const system of this._systems) {
            if (juage(system)) {
                return system;
            }
        }
        return undefined;
    }

    private removeFromSystems(arg: any) {
        this.removeSys((sys) => {
            if (typeof arg === 'string') {
                return sys.name === arg;
            }
            else {
                return sys instanceof arg;
            }
        });
    }

    private removeSys(juage: (sys: ISystem<IEntity>) => boolean) {
        for (let i = 0, len = this._systems.length; i < len; ++i) {
            if (juage(this._systems[i])) {
                const result = this._systems.splice(i, 1);
                result[0].destroy();
            }
        }
    }

    public start() {
        this._initializationSystem.start();
        this._simulationSystem.start();
        this._presentationSystem.start();
    }

    public update(dt?: number) {
        this._initializationSystem.update(dt);
        this._simulationSystem.update(dt);
        this._presentationSystem.update(dt);
    }

    /**
     * 对当前世界中的系统进行实例化，并按照开发者设定的更新顺序以及默认的更新顺序，
     * 把系统加入到相应的系统组里，并最终确定各系统在世界的更新顺序。如果没有手动设
     * 定系统更新顺序，则无法保障系统的更新顺序是按照您所希望的顺序进行更新。
     */
    public initializetion(componentNum: {}, totalComponent: number) {
        this._entityManager = new EntityManager(componentNum, totalComponent);
        if (this._classNames.length === 0) {
            this._classNames = getSystemClassNames();
        }
    
        const subSystems: ISystem<IEntity>[] = [];
        for (const cls of this._classNames) {
            const classRef = js.getClassByName(cls) as Constructor;
            const system = new classRef() as ISystem<IEntity>;
            system.setID(UUID.randomUUID());
            system.setPool(this._entityManager);
            system.create();
            //首先给基础的三个根系统组增加Begin的EntityCommandBufferSystem系统
            if (system instanceof InitializationSystemGroup) {
                this._initializationSystem = system;
                this._initializationSystem.addSystemToUpdateList(new BeginInitializationEntityCommandBufferSystem());
            }
            else if (system instanceof SimulationSystemGroup) {
                this._simulationSystem = system;
                this._simulationSystem.addSystemToUpdateList(new BeginSimulationEntityCommandBufferSystem());
            }
            else if (system instanceof PresentationSystemGroup) {
                this._presentationSystem = system;
                this._presentationSystem.addSystemToUpdateList(new BeginPresentationEntityCommandBufferSystem());
            }
            else {
                //把其他非根系统组的各子系统加入到根系统组里
                //加入的原则是检查其是否设置了updateInGroup特性
                //若没有设置此特性，则默认加入SimulationSystemGroup
                this.addSubSystemToRootGroup(system, subSystems);
            }
        }
        //增加子系统，遍历三个根系统组，检查其中的子系统是否为系统组（姑且称为子系统组），并且是subSystems里面子系统的系统组
        //如果是，则把子系统加入到对应的子系统组
        this.addSystemToGroup(subSystems);
        this._initializationSystem.addSystemToUpdateList(new EndInitializationEntityCommandBufferSystem());
        this._simulationSystem.addSystemToUpdateList(new EndSimulationEntityCommandBufferSystem());
        this._presentationSystem.addSystemToUpdateList(new EndPresentationEntityCommandBufferSystem());
        this._systems.concat(
            this._initializationSystem.subSystems, 
            this._simulationSystem.subSystems, 
            this._presentationSystem.subSystems);
    }

    private addSubSystemToRootGroup(system: ISystem<IEntity>, subSystems: ISystem<IEntity>[]) {
        const type = asUpdateInGroup(system);
        if (typeof type === 'undefined') {
            this._simulationSystem.addSystemToUpdateList(system);
        }
        else if (typeof type === 'function') {
            const isInitialization: boolean = this._initializationSystem instanceof type;
            const isSimulation: boolean = this._simulationSystem instanceof type;
            const isPresentation: boolean = this._presentationSystem instanceof type;
            if (isInitialization) {
                this._initializationSystem.addSystemToUpdateList(system);
            }
            else if (isSimulation) {
                this._simulationSystem.addSystemToUpdateList(system);
            }
            else if (isPresentation) {
                this._presentationSystem.addSystemToUpdateList(system);
            }
            else {
                //属于其他子系统组的子系统，意思是当前子系统所在的系统组是三个根系统组之一内部又嵌套的系统组
                //例如InitializationSystemGroup系统组下嵌套了一个子系统组ASystemGroup，当前子系统属于这个ASystemGroup系统组
                subSystems.push(system);
            }
        }
        else {
            //传入的系统组类型是无效的
            throw new Error(system.toString() + "updateInGroup特性不能设置为'" + typeof type + "'");
        }
    }

    private addSystemToGroup(subSystems: ISystem<IEntity>[]) {
        for (let i: number = 0, len = subSystems.length; i < len; ++i) {
            const system = subSystems[i];
            let flag: boolean = false;
            if (this._initializationSystem.addSubSystemToGroup(system)) {
                flag = true;
            }
            else if (this._simulationSystem.addSubSystemToGroup(system)) {
                flag = true;
            }
            else if (this._presentationSystem.addSubSystemToGroup(system)) {
                flag = true;
            }

            if (!flag) {
                //直接回溯到开头，重新遍历
                if (i === len - 1 && len > 0) {
                    i = -1;
                }
            }
            else {
                let result = removeElement(subSystems, i, len);
                i = result.i;
                len = result.len;
            }
        }
    }
}