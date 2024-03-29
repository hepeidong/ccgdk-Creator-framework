import { EventTouch, instantiate, Node, NodePool, Prefab, UITransform, v3, Vec2, Vec3 } from "cc";
import { animat } from "../animat_audio";
import { MAX_PRIORITY } from "../Define";
import { setPriority } from "../util";
import { WindowManager } from "./WindowManager";

const MAX_COUNT = 20;

const _vec3Temp = v3();
const _worldVec3Temp = v3();

export class TouchEffect {
    private _index: number;
    private _target: Node;
    private _pool: NodePool;
    constructor() {
        this._index = 0;
        this._pool = new NodePool();
    }

    public init() {
        let touchParent: Node = new Node('touchParent');
        const ui = touchParent.getComponent(UITransform);
        ui.width = 2000;
        ui.height = 2000;
        setPriority(touchParent, MAX_PRIORITY);
        WindowManager.instance.addToTop(touchParent);
        touchParent.on(Node.EventType.TOUCH_START, (evt: EventTouch) => {
            this.play(evt.getUILocation());
        }, this);
        touchParent['_touchListener'].setSwallowTouches(false);
    }

    /**
     * 初始化触摸点击特效，
     * @param prefab 挂载了点击特效帧动画的预制体
     */
    public initEffectAsset(prefab: Prefab) {
        if (prefab) {
            this._target = instantiate(prefab);
            setPriority(this._target, MAX_PRIORITY);
        }
    }

    public play(worldPos: Vec2) {
        if (this._pool.size() <= MAX_COUNT) {
            let node: Node;
            if (this._pool.size() > 0) {
                node = this._pool.get();
            }
            else {
                node = instantiate(this._target);
                node.name = node.name + this._index.toString();
                this._index++;
            }
            WindowManager.instance.addToTop(node);
            const parentUI = node.parent.getComponent(UITransform);
            let pos: Vec3 = parentUI.convertToNodeSpaceAR(_worldVec3Temp.set(worldPos.x, worldPos.y));
            node.position = _vec3Temp.set(pos.x, pos.y);
            animat(node).defaultClip().onStop(() => {
                this._pool.put(node);
            }).play();
        }
    }
}