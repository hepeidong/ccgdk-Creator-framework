import Controller from "./Controller";

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
        if (this._pool.has(viewCls.name)) {
            let view: Controller = this._pool.get(viewCls.name);
            cck.log('ViewPool >> getView 返回这个视图', viewCls.name);
            return view;
        }
        else {
            cck.log('ViewPool >> getView 没有这个视图', viewCls.name);
        }
        return null;
    }

    public saveView(viewCls: typeof Controller, view: Controller): void {
        if (!this._pool.has(viewCls.name)) {
            this._pool.set(viewCls.name, view);
            cck.log('ViewPool >> saveView 保存这个视图', viewCls.name);
        }
        else {
            cck.log('ViewPool >> saveView 已经保存了这个视图', viewCls.name);
        }
    }

    public closeView(cls: typeof Controller): void {
        if (this._pool.has(cls.name)) {
            let view: Controller = this._pool.get(cls.name);
            view.close();
            cck.log('ViewPool >> closeView 关闭这个视图', cls.name);
        }
        else {
            cck.error('ViewPool >> closeView 没有这个视图', cls.name);
        }
    }

    public removeView(name: string): void {
        if (this._pool.has(name)) {
            this._pool.delete(name);
            cck.log('ViewPool >> closeView 从ViewPool移除这个视图', name);
        }
        else {
            cck.error('ViewPool >> closeView 没有这个视图', name);
        }
    }

    public gcView(): void {
        this._pool.forEach((view: Controller, key: string) => {
            view.close();
        });
    }

}