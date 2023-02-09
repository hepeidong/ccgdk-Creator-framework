import { Debug } from "../../cck/Debugger";
import { SAFE_CALLBACK } from "../../Define";
import { Res } from "../../cck";
import { Utils } from "..";
import { FileContainer } from "./FileContainer";


/**
 * 配置表管理父类
 */
export class DFReader {
    private _file: cck_file_data;
    constructor() {
        this._file = {};
    }

    private static _ins: DFReader = null;
    public static get instance(): DFReader {
        return this._ins = this._ins ? this._ins : new DFReader();
    }

    public get file() { return this._file; }

    public get<T>(filename: string): FileContainer<T> {
        return this._file[filename];
    }

    public getById(filename: string, id: number): any {
        return this._file[filename].get(id);
    }

    /**
     * 加载配置表数据
     * @param path 配置表本地路径
     * @param nameOrUrl 资源包名或者路径
     * @param onComplete 加载成功回调
     */
    public loadJSONTable(path: string, nameOrUrl: string, onComplete?: Function): void;
    public loadJSONTable(path: string, onComplete?: Function): void;
    public loadJSONTable() {
        if (typeof arguments[1] === 'string') {
            const path = arguments[0];
            const nameOrUrl = arguments[1];
            const onComplete = arguments[2];
            Res.createLoader(nameOrUrl).then(loader => {
                loader.load(path, cc.JsonAsset, (err, asset: cc.JsonAsset) => {
                    if (err) {
                        Debug.error("配置表加载失败", err);
                        return;
                    }
                    let jsonData = asset.json;
                    this.initFileData(jsonData);
                    SAFE_CALLBACK(onComplete);
                });
            }).catch(e => {
                Debug.error("加载配置表失败", e);
            });
        }
        else {
            const path = arguments[0];
            const onComplete = arguments[1];
            Res.loader.load(path, cc.JsonAsset, (err, asset: cc.JsonAsset) => {
                if (err) {
                    Debug.error('配置表加载失败', err);
                    return;
                }
                let jsonData = asset.json;
                this.initFileData(jsonData);
                SAFE_CALLBACK(onComplete);
            });
        }
    }

    private initFileData(data: any) {
        for (let key in data) {
            this.parserJSONData(data[key], key);
        }
    }

    private readAsObject(filename: string, fileContainer: FileContainer<any>): void {
        this._file[filename] = fileContainer;
        Object.defineProperty(this, filename, {
            get() {
                return fileContainer;
            }
        })
    }

    private parserJSONData(data: any, filename: string) {
        let fileContainer = new FileContainer();
        Debug.assert(!Utils.isArray(data) && !Utils.isObject(data), '配置表数据类型错误,不是Array,也不是Object!');
        for (let key in data) {
            fileContainer.add(key, data[key]);
        }
        this.readAsObject(filename, fileContainer);
    }
}