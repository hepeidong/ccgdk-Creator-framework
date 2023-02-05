import { App } from "../cck";
import { GetClassException } from "./GetClassException";

const {cckclass} = App.decorator;

@cckclass("GetObserverClassException")
export class GetObserverClassException extends GetClassException {
    constructor(message: string, classRef: Function) {
        super(`不存在 “${message}” 观察者！`, classRef);
    }
}