import GuideTarget from "./GuideTarget";
import { GuideConfig } from "./GuideConfig";
import FileContainer from "../data_manager/FileContainer";

/**
 * name: 引导管理类
 * date: 2020/04/22
 * author: 何沛东
 * description: 控制和管理游戏中的引导
 */
export default class GuideManager {
    private _isGuiding: boolean;
    // private _guideIndex: number;
    private _guideInfo: GuideConfig;
    private _guideTargets: Map<number, GuideTarget>;
    private _storage_key: string;
    private _guideFile: FileContainer<GuideConfig>;
    private static _eventType: {START_GUIDE: string} = {START_GUIDE: 'start_guide'}
    constructor() {
        this._guideTargets = new Map();
        this._storage_key = 'guide_complete';
        this._isGuiding = false;
        // this._guideIndex = 0;
    }

    private static _ins: GuideManager = null;
    public static get Instance(): GuideManager {
        return this._ins = this._ins ? this._ins : new GuideManager();
    }

    public static get EventType(): {START_GUIDE: string} { return this._eventType; }
    public get isGuiding(): boolean { return this._isGuiding; }
    public get guideInfo(): GuideConfig { return this._guideInfo; }
    public get guideTarget(): GuideTarget { return this._guideTargets.get(this._guideInfo.target); }
    public get guideType(): number {
        return this.guideTarget.guideType;
    }

    public setGuideFile(file: FileContainer<GuideConfig>): void {
        this._guideFile = file;
    }

    public addGuideTarget(target: GuideTarget) {
        if (!target) return;
        if (target) {
            if (!this._guideTargets.has(target.targetId)) {
                this._guideTargets.set(target.targetId, target);
            }
        }
        else {
            kit.error(`错误：${target.target.name}节点不是引导节点`);
            debugger;
        }
    }

    /**当前引导启动 */
    public guideLaunch() {
        let guideInfo: GuideConfig = this.syncFromStorage();
        if (guideInfo) {
            if (guideInfo.syncId !== -1) {
                this._guideInfo = this._guideFile.get(guideInfo.syncId);
                this._isGuiding = true;
                cc.game.emit(GuideManager.EventType.START_GUIDE);
            }
        }
        else {
            //如果没有缓存的引导数据，就从第一个引导数据开始引导
            this._guideInfo = this._guideFile.get(1);
            this._isGuiding = true;
            this.syncToStorage();
            cc.game.emit(GuideManager.EventType.START_GUIDE);
        }
    }

    /**当前引导完成 */
    // public guideComplete() {
        
    // }

    public delGuideTarget(guideId: number): boolean {
        return this._guideTargets.delete(guideId);
    }

    public getTargetPosition(): cc.Vec3 {
        let worldPos: cc.Vec3 = this.guideTarget.target.parent.convertToWorldSpaceAR(this.guideTarget.target.position);
        let targetPos: cc.Vec3 = cc.Canvas.instance.node.convertToNodeSpaceAR(worldPos);
        return targetPos;
    }

    public setGuidePosition(guide: cc.Node, pos: cc.Vec3) {
        let mask: cc.Node = guide.getChildByName('mask');
        let worldPos: cc.Vec3 = guide.convertToWorldSpaceAR(mask.position);
        guide.position = pos;
        let maskPos: cc.Vec3 = guide.convertToNodeSpaceAR(worldPos);
        mask.position = maskPos;
    }

    /**从缓存中获取同步引导 */
    public syncFromStorage(): GuideConfig {
        return kit.UserDefault.get(this._storage_key);
    }

    /**将同步引导存储到缓存中 */
    public syncToStorage() {
        kit.UserDefault.set(this._storage_key, this._guideInfo);
    }
}
