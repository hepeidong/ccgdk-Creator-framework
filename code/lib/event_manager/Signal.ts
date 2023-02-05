import { Tools } from "../cck";

/**
 * 信号类, 发射运行状态信号, 更新实体, 组件, 系统的状态
 */
export class CCSignal<T extends IListener, E> implements ISignal<T, E> {
    private _listeners: Tools.CircularQueue<T>;
    private _context: E;
    constructor(context: E) {
        this._context = context;
        this._listeners = new Tools.CircularQueue();
        this._listeners.reserve(64, true);
    }

    public get active(): boolean { return this._listeners.length > 0; }

    public add(listener: T) {
        this._listeners.push(listener);
    }

    public remove(listener: T) {
        return this._listeners.remove(listener);
    }

    public dispatch(...args: any[]) {
        if (this._listeners.length <= 0) return;
        const context = this._context;
        for (let i: number = 0; i < this._listeners.length; ++i) {
            if (this._listeners[i] && typeof this._listeners[i] === 'function') {
                this._listeners[i].apply(context, args);
            }
        }
    }

    public clear() {
        this._listeners.clear();
    }
}