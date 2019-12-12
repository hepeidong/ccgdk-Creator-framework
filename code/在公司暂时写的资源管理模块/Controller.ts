import { UILoader } from "./UILoader";

const {ccclass, property} = cc._decorator;

@ccclass
export class Controller extends cc.Component {

    private _url: string
    private _view: cc.Node;

    constructor() {
        super();
    }

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    protected set url(value: string) {
        this._url = value;
    }

    public showView(parent?: cc.Node) {
        UILoader.loadRes(this._url, cc.Prefab, (err: Error, asset) => {
            let node = UILoader.instanitate(asset);
            this._view = node;
            if (parent) {
                node.parent = parent;
            }
            else {
                let canvas: cc.Node = cc.director.getScene().getChildByName('Canvas');
                canvas.addChild(node);
            }
        });
    }

    public close() {
        if (!cc.isValid(this._view)) return;
        this._view.removeFromParent(false);
        this._view.destroy();
    }

    start () {

    }

    // update (dt) {}
}
