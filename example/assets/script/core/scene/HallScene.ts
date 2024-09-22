import { app, decorator, ui } from "../../cck";
import { UIEnum } from "../UIEnum";

const {cckclass, template} = decorator;

@cckclass("HallScene")
@template("hall")
export class HallScene extends app.Scene {

    onCreate() {
        return app.SceneType.Normal;
    }

    onStart() {
        ui.open(UIEnum.GameHall);
    }
}