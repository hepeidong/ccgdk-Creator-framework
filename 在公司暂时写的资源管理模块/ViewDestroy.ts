import { ViewPool } from "./ViewPool";


const {ccclass, property} = cc._decorator;

@ccclass
export default class ViewDestroy extends cc.Component {

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {

    }

    onDestroy() {
        ViewPool.Instance.gcView();
    }

    // update (dt) {}
}
