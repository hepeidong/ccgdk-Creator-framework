import { EventSystem, Tools } from "../cck";
import { Truck } from "./Truck";

export enum VectorEvent {
    CLEAR = 'clear_barrage'
}

/**
 * 弹幕航线
 */
export class Vector {
    private _x: number;                         //航线坐标x
    private _y: number;                         //航线坐标y
    private _width: number;                     //航线宽
    private _length: number;                    //航线长
    private _num: number;                       //航线编号
    private _time: number;                      //弹幕运行时间
    private _active: boolean;                   //激活状态
    private _ldle: boolean;                     //空闲状态
    private _pool: Tools.ObjectPool<Truck>;              //弹幕池
    private _carrier: cc.Node;                  //弹幕载体
    private _area: cc.Node;                     //弹幕区域
    private _launchMap: Map<number, Truck>;   //已经出站了的弹幕
    private _packMethod: barrageListener_t;     //弹幕打包回调
    private _packCaller: any;                   //弹幕打包回调监听者
    private _outboundHandler: EventSystem.Handler;      //弹幕出站回调
    private _pullInHandler: EventSystem.Handler;        //弹幕到站回调

    private truckID: number;                    //用于分配弹幕ID

    constructor() {
        this._x = 0;
        this._y = 0;
        this._width = 0;
        this._length = 0;
        this._num = 0;
        this._active = false;
        this._ldle = true;
        this._pool = new Tools.ObjectPool();
        this._carrier = null;
        this._area = null;
        this._launchMap = new Map();
        this.truckID = 0;
        EventSystem.event.on(VectorEvent.CLEAR, this, this.close);
    }

    /**航线坐标x */
    public get x(): number { return this._x; }
    /**航线坐标y */
    public get y(): number { return this._y; }
    /**航线编号 */
    public get num(): number { return this._num; }
    /**航线宽 */
    public get width(): number { return this._width; }
    /**航线长 */
    public get length(): number { return this._length; }
    /**激活状态 */
    public set active(val: boolean) {
        this._active = val;
        this._launchMap.forEach((truck: Truck) => {
            truck.carrier.active = val;
        });
    }
    public get active(): boolean { return this._active; }
    /**空闲状态 */
    public get ldle(): boolean { return this._ldle; }
    /**在运行的所有弹幕 */
    public get truckAll(): Map<number, Truck> { return this._launchMap; }

    /**
     * 设置航线x坐标
     * @param x 
     */
    public setPositionX(x: number) {
        this._x = x;
    }
    /**
     * 设置航线y坐标
     * @param y 
     */
    public setPositionY(y: number) {
        this._y = y;
    }
    /**
     * 设置航线坐标
     * @param x 
     * @param y 
     */
    public setPosition(x: number, y: number) {
        this._x = x;
        this._y = y;
    }
    /**
     * 设置航线编号
     * @param n 
     */
    public setNum(n: number) {
        this._num = n;
    }
    /**
     * 设置航线宽和长
     * @param w 宽
     * @param l 长
     */
    public setLaneSize(w: number, l: number) {
        this._width = w;
        this._length = l;
    }
    /**
     * 设置弹幕载体
     * @param carrier 
     */
    public setCarrier(carrier: cc.Node) {
        this._carrier = carrier;
    }
    /**
     * 设置弹幕区域
     * @param area 
     */
    public setBarrageArea(area: cc.Node) {
        this._area = area;
    }
    /**
     * 设置弹幕运行时间
     * @param t 
     */
    public setTime(t: number) {
        this._time = t;
    }
    /**
     * 设置弹幕打包监听
     * @param packFn 
     * @param caller 
     */
    public setPackListener(packFn: (param: barrageListenerParam_t) => void, caller: any) {
        this._packMethod = packFn;
        this._packCaller = caller;
    }
    /**
     * 设置弹幕出站监听
     * @param outboundFn 
     * @param caller 
     */
    public setOutboundListener(outboundFn: (param: barrageListenerParam_t) => void, caller: any) {
        this._outboundHandler = EventSystem.Handler.create(caller, outboundFn);
    }
    /**
     * 设置弹幕到站监听
     * @param pullInFn 
     * @param caller 
     */
    public setPullInListener(pullInFn: (param: barrageListenerParam_t) => void, caller: any) {
        this._pullInHandler = EventSystem.Handler.create(caller, pullInFn);
    }
    /**
     * 增加弹幕
     * @param barrage 
     */
    public addBarrage(barrage: barrage_t) {
        let truck: Truck;
        if (this._pool.size() === 0) {
            let newNode: cc.Node = cc.instantiate(this._carrier);
            newNode.active = this._active;
            this._area.addChild(newNode);
            this._pool.put(new Truck(this.truckID++, barrage.content, new cc.Color().fromHEX(barrage.color), newNode));
            truck = this._pool.get();
            truck.setStartPosition(this._length / 2, this._y);
            truck.setDistance(this._length);
            truck.setTime(this._time);
            truck.setPackListener(EventSystem.Handler.create(this._packCaller, this._packMethod));
            truck.setOutboundListener(EventSystem.Handler.create(this, this.onOutbound));
            truck.setPullInListener(EventSystem.Handler.create(this, this.onPullIn));
        }
        else {
            truck = this._pool.get();
            truck.carrier.active = this._active;
            truck.setStartPosition(this._length / 2, this._y);
            truck.setContent(barrage.content);
            truck.setColor(new cc.Color().fromHEX(barrage.color));
        }
        if (!this._launchMap.has(truck.ID)) {
            this._launchMap.set(truck.ID, truck);
        }
        this._ldle = false;
        truck.drive();
    }
    public run() {
        if (!this._active) return;
        this._ldle = true;
        this._launchMap.forEach((truck: Truck) => {
            truck.run();
            if (truck.status === Truck.TruckStatus.LAUNCH) {
                this._ldle = false;
            }
        });
    }

    /**关闭 */
    private close() {
        this._ldle = true;
        this._launchMap.forEach((truck: Truck, k: number, map: Map<number, Truck>) => {
            truck.carrier.active = false;
            truck.reset();
            this._pool.put(truck);
            map.delete(k);
        });
    }

    private onOutbound(truck: Truck) {
        this._outboundHandler.apply({carrier: truck.carrier, content: truck.content, color: truck.color});
    }
    private onPullIn(truck: Truck) {
        this._pool.put(truck);
        this._launchMap.delete(truck.ID);
        this._pullInHandler.apply({carrier: truck.carrier, content: truck.content, color: truck.color});
    }
}