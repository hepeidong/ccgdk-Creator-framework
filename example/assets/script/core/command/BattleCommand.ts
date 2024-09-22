import { app, Debug, decorator } from "../../cck";
import { ModelEnum } from "../ModelEnum";
import { BattleModel } from "../model/BattleModel";

const {cckclass} = decorator;

@cckclass("BattleCommand")
export class BattleCommand extends app.Command {
    execute(notification: INotification): void {
        const model = app.getModel<BattleModel>(ModelEnum.BattleModel);
        Debug.log("Run battle command.");
        model.startBattle();
    }
}