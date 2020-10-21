
/**
 * name: 多分辨率适配
 * date: 2020/03/29
 * author: 何沛东
 * description: 多分辨率完美适配
 */
export default class AdapterCtrl {
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
    
    constructor() {
        
    }

    private static _ins: AdapterCtrl = null;
    public static get Instance(): AdapterCtrl {
        return this._ins = this._ins ? this._ins : new AdapterCtrl();
    }

    public get width(): number { return this._width; }
    public get height(): number { return this._height; }
    public get bangForWidth(): number { return this._bangForWidth; }
    public get bangForHeight(): number { return this._bangForHeight; }
    public get scaleX(): number { 
        return cc.view.getCanvasSize().width / this._designResolutionWidth;
    }
    public get scaleY(): number {
        return cc.view.getCanvasSize().height / this._designResolutionHeight;
    }

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

    public getScreenSize(): cc.Size{
        kit.Log('After the Adapter of scrren size:', this._screenSize);
        return this._screenSize;
    }

    public getScale(target: cc.Node): number {
        let realWidth: number = target.width * this._adapterScele;
        let realHeight: number = target.height * this._adapterScele;

        return Math.max(
            cc.view.getCanvasSize().width / realWidth,
            cc.view.getCanvasSize().height / realHeight
        );
    }

    public getScaleX(target: cc.Node): number {
        let realWidth: number = target.width * this._adapterScele;
        return cc.view.getCanvasSize().width / realWidth;
    }

    public getScaleY(target: cc.Node): number {
        let realHeight: number = target.height * this._adapterScele;
        return cc.view.getCanvasSize().height / realHeight;
    }

    private adapterShowAll() {
        this._adapterScele = Math.min(
            cc.view.getCanvasSize().width / this._designResolutionWidth,
            cc.view.getCanvasSize().height / this._designResolutionHeight
        );

        var screenWidth = this._screenSize.width - this._designResolutionWidth;
        var screenHeight = this._screenSize.height - this._designResolutionHeight;
        this._width = screenWidth / 2;
        this._height = screenHeight / 2;

        this.adapterBang();
    }

    private adapterFitHeight() {
        this._adapterScele = cc.view.getCanvasSize().height / this._designResolutionHeight;

        var screenWidth = this._screenSize.width - this._designResolutionWidth;
        this._width = screenWidth / 2;
        this._height = 0;

        this.adapterBang();
    }

    private adapteerFitWidth() {
        this._adapterScele = cc.view.getCanvasSize().width / this._designResolutionWidth;

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
 