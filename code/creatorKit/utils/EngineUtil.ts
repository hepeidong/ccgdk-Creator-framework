

export default class EngineUtil {

    constructor() {

    }

    public static addClickEvent(node: cc.Node, target: cc.Node, component: string, handler: string, data: any = ''): void {
        this.addEventHandler(cc.Button, 'clickEvents', node, target, component, handler, data);
    }

    public static addSlideEvent(node: cc.Node, target: cc.Node, component: string, handler: string, data: any = ''): void {
        this.addEventHandler(cc.Slider, 'slideEvents', node, target, component, handler, data);
    }

    public static addToggleEvent(node: cc.Node, target: cc.Node, component: string, handler: string, data: any = ''): void {
        this.addEventHandler(cc.Toggle, 'clickEvents', node, target, component, handler, data);
    }

    //按下回车键执行的回调
    public static addEditReturnEvent(node: cc.Node, target: cc.Node, component: string, handler: string, data: any = ''): void {
        this.addEventHandler(cc.EditBox, 'editingReturn', node, target, component, handler, data);
    }

    //结束编辑文本输入框时触发的事件回调
    public static addEditDidEnded(node: cc.Node, target: cc.Node, component: string, handler: string, data: any = ''): void {
        this.addEventHandler(cc.EditBox, 'editingDidEnded', node, target, component, handler, data);
    }

    //编辑文本输入框时触发的事件回调
    public static addTextChanged(node: cc.Node, target: cc.Node, component: string, handler: string, data: any = ''): void {
        this.addEventHandler(cc.EditBox, 'textChanged', node, target, component, handler, data);
    }

    //开始编辑文本输入框触发的事件回调
    public static addEditDidBegan(node: cc.Node, target: cc.Node, component: string, handler: string, data: any = ''): void {
        this.addEventHandler(cc.EditBox, 'editingDidBegan', node, target, component, handler, data);
    }

    public static loadImage(target: cc.Node, url: string, type: string = 'png'): void {
        cc.loader.load({ url, type }, (err: Error, tex: cc.Texture2D) => {
            if (err) {
                kit.error('加载头像纹理错误：', err);
                return;
            }
            if (target && target.getComponent(cc.Sprite)) {
                target.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(tex);
            }
        });
    }

    /**
     * 某一个节点其坐标点是否在另一节点矩形内
     * @param target 目标节点
     * @param currNode 当前节点
     * @param rect 目标节点2D矩形
     */
    public static inersectJudge(target: cc.Node, currNode: cc.Node, targetRect?: cc.Rect): boolean {
        let x1 = - target.width * target.anchorX - (targetRect ? targetRect.x : 0);
        let x2 = target.width * target.anchorX + (targetRect ? targetRect.x : 0);
        let y1 = -target.height * target.anchorY - (targetRect ? targetRect.y : 0);
        let y2 = target.height * target.anchorY + (targetRect ? targetRect.y : 0);

        let pos = this.convertPosition(currNode.parent, target, cc.v2(currNode.x, currNode.y));
        if (pos.x >= x1 && pos.x <= x2 && pos.y >= y1 && pos.y <= y2) {
            return true;
        }
        return false;
    }

    /**
     * 从一个父节点坐标系转换到另一个父节点坐标系
     * @param {any} fromParent 当前父节点
     * @param {any} toParent 目标父节点
     * @param {any} position 需要转换的位置
     */
    public static convertPosition(fromParent: cc.Node, toParent: cc.Node, position: cc.Vec2): cc.Vec2 {
        let worldPos = fromParent.convertToWorldSpaceAR(position);
        return toParent.convertToNodeSpaceAR(worldPos);
    }

    /**
     * 转换到微信小游戏坐标系，转换后的坐标是以右上角为原点
     * @param position 要转换的坐标点
     */
    public static convertToWechatSpace(position: cc.Vec2): cc.Vec2 {
        const { screenWidth, screenHeight } = wx.getSystemInfoSync();
        const designResolution = cc.Canvas.instance.designResolution;
        const rateW: number = screenWidth / designResolution.width;
        const rateH: number = screenHeight / designResolution.height;
        let x: number = Math.abs(screenWidth / 2 + position.x * rateW);
        let y: number = Math.abs(screenHeight / 2 - position.y * rateH);
        return new cc.Vec2(x, y);
    }

    /**
     * 转换到微信小游戏坐标系
     * @param rect 
     */
    public static convertToWechatSpaceAR(rect: cc.Rect): cc.Vec2 {
        let pos: cc.Vec2 = this.convertToWechatSpace(new cc.Vec2(rect.x, rect.y));
        pos.x = pos.x - rect.width / 2;
        pos.y - pos.y - rect.height / 2;
        return pos;
    }

    /**
     * 微信坐标转换为Cocos坐标
     * @param wxPosition 微信坐标位置
     */
    public static wechatSpaceToCCSpace(wxPosition: cc.Vec2): cc.Vec2 {
        const { screenWidth, screenHeight } = wx.getSystemInfoSync();
        const designResolution = cc.Canvas.instance.designResolution;
        const rateW: number = screenWidth / designResolution.width;
        const rateH: number = screenHeight / designResolution.height;
        let x: number = (wxPosition.x - screenWidth / 2) / rateW;
        let y: number = (screenHeight / 2 + wxPosition.y) / rateH;
        return new cc.Vec2(x, y);
    }

    /**
     * 把节点位置坐标转换到另一个节点坐标系下
     * @param fromTarget 
     * @param toTarget 
     */
    public static positionConvert(fromTarget: cc.Node, toTarget: cc.Node): cc.Vec3 {
        let worldPos: cc.Vec3 = fromTarget.parent.convertToWorldSpaceAR(fromTarget.position);
        let pos: cc.Vec3 = toTarget.convertToNodeSpaceAR(worldPos);
        return pos;
    }

    public static active(target: cc.Node, state: boolean): void {
        if (target) {
            target.active = state;
        }
    }

    public static activeAllChild(target: cc.Node, state: boolean): void {
        if (target) {
            for (let i: number = 0; i < target.childrenCount; ++i) {
                target.children[i].active = state;
            }
        }
    }

    public static hide(target: cc.Node, state: boolean): void {
        if (target) {
            target.opacity = state ? 255 : 0;
        }
    }

    public static hideAllChild(target: cc.Node, state: boolean): void {
        if (target) {
            for (let i: number = 0; i < target.childrenCount; ++i) {
                target.children[i].opacity = state ? 255 : 0;
            }
        }
    }

    /**
     * 计算两点距离
     * @param v1 
     * @param v2 
     */
    public static distance(v1: cc.Vec3, v2: cc.Vec3): number {
        let X: number = (v1.x - v2.x) * (v1.x - v2.x);
        let Y: number = (v1.y - v2.y) * (v1.y - v2.y);
        let Z: number = (v1.z - v2.z) * (v1.z - v2.z);
        return Math.sqrt(X + Y + Z);
    }

    private static addEventHandler(
        type: typeof cc.Component,
        events: string,
        node: cc.Node,
        target: cc.Node,
        component: string,
        handler: string,
        data: any = ''
    ): void {
        let eventHandler: cc.Component.EventHandler = new cc.Component.EventHandler();
        eventHandler.target = target;
        eventHandler.component = component;
        eventHandler.handler = handler;
        eventHandler.customEventData = data;

        let handlerEvents: cc.Component.EventHandler[] = node.getComponent(type)[events];
        handlerEvents.push(eventHandler);
    }
}
