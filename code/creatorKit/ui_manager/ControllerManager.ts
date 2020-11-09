import { LayerManager } from "./LayerManager"
import { Controller } from "./Controller";
import RootManager from "./RootManager";
import GeneralManager from "./GeneralManager";
import ActivityManager from "./ActivityManager";
import ToastManager from "./ToastManager";
import TopManager from "./TopManager";

enum Type {
    ROOT,
    GENERAL,
    ACTIVITY,
    TOAST,
    TOP
}

interface ManagerType {
    ROOT: number;
    GENERAL: number;
    ACTIVITY: number;
    TOAST: number;
    TOP: number;
}

/**
 * author: HePeiDong
 * date: 2020/7/4
 * name: 控制器管理器（即ui管理器）
 * description: 对控制器进行管理。
 */
export default class ControllerManager {
    private static _type: ManagerType = Type;
    private _managers: LayerManager[];
    constructor() {
        this._managers = [];
        this.init();
    }

    private static _ins: ControllerManager = null;
    public static get Instance(): ControllerManager {
        return this._ins = this._ins ? this._ins : new ControllerManager();
    }

    public static get Type(): ManagerType { return this._type; }

    public setVisible(ctrlIndex: number, visible: boolean): void {
        this._managers[ctrlIndex].setVisible(visible);
    }

    public addView(view: Controller): void {
        if (view) {
            const manager: LayerManager = this._managers[view.getCtrlIndex()];
            if (!manager) {
                return;
            }
            manager.addView(view);
        }
    }

    public delView(ctrlIndex: number, cleanup: boolean = false): boolean {
        const manager: LayerManager = this._managers[ctrlIndex];
        if (!manager) {
            return false;
        }
        if (manager.CanDel && manager.GetCount() > 0) {
            return manager.delView(cleanup);
        }
        return false;
    }

    public getOpenCtrlCount(): number {
        let count: number = 0;
        for (let ele of this._managers) {
            if (ele.CanDel) {
                count += ele.GetCount();
            }
        }
        return count;
    }

    public clear() {
        for (let ele of this._managers) {
            if (ele.CanDel && ele.GetCount() > 0) {
                ele.clear();
            }
        }
    }

    private init() {
        this._managers[Type.ROOT] = new RootManager(true);
        this._managers[Type.GENERAL] = new GeneralManager(true);
        this._managers[Type.ACTIVITY] = new ActivityManager(true);
        this._managers[Type.TOAST] = new ToastManager(false);
        this._managers[Type.TOP] = new TopManager(false);
    }
}