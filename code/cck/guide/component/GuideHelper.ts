import { GuideFinger } from "./GuideFinger";
import { GuideDialogue } from "./GuideDialogue";
import { GuideText } from "./GuideText";
import { GuideNormalEvent, GuideType } from "../GuideEnum";
import { getNextGuideId } from "../guide_utils";
import { Debug } from "../../Debugger";
import { AdapterWidget } from "../../app/adapter_manager/component/AdapterWidget";
import { BlockInputEvents, Component, Node, Sprite, _decorator } from "cc";
import { EDITOR } from "cc/env";
import { EventSystem } from "../../event/EventSystem";
import { ui } from "../../ui";
import { GuideManager } from "../GuideManager";


const {
    ccclass,
    property,
    executeInEditMode,
    menu,
    disallowMultiple
} = _decorator;


@ccclass("GuideHelper")
@executeInEditMode
@disallowMultiple
@menu('游戏通用组件/引导/GuideHelper(引导助手)')
export  class GuideHelper extends Component {

    @property(Node)
    private _guideMask: Node = null;

    @property(Node)
    private _guideLayer: Node = null;

    @property(Node)
    private _guideBlockInput: Node = null;

    @property({
        range: [0, 1, 0.1],
        slide: true,
        displayName: '手指移动速度'
    })
    private fingerSpeed: number = 0.5;

    @property({
        tooltip: '选中该选项，增加手指引导'
    })
    isFinger: boolean = false;

    @property({
        type: Node,
        visible(this: GuideHelper) {
            if (!this.guideFinger && this.isFinger) {
                let newNode: Node = new Node('guideFinger');
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
    guideFinger: Node = null;

    @property({
        tooltip: '选中该选项，增加对话框引导'
    })
    isDialogue: boolean = false;

    @property({
        type: Node,
        visible(this: GuideHelper) {
            if (!this.guideDialogue && this.isDialogue) {
                let newNode: Node = new Node('guideDialogue');
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
    guideDialogue: Node = null;

    @property({
        tooltip: '选中该选项，增加文本引导'
    })
    isText: boolean = false;

    @property({
        type: Node,
        visible(this: GuideHelper) {
            if (!this.guideText && this.isText) {
                let newNode: Node = new Node('guideText');
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
    guideText: Node = null;

    private _startGuideId: number;
    private _againGuideId: number;
    private _startExecute: boolean = false;
    private _againExecute: boolean = false;
    private _viewOpenStatus: boolean = false;

    onLoad() {
        this.createNode();
        if (!EDITOR) {
            this.onGuideOver();
            GuideManager.instance.setFingerSpeed(this.fingerSpeed);
            GuideManager.instance.addGuideMaskAndLayer(this._guideMask, this._guideLayer);
            GuideManager.instance.setGuideStart(this.onStartGuide, this);
            GuideManager.instance.setGuideOver(this.onGuideOver, this);
            GuideManager.instance.setGuideEnd(this.onGuideOver, this);
            EventSystem.event.on(GuideNormalEvent.HIDE_BLOCK_INPUT_LAYER, this, () => this._guideBlockInput.active = false);
            EventSystem.event.on(GuideNormalEvent.AGAIN_EXECUTE, this, this.onAgainExecute);
        }
    }

    start() {
        GuideManager.instance.guideLaunch();
    }

    createNode() {
        if (!this._guideMask) {
            let newNode: Node = new Node('guideMask');
            newNode.addComponent(Sprite);
            newNode.addComponent(AdapterWidget).size = true;
            newNode.addComponent(BlockInputEvents);
            this._guideMask = newNode;
            this.node.addChild(this._guideMask);
        }
        if (!this._guideLayer) {
            let newNode: Node = new Node('guideLayer');
            this._guideLayer = newNode;
            this.node.addChild(this._guideLayer);
        }
        if (!this._guideBlockInput) {
            let newNode: Node = new Node('guideBlockInput');
            newNode.addComponent(AdapterWidget).size = true;
            newNode.addComponent(BlockInputEvents);
            this._guideBlockInput = newNode;
            this.node.addChild(this._guideBlockInput);
        }
    }

    onGuideOver() {
        this._guideMask && (this._guideMask.active = false);
        this._guideBlockInput && (this._guideBlockInput.active = false);
        this.guideFinger && (this.guideFinger.active = false);
        this.guideDialogue && (this.guideDialogue.active = false);
        this.guideText && (this.guideText.active = false);
    }

    onStartGuide(guideId: number) {
        let status = this.getViewStatus(guideId);
        if (status > -1) {
            this._againExecute = false;
            this._startExecute = true;
            this._startGuideId = guideId;
            this._viewOpenStatus = status === 1 ? true : false;
        }
        else {
            Debug.log('当前引导', GuideManager.instance.guideInfo);
            this.executeGuide(guideId);
        }
    }

    private onAgainExecute() {
        let guideId: number = getNextGuideId();
        let status = this.getViewStatus(guideId);
        if (status > -1) {
            this._startExecute = false;
            this._againExecute = true;
            this._againGuideId = guideId;
            this._viewOpenStatus = status === 1 ? true : false;
        }
        else {
            Debug.log('再次执行引导', guideId);
            this.executeGuide(guideId);
        }
    }

    private executeGuide(guideId: number) {
        if (GuideManager.instance.isGuiding) {
            let guideObj: GuideFinger | GuideText | GuideDialogue;
            GuideManager.instance.setAgainExecute(false);
            if (GuideManager.instance.guideType === GuideType.DIALOGUE) {
                Debug.log('[GuideHelper] onStartGuide 对话引导');
                this._guideMask && (this._guideMask.active = true);
                this.guideDialogue && (this.guideDialogue.active = true);
                guideObj = this.guideDialogue.getComponent(GuideDialogue);
            }
            else if (GuideManager.instance.guideType === GuideType.FINGER) {
                Debug.log('[GuideHelper] onStartGuide 手指引导');
                if (GuideManager.instance.searchLightTarget(guideId)) {
                    this._guideMask && (this._guideMask.active = true);
                    this.guideFinger && (this.guideFinger.active = true);
                    guideObj = this.guideFinger.getComponent(GuideFinger);
                    this._guideBlockInput && (this._guideBlockInput.active = true);
                }
                else {
                    Debug.log('没有高亮节点', guideId);
                    GuideManager.instance.setAgainExecute(true);
                }
            }
            else if (GuideManager.instance.guideType === GuideType.TEXT) {
                Debug.log('[GuideHelper] onStartGuide 文本引导');
                if (GuideManager.instance.searchLightTarget(guideId)) {
                    this._guideMask && (this._guideMask.active = true);
                    this.guideText && (this.guideText.active = true);
                    guideObj = this.guideText.getComponent(GuideText);
                }
                else {
                    Debug.log('没有高亮节点', guideId);
                    GuideManager.instance.setAgainExecute(true);
                }
            }
            if (guideObj) {
                guideObj.executeGuide();
            }
        }
    }

    /**
     * 获取引导的页面的状态, -1: ui管理中没有这个页面, 0: ui管理中有这个页面, 没有打开, 1: ui管理中有这个页面, 并且打开了
     * @param guideId 
     */
    private getViewStatus(guideId: number) {
        let status: number = -1;
        let guideInfo = GuideManager.instance.guideFile.get(guideId);
        let view = ui.getView(guideInfo.uiId);
        if (guideInfo && view) {
            status = view.opened ? 1 : 0;
        }
        return status;
    }

    private setViewOpenStatus(guideId: number) {
        let status = this.getViewStatus(guideId);
        if (status > -1) this._viewOpenStatus = status === 1 ? true : false;
    }

    update (dt) {
        if (this._againExecute) {
            this.setViewOpenStatus(this._againGuideId);
            if (this._viewOpenStatus) {
                this._againExecute = false;
                this._viewOpenStatus = false;
                this.executeGuide(this._againGuideId);
                Debug.log('再次执行引导', this._againGuideId);
            }
        }
        else if (this._startExecute) {
            this.setViewOpenStatus(this._startGuideId);
            if (this._viewOpenStatus) {
                this._startExecute = false;
                this._viewOpenStatus = false;
                Debug.log('当前引导', GuideManager.instance.guideInfo);
                this.executeGuide(this._startGuideId);
            }
        }
    }
}
