import { Debug } from "../Debugger";
import { SAFE_CALLBACK } from "../Define";
import { DBLoad } from "../res_manager/LoadAnimation";
import { Utils } from "../utils/GameUtils";
import AnimatBase from "./AnimatBase";

export default class DragonBonesAnimat extends AnimatBase {
    private _selfDB: dragonBones.ArmatureDisplay;
    private _animatList: dragonBonesAnimat_t[];
    private _timeoutID: number = 0;

    private static isStop: boolean = false;
    constructor(target: cc.Node, bundle: string) {
        super(() => {
            if (DragonBonesAnimat.isStop && this._animatList) {
                for (let i: number = 0; i < this._animatList.length; ++i) {
                    this._animatList[i].props.played = true;
                }
                this.stop();
            }
            DragonBonesAnimat.isStop = false;
        });

        this._animatLoad = new DBLoad(bundle);
        this._animatList = [];
        this._target = target;
        this._selfDB = this._target.getComponent(dragonBones.ArmatureDisplay);
        if (!this._selfDB) {
            this._status = 'rejected';
            this._err = new Error('该结点没有 ArmatureDisplay 组件！');
        }
        else {
            this.registerEvent();
        }
    }

    public static stopAll(): void {
        this.isStop = true;
    }

    public getDB(): dragonBones.ArmatureDisplay {
        return this._selfDB;
    }

    public addCallback(callback: resolved_t): void {
        let len: number = this._animatList.length;
        this._animatList[len - 1].callbacks.push(callback);
    }

    public addAnimatProps(props: IDragonBonesAnimat): void {
        try {
            props.delay = props.delay ? props.delay : 0;
            props.loop = props.loop ? props.loop : false;
            props.played = props.played ? props.played : false;
            props.repeatCount = (Utils.isNull(props.repeatCount)  || Utils.isUndefined(props.repeatCount)) ? -1 : props.repeatCount;
            if (props.loop) {
                props.repeatCount = 0;
            }
            if (!Utils.isNull(props.timeScale) && !Utils.isUndefined(props.timeScale)) {
                this._selfDB.timeScale = props.timeScale;
            }
            this._animatList.push({ props: props, callbacks: [] });
        } catch (error) {
            this._status = 'rejected';
            this._err = error;
        }
    }

    //龙骨皮肤加载
    public async dBSkinLoaded(props: IDragonBonesAnimat, isClear: boolean) {
        if (props.url) {
            let asset = await this.awaitLoad(dragonBones.ArmatureDisplay, props.url);
            if (asset) {
                let dba: dragonBones.ArmatureDisplay = props.organ.getComponent(dragonBones.ArmatureDisplay);
                dba.dragonAsset = asset[0];
                dba.dragonAtlasAsset = asset[1];
                this.replaceSkin(props.organ.getComponent(dragonBones.ArmatureDisplay), isClear);
            }
        }
        else {
            this.replaceSkin(props.organ.getComponent(dragonBones.ArmatureDisplay));
        }
    }

    //加载龙骨动画
    public async dBLoaded(props: IDragonBonesAnimat) {
        if (props.url) {
            let asset = await this.awaitLoad(dragonBones.ArmatureDisplay, props.url);
            if (asset) {
                this.setDB(asset, props.armatureName);
            }
        }
    }

    /**开始播放 */
    public play(): DragonBonesAnimat {
        try {
            if (this._status === 'pending') {
                let props: IDragonBonesAnimat = this._animatList[this.index].props;
                if (!props.played) {
                    this.playInterval();
                }
            }
        } catch (error) {
            this._status = 'rejected';
            this._err = error;
        }
        return this;
    }
    
    /**停止播放 */
    public stop(): DragonBonesAnimat {
        this._target.pauseSystemEvents(true);
        return this;
    }

    /**抛出异常 */
    public catch(reject: (e: Error) => void): void {
        if (this._status === 'rejected') {
            SAFE_CALLBACK(reject, this._err);
        }
    }

    /**下一个动画播放前的回调 */
    public onNext(callback: Function): DragonBonesAnimat {
        this._nextCallback = callback;
        return this;
    }

    private setDB(asset: any[], armatureName: string) {
        this._selfDB.dragonAsset = asset[0];
        this._selfDB.dragonAtlasAsset = asset[1];
        this._selfDB.armatureName = armatureName;
    }

    /**
     * 替换皮肤
     * @param organAD 部位
     * @param isClear 不显示身体
     */
     private replaceSkin(organAD: dragonBones.ArmatureDisplay, isClear: boolean = false) {
        let factory: any = dragonBones.CCFactory.getInstance();
        Debug.assert(!this._selfDB.armature(), '当前龙骨的armature为' + typeof this._selfDB.armature());
        Debug.assert(!organAD.armature().armatureData.defaultSkin, '当前龙骨换皮部位的默认皮肤为' + typeof organAD.armature().armatureData.defaultSkin);
        Debug.error('替换的龙骨的armature', this._selfDB.armature(), organAD.armature().armatureData.defaultSkin);
        factory.replaceSkin(this._selfDB.armature(), organAD.armature().armatureData.defaultSkin, isClear);
    }

    private playInterval() {
        let props: IDragonBonesAnimat = this._animatList[this.index].props;
        if (props.delay > 0) {
            this._timeoutID = setTimeout(() => {
                clearTimeout(this._timeoutID);
                this._selfDB.playAnimation(props.name, props.repeatCount);
            }, this._animatList[this.index].props.delay * 1000);
        }
        else {
            this._selfDB.playAnimation(props.name, props.repeatCount);
        }
    }

    private registerEvent() {
        this._selfDB.off(dragonBones.EventObject.START);
        this._selfDB.off(dragonBones.EventObject.COMPLETE);
        this._selfDB.off(dragonBones.EventObject.LOOP_COMPLETE);
        this._selfDB.on(dragonBones.EventObject.START, (evt: any) => {
            let animat: spineAnimat_t = this._animatList[this.index];
            if (animat) {
                let callbacks: resolved_t[] = animat.callbacks;
                for (let e of callbacks) {
                    if (e.type === 'play') {
                        SAFE_CALLBACK(e.call, evt);
                    }
                }
            }
            
        }, this);
        this._selfDB.on(dragonBones.EventObject.COMPLETE, (evt: any) => {
            let animat: spineAnimat_t = this._animatList[this.index];
            if (animat) {
                let callbacks: resolved_t[] = animat.callbacks;
                for (let e of callbacks) {
                    if (e.type === 'stop') {
                        SAFE_CALLBACK(e.call, evt);
                    }
                }
            }
            

            this.index++;
            if (this.index < this._animatList.length) {
                this._status = 'pending';
                SAFE_CALLBACK(this._nextCallback);
            }
        }, this);

        this._selfDB.on(dragonBones.EventObject.LOOP_COMPLETE, (evt: any) => {
            let animat: spineAnimat_t = this._animatList[this.index];
            if (animat) {
                let callbacks: resolved_t[] = animat.callbacks;
                for (let e of callbacks) {
                    if (e.type === 'complate') {
                        SAFE_CALLBACK(e.call, evt);
                    }
                }
            }
            
        }, this);
    }
}