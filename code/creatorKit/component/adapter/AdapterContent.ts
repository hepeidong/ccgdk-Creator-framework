import AdapterCtrl from "./AdapterCtrl";


const {ccclass, property, executeInEditMode, menu, disallowMultiple} = cc._decorator;

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

@ccclass
@executeInEditMode
@disallowMultiple
@menu('游戏通用组件/适配/AdapterContent(内容适配组件)')
export default class AdapterContent extends cc.Component {

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
        tooltip: '该节点会根据适配后进行缩放背景节点',
        displayName: '缩放背景'
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

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {
        if (CC_EDITOR) return;
        this.modifyPosition();
    }

    private modifyPosition(): void {
        let offsetW: number = AdapterCtrl.Instance.width;
        let offsetH: number = AdapterCtrl.Instance.height;
        if (this.adapterBang) {
            offsetW += AdapterCtrl.Instance.bangForWidth;
            offsetH += AdapterCtrl.Instance.bangForHeight;
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
            let scale: number = AdapterCtrl.Instance.getScale(this.node);
            if (this.adapterSize.zoomX && this.adapterSize.zoomY) {
                // this.node.scale = scale;
                this.node.width = this.node.width * scale;
                this.node.height = this.node.height * scale;
            }
            else if (this.adapterSize.zoomX && !this.adapterSize.zoomY) {
                // this.node.scaleX = AdapterCtrl.Instance.getScaleX(this.node);
                this.node.width = this.node.width * AdapterCtrl.Instance.getScaleX(this.node);
            }
            else if (this.adapterSize.zoomY && !this.adapterSize.zoomX) {
                // this.node.scaleY = AdapterCtrl.Instance.getScaleY(this.node);
                this.node.height = this.node.height * AdapterCtrl.Instance.getScaleY(this.node);
            }
        }
    }

    // update (dt) {}
}
