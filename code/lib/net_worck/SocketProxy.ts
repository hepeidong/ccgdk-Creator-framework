import { GameSocket } from "./GameSocket";
import { WXSocket } from "./WXSocket";
import { NativeSocket } from "./NativeSocket";
import { TTSocket } from "./TTSocket";
import { App } from "../cck";


/**
 * author: 何沛东
 * date: 2021/7/25
 * name: 网络socket代理管理类
 * description: 负责游戏中的不同平台的socket代理的管理
 */
export class SocketProxy {
    private static _proxy: Map<number, typeof GameSocket> = new Map();

    private static addProxy(platform: number, proxy: typeof GameSocket) {
        this._proxy.set(platform, proxy);
    }

    /**网络socke代理初始化 */
    public static instantiate() {
        this.addProxy(App.Platform.WECHAT, WXSocket);
        this.addProxy(App.Platform.BYTE, TTSocket);
        this.addProxy(App.Platform.PREVIEW, NativeSocket);
        this.addProxy(App.Platform.BROWSER, NativeSocket);
        this.addProxy(App.Platform.ANDROID, NativeSocket);
        this.addProxy(App.Platform.IOS, NativeSocket);
        this.addProxy(App.Platform.WIN32, NativeSocket);

        let proxy: typeof GameSocket = this._proxy.get(App.game.platform);
        if (proxy) {
            new proxy().description();
        }   
    }
}