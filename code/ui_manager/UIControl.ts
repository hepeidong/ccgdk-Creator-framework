interface IControl {
    OnLoad(view: cc.Node): void;
    OnShow(): void;
}

/**
 * author: HePeiDong
 * date: 2019/9/13
 * name: ui控制基类
 */
export abstract class UIControl implements IControl {
    private _uiUrl: string;               //预制体资源相对路径
    private _resUrls: string[];           //图集资源相对路劲
    private _loadedRes: boolean;          //资源是否加载了
    private _loadedView: boolean;         //预制体是否加载了
    protected _isRootView: boolean;       //是否是根视图
    private _priority: number;            //优先级
    private _assetArray: cc.SpriteAtlas[];//资源图集
    private _node: cc.Node;
    constructor() {
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

    abstract OnLoad(view: cc.Node): void;
    abstract OnShow(): void;

    protected Destroy(): void {
        this._loadedRes = false;
        this._loadedView = false;
        this._assetArray = null;
        for (let i: number = 0; i < this._resUrls.length; ++i) {
            cf.UILoader.Release(this._resUrls[i]);
        }
    }

    protected LoadView(fn: () => void): void {
        if (!this._loadedView) {
            cf.UILoader.LoadRes(this._uiUrl, cc.Prefab, (err: Error, asset: any) => {
                if (err) {
                    throw err;
                }
                this._loadedView = true;
                let newNode: cc.Node = cf.UILoader.Instanitate(asset);
                this._node = newNode;
                this.OnLoad(newNode);
                if (!this._loadedRes) {
                    cf.UILoader.LoadResArray(this._resUrls, cc.SpriteAtlas, (err: Error, asset: Array<any>) => {
                        if (err) {
                            throw err;
                        }
                        this._assetArray = asset;
                        this._loadedRes = true;
                        fn && fn();
                        this.OnShow();
                    });
                }
            });
        }
        else {
            fn && fn();
            this.OnShow();
        }
    }

}