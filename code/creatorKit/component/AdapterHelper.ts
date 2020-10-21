import AdapterCtrl from "./AdapterCtrl";

const {ccclass, property, executeInEditMode, menu} = cc._decorator;

@ccclass
@executeInEditMode
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
        // cck.log('多分辨率适配组件');
        if (CC_EDITOR) return;
        // cck.log('开始适配');
        AdapterCtrl.Instance.adapter(this.autoAdapter);
    }

    // update (dt) {}
}
