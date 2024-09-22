import { _decorator } from 'cc';
import { app } from '../../cck';
import { ProgressBar } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('InterimSceneView')
export class InterimSceneView extends app.BaseView {

    @property(ProgressBar)
    private loadProgres: ProgressBar = null;

    start() {

    }

    public updateProgress(progress: number) {
        this.loadProgres.progress = progress;
    }


    update(deltaTime: number) {
        
    }
}


