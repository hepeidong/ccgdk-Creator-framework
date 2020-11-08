

/**********************************获取微信设置权限 ***********************/
const authsName = {
    "scope.userInfo": "用户信息",// 请用button获取该信息
    "scope.userLocation": "地理位置",
    "scope.userLocationBackground": "后台定位",
    "scope.address": "通讯地址",
    "scope.invoiceTitle": "发票抬头",
    "scope.invoice": "获取发票",
    "scope.werun": "微信运动步数",
    "scope.record": "麦克风",
    "scope.writePhotosAlbum": "保存到相册",
    "scope.camera": "摄像头",
}

const ScopeMap = {
    userInfo: "scope.userInfo",
    userLocation: "scope.userLocation",
    userLocationBackground: "scope.userLocationBackground",
    address: "scope.address",
    invoiceTitle: "scope.invoiceTitle",
    invoice: "scope.invoice",
    werun: "scope.werun",
    record: "scope.record",
    writePhotosAlbum: "scope.writePhotosAlbum",
    camera: "scope.camera"
}

export class WXAuthorize {
    //微信功能权限申请
    private _authSetting: AuthSetting;   //权限设置信息
    private _scope: string;         //权限名称
    private _success: Function;       //申请成功回调
    private _fail: Function;          //申请失败回调
    private _denyBack: Function;      //拒绝后的回调
    private _deniedFun: Function;     //之前申请过，但被用户拒绝，这种情况的回调

    constructor() {
        if (cc.sys.platform === cc.sys.WECHAT_GAME) {
            wx.getSetting({
                success: (ret) => {
                    this._authSetting = ret.authSetting;
                }
            });
        }
    }

    private static _ins: WXAuthorize = null;
    public static get Instance(): WXAuthorize {
        return this._ins = this._ins ? this._ins : new WXAuthorize();
    }
    public get authSetting(): AuthSetting { return this._authSetting; }

    /**
     * 获取权限
     * @param  scope       权限名称
     * @param  success     申请成功回调
     * @param  fail        申请失败回调
     * @param  denyBack    拒绝后的回调
     * @param  deniedFun   之前申请过，但被用户拒绝，这种情况的回调，此回调存在，则不弹出二次授权提示
     */
    public setAuthorize(scope: string, success: Function, fail: Function, denyBack: Function, deniedFun: Function) {
        this.resetData();
        this._scope = scope;
        this._success = success;
        this._fail = fail;
        this._denyBack = denyBack;
        this._deniedFun = deniedFun;

        let that = this;
        wx.getSetting({
            success(ret) {
                that._authSetting = ret.authSetting;
                let authSetting = ret.authSetting;
                if (authSetting[that._scope] === undefined || authSetting[that._scope] === null) {
                    wx.authorize({
                        scope: scope,
                        success() {
                            SAFE_CALLBACK(that._success);
                        },
                        fail() {
                            SAFE_CALLBACK(that._denyBack);
                        }
                    });
                }
                else if (authSetting[that._scope] == false) {
                    if (that._deniedFun) {
                        if (that._deniedFun && typeof that._deniedFun === 'function') {
                            that._deniedFun();
                        }
                        return;
                    }

                    let title = '功能设置';
                    let content = '检测到您没有打开' + authsName[that._scope] + '功能，是否去设置打开？';

                    wx.showModal
                        ({
                            title: title,
                            content: content,
                            confirmText: "确认",
                            cancelText: "取消",
                            success: function (res: any) {
                                that.successFn(res);
                            }
                        });
                }
                else {
                    SAFE_CALLBACK(that._success);
                }
            },
            fail() {
                SAFE_CALLBACK(that._fail);
            }
        });
    }

    private successFn(res: any) {
        //点击“确认”时打开设置页面
        let that = this;
        if (res.confirm) {
            wx.openSetting({
                success(ret_openSet) {
                    that._authSetting = ret_openSet.authSetting;
                    SAFE_CALLBACK(that._success);
                },
                fail() {
                    SAFE_CALLBACK(that._fail);
                }
            });
        } else {
            SAFE_CALLBACK(that._fail);
        }
    }

    /**
     * 重置数据
     */
    private resetData() {
        this._scope = null;
        this._success = null;
        this._fail = null;
        this._denyBack = null;
        this._deniedFun = null;
    }
}

const errMsg = {
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

class WXVideoAd {
    // 创建激励视频广告实例，提前初始化
    private videoAd: VideoAdInterface = null;
    private completefn: Function = null;
    private quitfn: Function = null;

    constructor() {

    }

    private static _ins: WXVideoAd = null;
    public static get Instance(): WXVideoAd {
        return this._ins = this._ins ? this._ins : new WXVideoAd();
    }

    public play(adId: string, completefn: Function, quitfn: Function) {
        this.completefn = completefn;
        this.quitfn = quitfn;
        if (!this.videoAd) {
            this.videoAd = wx.createRewardedVideoAd({adUnitId : adId});
            this.videoAd.onLoad(() => { kit.log('激励视频 广告加载完成'); });
            this.videoAd.onClose(res => this._onClose(res));
            this.videoAd.onError(res => this._onError(res));
        }
        // 用户触发广告后，显示激励视频广告
        this.videoAd.show().catch(() => {
            // 失败重试
            this.videoAd.load()
                .then(() => this.videoAd.show())
                .catch(err => {
                    kit.error('激励视频 广告显示失败 ', err);
                });
        });
    }

    private _onClose(res) {
        // 用户点击了【关闭广告】按钮
        // 小于 2.1.0 的基础库版本，res 是一个 undefined
        if (res && res.isEnded || res === undefined) {
            // 正常播放结束，可以下发游戏奖励
            kit.log('激励视频 广告播放结束');
            SAFE_CALLBACK(this.completefn);
        }
        else {
            // 播放中途退出，不下发游戏奖励
            kit.log('激励视频 广告播放中途退出');
            SAFE_CALLBACK(this.quitfn);
        }
    }

    private _onError(res) {
        if (errMsg[res.errCode]) {
            wx.showModal({
                title: '提示',
                content: errMsg[res.errCode],
                confirmText: "确认",
                success: function (res) {
                    //点击“确认”时打开设置页面
                    if (res.confirm) {
                    } else {
                    }
                }
            });
        }
        else {
            wx.showModal({
                title: '提示',
                content: '激励视频 广告显示失败，' + res.errMsg,
                confirmText: "确认",
                success: function (res) {
                    //点击“确认”时打开设置页面
                    if (res.confirm) {
                    } else {
                    }
                }
            });
        }
    }
}

const gpsErrCodeName = {
    0: '正常获取GPS',
    1: '没有开启系统GPS',
    2: '没有打开微信地理位置权限'
}
class WXGPS {
    private _isSetGPS: boolean|undefined;
    private _gpsErrCode: number//0：可以正常获得位置信息，1: 系统gps未开启，2：微信位置权限未开启

    constructor() {

    }

    private static _ins: WXGPS = null;
    public static get Instance(): WXGPS {
        return this._ins = this._ins ? this._ins : new WXGPS();
    }

    public getWXLocation(completefn: (res: {latitude: string; longitude: string; errCode: number, errMsg: string}) => void) {
        if (!WXAuthorize.Instance.authSetting["scope.userLocation"]) {
            this._gpsErrCode = 2;
            WXAuthorize.Instance.setAuthorize(ScopeMap.userLocation, () => {
                this.makeIsSetGPS();
                this.getLocation(completefn);
            }, () => {
                
            }, () => {
                
            }, () => {});
        }
        else {
            if (this._gpsErrCode === 1) {
                //系统gps未开启
                SAFE_CALLBACK(completefn, {latitude: '', longitude: '', errCode: this._gpsErrCode, errMsg: gpsErrCodeName[this._gpsErrCode]});
            }
            else {
                this.getLocation(completefn);
            }
        }
    }

    private getLocation(callback: (res: {latitude: string; longitude: string; errCode: number, errMsg: string}) => void) {
        wx.getLocation({
            type: 'wgs84',
            success:(res) => {
                const latitude = res.latitude.toFixed(6);
                const longitude = res.longitude.toFixed(6);
                this._gpsErrCode = 0;
                const arg = {latitude: latitude, longitude: longitude, errCode: this._gpsErrCode, errMsg: gpsErrCodeName[this._gpsErrCode]};
                SAFE_CALLBACK(callback, arg);
            },
            fail:() => {
                //如果undefined，说明系统GPS没有开启
                if (this._isSetGPS || this._isSetGPS === undefined) {
                    this._gpsErrCode = 1;
                } else {
                    this._gpsErrCode = 2;
                }
                const arg = {latitude: '', longitude: '', errCode: this._gpsErrCode, errMsg: gpsErrCodeName[this._gpsErrCode]};
                SAFE_CALLBACK(callback, arg);
            }
        })
    }

    private makeIsSetGPS() {
        if (!WXAuthorize.Instance.authSetting) return;
        if (WXAuthorize.Instance.authSetting['scope.userLocation'] === undefined) {
            this._isSetGPS = undefined;
        }
        else {
            this._isSetGPS = WXAuthorize.Instance.authSetting['scope.userLocation'];
        }
    }
}

export class WX {
    public static readonly scope: Scope = ScopeMap;
    public static readonly authSetting: AuthSetting = WXAuthorize.Instance.authSetting;
    /**
     * 获取权限
     * @param  scope       权限名称
     * @param  success     申请成功回调
     * @param  fail        申请失败回调
     * @param  denyBack    拒绝后的回调
     * @param  deniedFun   之前申请过，但被用户拒绝，这种情况的回调，此回调存在，则不弹出二次授权提示
     */
    public static setAuthorize(scope: string, success: Function, fail: Function, denyBack: Function, deniedFun: Function) {
        WXAuthorize.Instance.setAuthorize(scope, success, fail, denyBack, deniedFun);
    }

    public static playVideoAd(adId: string, completefn: Function, quitfn: Function) {
        WXVideoAd.Instance.play(adId, completefn, quitfn);
    }

    public static getWXLocation(completefn: (res: {latitude: string; longitude: string; errCode: number, errMsg: string}) => void): void {
        WXGPS.Instance.getWXLocation(completefn);
    }
}