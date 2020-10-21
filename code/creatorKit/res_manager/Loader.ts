
/**纹理格式 */
enum PixelFormat{
     PIXE_RGB565 = 16,
     PIXE_RGB5A1 =  16,
     PIXE_RGBA4444 =  16,
     PIXE_RGB888 =  24,
     PIXE_RGBA8888 =  32,
     PIXE_A8 =  8,
     PIXE_I8 =  8,
     PIXE_AI8 =  16
}

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

/**加载函数参数结构体 */
interface LoadArgs {
    url: string|string[]|UrlOfLoadT,
    type: typeof cc.Asset,
    progressFn: progressT,
    completeFn: completed|completeTOfRes|completeTOfArray|completeTOfDir,
    isLock: boolean
}


/**
 * author: HePeiDong
 * date: 2019/9/11
 * name: 加载资源类
 * 加载资源，对加载的资源进行引用技术管理，包括解析预制体
 */
export class Loader {
    constructor() {
    
    }

    public static Instanitate(url: string, original: cc.Prefab): cc.Node {
        if (!original){
            return;
        }
        let key: string = this.MakeKey(url, cc.Prefab);
        let res: any = this.GetCacheRes(key, cc.Prefab);
        let newNode: cc.Node = cc.instantiate(original);
        let autoRelease: kit.AutoRelease = newNode.getComponent(kit.AutoRelease);
        if (!autoRelease) {
            autoRelease = newNode.addComponent(kit.AutoRelease);
        }
        autoRelease.RecordPrefabRes(res.id);
        return newNode;
    }

    public static SetResource(target: cc.Node, compType: any, url: string|ButtonResT, isLock: boolean = false): void {
        let autoRelease: kit.AutoRelease = target.getComponent(kit.AutoRelease);
        if (!autoRelease) {
            autoRelease = target.addComponent(kit.AutoRelease);
        }
        autoRelease.Source(url, compType, isLock);
    }


    public static Gc(): void {
        kit.PoolManager.Instance.GetCurrentPool().Clear();
    }

    public static GetRes(url: string, type: typeof cc.RawAsset): kit.Resource {
        return kit.PoolManager.Instance.GetCurrentPool().GetObject(this.MakeKey(url, type)) as kit.Resource;
    }

    public static Retain(url: string, type: typeof cc.RawAsset): void {
        SAFE_RETAIN(kit.PoolManager.Instance.GetCurrentPool().GetObject(this.MakeKey(url, type)));
    }

    public static Release(url: string|string[], type: typeof cc.RawAsset): void {
        if (typeof url === 'object') {
            if (url instanceof Array) {
                for (let i: number = 0; i < url.length; ++i) {
                    SAFE_RELEASE(kit.PoolManager.Instance.GetCurrentPool().GetObject(this.MakeKey(url[i], type)));
                }
            }
        }
        else if (typeof url === 'string') {
            SAFE_RELEASE(kit.PoolManager.Instance.GetCurrentPool().GetObject(this.MakeKey(url, type)));
        }
    }

    public static Load(url: string|string[]|UrlOfLoadT, progressFn: progressT, completeFn: Function|null, isLock: boolean): void;
    public static Load(url: string|string[]|UrlOfLoadT, completeFn: completed, isLock: boolean): void;
    public static Load(): void {
        let args: LoadArgs = this.MakeLoadArgs.apply(null, arguments);    
        if (args.url instanceof Array) {
            kit.ErrorID(102);
            return;
        }
        let completedFn = (err: Error, asset: any) => {
            if (!err) {
                if (typeof args.url === 'string') {
                    this.ParserAssetType(args.url, asset, args.isLock);
                }else if (typeof args.url === 'object') {
                    if (args.url instanceof Array) {
                        for (let i: number = 0; i < args.url.length; ++i) {
                            this.ParserAssetType(args.url[i], asset[i], args.isLock);
                        }
                    }
                    else {
                        this.ParserAssetType(args.url.url, asset, args.isLock);
                    }
                }
            }
            args.completeFn && (args.completeFn as completed)(err, asset);
        }
        
        if (args.progressFn) {
            cc.loader.load(args.url, args.progressFn, completedFn);
        }else {
            cc.loader.load(args.url, completedFn);
        }
    }

    public static LoadRes(url: string, type: typeof cc.RawAsset, progressFn: progressT, completeCallback: completeTOfRes|null, isLock?: boolean): void;
    public static LoadRes(url: string, type: typeof cc.RawAsset, completeFn: completeTOfRes, isLock?: boolean): void;
    public static LoadRes(url: string, type: typeof cc.RawAsset, isLock?: boolean): void;
    public static LoadRes(url: string, progressFn: progressT, completeCallback: completeTOfRes|null, isLock?: boolean): void;
    public static LoadRes(url: string, completeFn: completeTOfRes, isLock?: boolean): void;
    public static LoadRes(url: string, isLock?: boolean): void;	
    public static LoadRes(): void {
        let args: LoadArgs = this.MakeLoadArgs.apply(null, arguments);
        if (typeof args.url !== 'string') {
            kit.ErrorID(102);
            return;
        }
        
        let completedFn = (err: Error, asset: any) => {
            if (!err) {
                if (args.type) {
                    this.FinishedLoad(args.url as string, args.type, args.isLock);
                }
                else {
                    this.ParserAssetType(args.url as string, asset, args.isLock);
                }
            }
            args.completeFn && (args.completeFn as completeTOfRes)(err, asset);
        }
    
        if (args.type && args.progressFn && args.completeFn) {
            cc.loader.loadRes(args.url as string, args.type, args.progressFn, completedFn);
        }else if (args.type && !args.progressFn && args.completeFn) {
            cc.loader.loadRes(args.url as string, args.type, completedFn);
        }else if (!args.type && args.progressFn && args.completeFn) {
            cc.loader.loadRes(args.url as string, args.progressFn, completedFn);
        }else {
            cc.loader.loadRes(args.url as string, completedFn);
        }
    }

    public static LoadResDir(url: string, type: typeof cc.RawAsset, progressFn: progressT, completeCallback: completeTOfDir|null, isLock?: boolean): void;
    public static LoadResDir(url: string, type: typeof cc.RawAsset, completeFn: completeTOfDir, isLock?: boolean): void;
    public static LoadResDir(url: string, type: typeof cc.RawAsset, isLock?: boolean): void;
    public static LoadResDir(url: string, progressFn: progressT, completeCallback: completeTOfDir|null, isLock?: boolean): void;
    public static LoadResDir(url: string, completeFn: completeTOfDir, isLock?: boolean): void;
    public static LoadResDir(url: string, isLock?: boolean): void;
    public static LoadResDir(): void {
        let args: LoadArgs = this.MakeLoadArgs.apply(null, arguments);
        if (typeof args.url !== 'string') {
            kit.ErrorID(102);
            return;
        }
        let completedFn = (err: Error, asset: any[], urls: string[]) => {
            if (!err) {
                if (args.type) {
                    for (let i: number = 0; i < urls.length; ++i) {
                        this.FinishedLoad(urls[i], args.type, args.isLock);
                    }
                }
                else {
                    for (let i: number = 0; i < urls.length; ++i) {
                        this.ParserAssetType(urls[i], asset[i], args.isLock);
                    }
                }
                
            }
            args.completeFn && (args.completeFn as completeTOfDir)(err, asset, urls);
        } 
        let url: string = args.url as string;
        if (args.type && args.progressFn && args.completeFn) {
            cc.loader.loadResDir(url, args.type, args.progressFn, completedFn);
        }else if (args.type && !args.progressFn && args.completeFn) {
            cc.loader.loadResDir(url, args.type, completedFn);
        }else if (!args.type && args.progressFn && args.completeFn) {
            cc.loader.loadResDir(url, args.progressFn, completedFn);
        }else {
            cc.loader.loadResDir(url, completedFn);
        }
    }

    public static LoadResArray(url: string[], type: typeof cc.RawAsset, progressFn: progressT, completeCallback: completeTOfArray|null, isLock?: boolean): void;
    public static LoadResArray(url: string[], type: typeof cc.RawAsset, completeFn: completeTOfArray, isLock?: boolean): void;
    public static LoadResArray(url: string[], type: typeof cc.RawAsset, isLock?: boolean): void;
    public static LoadResArray(url: string[], progressFn: progressT, completeCallback: completeTOfArray|null, isLock?: boolean): void;
    public static LoadResArray(url: string[], completeFn: completeTOfArray, isLock?: boolean): void;
    public static LoadResArray(url: string[], isLock?: boolean): void;
    public static LoadResArray(): void {
        let args: LoadArgs = this.MakeLoadArgs.apply(null, arguments);
        let completedFn = (err: Error, asset: any[]) => {
            if (!err) {
                if (args.url instanceof Array) {
                    if (args.type) {
                        for (let i: number = 0; i < args.url.length; ++i) {
                            this.FinishedLoad(args.url[i], args.type, args.isLock);
                        }
                    }
                    else {
                        for (let i: number = 0; i < args.url.length; ++i) {
                            this.ParserAssetType(args.url[i], asset[i], args.isLock);
                        }
                    }
                    
                }
                else {
                    kit.ErrorID(102);
                }
            }
            args.completeFn && (args.completeFn as completeTOfArray)(err, asset);
        }
        
        let urls: string[] = args.url as string[];
        if (args.type && args.progressFn && args.completeFn) {
            cc.loader.loadResArray(urls, args.type, args.progressFn, completedFn);
        }else if (args.type && !args.progressFn && args.completeFn) {
            cc.loader.loadResArray(urls, args.type, completedFn);
        }else if (!args.type && args.progressFn && args.completeFn) {
            cc.loader.loadResArray(urls, args.progressFn, completedFn);
        }else {
            cc.loader.loadResArray(urls, completedFn);
        }
    }

    public static GetCacheRes(url: string, type: typeof cc.RawAsset): any {
        let res: any = cc.loader['_cache'][url];
        if (!res) {
            let uuid: string = cc.loader._getResUuid(url, type, null);
            if (uuid) {
                let reference: any = cc.loader._getReferenceKey(uuid);
                res = cc.loader['_cache'][reference];
            }
        }
        return res;
    }

    /**
     * 构建资源key值
     * @param url 资源路劲
     */
    public static MakeKey(url: string, type: typeof cc.RawAsset): string {
        let res: any = cc.loader['_cache'][url];
        if (res && res.id) {
            return res.id;
        }
        else {
            let uuid: string = cc.loader._getResUuid(url, type, null);
            if (uuid) {
                let reference: any = cc.loader._getReferenceKey(uuid);
                return reference;
            }
        }
        return '';
    }

    public static FinishedLoad(url: string, type: typeof cc.RawAsset, isLock: boolean): void {
        let res: any = this.GetCacheRes(url, type);
        if (!this.AddResItem(res, isLock)) {
            kit.WarnID(205, url);
        }
    }

    /**记录缓存的资源 */
    private static AddResItem(item: any, isLock: boolean): boolean {
        if (item && item.id) {
            let resInfo: kit.Resource = kit.PoolManager.Instance.GetCurrentPool().GetObject(item.id) as kit.Resource;
            if (!resInfo) {
                resInfo = kit.Resource.Create(item.id, isLock);
            }
            this.BulidResInfo(item, resInfo);
            return true;
        }
        return false;
    }

    private static BulidResInfo(item: any, resInfo: kit.Resource): void {
        if (item && item.dependKeys && Array.isArray(item.dependKeys)) {
            for (let depKey of item.dependKeys) {
                let depRes: any = cc.loader['_cache'][depKey];
                if (depRes) {
                    if (!resInfo.HasDepend(depKey)) {
                        resInfo.AddDepend(depKey);
                    }
                    let depInfo: kit.Resource = kit.PoolManager.Instance.GetCurrentPool().GetObject(depKey) as kit.Resource;
                    if (depInfo) {
                        this.BulidResInfo(depRes, depInfo);
                    }
                    else if (!depInfo) {
                        depInfo = kit.Resource.Create(depRes.id, false);
                        this.BulidResInfo(depRes, depInfo);
                    }
                }
                else {
                    kit.PoolManager.Instance.GetCurrentPool().Delete(depKey);
                }
            }
        }
    }

    private static MakeLoadArgs(): LoadArgs {
        if (arguments.length <= 0) {
            kit.ErrorID(100);
            return null;
        }
        let args: LoadArgs = {url: arguments[0]} as LoadArgs;
        for (let i: number = 1; i < arguments.length; ++i) {
            //第二个参数是资源的类型type
            if (i === 1 && cc.js.isChildClassOf(arguments[i], cc.RawAsset)) {
                args.type = arguments[i];
            }
            else if (i === arguments.length - 1 && typeof arguments[i] === 'boolean') {
                args.isLock = arguments[i];
                break;
            }
            else if (typeof arguments[i] === 'function') {
                //如果i是倒数第二个参数，那么就检测下一个参数（即最后一个参数）类型，最后一个是回调函数
                //说明参数表里面有两回调函数，当前i就是第一个回调函数，如果最后一个是Boolean，说明参数表只有一个函数
                //i只能是为一个的一个回调函数，所以是completedFn
                if (i === arguments.length - 2) {
                    if (typeof arguments[i+1] === 'function') {
                        args.progressFn = arguments[i];
                    }
                    else if (typeof arguments[i+1] === 'boolean') {
                        args.completeFn = arguments[i];
                    }
                    else {
                        kit.ErrorID(101);
                        return null;
                    }
                }
                //如果下一个参数类型也是函数，说明是最后一个回调函数
                else if (typeof arguments[i+1] === 'function') {
                    args.progressFn = arguments[i];
                }
                else if (i === arguments.length - 1) {
                    args.completeFn = arguments[i];
                    args.isLock = false;
                }
                else {
                    kit.ErrorID(101);
                    return null;
                }
            }
            else {
                kit.ErrorID(101);
                return null;
            }
        }
        return args;
    }

    private static ParserAssetType(url: string, asset: cc.RawAsset, isLock: boolean): void { 
        if (asset instanceof cc.SpriteFrame) {
            this.FinishedLoad(url, cc.SpriteFrame, isLock);
        }
        else if (asset instanceof cc.SpriteAtlas) {
            this.FinishedLoad(url, cc.SpriteAtlas, isLock);
        }
        else if (asset instanceof cc.BitmapFont) {
            this.FinishedLoad(url, cc.BitmapFont, isLock);
        }
        else if (asset instanceof cc.ParticleAsset) {
            this.FinishedLoad(url, cc.ParticleAsset, isLock);
        }
        else if (asset instanceof sp.SkeletonData) {
            this.FinishedLoad(url, sp.SkeletonData, isLock);
        }
        else if (asset instanceof cc.JsonAsset) {
            this.FinishedLoad(url, cc.JsonAsset, isLock);
        }
        else if (asset instanceof cc.LabelAtlas) {
            this.FinishedLoad(url, cc.LabelAtlas, isLock);
        }
        else if (asset instanceof cc.Font) {
            this.FinishedLoad(url, cc.Font, isLock);
        }
        else if (asset instanceof cc.Prefab) {
            this.FinishedLoad(url, cc.Prefab, isLock);
        }
        else if (asset instanceof cc.AudioClip) {
            this.FinishedLoad(url, cc.AudioClip, isLock);
        }
    }
}