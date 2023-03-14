import { decorator } from "../decorator/Decorator";
import { Debug } from "../Debugger";
import { SAFE_CALLBACK } from "../Define";
import { Assert } from "../exceptions/Assert";
import { GameSocket } from "./GameSocket";

const {cckclass} = decorator;

/**
 * author: 何沛东
 * date: 2021/7/25
 * name: 浏览器平台socket代理类
 * description: 原生socket，这个类可以用于原生平台，浏览器等等平台网络连接
 */
@cckclass("NativeSocket")
export class NativeSocket extends GameSocket {
    constructor() {
        super('NativeSocket');
    }

    public description() {
        Debug.info(this.toString(), '启用原生webSocket');
    }

    public link(url: string, callback: Function) {
        this._url = url;
        this._socket = new WebSocket(url) as WebSocket;
        if (Assert.instance.handle(Assert.Type.CreateObjectException, this._socket, "原生webSocket")) {
            SAFE_CALLBACK(callback);
            this._readyState = this._socket.readyState;
            Debug.info(this.toString(), '发起连接');
        }
    }

    public send(data: string | ArrayBufferLike | Blob | ArrayBufferView) {
        this._socket.send(data);
    }

    public close(code: number = 1000, reason?: string) {
        this._socket.close(code, reason);
        this._readyState = this._socket.readyState;
        Debug.info(this.toString(), '关闭网络连接');
    }

    public onOpen(callback: () => void) {
        this._socket.addEventListener('open', (evt: MessageEvent) => {
            this._readyState = this._socket.readyState;
            SAFE_CALLBACK(callback, evt);
        });
    }
    public onMessage(callback: (evt: MessageEvent) => void) {
        this._socket.addEventListener('message', (evt: MessageEvent) => {
            SAFE_CALLBACK(callback, evt);
        });
    }
    public onClose(callback: (evt: CloseEvent) => void) {
        this._socket.addEventListener('close', (evt: CloseEvent) => {
            this._readyState = this._socket.readyState;
            SAFE_CALLBACK(callback, evt);
        });
    }
    public onError(callback: () => void) {
        this._socket.addEventListener('error', () => {
            SAFE_CALLBACK(callback);
        });
    }
}