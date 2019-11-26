import { EventListeners } from "../event_manager/EventListeners";
import { UIViewController } from "./UIViewController";
import { RootViewController } from "./RootViewController";
import { WindowView } from "./WindowView";

/**
 * author: HePeiDong
 * date: 2019/9/13
 * name: 窗口类
 */
export class UIWindow extends EventListeners {
    private _rootViewController: RootViewController;
    private _windowView: WindowView;
    private _winQueue: cf.PriorityQueue<UIViewController | RootViewController>;
    constructor() {
        super();
        this.On(cf.EventName.DESIGN_OUT_OF_MEMORY, this, this.OnDeleteView);
        this.Init();
    }

    public set rootViewController(root: RootViewController) {
        if (this._rootViewController) {
            this._rootViewController.Destroy();
        }
        this._rootViewController = root;
        this._rootViewController.ViewLoad();
    }

    public get rootViewController(): RootViewController {
        return this._rootViewController;
    }

    public Init(): boolean {
        this._winQueue = new cf.PriorityQueue((a: UIViewController | RootViewController, b: UIViewController | RootViewController) => {
            //根视图放在最后面
            return a.priority < b.priority;
        });
        this._rootViewController = null;
        this._windowView = new WindowView();
        return true;
    }

    public AddTopWindow(controller: UIViewController): void {
        this._windowView.topViewController = controller;
    }

    public AddDownWindow(controller: UIViewController): void {
        this._windowView.downViewController = controller;
    }

    public AddLeftWindow(controller: UIViewController): void {
        this._windowView.leftViewController = controller;
    }

    public AddRightWindow(controller: UIViewController): void {
        this._windowView.rightViewController = controller;
    }

    public AddCentreWindow(controller: UIViewController): void {
        this._windowView.centreViewController = controller;
    }

    private OnDeleteView(): void {
        let view: UIViewController | RootViewController = this._winQueue.Pop();
        if (this._winQueue.Length > 1) {
            if (!view.isRootView) {
                view.Destroy();
            }
        }
        else {
            view.Destroy();
            throw new Error('设计内存不足，无法显示页面');
        }
    }
}