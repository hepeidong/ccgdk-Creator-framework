import { EventListeners } from "../event_manager/EventListeners";
import { PoolManager } from "./AutoReleasePool";
import { Resource } from "./Resource";

/**纹理格式 */
enum PixelFormat{
     PIXE_RGB565 = 16,
     PIXE_RGB5A1 =  16,
     PIXE_RGBA4444 =  16,
     PIXE_RGB888 =  24,
     PIXE_RGBA8888 =  36,
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
export class UILoader extends EventListeners {
    constructor() {
        super();
    }

    public static Instanitate(original: any, isLock: boolean = false): cc.Node {
        if (!original){
            return;
        }
        let newNode: cc.Node = cc.instantiate(original);
        this.addNode(newNode, isLock);
        return newNode;
    }

    public static SetResource(target: cc.Node, compType: any, url: string|ButtonResT, isLock: boolean = false): void {
        if (!target.getComponent('AutoRelease')) {
            this.addNode(target, isLock);
        }
        target.getComponent('AutoRelease').Source(url, compType, isLock);
    }


    public static Gc(): void {
        cf.PoolManager.Instance.GetCurrentPool().Clear();
    }

    public static GetRes(url: string): Resource {
        return cf.PoolManager.Instance.GetCurrentPool().GetObject(this.makeKey(url)) as Resource;
    }

    public static Retain(url: string): void {
        cf.PoolManager.Instance.GetCurrentPool().ClearOf(this.makeKey(url));
    }

    public static Release(url: string|string[]): void {
        if (typeof url === 'object') {
            if (url instanceof Array) {
                for (let i: number = 0; i < url.length; ++i) {
                    cf.PoolManager.Instance.GetCurrentPool().ClearOf(this.makeKey(url[i]));
                }
            }
        }
        else if (typeof url === 'string') {
            cf.PoolManager.Instance.GetCurrentPool().ClearOf(this.makeKey(url));
        }
    }

    public static Load(url: string|string[]|UrlOfLoadT, progressFn: progressT, completeFn: Function|null, isLock: boolean): void;
    public static Load(url: string|string[]|UrlOfLoadT, completeFn: completed, isLock: boolean): void;
    public static Load(): void {
        let args: LoadArgs = this.makeLoadArgs.apply(null, arguments);    
        if (args.url instanceof Array) {
            cf.ErrorID(102);
            return;
        }
        let completedFn = (err: Error, asset: any) => {
            if (!err) {
                if (typeof args.url === 'string') {
                    this.addRefCount(args.url, args.isLock);
                }else if (typeof args.url === 'object') {
                    if (args.url instanceof Array) {
                        for (let i: number = 0; i < args.url.length; ++i) {
                            this.addRefCount(args.url[i], args.isLock);
                        }
                    }
                    else {
                        this.addRefCount(args.url.url, args.isLock);
                    }
                }
            }
            args.completeFn && (args.completeFn as completed)(err, asset);
        }
        //有些资源比较特殊，暂时注释掉
        // let res: cc.RawAsset;
        // if (typeof args.url === 'string') {
        //     res = cc.loader.getRes(args.url);
        // }else {
        //     res = cc.loader.getRes((args.url as {uuid?: string, url?: string, type?: string}).url);
        // }
        // if (res) {
        //     completedFn(null, res);
        //     return;
        // }
        
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
        let args: LoadArgs = this.makeLoadArgs.apply(null, arguments);
        if (typeof args.url !== 'string') {
            cf.ErrorID(102);
            return;
        }
        
        let completedFn = (err: Error, asset: any) => {
            if (!err) {
                this.addRefCount(args.url as string, args.isLock);
            }
            args.completeFn && (args.completeFn as completeTOfRes)(err, asset);
        }
        //有些资源比较特殊，暂时注释掉
        // let res: cc.RawAsset = cc.loader.getRes(args.url as string);
        // if (res) {
        //     completedFn(null, res);
        //     return;
        // }
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
        let args: LoadArgs = this.makeLoadArgs.apply(null, arguments);
        if (typeof args.url !== 'string') {
            cf.ErrorID(102);
            return;
        }
        let completedFn = (err: Error, asset: any[], urls: string[]) => {
            if (!err) {
                for (let i: number = 0; i < urls.length; ++i) {
                    this.addRefCount(urls[i], args.isLock);
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
        let args: LoadArgs = this.makeLoadArgs.apply(null, arguments);
        let completedFn = (err: Error, asset: any[]) => {
            if (!err) {
                if (args.url instanceof Array) {
                    for (let i: number = 0; i < args.url.length; ++i) {
                        this.addRefCount(args.url[i], args.isLock);
                    }
                }
                else {
                    cf.ErrorID(102);
                }
            }
            args.completeFn && (args.completeFn as completeTOfArray)(err, asset);
        }
        
        let urls: string[] = args.url as string[];
        //有些资源比较特殊，暂时注释掉
        // let ress: cc.RawAsset[] = [];
        // for (let i: number = 0; i < urls.length; ++i) {
        //     let res: cc.RawAsset = cc.loader.getRes(urls[i]);
        //     if (res) ress.push(res);
        // }
        // if (ress.length === urls.length) {
        //     completedFn(null, ress);
        //     return;
        // }
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

    private static makeLoadArgs(): LoadArgs {
        if (arguments.length <= 0) {
            cf.ErrorID(100);
            return null;
        }
        let args: LoadArgs = {url: arguments[0]} as LoadArgs;
        for (let i: number = 1; i < arguments.length; ++i) {
            //第二个参数是资源的类型type
            if (i === 1 && cc.isChildClassOf(arguments[i], cc.RawAsset)) {
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
                        cf.ErrorID(101);
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
                    cf.ErrorID(101);
                    return null;
                }
            }
            else {
                cf.ErrorID(101);
                return null;
            }
        }
        return args;
    }

    private static addNode(node: cc.Node, isLock: boolean): void {
        let children = node.children;
        if (!node.getComponent('AutoRelease'))
            node.addComponent('AutoRelease');

        children.forEach(child => {
            this.parserPrefabNode(child, isLock);
            this.addNode(child, isLock);
        });
    }

    private static addRefCount(url: string, isLock: boolean) {
        let res: cc.RawAsset = cc.loader.getRes(url);
        if (!(res instanceof cc.Prefab)) {
            this.addResKey(url, res, isLock);
        }
    }

    /**
     * 增加资源key值
     * @param url 资源路劲
     * @param asset 资源对象
     * @param isLock 是否锁定
     */
    private static addResKey(url: string, asset: any, isLock: boolean): void {
        let res: Resource;
        let res_key: string = this.makeKey(url);//资源key值
        if (!PoolManager.Instance.GetCurrentPool().Contains(url)) {
            res = new Resource();
            res.Key = res_key;
            res.IsLock = isLock;
            if (asset instanceof cc.Texture2D) {
                res.memorySize = asset.width * asset.height * this.getPixeFormat(asset);
            }
            SAFE_AUTORELEASE(res);
        }else  {
            res = PoolManager.Instance.GetCurrentPool().GetObject(res_key) as Resource;
        }
        SAFE_RETAIN(res);
    }

    /**
     * 构建资源key值
     * @param url 资源路劲
     */
    private static makeKey(url: string): string {
        let strArr: string[] = url.split('/');
        if (strArr[1] !== 'res' && strArr[2] !== 'raw-assets') {
            let res: cc.RawAsset = cc.loader.getRes(url);
            if (res instanceof cc.Texture2D) {
                return res.url;
            }
            else if (res instanceof cc.BitmapFont) {
                return res['spriteFrame'].getTexture().url;
            }
        }
        return url;
    }

    private static getPixeFormat(tex: cc.Texture2D): number {
        switch (tex.getPixelFormat()) {
            case cc.Texture2D.PixelFormat.RGB565:
                return PixelFormat.PIXE_RGB565;
            case cc.Texture2D.PixelFormat.RGB5A1:
                return PixelFormat.PIXE_RGB5A1;
            case cc.Texture2D.PixelFormat.A8:
                return PixelFormat.PIXE_A8;
            case cc.Texture2D.PixelFormat.AI88:
                return PixelFormat.PIXE_AI8;
            case cc.Texture2D.PixelFormat.I8:
                return PixelFormat.PIXE_I8;
            case cc.Texture2D.PixelFormat.RGB888:
                return PixelFormat.PIXE_RGB888;
            case cc.Texture2D.PixelFormat.RGBA4444:
                return PixelFormat.PIXE_RGBA4444;
            case cc.Texture2D.PixelFormat.RGBA8888:
                return PixelFormat.PIXE_RGBA8888;
            default:
                return 0;
        }
    }

    /**
     * 解析预制体
     * @param node 预制体结点
     * @param isLock 是否锁定资源
     */
    private static parserPrefabNode(node: cc.Node, isLock: boolean): void {
        let sprite: cc.Sprite = node.getComponent(cc.Sprite);
        if (sprite && sprite.spriteFrame) {
            this.addResKey(sprite.spriteFrame.getTexture().url, sprite.spriteFrame.getTexture(), isLock);
        }
    
        let button: cc.Button = node.getComponent(cc.Button);
        if (button) {
            if (button.normalSprite) {
                this.addResKey(button.normalSprite.getTexture().url, button.normalSprite.getTexture(), isLock);
            }
    
            if (button.pressedSprite) {
                this.addResKey(button.pressedSprite.getTexture().url, button.pressedSprite.getTexture(), isLock);
            }
    
            if (button.hoverSprite) {
                this.addResKey(button.hoverSprite.getTexture().url, button.hoverSprite.getTexture(), isLock);
            }
    
            if (button.disabledSprite) {
                this.addResKey(button.disabledSprite.getTexture().url, button.disabledSprite.getTexture(), isLock);
            }
        }

        let label: cc.Label = node.getComponent(cc.Label);
        if (label && label.font && label.font instanceof cc.BitmapFont && label.font['spriteFrame']) {
            this.addResKey(label.font['spriteFrame'].getTexture().url, label.font['spriteFrame'].getTexture(), isLock);
        }
    
        let richText = node.getComponent(cc.RichText);
        if (richText && richText.imageAtlas) {
            this.addResKey(richText.imageAtlas.getTexture().url, richText.imageAtlas.getTexture(), isLock);
        }
    
        let cache = cc.loader['_cache'];
        let particleSystem = node.getComponent(cc.ParticleSystem) as cc.ParticleSystem;
        if (particleSystem && particleSystem.texture) {
            if (typeof particleSystem.texture === 'string') {
                this.addResKey(particleSystem.texture, cache[particleSystem.texture], isLock);
            }else {
                this.addResKey(particleSystem.texture.url, particleSystem.texture, isLock);
            }
            this.addResKey(particleSystem.file, cache[particleSystem.file], isLock);
        }
    
        let pageViewIndicator = node.getComponent(cc.PageViewIndicator);
        if (pageViewIndicator && pageViewIndicator.spriteFrame) {
            this.addResKey(pageViewIndicator.spriteFrame.getTexture().url, pageViewIndicator.spriteFrame.getTexture(), isLock);
        }
    
        let editBox = node.getComponent(cc.EditBox);
        if (editBox && editBox.backgroundImage) {
            this.addResKey(editBox.backgroundImage.getTexture().url, editBox.backgroundImage.getTexture(), isLock);
        }
    
        let mask = node.getComponent(cc.Mask);
        if (mask && mask.spriteFrame) {
            this.addResKey(mask.spriteFrame.getTexture().url, mask.spriteFrame.getTexture(), isLock);
        }
    }
}