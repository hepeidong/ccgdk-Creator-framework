import XMLHttp from "../net_worck/XMLHttp";

export default class HttpUtil {

    constructor() {

    }

    public static httpGet(path: string, data: any): Promise<any> {
        if (CC_WECHATGAME) {
            return XMLHttp.promisedWX('GET', path, data);
        }
        else {
            return XMLHttp.promisedXHR('GET', path, data);
        }
    }

    public static httpPost(path: string, data: any): Promise<any> {
        if (CC_WECHATGAME) {
            return XMLHttp.promisedWX('POST', path, data);
        }
        else {
            return XMLHttp.promisedXHR('POST', path, data);
        }
    }

    public static downJSONFile(url: string, caller: any, readAsUtf8: boolean = true): Promise<any> {
        return new Promise((resolve: (res: any) => void, rejects: (res: any) => void) => {
            try {
                if (CC_WECHATGAME) {
                    wx.request({
                        url,
                        method: 'GET',
                        success: resolve,
                        fail: () => {
                            setTimeout(() => {
                                this.downJSONFile(url, caller, readAsUtf8);
                            }, 1000);
                        }
                    });
                }
                else {
                    XMLHttp.sendRequest('GET', url, (res: any) => {
                        console.log("loadRemoteTxt ok");
                        let ab = res;
                        let content = null;
                        if (readAsUtf8) {
                            content = String.fromCharCode.apply(null, new Uint8Array(ab));
                        } else {
                            content = String.fromCharCode.apply(null, new Uint16Array(ab));
                        }
                        resolve.call(caller, content);
                    }, rejects, null, 'arraybuffer', false);
                }
            } catch (e) {
                SAFE_CALLBACK(rejects, e);
            }
        });
    }
}
