import { UILoader } from "./UILoader";

const {ccclass, property} = cc._decorator;

type ButtonResT = {normal: string, pressed: string, hover: string, disabled: string};
type ComponentT = cc.Sprite|cc.Button|cc.Mask|cc.PageViewIndicator|cc.EditBox|cc.Label|cc.RichText|cc.ParticleSystem|sp.Skeleton;
type AnimateCompleteT = (asset: any) => void;
type AnimateT = sp.SkeletonData;

@ccclass
export class AutoRelease extends cc.Component {

    @property
    /** 结点引用的资源*/
    _currRes: string[] = [];

    @property
    /**是否锁定资源 */
    _isLock: boolean = false;

    onLoad() {
        this._currRes = [];
        this._isLock = true;
    }

    public Source(url: string|ButtonResT, compType: any, isLock: boolean = false) {
        this._isLock = isLock;
        if (!compType) {
            console.error('没有传入组件类型');
            return;
        }
        
        let comp: ComponentT = this.node.getComponent(compType);
        this.ParseSource(comp, compType, url);
    }

    public Animation(url: string, compType: any, complete: AnimateCompleteT, isLock: boolean = false) {
        this._isLock = isLock;
        let comp: ComponentT = this.node.getComponent(compType);
        this.ParseAnimate(comp, url, complete);
    }

    public SetCurrRes(url:string|ButtonResT) {
        if (url == null) {
            cck.log('AutoRelease >> SetCurrRes 资源 URL 为空');
            return;
        }
        if (typeof url === 'string') {
            if (url.length === 0) {
                cck.log('AutoRelease >> SetCurrRes 资源 URL 为空');
                return;
            }
            let url_: string = UILoader.getResUrl(url);
            if (this.Contain(url_) === null) {
                this._currRes.push(url_);
                UILoader.retain(url_);
            }
            else {
                cck.warn('AutoRelease >> SetCurrRes 资源已经存在');
            }
        }
        else {
            for (let key in url) {
                if (key.length === 0) {
                    cck.log('AutoRelease >> SetCurrRes 资源 URL 为空');
                    return;
                }
                let url_: string = UILoader.getResUrl(url[key]);
                if (this.Contain(url_) === null) {
                    this._currRes.push(url_);
                    UILoader.retain(url_);
                }
                else {
                    cck.warn('AutoRelease >> SetCurrRes 资源已经存在');
                }
            }
        }
    }

    private Contain(url: string|ButtonResT): number {
        for (let i: number = 0; i < this._currRes.length; ++i) {
            if (url === this._currRes[i]) return i;
        }
        return null;
    }

    private ParseAnimate(comp: ComponentT, url: string, complete: AnimateCompleteT) {
        if (comp instanceof sp.Skeleton) {
            if (comp.skeletonData) {
                for (let i: number = 0; i < comp.skeletonData.textures.length; ++i) {
                    this.release(comp.skeletonData.textures[i].url);
                }
            }
            this.LoadAnimate(url, sp.SkeletonData, complete);
        }
    }

    private LoadAnimate(url: string, type: any, complete: AnimateCompleteT) {
        let animate: AnimateT = UILoader.getAnimation(UILoader.makeKey(UILoader.getResUrl(url)));
        if (animate) {
            complete && complete(animate);
        }
        else {
            UILoader.loadRes(url, type, (err: Error, asset: any) => {
                this.SetCurrRes(url);
                let key: string = UILoader.makeKey(UILoader.getResUrl(url));
                UILoader.addAnimation(key, asset);
                complete && complete(asset);
            }, this._isLock);
        }
    }

    private ParseSource(comp: ComponentT, compType: any, url: string|ButtonResT): void {
        if (comp instanceof cc.Sprite || comp instanceof cc.Mask || comp instanceof cc.PageViewIndicator) {
            this.SetSpriteFrame(compType, url as string, 'spriteFrame');
        }
        else if (comp instanceof cc.Button) {
            this.SetSpriteFrame(compType, (url as ButtonResT).normal, 'spriteFrame');
            this.SetSpriteFrame(compType, (url as ButtonResT).pressed, 'spriteFrame');
            this.SetSpriteFrame(compType, (url as ButtonResT).disabled, 'spriteFrame');
            this.SetSpriteFrame(compType, (url as ButtonResT).hover, 'spriteFrame');
        }
        else if (comp instanceof cc.Label) {
            this.SetFont(url as string);
        }
        else if (comp instanceof cc.ParticleSystem) {
            this.SetPartSys(url as string);
        }
        else if (comp instanceof cc.EditBox) {
            this.SetSpriteFrame(compType, url as string, 'backgroundImage');
        }
        else if (comp instanceof cc.RichText) {
            this.SetImageAtlas(url as string);
        }
        else {
            throw console.error('组件类型不对');
        }
    }

    private SetSpriteFrame(compType: any , url: string, sfName: string):void {
        let comp: ComponentT = this.node.getComponent(compType);
        if (!comp) {
            throw console.error('节点没有这个组件');
        }
        if (comp[sfName]) {
            this.release(comp[sfName].getTexture().url);
        }
        let res: cc.Texture2D = cc.loader.getRes(url);
        if (res) {
            this.SetCurrRes(url);
            comp[sfName] = new cc.SpriteFrame(res);
        }else {
            //不存在，则进行加载操作
            UILoader.loadRes(url, cc.SpriteFrame, (err: Error, asset: any) => {
                this.SetCurrRes(url);
                this.node.getComponent(compType)[sfName] = asset;
            }, this._isLock);
        }
    }

    private SetFont(url: string):void {
        let label: cc.Label = this.node.getComponent(cc.Label);
        if (!label) {
            throw console.error('节点没有这个组件');
        }
        if (label.font && label.font instanceof cc.BitmapFont) {
            this.release(label.font['spriteFrame'].getTexture().url);
        }
        let res: cc.BitmapFont = cc.loader.getRes(url);
        if (res) {
            this.SetCurrRes(url);
            label.font = res;
        }else {
            UILoader.loadRes(url, cc.BitmapFont, (err: Error, asset: any) => {
                this.SetCurrRes(url);
                this.node.getComponent(cc.Label).font = asset;
            }, this._isLock);
        }
    }

    private SetImageAtlas(url: string):void {
        let richText: cc.RichText = this.node.getComponent(cc.RichText);
        if (!richText) {
            throw console.error('节点没有这个组件');
        }
        if (richText.imageAtlas) {
            this.release(richText.imageAtlas.getTexture().url);
        }
        UILoader.loadRes(url, cc.SpriteAtlas, (err: Error, asset: any) => {
            this.SetCurrRes(url);
            this.node.getComponent(cc.RichText).imageAtlas = asset;
        }, this._isLock);
    }

    private SetPartSys(url: string) {
        let partSys: cc.ParticleSystem = this.node.getComponent(cc.ParticleSystem);
        if (!partSys) {
            throw console.error('节点没有这个组件');
        }
        if (partSys.texture) {
            this.release(partSys.texture);
            this.release(partSys.file);
        }
        let res: cc.Texture2D = cc.loader.getRes(url);
        if (res) {
            this.SetCurrRes(url);
            partSys.texture = res.url;
            partSys.file = res.url;
        }
        else {
            UILoader.loadRes(url, (err: Error, asset: any) => {
                this.SetCurrRes(url);
                this.node.getComponent(cc.ParticleSystem).texture = asset;
            }, this._isLock);
        }
    }

    private SetSkeletonData() {

    }

    start () {
        // init logic
    }

    private release(url: string) {
        let index: number = this.Contain(url);
        if (index !== null) {
            UILoader.release(url);
        }
        this._currRes.splice(index, 1);
    }

    private releaseAll() {
        for (let i: number = 0; i < this._currRes.length; ++i) {
            UILoader.release(this._currRes[i]);
        }
        this._currRes.splice(0, this._currRes.length);

    }

    onDestroy() {
        this.releaseAll();
    }

    update () {
        // console.log('call update');
    }
}
