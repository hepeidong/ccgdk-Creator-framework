import { Debug } from "../Debugger";
import { SAFE_CALLBACK } from "../Define";
import { ILoader } from "../lib.cck";
import { Asset, Node, Prefab, resources, Sprite, SpriteAtlas, SpriteFrame } from "cc";
import { app } from "../app";
import { Res } from "./Res";

const RESOURCES = resources.name;

/**
 * 游戏资源工厂，用于管理每个模块加载的资源，例如每个UI界面，场景的资源
 * 这些资源将会被资源管理模块管理起来，这个类不应该自己在外部调用
 */
export abstract class AssetFactory {
    protected _urls: string[];
    
    protected _loader: ILoader;
    protected _finish: number;
    protected _total: number;
    protected _onProgress: (progress: number) => void;

    private _loadedRes: boolean;           //资源是否加载了
    private _loadedView: boolean;          //预制体是否加载了
    private _bundle: string;
    private _assetPath: string;
    private _prefabAsset: Prefab;
    private _assets: Map<string, Asset[]>;
    
    constructor(bundle: string) {
        this._bundle = bundle;
        this._finish = 0;
        //最大进度的初始值之所以要为2，是因为所有页面加载，都必须有加载资源包和预制体这两步，
        //其次才是是否有其他资源要加载，即 this._urls 是否不为空
        this._total = 2;  
        this._assets = new Map();
    }

    public static create(bundle: string): AssetFactory {
        if (typeof bundle !== 'string') {
            bundle = RESOURCES;
        }
        if (app.game.platform === app.Platform.PREVIEW) {
            return new Preview(bundle);
        }
        else {
            return new Build(bundle);
        }
    }

    public get loadedRes() { return this._loadedRes; }
    public get loadedView() { return this._loadedView; }

    protected abstract loadAsset(): Promise<void>;

    /**已经完成了视图的加载，包括依赖资源和视图预制体资源 */
    public isComplete() {
        return this._loadedRes && this._loadedView;
    }

    /**
     * 设置视图预制体资源的路径
     * @param path 路径
     */
    public setViewUrl(path: string) {
        this._assetPath = path;
    }

    /**
     * 设置依赖资源路径
     * @param urls 
     */
    public setAssetUrls(urls: string[]) {
        this._urls = this.getUrls(urls);
    }

    public reset() {
        this._loadedRes = false;
        this._loadedView = false;
        this._finish = 0;
        this._total = 2;
    }

    /**
     * 设置精灵节点的图片纹理
     * @param target 具体要设置的精灵节点
     * @param filename 纹理的文件名
     */
    public setSpriteFrame(target: Node|Sprite, filename: string) {
        if (target instanceof Node) {
            let sprite: Sprite = target.getComponent(Sprite);
            if (sprite) {
                sprite.spriteFrame = this.getGameAsset(filename, SpriteFrame);
            }
        }
        else if (target instanceof Sprite) {
            target.spriteFrame = this.getGameAsset(filename, SpriteFrame);
        }
    }
    
    /**
     * 根据资源名和类型获取资源
     * @param filename 
     * @param type 
     * @returns 
     */
    public getGameAsset<T extends Asset>(filename: string, type: {new (): T}): T { 
        if (this._assets.has(filename)) {
            const list = this._assets.get(filename);
            for (const asset of list) {
                if (asset instanceof type) {
                    if (asset instanceof SpriteAtlas) {
                        const spriteFrame = asset.getSpriteFrame(filename) as unknown;
                        if (spriteFrame) {
                            return spriteFrame as T;
                        }
                    }
                    return asset;
                }
            }
        }
        return null; 
    }

    /**
     * 尝试销毁具体的资源，会减少引用计数，不是直接强制销毁
     * @param asset 
     */
    public delete(asset: Asset) {
        this._loader.delete(asset);
    }

    /**尝试销毁所有依赖的资源，包括视图预制体资源，同样也是减少引用计数，不强制销毁 */
    public clear() {
        this._loader.delete(this._prefabAsset);
        this._assets.forEach((list) => {
            for (const asset of list) {
                this._loader.delete(asset);
            }
        });
        this._prefabAsset = null;
        this._assets.clear();
    }

    /**
     * 加载视图，如果有依赖资源，会和依赖资源一起加载
     * @param onProgress 
     * @returns 
     */
    public loadView(onProgress?: (progress: number) => void) {
        this._onProgress = onProgress;
        this._total += this._urls.length;

        return new Promise<Prefab>((resolve) => {
            this.createLoader().then(loader => {
                this._finish++;
                SAFE_CALLBACK(this._onProgress, this._finish / this._total);
                this._loader = loader;

                //加载该视图的预制体资源
                if (!this._loadedView) {
                    this.loadPrefab().then(asset => {
                        this._prefabAsset = asset;
                        this._loadedView = true;
                        this.loadViewComplete(resolve);
                    }).catch(err => {
                        Debug.error('加载页面错误', err);
                    });
                }
                else {
                    this.loadViewComplete(resolve);
                }
    
                //加载视图引用依赖的资源
                if (!this._loadedRes && this._urls.length > 0) {
                    this.loadAsset().then(() => {
                        this._loadedRes = true;
                        this.loadViewComplete(resolve);
                    }).catch(err => {
                        Debug.error('资源加载错误', err);
                    });
                }
                else {
                    this._loadedRes = true;
                    this.loadViewComplete(resolve);
                }
            }).catch(err => {
                Debug.error('加载资源包错误', err);
            });
        });
    }

    private loadViewComplete(resolve: Function) {
        if (this._loadedView && this._loadedRes) {
            this._finish = this._total;
            SAFE_CALLBACK(this._onProgress, this._finish / this._total);
            resolve(this._prefabAsset);
        }
    }

    private createLoader() {
        return new Promise<ILoader>((resolve, reject) => {
            if (this._bundle === RESOURCES) {
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

    private loadPrefab() {
        return new Promise<Prefab>((resolve, reject) => {
            const prefab = this._loader.get<Prefab>(this._assetPath, Prefab);
            if (prefab) {
                this._finish++;
                SAFE_CALLBACK(this._onProgress, this._finish / this._total);
                resolve(prefab);
            }
            else {
                const currentFinish = this._finish;
                this._loader.load<Prefab>(this._assetPath, Prefab, (finish, total) => {
                    this._finish = currentFinish + (total > 0 ? finish / total : 0);
                    this._onProgress?.(this._finish / this._total);
                }, (err, asset) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(asset);
                });
            }
        });
        
    }

    protected getUrls(urls: string[]): string[] { 
        this._urls = urls;
        return urls; 
    }

    protected addAssets(assets: Asset | Asset[]) {
        if (assets instanceof Array) {
            for (const asset of assets) {
                this.pushToAssets(asset);
            }
        }
        else {
            this.pushToAssets(assets);
        }
    }

    private pushToAssets(asset: Asset) {
        if (!this._assets.has(asset.name)) {
            this._assets.set(asset.name, [asset]);
        }
        else {
            const list = this._assets.get(asset.name);
            list.push(asset);
            this._assets.set(asset.name, list);
        }
    }
}

/**预览平台下的游戏资源 */
class Preview extends AssetFactory {

    public loadAsset() {
        const promiseArr: Promise<void>[] = [];
        for (let url of this._urls) {
            const p = this.loadAssetSync(url).then(assets => {
                this._finish++;
                SAFE_CALLBACK(this._onProgress, this._finish / this._total);
                this.addAssets(assets);
            });
            promiseArr.push(p);
        }
        return Promise.call(promiseArr) as Promise<void>;
    }

    protected getUrls(urls: string[]) {
        this._urls = [];
        for (let i: number = 0; i < urls.length; ++i) {
            let temp: string[] = urls[i].split('/');
            temp.pop();
            const url = temp.join('/');
            if (this._urls.indexOf(url) === -1) {
                this._urls.push(url);
            }
        }

        return this._urls;
    }

    private loadAssetSync(path: string) {
        return new Promise<Asset[]>((resolve, reject) => {
            this._loader.loadDir(path, (err, asset) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(asset);
            });
        });
    }
}

/**构建后各个平台的游戏资源 */
class Build extends AssetFactory {

    public loadAsset() {
        const currFinish = this._finish;
        const len = this._urls.length;
        return new Promise<void>((resolve, reject) => {
            this._loader.load(this._urls, (finish: number, total: number) => {
                this._finish = currFinish + (total > 0 ? len * finish / total : 0);
                SAFE_CALLBACK(this._onProgress, this._finish / this._total);
            }, (err, assets) => {
                if (err) {
                    reject(err);
                    return;
                } 
                this.addAssets(assets);
                resolve();
            });
        });
        
    }
}