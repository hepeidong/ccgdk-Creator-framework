import { Controller } from "./Controller";
import { PriorityQueue } from "../data_struct/PriorityQueue";

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
        if (TypeList === typeof Array) {
            this._list = new TypeList();
        }
        else if (TypeList === typeof kit.PriorityQueue) {
            //从大到小排列，优先级小的在后面弹出
            this._list = new TypeList((a: {priority: number, view: Controller}, b: {priority: number, view: Controller}) => {
                return a.priority > b.priority;
            });
        }
    }

    public setVisible(visible: boolean) {
        for (let i: number = 0; i < this._list.length; ++i) {
            if (visible) {
                if (this._list[i] instanceof Controller) {
                    (this._list[i] as Controller).hideView();
                }
                else {
                    (this._list as kit.PriorityQueue<{priority: number, view: Controller}>)[i].view.hideView();
                }
            }
        }
    }

    public get CanDel(): boolean {
        return this._canDel;
    }

    abstract addView(view: Controller): void;

    abstract delView(cleanup: boolean): boolean;

    public HasView(view: Controller): boolean {
        for (let i: number = 0; i < this._list.length; ++i) {
            if (this._list[i] === view) {
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
                view.exitView();
                if (this._list instanceof Array) {
                    this._list.splice(i, 1);
                }
                else {
                    this._list.delete(i);
                }
                return true;
            }
        }
        return false;
    }

    public clear(): void {
        for (let i: number = 0; i < this._list.length; ++i) {
            if (this._list[i] instanceof Controller) {
                (this._list[i] as Controller).exitView();
            }
            else {
                (this._list as kit.PriorityQueue<{priority: number, view: Controller}>)[i].view.exitView();
            }
        }
        if (this._list instanceof Array) {
            this._list.splice(0, this._list.length);
        }
        else {
            this._list.clear();
        }
    }

    public GetCount(): number { return this._list.length; }

    /**
     * 增加到右边窗口
     * @param node 视图结点
     */
    protected AddToRootWindow(node: cc.Node): void {
        kit.WindowView.Instance.addRootWindow(node);
    }

    /**
     * 增加到中间窗口
     * @param node 视图结点
     */
    protected addToCenterWindow(node: cc.Node): void {
        kit.WindowView.Instance.addCenterWindow(node);
    }

    /**
     * 增加到顶层窗口
     * @param node 视图结点
     */
    protected AddToTopWindow(node: cc.Node): void {
        kit.WindowView.Instance.addTopWindow(node);
    }
}