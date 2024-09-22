import { _decorator, Component, Node, Collider2D, Contact2DType } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Bullet')
export class Bullet extends Component {
    private _contacted: boolean;
    start() {
        this._contacted = false;
        const collider = this.getComponent(Collider2D);
        if (collider) {
            collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
            collider.on(Contact2DType.END_CONTACT, this.onEndContact, this);
        }
        this.schedule
    }

    public getContacted() {
        return this._contacted;
    }

    private onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D) {
        // 只在两个碰撞体开始接触时被调用一次
        this._contacted = true;
    }

    private onEndContact(selfCollider: Collider2D, otherCollider: Collider2D) {
        // 只在两个碰撞体结束接触时被调用一次
        this._contacted = false;
    }

    update(deltaTime: number) {
        
    }
}

