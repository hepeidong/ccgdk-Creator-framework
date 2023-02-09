import { Debug } from "../cck/Debugger";
import { SAFE_CALLBACK } from "../Define";
import { Mediator } from "../puremvc";
import { Register } from "../Register/Register";
import { Utils } from "../utils";
import { Assert } from "../exceptions/Assert";
import { App } from ".";
import { Res } from "../cck";
import { UI } from "../ui_manager";

/**
 * author: HePeiDong
 * 
 * date: 2020/5/20
 * 
 * name: 游戏场景状态管理类
 *
 * description: 负责游戏场景的加载，跳转，释放，回退的管理。游戏中场景的跳转，应该写在其子类里，以方便维护，每一个场景都要构建一个子类，用以管理该场景。
 *              必要时，需要指定场景所在的资源包，即便场景资源所在的资源包为resources，也要指定，指定资源包的方式是通过bundle装饰器来指定。
 */
export class SceneBase<T extends IBaseView> extends Mediator implements IScene {
    private _fromAssetBundle: boolean;
    private _assetPath: string;
    private _sceneName: string;
    private _bundleName: string;
    private _type: App.SceneType;
    private _scene: cc.Scene;
    private _canvas: cc.Node;
    private _sceneManager: ISceneManager;
    private _register: Register;
    constructor(sceneName: string, sceneManager: ISceneManager) {
        super(sceneName);
        this._fromAssetBundle = false;
        this._sceneName       = sceneName;
        this._sceneManager    = sceneManager;
        this._register        = new Register();
        cc.director.getScheduler().enableForTarget(this);
    }

    public get type() { return this._type; }
    public get sceneName() { return this._sceneName; }
    public get canvas() { return this._canvas; }
    protected get view(): T { return this.viewComponent; }
    protected get manager() { return this._sceneManager; }

    public setSceneType() {
        this._type = this.onCreate(this._register);
        const message = `“${this._sceneName}” 场景缺少场景类型，请重写onCreate函数，设置场景类型。`;
        Assert.instance.handle(Assert.Type.InitSceneTypeException, this._type, message);
    }

    public loadScene(onComplete?: Function) {
        if (typeof this._bundleName !== 'string') {
            //没有设置资源包
            this.load(null, onComplete);
        }
        else if (this._bundleName === cc.resources.name) {
            this.load(Res.loader, onComplete);
        }
        else {
            if (Res.hasLoader(this._bundleName)) {
                this.load(Res.getLoader(this._bundleName), onComplete);
            }
            else {
                Res.createLoader(this._bundleName).then(loader => {
                    this.load(loader, onComplete);
                }).catch(e => {
                    Debug.error(e);
                });
            }
        }
    }

    public destroy(wait: cc.Node) {
        if (wait) {
            wait.removeFromParent(false);
        }
        UI.clear();
        //取消定时器
        cc.director.getScheduler().unscheduleUpdate(this);
    }

    public runScene(wait: cc.Node, hasTouchEffect: boolean, ...args: any[]) {
        Debug.log(this.toString(), "运行场景");
        if (this._scene && this._fromAssetBundle) {
            cc.director.runScene(this._scene);
        }
        else {
            this._scene = cc.director.getScene();
            this._canvas = this._scene.getChildByName("Canvas");
        }
        UI.initWindowLayer(this.canvas, hasTouchEffect);
        this.addWaitToCanvas(wait);
        this.onStart(...args);
        //设置update定时器调度
        cc.director.getScheduler().scheduleUpdate(this, cc.Scheduler.PRIORITY_NON_SYSTEM + 1, false);
    }

    private load(loader: ILoader, onComplete: Function) {
        if (loader) {
            loader.loadScene(this._assetPath, (err, asset) => {
                if (Assert.instance.handle(Assert.Type.LoadSceneException, err, this._sceneName)) {
                    this._fromAssetBundle = true;
                    this.initView(asset.scene);
                    this.onLoad();
                    SAFE_CALLBACK(onComplete);
                }
            });
        }
        else {
            cc.director.loadScene(this._assetPath, () => {
                this.initView(cc.director.getScene());
                this.onLoad();
                SAFE_CALLBACK(onComplete);
            });
        }
    }

    private initView(scene: cc.Scene) {
        this._scene = scene;
        this._canvas = this._scene.getChildByName("Canvas");
        const components = this.canvas.getComponents(UI.BaseView);
        if (components.length > 0) {
            this.setViewComponent(components[0]);
        }
    }

    private addWaitToCanvas(wait: cc.Node) {
        if (wait)  {
            this.canvas.addChild(wait);
        }
    }

    listNotificationInterests(): string[] {
        return this._register.getNotificationNames();
    }

    handleNotification(notification: INotification): void {
        this._register.handle(notification);
    }

    /**************************周期函数***************************/
    /**
     * 场景类创建时运行，游戏中，一个场景类只会运行一次此函数
     * @param register 注册器，调用注册器的reg函数，注册消息通知
     * @example
     *  onCreate(register: IRegister) {
     *      register.reg("testNotification", (body: any, type: string) => {
     *          console.log("消息通知传过来的数据", body);
     *      }, this);
     *      return App.SceneType.Normal;
     * }
     */
    onCreate(register: IRegister) { return App.SceneType.NONE; }
    /**
     * 场景加载完调用，只有场景加载后会调用
     * @param register 注册器，调用注册器的reg函数，注册消息通知
     * @example
     *  onLoad(register: IRegister) {
     *      register.reg("testNotification", (body: any, type: string) => {
     *          console.log("消息通知传过来的数据", body);
     *      }, this);
     * }
     */
    onLoad(): void { }
    /**场景加载成功转换后调用的方法, 可在此做一些资源加载 */
    onStart(...args: any[]) {}
    /**新的场景启动前调用的方法，会在场景销毁后，以及一系列自动释放资源后调用，可在此做一些资源释放 */
    onEnd() {}
    /**场景状态更新 */
    update(dt: number) {}
    /****************************************************************/

    public toString() {
        return Utils.StringUtil.format("[Scene:%s]", this._sceneName);
    }
}
