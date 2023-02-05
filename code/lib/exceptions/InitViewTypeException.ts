import { App, UI } from "../cck";
import { Exception } from "./Exception";

const {cckclass} = App.decorator;

@cckclass("InitViewTypeException")
export class InitViewTypeException extends Exception {
    private _type: UI.Type;
    constructor(message: string, type: UI.Type) {
        super("窗口的UI类型不正确，" + message);
        this._type = type;
    }

    public handle(): boolean {
        if (this._type !== UI.Type.NONE) {
            return true;
        }

        throw new Error(this.toString());
    }
}