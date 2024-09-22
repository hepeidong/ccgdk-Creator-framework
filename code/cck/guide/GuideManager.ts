import { Debug } from "../Debugger";
import { UIManager } from "../ui/UIManager";
import { utils } from "../utils";
import { GuideTarget } from "./component/GuideTarget";
import { EventType, GuideNormalEvent, Scope } from "./GuideEnum";
import { GuideSearch } from "./GuideSearch";
import { Component, director, Node, sys, UITransform, Vec3 } from "cc";
import { IContainer, IGuideConfig, IGuideView } from "../lib.cck";
import { EventSystem } from "../event";



/**
 * name: 引导管理类
 * date: 2020/04/22
 * author: 何沛东
 * description: 控制和管理游戏中的引导
 */
export class GuideManager {
    private _isGuideLaunched: boolean;                         //引导已经启动
    private _isGuiding: boolean;                               //正在引导
    private _close: boolean;                                   //关闭引导功能
    private _lastUiId: string;                                 //上一个uiId
    private _fingerSpeed: number;                              //手指移动速度
    private _guideInfo: IGuideConfig;                          //当前的引导配置信息
    private _storage_key: string;                              //引导数据缓存键
    private _guideSearch: GuideSearch;                         //引导检索
    private _guideMask: Node;                               //引导遮罩
    private _guideLayer: Node;                              //引导层节点
    private _guideView: IGuideView;                            //引导视图

    private constructor() {
        this._storage_key = 'guide_complete';
        this._isGuideLaunched = false;
        this._isGuiding = false;
        this._close = false;
        this._lastUiId = '';
        this._guideSearch = new GuideSearch();
    }

    private static _ins: GuideManager = null;
    public static get instance(): GuideManager {
        return this._ins = this._ins ? this._ins : new GuideManager();
    }


    public get isGuideClose(): boolean { return this._close; }
    public get isGuideLaunched(): boolean { return this._isGuideLaunched; }
    public get isGuiding(): boolean { return this._isGuiding; }
    public get guideInfo(): IGuideConfig { return this._guideInfo; }
    public get guideTargets(): GuideTarget[] {
        let targets: GuideTarget[] = [];
        for (let e of this._guideInfo.targetId) {
            if (this._guideSearch.getGuideTargets().has(e)) {
                targets.push(this._guideSearch.getGuideTargets().get(e));
            }
        }
        return targets;
    }
    public get guideId() { return parseInt(this.syncFromStorage()); }
    public get fingerSpeed(): number { return this._fingerSpeed; }
    public get guideFile(): IContainer<IGuideConfig> { return this._guideSearch.getGuideFile(); }
    public get guideType(): number {
        return this.guideInfo.guideType;
    }
    public get lightTargets(): Node[] { return this._guideSearch.getLightTargets().get(this._guideInfo.key); }

    public setAgainExecute(againExecute: boolean) {
        this._guideSearch.setAgainExecute(againExecute);
    }

    /**将引导存储到缓存中 */
    public syncToStorage() {
       sys.localStorage.setItem(this._storage_key, this._guideInfo.key.toString());
    }

    /**从缓存中获取同步引导 */
    public syncFromStorage() {
        return sys.localStorage.getItem(this._storage_key);
    }

    /**
     * 设置引导视图
     * @param guideView 
     */
    public setGuideView(guideView: IGuideView): void {
        this._guideView = guideView;
    }

    /**
     * 增加引导视图
     * @param uiId 
     * @param target
     */
    public addGuideView(uiId: string, target: Node, scope: Scope): void {
        this._guideSearch.addGuideView(uiId, target, scope);
    }

    /**
     * 删除引导视图
     * @param uiId 
     * @param scope 
     */
    public removeGuideView(uiId: string, scope: Scope) {
        this._guideSearch.removeGuideView(uiId, scope);
    }

    /**
     * 增加遮罩节点和引导层节点
     * @param mask 
     * @param layer
     */
    public addGuideMaskAndLayer(mask: Node, layer: Node): void {
        this._guideMask = mask;
        this._guideLayer = layer;
    }

    /**
     * 把引导目标节点移动到引导层节点下
     * @param target 
     */
    public addChildToGuideLayer(target: Node): void {
        if (this._guideLayer) {
            let tarPos: Vec3 = utils.EngineUtil.convertPosition(target, this._guideLayer);
            target.removeFromParent();
            target.parent = this._guideLayer;
            target.position.set(tarPos.x, tarPos.y);
        }
    }

    /**
     * 移动到指定父节点下
     * @param target 
     * @param parent 
     */
    public removeToParent(target: Node, parent: Node) {
        let tarPos: Vec3 = utils.EngineUtil.convertPosition(target, parent);
        target.removeFromParent();
        target.parent = parent;
        target.position.set(tarPos.x, tarPos.y);
    }

    /**隐藏阻塞事件层 */
    public hideBlockInputLayer() {
        EventSystem.event.emit(GuideNormalEvent.HIDE_BLOCK_INPUT_LAYER);
    }

    /**
     * 检索所有高亮节点
     * @param guideId 
     */
    public searchLightTarget(guideId: number): boolean {
        this._guideSearch.searchLightTarget(guideId);
        return this.lightTargets && this.lightTargets.length > 0;
    }

    /**引导回退 */
    public guideRollBack() {
        if (!this.guideInfo) return;
        let guideId: number = this._guideInfo.key - 1;
        let info: IGuideConfig = this.guideFile.get(guideId);
        if (info) {
            this._guideInfo = info;
        }
    }

    /**
     * 设置手指移动速度
     * @param speed 
     */
    public setFingerSpeed(speed: number): void {
        this._fingerSpeed = (speed > 1 ? 1 : speed) * 1000;
    }

    /**
     * 设置引导数据文件
     * @param file 
     */
    public setGuideFile(file: IContainer<IGuideConfig>): void {
        this._guideSearch.setGuideFile(file);
    }

    /**
     * 设置每一步引导完成监听
     * @param listeners 监听回调
     * @param caller 执行者
     */
    public setGuideComplete(listeners: Function, caller: any) {
        EventSystem.event.on(EventType.GUIDE_COMPLETE, caller, listeners);
    }

    /**
     * 设置引导结束监听
     * @param listeners 监听回调
     * @param caller 执行者
     */
    public setGuideOver(listeners: Function, caller: any) {
        EventSystem.event.on(EventType.GUIDE_OVER, caller, listeners);
    }

    /**
     * 设置开始引导监听
     * @param listeners 监听回调
     * @param caller 执行者
     */
    public setGuideStart(listeners: Function, caller: any) {
        EventSystem.event.on(EventType.GUIDE_START, caller, listeners);
    }
    /**
     * 设置引导完结监听，此监听为完成所有引导时，即引导完成执行完时执行此回调
     * @param listeners 监听回调
     * @param caller 执行者
     */
    public setGuideEnd(listeners: Function, caller: any): void {
        EventSystem.event.on(EventType.GUIDE_NONE, caller, listeners);
    }

    /**
     * 引导数据同步
     * @param guideId 
     */
    public guideSync(guideId: number) {
        sys.localStorage.setItem(this._storage_key, guideId.toString());
    }

    /**还有引导 */
    public hasGuideAction(): boolean {
        if (!this.syncFromStorage()) {
            return true;
        }
        const guideInfo = this.guideFile.get(this.syncFromStorage());
        if (guideInfo) {
            return guideInfo.syncId !== -1;
        }
        else {
            return false;
        }
    }

    public getGuideTargets() {
        return this._guideSearch.getGuideTargets();
    }

    /**强制关闭引导 */
    public guideClose() {
        this._close = true;
        this._isGuideLaunched = false;
        this._isGuiding = false;
    }

    /**强制打开引导 */
    public guideOpen() {
        this._close = false;
        this.nextGuideInSwitchUI();
    }

    /**在手指引导之后执行下一步, 在某些情况下可能会需要调用, 通常调用此接口的可能性不大 */
    public nextStepFingerGuide() {
        EventSystem.event.emit(GuideNormalEvent.FINGER_EVENT);
    }

    public againExecute(scope: Scope) {
        this._guideSearch.againExecute(scope);
    }

    /**当前引导启动 */
    public guideLaunch() {
        Debug.log('[GuideManager] guideLaunch 引导启动', this._guideInfo, this._close);
        if (!this.guideFile || this._close) return;

        let guideId: number = parseInt(this.syncFromStorage());
        Debug.log('[GuideManager] guideLaunch 引导ID', guideId);
        let guideInfo: IGuideConfig = this.guideFile.get(guideId);

        //开始执行引导，这里是接着之前的引导，可能需要打开相应的界面
        if (guideInfo) {
            if (guideInfo.againId > -1) {
                //暂存上一步引导的uiId
                this._isGuideLaunched = true;
                this._lastUiId = guideInfo.uiId;
                if (guideInfo.againId !== 0) {
                    this._guideInfo = this.guideFile.get(guideInfo.againId);
                    if (this._guideSearch.isViewOpen(this._guideInfo.uiId)) {
                        this.guideStart();
                    }
                }
                else {
                    //重新回到游戏后, 下一步引导如果为0, 即暂时没有下一步, 需要条件触发下一步引导, 把储存的引导步骤作为当前已完成的引导
                    this._guideInfo = guideInfo;
                    this.guideComplete();
                }
            }
            else {
                this.guideEnd();
            }
        }
        else {
            //如果没有缓存的引导数据，就从第一个引导数据开始引导
            this._isGuideLaunched = true;
            this._guideInfo = this.guideFile.get(this.guideFile.keys[0]);
            this.guideStart();
        }
    }

    /**引导恢复, 恢复后的引导,将执行下一步引导 */
    public guideResume() {
        if (this._close) {
            return;
        }
        this.syncGuideInfo();
        Debug.log('[GuideManager] guideResume 引导恢复', this._guideInfo);
        if (this._guideInfo.syncId === 0) {
            this._guideInfo = this.guideFile.get(this._guideInfo.key + 1);
            if (this._guideInfo) {
                this.guideStart();
            }
            else {
                Debug.error('引导配置表数据异常，对应的引导ID为：', this._guideInfo.key);
            }
        }
        else if (this._guideInfo.syncId === -1) {
            this.guideEnd();
        }
    }

    /**当前引导完成，继续下一步引导 */
    public guideContinue() {
        if (!this.isGuiding || this._close) return;

        Debug.log('[GuideManager] guideContinue 当前引导完成，继续下一步引导');
        this.guideComplete();
        if (this._guideInfo.syncId > 0) {
            //暂存上一步引导的uiId
            this._lastUiId = this._guideInfo.uiId;
            this._guideInfo = this.guideFile.get(this._guideInfo.syncId);
            this.nextGuideInCurrUI();
        }
        else if (this._guideInfo.syncId === 0) {
            this.guideOver();
        }
        else if (this._guideInfo.syncId === -1) {
            this.guideEnd();
        }
    }

    /**在切换UI时执行下一步引导 */
    public nextGuideInSwitchUI() {
        if (!this.guideInfo || this._close) {
            if (this.hasGuideAction()) {
                Debug.log('加载引导层视图');
                !this._close && this._guideView.show();
            }
            return;
        }
        //在其他界面引导, 需要判断当前是否还处在引导状态
        if (this.switchUI() && this.isGuiding) {
            this.guideStart();
        }
    }

    /**在当前UI上执行下一步引导 */
    public nextGuideInCurrUI() {
        if (!this.guideInfo || this._close) {
            return;
        }
        if (!this.switchUI()) {
            this.guideStart();
        }
        else if (this._guideSearch.isViewOpen(this.guideInfo.uiId)) {
            this.nextGuideInSwitchUI();
        }
    }

    /**删除引导目标 */
    public delGuideTarget(targetId: string): boolean {
        return this._guideSearch.getGuideTargets().delete(targetId);
    }

    /**获取引导目标的位置 */
    public getTargetPosition(): Vec3[] {
        let vecs: Vec3[] = [];
        for (let guideTarget of this.guideTargets) {
            const canvas = director.getScene().getChildByName("Canvas");
            vecs.push(utils.EngineUtil.convertPosition(guideTarget.target, canvas));
        }
        return vecs;
    }

    /**
     * 设置引导文本的位置
     * @param guideComponent 引导组件
     * @param text 文本节点
     */
    public setTextPos(guideComponent: Component, text: Node) {
        let textPos = utils.EngineUtil.convertPosition(this.guideTargets[0].target, guideComponent.node);

        text.position.set(textPos.x, textPos.y);
        //转换到Canvas节点坐标系下, 用于计算锚点
        const canvas = director.getScene().getChildByName("Canvas");
        let pos: Vec3 = utils.EngineUtil.convertPosition(text, canvas);
        const ui = text.getComponent(UITransform);
        const targetUI = this.guideTargets[0].target.getComponent(UITransform);
        let width: number = ui.width / 2;
        //计算是否需要显示在引导目标上方, 若目标下方还有足够空间, 显示在下方
        let anchorY: number = (text.position.y + ui.height - targetUI.height / 2) > 10 ? 1 : 0;
        ui.anchorY = anchorY;
        //计算文本是否超出屏幕外, 或者距离屏幕边界太近, 是, 则修正位置
        const canvasUI = canvas.getComponent(UITransform);
        let offset = canvasUI.width / 2 - Math.abs(pos.x);
        if (offset < width) {
            const x = text.position.x > 0 ? text.position.x - Math.abs(width - offset) - 30 : text.position.x + Math.abs(width - offset) + 30;
            text.position.set(x, text.position.y);
        }
        else if (offset - width < 20) {
            const x = text.position.x > 0 ? text.position.x - 30 : text.position.x + 30;
            text.position.set(x, text.position.y);
        }

        if (anchorY === 0) {
            const y = text.position.y + targetUI.height / 2 + 10 + ui.height / 2;
            text.position.set(text.position.x, y);
        }
        else if (anchorY === 1) {
            const y = text.position.y - targetUI.height / 2 - 10 - ui.height / 2;
            text.position.set(text.position.x, y);
        }
    }

    /**当前这一步引导开始执行 */
    private guideStart() {
        if (this._guideSearch.isViewOpen(this.guideInfo.uiId)) {
            Debug.log('[GuideManager] 新的引导开始执行', this._guideInfo.key, this._guideInfo.light);
            this._isGuiding = true;
            this._guideMask && (this._guideMask.active = !UIManager.instance.isView(this._guideInfo.light[0]));
            EventSystem.event.emit(EventType.GUIDE_START, this.guideInfo.key);
        }
    }

    /**当前这一步引导完成 */
    private guideComplete() {
        this.syncToStorage();
        EventSystem.event.emit(EventType.GUIDE_COMPLETE, this.guideInfo.key);
    }

    /**本轮引导结束 */
    private guideOver() {
        Debug.log('[GuideManager] 本轮引导结束');
        this._isGuiding = false;
        this._guideMask && (this._guideMask.active = false);
        EventSystem.event.emit(EventType.GUIDE_OVER, this.guideInfo.key);
    }

    /**所有引导已经完结 */
    private guideEnd() {
        Debug.log('[GuideManager] 所有引导已经完结');
        this.guideClose();
        this._guideMask && (this._guideMask.active = false);
        EventSystem.event.emit(EventType.GUIDE_NONE);
    }

    /**是否切换了UI */
    private switchUI() {
        Debug.log('lastUiId', this._lastUiId, this.guideInfo.uiId);
        if (this._lastUiId.length === 0) {
            return false;
        }

        else return this._lastUiId !== this.guideInfo.uiId;
    }

    /**同步引导信息 */
    private syncGuideInfo() {
        let guideId: number = parseInt(this.syncFromStorage());
        this._guideInfo = this.guideFile.get(guideId);
    }
}
