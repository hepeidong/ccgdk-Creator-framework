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

    /***************游戏层级结构中的窗口结构*****************/
    private _upWindow: cc.Node;          //上方窗口
    private _downWindow: cc.Node;        //下方窗口
    private _centerWindow: cc.Node;      //中心窗口
    private _leftWindow: cc.Node;        //左窗口
    private _rightWindow: cc.Node;       //右窗口
    private _upperLWindow: cc.Node;      //左下窗口
    private _upperRWindow: cc.Node;      //右上窗口
    private _lowerLWindow: cc.Node;      //左下窗口
    private _lowerRWindow: cc.Node;      //右下窗口


    private _priority: number;

    constructor() {
        this._canvas = cc.director.getScene().getChildByName('Canvas');
        this.Init();
    }

    private Init(): boolean {
        this._priority = 0;
        let canvasSize = this._canvas.getContentSize();
        this._upWindow.setContentSize(canvasSize.width, canvasSize.height / 2);
        this._downWindow.setContentSize(canvasSize.width, canvasSize.height / 2);
        this._centerWindow.setContentSize(canvasSize);
        this._leftWindow.setContentSize(canvasSize.width / 2, canvasSize.height);
        this._rightWindow.setContentSize(canvasSize.width / 2, canvasSize.height);
        this._upperLWindow.setContentSize(canvasSize.width / 2, canvasSize.height / 2);
        this._upperRWindow.setContentSize(canvasSize.width / 2, canvasSize.height / 2);
        this._lowerLWindow.setContentSize(canvasSize.width / 2, canvasSize.height / 2);
        this._lowerRWindow.setContentSize(canvasSize.width / 2, canvasSize.height / 2);

        this._canvas.addChild(this._upWindow);
        this._canvas.addChild(this._leftWindow);
        this._canvas.addChild(this._downWindow);
        this._canvas.addChild(this._centerWindow);
        this._canvas.addChild(this._rightWindow);
        this._canvas.addChild(this._upperLWindow);
        this._canvas.addChild(this._upperRWindow);
        this._canvas.addChild(this._lowerLWindow);
        this._canvas.addChild(this._lowerRWindow);
        return true;
    }

    /**
     * 增加上方窗口
     * @param controller 视图控制器
     * @param nextTo 是否贴紧边缘
     */
    public AddUpWindow(controller: UIViewController, nextTo: boolean): void {
        if (nextTo) {
            controller.priority = ++this._priority;
            this._upWindow.addChild(controller.node);
            let y: number = this._upWindow.y + this._upWindow.getContentSize().height/2 - controller.node.getContentSize().height/2;
            controller.node.y = y;
            controller.node.x = 0;
        }
        else {
            this._upWindow.addChild(controller.node);
            controller.node.x = 0;
            controller.node.y = 0;
        }
    }

    /**
     * 增加下方窗口
     * @param controller 视图控制器
     * @param nextTo 是否贴紧边缘
     */
    public AddDownWindow(controller: UIViewController, nextTo: boolean): void {
        controller.priority = ++this._priority;
        if (nextTo) {
            this._downWindow.addChild(controller.node);
            let y: number = this._downWindow.y - this._downWindow.getContentSize().height/2 + controller.node.getContentSize().height/2;
            controller.node.y = y;
            controller.node.x = 0;
        }
        else {
            this._downWindow.addChild(controller.node);
            controller.node.x = 0;
            controller.node.y = 0;
        }
    }

    /**
     * 增加左边窗口
     * @param controller 视图控制器
     * @param nextTo 是否贴紧边缘
     */
    public AddLeftWindow(controller: UIViewController, nextTo: boolean): void {
        controller.priority = ++this._priority;
        if (nextTo) {
            this._leftWindow.addChild(controller.node);
            let x: number = this._leftWindow.x - this._leftWindow.getContentSize().width/2 + controller.node.getContentSize().width/2;
            controller.node.x = x;
            controller.node.y = 0;
        }
        else {
            this._leftWindow.addChild(controller.node);
            controller.node.x = 0;
            controller.node.y = 0;
        }
    }

    /**
     * 增加右边窗口
     * @param controller 视图控制器
     * @param nextTo 是否贴紧边缘
     */
    public AddRightWindow(controller: UIViewController, nextTo: boolean): void {
        controller.priority = ++this._priority;
        if (nextTo) {
            this._rightWindow.addChild(controller.node);
            let x: number = this._rightWindow.x + this._rightWindow.getContentSize().width/2 - controller.node.getContentSize().width/2;
            controller.node.x = x;
            controller.node.y = 0;
        }
        else {
            this._rightWindow.addChild(controller.node);
            controller.node.x = 0;
            controller.node.y = 0;
        }
        
    }

    /**
     * 增加中间窗口
     * @param controller 视图控制器
     */
    public AddCenterWindow(controller: UIViewController): void {
        controller.priority = ++this._priority;
        this._centerWindow.addChild(controller.node);
        controller.node.x = 0;
        controller.node.y = 0;
    }

    /**
     * 增加左上窗口
     * @param controller 视图控制器
     * @param nextTo 是否贴紧边缘
     */
    public AddUpperLWindow(controller: UIViewController, nextTo: boolean): void {
        controller.priority = ++this._priority;
        if (nextTo) {
            this._upperLWindow.addChild(controller.node);
            let contenSize: cc.Size = this._upperLWindow.getContentSize();
            let controllerSize: cc.Size = controller.node.getContentSize();
            let x: number = this._upperLWindow.x - contenSize.width / 2 - controllerSize.width / 2;
            let y: number = this._upperLWindow.y + contenSize.height / 2 - controllerSize.height / 2;
            controller.node.x = x;
            controller.node.y = y;
        }
        else {
            this._upperLWindow.addChild(controller.node);
            controller.node.x = 0;
            controller.node.y = 0;
        }
    }

    /**
     * 增加右上窗口
     * @param controller 视图控制器
     * @param nextTo 是否贴紧边缘
     */
    public AddUpperRWindow(controller: UIViewController, nextTo: boolean): void {
        controller.priority = ++this._priority;
        if (nextTo) {
            this._upperRWindow.addChild(controller.node);
            let contenSize: cc.Size = this._upperRWindow.getContentSize();
            let controllerSize: cc.Size = controller.node.getContentSize();
            let x: number = this._upperRWindow.x + contenSize.width / 2 - controllerSize.width / 2;
            let y: number = this._upperRWindow.y + contenSize.height / 2 - controllerSize.height / 2;
            controller.node.x = x;
            controller.node.y = y;
        }
        else {
            this._upperRWindow.addChild(controller.node);
            controller.node.x = 0;
            controller.node.y = 0;
        }
    }

    /**
     * 增加左下窗口
     * @param controller 视图控制器
     * @param nextTo 是否贴紧边缘
     */
    public AddLowerLWindow(controller: UIViewController, nextTo: boolean): void {
        controller.priority = ++this._priority;
        if (nextTo) {
            this._lowerLWindow.addChild(controller.node);
            let contenSize: cc.Size = this._lowerLWindow.getContentSize();
            let controllerSize: cc.Size = controller.node.getContentSize();
            let x: number = this._lowerLWindow.x - contenSize.width / 2 - controllerSize.width / 2;
            let y: number = this._lowerLWindow.y - contenSize.height / 2 - controllerSize.height / 2;
            controller.node.x = x;
            controller.node.y = y;
        }
        else {
            this._lowerLWindow.addChild(controller.node);
            controller.node.x = 0;
            controller.node.y = 0;
        }
    }

    /**
     * 增加右下窗口
     * @param controller 视图控制器
     * @param nextTo 是否贴紧边缘
     */
    public AddLowerRWindow(controller: UIViewController, nextTo: boolean): void {
        controller.priority = ++this._priority;
        if (nextTo) {
            this._lowerRWindow.addChild(controller.node);
            let contenSize: cc.Size = this._lowerRWindow.getContentSize();
            let controllerSize: cc.Size = controller.node.getContentSize();
            let x: number = this._lowerRWindow.x + contenSize.width / 2 - controllerSize.width / 2;
            let y: number = this._lowerRWindow.y - contenSize.height / 2 - controllerSize.height / 2;
            controller.node.x = x;
            controller.node.y = y;
        }
        else {
            this._lowerRWindow.addChild(controller.node);
            controller.node.x = 0;
            controller.node.y = 0;
        }
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