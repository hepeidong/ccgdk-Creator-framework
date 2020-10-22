/**
 * name: 事件监听管理类
 * date: 2020-05-13
 * description: 管理注册引擎提供的监听事件，例如 node.on('eventName', function(){}, this) 这类
 */

interface EventTargetArgs {
    type: string;
    target: cc.Node;
    caller: any;
    useCapture: boolean;
    customData: any;
}

interface EventListener {
    type: string;
    caller: any;
    useCapture: boolean;
    callback: Function;
}

class EventDispatch extends cc.Event.EventCustom {
    private _replyfn: Function;
    constructor(type: string, bubbles: boolean) {
        super(type, bubbles);
    }

    public static create(type: string, bubbles: boolean, data?: any): EventDispatch {
        let e: EventDispatch = new EventDispatch(type, bubbles);
        if (!e) {
            throw new Error('[EventDispatch] function<create> 创建对象失败！');
        }
        e.setUserData(data);
        return e;
    }

    public reply(callback: (res: any) => void): void {
        this._replyfn = callback;
    }

    public set replyValue(val: any) {
        SAFE_CALLBACK(this._replyfn, val);
    }
}

export class TargetListener {
    private static _listenerMap: Map<string, EventListener[]>;
    private static _customEventMap: Map<string, EventDispatch>;
    private _eventArgs: EventTargetArgs;
    constructor(_t?: cc.Node, _c?: any) {
        this._eventArgs = { type: null, target: _t, caller: _c, useCapture: false, customData: null };
        TargetListener._listenerMap = new Map();
        TargetListener._customEventMap = new Map();
    }

    public set replyValue(val: any) { 
        let event: EventDispatch = TargetListener._customEventMap.get(this._eventArgs.type); 
        event.replyValue = val;
        TargetListener._customEventMap.set(this._eventArgs.type, event);
    }

    public static listener(target: cc.Node, caller: any): TargetListener {
        let obj: TargetListener = new TargetListener(target, caller);
        if (!obj) {
            throw new Error('[TargetListener] function<listener> 创建对象失败！');
        }
        return obj;
    }

    public targetListeners(target: cc.Node): EventListener[] {
        if (target) {
            return TargetListener._listenerMap.get(target.uuid);
        }
        else {
            throw new Error('[TargetListener] function<targetListener>:传入的参数类型错误');
        }
    }

    public type(_type: string): TargetListener {
        this._eventArgs.type = _type;
        return this;
    }

    public target(_target: cc.Node): TargetListener {
        this._eventArgs.target = _target;
        return this;
    }

    public caller(_caller: any): TargetListener {
        this._eventArgs.caller = _caller;
        return this;
    }

    public capture(_useCapture: boolean): TargetListener {
        this._eventArgs.useCapture = _useCapture;
        return this;
    }

    public customData(data: any): TargetListener {
        this._eventArgs.customData = data;
        return this;
    }

    public emit(type: string, arg1?: any, arg2?: any, arg3?: any, arg4?: any, arg5?: any): void {
        if (this._eventArgs.target) {
            this._eventArgs.target.emit(type, arg1, arg2, arg3, arg4, arg5);
        }
        else {
            kit.Error('[TargetListener] function<emit>:传入的目标节点为', this._eventArgs.target);
        }
    }

    public dispatch(type: string, data?: any, reply?: (res: any) => void): void {
        let event: EventDispatch = EventDispatch.create(type, true, data);
        event.reply = reply;
        TargetListener._customEventMap.set(type, event);
        this._eventArgs.target.dispatchEvent(event);
    }

    public click(handler: string): TargetListener {
        this.addEventHandler(cc.Button, 'clickEvents', this._eventArgs.target, this._eventArgs.caller, handler, this._eventArgs.customData);
        return this;
    }

    public slider(handler: string): TargetListener {
        this.addEventHandler(cc.Slider, 'slideEvents', this._eventArgs.target, this._eventArgs.caller, handler, this._eventArgs.customData);
        return this;
    }

    public toggle(handler: string): TargetListener {
        this.addEventHandler(cc.Toggle, 'clickEvents', this._eventArgs.target, this._eventArgs.caller, handler, this._eventArgs.customData);
        return this;
    }

    public editReturn(handler: string): TargetListener {
        this.addEventHandler(cc.EditBox, 'editingReturn', this._eventArgs.target, this._eventArgs.caller, handler, this._eventArgs.customData);
        return this;
    }

    public editDidEnded(handler: string): TargetListener {
        this.addEventHandler(cc.EditBox, 'editingDidEnded', this._eventArgs.target, this._eventArgs.caller, handler, this._eventArgs.customData);
        return this;
    }

    public textChanged(handler: string): TargetListener {
        this.addEventHandler(cc.EditBox, 'textChanged', this._eventArgs.target, this._eventArgs.caller, handler, this._eventArgs.customData);
        return this;
    }

    public editDidBegan(handler: string): TargetListener {
        this.addEventHandler(cc.EditBox, 'editingDidBegan', this._eventArgs.target, this._eventArgs.caller, handler, this._eventArgs.customData);
        return this;
    }

    public onMouseEnter(callback: Function): TargetListener {
        this.on(cc.Node.EventType.MOUSE_ENTER, callback);
        return this;
    }

    public onMouseLeave(callback: Function): TargetListener {
        this.on(cc.Node.EventType.MOUSE_LEAVE, callback);
        return this;
    }

    public onMouseDown(callback: Function): TargetListener {
        this.on(cc.Node.EventType.MOUSE_DOWN, callback);
        return this;
    }

    public onMouseMove(callback: Function): TargetListener {
        this.on(cc.Node.EventType.MOUSE_MOVE, callback);
        return this;
    }

    public onMouseUp(callback: Function): TargetListener {
        this.on(cc.Node.EventType.MOUSE_UP, callback);
        return this;
    }

    public onMouseWheel(callback: Function): TargetListener {
        this.on(cc.Node.EventType.MOUSE_WHEEL, callback);
        return this;
    }

    public onStart(callback: Function): TargetListener {
        this.on(cc.Node.EventType.TOUCH_START, callback);
        return this;
    }

    public onMove(callback: Function): TargetListener {
        this.on(cc.Node.EventType.TOUCH_MOVE, callback);
        return this;
    }

    public onEnd(callback: Function): TargetListener {
        this.on(cc.Node.EventType.TOUCH_END, callback);
        return this;
    }

    public onCancel(callback: Function): TargetListener {
        this.on(cc.Node.EventType.TOUCH_CANCEL, callback);
        return this;
    }

    public onCall(callback: Function): TargetListener {
        if (this._eventArgs.type) {
            this.on(this._eventArgs.type, callback);
        }
        else {
            throw new Error('[targetListener] function<onCall>:自定义事件监听类型时，必须要传入事件类型！');
        }
        return this;
    }

    public offMouseEnter(): void {
        this.off(cc.Node.EventType.MOUSE_ENTER);
    }

    public offMouseDown(): void {
        this.off(cc.Node.EventType.MOUSE_DOWN);
    }

    public offMouseLeave(): void {
        this.off(cc.Node.EventType.MOUSE_LEAVE);
    }

    public offMouseMove(): void {
        this.off(cc.Node.EventType.MOUSE_MOVE);
    }

    public offMouseUp(): void {
        this.off(cc.Node.EventType.MOUSE_UP);
    }

    public offMouseWheel(): void {
        this.off(cc.Node.EventType.MOUSE_WHEEL);
    }

    public offStart(): void {
        this.off(cc.Node.EventType.TOUCH_START);
    }

    public offMove(): void {
        this.off(cc.Node.EventType.TOUCH_MOVE);
    }

    public offEnd(): void {
        this.off(cc.Node.EventType.TOUCH_END);
    }

    public offCancel(): void {
        this.off(cc.Node.EventType.TOUCH_CANCEL);
    }

    public offCall(): void {
        this.off(this._eventArgs.type);
    }

    private on(eventName: string, callback: Function): any {
        if (!this.addListenerToMap(callback)) {
            console.error('[TargetListener] 监听事件传入的target为', this._eventArgs.target);
            return callback;
        }
        if (this._eventArgs.caller) {
            if (this._eventArgs.useCapture) {
                return this._eventArgs.target.on(eventName, callback, this._eventArgs.caller, this._eventArgs.useCapture);
            }
            else {
                return this._eventArgs.target.on(eventName, callback, this._eventArgs.caller);
            }
        }
        else {
            return this._eventArgs.target.on(eventName, callback);
        }
    }

    private off(eventName: string = null): any {
        if (!this._eventArgs.target) {
            throw new Error('[TargetListener] 删除事件必须要传入目标节点');
        }
        if (TargetListener._listenerMap.has(this._eventArgs.target.uuid)) {
            let currListeners: EventListener[] = TargetListener._listenerMap.get(this._eventArgs.target.uuid);
            let index: number = utils.ObjectUtil.indexOf(currListeners, (e: EventListener) => { return e.type === eventName; });
            if (index > -1) {
                this.offListaner(currListeners[index]);
                currListeners.splice(index, 1);
                TargetListener._listenerMap.set(this._eventArgs.target.uuid, currListeners);
            }
            else {
                TargetListener._listenerMap.delete(this._eventArgs.target.uuid);
                currListeners.forEach((value: EventListener, _index: number, _array: EventListener[]) => {
                    this.offListaner(value);
                });
            }
            
        }
    }

    private offListaner(listeners: EventListener) {
        if (listeners.caller) {
            if (listeners.useCapture) {
                this._eventArgs.target.off(listeners.type, listeners.callback, listeners.caller, listeners.useCapture);
            }
            else {
                this._eventArgs.target.off(listeners.type, listeners.callback, listeners.caller);
            }
        }
        else {
            this._eventArgs.target.off(listeners.type, listeners.callback);
        }
    }

    private addEventHandler(
        type: typeof cc.Component,
        events: string,
        node: cc.Node,
        component: cc.Component,
        handler: string,
        data: any
    ): void {
        if (component instanceof cc.Component) {
            let eventHandler: cc.Component.EventHandler = new cc.Component.EventHandler();
            let reg: RegExp = /\<(.+?)\>/g;
            let name: string;
            let result: any[] = null;

            result = reg.exec(component.name);
            result && (name = result[1]);
            eventHandler.target = component.node;
            eventHandler.component = name;
            eventHandler.handler = handler;
            eventHandler.customEventData = data;
            if (node.getComponent(type)) {
                let handlerEvents: cc.Component.EventHandler[] = node.getComponent(type)[events];
                handlerEvents.push(eventHandler);
            }
            else {
                kit.Warn(`${component.node.name} 节点上没有 ${type.name} 组件`);
            }
        }
    }

    private addListenerToMap(callback: Function): boolean {
        if (!this._eventArgs.target) {
            return false;
        }
        if (TargetListener._listenerMap.has(this._eventArgs.target.uuid)) {
            let currListeners: EventListener[] = TargetListener._listenerMap.get(this._eventArgs.target.uuid);
            currListeners.push({
                type: this._eventArgs.type, 
                caller: this._eventArgs.caller, 
                useCapture: this._eventArgs.useCapture, 
                callback
            });
            TargetListener._listenerMap.set(this._eventArgs.target.uuid, currListeners);
        }
        else {

        }
        return true;
    }
}