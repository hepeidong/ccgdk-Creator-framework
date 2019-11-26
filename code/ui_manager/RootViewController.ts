import { UIControl } from "./UIControl";
import { IViewController } from "./IViewController";
/**
 * author: HePeiDong
 * date: 2019/9/11
 * name: 根视图控制器
 */
export abstract class RootViewController extends UIControl implements IViewController{
    private _rootView: cc.Node;
    private _canvas: cc.Node;
    private _waitView: RootViewController;
    constructor() {
        super();
        this._canvas = cc.director.getScene().getChildByName('Canvas');
        this._isRootView = true;
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
        this._rootView = view;
        this._canvas.addChild(view);
        this.OnViewLoaded(view);
    }
    OnShow(): void {
        this.OnViewDidAppear();
    }

    /**
     * 视图加载显示 
     * @param waitView 资源加载的面板
     * @param fn 加载成功显示后的回调，默认是不传入回调，为null
     */
    public ViewLoad(waitView: RootViewController = null, fn: ()=>void = null): void {
        this._waitView = waitView;
        if (this._waitView) {
            this._waitView.ViewLoad(null, () => {
                this.LoadView(fn);
            });
        }else {
            this.LoadView(fn);
        }
    }

    public HideView(): void {
        this._rootView.stopAllActions();
        this.OnViewDidHide();
    }

     /**
     * 销毁试图
     * @param cleanup 是否删除试图上面绑定的事件，action等，默认值是true
     */
    public Destroy(cleanup: boolean = true): void {
        super.Destroy();
        this._waitView = null;
        this._rootView.removeFromParent(cleanup);
        this._rootView.active = false;
        this._rootView.destroy();
        this._rootView = null;
        this.OnViewDidDisappear();
    } 
    
}