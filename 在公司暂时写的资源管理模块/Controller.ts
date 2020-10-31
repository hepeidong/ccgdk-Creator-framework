import { UILoader } from "./UILoader";

const arrayMethods = ['push', 'pop', 'shift', 'unshift', 'sort', 'reverse', 'splice'];
const types = {
    obj: '[object Object]',
    array: '[object Array]'
}

export default class Controller extends cc.Component {

    public _viewName: string;
    public Event: EventName; 
    private _url: string
    private _view: cc.Node;
    private _loaded: boolean;
    private _parent: cc.Node;
    private _isValid: boolean;
    private _isHide: boolean;
    private _loading: boolean;

    constructor() {
        super();
        this._loaded = false;
        this._isValid = false;
        this._isHide = false;
        this._loading = false;
    }

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    public static create<T extends Controller>(cls: {prototype: T}): T {
        return SAFE_CREATE(cls);
    }

    protected set url(value: string) {
        this._url = value;
    }
    protected set isHide(value: boolean) {
        this._isHide = value;
    }
    protected get isHide(): boolean { return this._isHide; }

    public get view(): cc.Node { return this._view; }

    public set viewName(value: string) {
        this._viewName = value;
    }

    public get viewName(): string { return this._viewName; }

    public showView(parent: cc.Node|null) {
        this._parent = parent;
        if (this._loaded) {
            // let action: cc.ActionInstant = cc.show();
            // this._view.runAction(action);
            if (this.viewIsValid()) {
                this._view.active = true;
                this.loadedView();
            }
            else {
                this.loadView(this._parent);
            }
        }
        else if (!this._loading) {
            this.loadView(this._parent);
        }
    }

    onShow(): void {}
    onClose(): void {}

    public close() {
        if (!cc.isValid(this._view, true)) {
            cck.warn('重复多次关闭视图');
            return;
        }
        cc.vv.viewPool.removeView(this.viewName);
        this._view.removeComponent(this.viewName);
        this._view.removeFromParent(false);
        this._view.destroy();
        this._view = null;
        this._loaded = false;
        this._loading = false;
        this._isValid = false;
        this._isHide = false;
        this.onClose();
    }

    public hide() {
        this._isHide = true;
        if (!this._loaded) return;
        // let action: cc.ActionInstant = cc.hide();
        // this._view.runAction(action);
        this._view.active = false;
        this._isHide = false;
    }

    protected bindingData(obj: any, callback: (oldObj: any, value: any, objKey: string[]) => void, objKey?: string[]) {
        let that = this;
        let oldObj = obj;
        if (Object.prototype.toString.call(obj) === types.obj || Object.prototype.toString.call(obj) === types.array) {
            if (Object.prototype.toString.call(obj) === types.array) {
                this.oversideArrayPro(obj, callback);
            }
            Object.keys(obj).forEach((key) => {
                let oldValue: any = obj[key];
                let keyArray: string[] = objKey && objKey.slice();
                if (keyArray) {
                    keyArray.push(key);
                }
                else {
                    keyArray = [key];
                }
                Object.defineProperty(obj, key, {
                    get() {
                        return oldValue;
                    },
                    set(newValue: any) {
                        if (oldValue !== newValue) {
                            if (Object.prototype.toString.call(newValue) === '[object Object]') {
                                that.bindingData(newValue, callback);
                            }
                            oldValue = newValue;
                            callback(oldObj, newValue, keyArray);
                        }
                    }
                })
                if (Object.prototype.toString.call(obj[key]) === types.obj || Object.prototype.toString.call(obj[key]) === types.array) {
                    this.bindingData(obj[key], callback);
                }
            }, this)
        }
        else {
            throw new Error('请传入对象或数组！');
        }
    }

    private oversideArrayPro(array: Array<any>, callback: (oldObj: any, value: any, objKey: string[]) => void) {
        let originPro = Array.prototype;
        let oversidePro = Object.create(Array.prototype);
        let result: any;
        let that = this;
        arrayMethods.forEach((method: string) => {
            Object.defineProperty(oversidePro, method, {
                value() {
                    let oldValue = array.slice();
                    result = originPro[method].apply(this, arguments);
                    that.bindingData(this, callback);
                    return result;
                }
            })
        })
        array['__proto__'] = oversidePro;
    }

    /**视图是否有效 */
    protected viewIsValid(): boolean {
        if (this._isValid) {
            if (!this.view || this.view.name === '' || this.view.name === null) {
                this._isValid = false;
            }
        }
        return this._isValid;
    }

    private loadView(parent: cc.Node) {
        // if (!this._loading) cc.vv.anysdkMgr.showToast('加载页面', 'loading', 10);
        this._loading = true;
        UILoader.loadRes(this._url, cc.Prefab, (err: Error, asset) => {
            this._view = UILoader.instanitate(asset, true);
            this._loaded = true;
            this._loading = false;
            this._isValid = true;
            // cc.vv.anysdkMgr.hideToast();
            if (parent) {
                this._view.parent = parent;
            }
            else {
                cc.Canvas.instance.node.addChild(this._view);
            }
            this.loadedView();
        });
    }

    private loadedView() {
        if (this.isHide) {
            this.hide();
        }
        else {
            cc.LogManager.init(this.viewName);
            this.onShow();
            this.view.addComponent(this.viewName);
        }
    }

    start () {

    }

    // update (dt) {}
}
