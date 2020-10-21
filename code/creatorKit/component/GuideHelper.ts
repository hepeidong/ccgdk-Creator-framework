import GuideManager from "./GuideManager";
import GuideFinger from "./GuideFinger";
import GuideTarget from "./GuideTarget";

enum guide_type {
    /**手指引导 */
    FINGER,
    /**对话引导 */
    DIALOGUE,
    /**文本引导 */
    TEXT
}

const {
    ccclass, 
    property, 
    executeInEditMode, 
    menu, 
    disallowMultiple
} = cc._decorator;


@ccclass
@executeInEditMode
@disallowMultiple
@menu('游戏通用组件/引导/GuideHelper(引导助手)')
export default class GuideHelper extends cc.Component {

    @property({
        tooltip: '选中该选项，增加手指引导'
    })
    isFinger: boolean = false;

    @property({
        type: cc.Node,
        visible() {
            if (!this.guideFinger && this.isFinger) {
                let newNode: cc.Node = new cc.Node('guideFinger');
                if (newNode) {
                    this.guideFinger = newNode;
                    this.guideFinger.addComponent("GuideFinger");
                    this.node.addChild(this.guideFinger);
                }
            }
            else if (!this.isFinger) {
                this.node.removeChild(this.guideFinger);
                this.guideFinger = null;
            }
            return this.isFinger;
        }
    })
    guideFinger: cc.Node = null;

    @property({
        tooltip: '选中该选项，增加对话框引导'
    })
    isDialogue: boolean = false;

    @property({
        type: cc.Node,
        visible() {
            if (!this.guideDialogue && this.isDialogue) {
                let newNode: cc.Node = new cc.Node('guideDialogue');
                if (newNode) {
                    this.guideDialogue = newNode;
                    this.guideDialogue.addComponent("GuideDialogue");
                    this.node.addChild(this.guideDialogue);
                }
            }
            else if (!this.isDialogue) {
                this.node.removeChild(this.guideDialogue);
                this.guideDialogue = null;
            }
            return this.isDialogue;
        }
    })
    guideDialogue: cc.Node = null;

    @property({
        tooltip: '选中该选项，增加文本引导'
    })
    isText: boolean = false;

    @property({
        type: cc.Node,
        visible() {
            if (!this.guideText && this.isText) {
                let newNode: cc.Node = new cc.Node('guideText');
                if (newNode) {
                    this.guideText = newNode;
                    this.guideText.addComponent("GuideText");
                    this.node.addChild(this.guideText);
                }
            }
            else if (!this.isText) {
                this.node.removeChild(this.guideText);
                this.guideText = null;
            }
            return this.isText;
        }
    })
    guideText: cc.Node = null;

    @property({
        type: GuideTarget,
        tooltip: '引导节点列表'
    })
    guideNodes: GuideTarget[] = [];

   
    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        if (!CC_EDITOR) {
            for (let i: number = 0; i < this.guideNodes.length; ++i) {
                kit.Log(this.guideNodes[i]);
                if (this.guideNodes[i] && this.guideNodes[i].target) {
                    GuideManager.Instance.addGuideTarget(this.guideNodes[i]);
                }
            }
        }
        else {
            this.guideNodes[0] = new GuideTarget();
        }
        cc.game.on(GuideManager.EventType.START_GUIDE, this.onStartGuide, this);
    }

    start () {

    }

    onStartGuide() {
        if (GuideManager.Instance.isGuiding) {
            if (GuideManager.Instance.guideType === guide_type.DIALOGUE) {
                
            }
            else if (GuideManager.Instance.guideType === guide_type.FINGER) {
                let guide: GuideFinger = this.guideFinger.getComponent(GuideFinger);
                if (guide) {
                    guide.executeGuide();
                }
            }
            else if (GuideManager.Instance.guideType === guide_type.TEXT) {

            }
        }
    }

    // update (dt) {}
}
