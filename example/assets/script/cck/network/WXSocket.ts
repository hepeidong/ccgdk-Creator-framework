import { decorator } from "../decorator/Decorator";
import { Debug } from "../Debugger";
import { SAFE_CALLBACK } from "../Define";
import { Assert } from "../exceptions/Assert";
import { GameSocket } from "./GameSocket";

const {cckclass} = decorator;

/**
 * author: 何沛东
 * date: 2021/7/25
 * name: 微信平台socket代理类
 * description: 负责游戏中的微信平台网络连接
 */
@cckclass("WXSocket")
export class WXSocket extends GameSocket {
    constructor() {
        super('WXSocket');
    }

    public description() {
        Debug.log(this.toString(), '启用微信小游戏平台webSocket');
    }

    public link(url: string, callback: Function) {
        this._url = url;
        this._readyState = 0;
        this._socket = wx.connectSocket({
            url,
            header:{
                'content-type': 'application/json'
            }
        });
        if (Assert.handle(Assert.Type.CreateObjectException, this._socket, "微信小游戏socket")) {
            SAFE_CALLBACK(callback);
            Debug.info(this.toString(), '发起连接');
        }
    }

    public send(data: string | ArrayBufferLike | Blob | ArrayBufferView) {
        this._socket.send({
            data
        });
    }

    public close(code: number = 1000, reason?: string) {
        this._readyState = 2;
        this._socket.close({
            code,
            reason,
            success: () => {
                this._readyState = 3;
                Debug.info(this.toString(), '关闭网络连接');
            } 
        });
    }

    public onOpen(callback: () => void) {
        this._socket.onOpen(() => {
            this._readyState = 1;
            SAFE_CALLBACK(callback);
        });
    }
    public onMessage(callback: (evt: MessageEvent) => void) {
        this._socket.onMessage((evt: MessageEvent) => {
            SAFE_CALLBACK(callback, evt);
        });
    }
    public onClose(callback: (evt: CloseEvent) => void) {
        this._socket.onClose((evt: CloseEvent) => {
            SAFE_CALLBACK(callback, evt);
        });
    }
    public onError(callback: () => void) {
        this._socket.onError(() => {
            SAFE_CALLBACK(callback);
        });
    }
}