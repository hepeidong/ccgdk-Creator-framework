import { decorator } from "../decorator/Decorator";
import { Exception } from "./Exception";

const {cckclass} = decorator;

@cckclass("GetComponentException")
export class GetComponentException extends Exception {
    constructor(message: string) {
        super(`缺少 “${message}” 组件`);
    }

    public handle(): boolean {
        throw new Error(this.toString());
    }
}