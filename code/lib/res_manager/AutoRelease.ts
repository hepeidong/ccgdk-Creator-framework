import { Debug } from "../cck/Debugger";
import { Assert } from "../exceptions/Assert";

const {ccclass} = cc._decorator;



@ccclass
export class AutoRelease extends cc.Component {

    private _spriteFrame: cc.SpriteFrame;
    private _currLoader: ILoader;


    public source(url: string, loader: ILoader) {
        if (url.indexOf('http://') > -1 || url.indexOf('https://') > -1) {
            cc.assetManager.loadRemote<cc.Texture2D>(url, (err, texture) => {
                if (err) {
                    Debug.error('资源加载错误', err);
                    return;
                }
                if (Assert.instance.handle(Assert.Type.LoadRemoteTextureException, texture, url)) {
                    this.setSpriteFrame(new cc.SpriteFrame(texture), loader);
                }
            });
        }
        else {
            const spriteFrame = loader.get<cc.SpriteFrame>(url, cc.SpriteFrame);
            if (!spriteFrame) {
                loader.load(url, cc.SpriteFrame, (err, asset) => {
                    if (err) {
                        Debug.error('资源加载错误', err);
                        return;
                    }
                    this.setSpriteFrame(asset as cc.SpriteFrame, loader);
                });
            }
            else {
                this.setSpriteFrame(spriteFrame, loader);
            }
        }
    }

    private setSpriteFrame(asset: cc.SpriteFrame, loader: ILoader) {
        const sprite = this.node.getComponent(cc.Sprite);
        if (sprite) {
            const oldAsset = sprite.spriteFrame;
            if (this._currLoader) {
                if (!this._currLoader.delete(oldAsset)) {
                    oldAsset.decRef();
                }
            }
            
            sprite.spriteFrame = null;
            sprite.spriteFrame = asset;
            this._spriteFrame = asset;
            this._currLoader = loader;
            loader.add(asset);
        }
    }

    onDestroy() {
        if (this._currLoader) {
            this._currLoader.delete(this._spriteFrame);
        }
    }

    // update () {
    //     
    // }
}
