
const {ccclass, property, menu} = cc._decorator;

@ccclass
@menu('游戏通用组件/UI/WidgetID(窗口中的UI节点ID)')
export default class WidgetID extends cc.Component {

    @property
    ID: string = '';

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {

    }

    // update (dt) {}
}
