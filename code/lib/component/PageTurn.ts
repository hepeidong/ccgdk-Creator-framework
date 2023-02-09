import { EventSystem } from "../event_manager/EventSystem";
import { Utils } from "../utils";

enum PageEvent {
    PAGE_INIT = 'page_init',
    PAGE_TURNING = 'page_turning'
}

enum PageType {
    VERTICAL,
    HORIZONTAL
}

const CACHE_PAGE_MAX = 3;

const page_t = cc.Enum(PageType);

const {ccclass, property, menu, disallowMultiple} = cc._decorator;


@ccclass
@disallowMultiple
@menu('游戏通用组件/UI/PageTurn(翻页组件)')
export default class PageTurn extends cc.Component {

    @property({
        type: cc.Prefab,
        tooltip: '页面模板预制体'
    })
    private page: cc.Prefab = null;

    @property({
        type: cc.Node,
        tooltip: '页面父节点, 控制所有页面移动'
    })
    private content: cc.Node = null;

    @property({
        tooltip: '页面的总数'
    })
    private totalPage: number = 0;

    @property({
        type: page_t,
        tooltip: '页面布局方式：VERTICAL垂直；HORIZONTAL水平'
    })
    private pageType: PageType = PageType.HORIZONTAL;

    @property({
        type: cc.Node,
        tooltip: '向左或者向上滚动按钮'
    })
    private toLeftMenu: cc.Node = null;

    @property({
        type: cc.Node,
        tooltip: '向右或者向下滚动按钮'
    })
    private toRightMenu: cc.Node = null;
  


    private _pageNodes: cc.Node[];     //页面节点列表
    private _pageIndex: number;         //页面的页码标签索引, 从0开始
    private _pageIndicator: number;     //页面滚动索引, 控制三张页面互相轮换显示内容, 从0开始
    private _clicked: boolean;
    private _startTouchPos: cc.Vec2;        //开始触摸点
    private _moveDistance: number;          //滑动距离

    public static get PageEvent(): typeof PageEvent { return PageEvent; }

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this._pageNodes = [];
        this._pageIndex = 0;
        this._pageIndicator = 0;
        this._clicked = false;
        this.content.width = this.node.width;
        this.content.height = this.node.height;
        this.content.position = cc.v3(0, 0);

        this.register();
        this.instantiatePage();
    }

    start () {
        
    }

    register() {
        EventSystem.click(this.toLeftMenu, this, this.onLeftMenuClicked);
        EventSystem.click(this.toRightMenu, this, this.onRightMenuClicked);
        
        // this.content.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        // this.content.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        // this.content.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
    }

    public initPage() {
        if (this._pageIndex === this.totalPage) return;
        this.toRightMenu.active = this._pageIndex < this.totalPage - 1;
        this.toLeftMenu.active = this._pageIndex > 0;
        let pageIndex: number = this._pageIndex + 1 === this.totalPage ? this._pageIndex - 1 : this._pageIndex;
        for (let i: number = CACHE_PAGE_MAX - 1; i >= 0; --i) {
            let index: number = i + (pageIndex > 0 ? pageIndex - 1 : pageIndex);
            if (index >= this.totalPage) continue;
            EventSystem.event.emit(PageEvent.PAGE_INIT, {page: this._pageNodes[i], index: index});
        }
    }

    private onTouchStart(event: cc.Event.EventTouch) {
        this._startTouchPos = event.getLocation();
    }

    private onTouchMove(event: cc.Event.EventTouch) {   
        let loca: cc.Vec2 = event.getLocation();
        this._moveDistance = Utils.MathUtil.distance(cc.v3(this._startTouchPos.x, this._startTouchPos.y), cc.v3(loca.x, loca.y));
        if (this.pageType === PageType.HORIZONTAL) {
            
        }
    }

    private onTouchEnd(event: cc.Event.EventTouch) {

    }

    public setTotalPage(total: number) {
        this.totalPage = total;
    }

    private instantiatePage() {
        for (let i: number = 0; i < 3; ++i) {
            let newNode: cc.Node = cc.instantiate(this.page);
            this.content.addChild(newNode);
            newNode.y = 0;
            this.initPagePos(i, newNode);
            this._pageNodes.push(newNode);
        }
    }

    private initPagePos(index: number, page: cc.Node) {
        if (this.pageType === PageType.HORIZONTAL) {
            page.y = 0;
            page.x = this.node.width * index;
        }
        else if (this.pageType === PageType.VERTICAL) {
            page.x = 0;
            page.y = -this.node.height * index;
        }
    }

    private setToLefPagePos(page: cc.Node) {
        if (this.pageType === PageType.HORIZONTAL) {
            page.x = this.node.width * this._pageIndex + this.node.width;
        }
        else if (this.pageType === PageType.VERTICAL) {
            page.y = this.node.height * this._pageIndex - this.node.height;
        }
    }

    private setToRightPagePos(page: cc.Node) {
        if (this.pageType === PageType.HORIZONTAL) {
            page.x = this.node.width * this._pageIndex - this.node.width;
        }
        else if (this.pageType === PageType.VERTICAL) {
            page.y = this.node.height * this._pageIndex + this.node.height;
        }
    }

    private movePage() {
        cc.tween(this.content).to(0.3, {position: cc.v3(-this.node.width * this._pageIndex, 0)}).call(() => this._clicked = false).start();
    }

    onLeftMenuClicked() {
        if (this._clicked) return;
        this._clicked = true;
        this._pageIndex--;
        this._pageIndicator--;
        this.toRightMenu.active = true;
        //当页面轮换指针指向第一张页面时, 页面需要轮换, 把最右边的页面移动到最左边, 以显示前面的页面
        if (this._pageIndicator === 0 && this._pageIndex > 0) {
            this._pageIndicator = 1;

            let temp: cc.Node = this._pageNodes[2];
            this.setToRightPagePos(temp);

            //移动完位置之后, 交换页面节点列表的位置
            for (let i: number = 1; i >= 0; --i) {
                this._pageNodes[i + 1] = this._pageNodes[i];
            }
            this._pageNodes[0] = temp;

            //此时页面移动到了当前显示的页码 - 1的位置, 因为移动的页面, 用来显示屏幕外前面那张看不见的页面的内容
            EventSystem.event.emit(PageEvent.PAGE_TURNING, {page: temp, index: this._pageIndex - 1});
        }
        else if (this._pageIndicator === 0 && this._pageIndex === 0) {
            this.toLeftMenu.active = false;
        }
        this.movePage();
    }

    onRightMenuClicked() {
        if (this._clicked) return;
        this._clicked = true;
        this._pageIndex++;
        this._pageIndicator++;
        this.toLeftMenu.active = true;
        //当页面轮换指针指向第三张页面时, 页面需要轮换, 把最左边的页面移动到最右边, 以显示后面的页面
        if (this._pageIndicator === 2 && this._pageIndex < this.totalPage - 1) {
            this._pageIndicator = 1;
            let temp: cc.Node = this._pageNodes[0];
            this.setToLefPagePos(temp);
            //移动完位置之后, 交换页面节点列表的位置
            for (let i: number = 1; i < 3; ++i) {
                this._pageNodes[i - 1] = this._pageNodes[i];
            }
            this._pageNodes[2] = temp;
            //此时页面移动到了当前显示的页码 + 1的位置, 因为移动的页面, 用来显示屏幕外后面那张看不见的页面的内容
            EventSystem.event.emit(PageEvent.PAGE_TURNING, {page: temp, index: this._pageIndex + 1});
        }
        else if (this._pageIndicator === 2 && this._pageIndex === this.totalPage - 1) {
            this.toRightMenu.active = false;
        }
        this.movePage();
    }

    // update (dt) {}
}
