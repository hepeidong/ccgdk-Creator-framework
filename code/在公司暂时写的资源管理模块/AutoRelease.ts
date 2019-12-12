import { UILoader } from "./UILoader";

const {ccclass, property} = cc._decorator;

type ButtonResT = {normal: string, pressed: string, hover: string, disabled: string};
type ComponentT = cc.Sprite|cc.Button|cc.Mask|cc.PageViewIndicator|cc.EditBox|cc.Label|cc.RichText|cc.ParticleSystem;

@ccclass
export class AutoRelease extends cc.Component {

    /** 结点引用的资源*/
    private _currRes: string[] = [];
    /**是否锁定资源 */
    private _isLock: boolean;

    onLoad() {

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

    public SetCurrRes(url:string|ButtonResT) {
        if (typeof url === 'string') {
            let url_: string = UILoader.getResUrl(url);
            if (!this.Contain(url_)) {
                this._currRes.push(url_);
                UILoader.retain(url_);
            }
        }
        else {
            for (let key in url) {
                let url_: string = UILoader.getResUrl(url[key]);
                if (!this.Contain(url_)) {
                    this._currRes.push(url_);
                    UILoader.retain(url_);
                }
            }
        }
    }

    private Contain(url: string|ButtonResT): boolean {
        for (let i: number = 0; i < this._currRes.length; ++i) {
            if (url === this._currRes[i]) return true;
        }
        return false;
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
        if (!this.node.getComponent(cc.RichText)) {
            throw console.error('节点没有这个组件');
        }
        //cc.loader.getRes(url)取得的资源的类型是cc.Texture2D 不是cc.SpriteAtlas
        //所以不在这里进行是否加载了此资源判断
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
        let res: cc.Texture2D = cc.loader.getRes(url);
        if (res) {
            this.SetCurrRes(url);
            partSys.file = res.url;
        }
        else {
            UILoader.loadRes(url, (err: Error, asset: any) => {
                this.SetCurrRes(url);
                this.node.getComponent(cc.ParticleSystem).texture = asset;
            }, this._isLock);
        }
    }

    start () {
        // init logic
    }

    private release() {
        for (let i: number = 0; i < this._currRes.length; ++i) {
            UILoader.release(this._currRes[i]);
        }
    }

    onDestroy() {
        this.release();
    }

    update () {
        // console.log('call update');
    }
}
