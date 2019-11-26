type ValueT = number|string|object|boolean;
type DataT = {value:ValueT};

export class UserDefault {
    private static _ins: UserDefault;

    constructor() {
        
    }

    public static get Instance(): UserDefault {
        return this._ins = this._ins ? this._ins : new UserDefault();
    }

    public SetNumberForKey(key: string, value: number): void {
        let data: DataT = {value: value};
        cc.sys.localStorage.setItem(key, JSON.stringify(data));
    }

    public SetStringForKey(key: string, value: string): void {
        let data: DataT = {value: value};
        cc.sys.localStorage.setItem(key, JSON.stringify(data));
    }

    public SetBooleanForKey(key: string, value: boolean): void {
        let data: DataT = {value: value};
        cc.sys.localStorage.setItem(key, JSON.stringify(data));
    }

    public SetObjectForKey(key: string, value: object): void {
        let data: DataT = {value: value};
        cc.sys.localStorage.setItem(key, JSON.stringify(data));
    }

    public GetValueForkey(key: string): ValueT {
        let value: any = cc.sys.localStorage.getItem(key);
        if (value && value[0] === '{' && value[value.length-1] === '}') {
            let data: DataT = JSON.parse(value);
            return data.value;
        }
        return null;
    }
}