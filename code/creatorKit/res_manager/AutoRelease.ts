
const {ccclass, property} = cc._decorator;

type ButtonResT = {normal: string, pressed: string, hover: string, disabled: string};
type ComponentT = cc.Sprite|cc.Button|cc.Mask|cc.PageViewIndicator|cc.EditBox|cc.Label|cc.RichText|cc.ParticleSystem;
type AnimateCompleteT = (asset: any) => void;
type AnimateT = sp.SkeletonData;

@ccclass
export class AutoRelease extends cc.Component {

    /** 结点引用的资源*/
    private _resMap: Map<string, string> = new Map();
    /**预制体资源容器 */
    private _prefabRes: string;
    /**是否锁定资源 */
    private _isLock: boolean;

    onLoad() {

    }

    public RecordPrefabRes(url: string) {
        this._prefabRes = url;
        SAFE_RETAIN(kit.PoolManager.Instance.GetCurrentPool().GetObject(this._prefabRes) as kit.Resource);
    }

    public Source(url: string|ButtonResT, compType: typeof cc.Component, isLock: boolean = false) {
        this._isLock = isLock;
        if (!compType) {
            kit.ErrorID(109);
            return;
        }
        
        let comp: any = this.node.getComponent(compType);
        this.ParseSource(comp, compType, url);
    }

    public Animation(url: string, compType: typeof cc.Component, complete: AnimateCompleteT, isLock: boolean = false) {
        this._isLock = isLock;
        let comp: any = this.node.getComponent(compType);
        this.ParseAnimate(comp, url, complete);
    }

    public SetResUrl(url: string, comp: ComponentT) {
        if (url === '' || !url) return;
        this.retain(url, comp);
    }

    private ParseAnimate(comp: ComponentT, url: string, complete: AnimateCompleteT) {
        if (comp && comp.uuid) {
            this.release(this._resMap.get(comp.uuid));
        }
        if (comp instanceof sp.Skeleton) {
            this.LoadAnimate(comp, url, sp.SkeletonData, complete);
        }
    }

    private LoadAnimate(comp: ComponentT, url: string, type: typeof cc.Asset, complete: AnimateCompleteT) {
        let key: string = kit.Loader.MakeKey(url, type);
        let animate: AnimateT = kit.PoolManager.Instance.GetCurrentPool().GetAnimateData(key);
        if (animate) {
            this.SetResUrl(key, comp);
            complete && complete(animate);
        }
        else {
            kit.Loader.LoadRes(url, type, (err: Error, asset: any) => {
                let key: string = kit.Loader.MakeKey(url, type);
                this.SetResUrl(key, comp);
                kit.PoolManager.Instance.GetCurrentPool().AddAnimateData(key, asset);
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
            throw kit.ErrorID(200);
        }
    }

    private SetSpriteFrame(compType: any , url: string, sfName: string):void {
        if (!url) {
            return;
        }
        let comp: ComponentT = this.node.getComponent(compType);
        if (!comp) {
            throw kit.ErrorID(106);
        }
        this.release(comp.uuid);
        let key: string = kit.Loader.MakeKey(url, cc.SpriteFrame);
        let res: cc.Texture2D = cc.loader.getRes(key);
        if (res) {
            this.SetResUrl(key, comp);
            comp[sfName] = new cc.SpriteFrame(res);
        }else {
            //不存在，则进行加载操作
            kit.Loader.LoadRes(url, cc.SpriteFrame, (err: Error, asset: any) => {
                if (err) {
                    kit.Error(err);
                    return;
                }
                kit.Loader.FinishedLoad(url, cc.SpriteFrame, this._isLock);
                this.SetResUrl(kit.Loader.MakeKey(url, cc.SpriteFrame), this.node.getComponent(compType));
                this.node.getComponent(compType)[sfName] = asset;
            }, this._isLock);
        }
    }

    private SetFont(url: string):void {
        let label: cc.Label = this.node.getComponent(cc.Label);
        if (!label) {
            throw kit.ErrorID(106);
        }
        this.release(label.uuid);
        let key: string = kit.Loader.MakeKey(url, cc.BitmapFont);
        let res: cc.BitmapFont = cc.loader.getRes(key);
        if (res) {
            this.SetResUrl(key, label);
            label.font = res;
        }else {
            kit.Loader.LoadRes(url, cc.BitmapFont, (err: Error, asset: any) => {
                if (err) {
                    kit.Error(err);
                    return;
                }
                kit.Loader.FinishedLoad(url, cc.BitmapFont, this._isLock);
                this.SetResUrl(kit.Loader.MakeKey(url, cc.BitmapFont), this.node.getComponent(cc.Label));
                this.node.getComponent(cc.Label).font = asset;
            }, this._isLock);
        }
    }

    private SetImageAtlas(url: string):void {
        let richText = this.node.getComponent(cc.RichText);
        if (!richText) {
            throw kit.ErrorID(106);
        }
        this.release(richText.uuid);
        let key: string = kit.Loader.MakeKey(url, cc.SpriteAtlas);
        let res: cc.SpriteAtlas = cc.loader.getRes(key);
        if (res) {
            this.SetResUrl(key, richText);
            richText.imageAtlas = res;
        }
        else {
            kit.Loader.LoadRes(url, cc.SpriteAtlas, (err: Error, asset: any) => {
                if (err) {
                    kit.Error(err);
                    return;
                }
                kit.Loader.FinishedLoad(url, cc.SpriteAtlas, this._isLock);
                this.SetResUrl(kit.Loader.MakeKey(url, cc.SpriteAtlas), this.node.getComponent(cc.RichText));
                this.node.getComponent(cc.RichText).imageAtlas = asset;
            }, this._isLock);
        }
    }

    private SetPartSys(url: string) {
        let partSys: cc.ParticleSystem = this.node.getComponent(cc.ParticleSystem);
        if (!partSys) {
            throw kit.ErrorID(106);
        }
        this.release(partSys.uuid);
        let key: string = kit.Loader.MakeKey(url, cc.ParticleAsset);
        let res: any = cc.loader.getRes(key);
        if (res) {
            this.SetResUrl(key, partSys);
            partSys.file = res;
        }
        else {
            kit.Loader.LoadRes(url, cc.ParticleAsset, (err: Error, asset: any) => {
                if (err) {
                    kit.Error(err);
                    return;
                }
                kit.Loader.FinishedLoad(url, cc.ParticleAsset, this._isLock);
                this.SetResUrl(kit.Loader.MakeKey(url, cc.ParticleAsset), this.node.getComponent(cc.ParticleSystem));
                this.node.getComponent(cc.ParticleSystem).file = asset;
            }, this._isLock);
        }
    }

    // start () {
    //     // init logic
    // }

    private release(key: string) {
        SAFE_RELEASE(kit.PoolManager.Instance.GetCurrentPool().GetObject(this._resMap.get(key)) as kit.Resource);
        this._resMap.delete(key);
    }

    private retain(url: string, comp: ComponentT) {
        if (!this._resMap.has(comp.uuid)) {
            this._resMap.set(comp.uuid, url);
            SAFE_RETAIN(kit.PoolManager.Instance.GetCurrentPool().GetObject(url) as kit.Resource);
        }
    }

    private releaseAll() {
        this._resMap.forEach((_value: string, key: string) => {
            this.release(key);
        });

        SAFE_RELEASE(kit.PoolManager.Instance.GetCurrentPool().GetObject(this._prefabRes) as kit.Resource);
    }

    onDestroy() {
        this.releaseAll();
    }

    // update () {
    //     // console.log('call update');
    // }
}
