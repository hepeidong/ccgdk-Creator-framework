import { App } from "../cck";
import { GetClassException } from "./GetClassException";

const {cckclass} = App.decorator;

@cckclass("GetSceneClassException")
export class GetSceneClassException extends GetClassException {
    constructor(message: string, classRef: Function) {
        super(`不存在 “${message}” 场景！`, classRef);
    }
}