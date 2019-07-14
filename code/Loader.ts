
import {G} from "./G";
export class Loader {
    constructor() {

    }
    public static load(obj: any, callback: Function, isLock: boolean = false) {
        cc.loader.load(obj, callback);
    }

}
G.Loader = Loader;