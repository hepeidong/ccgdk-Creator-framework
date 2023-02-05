import { Vector, VectorEvent } from "./Vector";
import { Truck } from "./Truck";
import { EventSystem } from "../cck";
import { SAFE_CALLBACK } from "../Define";

/**弹幕布局 */
export class BarrageLayout {
    private _time: number;             //弹幕运动时间
    private _height: number;           //弹幕区域高
    private _laneWidth: number;        //航线宽
    private _spacing: number;          //航线间隔
    private _vectors: Vector[];        //所有航线
    private _carrier: cc.Node;         //弹幕载体
    private _area: cc.Node;            //弹幕区域
    private _packCaller: any;                      //弹幕打包回调监听者
    private _packCallback: barrageListener_t;      //弹幕打包回调
    private _outboundCaller: any;                  //弹幕出站回调监听者
    private _outboundCallback: barrageListener_t;  //弹幕出站回调
    private _pullInCaller: any;                    //弹幕到站回调监听者
    private _pullInCallback: barrageListener_t;    //弹幕到站回调     

    constructor() {
        this._height = 0;
        this._laneWidth = 0;
        this._spacing = 0;
        this._vectors = [];
    }

    /**
     * 设置弹幕运动时间
     * @param time 
     */
    public setTravelTime(time: number) {
        this._time = time;
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
     * 弹幕布局大小
     * @param width 弹幕区域宽
     * @param height 弹幕区域高
     * @param laneW 弹幕航线宽
     * @param spacing 航线之间的间距
     */
    public setLayoutSize(width: number, height: number, laneW: number, spacing: number = 0) {
        this._height = height;
        this._laneWidth = laneW;
        this._spacing = spacing;
        //弹幕航线数量
        let laneCount: number = (this._height + this._spacing) / (this._laneWidth + this._spacing);
        for (let i: number = 1; i <= laneCount; ++i) {
            let y: number = height / 2 - i *(laneW + spacing);
            let x: number = 0;
            let lane = new Vector();
            lane.setPosition(x, y);
            lane.setNum(i);
            lane.setTime(this._time);
            lane.setLaneSize(this._laneWidth, width);
            lane.setCarrier(this._carrier);
            lane.setBarrageArea(this._area);
            lane.setPackListener(this._packCallback, this._packCaller);
            lane.setOutboundListener(this._outboundCallback, this._outboundCaller);
            lane.setPullInListener(this._pullInCallback, this._pullInCaller);
            this._vectors.push(lane);
        }
    }

    /**
     * 设置弹幕打包监听
     * @param packFn 
     * @param caller 
     */
    public setPackListener(packFn: (param: barrageListenerParam_t) => void, caller: any) {
        this._packCallback = packFn;
        this._packCaller = caller;
    }
    /**
     * 设置弹幕出站监听
     * @param outboundFn 
     * @param caller 
     */
    public setOutboundListener(outboundFn: (param: barrageListenerParam_t) => void, caller: any) {
        this._outboundCallback = outboundFn;
        this._outboundCaller = caller;
    }
    /**
     * 设置弹幕到站监听
     * @param pullInFn 
     * @param caller 
     */
    public setPullInListener(pullInFn: (param: barrageListenerParam_t) => void, caller: any) {
        this._pullInCallback = pullInFn;
        this._pullInCaller = caller;
    }

    /**获取可用的航线 */
    public getUsableLane() {
        for (let e of this._vectors) {
            if (e.ldle) {
                return e;
            }
        }
        return null;
    }

    /**运行所有弹幕 */
    public run() {
        for (let e of this._vectors) {
            e.run();
        }
    }

    /**设置所有弹幕航线激活状态 */
    public setActive(active: boolean) {
        for (let e of this._vectors) {
            e.active = active;
        }
    }

    public close() {
        this._area.active = false;
        EventSystem.event.emit(VectorEvent.CLEAR);
    }

    public open() {
        this._area.active = true;
    }

    /**
     * 遍历每一个正在运行的弹幕
     * @param callback 
     */
    public forEach(callback: (truck: Truck, index: number, length: number) => void) {
        let index: number = 0;
        for (let e of this._vectors) {
            e.truckAll.forEach((truck: Truck) => {
                SAFE_CALLBACK(callback, truck, index++);
            });
        }
    }

    /**正在运行的弹幕总个数 */
    public count() {
        let cnt: number = 0;
        for (let e of this._vectors) {
            cnt += e.truckAll.size;
        }
        return cnt;
    }
}