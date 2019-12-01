import { EventListeners } from "../event_manager/EventListeners";

/**
 * author: HePeiDong
 * date: 2019/9/13
 * name: 控制器基类
 * description: 控制器基类主要完成控制器里公共的底层功能，例如加载，显示，销毁，释放资源 
 */
export abstract class Controller extends EventListeners {
    private _uiUrl: string;               //预制体资源相对路径
    private _resUrls: string[];           //图集资源相对路劲
    private _loadedRes: boolean;          //资源是否加载了
    private _loadedView: boolean;         //预制体是否加载了
    protected _isRootView: boolean;       //是否是根视图
    private _priority: number;            //优先级
    private _assetArray: cc.SpriteAtlas[];//资源图集
    private _node: cc.Node;
    constructor() {
        super();
        this._loadedRes = false;
        this._loadedView = false;
        this._isRootView = false;
        this._priority = 0;
    }

    public get node(): cc.Node { return this._node; }
    public get isRootView(): boolean { return this._isRootView; }
    public set priority(val: number) { this._priority = val; }
    public get priority(): number { return this._priority; }

    /**
     * 设置基本信息，资源路劲
     * @param url 资源路劲
     */
    protected SetResUrl(url: string): void {
        this._resUrls.push(url);
    }

    protected UiBinding(url: string): void {
        this._uiUrl = url;
    }

    protected GetSpriteFrame(fileName: string): cc.SpriteFrame {
        if (this._assetArray && this._assetArray.length > 0) {
            let sf: cc.SpriteFrame;
            for (let i: number = 0; i < this._assetArray.length; ++i) {
                sf = this._assetArray[i].getSpriteFrame(fileName);
                if (sf) return sf;
            }
            return null;
        }
    }

    protected HideView(): void {
        let action = cc.hide();
        this.node.runAction(action);
    }

    protected ShowView(): void {
        let action = cc.show();
        this.node.runAction(action);
    }

    protected Loaded(): void {
        this._loadedView = true;
    }

    protected Destroy(): void {
        this._loadedRes = false;
        this._loadedView = false;
        this._assetArray = null;
        this.node.stopAllActions();
        cf.PoolManager.Instance.GetCurrentPool().Remove(this);
        for (let i: number = 0; i < this._resUrls.length; ++i) {
            cf.UILoader.Release(this._resUrls[i]);
        }
    }

    protected LoadView(fn: () => void): void {
        if (!this._loadedRes) {
            cf.UILoader.LoadResArray(this._resUrls, cc.SpriteAtlas, (err: Error, asset: Array<any>) => {
                if (err) {
                    throw err;
                }
                this._assetArray = asset;
                this._loadedRes = true;
            });
            if (!this._loadedView) {
                cf.UILoader.LoadRes(this._uiUrl, cc.Prefab, (err: Error, asset: any) => {
                    if (err) {
                        throw err;
                    }
                    let newNode: cc.Node = cf.UILoader.Instanitate(asset);
                    this._node = newNode;
                    fn && fn();
                    cf.PoolManager.Instance.GetCurrentPool().CheckMemory((outOfMemory) => {
                        if (!outOfMemory) {
                            this.Loaded();
                        }
                    });
                });
            }
        }
        else {
            fn && fn();
            this.Loaded();
        }
    }

}