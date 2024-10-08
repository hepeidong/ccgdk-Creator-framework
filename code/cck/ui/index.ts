import { UIManager } from "./UIManager";
import { CCWinView } from "./CCWinView";
import { GuideView } from "./GuideView";
import { WindowManager } from "./WindowManager";
import { CCWinForm } from "./CCWinForm";
import { IContainer, IUIControlConfig, IWindowBase, IWinView } from "../lib.cck";
import { Type } from "./UIEnum";
import { Layers } from "cc";


export class ui {
    public static readonly Type = Type;
}

export namespace ui {
    export class WinView extends CCWinView {}
    export class UIGuide extends GuideView {}
    export class WinForm<T extends IWinView> extends CCWinForm<T> {}


    /**
     * 设置UI所在的Layer层，如果不设置，则默认为UI_2D
     * @param layer 
     */
    export function setUILayer(layer: Layers.Enum) {
        WindowManager.instance.setUILayer(layer);
    }

    /**
     * 根据窗口类型，把该类型的窗口全部隐藏
     * @param winType 窗口类型
     */
    export function setDisappears(winType: Type): void {
        WindowManager.instance.setDisappears(winType);
    }

    /**
    * 设置禁用Toast类型的UI冒泡显示
    * @param disable 为true，则禁用冒泡显示
    */
    export function disableBubble(disable: boolean): void {
        WindowManager.instance.disableBubble(disable);
    }

    /**
     * 获取当前游戏中打开了所有窗户的总个数
     * @returns 返回个数
     */
    export function getOpenWinCount(): number {
        return WindowManager.instance.getOpenWinCount();
    }

    /**
     * 把ACTIVITY活动类型的UI窗口压入管理活动窗口的优先队列中，注意，此接口只能用于ACTIVITY活动类型的窗口，
     * 用于其他类型窗口没用作用和效果
     * @param priority 活动面板的优先级，优先级越大，就越早弹出
     * @param accessId 活动面板的访问id
     */
     export function push(priority: number, accessId: string) {
        WindowManager.instance.push(priority, accessId);
     }

    /**
     * ACTIVITY类型的活动窗口出栈，会根据设定的优先级大小，优先弹出优先级大的窗口，注意，此接口只能用于ACTIVITY活动类型的窗口，
     * 用于其他类型窗口没用作用和效果
     */
    export function pop() {
        WindowManager.instance.pop();
    }

    /**
     * 加载页面
     * @param accessId 访问ID
     * @param onProgress 加载进度回调
     * @param onComplete 加载完成回调
     */
     export function load(accessId: string, onProgress: (progress: number) => void, onComplete: () => void): void;
     export function load(accessId: string, onComplete: () => void): void;
     export function load(accessId: string): void;
     export function load(): void {
        const accessId = arguments[0];
        let onProgress: (progress: number) => void;
        let onComplete: () => void;
        if (arguments.length === 3) {
            onProgress = arguments[1];
            onComplete = arguments[2];
            WindowManager.instance.load(accessId, onProgress, onComplete);
        }
        else if (arguments.length === 2) {
            onComplete = arguments[1];
            WindowManager.instance.load(accessId, onComplete);
        }
        else {
            WindowManager.instance.load(accessId);
        }
    }

    /**
     * 打开页面
     * @param accessId 访问ID
     * @param args 参数列表
     */
    export function open(accessId: string, ...args: any[]): void {
        WindowManager.instance.open(accessId, ...args);
    }

    /**
     * 关闭页面
     * @param uiType UI类型
     * @param isDestroy 是否强制销毁视图, 默认为false
     */
     export function close(uiType: Type, isDestroy: boolean = false): void {
        WindowManager.instance.delView(uiType, isDestroy);
    }

    /**
     * 关闭指定类型的所有已经打开了的UI窗口
     * @param winType 指定的UI类型
     */
    export function clearOf(winType: Type) {
        WindowManager.instance.clearOf(winType);
    }

    /**
     * 关闭所有类型的已经打开来的UI窗口
     */
     export function clear() {
        WindowManager.instance.clear();
     }

     /**
     * 通过访问ID, 获取页面视图对象，此接口用于引导框架
     * @param accessId 访问ID
     */
      export function getView<T extends IWindowBase>(accessId: string) {
        return WindowManager.instance.getView<T>(accessId);
    }

    /**
     * 设置ui配置表文件数据，此接口用于引导框架
     * @param file 
     */
    export function setUIConfig(file: IContainer<IUIControlConfig>) {
        UIManager.instance.setUIConfig(file);
    }

    /**
     * 是否为页面视图，此接口用于引导框架
     * @param uiId 
     */
    export function isView(uiId: string): boolean {
        return UIManager.instance.isView(uiId);
    }

    /**
     * 是否为按钮，此接口用于引导框架
     * @param uiId 
     */
    export function isButton(uiId: string): boolean {
        return UIManager.instance.isButton(uiId);
    }

    /**
     * 是否为页面中的某个显示区域，此接口用于引导框架
     * @param uiId 
     */
    export function isPanel(uiId: string): boolean {
        return UIManager.instance.isPanel(uiId);
    }
}