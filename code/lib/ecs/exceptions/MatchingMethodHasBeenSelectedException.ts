import { Exception } from "../../exceptions/Exception";

export class MatchingMethodHasBeenSelectedException extends Exception {
    constructor(message: string) {
        super(`'${message}' ` + "matching method has been selected!");
    }
}