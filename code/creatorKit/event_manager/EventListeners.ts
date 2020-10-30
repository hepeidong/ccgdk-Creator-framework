/**
 * 回调处理类
 */
export class Handler {
    /** @private 回调函数 */
    private _method: Function = null;
    /** @private 是否只执行一次 */
    private _once: boolean = false;
    /** @private 回掉函数的参数 */
    private _args: any[] = null;
    /** @private 执行域 */
    private _caller: any = null;

    constructor(caller: any, method: Function, args:  any[], once: boolean) {
        this._caller = caller;
        this._method = method;
        this._args = args;
        this._once = once;
    }

    /**
     *创建回调处理类对象
     * @param caller 执行域
     * @param method 回调函数
     * @param args 参数
     * @param once
     * @returns {Handler}
     */
    public static create(caller: any, method: Function, args:  any[], once: boolean): Handler {
        return new Handler(caller, method, args, once);
    }

    /**
     * 回调执行函数
     * @param data
     * @returns {any}
     */
    public apply(data: any): any {
        if (this._method == null) return null;
        let result: any;
        if (data == null) result = this._method.apply(this._caller, this._args);
        else if (!this._args && !data.unshift) result = this._method.call(this._caller, data);
        else if (this._args) result = this._method.apply(this._caller, this._args.concat(data));
        else result = this._method.apply(this._caller, data);
        return result;
    }

    public get once(): boolean { return this._once; }
    public get method(): Function { return this._method; }
    public get caller(): any { return this._caller; }
}

/**
 * name: 事件监听类
 * date: 
 * author: 何沛东
 * descripttion: 注册监听事件，有待优化
 */
export class EventListeners {
    private _event: Object;
    constructor() {

    }

    /**
     * 检查是否存在当前类型事件
     * @param type 事件类型
     * @returns {boolean}
     * @constructor
     */
    public hasListener(type: string): boolean {
        let listener: any = this._event && this._event[type];
        return !!listener;
    }

    public emit(type: string, ...data: any[]): boolean {
        if (!this._event || !this._event[type]) return false;
        let listeners: any = this._event[type];
        if (listeners.apply) {
            if (listeners.once) delete  this._event[type];
            listeners.apply(data);
        }
        else {
            for (let i: number = 0, n: number = listeners.length; i < n; ++i) {
                if (listeners[i]) {
                    listeners[i].apply(data);
                }
                else if (!listeners[i] || listeners[i].once) {
                    listeners.splice(i, 1);
                    --i;
                    --n;
                }
            }
            if (listeners.lenght == 0 && this._event) delete  this._event[type];
        }
        return true;
    }

    public on(type:string, caller:any, listener:Function, ...args: any[]): EventListeners {
        return this.CreateListener(type, caller, listener, args, false);
    }

    public once(type:string, caller:any, listener:Function, ...args: any[]): EventListeners {
        return this.CreateListener(type, caller, listener, args, true);
    }

    public off(type:string, caller:any, listener:Function, once: boolean = false): EventListeners {
        if (!this._event || !this._event[type]) return this;
        var listeners:any = this._event[type];
        if (listeners != null) {
            if (listeners.apply) {
                if ((!caller || listeners.caller == caller) && (listener == null || listeners.method === listener) && (!once || listeners.once)) {
                    delete this._event[type];
                }
            } else {
                let count: number = 0;
                let n: number = listeners.length;
                for (let i: number = 0; i < n; i++) {
                    let item:Handler = listeners[i];
                    if (!item)
                    {
                        count++;
                        continue;
                    }
                    if (item && (!caller || item.caller === caller) && (listener==null || item.method === listener) && (!once || item.once)) {
                        count++;
                        listeners[i] = null;
                    }
                }
                //如果全部移除，则删除索引
                if (count === n) delete this._event[type];
            }
        }
        return this;
    }

    public offAll(type:string = null):EventListeners {
        let events: any = this._event;
        if (!events) return this;
        if (type) {
            this.RecoverHandlers(events[type]);
            delete events[type];
        } else {
            for (let name in events) {
                this.RecoverHandlers(events[name]);
            }
            this._event = null;
        }
        return this;
    }

    public offAllCaller(caller: any): EventListeners {
        if (caller && this._event) {
            for (var name in this._event) {
                this.off(name, caller, null);
            }
        }
        return this;
    }

    private CreateListener(type:string, caller:any, listener:Function, args:Array<any>, once:boolean, offBefore:boolean = true): EventListeners {
        offBefore && this.off(type, caller, listener, once);
        this._event || (this._event = {});
        let handler: Handler = Handler.create(caller, listener, args, once);
        if (!this._event[type]) this._event[type] = handler;
        else {
            if (!this._event[type].apply) this._event[type].push(handler);
            else this._event[type] = [this._event[type], handler];
        }
        return this;
    }

    private RecoverHandlers(arr: any):void {
        if (!arr) return;
        if (arr.run) {
            arr.recover();
        } else {
            for (var i: number = arr.length - 1; i > -1; i--) {
                if (arr[i]) {
                    arr[i] = null;
                }
            }
        }
    }
}
