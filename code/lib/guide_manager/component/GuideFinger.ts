import { createSprite, createText, restoreParent } from "../guide_utils";
import { GuideNormalEvent } from "../GuideEnum";
import { Utils } from "../../utils";
import { EventSystem } from "../../event_manager/EventSystem";
import { GuideTarget } from "./GuideTarget";
import { Guide } from "..";
import { UI, App } from "../../cck";


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
        tooltip: '指引特效'
    })
    private _effect: cc.Node = null;

    @property({
        type: cc.Node,
        tooltip: '手指引导的手指节点，可在该节点绑定相应的Animation动画'
    })
    private finger: cc.Node = null;

    @property({
        type: cc.Node,
        tooltip: '文本说明'
    })
    private text: cc.Node = null;

    @property(cc.Node)
    private _textParent: cc.Node = null;

    private _auto: boolean = false;           //自动执行下一步引导
    private _clicked: boolean = false;        //防止重复点击
    private _timeout: number = 0;      
    private _interval: number = 4;            //自动引导时间间隔
    private _guideTargets: GuideTarget[]; //引导目标暂存
    private _guideInfo: IGuideConfig;      //引导数据信息暂存
    private _lightTargets: cc.Node[];         //引导高亮节点暂存
    private _targetZIndex: number[] = [];     //目标节点的zIndex
    private _lightParents: cc.Node[] = [];    //高亮父节点

    onLoad () {
        this.createNode();

        if (!CC_EDITOR) {
            Guide.guideManager.setGuideEnd(() => this.node.active = false, this);
            EventSystem.event.on(GuideNormalEvent.FINGER_EVENT, this, this.nextGuide);
        }
    }

    start () {
        
    }

    createNode() {
        if (!this.finger) {
            this.finger = new cc.Node('finger');
            this.node.addChild(this.finger);
        }
        if (!this._effect) {
            this._effect = createSprite('effect');
            this._effect.addComponent(cc.Animation);
            this.finger.addChild(this._effect);
        }
        if (!this.text) {
            this.text = createText('text');
            this._textParent = new cc.Node('textNode');
            this._textParent.addChild(this.text);
            this.node.addChild(this._textParent);
        }
        this.text.zIndex = 200;
    }

    /**执行引导 */
    public executeGuide() {
        this.node.active = true;
        this._clicked = false;
        this.storageGuideData();
        this.fingerTurn();
        this.fingerMove();
        if (this._guideTargets.length === 0) {
            Guide.guideManager.setAgainExecute(true);
            return;
        }
               
        this.text.getComponent(cc.Label).string = Guide.guideManager.guideInfo.descript;
        let is: boolean = Utils.isNull(Guide.guideManager.guideInfo.descript) || Utils.isUndefined(Guide.guideManager.guideInfo.descript) || Guide.guideManager.guideInfo.descript === 'null';
        is && (this.text.getComponent(cc.Label).string = '');
        this._textParent.active = !is;
        this._textParent.width = this._textParent.width < this.text.width ? this.text.width : this._textParent.width;
        this._textParent.height = this._textParent.height < this.text.height ? this.text.height : this._textParent.height;
        Guide.guideManager.setTextPos(this, this._textParent);

        for (let e of this._lightTargets) {
            this._lightParents.push(e.parent);
            this._targetZIndex.push(e.zIndex);
            Guide.guideManager.addChildToGuideLayer(e);
        }
        
        if (UI.isButton(this._guideInfo.targetId[0])) {
            let target: cc.Node = this._guideTargets[0].target;
            if (!target['guideTouchRegist']) {
                target['guideTouchRegist'] = true;
                EventSystem.addClickEventHandler(target, this, 'nextGuide');

            }
        }
        else {
            this._auto = true;
            this.disable(false);
        }
    }

    //修正手指的翻转
    private fingerTurn() {
        let width: number = this.finger.width * (1 - this.finger.anchorX);
        if (this.finger.x > 0) {
            let distance: number = App.adapterManager.getScreenSize().width / 2 - this.finger.x;
            if (width > distance) {
                this.finger.scaleX = -1;
            }
        }
        else if (this.finger.x < 0) {
            let distance: number = this.finger.x - App.adapterManager.getScreenSize().width / 2;
            if (width > distance) {
                this.finger.scaleX = 1;
            }
        }
    }

    //手指移动
    private fingerMove() {
        let posisions: cc.Vec3[] = Guide.guideManager.getTargetPosition();
        if (posisions.length === 0) {
            return;
        }
        this.playAnimat(false);
        //计算手指和引导目标两点距离
        let dis: number = Utils.MathUtil.distance(this.finger.position, cc.v3(posisions[0].x, posisions[0].y));
        //计算移动时间
        let t: number = dis / Guide.guideManager.fingerSpeed;
        let tween: cc.Tween<cc.Node> = cc.tween(this.finger).to(t, {position: cc.v3(posisions[0].x, posisions[0].y)});
        if (posisions.length > 1) {
            tween.repeatForever(cc.tween(this.finger).to(t, {position: cc.v3(posisions[1].x, posisions[1].y)}));
        }
        tween.call(() => {
            Guide.guideManager.hideBlockInputLayer();
            if (posisions.length === 1) {
                this.playAnimat(true);
            }
        });
        tween.start();
    }

    playAnimat(play: boolean) {
        if (play) {
            Utils.animat(this._effect).defaultClip().play();
        }
        else {
            Utils.animat(this._effect).defaultClip().onStop(() => {
                for (let i: number = 0; i < this._effect.childrenCount; ++i) {
                    this._effect.children[i].active = false;
                    if (this._effect.children[i].getComponent(cc.Animation)) {
                        Utils.animat(this._effect.children[i]).defaultClip().stop();
                    }
                }
            }).stop();
        }
    }

    //暂存引导相关数据
    private storageGuideData() {
        this._guideInfo = Guide.guideManager.guideInfo;
        this._guideTargets = Guide.guideManager.guideTargets;
        this._lightTargets = Guide.guideManager.lightTargets;
    }

    //下一步引导执行
    private nextGuide() {
        if (this._clicked) return;
        if (!this._guideTargets || !this._lightTargets) {
            return;
        }
        this._clicked = true;
        for (let guideTarget of this._guideTargets) {
            for (let i: number = 0; i < guideTarget.guideIds.length; ++i) {
                if (this._guideInfo.key === guideTarget.guideIds[i]) {
                    guideTarget.guideIds.splice(i, 1);
                    let index: number = 0;
                    for (let ele of this._lightTargets) {
                        restoreParent(ele, this._targetZIndex[index], this._lightParents[index++]);
                    }
                    this._targetZIndex.splice(0, this._targetZIndex.length);
                    this._lightParents.splice(0, this._lightParents.length);
                    this.node.active = false;
                    Guide.guideManager.guideContinue();
                    break;
                }
            }
        }
    }

    private disable(enable: boolean) {
        for (let guideTarget of this._guideTargets) {
            let button = guideTarget.target.getComponent(cc.Button);
            if (button) {
                button.interactable = enable;
            }
        }
    }

    update (dt: number) {
        if (this._auto) {
            this._timeout += dt;
            if (this._timeout >= this._interval) {
                this._auto = false;
                this._timeout = 0;
                this.disable(true);
                this.nextGuide();
            }
        }
    }
}
