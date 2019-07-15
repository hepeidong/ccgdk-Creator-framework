
import {G} from "./G";
import { Resource } from "./Resource";
import { EventListeners } from "./EventListeners";
export class Loader extends EventListeners {
    private static _cacheAssets: Object = {};
    constructor() {
        super();
        this.On(G.EventName.DESTROYED_AFTER, this, this.onUpdateCacheAssets);
    }
    public static load(obj: any, callback: Function, isLock: boolean = false) {
        cc.loader.load(obj, (err, asset) => {
            if (!err) {
                let url: string = asset.url;
                if (!this._cacheAssets[url]) {
                    let res: Resource = new Resource();
                    res.Key = url;
                    res.IsLock = isLock;
                    res.AutoRelease();
                    this._cacheAssets[url] = 1;
                }
            }
            callback && callback(err, asset);
        });
    }

    public static loadRes(obj: any, callback: Function, isLock: boolean = false) {
        cc.loader.loadRes(obj, (err, asset) => {
            if (!err) {
                let url: string = asset.url;
                if (!this._cacheAssets[url]) {
                    let res: Resource = new Resource();
                    res.Key = url;
                    res.IsLock = isLock;
                    res.AutoRelease();
                    this._cacheAssets[url] = 1;
                }
            }
            callback && callback(err, asset);
        }) ;
    }

    public static loadResDir(obj: any, callback: Function, isLock: boolean = false) {
        cc.loader.loadResDir(obj, (err, asset) => {
            if (!err) {
                let url: string = asset.url;
                if (!this._cacheAssets[url]) {
                    let res: Resource = new Resource();
                    res.Key = url;
                    res.IsLock = isLock;
                    res.AutoRelease();
                    this._cacheAssets[url] = 1;
                }
            }
            callback && callback(err, asset);
        }); 
    }

    private onUpdateCacheAssets(url: string) {
        if (Loader._cacheAssets[url]) delete Loader._cacheAssets[url];
    }

}
G.Loader = Loader;