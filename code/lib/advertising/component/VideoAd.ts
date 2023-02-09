import { App } from "../../app";
import { EventSystem } from "../../event_manager/EventSystem";
import { Utils } from "../../utils";
import { AdManager } from "../AdManager";

const { ccclass, property, menu, disallowMultiple } = cc._decorator;

@ccclass
@disallowMultiple()
@menu('游戏通用组件/广告/VideoAd(VideoAd广告管理组件)')
export default class VideoAd extends cc.Component {

    @property({
        tooltip: '视频广告ID',
        displayName: '微信平台广告ID',
    })
    private wxAdUnitId: string = '';

    @property({
        tooltip: '视频广告ID',
        displayName: '字节平台广告ID',
    })
    private ttAdUnitId: string = '';

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

    @property({
        type: cc.Component.EventHandler,
        tooltip: '视频加载失败事件回调'
    })
    private failEvent: cc.Component.EventHandler = new cc.Component.EventHandler();

    private _canPlay: boolean = true;

    private _adMgr: AdManager;


    onLoad() {
        this._adMgr = new AdManager();
        EventSystem.click(this.node, this, this.onClicked);
    }

    start() {

    }

    public set adUnitId(val: string) {
        if (App.game.platform === App.Platform.WECHAT) {
            this.wxAdUnitId = val;
        }
    }
    public get adUnitId(): string {
        if (App.game.platform === App.Platform.BYTE) {
            return this.ttAdUnitId;
        }
        else if (App.game.platform === App.Platform.WECHAT) {
            return this.wxAdUnitId;
        }
    }

    public setVideoAdPlayStatus(canPlay: boolean) {
        this._canPlay = canPlay;
    }

    private onClicked() {
        if (Utils.DateUtil.inCD(50, 'video_click')) {
            return;
        }
        if (!this._canPlay) return;
        let adUnitId: string;
        if (App.game.platform === App.Platform.WECHAT) {
            adUnitId = this.wxAdUnitId;
        }
        else if (App.game.platform === App.Platform.BYTE) {
            adUnitId = this.ttAdUnitId;
        }
        this._adMgr.showVideoAd(adUnitId,
            () => this.completeEvent.emit([this.completeEvent.handler]),
            () => this.quitEvent.emit([this.quitEvent.handler]),
            () => this.failEvent.emit([this.failEvent.handler])
        );
    }


    // update (dt) {}
}
