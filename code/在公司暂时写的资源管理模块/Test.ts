import { Controller } from "./Controller"

const {ccclass, property} = cc._decorator;

@ccclass
export class Test extends Controller {

    constructor() {
        super();
        this.url = './Test';
    }

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {

    }

    // update (dt) {}
}
