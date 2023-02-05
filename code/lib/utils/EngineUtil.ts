import { SAFE_CALLBACK } from "../Define";
import { App } from "../cck";
import { Utils } from "./GameUtils";


export default class CCEngineUtil {

    public static delClicked(target: cc.Node, caller: any, handler: Function): void {
        target.off(cc.Node.EventType.TOUCH_START, function() {}, this);
        target.off(cc.Node.EventType.TOUCH_END, function(e: cc.Event.EventTouch) {
            if (Utils.DateUtil.inCD(1000)) return;
            SAFE_CALLBACK(handler.bind(caller), e);
        }, this);
    }

    /**
     * 在编辑器内锁定隐藏节点
     * @param target 
     */
    public static lockNodeInEditor(target: cc.Node): void {
        // cc.Object["Flags"].DontSave          // 当前节点不会被保存到prefab文件里
        // cc.Object["Flags"].LockedInEditor    // 当前节点及子节点在编辑器里不会被点击到
        // cc.Object["Flags"].HideInHierarchy   // 当前节点及子节点在编辑器里不显示
        target["_objFlags"] |= (cc.Object["Flags"].DontSave | cc.Object["Flags"].LockedInEditor | cc.Object["Flags"].HideInHierarchy);
    }

    /**
     * 某一个节点其坐标点是否在另一节点矩形内
     * @param target 目标节点
     * @param currNode 当前节点
     */
    public static inersectJudge(target: cc.Node, currNode: cc.Node, targetRect?: cc.Rect): boolean {
        let x1 = - target.width * target.anchorX - (targetRect ? targetRect.x : 0);
        let x2 = target.width * target.anchorX + (targetRect ? targetRect.x : 0);
        let y1 = -target.height * target.anchorY - (targetRect ? targetRect.y : 0);
        let y2 = target.height * target.anchorY + (targetRect ? targetRect.y : 0);

        let pos = this.convertPosition(currNode, target);
        if (pos.x >= x1 && pos.x <= x2 && pos.y >= y1 && pos.y <= y2) {
            return true;
        }
        return false;
    }

    /**
     * 使节点置灰
     * @param node 需要置灰的节点
     * @param gray 是否置灰, true是置灰
     */
    public static makeNodeGray(node: cc.Node, gray: boolean) {
        let material: cc.Material;
        if (gray) {
            material = cc.Material.getBuiltinMaterial('2d-gray-sprite');
        }
        else {
            material = cc.Material.getBuiltinMaterial('2d-sprite');
        }
        node.getComponent(cc.Sprite).setMaterial(0, material);
    }

    /**
     * 把当前节点坐标系转换为另一个节点坐标系
     * @param from 要转换的节点
     * @param to 目标节点
     * @returns 返回转换后的新的坐标位置
     */
    public static convertPosition(from: cc.Node, to: cc.Node): cc.Vec3 {
        let worldPos = from.parent.convertToWorldSpaceAR(from.position);
        return to.convertToNodeSpaceAR(worldPos);
    }

    /**
     * 转换到微信小游戏坐标系，转换后的坐标是以右上角为原点
     * @param target 要转换的节点
     */
    public static convertToWechatSpace(target: cc.Node): cc.Vec2 {
        let position: cc.Vec3 = this.convertPosition(target, cc.Canvas.instance.node);
        const { width, height } = cc.view.getFrameSize();
        let scale: number = App.adapterManager.rate;
        let x: number = Math.abs(width / 2 + position.x * scale);
        let y: number = Math.abs(position.y * scale - height / 2);
        return new cc.Vec2(x, y);
    }

    /**
     * 转换到微信下的宽高
     * @param target 
     */
    public static convertToWechatSize(target: cc.Node): cc.Size {
        let scale: number = App.adapterManager.rate;
        return cc.size(target.width * scale, target.height * scale);
    }

    /**
     * 转换到微信小游戏坐标系
     * @param target 
     */
    public static convertToWechatSpaceAR(target: cc.Node): cc.Vec2 {
        let pos: cc.Vec2 = this.convertToWechatSpace(target);
        let size: cc.Size = this.convertToWechatSize(target);
        pos.x = pos.x - size.width / 2;
        pos.y = pos.y > 0 ? pos.y - size.height : pos.y - size.height / 2;
        return pos;
    }

    /**
     * 微信坐标转换为Cocos坐标
     * @param wxPosition 微信坐标位置
     */
    public static wechatSpaceToCCSpace(wxPosition: cc.Vec2): cc.Vec2 {
        const { width, height } = cc.view.getFrameSize();
        let scale: number = App.adapterManager.rate;
        let x: number = (wxPosition.x - width / 2) / scale;
        let y: number = (height / 2 + wxPosition.y) / scale;
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
     * 将子节点从当前父节点, 移动到另一个父节点上, 这是一个具有移动速度的移动过程
     * @param child 需要移动的子节点
     * @param toParent 移动到的目标父节点
     * @param speed 移动速度, 即每秒移动多少的点, 例如500, 即每秒移动500个点
     * @param position 移动到目标父节点下的坐标位置, 默认为(0, 0)位置
     * @param start 开始回调
     * @param complate 结束回调
     */
    public static moveEffect(
        child: cc.Node, 
        toParent: cc.Node, 
        speed: number, 
        position: cc.Vec3 = cc.v3(0, 0, 0), 
        start?: (child: cc.Node) => void, 
        complate?: (child: cc.Node) => void
        ) 
    {
        child.setAnchorPoint(0.5, 0.5);
        let startX = child.x;
        let startY = child.y;
        let pos: cc.Vec3 = this.convertPosition(child, toParent);
        let parent: cc.Node = child.parent;
        child.parent = toParent;
        child.x = pos.x;
        child.y = pos.y;
        //通过距离和速度计算时间
        let distance: number = Utils.MathUtil.distance(cc.v3(pos.x, pos.y), cc.v3(0, 0));
        let time: number = distance / speed; 
        SAFE_CALLBACK(start, child);
        cc.tween<cc.Node>(child).to(time, {position: position}).call(() => {
            child.active = false;
            child.parent = parent;
            child.x = startX;
            child.y = startY;
            SAFE_CALLBACK(complate, child);
        }).start();
    }

    /**
     * 漂浮特效
     * @param target 
     * @param duration 
     * @param floatHeight 
     */
    public static floatEffet(target: cc.Node, duration: number, floatHeight: number) {
        target.opacity = 255;
        let oldPosition = target.position;
        let moveBy = cc.moveBy(duration, cc.v2(0, floatHeight));
        let fadeOut = cc.fadeOut(0.5);
        let call = cc.callFunc(() => {
            target.position = oldPosition;
        });
        let seq = cc.sequence(moveBy, fadeOut, call);
        target.runAction(seq);
    }
}
