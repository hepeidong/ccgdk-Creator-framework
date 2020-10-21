import StringUtil from "./StringUtil";
import DateUtil from "./DateUtil";
import HttpUtil from "./HttpUtil";
import NumberUtil from "./NumberUtil";
import EngineUtil from "./EngineUtil";
import ObjectUtil from "./ObjectUtil";

 

export default class Utils {
    public static readonly StringUtil: typeof StringUtil = StringUtil;
    public static readonly DateUtil: typeof DateUtil = DateUtil;
    public static readonly HttpUtil: typeof HttpUtil = HttpUtil;
    public static readonly NumberUtil: typeof NumberUtil = NumberUtil;
    public static readonly EngineUtil: typeof EngineUtil = EngineUtil;
    public static readonly ObjectUtil: typeof ObjectUtil = ObjectUtil;

    constructor() {}
}