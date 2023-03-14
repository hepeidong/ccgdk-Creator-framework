import { Debug } from "../Debugger";
import { Proxy } from "../puremvc";
import { utils } from "../utils";
import { CCSocket } from "./Socket";
import { SAFE_CALLBACK_CALLER } from "../Define";
import { IHandler, ISocketData, ISocketListener, ISocketMessage } from "../lib.cck";
import { EventSystem } from "../event/EventSystem";

export class CCSocketMessage<T, PT = any> extends Proxy<T> implements ISocketMessage {
    private _socket: CCSocket;
    private _handlers: IHandler[];
    constructor(proxyName: string = null) {
        super(proxyName, {});
        this._handlers = [];
        this._socket = CCSocket.instance;
    }

    private get requestProxyName(): string { return this["_requestProxyName"]; }

    /**
     * 消息错误执行回调，子类应该重写此函数
     * @param code 错误码
     */
    protected onError(code: number) {}
    /**
     * 接收消息正确执行回调，子类应该重写此函数
     * @param data 数据
     */
    protected onMessage(data: T) {}

    /**
     * 
     * @param listener 
     * @param target 
     * @returns 
     */
    public post(listener: ISocketListener<T>, target?: any) {
        const handler = EventSystem.Handler.create(target, listener);
        this._handlers.push(handler);
        return handler.id;
    }

    /**
     * 发送消息
     * @param param 发送消息附带的参数
     */
    public send(param: PT) {
        const reqData = {
            proxyName: this.requestProxyName,
            data: param
        }
        this._socket.encodingData(reqData);
        Debug.log(this.toString(), "call send");
    }

    public dispatch(data: ISocketData<T>) {
        Debug.log(this.toString(), "call dispatch");
        if (data.code === 0) {
            SAFE_CALLBACK_CALLER(this.onMessage, this, data.data);
        }
        else {
            SAFE_CALLBACK_CALLER(this.onError, this, data.code);
        }
        for (const handler of this._handlers) {
            handler.apply([data.code, data.data]);
        }
    }

    public remove(listener: ISocketListener<T>): boolean;
    public remove(id: number): boolean;
    public remove() {
        if (typeof arguments[0] === "number") {
            let index = 0;
            for (const handler of this._handlers) {
                if (handler.id === arguments[0]) {
                    this._handlers.splice(index, 1);
                    return true;
                }
                index++;
            }
        }
        else {
            let index = 0;
            for (const handler of this._handlers) {
                if (handler.method === arguments[0]) {
                    this._handlers.splice(index, 1);
                    return true;
                }
                index++;
            }
        }
        return false;
    }

    public toString() {
        return utils.StringUtil.replace('SocketMessage:{0}', this.getProxyName());
    }
}