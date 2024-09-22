import { decorator } from "../decorator/Decorator";
import { Exception } from "./Exception";

const {cckclass} = decorator;

@cckclass("DeleteEdgeException")
export class DeleteEdgeException extends Exception {
    private _condition: boolean;
    constructor(message: string, condition: boolean) {
        super(`删除边时，传入了相同的顶点 => ${message}！`);
        this._condition = condition;
    }

    public handle(): boolean {
        if (this._condition) {
            return true;
        }
        throw new Error(this.toString());
    }
}