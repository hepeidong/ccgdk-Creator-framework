


export default class ObjectUtil {

    constructor() {

    }

    public static copyMemory (fArray: any[], start: number, copyCount: number): any[] {
        let tArray: any[] = [];
        for (var i = start; i < copyCount; i++) {
            if (fArray[i] != 0) {
                tArray.push(fArray[i]);
            }
        }
        return tArray;
    }

    public static contain(obj: object, comparefn: (element: any) => boolean): boolean {
        if (typeof obj === 'object') {
            for (let key in obj) {
                if (comparefn(obj[key])) {
                    return true;
                }
            }
        }
        return false;
    }

    public static indexOf(array: any[], comparefn: (element: any) => boolean): number {
        if (array instanceof Array) {
            for (let i: number = 0; i < array.length; ++i) {
                if (comparefn(array[i])) {
                    return i;
                }
            }
            return -1;
        }
        else {
            throw new Error('参数中必须包含数组类型');
        }
    }

    public static keyOf(obj: object, comparefn: (element: any) => boolean): any {
        if (obj instanceof Object) {
            for (let key in obj) {
                if (comparefn(obj[key])) {
                    return key;
                }
            }
            return null;
        }
        else {
            throw new Error('参数中必须包含对象类型');
        }
    }

    public static isEmptyObject(object: object): boolean {
        for (var _key in object) {
            return false;
        }
        return true;
    }

    public static clearObject(object: object): boolean {
        for (var key in object) {
            delete object[key];
        }
        if (this.isEmptyObject(object)) return true;
        return false;
    }

    public static objectLen(object: object): number {
        var len = 0;
        for (var _key in object) {
            len++;
        }
        return len;
    }
}
