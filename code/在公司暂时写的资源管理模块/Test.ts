import { Controller } from "./Controller"

const {ccclass, property} = cc._decorator;

@ccclass
export class Test extends Controller {

    constructor() {
        super();
        this.url = './Test';
        Test.viewName = 'Test';
    }

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    onShow() {
        console.log('call onShow');
    }

    public show(parent: cc.Node|null) {
        this.showView(parent);
    }

    start () {

    }

    // update (dt) {}
}
