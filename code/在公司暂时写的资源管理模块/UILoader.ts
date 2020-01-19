
/**加载函数参数结构体 */
interface LoadArgs {
    url: string,
    type: typeof cc.Asset,
    progressFn: progressFnType,
    completeFn: completeFnType,
    isLock: boolean
}

type ResConfig = {
    key: string,
    url: string,
    refCount: number,
    isLock: boolean
}

class Loader {
    private static _staticResReleaseMap: Map<string, ResConfig>;   //存放要释放的静态资源
    private static _resMap: Map<string, ResConfig>;                //存放所有加载的资源
    private _animatePool: Map<string, AnimateType>;                //动画池

    constructor() {
        Loader._staticResReleaseMap = new Map();
        Loader._resMap = new Map();
        this._animatePool = new Map();
    }

    public loadRes(url: string, type: typeof cc.Asset, progressCallback: progressFnType, completeCallback: completeFnType|null, isLock?: boolean): void;
    public loadRes(url: string, type: typeof cc.Asset, completeCallback: completeFnType, isLock?: boolean): void;
    public loadRes(url: string, type: typeof cc.Asset, isLock?: boolean): void;
    public loadRes(url: string, progressCallback: progressFnType, completeCallback: completeFnType|null, isLock?: boolean): void;
    public loadRes(url: string, completeCallback: completeFnType, isLock?: boolean): void;
    public loadRes(url: string, isLock?: boolean): void;
    public loadRes() {
        let args: LoadArgs = this._makeLoadArgs.apply(null, arguments);
        if (typeof args.url !== 'string') {
            console.error('路径参数类型不对');
            return;
        }
        
        let completedFn = (err: Error, asset: any) => {
            if (err) {
                console.error(`资源加载错误 ${err}`);
                return;
            }
            let url: string = this.getResUrl(args.url);
            this.addResConfig(url, args.isLock, asset instanceof cc.Prefab);
            args.completeFn && args.completeFn(err, asset);
        }
        //有些资源比较特殊，暂时注释掉
        // let res: cc.RawAsset = cc.loader.getRes(args.url as string);
        // if (res) {
        //     completedFn(null, res);
        //     return;
        // }
        if (args.type && args.progressFn && args.completeFn) {
            cc.loader.loadRes(args.url, args.type, args.progressFn, completedFn);
        }else if (args.type && !args.progressFn && args.completeFn) {
            cc.loader.loadRes(args.url, args.type, completedFn);
        }else if (!args.type && args.progressFn && args.completeFn) {
            cc.loader.loadRes(args.url, args.progressFn, completedFn);
        }else {
            cc.loader.loadRes(args.url, completedFn);
        }
    }

    public addAnimation(key: string, obj: AnimateType) {
        this._animatePool.set(key, obj);
    }

    public getAnimation(key: string): AnimateType {
        return this._animatePool.get(key);
    }
    
    public instanitate(original: any, isLock?: boolean): cc.Node {
        if (!original) return;

        let newNode: cc.Node = cc.instantiate(original);
        this._addNode(newNode, isLock);
        return newNode;
    }

    public setResource(target: cc.Node, compType: typeof cc.Component, url: string|ButtonResType, isLock?: boolean): void {
        if (!target.getComponent('AutoRelease')) {
            this._addNode(target, isLock);
        }
        isLock = isLock ? true : false;
        target.getComponent('AutoRelease').Source(url, compType, isLock);
    }

    public setAnimation(target: cc.Node, url: string, compType: typeof cc.Component, complete: AnimateCompleteType, isLock?: boolean): void {
        if (!target.getComponent('AutoRelease')) {
            this._addNode(target, isLock);
        }
        isLock = isLock ? true : false;
        target.getComponent('AutoRelease').Animation(url, compType, complete, isLock);
    }

    public setAudio(url: string, complete: (asset: cc.AudioClip) => void, isLock: boolean): void {
        let audio: cc.AudioClip = cc.loader.getRes(url);
        if (audio) {
            complete && complete(audio);
        }
        else {
            isLock = isLock ? true : false;
            this.loadRes(url, cc.AudioClip, (err: Error, asset: cc.AudioClip) => {
                if (err) {
                    throw console.error(`音频加载错误 ${url}`);
                }
                complete && complete(asset);
            }, isLock);
        }
    }

    public removeChild(target: cc.Node, cleanup?: boolean) {
        if (!cc.isValid(target, true)) return;
        target.removeFromParent(cleanup);
        target.destroy();
    }

    /**强制释放所有资源，谨慎使用 */
    public gc() {
        this._animatePool.clear();
        Loader._resMap.forEach((value: ResConfig, key: string) => {
            if (value.isLock) {
                value.isLock = false;
                value.refCount = 1;
                Loader._resMap.set(key, value);
            }
            this.release(value.url);
        });
        Loader._staticResReleaseMap.forEach((value: ResConfig, key: string) => {
            if (value.isLock) {
                value.isLock = false;
                value.refCount = 1;
                Loader._staticResReleaseMap.set(key, value);
            }
            this.release(value.url);
        });
    }

    public retain(url: string) {
        let key: string = this.makeKey(this.getResUrl(url));
        if (Loader._resMap.has(key)) {
            let tempRes: ResConfig = Loader._resMap.get(key);
            tempRes.refCount++;
            // cck.log('do retain res key',key,'release count', tempRes.refCount);
            Loader._resMap.set(key, tempRes);
        }
        else {
            if (key) {
                let resUrl: string = this.getResUrl(url);
                let res: any = cc.loader['_cache'][resUrl];
                if (res) {
                    Loader._resMap.set(key, {key: key, url: resUrl, refCount: 1, isLock: false});
                }
                else {
                    cck.log('Loader >> retain 资源 URL 为静态资源', resUrl);
                    Loader._resMap.set(key, {key: key, url: resUrl, refCount: 1, isLock: true});
                }
            }
        }
    }

    public release(url: string) {
        let key: string = this.makeKey(this.getResUrl(url));
        if (Loader._resMap.has(key)) {
            let tempRes: ResConfig = Loader._resMap.get(key);
            tempRes.refCount--;
            // cck.log('do release res key', key,'release count', tempRes.refCount);
            if (tempRes.refCount <= 0) {
                if (tempRes.isLock) {
                    cck.log('静态资源，不能自动释放', tempRes.url);
                    Loader._staticResReleaseMap.set(tempRes.key, tempRes);
                    Loader._resMap.delete(tempRes.key);
                    return;
                }
                cck.log('do release res', tempRes.url);
                this._releaseRes(tempRes.url);
                Loader._resMap.delete(key);
            }
        }
        else {
            if (key) {
                let resUrl: string = this.getResUrl(url);
                let res: any = cc.loader['_cache'][resUrl];
                if (res) {
                    Loader._resMap.set(key, {key: key, url: resUrl, refCount: 1, isLock: false});
                    this.release(resUrl);
                }
                else {
                    cck.log('Loader >> release 资源 URL 为静态资源', resUrl);
                    Loader._resMap.set(key, {key: key, url: resUrl, refCount: 1, isLock: true});
                    this.release(resUrl);
                }
            }
            else {
                cck.warn('Loader >> release 资源 URL 不正确', url);
            }
        }
    }

    public makeKey(url: string): string {
        return `key_${url}`;
    }

    public getResUrl(url: string): string {
        let res: any = cc.loader['_cache'][url];
        if (res) {
            return url;
        }
        else {
            return this._getUrl(url);
        }
    }

    public addResConfig(url: string, isLock: boolean, isPrefab: boolean) {
        let resUrl: string = this.getResUrl(url);
        if (!resUrl || resUrl.length === 0) {
            // cck.log('Loader >> addResConfig 资源对象为空');
            return;
        }
        if (cc.loader['_cache'][resUrl]) {
            this._initReleaseCount(resUrl, isLock);
        }
        else {
            if (isPrefab) {
                this._initReleaseCount(resUrl, isLock);
            }
            else {
                this._initReleaseCount(resUrl, true);
                cck.log('Loader >> addResConfig 资源为静态资源', url);
            }
        }
    }

    private _getUrl(url: string): string {
        let res: any = cc.loader.getRes(url);
        if (res instanceof cc.Texture2D) {
            return res.url;
        }
        else if (res instanceof cc.BitmapFont) {
            return res['spriteFrame'].getTexture().url;
        }
        else if (res instanceof cc.AudioClip) {
            return res.nativeUrl;
        }
        if (!url || url.length === 0) {
            cck.log('Loader >> _getUrl 资源对象为空', url);
        }
        return url;
    }

    private _makeLoadArgs(): LoadArgs {
        if (arguments.length <= 0) {
            console.error('没有传入参数');
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
                        console.error('传入的参数不对');
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
                    console.error('传入的参数不对');
                    return null;
                }
            }
            else {
                console.error('传入的参数不对');
                return null;
            }
        }
        return args;
    }

    private _releaseRes(url: string) {
        let dependKeysMap: Map<string, any> = new Map();
        let releaseAsset: string[] = [];
        for (let key in cc.loader['_cache']) {
            if (cc.loader['_cache'][key].dependKeys && cc.loader['_cache'][key].dependKeys.length > 0) {
                dependKeysMap.set(key, cc.loader['_cache'][key].dependKeys);
            }
        }

        cck.log('do release ', url);
        cc.loader.release(url);
        releaseAsset.push(url);
        this._releaseDependKeys(releaseAsset, dependKeysMap);
    }

    private _releaseDependKeys(releaseAsset: string[], dependKeysMap: Map<string, any>) {
        let res_json: string[] = [];
        dependKeysMap.forEach((value, key) => {
            for (let i: number = 0; i < value.length; ++i) {
                if (releaseAsset.indexOf(value[i]) !== -1) {
                    res_json.push(cc.loader['_cache'][key].url);
                    cck.log('do release ', cc.loader['_cache'][key].url);
                    cc.loader.release(cc.loader['_cache'][key].url);
                }
            }
        });
        if (res_json.length > 0) {
            this._releaseDependKeys(res_json, dependKeysMap);
        }
    }

    private _initReleaseCount(url: string, isLock: boolean) {
        let key: string = this.makeKey(url);
        if (!Loader._resMap.has(key)) {
            let resCfg: ResConfig = {key: key, url: url, refCount: 0, isLock: isLock};
            Loader._resMap.set(key, resCfg);
        }
    }

    private _addNode(target: cc.Node, isLock: boolean) {
        if (!target.getComponent('AutoRelease')) {
            target.addComponent('AutoRelease');
        }
        this._parseNode(target, isLock);
        let children: cc.Node[] = target.children;
        children.forEach((child: cc.Node) => {
            this._addNode(child, isLock);
        });
    }

    private _parseNode(target: cc.Node, isLock: boolean) {
        let autoComponent = target.getComponent('AutoRelease');
        let sprite: cc.Sprite = target.getComponent(cc.Sprite);
        if (sprite && sprite.spriteFrame) {
            this.addResConfig(sprite.spriteFrame.getTexture().url, isLock, false);
            autoComponent.SetCurrRes(sprite.spriteFrame.getTexture().url);
        }

        let button: cc.Button = target.getComponent(cc.Button);
        if (button && button.transition === cc.Button.Transition.SPRITE) {
            if (button.normalSprite) {
                this.addResConfig(button.normalSprite.getTexture().url, isLock, false);
            }
            if (button.pressedSprite) {
                this.addResConfig(button.pressedSprite.getTexture().url, isLock, false);
            }
            if (button.hoverSprite) {
                this.addResConfig(button.hoverSprite.getTexture().url, isLock, false);
            }
            if (button.disabledSprite) {
                this.addResConfig(button.disabledSprite.getTexture().url, isLock, false);
            }
            let buttonRes: ButtonResType = {
                normal: button.normalSprite && button.normalSprite.getTexture().url,
                pressed: button.pressedSprite && button.pressedSprite.getTexture().url,
                hover: button.hoverSprite && button.hoverSprite.getTexture().url,
                disabled: button.disabledSprite && button.disabledSprite.getTexture().url
            }
            autoComponent.SetCurrRes(buttonRes);
        }

        let label: cc.Label = target.getComponent(cc.Label);
        if (label && label.font && label.font instanceof cc.BitmapFont && label.font['spriteFrame']) {
            this.addResConfig(label.font['spriteFrame'].getTexture().url, isLock, false);
            autoComponent.SetCurrRes(label.font['spriteFrame'].getTexture().url);
        }
    
        let richText = target.getComponent(cc.RichText);
        if (richText && richText.imageAtlas) {
            this.addResConfig(richText.imageAtlas.getTexture().url, isLock, false);
            autoComponent.SetCurrRes(richText.imageAtlas.getTexture().url);
        }
    
        let particleSystem = target.getComponent(cc.ParticleSystem) as cc.ParticleSystem;
        if (particleSystem && particleSystem.texture) {
            this.addResConfig(particleSystem.texture, isLock, false);
            autoComponent.SetCurrRes(particleSystem.texture);
            this.addResConfig(particleSystem.file, isLock, false);
            autoComponent.SetCurrRes(particleSystem.file);
        }
    
        let pageViewIndicator = target.getComponent(cc.PageViewIndicator);
        if (pageViewIndicator && pageViewIndicator.spriteFrame) {
            this.addResConfig(pageViewIndicator.spriteFrame.getTexture().url, isLock, false);
            autoComponent.SetCurrRes(pageViewIndicator.spriteFrame.getTexture().url);
        }
    
        let editBox = target.getComponent(cc.EditBox);
        if (editBox && editBox.backgroundImage) {
            this.addResConfig(editBox.backgroundImage.getTexture().url, isLock, false);
            autoComponent.SetCurrRes(editBox.backgroundImage.getTexture().url);
        }
    
        let mask = target.getComponent(cc.Mask);
        if (mask && mask.spriteFrame) {
            this.addResConfig(mask.spriteFrame.getTexture().url, isLock, false);
            autoComponent.SetCurrRes(mask.spriteFrame.getTexture().url);
        } 
    }
}
export const UILoader = new Loader();