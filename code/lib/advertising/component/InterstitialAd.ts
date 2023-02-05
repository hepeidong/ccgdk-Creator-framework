import { EventSystem } from "../../event_manager/EventSystem";
import {AdManager} from "../AdManager";


const { ccclass, property, menu, disallowMultiple } = cc._decorator;

@ccclass
@disallowMultiple()
@menu('游戏通用组件/广告/InterstitialAd(Interstitial广告管理组件)')
export default class InterstitialAd extends cc.Component {

    @property({
        tooltip: '插屏广告ID'
    })
    private adUnitid: string = '';

    private _adMgr: AdManager;

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this._adMgr = new AdManager();
        EventSystem.click(this.node, this, this.onClicked);
    }

    start () {

    }

    onClicked() {
        this._adMgr.showInterstitialAd(this.adUnitid);
    }

    // update (dt) {}
}
