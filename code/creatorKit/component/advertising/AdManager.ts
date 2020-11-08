
const errMsg = {
    1000: '后端接口调用失败',
    1001: '参数错误',
    1002: '广告单元无效',
    1003: '内部错误',
    1004: '无合适的广告',
    1005: '广告组件审核中',
    1006: '广告组件被驳回',
    1007: '广告组件被封禁',
    1008: '广告单元已关闭'
}

const videoErrMsg = {
    1000: '后端错误调用失败：该项错误不是开发者的异常情况',
    1001: '参数错误：使用方法错误',
    1002: '广告单元无效：可能是拼写错误、或者误用了其他APP的广告ID',
    1003: '内部错误：该项错误不是开发者的异常情况',
    1004: '无适合的广告：广告不是每一次都会出现，这次没有出现可能是由于该用户不适合浏览广告',
    1005: '广告组件审核中：你的广告正在被审核，无法展现广告',
    1006: '广告组件被驳回：你的广告审核失败，无法展现广告',
    1007: '广告组件被驳回：你的广告能力已经被封禁，封禁期间无法展现广告',
    1008: '广告单元已关闭：该广告位的广告能力已经被关闭'
}

export default class AdManager {
    private _top: boolean;
    private _down: boolean;
    private _left: boolean;
    private _right: boolean;
    private _center: boolean;
    private _isBannerAdShow: boolean;
    private _bannerAd: BannerAdInterface;
    private _videoAd: VideoAdInterface;
    private _okfn: Function;
    private _endfn: Function;
    constructor() {
        this._bannerAd = null;
        this._isBannerAdShow = false;
    }

    public get isBannerAdShow(): boolean { return this._isBannerAdShow; }

    private static _ins: AdManager = null;
    public static get Instance(): AdManager {
        return this._ins = this._ins ? this._ins : new AdManager();
    }

    public showBannerAd(obj: {top: boolean; down: boolean; left: boolean; right: boolean; center: boolean; width: number; adUnitId: string}): BannerAdInterface {
        if (!this._bannerAd) {
            this._bannerAd = this.getBannerAd(obj);
        }
        this._bannerAd.show().then((_res) => {
            this._isBannerAdShow = true;
        }).catch(() => {
            this._bannerAd.show().catch((e: any) => {
                console.error('BnnerAd 广告显示失败', e);
            })
        });
        return this._bannerAd;
    }

    public showVideoAd(adUnitId: string, okfn: () => void, endfn: () => void) {
        this._okfn = okfn;
        this._endfn = endfn;
        if (!this._videoAd) {
            this._videoAd = this.getVideoAd(adUnitId);
        }
        // 用户触发广告后，显示激励视频广告
        this._videoAd.show().catch(() => {
            // 失败重试
            this._videoAd.load()
                .then(() => this._videoAd.show())
                .catch(err => {
                    console.error('激励视频 广告显示失败 ', err);
                });
        });
    }

    public hideBannerAd() {
        if (this._bannerAd) {
            this._isBannerAdShow = false;
            this._bannerAd.hide();
        }
    }

    private getVideoAd(adUnitId: string): VideoAdInterface {
        this._videoAd = wx.createRewardedVideoAd({
            adUnitId
        });
        this._videoAd.onLoad(() => {
            console.log('激励视频 广告加载完成');
        });
        this._videoAd.onClose((res: any) => {
            // 用户点击了【关闭广告】按钮
            // 小于 2.1.0 的基础库版本，res 是一个 undefined
            if (res && res.isEnded || res === undefined) {
                console.log('激励视频 广告播放结束');
                SAFE_CALLBACK(this._okfn);
            }
            else {
                console.log('激励视频 广告播放中途退出');
                SAFE_CALLBACK(this._endfn);
            }
        });
        this._videoAd.onError((res: any) => {
            if (videoErrMsg[res.errCode]) {
                console.log(videoErrMsg[res.errCode]);
            }
        });
        return this._videoAd;
    }

    private getBannerAd(obj: {top: boolean; down: boolean; left: boolean; right: boolean; center: boolean; width: number; adUnitId: string}): BannerAdInterface {
        this._top = obj.top;
        this._right = obj.right;
        this._left = obj.left;
        this._down = obj.down;
        this._center = obj.center;
        this._bannerAd = wx.createBannerAd({
            adUnitId: obj.adUnitId,
            style: {
                left: 0,
                top: 0,
                width: obj.width
            }
        });
        this._bannerAd.onError((res: { errMsg: string, errCode: number }) => {
            console.error(errMsg[res.errCode]);
        });
        this._bannerAd.onLoad(() => {
            console.log('BannerAd 广告加载成功');
        });
        this._bannerAd.onResize((res: { width: number, height: number }) => {
            const { windowWidth, windowHeight } = wx.getSystemInfoSync();
            console.log('BannerAd 广告的宽和高', res.width, res.height);
            console.log('屏幕的宽和高', windowWidth, windowHeight);
            if (this._top) {
                this._bannerAd.style.top = 0;
            }
            else if (this._down) {
                this._bannerAd.style.top = windowHeight - this._bannerAd.style.realHeight;
            }
            if (this._left) {
                this._bannerAd.style.left = 0;
            }
            else if (this._right) {
                this._bannerAd.style.left = windowWidth - this._bannerAd.style.realWidth;
            }
            else if (this._center) {
                this._bannerAd.style.left = windowWidth / 2 - this._bannerAd.style.realWidth / 2;
            }
        });
        return this._bannerAd;
    }
}
