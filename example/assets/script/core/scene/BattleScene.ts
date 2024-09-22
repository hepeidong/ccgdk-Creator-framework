import { app, decorator, ui } from "../../cck";
import { CameraPool } from "../CameraPool";
import { UIEnum } from "../UIEnum";

const {cckclass, template} = decorator;

@cckclass("BattleScene")
@template("battle")
export class BattleScene extends app.Scene {
    
    onCreate() {
        return app.SceneType.Normal;
    }

    onStart() {
        ui.open(UIEnum.GameBattle);
    }

    onEnd() {
        CameraPool.instance.removeMoveCameraAll();
    }
}