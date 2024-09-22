import { addGuideElement } from "../guide_utils";
import { Component, Enum, Node, _decorator } from "cc";
import { Debug } from "../../Debugger";
import { Scope } from "../GuideEnum";
import { GuideManager } from "../GuideManager";

const scopeType = Enum(Scope);

const {ccclass, menu, 
    disallowMultiple, property, executionOrder} = _decorator;

@ccclass
@disallowMultiple
@executionOrder(100)
@menu('游戏通用组件/引导/GuidePage(引导页面组件,绑定在需要引导的窗口页面)')
export  class GuidePage extends Component {

    @property({
        type: Node,
        displayName: '引导页面节点',
        tooltip: '一般为预制体窗口节点'
    })
    target: Node = null;

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
    private scope: Scope = Scope.PARENT_PANEL;

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
        GuideManager.instance.removeGuideView(this.uiId, this.scope as number);
    }

    onDestroy() {
        GuideManager.instance.removeGuideView(this.uiId, this.scope as number);
    }

    private handleGuideView() {
        if (GuideManager.instance.hasGuideAction()) {
            this.addGuideElement();
            if (this.scope === Scope.PARENT_PANEL) {
                GuideManager.instance.nextGuideInSwitchUI();
            }
            GuideManager.instance.againExecute(this.scope);
        }
    }

    private addGuideElement() {
        addGuideElement(this.uiId, this.target, this.scope);
        Debug.log('引导节点列表', this.uiId, this.scope, GuideManager.instance.getGuideTargets());
    }

    // update (dt) {}
}
