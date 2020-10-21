import GuideManager from "./GuideManager";

const {
    ccclass, 
    property,
    executeInEditMode, 
    menu, 
    disallowMultiple} = cc._decorator;

@ccclass
@executeInEditMode
@disallowMultiple
@menu('游戏通用组件/引导/引导类型/GuideFinger(手指引导)')
export default class GuideFinger extends cc.Component {

    @property({
        type: cc.Node,
        tooltip: '手指引导遮罩节点',
    })
    guide: cc.Node = null;

    @property({
        type: cc.Node,
        tooltip: '引导的手指节点，可在该节点绑定相应的Animation动画',
    })
    finger: cc.Node = null;

    @property(cc.Node)
    private _mask: cc.Node = null;

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        if (CC_EDITOR) {
            if (!this.guide) {
                let mask: cc.Node = new cc.Node('mask');
                let guide: cc.Node = new cc.Node('guide');
                this.guide = guide;
                this._mask = mask;
                this.node.addChild(this.guide);
                this.guide.addChild(this._mask);
                mask.addComponent(cc.Sprite);
                guide.addComponent(cc.Mask).inverted = true;
                kit.Log('构建了 guide 节点属性', guide.name);
            }
            if (!this.finger) {
                let finger: cc.Node = new cc.Node('finger');
                this.finger = finger;
                this.node.addChild(this.finger);
                finger.addComponent(cc.Sprite);
                finger.addComponent(cc.Animation);
                kit.Log('构建了 finger 节点属性', finger.name);
            }
        }
    }

    start () {

    }

    /**执行引导 */
    public executeGuide() {
        this.node.active = true;
        let pos: cc.Vec2 = GuideManager.Instance.getTargetPosition();
        this.finger.position = pos;
        GuideManager.Instance.setGuidePosition(this.guide, pos);
        this._mask.on(cc.Node.EventType.TOUCH_START, (e: cc.Event.EventTouch) => {
            let rect: cc.Rect = GuideManager.Instance.guideTarget.target.getBoundingBoxToWorld();
            if (rect.contains(e.getLocation())) {
                this._mask['_touchListener'].setSwallowTouches(false);
            }
            else {
                this._mask['_touchListener'].setSwallowTouches(true);
            }
        }, this);
    }

    // update (dt) {}
}
