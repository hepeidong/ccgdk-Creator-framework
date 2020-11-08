/**
 * author: 何沛东
 * date: 2020/10/20
 * description: 音频播放管理，支持链式结构播放音频，可以顺序播放多个音频，延迟播放，抛出异常等等
 */
export class Audio {
    private _status: string = 'pending';
    private _err: Error;
    private _audioIndex: number = 0;
    private _audioList: audio_t[] = [];
    private audioId: number = 0;
    constructor() {
        
    }

    static get create(): Audio {
        return new Audio();
    }

    static stopAll() {
        cc.audioEngine.stopAll();
    }
    /**
     * 把要播放的音频压入队列中，等待播放
     * @param props 音频属性
     */
    public audio(props: IAudio): Audio {
        if (!props.url) {
            this._status = 'rejected';
            this._err = new Error('必须指定音频资源的路径！');
        }
        else {
            this.audioLoaded(props);
        }
        return this;
    }
    /**
     * 播放音频时要执行的回调
     * @param callType 回调类型
     * @param resolve 执行的回调
     */
    public when<T extends 'play'|'stop', P = T extends 'play'|'stop' ? play_callback_t : stop_callback_t>(callType: T, resolve: P): Audio {
        let len: number = this._audioList.length;
        if (len === 0) {
            this._status = 'rejected';
            this._err = new Error('必须先指定播放哪个音频！');
        }
        else {
            this._audioList[len - 1].callbacks.push({type: callType, call: resolve});
        }
        return this;
    }

    /**
     * 抛出异常
     * @param reject 
     */
    public cath(reject: (e: Error) => void): void {
        if (this._status === 'rejected') {
            SAFE_CALLBACK(reject, this._err);
        }
    }
    /**开始播放音频 */
    public play(): Audio {
        try {
            if (this._status === 'pending') {
                this.playInterval();
            }
        } catch (error) {
            this._status = 'rejected';
            this._err = error;
        }
        return this;
    }

    public stop(): Audio {
        if (this.audioId) {
            cc.audioEngine.stop(this.audioId);
        }
        return this;
    }

    private async audioLoaded(props: IAudio) {
        let clip: cc.AudioClip = await this.awaitLoad(props.url).catch((e) => {
            this._status = e;
        });
        if (clip) {
            let audio: audio_t = {audio: {
                url: props.url,
                loop: (props.loop === undefined || props.loop === null) ? false : props.loop,
                volume: (props.volume === null || props.volume === undefined) ? 1 : props.volume,
                delay: props.delay ? props.delay : 0,
            }, 
                callbacks: [],
                clip: clip
            };
            this._audioList.push(audio);
        }
    }

    private awaitLoad(url: string) {
        return new Promise((resolve: (val: any) => void, reject: (err: any) => void) => {
            kit.Loader.loadRes(url, (err, clip: cc.AudioClip) => {
                if (err) {
                    console.error('音频加载失败');
                    this._err = err;
                    reject('rejected');
                }
                else {
                    resolve(clip);
                }
            });
        });
    }

    private playAudio(resolves: audio_resolved_t[]) {
        if (this.audioId) {
            cc.audioEngine.stop(this.audioId);
        }
        let audio: IAudio = this._audioList[this._audioIndex].audio;
        this.audioId = cc.audioEngine.play(this._audioList[this._audioIndex].clip, audio.loop, audio.volume);

        cc.audioEngine.setFinishCallback(this.audioId, () => {
            for (let e of resolves) {
                if (e.type === 'stop') {
                   SAFE_CALLBACK(e.call, cc.audioEngine.getDuration(this.audioId));
                }
            }
            this._audioIndex++;
            if (this._audioIndex < this._audioList.length) {
                this.playInterval();
            }
        });
        for (let e of resolves) {
            if (e.type === 'play') {
                SAFE_CALLBACK(e.call, cc.audioEngine.getCurrentTime(this.audioId));
            }
        }
    }

    private _timeoutId: number;
    private playInterval() {
        let audio: IAudio = this._audioList[this._audioIndex].audio;
        this._timeoutId = setTimeout(() => {
            this.playAudio(this._audioList[this._audioIndex].callbacks)
            clearTimeout(this._timeoutId);
        }, audio.delay * 1000);
    }
}