const API_URL: string = 'https:';
const AUTH_URL: string = 'https:';


export default class XMLHttp {

    constructor() {

    }

    public static promisedXHR(method: string, url: string, data: any): Promise<any> {
        let parsedURL: string = this.parsedURL(url, method, data);
        return new Promise((resolve: (ret: any) => void, rejects: (ret: any) => void) => {
            try {
                this.sendRequest(method, parsedURL, (res: string) => {
                    var ret = JSON.parse(res);
                    SAFE_CALLBACK(resolve, ret);
                }, rejects, data);
            } catch (e) {
                console.error("err:" + e);
                SAFE_CALLBACK(rejects, e);
            }
        });
    }

    public static promisedWX(method: string, url: string, data: any): Promise<any> {
        let parsedURL: string = this.parsedURL(url, method, data);
        return new Promise((resolve: (ret: any) => void, rejects: (ret: any) => void) => {
            wx.request({
                url: parsedURL,
                method,
                timeout: 5000,
                data,
                success: (res: any) => {
                    SAFE_CALLBACK(resolve, res.data);
                },
                fail: rejects,
            });
        });
    }

    /**
     * 发生HTTP请求
     * @param method 请求类型
     * @param parsedURL 请求的地址
     * @param handler 结果回调函数
     * @param data 请求时传入的参数
     * @param responseType 返回结果类型
     * @param returnText 返回结果为 responseText
     */
    public static sendRequest(
        method: string,
        parsedURL: string,
        handler: (res: any) => void,
        failfn: (res: any) => void,
        data: any,
        responseType: XMLHttpRequestResponseType = "",
        returnText: boolean = true
        ): void 
    {
        var xhr: XMLHttpRequest = cc.loader.getXMLHttpRequest();
        xhr.response
        xhr.timeout = 5000;

        xhr.open(method, parsedURL, true);

        if (cc.sys.isNative) {
            // xhr.setRequestHeader("Accept-Encoding", "gzip,deflate", "text/html;charset=UTF-8");
            xhr.setRequestHeader("Accept-Encoding", "gzip,deflate");
        }
        xhr.responseType = responseType;
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && (xhr.status >= 200 && xhr.status < 300)) {
                if (returnText) {
                    SAFE_CALLBACK(handler, xhr.responseText);
                }
                else {
                    SAFE_CALLBACK(handler, xhr.response);
                }
            }
            else if (xhr.status >= 300) {
                SAFE_CALLBACK(failfn, '请求错误，错误码为' + xhr.status);
            }
        };

        xhr.ontimeout = function (_e) {
            console.log("请求超时url：" + parsedURL);
            SAFE_CALLBACK(failfn, '请求超时');
        };

        xhr.onerror = function (_error) {
            xhr.abort();
            console.log("网络错误：" + parsedURL);
            SAFE_CALLBACK(failfn, '网络错误');
            throw new Error('网络错误');
        };

        if (method === 'POST') {
            xhr.setRequestHeader('Content-Type', 'application/json');
        }
        xhr.send(method === 'POST' ? JSON.stringify(data) : null);
    }

    private static parsedURL(path: string, method: string, data: any): string {
        let parsedURL: string = path;
        parsedURL = parsedURL.replace(/^\/api/, API_URL);
        parsedURL = parsedURL.replace(/^\/auth/, AUTH_URL);
        if (!parsedURL.startsWith('http://') && !parsedURL.startsWith('https://')) {
            parsedURL = API_URL + parsedURL;
        }
        if (method === 'GET' && !CC_WECHATGAME) {
           return parsedURL + '?' + encodeURI(this.params(data));
        }
        return parsedURL;
    }

    private static params(data: any): string {
        let pams: string = "";
        for (let k in data) {
            if (pams != "") {
                pams += "&";
            }
            pams += k + "=" + data[k];
        }
        return pams;
    }
}
