import { SAFE_CALLBACK } from "../Define";
import { Tools } from "../cck";
import { SpineLoad } from "../res_manager/LoadAnimation";
import AnimatBase from "./AnimatBase";


export default class SpineAnimat extends AnimatBase {
    private _skeleton: sp.Skeleton;
    /**动画队列 */
    private _animatList: Tools.CircularQueue<spineAnimat_t>;
    private timeoutId: number = 0;
    private static isStop: boolean = false;
    constructor(target: cc.Node, bundle: string) {
        super(() => {
            if (SpineAnimat.isStop && this._animatList) {
                for (let i: number = 0; i < this._animatList.length; ++i) {
                    this._animatList[i].props.played = true;
                }
                this.stop();
            }
            SpineAnimat.isStop = false;
        });

        this._animatLoad = new SpineLoad(bundle);
        this._animatList = new Tools.CircularQueue();
        this._target = target;
        this._skeleton = this._target.getComponent(sp.Skeleton);
        if (!this._skeleton) {
            this._status = 'rejected';
            this._err = new Error('该结点没有 Skeleton 组件！');
        }
        else {
            this.registerEvent();
        }
    }

    public static stopAll(): void {
        this.isStop = true;
    }

    public getSkeleton(): sp.Skeleton {
        return this._skeleton;
    }

    public addCallback(callback: resolved_t) {
        let len: number = this._animatList.length;
        this._animatList[len - 1].callbacks.push(callback);
    }

    public setSkeletonData(data: sp.SkeletonData) {
        this._skeleton.skeletonData = data;
    }

    public addAnimatProps(props: ISpineAnimat): void {
        try {
            props.delay = props.delay ? props.delay : 0;
            props.loop = props.loop ? props.loop : false;
            props.repeatCount = props.repeatCount ? props.repeatCount : 1;
            props.trackIndex = (props.trackIndex === null || props.trackIndex === undefined) ? 0 : props.trackIndex;
            props.played = props.played ? props.played : false;

            this._animatList.push({props: props, callbacks: []});
        } catch (error) {
            this._status = 'rejected';
            this._err = error;
        }
    }

    //加载spine骨骼动画
    public async skeletonLoaded(props: ISpineAnimat) {
        if (props.url) {
            let asset = await this.awaitLoad(sp.Skeleton, props.url);
            if (asset) {
                this.setSkeletonData(asset);
            }
        }
    }

    public play(): SpineAnimat {
        try {
            if (this._status === 'pending') {
                this._status = 'resolved';
                let props: ISpineAnimat = this._animatList[this.index].props;
                if (!props.played) {
                    if (this.index === 0) {
                        this.playInterval();
                    }
                    else {
                        props.repeatCount--;
                        this._skeleton.addAnimation(props.trackIndex, props.name, props.loop, props.delay);
                    }
                }
            }
        } catch (error) {
            this._status = 'rejected';
            this._err = error;
        }
        return this;
    }

    public onNext(callback: Function): SpineAnimat {
        this._nextCallback = callback;
        return this;
    }

    public stop(): SpineAnimat {
        this._target.pauseSystemEvents(true);
        return this;
    }

    public catch(reject: (e: Error) => void): void {
        if (this._status === 'rejected') {
            SAFE_CALLBACK(reject, this._err);
        }
    }

    private playInterval() {
        this.timeoutId = setTimeout(() => {
            clearTimeout(this.timeoutId);
            let props: ISpineAnimat = this._animatList[this.index].props;
            props.repeatCount--;
            this._skeleton.setAnimation(props.trackIndex, props.name, props.loop);
        }, this._animatList[this.index].props.delay * 1000);
    }

    private registerEvent(): void {
        this._skeleton.setStartListener((evt: any) => {
            let callbacks: resolved_t[] = this._animatList[this.index].callbacks;
            for (let e of callbacks) {
                if (e.type === 'play') {
                    SAFE_CALLBACK(e.call, evt);
                }
            }
        });

        this._skeleton.setCompleteListener((evt: any) => {
            let animat: spineAnimat_t = this._animatList[this.index];
            for (let e of animat.callbacks) {
                if (e.type === 'stop') {
                    SAFE_CALLBACK(e.call, evt);
                }
            }

            let props: ISpineAnimat = animat.props;
            //迭代播放动画若干次
            if (props.repeatCount > 0 && !props.loop) {
                props.repeatCount--;
                this._skeleton.setAnimation(props.trackIndex, props.name, false);
            }
            else {
                this.index++;
                if (this.index < this._animatList.length) {
                    this._status = 'pending';
                    SAFE_CALLBACK(this._nextCallback);
                }
            }
        });
    }
}