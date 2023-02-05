import { BarrageSystem } from "../../barrage_engine/BarrageSystem";
import { Truck, truckStatus } from "../../barrage_engine/Truck";
import { Debug } from "../../Debugger";

const {ccclass, property, menu} = cc._decorator;

@ccclass
@menu('游戏通用组件/弹幕/BarrageArea(弹幕区域组件)')
export default class BarrageArea extends cc.Component {

    @property({
        type: cc.Node,
        tooltip: '弹幕节点'
    })
    private barrage: cc.Node = null;

    @property({
        type: cc.Float,
        range: [0, 1, 0.1],
        slide: true,
        tooltip: '弹幕密集度, 此属性会影响弹幕数量, 数值0~1'
    })
    private intensity: number = 0.5;

    @property({
        type: cc.Integer,
        step: 0.1,
        tooltip: '航线间隔, 此属性会影响弹幕区域, 弹幕的航线数量'
    })
    private spacing: number = 0;

    private _barrageSys: BarrageSystem;

    /**弹幕最大数量 */
    public get barrageMaxLen(): number { return this._barrageSys.barrageMaxLen; }
    public static get TruckStatus(): typeof truckStatus { return truckStatus; }

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        Debug.log('弹幕组件加载完');
        this._barrageSys = new BarrageSystem();
        this._barrageSys.setBarrageArea(this.node);
        this._barrageSys.setCarrier(this.barrage);
        this._barrageSys.setIntensity(this.intensity > 1 ? 1 : this.intensity);
    }

    start () {
        
    }

    /**
     * 初始化弹幕系统
     * @param timerShaft 弹幕运行的时间轴, 即弹幕系统运行多长时间
     * @param travelTime 单个弹幕运动时间, 即弹幕滑过屏幕的时间
     */
    public init(timerShaft: number, travelTime: number) {
        Debug.log('初始化弹幕系统');
        this._barrageSys.setTimerShaft(timerShaft);
        this._barrageSys.setTravelTime(travelTime);
    }

    /**
     * 弹幕系统准备完成, 必须在弹幕系统初始化完成, 各类参数设置完成后调用此接口, 不可以率先调用此接口, 此接口调用之后, 弹幕就可以调用launch启动
     */
    public sysReadied() {
        this._barrageSys.setLayout(this.node.width, this.node.height, this.barrage.height, this.spacing);
    }

    /**
     * 弹幕系统启动
     * @param barrageData 弹幕数据
     */
    public launch(barrageData: barrageData_t[]) {
        this._barrageSys.launch(barrageData);
    }

    /**关闭弹幕系统 */
    public close() {
        this._barrageSys.close();
    }

    /**暂停弹幕系统 */
    public pause() {
        this._barrageSys.pause();
    }

    /**恢复弹幕系统运行 */
    public resume() {
        this._barrageSys.resume();
    }

    /**正在运行的弹幕总个数 */
    public count() {
        return this._barrageSys.count();
    }

    /**
     * 设置弹幕密集度0~1
     * @param intensity 
     */
    public setIntensity(intensity: number = this.intensity) {
        this._barrageSys.setIntensity(intensity);
    }

    /**
     * 设置弹幕打包监听
     * @param listener 
     * @param caller 
     */
    public setPackListener(listener: (param: barrageListenerParam_t) => void, caller: any) {
        this._barrageSys.setPackListener(listener, this);
    }

    /**
     * 设置弹幕出站监听
     * @param listener 
     * @param caller 
     */
    public setOutboundListener(listener: (param: barrageListenerParam_t) => void, caller: any) {
        this._barrageSys.setOutboundListener(listener, caller);
    }

    /**
     * 设置弹幕到站监听
     * @param listener 
     * @param caller 
     */
    public setPullInListener(listener: (param: barrageListenerParam_t) => void, caller: any) {
        this._barrageSys.setPullInListener(listener, caller);
    }

    /**
     * 遍历每一个正在运行的弹幕
     * @param callback 
     */
    public forEach(callback: (truck: Truck, index: number, length: number) => void) {
        this._barrageSys.forEach(callback);
    }

    // update (dt) {}
}
