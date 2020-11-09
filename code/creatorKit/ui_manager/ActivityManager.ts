import { LayerManager } from "./LayerManager";
import { Controller } from "./Controller";

/**
 * author: HePeiDong
 * date: 2020/7/4
 * name: 活动ui管理器
 * description: 管理进入游戏中弹出的各种活动ui，采用优先级管理，优先级越高，越早弹出，优先队列存储方式。
 */
export default class ActivityManager extends LayerManager {
    private _priority: number;
    constructor(canDel: boolean) {
        super(canDel, kit.PriorityQueue);
        this._priority = 0;
    }

    public SetPriority(priority: number) {
        this._priority = priority;
    }

    addView(view: Controller): void {
        const list: kit.PriorityQueue<{priority: number, view: Controller}> = this._list as kit.PriorityQueue<{priority: number, view: Controller}>;
        list.push({priority: this._priority, view: view});
        this.addToCenterWindow(view.node)
    }

    delView(cleanup: boolean): boolean {
        const list: kit.PriorityQueue<{priority: number, view: Controller}> = this._list as kit.PriorityQueue<{priority: number, view: Controller}>;
        if (list.length > 0) {
            const view: Controller = list.pop().view;
            view.exitView(cleanup);
            return true;
        }
        return false;
    }
}