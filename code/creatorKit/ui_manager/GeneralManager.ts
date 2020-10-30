import { LayerManager } from "./LayerManager";
import { Controller } from "./Controller";

/**
 * author: HePeiDong
 * date: 2020/7/4
 * name: 普通视图ui管理器
 * description: 普通视图ui管理，栈存储方式。
 */
export default class GeneralManager extends LayerManager {
    constructor(canDel: boolean) {
        super(canDel, Array);
    }

    AddView(view: Controller) {
        const list: Array<Controller> = this._list as Array<Controller>;
        list.push(view);
        this.addToCenterWindow(view.node);
    }

    DelView(cleanup: boolean): boolean {
        const list: Array<Controller> = this._list as Array<Controller>;
        if (list.length > 0) {
            const view: Controller = list.pop();
            view.exitView(cleanup);
            return true;
        }
        return false;
    }
}