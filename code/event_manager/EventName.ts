
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
    /**设计内存不足 */
    public static DESIGN_OUT_OF_MEMORY = 'design_out_of_memory';
}