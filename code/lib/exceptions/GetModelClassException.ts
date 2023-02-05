import { App } from "../cck";
import { GetClassException } from "./GetClassException";

const {cckclass} = App.decorator;

@cckclass("GetModelClassException")
export class GetModelClassException extends GetClassException {
    constructor(message: string, classRef: Function) {
        super(`不存在 “${message}” 模型！`, classRef);
    }
}