import TestNpcs from "./TestNpcs";
import { GameFileManager } from "./GameFileManager";

/**游戏配置表类型属性定义 */
export class FileManager extends GameFileManager {
    constructor() {
        super();
        this.addGameTable('npcs', TestNpcs);
    }

    public get npcs(): kit.FileContainer<TestNpcs> {
        return this.get(TestNpcs);
    }

    private static _ins: FileManager = null;
    public static get Instance(): FileManager {
        return this._ins = this._ins ? this._ins : new FileManager();
    }
}