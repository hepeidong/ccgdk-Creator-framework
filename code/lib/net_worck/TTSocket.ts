import { Debug } from "../cck/Debugger";
import { SAFE_CALLBACK } from "../Define";
import { Assert } from "../exceptions/Assert";
import { GameSocket } from "./GameSocket";


/**
 * author: 何沛东
 * date: 2021/7/25
 * name: 字节平台socket代理类
 * description: 负责游戏中的字节平台网络连接
 */
export class TTSocket extends GameSocket {
    private _callback: Function;
    private _event_hide: boolean;
    constructor() {
        super('TTSocket');
        this._event_hide = false;
        cc.game.on(cc.game.EVENT_HIDE, () => this.closeSocket, this);
        cc.game.on(cc.game.EVENT_SHOW, this.connectSocket, this);
    }

    public description() {
        Debug.info(this.toString(), '启用字节小游戏平台webSocket');
    }

    public link(url: string, callback: Function) {
        this._url = url;
        this._callback = callback;
        if (!this._event_hide) {
            this.connectSocket();
        }
        
        Debug.info(this.toString(), '发起连接');
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
        })
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

    private closeSocket() {
        this._event_hide = true;
        this.close(0);
    }

    private connectSocket() {
        this._event_hide = false;
        this._readyState = 0;
        this._socket = tt.connectSocket({
            url: this._url,
            header:{
                'content-type': 'application/json'
            },
            fail: (res: {errMsg: string}) => {
                Debug.error('Socket连接失败:', res.errMsg);
            }
        });
        if (Assert.instance.handle(Assert.Type.CreateObjectException, this._socket, "字节小游戏socket")) {
            SAFE_CALLBACK(this._callback);
            Debug.info(this.toString(), '发起连接');
        }
    }
}