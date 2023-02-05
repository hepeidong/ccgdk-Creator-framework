
/**
 * author: 何沛东
 * date: 2021/7/22
 * name: 游戏socket二进制数据协议类
 * description: 构建游戏中socket发送数据的二进制数据，项目需要依赖msgpack-lite库
 */
export class BianryProtocol implements ISocketProtocol {
    private _socket: ICCSocketManager;
    private _pack: any;
    constructor(socket: ICCSocketManager) {
        this._socket = socket;
        this._pack = require('msgpack-lite');
    }

    public encodingData(data: any) {
        const buff = this._pack.encode(data);
        this._socket.sendData(buff);
    }

    public decodingData(data: any) {
        const msg = this._pack.decode(data);
        this._socket.dispatchData(msg);
    }
}