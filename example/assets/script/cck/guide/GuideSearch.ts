import { Debug } from "../Debugger";
import { GuideTarget } from "./component/GuideTarget";
import { GuideNormalEvent, Scope } from "./GuideEnum";
import { WidgetID } from "./WidgetID";
import { Node } from "cc";
import { IContainer, IGuideConfig } from "../lib.cck";
import { EventSystem } from "../event";
import { getPriority, setPriority } from "../util";

type panel_t = {
    target: Node;
    scope: Scope;
}

/**检索引导目标 */
 export class GuideSearch {
    private _zIndex: number;                                   //引导目标渲染层级
    //重新发起执行引导, 本质是向GuideHelper组件发射AGAIN_EXECUTE事件, 再次触发引导执行,
    //这种情况在于发起引导时UI还未准备好, 暂时中断了, 所以UI准备好后要重新开始
    private _againExecute: boolean;                                                         
    private _guideFile: IContainer<IGuideConfig>;    //引导配置文件数据
    private _guidePanels: Map<string, panel_t>;                //被引导的页面节点
    private _guideTargets: Map<string, GuideTarget>;       //引导目标
    private _lightTargets: Map<number, Node[]>;             //高亮的目标节点

    constructor() {
        this._zIndex = 1;
        this._againExecute = false;
        this._guidePanels = new Map();
        this._guideTargets = new Map();
        this._lightTargets = new Map();
    }

    public isViewOpen(uiId: string): boolean { return this._guidePanels.has(uiId); }
    public getGuideFile(): IContainer<IGuideConfig> { return this._guideFile; }
    public getGuideTargets(): Map<string, GuideTarget> { return this._guideTargets; }
    public getLightTargets(): Map<number, Node[]> { return this._lightTargets; }


    public setAgainExecute(againExecute: boolean) {
        this._againExecute = againExecute;
    }

    /**
     * 设置引导数据文件
     * @param file 
     */
    public setGuideFile(file: IContainer<IGuideConfig>): void {
        this._guideFile = file;
    }

    public addGuideView(uiId: string, target: Node, scope: Scope) {
        if (!this._guidePanels.has(uiId)) {
            this._guidePanels.set(uiId, {target, scope});
            this.searchGuideTarget(target);
        }
        else if (scope === Scope.CHILD_PANEL) {
            this.searchGuideTarget(target);
        }
    }

    public removeGuideView(uiId: string, scope: Scope) {
        if (scope === Scope.PARENT_PANEL) {
            this._guidePanels.delete(uiId);
        }
    }

    public againExecute(scope: Scope) {
        if (scope === Scope.CHILD_PANEL && this._againExecute) {
            EventSystem.event.emit(GuideNormalEvent.AGAIN_EXECUTE);
        }
    }

    /**
     * 检索到所有高亮的节点
     * @param guideId 
     */
    public searchLightTarget(guideId: number) {
        let uiId: string = this._guideFile.get(guideId).light[0];
        let panel = this._guidePanels.get(uiId);
        if (panel && panel.scope === Scope.PARENT_PANEL) {
            this.addLightTarget(guideId, this._guidePanels.get(uiId).target);
        }
        else {
            uiId = this._guideFile.get(guideId).uiId;
            this.traversalChild(this._guidePanels.get(uiId).target, (target: Node) => {
                this.storageLightTarget(guideId, target);
            });
        }
    }

    public addGuideTarget(target: GuideTarget) {
        if (!target || !target.target) {
            return false;
        }
        if (target) {
            if (!this._guideTargets.has(target.targetId) && target.targetId.length > 0) {
                this._guideTargets.set(target.targetId, target);
            }
            return true;
        }
        else {
            Debug.error(`${target.target.name}节点不是引导节点`);
            debugger;
        }
    }

    public addLightTarget(guideId: number, target: Node) {
        if (!target) {
            Debug.error(`传入的类型为${typeof target}的参数不是一个节点`);
            return false;
        }
        if (!this._lightTargets.has(guideId)) {
            this._lightTargets.set(guideId, [target]);
        }
        else {
            let nodes: Node[] = this._lightTargets.get(guideId);
            if (nodes.indexOf(target) === -1) {
                nodes.push(target);
                this._lightTargets.set(guideId, nodes);
            }
        }
        return true;
    }

    private searchGuideTarget(target: Node) {
        this.traversalChild(target, this.storageGuideTarget.bind(this));
    }

    private traversalChild(parent: Node, callback: (target: Node) => void) {
        for (let i: number = 0; i < parent.children.length; ++i) {
            //设置节点层级,以便引导完之后恢复节点原本的层级            
            const currPriority = getPriority(parent.children[i]);
            const zIndex = currPriority === 0 ? this._zIndex++ : currPriority;
            setPriority(parent.children[i], zIndex);
            callback && callback(parent.children[i]);
            if (parent.children[i] && parent.children[i].children.length > 0) {
                this.traversalChild(parent.children[i], callback);
            }
        }
    }

    //存储引导目标
    private storageGuideTarget(target: Node) {
        let targetID: WidgetID = target.getComponent(WidgetID);
        if (!targetID) {
            return;
        }
        let guideTargets: GuideTarget;
        let flag: boolean = false;
        for (let e of this._guideFile.keys) {
            //检索并存储引导目标
            if (this._guideFile.get(e).targetId.indexOf(targetID.ID) > -1) {
                flag = true;
                if (!guideTargets) {
                    guideTargets = new GuideTarget();
                }
                guideTargets.target = target;
                guideTargets.guideIds.push(this._guideFile.get(e).key);
                guideTargets.init();
            }
        }
        if (flag) {
            this.addGuideTarget(guideTargets);
        }
    }

    private storageLightTarget(guideId: number, target: Node) {
        let targetID: WidgetID = target.getComponent(WidgetID);
        if (!targetID) {
            return;
        }
        for (let e of this._guideFile.get(guideId).light) {
            if (e === targetID.ID) {
                this.addLightTarget(guideId, target);
                break;
            }
        }
    }
}