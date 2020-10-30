export default abstract class AnimatBase {
    protected _status: string = 'pending';
    protected _err: Error;
    protected _target: cc.Node;
    protected index: number = 0;
    protected _callbacks: resolved_t[];
    protected NEXT_ANIMAT: string = 'next_animat';

    constructor() {
        
    }

    abstract addCallback(callback: resolved_t): void;
    abstract addAnimatProps(props: any): void;
    abstract play(): any;
    abstract stop(): any;
    abstract catch(reject: (e: Error) => void): void;
    /**下一个动画播放前的回调 */
    abstract onNext(callback: Function): any;

    public pause(): any {}
    public resume(): any {}
}