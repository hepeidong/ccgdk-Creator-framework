import { Controller } from "./Controller"
import { IViewController } from "./IViewController";

/**窗口弹出风格 */
type StyleType = {
    /**没有特效的弹出风格 */
    NORMEL:number,
    /**淡入淡出的弹入弹出特效 */
    FADE_IN_AND_OUT:number,
    /**滑入滑出的弹入弹出特效，只在上，下，左，右四个方位适用 */
    ROLL_IN_AND_OUT:number,
    /**快速缩放的弹入弹出特效，在紧挨着窗口边缘时无效 */
    POP_UP:number
};

/**窗口位置类型 */
type PositionType = {
    UP:number,
    DOWN:number,
    CENTER:number,
    LEFT:number,
    RIGHT:number,
    UPPER_LEFT:number,
    UPPER_RIGHT:number,
    LOWER_LEFT:number,
    LOWER_RIGHT:number
}

/**
 * author: HePeiDong
 * date: 2019/9/11
 * name: 视图控制器基类
 */
export abstract class UIViewController extends Controller implements IViewController {
    private _closeOther: boolean;
    private _waitView: UIViewController;
    private static _styletype: StyleType = {
        NORMEL: 0,
        FADE_IN_AND_OUT: 1,
        ROLL_IN_AND_OUT: 2,
        POP_UP: 3
    };
    private static _postionType: PositionType = {
        UP:1,
        DOWN:2,
        CENTER:3,
        LEFT:4,
        RIGHT:5,
        UPPER_LEFT:6,
        UPPER_RIGHT:7,
        LOWER_LEFT:8,
        LOWER_RIGHT:9
    }
    private _style: number;
    private _winPos: number;//窗口位置
    private _nextTo: boolean;//是否紧挨着屏幕边缘
    constructor() {
        super();
        this._closeOther = false;
    }

    protected get closeOther(): boolean { return this._closeOther; }
    public get Style(): number { return this._style; }
    public static get StyleType(): StyleType { return this._styletype; }   
    public static get PositionType(): PositionType { return this._postionType; }
    public set WaitView(view: UIViewController) { this._waitView = view; } 

    /**
     * 打开试图
     * @param style 弹窗风格
     * @param closeOther 是否关闭别的页面
     * @param fn 加载成功显示后的回调，默认是不传入回调，为null
     */
    public OpenView(style: number, fn: () => void|null, closeOther: boolean = false): void {
        this._closeOther = closeOther;
        this._style = style;
        if (this._waitView) {
            this._waitView.OpenView(UIViewController.StyleType.NORMEL, () => {
                this.LoadView(fn);
            });
        }else {
            this.LoadView(fn);
        }
    }

    /**隐藏试图 */
    public HideView(): void {
        this.PopupWindow(this._winPos, this._nextTo, false);
        this.OnViewDidHide();
    }

    /**显示视图 */
    public ShowView(): void {
        super.ShowView();
        this.OnViewDidAppear();
    }

    /**
     * 销毁试图
     * @param cleanup 是否删除试图上面绑定的事件，action等，默认值是true
     */
    public Destroy(cleanup: boolean = true): void {
        super.Destroy();
        this.PopupWindow(this._winPos, this._nextTo, false);
        this._closeOther = false;
        this._waitView = null;
        this.node.removeFromParent(cleanup);
        this.node.active = false;
        this.node.destroy();
        this.OnViewDidDisappear();
    }

    /***************控制器生命周期函数***************/
    /**试图加载完调用 */
    abstract OnViewLoaded(): void;
    /**试图显示后调用 */
    abstract OnViewDidAppear(): void;
    /**试图隐藏后调用 */
    abstract OnViewDidHide(): void;
    /**试图销毁后调用 */
    abstract OnViewDidDisappear(): void;

    Loaded(): void {
        super.Loaded();
        this._waitView.HideView();
        this.OnViewLoaded();
        this.ShowView();
    }

    /**
     * 弹出窗口
     * @param winPos 窗口位置
     * @param nextTo 是否紧挨着屏幕边缘
     * @param isShow 是否显示
     */
    public PopupWindow(winPos: number, nextTo: boolean, isShow: boolean): void {
        this._winPos = winPos;
        this._nextTo = nextTo;
        if (this.Style == UIViewController.StyleType.FADE_IN_AND_OUT) {
            this.fadeInAndOut(isShow);
        }
        else if (this.Style == UIViewController.StyleType.ROLL_IN_AND_OUT) {
            this.rollInAndOut(isShow, nextTo, winPos);
        }
        else if (this.Style == UIViewController.StyleType.POP_UP) {
            this.popUp(nextTo, isShow);
        }
        else {
            super.HideView();
        }
    }

    /**渐显渐隐效果 */
    private fadeInAndOut(isShow: boolean): void {
        let action: cc.ActionInterval;
        if (isShow) {
            this.node.opacity = 0;
            action = cc.fadeIn(0.5);
        }
        else {
            action = cc.fadeOut(0.5);
        }
        let seq: any = cc.sequence(action, cc.callFunc(() => {
            super.HideView();
        }, this));
        this.node.runAction(seq);
    }
    /**滑入滑出效果，只在上，下，左，右四个方位适用 */
    private rollInAndOut(isShow: boolean, nextTo: boolean, winPos: number): void {
        if (!nextTo) return;
        let tempPos: cc.Vec2 = new cc.Vec2(this.node.x, this.node.y);
        let v: number = 100;//每0.1秒滑动100像素
        let t: number;//时间
        if (winPos === UIViewController.PositionType.LEFT) {
            if (isShow) {
                this.node.x = tempPos.x - this.node.width;
            }
            else {
                tempPos.x = tempPos.x - this.node.width;
            }
            t = this.node.width / v;
        }
        else if (winPos === UIViewController.PositionType.RIGHT) {
            if (isShow) {
                this.node.x = tempPos.x + this.node.width;
            }
            else {
                tempPos.x = tempPos.x + this.node.width;
            }
            t = this.node.width / v;
        }
        else if (winPos === UIViewController.PositionType.UP) {
            if (isShow) {
                this.node.y = tempPos.y + this.node.height;
            }
            else {
                tempPos.y = tempPos.y + this.node.height;
            }
            
            t = this.node.height / v;
        }
        else if (winPos === UIViewController.PositionType.DOWN) {
            if (isShow) {
                this.node.y = tempPos.y - this.node.height;
            }
            else {
                tempPos.y = tempPos.y - this.node.height;
            }
            
            t = this.node.height / v;
        }
        
        let action: cc.ActionInterval = cc.moveTo(t, tempPos);
        let seq: any = cc.sequence(action, cc.callFunc(() => {
            super.HideView();
        }, this));
        this.node.runAction(seq);
    }

    //快速缩放的弹入弹出特效，在紧挨着窗口边缘时无效
    private popUp(nextTo: boolean, isShow: boolean): void {
        if (nextTo) return;
        let action: cc.ActionInterval;
        if (isShow) {
            this.node.scale = 0;
            let swellAction: cc.ActionInterval = cc.scaleTo(0.2, 1.2, 1.2);
            let shrinkAction: cc.ActionInterval = cc.scaleTo(0.1, 1, 1);
            action = cc.sequence(swellAction, shrinkAction);
        }
        else {
            action = cc.scaleTo(0.2, 0, 0);
        }
        let seq: any = cc.sequence(action, cc.callFunc(() => {
            super.HideView();
        }, this));
        this.node.runAction(seq);
    }
}