import { Controller } from "./Controller";
import { IViewController } from "./IViewController";
/**
 * author: HePeiDong
 * date: 2019/9/11
 * name: 根视图控制器
 * description: 游戏中同一时刻，只允许有一个根视图运行，根视图控制的ui节点，直接附加在canvas下，根视图类似于电脑
 *              或者手机的桌面，普通的ui视图则类似于桌面上运行的应用，大概思想就是这样。
 */
export abstract class RootViewController extends Controller implements IViewController{
    private _canvas: cc.Node;
    private _waitView: RootViewController;
    constructor() {
        super();
        this._canvas = cc.director.getScene().getChildByName('Canvas');
        this._isRootView = true;
    }

    public set WaitView(view: RootViewController) { this._waitView = view; } 
    public get WaitView(): RootViewController { return this._waitView; }

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
        this._waitView.HideView();
        this._canvas.addChild(this.node);
        this.OnViewLoaded();
        this.ShowView();
    }
    /**
     * 视图加载显示 
     * @param fn 加载成功显示后的回调，默认是不传入回调，为null
     */
    public ViewLoad(fn: ()=>void = null): void {
        if (this._waitView) {
            this._waitView.ViewLoad(() => {
                this.LoadView(fn);
            });
        }else {
            this.LoadView(fn);
        }
    }

    /**隐藏试图 */
    public HideView(): void {
        super.HideView();
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
        this._waitView = null;
        this.node.removeFromParent(cleanup);
        this.HideView();
        this.node.destroy();
        this.OnViewDidDisappear();
    } 
    
}