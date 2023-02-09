import CCHttp from "./Http";
import { CCHttpMessage } from "./HttpMessage";
import { CCSocket } from "./Socket";
import { CCSocketMessage } from "./SocketMessage";

export class Net {
    public static get http(): IHttpManager { return CCHttp.instance; }
    public static get socket(): ISocketManager { return CCSocket.instance; }
}

export namespace Net {
    export enum Method {
        GET = 'GET',
        POST = 'POST'
    }
    export class SocketMessage<T> extends CCSocketMessage<T> {}
    export class HttpMessage<T, PT = any> extends CCHttpMessage<T, PT> {}
}
