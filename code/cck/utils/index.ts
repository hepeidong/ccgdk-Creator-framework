import { StringUtil } from "./StringUtil";
import { DateUtil } from "./DateUtil";
import { MathUtil } from "./MathUtil";
import { EngineUtil } from "./EngineUtil";
import { ObjectUtil } from "./ObjectUtil";
import { js } from "cc";
export * from "./UUID";


const types = {
    object: '[object Object]',
    array: '[object Array]',
    function: '[object Function]',
    null: '[object Null]',
    undefined: '[object Undefined]'
}

export class utils {
    public static get StringUtil() {return StringUtil;}
    public static get DateUtil() {return DateUtil;}
    public static get MathUtil() {return MathUtil;}
    public static get EngineUtil() {return EngineUtil;}
    public static get ObjectUtil() {return ObjectUtil;}
}

export namespace utils {

    export function isObject(arg: any): boolean {
        return Object.prototype.toString.call(arg) === types.object || typeof arg === 'object';
    }

    export function isArray(arg: any): boolean {
        return Object.prototype.toString.call(arg) === types.array;
    }

    export function isFunction(arg: any): boolean {
        return Object.prototype.toString.call(arg) === types.function || typeof arg === 'function';
    }

    export function isNumber(arg: any): boolean {
        return js.isNumber(arg);
    }

    export function isString(arg: any): boolean {
        return js.isString(arg);
    }

    export function isNull(arg: any): boolean {
        return Object.prototype.toString.call(arg) === types.null;
    }

    export function isUndefined(arg: any): boolean {
        return Object.prototype.toString.call(arg) === types.undefined || typeof arg === 'undefined';
    }
}