

enum AnimatType {
    /**普通帧动画 */
    ANIMATION,
    /**spine骨骼动画 */
    SPINE
}

/**
 * author: 何沛东
 * date: 2020/10/20
 * description: 动画播放管理，支持链式结构播放多个不同类型的动画，可以按顺序同时播放帧动画和spine骨骼动画，可以延迟播放动画，可以抛出错误异常
 */
export class Animat {
    private _target: cc.Node;
    private _animator: cc.Animation;
    private _skeleton: sp.Skeleton = null;
    private _status: string = 'pending';
    private _err: Error;
    private _animatIndex: number = 0;
    private _animatList: animat_t[] = [];
    public isStop: boolean = false;
    private _isPause: boolean = false;
    private _firstFlagOfSpine: boolean = false;
    private _firstFlagOfClip: boolean = false;
    private static _aniCtrlList: Animat[] = [];

    constructor() {

    }

    static get create() {
        let aniCtrl: Animat = new Animat();
        this._aniCtrlList.push(aniCtrl);
        return aniCtrl;
    }

    public target(node: cc.Node) {
        if (!node) {
            this._status = 'rejected';
            let res = typeof node;
            this._err = new Error('目标节点this._target为' + res+'!');
        }
        else if ((node instanceof cc.Node) === false) {
            this._status = 'rejected';
            this._err = new Error('目标节点this._target的类型不符!');
        }
        this._target = node;
        return this;
    }

    public static stopAll() {
        for (let i: number = 0; i < this._aniCtrlList.length; ++i) {
            this._aniCtrlList[i].isStop = true;
            this._aniCtrlList.splice(i, 1);
        }
    }
    /**开始播放动画 */
    public play(): Animat {
        try {
            if (this._status === 'pending') {
                if (this._animatList[this._animatIndex].type === AnimatType.ANIMATION) {
                    if (!this._animator) {
                        this._status = 'rejected';
                        this._err = new Error('该节点没有Animation组件!');
                    }
                    else {
                        this._status = 'resolved';
                        this.playClip();
                    }
                }
                else if (this._animatList[this._animatIndex].type === AnimatType.SPINE) {
                    if (!this._skeleton) {
                        this._status = 'rejected';
                        this._err = new Error('该结点没有 Skeleton 组件！');
                    }
                    else {
                        this._status = 'resolved';
                        this.playSpine();
                    }
                }
            }

        } catch (error) {
            this._status = 'rejected';
            this._err = error;
        }
        return this;
    }
    /**停止动画 */
    stop(): Animat {
        try {
            if (this._status === 'pending') {
                this._firstFlagOfClip = false;
                this._firstFlagOfSpine = false;
                if (this._animatList[this._animatIndex].type === AnimatType.ANIMATION) {
                    let animat: IFrameAnimat = this._animatList[this._animatIndex].animat;
                    this._animator.stop(animat.name);
                }
                else if (this._animatList[this._animatIndex].type === AnimatType.SPINE) {
                    this._target && this._target.pauseSystemEvents(true);
                }
            }
        } catch (error) {
            this._status = 'rejected';
            this._err = error;
        }
        return this;
    }
    /**暂停电画 */
    pause(): Animat {
        try {
            if (this._status === 'pending') {
                this._isPause = true;
                if (this._animatList[this._animatIndex].type === AnimatType.ANIMATION && this._animator) {
                    let animat: IFrameAnimat = this._animatList[this._animatIndex].animat;
                    this._animator.pause(animat.name);
                }
                else if (this._animatList[this._animatIndex].type === AnimatType.SPINE && this._skeleton) {
    
                }
            } 
        } catch (error) {
            this._status = 'rejected';
            this._err = error;
        }
        return this;
    }
    /**恢复动画 */
    resume(): Animat {
        try {
            if (this._status === 'pending') {
                this._isPause = false;
                if (this._animatList[this._animatIndex].type === AnimatType.ANIMATION && this._animator) {
                    let animat: IFrameAnimat = this._animatList[this._animatIndex].animat;
                    this._animator.resume(animat.name);
                }
                else if (this._animatList[this._animatIndex].type === AnimatType.SPINE && this._skeleton) {
    
                }
            }
        } catch (error) {
            this._status = 'rejected';
            this._err = error;
        }
        return this;
    }

    /**
     * 播放默认剪辑动画
     * @param delay 
     * @param startTime 
     */
    defaultClip(delay?: number, startTime?: number): Animat {
        try {
            if (this._status === 'pending') {
                this._animator = this._target.getComponent(cc.Animation);
                let animat: animat_t = {
                    type: AnimatType.ANIMATION,
                    animat: {
                        name: this._animator.defaultClip.name, 
                        delay: delay ? delay : 0,
                        startTime: startTime ? startTime : 0, 
                        isDefault: true
                    }, callbacks: []
                };
                this._animatList.push(animat);
            }
        } catch (error) {
            this._status = 'rejected';
            this._err = error;
        }
        return this;
    }

    /**
     * 把要播放的剪辑动画压入队列中，等待播放，如果当前对象没有该剪辑动画，则可以传入clip为对象增加剪辑动画
     * @param props 剪辑动画属性
     * @param clip 剪辑动画
     */
    clip(props: IFrameAnimat, clip?: cc.AnimationClip): Animat {
        try {
            if (this._status === 'pending') {
                this._animator = this._target.getComponent(cc.Animation);
                if (clip) {
                    this._animator.addClip(clip, props.name);
                }
                props.delay = props.delay ? props.delay : 0;
                props.isLoop = props.isLoop ? props.isLoop : false;
                props.repeatCount = props.repeatCount ? props.repeatCount : 1;
                props.speed = (props.speed === null || props === undefined) ? 1 : props.speed;
                props.startTime = props.startTime ? props.startTime : 0;
                let animat: animat_t = { type: AnimatType.ANIMATION, animat: props, callbacks: [] }
                this._animatList.push(animat);
            }
        } catch (error) {
            this._status = 'rejected';
            this._err = error;
        }
        return this;
    }

    /**
     * 把要播放的spine骨骼动画压入队列中，等待播放
     * @param props 骨骼动画属性
     */
    spine(props: ISpineAnimat): Animat {
        try {
            if (this._status === 'pending') {
                this._skeleton = this._target.getComponent(sp.Skeleton);
                props.delay = props.delay ? props.delay : 0;
                props.isLoop = props.isLoop ? props.isLoop : false;
                props.repeatCount = props.repeatCount ? props.repeatCount : 1;
                props.trackIndex = (props.trackIndex === null || props.trackIndex === undefined) ? 0 : props.trackIndex;
                let animat: animat_t = { type: AnimatType.SPINE, animat: props, callbacks: [] }
                this._animatList.push(animat);
            }
        } catch (error) {
            this._status = 'rejected';
            this._err = error;
        }
        return this;
    }

    /**
     * 增加动画播放的回调，play播放时执行，stop播放结束后执行
     */
    then(callType: 'play' | 'stop', resolved: (value?: string | cc.Event.EventCustom) => void): Animat {
        if (this._status === 'pending') {
            let len: number = this._animatList.length;
            if (len === 0) {
                this._status = 'rejected';
                this._err = new Error('必须先指定播放的哪个动画！');
                return this;
            }
            let resolvedCallback: resolved_t = { call: resolved, type: callType };
            this._animatList[len - 1].callbacks.push(resolvedCallback);
        }
        return this;
    }

    /**捕获播放异常的方法，会给回调返回错误信息 */
    catch(rejected: (e: Error) => void): void {
        if (this._status === 'rejected') {
            rejected(this._err);
        }
    }

    private delAniCtrl() {
        let index: number = Animat._aniCtrlList.indexOf(this);
        if (index > -1) Animat._aniCtrlList.splice(index, 1);
    }

    private playClip() {
        if (this.isStop) {
            this._animator.stop();
            this._animator = null;
            return;
        }
        this._firstFlagOfClip = true;
        this._animator.off('play');
        this._animator.off('stop');
        this._animator.on('play', (evt) => {
            let callbacks = this._animatList[this._animatIndex].callbacks;
            for (let e of callbacks) {
                if (e.type === 'play') {
                    SAFE_CALLBACK(e.call, evt);
                }
            }
        }, this._target);
        this._animator.on('stop', (evt) => {
            let callbacks = this._animatList[this._animatIndex].callbacks;
            for (let e of callbacks) {
                if (e.type === 'stop') {
                    SAFE_CALLBACK(e.call, evt);
                }
            }
            this._animatIndex++;
            if (this._animatIndex < this._animatList.length) {
                //如果下一个不是剪辑动画，则判断是否为spine骨骼动画，进而进行播放
                if (this._animatList[this._animatIndex].type === AnimatType.ANIMATION) {
                    this.setClipState();
                }
                else if (this._animatList[this._animatIndex].type === AnimatType.SPINE) {
                    if (this._firstFlagOfSpine) {
                        let delay: number = (this._animatList[this._animatIndex].animat as ISpineAnimat).delay
                        this.setSepine((this._animatList[this._animatIndex].animat as ISpineAnimat).name, delay);
                    }
                    else {
                        this.playSpine();
                    }
                }
            }
            else {
                this.delAniCtrl();
            }
        }, this._target);
        this.setClipState();
    }

    private setClipState() {
        if (this.isStop) {
            this._animator && this._animator.stop();
            this._animator = null;
            return;
        }

        let animat: IFrameAnimat = (this._animatList[this._animatIndex].animat as IFrameAnimat);
        let state: cc.AnimationState = this._animator.getAnimationState(animat.name);
        state.delay = animat.delay;
        state.time = animat.startTime;
        if (animat.isDefault) {
            if (this._isPause) {
                this._animator.pause();
            }
            else {
                this._animator.play();
            }
        }
        else {
            state.repeatCount = animat.repeatCount;
            state.speed = animat.speed;
            if (animat.duration !== undefined && animat.duration !== null) {
                state.duration = animat.duration;
            }
            if (this._isPause) {
                this._animator.pause();
            }
            else {
                this._animator.play(animat.name);
            }
        }
    }

    private timeoutId: number = -1;
    private playSpine() {
        if (this.isStop) {
            this._skeleton = null;
            this._target.pauseSystemEvents(true);
            return;
        }
        this._firstFlagOfSpine = true;
        this._skeleton.setStartListener(() => {
            let animat: ISpineAnimat = (this._animatList[this._animatIndex].animat as ISpineAnimat);
            for (let e of this._animatList[this._animatIndex].callbacks) {
                if (e.type === 'play') {
                    SAFE_CALLBACK(e.call, animat.name);
                }
            }
        });
        this._skeleton.setCompleteListener(() => {
            let animat: ISpineAnimat = (this._animatList[this._animatIndex].animat as ISpineAnimat);
            for (let e of this._animatList[this._animatIndex].callbacks) {
                if (e.type === 'stop') {
                    SAFE_CALLBACK(e.call, animat.name);
                }
            }
            if (animat.repeatCount === 0) {
                this._animatIndex++;
            }
            if (this._animatIndex < this._animatList.length) {
                //如果下一个不是spine骨骼动画，则判断是否为剪辑动画，进而进行播放
                if (this._animatList[this._animatIndex].type === AnimatType.SPINE) {
                    if (this._animatList[this._animatIndex].animat.repeatCount > 0) {
                        this._animatList[this._animatIndex].animat.repeatCount--;
                        this._skeleton.setAnimation(0, (this._animatList[this._animatIndex].animat as ISpineAnimat).name, false);
                    }
                    else {
                        let delay: number = (this._animatList[this._animatIndex].animat as ISpineAnimat).delay
                        this.setSepine((this._animatList[this._animatIndex].animat as ISpineAnimat).name, delay);
                    }
                }
                else if (this._animatList[this._animatIndex].type === AnimatType.ANIMATION) {
                    if (this._firstFlagOfClip) {
                        this.setClipState();
                    }
                    else {
                        this.playClip();
                    }
                }
            }
            else {
                this.delAniCtrl();
            }
        });
        
        let animat: ISpineAnimat = (this._animatList[this._animatIndex].animat as ISpineAnimat);
        let delay: number = animat.delay;
        animat.repeatCount--;
        this.timeoutId = setTimeout(() => {
            clearTimeout(this.timeoutId);
            this._skeleton.setAnimation(0, (this._animatList[this._animatIndex].animat as ISpineAnimat).name, false);
        }, delay * 1000);
    }

    private setSepine(name: string, delay: number) {
        if (this.isStop) {
            this._skeleton = null;
            this._target.pauseSystemEvents(true);
            return;
        }
        this._skeleton.addAnimation(0, name, false, delay);
    }
}
