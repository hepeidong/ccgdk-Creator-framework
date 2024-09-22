import { app, decorator, ui } from "../../cck";
import { InterimSceneView } from "./InterimSceneView";

const {cckclass, template} = decorator;

@cckclass("InterimScene")
@template("interim")
export class InterimScene extends app.Scene<InterimSceneView> {

    onCreate() {
        return app.SceneType.Interim;
    }

    onStart(accessId: string, sceneName: string) {
        ui.load(accessId, progress => {
            this.view.updateProgress(progress);
        }, () => {
            this.manager.setScene(sceneName, accessId);
        });
    }
}