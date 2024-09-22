import { Debug, IAssetRegister, app, decorator, utils } from "./cck";

const { cckclass, startScene } = decorator;


@cckclass("DemonGirl")
@startScene("MainScene")
/**
 * 游戏主程序类
 */
export class DemonGirl extends app.GameWorld {
    /**列出游戏加载页面需要加载的资源，加载的必须是resources资源包里的资源 */
    protected listAsset(assetRegister: IAssetRegister) {
        
    }

    /**游戏启动完成，在首场景加载显示后调用 */
    protected startup(): void {
        Debug.log("游戏启动完成");
        //用于记录存档数据或者缓存数据
        app.createArchive({name: "游戏缓存数据"});
        app.openArchive(0);
        ///////////////////////////////////////////
    }
    /**
     * 游戏进入后台 
     * 请注意，在 WEB 平台，这个事件不一定会 100% 触发，这完全取决于浏览器的回调行为。
     * 在原生平台，它对应的是应用被切换到后台事件，下拉菜单和上拉状态栏等不一定会触发这个事件，这取决于系统行为。
     */
    protected onBackground(): void {

    }
    /**
     * 进入前台 
     * 请注意，在 WEB 平台，这个事件不一定会 100% 触发，这完全取决于浏览器的回调行为。
     * 在原生平台，它对应的是应用被切换到前台事件。
     */
    protected onForeground(): void {

    }
    /**可以打开WinForm */
    public canOpenWinForm(accessId: string): boolean { return true; }
    /**每一帧刷新的回调 */
    update(dt: number): void {

    }
}