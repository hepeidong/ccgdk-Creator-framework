import { Guide } from "./cck_guide";

export function createSprite(name: string) {
    let newNode: cc.Node = new cc.Node(name);
    newNode.addComponent(cc.Sprite);
    return newNode;
}

export function createText(name: string) {
    let lbNode: cc.Node = new cc.Node(name);
    lbNode.width = 100;
    lbNode.height = 40;
    let label =  lbNode.addComponent(cc.Label);
    label.cacheMode = cc.Label.CacheMode.NONE;
    label.overflow = cc.Label.Overflow.SHRINK;
    lbNode.color = cc.Color.BLACK;
    return lbNode;
}

export function createTip(name: string) {
    let tip: cc.Node = new cc.Node(name);
    tip.addComponent(cc.Label).string = '点击任意继续';
    tip.getComponent(cc.Label).cacheMode = cc.Label.CacheMode.BITMAP;
    tip.opacity = 150;
    return tip;
}

/**恢复目标父节点 */
export function restoreParent(target: cc.Node, zIndex: number, parent: cc.Node) {
    Guide.guideManager.removeToParent(target, parent);
    target.zIndex = zIndex;
}

/**获取下一步引导 */
export function getNextGuideId() {
    let guideId: number;
    if (!Guide.guideManager.isGuideLaunched) {
        let firstGuide: number = Guide.guideManager.guideFile.get(Guide.guideManager.guideFile.keys[0]).key;
        guideId = Guide.guideManager.guideFile.get(Guide.guideManager.guideId) ? Guide.guideManager.guideFile.get(Guide.guideManager.guideId).againId : firstGuide;
        guideId = guideId === 0 ? Guide.guideManager.guideId + 1 : guideId;
    }
    else {
        let guide = Guide.guideManager.guideFile.get(Guide.guideManager.guideId);
        if (!guide) {
            guide = Guide.guideManager.guideFile.get(Guide.guideManager.guideFile.keys[0]);
        }
        guideId = guide.syncId;
        guideId = guideId === 0 ? Guide.guideManager.guideId + 1 : guideId;
    }
    return guideId;
}

export function addGuideElement(uiId: string, target: cc.Node, scope: number) {
    let guideId: number;
        guideId = getNextGuideId();
        if (guideId > 0) {
            let guideInfo: IGuideConfig = Guide.guideManager.guideFile.get(guideId);
            if (guideInfo && guideInfo.uiId === uiId) {
                Guide.guideManager.addGuideView(uiId, target, scope);
            }
        }
}