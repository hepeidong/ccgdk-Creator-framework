import { EventSystem } from "../event_manager/EventSystem";
import { Facade } from "../puremvc";
import { SceneManager } from "./SceneManager";
import { setParentType } from "./Decorator";
import { App } from ".";
import { Res } from "../cck";


/**
 * author: HePeiDong
 * 
 * date: 2019/9/13
 * 
 * name: 游戏主程序类
 * 
 * description: 包含了游戏MVC下主要子程序，负责MVC分配消息给相应的子程序
 */
export class CCGameWorld extends Facade implements IGameWorld {
    private _versions: string;
    private _startScene: string;
    private _onLaunched: boolean;
    private _regUpdated: boolean;
    private _platform: App.Platform;
    private _sceneManager: ISceneManager;
    private _onViewProgress: IViewProgress<ViewProgress, CCGameWorld>;
    private _onViewComplete: IViewComplete<ViewComplete, CCGameWorld>;
   
    constructor() {
        super();
        this._platform   = App.Platform.PREVIEW;
        this._versions   = '0.0.0';
        this._onLaunched = false;
        this._regUpdated = false;
        this._sceneManager    = new SceneManager();
        this._onViewProgress  = new EventSystem.Signal(this);
        this._onViewComplete  = new EventSystem.Signal(this);

        cc.game.on(cc.game.EVENT_HIDE, this.onBackground, this);
        cc.game.on(cc.game.EVENT_SHOW, this.onFrontDesk, this);
    }

    public get platform(): App.Platform { return this._platform; }
    public get onViewProgress(): IViewProgress<ViewProgress, CCGameWorld> { return this._onViewProgress; }
    public get onViewComplete(): IViewComplete<ViewComplete, CCGameWorld> { return this._onViewComplete; }


    public static getInstance() {
        return Facade.getInstance() as IGameWorld;
    }

    public init(mask: cc.Prefab, wait: cc.Prefab, touchEffect: cc.Prefab) {
        this._sceneManager.setMask(mask);
        this._sceneManager.setViewWait(wait);
        this._sceneManager.setTouchEffect(touchEffect);
        this.regUpdate();
    }

    public addViewMaskTo(parent: cc.Node, page: IWindowBase, zIndex: number) {
        this._sceneManager.addViewMaskTo(parent, page, zIndex);
    }

    public delViewMask() {
        this._sceneManager.delViewMask();
    }

    public showWaitView() {
        this._sceneManager.showWaitView();
    }

    public hideWaitView() {
        this._sceneManager.hideWaitView();
    }

    public setPlatform(platform: App.Platform) {
        this._platform = platform;
    }

    private regUpdate() {
        if (!this._onLaunched) {
            this._onLaunched = true;
            new Res(this.listAsset());
            //设置初始场景
            this._sceneManager.setScene(this._startScene);
            this.onLaunched();
        }
        if (!this._regUpdated) {
            this._regUpdated = true;
            const scheduler: cc.Scheduler = cc.director.getScheduler();
            scheduler.enableForTarget(this);
            scheduler.scheduleUpdate(this, cc.Scheduler.PRIORITY_NON_SYSTEM, false);
        }
    }

    public setVersions(vs: string) {
        this._versions = vs;
    }

    public getVersions() {
        return this._versions;
    }

    /**列出游戏加载页面需要加载的资源 */
    protected listAsset(): cck_initial_asset_info[] {
        return [];
    }

    /**游戏启动完成 */
    protected onLaunched(): void{}
    /**游戏进入后台 */
    protected onBackground(): void{}
    /**进入前台 */
    protected onFrontDesk(): void{}
    /**可以打开WinForm */
    public canOpenWinForm(accessId: string): boolean { return true; }
    /**每一帧刷新的回调 */
    update(dt: number): void {}
}

setParentType("gameWorld", CCGameWorld);