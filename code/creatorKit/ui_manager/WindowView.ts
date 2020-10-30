/**
 * author: HePeiDong
 * date: 2019/9/11
 * name: 窗口类
 * description: 构建窗口层级结构，总共分为三层，分别是根节点层，中间层，顶部层。
 */
export class WindowView {
    /***************游戏层级结构*****************/
    private _rootWindow: cc.Node;          //根视图
    private _centerWindow: cc.Node;      //中心窗口
    private _topWindow: cc.Node;        //顶层窗口

    constructor() {
        this.Init();
    }

    private Init(): boolean {
        this. _rootWindow = new cc.Node();          //根视图
        this. _centerWindow = new cc.Node();      //中心窗口
        this. _topWindow = new cc.Node();        //顶层窗口
        //把窗口加入到canvas
        cc.Canvas.instance.node.addChild(this._rootWindow);
        cc.Canvas.instance.node.addChild(this._centerWindow);
        cc.Canvas.instance.node.addChild(this._topWindow);

        let canvasSize = cc.Canvas.instance.node.getContentSize();
        //确定窗口结构，各窗口的大小
        this._rootWindow.setContentSize(canvasSize);
        this._centerWindow.setContentSize(canvasSize);
        this._topWindow.setContentSize(canvasSize);
        return true;
    }

    private static _ins: WindowView;
    public static get Instance(): WindowView {
        return this._ins = this._ins ? this._ins : new WindowView();
    }

    /**
     * 增加根视图
     * @param node 根视图结点
     */
    public addRootWindow(node: cc.Node): void {
        this._rootWindow.addChild(node);
    }

    /**
     * 增加中间窗口
     * @param node 视图结点
     */
    public addCenterWindow(node: cc.Node): void {
        this._centerWindow.addChild(node);
    }

    /**
     * 增加顶层窗口
     * @param node 视图控结点
     */
    public addTopWindow(node: cc.Node): void {
        this._topWindow.addChild(node);
    }
}