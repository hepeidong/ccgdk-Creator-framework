import { UIControl } from "./UIControl"
import { IViewController } from "./IViewController";
import { MainViewController } from "./MainViewController";

/**
 * author: HePeiDong
 * date: 2019/9/11
 * name: 视图控制器基类
 */
export abstract class UIViewController extends UIControl implements IViewController {
    private _view: cc.Node;
    private _parent: cc.Node;
    private _accessId: number;
    private _closeOther: boolean;
    private _winPos: number;
    private _waitView: UIViewController;
    /**不增加到窗口视图中 */
    public static NONE: number = 0;
    /**增加到上窗口视图中 */
    public static ON_THE_TOP: number = 1;
    /**增加到下窗口视图中 */
    public static ON_THE_DOWN: number = 2;
    /**增加到左窗口视图中 */
    public static ON_THE_LEFT: number = 3;
    /**增加到右窗口视图中 */
    public static ON_THE_RIGHT: number = 4;
    /**增加到中间窗口视图中 */
    public static ON_THE_CENTRE: number = 5;
    constructor() {
        super();
        this._closeOther = false;
    }

    public get view(): cc.Node { return this._view; }
    protected get accessId(): number { return this._accessId; }
    protected get closeOther(): boolean { return this._closeOther; }
    

    /**
     * 打开试图
     * @param accessId 访问id，一般用于判断该id对应下的功能是否开启
     * @param closeOther 是否关闭别的页面
     * @param winPos 窗口视图的位置，默认为NONE,当传入的值不为NONE时，不需要传入父节点参数，反之则必须传入
     * @param parent 父节
     * @param fn 加载成功显示后的回调，默认是不传入回调，为null
     * @param waitView 资源加载的面板
     */
    public OpenView(accessId: number = 0, closeOther: boolean = false, winPos: number = UIViewController.NONE, parent: cc.Node = null, fn: () => void = null, waitView: UIViewController = null): void {
        this._accessId = accessId;
        this._closeOther = closeOther;
        this._winPos = winPos;
        this._parent = parent;
        this._waitView = waitView;
        if (this._waitView) {
            this._waitView.OpenView(0, false, UIViewController.NONE, null, () => {
                this.LoadView(fn);
            });
        }else {
            this.LoadView(fn);
        }
    }

    /**隐藏试图 */
    public HideView(): void {
        this._view.stopAllActions();
        this.OnViewDidHide();
    }

    /**
     * 销毁试图
     * @param cleanup 是否删除试图上面绑定的事件，action等，默认值是true
     */
    public Destroy(cleanup: boolean = true): void {
        super.Destroy();
        this._accessId = 0;
        this._parent = null;
        this._closeOther = false;
        this._waitView = null;
        this._view.removeFromParent(cleanup);
        this._view.active = false;
        this._view.destroy();
        this._view = null;
        this.OnViewDidDisappear();
    }

    /***************控制器生命周期函数***************/
    /**试图加载完调用 */
    abstract OnViewLoaded(view: cc.Node): void;
    /**试图显示后调用 */
    abstract OnViewDidAppear(): void;
    /**试图隐藏后调用 */
    abstract OnViewDidHide(): void;
    /**试图销毁后调用 */
    abstract OnViewDidDisappear(): void;

    OnLoad(view: cc.Node): void {
        this._waitView.HideView();
        this._view = view;
        if (this._winPos == UIViewController.NONE) {
            if (this._parent != this._view.parent) {
                if (this._view.parent) {
                    this._view.removeFromParent();
                }else if (!this._parent) {
                    throw new Error('窗口类型为NONE时，没有传入父节');
                }
                this._view.parent = this._parent;
            }
        }
        else {
            this.AddToWindowView();
        }
        this.OnViewLoaded(view);
    }

    OnShow(): void {
        this.OnViewDidAppear();
    }

    private AddToWindowView(): void {
        if (this._winPos == UIViewController.ON_THE_TOP) {
            MainViewController.Instance.AddTopWindow(this);
        }else if (this._winPos == UIViewController.ON_THE_DOWN) {
            MainViewController.Instance.AddDownWindow(this);
        }else if (this._winPos == UIViewController.ON_THE_LEFT) {
            MainViewController.Instance.AddLeftWindow(this);
        }else if (this._winPos == UIViewController.ON_THE_RIGHT) {
            MainViewController.Instance.AddRightWindow(this);
        }else if (this._winPos == UIViewController.ON_THE_CENTRE) {
            MainViewController.Instance.AddCentreWindow(this);
        }
    }
}