import { SAFE_CALLBACK, SAFE_CALLBACK_CALLER } from "../Define";
import { IWinView } from "../lib.cck";
import { CCBaseView } from "../app/CCBaseView";
import { Animation, AnimationClip, Button, Node, Tween, tween, v3, _decorator } from "cc";
import { EventSystem } from "../event/EventSystem";
import { animat } from "../animat_audio";

const _vec3Temp_1 = v3(1.3, 1.3);
const _vec3Temp_2 = v3(1, 1);
const _vec3Temp_3 = v3(0, 0);

const {ccclass, property} = _decorator;

@ccclass("CCWinView")
export class CCWinView extends CCBaseView implements IWinView {

    @property({
        type: AnimationClip,
        displayName: "窗口弹出动画"
    })
    private popupClip: AnimationClip = null;

    @property({
        type: AnimationClip,
        displayName: "窗口关闭动画"
    })
    private closeClip: AnimationClip = null;

    @property({
        type: Node,
        displayName: "返回按钮"
    })
    private backBtn: Node = null;


    onLoad() {
        let animat: Animation = this.node.getComponent(Animation);
        if (!animat) {
            animat = this.node.addComponent(Animation);
        }
        this.popupClip && animat.addClip(this.popupClip);
        this.closeClip && animat.addClip(this.closeClip);
    }

    private _popupAction: Tween<Node>;
    private _closeAction: Tween<Node>;
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
            this.node.scale.set(0, 0);
            this._popupAction.start();
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
            this._closeAction.start();
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
        const tween1 = tween(this.node).to(0.1, {scale: _vec3Temp_1});
        const tween2 = tween(this.node).to(0.1, {scale: _vec3Temp_2}).call(() => {
            SAFE_CALLBACK_CALLER(this._startFn, this._startCaller);
        });
        this._popupAction = tween(this.node).sequence(tween1, tween2);
        this._closeAction = this.getCloseAction();
    }

    public setBackBtnListener(listener: Function) {
        if (this.backBtn) {
            if (this.backBtn.getComponent(Button)) {
                EventSystem.click(this.backBtn, this, () => {
                    SAFE_CALLBACK(listener);
                })
            }
            else {
                this.backBtn.on(Node.EventType.TOUCH_START, () => {}, this);
                this.backBtn.on(Node.EventType.TOUCH_END, () => {
                    SAFE_CALLBACK(listener);
                }, this);
            }
        }
    }

    private getCloseAction() {
        const tween1 = tween(this.node).to(0.1, {scale: _vec3Temp_3}).call(() => {
            SAFE_CALLBACK_CALLER(this._completeFn, this._completeCaller);
        });
        return tween1;
    }

    private playAnimat(name: string, callback: Function, caller: any) {
        animat(this.node).clip({name: name}).onStop(() => {
            SAFE_CALLBACK_CALLER(callback, caller);
        }).play();
    }
    // update (dt) {}
}
