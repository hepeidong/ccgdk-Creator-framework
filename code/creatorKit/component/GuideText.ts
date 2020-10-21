
const {
    ccclass, 
    property, 
    executeInEditMode, 
    menu, 
    disallowMultiple
} = cc._decorator;

@ccclass
@executeInEditMode
@disallowMultiple
@menu('游戏通用组件/引导/引导类型/GuideText(文本引导)')
export default class GuideText extends cc.Component {

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {

    }

    // update (dt) {}
}
