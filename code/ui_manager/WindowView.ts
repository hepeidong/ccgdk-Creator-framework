import { UIViewController } from "./UIViewController";


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
        //确定窗口结构，各窗口的大小
        this._upWindow.setContentSize(canvasSize.width, canvasSize.height / 2);
        this._downWindow.setContentSize(canvasSize.width, canvasSize.height / 2);
        this._centerWindow.setContentSize(canvasSize);
        this._leftWindow.setContentSize(canvasSize.width / 2, canvasSize.height);
        this._rightWindow.setContentSize(canvasSize.width / 2, canvasSize.height);
        this._upperLWindow.setContentSize(canvasSize.width / 2, canvasSize.height / 2);
        this._upperRWindow.setContentSize(canvasSize.width / 2, canvasSize.height / 2);
        this._lowerLWindow.setContentSize(canvasSize.width / 2, canvasSize.height / 2);
        this._lowerRWindow.setContentSize(canvasSize.width / 2, canvasSize.height / 2);

        //把窗口加入到canvas
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
        controller.priority = ++this._priority;
        this.addToWindow(this._upWindow, controller, UIViewController.PositionType.UP, nextTo);
    }

    /**
     * 增加下方窗口
     * @param controller 视图控制器
     * @param nextTo 是否贴紧边缘
     */
    public AddDownWindow(controller: UIViewController, nextTo: boolean): void {
        controller.priority = ++this._priority;
        this.addToWindow(this._downWindow, controller, UIViewController.PositionType.DOWN, nextTo);
    }

    /**
     * 增加左边窗口
     * @param controller 视图控制器
     * @param nextTo 是否贴紧边缘
     */
    public AddLeftWindow(controller: UIViewController, nextTo: boolean): void {
        controller.priority = ++this._priority;
        this.addToWindow(this._leftWindow, controller, UIViewController.PositionType.LEFT, nextTo);
    }

    /**
     * 增加右边窗口
     * @param controller 视图控制器
     * @param nextTo 是否贴紧边缘
     */
    public AddRightWindow(controller: UIViewController, nextTo: boolean): void {
        controller.priority = ++this._priority;
        this.addToWindow(this._rightWindow, controller, UIViewController.PositionType.RIGHT, nextTo);
    }

    /**
     * 增加中间窗口
     * @param controller 视图控制器
     */
    public AddCenterWindow(controller: UIViewController): void {
        controller.priority = ++this._priority;
        this.addToWindow(this._centerWindow, controller, UIViewController.PositionType.CENTER, false);
    }

    /**
     * 增加左上窗口
     * @param controller 视图控制器
     * @param nextTo 是否贴紧边缘
     */
    public AddUpperLWindow(controller: UIViewController, nextTo: boolean): void {
        controller.priority = ++this._priority;
        this.addToWindow(this._upperLWindow, controller, UIViewController.PositionType.UPPER_LEFT, nextTo);
    }

    /**
     * 增加右上窗口
     * @param controller 视图控制器
     * @param nextTo 是否贴紧边缘
     */
    public AddUpperRWindow(controller: UIViewController, nextTo: boolean): void {
        controller.priority = ++this._priority;
        this.addToWindow(this._upperRWindow, controller, UIViewController.PositionType.UPPER_RIGHT, nextTo);
    }

    /**
     * 增加左下窗口
     * @param controller 视图控制器
     * @param nextTo 是否贴紧边缘
     */
    public AddLowerLWindow(controller: UIViewController, nextTo: boolean): void {
        controller.priority = ++this._priority;
        this.addToWindow(this._lowerLWindow, controller, UIViewController.PositionType.LOWER_LEFT, nextTo);
    }

    /**
     * 增加右下窗口
     * @param controller 视图控制器
     * @param nextTo 是否贴紧边缘
     */
    public AddLowerRWindow(controller: UIViewController, nextTo: boolean): void {
        controller.priority = ++this._priority;
        this.addToWindow(this._lowerRWindow, controller, UIViewController.PositionType.LOWER_RIGHT, nextTo);
    }

    /**
     * 计算窗口的坐标
     * @param parentSize 
     * @param winSize 
     * @param anchorX 
     * @param anchorY 
     * @param winPos 
     */
    private getWinPos(parentSize: cc.Size, winSize: cc.Size, anchorX: number, anchorY: number, winPos: number): cc.Vec2 {
        let coefficientWidth: number;
        let coefficientHeight: number;
        let x: number = 0;
        let y: number = 0;
        //计算coefficientWidth和x坐标
        if (winPos === UIViewController.PositionType.LEFT || winPos === UIViewController.PositionType.LOWER_LEFT || winPos === UIViewController.PositionType.UPPER_LEFT) {
            coefficientWidth = anchorX;
            x = winSize.width * coefficientWidth - parentSize.width / 2;
        }
        else if (winPos === UIViewController.PositionType.RIGHT || winPos === UIViewController.PositionType.LOWER_RIGHT || winPos === UIViewController.PositionType.UPPER_RIGHT) {
            coefficientWidth = -anchorX;
            x = parentSize.width / 2 - winSize.width * coefficientWidth;
        }
        //计算coefficientHeight
        if (winPos === UIViewController.PositionType.UP || winPos === UIViewController.PositionType.UPPER_LEFT || winPos === UIViewController.PositionType.UPPER_RIGHT) {
            //视图高度的截取系数，y锚点为0时，是在节点的底部，故要锚点值减1
            coefficientHeight = anchorY -1;
            y = parentSize.height / 2 + winSize.height * coefficientHeight;
        }
        else if (winPos === UIViewController.PositionType.DOWN || winPos === UIViewController.PositionType.LOWER_LEFT || winPos === UIViewController.PositionType.LOWER_RIGHT) {
            coefficientHeight = anchorY;
            y = winSize.height * coefficientHeight - parentSize.height / 2;
        }
        return new cc.Vec2(x, y);
    }
    
    /**
     * 把视图增加到窗口
     * @param parent 窗口节点
     * @param controller 视图
     * @param winPos 方位
     * @param nextTo 是否紧挨着屏幕边缘
     */
    private addToWindow(parent: cc.Node, controller: UIViewController, winPos: number, nextTo: boolean): void {
        if (nextTo) {
            parent.addChild(controller.node);
            let contenSize: cc.Size = this._lowerRWindow.getContentSize();
            let controllerSize: cc.Size = controller.node.getContentSize();
            //紧贴着右下方边缘
            controller.node.position = this.getWinPos(contenSize, controllerSize, controller.node.anchorX, controller.node.anchorY, winPos);
        }
        else {
            parent.addChild(controller.node);
            controller.node.x = 0;
            controller.node.y = 0;
        }
        controller.PopupWindow(winPos, nextTo, true);
    }
}