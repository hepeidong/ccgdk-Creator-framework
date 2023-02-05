import { App } from "../cck";
import { Exception } from "./Exception";
import { GetClassException } from "./GetClassException";

const {cckclass} = App.decorator;

@cckclass("GetSocketMessageClassException")
export class GetSocketMessageClassException extends GetClassException {
    constructor(message: string, classRef: Function) {
        super(`不存在 “${message}” socket消息！`, classRef);
    }
}