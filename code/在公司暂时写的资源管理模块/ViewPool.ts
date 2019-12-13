import { Controller } from "./Controller";

export class ViewPool {
    private static _ins: ViewPool;
    private _pool: Map<string, Controller>;

    constructor() {
        this._pool = new Map();
    }

    public static get Instance(): ViewPool {
        return this._ins = this._ins ? this._ins : new ViewPool();
    }

    public getView(viewCls: typeof Controller): Controller {
        if (this._pool.has(viewCls.viewName)) {
            let view: Controller = this._pool.get(viewCls.viewName);
            return view;
        }
        else {
            let view: Controller = new viewCls();
            this._pool.set(viewCls.viewName, view);
            return view;
        }
    }

    public closeView(viewCls: typeof Controller) {
        if (this._pool.has(viewCls.viewName)) {
            let view: Controller = this._pool.get(viewCls.viewName);
            this._pool.delete(viewCls.viewName);
            view.close();
        }
    }

    public hideView(viewCls: typeof Controller) {
        if (this._pool.has(viewCls.viewName)) {
            let view: Controller = this._pool.get(viewCls.viewName);
            view.hide();
        }
    }
}