import { CCGameWorld } from "./CCGameWorld";
import { SceneBase } from "./SceneBase";
import { AdapterManager } from "./adapter_manager/AdapterManager";
import { _decorator } from "./Decorator";
import { MacroCommand } from "../puremvc";
import { SimpleCommand } from "../puremvc";
import { CCDocument } from "./CCDocument";
import { Assert } from "../exceptions/Assert";
export * from "./component/Launch";

export class App {
    public static get decorator() { return _decorator; }
    public static get game() { return CCGameWorld.getInstance(); }
    public static readonly adapterManager = AdapterManager.instance;


    /**
     * 获取model模型
     * @param proxyName 
     * @returns 
     */
    public static getModel<T extends App.Document<any>>(proxyName: string): T {
        if (this.game.hasProxy(proxyName)) {
            return this.game.retrieveProxy(proxyName) as T;
        }
        const documentRef = cc.js.getClassByName(proxyName) as Constructor;
        if (Assert.instance.handle(Assert.Type.GetModelClassException, documentRef, proxyName)) {
            const proxy = new documentRef(proxyName) as T;
            this.game.registerProxy(proxy);
            return proxy;
        }
    }
}

export namespace App {
    export enum Platform { 
        /**预览模式 */
        PREVIEW,
        /**网页H5平台 */
        BROWSER,
        /**微信小游戏平台 */
        WECHAT,
        /**字节小游戏平台 */
        BYTE,
        /**安卓原生平台 */
        ANDROID,
        /**苹果原生平台 */
        IOS,
        /**window平台 */
        WIN32
    }
    export enum SceneType {
        /**不是任何类型的场景，非法的选项，不可选择 */
        NONE = -1,
        /**普通场景 */
        Normal,
        /**过渡阶段的场景（一般类似用于加载资源的场景） */
        Interim
    }
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