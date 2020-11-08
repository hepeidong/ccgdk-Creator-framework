import AdManager from "./AdManager";

const { ccclass, property, executeInEditMode, menu, disallowMultiple } = cc._decorator;

@ccclass
@executeInEditMode()
@disallowMultiple()
@menu('游戏通用组件/广告/BannerAd(Banner广告管理组件)')
export default class BannerAd extends cc.Component {

    @property({
        tooltip: '广告靠左显示'
    })
    toLeft: boolean = false;

    @property({
        tooltip: '广告靠右显示'
    })
    toRight: boolean = false;

    @property({
        tooltip: '广告靠下显示'
    })
    toDown: boolean = false;

    @property({
        tooltip: '广告靠上显示'
    })
    toTop: boolean = false;

    @property({
        tooltip: '广告居中显示'
    })
    toCenter: boolean = false;

    @property({
        type: cc.Integer,
        tooltip: '广告节点的宽度'
    })
    width: number = 0;

    @property({
        tooltip: '广告位权限ID'
    })
    adUnitId: string = '';

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        if (CC_EDITOR) return;
        this.showBannerAd();
    }

    start() {
    }

    public hide(): void {
        AdManager.Instance.hideBannerAd();
    }

    private showBannerAd() {
        if (CC_WECHATGAME) {
            const winSize: { windowWidth: number, windowHeight: number } = wx.getSystemInfoSync();
            if (!winSize) return;
            const w: number = this.width * winSize.windowWidth / cc.Canvas.instance.designResolution.width;
            AdManager.Instance.showBannerAd({
                adUnitId: this.adUnitId,
                width: w,
                top: this.toTop,
                down: this.toDown,
                left: this.toLeft,
                right: this.toRight,
                center: this.toCenter
            });
        }
    }

    onDestroy() {
        AdManager.Instance.hideBannerAd();
    }

    onDisable() {
        AdManager.Instance.hideBannerAd();
    }

    update(dt) {

    }
}
