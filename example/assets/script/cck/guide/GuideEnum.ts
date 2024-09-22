
export enum GuideNormalEvent {
    HIDE_BLOCK_INPUT_LAYER = 'hide_block_input_layer',
    FINGER_EVENT = 'finger_event',
    DIALOGUE_EVENT = 'dialogue_event',
    TEXT_EVENT = 'text_event',
    AGAIN_EXECUTE = 'again_execute'
}

 /**引导窗口面板类型 */
 export enum Scope {
    /**部分面板, 附加到其他窗口中的面板, 即以其他窗口为父节点 */
   CHILD_PANEL,
   /**整个窗口面板 */
   PARENT_PANEL
}
/**引导事件类型 */
export enum EventType {
   /**开始引导 */
   GUIDE_START = 'guide_start',
   /**每一步引导完成 */
   GUIDE_COMPLETE = 'guide_complete',
   /**引导结束 */
   GUIDE_OVER = 'guide_over',
   /**没有引导 */
   GUIDE_NONE = 'guide_none'
}
/**引导类型 */
export enum GuideType {
   /**手指引导 */
   FINGER,
   /**对话引导 */
   DIALOGUE,
   /**文本引导 */
   TEXT,
   /**图片引导 */
   PICTURE,
   /**动画引导 */
   ANIMATION
}