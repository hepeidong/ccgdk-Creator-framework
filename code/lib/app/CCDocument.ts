import { Proxy } from "../puremvc";

type StorageData = {value: any}

/**
 * author: HePeiDong
 * 
 * name: 游戏数据模型类
 * 
 * description: 这是MVC中的Model模块，用于存储数据
 */
export class CCDocument<T> extends Proxy<T> {
    constructor(proxyName: string = null, data: any = null) {
        super(proxyName, data);
        this.init();
    }

    private init() {
        const tag = this["__classname__"];
        const propKeys = this.data['propKeys'];
        if (Array.isArray(propKeys)) {
            for (const key of this.data['propKeys']) {
                this.redefine(tag, key);
            }
        }
    }

    private redefine(tag: string, key: string) {
        const itemKey = tag + "_" + key;
        const initValue = this.data[key];
        Object.defineProperty(this.data, key, {
            configurable: true,
            enumerable: true,
            set(val) {
                const data: StorageData = {value: val};
                cc.sys.localStorage.setItem(itemKey, JSON.stringify(data));
            },
            get() {
                const str = cc.sys.localStorage.getItem(itemKey);
                if (str) {
                    const data: StorageData = JSON.parse(str);
                    return data.value;
                }
                return initValue;
            }
        });
    }
}