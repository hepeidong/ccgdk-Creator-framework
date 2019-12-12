type ButtonResType = {normal: string, pressed: string, hover: string, disabled: string};
type completeFnType = (err: Error, asset: any) => void;
type progressFnType = (completedCount: number, totalCount: number, item: any) => void;

/**加载函数参数结构体 */
interface LoadArgs {
    url: string,
    type: typeof cc.Asset,
    progressFn: progressFnType,
    completeFn: completeFnType,
    isLock: boolean
}

class Loader {
    private _resMap: Map<string, any>;

    constructor() {
        this._resMap = new Map();
    }

    public loadRes(url: string, type: typeof cc.Asset, progressCallback: progressFnType, completeCallback: ((error: Error, resource: any) => void)|null, isLock?: boolean): void;
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
            let res: any = cc.loader['_cache'][this.getResUrl(args.url)];
            this._initReleaseCount(res, args.isLock);
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
    
    public instanitate(original: any, isLock?: boolean): cc.Node {
        if (!original) return;

        let newNode: cc.Node = cc.instantiate(original);
        this._addNode(newNode, isLock);
        return newNode;
    }

    public setResource(target: cc.Node, compType: cc.Component, url: string|ButtonResType, isLock?: boolean) {
        if (!target.getComponent('AutoRelease')) {
            this._addNode(target, isLock);
        }
        target.getComponent('AutoRelease').Source(url, compType, isLock);
    }

    public removeChild(target: cc.Node, cleanup?: boolean) {
        if (!cc.isValid(target)) return;
        target.removeFromParent(cleanup);
        target.destroy();
    }

    public gc() {
        this._resMap.forEach((value: any, key: string) => {
            if (value.isLock) {
                value.isLock = false;
                value._releaseCount = 0;
                this._releaseRes(value.url);
                this._resMap.delete(key);
            }
        });
    }

    public retain(url: string) {
        let key: string = this.makeKey(this.getResUrl(url));
        if (this._resMap.has(key)) {
            let tempRes: any = this._resMap.get(key);
            tempRes._releaseCount++;
            console.log('retain releaseCount ', tempRes._releaseCount);
            this._resMap.set(key, tempRes);
        }
    }

    public release(url: string) {
        let key: string = this.makeKey(this.getResUrl(url));
        if (this._resMap.has(key)) {
            let tempRes: any = this._resMap.get(key);
            tempRes._releaseCount--;
            console.log('releasse releaseCount ', tempRes._releaseCount);
            if (tempRes._releaseCount === 0) {
                if (tempRes.isLock) return;
                this._releaseRes(tempRes.url);
                this._resMap.delete(key);
            }
        }
    }

    public makeKey(url: string): string {
        return `key_${url}`;
    }

    public getResUrl(url: string): string {
        let res: any = cc.loader.getRes(url);
        if (res instanceof cc.Texture2D) {
            return res.url;
        }
        else if (res instanceof cc.BitmapFont) {
            return res['spriteFrame'].getTexture().url;
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
        console.log('do release ', url);
        let cacheRes: any[] = cc.loader['_cache'];
        let dependKeysMap: Map<string, any> = new Map();
        let releaseAsset: string[] = [];
        for (let key in cacheRes) {
            if (cacheRes[key].dependKeys && cacheRes[key].dependKeys.length > 0) {
                dependKeysMap.set(key, cacheRes[key].dependKeys);
            }
        }

        cc.loader.release(url);
        releaseAsset.push(url);
        this._releaseDependKeys(releaseAsset, dependKeysMap);
    }

    private _releaseDependKeys(releaseAsset: string[], dependKeysMap: Map<string, any>) {
        let res_json: string[] = [];
        let cacheRes: any[] = cc.loader['_cache'];
        dependKeysMap.forEach((value, key) => {
            for (let i: number = 0; i < value.length; ++i) {
                if (releaseAsset.indexOf(value[i]) !== -1) {
                    res_json.push(cacheRes[key].url);
                    cc.loader.release(cacheRes[key].url);
                }
            }
        });
        if (res_json.length > 0) {
            this._releaseDependKeys(res_json, dependKeysMap);
        }
    }

    private _initReleaseCount(res: any, isLock: boolean) {
        if (!res) return;
        if (res._releaseCount === undefined || res._releaseCount === null) {
            res._releaseCount = 0;
            this._resMap.set(this.makeKey(res.url), res);
        }
        this._setAutoRelease(this.makeKey(res.url), isLock);
    }

    private _setAutoRelease(key: string, is: boolean) {
        let tempRes: any = this._resMap.get(key);
        tempRes._isLock = is;
        this._resMap.set(key, tempRes);
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
        let cacheRes = cc.loader['_cache'];
        let sprite: cc.Sprite = target.getComponent(cc.Sprite);
        if (sprite && sprite.spriteFrame) {
            this._initReleaseCount(cacheRes[sprite.spriteFrame.getTexture().url], isLock);
            autoComponent.SetCurrRes(sprite.spriteFrame.getTexture().url);
        }

        let button: cc.Button = target.getComponent(cc.Button);
        if (button) {
            if (button.normalSprite) {
                this._initReleaseCount(cacheRes[button.normalSprite.getTexture().url], isLock);
            }
            if (button.pressedSprite) {
                this._initReleaseCount(cacheRes[button.pressedSprite.getTexture().url], isLock);
            }
            if (button.hoverSprite) {
                this._initReleaseCount(cacheRes[button.hoverSprite.getTexture().url], isLock);
            }
            if (button.disabledSprite) {
                this._initReleaseCount(cacheRes[button.disabledSprite.getTexture().url], isLock);
            }
            let buttonRes: ButtonResType = {
                normal: button.normalSprite.getTexture().url,
                pressed: button.pressedSprite.getTexture().url,
                hover: button.hoverSprite.getTexture().url,
                disabled: button.disabledSprite.getTexture().url
            }
            autoComponent.SetCurrRes(buttonRes);
        }

        let label: cc.Label = target.getComponent(cc.Label);
        if (label && label.font && label.font instanceof cc.BitmapFont && label.font['spriteFrame']) {
            this._initReleaseCount(cacheRes[label.font['spriteFrame'].getTexture().url], isLock);
            autoComponent.SetCurrRes(label.font['spriteFrame'].getTexture().url);
        }
    
        let richText = target.getComponent(cc.RichText);
        if (richText && richText.imageAtlas) {
            this._initReleaseCount(cacheRes[richText.imageAtlas.getTexture().url], isLock);
            autoComponent.SetCurrRes(richText.imageAtlas.getTexture().url);
        }
    
        let particleSystem = target.getComponent(cc.ParticleSystem) as cc.ParticleSystem;
        if (particleSystem && particleSystem.texture) {
            this._initReleaseCount(cacheRes[particleSystem.texture], isLock);
            autoComponent.SetCurrRes(particleSystem.texture);
            this._initReleaseCount(cacheRes[particleSystem.file], isLock);
            autoComponent.SetCurrRes(particleSystem.file);
        }
    
        let pageViewIndicator = target.getComponent(cc.PageViewIndicator);
        if (pageViewIndicator && pageViewIndicator.spriteFrame) {
            this._initReleaseCount(cacheRes[pageViewIndicator.spriteFrame.getTexture().url], isLock);
            autoComponent.SetCurrRes(pageViewIndicator.spriteFrame.getTexture().url);
        }
    
        let editBox = target.getComponent(cc.EditBox);
        if (editBox && editBox.backgroundImage) {
            this._initReleaseCount(cacheRes[editBox.backgroundImage.getTexture().url], isLock);
            autoComponent.SetCurrRes(editBox.backgroundImage.getTexture().url);
        }
    
        let mask = target.getComponent(cc.Mask);
        if (mask && mask.spriteFrame) {
            this._initReleaseCount(cacheRes[mask.spriteFrame.getTexture().url], isLock);
            autoComponent.SetCurrRes(mask.spriteFrame.getTexture().url);
        } 
    }
}

export const UILoader = new Loader();