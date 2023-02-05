import { RedDotManager } from "../RedDotManager";


const { ccclass, property, menu } = cc._decorator;

@ccclass
@menu('游戏通用组件/红点/RedDotView(红点显示组件)')
export default class RedDotView extends cc.Component {

    @property({
        tooltip: '红点对应的ID'
    })
    private redDotId: string = "";

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        RedDotManager.instance.addRedDotNode(this.redDotId, this.node, this.onChange, this);
    }

    private onChange(status: boolean) {
        this.node.active = status;
    }

    start() {

    }

    // update (dt) {}
}
