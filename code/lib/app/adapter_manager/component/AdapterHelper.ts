import { AdapterManager } from "../AdapterManager";

const {ccclass, property, menu, executionOrder} = cc._decorator;

@ccclass
@executionOrder(-1)
@menu('游戏通用组件/适配/AdapterHelper(多分辨率屏幕适配组件)')
export default class AdapterHelper extends cc.Component {

    @property({
        tooltip: '勾选此项，会自动选择适配方案',
        displayName: '自动适配'
    })
    autoAdapter: boolean = true;

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {
        AdapterManager.instance
        AdapterManager.instance.adapter(this.autoAdapter);
    }

    // update (dt) {}
}
