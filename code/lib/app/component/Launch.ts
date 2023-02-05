import { Debug } from "../../Debugger";
import { App } from "../cck_app";

const {ccclass, menu, property, executionOrder} = cc._decorator;

@ccclass
@executionOrder(-2)
@menu('游戏通用组件/Launch(游戏初始页面组件)')
export default class Launch extends cc.Component {

    @property({
        type: cc.Prefab,
        tooltip: "一般是底部窗口暗透明的背景遮罩",
        displayName: "窗口底部遮罩"
    })
    private mask: cc.Prefab = null;

    @property({
        type: cc.Prefab,
        tooltip: "窗口加载时的加载等待界面",
        displayName: "窗口加载界面"
    })
    private wait: cc.Prefab = null;

    @property({
        type: cc.Prefab,
        tooltip: "挂载有触摸点击特效的预制体",
        displayName: "触摸点击特效"
    })
    private effect: cc.Prefab = null;


    onLoad () {
        Debug.log("游戏启动完成");
        App.game.init(this.mask, this.wait, this.effect);
    }

    onDestroy() {
        
    }

    start () {
    }

    update (dt) {
        
    }
}
