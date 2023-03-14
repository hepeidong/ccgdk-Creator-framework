import { Exception } from "../../exceptions/Exception";

export class EntityAlreadyReleasedException extends Exception {
    constructor(message: string) {
        super(message + "Entity already released.");
    }
}