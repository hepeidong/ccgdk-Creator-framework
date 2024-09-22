import { Prefab } from "cc";
import { IAssetRegister, IRegister, decorator, ui, utils } from "../../../cck";
import { GameHallView } from "./GameHallView";
import { instantiate } from "cc";

const {cckclass, template, bundle} = decorator;

@cckclass("GameHall")
@template("HallView")
@bundle("hall")
export class GameHall extends ui.WinForm<GameHallView> {

    listAssetUrls(assetRegister: IAssetRegister) {
        assetRegister.addFilePath("bg0");
        assetRegister.addFilePath("bg1");
        assetRegister.addFilePath("bg2");
        assetRegister.addFilePath("bg3");
        assetRegister.addFilePath("bg4");
    }

    onCreate(register: IRegister) {
        return ui.Type.ROOT;
    }

    onStart() {
        const index = utils.MathUtil.randomInt(0, 4);
        const prefab = this.getGameAsset("bg" + index, Prefab);
        const node = instantiate(prefab);
        this.view.showBg(node);
    }
}