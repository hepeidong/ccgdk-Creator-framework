import AdapterCtrl from "../adapter/AdapterCtrl";

enum Style {
    NONE,
    SMALL_TO_LARGE,
    LEFT_TO_RIGHT,
    RIGHT_TO_LEFT,
    ELASTIC_SCALE,
    FADE_IN_AND_OUT,
    TO_MIDDLE
}
let StyleType = cc.Enum(Style);
const { ccclass, property, executeInEditMode, menu } = cc._decorator;

enum ChildStyle {
    NONE,
    LEFT_RIGHT,
    TOP_DOWN,
    ALL_ROUND
}
let ChildStyleType = cc.Enum(ChildStyle);

@ccclass('WinContent')
class WinContent {
    private _self: any;
    @property({
        type: ChildStyleType,
        tooltip: `选择向中间移动的方式
        NONE（没有）；
        LEFT_RIGHT（左右两边向中间移动）；
        TOP_DOWN（上下两边向中间移动）；
        ALL_ROUND（四周向中间移动）
        `
    })
    style: ChildStyle = ChildStyleType.NONE;

    @property({
        type: cc.Node,
        tooltip: '',
        visible() {
            if (this.style === ChildStyle.TOP_DOWN || this.style === ChildStyle.ALL_ROUND) {
                if (!this.topNode && this._self) {
                    let node: cc.Node = new cc.Node();
                    this._self.node.addChild(node);
                    this.topNode = node;
                }
                return true;
            }
            else if (this.topNode && (this.style === ChildStyle.LEFT_RIGHT || this.style === ChildStyle.NONE)) {
                if (this.topNode.name === 'New Node' && this.topNode.childrenCount === 0) {
                    this.rightNode.removeFromParent();
                }
                this.topNode = null;
            }
            return false;
        }
    })
    topNode: cc.Node = null;

    @property({
        type: cc.Node,
        tooltip: '',
        visible() {
            if (this.style === ChildStyle.TOP_DOWN || this.style === ChildStyle.ALL_ROUND) {
                if (!this.downNode && this._self) {
                    let node: cc.Node = new cc.Node();
                    this._self.node.addChild(node);
                    this.downNode = node;
                }
                return true;
            }
            else if (this.downNode && (this.style === ChildStyle.LEFT_RIGHT || this.style === ChildStyle.NONE)) {
                if (this.downNode.name === 'New Node' && this.downNode.childrenCount === 0) {
                    this.rightNode.removeFromParent();
                }
                this.downNode = null;
            }
            return false;
        }
    })
    downNode: cc.Node = null;

    @property({
        type: cc.Node,
        tooltip: '',
        visible() {
            if (this.style === ChildStyle.LEFT_RIGHT || this.style === ChildStyle.ALL_ROUND) {
                if (!this.leftNode && this._self) {
                    let node: cc.Node = new cc.Node();
                    this._self.node.addChild(node);
                    this.leftNode = node;
                }
                return true;
            }
            else if (this.leftNode && (this.style === ChildStyle.TOP_DOWN || this.style === ChildStyle.NONE)) {
                if (this.leftNode.name === 'New Node' && this.leftNode.childrenCount === 0) {
                    this.leftNode.removeFromParent();
                }
                this.leftNode = null;
                kit.log('删除');
            }
            return false;
        }
    })
    leftNode: cc.Node = null;

    @property({
        type: cc.Node,
        tooltip: '',
        visible() {
            if (this.style === ChildStyle.LEFT_RIGHT || this.style === ChildStyle.ALL_ROUND) {
                if (!this.rightNode && this._self) {
                    let node: cc.Node = new cc.Node();
                    this._self.node.addChild(node);
                    this.rightNode = node;
                }
                return true;
            }
            else if (this.rightNode && (this.style === ChildStyle.TOP_DOWN || this.style === ChildStyle.NONE)) {
                if (this.rightNode.name === 'New Node' && this.rightNode.childrenCount === 0) {
                    this.rightNode.removeFromParent();
                }
                this.rightNode = null;
            }
            return false;
        }
    })
    rightNode: cc.Node = null;

    constructor(...args: any) {
        this._self = args[0];
    }
}

@ccclass('WindowNode')
class WindowNode {
    @property({
        type: cc.Node,
        tooltip: '预制体Controller中绑定的节点'
    })
    node: cc.Node = null;

    @property({
        tooltip: '预制体Controller中定义的属性名'
    })
    pryName: string = '';
}

@ccclass
@executeInEditMode
@menu('游戏通用组件/UI/WindowHelper(弹窗风格特效)')
export default class WindowHelper extends cc.Component {

    @property({
        type: StyleType,
        tooltip: `弹窗风格：NONE（没有弹出特效）；
        SMALL_TO_LARGE（从小到大）；
        LEFT_TO_RIGHT（从左至右）；
        RIGHT_TO_LEFT（从右至左）；
        ELASTIC_SCALE（弹性缩放）；
        FADE_IN_AND_OUT（渐显渐隐）；
        TO_MIDDLE（从四个方向向中间移动）`
    })
    style: Style = StyleType.NONE;

    @property({
        type: cc.Node,
        visible() {
            if (this.style === StyleType.LEFT_TO_RIGHT ||
                this.style === StyleType.RIGHT_TO_LEFT ||
                this.style === StyleType.SMALL_TO_LARGE ||
                this.style === StyleType.ELASTIC_SCALE
            ) {
                if (!this.popupNode) {
                    let newNode: cc.Node = new cc.Node();
                    this.node.addChild(newNode);
                    this.popupNode = newNode;
                    kit.log('构建了popupNode 节点属性：', this.popupNode.name);
                }
                return true;
            }
            if (this.popupNode && this.style !== StyleType.FADE_IN_AND_OUT) {
                kit.log('移除了popupNode 节点属性：', this.popupNode.name);
                if (this.popupNode.name === 'New Node' && this.popupNode.childrenCount === 0) {
                    this.popupNode.removeFromParent();
                }
                this.popupNode = null;
            }
            return false;
        }
    })
    popupNode: cc.Node = null;

    @property({
        type: WinContent,
        visible() {
            if (this.style === StyleType.TO_MIDDLE) {
                if (!this.winContent) {
                    this.winContent = new WinContent(this);
                }
                return true;
            }
            else if (this.style !== StyleType.TO_MIDDLE) {
                this.winContent = null;
            }
            return false;
        }
    })
    winContent: WinContent = null;

    @property({
        type: WindowNode,
        tooltip: '要绑定的与控制器关联的节点'
    })
    ctrlNodes: WindowNode[] = [];

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        if (CC_EDITOR) {
            cc.LogManager.init('EDITOR PopupStyle');
        }
    }

    private _startFn: Function;
    private _completeFn: Function;

    start() {

    }

    public popup(): void {
        switch (this.style) {
            case StyleType.SMALL_TO_LARGE: {
                this.smallToLarge(0.3, 0, 1);
                break;
            }
            case StyleType.RIGHT_TO_LEFT: {
                let currX: number = this.popupNode.x;
                let x1: number = currX - 20;
                this.horizontalMove(AdapterCtrl.Instance.getScreenSize().width + this.popupNode.width / 2, x1, currX);
                break;
            }
            case StyleType.LEFT_TO_RIGHT: {
                let currX: number = this.popupNode.x;
                let x1: number = currX + 20;
                this.horizontalMove(-AdapterCtrl.Instance.getScreenSize().width - this.popupNode.width / 2, x1, currX);
                break;
            }
            case StyleType.ELASTIC_SCALE: {
                this.elasticScale(0, 0.1, 0.1, 0.1, 1.2, 1, 1);
                break;
            }
            case StyleType.FADE_IN_AND_OUT: {
                this.fadeIn();
                break;
            }
            case Style.TO_MIDDLE: {
                this.toMiddle();
                break;
            }
            default:
                break;
        }
    }

    public close(): void {
        switch (this.style) {
            case StyleType.RIGHT_TO_LEFT: {
                let x: number = -AdapterCtrl.Instance.getScreenSize().width - this.popupNode.width / 2
                this.horizontalMove(0, x, x);
                break;
            }
            case StyleType.LEFT_TO_RIGHT: {
                let x: number = AdapterCtrl.Instance.getScreenSize().width + this.popupNode.width / 2
                this.horizontalMove(0, x, x);
                break;
            }
            case StyleType.SMALL_TO_LARGE: {
                this.smallToLarge(0.2, 1, 0);
                break;
            }
            case StyleType.ELASTIC_SCALE: {
                this.elasticScale(1, 0.1, 0.1, 0.1, 0, 0, 0);
                break;
            }
            case StyleType.FADE_IN_AND_OUT: {
                this.fadeOut();
                break;
            }
            case StyleType.TO_MIDDLE: {
                this.toMiddle(true);
                break;
            }
            default:
                break;
        }
    }

    public setStartListener(listaner: Function): void {
        this._startFn = listaner;
    }

    public setCompleteListaner(listaner: Function): void {
        this._completeFn = listaner;
    }

    private smallToLarge(d: number, fromScale: number, toScale: number): void {
        this.popupNode.scale = fromScale;
        let scaleTo: cc.ActionInterval = cc.scaleTo(d, toScale);
        let callFunc1: cc.ActionInstant = cc.callFunc(() => {
            SAFE_CALLBACK(this._startFn);
        }, this);
        let callFunc2: cc.ActionInstant = cc.callFunc(() => {
            SAFE_CALLBACK(this._completeFn);
        }, this);
        let callFunc3: cc.ActionInstant = cc.callFunc(() => {
            this._startFn = null;
            this._completeFn = null;
        }, this);
        let seq: cc.ActionInterval = cc.sequence(callFunc1, scaleTo, callFunc2, callFunc3);
        this.popupNode.runAction(seq);
    }

    private horizontalMove(x: number, x1: number, x2: number): void {
        this.popupNode.x = x;
        let moveTo1: cc.ActionInterval = cc.moveTo(0.3, new cc.Vec2(x1, this.popupNode.y));
        let moveTo2: cc.ActionInterval = cc.moveTo(0.1, new cc.Vec2(x2, this.popupNode.y));
        let callFunc1: cc.ActionInstant = cc.callFunc(() => {
            SAFE_CALLBACK(this._startFn);
        }, this);
        let callFunc2: cc.ActionInstant = cc.callFunc(() => {
            SAFE_CALLBACK(this._completeFn);
        }, this);
        let callFunc3: cc.ActionInstant = cc.callFunc(() => {
            this._startFn = null;
            this._completeFn = null;
        }, this);
        let seq: cc.ActionInterval = cc.sequence(callFunc1, moveTo1, moveTo2, callFunc2, callFunc3);
        this.popupNode.runAction(seq);
    }

    private elasticScale(startScale: number, d1: number, d2: number, d3: number, scale1: number, scale2: number, scale3: number): void {
        this.popupNode.scale = startScale;
        let scaleTo1: cc.ActionInterval = cc.scaleTo(d1, scale1);
        let scaleTo2: cc.ActionInterval = cc.scaleTo(d2, scale2);
        let scaleTo3: cc.ActionInterval = cc.scaleTo(d3, scale3);
        let callFunc1: cc.ActionInstant = cc.callFunc(() => {
            SAFE_CALLBACK(this._startFn);
        }, this);
        let callFunc2: cc.ActionInstant = cc.callFunc(() => {
            SAFE_CALLBACK(this._completeFn);
        }, this);
        let callFunc3: cc.ActionInstant = cc.callFunc(() => {
            this._startFn = null;
            this._completeFn = null;
        }, this);
        let seq: cc.ActionInterval = cc.sequence(callFunc1, scaleTo1, scaleTo2, scaleTo3, callFunc2, callFunc3);
        this.popupNode.runAction(seq);
    }

    private fadeIn() {
        this.node.opacity = 0;
        let fadeIn: cc.ActionInterval = cc.fadeIn(0.2);
        let callFunc1: cc.ActionInstant = cc.callFunc(() => {
            SAFE_CALLBACK(this._startFn);
        }, this);
        let callFunc2: cc.ActionInstant = cc.callFunc(() => {
            SAFE_CALLBACK(this._completeFn);
        }, this);
        let callFunc3: cc.ActionInstant = cc.callFunc(() => {
            this._startFn = null;
            this._completeFn = null;
        }, this);
        let seq: cc.ActionInterval = cc.sequence(callFunc1, fadeIn, callFunc2, callFunc3);
        this.node.runAction(seq);
    }

    private fadeOut() {
        let fadeOut: cc.ActionInterval = cc.fadeOut(0.2);
        let callFunc1: cc.ActionInstant = cc.callFunc(() => {
            SAFE_CALLBACK(this._startFn);
        }, this);
        let callFunc2: cc.ActionInstant = cc.callFunc(() => {
            SAFE_CALLBACK(this._completeFn);
        }, this);
        let callFunc3: cc.ActionInstant = cc.callFunc(() => {
            this._startFn = null;
            this._completeFn = null;
        }, this);
        let seq: cc.ActionInterval = cc.sequence(callFunc1, fadeOut, callFunc2, callFunc3);
        this.node.runAction(seq);
    }

    private toMiddle(close: boolean = false) {
        if (this.winContent.style === ChildStyle.LEFT_RIGHT) {
            let posList = this.getPosList(this.winContent.leftNode, this.winContent.rightNode, close);
            this.winContent.leftNode.position = posList[0];
            this.winContent.rightNode.position = posList[1];
            this.moveTow(this.winContent.leftNode, this.winContent.rightNode, posList[2], posList[3]);
        }
        else if (this.winContent.style === ChildStyle.TOP_DOWN) {
            let posList = this.getPosList(this.winContent.downNode, this.winContent.topNode, close);
            this.winContent.downNode.position = posList[0];
            this.winContent.topNode.position = posList[1];
            this.moveTow(this.winContent.downNode, this.winContent.topNode, posList[2], posList[3]);
        }
        else if (this.winContent.style === ChildStyle.ALL_ROUND) {

        }
        else {
            return;
        }
    }

    private getPosList(target1: cc.Node, target2: cc.Node, close: boolean = false): cc.Vec3[] {
        let startPos1: cc.Vec3;
        let startPos2: cc.Vec3;
        let endtPos1: cc.Vec3;
        let endtPos2: cc.Vec3;
        if (close) {
            startPos1 = target1.position;
            startPos2 = target2.position;
            endtPos1 = new cc.Vec3(-AdapterCtrl.Instance.getScreenSize().width - target1.width / 2, target1.position.y);
            endtPos2 = new cc.Vec3(AdapterCtrl.Instance.getScreenSize().width + target2.width / 2, target2.position.y);
        }
        else {
            startPos1 = new cc.Vec3(-AdapterCtrl.Instance.getScreenSize().width - target1.width / 2, target1.position.y);
            startPos2 = new cc.Vec3(AdapterCtrl.Instance.getScreenSize().width + target2.width / 2, target2.position.y);
            endtPos1 = target1.position;
            endtPos2 =target2.position;
        }

        return [startPos1, startPos2, endtPos1, endtPos2];
    }

    private moveTow(target1: cc.Node, target2: cc.Node, endPos1: cc.Vec3, endPos2: cc.Vec3) {
        let moveTo1: cc.ActionInterval = cc.moveTo(0.3, cc.v2(endPos1.x, endPos1.y));
        let moveTo2: cc.ActionInterval = cc.moveTo(0.3, cc.v2(endPos2.x, endPos2.y));

        let callFunc1: cc.ActionInstant = cc.callFunc(() => {
            SAFE_CALLBACK(this._startFn);
        }, this);
        let callFunc2: cc.ActionInstant = cc.callFunc(() => {
            SAFE_CALLBACK(this._completeFn);
        }, this);
        let callFunc3: cc.ActionInstant = cc.callFunc(() => {
            this._startFn = null;
            this._completeFn = null;
        }, this);

        let runActionFn: cc.ActionInstant = cc.callFunc(() => {
            target1.runAction(moveTo1);
            target2.runAction(moveTo2);
        }, this);
        let seq: cc.ActionInterval = cc.sequence(callFunc1, runActionFn, cc.delayTime(0.3), callFunc2, callFunc3);
        this.node.runAction(seq);
    }

    private moveFour() {

    }

    // update (dt) {}
}
