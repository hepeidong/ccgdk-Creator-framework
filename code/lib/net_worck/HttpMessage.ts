import { Debug } from "../cck/Debugger";
import { SAFE_CALLBACK, SAFE_CALLBACK_CALLER } from "../Define";
import { Proxy } from "../puremvc";
import CCHttp from "./Http";


export class CCHttpMessage<T, PT = any> extends Proxy<T> implements IHttpMessage {
    private _param: PT;
    private METHOD: string;
    private URL: string;
    private _http: CCHttp;
    private _resolve: (data?: T) => void;
    private _reject: (e: IHttpFail) => void;
    private _errorListeners: (err: IHttpError) => void;

    constructor(proxyName: string) {
        super(proxyName);
        this._http = CCHttp.instance;
    }

    /**
     * 消息错误执行回调，子类应该重写此函数
     * @param code 错误码
     */
    protected onError(code: number, msg: string) {}
    /**
     * 接收消息正确执行回调，子类应该重写此函数
     * @param data 数据
     */
    protected onMessage(data: T) {}

    /**
     * 发送消息
     * @param param 发送消息附带的参数
     */
    public send(param: PT) {
        this._param = param;
        this.request();
        return this;
    }

    /**
     * 设置HTTP请求时服务器返回的错误监听，此消息只接受服务器返回的错误导致的请求失败，与catch不一样，catch只返回HTTP发生的连接错误
     * @param reject 
     * @returns 
     */
    public fail(reject: (e: IHttpFail) => void): CCHttpMessage<T, PT> {
        this._reject = reject;
        return this;
    }

    /**
     * 请求成功后返回数据
     * @param resolve 
     * @returns 
     */
    public then(resolve: (data?: T) => void): CCHttpMessage<T, PT> { 
        this._resolve = resolve;
        return this; 
    }

    /**
     * 设置HTTP请求时发生的网络错误监听, 此条件下的错误不是服务器返回的错误, 而是HTTP连接发生的错误
     * 
     * @param listeners 
     */
    public catch(listeners: (err: IHttpError) => void): CCHttpMessage<T, PT> {
        this._errorListeners = listeners;
        return this;
    }
 
    private append() {
        return this._http.appendToken(this._param);
    }

    //发起请求
    private async request() {
        let response: IHttpResponse<T>;
        let param: any = this.append();
        Debug.info(`MSG ${this.getProxyName()} param:`, param);
        if (this.METHOD && this.METHOD.length > 0) {
            response = await this._http.request(this.METHOD, this.URL, param).catch((err: IHttpError) => {
                SAFE_CALLBACK_CALLER(this.onError, this, err.status, err.msg);
                SAFE_CALLBACK(this._errorListeners, err);
                Debug.error(`MSG ${this.METHOD} 网络连接错误:`, err);
            });
        }
        else {
            Debug.error('MSG 必须指定请求的方式,GET或者POST');
        }
        if (response) {
            this.dataPars(response);
        }
    }

    //数据解析
    private dataPars(response: IHttpResponse<T>) {
        if (typeof response === 'string') {
            response = JSON.parse(response);
        }
        // Debug.info(`MSG ${this.METHOD} 原始数据`, response);
        if (response.code === 200) {
            Debug.info('MSG', this.METHOD, this.getProxyName());
            this.setData(response.data);
            SAFE_CALLBACK_CALLER(this.onMessage, this, response.data);
            SAFE_CALLBACK(this._resolve, response.data);
        }
        else if (response) {
            SAFE_CALLBACK_CALLER(this.onError, this, response.code, response.msg);
            SAFE_CALLBACK(this._reject, {msg: response.msg, code: response.code});
            Debug.error(`MSG ${this.METHOD} 消息错误,错误码:`, response.code);
            Debug.error(`MSG ${this.METHOD} 错误接口类型:`, this.URL);
            Debug.error(`MSG ${this.METHOD} 错误消息返回:`, response.msg);
        }
    }
}