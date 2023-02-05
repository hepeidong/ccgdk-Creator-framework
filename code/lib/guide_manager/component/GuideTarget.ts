import { Guide } from "../cck_guide";
import WidgetID from "../WidgetID";

export class GuideTarget implements IGuideTarget {
    public target: cc.Node = null;
    public targetId: string;
    public guideIds: number[];

    constructor() {
        this.guideIds = [];
    }

    public init() {
        this.target.attr({guideTouchRegist: false});
        this.targetId = this.target.getComponent(WidgetID).ID;
        let keys: number[] = Guide.guideManager.guideFile.keys as number[];
        let guideFile: IContainer<IGuideConfig> = Guide.guideManager.guideFile;
        let isFingerGuide: boolean = false;
        for (let k of keys) {
            let index: number = 0;
            while(index < guideFile.length) {
                if (guideFile.get(k).targetId[index++] === this.targetId) {
                    isFingerGuide = guideFile.get(k).guideType === Guide.GuideType.FINGER;
                    break;
                }
            }
            if (isFingerGuide) {
                break;
            }
        }
        if (isFingerGuide) {
            let btn: cc.Button = this.target.getComponent(cc.Button);
            if (!btn) {
                this.target.addComponent(cc.Button);
            }
        }
    }
}