import { UIViewController } from "./UIViewController";

/**窗口弹出风格 */
export enum Popup_Style {
    /**没有特效的弹出风格 */
    NORMEL,
    /**淡入淡出的弹入弹出特效 */
    FADE_OVER,
    /**滑入滑出的弹入弹出特效 */
    ROLL_IN_ROLL_OUT,
    /**快速缩放的弹入弹出特效 */
    POP_UP
}

/**
 * author: HePeiDong
 * date: 2019/9/11
 * name: 窗口类
 */
export class WindowView {
    private _canvas: cc.Node;
    
    private _topWindowSize: cc.Size;
    private _downWindowSize: cc.Size;
    private _leftWindowSize: cc.Size;
    private _rightWindowSize: cc.Size;

    private _priority: number;

    constructor() {
        this._canvas = cc.director.getScene().getChildByName('Canvas');
        this.Init();
    }

    public Init(): boolean {
        this._priority = 0;
        let topWindowSize: cc.Size = new cc.Size(this._canvas.getContentSize().width, this._canvas.getContentSize().height/2);
        let downWindowSize: cc.Size = new cc.Size(this._canvas.getContentSize().width, this._canvas.getContentSize().height/2);
        let leftWindowSize: cc.Size = new cc.Size(this._canvas.getContentSize().width/2, this._canvas.getContentSize().height);
        let rightWindowSize: cc.Size = new cc.Size(this._canvas.getContentSize().width/2, this._canvas.getContentSize().height);
        return true;
    }

    public set topViewController(controller: UIViewController) {
        controller.priority = ++this._priority;
        this._canvas.addChild(controller.view);
        let topY: number = this._canvas.getContentSize().height/4;
        let y: number = topY + this._topWindowSize.height/2 - controller.view.getContentSize().height/2;
        controller.view.y = y;
        controller.view.x = 0;
    }

    public set downViewController(controller: UIViewController) {
        controller.priority = ++this._priority;
        this._canvas.addChild(controller.view);
        let downY: number = -this._canvas.getContentSize().height/4;
        let y: number = downY - this._downWindowSize.height/2 + controller.view.getContentSize().height/2;
        controller.view.y = y;
        controller.view.x = 0;
    }

    public set leftViewController(controller: UIViewController) {
        controller.priority = ++this._priority;
        this._canvas.addChild(controller.view);
        let leftX: number = -this._canvas.getContentSize().width/4;
        let x: number = leftX - this._leftWindowSize.width/2 + controller.view.getContentSize().width/2;
        controller.view.x = x;
        controller.view.y = 0;
    }

    public set rightViewController(controller: UIViewController) {
        controller.priority = ++this._priority;
        this._canvas.addChild(controller.view);
        let rightX: number = this._canvas.getContentSize().width/4;
        let x: number = rightX + this._rightWindowSize.width/2 - controller.view.getContentSize().width/2;
        controller.view.x = x;
        controller.view.y = 0;
    }

    public set centreViewController(controller: UIViewController) {
        controller.priority = ++this._priority;
        this._canvas.addChild(controller.view);
        controller.view.x = 0;
        controller.view.y = 0;
    }

    private Normal(): void {

    }

    private Fade_over(): void {

    }

    private Roll_in_roll_out(): void {

    }

    private Pop_up(): void {

    }
}