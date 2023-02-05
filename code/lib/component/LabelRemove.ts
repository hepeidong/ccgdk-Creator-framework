

const {ccclass, executeInEditMode} = cc._decorator;

@ccclass
@executeInEditMode
export default class LabelRemove extends cc.Component {

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {

    }

    update (dt) {
        if (!this.node.parent.getComponent('BitmapLabel') && this.node.childrenCount > 0) {
            this.node.removeAllChildren();
            this.node.destroy();
        }
    }
}
