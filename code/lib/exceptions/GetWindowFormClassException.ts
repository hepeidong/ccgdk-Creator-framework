import { App } from "../cck";
import { GetClassException } from "./GetClassException";

const {cckclass} = App.decorator;

@cckclass("GetWindowFormClassException")
export class GetWindowFormClassException extends GetClassException {
    constructor(message: string, classRef: Function) {
        super(`不存在 “${message}” UI窗口！`, classRef);
    }
}