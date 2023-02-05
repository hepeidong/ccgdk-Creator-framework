import { App, UI } from "../cck";

/**
 * author: HePeiDong
 * date: 2019/9/11
 * name: 窗口类
 * description: 构建窗口层级结构，总共分为三层，分别是根节点层，中间层，顶部层, 其中顶部层为最顶层。
 */
export class WindowLayer {
    /***************游戏层级结构*****************/
    private _rootLayer: cc.Node;          //根视图层
    private _centerLayer: cc.Node;        //中心层
    private _topLayer: cc.Node;           //顶层

    private _centerZIndex: number;         //中间层窗口层级
    private _topZIndex: number;            //顶部层窗口层级

    constructor() {
        
    }

    public init(canvas: cc.Node): boolean {
        this._centerZIndex = cc.macro.MIN_ZINDEX;
        this._topZIndex = cc.macro.MIN_ZINDEX;
        //适配后的节点层大小
        let canvasSize = canvas.getContentSize();
        canvasSize.width += App.adapterManager.width * 2;
        canvasSize.height += App.adapterManager.height * 2;

        this._rootLayer = new cc.Node('rootLayer');          //根视图
        this._rootLayer.zIndex = 0;
        canvas.addChild(this._rootLayer);
        this._rootLayer.setContentSize(canvasSize);

        this._centerLayer = new cc.Node('centerLayer');      //中心层
        this._centerLayer.zIndex = 1;
        canvas.addChild(this._centerLayer);
        this._centerLayer.setContentSize(canvasSize);

        this._topLayer = new cc.Node('topLayer');            //顶层
        this._topLayer.zIndex = 2;
        canvas.addChild(this._topLayer);
        this._topLayer.setContentSize(canvasSize);
        return true;
    }

    /**
     * 增加根视图
     * @param view 根视图结点
     */
    public addRootWindow(view: IWindowBase): boolean {
        if (!this._rootLayer.getChildByName(view.node.name)) {
            this._rootLayer.addChild(view.node);
            return true;
        }
        return false;
    }

    /**
     * 增加中间窗口
     * @param view 视图结点
     * @param hasMask 是否增加背景遮罩, 默认不增加
     */
    public addCenterWindow(view: IWindowBase, hasMask: boolean = false): boolean {
        if (!this._centerLayer.getChildByName(view.node.name)) {
            hasMask && App.game.addViewMaskTo(this._centerLayer, view, this._centerZIndex++);
            this._centerLayer.addChild(view.node, this._centerZIndex);
            return true;
        }
        return false;
    }

    /**
     * 增加顶层窗口
     * @param view 视图控结点
     * @param hasMask 是否增加背景遮罩, 默认不增加
     */
    public addTopWindow(view: IWindowBase, hasMask: boolean = false): boolean {
        if (!this._topLayer.getChildByName(view.node.name)) {
            hasMask && App.game.addViewMaskTo(this._topLayer, view, this._topZIndex++);
            this._topLayer.addChild(view.node, this._topZIndex);
            return true;
        }
        return false;
    }

    /**
     * 增加toast提示
     * @param view 
     * @returns 
     */
    public addToastTip(view: IWindowBase) {
        this._topLayer.addChild(view.node);
        return true;
    }

    public addToTop(node: cc.Node) {
        if (!this._topLayer.getChildByName(node.name)) {
            this._topLayer.addChild(node);
        }
    }

    public addToCenter(node: cc.Node) {
        if (!this._centerLayer.getChildByName(node.name)) {
            this._centerLayer.addChild(node);
        }
    }
}