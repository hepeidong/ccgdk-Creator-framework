import { Controller } from "./Controller";

/**
 * author: HePeiDong
 * date: 2019/9/13
 * name: 层级管理器
 * description: 还有窗口队列需要去设计实现完善，对游戏层进行管理，例如把窗口增加到游戏层里面，
 *              还有对窗口队列进行管理。
 */

export abstract class LayerManager {
    private _canDel: boolean;
    protected _list: Controller[]|kit.PriorityQueue<{priority: number, view: Controller}>;
    constructor(canDel: boolean, TypeList: typeof Array|typeof kit.PriorityQueue) {
        this._canDel = canDel;
        if (TypeList === Array) {
            this._list = new TypeList();
        }
        else if (TypeList === kit.PriorityQueue) {
            //从大到小排列，优先级小的在后面弹出
            this._list = new TypeList((a: {priority: number, view: Controller}, b: {priority: number, view: Controller}) => {
                return a.priority > b.priority;
            });
        }
        
    }

    public SetVisible(visible: boolean) {
        for (let ele of this._list) {
            if (visible) {
                if (ele instanceof Controller) {
                    ele.HideView();
                }
                else {
                    ele.view.HideView();
                }
            }
        }
    }

    public get CanDel(): boolean {
        return this._canDel;
    }

    abstract AddView(view: Controller): void;

    abstract DelView(cleanup: boolean): boolean;

    public HasView(view: Controller): boolean {
        for (let ele of this._list) {
            if (ele === view) {
                return true;
            }
        }
        return false;
    }

    public RemoveView(view: Controller): boolean {
        for (let i: number = 0; i < this._list.length; ++i) {
            let ele: Controller;
            if (this._list[i] instanceof Controller) {
                ele = this._list[i] as Controller;
            }
            else {
                ele = (this._list[i] as {priority: number, view: Controller}).view;
            }
            if (ele === view) {
                view.ExitView();
                if (this._list instanceof Array) {
                    this._list.splice(i, 1);
                }
                else {
                    this._list.Delete(i);
                }
                return true;
            }
        }
        return false;
    }

    public Clear(): void {
        for (let ele of this._list) {
            if (ele instanceof Controller) {
                ele.ExitView();
            }
            else {
                ele.view.ExitView();
            }
        }
        if (this._list instanceof Array) {
            this._list.splice(0, this._list.length);
        }
        else {
            this._list.Clear();
        }
    }

    public GetCount(): number { return this._list.length; }

    /**
     * 增加到右边窗口
     * @param node 视图结点
     */
    protected AddToRootWindow(node: cc.Node): void {
        kit.WindowView.Instance.AddRootWindow(node);
    }

    /**
     * 增加到中间窗口
     * @param node 视图结点
     */
    protected AddToCenterWindow(node: cc.Node): void {
        kit.WindowView.Instance.AddCenterWindow(node);
    }

    /**
     * 增加到顶层窗口
     * @param node 视图结点
     */
    protected AddToTopWindow(node: cc.Node): void {
        kit.WindowView.Instance.AddTopWindow(node);
    }
}