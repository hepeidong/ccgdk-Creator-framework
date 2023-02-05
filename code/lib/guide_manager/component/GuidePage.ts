import { addGuideElement } from "../guide_utils";
import { Debug, Guide } from "../../cck";

const scopeType = cc.Enum(Guide.Scope);

const {ccclass, menu, 
    disallowMultiple, property, executionOrder} = cc._decorator;

@ccclass
@disallowMultiple
@executionOrder(100)
@menu('游戏通用组件/引导/GuidePage(引导页面组件,绑定在需要引导的窗口页面)')
export default class GuidePage extends cc.Component {

    @property({
        type: cc.Node,
        displayName: '引导页面节点',
        tooltip: '一般为预制体窗口节点'
    })
    target: cc.Node = null;

    @property({
        step: 1,
        tooltip: '当前页面的uiId',
        displayName: '视图ID'
    })
    private uiId: string = '';

    @property({
        type: scopeType,
        tooltip: `CHILD_PANEL:游戏过程中附加到窗口的单独的面板;
        PARENT_PANEL:整个窗口页面
        `
    })
    private scope: Guide.Scope = Guide.Scope.PARENT_PANEL;

    private _runOnLoad: boolean = false;

    onLoad () {
        this._runOnLoad = true;
        this.handleGuideView();
    }

    start () {
        
    }

    onEnable() {
        if (this._runOnLoad) {
            this.handleGuideView();
        }
    }

    onDisable() {
        Guide.guideManager.removeGuideView(this.uiId, this.scope as number);
    }

    onDestroy() {
        Guide.guideManager.removeGuideView(this.uiId, this.scope as number);
    }

    private handleGuideView() {
        if (Guide.guideManager.hasGuideAction()) {
            this.addGuideElement();
            if (this.scope === Guide.Scope.PARENT_PANEL) {
                Guide.guideManager.nextGuideInSwitchUI();
            }
            Guide.guideManager.againExecute(this.scope);
        }
    }

    private addGuideElement() {
        addGuideElement(this.uiId, this.target, this.scope);
        Debug.log('引导节点列表', this.uiId, this.scope, Guide.guideManager.getGuideTargets());
    }

    // update (dt) {}
}
