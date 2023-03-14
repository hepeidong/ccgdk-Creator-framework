import { GuideType, Scope } from "./GuideEnum";
import { GuideManager } from "./GuideManager";



export class guide {
    public static readonly guideManager = GuideManager.instance;
    public static readonly Scope = Scope;
    public static readonly GuideType = GuideType;
}