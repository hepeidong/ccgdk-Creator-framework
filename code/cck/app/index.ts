import { CCGameWorld } from "./CCGameWorld";
import { SceneBase } from "./SceneBase";
import { AdapterManager } from "./adapter_manager/AdapterManager";
import { MacroCommand } from "../puremvc";
import { SimpleCommand } from "../puremvc";
import { CCDocument } from "./CCDocument";
import { Assert } from "../exceptions/Assert";
import { Constructor, IBaseView } from "../lib.cck";
import { js } from "cc";
import { Platform, SceneType } from "./AppEnum";
import { CCBaseView } from "./CCBaseView";
import { DataSave } from "./file-save";


export class app {
    public static get game() { return CCGameWorld.getInstance(); }
    public static readonly adapterManager = AdapterManager.instance;
    public static readonly Platform = Platform;
    public static readonly SceneType = SceneType;


    /**
     * 获取model模型
     * @param proxyName 
     * @returns 
     */
    public static getModel<T extends app.Document<any>>(proxyName: string): T {
        if (this.game.hasProxy(proxyName)) {
            return this.game.retrieveProxy(proxyName) as T;
        }
        const documentRef = js.getClassByName(proxyName) as Constructor;
        if (Assert.instance.handle(Assert.Type.GetModelClassException, documentRef, proxyName)) {
            const proxy = new documentRef(proxyName) as T;
            proxy.onCreate();
            this.game.registerProxy(proxy);
            return proxy;
        }
    }

    /**
     * 返回已创建的存档个数
     * @returns 
     */
    public static getArchiveCount() {
        return DataSave.instance.getArchiveLength();
    }

     /**
     * 获取所有的存档信息
     * @returns 返回包含所有存档的数组
     */
     public static getArchives<T>() {
        return DataSave.instance.getArchives<T>();
     }

     /**
     * 返回当前正在使用的存档基本信息
     * @returns 
     */
    public static getCurrentArchive<T>() {
        return DataSave.instance.getCurrentArchive<T>();
    }

    /**
     * 打开指定索引的存档记录，只有调用此函数，存档数据才能被使用
     * @param index 需要打开的存档数据的索引，此为获取的存档数据的数组的索引
     */
    public static openArchive(index: number) {
        return DataSave.instance.openArchive(index);
    }

    /**
     * 创建新的存档记录
     * @param archiveInfo 该存档的说明信息，例如存档名，日期之类的，用于显示的一些信息标识
     */
    public static createArchive(archiveInfo: object) {
        return DataSave.instance.createArchive(archiveInfo);
    }

    /**
     * 存档数据替换位置
     * @param index1 需要交换的索引位置，此为获取的存档数据的数组的索引
     * @param index2 需要交换的索引位置，此为获取的存档数据的数组的索引
     */
    public static swapArchive(index1: number, index2: number) {
        DataSave.instance.swapArchive(index1, index2);
    }

    /**
     * 存档数据索引向下移动一个位置
     * @param index 需要向下移动的存档索引，此为获取的存档数据的数组的索引
     */
    public static archiveIndexDown(index: number) {
        DataSave.instance.archiveIndexDown(index);
    }

    /**
     * 删除指定索引的存档数据
     * @param index 存档的索引，此为获取的存档数据的数组的索引
     * @returns 
     */
    public static remove(index: number) {
        return DataSave.instance.remove(index);
    }

    /**
     * 保存所有存档数据
     * @returns 返回是否保存成功
     */
    public static save() {
        return DataSave.instance.save();
    }
}

export namespace app {
    export class BaseView extends CCBaseView {}
    export class GameWorld extends CCGameWorld {}
    export class Scene<T extends IBaseView = any> extends SceneBase<T> {}
    export class Command extends SimpleCommand {
        private static _ref: number = 0;

        public static addRef() {
            this._ref++;
        }

        public static delRef() {
            this._ref--;
        }

        public static getRef() {
            return this._ref;
        }
    }
    export class CommandGroup extends MacroCommand {
        private static _ref: number = 0;

        public static addRef() {
            this._ref++;
        }

        public static delRef() {
            this._ref--;
        }

        public static getRef() {
            return this._ref;
        }

        addSubCommand(commandClassRef: Function): void {
            (commandClassRef as typeof Command).addRef();
            super.addSubCommand(commandClassRef);
        }
    }
    export class Document<T> extends CCDocument<T> {}
}

export * from "./component/Launch";
export * from "./adapter_manager/component/AdapterHelper";
export * from "./adapter_manager/component/AdapterWidget";