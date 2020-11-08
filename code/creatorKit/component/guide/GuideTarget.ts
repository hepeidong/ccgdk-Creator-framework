
const {ccclass, property} = cc._decorator;

enum guide_type {
    /**手指引导 */
    FINGER,
    /**对话引导 */
    DIALOGUE,
    /**文本引导 */
    TEXT
}

@ccclass('GuideTarget')
export default class GuideTarget {
    @property({
        type: cc.Node,
        tooltip: '需要引导的目标节点'
    })
    target: cc.Node = null;

    @property({
        type: cc.Enum(guide_type),
        tooltip: `引导类型：
        FINGER（手指引导）；
        DIALOGUE（对话引导）；
        TEXT（文本引导）；`
    })
    guideType: guide_type = cc.Enum(guide_type).FINGER;

    @property({
        type: cc.Integer,
        tooltip: '引导节点的ID，与配置表对应一致'
    })
    targetId: number = 0;

    constructor() {
        
    }
}