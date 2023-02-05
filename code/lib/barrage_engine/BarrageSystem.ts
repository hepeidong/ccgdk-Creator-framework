import { BarrageLayout } from "./BarrageLayout";
import { Vector } from "./Vector";
import { Truck } from "./Truck";
import { Utils } from "../utils/GameUtils";


const BARRAGE_MAX = 100;    //弹幕最大数量

/**
 * 弹幕系统, 负责弹幕区域大小, 弹幕航线的控制, 弹幕的控制
 */
export class BarrageSystem {
    private _timer: number;               //计时器
    private _timerShaft: number;          //弹幕滚动时间轴
    private _intensity: number;           //弹幕密集度
    private _barrageCount: number;        //弹幕数量
    private _barrageIndex: number;        //弹幕列表索引
    private _barrageList: barrage_t[];    //弹幕数据列表
    private _barrageStack: barrage_t[];   //弹幕运行队列
    private _layout: BarrageLayout;       //弹幕布局大小
    private _scheduler: cc.Scheduler;     //系统调度器

    constructor() {
        this._timer = 0;
        this._timerShaft = 0;
        this._intensity = 0;
        this._barrageCount = 0;
        this._barrageIndex = 0;
        this._barrageList = [];
        this._barrageStack = [];
        this._layout = new BarrageLayout();

        this._scheduler = cc.director.getScheduler();
        this._scheduler.enableForTarget(this);
    }
    /**弹幕最大数量 */
    public get barrageMaxLen(): number { return this._barrageCount; }

    /**
     * 弹幕系统启动
     * @param barrageData 弹幕数据
     */
    public launch(barrageData: barrageData_t[]) {
        let delayList: number[] = Utils.MathUtil.randomNonRepeat(0, this._timerShaft, this._barrageCount);
        delayList.sort((a: number, b: number) => a - b);
        for (let i: number = 0; i < barrageData.length; ++i) {
            this._barrageList.push({content: barrageData[i].content, delay: delayList[i], color: barrageData[i].color});
        }
        this._layout.setActive(true);
        this._layout.open();
        this.run();
    }

    public close() {
        this._timer = 0;
        this._barrageIndex = 0;
        this._barrageList.splice(0, this._barrageList.length);
        this._barrageStack.splice(0, this._barrageStack.length);
        this._layout.close();
        this._scheduler.unscheduleUpdate(this);
    }

    public pause() {
        this._scheduler.pauseTarget(this);
    }

    public resume() {
        this._layout.open();
        this._scheduler.resumeTarget(this);
    }

    /**
     * 设置时间轴
     * @param time 
     */
    public setTimerShaft(time: number) {
        this._timerShaft = time;
    }

    /**
     * 设置弹幕密集度0~1
     * @param intensity 
     */
    public setIntensity(intensity: number = 0.5) {
        this._intensity = intensity;
        this._barrageCount = Math.ceil(this._intensity * BARRAGE_MAX);
    }

    /**
     * 设置弹幕运动时间
     * @param time 
     */
    public setTravelTime(time: number) {
        this._layout.setTravelTime(time);
    }

    /**
     * 设置弹幕载体
     * @param carrier 
     */
    public setCarrier(carrier: cc.Node) {
        this._layout.setCarrier(carrier);
    }
    /**
     * 设置弹幕区域
     * @param area 
     */
    public setBarrageArea(area: cc.Node) {
        this._layout.setBarrageArea(area);
    }

    /**
     * 初始化弹幕系统
     * @param time 弹幕运行的时间轴, 即弹幕系统运行多长时间
     * @param travelTime 单个弹幕运动时间, 即弹幕滑过屏幕的时间
     * @param carrier 弹幕载体
     * @param area 弹幕区域
     * @param intensity 弹幕密集度0~1, 默认为0.5
     */
    public init(time: number, travelTime: number, carrier: cc.Node, area: cc.Node, intensity: number = 0.5) {
        this.setTimerShaft(time);
        this.setTravelTime(travelTime);
        this.setCarrier(carrier);
        this.setBarrageArea(area);
        this.setIntensity(intensity);
    }
    /**
     * 弹幕区域布局大小
     * @param width 弹幕区域宽
     * @param height 弹幕区域高
     * @param laneW 弹幕航线宽
     * @param spacing 航线之间的间距
     */
    public setLayout(width: number, height: number, laneW: number, spacing: number = 0) {
        this._layout.setLayoutSize(width, height, laneW, spacing);
    }

    /**
     * 设置弹幕打包监听
     * @param listener 
     * @param caller 
     */
    public setPackListener(listener: (param: barrageListenerParam_t) => void, caller: any) {
        this._layout.setPackListener(listener, caller);
    }
    /**
     * 设置弹幕出站监听
     * @param listener 
     * @param caller 
     */
    public setOutboundListener(listener: (param: barrageListenerParam_t) => void, caller: any) {
        this._layout.setOutboundListener(listener, caller);
    }
    /**
     * 设置弹幕到站监听
     * @param listener 
     * @param caller 
     */
    public setPullInListener(listener: (param: barrageListenerParam_t) => void, caller: any) {
        this._layout.setPullInListener(listener, caller);
    }

    /**
     * 遍历每一个正在运行的弹幕
     * @param callback 
     */
    public forEach(callback: (truck: Truck, index: number, length: number) => void) {
        this._layout.forEach(callback);
    }

    /**正在运行的弹幕总个数 */
    public count() {
        return this._layout.count();
    }

    //运行弹幕
    private run() {
        this._scheduler.scheduleUpdate(this, 0, false);
    }

    update(dt) {
        this._timer += dt;
            if (this._timer >= this._timerShaft) return;
            
            let barrage: barrage_t = this._barrageList[this._barrageIndex];
            if (barrage && this._timer >= barrage.delay) {
                //采用栈的存储方式, 以跳过因没有航线而无法显示运行的弹幕
                this._barrageStack.push(barrage);
                let lane: Vector = this._layout.getUsableLane();
                if (lane) {
                    lane.addBarrage(this._barrageStack.pop());
                }
                this._barrageIndex++;
            }
            this._layout.run();
    }
}