import { AnimatLoad } from "../res_manager/LoadAnimation";

export default abstract class AnimatBase {
    protected _status: string = 'pending';
    protected _err: Error;
    protected _target: cc.Node;
    protected index: number = 0;
    protected _nextCallback: Function;
    protected _animatLoad: AnimatLoad;

    constructor(callback: Function) {
        cc.director.on(cc.Director.EVENT_BEFORE_UPDATE, callback, this);
    }

    abstract addCallback(callback: resolved_t): void;
    abstract addAnimatProps(props: any): void;
    /**开始播放 */
    abstract play(): AnimatBase;
    /**停止播放 */
    abstract stop(): AnimatBase;
    /**抛出异常 */
    abstract catch(reject: (e: Error) => void): void;
    /**下一个动画播放前的回调 */
    abstract onNext(callback: Function): AnimatBase;

    public pause(): AnimatBase { return this; }
    public resume(): AnimatBase { return this; }

    protected awaitLoad(type: typeof cc.Component, url: string) {
        return new Promise((resolve: (val: any) => void, reject: (err: any) => void) => {
            const component = this._target.getComponent(type);
            if (component) {
                this._animatLoad.loadAnimat(url, (err, asset) => {
                    if (err) {
                        reject('rejected');
                        return;
                    }
                    resolve(asset);
                });
            }
            else {
                reject('rejected');
            }
        });
    }
}