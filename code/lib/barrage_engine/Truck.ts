import { EventSystem } from "../cck";

export enum truckStatus {
    /**空闲状态 */
    LDLE,
    /**启动状态 */
    LAUNCH,
    /**出站状态 */
    OUTBOUND,
    /**到站状态 */
    PULLIN
}

/**
 * 具体弹幕, 用于运送弹幕内容
 */
export class Truck {
    private _id: number;            //ID
    private _distance: number;      //行驶路程
    private _speed: number;         //行驶速度
    private _content: string;       //弹幕内容
    private _color: cc.Color;       //弹幕颜色
    private _carrier: cc.Node;      //弹幕载体
    private _status: truckStatus;   //弹幕状态
    private _startPos: cc.Vec3;                 //弹幕初始位置
    private _handler: EventSystem.Handler;              //弹幕出站回调
    private _outboundHandler: EventSystem.Handler;      //弹幕出站回调
    private _pullInHandler: EventSystem.Handler;        //弹幕到站回调

    constructor(id: number, content: string = '', color: cc.Color = cc.Color.WHITE, carrier: cc.Node = null) {
        this._id = id;
        this._content = content;
        this._color = color;
        this._carrier = carrier;
        carrier && (this._carrier.anchorX = 0);
        this._distance = 0;
        this._speed = 0;
        this._status = truckStatus.LDLE;
    }

    public get ID(): number { return this._id; }
    public get content(): string { return this._content; }
    public get color(): cc.Color { return this._color; }
    public get carrier(): cc.Node { return this._carrier; }
    public get status(): truckStatus { return this._status; }
    public static get TruckStatus(): typeof truckStatus { return truckStatus; }

    /**
     * 设置行驶路程
     * @param d 
     */
    public setDistance(d: number) {
        this._distance = d;
    }
    /**
     * 设置行驶时间
     * @param t 
     */
    public setTime(t: number) {
        this._speed = this._distance / (cc.game.getFrameRate() * t)
    }
    /**
     * 设置弹幕内容
     * @param content 
     */
    public setContent(content: string) {
        this._content = content;
    }
    /**
     * 设置弹幕颜色
     * @param color 
     */
    public setColor(color: cc.Color) {
        this._color = color;
    }
    /**
     * 设置弹幕载体
     * @param carrier 
     */
    public setCarrier(carrier: cc.Node) {
        this._carrier = carrier;
        this._carrier.anchorX = 0;
    }
    /**
     * 设置初始坐标位置
     * @param x 
     * @param y 
     */
    public setStartPosition(x: number, y: number) {
        this._carrier.x = x;
        this._carrier.y = y;
        this._startPos = cc.v3(x, y);
    }
    /**重置 */
    public reset() {
        this._status = truckStatus.LDLE;
        this._content = '';
        this._color = cc.Color.WHITE;
        this._carrier.position = this._startPos;
    }
    /**
     * 设置弹幕打包回调
     * @param packFn 
     */
    public setPackListener(handler: EventSystem.Handler) {
        this._handler = handler;
    }
    /**
     * 设置弹幕出站回调
     * @param outboundFn 
     */
    public setOutboundListener(handler: EventSystem.Handler) {
        this._outboundHandler = handler;
    }
    /**
     * 设置弹幕到站回调
     * @param pullInFn 
     */
    public setPullInListener(handler: EventSystem.Handler) {
        this._pullInHandler = handler;
    }
    /**弹幕开车, 开始运行 */
    public drive() {
        this._status = truckStatus.LAUNCH;
        this._handler && this._handler.apply({carrier: this._carrier, content: this._content, color: this._color});
    }
    /**运行过程 */
    public run() {
        this._carrier.x -= this._speed;
        if (this._carrier.x + this._carrier.width < this._distance / 2 
            && this._carrier.x + this._carrier.width > -this._distance / 2) {
            //弹幕出站
            this._status = truckStatus.OUTBOUND;
            this._outboundHandler.apply(this);
        }
        else if (this._carrier.x + this._carrier.width <= -this._distance / 2) {
            //弹幕到站
            this._status = truckStatus.PULLIN;
            this._pullInHandler.apply(this);
            this._status = truckStatus.LDLE;
        }
    }
}