import { LayerManager } from "./LayerManager";
import { Controller } from "./Controller";

/**
 * author: HePeiDong
 * date: 2020/7/4
 * name: 根视图ui管理器
 * description: 根视图ui管理，队列存储方式。
 */
export default class RootManager extends LayerManager {
    constructor (canDel: boolean) {
        super(canDel, Array);
    }

    addView(view: Controller) {
        const list: Array<Controller> = this._list as Array<Controller>;
        if (list.length > 0) {
            this.RemoveView(list.shift());
        }
        list.push(view);
        this.AddToRootWindow(view.node);
    }

    //根视图不能主动删除
    delView(_cleanup: boolean): boolean {
        return false;
    }
}