import { App } from "../cck";
import { Exception } from "./Exception";

const {cckclass} = App.decorator;

@cckclass("InitSceneTypeException")
export class InitSceneTypeException extends Exception {
    private _type: App.SceneType;
    constructor(message: string, type: App.SceneType) {
        super("场景的类型不正确，" + message);
        this._type = type;
    }

    public handle(): boolean {
        if (this._type !== App.SceneType.NONE) {
            return true;
        }

        throw new Error(this.toString());
    }
}