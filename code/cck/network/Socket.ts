import { BianryProtocol } from "./BianryProtocol";
import { JsonProtocol } from "./JsonProtocol";
import { GameSocket } from "./GameSocket";
import { SocketProxy } from "./SocketProxy";
import { utils } from "../utils";
import { Debug } from "../Debugger";
import { Assert } from "../exceptions/Assert";
import { Constructor, ICCSocketManager, ISocket, ISocketChange, ISocketData, ISocketMessage, ISocketNetworkDelay, ISocketNotConnected, ISocketProtocol, SocketChange, SocketNetworkDelay, SocketNotConnected } from "../lib.cck";
import { js } from "cc";
import { EventSystem } from "../event/EventSystem";

class TimerTask  {
    private _interval: number;
    private _timeoutId: number;
    private _timeoutCount: number;
    private _hasTimer: boolean;
    private _callback: (timeoutCount: number) => void;
    constructor() {
        this._interval     = 0;
        this._timeoutId    = 0;
        this._timeoutCount = 0;
        this._hasTimer     = false;
    }

    /**
     * 设置超时定时器的时间间隔
     * @param interval 
     */
    setTimeInterval(interval: number): void {
        this._interval = interval * utils.DateUtil.MILLISECOND;
    }
    /**
     * 注册超时定时器
     * @param callback 
     * @param target 
     */
    regTimerTask(callback: (timeoutCount: number) => void, target: any): void {
        this._callback = callback.bind(target);
    }
    /**开启一个新的超时定时器 */
    setTimerTask(): void {
        if (this._hasTimer) {
            this.moveTimerTask();
        }
        this._timeoutId = setTimeout(this._callback, this._interval, ++this._timeoutCount);
        this._hasTimer = true;
    }
    /**移除旧的超时定时器 */
    moveTimerTask(): void {
        this._timeoutCount = 0;
        this._hasTimer = false;
        clearTimeout(this._timeoutId);
    }
}

const errMsg = {
       0: "苹果系统自动断开连接",
    4000: "消息请求超时, 关闭连接",
    4001: "网络环境太差，无法连接",
    4002: "无网络环境，连接错误",
    3000: "主动关闭网络连接, 在外部通过Net.socket调用close方式关闭连接",
    1000: "正常关闭连接",
    1001: "终端离开，可能因为服务端错误，也可能因为游戏正从打开连接的页面跳转离开",
    1002: "由于协议错误而中断连接",
    1003: "由于接收到拒绝的数据类型而断开连接（如仅接收文本数据的终端接收到一些数据数据）",
    1006: "连接发生非正常关闭",
    1007: "因为收到了格式不符的数据而断开连接（如文本消息中包含了非 UTF-8 数据）",
    1008: "由于收到不符合约定的数据而导致断开连接。这是一个通用状态码，用于不适合使用1003和1009状态码的场景",
    1009: "因为收到过大的数据帧而断开连接",
    1010: "客户端请求服务器商定一个或多个，但服务器没有处理，因此客户端断开连接",
    1011: "客户端由于没有预期的情况阻止了其请求，因此服务端断开连接",
    1012: "由于重启而断开连接",
    1013: "由于临时原因导致连接断开，如超时因此断开连接客户端连接",
    1015: "表示连接由于无法完成 TLS 招手而关闭（例如无法验证服务器证书）"
}


/**
 * author: 何沛东
 * date: 2021/7/20
 * name: 网络socket连接管理类
 * description: 负责游戏中的网络连接管理
 */
export class CCSocket implements ICCSocketManager {
    private _currentExceptionCount: number;
    private _currentLinkCount: number;
    private _linkCountMax: number;
    private _pingTimestamp: number;
    private _binaryType: BinaryType;
    private _url: string;
    private _pongProxyName: string;
    private _ping: ISocketMessage;
    private _socket: ISocket;
    private _timeoutCheckTask: TimerTask;
    private _heartbeatTimerTask: TimerTask;
    private _socketProtocol: ISocketProtocol;
    private _sendQueue: any[];
    private _msgMap: {};
    private _onConnected: ISocketChange<SocketChange, CCSocket>;
    private _onConnectionException: ISocketChange<SocketChange, CCSocket>;
    private _onConnectionRestore: ISocketChange<SocketChange, CCSocket>;
    private _onDisconnected: ISocketChange<SocketChange, CCSocket>;
    private _onNotConnected: ISocketNotConnected<SocketNotConnected, CCSocket>;
    private _onNetworkDelay: ISocketNetworkDelay<SocketNetworkDelay, CCSocket>;
    constructor() {
        this._currentExceptionCount = 0;
        this._currentLinkCount  = 0;
        this._linkCountMax      = 3;
        this._pingTimestamp     = 0;
        this._sendQueue   = [];
        this._msgMap      = {};

        this._timeoutCheckTask   = new TimerTask();
        this._heartbeatTimerTask = new TimerTask();
        this._timeoutCheckTask.setTimeInterval(5);
        this._timeoutCheckTask.regTimerTask(this.onTimeoutCheck, this);
        this._heartbeatTimerTask.setTimeInterval(10);
        this._heartbeatTimerTask.regTimerTask(this.sendPing, this);
        
        this._onConnected           = new EventSystem.Signal(this);
        this._onConnectionException = new EventSystem.Signal(this);
        this._onConnectionRestore   = new EventSystem.Signal(this);
        this._onDisconnected = new EventSystem.Signal(this);
        this._onNotConnected = new EventSystem.Signal(this);
        this._onNetworkDelay = new EventSystem.Signal(this);

        SocketProxy.instantiate();
        this._socket = GameSocket.getSocket();
    }

    private static _ins: CCSocket = null;
    public static get instance(): CCSocket {
        return this._ins = this._ins ? this._ins : new CCSocket();
    }

    public get binaryType(): BinaryType { return this._binaryType; }
    public get onConnected(): ISocketChange<SocketChange, CCSocket> { return this._onConnected; }
    public get onConnectionException(): ISocketChange<SocketChange, CCSocket> { return this._onConnectionException; }
    public get onConnectionRestore(): ISocketChange<SocketChange, CCSocket> { return this._onConnectionRestore; }
    public get onDisconnected(): ISocketChange<SocketChange, CCSocket> { return this._onDisconnected; }
    public get onNotConnected(): ISocketNotConnected<SocketNotConnected, CCSocket> { return this._onNotConnected; }
    public get onNetworkDelay(): ISocketNetworkDelay<SocketNetworkDelay, CCSocket> { return this._onNetworkDelay; }
    public get readyState(): number {
        Assert.instance.handle(Assert.Type.CreateObjectException, this._socket, "游戏Socket对象");
        return this._socket.readyState;
    }

    /**
     * 初始化心跳消息
     * @param pingProxyName ping消息协议
     * @param pongProxyName pong消息协议
     */
    public initHeartbeat(pingProxyName: string, pongProxyName: string) {
        this._pongProxyName = pongProxyName;
        this._ping = this.retrieveMsg(pingProxyName);
    }

    /**
     * 发起连接socket
     * @param url socket服务器地址
     * @param binaryType 传输的数据类型
     */
    public link(url: string, binaryType: BinaryType) {
        if (Assert.instance.handle(Assert.Type.CreateObjectException, this._socket, "游戏Socket对象")) {
            this._url = url;
            this._socket.link(url, this.registerEvent.bind(this));
            Debug.info('socket url:', url);
            if (typeof binaryType === 'string') {
                this._binaryType = binaryType;
                this._socket.binaryType = binaryType;
                this._socketProtocol = new BianryProtocol(this);
            }
            else {
                this._socketProtocol = new JsonProtocol(this);
            }
            this.registerPingPong();
        }
    }

    /**重连 */
    public reconnect() {
        this._socket.link(this._url, this.registerEvent.bind(this));
    }

    /**
     * 正常主动关闭连接，关闭后不会再重连，谨慎调用
     */
    public close() {
        if (this._socket) {
            const code = 3000;
            this._socket.close(code);
        }
    }

    /**
     * 获取消息代理对象
     * @param proxyName 代理名
     * @returns 返回指定的消息代理对象
     */
    public get<T extends ISocketMessage>(proxyName: string): T {
        return this.retrieveMsg(proxyName) as T;
    }

    public encodingData(sockData: ISocketData) {
        if (this._socket.readyState === GameSocket.OPEN) {
            if (this._sendQueue.length > 0) {
                for (let msg of this._sendQueue) {
                    this._socketProtocol.encodingData(msg);
                }
            }
            this._socketProtocol.encodingData(sockData);
            this.clearQueue(this._sendQueue);
        }
        else {
            let key = utils.ObjectUtil.keyOf(this._sendQueue, (ele: ISocketData) => ele.proxyName === sockData.proxyName);
            if (utils.isNull(key)) {
                this._sendQueue.push(sockData);
            }
        }
        this._timeoutCheckTask.setTimerTask();
    }

    public sendData(data: any) {
        if (!this._socket) {
            return;
        }
        
        this._socket.send(data);
        this._pingTimestamp = new Date().getTime();
    }

    public dispatchData(data: ISocketData) {
        const proxy = this.retrieveMsg(data.proxyName);
        proxy.dispatch(data);
    }

    private registerEvent() {
        this._socket.onOpen(this.onOpen.bind(this));
        this._socket.onMessage(this.onMessage.bind(this));
        this._socket.onClose(this.onClose.bind(this));
        this._socket.onError(this.onError.bind(this));
    }

    private onOpen() {
        Debug.info(this._socket.toString(), 'CCSocket open successfuly!');
        this._currentLinkCount = 0;
        const onConnected = this.onConnected;
        if (onConnected.active) onConnected.dispatch();
        this._timeoutCheckTask.moveTimerTask();
        this._heartbeatTimerTask.setTimerTask();
        this.resetHeartbeat();
    }

    private onMessage(evt: MessageEvent) {
        if (!this._socket) {
            return;
        }
        this._socketProtocol.decodingData(evt.data);
        this.resetHeartbeat();
    }

    private clearQueue(queue: any[]) {
        for (let k in queue) {
            delete queue[k];
        }
        queue.length = 0;
    }

    private onError() {
        Debug.error('socket 连接发生错误');
        this.handleDisconnect(4002, errMsg[4002]);
    }

    private onClose(evt: CloseEvent) {
        Debug.info('socket 关闭:', evt.code);
        if (evt.code in errMsg) {
            if (evt.code !== 3000) {
                Debug.error(errMsg[evt.code]);
                this.handleClose(evt.code, errMsg[evt.code]);
            }
        }
    }

    private handleClose(code: number, reason: string) {
        if (code !== 3000) {
            //心跳包无法在规定时间内接收到, 或发生其他因玩家操作问题导致的断线情况, 处理断线重连
            if (this._currentLinkCount === this._linkCountMax) {
                this.handleDisconnect(4001, errMsg[4001]);
            }
            else {
                this.handleDisconnect(code, reason);
            }
        }
        else {
            const onNotConnected = this.onNotConnected;
            if (onNotConnected.active) onNotConnected.dispatch(code, reason);
        }
    }

    private handleDisconnect(code: number, reason: string) {
        if (code === 4001 || code === 4002) {
            this._currentLinkCount = 0;
            const onNotConnected = this.onNotConnected;
            if (onNotConnected.active) onNotConnected.dispatch(code, reason);
        }
        else {
            if (this._currentLinkCount === 0) {
                const onDisconnected = this.onDisconnected;
                if (onDisconnected.active) onDisconnected.dispatch();
            }
            this._currentLinkCount++;
            Debug.info('发起断线重连，重连次数', this._currentLinkCount);
            this.reconnect();
        }
    }

    private registerPingPong() {
        const proxy = this.retrieveMsg(this._pongProxyName);
        proxy.post(this.onPingPong, this);
    }

    private onPingPong(code: number, data: any) {
        if (code === 0) {
            Debug.info('pingPong', data);
        }
    }

    private resetHeartbeat() {
        //有消息过来时, 关闭连接超时选择计时器, 防止主动进行断线重连, 服务器有消息过来, 则说明没有断线
        this._timeoutCheckTask.moveTimerTask();
        //用户发送了数据, 则要把心跳已经发送的标记置为真, 因为用户有发送消息, 则心跳不进行, 如果用户没有发送消息, 心跳才进行
        this._heartbeatTimerTask.setTimerTask();

        const onNetworkDelay = this.onNetworkDelay;
        if (onNetworkDelay.active) {
            onNetworkDelay.dispatch(new Date().getTime() - this._pingTimestamp);
        }

        //等于1是因为有一个心跳时间请求没有任何反应
        if (this._currentExceptionCount > 0) {
            Debug.info('连接异常恢复');
            this._currentExceptionCount = 0;
            const onConnectionRestore = this.onConnectionRestore;
            if (onConnectionRestore.active) {
                onConnectionRestore.dispatch();
            }
        }
    }

    private sendPing() {
        this._ping.send();
    }

    private onTimeoutCheck(timeoutCount: number) {
        this._currentExceptionCount = timeoutCount;;
        if (timeoutCount === 1) {
            this.sendPing();
            const onConnectionException = this.onConnectionException;
            if (onConnectionException.active) {
                onConnectionException.dispatch();
            }
        }
        else if (timeoutCount === 2) {
            this._socket.close(4000, errMsg[4000]);
        }
    }

    private retrieveMsg(proxyName: string): ISocketMessage {
        //此处保存消息对象不使用App.game.registerProxy接口，是因为要保持接收消息，遍历查找对应的消息的效率。
        if (proxyName in this._msgMap) {
            return this._msgMap[proxyName];
        }

        const msgRef = js.getClassByName(proxyName) as Constructor;
        if (Assert.instance.handle(Assert.Type.GetSocketMessageClassException, msgRef, proxyName)) {
            const msg = new msgRef(proxyName);
            this._msgMap[proxyName] = msg;
            return msg as ISocketMessage;
        }
    }
}
