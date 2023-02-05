import FrameAnimat from "./FrameAnimat";
import SpineAnimat from "./SpineAnimat";
import DragonBonesAnimat from "./DragonBonesAnimat";


enum AnimatType {
    /**普通帧动画 */
    ANIMATION,
    /**spine骨骼动画 */
    SPINE,
    /**龙骨动画 */
    DRAGON_BONES
}

/**
 * author: 何沛东
 * date: 2020/10/20
 * description: 动画播放管理，支持链式结构按顺序播放多个不同类型的动画，可以延迟播放动画，可以抛出错误异常
 */
export class Animat {
    private _target: cc.Node;
    private _status: string = 'pending';
    private _bundle: string;
    private _err: Error;
    private _animatIndex: number = 0;
    private _animators: AnimatType[] = [];
    private _frameAnimat: FrameAnimat;
    private _spineAnimat: SpineAnimat;
    private _dbAnimat: DragonBonesAnimat;

    constructor(bundle: string) {
        this._bundle = bundle;
    }

    public static create(bundle: string) {
        return new Animat(bundle);
    }

    public static stopAll(): void {
        FrameAnimat.stopAll();
        SpineAnimat.stopAll();
        DragonBonesAnimat.stopAll();
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

    /**返回帧动画组件 */
    public getClip(): cc.Animation {
        return this._frameAnimat.getAnimation();
    }

    /**返回spine骨骼动画组件 */
    public getSpine(): sp.Skeleton {
        return this._spineAnimat.getSkeleton();
    }

    /**dragonBones骨骼动画组件 */
    public getDB(): dragonBones.ArmatureDisplay {
        return this._dbAnimat.getDB();
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
                else if (this._animators[this._animatIndex] === AnimatType.DRAGON_BONES) {
                    this._status = 'resolved';
                    this._dbAnimat.play()
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
    public stop(): Animat {
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
                else if (this._animators[this._animatIndex] === AnimatType.DRAGON_BONES) {
                    this._dbAnimat.stop().catch((e) => {
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
    /**暂停动画 */
    public pause(): Animat {
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
    public resume(): Animat {
        try {
            if (this._status === 'pending') {
                if (this._animators[this._animatIndex] === AnimatType.ANIMATION) {
                    this._frameAnimat.resume().catch((e) => {
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

    /**
     * 播放默认剪辑动画
     * @param delay 
     * @param startTime 
     */
    public defaultClip(delay?: number, startTime?: number): Animat {
        try {
            if (this._status === 'pending') {
                ///////////////////////////////////////////
                this._animators.push(AnimatType.ANIMATION);
                if (!this._frameAnimat) {
                    this._frameAnimat = new FrameAnimat(this._target, this._bundle);
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
    public clip(props: IFrameAnimat): Animat {
        try {
            if (this._status === 'pending') {
                ///////////////////////////////////////////
                this._animators.push(AnimatType.ANIMATION);
                if (!this._frameAnimat) {
                    this._frameAnimat = new FrameAnimat(this._target, this._bundle);
                }
                this._frameAnimat.animationLoaded(props).catch((e) => {
                    this._status = e;
                    this._err = new Error('clip动画加载错误！');
                });
                this._frameAnimat.addAnimatProps(props);
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
    public spine(props: ISpineAnimat): Animat {
        try {
            if (this._status === 'pending') {
                ///////////////////////////////////
                this._animators.push(AnimatType.SPINE);
                if (!this._spineAnimat) {
                    this._spineAnimat = new SpineAnimat(this._target, this._bundle);
                }
                this._spineAnimat.skeletonLoaded(props).catch((e) => {
                    this._status = e;
                    this._err = new Error('spine骨骼动画加载错误！');
                });
                this._spineAnimat.addAnimatProps(props);
            }
        } catch (error) {
            this._status = 'rejected';
            this._err = error;
        }
        return this;
    }

    /**
     * 把要播放的dragonBones骨骼动画压入队列中，等待播放
     * @param props 骨骼动画属性
     */
    public db(props: IDragonBonesAnimat): Animat {
        try {
            if (this._status === 'pending') {
                this._animators.push(AnimatType.DRAGON_BONES);
                if (!this._dbAnimat) {
                    this._dbAnimat = new DragonBonesAnimat(this._target, this._bundle);
                }
                this._dbAnimat.dBLoaded(props).catch((e) => {
                    this._status = e;
                    this._err = new Error('dragonBones骨骼动画加载错误！');
                });
                this._dbAnimat.addAnimatProps(props);
            }
        } catch (error) {
            this._status = 'rejected';
            this._err = error;
        }
        return this;
    }

    /**
     * 替换龙骨皮肤
     * @param props 龙骨属性 
     * @param isClear 不显示身体
     */
    public replaceDBSkin(props: IDragonBonesAnimat, isClear: boolean = false): Animat {
        try {
            if (!this._dbAnimat) {
                this._dbAnimat = new DragonBonesAnimat(this._target, this._bundle);
            }
            
            this._dbAnimat.dBSkinLoaded(props, isClear).catch((e) => {
                this._status = e;
                this._err = new Error('dragonBones骨骼动画皮肤加载错误！');
            });
        } catch (error) {
            this._status = 'rejected';
            this._err = error;
        }
        return this;
    }

    /**
     * 增加动画播放时的回调
     * @param resolved 
     */
    public onPlay(resolved: (value: any) => void): Animat {
        this.addCallback(resolved, 'play');
        return this;
    }

    /**
     * 增加动画播放结束后的回调
     * @param resolved 
     */
    public onStop(resolved: (value: any) => void): Animat {
        this.addCallback(resolved, 'stop');
        return this;
    }

    /**
     * 增加循环播放完成一次的回调
     * @param resolved 
     */
    public onComplate(resolved: (value: any) => void): Animat {
        this.addCallback(resolved, 'complate');
        return this;
    }

    /**捕获播放异常的方法，会给回调返回错误信息 */
    public catch(rejected: (e: Error) => void): void {
        if (this._status === 'rejected') {
            rejected(this._err);
        }
    }

    private nextAnimat() {
        this._animatIndex++;
        if (this._animators[this._animatIndex] === AnimatType.ANIMATION) {
            this._frameAnimat.play();
        }
        else if (this._animators[this._animatIndex] === AnimatType.SPINE) {
            this._spineAnimat.play();
        }
        else if (this._animators[this._animatIndex] === AnimatType.DRAGON_BONES) {
            this._dbAnimat.play();
        }
    }

    private addCallback(resolved: (value: any) => void, type: string) {
        if (this._status === 'pending') {
            let len: number = this._animators.length;
            if (len === 0) {
                this._status = 'rejected';
                this._err = new Error('必须先指定播放的哪个动画！');
                return this;
            }
            if (this._animators[len - 1] === AnimatType.ANIMATION) {
                this._frameAnimat.addCallback({ call: resolved, type: type });
            }
            else if (this._animators[len - 1] === AnimatType.SPINE) {
                this._spineAnimat.addCallback({ call: resolved, type: type });
            }
            else if (this._animators[len - 1] === AnimatType.DRAGON_BONES) {
                this._dbAnimat.addCallback({ call: resolved, type: type });
            }
        }
    }
}
