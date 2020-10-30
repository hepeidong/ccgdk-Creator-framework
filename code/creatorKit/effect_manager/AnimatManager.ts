import FrameAnimat from "./FrameAnimat";
import SpineAnimat from "./SpineAnimat";


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
    private _status: string = 'pending';
    private _err: Error;
    private _animatIndex: number = 0;
    private _animators: AnimatType[] = [];
    private _frameAnimat: FrameAnimat;
    private _spineAnimat: SpineAnimat;

    constructor() {

    }

    static get create() {
        return new Animat();
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
        
    }
    private nextAnimat() {
        this._animatIndex++;
        if (this._animators[this._animatIndex] === AnimatType.ANIMATION) {
            this._frameAnimat.play();
        }
        else if (this._animators[this._animatIndex] === AnimatType.SPINE) {
            this._spineAnimat.play();
        }
    }
    /**开始播放动画 */
    public play(): Animat {
        try {
            if (this._status === 'pending') {
                if (this._animators[this._animatIndex] === AnimatType.ANIMATION) {
                    this._status = 'resolved';
                    this._frameAnimat.play()
                    .onNext(this.nextAnimat.bind(this))
                    .catch((e) => {
                        this._status = 'rejected';
                        this._err = e;
                    });
                }
                else if (this._animators[this._animatIndex] === AnimatType.SPINE) {
                    this._status = 'resolved';
                    this._spineAnimat.play()
                    .onNext(this.nextAnimat.bind(this))
                    .catch((e) => {
                        this._status = 'rejected';
                        this._err = e;
                    });
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
                if (this._animators[this._animatIndex] === AnimatType.ANIMATION) {
                    this._frameAnimat.stop().catch((e) => {
                        this._status = 'rejected';
                        this._err = e;
                    });
                }
                else if (this._animators[this._animatIndex] === AnimatType.SPINE) {
                    this._spineAnimat.stop().catch((e) => {
                        this._status = 'rejected';
                        this._err = e;
                    });
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
                if (this._animators[this._animatIndex] === AnimatType.ANIMATION) {
                    this._frameAnimat.pause().catch((e) => {
                        this._status = 'rejected';
                        this._err = e;
                    });
                }
                //spine动画暂时没有暂停
                // else if (this._animators[this._animatIndex] === AnimatType.SPINE) {
                    
                // }
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
                if (this._animators[this._animatIndex] === AnimatType.ANIMATION) {
                    this._frameAnimat.resume().catch((e) => {
                        this._status = 'rejected';
                        this._err = e;
                    });
                }
                //spine动画暂时没有恢复动画功能
                // else if (this._animators[this._animatIndex] === AnimatType.SPINE) {
    
                // }
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
                ///////////////////////////////////////////
                this._animators.push(AnimatType.ANIMATION);
                if (!this._frameAnimat) {
                    this._frameAnimat = new FrameAnimat(this._target);
                }
                //默认动画的名称不需要指定，直接获取默认动画的动画名称
                let props: IFrameAnimat = {
                    name: null,
                    delay: delay,
                    startTime: startTime,
                    default: true
                }
                this._frameAnimat.addAnimatProps(props);
            }
        } catch (error) {
            this._status = 'rejected';
            this._err = error;
        }
        return this;
    }

    /**
     * 把要播放的剪辑动画压入队列中，等待播放
     * @param props 剪辑动画属性
     */
    clip(props: IFrameAnimat): Animat {
        try {
            if (this._status === 'pending') {
                ///////////////////////////////////////////
                this._animators.push(AnimatType.ANIMATION);
                if (!this._frameAnimat) {
                    this._frameAnimat = new FrameAnimat(this._target);
                }
                this._frameAnimat.addAnimatProps(props);
            }
        } catch (error) {
            this._status = 'rejected';
            this._err = error;
        }
        return this;
    }

    /**
     * 增加剪辑动画
     * @param clip 剪辑动画 
     */
    addClip(clip: cc.AnimationClip): Animat {
        if (!this._frameAnimat) {
            this._frameAnimat = new FrameAnimat(this._target);
        }
        this._frameAnimat.addClip(clip);
        return this;
    }

    /**
     * 把要播放的spine骨骼动画压入队列中，等待播放
     * @param props 骨骼动画属性
     */
    spine(props: ISpineAnimat): Animat {
        try {
            if (this._status === 'pending') {
                ///////////////////////////////////
                this._animators.push(AnimatType.SPINE);
                if (!this._spineAnimat) {
                    this._spineAnimat = new SpineAnimat(this._target);
                }
                this._spineAnimat.addAnimatProps(props);
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
            let len: number = this._animators.length;
            if (len === 0) {
                this._status = 'rejected';
                this._err = new Error('必须先指定播放的哪个动画！');
                return this;
            }
            if (this._animators[len - 1] === AnimatType.ANIMATION) {
                this._frameAnimat.addCallback({ call: resolved, type: callType });
            }
            else if (this._animators[len - 1] === AnimatType.SPINE) {
                this._spineAnimat.addCallback({ call: resolved, type: callType });
            }
        }
        return this;
    }

    /**捕获播放异常的方法，会给回调返回错误信息 */
    catch(rejected: (e: Error) => void): void {
        if (this._status === 'rejected') {
            rejected(this._err);
        }
    }
}
