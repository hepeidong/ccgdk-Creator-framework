export default class StringUtil {

    constructor() {

    }

    /**
     * 日志格式
     * @param logTag 标签
     */
    public static logFormat(logTag: string = null): string {
        return `${utils.DateUtil.dateFormat('[%s-%s-%s %s:%s:%s:%s]')} ${logTag ? `[${logTag}]` : ''}`;
    }

    /**
     * 构建字符串格式，例如：
     * format('[%s-%s-%s]', 2020, 05, 01);
     * @param strFm 字符串格式
     * @param replaceValue 替换的值
     */
    public static format(strFm: string, ...replaceValue: any[]): string {
        let retStr: string = strFm;
        for (let i: number = 0; i < replaceValue.length; ++i) {
            retStr = retStr.replace(/%s/, replaceValue[i]);
        }
        return retStr;
    }

    /**
     * 字符串判空
     * @param str 需要判空的字符串
     * @param blank 为true时，空格字符算有效字符，反之，空格字符不算有效字符
     */
    public static isEmpty(str: string, blank: boolean = true): boolean {
        if (blank) {
            return str.length > 0 ? false : true;
        }
        else if (str.indexOf(' ') === -1) {
            return str.length > 0 ? false : true;
        }
        else if (str.indexOf(' ') === -1) {
            let i: number = 0;
            let p: string = ' ';
            while (p === ' ' && i < str.length) p = str[i++];
            return p !== ' ' ? false : true;
        }
    }

    public static randomString(len: number): string {
        let words: string = 'abcdefghijklmnopqrstuvwxyz';
        let str: string = '';
        for (let i: number = 0; i < len; i++) {
            let idx: number = utils.NumberUtil.randomInt(0, words.length);
            str += words.charAt(idx);
        }
        return str;
    }

    /**
     * 字符串是否以某个子字符结尾
     * @param parent 
     * @param child 
     */
    public static stringEndWith(parent: string, child: string): boolean {
        let reg: RegExp = new RegExp(child + "$");
        return reg.test(parent);
    }

    /**
     * 判断字符串是否有中文
     * @param str 
     */
    public static isChinese(str: string): boolean {
        let patrn = /[\u4E00-\u9FA5]|[\uFE30-\uFFA0]/gi;
        if (!patrn.exec(str)) {
            return false;
        } else {
            return true;
        }
    }

    /**
     * 字符串截取，中英文都能用
     * @param str: 被截取的字符串
     * @param len: 要截取的长度
     */
    public static cutOut(str: string, len: number): string {
        let str_length: number = 0;
        let str_len: number = 0;
        let str_cut: string = '';
        str_len = str.length;
        for (let i: number = 0; i < str_len; i++) {
            let a: string = str.charAt(i);
            str_length++;
            //中文字符经编码后长度大于4
            if (escape(a).length > 4) {
                str_length++;
            }
            str_cut = str_cut.concat(a);
            if (str_length >= len) {
                str_cut = str_cut.concat("...");
                return str_cut;
            }
        }
        //被截取的字符串str小于要截取的长度
        if (str_length < len) {
            return str;
        }
    }

    /**
     * 字符串长度，会自动把中文转化为字符计算
     * @param str 
     */
    public static getLen(str: string): number {
        let str_length: number = 0;
        let str_len: number = 0;
        str_len = str.length;
        for (let i: number = 0; i < str_len; i++) {
            let a: string = str.charAt(i);
            str_length++;
            if (escape(a).length > 4) {
                str_length++;
            }
        }
        return str_length;
    }

    // 浏览器下取得当前的 urlparam
    public static getURLParams(): any {
        const params = {};
        if (window.location == null) {
          return params;
        }
        let name: string;
        let value: string;
        let str = window.location.href; // 取得整个地址栏
        let num = str.indexOf('?');
        str = str.substr(num + 1); // 取得所有参数   stringvar.substr(start [, length ]
  
        const arr = str.split('&'); // 各个参数放到数组里
        for (let i = 0; i < arr.length; i++) {
          num = arr[i].indexOf('=');
          if (num > 0) {
            name = arr[i].substring(0, num);
            value = arr[i].substr(num + 1);
            params[name] = value;
          }
        }
        return params;
      }
}
