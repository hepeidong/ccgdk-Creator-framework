/************************************微信小游戏定义*******************************************/
interface BannerAdInterface {
    style: { left: number, top: number, realWidth: number, realHeight: number };
    show(): Promise<any>;
    destroy(): void;
    onError(callback: (res: { errMsg: string, errCode: number }) => void): void;
    onLoad(callback: () => void): void;
    hide(): void;
    onResize(callback: (res: { width: number, height: number }) => void): void;
    offResice(callback: Function): void;
    offLoad(callback: Function): void;
    offError(callback: Function): void;
}
interface VideoAdInterface {
    show(): Promise<any>;
    load(): Promise<any>;
    destroy(): void;
    onError(callback: (res: { errMsg: string, errCode: number }) => void): void;
    onLoad(callback: Function): void;
    onClose(callback: Function);
    hide(): void;
    offLoad(callback: Function): void;
    offClose(callback: Function): void;
    offError(callback: Function): void;
}
interface GamePortal {
    show(): Promise<any>;
    load(): Promise<any>;
    destroy(): void;
    onError(callback: (res: { errMsg: string, errCode: number }) => void): void;
    onLoad(callback: Function): void;
    onClose(callback: Function): void;
    offLoad(callback: Function): void;
    offClose(callback: Function): void;
    offError(callback: Function): void;
}
interface GameIcon {
    hide(): void;
    show(): Promise<any>;
    load(): Promise<any>;
    destroy(): void;
    onResize(callback: (res: { width: number, height: number }) => void): void;
    onError(callback: (res: { errMsg: string, errCode: number }) => void): void;
    onLoad(callback: Function): void;
    onClose(callback: Function): void;
    offResice(callback: Function): void;
    offLoad(callback: Function): void;
    offClose(callback: Function): void;
    offError(callback: Function): void;
}
interface GameBanner {
    show(): Promise<any>;
    destroy(): void;
    onError(callback: (res: { errMsg: string, errCode: number }) => void): void;
    onLoad(callback: () => void): void;
    hide(): void;
    onResize(callback: (res: { width: number, height: number }) => void): void;
    offResice(callback: Function): void;
    offLoad(callback: Function): void;
    offError(callback: Function): void;
}
interface Stylelitem {
    appNameHidden:	boolean;		//游戏名称是否隐藏
    color:	string;		//游戏名称的颜色色值
    size:	number;		//游戏icon的宽高值
    borderWidth:	number;		//游戏icon的border尺寸
    borderColor:	string;		//游戏icon的border颜色色值
    left:	number;		//游戏icon的X轴坐标
    top:	number;		//游戏icon的Y轴坐标
}
interface ButtonStyle {
    left: number;  //左上角横坐标
    top: number;	//左上角纵坐标
    width: number;		//宽度
    height:	number;		//高度
    backgroundColor: string;		//背景颜色
    borderColor: string;		//边框颜色
    borderWidth: number;	//边框宽度
    borderRadius: number;		//边框圆角
    color: string;		//文本的颜色。格式为 6 位 16 进制数。
    textAlign: 'left'|'center'|'right';		//文本的水平居中方式
    fontSize: number;		//字号
    lineHeight:	number;		//文本的行高
}
interface ButtonInterface {
    show(): void;
    hide(): void;
    destroy(): void;
    onTap(callback: Function): void;
    offTap(callback: Function): void;
}
interface RequestTask {
    abort(): void;
    onHeadersReceived(callback: (res: any) => void): void;
    offHeadersReceived(callback: Function): void;
}

/**
 * 微信小游戏接口命名空间
 */
declare namespace wx {
    export function request(obj: any): RequestTask;
    export function navigateToMiniProgram(obj: { appId: string; path?: string; extraData?: any; envVersion?: 'develop'|'trial'|'release'; success?: (res: any) => void; fail?: Function; complete?: Function }): void;
    export function joinVoIPChat(obj: {
        roomType?: 'voice' | 'video';
        nonceStr: string;
        signature: string;
        timeStamp: number;
        groupId: string;
        muteConfig?: { muteMicrophone?: boolean; muteEarphone?: boolean };
        success?: (res: any) => void; fail?: Function; complete?: Function
    }): void;
    export function exitVoIPChat(obj: { success?: Function; fail?: Function; complete?: Function }): void;
    export function getSetting(obj: { success?: (res: any) => void; fail?: Function; complete?: Function }): void;
    export function openSetting(obj: { success?: (res: any) => void; fail?: Function; complete?: Function }): void;
    /**
     * 微信权限设置，建议使用封装好的 setAuthorize 方法，权限类型调用wx.scope
     * @param obj 
     */
    export function authorize(obj: { scope: string, success?: () => void; fail?: Function; complete?: Function }): void;
    export function createRewardedVideoAd(obj: { adUnitId: string }): VideoAdInterface;
    export function showToast(title: string, iconState?: string, dt?: number): void;
    export function hideToast(): void;
    /**
     * 
     * @param adId 广告id
     * @param completefn 正常播放结束回调
     * @param quitfn 中途退出回调
     */
    export function playVideoAd(adId: string, completefn: Function, quitfn: Function): void;
    export function shareAppMessage(obj: { title: string, query?: string, imageUrlId?: string, imageUrl?: string, success?: (ret: any) => void | null, fail?: () => void | null }): void;
    export function onShow(callback: (ret: any) => void): void;
    export function openCustomerServiceConversation(): void;
    export function getSystemInfoSync(): any;
    export function createBannerAd(obj: { adUnitId: string, adIntervals?: string, style: { left: number, top: number, width: number, height?: number } }): BannerAd;
    export function getLaunchOptionsSync(): any;
    export function onAudioInterruptionBegin(callback: Function): void;
    export function onAudioInterruptionEnd(callback: Function): void;
    export function setKeepScreenOn(obj: { keepScreenOn: boolean; success?: Function; fail?: Function, complete?: Function }): void;
    export function showShareMenu(obj: { withShareTicket?: boolean; success?: Function; fail?: Function; complete?: Function }): void;
    export function onShareAppMessage(callback: () => { title?: string; imageUrl?: string; query?: string; imageUrlId?: string }): void;
    export function updateShareMenu(obj: {
        withShareTicket?: boolean; isUpdatableMessage?: boolean; activityId?: string; toDoActivityId?: string;
        templateInfo?: { parameterList: Array<{ name: string; value: string }> }; success?: Function; fail?: Function; complete?: Function
    });
    export function showModal(obj: { title: string; content: string; showCancel?: boolean; confirmText?: string; cancelText?: string; success?: (res: { confirm: any }) => void }): void;
    export function getOpenDataContext(): { postMessage: (message: any) => void };
    export function onShareMessageToFriend(callback: (res: { success: boolean; errMsg: string }) => void): void;
    export function setMessageToFriendQuery(obj: { shareMessageToFriendScene: number }): boolean;
    export function getUpdateManager(): {
        onCheckForUpdate: Function;
        onUpdateReady: Function;
        onUpdateFailed: Function;
        applyUpdate: Function
    };
    export function getUserInteractiveStorage(iv: string, obj: { keyList: string[]; success?: (res: Array<{ key: string; value: string }>) => void }): void;
    export function setUserCloudStorage(obj: { KVDataList: Array<{ key: string; value: string }>, success?: Function, fail?: Function }): void;
    export function checkGPS(msg: string): void;
    export function login(obj: { timeout?: number; success?: (res: any) => void; fail?: Function; complete?: Function }): void;
    /**
     * 设置微信权限，权限类型调用wx.scope
     * @param  scope       权限名称
     * @param  success     申请成功回调
     * @param  fail        申请失败回调
     * @param  denyBack    拒绝后的回调
     * @param  deniedFun   之前申请过，但被用户拒绝，这种情况的回调，此回调存在，则不弹出二次授权提示
     */
    export function setAuthorize(scope: string, success: Function, fail: Function, denyBack: Function, deniedFun: Function): void;
    export const scope: {
        userInfo: string;
        userLocation: string;
        userLocationBackground: string;
        address: string;
        invoiceTitle: string;
        invoice: string;
        werun: string;
        record: string;
        writePhotosAlbum: string;
        camera: string;
    };
    export const authSetting: {
        "scope.userInfo": boolean | undefined | null,// 请用button获取该信息
        "scope.userLocation": boolean | undefined | null,
        "scope.userLocationBackground": boolean | undefined | null,
        "scope.address": boolean | undefined | null,
        "scope.invoiceTitle": boolean | undefined | null,
        "scope.invoice": boolean | undefined | null,
        "scope.werun": boolean | undefined | null,
        "scope.record": boolean | undefined | null,
        "scope.writePhotosAlbum": boolean | undefined | null,
        "scope.camera": boolean | undefined | null,
    };
    /**
     * 获取位置信息，建议使用经过封装的 getWXLocation
     * @param obj 
     */
    export function getLocation(obj: { type: string, success: (res: any) => void, fail?: Function, complete?: Function }): void;
    /**
     * 
     * @param completefn 
     * latitude: 纬度
     * longitude: 经度
     * errCode: 0（可以正常获得位置信息），1（系统gps未开启），2（微信位置权限未开启）
     */
    export function getWXLocation(completefn: (res: {
        latitude: string;
        longitude: string;
        errCode: number
    }) => void): void;
    export function checkSession(obj: {success?: Function; fail?: Function; complete?: Function}): void;
    export function checkIsUserAdvisedToRest(obj: { todayPlayedTime: number, success?: (res: boolean) => void; fail?: Function; complete?: Function }): void;
    export function createFeedbackButton(obj: { type: 'text'|'image'; text?: string; image?: string; style: ButtonStyle }): ButtonInterface;
    export function createOpenSettingButton(obj: { type: 'text'|'image'; text?: string; image?: string; style: ButtonStyle }): ButtonInterface;
    export function createGameClubButton(obj: { type: 'text'|'image'; text?: string; image?: string; style: ButtonStyle; icon: 'green'|'white'|'dark'|'light'; }): ButtonInterface;
    export function createUserInfoButton(obj: { type: 'text'|'image'; text?: string; image?: string; style: ButtonStyle ; withCredentials: boolean; lang: 'en'|'zh_CN'|'zh_TW'}): ButtonInterface;
    export function createGamePortal(adUnitId: string): GamePortal;
    export function createGameIcon(obj: {adUnitId: string; count: number; style: Stylelitem[]}, stylelitem: any): GameIcon;
    export function createGameBanner(adUnitId: string, style: {left: number; top: number}): GameBanner;
    export function setClipboardData(obj: { data: string; success?: (res: boolean) => void; fail?: Function; complete?: Function }): void;
    export function getClipboardData(obj: { success?: (res: boolean) => void; fail?: Function; complete?: Function }): void;
    export function onNetworkStatusChange(callback: (res: any) => void): void;
    export function offNetworkStatusChange(callback: (res: any) => void): void;
    export function getNetworkType(obj: {success?: Function; fail?: Function; complete?: Function}): void;
}
/*******************************************************************************************************/