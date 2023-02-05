import { App } from "../cck";


const {ccclass} = cc._decorator;

@ccclass
export class CCBaseView extends cc.Component implements IBaseView {

    protected  sendNotice(name: string, body: any = null, type: string = null): void {
        App.game.sendNotice(name, body, type);
    }

    protected regTouch(node: cc.Node, target?: any, useCapture?: boolean) {
        node.on(cc.Node.EventType.TOUCH_START, this.onTouchEvent, target, useCapture);
        node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchEvent, target, useCapture);
        node.on(cc.Node.EventType.TOUCH_END, this.onTouchEvent, target, useCapture);
        node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEvent, target, useCapture);
    }

    protected regMouse(node: cc.Node, target?: any, useCapture?: boolean) {
        node.on(cc.Node.EventType.MOUSE_DOWN, this.onMouseEvent, target, useCapture);
        node.on(cc.Node.EventType.MOUSE_ENTER, this.onMouseEvent, target, useCapture);
        node.on(cc.Node.EventType.MOUSE_LEAVE, this.onMouseEvent, target, useCapture);
        node.on(cc.Node.EventType.MOUSE_MOVE, this.onMouseEvent, target, useCapture);
        node.on(cc.Node.EventType.MOUSE_UP, this.onMouseEvent, target, useCapture);
        node.on(cc.Node.EventType.MOUSE_WHEEL, this.onMouseEvent, target, useCapture);
    }

    protected onEvent(body: IEventBody) {}

    private onTouchEvent(event: cc.Event.EventTouch) {
        const body: IEventBody = {
            event,
            node: event.target.name,
            type: event.type
        }
        this.onEvent(body);
    }

    private onMouseEvent(event: cc.Event.EventMouse) {
        const body: IEventBody = {
            event,
            node: event.target.name,
            type: event.type
        }
        this.onEvent(body);
    }
}