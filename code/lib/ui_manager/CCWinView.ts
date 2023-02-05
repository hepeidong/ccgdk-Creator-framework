import { SAFE_CALLBACK, SAFE_CALLBACK_CALLER } from "../Define";
import { Utils, EventSystem } from "../cck";
import { CCBaseView } from "./CCBaseView";

const {ccclass, property} = cc._decorator;

@ccclass
export class CCWinView extends CCBaseView implements IWinView {

    @property({
        type: cc.AnimationClip,
        displayName: "窗口弹出动画"
    })
    private popupClip: cc.AnimationClip = null;

    @property({
        type: cc.AnimationClip,
        displayName: "窗口关闭动画"
    })
    private closeClip: cc.AnimationClip = null;

    @property({
        type: cc.Node,
        displayName: "返回按钮"
    })
    private backBtn: cc.Node = null;


    onLoad() {
        let animat: cc.Animation = this.node.getComponent(cc.Animation);
        if (!animat) {
            animat = this.node.addComponent(cc.Animation);
        }
        this.popupClip && animat.addClip(this.popupClip);
        this.closeClip && animat.addClip(this.closeClip);
    }

    private _popupAction: cc.ActionInterval;
    private _closeAction: cc.ActionInterval;
    private _startFn: Function;
    private _startCaller: any;
    private _completeFn: Function;
    private _completeCaller: any;

    start() {

    }

    public popup(): void {
        if (this.popupClip) {
            this.playAnimat(this.popupClip.name, this._startFn, this._startCaller);
        }
        else if (this._popupAction) {
            this.node.scale = 0;
            this.node.runAction(this._popupAction);
        }
        else {
            SAFE_CALLBACK_CALLER(this._startFn, this._startCaller);
        }
    }

    public close(): void {
        if (this.closeClip) {
            this.playAnimat(this.closeClip.name, this._completeFn, this._completeCaller);
        }
        else if (this._closeAction) {
            this.node.runAction(this._closeAction);
        }
        else {
            SAFE_CALLBACK_CALLER(this._completeFn, this._completeCaller);
        }
    }

    /**
     * 弹起窗口时执行的回调
     * @param listener 
     * @param caller 
     */
    public setStartListener(listener: Function, caller: any): void {
        this._startFn = listener;
        this._startCaller = caller;
    }

    /**
     * 弹起窗口后执行的回调
     * @param listener 
     * @param caller 
     */
    public setCompleteListener(listener: Function, caller: any): void {
        this._completeFn = listener;
        this._completeCaller = caller;
    }

    public setPopupSpring() {
        let scaleTo1: cc.ActionInterval = cc.scaleTo(0.1, 1.3);
        let scaleTo2: cc.ActionInterval = cc.scaleTo(0.1, 1);
        let callFunc1: cc.ActionInstant = cc.callFunc(() => {
            SAFE_CALLBACK_CALLER(this._startFn, this._startCaller);
        }, this);
        this._popupAction = cc.sequence(scaleTo1, scaleTo2, callFunc1);
        this._closeAction = this.getCloseAction();
    }

    public setBackBtnListener(listener: Function) {
        if (this.backBtn) {
            if (this.backBtn.getComponent(cc.Button)) {
                EventSystem.click(this.backBtn, this, () => {
                    SAFE_CALLBACK(listener);
                })
            }
            else {
                this.backBtn.on(cc.Node.EventType.TOUCH_START, () => {}, this);
                this.backBtn.on(cc.Node.EventType.TOUCH_END, () => {
                    SAFE_CALLBACK(listener);
                }, this);
            }
        }
    }

    private getCloseAction() {
        let scaleTo = cc.scaleTo(0.1, 0);
        let callFunc = cc.callFunc(() => {
            SAFE_CALLBACK_CALLER(this._completeFn, this._completeCaller);
        }, this);
        return cc.sequence(scaleTo, callFunc);
    }

    private playAnimat(name: string, callback: Function, caller: any) {
        Utils.animat(this.node).clip({name: name}).onStop(() => {
            SAFE_CALLBACK_CALLER(callback, caller);
        }).play();
    }
    // update (dt) {}
}
