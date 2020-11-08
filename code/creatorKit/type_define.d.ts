/**********************************************类型定义，方便兼容和扩展********************************************/


/*************************************资源管理类型定义********************************/
/**Load函数中的url类型 */
type UrlOfLoadT = {uuid?: string, url?: string, type?: string};
/**Button纹理类型 */
type ButtonResT = {normal: string, pressed: string, hover: string, disabled: string};
/**progess函数类型 */
type progressT = (completedCount: number, totalCount: number, item: any) => void;
/**Load函数加载成功回调 */
type completed = Function;
/**LoadRes函数加载成功回调 */
type completeTOfRes = (error: Error, resource: any) => void;
/**LoadResArray函数加载成功回调 */
type completeTOfArray = (error: Error, resource: any[]) => void;
/**LoadResDir函数加载成功回调 */
type completeTOfDir = (error: Error, resource: any[], urls: string[]) => void;

type ButtonResT = { normal: string, pressed: string, hover: string, disabled: string };
type SourceT = cc.Sprite | cc.Button | cc.Mask | cc.PageViewIndicator | cc.EditBox | cc.Label | cc.RichText | cc.ParticleSystem;
type AnimateCompleteT = (asset: any) => void;
type AnimatT = sp.SkeletonData;


/**************************************音频，动画等特效播放管理类型定义********************************/
type audio_t = {audio: Audio; clip: AudioClip; callbacks: audio_resolved_t[]};
type play_callback_t = (currentTime: number) => void;
type stop_callback_t = (duration: number) => void;
type audio_resolved_t = {type: string; call: any}

type resolved_t = { call: Function; type: string; };
type frameAnimat_t = {props: IFrameAnimat, callbacks: resolved_t[]};
type spineAnimat_t = {props: ISpineAnimat, callbacks: resolved_t[]};


/******************************************微信小游戏类型定义**********************************/
/**微信小游戏权限类型 */
type AuthSetting = {
    "scope.userInfo": boolean|undefined|null,// 请用button获取该信息
    "scope.userLocation": boolean|undefined|null,
    "scope.userLocationBackground": boolean|undefined|null,
    "scope.address": boolean|undefined|null,
    "scope.invoiceTitle": boolean|undefined|null,
    "scope.invoice": boolean|undefined|null,
    "scope.werun": boolean|undefined|null,
    "scope.record": boolean|undefined|null,
    "scope.writePhotosAlbum": boolean|undefined|null,
    "scope.camera": boolean|undefined|null,
}
/**微信小游戏权限类型定义 */
type Scope = {
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
}