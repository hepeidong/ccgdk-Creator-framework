import DataTable from "../data_manager/DataTable";

/**
 * 引导配置表类
 * 表结构：
 * @example
 *     guideId(引导id):number, guideType(引导类型):number, target(引导目标节点，例如手指指向的按钮节点):number, descript(文本引导或对话引导的文字描述):string, uiId():number, path():string, syncId(下一步引导的id，-1为暂时没有引导):number
 */
export class GuideConfig extends DataTable {
    public guideId: number;
    public guideType: number;//0|1|2
    public target: number;
    public descript: string;
    public uiId: number;
    public path: string;
    public syncId: number;
    constructor() {
        super();
    }

    public Init(data: any) {
        this.guideId = data.guideId;
        this.guideType = data.guideType;
        this.target = data.target;
        this.descript = data.descript;
        this.uiId = data.uiId;
        this.path = data.path;
        this.syncId = data.syncId;
    }

    /**ui路径 */
    // public getPathByTarget(target: number): string {
    //     let path: string = ''; 
    //     if (this._guideMap.has(target)) {
    //         //重构节点路径
    //         let pathList = this._guideMap.get(target).path.split(/[.,//,.,#]/g);
    //         pathList.map((_v: string, _i: number) => {
    //             path += '/' + _v;
    //         });
    //         return path;
    //     }
    //     return path;
    // }
}