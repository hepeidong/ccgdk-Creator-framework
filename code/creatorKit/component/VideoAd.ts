

const { ccclass, property, executeInEditMode, menu, disallowMultiple } = cc._decorator;

@ccclass
@executeInEditMode()
@disallowMultiple()
@menu('游戏通用组件/广告/VideoAd(VideoAd广告管理组件)')
export default class VideoAd extends cc.Component {

    @property({
        tooltip: '视频广告ID'
    })
    adUnitId: string = '';

    @property({
        type: cc.Component.EventHandler,
        tooltip: '正常播放结束事件回调'
    })
    private completeEvent: cc.Component.EventHandler = new cc.Component.EventHandler();

    @property({
        type: cc.Component.EventHandler,
        tooltip: '中途退出事件回调'
    })
    private quitEvent: cc.Component.EventHandler = new cc.Component.EventHandler();

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        kit.TargetListener.listener(this.node, this).click('onClicked');
    }

    start () {

    }

    onClicked() {
        wx.playVideoAd(this.adUnitId, () => {
            this.completeEvent.emit([this.completeEvent.handler]);
        }, () => {
            this.quitEvent.emit([this.quitEvent.handler]);
        });
    }

    // update (dt) {}
}
