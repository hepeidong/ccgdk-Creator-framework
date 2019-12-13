import { UILoader } from "./UILoader";

const {ccclass, property} = cc._decorator;

@ccclass
export class Controller extends cc.Component {

    public static viewName: string;
    private _url: string
    private _view: cc.Node;
    private _loaded: boolean;

    constructor() {
        super();
        this._loaded = false;
    }

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    protected set url(value: string) {
        this._url = value;
    }

    public showView(parent?: cc.Node) {
        if (this._loaded) {
            let action: cc.ActionInstant = cc.show();
            this._view.runAction(action);
            this.onShow();
        }
        else {
            UILoader.loadRes(this._url, cc.Prefab, (err: Error, asset) => {
                let node = UILoader.instanitate(asset);
                this._view = node;
                this.onShow();
                this._loaded = true;
                if (parent) {
                    node.parent = parent;
                }
                else {
                    let canvas: cc.Node = cc.director.getScene().getChildByName('Canvas');
                    canvas.addChild(node);
                }
            });
        }
    }

    onShow(): void {}

    public close() {
        if (!cc.isValid(this._view)) return;
        this._view.removeFromParent(false);
        this._view.destroy();
        this._loaded = false;
    }

    public hide() {
        let action: cc.ActionInstant = cc.hide();
        this._view.runAction(action);
    }

    start () {

    }

    // update (dt) {}
}
