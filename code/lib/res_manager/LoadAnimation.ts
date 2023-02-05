import { SAFE_CALLBACK } from "../Define";
import { Assert } from "../exceptions/Assert";
import { Res } from "./Res";

export class AnimatLoad {
    private _bundle: string;
    constructor(bundle: string) {
        this._bundle = bundle;
    }

    public loadAnimat(path: string, complete: (err: Error, asset: cc.Asset) => void) {}

    protected load(path: string, type: typeof cc.Asset, complete: (err: Error, asset: cc.Asset) => void) {
        this.createLoader().then(loader => {
            loader.load(path, type, complete);
        }).catch(err => {
            Assert.instance.handle(Assert.Type.LoadAssetBundleException, err, this._bundle);
        });
    }

    private createLoader() {
        return new Promise<ILoader>((resolve, reject) => {
            if (this._bundle === cc.resources.name) {
                resolve(Res.loader);
            }
            else {
                Res.createLoader(this._bundle).then(loader => {
                    resolve(loader);
                }).catch(err => {
                    reject(err);
                });
            }
        });
    }
}

export class ClipLoad extends AnimatLoad {

    loadAnimat(path: string, complete: (err: Error, asset: cc.Asset) => void) {
        this.load(path, cc.AnimationClip, complete);
    }
}

export class SpineLoad extends AnimatLoad {

    loadAnimat(path: string, complete: (err: Error, asset: cc.Asset) => void) {
        this.load(path, sp.SkeletonData, complete);
    }
}

export class DBLoad extends AnimatLoad {

    loadAnimat(path: string, complete: (err: Error, asset: cc.Asset) => void) {
        this.load(path, dragonBones.DragonBonesAsset, (err, asset1: dragonBones.DragonBonesAsset) => {
            if (err) {
                SAFE_CALLBACK(complete, err);
                return ;
            }
            let urlSplit: string[] = path.split('_');
            urlSplit.splice(urlSplit.length - 1, 1);
            let newUrl: string = '';
            for (let e of urlSplit) {
                newUrl += e + '_';
            }
            newUrl += 'tex';
            this.load(newUrl, dragonBones.DragonBonesAtlasAsset, (asset2) => {
                SAFE_CALLBACK(complete, [asset1, asset2]);
            });
        });
    }
}