import { EventListeners } from "../event_manager/EventListeners";
import { UIViewController } from "./UIViewController";
import { RootViewController } from "./RootViewController";
import { WindowView } from "./WindowView";

/**
 * author: HePeiDong
 * date: 2019/9/13
 * name: 层级管理器
 * description: 还有窗口队列需要去设计实现完善，对游戏层进行管理，例如把窗口增加到游戏层里面，
 *              还有对窗口队列进行管理，以及根据内存进行窗口的调度和显示，功能尚未完善。
 */
export class LayerManager extends EventListeners {
    private static _ins: LayerManager;
    private _windowView: WindowView;
    private _winQueue: cf.PriorityQueue<UIViewController | RootViewController>;
    constructor() {
        super();
        this.Init();
    }

    public static get Instance(): LayerManager {
        return this._ins = this._ins ? this._ins : new LayerManager();
    }

    public set rootViewController(root: RootViewController) {
        this._winQueue.Push(root);
        this._windowView.SetRootViewController(root);
    }

    private Init(): boolean {
        this._winQueue = new cf.PriorityQueue((a: UIViewController | RootViewController, b: UIViewController | RootViewController) => {
            //根视图放在最后面
            return a.priority < b.priority;
        });
        this._windowView = new WindowView();
        return true;
    }

    /**
     * 增加到上方窗口
     * @param controller 视图控制器
     * @param nextTo 是否紧挨着屏幕边缘
     */
    public AddToUpWindow(controller: UIViewController, nexTo: boolean = false): void {
        this._winQueue.Push(controller);
        this._windowView.AddUpWindow(controller, nexTo);
    }

    /**
     * 增加到下方窗口
     * @param controller 视图控制器
     * @param nextTo 是否紧挨着屏幕边缘
     */
    public AddToDownWindow(controller: UIViewController, nexTo: boolean = false): void {
        this._winQueue.Push(controller);
        this._windowView.AddDownWindow(controller, nexTo);
    }

    /**
     * 增加到左边窗口
     * @param controller 视图控制器
     * @param nextTo 是否紧挨着屏幕边缘
     */
    public AddToLeftWindow(controller: UIViewController, nexTo: boolean = false): void {
        this._winQueue.Push(controller);
        this._windowView.AddLeftWindow(controller, nexTo);
    }

    /**
     * 增加到右边窗口
     * @param controller 视图控制器
     * @param nextTo 是否紧挨着屏幕边缘
     */
    public AddToRightWindow(controller: UIViewController, nexTo: boolean = false): void {
        this._winQueue.Push(controller);
        this._windowView.AddRightWindow(controller, nexTo);
    }

    /**
     * 增加到中间窗口
     * @param controller 视图控制器
     */
    public AddToCenterWindow(controller: UIViewController): void {
        this._winQueue.Push(controller);
        this._windowView.AddCenterWindow(controller);
    }

    /**
     * 增加到左上窗口
     * @param controller 视图控制器
     * @param nextTo 是否紧挨着屏幕边缘
     */
    public AddToUpperLWindow(controller: UIViewController, nexTo: boolean = false): void {
        this._winQueue.Push(controller);
        this._windowView.AddUpperLWindow(controller, nexTo);
    }

    /**
     * 增加到右上窗口
     * @param controller 视图控制器
     * @param nextTo 是否紧挨着屏幕边缘
     */
    public AddToUpperRWindow(controller: UIViewController, nexTo: boolean = false): void {
        this._winQueue.Push(controller);
        this._windowView.AddUpperRWindow(controller, nexTo);
    }

    /**
     * 增加到左下窗口
     * @param controller 视图控制器
     * @param nextTo 是否紧挨着屏幕边缘
     */
    public AddToLowerLWindow(controller: UIViewController, nexTo: boolean = false): void {
        this._winQueue.Push(controller);
        this._windowView.AddLowerLWindow(controller, nexTo);
    }

    /**
     * 增加到右下窗口
     * @param controller 视图控制器
     * @param nextTo 是否紧挨着屏幕边缘
     */
    public AddToLowerRWindow(controller: UIViewController, nexTo: boolean = false): void {
        this._winQueue.Push(controller);
        this._windowView.AddLowerRWindow(controller, nexTo);
    }
}