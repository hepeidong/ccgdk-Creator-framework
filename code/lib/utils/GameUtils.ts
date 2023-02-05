import CCStringUtil from "./StringUtil";
import CCDateUtil from "./DateUtil";
import CCMathUtil from "./MathUtil";
import CCEngineUtil from "./EngineUtil";
import CCObjectUtil from "./ObjectUtil";
import { Animat } from "../effect_manager/AnimatManager";
import { Audio } from "../effect_manager/AudioManager";
import { DFReader } from "./config_util/DFReader";


const types = {
    object: '[object Object]',
    array: '[object Array]',
    function: '[object Function]',
    null: '[object Null]',
    undefined: '[object Undefined]'
}

export class Utils {
    public static StringUtil = CCStringUtil;
    public static DateUtil = CCDateUtil;
    public static MathUtil = CCMathUtil;
    public static EngineUtil = CCEngineUtil;
    public static ObjectUtil = CCObjectUtil;

    /**配置表数据文件读取模块 */
    public static get fileReader() { return DFReader.instance; }
}

export namespace Utils {

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
        return cc.js.isNumber(arg);
    }

    export function isString(arg: any): boolean {
        return cc.js.isString(arg);
    }

    export function isNull(arg: any): boolean {
        return Object.prototype.toString.call(arg) === types.null;
    }

    export function isUndefined(arg: any): boolean {
        return Object.prototype.toString.call(arg) === types.undefined || typeof arg === 'undefined';
    }

    /**
     * 动画播放和管理模块，可以实现多个动画顺序播放，会创建Animat对象。
     * 此函数有两个参数，第一个参数是挂载动画的节点，第二个是动画资源所在的资源包，如果是动态加载资源，则需要从这个资源包中加载，
     * 默认是resources资源包
     * @param target 
     * @param bundle 
     * @returns 
     */
    export function animat(target: cc.Node, bundle: string = cc.resources.name) {
        return Animat.create(bundle).target(target);
    }

    /**
     * 音频播放和管理的模块，可以实现多个音频顺序播放，会创建一个Audio对象，此Audio类不是引擎的Audio类，要注意区分。
     * 此函数需要传入一个音频资源所在资源包名或资源包路径，默认是resources资源包
     * @param bundle 
     * @returns 
     */
    export function audio(bundle: string = cc.resources.name) {
        return Audio.create(bundle);
    }
}