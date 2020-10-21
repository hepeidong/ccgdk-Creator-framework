
/**
 * author: 何沛东
 * date: 2020/9/28
 * description: 常用的功能组件，用于多点触摸对应多目标的绝大多数情况下功能的实现
 */
const { ccclass, property, menu } = cc._decorator;

enum SortType {
    /**按顺序排列 */
    PUT_IN_ORDER,
    /**寻找最近的位置放入 */
    PUT_IN_NEAEREST
}

let sortType = cc.Enum(SortType);

@ccclass('TargetArea')
class TargetArea {
    constructor() { }

    @property({
        type: cc.Node,
        displayName: '目标区域节点'
    })
    target: cc.Node = null;

    @property({
        type: cc.Integer,
        displayName: '凹槽个数'
    })
    grooveCount: number = 0;
}

@ccclass('OriginArea')
class OriginArea {
    constructor() { }

    @property({
        type: cc.Node,
        displayName: '初始区域节点'
    })
    origin: cc.Node = null;

    @property({
        type: cc.Integer,
        displayName: '初始位置个数'
    })
    originCount: number = 0;
}

@ccclass('BallNode')
class BallNode {
    constructor() { }

    @property({
        type: cc.Node,
        displayName: '触摸小球'
    })
    ball: cc.Node = null;

    /**目标区域第几号凹槽，0表示没有放入目标区域 */
    public tarGrNum: number = 0;
    /**初始区域第几号凹槽，0表示已经移出初始区域 */
    public origGrNum: number = 0;
    /**小球是否已经移出初始位置 */
    public removed: boolean = false;
    /**小球移入目标位置 */
    public intersect: boolean = false;
}

@ccclass
@menu('常用功能组件/TouchControl(触摸功能组件)')
export default class TouchControl extends cc.Component {

    @property({
        type: TargetArea,
        displayName: '目标区域',
        visible() {
            if (!this.targetArea) {
                this.targetArea = new TargetArea();
                this.targetArea.target = new cc.Node('targetArea');
                this.targetArea.target.parent = this.node;
            }
            else if (!this.targetArea.target) {
                this.targetArea.target = new cc.Node('targetArea');
                this.targetArea.target.parent = this.node;
            }
            return true;
        }
    })
    targetArea: TargetArea = null;

    @property({
        type: OriginArea,
        displayName: '初始区域',
        visible() {
            if (!this.originArea) {
                this.originArea = new OriginArea();
                this.originArea.origin = new cc.Node('originArea');
                this.originArea.origin.parent = this.node;
            }
            else if (!this.originArea.origin) {
                this.originArea.origin = new cc.Node('originArea');
                this.originArea.origin.parent = this.node;
            }
            return true;
        }
    })
    originArea: OriginArea = null;

    @property({
        tooltip: '激活触摸事件'
    })
    activeTouch: boolean = true;

    @property({
        type: sortType,
        tooltip: `PUT_IN_ORDER：小球会按顺序排列放入
            PUT_IN_NEAEREST：小球会寻找最近的位置放入
        `
    })
    sortWay: SortType = sortType.PUT_IN_ORDER;

    @property({
        type: cc.Node,
        tooltip: '目标凹槽列表'
    })
    private targetGrooves: cc.Node[] = [];

    @property({
        type: BallNode,
        tooltip: '触摸小球列表'
    })
    private ballList: BallNode[] = [];

    @property(cc.Component.EventHandler)
    mouseEnterEvent: cc.Component.EventHandler = null;

    @property(cc.Component.EventHandler)
    mouseLeaveEvent: cc.Component.EventHandler = null;

    @property(cc.Component.EventHandler)
    touchStartEvent: cc.Component.EventHandler = null;

    @property(cc.Component.EventHandler)
    touchMoveEvent: cc.Component.EventHandler = null;

    @property(cc.Component.EventHandler)
    touchEndEvent: cc.Component.EventHandler = null;

    @property(cc.Component.EventHandler)
    touchCancelEvent: cc.Component.EventHandler = null;

    /**初始区域凹槽位置标记，0表示没有移走，1表示已经移到目标凹槽上 */
    private origGrFlags: number[] = [];
    /**目标区域凹槽位置标记，0表示没有小球放入，1表示有小球放入 */
    private tarGrFlags: number[] = [];
    private _targetRect: cc.Rect;
    private _oldPosition: cc.Vec3;
    private _ballCount: number = 0;
    private _ballOriginList: cc.Vec3[] = [];
    private _ballSizeList: cc.Size[] = [];

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        let sp: cc.Sprite = this.targetArea.target.getComponent(cc.Sprite);
        if (sp) {
            this._targetRect = sp.spriteFrame.getRect();
        }
        else {
            this._targetRect = new cc.Rect(0, 0, 0, 0);
        }

        this.initBall();
        this.initArray(this.origGrFlags, this.originArea.originCount);
        this.initArray(this.tarGrFlags, this.targetArea.grooveCount);
        this.initOrignList();
        this.registerEvent();
    }

    start() {

    }

    /**目标区域小球个数 */
    public get ballCount(): number { return this._ballCount; }
    public get ballTypes(): BallNode[] { return this.ballList; }
    public get tarGrooves(): cc.Node[] { return this.targetGrooves; }
    public get tarArea(): cc.Node { return this.targetArea.target; }

    /**
     * 小球是否移动到了目标区域里
     * @param ballIndex 小球列表索引
     */
    public inTargetArea(ballIndex: number): boolean {
        return this.ballList[ballIndex].intersect;
    }

    /**把小球恢复到原来的初始状态 */
    public recover() {
        let flag: boolean = false;
        let isInit: boolean = false;//是否需要初始化
        let wrongNums: number[] = [];
        for (let i: number = 0; i < this.ballList.length; ++i) {
            if (this.ballList[i].tarGrNum > 0 && this.ballList[i].origGrNum > 0) {
                debugger;
            }
            if (this.ballList[i].tarGrNum > 0) {
                isInit = true;
                if (this.origGrFlags[i] === 0) {
                    flag = true;
                }
            }
            if (flag) {
                //找出占用了其它小球位置的该小球编号
                wrongNums.push(i + 1);
                flag = false;
            }
        }
        for (let e of wrongNums) {
            let grooveIndex: number = this.tarGrFlags.indexOf(0);
            this.putDownTargetArea(e, grooveIndex + 1);
        }
        console.log('recover isInit', isInit);
        if (isInit) {
            this.putDownBallAllToOriginArea();
        }
    }

    /**
     * 移动到指定目标区域
     * @param origGrNums 初始位置上的小球编号，从1开始
     * @param tarGrNums 目标区域的位置，从1开始
     * @param durat 持续时间
     * @param recover 是否要把不在初始区域上的小球回到初始区域，初始值为true，如果传入false，当找不到初始区域相应编号的小球时，返回false，移动失败
     * @example moveToTarget([1, 2, 3], [1, 2, 3], 1);
     */
    public moveToTarget(origGrNums: number[], tarGrNums: number[], durat: number, recover: boolean = true): boolean {
        if (origGrNums.length !== tarGrNums.length) {
            return false;
        }
        if (tarGrNums.length > this.targetArea.grooveCount) {
            return false;
        }
        let origBalls: BallNode[] = [];

        let res = this.getOriginBalls(origGrNums, recover);
        if (res.flag) {
            origBalls = res.balls;
        }
        else {
            return false;
        }

        for (let i: number = 0; i < tarGrNums.length; ++i) {
            if (tarGrNums[i] > this.targetArea.grooveCount) {
                return false;
            }
            
            
            let position =  utils.EngineUtil.convertPosition(this.targetArea.target, origBalls[i].ball.parent,
                cc.v2(this.tarGrooves[tarGrNums[i] - 1].x, this.tarGrooves[tarGrNums[i] - 1].y));

            if (durat > 0) {
                cc.tween(origBalls[i].ball).to(durat, { position: cc.v3(position.x, position.y) })
                    .call(() => {
                        origBalls[i].removed = true;//设置小球为已经移出初始位置状态
                        let index: number = this.getIndexOf((e) => { return e.origGrNum === origGrNums[i]; });
                        this.putDownTargetArea(index + 1, tarGrNums[i]); 
                    })
                    .start();
            }
            else {
                origBalls[i].removed = true;//设置小球为已经移出初始位置状态
                let index: number = this.getIndexOf((e) => { return e.origGrNum === origGrNums[i]; });
                this.putDownTargetArea(index + 1, tarGrNums[i]);
            }
        }
        return true;
    }

    /**返回所有小球 */
    public getBalls() {
        let balls: cc.Node[] = [];
        for (let e of this.ballList) {
            balls.push(e.ball);
        }
        return balls;
    }

    /**返回当前初始区域里的小球 */
    public getBallsInOriginArea(start: number = 1, end: number = this.ballList.length): cc.Node[] {
        let balls: cc.Node[] = [];
        for (let e of this.ballList) {
            if (e.origGrNum > 0 && e.origGrNum >= start && e.origGrNum <= end) {
                balls.push(e.ball);
            }
        }
        return balls;
    }

    /**返回目标区域的小球 */
    public getBallsInTargetArea(start: number = 1, end: number = this.ballList.length): cc.Node[] {
        let balls: cc.Node[] = [];
        for (let e of this.ballList) {
            if (e.tarGrNum > 0 && e.tarGrNum >= start && e.tarGrNum <= end) {
                balls[e.tarGrNum - 1] = e.ball;
            }
        }
        return balls;
    }

    /**把目标区域所有小球放入到初始区域 */
    public putDownBallAllToOriginArea() {
        for (let i = 0; i < this.ballList.length; ++i) {
            if (this.ballList[i].tarGrNum > 0) {
                let originIndex: number = this.origGrFlags.indexOf(1);
                this.putDownOriginArea(i + 1, originIndex + 1);
            }
        }
    }

    /**按编号返回初始区域里的小球 */
    private getOriginBalls(origGrNums: number[], recover: boolean): {balls: BallNode[]; flag: boolean} {
        let origBalls: BallNode[] = [];
        for (let e of origGrNums) {
            let indexs: number[] = [];
            let flag: boolean = false;
            for (let i: number = 0; i < this.ballList.length; ++i) {
                if (e === this.ballList[i].origGrNum) {
                    origBalls.push(this.ballList[i]);
                    flag = true;
                    break;
                }
                else if (this.ballList[i].origGrNum === 0) {
                    indexs.push(i);
                }
            }
            if (!flag) {
                if (recover) {
                    //这些小球不在初始区域里，需要把它们先放入初始区域
                    for (let n: number = 0; n < indexs.length; ++n) {
                        let originIndex: number = this.origGrFlags.indexOf(1);
                        this.putDownOriginArea(indexs[n] + 1, originIndex + 1);
                    }
                }
                else {
                    if (this.origGrFlags[e - 1] === 1) {
                        return {balls: origBalls, flag: false};
                    }
                }
            }
        }
        return {balls: origBalls, flag: true};
    }

    /**返回某个编号下的小球索引 */
    private getIndexOf(callback: (e: BallNode) => boolean) {
        let index: number = -1;
        for (let e of this.ballList) {
            index++;
            if (callback(e)) {
                break;
            }
        }
        return index;
    }

    private convertParent(child: cc.Node, parent: cc.Node, position: cc.Vec3) {
        if (!child) {
            return;
        }

        child.parent = parent;
        child.position = position;
    }

    private initBall() {
        for (let i: number = 0; i < this.ballList.length; ++i) {
            this.ballList[i].origGrNum = i + 1;
            this.ballList[i].tarGrNum = 0;
            this._ballSizeList[i] = cc.size(this.ballList[i].ball.width, this.ballList[i].ball.height);
        }
    }

    private initArray(array: number[], len: number) {
        for (let i: number = 0; i < len; ++i) {
            array[i] = 0;
        }
    }

    private initOrignList() {
        for (let e of this.ballList) {
            this._ballOriginList.push(e.ball.position);
        }
    }

    private registerEvent() {
        for (let i: number = 0; i < this.ballList.length; ++i) {
            kit.event(this.ballList[i].ball, this)
                .onMouseEnter(() => {
                    this.onMouseEnter(i);
                }).onMouseLeave(() => {
                    this.onMouseLeave(i);
                }).onStart((evt) => {
                    let data = {
                        target: 'onTouchStart',
                        behavior: 'onTouchStart',
                        event: "click",
                        content: {
                            i: i,
                            x: evt.getLocationX(),
                            y: evt.getLocationY()
                        }
                    };
                    this.onTouchStart(data);
                }).onMove((evt) => {
                    let data = {
                        target: 'onTouchMove',
                        behavior: 'onTouchMove',
                        event: "click",
                        content: {
                            i: i,
                            x: evt.getLocationX(),
                            y: evt.getLocationY()
                        }
                    };
                    this.onTouchMove(data);
                }).onEnd(() => {
                    let data = {
                        target: 'onTouchEnd',
                        behavior: 'onTouchEnd',
                        event: "click",
                        content: {
                            i: i
                        }
                    };
                    this.onTouchEnd(data);
                }).onCancel(() => {
                    let data = {
                        target: 'onTouchCancel',
                        behavior: 'onTouchCancel',
                        event: "click",
                        content: {
                            i: i
                        }
                    };
                    this.onTouchCancel(data);

                });
        }
    }

    private getMinDisOfIndex(targetList: cc.Node[]|cc.Vec3[], ball: cc.Node, parent: cc.Node, callback: (index: number) => boolean): number {
        let min: {dis: number; index: number;} = {dis: 0, index: 0};
        for (let i: number = 0; i < targetList.length; ++i) {
            let position: cc.Vec2 = utils.convertPosition(ball.parent, parent, cc.v2(ball.x, ball.y));
            let dis: number = utils.EngineUtil.distance(position, targetList[i]);
            min = {dis: dis, index: i};
            if (min.dis > dis && callback(i)) {
                min = {dis: dis, index: i};
                console.log('distance', min);
            }
        }
        return min.index;
    }

    /**
     * 放下小球
     * @param data 
     */
    private putDownBall(data: any) {
        if (this.ballList[data.content.i].intersect) {
            let grooveIndex: number;
            if (this.sortWay === SortType.PUT_IN_ORDER) {
                grooveIndex = this.tarGrFlags.indexOf(0);
            }
            else if (this.sortWay === SortType.PUT_IN_NEAEREST) {
                grooveIndex = this.getMinDisOfIndex(this.targetGrooves, this.ballList[data.content.i].ball, 
                    this.targetArea.target,
                    (index) => {
                    return this.tarGrFlags[index] === 0;
                });
            }
            this.putDownTargetArea(data.content.i + 1, grooveIndex + 1);
        }
        else {
            let originIndex: number;
            if (this.sortWay === SortType.PUT_IN_ORDER) {
                originIndex = this.origGrFlags.indexOf(1);
            }
            else if (this.sortWay === SortType.PUT_IN_NEAEREST) {
                originIndex = this.getMinDisOfIndex(this._ballOriginList, this.ballList[data.content.i].ball, 
                    this.originArea.origin,
                    (index) => {
                    return this.origGrFlags[index] === 1;
                });
            }
            this.putDownOriginArea(data.content.i + 1, originIndex + 1);
        }
    }

    /**
     * 小球放到目标区域里
     * @param ballNumber 小球号码，从1开始，数组操作需要减一
     * @param grooveNumber 目标区域凹槽位置编号，从1开始
     */
    private putDownTargetArea(ballNumber: number, grooveNumber: number) {
        if (grooveNumber > 0 && this.ballList[ballNumber - 1].tarGrNum === 0) {
            this.ballList[ballNumber - 1].tarGrNum = grooveNumber;
            this.tarGrFlags[grooveNumber - 1] = 1;
            this.origGrFlags[this.ballList[ballNumber - 1].origGrNum - 1] = 1;
            this.ballList[ballNumber - 1].origGrNum = 0;
            this._ballCount++;
            this.convertParent(this.ballList[ballNumber - 1].ball, this.targetArea.target, this.targetGrooves[grooveNumber - 1].position);
        }
        else {
            this.ballList[ballNumber - 1].ball.position = this._oldPosition;
        }
    }

    /**
     * 小球放到初始区域里
     * @param ballNumber 小球号码
     * @param originNumber 小球被移走的初始区域凹槽索引
     */
    private putDownOriginArea(ballNumber: number, originNumber: number) {
        let ballIndex = 0; //要放下的小球的位置索引
        if (this.ballList[ballNumber - 1].removed) {
            console.log('putDownOriginArea originNumber', originNumber);
            //底板凹槽有空出来的位置
            if (originNumber > 0) {
                ballIndex = originNumber - 1;
                //把这个位置数据赋值0，表示需要在这个凹槽位置放入一个小球
                this.origGrFlags[originNumber - 1] = 0;
                //把原来非空闲的凹槽，变成空闲状态，因为这个号码的小球可能要放入到别的空闲凹槽里
                if (this.ballList[ballNumber - 1].origGrNum > 0) {
                    this.origGrFlags[this.ballList[ballNumber - 1].origGrNum - 1] = 1;
                    this.ballList[ballNumber - 1].origGrNum = 0;
                }
                //这个凹槽放入的是几号小球
                this.ballList[ballNumber - 1].origGrNum = originNumber;
            }
            else {
                ballIndex = this.ballList[ballNumber - 1].origGrNum - 1;
            }

            //一颗小球回到初始区域里
            //当前小球在哪个凹槽上
            let index = this.ballList[ballNumber - 1].tarGrNum - 1;
            //这个小球是从目标区域凹槽下落到初始区域凹槽上的
            if (index > -1) {
                ballIndex = originNumber - 1;
                this.ballList[ballNumber - 1].tarGrNum = 0;
                this.tarGrFlags[index] = 0;
                this._ballCount--;
            }

            this.ballList[ballNumber - 1].origGrNum = ballIndex + 1;
            this.ballList[ballNumber - 1].removed = false;
        }
        else {
            ballIndex = this.ballList[ballNumber - 1].origGrNum - 1;
        }

        if (ballIndex === -1) {
            this.initBall();
        }
        else {
            console.log('putDownOriginArea ballIndex', ballIndex);
            this.convertParent(this.ballList[ballNumber - 1].ball, this.originArea.origin, this._ballOriginList[ballIndex]);
            this.ballList[ballNumber - 1].intersect = false;
        }
    }

    private removedJudge(ball: cc.Node, index: number): boolean {
        let x1: number = this._ballOriginList[index].x - ball.width / 2;
        let x2: number = this._ballOriginList[index].x + ball.width / 2;
        let y1: number = this._ballOriginList[index].y - ball.height / 2;
        let y2: number = this._ballOriginList[index].y + ball.height / 2;

        if (ball.x >= x1 && ball.x <= x2 && ball.y >= y1 && ball.y <= y2) {
            return false;
        }
        return true;
    }

    onMouseEnter(data: number) {
        if (this.mouseEnterEvent) {
            this.mouseEnterEvent.emit([data]);
        }
    }

    onMouseLeave(data: number) {
        if (this.mouseLeaveEvent) {
            this.mouseLeaveEvent.emit([data]);
        }
    }

    onTouchStart(data: any) {
        if (this.activeTouch) {
            this._oldPosition = cc.v3(this.ballList[data.content.i].ball.x, this.ballList[data.content.i].ball.y);
            let pos: cc.Vec2 = utils.transitionPosition(this.ballList[data.content.i].ball.parent, cc.v2(data.content.x, data.content.y));
            this.ballList[data.content.i].ball.position = cc.v3(pos.x, pos.y);
        }
        if (this.touchStartEvent) {
            this.touchStartEvent.emit([data.content.i]);
        }
    }

    onTouchMove(data: any) {
        if (this.activeTouch) {
            let position = utils.transitionPosition(this.ballList[data.content.i].ball.parent, cc.v2(data.content.x, data.content.y));
            // cc.tween(this.ballList[data.content.i].ball).to(0.1, {position: cc.v3(position.x, position.y)}).start();
            this.ballList[data.content.i].ball.x = position.x;
            this.ballList[data.content.i].ball.y = position.y;
            this.ballList[data.content.i].intersect = utils.inersectJudge(this.targetArea.target, this.ballList[data.content.i].ball, this._targetRect);
            this.ballList[data.content.i].removed = this.removedJudge(this.ballList[data.content.i].ball, data.content.i);
        }
        if (this.touchMoveEvent) {
            this.touchMoveEvent.emit([data.content.i]);
        }
    }

    onTouchEnd(data: any) {
        if (this.activeTouch) {
            this.putDownBall(data);
        }
        if (this.touchEndEvent) {
            this.touchEndEvent.emit([data.content.i]);
        }
    }

    onTouchCancel(data: any) {
        if (this.activeTouch) {
            this.putDownBall(data);
        }
        if (this.touchCancelEvent) {
            this.touchCancelEvent.emit([data.content.i]);
        }
    }

    // update (dt) {}
}
