import { UIViewController } from "./UIViewController";
import { RootViewController } from "./RootViewController";
import { UIWindow } from "./UIWindow";

/**
 * author: HePeiDong
 * date: 2019/9/13
 * name: 主视图控制器
 */
export class MainViewController {
    private static _ins: MainViewController;
    private _window: UIWindow;
    constructor() {
        this.InitRootViewController();
    }

    public static get Instance(): MainViewController {
        return this._ins = this._ins ? this._ins : new MainViewController();
    }

    private InitRootViewController(): void {
        this._window = new UIWindow();
        //在下面加上初始的页面
        /**
          例如   
            //TestViewController继承自RootViewController
            let testViewController = new TestViewController();
            this.rootViewController = testViewController;
         */
    }

    public set rootViewController(controller: RootViewController) {
        this._window.rootViewController = controller;
    }

    public AddTopWindow(controller: UIViewController): void {
        this._window.AddTopWindow(controller);
    }

    public AddDownWindow(controller: UIViewController): void {
        this._window.AddTopWindow(controller);
    }

    public AddLeftWindow(controller: UIViewController): void {
        this._window.AddTopWindow(controller);
    }

    public AddRightWindow(controller: UIViewController): void {
        this._window.AddTopWindow(controller);
    }

    public AddCentreWindow(controller: UIViewController): void {
        this._window.AddTopWindow(controller);
    }

    public HideView(): void {
        this._window.rootViewController.HideView();
    }

    public Destroy(): void {
        this._window.rootViewController.Destroy();
    }
}