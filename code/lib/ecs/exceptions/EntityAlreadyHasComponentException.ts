import { Exception } from "../../exceptions/Exception";

export class EntityAlreadyHasComponentException extends Exception {
    constructor(message: string, index: number) {
        super(message + "\nEntity already has a component at (" + index + ").");
    }
}