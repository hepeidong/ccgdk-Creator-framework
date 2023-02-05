import { AdManager } from "../AdManager";


const AdTheme = ['white', 'black'];

const AdThemeType = cc.Enum({
    white: 0,
    black: 1
});

const GridCountType = cc.Enum({
    5: 5,
    8: 8
});

const { ccclass, property, menu, disallowMultiple } = cc._decorator;

@ccclass
@disallowMultiple()
@menu('游戏通用组件/广告/GridAd(GridAd格子广告管理组件)')
export default class GridAd extends cc.Component {

    @property
    private adUnitId: string = '';

    @property({
        type: AdThemeType,
        tooltip: '广告组件的主题'
    })
    private adTheme = AdThemeType.white;

    @property({
        type: GridCountType,
        tooltip: '广告组件的格子个数'
    })
    private gridCount = GridCountType[5];

    private _adMgr: AdManager;

    onLoad () {
        this._adMgr = new AdManager();
    }

    start () {

    }

    public showGridAd() {
        if (CC_WECHATGAME) {
            this._adMgr.showGridAd(this.node, this.adUnitId, AdTheme[this.adTheme] as 'white'|'black', this.gridCount as 5|8);
        }
    }

    public hide() {
        this._adMgr.hideGridAd();
    }

    onEnable() {
        this.showGridAd();
    }

    onDestroy() {
        this.hide();
    }

    onDisable() {
        this.hide();
    }

    // update (dt) {}
}
