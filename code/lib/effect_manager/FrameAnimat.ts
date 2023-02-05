import { SAFE_CALLBACK } from "../Define";
import { Tools, Utils } from "../cck";
import { ClipLoad } from "../res_manager/LoadAnimation";
import AnimatBase from "./AnimatBase";

export default class FrameAnimat extends AnimatBase {
    private _animator: cc.Animation;
    /**动画队列 */
    private _animatList: Tools.CircularQueue<frameAnimat_t>;
    private static isStop: boolean = false;
    constructor(target: cc.Node, bundle: string) {
        super(() => {
            if (FrameAnimat.isStop && this._animatList) {
                for (let i: number = 0; i < this._animatList.length; ++i) {
                    this._animatList[i].props.played = true;
                }
                this.stop();
            }
            FrameAnimat.isStop = false;
        });

        this._animatLoad = new ClipLoad(bundle)
        this._animatList = new Tools.CircularQueue();
        this._target = target;
        this._animator = this._target.getComponent(cc.Animation);
        if (!this._animator) {
            this._status = 'rejected';
            this._err = new Error('该节点没有Animation组件!');
        }
        else {
            this.registerEvent();
        }
    }

    public static stopAll(): void {
        this.isStop = true;
    }

    public getAnimation(): cc.Animation {
        return this._animator;
    }

    public addCallback(callback: resolved_t): void {
        let len: number = this._animatList.length;
        this._animatList[len - 1].callbacks.push(callback);
    }

    public addAnimatProps(props: IFrameAnimat): void {
        try {
            props.delay = props.delay ? props.delay : 0;
            // props.loop = props.loop ? props.loop : false;
            props.repeatCount = props.repeatCount;
            props.startTime = props.startTime ? props.startTime : 0;
            props.default = props.default ? props.default : false;
            props.played = props.played ? props.played : false;

            if (props.default) {
                props.name = this._animator.defaultClip.name;
            }
            this._animatList.push({ props: props, callbacks: [] });
        } catch (error) {
            this._status = 'rejected';
            this._err = error;
        }
    }

    //加载clip动画
    public async animationLoaded(props: IFrameAnimat) {
        if (props.clip) {
            this.addClip(props.clip);
        }
        else {
            let asset = await this.awaitLoad(cc.Animation, props.url);
            if (asset) {
                this.addClip(asset);
            }
        }
    }

    public play(): FrameAnimat {
        try {
            if (this._status === 'pending') {
                this._status = 'resolved';
                let props: IFrameAnimat = this._animatList[this.index].props;
                //没有播放完成
                if (!props.played) {
                    let state: cc.AnimationState = this._animator.getAnimationState(props.name);
                    state.delay = props.delay;
                    state.time = props.startTime;
                    //迭代播放动画若干次
                    if (!Utils.isUndefined(props.repeatCount) && !Utils.isNull(props.repeatCount)) {
                        state.repeatCount = props.repeatCount;
                    }
                    
                    if (Utils.isUndefined(props.speed) && Utils.isNull(props.speed)) {
                        state.speed = props.speed;
                    }
                    if (props.duration !== undefined && props.duration !== null) {
                        state.duration = props.duration;
                    }
                    
                    this._animator.play(props.name);
                }
            }
        } catch (error) {
            this._status = 'rejected';
            this._err = error;
        }
        return this;
    }

    public onNext(callback: Function): FrameAnimat {
        this._nextCallback = callback;
        return this;
    }

    public stop(): FrameAnimat {
        for (let i: number = 0; i < this._animatList.length; ++i) {
            this._animator.stop(this._animatList[i].props.name);
        }
        return this;
    }

    public catch(reject: (e: Error) => void): void {
        if (this._status === 'rejected') {
            SAFE_CALLBACK(reject, this._err);
        }
    }

    public pause(): FrameAnimat {
        for (let i: number = 0; i < this._animatList.length; ++i) {
            this._animator.pause(this._animatList[i].props.name);
        }
        return this;
    }

    public resume(): FrameAnimat {
        for (let i: number = 0; i < this._animatList.length; ++i) {
            this._animator.resume(this._animatList[i].props.name);
        }
        return this;
    }

    private addClip(clip: cc.AnimationClip): void {
        this._animator.addClip(clip);
    }

    private registerEvent(): void {
        this._animator.off('play');
        this._animator.off('stop');
        this._animator.on('play', (evt: cc.Event.EventCustom) => {
            if (this.index >= this._animatList.length) return;
            let callbacks: resolved_t[] = this._animatList[this.index].callbacks;
            for (let e of callbacks) {
                if (e.type === 'play') {
                    SAFE_CALLBACK(e.call, evt);
                }
            }
        }, this);
        this._animator.on('stop', (evt: cc.Event.EventCustom) => {
            if (this.index >= this._animatList.length) return;
            let callbacks: resolved_t[] = this._animatList[this.index].callbacks;
            for (let e of callbacks) {
                if (e.type === 'stop') {
                    SAFE_CALLBACK(e.call, evt);
                }
            }
            this.index++;
            if (this.index < this._animatList.length) {
                this._status = 'pending';
                SAFE_CALLBACK(this._nextCallback);
            }
        }, this);
    }
}