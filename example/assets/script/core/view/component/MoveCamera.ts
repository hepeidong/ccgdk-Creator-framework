import { _decorator, Component, Node } from 'cc';
import { CameraPool } from '../../CameraPool';
import { Camera } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('MoveCamera')
export class MoveCamera extends Component {

    protected onLoad(): void {
        CameraPool.instance.addMoveCamera(this.node.getComponent(Camera));
    }

    start() {
        
    }

    update(deltaTime: number) {
        
    }
}


