import { Color, Label, Node, Sprite, UIOpacity, UITransform } from "cc";
import { IGuideConfig } from "../lib.cck";
import { GuideManager } from "./GuideManager";
import { setPriority } from "../util";

export function createSprite(name: string) {
    let newNode: Node = new Node(name);
    newNode.addComponent(Sprite);
    return newNode;
}

export function createText(name: string) {
    let lbNode: Node = new Node(name);
    const ui = lbNode.getComponent(UITransform);
    ui.width = 100;
    ui.height = 40;
    let label =  lbNode.addComponent(Label);
    label.cacheMode = Label.CacheMode.NONE;
    label.overflow = Label.Overflow.SHRINK;
    label.color = Color.BLACK;
    return lbNode;
}

export function createTip(name: string) {
    let tip: Node = new Node(name);
    tip.addComponent(Label).string = '点击任意继续';
    tip.getComponent(Label).cacheMode = Label.CacheMode.BITMAP;
    let uiOpacity = tip.getComponent(UIOpacity);
    if (!uiOpacity) {
        uiOpacity = tip.addComponent(UIOpacity);
    }
    uiOpacity.opacity = 150;
    return tip;
}

/**恢复目标父节点 */
export function restoreParent(target: Node, zIndex: number, parent: Node) {
    GuideManager.instance.removeToParent(target, parent);
    setPriority(target, zIndex);
}

/**获取下一步引导 */
export function getNextGuideId() {
    let guideId: number;
    if (!GuideManager.instance.isGuideLaunched) {
        let firstGuide: number = GuideManager.instance.guideFile.get(GuideManager.instance.guideFile.keys[0]).key;
        guideId = GuideManager.instance.guideFile.get(GuideManager.instance.guideId) ? GuideManager.instance.guideFile.get(GuideManager.instance.guideId).againId : firstGuide;
        guideId = guideId === 0 ? GuideManager.instance.guideId + 1 : guideId;
    }
    else {
        let guide = GuideManager.instance.guideFile.get(GuideManager.instance.guideId);
        if (!guide) {
            guide = GuideManager.instance.guideFile.get(GuideManager.instance.guideFile.keys[0]);
        }
        guideId = guide.syncId;
        guideId = guideId === 0 ? GuideManager.instance.guideId + 1 : guideId;
    }
    return guideId;
}

export function addGuideElement(uiId: string, target: Node, scope: number) {
    let guideId: number;
        guideId = getNextGuideId();
        if (guideId > 0) {
            let guideInfo: IGuideConfig = GuideManager.instance.guideFile.get(guideId);
            if (guideInfo && guideInfo.uiId === uiId) {
                GuideManager.instance.addGuideView(uiId, target, scope);
            }
        }
}