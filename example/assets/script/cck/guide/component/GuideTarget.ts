import { Button, Node } from "cc";
import { IContainer, IGuideConfig, IGuideTarget } from "../../lib.cck";
import { GuideType } from "../GuideEnum";
import { GuideManager } from "../GuideManager";
import { WidgetID } from "../WidgetID";

export class GuideTarget implements IGuideTarget {
    public target: Node = null;
    public targetId: string;
    public guideIds: number[];

    constructor() {
        this.guideIds = [];
    }

    public init() {
        this.target.attr({guideTouchRegist: false});
        this.targetId = this.target.getComponent(WidgetID).ID;
        let keys: number[] = GuideManager.instance.guideFile.keys as number[];
        let guideFile: IContainer<IGuideConfig> = GuideManager.instance.guideFile;
        let isFingerGuide: boolean = false;
        for (let k of keys) {
            let index: number = 0;
            while(index < guideFile.length) {
                if (guideFile.get(k).targetId[index++] === this.targetId) {
                    isFingerGuide = guideFile.get(k).guideType === GuideType.FINGER;
                    break;
                }
            }
            if (isFingerGuide) {
                break;
            }
        }
        if (isFingerGuide) {
            let btn: Button = this.target.getComponent(Button);
            if (!btn) {
                this.target.addComponent(Button);
            }
        }
    }
}