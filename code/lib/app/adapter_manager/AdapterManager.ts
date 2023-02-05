import { Debug } from "../../Debugger";

/**
 * name: 多分辨率适配
 * date: 2020/03/29
 * author: 何沛东
 * description: 多分辨率完美适配
 */
export class AdapterManager {
    private _designResolutionWidth: number;
    private _designResolutionHeight: number;
    private _frameSizeWidth: number;
    private _frameSizeHeight: number;
    private _adapterScele: number;
    private _width: number = 0;
    private _height: number = 0;
    private _bangForWidth: number = 0;
    private _bangForHeight: number = 0;
    private _screenSize: cc.Size = new cc.Size(0, 0);
    private _rate: number;
    
    constructor() {
        
    }

    private static _ins: AdapterManager = null;
    public static get instance(): AdapterManager {
        return this._ins = this._ins ? this._ins : new AdapterManager();
    }

    /**水平偏移 */
    public get width(): number { return this._width; }
    /**垂直偏移 */
    public get height(): number { return this._height; }
    /**有刘海时的水平偏移 */
    public get bangForWidth(): number { return this._bangForWidth; }
    /**有刘海时的垂直偏移 */
    public get bangForHeight(): number { return this._bangForHeight; }
    /**适配后的缩放因子 */
    public get rate(): number { return this._rate; }
    public get scaleX(): number { 
        return cc.view.getCanvasSize().width / this._designResolutionWidth;
    }
    public get scaleY(): number {
        return cc.view.getCanvasSize().height / this._designResolutionHeight;
    }

    /**
     * 开始适配，不需要外部调用
     * @param autoAdapter 是否自动适配
     */
    public adapter(autoAdapter: boolean) {
        this._designResolutionWidth = cc.Canvas.instance.designResolution.width;
        this._designResolutionHeight = cc.Canvas.instance.designResolution.height;
        this._frameSizeWidth = cc.view.getFrameSize().width;
        this._frameSizeHeight = cc.view.getFrameSize().height;
        this._screenSize.width = this._designResolutionHeight / this._frameSizeHeight * this._frameSizeWidth;
        this._screenSize.height = this._designResolutionWidth / this._frameSizeWidth * this._frameSizeHeight;

        if (autoAdapter) {
            if(this._designResolutionWidth / this._frameSizeWidth >= this._designResolutionHeight / this._frameSizeHeight) {
                cc.Canvas.instance.fitWidth = true;
                cc.Canvas.instance.fitHeight = false;
            }
            else {
                cc.Canvas.instance.fitWidth = false;
                cc.Canvas.instance.fitHeight = true;
            }
        }

        let fitWidth: boolean = cc.Canvas.instance.fitWidth;
        let fitHeight: boolean = cc.Canvas.instance.fitHeight;
        if (fitWidth && fitHeight) {
            this.adapterShowAll();
        }
        else if (!fitWidth && fitHeight) {
            this.adapterFitHeight();
        }
        else if (fitWidth && !fitHeight) {
            this.adapteerFitWidth();
        }
    }

    /** 适配节点的宽*/
    public adapterWidth(target: cc.Node) {
        target.width += this.width * 2;
    }
    /**适配节点的高 */
    public adapterHeight(target: cc.Node) {
        target.height += this.height * 2;
    }
    /**适配节点的X轴缩放系数 */
    public adapterScaleX(target: cc.Node) {
        target.scaleX = this.getScaleX(target);
    }
    /**适配节点的Y轴缩放系数 */
    public adapterScaleY(target: cc.Node) {
        target.scaleY = this.getScaleY(target);
    }
    /**适配节点的缩放系数 */
    public adapterScale(target: cc.Node) {
        target.scale = this.getScale(target);
    }
    /**适配后的屏幕大小 */
    public getScreenSize(): cc.Size {
        Debug.log('After the Adapter of screen size:', this._screenSize);
        return this._screenSize;
    }
    /**返回适配后的节点大小 */
    public getSize(target: cc.Node|cc.Size): cc.Size {
        return cc.size(target.width + this.width * 2, target.height + this.height * 2);
    }
    /**目标节点适配后的铺满屏幕的缩放比例 */
    public getScale(target: cc.Node): number {
        let realWidth: number = target.width * this._adapterScele;
        let realHeight: number = target.height * this._adapterScele;

        return Math.max(
            cc.view.getCanvasSize().width / realWidth,
            cc.view.getCanvasSize().height / realHeight
        );
    }
    /**目标节点适配后的铺满屏幕的X缩放比例 */
    public getScaleX(target: cc.Node): number {
        let realWidth: number = target.width * this._adapterScele;
        return cc.view.getCanvasSize().width / realWidth;
    }
    /**目标节点适配后的铺满屏幕的Y缩放比例 */
    public getScaleY(target: cc.Node): number {
        let realHeight: number = target.height * this._adapterScele;
        return cc.view.getCanvasSize().height / realHeight;
    }

    private adapterShowAll() {
        Debug.log('按比例拉伸宽高');
        this._adapterScele = Math.min(
            cc.view.getCanvasSize().width / this._designResolutionWidth,
            cc.view.getCanvasSize().height / this._designResolutionHeight
        );

        this._rate = Math.min(
            cc.view.getFrameSize().width / this._designResolutionWidth,
            cc.view.getFrameSize().height / this._designResolutionHeight
        );

        var screenWidth = this._screenSize.width - this._designResolutionWidth;
        var screenHeight = this._screenSize.height - this._designResolutionHeight;
        this._width = screenWidth / 2;
        this._height = screenHeight / 2;

        this.adapterBang();
    }

    private adapterFitHeight() {
        Debug.log('宽保持不变, 适配高');
        this._adapterScele = cc.view.getCanvasSize().height / this._designResolutionHeight;
        this._rate = cc.view.getFrameSize().height / this._designResolutionHeight;

        var screenWidth = this._screenSize.width - this._designResolutionWidth;
        this._width = screenWidth / 2;
        this._height = 0;

        this.adapterBang();
    }

    private adapteerFitWidth() {
        Debug.log('高保持不变,适配宽');
        this._adapterScele = cc.view.getCanvasSize().width / this._designResolutionWidth;
        this._rate = cc.view.getFrameSize().width / this._designResolutionWidth;

        var screenHeight = this._screenSize.height - this._designResolutionHeight;
        this._width = 0;
        this._height = screenHeight / 2;

        this.adapterBang();
    }

    private adapterBang() {
        //横版
        if (this._frameSizeWidth > this._frameSizeHeight) {
            if (this._frameSizeWidth / this._frameSizeHeight > 2) {
                let tempWidth: number = this._frameSizeHeight * 2;
                var screenWidth = this._designResolutionHeight / this._frameSizeHeight * tempWidth - this._designResolutionWidth;
                this._bangForWidth = screenWidth / 2 - this._width;
                this._bangForHeight = 0;
            }
        }
        //竖版
        else if (this._frameSizeWidth < this._frameSizeHeight) {
            if (this._frameSizeHeight / this._frameSizeWidth > 2) {
                let tempHeight: number = this._frameSizeWidth * 2;
                var screenHeight = this._designResolutionWidth / this._frameSizeWidth * tempHeight - this._designResolutionHeight;
                this._bangForWidth = 0;
                this._bangForHeight = screenHeight / 2 - this._height;
            }
        }
    }
}
 