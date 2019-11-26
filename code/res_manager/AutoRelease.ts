const {ccclass, property} = cc._decorator;

type ButtonResT = {normal: string, pressed: string, hover: string, disabled: string};
type ComponentT = cc.Sprite|cc.Button|cc.Mask|cc.PageViewIndicator|cc.EditBox|cc.Label|cc.RichText|cc.ParticleSystem;

@ccclass
export class AutoRelease extends cc.Component {

    /** 结点引用的资源*/
    private _currRes: string|ButtonResT;
    /**是否锁定资源 */
    private _isLock: boolean;

    onLoad() {

    }

    public Source(url: string|ButtonResT, compType: any, isLock: boolean = false) {
        if (this._currRes) {
            this.release();
        }
        this._currRes = url;
        this._isLock = isLock;
        if (!compType) {
            cf.ErrorID(109);
            return;
        }
        
        let comp: ComponentT = this.node.getComponent(compType);
        this.ParseSource(comp, compType, url);
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
            throw cf.ErrorID(200);
        }
    }

    private SetSpriteFrame(compType: any , url: string, sfName: string):void {
        let comp: ComponentT = this.node.getComponent(compType);
        if (!comp) {
            throw cf.ErrorID(106);
        }
        let res: cc.Texture2D = cc.loader.getRes(url);
        if (res) {
            cf.UILoader.Retain(url);
            comp[sfName] = new cc.SpriteFrame(res);
        }else {
            //不存在，则进行加载操作
            cf.UILoader.LoadRes(url, cc.SpriteFrame, (err: Error, asset: any) => {
                if (err) {
                    cf.Error(err);
                    return;
                }
                this.node.getComponent(compType)[sfName] = asset;
            }, this._isLock);
        }
    }

    private SetFont(url: string):void {
        let label: cc.Label = this.node.getComponent(cc.Label);
        if (!label) {
            throw cf.ErrorID(106);
        }
        let res: cc.BitmapFont = cc.loader.getRes(url);
        if (res) {
            cf.UILoader.Retain(url);
            label.font = res;
        }else {
            cf.UILoader.LoadRes(url, cc.BitmapFont, (err: Error, asset: any) => {
                if (err) {
                    cf.Error(err);
                    return;
                }
                this.node.getComponent(cc.Label).font = asset;
            }, this._isLock);
        }
    }

    private SetImageAtlas(url: string):void {
        if (!this.node.getComponent(cc.RichText)) {
            throw cf.ErrorID(106);
        }
        //cc.loader.getRes(url)取得的资源的类型是cc.Texture2D 不是cc.SpriteAtlas
        //所以不在这里进行是否加载了此资源判断
        cf.UILoader.LoadRes(url, cc.SpriteAtlas, (err: Error, asset: any) => {
            if (err) {
                cf.Error(err);
                return;
            }
            this.node.getComponent(cc.RichText).imageAtlas = asset;
        }, this._isLock);
    }

    private SetPartSys(url: string) {
        let partSys: cc.ParticleSystem = this.node.getComponent(cc.ParticleSystem);
        if (!partSys) {
            throw cf.ErrorID(106);
        }
        let res: cc.Texture2D = cc.loader.getRes(url);
        if (res) {
            partSys.texture = res;
        }
        else {
            cf.UILoader.LoadRes(url, (err: Error, asset: any) => {
                if (err) {
                    cf.Error(err);
                    return;
                }
                this.node.getComponent(cc.ParticleSystem).texture = asset;
            }, this._isLock);
        }
    }

    start () {
        // init logic
    }

    private release() {
        if (typeof this._currRes === 'string') {
            cf.UILoader.Release(this._currRes);
        }else {
            cf.UILoader.Release(this._currRes.normal);
            cf.UILoader.Release(this._currRes.pressed);
            cf.UILoader.Release(this._currRes.disabled);
            cf.UILoader.Release(this._currRes.hover);
        }
    }

    onDestroy() {
        this.release();
    }

    update () {
        // console.log('call update');
    }
}
