import { EventSystem } from "../event/EventSystem";
import { Facade } from "../puremvc";
import { SceneManager } from "./SceneManager";
import { setParentType } from "../decorator/Decorator";
import { cck_initial_asset_info, IGameWorld, ISceneManager, IViewComplete, IViewProgress, IWindowBase, ViewComplete, ViewProgress } from "../lib.cck";
import { director, Game, game, ISchedulable, Node, Prefab, Scheduler } from "cc";
import { STARTUP } from "../Define";
import { UUID } from "../utils";
import { Res } from "../res/Res";
import { Platform } from "./AppEnum";
import { DataSave } from "./file-save";


/**
 * author: HePeiDong
 * 
 * date: 2019/9/13
 * 
 * name: 游戏主程序类
 * 
 * description: 包含了游戏MVC下主要子程序，负责MVC分配消息给相应的子程序
 */
export class CCGameWorld extends Facade implements IGameWorld, ISchedulable {
    private _id: string;
    private _uuid: string;
    private _versions: string;
    private _startup: boolean;
    private _regUpdated: boolean;
    private _platform: number;
    private _sceneManager: ISceneManager;
    private _onViewProgress: IViewProgress<ViewProgress, CCGameWorld>;
    private _onViewComplete: IViewComplete<ViewComplete, CCGameWorld>;
   
    constructor() {
        super();
        this._id = "GameWorld." + STARTUP.name;
        this._uuid = UUID.randomUUID();
        this._platform   = Platform.PREVIEW;
        this._versions   = '0.0.0';
        this._startup = false;
        this._regUpdated = false;
        this._sceneManager    = new SceneManager();
        this._onViewProgress  = new EventSystem.Signal(this);
        this._onViewComplete  = new EventSystem.Signal(this);

        game.on(Game.EVENT_HIDE, this.onBackground, this);
        game.on(Game.EVENT_SHOW, this.onForeground, this);
    }

    private get startScene(): string { return this["_startScene"]; }

    public get id() { return this._id; }
    public get uuid() { return this._uuid; }
    public get platform(): number { return this._platform; }
    public get sceneManager() { return this._sceneManager; }
    public get onViewProgress(): IViewProgress<ViewProgress, CCGameWorld> { return this._onViewProgress; }
    public get onViewComplete(): IViewComplete<ViewComplete, CCGameWorld> { return this._onViewComplete; }


    public static getInstance() {
        return Facade.getInstance() as IGameWorld;
    }

    public init(mask: Prefab, wait: Prefab, touchEffect: Prefab) {
        if (!this._startup) {
            this._startup = true;
            new Res(this.listAsset());
            DataSave.instance.init();
            this._sceneManager.setMask(mask);
            this._sceneManager.setViewWait(wait);
            this._sceneManager.setTouchEffect(touchEffect);
             //设置初始场景
             this._sceneManager.setScene(this.startScene);
             this.startup();
        }
        this.regUpdate();
    }

    public setPlatform(platform: number) {
        this._platform = platform;
    }

    private regUpdate() {
        if (!this._regUpdated) {
            this._regUpdated = true;
            const scheduler: Scheduler = director.getScheduler();
            Scheduler.enableForTarget(this);
            scheduler.scheduleUpdate(this, -1, false);
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
    protected startup(): void{}
    /**
     * 游戏进入后台 
     * 请注意，在 WEB 平台，这个事件不一定会 100% 触发，这完全取决于浏览器的回调行为。
     * 在原生平台，它对应的是应用被切换到后台事件，下拉菜单和上拉状态栏等不一定会触发这个事件，这取决于系统行为。
     */
    protected onBackground(): void{}
    /**
     * 进入前台 
     * 请注意，在 WEB 平台，这个事件不一定会 100% 触发，这完全取决于浏览器的回调行为。
     * 在原生平台，它对应的是应用被切换到前台事件。
     */
    protected onForeground(): void{}
    /**可以打开WinForm */
    public canOpenWinForm(accessId: string): boolean { return true; }
    /**每一帧刷新的回调 */
    update(dt: number): void {}
}

setParentType("gameWorld", CCGameWorld);