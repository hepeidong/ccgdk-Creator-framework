import { Exception } from "../../exceptions/Exception";

export class EntityDoesNotHaveComponentException extends Exception {
    constructor(message: string, index: number) {
        super(message + "\nEntity does not have a component at index (" + index + ").");
    }
}