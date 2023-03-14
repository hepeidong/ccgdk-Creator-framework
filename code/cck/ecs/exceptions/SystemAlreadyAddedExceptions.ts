import { Exception } from "../../exceptions/Exception";

export class SystemAlreadyAddedExceptions extends Exception {
    constructor(name: string, message: string) {
        super(message + "System " + name + " already added.")
    }
}