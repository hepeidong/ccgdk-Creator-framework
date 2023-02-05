import { App } from "../cck";
import { Exception } from "./Exception";

const {cckclass} = App.decorator;

@cckclass("LoadRemoteTextureException")
export class LoadRemoteTextureException extends Exception {
    private _texture: any;
    constructor(message: string, texture: any) {
        super(`${message} 并不是一张图片纹理资源！`);
        this._texture = texture;
    }

    public handle(): boolean {
        if (this._texture instanceof cc.Texture2D) {
            return true;
        }
        throw new Error(this.toString());
    }
}