import { decorator } from "../decorator/Decorator";
import { GetClassException } from "./GetClassException";

const {cckclass} = decorator;

@cckclass("GetObserverClassException")
export class GetObserverClassException extends GetClassException {
    constructor(message: string, classRef: Function) {
        super(`不存在 “${message}” 观察者！`, classRef);
    }
}