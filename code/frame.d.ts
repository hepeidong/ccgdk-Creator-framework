class Reference {
    
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
declare var _ENABLE: boolean;  
/**调试模式 */
declare var _DEBUG: boolean;
/**在web端调试游戏 */
declare const _IN_WEB_DEBUG: boolean;
/**内存上限 */
declare const MEMORY_CAP_SIZE: number;
/**设计分辨率宽 */
declare const EXPLOIT_PIXELS_W: number;
/**设计分辨率高 */
declare const EXPLOIT_PIXELS_H: number;
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

/**
 * cf是creator framework的缩写，游戏框架的主要命名空间，游戏框架的所有类和函数都会在这里定义。
 */
declare namespace cf {
    interface IViewController {
        OnViewLoaded(view: cc.Node): void;
        OnViewDidAppear(): void;
        OnViewDidHide(): void;
        OnViewDidDisappear(): void;
    }

    export var _LogInfos: object;

    export function Log(msg: string|any, ...subst: any[]): void;
    export function Warn(msg: any, ...subst: any[]): void;
    export function Error(msg: any, ...subst: any[]): void;
    export function Info(msg: any, ...subst: any[]): void;
    export function Debug(msg: any, ...subst: any[]): void;

    export var LogID: Function;
    export var WarnID: Function;
    export var ErrorID: Function;

    export class PoolManager extends EventListeners {
        static Instance: PoolManager;

        /**@private 资源内存大小总量 */
        memorySize: number;

         /**@private 资源内存上限 */
        readonly memoryCapSize: number;

        static PurgePoolManager(): void;
        static DestroyPoolManager(): void;
        AddAutoRelease(): boolean;
        GetCurrentPool(): AutoReleasePool;
        Push(pool: AutoReleasePool): void;
        Pop(): AutoReleasePool;
        IsObjectInPools(object: Reference): boolean;
    }

    export class EventName {
        static RELEASE: string;
        static RETAIN: string;
        /**资源释放前 */
        static DESTROYED_BEFORE: string;
        /**资源释放后 */
        static DESTROYED_AFTER: string;
        /**设计内存不足 */
        static DESIGN_OUT_OF_MEMORY: string;
    }

    export class Reference extends EventListeners {
        set GroupID(id: number);
        /** @public 设置资源内存大小*/
        memorySize: number;
        Retain(): void;
        Release(): void;
        /**把资源增加到自动释放池里 */
        AutoRelease(): Reference;
        /**返回当前引用计数 */
        GetReferenceCount(): number;
        IsDestroyed(): boolean;
    }

    export class UILoader extends EventListeners {
        /**
         * 从远程或本地加载一个资源
         * @param url 资源路径
         * @param progressFn 进度回调函数
         * @param completeFn 加载成功回调函数
         * @param isLock 是否锁定资源
         */
        static Load(url: string|string[]|{url?: string, type?: string}, progressFn: (completedCount: number, totalCount: number, item: any) => void, completeFn: Function|null, isLock: boolean): void;
        static Load(url: string|string[]|{url?: string, type?: string}, completeFn: (err:Error,asset:any)=>void, isLock: boolean): void;

        /**
         * 从resources文件夹中加载资源
         * @param url 资源相对路劲
         * @param type 资源类型
         * @param progressFn 进度回调函数
         * @param completeCallback 加载成功回调函数
         * @param isLock 是否锁定资源
         */
        static LoadRes(url: string, type: typeof cc.RawAsset, progressFn: (completedCount: number, totalCount: number, item: any) => void, completeCallback: ((error: Error, resource: any) => void)|null, isLock?: boolean): void;
        static LoadRes(url: string, type: typeof cc.RawAsset, completeFn: (error: Error, resource: any) => void, isLock?: boolean): void;
        static LoadRes(url: string, type: typeof cc.RawAsset, isLock?: boolean): void;
        static LoadRes(url: string, progressFn: (completedCount: number, totalCount: number, item: any) => void, completeCallback: ((error: Error, resource: any) => void)|null, isLock?: boolean): void;
        static LoadRes(url: string, completeFn: (error: Error, resource: any) => void, isLock?: boolean): void;
        static LoadRes(url: string, isLock?: boolean): void;

        /**
         * 加载resources目录下某个文件夹的全部资源
         * @param url 资源相对路劲
         * @param type 资源类型
         * @param progressFn 进度回调函数
         * @param completeCallback 加载成功回调函数
         * @param isLock 是否锁定资源
         */
        static LoadResDir(url: string, type: typeof cc.RawAsset, progressFn: (completedCount: number, totalCount: number, item: any) => void, completeCallback: ((error: Error, resource: any[], urls: string[]) => void)|null, isLock?: boolean): void;
        static LoadResDir(url: string, type: typeof cc.RawAsset, completeFn: (error: Error, resource: any[], urls: string[]) => void, isLock?: boolean): void;
        static LoadResDir(url: string, type: typeof cc.RawAsset, isLock?: boolean): void;
        static LoadResDir(url: string, progressFn: (completedCount: number, totalCount: number, item: any) => void, completeCallback: ((error: Error, resource: any[], urls: string[]) => void)|null, isLock?: boolean): void;
        static LoadResDir(url: string, completeFn: (error: Error, resource: any[], urls: string[]) => void, isLock?: boolean): void;
        static LoadResDir(url: string, isLock?: boolean): void;

        /**
         * 同时加载resources目录下的多个资源
         * @param url 资源相对路劲
         * @param type 资源类型
         * @param progressFn 进度回调函数
         * @param completeCallback 加载成功回调函数
         * @param isLock 是否锁定资源 
         */
        static LoadResArray(url: string[], type: typeof cc.RawAsset, progressFn: (completedCount: number, totalCount: number, item: any) => void, completeCallback: ((error: Error, resource: any[]) => void)|null, isLock?: boolean): void;
        static LoadResArray(url: string[], type: typeof cc.RawAsset, completeFn: (error: Error, resource: any[]) => void, isLock?: boolean): void;
        static LoadResArray(url: string[], type: typeof cc.RawAsset, isLock?: boolean): void;
        static LoadResArray(url: string[], progressFn: (completedCount: number, totalCount: number, item: any) => void, completeCallback: ((error: Error, resource: any[]) => void)|null, isLock?: boolean): void;
        static LoadResArray(url: string[], completeFn: (error: Error, resource: any[]) => void, isLock?: boolean): void;
        static LoadResArray(url: string[], isLock?: boolean): void;

        static Instanitate(original: any, isLock: boolean = false): cc.Node;
        /**
         * 设置结点的资源
         * @param target 目标结点
         * @param compType 组件类型
         * @param url 资源相对路劲
         * @param isLock 是否锁定
         */
        static SetResource(target: cc.Node, compType: any, url: string|{normal: string, pressed: string, hover: string, disabled: string}, isLock: boolean = false): void;
        /**
         * 释放被锁定的动态资源
         */
        static Gc(): void
        /**
         * 获取已加载的资源key值信息
         * @param url 资源路劲
         */
        static GetRes(url: string): Resource;
        /**
         * 引用计数加一
         * @param url 资源路劲
         */
        static Retain(url: string): void;
        /**
         * 引用计数减一
         * @param url 资源路劲
         */
        static Release(url: string): void;
    }

    export class Handler {
        constructor(caller: any, method: Function, args:  Array<any>, once: boolean);
    
        /**
         *创建回调处理类对象
         * @param caller 执行域
         * @param method 回调函数
         * @param args 参数
         * @param once
         * @returns {Handler}
         */
        static create(caller: any, method: Function, args:  Array<any>, once: boolean): Handler;
    
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
        HasListener(type: string): boolean;
        Emit(type: string, data: any = null): boolean;
        /**
         * 注册事件监听,可以多次响应
         * @param type 事件类型
         * @param caller 事件注册者
         * @param listener 监听函数
         * @param args 参数列表
         */
        On(type:string, caller:any, listener:Function, args: Array<any> = null): EventListeners;
        /**
         * 注册事件监听，只响应一次
         * @param type 事件类型
         * @param caller 事件注册者
         * @param listener 监听函数
         * @param args 参数列表
         */
        Once(type:string, caller:any, listener:Function, args: Array<any> = null): EventListeners;
        /**
         * 注销事件
         * @param type 事件类型
         * @param caller 事件注册者
         * @param listener 监听函数
         * @param once 是否注销单词响应事件
         */
        Off(type:string, caller:any, listener:Function, once: boolean = false): EventListeners;
        /**
         * 注销所有事件
         * @param type 事件类型
         */
        OffAll(type:string = null):EventListeners;
        /**
         * 通过事件注册者注销所有事件
         * @param caller 事件注册者
         */
        OffAllCaller(caller: any): EventListeners;
    }

    export class Resource extends cf.Reference {
        /** @public 资源的key值*/
        set Key(value: string);
        /** @public 资源的key值*/
        gKey:string;
        /** @public 是否加锁，加锁则需要手动释放 */
        set IsLock(is: boolean);
        /** @public 是否加锁，加锁则需要手动释放 */
        IsLock: boolean;
        OnDestroy(): void;

    }

    export class MainViewController {
        static Instance: MainViewController;
        set rootViewController(controller: RootViewController);
    
        AddTopWindow(controller: UIViewController): void;

        AddDownWindow(controller: UIViewController): void;

        AddLeftWindow(controller: UIViewController): void;

        AddRightWindow(controller: UIViewController): void;

        AddCentreWindow(controller: UIViewController): void;

        HideView(): void;

        Destroy(): void;
    }

    export abstract class RootViewController extends UIControl implements IViewController {
        /***************控制器生命周期函数***************/
        /**试图加载完调用 */
        abstract OnViewLoaded(view: cc.Node): void;
        /**试图显示后调用 */
        abstract OnViewDidAppear(): void;
        /**试图隐藏后调用 */
        abstract OnViewDidHide(): void;
        /**试图销毁后调用 */
        abstract OnViewDidDisappear(): void;
        /**
         * 视图加载显示 
         * @param fn 加载成功显示后的回调，默认是不传入回调，为null
         * @param waitView 资源加载的面板
         */
        ViewLoad(fn: () => void = null, waitView: RootViewController = null): void;
        /**隐藏视图 */
        HideView(): void;
        /**销毁视图 */
        Destroy(): void;
    }

    export abstract class UIControl implements IControl {
        protected _isRootView: boolean;
        /**是否是根视图 */
        isRootView: boolean;
        /**优先级 */
        priority: number;
        /**
         * 设置基本信息，资源路劲参数的格式
         * @param url 资源路劲
         */
        protected SetResUrl(url: string): void;
        /**
         * 绑定Ui（预制体）
         * @param url ui（预制体）的路劲
         */
        protected UiBinding(url: string): void;
        /**
         * 获取图集里面的精灵帧
         * @param fileName 图片文件名 
         */
        protected GetSpriteFrame(fileName: string): cc.SpriteFrame;
        /**销毁视图 */
        protected Destroy(): void;
        /**加载视图 */
        protected LoadView(fn: () => void): void;
    }

    export abstract class UIViewController extends UIControl implements IViewController {
        /**不增加到窗口视图中 */
        static NONE: number = 0;
        /**增加到上窗口视图中 */
        static ON_THE_TOP: number = 1;
        /**增加到下窗口视图中 */
        static ON_THE_DOWN: number = 2;
        /**增加到左窗口视图中 */
        static ON_THE_LEFT: number = 3;
        /**增加到右窗口视图中 */
        static ON_THE_RIGHT: number = 4;
        /**增加到中间窗口视图中 */
        static ON_THE_CENTRE: number = 5;
        /**视图结点 */
        view: cc.Node;
        /**功能id */
        protected accessId: number;
        /** */
        protected closeOther: boolean;
        /**
         * 打开试图
         * @param accessId 访问id，一般用于判断该id对应下的功能是否开启
         * @param closeOther 是否关闭别的页面
         * @param winPos 窗口视图的位置，默认为NONE,当传入的值不为NONE时，不需要传入父节点参数，反之则必须传入
         * @param parent 父节
         * @param fn 加载成功显示后的回调，默认是不传入回调，为null
         * @param waitView 资源加载的面板
         */
        OpenView(accessId: number = 0, closeOther: boolean = false, winPos: number = UIViewController.NONE, parent: cc.Node = null, fn: () => void = null, waitView: UIViewController = null): void;
        /**隐藏试图 */
        HideView(): void;
        /**
         * 销毁试图
         * @param cleanup 是否删除试图上面绑定的事件，action等，默认值是true
         */
        Destroy(cleanup: boolean = true): void;
        /***************控制器生命周期函数***************/
        /**试图加载完调用 */
        abstract OnViewLoaded(view: cc.Node): void;
        /**试图显示后调用 */
        abstract OnViewDidAppear(): void;
        /**试图隐藏后调用 */
        abstract OnViewDidHide(): void;
        /**试图销毁后调用 */
        abstract OnViewDidDisappear(): void;
    }

    export class UIWindow extends cf.EventListeners {
        set rootViewController(root: RootViewController);
        get rootViewController(): RootViewController;
        Init(): boolean;
        AddTopWindow(controller: UIViewController): void;
        AddDownWindow(controller: UIViewController): void;
        AddLeftWindow(controller: UIViewController): void;
        AddRightWindow(controller: UIViewController): void;
        AddCentreWindow(controller: UIViewController): void;
    }

    export class WindowView {
        Init(): boolean;
        set topViewController(controller: UIViewController);
        set downViewController(controller: UIViewController);
        set leftViewController(controller: UIViewController);
        set rightViewController(controller: UIViewController);
        set centreViewController(controller: UIViewController);
    }

    /**
     * 循环队列
     */
    export class Vector<T> {
        /**
         * 队列的长度
         * @param len 长度
         * @param autoDilt 是否自动扩容
         * @constructor
         */
        Reserve(len: number, autoDilt: boolean = false): void;
        /**
         * 入队列
         * @param e 入队的元素
         * @returns {boolean}
         * @constructor
         */
        Push(e: T): boolean;
        /**
         * 出列，然后删除对顶元素
         * @returns {any}
         * @constructor
         */
        Pop(): T;
        /**
         * 出列，不删除对顶元素
         * @param index
         * @returns {T}
         * @constructor
         */
        Back(index: number = this._front): T;
        IsEmpty(): boolean;
        IsFull(): boolean;
        Clear(): void;
        Contains(e: T): boolean;
        Length(): number;
    }

    /**优先队列
     * 优先队列采用二叉堆存储结构（数组存储结构的二叉树），优先从左节点存储数据，第一个根节点默认也存储数据（这个可以改成第一个结点不存储数据的没问题）
     * 优先级规则可以自由的设定，通过new PriorityQueue<T>((a, b) => { return a > b; })这种模式，传入优先级规则
     * 若传入的规则中a > b，则是从大到小排列，反之，从小到大排列
     */
    export class PriorityQueue<T> {
        constructor(compareFn: (a: T, b: T) => boolean);

        Front: T;
        Length: number;
        /**
         * 压入元素，从左子树开始，左子树在数组中的下标为2*i+1，因此相应的父节点下标为(i-1)/2，右子树的下标为2*i+2，相应的父节点下标为(i-2)/2
         * @param e 压入的元素
         */
        Push(e: T): void;
        /**
         * 出队列，把队列的根节点删除，并返回删除的元素，删除的过程是把根节点不断的下沉到最后的位置，然后删除最后一个元素
         */
        Pop(): T;
    }

    /**
     * 数据存储，把数据存储到缓存里，区分数据类型
     */
    export class UserDefault {
        get Instance(): UserDefault;
        /**
         * 存储number类型数据
         * @param key 键
         * @param value 值
         */
        SetNumberForKey(key: string, value: number): void;
        /**
         * 存储string类型数据
         * @param key 键
         * @param value 值
         */
        SetStringForKey(key: string, value: string): void;
        /**
         * 存储boolean类型数据
         * @param key 键
         * @param value 值
         */
        SetBooleanForKey(key: string, value: boolean): void;
        /**
         * 存储object类型数据
         * @param key 键
         * @param value 值
         */
        SetObjectForKey(key: string, value: object): void;
        /**
         * 根据key，获取数据
         * @param key 键
         */
        GetValueForkey(key: string): number|string|object|boolean;
    }
}
