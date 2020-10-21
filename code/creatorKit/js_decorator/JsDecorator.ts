function loadView() {
    if (!this._loadedRes) {
        kit.Loader.LoadResArray(this.urls, cc.SpriteAtlas, (err: Error, asset: Array<any>) => {
            if (err) {
                throw err;
            }
            this._assetArray = asset;
            this._loadedRes = true;
            for (let url of this.urls) {
                let key: string = kit.Loader.MakeKey(url, cc.SpriteAtlas);
                let res: kit.Resource = kit.PoolManager.Instance.GetCurrentPool().GetObject(key) as kit.Resource;
                SAFE_RETAIN(res);
            }
            
            if (!this._loadedView) {
                kit.Loader.LoadRes(this.prefabUrl, cc.Prefab, (err: Error, asset: any) => {
                    if (err) {
                        throw err;
                    }
                    let newNode: cc.Node = kit.Loader.Instanitate(this.prefabUrl, asset);
                    this._node = newNode;
                    this.InitProperty && this.InitProperty();
                    this.Loaded();
                });
            }
        });
    }
    else {
        this.Loaded();
    }
}

/**控制器类的装饰器 */
export function CtrlClass(prefabUrl: string): Function;
export function CtrlClass(target?: Function): void;
export function CtrlClass(param?: any) {
    if (typeof param === 'function') {
        param.prototype.LoadView = function() {
            loadView.bind(this)();
        }
    }
    else if (typeof param === 'string') {
        return function (target: Function) {
            target.prototype.prefabUrl = param;
            target.prototype.LoadView = function() {
                loadView.bind(this)();
            }
        } 
    }
}

/**控制器依赖的资源路劲集 */
export function Denpends(urls: string[]) {
    return function (target: Function) {
        target.prototype.urls = urls;
    }
}

/**控制器属性装饰器 */
export function CtrlProperty(options: typeof cc.Node|typeof cc.Component|{type: typeof cc.Node|typeof cc.Component, path?: string}): Function;
export function CtrlProperty(options: any) {
    return function (target: any, key: string) {
        delete target[key];
        Object.defineProperty(target, key, {
            writable: true,
            enumerable: true,
            configurable: true
        });
        target.InitProperty = function () {
            if (options !== cc.Node && options !== cc.Component) {
                let newNode: cc.Node = cc.find(options.path, this.node);
                if (options.type === cc.Node) {
                    target[key] = newNode;
                }
                else {
                    target[key] = newNode.getComponent(options.type);
                }
            }
            else {
                if (options) {
                    let compt = this.node.getComponent('WindowHelper');
                    if (compt) {
                        for (let ele of compt.ctrlNodes) {
                            if (ele.pryName === key) {
                                if (options === cc.Node) {
                                    target[key] = ele.node;
                                }
                                else {
                                    target[key] = ele.node.getComponent(options);
                                }
                            }
                        }
                    }
                    else {
                        throw new Error('预制体没有绑定WindowHelper组件');
                    }
                }
                else {
                    throw new Error(`${key} 属性的 type 不能为空`);
                }
            }
        }
    }
}