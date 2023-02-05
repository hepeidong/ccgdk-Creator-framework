import { Debug } from "../Debugger";
import { Assert } from "../exceptions/Assert";
import GuideHelper from "../guide_manager/component/GuideHelper";
import { UI } from "./cck_ui";
import { WindowBase } from "./WindowBase";
import { WindowManager } from "./WindowManager";

/**
 * author: HePeiDong
 * date: 2021/2/20
 * name: 引导提示页面页面控制器基类
 * description: 控制引导提示页面的相关显示,关闭,销毁,资源释放
 */
export class GuideView extends WindowBase<GuideHelper> implements IGuideView {

    public show() {
        Debug.log('显示引导视图');
        WindowManager.instance.open(this.accessId);
    }

    onCreate(): UI.Type {
        this.isAddMask(true);
        return UI.Type.TOP;
    }

    protected _loadView() {
        const components = this.node.getComponents(cc.Component);
        for (const component of components) {
            if (component instanceof GuideHelper) {
                this.setViewComponent(component);
                return;
            }
        }
        //缺少GuideHelper组件
        Assert.instance.handle(Assert.Type.GetComponentException, null, "GuideHelper");
    }

    protected _openView() {
        this.popupView();
    }

    protected _closeView() {
        WindowManager.instance.delView(this.getViewType());
    }
}