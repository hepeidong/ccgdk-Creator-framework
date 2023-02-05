import { Utils } from "../cck";
import { WindowManager } from "./WindowManager";

const MAX_COUNT = 20;

export class TouchEffect {
    private _index: number;
    private _target: cc.Node;
    private _pool: cc.NodePool;
    constructor() {
        this._index = 0;
        this._pool = new cc.NodePool();
    }

    public init() {
        let touchParent: cc.Node = new cc.Node('touchParent');
        touchParent.width = 2000;
        touchParent.height = 2000;
        touchParent.zIndex = cc.macro.MAX_ZINDEX;
        WindowManager.instance.addToTop(touchParent);
        touchParent.on(cc.Node.EventType.TOUCH_START, (evt: cc.Event.EventTouch) => {
            this.play(evt.getLocation());
        }, this);
        touchParent['_touchListener'].setSwallowTouches(false);
    }

    /**
     * 初始化触摸点击特效，
     * @param prefab 挂载了点击特效帧动画的预制体
     */
    public initEffectAsset(prefab: cc.Prefab) {
        if (prefab) {
            this._target = cc.instantiate(prefab);
            this._target.zIndex = cc.macro.MAX_ZINDEX;
        }
    }

    public play(worldPos: cc.Vec2) {
        if (this._pool.size() <= MAX_COUNT) {
            let node: cc.Node;
            if (this._pool.size() > 0) {
                node = this._pool.get();
            }
            else {
                node = cc.instantiate(this._target);
                node.name = node.name + this._index.toString();
                this._index++;
            }
            WindowManager.instance.addToTop(node);
            let pos: cc.Vec2 = node.parent.convertToNodeSpaceAR(worldPos);
            node.position = cc.v3(pos.x, pos.y);
            Utils.animat(node).defaultClip().onStop(() => {
                this._pool.put(node);
            }).play();
        }
    }
}