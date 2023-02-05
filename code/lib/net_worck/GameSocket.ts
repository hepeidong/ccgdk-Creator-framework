import { Utils } from "../utils/GameUtils";

/**
 * author: 何沛东
 * date: 2021/7/25
 * name: 游戏socket父类
 * description: 游戏中的各个平台网络连接的父类
 */
export class GameSocket implements ISocket {
    public binaryType: string;

    protected _readyState: number;
    protected _url: string;
    protected _socket: any;

    private _name: string;

    private static _instance: GameSocket = null;

    public static readonly CLOSED: number     = 3;
    public static readonly CLOSING: number    = 2;
    public static readonly CONNECTING: number = 0;
    public static readonly OPEN: number       = 1;
    constructor(name?: string) {
        GameSocket._instance = this;
        this._readyState = -1;
        this._url = "";
        this._name = name;
    }

    public get readyState(): number { return this._readyState; }
    public get url(): string { return this._url; }

    public static getSocket(): GameSocket {
        return this._instance;
    }

    public description() {}

    public link(url: string, callback: Function) {}

    public send(data: string | ArrayBufferLike | Blob | ArrayBufferView) {}

    public close(code?: number, reason?: string) {}

    public onOpen(callback: () => void) {}
    public onMessage(callback: (evt: MessageEvent) => void) {}
    public onClose(callback: (evt: CloseEvent) => void) {}
    public onError(callback: () => void) {}

    public toString() {
        return Utils.StringUtil.replace('[Socket:{0}]', this._name);
    }
}