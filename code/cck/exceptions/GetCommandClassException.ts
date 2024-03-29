import { decorator } from "../decorator/Decorator";
import { GetClassException } from "./GetClassException";

const {cckclass} = decorator;

@cckclass("GetCommandClassException")
export class GetCommandClassException extends GetClassException {
    constructor(message: string, classRef: Function) {
        super(`不存在 “${message}” 命令！`, classRef);
    }
}