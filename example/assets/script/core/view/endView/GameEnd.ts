import { DataReader, Debug, app, decorator, ui } from "../../../cck";
import { ModelEnum } from "../../ModelEnum";
import { BattleModel } from "../../model/BattleModel";
import { GameEndView } from "./GameEndView";

const {cckclass, template, bundle} = decorator;


@cckclass("GameEnd")
@template("EndView")
@bundle("end")
export class GameEnd extends ui.WinForm<GameEndView> {

    private _battleModel: BattleModel;
    onCreate() {
        this._battleModel = app.getModel(ModelEnum.BattleModel);
        return ui.Type.ACTIVITY;
    }

    onStart(isWin: boolean) {
        this.view.tip.string = isWin ? "靓仔，你赢了喔！！！" : "叼毛，你输啦！！！";
        //赢了就过关
        if (isWin) {
            if (this._battleModel.data.gameLevel < DataReader.file.GameLevel.length) {
                this._battleModel.data.gameLevel++;
                this._battleModel.save();
            }
        }
    }
}