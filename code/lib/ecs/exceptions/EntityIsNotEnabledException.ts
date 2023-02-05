import { Exception } from "../../exceptions/Exception";

export class EntityIsNotEnabledException extends Exception {
    constructor(message: string) {
        super(message + "\nEntity is not enabled.");
    }
}