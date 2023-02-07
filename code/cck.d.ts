/**********************************************类型定义，方便兼容和扩展********************************************/

declare var global: any;

type Constructor = {new (...args: any[]): {}};
type cck_static<T, U> = {
    new (): T;
} & U;
type cck_dictionary<T> = { [P in keyof T]: T[P]; }
type ggk_readonly_dictionary<T> = Readonly<cck_dictionary<T>>;
type cck_base_type<K, ConditionT, T1, T2> = K extends ConditionT ? T1 : T2;
type cck_key_base_type<K, T1, T2> = K extends T1 ? string : K extends T2 ? number : never;
type cck_map_base_type<T, K  extends number | string> = { [n in K]: T; }

type cck_vm_handler_opts<DataType> = { [P in keyof DataType]: (data:  DataType[P], key: P) => void }
type cck_vm_class<DataType> = cck_static<any, {prototype: cck_vm_handler_opts<DataType>}>;
type cck_initial_asset_info = {path: string, type: typeof cc.Asset}

type cck_file_field<T> = { [K in keyof T]: readonly K; }

type cck_win_model = "ROOT"|"DIALOG"|"ACTIVITY"|"TOAST"|"TOP";
type cck_win_activity = {priority: number, view: IWindowBase};

type cck_red_dot_list = {parentId: number, childId: number};

interface ANode {
    adjvex: number;
    weight: number;
    nextArc: ANode;
}

type Edge_t = ANode;

type value_t = string;

interface VNode {
    data: value_t;
    firstArc: Edge_t;
}

type Vertex_t = VNode;

/***************************************接口类型定义************************/
/**监听基础类型 */
interface IListener { (...args: any[]): any }

/**信号接口类型 */
interface ISignal<T, E> {
    readonly active: boolean;
    add(listener: T): void;
    dispatch(...args: any[]): void;
    remove(listener: T): void;
    clear(): void;
}

/**配置表数据类型 */
interface IDataTable {
    /**初始化JSON数据表 */
    init(data: any): void;
}

interface IGameWorld extends IFacade {
    /**当前游戏平台 */
    readonly platform: number;
    /**WinForm视图加载进度回调 */
    readonly onViewProgress: IViewProgress<ViewProgress, IGameWorld>;
    /**WinForm视图加载完成回调 */
    readonly onViewComplete: IViewComplete<ViewComplete, IGameWorld>;
    /**
     * 设置游戏平台，具体的游戏平台可以通过App.Platform获取
     * @param platform 具体的平台
     */
    setPlatform(platform: number): void;
    /**
     * 设置当前游戏的版本号
     * @param vs 具体的版本号
     */
    setVersions(vs: string): void;
    /**获取当前游戏的版本号 */
    getVersions(): string;

    init(mask: cc.Prefab, wait: cc.Prefab, touchEffect: cc.Prefab): void;
    addViewMaskTo(parent: cc.Node, page: IWindowBase, zIndex: number): void;
    delViewMask(): void;
    showWaitView(): void;
    hideWaitView(): void;
    canOpenWinForm(accessId: string): boolean;
}

interface IScene extends IMediator {
    readonly type: number;
    readonly canvas: cc.Node;
    readonly sceneName: string;
    setSceneType(): void;
    runScene(wait: cc.Node, hasTouchEffect: boolean, ...args: any[]): void;
    destroy(wait: cc.Node): void;
    onCreate(register: IRegister): number;
    onStart(...args: any[]): void;
    onEnd(): void;
    loadScene(onProgress?: (completedCount: number, totalCount: number, item: any) => void): void;
    update(dt: number): void;
    toString(): string;
}

interface ISceneManager {
    setTouchEffect(prefab: cc.Prefab): void;
    setMask(prefab: cc.Prefab): void;
    setViewWait(prefab: cc.Prefab): void;
    addViewMaskTo(parent: cc.Node, page: IWindowBase, zIndex: number): void;
    delViewMask(): void;
    showWaitView(): void;
    hideWaitView(): void;
    /**
     * 设置要运行的场景，此函数通过场景名设置即将要运行的场景，可以通过传递参数的形式给即将要运行的场景传递数据。
     * 该函数设置完成场景后，会马上加载运行该场景名的游戏场景。
     * @param sceneName  场景名
     * @param args 传递给此场景的数据
     */
    setScene(sceneName: string, ...args: any[]): void;
    /**
     * 场景回退，回退到上一个运行的场景
     * @param args 传递给此场景的数据
     */
    backScene(...args: any[]): void;
}

interface ViewProgress extends IListener { (progress: number): void; }
interface IViewProgress<T, E> extends ISignal<T, E> {
    dispatch(progress: number): void;
}
interface ViewComplete extends IListener { (): void; }
interface IViewComplete<T, E> extends ISignal<T, E> {
    dispatch(): void;
}

/**
 * UI控制配置表
 * 表结构:
 * 
 *    key(uiId): string,
 *    uiType(ui类型，1是ui界面，2是按钮，3是ui中的非按钮显示区域): string,
 *    access(访问权限): boolean,
 *    lock(解锁等级): number
 */
interface IUIControlConfig extends IDataTable {
    readonly key: string;
    readonly uiType: number;
    readonly access: boolean;
    readonly lock: number;
}

/**
 * 引导配置表类
 * 表结构：
 * 
 *     key(引导id):number, 
 *     guideType(引导类型0是手指引导，1是对话引导，2是文本引导):number, 
 *     targetId(引导目标节点，例如手指指向的按钮节点):number[], 
 *     descript(文本引导或对话引导的文字描述):string, 
 *     uiId(ui视图界面ID):string, 
 *     syncId(下一步引导的id，0为当前引导完成，-1为所有引导完成):number,
 *     againId(未完成当前引导断开后重新上线的下一步引导ID，-1表示直接使用syncId): number,
 *     light(高亮的uiId): number[],
 *     npc(对话引导中是否为NPC): number,
 */
interface IGuideConfig extends IDataTable {
    /**引导id */
    readonly key: number;
    /**引导类型 */
    readonly guideType: number;//0|1|2
    /**目标id */
    readonly targetId: string[];
    /**文字描述 */
    readonly descript: string;
    /**窗口id */
    readonly uiId: string;
    /**下一步引导 */
    readonly syncId: number;
    /**未完成当前引导,断开后重新上线的下一步引导 */
    readonly againId: number;
    /**高亮uiId列表 */
    readonly light: string[];
    /**对话引导中是否为NPC */
    readonly npc: number;
}

/***********************************************音频接口类型定义**************************************/

/**音频属性类型 */
interface IAudio {
    /**音频路径 */
    url: string;
    /**是否循环播放 */
    loop?: boolean;
    /**延迟播放（秒） */
    delay?: number;
    /**音频播放音量 */
    volume?: number;
}

/**音效属性类型 */
interface IAudioEffect extends IAudio {
}

/**背景音频属性类型 */
interface IAudioBGM extends IAudio {
    /**背景音乐是否可以和音效叠加,默认叠加 */
    superpose?: boolean;
}

/***************************************************************************************************/

/**********************************************动画接口类型定义*******************************************/

/**动画属性类型 */
interface IAnimat {
    /**动画名称 */
    name: string;
    /**动画资源的路径 */
    url?: string;
    /**延迟播放 */
    delay?: number;
    /**迭代播放次数 */
    repeatCount?: number;
    /**播放完成了 */
    played?: boolean;
}

/**帧动画属性类型 */
interface IFrameAnimat extends IAnimat {
    /**剪辑动画 */
    clip?: cc.AnimationClip;
    /**动画播放速率 */
    speed?: number;
    /**动画开始时间 */
    startTime?: number;
    /**是否是默认动画 */
    default?: boolean;
    /**动画播放时长 */
    duration?: number;
}

/**spine动画属性类型 */
interface ISpineAnimat extends IAnimat {
    /**是否循环 */
    loop?: boolean;
    trackIndex?: number;
}

/**龙骨动画属性类型 */
interface IDragonBonesAnimat extends IAnimat {
    /**是否循环 */
    loop?: boolean;
    organ?: cc.Node;
    /**当前骨骼中所有动画的时间缩放率 */
    timeScale?: number;
    /**当前的 Armature 名称 */
    armatureName?: string;
}

/*****************************************************************************************/

/**配置表文件容器类型 */
interface IContainer<T> {
    readonly keys: number[]|string[];
    readonly length: number;
    readonly fields: cck_file_field;
    /**
     * 根据id获取配置表的数据
     * @param id 
     * @returns 返回对应的id的配置表对象
     */
    get(id: number|string): T;
    add(id: number|string, table: T): void;
    /**
     * 获取当前表中的这个字段的值的累加，只有这个字段数据类型为number时才有用
     * @param field 当前配置表字段名
     * @returns 返回这个字段在当前配置表中的值的累加，如果数据类型不是number，则返回null
     */
    getSumOf(field: string): number|null;
    /**
     * 遍历当前配置表
     * @param callback 
     */
    forEach(callback: (value: T, index: number) => void): void;
    /**
     * 是否存在这个id的数据
     * @param id 
     */
    contains(id: number|string): boolean;
}


/**引导视图类型 */
interface IGuideView {
    show(): void;
}

module BarrageArea {
    export enum TruckStatus {
        /**空闲状态 */
        LDLE,
        /**启动状态 */
        LAUNCH,
        /**出站状态 */
        OUTBOUND,
        /**到站状态 */
        PULLIN
    }
}

/**弹幕系统弹幕类型 */
interface ITruck {
    /**弹幕ID */
    readonly ID: number;
    /**弹幕内容 */
    readonly content: number;
    /**弹幕内容颜色 */
    readonly color: cc.Color;
    /**弹幕载体 */
    readonly carrier: cc.Node;
    /**弹幕状态 */
    readonly status: BarrageArea.TruckStatus;
}
/**弹幕系统航线类型 */
interface ILane {
    /**航线坐标x */
    readonly x: number;
    /**航线坐标y */
    readonly y: number;
    /**航线编号 */
    readonly num: number;
    /**航线宽 */
    readonly width: number;
    /**航线长 */
    readonly length: number;
    /**激活状态 */
    active: boolean;
    /**空闲状态 */
    readonly ldle: boolean;
}


/******************************UI模块接口类型定义***********************************/

/**UI对象池类型 */
interface IUIPool<T> {
    [n: string]: T;
}

interface IRegister {
    /**
     * 注册消息通知监听，handler中的body数据体可以是任意数据类型，在定义回调函数时，可以把any改成任意类型
     * @param notificationName 消息通知名
     * @param handler 接收消息返回的回调函数
     */
    reg(notificationName: string, handler: (body: any, type: string) => void): void;
    /**
     * 增加需要你想要关注的command，以便让window窗口能够与command通信
     * @param command 想要关注的command
     */
    addCommand(command: string): void;
}

/**视图控制器类型 */
interface IWindowBase extends IMediator {
    readonly name: string;
    readonly node: cc.Node;
    readonly view: cc.Component;
    readonly hasMask: boolean;
    readonly canClose: boolean;
    readonly autoRelease: boolean;
    readonly accessId: string;
    readonly opened: boolean;
    readonly winModel: cck_win_model;
    iniViewType(): void;
    setWinName(name: string): void;
    getViewType(): number;
    isAddMask(hasMask: boolean): void;
    isClickAnyClose(can: boolean): void;
    setAutoRelease(autoRelease: boolean): void;
    load(accessId: string, isOpen: boolean, onProgress: (progress: number) => void, onComplete: () => void): void
    open(onComplete: Function, ...args: any[]): void;
    close(isDestroy?: boolean): void;
}

interface IEventBody {
    /**触发事件信息对象 */
    event: cc.Event.EventTouch | cc.Event.EventMouse;
    /**节点的name */
    node: string;
    /**事件类型，例如cc.Node.EventType.TOUCH_START */
    type: string;
}

interface ILayerManager {
    readonly canRelease: boolean;
    setDisappears(visible: boolean): void;
    addView(view: IWindowBase): void;
    delView(cleanup: boolean): boolean;
    getView(): IWindowBase;
    hasView(view: IWindowBase): boolean;
    removeView(view: IWindowBase): boolean;
    clear(): void;
    getCount(): number;
}

interface IActivityManager extends ILayerManager {
    setPriority(priority: number, view: IWindowBase): void;
    popActivity(): cck_win_activity;
}

/**UI主控器管理,是一个单例, 使用kit.windowManager访问 */
interface IWindowManager {
    readonly Type: {
        /**根视图 */
        ROOT: number;
        /**普通视图 */
        DIALOG: number;
        /**活动视图 */
        ACTIVITY: number;
        /**冒泡提示视图 */
        TOAST: number;
        /**最顶层视图 */
        TOP
    }
    init(): void;
    getLayerManager(type: number): ILayerManager;
    setVisible(ctrlIndex: number, visible: boolean): void;
    addView(view: IWindowBase): void;
    delView(ctrlIndex: number): boolean;
    shiftMask(): void;
    getOpenCtrlCount(): number;
    clear(): void;
}

interface BaseView extends cc.Component {}

interface IWinView extends cc.Component {
    /**弹起窗口 */
    popup(): void;
    /**关闭窗口 */
    close(): void;
    setPopupSpring(): void;
    /**
     * 弹起窗口时执行的回调
     * @param listener 
     * @param caller 
     */
    setStartListener(listener: Function, caller: any): void;
    /**
     * 弹起窗口后执行的回调
     * @param listener 
     * @param caller 
     */
    setCompleteListener(listener: Function, caller: any): void;
    /**
     * 设置返回按钮监听回调
     * @param listener 
     */
    setBackBtnListener(listener: Function): void;
}

interface IBaseView {}


/******************************************************************************/

/**************************************引导接口类型定义**************************/

interface IGuideTarget {
    target: cc.Node;
    targetId: string;
    guideIds: number[];
    init(): void;
}


/**
 * 引导管理,是一个单例,采用kit.guideManager访问，
 * 外部主要调用引导恢复guideResume()这个接口
 * */
interface IGuideManager {
    /**引导是否强制关闭了 */
    readonly isGuideClose: boolean;
    /**引导已经启动 */
    readonly isGuideLaunched: boolean;
    /**正在引导 */
    readonly isGuiding: boolean;
    /**引导类型 */
    readonly guideType: number;
    /**引导目标 */
    readonly guideTargets: IGuideTarget[];
    /**当前要执行的引导信息 */
    readonly guideInfo: IGuideConfig;
    /**引导文件数据 */
    readonly guideFile: IContainer<IGuideConfig>;
    /**已经执行完的引导id */
    readonly guideId: number;
    /**手指移动速度 */
    readonly fingerSpeed: number;
    /**高亮节点列表 */
    readonly lightTargets: cc.Node[];

    /*************************************可能需要外部调用的接口***************************/
    /**
     * 设置引导视图
     * @param guideView 
     */
    setGuideView(guideView: IGuideView): void;
    /**
     * 设置引导数据文件
     * @param file 
     */
    setGuideFile(file: IContainer<IGuideConfig>): void;
    /**
     * 引导数据同步
     * @param guideId 
     */
    guideSync(guideId: number): void;
    /**从缓存中获取同步引导 */
    syncFromStorage(): number;
    /**删除引导目标 */
    delGuideTarget(targetId: string): boolean;
    /**
     * 增加引导视图
     * @param uiId 
     * @param target 引导页面节点
     * @param scope  
     */
    addGuideView(uiId: string, target: cc.Node, scope: IGuideManager.Scope): void;
    /**
     * 删除引导视图
     * @param uiId 
     * @param scope 
     */
    removeGuideView(uiId: string, scope: IGuideManager.Scope): void;
    /**还有引导 */
    hasGuideAction(): boolean;
    /**同步存储引导Id */
    syncToStorage(): void;
    /**引导回退 */
    guideRollBack(): void;
    /**引导完成, 继续下一步 */
    guideContinue(): void;
    /**
     * 引导恢复，恢复之后会执行下一步引导, 并且必须在syncId为0时调用才有作用
     */
    guideResume(): void;
    /**强制引导关闭，提供的可以把引导功能关闭的接口，外部调用时，请谨慎 */
    guideClose(): void;
    /**强制打开引导, 打开后, 如果有引导会自动执行, 会把强制关闭的引导重新打开 */
    guideOpen(): void;
    /**获取引导所有目标节点 */
    getGuideTargets(): Map<string, IGuideTarget>;
    /**
     * 设置开始引导监听
     * @param listeners 监听回调
     * @param caller 执行者
     */
    setGuideStart(listeners: (guideId: number) => void, caller: any): void;
    /**
     * 设置每一步引导完成监听
     * @param listeners 监听回调
     * @param caller 执行者
     */
    setGuideComplete(listeners: (guideId: number) => void, caller: any): void;
    /**
     * 设置引导结束监听，此监听为完成一轮引导(即syncId等于0)时执行
     * @param listeners 监听回调
     * @param caller 执行者
     */
    setGuideOver(listeners: (guideId: number) => void, caller: any): void;
    /**
     * 设置引导完结监听，此监听为完成所有引导时，即引导完全执行完时执行此回调
     * @param listeners 监听回调
     * @param caller 执行者
     */
    setGuideEnd(listeners: Function, caller: any): void;
    /**在手指引导之后执行下一步, 在某些情况下可能会需要调用, 通常调用此接口的可能性不大 */
    nextStepFingerGuide(): void;


    /**********************************一般不需要外部调用的接口****************************/
    againExecute(scope: PanelScope): void;
    setAgainExecute(againExecute: boolean): void;
    /**
     * 增加遮罩节点和引导层
     * @param mask 
     * @param layer
     */
    addGuideMaskAndLayer(mask: cc.Node, layer: cc.Node): void;
    /**
     * 把引导目标的父节点设置为遮罩节点
     * @param child 
     */
    addChildToGuideLayer(child: cc.Node): void;
    /**
     * 移动到指定父节点下
     * @param target 
     * @param parent 
     */
    removeToParent(target: cc.Node, parent: cc.Node): void;
    /**新手引导启动 */
    guideLaunch(): void;
    /**
     * 检索所有高亮节点
     * @param guideId 
     */
    searchLightTarget(guideId: number): boolean;
    /**隐藏阻塞事件层 */
    hideBlockInputLayer(): void;
    /**阻塞所有触摸, 不需要外部调用 */
    blockTouch(): void;
    /**在切换UI时执行下一步引导 */
    nextGuideInSwitchUI(): void;
    /**在当前UI上执行下一步引导 */
    nextGuideInCurrUI(): void;
    /**获取引导目标的位置 */
    getTargetPosition(): cc.Vec3[];
    /**
     * 设置引导节点的位置
     * @param guide 
     * @param pos 
     */
    setGuidePosition(guide: cc.Node, pos: cc.Vec2): void;
    /**
     * 设置引导文本的位置
     * @param guideComponent 引导组件
     * @param text 文本节点
     */
    setTextPos(guideComponent: cc.Component, text: cc.Node): void;
    /**
     * 设置手指移动速度
     * @param speed 
     */
    setFingerSpeed(speed: number): void;
}

/**********************************************************************************/

/**翻页组件事件参数类型 */
interface IPageTurnParam {
    page: cc.Node;
    index: number;
}

/*****************************
 * ECS模式接口类型
 * 
******************************/

interface IComponent {}

interface IComponentMap { [n: number]: IComponent; }

interface IEntity {
    readonly enabled: boolean;
    readonly ID: string;
    readonly name: string;
    readonly types: number[];
    readonly groupId: string;
    readonly onComponentAdded: IEntityChange<EntityChange, IEntityManager<IEntity>>;
    readonly onComponentRemoved: IEntityChange<EntityChange, IEntityManager<IEntity>>;
    readonly onEntityReleased: IEntityReleased<EntityReleased, IEntityManager<IEntity>>;
    readonly onEntityDestroyed: IEntityReleased<EntityReleased, IEntityManager<IEntity>>;
    setEnabled(enabled: boolean): void;
    setID(id: string): void;
    setName(name: string): void;
    destroy(): void;
    clear(): void;
    setGroupId(id: string): void;
    addComponent(componentId: number): void;
    getComponent(component: number): IComponent;
    getComponentIndices(): number[];
    removeComponent(component: number): void;
    removeAllComponent(): void;
    hasComponent(index: number): boolean;
    toString(): string;
}

type _Entity = Readonly<IEntity>;

interface IMatcher<T extends IEntity> {
}

interface IEntityManager<T extends IEntity> {
    readonly onArchetypeChunkChange: IArchetypeChunkChange<ArchetypeChunkChange, IArchetypeChunk<T>>;
    createEntity(name: string): T;
    destroyEntity(entity: T): void;
    destroyEntityAll(): void;
    getEntities(): T[];
    getGroups(): IEntitiesGroup<T>;
}

interface ISystem<T extends IEntity> {
    readonly ID: string;
    readonly name: string;
    enabled: boolean;
    setPool(pool: IEntityManager<T>): void;
    setID(id: string): void;
    /**基类方法，外部不可调用此方法，否则会引发不可预知错误 */
    create(): void;
    /**基类方法，外部不可调用此方法，否则会引发不可预知错误 */
    start(): void;
    /**基类方法，外部不可调用此方法，否则会引发不可预知错误 */
    update(dt: number): void;
    /**基类方法，外部不可调用此方法，否则会引发不可预知错误 */
    destroy(): void;
    toString(): string;
}

interface ISystemGroup extends ISystem {}

interface IEntities { [n: string]: IEntity; }

interface IHandler {
    /**handler唯一的id */
    readonly id: number;
    /**是否只执行一次 */
    readonly once: boolean;
    /**回调函数体 */
    readonly method: Function;
    /**执行域 */
    readonly caller: any;
    /**
     * 回调执行函数
     * @param data
     * @returns {any}
     */
    apply(data: any): any;
}

interface IHandlers { [n: number]: IHandler[]; }

interface IArchetypeChunk<T extends IEntity> {
    readonly archetypes: IEntitiesGroup<T>;
    createArchetype(manager: IEntityManager<T>, types: number[]): IEntityArchetype<T>;
    getEntities(): T[];
    handleEntity(entity: T, type: number): boolean;
    updateEntity(entity: T, type: number): boolean;
}

interface IEntityArchetype<T extends IEntity> {
    readonly chunkCapacity: number;
    readonly typesCount: number;
    readonly version: string;
    readonly types: number[];
    readonly onEntityAdded: IEntityChangeInGroup<EntityChangeInGroup, any>;
    readonly onEntityRemoved: IEntityChangeInGroup<EntityChangeInGroup, any>;
    readonly onGroupReleased: IGroupChange<GroupChange, IEntityManager>;
    setEntityAddedSignal(signal: IEntityChangeInGroup<EntityChangeInGroup, any>): void;
    setEntityRemoveSignal(signal: IEntityChangeInGroup<EntityChangeInGroup, any>): void;
    setName(name: string): void;
    setGroupId(id: string): void;
    setComponentTypes(comments: number[]): void;
    getEntities(): T[];
    addEntityToChunk(member: T): Readonly<IEntityArchetype<T>>;
    removeEntityFromChunk(member: T): boolean;
    handleEntity(entity: T, index: number): boolean;
    updateEntity(entity: T, index: number): boolean;
    checkComponentType(entity: T): boolean;
    toString(): string;
}

interface IEntitiesGroup<T> { [n: string]: Readonly<IEntityArchetype<T>>; }

interface EntityReleased extends IListener { (entity: IEntity): void; }
interface IEntityReleased<T, E> extends ISignal<T, E> {
    dispatch(entity: IEntity): void;
}

interface EntityChange extends IListener { (entity: IEntity, componentIndex: number): void; }
interface IEntityChange<T, E> extends ISignal<T, E> {
    dispatch(entity: IEntity, componentIndex: number): void;
}

interface EntityChangeInGroup extends IListener { (entity: IEntity): void; }
interface IEntityChangeInGroup<T, E> extends ISignal<T, E> {
    dispatch(entity: IEntity): void;
}

interface GroupChange extends IListener { (entity: IEntityArchetype<IEntity>): void; }
interface IGroupChange<T, E> extends ISignal<T, E> {
    dispatch(group: IEntityArchetype<IEntity>): void;
}

interface ArchetypeChunkChange extends IListener { (archetype: IEntityArchetype<IEntity>): void; }
interface IArchetypeChunkChange<T, E> extends ISignal<T, E> {
    dispatch(archetype: IEntityArchetype<IEntity>): void;
}

interface MatcherInit extends IListener { (entities: IEntity[]): void;}
interface IMatcherInit<T, E> extends ISignal<T, E> {
    dispatch(entities: IEntity[]): void;
}

/*********************************************************************************************/

/***********************************************网络接口类型******************************************/

interface IHttpMessage extends IProxy {
    send(param: any): IHttpMessage;
    fail(reject: (e: IHttpFail) => void): IHttpMessage;
    then(resolve: (data?: any) => void): IHttpMessage;
    catch(listeners: (err: IHttpError) => void): IHttpMessage;
}
interface IHttpResponse<T = any> {
    /**状态码，规定200为请求正常，其他均为请求失败 */
    code: number;
    /**请求失败错误描述 */
    msg: string;
    /**数据 */
    data: T;
}
/**HTTP请求发生网络错误类型 */
interface IHttpError {
    /**错误描述 */
    msg: string;
    /**错误码, 1000为连接超时导致的错误, 1001为无法连接, 通常为网络环境所致导致的错误 */
    status: number;
}
interface IHttpFail {
     /**状态码，规定200为请求正常，其他均为请求失败 */
     code: number;
     /**请求失败错误描述 */
     msg: string;
}
interface IHttpManager {
    /**
     * 设置http api请求的远程服务器路径
     * @param url 
     */
    setApiServer(url: string): void;
    /**
     * 设置token
     * @param key token字段
     * @param token 具体的token值
     */
    setToken(key: string, token: string): void;
    /**
     * 下载JSON文件
     * @param url 下载路径
     */
    downJSONFile(url: string, caller: any): Promise<any>;
    /**
     * 获取消息协议对象
     * @param proxyName 协议名
     * @returns 返回指定的消息协议对象
     */
    get<T extends IHttpMessage>(proxyName: string): T;
}

interface ISocketListener<T = any> extends IListener { (code: number, data: T): void; }
interface SocketChange extends IListener { (): void; }
interface ISocketChange<T, E> extends ISignal<T, E> {
    dispatch(): void;
}
interface SocketNotConnected extends IListener { (code: number, reason: string): void; }
interface ISocketNotConnected<T, E> extends ISignal<T, E> {
    dispatch(code: number, reason: string): void;
}
interface SocketNetworkDelay extends IListener { (networkDelay: number): void; }
interface ISocketNetworkDelay<T, E> extends ISignal<T, E> {
    dispatch(networkDelay: number): void;
}
interface ISocketMessage extends IProxy {
    post(listener: ISocketListener, target: any): number;
    send(data?: any): void;
    dispatch(data: any): void;
    remove(listener: ISocketListener): boolean;
    remove(id: number): boolean;
}
interface ISocketProtocol {
    encodingData(data: any): any;
    decodingData(data: any): any;
}
/**socket消息的数据结构 */
interface ISocketData<T = any> {
    /**消息协议的类型，提供给服务器识别，客户端和服务器约定的此消息的身份id */
    proxyName: string;
    /**错误码，对于socket长连接，错误码为0时，消息正确返回，错误码不为0时，消息处理出错 */
    code?: number;
    /**请求时的数据参数 */
    data: T;
}
interface ISocket {
    binaryType: string;
    readonly readyState: number;
    readonly url: string;
    description(): void;
    link(url: string, callback: Function): void;
    send(data: string | ArrayBufferLike | Blob | ArrayBufferView): void;
    close(code?: number, reason?: string): void;
    onOpen(callback: () => void);
    onMessage(callback: (evt: MessageEvent) => void);
    onClose(callback: (evt: CloseEvent) => void);
    onError(callback: () => void);
    toString(): string;
}
interface ISocketManager {
    readonly binaryType: BinaryType;
    /**连接成功回调 */
    readonly onConnected: ISocketChange<SocketChange, ISocket>;
    /**连接发生异常时的回调 */
    readonly onConnectionException: ISocketChange<SocketChange, Socket>;
    /**异常连接恢复, 不是重新创建了一个新的连接, 而是长时间请求无反应, 突然请求成功了 */
    readonly onConnectionRestore: ISocketChange<SocketChange, Socket>;
    /**连接断开时的回调 */
    readonly onDisconnected: ISocketChange<SocketChange, ISocket>;
    /**连接失败回调 */
    readonly onNotConnected: ISocketNotConnected<SocketNotConnected, ISocket>;
    /**网络延迟回调，该回调会返回当前网络请求速度的参数 */
    readonly onNetworkDelay: ISocketNetworkDelay<SocketNetworkDelay, Socket>;
    /**
     * 初始化心跳消息
     * @param pingProxyName ping消息协议
     * @param pongProxyName pong消息协议
     */
    initHeartbeat(pingProxyName: string, pongProxyName: string): void;
    /**
     * 发起连接socket
     * @param url        socket服务器地址
     * @param binaryType 传输的数据类型
     */
    link(url: string, binaryType?: BinaryType): void;
    /**发起重连 */
    reconnect(): void;
    /**
     * 正常主动关闭连接，关闭后不会再重连，谨慎调用
     */
    close(): void;
    /**
     * 获取消息协议对象
     * @param proxyName 协议名
     * @returns 返回指定的消息协议对象
     */
    get<T extends ISocketMessage>(proxyName: string): T;
}
interface ICCSocketManager extends ISocketManager {
    encodingData(data: ISocketData): void;
    sendData(data: any): void;
    dispatchData(data: ISocketData): void;
}

/********************************************************************************/


/*******************************************红点接口类型*****************************/

interface RedDotChange extends IListener { (status: boolean): void; }
interface IRedDotChange<T, E> extends ISignal<T, E> {
    dispatch(status: boolean): void;
}

/**红点刷新逻辑类型接口 */
interface IRedDotAction {
    updateStatus(): void;
}

/**红点管理接口类型, 采用单例模式设计, 使用kit.redDotManager访问 */
interface IRedDotManager {
    /**
     * 根据ID增加红点节点
     * @param redDotId 红点ID
     * @param node     红点节点
     * @param listener 状态监听事件
     * @param target   红点状态修改逻辑所在的作用域
     */
    addRedDotNode(redDotId: number, node: cc.Node, listener: RedDotChange, target: any): void;
    /**
     * 增加红点刷新逻辑类型
     * @param logicType 红点刷新逻辑类
     * @param redDotId  对应红点ID
     */
    addRedDotLogic<T extends IRedDotAction>(logicType: { new(): T }, redDotId: number): void;
    /**
     * 初始化红点
     * @param parentId 
     * @param childId  
     * @example
     * //常用例子
     * initRedDot(1000, 1001);
     */
    initRedDot(parentId: number, childId: number): void;
    /**
     * 设置对应红点的状态, 一般为设置儿子红点的状态
     * @param redDotId 该红点对应的编号
     * @param status 
     */
    setRedDotStatus(redDotId: number, status: boolean): void;
    /**
     * 刷新红点状态, 外部调用此方法可根据具体的红点逻辑刷新状态
     * @param redDotId 
     */
    update(redDotId: number): void;
}

/**********************************************************************************/


/**********************************游戏事件系统接口类型************************************/
interface INotify<T> {
    getData(): T;
    getType(): string;
}
interface IGameSubject<T> {
    addObserver(observer: IGameObserver<T>): boolean;
    getObserver(observerName: string): IGameObserver<T>;
    hasObserver(observerName: string): boolean;
    removeObserver(observerName: string): boolean;
    notify(data: T, type: string): void;
}
interface IGameObserver<T> {
    readonly name: string;
    onCreate(): void;
    update(notify: INotify<T>): void;
}
interface IObserverSystem {
    /**
     * 给指定的主题订阅观察者
     * @param subjectName 主题名
     * @param observerName 观察者名
     */
    addObserver(subjectName: string, observerName: string): boolean;
    /**
     * 获取指定观察者
     * @param observerName 要获取的观察者名
     */
    getObserver<T extends IGameObserver<any>>(observerName: string): T;
    /**
     * 根据主题获取指定的观察者
     * @param subjectName 该观察者所在的主题
     * @param observerName 要获取的观察者
     */
    getObserverBySuject<T extends IGameObserver<any>>(subjectName: string, observerName: string): T;
    /**
     * 给指定主题下的所有观察者发送通知
     * @param subjectName 主题名
     * @param data 通知携带的数据
     * @param type 通知携带的类型
     */
    sendNotify<T>(subjectName: string, data: T, type?: string): void;
    /**
     * 移除指定主题
     * @param subjectName 要移除的主题名
     */
    removeSubject(subjectName: string): boolean;
    /**
     * 移除指定主题的某个观察者
     * @param subjectName 要移除的观察者所在的主题
     * @param observerName 要移除的观察者
     */
    removeObserver(subjectName: string, observerName: string): boolean;
    /**清除所有主题 */
    clear(): void;
}
interface IEventListeners {
        hasListener(type: string): boolean;
        /**
         * 发射事件消息
         * @param type 消息类型
         * @param args 消息数据
         */
        emit(type: string, ...args: any[]): boolean;
        /**
         * 注册事件监听,可以多次响应
         * @param type 事件类型
         * @param caller 事件注册者
         * @param listener 监听函数
         * @param args 参数列表
         */
        on(type: string, caller: any, listener: Function, ...args: any[]): IEventListeners;
        /**
         * 注册事件监听，只响应一次
         * @param type 事件类型
         * @param caller 事件注册者
         * @param listener 监听函数
         * @param args 参数列表
         */
        once(type: string, caller: any, listener: Function, ...args: any[]): IEventListeners;
        /**
         * 注销事件
         * @param type 事件类型
         * @param caller 事件类型
         * @param listener 监听函数
         * @param once 是否注销单次响应事件
         */
        off(type: string, caller: any, listener: Function, once?: boolean): IEventListeners;
        /**
         * 注销所有事件
         * @param type 事件类型
         */
        offAll(type?: string): IEventListeners;
        /**
         * 通过事件注册者注销所有事件
         * @param caller 事件注册者
         */
        offAllCaller(caller: any): IEventListeners;
    }

/***********************************************************************************/

/*************************************资源管理类型定义********************************/

interface ILoader {
    load<T extends cc.Asset>(paths: string, type: typeof cc.Asset, onProgress: (finish: number, total: number, item: cc.AssetManager.RequestItem) => void, onComplete: (error: Error, assets: T) => void): void;
    load<T extends cc.Asset>(paths: string[], type: typeof cc.Asset, onProgress: (finish: number, total: number, item: cc.AssetManager.RequestItem) => void, onComplete: (error: Error, assets: Array<T>) => void): void;
    load<T extends cc.Asset>(paths: string, onProgress: (finish: number, total: number, item: cc.AssetManager.RequestItem) => void, onComplete: (error: Error, assets: T) => void): void;
    load<T extends cc.Asset>(paths: string[], onProgress: (finish: number, total: number, item: cc.AssetManager.RequestItem) => void, onComplete: (error: Error, assets: Array<T>) => void): void;
    load<T extends cc.Asset>(paths: string, type: typeof cc.Asset, onComplete?: (error: Error, assets: T) => void): void;
    load<T extends cc.Asset>(paths: string[], type: typeof cc.Asset, onComplete?: (error: Error, assets: Array<T>) => void): void;
    load<T extends cc.Asset>(paths: string, onComplete?: (error: Error, assets: T) => void): void;
    load<T extends cc.Asset>(paths: string[], onComplete?: (error: Error, assets: Array<T>) => void): void;	

    loadDir<T extends cc.Asset>(dir: string, type: typeof cc.Asset, onProgress: (finish: number, total: number, item: cc.AssetManager.RequestItem) => void, onComplete: (error: Error, assets: Array<T>) => void): void;
    loadDir<T extends cc.Asset>(dir: string, onProgress: (finish: number, total: number, item: cc.AssetManager.RequestItem) => void, onComplete: (error: Error, assets: Array<T>) => void): void;
    loadDir<T extends cc.Asset>(dir: string, type: typeof cc.Asset, onComplete: (error: Error, assets: Array<T>) => void): void;
    loadDir<T extends cc.Asset>(dir: string, type: typeof cc.Asset): void;
    loadDir<T extends cc.Asset>(dir: string, onComplete: (error: Error, assets: Array<T>) => void): void;
    loadDir<T extends cc.Asset>(dir: string): void;

    loadScene(sceneName: string, options: Record<string, any>, onProgress: (finish: number, total: number, item: cc.AssetManager.RequestItem) => void, onComplete: (error: Error, sceneAsset: cc.SceneAsset) => void): void;
    loadScene(sceneName: string, onProgress: (finish: number, total: number, item: cc.AssetManager.RequestItem) => void, onComplete: (error: Error, sceneAsset: cc.SceneAsset) => void): void;
    loadScene(sceneName: string, options: Record<string, any>, onComplete: (error: Error, sceneAsset: cc.SceneAsset) => void): void;
    loadScene(sceneName: string, onComplete: (error: Error, sceneAsset: cc.SceneAsset) => void): void;
    loadScene(sceneName: string, options: Record<string, any>): void;
    loadScene(sceneName: string): void;

    /**
     * 增加资源
     * @param asset 
     */
    add(asset: cc.Asset): void;

    /**
     * 移除单个资源
     * @param asset 要删除的资源
     */
    delete(asset: cc.Asset): boolean;

    /**
     * 通过路径与类型获取资源
     * @param path 
     * @param type 
     * @returns 
     */
    get<T extends cc.Asset> (path: string, type?: typeof cc.Asset): T;
}

/****************************************************************************************************/


/**************************************音频，动画等特效播放管理类型定义********************************/
type audio_t = { audio: IAudioBGM | IAudioEffect; clip: cc.AudioClip; played: boolean; bgm: boolean; audioID: number; callbacks: audio_resolved_t[] };
type play_callback_t = (currentTime: number) => void;
type stop_callback_t = (duration: number) => void;
type audio_resolved_t = { type: string; call: any }

type resolved_t = { call: Function; type: string; };
type frameAnimat_t = { props: IFrameAnimat, callbacks: resolved_t[] };
type spineAnimat_t = { props: ISpineAnimat, callbacks: resolved_t[] };
type dragonBonesAnimat_t = { props: IDragonBonesAnimat, callbacks: resolved_t[] }

/**************************************************************************************/


/******************************************微信小游戏类型定义**********************************/
/**微信小游戏权限类型 */
type AuthSetting = {
    "scope.userInfo": boolean | undefined | null,// 请用button获取该信息
    "scope.userLocation": boolean | undefined | null,
    "scope.userLocationBackground": boolean | undefined | null,
    "scope.address": boolean | undefined | null,
    "scope.invoiceTitle": boolean | undefined | null,
    "scope.invoice": boolean | undefined | null,
    "scope.werun": boolean | undefined | null,
    "scope.record": boolean | undefined | null,
    "scope.writePhotosAlbum": boolean | undefined | null,
    "scope.camera": boolean | undefined | null,
}

/***************************************/
type bitLblImage_t = { spacing: number; sf: cc.SpriteFrame; }

type RedDot_t = { parent: number[]; }

/**弹幕数据类型 */
type barrageData_t = { content: string; color: string; }
type barrage_t = { content: string; delay: number; color: string; }
type barrageListenerParam_t = { carrier: cc.Node, content: string, color: cc.Color; };
type barrageListener_t = (param: barrageListenerParam_t) => void;

/**时间类型 */
type dateCompare_t = { year: number; month: number; date: number; hours: number; }

/******************Toast类型************************/
type ToastStyle = {
    font?: cc.Font
    fontSize?: number;
    fontColor?: cc.Color;
    fontOutlineColor?: cc.Color;
    fontOutlineSize?: number;
    styleBg?: {
        imag: cc.SpriteFrame;
        color?: cc.Color;
        size: {
            width: number;
            height: number;
        }
    };
}