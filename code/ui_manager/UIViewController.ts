import { UIControl } from "./UIControl"
import { IViewController } from "./IViewController";

/**
 * author: HePeiDong
 * date: 2019/9/11
 * name: 视图控制器基类
 */
export abstract class UIViewController extends UIControl implements IViewController {
    private _parent: cc.Node;
    private _accessId: number;
    private _closeOther: boolean;
    private _waitView: UIViewController;
    constructor() {
        super();
        this._closeOther = false;
    }

    protected get accessId(): number { return this._accessId; }
    protected get closeOther(): boolean { return this._closeOther; }
    

    /**
     * 打开试图
     * @param accessId 访问id，一般用于判断该id对应下的功能是否开启
     * @param closeOther 是否关闭别的页面
     * @param parent 父节
     * @param fn 加载成功显示后的回调，默认是不传入回调，为null
     * @param waitView 资源加载的面板
     */
    public OpenView(accessId: number = 0, closeOther: boolean = false, parent: cc.Node = null, fn: () => void = null, waitView: UIViewController = null): void {
        this._accessId = accessId;
        this._closeOther = closeOther;
        this._parent = parent;
        this._waitView = waitView;
        if (this._waitView) {
            this._waitView.OpenView(0, false, null, () => {
                this.LoadView(fn);
            });
        }else {
            this.LoadView(fn);
        }
    }

    /**隐藏试图 */
    public HideView(): void {
        this.node.stopAllActions();
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
        this.node.removeFromParent(cleanup);
        this.node.active = false;
        this.node.destroy();
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
        if (this._parent && this._parent !== this.node.parent) {
            if (this.node.parent) {
                this.node.removeFromParent();
            }
            this.node.parent = this._parent;
        }
        this.OnViewLoaded(view);
    }

    OnShow(): void {
        this.OnViewDidAppear();
    }
}