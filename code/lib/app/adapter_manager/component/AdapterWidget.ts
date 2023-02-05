import { AdapterManager } from "../AdapterManager";

const {ccclass, property, menu, disallowMultiple, executionOrder} = cc._decorator;

enum offsetType {
    NONE,
    TOP,
    RIGHT,
    DOWN,
    LEFT,
    UPPER_RIGHT,
    LOWER_RIGHT,
    LOWER_LEFT,
    UPPER_LEFT
}

const Offset = cc.Enum(offsetType);

@ccclass('AdapterZoom')
class AdapterZoom {

    @property({
        tooltip: '根据适配后缩放该节点的X轴',
        displayName: '适配X轴'
    })
    zoomX: boolean = true;

    @property({
        tooltip: '根据适配后缩放该节点的Y轴',
        displayName: '适配Y轴'
    })
    zoomY: boolean = true;

    constructor() {}
}
@ccclass('AdapterSize')
class AdapterSize {
    @property({
        tooltip: '根据适配后改变该节点的宽',
        displayName: '适配宽'
    })
    adapterW: boolean = true;

    @property({
        tooltip: '根据适配后改变该节点的高',
        displayName: '适配高'
    })
    adapterH: boolean = true;

    constructor() {}
}

@ccclass
@disallowMultiple
@executionOrder(99)
@menu('游戏通用组件/适配/AdapterWidget(内容适配组件)')
export default class AdapterWidget extends cc.Component {

    @property({
        tooltip: '是否适配刘海'
    })
    adapterBang: boolean = false;

    @property({
        type: Offset,
        tooltip: `设置节点的适配偏移：
        NONE：没有偏移类型；
        TOP：向上偏移；
        RIGHT：向右偏移；
        DOWN： 向下偏移；
        LEFT： 向左偏移；
        UPPER_RIGHT： 向右上角偏移；
        LOWER_RIGHT： 向右下角偏移；
        LOWER_LEFT： 向左下角偏移；
        UPPER_LEFT： 向左上角偏移`
    })
    adapterOffset: offsetType = Offset.NONE;

    @property({
        tooltip: '该节点会根据适配后进行适配背景节点, 会铺满全屏',
        displayName: '背景适配'
    })
    zoom: boolean = false;

    @property({
        type: AdapterZoom,
        tooltip: '适配该节点的大小',
        visible() {
            return this.zoom;
        }
    })
    adapterSize: AdapterZoom = new AdapterZoom();

    @property({
        tooltip: '会适配节点大小',
        displayName: '节点适配'
    })
    size: boolean = false;

    @property({
        type: AdapterSize,
        visible() {
            return this.size;
        }
    })
    private targetScale: AdapterSize = new AdapterSize();

    // LIFE-CYCLE CALLBACKS:

    public static get OffsetType(): typeof Offset {
        return Offset;
    }

    onLoad () {
        
    }

    start () {
        this.modifyPosition();
    }

    private modifyPosition(): void {
        let offsetW: number = AdapterManager.instance.width;
        let offsetH: number = AdapterManager.instance.height;
        if (this.adapterBang) {
            offsetW += AdapterManager.instance.bangForWidth;
            offsetH += AdapterManager.instance.bangForHeight;
        }

        if (this.adapterOffset === Offset.RIGHT) 
        {
            this.node.x = this.node.x + offsetW;
        }
        else if (this.adapterOffset === Offset.LEFT) {
            this.node.x =this.node.x - offsetW;
        }
        else if (this.adapterOffset === Offset.TOP) {
            this.node.y = this.node.y + offsetH;
        }
        else if (this.adapterOffset === Offset.DOWN) {
            this.node.y = this.node.y - offsetH;
        }
        else if (this.adapterOffset === Offset.UPPER_RIGHT) {
            this.node.x = this.node.x + offsetW;
            this.node.y = this.node.y + offsetH;
        }
        else if (this.adapterOffset === Offset.UPPER_LEFT) {
            this.node.x =this.node.x - offsetW;
            this.node.y = this.node.y + offsetH;
        }
        else if (this.adapterOffset === Offset.LOWER_RIGHT) {
            this.node.x = this.node.x + offsetW;
            this.node.y = this.node.y - offsetH;
        }
        else if (this.adapterOffset === Offset.LOWER_LEFT) {
            this.node.x =this.node.x - offsetW;
            this.node.y = this.node.y - offsetH;
        }

        if (this.zoom) {
            if (this.adapterSize.zoomX && this.adapterSize.zoomY) {
                AdapterManager.instance.adapterScale(this.node);
            }
            else if (this.adapterSize.zoomX && !this.adapterSize.zoomY) {
                AdapterManager.instance.adapterScaleX(this.node);
            }
            else if (this.adapterSize.zoomY && !this.adapterSize.zoomX) {
                AdapterManager.instance.adapterScaleY(this.node);
            }
        }
        else if (this.size) {
            if (this.targetScale.adapterW && this.targetScale.adapterH) {
                AdapterManager.instance.adapterWidth(this.node);
                AdapterManager.instance.adapterHeight(this.node);
            }
            else if (this.targetScale.adapterW && !this.targetScale.adapterH) {
                AdapterManager.instance.adapterWidth(this.node);
            }
            else if (!this.targetScale.adapterW && this.targetScale.adapterH) {
                AdapterManager.instance.adapterHeight(this.node);
            }
        }
    }

    // update (dt) {}
}
