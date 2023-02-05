import { Guide } from "../cck_guide";
import { createSprite, createText, createTip } from "../guide_utils";


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
@menu('游戏通用组件/引导/引导类型/GuideDialogue(对话引导)')
export default class GuideDialogue extends cc.Component {

    private _roleCount: number = 2;
    @property({
        type: cc.Integer,
        tooltip: '角色个数',
        step: 1
    })
    private set roleCount(val: number) {
        this._roleCount = val;
        this.createNode();
    }
    private get roleCount(): number { return this._roleCount; }

    @property({
        type: cc.Node,
        tooltip: '角色列表'
    })
    private roleList: cc.Node[] = [];

    @property({
        type: cc.Node,
        displayName: '提示点击'
    })
    private tip: cc.Node = null;

    @property({
        type: cc.Float,
        range: [0, 1, 0.1],
        tooltip: '文字显示的时间间隔(秒)',
        slide: true
    })
    private duration: number = 0.1;

    private _playText: boolean = false;
    private _timeout: number = 0;
    private _charIndex: number = 0;
    private _descript: string;

    onLoad () {
        this.init();
        this.createNode();
        if (this.duration < (1 / cc.game.getFrameRate())) {
            this.duration = 1 / cc.game.getFrameRate();
        }
        if (!CC_EDITOR) {
            this.node.on(cc.Node.EventType.TOUCH_START, function() {}, this);
            this.node.on(cc.Node.EventType.TOUCH_END, this.onClick, this);
        }
    }

    init() {
        this.node.width = 2000;
        this.node.height = 2000;
        this._playText = false;
        this._timeout = 0;
        this._charIndex = 0;
    }

    createNode() {
        for (let i: number = this.roleList.length; i < this.roleCount; ++i) {
            let role: cc.Node = createSprite('role');
            role.addChild(createText('text'));
            this.node.addChild(role);
            this.roleList.push(role);
        }
        for (let i: number = 0; i < this.roleList.length - this.roleCount; ++i) {
            let node: cc.Node = this.roleList.pop();
            node.removeFromParent();
        }

        if (!this.tip) {
            this.tip = createTip('tip');
            this.node.addChild(this.tip);
        }
    }

    onClick() {
        // if (this._charIndex < this._descript.length && this._playText) {
        //     this._playText = false;
        //     let index: number = Guide.guideManager.guideInfo.npc - 1;
        //     this.roleList[index].getChildByName('text').getComponent(cc.Label).string = this._descript;
        //     this.tip.active = true;
        // }
        // else {
        //     this.node.active = false;
        //     Guide.guideManager.guideContinue();
        // }

        if (this._charIndex === this._descript.length) {
            this.node.active = false;
            Guide.guideManager.guideContinue();
        }
    }

    executeGuide() {
        this._playText = true;
        this._charIndex = 0;
        this._timeout = 0;
        this.node.active = true;
        this.tip.active = false;
        this._descript = Guide.guideManager.guideInfo.descript;
        for (let e of this.roleList) {
            e.getChildByName('text').getComponent(cc.Label).string = '';
        }
    }

    start () {

    }

    update (dt: number) {
        if (!this._playText) return;

        this._timeout += dt;
        if (this._timeout >= this.duration) {
            this._timeout = 0;
            let index: number = Guide.guideManager.guideInfo.npc - 1;
            this.roleList[index].getChildByName('text').getComponent(cc.Label).string += this._descript[this._charIndex++];
            if (this._charIndex >= this._descript.length) {
                this._playText = false;
                this.tip.active = true;
            }
        }
    }
}
