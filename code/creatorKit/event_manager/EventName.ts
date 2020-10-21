// import CreatorKit from "../Kit";

/**
 * 事件类型
 */
export class EventName {
    public static RELEASE = 'release';
    public static RETAIN = 'retain';
    /**资源释放前 */
    public static DESTROYED_BEFORE = 'destroyed_before';
    /**资源释放后 */
    public static DESTROYED_AFTER = 'destroyed_after';
}