import { Truck } from "./Truck";

/**
 * 特殊弹幕, 用于运送特殊内容的弹幕
 */
export class Float extends Truck {
    constructor(id: number, content: string = '', color: cc.Color = cc.Color.WHITE, carrier: cc.Node = null) {
        super(id, content, color, carrier);
    }

    public setTime(t: number) {
        super.setTime(2 * t / 3);
    }
}