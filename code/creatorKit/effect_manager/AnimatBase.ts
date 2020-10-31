export default abstract class AnimatBase {
    protected _status: string = 'pending';
    protected _err: Error;
    protected _target: cc.Node;
    protected index: number = 0;
    protected _nextCallback: Function;

    constructor(callback: Function) {
        cc.director.on(cc.Director.EVENT_BEFORE_UPDATE, callback, this);
    }

    abstract addCallback(callback: resolved_t): void;
    abstract addAnimatProps(props: any): void;
    /**开始播放 */
    abstract play(): any;
    /**停止播放 */
    abstract stop(): any;
    /**抛出异常 */
    abstract catch(reject: (e: Error) => void): void;
    /**下一个动画播放前的回调 */
    abstract onNext(callback: Function): any;

    public pause(): any {}
    public resume(): any {}
}