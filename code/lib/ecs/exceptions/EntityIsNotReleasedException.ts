import { Exception } from "../../exceptions/Exception";

export class EntityIsNotReleasedException extends Exception {
    constructor(message: string) {
        super(message + "\nEntity is not released yet!");
    }
}