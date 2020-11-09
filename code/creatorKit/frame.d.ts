/**********************************游戏框架定义******************************/

declare namespace cc {
    export module loader {
        function _getResUuid(url: string, type: typeof cc.Asset, mount: string): string;
        function _getReferenceKey(uuid: string): any;
    }

    export module LogManager {
        function init(tag: string): void;
    }
}

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

interface IAnimat {
    /**动画名称 */
    name: string;
    /**动画资源的路径 */
    url?: string;
    /**延迟播放 */
    delay?: number;
    /**是否循环 */
    loop?: boolean;
    /**迭代播放次数 */
    repeatCount?: number;
    /**播放完成了 */
    played?: boolean;
}

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

interface ISpineAnimat extends IAnimat {
    trackIndex?: number;
}

/**
 * kit是cocos creator kit的缩写，游戏工具箱的主要命名空间，游戏工具箱的所有类和函数都会在这里定义。
 */
declare namespace kit {
    interface IViewController {
        onViewLoaded(view: cc.Node): void;
        onViewDidAppear(): void;
        onViewDidHide(): void;
        onViewDidDisappear(): void;
    }

    export var _LogInfos: object;

    export function log(msg: string | any, ...subst: any[]): void;
    export function warn(msg: any, ...subst: any[]): void;
    export function error(msg: any, ...subst: any[]): void;
    export function info(msg: any, ...subst: any[]): void;
    export function debug(msg: any, ...subst: any[]): void;
    export function assert(condition?: boolean, msg?: string, ...data: any[]): void;

    export var LogID: Function;
    export var WarnID: Function;
    export var ErrorID: Function;

    /**
     * 动画播放管理
     * @param target 目标节点
     */
    export function animat(target: cc.Node): Animat;
    /**
     * 音频播放管理
     * @param props 音频属性 
     */
    export function audio(props: IAudio): Audio;
    /**
     * 事件管理
     * @param target 
     * @param caller 
     */
    export function event(target: cc.Node, caller: any): TargetListener;

    /**
     * 动画播放管理，支持链式结构播放多个不同类型的动画，可以按顺序同时播放帧动画和spine骨骼动画，
     * 可以延迟播放动画，可以抛出错误异常
     */
    export class Animat {
        static readonly create: Animat;
        /**在下一帧停止所有动画播放 */
        static stopAll(): void;
        target(node: cc.Node): Animat;
        /**开始播放 */
        play(): Animat;
        /**停止动画 */
        stop(): Animat;
        /**暂停电画 */
        pause(): Animat;
        /**恢复动画 */
        resume(): Animat;
        /**
         * 播放默认剪辑动画
         * @param delay 
         * @param startTime 
         */
        defaultClip(delay?: number, startTime?: number): Animat;
        /**
         * 把要播放的剪辑动画压入队列中，等待播放
         * @param props 剪辑动画属性
         */
        clip(props: IFrameAnimat): Animat;
        /**
         * 把要播放的spine骨骼动画压入队列中，等待播放
         * @param props 骨骼动画属性
         */
        spine(props: ISpineAnimat): Animat;
         /**
         * 增加动画播放时的回调
         * @param resolved 
         */
        onPlay(resolved: (value: any) => void): Animat;
            /**
         * 增加动画播放结束后的回调
         * @param resolved 
         */
        onStop(resolved: (value: any) => void): Animat;
        /**捕获播放异常的方法，会给回调返回错误信息 */
        catch(rejected: (e: Error) => void): void;
    }

    export class Audio {
        static readonly create: Audio;
        /**
         * 把要播放的音频压入队列中，等待播放
         * @param props 音频属性
         */
        audio(props: IAudio): Audio;
        /**
         * 播放音频时要执行的回调
         * @param callType 回调类型
         * @param resolve 执行的回调
         */
        when<T extends 'play'|'stop', P = T extends 'play'|'stop' ? (currentTime: number) => void : (duration: number) => void>(callType: T, resolve: P): Audio
        /**开始播放音频 */
        play(): Audio;
        /**停止播放 */
        stop(): Audio;
        /**
         * 抛出异常
         * @param reject 
         */
        cath(reject: (e: Error) => void): void;
    }

    export class AutoReleasePool extends EventListeners {
        constructor(name: string = null);
        isClearing(): boolean;
        /**
         * 增加资源对象
         * @param object 资源对象
         */
        addObject(object: Reference): void;
        addAnimateData(key: string, animate: AnimatT): void;
        getObject(key: string): Reference;
        getAnimateData(key: string): AnimatT;
        contains(key: string): boolean;
        /**释放所有锁定的资源 */
        clear(): void;
        delete(key: string): void;
        dump(): void;
    }

    export interface EventListener {
        type: string;
        caller: any;
        useCapture: boolean;
        callback: Function;
    }
    /**
     * 管理注册引擎提供的监听事件，例如 node.on('eventName', function(){}, this) 这类
     */
    export class TargetListener {
        replyValue: any;
        /**
         * 注册目标监听管理对象
         * @param target 
         * @param caller 
         * @example
         * TargetListener.listener(node, this).type('test_event').onCall(function() {});
         */
        static listener(target: cc.Node, caller: any): TargetListener;
        targetListeners(target: cc.Node): EventListener[];
        type(_type: string): TargetListener;
        target(_target: cc.Node): TargetListener;
        caller(_caller: any): TargetListener;
        capture(_useCapture: boolean): TargetListener;
        customData(data: any): TargetListener;
        click(handler: string): TargetListener;
        slider(handler: string): TargetListener;
        toggle(handler: string): TargetListener;
        editReturn(handler: string): TargetListener;
        editDidEnded(handler: string): TargetListener;
        textChanged(handler: string): TargetListener;
        editDidBegan(handler: string): TargetListener;
        onMouseEnter(callback: Function): TargetListener;
        onMouseLeave(callback: Function): TargetListener;
        onMouseDown(callback: Function): TargetListener;
        onMouseMove(callback: Function): TargetListener;
        onMouseUp(callback: Function): TargetListener;
        onMouseWheel(callback: Function): TargetListener;
        onStart(callback: (event: cc.Event.EventTouch) => void): TargetListener;
        onMove(callback: (event: cc.Event.EventTouch) => void): TargetListener;
        onEnd(callback: (event: cc.Event.EventTouch) => void): TargetListener;
        onCancel(callback: (event: cc.Event.EventTouch) => void): TargetListener;
        onCall(callback: Function): TargetListener;
        offMouseEnter(): void;
        offMouseDown(): void;
        offMouseLeave(): void;
        offMouseMove(): void;
        offMouseUp(): void;
        offMouseWheel(): void;
        offStart(): void;
        offMove(): void;
        offEnd(): void;
        offCancel(): void;
        offCall(): void;
        dispatch(type: string, data?: any, reply?: (res: any) => void): void;
        emit(type: string, arg1?: any, arg2?: any, arg3?: any, arg4?: any, arg5?: any): void;
    }

    export class PoolManager extends EventListeners {
        readonly static Instance: PoolManager;
        static purgePoolManager(): void;
        static destroyPoolManager(): void;
        getCurrentPool(): AutoReleasePool;
        push(pool: AutoReleasePool): void;
        pop(): AutoReleasePool;
        isObjectInPools(object: Reference): boolean;
    }

    export class EventName {
        static RELEASE: string;
        static RETAIN: string;
        /**资源释放前 */
        static DESTROYED_BEFORE: string;
        /**资源释放后 */
        static DESTROYED_AFTER: string;
    }

    export class Reference extends EventListeners {
        /**对象key值 */
        Key: string;
        retain(): void;
        release(): void;
        /**把资源增加到自动释放池里 */
        autoRelease(): Reference;
        /**返回当前引用计数 */
        getReferenceCount(): number;
        isDestroyed(): boolean;
        protected destroy(): void;
    }

    /**
     * author: HePeiDong
     * date: 2019/9/11
     * name: 加载资源类
     * description: 资源管理模块，加载资源，对加载的资源进行引用技术管理，包括解析预制体
     */
    export class Loader extends EventListeners {
        /**
         * 从远程或本地加载一个资源
         * @param url 资源路径
         * @param progressFn 进度回调函数
         * @param completeFn 加载成功回调函数
         * @param isLock 是否锁定资源
         */
        static load(url: string | string[] | { url?: string, type?: string }, progressFn: (completedCount: number, totalCount: number, item: any) => void, completeFn: Function | null, isLock?: boolean): void;
        static load(url: string | string[] | { url?: string, type?: string }, completeFn: (err: Error, asset: any) => void, isLock?: boolean): void;

        /**
         * 从resources文件夹中加载资源
         * @param url 资源相对路劲
         * @param type 资源类型
         * @param progressFn 进度回调函数
         * @param completeCallback 加载成功回调函数
         * @param isLock 是否锁定资源
         */
        static loadRes(url: string, type: typeof cc.Asset, progressFn: (completedCount: number, totalCount: number, item: any) => void, completeCallback: ((error: Error, resource: any) => void) | null, isLock?: boolean): void;
        static loadRes(url: string, type: typeof cc.Asset, completeFn: (error: Error, resource: any) => void, isLock?: boolean): void;
        static loadRes(url: string, type: typeof cc.Asset, isLock?: boolean): void;
        static loadRes(url: string, progressFn: (completedCount: number, totalCount: number, item: any) => void, completeCallback: ((error: Error, resource: any) => void) | null, isLock?: boolean): void;
        static loadRes(url: string, completeFn: (error: Error, resource: any) => void, isLock?: boolean): void;
        static loadRes(url: string, isLock?: boolean): void;

        /**
         * 加载resources目录下某个文件夹的全部资源
         * @param url 资源相对路劲
         * @param type 资源类型
         * @param progressFn 进度回调函数
         * @param completeCallback 加载成功回调函数
         * @param isLock 是否锁定资源
         */
        static loadResDir(url: string, type: typeof cc.Asset, progressFn: (completedCount: number, totalCount: number, item: any) => void, completeCallback: ((error: Error, resource: any[], urls: string[]) => void) | null, isLock?: boolean): void;
        static loadResDir(url: string, type: typeof cc.Asset, completeFn: (error: Error, resource: any[], urls: string[]) => void, isLock?: boolean): void;
        static loadResDir(url: string, type: typeof cc.Asset, isLock?: boolean): void;
        static loadResDir(url: string, progressFn: (completedCount: number, totalCount: number, item: any) => void, completeCallback: ((error: Error, resource: any[], urls: string[]) => void) | null, isLock?: boolean): void;
        static loadResDir(url: string, completeFn: (error: Error, resource: any[], urls: string[]) => void, isLock?: boolean): void;
        static loadResDir(url: string, isLock?: boolean): void;

        /**
         * 同时加载resources目录下的多个资源
         * @param url 资源相对路劲
         * @param type 资源类型
         * @param progressFn 进度回调函数
         * @param completeCallback 加载成功回调函数
         * @param isLock 是否锁定资源 
         */
        static loadResArray(url: string[], type: typeof cc.Asset, progressFn: (completedCount: number, totalCount: number, item: any) => void, completeCallback: ((error: Error, resource: any[]) => void) | null, isLock?: boolean): void;
        static loadResArray(url: string[], type: typeof cc.Asset, completeFn: (error: Error, resource: any[]) => void, isLock?: boolean): void;
        static loadResArray(url: string[], type: typeof cc.Asset, isLock?: boolean): void;
        static loadResArray(url: string[], progressFn: (completedCount: number, totalCount: number, item: any) => void, completeCallback: ((error: Error, resource: any[]) => void) | null, isLock?: boolean): void;
        static loadResArray(url: string[], completeFn: (error: Error, resource: any[]) => void, isLock?: boolean): void;
        static loadResArray(url: string[], isLock?: boolean): void;

        static instanitate(url: string, original: cc.Prefab): cc.Node;
        /**
         * 设置结点的资源
         * @param target 目标结点
         * @param compType 组件类型
         * @param url 资源相对路劲
         * @param isLock 是否锁定
         */
        static setResource(target: cc.Node, 
            compType:   typeof cc.Sprite | 
                        typeof cc.Button | 
                        typeof cc.Mask | 
                        typeof cc.PageViewIndicator | 
                        typeof cc.EditBox | 
                        typeof cc.Label | 
                        typeof cc.RichText | 
                        typeof cc.ParticleSystem, 
            url: string | { normal: string, pressed: string, hover: string, disabled: string }, isLock?: boolean): void;

        /**
         * 设置节点动画
         * @param target 目标结点
         * @param url 资源相对路劲
         * @param compType 组件类型
         * @param complete 成功后执行的回调
         * @param isLock 是否锁定
         */
        static setAnimat(target: cc.Node, url: string, compType: typeof cc.Animation | typeof sp.Skeleton, complete: (asset: any) => void, isLock?: boolean): void;
        /**
         * 释放被锁定的动态资源
         */
        static gc(): void
        /**
         * 获取已加载的资源key值信息
         * @param url 资源路劲
         * @param type 资源类型
         */
        static getRes(url: string, type: typeof cc.Asset): Resource;
        /**
         * 引用计数加一
         * @param url 资源路劲
         * @param type 资源类型
         */
        static retain(url: string, type: typeof cc.Asset): void;
        /**
         * 引用计数减一
         * @param url 资源路劲
         * @param type 资源类型
         */
        static release(url: string, type: typeof cc.Asset): void;
        static makeKey(url: string, type: typeof cc.Asset): string;
        /**
         * 返回被引用计数记录的缓存资源
         * @param url 资源路劲
         * @param type 资源类型
         */
        static getCacheRes(url: string, type: typeof cc.Asset): any;
        static finishedLoad(url: string, type: typeof cc.Asset, isLock: boolean): void;
    }

    export class Handler {
        constructor(caller: any, method: Function, args: Array<any>, once: boolean);

        /**
         *创建回调处理类对象
         * @param caller 执行域
         * @param method 回调函数
         * @param args 参数
         * @param once
         * @returns {Handler}
         */
        static create(caller: any, method: Function, args: Array<any>, once: boolean): Handler;

        /**
         * 回调执行函数
         * @param data
         * @returns {any}
         */
        apply(data: any): any;
        /** @public 是否只执行一次 */
        get once(): boolean;
        /** @public 回调函数 */
        get method(): Function;
        /** @public 执行域 */
        get caller(): any;
    }

    export class EventListeners {
        hasListener(type: string): boolean;
        emit(type: string, data: any = null): boolean;
        /**
         * 注册事件监听,可以多次响应
         * @param type 事件类型
         * @param caller 事件注册者
         * @param listener 监听函数
         * @param args 参数列表
         */
        on(type: string, caller: any, listener: Function, args: Array<any> = null): EventListeners;
        /**
         * 注册事件监听，只响应一次
         * @param type 事件类型
         * @param caller 事件注册者
         * @param listener 监听函数
         * @param args 参数列表
         */
        once(type: string, caller: any, listener: Function, args: Array<any> = null): EventListeners;
        /**
         * 注销事件
         * @param type 事件类型
         * @param caller 事件注册者
         * @param listener 监听函数
         * @param once 是否注销单词响应事件
         */
        off(type: string, caller: any, listener: Function, once: boolean = false): EventListeners;
        /**
         * 注销所有事件
         * @param type 事件类型
         */
        offAll(type: string = null): EventListeners;
        /**
         * 通过事件注册者注销所有事件
         * @param caller 事件注册者
         */
        offAllCaller(caller: any): EventListeners;
    }

    export class Resource extends Reference {
        /**
         * 创建资源对象
         * @param key 资源key值
         * @param isLock 锁定资源
         */
        static create(key: string, isLock: boolean): Resource;
        /**记录依赖资源 */
        addDepend(dep: string): void;
        hasDepend(key: string): boolean;
        /** @public 是否加锁，加锁则需要手动释放 */
        isLock: boolean;
        onDestroy(): void;
        release(): void;
        retain(): void;
    }

    export abstract class Controller extends EventListeners {
        protected _isRootView: boolean;
        /**视图节点 */
        readonly node: cc.Node;

        /**具体控制器实现退出的方式，隐藏或者销毁 */
        abstract exitView(cleanup?: boolean): void;
        /***************控制器生命周期函数***************/
        /**试图加载完调用 */
        protected onViewLoaded(): void {}
        /**试图显示后调用 */
        protected onViewDidAppear(): void {}
        /**试图隐藏后调用 */
        protected onViewDidHide(): void {}
        /**试图销毁后调用 */
        protected onViewDidDisappear(): void {}

        protected loaded(): void;
        /**
         * 获取图集里面的精灵帧
         * @param fileName 图片文件名 
         */
        protected getSpriteFrame(fileName: string): cc.SpriteFrame;
        hideView(): void;
        showView(): void;
        /**销毁视图 */
        destroy(cleanup: boolean): void;
        /**加载视图 */
        protected loadView(fn: () => void): void;
    }

    /**
     * author: HePeiDong
     * date: 2019/9/13
     * name: 层级管理器
     */
    export class LayerManager extends kit.EventListeners {
        /**
         * 增加到上方窗口
         * @param controller 视图控制器
         * @param nextTo 是否紧挨着屏幕边缘
         */
        addToUpWindow(controller: UIViewController, nexTo: boolean = false): void;

        /**
         * 增加到下方窗口
         * @param controller 视图控制器
         * @param nextTo 是否紧挨着屏幕边缘
         */
        addToDownWindow(controller: UIViewController, nexTo: boolean = false): void;

        /**
         * 增加到左边窗口
         * @param controller 视图控制器
         * @param nextTo 是否紧挨着屏幕边缘
         */
        addToLeftWindow(controller: UIViewController, nexTo: boolean = false): void;

        /**
         * 增加到右边窗口
         * @param controller 视图控制器
         * @param nextTo 是否紧挨着屏幕边缘
         */
        addToRightWindow(controller: UIViewController, nexTo: boolean = false): void;

        /**
         * 增加到中间窗口
         * @param controller 视图控制器
         */
        addToCenterWindow(controller: UIViewController): void;

        /**
         * 增加到左上窗口
         * @param controller 视图控制器
         * @param nextTo 是否紧挨着屏幕边缘
         */
        addToUpperLWindow(controller: UIViewController, nexTo: boolean = false): void;

        /**
         * 增加到右上窗口
         * @param controller 视图控制器
         * @param nextTo 是否紧挨着屏幕边缘
         */
        addToUpperRWindow(controller: UIViewController, nexTo: boolean = false): void;

        /**
         * 增加到左下窗口
         * @param controller 视图控制器
         * @param nextTo 是否紧挨着屏幕边缘
         */
        addToLowerLWindow(controller: UIViewController, nexTo: boolean = false): void;

        /**
         * 增加到右下窗口
         * @param controller 视图控制器
         * @param nextTo 是否紧挨着屏幕边缘
         */
        addToLowerRWindow(controller: UIViewController, nexTo: boolean = false): void;

    }

    export class WindowView {
        static readonly Instance: WindowView;
        /**
         * 增加根视图
         * @param node 根视图结点
         */
        addRootWindow(node: cc.Node): void;

        /**
         * 增加中间窗口
         * @param node 视图结点
         */
        addCenterWindow(node: cc.Node): void;

        /**
         * 增加顶层窗口
         * @param node 视图结点
         */
        addTopWindow(node: cc.Node): void;
    }

    /**
     * 循环队列
     */
    export interface Vector<T> {
        [Symbol.iterator](): IterableIterator<T>;
        readonly length: number;
        constructor(capacity: number = 50): Vector<T>;
        /**
         * 队列的容量
         * @param capacity 容量
         * @param autoDilt 是否自动扩容
         * @constructor
         */
        reserve(capacity: number, autoDilt: boolean = false): void;
        /**
         * 入队列
         * @param e 入队的元素
         * @returns {boolean}
         * @constructor
         */
        push(e: T): boolean;
        /**
         * 出列，然后删除对顶元素
         * @returns {any}
         * @constructor
         */
        pop(): T|undefined;
        /**
         * 出列，不删除对顶元素
         * @param index
         * @returns {T}
         * @constructor
         */
        back(index: number = this._front): T|undefined;
        isEmpty(): boolean;
        isFull(): boolean;
        clear(): void;
        contains(e: T): boolean;
        [n: number]: T;
    }

    export interface VectorContructor<T> {
        new(capacity?: number): any[];
        new<T>(capacity: number): T[];
        (capacity?: number): any[];
        <T>(capacity: number): T[];
        readonly prototype: Vector<T>;
    }

    export var Vector: VectorContructor;

    /**优先队列
     * 优先队列采用二叉堆存储结构（数组存储结构的二叉树），优先从左节点存储数据，第一个根节点默认也存储数据（这个可以改成第一个结点不存储数据的没问题）
     * 优先级规则可以自由的设定，通过new PriorityQueue<T>((a, b) => { return a > b; })这种模式，传入优先级规则
     * 若传入的规则中a > b，则是从大到小排列，反之，从小到大排列
     */
    export interface PriorityQueue<T> {
        [Symbol.iterator](): IterableIterator<T>;
        length: number;
        /**
         * 压入元素，从左子树开始，左子树在数组中的下标为2*i+1，因此相应的父节点下标为(i-1)/2，右子树的下标为2*i+2，相应的父节点下标为(i-2)/2
         * @param e 压入的元素
         */
        push(e: T): void;
        /**
         * 出队列，把队列的根节点删除，并返回删除的元素，删除的过程是把根节点不断的下沉到最后的位置，然后删除最后一个元素
         */
        pop(): T | undefined;
        Front(): T | undefined;
        delete(index: number): T;
        clear(): void;
        [n: number]: T;
    }

    export interface QueueConstructor<T> {
        new(compareFn: (a: T, b: T) => boolean): any[];
        new <T>(compareFn: (a: T, b: T) => boolean): T[];
        (compareFn: (a: T, b: T) => boolean): any[];
        <T>(compareFn: (a: T, b: T) => boolean): T[];
        readonly prototype: PriorityQueue<T>;
    }

    export var PriorityQueue: QueueConstructor;

    /**
     * 数据存储，把数据存储到缓存里，区分数据类型
     */
    export class UserDefault {
        readonly static Instance: UserDefault;
        /**
         * 存储缓存数据
         * @param key 键
         * @param value 值
         */
        static set(key: string, value: any): void;
        /**
         * 获取缓存数据
         * @param key 
         */
        static get(key: string): any;
        /**
         * 实例化优先队列
         * @param comparefn 优先级规则
         */
        static getPriorityQueue<T extends kit.PriorityQueue<T>>(comparefn: (a: T, b: T) => boolean): kit.PriorityQueue<T>;
        /**
         * 实例化队列
         * @param len  
         */
        static getVector<T extends kit.Vector<T>>(len?: number): kit.Vector<T>;
    }

    export class AutoRelease extends cc.Component {
        /**
         * 记录预制体资源
         * @param url 
         */
        recordPrefabRes(url: string): void;
        /**
         * 修改节点引用的资源
         * @param url 资源路劲
         * @param compType 组件类型
         * @param isLock 是否为静态资源
         */
        source(url: string | { normal: string, pressed: string, hover: string, disabled: string }, compType: typeof cc.Component, isLock?: boolean): void;
        /**
         * 修改结点动画资源
         * @param url 资源路劲
         * @param compType 动画组件类型 
         * @param complete 完成后调用回调
         * @param isLock 是否为静态资源
         */
        animation(url: string, compType: typeof cc.Component, complete: (asset: any) => void, isLock?: boolean): void;
        /**
         * 设置资源路劲
         * @param url 
         * @param comp 
         */
        setResUrl(url: string, comp: cc.Sprite | cc.Button | cc.Mask | cc.PageViewIndicator | cc.EditBox | cc.Label | cc.RichText | cc.ParticleSystem): void;
    }
    export class FileContainer<T extends DataTable> {
        length: number;
        get(id: number): any;
        add(id: any, value: any): void;
        del(id: any): boolean;
        contains(id: any): boolean;
    }
    /**
     * 配置表管理父类，负责配置表的读取存储
     * @example 
     * class FileManager extends GameFileManager {
     *      constructor() {
     *         super();
     *         this.addGameTable('npcs', NpcsTable);
     *      }
     * 
     *      public get npcs(): kit.FileContainer<NpcsTable> {
     *          return this.get(NpcsTable);
     *      }
     * 
     *      private static _ins: FileManager = null;
     *      public static get Instance(): FileManager {
     *           return this._ins = this._ins ? this._ins : new FileManager();
     *      }
     * }
     */
    export class GameFileManager {
        addGameTable(name: string, tableType: typeof DataTable): void;
        get<T extends DataTable>(type: {prototype: T}): FileContainer<T>;
        getById<T extends DataTable>(type: {prototype: T}, id: number): FileContainer<T>;
        /**
         * 加载配置表
         * @param url 配置表目录的路劲
         * @param progressfn 加载进度回调
         * @param completefn 加载完成回调
         */
        loadCSVTable(url: string, progressfn?: (completedCount: number, totalCount: number) => void, completefn?: (error: Error) => void): void;
    }


    ///////////////////////////////////通用组件///////////////////////////
    /**
     * 多分辨率适配组件
     */
    export class AdapterHelper extends cc.Component {
        /**启用自动适配 */
        autoAdapter: boolean;
    }
    export module AdapterContent {
        /**适配的内容偏移类型 */
        export enum OffsetType {
            NONE,
            TOP,
            RIGHT,
            DOWN,
            LEFT,
            UPPER_RIGHT,
            LOWER_RIGHT,
            LOWER_LEFT,
            UPPER_LEFT
        }
    }
    export class AdapterZoom {
        /**根据适配后缩放该节点的X轴 */
        zoomX: boolean;
        /**根据适配后缩放该节点的Y轴 */
        zoomY: boolean
    }
    /**
     * 内容适配组件
     */
    export class AdapterContent extends cc.Component {
        /**适配刘海屏 */
        adapterBang: boolean;
        /**设置节点的适配偏移 */
        adapterOffset: AdapterContent.OffsetType;
        /**该节点会根据适配后进行缩放背景节点 */
        zoom: boolean;
        /**适配该节点的大小 */
        adapterSize: AdapterZoom;
    }
    /**
     * banner广告组件
     */
    export class BannerAd extends cc.Component {
        /**广告位权限ID */
        adUnitId: string;
        /**隐藏广告位 */
        hide(): void;
    }
    /**
     * 适配广告组件
     */
    export class VideoAd extends cc.Component {
        adUnitId: string;
    }
    export class WindowHelper extends cc.Component {
        /**弹起窗口 */
        popup(): void;
        /**关闭窗口 */
        close(): void;
        /**弹起窗口时执行的回调 */
        setStartListener(listaner: Function): void;
        /**弹起窗口后执行的回调 */
        setCompleteListaner(listaner: Function): void;
    }
}

declare namespace utils {
    export class NumberUtil {
        /**
         * 四舍五入取整
         * @param num 要操作的数
         * @param keep 保留几位小数点，默认是0
         */
        static round(num: number, keep?: number): number;
        /**
         * 取随机数
         * @param min 最小值  
         * @param max 最大值
         */
        static random(min: number, max: number): number;
        /**
         * 在某一区间取随机整数
         * @param min 最小值  
         * @param max 最大值
         */
        static randomInt(min: number, max: number): number;
        /**
         * 数字取整，整千，整万这类
         * @param num 数字
         * @param units 单位，从百单位开始，0：百，1：千，2：万，3：亿
         */
        static roundNumber(num: number, units?: number): number;
        /**
         * 取整后的数字格式，形式为 5十万这类
         * @param num 数字
         * @param units 单位，从百单位开始，0：百，1：千，2：万，3：十万，以此类推
         */
        static numberFormat(num: number, units?: number): string;
        /**
         * 格式化操作数字，结果为科学计数法
         * @param num 
         */
        static decimalFormat(num: number): string;
        /**
         * 是否为素数
         * @param num 
         */
        static isPrime(num: number): boolean;
        /**
         * 返回某个数以内的所有素数
         * @param num 
         */
        static findPrime(num: number): number[];
    }

    export class StringUtil {
        /**
         * 日志格式
         * @param logTag 标签
         */
        static logFormat(logTag?: string): string;
        /**
         * 构建字符串格式，例如：
         * format('[%s-%s-%s]', 2020, 05, 01);
         * @param strFm 字符串格式
         * @param replaceValue 替换的值
         */
        static format(strFm: string, ...replaceValue: any[]): string;
        /**
         * 字符串判空
         * @param str 需要判空的字符串
         * @param blank 为true时，空格字符算有效字符，反之，空格字符不算有效字符
         */
        static isEmpty(str: string, blank?: boolean): boolean;
        /**
         * 获取指定长度的随机字符串
         * @param len 
         */
        static randomString(len: number): string;
        /**
         * 指定字符串是否以某个子串结尾
         * @param parent 
         * @param child 
         */
        static stringEndWith(parent: string, child: string): boolean;
        /**
         * 判断字符串是否有中文
         * @param str 
         */
        static isChinese(str: string): boolean;
        /**
         * 字符串截取，中英文都能用
         * @param str: 被截取的字符串
         * @param len: 要截取的长度
         */
        static cutOut(str: string, len: number): string;
        /**
         * 字符串长度，会自动把中文转化为字符计算
         * @param str 
         */
        static getLen(str: string): number;
        /**取得浏览器下当前地址的参数 */
        static getURLParams(): any;
    }

    export class DateUtil {
        /**
         * 在CD时间内
         * @param internal CD时间长度
         * @param id CD编号
         */
        static inCD(internal: number, id?: any): boolean;
        /**
         * 比较两个日期
         * @param date1 
         * @param date2 
         */
        static comparingDate(date1: Date, date2: Date): boolean;
        /**
         * 
         * @param tm 时间戳
         * @param format 自定义时间格式，如果传入格式为格式为YYYY-MM-DDTHH:MM:SS的具体时间，将会返回YYYY-MM-DD HH:MM:SS，
         * @example 
         * DateUtil.dateFormat('%s-%s-%s %s:%s:%s'); //2020-05-20 23:00:00
         * DateUtil.dateFormat('[%s/%s/%s %s:%s:%s]'); //[2020/05/20 23:00:00]
         */
        static dateFormat(tm: number, format: string): string;
        static dateFormat(tm: number): string;
        static dateFormat(format: string): string;
        static dateFormat(): string;
        /**
        * 判断是否在某个时间内
        * @param  now 
        * @param  start
        * @param  end 
        */
        static atThisTime(now: Date, start: string, end: string): boolean;
    }

    export var DateUtil: {
        readonly ONE_MINUTE: number;
        readonly ONE_HOUR: number;
        readonly ONE_DAY: number;
        readonly ONE_MONTH: number;
        readonly ONE_YEAR: number;
    }

    export class EngineUtil {
        static addClickEvent(node: cc.Node, target: cc.Node, component: string, handler: string, data?: any): void;
        static addSlideEvent(node: cc.Node, target: cc.Node, component: string, handler: string, data?: any): void;
        static addToggleEvent(node: cc.Node, target: cc.Node, component: string, handler: string, data?: any): void;
        static addEditReturnEvent(node: cc.Node, target: cc.Node, component: string, handler: string, data?: any): void;
        static addEditDidEnded(node: cc.Node, target: cc.Node, component: string, handler: string, data?: any): void;
        static addTextChanged(node: cc.Node, target: cc.Node, component: string, handler: string, data?: any): void;
        static addEditDidBegan(node: cc.Node, target: cc.Node, component: string, handler: string, data?: any): void;
        static loadImage(target: cc.Node, url: string, type?: string): void;
        /**
         * 某一个节点其坐标点是否在另一节点矩形内
         * @param target 目标节点
         * @param currNode 当前节点
         * @param rect 目标节点2D矩形
         */
        static inersectJudge(target: cc.Node, currNode: cc.Node, targetRect?: cc.Rect): boolean
        /**
         * 从一个父节点坐标系转换到另一个父节点坐标系
         * @param {any} fromParent 当前父节点
         * @param {any} toParent 目标父节点
         * @param {any} position 需要转换的位置
         */
        static convertPosition(fromParent: cc.Node, toParent: cc.Node, position: cc.Vec2): cc.Vec2
        /**
         * 转换到微信小游戏坐标系，转换后的坐标是以右上角为原点
         * @param position 要转换的坐标点
         */
        static convertToWechatSpace(position: cc.Vec2): cc.Vec2;
        static convertToWechatSpaceAR(rect: cc.Rect): cc.Vec2;
        /**
         * 微信坐标转换为Cocos坐标
         * @param wxPosition 微信坐标位置
         */
        static wechatSpaceToCCSpace(wxPosition: cc.Vec2): cc.Vec2;
        /**
         * 把节点位置坐标转换到另一个节点坐标系下
         * @param fromTarget 
         * @param toTarget 
         */
        static positionConvert(fromTarget: cc.Node, toTarget: cc.Node): cc.Vec2;
        /**
         * 计算两点距离
         * @param v1 
         * @param v2 
         */
        static distance(v1: cc.Vec3, v2: cc.Vec3): number;
        /**
         * 设置节点的显示状态，建议在节点有绑定的脚本组件，并且脚本组件实现了onDisable和onEnable回调时调用
         * @param target 
         * @param state 
         * @example 
         * EngineUtil.active(node, true);
         */
        static active(target: cc.Node, state: boolean): void;
        /**
         * 设置节点的显示状态，必须在节点没有脚本组件实现onDisable和onEnable回调时调用
         * @param target 
         * @param state 
         * @example
         * EngineUtil.hide(node, true);
         */
        static hide(target: cc.Node, state: boolean): void;
        /**
         * 设置节点的显示状态，建议在有子节点有绑定的脚本组件，并且脚本组件实现了onDisable和onEnable回调时调用
         * @param target 
         * @param state 
         * @example
         * EngineUtil.activeAllChild(node, true);
         */
        static activeAllChild(target: cc.Node, state: boolean): void;
        /**
         * 设置节点的显示状态，必须在所有子节点没有脚本组件实现onDisable和onEnable回调时调用
         * @param target 
         * @param state 
         * @example
         * EngineUtil.hideAllChild(node, true);
         */
        static hideAllChild(target: cc.Node, state: boolean): void;
    }

    export class ObjectUtil {
        static copyMemory(fArray: any[], start: number, copyCount: number): any[];
        static contain(obj: object, comparefn: (element: any) => boolean): boolean;
        static indexOf(array: any[], comparefn: (element: any) => boolean): number;
        static keyOf(obj: object, comparefn: (element: any) => boolean): any
    }

    export class HttpUtil {
        /**
         * GET请求
         * @param path 请求相对地址
         * @param data 请求参数
         */
        static httpGet(path: string, data: any): Promise<any>;
        /**
         * POST请求
         * @param path 请求相对地址
         * @param data 请求参数 
         */
        static httpPost(path: string, data: any): Promise<any>;
        /**
         * 
         * @param url 
         * @param callback 
         * @param caller 
         * @param readAsUtf8 
         */
        static downJSONFile(url: string, caller: any, readAsUtf8?: boolean): Promise<any>;
    }
}

class Reference {
}
class Controller {
}

/**
 * 宏定义函数
 * @param name 宏名称
 * @param defaultValue 宏的值
 */
declare function define(name: string, defaultValue: any): void;
/**
 * 判断宏是否定义
 * @param name 宏名称
 */
declare function ifDefined(name): boolean;
/**启动游戏框架 */
declare var ENABLE: boolean;
/**调试模式 */
declare var DEBUG: boolean;
/**在web端调试游戏 */
declare const IN_WEB_DEBUG: boolean;
/**断言调试方法 */
declare function ASSERT(_Expression1: boolean, _Expression2: string = ''): void;
/**安全减少资源引用计数 */
declare function SAFE_RELEASE(_Obj: Reference): void;
/**安全减少资源引用计数，引用计数为0，把对象赋值null */
declare function SAFE_RELEASE_NULL(_Obj: Reference): void;
/**安全增加引用计数 */
declare function SAFE_RETAIN(_Obj: Reference): void;
/**安全加入自动释放池 */
declare function SAFE_AUTORELEASE(_Obj: Reference): void;
/**安全销毁视图 */
declare function SAFE_DESTROY_VIEW(_Obj: Controller): void;
/**安全执行回调 */
declare function SAFE_CALLBACK(callback: Function, ...args: any[]): void;